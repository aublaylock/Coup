import type { Callout, CoupState } from '../../game/types';
import { isEliminated } from '../../game/helpers';
import { CARD_BACK_IMAGE } from '../../game/deck';
import { PlayerPanel } from '../PlayerPanel/PlayerPanel';
import styles from './Table.module.css';

interface TableProps {
  G: CoupState;
  opponents: string[]; // seatOrder minus "me", in seat order
  currentPlayerID: string;
  nameOf: (id: string) => string;
  calloutsFor: (id: string) => Callout[];
}

/** Angle (degrees, 0 = straight up, clockwise) for opponent seat `i` of `total`,
 * spread across the top ~200° of the table so the bottom stays clear for the
 * viewer's own hand. */
function seatAngle(i: number, total: number): number {
  if (total <= 1) return 0;
  const spread = 200;
  return -spread / 2 + (i * spread) / (total - 1);
}

export function Table({ G, opponents, currentPlayerID, nameOf, calloutsFor }: TableProps) {
  const deckCount = G.deck.length;
  const stackSize = Math.min(4, deckCount);

  return (
    <div className={styles.tableWrap}>
      <div className={styles.felt}>
        <div className={styles.centerPile}>
          <div className={styles.deckStack}>
            {stackSize === 0 ? (
              <div className={styles.emptyDeck}>Empty</div>
            ) : (
              Array.from({ length: stackSize }).map((_, i) => (
                <img key={i} src={CARD_BACK_IMAGE} alt="" className={styles.deckCard} />
              ))
            )}
          </div>
          <span className={styles.deckLabel}>Court Deck · {deckCount}</span>
        </div>

        {opponents.map((id, i) => {
          const angle = seatAngle(i, opponents.length);
          const rad = (angle * Math.PI) / 180;
          const left = 50 + 42 * Math.sin(rad);
          const top = 50 - 38 * Math.cos(rad);
          return (
            <div key={id} className={styles.seatSlot} style={{ left: `${left}%`, top: `${top}%` }}>
              <PlayerPanel
                name={nameOf(id)}
                player={G.players[id]}
                isCurrentTurn={id === currentPlayerID}
                eliminated={isEliminated(G.players[id])}
                callouts={calloutsFor(id)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
