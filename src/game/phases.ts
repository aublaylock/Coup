import type { Ctx, Move, PhaseConfig } from 'boardgame.io';
import type { CoupState } from './types';
import { isEliminated } from './helpers';
import {
  startGame,
  income,
  foreignAid,
  tax,
  steal,
  assassinate,
  exchange,
  coup,
  respondPass,
  respondChallenge,
  respondBlock,
  revealInfluence,
  confirmExchange,
} from './moves';

// ---------------------------------------------------------------------------
// Lobby Phase
// ---------------------------------------------------------------------------
// Players gather here after joining. Only the room owner (player "0") can act.
// startGame randomises seating, deals cards, and ends the phase.

export const lobbyPhase: PhaseConfig<CoupState> = {
  start: true,

  moves: {
    startGame: { move: startGame, client: false } as Move<CoupState>,
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

export const playPhase: PhaseConfig<CoupState> = {
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
      next: ({ G, ctx }: { G: CoupState; ctx: Ctx }) => {
        let next = (ctx.playOrderPos + 1) % ctx.playOrder.length;
        let attempts = 0;
        while (isEliminated(G.players[ctx.playOrder[next]]) && attempts < ctx.playOrder.length) {
          next = (next + 1) % ctx.playOrder.length;
          attempts++;
        }
        return next;
      },
    },

    stages: {
      declaring: {
        moves: {
          income: { move: income, client: false } as Move<CoupState>,
          foreignAid: { move: foreignAid, client: false } as Move<CoupState>,
          tax: { move: tax, client: false } as Move<CoupState>,
          steal: { move: steal, client: false } as Move<CoupState>,
          assassinate: { move: assassinate, client: false } as Move<CoupState>,
          exchange: { move: exchange, client: false } as Move<CoupState>,
          coup: { move: coup, client: false } as Move<CoupState>,
        },
      },
      reacting: {
        moves: {
          respondPass: { move: respondPass, client: false } as Move<CoupState>,
          respondChallenge: { move: respondChallenge, client: false } as Move<CoupState>,
          respondBlock: { move: respondBlock, client: false } as Move<CoupState>,
        },
      },
      revealing: {
        moves: {
          revealInfluence: { move: revealInfluence, client: false } as Move<CoupState>,
        },
      },
      exchanging: {
        moves: {
          confirmExchange: { move: confirmExchange, client: false } as Move<CoupState>,
        },
      },
    },
  },
};
