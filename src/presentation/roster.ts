import { getStarter, isStarterId, type StarterId } from '../content/starters';
import { ownedCharacters, ownedProgress, creatureSaleOffer, type Account } from '../game/account';
import { isCurrencyMode } from '../content/activities';
import { portrait } from './portrait';
import { characterRole } from './character-role';
import { characterRating, starBadge } from './character-rating';
import { currencyIcon } from './currency-icon';
import { formatStat } from '../content/combat';
import './roster.css';
import { characterProtection } from '../game/account';
import { getCreature } from '../content/creatures';
import { elementLabel } from './element-label';
import { assetUrl } from './portrait';
import { ownedCharacterInstances } from '../game/account';
import { ownedCompanion, capturedRating } from './owned-companion';
import { capturedProgress, capturedLevelCost, resolveCapturedFighter } from '../game/character-instances';
import { conduits, getConduit, conduitEffect, conduitEquipReason, conduitSlotCount, type ConduitSlots } from '../content/conduits';
import { conduitIcon } from './conduit-store';
import { itemShowcase } from './item-showcase';
import { bannerPercent, bannerPityLimits, validateBannerPity, type BannerOutcome } from '../content/standard-banner';
import { summonBanners, getSummonBanner, type SummonBannerId } from '../content/summon-banners';
import { evolutionRarity } from '../content/progression';
import { information } from './information';
import { characterName } from '../content/character-art';
import { materialName } from '../content/dungeon-art';
import { bannerShowcase } from './banner-showcase';

function lockControl(account: Account, id: string): string {
  const protection = characterProtection(account, id);
  return `<button class="text-button" data-character-lock="${id}" data-lock-value="${!protection.locked}" aria-pressed="${protection.locked}">${protection.locked ? 'Unlock' : 'Lock'} ${isStarterId(id) ? 'Element-Bearer' : 'creature'}</button>
    <small>${protection.locked ? 'Locked' : protection.inSquad ? 'In squad' : 'Unlocked'}</small>`;
}

