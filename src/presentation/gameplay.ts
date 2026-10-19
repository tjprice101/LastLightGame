import { elements, elementalDungeonRules, elementalEnemyLevel, infusionModes, currencyModes, materialRarities, infusionModeStageCount } from '../content/activities';
/** Enemy level at the first Heaven/Abyss stage showing the given form tier. */
function infusionFormLevel(tier: number): number {
  for (let stage = 1; stage <= infusionModeStageCount; stage++) { const encounter = infusionEncounter('heavens', stage); if (encounter.tier === tier) return encounter.level; }
  throw new Error('Missing Heaven form tier.');
}
import { assetUrl } from './portrait';
import { dungeonArt, elementAccents } from '../content/dungeon-art';
import { dungeonEncounter, isPlayableDungeon } from '../content/dungeons';
import { emptyAccount, unlockedStage, unlockedWarStage, ownedCharacters, type Account } from '../game/account';
import { treasuryPrismaticaText } from '../content/loot-random';
import { infusionEnemyElements, treasurySalePrices, sanctuarySalePrices, specialtyMaterials, infusionEncounter } from '../content/infusions';
import { elementLabel } from './element-label';
import { information, informationTopics } from './information';
import { itemShowcase } from './item-showcase';
import { roseEvent, roseEventRules } from './rose-event';
import { machineRules, machineRulesText } from '../content/machines';
import { activityBanner } from './activity-banner';
import { activityLayout } from './activity-layout';
import { infusionEntry } from './activity-entry';
import { elementalWars, warEncounter, warRulesText } from '../content/elemental-war';
import { getStarter } from '../content/starters';
import { storyRules, storyRulesText } from '../content/story';
const storyBossStages = Array.from({ length: storyRules.stages / storyRules.regionStages }, (_, index) => (index + 1) * storyRules.regionStages);
import { finalBossLootText } from '../content/final-boss-loot';
import { storyCampaign } from './story';
import { activityAccess } from '../game/activity-access';
import { devourerHabitats, elementEmotions, machineOrigin, storyPurpose, trainingLore, warLore } from '../content/world-lore';
import { worldLore } from './world-lore';
import { activityDifficulty } from './calamity';
import { enemyStrength } from './enemy-strength';
import { enemyCombatStats } from '../content/stat-growth';

function dungeonEntry(element: (typeof elements)[number]['id'], account: Account | null): string {
  if (!isPlayableDungeon(element)) throw new Error('Unknown elemental dungeon.');
  if (!account) return '<button disabled>Dungeon unavailable: resolve the save error</button>';
  const unlocked = unlockedStage(account, element);
  const access = activityAccess(account, { kind: 'dungeon', element, stage: unlocked });
  return `${enemyStrength(dungeonEncounter(element, unlocked))}<footer class="activity-entry"><label class="dungeon-stage-label">Stage
    <select data-dungeon-stage="${element}" aria-label="${elements.find((entry) => entry.id === element)?.dungeon} stage">${Array.from({ length: unlocked }, (_, stage) => `<option value="${stage + 1}" ${stage + 1 === unlocked ? 'selected' : ''}>${stage + 1}</option>`).join('')}</select></label>
    <button class="primary-button" data-dungeon="${element}" ${access.unlocked ? '' : 'disabled'}>${access.unlocked ? 'Enter dungeon' : 'Locked'}</button>
    ${access.unlocked ? '' : `<p class="activity-unlock-hint">Unlocks at ${access.requirement}. Your highest: Lv.${access.level}.</p>`}</footer>`;
}

const activityCategories = [
  ['story', 'Story', `Six regions · ${storyRules.stages} stages · Lv.1-55`, 'story'],
  ['adventure', 'Training', 'Endless waves · Prismatica', 'gameplay'],
  ['dungeons', 'Elemental dungeons', 'Unlock Lv.30 · Upgrade materials', 'inventory'],
  ['infusion', 'Evolution infusion', 'Unlock Lv.50 · Heaven & Abyss', 'evolution'],
  ['currency', 'Currency farms', 'Unlock Lv.60 · Currencies', 'inventory'],
  ['machines', 'Awaken the Machines', 'Unlock Lv.10 + first region · Conduits', 'inventory'],
  ['war', 'Elemental War', 'Unlock Lv.85 · Rival challengers', 'gameplay'],
  ['events', 'Events', 'Unlock Lv.75 · Crimson Roses', 'events'],
] as const;

