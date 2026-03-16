/**
 * Theme Registry
 *
 * Maps theme names to their implementations.
 *
 * To add a new theme:
 *   1. Create src/themes/<name>.ts implementing the Theme interface
 *   2. Import and register it below
 *   3. Users can select it via `"style": "<name>"` in PageSpec
 */
import type { Theme } from './types';
import anthropic from './anthropic';
import classic from './classic';

const themes: Record<string, Theme> = {
  anthropic,
  classic,
};

/** Default theme name */
export const DEFAULT_THEME = 'anthropic';

/** Get a theme by name, falling back to default */
export function getTheme(name?: string): Theme {
  if (name && Object.prototype.hasOwnProperty.call(themes, name)) return themes[name];
  return themes[DEFAULT_THEME];
}

/** List all registered themes with metadata */
export function listThemes(): Array<{ id: string; name: string; description: string; author?: string }> {
  return Object.entries(themes).map(([id, t]) => ({
    id,
    name: t.meta.name,
    description: t.meta.description,
    author: t.meta.author,
  }));
}

/** Register a theme at runtime (for plugins / dynamic loading) */
export function registerTheme(id: string, theme: Theme): void {
  themes[id] = theme;
}

export type { Theme } from './types';
