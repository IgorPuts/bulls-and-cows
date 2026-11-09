export interface GameRecord {
  attempts: number;
  timeMs: number;
  length: number;
  base: number;
  at: number;
}

export interface RecordStats {
  attempts: number;
  timeMs: number;
}

export interface RecordSettings {
  length: number;
  base: number;
}

export const MAX_RECORDS = 10;

export const recordKey = ({ length, base }: RecordSettings): string =>
  `bulls-and-cows:records:${length}:${base}`;

export const createRecord = (
  stats: RecordStats,
  settings: RecordSettings,
  at: number
): GameRecord => ({
  attempts: stats.attempts,
  timeMs: stats.timeMs,
  length: settings.length,
  base: settings.base,
  at,
});

export const isBetter = (a: GameRecord, b: GameRecord): boolean => {
  if (a.attempts !== b.attempts) {
    return a.attempts < b.attempts;
  }
  return a.timeMs < b.timeMs;
};

export const sortRecords = (records: readonly GameRecord[]): GameRecord[] =>
  [...records].sort((x, y) => {
    if (x.attempts !== y.attempts) {
      return x.attempts - y.attempts;
    }
    return x.timeMs - y.timeMs;
  });

export const addRecord = (records: readonly GameRecord[], record: GameRecord): GameRecord[] =>
  sortRecords([...records, record]).slice(0, MAX_RECORDS);

export const serializeRecords = (records: readonly GameRecord[]): string => JSON.stringify(records);

const isGameRecord = (value: unknown): value is GameRecord => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const v = value as Record<string, unknown>;
  return (
    typeof v.attempts === 'number' &&
    typeof v.timeMs === 'number' &&
    typeof v.length === 'number' &&
    typeof v.base === 'number' &&
    typeof v.at === 'number'
  );
};

export const deserializeRecords = (json: string): GameRecord[] => {
  try {
    const parsed: unknown = JSON.parse(json);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isGameRecord);
  } catch {
    return [];
  }
};
