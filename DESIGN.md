# Design — Bulls and Cows

## Data structures and algorithms

### Game state

`src/state/gameState.ts`

```ts
interface GameState {
  settings: GameSettings; // { length, base } — immutable copy of the round's settings
  history: readonly Attempt[]; // append-only list of attempts
  startedAt: number;
  finishedAt: number | null;
  status: 'playing' | 'won';
}
```

**Why this shape:**

- `history` is a **`readonly Attempt[]`** (append-only array). Each `addAttempt` returns a **new** array via `[...history, entry]` instead of `push`. This keeps every previous state value valid and makes it trivial to snapshot, compare, or render history without defensive copying. An array (not a linked list) is the right choice here: history is small (a few dozen entries max), and we need to render it sequentially and count its length in O(1).
- `status` is a **single source of truth** for the win condition. Instead of recomputing `history.at(-1).bulls === length` in every component, `addAttempt` sets `status = 'won'` and `finishedAt` once, and `isWin` is a cheap boolean check.
- `startedAt` / `finishedAt` are **timestamps**, not durations. Duration is computed on read by `getElapsedMs`. This means a round "in progress" can be re-rendered at any time and the timer just reads the current time — no accumulator to keep in sync.
- `settings` is **copied** in `createInitialState` (`{ length, base }`), so later mutation of the original options object cannot affect an in-flight round. This enforces the rule "settings cannot change after the round starts".

### Records

`src/state/records.ts`

```ts
interface GameRecord {
  attempts;
  timeMs;
  length;
  base;
  at;
}
```

The `localStorage` key is `bulls-and-cows:records:${length}:${base}` — one table per `(length, base)` combination. This is the first of the two options allowed by the task ("separate table per combination"). It keeps each table meaningful (comparing 3 guesses in binary to 3 guesses in hex is meaningless) and lets us cap each table independently.

Sorting is by `(attempts asc, timeMs asc)`, capped at `MAX_RECORDS = 10`. `sortRecords` copies the array before sorting (`[...records].sort(...)`), and `addRecord` builds a new array and slices it — no mutation of the caller's data.

`deserializeRecords` never throws: it wraps `JSON.parse` in `try/catch`, returns `[]` for invalid JSON or non-array JSON, and filters out entries that don't match the `GameRecord` shape. The rest of the code can trust its return type.

### `evaluateGuess` — bulls and cows

`src/logic/evaluateGuess.ts`

```ts
const bulls = guessDigits.reduce((n, d, i) => (d === secretDigits[i] ? n + 1 : n), 0);

const nonBullSecret = secretDigits.filter((d, i) => d !== guessDigits[i]);
const nonBullGuess = guessDigits.filter((d, i) => d !== secretDigits[i]);
const remaining = new Set(nonBullSecret);
const cows = nonBullGuess.filter((d) => remaining.has(d)).length;
```

The key subtlety: **a digit that is already counted as a bull must not be counted as a cow again**. So we first compute bulls, then drop the bull positions from both strings, then check presence of the remaining guess digits in the set of remaining secret digits. The `Set` makes each cow check O(1); the whole function is **O(n)** for length `n`.

All operations are `reduce` / `filter` / `Set` — no manual `for` loops with counters.

### `countPossibleSecrets` — permutation count

`src/logic/countPossibleSecrets.ts`

The number of distinct secrets is the number of permutations of `length` distinct digits chosen from `base`:

```
P(base, length) = base! / (base - length)!
```

Computed **recursively**:

```
count(0,   base) = 1
count(len, base) = base * count(len - 1, base - 1)   for len > 0
count(len, base) = 0                                 for len > base
```

The recursion matches the combinatorial identity: pick one of `base` digits for the first position, then pick from the remaining `base − 1` for the next, and so on. Leading zero is allowed (a secret may start with `0`), so no extra subtraction for "zero in the first position".

The result is **memoized** in a `Map<string, number>` keyed by `${length}:${base}`. `countPossibleSecrets` is called every time the settings screen opens, and again on each base/length change, so the cache avoids recomputing the same factorial-ratio many times. Test-only hooks `__clearMemoCache` and `__getComputeCount` let the test suite verify that a second call for the same `(length, base)` does not trigger the recursive `compute` again.

## Big O

Let `n = length`, `b = base`.

- **`generateSecret(length, base, random)`** — **O(n · b)** time, **O(b)** space.
  Builds a pool of `b` digits, then `n` times picks one index (O(1)), removes it from the pool (O(b) per step via `filter`), and recurses. Total: `n` steps × `O(b)` per step = `O(n · b)`. For the task's bounds (b ≤ 16, n ≤ 6) this is trivially small. Could be optimized to `O(n)` by swapping with the last element, but the array-copy approach keeps the function pure and the pool immutable, which is more valuable here than micro-optimizing a 6-element array.

