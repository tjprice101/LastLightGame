import { referencedEffect } from './effect-copy';
import { getMasterConduit, masterChest, masterConduits, type MasterConduitId } from '../content/master-conduits';
import { assetUrl } from './portrait';
import { getStarter, isStarterId } from '../content/starters';
import type { Account } from '../game/account';
import { escapeDialogText } from './game-dialog';
import type { RewardPresentation } from './reward-screen';
import { conduitLore } from './conduit-store';
import { conduitElementLabel, conduitElementTheme } from './conduit-element';
import { imageSource } from './bubble-ui';
import { masterConduitArtRevisions } from '../content/master-conduit-art-revisions';
import { isRadiantMaster, radiantMasterEffect, radiantMasterUnavailable } from './radiant-master-text';

const pendingMasterArt = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect x="40" y="40" width="176" height="176" rx="28" fill="#171717" stroke="#999" stroke-width="4"/><text x="128" y="122" text-anchor="middle" fill="#ddd" font-size="22" font-family="Georgia">Artwork</text><text x="128" y="150" text-anchor="middle" fill="#ddd" font-size="22" font-family="Georgia">pending</text></svg>')}`;

/** Installed Masters have a reviewed revision; others show a neutral pending tile, never a missing PNG URL. */
export function masterArtUrl(id: MasterConduitId): string {
  const art = getMasterConduit(id).art;
  return art && id in masterConduitArtRevisions ? assetUrl(art) : pendingMasterArt;
}

export function masterConduitIcon(id: MasterConduitId): string {
  const entry = getMasterConduit(id);
  const element = getStarter(entry.character).elementId;
  return `<img class="master-art master-element-art" ${conduitElementTheme(element)} draggable="false" src="${masterArtUrl(id)}" alt="${escapeDialogText(entry.name)}" width="256" height="256">`;
}
export function masterChestIcon(): string {
  return `<img class="master-art master-chest-art" draggable="false" src="${assetUrl(masterChest.art)}" alt="${masterChest.name}" width="256" height="256">`;
}
export function masterReference(id?: MasterConduitId | null): string {
  if (!id) return '';
  const entry = getMasterConduit(id);
  return `<section class="master-reference" data-acquisition-master="${entry.id}"><h3>Master · ${entry.name}</h3>${conduitElementLabel(getStarter(entry.character).elementId)}<p>${referencedEffect(escapeDialogText(radiantMasterEffect(entry.id)))}</p><small>${getStarter(entry.character).name} only · Cannot be upgraded</small>${conduitLore(entry.lore)}</section>`;
}
export function masterEquipment(character: string, account: Account | null): string {
  if (!isStarterId(character)) return '<div class="ref-master-slot"><strong>Master slot</strong><p>Character Masters are for their named Element-Bearer only.</p></div>';
  const current = account?.masterEquipment?.[character];
  const choices = masterConduits.filter(entry => entry.character === character && account?.masterConduits?.[entry.id] === 1);
  return `<section class="ref-master-slot"><h3>Master slot</h3><label for="master-${character}">Master Conduit · ${getStarter(character).name}</label>
    ${current ? masterConduitIcon(current) : ''}
    <select id="master-${character}" data-master-equipment="${character}" ${!account ? 'disabled' : ''}>
      <option value="">No Master equipped</option>${choices.map(entry => `<option value="${entry.id}" ${entry.id === current ? 'selected' : ''}${isRadiantMaster(entry.id) ? '' : ' disabled'}>${entry.name} · Omnic Master${isRadiantMaster(entry.id) ? '' : ` · ${radiantMasterUnavailable}`}</option>`).join('')}</select>
    ${masterReference(current)}<p>One character-specific Master, separate from eight ordinary slots. Find choice chests on the final Machines boss (${masterChest.chance * 100}%) or open a Machines Calamity EX+3 chest for two guaranteed choice chests.</p></section>`;
}
export function masterReward(id: MasterConduitId, account: Account): RewardPresentation {
  if (account.masterConduits?.[id] !== 1) throw new Error('Saved Master reward is not owned.');
  const entry = getMasterConduit(id);
  return { cinematic: { kind: 'chest', eyebrow: "Machine's Master Chest", title: entry.name, subtitle: 'Master Conduit unlocked', art: imageSource(masterConduitIcon(id)), tier: 'prismatic',
    palette: { accent: getStarter(entry.character).color, theme: 'prismatic' } },
    celebration: 'Master Conduit unlocked',
    title: 'Master Conduit unlocked', name: entry.name, rarity: 'Omnic', art: `<div class="master-reward-art">${masterConduitIcon(id)}</div>`,
    details: `${conduitElementLabel(getStarter(entry.character).elementId)}<p>Omnic Master · ${getStarter(entry.character).name}</p><p>${referencedEffect(escapeDialogText(radiantMasterEffect(entry.id)))}</p><p>One chest opened. Not auto-equipped. Equip in Team.</p>`,
    accent: getStarter(entry.character).color,
    animationLabel: "Revealing your Master Conduit",
    savedLabel: "Master Conduit saved. Equip it in Team." };
}
export function masterRewards(ids: readonly MasterConduitId[], account: Account): RewardPresentation {
  if (!ids.length || new Set(ids).size !== ids.length) throw new Error('Choose a non-empty list of unique Masters.');
  const entries = ids.map(id => getMasterConduit(id));
  if (entries.some(entry => account.masterConduits?.[entry.id] !== 1)) throw new Error('A saved Master reward is not owned.');
  const lead = getStarter(entries[0].character);
  const details = `<section class="master-bulk-rewards summon-ten-grid" aria-label="All saved Master Conduits">${entries.map(entry => {
    const character = getStarter(entry.character);
    return `<article class="summon-ten-result master-bulk-reward" data-rarity="Omnic">
      <div class="summon-ten-art">${masterConduitIcon(entry.id)}</div><b>${escapeDialogText(entry.name)}</b>
      <small>${escapeDialogText(character.name)} · ${conduitElementLabel(character.elementId)} · Omnic Master</small>
      <details><summary>Inspect Master details</summary><p>${referencedEffect(escapeDialogText(radiantMasterEffect(entry.id)))}</p></details></article>`;
  }).join('')}</section><p>${entries.length} Master Conduit${entries.length === 1 ? '' : 's'} saved. None were auto-equipped.</p>`;
  return {
    cinematic: { kind: 'chest', eyebrow: "Machine's Master Chest", title: `${entries.length} Masters unlocked`,
      subtitle: 'Master Conduits saved', art: imageSource(masterChestIcon()), tier: 'prismatic',
      palette: { accent: lead.color, theme: 'prismatic' } },
    title: 'Master Conduits unlocked', name: `${entries.length} saved Master${entries.length === 1 ? '' : 's'}`,
    rarity: 'Omnic', art: `<div class="master-bulk-chest-art">${masterChestIcon()}</div>`, details,
    accent: lead.color, animationLabel: 'Revealing your Master Conduits',
    savedLabel: `${entries.length} Master Conduit${entries.length === 1 ? '' : 's'} saved. None were auto-equipped.`,
    celebration: 'Master Conduits unlocked',
  };
}
