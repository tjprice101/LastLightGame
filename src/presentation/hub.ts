import { getStarter, isStarterId, type Starter } from '../content/starters';
import { resolveFighter, formatStat, shatterGauge } from '../content/combat';
import { artifactSlots, characterGrowth, characterLevelCap, upgradePaths, characterLevelCost, characterEvolutionCost, characterEvolutionRequirement, type CharacterProgress } from '../content/progression';
import { characterRating } from './character-rating';
import { portrait, portraitAttributes, assetUrl, characterFacing, characterFacingAttributes } from './portrait';
import { elementalReveal } from './reveal';
import { ownedCompanion } from './owned-companion';
import { abilityIcon } from './ability-icon';
import { getElement } from '../content/activities';
import { uiIcon } from './ui-icon';
import { materialArt, materialName } from '../content/dungeon-art';
import { emptyAccount, ownedProgress, equippedSquad, ownedCharacters, evolutionFodderOptions, type Account } from '../game/account';
import { characterName } from '../content/character-art';
import { characterRole } from './character-role';
import { currencyIcon } from './currency-icon';
import { inventoryView, type InventoryTab } from './inventory';
import { conduits, conduitEquipReason, conduitSlotCount, conduitEffect, type ConduitSlots, type ConduitUpgrades } from '../content/conduits';
import { conduitIcon, kitConduitRules } from './conduit-store';
import { capturedProgress, resolveCapturedFighter, type CapturedCharacter } from '../game/character-instances';
import { capturedRating } from './owned-companion';
import { information } from './information';
import { getSummonBanner } from '../content/summon-banners';
import { bannerShowcase } from './banner-showcase';
import { statChange, statDirection } from './stat-change';
import { machineRules } from '../content/machines';
import { characterRoster } from './roster';

export const characterTabs = [
  { id: 'overview', label: 'Overview', symbol: '01' },
  ...upgradePaths.map((path, index) => ({ id: path.id, label: path.name, symbol: `0${index + 2}` })),
  { id: 'equipment', label: 'Conduits', symbol: '09' },
] as const;

export function isCharacterTab(value: string): boolean {
  return characterTabs.some((tab) => tab.id === value);
}

function stats(unit: Starter | CapturedCharacter, progress?: CharacterProgress, grouped = false, equipment?: ConduitSlots, upgrades?: ConduitUpgrades): string {
  const values = 'instanceId' in unit ? resolveCapturedFighter(unit, equipment, upgrades).stats : resolveFighter(unit.id, progress, equipment, upgrades).stats;
  const base = 'instanceId' in unit ? resolveCapturedFighter(unit).stats : resolveFighter(unit.id, progress).stats;
  const changed = equipment?.some((id) => id !== null);
  const statKeys = { Health: 'health', Defense: 'defense', 'Attack Damage': 'damage', 'Critical Rate': 'crit',
    'Critical Damage Multiplier': 'critMultiplier', 'Shatter capacity': 'shatterCapacity', 'Elemental Damage': 'elementalDamage' } as const;
  type StatEntry = [keyof typeof statKeys, string | number];
  const groups: { label: string; entries: StatEntry[] }[] = [
    { label: 'Survival', entries: [['Health', values.health], ['Defense', values.defense]] },
    { label: 'Offense', entries: [['Attack Damage', values.damage], ['Critical Rate', `${formatStat(values.crit * 100)}%`],
      ['Critical Damage Multiplier', `${formatStat(values.critMultiplier)}x`], ['Elemental Damage', values.elementalDamage]] },
    { label: 'Resource', entries: [['Shatter capacity', values.shatterCapacity]] },
  ];
  const render = (entries: readonly StatEntry[]): string => entries.map(([label, value]) => {
    const key = statKeys[label];
    const direction = statDirection(base[key], values[key]);
    const modified = changed && direction !== 'unchanged';
    const unit = key === 'crit' ? '%' : key === 'critMultiplier' ? 'x' : '';
    return `<div><small>${label}</small><strong${modified ? ` class="stat-change stat-change--${direction}"` : ''}>${typeof value === 'number' ? formatStat(value) : value}</strong>${modified ? `<small>Before Conduits: ${formatStat(key === 'crit' ? base[key] * 100 : base[key])}${unit}</small>` : ''}</div>`;
  }).join('');
  return grouped ? `<div class="character-stat-groups" aria-label="Current combat stats">${groups.map((group) =>
    `<section class="character-category"><h3>${group.label}</h3><div class="hub-stats">${render(group.entries)}</div></section>`).join('')}</div>`
    : `<div class="hub-stats" aria-label="Current combat stats">${render([
      ['Shatter capacity', values.shatterCapacity], ...groups[0].entries, ...groups[1].entries,
    ])}</div>`;
}

