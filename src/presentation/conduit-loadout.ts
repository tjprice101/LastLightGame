import { conduits, conduitBuffs, conduitColor, conduitEquipReason, conduitSlotCount, conduitUpgradeCap, getConduit, isConduitId, type Conduit, type ConduitBuff, type ConduitSlots } from '../content/conduits';
import { resolveFighter, formatStat } from '../content/combat';
import { getStarter, isStarterId } from '../content/starters';
import { getElement, type ElementId } from '../content/activities';
import { artifactSlots } from '../content/progression';
import { equippedSquad, ownedProgress, type Account } from '../game/account';
import { resolveCapturedFighter } from '../game/character-instances';
import { getCreature } from '../content/creatures';
import { conduitIcon, conduitRarity } from './conduit-store';
import { masterEquipment } from './master-conduits';
import { statDirection } from './stat-change';

const statLabels: Record<ConduitBuff['stat'], string> = {
  health: 'Health', damage: 'Attack', defense: 'Defense', crit: 'Critical rate',
  critMultiplier: 'Critical multiplier', elementalDamage: 'Elemental damage', shatterCapacity: 'Shatter capacity',
};

/** Stat-only summary of a Conduit's buffs at an upgrade level, e.g. "+8% Attack". */
export function conduitBuffLine(conduit: Conduit, level = 0): string {
  return conduitBuffs(conduit, level).map((buff) => {
    const amount = `${buff.amount > 0 ? '+' : ''}${formatStat(buff.amount)}`;
    return `${amount}${buff.kind === 'percent' ? '%' : buff.kind === 'percentage-points' ? ' pts' : ''} ${statLabels[buff.stat]}`;
  }).join(' · ');
}

export function conduitMatchesSearch(conduit: Conduit, query: string): boolean {
  const element = conduit.element ? getElement(conduit.element) : null;
  const text = [conduit.name, conduit.id, conduit.rarity, conduit.power, conduit.effect,
    conduit.lore, conduitBuffLine(conduit), element?.name,
    element ? '' : 'Any element'].join(' ').toLowerCase();
  return query.trim().toLowerCase().split(/\s+/).every(term => text.includes(term));
}

