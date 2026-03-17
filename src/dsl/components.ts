import type { Component } from '../types';

// ── Internal helpers ──

function c(type: string, props?: Record<string, any>, children?: Component[]): Component {
  const node: Component = { type };
  if (props && Object.keys(props).length > 0) node.props = props;
  if (children && children.length > 0) node.children = children;
  return node;
}

function flat(items: any[]): Component[] {
  return items.flat(Infinity).filter(Boolean) as Component[];
}

// ── Layout ──

export function container(...children: (Component | Component[])[]): Component {
  return c('container', undefined, flat(children));
}

export function row(cols: number, ...children: (Component | Component[])[]): Component {
  return c('row', { cols }, flat(children));
}

export function column(span: number, ...children: (Component | Component[])[]): Component {
  return c('column', { span }, flat(children));
}

export function card(title: string, ...children: (Component | Component[])[]): Component {
  return c('card', { title }, flat(children));
}

export function list(direction: 'vertical' | 'horizontal', ...children: (Component | Component[])[]): Component {
  return c('list', { direction }, flat(children));
}

export function modal(title: string, ...children: (Component | Component[])[]): Component {
  return c('modal', { title }, flat(children));
}

// ── Tabs / Accordion helpers ──

/** @internal */
export interface TabDef { _tab: true; id: string; label: string; children: Component[] }
/** @internal */
export interface SectionDef { _section: true; title: string; children: Component[] }

export function tab(id: string, label: string, ...children: (Component | Component[])[]): TabDef {
  return { _tab: true, id, label, children: flat(children) };
}

export function tabs(...items: TabDef[]): Component {
  return c('tabs', {
    tabs: items.map(t => ({ id: t.id, label: t.label, children: t.children })),
  });
}

export function section(title: string, ...children: (Component | Component[])[]): SectionDef {
  return { _section: true, title, children: flat(children) };
}

export function accordion(...items: SectionDef[]): Component {
  return c('accordion', {
    items: items.map(s => ({ title: s.title, children: s.children })),
  });
}

// ── Data Display ──

export function stat(
  label: string,
  value: string | number,
  opts?: { change?: number; icon?: string },
): Component {
  return c('stat', { label, value, ...opts });
}

export function chart(
  chartType: string,
  data: Record<string, any>,
  opts?: { height?: number; options?: Record<string, any>; legendPosition?: string; title?: string },
): Component {
  return c('chart', { chartType, data, ...opts });
}

export function table(
  columns: any[],
  rows: Record<string, any>[],
  opts?: { searchable?: boolean; perPage?: number },
): Component {
  return c('table', { columns, rows, ...opts });
}

// ── Input ──

export function button(label: string, variant?: string): Component {
  return c('button', { label, ...(variant ? { variant } : {}) });
}

export function textField(
  label?: string,
  opts?: { placeholder?: string; value?: string; inputType?: string },
): Component {
  return c('text-field', { label, ...opts });
}

export function select(label: string, options: { value: string; label: string }[]): Component {
  return c('select', { label, options });
}

export function checkbox(label: string, value?: boolean): Component {
  return c('checkbox', { label, ...(value !== undefined ? { value } : {}) });
}

export function choicePicker(
  label: string,
  options: { value: string; label: string }[],
  opts?: { value?: string[]; variant?: string; displayStyle?: string },
): Component {
  return c('choice-picker', { label, options, ...opts });
}

export function slider(
  label: string,
  opts?: { min?: number; max?: number; value?: number },
): Component {
  return c('slider', { label, ...opts });
}

export function dateTimeInput(
  label: string,
  opts?: { value?: string; enableDate?: boolean; enableTime?: boolean; min?: string; max?: string },
): Component {
  return c('date-time-input', { label, ...opts });
}

// ── Media ──

export function markdown(content: string): Component {
  return c('markdown', { content });
}

export function text(content: string, opts?: { size?: string; bold?: boolean; class?: string }): Component {
  return c('text', { content, ...opts });
}

export function code(content: string, language?: string): Component {
  return c('code', { content, ...(language ? { language } : {}) });
}

export function html(content: string): Component {
  return c('html', { content });
}

export function icon(name: string, size?: number): Component {
  return c('icon', { name, ...(size ? { size } : {}) });
}

export function image(src: string, alt?: string): Component {
  return c('image', { src, ...(alt ? { alt } : {}) });
}

export function video(url: string, poster?: string): Component {
  return c('video', { url, ...(poster ? { poster } : {}) });
}

export function audioPlayer(url: string, description?: string): Component {
  return c('audio-player', { url, ...(description ? { description } : {}) });
}

export function divider(): Component {
  return c('divider');
}

export function spacer(size?: number): Component {
  return c('spacer', size ? { size } : undefined);
}

// ── Navigation ──

export function header(title: string, subtitle?: string): Component {
  return c('header', { title, ...(subtitle ? { subtitle } : {}) });
}

export function link(href: string, label?: string, target?: string): Component {
  return c('link', { href, ...(label ? { label } : {}), ...(target ? { target } : {}) });
}