function tabButtons(starter: Starter, current: string, dock = false, ids?: readonly string[]): string {
  const tabIcons = { 'upgrade-3': 'passive', 'upgrade-4': 'skill1', 'upgrade-5': 'skill2', 'upgrade-6': 'ultimate' } as const;
  const iconFor = (id: string): string => {
    if (id === 'upgrade-3' || id === 'upgrade-4' || id === 'upgrade-5' || id === 'upgrade-6') {
      return abilityIcon(starter.id, tabIcons[id]);
    }
    if (id === 'overview') return uiIcon('overview');
    if (id === 'upgrade-0') return uiIcon('evolution');
    if (id === 'upgrade-1') return uiIcon('level');
    if (id === 'equipment') return uiIcon('inventory');
    return '';
  };
  return characterTabs.filter((tab) => !ids || ids.includes(tab.id)).map((tab) => `<button type="button" class="${dock ? 'hub-dock-button' : 'hub-rail-button'}"
    data-character-tab="${tab.id}" ${dock ? '' : `aria-pressed="${current === tab.id}"`}>
    <span class="hub-symbol" aria-hidden="true">${iconFor(tab.id) || tab.symbol}</span><span>${tab.label}</span></button>`).join('');
}

function characterSection(tab: string): string {
  return tab === 'equipment' ? 'equipment' : tab === 'upgrade-0' || tab === 'upgrade-1' ? 'growth' : 'details';
}

function characterNavigation(starter: Starter, current: string): string {
  const selected = characterSection(current);
  return `<div class="character-sections" aria-label="Character sections">${[
    { id: 'details', tab: 'overview', label: 'Details' },
    { id: 'growth', tab: 'upgrade-1', label: 'Growth' },
    { id: 'equipment', tab: 'equipment', label: 'Conduits' },
  ].map((section) => `<button type="button" data-character-section-tab="${section.tab}" aria-pressed="${section.id === selected}">${section.label}</button>`).join('')}</div>` + [
    { id: 'details', label: 'Combat', ids: ['overview', 'upgrade-3', 'upgrade-4', 'upgrade-5', 'upgrade-6'] },
    { id: 'growth', label: 'Growth', ids: ['upgrade-0', 'upgrade-1'] },
    { id: 'equipment', label: 'Character', ids: ['equipment'] },
  ].map((group) => `<section class="character-nav-group" aria-label="${group.label}" data-character-section="${group.id}" ${group.id === selected ? '' : 'hidden'}>
    ${group.id === 'details' ? '<details class="character-kit-navigation"><summary>Individual skill panels</summary>' : ''}
    <h3>${group.label}</h3><div>${tabButtons(starter, current, false, group.ids)}</div>${group.id === 'details' ? '</details>' : ''}</section>`).join('');
}

