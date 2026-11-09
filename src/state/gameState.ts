import type { GuessResult } from '../logic/evaluateGuess.js';

export interface GameSettings {
  length: number;
  base: number;
}

export interface Attempt {
  guess: string;
  bulls: number;
  cows: number;
  at: number;
}

export type GameStatus = 'playing' | 'won';

export interface GameState {
  settings: GameSettings;
  history: readonly Attempt[];
  startedAt: number;
  finishedAt: number | null;
  status: GameStatus;
}

export const createInitialState = (settings: GameSettings, startedAt: number): GameState => ({
  settings: { length: settings.length, base: settings.base },
  history: [],
  startedAt,
  finishedAt: null,
  status: 'playing',
});

export const addAttempt = (
  state: GameState,
  guess: string,
  result: GuessResult,
  at: number
): GameState => {
  if (state.status === 'won') {
    return state;
  }

  const normalizedGuess = guess.toLowerCase();
  const alreadyTried = state.history.some(
    (attempt) => attempt.guess.toLowerCase() === normalizedGuess
  );
  if (alreadyTried) {
    return state;
  }

  const entry: Attempt = {
    guess: normalizedGuess,
    bulls: result.bulls,
    cows: result.cows,
    at,
  };

  const history = [...state.history, entry];
  const won = entry.bulls === state.settings.length;

  return {
    ...state,
    history,
    status: won ? 'won' : 'playing',
    finishedAt: won ? at : state.finishedAt,
  };
};

export const isWin = (state: GameState): boolean => state.status === 'won';

export const getAttemptsCount = (state: GameState): number => state.history.length;

export const getElapsedMs = (state: GameState): number | null =>
  state.finishedAt === null ? null : state.finishedAt - state.startedAt;
