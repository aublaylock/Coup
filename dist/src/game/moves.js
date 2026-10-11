"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmExchange = exports.revealInfluence = exports.respondBlock = exports.respondChallenge = exports.respondPass = exports.coup = exports.exchange = exports.assassinate = exports.steal = exports.tax = exports.foreignAid = exports.income = exports.startGame = void 0;
const core_1 = require("boardgame.io/core");
const deck_1 = require("./deck");
const helpers_1 = require("./helpers");
// ---------------------------------------------------------------------------
// Lobby
// ---------------------------------------------------------------------------
/**
 * Called by the room owner (player "0") to start the game.
 * Randomises seating, deals 2 influence cards + 2 coins to every seat.
 */
const startGame = ({ G, ctx, random }) => {
    if (ctx.currentPlayer !== '0')
        return core_1.INVALID_MOVE;
    if (G.seatOrder.length > 0)
        return core_1.INVALID_MOVE;
    const ids = Array.from({ length: ctx.numPlayers }, (_, i) => String(i));
    G.seatOrder = random.Shuffle(ids);
    let deck = random.Shuffle((0, deck_1.buildDeck)());
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
    (0, helpers_1.addLog)(G, 'The game begins. Everyone starts with 2 coins and 2 influence.');
};
exports.startGame = startGame;
function beginReaction(G, events, pending) {
    G.pending = pending;
    const others = (0, helpers_1.activeSeats)(G).filter((id) => id !== pending.actorID);
    const value = {};
    for (const id of others)
        value[id] = 'reacting';
    events.setActivePlayers({ value });
}
/** Apply the effect of the currently-pending action once it's gone unopposed (or a block was disproven). */
function applyActionEffect(G, events) {
    const p = G.pending;
    if (!p)
        return;
    const actor = G.players[p.actorID];
    switch (p.action) {
        case 'foreign_aid':
            actor.coins += 2;
            (0, helpers_1.addLog)(G, `${(0, helpers_1.nameTag)(p.actorID)} receives Foreign Aid (+2 coins).`);
            G.pending = null;
            G.turnDone = true;
            break;
        case 'tax':
            actor.coins += 3;
            (0, helpers_1.addLog)(G, `${(0, helpers_1.nameTag)(p.actorID)} collects Tax (+3 coins).`);
            G.pending = null;
            G.turnDone = true;
            break;
        case 'steal': {
            const target = G.players[p.targetID];
            const amount = Math.min(2, target.coins);
            target.coins -= amount;
            actor.coins += amount;
            (0, helpers_1.addLog)(G, `${(0, helpers_1.nameTag)(p.actorID)} steals ${amount} coin(s) from ${(0, helpers_1.nameTag)(p.targetID)}.`);
            G.pending = null;
            G.turnDone = true;
            break;
        }
        case 'assassinate': {
            // The target may already be eliminated here: if they challenged the Assassin
            // claim and lost on their last card, that reveal already took them out before
            // the assassination itself gets a chance to resolve (the "double-loss" case).
            const target = G.players[p.targetID];
            G.pending = null;
            if ((0, helpers_1.isEliminated)(target)) {
                (0, helpers_1.addLog)(G, `${(0, helpers_1.nameTag)(p.targetID)} was already eliminated by the failed challenge.`);
                G.turnDone = true;
                break;
            }
            (0, helpers_1.addLog)(G, `The assassination succeeds — ${(0, helpers_1.nameTag)(p.targetID)} must reveal an influence.`);
            G.reveal = { playerID: p.targetID, reason: 'were assassinated', resumeAction: 'none' };
            events.setActivePlayers({ value: { [p.targetID]: 'revealing' } });
            break;
        }
        case 'exchange': {
            const drawn = [];
            for (let i = 0; i < 2 && G.deck.length > 0; i++) {
                drawn.push(G.deck.pop());
            }
            (0, helpers_1.addLog)(G, `${(0, helpers_1.nameTag)(p.actorID)} draws from the Court deck to exchange influence.`);
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
const income = ({ G, ctx }) => {
    const actor = G.players[ctx.currentPlayer];
    if (actor.coins >= 10)
        return core_1.INVALID_MOVE; // forced coup
    actor.coins += 1;
    (0, helpers_1.declareAction)(G, ctx.currentPlayer, 'Income');
    (0, helpers_1.addLog)(G, `${(0, helpers_1.nameTag)(ctx.currentPlayer)} takes Income (+1 coin).`);
    G.turnDone = true;
};
exports.income = income;
const foreignAid = ({ G, ctx, events }) => {
    const actorID = ctx.currentPlayer;
    if (G.players[actorID].coins >= 10)
        return core_1.INVALID_MOVE;
    (0, helpers_1.declareAction)(G, actorID, 'Foreign Aid');
    (0, helpers_1.addLog)(G, `${(0, helpers_1.nameTag)(actorID)} attempts Foreign Aid.`);
    beginReaction(G, events, {
        action: 'foreign_aid',
        actorID,
        targetID: null,
        claimedRole: null,
        blockableBy: [...deck_1.ACTION_BLOCKERS.foreign_aid],
        eligibleBlockers: (0, helpers_1.activeSeats)(G).filter((id) => id !== actorID),
        block: null,
        passed: [],
        stage: 'action',
    });
};
exports.foreignAid = foreignAid;
const tax = ({ G, ctx, events }) => {
    const actorID = ctx.currentPlayer;
    if (G.players[actorID].coins >= 10)
        return core_1.INVALID_MOVE;
    (0, helpers_1.declareAction)(G, actorID, 'Tax (Duke)');
    (0, helpers_1.addLog)(G, `${(0, helpers_1.nameTag)(actorID)} claims the Duke and attempts Tax.`);
    beginReaction(G, events, {
        action: 'tax',
        actorID,
        targetID: null,
        claimedRole: 'duke',
        blockableBy: [...deck_1.ACTION_BLOCKERS.tax],
        eligibleBlockers: [],
        block: null,
        passed: [],
        stage: 'action',
    });
};
exports.tax = tax;
const steal = ({ G, ctx, events }, targetID) => {
    const actorID = ctx.currentPlayer;
    if (G.players[actorID].coins >= 10)
        return core_1.INVALID_MOVE;
    if (!targetID || targetID === actorID || !G.players[targetID] || (0, helpers_1.isEliminated)(G.players[targetID])) {
        return core_1.INVALID_MOVE;
    }
    (0, helpers_1.declareAction)(G, actorID, `Steal from ${(0, helpers_1.nameTag)(targetID)} (Captain)`);
    (0, helpers_1.addLog)(G, `${(0, helpers_1.nameTag)(actorID)} claims the Captain and attempts to steal from ${(0, helpers_1.nameTag)(targetID)}.`);
    beginReaction(G, events, {
        action: 'steal',
        actorID,
        targetID,
        claimedRole: 'captain',
        blockableBy: [...deck_1.ACTION_BLOCKERS.steal],
        eligibleBlockers: [targetID],
        block: null,
        passed: [],
        stage: 'action',
    });
};
exports.steal = steal;
const assassinate = ({ G, ctx, events }, targetID) => {
    const actorID = ctx.currentPlayer;
    const actor = G.players[actorID];
    if (actor.coins >= 10)
        return core_1.INVALID_MOVE;
    if (actor.coins < 3)
        return core_1.INVALID_MOVE;
    if (!targetID || targetID === actorID || !G.players[targetID] || (0, helpers_1.isEliminated)(G.players[targetID])) {
        return core_1.INVALID_MOVE;
    }
    // Cost is spent up front; only refunded if the Assassin claim is successfully challenged.
    actor.coins -= 3;
    (0, helpers_1.declareAction)(G, actorID, `Assassinate ${(0, helpers_1.nameTag)(targetID)} (Assassin)`);
    (0, helpers_1.addLog)(G, `${(0, helpers_1.nameTag)(actorID)} claims the Assassin and attempts to assassinate ${(0, helpers_1.nameTag)(targetID)}.`);
    beginReaction(G, events, {
        action: 'assassinate',
        actorID,
        targetID,
        claimedRole: 'assassin',
        blockableBy: [...deck_1.ACTION_BLOCKERS.assassinate],
        eligibleBlockers: [targetID],
        block: null,
        passed: [],
        stage: 'action',
    });
};
exports.assassinate = assassinate;
const exchange = ({ G, ctx, events }) => {
    const actorID = ctx.currentPlayer;
    if (G.players[actorID].coins >= 10)
        return core_1.INVALID_MOVE;
    (0, helpers_1.declareAction)(G, actorID, 'Exchange (Ambassador)');
    (0, helpers_1.addLog)(G, `${(0, helpers_1.nameTag)(actorID)} claims the Ambassador and attempts to exchange cards.`);
    beginReaction(G, events, {
        action: 'exchange',
        actorID,
        targetID: null,
        claimedRole: 'ambassador',
        blockableBy: [...deck_1.ACTION_BLOCKERS.exchange],
        eligibleBlockers: [],
        block: null,
        passed: [],
        stage: 'action',
    });
};
exports.exchange = exchange;
const coup = ({ G, ctx, events }, targetID) => {
    const actorID = ctx.currentPlayer;
    const actor = G.players[actorID];
    if (actor.coins < 7)
        return core_1.INVALID_MOVE;
    if (!targetID || targetID === actorID || !G.players[targetID] || (0, helpers_1.isEliminated)(G.players[targetID])) {
        return core_1.INVALID_MOVE;
    }
    actor.coins -= 7;
    (0, helpers_1.declareAction)(G, actorID, `Coup ${(0, helpers_1.nameTag)(targetID)}`);
    (0, helpers_1.addLog)(G, `${(0, helpers_1.nameTag)(actorID)} launches a Coup against ${(0, helpers_1.nameTag)(targetID)}.`);
    // Coup can never be blocked or challenged — straight to the reveal.
    G.reveal = { playerID: targetID, reason: 'were hit by a Coup', resumeAction: 'none' };
    events.setActivePlayers({ value: { [targetID]: 'revealing' } });
};
exports.coup = coup;
// ---------------------------------------------------------------------------
// Reacting to a pending action ('reacting' stage — everyone but the actor)
// ---------------------------------------------------------------------------
const respondPass = ({ G, events }, callerID) => {
    if (!G.pending || !callerID)
        return core_1.INVALID_MOVE;
    if (G.pending.passed.includes(callerID))
        return core_1.INVALID_MOVE;
    const focusID = G.pending.stage === 'block' ? G.pending.block.blockerID : G.pending.actorID;
    const eligible = (0, helpers_1.activeSeats)(G).filter((id) => id !== focusID);
    if (!eligible.includes(callerID))
        return core_1.INVALID_MOVE;
    G.pending.passed.push(callerID);
    if (G.pending.passed.length < eligible.length)
        return;
    // Everyone has passed with no challenge/block.
    if (G.pending.stage === 'action') {
        applyActionEffect(G, events);
    }
    else {
        (0, helpers_1.addLog)(G, `No one challenges the block — it succeeds.`);
        G.pending = null;
        G.turnDone = true;
    }
};
exports.respondPass = respondPass;
const respondChallenge = ({ G, random, events }, callerID) => {
    if (!G.pending || !callerID)
        return core_1.INVALID_MOVE;
    const claimant = G.pending.stage === 'block' ? G.pending.block.blockerID : G.pending.actorID;
    const claimedRole = G.pending.stage === 'block' ? G.pending.block.claimedRole : G.pending.claimedRole;
    if (!claimedRole || callerID === claimant)
        return core_1.INVALID_MOVE;
    if (!(0, helpers_1.activeSeats)(G).includes(callerID))
        return core_1.INVALID_MOVE;
    (0, helpers_1.addCallout)(G, callerID, 'challenge', `Challenges ${(0, helpers_1.nameTag)(claimant)}'s ${(0, helpers_1.roleLabel)(claimedRole)}`);
    (0, helpers_1.addLog)(G, `${(0, helpers_1.nameTag)(callerID)} challenges ${(0, helpers_1.nameTag)(claimant)}'s claim to the ${(0, helpers_1.roleLabel)(claimedRole)}.`);
    const claimantPlayer = G.players[claimant];
    const cardIdx = claimantPlayer.influence.findIndex((c) => !c.revealed && c.role === claimedRole);
    if (cardIdx !== -1) {
        // Claim was genuine: challenger loses influence. Claimant's card is shuffled back and replaced.
        const card = claimantPlayer.influence[cardIdx];
        if (G.deck.length > 0) {
            G.deck.push(card.role);
            G.deck = random.Shuffle(G.deck);
            const newRole = G.deck.pop();
            claimantPlayer.influence[cardIdx] = { role: newRole, revealed: false };
        }
        (0, helpers_1.addLog)(G, `${(0, helpers_1.nameTag)(claimant)} reveals the ${(0, helpers_1.roleLabel)(claimedRole)} — the challenge fails.`);
        G.reveal = {
            playerID: callerID,
            reason: 'lost a challenge',
            resumeAction: G.pending.stage === 'block' ? 'block_succeeds' : 'action_succeeds',
        };
    }
    else {
        (0, helpers_1.addLog)(G, `${(0, helpers_1.nameTag)(claimant)} can't reveal the ${(0, helpers_1.roleLabel)(claimedRole)} — caught bluffing!`);
        G.reveal = {
            playerID: claimant,
            reason: 'were caught bluffing',
            resumeAction: G.pending.stage === 'block' ? 'block_fails' : 'action_fails',
        };
    }
    events.setActivePlayers({ value: { [G.reveal.playerID]: 'revealing' } });
};
exports.respondChallenge = respondChallenge;
const respondBlock = ({ G, events }, callerID, claimedRole) => {
    if (!G.pending || G.pending.stage !== 'action' || !callerID)
        return core_1.INVALID_MOVE;
    if (!G.pending.blockableBy.includes(claimedRole))
        return core_1.INVALID_MOVE;
    if (!G.pending.eligibleBlockers.includes(callerID))
        return core_1.INVALID_MOVE;
    G.pending.block = { blockerID: callerID, claimedRole };
    G.pending.stage = 'block';
    G.pending.passed = [];
    (0, helpers_1.addCallout)(G, callerID, 'block', `Blocks with ${(0, helpers_1.roleLabel)(claimedRole)}`);
    (0, helpers_1.addLog)(G, `${(0, helpers_1.nameTag)(callerID)} claims the ${(0, helpers_1.roleLabel)(claimedRole)} to block.`);
    const others = (0, helpers_1.activeSeats)(G).filter((id) => id !== callerID);
    const value = {};
    for (const id of others)
        value[id] = 'reacting';
    events.setActivePlayers({ value });
};
exports.respondBlock = respondBlock;
// ---------------------------------------------------------------------------
// Revealing influence ('revealing' stage — just the affected player)
// ---------------------------------------------------------------------------
const revealInfluence = ({ G, events }, callerID, cardIndex) => {
    if (!G.reveal || G.reveal.playerID !== callerID)
        return core_1.INVALID_MOVE;
    const player = G.players[callerID];
    const card = player.influence[cardIndex];
    if (!card || card.revealed)
        return core_1.INVALID_MOVE;
    card.revealed = true;
    (0, helpers_1.addLog)(G, `${(0, helpers_1.nameTag)(callerID)} reveals the ${(0, helpers_1.roleLabel)(card.role)}.`);
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
        (0, helpers_1.addLog)(G, `${(0, helpers_1.nameTag)(pending.actorID)}'s 3 coins are refunded.`);
    }
    G.pending = null;
    G.turnDone = true;
};
exports.revealInfluence = revealInfluence;
// ---------------------------------------------------------------------------
// Ambassador exchange ('exchanging' stage — just the acting player)
// ---------------------------------------------------------------------------
const confirmExchange = ({ G, random }, callerID, keepRoles) => {
    if (!G.exchange || G.exchange.playerID !== callerID || !keepRoles)
        return core_1.INVALID_MOVE;
    const player = G.players[callerID];
    const unrevealedIdxs = player.influence
        .map((c, i) => i)
        .filter((i) => !player.influence[i].revealed);
    if (keepRoles.length !== unrevealedIdxs.length)
        return core_1.INVALID_MOVE;
    const pool = [...unrevealedIdxs.map((i) => player.influence[i].role), ...G.exchange.drawn];
    const poolCopy = [...pool];
    for (const r of keepRoles) {
        const idx = poolCopy.indexOf(r);
        if (idx === -1)
            return core_1.INVALID_MOVE;
        poolCopy.splice(idx, 1);
    }
    unrevealedIdxs.forEach((slotIdx, i) => {
        player.influence[slotIdx] = { role: keepRoles[i], revealed: false };
    });
    G.deck = random.Shuffle([...G.deck, ...poolCopy]);
    G.exchange = null;
    (0, helpers_1.addLog)(G, `${(0, helpers_1.nameTag)(callerID)} finishes exchanging with the Court deck.`);
    G.turnDone = true;
};
exports.confirmExchange = confirmExchange;
