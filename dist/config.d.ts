import type { Config, PlatformConfig } from './types';
export declare function getConfig(): Config;
export declare function getPlatformConfig(platform: string): PlatformConfig | null;
export declare function resetConfig(): void;
