import {
  BASES,
  LENGTHS,
  availableLengths,
  isLengthAvailable,
  isValidSettings,
  describeBase,
} from '../src/ui/settingsLogic';

describe('settingsLogic', () => {
  describe('BASES', () => {
    it('exposes bin/oct/dec/hex', () => {
      expect(BASES.map((b) => b.value)).toEqual([2, 8, 10, 16]);
      expect(BASES.map((b) => b.label)).toEqual(['bin', 'oct', 'dec', 'hex']);
    });
  });

  describe('LENGTHS', () => {
    it('exposes 2..6', () => {
      expect(LENGTHS).toEqual([2, 3, 4, 5, 6]);
    });
  });

  describe('availableLengths', () => {
    it('binary allows only 2', () => {
      expect(availableLengths(2)).toEqual([2]);
    });

    it('octal allows 2..6', () => {
      expect(availableLengths(8)).toEqual([2, 3, 4, 5, 6]);
    });

    it('decimal and hex allow 2..6', () => {
      expect(availableLengths(10)).toEqual([2, 3, 4, 5, 6]);
      expect(availableLengths(16)).toEqual([2, 3, 4, 5, 6]);
    });
  });

  describe('isLengthAvailable', () => {
    it('2 in binary: true', () => {
      expect(isLengthAvailable(2, 2)).toBe(true);
    });

    it('3+ in binary: false', () => {
      expect(isLengthAvailable(3, 2)).toBe(false);
      expect(isLengthAvailable(4, 2)).toBe(false);
      expect(isLengthAvailable(6, 2)).toBe(false);
    });

    it('all 2..6 in octal: true', () => {
      for (const len of LENGTHS) {
        expect(isLengthAvailable(len, 8)).toBe(true);
      }
    });
  });

  describe('isValidSettings', () => {
    it('valid: length in 2..6, base in {2,8,10,16}, length <= base', () => {
      expect(isValidSettings({ length: 4, base: 10 })).toBe(true);
      expect(isValidSettings({ length: 2, base: 2 })).toBe(true);
      expect(isValidSettings({ length: 6, base: 16 })).toBe(true);
    });

    it('invalid: length out of range', () => {
      expect(isValidSettings({ length: 1, base: 10 })).toBe(false);
      expect(isValidSettings({ length: 7, base: 10 })).toBe(false);
    });

    it('invalid: base not in set', () => {
      expect(isValidSettings({ length: 4, base: 3 })).toBe(false);
      expect(isValidSettings({ length: 4, base: 12 })).toBe(false);
    });

    it('invalid: binary with length > 2', () => {
      expect(isValidSettings({ length: 3, base: 2 })).toBe(false);
      expect(isValidSettings({ length: 4, base: 2 })).toBe(false);
    });
  });

  describe('describeBase', () => {
    it('returns human-readable label', () => {
      expect(describeBase(2)).toBe('bin (2)');
      expect(describeBase(10)).toBe('dec (10)');
      expect(describeBase(16)).toBe('hex (16)');
    });
  });
});