const activitySections = [
  ['Story', ['story']],
  ['Practice', ['adventure']],
  ['Progression', ['dungeons', 'infusion', 'machines', 'war']],
  ['Earn currency', ['currency']],
  ['Events', ['events']],
] as const;

const selectedActivities = new Map<string, number>();

function activityPicker(entries: readonly { name: string }[]): string {
  return `<nav class="activity-picker" aria-label="Choose activity">${entries.map((entry, index) =>
    `<button type="button" data-activity-choice="${index}" aria-pressed="${index === 0}"><span>${entry.name}</span></button>`).join('')}</nav>`;
}

function activityFacts(stages: string, levels: string, drops: string): string {
  return `<dl class="activity-facts"><div><dt>Stages</dt><dd>${stages}</dd></div><div><dt>Enemy levels</dt><dd>${levels}</dd></div><div><dt>Drops</dt><dd>${drops}</dd></div></dl>`;
}

function gameplayInformation(): string {
  return informationTopics('gameplay-information', [
    { id: 'final-loot', title: 'Final-boss loot', summary: '5x quantities on every final clear', content: `<p>${finalBossLootText}</p><p>Applies at Story's six regional bosses (stages ${storyBossStages.slice(0, -1).join(', ')} and ${storyBossStages[storyBossStages.length - 1]}) and at the last stage of every other staged activity.</p>` },
    { id: 'origins', title: 'Let and Rise', summary: 'Infinity, Nothingness and the search for the creators', content: worldLore() },
    { id: 'start', title: 'Unlocks', summary: 'Activity level requirements', content: `<p>Story is open from the start. Other activities unlock by your highest-level Element-Bearer, in the squad or not. Captures don't count.</p>
      <ul><li>Awaken the Machines: Lv.10 and Emberwake March cleared</li><li>Elemental dungeons: Lv.30</li><li>Evolution infusion: Lv.50</li><li>Currency farms: Lv.60</li><li>Crimson Roses: Lv.75</li><li>Elemental War: Lv.85</li></ul>` },
    { id: 'enemy-strength', title: 'Enemy strength', summary: 'Levels, boss stats and special attacks', content: '<p>Enemy level sets base stats in every activity; bosses have more HP, Attack and Defense. Red marks a stat above a standard enemy of that level, blue marks one below.</p><p>Shields, healing, multi-hits and special attacks add difficulty without changing level. Calamity lists them per boss.</p>' },
    { id: 'story', title: 'Story', summary: `Six regions, ${storyRules.stages} stages`, content: `<p>${storyPurpose}</p><p>${storyRulesText}</p>` },
    { id: 'training', title: 'Training', summary: 'Endless battles for Prismatica', content: `<p>Endless waves with your saved squad, starting at wave 1. Enemies cap at Lv.120.</p>
      <p>Prismatica per kill: 5-10 at Lv.1 to 15-30 at Lv.120. No materials, captures or Null-Prismatica.</p>` },
    { id: 'dungeons', title: 'Elemental dungeons', summary: 'Upgrade materials by element', content: `<p>${elementalDungeonRules.stages} stages, Lv.${elementalDungeonRules.startingLevel}-${elementalEnemyLevel(elementalDungeonRules.maximumLevelStage)}. Materials match the dungeon's element and grow with level. No captures or Null-Prismatica.</p>
      <p>Collections lists exact drop tables for defeated Elemental-Devourers.</p>` },
    { id: 'infusion', title: 'Evolution infusion', summary: 'Evolution materials from Heaven and Abyss', content: `<p>${infusionModeStageCount} stages, Lv.50-120. Form 3 from Lv.${infusionFormLevel(2)}, Form 4 from Lv.${infusionFormLevel(3)}, Form 5 from Lv.${infusionFormLevel(4)}.</p>
      <p>Evolution and leveling materials from Lv.75. Bonus Epic, Legendary and Omnic materials from Lv.80, Lv.100 and Lv.115.</p>
      <p>Null-Prismatica from Lv.80: 8% for 1, 1.5% for 2, 0.5% for 3, rising to 10%, 10% and 5% at Lv.120. The stage ${infusionModeStageCount} boss gives 5, 10 or 15 at the same chances.</p>
      <p>20% capture chance per enemy. Captures keep their form and skills, up to Lv.60.</p>
      <ul>${infusionModes.map((mode) => `<li><strong>${mode.name}</strong>: ${elementLabel(infusionEnemyElements[mode.id])} enemies. Materials: ${elements.filter((element) => element.infusion === mode.id).map((element) => element.name).join(', ')}.</li>`).join('')}</ul>` },
    { id: 'currency', title: 'Currency farms', summary: 'Crownfall Treasury & Rosethorn Sanctuary', content: `<p>25 stages, Lv.65-120, six fixed forms and a boss every fifth stage. Final bosses give 5x currency. No materials or clear bonus.</p>
      <p>20% capture chance per enemy. Captures keep their form and skills, up to Lv.60. Sell copies in Team; locked, squad and Conduit-equipped copies are protected.</p>
      <h4>Crownfall Treasury</h4><p>${treasuryPrismaticaText} No Null-Prismatica.
      Sales, Common to Omnic: ${treasurySalePrices.map((price) => price.toLocaleString('en-US')).join(' / ')} Prismatica.</p>
      <h4>Rosethorn Sanctuary</h4><p>Prismatica per enemy: 7-14 at Lv.65 to 15-30 at Lv.120.
      Null-Prismatica: 50% chance of 1 at Lv.65, rising to 80% of 5 at Lv.120; the final boss gives 25 at 80%.
      Sales, Common to Omnic: ${sanctuarySalePrices.map((price) => `${price.fractalis.toLocaleString('en-US')} Prismatica + ${price.lycalis} Null-Prismatica`).join(' / ')}.</p>` },
    { id: 'roses', title: 'Passion of Crimson Roses', summary: 'Rosethorn materials', content: roseEventRules },
    { id: 'machines', title: 'Awaken the Machines', summary: 'Conduits, components and Masters', content: machineRulesText },
    { id: 'war', title: 'Elemental War', summary: 'Defeat challengers for a chance to recruit them', content: `<p>${warLore}</p><p>${warRulesText}</p>` },
    { id: 'continuing', title: 'Between battles', summary: 'Health, Gauge and leaving a run', content: `<p>Choose Continue when ready. Staged activities restore HP and keep Gauge; Training carries HP, Gauge and recovery between waves.</p>
      <p>Settings pauses the run; quitting ends it.</p>` },
  ]);
}

