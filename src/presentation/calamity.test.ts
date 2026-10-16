// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { calamityActivities, calamityBuildGuidance, calamityChest, calamityChestId, calamityEncounter, calamityLootTable, calamityWarning, rollCalamityChest } from '../content/calamity';
import { emptyAccount } from '../game/account';
import { gameplayHub } from './gameplay';
import { inventoryView, bindInventory } from './inventory';
import { bindActivityDifficulties, bindCalamityEntries, calamityLoot, calamityOpeningReward, calamitySection, calamityCadence } from './calamity';
import { roseEvent } from './rose-event';
import { unitReadout } from './unit-readout';
import { battleResults, encounterRewards } from './battle-results';
import { BattleView, createSession } from './battle-view';
import { restartHistoricalConduitSession } from './conduit-compatibility';
import { creatureGlossary, bindCreatureGlossary } from './creature-glossary';
import { calamityArenaArt, calamityBossArt, calamityChestArt } from '../content/calamity-art';
import { lootArt, lootItems } from './battle-loot';
import { unitFacing } from './unit-facing';
import { portraitCutin } from './battle-cutin';
import { assetUrl } from './portrait';

const confirmation = vi.hoisted(() => vi.fn(async () => false));
vi.mock('./game-dialog', async importOriginal => ({ ...await importOriginal<typeof import('./game-dialog')>(),
  gameConfirm: confirmation, gameDialogPending: () => false }));
vi.mock('./settings', () => ({ reducedMotion: () => true }));
vi.mock('../vfx/battle-vfx-runner', () => ({ BattleVFXRunner: class { destroy() {} } }));
vi.mock('./activity-transition', () => ({
  activityTransitionPending: () => false,
  transitionActivity: async (enter: () => void) => { enter(); },
}));

afterEach(() => {
  document.body.replaceChildren();
  confirmation.mockReset().mockResolvedValue(false);
  vi.unstubAllGlobals();
  Reflect.deleteProperty(HTMLElement.prototype, 'scrollIntoView');
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'close');
});

