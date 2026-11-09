export const BASES = [
    { value: 2, label: 'bin' },
    { value: 8, label: 'oct' },
    { value: 10, label: 'dec' },
    { value: 16, label: 'hex' },
];
export const LENGTHS = [2, 3, 4, 5, 6];
export const availableLengths = (base) => LENGTHS.filter((length) => length <= base);
export const isLengthAvailable = (length, base) => length <= base;
export const isValidSettings = (settings) => {
    const { length, base } = settings;
    if (!LENGTHS.includes(length)) {
        return false;
    }
    if (!BASES.some((b) => b.value === base)) {
        return false;
    }
    return isLengthAvailable(length, base);
};
export const describeBase = (base) => {
    const option = BASES.find((b) => b.value === base);
    return option ? `${option.label} (${base})` : String(base);
};
//# sourceMappingURL=settingsLogic.js.map