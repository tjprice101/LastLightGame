import './style.css';
import './sanctuary.css';
import './neutral-theme.css';
import './character-screen.css';
import './presentation/settings-panel.css';
import { settingsPanel } from './presentation/settings-panel';
import './creature-glossary.css';
import './sanctuary-polish.css';
import './interface.css';
import { bindInformation, information } from './presentation/information';
import { bindSelectionPanels } from './presentation/selection-panel';
import { maxLevelPreview } from './presentation/max-level';
import { levelCharacterToMaximum, type MaxLevelPlan } from './game/account';
import './numeric-layout.css';
import './sanctuary-layout.css';
import './ambient-background.css';
import { ambientBackground, type AmbientScreen } from './presentation/ambient-background';
import { bindCreatureGlossary } from './presentation/creature-glossary';
import { archives, bindArchives } from './presentation/archives';
import { availableStarters, getStarter, isStarterId, type StarterId } from './content/starters';
import { characterCopyManagement, squadHub, summonHub, bindSquadPreview, bindSummonRates } from './presentation/roster';
import { Journey } from './game/flow';
import { SAVE_KEY } from './game/profile';
import { portrait, portraitAttributes, characterFacing } from './presentation/portrait';
import { characterRole } from './presentation/character-role';
import { characterRating } from './presentation/character-rating';
import { conduitStore } from './presentation/conduit-store';
import { conduitUpgradeMenu, bindConduitUpgrades } from './presentation/conduit-upgrade';
import { getConduit, isConduitId, conduitEffect } from './content/conduits';
import { purchaseConduit, equipConduit, setCharacterLock, ownedCharacterInstances, levelCapturedCharacter } from './game/account';
import { characterName } from './content/character-art';
import { uiIcon } from './presentation/ui-icon';
import { currencyIcon } from './presentation/currency-icon';
import { applyBattleSpeed, battleSpeeds, loadBattleSpeed, parseBattleSpeed, saveBattleSpeed, type BattleSpeed } from './presentation/battle-speed';
import { celebrateUpgrade } from './presentation/upgrade-celebration';
import { activityTransitionPending, transitionActivity } from './presentation/activity-transition';
import { createBackdrop } from './presentation/backdrop';
import { elementalReveal } from './presentation/reveal';
import { applyMotion, loadMotion, saveMotion, reducedMotion, type MotionPreference } from './presentation/settings';
import { commands, defaultBindings, loadBindings, saveBindings, validateBindings } from './game/hotkeys';
import { BattleView, createSession, type BattleSession } from './presentation/battle-view';
import { characterHub, characterInformation, homeHub, inventoryHub, isCharacterTab, updateCharacterTab } from './presentation/hub';
import { bindInventory, type InventoryTab } from './presentation/inventory';
import { loadAccount, ownedProgress, equippedSquad, ownedCharacters, setSquad, summonCharacter, saveAccountRewards, unlockedStage, unlockedInfusionStage, upgradeCharacter, evolutionFodderOptions, creatureSaleOffer, sellCurrencyCreature, type Account } from './game/account';
import { getCreature } from './content/creatures';
import { getSummonBanner, isSummonBannerId, type SummonBannerId } from './content/summon-banners';
import { isInfusionMode } from './content/infusions';
import { isPlayableDungeon } from './content/dungeons';
import { isWarCharacter } from './content/elemental-war';
import { unlockedWarStage } from './game/account';
import { characterLevelCost, characterEvolutionCost, evolutionRarity } from './content/progression';
import { materialName } from './content/dungeon-art';
import { capturedProgress } from './game/character-instances';
import { gameplayHub, bindGameplayNavigation } from './presentation/gameplay';
import { storyCampaign, bindStoryNavigation } from './presentation/story';
import { storyEncounter } from './content/story';
import { unlockedStoryStage } from './game/account';
import { roseEvent } from './presentation/rose-event';
import { isMenuPage, sanctuaryHeader, sanctuaryContext, sanctuaryDock, sanctuaryDestination, type MenuPage, type TeamArea } from './presentation/sanctuary';
import { MenuHistory } from './presentation/menu-history';
import { gameConfirm, gameDialogPending } from './presentation/game-dialog';
import { presentReward } from './presentation/reward-screen';
import { summonReward } from './presentation/summon-presentation';
import { conduitReward } from './presentation/conduit-presentation';
import './sanctuary-reference.css';

const root = document.querySelector<HTMLElement>('#app');
if (!root) throw new Error('Application root is missing.');
const app = root;
bindInformation(app);
bindSelectionPanels(app);
let characterCategory: TeamArea = 'squad';
let selectedCapture: string | undefined;
let pendingMaxLevel: MaxLevelPlan | null = null;
app.addEventListener('error', (event) => {
  if (!(event.target instanceof HTMLImageElement)) return;
  console.error('Artwork failed to load', event.target.src);
  showError(`Artwork could not load for ${event.target.alt}. Please reload or check the asset deployment.`);
}, true);
const journey = new Journey();
let menuPage: MenuPage = 'home';
let characterTab = 'overview';
let selectedCharacter: StarterId | null = null;
let selectedBanner: SummonBannerId = 'standard';
let motionPreference: MotionPreference = 'system';
let settingsError = '';
let speed: BattleSpeed = 1;
let speedError = '';
let bindings = { ...defaultBindings };
let hotkeyError = '';
let battleSession: BattleSession | null = null;
let battleView: BattleView | null = null;
let fractalis: number | null = null;
let account: Account | null = null;
let walletError = '';
interface MenuSnapshot {
  page: MenuPage;
  hash: string;
  characterTab: string;
  characterCategory: TeamArea;
  selectedCharacter: StarterId | null;
  selectedCapture: string | undefined;
  selectedBanner: SummonBannerId;
  summonRateStars?: string;
  inventoryTab: InventoryTab;
  gallery: string | undefined;
  activities: { group: string; index: string }[];
  controls: { attributes: [string, string][]; value: string }[];
  panels: { key: string; top: number; left: number }[];
  scroll: number;
}
const menuHistory = new MenuHistory<MenuSnapshot>();
let inventoryTab: InventoryTab = 'materials';

function menuSnapshot(): MenuSnapshot {
  return {
    page: menuPage, hash: location.hash, characterTab, characterCategory,
    selectedCharacter, selectedCapture, selectedBanner, inventoryTab,
    summonRateStars: app.querySelector<HTMLButtonElement>('[data-rate-stars][aria-pressed="true"]')?.dataset.rateStars,
    gallery: app.querySelector<HTMLElement>('[data-archive-gallery][aria-pressed="true"]')?.dataset.archiveGallery,
    activities: Array.from(app.querySelectorAll<HTMLButtonElement>('[data-activity-choice][aria-pressed="true"]')).map((button) => ({
      group: button.closest('.activity-group')?.id ?? '', index: button.dataset.activityChoice ?? '',
    })),
    controls: Array.from(app.querySelectorAll<HTMLSelectElement>('.sanctuary-content select:not([data-conduit-slot]):not([data-capture-conduit])')).map((control) => ({
      attributes: Array.from(control.attributes).filter((attribute) => attribute.name === 'id' || attribute.name.startsWith('data-') && attribute.name !== 'data-selection-source').map((attribute) => [attribute.name, attribute.value]),
      value: control.value,
    })),
    panels: Array.from(app.querySelectorAll<HTMLElement>('[data-menu-scroll], .activity-group')).map((panel) => ({
      key: panel.dataset.menuScroll ?? panel.id, top: panel.scrollTop, left: panel.scrollLeft,
    })),
    scroll: window.scrollY,
  };
}

