import './style.css';
import './sanctuary.css';
import './neutral-theme.css';
import './character-screen.css';
import './presentation/settings-panel.css';
import { settingsPanel } from './presentation/settings-panel';
import './creature-glossary.css';
import './numeric-layout.css';
import { creatureGlossary, bindCreatureGlossary } from './presentation/creature-glossary';
import { availableStarters, getStarter, isStarterId, type StarterId } from './content/starters';
import { characterRoster, squadHub, summonHub } from './presentation/roster';
import { Journey } from './game/flow';
import { SAVE_KEY } from './game/profile';
import { portrait, portraitAttributes } from './presentation/portrait';
import { characterRole } from './presentation/character-role';
import { unitFacing } from './presentation/unit-facing';
import { characterArt } from './content/character-art';
import { uiIcon } from './presentation/ui-icon';
import { currencyIcon } from './presentation/currency-icon';
import { applyBattleSpeed, battleSpeeds, loadBattleSpeed, parseBattleSpeed, saveBattleSpeed, type BattleSpeed } from './presentation/battle-speed';
import { celebrateUpgrade } from './presentation/upgrade-celebration';
import { activityTransitionPending, transitionActivity } from './presentation/activity-transition';
import { createBackdrop } from './presentation/backdrop';
import { elementalReveal } from './presentation/reveal';
import { applyMotion, loadMotion, saveMotion, type MotionPreference } from './presentation/settings';
import { commands, defaultBindings, loadBindings, saveBindings, validateBindings } from './game/hotkeys';
import { BattleView, createSession, type BattleSession } from './presentation/battle-view';
import { characterHub, homeHub, inventoryHub, isCharacterTab, updateCharacterTab } from './presentation/hub';
import { loadAccount, ownedProgress, equippedSquad, ownedCharacters, setSquad, summonCharacter, summonCost, saveAccountRewards, unlockedStage, unlockedInfusionStage, upgradeCharacter, type Account } from './game/account';
import { isInfusionMode } from './content/infusions';
import { isPlayableDungeon } from './content/dungeons';
import { levelCost, evolutionCost, weaponCost } from './content/progression';
import { materialName } from './content/dungeon-art';
import { gameplayHub, bindGameplayNavigation } from './presentation/gameplay';
import { isMenuPage, sanctuaryHeader, sanctuaryNavigation, type MenuPage } from './presentation/sanctuary';

const root = document.querySelector<HTMLElement>('#app');
if (!root) throw new Error('Application root is missing.');
const app = root;
app.addEventListener('error', (event) => {
  if (!(event.target instanceof HTMLImageElement)) return;
  console.error('Artwork failed to load', event.target.src);
  showError(`Artwork could not load for ${event.target.alt}. Please reload or check the asset deployment.`);
}, true);
const journey = new Journey();
let menuPage: MenuPage = 'home';
let characterTab = 'overview';
let selectedCharacter: StarterId | null = null;
let summonedCharacter: StarterId | undefined;
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
try {
  account = loadAccount(localStorage);
  fractalis = account.fractalis;
} catch (error) {
  console.error('Could not load Last Light Fractalis balance', error);
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
  const leader = ids[0];
  return createSession(leader, ownedProgress(current, leader), destination, { ids, progress: current.characters });
}

function showError(message: string): void {
  const status = app.querySelector<HTMLElement>('dialog[open] #settings-error') ??
    app.querySelector<HTMLElement>('#status');
  if (!status) throw new Error('Status region is missing.');
  status.textContent = message;
}

