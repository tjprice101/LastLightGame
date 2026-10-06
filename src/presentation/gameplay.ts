import { elements, elementalDungeonRules, elementalEnemyLevel, infusionModes, currencyModes } from '../content/activities';
import { assetUrl } from './portrait';
import { uiIcon } from './ui-icon';
import { dungeonArt, elementAccents } from '../content/dungeon-art';
import { isPlayableDungeon } from '../content/dungeons';
import { emptyAccount, unlockedStage, unlockedInfusionStage, type Account } from '../game/account';
import { infusionEnemyElements, treasurySalePrices, sanctuarySalePrices } from '../content/infusions';
import { elementLabel } from './element-label';

function dungeonEntry(element: (typeof elements)[number]['id'], account: Account | null): string {
  if (!account) return '<button disabled>Dungeon unavailable: resolve the save error</button>';
  if (!isPlayableDungeon(element)) throw new Error('Unknown elemental dungeon.');
  const unlocked = unlockedStage(account, element);
  return `<label class="dungeon-stage-label">Stage
    <select data-dungeon-stage="${element}" aria-label="${elements.find((entry) => entry.id === element)?.dungeon} stage">${Array.from({ length: unlocked }, (_, stage) => `<option value="${stage + 1}" ${stage + 1 === unlocked ? 'selected' : ''}>${stage + 1}</option>`).join('')}</select></label>
    <button class="primary-button" data-dungeon="${element}">Enter dungeon</button>`;
}

