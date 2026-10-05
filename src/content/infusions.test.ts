import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { elements } from './activities';
import { infusionDrops, infusionEncounter, infusionEnemies, infusionLoot, specialtyId, specialtyMaterials } from './infusions';
import { evolutionCost, levelCost, weaponCost } from './progression';
import { resolveFighter } from './combat';
import { ACCOUNT_KEY, emptyAccount, loadAccount, ownedProgress, saveAccount, saveAccountRewards, unlockedInfusionStage, upgradeCharacter } from '../game/account';
import { SAVE_KEY, type ProfileStorage } from '../game/profile';
import { act, createInfusionBattle, nextWave } from '../game/battle';
import { createSession, BattleView } from '../presentation/battle-view';
import { gameplayHub } from '../presentation/gameplay';
import { characterDetail, inventoryHub } from '../presentation/hub';
import { starters } from './starters';
import { unitFacing } from '../presentation/unit-facing';
import { defaultBindings } from '../game/hotkeys';

vi.mock('../presentation/activity-transition', () => ({
  activityTransitionPending: () => false,
  transitionActivity: async (render: () => unknown) => { await render(); },
}));

function storage(): ProfileStorage {
  const data = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => { data.set(key, value); }, removeItem: (key) => { data.delete(key); } };
}
function draws(values: number[]): () => number {
  return () => {
    const value = values.shift();
    if (value === undefined) throw new Error('Test exhausted its random draws.');
    return value;
  };
}