export function homeHub(starter: Starter, firstArrival: boolean, account: Account | null = emptyAccount()): string {
  const progress = account ? ownedProgress(account, starter.id) : undefined;
  const squad = account && ownedCharacters(account).length ? equippedSquad(account) : [starter.id];
  const capturedLeader = account && !firstArrival && !isStarterId(squad[0]) ? ownedCompanion(account, squad[0]) : null;
  const capturedCopy = capturedLeader ? account?.capturedCharacters?.find((copy) => copy.instanceId === squad[0]) : undefined;
  const displayName = capturedLeader?.name ?? characterName(starter.id, progress?.evolution);
  const nameParts = displayName.split(', ');
  const identity = nameParts.length > 1 ? `<small class="form-prefix">${nameParts.slice(0, -1).join(', ')}</small><span>${nameParts.at(-1)}</span>` : displayName;
  const banner = getSummonBanner('standard');
  const specialBanner = getSummonBanner('roses');
  return `<div class="hub-heading"><p class="eyebrow">THE SANCTUARY</p><h1 tabindex="-1">Home</h1></div>
    <div class="home-hub" style="--element:${capturedLeader?.color ?? starter.color}">
      <aside class="home-destinations" aria-label="Home shortcuts">
        <div class="home-banner-promotion"><button class="home-banner home-summon-banner" data-page="summon" ${banner.artwork.path ? `style="--banner-art:url('${assetUrl(banner.artwork.path)}')"` : ''}>
          <small>${banner.name}</small><strong>Summon</strong><span>${currencyIcon('lycalis')} Single draw · ${banner.cost} Null-Prismatica</span></button>
          ${bannerShowcase(banner.id)}</div>
        <div class="home-banner-promotion"><button class="home-banner home-summon-banner home-special-banner" data-page="summon" data-rose-banner ${specialBanner.artwork.path ? `style="--banner-art:url('${assetUrl(specialBanner.artwork.path)}')"` : ''}>
          <small>Limited</small><strong>${specialBanner.name}</strong><span>Special Limited Time Banner!</span></button>
          ${bannerShowcase(specialBanner.id)}</div>
      </aside>
      <section class="hub-showcase ${firstArrival ? 'first-arrival' : ''}" aria-label="${capturedLeader ? 'Your captured creature' : 'Your saved Element-Bearer'}">
        <div class="hub-portrait">${capturedLeader?.art ?? portrait(starter, progress?.evolution)}${firstArrival ? elementalReveal(starter) : ''}</div>
        <div class="sanctuary-identity-plate"><p class="element-pill">${capturedLeader ? `${capturedLeader.element} · Captured creature` : `${starter.element} · ${starter.weapon}`}</p>
        <h2 aria-label="${displayName}">${identity} ${capturedLeader ? '' : characterRole(starter.id)}</h2>${capturedLeader?.rating ?? characterRating(starter.id, progress?.evolution)}
        ${capturedLeader ? '' : `<p class="home-vow">${starter.title}</p>`}
        <p class="upgrade-progress">${capturedLeader?.progress ?? `Lv.${progress?.level ?? 0} · Evo.${progress?.evolution ?? 1}`}</p>
        <button type="button" class="text-button home-character-link" data-page="team" data-team-area="${capturedLeader ? 'creatures' : 'bearers'}" ${capturedLeader ? `data-team-capture="${squad[0]}"` : `data-team-character="${starter.id}"`}>View ${capturedLeader ? 'creature' : 'character'} &rarr;</button>
        ${firstArrival ? `<p class="bond-message">${starter.lore.awakening}</p>` : ''}</div>
        ${information('home-information', 'Character information',
          stats(capturedCopy ?? starter, progress, false, account?.conduitEquipment?.[capturedCopy?.instanceId ?? starter.id], account?.conduitUpgrades) +
          (capturedLeader ? `<p>${capturedLeader.progress} · Level cap 120</p><p>Cannot evolve.</p>` :
            `<p>${starter.description}</p><p>${starter.lore.story}</p><blockquote>"${starter.lore.vow}"</blockquote>`))}
      </section>
      <aside class="home-squad" aria-label="Current squad">
        <div class="hub-info">
          <div class="team-heading"><h2>Squad</h2><span>${squad.length} / 3</span></div>
          ${Array.from({ length: 3 }, (_, index) => {
            const id = squad[index];
            if (!id) return `<button class="team-companion team-empty" data-page="squad"><span aria-hidden="true">+</span><strong>Add member</strong></button>`;
            if (!account || (isStarterId(id) && !account.characters[id])) return `<button class="team-companion" data-page="squad">${portrait(isStarterId(id) ? getStarter(id) : starter)}<span>${characterName(starter.id)} · Progress unavailable</span></button>`;
            const companion = ownedCompanion(account, id);
            return `<button class="team-companion" data-page="squad">${companion.art}<span><strong>${companion.name}</strong><small>${index === 0 ? 'Leader · ' : ''}${companion.progress}</small></span></button>`;
          }).join('')}
        </div>
        <div class="hub-launch"><button class="hub-battle-button" data-page="story">
        <small>SIX BEACONS</small><strong>Story &rarr;</strong><span>Explore the world map · 150 stages</span></button>
        </div>
      </aside>
    </div>`;
}

