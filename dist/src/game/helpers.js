"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEliminated = isEliminated;
exports.activeSeats = activeSeats;
exports.addLog = addLog;
exports.nameTag = nameTag;
exports.resolveNameTags = resolveNameTags;
exports.roleLabel = roleLabel;
const deck_1 = require("./deck");
function isEliminated(player) {
    return player.influence.length > 0 && player.influence.every((c) => c.revealed);
}
/** Seats still in the game, in seat order. */
function activeSeats(G) {
    return G.seatOrder.filter((id) => !isEliminated(G.players[id]));
}
function addLog(G, text) {
    G.log.push({ id: G.nextLogID++, text });
    if (G.log.length > 60)
        G.log.shift();
}
// Moves don't have reliable access to display names server-side (boardgame.io's
// Ctx doesn't expose matchData to move functions), so log text carries the
// playerID wrapped like this and the client resolves it to a real name at render
// time, once it's rendering with its own `matchData` prop. See GameLog.tsx.
function nameTag(id) {
    return `{{${id}}}`;
}
function resolveNameTags(text, names) {
    return text.replace(/\{\{([^}]+)\}\}/g, (_match, id) => names[id] ?? `Player ${Number(id) + 1}`);
}
function roleLabel(role) {
    return deck_1.ROLE_INFO[role].label;
}
