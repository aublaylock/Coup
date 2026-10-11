import { INVALID_MOVE } from 'boardgame.io/core';
import type { Move } from 'boardgame.io';
import type { CoupState, PendingAction, Role } from './types';
import { ACTION_BLOCKERS, buildDeck } from './deck';
import { activeSeats, addCallout, addLog, declareAction, isEliminated, nameTag, roleLabel } from './helpers';

// ---------------------------------------------------------------------------
// Lobby
// ---------------------------------------------------------------------------

/**
 * Called by the room owner (player "0") to start the game.
 * Randomises seating, deals 2 influence cards + 2 coins to every seat.
 */
export const startGame: Move<CoupState> = ({ G, ctx, random }) => {
  if (ctx.currentPlayer !== '0') return INVALID_MOVE;
  if (G.seatOrder.length > 0) return INVALID_MOVE;

  const ids = Array.from({ length: ctx.numPlayers }, (_, i) => String(i));
  G.seatOrder = random.Shuffle(ids);

  let deck = random.Shuffle(buildDeck());
  for (const id of ids) {
    const [c1, c2, ...rest] = deck;
    deck = rest;
    G.players[id].coins = 2;
    G.players[id].influence = [
      { role: c1, revealed: false },
      { role: c2, revealed: false },
    ];
  }
  G.deck = deck;
  addLog(G, 'The game begins. Everyone starts with 2 coins and 2 influence.');
};

// ---------------------------------------------------------------------------
// Shared resolution helpers
// ---------------------------------------------------------------------------

type SetActivePlayers = (arg: { value: Record<string, string> }) => void;

function beginReaction(G: CoupState, events: { setActivePlayers: SetActivePlayers }, pending: PendingAction): void {
  G.pending = pending;
  const others = activeSeats(G).filter((id) => id !== pending.actorID);
  const value: Record<string, string> = {};
  for (const id of others) value[id] = 'reacting';
  events.setActivePlayers({ value });
}

/** Apply the effect of the currently-pending action once it's gone unopposed (or a block was disproven). */
function applyActionEffect(G: CoupState, events: { setActivePlayers: SetActivePlayers }): void {
  const p = G.pending;
  if (!p) return;
  const actor = G.players[p.actorID];

  switch (p.action) {
    case 'foreign_aid':
      actor.coins += 2;
      addLog(G, `${nameTag(p.actorID)} receives Foreign Aid (+2 coins).`);
      G.pending = null;
      G.turnDone = true;
      break;

    case 'tax':
      actor.coins += 3;
      addLog(G, `${nameTag(p.actorID)} collects Tax (+3 coins).`);
      G.pending = null;
      G.turnDone = true;
      break;

    case 'steal': {
      const target = G.players[p.targetID!];
      const amount = Math.min(2, target.coins);
      target.coins -= amount;
      actor.coins += amount;
      addLog(G, `${nameTag(p.actorID)} steals ${amount} coin(s) from ${nameTag(p.targetID!)}.`);
      G.pending = null;
      G.turnDone = true;
      break;
    }

    case 'assassinate': {
      // The target may already be eliminated here: if they challenged the Assassin
      // claim and lost on their last card, that reveal already took them out before
      // the assassination itself gets a chance to resolve (the "double-loss" case).
      const target = G.players[p.targetID!];
      G.pending = null;
      if (isEliminated(target)) {
        addLog(G, `${nameTag(p.targetID!)} was already eliminated by the failed challenge.`);
        G.turnDone = true;
        break;
      }
      addLog(G, `The assassination succeeds — ${nameTag(p.targetID!)} must reveal an influence.`);
      G.reveal = { playerID: p.targetID!, reason: 'were assassinated', resumeAction: 'none' };
      events.setActivePlayers({ value: { [p.targetID!]: 'revealing' } });
      break;
    }

    case 'exchange': {
      const drawn: Role[] = [];
      for (let i = 0; i < 2 && G.deck.length > 0; i++) {
        drawn.push(G.deck.pop() as Role);
      }
      addLog(G, `${nameTag(p.actorID)} draws from the Court deck to exchange influence.`);
      G.pending = null;
      G.exchange = { playerID: p.actorID, drawn };
      events.setActivePlayers({ value: { [p.actorID]: 'exchanging' } });
      break;
    }
  }
}

