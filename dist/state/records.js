export const MAX_RECORDS = 10;
export const recordKey = ({ length, base }) => `bulls-and-cows:records:${length}:${base}`;
export const createRecord = (stats, settings, at) => ({
    attempts: stats.attempts,
    timeMs: stats.timeMs,
    length: settings.length,
    base: settings.base,
    at,
});
export const isBetter = (a, b) => {
    if (a.attempts !== b.attempts) {
        return a.attempts < b.attempts;
    }
    return a.timeMs < b.timeMs;
};
export const sortRecords = (records) => [...records].sort((x, y) => {
    if (x.attempts !== y.attempts) {
        return x.attempts - y.attempts;
    }
    return x.timeMs - y.timeMs;
});
export const addRecord = (records, record) => sortRecords([...records, record]).slice(0, MAX_RECORDS);
export const serializeRecords = (records) => JSON.stringify(records);
const isGameRecord = (value) => {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    const v = value;
    return (typeof v.attempts === 'number' &&
        typeof v.timeMs === 'number' &&
        typeof v.length === 'number' &&
        typeof v.base === 'number' &&
        typeof v.at === 'number');
};
export const deserializeRecords = (json) => {
    try {
        const parsed = JSON.parse(json);
        if (!Array.isArray(parsed)) {
            return [];
        }
        return parsed.filter(isGameRecord);
    }
    catch {
        return [];
    }
};
//# sourceMappingURL=records.js.map