describe('playable Heaven and Abyss', () => {
  it.each(['heavens', 'abyss'] as const)('%s wires all 35 stages, six forms, full artwork and bosses', (mode) => {
    const formStages = [1, 7, 13, 19, 25, 31];
    for (let stage = 1; stage <= 35; stage++) {
      const encounter = infusionEncounter(mode, stage);
      expect(encounter.level).toBe(Math.round(80 + (stage - 1) * 40 / 34));
      expect(encounter.boss).toBe(stage % 5 === 0);
      const tier = formStages.filter((start) => stage >= start).length - 1;
      expect(encounter.enemy.name).toBe(infusionEnemies[mode][tier][0]);
      const session = createSession('ember', { level: 105, evolution: 6 }, { mode, stage });
      expect(session.entrancePending).toBe(true);
      expect(session.state.enemies).toHaveLength(encounter.boss ? 1 : 2);
      expect(session.state.enemies[0].stats).toEqual(encounter.stats);
      expect(session.state.enemies[0].enemySkills?.[0].every).toBe(encounter.boss ? 2 : 3);
      expect(session.state.enemies[0].enemySkills).toHaveLength(2);
      expect(session.state.enemies[0].art).toBe(encounter.enemy.art);
      expect(existsSync(resolve('public', 'assets', 'enemies', `${encounter.enemy.art}.png`))).toBe(true);
      expect(unitFacing(encounter.enemy.art, 'enemy').facing).toBe('right');
      const view = Object.create(BattleView.prototype);
      const menu = { addEventListener: vi.fn(), close: vi.fn() };
      Object.assign(view, { session, bindings: defaultBindings,
        host: { innerHTML: '', querySelectorAll: () => [], querySelector: (selector: string) => selector === '#battle-menu' ? menu : null }, bind: vi.fn() });
      Reflect.apply(Reflect.get(BattleView.prototype, 'render'), view, []);
      expect(view.host.innerHTML).toContain(`${mode}-arena.png`);
      expect(view.host.innerHTML).toContain(`Stage ${stage} / 35`);
      session.state.phase = 'cleared';
      Reflect.apply(Reflect.get(BattleView.prototype, 'render'), view, []);
      expect(view.host.innerHTML).toContain(stage === 35 ? 'All 35 stages cleared' : 'Continue with full health');
      expect(() => nextWave(session.state)).toThrow('separate encounters');
    }
    for (const stage of [0, 36, 1.5, NaN, Infinity]) expect(() => infusionEncounter(mode, stage)).toThrow();
    expect(existsSync(resolve('public', 'assets', 'banners', `${mode}-banner.png`))).toBe(true);
    expect(existsSync(resolve('public', 'assets', 'backgrounds', `${mode}-arena.png`))).toBe(true);
  });

  it('uses exact specialty bands, quantities, rarity chances and mode-associated rolls', () => {
    for (let stage = 1; stage <= 35; stage++) {
      const pool = infusionLoot('heavens', stage);
      expect(infusionDrops('heavens', stage, () => .999999)).toEqual(
        Object.fromEntries(pool.specialties.map((drop) => [drop.id, drop.maximum])));
    }
    for (const mode of ['heavens', 'abyss'] as const) for (const [index, element] of elements.filter((entry) => entry.infusion === mode).entries()) {
      expect(infusionDrops(mode, 35, draws([0, 0, 0, 0, 0, (index + .5) / 5, 0, 0, (index + .5) / 5, 0, 0, (index + .5) / 5]))).toEqual({
        [`${mode}-weapon`]: 3, [`${mode}-evolution`]: 3, [`${mode}-level`]: 3,
        [`${element.id}-epic`]: 3, [`${element.id}-legendary`]: 3, [`${element.id}-omnic`]: 3,
      });
    }
    for (const [rarity, stage] of [['epic', 1], ['legendary', 18], ['omnic', 31]] as const) {
      const pool = infusionLoot('abyss', stage);
      const earlierRolls = pool.bonuses.findIndex((drop) => drop.rarity === rarity);
      const drop = pool.bonuses[earlierRolls];
      for (const success of [true, false]) {
        const result = infusionDrops('abyss', stage, draws([
          ...Array<number>(pool.specialties.length).fill(0),
          ...Array<number>(earlierRolls).fill(.999), success ? drop.chance - .000001 : drop.chance,
          ...(success ? [0, 0] : []), ...Array<number>(pool.bonuses.length - earlierRolls - 1).fill(.999),
        ]));
        expect(result['voltaic-' + rarity]).toBe(success ? drop.minimum : undefined);
      }
    }
    for (const bad of [-1, 1, NaN, Infinity]) expect(() => infusionDrops('abyss', 35, () => bad)).toThrow('[0, 1)');
  });

  it.each(['heavens', 'abyss'] as const)('%s never awards opposite-mode elements at any floor or selection boundary', (mode) => {
    const eligible = elements.filter((element) => element.infusion === mode).map((element) => element.id);
    for (let stage = 1; stage <= 35; stage++) for (const selection of [0, .199999, .2, .399999, .4, .599999, .6, .799999, .8, .999999]) {
      const pool = infusionLoot(mode, stage);
      const sequence = [...pool.specialties.map(() => 0), ...pool.bonuses.flatMap(() => [0, 0, selection])];
      const drops = infusionDrops(mode, stage, draws(sequence));
      for (const drop of pool.bonuses) {
        const id = `${eligible[Math.floor(selection * 5)]}-${drop.rarity}`;
        expect(drops[id]).toBe(drop.minimum);
      }
      for (const element of elements.filter((entry) => entry.infusion !== mode)) {
        for (const rarity of ['epic', 'legendary', 'omnic']) expect(drops[`${element.id}-${rarity}`]).toBeUndefined();
      }
    }
  });

  it.each(['heavens', 'abyss'] as const)('%s persists independent unlocks, exact drops, capped completion and deduplicated receipts', (mode) => {
    const saved = storage();
    const state = createInfusionBattle(mode, 1, 1729, 'ember', { level: 105, evolution: 6 });
    state.enemies.forEach((enemy) => { enemy.hp = 1; });
    state.allies[0].shatter = 100;
    const result = act(state, 'ember', 'ultimate', state.enemies[0].id);
    expect(result.state.phase).toBe('cleared');
    const first = saveAccountRewards(saved, result, mode);
    expect(first.materials[`${mode}-weapon`]).toBe(2);
    expect(unlockedInfusionStage(loadAccount(saved), mode)).toBe(2);
    expect(unlockedInfusionStage(first, mode === 'heavens' ? 'abyss' : 'heavens')).toBe(1);
    expect(saveAccountRewards(saved, result, mode)).toEqual(first);
    const final = createInfusionBattle(mode, 35, 1729, 'ember', { level: 105, evolution: 6 });
    expect(infusionEncounter(mode, 35).abilityMultiplier).toBeCloseTo(1.584);
    final.phase = 'cleared';
    final.enemies[0].hp = 0;
    saveAccountRewards(saved, { state: final, events: [] }, 'final');
    expect(unlockedInfusionStage(loadAccount(saved), mode)).toBe(35);
    const before = saved.getItem(ACCOUNT_KEY);
    saved.setItem = () => { throw new Error('Write denied'); };
    expect(() => saveAccountRewards(saved, result, 'fresh-run')).toThrow('Write denied');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
  });

  it('loads legacy v2 without resetting balances and validates mode stages and rank', () => {
    const saved = storage();
    const { infusionStages, ...legacy } = emptyAccount();
    void infusionStages;
    legacy.fractalis = 57;
    saved.setItem(ACCOUNT_KEY, JSON.stringify(legacy));
    expect(loadAccount(saved).fractalis).toBe(57);
    expect(loadAccount(saved).infusionStages).toEqual({});
    for (const invalid of [
      { ...emptyAccount(), infusionStages: { heavens: 36 } },
      { ...emptyAccount(), infusionStages: { abyss: 0 } },
      { ...emptyAccount(), characters: { ember: { level: 0, evolution: 1, weaponRank: 11 } } },
    ]) expect(() => saveAccount(saved, invalid)).toThrow();
  });

  it.each(['heavens', 'abyss'] as const)('%s advances manually retaining Gauge and replays without stage36 or reused reward receipts', async (mode) => {
    const session = createSession('ember', { level: 105, evolution: 6, weaponRank: 4 }, { mode, stage: 34 });
    session.state.phase = 'cleared';
    session.state.allies[0].hp = 1;
    session.state.allies[0].shatter = 80;
    session.entrancePending = false;
    const view = Object.create(BattleView.prototype);
    Object.assign(view, { session, disposed: false, busy: false, dragging: false,
      commitRewards: vi.fn(), render: vi.fn(), enterEncounter: vi.fn(), error: vi.fn(),
      present: vi.fn((result) => { session.state = result.state; }),
    });
    Reflect.apply(Reflect.get(BattleView.prototype, 'command'), view, ['endTurn']);
    expect(session.state.infusion).toEqual({ mode, stage: 35 });
    expect(session.state.allies[0].hp).toBe(session.state.allies[0].stats.health);
    expect(session.state.allies[0].shatter).toBe(80);
    expect(session.state.allies[0].kit?.stats.damage).toBe(resolveFighter('ember', session.progress).stats.damage);
    expect(view.present).toHaveBeenCalledWith(expect.anything(), true);
    session.state.phase = 'cleared';
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    Reflect.apply(Reflect.get(BattleView.prototype, 'command'), view, ['endTurn']);
    expect(view.error).toHaveBeenCalledWith(expect.stringContaining('complete'));
    expect(session.state.wave).toBe(35);
    log.mockRestore();
    const listeners = new Map<string, () => Promise<void>>();
    Object.assign(view, { bindings: defaultBindings, host: { innerHTML: '',
      querySelectorAll: (selector: string) => selector === '[data-result-restart]'
        ? [{ addEventListener: (_: string, callback: () => Promise<void>) => listeners.set(selector, callback) }] : [],
      querySelector: (selector: string) => ({ addEventListener: (_: string, callback: () => Promise<void>) => listeners.set(selector, callback) }) } });
    Reflect.apply(Reflect.get(BattleView.prototype, 'render'), view, []);
    const replay = listeners.get('[data-result-restart]');
    if (!replay) throw new Error('Replay listener missing.');
    const oldRun = session.runId;
    vi.stubGlobal('confirm', () => true);
    try {
      await replay();
      expect(session.runId).not.toBe(oldRun);
      expect(session.state.infusion).toEqual({ mode, stage: 35 });
      expect(session.state.phase).toBe('player');
      expect(session.stageEvents).toEqual([]);
      expect(session.entrancePending).toBe(true);
      expect(view.enterEncounter).toHaveBeenCalledOnce();
    } finally { vi.unstubAllGlobals(); }
  });

  it('spends Heaven weapon resources atomically, preserves rank through growth and rejects stale/max/missing resources', () => {
    const saved = storage();
    const account = emptyAccount();
    account.fractalis = 10000;
    account.materials = { 'heavens-weapon': 275, 'abyss-weapon': 275, 'infernic-common': 100, 'infernic-rare': 25, 'infernic-epic': 10, 'heavens-evolution': 5 };
    saveAccount(saved, account);
    for (let rank = 1; rank <= 10; rank++) {
      const current = ownedProgress(loadAccount(saved), 'ember');
      expect(weaponCost('infernic', current)).toEqual({ fractalis: 100 * rank, materials: { 'heavens-weapon': 5 * rank } });
      upgradeCharacter(saved, 'ember', 'weapon', current);
      const progress = ownedProgress(loadAccount(saved), 'ember');
      expect(progress.weaponRank).toBe(rank);
      expect(resolveFighter('ember', progress).stats.damage).toBeCloseTo(resolveFighter('ember').stats.damage * (1 + .02 * rank));
    }
    const ranked = loadAccount(saved);
    expect(ranked.fractalis).toBe(4500);
    expect(ranked.materials['heavens-weapon']).toBe(0);
    expect(ranked.materials['abyss-weapon']).toBe(275);
    expect(() => upgradeCharacter(saved, 'ember', 'weapon', { level: 0, evolution: 1, weaponRank: 9 })).toThrow('changed');
    expect(() => upgradeCharacter(saved, 'ember', 'weapon', ownedProgress(ranked, 'ember'))).toThrow('Maximum');
    const leveled = upgradeCharacter(saved, 'ember', 'level', ownedProgress(ranked, 'ember'));
    expect(ownedProgress(leveled, 'ember').weaponRank).toBe(10);
    leveled.characters.ember = { level: 75, evolution: 4, weaponRank: 10 };
    saveAccount(saved, leveled);
    const evolved = upgradeCharacter(saved, 'ember', 'evolve', ownedProgress(leveled, 'ember'));
    expect(evolved.characters.ember).toEqual({ level: 75, evolution: 5, weaponRank: 10 });
    const missing = emptyAccount();
    missing.fractalis = 1000;
    missing.materials['abyss-weapon'] = 100;
    saveAccount(saved, missing);
    const raw = saved.getItem(ACCOUNT_KEY);
    expect(() => upgradeCharacter(saved, 'ember', 'weapon', { level: 0, evolution: 1 })).toThrow('Dawnsteel');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
  });

  it('maps spending by all ten affinities, including leveling below 80 throughout Evo5/6', () => {
    for (const element of elements) {
      expect(weaponCost(element.id, { level: 0, evolution: 1 }).materials).toEqual({ [specialtyId(element.id, 'weapon')]: 5 });
      expect(evolutionCost(element.id, { level: 75, evolution: 4 }).materials[specialtyId(element.id, 'evolution')]).toBe(5);
      expect(evolutionCost(element.id, { level: 90, evolution: 5 }).materials[specialtyId(element.id, 'evolution')]).toBe(10);
      for (const evolution of [5, 6]) expect(levelCost(element.id, { level: 75, evolution }).materials[specialtyId(element.id, 'level')]).toBe(1);
      expect(levelCost(element.id, { level: 74, evolution: 4 }).materials[specialtyId(element.id, 'level')]).toBeUndefined();
    }
  });

  it('renders mode stages, material icons, inventory and purchasable/capped weapons', () => {
    const account = emptyAccount();
    account.infusionStages = { heavens: 35, abyss: 13 };
    account.fractalis = 1000;
    account.materials = Object.fromEntries(specialtyMaterials.map((material) => [material.id, 100]));
    const menu = gameplayHub(account);
    expect(menu).toContain('data-infusion-stage="heavens"');
    expect(menu).toContain('value="35" selected');
    expect(menu).toContain('value="13" selected');
    expect(menu).not.toContain('value="36"');
    expect(gameplayHub(null)).not.toContain('data-infusion="');
    for (const material of specialtyMaterials) {
      expect(inventoryHub(account)).toContain(material.name);
      expect(inventoryHub(account)).toContain(`${material.art}.png`);
      expect(existsSync(resolve('public', 'assets', 'materials', `${material.art}.png`))).toBe(true);
    }
    expect(characterDetail(starters[0], 'upgrade-2', account)).toContain('data-upgrade="weapon" >');
    expect(characterDetail(starters[0], 'upgrade-2', account)).toContain('heavens-dawnsteel-of-judgment.png');
    account.characters.ember = { level: 75, evolution: 4, weaponRank: 10 };
    expect(characterDetail(starters[0], 'upgrade-2', account)).toContain('Maximum weapon rank');
    expect(characterDetail(starters[0], 'upgrade-0', account)).toContain('heavens-crown-scarlet-oath.png');
    account.characters.ember = { level: 75, evolution: 5 };
    expect(characterDetail(starters[0], 'upgrade-1', account)).toContain('heavens-chalice-undying-dawn.png');
  });
});
