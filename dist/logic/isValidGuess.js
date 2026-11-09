import { createDigitValidator } from './createDigitValidator.js';
export const isValidGuess = (guess, length, base) => {
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
//# sourceMappingURL=isValidGuess.js.map