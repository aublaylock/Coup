import type { Game } from 'boardgame.io';
import type { CoupState } from './types';
import { lobbyPhase, playPhase } from './phases';
import { activeSeats } from './helpers';

export const CoupGame: Game<CoupState> = {
  name: 'coup',

  // Official rules call for 3-6; 2 works mechanically with the standard
  // deck, just isn't the "official" balance, so it's allowed here for testing.
  minPlayers: 2,
  maxPlayers: 6,

  setup: ({ ctx }): CoupState => {
    const players: CoupState['players'] = {};
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

    const players: CoupState['players'] = {};
    for (const [id, p] of Object.entries(G.players)) {
      players[id] =
        id === playerID
          ? p
          : {
              ...p,
              influence: p.influence.map((c) => (c.revealed ? c : { role: 'hidden', revealed: false })),
            };
    }

    const deck = G.deck.map(() => 'hidden' as const);

    const exchange =
      G.exchange && G.exchange.playerID === playerID ? G.exchange : G.exchange ? { ...G.exchange, drawn: [] } : null;

    return { ...G, players, deck, exchange };
  },

  endIf: ({ G }) => {
    if (G.seatOrder.length === 0) return undefined; // still in lobby
    const remaining = activeSeats(G);
    if (remaining.length <= 1) {
      return { winner: remaining[0] ?? null };
    }
    return undefined;
  },

  phases: {
    lobby: { ...lobbyPhase },
    play: { ...playPhase },
  },
};
