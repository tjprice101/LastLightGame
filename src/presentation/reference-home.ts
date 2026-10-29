import { type Starter, isStarterId } from '../content/starters';
import { characterName } from '../content/character-art';
import { evolutionRarity } from '../content/progression';
import { storyEncounter, storyRegions, storyRules } from '../content/story';
import { equippedSquad, ownedProgress, unlockedStoryStage, type Account } from '../game/account';
import { capturedProgress } from '../game/character-instances';
import { uiIcon } from './ui-icon';
import { ownedCompanion } from './owned-companion';
import { assetUrl, portrait } from './portrait';


type HubIcon = Parameters<typeof uiIcon>[0];
/* Home orbit (D-433): every main destination as a floating bubble around the leader. */
/* Story stays on the Continue card, Events under Play and Profile in the header (owner request). */
function hubBubbles(): readonly (readonly [string, string, string, HubIcon])[] {
  return [
    ['gameplay', 'Play', 'Activities & dungeons', 'gameplay'],
    ['summon', 'Summon', 'Banners & pity', 'summon'],
    ['stores', 'Stores', 'Market & Conduits', 'weapon'],
    ['inventory', 'Inventory', 'Materials & Conduits', 'inventory'],
    ['collections', 'Collections', 'Archives & discoveries', 'overview'],
    ['team', 'Team', 'Squad & Element-Bearers', 'squad'],
  ];
}

function squadRail(account: Account): string {
  const squad = equippedSquad(account);
  return `<div class="bubble-squad-rail" aria-label="Your squad"><span class="bubble-rail-label">Your squad</span>${squad.map((id, index) => {
    const member = ownedCompanion(account, id);
    return `<button type="button" class="bubble-mini-member" ${isStarterId(id) ? `data-team-detail="${id}"` : `data-team-capture-detail="${id}"`} aria-label="Open ${member.name}">${member.art}<span><b>${isStarterId(id) ? member.name.split(', ').at(-1) : member.name}</b><small>${index === 0 ? 'Leader' : 'Member'} &middot; Lv.${member.level}</small></span></button>`;
  }).join('')}<button type="button" class="text-button bubble-rail-edit" data-page="squad">${uiIcon('squad')}Edit squad</button></div>`;
}

export function referenceHome(starter: Starter, account: Account | null): string {
  if (!account) return '<p role="alert">Home unavailable. Resolve the account error.</p>';
  const squad = equippedSquad(account);
  const id = squad[0];
  const member = ownedCompanion(account, id);
  const copy = !isStarterId(id) ? account.capturedCharacters?.find(entry => entry.instanceId === id) : undefined;
  const progress = isStarterId(id) ? ownedProgress(account, id) : undefined;
  const completed = account.storyCompleted ?? 0;
  const encounter = storyEncounter(unlockedStoryStage(account));
  const region = storyRegions.find(entry => entry.element === encounter.element);
  const displayName = isStarterId(id) ? starter.name : member.name;
  const prefix = isStarterId(id) ? characterName(id, progress?.evolution).split(', ')[0] : 'Captured Elemental-Devourer';
  const stars = copy ? capturedProgress(copy).tier + 1 : starter.stars;
  const rarity = evolutionRarity(copy ? capturedProgress(copy).tier + 1 : progress?.evolution ?? 1);
  const storyPercent = Math.round(completed / storyRules.stages * 100);
  return `<div class="ref-screen ref-home bubble-home">
    <section class="bubble-home-intro">
      <button class="ref-panel ref-home-story" data-page="story">${encounter.background ? `<img class="ref-home-story-arena" src="${assetUrl(`backgrounds/${encounter.background}`)}" alt="" draggable="false" />` : ''}<span class="ref-panel-heading">${completed === 0 ? 'Story' : 'Continue story'}</span><span><strong>${completed === storyRules.stages ? 'Story complete' : region?.name ?? encounter.name}</strong><small>${completed < storyRules.stages ? `Stage ${encounter.regionStage} &middot; Enemies Lv.${encounter.level} &middot; ` : ''}${completed} / ${storyRules.stages} stages cleared</small><span class="bubble-story-meter" role="meter" aria-label="Story progress" aria-valuemin="0" aria-valuemax="${storyRules.stages}" aria-valuenow="${completed}"><i style="width:${storyPercent}%"></i></span><small>Drops Prismatica and Common/Uncommon materials.</small></span><span class="ref-go" aria-hidden="true">&rarr;</span></button>
    </section>
    <section class="ref-home-leader bubble-home-orbit" aria-label="Destinations">
      <div class="bubble-portrait-universe"><span class="bubble-orbit-ring" aria-hidden="true"></span><span class="bubble-orbit-ring inner" aria-hidden="true"></span>
        <span class="bubble-orbit-star one" aria-hidden="true">&#10022;</span><span class="bubble-orbit-star two" aria-hidden="true">&#10023;</span>
        <button class="ref-home-art" ${isStarterId(id) ? `data-team-detail="${id}"` : `data-team-capture-detail="${id}"`} aria-label="Open ${member.name}">${isStarterId(id) ? portrait(starter, progress?.evolution) : member.art}</button>
        <div class="ref-home-identity"><p>${prefix} &middot; ${member.element}${isStarterId(id) ? ` &middot; ${starter.weapon}` : ''}</p><h2>${displayName}</h2>
          <div class="ref-tags"><span class="ref-stars" aria-label="${stars}-star ${copy ? 'Elemental-Devourer' : 'Element-Bearer'}">${'&#9733;'.repeat(stars)}</span>${isStarterId(id) ? `<span class="ref-chip">${starter.role}</span>` : ''}<span class="ref-chip">${rarity}</span><span class="ref-chip">Lv.${member.level}${progress ? ` &middot; Evo.${progress.evolution}` : ''}</span></div></div>
      </div>
      ${hubBubbles().map(([page, label, detail, icon], index) => `<button type="button" class="hub-bubble hub-slot-${index}" data-page="${page}" style="--delay:${(index * -.77).toFixed(2)}s"><span class="hub-bubble-symbol">${uiIcon(icon)}</span><strong>${label}</strong><small>${detail}</small></button>`).join('')}
    </section>
    ${squadRail(account)}
  </div>`;
}