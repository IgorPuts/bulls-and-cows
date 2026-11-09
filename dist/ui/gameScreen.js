import { evaluateGuess } from '../logic/evaluateGuess.js';
import { isValidGuess } from '../logic/isValidGuess.js';
import { addAttempt, getElapsedMs, isWin, } from '../state/gameState.js';
import { sanitizeInput } from './inputFilter.js';
const el = (tag, props = {}, children = []) => {
    const node = document.createElement(tag);
    Object.assign(node, props);
    for (const child of children) {
        node.append(child);
    }
    return node;
};
const formatMs = (ms) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
};
export const renderGameScreen = (ctx) => {
    let state = ctx.state;
    const { secret, handlers } = ctx;
    const { length, base } = state.settings;
    const newGameBtn = el('button', {
        type: 'button',
        className: 'game__new',
        textContent: 'New game',
    });
    newGameBtn.addEventListener('click', handlers.onNewGame);
    const header = el('header', { className: 'game__header' }, [
        el('h2', { textContent: `Bulls and Cows (length ${length}, base ${base})` }),
        newGameBtn,
    ]);
    const timer = el('output', { className: 'game__timer', textContent: '0:00' });
    const updateTimer = () => {
        const elapsed = getElapsedMs(state) ?? Date.now() - state.startedAt;
        timer.textContent = formatMs(elapsed);
    };
    const timerInterval = window.setInterval(updateTimer, 250);
    updateTimer();
    const input = el('input', {
        type: 'text',
        inputMode: 'text',
        autocomplete: 'off',
        maxLength: length,
        className: 'game__input',
        id: 'guess-input',
    });
    input.addEventListener('input', () => {
        const clean = sanitizeInput(input.value, base);
        if (clean !== input.value) {
            input.value = clean;
        }
    });
    const error = el('div', { className: 'game__error', role: 'alert' });
    const historyList = el('ol', { className: 'game__history' });
    const renderHistory = (history) => {
        historyList.replaceChildren();
        for (const attempt of history) {
            const item = el('li', { className: 'game__history-item' }, [
                el('span', { className: 'game__guess', textContent: attempt.guess }),
                el('span', {
                    className: 'game__result',
                    textContent: ` — bulls: ${attempt.bulls}, cows: ${attempt.cows}`,
                }),
            ]);
            historyList.append(item);
        }
    };
    renderHistory(state.history);
    const status = el('div', { className: 'game__status' });
    const submitBtn = el('button', {
        type: 'button',
        className: 'game__submit',
        textContent: 'Check',
        id: 'check-btn',
    });
    const disableInputs = () => {
        submitBtn.disabled = true;
        input.disabled = true;
        clearInterval(timerInterval);
    };
    const finishWin = (wonState) => {
        const ms = getElapsedMs(wonState) ?? 0;
        status.textContent = `You won! Attempts: ${wonState.history.length}, time: ${formatMs(ms)}.`;
        disableInputs();
        handlers.onWin(wonState);
    };
    const submit = () => {
        if (isWin(state)) {
            return;
        }
        const guess = input.value;
        error.textContent = '';
        if (!isValidGuess(guess, length, base)) {
            error.textContent = `Invalid guess: must be ${length} unique digits valid for base ${base}.`;
            return;
        }
        const result = evaluateGuess(secret, guess);
        const next = addAttempt(state, guess, result, Date.now());
        state = next;
        renderHistory(next.history);
        input.value = '';
        handlers.onStateChange(next);
        if (isWin(next)) {
            finishWin(next);
        }
    };
    submitBtn.addEventListener('click', submit);
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            submit();
        }
    });
    const inputRow = el('div', { className: 'game__input-row' }, [input, submitBtn]);
    if (isWin(state)) {
        const ms = getElapsedMs(state) ?? 0;
        status.textContent = `You won! Attempts: ${state.history.length}, time: ${formatMs(ms)}.`;
        disableInputs();
    }
    const container = el('section', { className: 'game' }, [
        header,
        timer,
        el('label', { htmlFor: 'guess-input', textContent: `Enter ${length} digits: ` }),
        inputRow,
        error,
        status,
        el('h3', { textContent: 'History' }),
        historyList,
    ]);
    return container;
};
//# sourceMappingURL=gameScreen.js.map