import { creatures, creatureLoot, type CreatureLoot } from '../content/creatures';
import { elements, type ElementId, type InfusionModeId } from '../content/activities';
import { isPlayableDungeon, dungeonEncounter } from '../content/dungeons';
import { infusionEncounter, isInfusionMode } from '../content/infusions';
import { elementalWars, isWarCharacter, warEncounter, warLoot, type WarCharacterId } from '../content/elemental-war';
import { storyBossBonus, storyCompletionReward, storyReplayReward, storyEncounter, storyLoot, storyRules } from '../content/story';
import { roseCaptureAllowed } from '../content/roses';
import { materialArt, materialName } from '../content/dungeon-art';
import { getConduit, isConduitId } from '../content/conduits';
import { mechanicalComponents } from '../content/mechanical-components';
import { masterChest } from '../content/master-conduits';
import { characterArt, characterName } from '../content/character-art';
import type { Account } from '../game/account';
import { assetUrl } from './portrait';
import { currencyIcon } from './currency-icon';
import { mechanicalComponentIcon } from './mechanical-component-icon';
import { masterChestIcon } from './master-conduits';
import { escapeDialogText } from './game-dialog';
import './stage-loot.css';
import { conduitIcon } from './conduit-store';
import { conduitElement, omnicTheme } from './conduit-element';

export type StageLootSource =
  | { kind: 'story' }
  | { kind: 'dungeon'; element: ElementId }
  | { kind: 'infusion'; mode: InfusionModeId }
  | { kind: 'war'; character: WarCharacterId };

type LootGroup = 'currency' | 'material' | 'conduit-common' | 'conduit-rare' | 'conduit-legendary' | 'conduit-omnic' | 'item' | 'capture' | 'recruit' | 'clear' | 'first';

interface LootEntry {
  id: string;
  group: LootGroup;
  icon: string;
  name: string;
}

interface StageLoot {
  title: string;
  level: number;
  boss: boolean;
  entries: LootEntry[];
}

const groupTitles: Record<LootGroup, string> = {
  currency: 'Currencies',
  material: 'Materials',
  'conduit-common': 'Common Conduits',
  'conduit-rare': 'Rare Conduits',
  'conduit-legendary': 'Legendary Conduits',
  'conduit-omnic': 'Omnic Conduits',
  item: 'Items',
  capture: 'Elemental-Devourers',
  recruit: 'Element-Bearers',
  clear: 'Stage clear',
  first: 'First clear',
};
export function parseStageLootSource(value: string | undefined): StageLootSource {
  const [kind, id] = (value ?? '').split(':');
  if (kind === 'story') return { kind };
  if (kind === 'dungeon' && isPlayableDungeon(id)) return { kind, element: id };
  if (kind === 'infusion' && isInfusionMode(id)) return { kind, mode: id };
  if (kind === 'war' && isWarCharacter(id)) return { kind, character: id };
  throw new Error('Unknown stage loot source.');
}

function itemIcon(id: string, account: Account | null): string {
  if (id === 'fractalis' || id === 'lycalis') return currencyIcon(id);
  if (id === mechanicalComponents.id) return mechanicalComponentIcon();
  if (id === masterChest.id) return masterChestIcon();
  if (isConduitId(id)) {
    return conduitIcon(id, account?.conduitUpgrades?.[id]);
  }
  const art = materialArt(id);
  return art ? `<img draggable="false" src="${assetUrl(`materials/${art}.png`)}" alt="" width="80" height="80">` : '<span class="item-showcase-pending">Artwork pending</span>';
}

function itemName(id: string): string {
  if (id === 'fractalis') return 'Prismatica';
  if (id === 'lycalis') return 'Null-Prismatica';
  if (id === mechanicalComponents.id) return mechanicalComponents.name;
  if (id === masterChest.id) return masterChest.name;
  if (isConduitId(id)) return getConduit(id).name;
  return materialName(id);
}

function dropGroup(id: string): LootGroup {
  if (id === 'fractalis' || id === 'lycalis') return 'currency';
  if (isConduitId(id)) return `conduit-${getConduit(id).rarity.toLowerCase()}` as LootGroup;
  if (id === mechanicalComponents.id || id === masterChest.id) return 'item';
  return 'material';
}

