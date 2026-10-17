import { getStarter, isStarterId, type StarterId } from '../content/starters';
import { ownedCharacters, ownedProgress, creatureSaleOffer, isSellableCreatureMode, multiSummonCount, type Account } from '../game/account';
import { saleControls, saleLabel } from './creature-sale';
import { isCurrencyMode } from '../content/activities';
import { portrait } from './portrait';
import { characterRole } from './character-role';
import { characterRating, starBadge } from './character-rating';
import { currencyIcon } from './currency-icon';
import { formatStat } from '../content/combat';
import './roster.css';
import './squad-formation.css';
import { characterProtection } from '../game/account';
import { getCreature } from '../content/creatures';
import { elementLabel } from './element-label';
import { assetUrl } from './portrait';
import { ownedCharacterInstances } from '../game/account';
import { ownedCompanion, capturedRating } from './owned-companion';
import { capturedProgress, capturedLevelCost, resolveCapturedFighter } from '../game/character-instances';
import { conduits, getConduit, conduitEffect, conduitEquipReason, conduitSlotCount, conduitSlotsShown, type ConduitSlots } from '../content/conduits';
import { conduitIcon } from './conduit-store';
import { itemShowcase } from './item-showcase';
import { bannerPercent, bannerPityLimits, validateBannerPity, type BannerOutcome } from '../content/standard-banner';
import { summonBanners, getSummonBanner, type SummonBannerId } from '../content/summon-banners';
import { evolutionRarity } from '../content/progression';
import { information } from './information';
import { summonLore } from '../content/world-lore';
import { characterName } from '../content/character-art';
import { materialName } from '../content/dungeon-art';
import { bannerMaterialTiers, bannerDuplicateMaterialAmount } from '../content/banner-materials';

function lockControl(account: Account, id: string): string {
  const protection = characterProtection(account, id);
  return `<button class="text-button" data-character-lock="${id}" data-lock-value="${!protection.locked}" aria-pressed="${protection.locked}">${protection.locked ? 'Unlock' : 'Lock'} ${isStarterId(id) ? 'Element-Bearer' : 'Elemental-Devourer'}</button>
    <small>${protection.locked ? 'Locked' : protection.inSquad ? 'In squad' : 'Unlocked'}</small>`;
}