function ability(starter: Starter, action: 'skill1' | 'skill2' | 'ultimate', progress?: CharacterProgress, equipment?: ConduitSlots, upgrades?: ConduitUpgrades): string {
  const content = resolveFighter(starter.id, progress, equipment, upgrades).abilities[action];
  return `<article class="hub-ability"><h3 class="ability-heading">${abilityIcon(starter.id, action)}<span>${content.name}</span></h3><p>${content.description}</p>
    <p class="hub-cost">Costs ${shatterGauge.costs[action]} Shatter Gauge${content.cooldown ? ` · ${content.cooldown}-turn cooldown` : ''}.</p></article>`;
}

function equipment(starter: Starter, account: Account | null): string {
  const slots = account?.conduitEquipment?.[starter.id] ?? Array<null>(conduitSlotCount).fill(null);
  const name = characterName(starter.id, account ? ownedProgress(account, starter.id).evolution : 1);
  return `<section class="equipment-panel" aria-label="${name} equipment" data-character-equipment="${starter.id}">
    <h3>${name}'s Conduits</h3>
    <button class="text-button" data-page="conduit-store">Visit Conduit Store &rarr;</button>
    <button class="text-button" data-page="conduit-upgrade">Conduit Upgrade &rarr;</button>
    <div class="character-equipment-grid"><section class="character-category"><h3>Master slot</h3><div class="master-relic"><strong>Master Conduit</strong><span>Reserved · Not available</span></div></section>
    <section class="character-category"><h3>Conduit slots</h3><div class="artifact-grid">${artifactSlots.map((slot, index) => {
      const selected = slots[index];
      const conduit = conduits.find((entry) => entry.id === selected);
      return `<div class="artifact-slot conduit-equipment-slot">${conduit ? conduitIcon(conduit.id, account?.conduitUpgrades?.[conduit.id]) : ''}<label for="conduit-slot-${index}">Conduit ${slot}</label>
        <select id="conduit-slot-${index}" data-conduit-slot="${index}" ${!account ? 'disabled' : ''}><option value="">Empty</option>
        ${conduits.filter((entry) => (account?.conduits?.[entry.id] ?? 0) > 0).map((entry) => {
          const reason = conduitEquipReason(entry, starter.elementId, slots, index);
          return `<option value="${entry.id}" ${entry.id === selected ? 'selected' : ''} ${reason ? 'disabled' : ''}>${entry.name} · ${entry.rarity} · +${account?.conduitUpgrades?.[entry.id] ?? 0}${reason ? ` · ${reason}` : ''}</option>`;
        }).join('')}</select>
        <span>${conduit ? conduitEffect(conduit, account?.conduitUpgrades?.[conduit.id]) : 'No bonus'}</span></div>`;
    }).join('')}</div></section></div>
    ${!account ? '<p role="alert">Equipment unavailable. Resolve the save error.</p>' : ''}
    <p>Omnic Conduits must match this character's element; at most four may be equipped.</p>
    <p id="conduit-equipment-result" role="status"></p>${stats(starter, account ? ownedProgress(account, starter.id) : undefined, true, account?.conduitEquipment?.[starter.id], account?.conduitUpgrades)}</section>`;
}

function materialIcon(id: string): string {
  const art = materialArt(id);
  return art ? `<img draggable="false" src="${assetUrl(`materials/${art}.png`)}" alt="" width="48" height="48">` : '';
}

export function inventoryHub(account: Account | null = emptyAccount(), selected: InventoryTab = 'materials'): string {
  return inventoryView(account, selected);
}

