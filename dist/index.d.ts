import type { Scehme, Intent, Link, CallAppBuilderConstuctParams } from "./type";
export declare function useScheme(scheme: Scehme): string;
export declare function useIntent(intent: Intent): string;
export declare function useLink(link: Link): string;
export declare class CallAppBuilder {
    private parallelInterval;
    private supportTablet;
    private PcFallbackUrl?;
    private AndroidFallbackUrl?;
    private IosFallbackUrl?;
    private quene;
    private isLeave;
    isMobile: boolean;
    isAndroid: boolean;
    isIOS: boolean;
    system?: string;
    systemVersion?: number;
    _fallback?: () => void;
    constructor({ parallelInterval, supportTablet, PcFallbackUrl, AndroidFallbackUrl, IosFallbackUrl, fallback, }?: CallAppBuilderConstuctParams);
    /**
     * No limit
     * @param scheme
     */
    setScheme(scheme: Scehme): this;
    /**
     * Android only
     * @param intent
     * @returns
     */
    setIntent(intent: Intent): this;
    /**
     * Ios 9+ and Https protocol
     * or Android 6+
     * @param link
     */
    setLink(link: Link): this;
    fallback(): void;
    build(): () => void;
    execute(): void;
    private walk;
    private visibilitychange;
    private pageHide;
    private listenIsJump;
}
export * from "./type";
