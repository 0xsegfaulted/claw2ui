/**
 * ClawBoard Configuration
 *
 * Priority: env vars > clawboard.config.json > auto-detect from cc-connect
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import type { Config, PlatformConfig } from './types';

const CONFIG_FILE = path.join(__dirname, '..', 'clawboard.config.json');
const CC_CONNECT_CONFIG = path.join(os.homedir(), '.cc-connect', 'config.toml');

let _config: Config | null = null;

function loadConfig(): Config {
  if (_config) return _config;

  // 1. Load file config
  let fileConfig: any = {};
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      fileConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    } catch (e: any) {
      console.error('[config] Failed to parse clawboard.config.json:', e.message);
    }
  }

  // 2. Auto-detect from cc-connect config
  const ccConnect = parseCcConnectConfig();

  // 3. Auto-detect chatId from CC_SESSION_KEY (format: "telegram:<user_id>:<chat_id>")
  let ccChatId: string | null = null;
  const sessionKey = process.env.CC_SESSION_KEY || '';
  if (sessionKey.startsWith('telegram:')) {
    const parts = sessionKey.split(':');
    if (parts[2]) ccChatId = parts[2];
  }

  // 4. Merge: env > file > cc-connect auto-detect
  _config = {
    platforms: {
      telegram: {
        botToken: pick(
          process.env.CLAWBOARD_TG_BOT_TOKEN,
          fileConfig?.platforms?.telegram?.botToken,
          ccConnect?.telegram?.token
        ),
        chatId: pick(
          process.env.CLAWBOARD_TG_CHAT_ID,
          fileConfig?.platforms?.telegram?.chatId,
          ccChatId
        ),
        proxy: pick(
          process.env.CLAWBOARD_TG_PROXY,
          fileConfig?.platforms?.telegram?.proxy,
          ccConnect?.telegram?.proxy
        ),
      },
    },
  };

  return _config;
}

/** Pick the first non-null, non-empty, non-"auto" value */
function pick(...sources: (string | undefined | null)[]): string | null {
  for (const val of sources) {
    if (val && val !== 'auto') return val;
  }
  return null;
}

interface CcConnectResult {
  telegram: {
    token: string | null;
    proxy: string | null;
  };
}

/**
 * Parse cc-connect config.toml to extract telegram bot token and proxy
 * for the "clawboard" project.
 */
function parseCcConnectConfig(): CcConnectResult | null {
  if (!fs.existsSync(CC_CONNECT_CONFIG)) return null;

  try {
    const content = fs.readFileSync(CC_CONNECT_CONFIG, 'utf-8');

    const blocks = content.split('[[projects]]');
    const clawboardBlock = blocks.find(b => /name\s*=\s*"clawboard"/.test(b));
    if (!clawboardBlock) return null;

    const platformParts = clawboardBlock.split('[[projects.platforms]]');
    const telegramPart = platformParts.find(p => /type\s*=\s*"telegram"/.test(p));
    if (!telegramPart) return null;

    const tokenMatch = telegramPart.match(/token\s*=\s*"([^"]+)"/);
    const proxyMatch = telegramPart.match(/proxy\s*=\s*"([^"]+)"/);

    return {
      telegram: {
        token: tokenMatch ? tokenMatch[1] : null,
        proxy: proxyMatch ? proxyMatch[1] : null,
      },
    };
  } catch {
    return null;
  }
}

export function getConfig(): Config {
  return loadConfig();
}

export function getPlatformConfig(platform: string): PlatformConfig | null {
  const config = loadConfig();
  return config?.platforms?.[platform] || null;
}

export function resetConfig(): void {
  _config = null;
}