function upgradePanel(starter: Starter, evolve: boolean, account: Account | null): string {
  if (!account) return '<p>Progression unavailable. Resolve the save error before upgrading.</p><button class="primary-button" disabled>Upgrade unavailable</button>';
  const current = ownedProgress(account, starter.id);
  const cap = characterLevelCap(current.evolution);
  const finished = evolve ? current.evolution === characterGrowth.forms : current.level === cap;
  if (finished) return `<p class="upgrade-progress">Lv.${current.level} / ${cap} &middot; Evo.${current.evolution} / ${characterGrowth.forms}</p>
    <p>${evolve ? 'Final evolution reached.' : current.evolution === characterGrowth.forms ? 'Maximum level reached.' : 'Level cap reached. Evolution required.'}</p>
    ${!evolve ? `<button class="text-button" type="button" data-max-level="${starter.id}">Max Level</button>` : ''}<p id="upgrade-result" role="status"></p>`;
  const element = getElement(starter.elementId);
  const cost = evolve ? characterEvolutionCost(starter.id, current) : characterLevelCost(starter.id, current);
  const next = evolve ? { ...current, evolution: current.evolution + 1 } : { ...current, level: current.level + 1 };
  const nextPortrait = evolve ? portraitAttributes(starter, next.evolution) : null;
  const before = resolveFighter(starter.id, current, account.conduitEquipment?.[starter.id], account.conduitUpgrades).stats;
  const after = resolveFighter(starter.id, next, account.conduitEquipment?.[starter.id], account.conduitUpgrades).stats;
  const resources = [{ name: 'Prismatica', owned: account.fractalis, needed: cost.fractalis, icon: currencyIcon('fractalis') },
    ...Object.entries(cost.materials).map(([id, needed]) => {
      return { name: materialName(id), owned: account.materials[id] ?? 0, needed,
        icon: materialIcon(id) };
    })];
  const reason = evolve && current.level !== cap ? `Reach Lv.${cap} to evolve.` : resources.some((resource) => resource.owned < resource.needed) ? 'Insufficient resources.' : '';
  const requirement = evolve ? characterEvolutionRequirement(starter.id, current.evolution) : null;
  const options = requirement?.creatureCount ? evolutionFodderOptions(account, element.id, current.evolution, starter.id) : [];
  const count = requirement?.creatureCount ?? 0;
  const modeName = requirement?.infusion === 'roses' ? 'Passion of Crimson Roses' : element.infusion === 'heavens' ? 'Soar to Heaven' : 'Delve into the Abyss';
  const selection = count ? `<fieldset class="evolution-fodder"><legend>Captured creatures · Select ${count}</legend>
    <p>Select ${count} distinct form ${requirement?.minimumCreatureForm}+ creatures from ${modeName}.</p>
    <p data-fodder-status role="status">0 / ${count} selected · ${options.filter((entry) => entry.eligible).length} eligible</p>
    <div class="evolution-fodder-list">${options.length ? options.map(({ copy, index, creature, form, reasons, eligible }) =>
      `<label class="evolution-fodder-copy"><input type="checkbox" data-evolution-fodder="${copy.instanceId}" ${!eligible ? 'disabled' : ''}>
      ${creature.art ? `<img draggable="false" src="${assetUrl(`enemies/${creature.art}.png`)}" alt="${creature.name}" width="72" height="72">` : ''}
      <span><strong>${creature.name} · Copy ${index}</strong><small>Lv.${capturedProgress(copy).level} · Form ${form}</small>${capturedRating(creature.id)}<small>${eligible ? 'Eligible for consumption' : reasons.join(', ')}</small></span></label>`).join('') : '<p>No captured creatures owned yet.</p>'}</div>
    </fieldset>` : '';
  return `<p class="upgrade-progress">Lv.${current.level} / ${cap} &middot; Evo.${current.evolution} / ${characterGrowth.forms}</p>
    <div class="character-upgrade-grid"><section class="character-category upgrade-benefits"><h3>${evolve ? 'Evolution preview' : 'Level preview'}</h3>
    <div class="hub-comparison"><div><small>CURRENT</small><strong>${evolve ? `Evo.${current.evolution}` : `Lv.${current.level}`}</strong></div>
    <div><small>NEXT</small>${nextPortrait ? `<div class="evolution-silhouette"><span class="character-idle" data-character="${starter.id}"><img draggable="false" src="${nextPortrait.src}" alt="${characterName(starter.id, current.evolution)} next evolution silhouette" ${characterFacingAttributes(starter.id, next.evolution)} width="150" height="150"></span></div>` : ''}<strong>${evolve ? `Evo.${next.evolution} · Cap ${characterLevelCap(next.evolution)}` : `Lv.${next.level}`}</strong></div></div>
    <div class="upgrade-stat-preview">${(['health', 'defense', 'damage', 'crit', 'critMultiplier', 'shatterCapacity', 'elementalDamage'] as const).map((key) =>
      `<span><small>${({ health: 'Health', defense: 'Defense', damage: 'Attack', crit: 'Critical Rate', critMultiplier: 'Critical Damage', shatterCapacity: 'Shatter Capacity', elementalDamage: 'Elemental Damage' })[key]}</small><strong>${statChange(before[key], after[key], key === 'crit' ? '%' : key === 'critMultiplier' ? 'x' : '')}</strong></span>`).join('')}</div>
    </section><section class="character-category upgrade-payment"><h3>Required resources</h3><p class="resource-key">Owned / Required</p>
    <ul class="upgrade-resources">${resources.map((resource) => `<li class="${resource.owned < resource.needed ? 'resource-missing' : 'resource-sufficient'}">${resource.icon}<strong>${resource.name}</strong><span>${resource.owned} / ${resource.needed}</span></li>`).join('')}</ul>
    ${evolve && !account.firstFracture ? `<p class="currency-reward">${currencyIcon('lycalis')}<span>First Fracture reward: +10 Null-Prismatica.</span></p>` : ''}
    ${selection}<button class="primary-button" data-upgrade="${evolve ? 'evolve' : 'level'}" data-fodder-count="${count}" data-upgrade-blocked="${!!reason}" ${reason || count ? 'disabled' : ''}>${evolve ? 'Evolve' : 'Level up'}</button>
    ${!evolve ? `<button class="text-button" type="button" data-max-level="${starter.id}">Max Level</button>` : ''}
    <p class="quiet">${reason}</p>
    <p id="upgrade-result" role="status"></p></section></div>`;
}

