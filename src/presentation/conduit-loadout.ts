import { morphElement } from './dom-morph';
import { conduits, conduitBuffs, conduitEffect, conduitColor, conduitEquipReason, conduitSlotCount, conduitUpgradeCap, getConduit, isConduitId, type Conduit, type ConduitBuff, type ConduitSlots } from '../content/conduits';
import { resolveFighter, formatStat } from '../content/combat';
import { getStarter, isStarterId } from '../content/starters';
import { getElement, type ElementId } from '../content/activities';
import { artifactSlots } from '../content/progression';
import { getMasterConduit, isMasterConduitId, masterConduits } from '../content/master-conduits';
import { equippedSquad, ownedProgress, type Account } from '../game/account';
import { resolveCapturedFighter } from '../game/character-instances';
import { getCreature } from '../content/creatures';
import { conduitIcon, conduitLore } from './conduit-store';
import { masterConduitIcon, masterEquipment } from './master-conduits';
import { statDirection } from './stat-change';
import { escapeDialogText, gameChoose } from './game-dialog';
import { phaseZeroStatLabels, phaseZeroStatsReady } from '../content/phase-zero-stats';
import { phaseZeroStaticBonuses, phaseZeroUpgradeMagnitude } from '../content/phase-zero-conduit-stats';
import { referencedEffect } from './effect-copy';

const statLabels: Record<ConduitBuff['stat'], string> = {
  ...phaseZeroStatLabels,
  health: 'Health', damage: 'Attack', defense: 'Defense', crit: 'Critical rate',
  critMultiplier: 'Critical multiplier', elementalDamage: 'Elemental damage', shatterCapacity: 'Elemental Gauge capacity',
  ...(phaseZeroStatsReady ? phaseZeroStatLabels : {}),
};

export const conduitLoadoutPageSize = 4;
const rarityOrder = ['Common', 'Rare', 'Legendary', 'Omnic', 'Calamitic'] as const;
type RarityFilter = '' | (typeof rarityOrder)[number];
type EquipmentFilter = 'all' | 'equipped' | 'unequipped';
export type ConduitLoadoutSort = 'rarity' | 'level' | 'name' | 'ready';
const sortLabels: Record<ConduitLoadoutSort, string> = { rarity: 'Rarity (highest first)', level: 'Upgrade level (highest first)', name: 'Name (A–Z)', ready: 'Ready to equip first' };

/** Transient, in-memory Your Conduits view state; never saved to the account. */
export interface ConduitLoadoutView {
  query: string;
  rarity: RarityFilter;
  equipment: EquipmentFilter;
  sort: ConduitLoadoutSort;
  page: number;
  target: { owner: string; slot: number; signature: string } | null;
}
const initialView = (): ConduitLoadoutView => ({ query: '', rarity: '', equipment: 'all', sort: 'rarity', page: 0, target: null });
let view = initialView();

export function conduitLoadoutView(): Readonly<ConduitLoadoutView> {
  return { ...view, target: view.target ? { ...view.target } : null };
}

/** Clears transient filter/sort/page/target state, e.g. when returning to the title screen. */
export function resetConduitLoadoutView(): void {
  view = initialView();
}

/** Stat-only summary of a Conduit's buffs at an upgrade level, e.g. "+8% Attack". */
export function conduitBuffLine(conduit: Conduit, level = 0): string {
  if (phaseZeroStatsReady) {
    const bonuses = phaseZeroStaticBonuses[conduit.id as keyof typeof phaseZeroStaticBonuses] ?? [];
    return bonuses.map(bonus => {
      const amount = bonus.stat === 'skillDuration' ? bonus.amount : phaseZeroUpgradeMagnitude(bonus.amount, level);
      return `${amount > 0 ? '+' : ''}${formatStat(amount * (bonus.stat === 'skillDuration' ? 1 : 100))}${bonus.stat === 'skillDuration' ? '' : '%'} ${phaseZeroStatLabels[bonus.stat]}`;
    }).join(' · ');
  }
  return conduitBuffs(conduit, level).map((buff) => {
    const amount = `${buff.amount > 0 ? '+' : ''}${formatStat(buff.amount)}`;
    return `${amount}${buff.kind === 'percent' ? '%' : buff.kind === 'percentage-points' ? ' pts' : ''} ${statLabels[buff.stat]}`;
  }).join(' · ');
}