function frame(body: string, battle = false, sanctuary = false): void {
  document.body.classList.toggle('in-battle', battle);
  app.innerHTML = battle ? `<div class="battle-screen">${body}<p id="status" class="status" role="alert"></p></div>` : `<div class="shell ${sanctuary ? 'sanctuary-shell' : ''}">
    ${sanctuary ? '' : '<header class="masthead"><span class="brand-mark">L / L</span><span>LAST LIGHT</span><span class="build-label">PRELUDE &middot; 0.1</span></header>'}
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
    <p class="quiet">Your story begins with one companion.</p>
    <button id="save-recovery" class="text-button" hidden>Clear unreadable local save</button>
  </section>`);
  app.querySelector('#enter')?.addEventListener('click', enter);
  app.querySelector('#save-recovery')?.addEventListener('click', () => {
    if (!confirm('Delete the local Last Light save on this browser? This cannot be undone.')) return;
    try {
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
    <p class="eyebrow">CHAPTER ZERO &nbsp; / &nbsp; A FIRST LIGHT</p>
    <h1 tabindex="-1">Choose your companion</h1>
    <p class="subtitle">Choose your first light: Infernic (fire), Aquatic (water), or Efflorescent (nature). Your journey begins solo.</p>
    <div class="starter-grid" role="group" aria-label="Starter companions">
      ${availableStarters.map((starter, index) => `<button class="starter-card" data-starter="${starter.id}"
        aria-pressed="${journey.selected === starter.id}" style="--element:${starter.color}">
        <span class="card-top"><span>${starter.element.toUpperCase()}</span><span>0${index + 1}</span></span>
        <div class="portrait">${portrait(starter)}<span class="reveal-slot"></span></div>
        <span class="weapon-label">${starter.weapon.toUpperCase()} &middot; STARTER</span>
        <strong>${starter.name}</strong>${characterRole(starter.id)}
        <span class="card-tagline">${starter.title}</span>
        <span class="selection-mark">${journey.selected === starter.id ? 'SELECTED' : 'CHOOSE COMPANION'}</span>
      </button>`).join('')}
    </div>
    <div class="selection-detail">
      <p id="starter-detail" aria-live="polite">${journey.selected ? getStarter(journey.selected).description : 'Select a companion to discover your first light.'}</p>
      <article id="starter-lore" class="lore-panel" ${journey.selected ? '' : 'hidden'}></article>
      <button id="begin" class="primary-button" ${journey.selected ? '' : 'disabled'}>Begin your journey <span aria-hidden="true">&rarr;</span></button>
    </div>
    <p class="quiet">Saved on this browser &middot; Supplied starter artwork</p>
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
        mark.textContent = selected ? 'SELECTED' : 'CHOOSE COMPANION';
        slot.innerHTML = selected ? elementalReveal(starter) : '';
      });
      const detail = app.querySelector('#starter-detail');
      const lore = app.querySelector<HTMLElement>('#starter-lore');
      const begin = app.querySelector<HTMLButtonElement>('#begin');
      if (!detail || !lore || !begin) throw new Error('Starter selection elements are missing.');
      detail.textContent = `${starter.name}: ${starter.lore.awakening}`;
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
      showError(`Your companion was not saved. ${errorMessage(error)} Please retry; the journey has not advanced.`);
    }
  });
}

