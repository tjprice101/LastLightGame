import { getStarter, type Starter } from '../content/starters';
import { characterName } from '../content/character-art';
import { characterRarity, displayEvolution } from '../content/progression';
import { squadMemberLimit } from '../content/squad-rules';
import { getSummonBanner } from '../content/summon-banners';
import { radiantBearerKits, type RadiantLoadout } from '../content/combat-kits';
import { storyEncounter, storyRegions, storyRules } from '../content/story';
import { chapterOneTitle } from '../content/story-codex';
import { equippedSquad, unlockedStoryStage, type Account } from '../game/account';
import { uiIcon } from './ui-icon';
import { ownedCompanion } from './owned-companion';
import { assetUrl } from './portrait';
import { escapeDialogText as escape } from './game-dialog';
import { radiantAllyArt } from './battle-art';
import { isRadiantBearer, radiantAttunementChip, radiantAttunementName, radiantCharacterLoadout, radiantLeaderText } from './character-combat';
import { attendanceReward } from '../content/social-calendar';
import type { SocialCalendarView } from '../online/social-calendar';
import { socialRewardText } from './social-calendar';
import { currencyIcon } from './currency-icon';

type HubIcon = Parameters<typeof uiIcon>[0];

function squadCard(account: Account, loadout: RadiantLoadout, index: number): string {
  const member = ownedCompanion(account, loadout.starter);
  const bearer = getStarter(loadout.starter);
  const rarity = characterRarity(loadout.starter, loadout.form);
  const leader = index === 0;
  const name = characterName(loadout.starter, loadout.form, loadout.ascension.stats === true);
  return `<button type="button" class="home-squad-member${leader ? ' is-leader' : ''}" style="--member-accent:${member.color}"
      data-page="team" data-team-area="bearers" data-team-character="${loadout.starter}" aria-label="Open ${escape(member.name)} in Team, ${leader ? 'squad leader' : `squad member ${index + 1}`}">
      <span class="home-squad-art">${radiantAllyArt(loadout)}</span>
      <span class="home-squad-caption"><small>${leader ? 'Leader' : 'Member'} · ${bearer.element} · ${rarity}</small>
        <b>${escape(name)}</b><small>Lv.${loadout.level} · Evo.${displayEvolution(loadout.starter, loadout.form)}</small>
        <span class="home-squad-attunement">${radiantAttunementChip(loadout)}<span>${radiantAttunementName(loadout)}</span></span></span>
    </button>`;
}

function emptySquadSlot(index: number): string {
  return `<button type="button" class="home-squad-member is-empty" data-page="team" data-team-area="squad" aria-label="Add an Element-Bearer to squad slot ${index + 1}">
    <span class="home-squad-add" aria-hidden="true">+</span><b>Empty slot</b><small>Add an Element-Bearer</small></button>`;
}

function quickAccess(online: boolean): string {
  const actions: readonly (readonly [string, string, string, HubIcon, string?])[] = [
    ['help', 'Menu', 'Open the game guide', 'settings', 'sanctuary-help'],
    ['collections', 'Archive', 'Collections and discoveries', 'overview'],
    ['team', 'Loadouts', 'Saved squad configurations', 'squad'],
    ['team', 'Squad', 'Manage your six-slot formation', 'squad'],
    ['stores', 'Exchange', 'Material Exchange and shops', 'weapon'],
    ['inventory', 'Items', 'Inventory and currencies', 'inventory'],
    ['profile', 'Friends', 'Friends and messages', 'squad'],
    ['profile', 'Daily', 'Attendance and mailbox', 'story'],
  ];
  return `<nav class="home-shortcuts" aria-label="Quick access">${actions.map(([page, label, detail, icon, information]) =>
    information
      ? `<button type="button" class="home-quick-action" data-information="${information}" aria-label="${detail}" aria-haspopup="dialog" aria-controls="${information}">
          <span class="home-shortcut-icon" aria-hidden="true">${uiIcon(icon)}</span><b>${label}</b></button>`
      : `<button type="button" class="home-quick-action" ${label === 'Daily' && online ? 'data-social-calendar="attendance"' : `data-page="${page}"`}${label === 'Loadouts' ? ' data-home-loadouts' : ''}${label === 'Loadouts' || label === 'Squad' ? ' data-team-area="squad"' : ''} aria-label="${detail}">
          <span class="home-shortcut-icon" aria-hidden="true">${uiIcon(icon)}</span><b>${label}</b></button>`).join('')}</nav>`;
}

