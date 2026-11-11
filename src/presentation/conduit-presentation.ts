import { type Account } from '../game/account';
import { getConduit, conduitEffect, type ConduitId } from '../content/conduits';
import { conduitIcon, conduitRarity } from './conduit-store';
import { escapeDialogText } from './game-dialog';
import { type RewardPresentation } from './reward-screen';
import { referencedEffect } from './effect-copy';
import { elementAccents } from '../content/dungeon-art';
import { imageSource, rarityPalette, rarityTier } from './bubble-ui';
import { conduitElement } from './conduit-element';

export function conduitReward(id: ConduitId, account: Account, title: string, receipt: string): RewardPresentation {
  const conduit = getConduit(id);
  const owned = account.conduits?.[id] ?? 0;
  if (owned < 1) throw new Error('Saved Conduit reward is not owned.');
  const level = account.conduitUpgrades?.[id] ?? 0;
  const art = conduitIcon(id, level);
  const effect = referencedEffect(escapeDialogText(conduitEffect(conduit, level)));
  return {
    cinematic: { kind: 'conduit', eyebrow: `${conduit.rarity} Conduit`, title: conduit.name, subtitle: title, art: imageSource(art), tier: rarityTier(conduit.rarity),
      palette: conduit.rarity === 'Omnic' && conduit.element ? { accent: elementAccents[conduit.element], theme: 'prismatic' } : rarityPalette(conduit.rarity) },
    celebration: title,
    title, name: conduit.name, rarity: conduit.rarity, accent: conduit.rarity === 'Omnic' && conduit.element ? elementAccents[conduit.element] : '#ffffff', animationLabel: 'Conduit unlocked',
    art: `<span class="conduit-reward-art">${art}</span>`,
    information: { metadata: `${conduitRarity(id)}${conduitElement(id)}`, effects: [effect], owned,
      state: `Upgrade +${level} · Account-wide unlock · Not auto-equipped`, acquisition: receipt },
    details: `${conduitRarity(id)}<p>Upgrade +${level} · Owned ${owned}</p>
      <p>${effect}</p><p>${escapeDialogText(receipt)}</p><p>Account-wide unlock · Not auto-equipped</p>`,
  };
}
