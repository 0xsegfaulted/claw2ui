const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

// Store uses PAGES_DIR = path.join(__dirname, '..', 'pages')
// We need to ensure the dist/store.js is built and test against it
const { savePage, getPage, listPages, deletePage } = require('../dist/store');

const PAGES_DIR = path.join(__dirname, '..', 'pages');

// Helper to clean up test pages
const createdIds = [];

afterEach(() => {
  for (const id of createdIds) {
    const file = path.join(PAGES_DIR, `${id}.json`);
    try { fs.unlinkSync(file); } catch {}
  }
  createdIds.length = 0;
});

describe('savePage', () => {
  it('creates a page and returns id + meta', () => {
    const result = savePage('<h1>Test</h1>', { title: 'Test Page' });
    createdIds.push(result.id);

    assert.ok(result.id);
    assert.equal(result.id.length, 10);
    assert.equal(result.meta.title, 'Test Page');
    assert.equal(result.meta.views, 0);
    assert.ok(result.meta.createdAt > 0);
  });

  it('stores page as JSON file', () => {
    const result = savePage('<p>Hello</p>', { title: 'File Test' });
    createdIds.push(result.id);

    const file = path.join(PAGES_DIR, `${result.id}.json`);
    assert.ok(fs.existsSync(file));

    const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
    assert.equal(data.html, '<p>Hello</p>');
    assert.equal(data.meta.title, 'File Test');
  });
});

describe('getPage', () => {
  it('returns page data and increments views', () => {
    const { id } = savePage('<div>View test</div>', { title: 'Views' });
    createdIds.push(id);

    const page1 = getPage(id);
    assert.equal(page1.meta.views, 1);

    const page2 = getPage(id);
    assert.equal(page2.meta.views, 2);
  });

  it('returns null for non-existent page', () => {
    assert.equal(getPage('nonexistent12'), null);
  });

  it('does not increment views when flag is false', () => {
    const { id } = savePage('<div>No inc</div>', { title: 'No Inc' });
    createdIds.push(id);

    getPage(id, false);
    const page = getPage(id, false);
    assert.equal(page.meta.views, 0);
  });

  it('returns null and deletes expired page', () => {
    const { id } = savePage('<div>Expired</div>', { title: 'TTL', ttl: 1 });
    createdIds.push(id);

    // Wait for TTL to expire
    const start = Date.now();
    while (Date.now() - start < 10) {} // busy wait 10ms

    const page = getPage(id);
    assert.equal(page, null);
  });
});

describe('listPages', () => {
  it('lists created pages sorted by creation time (newest first)', () => {
    const { id: id1 } = savePage('<p>First</p>', { title: 'First' });
    createdIds.push(id1);

    // Small delay to ensure different timestamps
    const start = Date.now();
    while (Date.now() - start < 5) {}

    const { id: id2 } = savePage('<p>Second</p>', { title: 'Second' });
    createdIds.push(id2);

    const pages = listPages();
    const ids = pages.map(p => p.id);
    assert.ok(ids.includes(id1));
    assert.ok(ids.includes(id2));

    // Second should come before first (newest first)
    assert.ok(ids.indexOf(id2) < ids.indexOf(id1));
  });
});

describe('deletePage', () => {
  it('deletes an existing page', () => {
    const { id } = savePage('<p>Delete me</p>', { title: 'Delete' });

    assert.ok(deletePage(id));
    assert.equal(getPage(id), null);
  });

  it('returns false for non-existent page', () => {
    assert.equal(deletePage('nonexistent12'), false);
  });
});
