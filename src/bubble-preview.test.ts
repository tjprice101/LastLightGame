// @vitest-environment jsdom
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { elementAccents } from './content/dungeon-art';
import { masterConduits } from './content/master-conduits';
import { exampleAccount, memberDisplay } from './bubble-preview-model';
import { maxLevelPlan } from './game/account';
import { normalizeStats, phaseZeroStatKeys, phaseZeroStatLabels, statDisplayUnit } from './content/phase-zero-stats';
import { formatStat } from './content/combat';
import { getSummonBanner } from './content/summon-banners';
import { bannerPercent } from './content/standard-banner';
import { bubbleBattle } from './bubble-battle-session';

let root: HTMLElement;
let routes: string[];
function click(selector: string): void {
  const button = root.querySelector<HTMLButtonElement>(selector);
  if (!button) throw new Error(`Missing preview control: ${selector}`);
  button.click();
  // Cinematics are tap-to-skip; skip them like a player would so outcomes are observable.
  document.querySelectorAll<HTMLElement>('.cine:not(.cine-out)').forEach(scene => scene.click());
}
function visit(screen: string): void {
  location.hash = screen;
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}

beforeAll(async () => {
  document.body.innerHTML = '<div id="bubble-preview"></div>';
  root = document.querySelector<HTMLElement>('#bubble-preview')!;
  HTMLDialogElement.prototype.showModal = vi.fn(function(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function(this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  });
  routes = Object.keys((await import('./bubble-preview')).screens);
});
beforeEach(() => { visit('settings'); click('[data-action="reset-example"]'); });
afterAll(() => { vi.restoreAllMocks(); });

describe('isolated bubble UI concept', () => {
  it('connects all 40 major screens and supporting layouts without a persistent top navigation', () => {
    expect(routes).toHaveLength(40);
    for (const route of routes) {
      visit(route);
      expect(root.dataset.screen).toBe(route);
      expect(root.querySelector('main')?.textContent?.trim().length).toBeGreaterThan(30);
      expect(root.querySelector('h1')).not.toBeNull();
      expect(root.querySelector('.sanctuary-header, .sanctuary-dock, .top, .nav')).toBeNull();
      expect(root.querySelector('aside, .roster, .detail-portrait')).toBeNull();
    }
  });
  it('carries each canonical leader accent across pages without recoloring supplied art', () => {
    for (const [id, element] of [
      ['ember', 'infernic'], ['tide', 'oceanic'], ['sprout', 'botanic'],
      ['atmoso', 'atmospheric'], ['bliss', 'tranquilitic'], ['disciple', 'chaotic'],
    ] as const) {
      visit('settings');
      click(`[data-leader="${id}"]`);
      for (const route of ['team', 'inventory', 'summon', 'story', 'battle', 'masters', 'settings']) {
        visit(route);
        expect(root.dataset.leaderElement).toBe(element);
        expect(root.style.getPropertyValue('--accent')).toBe(elementAccents[element]);
        expect(Array.from(root.querySelectorAll('img')).every(img => !img.style.filter)).toBe(true);
      }
    }
  });
  it('keeps inspected character selection separate from the actual preview leader', () => {
    visit('settings'); click('[data-leader="ember"]');
    visit('bearers');
    click('[data-person="tide"]');
    expect(root.dataset.leaderElement).toBe('infernic');
    expect(root.querySelector('.hero-caption h2')?.textContent).toBe('Tizu');
    click('[data-action="lead"]');
    expect(root.dataset.leaderElement).toBe('oceanic');
  });
  it('preserves actual image silhouettes for all unowned Masters', () => {
    visit('masters');
    const cards = root.querySelectorAll('.item-card');
    expect(cards).toHaveLength(masterConduits.length);
    expect(root.querySelectorAll('.item-card.undiscovered')).toHaveLength(masterConduits.length - 2);
    cards.forEach(card => expect(card.querySelector('img')).not.toBeNull());
  });
  it('filters the roster and reports an honest empty state', () => {
    visit('bearers');
    const search = root.querySelector<HTMLInputElement>('#card-search')!;
    search.value = 'Tizu';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    expect(Array.from(root.querySelectorAll<HTMLElement>('.searchable > button')).filter(card => !card.hidden)).toHaveLength(1);
    search.value = 'No such light';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    expect(root.querySelector<HTMLElement>('.empty-search')?.hidden).toBe(false);
  });
  it('supports reduced motion and sparkle controls in memory', () => {
    visit('settings');
    click('[data-setting="motion"]');
    expect(root.classList.contains('reduce-motion')).toBe(true);
    click('[data-setting="particles"]');
    expect(root.classList.contains('hide-sparkles')).toBe(true);
    visit('team');
    expect(root.classList.contains('reduce-motion')).toBe(true);
    visit('settings');
    click('[data-setting="motion"]');
    click('[data-setting="particles"]');
  });
  it('shows the shared late material recipe and selectable Devourer review without spending', () => {
    visit('evolution');
    expect(root.querySelector('.cost-list')?.textContent).toContain('50');
    const copy = root.querySelector<HTMLButtonElement>('[data-action="copy"]:not(:disabled)')!.dataset.copy!;
    click(`[data-copy="${copy}"]`);
    expect(root.querySelector('#copy-count')?.textContent).not.toBe('0 / 8 Evolution Value');
    click(`[data-copy="${copy}"]`);
    expect(root.querySelector('#copy-count')?.textContent).toBe('0 / 8 Evolution Value');
  });
  it('does not persist purchases, upgrades, summons, settings or sample account input', () => {
    const writes = vi.spyOn(Storage.prototype, 'setItem');
    visit('stores'); click('[data-action="purchase"]'); click('[data-action="confirm"]');
    expect(root.querySelector('.toast')?.textContent).toContain('acquired');
    visit('bearers'); click('[data-person="tide"]');
    visit('level'); click('[data-action="upgrade"]'); click('[data-action="confirm"]');
    expect(root.querySelector('.upgrade-portrait p')?.textContent).toContain('Lv.61');
    visit('summon'); click('[data-action="summon"]'); click('[data-action="confirm"]');
    expect(root.dataset.screen).toBe('rewards');
    visit('account');
    root.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(root.dataset.screen).toBe('starter');
    click('[data-starter="sprout"]');
    expect(root.dataset.screen).toBe('home');
    expect(root.dataset.leaderElement).toBe('botanic');
    expect(writes).not.toHaveBeenCalled();
    writes.mockRestore();
  });
  it('provides sale selection and protects the locked sample copy', () => {
    visit('sale');
    const copies = root.querySelectorAll<HTMLButtonElement>('[data-action="sale-copy"]');
    expect(copies[0].disabled).toBe(true);
    copies[0].click();
    expect(root.querySelector('#sale-count')?.textContent).toBe('0 copies selected');
    click(`[data-action="sale-copy"][data-copy="${copies[1].dataset.copy}"]`);
    click(`[data-action="sale-copy"][data-copy="${copies[2].dataset.copy}"]`);
    expect(root.querySelector('#sale-count')?.textContent).toBe('2 copies selected');
    click('[data-action="sale-review"]');
    expect(root.querySelector('dialog[open]')?.textContent).toContain('2 copies will be removed');
  });
  it('restores focus after a native modal is dismissed', () => {
    visit('summon');
    const trigger = root.querySelector<HTMLButtonElement>('[data-action="rates"]')!;
    trigger.focus(); trigger.click();
    click('[data-action="close"]');
    expect(document.activeElement).toBe(trigger);
  });
  it('cycles characters in both directions without changing the leader or adding a sidebar', () => {
    visit('team');
    const name = root.querySelector('.hero-caption h2')?.textContent;
    const element = root.dataset.leaderElement;
    click('[aria-label="Next character"]');
    expect(root.querySelector('.hero-caption h2')?.textContent).not.toBe(name);
    click('[aria-label="Previous character"]');
    expect(root.querySelector('.hero-caption h2')?.textContent).toBe(name);
    expect(root.dataset.leaderElement).toBe(element);
    expect(root.querySelector('aside')).toBeNull();
  });
  it('retains a one-to-three-member unique squad across editing, leader changes and battle', () => {
    visit('squad');
    click('[data-action="choose-member"][data-slot="1"]');
    click('[data-action="member"][data-member="rosetta"]');
    expect(root.querySelectorAll('.formation-slot h2')[1].textContent).toBe('Rosetta');
    click('[data-action="promote"][data-person-id="rosetta"]');
    expect(root.querySelector('.formation-slot h2')?.textContent).toBe('Rosetta');
    expect(root.dataset.leaderElement).toBe('tranquilitic');
    visit('battle');
    expect(root.querySelector('iframe.live-battle-frame')?.getAttribute('src')).toContain('bubble-battle.html?view=battle');
    let live = bubbleBattle(window.lastLightBubbleBattle!().account, { storyStage: 25 }, false).session.state;
    expect(live.allies[0].name).toContain('Rosetta');
    expect(live.allies).toHaveLength(3);
    visit('squad');
    click('[data-action="remove-member"][data-slot="2"]');
    click('[data-action="remove-member"][data-slot="1"]');
    expect(root.querySelectorAll('[data-action="remove-member"]')).toHaveLength(0);
    visit('battle');
    live = bubbleBattle(window.lastLightBubbleBattle!().account, { storyStage: 25 }, false).session.state;
    expect(live.allies).toHaveLength(1);
  });
  it('embeds the live battlefield and a resolved live victory with decorated, saved rewards', () => {
    visit('story');
    const enter = root.querySelector<HTMLButtonElement>('main [data-screen="battle"]');
    enter?.click();
    expect(root.dataset.screen).toBe('battle');
    const bridge = window.lastLightBubbleBattle!();
    expect(bridge.view).toBe('battle');
    expect(bridge.destination && 'storyStage' in bridge.destination).toBe(true);
    const fight = bubbleBattle(bridge.account, { storyStage: 1 }, false);
    expect(fight.session.state.phase).not.toBe('cleared');
    expect(fight.session.state.enemies.length).toBeGreaterThan(0);
    const won = bubbleBattle(bridge.account, { storyStage: 1 }, true);
    expect(won.session.state.phase).toBe('cleared');
    expect(won.saved).toBe(true);
    expect(won.session.stageEvents.some(event => event.kind === 'reward')).toBe(true);
    visit('results');
    expect(window.lastLightBubbleBattle!().view).toBe('results');
    expect(root.querySelector('iframe.live-battle-frame')?.getAttribute('src')).toContain('view=results');
  });
  it('keeps eight independent equipment slots per character and exposes real owned Conduits instead of invented presets', () => {
    visit('bearers'); click('[data-person="ember"]');
    visit('conduits');
    expect(root.querySelectorAll('.equipment-slot')).toHaveLength(8);
    click('[data-action="equipment"][data-slot="2"]');
    expect(root.querySelector<HTMLButtonElement>('[data-equip="vigil-core"]')?.disabled).toBe(true);
    click('[data-equip="bastion-lock"]');
    expect(root.querySelectorAll('.equipment-slot strong')[2].textContent).toBe('Bastion Lock');
    visit('team'); click('[aria-label="Next character"]');
    visit('conduits');
    expect(root.querySelectorAll('.equipment-slot strong')[2].textContent).toBe('Slot 3');
    visit('loadouts');
    expect(root.querySelector('[data-preset]')).toBeNull();
    click('[data-action="restore-select"]');
    expect(root.dataset.screen).toBe('restore');
    expect(root.querySelector('.settings-layout')?.textContent).toContain('Current effect');
  });
  it('displays all ten effective production stats with their actual units', () => {
    visit('stats');
    const stats = normalizeStats(memberDisplay(exampleAccount(), 'ember').fighter.stats);
    const cells = root.querySelectorAll('.stat-grid > div');
    expect(cells).toHaveLength(10);
    phaseZeroStatKeys.forEach((key, index) => {
      expect(cells[index].querySelector('small')?.textContent).toBe(phaseZeroStatLabels[key]);
      expect(cells[index].querySelector('strong')?.textContent).toBe(`${formatStat(stats[key] * (statDisplayUnit(key) === '%' ? 100 : 1))}${statDisplayUnit(key)}`);
    });
  });
  it('computes a real affordable Max Level review and updates every character display after confirming', () => {
    const plan = maxLevelPlan(exampleAccount(), 'tide');
    expect(plan.targetLevel).toBeGreaterThan(plan.currentLevel + 1);
    visit('bearers'); click('[data-person="tide"]'); visit('max');
    expect(root.querySelector('.upgrade-portrait p')?.textContent).toContain(`Lv.${plan.currentLevel} → ${plan.targetLevel}`);
    expect(root.querySelector('.cost-list')?.textContent).toContain(plan.cost.fractalis.toLocaleString());
    click('[data-action="upgrade"]'); click('[data-action="confirm"]');
    visit('team');
    expect(root.querySelector('.hero-caption')?.textContent).toContain(`Lv.${plan.targetLevel}`);
    visit('stats');
    expect(root.querySelector('.focus-context')?.textContent).toContain(`Lv.${plan.targetLevel}`);
  });
  it('shows exact per-banner rates and the current 80-pull guarantee', () => {
    visit('summon');
    for (const id of ['standard', 'roses']) {
      click(`[data-banner="${id}"]`);
      expect(root.querySelector('.summon-panel')?.textContent).toContain('/ 80');
      expect(root.querySelector('.summon-panel')?.textContent).not.toContain('/ 200');
      click('[data-action="rates"]');
      const rows = root.querySelectorAll('dialog .loot-row');
      const pool = getSummonBanner(id).pool();
      expect(rows).toHaveLength(pool.length);
      pool.forEach((entry, index) => expect(rows[index].querySelector('strong')?.textContent).toBe(bannerPercent(entry.chance)));
      click('[data-action="close"]');
    }
  });
  it('connects captured details, locking, mixed squad leadership and actual retained skills', () => {
    const copy = exampleAccount().capturedCharacters![7];
    visit('devourers'); click(`[data-person="${copy.instanceId}"]`);
    expect(root.querySelector('.hero-caption')?.textContent).toContain(memberDisplay(exampleAccount(), copy.instanceId).name);
    visit('skills'); expect(root.querySelector('.detail-content')?.textContent).toContain('Retained abilities');
    visit('team'); click('[data-action="lead"]');
    visit('squad');
    expect(root.querySelector('.formation-slot h2')?.textContent).toBe(memberDisplay(exampleAccount(), copy.instanceId).name);
    expect(root.dataset.leaderElement).toBe(memberDisplay(exampleAccount(), copy.instanceId).elementId);
  });
  it('updates stage levels and reward tables instead of only highlighting stage bubbles', () => {
    visit('play');
    click('[data-group="infusion"]');
    click('[data-activity="Soar to Heaven"]');
    expect(root.querySelectorAll('.stage')).toHaveLength(15);
    click('[data-action="stage"][data-stage="15"]');
    expect(root.querySelector('.activity-scenery')?.textContent).toContain('Lv.120');
    expect(root.querySelectorAll('.loot-pool img').length).toBeGreaterThan(2);
    click('[data-action="loot-rates"]');
    expect(root.querySelector('dialog .loot-table')?.textContent).toContain('7–8');
    click('[data-action="close"]');
    visit('play'); click('[data-group="machines"]'); click('[data-activity="Awaken the Machines"]');
    click('[data-action="stage"][data-stage="35"]');
    expect(root.querySelector('.loot-pool')?.textContent).toContain("Machine's Master Chest");
  });
  it('uses reached-form silhouettes and gates discovery loot', () => {
    visit('archive');
    expect(root.querySelectorAll('.item-card')).toHaveLength(96);
    expect(root.querySelectorAll('.item-card.undiscovered')).toHaveLength(32);
    click('[data-view="creatures"]');
    const undiscovered = root.querySelector<HTMLButtonElement>('.item-card.undiscovered')!;
    undiscovered.click();
    expect(root.querySelector('dialog')?.textContent).toContain('Defeat this Elemental-Devourer');
    expect(root.querySelector('dialog .loot-table')).toBeNull();
  });
  it('updates restoration effects, Inventory balances and chest ownership coherently', () => {
    visit('restore'); click('[data-action="restore"]'); click('[data-action="confirm"]');
    expect(root.querySelector('.settings-layout')?.textContent).toContain('Upgrade 3 / 5');
    visit('inventory');
    expect(root.querySelector('.holdings-row')?.textContent).toContain('1,140');
    visit('chests'); click('[data-action="chest"]');
    const claim = root.querySelector<HTMLButtonElement>('[data-action="master-claim"]')!;
    const name = claim.querySelector('strong')!.textContent!;
    claim.click(); click('[data-action="confirm"]');
    expect(root.querySelector('.reward-scene')?.textContent).toContain(name);
    visit('chests'); expect(root.querySelector<HTMLButtonElement>('[data-action="chest"]')!.disabled).toBe(true);
  });
  it('keeps the bottom corners free of menu and leader controls while every destination stays reachable', () => {
    expect(root.querySelector('.menu-orb, .atlas-trigger, .leader-control, [data-action="menu"], [data-action="themes"]')).toBeNull();
    expect(root.querySelectorAll('.preview-tools button')).toHaveLength(1);
    visit('settings');
    for (const screen of ['profile', 'friends', 'help', 'events']) expect(root.querySelector(`main [data-screen="${screen}"]`), screen).not.toBeNull();
    expect(root.querySelectorAll('main [data-leader]').length).toBeGreaterThanOrEqual(6);
  });
  it('keeps ambient animation nodes alive across navigation and ordinary state updates', () => {
    const ambient = root.querySelector('.ambient'), glow = root.querySelector('.ambient-glow');
    visit('play'); click('[data-group="dungeons"]');
    expect(root.querySelector('.ambient')).toBe(ambient);
    expect(root.querySelector('.ambient-glow')).toBe(glow);
    expect(root.querySelectorAll('.ambient-bubble')).toHaveLength(12);
    expect(root.querySelectorAll('.ambient-current')).toHaveLength(2);
    expect(root.querySelectorAll('.ambient-twinkle')).toHaveLength(16);
    expect(root.querySelectorAll('.ambient-orbit')).toHaveLength(2);
  });
  it('celebrates completed transactions on every screen and stays quiet under reduced motion', () => {
    const effects = document.querySelector('.interaction-effects')!;
    effects.replaceChildren();
    visit('stores'); click('[data-action="purchase"]'); click('[data-action="confirm"]');
    expect(effects.querySelector('.fx-banner')?.textContent).toMatch(/^✦ .+ acquired ✦$/);
    expect(effects.querySelector('.fx-wave')).not.toBeNull();
    effects.replaceChildren();
    visit('settings'); click('[data-setting="motion"]');
    visit('squad'); click('[data-action="save-squad"], [data-action="squad-save"], .formation-save, [data-action="formation"]');
    expect(effects.querySelector('.fx-banner, .fx-wave, .fx-glyph, .click-burst')).toBeNull();
    visit('settings'); click('[data-setting="motion"]');
  });
  it('keeps development labels off all player-facing destinations', () => {
    for (const route of routes.filter(route => route !== 'settings')) {
      visit(route);
      expect(root.querySelector('main')?.textContent, route).not.toMatch(/sample|preview|illustrative|concept|mock-up|debug|invented preset|layout study/i);
    }
    visit('home');
    expect(root.querySelector('main')?.textContent).toContain('Let’s soul');
    visit('help');
    expect(root.querySelector('main')?.textContent).toContain('Infinity');
    expect(root.querySelector('main')?.textContent).toContain('Nothingness');
  });
  it('uses actual Material Exchange products, quantities and holdings', () => {
    visit('stores'); click('[data-action="store-tab"][data-tab="materials"]');
    click('[data-product="infernic"]');
    click('[data-action="exchange-buy"][data-quantity="5"]'); click('[data-action="confirm"]');
    expect(root.querySelector('[data-product="infernic"]')?.textContent).toContain('137 owned');
    expect(root.querySelector('.floating-wallet')?.textContent).toContain('248,100');
    click('[data-action="exchange-category"][data-category="event"]');
    expect(root.querySelector('.store-notice')?.textContent).toContain('Rosetta, Thornia and Crinso');
  });
  it('zooms the outgoing art toward the clicked bubble before revealing its detail view', () => {
    visit('team');
    const animation = new EventTarget();
    Object.assign(animation, { cancel: vi.fn() });
    const animate = vi.fn(() => animation);
    const cancelEntry = vi.fn();
    Object.defineProperty(root.querySelector('main')!, 'animate', { value: animate });
    Object.defineProperty(root.querySelector('main')!, 'getAnimations', { value: () => [{ cancel: cancelEntry }] });
    click('.bubble[data-screen="skills"]');
    expect(root.dataset.screen).toBe('team');
    expect(root.inert).toBe(true);
    expect(animate).toHaveBeenCalledOnce();
    expect(cancelEntry).toHaveBeenCalledOnce();
    expect(JSON.stringify(animate.mock.calls)).toContain('scale(3.4)');
    expect(document.querySelector('.bubble-portal')).not.toBeNull();
    animation.dispatchEvent(new Event('finish'));
    expect(root.dataset.screen).toBe('skills');
    expect(root.inert).toBe(false);
    click('.focus-context [data-screen="team"]');
    expect(root.dataset.screen).toBe('team');
  });
});
