/**
 * Platform Registry
 *
 * To add a new platform:
 *   1. Create src/platforms/<name>.ts with formatMessage() and deliver()
 *   2. Register it in the `platforms` object below
 *   3. Add config support in src/config.ts
 */
import * as telegram from './telegram';
import { getPlatformConfig } from '../config';
import type { PageSpec, PlatformMessage, DeliveryResult, DeliveryOverrides, PlatformInfo } from '../types';

interface Platform {
  name: string;
  format(spec: PageSpec | null, url: string): PlatformMessage;
  formatRaw(title: string, url: string): PlatformMessage;
  deliver(message: PlatformMessage, overrides?: DeliveryOverrides): Promise<DeliveryResult>;
  isConfigured(): boolean;
  summary(spec: PageSpec | null): string;
}

const platforms: Record<string, Platform> = {
  telegram: {
    name: 'Telegram',

    format(spec, url) {
      return telegram.formatMessage(spec, url);
    },

    formatRaw(title, url) {
      return telegram.formatRawMessage(title, url);
    },

    async deliver(message, overrides = {}) {
      const config = getPlatformConfig('telegram');
      const botToken = overrides.botToken || config?.botToken;
      const chatId = overrides.chatId || config?.chatId;
      const proxy = overrides.proxy || config?.proxy || null;

      if (!botToken) return { success: false, error: 'Telegram bot token not configured' };
      if (!chatId) return { success: false, error: 'Telegram chat ID not configured. Set CLAWBOARD_TG_CHAT_ID or add chatId to clawboard.config.json' };

      return telegram.deliver(botToken, chatId, message, proxy);
    },

    isConfigured() {
      const config = getPlatformConfig('telegram');
      return !!(config?.botToken && config?.chatId);
    },

    summary(spec) {
      return telegram.specSummary(spec);
    },
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

export async function deliverToPlatform(
  platform: string,
  message: PlatformMessage,
  overrides: DeliveryOverrides = {}
): Promise<DeliveryResult> {
  const p = platforms[platform];
  if (!p) return { success: false, error: `Unknown platform: ${platform}` };
  return p.deliver(message, overrides);
}

export function listPlatforms(): PlatformInfo[] {
  return Object.entries(platforms).map(([id, p]) => ({
    id,
    name: p.name,
    configured: p.isConfigured(),
  }));
}

export function formatForAll(
  spec: PageSpec | null,
  url: string,
  title?: string
): Record<string, PlatformMessage> {
  const formats: Record<string, PlatformMessage> = {};
  for (const [name, p] of Object.entries(platforms)) {
    if (p.isConfigured()) {
      formats[name] = spec?.components ? p.format(spec, url) : p.formatRaw(title || 'Page', url);
    }
  }
  return formats;
}
