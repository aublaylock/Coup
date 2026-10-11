import type { CoupPlayer, CoupState, Role } from './types';
import { ROLE_INFO } from './deck';

export function isEliminated(player: CoupPlayer): boolean {
  return player.influence.length > 0 && player.influence.every((c) => c.revealed);
}

/** Seats still in the game, in seat order. */
export function activeSeats(G: CoupState): string[] {
  return G.seatOrder.filter((id) => !isEliminated(G.players[id]));
}

export function addLog(G: CoupState, text: string): void {
  G.log.push({ id: G.nextLogID++, text });
  if (G.log.length > 60) G.log.shift();
}

// Moves don't have reliable access to display names server-side (boardgame.io's
// Ctx doesn't expose matchData to move functions), so log text carries the
// playerID wrapped like this and the client resolves it to a real name at render
// time, once it's rendering with its own `matchData` prop. See GameLog.tsx.
export function nameTag(id: string): string {
  return `{{${id}}}`;
}

export function resolveNameTags(text: string, names: Record<string, string>): string {
  return text.replace(/\{\{([^}]+)\}\}/g, (_match, id: string) => names[id] ?? `Player ${Number(id) + 1}`);
}

export function roleLabel(role: Role): string {
  return ROLE_INFO[role].label;
}
