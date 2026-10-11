"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoupGame = void 0;
const phases_1 = require("./phases");
const helpers_1 = require("./helpers");
exports.CoupGame = {
    name: 'coup',
    // Official rules call for 3-6; 2 works mechanically with the standard
    // deck, just isn't the "official" balance, so it's allowed here for testing.
    minPlayers: 2,
    maxPlayers: 6,
    setup: ({ ctx }) => {
        const players = {};
        for (let i = 0; i < ctx.numPlayers; i++) {
            players[String(i)] = { name: `Player ${i + 1}`, coins: 0, influence: [] };
        }
        return {
            players,
            deck: [],
            seatOrder: [],
            pending: null,
            callouts: {},
            reveal: null,
            exchange: null,
            log: [],
            turnDone: false,
            nextLogID: 0,
        };
    },
    // Hide opponents' unrevealed influence and the Court deck's contents.
    playerView: ({ G, playerID }) => {
        if (playerID === null) {
            // Spectator: hide everything unrevealed.
            playerID = '__none__';
        }
        const players = {};
        for (const [id, p] of Object.entries(G.players)) {
            players[id] =
                id === playerID
                    ? p
                    : {
                        ...p,
                        influence: p.influence.map((c) => (c.revealed ? c : { role: 'hidden', revealed: false })),
                    };
        }
        const deck = G.deck.map(() => 'hidden');
        const exchange = G.exchange && G.exchange.playerID === playerID ? G.exchange : G.exchange ? { ...G.exchange, drawn: [] } : null;
        return { ...G, players, deck, exchange };
    },
    endIf: ({ G }) => {
        if (G.seatOrder.length === 0)
            return undefined; // still in lobby
        const remaining = (0, helpers_1.activeSeats)(G);
        if (remaining.length <= 1) {
            return { winner: remaining[0] ?? null };
        }
        return undefined;
    },
    phases: {
        lobby: { ...phases_1.lobbyPhase },
        play: { ...phases_1.playPhase },
    },
};