/** Full Conduit Ability text at the displayed upgrade level, including conditional mechanics. */
export function conduitRuleText(conduit: Conduit, level = 0): string {
  return referencedEffect(conduitEffect(conduit, level));
}

export function conduitMatchesSearch(conduit: Conduit, query: string): boolean {
  const element = conduit.element ? getElement(conduit.element) : null;
  const text = [conduit.name, conduit.id, conduit.rarity, conduit.power, conduit.effect,
    conduit.lore, conduitBuffLine(conduit), element?.name,
    element ? '' : 'Any element'].join(' ').toLowerCase();
  return query.trim().toLowerCase().split(/\s+/).every(term => text.includes(term));
}

function rowLevel(row: HTMLElement): number { return Number(row.dataset.loadoutLevel ?? 0); }
function rowRarity(row: HTMLElement): number { return rarityOrder.indexOf((row.dataset.loadoutRarity ?? 'Common') as (typeof rarityOrder)[number]); }

function compareRows(sort: ConduitLoadoutSort, a: HTMLElement, b: HTMLElement): number {
  const catalog = Number(a.dataset.loadoutOrder) - Number(b.dataset.loadoutOrder);
  const name = (a.dataset.loadoutName ?? '').localeCompare(b.dataset.loadoutName ?? '');
  if (sort === 'name') return name || catalog;
  if (sort === 'level') return rowLevel(b) - rowLevel(a) || rowRarity(b) - rowRarity(a) || name || catalog;
  if (sort === 'ready') {
    const ready = (row: HTMLElement) => row.querySelector<HTMLButtonElement>('[data-loadout-equip]:not(:disabled)') ? 0 : row.classList.contains('is-equipped') ? 2 : 1;
    return ready(a) - ready(b) || rowRarity(b) - rowRarity(a) || name || catalog;
  }
  return rowRarity(b) - rowRarity(a) || rowLevel(b) - rowLevel(a) || name || catalog;
}

function applyTarget(loadout: HTMLElement): void {
  const owner = loadout.dataset.characterEquipment ?? '';
  const signature = loadout.dataset.loadoutSignature ?? '';
  const firstEmpty = Number(loadout.dataset.loadoutFirstEmpty ?? -1);
  const target = view.target && view.target.owner === owner && view.target.signature === signature ? view.target.slot : firstEmpty;
  const slotCard = target >= 0 ? loadout.querySelector<HTMLElement>(`[data-loadout-slot="${target}"]`) : null;
  const filledName = slotCard?.dataset.loadoutSlotName;
  loadout.querySelectorAll<HTMLElement>('[data-loadout-slot]').forEach((card) => card.classList.toggle('is-target', card === slotCard));
  loadout.querySelectorAll<HTMLButtonElement>('[data-loadout-select-slot]').forEach((button) => button.setAttribute('aria-pressed', String(Number(button.dataset.loadoutSelectSlot) === target)));
  const cue = loadout.querySelector<HTMLElement>('[data-loadout-target-cue]');
  if (cue) cue.textContent = target < 0 ? 'All slots full · select a slot to replace'
    : filledName ? `Replacing Slot ${target + 1} · ${filledName}` : `Equipping to Slot ${target + 1}`;
  loadout.querySelectorAll<HTMLElement>('[data-loadout-conduit]').forEach((row) => {
    const button = row.querySelector<HTMLButtonElement>('[data-loadout-equip]');
    if (!button) return;
    const reasons = (row.dataset.loadoutReasons ?? '').split('|');
    const reason = target < 0 ? 'All slots full' : reasons[target] ?? '';
    button.dataset.loadoutTarget = String(target);
    button.disabled = !!reason || button.hasAttribute('data-loadout-locked');
    button.textContent = filledName ? 'Replace' : 'Equip';
    button.setAttribute('aria-label', `${filledName ? 'Replace' : 'Equip'} ${row.dataset.loadoutName ?? 'Conduit'}${target >= 0 ? ` in slot ${target + 1}` : ''}`);
    const note = row.querySelector<HTMLElement>('[data-loadout-reason]');
    if (note) { note.textContent = reason; note.hidden = !reason; }
  });
}

