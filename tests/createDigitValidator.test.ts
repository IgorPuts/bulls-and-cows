import { createDigitValidator } from '../src/logic/createDigitValidator';

describe('createDigitValidator', () => {
  describe('binary (base 2)', () => {
    const isValidBinDigit = createDigitValidator(2);

    it('accepts 0 and 1', () => {
      expect(isValidBinDigit('0')).toBe(true);
      expect(isValidBinDigit('1')).toBe(true);
    });

    it('rejects digits out of range', () => {
      expect(isValidBinDigit('2')).toBe(false);
      expect(isValidBinDigit('9')).toBe(false);
    });

    it('rejects letters', () => {
      expect(isValidBinDigit('a')).toBe(false);
      expect(isValidBinDigit('A')).toBe(false);
    });
  });

  describe('decimal (base 10)', () => {
    const isValidDecDigit = createDigitValidator(10);

    it('accepts 0-9', () => {
      for (const digit of '0123456789') {
        expect(isValidDecDigit(digit)).toBe(true);
      }
    });

    it('rejects letters', () => {
      expect(isValidDecDigit('a')).toBe(false);
      expect(isValidDecDigit('A')).toBe(false);
    });
  });

  describe('hex (base 16)', () => {
    const isValidHexDigit = createDigitValidator(16);

    it('accepts 0-9 and a-f in lowercase', () => {
      for (const digit of '0123456789abcdef') {
        expect(isValidHexDigit(digit)).toBe(true);
      }
    });

    it('accepts A-F in uppercase (case-insensitive)', () => {
      for (const digit of 'ABCDEF') {
        expect(isValidHexDigit(digit)).toBe(true);
      }
    });

    it('rejects letters beyond f/F', () => {
      expect(isValidHexDigit('g')).toBe(false);
      expect(isValidHexDigit('G')).toBe(false);
      expect(isValidHexDigit('z')).toBe(false);
    });
  });

  describe('octal (base 8)', () => {
    const isValidOctDigit = createDigitValidator(8);

    it('accepts 0-7', () => {
      for (const digit of '01234567') {
        expect(isValidOctDigit(digit)).toBe(true);
      }
    });

    it('rejects 8 and 9', () => {
      expect(isValidOctDigit('8')).toBe(false);
      expect(isValidOctDigit('9')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('rejects empty string', () => {
      const isValidDecDigit = createDigitValidator(10);
      expect(isValidDecDigit('')).toBe(false);
    });

    it('rejects multi-character strings', () => {
      const isValidDecDigit = createDigitValidator(10);
      expect(isValidDecDigit('12')).toBe(false);
      expect(isValidDecDigit('ab')).toBe(false);
    });

    it('rejects special characters', () => {
      const isValidDecDigit = createDigitValidator(10);
      expect(isValidDecDigit('-')).toBe(false);
      expect(isValidDecDigit('.')).toBe(false);
      expect(isValidDecDigit(' ')).toBe(false);
    });
  });
});
