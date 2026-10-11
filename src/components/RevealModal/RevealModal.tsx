import type { InfluenceCard, Role } from '../../game/types';
import { ROLE_INFO } from '../../game/deck';
import styles from './RevealModal.module.css';

interface RevealModalProps {
  reason: string;
  myID: string;
  influence: InfluenceCard[];
  moves: Record<string, (...args: any[]) => void>;
}

export function RevealModal({ reason, myID, influence, moves }: RevealModalProps) {
  const choices = influence
    .map((c, i) => ({ ...c, index: i }))
    .filter((c) => !c.revealed);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>You must reveal an influence</h2>
        <p className={styles.reason}>Reason: you {reason}.</p>
        <div className={styles.choices}>
          {choices.map((c) => {
            const info = ROLE_INFO[c.role as Role];
            return (
              <button
                key={c.index}
                className={styles.choiceBtn}
                onClick={() => moves.revealInfluence(myID, c.index)}
              >
                <img src={info.image} alt={info.label} className={styles.cardImg} draggable={false} />
                <span>{info.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
