/**
 * Page storage - file-based store for generated pages
 */
const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');

const PAGES_DIR = path.join(__dirname, '..', 'pages');

// Ensure pages directory exists
if (!fs.existsSync(PAGES_DIR)) {
  fs.mkdirSync(PAGES_DIR, { recursive: true });
}

/**
 * Save a page and return its ID
 * @param {string} html - The full HTML content
 * @param {object} meta - Metadata (title, type, ttl, etc.)
 * @returns {{ id: string, meta: object }}
 */
function savePage(html, meta = {}) {
  const id = nanoid(10);
  const now = Date.now();
  const pageData = {
    id,
    html,
    meta: {
      title: meta.title || 'Untitled',
      type: meta.type || 'page',
      createdAt: now,
      ttl: meta.ttl || 0, // 0 = no expiry, otherwise ms
      views: 0,
      ...meta,
    },
  };

  const filePath = path.join(PAGES_DIR, `${id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(pageData, null, 2));
  return { id, meta: pageData.meta };
}

/**
 * Get a page by ID
 * @param {string} id
 * @returns {object|null}
 */
function getPage(id) {
  const filePath = path.join(PAGES_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) return null;

  const pageData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  // Check TTL
  if (pageData.meta.ttl > 0) {
    const age = Date.now() - pageData.meta.createdAt;
    if (age > pageData.meta.ttl) {
      fs.unlinkSync(filePath);
      return null;
    }
  }

  // Increment views
  pageData.meta.views++;
  fs.writeFileSync(filePath, JSON.stringify(pageData, null, 2));

  return pageData;
}

/**
 * List all pages
 * @returns {object[]}
 */
function listPages() {
  const files = fs.readdirSync(PAGES_DIR).filter(f => f.endsWith('.json'));
  const pages = [];

  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(PAGES_DIR, file), 'utf-8'));
      // Check TTL
      if (data.meta.ttl > 0 && Date.now() - data.meta.createdAt > data.meta.ttl) {
        fs.unlinkSync(path.join(PAGES_DIR, file));
        continue;
      }
      pages.push({ id: data.id, ...data.meta });
    } catch (e) {
      // Skip corrupted files
    }
  }

  return pages.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Delete a page
 * @param {string} id
 * @returns {boolean}
 */
function deletePage(id) {
  const filePath = path.join(PAGES_DIR, `${id}.json`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}

module.exports = { savePage, getPage, listPages, deletePage };
