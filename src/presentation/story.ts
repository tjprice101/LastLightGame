import { storyRegions, storyEncounter, storyRules, storyBossBonus, storyRulesText, storyLoot, storyCompletionReward, storyReplayReward } from '../content/story';
import { getElement } from '../content/activities';
import { type Account, unlockedStoryStage } from '../game/account';
import { getStarter, type StarterId } from '../content/starters';
import { elementLabel } from './element-label';
import { elementAccents } from '../content/dungeon-art';
import { information } from './information';
import { itemShowcase } from './item-showcase';
import { storyWorldMap } from '../content/story-art';
import { assetUrl } from './portrait';
import { materialName } from '../content/dungeon-art';
import './story.css';
import { highestBearerLevel } from '../game/activity-access';
import { storyPurpose } from '../content/world-lore';
import { worldLore } from './world-lore';
import { enemyStrength } from './enemy-strength';
import { stageLootButton } from './stage-loot';

const R = storyRules.regionStages;
let selectedRegion: number | undefined;
let selectedStage: number | undefined;
let viewMode: 'stages' | 'map' = 'map';
const mapPositions = [[24, 33], [73, 33], [47, 20], [50, 73], [23, 65], [80, 66]] as const;

function stageDetail(stage: number, completed: number, unlocked: number, highestLevel: number): string {
  const encounter = storyEncounter(stage);
  return `<div class="ref-story-entry-summary"><p>Stage ${encounter.regionStage} · Lv. ${encounter.level} · ${encounter.name}${encounter.boss ? ' · Regional boss' : ''} · Free entry</p>
    ${enemyStrength(encounter)}
    <p>Highest owned Element-Bearer: Lv. ${highestLevel}</p>
    <p class="ref-story-kill-loot"><strong>Stage-clear reward:</strong> ${stage <= completed
      ? `${storyReplayReward.fractalis} Prismatica (first-clear ${storyCompletionReward.lycalis} Null-Prismatica already earned)`
      : `${storyCompletionReward.fractalis} Prismatica · ${storyCompletionReward.lycalis} Null-Prismatica on first clear; replays give ${storyReplayReward.fractalis} Prismatica`}</p>
    <p class="ref-story-kill-loot"><strong>Per-kill rewards:</strong> ${storyLoot(stage).map((drop) => `${drop.id === 'fractalis' ? 'Prismatica' : materialName(drop.id)} ${drop.minimum}–${drop.maximum} (${Math.round(drop.chance * 100)}%)`).join(' · ')}</p>${stageLootButton('story', stage)}</div>
    <button type="button" class="primary-button" data-story-enter="${stage}" ${stage > unlocked ? 'disabled' : ''}>${stage > unlocked ? 'Locked stage' : stage <= completed ? 'Replay stage' : 'Enter stage'} ${encounter.regionStage} &rarr;</button>`;
}

function regionHeading(index: number, completed: number, unlocked: number): string {
  const region = storyRegions[index];
  const first = index * R + 1;
  const next = storyEncounter(unlocked);
  return `<p class="eyebrow">${getElement(region.element).name} · Lv. ${storyEncounter(first).level}–${storyEncounter(first + R - 1).level}</p>
    <h2 tabindex="-1">${region.name}</h2><p>${region.introduction} Common and Uncommon ${getElement(region.element).name} materials only.</p>
    <p class="ref-story-progress">${completed} / ${storyRules.stages} stages cleared. ${completed === storyRules.stages ? 'All beacons restored.' : `Next: ${next.name}, stage ${next.regionStage}.`}</p>`;
}

