import { storyRegions, storyEncounter, storyRules, storyBossBonus, storyRulesText } from '../content/story';
import { getElement } from '../content/activities';
import { type Account, unlockedStoryStage } from '../game/account';
import { getStarter, type StarterId } from '../content/starters';
import { elementLabel } from './element-label';
import { elementAccents } from '../content/dungeon-art';
import { information } from './information';
import { itemShowcase } from './item-showcase';
import './story.css';

let selectedRegion: number | undefined;

export function storyCampaign(account: Account | null, starterId: StarterId): string {
  if (!account) return '<p class="status" role="alert">Story unavailable. Resolve the progression save error.</p>';
  const unlocked = unlockedStoryStage(account);
  const completed = account.storyCompleted ?? 0;
  const starter = getStarter(starterId);
  return `<div class="story-campaign">
    <header class="story-map-heading"><p class="eyebrow">SIX BEACONS ~ ONE ROAD</p><h2>World map</h2>
      <p>${completed} ~ ${storyRules.stages} stages cleared. ${completed === storyRules.stages ? 'All beacons restored.' : `Next: ${storyEncounter(unlocked).name}, stage ${storyEncounter(unlocked).regionStage}.`}</p>
      ${information('story-information', 'Story campaign', `<p>${storyRulesText}</p><p>Entry is free and uses your saved squad. Ordinary kills save their loot immediately; clearing the encounter unlocks the next stage. Quitting never removes earned rewards. Training keeps the former endless Adventure rules.</p>`)}</header>
    <nav class="story-world-map" aria-label="Linear elemental regions">${storyRegions.map((region, index) => {
      const start = index * storyRules.regionStages + 1;
      return `<button type="button" data-story-region="${index}" aria-controls="story-region-${index}" aria-pressed="false" style="--element:${elementAccents[region.element]}">
        <span class="eyebrow">REGION ${index + 1}</span>${elementLabel(region.element)}<strong>${region.name}</strong>
        <small>${start > unlocked ? 'Locked ~ Clear the previous region' : completed >= start + 24 ? 'Beacon restored' : 'Available'}</small></button>`;
    }).join('')}</nav>
    ${storyRegions.map((region, index) => {
      const start = index * storyRules.regionStages + 1;
      const bossStage = start + storyRules.regionStages - 1;
      const bonus = storyBossBonus(bossStage);
      return `<section id="story-region-${index}" class="story-region-panel" hidden>
        <header><p class="eyebrow">${getElement(region.element).name} ~ Lv.${storyEncounter(start).level}-${storyEncounter(bossStage).level}</p>
          <h2 tabindex="-1">${region.name}</h2><p>${region.introduction}</p></header>
        <p class="quiet">Common and Uncommon ${getElement(region.element).name} materials only. Enemies and regional scenery: artwork pending.</p>
        <div class="story-stage-path" role="group" aria-label="${region.name} stages">${Array.from({ length: storyRules.regionStages }, (_, local) => {
          const stage = start + local;
          const encounter = storyEncounter(stage);
          return `<button class="story-stage ${encounter.boss ? 'story-boss-stage' : ''}" data-story-stage="${stage}" ${stage > unlocked ? 'disabled' : ''}
            ${stage === unlocked && completed < storyRules.stages ? 'aria-current="step"' : ''} aria-label="${region.name}, stage ${local + 1}, level ${encounter.level}${encounter.boss ? ', regional boss' : ''}${stage <= completed ? ', cleared' : stage > unlocked ? ', locked' : ', next stage'}">
            <strong>${local + 1}</strong><span>Lv.${encounter.level}</span><small>${encounter.boss ? 'Boss' : stage <= completed ? 'Cleared' : stage > unlocked ? 'Locked' : 'Enter'}</small></button>`;
        }).join('')}</div>
        <div class="story-boss-preview"><h3>Regional boss ~ ${region.boss}</h3>
          <p>${completed >= bossStage ? 'First-clear bonus already earned; replays give ordinary loot.' : 'Account first-clear bonus; no premium reward on replay.'}</p>
          ${itemShowcase([{ id: 'fractalis', amount: bonus.fractalis }, { id: 'lycalis', amount: bonus.lycalis }], 'First-clear bonus')}
        </div></section>`;
    }).join('')}
    <details class="story-prologue"><summary>Read opening prologue</summary><article class="story-panel lore-panel">
      <h2>${starter.title}</h2><p>${starter.lore.story}</p><blockquote>"${starter.lore.vow}"</blockquote>
      <p>The road disappears beneath a veil of dusk. A small light is not enough to light the world, but it is enough to take the first step.</p>
    </article></details>
    <button class="text-button" data-page="gameplay" data-training-activity>Training ~ Endless waves &rarr;</button>
  </div>`;
}

export function bindStoryNavigation(host: HTMLElement, account: Account | null): void {
  const campaign = host.querySelector('.story-campaign');
  if (!campaign || !account) return;
  const buttons = Array.from(campaign.querySelectorAll<HTMLButtonElement>('[data-story-region]'));
  const panels = Array.from(campaign.querySelectorAll<HTMLElement>('.story-region-panel'));
  const select = (index: number): void => {
    if (!panels[index]) throw new Error('Unknown Story region.');
    panels.forEach((panel, current) => { panel.hidden = current !== index; });
    buttons.forEach((button, current) => { button.setAttribute('aria-pressed', String(current === index)); });
    selectedRegion = index;
  };
  select(selectedRegion ?? storyEncounter(unlockedStoryStage(account)).regionIndex);
  buttons.forEach((button, index) => button.addEventListener('click', () => {
    select(index);
    panels[index].querySelector<HTMLElement>('h2')?.focus({ preventScroll: true });
  }));
}