export function characterCopyManagement(account: Account | null, category: 'all' | 'bearers' | 'creatures' = 'all', selectedCopy?: string, compact = false): string {
  if (!account) return '<p role="alert">Character copy management unavailable. Resolve the save error.</p>';
  const copies = account.capturedCharacters ?? [];
  const activeCopy = copies.some((copy) => copy.instanceId === selectedCopy) ? selectedCopy : copies[0]?.instanceId;
  return `<section class="character-copy-management${compact ? ' ref-copy-management' : ''}" id="character-copies">
    ${category !== 'creatures' ? `<h2>Element-Bearer locks</h2><div class="archive-grid">${ownedCharacters(account).map((id) => `<article class="archive-card"><h3 data-character-name="${id}">${characterName(id, ownedProgress(account, id).evolution)}</h3>${lockControl(account, id)}</article>`).join('')}</div>` : ''}
    ${category !== 'bearers' ? `${compact ? '' : `<h2>Captured Elemental-Devourers · ${copies.length}</h2>
      <nav class="owned-roster" aria-label="Owned captured Elemental-Devourers">${copies.map((copy, index) => `<button class="roster-character" data-owned-capture="${copy.instanceId}" aria-pressed="${copy.instanceId === activeCopy}"><strong>${getCreature(copy.creatureId).name}</strong><span>Copy ${index + 1} · Lv.${capturedProgress(copy).level}</span></button>`).join('')}</nav>`}
      ${copies.length ? `<div class="archive-grid">${copies.filter((copy) => category === 'all' || copy.instanceId === activeCopy).map((copy) => {
      const index = copies.indexOf(copy);
      const creature = getCreature(copy.creatureId);
      const progress = capturedProgress(copy);
      const kit = resolveCapturedFighter(copy, account.conduitEquipment?.[copy.instanceId], account.conduitUpgrades);
      const cost = capturedLevelCost(copy);
      const sale = isSellableCreatureMode(creature.mode) ? creatureSaleOffer(account, copy.instanceId) : null;
      const slots: ConduitSlots = account.conduitEquipment?.[copy.instanceId] ?? Array.from({ length: conduitSlotCount }, () => null);
      return `<article class="archive-card" data-captured-copy="${copy.instanceId}"><div class="captured-stage"><div class="archive-portrait">${compact ? ownedCompanion(account, copy.instanceId).art : creature.art ? `<img src="${assetUrl(`enemies/${creature.art}.png`)}" alt="${creature.name}" width="960" height="960">` : '<span>Artwork pending</span>'}</div>
        <h3>${creature.name}</h3>${elementLabel(creature.element)}${capturedRating(creature.id)}<p>Copy ${index + 1} · Lv.${progress.level}</p></div><div class="captured-controls">${lockControl(account, copy.instanceId)}
        <p>HP ${formatStat(kit.stats.health)} · Attack ${formatStat(kit.stats.damage)} · Defense ${formatStat(kit.stats.defense)}</p>
        <section class="captured-abilities"><h4>Retained abilities</h4>${progress.skills.map((skill) => `<p>${skill.name}: ${formatStat(skill.multiplier * 100)}% Attack · ${skill.action === 'ultimate' ? `${kit.abilities.ultimate.cooldown}-turn cooldown` : 'No cooldown'} · ${skill.action}</p>`).join('')}</section>
        <button class="primary-button" data-level-capture="${copy.instanceId}" data-expected-level="${progress.level}" ${account.fractalis < cost.fractalis || Object.entries(cost.materials).some(([id, amount]) => (account.materials[id] ?? 0) < amount) ? 'disabled' : ''}>Level up · ${cost.fractalis} Prismatica</button>
        <button class="text-button" type="button" data-max-level="${copy.instanceId}">Max Level</button>
        ${itemShowcase([{ id: 'fractalis', amount: cost.fractalis }, ...Object.entries(cost.materials).map(([id, amount]) => ({ id, amount }))], 'Level cost')}
        ${sale ? saleControls(sale, copy.instanceId, `Sell copy · ${saleLabel(sale)}`) : ''}
        <section class="captured-equipment"><h4>Conduits</h4><button class="text-button" data-page="conduit-upgrade">Conduit Upgrade &rarr;</button><p>Omnic: matching combat element only.</p>${Array.from({ length: conduitSlotsShown(slots) }, (_, index) => slots[index] ?? null).map((equipped, slot) => `<label>${equipped ? conduitIcon(equipped, account.conduitUpgrades?.[equipped]) : ''}Slot ${slot + 1}<select data-capture-conduit="${copy.instanceId}" data-capture-slot="${slot}"><option value="">Empty</option>${conduits.filter((conduit) => (account.conduits?.[conduit.id] ?? 0) > 0).map((conduit) => {
          const reason = conduitEquipReason(conduit, creature.element, slots, slot);
          return `<option value="${conduit.id}" ${equipped === conduit.id ? 'selected' : ''} ${reason ? 'disabled' : ''}>${conduit.name} · ${conduit.rarity} · +${account.conduitUpgrades?.[conduit.id] ?? 0}${reason ? ` · ${reason}` : ''}</option>`;
        }).join('')}</select>${equipped ? `<span>${conduitEffect(getConduit(equipped), account.conduitUpgrades?.[equipped])}</span>` : ''}</label>`).join('')}</section>
        <button class="text-button" data-page="squad">Equip in Squad &rarr;</button></div></article>`;
    }).join('')}</div>` : '<p>No captured Elemental-Devourers.</p>'}` : ''}
    <p id="character-lock-result" role="status"></p></section>`;
}