export function storyCampaign(account: Account | null, starterId: StarterId, showInformation = true): string {
  if (!account) return '<p class="status" role="alert">Story unavailable. Resolve the progression save error.</p>';
  const unlocked = unlockedStoryStage(account);
  const completed = account.storyCompleted ?? 0;
  const starter = getStarter(starterId);
  const activeRegion = selectedRegion ?? storyEncounter(unlocked).regionIndex;
  const start = activeRegion * R + 1;
  const activeStage = selectedStage && storyEncounter(selectedStage).regionIndex === activeRegion ? selectedStage : Math.min(Math.max(unlocked, start), start + R - 1);
  return `<div class="story-campaign mono-story-campaign">
    <aside class="ref-story-region-sidebar"><header class="ref-story-region-heading"><span class="eyebrow">Regions · ${storyRegions.length}</span>
      ${information('story-prologue-information', 'Let and Rise · Opening prologue', `${worldLore()}<h3>${starter.title}</h3><p>${starter.lore.story}</p><blockquote>${starter.lore.vow}</blockquote><p>${storyPurpose}</p>`, 'Prologue')}
      </header>
    <nav class="story-world-map" aria-label="Linear elemental regions">${storyRegions.map((region, index) => {
      const first = index * R + 1;
      return `<button type="button" data-story-region="${index}" aria-controls="story-region-${index}" aria-pressed="${index === activeRegion}" style="--element:${elementAccents[region.element]}">
        <strong>${index + 1}. ${region.name}</strong><small>${elementLabel(region.element)} · ${first > unlocked ? 'Locked' : completed >= first + R - 1 ? 'Beacon restored' : `${Math.min(R, Math.max(0, completed - first + 1))} / ${R} cleared`}</small></button>`;
    }).join('')}</nav></aside>
    <section class="ref-story-main">
    <header class="story-map-heading"><div data-story-region-heading>${regionHeading(activeRegion, completed, unlocked)}</div>
      <div class="mono-story-view-tabs" role="group" aria-label="Story view"><button type="button" data-story-view="stages" aria-pressed="${viewMode === 'stages'}">Stages</button><button type="button" data-story-view="map" aria-pressed="${viewMode === 'map'}">World map</button><button type="button" data-page="team">Team</button></div>
      ${showInformation ? information('story-information', 'Story campaign', `<p>${storyPurpose}</p><p>${storyRulesText}</p><p>Free entry with your saved squad. Loot saves per kill, even if you quit.</p>`) : ''}</header>
    <figure class="story-map-art" ${viewMode !== 'map' ? 'hidden' : ''}><div class="ref-world-map"><div class="ref-world-map-canvas"><img src="${assetUrl(`backgrounds/${storyWorldMap}`)}" width="1456" height="816" alt="Six-beacon Story world map: Emberwake March, Glasswater Reach, Stormspan Heights, Rootstone Wilds, Stillhalo Vale and Riftbound Frontier" />
      <svg class="ref-map-roads" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${mapPositions.slice(1).map((point, index) => `<line x1="${mapPositions[index][0]}" y1="${mapPositions[index][1]}" x2="${point[0]}" y2="${point[1]}" class="${completed >= (index + 1) * R ? 'is-restored' : ''}" vector-effect="non-scaling-stroke" />`).join('')}</svg>
      ${storyRegions.map((region, index) => {
        const cleared = Math.min(R, Math.max(0, completed - index * R));
        const locked = index * R + 1 > unlocked;
        return `<button type="button" class="ref-map-node ${cleared === R ? 'is-restored' : locked ? 'is-locked' : 'is-open'}" style="left:${mapPositions[index][0]}%;top:${mapPositions[index][1]}%" data-story-map-region="${index}" aria-pressed="${index === activeRegion}" aria-label="${region.name}, ${locked ? 'locked' : `${cleared} of ${R} cleared`}"><span>${cleared === R ? '&#10003;' : index + 1}</span><b>${region.name}</b><small>${locked ? 'Locked' : `${cleared} / ${R}`}</small></button>`;
      }).join('')}</div></div><figcaption>Choose a numbered beacon to view its region's stages.</figcaption></figure>
    ${storyRegions.map((region, index) => {
      const first = index * R + 1;
      const selected = index === activeRegion ? activeStage : Math.min(Math.max(unlocked, first), first + R - 1);
      const cleared = Math.min(R, Math.max(0, completed - first + 1));
      const bonus = storyBossBonus(first + R - 1);
      return `<section id="story-region-${index}" class="story-region-panel" ${index !== activeRegion || viewMode === 'map' ? 'hidden' : ''}>
        <div class="ref-story-stages"><h3 class="eyebrow">Stages · ${cleared} / ${R} cleared</h3>
        <nav class="story-stage-path" aria-label="${region.name} stages">${Array.from({ length: R }, (_, local) => {
          const stage = first + local;
          const encounter = storyEncounter(stage);
          return `<div class="mono-story-stage-row"><button type="button" class="story-stage ${encounter.boss ? 'story-boss-stage' : ''}" data-story-select="${stage}" aria-pressed="${stage === selected}" ${stage > unlocked ? 'disabled' : ''}
            ${stage === unlocked && completed < storyRules.stages ? 'aria-current="step"' : ''} aria-label="${region.name}, stage ${local + 1}, level ${encounter.level}${encounter.boss ? ', regional boss' : ''}${stage <= completed ? ', cleared' : stage > unlocked ? ', locked' : ', next stage'}"><strong>${local + 1}</strong><span>Lv.${encounter.level}</span><small>${encounter.boss ? 'Boss' : stage <= completed ? 'Cleared' : stage > unlocked ? 'Locked' : 'Next'}</small></button><button type="button" class="mono-story-quick-enter" hidden data-story-stage="${stage}" ${stage > unlocked ? 'disabled' : ''} aria-label="Enter ${region.name}, stage ${local + 1}, level ${encounter.level}">&rarr;</button></div>`;
        }).join('')}</nav></div>
        <aside class="story-boss-preview"><p class="eyebrow">Regional boss</p><h3>${region.boss}</h3>
          <p>${cleared === R ? 'First-clear bonus already earned. Replays still pay ordinary loot and the stage-clear reward.' : `One-time first-clear bonus for stage ${R}. Replays pay ordinary loot and the stage-clear reward only.`}</p>
          ${itemShowcase([{ id: 'fractalis', amount: bonus.fractalis }, { id: 'lycalis', amount: bonus.lycalis }], 'First-clear bonus')}</aside>
        <footer class="ref-story-entry" data-story-detail="${index}">${stageDetail(selected, completed, unlocked, highestBearerLevel(account))}</footer></section>`;
    }).join('')}
    </section>
    <details class="story-prologue"><summary>Read opening prologue</summary><article class="story-panel lore-panel"><h2>Let and Rise</h2>${worldLore()}<h3>${starter.title}</h3><p>${starter.lore.story}</p><blockquote>"${starter.lore.vow}"</blockquote><p>${storyPurpose}</p></article></details>
    <button class="text-button" data-page="gameplay" data-training-activity>Training · Endless waves &rarr;</button>
  </div>`;
}

