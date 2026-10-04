import './style.css';
import { availableStarters, getStarter, isStarterId } from './content/starters';
import { artifactSlots, currencies, upgradePaths } from './content/progression';
import { Journey } from './game/flow';
import { SAVE_KEY } from './game/profile';
import { portrait } from './presentation/portrait';
import { createBackdrop } from './presentation/backdrop';
import { elementalReveal } from './presentation/reveal';
import { applyMotion, loadMotion, saveMotion, type MotionPreference } from './presentation/settings';

const root = document.querySelector<HTMLElement>('#app');
if (!root) throw new Error('Application root is missing.');
const app = root;
const journey = new Journey();
type MenuPage = 'home' | 'character' | 'inventory' | 'story' | 'events' | 'settings';
let menuPage: MenuPage = 'home';
let motionPreference: MotionPreference = 'system';
let settingsError = '';
try {
  motionPreference = loadMotion(localStorage);
} catch (error) {
  console.error('Could not load Last Light settings', error);
  settingsError = `Settings could not be loaded. ${errorMessage(error)} System motion preferences remain active; save a setting to replace the unreadable value.`;
}
applyMotion(motionPreference);
createBackdrop();

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'An unexpected error occurred.';
}

function showError(message: string): void {
  const status = app.querySelector<HTMLElement>('#status');
  if (!status) throw new Error('Status region is missing.');
  status.textContent = message;
}