export function characterInformation(): string {
  return information('character-information', 'Character information', `<h3>Levels and evolution</h3>
    <p>Element-Bearer level caps: ${Array.from({ length: characterGrowth.forms }, (_, index) => characterLevelCap(index + 1)).join(' / ')}.
    Evolution requires the current form's maximum level and preserves that level. Max Level previews affordable levels within the current cap, total costs and stat changes before confirmation.
    Captured creatures level independently to 120 and cannot evolve.</p>
    <p>Core growth: (1 + 0.03 &times; level)&sup3; &times; 1.45^(evolution - 1). Defense uses core growth^0.7; percentage potency grows separately.
    Base Gauge gains, skill costs, cooldowns and durations do not scale with levels. Equipped Conduits may modify them as stated in their rules.
    Ability potency increases with levels and evolution; there are no separate ability upgrades.</p>
    <h3>Evolution fodder</h3><p>Evo.3→4 consumes 1 form 3+ creature; Evo.4→5 consumes 2 form 4+; Evo.5→6 consumes 3 form 5+.
    Copies must match the element's infusion mode and be explicitly selected. Rosetta, Thornia and Crinso instead require Roselius from Passion of Crimson Roses. Consumption is permanent.</p>
    <h3>Rose event growth</h3><p>Rosetta, Thornia and Crinso use Rosethorn materials instead of ordinary elemental and specialty materials.
    Seed stacks pay for levels; Evo.5–6 levels also use Soul. Late evolutions also use Soul and selected Roselius.
    Roselius are capturable only at enemy levels 120 or below, can level to 120 and can be sold for their fixed form's Rosethorn material.</p>
    <h3>Protection and sales</h3><p>Locked, squad-assigned and Conduit-equipped copies cannot be sold or consumed.
    Currency-mode and Roselius sales are permanent; prices depend on fixed form, not level.</p>
    <h3>Conduits</h3><p>One owned copy unlocks a Conduit for every character. Each name can be equipped once per character without consumption.
    Eight ordinary slots are available; Master is reserved. Up to four Omnic Conduits may be equipped, each matching the character's combat element.
    Rare and Legendary drops come from Awaken the Machines; Omnic drops unlock at stage ${machineRules.omnicStage}. Legendary banner bonuses are separate from the main draw.
    Equipment changes save immediately and apply to the next run, not an active run.</p>
    <h3>Captured abilities</h3><p>Captures retain their defeated form and skills. Enemy skill intervals become manual cooldowns.
    Missing ability slots remain unavailable. Stats use ordinary growth without boss bonuses.</p>`);
}

