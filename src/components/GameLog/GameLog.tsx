import { useEffect, useRef } from 'react';
import type { LogEntry } from '../../game/types';
import { resolveNameTags } from '../../game/helpers';
import styles from './GameLog.module.css';

interface GameLogProps {
  entries: LogEntry[];
  names: Record<string, string>;
}

export function GameLog({ entries, names }: GameLogProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [entries.length]);

  return (
    <div className={styles.log} ref={ref}>
      {entries.map((e) => (
        <div key={e.id} className={styles.entry}>
          {resolveNameTags(e.text, names)}
        </div>
      ))}
    </div>
  );
}
