import {
  record2Query,
  record2EqualStr,
  extrasType2EqualStr,
  detectIsExtrasItem,
} from "./helper";
import type {
  Scehme,
  Intent,
  Link,
  CallAppBuilderConstuctParams,
} from "./type";
import MobileDetect from "mobile-detect";

export function useScheme(scheme: Scehme) {
  const { scheme: _scheme, host, path, query } = scheme;
  return `${_scheme}://${host}${path ?? ""}${record2Query(query ?? {})}`;
}

export function useIntent(intent: Intent) {
  const {
    HOST,
    scheme,
    packageName,
    browser_fallback_url,
    query,
    extras,
    ...rest
  } = intent;
  let uri = `intent://${HOST ?? ""}/${
    !!query ? record2Query(query) : ""
  }#Intent;scheme=${scheme};package=${packageName};`;
  uri += record2EqualStr(rest);
  if (!!extras) {
    Object.keys(extras).forEach((keyName) => {
      const value = extras[keyName];
      if (detectIsExtrasItem(value)) {
        uri += extrasType2EqualStr(keyName, value.value, value.type);
      } else {
        uri += extrasType2EqualStr(keyName, value);
      }
    });
  }
  if (!!browser_fallback_url)
    uri += extrasType2EqualStr("browser_fallback_url", browser_fallback_url);
  uri += "end";
  return uri;
}

export function useLink(link: Link) {
  const { protocol, domain, path, query } = link;
  return `${protocol}://${domain}/${
    !!path ? (path.startsWith("/") ? path.slice(1) : path) : ""
  }${!!query ? record2Query(query) : ""}`;
}

export class CallAppBuilder {
  private parallelInterval: number = 200;
  private supportTablet: boolean = false;
  private PcFallbackUrl?: string;
  private AndroidFallbackUrl?: string;
  private IosFallbackUrl?: string;
  private quene: string[] = [];
  private isLeave: boolean = false;
  private _fallback?: () => void;
  private onEnd?: () => void;

  public isMobile: boolean = false;
  public isAndroid: boolean = false;
  public isIOS: boolean = false;
  public system?: string;
  public systemVersion?: number;

  constructor({
    parallelInterval = 500,
    supportTablet = false,
    PcFallbackUrl,
    AndroidFallbackUrl,
    IosFallbackUrl,
  }: CallAppBuilderConstuctParams = {}) {
    if (typeof window === "undefined")
      throw new Error("This method can only be used on browsers");
    const md = new MobileDetect(window.navigator.userAgent);
    this.parallelInterval = parallelInterval;
    this.supportTablet = supportTablet;
    this.PcFallbackUrl = PcFallbackUrl;
    this.AndroidFallbackUrl = AndroidFallbackUrl;
    this.IosFallbackUrl = IosFallbackUrl;

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
  setScheme(scheme: Scehme) {
    this.quene.push(useScheme(scheme));
    return this;
  }

  /**
   * Android only
   * @param intent
   * @returns
   */
  setIntent(intent: Intent) {
    if (!this.isAndroid) return this;
    this.quene.push(useIntent(intent));
    return this;
  }

  /**
   * Ios 9+ and Https protocol
   * or Android 6+
   * @param link
   */
  setLink(link: Link) {
    if (this.isIOS) {
      if (link.protocol !== "https") {
        return this;
      }
      if (
        !!this.systemVersion &&
        !isNaN(this.systemVersion) &&
        this.systemVersion < 9
      ) {
        return this;
      }
    }

    if (
      this.isAndroid &&
      !!this.systemVersion &&
      !isNaN(this.systemVersion) &&
      this.systemVersion < 6
    ) {
      return this;
    }

    this.quene.push(useLink(link));
    return this;
  }

  setFallback(fallback: () => void) {
    this._fallback = fallback;
    return this;
  }

  setEnd(onEnd: () => void) {
    this.onEnd = onEnd;
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

  private walk() {
    const uri = this.quene.shift();
    if (this.isLeave) {
      this.onEnd?.();
      return;
    }
    if (!uri) {
      this.fallback();
      return;
    }
    try {
      window.location.href = uri;
    } catch (err) {
      console.error(err);
    }
    setTimeout(this.walk.bind(this), this.parallelInterval);
  }

  private visibilitychange() {
    const state = document.visibilityState;
    if (state === "hidden") {
      this.isLeave = true;
    }
  }

  private pageHide(event: any) {
    if (event.persisted) {
    } else {
      this.isLeave = true;
    }
  }

  private listenIsJump() {
    document.addEventListener(
      "visibilitychange",
      this.visibilitychange.bind(this)
    );
    window.addEventListener("pagehide", this.pageHide.bind(this));
  }
}

export * from "./type";