export function characterDetail(starter: Starter, selectedTab: string, account: Account | null = emptyAccount()): string {
  const tab = characterTabs.find((entry) => entry.id === selectedTab);
  if (!tab) throw new Error('Unknown character upgrade area.');
  const progress = account ? ownedProgress(account, starter.id) : undefined;
  const kit = resolveFighter(starter.id, progress, account?.conduitEquipment?.[starter.id], account?.conduitUpgrades);
  let detail: string;
  if (selectedTab === 'overview') {
    detail = `<div class="character-stat-rating"><strong>Character classification</strong>${characterRating(starter.id, progress?.evolution)}</div>${stats(starter, progress, true, account?.conduitEquipment?.[starter.id], account?.conduitUpgrades)}<section class="character-category character-combat"><h3>Abilities &amp; passive</h3><div class="character-ability-grid">
      <article class="hub-ability"><h3 class="ability-heading">${abilityIcon(starter.id, 'passive')}<span>${kit.passive.name} · Passive</span></h3><p>${kit.passive.description}</p></article>
      ${(['skill1', 'skill2', 'ultimate'] as const).map((action) => ability(starter, action, progress, account?.conduitEquipment?.[starter.id], account?.conduitUpgrades)).join('')}</div>
      ${kitConduitRules(account?.conduitEquipment?.[starter.id])}</section>`;
  } else if (selectedTab === 'equipment') {
    detail = equipment(starter, account);
  } else if (selectedTab === 'upgrade-0' || selectedTab === 'upgrade-1') {
    detail = upgradePanel(starter, selectedTab === 'upgrade-0', account);
  } else {
    if (!upgradePaths.some((path) => path.id === selectedTab)) throw new Error('Unknown upgrade definition.');
    const specific = selectedTab === 'upgrade-3' ? `<article class="hub-ability"><h3 class="ability-heading">${abilityIcon(starter.id, 'passive')}<span>${kit.passive.name}</span></h3><p>${kit.passive.description}</p></article>`
      : ability(starter, selectedTab === 'upgrade-4' ? 'skill1' : selectedTab === 'upgrade-5' ? 'skill2' : 'ultimate', progress, account?.conduitEquipment?.[starter.id], account?.conduitUpgrades);
    detail = `<section class="character-category"><h3>Current effect</h3>${specific}${kitConduitRules(account?.conduitEquipment?.[starter.id])}</section>`;
  }
  return `<h2 id="upgrade-heading" tabindex="-1">${tab.label}</h2><div class="character-detail-content">${detail}</div>`;
}

