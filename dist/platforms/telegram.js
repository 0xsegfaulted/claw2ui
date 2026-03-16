"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatMessage = formatMessage;
exports.formatRawMessage = formatRawMessage;
exports.deliver = deliver;
exports.flattenComponents = flattenComponents;
exports.specSummary = specSummary;
/**
 * Telegram Platform - Formats page specs as rich Telegram messages
 * and delivers them via the Telegram Bot API.
 */
const child_process_1 = require("child_process");
const util_1 = require("util");
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
/**
 * Format a page spec as a Telegram HTML message
 */
function formatMessage(spec, url) {
    if (!spec || !spec.components) {
        const msg = {
            text: `<b>${escTg(spec?.title || 'Page')}</b>\n\n<a href="${escTg(url)}">Open Page</a>`,
            parse_mode: 'HTML',
        };
        if (url.startsWith('https://'))
            msg.reply_markup = inlineButton('Open Page', url);
        return msg;
    }
    const parts = [];
    parts.push(`<b>${escTg(spec.title || 'Dashboard')}</b>`);
    const components = flattenComponents(spec.components);
    let statCount = 0;
    let tableCount = 0;
    for (const comp of components) {
        switch (comp.type) {
            case 'header':
                if (comp.props?.title && comp.props.title !== spec.title) {
                    parts.push('');
                    parts.push(`<b>${escTg(comp.props.title)}</b>`);
                    if (comp.props?.subtitle) {
                        parts.push(`<i>${escTg(comp.props.subtitle)}</i>`);
                    }
                }
                break;
            case 'stat':
                if (statCount < 8) {
                    const p = comp.props || {};
                    const val = String(p.value ?? '');
                    const changeNum = Number(p.change);
                    let changeStr = '';
                    if (p.change !== undefined && p.change !== null && !isNaN(changeNum)) {
                        const arrow = changeNum >= 0 ? '+' : '';
                        changeStr = ` <i>(${arrow}${changeNum}%)</i>`;
                    }
                    const icon = p.icon || '\u2022';
                    parts.push(`${icon} ${escTg(p.label || '')}: <b>${escTg(val)}</b>${changeStr}`);
                    statCount++;
                }
                break;
            case 'table':
                if (tableCount < 2 && comp.props?.rows?.length) {
                    const p = comp.props;
                    const cols = p.columns || [];
                    const rows = p.rows || [];
                    if (cols.length && rows.length) {
                        parts.push('');
                        const showRows = rows.slice(0, 3);
                        for (const row of showRows) {
                            const firstCol = cols[0];
                            const secondCol = cols[1];
                            const name = row[firstCol?.key] || '';
                            const val = secondCol ? (row[secondCol?.key] || '') : '';
                            parts.push(`  \u2022 ${escTg(String(name))}${val ? ': ' + escTg(String(val)) : ''}`);
                        }
                        if (rows.length > 3) {
                            parts.push(`  <i>... ${rows.length - 3} more rows</i>`);
                        }
                        tableCount++;
                    }
                }
                break;
            case 'chart':
                parts.push(`  [${escTg(comp.props?.chartType || 'chart')}]`);
                break;
            case 'text':
                if (comp.props?.content) {
                    const text = String(comp.props.content).slice(0, 150);
                    parts.push(escTg(text));
                }
                break;
        }
    }
    parts.push('');
    parts.push(`<a href="${escTg(url)}">View Full Dashboard</a>`);
    const result = {
        text: parts.join('\n'),
        parse_mode: 'HTML',
    };
    if (url.startsWith('https://')) {
        result.reply_markup = inlineButton('Open Dashboard', url);
    }
    return result;
}
/**
 * Format raw HTML page as a simple Telegram message
 */
function formatRawMessage(title, url) {
    const msg = {
        text: `<b>${escTg(title || 'Page')}</b>\n\n<a href="${escTg(url)}">Open Page</a>`,
        parse_mode: 'HTML',
    };
    if (url.startsWith('https://'))
        msg.reply_markup = inlineButton('Open Page', url);
    return msg;
}
/**
 * Deliver a message via Telegram Bot API (sendMessage)
 */
async function deliver(botToken, chatId, message, proxy) {
    const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const body = {
        chat_id: chatId,
        text: message.text,
        parse_mode: message.parse_mode || 'HTML',
        disable_web_page_preview: false,
    };
    if (message.reply_markup) {
        body.reply_markup = message.reply_markup;
    }
    const args = [
        '-s', '-X', 'POST',
        apiUrl,
        '-H', 'Content-Type: application/json',
        '-d', JSON.stringify(body),
        '--connect-timeout', '15',
        '--max-time', '30',
    ];
    if (proxy) {
        args.push('-x', proxy);
    }
    try {
        const { stdout } = await execFileAsync('curl', args, { timeout: 35000 });
        const response = JSON.parse(stdout);
        if (!response.ok) {
            console.error('[telegram] API error:', response.description);
            return { success: false, error: response.description };
        }
        return {
            success: true,
            messageId: response.result?.message_id,
            chatId: response.result?.chat?.id,
        };
    }
    catch (err) {
        console.error('[telegram] Delivery failed:', err.message);
        return { success: false, error: err.message };
    }
}
// === Helpers ===
function flattenComponents(components) {
    const result = [];
    if (!Array.isArray(components))
        return result;
    for (const comp of components) {
        result.push(comp);
        if (comp.children) {
            result.push(...flattenComponents(comp.children));
        }
        if (comp.props?.tabs) {
            for (const tab of comp.props.tabs) {
                if (tab.children) {
                    result.push(...flattenComponents(tab.children));
                }
            }
        }
        if (comp.props?.items) {
            for (const item of comp.props.items) {
                if (item.children) {
                    result.push(...flattenComponents(item.children));
                }
            }
        }
    }
    return result;
}
function escTg(s) {
    return String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
function inlineButton(label, url) {
    return {
        inline_keyboard: [[{ text: label, url }]],
    };
}
function specSummary(spec) {
    if (!spec || !spec.components)
        return spec?.title || 'Page';
    const comps = flattenComponents(spec.components);
    const stats = comps.filter(c => c.type === 'stat').length;
    const charts = comps.filter(c => c.type === 'chart').length;
    const tables = comps.filter(c => c.type === 'table').length;
    const parts = [];
    if (stats)
        parts.push(`${stats} metrics`);
    if (charts)
        parts.push(`${charts} chart${charts > 1 ? 's' : ''}`);
    if (tables)
        parts.push(`${tables} table${tables > 1 ? 's' : ''}`);
    return parts.length ? parts.join(', ') : 'Interactive page';
}
//# sourceMappingURL=telegram.js.map