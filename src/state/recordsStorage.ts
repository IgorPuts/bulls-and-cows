import {
  addRecord,
  deserializeRecords,
  recordKey,
  serializeRecords,
  type GameRecord,
  type RecordSettings,
} from './records.js';

const safeGetItem = (key: string): string | null => {
  try {
    return globalThis.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
};

const safeSetItem = (key: string, value: string): void => {
  try {
    globalThis.localStorage?.setItem(key, value);
  } catch {
    // localStorage may be unavailable (private mode, quota) — fail silently
  }
};

export const loadRecords = (settings: RecordSettings): GameRecord[] => {
  const json = safeGetItem(recordKey(settings));
  return json === null ? [] : deserializeRecords(json);
};

export const saveRecord = (record: GameRecord): GameRecord[] => {
  const settings: RecordSettings = { length: record.length, base: record.base };
  const current = loadRecords(settings);
  const next = addRecord(current, record);
  safeSetItem(recordKey(settings), serializeRecords(next));
  return next;
};