// ---------------------------------------------------------------------------
// Declaring an action (currentPlayer only, 'declaring' stage)
// ---------------------------------------------------------------------------

export const income: Move<CoupState> = ({ G, ctx }) => {
  const actor = G.players[ctx.currentPlayer];
  if (actor.coins >= 10) return INVALID_MOVE; // forced coup
  actor.coins += 1;
  declareAction(G, ctx.currentPlayer, 'Income');
  addLog(G, `${nameTag(ctx.currentPlayer)} takes Income (+1 coin).`);
  G.turnDone = true;
};

export const foreignAid: Move<CoupState> = ({ G, ctx, events }) => {
  const actorID = ctx.currentPlayer;
  if (G.players[actorID].coins >= 10) return INVALID_MOVE;
  declareAction(G, actorID, 'Foreign Aid');
  addLog(G, `${nameTag(actorID)} attempts Foreign Aid.`);
  beginReaction(G, events, {
    action: 'foreign_aid',
    actorID,
    targetID: null,
    claimedRole: null,
    blockableBy: [...ACTION_BLOCKERS.foreign_aid],
    eligibleBlockers: activeSeats(G).filter((id) => id !== actorID),
    block: null,
    passed: [],
    stage: 'action',
  });
};

export const tax: Move<CoupState> = ({ G, ctx, events }) => {
  const actorID = ctx.currentPlayer;
  if (G.players[actorID].coins >= 10) return INVALID_MOVE;
  declareAction(G, actorID, 'Tax (Duke)');
  addLog(G, `${nameTag(actorID)} claims the Duke and attempts Tax.`);
  beginReaction(G, events, {
    action: 'tax',
    actorID,
    targetID: null,
    claimedRole: 'duke',
    blockableBy: [...ACTION_BLOCKERS.tax],
    eligibleBlockers: [],
    block: null,
    passed: [],
    stage: 'action',
  });
};

export const steal: Move<CoupState> = ({ G, ctx, events }, targetID: string) => {
  const actorID = ctx.currentPlayer;
  if (G.players[actorID].coins >= 10) return INVALID_MOVE;
  if (!targetID || targetID === actorID || !G.players[targetID] || isEliminated(G.players[targetID])) {
    return INVALID_MOVE;
  }
  declareAction(G, actorID, `Steal from ${nameTag(targetID)} (Captain)`);
  addLog(G, `${nameTag(actorID)} claims the Captain and attempts to steal from ${nameTag(targetID)}.`);
  beginReaction(G, events, {
    action: 'steal',
    actorID,
    targetID,
    claimedRole: 'captain',
    blockableBy: [...ACTION_BLOCKERS.steal],
    eligibleBlockers: [targetID],
    block: null,
    passed: [],
    stage: 'action',
  });
};

export const assassinate: Move<CoupState> = ({ G, ctx, events }, targetID: string) => {
  const actorID = ctx.currentPlayer;
  const actor = G.players[actorID];
  if (actor.coins >= 10) return INVALID_MOVE;
  if (actor.coins < 3) return INVALID_MOVE;
  if (!targetID || targetID === actorID || !G.players[targetID] || isEliminated(G.players[targetID])) {
    return INVALID_MOVE;
  }
  // Cost is spent up front; only refunded if the Assassin claim is successfully challenged.
  actor.coins -= 3;
  declareAction(G, actorID, `Assassinate ${nameTag(targetID)} (Assassin)`);
  addLog(G, `${nameTag(actorID)} claims the Assassin and attempts to assassinate ${nameTag(targetID)}.`);
  beginReaction(G, events, {
    action: 'assassinate',
    actorID,
    targetID,
    claimedRole: 'assassin',
    blockableBy: [...ACTION_BLOCKERS.assassinate],
    eligibleBlockers: [targetID],
    block: null,
    passed: [],
    stage: 'action',
  });
};

