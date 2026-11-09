import { addRecord, deserializeRecords, recordKey, serializeRecords, } from './records.js';
const safeGetItem = (key) => {
    try {
        return globalThis.localStorage?.getItem(key) ?? null;
    }
    catch {
        return null;
    }
};
const safeSetItem = (key, value) => {
    try {
        globalThis.localStorage?.setItem(key, value);
    }
    catch {
        // localStorage may be unavailable (private mode, quota) — fail silently
    }
};
export const loadRecords = (settings) => {
    const json = safeGetItem(recordKey(settings));
    return json === null ? [] : deserializeRecords(json);
};
export const saveRecord = (record) => {
    const settings = { length: record.length, base: record.base };
    const current = loadRecords(settings);
    const next = addRecord(current, record);
    safeSetItem(recordKey(settings), serializeRecords(next));
    return next;
};
//# sourceMappingURL=recordsStorage.js.map