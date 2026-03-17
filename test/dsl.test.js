const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

const {
  page, container, row, column, card, list, modal,
  tabs, tab, accordion, section,
  stat, chart, table,
  button, textField, select, checkbox, choicePicker, slider, dateTimeInput,
  markdown, text, code, html, icon, image, video, audioPlayer, divider, spacer,
  header, link,
  dataset, col, badge, months,
} = require('../dist/dsl/index');

// === page() ===

describe('page()', () => {
  it('creates a PageSpec with title and components', () => {
    const spec = page('Test', [stat('A', '1')]);
    assert.equal(spec.title, 'Test');
    assert.equal(spec.theme, 'auto');
    assert.equal(spec.components.length, 1);
    assert.equal(spec.components[0].type, 'stat');
  });

  it('accepts options', () => {
    const spec = page('X', [], { theme: 'dark', style: 'anthropic' });
    assert.equal(spec.theme, 'dark');
    assert.equal(spec.style, 'anthropic');
  });

  it('omits style when not set', () => {
    const spec = page('X', []);
    assert.equal(spec.style, undefined);
  });
});

// === Layout components ===

describe('layout components', () => {
  it('container wraps children', () => {
    const c = container(header('Hi'), text('Body'));
    assert.equal(c.type, 'container');
    assert.equal(c.children.length, 2);
    assert.equal(c.props, undefined);
  });

  it('row sets cols', () => {
    const r = row(3, stat('A', '1'), stat('B', '2'));
    assert.equal(r.type, 'row');
    assert.equal(r.props.cols, 3);
    assert.equal(r.children.length, 2);
  });

  it('column sets span', () => {
    const c = column(2, text('Hi'));
    assert.equal(c.type, 'column');
    assert.equal(c.props.span, 2);
  });

  it('card sets title', () => {
    const c = card('My Card', text('Content'));
    assert.equal(c.type, 'card');
    assert.equal(c.props.title, 'My Card');
    assert.equal(c.children.length, 1);
  });

  it('list sets direction', () => {
    const l = list('horizontal', text('A'), text('B'));
    assert.equal(l.type, 'list');
    assert.equal(l.props.direction, 'horizontal');
  });

  it('modal sets title', () => {
    const m = modal('Confirm', text('Are you sure?'));
    assert.equal(m.type, 'modal');
    assert.equal(m.props.title, 'Confirm');
  });

  it('container with no children omits children', () => {
    const c = container();
    assert.equal(c.type, 'container');
    assert.equal(c.children, undefined);
  });

  it('flattens nested arrays (from spread)', () => {
    const services = ['nginx', 'redis'];
    const r = row(2, ...services.map(s => stat(s, 'Running')));
    assert.equal(r.children.length, 2);
    assert.equal(r.children[0].props.label, 'nginx');
  });
});

// === Tabs / Accordion ===

describe('tabs / accordion', () => {
  it('tabs creates tabs component', () => {
    const t = tabs(
      tab('t1', 'Tab 1', text('Content 1')),
      tab('t2', 'Tab 2', text('Content 2')),
    );
    assert.equal(t.type, 'tabs');
    assert.equal(t.props.tabs.length, 2);
    assert.equal(t.props.tabs[0].id, 't1');
    assert.equal(t.props.tabs[0].label, 'Tab 1');
    assert.equal(t.props.tabs[0].children.length, 1);
  });

  it('accordion creates accordion component', () => {
    const a = accordion(
      section('Section 1', text('Body 1')),
      section('Section 2', text('Body 2')),
    );
    assert.equal(a.type, 'accordion');
    assert.equal(a.props.items.length, 2);
    assert.equal(a.props.items[0].title, 'Section 1');
    assert.equal(a.props.items[0].children.length, 1);
  });
});

// === Data display ===

