export interface BaseOption {
  value: number;
  label: 'bin' | 'oct' | 'dec' | 'hex';
}

export const BASES: readonly BaseOption[] = [
  { value: 2, label: 'bin' },
  { value: 8, label: 'oct' },
  { value: 10, label: 'dec' },
  { value: 16, label: 'hex' },
] as const;

export const LENGTHS: readonly number[] = [2, 3, 4, 5, 6] as const;

export const availableLengths = (base: number): number[] =>
  LENGTHS.filter((length) => length <= base);

export const isLengthAvailable = (length: number, base: number): boolean => length <= base;

export const isValidSettings = (settings: { length: number; base: number }): boolean => {
  const { length, base } = settings;
  if (!LENGTHS.includes(length)) {
    return false;
  }
  if (!BASES.some((b) => b.value === base)) {
    return false;
  }
  return isLengthAvailable(length, base);
};

export const describeBase = (base: number): string => {
  const option = BASES.find((b) => b.value === base);
  return option ? `${option.label} (${base})` : String(base);
};
