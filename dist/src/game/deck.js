"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INFO_CARD_IMAGE = exports.COIN_IMAGE = exports.CARD_BACK_IMAGE = exports.ACTION_BLOCKERS = exports.ROLE_INFO = exports.ALL_ROLES = void 0;
exports.buildDeck = buildDeck;
exports.ALL_ROLES = ['duke', 'assassin', 'captain', 'ambassador', 'contessa'];
exports.ROLE_INFO = {
    duke: {
        label: 'Duke',
        image: '/cards/duke.png',
        action: 'Tax: take 3 coins from the Treasury.',
        blocks: 'Blocks Foreign Aid.',
    },
    assassin: {
        label: 'Assassin',
        image: '/cards/assassin.png',
        action: 'Assassinate: pay 3 coins, target reveals an influence.',
        blocks: '',
    },
    captain: {
        label: 'Captain',
        image: '/cards/captain.png',
        action: 'Steal: take 2 coins from another player.',
        blocks: 'Blocks Stealing.',
    },
    ambassador: {
        label: 'Ambassador',
        image: '/cards/ambassador.png',
        action: 'Exchange: swap cards with the Court deck.',
        blocks: 'Blocks Stealing.',
    },
    contessa: {
        label: 'Contessa',
        image: '/cards/contessa.png',
        action: '',
        blocks: 'Blocks Assassination.',
    },
};
/** Roles that can block each action. Used by the moves and by the ActionBar's hover hints. */
exports.ACTION_BLOCKERS = {
    income: [],
    foreign_aid: ['duke'],
    tax: [],
    steal: ['captain', 'ambassador'],
    assassinate: ['contessa'],
    exchange: [],
    coup: [],
};
exports.CARD_BACK_IMAGE = '/cards/back.png';
exports.COIN_IMAGE = '/cards/coin.png';
exports.INFO_CARD_IMAGE = '/cards/info.png';
/** Build the standard 15-card Coup deck: 3 copies each of 5 roles. */
function buildDeck() {
    const deck = [];
    for (const role of exports.ALL_ROLES) {
        for (let i = 0; i < 3; i++)
            deck.push(role);
    }
    return deck;
}