function visitMenu(page: MenuPage): void {
  const destination = sanctuaryDestination(page);
  menuHistory.visit(menuSnapshot(), destination);
  if (page === 'character') characterCategory = 'bearers';
  if (page === 'squad') characterCategory = 'squad';
  menuPage = destination;
}

async function backMenu(): Promise<void> {
  if (activityTransitionPending()) return;
  await transitionActivity(() => {
    const previous = menuHistory.back();
    battleSession = null;
    menuPage = previous.page;
    characterTab = previous.characterTab;
    characterCategory = previous.characterCategory;
    selectedCharacter = previous.selectedCharacter;
    selectedCapture = previous.selectedCapture;
    selectedBanner = previous.selectedBanner;
    inventoryTab = previous.inventoryTab;
    history.replaceState(null, '', `${location.pathname}${location.search}${previous.hash}`);
    renderMenu();
    if (previous.summonRateStars !== undefined) {
      const filter = app.querySelector<HTMLButtonElement>(`[data-rate-stars="${previous.summonRateStars}"]`);
      if (!filter) throw new Error('Saved banner rate filter is unavailable.');
      filter.click();
    }
    for (const activity of previous.activities) app.querySelector<HTMLButtonElement>(`#${activity.group} [data-activity-choice="${activity.index}"]`)?.click();
    if (previous.gallery) app.querySelector<HTMLButtonElement>(`[data-archive-gallery="${previous.gallery}"]`)?.click();
    for (const saved of previous.controls) {
      const control = Array.from(app.querySelectorAll<HTMLSelectElement>('.sanctuary-content select')).find((candidate) =>
        saved.attributes.every(([name, value]) => candidate.getAttribute(name) === value));
      if (!control || !Array.from(control.options).some((option) => option.value === saved.value && !option.disabled)) continue;
      control.value = saved.value;
      if (control.matches('[data-character-filter], #glossary-area, [data-loot-stage], #squad-form select')) control.dispatchEvent(new Event('change', { bubbles: true }));
    }
    for (const saved of previous.panels) {
      const panel = app.querySelector<HTMLElement>(`[data-menu-scroll="${saved.key}"], .activity-group[id="${saved.key}"]`);
      if (!panel) throw new Error('Saved menu scroll panel is unavailable.');
      panel.scrollTop = saved.top;
      panel.scrollLeft = saved.left;
    }
    window.scrollTo({ top: previous.scroll, behavior: 'instant' });
  });
}
try {
  account = loadAccount(localStorage);
  fractalis = account.fractalis;
} catch (error) {
  console.error('Could not load Last Light Prismatica balance', error);
  walletError = errorMessage(error);
}
try {
  motionPreference = loadMotion(localStorage);
} catch (error) {
  console.error('Could not load Last Light settings', error);
  settingsError = `Settings could not be loaded. ${errorMessage(error)} System motion preferences remain active; save a setting to replace the unreadable value.`;
}
try {
  bindings = loadBindings(localStorage);
} catch (error) {
  console.error('Could not load Last Light hotkeys', error);
  hotkeyError = `Hotkeys could not be loaded. ${errorMessage(error)} Default keys are active; save new bindings in Settings to repair them.`;
}
applyMotion(motionPreference);
try {
  speed = loadBattleSpeed(localStorage);
} catch (error) {
  console.error('Could not load Last Light battle speed', error);
  speedError = `Battle speed could not be loaded. ${errorMessage(error)} 1x is active; choose a speed in battle to repair the saved value.`;
}
applyBattleSpeed(speed);
createBackdrop();

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'An unexpected error occurred.';
}

function squadSession(current: Account, destination?: Parameters<typeof createSession>[2]): BattleSession {
  const ids = equippedSquad(current);
  const leader = ids.find(isStarterId) ?? journey.profile?.starterId;
  if (!leader) throw new Error('Saved starter definition is missing.');
  return createSession(leader, ownedProgress(current, leader), destination, { ids, progress: current.characters, equipment: current.conduitEquipment, captures: current.capturedCharacters, upgrades: current.conduitUpgrades });
}

function showError(message: string): void {
  const status = app.querySelector<HTMLElement>('dialog[open] #settings-error') ??
    app.querySelector<HTMLElement>('#status');
  if (!status) throw new Error('Status region is missing.');
  status.textContent = message;
}

function frame(body: string, battle = false, sanctuary = false): void {
  document.body.classList.toggle('in-battle', battle);
  const backgroundScreen: AmbientScreen = battle ? 'battle' : !sanctuary
    ? journey.screen === 'selection' ? 'selection' : 'title'
    : menuPage === 'conduit-store' || menuPage === 'conduit-upgrade' ? 'stores' : menuPage === 'archives' || menuPage === 'glossary' ? 'collections' : menuPage === 'team' ? characterCategory === 'squad' ? 'squad' : 'character' : menuPage;
  app.innerHTML = battle ? `<div class="battle-screen">${body}${ambientBackground(backgroundScreen)}<p id="status" class="status" role="alert"></p></div>` : `<div class="shell ${sanctuary ? 'sanctuary-shell' : ''}">
    ${ambientBackground(backgroundScreen)}
    ${sanctuary ? '' : '<header class="masthead"><span class="brand-mark">L · L</span><span>LAST LIGHT</span><span class="build-label">PRELUDE &middot; 0.1</span></header>'}
    ${body}
    <p id="status" class="status" role="alert"></p>
    ${sanctuary ? '' : '<footer><span>AN ORIGINAL GACHA RPG</span><span>A WORLD WAITING TO AWAKEN</span></footer>'}
  </div>`;
}

function focusHeading(): void {
  app.querySelector<HTMLElement>('h1')?.focus();
}

function enter(): void {
  try {
    journey.enter(localStorage);
    render();
    focusHeading();
  } catch (error) {
    console.error('Could not load Last Light profile', error);
    showError(`Unable to open your local save. ${errorMessage(error)} You may retry or explicitly clear the save below.`);
    app.querySelector<HTMLElement>('#save-recovery')?.removeAttribute('hidden');
  }
}

