import { getStarter, type Starter } from '../content/starters';
import { resolveFighter, formatStat, shatterGauge } from '../content/combat';
import { artifactSlots, characterGrowth, characterLevelCap, upgradePaths, levelCost, evolutionCost, weaponCost, weaponRules, type CharacterProgress } from '../content/progression';
import { portrait, portraitAttributes, assetUrl } from './portrait';
import { elementalReveal } from './reveal';
import { abilityIcon } from './ability-icon';
import { getElement } from '../content/activities';
import { uiIcon } from './ui-icon';
import { materialArt, materialName } from '../content/dungeon-art';
import { emptyAccount, ownedProgress, equippedSquad, ownedCharacters, type Account } from '../game/account';
import { characterArt } from '../content/character-art';
import { unitFacing, unitFacingAttributes } from './unit-facing';
import { characterRole } from './character-role';
import { currencyIcon } from './currency-icon';

export const characterTabs = [
  { id: 'overview', label: 'Overview', symbol: '01' },
  ...upgradePaths.map((path, index) => ({ id: `upgrade-${index}`, label: path.name, symbol: `0${index + 2}` })),
  { id: 'equipment', label: 'Artifacts / Equipment', symbol: '09' },
] as const;

export function isCharacterTab(value: string): boolean {
  return characterTabs.some((tab) => tab.id === value);
}

function stats(starter: Starter, progress?: CharacterProgress, grouped = false): string {
  const values = resolveFighter(starter.id, progress).stats;
  const groups: { label: string; entries: [string, string | number][] }[] = [
    { label: 'Survival', entries: [['Health', values.health], ['Defense', values.defense]] },
    { label: 'Offense', entries: [['Attack Damage', values.damage], ['Critical Rate', `${formatStat(values.crit * 100)}%`],
      ['Critical Damage Multiplier', `${formatStat(values.critMultiplier)}x`], ['Elemental Damage', values.elementalDamage]] },
    { label: 'Resource', entries: [['Shatter capacity', values.shatterCapacity]] },
  ];
  const render = (entries: readonly [string, string | number][]): string => entries.map(([label, value]) =>
    `<div><small>${label}</small><strong>${typeof value === 'number' ? formatStat(value) : value}</strong></div>`).join('');
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
    if (id === 'upgrade-2') return uiIcon('weapon');
    if (id === 'equipment') return uiIcon('inventory');
    return '';
  };
  return characterTabs.filter((tab) => !ids || ids.includes(tab.id)).map((tab) => `<button type="button" class="${dock ? 'hub-dock-button' : 'hub-rail-button'}"
    data-character-tab="${tab.id}" ${dock ? '' : `aria-pressed="${current === tab.id}"`}>
    <span class="hub-symbol" aria-hidden="true">${iconFor(tab.id) || tab.symbol}</span><span>${tab.label}</span></button>`).join('');
}

function characterNavigation(starter: Starter, current: string): string {
  return [
    { label: 'Character', ids: ['overview', 'equipment'] },
    { label: 'Growth', ids: ['upgrade-0', 'upgrade-1', 'upgrade-2'] },
    { label: 'Combat', ids: ['upgrade-3', 'upgrade-4', 'upgrade-5', 'upgrade-6'] },
  ].map((group) => `<section class="character-nav-group" aria-label="${group.label}">
    <h3>${group.label}</h3><div>${tabButtons(starter, current, false, group.ids)}</div></section>`).join('');
}