export function updateCharacterTab(host: HTMLElement, starter: Starter, selectedTab: string, account: Account | null = emptyAccount()): void {
  const content = characterDetail(starter, selectedTab, account);
  const panel = host.querySelector<HTMLElement>('.hub-detail');
  if (!panel) throw new Error('Character detail panel is missing.');
  panel.innerHTML = content;
  const image = host.querySelector<HTMLImageElement>('.hub-showcase .hub-portrait img');
  if (image && account) {
    const attributes = portraitAttributes(starter, ownedProgress(account, starter.id).evolution);
    if (image.getAttribute('src') !== attributes.src) {
      image.src = attributes.src;
      image.alt = attributes.alt;
      const facing = characterFacing(starter.id, ownedProgress(account, starter.id).evolution);
      image.dataset.facing = facing.facing;
      image.dataset.mirrored = String(facing.mirrored);
    }
  }
  const progressLabel = host.querySelector('[data-owned-progress]');
  if (progressLabel) progressLabel.textContent = account ? `Lv.${ownedProgress(account, starter.id).level} · Evo.${ownedProgress(account, starter.id).evolution}` : 'Progress unavailable';
  const formLabel = host.querySelector('[data-owned-title]');
  if (formLabel) formLabel.textContent = characterName(starter.id, account ? ownedProgress(account, starter.id).evolution : 1);
  host.querySelectorAll<HTMLElement>(`[data-character-name="${starter.id}"]`).forEach((label) => {
    label.textContent = characterName(starter.id, account ? ownedProgress(account, starter.id).evolution : 1);
  });
  const rosterEntry = host.querySelector<HTMLButtonElement>(`[data-owned-character="${starter.id}"]`);
  if (rosterEntry && account) {
    const progress = ownedProgress(account, starter.id);
    const name = rosterEntry.querySelector('strong');
    const level = rosterEntry.querySelector('small');
    const thumbnail = rosterEntry.querySelector('img');
    if (name) name.textContent = characterName(starter.id, progress.evolution);
    if (level) level.textContent = `Lv.${progress.level} · Evo.${progress.evolution}`;
    if (thumbnail) {
      const attributes = portraitAttributes(starter, progress.evolution);
      const facing = characterFacing(starter.id, progress.evolution);
      if (thumbnail.getAttribute('src') !== attributes.src) thumbnail.src = attributes.src;
      thumbnail.alt = attributes.alt;
      thumbnail.dataset.facing = facing.facing;
      thumbnail.dataset.mirrored = String(facing.mirrored);
    }
  }
  host.querySelectorAll(`[data-character-rating="${starter.id}"]`).forEach((label) => {
    label.outerHTML = characterRating(starter.id, account ? ownedProgress(account, starter.id).evolution : 1);
  });
  host.querySelectorAll<HTMLButtonElement>('[data-character-tab]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.characterTab === selectedTab));
  });
  host.querySelectorAll<HTMLElement>('[data-character-section]').forEach((group) => {
    group.hidden = group.dataset.characterSection !== characterSection(selectedTab);
  });
  host.querySelectorAll<HTMLButtonElement>('[data-character-section-tab]').forEach((button) => {
    button.setAttribute('aria-pressed', String(characterSection(button.dataset.characterSectionTab ?? '') === characterSection(selectedTab)));
  });
  panel.querySelector<HTMLElement>('#upgrade-heading')?.focus({ preventScroll: true });
}

export function characterHub(starter: Starter, selectedTab: string, account: Account | null = emptyAccount()): string {
  const detail = characterDetail(starter, selectedTab, account);
  return `<div class="hub-heading"><p class="eyebrow"><span data-character-name="${starter.id}">${characterName(starter.id, account ? ownedProgress(account, starter.id).evolution : 1)}</span> · PROGRESSION</p><h1 tabindex="-1">Character Upgrades</h1></div>
    <div class="character-hub" id="character-growth" style="--element:${starter.color}">
      <section class="hub-showcase"><div class="hub-portrait">${portrait(starter, account ? ownedProgress(account, starter.id).evolution : 1)}</div>
        <p class="element-pill">${starter.element} · ${starter.weapon}</p><h2><span data-owned-title>${characterName(starter.id, account ? ownedProgress(account, starter.id).evolution : 1)}</span> ${characterRole(starter.id)}</h2>
        ${characterRating(starter.id, account ? ownedProgress(account, starter.id).evolution : 1)}
        <p class="upgrade-progress" data-owned-progress>${account ? `Lv.${ownedProgress(account, starter.id).level} · Evo.${ownedProgress(account, starter.id).evolution}` : 'Progress unavailable'}</p>
        <div class="character-roster-strip">${characterRoster(account, starter.id)}</div></section>
      <section class="character-control-panel" data-menu-scroll="character-details" aria-label="Character details and upgrades">
        <nav class="hub-rail" aria-label="Character upgrade areas">${characterNavigation(starter, selectedTab)}</nav>
        <section class="hub-detail" aria-labelledby="upgrade-heading">${detail}</section>
      </section>
    </div>`;
}
