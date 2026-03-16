import type { PageData, PageMeta, SavePageOptions, SavePageResult } from './types';
/**
 * Save a page and return its ID
 */
export declare function savePage(html: string, meta?: SavePageOptions): SavePageResult;
/**
 * Get a page by ID
 * @param incrementViews - Whether to increment the view counter (default: true)
 */
export declare function getPage(id: string, incrementViews?: boolean): PageData | null;
/**
 * List all pages
 */
export declare function listPages(): Array<{
    id: string;
} & PageMeta>;
/**
 * Delete a page
 */
export declare function deletePage(id: string): boolean;