describe('data display components', () => {
  it('stat with all options', () => {
    const s = stat('Revenue', '$1.2M', { change: 15.3, icon: 'payments' });
    assert.equal(s.type, 'stat');
    assert.equal(s.props.label, 'Revenue');
    assert.equal(s.props.value, '$1.2M');
    assert.equal(s.props.change, 15.3);
    assert.equal(s.props.icon, 'payments');
  });

  it('stat minimal', () => {
    const s = stat('Count', 42);
    assert.equal(s.props.label, 'Count');
    assert.equal(s.props.value, 42);
    assert.equal(s.props.change, undefined);
    assert.equal(s.props.icon, undefined);
  });

  it('chart with options', () => {
    const c = chart('bar', { labels: ['A'], datasets: [] }, { height: 300 });
    assert.equal(c.type, 'chart');
    assert.equal(c.props.chartType, 'bar');
    assert.equal(c.props.height, 300);
    assert.deepEqual(c.props.data.labels, ['A']);
  });

  it('table with options', () => {
    const t = table(
      [col('name', 'Name')],
      [{ name: 'Alice' }],
      { searchable: true, perPage: 10 },
    );
    assert.equal(t.type, 'table');
    assert.equal(t.props.searchable, true);
    assert.equal(t.props.perPage, 10);
    assert.equal(t.props.columns.length, 1);
    assert.equal(t.props.rows.length, 1);
  });
});

// === Input components ===

describe('input components', () => {
  it('button', () => {
    const b = button('Submit', 'primary');
    assert.equal(b.type, 'button');
    assert.equal(b.props.label, 'Submit');
    assert.equal(b.props.variant, 'primary');
  });

  it('button without variant', () => {
    const b = button('Go');
    assert.equal(b.props.variant, undefined);
  });

  it('textField', () => {
    const t = textField('Email', { placeholder: 'you@example.com' });
    assert.equal(t.type, 'text-field');
    assert.equal(t.props.label, 'Email');
    assert.equal(t.props.placeholder, 'you@example.com');
  });

  it('select', () => {
    const s = select('Color', [{ value: 'r', label: 'Red' }]);
    assert.equal(s.type, 'select');
    assert.equal(s.props.options.length, 1);
  });

  it('checkbox', () => {
    const c = checkbox('Accept', true);
    assert.equal(c.type, 'checkbox');
    assert.equal(c.props.value, true);
  });

  it('checkbox without value', () => {
    const c = checkbox('Accept');
    assert.equal(c.props.value, undefined);
  });

  it('slider', () => {
    const s = slider('Volume', { min: 0, max: 100, value: 50 });
    assert.equal(s.type, 'slider');
    assert.equal(s.props.min, 0);
    assert.equal(s.props.max, 100);
  });

  it('dateTimeInput', () => {
    const d = dateTimeInput('Start', { enableDate: true, enableTime: false });
    assert.equal(d.type, 'date-time-input');
    assert.equal(d.props.enableDate, true);
    assert.equal(d.props.enableTime, false);
  });
});

// === Media components ===

describe('media components', () => {
  it('markdown', () => {
    const m = markdown('# Hello');
    assert.equal(m.type, 'markdown');
    assert.equal(m.props.content, '# Hello');
  });

  it('text with opts', () => {
    const t = text('Bold text', { bold: true, size: 'lg' });
    assert.equal(t.type, 'text');
    assert.equal(t.props.bold, true);
  });

  it('code', () => {
    const c = code('console.log("hi")', 'js');
    assert.equal(c.type, 'code');
    assert.equal(c.props.language, 'js');
  });

  it('html', () => {
    const h = html('<b>Bold</b>');
    assert.equal(h.type, 'html');
  });

  it('icon', () => {
    const i = icon('settings', 24);
    assert.equal(i.type, 'icon');
    assert.equal(i.props.name, 'settings');
    assert.equal(i.props.size, 24);
  });

  it('image', () => {
    const i = image('pic.png', 'A picture');
    assert.equal(i.type, 'image');
    assert.equal(i.props.src, 'pic.png');
    assert.equal(i.props.alt, 'A picture');
  });

  it('video', () => {
    const v = video('vid.mp4', 'poster.jpg');
    assert.equal(v.type, 'video');
    assert.equal(v.props.url, 'vid.mp4');
    assert.equal(v.props.poster, 'poster.jpg');
  });

  it('audioPlayer', () => {
    const a = audioPlayer('audio.mp3', 'A song');
    assert.equal(a.type, 'audio-player');
    assert.equal(a.props.description, 'A song');
  });

  it('divider', () => {
    assert.equal(divider().type, 'divider');
    assert.equal(divider().props, undefined);
  });

  it('spacer', () => {
    assert.equal(spacer(8).props.size, 8);
    assert.equal(spacer().props, undefined);
  });
});