export function characterRoster(account: Account | null, selected: StarterId): string {
  if (!account) return '<p role="alert">Character roster unavailable. Resolve the save error.</p>';
  return `<nav class="owned-roster" data-menu-scroll="owned-bearers" aria-label="Owned Element-Bearers">${ownedCharacters(account).map((id) => {
    const character = getStarter(id);
    const progress = ownedProgress(account, id);
    return `<button class="roster-character" data-owned-character="${id}" aria-pressed="${selected === id}" style="--element:${character.color}">
      ${portrait(character, progress.evolution)}<span><strong>${characterName(id, progress.evolution)}</strong>${characterRole(id)}${characterRating(id, progress.evolution)}<small>Lv.${progress.level} · Evo.${progress.evolution}</small></span></button>`;
  }).join('')}<button class="roster-summon" data-page="summon">Summon &rarr;</button></nav>`;
}

const squadSlotNames = ['Leader', 'Squad member 2', 'Squad member 3'] as const;
const squadProgress = (progress: string): string => progress.replace(/ · Copy \d+$/, '');

function squadMemberPreview(account: Account, id?: string, index = 0): string {
  const character = id ? ownedCompanion(account, id) : null;
  if (!character) return `<span class="squad-card-art"><span class="empty-squad-slot" aria-hidden="true">+</span></span>
    <span class="squad-card-copy"><strong>Empty slot</strong><small>${index ? 'Optional squad member' : 'Choose a leader'}</small></span>`;
  return `<span class="squad-card-art squad-portrait" style="--member-accent:${character.color}">${character.art}</span>
    <span class="squad-card-copy"><strong>${character.label}</strong>${character.rating}<small>${character.element} · ${squadProgress(character.progress)}</small></span>`;
}

function squadPickCard(account: Account, id: string, squad: readonly (string | undefined)[]): string {
  const member = ownedCompanion(account, id);
  const slot = squad.indexOf(id);
  const kind = isStarterId(id) ? 'bearers' : 'creatures';
  return `<button type="button" class="squad-pick-card" data-squad-pick="${id}" data-squad-kind="${kind}" data-squad-search="${member.label.toLowerCase()}" aria-pressed="false" style="--member-accent:${member.color}">
    <span class="squad-pick-art">${member.art}</span>
    <span class="squad-pick-copy"><strong>${member.label}</strong><small>${member.element} · ${squadProgress(member.progress)}</small></span>
    <span class="squad-pick-tag" data-squad-tag>${slot >= 0 ? squadSlotNames[slot] : ''}</span></button>`;
}

export function squadHub(account: Account | null): string {
  if (!account) return '<p role="alert">Squad unavailable. Resolve the save error.</p>';
  const owned = ownedCharacterInstances(account);
  const savedSquad = account.squad ?? [];
  const squad = savedSquad.length && savedSquad.every((id) => owned.includes(id)) ? savedSquad : owned.slice(0, 1);
  const bearers = owned.filter((id) => isStarterId(id)).length;
  return `<section class="squad-hub squad-formation"><header class="squad-heading"><div><h2>Squad formation</h2>
    <p>Select a slot to choose who fills it.</p>${information('squad-information', 'Squad', '<p>Assign one to three distinct owned IDs. The first slot is the leader. Element-Bearers and captured Elemental-Devourers can occupy any slot; different copies of the same Elemental-Devourer can share a squad. Squad members have independent stats, Gauge and actions in every activity. Select a slot to open the member picker. Choosing a member who already occupies another slot swaps the two. Save squad commits the draft; viewing and editing it do not.</p>')}</div>
    <div class="squad-save"><span data-squad-count>${squad.length} / 3 slots filled</span><button class="primary-button" type="submit" form="squad-form" ${owned.length ? '' : 'disabled'}>Save squad</button></div></header>
    <form id="squad-form"><div class="squad-slots">${[0, 1, 2].map((index) => {
      const id = squad[index];
      return `<section class="squad-slot${index === 0 ? ' squad-slot-leader' : ''}"><h3>${squadSlotNames[index]}</h3>
        <button type="button" class="squad-member-preview" data-squad-assign="${index}" aria-haspopup="dialog" aria-label="${index === 0 ? 'Choose leader' : `Choose squad member ${index + 1}`}">${squadMemberPreview(account, id, index)}</button>
        <div class="squad-slot-actions"><button class="text-button squad-change" type="button" data-squad-open="${index}" aria-haspopup="dialog">${id ? 'Change' : 'Choose'}</button>
        ${index ? `<button class="text-button squad-remove" type="button" data-squad-remove="${index}">Remove</button>` : ''}</div>
        <select id="squad-${index}" name="slot-${index}" aria-label="${index === 0 ? 'Choose leader' : `Choose squad member ${index}`}" data-native-select hidden>${index ? `<option value="" ${!id ? 'selected' : ''}>Empty slot</option>` : ''}
          ${!index && !owned.length ? '<option value="" selected disabled>No owned squad members</option>' : ''}
          ${owned.map((option) => `<option value="${option}" ${id === option ? 'selected' : ''}>${ownedCompanion(account, option).label}</option>`).join('')}</select></section>`;
    }).join('')}</div>
      <p id="squad-result" role="status"></p></form>
    <dialog class="information-modal squad-picker" id="squad-picker" aria-labelledby="squad-picker-heading">
      <header class="drawer-heading"><h2 id="squad-picker-heading">Choose leader</h2><button type="button" class="drawer-close" data-squad-close aria-label="Close member picker">&times;</button></header>
      <div class="squad-picker-tools"><div class="squad-picker-filters" role="group" aria-label="Filter squad members">
        <button type="button" data-squad-filter="all" aria-pressed="true">All · ${owned.length}</button>
        <button type="button" data-squad-filter="bearers" aria-pressed="false">Element-Bearers · ${bearers}</button>
        <button type="button" data-squad-filter="creatures" aria-pressed="false">Elemental-Devourers · ${owned.length - bearers}</button></div>
        <input type="search" class="squad-picker-search" data-squad-search-input placeholder="Search by name" aria-label="Search squad members"></div>
      <p class="squad-picker-error" data-squad-picker-error role="alert"></p>
      <div class="squad-picker-grid" role="list" aria-label="Owned squad members · ${owned.length}">${owned.map((id) => squadPickCard(account, id, squad)).join('')}</div>
      <p class="squad-picker-empty" data-squad-picker-empty hidden>No squad members match.</p>
    </dialog>
    </section>`;
}

