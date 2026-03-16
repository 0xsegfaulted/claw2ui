export interface Component {
    type: string;
    props?: Record<string, any>;
    children?: Component[];
}
export interface PageSpec {
    title?: string;
    theme?: 'light' | 'dark' | 'auto';
    components: Component[];
}
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
export interface DeliveryResult {
    success: boolean;
    messageId?: number;
    chatId?: number;
    error?: string;
}
export interface DeliveryOverrides {
    botToken?: string;
    chatId?: string;
    proxy?: string;
    platform?: string;
}
export interface PlatformConfig {
    botToken: string | null;
    chatId: string | null;
    proxy: string | null;
}
export interface Config {
    platforms: {
        telegram: PlatformConfig;
        [key: string]: PlatformConfig;
    };
}
export interface PlatformInfo {
    id: string;
    name: string;
    configured: boolean;
}
export interface ColumnDef {
    key: string;
    label?: string;
    format?: 'currency' | 'percent' | 'badge';
    badgeMap?: Record<string, string>;
}