describe('Calamity presentation', () => {
  it.each(calamityActivities)('keeps one $id tier visible and preserves independent difficulty and stage choices', activity => {
    const account = emptyAccount();
    const before = structuredClone(account);
    document.body.innerHTML = gameplayHub(account);
    bindActivityDifficulties(document.body);
    const section = document.querySelector<HTMLElement>(`[data-calamity-tiers="${activity.id}"]`)!;
    const tabs = Array.from(section.querySelectorAll<HTMLButtonElement>('[data-calamity-choice]'));
    const panels = Array.from(section.querySelectorAll<HTMLElement>('[data-calamity-panel]'));
    const check = (index: number): void => {
      expect(panels.filter(panel => !panel.hidden)).toEqual([panels[index]]);
      tabs.forEach((tab, current) => {
        expect(tab.getAttribute('aria-selected')).toBe(String(current === index));
        expect(tab.tabIndex).toBe(current === index ? 0 : -1);
        expect(tab.getAttribute('aria-controls')).toBe(panels[current].id);
        expect(panels[current].getAttribute('aria-labelledby')).toBe(tab.id);
      });
    };
    check(0);
    tabs[2].click();
    check(2);
    for (const [start, key, selected] of [[2, 'ArrowRight', 0], [0, 'ArrowLeft', 2], [2, 'Home', 0], [0, 'End', 2]] as const) {
      tabs[start].dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
      check(selected);
      expect(document.activeElement).toBe(tabs[selected]);
    }
    const group = section.closest('[data-activity-difficulty]')!;
    group.querySelector<HTMLButtonElement>('[data-difficulty="calamity"]')!.click();
    group.querySelector<HTMLButtonElement>('[data-difficulty="normal"]')!.click();
    group.querySelector<HTMLButtonElement>('[data-difficulty="calamity"]')!.click();
    check(2);
    for (const other of Array.from(document.querySelectorAll<HTMLElement>('[data-calamity-tiers]'))) {
      if (other !== section) expect(other.querySelector<HTMLElement>('[data-calamity-panel="1"]')!.hidden).toBe(false);
    }
    expect(account).toEqual(before);
  });

  it('reports a failed boss image and retries its versioned URL without changing tiers or art identity', () => {
    document.body.innerHTML = calamitySection('machines', emptyAccount());
    bindActivityDifficulties(document.body);
    const image = document.querySelector<HTMLImageElement>('.calamity-tier-boss')!;
    const error = document.querySelector<HTMLElement>('[data-calamity-art-error]')!;
    const original = new URL(image.src);
    image.dispatchEvent(new Event('error'));
    expect(error.hidden).toBe(false);
    expect(error.textContent).toContain('Boss image could not load.');
    expect(image.hidden).toBe(true);
    error.querySelector('button')!.click();
    const retry = new URL(image.src);
    expect(retry.pathname).toBe(original.pathname);
    expect(retry.searchParams.get('v')).toBe(original.searchParams.get('v'));
    expect(retry.searchParams.has('retry')).toBe(true);
    expect(error.hidden).toBe(true);
    image.dispatchEvent(new Event('error'));
    expect(error.hidden).toBe(false);
    image.dispatchEvent(new Event('load'));
    expect(error.hidden).toBe(true);
    expect(image.hidden).toBe(false);
    expect(document.querySelector<HTMLElement>('[data-calamity-panel="1"]')!.hidden).toBe(false);
  });

  it('shows the shared build target without inventing an equipment admission gate', () => {
    const account = emptyAccount();
    account.normalFinalClears = { machines: true };
    document.body.innerHTML = calamitySection('machines', account);
    expect(document.body.textContent).toContain(calamityBuildGuidance);
    expect(calamityWarning('machines', 1)).toContain(calamityBuildGuidance);
    expect(document.querySelector<HTMLButtonElement>('[data-calamity-tier="1"]')!.disabled).toBe(false);
  });
  it.each(['heavens', 'sanctuary'] as const)('shares the current %s replacement art across tiers, old snapshots, cut-ins and catalog', activity => {
    vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: vi.fn() });
    Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value: vi.fn() });
    const art = calamityBossArt[activity];
    const expected = assetUrl(`enemies/${art}.png`);
    for (const tier of [1, 2, 3] as const) {
      const session = createSession('ember', { level: 105, evolution: 6 }, { activity, tier });
      session.entrancePending = false;
      delete session.state.enemies[0].art;
      const before = structuredClone(session);
      const host = document.createElement('div');
      document.body.append(host);
      const commit = vi.fn();
      const view = new BattleView(host, session, { nextAlly: 'KeyC', nextTarget: 'KeyT' }, commit);
      try {
        expect(host.querySelector<HTMLImageElement>('.enemies .battle-sprite img')!.getAttribute('src')).toBe(expected);
        expect(host.querySelector('.enemies .battle-sprite img')!.getAttribute('data-mirrored')).toBe('false');
        const cutin = portraitCutin(session.state.enemies[0], { ultimate: true, power: 1, name: 'Authored ultimate', duration: 3500 }, art, '#ed4545');
        expect(cutin.querySelector('img')!.getAttribute('src')).toBe(expected);
        expect(session).toEqual(before);
        expect(commit).not.toHaveBeenCalled();
      } finally { view.destroy(); host.remove(); }
    }
    const account = emptyAccount();
    account.creatures[`calamity:${activity}`] = { defeated: true };
    document.body.innerHTML = calamitySection(activity, account) + creatureGlossary(account);
    const images = Array.from(document.querySelectorAll<HTMLImageElement>(`.calamity-tier-boss, [data-creature="calamity:${activity}"] .glossary-art img`));
    expect(images).toHaveLength(4);
    for (const image of images) {
      expect(image.getAttribute('src')).toBe(expected);
    }
  });
  it('binds every EX entry independently of normal dungeon entry and confirms before transition', async () => {
    const account = emptyAccount();
    account.normalFinalClears = Object.fromEntries(calamityActivities.map(activity => [activity.id, true]));
    account.calamityClears = Object.fromEntries(calamityActivities.map(activity => [activity.id, 2]));
    document.body.innerHTML = calamityActivities.map(activity => calamitySection(activity.id, account)).join('');
    const enter = vi.fn(async () => {});
    const report = vi.fn();
    let blocked = false;
    bindCalamityEntries(document.body, () => account, enter, () => blocked, report);
    const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-calamity]'));
    buttons[0].click();
    await vi.waitFor(() => expect(confirmation).toHaveBeenCalledOnce());
    expect(enter).not.toHaveBeenCalled();
    confirmation.mockResolvedValue(true);
    for (const button of buttons) {
      button.click();
      await vi.waitFor(() => expect(enter).toHaveBeenLastCalledWith(button.dataset.calamity, Number(button.dataset.calamityTier)));
    }
    expect(enter).toHaveBeenCalledTimes(36);
    blocked = true;
    buttons[0].click();
    await Promise.resolve();
    expect(enter).toHaveBeenCalledTimes(36);
    expect(report).not.toHaveBeenCalled();
  });

  it('lists all 36 exact tiers in separate difficulty panels, never Story/Training/War', () => {
    const account = emptyAccount();
    account.characters.ember = { level: 105, evolution: 6 };
    document.body.innerHTML = gameplayHub(account);
    expect(document.querySelectorAll('[data-activity-difficulty]')).toHaveLength(12);
    expect(document.querySelectorAll('[data-difficulty-panel="calamity"][hidden]')).toHaveLength(12);
    expect(document.querySelectorAll('[data-calamity]')).toHaveLength(36);
    for (const activity of calamityActivities) {
      const section = document.querySelector(`[data-calamity="${activity.id}"]`)!.closest('.calamity-section')!;
      expect(section.querySelectorAll('.calamity-tier-boss')).toHaveLength(3);
      for (const tier of [1, 2, 3] as const) {
        const card = section.querySelector(`[data-calamity-tier="${tier}"]`)!.closest('.calamity-tier')!;
        expect(card.querySelector<HTMLImageElement>('.calamity-tier-arena')!.src).toContain(calamityArenaArt[tier]);
        expect(card.querySelector<HTMLImageElement>('.calamity-chest-art')!.src).toContain(calamityChestArt[tier]);
        expect(section.textContent).toContain(calamityEncounter(activity.id, tier).name);
        expect(section.textContent).toContain(`Lv.${calamityEncounter(activity.id, tier).level}`);
        expect(section.textContent).toContain(calamityChest(activity.id, tier).name);
        expect(section.querySelector<HTMLButtonElement>(`[data-calamity-tier="${tier}"]`)!.disabled).toBe(true);
      }
    }
    for (const id of ['story', 'adventure', 'war']) expect(document.querySelector(`#gameplay-${id} [data-calamity]`)).toBeNull();
    account.normalFinalClears = { infernic: true };
    document.body.innerHTML = calamitySection('infernic', account);
    expect(document.querySelector<HTMLButtonElement>('[data-calamity-tier="1"]')!.disabled).toBe(false);
    expect(document.querySelector<HTMLButtonElement>('[data-calamity-tier="2"]')!.disabled).toBe(true);
    expect(document.body.textContent).toContain('Clear Calamity EX+1');
  });

  it.each(calamityActivities)('switches $id difficulty without mixing drops, changing stages, or writing holdings', activity => {
    const account = emptyAccount();
    account.characters.ember = { level: 105, evolution: 6 };
    account.normalFinalClears = { [activity.id]: true };
    const before = structuredClone(account);
    document.body.innerHTML = gameplayHub(account);
    bindActivityDifficulties(document.body);
    const group = document.querySelector<HTMLElement>(`[data-activity-difficulty="${activity.id}"]`)!;
    const normal = group.querySelector<HTMLElement>('[data-difficulty-panel="normal"]')!;
    const calamity = group.querySelector<HTMLElement>('[data-difficulty-panel="calamity"]')!;
    const tabs = group.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    const stage = normal.querySelector<HTMLSelectElement>('select')!;
    stage.value = '1';
    expect(normal.hidden).toBe(false);
    expect(calamity.hidden).toBe(true);
    tabs[1].click();
    expect(normal.hidden).toBe(true);
    expect(calamity.hidden).toBe(false);
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(tabs[1].getAttribute('aria-controls')).toBe(calamity.id);
    expect(calamity.querySelector('[data-infusion], [data-dungeon]')).toBeNull();
    expect(calamity.querySelector<HTMLButtonElement>('[data-calamity-tier="1"]')!.disabled).toBe(false);
    expect(calamity.textContent).toContain('One sealed tier chest per victory');
    for (const tier of [1, 2, 3] as const) {
      const chest = calamityChest(activity.id, tier);
      const card = calamity.querySelector(`[data-calamity-tier="${tier}"]`)!.closest('.calamity-tier')!;
      const rewards = Array.from(card.querySelectorAll('.calamity-tier-reward li')).map(row => row.textContent);
      expect(rewards).toContain(`Prismatica${chest.fractalis.toLocaleString('en-US')}`);
      expect(rewards).toContain(`Null-Prismatica${chest.lycalis}`);
      expect(rewards).toContain(`Random rewards${chest.bundles}`);
      expect(rewards.filter(row => row?.includes('Cosmic Grand Master Chests'))).toEqual(
        chest.masterChests ? [`Cosmic Grand Master Chests${chest.masterChests}`] : []);
      expect(card.querySelector('.calamity-tier-actions [data-calamity]')).not.toBeNull();
    }
    tabs[0].click();
    expect(normal.hidden).toBe(false);
    expect(calamity.hidden).toBe(true);
    expect(stage.value).toBe('1');
    expect(group.querySelector('[data-difficulty-panel="normal"]')).toBe(normal);
    expect(account).toEqual(before);
  });

  it('supports roving keyboard tabs and isolates independent activity choices', () => {
    document.body.innerHTML = gameplayHub(null);
    bindActivityDifficulties(document.body);
    const tabs = document.querySelectorAll<HTMLButtonElement>('[data-activity-difficulty="heavens"] [role="tab"]');
    for (const [start, key, selected] of [[0, 'ArrowRight', 1], [1, 'ArrowRight', 0], [0, 'ArrowLeft', 1], [1, 'Home', 0], [0, 'End', 1]] as const) {
      tabs[start].dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
      expect(document.activeElement).toBe(tabs[selected]);
      expect(tabs[selected].tabIndex).toBe(0);
      expect(tabs[1 - selected].tabIndex).toBe(-1);
      expect(tabs[selected].getAttribute('aria-selected')).toBe('true');
    }
    expect(document.querySelector<HTMLElement>('[data-activity-difficulty="abyss"] [data-difficulty-panel="calamity"]')!.hidden).toBe(true);
    expect(document.querySelectorAll('[data-calamity]:not([disabled])')).toHaveLength(0);
  });

  it('offers the same difficulty panels on the standalone Events route', () => {
    document.body.innerHTML = roseEvent(emptyAccount());
    bindActivityDifficulties(document.body);
    document.querySelector<HTMLButtonElement>('[data-difficulty="calamity"]')!.click();
    expect(document.querySelector<HTMLElement>('[data-difficulty-panel="normal"]')!.hidden).toBe(true);
    expect(document.querySelector<HTMLElement>('[data-difficulty-panel="calamity"]')!.hidden).toBe(false);
    expect(document.querySelectorAll('[data-calamity="roses"]')).toHaveLength(3);
  });

  it.each(calamityActivities)('shows exact fixed contents, every weighted $id bundle and saved reveal values', activity => {
    for (const tier of [1, 2, 3] as const) {
      const chest = calamityChest(activity.id, tier);
      const html = calamityLoot(activity.id, tier);
      document.body.innerHTML = html;
      expect(document.body.textContent).toContain(`Prismatica${chest.fractalis.toLocaleString('en-US')}`);
      expect(document.body.textContent).toContain(`Null-Prismatica${chest.lycalis}`);
      expect(document.body.textContent).toContain(`Random rewards${chest.bundles}`);
      expect(html).toContain('Each random reward is chosen separately');
      for (const row of calamityLootTable(activity.id)) {
        expect(html).toContain(row.label);
        const totalWeight = calamityLootTable(activity.id).reduce((total, entry) => total + entry.weight, 0);
        expect(html).toContain(`<td>${Number((row.weight / totalWeight * 100).toFixed(6))}%</td>`);
        expect(html).toContain(`${row.min}-${row.max}`);
      }
      expect(html).not.toContain('<th>Weight</th>');
      const reward = rollCalamityChest(activity.id, tier, () => .1);
      const reveal = calamityOpeningReward(chest.id, reward);
      expect(reveal.details).toContain(`${reward.fractalis} Prismatica`);
      expect(reveal.details).toContain(`${reward.lycalis} Null-Prismatica`);
      expect(reveal.art).toContain(`items/${calamityChestArt[tier]}.png?v=`);
      expect(reveal.savedLabel).toBe('Rewards saved');
    }
  });

  it('lists only owned positive chest stacks, preserves filters, and never opens them while rendering', () => {
    const account = emptyAccount();
    const id = calamityChestId('machines', 3);
    account.calamityChests = { [id]: 2, [calamityChestId('treasury', 1)]: 0 };
    const before = structuredClone(account);
    document.body.innerHTML = inventoryView(account);
    bindInventory(document.body, vi.fn());
    expect(document.querySelectorAll('[data-open-calamity-chest]')).toHaveLength(1);
    expect(document.querySelector('[data-open-calamity-chest]')!.textContent).toBe('Open one chest');
    expect(document.body.textContent).toContain('Owned 2');
    expect(document.querySelector<HTMLImageElement>('[data-inventory-chest] img')!.src).toContain('items/calamity-chest-omnipotent.png?v=');
    const type = document.querySelector<HTMLSelectElement>('[data-inventory-filter="type"]')!;
    type.value = 'chests';
    type.dispatchEvent(new Event('change'));
    expect(document.querySelector('[data-inventory-results]')!.textContent).toContain('1 of 1');
    expect(account).toEqual(before);
  });

  it('summarizes the actual saved sealed chest once, without currency contents or Continue', () => {
    const session = createSession('ember', undefined, { activity: 'treasury', tier: 2 });
    session.state.phase = 'cleared';
    const reward = { kind: 'reward' as const, source: session.state.enemies[0].id, target: session.state.enemies[0].id,
      amount: 0, calamityChest: calamityChestId('treasury', 2), critical: false, message: 'Saved chest' };
    const rewards = encounterRewards([reward, reward]);
    expect(rewards).toEqual([expect.objectContaining({ id: reward.calamityChest, amount: 1 })]);
    const html = battleResults(session.state, [reward]);
    expect(html).toContain(calamityChest('treasury', 2).name);
    expect(html).toContain('Open your saved chest in Inventory');
    expect(html).not.toContain('data-result-continue');
    expect(html).not.toContain('250000');
    expect(html).toContain('items/calamity-chest-master.png?v=');
    expect(lootArt(lootItems(reward)[0])).toContain('items/calamity-chest-master.png?v=');
  });

  it('shows an authored warning before every replay, and cancellation preserves the frozen encounter', async () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: vi.fn() });
    Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value: vi.fn() });
    const session = createSession('ember', { level: 105, evolution: 6 }, { activity: 'infernic', tier: 3 });
    delete session.state.enemies[0].art;
    session.state.phase = 'cleared';
    session.entrancePending = false;
    const host = document.createElement('div');
    document.body.append(host);
    const commit = vi.fn();
    const view = new BattleView(host, session, { nextAlly: 'KeyC', nextTarget: 'KeyT' }, commit);
    Object.assign(view, { enterEncounter: vi.fn(async () => {}) });
    try {
      expect(host.querySelector<HTMLImageElement>('.battle-scenery')!.src).toContain('backgrounds/calamity-arena-ex-3.png?v=');
      expect(host.querySelector('.battle-scenery')!.classList.contains('calamity-scenery')).toBe(true);
      expect(host.querySelector<HTMLImageElement>('.enemies .battle-sprite img')!.src).toContain('enemies/calamity-boss-infernic.png?v=');
      expect(host.querySelector('.enemies .battle-sprite img')!.classList.contains('calamity-boss-contrast')).toBe(true);
      expect(host.querySelector('.allies .battle-sprite img')!.classList.contains('calamity-boss-contrast')).toBe(false);
      expect(session.state.enemies[0].art).toBeUndefined();
      expect(host.querySelector('[data-result-continue]')).toBeNull();
      const before = structuredClone(session);
      host.querySelector<HTMLButtonElement>('.battle-results [data-result-restart]')!.click();
      await vi.waitFor(() => expect(confirmation).toHaveBeenCalledOnce());
      expect(confirmation).toHaveBeenLastCalledWith(calamityWarning('infernic', 3), expect.objectContaining({ title: 'Calamity EX+3 warning' }));
      expect(session).toEqual(before);
      confirmation.mockResolvedValueOnce(true);
      host.querySelector<HTMLButtonElement>('.battle-results [data-result-restart]')!.click();
      await vi.waitFor(() => expect(session.runId).not.toBe(before.runId));
      expect(confirmation).toHaveBeenCalledTimes(2);
      expect(session.state.calamity).toEqual({ activity: 'infernic', tier: 3 });
      expect(session.state.allies[0].level).toBe(105);
      expect(session.state.allies[0].hp).toBe(session.state.allies[0].stats.health);
      expect(commit).not.toHaveBeenCalled();
    } finally { view.destroy(); }
  });

  it('does not substitute Training for a malformed saved Calamity marker', () => {
    const session = createSession('ember');
    Reflect.set(session.state, 'calamity', { activity: 'war', tier: 1 });
    expect(() => restartHistoricalConduitSession(session)).toThrow('Unsupported saved Calamity');
  });

  it('shows actual Calamity barrier points and exact upcoming attack/barrier cadence', () => {
    const session = createSession('ember', undefined, { activity: 'oceanic', tier: 2 });
    session.state.enemies[0].shield = 4321;
    expect(unitReadout(session.state.enemies[0], true, [], 4)).toContain('Shield 4321');
    expect(calamityCadence('oceanic', 4)).toContain('Shield refresh: turn 4');
    expect(calamityCadence('oceanic', 6)).toContain('White Wake: turn 9');
    expect(calamityCadence('oceanic', 6)).toContain('Leviathan Breach: turn 6');
  });

  it('uses real gated discoveries and exact EX chest labels in Collections without captures or invented artwork', () => {
    const account = emptyAccount();
    const id = 'calamity:treasury';
    account.creatures[id] = { defeated: true };
    document.body.innerHTML = creatureGlossary(account);
    bindCreatureGlossary(document.body);
    const card = document.querySelector(`[data-creature="${id}"]`)!;
    expect(card.querySelector<HTMLImageElement>('.glossary-art img')!.src).toContain('enemies/calamity-boss-treasury.png?v=');
    expect(card.querySelector('.glossary-art img')!.classList.contains('calamity-boss-contrast')).toBe(true);
    expect(card.textContent).toContain('Not capturable');
    expect(card.textContent).toContain(calamityChest('treasury', 1).name);
    const select = card.querySelector<HTMLSelectElement>('[data-loot-stage]')!;
    select.value = '3';
    select.dispatchEvent(new Event('change'));
    expect(card.querySelector('.glossary-loot')!.textContent).toContain(calamityChest('treasury', 3).name);
    expect(card.querySelector('.glossary-loot')!.textContent).toContain('Cosmic Grand Master Chests2');
    expect(document.querySelector('[data-creature="calamity:machines"]')!.textContent).toContain('Undiscovered Calamity boss');
    expect(document.querySelector<HTMLImageElement>('[data-creature="calamity:roses"] .glossary-art img')!.src).toContain('enemies/calamity-boss-roses.png?v=');
    expect(document.querySelector('[data-creature="calamity:roses"] .glossary-art img')!.classList.contains('calamity-boss-contrast')).toBe(false);
  });

  it.each(calamityActivities)('routes all $id tiers to shared chest art without changing actual loot', activity => {
    for (const tier of [1, 2, 3] as const) {
      const id = calamityChestId(activity.id, tier);
      expect(lootArt({ id })).toContain(`items/${calamityChestArt[tier]}.png?v=`);
      const art = calamityBossArt[activity.id];
      expect(art).toBeDefined();
      expect(unitFacing(art, 'enemy').mirrored).toBe(activity.id === 'atmospheric');
    }
  });
});
