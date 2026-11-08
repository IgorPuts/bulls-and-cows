import { isValidGuess } from '../src/logic/isValidGuess';

describe('isValidGuess', () => {
  describe('length check', () => {
    it('returns false for wrong length (shorter)', () => {
      expect(isValidGuess('12', 4, 10)).toBe(false);
    });

    it('returns false for wrong length (longer)', () => {
      expect(isValidGuess('12345', 4, 10)).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isValidGuess('', 4, 10)).toBe(false);
    });

    it('returns true for exact length', () => {
      expect(isValidGuess('1234', 4, 10)).toBe(true);
    });
  });

  describe('digit validity', () => {
    it('rejects digits out of base range', () => {
      expect(isValidGuess('2', 1, 2)).toBe(false); // base 2, digit 2 invalid
      expect(isValidGuess('8', 1, 8)).toBe(false); // base 8, digit 8 invalid
    });

    it('rejects letters for decimal', () => {
      expect(isValidGuess('12a4', 4, 10)).toBe(false);
    });

    it('accepts hex letters case-insensitively', () => {
      expect(isValidGuess('aBcD', 4, 16)).toBe(true);
      expect(isValidGuess('ABCD', 4, 16)).toBe(true);
      expect(isValidGuess('abcd', 4, 16)).toBe(true);
    });

    it('accepts leading zero (secrets can start with 0)', () => {
      expect(isValidGuess('0123', 4, 10)).toBe(true);
    });
  });

  describe('uniqueness', () => {
    it('rejects repeated digits', () => {
      expect(isValidGuess('1123', 4, 10)).toBe(false);
      expect(isValidGuess('0000', 4, 10)).toBe(false);
    });

    it('accepts all-unique digits', () => {
      expect(isValidGuess('0123', 4, 10)).toBe(true);
      expect(isValidGuess('9876', 4, 10)).toBe(true);
    });

    it('treats a and A as the same digit (hex case-insensitive uniqueness)', () => {
      expect(isValidGuess('aA12', 4, 16)).toBe(false);
      expect(isValidGuess('aB12', 4, 16)).toBe(true);
    });
  });

  describe('valid combinations across bases', () => {
    it('binary: only 0 and 1, length 2', () => {
      expect(isValidGuess('01', 2, 2)).toBe(true);
      expect(isValidGuess('10', 2, 2)).toBe(true);
      expect(isValidGuess('00', 2, 2)).toBe(false);
      expect(isValidGuess('11', 2, 2)).toBe(false);
      expect(isValidGuess('02', 2, 2)).toBe(false);
    });

    it('octal: 0-7, length 4', () => {
      expect(isValidGuess('0123', 4, 8)).toBe(true);
      expect(isValidGuess('0128', 4, 8)).toBe(false);
    });

    it('hex: full range, length 6', () => {
      expect(isValidGuess('aBcDeF', 6, 16)).toBe(true);
      expect(isValidGuess('aBcDeG', 6, 16)).toBe(false);
    });
  });
});
