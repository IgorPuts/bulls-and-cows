export const createDigitValidator = (base) => (char) => {
    if (char.length !== 1) {
        return false;
    }
    const normalized = char.toLowerCase();
    const code = parseInt(normalized, 36);
    return !Number.isNaN(code) && code >= 0 && code < base;
};
//# sourceMappingURL=createDigitValidator.js.map