export function characterCopyManagement(account: Account | null, category: 'all' | 'bearers' | 'creatures' = 'all', selectedCopy?: string): string {
  if (!account) return '<p role="alert">Character copy management unavailable. Resolve the save error.</p>';
  const copies = account.capturedCharacters ?? [];
  const activeCopy = copies.some((copy) => copy.instanceId === selectedCopy) ? selectedCopy : copies[0]?.instanceId;
  return `<section class="character-copy-management" id="character-copies">
    ${category !== 'creatures' ? `<h2>Element-Bearer locks</h2><div class="archive-grid">${ownedCharacters(account).map((id) => `<article class="archive-card"><h3 data-character-name="${id}">${characterName(id, ownedProgress(account, id).evolution)}</h3>${lockControl(account, id)}</article>`).join('')}</div>` : ''}
    ${category !== 'bearers' ? `<h2>Captured creatures ~ ${copies.length}</h2>
      <nav class="owned-roster" aria-label="Owned captured creatures">${copies.map((copy, index) => `<button class="roster-character" data-owned-capture="${copy.instanceId}" aria-pressed="${copy.instanceId === activeCopy}"><strong>${getCreature(copy.creatureId).name}</strong><span>Copy ${index + 1} ~ Lv.${capturedProgress(copy).level}</span></button>`).join('')}</nav>
      ${copies.length ? `<div class="archive-grid">${copies.filter((copy) => category === 'all' || copy.instanceId === activeCopy).map((copy) => {
      const index = copies.indexOf(copy);
      const creature = getCreature(copy.creatureId);
      const progress = capturedProgress(copy);
      const kit = resolveCapturedFighter(copy, account.conduitEquipment?.[copy.instanceId], account.conduitUpgrades);
      const cost = progress.level < 120 ? capturedLevelCost(copy) : null;
      const sale = creature.mode && (isCurrencyMode(creature.mode) || creature.mode === 'roses') ? creatureSaleOffer(account, copy.instanceId) : null;
      const saleItems = sale ? [
        ...(sale.fractalis ? [{ id: 'fractalis', amount: sale.fractalis }] : []),
        ...(sale.lycalis ? [{ id: 'lycalis', amount: sale.lycalis }] : []),
        ...Object.entries(sale.materials).map(([id, amount]) => ({ id, amount })),
      ] : [];
      const saleLabel = saleItems.map(({ id, amount }) => `${amount.toLocaleString('en-US')} ${id === 'fractalis' ? 'Prismatica' : id === 'lycalis' ? 'Null-Prismatica' : materialName(id)}`).join(' + ');
      const slots: ConduitSlots = account.conduitEquipment?.[copy.instanceId] ?? Array.from({ length: conduitSlotCount }, () => null);
      return `<article class="archive-card" data-captured-copy="${copy.instanceId}"><div class="captured-stage"><div class="archive-portrait">${creature.art ? `<img src="${assetUrl(`enemies/${creature.art}.png`)}" alt="${creature.name}" width="960" height="960">` : '<span>Artwork pending</span>'}</div>
        <h3>${creature.name}</h3>${elementLabel(creature.element)}${capturedRating(creature.id)}<p>Copy ${index + 1} ~ Lv.${progress.level}</p></div><div class="captured-controls">${lockControl(account, copy.instanceId)}
        <p>HP ${formatStat(kit.stats.health)} ~ Attack ${formatStat(kit.stats.damage)} ~ Defense ${formatStat(kit.stats.defense)}</p>
        <section class="captured-abilities"><h4>Retained abilities</h4>${progress.skills.map((skill) => `<p>${skill.name}: ${formatStat(skill.multiplier * 100)}% Attack ~ ${skill.every}-turn cooldown ~ ${skill.action}</p>`).join('')}</section>
        <button class="primary-button" data-level-capture="${copy.instanceId}" data-expected-level="${progress.level}" ${!cost || account.fractalis < cost.fractalis || Object.entries(cost.materials).some(([id, amount]) => (account.materials[id] ?? 0) < amount) ? 'disabled' : ''}>${cost ? `Level up ~ ${cost.fractalis} Prismatica` : 'Maximum level 120'}</button>
        <button class="text-button" type="button" data-max-level="${copy.instanceId}">Max Level</button>
        ${cost ? itemShowcase([{ id: 'fractalis', amount: cost.fractalis }, ...Object.entries(cost.materials).map(([id, amount]) => ({ id, amount }))], 'Level cost') : ''}
        ${sale ? itemShowcase(saleItems, 'Sale value') : ''}
        ${sale ? `<button class="text-button" data-sell-creature="${copy.instanceId}" ${sale.reasons.length ? 'disabled' : ''}>Sell copy ~ ${saleLabel}</button>${sale.reasons.length ? `<p class="quiet">Sale protected: ${sale.reasons.join(', ')}</p>` : ''}` : ''}
        <section class="captured-equipment"><h4>Conduits</h4><button class="text-button" data-page="conduit-upgrade">Conduit Upgrade &rarr;</button><p>Omnic: matching combat element only; at most four equipped.</p>${slots.map((equipped, slot) => `<label>${equipped ? conduitIcon(equipped, account.conduitUpgrades?.[equipped]) : ''}Slot ${slot + 1}<select data-capture-conduit="${copy.instanceId}" data-capture-slot="${slot}"><option value="">Empty</option>${conduits.filter((conduit) => (account.conduits?.[conduit.id] ?? 0) > 0).map((conduit) => {
          const reason = conduitEquipReason(conduit, creature.element, slots, slot);
          return `<option value="${conduit.id}" ${equipped === conduit.id ? 'selected' : ''} ${reason ? 'disabled' : ''}>${conduit.name} ~ ${conduit.rarity} ~ +${account.conduitUpgrades?.[conduit.id] ?? 0}${reason ? ` ~ ${reason}` : ''}</option>`;
        }).join('')}</select>${equipped ? `<span>${conduitEffect(getConduit(equipped), account.conduitUpgrades?.[equipped])}</span>` : ''}</label>`).join('')}</section>
        <button class="text-button" data-page="squad">Equip in Squad &rarr;</button></div></article>`;
    }).join('')}</div>` : '<p>No captured creatures.</p>'}` : ''}
    <p id="character-lock-result" role="status"></p></section>`;
}

