import type { Component, PageSpec, PlatformMessage, DeliveryResult } from '../types';
/**
 * Format a page spec as a Telegram HTML message
 */
export declare function formatMessage(spec: PageSpec | null, url: string): PlatformMessage;
/**
 * Format raw HTML page as a simple Telegram message
 */
export declare function formatRawMessage(title: string, url: string): PlatformMessage;
/**
 * Deliver a message via Telegram Bot API (sendMessage)
 */
export declare function deliver(botToken: string, chatId: string, message: PlatformMessage, proxy: string | null): Promise<DeliveryResult>;
export declare function flattenComponents(components: Component[]): Component[];
export declare function specSummary(spec: PageSpec | null): string;
