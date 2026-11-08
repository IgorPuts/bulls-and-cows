import { createDigitValidator } from './createDigitValidator';

export const isValidGuess = (guess: string, length: number, base: number): boolean => {
  if (guess.length !== length) {
    return false;
  }

  const isValidDigit = createDigitValidator(base);
  const normalized = guess.toLowerCase().split('');

  const allValid = normalized.every(isValidDigit);
  if (!allValid) {
    return false;
  }

  const uniqueCount = new Set(normalized).size;
  return uniqueCount === length;
};
