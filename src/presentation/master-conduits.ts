import { referencedEffect } from './effect-copy';
import { getMasterConduit, masterChest, masterConduits, type MasterConduitId } from '../content/master-conduits';
import { assetUrl } from './portrait';
import { getStarter, isStarterId } from '../content/starters';
import type { Account } from '../game/account';
import { escapeDialogText } from './game-dialog';
import type { RewardPresentation } from './reward-screen';
import { conduitLore } from './conduit-store';

export function masterConduitIcon(id: MasterConduitId): string {
  const entry = getMasterConduit(id);
  return `<img class="master-art" draggable="false" src="${assetUrl(entry.art)}" alt="${escapeDialogText(entry.name)}" width="256" height="256">`;
}
export function masterChestIcon(): string {
  return `<img class="master-art master-chest-art" draggable="false" src="${assetUrl(masterChest.art)}" alt="${masterChest.name}" width="256" height="256">`;
}
export function masterReference(id?: MasterConduitId | null): string {
  if (!id) return '';
  const entry = getMasterConduit(id);
  return `<section class="master-reference"><h3>Master · ${entry.name}</h3><p>${referencedEffect(entry.effect)}</p><small>${getStarter(entry.character).name} only · Cannot be upgraded</small>${conduitLore(entry.lore)}</section>`;
}
export function masterEquipment(character: string, account: Account | null): string {
  if (!isStarterId(character)) return '<div class="ref-master-slot"><strong>Master slot</strong><p>Character Masters are for their named Element-Bearer only.</p></div>';
  const current = account?.masterEquipment?.[character];
  const choices = masterConduits.filter(entry => entry.character === character && account?.masterConduits?.[entry.id] === 1);
  return `<section class="ref-master-slot"><h3>Master slot</h3><label for="master-${character}">Master Conduit · ${getStarter(character).name}</label>
    ${current ? masterConduitIcon(current) : ''}
    <select id="master-${character}" data-master-equipment="${character}" ${!account ? 'disabled' : ''}>
      <option value="">No Master equipped</option>${choices.map(entry => `<option value="${entry.id}" ${entry.id === current ? 'selected' : ''}>${entry.name} · Omnic Master</option>`).join('')}</select>
    ${masterReference(current)}<p>One character-specific Master, separate from eight ordinary slots. Find choice chests on the final Machines boss (1%) or open any Calamity EX+3 chest for two guaranteed choice chests.</p></section>`;
}
export function masterReward(id: MasterConduitId, account: Account): RewardPresentation {
  if (account.masterConduits?.[id] !== 1) throw new Error('Saved Master reward is not owned.');
  const entry = getMasterConduit(id);
  return { title: 'Master Conduit unlocked', name: entry.name, art: masterConduitIcon(id),
    details: `<p>Omnic Master · ${getStarter(entry.character).name}</p><p>${referencedEffect(escapeDialogText(entry.effect))}</p><p>One chest opened. Not auto-equipped. Equip in Team.</p>`,
    accent: getStarter(entry.character).color, animationLabel: 'Planetary locks released' };
}