function renderMenu(firstArrival = false): void {
  battleView?.destroy();
  battleView = null;
  if (!journey.profile) throw new Error('The opening menu requires a saved companion.');
  const starter = getStarter(journey.profile.starterId);
  try {
    account = loadAccount(localStorage);
    if (!selectedCharacter || !ownedCharacters(account).includes(selectedCharacter)) selectedCharacter = starter.id;
    fractalis = account.fractalis;
    walletError = '';
  } catch (error) {
    console.error('Could not load progression', error);
    account = null;
    fractalis = null;
    walletError = errorMessage(error);
  }
  const sanctuary = `${sanctuaryHeader(menuPage, fractalis, account?.lycalis ?? null)}<section class="menu-screen sanctuary-content">
    ${walletError ? '<p class="status" id="wallet-error" role="alert"></p>' : ''}
    ${menuPage !== 'home' ? menuContent(menuPage) : homeHub(account && !firstArrival ? getStarter(equippedSquad(account)[0]) : starter, firstArrival, account)}
  </section>${sanctuaryNavigation(menuPage)}`;
  frame(`${menuPage === 'battle' ? `<header class="battle-toolbar">
    <button class="battle-chrome-button" data-page="gameplay">${uiIcon('back')}<span>Leave</span></button>
    <label class="battle-speed-control" for="battle-speed"><span>Speed</span><select id="battle-speed" data-battle-speed aria-label="Battle animation speed">${battleSpeeds.map((value) => `<option value="${value}" ${speed === value ? 'selected' : ''}>${value}&times;</option>`).join('')}</select></label>
    <button id="open-settings" class="battle-chrome-button" aria-haspopup="dialog">${uiIcon('settings')}<span>Settings</span></button>
    </header>${walletError ? '<p class="status" id="wallet-error" role="alert"></p>' : ''}
    <div id="battle-root"></div>` : sanctuary}
    <dialog id="settings-drawer" class="settings-drawer" aria-labelledby="settings-heading">
    ${settingsPanel(motionPreference, bindings, speed)}
    ${menuPage === 'battle' ? `<p class="currency-reward">${currencyIcon('fractalis')}<span>Fractalis <strong id="fractalis-balance">${fractalis ?? 'Unavailable'}</strong></span></p>` : ''}
    <p id="settings-error" class="status" role="alert"></p>
  </dialog>`, menuPage === 'battle', menuPage !== 'battle');
  bindGameplayNavigation(app);
  bindCreatureGlossary(app);
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
  app.querySelectorAll<HTMLButtonElement>('[data-page]').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        const page = button.dataset.page;
        if (!isMenuPage(page)) throw new Error('Unknown menu page.');
        if (page === menuPage) return;
        await transitionActivity(() => {
          if (page === 'battle' && menuPage !== 'battle') {
            if (!account) throw new Error('Progression save unavailable. Resolve the save error before battling.');
            battleSession = squadSession(loadAccount(localStorage));
          }
          if (page !== 'battle' && menuPage === 'battle') battleSession = null;
          menuPage = page;
          renderMenu();
        });
      } catch (error) {
        console.error('Activity navigation failed', error);
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
          menuPage = 'battle';
          renderMenu();
        });
      } catch (error) {
        console.error('Dungeon entry rejected', error);
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
          menuPage = 'battle';
          renderMenu();
        });
      } catch (error) {
        console.error('Infusion entry rejected', error);
        showError(errorMessage(error));
      }
    });
  });
  app.querySelectorAll<HTMLButtonElement>('[data-character-tab]').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        const tab = button.dataset.characterTab;
        if (!tab || !isCharacterTab(tab)) throw new Error('Unknown character upgrade area.');
        if (menuPage === 'character') {
          characterTab = tab;
          updateCharacterTab(app, getStarter(selectedCharacter ?? starter.id), tab, account);
          return;
        }
        await transitionActivity(() => {
          characterTab = tab;
          menuPage = 'character';
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
    drawer.showModal();
    if (settingsError || hotkeyError) showError([settingsError, hotkeyError].filter(Boolean).join(' '));
  });
  const closeSettings = (): void => {
    drawer.close();
    renderMenu();
    app.querySelector<HTMLButtonElement>('#open-settings')?.focus();
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
      if (!balance) throw new Error('Fractalis balance region is missing.');
      try {
        if (!battleSession) throw new Error('Battle session is missing.');
        account = saveAccountRewards(localStorage, result, battleSession.runId);
        fractalis = account.fractalis;
      } catch (error) {
        throw new Error(`Rewards could not be saved. The battle action was not applied; retry when storage is available. ${errorMessage(error)}`);
      }
      walletError = '';
      balance.textContent = String(fractalis);
      const error = app.querySelector('#wallet-error');
      if (error) error.textContent = '';
    }, () => transitionActivity(() => {
      battleSession = null;
      menuPage = 'gameplay';
      renderMenu();
    }));
  }
  const walletStatus = app.querySelector('#wallet-error');
  if (walletStatus) walletStatus.textContent = walletError;
  app.querySelectorAll<HTMLButtonElement>('[data-owned-character]').forEach((button) => {
    button.addEventListener('click', () => {
      try {
        const id = button.dataset.ownedCharacter;
        const current = loadAccount(localStorage);
        if (!isStarterId(id) || !ownedCharacters(current).includes(id)) throw new Error('Choose an owned character.');
        selectedCharacter = id;
        menuPage = 'character';
        renderMenu();
        app.querySelector<HTMLElement>('#upgrade-heading')?.focus();
      } catch (error) {
        console.error('Character selection failed', error);
        showError(errorMessage(error));
      }
    });
  });
  const squadForm = app.querySelector<HTMLFormElement>('#squad-form');
  squadForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    try {
      const form = new FormData(squadForm);
      const ids: StarterId[] = [];
      for (let slot = 0; slot < 3; slot++) {
        const id = form.get(`slot-${slot}`);
        if (id === '' && slot > 0) continue;
        if (!isStarterId(id)) throw new Error('Choose a valid squad member.');
        ids.push(id);
      }
      account = setSquad(localStorage, ids);
      renderMenu();
      const status = app.querySelector('#squad-result');
      if (!status) throw new Error('Squad status region is missing.');
      status.textContent = 'Squad saved. These companions will join your next battle.';
    } catch (error) {
      console.error('Squad update rejected', error);
      showError(`Squad was not changed. ${errorMessage(error)}`);
    }
  });
  app.querySelector<HTMLButtonElement>('#summon-character')?.addEventListener('click', () => {
    try {
      if (!confirm(`Spend ${summonCost} Lycalis to summon one unowned companion? No duplicates. New companions must be equipped in Squad.`)) return;
      const result = summonCharacter(localStorage);
      account = result.account;
      summonedCharacter = result.id;
      renderMenu();
      app.querySelector<HTMLElement>('.summon-reveal')?.scrollIntoView({ block: 'center', behavior: 'instant' });
    } catch (error) {
      console.error('Summoning rejected', error);
      showError(`Summoning was not completed. ${errorMessage(error)}`);
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
      message.textContent = 'Motion preference saved on this browser.';
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
      result.textContent = 'Selection keys saved. Attack and end-turn shortcuts are disabled.';
    } catch (error) {
      console.error('Could not save battle hotkeys', error);
      showError(`Hotkeys were not changed. ${errorMessage(error)}`);
    }
  });
  app.querySelector('#return-title')?.addEventListener('click', () => {
    journey.screen = 'title';
    render();
    app.querySelector<HTMLButtonElement>('#enter')?.focus();
  });
}

