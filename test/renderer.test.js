const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { renderComponent, renderPage, renderRawPage } = require('../dist/renderer');

describe('renderComponent', () => {
  it('returns empty string for null/undefined input', () => {
    assert.equal(renderComponent(null), '');
    assert.equal(renderComponent(undefined), '');
    assert.equal(renderComponent({}), '');
  });

  it('renders container', () => {
    const html = renderComponent({ type: 'container', children: [] });
    assert.ok(html.includes('max-w-7xl'));
    assert.ok(html.includes('mx-auto'));
  });

  it('renders header with title and subtitle', () => {
    const html = renderComponent({
      type: 'header',
      props: { title: 'Hello', subtitle: 'World' },
    });
    assert.ok(html.includes('Hello'));
    assert.ok(html.includes('World'));
  });

  it('renders stat with positive change', () => {
    const html = renderComponent({
      type: 'stat',
      props: { label: 'Revenue', value: '$1M', change: 10.5, icon: '💰' },
    });
    assert.ok(html.includes('Revenue'));
    assert.ok(html.includes('$1M'));
    assert.ok(html.includes('text-green-600'));
    assert.ok(html.includes('10.5'));
    assert.ok(html.includes('💰'));
  });

  it('renders stat with negative change', () => {
    const html = renderComponent({
      type: 'stat',
      props: { label: 'Users', value: '500', change: -3.2 },
    });
    assert.ok(html.includes('text-red-600'));
    assert.ok(html.includes('3.2'));
  });

  it('renders table with columns and rows', () => {
    const html = renderComponent({
      type: 'table',
      props: {
        columns: [
          { key: 'name', label: 'Name' },
          { key: 'price', label: 'Price', format: 'currency' },
        ],
        rows: [
          { name: 'Widget', price: 9999 },
        ],
      },
    });
    assert.ok(html.includes('Name'));
    assert.ok(html.includes('Price'));
    assert.ok(html.includes('Widget'));
    assert.ok(html.includes('$9,999'));
  });

  it('renders table badge format', () => {
    const html = renderComponent({
      type: 'table',
      props: {
        columns: [
          { key: 'status', label: 'Status', format: 'badge', badgeMap: { Active: 'success' } },
        ],
        rows: [{ status: 'Active' }],
      },
    });
    assert.ok(html.includes('bg-green-100'));
    assert.ok(html.includes('Active'));
  });

  it('renders chart with canvas', () => {
    const html = renderComponent({
      type: 'chart',
      props: {
        chartType: 'bar',
        data: { labels: ['A'], datasets: [{ data: [1] }] },
      },
    });
    assert.ok(html.includes('<canvas'));
    assert.ok(html.includes("type: 'bar'"));
  });

  it('renders row with cols', () => {
    const html = renderComponent({
      type: 'row',
      props: { cols: 3, gap: 4 },
      children: [],
    });
    assert.ok(html.includes('grid-cols-3'));
    assert.ok(html.includes('gap-4'));
  });

  it('renders button variants', () => {
    const primary = renderComponent({ type: 'button', props: { label: 'Go', variant: 'primary' } });
    assert.ok(primary.includes('bg-blue-600'));
    assert.ok(primary.includes('Go'));

    const danger = renderComponent({ type: 'button', props: { label: 'Delete', variant: 'danger' } });
    assert.ok(danger.includes('bg-red-600'));
  });

  it('renders text-field', () => {
    const html = renderComponent({
      type: 'text-field',
      props: { label: 'Email', placeholder: 'you@example.com', value: 'test' },
    });
    assert.ok(html.includes('Email'));
    assert.ok(html.includes('you@example.com'));
    assert.ok(html.includes('test'));
  });

  it('renders card with title', () => {
    const html = renderComponent({
      type: 'card',
      props: { title: 'My Card', subtitle: 'Info' },
      children: [],
    });
    assert.ok(html.includes('My Card'));
    assert.ok(html.includes('Info'));
  });

  it('renders divider', () => {
    const html = renderComponent({ type: 'divider' });
    assert.ok(html.includes('<hr'));
  });

  it('renders code block', () => {
    const html = renderComponent({
      type: 'code',
      props: { content: 'console.log("hi")', language: 'js' },
    });
    assert.ok(html.includes('console.log'));
    assert.ok(html.includes('language-js'));
  });

  it('escapes HTML in text props', () => {
    const html = renderComponent({
      type: 'header',
      props: { title: '<script>alert("xss")</script>' },
    });
    assert.ok(!html.includes('<script>alert'));
    assert.ok(html.includes('&lt;script&gt;'));
  });

  it('sanitizes html component', () => {
    const html = renderComponent({
      type: 'html',
      props: { content: '<div>safe</div><script>evil()</script>' },
    });
    assert.ok(html.includes('safe'));
    assert.ok(!html.includes('<script>'));
  });

  it('renders unknown component as comment', () => {
    const html = renderComponent({ type: 'nonexistent' });
    assert.ok(html.includes('<!-- unknown component: nonexistent -->'));
  });

  it('renders link with javascript: URL protection', () => {
    const html = renderComponent({
      type: 'link',
      props: { href: 'javascript:alert(1)', label: 'Click' },
    });
    assert.ok(!html.includes('javascript:'));
  });

  it('renders nested children', () => {
    const html = renderComponent({
      type: 'container',
      children: [
        { type: 'header', props: { title: 'Nested' } },
        { type: 'text', props: { content: 'Body text' } },
      ],
    });
    assert.ok(html.includes('Nested'));
    assert.ok(html.includes('Body text'));
  });
});

describe('renderPage', () => {
  it('produces full HTML document', () => {
    const html = renderPage({
      title: 'Test Page',
      components: [
        { type: 'container', children: [
          { type: 'header', props: { title: 'Hello' } },
        ]},
      ],
    });
    assert.ok(html.includes('<!DOCTYPE html>'));
    assert.ok(html.includes('<title>Test Page</title>'));
    assert.ok(html.includes('tailwindcss'));
    assert.ok(html.includes('alpinejs'));
    assert.ok(html.includes('chart.js'));
    assert.ok(html.includes('Hello'));
    assert.ok(html.includes('Powered by ClawBoard'));
  });

  it('generates og:title meta tag', () => {
    const html = renderPage({ title: 'OG Test', components: [] });
    assert.ok(html.includes('og:title'));
    assert.ok(html.includes('OG Test'));
  });

  it('generates description from components', () => {
    const html = renderPage({
      title: 'Dashboard',
      components: [
        { type: 'container', children: [
          { type: 'stat', props: { label: 'A', value: '1' } },
          { type: 'chart', props: { chartType: 'line', data: {} } },
          { type: 'table', props: { columns: [], rows: [] } },
        ]},
      ],
    });
    assert.ok(html.includes('1 metric'));
    assert.ok(html.includes('1 chart'));
    assert.ok(html.includes('1 table'));
  });
});

describe('renderRawPage', () => {
  it('wraps HTML in full page with Tailwind', () => {
    const html = renderRawPage('<h1>Hello</h1>', 'Test');
    assert.ok(html.includes('<!DOCTYPE html>'));
    assert.ok(html.includes('<h1>Hello</h1>'));
    assert.ok(html.includes('tailwindcss'));
    assert.ok(html.includes('<title>Test</title>'));
  });
});