/** Applies search, filters, sort, pagination and the equip target to every rendered loadout without account writes. */
function applyLoadoutView(host: HTMLElement): void {
  host.querySelectorAll<HTMLElement>('.conduit-loadout').forEach(applyTarget);
  host.querySelectorAll<HTMLElement>('.loadout-owned').forEach(panel => {
    const input = panel.querySelector<HTMLInputElement>('[data-loadout-search]');
    if (!input) return;
    input.value = view.query;
    panel.querySelectorAll<HTMLButtonElement>('[data-loadout-rarity]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.loadoutRarity === view.rarity)));
    panel.querySelectorAll<HTMLButtonElement>('[data-loadout-equipment-filter]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.loadoutEquipmentFilter === view.equipment)));
    const sort = panel.querySelector<HTMLSelectElement>('[data-loadout-sort]');
    if (sort && sort.value !== view.sort) sort.value = view.sort;
    const list = panel.querySelector<HTMLElement>('.loadout-owned-list');
    const rows = Array.from(panel.querySelectorAll<HTMLElement>('[data-loadout-conduit]'));
    const matches = rows.filter(row => {
      const id = row.dataset.loadoutConduit;
      if (!id || !isConduitId(id)) throw new Error('Conduit search row has an invalid identity.');
      const equipped = row.classList.contains('is-equipped');
      return conduitMatchesSearch(getConduit(id), view.query) && (!view.rarity || row.dataset.loadoutRarity === view.rarity)
        && (view.equipment === 'all' || (view.equipment === 'equipped') === equipped);
    }).sort((a, b) => compareRows(view.sort, a, b));
    const pages = Math.max(1, Math.ceil(matches.length / conduitLoadoutPageSize));
    view.page = Math.min(Math.max(0, view.page), pages - 1);
    const shown = new Set(matches.slice(view.page * conduitLoadoutPageSize, (view.page + 1) * conduitLoadoutPageSize));
    const empty = panel.querySelector<HTMLElement>('[data-loadout-search-empty]');
    if (list) [...matches, ...rows.filter(row => !matches.includes(row))].forEach(row => list.insertBefore(row, empty && empty.parentElement === list ? empty : null));
    rows.forEach(row => { row.hidden = !shown.has(row); });
    const status = panel.querySelector<HTMLElement>('[data-loadout-search-status]');
    if (status) status.textContent = `Showing ${matches.length} of ${rows.length} Conduits`;
    if (empty) empty.hidden = matches.length > 0 || rows.length === 0;
    const pageStatus = panel.querySelector<HTMLElement>('[data-loadout-page-status]');
    if (pageStatus) pageStatus.textContent = `Page ${view.page + 1} of ${pages}`;
    const previous = panel.querySelector<HTMLButtonElement>('[data-loadout-page="previous"]');
    const next = panel.querySelector<HTMLButtonElement>('[data-loadout-page="next"]');
    if (previous) previous.disabled = view.page === 0;
    if (next) next.disabled = view.page >= pages - 1;
  });
}

/** Compatible search entry point used by main/hub after every render; also reapplies filters, sort, page and target. */
export function applyConduitSearch(host: HTMLElement, query: string): void {
  if (query !== view.query) view.page = 0;
  view.query = query;
  applyLoadoutView(host);
}

const boundHosts = new WeakSet<HTMLElement>();

async function showRule(title: string, rule: string, lore: string): Promise<void> {
  await gameChoose(rule, [{ value: 'close', label: 'Close', primary: true }], 'close',
    { title, messageHtml: `<p class="game-confirm-message">${escapeDialogText(rule)}</p>${conduitLore(lore)}` });
}

/**
 * Binds root-delegated filter, sort, pagination, replacement-target and rule-detail controls.
 * Idempotent per host: safe to call on every render; state survives re-renders and updateCharacterTab.
 */
export function bindConduitLoadout(host: HTMLElement): void {
  applyLoadoutView(host);
  if (boundHosts.has(host)) return;
  boundHosts.add(host);
  host.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const control = event.target.closest<HTMLButtonElement>('button[data-loadout-rarity], [data-loadout-equipment-filter], [data-loadout-page], [data-loadout-select-slot], [data-loadout-rule], [data-loadout-master-rule]');
    if (!control || control.disabled || !host.contains(control)) return;
    const data = control.dataset;
    if (data.loadoutRule !== undefined || data.loadoutMasterRule !== undefined) {
      const id = data.loadoutRule ?? data.loadoutMasterRule;
      if (data.loadoutRule !== undefined && isConduitId(id)) {
        const conduit = getConduit(id);
        const level = Number(control.dataset.loadoutDetailLevel ?? 0);
        const rule = conduitRuleText(conduit, level);
        const element = conduit.element ? getElement(conduit.element).name : 'Any element';
        const detail = `${conduit.rarity} · Level ${level} of ${conduitUpgradeCap} · ${element}.`;
        const restrictions = conduit.rarity === 'Omnic' ? 'Matching combat element required. Maximum 4 Omnic Conduits in ordinary slots.' : '';
        void gameChoose(`${detail} ${rule ?? ''} ${restrictions}`, [{ value: 'close', label: 'Close', primary: true }], 'close', {
          title: conduit.name,
          messageHtml: `<div class="loadout-detail"><div class="loadout-detail-art">${conduitIcon(conduit.id, level)}</div><p>${escapeDialogText(detail)}</p><h3>Conduit Ability</h3><p>${escapeDialogText(rule)}</p>${restrictions ? `<p>${escapeDialogText(restrictions)}</p>` : ''}${conduitLore(conduit.lore)}</div>`,
        });
      } else if (isMasterConduitId(id)) {
        const master = getMasterConduit(id);
        void showRule(`${master.name} · Master`, master.effect, master.lore);
      }
      return;
    }
    if (data.loadoutRarity !== undefined) {
      const rarity = data.loadoutRarity as RarityFilter;
      if (rarity !== '' && !rarityOrder.includes(rarity)) return;
      view.rarity = rarity;
      view.page = 0;
    } else if (data.loadoutEquipmentFilter !== undefined) {
      const filter = data.loadoutEquipmentFilter as EquipmentFilter;
      if (!['all', 'equipped', 'unequipped'].includes(filter)) return;
      view.equipment = filter;
      view.page = 0;
    } else if (data.loadoutPage !== undefined) {
      view.page += data.loadoutPage === 'next' ? 1 : -1;
    } else if (data.loadoutSelectSlot !== undefined) {
      const loadout = control.closest<HTMLElement>('.conduit-loadout');
      const slot = Number(data.loadoutSelectSlot);
      if (!loadout || !Number.isInteger(slot) || slot < 0 || slot >= conduitSlotCount) return;
      view.target = { owner: loadout.dataset.characterEquipment ?? '', slot, signature: loadout.dataset.loadoutSignature ?? '' };
    }
    applyLoadoutView(host);
  });
  host.addEventListener('change', (event) => {
    if (!(event.target instanceof HTMLSelectElement) || !event.target.matches('[data-loadout-sort]')) return;
    const sort = event.target.value as ConduitLoadoutSort;
    if (!(sort in sortLabels)) return;
    view.sort = sort;
    view.page = 0;
    applyLoadoutView(host);
  });
}

