export const generateSecret = (
  length: number,
  base: number,
  random: () => number = Math.random
): string => {
  if (length > base) {
    throw new Error(`generateSecret: length (${length}) cannot exceed base (${base})`);
  }

  const pool: string[] = Array.from({ length: base }, (_, i) => i.toString(36));

  const pick = (remaining: string[], count: number, acc: string): string => {
    if (count === 0) {
      return acc;
    }

    const index = Math.floor(random() * remaining.length);
    const digit = remaining[index] as string;
    const rest = remaining.filter((_, i) => i !== index);

    return pick(rest, count - 1, acc + digit);
  };

  return pick(pool, length, '');
};