export function gameplayHub(account: Account | null = emptyAccount()): string {
  return `<div class="gameplay-hub ref-screen ref-play"><aside class="ref-panel ref-activity-sidebar"><header class="ref-panel-heading">Activity</header>
    <div class="menu-information-action">
    ${information('gameplay-information', 'Gameplay information', gameplayInformation())}</div>
    <nav class="activity-categories" data-menu-scroll="activity-rail" aria-label="Activity types">
      ${activitySections.map(([heading, ids]) => `<section class="ref-activity-section"><h3>${heading}</h3>${ids.map((category) => {
        const entry = activityCategories.find(([id]) => id === category)!;
        const [id, name, description] = entry;
        return `<a href="#gameplay-${id}" aria-controls="gameplay-${id}"><span><strong>${name}</strong><small>${description}</small></span></a>`;
      }).join('')}</section>`).join('')}
    </nav></aside>
    <section class="activity-group" id="gameplay-adventure"><h2>Training</h2>
      <article class="activity-card training-card">
        <header class="training-hero"><img src="${assetUrl('backgrounds/grassy-field.png')}" alt="" width="1456" height="816"><div><p class="eyebrow">Practice · Endless battles</p><h3>Training · Grassy Field</h3></div></header>
        <div class="training-details">${activityFacts('Endless waves', '1-120', 'Prismatica')}
          <div class="training-summary"><p>${trainingLore}</p><p>Start at wave 1 with your saved squad. Continue at your own pace; HP and Gauge carry into the next wave.</p>${itemShowcase([{ id: 'fractalis' }], 'Rewards')}</div>
          <div><h4>First wave</h4>${enemyStrength({ level: 1, boss: false, stats: enemyCombatStats(1, false) })}</div>
          <footer class="training-entry"><p class="quiet">Rewards save after each defeat. Leaving ends the run.</p><button class="primary-button" data-page="battle">Enter Training</button></footer>
        </div></article></section>
    <section class="activity-group" id="gameplay-dungeons"><h2>Elemental material dungeons</h2>
      ${activityPicker(elements.map((element) => ({ name: element.dungeon })))}
      <div class="activity-grid">${elements.map((element, index) => `<article class="activity-card dungeon-card ${dungeonArt[element.id] ? 'has-dungeon-art' : ''}" data-element-index="${index}" style="--dungeon:${elementAccents[element.id]}">
        ${activityDifficulty(element.id, activityLayout(`
        ${activityBanner(element.dungeon, dungeonArt[element.id] ? `banners/${dungeonArt[element.id]?.slug}.png` : null, `${element.dungeon} banner`, true)}
        <p class="eyebrow">${element.name} · ${elementEmotions[element.id]}</p>
        <p>Rise's Elemental-Devourers search these ruins with the same ${element.name} power that Let gave his Element-Bearers.</p>
        ${activityFacts(`${elementalDungeonRules.stages} stages`, `${elementalDungeonRules.startingLevel}-${elementalDungeonRules.maximumLevel}`, 'Prismatica · Materials')}`, `
        ${itemShowcase([{ id: 'fractalis' }, ...materialRarities.map((rarity) => ({ id: `${element.id}-${rarity.toLowerCase()}` }))], 'Rewards across stages')}
        ${dungeonEntry(element.id, account)}`), account)}</article>`).join('')}</div></section>
    <section class="activity-group" id="gameplay-infusion"><h2>Evolution infusion</h2>
      ${activityPicker(infusionModes.map((mode) => ({ name: mode.name })))}
      <div class="activity-grid">${infusionModes.map((mode) => `<article class="activity-card">
        ${activityDifficulty(mode.id, activityLayout(`
        ${activityBanner(mode.name, `banners/${mode.id}-banner.png`)}
        <p>${devourerHabitats[mode.id]}</p>
        ${activityFacts(`${mode.stages} stages`, `${mode.startingLevel}-120`, 'Materials · Prismatica · Null-Prismatica · Captures')}
        <p>Evolution materials from Lv.75. Null-Prismatica from Lv.80.</p>`, `
        ${itemShowcase([{ id: 'fractalis' }, { id: 'lycalis' }, ...specialtyMaterials.filter((item) => item.id.startsWith(`${mode.id}-`)).map((item) => ({ id: item.id }))], 'Currencies & specialty materials')}
        ${infusionEntry(mode, account)}`), account)}</article>`).join('')}</div></section>
    <section class="activity-group" id="gameplay-currency"><h2>Currency farms</h2>
      ${activityPicker(currencyModes.map((mode) => ({ name: mode.name })))}
      ${currencyModes.map((mode) => `<article class="activity-card">
        ${activityDifficulty(mode.id, activityLayout(`
        ${activityBanner(mode.name, `banners/${mode.id}-banner.png`, `${mode.name} banner`, true)}
        <p class="eyebrow">TRANQUILITIC · ${mode.id === 'treasury' ? 'PRISMATICA' : 'NULL-PRISMATICA'}</p>
        <p>${devourerHabitats[mode.id]}</p>
        ${activityFacts(`${mode.stages} stages`, '65-120', mode.id === 'treasury' ? 'Prismatica · Captures' : 'Prismatica · Null-Prismatica · Captures')}`, `
        ${itemShowcase(mode.id === 'treasury' ? [{ id: 'fractalis' }] : [{ id: 'fractalis' }, { id: 'lycalis' }], 'Currency rewards')}
        ${infusionEntry(mode, account)}`), account)}</article>`).join('')}</section>
    <section class="activity-group" id="gameplay-machines"><h2>Awaken the Machines</h2><article class="activity-card">
      ${activityDifficulty('machines', activityLayout(`
      ${activityBanner('Awaken the Machines', 'banners/machines-banner.png', 'Awaken the Machines: a destroyed prototype from Let and Rise\'s collaboration awakens in an element-scorched wasteland.')}
      <p>${machineOrigin}</p>
      ${activityFacts(`${machineRules.stages} stages`, '10-120', 'Prismatica · Broken Mechanical Components · Conduits')}
      <p>Rare 8% · Legendary 3.5% · Omnic 1% from stage ${machineRules.omnicStage}</p>
      <p>Unowned Conduits only. A completed rarity awards no Conduit or replacement reward.</p>`, `
      ${itemShowcase([{ id: 'mechanical-components' }], 'Conduit upgrade currency')}
      <button class="text-button" data-page="conduit-upgrade">Conduit Upgrade &rarr;</button>
      ${infusionEntry({ id: 'machines', name: 'Awaken the Machines' }, account)}`), account)}
      </article></section>
    <section class="activity-group" id="gameplay-war"><h2>Elemental War</h2>
      ${activityPicker(elementalWars)}
      ${elementalWars.map((mode) => {
        const unlocked = account ? unlockedWarStage(account, mode.character) : 1;
        const access = account ? activityAccess(account, { kind: 'war', character: mode.character, stage: unlocked }) : null;
        return `<article class="activity-card" style="--dungeon:${elementAccents[mode.element]}">${activityLayout(`
          ${activityBanner(mode.name, `banners/${warEncounter(mode.character, 1).banner}`, `${mode.name} activity banner`, true)}
          <p class="eyebrow">${getStarter(mode.character).name} · ${elementLabel(mode.element)}</p>
          <p>${getStarter(mode.character).description}</p><p>${warLore}</p>
          ${activityFacts('10 stages · One boss each', '90-140', 'Prismatica · Null-Prismatica · Final-boss recruitment')}`, `
          ${itemShowcase([{ id: 'fractalis' }, { id: 'lycalis' }], 'Currency rewards')}
          <p>Final boss:1% base-form recruitment · Already owned:100 Null-Prismatica</p>
          ${account ? `${enemyStrength(warEncounter(mode.character, unlocked))}<footer class="activity-entry"><label class="dungeon-stage-label">Stage
            <select data-war-stage="${mode.character}" aria-label="${mode.name} stage" ${account ? '' : 'disabled'}>${Array.from({ length: unlocked }, (_, index) =>
              `<option value="${index + 1}" ${index + 1 === unlocked ? 'selected' : ''}>${index + 1} · Lv.${warEncounter(mode.character, index + 1).level}</option>`).join('')}</select></label>
            <button class="primary-button" data-war="${mode.character}" ${access?.unlocked ? '' : 'disabled'}>${access?.unlocked ? 'Enter trial · Free' : 'Locked'}</button>
            ${access?.unlocked ? '' : `<p class="activity-unlock-hint">Unlocks at ${access?.requirement}. Your highest: Lv.${access?.level}.</p>`}</footer>`
              : '<button disabled>Elemental War unavailable: resolve the save error</button>'}`)}
        </article>`;
      }).join('')}</section>
    <section class="activity-group" id="gameplay-story"><h2>Story</h2>
      ${storyCampaign(account, account ? ownedCharacters(account)[0] ?? 'ember' : 'ember', false)}
      </section>
    <section class="activity-group" id="gameplay-events"><h2>Events</h2>${roseEvent(account, false)}<button class="text-button" data-page="events">Event details &rarr;</button></section></div>`;
}

