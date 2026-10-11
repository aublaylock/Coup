import type { Role } from './types';
export declare const ALL_ROLES: Role[];
export declare const ROLE_INFO: Record<Role, {
    label: string;
    emoji: string;
    action: string;
    blocks: string;
}>;
/** Build the standard 15-card Coup deck: 3 copies each of 5 roles. */
export declare function buildDeck(): Role[];