function renderTitle(): void {
  frame(`<section class="title-screen">
    <p class="eyebrow">WHEN ALL ELSE FADES</p>
    <div class="title-emblem" aria-hidden="true"><span></span></div>
    <h1 class="game-title" tabindex="-1">LAST <span>LIGHT</span></h1>
    <p class="title-subtitle">Carry a spark into the unknown.</p>
    <div class="ornament" aria-hidden="true"></div>
    <button id="enter" class="enter-button">Press any key or tap to begin <span aria-hidden="true">&rarr;</span></button>
    <p class="quiet">Your story begins with one Element-Bearer.</p>
    <button id="save-recovery" class="text-button" hidden>Clear unreadable local save</button>
  </section>`);
  app.querySelector('#enter')?.addEventListener('click', enter);
  app.querySelector('#save-recovery')?.addEventListener('click', async () => {
    try {
      if (!await gameConfirm('Delete the local Last Light save on this browser? This cannot be undone.', { title: 'Delete local save', confirmLabel: 'Delete save', danger: true })) return;
      localStorage.removeItem(SAVE_KEY);
      enter();
    } catch (error) {
      console.error('Could not clear Last Light profile', error);
      showError(`Unable to clear local save. ${errorMessage(error)}`);
    }
  });
}

function renderSelection(): void {
  frame(`<section class="selection-screen">
    <p class="eyebrow">CHAPTER ZERO &nbsp; · &nbsp; A FIRST LIGHT</p>
    <h1 tabindex="-1">Choose your Element-Bearer</h1>
    <p class="subtitle">Choose your first Element-Bearer.</p>
    <div class="starter-grid" role="group" aria-label="Starter Element-Bearers">
      ${availableStarters.map((starter, index) => `<button class="starter-card" data-starter="${starter.id}"
        aria-pressed="${journey.selected === starter.id}" style="--element:${starter.color}">
        <span class="card-top"><span>${starter.element.toUpperCase()}</span><span>0${index + 1}</span></span>
        <div class="portrait">${portrait(starter)}<span class="reveal-slot"></span></div>
        <span class="weapon-label">${starter.weapon.toUpperCase()} &middot; STARTER</span>
        ${characterRating(starter.id)}
        <strong>${characterName(starter.id)}</strong>${characterRole(starter.id)}
        <span class="card-tagline">${starter.title}</span>
        <span class="selection-mark">${journey.selected === starter.id ? 'SELECTED' : 'CHOOSE ELEMENT-BEARER'}</span>
      </button>`).join('')}
    </div>
    <div class="selection-detail">
      <p id="starter-detail" aria-live="polite">${journey.selected ? getStarter(journey.selected).description : 'Select Beginner, Infernis; Beginner, Tizu; or Beginner, Flora.'}</p>
      <article id="starter-lore" class="lore-panel" ${journey.selected ? '' : 'hidden'}></article>
      <button id="begin" class="primary-button" ${journey.selected ? '' : 'disabled'}>Begin your journey <span aria-hidden="true">&rarr;</span></button>
    </div>
  </section>`);
  app.querySelectorAll<HTMLButtonElement>('[data-starter]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.starter;
      if (!isStarterId(id)) throw new Error('Invalid starter button.');
      journey.select(id);
      const starter = getStarter(id);
      app.querySelectorAll<HTMLButtonElement>('[data-starter]').forEach((card) => {
        const selected = card.dataset.starter === id;
        card.setAttribute('aria-pressed', String(selected));
        const mark = card.querySelector('.selection-mark');
        const slot = card.querySelector('.reveal-slot');
        if (!mark || !slot) throw new Error('Starter card reveal elements are missing.');
        mark.textContent = selected ? 'SELECTED' : 'CHOOSE ELEMENT-BEARER';
        slot.innerHTML = selected ? elementalReveal(starter) : '';
      });
      const detail = app.querySelector('#starter-detail');
      const lore = app.querySelector<HTMLElement>('#starter-lore');
      const begin = app.querySelector<HTMLButtonElement>('#begin');
      if (!detail || !lore || !begin) throw new Error('Starter selection elements are missing.');
      detail.textContent = `${characterName(starter.id)}: ${starter.lore.awakening}`;
      lore.hidden = false;
      lore.style.setProperty('--element', starter.color);
      lore.innerHTML = `<p class="eyebrow">${starter.lore.origin}</p>
        <h2>${starter.title}</h2><p>${starter.lore.story}</p>
        <blockquote>"${starter.lore.vow}"</blockquote>`;
      begin.disabled = false;
    });
  });
  app.querySelector('#begin')?.addEventListener('click', () => {
    try {
      journey.confirm(localStorage);
      menuPage = 'home';
      renderMenu(true);
      focusHeading();
    } catch (error) {
      console.error('Could not save Last Light starter', error);
      showError(`Your Element-Bearer was not saved. ${errorMessage(error)} Please retry; the journey has not advanced.`);
    }
  });
}