export function homeHub(starter: Starter, firstArrival: boolean, account: Account | null = emptyAccount()): string {
  const progress = account ? ownedProgress(account, starter.id) : undefined;
  const squad = account && ownedCharacters(account).length ? equippedSquad(account) : [starter.id];
  return `<div class="hub-heading"><p class="eyebrow">THE SANCTUARY</p><h1 tabindex="-1">Home</h1></div>
    <div class="home-hub" style="--element:${starter.color}">
      <aside class="hub-rail" aria-label="Home shortcuts">
        <button class="hub-rail-button" data-page="gameplay"><span class="hub-symbol" aria-hidden="true">${uiIcon('gameplay')}</span><span>Gameplay<small>Browse activity types</small></span></button>
        <button class="hub-rail-button" data-page="events"><span class="hub-symbol" aria-hidden="true">${uiIcon('events')}</span><span>Events<small>Future adventures</small></span></button>
        <button class="hub-rail-button" data-page="inventory"><span class="hub-symbol" aria-hidden="true">${uiIcon('inventory')}</span><span>Inventory<small>Owned materials</small></span></button>
        <button class="hub-rail-button" data-page="glossary"><span class="hub-symbol" aria-hidden="true">${uiIcon('story')}</span><span>Creature Glossary<small>Discover enemies and loot</small></span></button>
        <button class="hub-rail-button" data-page="story"><span class="hub-symbol" aria-hidden="true">${uiIcon('story')}</span><span>Opening Story<small>${starter.lore.origin}</small></span></button>
        <button class="hub-rail-button" data-page="squad"><span class="hub-symbol" aria-hidden="true">${uiIcon('squad')}</span><span>Squad<small>Equip up to three companions</small></span></button>
        <button class="hub-rail-button" data-page="summon"><span class="hub-symbol" aria-hidden="true">${uiIcon('summon')}</span><span>Summon<small>10 Lycalis / No duplicates</small></span></button>
        <button id="return-title" class="text-button">Return to title</button>
      </aside>
      <section class="hub-showcase ${firstArrival ? 'first-arrival' : ''}" aria-label="Your saved companion">
        <div class="hub-portrait">${portrait(starter, progress?.evolution)}${firstArrival ? elementalReveal(starter) : ''}</div>
        <p class="element-pill">${starter.element} / ${starter.weapon}</p>
        <h2>${starter.name} ${characterRole(starter.id)}</h2><p>${starter.title}</p>
        ${firstArrival ? `<p class="bond-message">${starter.lore.awakening}</p>` : ''}
      </section>
      <aside class="hub-info">
        <div class="team-heading"><p class="eyebrow">CURRENT TEAM / ${squad.length} OF 3</p><button class="text-button" data-page="squad">Squad &rarr;</button></div>
        ${squad.map((id, index) => {
          const companion = getStarter(id);
          const entry = account ? ownedProgress(account, id) : undefined;
          return `<button class="team-companion" data-page="squad">${portrait(companion, entry?.evolution)}<span><strong>${companion.name}</strong>${characterRole(id)}<small>${index === 0 ? 'Leader / ' : ''}${entry ? `Lv.${entry.level} / Evo.${entry.evolution}` : 'Progress unavailable'}</small></span></button>`;
        }).join('')}
        <p class="eyebrow">ACTIVE CHARACTER</p><h2>${starter.name} ${characterRole(starter.id)}</h2>
        ${stats(starter, progress)}
        <details class="companion-lore" ${firstArrival ? 'open' : ''}><summary>Companion lore</summary>
          <p>${starter.description}</p><p>${starter.lore.story}</p><blockquote>"${starter.lore.vow}"</blockquote></details>
      </aside>
      <div class="hub-launch"><button class="hub-battle-button" data-page="battle">
        <small>${squad.length === 1 ? 'SOLO' : 'SQUAD'} / GRASSY FIELD</small><strong>Adventure &rarr;</strong><span>Start at wave 1 / Fractalis drops grow with enemy level</span></button>
        <p class="quiet">Fractalis saved on this device. Each entry starts a new run.</p></div>
    </div>`;
}

function ability(starter: Starter, action: 'skill1' | 'skill2' | 'ultimate', progress?: CharacterProgress): string {
  const content = resolveFighter(starter.id, progress).abilities[action];
  return `<article class="hub-ability"><h3 class="ability-heading">${abilityIcon(starter.id, action)}<span>${content.name}</span></h3><p>${content.description}</p>
    <p class="hub-cost">Costs ${shatterGauge.costs[action]} Shatter Gauge${content.cooldown ? ` / ${content.cooldown}-turn cooldown` : ''}.</p></article>`;
}

function equipment(starter: Starter): string {
  return `<section class="equipment-panel" aria-label="${starter.name} equipment" data-character-equipment="${starter.id}">
    <h3>${starter.name}'s artifacts</h3><p>Equip artifacts to buff ${starter.name}'s stats. One Master Artifact and eight artifact slots belong to this character.</p>
    <div class="character-equipment-grid"><section class="character-category"><h3>Master slot</h3><div class="master-relic"><strong>Master Artifact</strong><span>Special slot / Empty</span></div></section>
    <section class="character-category"><h3>Artifact slots</h3><div class="artifact-grid">${artifactSlots.map((slot) => `<div class="artifact-slot"><strong>Artifact ${slot}</strong><span>Empty</span></div>`).join('')}</div></section></div>
    <p class="quiet">No artifacts equipped. No artifact stat bonuses applied. Artifact acquisition and equipping are not implemented yet.</p></section>`;
}