function slotsFor(id: string, account: Account | null): ConduitSlots {
  return account?.conduitEquipment?.[id] ?? Array<null>(conduitSlotCount).fill(null);
}

export function filledConduitSlots(id: string, account: Account | null): number {
  return slotsFor(id, account).filter((entry) => entry !== null).length;
}

function statPair(id: string, account: Account | null) {
  const slots = slotsFor(id, account);
  if (isStarterId(id)) {
    const progress = account ? ownedProgress(account, id) : undefined;
    return { before: resolveFighter(id, progress).stats, after: resolveFighter(id, progress, slots, account?.conduitUpgrades, account?.masterEquipment?.[id] ?? undefined).stats };
  }
  const copy = account?.capturedCharacters?.find((entry) => entry.instanceId === id);
  if (!copy) throw new Error('Choose an owned captured Elemental-Devourer.');
  return { before: resolveCapturedFighter(copy).stats, after: resolveCapturedFighter(copy, slots, account?.conduitUpgrades).stats };
}

function totalBonuses(id: string, account: Account | null): string {
  const { before, after } = statPair(id, account);
  const rows = (Object.keys(statLabels) as ConduitBuff['stat'][]).flatMap((key) => {
    const from = before[key];
    const to = after[key];
    const direction = statDirection(from, to);
    if (direction === 'unchanged') return [];
    const show = (value: number) => key === 'crit' ? `${formatStat(value * 100)}%` : key === 'critMultiplier' ? `${formatStat(value)}×` : formatStat(value);
    const change = key === 'crit' ? `${to > from ? '+' : ''}${formatStat((to - from) * 100)} pts`
      : from ? `${to > from ? '+' : ''}${formatStat((to / from - 1) * 100)}%` : `${to > from ? '+' : ''}${formatStat(to - from)}`;
    return [`<div class="loadout-bonus-row"><span>${statLabels[key]}</span><strong><span class="stat-change stat-change--${direction}">${change}</span> · <span class="loadout-base-stat">${show(from)}</span> → <span class="stat-change stat-change--${direction}">${show(to)}</span></strong></div>`];
  });
  return `<section class="loadout-bonuses" aria-label="Total Conduit bonuses"><h4 class="loadout-bonus-heading">Total bonuses</h4>
    <div class="loadout-bonus-strip">${rows.length ? rows.join('') : '<p class="quiet">No stat changes yet. Equip a Conduit to see its bonuses here.</p>'}</div></section>`;
}

