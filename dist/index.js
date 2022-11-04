import { record2Query, record2EqualStr, extrasType2EqualStr, detectIsExtrasItem, } from "./helper";
import MobileDetect from "mobile-detect";
export function useScheme(scheme) {
    const { scheme: _scheme, host, path, query } = scheme;
    return `${_scheme}://${host}${path ?? ""}${record2Query(query ?? {})}`;
}
export function useIntent(intent) {
    const { HOST, scheme, packageName, browser_fallback_url, query, extras, ...rest } = intent;
    let uri = `intent://${HOST ?? ""}/${!!query ? record2Query(query) : ""}#Intent;scheme=${scheme};package=${packageName};`;
    uri += record2EqualStr(rest);
    if (!!extras) {
        Object.keys(extras).forEach((keyName) => {
            const value = extras[keyName];
            if (detectIsExtrasItem(value)) {
                uri += extrasType2EqualStr(keyName, value.value, value.type);
            }
            else {
                uri += extrasType2EqualStr(keyName, value);
            }
        });
    }
    if (!!browser_fallback_url)
        uri += extrasType2EqualStr("browser_fallback_url", browser_fallback_url);
    uri += "end";
    return uri;
}
export function useLink(link) {
    const { protocol, domain, path, query } = link;
    return `${protocol}://${domain}/${!!path ? (path.startsWith("/") ? path.slice(1) : path) : ""}${!!query ? record2Query(query) : ""}`;
}
export class CallAppBuilder {
    parallelInterval = 200;
    supportTablet = false;
    PcFallbackUrl;
    AndroidFallbackUrl;
    IosFallbackUrl;
    quene = [];
    isLeave = false;
    isMobile = false;
    isAndroid = false;
    isIOS = false;
    system;
    systemVersion;
    _fallback;
    constructor({ parallelInterval = 200, supportTablet = false, PcFallbackUrl, AndroidFallbackUrl, IosFallbackUrl, fallback, } = {}) {
        if (typeof window === "undefined")
            throw new Error("This method can only be used on browsers");
        const md = new MobileDetect(window.navigator.userAgent);
        this.parallelInterval = parallelInterval;
        this.supportTablet = supportTablet;
        this.PcFallbackUrl = PcFallbackUrl;
        this.AndroidFallbackUrl = AndroidFallbackUrl;
        this.IosFallbackUrl = IosFallbackUrl;
        this._fallback = fallback;
        const isMobile = md.mobile() !== null;
        const isTablet = md.tablet() !== null;
        this.isMobile = this.supportTablet ? isMobile || isTablet : isMobile;
        this.system = md.os();
        this.isIOS = this.system === "iOS";
        this.isAndroid = this.system === "AndroidOS";
        this.systemVersion = this.isAndroid
            ? md.version("Android")
            : md.version("Version");
        md.is;
        this.listenIsJump();
    }
    /**
     * No limit
     * @param scheme
     */
    setScheme(scheme) {
        this.quene.push(useScheme(scheme));
        return this;
    }
    /**
     * Android only
     * @param intent
     * @returns
     */
    setIntent(intent) {
        if (!this.isAndroid)
            return this;
        this.quene.push(useIntent(intent));
        return this;
    }
    /**
     * Ios 9+ and Https protocol
     * or Android 6+
     * @param link
     */
    setLink(link) {
        if (this.isIOS) {
            if (link.protocol !== "https") {
                return this;
            }
            if (!!this.systemVersion &&
                !isNaN(this.systemVersion) &&
                this.systemVersion < 9) {
                return this;
            }
        }
        if (this.isAndroid &&
            !!this.systemVersion &&
            !isNaN(this.systemVersion) &&
            this.systemVersion < 6) {
            return this;
        }
        this.quene.push(useLink(link));
        return this;
    }
    fallback() {
        if (this._fallback) {
            this._fallback();
            return;
        }
        if (!this.isMobile) {
            !!this.PcFallbackUrl && (window.location.href = this.PcFallbackUrl);
            return;
        }
        if (this.isAndroid) {
            !!this.AndroidFallbackUrl &&
                (window.location.href = this.AndroidFallbackUrl);
            return;
        }
        if (this.isIOS) {
            !!this.IosFallbackUrl && (window.location.href = this.IosFallbackUrl);
            return;
        }
    }
    build() {
        return () => {
            if (!this.isMobile) {
                this.fallback();
                return;
            }
            this.isLeave = false;
            this.walk();
        };
    }
    execute() {
        this.build()();
    }
    walk() {
        const uri = this.quene.shift();
        if (this.isLeave)
            return;
        if (!uri) {
            !this.isLeave && this.fallback();
            return;
        }
        try {
            window.location.href = uri;
        }
        catch (err) {
            console.error(err);
        }
        setTimeout(this.walk.bind(this), this.parallelInterval);
    }
    visibilitychange() {
        const state = document.visibilityState;
        if (state === "hidden") {
            this.isLeave = true;
        }
    }
    pageHide(event) {
        if (event.persisted) {
        }
        else {
            this.isLeave = true;
        }
    }
    listenIsJump() {
        document.addEventListener("visibilitychange", this.visibilitychange);
        window.addEventListener("pagehide", this.pageHide);
    }
}
export * from "./type";
//# sourceMappingURL=index.js.map