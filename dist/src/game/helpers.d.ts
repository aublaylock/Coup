import type { CoupPlayer, CoupState, Role } from './types';
export declare function isEliminated(player: CoupPlayer): boolean;
/** Seats still in the game, in seat order. */
export declare function activeSeats(G: CoupState): string[];
export declare function addLog(G: CoupState, text: string): void;
export declare function nameTag(id: string): string;
export declare function resolveNameTags(text: string, names: Record<string, string>): string;
export declare function roleLabel(role: Role): string;
