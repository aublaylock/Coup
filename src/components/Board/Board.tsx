import type { BoardProps } from 'boardgame.io/react';
import type { CoupState } from '../../game/types';
import { isEliminated } from '../../game/helpers';
import { Table } from '../Table/Table';
import { Hand } from '../Hand/Hand';
import { ActionBar } from '../ActionBar/ActionBar';
import { ReactionPanel } from '../ReactionPanel/ReactionPanel';
import { RevealModal } from '../RevealModal/RevealModal';
import { ExchangeModal } from '../ExchangeModal/ExchangeModal';
import { GameLog } from '../GameLog/GameLog';
import styles from './Board.module.css';

export type CoupBoardProps = BoardProps<CoupState>;

export function Board({ G, ctx, moves, playerID, matchData }: CoupBoardProps) {
  const names: Record<string, string> = {};
  (matchData ?? []).forEach((p) => {
    names[String(p.id)] = p.name ?? `Player ${p.id + 1}`;
  });
  const nameOf = (id: string) => names[id] ?? `Player ${Number(id) + 1}`;

  // ---- Lobby phase: waiting room ----
  if (ctx.phase === 'lobby') {
    const roster = matchData ?? [];
    const joinedCount = roster.filter((p) => p.name).length;
    const isHost = playerID === '0';
    const canStart = isHost && joinedCount === ctx.numPlayers && ctx.numPlayers >= 2;

    return (
      <div className={styles.board}>
        <header className={styles.header}>
          <h1 className={styles.title}>COUP</h1>
        </header>
        <div className={styles.scrollArea}>
          <div className={styles.lobbyWaiting}>
            <h2 className={styles.lobbyHeading}>
              Players ({joinedCount}/{ctx.numPlayers})
            </h2>
            <ul className={styles.roster}>
              {roster.map((p) => (
                <li key={p.id} className={p.name ? styles.rosterJoined : styles.rosterEmpty}>
                  {p.name ?? 'Waiting…'}
                </li>
              ))}
            </ul>
            {isHost ? (
              <button className={styles.startBtn} disabled={!canStart} onClick={() => moves.startGame()}>
                {canStart ? 'Start Game' : `Waiting for all ${ctx.numPlayers} players to join…`}
              </button>
            ) : (
              <p className={styles.lobbyWaitMsg}>Waiting for the host to start the game…</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---- Play phase ----
  const myStage = playerID ? ctx.activePlayers?.[playerID] ?? null : null;
  const myPlayer = playerID ? G.players[playerID] : null;
  const currentPlayerID = ctx.currentPlayer;
  const gameover = ctx.gameover as { winner: string | null } | undefined;

  const opponents = G.seatOrder.filter((id) => id !== playerID);

  const targets = G.seatOrder
    .filter((id) => id !== playerID && !isEliminated(G.players[id]))
    .map((id) => ({ id, name: nameOf(id) }));

  return (
    <div className={styles.board}>
      <header className={styles.header}>
        <h1 className={styles.title}>COUP</h1>
        <div className={styles.meta}>
          <span className={styles.turnIndicator}>Turn: {nameOf(currentPlayerID)}</span>
        </div>
      </header>

      {gameover && (
        <div className={styles.gameoverOverlay}>
          <div className={styles.gameoverModal}>
            <h2>{gameover.winner ? `${nameOf(gameover.winner)} wins!` : 'Game over'}</h2>
            <p>Use the "Leave Match" button to return to the lobby.</p>
          </div>
        </div>
      )}

      {myStage === 'revealing' && G.reveal && myPlayer && playerID && (
        <RevealModal reason={G.reveal.reason} myID={playerID} influence={myPlayer.influence} moves={moves} />
      )}

      {myStage === 'exchanging' && G.exchange && myPlayer && playerID && (
        <ExchangeModal drawn={G.exchange.drawn} myID={playerID} myInfluence={myPlayer.influence} moves={moves} />
      )}

      {/* Everything between the header and the hand dock scrolls independently,
          so the dock (and your hand) always stays put at the bottom of the screen
          instead of a fixed-position overlay covering whatever happens to be there. */}
      <div className={styles.scrollArea}>
        <Table G={G} opponents={opponents} currentPlayerID={currentPlayerID} nameOf={nameOf} />
        <GameLog entries={G.log} names={names} />
      </div>

      {myPlayer && playerID && (
        <div className={styles.bottomDock}>
          <div className={styles.contextZone}>
            {myStage === 'declaring' && <ActionBar coins={myPlayer.coins} targets={targets} moves={moves} />}
            {myStage === 'reacting' && G.pending && (
              <ReactionPanel pending={G.pending} myID={playerID} names={names} moves={moves} />
            )}
            {!myStage && !gameover && (
              <p className={styles.waitMsg}>
                {currentPlayerID === playerID ? '' : `Waiting for ${nameOf(currentPlayerID)}…`}
              </p>
            )}
          </div>
          <Hand name={nameOf(playerID)} player={myPlayer} />
        </div>
      )}
    </div>
  );
}
