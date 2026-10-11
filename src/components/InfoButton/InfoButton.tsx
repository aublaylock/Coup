import { useEffect, useState } from 'react';
import { INFO_CARD_IMAGE } from '../../game/deck';
import styles from './InfoButton.module.css';

/** Fixed top-right button that opens the action reference card. */
export function InfoButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button className={styles.infoBtn} onClick={() => setOpen(true)} aria-label="Show rules reference">
        i
      </button>
      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Close">
              ×
            </button>
            <img src={INFO_CARD_IMAGE} alt="Coup action reference" className={styles.infoImg} draggable={false} />
          </div>
        </div>
      )}
    </>
  );
}