export function bindSquadPreview(host: HTMLElement, account: Account | null): void {
  const form = host.querySelector<HTMLFormElement>('#squad-form');
  const dialog = host.querySelector<HTMLDialogElement>('#squad-picker');
  if (!form || !dialog || !account) return;
  const owned = ownedCharacterInstances(account);
  const controls = Array.from(form.querySelectorAll<HTMLSelectElement>('select[name^="slot-"]'));
  const cards = Array.from(dialog.querySelectorAll<HTMLButtonElement>('[data-squad-pick]'));
  const heading = dialog.querySelector<HTMLElement>('#squad-picker-heading');
  const error = dialog.querySelector<HTMLElement>('[data-squad-picker-error]');
  const empty = dialog.querySelector<HTMLElement>('[data-squad-picker-empty]');
  const search = dialog.querySelector<HTMLInputElement>('[data-squad-search-input]');
  const status = host.querySelector<HTMLElement>('#squad-result');
  let activeSlot = 0;
  let filter = 'all';
  let opener: HTMLElement | null = null;
  const refresh = (): void => {
    controls.forEach((control, index) => {
      if (control.value && !owned.includes(control.value)) throw new Error('Squad preview member is not owned.');
      const slot = control.closest('.squad-slot');
      const preview = slot?.querySelector('.squad-member-preview');
      if (!preview) throw new Error('Squad preview is missing.');
      preview.innerHTML = squadMemberPreview(account, control.value || undefined, index);
      const change = slot?.querySelector<HTMLButtonElement>('[data-squad-open]');
      if (change) change.textContent = control.value ? 'Change' : 'Choose';
      const remove = slot?.querySelector<HTMLButtonElement>('[data-squad-remove]');
      if (remove) remove.hidden = !control.value;
    });
    const count = host.querySelector('[data-squad-count]');
    if (count) count.textContent = `${controls.filter((entry) => entry.value).length} / 3 slots filled`;
    cards.forEach((card) => {
      const slot = controls.findIndex((control) => control.value === card.dataset.squadPick);
      card.setAttribute('aria-pressed', String(slot === activeSlot));
      card.dataset.squadSlot = slot >= 0 ? String(slot) : '';
      const tag = card.querySelector('[data-squad-tag]');
      if (tag) tag.textContent = slot >= 0 ? squadSlotNames[slot] : '';
    });
  };
  const applyFilter = (): void => {
    const query = (search?.value ?? '').trim().toLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const show = (filter === 'all' || card.dataset.squadKind === filter) && (!query || (card.dataset.squadSearch ?? '').includes(query));
      card.hidden = !show;
      if (show) visible++;
    });
    if (empty) empty.hidden = visible > 0;
    dialog.querySelectorAll<HTMLButtonElement>('[data-squad-filter]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.squadFilter === filter)));
  };
  const open = (index: number, trigger: HTMLElement): void => {
    if (!owned.length) return;
    activeSlot = index;
    opener = trigger;
    if (heading) heading.textContent = index === 0 ? 'Choose leader' : `Choose squad member ${index + 1}`;
    if (error) error.textContent = '';
    refresh();
    applyFilter();
    dialog.showModal();
    (cards.find((card) => !card.hidden && card.getAttribute('aria-pressed') === 'true') ?? search)?.focus({ preventScroll: true });
  };
  controls.forEach((control) => control.addEventListener('change', refresh));
  host.querySelectorAll<HTMLButtonElement>('[data-squad-assign], [data-squad-open]').forEach((button) => button.addEventListener('click', () =>
    open(Number(button.dataset.squadAssign ?? button.dataset.squadOpen), button)));
  dialog.querySelector('[data-squad-close]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { if (opener && host.contains(opener)) opener.focus({ preventScroll: true }); opener = null; });
  dialog.querySelectorAll<HTMLButtonElement>('[data-squad-filter]').forEach((button) => button.addEventListener('click', () => { filter = button.dataset.squadFilter ?? 'all'; applyFilter(); }));
  search?.addEventListener('input', applyFilter);
  const write = (slots: string[]): void => {
    controls.forEach((control, slot) => {
      control.value = slots[slot];
      control.dispatchEvent(new Event('change', { bubbles: true }));
    });
    if (status) status.textContent = 'Squad draft changed. Save squad to apply it.';
  };
  cards.forEach((card) => card.addEventListener('click', () => {
    const picked = card.dataset.squadPick;
    if (!picked || !owned.includes(picked)) throw new Error('Choose an owned squad member.');
    try {
      write(assignSquadSlot(controls.map((control) => control.value), activeSlot, picked, owned));
      dialog.close();
    } catch (failure) {
      if (error) error.textContent = failure instanceof Error ? failure.message : 'Squad assignment failed.';
    }
  }));
  host.querySelectorAll<HTMLButtonElement>('[data-squad-remove]').forEach((button) => button.addEventListener('click', () => {
    write(assignSquadSlot(controls.map((control) => control.value), Number(button.dataset.squadRemove), '', owned));
  }));
  refresh();
}

