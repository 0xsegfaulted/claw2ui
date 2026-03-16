import type { PageSpec, PlatformMessage, DeliveryResult, DeliveryOverrides, PlatformInfo } from '../types';
export declare function formatForPlatform(platform: string, spec: PageSpec | null, url: string, title?: string): PlatformMessage | null;
export declare function deliverToPlatform(platform: string, message: PlatformMessage, overrides?: DeliveryOverrides): Promise<DeliveryResult>;
export declare function listPlatforms(): PlatformInfo[];
export declare function formatForAll(spec: PageSpec | null, url: string, title?: string): Record<string, PlatformMessage>;
