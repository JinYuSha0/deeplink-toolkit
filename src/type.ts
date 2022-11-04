export enum IntentExtrasType {
  String = "S",
  Boolean = "B",
  Byte = "b",
  Character = "c",
  Double = "b",
  Float = "f",
  Interge = "i",
  Long = "l",
  Short = "s",
}

export type Query = Record<
  string,
  number | boolean | string | Record<string, string>
>;

export interface Scehme {
  scheme: string;
  host: string;
  path?: string;
  query?: Query;
}

export interface Intent {
  packageName: string;
  scheme: string;
  HOST?: string;
  action?: string;
  category?: string;
  component?: string;
  query?: Query;
  browser_fallback_url?: string;
  extras?: Record<string, ExtrasItem | string | number | boolean>;
}

export type ExtrasItem = { type: IntentExtrasType; value: any };

export interface Link {
  protocol: "http" | "https";
  domain: string;
  path?: string;
  query?: Query;
}

export type CallAppBuilderConstuctParams =
  | {
      timeout?: number;
      parallelInterval?: number;
      PcFallbackUrl?: string;
      AndroidFallbackUrl?: string;
      IosFallbackUrl?: string;
      supportTablet?: boolean;
      fallback?: () => void;
    }
  | undefined;
