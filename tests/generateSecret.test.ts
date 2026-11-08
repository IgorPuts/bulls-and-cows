import { generateSecret } from '../src/logic/generateSecret';

describe('generateSecret', () => {
  describe('basic properties', () => {
    it('returns a string of the requested length', () => {
      const secret = generateSecret(4, 10, () => 0);
      expect(secret).toHaveLength(4);
    });

    it('returns unique digits', () => {
      const secret = generateSecret(4, 10, () => 0.5);
      expect(new Set(secret).size).toBe(4);
    });

    it('uses only digits valid for the given base', () => {
      const secret = generateSecret(2, 2, () => 0);
      for (const ch of secret) {
        expect(['0', '1']).toContain(ch);
      }
    });

    it('works for hex (digits 0-f)', () => {
      const secret = generateSecret(6, 16, () => 0.5);
      expect(secret).toMatch(/^[0-9a-f]{6}$/);
    });
  });

  describe('deterministic with injected random', () => {
    it('always returns "0123" when random is () => 0', () => {
      expect(generateSecret(4, 10, () => 0)).toBe('0123');
    });

    it('produces the same result for the same deterministic random', () => {
      const random = () => 0.42;
      const a = generateSecret(4, 10, random);
      const b = generateSecret(4, 10, random);
      expect(a).toBe(b);
    });

    it('picks last available digit when random is () => 0.999', () => {
      expect(generateSecret(4, 10, () => 0.999)).toBe('9876');
    });

    it('allows leading zero (secret can start with 0)', () => {
      const secret = generateSecret(4, 10, () => 0);
      expect(secret[0]).toBe('0');
    });

    it('respects exact length with binary', () => {
      const secret = generateSecret(2, 2, () => 0);
      expect(secret).toBe('01');
    });
  });

  describe('random is called the expected number of times', () => {
    it('calls random exactly `length` times', () => {
      let calls = 0;
      const random = () => {
        calls += 1;
        return 0;
      };
      generateSecret(4, 10, random);
      expect(calls).toBe(4);
    });
  });

  describe('default random parameter', () => {
    it('works without passing random (uses Math.random)', () => {
      const secret = generateSecret(4, 10);
      expect(secret).toHaveLength(4);
      expect(new Set(secret).size).toBe(4);
    });
  });

  describe('edge: length 1', () => {
    it('returns a single valid digit', () => {
      const secret = generateSecret(1, 10, () => 0);
      expect(secret).toHaveLength(1);
      expect('0123456789').toContain(secret);
    });
  });

  describe('invalid arguments', () => {
    it('throws when length > base (impossible request)', () => {
      expect(() => generateSecret(3, 2, () => 0)).toThrow();
    });
  });
});
