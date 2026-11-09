import { createDigitValidator } from '../logic/createDigitValidator.js';
export const sanitizeInput = (value, base) => {
    const isValidDigit = createDigitValidator(base);
    return Array.from(value)
        .map((ch) => ch.toLowerCase())
        .filter(isValidDigit)
        .join('');
};
//# sourceMappingURL=inputFilter.js.map