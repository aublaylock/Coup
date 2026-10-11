"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_INFO = exports.ALL_ROLES = void 0;
exports.buildDeck = buildDeck;
exports.ALL_ROLES = ['duke', 'assassin', 'captain', 'ambassador', 'contessa'];
exports.ROLE_INFO = {
    duke: {
        label: 'Duke',
        emoji: '\u{1F451}',
        action: 'Tax: take 3 coins from the Treasury.',
        blocks: 'Blocks Foreign Aid.',
    },
    assassin: {
        label: 'Assassin',
        emoji: '\u{1F5E1}\u{FE0F}',
        action: 'Assassinate: pay 3 coins, target reveals an influence.',
        blocks: '',
    },
    captain: {
        label: 'Captain',
        emoji: '\u{2693}',
        action: 'Steal: take 2 coins from another player.',
        blocks: 'Blocks Stealing.',
    },
    ambassador: {
        label: 'Ambassador',
        emoji: '\u{1F54A}\u{FE0F}',
        action: 'Exchange: swap cards with the Court deck.',
        blocks: 'Blocks Stealing.',
    },
    contessa: {
        label: 'Contessa',
        emoji: '\u{1F483}',
        action: '',
        blocks: 'Blocks Assassination.',
    },
};
/** Build the standard 15-card Coup deck: 3 copies each of 5 roles. */
function buildDeck() {
    const deck = [];
    for (const role of exports.ALL_ROLES) {
        for (let i = 0; i < 3; i++)
            deck.push(role);
    }
    return deck;
}
