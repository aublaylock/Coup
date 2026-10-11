import type { Move } from 'boardgame.io';
import type { CoupState } from './types';
/**
 * Called by the room owner (player "0") to start the game.
 * Randomises seating, deals 2 influence cards + 2 coins to every seat.
 */
export declare const startGame: Move<CoupState>;
export declare const income: Move<CoupState>;
export declare const foreignAid: Move<CoupState>;
export declare const tax: Move<CoupState>;
export declare const steal: Move<CoupState>;
export declare const assassinate: Move<CoupState>;
export declare const exchange: Move<CoupState>;
export declare const coup: Move<CoupState>;
export declare const respondPass: Move<CoupState>;
export declare const respondChallenge: Move<CoupState>;
export declare const respondBlock: Move<CoupState>;
export declare const revealInfluence: Move<CoupState>;
export declare const confirmExchange: Move<CoupState>;
