export const generateSecret = (length, base, random = Math.random) => {
    if (length > base) {
        throw new Error(`generateSecret: length (${length}) cannot exceed base (${base})`);
    }
    const pool = Array.from({ length: base }, (_, i) => i.toString(36));
    const pick = (remaining, count, acc) => {
        if (count === 0) {
            return acc;
        }
        const index = Math.floor(random() * remaining.length);
        const digit = remaining[index];
        const rest = remaining.filter((_, i) => i !== index);
        return pick(rest, count - 1, acc + digit);
    };
    return pick(pool, length, '');
};
//# sourceMappingURL=generateSecret.js.map