function menuContent(page: Exclude<MenuPage, 'home'> | 'settings'): string {
  if (!journey.profile) throw new Error('A saved companion is required.');
  const starter = getStarter(journey.profile.starterId);
  if (page === 'battle') return '<button class="text-button" data-page="home">Back to Home</button><div id="battle-root"></div>';
  if (page === 'character') return `${characterRoster(account, selectedCharacter ?? starter.id)}${characterHub(getStarter(selectedCharacter ?? starter.id), characterTab, account)}`;
  if (page === 'inventory') return inventoryHub(account);
  if (page === 'glossary') return creatureGlossary(account);
  if (page === 'squad') return squadHub(account);
  if (page === 'summon') return summonHub(account, summonedCharacter);
  if (page === 'gameplay') return gameplayHub(account);
  if (page === 'story') return `<button class="text-button" data-page="gameplay">Back to Gameplay</button><p class="subtitle">Prologue / ${starter.lore.origin}</p>
    <article class="story-panel lore-panel" style="--element:${starter.color}">
      <p class="eyebrow">A FIRST LIGHT</p><h2>${starter.title}</h2>
      <p>${starter.lore.story}</p><blockquote>"${starter.lore.vow}"</blockquote>
      <p>The road disappears beneath a veil of dusk. A small light glows beside you. It is not enough to light the world - not yet. But it is enough to take the first step.</p>
      <p class="quiet">Readable prologue only. Story battles, chapters, and rewards are not implemented.</p>
    </article>`;
  if (page === 'events') return `<p class="subtitle">Future limited-time adventures.</p>
    <article class="feature-tile"><h2>No events available</h2><p>This tab is reserved for later. There are no active events, timers, or event rewards.</p></article>`;
  return settingsPanel(motionPreference, bindings, speed);
}