function masterRow(owner: string, account: Account | null): string {
  if (!isStarterId(owner)) return masterEquipment(owner, account);
  const current = account?.masterEquipment?.[owner] ?? null;
  const entry = current ? getMasterConduit(current) : null;
  const choices = masterConduits.filter(master => master.character === owner && account?.masterConduits?.[master.id] === 1);
  return `<section class="ref-master-slot loadout-master" aria-label="Master slot">
    <span class="loadout-master-art">${current ? masterConduitIcon(current) : '<span class="loadout-master-empty" aria-hidden="true">M</span>'}</span>
    <span class="loadout-master-text"><small class="loadout-eyebrow">Master slot</small><b>${entry ? entry.name : 'No Master equipped'}</b>
      <small>${entry ? 'Always active · Omnic Master' : choices.length ? `${choices.length} owned for ${getStarter(owner).name}` : 'Found in Cosmic Grand Master Chests'}</small></span>
    <span class="loadout-master-select"><label for="master-${owner}" class="ref-sr-only">Master Conduit · ${getStarter(owner).name}</label><select id="master-${owner}" data-master-equipment="${owner}" ${!account ? 'disabled' : ''}>
      <option value="">No Master equipped</option>${choices.map(master => `<option value="${master.id}" ${master.id === current ? 'selected' : ''}>${master.name} · Omnic Master</option>`).join('')}</select></span>
    ${entry ? `<button type="button" class="loadout-rule-button" data-loadout-master-rule="${entry.id}" aria-label="${escapeDialogText(entry.name)} rule details">Details</button>` : ''}</section>`;
}

