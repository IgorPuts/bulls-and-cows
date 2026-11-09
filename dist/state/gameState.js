export const createInitialState = (settings, startedAt) => ({
    settings: { length: settings.length, base: settings.base },
    history: [],
    startedAt,
    finishedAt: null,
    status: 'playing',
});
export const addAttempt = (state, guess, result, at) => {
    if (state.status === 'won') {
        return state;
    }
    const normalizedGuess = guess.toLowerCase();
    const alreadyTried = state.history.some((attempt) => attempt.guess.toLowerCase() === normalizedGuess);
    if (alreadyTried) {
        return state;
    }
    const entry = {
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
export const isWin = (state) => state.status === 'won';
export const getAttemptsCount = (state) => state.history.length;
export const getElapsedMs = (state) => state.finishedAt === null ? null : state.finishedAt - state.startedAt;
//# sourceMappingURL=gameState.js.map