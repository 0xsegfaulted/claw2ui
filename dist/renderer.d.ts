/**
 * A2UI-inspired renderer: converts declarative JSON component descriptions
 * into self-contained interactive HTML pages.
 *
 * Component types supported:
 *   layout: container, row, column, card, tabs, accordion, list, modal
 *   data:   stat, table, chart (line, bar, pie, doughnut, radar, area)
 *   input:  button, text-field, select, checkbox, choice-picker, slider, date-time-input
 *   media:  icon, image, video, audio-player, markdown, code, html, text, divider, spacer
 *   nav:    header, link
 */
import type { Component, PageSpec } from './types';
/**
 * Render a component tree to HTML string
 */
export declare function renderComponent(comp: Component): string;
/**
 * Render a full page from a component tree
 */
export declare function renderPage(spec: PageSpec): string;
/**
 * Render raw HTML into a full page with just the base styling
 */
export declare function renderRawPage(html: string, title?: string): string;
