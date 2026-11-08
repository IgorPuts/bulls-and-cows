import { countPossibleSecrets, __clearMemoCache } from '../src/logic/countPossibleSecrets';

describe('countPossibleSecrets', () => {
  beforeEach(() => {
    __clearMemoCache();
  });

  describe('base cases', () => {
    it('length 0 → 1 (one empty secret)', () => {
      expect(countPossibleSecrets(0, 2)).toBe(1);
      expect(countPossibleSecrets(0, 10)).toBe(1);
      expect(countPossibleSecrets(0, 16)).toBe(1);
    });

    it('length 1 → base (each digit is a possible secret)', () => {
      expect(countPossibleSecrets(1, 2)).toBe(2);
      expect(countPossibleSecrets(1, 8)).toBe(8);
      expect(countPossibleSecrets(1, 10)).toBe(10);
      expect(countPossibleSecrets(1, 16)).toBe(16);
    });
  });

  describe('full permutations P(base, length)', () => {
    it('binary: P(2, 2) = 2 (01 and 10, leading zero allowed)', () => {
      expect(countPossibleSecrets(2, 2)).toBe(2);
    });

    it('decimal: P(10, 3) = 720', () => {
      expect(countPossibleSecrets(3, 10)).toBe(720);
    });

    it('decimal: P(10, 4) = 5040', () => {
      expect(countPossibleSecrets(4, 10)).toBe(5040);
    });

    it('hex: P(16, 4) = 43680', () => {
      expect(countPossibleSecrets(4, 16)).toBe(43680);
    });

    it('hex: P(16, 6) = 5765760', () => {
      expect(countPossibleSecrets(6, 16)).toBe(5765760);
    });

    it('octal: P(8, 4) = 1680', () => {
      expect(countPossibleSecrets(4, 8)).toBe(1680);
    });

    it('full length equals base: P(n, n) = n!', () => {
      expect(countPossibleSecrets(2, 2)).toBe(2);
      expect(countPossibleSecrets(3, 3)).toBe(6);
      expect(countPossibleSecrets(4, 4)).toBe(24);
      expect(countPossibleSecrets(5, 5)).toBe(120);
    });
  });

  describe('all length/base combinations from the UI (2..6, bin/oct/dec/hex)', () => {
    it('binary allows only length 2', () => {
      expect(countPossibleSecrets(2, 2)).toBe(2);
    });

    it('octal: lengths 2..6', () => {
      expect(countPossibleSecrets(2, 8)).toBe(56);
      expect(countPossibleSecrets(3, 8)).toBe(336);
      expect(countPossibleSecrets(4, 8)).toBe(1680);
      expect(countPossibleSecrets(5, 8)).toBe(6720);
      expect(countPossibleSecrets(6, 8)).toBe(20160);
    });

    it('decimal: lengths 2..6', () => {
      expect(countPossibleSecrets(2, 10)).toBe(90);
      expect(countPossibleSecrets(3, 10)).toBe(720);
      expect(countPossibleSecrets(4, 10)).toBe(5040);
      expect(countPossibleSecrets(5, 10)).toBe(30240);
      expect(countPossibleSecrets(6, 10)).toBe(151200);
    });

    it('hex: lengths 2..6', () => {
      expect(countPossibleSecrets(2, 16)).toBe(240);
      expect(countPossibleSecrets(3, 16)).toBe(3360);
      expect(countPossibleSecrets(4, 16)).toBe(43680);
      expect(countPossibleSecrets(5, 16)).toBe(524160);
      expect(countPossibleSecrets(6, 16)).toBe(5765760);
    });
  });

  describe('memoization', () => {
    it('returns the same value on repeated calls', () => {
      const first = countPossibleSecrets(4, 10);
      const second = countPossibleSecrets(4, 10);
      const third = countPossibleSecrets(4, 10);
      expect(first).toBe(720 * 7);
      expect(second).toBe(first);
      expect(third).toBe(first);
    });

    it('does not recompute (spy on internal call count)', () => {
      const { __getComputeCount } = jest.requireActual<
        typeof import('../src/logic/countPossibleSecrets')
      >('../src/logic/countPossibleSecrets');
      __clearMemoCache();
      countPossibleSecrets(6, 16);
      const afterFirst = __getComputeCount();
      countPossibleSecrets(6, 16);
      const afterSecond = __getComputeCount();
      expect(afterFirst).toBeGreaterThan(0);
      expect(afterSecond).toBe(afterFirst);
    });
  });

  describe('invalid arguments', () => {
    it('returns 0 when length > base (impossible)', () => {
      expect(countPossibleSecrets(3, 2)).toBe(0);
      expect(countPossibleSecrets(10, 8)).toBe(0);
    });

    it('returns 0 for negative length', () => {
      expect(countPossibleSecrets(-1, 10)).toBe(0);
    });
  });
});
