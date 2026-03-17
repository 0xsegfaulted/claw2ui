/**
 * Typed component prop interfaces for A2UI components.
 *
 * These provide type safety and documentation for LLM-generated specs.
 * The base `Component` interface (with `Record<string, any>`) remains
 * for backward compatibility — these types are a strict refinement.
 */
import type { ColumnDef } from '../types';

// === Layout ===

export interface ContainerProps {
  class?: string;
}

export interface RowProps {
  cols?: number;
  gap?: number;
}

export interface ColumnProps {
  span?: number;
}

export interface CardProps {
  title?: string;
  subtitle?: string;
  class?: string;
}

export interface TabItem {
  id: string;
  label: string;
  children?: import('../types').Component[];
}

export interface TabsProps {
  tabs: TabItem[];
}

export interface AccordionItem {
  title: string;
  children?: import('../types').Component[];
}

export interface AccordionProps {
  items: AccordionItem[];
}

export interface ListProps {
  direction?: 'vertical' | 'horizontal';
  gap?: number;
  align?: 'start' | 'center' | 'end' | 'stretch';
}

export interface ModalProps {
  title?: string;
  triggerLabel?: string;
}

// === Data Display ===

export interface StatProps {
  label: string;
  value: string | number;
  change?: number;
  icon?: string;
}

export interface TableProps {
  columns: ColumnDef[];
  rows: Record<string, any>[];
  searchable?: boolean;
  perPage?: number;
}

export type ChartType = 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'polarArea' | 'bubble' | 'scatter';

export interface ChartProps {
  chartType: ChartType;
  data: Record<string, any>;
  height?: number;
  options?: Record<string, any>;
  legendPosition?: string;
  title?: string;
}

// === Input ===

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline';

export interface ButtonProps {
  label?: string;
  variant?: ButtonVariant;
}

export interface TextFieldProps {
  label?: string;
  placeholder?: string;
  value?: string;
  inputType?: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label?: string;
  options: SelectOption[];
}

export interface CheckboxProps {
  label?: string;
  value?: boolean;
}

export interface ChoicePickerProps {
  label?: string;
  options: SelectOption[];
  value?: string[];
  variant?: 'mutuallyExclusive' | 'multipleSelection';
  displayStyle?: 'checkbox' | 'chips';
}

export interface SliderProps {
  label?: string;
  min?: number;
  max?: number;
  value?: number;
}

export interface DateTimeInputProps {
  label?: string;
  value?: string;
  enableDate?: boolean;
  enableTime?: boolean;
  min?: string;
  max?: string;
}

// === Media ===

export interface IconProps {
  name: string | { path: string };
  size?: number;
}

export interface ImageProps {
  src: string;
  alt?: string;
}

export interface VideoProps {
  url: string;
  poster?: string;
}

export interface AudioPlayerProps {
  url: string;
  description?: string;
}

export interface TextProps {
  content: string;
  size?: string;
  bold?: boolean;
  class?: string;
}

export interface CodeProps {
  content: string;
  language?: string;
}

export interface MarkdownProps {
  content: string;
}

export interface HtmlProps {
  content: string;
}

export interface SpacerProps {
  size?: number;
}

// === Navigation ===

export interface HeaderProps {
  title: string;
  subtitle?: string;
}

export interface LinkProps {
  href: string;
  label?: string;
  target?: string;
}

// === Discriminated Union ===

type C<T extends string, P = undefined> = P extends undefined
  ? { type: T; props?: Record<string, any>; children?: import('../types').Component[] }
  : { type: T; props: P; children?: import('../types').Component[] };

/**
 * Type-safe component union. Use this when constructing specs programmatically
 * for full autocomplete and validation.
 */
export type TypedComponent =
  // Layout
  | C<'container', ContainerProps>
  | C<'row', RowProps>
  | C<'column', ColumnProps>
  | C<'card', CardProps>
  | C<'tabs', TabsProps>
  | C<'accordion', AccordionProps>
  | C<'list', ListProps>
  | C<'modal', ModalProps>
  // Data Display
  | C<'stat', StatProps>
  | C<'table', TableProps>
  | C<'chart', ChartProps>
  // Input
  | C<'button', ButtonProps>
  | C<'text-field', TextFieldProps>
  | C<'select', SelectProps>
  | C<'checkbox', CheckboxProps>
  | C<'choice-picker', ChoicePickerProps>
  | C<'slider', SliderProps>
  | C<'date-time-input', DateTimeInputProps>
  // Media
  | C<'icon', IconProps>
  | C<'image', ImageProps>
  | C<'video', VideoProps>
  | C<'audio-player', AudioPlayerProps>
  | C<'text', TextProps>
  | C<'code', CodeProps>
  | C<'markdown', MarkdownProps>
  | C<'html', HtmlProps>
  | C<'divider'>
  | C<'spacer', SpacerProps>
  // Navigation
  | C<'header', HeaderProps>
  | C<'link', LinkProps>;

/** All known component type names */
export type ComponentType = TypedComponent['type'];

/** Extract props type for a given component type */
export type PropsOf<T extends ComponentType> = Extract<TypedComponent, { type: T }>['props'];