export function assignSquadSlot(slots: readonly string[], index: number, id: string, owned: readonly string[]): string[] {
  if (slots.length !== 3 || !Number.isInteger(index) || index < 0 || index > 2) throw new Error('Choose one of the three squad slots.');
  if (id && !owned.includes(id)) throw new Error('Choose an owned squad member.');
  if (!id && index === 0) throw new Error('A squad requires a leader.');
  const next = [...slots];
  const previous = next[index];
  const other = id ? next.indexOf(id) : -1;
  if (other >= 0 && other !== index) {
    if (other === 0 && !previous) throw new Error('Choose a replacement leader before moving the leader to an empty slot.');
    next[other] = previous;
  }
  next[index] = id;
  return next;
}

export function bannerCharacters(pool: readonly BannerOutcome[]): string {
  const characters = pool.filter((entry) => entry.kind === 'character' && (entry.stars === 5 || entry.stars === 6));
  if (!characters.length) return '';
  return `<section class="banner-characters" aria-label="Available 5–6-star Element-Bearers"><h3>Available Element-Bearers</h3>
    <ul>${characters.map((entry) => {
      if (!isStarterId(entry.id)) throw new Error('Banner character definition is missing.');
      const character = getStarter(entry.id);
      const rarity = evolutionRarity(1);
      return `<li data-banner-character="${entry.id}" style="--element:${character.color}">
        ${elementLabel(character.elementId)}<strong>${characterName(character.id)}</strong>
        <span class="banner-character-rating">${starBadge(entry.stars)}<span class="rarity-badge rarity-${rarity.toLowerCase()}">${rarity}</span></span>
      </li>`;
    }).join('')}</ul></section>`;
}

