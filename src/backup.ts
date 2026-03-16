/**
 * HF Dataset backup - persist pages and tokens across Space restarts
 *
 * Env vars:
 *   HF_TOKEN              - Hugging Face API token (set as Space Secret)
 *   CLAWBOARD_BACKUP_REPO - Dataset repo id (e.g. "0xsegfaulted/claw2ui-data")
 *
 * Strategy:
 *   - On startup: download backup.json → restore pages/ and tokens.json
 *   - On mutation: debounced upload of all data to backup.json
 */
import fs from 'fs';
import path from 'path';

const HF_TOKEN = process.env.HF_TOKEN || '';
const BACKUP_REPO = process.env.CLAWBOARD_BACKUP_REPO || '';
const DEBOUNCE_MS = 5000;

const PAGES_DIR = path.join(__dirname, '..', 'pages');
const TOKENS_FILE = path.join(__dirname, '..', 'tokens.json');

let timer: ReturnType<typeof setTimeout> | null = null;
let backupInProgress = false;
let pendingBackup = false;

export function isBackupEnabled(): boolean {
  return !!(HF_TOKEN && BACKUP_REPO);
}

/**
 * Restore data from HF Dataset on startup
 */
export async function restoreFromBackup(): Promise<void> {
  if (!isBackupEnabled()) return;

  console.log(`[backup] Restoring from ${BACKUP_REPO}...`);
  try {
    const res = await fetch(
      `https://huggingface.co/datasets/${BACKUP_REPO}/resolve/main/backup.json`,
      { headers: { Authorization: `Bearer ${HF_TOKEN}` } }
    );
    if (!res.ok) {
      if (res.status === 404) {
        console.log('[backup] No backup found, starting fresh.');
        return;
      }
      console.error(`[backup] Restore failed: HTTP ${res.status}`);
      return;
    }

    const data = await res.json() as {
      pages?: Record<string, any>;
      tokens?: any[];
    };

    // Restore pages
    if (data.pages) {
      if (!fs.existsSync(PAGES_DIR)) fs.mkdirSync(PAGES_DIR, { recursive: true });
      let count = 0;
      for (const [id, pageData] of Object.entries(data.pages)) {
        fs.writeFileSync(path.join(PAGES_DIR, `${id}.json`), JSON.stringify(pageData, null, 2));
        count++;
      }
      console.log(`[backup] Restored ${count} pages.`);
    }

    // Restore tokens
    if (data.tokens && data.tokens.length > 0) {
      fs.writeFileSync(TOKENS_FILE, JSON.stringify(data.tokens, null, 2), { mode: 0o600 });
      console.log(`[backup] Restored ${data.tokens.length} tokens.`);
    }
  } catch (err: any) {
    console.error(`[backup] Restore error: ${err.message}`);
  }
}

/**
 * Schedule a debounced backup. Call after any data mutation.
 */
export function scheduleBackup(): void {
  if (!isBackupEnabled()) return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    doBackup().catch(err => console.error(`[backup] Error: ${err.message}`));
  }, DEBOUNCE_MS);
}

async function doBackup(): Promise<void> {
  if (backupInProgress) {
    pendingBackup = true;
    return;
  }
  backupInProgress = true;

  try {
    // Dynamic import (ESM module)
    const { uploadFile } = await import('@huggingface/hub');

    // Collect pages
    const pages: Record<string, any> = {};
    if (fs.existsSync(PAGES_DIR)) {
      for (const file of fs.readdirSync(PAGES_DIR).filter(f => f.endsWith('.json'))) {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(PAGES_DIR, file), 'utf-8'));
          pages[data.id || file.replace('.json', '')] = data;
        } catch {}
      }
    }

    // Collect tokens
    let tokens: any[] = [];
    try {
      if (fs.existsSync(TOKENS_FILE)) {
        tokens = JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf-8'));
      }
    } catch {}

    const backup = JSON.stringify({ timestamp: Date.now(), pages, tokens });
    const blob = new Blob([backup], { type: 'application/json' });

    await uploadFile({
      repo: { type: 'dataset', name: BACKUP_REPO },
      credentials: { accessToken: HF_TOKEN },
      file: { path: 'backup.json', content: blob },
      commitTitle: `Backup ${new Date().toISOString()}`,
      hubUrl: 'https://huggingface.co',
    });

    console.log(`[backup] Saved (${Object.keys(pages).length} pages, ${tokens.length} tokens)`);
  } catch (err: any) {
    console.error(`[backup] Upload failed: ${err.message}`);
  } finally {
    backupInProgress = false;
    if (pendingBackup) {
      pendingBackup = false;
      scheduleBackup();
    }
  }
}