export function bindStoryNavigation(host: HTMLElement, account: Account | null): void {
  const campaign = host.querySelector<HTMLElement>('.story-campaign');
  if (!campaign || !account) return;
  const buttons = Array.from(campaign.querySelectorAll<HTMLButtonElement>('[data-story-region]'));
  const mapButtons = Array.from(campaign.querySelectorAll<HTMLButtonElement>('[data-story-map-region]'));
  const panels = Array.from(campaign.querySelectorAll<HTMLElement>('.story-region-panel'));
  const map = campaign.querySelector<HTMLElement>('.story-map-art');
  const modeButtons = Array.from(campaign.querySelectorAll<HTMLButtonElement>('[data-story-view]'));
  const select = (index: number): void => {
    if (!panels[index]) throw new Error('Unknown Story region.');
    selectedRegion = index;
    panels.forEach((panel, current) => { panel.hidden = current !== index || viewMode === 'map'; });
    buttons.forEach((button, current) => button.setAttribute('aria-pressed', String(current === index)));
    mapButtons.forEach((button, current) => button.setAttribute('aria-pressed', String(current === index)));
    if (map) map.hidden = viewMode !== 'map';
    modeButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.storyView === viewMode)));
    const heading = campaign.querySelector<HTMLElement>('[data-story-region-heading]');
    if (!heading) throw new Error('Story region heading is missing.');
    heading.innerHTML = regionHeading(index, account.storyCompleted ?? 0, unlockedStoryStage(account));
  };
  select(selectedRegion ?? storyEncounter(unlockedStoryStage(account)).regionIndex);
  buttons.forEach((button, index) => button.addEventListener('click', () => {
    viewMode = 'stages';
    select(index);
    campaign.querySelector<HTMLElement>('[data-story-region-heading] h2')?.focus({ preventScroll: true });
  }));
  mapButtons.forEach((button, index) => button.addEventListener('click', () => {
    viewMode = 'stages';
    select(index);
    campaign.querySelector<HTMLElement>('[data-story-region-heading] h2')?.focus({ preventScroll: true });
  }));
  modeButtons.forEach((button) => button.addEventListener('click', () => {
    viewMode = button.dataset.storyView === 'map' ? 'map' : 'stages';
    select(selectedRegion ?? 0);
  }));
  const bindEntry = (detail: HTMLElement): void => {
    detail.querySelector<HTMLButtonElement>('[data-story-enter]')?.addEventListener('click', (event) => {
      const button = event.currentTarget as HTMLButtonElement;
      campaign.querySelector<HTMLButtonElement>(`[data-story-stage="${button.dataset.storyEnter}"]`)?.click();
    });
  };
  panels.forEach((panel) => {
    const detail = panel.querySelector<HTMLElement>('[data-story-detail]');
    if (detail) bindEntry(detail);
  });
  campaign.querySelectorAll<HTMLButtonElement>('[data-story-select]').forEach((button) => button.addEventListener('click', () => {
    const stage = Number(button.dataset.storySelect);
    const region = storyEncounter(stage).regionIndex;
    selectedStage = stage;
    const detail = panels[region].querySelector<HTMLElement>('[data-story-detail]');
    if (!detail) throw new Error('Story stage detail is missing.');
    detail.innerHTML = stageDetail(stage, account.storyCompleted ?? 0, unlockedStoryStage(account), highestBearerLevel(account));
    bindEntry(detail);
    panels[region].querySelectorAll<HTMLButtonElement>('[data-story-select]').forEach((candidate) => candidate.setAttribute('aria-pressed', String(candidate === button)));
  }));
}
