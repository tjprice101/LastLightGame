import './style.css';
import { availableStarters, getStarter, isStarterId } from './content/starters';
import { currencies } from './content/progression';
import { Journey } from './game/flow';
import { SAVE_KEY } from './game/profile';
import { portrait } from './presentation/portrait';
import { createBackdrop } from './presentation/backdrop';
import { elementalReveal } from './presentation/reveal';
import { applyMotion, loadMotion, saveMotion, type MotionPreference } from './presentation/settings';
import { allowedCodes, commands, defaultBindings, keyLabel, loadBindings, saveBindings, validateBindings } from './game/hotkeys';
import { BattleView, createSession, type BattleSession } from './presentation/battle-view';
import { characterHub, homeHub, isCharacterTab } from './presentation/hub';
import { loadFractalis, saveBattleRewards } from './game/wallet';

const root = document.querySelector<HTMLElement>('#app');
if (!root) throw new Error('Application root is missing.');
const app = root;
app.addEventListener('error', (event) => {
  if (!(event.target instanceof HTMLImageElement)) return;
  console.error('Artwork failed to load', event.target.src);
  showError(`Artwork could not load for ${event.target.alt}. Please reload or check the asset deployment.`);
}, true);
const journey = new Journey();
type MenuPage = 'home' | 'character' | 'story' | 'events' | 'battle';
let menuPage: MenuPage = 'home';
let characterTab = 'overview';
let motionPreference: MotionPreference = 'system';
let settingsError = '';
let bindings = { ...defaultBindings };
let hotkeyError = '';
let battleSession: BattleSession | null = null;
let battleView: BattleView | null = null;
let fractalis: number | null = null;
let walletError = '';
try {
  fractalis = loadFractalis(localStorage);
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
createBackdrop();

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'An unexpected error occurred.';
}

function showError(message: string): void {
  const status = app.querySelector<HTMLElement>('dialog[open] #settings-error') ??
    app.querySelector<HTMLElement>('#status');
  if (!status) throw new Error('Status region is missing.');
  status.textContent = message;
}