function renderMenu(firstArrival = false): void {
  battleView?.destroy();
  battleView = null;
  if (!journey.profile) throw new Error('The opening menu requires a saved Element-Bearer.');
  const starter = getStarter(journey.profile.starterId);
  try {
    account = loadAccount(localStorage);
    account.characters[starter.id] ??= { level: 0, evolution: 1 };
    account.squad ??= [starter.id];
    if (!selectedCharacter || !ownedCharacters(account).includes(selectedCharacter)) selectedCharacter = starter.id;
    fractalis = account.fractalis;
    walletError = '';
  } catch (error) {
    console.error('Could not load progression', error);
    account = null;
    fractalis = null;
    walletError = errorMessage(error);
  }
  const homeLeader = account && !firstArrival && menuPage === 'home' ? account.squad?.[0] ?? starter.id : starter.id;
  const sanctuary = `${sanctuaryHeader(menuPage, fractalis, account?.lycalis ?? null, !!menuHistory.previous, menuHistory.previous?.page)}<section class="menu-screen sanctuary-content" data-menu-screen="${menuPage}">
    ${walletError ? '<p class="status" id="wallet-error" role="alert"></p>' : ''}
    ${sanctuaryContext(menuPage, characterCategory)}
    ${menuPage !== 'home' ? menuContent(menuPage) : homeHub(isStarterId(homeLeader) ? getStarter(homeLeader) : starter, firstArrival, account)}
  </section>${sanctuaryDock(menuPage)}`;
  frame(`${menuPage === 'battle' ? `<header class="battle-toolbar">
    <button class="battle-chrome-button" data-menu-back>${uiIcon('back')}<span>Leave</span></button>
    <label class="battle-speed-control" for="battle-speed"><span>Speed</span><select id="battle-speed" data-battle-speed aria-label="Battle animation speed">${battleSpeeds.map((value) => `<option value="${value}" ${speed === value ? 'selected' : ''}>${value}&times;</option>`).join('')}</select></label>
    <button id="open-settings" class="battle-chrome-button" aria-haspopup="dialog">${uiIcon('settings')}<span>Settings</span></button>
    </header>${walletError ? '<p class="status" id="wallet-error" role="alert"></p>' : ''}
    <div id="battle-root"></div>` : sanctuary}
    <dialog id="settings-drawer" class="settings-drawer" aria-labelledby="settings-heading">
    ${settingsPanel(motionPreference, bindings, speed)}
    ${menuPage === 'battle' ? `<p class="currency-reward">${currencyIcon('fractalis')}<span>Prismatica <strong id="fractalis-balance">${fractalis ?? 'Unavailable'}</strong></span></p>` : ''}
    <p id="settings-error" class="status" role="alert"></p>
  </dialog>
  ${menuPage === 'battle' ? '' : '<dialog id="max-level-dialog" class="information-modal" aria-labelledby="max-level-heading"><header class="drawer-heading"><button class="drawer-close" type="button" data-close-information aria-label="Close Max Level">&times;</button></header><div data-max-level-content></div><p data-max-level-error role="alert"></p></dialog>'}`, menuPage === 'battle', menuPage !== 'battle');
  pendingMaxLevel = null;
  app.querySelector(`[data-character-category="${characterCategory}"]`)?.setAttribute('aria-current', 'page');
  bindGameplayNavigation(app);
  bindStoryNavigation(app, account);
  bindInventory(app, (tab) => { inventoryTab = tab; });
  bindCreatureGlossary(app, account?.conduitUpgrades);
  bindArchives(app);
  bindSquadPreview(app, account);
  bindSummonRates(app);
  bindConduitUpgrades(app, localStorage, (updated) => { account = updated; renderMenu(); }, showError);
  app.querySelectorAll<HTMLSelectElement>('[data-battle-speed]').forEach((speedControl) => speedControl.addEventListener('change', (event) => {
    if (!(event.currentTarget instanceof HTMLSelectElement)) throw new Error('Battle speed control is missing.');
    const control = event.currentTarget;
    try {
      const selected = parseBattleSpeed(control.value);
      saveBattleSpeed(localStorage, selected);
      speed = selected;
      applyBattleSpeed(speed);
      app.querySelectorAll<HTMLSelectElement>('[data-battle-speed]').forEach((select) => { select.value = String(speed); });
      speedError = '';
      showError([settingsError, hotkeyError].filter(Boolean).join(' '));
    } catch (error) {
      control.value = String(speed);
      console.error('Could not save Last Light battle speed', error);
      speedError = `Battle speed was not changed. ${errorMessage(error)}`;
      showError(speedError);
    }
  }));
  if (speedError) showError(speedError);
  app.querySelectorAll<HTMLButtonElement>('[data-menu-back]').forEach((button) => button.addEventListener('click', async () => {
    try { await backMenu(); }
    catch (error) { console.error('Back navigation failed', error); showError(errorMessage(error)); }
  }));
  app.querySelectorAll<HTMLButtonElement>('[data-page]:not([data-page="conduit-store"]):not([data-page="conduit-upgrade"])').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        const page = button.dataset.page;
        if (!isMenuPage(page)) throw new Error('Unknown menu page.');
        app.querySelector<HTMLDialogElement>('#sanctuary-menu[open]')?.close();
        if (page === menuPage) return;
        await transitionActivity(() => {
          if (page === 'battle' && menuPage !== 'battle') {
            if (!account) throw new Error('Progression save unavailable. Resolve the save error before battling.');
            battleSession = squadSession(loadAccount(localStorage));
          }
          if (page !== 'battle' && menuPage === 'battle') battleSession = null;
          visitMenu(page);
          if (page === 'team' && button.dataset.teamArea) {
            const area = button.dataset.teamArea;
            if (area !== 'squad' && area !== 'bearers' && area !== 'creatures') throw new Error('Unknown Team area.');
            characterCategory = area;
            if (button.dataset.teamCharacter) {
              const id = button.dataset.teamCharacter;
              if (!isStarterId(id) || !account || !ownedCharacters(account).includes(id)) throw new Error('Choose an owned Element-Bearer.');
              selectedCharacter = id;
            }
            if (button.dataset.teamCapture) {
              const id = button.dataset.teamCapture;
              if (!account?.capturedCharacters?.some((copy) => copy.instanceId === id)) throw new Error('Choose an owned captured creature.');
              selectedCapture = id;
            }
          }
          if (page === 'gameplay' && button.hasAttribute('data-machine-activity')) history.replaceState(null, '', '#gameplay-machines');
          if (page === 'gameplay' && button.hasAttribute('data-training-activity')) history.replaceState(null, '', '#gameplay-adventure');
          if (page === 'summon' && button.hasAttribute('data-rose-banner')) selectedBanner = 'roses';
          renderMenu();
        });
      } catch (error) {
        console.error('Activity navigation failed', error);
        showError(errorMessage(error));
      }
    });
  });
  app.querySelectorAll<HTMLButtonElement>('[data-story-stage]').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        const stage = Number(button.dataset.storyStage);
        storyEncounter(stage);
        const current = loadAccount(localStorage);
        if (stage > unlockedStoryStage(current)) throw new Error('Complete the earlier Story stages first.');
        await transitionActivity(() => {
          account = current;
          battleSession = squadSession(current, { storyStage: stage });
          visitMenu('battle');
          renderMenu();
        });
      } catch (error) {
        console.error('Story entry rejected', error);
        showError(errorMessage(error));
      }
    });
  });
  app.querySelectorAll<HTMLButtonElement>('[data-dungeon]').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        const element = button.dataset.dungeon;
        if (!isPlayableDungeon(element)) throw new Error('Unknown playable dungeon.');
        const stageControl = app.querySelector<HTMLSelectElement>(`[data-dungeon-stage="${element}"]`);
        if (!stageControl) throw new Error('Dungeon stage selection is missing.');
        const stage = Number(stageControl.value);
        const current = loadAccount(localStorage);
        if (!Number.isInteger(stage) || stage < 1 || stage > unlockedStage(current, element)) throw new Error('Complete the earlier stages first.');
        await transitionActivity(() => {
          account = current;
          battleSession = squadSession(current, { element, stage });
          visitMenu('battle');
          renderMenu();
        });
      } catch (error) {
        console.error('Dungeon entry rejected', error);
        showError(errorMessage(error));
      }
    });
  });
  app.querySelectorAll<HTMLButtonElement>('[data-war]').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        const character = button.dataset.war;
        if (!isWarCharacter(character)) throw new Error('Unknown Elemental War challenger.');
        const control = app.querySelector<HTMLSelectElement>(`[data-war-stage="${character}"]`);
        if (!control) throw new Error('Elemental War stage selector is missing.');
        const stage = Number(control.value);
        const current = loadAccount(localStorage);
        if (!Number.isInteger(stage) || stage < 1 || stage > unlockedWarStage(current, character)) throw new Error('Complete earlier Elemental War stages first.');
        await transitionActivity(() => {
          account = current;
          battleSession = squadSession(current, { character, stage });
          visitMenu('battle');
          renderMenu();
        });
      } catch (error) {
        console.error('Elemental War entry rejected', error);
        showError(errorMessage(error));
      }
    });
  });
  app.querySelectorAll<HTMLButtonElement>('[data-feature]').forEach((button) => {
    button.addEventListener('click', () => {
      showError(`${button.dataset.feature} is coming later. No units or currency have been changed.`);
    });
  });
  app.querySelectorAll<HTMLButtonElement>('[data-infusion]').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        const mode = button.dataset.infusion;
        if (!isInfusionMode(mode)) throw new Error('Unknown infusion mode.');
        const control = app.querySelector<HTMLSelectElement>(`[data-infusion-stage="${mode}"]`);
        if (!control) throw new Error('Infusion stage selector is missing.');
        const stage = Number(control.value);
        const current = loadAccount(localStorage);
        if (!Number.isInteger(stage) || stage < 1 || stage > unlockedInfusionStage(current, mode)) throw new Error('Complete earlier infusion stages first.');
        await transitionActivity(() => {
          account = current;
          battleSession = squadSession(current, { mode, stage });
          visitMenu('battle');
          renderMenu();
        });
      } catch (error) {
        console.error('Infusion entry rejected', error);
        showError(errorMessage(error));
      }
    });
  });
  app.querySelectorAll<HTMLButtonElement>('[data-character-tab], [data-character-section-tab]').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        const tab = button.dataset.characterTab ?? button.dataset.characterSectionTab;
        if (!tab || !isCharacterTab(tab)) throw new Error('Unknown character upgrade area.');
        if (menuPage === 'team' && characterCategory === 'bearers') {
          characterTab = tab;
          updateCharacterTab(app, getStarter(selectedCharacter ?? starter.id), tab, account);
          if (matchMedia('(max-width: 1100px)').matches) {
            app.querySelector('#upgrade-heading')?.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' });
          }
          return;
        }
        await transitionActivity(() => {
          characterTab = tab;
          visitMenu('character');
          renderMenu();
        });
        app.querySelector<HTMLElement>('#upgrade-heading')?.focus();
      } catch (error) {
        console.error('Character navigation failed', error);
        showError(errorMessage(error));
      }
    });
  });
  const drawer = app.querySelector<HTMLDialogElement>('#settings-drawer');
  if (!drawer) throw new Error('Settings drawer is missing.');
  app.querySelector('#open-settings')?.addEventListener('click', () => {
    if (activityTransitionPending() || app.querySelector('#battle-root')?.getAttribute('aria-busy') === 'true') return;
    battleView?.destroy();
    battleView = null;
    app.querySelector<HTMLDialogElement>('#sanctuary-menu[open]')?.close();
    drawer.showModal();
    if (settingsError || hotkeyError) showError([settingsError, hotkeyError].filter(Boolean).join(' '));
  });
  const closeSettings = (): void => {
    drawer.close();
    if (menuPage === 'battle') renderMenu();
    app.querySelector<HTMLButtonElement>('[data-information="sanctuary-menu"], #open-settings')?.focus();
  };
  app.querySelector('#close-settings')?.addEventListener('click', closeSettings);
  drawer.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeSettings();
  });
  if (menuPage === 'battle') {
    const host = app.querySelector<HTMLElement>('#battle-root');
    if (!host) throw new Error('Battle host is missing.');
    if (!battleSession) {
      if (!account) { showError('Progression save unavailable. Resolve the save error before battling.'); return; }
      battleSession = squadSession(account);
    }
    try {
      account = saveAccountRewards(localStorage, { state: battleSession.state, events: [] }, battleSession.runId);
    } catch (error) {
      console.error('Creature discovery could not be saved', error);
      showError(`The encounter cannot start until discoveries can be saved. ${errorMessage(error)}`);
      return;
    }
    battleView = new BattleView(host, battleSession, bindings, (result) => {
      const balance = app.querySelector('#fractalis-balance');
      if (!balance) throw new Error('Prismatica balance region is missing.');
      try {
        if (!battleSession) throw new Error('Battle session is missing.');
        account = saveAccountRewards(localStorage, result, battleSession.runId);
        fractalis = account.fractalis;
      } catch (error) {
        throw new Error(`Rewards could not be saved. The battle action was not applied; retry when storage is available. ${errorMessage(error)}`);
      }
      walletError = '';
      balance.textContent = String(fractalis);
      const premium = app.querySelector('#lycalis-balance');
      if (premium) premium.textContent = String(account.lycalis);
      const error = app.querySelector('#wallet-error');
      if (error) error.textContent = '';
    }, backMenu);
  }
  const walletStatus = app.querySelector('#wallet-error');
  if (walletStatus) walletStatus.textContent = walletError;
  app.querySelectorAll<HTMLButtonElement>('[data-buy-conduit]').forEach((button) => {
    button.addEventListener('click', async () => {
      let saved = false;
      try {
        if (button.disabled) return;
        const id = button.dataset.buyConduit;
        if (!isConduitId(id)) throw new Error('Unknown Conduit.');
        const conduit = getConduit(id);
        const current = loadAccount(localStorage);
        if (!await gameConfirm(`Buy one ${conduit.name} for ${conduit.price} Prismatica? ${conduitEffect(conduit, current.conduitUpgrades?.[id])} when equipped. One owned copy unlocks it for every character; extra copies add no equipment benefit.`, { title: 'Purchase Conduit', confirmLabel: 'Buy one' })) return;
        account = purchaseConduit(localStorage, id);
        saved = true;
        renderMenu();
        const result = app.querySelector('#conduit-purchase-result');
        if (!result) throw new Error('Conduit purchase status is missing.');
        result.textContent = `${conduit.name} purchased. Owned ${account.conduits?.[id]}.`;
        await presentReward(conduitReward(id, account, 'Conduit acquired', `${conduit.price} Prismatica spent`));
        app.querySelector<HTMLButtonElement>(`[data-buy-conduit="${id}"]`)?.focus({ preventScroll: true });
      } catch (error) {
        console.error('Conduit purchase rejected', error);
        showError(`${saved ? 'Conduit purchased and saved, but its presentation could not complete. Check Inventory.' : 'Conduit purchase was not completed.'} ${errorMessage(error)}`);
      }
    });
  });
  app.querySelectorAll<HTMLButtonElement>('[data-owned-character]').forEach((button) => {
    button.addEventListener('click', () => {
      try {
        const id = button.dataset.ownedCharacter;
        const current = loadAccount(localStorage);
        if (!isStarterId(id) || !ownedCharacters(current).includes(id)) throw new Error('Choose an owned character.');
        selectedCharacter = id;
        visitMenu('character');
        renderMenu();
        app.querySelector<HTMLElement>('#upgrade-heading')?.focus();
      } catch (error) {
        console.error('Character selection failed', error);
        showError(errorMessage(error));
      }
    });
  });
  const squadForm = app.querySelector<HTMLFormElement>('#squad-form');
  app.querySelectorAll<HTMLButtonElement>('[data-sell-creature]').forEach((button) => button.addEventListener('click', async () => {
    try {
      const id = button.dataset.sellCreature;
      if (!id) throw new Error('Currency-farm copy is missing.');
      const offer = creatureSaleOffer(loadAccount(localStorage), id);
      if (offer.reasons.length) throw new Error(`Sale protected: ${offer.reasons.join(', ')}.`);
      const payout = [
        ...(offer.fractalis ? [`${offer.fractalis.toLocaleString('en-US')} Prismatica`] : []),
        ...(offer.lycalis ? [`${offer.lycalis} Null-Prismatica`] : []),
        ...Object.entries(offer.materials).map(([id, amount]) => `${amount} ${materialName(id)}`),
      ].join(' + ');
      if (!await gameConfirm(`Permanently sell ${getCreature(offer.copy.creatureId).name} (${id}) for ${payout}? This exact copy will be removed and cannot be restored.`, { title: 'Sell creature', confirmLabel: 'Sell copy', danger: true })) return;
      account = sellCurrencyCreature(localStorage, id);
      renderMenu();
      const status = app.querySelector('#character-lock-result');
      if (status) status.textContent = `Creature sold · +${payout}.`;
    } catch (error) {
      console.error('Currency-farm creature sale rejected', error);
      showError(`Creature was not sold. ${errorMessage(error)}`);
    }
  }));
  app.querySelectorAll<HTMLButtonElement>('[data-level-capture]').forEach((button) => button.addEventListener('click', async () => {
    try {
      const id = button.dataset.levelCapture;
      if (!id) throw new Error('Captured creature is missing.');
      if (!await gameConfirm('Spend the listed Prismatica and materials to level up this captured copy?', { title: 'Level up creature', confirmLabel: 'Level up' })) return;
      account = levelCapturedCharacter(localStorage, id, Number(button.dataset.expectedLevel));
      renderMenu();
    } catch (error) {
      console.error('Captured creature level rejected', error);
      showError(`Level was not changed. ${errorMessage(error)}`);
    }
  }));
  app.querySelectorAll<HTMLSelectElement>('[data-capture-conduit]').forEach((select) => select.addEventListener('change', () => {
    try {
      const id = select.dataset.captureConduit;
      if (!id || (select.value && !isConduitId(select.value))) throw new Error('Invalid captured equipment selection.');
      account = equipConduit(localStorage, id, Number(select.dataset.captureSlot), isConduitId(select.value) ? select.value : null);
      renderMenu();
    } catch (error) {
      console.error('Captured equipment rejected', error);
      renderMenu();
      showError(`Conduits were not changed. ${errorMessage(error)}`);
    }
  }));
  app.querySelectorAll<HTMLButtonElement>('[data-character-lock]').forEach((button) => {
    button.addEventListener('click', () => {
      try {
        const id = button.dataset.characterLock;
        const value = button.dataset.lockValue;
        if (!id || (value !== 'true' && value !== 'false')) throw new Error('Invalid character lock control.');
        account = setCharacterLock(localStorage, id, value === 'true');
        renderMenu();
        const result = app.querySelector('#character-lock-result');
        if (!result) throw new Error('Character lock status is missing.');
        result.textContent = value === 'true' ? 'Character locked.' : 'Character unlocked.';
      } catch (error) {
        console.error('Character lock update rejected', error);
        showError(`Character lock was not changed. ${errorMessage(error)}`);
      }
    });
  });
  squadForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    try {
      const form = new FormData(squadForm);
      const ids: string[] = [];
      for (let slot = 0; slot < 3; slot++) {
        const id = form.get(`slot-${slot}`);
        if (id === '' && slot > 0) continue;
        if (typeof id !== 'string' || !ownedCharacterInstances(loadAccount(localStorage)).includes(id)) throw new Error('Choose a valid squad member.');
        ids.push(id);
      }
      account = setSquad(localStorage, ids);
      renderMenu();
      const status = app.querySelector('#squad-result');
      if (!status) throw new Error('Squad status region is missing.');
      status.textContent = 'Squad saved.';
    } catch (error) {
      console.error('Squad update rejected', error);
      showError(`Squad was not changed. ${errorMessage(error)}`);
    }
  });
  app.querySelector<HTMLButtonElement>('#summon-character')?.addEventListener('click', async () => {
    if (gameDialogPending()) return;
    let saved = false;
    try {
      const banner = getSummonBanner(selectedBanner);
      if (!await gameConfirm(`Spend ${banner.cost} Null-Prismatica for one ${banner.name} draw? See Rates & Information for odds and reward rules.`, { title: banner.name, confirmLabel: 'Summon' })) return;
      const result = summonCharacter(localStorage, Math.random, banner.id);
      saved = true;
      account = result.account;
      renderMenu();
      const status = app.querySelector('#summon-result');
      if (!status) throw new Error('Summon status is missing.');
      const form = result.copy ? capturedProgress(result.copy).tier + 1 : 1;
      const name = result.copy ? `${getCreature(result.copy.creatureId).name} creature · ${evolutionRarity(form)} · ${form}-star · Lv.${result.copy.level}`
        : result.entry.kind === 'character' ? `${characterName(result.entry.id)} · New Element-Bearer · Common · ${result.entry.stars}-star · Lv.0` : '';
      if (!name) throw new Error('Summon reward identity is missing.');
      status.textContent = `${result.duplicate ? 'Owned EB converted: ' : 'Received: '}${name}. ${banner.cost} Null-Prismatica spent.${result.guarantee !== 'none' ? ` Pity: ${result.guarantee}.` : ''}${result.bonusConduit ? ` Bonus: ${getConduit(result.bonusConduit).name} · Legendary Conduit. Not auto-equipped.` : ''}`;
      await presentReward(summonReward(result, banner.id));
      app.querySelector<HTMLButtonElement>('#summon-character')?.focus({ preventScroll: true });
    } catch (error) {
      console.error('Summoning rejected', error);
      showError(`${saved ? 'Your summon reward is saved, but its presentation could not complete. Check Team and Inventory.' : 'Summoning was not completed.'} ${errorMessage(error)}`);
    }
  });
  const settingsForm = app.querySelector<HTMLFormElement>('#settings-form');
  settingsForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = new FormData(settingsForm).get('motion');
    if (value !== 'system' && value !== 'reduced') throw new Error('Invalid motion option.');
    try {
      saveMotion(localStorage, value);
      motionPreference = value;
      applyMotion(value);
      settingsError = '';
      showError(hotkeyError);
      const message = app.querySelector('#settings-result');
      if (!message) throw new Error('Settings result region is missing.');
      message.textContent = 'Motion preference saved.';
    } catch (error) {
      console.error('Could not save Last Light settings', error);
      showError(`Settings were not saved. ${errorMessage(error)}`);
    }
  });
  const hotkeyForm = app.querySelector<HTMLFormElement>('#hotkey-form');
  hotkeyForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const hotkeyResult = app.querySelector('#hotkey-result');
    if (!hotkeyResult) throw new Error('Hotkey result region is missing.');
    hotkeyResult.textContent = '';
    const candidate: Record<string, FormDataEntryValue> = {};
    const form = new FormData(hotkeyForm);
    for (const [command] of commands) {
      const value = form.get(command);
      if (value === null) throw new Error('A hotkey field is missing.');
      candidate[command] = value;
    }
    try {
      const validated = validateBindings(candidate);
      saveBindings(localStorage, validated);
      bindings = validated;
      hotkeyError = '';
      showError(settingsError);
      const result = app.querySelector('#hotkey-result');
      if (!result) throw new Error('Hotkey result region is missing.');
      result.textContent = 'Selection keys saved.';
    } catch (error) {
      console.error('Could not save battle hotkeys', error);
      showError(`Hotkeys were not changed. ${errorMessage(error)}`);
    }
  });
  app.querySelector('#return-title')?.addEventListener('click', async () => {
    if (gameDialogPending()) return;
    try {
      if (menuPage === 'battle' && !await gameConfirm('End this battle and return to the title? Saved rewards are kept; encounter progress is not.', { title: 'Leave battle', confirmLabel: 'Return to title' })) return;
      battleView?.destroy();
      battleView = null;
      battleSession = null;
      drawer.close();
      menuHistory.clear();
      menuPage = 'home';
      inventoryTab = 'materials';
      journey.screen = 'title';
      render();
      app.querySelector<HTMLButtonElement>('#enter')?.focus();
    } catch (error) {
      console.error('Could not return to title', error);
      showError(`Could not leave this screen. ${errorMessage(error)}`);
    }
  });
}

