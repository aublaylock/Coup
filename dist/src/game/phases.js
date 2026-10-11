"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.playPhase = exports.lobbyPhase = void 0;
const helpers_1 = require("./helpers");
const moves_1 = require("./moves");
// ---------------------------------------------------------------------------
// Lobby Phase
// ---------------------------------------------------------------------------
// Players gather here after joining. Only the room owner (player "0") can act.
// startGame randomises seating, deals cards, and ends the phase.
exports.lobbyPhase = {
    start: true,
    moves: {
        startGame: { move: moves_1.startGame, client: false },
    },
    endIf: ({ G }) => (G.seatOrder.length > 0 ? true : undefined),
    next: 'play',
    turn: {
        order: {
            first: () => 0,
            next: () => 0,
        },
    },
};
// ---------------------------------------------------------------------------
// Play Phase
// ---------------------------------------------------------------------------
// One long-running phase covering the whole match. Each turn cycles through
// up to four stages:
//   declaring  — only the current player; picks an action.
//   reacting   — every other living player; pass / challenge / block.
//   revealing  — just whoever must give up an influence card.
//   exchanging — just the Ambassador, choosing which cards to keep.
//
// turn.endIf watches G.turnDone, which the moves in moves.ts set once the
// whole action/reaction/reveal cycle has fully resolved. This mirrors
// DalmutiWeb's `pendingNewTrick` / `roundOverDone` flag pattern rather than
// calling ctx.events.endTurn() directly from inside a move.
exports.playPhase = {
    start: false,
    onBegin: ({ G }) => {
        G.pending = null;
        G.reveal = null;
        G.exchange = null;
    },
    turn: {
        onBegin: ({ G, events }) => {
            G.turnDone = false;
            G.pending = null;
            events.setActivePlayers({ currentPlayer: 'declaring' });
        },
        endIf: ({ G }) => (G.turnDone ? true : undefined),
        order: {
            playOrder: ({ G }) => G.seatOrder,
            first: () => 0,
            // Skip eliminated seats when advancing to the next player.
            next: ({ G, ctx }) => {
                let next = (ctx.playOrderPos + 1) % ctx.playOrder.length;
                let attempts = 0;
                while ((0, helpers_1.isEliminated)(G.players[ctx.playOrder[next]]) && attempts < ctx.playOrder.length) {
                    next = (next + 1) % ctx.playOrder.length;
                    attempts++;
                }
                return next;
            },
        },
        stages: {
            declaring: {
                moves: {
                    income: { move: moves_1.income, client: false },
                    foreignAid: { move: moves_1.foreignAid, client: false },
                    tax: { move: moves_1.tax, client: false },
                    steal: { move: moves_1.steal, client: false },
                    assassinate: { move: moves_1.assassinate, client: false },
                    exchange: { move: moves_1.exchange, client: false },
                    coup: { move: moves_1.coup, client: false },
                },
            },
            reacting: {
                moves: {
                    respondPass: { move: moves_1.respondPass, client: false },
                    respondChallenge: { move: moves_1.respondChallenge, client: false },
                    respondBlock: { move: moves_1.respondBlock, client: false },
                },
            },
            revealing: {
                moves: {
                    revealInfluence: { move: moves_1.revealInfluence, client: false },
                },
            },
            exchanging: {
                moves: {
                    confirmExchange: { move: moves_1.confirmExchange, client: false },
                },
            },
        },
    },
};
