import { useState } from 'react';
import type { InfluenceCard, Role } from '../../game/types';
import { ROLE_INFO } from '../../game/deck';
import styles from './ExchangeModal.module.css';

interface ExchangeModalProps {
  drawn: Role[];
  myID: string;
  myInfluence: InfluenceCard[];
  moves: Record<string, (...args: any[]) => void>;
}

export function ExchangeModal({ drawn, myID, myInfluence, moves }: ExchangeModalProps) {
  const unrevealed = myInfluence.filter((c) => !c.revealed).map((c) => c.role as Role);
  const pool = [...unrevealed, ...drawn].map((role, key) => ({ role, key }));
  const keepCount = unrevealed.length;
  const [selected, setSelected] = useState<number[]>([]);

  const toggle = (key: number) => {
    setSelected((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      if (prev.length >= keepCount) return prev;
      return [...prev, key];
    });
  };

  const confirm = () => {
    if (selected.length !== keepCount) return;
    const keepRoles = pool.filter((p) => selected.includes(p.key)).map((p) => p.role);
    moves.confirmExchange(myID, keepRoles);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Ambassador Exchange</h2>
        <p className={styles.hint}>
          Choose {keepCount} card{keepCount > 1 ? 's' : ''} to keep — the rest go back to the Court deck.
        </p>
        <div className={styles.pool}>
          {pool.map((p) => {
            const info = ROLE_INFO[p.role];
            const isSelected = selected.includes(p.key);
            return (
              <button
                key={p.key}
                className={`${styles.card} ${isSelected ? styles.selected : ''}`}
                onClick={() => toggle(p.key)}
              >
                <img src={info.image} alt={info.label} className={styles.cardImg} draggable={false} />
                <span>{info.label}</span>
              </button>
            );
          })}
        </div>
        <button className={styles.confirmBtn} disabled={selected.length !== keepCount} onClick={confirm}>
          Confirm ({selected.length}/{keepCount})
        </button>
      </div>
    </div>
  );
}
