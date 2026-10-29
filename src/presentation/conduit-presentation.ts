import { type Account } from '../game/account';
import { getConduit, conduitEffect, type ConduitId } from '../content/conduits';
import { conduitIcon, conduitRarity } from './conduit-store';
import { escapeDialogText } from './game-dialog';
import { type RewardPresentation } from './reward-screen';
import { referencedEffect } from './effect-copy';
import { elementAccents } from '../content/dungeon-art';
import { imageSource, rarityPalette, rarityTier } from './bubble-ui';

export function conduitReward(id: ConduitId, account: Account, title: string, receipt: string): RewardPresentation {
  const conduit = getConduit(id);
  const owned = account.conduits?.[id] ?? 0;
  if (owned < 1) throw new Error('Saved Conduit reward is not owned.');
  const level = account.conduitUpgrades?.[id] ?? 0;
  const art = conduitIcon(id, level);
  return {
    cinematic: { kind: 'conduit', eyebrow: `${conduit.rarity} Conduit`, title: conduit.name, subtitle: title, art: imageSource(art), tier: rarityTier(conduit.rarity),
      palette: conduit.rarity === 'Omnic' && conduit.element ? { accent: elementAccents[conduit.element], theme: 'prismatic' } : rarityPalette(conduit.rarity) },
    celebration: title,
    title, name: conduit.name, rarity: conduit.rarity, accent: conduit.rarity === 'Omnic' && conduit.element ? elementAccents[conduit.element] : '#ffffff', animationLabel: 'Ancient mechanism restored',
    art: `<span class="conduit-reward-art">${art}</span>`,
    details: `${conduitRarity(id)}<p>Upgrade +${level} · Owned ${owned}</p>
      <p>${referencedEffect(escapeDialogText(conduitEffect(conduit, level)))}</p><p>${escapeDialogText(receipt)}</p><p>Account-wide unlock · Not auto-equipped</p>`,
  };
}
