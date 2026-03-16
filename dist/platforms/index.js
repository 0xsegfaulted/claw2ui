"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatForPlatform = formatForPlatform;
exports.deliverToPlatform = deliverToPlatform;
exports.listPlatforms = listPlatforms;
exports.formatForAll = formatForAll;
/**
 * Platform Registry
 *
 * To add a new platform:
 *   1. Create src/platforms/<name>.ts with formatMessage() and deliver()
 *   2. Register it in the `platforms` object below
 *   3. Add config support in src/config.ts
 */
const telegram = __importStar(require("./telegram"));
const config_1 = require("../config");
const platforms = {
    telegram: {
        name: 'Telegram',
        format(spec, url) {
            return telegram.formatMessage(spec, url);
        },
        formatRaw(title, url) {
            return telegram.formatRawMessage(title, url);
        },
        async deliver(message, overrides = {}) {
            const config = (0, config_1.getPlatformConfig)('telegram');
            const botToken = overrides.botToken || config?.botToken;
            const chatId = overrides.chatId || config?.chatId;
            const proxy = overrides.proxy || config?.proxy || null;
            if (!botToken)
                return { success: false, error: 'Telegram bot token not configured' };
            if (!chatId)
                return { success: false, error: 'Telegram chat ID not configured. Set CLAWBOARD_TG_CHAT_ID or add chatId to clawboard.config.json' };
            return telegram.deliver(botToken, chatId, message, proxy);
        },
        isConfigured() {
            const config = (0, config_1.getPlatformConfig)('telegram');
            return !!(config?.botToken && config?.chatId);
        },
        summary(spec) {
            return telegram.specSummary(spec);
        },
    },
    // Future: feishu, discord, etc.
};
function formatForPlatform(platform, spec, url, title) {
    const p = platforms[platform];
    if (!p)
        return null;
    if (spec && spec.components) {
        return p.format(spec, url);
    }
    return p.formatRaw(title || 'Page', url);
}
async function deliverToPlatform(platform, message, overrides = {}) {
    const p = platforms[platform];
    if (!p)
        return { success: false, error: `Unknown platform: ${platform}` };
    return p.deliver(message, overrides);
}
function listPlatforms() {
    return Object.entries(platforms).map(([id, p]) => ({
        id,
        name: p.name,
        configured: p.isConfigured(),
    }));
}
function formatForAll(spec, url, title) {
    const formats = {};
    for (const [name, p] of Object.entries(platforms)) {
        if (p.isConfigured()) {
            formats[name] = spec?.components ? p.format(spec, url) : p.formatRaw(title || 'Page', url);
        }
    }
    return formats;
}
//# sourceMappingURL=index.js.map