function homeFormation(starter: Starter, account: Account) {
  const squad = equippedSquad(account);
  const eligible = squad.filter(isRadiantBearer);
  const fallback = !squad.length && account.characters[starter.id] && isRadiantBearer(starter.id) ? [starter.id] : [];
  const bearers = (eligible.length ? eligible : fallback).slice(0, squadMemberLimit);
  const loadouts = bearers.map(id => radiantCharacterLoadout(account, id)?.loadout).filter((entry): entry is RadiantLoadout => !!entry);
  return { squad, eligible, loadouts, leader: loadouts[0] };
}

export function referenceHomeProfile(starter: Starter, account: Account | null): string {
  if (!account) {
    return `<div class="home-profile-card is-unavailable" role="status"><span class="home-profile-placeholder" aria-hidden="true">${uiIcon('squad')}</span>
      <span class="home-profile-copy"><small>Current squad leader</small><b>Unavailable</b><small>Account data could not be loaded</small></span></div>`;
  }
  const leader = homeFormation(starter, account).leader;
  if (!leader) {
    return `<button type="button" class="home-profile-card is-unavailable" data-page="team" data-team-area="squad">
      <span class="home-profile-placeholder" aria-hidden="true">${uiIcon('squad')}</span>
      <span class="home-profile-copy"><small>Current squad leader</small><b>No leader selected</b><small>Open Team to choose one</small></span></button>`;
  }
  const member = ownedCompanion(account, leader.starter);
  const bearer = getStarter(leader.starter);
  const name = characterName(leader.starter, leader.form, leader.ascension.stats === true);
  return `<button type="button" class="home-profile-card" style="--member-accent:${member.color}"
      data-page="team" data-team-area="bearers" data-team-character="${leader.starter}" aria-label="Open squad leader ${escape(name)} in Team">
    <span class="home-profile-art">${radiantAllyArt(leader)}</span>
    <span class="home-profile-copy"><small>Current squad leader · ${bearer.element}</small><b>${escape(name)}</b>
      <small>Lv.${leader.level} · Evo.${displayEvolution(leader.starter, leader.form)}</small>
      <span class="home-profile-attunement">${radiantAttunementChip(leader)}${radiantAttunementName(leader)}</span></span></button>`;
}