export const exchange: Move<CoupState> = ({ G, ctx, events }) => {
  const actorID = ctx.currentPlayer;
  if (G.players[actorID].coins >= 10) return INVALID_MOVE;
  declareAction(G, actorID, 'Exchange (Ambassador)');
  addLog(G, `${nameTag(actorID)} claims the Ambassador and attempts to exchange cards.`);
  beginReaction(G, events, {
    action: 'exchange',
    actorID,
    targetID: null,
    claimedRole: 'ambassador',
    blockableBy: [...ACTION_BLOCKERS.exchange],
    eligibleBlockers: [],
    block: null,
    passed: [],
    stage: 'action',
  });
};

export const coup: Move<CoupState> = ({ G, ctx, events }, targetID: string) => {
  const actorID = ctx.currentPlayer;
  const actor = G.players[actorID];
  if (actor.coins < 7) return INVALID_MOVE;
  if (!targetID || targetID === actorID || !G.players[targetID] || isEliminated(G.players[targetID])) {
    return INVALID_MOVE;
  }
  actor.coins -= 7;
  declareAction(G, actorID, `Coup ${nameTag(targetID)}`);
  addLog(G, `${nameTag(actorID)} launches a Coup against ${nameTag(targetID)}.`);
  // Coup can never be blocked or challenged — straight to the reveal.
  G.reveal = { playerID: targetID, reason: 'were hit by a Coup', resumeAction: 'none' };
  events.setActivePlayers({ value: { [targetID]: 'revealing' } });
};

// ---------------------------------------------------------------------------
// Reacting to a pending action ('reacting' stage — everyone but the actor)
// ---------------------------------------------------------------------------

export const respondPass: Move<CoupState> = ({ G, events }, callerID: string) => {
  if (!G.pending || !callerID) return INVALID_MOVE;
  if (G.pending.passed.includes(callerID)) return INVALID_MOVE;

  const focusID = G.pending.stage === 'block' ? G.pending.block!.blockerID : G.pending.actorID;
  const eligible = activeSeats(G).filter((id) => id !== focusID);
  if (!eligible.includes(callerID)) return INVALID_MOVE;

  G.pending.passed.push(callerID);
  if (G.pending.passed.length < eligible.length) return;

  // Everyone has passed with no challenge/block.
  if (G.pending.stage === 'action') {
    applyActionEffect(G, events);
  } else {
    addLog(G, `No one challenges the block — it succeeds.`);
    G.pending = null;
    G.turnDone = true;
  }
};

export const respondChallenge: Move<CoupState> = ({ G, random, events }, callerID: string) => {
  if (!G.pending || !callerID) return INVALID_MOVE;

  const claimant = G.pending.stage === 'block' ? G.pending.block!.blockerID : G.pending.actorID;
  const claimedRole = G.pending.stage === 'block' ? G.pending.block!.claimedRole : G.pending.claimedRole;
  if (!claimedRole || callerID === claimant) return INVALID_MOVE;
  if (!activeSeats(G).includes(callerID)) return INVALID_MOVE;

  addCallout(G, callerID, 'challenge', `Challenges ${nameTag(claimant)}'s ${roleLabel(claimedRole)}`);
  addLog(G, `${nameTag(callerID)} challenges ${nameTag(claimant)}'s claim to the ${roleLabel(claimedRole)}.`);

  const claimantPlayer = G.players[claimant];
  const cardIdx = claimantPlayer.influence.findIndex((c) => !c.revealed && c.role === claimedRole);

  if (cardIdx !== -1) {
    // Claim was genuine: challenger loses influence. Claimant's card is shuffled back and replaced.
    const card = claimantPlayer.influence[cardIdx];
    if (G.deck.length > 0) {
      G.deck.push(card.role);
      G.deck = random.Shuffle(G.deck);
      const newRole = G.deck.pop() as Role;
      claimantPlayer.influence[cardIdx] = { role: newRole, revealed: false };
    }
    addLog(G, `${nameTag(claimant)} reveals the ${roleLabel(claimedRole)} — the challenge fails.`);
    G.reveal = {
      playerID: callerID,
      reason: 'lost a challenge',
      resumeAction: G.pending.stage === 'block' ? 'block_succeeds' : 'action_succeeds',
    };
  } else {
    addLog(G, `${nameTag(claimant)} can't reveal the ${roleLabel(claimedRole)} — caught bluffing!`);
    G.reveal = {
      playerID: claimant,
      reason: 'were caught bluffing',
      resumeAction: G.pending.stage === 'block' ? 'block_fails' : 'action_fails',
    };
  }
  events.setActivePlayers({ value: { [G.reveal.playerID]: 'revealing' } });
};