function menuContent(page: Exclude<MenuPage, 'home'> | 'settings'): string {
  if (!journey.profile) throw new Error('A saved Element-Bearer is required.');
  const starter = getStarter(journey.profile.starterId);
  if (page === 'battle') return '<div id="battle-root"></div>';
  if (page === 'team' && characterCategory === 'squad') return squadHub(account);
  if (page === 'character' || page === 'team') return characterInformation() + (characterCategory === 'bearers'
    ? `${characterHub(getStarter(selectedCharacter ?? starter.id), characterTab, account)}<details class="character-protection"><summary>Element-Bearer protection</summary>${characterCopyManagement(account, 'bearers')}</details>`
    : characterCopyManagement(account, 'creatures', selectedCapture));
  if (page === 'inventory') return inventoryHub(account, inventoryTab);
  if (page === 'stores') return `${information('stores-information', 'Stores', '<p>Select a store to view its catalog and prices. Purchases use saved currency and require confirmation. Inventory lists owned items; equipment is managed in Character.</p>')}<section class="destination-group"><h2>Stores</h2><div class="destination-grid"><button class="destination-card" data-page="conduit-store">${currencyIcon('fractalis')}<strong>Conduit Store</strong><small>Conduits · Prismatica</small></button></div></section>`;
  if (page === 'collections') return archives(account);
  if (page === 'conduit-store') return conduitStore(account);
  if (page === 'conduit-upgrade') return conduitUpgradeMenu(account);
  if (page === 'archives' || page === 'glossary') return archives(account, page === 'glossary' ? 'creatures' : 'characters');
  if (page === 'squad') return squadHub(account);
  if (page === 'summon') return summonHub(account, selectedBanner);
  if (page === 'gameplay') return gameplayHub(account);
  if (page === 'story') return storyCampaign(account, starter.id);
  if (page === 'events') return roseEvent(account);
  return settingsPanel(motionPreference, bindings, speed);
}