function materialIcon(id: string): string {
  const art = materialArt(id);
  return art ? `<img src="${assetUrl(`materials/${art}.png`)}" alt="" width="48" height="48">` : '';
}

export function inventoryHub(account: Account | null = emptyAccount()): string {
  return `<div class="inventory-hub"><section class="inventory-section"><h2>Currencies</h2>
    ${account ? `<ul class="upgrade-resources">${(['fractalis', 'lycalis'] as const).map((id) =>
      `<li>${currencyIcon(id)}<strong>${id === 'fractalis' ? 'Fractalis' : 'Lycalis'}</strong><span>${account[id]}</span></li>`).join('')}</ul>`
      : '<p>Currency inventory unavailable. Check the save error.</p>'}</section><section class="inventory-section"><h2>Materials</h2>
    ${account ? Object.entries(account.materials).filter(([, amount]) => amount > 0).length
      ? `<ul class="upgrade-resources">${Object.entries(account.materials).filter(([, amount]) => amount > 0).map(([id, amount]) => `<li>${materialIcon(id)}<strong>${materialName(id)}</strong><span>${amount}</span></li>`).join('')}</ul>`
      : '<p>No materials yet. Earn materials in elemental dungeons and Heaven/Abyss modes.</p>' : '<p>Material inventory unavailable. Check the save error.</p>'}</section></div>`;
}

function upgradePanel(starter: Starter, evolve: boolean, account: Account | null): string {
  if (!account) return '<p>Progression unavailable. Resolve the save error before upgrading.</p><button class="primary-button" disabled>Upgrade unavailable</button>';
  const current = ownedProgress(account, starter.id);
  const cap = characterLevelCap(current.evolution);
  const finished = evolve ? current.evolution === characterGrowth.forms : current.level === cap;
  if (finished) return `<p class="upgrade-progress">Lv.${current.level} / ${cap} &middot; Evo.${current.evolution} / ${characterGrowth.forms}</p>
    <p>${evolve ? 'Final evolution reached.' : current.evolution === characterGrowth.forms ? 'Maximum level reached.' : 'Level cap reached. Evolve to continue leveling.'}</p><p id="upgrade-result" role="status"></p>`;
  const element = getElement(starter.elementId);
  const cost = evolve ? evolutionCost(element.id, current) : levelCost(element.id, current);
  const next = evolve ? { ...current, evolution: current.evolution + 1 } : { ...current, level: current.level + 1 };
  const nextPortrait = evolve ? portraitAttributes(starter, next.evolution) : null;
  const before = resolveFighter(starter.id, current).stats;
  const after = resolveFighter(starter.id, next).stats;
  const resources = [{ name: 'Fractalis', owned: account.fractalis, needed: cost.fractalis, icon: currencyIcon('fractalis') },
    ...Object.entries(cost.materials).map(([id, needed]) => {
      return { name: materialName(id), owned: account.materials[id] ?? 0, needed,
        icon: materialIcon(id) };
    })];
  const reason = evolve && current.level !== cap ? `Reach Lv.${cap} to evolve.` : resources.some((resource) => resource.owned < resource.needed) ? 'Gather the missing resources.' : '';
  return `<p class="upgrade-progress">Lv.${current.level} / ${cap} &middot; Evo.${current.evolution} / ${characterGrowth.forms}</p>
    <div class="character-upgrade-grid"><section class="character-category upgrade-benefits"><h3>${evolve ? 'Evolution preview' : 'Level preview'}</h3>
    <div class="hub-comparison"><div><small>CURRENT</small><strong>${evolve ? `Evo.${current.evolution}` : `Lv.${current.level}`}</strong></div>
    <div><small>NEXT</small>${nextPortrait ? `<div class="evolution-silhouette"><span class="character-idle" data-character="${starter.id}"><img src="${nextPortrait.src}" alt="${starter.name} next evolution silhouette" ${unitFacingAttributes(characterArt(starter.id, next.evolution).art, 'ally')} width="150" height="150"></span></div>` : ''}<strong>${evolve ? `Evo.${next.evolution} / Cap ${characterLevelCap(next.evolution)}` : `Lv.${next.level}`}</strong></div></div>
    <p>${evolve ? 'Preserve your level. Core growth multiplies by 1.45.' : 'Accelerating cubic core-stat growth.'} Percentage stats and skill potency grow separately within safe limits.</p>
    <div class="upgrade-stat-preview">${(['health', 'defense', 'damage', 'crit', 'critMultiplier', 'shatterCapacity', 'elementalDamage'] as const).map((key) =>
      `<span><small>${({ health: 'Health', defense: 'Defense', damage: 'Attack', crit: 'Critical Rate', critMultiplier: 'Critical Damage', shatterCapacity: 'Shatter Capacity', elementalDamage: 'Elemental Damage' })[key]}</small><strong>${formatStat(key === 'crit' ? before[key] * 100 : before[key])}${key === 'crit' ? '%' : key === 'critMultiplier' ? 'x' : ''} &rarr; ${formatStat(key === 'crit' ? after[key] * 100 : after[key])}${key === 'crit' ? '%' : key === 'critMultiplier' ? 'x' : ''}</strong></span>`).join('')}</div>
    </section><section class="character-category upgrade-payment"><h3>Required resources</h3><p class="resource-key">Owned / Required</p>
    <ul class="upgrade-resources">${resources.map((resource) => `<li class="${resource.owned < resource.needed ? 'resource-missing' : ''}">${resource.icon}<strong>${resource.name}</strong><span>${resource.owned} / ${resource.needed}</span></li>`).join('')}</ul>
    ${evolve && !account.firstFracture ? `<p class="currency-reward">${currencyIcon('lycalis')}<span>First Fracture reward: +10 Lycalis.</span></p>` : ''}
    <button class="primary-button" data-upgrade="${evolve ? 'evolve' : 'level'}" ${reason ? 'disabled' : ''}>${evolve ? 'Evolve' : 'Level up'}</button>
    <p class="quiet">${reason || 'Resources are consumed when you confirm.'} Elemental materials: ${element.dungeon}. Specialty materials: ${element.infusion === 'heavens' ? 'Soar to Heaven' : 'Delve into the Abyss'}.</p>
    <p id="upgrade-result" role="status"></p></section></div>
    <details class="upgrade-rules"><summary>Progression rules</summary><p>Six forms. Level caps: ${Array.from({ length: characterGrowth.forms }, (_, index) => characterLevelCap(index + 1)).join(' / ')}.
      Core growth: (1 + 0.03 &times; level)&sup3; &times; 1.45^(evolution - 1). Defense uses core growth^0.7; percentage potency grows separately. Shatter gains, skill costs, cooldowns and durations stay fixed.
      Creature infusion costs are deferred for this first pass.</p></details>`;
}