function slotCard(owner: string, captured: boolean, element: ElementId, slots: ConduitSlots, index: number, account: Account | null): string {
  const slot = artifactSlots[index];
  const selected = slots[index];
  const conduit = selected ? getConduit(selected) : null;
  const level = conduit ? account?.conduitUpgrades?.[conduit.id] ?? 0 : 0;
  const select = `<label for="conduit-slot-${index}" class="ref-sr-only">Conduit ${slot}</label><select id="conduit-slot-${index}" ${captured ? `data-capture-conduit="${owner}" data-capture-slot="${index}"` : `data-conduit-slot="${index}"`} ${!account ? 'disabled' : ''}><option value="">${conduit ? 'Remove Conduit' : 'Choose a Conduit'}</option>
    ${conduits.filter((entry) => (account?.conduits?.[entry.id] ?? 0) > 0).map((entry) => {
      const reason = conduitEquipReason(entry, element, slots, index);
      return `<option value="${entry.id}" ${entry.id === selected ? 'selected' : ''} ${reason ? 'disabled' : ''}>${entry.name} · ${entry.rarity} · +${account?.conduitUpgrades?.[entry.id] ?? 0}${reason ? ` · ${reason}` : ''}</option>`;
    }).join('')}</select>`;
  const target = `<button type="button" class="loadout-slot-target" data-loadout-select-slot="${index}" aria-pressed="false" aria-label="Target slot ${index + 1} for Equip">Slot ${index + 1}</button>`;
  if (!conduit) {
    return `<article class="ref-equipment-slot loadout-slot is-empty" data-loadout-slot="${index}" aria-label="Slot ${index + 1} · Empty">${target}
      <span class="loadout-slot-plus">${select}</span><small class="loadout-empty-label">Empty</small></article>`;
  }
  const next = level < conduitUpgradeCap ? `next level ${referencedEffect(conduitEffect(conduit, level + 1))}` : 'Maximum';
  return `<article class="ref-equipment-slot loadout-slot" data-loadout-slot="${index}" data-loadout-slot-name="${conduit.name}" style="--loadout-accent:${conduitColor(conduit)}">
    <div class="loadout-slot-main"><span class="loadout-slot-art">${conduitIcon(conduit.id, level)}</span><div class="loadout-slot-controls">${target}<button type="button" class="loadout-rule-button" data-loadout-rule="${conduit.id}" data-loadout-detail-level="${level}" aria-label="${conduit.name} details">Details</button></div></div>
    <span class="loadout-slot-body"><b class="loadout-slot-name">${conduit.name}</b>
      <small class="loadout-level" title="Level ${level} of ${conduitUpgradeCap} · ${next}">${conduit.rarity} · Lv ${level} / ${conduitUpgradeCap}<span class="ref-sr-only"> · Level ${level} of ${conduitUpgradeCap} · ${next}</span></small></span>
    <div class="loadout-actions"><button type="button" class="ref-chip" data-page="conduit-upgrade" data-upgrade-target="${conduit.id}">Upgrade</button>
      <button type="button" class="ref-chip" data-loadout-unequip="${index}" data-loadout-owner="${owner}" ${!account ? 'disabled' : ''}>Remove</button></div>
    <span class="loadout-swap" hidden>${select}</span></article>`;
}

