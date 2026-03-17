// === Component Spec Types ===

export interface Component {
  type: string;
  props?: Record<string, any>;
  children?: Component[];
}

// Re-export typed component interfaces for type-safe spec construction
export type {
  TypedComponent, ComponentType, PropsOf,
  StatProps, ChartProps, ChartType, TableProps,
  ButtonProps, ButtonVariant, TextFieldProps,
  SelectProps, SelectOption, CheckboxProps,
  ChoicePickerProps, SliderProps, DateTimeInputProps,
  ContainerProps, RowProps, ColumnProps, CardProps,
  TabsProps, TabItem, AccordionProps, AccordionItem,
  ListProps, ModalProps,
  IconProps, ImageProps, VideoProps, AudioPlayerProps,
  TextProps, CodeProps, MarkdownProps, HtmlProps, SpacerProps,
  HeaderProps, LinkProps,
} from './components/types';

export interface PageSpec {
  title?: string;
  theme?: 'light' | 'dark' | 'auto';
  /** Visual style / theme name. See src/themes/ for available themes. */
  style?: string;
  components: Component[];
}

// === Store Types ===

export interface PageMeta {
  title: string;
  type: string;
  createdAt: number;
  ttl: number;
  views: number;
  [key: string]: any;
}

export interface PageData {
  id: string;
  html: string;
  spec: PageSpec | null;
  meta: PageMeta;
}

export interface SavePageOptions {
  title?: string;
  type?: string;
  ttl?: number;
  spec?: PageSpec | null;
  [key: string]: any;
}

export interface SavePageResult {
  id: string;
  meta: PageMeta;
}

// === Platform Types (format-only, no delivery) ===

export interface PlatformMessage {
  text: string;
  parse_mode: string;
  reply_markup?: InlineKeyboardMarkup;
}

export interface InlineKeyboardMarkup {
  inline_keyboard: InlineKeyboardButton[][];
}

export interface InlineKeyboardButton {
  text: string;
  url?: string;
  callback_data?: string;
}

// === Table Column Types ===

export interface ColumnDef {
  key: string;
  label?: string;
  format?: 'currency' | 'percent' | 'badge';
  badgeMap?: Record<string, string>;
}
