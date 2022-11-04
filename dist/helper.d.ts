import { Query, ExtrasItem, IntentExtrasType } from "./type";
export declare function record2Query(record: Query, nested?: boolean): string;
export declare function record2EqualStr(record: Record<string, string>): string;
export declare function extrasType2EqualStr(name: string, value: string | number | boolean, valueType?: IntentExtrasType): string;
export declare function detectIsExtrasItem(item: any): item is ExtrasItem;
export declare function isBaseType(obj: any): obj is string | boolean | number;
