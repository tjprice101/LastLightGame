import { creatures, creatureLoot, type CreatureLoot } from '../content/creatures';
import { elements, type ElementId, type InfusionModeId } from '../content/activities';
import { isPlayableDungeon, dungeonEncounter } from '../content/dungeons';
import { infusionEncounter, isInfusionMode } from '../content/infusions';
import { elementalWars, isWarCharacter, warEncounter, warLoot, type WarCharacterId } from '../content/elemental-war';
import { storyBossBonus, storyCompletionReward, storyReplayReward, storyEncounter, storyLoot, storyRules } from '../content/story';
import { roseCaptureAllowed } from '../content/roses';
import { materialArt, materialName } from '../content/dungeon-art';
import { formatStat } from '../content/combat';
import { getConduit, isConduitId } from '../content/conduits';
import { mechanicalComponents } from '../content/mechanical-components';
import { masterChest } from '../content/master-conduits';
import { characterArt, characterName } from '../content/character-art';
import { capturedLevelCap } from '../game/character-instances';
import type { Account } from '../game/account';
import { assetUrl } from './portrait';
import { currencyIcon } from './currency-icon';
import { conduitIcon } from './conduit-store';
import { mechanicalComponentIcon } from './mechanical-component-icon';
import { masterChestIcon } from './master-conduits';
import { escapeDialogText } from './game-dialog';
import './stage-loot.css';

export type StageLootSource =
  | { kind: 'story' }
  | { kind: 'dungeon'; element: ElementId }
  | { kind: 'infusion'; mode: InfusionModeId }
  | { kind: 'war'; character: WarCharacterId };

type LootGroup = 'kill' | 'capture' | 'recruit' | 'clear' | 'first';

interface LootEntry {
  id: string;
  group: LootGroup;
  icon: string;
  name: string;
  amount: string;
  chance: number;
  note?: string;
}

interface StageLoot {
  title: string;
  level: number;
  boss: boolean;
  entries: LootEntry[];
  notes: string[];
}

const groupTitles: Record<LootGroup, string> = {
  kill: 'Per-enemy drops',
  capture: 'Captures',
  recruit: 'Recruitment',
  clear: 'Stage-clear reward',
  first: 'First-clear bonus',
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
  if (isConduitId(id)) return conduitIcon(id, account?.conduitUpgrades?.[id]);
  const art = materialArt(id);
  return art ? `<img draggable="false" src="${assetUrl(`materials/${art}.png`)}" alt="" width="80" height="80">` : '<span class="item-showcase-pending">Artwork pending</span>';
}

function itemName(id: string): string {
  if (id === 'fractalis') return 'Prismatica';
  if (id === 'lycalis') return 'Null-Prismatica';
  if (id === mechanicalComponents.id) return mechanicalComponents.name;
  if (id === masterChest.id) return masterChest.name;
  if (isConduitId(id)) {
    const conduit = getConduit(id);
    return `${conduit.name} · ${conduit.rarity}`;
  }
  return materialName(id);
}

function range(minimum: number, maximum: number): string {
  return minimum === maximum ? minimum.toLocaleString('en-US') : `${minimum.toLocaleString('en-US')}-${maximum.toLocaleString('en-US')}`;
}

function dropEntries(drops: readonly CreatureLoot[], account: Account | null, group: LootGroup = 'kill', keepNotes = false): LootEntry[] {
  return drops.map((drop) => ({ id: drop.id, group, icon: itemIcon(drop.id, account), name: itemName(drop.id),
    amount: `×${range(drop.minimum, drop.maximum)}`, chance: drop.chance, ...(keepNotes && drop.note ? { note: drop.note } : {}) }));
}

function creatureAt(stage: number, match: (creature: (typeof creatures)[number]) => boolean) {
  const creature = creatures.find((entry) => match(entry) && entry.stages.includes(stage));
  if (!creature) throw new Error('No enemies appear at this stage.');
  return creature;
}

