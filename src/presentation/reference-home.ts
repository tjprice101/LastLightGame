import { getStarter, type Starter } from '../content/starters';
import { characterName } from '../content/character-art';
import { characterRarity, displayEvolution } from '../content/progression';
import { squadMemberLimit } from '../content/squad-rules';
import { radiantBearerKits, type RadiantLoadout } from '../content/radiant-combat';
import { storyEncounter, storyRegions, storyRules } from '../content/story';
import { chapterOneTitle } from '../content/story-codex';
import { equippedSquad, unlockedStoryStage, type Account } from '../game/account';
import { uiIcon } from './ui-icon';
import { ownedCompanion } from './owned-companion';
import { assetUrl } from './portrait';
import { escapeDialogText as escape } from './game-dialog';
import { radiantFormation, radiantFormationStyle, type RadiantFormationSlot } from './radiant-formation';
import { radiantAllyArt } from './radiant-battle-art';
import { isRadiantBearer, radiantAttunementChip, radiantAttunementName, radiantCharacterLoadout, radiantLeaderText } from './radiant-character';
import './radiant-home.css';


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

function squadRail(account: Account, bearers: readonly string[], excluded: number): string {
  return `<div class="bubble-squad-rail"><span class="bubble-rail-label">Squad · ${bearers.length} of ${squadMemberLimit}</span>
    ${excluded ? `<span class="bubble-rail-note" role="note">${excluded === 1 ? 'One saved member is' : `${excluded} saved members are`} not an acquired Element-Bearer and cannot fight. Replace in Edit squad.</span>` : ''}
    <button type="button" class="text-button bubble-rail-edit" data-page="squad">${uiIcon('squad')}Edit squad</button></div>`;
}

/** Leader takes the frontmost slot; remaining members fill the other slots in squad order. */
function formationSlots(size: number): RadiantFormationSlot[] {
  const slots = [...radiantFormation(size)];
  const front = slots.reduce((best, slot, index) => slot.y > slots[best].y ? index : best, 0);
  return [slots[front], ...slots.filter((_, index) => index !== front)];
}

function formationFigure(account: Account, loadout: RadiantLoadout, index: number, slot: RadiantFormationSlot): string {
  const member = ownedCompanion(account, loadout.starter);
  const leader = index === 0;
  return `<button type="button" class="bubble-squad-figure radiant-home-figure${leader ? ' is-leader' : ''}" style="${radiantFormationStyle(slot, index, true)};--formation-index:${index};--member-accent:${member.color}"
      data-team-detail="${loadout.starter}" aria-label="Open ${escape(member.name)}, ${leader ? 'leader' : `squad member ${index + 1}`}">
      <span class="bubble-squad-art">${radiantAllyArt(loadout)}</span>
      <span class="bubble-squad-caption"><b>${escape(member.name.split(', ').at(-1) ?? member.name)}</b>
        <small>${leader ? 'Leader' : 'Member'} · Lv.${loadout.level} · ${radiantAttunementName(loadout)}</small></span>
    </button>`;
}

export function referenceHome(starter: Starter, account: Account | null): string {
  if (!account) return '<p role="alert">Home unavailable. Resolve the account error.</p>';
  const squad = equippedSquad(account);
  const eligible = squad.filter(isRadiantBearer);
  const fallback = !squad.length && account.characters[starter.id] && isRadiantBearer(starter.id) ? [starter.id] : [];
  const bearers = (eligible.length ? eligible : fallback).slice(0, squadMemberLimit);
  const loadouts = bearers.map(id => radiantCharacterLoadout(account, id)?.loadout).filter((entry): entry is RadiantLoadout => !!entry);
  const leader = loadouts[0];
  const completed = account.storyCompleted ?? 0;
  const encounter = storyEncounter(unlockedStoryStage(account));
  const region = storyRegions.find(entry => entry.element === encounter.element);
  const storyPercent = Math.round(completed / storyRules.stages * 100);
  const slots = loadouts.length ? formationSlots(loadouts.length) : [];
  const formation = loadouts.map((loadout, index) => formationFigure(account, loadout, index, slots[index])).join('');
  const identity = leader ? (() => {
    const bearer = getStarter(leader.starter);
    const rarity = characterRarity(leader.starter, leader.form);
    return `<div class="ref-home-identity"><p>${escape(characterName(leader.starter, leader.form, leader.ascension.stats === true).split(', ')[0])} &middot; ${bearer.element} &middot; ${escape(bearer.weapon)}</p><h2>${escape(bearer.name)}</h2>
      <div class="ref-tags"><span class="ref-stars" aria-label="${bearer.stars}-star Element-Bearer">${'&#9733;'.repeat(bearer.stars)}</span>${radiantAttunementChip(leader)}<span class="ref-chip" data-rarity="${rarity}">${rarity}</span><span class="ref-chip">Lv.${leader.level} &middot; Evo.${displayEvolution(leader.starter, leader.form)}</span></div>
      <p class="radiant-home-leader-skill"><strong>${escape(radiantBearerKits[leader.starter].leader)}</strong> &middot; ${radiantLeaderText(leader)}</p></div>`;
  })() : '<div class="ref-home-identity"><h2>Choose your squad</h2><p>Pick one to six acquired Element-Bearers in Team.</p></div>';
  return `<div class="ref-screen ref-home bubble-home">
    <section class="bubble-home-intro">
      <button class="ref-panel ref-home-story" data-page="story">${encounter.background ? `<img class="ref-home-story-arena" src="${assetUrl(`backgrounds/${encounter.background}`)}" alt="" draggable="false" />` : ''}<span class="ref-panel-heading">${completed === 0 ? 'Story · Chapter 1' : 'Continue story · Chapter 1'}</span><span><small>${chapterOneTitle}</small><strong>${completed === storyRules.stages ? 'Chapter 1 complete' : region?.name ?? encounter.name}</strong><small>${completed < storyRules.stages ? `Stage ${encounter.regionStage} &middot; Enemies Lv.${encounter.level} &middot; ` : ''}${completed} / ${storyRules.stages} stages cleared</small><span class="bubble-story-meter" role="meter" aria-label="Chapter 1 progress" aria-valuemin="0" aria-valuemax="${storyRules.stages}" aria-valuenow="${completed}"><i style="width:${storyPercent}%"></i></span><small>Drops Prismatica and Common/Uncommon materials.</small></span><span class="ref-go" aria-hidden="true">&rarr;</span></button>
    </section>
    <section class="ref-home-leader bubble-home-orbit" aria-label="Destinations">
      <div class="bubble-portrait-universe"><span class="bubble-orbit-ring" aria-hidden="true"></span><span class="bubble-orbit-ring inner" aria-hidden="true"></span>
        <span class="bubble-orbit-star one" aria-hidden="true">&#10022;</span><span class="bubble-orbit-star two" aria-hidden="true">&#10023;</span>
        <div class="bubble-squad-formation radiant-home-formation" style="--squad-count:${loadouts.length}" data-squad-size="${loadouts.length}" aria-label="Your squad">${formation}</div>
        ${identity}
      </div>
      ${hubBubbles().map(([page, label, detail, icon], index) => `<button type="button" class="hub-bubble hub-slot-${index}" data-page="${page}" style="--delay:${(index * -.77).toFixed(2)}s"><span class="hub-bubble-symbol">${uiIcon(icon)}</span><strong>${label}</strong><small>${detail}</small></button>`).join('')}
    </section>
    ${squadRail(account, bearers, squad.length - eligible.length)}
  </div>`;
}
