const memo = new Map<string, number>();

let computeCount = 0;

const key = (length: number, base: number): string => `${length}:${base}`;

const compute = (length: number, base: number): number => {
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

export const countPossibleSecrets = (length: number, base: number): number => {
  const k = key(length, base);
  const cached = memo.get(k);
  if (cached !== undefined) {
    return cached;
  }

  const result = compute(length, base);
  memo.set(k, result);
  return result;
};

export const __clearMemoCache = (): void => {
  memo.clear();
  computeCount = 0;
};

export const __getComputeCount = (): number => computeCount;
