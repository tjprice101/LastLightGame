import { type Starter } from '../content/starters';
import { fighters, shatterGauge } from '../content/combat';
import { artifactSlots, fractureRules, upgradePaths } from '../content/progression';
import { portrait } from './portrait';
import { elementalReveal } from './reveal';

export const characterTabs = [
  { id: 'overview', label: 'Overview', symbol: '01' },
  ...upgradePaths.map((path, index) => ({ id: `upgrade-${index}`, label: path.name, symbol: `0${index + 2}` })),
  { id: 'inventory', label: 'Inventory / Equipment', symbol: '09' },
] as const;

export function isCharacterTab(value: string): boolean {
  return characterTabs.some((tab) => tab.id === value);
}

function stats(starter: Starter): string {
  const values = fighters[starter.id].stats;
  return `<div class="hub-stats" aria-label="Base combat stats">
    ${[['HP', values.health], ['DEF', values.defense + (starter.id === 'tide' ? 8 : 0)],
      ['DMG', values.damage], ['CRIT', `${Math.round(values.crit * 100)}%`]].map(([label, value]) =>
      `<div><small>${label}</small><strong>${value}</strong></div>`).join('')}</div>`;
}

function tabButtons(current: string, dock = false): string {
  return characterTabs.map((tab) => `<button type="button" class="${dock ? 'hub-dock-button' : 'hub-rail-button'}"
    data-character-tab="${tab.id}" ${dock ? '' : `aria-pressed="${current === tab.id}"`}>
    <span class="hub-symbol" aria-hidden="true">${tab.symbol}</span><span>${tab.label}</span></button>`).join('');
}

export function homeHub(starter: Starter, firstArrival: boolean): string {
  const passive = fighters[starter.id].passive;
  return `<div class="hub-heading"><p class="eyebrow">THE SANCTUARY</p><h1 tabindex="-1">Home</h1></div>
    <div class="home-hub" style="--element:${starter.color}">
      <aside class="hub-rail" aria-label="Home shortcuts">
        <button class="hub-rail-button" data-page="events"><span class="hub-symbol" aria-hidden="true">EV</span><span>Events<small>Future adventures</small></span></button>
        <button class="hub-rail-button" data-character-tab="inventory"><span class="hub-symbol" aria-hidden="true">IN</span><span>Inventory<small>No items yet</small></span></button>
        <button class="hub-rail-button" data-page="story"><span class="hub-symbol" aria-hidden="true">ST</span><span>Opening Story<small>${starter.lore.origin}</small></span></button>
        <button class="hub-rail-button" data-feature="Squad"><span class="hub-symbol" aria-hidden="true">SQ</span><span>Squad<small>Solo start / Coming later</small></span></button>
        <button class="hub-rail-button" data-feature="Summon"><span class="hub-symbol" aria-hidden="true">SU</span><span>Summon<small>Coming later</small></span></button>
        <button id="return-title" class="text-button">Return to title</button>
      </aside>
      <section class="hub-showcase ${firstArrival ? 'first-arrival' : ''}" aria-label="Your saved companion">
        <div class="hub-portrait">${portrait(starter)}${firstArrival ? elementalReveal(starter) : ''}</div>
        <p class="element-pill">${starter.element} / ${starter.weapon}</p>
        <h2>${starter.name}</h2><p>${starter.title}</p>
        ${firstArrival ? `<p class="bond-message">${starter.lore.awakening}</p>` : ''}
      </section>
      <aside class="hub-info">
        <p class="eyebrow">ACTIVE CHARACTER</p><h2>${starter.name}</h2>
        ${stats(starter)}<p><strong>${passive.name}</strong> &mdash; ${passive.description}</p>
        <p class="quiet">Base combat kit. Level and tier are not tracked yet.</p>
        <details class="companion-lore" ${firstArrival ? 'open' : ''}><summary>Companion lore</summary>
          <p>${starter.description}</p><p>${starter.lore.story}</p><blockquote>"${starter.lore.vow}"</blockquote></details>
      </aside>
      <section class="hub-dock" aria-label="Character upgrade shortcuts"><h2>Character</h2>
        <div>${tabButtons('overview', true)}</div></section>
      <div class="hub-launch"><button class="hub-battle-button" data-page="battle">
        <small>SOLO / GRASSY FIELD</small><strong>Adventure &rarr;</strong><span>Start at wave 1 / Earn 5-10 Fractalis per enemy</span></button>
        <p class="quiet">Fractalis saved on this device. Each entry starts a new run.</p></div>
    </div>`;
}

function ability(starter: Starter, action: 'skill1' | 'skill2' | 'ultimate'): string {
  const content = fighters[starter.id].abilities[action];
  return `<article class="hub-ability"><h3>${content.name}</h3><p>${content.description}</p>
    <p class="hub-cost">Costs ${shatterGauge.costs[action]} Shatter Gauge${content.cooldown ? ` / ${content.cooldown}-turn cooldown` : ''}.</p></article>`;
}

