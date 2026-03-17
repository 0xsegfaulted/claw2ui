/**
 * Shared rendering utilities used by all themes.
 *
 * This module contains security-critical functions (HTML escaping,
 * sanitization) and data formatting helpers. Theme authors should
 * import from here rather than re-implementing.
 */
import { marked } from 'marked';
import sanitize from 'sanitize-html';
import type { ColumnDef } from './types';

// Configure marked for safe, synchronous rendering
marked.setOptions({ async: false, gfm: true, breaks: true });

/** sanitize-html whitelist config — shared by sanitizeHtml() and parseMarkdown() */
const SANITIZE_OPTIONS: sanitize.IOptions = {
  allowedTags: sanitize.defaults.allowedTags.concat([
    'img', 'del', 'ins', 'details', 'summary', 'input',
    'video', 'audio', 'source', 'picture',
  ]),
  allowedAttributes: {
    '*': ['class', 'id', 'style'],
    a: ['href', 'name', 'target', 'rel'],
    img: ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading'],
    details: ['open'],
    input: ['type', 'checked', 'disabled'],
    td: ['colspan', 'rowspan'],
    th: ['colspan', 'rowspan'],
    col: ['span'],
    colgroup: ['span'],
    video: ['src', 'poster', 'controls', 'width', 'height'],
    audio: ['src', 'controls'],
    source: ['src', 'type'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: {
    img: ['http', 'https', 'data'],
  },
  allowedSchemesAppliedToAttributes: ['href', 'src', 'cite', 'action'],
};

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
 * Sanitize HTML using a whitelist-based approach (sanitize-html library).
 * Only tags and attributes in the whitelist are kept; everything else is stripped.
 */
export function sanitizeHtml(html: string): string {
  if (typeof html !== 'string') return '';
  return sanitize(html, SANITIZE_OPTIONS);
}

/* ------------------------------------------------------------------ */
/*  Markdown                                                           */
/* ------------------------------------------------------------------ */

/**
 * Parse markdown content to HTML, then sanitize the output.
 * Pipeline: markdown syntax → marked → sanitizeHtml → safe HTML
 */
export function parseMarkdown(md: string): string {
  if (typeof md !== 'string') return '';
  const html = marked.parse(md) as string;
  return sanitizeHtml(html);
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
  // Large grids (e.g. 12-col with col-span children) stack on mobile,
  // full layout from tablet up to avoid span/grid mismatch.
  // Clamp to 12 since Tailwind only provides grid-cols-1 through grid-cols-12.
  const clamped = Math.min(cols, 12);
  return `grid-cols-1 sm:grid-cols-${clamped}`;
}
