// The five character roles. 3 copies of each in the Court deck (15 cards total).
export type Role = 'duke' | 'assassin' | 'captain' | 'ambassador' | 'contessa';

// Opponents' unrevealed cards are replaced with this sentinel in playerView
// so identities stay hidden but slot counts remain accurate to the client.
export type HiddenRole = 'hidden';

export interface InfluenceCard {
  role: Role | HiddenRole;
  revealed: boolean;
}

export interface CoupPlayer {
  name: string;
  coins: number;
  // Always starts as length 2. Cards are never removed from the array —
  // losing influence flips `revealed`, it doesn't delete the card.
  influence: InfluenceCard[];
}

export type ActionType =
  | 'foreign_aid'
  | 'tax'
  | 'steal'
  | 'assassinate'
  | 'exchange';

// What happens once the player named in `reveal` finishes choosing a card.
export type ResumeAction =
  | 'none' // coup / assassination lose — nothing left to resolve, just end the turn
  | 'action_succeeds' // challenger lost the challenge — the original action proceeds
  | 'action_fails' // actor's claim was a bluff, caught — action never happens
  | 'block_succeeds' // blocker's claim was real — the original action is blocked
  | 'block_fails'; // blocker's claim was a bluff, caught — the original action proceeds

export interface PendingAction {
  action: ActionType;
  actorID: string;
  targetID: string | null;
  claimedRole: Role | null; // null only never happens for these five action types, but kept optional-safe
  blockableBy: Role[]; // roles that could legally block this action ([] = unblockable)
  eligibleBlockers: string[]; // playerIDs allowed to declare a block
  block: { blockerID: string; claimedRole: Role } | null;
  passed: string[]; // playerIDs who have passed at the CURRENT decision point
  stage: 'action' | 'block'; // are we collecting reactions to the action, or to a declared block?
}

export interface RevealRequest {
  playerID: string;
  reason: string; // human-readable, shown in the reveal prompt
  resumeAction: ResumeAction;
}

export interface ExchangeState {
  playerID: string;
  drawn: Role[]; // cards drawn from the Court deck, combined with the player's own roles
}

export interface LogEntry {
  id: number;
  text: string;
}

export interface CoupState {
  players: Record<string, CoupPlayer>;
  deck: (Role | HiddenRole)[]; // court deck; hidden for non-server views
  // Turn order fixed at game start. Empty array = lobby not started yet.
  seatOrder: string[];
  pending: PendingAction | null;
  reveal: RevealRequest | null;
  exchange: ExchangeState | null;
  log: LogEntry[];
  // Signal flag: set true by a move once the current turn's action has fully
  // resolved (succeeded, failed, or been blocked). turn.endIf watches this.
  turnDone: boolean;
  nextLogID: number;
}
