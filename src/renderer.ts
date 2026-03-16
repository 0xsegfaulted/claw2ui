/**
 * A2UI Renderer — Orchestrator
 *
 * Delegates rendering to pluggable themes. Each theme provides its own
 * CSS, fonts, Chart.js config, and component HTML.
 *
 * Default theme: "anthropic" (warm editorial aesthetic).
 * Available themes can be listed via the /api/themes endpoint.
 *
 * To add a theme, see src/themes/README or src/themes/types.ts.
 */
import type { Component, PageSpec } from './types';
import { esc } from './render-utils';
import { getTheme, DEFAULT_THEME } from './themes';

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Render a single component to HTML.
 * Uses the default theme unless a style override is given.
 */
export function renderComponent(comp: Component, style?: string): string {
  const theme = getTheme(style);
  return theme.renderComponent(comp);
}

/**
 * Render a full page from a component spec.
 */
export function renderPage(spec: PageSpec): string {
  const title = spec.title || 'Claw2UI';
  const themeMode = spec.theme || 'auto';
  const style = spec.style || DEFAULT_THEME;
  const components = spec.components || [];
  const description = generateDescription(components);

  const theme = getTheme(style);
  const componentHtml = components.map(c => theme.renderComponent(c)).join('\n');

  const themeInit = themeMode === 'dark'
    ? `document.documentElement.classList.add('dark');`
    : themeMode === 'light'
    ? ``
    : `if(window.matchMedia('(prefers-color-scheme:dark)').matches){document.documentElement.classList.add('dark');}
       window.matchMedia('(prefers-color-scheme:dark)').addEventListener('change',function(e){document.documentElement.classList.toggle('dark',e.matches);});`;

  const chartScript = theme.getChartDefaultsScript();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  ${theme.getFontsHTML()}
  <script src="https://cdn.tailwindcss.com"></script>
  <script>tailwind.config = ${theme.getTailwindConfig()}</script>
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>
  <script>${themeInit}</script>
  ${chartScript ? `<script>${chartScript}</script>` : ''}
  <style>${theme.getDesignCSS()}</style>
</head>
<body>
  ${componentHtml}
  ${theme.getFooterHTML()}
</body>
</html>`;
}

/**
 * Render raw HTML into a full page with the default theme styling.
 */
export function renderRawPage(html: string, title: string = 'Claw2UI'): string {
  const theme = getTheme(DEFAULT_THEME);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  ${theme.getFontsHTML()}
  <script src="https://cdn.tailwindcss.com"></script>
  <script>tailwind.config = ${theme.getTailwindConfig()}</script>
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>
  <script>
    if(window.matchMedia('(prefers-color-scheme:dark)').matches){document.documentElement.classList.add('dark');}
  </script>
  <style>${theme.getDesignCSS()}</style>
</head>
<body>
  ${html}
  ${theme.getFooterHTML()}
</body>
</html>`;
}

/* ------------------------------------------------------------------ */
/*  Description Generator                                              */
/* ------------------------------------------------------------------ */

function generateDescription(components: Component[]): string {
  if (!Array.isArray(components)) return 'Interactive page powered by Claw2UI';
  const flat = flattenForDesc(components);
  const stats = flat.filter(c => c.type === 'stat').length;
  const charts = flat.filter(c => c.type === 'chart').length;
  const tables = flat.filter(c => c.type === 'table').length;
  const parts: string[] = [];
  if (stats) parts.push(`${stats} metric${stats > 1 ? 's' : ''}`);
  if (charts) parts.push(`${charts} chart${charts > 1 ? 's' : ''}`);
  if (tables) parts.push(`${tables} table${tables > 1 ? 's' : ''}`);
  if (parts.length === 0) return 'Interactive page powered by Claw2UI';
  return `Dashboard with ${parts.join(', ')} - powered by Claw2UI`;
}

function flattenForDesc(components: Component[]): Component[] {
  const result: Component[] = [];
  for (const comp of components) {
    result.push(comp);
    if (comp.children) result.push(...flattenForDesc(comp.children));
    if (comp.props?.tabs) {
      for (const tab of comp.props.tabs) {
        if (tab.children) result.push(...flattenForDesc(tab.children));
      }
    }
    if (comp.props?.items) {
      for (const item of comp.props.items) {
        if (item.children) result.push(...flattenForDesc(item.children));
      }
    }
  }
  return result;
}
