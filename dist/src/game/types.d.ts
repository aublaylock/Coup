export type Role = 'duke' | 'assassin' | 'captain' | 'ambassador' | 'contessa';
export type HiddenRole = 'hidden';
export interface InfluenceCard {
    role: Role | HiddenRole;
    revealed: boolean;
}
export interface CoupPlayer {
    name: string;
    coins: number;
    influence: InfluenceCard[];
}
export type ActionType = 'foreign_aid' | 'tax' | 'steal' | 'assassinate' | 'exchange';
export type ResumeAction = 'none' | 'action_succeeds' | 'action_fails' | 'block_succeeds' | 'block_fails';
export interface PendingAction {
    action: ActionType;
    actorID: string;
    targetID: string | null;
    claimedRole: Role | null;
    blockableBy: Role[];
    eligibleBlockers: string[];
    block: {
        blockerID: string;
        claimedRole: Role;
    } | null;
    passed: string[];
    stage: 'action' | 'block';
}
export interface RevealRequest {
    playerID: string;
    reason: string;
    resumeAction: ResumeAction;
}
export interface ExchangeState {
    playerID: string;
    drawn: Role[];
}
export interface LogEntry {
    id: number;
    text: string;
}
export interface Callout {
    kind: 'action' | 'block' | 'challenge';
    text: string;
}
export interface CoupState {
    players: Record<string, CoupPlayer>;
    deck: (Role | HiddenRole)[];
    seatOrder: string[];
    pending: PendingAction | null;
    callouts: Record<string, Callout[]>;
    reveal: RevealRequest | null;
    exchange: ExchangeState | null;
    log: LogEntry[];
    turnDone: boolean;
    nextLogID: number;
}
