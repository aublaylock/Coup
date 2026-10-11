import { useState } from 'react';
import { ACTION_BLOCKERS } from '../../game/deck';
import { roleLabel } from '../../game/helpers';
import styles from './ActionBar.module.css';

type TargetAction = 'steal' | 'assassinate' | 'coup';

interface ActionBarProps {
  coins: number;
  targets: { id: string; name: string }[];
  moves: Record<string, (...args: any[]) => void>;
}

const TARGET_LABEL: Record<TargetAction, string> = {
  steal: 'steal from',
  assassinate: 'assassinate',
  coup: 'coup',
};

type ActionKey = keyof typeof ACTION_BLOCKERS;

// Actions only the targeted player may block; anyone may block the rest.
const TARGET_ONLY_BLOCK: ActionKey[] = ['steal', 'assassinate'];

function blockHint(action: ActionKey): string {
  const roles = ACTION_BLOCKERS[action];
  if (roles.length === 0) return "Can't be blocked";
  const names = roles.map(roleLabel).join(' or ');
  return TARGET_ONLY_BLOCK.includes(action) ? `Target can block with ${names}` : `Any player can block with ${names}`;
}

/** Hover hint naming who can block the action. Shown via CSS on button hover. */
function BlockHint({ action }: { action: ActionKey }) {
  return <span className={styles.hint}>{blockHint(action)}</span>;
}

export function ActionBar({ coins, targets, moves }: ActionBarProps) {
  const [pendingTargetAction, setPendingTargetAction] = useState<TargetAction | null>(null);
  const mustCoup = coins >= 10;

  if (pendingTargetAction) {
    const fire = (targetID: string) => {
      if (pendingTargetAction === 'steal') moves.steal(targetID);
      if (pendingTargetAction === 'assassinate') moves.assassinate(targetID);
      if (pendingTargetAction === 'coup') moves.coup(targetID);
      setPendingTargetAction(null);
    };
    return (
      <div className={styles.bar}>
        <p className={styles.prompt}>Choose who to {TARGET_LABEL[pendingTargetAction]}:</p>
        <div className={styles.row}>
          {targets.map((t) => (
            <button key={t.id} className={styles.targetBtn} onClick={() => fire(t.id)}>
              {t.name}
            </button>
          ))}
          <button className={styles.cancelBtn} onClick={() => setPendingTargetAction(null)}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.bar}>
      <p className={styles.prompt}>
        {mustCoup ? 'You have 10+ coins — you must Coup.' : 'Your turn — choose an action:'}
      </p>
      <div className={styles.row}>
        <button className={styles.actionBtn} disabled={mustCoup} onClick={() => moves.income()}>
          Income <span className={styles.cost}>+1</span>
          <BlockHint action="income" />
        </button>
        <button className={styles.actionBtn} disabled={mustCoup} onClick={() => moves.foreignAid()}>
          Foreign Aid <span className={styles.cost}>+2</span>
          <BlockHint action="foreign_aid" />
        </button>
        <button className={styles.actionBtn} disabled={mustCoup} onClick={() => moves.tax()}>
          Tax (Duke) <span className={styles.cost}>+3</span>
          <BlockHint action="tax" />
        </button>
        <button
          className={styles.actionBtn}
          disabled={mustCoup || targets.length === 0}
          onClick={() => setPendingTargetAction('steal')}
        >
          Steal (Captain) <span className={styles.cost}>+2</span>
          <BlockHint action="steal" />
        </button>
        <button
          className={styles.actionBtn}
          disabled={mustCoup || coins < 3 || targets.length === 0}
          onClick={() => setPendingTargetAction('assassinate')}
        >
          Assassinate <span className={styles.cost}>-3</span>
          <BlockHint action="assassinate" />
        </button>
        <button className={styles.actionBtn} disabled={mustCoup} onClick={() => moves.exchange()}>
          Exchange (Ambassador)
          <BlockHint action="exchange" />
        </button>
        <button
          className={styles.actionBtn}
          disabled={coins < 7 || targets.length === 0}
          onClick={() => setPendingTargetAction('coup')}
        >
          Coup <span className={styles.cost}>-7</span>
          <BlockHint action="coup" />
        </button>
      </div>
    </div>
  );
}