export function bannerNavigation(banners: readonly { id: string; name: string }[], selected: string): string {
  if (!banners.some((banner) => banner.id === selected)) throw new Error('Selected summon banner is missing.');
  return `<nav class="summon-banner-navigation" aria-label="Summon banners">${banners.map((banner) =>
    `<button type="button" data-summon-banner="${banner.id}" ${banner.id === selected ? 'aria-current="page"' : ''}>${banner.name}</button>`).join('')}</nav>`;
}

const selectedRateTiers = new Map<string, string>();

function bannerRates(banner: { id: string; name: string }, pool: readonly BannerOutcome[]): string {
  const tiers = [...new Set(pool.map((entry) => entry.stars))].sort((a, b) => b - a);
  const tierName = (stars: number): string => stars <= 3 ? `${bannerMaterialTiers[stars - 1].rarity} materials` : `${stars}-star`;
  return `<section class="summon-rates" aria-label="Banner drop rates" data-rate-banner="${banner.id}"><header><h3>Drop rates</h3><p class="quiet" id="banner-rate-note">Base rates exclude pity guarantees. Values are rounded to six decimal places.</p></header>
    <nav class="banner-rate-filters" aria-label="Filter rates by reward tier"><button type="button" data-rate-stars="all" aria-pressed="true">All</button>${tiers.map((stars) => `<button type="button" data-rate-stars="${stars}" aria-pressed="false">${tierName(stars)}</button>`).join('')}</nav>
    <div class="ref-rate-columns">${tiers.map(stars => `<section class="ref-rate-tier" data-rate-tier="${stars}"><h4>${tierName(stars)} · ${bannerPercent(pool.filter(entry => entry.stars === stars).reduce((sum, entry) => sum + entry.chance, 0))}</h4><div class="ref-scroll"><table class="summon-drop-table" aria-describedby="banner-rate-note"><caption>${banner.name} · ${tierName(stars)} outcomes</caption>
      <thead class="ref-sr-only"><tr><th scope="col">Name</th><th scope="col">Rarity · Stars</th><th scope="col">Rate</th></tr></thead>
      <tbody>${pool.filter(entry => entry.stars === stars).map((entry) => {
        let name: string;
        if (entry.kind === 'character') {
          if (!isStarterId(entry.id)) throw new Error('Banner character definition is missing.');
          name = characterName(entry.id);
        } else if (entry.kind === 'material') name = `${bannerMaterialTiers[entry.stars - 1].amount} ${materialName(entry.id)}`;
        else name = getCreature(entry.id).name;
        const rarity = evolutionRarity(entry.kind === 'character' ? 1 : entry.stars);
        return `<tr data-banner-entry="${entry.id}" data-entry-stars="${entry.stars}"><th scope="row">${name}</th><td>${rarity}${entry.kind === 'character' ? `<span>${entry.stars}-star</span>` : ''}</td><td>${bannerPercent(entry.chance)} per draw</td></tr>`;
      }).join('')}</tbody></table></div></section>`).join('')}</div></section>`;
}

export function bindSummonRates(host: HTMLElement): void {
  const panel = host.querySelector<HTMLElement>('[data-rate-banner]');
  if (!panel) return;
  const banner = panel.dataset.rateBanner;
  if (!banner) throw new Error('Rate table is missing its banner.');
  const buttons = Array.from(panel.querySelectorAll<HTMLButtonElement>('[data-rate-stars]'));
  const select = (stars: string): void => {
    if (!buttons.some((button) => button.dataset.rateStars === stars)) throw new Error('Unknown banner star filter.');
    buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.rateStars === stars)));
    panel.querySelectorAll<HTMLTableRowElement>('[data-entry-stars]').forEach((row) => {
      row.hidden = stars !== 'all' && row.dataset.entryStars !== stars;
    });
    panel.querySelectorAll<HTMLElement>('[data-rate-tier]').forEach(tier => {
      tier.hidden = stars !== 'all' && tier.dataset.rateTier !== stars;
    });
    selectedRateTiers.set(banner, stars);
  };
  buttons.forEach((button) => button.addEventListener('click', () => select(button.dataset.rateStars ?? '')));
  select(selectedRateTiers.get(banner) ?? 'all');
}

