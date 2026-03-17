/**
 * Shared rendering utilities used by all themes.
 *
 * This module contains security-critical functions (HTML escaping,
 * sanitization) and data formatting helpers. Theme authors should
 * import from here rather than re-implementing.
 */
import type { ColumnDef } from './types';

/* ------------------------------------------------------------------ */
/*  Escaping                                                           */
/* ------------------------------------------------------------------ */

/** HTML-escape a string for safe embedding in element content / attributes */
export function esc(str: string): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** Escape a string for use inside JS single-quoted strings embedded in HTML attributes */
export function escJs(str: string): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\x22')
    .replace(/</g, '\\x3c')
    .replace(/>/g, '\\x3e')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
}

/** Escape JSON output for safe embedding inside <script> tags */
export function escJsonInScript(json: string): string {
  return json.replace(/<\//g, '<\\/');
}

/* ------------------------------------------------------------------ */
/*  Sanitization                                                       */
/* ------------------------------------------------------------------ */

/**
 * Sanitize HTML: strip <script> tags, javascript: URLs, and on* event handlers.
 */
export function sanitizeHtml(html: string): string {
  if (typeof html !== 'string') return '';
  return html
    // Strip dangerous tags (script, iframe, object, embed, form, style, base, meta, link)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<\/?script\b[^>]*>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<\/?iframe\b[^>]*>/gi, '')
    .replace(/<\/?object\b[^>]*>/gi, '')
    .replace(/<\/?embed\b[^>]*>/gi, '')
    .replace(/<\/?form\b[^>]*>/gi, '')
    .replace(/<\/?base\b[^>]*>/gi, '')
    .replace(/<\/?meta\b[^>]*>/gi, '')
    .replace(/<link\b[^>]*>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<\/?style\b[^>]*>/gi, '')
    // Strip event handlers
    .replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '')
    // Strip javascript: URLs (quoted and unquoted)
    .replace(/href\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*'|javascript:[^\s>]*)/gi, 'href="#"')
    .replace(/src\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*'|javascript:[^\s>]*)/gi, 'src=""')
    .replace(/srcdoc\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '');
}

/* ------------------------------------------------------------------ */
/*  Data Formatting                                                    */
/* ------------------------------------------------------------------ */

/** Valid Chart.js chart types */
export const VALID_CHART_TYPES = ['line', 'bar', 'pie', 'doughnut', 'radar', 'polarArea', 'bubble', 'scatter'];

/** Map A2UI camelCase icon names to Material Icons snake_case */
export function iconName(name: string | { path: string }): string {
  if (typeof name === 'object' && name.path) return name.path;
  if (typeof name !== 'string') return 'help';
  return name.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
}

/** Normalize ISO 8601 values to HTML input-compatible formats */
export function normalizeDateValue(val: string | undefined, inputType: string): string {
  if (!val) return '';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    if (inputType === 'date') return d.toISOString().slice(0, 10);
    if (inputType === 'time') return d.toISOString().slice(11, 16);
    return d.toISOString().slice(0, 16);
  } catch {
    return val;
  }
}

/**
 * Format a table cell value based on column definition.
 * Theme authors can override this, but this provides sensible defaults.
 */
export type FormatCellFn = (value: any, col: ColumnDef) => string;

/* ------------------------------------------------------------------ */
/*  Layout Helpers                                                     */
/* ------------------------------------------------------------------ */

/**
 * Generate responsive Tailwind grid classes for a given column count.
 * Stacks to 1 column on mobile, 2 on tablet, full count on desktop.
 */
export function responsiveGridCols(cols: number): string {
  if (!cols || cols <= 1) return 'grid-cols-1';
  if (cols === 2) return 'grid-cols-1 sm:grid-cols-2';
  if (cols <= 4) return `grid-cols-1 sm:grid-cols-2 lg:grid-cols-${cols}`;
  return `grid-cols-2 sm:grid-cols-3 lg:grid-cols-${cols}`;
}
