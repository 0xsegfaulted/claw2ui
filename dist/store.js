"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.savePage = savePage;
exports.getPage = getPage;
exports.listPages = listPages;
exports.deletePage = deletePage;
/**
 * Page storage - file-based store for generated pages
 */
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const nanoid_1 = require("nanoid");
const PAGES_DIR = path_1.default.join(__dirname, '..', 'pages');
// Ensure pages directory exists
if (!fs_1.default.existsSync(PAGES_DIR)) {
    fs_1.default.mkdirSync(PAGES_DIR, { recursive: true });
}
/**
 * Save a page and return its ID
 */
function savePage(html, meta = {}) {
    const id = (0, nanoid_1.nanoid)(10);
    const now = Date.now();
    const pageData = {
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
    const filePath = path_1.default.join(PAGES_DIR, `${id}.json`);
    fs_1.default.writeFileSync(filePath, JSON.stringify(pageData, null, 2));
    return { id, meta: pageData.meta };
}
/**
 * Get a page by ID
 * @param incrementViews - Whether to increment the view counter (default: true)
 */
function getPage(id, incrementViews = true) {
    const filePath = path_1.default.join(PAGES_DIR, `${id}.json`);
    if (!fs_1.default.existsSync(filePath))
        return null;
    const pageData = JSON.parse(fs_1.default.readFileSync(filePath, 'utf-8'));
    // Check TTL
    if (pageData.meta.ttl > 0) {
        const age = Date.now() - pageData.meta.createdAt;
        if (age > pageData.meta.ttl) {
            fs_1.default.unlinkSync(filePath);
            return null;
        }
    }
    if (incrementViews) {
        pageData.meta.views++;
        fs_1.default.writeFileSync(filePath, JSON.stringify(pageData, null, 2));
    }
    return pageData;
}
/**
 * List all pages
 */
function listPages() {
    const files = fs_1.default.readdirSync(PAGES_DIR).filter(f => f.endsWith('.json'));
    const pages = [];
    for (const file of files) {
        try {
            const data = JSON.parse(fs_1.default.readFileSync(path_1.default.join(PAGES_DIR, file), 'utf-8'));
            // Check TTL
            if (data.meta.ttl > 0 && Date.now() - data.meta.createdAt > data.meta.ttl) {
                fs_1.default.unlinkSync(path_1.default.join(PAGES_DIR, file));
                continue;
            }
            pages.push({ id: data.id, ...data.meta });
        }
        catch {
            // Skip corrupted files
        }
    }
    return pages.sort((a, b) => b.createdAt - a.createdAt);
}
/**
 * Delete a page
 */
function deletePage(id) {
    const filePath = path_1.default.join(PAGES_DIR, `${id}.json`);
    if (fs_1.default.existsSync(filePath)) {
        fs_1.default.unlinkSync(filePath);
        return true;
    }
    return false;
}
//# sourceMappingURL=store.js.map