- **`evaluateGuess(secret, guess)`** — **O(n)** time, **O(n)** space.
  One `reduce` for bulls (O(n)), two `filter`s (O(n) each), one `Set` build (O(n)), one `filter` with `Set.has` (O(n) total because each `has` is O(1)). Strings are fixed-length (`n`), and `n ≤ 6`.

- **`isValidGuess(guess, length, base)`** — **O(n)** time, **O(n)** space.
  Length check is O(1), `every` over the normalized guess is O(n), building a `Set` for uniqueness is O(n). Each digit check via `createDigitValidator` is O(1) (`parseInt` on a single character). Total O(n).

- **`countPossibleSecrets(length, base)`** — **O(n)** on cache miss, **O(1)** on cache hit; **O(n)** space for the memo map.
  The recursive `compute` runs `n` times (decrements `length` by 1 each step), with O(1) work per call. The memo map holds one entry per distinct `(length, base)` pair — at most `5 × 4 = 20` entries for the task's settings (length 2–6, base ∈ {2, 8, 10, 16}). Every subsequent call for the same pair is O(1).

## Clean code principles

Applied concretely in this project:

- **Single Responsibility** — `src/state/gameState.ts` owns game state only; `src/state/records.ts` owns records sorting and serialization only; `src/state/recordsStorage.ts` is the only file that touches `localStorage`. `src/ui/*` files own DOM and nothing else.
- **Pure functions separated from side effects** — all logic in `src/logic/` and `src/state/` (except `recordsStorage.ts`) is pure: no `Date.now()`, no `Math.random()`, no DOM, no `localStorage`. Side effects are injected or isolated:
  - `generateSecret` takes `random` as a parameter (`src/logic/generateSecret.ts`) — this is what makes it testable.
  - `recordsStorage.ts` wraps `localStorage` in `safeGetItem` / `safeSetItem` with `try/catch`, so the rest of the code never deals with storage errors.
- **Immutability** — `addAttempt` returns a new state with a new history (`[...history, entry]`) instead of mutating. `sortRecords` copies before sorting. `addRecord` copies before inserting. `createInitialState` copies `settings`. No `push`, `splice`, or direct property mutation on shared objects.
- **Meaningful names** — `isValidGuess`, `evaluateGuess`, `isWin`, `getElapsedMs`, `addAttempt`, `recordKey`, `safeGetItem`. Function names describe what they return / do, not how.
- **Small functions** — `createDigitValidator` is a one-liner factory. `isLengthAvailable`, `availableLengths`, `isValidSettings` in `src/ui/settingsLogic.ts` are each a few lines. `evaluateGuess` is ~10 lines.
- **Avoiding magic numbers** — `MAX_RECORDS`, `LENGTHS`, `BASES`, `recordKey` prefix are named constants, not inline literals. `src/state/records.ts`, `src/ui/settingsLogic.ts`.
- **No duplicated logic** — `createDigitValidator` is the single source of truth for "is this a valid digit in base X", used by both `isValidGuess` (attempt validation) and `sanitizeInput` (real-time input filtering).
- **Error handling at the boundary** — `deserializeRecords` (`src/state/records.ts`) never throws: it `try/catch`es `JSON.parse`, returns `[]` on invalid JSON, and filters out non-record entries. The rest of the code can trust its return type.
- **No DOM in logic, no logic in DOM** — `src/ui/gameScreen.ts` does not compute bulls/cows; it calls `evaluateGuess` and `addAttempt`. `src/logic/*` imports nothing from `src/ui/*`.

## Functional programming techniques used

- **Currying** — `createDigitValidator(base)(char)` (`src/logic/createDigitValidator.ts`).
- **Higher-order functions** — `evaluateGuess` uses `reduce` / `filter` / `Set` (`src/logic/evaluateGuess.ts`); `sanitizeInput` uses `Array.from(...).map(...).filter(...).join('')` (`src/ui/inputFilter.ts`).
- **Recursion** — `generateSecret` uses a recursive `pick` helper (`src/logic/generateSecret.ts`); `countPossibleSecrets` uses a recursive `compute` (`src/logic/countPossibleSecrets.ts`).
- **Memoization** — `countPossibleSecrets` caches results in a `Map` keyed by `${length}:${base}` (`src/logic/countPossibleSecrets.ts`).
- **Dependency injection** — `generateSecret(length, base, random = Math.random)` (`src/logic/generateSecret.ts`).
- **Immutability** — `addAttempt`, `sortRecords`, `addRecord`, `createInitialState` (`src/state/*`).