function featuredCharacters(account: Account, pool: readonly BannerOutcome[]): string {
  const owned = new Set(ownedCharacters(account));
  const tiers = [...new Set(pool.filter(entry => entry.kind === 'character').map(entry => entry.stars))].sort((a, b) => b - a);
  if (!tiers.length) return '';
  return `<section class="ref-panel summon-featured" aria-label="Featured Element-Bearers">${tiers.map(stars => `<div class="summon-featured-tier" data-featured-tier="${stars}"><h3>${stars}<span aria-hidden="true">★</span><span class="ref-sr-only"> star</span></h3><ul>${pool.filter(entry => entry.kind === 'character' && entry.stars === stars).map(entry => {
    if (!isStarterId(entry.id)) throw new Error('Banner character definition is missing.');
    const starter = getStarter(entry.id);
    const isOwned = owned.has(entry.id);
    return `<li data-featured-character="${entry.id}" title="${characterName(entry.id)}${isOwned ? ' · Owned' : ''}"><span class="summon-featured-art">${portrait(starter)}</span><span class="summon-featured-name">${starter.name}</span>${isOwned ? '<span class="summon-featured-owned" aria-label="Owned">✓</span>' : ''}</li>`;
  }).join('')}</ul></div>`).join('')}</section>`;
}

