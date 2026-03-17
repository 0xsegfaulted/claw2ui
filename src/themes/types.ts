/**
 * Theme interface for Claw2UI.
 *
 * Each theme provides visual styling for rendered pages while sharing
 * the core security and data-handling logic from render-utils.
 *
 * To create a new theme:
 *   1. Create src/themes/<name>.ts implementing the Theme interface
 *   2. Register it in src/themes/index.ts
 *   3. Done — users can select it via the "style" field in PageSpec
 */
import type { Component, ColumnDef } from '../types';
import type { ComponentRegistry } from '../components/registry';

export interface ThemeMeta {
  /** Display name shown in UI */
  name: string;
  /** Short description of the aesthetic */
  description: string;
  /** Author name or handle */
  author?: string;
  /** URL to a live preview (optional) */
  previewUrl?: string;
}

export interface Theme {
  /** Metadata about this theme */
  meta: ThemeMeta;

  /**
   * Return the full design-system CSS to embed in <style>.
   * Should include CSS variables, component classes, animations, etc.
   */
  getDesignCSS(): string;

  /**
   * Return <link> / preconnect tags for fonts.
   * Will be placed in <head> before other resources.
   */
  getFontsHTML(): string;

  /**
   * Return the tailwind.config JS object as a string.
   * Example: `{ darkMode: 'class', theme: { extend: { ... } } }`
   */
  getTailwindConfig(): string;

  /**
   * Return a <script> body that configures Chart.js defaults.
   * Runs synchronously after Chart.js loads and after the theme script.
   * Has access to `document.documentElement.classList` to detect dark mode.
   */
  getChartDefaultsScript(): string;

  /**
   * Render a single component to an HTML string.
   * Called recursively for children.
   */
  renderComponent(comp: Component): string;

  /**
   * Format a table cell value.
   * Receives the raw value and column definition.
   */
  formatCell(value: any, col: ColumnDef): string;

  /**
   * Return the footer HTML shown at the bottom of every page.
   */
  getFooterHTML(): string;

  /**
   * Return the component registry used by this theme.
   * Allows runtime registration of custom components.
   */
  getRegistry(): ComponentRegistry;
}
