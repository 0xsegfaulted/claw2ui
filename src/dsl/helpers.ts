import type { ColumnDef } from '../types';

/** Create a Chart.js dataset object */
export function dataset(label: string, data: number[], opts?: Record<string, any>): Record<string, any> {
  return { label, data, ...opts };
}

/** Create a column definition */
export function col(key: string, label?: string, format?: 'currency' | 'percent' | 'badge'): ColumnDef {
  const def: ColumnDef = { key };
  if (label !== undefined) def.label = label;
  if (format) def.format = format;
  return def;
}

/** Create a badge column definition */
export function badge(key: string, label: string, map: Record<string, string>): ColumnDef {
  return { key, label, format: 'badge', badgeMap: map };
}

/** Generate month abbreviations: months(3) → ["Jan","Feb","Mar"] */
export function months(n: number): string[] {
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return names.slice(0, Math.max(0, Math.min(n, 12)));
}
