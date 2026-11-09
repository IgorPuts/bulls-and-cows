const memo = new Map();
let computeCount = 0;
const key = (length, base) => `${length}:${base}`;
const compute = (length, base) => {
    computeCount += 1;
    if (length < 0) {
        return 0;
    }
    if (length === 0) {
        return 1;
    }
    if (length > base) {
        return 0;
    }
    return base * compute(length - 1, base - 1);
};
export const countPossibleSecrets = (length, base) => {
    const k = key(length, base);
    const cached = memo.get(k);
    if (cached !== undefined) {
        return cached;
    }
    const result = compute(length, base);
    memo.set(k, result);
    return result;
};
export const __clearMemoCache = () => {
    memo.clear();
    computeCount = 0;
};
export const __getComputeCount = () => computeCount;
//# sourceMappingURL=countPossibleSecrets.js.map