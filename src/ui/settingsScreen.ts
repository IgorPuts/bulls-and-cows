import { countPossibleSecrets } from '../logic/countPossibleSecrets';
import {
  BASES,
  LENGTHS,
  availableLengths,
  isLengthAvailable,
  type BaseOption,
} from './settingsLogic';

export interface Settings {
  length: number;
  base: number;
}

export interface SettingsScreenHandlers {
  onStart: (settings: Settings) => void;
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

export const renderSettingsScreen = (handlers: SettingsScreenHandlers): HTMLElement => {
  const baseSelect = el('select', { id: 'base-select', className: 'settings__base' });
  for (const option of BASES as readonly BaseOption[]) {
    baseSelect.append(el('option', { value: String(option.value), textContent: option.label }));
  }
  baseSelect.value = '10';

  const lengthSelect = el('select', { id: 'length-select', className: 'settings__length' });

  const rebuildLengths = (): void => {
    const base = Number(baseSelect.value);
    lengthSelect.replaceChildren();
    for (const length of LENGTHS) {
      const option = el('option', {
        value: String(length),
        textContent: String(length),
      });
      if (!isLengthAvailable(length, base)) {
        option.disabled = true;
      }
      lengthSelect.append(option);
    }
    const allowed = availableLengths(base);
    const current = Number(lengthSelect.value);
    if (!allowed.includes(current)) {
      lengthSelect.value = String(allowed[0]);
    }
  };

  const variantsOut = el('output', { id: 'variants-out', className: 'settings__variants' });

  const refreshVariants = (): void => {
    const base = Number(baseSelect.value);
    const length = Number(lengthSelect.value);
    variantsOut.textContent = `Possible secrets: ${countPossibleSecrets(length, base)}`;
  };

  baseSelect.addEventListener('change', () => {
    rebuildLengths();
    refreshVariants();
  });
  lengthSelect.addEventListener('change', refreshVariants);

  const startBtn = el('button', {
    type: 'button',
    id: 'start-btn',
    textContent: 'Start',
    className: 'settings__start',
  });

  startBtn.addEventListener('click', () => {
    handlers.onStart({
      length: Number(lengthSelect.value),
      base: Number(baseSelect.value),
    });
  });

  rebuildLengths();
  refreshVariants();

  const form = el('div', { className: 'settings' }, [
    el('h1', { textContent: 'Bulls and Cows' }),
    el('label', { htmlFor: 'base-select', textContent: 'Base: ' }),
    baseSelect,
    el('label', { htmlFor: 'length-select', textContent: 'Length: ' }),
    lengthSelect,
    variantsOut,
    startBtn,
  ]);

  return form;
};