export function referenceHome(starter: Starter, account: Account | null, online = false): string {
  if (!account) return '<p role="alert">Home unavailable. Resolve the account error.</p>';
  const { squad, eligible, loadouts, leader } = homeFormation(starter, account);
  const completed = account.storyCompleted ?? 0;
  const encounter = storyEncounter(unlockedStoryStage(account));
  const region = storyRegions.find(entry => entry.element === encounter.element);
  const storyPercent = Math.round(completed / storyRules.stages * 100);
  const banner = getSummonBanner('standard');
  const squadCards = loadouts.map((loadout, index) => squadCard(account, loadout, index))
    .concat(Array.from({ length: squadMemberLimit - loadouts.length }, (_, index) => emptySquadSlot(loadouts.length + index))).join('');
  const storyFeature = `<article class="home-feature-slide is-active" data-home-slide="0">
    <button type="button" class="ref-panel ref-home-story home-feature-link" data-page="story">
      ${encounter.background ? `<img class="home-feature-art" src="${assetUrl(`backgrounds/${encounter.background}`)}" alt="" draggable="false" />` : ''}
      <span class="home-feature-scrim" aria-hidden="true"></span>
      <span class="home-feature-copy"><small class="home-feature-eyebrow">Continue Story · ${chapterOneTitle}</small>
        <strong>${region?.name ?? encounter.name}</strong>
        <span>Stage ${encounter.regionStage} · Enemies Lv.${encounter.level}</span>
        <span>${completed} / ${storyRules.stages} stages cleared</span>
        <span class="home-story-meter" role="meter" aria-label="Story progress" aria-valuemin="0" aria-valuemax="${storyRules.stages}" aria-valuenow="${completed}"><i style="width:${storyPercent}%"></i></span>
        <span class="home-feature-cta">Continue Story <span aria-hidden="true">&rarr;</span></span></span>
    </button>
  </article>`;
  const attendanceFeature = `<article class="home-feature-slide" data-home-slide="1" hidden>
    <div class="home-feature-link home-feature-attendance">
      <div class="home-feature-copy" data-home-attendance>
        <small class="home-feature-eyebrow">Daily login bonus</small><strong>Attendance rewards</strong>
        <p>${online ? 'Loading your attendance from the server…' : 'Sign in online to view your saved attendance and claim rewards.'}</p>
        <button type="button" class="home-feature-cta" ${online ? 'data-social-calendar="attendance"' : 'data-page="profile"'}>${online ? 'Review attendance' : 'Open Social'}</button>
      </div>
    </div>
  </article>`;
  const summonFeature = `<article class="home-feature-slide" data-home-slide="2" hidden>
    <button type="button" class="home-feature-link home-feature-summon" data-page="summon" ${banner.artwork.path ? `style="--home-feature-image:url('${assetUrl(banner.artwork.path)}')"` : ''}>
      ${banner.artwork.path ? `<img class="home-feature-art" src="${assetUrl(banner.artwork.path)}" alt="" draggable="false" />` : '<span class="home-feature-pending">Banner artwork pending</span>'}
      <span class="home-feature-scrim" aria-hidden="true"></span>
      <span class="home-feature-copy"><small class="home-feature-eyebrow">Summoning</small><strong>${escape(banner.name)}</strong>
        <span>Single draw · ${banner.cost.toLocaleString('en-US')} Null-Prismatica</span>
        <span class="home-feature-cta">View banners and rates <span aria-hidden="true">&rarr;</span></span></span>
    </button>
  </article>`;
  const warFeature = `<article class="home-feature-slide" data-home-slide="3" hidden>
    <button type="button" class="home-feature-link home-feature-war" data-page="gameplay">
      <span class="home-feature-glyph" aria-hidden="true">${uiIcon('gameplay')}</span>
      <span class="home-feature-copy"><small class="home-feature-eyebrow">Endgame activity</small><strong>Elemental War</strong>
        <span>Choose a War mode and continue your campaign.</span>
        <span class="home-feature-cta">Browse Play <span aria-hidden="true">&rarr;</span></span></span>
    </button>
  </article>`;
  const eventsFeature = `<article class="home-feature-slide" data-home-slide="4" hidden>
    <button type="button" class="home-feature-link home-feature-events" data-page="events">
      <span class="home-feature-glyph" aria-hidden="true">${uiIcon('story')}</span>
      <span class="home-feature-copy"><small class="home-feature-eyebrow">Events</small><strong>Explore live events</strong>
        <span>See currently available event activities and rewards.</span>
        <span class="home-feature-cta">View events <span aria-hidden="true">&rarr;</span></span></span>
    </button>
  </article>`;
  const leaderSkill = leader ? `<p class="home-leader-skill"><strong>Leader Skill · ${escape(radiantBearerKits[leader.starter].leader)}</strong> ${radiantLeaderText(leader)}</p>` : '';

  return `<div class="ref-screen ref-home home-dashboard">
    <section class="home-squad-panel" aria-labelledby="home-squad-heading">
      <header class="home-section-heading"><div><p class="home-feature-eyebrow">Your formation</p><h2 id="home-squad-heading">Squad</h2></div>
        <span>${loadouts.length} / ${squadMemberLimit} Element-Bearers</span><button type="button" class="home-manage-squad" data-page="team" data-team-area="squad">${uiIcon('squad')}Manage squad</button></header>
      ${squad.length > eligible.length ? `<p class="home-squad-note" role="note">${squad.length - eligible.length === 1 ? 'One saved member is' : `${squad.length - eligible.length} saved members are`} not an acquired Element-Bearer and cannot fight. Replace them in Manage squad.</p>` : ''}
      <div class="home-squad-grid" aria-label="Your squad">${squadCards}</div>${leaderSkill}
    </section>
    ${quickAccess(online)}
    <section class="home-featured" aria-label="Featured destinations">
      <div class="home-feature-carousel" data-home-carousel>${storyFeature}${attendanceFeature}${summonFeature}${warFeature}${eventsFeature}
        <button type="button" class="home-feature-arrow is-previous" data-home-carousel-step="-1" aria-label="Previous featured destination">&lsaquo;</button>
        <button type="button" class="home-feature-arrow is-next" data-home-carousel-step="1" aria-label="Next featured destination">&rsaquo;</button></div>
      <div class="home-feature-indicators" aria-label="Choose a featured destination">${[0, 1, 2, 3, 4].map(index =>
        `<button type="button" data-home-carousel-index="${index}" aria-label="Show featured destination ${index + 1}" aria-pressed="${index === 0}"></button>`).join('')}</div>
    </section>
  </div>`;
}