// === Navigation ===

describe('navigation components', () => {
  it('header', () => {
    const h = header('Title', 'Subtitle');
    assert.equal(h.type, 'header');
    assert.equal(h.props.title, 'Title');
    assert.equal(h.props.subtitle, 'Subtitle');
  });

  it('header without subtitle', () => {
    const h = header('Title');
    assert.equal(h.props.subtitle, undefined);
  });

  it('link', () => {
    const l = link('https://example.com', 'Example', '_blank');
    assert.equal(l.type, 'link');
    assert.equal(l.props.href, 'https://example.com');
    assert.equal(l.props.label, 'Example');
    assert.equal(l.props.target, '_blank');
  });
});

// === Helpers ===

describe('helpers', () => {
  it('dataset creates Chart.js dataset', () => {
    const ds = dataset('Revenue', [1, 2, 3], { borderColor: 'red' });
    assert.equal(ds.label, 'Revenue');
    assert.deepEqual(ds.data, [1, 2, 3]);
    assert.equal(ds.borderColor, 'red');
  });

  it('col creates column def', () => {
    const c = col('name', 'Name', 'currency');
    assert.equal(c.key, 'name');
    assert.equal(c.label, 'Name');
    assert.equal(c.format, 'currency');
  });

  it('col minimal', () => {
    const c = col('id');
    assert.equal(c.key, 'id');
    assert.equal(c.label, undefined);
    assert.equal(c.format, undefined);
  });

  it('badge creates badge column', () => {
    const b = badge('status', 'Status', { Active: 'success', Inactive: 'error' });
    assert.equal(b.format, 'badge');
    assert.deepEqual(b.badgeMap, { Active: 'success', Inactive: 'error' });
  });

  it('months returns abbreviations', () => {
    assert.deepEqual(months(3), ['Jan', 'Feb', 'Mar']);
    assert.deepEqual(months(12).length, 12);
    assert.deepEqual(months(0), []);
    assert.deepEqual(months(15).length, 12); // capped at 12
  });
});

// === Runner ===