export function applyConduitSearch(host: HTMLElement, query: string): void {
  host.querySelectorAll<HTMLElement>('.loadout-owned').forEach(panel => {
    const input = panel.querySelector<HTMLInputElement>('[data-loadout-search]');
    if (!input) return;
    input.value = query;
    const rows = panel.querySelectorAll<HTMLElement>('[data-loadout-conduit]');
    let visible = 0;
    rows.forEach(row => {
      const id = row.dataset.loadoutConduit;
      if (!id || !isConduitId(id)) throw new Error('Conduit search row has an invalid identity.');
      row.hidden = !conduitMatchesSearch(getConduit(id), query);
      if (!row.hidden) visible++;
    });
    const status = panel.querySelector<HTMLElement>('[data-loadout-search-status]');
    if (status) status.textContent = `Showing ${visible} of ${rows.length} Conduits`;
    const empty = panel.querySelector<HTMLElement>('[data-loadout-search-empty]');
    if (empty) empty.hidden = visible > 0 || rows.length === 0;
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
    return { before: resolveFighter(id, progress).stats, after: resolveFighter(id, progress, slots, account?.conduitUpgrades).stats };
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
  return `<section class="ref-panel loadout-bonuses" aria-label="Total Conduit bonuses"><header class="ref-panel-heading">Total bonuses</header>
    ${rows.length ? rows.join('') : '<p class="quiet">No stat changes yet. Equip a Conduit to see its bonuses here.</p>'}</section>`;
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
  if (!conduit) {
    return `<article class="ref-equipment-slot loadout-slot is-empty" data-loadout-slot="${index}"><h4>Slot ${index + 1} · Empty</h4>
      <p>Pick a Conduit from your list, or choose one here.</p>${select}</article>`;
  }
  const mechanic = conduit.mechanic ? conduit.effect.slice(conduit.effect.indexOf('. ') + 2) : '';
  return `<article class="ref-equipment-slot loadout-slot" data-loadout-slot="${index}" style="--loadout-accent:${conduitColor(conduit)}">
    <div class="loadout-slot-art">${conduitIcon(conduit.id, level)}</div>
    <div class="loadout-slot-body"><small class="loadout-eyebrow">Slot ${index + 1}</small><h4>${conduit.name}</h4>${conduitRarity(conduit.id)}
      <p class="loadout-effect">${conduitBuffLine(conduit, level)}</p>
      <p class="loadout-level">Level ${level} of ${conduitUpgradeCap}${level < conduitUpgradeCap ? ` · next level ${conduitBuffLine(conduit, level + 1)}` : ' · Maximum'}</p>
      ${mechanic ? `<details class="loadout-rule"><summary>Special rule</summary><p>${mechanic}</p></details>` : ''}
      <div class="loadout-actions"><button type="button" class="ref-chip" data-page="conduit-upgrade" data-upgrade-target="${conduit.id}">Upgrade</button>
      <button type="button" class="ref-chip" data-loadout-unequip="${index}" data-loadout-owner="${owner}" ${!account ? 'disabled' : ''}>Unequip</button>
      <span class="loadout-swap">${select}</span></div></div></article>`;
}

function ownedList(owner: string, element: ElementId, slots: ConduitSlots, account: Account | null): string {
  const owned = conduits.filter((entry) => (account?.conduits?.[entry.id] ?? 0) > 0);
  const firstEmpty = slots.indexOf(null);
  return `<section class="ref-panel loadout-owned" aria-label="Your Conduits"><header class="ref-panel-heading"><span>Your Conduits · ${owned.length}</span><button class="ref-link" data-page="conduit-store">Store</button></header>
    <label class="loadout-search">Search your Conduits<input type="search" data-loadout-search placeholder="Name, element, effect or description" autocomplete="off"></label>
    <p class="quiet loadout-search-status" data-loadout-search-status role="status">Showing ${owned.length} of ${owned.length} Conduits</p>
    <div class="ref-scroll loadout-owned-list">${owned.length ? owned.map((conduit) => {
      const level = account?.conduitUpgrades?.[conduit.id] ?? 0;
      const equipped = slots.includes(conduit.id);
      const reason = equipped ? null : firstEmpty < 0 ? 'All slots full' : conduitEquipReason(conduit, element, slots, firstEmpty);
      return `<article class="loadout-owned-row${equipped ? ' is-equipped' : ''}" data-loadout-conduit="${conduit.id}"><span class="loadout-owned-art">${conduitIcon(conduit.id, level)}</span>
        <span class="loadout-owned-text"><b>${conduit.name}</b><small>${conduit.rarity} · Level ${level} of ${conduitUpgradeCap} · ${conduitBuffLine(conduit, level)}</small>${equipped ? '<small>Equipped on this character</small>' : reason ? `<small>${reason}</small>` : ''}</span>
        ${equipped ? '<span class="ref-chip ref-white">Equipped</span>'
          : `<button type="button" class="ref-chip" data-loadout-equip="${conduit.id}" data-loadout-owner="${owner}" data-loadout-target="${firstEmpty}" ${reason || !account ? 'disabled' : ''}>Equip</button>`}</article>`;
    }).join('') : '<p class="quiet">You do not own any Conduits yet. Buy them in the Store or earn them in Awaken the Machines.</p>'}
    <p class="quiet" data-loadout-search-empty hidden>No Conduits match your search. Try another keyword or clear the search.</p></div></section>`;
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
  return `<section class="ref-equipment conduit-loadout" aria-label="${name} equipment" data-character-equipment="${owner}">
    <header class="loadout-header"><button type="button" class="loadout-back" ${captured ? `data-team-capture-detail="${owner}"` : `data-team-detail="${owner}"`}>← Back to ${shortName}</button>
      <div class="loadout-title"><h3>${shortName} · Conduits</h3><p>${filled} of ${conduitSlotCount} slots filled</p></div>${memberTabs(owner, account)}</header>
    <div class="loadout-layout">
      <section class="ref-panel loadout-slots" aria-label="Loadout"><header class="ref-panel-heading">Loadout · ${filled} of ${conduitSlotCount}</header>
        ${masterEquipment(owner, account)}
        <div class="ref-equipment-grid loadout-grid">${artifactSlots.map((_, index) => slotCard(owner, captured, element, slots, index, account)).join('')}</div>
        <footer class="loadout-footer"><button class="ref-link" data-page="conduit-store">Buy Conduits →</button><button class="ref-link" data-page="conduit-upgrade">Upgrade Conduits →</button>
        <span class="ref-equipment-note">Up to four matching Omnic Conduits. One name per character.</span></footer>
      </section>
      <div class="loadout-side">${account ? totalBonuses(owner, account) : ''}${ownedList(owner, element, slots, account)}</div>
    </div>
    ${!account ? '<p role="alert">Equipment unavailable. Resolve the save error.</p>' : ''}<p id="conduit-equipment-result" role="status"></p></section>`;
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
