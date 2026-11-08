import {
  createRecord,
  sortRecords,
  addRecord,
  isBetter,
  serializeRecords,
  deserializeRecords,
  recordKey,
  MAX_RECORDS,
  type GameRecord,
} from '../src/state/records';

const makeRecord = (attempts: number, timeMs: number, length = 4, base = 10): GameRecord => ({
  attempts,
  timeMs,
  length,
  base,
  at: 0,
});

describe('records', () => {
  describe('createRecord', () => {
    it('builds a record with attempts, time, settings and timestamp', () => {
      const r = createRecord({ attempts: 5, timeMs: 12000 }, { length: 4, base: 10 }, 123);
      expect(r).toEqual({
        attempts: 5,
        timeMs: 12000,
        length: 4,
        base: 10,
        at: 123,
      });
    });
  });

  describe('isBetter', () => {
    it('fewer attempts is better', () => {
      expect(isBetter(makeRecord(3, 10000), makeRecord(5, 5000))).toBe(true);
      expect(isBetter(makeRecord(5, 5000), makeRecord(3, 10000))).toBe(false);
    });

    it('equal attempts → lower time is better', () => {
      expect(isBetter(makeRecord(3, 5000), makeRecord(3, 10000))).toBe(true);
      expect(isBetter(makeRecord(3, 10000), makeRecord(3, 5000))).toBe(false);
    });

    it('equal attempts and time → not better', () => {
      expect(isBetter(makeRecord(3, 5000), makeRecord(3, 5000))).toBe(false);
    });
  });

  describe('sortRecords', () => {
    it('sorts by attempts, then by time', () => {
      const records = [
        makeRecord(5, 1000),
        makeRecord(3, 9000),
        makeRecord(3, 5000),
        makeRecord(7, 2000),
      ];
      const sorted = sortRecords(records);
      expect(sorted.map((r) => [r.attempts, r.timeMs])).toEqual([
        [3, 5000],
        [3, 9000],
        [5, 1000],
        [7, 2000],
      ]);
    });

    it('does not mutate the input array', () => {
      const records = [makeRecord(5, 1000), makeRecord(3, 9000)];
      const snapshot = [...records];
      sortRecords(records);
      expect(records).toEqual(snapshot);
    });
  });

  describe('addRecord', () => {
    it('adds a record and sorts', () => {
      const initial = [makeRecord(5, 1000), makeRecord(7, 2000)];
      const result = addRecord(initial, makeRecord(3, 9000));
      expect(result.map((r) => r.attempts)).toEqual([3, 5, 7]);
    });

    it('does not mutate the input array', () => {
      const initial = [makeRecord(5, 1000)];
      const snapshot = [...initial];
      addRecord(initial, makeRecord(3, 9000));
      expect(initial).toEqual(snapshot);
    });

    it('caps the list at MAX_RECORDS', () => {
      const many = Array.from({ length: MAX_RECORDS + 3 }, (_, i) => makeRecord(10 + i, 1000));
      const result = addRecord(many, makeRecord(1, 1000));
      expect(result).toHaveLength(MAX_RECORDS);
    });

    it('keeps only the top MAX_RECORDS best results', () => {
      const many = Array.from({ length: MAX_RECORDS }, (_, i) => makeRecord(10 + i, 1000));
      const result = addRecord(many, makeRecord(1, 1000));
      expect(result[0]?.attempts).toBe(1);
      expect(result.at(-1)?.attempts).toBe(MAX_RECORDS + 8);
    });
  });

  describe('recordKey', () => {
    it('encodes length and base', () => {
      expect(recordKey({ length: 4, base: 10 })).toBe('bulls-and-cows:records:4:10');
    });
  });

  describe('serializeRecords / deserializeRecords', () => {
    it('roundtrips', () => {
      const records = [makeRecord(3, 5000), makeRecord(5, 1000)];
      const json = serializeRecords(records);
      expect(deserializeRecords(json)).toEqual(records);
    });

    it('serialize produces valid JSON string', () => {
      const json = serializeRecords([makeRecord(3, 5000)]);
      expect(() => JSON.parse(json)).not.toThrow();
    });

    it('deserialize returns [] for invalid JSON', () => {
      expect(deserializeRecords('not json')).toEqual([]);
    });

    it('deserialize returns [] for non-array JSON', () => {
      expect(deserializeRecords('{"a":1}')).toEqual([]);
    });

    it('deserialize filters out invalid entries', () => {
      const json = JSON.stringify([
        { attempts: 3, timeMs: 5000, length: 4, base: 10, at: 0 },
        { attempts: 'x' },
        { foo: 'bar' },
        null,
        { attempts: 2, timeMs: 100, length: 2, base: 2, at: 1 },
      ]);
      const result = deserializeRecords(json);
      expect(result).toHaveLength(2);
      expect(result[0]?.attempts).toBe(3);
      expect(result[1]?.attempts).toBe(2);
    });
  });
});
