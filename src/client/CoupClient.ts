import React from 'react';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { CoupGame } from '../game/CoupGame';
import { Board } from '../components/Board/Board';

// In development, Vite proxies /socket.io to localhost:8001.
// In production, set VITE_SERVER_URL to the deployed server origin.
const SERVER = import.meta.env.VITE_SERVER_URL ?? `${window.location.protocol}//${window.location.host}`;

const _CoupClientImpl = Client({
  game: CoupGame,
  board: Board,
  multiplayer: SocketIO({ server: SERVER }),
  debug: false,
}) as React.ComponentType<{
  matchID: string;
  playerID: string;
  credentials: string;
  // Passed through to the board, which shows it on the game-over screen.
  onNewGame: () => Promise<void>;
}>;

export const CoupClient = _CoupClientImpl;