export function bindGameplayNavigation(host: HTMLElement): void {
  const hub = host.querySelector<HTMLElement>('.gameplay-hub');
  if (!hub) return;
  const links = Array.from(hub.querySelectorAll<HTMLAnchorElement>('.activity-categories a'));
  const groups = Array.from(hub.querySelectorAll<HTMLElement>('.activity-group'));
  for (const group of groups) {
    const choices = Array.from(group.querySelectorAll<HTMLButtonElement>('[data-activity-choice]'));
    const cards = Array.from(group.querySelectorAll<HTMLElement>('.activity-card'));
    if (!choices.length) continue;
    if (choices.length !== cards.length) throw new Error('Activity choices do not match the registered cards.');
    const choose = (index: number): void => {
      if (!cards[index]) throw new Error('Selected activity is not registered.');
      cards.forEach((card, current) => { card.hidden = current !== index; });
      choices.forEach((button, current) => { button.setAttribute('aria-pressed', String(current === index)); });
      selectedActivities.set(group.id, index);
    };
    choices.forEach((button, index) => {
      const card = cards[index];
      card.id = `${group.id}-detail-${index}`;
      button.setAttribute('aria-controls', card.id);
      button.addEventListener('click', () => { choose(index); });
    });
    choose(selectedActivities.get(group.id) ?? 0);
  }
  const select = (id: string): void => {
    if (!groups.some((group) => group.id === id)) throw new Error('Unknown activity category.');
    groups.forEach((group) => { group.hidden = group.id !== id; });
    links.forEach((link) => {
      if (link.hash === `#${id}`) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    const current = links.find((link) => link.hash === `#${id}`);
    const rail = current?.closest<HTMLElement>('.activity-categories');
    if (current && rail && rail.scrollWidth > rail.clientWidth) {
      rail.scrollLeft += current.getBoundingClientRect().left - rail.getBoundingClientRect().left - 8;
    }
  };
  const requested = location.hash.slice(1);
  select(groups.some((group) => group.id === requested) ? requested : 'gameplay-story');
  links.forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault();
    select(link.hash.slice(1));
    history.replaceState(null, '', link.hash);
    const heading = hub.querySelector<HTMLElement>('.activity-group:not([hidden]) h2');
    heading?.focus({ preventScroll: true });
  }));
  groups.forEach((group) => group.querySelector('h2')?.setAttribute('tabindex', '-1'));
}
