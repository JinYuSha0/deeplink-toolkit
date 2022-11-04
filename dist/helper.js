import { IntentExtrasType } from "./type";
export function record2Query(record, nested) {
    const keys = Object.keys(record);
    if (keys.length === 0)
        return "";
    let result = !nested ? "?" : "";
    Object.keys(record).forEach((keyName, index) => {
        const value = record[keyName];
        if (!!value) {
            result += `${index > 0 ? (!nested ? "&" : "%26") : ""}${keyName}${!nested ? "=" : "%3D"}${isBaseType(value)
                ? encodeURIComponent(value)
                : record2Query(value, true)}`;
        }
    });
    return result;
}
export function record2EqualStr(record) {
    const keys = Object.keys(record);
    if (keys.length === 0)
        return "";
    let result = "";
    Object.keys(record).forEach((keyName) => {
        if (!!record[keyName]) {
            result += `${keyName}=${encodeURIComponent(record[keyName])};`;
        }
    });
    return result;
}
export function extrasType2EqualStr(name, value, valueType) {
    const type = typeof value;
    let startWith = valueType;
    if (!valueType) {
        switch (type) {
            case "string":
                startWith = IntentExtrasType.String;
                break;
            case "boolean":
                startWith = IntentExtrasType.Boolean;
                break;
            case "number":
                if (!!~String(value).indexOf(".")) {
                    startWith = IntentExtrasType.Float;
                }
                else {
                    startWith = IntentExtrasType.Interge;
                }
                break;
        }
    }
    return `${startWith + "." + name}=${value};`;
}
export function detectIsExtrasItem(item) {
    return !!item && !!item.type;
}
export function isBaseType(obj) {
    const type = typeof obj;
    return type === "string" || type === "boolean" || type === "number";
}
//# sourceMappingURL=helper.js.map