export function summonHub(account: Account | null, selected: SummonBannerId = 'standard'): string {
  if (!account) return '<p role="alert">Summoning unavailable. Resolve the save error.</p>';
  const banner = getSummonBanner(selected);
  const pool = banner.pool();
  const highestStars = Math.max(...pool.filter((entry) => entry.kind === 'character').map((entry) => entry.stars));
  const pity = validateBannerPity(account.bannerPity?.[banner.id] ?? { highestStar: 0, unownedHighestStar: 0 });
  return `<div class="ref-screen ref-summon" data-banner="${banner.id}">
    <aside class="ref-summon-left"><section class="ref-panel"><h3>Banners</h3>${bannerNavigation(summonBanners, selected)}</section>
      <section class="ref-panel banner-pity" aria-label="Banner pity"><h3>Pity guarantees</h3>
      <dl class="summon-pity-progress"><div><dt>Highest-star character</dt><dd>${pity.highestStar} / ${bannerPityLimits.highestStar}${pity.highestStar + 1 >= bannerPityLimits.highestStar ? ' · Next draw guaranteed' : ''}</dd><meter min="0" max="${bannerPityLimits.highestStar}" value="${Math.min(pity.highestStar, bannerPityLimits.highestStar)}" aria-label="Highest-star pity progress"></meter></div>
      <div><dt>Unowned highest-star character</dt><dd>${pity.unownedHighestStar} / ${bannerPityLimits.unownedHighestStar}${pity.unownedHighestStar + 1 >= bannerPityLimits.unownedHighestStar ? ' · Next draw guaranteed' : ''}</dd><meter min="0" max="${bannerPityLimits.unownedHighestStar}" value="${Math.min(pity.unownedHighestStar, bannerPityLimits.unownedHighestStar)}" aria-label="Unowned highest-star pity progress"></meter></div></dl></section></aside>
    <div class="ref-summon-main"><section class="ref-panel ref-summon-hero"><div class="summon-visual">
    <div class="summon-banner-art ${banner.artwork.path ? '' : 'art-pending'}" aria-label="${banner.name} artwork">
      ${banner.artwork.path ? `<img src="${assetUrl(banner.artwork.path)}" alt="${banner.artwork.alt}" width="1456" height="816">`
        : `<div class="summon-banner-placeholder"><strong>${banner.name}</strong><span>Banner artwork pending</span></div>`}</div>
    <div class="ref-summon-overlay"><h2>${banner.name}</h2></div></div></section>${featuredCharacters(account, pool)}</div>
    <aside class="ref-panel ref-summon-draw" aria-label="Summon">
    <div class="summon-command"><h3>Summon</h3>
    <p class="currency-reward">${currencyIcon('lycalis')}<span>Owned ${account.lycalis} · Cost ${banner.cost}</span></p>
    <meter class="summon-affordability" min="0" max="${banner.cost}" value="${Math.min(account.lycalis, banner.cost)}" aria-label="Null-Prismatica towards one draw"></meter>
    <p id="summon-result" role="status"></p>
    <button id="summon-character" class="primary-button" ${!banner.available || account.lycalis < banner.cost ? 'disabled' : ''} aria-describedby="banner-cost-note">Summon · ${banner.cost} Null-Prismatica</button>
    <button id="summon-ten" class="primary-button" ${!banner.available || account.lycalis < banner.cost * multiSummonCount ? 'disabled' : ''} aria-describedby="banner-cost-note">Summon 10-Pull · ${banner.cost * multiSummonCount} Null-Prismatica</button>
    <p id="banner-cost-note" class="quiet" ${banner.available && account.lycalis >= banner.cost ? 'hidden' : ''}>${!banner.available ? 'Banner unavailable.' : account.lycalis < banner.cost ? 'Not enough Null-Prismatica.' : ''}</p>
    ${account.lycalis < banner.cost ? '<button class="text-button" type="button" data-page="gameplay">Earn more in Gameplay &rarr;</button>' : ''}</div>
    ${information('summon-information', 'Rates & Information', `${bannerRates(banner, pool)}<section class="summon-rules"><h3>The search for Let</h3><p>${summonLore}</p><h3>Pity and reward rules</h3>
      <p>Guaranteed on pull ${bannerPityLimits.highestStar} without a highest-star character. Any highest-star character resets this counter. Guaranteed on pull ${bannerPityLimits.unownedHighestStar} without a new highest-star character. A new highest-star character resets this counter.</p>
      <p>Counters are independent and belong to this banner. The ${bannerPityLimits.unownedHighestStar} guarantee takes priority if both are due; eligible guaranteed characters have equal odds. If all highest-star characters are owned, it awards a highest-star result using the normal duplicate reward and resets both counters. Current highest tier: ${highestStars}-star. Previously earned progress is retained; counters already past the new limit trigger the applicable guarantee on the next saved draw.</p>
      <p>Only successful saved draws advance pity. Menu visits, rejected draws and failed saves never count.</p>
      <p>Every draw, including a guaranteed draw, has a 0.5% chance of a bonus Legendary Conduit. Each of the five has a 0.1% chance. This is extra loot, not a replacement for your summon, and is not equipped automatically.</p>
      <p>Non-character draws give ${bannerMaterialTiers.map(tier => `${tier.amount} ${tier.rarity}`).join(' / ')} materials. No materials above Rare and no Elemental-Devourers. ${banner.id === 'roses' ? 'This banner awards Rosethorn event materials.' : 'Each of the six elemental material families is equally likely within a rarity.'}</p>
      <p>An already-owned Element-Bearer converts to ${bannerDuplicateMaterialAmount} Rare ${banner.id === 'roses' ? 'Rosethorn materials' : 'materials from one equally selected element'}. Existing Elemental-Devourers remain owned. No duplicate Element-Bearer copy.</p>
      <p>Summon 10-Pull costs ${banner.cost * multiSummonCount} Null-Prismatica and resolves ten ordinary draws in order: each uses the same odds, advances pity and rolls its own Conduit bonus. All ten rewards and the cost are saved together, or nothing is spent.</p>
    <p class="quiet">Guaranteed pulls replace base odds with 100% in the eligible highest-star subset. Ownership does not alter base odds. Lower-star results advance both counters.</p>
    <p>Null-Prismatica sources: First Fracture, Heaven, Abyss, Rosethorn Sanctuary and Sanctuary Elemental-Devourer sales.</p></section>`, 'Rates & Information')}</aside></div>`;
}
