import type { Role } from './types';
export declare const ALL_ROLES: Role[];
export declare const ROLE_INFO: Record<Role, {
    label: string;
    image: string;
    action: string;
    blocks: string;
}>;
export declare const CARD_BACK_IMAGE = "/cards/back.png";
export declare const COIN_IMAGE = "/cards/coin.png";
/** Build the standard 15-card Coup deck: 3 copies each of 5 roles. */
export declare function buildDeck(): Role[];