function render(): void {
  if (journey.screen === 'title') renderTitle();
  else if (journey.screen === 'selection') renderSelection();
  else renderMenu();
}

app.addEventListener('click', async (event) => {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest<HTMLButtonElement>('[data-upgrade]');
  if (!button || button.disabled || menuPage !== 'team' || characterCategory !== 'bearers') return;
  try {
    if (!journey.profile || !account) throw new Error('Character progression is unavailable.');
    const kind = button.dataset.upgrade;
    if (kind !== 'level' && kind !== 'evolve') throw new Error('Unknown or unavailable character upgrade.');
    const starter = getStarter(selectedCharacter ?? journey.profile.starterId);
    const expected = ownedProgress(account, starter.id);
    const cost = kind === 'level' ? characterLevelCost(starter.id, expected) : characterEvolutionCost(starter.id, expected);
    const materials = Object.entries(cost.materials).map(([id, amount]) => `${amount} ${materialName(id)}`).join(', ');
    const fodderIds = Array.from(app.querySelectorAll<HTMLInputElement>('[data-evolution-fodder]:checked')).map((input) => input.dataset.evolutionFodder ?? '');
    const options = fodderIds.length ? evolutionFodderOptions(account, starter.elementId, expected.evolution, starter.id) : [];
    const consumed = fodderIds.map((id) => {
      const option = options.find((entry) => entry.copy.instanceId === id);
      if (!option) throw new Error('Selected captured creature is missing.');
      return `${option.creature.name} · Copy ${option.index} · Lv.${option.copy.level ?? capturedProgress(option.copy).level} · Form ${option.form}`;
    });
    if (!await gameConfirm(`${kind === 'level' ? 'Level up' : 'Evolve'} ${characterName(starter.id, expected.evolution)} for ${cost.fractalis} Prismatica and ${materials}?${consumed.length ? `\n\nPermanently consume these captured creatures:\n${consumed.join('\n')}\n\nThis cannot be undone.` : ''}`, { title: kind === 'level' ? 'Level up' : 'Evolution', confirmLabel: kind === 'level' ? 'Level up' : 'Evolve', danger: consumed.length > 0 })) return;
    const currency = app.querySelector('#fractalis-balance');
    const premium = app.querySelector('#lycalis-balance');
    if (!currency || !premium) throw new Error('Currency display is missing.');
    account = upgradeCharacter(localStorage, starter.id, kind, expected, fodderIds);
    const updatedAccount = account;
    fractalis = account.fractalis;
    updateCharacterTab(app, starter, characterTab, account);
    const progress = ownedProgress(account, starter.id);
    const rosterButton = app.querySelector(`[data-owned-character="${starter.id}"]`);
    const rosterLevel = rosterButton?.querySelector('span > small');
    const rosterName = rosterButton?.querySelector('span > strong');
    if (rosterName) rosterName.textContent = characterName(starter.id, progress.evolution);
    if (rosterLevel) rosterLevel.textContent = `Lv.${progress.level} · Evo.${progress.evolution}`;
    const rosterPortrait = rosterButton?.querySelector('img');
    if (rosterPortrait) {
      const art = portraitAttributes(starter, progress.evolution);
      rosterPortrait.src = art.src;
      rosterPortrait.alt = art.alt;
      const facing = characterFacing(starter.id, progress.evolution);
      rosterPortrait.dataset.facing = facing.facing;
      rosterPortrait.dataset.mirrored = String(facing.mirrored);
    }
    currency.textContent = String(account.fractalis);
    premium.textContent = String(account.lycalis);
    if (fodderIds.length) renderMenu();
    celebrateUpgrade(app, starter, kind, ownedProgress(updatedAccount, starter.id));
    const result = app.querySelector('#upgrade-result');
    if (result) result.textContent = `${characterName(starter.id, progress.evolution)} ${kind === 'level' ? 'leveled up' : 'evolved'}.`;
    else showError(`${characterName(starter.id, progress.evolution)} ${kind === 'level' ? 'leveled up' : 'evolved'}.`);
  } catch (error) {
    console.error('Character upgrade rejected', error);
    showError(`Upgrade was not completed. ${errorMessage(error)}`);
  }
});