export function characterDetail(starter: Starter, selectedTab: string, account: Account | null = emptyAccount()): string {
  const tab = characterTabs.find((entry) => entry.id === selectedTab);
  if (!tab) throw new Error('Unknown character upgrade area.');
  const progress = account ? ownedProgress(account, starter.id) : undefined;
  const kit = resolveFighter(starter.id, progress);
  let detail: string;
  if (selectedTab === 'overview') {
    detail = `${stats(starter, progress, true)}<section class="character-category character-combat"><h3>Abilities &amp; passive</h3><div class="character-ability-grid">
      <article class="hub-ability"><h3 class="ability-heading">${abilityIcon(starter.id, 'passive')}<span>${kit.passive.name} / Passive</span></h3><p>${kit.passive.description}</p></article>
      ${(['skill1', 'skill2', 'ultimate'] as const).map((action) => ability(starter, action, progress)).join('')}</div></section>`;
  } else if (selectedTab === 'equipment') {
    detail = equipment(starter);
  } else if (selectedTab === 'upgrade-0' || selectedTab === 'upgrade-1') {
    detail = upgradePanel(starter, selectedTab === 'upgrade-0', account);
  } else if (selectedTab === 'upgrade-2') {
    if (!account) detail = '<p>Progression unavailable. Resolve the save error before upgrading.</p>';
    else {
      const current = ownedProgress(account, starter.id);
      const rank = current.weaponRank ?? 0;
      const cost = rank < weaponRules.maximumRank ? weaponCost(starter.elementId, current) : null;
      const missing = cost && (account.fractalis < cost.fractalis || Object.entries(cost.materials).some(([id, amount]) => (account.materials[id] ?? 0) < amount));
      detail = `<div class="character-upgrade-grid"><section class="character-category"><h3>Current effect</h3><p>${starter.weapon} / Rank ${rank}/${weaponRules.maximumRank}</p>
        <p>Attack ${formatStat(kit.stats.damage)}. Each rank adds 2% of grown character Attack.</p>${cost ? `<p>Next Attack: ${formatStat(resolveFighter(starter.id, { ...current, weaponRank: rank + 1 }).stats.damage)}</p>` : '<p>Maximum weapon rank reached.</p>'}</section>
        <section class="character-category"><h3>Required resources</h3><p>Owned / Required</p>${cost ? `<ul class="upgrade-resources"><li>${currencyIcon('fractalis')}<strong>Fractalis</strong><span>${account.fractalis} / ${cost.fractalis}</span></li>
          ${Object.entries(cost.materials).map(([id, amount]) => `<li>${materialIcon(id)}<strong>${materialName(id)}</strong><span>${account.materials[id] ?? 0} / ${amount}</span></li>`).join('')}</ul>
          <button class="primary-button" data-upgrade="weapon" ${missing ? 'disabled' : ''}>Upgrade weapon</button><p>${missing ? 'Gather the missing resources.' : 'Resources are consumed when you confirm.'}</p>` : ''}
          <p id="upgrade-result" role="status"></p></section></div>`;
    }
  } else {
    const index = upgradePaths.findIndex((_, position) => selectedTab === `upgrade-${position}`);
    if (index < 0) throw new Error('Unknown upgrade definition.');
    const specific = index === 3 ? `<article class="hub-ability"><h3 class="ability-heading">${abilityIcon(starter.id, 'passive')}<span>${kit.passive.name}</span></h3><p>${kit.passive.description}</p></article>`
      : ability(starter, index === 4 ? 'skill1' : index === 5 ? 'skill2' : 'ultimate', progress);
    detail = `<div class="character-upgrade-grid"><section class="character-category"><h3>Current effect</h3>${specific}</section>
      <section class="character-category"><h3>Upgrade availability</h3>
      <p>Independent ability upgrades are not available yet. Leveling and evolution already improve this character's combat kit.</p>
      <button class="primary-button" disabled>Upgrade unavailable</button>
      <p class="quiet">No additional costs or bonuses are applied.</p></section></div>`;
  }
  const category = selectedTab === 'equipment' ? 'CHARACTER EQUIPMENT'
    : selectedTab === 'overview' || ['upgrade-3', 'upgrade-4', 'upgrade-5', 'upgrade-6'].includes(selectedTab) ? 'COMBAT KIT' : 'PROGRESSION';
  return `<p class="eyebrow">${category}</p>
    <h2 id="upgrade-heading" tabindex="-1">${tab.label}</h2><div class="character-detail-content">${detail}</div>`;
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
      const facing = unitFacing(characterArt(starter.id, ownedProgress(account, starter.id).evolution).art, 'ally');
      image.dataset.facing = facing.facing;
      image.dataset.mirrored = String(facing.mirrored);
    }
  }
  const progressLabel = host.querySelector('[data-owned-progress]');
  if (progressLabel) progressLabel.textContent = account ? `Lv.${ownedProgress(account, starter.id).level} / Evo.${ownedProgress(account, starter.id).evolution}` : 'Progress unavailable';
  const formLabel = host.querySelector('[data-owned-title]');
  if (formLabel) formLabel.textContent = characterArt(starter.id, account ? ownedProgress(account, starter.id).evolution : 1).title;
  host.querySelectorAll<HTMLButtonElement>('[data-character-tab]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.characterTab === selectedTab));
  });
  panel.querySelector<HTMLElement>('#upgrade-heading')?.focus({ preventScroll: true });
}

export function characterHub(starter: Starter, selectedTab: string, account: Account | null = emptyAccount()): string {
  const detail = characterDetail(starter, selectedTab, account);
  return `<div class="hub-heading"><p class="eyebrow">${starter.name} / PROGRESSION</p><h1 tabindex="-1">Character Upgrades</h1></div>
    <div class="character-hub" style="--element:${starter.color}">
      <nav class="hub-rail" aria-label="Character upgrade areas">${characterNavigation(starter, selectedTab)}</nav>
      <section class="hub-showcase"><div class="hub-portrait">${portrait(starter, account ? ownedProgress(account, starter.id).evolution : 1)}</div>
        <p class="character-form-title" data-owned-title>${characterArt(starter.id, account ? ownedProgress(account, starter.id).evolution : 1).title}</p>
        <p class="element-pill">${starter.element} / ${starter.weapon}</p><h2>${starter.name} ${characterRole(starter.id)}</h2>
        <p class="upgrade-progress" data-owned-progress>${account ? `Lv.${ownedProgress(account, starter.id).level} / Evo.${ownedProgress(account, starter.id).evolution}` : 'Progress unavailable'}</p></section>
      <section class="hub-detail" aria-labelledby="upgrade-heading">${detail}</section>
    </div>`;
}
