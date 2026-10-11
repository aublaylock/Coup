import type { Callout, CoupPlayer, CoupState, Role } from './types';
export declare function isEliminated(player: CoupPlayer): boolean;
/** Seats still in the game, in seat order. */
export declare function activeSeats(G: CoupState): string[];
export declare function addLog(G: CoupState, text: string): void;
/** Start a new turn's callouts with the action `playerID` just declared. */
export declare function declareAction(G: CoupState, playerID: string, text: string): void;
export declare function addCallout(G: CoupState, playerID: string, kind: Callout['kind'], text: string): void;
export declare function nameTag(id: string): string;
export declare function resolveNameTags(text: string, names: Record<string, string>): string;
export declare function roleLabel(role: Role): string;
