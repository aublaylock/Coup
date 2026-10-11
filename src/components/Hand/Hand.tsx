import type { Callout, CoupPlayer, Role } from '../../game/types';
import { ROLE_INFO, COIN_IMAGE } from '../../game/deck';
import styles from './Hand.module.css';

interface HandProps {
  name: string;
  player: CoupPlayer;
  /** Your actions/blocks/challenges this turn, oldest first, with names already resolved. */
  callouts: Callout[];
}

export function Hand({ name, player, callouts }: HandProps) {
  return (
    <div className={styles.hand}>
      {callouts.length > 0 && (
        <div className={styles.callouts}>
          {callouts.map((c, i) => (
            <div key={i} className={`${styles.actionBubble} ${styles[c.kind]}`}>
              {c.text}
            </div>
          ))}
        </div>
      )}
      <div className={styles.coinStack}>
        <img src={COIN_IMAGE} alt="" className={styles.coinIcon} />
        <span className={styles.coinCount}>{player.coins}</span>
      </div>

      <div className={styles.cards}>
        {player.influence.map((c, i) => {
          const info = ROLE_INFO[c.role as Role];
          return (
            <div key={i} className={`${styles.card} ${c.revealed ? styles.cardRevealed : ''}`}>
              <img src={info.image} alt={info.label} draggable={false} />
              {c.revealed && <span className={styles.revealedTag}>Revealed</span>}
            </div>
          );
        })}
      </div>

      <div className={styles.nameTag}>{name}</div>
    </div>
  );
}