function equipment(): string {
  return `<section class="inventory-section"><h2>Inventory</h2><p>No items yet. Item acquisition and equipping are not implemented.</p></section>
    <section class="equipment-panel"><h3>Equipment slots</h3><p>Eight unique artifacts and one special master relic. Empty previews only.</p>
    <div class="master-relic"><strong>Master relic</strong><span>Special slot / Empty</span></div>
    <div class="artifact-grid">${artifactSlots.map((slot) => `<div class="artifact-slot"><strong>Artifact ${slot}</strong><span>Empty</span></div>`).join('')}</div></section>`;
}

function fracturePreview(): string {
  return `<section class="fracture-preview"><h3>Level progression and Fracture</h3><ol>
    <li>Tier ${fractureRules.sourceTier}: level up to ${fractureRules.levelCap}, then Fracture into Tier ${fractureRules.destinationTier}.</li>
    <li>Gain major stat improvements, reset to level ${fractureRules.resetLevel}, and receive +${fractureRules.lycalisReward} Lycalis.</li>
    <li>Tier ${fractureRules.destinationTier}: level from ${fractureRules.resetLevel} to ${fractureRules.levelCap} using different resources.</li>
    </ol><p>Exact stat improvements, materials, and costs are pending. No Lycalis has been awarded.</p></section>`;
}

export function characterDetail(starter: Starter, selectedTab: string): string {
  const tab = characterTabs.find((entry) => entry.id === selectedTab);
  if (!tab) throw new Error('Unknown character upgrade area.');
  const kit = fighters[starter.id];
  let detail: string;
  if (selectedTab === 'overview') {
    detail = `${stats(starter)}<article class="hub-ability"><h3>${kit.passive.name} / Passive</h3><p>${kit.passive.description}</p></article>
      ${(['skill1', 'skill2', 'ultimate'] as const).map((action) => ability(starter, action)).join('')}
      <p class="quiet">These abilities work in Adventure. Upgrade transactions remain unimplemented.</p>`;
  } else if (selectedTab === 'inventory') {
    detail = equipment();
  } else {
    const index = upgradePaths.findIndex((_, position) => selectedTab === `upgrade-${position}`);
    if (index < 0) throw new Error('Unknown upgrade definition.');
    const path = upgradePaths[index];
    const specific = index <= 1 ? fracturePreview() : index === 2
      ? `<article class="hub-ability"><h3>${starter.weapon}</h3><p>Base character damage: ${kit.stats.damage}. Weapon stats and upgrades are not tracked yet.</p></article>`
      : index === 3 ? `<article class="hub-ability"><h3>${kit.passive.name}</h3><p>${kit.passive.description}</p></article>`
      : ability(starter, index === 4 ? 'skill1' : index === 5 ? 'skill2' : 'ultimate');
    detail = `<p>${path.detail.replaceAll('<', '&lt;').replaceAll('>', '&gt;')}</p>${specific}
      <div class="hub-comparison"><div><small>IMPLEMENTED</small><strong>Base combat kit</strong></div>
      <div><small>NEXT UPGRADE</small><strong>Not defined yet</strong></div></div>
      <p class="hub-cost">Materials coming later / Costs unset</p>
      <button class="primary-button" disabled>Upgrade unavailable</button>
      <p class="quiet">Preview only. No level, tier, materials, or currency have been changed.</p>`;
  }
  return `<p class="eyebrow">${selectedTab === 'overview' ? 'COMBAT KIT' : 'PREVIEW'}</p>
    <h2 id="upgrade-heading" tabindex="-1">${tab.label}</h2>${detail}`;
}

export function updateCharacterTab(host: HTMLElement, starter: Starter, selectedTab: string): void {
  const content = characterDetail(starter, selectedTab);
  const panel = host.querySelector<HTMLElement>('.hub-detail');
  if (!panel) throw new Error('Character detail panel is missing.');
  panel.innerHTML = content;
  host.querySelectorAll<HTMLButtonElement>('[data-character-tab]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.characterTab === selectedTab));
  });
  panel.querySelector<HTMLElement>('#upgrade-heading')?.focus({ preventScroll: true });
}

export function characterHub(starter: Starter, selectedTab: string): string {
  const detail = characterDetail(starter, selectedTab);
  return `<div class="hub-heading"><p class="eyebrow">${starter.name} / PROGRESSION</p><h1 tabindex="-1">Character Upgrades</h1></div>
    <div class="character-hub" style="--element:${starter.color}">
      <nav class="hub-rail" aria-label="Character upgrade areas">${tabButtons(selectedTab)}</nav>
      <section class="hub-showcase"><div class="hub-portrait">${portrait(starter)}</div>
        <p class="element-pill">${starter.element} / ${starter.weapon}</p><h2>${starter.name}</h2>
        <p class="quiet">Your only owned companion</p><p class="quiet">Current level and tier are not tracked in the save.</p></section>
      <section class="hub-detail" aria-labelledby="upgrade-heading">${detail}</section>
    </div>`;
}