function ownedList(owner: string, element: ElementId, slots: ConduitSlots, account: Account | null): string {
  const owned = conduits.filter((entry) => (account?.conduits?.[entry.id] ?? 0) > 0);
  const firstEmpty = slots.indexOf(null);
  const pages = Math.max(1, Math.ceil(owned.length / conduitLoadoutPageSize));
  return `<section class="ref-panel loadout-owned" aria-label="Your Conduits"><header class="ref-panel-heading"><span>Your Conduits · ${owned.length}</span><button class="ref-link" data-page="conduit-store">Store</button></header>
    <div class="loadout-tools"><label class="loadout-search"><span class="ref-sr-only">Search your Conduits</span><input type="search" data-loadout-search placeholder="Search name, element or effect" aria-label="Search your Conduits" autocomplete="off"></label>
      <label class="loadout-sort"><span class="ref-sr-only">Sort Conduits</span><select data-loadout-sort aria-label="Sort Conduits">${(Object.keys(sortLabels) as ConduitLoadoutSort[]).map(key => `<option value="${key}" ${key === view.sort ? 'selected' : ''}>${sortLabels[key]}</option>`).join('')}</select></label></div>
    <div class="loadout-filters"><div class="loadout-filter-group" role="group" aria-label="Filter by rarity">${(['', ...rarityOrder] as RarityFilter[]).map(rarity => `<button type="button" data-loadout-rarity="${rarity}" aria-pressed="false">${rarity || 'All'}</button>`).join('')}</div>
      <div class="loadout-filter-group" role="group" aria-label="Filter by equipment">${([['all', 'All'], ['equipped', 'Equipped'], ['unequipped', 'Unequipped']] as const).map(([value, label]) => `<button type="button" data-loadout-equipment-filter="${value}" aria-pressed="false">${label}</button>`).join('')}</div></div>
    <p class="loadout-target-cue" data-loadout-target-cue aria-live="polite">${firstEmpty < 0 ? 'All slots full · select a slot to replace' : `Equipping to Slot ${firstEmpty + 1}`}</p>
    <p class="quiet loadout-search-status" data-loadout-search-status role="status">Showing ${owned.length} of ${owned.length} Conduits</p>
    <div class="loadout-owned-list">${owned.length ? owned.map((conduit, order) => {
      const level = account?.conduitUpgrades?.[conduit.id] ?? 0;
      const equipped = slots.includes(conduit.id);
      const reasons = artifactSlots.map((_, index) => conduitEquipReason(conduit, element, slots, index) ?? '');
      const reason = equipped ? null : firstEmpty < 0 ? 'All slots full' : reasons[firstEmpty] || null;
      return `<article class="loadout-owned-row${equipped ? ' is-equipped' : ''}" data-loadout-conduit="${conduit.id}" data-loadout-name="${conduit.name}" data-loadout-rarity="${conduit.rarity}" data-loadout-level="${level}" data-loadout-order="${order}" data-loadout-reasons="${reasons.join('|')}"${order >= conduitLoadoutPageSize ? ' hidden' : ''}><span class="loadout-owned-art">${conduitIcon(conduit.id, level)}</span>
        <span class="loadout-owned-text"><b>${conduit.name}</b><small>${conduit.rarity} · Lv ${level} / ${conduitUpgradeCap}</small>${equipped ? '<small>Equipped on this character</small>' : `<small class="loadout-reason" data-loadout-reason${reason ? '' : ' hidden'}>${reason ?? ''}</small>`}</span>
        <button type="button" class="loadout-rule-button" data-loadout-rule="${conduit.id}" data-loadout-detail-level="${level}" aria-label="${conduit.name} details">Details</button>
        ${equipped ? '<span class="ref-chip ref-white">Equipped</span>'
          : `<button type="button" class="ref-chip" data-loadout-equip="${conduit.id}" data-loadout-owner="${owner}" data-loadout-target="${firstEmpty}" ${reason || !account ? 'disabled' : ''}${!account ? ' data-loadout-locked' : ''}>Equip</button>`}</article>`;
    }).join('') : '<p class="quiet">You do not own any Conduits yet. Buy them in the Store or earn them in Awaken the Machines.</p>'}
    <p class="quiet" data-loadout-search-empty hidden>No Conduits match your search or filters. Try another keyword or filter.</p></div>
    <nav class="loadout-pager" aria-label="Your Conduits pages"><button type="button" data-loadout-page="previous" disabled>‹ Previous</button><span data-loadout-page-status>Page 1 of ${pages}</span><button type="button" data-loadout-page="next" ${pages > 1 ? '' : 'disabled'}>Next ›</button></nav></section>`;
}

function memberTabs(owner: string, account: Account | null): string {
  if (!account) return '';
  let squad: string[];
  try { squad = equippedSquad(account); } catch { return ''; }
  if (squad.length < 2) return '';
  return `<nav class="ref-segment loadout-member-tabs" aria-label="Squad Conduit loadouts">${squad.map((id) => {
    const name = isStarterId(id) ? getStarter(id).name : getCreature(account.capturedCharacters?.find((entry) => entry.instanceId === id)?.creatureId ?? '').name;
    return `<button type="button" ${isStarterId(id) ? `data-team-detail="${id}"` : `data-team-capture-detail="${id}"`} data-team-tab="equipment" aria-pressed="${id === owner}">${name}</button>`;
  }).join('')}</nav>`;
}