export function stageLoot(source: StageLootSource, stage: number, account: Account | null): StageLoot {
  if (source.kind === 'story') {
    const encounter = storyEncounter(stage);
    const entries = dropEntries(storyLoot(stage), account);
    const cleared = (account?.storyCompleted ?? 0) >= stage;
    const firstNote = cleared ? 'Already earned on this account.' : 'First clear of this stage only.';
    entries.push(...dropEntries([
      { id: 'fractalis', minimum: storyReplayReward.fractalis, maximum: storyReplayReward.fractalis, chance: 1, note: 'Every clear.' },
    ], account, 'clear', true));
    entries.push(...dropEntries([
      { id: 'lycalis', minimum: storyCompletionReward.lycalis, maximum: storyCompletionReward.lycalis, chance: 1, note: firstNote },
    ], account, 'first', true));
    if (encounter.boss) {
      const bonus = storyBossBonus(stage);
      const note = cleared ? 'Already earned on this account.' : 'Regional boss first clear only.';
      entries.push(...dropEntries([
        { id: 'fractalis', minimum: bonus.fractalis, maximum: bonus.fractalis, chance: 1, note },
        { id: 'lycalis', minimum: bonus.lycalis, maximum: bonus.lycalis, chance: 1, note },
      ], account, 'first', true));
    }
    return { title: `${encounter.name} · Stage ${encounter.regionStage}`, level: encounter.level, boss: encounter.boss, entries, notes: [] };
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
      entries.push({ id: source.character, group: 'recruit', name: characterName(source.character, 1), amount: 'Lv.0 · Evo.1', chance: loot.recruitmentChance,
        icon: `<img draggable="false" src="${assetUrl(`characters/${art}.png`)}" alt="" width="80" height="80">`,
        note: 'Already owned converts to 100 Null-Prismatica.' });
    }
    return { title: `${name} · Stage ${stage}`, level: encounter.level, boss: true, entries, notes: [] };
  }
  if (source.kind === 'dungeon') {
    const encounter = dungeonEncounter(source.element, stage);
    const creature = creatureAt(stage, (entry) => entry.dungeonElement === source.element);
    const name = elements.find((entry) => entry.id === source.element)?.dungeon ?? 'Dungeon';
    return { title: `${name} · Stage ${stage}`, level: encounter.level, boss: encounter.boss, entries: dropEntries(creatureLoot(creature, stage), account),
      notes: [] };
  }
  const encounter = infusionEncounter(source.mode, stage);
  const creature = creatureAt(stage, (entry) => entry.mode === source.mode);
  const drops = creatureLoot(creature, stage, account?.conduits);
  const entries = dropEntries(drops, account);
  if (source.mode !== 'machines' && (source.mode !== 'roses' || roseCaptureAllowed(encounter.level))) {
    entries.push({ id: creature.id, group: 'capture', name: encounter.enemy.name, amount: `Joins at Lv.${Math.min(capturedLevelCap, encounter.level)}`, chance: .2,
      icon: `<img draggable="false" src="${assetUrl(`enemies/${encounter.enemy.art}.png`)}" alt="" width="80" height="80">`,
      note: 'Keeps this form and its skills.' });
  }
  return { title: `${encounter.name} · Stage ${stage}`, level: encounter.level, boss: encounter.boss, entries,
    notes: [...new Set(drops.flatMap((drop) => drop.note ? [drop.note] : []))] };
}

function entryCard(entry: LootEntry): string {
  return `<li class="stage-loot-item ${entry.chance >= 1 ? 'is-guaranteed' : ''}" data-stage-loot-item="${escapeDialogText(entry.id)}">
    <span class="stage-loot-art">${entry.icon}</span><strong>${escapeDialogText(entry.name)}</strong>
    <span class="stage-loot-amount">${entry.amount}</span>
    <span class="stage-loot-chance">${entry.chance >= 1 ? 'Guaranteed' : `${formatStat(entry.chance * 100)}%`}</span>
    ${entry.note ? `<small>${escapeDialogText(entry.note)}</small>` : ''}</li>`;
}

export function stageLootContent(source: StageLootSource, stage: number, account: Account | null): string {
  const loot = stageLoot(source, stage, account);
  const groups = (Object.keys(groupTitles) as LootGroup[]).filter((group) => loot.entries.some((entry) => entry.group === group));
  return `<p class="stage-loot-meta">Enemy Lv.${loot.level} · ${loot.boss ? 'Boss stage' : 'Standard enemies'}${source.kind === 'war' ? '' : ' · Chances are per enemy defeated'}</p>
    ${groups.map((group) => `<section class="stage-loot-group" aria-label="${groupTitles[group]}"><h3>${groupTitles[group]}</h3>
      <ul class="stage-loot-grid">${loot.entries.filter((entry) => entry.group === group).map(entryCard).join('')}</ul></section>`).join('')}
    ${loot.notes.length ? `<section class="loot-roll-notes" aria-label="Drop roll rules">${loot.notes.map((note) => `<p>${escapeDialogText(note)}</p>`).join('')}</section>` : ''}`;
}

/** Compact artwork strip for a stage option in the shared stage picker. */
export function stageLootStrip(source: StageLootSource, stage: number, account: Account | null, limit = 5): string {
  const entries = stageLoot(source, stage, account).entries.filter((entry) => entry.group === 'kill' || entry.group === 'capture' || entry.group === 'recruit');
  const shown = entries.slice(0, limit);
  return `<span class="stage-loot-strip" aria-hidden="true">${shown.map((entry) => `<span class="stage-loot-strip-art">${entry.icon}</span>`).join('')}${entries.length > limit ? `<span class="stage-loot-more">+${entries.length - limit}</span>` : ''}</span>`;
}

export function stageLootButton(source: string, stage?: number): string {
  return `<button type="button" class="text-button stage-loot-button" data-stage-loot="${source}" ${stage === undefined ? '' : `data-stage-loot-stage="${stage}"`} aria-haspopup="dialog">Detailed Loot</button>`;
}

export function stageLootSourceOf(select: HTMLSelectElement): string | null {
  if (select.dataset.dungeonStage) return `dungeon:${select.dataset.dungeonStage}`;
  if (select.dataset.infusionStage) return `infusion:${select.dataset.infusionStage}`;
  if (select.dataset.warStage) return `war:${select.dataset.warStage}`;
  return null;
}

let accountSource: () => Account | null = () => null;

export function currentStageLootAccount(): Account | null {
  return accountSource();
}

export function bindStageLoot(host: HTMLElement, getAccount: () => Account | null): () => void {
  accountSource = getAccount;
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
    if (!button || !host.contains(button)) return;
    event.preventDefault();
    open(button);
  };
  const backdrop = (event: MouseEvent): void => { if (event.target === dialog) dialog.close(); };
  const restore = (): void => {
    if (opener?.isConnected) opener.focus({ preventScroll: true });
    opener = null;
  };
  host.addEventListener('click', click);
  dialog.addEventListener('click', backdrop);
  dialog.addEventListener('close', restore);
  return () => {
    host.removeEventListener('click', click);
    if (dialog.open) dialog.close();
    dialog.remove();
  };
}
