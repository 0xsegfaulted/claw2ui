/**
 * Page storage - file-based store for generated pages
 */
import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';
import type { PageData, PageMeta, SavePageOptions, SavePageResult } from './types';
import { scheduleBackup } from './backup';

const PAGES_DIR = path.join(__dirname, '..', 'pages');
const MAX_PAGES = 500;

// Ensure pages directory exists
if (!fs.existsSync(PAGES_DIR)) {
  fs.mkdirSync(PAGES_DIR, { recursive: true });
}

/**
 * Save a page and return its ID.
 * Enforces a maximum page count to prevent disk exhaustion.
 */
export function savePage(html: string, meta: SavePageOptions = {}): SavePageResult {
  const fileCount = fs.readdirSync(PAGES_DIR).filter(f => f.endsWith('.json')).length;
  if (fileCount >= MAX_PAGES) {
    // Try cleaning expired pages before rejecting
    listPages(); // listPages() already deletes expired pages as a side effect
    const afterCleanup = fs.readdirSync(PAGES_DIR).filter(f => f.endsWith('.json')).length;
    if (afterCleanup >= MAX_PAGES) {
      throw new Error(`Page limit reached (${MAX_PAGES}). Delete old pages first.`);
    }
  }

  const id = nanoid(10);
  const now = Date.now();
  const pageData: PageData = {
    id,
    html,
    spec: meta.spec || null,
    meta: {
      title: meta.title || 'Untitled',
      type: meta.type || 'page',
      createdAt: now,
      ttl: meta.ttl || 0,
      views: 0,
      ...meta,
    },
  };
  // Don't duplicate spec inside meta
  delete pageData.meta.spec;

  const filePath = path.join(PAGES_DIR, `${id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(pageData, null, 2));
  scheduleBackup();
  return { id, meta: pageData.meta };
}

/**
 * Get a page by ID
 * @param incrementViews - Whether to increment the view counter (default: true)
 */
export function getPage(id: string, incrementViews: boolean = true): PageData | null {
  const filePath = path.join(PAGES_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) return null;

  const pageData: PageData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  // Check TTL
  if (pageData.meta.ttl > 0) {
    const age = Date.now() - pageData.meta.createdAt;
    if (age > pageData.meta.ttl) {
      fs.unlinkSync(filePath);
      return null;
    }
  }

  if (incrementViews) {
    pageData.meta.views++;
    fs.writeFileSync(filePath, JSON.stringify(pageData, null, 2));
  }

  return pageData;
}

/**
 * List all pages
 */
export function listPages(): Array<{ id: string } & PageMeta> {
  const files = fs.readdirSync(PAGES_DIR).filter(f => f.endsWith('.json'));
  const pages: Array<{ id: string } & PageMeta> = [];

  for (const file of files) {
    try {
      const data: PageData = JSON.parse(fs.readFileSync(path.join(PAGES_DIR, file), 'utf-8'));
      // Check TTL
      if (data.meta.ttl > 0 && Date.now() - data.meta.createdAt > data.meta.ttl) {
        fs.unlinkSync(path.join(PAGES_DIR, file));
        continue;
      }
      pages.push({ id: data.id, ...data.meta });
    } catch {
      // Skip corrupted files
    }
  }

  return pages.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Delete a page
 */
export function deletePage(id: string): boolean {
  const filePath = path.join(PAGES_DIR, `${id}.json`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    scheduleBackup();
    return true;
  }
  return false;
}