/** Full Conduit loadout screen for one Element-Bearer or captured creature. */
export function conduitLoadout(owner: string, name: string, element: ElementId, account: Account | null): string {
  const slots = slotsFor(owner, account);
  const captured = !isStarterId(owner);
  const filled = slots.filter((entry) => entry !== null).length;
  const shortName = isStarterId(owner) ? getStarter(owner).name : name;
  const hasEquipment = filled > 0 || !!(isStarterId(owner) && account?.masterEquipment?.[owner]);
  return `<section class="ref-equipment conduit-loadout" aria-label="${name} equipment" data-character-equipment="${owner}" data-loadout-signature="${slots.map(entry => entry ?? '').join(',')}" data-loadout-first-empty="${slots.indexOf(null)}">
    <header class="loadout-header"><button type="button" class="loadout-back" ${captured ? `data-team-capture-detail="${owner}"` : `data-team-detail="${owner}"`}>← Back to ${shortName}</button>
      <div class="loadout-title"><h3>${shortName} · Conduits</h3><p>${filled} of ${conduitSlotCount} slots filled</p></div>${memberTabs(owner, account)}</header>
    <div class="loadout-layout">
      <section class="ref-panel loadout-slots" aria-label="Loadout"><header class="ref-panel-heading"><span>Loadout · ${filled} of ${conduitSlotCount}</span><button type="button" class="text-button loadout-clear" data-loadout-clear data-loadout-owner="${owner}" aria-label="Unequip all Conduits${captured ? '' : ', including Master'} from ${escapeDialogText(shortName)}" ${hasEquipment && account ? '' : 'disabled'}>Unequip All</button></header>
        ${masterRow(owner, account)}
        <div class="ref-equipment-grid loadout-grid">${artifactSlots.map((_, index) => slotCard(owner, captured, element, slots, index, account)).join('')}</div>
        ${account ? totalBonuses(owner, account) : ''}
        <p class="ref-equipment-note">Up to four matching Omnic Conduits. Calamitic Conduits work on every element and use ordinary slots, with no extra limit. One name per character.</p>
      </section>
      ${ownedList(owner, element, slots, account)}
    </div>
    ${!account ? '<p role="alert">Equipment unavailable. Resolve the save error.</p>' : ''}<p id="conduit-equipment-result" role="status"></p></section>`;
}
/**
 * Updates a rendered loadout in place after an equipment change: unchanged artwork, filters, search,
 * page and scroll position survive, so swapping Conduits never blanks or rebuilds the screen.
 * Returns false when no loadout for `owner` is rendered (callers then fall back to a full render).
 */
export function refreshConduitLoadout(host: HTMLElement, owner: string, name: string, element: ElementId, account: Account | null): boolean {
  const current = Array.from(host.querySelectorAll<HTMLElement>('.conduit-loadout')).find(entry => entry.dataset.characterEquipment === owner);
  if (!current) return false;
  morphElement(current, conduitLoadout(owner, name, element, account));
  applyLoadoutView(host);
  return true;
}
/** Compact Conduits card for the Stats & Skills overview. */
export function conduitSummary(owner: string, account: Account | null): string {
  const slots = slotsFor(owner, account);
  const equipped = slots.flatMap((id) => id ? [getConduit(id)] : []);
  return `<section class="character-category loadout-summary"><h3><span>Conduits · ${equipped.length} of ${conduitSlotCount}</span><button type="button" class="ref-link" data-open-loadout>Full view</button></h3>
    ${equipped.length ? `<div class="loadout-summary-list">${equipped.map((conduit) => {
      const level = account?.conduitUpgrades?.[conduit.id] ?? 0;
      return `<div class="loadout-summary-row"><span class="loadout-summary-art">${conduitIcon(conduit.id, level)}</span><span>${conduit.name}</span><strong>${conduitBuffLine(conduit, level)}</strong></div>`;
    }).join('')}</div>` : '<p class="quiet">No Conduits equipped.</p>'}
    <button type="button" class="loadout-open" data-open-loadout>Open full Conduit view →</button></section>`;
}