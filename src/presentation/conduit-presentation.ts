import { type Account } from '../game/account';
import { getConduit, conduitEffect, type ConduitId } from '../content/conduits';
import { conduitIcon, conduitRarity } from './conduit-store';
import { escapeDialogText } from './game-dialog';
import { type RewardPresentation } from './reward-screen';

export function conduitReward(id: ConduitId, account: Account, title: string, receipt: string): RewardPresentation {
  const conduit = getConduit(id);
  const owned = account.conduits?.[id] ?? 0;
  if (owned < 1) throw new Error('Saved Conduit reward is not owned.');
  const level = account.conduitUpgrades?.[id] ?? 0;
  return {
    title, name: conduit.name, accent: '#ffffff', animationLabel: 'Ancient mechanism restored',
    art: conduitIcon(id, level),
    details: `${conduitRarity(id)}<p>Upgrade +${level} ~ Owned ${owned}</p>
      <p>${escapeDialogText(conduitEffect(conduit, level))}</p><p>${escapeDialogText(receipt)}</p><p>Account-wide unlock ~ Not auto-equipped</p>`,
  };
}