function render(): void {
  if (journey.screen === 'title') renderTitle();
  else if (journey.screen === 'selection') renderSelection();
  else renderMenu();
}

app.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest<HTMLButtonElement>('[data-upgrade]');
  if (!button || button.disabled || menuPage !== 'character') return;
  try {
    if (!journey.profile || !account) throw new Error('Character progression is unavailable.');
    const kind = button.dataset.upgrade;
    if (kind !== 'level' && kind !== 'evolve' && kind !== 'weapon') throw new Error('Unknown character upgrade.');
    const starter = getStarter(selectedCharacter ?? journey.profile.starterId);
    const expected = ownedProgress(account, starter.id);
    const cost = kind === 'level' ? levelCost(starter.elementId, expected) : kind === 'weapon' ? weaponCost(starter.elementId, expected) : evolutionCost(starter.elementId, expected);
    const materials = Object.entries(cost.materials).map(([id, amount]) => `${amount} ${materialName(id)}`).join(', ');
    if (!confirm(`${kind === 'level' ? 'Level up' : kind === 'weapon' ? 'Upgrade weapon for' : 'Evolve'} ${starter.name} for ${cost.fractalis} Fractalis and ${materials}?`)) return;
    const currency = app.querySelector('#fractalis-balance');
    const premium = app.querySelector('#lycalis-balance');
    if (!currency || !premium) throw new Error('Currency display is missing.');
    account = upgradeCharacter(localStorage, starter.id, kind, expected);
    fractalis = account.fractalis;
    updateCharacterTab(app, starter, characterTab, account);
    const progress = ownedProgress(account, starter.id);
    const rosterButton = app.querySelector(`[data-owned-character="${starter.id}"]`);
    const rosterLevel = rosterButton?.querySelector('small');
    if (rosterLevel) rosterLevel.textContent = `Lv.${progress.level} / Evo.${progress.evolution}`;
    const rosterPortrait = rosterButton?.querySelector('img');
    if (rosterPortrait) {
      const art = portraitAttributes(starter, progress.evolution);
      rosterPortrait.src = art.src;
      rosterPortrait.alt = art.alt;
      const facing = unitFacing(characterArt(starter.id, progress.evolution).art, 'ally');
      rosterPortrait.dataset.facing = facing.facing;
      rosterPortrait.dataset.mirrored = String(facing.mirrored);
    }
    currency.textContent = String(account.fractalis);
    premium.textContent = String(account.lycalis);
    if (kind !== 'weapon') celebrateUpgrade(app, starter, kind, ownedProgress(account, starter.id));
    const result = app.querySelector('#upgrade-result');
    if (result) result.textContent = `${starter.name} ${kind === 'level' ? 'leveled up' : kind === 'weapon' ? 'weapon upgraded' : 'evolved'}. Saved on this browser.`;
    else showError(`${starter.name} ${kind === 'level' ? 'leveled up' : kind === 'weapon' ? 'weapon upgraded' : 'evolved'}. Saved on this browser.`);
  } catch (error) {
    console.error('Character upgrade rejected', error);
    showError(`Upgrade was not completed. ${errorMessage(error)}`);
  }
});

document.addEventListener('keydown', (event) => {
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
