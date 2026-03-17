import type { Component, PageSpec } from '../types';

export interface PageOptions {
  theme?: 'light' | 'dark' | 'auto';
  style?: string;
}

export function page(title: string, components: Component[], opts?: PageOptions): PageSpec {
  return {
    title,
    theme: opts?.theme ?? 'auto',
    ...(opts?.style ? { style: opts.style } : {}),
    components,
  };
}