export function characterRoster(account: Account | null, selected: StarterId): string {
  if (!account) return '<p role="alert">Character roster unavailable. Resolve the save error.</p>';
  return `<nav class="owned-roster" data-menu-scroll="owned-bearers" aria-label="Owned Element-Bearers">${ownedCharacters(account).map((id) => {
    const character = getStarter(id);
    const progress = ownedProgress(account, id);
    return `<button class="roster-character" data-owned-character="${id}" aria-pressed="${selected === id}" style="--element:${character.color}">
      ${portrait(character, progress.evolution)}<span><strong>${characterName(id, progress.evolution)}</strong>${characterRole(id)}${characterRating(id, progress.evolution)}<small>Lv.${progress.level} ~ Evo.${progress.evolution}</small></span></button>`;
  }).join('')}<button class="roster-summon" data-page="summon">Summon &rarr;</button></nav>`;
}

function squadMemberPreview(account: Account, id?: string): string {
  const character = id ? ownedCompanion(account, id) : null;
  return `<div class="squad-portrait">${character ? character.art : '<span class="empty-squad-slot" aria-hidden="true">+</span>'}</div>
    ${character ? `<strong>${character.label}</strong>${character.rating}<small>${character.progress}</small>` : '<strong>Empty slot</strong><small>Optional squad member</small>'}`;
}

export function squadHub(account: Account | null): string {
  if (!account) return '<p role="alert">Squad unavailable. Resolve the save error.</p>';
  const owned = ownedCharacterInstances(account);
  const savedSquad = account.squad ?? [];
  const squad = savedSquad.length && savedSquad.every((id) => owned.includes(id)) ? savedSquad : owned.slice(0, 1);
  return `<section class="squad-hub"><header class="squad-heading"><div><h2>Squad formation</h2>
    <p>Choose a squad member, then pick a slot.</p>${information('squad-information', 'Squad', '<p>Assign one to three distinct owned IDs. The first slot is the leader. Element-Bearers and captured creatures can occupy any slot; different copies of the same creature can share a squad. Squad members have independent stats, Gauge and actions in every activity. Choose a roster member then a slot, or use the named selection controls. Assigning an existing member to another slot swaps the occupants. Save squad commits the draft; viewing and editing it do not.</p>')}</div>
    <div class="squad-save"><span data-squad-count>${squad.length} ~ 3 slots filled</span><button class="primary-button" type="submit" form="squad-form" ${owned.length ? '' : 'disabled'}>Save squad</button></div></header>
    <form id="squad-form"><div class="squad-slots">${[0, 1, 2].map((index) => {
      const id = squad[index];
      return `<section class="squad-slot"><h3>${index === 0 ? 'Leader' : `Squad member ${index}`}</h3>
        <button type="button" class="squad-member-preview" data-squad-assign="${index}" aria-label="Assign selected squad member to ${index === 0 ? 'leader' : `slot ${index + 1}`}">${squadMemberPreview(account, id)}</button>
        ${index ? `<button class="text-button squad-remove" type="button" data-squad-remove="${index}">Remove</button>` : ''}
        <label for="squad-${index}">${index === 0 ? 'Choose leader' : `Choose squad member ${index}`}</label>
        <select id="squad-${index}" name="slot-${index}">${index ? `<option value="" ${!id ? 'selected' : ''}>Empty slot</option>` : ''}
          ${!index && !owned.length ? '<option value="" selected disabled>No owned squad members</option>' : ''}
          ${owned.map((option) => `<option value="${option}" ${id === option ? 'selected' : ''}>${ownedCompanion(account, option).label}</option>`).join('')}</select></section>`;
    }).join('')}</div>
      <p id="squad-result" role="status"></p></form>
    <section class="squad-roster"><h3>Owned squad members ~ ${owned.length}</h3><nav class="owned-roster" aria-label="Choose a squad member">${owned.map((id) => {
      const member = ownedCompanion(account, id);
      return `<button type="button" class="roster-character" data-squad-pick="${id}" aria-pressed="false">${member.art}<span><strong>${member.name}</strong><small>${member.progress}</small></span><small>${squad.includes(id) ? 'In squad' : ''}</small></button>`;
    }).join('')}</nav></section>
    </section>`;
}

