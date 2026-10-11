import type { Role } from './types';

export const ALL_ROLES: Role[] = ['duke', 'assassin', 'captain', 'ambassador', 'contessa'];

export const ROLE_INFO: Record<Role, { label: string; image: string; action: string; blocks: string }> = {
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

export const CARD_BACK_IMAGE = '/cards/back.png';
export const COIN_IMAGE = '/cards/coin.png';
export const INFO_CARD_IMAGE = '/cards/info.png';

/** Build the standard 15-card Coup deck: 3 copies each of 5 roles. */
export function buildDeck(): Role[] {
  const deck: Role[] = [];
  for (const role of ALL_ROLES) {
    for (let i = 0; i < 3; i++) deck.push(role);
  }
  return deck;
}
