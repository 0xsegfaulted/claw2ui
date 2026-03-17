/**
 * Component Registry
 *
 * Maps component type names to render functions. Themes create a registry,
 * populate it with renderers, and optionally allow users to register
 * custom components.
 *
 * This replaces the monolithic switch statement, making components:
 * - independently testable
 * - extensible (register custom types at runtime)
 * - overridable per-theme
 */
import type { Component } from '../types';

/**
 * A function that renders a single component to an HTML string.
 *
 * @param comp - The component to render
 * @param renderChild - Callback to render child components (uses the same registry)
 */
export type ComponentRenderFn = (
  comp: Component,
  renderChild: (c: Component) => string,
) => string;

export class ComponentRegistry {
  private renderers = new Map<string, ComponentRenderFn>();

  /** Register a render function for a component type. Returns `this` for chaining. */
  register(type: string, fn: ComponentRenderFn): this {
    this.renderers.set(type, fn);
    return this;
  }

  /** Check if a component type is registered. */
  has(type: string): boolean {
    return this.renderers.has(type);
  }

  /** Render a component tree to HTML. */
  render(comp: Component): string {
    if (!comp || !comp.type) return '';
    const fn = this.renderers.get(comp.type);
    if (!fn) return `<!-- unknown component: ${comp.type} -->`;
    return fn(comp, (c) => this.render(c));
  }

  /** Create an independent copy of this registry. */
  clone(): ComponentRegistry {
    const copy = new ComponentRegistry();
    for (const [type, fn] of this.renderers) {
      copy.register(type, fn);
    }
    return copy;
  }

  /** List all registered component type names. */
  types(): string[] {
    return [...this.renderers.keys()];
  }
}