export function bindSquadPreview(host: HTMLElement, account: Account | null): void {
  const form = host.querySelector<HTMLFormElement>('#squad-form');
  if (!form || !account) return;
  const controls = Array.from(form.querySelectorAll<HTMLSelectElement>('select[name^="slot-"]'));
  let picked: string | undefined;
  const refresh = (): void => {
    controls.forEach((control) => {
    if (control.value && !ownedCharacterInstances(account).includes(control.value)) throw new Error('Squad preview member is not owned.');
    const preview = control.closest('.squad-slot')?.querySelector('.squad-member-preview');
    const count = host.querySelector('[data-squad-count]');
    if (!preview || !count) throw new Error('Squad preview is missing.');
    preview.innerHTML = squadMemberPreview(account, control.value || undefined);
    count.textContent = `${controls.filter((entry) => entry.value).length} ~ 3 slots filled`;
    });
    host.querySelectorAll<HTMLButtonElement>('[data-squad-pick]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.squadPick === picked));
      const assigned = controls.some((control) => control.value === button.dataset.squadPick);
      const tag = button.querySelector(':scope > small');
      if (tag) tag.textContent = assigned ? 'In squad' : '';
    });
  };
  controls.forEach((control) => control.addEventListener('change', refresh));
  host.querySelectorAll<HTMLButtonElement>('[data-squad-pick]').forEach((button) => button.addEventListener('click', () => {
    picked = button.dataset.squadPick;
    if (!picked || !ownedCharacterInstances(account).includes(picked)) throw new Error('Choose an owned squad member.');
    refresh();
    const status = host.querySelector('#squad-result');
    if (status) status.textContent = `${ownedCompanion(account, picked).name} selected. Choose a slot.`;
  }));
  host.querySelectorAll<HTMLButtonElement>('[data-squad-assign], [data-squad-remove]').forEach((button) => button.addEventListener('click', () => {
    const remove = button.dataset.squadRemove !== undefined;
    const index = Number(remove ? button.dataset.squadRemove : button.dataset.squadAssign);
    const status = host.querySelector('#squad-result');
    if (!status) throw new Error('Squad status is missing.');
    if (!remove && !picked) { status.textContent = 'Choose an owned squad member before assigning a slot.'; return; }
    if (!remove && controls[0].value === picked && index !== 0 && !controls[index].value) {
      status.textContent = 'Choose a replacement leader before moving the leader to an empty slot.';
      return;
    }
    const slots = assignSquadSlot(controls.map((control) => control.value), index, remove ? '' : picked ?? '', ownedCharacterInstances(account));
    controls.forEach((control, slot) => {
      control.value = slots[slot];
      control.dispatchEvent(new Event('change', { bubbles: true }));
    });
    status.textContent = 'Squad draft changed. Save squad to apply it.';
  }));
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
  return `<section class="summon-rates" aria-label="Banner drop rates" data-rate-banner="${banner.id}"><header><h3>Drop rates</h3><p class="quiet" id="banner-rate-note">Base rates exclude pity guarantees. Values are rounded to six decimal places.</p></header>
    <nav class="banner-rate-filters" aria-label="Filter rates by stars"><button type="button" data-rate-stars="all" aria-pressed="true">All</button>${tiers.map((stars) => `<button type="button" data-rate-stars="${stars}" aria-pressed="false">${stars}-star</button>`).join('')}</nav>
    <div class="banner-tier-bar" aria-hidden="true">${tiers.map((stars) => `<span style="flex-grow:${pool.filter((entry) => entry.stars === stars).reduce((total, entry) => total + entry.chance, 0)}"></span>`).join('')}</div>
    <div class="banner-tier-totals">${tiers.map((stars) => `<span>${stars}-star <strong>${bannerPercent(pool.filter((entry) => entry.stars === stars).reduce((total, entry) => total + entry.chance, 0))}</strong></span>`).join('')}</div>
    <table class="summon-drop-table" aria-describedby="banner-rate-note"><caption>${banner.name} outcomes</caption>
      <thead><tr><th scope="col">Name</th><th scope="col">Rarity ~ Stars</th><th scope="col">Rate</th></tr></thead>
      <tbody>${[...pool].sort((a, b) => b.stars - a.stars).map((entry) => {
        let name: string;
        if (entry.kind === 'character') {
          if (!isStarterId(entry.id)) throw new Error('Banner character definition is missing.');
          name = characterName(entry.id);
        } else name = getCreature(entry.id).name;
        const rarity = evolutionRarity(entry.kind === 'character' ? 1 : entry.stars);
        return `<tr data-banner-entry="${entry.id}" data-entry-stars="${entry.stars}"><th scope="row">${name}</th><td>${rarity}<span>${entry.stars}-star</span></td><td>${bannerPercent(entry.chance)} per draw</td></tr>`;
      }).join('')}</tbody></table></section>`;
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
    selectedRateTiers.set(banner, stars);
  };
  buttons.forEach((button) => button.addEventListener('click', () => select(button.dataset.rateStars ?? '')));
  select(selectedRateTiers.get(banner) ?? 'all');
}