function frame(body: string, battle = false): void {
  document.body.classList.toggle('in-battle', battle);
  app.innerHTML = battle ? `<div class="battle-screen">${body}<p id="status" class="status" role="alert"></p></div>` : `<div class="shell">
    <header class="masthead"><span class="brand-mark">L / L</span><span>LAST LIGHT</span><span class="build-label">PRELUDE &middot; 0.1</span></header>
    ${body}
    <p id="status" class="status" role="alert"></p>
    <footer><span>AN ORIGINAL GACHA RPG</span><span>A WORLD WAITING TO AWAKEN</span></footer>
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
    <p class="subtitle">Choose your first light: fire, water, or grass. Your journey begins solo.</p>
    <div class="starter-grid" role="group" aria-label="Starter companions">
      ${availableStarters.map((starter, index) => `<button class="starter-card" data-starter="${starter.id}"
        aria-pressed="${journey.selected === starter.id}" style="--element:${starter.color}">
        <span class="card-top"><span>${starter.element.toUpperCase()}</span><span>0${index + 1}</span></span>
        <div class="portrait">${portrait(starter)}<span class="reveal-slot"></span></div>
        <span class="weapon-label">${starter.weapon.toUpperCase()} &middot; STARTER</span>
        <strong>${starter.name}</strong>
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
  const sanctuary = `<section class="menu-screen">
    <div class="currency-strip" aria-label="Currencies">${currencies.map((currency) =>
      `<span><strong>${currency.name}${currency.id === 'fractalis' ? ` <span id="fractalis-balance">${fractalis ?? 'Unavailable'}</span>` : ''}</strong><small>${currency.role} &middot; ${currency.id === 'fractalis' ? 'Saved locally' : 'Balance not implemented'}</small></span>`).join('')}</div>
    ${walletError ? '<p class="status" id="wallet-error" role="alert"></p>' : ''}
    <div class="navigation-row"><nav class="menu-nav" aria-label="Main screens">${([
      ['home', 'Home'], ['character', 'Character Upgrades'], ['events', 'Events'],
    ] as const).map(([page, label]) =>
      `<button data-page="${page}" ${(menuPage === 'battle' || menuPage === 'story' ? 'home' : menuPage) === page ? 'aria-current="page"' : ''}>${label}</button>`).join('')}</nav>
      <button id="open-settings" class="settings-trigger" aria-haspopup="dialog">Settings</button></div>
    ${menuPage !== 'home' ? menuContent(menuPage) : homeHub(starter, firstArrival)}
  </section>`;
  frame(`${menuPage === 'battle' ? `<header class="battle-toolbar">
    <button class="text-button" data-page="home">Quit Battle</button>
    <span>Fractalis <strong id="fractalis-balance">${fractalis ?? 'Unavailable'}</strong></span>
    <button id="open-settings" class="text-button" aria-haspopup="dialog">Settings</button>
    </header>${walletError ? '<p class="status" id="wallet-error" role="alert"></p>' : ''}
    <div id="battle-root"></div>` : sanctuary}
    <dialog id="settings-drawer" class="settings-drawer" aria-labelledby="settings-heading">
    <button id="close-settings" class="text-button">Close settings</button>
    ${menuContent('settings')}<p id="settings-error" class="status" role="alert"></p>
  </dialog>`, menuPage === 'battle');
  app.querySelectorAll<HTMLButtonElement>('[data-page]').forEach((button) => {
    button.addEventListener('click', () => {
      const page = button.dataset.page;
      if (page !== 'home' && page !== 'character' &&
          page !== 'story' && page !== 'events' && page !== 'battle') throw new Error('Unknown menu page.');
      menuPage = page;
      renderMenu();
      focusHeading();
    });
  });
  app.querySelectorAll<HTMLButtonElement>('[data-feature]').forEach((button) => {
    button.addEventListener('click', () => {
      showError(`${button.dataset.feature} is coming later. No units or currency have been changed.`);
    });
  });
  app.querySelectorAll<HTMLButtonElement>('[data-character-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      const tab = button.dataset.characterTab;
      if (!tab || !isCharacterTab(tab)) throw new Error('Unknown character upgrade area.');
      characterTab = tab;
      menuPage = 'character';
      renderMenu();
      app.querySelector<HTMLElement>('#upgrade-heading')?.focus();
    });
  });
  const drawer = app.querySelector<HTMLDialogElement>('#settings-drawer');
  if (!drawer) throw new Error('Settings drawer is missing.');
  app.querySelector('#open-settings')?.addEventListener('click', () => {
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
    battleSession ??= createSession(starter.id);
    battleView = new BattleView(host, battleSession, bindings, (result) => {
      const balance = app.querySelector('#fractalis-balance');
      if (!balance) throw new Error('Fractalis balance region is missing.');
      try {
        fractalis = saveBattleRewards(localStorage, result);
      } catch (error) {
        throw new Error(`Fractalis could not be saved. The battle action was not applied; retry when storage is available. ${errorMessage(error)}`);
      }
      walletError = '';
      balance.textContent = String(fractalis);
      const error = app.querySelector('#wallet-error');
      if (error) error.textContent = '';
    });
  }
  const walletStatus = app.querySelector('#wallet-error');
  if (walletStatus) walletStatus.textContent = walletError;
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
      result.textContent = 'Battle hotkeys saved. They will be shown on every battle action.';
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
  const heading = (name: string, text: string) =>
    `<h1 tabindex="-1">${name}</h1><p class="subtitle">${text}</p>`;
  if (page === 'battle') return '<button class="text-button" data-page="home">Back to Home</button><div id="battle-root"></div>';
  if (page === 'character') return characterHub(starter, characterTab);
  if (page === 'story') return `<button class="text-button" data-page="home">Back to Home</button>${heading('Story mode', `Prologue / ${starter.lore.origin}`)}
    <article class="story-panel lore-panel" style="--element:${starter.color}">
      <p class="eyebrow">A FIRST LIGHT</p><h2>${starter.title}</h2>
      <p>${starter.lore.story}</p><blockquote>"${starter.lore.vow}"</blockquote>
      <p>The road disappears beneath a veil of dusk. A small light glows beside you. It is not enough to light the world - not yet. But it is enough to take the first step.</p>
      <p class="quiet">Readable prologue only. Story battles, chapters, and rewards are not implemented.</p>
    </article>`;
  if (page === 'events') return `${heading('Events', 'Future limited-time adventures.')}
    <article class="feature-tile"><h2>No events available</h2><p>This tab is reserved for later. There are no active events, timers, or event rewards.</p></article>`;
  return `<h2 id="settings-heading">Settings</h2><p class="subtitle">Preferences are stored separately from your companion save.</p>
    <form id="settings-form" class="feature-tile settings-panel">
      <label for="motion">Animation preference</label>
      <select id="motion" name="motion">
        <option value="system" ${motionPreference === 'system' ? 'selected' : ''}>Follow device preferences</option>
        <option value="reduced" ${motionPreference === 'reduced' ? 'selected' : ''}>Reduce motion</option>
      </select>
      <p>Reduced motion disables ambient movement and elemental reveal animations. Device-level reduced motion is always respected.</p>
      <button class="primary-button" type="submit">Save settings</button>
      <p id="settings-result" role="status"></p>
    </form>
    <form id="hotkey-form" class="feature-tile settings-panel hotkey-panel"><h2>Battle hotkeys</h2>
      <p>Choose one distinct key per command. Keys are physical keyboard positions. Browser shortcuts and typing in fields are not intercepted.</p>
      ${commands.map(([command, label]) => `<label for="key-${command}">${label}</label>
        <select id="key-${command}" name="${command}">${allowedCodes.map((code) =>
          `<option value="${code}" ${bindings[command] === code ? 'selected' : ''}>${keyLabel(code)}</option>`).join('')}</select>`).join('')}
      <button class="primary-button" type="submit">Save battle hotkeys</button><p id="hotkey-result" role="status"></p>
    </form>`;
}

function render(): void {
  if (journey.screen === 'title') renderTitle();
  else if (journey.screen === 'selection') renderSelection();
  else renderMenu();
}

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
