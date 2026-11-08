import { createDigitValidator } from '../logic/createDigitValidator';

export const sanitizeInput = (value: string, base: number): string => {
  const isValidDigit = createDigitValidator(base);
  return Array.from(value)
    .map((ch) => ch.toLowerCase())
    .filter(isValidDigit)
    .join('');
};
