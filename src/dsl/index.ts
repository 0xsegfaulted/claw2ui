// Public API barrel — import { page, stat, chart, ... } from "claw2ui/dsl"

export { page } from './page';
export type { PageOptions } from './page';

export {
  // Layout
  container, row, column, card, list, modal,
  // Special containers
  tabs, tab, accordion, section,
  // Data display
  stat, chart, table,
  // Input
  button, textField, select, checkbox, choicePicker, slider, dateTimeInput,
  // Media
  markdown, text, code, html, icon, image, video, audioPlayer, divider, spacer,
  // Navigation
  header, link,
} from './components';

export { dataset, col, badge, months } from './helpers';
