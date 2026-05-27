// Log en memoria de los últimos eventos del webhook (máx 100).
// Se usa para diagnóstico desde el dashboard sin necesidad de ver logs de consola.

const MAX = 100;
const entries = [];

const push = (type, data) => {
    entries.push({ type, ts: new Date().toISOString(), ...data });
    if (entries.length > MAX) entries.shift();
};

const getAll = () => [...entries].reverse(); // más reciente primero

module.exports = { push, getAll };