function frame(body: string): void {
  app.innerHTML = `<div class="shell">
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
    <p class="subtitle">The fire companion is the first light available in this build.</p>
    ${journey.profile && journey.profile.starterId !== 'ember' ? '<p class="migration-notice">Your previous companion is not available in this build. Your save is unchanged until you explicitly select and confirm fire.</p>' : ''}
    <div class="starter-grid fire-only" role="group" aria-label="Starter companions">
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
    <p class="quiet">Saved on this browser &middot; Original placeholder illustrations</p>
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
  if (!journey.profile) throw new Error('The opening menu requires a saved companion.');
  const starter = getStarter(journey.profile.starterId);
  frame(`<section class="menu-screen">
    <div class="currency-strip" aria-label="Currencies">${currencies.map((currency) =>
      `<span><strong>${currency.name}</strong><small>${currency.role} &middot; Balance not implemented</small></span>`).join('')}</div>
    <nav class="menu-nav" aria-label="Sanctuary navigation">${([
      ['home', 'Sanctuary'], ['character', 'Character'], ['inventory', 'Inventory'],
      ['story', 'Story mode'], ['events', 'Events'], ['settings', 'Settings'],
    ] as const).map(([page, label]) =>
      `<button data-page="${page}" ${menuPage === page ? 'aria-current="page"' : ''}>${label}</button>`).join('')}</nav>
    ${menuPage !== 'home' ? menuContent(menuPage) : `
    <div class="menu-heading"><div><p class="eyebrow">THE SANCTUARY</p><h1 tabindex="-1">A new light awakens.</h1>
      <p class="subtitle">Welcome home, traveler. Your journey is just beginning.</p></div>
      <span class="chapter-badge">PROLOGUE<br><strong>01</strong></span></div>
    <div class="menu-layout">
      <article class="companion-panel ${firstArrival ? 'first-arrival' : ''}" style="--element:${starter.color}">
        <p class="eyebrow">YOUR FIRST COMPANION</p>
        <div class="portrait">${portrait(starter)}${firstArrival ? elementalReveal(starter) : ''}</div>
        <span class="element-pill">${starter.element} / ${starter.weapon}</span>
        <h2>${starter.name}</h2><p>${starter.description}</p>
        ${firstArrival ? `<p class="bond-message">${starter.lore.awakening}</p>` : ''}
        <details class="companion-lore" ${firstArrival ? 'open' : ''}>
          <summary>Companion lore</summary>
          <p class="eyebrow">${starter.lore.origin}</p>
          <p>${starter.lore.story}</p><blockquote>"${starter.lore.vow}"</blockquote>
        </details>
        <span class="small-label">STARTER FORM &middot; LOCAL SAVE</span>
      </article>
      <div class="menu-options">
        <article class="journey-panel"><span class="eyebrow">ON THE HORIZON</span>
          <h2>Beyond the last light</h2><p>The first chapter is yet to be written. Your companion is ready for what comes next.</p>
          <button class="text-button" data-page="story">Open story mode &rarr;</button></article>
        <div class="feature-grid">
          <div class="feature-tile"><span class="tile-symbol" aria-hidden="true">&#9671;</span><h3>Squad</h3><p>One companion. Endless possibility.</p><span>COMING SOON</span></div>
          <div class="feature-tile"><span class="tile-symbol" aria-hidden="true">&#10022;</span><h3>Summon</h3><p>New lights will answer the call.</p><span>COMING SOON</span></div>
        </div>
        <div class="menu-actions"><button id="return-title" class="text-button">Return to title</button><span>Progress saved on this device</span></div>
      </div>
    </div>`}
  </section>`);
  app.querySelectorAll<HTMLButtonElement>('[data-page]').forEach((button) => {
    button.addEventListener('click', () => {
      const page = button.dataset.page;
      if (page !== 'home' && page !== 'character' && page !== 'inventory' &&
          page !== 'story' && page !== 'events' && page !== 'settings') throw new Error('Unknown menu page.');
      menuPage = page;
      renderMenu();
      focusHeading();
    });
  });
  const settingsForm = app.querySelector<HTMLFormElement>('#settings-form');
  if (menuPage === 'settings' && settingsError) showError(settingsError);
  settingsForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = new FormData(settingsForm).get('motion');
    if (value !== 'system' && value !== 'reduced') throw new Error('Invalid motion option.');
    try {
      saveMotion(localStorage, value);
      motionPreference = value;
      applyMotion(value);
      settingsError = '';
      showError('');
      const message = app.querySelector('#settings-result');
      if (!message) throw new Error('Settings result region is missing.');
      message.textContent = 'Motion preference saved on this browser.';
    } catch (error) {
      console.error('Could not save Last Light settings', error);
      showError(`Settings were not saved. ${errorMessage(error)}`);
    }
  });
  app.querySelector('#return-title')?.addEventListener('click', () => {
    journey.screen = 'title';
    render();
    app.querySelector<HTMLButtonElement>('#enter')?.focus();
  });
}

function menuContent(page: Exclude<MenuPage, 'home'>): string {
  if (!journey.profile) throw new Error('A saved companion is required.');
  const starter = getStarter(journey.profile.starterId);
  const heading = (name: string, text: string) =>
    `<h1 tabindex="-1">${name}</h1><p class="subtitle">${text}</p>`;
  if (page === 'character') return `${heading(starter.name, 'Your companion\'s upgrade paths and equipment layout.')}
    <div class="upgrade-grid">${upgradePaths.map((path) =>
      `<article class="feature-tile"><h2>${path.name}</h2><p>${path.detail.replace('<', '&lt;').replace('>', '&gt;')}</p><span>UPGRADES NOT IMPLEMENTED &middot; COSTS UNSET</span></article>`).join('')}</div>
    ${equipmentLayout()}`;
  if (page === 'inventory') return `${heading('Inventory', 'Your collection of artifacts, master relics, and upgrade materials.')}
    <div class="feature-tile"><h2>No items yet</h2><p>Item acquisition and equipment operations are not implemented. No starter items have been granted.</p></div>
    ${equipmentLayout()}`;
  if (page === 'story') return `${heading('Story mode', 'Prologue / The watchfires of Ashen Vale')}
    <article class="story-panel lore-panel" style="--element:${starter.color}">
      <p class="eyebrow">A FIRST LIGHT</p><h2>The coal that would not fade</h2>
      <p>${starter.lore.story}</p><blockquote>"${starter.lore.vow}"</blockquote>
      <p>At the edge of Ashen Vale, the road disappears beneath a veil of dusk. A small lantern glows beside you. It is not enough to light the world - not yet. But it is enough to take the first step.</p>
      <p class="quiet">Readable prologue only. Story battles, chapters, and rewards are not implemented.</p>
    </article>`;
  if (page === 'events') return `${heading('Events', 'Future limited-time adventures.')}
    <article class="feature-tile"><h2>No events available</h2><p>This tab is reserved for later. There are no active events, timers, or event rewards.</p></article>`;
  return `${heading('Settings', 'Preferences are stored separately from your companion save.')}
    <form id="settings-form" class="feature-tile settings-panel">
      <label for="motion">Animation preference</label>
      <select id="motion" name="motion">
        <option value="system" ${motionPreference === 'system' ? 'selected' : ''}>Follow device preferences</option>
        <option value="reduced" ${motionPreference === 'reduced' ? 'selected' : ''}>Reduce motion</option>
      </select>
      <p>Reduced motion disables ambient movement and elemental reveal animations. Device-level reduced motion is always respected.</p>
      <button class="primary-button" type="submit">Save settings</button>
      <p id="settings-result" role="status"></p>
    </form>`;
}

function equipmentLayout(): string {
  return `<section class="equipment-panel"><h2>Equipment slots</h2>
    <p class="subtitle">Eight unique artifacts and one separate, special master relic slot. Slots are a preview; equipping is not available yet.</p>
    <div class="master-relic"><strong>Master relic</strong><span>Special slot &middot; Empty</span></div>
    <div class="artifact-grid">${artifactSlots.map((slot) =>
      `<div class="artifact-slot"><strong>Artifact ${slot}</strong><span>Empty</span></div>`).join('')}</div>
  </section>`;
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
