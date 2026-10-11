import type { ActionType, PendingAction, Role } from '../../game/types';
import { roleLabel } from '../../game/helpers';
import styles from './ReactionPanel.module.css';

interface ReactionPanelProps {
  pending: PendingAction;
  myID: string;
  names: Record<string, string>;
  moves: Record<string, (...args: any[]) => void>;
}

const ACTION_LABEL: Record<ActionType, string> = {
  foreign_aid: 'Foreign Aid',
  tax: 'Tax',
  steal: 'Stealing',
  assassinate: 'an Assassination',
  exchange: 'an Exchange',
};

export function ReactionPanel({ pending, myID, names, moves }: ReactionPanelProps) {
  const nameOf = (id: string) => names[id] ?? `Player ${Number(id) + 1}`;
  const isBlockStage = pending.stage === 'block';
  const claimant = isBlockStage ? pending.block!.blockerID : pending.actorID;
  const claimedRole = isBlockStage ? pending.block!.claimedRole : pending.claimedRole;
  const canBlock = !isBlockStage && pending.eligibleBlockers.includes(myID) && pending.blockableBy.length > 0;

  const description = isBlockStage
    ? `${nameOf(claimant)} claims the ${roleLabel(claimedRole!)} to block.`
    : `${nameOf(pending.actorID)} attempts ${ACTION_LABEL[pending.action]}` +
      (pending.targetID ? ` against ${nameOf(pending.targetID)}` : '') +
      (claimedRole ? ` — claims the ${roleLabel(claimedRole)}.` : '.');

  return (
    <div className={styles.panel}>
      <p className={styles.description}>{description}</p>
      <div className={styles.buttons}>
        <button className={styles.pass} onClick={() => moves.respondPass(myID)}>
          Pass
        </button>
        {claimedRole && (
          <button className={styles.challenge} onClick={() => moves.respondChallenge(myID)}>
            Challenge ({roleLabel(claimedRole)}?)
          </button>
        )}
        {canBlock &&
          pending.blockableBy.map((role) => (
            <button key={role} className={styles.block} onClick={() => moves.respondBlock(myID, role)}>
              Block as {roleLabel(role)}
            </button>
          ))}
      </div>
    </div>
  );
}