app.addEventListener('change', (event) => {
  if (!(event.target instanceof HTMLInputElement) || !event.target.matches('[data-evolution-fodder]')) return;
  const button = app.querySelector<HTMLButtonElement>('[data-upgrade="evolve"]');
  const status = app.querySelector<HTMLElement>('[data-fodder-status]');
  if (!button || !status) {
    console.error('Evolution selection controls are missing.');
    showError('Evolution selection unavailable. Reopen the evolution screen.');
    return;
  }
  const selected = app.querySelectorAll('[data-evolution-fodder]:checked').length;
  const required = Number(button.dataset.fodderCount);
  button.disabled = button.dataset.upgradeBlocked === 'true' || selected !== required;
  status.textContent = `${selected} / ${required} selected${selected > required ? ' · Select fewer creatures' : ''}`;
});

app.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest<HTMLButtonElement>('[data-summon-banner]');
  if (!button || menuPage !== 'summon') return;
  try {
    const id = button.dataset.summonBanner;
    if (!isSummonBannerId(id)) throw new Error('Unknown summon banner.');
    if (id === selectedBanner) return;
    selectedBanner = id;
    renderMenu();
    app.querySelector<HTMLButtonElement>(`[data-summon-banner="${id}"]`)?.focus({ preventScroll: true });
  } catch (error) {
    console.error('Banner selection failed', error);
    showError(errorMessage(error));
  }
});

