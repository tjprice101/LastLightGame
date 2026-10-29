import { starters, getStarter, isStarterId, type StarterId } from './content/starters';
import { characterArt, characterName } from './content/character-art';
import { elementAccents, materialArt, materialName, dungeonArt } from './content/dungeon-art';
import { conduits, conduitEffect, conduitEquipReason, conduitUpgradeCost, isConduitId, type ConduitSlots } from './content/conduits';
import { masterConduits } from './content/master-conduits';
import { characterLevelCost, characterEvolutionCost, characterEvolutionRequirement, characterLevelCap, type UpgradeCost } from './content/progression';
import { resolveFighter, formatStat, shatterGauge } from './content/combat';
import { nativeIdentities } from './content/native-identities';
import { abilityIcons } from './presentation/ability-icon';
import { uiIcon } from './presentation/ui-icon';
import { abilityStatuses, kitResource } from './presentation/ability-status';
import { readableEffect } from './presentation/effect-copy';
import { createExampleSession, memberDisplay } from './bubble-preview-model';
import { setSquad, equippedSquad, ownedCharacterInstances, maxLevelPlan, levelCharacterToMaximum, upgradeCharacter, equipConduit,
  purchaseConduit, upgradeConduit, creatureSaleOffer, creatureBatchSaleOffer, sellCurrencyCreatures, setCharacterLock,
  evolutionFodderOptions, fodderSelectionStatus, characterProtection, openMasterChest, equipMasterConduit, calamityUnlockedTier,
  summonCharacters, multiSummonCount, levelCapturedCharacter, openCalamityChest, setMachineLootFocus, type SummonDraw } from './game/account';
import { isMachineFocusRarity } from './content/machines';
import { capturedLevelCap, capturedLevelCost } from './game/character-instances';
import { creatures, getCreature, creatureLoot, creatureLore } from './content/creatures';
import { elements, infusionStageCount, dungeonStageCount, infusionModes, currencyModes, eventModes, machineModes, materialRarities } from './content/activities';
import { specialtyMaterials } from './content/infusions';
import { roseMaterials } from './content/roses';
import { currencyArt } from './presentation/currency-icon';
import { assetUrl } from './presentation/portrait';
import { mechanicalComponentIcon } from './presentation/mechanical-component-icon';
import { infusionEncounter } from './content/infusions';
import { dungeonEncounter } from './content/dungeons';
import { storyRegions, storyRules, storyEncounter, storyCreature, storyLoot, storyBossBonus, storyClearReward } from './content/story';
import { getSummonBanner, isSummonBannerId } from './content/summon-banners';
import { bannerPityLimits, bannerPercent } from './content/standard-banner';
import { calamityActivities, calamityEncounter, calamityChest, calamityLootTable, parseCalamityChestId, type CalamityTier } from './content/calamity';
import { warEncounter, warLoot, elementalWars } from './content/elemental-war';
import { activityAccess } from './game/activity-access';
import { normalizeStats, phaseZeroStatKeys, phaseZeroStatLabels, statDisplayUnit } from './content/phase-zero-stats';
import { statPreview } from './presentation/stat-preview';
import { stageLootContent, type StageLootSource } from './presentation/stage-loot';
import { worldHistory, storyPurpose, summonLore, trainingLore, machineOrigin, conduitOrigin, masterOrigin, warLore, devourerHabitats } from './content/world-lore';
import { exchangeProducts, exchangeQuantities, exchangeProduct } from './content/material-exchange';
import { purchaseExchangeMaterial } from './game/account';
import type { BubbleBattleDestination } from './bubble-battle-session';
import { parseBattleSpeed } from './presentation/battle-speed';
import type { CalamityActivityId } from './content/calamity';
import type { PlayableDungeon } from './content/dungeons';
import './bubble-preview.css';

export const screens = {
  home: ['The search for Let’s soul', 'Home'],
  team: ['Team', 'Character'],
  squad: ['Team', 'Squad'],
  bearers: ['Team', 'Element-Bearers'],
  devourers: ['Team', 'Captured Elemental-Devourers'],
  stats: ['Character', 'Stats'],
  skills: ['Character', 'Abilities'],
  growth: ['Character', 'Growth'],
  level: ['Growth', 'Level up'],
  max: ['Growth', 'Max Level'],
  evolution: ['Growth', 'Evolution'],
  conduits: ['Character', 'Equipment'],
  loadouts: ['Equipment', 'Your Conduits'],
  lore: ['Character', 'Lore'],
  play: ['Activities', 'Play'],
  story: ['The six beacons', 'Story'],
  activity: ['Play', 'Activity'],
  events: ['Play', 'Events'],
  calamity: ['Beyond Normal', 'Calamity'],
  summon: ['Element-Bearers', 'Summon'],
  inventory: ['Holdings', 'Inventory'],
  stores: ['Market', 'Stores'],
  conduitArchive: ['Collections', 'Conduit Archive'],
  chests: ['Inventory', 'Chests'],
  sale: ['Captured Elemental-Devourers', 'Sell copies'],
  machineFocus: ['Awaken the Machines', 'Focus Loot'],
  help: ['Last Light', 'Information'],
  restore: ['Conduits', 'Upgrade'],
  collections: ['Records', 'Collections'],
  archive: ['Collections', 'Archive'],
  masters: ['Collections', 'Master Archive'],
  profile: ['Player info', 'Profile'],
  friends: ['Player info', 'Friends'],
  settings: ['Preferences', 'Settings'],
  title: ['Infinity and Nothingness', 'Last Light'],
  account: ['Account', 'Sign in'],
  starter: ['The search begins', 'Choose your Element-Bearer'],
  battle: ['Story / Glasswater Reach', 'Battle'],
  results: ['Stage cleared', 'Victory'],
  rewards: ['Inventory', 'Acquired'],
} as const;
type Screen = keyof typeof screens;
type Icon = Parameters<typeof uiIcon>[0];

const host = document.querySelector<HTMLElement>('#bubble-preview');
if (!host) throw new Error('Bubble preview host is missing.');
const root = host;
const session = createExampleSession();
const account = session.account;
const availableArt = new Set(Object.keys(import.meta.glob('/public/assets/**/*.avif')).map(path =>
  path.replace('/public/assets/', '').replace(/\.avif$/, '')));
const state = {
  screen: 'home' as Screen, selected: 'ember' as StarterId, capture: null as string | null,
  get leader() { return equippedSquad(account())[0]; },
  get squad() { return equippedSquad(account()); },
  reduced: false, particles: true, music: false, banner: 'standard',
  filter: '', history: [] as Screen[],
  inventoryTab: 'materials', region: 1, storyStage: 25, activityStage: 1, calamityTier: 1 as CalamityTier,
  restoreId: conduits[0].id, fodder: [] as string[], saleCopies: [] as string[],
  inventoryFilter: '', rosterElement: '', rosterSort: 'name', archiveView: 'bearers', speed: '1',
  profileName: 'Aster', bio: 'Searching for Let’s soul.', draws: [] as SummonDraw[],
  revealItems: [] as { art: string; name: string; detail: string }[],
  saleOptions: {} as Record<string, string>,
  activityGroup: 'story', storeTab: 'conduits', exchangeCategory: 'normal',
  messages: {} as Record<string, string[]>,
  destination: { storyStage: 25 } as BubbleBattleDestination,
};
function selectedId(): string { return state.capture ?? state.selected; }
function selectedMember() { return memberDisplay(account(), selectedId()); }
function materialPath(id: string): string {
  const art = materialArt(id);
  return art ? `materials/${art.replace(/\.png$/, '')}` : '';
}
function saleSelections() { return state.saleCopies.map(id => ({ id, saleOption: state.saleOptions[id] })); }
let pendingConfirmation: (() => void) | null = null;
let camera: Animation | null = null;
const effects = document.createElement('div');
effects.className = 'interaction-effects';
effects.setAttribute('aria-hidden', 'true');
document.body.append(effects);
const motionPreference = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
function syncMotionAttribute(): void {
  if (motionPreference?.matches) document.documentElement.dataset.motion = 'reduced';
  else delete document.documentElement.dataset.motion;
}
syncMotionAttribute();
motionPreference?.addEventListener('change', event => {
  syncMotionAttribute();
  if (event.matches) { camera?.finish(); effects.replaceChildren(); }
});

