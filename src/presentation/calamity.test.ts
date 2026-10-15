// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { calamityActivities, calamityChest, calamityChestId, calamityEncounter, calamityLootTable, calamityWarning, rollCalamityChest } from '../content/calamity';
import { emptyAccount } from '../game/account';
import { gameplayHub } from './gameplay';
import { inventoryView, bindInventory } from './inventory';
import { bindCalamityEntries, calamityLoot, calamityOpeningReward, calamitySection, calamityCadence } from './calamity';
import { unitReadout } from './unit-readout';
import { battleResults, encounterRewards } from './battle-results';
import { BattleView, createSession } from './battle-view';
import { restartHistoricalConduitSession } from './conduit-compatibility';
import { creatureGlossary, bindCreatureGlossary } from './creature-glossary';
import { calamityArenaArt, calamityBossArt, calamityChestArt } from '../content/calamity-art';
import { lootArt, lootItems } from './battle-loot';
import { unitFacing } from './unit-facing';

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

  it('lists all 36 exact tiers separately below eligible normal stages, never Story/Training/War', () => {
    const account = emptyAccount();
    account.characters.ember = { level: 105, evolution: 6 };
    document.body.innerHTML = gameplayHub(account);
    expect(document.querySelectorAll('[data-calamity]')).toHaveLength(36);
    for (const activity of calamityActivities) {
      const section = document.querySelector(`[data-calamity="${activity.id}"]`)!.closest('.calamity-section')!;
      expect(section.querySelectorAll('.calamity-tier-boss')).toHaveLength(activity.id === 'roses' ? 0 : 3);
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

  it.each(calamityActivities)('shows exact fixed contents, every weighted $id bundle and saved reveal values', activity => {
    for (const tier of [1, 2, 3] as const) {
      const chest = calamityChest(activity.id, tier);
      const html = calamityLoot(activity.id, tier);
      expect(html).toContain(`${chest.fractalis} Prismatica`);
      expect(html).toContain(`${chest.lycalis} Null-Prismatica`);
      expect(html).toContain(`${chest.bundles} independent weighted bundle rolls`);
      for (const row of calamityLootTable(activity.id)) {
        expect(html).toContain(row.label);
        expect(html).toContain(`<td>${row.weight}</td>`);
        expect(html).toContain(`${row.min}-${row.max}`);
      }
      const reward = rollCalamityChest(activity.id, tier, () => .1);
      const reveal = calamityOpeningReward(chest.id, reward);
      expect(reveal.details).toContain(`${reward.fractalis} Prismatica`);
      expect(reveal.details).toContain(`${reward.lycalis} Null-Prismatica`);
      expect(reveal.art).toContain(`items/${calamityChestArt[tier]}.png?v=`);
      expect(reveal.details).toContain('already saved');
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
      expect(host.querySelector<HTMLImageElement>('.enemies .battle-sprite img')!.src).toContain('enemies/calamity-boss-infernic.png?v=');
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
    expect(calamityCadence('oceanic', 4)).toContain('Barrier refresh: phase 4');
    expect(calamityCadence('oceanic', 6)).toContain('White Wake: phase 9');
    expect(calamityCadence('oceanic', 6)).toContain('Leviathan Breach: phase 6');
  });

  it('uses real gated discoveries and exact EX chest labels in Collections without captures or invented artwork', () => {
    const account = emptyAccount();
    const id = 'calamity:treasury';
    account.creatures[id] = { defeated: true };
    document.body.innerHTML = creatureGlossary(account);
    bindCreatureGlossary(document.body);
    const card = document.querySelector(`[data-creature="${id}"]`)!;
    expect(card.querySelector<HTMLImageElement>('.glossary-art img')!.src).toContain('enemies/calamity-boss-treasury.png?v=');
    expect(card.textContent).toContain('Not capturable');
    expect(card.textContent).toContain(calamityChest('treasury', 1).name);
    const select = card.querySelector<HTMLSelectElement>('[data-loot-stage]')!;
    select.value = '3';
    select.dispatchEvent(new Event('change'));
    expect(card.querySelector('.glossary-loot')!.textContent).toContain(calamityChest('treasury', 3).name);
    expect(card.querySelector('.glossary-loot')!.textContent).toContain('2 Cosmic Grand Master Chests');
    expect(document.querySelector('[data-creature="calamity:machines"]')!.textContent).toContain('Undiscovered Calamity boss');
    expect(document.querySelector('[data-creature="calamity:roses"] .glossary-art img')).toBeNull();
  });

  it.each(calamityActivities)('routes all $id tiers to shared chest art without changing actual loot', activity => {
    for (const tier of [1, 2, 3] as const) {
      const id = calamityChestId(activity.id, tier);
      expect(lootArt({ id })).toContain(`items/${calamityChestArt[tier]}.png?v=`);
      const art = calamityBossArt[activity.id];
      if (art) expect(unitFacing(art, 'enemy').mirrored).toBe(activity.id === 'atmospheric');
      else expect(activity.id).toBe('roses');
    }
  });
});
