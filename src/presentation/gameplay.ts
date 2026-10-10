import { elements, elementalDungeonRules, elementalEnemyLevel, infusionModes, currencyModes, materialRarities } from '../content/activities';
import { assetUrl } from './portrait';
import { uiIcon } from './ui-icon';
import { dungeonArt, elementAccents } from '../content/dungeon-art';
import { isPlayableDungeon } from '../content/dungeons';
import { emptyAccount, unlockedStage, unlockedWarStage, type Account } from '../game/account';
import { infusionEnemyElements, treasurySalePrices, sanctuarySalePrices, specialtyMaterials } from '../content/infusions';
import { elementLabel } from './element-label';
import { information } from './information';
import { itemShowcase } from './item-showcase';
import { roseEvent, roseEventRules } from './rose-event';
import { machineRules, machineRulesText } from '../content/machines';
import { activityBanner } from './activity-banner';
import { infusionEntry } from './activity-entry';
import { elementalWars, warEncounter, warRulesText } from '../content/elemental-war';
import { getStarter } from '../content/starters';
import { storyRulesText } from '../content/story';

function dungeonEntry(element: (typeof elements)[number]['id'], account: Account | null): string {
  if (!account) return '<button disabled>Dungeon unavailable: resolve the save error</button>';
  if (!isPlayableDungeon(element)) throw new Error('Unknown elemental dungeon.');
  const unlocked = unlockedStage(account, element);
  return `<footer class="activity-entry"><label class="dungeon-stage-label">Stage
    <select data-dungeon-stage="${element}" aria-label="${elements.find((entry) => entry.id === element)?.dungeon} stage">${Array.from({ length: unlocked }, (_, stage) => `<option value="${stage + 1}" ${stage + 1 === unlocked ? 'selected' : ''}>${stage + 1}</option>`).join('')}</select></label>
    <button class="primary-button" data-dungeon="${element}">Enter dungeon</button></footer>`;
}

const activityCategories = [
  ['story', 'Story', 'Six regions · 150 stages · Lv.1-55', 'story'],
  ['adventure', 'Training', 'Endless waves · Prismatica', 'gameplay'],
  ['dungeons', 'Elemental dungeons', 'Six elements · Upgrade materials', 'inventory'],
  ['infusion', 'Evolution infusion', 'Heaven & Abyss · Late-form growth', 'evolution'],
  ['currency', 'Currency farms', 'Prismatica & Null-Prismatica', 'inventory'],
  ['machines', 'Awaken the Machines', 'Conduits · Lv.10-120', 'inventory'],
  ['war', 'Elemental War', 'Human challengers · Lv.90-140', 'gameplay'],
  ['events', 'Events', 'Passion of Crimson Roses · Lv.80-140', 'events'],
] as const;

const selectedActivities = new Map<string, number>();

function activityPicker(entries: readonly { name: string }[]): string {
  return `<nav class="activity-picker" aria-label="Choose activity">${entries.map((entry, index) =>
    `<button type="button" data-activity-choice="${index}" aria-pressed="${index === 0}"><span>${entry.name}</span></button>`).join('')}</nav>`;
}

function activityFacts(stages: string, levels: string, drops: string): string {
  return `<dl class="activity-facts"><div><dt>Stages</dt><dd>${stages}</dd></div><div><dt>Enemy levels</dt><dd>${levels}</dd></div><div><dt>Drops</dt><dd>${drops}</dd></div></dl>`;
}