export function gameplayHub(account: Account | null = emptyAccount()): string {
  return `<div class="gameplay-hub"><div class="hub-heading"><p class="eyebrow">CHOOSE YOUR ACTIVITY</p><h1 tabindex="-1">Gameplay</h1></div>
    <nav class="activity-categories" aria-label="Activity types">
      <a href="#gameplay-adventure">${uiIcon('gameplay')}Adventure</a><a href="#gameplay-dungeons">${uiIcon('inventory')}Elemental dungeons</a>
      <a href="#gameplay-infusion">${uiIcon('evolution')}Evolution infusion</a><a href="#gameplay-story">${uiIcon('story')}Story</a><a href="#gameplay-events">${uiIcon('events')}Events</a>
      <a href="#gameplay-currency">${uiIcon('inventory')}Currency farms</a>
    </nav>
    <section class="activity-group" id="gameplay-adventure"><h2>Adventure</h2>
      <article class="activity-card" style="--adventure-art:url('${assetUrl('backgrounds/grassy-field.png')}')"><h3>Adventure / Grassy Field</h3>
        <p>Endless waves with your saved squad of up to three Element-Bearers or captured creatures. Each entry begins at wave 1.</p>
        <p>Fractalis drops grow from 5-10 at enemy level 1 to 15-30 at level 120. Enemy health, attack and defense grow each wave.</p>
        <button class="primary-button" data-page="battle">Start Adventure</button></article></section>
    <section class="activity-group" id="gameplay-dungeons"><h2>Elemental material dungeons</h2>
      <p>Each dungeon has ${elementalDungeonRules.stages} stages. Enemies start at level 10, grow linearly to
        level ${elementalEnemyLevel(elementalDungeonRules.maximumLevelStage)} at the final Stage ${elementalDungeonRules.maximumLevelStage}.</p>
      <p>Elemental materials enhance characters and items of the matching element. Higher levels grant larger stacks and better rare-drop chances; final floors have the richest loot.</p>
      <div class="activity-grid">${elements.map((element, index) => `<article class="activity-card dungeon-card ${dungeonArt[element.id] ? 'has-dungeon-art' : ''}" data-element-index="${index}" style="--dungeon:${elementAccents[element.id]}">
        ${dungeonArt[element.id] ? `<img class="dungeon-banner" src="${assetUrl(`banners/${dungeonArt[element.id]?.slug}.png`)}" alt="${element.dungeon} banner" width="1904" height="640" loading="lazy">` : '<div class="dungeon-banner banner-pending" aria-hidden="true">BANNER ART COMING LATER</div>'}
        <p class="eyebrow">${element.name} / ${element.affinity}</p><h3>${element.dungeon}</h3>
        <p>${elementalDungeonRules.stages} stages / Enemy levels ${elementalDungeonRules.startingLevel}-${elementalDungeonRules.maximumLevel}</p>
        <p>Drops ${element.name} materials used for enhancing characters and other items of the ${element.name} element.</p>
        ${dungeonEntry(element.id, account)}</article>`).join('')}</div></section>
    <section class="activity-group" id="gameplay-infusion"><h2>Evolution infusion</h2>
      <p>High-level slime encounters grant weapon, evolution and late-form leveling materials. Bonus Epic-or-higher materials are restricted to each mode's listed elements.</p>
      <p>Each defeated enemy has an independent 20% chance to become an owned captured creature at its defeated level. Duplicate copies are kept separately; captured forms cannot evolve.</p>
      <p>Each kill also rolls for 1-3 Lycalis, independently of materials and captures. At Lv.80: 90% none / 8% one / 1.5% two / 0.5% three. At Lv.120: 75% none / 10% one / 10% two / 5% three, scaling linearly. Ordinary enemies and bosses use the same odds.</p>
      <div class="activity-grid">${infusionModes.map((mode) => `<article class="activity-card">
        <img class="dungeon-banner" src="${assetUrl(`banners/${mode.id}-banner.png`)}" alt="${mode.name} banner" width="1800" height="600">
        <p class="eyebrow">${mode.energy} ENERGY</p><h3>${mode.name}</h3>
        <p>${mode.stages} stages / Starts at enemy level ${mode.startingLevel} / ${mode.enemyTiers} enemy tiers</p>
        <p>${mode.enemyTheme}; six increasingly powerful forms of the same named slime.</p>
        <p>Enemy element: ${elementLabel(infusionEnemyElements[mode.id])}</p>
        <p>Material pool: ${elements.filter((element) => element.infusion === mode.id).map((element) => element.name).join(', ')}.</p>
        <p>Enemy levels 80-120. Weapon materials from level 80, evolution from 93, Evo5/6 leveling from 100. Bonus Epic/Legendary/Omnic from levels 80/100/115. Quantities and rare chances increase toward the final floor.</p>
        ${account ? `<label class="dungeon-stage-label">Stage<select data-infusion-stage="${mode.id}" aria-label="${mode.name} stage">${Array.from({ length: unlockedInfusionStage(account, mode.id) }, (_, index) => `<option value="${index + 1}" ${index + 1 === unlockedInfusionStage(account, mode.id) ? 'selected' : ''}>${index + 1}</option>`).join('')}</select></label>
        <button class="primary-button" data-infusion="${mode.id}">Enter ${mode.name}</button>` : '<button disabled>Resolve the save error before entering</button>'}</article>`).join('')}</div></section>
    <section class="activity-group" id="gameplay-currency"><h2>Currency farms</h2>
      ${currencyModes.map((mode) => `<article class="activity-card">
        <img class="dungeon-banner" src="${assetUrl(`banners/${mode.id}-banner.png`)}" alt="${mode.name} banner" width="1904" height="640" loading="lazy">
        <p class="eyebrow">${mode.id === 'treasury' ? 'LUMINOUS / FRACTALIS' : 'TRANQUILITIC / LYCALIS'}</p><h3>${mode.name}</h3>
        <p>${mode.stages} stages / Enemy levels65-120 / ${mode.id === 'treasury' ? 'Six gemstone-crowned slime forms' : 'Six divine rosefire-wisp forms'} / Every fifth stage is a boss.</p>
        <table class="summon-drop-table"><caption>Mission loot / Per defeated enemy</caption><thead><tr><th scope="col">Reward</th><th scope="col">Quantity</th><th scope="col">Chance</th></tr></thead>
          <tbody><tr><th scope="row">Fractalis</th><td>${mode.id === 'treasury' ? '100-200 at65;1,000-2,000 at120' : 'Ordinary level-scaled range: 7-14 at65;15-30 at120'}</td><td>100%</td></tr>
          ${mode.id === 'sanctuary' ? '<tr><th scope="row">Lycalis</th><td>1 at65;5 at120</td><td>50% at65;80% at120</td></tr>' : ''}
          <tr><th scope="row">Defeated creature copy</th><td>1 / Defeated level and form</td><td>20%</td></tr></tbody></table>
        <p class="quiet">${mode.id === 'treasury' ? 'Fractalis range grows quadratically with level; no Lycalis drops.' : 'Lycalis chance grows linearly with level; quantity rounds the linear1-5 curve to the nearest integer. Independent of Fractalis and captures.'} Ordinary enemies and bosses use the same payouts. No materials or clear bonus.</p>
        <details><summary>${mode.id === 'treasury' ? 'Treasury slime' : 'Sanctuary wisp'} sale values</summary><p>Common through Omnic: ${mode.id === 'treasury' ? `${treasurySalePrices.map((price) => price.toLocaleString('en-US')).join(' / ')} Fractalis` : sanctuarySalePrices.map((price) => `${price.fractalis.toLocaleString('en-US')} Fractalis + ${price.lycalis} Lycalis`).join(' / ')}. Sell an individual copy in Character. Locked, squad and Conduit-equipped copies are protected.</p></details>
        ${account ? `<label class="dungeon-stage-label">Stage<select data-infusion-stage="${mode.id}" aria-label="${mode.name} stage">${Array.from({ length: unlockedInfusionStage(account, mode.id) }, (_, index) => `<option value="${index + 1}" ${index + 1 === unlockedInfusionStage(account, mode.id) ? 'selected' : ''}>${index + 1}</option>`).join('')}</select></label>
        <button class="primary-button" data-infusion="${mode.id}">Enter ${mode.name}</button>` : '<button disabled>Resolve the save error before entering</button>'}</article>`).join('')}</section>
    <section class="activity-group" id="gameplay-story"><h2>Story</h2><article class="activity-card">
      <h3>Opening prologue</h3><p>Your saved Element-Bearer's lore. Readable story only; no battles or rewards yet.</p>
      <button data-page="story">Read opening story</button></article></section>
    <section class="activity-group" id="gameplay-events"><h2>Events</h2><article class="activity-card">
      <h3>Limited-time activities</h3><p>No active events, timers or rewards.</p>
      <button data-page="events">View Events</button></article></section></div>`;
}

export function bindGameplayNavigation(host: HTMLElement): void {
  const hub = host.querySelector<HTMLElement>('.gameplay-hub');
  if (!hub) return;
  const links = Array.from(hub.querySelectorAll<HTMLAnchorElement>('.activity-categories a'));
  const groups = Array.from(hub.querySelectorAll<HTMLElement>('.activity-group'));
  const select = (id: string): void => {
    if (!groups.some((group) => group.id === id)) throw new Error('Unknown activity category.');
    groups.forEach((group) => { group.hidden = group.id !== id; });
    links.forEach((link) => {
      if (link.hash === `#${id}`) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  };
  const requested = location.hash.slice(1);
  select(groups.some((group) => group.id === requested) ? requested : 'gameplay-adventure');
  links.forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault();
    select(link.hash.slice(1));
    hub.closest('.sanctuary-content')?.scrollTo({ top: 0 });
    history.replaceState(null, '', link.hash);
    hub.querySelector<HTMLElement>('.activity-group:not([hidden]) h2')?.focus({ preventScroll: true });
  }));
  groups.forEach((group) => group.querySelector('h2')?.setAttribute('tabindex', '-1'));
}