export function summonHub(account: Account | null, selected: SummonBannerId = 'standard'): string {
  if (!account) return '<p role="alert">Summoning unavailable. Resolve the save error.</p>';
  const banner = getSummonBanner(selected);
  const pool = banner.pool();
  const highestStars = Math.max(...pool.filter((entry) => entry.kind === 'character').map((entry) => entry.stars));
  const duplicateCreature = getCreature(banner.duplicateReward.creatureId);
  const pity = validateBannerPity(account.bannerPity?.[banner.id] ?? { highestStar: 0, unownedHighestStar: 0 });
  return `${bannerNavigation(summonBanners, selected)}<section class="summon-hub" data-banner="${banner.id}"><p class="eyebrow">SUMMON</p><h2>${banner.name}</h2>
    <div class="summon-main" data-menu-scroll="summon-main"><div class="summon-visual">
    <div class="summon-banner-art ${banner.artwork.path ? '' : 'art-pending'}" aria-label="${banner.name} artwork">
      ${banner.artwork.path ? `<img src="${assetUrl(banner.artwork.path)}" alt="${banner.artwork.alt}" width="1456" height="816">`
        : `<div class="summon-banner-placeholder"><strong>${banner.name}</strong><span>Banner artwork pending</span></div>`}</div>
    ${bannerCharacters(pool)}${bannerShowcase(banner.id)}</div>${bannerRates(banner, pool)}</div>
    <aside class="summon-sidebar" aria-label="Draw and pity guarantees">
    <div class="summon-command"><h3>Single draw</h3>
    <p class="currency-reward">${currencyIcon('lycalis')}<span>Owned ${account.lycalis} ~ Cost ${banner.cost}</span></p>
    <meter class="summon-affordability" min="0" max="${banner.cost}" value="${Math.min(account.lycalis, banner.cost)}" aria-label="Null-Prismatica towards one draw"></meter>
    <p id="summon-result" role="status"></p>
    <button id="summon-character" class="primary-button" ${!banner.available || account.lycalis < banner.cost ? 'disabled' : ''} aria-describedby="banner-cost-note">Summon ~ ${banner.cost} Null-Prismatica</button>
    <p id="banner-cost-note" class="quiet" ${banner.available && account.lycalis >= banner.cost ? 'hidden' : ''}>${!banner.available ? 'Banner unavailable.' : account.lycalis < banner.cost ? 'Not enough Null-Prismatica.' : ''}</p>
    ${account.lycalis < banner.cost ? '<button class="text-button" type="button" data-page="gameplay">Earn more in Gameplay &rarr;</button>' : ''}</div>
    <section class="banner-pity" aria-label="Banner pity"><h3>Pity guarantees</h3>
      <dl class="summon-pity-progress"><div><dt>Highest-star character</dt><dd>${pity.highestStar} ~ ${bannerPityLimits.highestStar}</dd><meter min="0" max="${bannerPityLimits.highestStar}" value="${pity.highestStar}" aria-label="Highest-star pity progress"></meter></div>
      <div><dt>Unowned highest-star character</dt><dd>${pity.unownedHighestStar} ~ ${bannerPityLimits.unownedHighestStar}</dd><meter min="0" max="${bannerPityLimits.unownedHighestStar}" value="${pity.unownedHighestStar}" aria-label="Unowned highest-star pity progress"></meter></div></dl></section>
    ${information('summon-information', 'Rates & Information', `<section class="summon-rules"><h3>Pity, tier totals and reward rules</h3>
      <p>Guaranteed on pull ${bannerPityLimits.highestStar} without a highest-star character. Any highest-star character resets this counter. Guaranteed on pull ${bannerPityLimits.unownedHighestStar} without a new highest-star character. A new highest-star character resets this counter.</p>
      <p>Counters are independent and belong to this banner. The 500 guarantee takes priority if both are due; eligible guaranteed characters have equal odds. If all highest-star characters are owned, the 500 guarantee awards a highest-star result using the normal duplicate reward and resets both counters. Current highest tier: ${highestStars}-star.</p>
      <p>Only successful saved draws advance pity. Menu visits, rejected draws and failed saves never count.</p>
      <p>Each successful draw separately rolls a 0.5% Legendary Conduit bonus, including guaranteed pity draws. One of five Legendary Conduits is chosen equally (0.1% each); no bonus otherwise. The bonus is additional, never replaces the main result, and saves atomically with cost, reward and pity. It is not auto-equipped.</p>
      <p>An already-owned Element-Bearer grants ${duplicateCreature.name} ~ Omnic ~ 6-star ~ Lv.${banner.duplicateReward.level}. It is a captured creature, not an extra Element-Bearer. It can fight or be sold for this mode's rewards. Creature draws create independent copies at the first authored stage level of that form. No duplicate EB copy or multi-draw.</p>
    <h3>Base odds ~ Outside pity guarantees</h3><ul>${[...new Set(pool.map((entry) => entry.stars))].sort((a, b) => a - b).map((stars) => {
      const tier = pool.filter((entry) => entry.stars === stars);
      return `<li>${stars}-star tier: ${bannerPercent(tier.reduce((sum, entry) => sum + entry.chance, 0))} ~ ${tier.length} entries, equal within tier</li>`;
    }).join('')}</ul>
    <p class="quiet">Guaranteed pulls replace base odds with 100% in the eligible highest-star subset. Only the listed outcomes are in this banner. Ownership does not alter base odds. ${banner.id === 'roses' ? 'Rosetta, Thornia and Crinso share the 6-star tier equally at 1.1% total. Any natural 6-star result resets the 200-pull counter; a newly owned 6-star resets both counters. Event and banner have no scheduled expiry.' : 'Standard has six 5-star Element-Bearers sharing 1% total, four 6-star Element-Bearers sharing 0.1% total, and twelve creature outcomes sharing 98.9%. Highest-star pity targets the 6-star tier; 5-star results advance both counters.'}</p>
    <p>Null-Prismatica sources: First Fracture, Heaven, Abyss, Rosethorn Sanctuary and Sanctuary creature sales.</p></section>`, 'Rates & Information')}</aside></section>`;
}
