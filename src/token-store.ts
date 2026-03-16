/**
 * Token Store - file-based store for registered API tokens
 *
 * Stores tokens in tokens.json next to the pages/ directory.
 * Each token records IP, creation time, usage stats, and disabled state.
 */
import fs from 'fs';
import path from 'path';

export interface TokenRecord {
  id: string;        // first 12 chars of token, used as identifier
  token: string;
  createdAt: number;
  ip: string;
  lastUsed: number;
  pagesCreated: number;
  dailyPages: number;
  dailyReset: number;
  disabled: boolean;
}

const TOKENS_FILE = path.join(__dirname, '..', 'tokens.json');

function loadTokens(): TokenRecord[] {
  try {
    if (fs.existsSync(TOKENS_FILE)) {
      return JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf-8'));
    }
  } catch {
    // Corrupted file — start fresh
  }
  return [];
}

function writeTokens(tokens: TokenRecord[]): void {
  fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2), { mode: 0o600 });
}

/**
 * Save a new token record
 */
export function saveToken(token: string, ip: string): void {
  const tokens = loadTokens();
  const now = Date.now();
  tokens.push({
    id: token.slice(0, 12),
    token,
    createdAt: now,
    ip,
    lastUsed: 0,
    pagesCreated: 0,
    dailyPages: 0,
    dailyReset: now,
    disabled: false,
  });
  writeTokens(tokens);
}

/**
 * Get a token record by token string
 */
export function getToken(token: string): TokenRecord | null {
  const tokens = loadTokens();
  return tokens.find(t => t.token === token) || null;
}

/**
 * Find a token record by its short id (first 12 chars of token)
 */
export function findTokenById(id: string): TokenRecord | null {
  const tokens = loadTokens();
  return tokens.find(t => (t.id || t.token.slice(0, 12)) === id) || null;
}

/**
 * List all token records
 */
export function listTokens(): TokenRecord[] {
  return loadTokens();
}

/**
 * Revoke a token (set disabled=true)
 */
export function revokeToken(token: string): boolean {
  const tokens = loadTokens();
  const record = tokens.find(t => t.token === token);
  if (!record) return false;
  record.disabled = true;
  writeTokens(tokens);
  return true;
}

/**
 * Delete a token entirely
 */
export function deleteToken(token: string): boolean {
  const tokens = loadTokens();
  const idx = tokens.findIndex(t => t.token === token);
  if (idx === -1) return false;
  tokens.splice(idx, 1);
  writeTokens(tokens);
  return true;
}

/**
 * Check if a token is within its daily usage limit (read-only, no increment).
 * Returns true if under limit, false if at/over limit.
 */
export function checkDailyLimit(token: string, dailyLimit: number): boolean {
  const record = getToken(token);
  if (!record) return true;

  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;

  const effectiveDaily = (now - record.dailyReset > DAY_MS) ? 0 : record.dailyPages;
  return effectiveDaily < dailyLimit;
}

/**
 * Record a successful page creation for a token.
 * Call this AFTER the page has been saved to disk.
 */
export function recordUsage(token: string): void {
  const tokens = loadTokens();
  const record = tokens.find(t => t.token === token);
  if (!record) return;

  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;

  if (now - record.dailyReset > DAY_MS) {
    record.dailyPages = 0;
    record.dailyReset = now;
  }

  record.lastUsed = now;
  record.pagesCreated++;
  record.dailyPages++;
  writeTokens(tokens);
}

/**
 * Count tokens registered from a specific IP
 */
export function countTokensByIp(ip: string): number {
  const tokens = loadTokens();
  return tokens.filter(t => t.ip === ip).length;
}

/**
 * Count tokens registered from an IP within a time window
 */
export function countRecentTokensByIp(ip: string, windowMs: number): number {
  const tokens = loadTokens();
  const cutoff = Date.now() - windowMs;
  return tokens.filter(t => t.ip === ip && t.createdAt > cutoff).length;
}