/** List the enemy's baseline pool, independent of ownership and focus. */
function dropEntries(drops: readonly CreatureLoot[], account: Account | null, group?: LootGroup): LootEntry[] {
  return drops.filter((drop) => drop.chance > 0 && drop.maximum > 0)
    .map((drop) => ({ id: drop.id, group: group ?? dropGroup(drop.id), icon: itemIcon(drop.id, account), name: itemName(drop.id) }));
}

function creatureAt(stage: number, match: (creature: (typeof creatures)[number]) => boolean) {
  const creature = creatures.find((entry) => match(entry) && entry.stages.includes(stage));
  if (!creature) throw new Error('No enemies appear at this stage.');
  return creature;
}

function unique(entries: LootEntry[]): LootEntry[] {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    const key = `${entry.group}:${entry.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function stageLoot(source: StageLootSource, stage: number, account: Account | null): StageLoot {
  if (source.kind === 'story') {
    const encounter = storyEncounter(stage);
    const entries = dropEntries(storyLoot(stage), account);
    entries.push(...dropEntries([{ id: 'fractalis', minimum: storyReplayReward.fractalis, maximum: storyReplayReward.fractalis, chance: 1 }], account, 'clear'));
    const first: CreatureLoot[] = [{ id: 'lycalis', minimum: storyCompletionReward.lycalis, maximum: storyCompletionReward.lycalis, chance: 1 }];
    if (encounter.boss) {
      const bonus = storyBossBonus(stage);
      first.unshift({ id: 'fractalis', minimum: bonus.fractalis, maximum: bonus.fractalis, chance: 1 });
    }
    entries.push(...dropEntries(first, account, 'first'));
    return { title: `${encounter.name} · Stage ${encounter.regionStage}`, level: encounter.level, boss: encounter.boss, entries: unique(entries) };
  }
  if (source.kind === 'war') {
    const encounter = warEncounter(source.character, stage);
    const loot = warLoot(stage);
    const name = elementalWars.find((entry) => entry.character === source.character)?.name ?? 'Elemental War';
    const entries = dropEntries([
      { id: 'fractalis', ...loot.fractalis, chance: 1 },
      { id: 'lycalis', minimum: loot.lycalis.quantity, maximum: loot.lycalis.quantity, chance: loot.lycalis.chance },
    ], account);
    if (loot.recruitmentChance) {
      const art = characterArt(source.character, 1).art;
      entries.push({ id: source.character, group: 'recruit', name: characterName(source.character, 1),
        icon: `<img draggable="false" src="${assetUrl(`characters/${art}.png`)}" alt="" width="80" height="80">` });
    }
    return { title: `${name} · Stage ${stage}`, level: encounter.level, boss: true, entries: unique(entries) };
  }
  if (source.kind === 'dungeon') {
    const encounter = dungeonEncounter(source.element, stage);
    const creature = creatureAt(stage, (entry) => entry.dungeonElement === source.element);
    const name = elements.find((entry) => entry.id === source.element)?.dungeon ?? 'Dungeon';
    return { title: `${name} · Stage ${stage}`, level: encounter.level, boss: encounter.boss, entries: unique(dropEntries(creatureLoot(creature, stage), account)) };
  }
  const encounter = infusionEncounter(source.mode, stage);
  const creature = creatureAt(stage, (entry) => entry.mode === source.mode);
  const entries = dropEntries(creatureLoot(creature, stage), account);
  if (source.mode !== 'machines' && (source.mode !== 'roses' || roseCaptureAllowed(encounter.level))) {
    entries.push({ id: creature.id, group: 'capture', name: encounter.enemy.name,
      icon: `<img draggable="false" src="${assetUrl(`enemies/${encounter.enemy.art}.png`)}" alt="" width="80" height="80">` });
  }
  return { title: `${encounter.name} · Stage ${stage}`, level: encounter.level, boss: encounter.boss, entries: unique(entries) };
}

function entryCard(entry: LootEntry): string {
  return `<li class="stage-loot-item" ${isConduitId(entry.id) ? omnicTheme(entry.id) : ''} data-stage-loot-item="${escapeDialogText(entry.id)}">
    <span class="stage-loot-art">${entry.icon}</span><strong>${escapeDialogText(entry.name)}</strong>${isConduitId(entry.id) ? conduitElement(entry.id) : ''}</li>`;
}

export function stageLootContent(source: StageLootSource, stage: number, account: Account | null): string {
  const loot = stageLoot(source, stage, account);
  const groups = (Object.keys(groupTitles) as LootGroup[]).filter((group) => loot.entries.some((entry) => entry.group === group));
  return `<p class="stage-loot-meta">Enemy Lv.${loot.level}${loot.boss ? ' · Boss stage' : ''}</p>
    ${groups.map((group) => `<section class="stage-loot-group" aria-label="${groupTitles[group]}"><h3>${groupTitles[group]}</h3>
      <ul class="stage-loot-grid">${loot.entries.filter((entry) => entry.group === group).map(entryCard).join('')}</ul></section>`).join('')}`;
}
export function stageLootButton(source: string, stage?: number, label?: string): string {
  return `<button type="button" class="text-button stage-loot-button" data-stage-loot="${source}" ${stage === undefined ? '' : `data-stage-loot-stage="${stage}"`} aria-haspopup="dialog"${label ? ` aria-label="${escapeDialogText(label)}"` : ''}>Detailed Loot</button>`;
}

export function stageLootSourceOf(select: HTMLSelectElement): string | null {
  if (select.dataset.dungeonStage) return `dungeon:${select.dataset.dungeonStage}`;
  if (select.dataset.infusionStage) return `infusion:${select.dataset.infusionStage}`;
  if (select.dataset.warStage) return `war:${select.dataset.warStage}`;
  return null;
}

/** Opens for Detailed Loot buttons inside `host` and inside the shared stage picker dialog. */
export function bindStageLoot(host: HTMLElement, getAccount: () => Account | null): () => void {
  const dialog = document.createElement('dialog');
  dialog.className = 'information-modal stage-loot-modal';
  dialog.setAttribute('aria-labelledby', 'stage-loot-heading');
  document.body.append(dialog);
  let opener: HTMLElement | null = null;
  const open = (button: HTMLElement): void => {
    const source = parseStageLootSource(button.dataset.stageLoot);
    const select = button.dataset.stageLootStage ? null : button.closest('.activity-entry, footer')?.querySelector<HTMLSelectElement>('select');
    const stage = Number(button.dataset.stageLootStage ?? select?.value);
    if (!Number.isInteger(stage) || stage < 1 || (source.kind === 'story' && stage > storyRules.stages)) throw new Error('Choose a stage to preview its loot.');
    const account = getAccount();
    const heading = document.createElement('h2');
    heading.id = 'stage-loot-heading';
    heading.textContent = `${stageLoot(source, stage, account).title} · Loot`;
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'drawer-close';
    close.setAttribute('aria-label', 'Close Detailed Loot');
    close.textContent = '\u00d7';
    close.addEventListener('click', () => dialog.close());
    const header = document.createElement('header');
    header.className = 'drawer-heading';
    header.append(heading, close);
    const content = document.createElement('div');
    content.className = 'information-content stage-loot-content';
    content.innerHTML = stageLootContent(source, stage, account);
    dialog.replaceChildren(header, content);
    opener = button;
    dialog.showModal();
    close.focus({ preventScroll: true });
  };
  const click = (event: Event): void => {
    const button = (event.target as Element | null)?.closest<HTMLElement>('[data-stage-loot]');
    if (!button || !(host.contains(button) || button.closest('.selection-modal'))) return;
    event.preventDefault();
    open(button);
  };
  const backdrop = (event: MouseEvent): void => { if (event.target === dialog) dialog.close(); };
  const restore = (): void => {
    if (opener?.isConnected) opener.focus({ preventScroll: true });
    opener = null;
  };
  document.addEventListener('click', click);
  dialog.addEventListener('click', backdrop);
  dialog.addEventListener('close', restore);
  return () => {
    document.removeEventListener('click', click);
    if (dialog.open) dialog.close();
    dialog.remove();
  };
}
