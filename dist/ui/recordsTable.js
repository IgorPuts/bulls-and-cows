import { loadRecords } from '../state/recordsStorage.js';
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
export const renderRecordsTable = ({ settings, title }) => {
    const records = loadRecords(settings);
    const table = el('table', { className: 'records' });
    const thead = el('thead', {}, [
        el('tr', {}, [
            el('th', { textContent: '#' }),
            el('th', { textContent: 'Attempts' }),
            el('th', { textContent: 'Time' }),
            el('th', { textContent: 'When' }),
        ]),
    ]);
    const tbody = el('tbody');
    if (records.length === 0) {
        tbody.append(el('tr', {}, [
            el('td', {
                colSpan: 4,
                className: 'records__empty',
                textContent: 'No records yet. Play a round to set one!',
            }),
        ]));
    }
    else {
        records.forEach((record, index) => {
            tbody.append(el('tr', {}, [
                el('td', { textContent: String(index + 1) }),
                el('td', { textContent: String(record.attempts) }),
                el('td', { textContent: formatMs(record.timeMs) }),
                el('td', { textContent: new Date(record.at).toLocaleString() }),
            ]));
        });
    }
    table.append(thead, tbody);
    const heading = title ?? `Records for length ${settings.length}, base ${settings.base}`;
    return el('section', { className: 'records-section' }, [
        el('h3', { textContent: heading }),
        table,
    ]);
};
//# sourceMappingURL=recordsTable.js.map