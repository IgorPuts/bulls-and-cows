import { sanitizeInput } from '../src/ui/inputFilter';

describe('sanitizeInput', () => {
  describe('decimal (base 10)', () => {
    it('keeps valid digits', () => {
      expect(sanitizeInput('1234', 10)).toBe('1234');
    });

    it('drops letters', () => {
      expect(sanitizeInput('12a4', 10)).toBe('124');
      expect(sanitizeInput('abcd', 10)).toBe('');
    });

    it('drops special characters', () => {
      expect(sanitizeInput('1-2.3 4', 10)).toBe('1234');
    });

    it('keeps leading zero', () => {
      expect(sanitizeInput('0123', 10)).toBe('0123');
    });
  });

  describe('binary (base 2)', () => {
    it('keeps only 0 and 1', () => {
      expect(sanitizeInput('0123456', 2)).toBe('01');
      expect(sanitizeInput('2', 2)).toBe('');
    });
  });

  describe('octal (base 8)', () => {
    it('keeps 0-7, drops 8 and 9', () => {
      expect(sanitizeInput('012789', 8)).toBe('0127');
    });
  });

  describe('hex (base 16)', () => {
    it('keeps 0-9 and a-f', () => {
      expect(sanitizeInput('0123456789abcdef', 16)).toBe('0123456789abcdef');
    });

    it('keeps uppercase A-F (case preserved? or lowercased?)', () => {
      // we lowercase, because evaluateGuess compares case-insensitively
      expect(sanitizeInput('ABCDEF', 16)).toBe('abcdef');
    });

    it('drops letters beyond f/F', () => {
      expect(sanitizeInput('xyzg', 16)).toBe('');
      expect(sanitizeInput('aBcDeG', 16)).toBe('abcde');
    });

    it('mixed valid and invalid', () => {
      expect(sanitizeInput('aB12zz', 16)).toBe('ab12');
    });
  });

  describe('empty and edge cases', () => {
    it('empty string → empty string', () => {
      expect(sanitizeInput('', 10)).toBe('');
    });

    it('all invalid → empty string', () => {
      expect(sanitizeInput('!!!', 10)).toBe('');
      expect(sanitizeInput('abc', 2)).toBe('');
    });
  });
});
