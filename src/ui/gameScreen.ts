import { evaluateGuess } from '../logic/evaluateGuess.js';
import { isValidGuess } from '../logic/isValidGuess.js';
import {
  addAttempt,
  getElapsedMs,
  isWin,
  type Attempt,
  type GameState,
} from '../state/gameState.js';
import { sanitizeInput } from './inputFilter.js';

export interface GameScreenHandlers {
  onStateChange: (state: GameState) => void;
  onWin: (state: GameState) => void;
  onNewGame: () => void;
}

export interface GameScreenContext {
  state: GameState;
  secret: string;
  handlers: GameScreenHandlers;
}

const el = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Partial<HTMLElementTagNameMap[K]> = {},
  children: (Node | string)[] = []
): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  Object.assign(node, props);
  for (const child of children) {
    node.append(child);
  }
  return node;
};

const formatMs = (ms: number): string => {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

export const renderGameScreen = (ctx: GameScreenContext): HTMLElement => {
  let state = ctx.state;
  const { secret, handlers } = ctx;
  const { length, base } = state.settings;

  const header = el('header', { className: 'game__header' }, [
    el('h2', { textContent: `Bulls and Cows (length ${length}, base ${base})` }),
  ]);

  const timer = el('output', { className: 'game__timer', textContent: '0:00' });

  const updateTimer = (): void => {
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

  const renderHistory = (history: readonly Attempt[]): void => {
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

  const actions = el('div', { className: 'game__actions' });

  const submitBtn = el('button', {
    type: 'button',
    className: 'game__submit',
    textContent: 'Check',
    id: 'check-btn',
  });

  const newGameBtn = el('button', {
    type: 'button',
    className: 'game__new',
    textContent: 'New game',
  });
  newGameBtn.addEventListener('click', handlers.onNewGame);

  const disableInputs = (): void => {
    submitBtn.disabled = true;
    input.disabled = true;
    clearInterval(timerInterval);
  };

  const finishWin = (wonState: GameState): void => {
    const ms = getElapsedMs(wonState) ?? 0;
    status.textContent = `You won! Attempts: ${wonState.history.length}, time: ${formatMs(ms)}.`;
    disableInputs();
    if (!actions.contains(newGameBtn)) {
      actions.append(newGameBtn);
    }
    handlers.onWin(wonState);
  };

  const submit = (): void => {
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
    actions.append(newGameBtn);
  }

  const container = el('section', { className: 'game' }, [
    header,
    timer,
    el('label', { htmlFor: 'guess-input', textContent: `Enter ${length} digits: ` }),
    inputRow,
    error,
    status,
    actions,
    el('h3', { textContent: 'History' }),
    historyList,
  ]);

  return container;
};
