/**
 * Platform Registry - Format-only (no delivery)
 *
 * Platforms generate formatted summaries of pages for different IM platforms.
 * Delivery is the agent's responsibility (via cc-connect or other means).
 *
 * To add a new platform:
 *   1. Create src/platforms/<name>.ts with formatMessage() and formatRawMessage()
 *   2. Register it in the `platforms` object below
 */
import * as telegram from './telegram';
import type { PageSpec, PlatformMessage } from '../types';

interface Platform {
  name: string;
  format(spec: PageSpec | null, url: string): PlatformMessage;
  formatRaw(title: string, url: string): PlatformMessage;
  summary(spec: PageSpec | null): string;
}

const platforms: Record<string, Platform> = {
  telegram: {
    name: 'Telegram',
    format(spec, url) { return telegram.formatMessage(spec, url); },
    formatRaw(title, url) { return telegram.formatRawMessage(title, url); },
    summary(spec) { return telegram.specSummary(spec); },
  },
  // Future: feishu, discord, etc.
};

export function formatForPlatform(
  platform: string,
  spec: PageSpec | null,
  url: string,
  title?: string
): PlatformMessage | null {
  const p = platforms[platform];
  if (!p) return null;
  if (spec && spec.components) {
    return p.format(spec, url);
  }
  return p.formatRaw(title || 'Page', url);
}

export function listPlatforms(): string[] {
  return Object.keys(platforms);
}

export function formatForAll(
  spec: PageSpec | null,
  url: string,
  title?: string
): Record<string, PlatformMessage> {
  const formats: Record<string, PlatformMessage> = {};
  for (const [name, p] of Object.entries(platforms)) {
    formats[name] = spec?.components ? p.format(spec, url) : p.formatRaw(title || 'Page', url);
  }
  return formats;
}
