import { evaluateGuess } from '../src/logic/evaluateGuess';

describe('evaluateGuess', () => {
  describe('exact matches (bulls)', () => {
    it('all bulls when guess equals secret', () => {
      expect(evaluateGuess('1234', '1234')).toEqual({ bulls: 4, cows: 0 });
    });

    it('one bull, rest unmatched', () => {
      expect(evaluateGuess('1234', '1567')).toEqual({ bulls: 1, cows: 0 });
    });

    it('bulls at different positions', () => {
      expect(evaluateGuess('0123', '0567')).toEqual({ bulls: 1, cows: 0 });
    });
  });

  describe('wrong position only (cows)', () => {
    it('all cows when digits are permuted', () => {
      expect(evaluateGuess('1234', '4321')).toEqual({ bulls: 0, cows: 4 });
    });

    it('single cow', () => {
      expect(evaluateGuess('1234', '5671')).toEqual({ bulls: 0, cows: 1 });
    });
  });

  describe('mixed bulls and cows', () => {
    it('two bulls and two cows', () => {
      // secret 1234, guess 1243: 1 and 2 in place (bulls), 3 and 4 swapped (cows)
      expect(evaluateGuess('1234', '1243')).toEqual({ bulls: 2, cows: 2 });
    });

    it('one bull and one cow', () => {
      // secret 1234, guess 1562: 1 in place (bull), 2 present but wrong pos (cow)
      expect(evaluateGuess('1234', '1562')).toEqual({ bulls: 1, cows: 1 });
    });

    it('classic 1 bull + 2 cows', () => {
      // secret 1234, guess 1325: 1 bull (1), 2 cows (3 and 2)
      expect(evaluateGuess('1234', '1325')).toEqual({ bulls: 1, cows: 2 });
    });
  });

  describe('no matches', () => {
    it('zero bulls and cows when no digits overlap', () => {
      expect(evaluateGuess('1234', '5678')).toEqual({ bulls: 0, cows: 0 });
    });
  });

  describe('leading zeros', () => {
    it('handles secrets starting with 0', () => {
      expect(evaluateGuess('0123', '0123')).toEqual({ bulls: 4, cows: 0 });
      expect(evaluateGuess('0123', '0213')).toEqual({ bulls: 2, cows: 2 });
    });
  });

  describe('hex (case-insensitive)', () => {
    it('treats a and A as the same digit', () => {
      // secret abcd, guess ABCD → all bulls
      expect(evaluateGuess('abcd', 'ABCD')).toEqual({ bulls: 4, cows: 0 });
    });

    it('mixed case bulls and cows', () => {
      // secret aBcD, guess AbCd → all bulls (case-insensitive)
      expect(evaluateGuess('aBcD', 'AbCd')).toEqual({ bulls: 4, cows: 0 });
    });

    it('cows with mixed case', () => {
      // secret abcd, guess dcba → all cows
      expect(evaluateGuess('abcd', 'DCBA')).toEqual({ bulls: 0, cows: 4 });
    });
  });

  describe('binary (base 2)', () => {
    it('length 2, reversed', () => {
      expect(evaluateGuess('01', '10')).toEqual({ bulls: 0, cows: 2 });
    });

    it('length 2, equal', () => {
      expect(evaluateGuess('01', '01')).toEqual({ bulls: 2, cows: 0 });
    });
  });
});
