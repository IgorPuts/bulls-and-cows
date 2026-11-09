import {
  createInitialState,
  addAttempt,
  isWin,
  getAttemptsCount,
  getElapsedMs,
  type GameSettings,
  type Attempt,
} from '../src/state/gameState';

const settings = (length: number, base: number): GameSettings => ({ length, base });

describe('gameState', () => {
  describe('createInitialState', () => {
    it('creates a state with empty history and not started/won', () => {
      const state = createInitialState(settings(4, 10), 1_000);
      expect(state.settings).toEqual({ length: 4, base: 10 });
      expect(state.history).toEqual([]);
      expect(state.startedAt).toBe(1_000);
      expect(state.finishedAt).toBeNull();
      expect(state.status).toBe('playing');
    });

    it('does not mutate the settings object passed in', () => {
      const s = settings(4, 10);
      const state = createInitialState(s, 0);
      s.length = 2;
      expect(state.settings.length).toBe(4);
    });
  });

  describe('addAttempt', () => {
    const initial = createInitialState(settings(4, 10), 0);

    it('returns a NEW state object (no mutation)', () => {
      const next = addAttempt(initial, '1234', { bulls: 0, cows: 1 }, 100);
      expect(next).not.toBe(initial);
      expect(initial.history).toEqual([]);
      expect(next.history).toHaveLength(1);
    });

    it('appends the attempt immutably (new array each time)', () => {
      const a = addAttempt(initial, '1234', { bulls: 0, cows: 1 }, 100);
      const b = addAttempt(a, '5678', { bulls: 0, cows: 0 }, 200);

      expect(a.history).toHaveLength(1);
      expect(b.history).toHaveLength(2);
      expect(a.history).not.toBe(b.history);
      expect(b.history[1]).toEqual({
        guess: '5678',
        bulls: 0,
        cows: 0,
        at: 200,
      });
    });

    it('does not duplicate the same guess', () => {
      const a = addAttempt(initial, '1234', { bulls: 0, cows: 1 }, 100);
      const b = addAttempt(a, '1234', { bulls: 0, cows: 1 }, 200);
      expect(b).toBe(a);
      expect(b.history).toHaveLength(1);
    });

    it('marks the game as won when bulls === length', () => {
      const won = addAttempt(initial, '1234', { bulls: 4, cows: 0 }, 300);
      expect(won.status).toBe('won');
      expect(won.finishedAt).toBe(300);
    });

    it('does not append further attempts after the game is won', () => {
      const won = addAttempt(initial, '1234', { bulls: 4, cows: 0 }, 300);
      const after = addAttempt(won, '9999', { bulls: 0, cows: 0 }, 400);
      expect(after).toBe(won);
      expect(after.history).toHaveLength(1);
    });
  });

  describe('isWin', () => {
    it('true when the last attempt has bulls === settings.length', () => {
      const initial = createInitialState(settings(4, 10), 0);
      const won = addAttempt(initial, '1234', { bulls: 4, cows: 0 }, 100);
      expect(isWin(won)).toBe(true);
    });

    it('false initially', () => {
      expect(isWin(createInitialState(settings(4, 10), 0))).toBe(false);
    });
  });

  describe('getAttemptsCount', () => {
    it('0 for initial state', () => {
      expect(getAttemptsCount(createInitialState(settings(4, 10), 0))).toBe(0);
    });

    it('equals history length', () => {
      const s0 = createInitialState(settings(4, 10), 0);
      const s1 = addAttempt(s0, '1234', { bulls: 0, cows: 1 }, 100);
      const s2 = addAttempt(s1, '5678', { bulls: 0, cows: 0 }, 200);
      expect(getAttemptsCount(s2)).toBe(2);
    });
  });

  describe('getElapsedMs', () => {
    it('null while playing (unknown finish)', () => {
      expect(getElapsedMs(createInitialState(settings(4, 10), 0))).toBeNull();
    });

    it('difference between finishedAt and startedAt when won', () => {
      const s0 = createInitialState(settings(4, 10), 1_000);
      const won = addAttempt(s0, '1234', { bulls: 4, cows: 0 }, 6_500);
      expect(getElapsedMs(won)).toBe(5_500);
    });
  });

  describe('types', () => {
    it('Attempt has expected shape', () => {
      const a: Attempt = { guess: '1234', bulls: 1, cows: 2, at: 0 };
      expect(a.guess).toBe('1234');
      expect(a.bulls).toBe(1);
      expect(a.cows).toBe(2);
      expect(a.at).toBe(0);
    });
  });
});
