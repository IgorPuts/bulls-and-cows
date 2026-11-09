import { generateSecret } from './logic/generateSecret.js';
import { createInitialState } from './state/gameState.js';
import { createRecord } from './state/records.js';
import { saveRecord } from './state/recordsStorage.js';
import { renderGameScreen } from './ui/gameScreen.js';
import { renderRecordsTable } from './ui/recordsTable.js';
import { renderSettingsScreen } from './ui/settingsScreen.js';
const root = document.createElement('div');
root.id = 'app';
document.body.append(root);
const render = (node) => {
    root.replaceChildren(node);
};
const showSettings = () => {
    const screen = renderSettingsScreen({
        onStart: (settings) => {
            const secret = generateSecret(settings.length, settings.base);
            const state = createInitialState(settings, Date.now());
            showGame(state, secret);
        },
    });
    render(screen);
};
const showGame = (state, secret) => {
    const screen = renderGameScreen({
        state,
        secret,
        handlers: {
            onStateChange: () => { },
            onWin: (wonState) => {
                const elapsed = wonState.finishedAt !== null ? wonState.finishedAt - wonState.startedAt : 0;
                const record = createRecord({ attempts: wonState.history.length, timeMs: elapsed }, wonState.settings, Date.now());
                saveRecord(record);
            },
            onNewGame: () => {
                showSettings();
            },
        },
    });
    render(screen);
    const recordsTable = renderRecordsTable({ settings: state.settings });
    root.append(recordsTable);
};
showSettings();
//# sourceMappingURL=main.js.map