function motionAllowed(): boolean {
  return !state.reduced && !motionPreference?.matches;
}
function perform(operation: () => void): void {
  try { operation(); }
  catch (error) {
    if (!(error instanceof Error)) throw error;
    console.error('Mock-up action rejected:', error);
    toast(error.message);
  }
}
function confirmAction(title: string, content: string, operation: () => void): void {
  dialog(title, `${content}<div class="dialog-actions"><button class="pill" data-action="close">Cancel</button><button class="pill primary" data-action="confirm">Confirm</button></div>`);
  pendingConfirmation = operation;
}
function inspect(id: string): void {
  if (isStarterId(id)) { state.selected = id; state.capture = null; }
  else { memberDisplay(account(), id); state.capture = id; }
  state.fodder = [];
}
function setLeader(id: string): void {
  setSquad(session.storage, [id, ...state.squad.filter(member => member !== id)].slice(0, 3));
}
function equipmentFor(): ConduitSlots {
  return account().conduitEquipment?.[selectedId()] ?? Array<null>(8).fill(null);
}
function clickFeedback(target: HTMLElement, event: MouseEvent): void {
  if (!motionAllowed()) return;
  const rect = target.getBoundingClientRect();
  const x = event.detail ? event.clientX : rect.x + rect.width / 2;
  const y = event.detail ? event.clientY : rect.y + rect.height / 2;
  const burst = document.createElement('div');
  burst.className = 'click-burst';
  burst.style.left = `${x}px`; burst.style.top = `${y}px`;
  burst.innerHTML = `<span class="click-ring"></span><span class="click-ring second"></span>${state.particles ? Array.from({ length: 12 }, (_, i) => {
    const angle = i * Math.PI / 6, distance = 35 + (i % 3) * 17;
    return `<i class="fx-particle ${i % 3 === 0 ? 'fx-star' : ''}" style="--dx:${Math.cos(angle) * distance}px;--dy:${Math.sin(angle) * distance - 12}px;--size:${i % 3 + 3}px;--spin:${i * 43}deg"></i>`;
  }).join('') : ''}`;
  (target.closest('dialog[open]') ?? effects).append(burst);
  burst.addEventListener('animationend', event => { if (event.target === burst) burst.remove(); });
  if (effects.childElementCount > 30) effects.firstElementChild?.remove();
  if (state.particles) glyphBurst(x, y, target.classList.contains('primary') || target.classList.contains('bubble') ? 12 : 7, 70, target.closest('dialog[open]'));
  if (typeof target.animate === 'function') target.animate([
    { filter: 'brightness(1)' }, { filter: `brightness(1.45) drop-shadow(0 0 14px ${elementAccents[memberDisplay(account(), state.leader).elementId]})`, offset: .3 }, { filter: 'brightness(1)' },
  ], { duration: 650, easing: 'ease-out' });
}
const glyphs = ['✦', '✧', '✶', '✺', '·'];
function glyphBurst(x: number, y: number, count: number, reach: number, host: Element | null = null, rise = 0): void {
  if (!motionAllowed() || typeof document.body.animate !== 'function') return;
  for (let i = 0; i < count; i++) {
    const spark = document.createElement('b');
    spark.className = 'fx-glyph';
    spark.textContent = glyphs[i % glyphs.length];
    spark.style.left = `${x}px`; spark.style.top = `${y}px`;
    spark.style.fontSize = `${10 + Math.random() * 14}px`;
    (host ?? effects).append(spark);
    const angle = Math.random() * Math.PI * 2, distance = reach * (.45 + Math.random() * .75);
    const dx = Math.cos(angle) * distance, dy = Math.sin(angle) * distance - rise * Math.random(), spin = Math.random() * 300 - 150;
    spark.animate([
      { opacity: 0, transform: 'translate(-50%, -50%) scale(.2) rotate(0deg)' },
      { opacity: 1, transform: `translate(calc(-50% + ${dx * .55}px), calc(-50% + ${dy * .55}px)) scale(1.15) rotate(${spin * .5}deg)`, offset: .35 },
      { opacity: 0, transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy + rise * .4}px)) scale(.3) rotate(${spin}deg)` },
    ], { duration: 750 + Math.random() * 650, delay: Math.random() * 120, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'both' })
      .addEventListener('finish', () => spark.remove(), { once: true });
    window.setTimeout(() => spark.remove(), 2200);
  }
}
function celebrate(message: string): void {
  toast(message);
  if (!motionAllowed()) return;
  const banner = document.createElement('div');
  banner.className = 'fx-banner';
  banner.textContent = `✦ ${message.replace(/\.$/, '')} ✦`;
  effects.append(banner);
  banner.addEventListener('animationend', () => banner.remove(), { once: true });
  const ring = document.createElement('div');
  ring.className = 'fx-wave';
  ring.style.left = `${innerWidth / 2}px`; ring.style.top = `${innerHeight * .42}px`;
  effects.append(ring);
  ring.addEventListener('animationend', () => ring.remove(), { once: true });
  window.setTimeout(() => { banner.remove(); ring.remove(); }, 2400);
  if (state.particles) {
    glyphBurst(innerWidth / 2, innerHeight * .42, 26, Math.min(innerWidth, 900) * .38, null, 60);
    window.setTimeout(() => glyphBurst(innerWidth * .3, innerHeight * .5, 10, 140, null, 80), 180);
    window.setTimeout(() => glyphBurst(innerWidth * .7, innerHeight * .5, 10, 140, null, 80), 300);
  }
}
type CinematicKind = 'level' | 'evolution' | 'summon' | 'conduit' | 'chest';
interface CinematicSpec { kind: CinematicKind; eyebrow: string; title: string; subtitle?: string; art?: string; fromArt?: string; tier?: 'normal' | 'gold' | 'prismatic' }
const cinematicDuration: Record<CinematicKind, number> = { level: 2100, evolution: 3300, summon: 2900, conduit: 2200, chest: 2500 };
function cinematic(spec: CinematicSpec, done: () => void): void {
  if (!motionAllowed()) { done(); return; }
  const scene = document.createElement('div');
  scene.className = `cine cine-${spec.kind} cine-${spec.tier ?? 'normal'}`;
  scene.setAttribute('role', 'presentation');
  const duration = cinematicDuration[spec.kind];
  scene.style.setProperty('--cine-duration', `${duration}ms`);
  scene.innerHTML = `<div class="cine-veil"></div><div class="cine-rays"></div><div class="cine-columns">${'<i></i>'.repeat(9)}</div>
    <div class="cine-rings"><i></i><i></i><i></i></div>${spec.kind === 'summon' ? '<div class="cine-orb"><i></i></div>' : ''}
    ${spec.fromArt ? `<div class="cine-art cine-from">${image(spec.fromArt, '')}</div>` : ''}${spec.art ? `<div class="cine-art cine-to">${image(spec.art, '')}</div>` : ''}
    <div class="cine-flash"></div><div class="cine-text"><p>${esc(spec.eyebrow)}</p><h2>${esc(spec.title)}</h2>${spec.subtitle ? `<small>${esc(spec.subtitle)}</small>` : ''}</div><span class="cine-skip">Tap to skip</span>`;
  effects.append(scene);
  root.inert = true;
  let finished = false;
  const timers: number[] = [];
  const finish = () => {
    if (finished) return;
    finished = true; timers.forEach(timer => window.clearTimeout(timer));
    root.inert = false;
    scene.classList.add('cine-out');
    window.setTimeout(() => scene.remove(), 380);
    done();
  };
  scene.addEventListener('click', finish);
  const burstAt = (delay: number, count: number, reach: number) => timers.push(window.setTimeout(() => {
    if (state.particles) glyphBurst(innerWidth / 2, innerHeight * .44, count, reach, null, 40);
  }, delay));
  const peak = spec.kind === 'evolution' ? .46 : spec.kind === 'summon' ? .55 : .3;
  burstAt(duration * peak, 34, Math.min(innerWidth, 1000) * .42);
  burstAt(duration * peak + 220, 16, 220);
  timers.push(window.setTimeout(finish, duration));
}
function evolutionTier(evolution: number): 'normal' | 'gold' | 'prismatic' { return evolution >= 6 ? 'prismatic' : evolution >= 4 ? 'gold' : 'normal'; }
const entranceTargets = ['.page-heading', '.bubble', '.category-bubble', '.glass', '.item-card', '.portrait-card', '.landscape', '.stage', '.loot-row', '.member-choice', '.friend-row',
  '.loadout-row', '.copy-chip', '.setting-row', '.theme-choice', '.chat-message', '.skill-orb', '.summon-sphere', '.tabs > button', '.action-row > .pill', '.stat-grid > div', '.reward-bubbles > *', '.sale-choice'].join(',');
function popEntrances(): void {
  if (!motionAllowed()) return;
  const main = root.querySelector('main');
  if (!main || typeof main.animate !== 'function') return;
  Array.from(main.querySelectorAll<HTMLElement>(entranceTargets)).slice(0, 90).forEach((element, index) => {
    element.style.setProperty('--ii', String(index));
    element.animate([
      { opacity: 0, scale: '.55', translate: '0 18px', filter: 'blur(4px)' },
      { opacity: 1, scale: '1.06', translate: '0 -2px', filter: 'blur(0)', offset: .6 },
      { opacity: 1, scale: '1', translate: '0 0', filter: 'blur(0)' },
    ], { duration: 620, delay: Math.min(index * 32, 900), easing: 'cubic-bezier(.2,1.25,.4,1)', fill: 'backwards' });
  });
}
function zoomTo(screen: Screen, source: HTMLElement): void {
  const main = root.querySelector<HTMLElement>('main')!;
  if (!source.classList.contains('bubble') || !motionAllowed() || typeof main.animate !== 'function') {
    navigate(screen); return;
  }
  main.getAnimations().forEach(animation => animation.cancel());
  const rect = source.getBoundingClientRect(), mainRect = main.getBoundingClientRect();
  const x = rect.x + rect.width / 2, y = rect.y + rect.height / 2;
  main.style.transformOrigin = `${x - mainRect.x}px ${y - mainRect.y}px`;
  root.inert = true;
  const portal = document.createElement('div');
  portal.className = 'bubble-portal';
  portal.style.left = `${x}px`; portal.style.top = `${y}px`;
  effects.append(portal);
  portal.addEventListener('animationend', () => portal.remove(), { once: true });
  camera = main.animate([
    { transform: 'none', opacity: 1 },
    { transform: `translate(${innerWidth / 2 - x}px, ${innerHeight / 2 - y}px) scale(3.4)`, opacity: 0 },
  ], { duration: 420, easing: 'cubic-bezier(.45,0,.2,1)', fill: 'forwards' });
  camera.addEventListener('finish', () => { camera = null; root.inert = false; navigate(screen); }, { once: true });
}

function esc(value: string | number): string {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
}
function image(path: string, alt = '', cls = ''): string {
  if (!availableArt.has(path)) return `<span class="art-pending ${cls}" role="img" aria-label="${esc(alt || 'Artwork pending')}">${uiIcon('overview')}<small>Art pending</small></span>`;
  return `<img class="${cls}" src="${import.meta.env.BASE_URL}assets/${path}.avif" alt="${esc(alt)}" draggable="false" />`;
}
function portrait(id: StarterId, evolution = 4, cls = ''): string {
  return image(`characters/${characterArt(id, evolution).art}`, getStarter(id).name, cls);
}
function button(label: string, screen: Screen, primary = false, icon?: Icon): string {
  return `<button class="pill ${primary ? 'primary' : ''}" data-screen="${screen}">${icon ? uiIcon(icon) : ''}${label}</button>`;
}
function bubble(label: string, detail: string, screen: Screen, icon: Icon, index = 0): string {
  return `<button class="bubble orbit-${index}" data-screen="${screen}" style="--delay:${index * -.7}s">
    <span class="bubble-symbol">${uiIcon(icon)}</span><strong>${label}</strong><small>${detail}</small></button>`;
}
function tag(text: string): string { return `<span class="tag">${text}</span>`; }
function heading(screen = state.screen): string {
  return `<header class="page-heading"><p class="eyebrow">${screens[screen][0]}</p><h1 tabindex="-1">${screens[screen][1]}</h1></header>`;
}
function glass(title: string, content: string, cls = ''): string {
  return `<section class="glass ${cls}"><h2>${title}</h2>${content}</section>`;
}
function meter(value: number, label: string): string {
  return `<div class="meter" role="meter" aria-label="${esc(label)}" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="100"><i style="width:${value}%"></i></div>`;
}
function balance(): string {
  return `<div class="wallet">${image('currencies/fractalis')}<span>${account().fractalis.toLocaleString()}<small>Prismatica</small></span>
    <span class="wallet-divider"></span>${image('currencies/lycalis')}<span>${account().lycalis.toLocaleString()}<small>Null-Prismatica</small></span></div>`;
}
function personCard(id: StarterId, index: number, silhouette = false): string {
  const person = memberDisplay(account(), id);
  return `<button class="portrait-card ${silhouette ? 'undiscovered' : ''}" data-person="${id}">
    <span class="card-number">${String(index + 1).padStart(2, '0')}</span>${image(person.art, person.fullName)}
    <span class="portrait-caption"><small>${silhouette ? 'Undiscovered' : person.element}</small><strong>${person.name}</strong>
    <span>${silhouette ? 'Unknown form' : `Lv.${person.progress.level} / ${person.rarity}`}</span></span></button>`;
}
function itemCard(path: string, name: string, detail: string, action = 'details', silhouette = false): string {
  return `<button class="item-card ${silhouette ? 'undiscovered' : ''}" data-action="${action}" data-name="${esc(name)}">
    <span class="item-art">${image(path, name)}</span><strong>${esc(name)}</strong><small>${esc(detail)}</small></button>`;
}
function squadRail(): string {
  return `<div class="squad-rail"><span class="rail-label">YOUR SQUAD</span>${state.squad.map(id =>
    `<button class="mini-person" data-person="${id}">${image(memberDisplay(account(), id).art, memberDisplay(account(), id).fullName)}<span>${esc(memberDisplay(account(), id).name)}<small>${state.leader === id ? 'Leader' : 'Member'}</small></span></button>`).join('')}
    ${button('Edit squad', 'squad', false, 'squad')}</div>`;
}
function characterCycle(): string {
  return `<div class="character-cycle"><button class="tool-circle" data-action="cycle" data-step="-1" aria-label="Previous character">${uiIcon('back')}</button>
    <button class="tool-circle next-character" data-action="cycle" data-step="1" aria-label="Next character">${uiIcon('back')}</button></div>`;
}
function hero(id: string, size = ''): string {
  const person = memberDisplay(account(), id);
  return `<div class="portrait-universe ${size}"><div class="orbit-ring"></div><div class="orbit-ring inner"></div>
    <span class="orbit-star star-one" aria-hidden="true">✦</span><span class="orbit-star star-two" aria-hidden="true">✧</span>
    ${image(person.art, person.fullName, 'hero-art')}<div class="hero-caption"><p class="eyebrow">${person.element} / ${person.role}</p>
    <h2>${esc(person.name)}</h2><p>${esc(person.fullName)}</p><div class="tags">${tag('★'.repeat(person.stars))}${tag(person.role)}${tag(`${person.rarity} / Lv.${person.progress.level}`)}</div></div></div>`;
}
function home(): string {
  return `<section class="home-scene"><div class="home-intro"><p class="eyebrow">Last Light</p><h1 tabindex="-1">The search<br>continues<span>.</span></h1>
    <p>Restore the beacons. Reopen the roads.<br>Find Let’s soul before Rise’s seekers find hers.</p>${button('Continue story', 'story', true, 'story')}
    <div class="chapter-note"><span class="tiny-orb"></span><span>${storyRegions[Math.min(storyRegions.length - 1, Math.floor((account().storyCompleted ?? 0) / storyRules.regionStages))].name}<small>${account().storyCompleted} / ${storyRules.stages} stages cleared</small></span></div></div>
    <div class="home-orbit">${hero(state.leader)}${bubble('Team', 'Squad & characters', 'team', 'squad', 0)}
    ${bubble('Play', 'Activities', 'play', 'gameplay', 1)}${bubble('Summon', 'Element-Bearers', 'summon', 'summon', 2)}
    ${bubble('Inventory', 'Materials & Conduits', 'inventory', 'inventory', 3)}${bubble('Collections', 'Forms & discoveries', 'collections', 'story', 4)}
    ${bubble('Stores', 'Exchange & Conduits', 'stores', 'inventory', 5)}</div>
    <div class="home-footnote">${squadRail()}</div></section>`;
}
function team(): string {
  const id = selectedId();
  return `${heading()}<div class="character-layout"><section class="character-orbit">${hero(id)}${characterCycle()}
    ${bubble('Stats', 'Effective attributes', 'stats', 'overview', 0)}${bubble('Abilities', 'Skills & passive', 'skills', 'summon', 1)}
    ${bubble('Growth', 'Level & evolve', 'growth', 'evolution', 2)}${bubble('Conduits', `${equipmentFor().filter(Boolean).length} of 8 equipped`, 'conduits', 'inventory', 3)}
    ${bubble('Your Conduits', 'Inspect & upgrade', 'loadouts', 'squad', 4)}${bubble('Lore', 'Origin & vow', 'lore', 'story', 5)}
    </section></div>${squadRail()}<div class="action-row character-footer">${button('All Element-Bearers', 'bearers')}${button('Elemental-Devourers', 'devourers')}
    <button class="pill primary" data-action="lead" ${id === state.leader ? 'disabled' : ''}>${id === state.leader ? 'Squad leader' : `Make ${esc(selectedMember().name)} leader`}</button>
    <button class="pill" data-action="lock">${characterProtection(account(), id).locked ? 'Unlock' : 'Lock'}</button></div>`;
}
function collectionGrid(devourers = false, archive = false): string {
  if (archive) return archiveGrid();
  const ids = (devourers ? (account().capturedCharacters ?? []).map(copy => copy.instanceId) : starters.filter(person => account().characters[person.id]).map(person => person.id))
    .filter(id => !state.rosterElement || memberDisplay(account(), id).elementId === state.rosterElement)
    .sort((a, b) => state.rosterSort === 'level' ? memberDisplay(account(), b).progress.level - memberDisplay(account(), a).progress.level : state.rosterSort === 'element'
      ? memberDisplay(account(), a).element.localeCompare(memberDisplay(account(), b).element) : memberDisplay(account(), a).name.localeCompare(memberDisplay(account(), b).name));
  const cards = devourers
    ? ids.map((id, i) => {
      const copy = account().capturedCharacters!.find(entry => entry.instanceId === id)!;
      const person = memberDisplay(account(), copy.instanceId), protection = characterProtection(account(), copy.instanceId);
      return `<button class="portrait-card" data-person="${copy.instanceId}" data-element="${person.elementId}">
        ${image(person.art, person.name)}<span class="portrait-caption"><small>${person.element} / ${'★'.repeat(person.stars)}</small><strong>${esc(person.name)}</strong>
        <span>Lv.${person.progress.level} / Copy ${i + 1}${protection.locked ? ' / Locked' : ''}${protection.inSquad ? ' / In squad' : ''}</span></span></button>`;
    }).join('')
    : ids.filter(isStarterId).map((id, i) => personCard(id, i)).join('');
  return `${heading()}<div class="toolbar"><div class="tabs">${button('Element-Bearers', archive ? 'archive' : 'bearers')}${button('Elemental-Devourers', 'devourers')}</div>
    <label class="search">${uiIcon('overview')}<input id="card-search" type="search" placeholder="Search by name" value="${esc(state.filter)}" aria-label="Filter collection" /></label>
    ${tag(`${devourers ? account().capturedCharacters?.length ?? 0 : Object.keys(account().characters).length} owned`)}</div>
    <div class="toolbar roster-filters"><label class="field">Element<select id="roster-element"><option value="">All elements</option>${elements.map(entry => `<option value="${entry.id}" ${state.rosterElement === entry.id ? 'selected' : ''}>${entry.name}</option>`).join('')}</select></label>
    <label class="field">Sort<select id="roster-sort">${[['name','Name'],['level','Level'],['element','Element']].map(([value,label]) => `<option value="${value}" ${state.rosterSort === value ? 'selected' : ''}>${label}</option>`).join('')}</select></label></div>
    <div class="card-grid searchable">${cards}</div><p class="empty-search" ${ids.length ? 'hidden' : ''}>No matching entries. Try another name.</p>
    ${devourers ? `<div class="action-row">${button('Multi-select sale', 'sale')}${button('Your squad', 'squad')}</div>` : ''}`;
}
function squad(): string {
  return `${heading()}<p class="page-subtitle">Choose up to three squad members. The first member leads.</p>
    <div class="formation">${Array.from({ length: 3 }, (_, i) => {
      const id = state.squad[i];
      const person = id ? memberDisplay(account(), id) : null;
      return `<section class="glass formation-slot"><span class="eyebrow">0${i + 1} / ${i ? 'Squad member' : 'Squad leader'}</span>${person ? image(person.art, person.fullName) : `<div class="empty-member">${uiIcon('squad')}</div>`}
      <h2>${person ? esc(person.name) : 'Empty slot'}</h2><p>${person ? `${person.element} / Lv.${person.progress.level}` : 'Choose an owned squad member'}</p>
      <div class="action-row"><button class="pill" data-action="choose-member" data-slot="${i}">${id ? 'Change' : 'Add'} member</button>
      ${id && state.squad.length > 1 ? `<button class="pill" data-action="remove-member" data-slot="${i}">Remove</button>` : ''}</div>
      ${i && id ? `<button class="pill" data-action="promote" data-person-id="${id}">Make leader</button>` : ''}</section>`;
    }).join('')}</div>
    <div class="action-row">${button('Your Conduits', 'loadouts')}<button class="pill primary" data-action="formation">Save formation ${uiIcon('squad')}</button></div>`;
}
function detailShell(content: string): string {
  const person = selectedMember(), cap = state.capture ? capturedLevelCap : characterLevelCap(person.progress.evolution);
  const starter = isStarterId(person.id) ? getStarter(person.id) : null;
  return `${heading()}<div class="focus-workspace"><section class="focus-context glass">
    <div class="focus-art">${image(person.art, person.fullName)}</div>
    <div class="focus-identity"><p class="eyebrow">${person.element} / ${esc(person.role)}</p><h2>${esc(person.fullName)}</h2>
    <p class="focus-stars" aria-label="${person.stars} stars">${'\u2605'.repeat(person.stars)}</p>
    <div class="tags">${tag(person.rarity)}${tag(`Lv.${person.progress.level} / ${cap}`)}${starter ? tag(`Form ${person.progress.evolution} / 6`) : tag('Fixed form')}${starter ? tag(starter.weapon) : ''}</div></div>
    <div class="focus-cycle"><button class="tool-circle" data-action="cycle" data-step="-1" aria-label="Previous character">${uiIcon('back')}</button>
    <button class="tool-circle next-character" data-action="cycle" data-step="1" aria-label="Next character">${uiIcon('back')}</button></div>${button('Character art', 'team', false, 'back')}</section>
    <div class="detail-content">${content}</div></div>`;
}
function stats(): string {
  const person = selectedMember(), stats = normalizeStats(person.fighter.stats), protection = characterProtection(account(), person.id);
  const equipped = equipmentFor().filter(Boolean).length, master = state.capture ? null : masterConduits.find(entry => entry.id === account().masterEquipment?.[state.selected]);
  return detailShell(`${glass('Effective stats', `<p class="muted">Includes equipped Conduits, their upgrade levels and the equipped Master.</p><div class="stat-grid detail-stats">${phaseZeroStatKeys.map(key =>
    `<div><small>${phaseZeroStatLabels[key]}</small><strong>${formatStat(stats[key] * (statDisplayUnit(key) === '%' ? 100 : 1))}${statDisplayUnit(key)}</strong></div>`).join('')}</div>`)}
    ${glass('Details', `<dl class="detail-facts"><div><dt>Element</dt><dd>${person.element}</dd></div><div><dt>Role</dt><dd>${esc(person.role)}</dd></div>
      <div><dt>Rarity</dt><dd>${person.rarity} / ${'\u2605'.repeat(person.stars)}</dd></div><div><dt>Conduits</dt><dd>${equipped} of 8 equipped${master ? ` / ${esc(master.name)}` : ''}</dd></div>
      <div><dt>Squad</dt><dd>${state.leader === person.id ? 'Leader' : protection.inSquad ? 'Member' : 'Not in squad'}</dd></div><div><dt>Protection</dt><dd>${protection.locked ? 'Locked' : 'Unlocked'}</dd></div></dl>
      <div class="action-row">${button('Equipment', 'conduits', true, 'inventory')}${button('Growth', 'growth', false, 'evolution')}</div>`, 'detail-facts-panel')}`);
}
function abilityCard(key: 'passive' | 'skill1' | 'skill2' | 'ultimate', label: string, icon: string, name: string, description: string, statuses: string, cost: string): string {
  return `<button class="glass skill-card" data-action="ability" data-ability="${key}" data-name="${esc(label)}">
    <span class="skill-orb">${icon}</span><span class="skill-copy"><small>${label}</small><strong class="skill-name">${esc(name)}</strong>${statuses}
    <span class="ability-summary">${readableEffect(description)}</span><span class="skill-cost">${cost}</span></span></button>`;
}
function skills(): string {
  const person = selectedMember(), kit = person.fighter;
  if (state.capture) {
    return detailShell(`<h2 class="detail-subhead">Retained abilities</h2><p class="muted detail-note">Captured Elemental-Devourers keep their defeated form and authored abilities. Manual skills share the Elemental Gauge; missing slots are unavailable. They cannot evolve.</p>
      <div class="skill-grid">${(['skill1', 'skill2', 'ultimate'] as const).filter(key => kit.abilities[key]).map(key => abilityCard(key, key === 'ultimate' ? 'Ultimate' : key === 'skill1' ? 'Skill 1' : 'Skill 2',
        uiIcon('summon'), kit.abilities[key].name, kit.abilities[key].description, abilityStatuses(kit.abilities[key].strength),
        `${shatterGauge.costs[key]} Gauge${kit.abilities[key].cooldown ? ` / ${kit.abilities[key].cooldown}-turn cooldown` : ''}`)).join('')}</div>`);
  }
  const icons = abilityIcons[state.selected];
  return detailShell(`<div class="skill-grid">${abilityCard('passive', 'Passive', image(`abilities/${icons.passive}`), kit.passive.name, kit.passive.description, kitResource(kit, state.selected), 'Automatic while alive / no Gauge')}
    ${(['skill1', 'skill2', 'ultimate'] as const).map((key, i) => abilityCard(key, ['Skill 1', 'Skill 2', 'Last Flare'][i], image(`abilities/${icons[key]}`), kit.abilities[key].name, kit.abilities[key].description,
      abilityStatuses(kit.abilities[key].strength, state.selected, key),
      `${shatterGauge.costs[key]} Elemental Gauge${kit.abilities[key].cooldown ? ` / ${kit.abilities[key].cooldown}-turn cooldown` : ''}${key === 'ultimate' ? ' / Recover next turn' : ''}`)).join('')}</div>`);
}
function growth(): string {
  const person = selectedMember(), cap = state.capture ? capturedLevelCap : characterLevelCap(person.progress.evolution);
  return detailShell(`<div class="growth-options">${bubble('Level up', 'One step at a time', 'level', 'level', 0)}
    ${bubble('Max Level', 'Affordable levels', 'max', 'overview', 1)}${state.capture ? '' : bubble('Evolution', 'Next form', 'evolution', 'evolution', 2)}</div>
    ${glass('Growth', `<div class="spread"><h2>Level ${person.progress.level}</h2><span>Level cap ${cap}</span></div>${meter(person.progress.level / cap * 100, 'Level progress')}<p>${state.capture ? 'Fixed form. Leveling preserves retained abilities.' : 'Reach the current level cap to evolve. Level is preserved; costs and Evolution Value are reviewed before confirmation.'}</p>`)}`);
}
function costRows(cost: UpgradeCost): string {
  return `<div class="cost-list">${[['fractalis', cost.fractalis], ...Object.entries(cost.materials)].map(([key, amount]) => {
    const id = String(key), owned = id === 'fractalis' ? account().fractalis : account().materials[id] ?? 0;
    return `<div class="${owned < Number(amount) ? 'missing' : 'sufficient'}">${image(id === 'fractalis' ? 'currencies/fractalis' : materialPath(id), id === 'fractalis' ? 'Prismatica' : materialName(id))}
      <span>${esc(id === 'fractalis' ? 'Prismatica' : materialName(id))}<small>${owned.toLocaleString()} owned</small></span><strong>${Number(amount).toLocaleString()}</strong></div>`;
  }).join('')}</div>`;
}
function upgrade(mode: 'level' | 'max' | 'evolution'): string {
  const person = selectedMember(), evo = mode === 'evolution', progress = person.progress;
  const cap = state.capture ? capturedLevelCap : characterLevelCap(progress.evolution);
  if (evo && (state.capture || progress.evolution === 6)) return detailShell(glass('Evolution', `<p>${state.capture ? 'Captured Elemental-Devourers cannot evolve.' : 'Final form reached.'}</p>${button('Growth', 'growth')}`));
  const plan = maxLevelPlan(account(), selectedId());
  const copy = account().capturedCharacters?.find(entry => entry.instanceId === state.capture);
  const cost = evo ? characterEvolutionCost(state.selected, progress) : mode === 'max' ? plan.cost
    : progress.level < cap ? copy ? capturedLevelCost(copy) : characterLevelCost(state.selected, progress) : { fractalis: 0, materials: {} };
  const next = { ...progress, level: evo ? progress.level : mode === 'max' ? plan.targetLevel : Math.min(cap, progress.level + 1), evolution: progress.evolution + (evo ? 1 : 0) };
  const after = copy ? memberDisplay({ ...account(), capturedCharacters: account().capturedCharacters?.map(entry => entry.instanceId === copy.instanceId ? { ...entry, level: next.level } : entry) }, copy.instanceId).fighter.stats
    : resolveFighter(state.selected, next, equipmentFor(), account().conduitUpgrades, account().masterEquipment?.[state.selected] ?? undefined).stats;
  const options = evo ? evolutionFodderOptions(account(), person.elementId, progress.evolution, state.selected) : [];
  const required = evo ? characterEvolutionRequirement(state.selected, progress.evolution).fodderValue : 0;
  const fodder = fodderSelectionStatus(options.filter(entry => state.fodder.includes(entry.copy.instanceId)).map(entry => entry.value), required);
  const reason = evo && progress.level < cap ? `Reach level ${cap} to evolve.` : !evo && next.level === progress.level ? 'Level cap reached or no additional levels affordable.'
    : Object.entries(cost.materials).some(([id, count]) => (account().materials[id] ?? 0) < count) || cost.fractalis > account().fractalis ? 'Insufficient resources.'
      : required && !fodder.ready ? fodder.surplus ? 'Remove surplus copies.' : `Choose ${required} Evolution Value.` : '';
  return `${heading()}<div class="upgrade-layout"><section class="glass upgrade-portrait">${image(evo ? `characters/${characterArt(state.selected, next.evolution).art}` : person.art, person.fullName)}
    <h2>${esc(evo && !state.capture ? characterName(state.selected, next.evolution) : person.fullName)}</h2><p>${evo ? `Form ${progress.evolution} → ${next.evolution}` : `Lv.${progress.level} → ${next.level} / Cap ${cap}`}</p>${button('Growth overview', 'growth')}</section>
    ${glass('Stat changes & cost', `<div class="stat-grid compact upgrade-stat-preview">${statPreview(person.fighter.stats, after)}</div><h3>${mode === 'max' ? 'Total affordable leveling cost' : 'Required resources'}</h3>${costRows(cost)}
      <div class="upgrade-confirm"><p role="status">${reason || 'Ready to confirm.'}</p><button class="pill primary full" data-action="upgrade" data-mode="${mode}" ${reason ? 'disabled' : ''}>${evo ? 'Evolve' : mode === 'max' ? 'Confirm leveling' : 'Level up'} ${uiIcon('evolution')}</button></div>`, 'upgrade-review')}
    ${evo && required ? glass('Choose Evolution Value', `<p class="muted">Each copy contributes its form value. Locked, squad and equipped copies cannot be consumed.</p><div class="devourer-picker">${options.map(entry =>
      `<button class="copy-chip" data-action="copy" data-copy="${entry.copy.instanceId}" aria-pressed="${state.fodder.includes(entry.copy.instanceId)}" ${entry.eligible ? '' : 'disabled'}>
      ${image(entry.creature.art ? `enemies/${entry.creature.art}` : '', entry.creature.name)}<span>${esc(entry.creature.name)}<small>Copy ${entry.index} / Value ${entry.value}${entry.reasons.length ? ` / ${esc(entry.reasons.join(', '))}` : ''}</small></span><i>+</i></button>`).join('')}</div>
      <div class="spread"><strong id="copy-count">${fodder.total} / ${required} Evolution Value</strong><span>${state.fodder.length} selected</span></div>`, 'fodder-panel') : ''}</div>`;
}
function equipment(): string {
  return detailShell(`${glass('Eight places for possibility', `<div class="equipment-grid">${equipmentFor().map((id, i) => {
    const conduit = conduits.find(entry => entry.id === id);
    return `<button class="item-card equipment-slot" data-action="equipment" data-slot="${i}"><span class="item-art">${conduit ? image(`conduits/${id}`, conduit.name) : uiIcon('inventory')}</span>
      <strong>${conduit?.name ?? `Slot ${i + 1}`}</strong><small>${conduit ? `${conduit.rarity} / Lv.${account().conduitUpgrades?.[conduit.id] ?? 0}` : 'Empty / choose Conduit'}</small>${conduit ? `<p class="slot-effect">${readableEffect(conduitEffect(conduit, account().conduitUpgrades?.[conduit.id] ?? 0))}</p>` : ''}</button>`;
  }).join('')}</div>`)}
    ${glass('Personal Master', state.capture ? '<p>Master Conduits are exclusive to their matching Element-Bearer.</p>' : `<div class="master-slot">${(() => {
      const master = masterConduits.find(entry => entry.id === account().masterEquipment?.[state.selected]);
      return `${master ? image(master.art.replace(/\.png$/, ''), master.name) : uiIcon('inventory')}<div><h3>${master?.name ?? 'Empty Master slot'}</h3><p>${esc(master?.effect ?? 'Equip one owned, character-specific Master separately from the eight ordinary slots.')}</p></div>`;
    })()}<button class="pill" data-action="master-picker">Choose Master</button></div>`)}${button('Your Conduits', 'loadouts')}`);
}
const activityCards: readonly [string, string, string, Screen][] = [
  ['story-glasswater-reach-arena', 'Story', `Six regions / ${storyRules.stages} stages`, 'story'],
  ...elements.map(entry => [dungeonArt[entry.id]!.slug, entry.dungeon, `${entry.name} / ${dungeonStageCount} stages / Lv.38–120`, 'activity'] as [string, string, string, Screen]),
  ...[...infusionModes, ...currencyModes, ...machineModes].map(entry =>
    [`${entry.id}-arena`, entry.name, `${entry.stages} stages / Lv.${entry.startingLevel}–120`, 'activity'] as [string, string, string, Screen]),
  ...elementalWars.map(entry => [`elemental-war-${entry.character}-arena`, entry.name, 'Elemental War / 10 stages / Lv.90–140', 'activity'] as [string, string, string, Screen]),
  ['grassy-field', 'Training', 'An endless way to practice', 'activity'],
];
let selectedActivity = 'Flaming Depths';
const activityGroups = [
  ['story', 'Story', `Six regions · ${storyRules.stages} stages`],
  ['training', 'Training', 'Endless waves · Prismatica'],
  ['dungeons', 'Elemental dungeons', 'Upgrade materials'],
  ['infusion', 'Evolution infusion', 'Soar & Delve'],
  ['machines', 'Awaken the Machines', 'Conduits & components'],
  ['war', 'Elemental War', 'Rival challengers'],
  ['currency', 'Currency farms', 'Prismatica & Null-Prismatica'],
  ['events', 'Events', 'Crimson Roses'],
] as const;
function categoryCards() {
  return activityCards.filter(([, name]) => state.activityGroup === 'story' ? name === 'Story' : state.activityGroup === 'training' ? name === 'Training'
    : state.activityGroup === 'dungeons' ? elements.some(entry => entry.dungeon === name)
      : state.activityGroup === 'infusion' ? infusionModes.some(entry => entry.name === name)
        : state.activityGroup === 'machines' ? name === 'Awaken the Machines' : state.activityGroup === 'war' ? elementalWars.some(entry => entry.name === name)
          : state.activityGroup === 'currency' ? currencyModes.some(entry => entry.name === name) : false);
}
function cardRewards(name: string): string[] {
  const dungeon = elements.find(entry => entry.dungeon === name);
  if (dungeon) return ['fractalis', ...materialRarities.map(rarity => `${dungeon.id}-${rarity.toLowerCase()}`)];
  const infusion = infusionModes.find(entry => entry.name === name);
  if (infusion) return ['fractalis', 'lycalis', ...specialtyMaterials.filter(item => item.id.startsWith(`${infusion.id}-`) && !item.id.endsWith('-weapon')).map(item => item.id)];
  if (name === 'Awaken the Machines') return ['mechanical-components', 'fractalis'];
  if (name === 'Crownfall Treasury' || name === 'Training') return ['fractalis'];
  if (name === 'Passion of Crimson Roses') return ['fractalis', ...roseMaterials.map(material => material.id)];
  return ['fractalis', 'lycalis'];
}
function rewardChips(ids: readonly string[]): string {
  return `<span class="reward-chips" aria-label="Rewards: ${esc(ids.map(lootName).join(', '))}">${ids.map(id => {
    if (id === 'mechanical-components') return `<i title="${esc(lootName(id))}">${mechanicalComponentIcon()}</i>`;
    const src = id === 'fractalis' || id === 'lycalis' ? currencyArt(id) : materialArt(id) ? assetUrl(`materials/${materialArt(id)}.png`) : '';
    return `<i title="${esc(lootName(id))}">${src ? `<img src="${src}" alt="" loading="lazy">` : ''}</i>`;
  }).join('')}</span>`;
}
function landscape(art: string, name: string, detail: string, screen: Screen): string {
  return `<button class="landscape" data-screen="${screen}" data-activity="${esc(name)}">${image(`backgrounds/${art}`, '')}
    <span class="landscape-copy"><small>${detail}</small><strong>${name}</strong>${rewardChips(cardRewards(name))}</span><span class="round-arrow">${uiIcon('back')}</span></button>`;
}
function play(): string {
  const group = activityGroups.find(entry => entry[0] === state.activityGroup)!;
  const description = state.activityGroup === 'story' ? storyPurpose : state.activityGroup === 'training' ? trainingLore
    : state.activityGroup === 'machines' ? machineOrigin : state.activityGroup === 'war' ? warLore
      : state.activityGroup === 'infusion' ? 'Obtain specialty materials and capture fixed-form Elemental-Devourers for your squad or Evolution Value.'
        : state.activityGroup === 'dungeons' ? 'Obtain materials for matching Element-Bearers. Choose an element, then an unlocked stage.'
          : state.activityGroup === 'currency' ? 'Crownfall Treasury supplies Prismatica. Rosethorn Sanctuary supplies Null-Prismatica.' : devourerHabitats.roses;
  return `${heading()}<nav class="activity-categories" aria-label="Activity categories">${activityGroups.map(([id, name, detail], index) =>
    `<button class="category-bubble ${state.activityGroup === id ? 'selected' : ''}" data-action="activity-group" data-group="${id}" aria-pressed="${state.activityGroup === id}" style="--delay:${index * -.8}s"><span>${uiIcon(id === 'story' ? 'story' : id === 'events' ? 'events' : 'gameplay')}</span><strong>${name}</strong><small>${detail}</small></button>`).join('')}</nav>
    <section class="activity-category-content"><div class="section-heading"><div><p class="eyebrow">${group[2]}</p><h2>${group[1]}</h2></div></div><p class="page-subtitle category-description">${esc(description)}</p>
    <div class="activity-grid">${state.activityGroup === 'events' ? landscape('roses-arena', 'Passion of Crimson Roses', '35 stages · Lv.80–140 · Rosethorn materials', 'activity') : categoryCards().map(args => landscape(...args)).join('')}</div></section>`;
}
function story(): string {
  const region = storyRegions[state.region], first = state.region * storyRules.regionStages + 1;
  const stage = state.storyStage, encounter = storyEncounter(stage);
  const unlocked = Math.min(storyRules.stages, (account().storyCompleted ?? 0) + 1);
  const clear = storyClearReward(stage > (account().storyCompleted ?? 0));
  return `${heading()}<div class="story-layout"><section class="world-map glass">${image('backgrounds/story-world-map', 'The six regions of Last Light')}
    <div class="map-nodes">${storyRegions.map((entry, i) =>
      `<button class="map-node node-${i} ${i === state.region ? 'current' : ''}" data-action="region" data-region="${i}" aria-pressed="${i === state.region}"><span>${unlocked > (i + 1) * storyRules.regionStages ? '✓' : i + 1}</span><strong>${entry.name}</strong></button>`).join('')}</div></section>
    ${glass(region.name, `<p class="eyebrow">Region ${state.region + 1} / ${elements.find(entry => entry.id === region.element)!.name}</p><p>${esc(region.introduction)}</p>
    <div class="spread"><span>Region progress</span><strong>${Math.max(0, Math.min(storyRules.regionStages, (account().storyCompleted ?? 0) - first + 1))} / ${storyRules.regionStages}</strong></div>
    <div class="stage-grid">${Array.from({ length: storyRules.regionStages }, (_, i) => {
      const current = first + i;
      const entry = storyEncounter(current), done = current <= (account().storyCompleted ?? 0);
      return stageButton('story-stage', current, String(current), current === stage, current > unlocked, done, entry.level, Boolean(entry.boss));
    }).join('')}</div><h3>Stage ${stage} / Lv.${encounter.level}${encounter.boss ? ' / Boss' : ''}</h3>
    <div class="loot-pool">${stageLootContent({ kind: 'story' }, stage, account())}</div><button class="pill" data-action="loot-rates" data-source="story">Drop rates</button><p>Stage clear: ${clear.fractalis} Prismatica${clear.lycalis ? ` + ${clear.lycalis} Null-Prismatica (first clear)` : ' (replay)'}</p>
    ${encounter.boss && stage > (account().storyCompleted ?? 0) ? `<p>First regional clear: ${storyBossBonus(stage).fractalis} Prismatica + ${storyBossBonus(stage).lycalis} Null-Prismatica.</p>` : ''}
    <button class="pill primary" data-screen="battle" ${stage > unlocked ? 'disabled' : ''}>${stage > unlocked ? 'Stage locked' : stage <= (account().storyCompleted ?? 0) ? 'Replay stage' : 'Enter stage'}</button>`)}</div>`;
}
function stageButton(action: string, value: number, label: string, current: boolean, locked: boolean, cleared: boolean, level: number | undefined, boss: boolean): string {
  return `<button class="stage ${current ? 'current' : ''} ${boss ? 'boss' : ''} ${cleared ? 'cleared' : ''}" data-action="${action}" data-stage="${value}" ${locked ? 'disabled' : ''} aria-pressed="${current}"
    aria-label="Stage ${label}${level ? `, level ${level}` : ''}${boss ? ', boss' : ''}${cleared ? ', cleared' : ''}${locked ? ', locked' : ''}">${boss ? '<i class="stage-crown" aria-hidden="true">\u265B</i>' : ''}<b>${label}</b>${level ? `<small>Lv.${level}</small>` : ''}${cleared ? '<i class="stage-check" aria-hidden="true">\u2713</i>' : ''}</button>`;
}
function lootName(id: string): string {
  if (id === 'fractalis') return 'Prismatica';
  if (id === 'lycalis') return 'Null-Prismatica';
  if (id === 'mechanical-components') return 'Broken Mechanical Components';
  if (id.startsWith('capture:')) return `Capture ${getCreature(id.slice(8)).name}`;
  if (isConduitId(id)) return conduits.find(entry => entry.id === id)!.name;
  if (id === 'grand-master-chest') return "Machine's Master Chest";
  return materialName(id);
}
function lootRows(rows: readonly { id: string; minimum: number; maximum: number; chance: number; note?: string }[]): string {
  return `<div class="loot-table" role="table" aria-label="Rewards per defeated enemy"><div class="loot-row loot-heading" role="row"><strong>Per enemy</strong><strong>Amount</strong><strong>Chance</strong></div>${rows.map(row =>
    `<div class="loot-row" role="row"><span>${esc(lootName(row.id))}${row.note ? `<small>${esc(row.note)}</small>` : ''}</span><strong>${row.minimum === row.maximum ? row.minimum.toLocaleString() : `${row.minimum.toLocaleString()}–${row.maximum.toLocaleString()}`}</strong><span>${row.chance === 0 ? '0%' : bannerPercent(row.chance)}</span></div>`).join('')}</div>`;
}
function activity(calamity = false): string {
  const dungeon = elements.find(entry => entry.dungeon === selectedActivity);
  const mode = [...infusionModes, ...currencyModes, ...eventModes, ...machineModes].find(entry => entry.name === selectedActivity);
  const war = elementalWars.find(entry => entry.name === selectedActivity);
  const activityId = dungeon?.id ?? mode?.id ?? 'infernic';
  const stage = state.activityStage, tier = state.calamityTier;
  const encounter = calamity ? calamityEncounter(activityId, tier) : dungeon ? dungeonEncounter(dungeon.id, stage) : mode ? infusionEncounter(mode.id, stage) : war ? warEncounter(war.character, stage) : null;
  const stages = calamity ? 3 : dungeon ? dungeonStageCount : mode ? infusionStageCount(mode.id) : war ? 10 : 1;
  const unlocked = calamity ? calamityUnlockedTier(account(), activityId) : dungeon ? account().dungeonStages[dungeon.id] ?? 1
    : mode ? account().infusionStages[mode.id] ?? 1 : war ? account().warStages?.[war.character] ?? 1 : 1;
  const access = activityAccess(account(), calamity ? { kind: 'calamity', activity: activityId, tier } : dungeon ? { kind: 'dungeon', element: dungeon.id, stage }
    : mode ? { kind: 'infusion', mode: mode.id, stage } : war ? { kind: 'war', character: war.character, stage } : { kind: 'training' });
  const art = calamity ? `backgrounds/calamity-arena-ex-${tier}` : encounter && 'background' in encounter && encounter.background ? `backgrounds/${encounter.background.replace(/\.png$/, '')}` : 'backgrounds/grassy-field';
  const chest = calamity ? calamityChest(activityId, tier) : null;
  const source: StageLootSource | null = dungeon ? { kind: 'dungeon', element: dungeon.id } : mode ? { kind: 'infusion', mode: mode.id } : war ? { kind: 'war', character: war.character } : null;
  return `${heading()}<div class="activity-detail"><section class="activity-scenery glass">${image(art)}
    <div><p class="eyebrow">${calamity ? `Calamity EX+${tier}` : 'Normal'}</p><h2>${esc(selectedActivity)}</h2><p>${encounter ? `Lv.${encounter.level}${calamity || ('boss' in encounter && encounter.boss) ? ' / Boss' : ''}` : 'Endless waves / starts at Lv.1'}</p>
    <div class="action-row">${chest ? button('Chests', 'chests') : ''}${mode?.id === 'machines' ? button('Focus Loot', 'machineFocus') : ''}<button class="pill primary enter-activity" data-screen="battle" ${!access.unlocked ? 'disabled' : ''}>${uiIcon('gameplay')}${calamity ? 'Enter Calamity' : 'Enter activity'}</button></div></div></section>
    ${glass(calamity ? 'Choose difficulty' : 'Stage selection', `${calamity ? `<label class="field">Activity<select id="calamity-activity">${calamityActivities.map(entry => `<option value="${entry.name}" ${selectedActivity === entry.name ? 'selected' : ''}>${entry.name}</option>`).join('')}</select></label>` : ''}
    <div class="tabs">${button('Normal', 'activity', !calamity)}${dungeon || mode ? button('Calamity', 'calamity', calamity) : ''}</div>
    <div class="stage-grid ${stages > 25 ? 'many-stages' : ''}">${Array.from({ length: stages }, (_, i) => {
      const entry = calamity ? calamityEncounter(activityId, (i + 1) as CalamityTier) : dungeon ? dungeonEncounter(dungeon.id, i + 1) : mode ? infusionEncounter(mode.id, i + 1) : war ? warEncounter(war.character, i + 1) : null;
      return stageButton('stage', i + 1, `${calamity ? 'EX+' : ''}${i + 1}`, i + 1 === (calamity ? tier : stage), i + 1 > unlocked, i + 1 < unlocked, entry?.level, calamity || Boolean(entry && 'boss' in entry && entry.boss));
    }).join('')}</div>
    ${!access.unlocked ? `<p class="missing">Locked: ${esc(access.requirement)}.</p>` : ''}<h3>Rewards</h3>
    ${chest ? `<div class="activity-chest">${image('master-conduits/grand-master-chest', chest.name)}<p>Guaranteed ${esc(chest.name)} on victory.</p></div><button class="pill" data-action="chest-loot" data-chest="${chest.id}" data-view-only="true">View Loot</button>` : source ? `<div class="loot-pool">${stageLootContent(source, stage, account())}</div><button class="pill" data-action="loot-rates">Drop rates</button>` : '<p>Prismatica only. No materials, captures or Null-Prismatica.</p>'}
    `)}</div>`;
}
function events(): string {
  return `${heading()}<div class="event-grid">${[
    ['roses-arena', 'Passion of Crimson Roses', 'Rosethorn materials / 35 stages'],
    ...elementalWars.map(entry => [`elemental-war-${entry.character}-arena`, entry.name, `Elemental War / ${getStarter(entry.character).name}`]),
  ].map(([art, name, desc]) => landscape(art, name, desc, 'activity')).join('')}</div>
    <div class="action-row">${button('Rose banner', 'summon', true, 'summon')}${button('All activities', 'play')}</div>`;
}
function summon(): string {
  const rose = state.banner === 'roses', banner = getSummonBanner(state.banner);
  const pity = account().bannerPity?.[banner.id]?.highestStar ?? 0;
  return `${heading()}<div class="toolbar"><div class="tabs"><button class="pill ${!rose ? 'primary' : ''}" data-banner="standard">Standard</button>
    <button class="pill ${rose ? 'primary' : ''}" data-banner="roses">Roses Under Sunny Skies</button></div></div>
    <div class="summon-layout"><section class="summon-art glass">${image(`banners/summon-${rose ? 'roses' : 'standard'}`)}
    <div><p class="eyebrow">A connection beyond the ordinary</p><h2>${rose ? 'Roses Under<br>Sunny Skies' : 'Someone, somewhere,<br>is waiting to shine.'}</h2></div></section>
    ${glass('Answer the call', `<div class="summon-sphere">${uiIcon('summon')}</div><p>A new light. A familiar face.<br>A story that becomes part of yours.</p>
      <p class="muted">${banner.cost} Null-Prismatica per draw. At ${bannerPityLimits.pulls} pulls, guarantee an unowned Element-Bearer; if all are owned, receive a duplicate material bundle.</p>
      <div class="spread"><span>Guarantee progress</span><strong>${pity} / ${bannerPityLimits.pulls}</strong></div>${meter(pity / bannerPityLimits.pulls * 100, 'Banner guarantee')}
      <button class="pill primary full" data-action="summon" data-count="1" ${account().lycalis < banner.cost ? 'disabled' : ''}>Summon ×1 / ${banner.cost} ${uiIcon('summon')}</button>
      <button class="pill full" data-action="summon" data-count="${multiSummonCount}" ${account().lycalis < banner.cost * multiSummonCount ? 'disabled' : ''}>Summon ×${multiSummonCount} / ${banner.cost * multiSummonCount}</button>
      <button class="pill full" data-action="rates">Rates & information</button>`, 'summon-panel')}</div>`;
}
function inventory(): string {
  const holdings = state.inventoryTab === 'materials' ? Object.entries(account().materials).filter(([, amount]) => amount > 0).map(([id, amount]) =>
    itemCard(materialPath(id), materialName(id), `${amount.toLocaleString()} owned`)).join('')
    : conduits.filter(entry => (account().conduits?.[entry.id] ?? 0) > 0).map(entry =>
      itemCard(`conduits/${entry.id}`, entry.name, `${entry.rarity} / Lv.${account().conduitUpgrades?.[entry.id] ?? 0} / ${account().conduits?.[entry.id]} owned`)).join('')
      + masterConduits.filter(entry => account().masterConduits?.[entry.id]).map(entry => itemCard(entry.art.replace(/\.png$/, ''), entry.name, 'Omnic / Personal Master')).join('');
  return `${heading()}<div class="holdings-row">${glass('Prismatica', `${image('currencies/fractalis')}<strong>${account().fractalis.toLocaleString()}</strong>`)}
    ${glass('Null-Prismatica', `${image('currencies/lycalis')}<strong>${account().lycalis.toLocaleString()}</strong>`)}
    ${glass('Broken Mechanical Components', `${image('currencies/mechanical-components')}<strong>${account().mechanicalComponents?.toLocaleString()}</strong>`)}</div>
    <div class="toolbar"><div class="tabs">${['materials', 'conduits'].map(tab => `<button class="pill ${state.inventoryTab === tab ? 'primary' : ''}" data-action="inventory-tab" data-tab="${tab}">${tab === 'materials' ? 'Materials' : 'Conduits & Masters'}</button>`).join('')}</div>
    ${tag(`${state.inventoryTab === 'materials' ? Object.values(account().materials).filter(amount => amount > 0).length : Object.values(account().conduits ?? {}).filter(amount => amount > 0).length + Object.keys(account().masterConduits ?? {}).length} owned types`)}
    ${button('Chests', 'chests')}${button('Conduit Store', 'stores')}</div><div class="item-grid">${holdings || '<p>No items in this section.</p>'}</div>`;
}
function stores(): string {
  const materials = state.storeTab === 'materials';
  return `${heading()}<div class="toolbar"><nav class="tabs" aria-label="Stores"><button class="pill ${!materials ? 'primary' : ''}" data-action="store-tab" data-tab="conduits">Conduit Store</button>
    <button class="pill ${materials ? 'primary' : ''}" data-action="store-tab" data-tab="materials">Material Exchange</button></nav>${button('Upgrade Conduits', 'restore', false, 'evolution')}</div>
    ${materials ? `<p class="page-subtitle">Exchange Prismatica for character materials.</p><div class="tabs"><button class="pill ${state.exchangeCategory === 'normal' ? 'primary' : ''}" data-action="exchange-category" data-category="normal">Normal materials</button><button class="pill ${state.exchangeCategory === 'event' ? 'primary' : ''}" data-action="exchange-category" data-category="event">Event materials</button></div>
      ${state.exchangeCategory === 'event' ? '<p class="store-notice">Rosethorn materials are only for Rosetta, Thornia and Crinso.</p>' : ''}
      <div class="item-grid store-grid">${exchangeProducts.filter(entry => entry.category === state.exchangeCategory).map(entry => `<button class="item-card" data-action="exchange" data-product="${entry.id}">
        <span class="item-art">${image(materialPath(entry.materialId), materialName(entry.materialId))}</span><strong>${esc(materialName(entry.materialId))}</strong><small>${entry.price.toLocaleString()} Prismatica / ${(account().materials[entry.materialId] ?? 0).toLocaleString()} owned</small></button>`).join('')}</div>`
      : `<p class="page-subtitle">${esc(conduitOrigin)}</p><div class="item-grid store-grid">${conduits.filter(entry => entry.rarity === 'Common').map(entry =>
        itemCard(`conduits/${entry.id}`, entry.name, `${'price' in entry ? entry.price.toLocaleString() : '–'} Prismatica / ${account().conduits?.[entry.id] ? 'Owned' : 'Not owned'}`, 'purchase')).join('')}</div>`}`;
}
function restore(): string {
  const entry = conduits.find(item => item.id === state.restoreId)!;
  const level = account().conduitUpgrades?.[entry.id] ?? 0, cost = conduitUpgradeCost(entry, level);
  return `${heading()}<div class="settings-layout">${glass(entry.name, `<div class="restore-art">${image(`conduits/${entry.id}`, entry.name)}</div>
    <div class="spread"><h3>Upgrade ${level} / 5</h3><strong>${cost === null ? 'Maximum level' : `→ ${level + 1}`}</strong></div>${meter(level / 5 * 100, 'Conduit upgrade level')}
    <h3>Current effect</h3><p>${readableEffect(conduitEffect(entry, level))}</p>${cost === null ? '' : `<h3>Next effect</h3><p>${readableEffect(conduitEffect(entry, level + 1))}</p><p>${cost.toLocaleString()} Broken Mechanical Components / ${(account().mechanicalComponents ?? 0).toLocaleString()} owned</p>`}
    <button class="pill primary full" data-action="restore" ${cost === null || cost > (account().mechanicalComponents ?? 0) ? 'disabled' : ''}>${cost === null ? 'Maximum level' : 'Confirm upgrade'}</button>`)}
    ${glass('Owned Conduits', `<div class="equipment-grid">${conduits.filter(item => account().conduits?.[item.id]).map(item => itemCard(`conduits/${item.id}`, item.name, `Lv.${account().conduitUpgrades?.[item.id] ?? 0}`, 'restore-select')).join('')}</div>`)}</div>`;
}
function collections(): string {
  return `${heading()}<div class="collection-portals">${[
    ['archive-characters', 'Element-Bearers', 'Every form, every possibility', 'archive'],
    ['archive-conduits', 'Conduits & Masters', 'Mechanisms waiting to awaken', 'conduitArchive'],
    ['archive-creatures', 'Elemental-Devourers', 'Discoveries along the way', 'archive'],
  ].map(([art, name, desc, screen]) => `<button class="glass collection-portal" data-screen="${screen}" ${art === 'archive-creatures' ? 'data-archive-view="creatures"' : art === 'archive-characters' ? 'data-archive-view="bearers"' : ''}>${image(`banners/${art}`)}<span class="portal-orb">${uiIcon('story')}</span>
    <span class="eyebrow">THE ARCHIVE</span><h2>${name}</h2><p>${desc}</p><span class="pill">Explore ${uiIcon('back')}</span></button>`).join('')}</div>`;
}
function archiveGrid(): string {
  const found = state.archiveView === 'creatures';
  return `${heading()}<div class="toolbar"><div class="tabs"><button class="pill ${!found ? 'primary' : ''}" data-action="archive-view" data-view="bearers">Element-Bearer forms</button>
    <button class="pill ${found ? 'primary' : ''}" data-action="archive-view" data-view="creatures">Elemental-Devourer discoveries</button></div>${tag(found ? `${Object.keys(account().creatures).length} discovered` : `${starters.length * 6} forms`)}</div>
    <div class="item-grid">${found ? creatures.map(entry => {
      const discovery = account().creatures[entry.id];
      return `<button class="item-card ${discovery ? '' : 'undiscovered'}" data-action="creature-reference" data-creature="${entry.id}">
        <span class="item-art">${image(entry.art ? `enemies/${entry.art}` : '', entry.name)}</span><strong>${esc(entry.name)}</strong><small>${discovery ? discovery.defeated ? 'Defeated / view loot' : 'Seen / loot unknown' : 'Undiscovered'}</small></button>`;
    }).join('') : starters.flatMap(person => Array.from({ length: 6 }, (_, index) => {
      const evolution = index + 1, reached = (account().characters[person.id]?.evolution ?? 0) >= evolution;
      return `<button class="item-card ${reached ? '' : 'undiscovered'}" data-action="character-reference" data-character="${person.id}" data-evolution="${evolution}">
        <span class="item-art">${portrait(person.id, evolution)}</span><strong>${esc(characterName(person.id, evolution))}</strong><small>${person.stars} stars / Form ${evolution} / ${reached ? 'Reached' : 'Unreached'}</small></button>`;
    })).join('')}</div>`;
}
function masters(): string {
  return `${heading()}<p class="page-subtitle">Masters are character-specific mechanisms with a separate equipment slot.</p><div class="toolbar">${button('Element-Bearer Archive', 'archive')}${tag('Character-specific equipment')}</div>
    <div class="item-grid">${masterConduits.map(entry => itemCard(entry.art.replace(/\.png$/, ''), entry.name, `${getStarter(entry.character).name} / ${account().masterConduits?.[entry.id] ? 'Owned' : 'Unowned'}`, 'details', !account().masterConduits?.[entry.id])).join('')}</div>`;
}
function conduitArchive(focus = false): string {
  return `${heading()}<div class="toolbar"><p class="muted">${focus ? 'Each rarity rolls independently. Choose an unowned mechanism to focus, without changing its rarity odds.' : 'Owned in color. Unowned in silhouette. Undelivered artwork stays a named neutral tile.'}</p>
    ${button('Personal Masters', 'masters')}${button('Equipment', 'conduits')}</div>
    ${focus ? `<div class="toolbar">${(['Rare', 'Legendary', 'Omnic'] as const).map(rarity => `<button class="pill" data-action="focus-clear" data-rarity="${rarity}">${rarity}: ${account().machineLootFocus?.[rarity] ? lootName(account().machineLootFocus![rarity]!) : 'Random unowned'} / Clear focus</button>`).join('')}</div>` : ''}
    <div class="item-grid">${conduits.filter(entry => !focus || isMachineFocusRarity(entry.rarity) && !account().conduits?.[entry.id]).map(entry =>
    itemCard(`conduits/${entry.id}`, entry.name, `${entry.rarity} / ${focus ? 'Choose focus' : account().conduits?.[entry.id] ? 'Owned' : 'Unowned'}`, focus ? 'focus' : 'details', !focus && !account().conduits?.[entry.id])).join('')}</div>`;
}
function chestDetails(id: string): string {
  const { activity, tier } = parseCalamityChestId(id), chest = calamityChest(activity, tier);
  return `<p>Guaranteed: ${chest.fractalis.toLocaleString()} Prismatica, ${chest.lycalis} Null-Prismatica, ${chest.calamiticTokens} Calamitic Tokens${chest.masterChests ? `, ${chest.masterChests} Machine's Master Chests` : ''}.</p>
    <p>${chest.bundles} independent random bundles:</p><div class="loot-table">${calamityLootTable(activity).map(row =>
      `<div class="loot-row"><span>${esc(row.label)}</span><strong>${row.min}–${row.max}</strong><span>${bannerPercent(row.weight / 100)}</span></div>`).join('')}</div>`;
}
function chests(): string {
  return `${heading()}<div class="chest-layout">${glass("Machine's Master Chest", `<div class="chest-art">${image('master-conduits/grand-master-chest', "Machine's Master Chest")}</div>
    <p>${account().masterChests ?? 0} owned. Choose any unowned Master; it is not automatically equipped.</p><div class="action-row"><button class="pill primary" data-action="chest" ${(account().masterChests ?? 0) < 1 ? 'disabled' : ''}>Choose a Master</button>${button('Master Archive', 'masters')}</div>`)}
    ${glass('Calamity chests', `<div class="chest-tier-list">${Object.entries(account().calamityChests ?? {}).filter(([, count]) => count > 0).map(([id, count]) => {
      const { activity, tier } = parseCalamityChestId(id);
      return `<button class="loadout-row" data-action="chest-loot" data-chest="${id}"><span class="loadout-icon">${uiIcon('inventory')}</span><span><strong>${esc(calamityChest(activity, tier).name)}</strong><small>${count} owned / View Loot</small></span><span>→</span></button>`;
    }).join('') || '<p>No Calamity chests owned.</p>'}</div>`)}</div>`;
}
function sale(): string {
  const payout = state.saleCopies.length ? creatureBatchSaleOffer(account(), saleSelections()) : null;
  return `${heading()}<p class="page-subtitle">Choose copies and review exact payouts. Locked, squad and equipped copies stay protected.</p><div class="sale-layout">${glass('Choose copies', `<div class="sale-copies">${(account().capturedCharacters ?? []).map((copy, i) => {
    const offer = creatureSaleOffer(account(), copy.instanceId, state.saleOptions[copy.instanceId]), person = memberDisplay(account(), copy.instanceId);
    return `<div class="sale-choice"><button class="copy-chip" data-action="sale-copy" data-copy="${copy.instanceId}" aria-pressed="${state.saleCopies.includes(copy.instanceId)}" ${offer.reasons.length ? 'disabled' : ''}>${image(person.art, person.name)}<span>${esc(person.name)}<small>Copy ${i + 1} / ${esc(offer.reasons.join(', ') || `${offer.fractalis} Prismatica / ${offer.lycalis} Null-Prismatica`)}</small></span><i>+</i></button>
      ${offer.options.length > 1 ? `<label class="field">Payout<select data-sale-option="${copy.instanceId}" ${offer.reasons.length ? 'disabled' : ''}>${offer.options.map(option => `<option value="${option.id}" ${option.id === offer.option ? 'selected' : ''}>${option.lycalis ? `${option.lycalis} Null-Prismatica` : Object.entries(option.materials).map(([id, amount]) => `${amount} ${esc(materialName(id))}`).join(' + ')}</option>`).join('')}</select></label>` : Object.entries(offer.materials).map(([id, amount]) => `<small>${amount} ${esc(materialName(id))}</small>`).join('')}</div>`;
  }).join('')}</div>`)}
    ${glass('Sale review', `<h3 id="sale-count">${state.saleCopies.length} copies selected</h3>${payout ? `<p>${payout.fractalis.toLocaleString()} Prismatica<br>${payout.lycalis.toLocaleString()} Null-Prismatica</p>${Object.entries(payout.materials).map(([id, amount]) => `<p>${amount} ${esc(materialName(id))}</p>`).join('')}` : '<p>Select eligible copies to see the total payout.</p>'}
    <button class="pill primary full" data-action="sale-review" ${!payout ? 'disabled' : ''}>Review sale</button>${button('Back to Devourers', 'devourers')}`)}</div>`;
}
function help(): string {
  return `${heading()}<div class="settings-layout">${glass('Team & growth', `<h3>Your squad</h3><p>Equip one to three owned Element-Bearers or captured copies. The first member leads. Duplicate species can join as distinct captured copies.</p>
    <h3>Growth</h3><p>Level up with Prismatica and matching materials. Max Level calculates all affordable levels within the current cap. Evolution preserves levels and requires the listed materials and eligible Evolution Value.</p>`)}
    ${glass('Let and Rise', `${worldHistory.map(entry => `<h3>${entry.title}</h3><p>${esc(entry.text)}</p>`).join('')}
    <div class="action-row">${button('Settings', 'settings', true)}${button('Sanctuary', 'home')}</div>`)}</div>`;
}
function profile(friends = false): string {
  return `${heading()}<div class="profile-layout">${glass(esc(state.profileName), `<div class="profile-avatar">${image(memberDisplay(account(), state.leader).art)}</div><p class="eyebrow">PLAYER PROFILE</p><p>${esc(state.bio)}</p>
    <div class="tags">${tag('Story ' + account().storyCompleted + ' / ' + storyRules.stages)}${tag(Object.keys(account().characters).length + ' Element-Bearers')}</div>${button(friends ? 'Profile' : 'Friends', friends ? 'profile' : 'friends', true, 'squad')}`)}
    ${friends ? glass('Friends · 3 / 30', `<label class="search"><input id="friend-search" type="search" aria-label="Search friends" placeholder="Name or username" /></label>${['Lyra', 'Sol', 'Mira'].map((name, i) =>
      `<div class="friend-row" data-friend-name="${name.toLowerCase()}"><span class="friend-avatar">${portrait(starters[i + 1].id, 4)}</span><span><strong>${name}</strong><small>@${name.toLowerCase()} / ${i === 0 ? 'Online' : 'Offline'}</small></span><button class="pill" data-action="chat" data-name="${name}">Message</button></div>`).join('')}<p id="friend-empty" hidden>No matching friends.</p><h3>Requests</h3><div class="tabs"><span class="tag">Received · 0</span><span class="tag">Sent · 0</span></div><p>No pending requests.</p>`)
    : glass('Your journey at a glance', `<div class="stat-grid">${[['Story stages', String(account().storyCompleted)], ['Element-Bearers', String(Object.keys(account().characters).length)], ['Discovered forms', String(Object.keys(account().creatures).length)], ['Leader element', memberDisplay(account(), state.leader).element]].map(([label, value]) =>
      `<div><small>${label}</small><strong>${value}</strong></div>`).join('')}</div><label class="field">Display name<input id="profile-name" value="${esc(state.profileName)}" maxlength="24" /></label><label class="field">A few words<textarea id="profile-bio" rows="2">${esc(state.bio)}</textarea></label>
      <button class="pill primary" data-action="profile">Save profile</button>`)}</div>`;
}
function settings(): string {
  return `${heading()}<div class="settings-layout">${glass('Motion & accessibility', `
    ${[['motion', 'Reduce motion', 'Disable ambient motion, camera transitions and particle effects.', state.reduced],
      ['particles', 'Ambient sparkles', 'Show ambient particles and interaction sparkles.', state.particles]].map(([id, title, detail, on]) =>
      `<label class="setting-row"><span><strong>${title}</strong><small>${detail}</small></span><input type="checkbox" data-setting="${id}" ${on ? 'checked' : ''} /><span class="switch" aria-hidden="true"></span></label>`).join('')}
    <label class="field">Battle speed<select id="mockup-speed" aria-label="Battle speed">${['1','2','3'].map(speed => `<option value="${speed}" ${state.speed === speed ? 'selected' : ''}>${speed}x</option>`).join('')}</select></label>`)}
    ${glass('Squad leader', `<p>Interface accents follow your squad leader’s element.</p><div class="theme-options">${themeOptions()}</div>
      <div class="action-row">${button('Profile', 'profile', false, 'overview')}${button('Friends', 'friends', false, 'squad')}${button('Information', 'help', false, 'overview')}${button('Events', 'events', false, 'events')}</div>
      <div class="action-row">${button('Return to title', 'title')}${button('Account', 'account')}</div><h3>About this build</h3><p>This UI mock-up uses a private example account. Changes reset on refresh; no live account, online messages or battles are connected. Summon outcomes use a fixed roll. Controls, costs and displays use the game’s current rules.</p>
      <button class="pill" data-action="reset-example">Reset example account</button>`)}</div>`;
}
function themeOptions(): string {
  return (['ember', 'tide', 'sprout', 'atmoso', 'bliss', 'disciple'] as const).map(id => {
    const person = getStarter(id);
    return `<button class="theme-choice ${state.leader === id ? 'selected' : ''}" data-leader="${id}" aria-pressed="${state.leader === id}" style="--swatch:${elementAccents[person.elementId]}">
      <i></i><span>${person.name}<small>${person.element}</small></span>${state.leader === id ? '<span aria-hidden="true">✓</span>' : ''}</button>`;
  }).join('');
}
function opening(account = false, starter = false): string {
  if (account) return `${heading()}<section class="glass account-panel"><div class="large-symbol">${uiIcon('summon')}</div><h2>Last Light</h2>
    <form id="sample-account"><label class="field">Display name<input required autocomplete="off" placeholder="Display name" maxlength="24" /></label><button class="pill primary full" type="submit">Continue</button></form>
    <div class="action-row">${button('Choose a starter', 'starter')}${button('Back to title', 'title')}</div></section>`;
  if (starter) return `${heading()}<p class="page-subtitle">Infernis, Tizu or Flora. Your first light is yours to choose.</p><div class="formation">${starters.slice(0, 3).map(person =>
    `<button class="glass starter-card" data-starter="${person.id}">${portrait(person.id, 1)}<p class="eyebrow">${person.element}</p><h2>${person.name}</h2><p>${person.role}</p><span class="pill primary">Choose ${person.name}</span></button>`).join('')}</div>`;
  return `<section class="title-scene"><div class="title-emblem">${uiIcon('summon')}</div><p class="eyebrow">A world waiting to be rekindled</p><h1 tabindex="-1">LAST <span>LIGHT</span></h1>
    <p>Let’s Infinity. Rise’s Nothingness.<br>Two creations. One search.</p>${button('Continue', 'home', true, 'summon')}${button('Begin', 'account')}</section>`;
}
function battleDestination(): BubbleBattleDestination {
  if (state.screen !== 'activity' && state.screen !== 'calamity') return { storyStage: state.storyStage };
  const dungeon = elements.find(entry => entry.dungeon === selectedActivity);
  const mode = [...infusionModes, ...currencyModes, ...eventModes, ...machineModes].find(entry => entry.name === selectedActivity);
  const war = elementalWars.find(entry => entry.name === selectedActivity);
  if (state.screen === 'calamity') return { activity: (dungeon?.id ?? mode?.id ?? 'infernic') as CalamityActivityId, tier: state.calamityTier };
  return dungeon ? { element: dungeon.id as PlayableDungeon, stage: state.activityStage } : mode ? { mode: mode.id, stage: state.activityStage }
    : war ? { character: war.character, stage: state.activityStage } : undefined;
}
function battleTitle(): string {
  const destination = state.destination;
  if (!destination) return 'Training';
  if ('storyStage' in destination) { const encounter = storyEncounter(destination.storyStage); return `Story · ${encounter.name} · Stage ${destination.storyStage}`; }
  if ('tier' in destination) return `${selectedActivity} · Calamity EX+${destination.tier}`;
  return `${selectedActivity} · Stage ${destination.stage}`;
}
function battle(results = false): string {
  return `<h1 class="sr-only" tabindex="-1">${results ? 'Victory' : 'Battle'}</h1><p class="sr-only">${esc(battleTitle())}. ${results ? 'The live results sheet with every reward earned in this encounter.' : 'The live battlefield: your squad on the left, enemies on the right, with the Battle menu and speed controls.'}</p>
    <iframe class="live-battle-frame" src="${import.meta.env.BASE_URL}bubble-battle.html?view=${results ? 'results' : 'battle'}" title="${esc(battleTitle())}"></iframe>`;
}
function rewards(): string {
  const drawCard = (draw: SummonDraw, index: number): string => {
    const tier = draw.entry.stars >= 6 ? 'prismatic' : draw.entry.stars >= 5 ? 'gold' : '';
    const owner = draw.duplicate && isStarterId(draw.entry.id) ? `${characterName(draw.entry.id, 1)} already owned / ` : '';
    const stars = '\u2605'.repeat(draw.entry.stars);
    const [art, name, detail] = draw.materials
      ? [materialPath(draw.materials.id), `${draw.materials.amount} ${materialName(draw.materials.id)}`, `${owner}${draw.duplicate ? 'Duplicate converted' : 'Materials summoned'}`]
      : draw.copy ? [memberDisplay(account(), draw.copy.instanceId).art, memberDisplay(account(), draw.copy.instanceId).fullName, `${owner}${stars} Elemental-Devourer`]
      : isStarterId(draw.entry.id) ? [`characters/${characterArt(draw.entry.id, 1).art}`, characterName(draw.entry.id, 1), `${stars} New Element-Bearer Lv.0`] : ['', draw.entry.id, 'Acquired'];
    return `<button class="item-card draw-card ${tier ? `is-${tier}` : ''}" style="--i:${index}" data-action="details" data-name="${esc(name)}">
      <span class="item-art">${image(art, name)}</span><strong>${esc(name)}</strong><small>${esc(detail)}${draw.guarantee !== 'none' ? ' / Pity' : ''}${draw.bonusConduit ? ' / Bonus Conduit' : ''}</small></button>`;
  };
  return `${heading()}<section class="reward-scene"><div class="reward-halo"></div><div class="item-grid">${state.revealItems.map(item => itemCard(item.art, item.name, item.detail)).join('') || state.draws.map(drawCard).join('') || '<p>No recent acquisitions.</p>'}</div><div class="action-row">${button('Continue', 'summon', true)}${button('Inventory', 'inventory')}</div></section>`;
}
function loadouts(): string {
  return detailShell(glass('Your Conduits', `<p>Inspect owned mechanisms, upgrade their effects or choose an equipment slot.</p>
    <div class="item-grid">${conduits.filter(entry => account().conduits?.[entry.id]).map(entry => itemCard(`conduits/${entry.id}`, entry.name, `${entry.rarity} / Lv.${account().conduitUpgrades?.[entry.id] ?? 0}`, 'restore-select')).join('')}</div>${button('Equipment slots', 'conduits')}`));
}
function lore(): string {
  if (state.capture) return detailShell(glass('Origin', `<p>${esc(creatureLore(getCreature(account().capturedCharacters!.find(copy => copy.instanceId === state.capture)!.creatureId)))}</p>`));
  const person = getStarter(state.selected);
  return detailShell(`${glass('Behind the light', `<p class="eyebrow">${esc(person.lore.origin)}</p><h2>${person.name}</h2><p class="lore-copy">${esc(person.lore.story)}</p><blockquote>${esc(person.lore.vow)}</blockquote>`)} `);
}
function body(): string {
  switch (state.screen) {
    case 'home': return home();
    case 'team': return team();
    case 'squad': return squad();
    case 'bearers': return collectionGrid();
    case 'devourers': return collectionGrid(true);
    case 'archive': return collectionGrid(false, true);
    case 'stats': return stats();
    case 'skills': return skills();
    case 'growth': return growth();
    case 'level': case 'max': case 'evolution': return upgrade(state.screen);
    case 'conduits': return equipment();
    case 'loadouts': return loadouts();
    case 'lore': return lore();
    case 'play': return play();
    case 'story': return story();
    case 'activity': return activity();
    case 'calamity': return activity(true);
    case 'events': return events();
    case 'summon': return summon();
    case 'inventory': return inventory();
    case 'stores': return stores();
    case 'conduitArchive': return conduitArchive();
    case 'machineFocus': return conduitArchive(true);
    case 'chests': return chests();
    case 'sale': return sale();
    case 'help': return help();
    case 'restore': return restore();
    case 'collections': return collections();
    case 'masters': return masters();
    case 'profile': return profile();
    case 'friends': return profile(true);
    case 'settings': return settings();
    case 'title': return opening();
    case 'account': return opening(true);
    case 'starter': return opening(false, true);
    case 'battle': return battle();
    case 'results': return battle(true);
    case 'rewards': return rewards();
  }
}
function scrollPath(element: Element): string {
  const parts: string[] = [];
  for (let node: Element | null = element; node && node.tagName !== 'MAIN'; node = node.parentElement)
    parts.unshift(`:nth-child(${Array.from(node.parentElement!.children).indexOf(node) + 1})`);
  return ['main', ...parts].join(' > ');
}
/** Pages keep their heading fixed and fit the viewport; only the body below it scrolls, and only when needed. */
function fitPage(main: HTMLElement): void {
  const heading = main.querySelector(':scope > .page-heading');
  if (!heading || main.querySelector(':scope > .page-body')) return;
  const wrapper = document.createElement('div');
  wrapper.className = 'page-body';
  while (heading.nextSibling) wrapper.append(heading.nextSibling);
  main.append(wrapper);
}
function render(focus = false): void {
  const active = document.activeElement;
  const activeData = active instanceof HTMLButtonElement && active.closest('#bubble-preview') ? { ...active.dataset } : null;
  const person = memberDisplay(account(), state.leader);
  root.style.setProperty('--accent', elementAccents[person.elementId]);
  root.dataset.leaderElement = person.elementId;
  root.dataset.screen = state.screen;
  root.classList.toggle('reduce-motion', state.reduced);
  root.classList.toggle('hide-sparkles', !state.particles);
  effects.style.setProperty('--accent', elementAccents[person.elementId]);
  effects.classList.toggle('reduce-motion', state.reduced);
  if (!motionAllowed()) effects.replaceChildren();
  const markup = `<div class="ambient" aria-hidden="true"><div class="ambient-glow"></div><div class="ambient-current current-two"></div><div class="ambient-current current-three"></div>${Array.from({ length: 12 }, (_, i) =>
    `<span class="ambient-bubble depth-${i % 3}" style="--x:${(i * 19 + 4) % 97}%;--y:${(i * 31 + 18) % 95}%;--size:${25 + i * 13}px;--delay:${i * -2.7}s;--duration:${19 + i % 5 * 4}s"></span>`).join('')}${Array.from({ length: 36 }, (_, i) =>
    `<i class="spark" style="--x:${(i * 37 + 7) % 97}%;--y:${(i * 23 + 13) % 95}%;--delay:${i * -.43}s;--size:${i % 5 === 0 ? 6 : 2}px"></i>`).join('')}
    <span class="ambient-orbit orbit-a"><b>✦</b></span><span class="ambient-orbit orbit-b"><b>✧</b></span>${Array.from({ length: 16 }, (_, i) =>
    `<b class="ambient-twinkle" style="--x:${(i * 29 + 11) % 96}%;--y:${(i * 41 + 7) % 92}%;--delay:${i * -.83}s;--duration:${3.2 + i % 4 * .9}s;--size:${.55 + i % 3 * .3}rem">${glyphs[i % 4]}</b>`).join('')}</div>
    <div class="context"><button class="context-back" data-action="back">${uiIcon('back')}<span>${state.screen === 'home' ? 'LAST LIGHT' : 'Back'}</span></button>
    </div>
    <div class="floating-wallet">${balance()}</div><main id="preview-main" class="screen screen-${state.screen}">${body()}</main>
    <footer class="preview-tools"><button class="tool-circle" data-screen="settings" aria-label="Settings">${uiIcon('settings')}</button></footer>
    <dialog id="concept-dialog" class="concept-dialog" aria-labelledby="dialog-title"></dialog><div class="toast" role="status" aria-live="polite"></div>`;
  const scrolled = focus ? [] : Array.from(root.querySelectorAll<HTMLElement>('main, main *')).filter(element => element.scrollTop > 0)
    .map(element => [scrollPath(element), element.scrollTop] as const);
  if (!root.querySelector('main')) root.innerHTML = markup;
  else {
    const template = document.createElement('template');
    template.innerHTML = markup;
    for (const selector of ['.context', '.floating-wallet', 'main', '.preview-tools']) {
      const replacement = template.content.querySelector(selector)!;
      if (selector === 'main' && !focus) replacement.classList.add('refresh-content');
      root.querySelector(selector)!.replaceWith(replacement);
    }
  }
  fitPage(root.querySelector<HTMLElement>('main')!);
  for (const [path, top] of scrolled) { const element = root.querySelector<HTMLElement>(path); if (element) element.scrollTop = top; }
  if (focus) {
    root.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true }); document.documentElement.scrollTop = 0;
    popEntrances();
    if ((state.screen === 'rewards' || state.screen === 'results') && motionAllowed() && state.particles) {
      window.setTimeout(() => { const halo = root.querySelector('.reward-halo, .reveal-art, .victory-word')?.getBoundingClientRect();
        if (halo) glyphBurst(halo.x + halo.width / 2, halo.y + halo.height / 2, 30, 260, null, 90); }, 350);
    }
  }
  else if (activeData && Object.keys(activeData).length) Array.from(root.querySelectorAll<HTMLButtonElement>('button'))
    .find(button => Object.entries(activeData).every(([key, value]) => button.dataset[key] === value))?.focus({ preventScroll: true });
  document.title = `${screens[state.screen][1]} - Last Light`;
}
function navigate(screen: Screen, remember = true): void {
  const modal = root.querySelector<HTMLDialogElement>('dialog[open]');
  if (modal) modal.close();
  if (camera) { camera.cancel(); camera = null; root.inert = false; }
  if (screen !== state.screen && remember) state.history.push(state.screen);
  if (screen === 'calamity' && !calamityActivities.some(entry => entry.name === selectedActivity)) selectedActivity = 'Flaming Depths';
  state.screen = screen; state.filter = '';
  location.hash = screen;
  render(true);
}
function toast(message: string): void {
  const el = root.querySelector<HTMLElement>('.toast')!;
  el.textContent = message;
  el.classList.remove('show');
  void el.offsetWidth;
  el.classList.add('show');
}
function dialog(title: string, content: string): void {
  const el = root.querySelector<HTMLDialogElement>('#concept-dialog')!;
  const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  if (el.open) el.close();
  pendingConfirmation = null;
  el.innerHTML = `<div class="dialog-heading"><div><p class="eyebrow">LAST LIGHT</p><h2 id="dialog-title">${title}</h2></div>
    <button class="tool-circle" data-action="close" aria-label="Close dialog">${uiIcon('close')}</button></div>${content}`;
  el.showModal();
  el.addEventListener('close', () => { pendingConfirmation = null; if (trigger?.isConnected) trigger.focus(); }, { once: true });
}
root.addEventListener('click', event => perform(() => {
  if (!(event.target instanceof Element)) return;
  const setting = event.target.closest<HTMLElement>('.setting-row');
  if (setting && event.target instanceof HTMLInputElement) clickFeedback(setting, event);
  const target = event.target.closest<HTMLButtonElement>('button');
  if (!target || target.disabled || camera) return;
  clickFeedback(target, event);
  if (target.dataset.activity) { selectedActivity = target.dataset.activity; state.activityStage = 1; state.calamityTier = 1; }
  if (target.dataset.screen && target.dataset.screen in screens) {
    if (target.dataset.archiveView) state.archiveView = target.dataset.archiveView;
    if (target.dataset.screen === 'battle') state.destination = battleDestination();
    root.querySelector<HTMLDialogElement>('dialog')?.close();
    zoomTo(target.dataset.screen as Screen, target); return;
  }
  if (target.dataset.person) {
    inspect(target.dataset.person); navigate('team'); return;
  }
  if (target.dataset.leader || target.dataset.starter) {
    setLeader((target.dataset.leader ?? target.dataset.starter) as StarterId);
    inspect(state.leader);
    if (target.dataset.starter) navigate('home');
    else { root.querySelector<HTMLDialogElement>('dialog')?.close(); render(); celebrate(`Leader: ${memberDisplay(account(), state.leader).name}.`); }
    return;
  }
  if (target.dataset.banner && isSummonBannerId(target.dataset.banner)) { state.banner = target.dataset.banner; render(); return; }
  const action = target.dataset.action;
  const name = target.dataset.name ?? '';
  switch (action) {
    case 'reset-example':
      session.reset();
      state.selected = 'ember'; state.capture = null; state.fodder = []; state.saleCopies = []; state.saleOptions = {};
      state.draws = []; state.revealItems = []; state.rosterElement = ''; state.rosterSort = 'name'; state.archiveView = 'bearers'; state.inventoryTab = 'materials';
      state.activityGroup = 'story'; state.storeTab = 'conduits'; state.exchangeCategory = 'normal'; selectedActivity = 'Flaming Depths'; state.activityStage = 1;
      state.history = []; navigate('home', false); toast('Example account reset.'); break;
    case 'close': root.querySelector<HTMLDialogElement>('dialog')?.close(); break;
    case 'back': navigate(state.history.pop() ?? 'home', false); break;
    case 'lead': setLeader(selectedId()); render(); celebrate(`${selectedMember().name} is the squad leader.`); break;
    case 'lock': setCharacterLock(session.storage, selectedId(), !characterProtection(account(), selectedId()).locked); render(); break;
    case 'confirm': {
      const operation = pendingConfirmation;
      if (!operation) throw new Error('This confirmation has expired. Review the action again.');
      pendingConfirmation = null;
      root.querySelector<HTMLDialogElement>('dialog')?.close();
      operation(); break;
    }
    case 'cycle': {
      const ids = state.capture ? (account().capturedCharacters ?? []).map(copy => copy.instanceId) : starters.filter(person => account().characters[person.id]).map(person => person.id);
      const current = ids.indexOf(selectedId());
      inspect(ids[(current + Number(target.dataset.step) + ids.length) % ids.length]);
      render(true);
      break;
    }
    case 'choose-member': {
      const slot = Number(target.dataset.slot);
      dialog(`Choose squad member ${slot + 1}`, `<p>Choose an owned Element-Bearer or captured copy. Existing members swap places; slot one leads.</p><div class="member-picker">${ownedCharacterInstances(account()).map(id => {
        const person = memberDisplay(account(), id);
        return `<button class="member-choice ${state.squad[slot] === id ? 'selected' : ''}" data-action="member" data-member="${id}" data-slot="${slot}">${image(person.art, person.fullName)}
        <span><strong>${esc(person.name)}</strong><small>${person.element} / Lv.${person.progress.level}${state.squad.includes(id) ? ' / in squad' : ''}</small></span></button>`;
      }).join('')}</div>`);
      break;
    }
    case 'member': {
      const id = target.dataset.member!, slot = Number(target.dataset.slot), squad = state.squad;
      const existing = squad.indexOf(id);
      if (existing >= 0) {
        const displaced = squad[slot];
        squad.splice(existing, 1, ...(displaced ? [displaced] : []));
      }
      squad[Math.min(slot, squad.length)] = id;
      setSquad(session.storage, squad);
      root.querySelector<HTMLDialogElement>('dialog')?.close(); render();
      celebrate('Squad updated.');
      break;
    }
    case 'remove-member': {
      if (state.squad.length <= 1) { toast('Keep at least one squad member.'); break; }
      const squad = state.squad;
      squad.splice(Number(target.dataset.slot), 1);
      setSquad(session.storage, squad); render();
      break;
    }
    case 'promote': setLeader(target.dataset.personId as StarterId); render(); break;
    case 'equipment': {
      const slot = Number(target.dataset.slot), gear = equipmentFor();
      dialog(`Conduit slot ${slot + 1}`, `<p>Owned mechanisms only. One name per character, matching elemental restrictions and at most four Omnic Conduits.</p>
        <button class="pill" data-action="equip" data-slot="${slot}" data-equip="">Leave slot empty</button><div class="equipment-picker">${conduits.filter(entry => account().conduits?.[entry.id]).map(entry => {
          const reason = conduitEquipReason(entry, selectedMember().elementId, gear, slot);
          return `<button class="item-card" data-action="equip" data-slot="${slot}" data-equip="${entry.id}" ${reason ? 'disabled' : ''}>
          <span class="item-art">${image(`conduits/${entry.id}`, entry.name)}</span><strong>${entry.name}</strong><small>${reason ?? `${entry.rarity} / Lv.${account().conduitUpgrades?.[entry.id] ?? 0}`}</small></button>`;
        }).join('')}</div>`);
      break;
    }
    case 'equip': {
      const id = target.dataset.equip || null;
      if (id !== null && !isConduitId(id)) throw new Error('Choose a valid Conduit.');
      equipConduit(session.storage, selectedId(), Number(target.dataset.slot), id);
      root.querySelector<HTMLDialogElement>('dialog')?.close(); render(); celebrate('Equipment updated.');
      break;
    }
    case 'master-picker': dialog('Choose Personal Master', `<button class="pill" data-action="master-equip">Unequip Master</button><div class="equipment-picker">${masterConduits.filter(entry => entry.character === state.selected && account().masterConduits?.[entry.id]).map(entry =>
      `<button class="item-card" data-action="master-equip" data-master="${entry.id}">${image(entry.art.replace(/\.png$/, ''), entry.name)}<strong>${entry.name}</strong><small>${esc(entry.effect)}</small></button>`).join('') || '<p>No matching Master owned. Choose one from a Machine’s Master Chest.</p>'}</div>`); break;
    case 'master-equip': {
      const master = masterConduits.find(entry => entry.id === target.dataset.master);
      equipMasterConduit(session.storage, state.selected, master?.id ?? null);
      root.querySelector<HTMLDialogElement>('dialog')?.close(); render(); break;
    }
    case 'copy': {
      const id = target.dataset.copy!;
      state.fodder = state.fodder.includes(id) ? state.fodder.filter(copy => copy !== id) : [...state.fodder, id];
      render();
      break;
    }
    case 'upgrade': {
      const id = selectedId(), mode = target.dataset.mode, person = selectedMember(), fodder = [...state.fodder];
      const plan = maxLevelPlan(account(), id);
      confirmAction(mode === 'evolution' ? 'Confirm evolution' : 'Confirm leveling', `<p>${esc(person.fullName)}</p>${root.querySelector('.upgrade-review')!.innerHTML.split('<div class="upgrade-confirm">')[0]}`, () => {
        if (mode === 'max') levelCharacterToMaximum(session.storage, plan);
        else if (isStarterId(id)) upgradeCharacter(session.storage, id, mode === 'evolution' ? 'evolve' : 'level', person.progress, fodder);
        else levelCapturedCharacter(session.storage, id, person.progress.level);
        state.fodder = [];
        const after = memberDisplay(account(), id);
        const evolved = mode === 'evolution' && isStarterId(id);
        render();
        cinematic(evolved ? {
          kind: 'evolution', eyebrow: `Form ${person.progress.evolution} \u2192 ${after.progress.evolution}`, title: 'Evolution', subtitle: after.fullName,
          fromArt: person.art, art: after.art, tier: evolutionTier(after.progress.evolution),
        } : {
          kind: 'level', eyebrow: mode === 'max' ? 'Max Level' : 'Level up', title: `Lv.${person.progress.level} \u2192 ${after.progress.level}`, subtitle: after.fullName, art: after.art,
        }, () => celebrate('Growth complete.'));
      }); break;
    }
    case 'summon': {
      const count = Number(target.dataset.count);
      const banner = getSummonBanner(state.banner);
      confirmAction('Confirm summon', `<p>${count} draw${count === 1 ? '' : 's'} from ${banner.name} / ${banner.cost * count} Null-Prismatica.</p>`, () => {
        state.revealItems = [];
        state.draws = summonCharacters(session.storage, Math.random, banner.id, count).draws;
        const best = Math.max(0, ...state.draws.map(draw => draw.entry.stars));
        cinematic({ kind: 'summon', eyebrow: banner.name, title: 'Summon', subtitle: `${count} draw${count === 1 ? '' : 's'}`, tier: best >= 6 ? 'prismatic' : best >= 5 ? 'gold' : 'normal' }, () => navigate('rewards'));
      }); break;
    }
    case 'region': state.region = Number(target.dataset.region); state.storyStage = state.region * storyRules.regionStages + 1; render(); break;
    case 'story-stage': state.storyStage = Number(target.dataset.stage); render(); break;
    case 'stage':
      if (state.screen === 'calamity') state.calamityTier = Number(target.dataset.stage) as CalamityTier;
      else state.activityStage = Number(target.dataset.stage);
      render(); break;
    case 'inventory-tab': state.inventoryTab = target.dataset.tab!; render(); break;
    case 'activity-group': state.activityGroup = target.dataset.group!; render(); break;
    case 'store-tab': state.storeTab = target.dataset.tab!; render(); break;
    case 'exchange-category': state.exchangeCategory = target.dataset.category!; render(); break;
    case 'exchange': {
      const product = exchangeProduct(target.dataset.product!);
      dialog(materialName(product.materialId), `${image(materialPath(product.materialId), materialName(product.materialId), 'exchange-hero')}<p>${product.price.toLocaleString()} Prismatica each · ${(account().materials[product.materialId] ?? 0).toLocaleString()} owned.</p>
        ${product.restrictedTo ? `<p>Only for ${product.restrictedTo.join(', ')}.</p>` : ''}
        <div class="dialog-actions">${exchangeQuantities.map(quantity => `<button class="pill primary" data-action="exchange-buy" data-product="${product.id}" data-quantity="${quantity}" ${account().fractalis < product.price * quantity ? 'disabled' : ''}>Buy ×${quantity} / ${(product.price * quantity).toLocaleString()}</button>`).join('')}</div>`); break;
    }
    case 'exchange-buy': {
      const product = exchangeProduct(target.dataset.product!), quantity = Number(target.dataset.quantity);
      confirmAction('Confirm exchange', `<p>${quantity} ${esc(materialName(product.materialId))} for ${(product.price * quantity).toLocaleString()} Prismatica.</p>${product.restrictedTo ? `<p>These materials are only for ${product.restrictedTo.join(', ')}.</p>` : ''}`, () => {
        purchaseExchangeMaterial(session.storage, product.id, quantity); render(); celebrate('Materials acquired.');
      }); break;
    }
    case 'loot-rates': {
      if (target.dataset.source === 'story') { dialog('Stage drop rates', lootRows(storyLoot(state.storyStage))); break; }
      const dungeon = elements.find(entry => entry.dungeon === selectedActivity);
      const mode = [...infusionModes, ...currencyModes, ...eventModes, ...machineModes].find(entry => entry.name === selectedActivity);
      const war = elementalWars.find(entry => entry.name === selectedActivity);
      const creature = creatures.find(entry => dungeon ? entry.dungeonElement === dungeon.id && entry.stages.includes(state.activityStage) : mode ? entry.id === `infusion:${mode.id}:${infusionEncounter(mode.id, state.activityStage).tier}` : false);
      dialog('Stage drop rates', creature ? lootRows(creatureLoot(creature, state.activityStage, account().conduits, account().machineLootFocus)) : war ? (() => {
        const loot = warLoot(state.activityStage);
        return lootRows([{ id: 'fractalis', ...loot.fractalis, chance: 1 }, { id: 'lycalis', minimum: loot.lycalis.quantity, maximum: loot.lycalis.quantity, chance: loot.lycalis.chance }]);
      })() : '<p>Training rewards Prismatica only.</p>'); break;
    }
    case 'archive-view': state.archiveView = target.dataset.view!; render(); break;
    case 'character-reference': {
      const id = target.dataset.character;
      if (!isStarterId(id)) throw new Error('Choose a valid Element-Bearer.');
      const evolution = Number(target.dataset.evolution), progress = account().characters[id];
      const reached = !!progress && progress.evolution >= evolution, person = getStarter(id);
      if (!reached) {
        dialog(esc(characterName(id, evolution)), '<p>Reach this form to reveal its artwork and reference.</p>');
        break;
      }
      const current = progress.evolution === evolution;
      const fighter = current ? memberDisplay(account(), id).fighter : resolveFighter(id, { level: 0, evolution, weaponRank: 0 });
      const stats = normalizeStats(fighter.stats);
      dialog(esc(characterName(id, evolution)), `<div class="ability-demo">${portrait(id, evolution)}</div><p>${esc(person.lore.story)}</p>
        <p>${current ? `Current form / Lv.${progress.level} / equipped stats` : 'Lv.0 / unequipped reference'}</p><div class="stat-grid">${phaseZeroStatKeys.map(key =>
          `<div><small>${phaseZeroStatLabels[key]}</small><strong>${formatStat(stats[key] * (statDisplayUnit(key) === '%' ? 100 : 1))}${statDisplayUnit(key)}</strong></div>`).join('')}</div>`);
      break;
    }
    case 'creature-reference': {
      const creature = getCreature(target.dataset.creature!);
      dialog(esc(creature.name), `<p>${esc(creatureLore(creature))}</p>${account().creatures[creature.id]?.defeated ? lootRows(creatureLoot(creature, creature.stages[0], account().conduits, account().machineLootFocus)) : '<p>Defeat this Elemental-Devourer to reveal its loot.</p>'}`); break;
    }
    case 'rates': dialog('Rates & information', `<p>${getSummonBanner(state.banner).name}. A single ${bannerPityLimits.pulls}-pull guarantee; a new Element-Bearer resets progress. Ordinary outcomes are material bundles or Element-Bearers, not captured copies.</p>
      <div class="loot-table">${getSummonBanner(state.banner).pool().map(entry => `<div class="loot-row"><span>${esc(entry.kind === 'character' ? characterName(entry.id, 1) : lootName(entry.id))}</span><span>${entry.kind === 'material' ? `${entry.amount} materials` : `${entry.stars} stars`}</span><strong>${bannerPercent(entry.chance)}</strong></div>`).join('')}</div><p>Legendary Conduit bonus: independent 0.5% chance.</p>`); break;
    case 'details': {
      const conduit = conduits.find(entry => entry.name === name);
      const master = masterConduits.find(entry => entry.name === name);
      dialog(esc(name), `<p>${conduit ? readableEffect(conduitEffect(conduit, account().conduitUpgrades?.[conduit.id] ?? 0)) : esc(master?.effect ?? name)}</p>
        <p class="muted">${esc(conduit?.lore ?? master?.lore ?? 'Used for character growth. View owned quantities in Inventory.')}</p><button class="pill primary" data-action="close">Back to browsing</button>`);
      break;
    }
    case 'purchase': {
      const entry = conduits.find(item => item.name === name);
      if (!entry || !('price' in entry) || entry.price === null) throw new Error('This Conduit is not sold here.');
      confirmAction(entry.name, `<p>${entry.price.toLocaleString()} Prismatica / ${account().fractalis.toLocaleString()} owned.</p><p>${readableEffect(conduitEffect(entry))}</p>`, () => {
        purchaseConduit(session.storage, entry.id); render();
        cinematic({ kind: 'conduit', eyebrow: `${entry.rarity} Conduit`, title: entry.name, subtitle: 'Acquired', art: `conduits/${entry.id}` }, () => celebrate(`${entry.name} acquired.`));
      }); break;
    }
    case 'ability': {
      const key = (target.dataset.ability ?? 'skill1') as 'passive' | 'skill1' | 'skill2' | 'ultimate';
      const person = selectedMember(), kit = person.fighter;
      const ability = key === 'passive' ? kit.passive : kit.abilities[key];
      const statuses = key === 'passive' ? (state.capture ? '' : kitResource(kit, state.selected)) : abilityStatuses(kit.abilities[key].strength, state.capture ? undefined : state.selected, key);
      dialog(esc(ability.name), `<div class="ability-demo">${state.capture ? uiIcon('summon') : image(`abilities/${abilityIcons[state.selected][key]}`)}</div>${statuses}<p>${readableEffect(ability.description)}</p>
        <div class="tags">${tag(key === 'passive' ? 'Automatic while alive / no Gauge' : `${shatterGauge.costs[key]} Elemental Gauge`)}${tag(person.element)}
        ${key === 'ultimate' && !state.capture ? tag('Recover next player turn') : ''}</div><button class="pill primary" data-action="close">Return</button>`);
      break;
    }
    case 'chat': dialog(esc(name), `<div class="chat-messages">${(state.messages[name] ?? []).map(message => `<p class="chat-message">${esc(message)}</p>`).join('') || '<p>No messages yet.</p>'}</div><label class="field">Message<textarea id="chat-message" placeholder="Write a message" rows="3"></textarea></label><button class="pill primary" data-action="send-message" data-name="${esc(name)}">Send</button>`); break;
    case 'send-message': {
      const text = root.querySelector<HTMLTextAreaElement>('#chat-message')!.value.trim();
      if (!text) throw new Error('Write a message before sending.');
      (state.messages[name] ??= []).push(text);
      root.querySelector<HTMLDialogElement>('dialog')?.close();
      celebrate('Message sent.'); break;
    }
    case 'chest': dialog('Choose an unowned Master', `<div class="equipment-picker">${masterConduits.filter(entry => !account().masterConduits?.[entry.id]).map(entry =>
      `<button class="item-card" data-action="master-claim" data-master="${entry.id}">${image(entry.art.replace(/\.png$/, ''), entry.name)}<strong>${entry.name}</strong><small>${getStarter(entry.character).name}</small></button>`).join('') || '<p>All Masters owned. Your chest remains unopened.</p>'}</div>`); break;
    case 'master-claim': {
      const master = masterConduits.find(entry => entry.id === target.dataset.master);
      if (!master) throw new Error('Choose a valid Master.');
      confirmAction(master.name, `<p>Use one Machine’s Master Chest to acquire this Master. It will not be automatically equipped.</p><p>${esc(master.effect)}</p>`, () => {
        openMasterChest(session.storage, master.id);
        state.revealItems = [{ art: master.art.replace(/\.png$/, ''), name: master.name, detail: 'Personal Master acquired' }];
        cinematic({ kind: 'chest', eyebrow: "Machine's Master Chest", title: master.name, subtitle: 'Personal Master acquired', art: master.art.replace(/\.png$/, ''), tier: 'prismatic' }, () => navigate('rewards'));
      }); break;
    }
    case 'chest-loot': {
      const id = target.dataset.chest!, { activity, tier } = parseCalamityChestId(id);
      dialog(calamityChest(activity, tier).name, `${chestDetails(id)}${target.dataset.viewOnly ? '' : `<button class="pill primary" data-action="chest-open" data-chest="${id}">Open chest</button>`}`); break;
    }
    case 'chest-open': {
      const id = target.dataset.chest!, expected = account().calamityChests?.[id] ?? 0;
      confirmAction('Open chest', chestDetails(id), () => {
        const { reward } = openCalamityChest(session.storage, id, expected);
        state.revealItems = [
          { art: 'currencies/fractalis', name: 'Prismatica', detail: reward.fractalis.toLocaleString() },
          { art: 'currencies/lycalis', name: 'Null-Prismatica', detail: String(reward.lycalis) },
          { art: '', name: 'Calamitic Tokens', detail: String(reward.calamiticTokens) },
          ...Object.entries(reward.materials).map(([material, amount]) => ({ art: materialPath(material), name: materialName(material), detail: String(amount) })),
          ...Object.entries(reward.conduits).map(([conduit, amount]) => ({ art: `conduits/${conduit}`, name: lootName(conduit), detail: String(amount) })),
          ...(reward.mechanicalComponents ? [{ art: 'currencies/mechanical-components', name: 'Broken Mechanical Components', detail: String(reward.mechanicalComponents) }] : []),
          ...(reward.masterChests ? [{ art: 'master-conduits/grand-master-chest', name: "Machine's Master Chests", detail: String(reward.masterChests) }] : []),
          ...(reward.devourerCopies ? [{ art: `enemies/${getCreature(reward.devourerCopies.creatureId).art}`, name: getCreature(reward.devourerCopies.creatureId).name, detail: `${reward.devourerCopies.amount} copies` }] : []),
        ];
        cinematic({ kind: 'chest', eyebrow: 'Calamity', title: calamityChest(parseCalamityChestId(id).activity, parseCalamityChestId(id).tier).name, subtitle: 'Opened', art: 'master-conduits/grand-master-chest', tier: 'gold' }, () => navigate('rewards'));
      }); break;
    }
    case 'focus': {
      const entry = conduits.find(item => item.name === name);
      if (!entry || !isMachineFocusRarity(entry.rarity)) throw new Error('Only Rare, Legendary and Omnic mechanisms can be focused.');
      setMachineLootFocus(session.storage, entry.rarity, entry.id); render(); celebrate(`Loot focus: ${entry.name}.`); break;
    }
    case 'focus-clear': {
      const rarity = target.dataset.rarity;
      if (!isMachineFocusRarity(rarity)) throw new Error('Choose a valid loot rarity.');
      setMachineLootFocus(session.storage, rarity, null); render(); break;
    }
    case 'sale-copy': {
      const id = target.dataset.copy!;
      state.saleCopies = state.saleCopies.includes(id) ? state.saleCopies.filter(copy => copy !== id) : [...state.saleCopies, id];
      render(); break;
    }
    case 'sale-review': {
      const selections = saleSelections(), offer = creatureBatchSaleOffer(account(), selections);
      confirmAction('Confirm sale', `<p>${selections.length} copies will be removed.</p><p>${offer.fractalis.toLocaleString()} Prismatica / ${offer.lycalis} Null-Prismatica</p>${Object.entries(offer.materials).map(([id, amount]) => `<p>${amount} ${esc(materialName(id))}</p>`).join('')}`, () => {
        sellCurrencyCreatures(session.storage, selections);
        if (state.capture && state.saleCopies.includes(state.capture)) state.capture = null;
        state.saleCopies = []; render(); celebrate('Sale complete.');
      });
      break;
    }
    case 'restore-select': {
      const entry = conduits.find(item => item.name === name);
      if (!entry) throw new Error('Choose an owned Conduit.');
      state.restoreId = entry.id; navigate('restore'); break;
    }
    case 'restore': {
      const id = state.restoreId, level = account().conduitUpgrades?.[id] ?? 0;
      confirmAction('Upgrade Conduit', `<p>${conduits.find(entry => entry.id === id)!.name} / Lv.${level} → ${level + 1}</p>`, () => {
        upgradeConduit(session.storage, id, level); render();
        const entry = conduits.find(item => item.id === id)!;
        cinematic({ kind: 'conduit', eyebrow: 'Conduit upgraded', title: entry.name, subtitle: `Lv.${level} \u2192 ${level + 1}`, art: `conduits/${id}`, tier: entry.rarity === 'Omnic' ? 'prismatic' : entry.rarity === 'Legendary' ? 'gold' : 'normal' }, () => celebrate('Conduit upgraded.'));
      }); break;
    }
    case 'profile': {
      const name = root.querySelector<HTMLInputElement>('#profile-name')!.value.trim();
      if (!name) throw new Error('Enter a display name.');
      state.profileName = name; state.bio = root.querySelector<HTMLTextAreaElement>('#profile-bio')!.value;
      render(); celebrate('Profile updated.'); break;
    }
    case 'formation': celebrate('Formation saved.'); break;
  }
}));
root.addEventListener('input', event => {
  if (!(event.target instanceof HTMLInputElement)) return;
  if (event.target.id === 'friend-search') {
    const query = event.target.value.trim().toLowerCase();
    const rows = Array.from(root.querySelectorAll<HTMLElement>('[data-friend-name]'));
    rows.forEach(row => { row.hidden = !row.dataset.friendName!.includes(query.replace(/^@/, '')); });
    root.querySelector<HTMLElement>('#friend-empty')!.hidden = rows.some(row => !row.hidden);
    return;
  }
  if (event.target.id !== 'card-search') return;
  state.filter = event.target.value;
  let visible = 0;
  root.querySelectorAll<HTMLElement>('.searchable > button').forEach(card => {
    card.hidden = !card.textContent?.toLowerCase().includes(state.filter.toLowerCase());
    if (!card.hidden) visible++;
  });
  root.querySelector<HTMLElement>('.empty-search')!.hidden = visible > 0;
});
root.addEventListener('change', event => {
  if (event.target instanceof HTMLSelectElement) {
    if (event.target.id === 'mockup-speed') state.speed = event.target.value;
    else if (event.target.id === 'calamity-activity') {
      selectedActivity = event.target.value; state.calamityTier = 1; render();
    }
    else if (event.target.id === 'roster-element') { state.rosterElement = event.target.value; render(); }
    else if (event.target.id === 'roster-sort') { state.rosterSort = event.target.value; render(); }
    else if (event.target.dataset.saleOption) {
      state.saleOptions[event.target.dataset.saleOption] = event.target.value; render();
    }
    return;
  }
  if (!(event.target instanceof HTMLInputElement)) return;
  const setting = event.target.dataset.setting;
  if (setting === 'motion') state.reduced = event.target.checked;
  else if (setting === 'particles') state.particles = event.target.checked;
  else if (setting === 'music') state.music = event.target.checked;
  else return;
  root.classList.toggle('reduce-motion', state.reduced);
  root.classList.toggle('hide-sparkles', !state.particles);
  effects.classList.toggle('reduce-motion', state.reduced);
  if (!motionAllowed()) effects.replaceChildren();
});
root.addEventListener('submit', event => {
  event.preventDefault();
  if (event.target instanceof HTMLFormElement && event.target.id === 'sample-account') navigate('starter');
});
window.addEventListener('hashchange', () => {
  const screen = location.hash.slice(1);
  if (screen in screens && state.screen !== screen) navigate(screen as Screen, false);
});
window.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !root.querySelector('dialog[open]')) navigate(state.history.pop() ?? 'home', false);
});
const initialScreen = location.hash.slice(1);
if (initialScreen in screens) state.screen = initialScreen as Screen;
/** Hand-off to the embedded live battle frame; navigation is deferred so the frame is never removed mid-call. */
window.lastLightBubbleBattle = () => {
  const later = (operation: () => void) => () => { window.setTimeout(() => perform(operation), 0); };
  const advance = (): void => {
    const destination = state.destination;
    if (destination && 'storyStage' in destination) {
      state.storyStage = Math.min(storyRules.stages, destination.storyStage + 1);
      state.destination = { storyStage: state.storyStage };
    } else if (destination && 'stage' in destination) {
      state.activityStage = destination.stage + 1;
      state.destination = { ...destination, stage: destination.stage + 1 };
    }
    navigate('battle');
  };
  return {
    account: structuredClone(account()), destination: state.destination, view: state.screen === 'results' ? 'results' : 'battle', reduced: !motionAllowed(),
    speed: parseBattleSpeed(state.speed), setSpeed: speed => { state.speed = String(speed); },
    leave: later(() => navigate(state.history.pop() ?? 'play', false)),
    settings: later(() => navigate('settings')),
    victory: later(() => navigate('results')),
    next: later(advance),
    retry: later(() => navigate('battle')),
    quit: later(() => navigate(state.destination && 'storyStage' in state.destination ? 'story' : 'play')),
  };
};
render();
