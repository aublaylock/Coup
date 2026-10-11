import type { Callout, CoupPlayer, Role } from '../../game/types';
import { ROLE_INFO, CARD_BACK_IMAGE, COIN_IMAGE } from '../../game/deck';
import styles from './PlayerPanel.module.css';

interface PlayerPanelProps {
  name: string;
  player: CoupPlayer;
  isCurrentTurn: boolean;
  eliminated: boolean;
  /** This player's actions/blocks/challenges this turn, oldest first, with names already resolved. */
  callouts: Callout[];
}

function CardFace({ role, revealed }: { role: Role | 'hidden'; revealed: boolean }) {
  const src = revealed ? ROLE_INFO[role as Role].image : CARD_BACK_IMAGE;
  const alt = revealed ? ROLE_INFO[role as Role].label : 'Face-down card';
  return (
    <div className={`${styles.card} ${revealed ? styles.cardRevealed : ''}`}>
      <img src={src} alt={alt} draggable={false} />
    </div>
  );
}

export function PlayerPanel({ name, player, isCurrentTurn, eliminated, callouts }: PlayerPanelProps) {
  return (
    <div className={[styles.seat, isCurrentTurn ? styles.currentTurn : '', eliminated ? styles.eliminated : ''].join(' ')}>
      {isCurrentTurn && !eliminated && <div className={styles.turnBadge}>Turn</div>}
      {eliminated && <div className={styles.outBanner}>OUT</div>}
      {callouts.length > 0 && (
        <div className={styles.callouts}>
          {callouts.map((c, i) => (
            <div key={i} className={`${styles.actionBubble} ${styles[c.kind]}`}>
              {c.text}
            </div>
          ))}
        </div>
      )}
      <div className={styles.cards}>
        {player.influence.map((c, i) => (
          <CardFace key={i} role={c.role} revealed={c.revealed} />
        ))}
      </div>
      <div className={styles.plate}>
        <span className={styles.name}>{name}</span>
        <span className={styles.coins}>
          <img src={COIN_IMAGE} alt="" className={styles.coinIcon} />
          {player.coins}
        </span>
      </div>
    </div>
  );
}