describe('runDslFile()', () => {
  const { runDslFile } = require('../dist/dsl/runner');

  it('executes a .ts DSL file and returns PageSpec', () => {
    const spec = runDslFile(path.join(__dirname, '..', 'templates', 'dashboard.ts'));
    assert.equal(spec.title, 'System Dashboard');
    assert.equal(spec.theme, 'auto');
    assert.ok(Array.isArray(spec.components));
    assert.equal(spec.components.length, 1);
    assert.equal(spec.components[0].type, 'container');
  });

  it('throws on non-existent file', () => {
    assert.throws(() => runDslFile('/tmp/nonexistent_dsl_file.ts'), /File not found/);
  });

  it('throws on file without page() export', () => {
    const fs = require('fs');
    const tmp = path.join(__dirname, '_test_no_export.ts');
    fs.writeFileSync(tmp, 'const x = 1;');
    try {
      assert.throws(() => runDslFile(tmp, { noCheck: true }), /must export a PageSpec/);
    } finally {
      fs.unlinkSync(tmp);
    }
  });

  it('blocks require of non-DSL modules (sandbox)', () => {
    const fs = require('fs');
    const tmp = path.join(__dirname, '_test_blocked_require.ts');
    fs.writeFileSync(tmp, 'const fs = require("fs"); export default { components: [] };');
    try {
      assert.throws(() => runDslFile(tmp, { noCheck: true }), /can only import "claw2ui\/dsl"/);
    } finally {
      fs.unlinkSync(tmp);
    }
  });

  it('blocks process access via Function constructor (VM sandbox)', () => {
    const fs = require('fs');
    const tmp = path.join(__dirname, '_test_process_escape.ts');
    // This escape vector works with vm.runInThisContext but not vm.createContext
    fs.writeFileSync(tmp, `
      let p: any;
      try { p = Function('return process')(); } catch {}
      if (p) throw new Error('sandbox escaped');
      import { page } from "claw2ui/dsl";
      export default page("Safe", []);
    `);
    try {
      const spec = runDslFile(tmp, { noCheck: true });
      assert.equal(spec.title, 'Safe');
    } finally {
      fs.unlinkSync(tmp);
    }
  });

  it('type-checks valid DSL files by default', () => {
    // templates/dashboard.ts is valid — should pass type checking
    const spec = runDslFile(path.join(__dirname, '..', 'templates', 'dashboard.ts'));
    assert.equal(spec.title, 'System Dashboard');
  });

  it('rejects DSL files with type errors', () => {
    const fs = require('fs');
    const tmp = path.join(__dirname, '_test_type_error.ts');
    // stat() expects (string, string|number) — passing wrong types
    fs.writeFileSync(tmp, `
      import { page, stat } from "claw2ui/dsl";
      export default page("Test", [stat(123, true)]);
    `);
    try {
      assert.throws(() => runDslFile(tmp), /Type errors/);
    } finally {
      fs.unlinkSync(tmp);
    }
  });

  it('skips type checking with noCheck option', () => {
    const fs = require('fs');
    const tmp = path.join(__dirname, '_test_no_check.ts');
    // Wrong types, but should still run with noCheck
    fs.writeFileSync(tmp, `
      import { page, stat } from "claw2ui/dsl";
      export default page("NoCheck", [stat(123 as any, true as any)]);
    `);
    try {
      const spec = runDslFile(tmp, { noCheck: true });
      assert.equal(spec.title, 'NoCheck');
    } finally {
      fs.unlinkSync(tmp);
    }
  });

  it('DSL output matches equivalent JSON structure', () => {
    const spec = runDslFile(path.join(__dirname, '..', 'templates', 'dashboard.ts'));
    const jsonSpec = require(path.join(__dirname, '..', 'templates', 'dashboard.json'));

    // Both should have the same title
    assert.equal(spec.title, jsonSpec.title);

    // Both should produce a container with same number of direct children
    const dslContainer = spec.components[0];
    const jsonContainer = jsonSpec.components[0];
    assert.equal(dslContainer.type, jsonContainer.type);
    assert.equal(dslContainer.children.length, jsonContainer.children.length);

    // First child should be header with same title
    assert.equal(dslContainer.children[0].type, 'header');
    assert.equal(dslContainer.children[0].props.title, jsonContainer.children[0].props.title);

    // Stats row should have 4 children
    assert.equal(dslContainer.children[1].children.length, 4);
    assert.equal(dslContainer.children[1].props.cols, 4);
  });
});

// === Integration: DSL → renderPage ===

describe('DSL → renderPage integration', () => {
  const { renderPage } = require('../dist/renderer');
  const { runDslFile } = require('../dist/dsl/runner');

  it('DSL output renders to valid HTML', () => {
    const spec = runDslFile(path.join(__dirname, '..', 'templates', 'dashboard.ts'));
    const html = renderPage(spec);
    assert.ok(html.includes('<!DOCTYPE html>'));
    assert.ok(html.includes('System Dashboard'));
    assert.ok(html.includes('CPU Usage'));
    assert.ok(html.includes('nginx'));
  });
});

// === Logic patterns (loops, conditionals) ===

describe('DSL logic patterns', () => {
  it('supports loops via spread + map', () => {
    const services = ['nginx', 'postgres', 'redis'];
    const r = row(3, ...services.map(s => stat(s, 'Running')));
    assert.equal(r.children.length, 3);
    assert.equal(r.children[0].props.label, 'nginx');
    assert.equal(r.children[2].props.label, 'redis');
  });

  it('supports conditionals', () => {
    const hasData = true;
    const c = container(
      header('Report'),
      hasData ? card('Trend', chart('line', {})) : text('No data'),
    );
    assert.equal(c.children.length, 2);
    assert.equal(c.children[1].type, 'card');
  });

  it('supports conditional with false branch', () => {
    const hasData = false;
    const c = container(
      header('Report'),
      hasData ? card('Trend', chart('line', {})) : text('No data'),
    );
    assert.equal(c.children[1].type, 'text');
    assert.equal(c.children[1].props.content, 'No data');
  });

  it('filters out falsy values from children', () => {
    const showExtra = false;
    const c = container(
      header('Hi'),
      showExtra && stat('Extra', '0'),
    );
    // false should be filtered out
    assert.equal(c.children.length, 1);
  });
});