export function bindHomeCarousel(root: ParentNode): void {
  const slides = Array.from(root.querySelectorAll<HTMLElement>('[data-home-slide]'));
  const indicators = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-home-carousel-index]'));
  const showSlide = (requestedIndex: number): void => {
    if (!slides.length || !Number.isInteger(requestedIndex)) return;
    const activeIndex = (requestedIndex + slides.length) % slides.length;
    slides.forEach((slide, index) => {
      slide.hidden = index !== activeIndex;
      slide.classList.toggle('is-active', index === activeIndex);
    });
    indicators.forEach((indicator, index) => indicator.setAttribute('aria-pressed', String(index === activeIndex)));
  };
  root.querySelectorAll<HTMLButtonElement>('[data-home-carousel-step]').forEach(button => button.addEventListener('click', () => {
    const currentIndex = slides.findIndex(slide => !slide.hidden);
    const step = Number(button.dataset.homeCarouselStep);
    if (currentIndex >= 0 && Number.isInteger(step)) showSlide(currentIndex + step);
  }));
  indicators.forEach((indicator, index) => indicator.addEventListener('click', () => showSlide(index)));
}

export function updateHomeAttendance(root: ParentNode, view: SocialCalendarView): void {
  const host = root.querySelector<HTMLElement>('[data-home-attendance]');
  if (!host) return;
  const ordinal = Math.max(1, Math.min(view.daysInMonth, view.attendance + (view.attendedToday ? 0 : 1)));
  const first = Math.floor((ordinal - 1) / 7) * 7 + 1;
  const canClaim = !view.attendedToday && view.attendance < view.daysInMonth;
  host.innerHTML = `<small class="home-feature-eyebrow">Daily login bonus · ${escape(view.month)}</small>
    <strong>Day ${ordinal} of ${view.daysInMonth}</strong>
    <ol class="home-attendance-days" aria-label="Monthly attendance rewards, days ${first} to ${Math.min(first + 6, view.daysInMonth)}">${Array.from({ length: Math.min(7, view.daysInMonth - first + 1) }, (_, index) => {
      const day = first + index;
      const reward = day === view.attendance + 1 ? view.nextReward : attendanceReward(day, 1);
      return `<li${day <= view.attendance ? ' class="is-saved"' : ''}${day === ordinal ? ' aria-current="step"' : ''}>
        <small>Day ${day}${day <= view.attendance ? ' · Saved' : ''}</small>
        <span>${currencyIcon('fractalis')}<b>${reward.fractalis.toLocaleString('en-US')}</b></span>
        ${reward.lycalis ? `<span>${currencyIcon('lycalis')}<b>${reward.lycalis.toLocaleString('en-US')}</b></span>` : ''}
      </li>`;
    }).join('')}</ol>
    <p class="ref-sr-only">${canClaim ? `Next claim: ${escape(socialRewardText(view.nextReward))}.` : 'Saved for this reset day. Come back after the next reset.'}</p>
    <button type="button" class="home-feature-cta" data-social-calendar="attendance">${canClaim ? 'Review &amp; claim' : 'View attendance'}</button>
    <small>${canClaim ? 'Monthly base rewards; next claim includes any streak bonus.' : 'Saved for today. Come back after the next reset.'}</small>`;
}