export function gameplayHub(account: Account | null = emptyAccount()): string {
  return `<div class="gameplay-hub"><div class="hub-heading"><p class="eyebrow">CHOOSE YOUR ACTIVITY</p><h1 tabindex="-1">Gameplay</h1></div>
    <div class="menu-information-action">
    ${information('gameplay-information', 'Gameplay information', `<h3>Story</h3><p>${storyRulesText}</p><h3>Training</h3><p>Each entry begins at wave 1 with your saved squad.
      Endless waves cap enemy level at 120. Per-kill Prismatica grows from 5-10 at Lv.1 to 15-30 at Lv.120. No materials, captures or Null-Prismatica.</p>
      <h3>Elemental dungeons</h3><p>${elementalDungeonRules.stages} stages, enemy levels ${elementalDungeonRules.startingLevel}-${elementalEnemyLevel(elementalDungeonRules.maximumLevelStage)}.
      Materials match the dungeon's element. Quantities and rare chances increase with level. No captures or Null-Prismatica.
      Defeated Creature entries in Collections show exact stage drop tables.</p>
      <h3>Evolution infusion</h3><p>Specialty materials unlock at levels 80 / 93 / 100. Bonus Epic / Legendary / Omnic unlock at 80 / 100 / 115.
      Heaven draws bonus materials from its four associated elements; Abyss draws from its two.
      Each kill independently rolls Null-Prismatica: at Lv.80 none / 1 / 2 / 3 = 90 / 8 / 1.5 / 0.5%; at Lv.120 = 75 / 10 / 10 / 5%, with linear interpolation.</p>
      ${infusionModes.map((mode) => `<p><strong>${mode.name}</strong> · Enemy element: ${elementLabel(infusionEnemyElements[mode.id])}
        · Material pool: ${elements.filter((element) => element.infusion === mode.id).map((element) => element.name).join(', ')}.</p>`).join('')}
      <h3>Captures and currency farms</h3><p>Heaven, Abyss, Crownfall Treasury and Rosethorn Sanctuary have a separate 20% per-kill capture chance.
      Copies retain defeated level, form and kit. Currency farms have 25 stages at levels 65-120, six fixed forms and a boss every fifth stage.
      Boss and ordinary enemies use the same payouts. No farm materials or clear bonus.</p>
      <h4>Crownfall Treasury</h4><p>Guaranteed 100-200 Prismatica at Lv.65 to 1,000-2,000 at Lv.120; minimum grows quadratically. No Null-Prismatica.
      Common through Omnic creature sales: ${treasurySalePrices.map((price) => price.toLocaleString('en-US')).join(' / ')} Prismatica.</p>
      <h4>Rosethorn Sanctuary</h4><p>Ordinary Prismatica 7-14 at Lv.65 to 15-30 at Lv.120.
      One independent Null-Prismatica roll: 50% of 1 at Lv.65 to 80% of 5 at Lv.120. Chance is linear; quantity rounds the linear 1-5 curve.
      Common through Omnic sales: ${sanctuarySalePrices.map((price) => `${price.fractalis.toLocaleString('en-US')} Prismatica + ${price.lycalis} Null-Prismatica`).join(' / ')}.</p>
      <p>Sell copies in Character. Locked, squad-assigned and Conduit-equipped copies are protected.</p>
      <h3>Passion of Crimson Roses</h3>${roseEventRules}
      <h3>Awaken the Machines</h3>${machineRulesText}
      <h3>Elemental War</h3><p>${warRulesText}</p>
      <h3>Continuing encounters</h3><p>Continue is manual. Staged activities restore HP between stages and retain Gauge.
      Training carries HP, Gauge and recovery into the next wave. Settings retains the current encounter; quitting ends the run.</p>`)}</div>
    <nav class="activity-categories" data-menu-scroll="activity-rail" aria-label="Activity types">
      ${activityCategories.map(([id, name, description, icon]) => `<a href="#gameplay-${id}" aria-controls="gameplay-${id}">${uiIcon(icon)}<span><strong>${name}</strong><small>${description}</small></span></a>`).join('')}
    </nav>
    <section class="activity-group" id="gameplay-adventure"><h2>Training</h2>
      <article class="activity-card" style="--adventure-art:url('${assetUrl('backgrounds/grassy-field.png')}')"><h3>Training · Grassy Field</h3>
        ${activityFacts('Endless waves', '1-120', 'Prismatica')}
        ${itemShowcase([{ id: 'fractalis' }], 'Rewards')}
        <button class="primary-button" data-page="battle">Enter Training</button></article></section>
    <section class="activity-group" id="gameplay-dungeons"><h2>Elemental material dungeons</h2>
      ${activityPicker(elements.map((element) => ({ name: element.dungeon })))}
      <div class="activity-grid">${elements.map((element, index) => `<article class="activity-card dungeon-card ${dungeonArt[element.id] ? 'has-dungeon-art' : ''}" data-element-index="${index}" style="--dungeon:${elementAccents[element.id]}">
        ${activityBanner(element.dungeon, dungeonArt[element.id] ? `banners/${dungeonArt[element.id]?.slug}.png` : null, `${element.dungeon} banner`, true)}
        <p class="eyebrow">${element.name} · ${element.affinity}</p>
        ${activityFacts(`${elementalDungeonRules.stages} stages`, `${elementalDungeonRules.startingLevel}-${elementalDungeonRules.maximumLevel}`, 'Prismatica · Materials')}
        ${itemShowcase([{ id: 'fractalis' }, ...materialRarities.map((rarity) => ({ id: `${element.id}-${rarity.toLowerCase()}` }))], 'Rewards across stages')}
        ${dungeonEntry(element.id, account)}</article>`).join('')}</div></section>
    <section class="activity-group" id="gameplay-infusion"><h2>Evolution infusion</h2>
      ${activityPicker(infusionModes.map((mode) => ({ name: mode.name })))}
      <div class="activity-grid">${infusionModes.map((mode) => `<article class="activity-card">
        ${activityBanner(mode.name, `banners/${mode.id}-banner.png`)}
        <p class="eyebrow">${mode.energy} ENERGY</p>
        ${activityFacts(`${mode.stages} stages`, `${mode.startingLevel}-120`, 'Materials · Prismatica · Null-Prismatica · Captures')}
        ${itemShowcase([{ id: 'fractalis' }, { id: 'lycalis' }, ...specialtyMaterials.filter((item) => item.id.startsWith(`${mode.id}-`)).map((item) => ({ id: item.id }))], 'Currencies & specialty materials')}
        ${infusionEntry(mode, account)}</article>`).join('')}</div></section>
    <section class="activity-group" id="gameplay-currency"><h2>Currency farms</h2>
      ${activityPicker(currencyModes.map((mode) => ({ name: mode.name })))}
      ${currencyModes.map((mode) => `<article class="activity-card">
        ${activityBanner(mode.name, `banners/${mode.id}-banner.png`, `${mode.name} banner`, true)}
        <p class="eyebrow">TRANQUILITIC · ${mode.id === 'treasury' ? 'PRISMATICA' : 'NULL-PRISMATICA'}</p>
        ${activityFacts(`${mode.stages} stages`, '65-120', mode.id === 'treasury' ? 'Prismatica · Captures' : 'Prismatica · Null-Prismatica · Captures')}
        ${itemShowcase(mode.id === 'treasury' ? [{ id: 'fractalis' }] : [{ id: 'fractalis' }, { id: 'lycalis' }], 'Currency rewards')}
        ${infusionEntry(mode, account)}</article>`).join('')}</section>
    <section class="activity-group" id="gameplay-machines"><h2>Awaken the Machines</h2><article class="activity-card">
      ${activityBanner('Awaken the Machines', 'banners/machines-banner.png', 'Awaken the Machines: an ancient white machine awakens in an element-scorched wasteland.')}
      ${activityFacts(`${machineRules.stages} stages`, '10-120', 'Prismatica · Broken Mechanical Components · Conduits')}
      <p>Rare 8% · Legendary 3.5% · Omnic 1% from stage ${machineRules.omnicStage}</p>
      ${itemShowcase([{ id: 'mechanical-components' }], 'Conduit upgrade currency')}
      <button class="text-button" data-page="conduit-upgrade">Conduit Upgrade &rarr;</button>
      ${infusionEntry({ id: 'machines', name: 'Awaken the Machines' }, account)}
      </article></section>
    <section class="activity-group" id="gameplay-war"><h2>Elemental War</h2>
      ${activityPicker(elementalWars)}
      ${elementalWars.map((mode) => {
        const unlocked = account ? unlockedWarStage(account, mode.character) : 1;
        return `<article class="activity-card" style="--dungeon:${elementAccents[mode.element]}">
          ${activityBanner(mode.name, `banners/${warEncounter(mode.character, 1).banner}`, `${mode.name} activity banner`, true)}
          <p class="eyebrow">${getStarter(mode.character).name} · ${elementLabel(mode.element)}</p>
          ${activityFacts('10 stages · One boss each', '90-140', 'Prismatica · Null-Prismatica · Final-boss recruitment')}
          ${itemShowcase([{ id: 'fractalis' }, { id: 'lycalis' }], 'Currency rewards')}
          <p>Final boss:1% base-form recruitment · Already owned:100 Null-Prismatica</p>
          ${account ? `<footer class="activity-entry"><label class="dungeon-stage-label">Stage
            <select data-war-stage="${mode.character}" aria-label="${mode.name} stage" ${account ? '' : 'disabled'}>${Array.from({ length: unlocked }, (_, index) =>
              `<option value="${index + 1}" ${index + 1 === unlocked ? 'selected' : ''}>${index + 1} · Lv.${warEncounter(mode.character, index + 1).level}</option>`).join('')}</select></label>
            <button class="primary-button" data-war="${mode.character}">Enter trial · Free</button></footer>`
              : '<button disabled>Elemental War unavailable: resolve the save error</button>'}
        </article>`;
      }).join('')}</section>
    <section class="activity-group" id="gameplay-story"><h2>Story</h2><article class="activity-card">
      <h3>Six beacons · One road</h3><p>Follow a linear campaign across all six elements. Restore each regional beacon to open the next land.</p>
      ${activityFacts('150 · 25 per region', '1-55', 'Common · Uncommon materials')}
      <button class="primary-button" data-page="story">Open world map</button></article></section>
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
