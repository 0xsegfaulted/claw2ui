/**
 * Start tunnel with auto-detection
 */
export declare function startTunnel(port: number): Promise<string>;
export declare function getPublicUrl(): string | null;
export declare function stopTunnel(): void;