export const respondBlock: Move<CoupState> = ({ G, events }, callerID: string, claimedRole: Role) => {
  if (!G.pending || G.pending.stage !== 'action' || !callerID) return INVALID_MOVE;
  if (!G.pending.blockableBy.includes(claimedRole)) return INVALID_MOVE;
  if (!G.pending.eligibleBlockers.includes(callerID)) return INVALID_MOVE;

  G.pending.block = { blockerID: callerID, claimedRole };
  G.pending.stage = 'block';
  G.pending.passed = [];
  addCallout(G, callerID, 'block', `Blocks with ${roleLabel(claimedRole)}`);
  addLog(G, `${nameTag(callerID)} claims the ${roleLabel(claimedRole)} to block.`);

  const others = activeSeats(G).filter((id) => id !== callerID);
  const value: Record<string, string> = {};
  for (const id of others) value[id] = 'reacting';
  events.setActivePlayers({ value });
};

// ---------------------------------------------------------------------------
// Revealing influence ('revealing' stage — just the affected player)
// ---------------------------------------------------------------------------

export const revealInfluence: Move<CoupState> = ({ G, events }, callerID: string, cardIndex: number) => {
  if (!G.reveal || G.reveal.playerID !== callerID) return INVALID_MOVE;
  const player = G.players[callerID];
  const card = player.influence[cardIndex];
  if (!card || card.revealed) return INVALID_MOVE;

  card.revealed = true;
  addLog(G, `${nameTag(callerID)} reveals the ${roleLabel(card.role as Role)}.`);

  const resume = G.reveal.resumeAction;
  const pending = G.pending;
  G.reveal = null;

  if (resume === 'none') {
    G.pending = null;
    G.turnDone = true;
    return;
  }

  if (resume === 'action_succeeds' || resume === 'block_fails') {
    // Either the challenger lost (action goes through as originally claimed),
    // or the blocker was bluffing (the original action goes through anyway).
    applyActionEffect(G, events);
    return;
  }

  // 'action_fails' (actor was bluffing) or 'block_succeeds' (blocker was genuine):
  // the original action never happens.
  if (resume === 'action_fails' && pending?.action === 'assassinate') {
    G.players[pending.actorID].coins += 3;
    addLog(G, `${nameTag(pending.actorID)}'s 3 coins are refunded.`);
  }
  G.pending = null;
  G.turnDone = true;
};

// ---------------------------------------------------------------------------
// Ambassador exchange ('exchanging' stage — just the acting player)
// ---------------------------------------------------------------------------

export const confirmExchange: Move<CoupState> = ({ G, random }, callerID: string, keepRoles: Role[]) => {
  if (!G.exchange || G.exchange.playerID !== callerID || !keepRoles) return INVALID_MOVE;

  const player = G.players[callerID];
  const unrevealedIdxs = player.influence
    .map((c, i) => i)
    .filter((i) => !player.influence[i].revealed);
  if (keepRoles.length !== unrevealedIdxs.length) return INVALID_MOVE;

  const pool = [...unrevealedIdxs.map((i) => player.influence[i].role as Role), ...G.exchange.drawn];
  const poolCopy = [...pool];
  for (const r of keepRoles) {
    const idx = poolCopy.indexOf(r);
    if (idx === -1) return INVALID_MOVE;
    poolCopy.splice(idx, 1);
  }

  unrevealedIdxs.forEach((slotIdx, i) => {
    player.influence[slotIdx] = { role: keepRoles[i], revealed: false };
  });

  G.deck = random.Shuffle([...G.deck, ...poolCopy]);
  G.exchange = null;
  addLog(G, `${nameTag(callerID)} finishes exchanging with the Court deck.`);
  G.turnDone = true;
};
