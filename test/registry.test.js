const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { ComponentRegistry } = require('../dist/components/registry');
const { createAnthropicRegistry } = require('../dist/themes/anthropic');
const { createClassicRegistry } = require('../dist/themes/classic');

describe('ComponentRegistry', () => {
  it('renders registered component', () => {
    const reg = new ComponentRegistry();
    reg.register('greeting', (comp) => `<h1>${comp.props.name}</h1>`);
    const html = reg.render({ type: 'greeting', props: { name: 'World' } });
    assert.equal(html, '<h1>World</h1>');
  });

  it('returns empty string for null/undefined', () => {
    const reg = new ComponentRegistry();
    assert.equal(reg.render(null), '');
    assert.equal(reg.render(undefined), '');
    assert.equal(reg.render({}), '');
  });

  it('returns comment for unknown type', () => {
    const reg = new ComponentRegistry();
    const html = reg.render({ type: 'xyz' });
    assert.ok(html.includes('<!-- unknown component: xyz -->'));
  });

  it('has() checks registration', () => {
    const reg = new ComponentRegistry();
    assert.equal(reg.has('foo'), false);
    reg.register('foo', () => '');
    assert.equal(reg.has('foo'), true);
  });

  it('types() lists all registered types', () => {
    const reg = new ComponentRegistry();
    reg.register('a', () => '');
    reg.register('b', () => '');
    assert.deepEqual(reg.types(), ['a', 'b']);
  });

  it('clone() creates independent copy', () => {
    const reg = new ComponentRegistry();
    reg.register('a', () => '<a>');
    const copy = reg.clone();
    copy.register('b', () => '<b>');

    assert.ok(copy.has('a'));
    assert.ok(copy.has('b'));
    assert.ok(reg.has('a'));
    assert.ok(!reg.has('b')); // original unaffected
  });

  it('passes renderChild callback for recursive rendering', () => {
    const reg = new ComponentRegistry();
    reg.register('wrapper', (comp, renderChild) => {
      const inner = (comp.children || []).map(renderChild).join('');
      return `<div>${inner}</div>`;
    });
    reg.register('item', (comp) => `<span>${comp.props.text}</span>`);

    const html = reg.render({
      type: 'wrapper',
      children: [
        { type: 'item', props: { text: 'A' } },
        { type: 'item', props: { text: 'B' } },
      ],
    });
    assert.ok(html.includes('<span>A</span>'));
    assert.ok(html.includes('<span>B</span>'));
    assert.ok(html.includes('<div>'));
  });

  it('allows overriding a registered component', () => {
    const reg = new ComponentRegistry();
    reg.register('box', () => '<div class="v1"></div>');
    reg.register('box', () => '<div class="v2"></div>');
    assert.equal(reg.render({ type: 'box' }), '<div class="v2"></div>');
  });

  it('supports chaining register calls', () => {
    const reg = new ComponentRegistry()
      .register('a', () => 'A')
      .register('b', () => 'B');
    assert.ok(reg.has('a'));
    assert.ok(reg.has('b'));
  });
});

describe('Anthropic registry', () => {
  it('registers all 30 component types', () => {
    const reg = createAnthropicRegistry();
    const expected = [
      'container', 'row', 'column', 'card', 'tabs', 'accordion', 'list', 'modal',
      'stat', 'table', 'chart',
      'button', 'text-field', 'select', 'checkbox', 'choice-picker', 'slider', 'date-time-input',
      'icon', 'image', 'video', 'audio-player', 'text', 'code', 'markdown', 'html', 'divider', 'spacer',
      'header', 'link',
    ];
    for (const type of expected) {
      assert.ok(reg.has(type), `missing: ${type}`);
    }
    assert.equal(reg.types().length, expected.length);
  });

  it('can be cloned and extended with custom component', () => {
    const reg = createAnthropicRegistry().clone();
    reg.register('custom-widget', (comp) => `<div class="custom">${comp.props?.label || ''}</div>`);
    assert.ok(reg.has('custom-widget'));
    const html = reg.render({ type: 'custom-widget', props: { label: 'Hello' } });
    assert.ok(html.includes('Hello'));
    assert.ok(html.includes('custom'));
  });
});

describe('Classic registry', () => {
  it('registers same component types as anthropic', () => {
    const anthReg = createAnthropicRegistry();
    const classicReg = createClassicRegistry();
    assert.deepEqual(anthReg.types().sort(), classicReg.types().sort());
  });

  it('renders stat with classic-specific classes', () => {
    const reg = createClassicRegistry();
    const html = reg.render({ type: 'stat', props: { label: 'X', value: '1', change: 5 } });
    assert.ok(html.includes('text-green-600'));
  });
});