app.addEventListener('click', async (event) => {
  if (!(event.target instanceof Element)) return;
  const category = event.target.closest<HTMLButtonElement>('[data-character-category]');
  const capture = event.target.closest<HTMLButtonElement>('[data-owned-capture]');
  const max = event.target.closest<HTMLButtonElement>('[data-max-level]');
  const confirmMax = event.target.closest<HTMLButtonElement>('[data-confirm-max-level]');
  if (!category && !capture && !max && !confirmMax) return;
  try {
    if (category) {
      const value = category.dataset.characterCategory;
      if (value !== 'squad' && value !== 'bearers' && value !== 'creatures') throw new Error('Unknown Team area.');
      characterCategory = value;
      renderMenu();
      app.querySelector<HTMLButtonElement>(`[data-character-category="${value}"]`)?.focus({ preventScroll: true });
    } else if (capture) {
      const id = capture.dataset.ownedCapture;
      if (!id || !loadAccount(localStorage).capturedCharacters?.some((copy) => copy.instanceId === id)) throw new Error('Choose an owned captured creature.');
      selectedCapture = id;
      renderMenu();
      app.querySelector<HTMLButtonElement>(`[data-owned-capture="${id}"]`)?.focus({ preventScroll: true });
    } else if (max) {
      const id = max.dataset.maxLevel;
      if (!id) throw new Error('Character selection is missing.');
      const preview = maxLevelPreview(loadAccount(localStorage), id);
      const dialog = app.querySelector<HTMLDialogElement>('#max-level-dialog');
      const content = dialog?.querySelector('[data-max-level-content]');
      if (!dialog || !content) throw new Error('Max Level panel is missing.');
      pendingMaxLevel = preview.plan;
      content.innerHTML = preview.html;
      const error = dialog.querySelector('[data-max-level-error]');
      if (error) error.textContent = '';
      max.focus({ preventScroll: true });
      dialog.showModal();
    } else if (confirmMax) {
      if (!pendingMaxLevel) throw new Error('Reopen Max Level to calculate the current cost.');
      const id = pendingMaxLevel.id;
      const dialog = app.querySelector<HTMLDialogElement>('#max-level-dialog');
      const currency = app.querySelector('#fractalis-balance');
      if (!dialog || !currency) throw new Error('Max Level controls are missing.');
      account = levelCharacterToMaximum(localStorage, pendingMaxLevel);
      fractalis = account.fractalis;
      pendingMaxLevel = null;
      dialog.close();
      if (isStarterId(id)) {
        const starter = getStarter(id);
        updateCharacterTab(app, starter, characterTab, account);
        const progress = ownedProgress(account, id);
        const label = app.querySelector(`[data-owned-character="${id}"] span > small`);
        if (label) label.textContent = `Lv.${progress.level} · Evo.${progress.evolution}`;
        currency.textContent = String(account.fractalis);
        celebrateUpgrade(app, starter, 'level', progress);
      } else renderMenu();
      app.querySelector<HTMLButtonElement>(`[data-max-level="${id}"]`)?.focus({ preventScroll: true });
      const result = app.querySelector('#upgrade-result') ?? app.querySelector('#character-lock-result');
      if (result) result.textContent = 'Leveling complete.';
    }
  } catch (error) {
    console.error('Character management failed', error);
    const status = app.querySelector('[data-max-level-error]');
    if (status && app.querySelector('#max-level-dialog[open]')) status.textContent = errorMessage(error);
    else showError(errorMessage(error));
  }
});

app.addEventListener('click', async (event) => {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest<HTMLElement>('[data-page="conduit-store"], [data-page="conduit-upgrade"]');
  if (!button) return;
  try {
    const destination = button.dataset.page;
    if (destination !== 'conduit-store' && destination !== 'conduit-upgrade') throw new Error('Unknown Conduit menu.');
    app.querySelector<HTMLDialogElement>('#sanctuary-menu[open]')?.close();
    if (menuPage === destination) return;
    await transitionActivity(() => {
      visitMenu(destination);
      renderMenu();
    });

  } catch (error) {
    console.error('Conduit menu navigation failed', error);
    showError(errorMessage(error));
  }
});

app.addEventListener('change', (event) => {
  if (!(event.target instanceof HTMLSelectElement) || !event.target.matches('[data-conduit-slot]')) return;
  try {
    if (menuPage !== 'team' || characterCategory !== 'bearers' || !selectedCharacter) throw new Error('Choose an owned character before equipping.');
    const control = event.target;
    const id = control.value === '' ? null : control.value;
    if (id !== null && !isConduitId(id)) throw new Error('Unknown Conduit.');
    account = equipConduit(localStorage, selectedCharacter, Number(control.dataset.conduitSlot), id);
    updateCharacterTab(app, getStarter(selectedCharacter), 'equipment', account);
    const status = app.querySelector('#conduit-equipment-result');
    if (!status) throw new Error('Conduit equipment status is missing.');
    status.textContent = `${id === null ? 'Conduit removed' : `${getConduit(id).name} equipped`}.`;
    app.querySelector<HTMLSelectElement>(`[data-conduit-slot="${control.dataset.conduitSlot}"]`)?.focus({ preventScroll: true });
  } catch (error) {
    console.error('Conduit equipment rejected', error);
    if (account && selectedCharacter) updateCharacterTab(app, getStarter(selectedCharacter), 'equipment', account);
    showError(`Equipment was not changed. ${errorMessage(error)}`);
  }
});

document.addEventListener('keydown', (event) => {
  if (gameDialogPending()) return;
  if (journey.screen !== 'title' || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
  if (['Tab', 'Shift', 'Control', 'Alt', 'Meta', 'Escape'].includes(event.key)) return;
  if (app.querySelector<HTMLElement>('#save-recovery:not([hidden])')) return;
  event.preventDefault();
  enter();
});

render();
if (settingsError) showError(settingsError);
if (hotkeyError) showError([settingsError, hotkeyError].filter(Boolean).join(' '));
if (speedError) showError([settingsError, hotkeyError, speedError].filter(Boolean).join(' '));
