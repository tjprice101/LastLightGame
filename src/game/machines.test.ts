import { describe, expect, it, vi } from 'vitest';
import { conduits, conduitBuffs, conduitEffect, validateConduitSlots, type ConduitId, type ConduitSlots } from '../content/conduits';
import { elements } from '../content/activities';
import { enemyGrowth } from '../content/stat-growth';
import { infusionEncounter } from '../content/infusions';
import { machineConduitDrops, machineConduitLoot, bannerConduitBonus, machineEnemies, isBannerConduitEligible } from '../content/machines';
import { creatureLoot, getCreature } from '../content/creatures';
import { getStarter, starters } from '../content/starters';
import { resolveFighter, shatterGauge } from '../content/combat';
import { act, endTurn, nextStage, damageAmount, actionUnavailable, createBattle, createInfusionBattle, type BattleState } from './battle';
import { ACCOUNT_KEY, emptyAccount, loadAccount, saveAccount, saveAccountRewards, equipConduit, summonCharacter, purchaseConduit, validateAccount } from './account';
import { SAVE_KEY, type ProfileStorage } from './profile';
import { createCreatureCopy, validateCapturedCharacters, resolveCapturedFighter } from './character-instances';
import { gameplayHub } from '../presentation/gameplay';
import { inventoryView } from '../presentation/inventory';
import { characterDetail } from '../presentation/hub';
import { lootItems } from '../presentation/battle-loot';
import { encounterRewards, battleResults } from '../presentation/battle-results';
import { archives } from '../presentation/archives';
import { machineComponentDrop } from '../content/mechanical-components';
import { createSession } from '../presentation/battle-view';

function sequence(...values: number[]): () => number {
  let index = 0;
  return () => {
    if (index >= values.length) throw new Error('Test RNG exhausted.');
    return values[index++];
  };
}
function storage(): ProfileStorage {
  const values = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); }, removeItem: (key) => { values.delete(key); } };
}
function slots(id: ConduitId): ConduitSlots { return [id, null, null, null, null, null, null, null]; }
function omnicBattle(element: 'infernic' | 'aquatic' | 'tectonic' | 'efflorescent' | 'voltaic' | 'atmospheric' | 'luminous' | 'ominous' | 'tranquilitic' | 'chaotic'): BattleState {
  const identities = { infernic: 'ember', aquatic: 'tide', tectonic: 'bruno', efflorescent: 'sprout',
    voltaic: 'elise', atmospheric: 'atmoso', luminous: 'rosetta', ominous: 'thornia', tranquilitic: 'bliss', chaotic: 'crinso' };
  const starter = starters.find((entry) => entry.id === identities[element]);
  const conduit = conduits.find((entry) => entry.id.startsWith(`${element}-`));
  if (!starter || !conduit) throw new Error('Missing element fixture.');
  const state = createBattle(1729, [starter.id], { [starter.id]: { level: 50, evolution: 4 } }, { [starter.id]: slots(conduit.id) });
  state.allies[0].shatter = 100;
  for (const enemy of state.enemies) { enemy.hp = enemy.stats.health = 1e8; enemy.stats.defense = 0; enemy.stats.damage = 0; enemy.stats.crit = 0; }
  state.allies[0].stats.crit = 0;
  return state;
}
function expandedBattle(id: ConduitId): BattleState {
  const conduit = conduits.find((entry) => entry.id === id);
  const starter = conduit?.element && starters.find((entry) => entry.elementId === conduit.element);
  if (!conduit?.element || !starter) throw new Error(`Missing expanded Omnic fixture: ${id}.`);
  const state = createBattle(1729, [starter.id], { [starter.id]: { level: 50, evolution: 4 } },
    { [starter.id]: slots(conduit.id) });
  state.allies[0].shatter = 100;
  state.allies[0].stats.crit = 0;
  for (const enemy of state.enemies) {
    enemy.hp = enemy.stats.health = 1e8;
    enemy.stats.defense = 0;
    enemy.stats.damage = 0;
    enemy.stats.crit = 0;
  }
  return state;
}
function attack(state: BattleState, action: 'light' | 'skill1' | 'skill2' | 'ultimate' | 'defend') {
  return act(state, state.allies[0].id, action, state.enemies[0].id);
}

describe('machine content and exact probabilities', () => {
  it('chooses equally among only unowned names without changing rarity roll boundaries', () => {
    const rare = conduits.filter(c => c.rarity === 'Rare');
    const remaining = rare.slice(-2);
    const owned = Object.fromEntries(rare.slice(0, -2).map(c => [c.id, 2]));
    const before = structuredClone(owned);
    expect(machineConduitDrops(75, sequence(.08, .035, .01), owned)).toEqual({});
    for (const [index, conduit] of remaining.entries()) {
      expect(machineConduitDrops(75, sequence(.079999, (index + .5) / 2, .035, .01), owned)).toEqual({ [conduit.id]: 1 });
    }
    const loot = machineConduitLoot(75, owned);
    for (const conduit of rare) expect(loot.find(drop => drop.id === conduit.id)?.chance).toBe(
      remaining.includes(conduit) ? .08 / 2 : 0);
    expect(creatureLoot(getCreature('infusion:machines:4'), 75, owned).filter(drop => rare.some(c => c.id === drop.id)))
      .toEqual(loot.filter(drop => rare.some(c => c.id === drop.id)));
    expect(owned).toEqual(before);
  });
  it('awards nothing for completed tiers without rerolls, compensation or RNG drift', () => {
    const owned = Object.fromEntries(conduits.filter(c => c.rarity !== 'Common').map(c => [c.id, 1]));
    const random = vi.fn(sequence(0, .5, 0, .5, 0, .5));
    expect(machineConduitDrops(75, random, owned)).toEqual({});
    expect(random).toHaveBeenCalledTimes(6);
    expect(machineConduitLoot(75, owned).every(drop => drop.chance === 0)).toBe(true);
    delete owned['worldbreaker-drive'];
    expect(machineConduitDrops(75, sequence(0, .5, 0, .5, 0, .5), owned)).toEqual({ 'worldbreaker-drive': 1 });
    expect(machineConduitLoot(75, owned).find(drop => drop.id === 'worldbreaker-drive')?.chance).toBe(.035);
    expect(bannerConduitBonus(sequence(0, 0))).toBe('worldbreaker-drive');
  });
  it('authors the exact catalog and distinct stats/penalties/elements without selling drops', () => {
    expect(conduits).toHaveLength(90);
    expect(new Set(conduits.map((entry) => entry.id)).size).toBe(90);
    for (const [rarity, count] of [['Common', 10], ['Rare', 15], ['Legendary', 15], ['Omnic', 45], ['Calamitic', 5]] as const) {
      const pool = conduits.filter((entry) => entry.rarity === rarity);
      expect(pool).toHaveLength(count);
      for (const conduit of pool) {
        const buffs = conduitBuffs(conduit);
        expect(new Set(buffs.map((entry) => entry.stat)).size).toBe(buffs.length);
        expect(conduitEffect(conduit)).toBe(conduit.effect);
        if (rarity === 'Omnic') expect(buffs).toEqual([]);
        if (rarity !== 'Common') expect(conduit.price).toBeNull();
      }
    }
    expect(conduits.filter((entry) => entry.rarity === 'Omnic').map((entry) => entry.element).sort())
      .toEqual([...Array<string>(8).fill('infernic'), ...Array<string>(6).fill('oceanic'),
        ...Array<string>(7).fill('atmospheric'), ...Array<string>(8).fill('botanic'),
        ...Array<string>(8).fill('tranquilitic'), ...Array<string>(8).fill('chaotic')].sort());
    expect(conduits.filter((entry) => entry.price !== null)).toHaveLength(10);
    expect(conduits.filter((entry) => entry.art === null)).toHaveLength(5);
    expect(conduits.filter((entry) => entry.art === entry.id)).toHaveLength(85);
  });
  it('has100 stages 10-120, six distinct machines, every fifth-stage boss and no missing art URLs', () => {
    for (let stage = 1; stage <= 100; stage++) {
      const encounter = infusionEncounter('machines', stage);
      expect(encounter.boss).toBe(stage % 5 === 0);
      expect(encounter.enemy.art).toBe(machineEnemies[encounter.tier].art);
      expect(encounter.background).toBe('machines-arena.png');
      expect(encounter.level).toBe(Math.round(10 + (stage - 1) * 110 / 99));
    }
    expect(new Set(Array.from({ length: 100 }, (_, index) => infusionEncounter('machines', index + 1).enemy.name)).size).toBe(6);
    expect(infusionEncounter('machines', 100).stats.health).toBe(enemyGrowth.bossHealth);
    expect(infusionEncounter('machines', 99).stats.health).toBeLessThan(enemyGrowth.health);
    for (const [tier, [first, last]] of [[1, 17], [18, 34], [35, 50], [51, 67], [68, 84], [85, 100]].entries()) {
      expect(getCreature(`infusion:machines:${tier}`).stages).toEqual(Array.from({ length: last - first + 1 }, (_, index) => first + index));
    }
    for (const stage of [0, 101, NaN, 1.5]) expect(() => machineConduitDrops(stage, () => 0)).toThrow();
  });
  it('checks exact independent tier boundaries, excludes Omnic below 75 and chooses equal entries', () => {
    expect(machineConduitDrops(74, sequence(.08, .035))).toEqual({});
    expect(machineConduitDrops(75, sequence(.08, .035, .01))).toEqual({});
    const rarePool = conduits.filter((c) => c.rarity === 'Rare');
    const legendaryPool = conduits.filter((c) => c.rarity === 'Legendary');
    const omnicPool = conduits.filter((c) => c.rarity === 'Omnic');
    for (let index = 0; index < rarePool.length; index++) {
      const drops = machineConduitDrops(75, sequence(.079999, (index + .5) / rarePool.length,
        .035, .01));
      expect(Object.keys(drops)).toEqual([rarePool[index].id]);
    }
    for (let index = 0; index < legendaryPool.length; index++) {
      expect(machineConduitDrops(75, sequence(.08, .034999, (index + .5) / legendaryPool.length, .01)))
        .toEqual({ [legendaryPool[index].id]: 1 });
    }
    for (let index = 0; index < omnicPool.length; index++) {
      expect(machineConduitDrops(75, sequence(.08, .035, .009999, (index + .5) / omnicPool.length))).toEqual({ [omnicPool[index].id]: 1 });
    }
    expect(Object.keys(machineConduitDrops(100, () => 0))).toHaveLength(3);
    expect(bannerConduitBonus(() => .005)).toBeUndefined();
    const bannerPool = ['worldbreaker-drive', 'immortal-vessel', 'citadel-spine', 'astral-prism', 'judgment-lens'];
    for (let index = 0; index < bannerPool.length; index++) {
      expect(bannerConduitBonus(sequence(.004999, (index + .5) / bannerPool.length))).toBe(bannerPool[index]);
    }
    expect(conduits.filter((entry) => entry.rarity === 'Legendary' && isBannerConduitEligible(entry.id))).toHaveLength(5);
    expect(conduits.filter((entry) => entry.rarity === 'Legendary' && !isBannerConduitEligible(entry.id))).toHaveLength(10);
    for (const invalid of [-1, 1, NaN, Infinity]) expect(() => machineConduitDrops(1, () => invalid)).toThrow('Loot roll');
  });
  it('publishes exactly the acquisition API odds in the discovery-gated glossary', () => {
    for (const stage of [1, 74, 75, 100]) {
      const encounter = infusionEncounter('machines', stage);
      const pool = machineConduitLoot(stage);
      expect(pool).toHaveLength(stage < 75 ? 30 : 75);
      expect(pool.some((drop) => conduits.find((conduit) => conduit.id === drop.id)?.rarity === 'Common')).toBe(false);
      for (const [rarity, chance] of [['Rare', .08], ['Legendary', .035], ['Omnic', stage < 75 ? 0 : .01]] as const) {
        expect(pool.filter((drop) => conduits.find((c) => c.id === drop.id)?.rarity === rarity).reduce((sum, entry) => sum + entry.chance, 0)).toBeCloseTo(chance, 12);
      }
      const published = creatureLoot(getCreature(`infusion:machines:${encounter.tier}`), stage).slice(1);
      expect(published.filter(drop => drop.id !== 'grand-master-chest')).toEqual([machineComponentDrop(stage), ...pool]);
      expect(published.filter(drop => drop.id === 'grand-master-chest')).toHaveLength(stage === 100 ? 1 : 0);
    }
  });
});

describe('machine rewards and atomic saves', () => {
  function kill(stage = 26) {
    const state = createInfusionBattle('machines', stage, 1729, 'ember', { level: 0, evolution: 1 });
    state.enemies.forEach((enemy) => { enemy.hp = 1; enemy.stats.defense = 0; });
    state.conduitSeed = 1;
    return attack(state, 'light');
  }
  it('cannot award the same remaining name twice when an AoE defeats multiple enemies', () => {
    const state = createInfusionBattle('machines', 76, 1729, 'ember', { level: 105, evolution: 6 });
    expect(state.enemies.length).toBeGreaterThan(1);
    state.enemies.forEach(enemy => { enemy.hp = 1; enemy.stats.defense = 0; });
    state.allies[0].shatter = 100;
    state.conduitSeed = 8;
    state.machineConduits = Object.fromEntries(conduits.filter(c => c.id !== 'duplex-heart').map(c => [c.id, 1]));
    const result = attack(state, 'skill2');
    const rewards = result.events.filter(event => event.kind === 'reward');
    expect(rewards).toHaveLength(state.enemies.length);
    expect(rewards[0].conduits).toEqual({ 'duplex-heart': 1 });
    expect(rewards.slice(1).every(reward => Object.keys(reward.conduits ?? {}).length === 0)).toBe(true);
    expect(result.state.machineConduits?.['duplex-heart']).toBe(1);
    const saved = storage();
    saveAccount(saved, { ...loadAccount(saved), conduits: state.machineConduits });
    expect(saveAccountRewards(saved, result, 'aoe').conduits?.['duplex-heart']).toBe(1);
  });
  it('remembers acquisitions across kills/Continue, isolates all other RNG and leaves input state intact', () => {
    const state = createInfusionBattle('machines', 75, 1729, 'ember', { level: 105, evolution: 6 });
    state.enemies.forEach(enemy => { enemy.hp = 1; enemy.stats.defense = 0; });
    state.conduitSeed = 1;
    const first = attack(state, 'light');
    const drops = first.events.find(event => event.kind === 'reward')!.conduits!;
    expect(Object.keys(drops).length).toBeGreaterThan(0);
    expect(first.state.machineConduits).toEqual(drops);
    expect(state.machineConduits).toBeUndefined();
    const complete = structuredClone(state);
    complete.machineConduits = Object.fromEntries(conduits.map(c => [c.id, 3]));
    const before = structuredClone(complete);
    const protectedResult = attack(complete, 'light');
    expect(protectedResult.events.find(event => event.kind === 'reward')!.conduits).toEqual({});
    expect(complete).toEqual(before);
    for (const field of ['seed', 'rewardSeed', 'conduitSeed', 'componentSeed', 'masterChestSeed', 'captureSeed', 'lycalisSeed'] as const) {
      expect(protectedResult.state[field]).toEqual(first.state[field]);
    }
    const continued = nextStage(first.state, { level: 105, evolution: 6 }).state;
    expect(continued.machineConduits).toEqual(drops);
    expect(continued.machineConduits).not.toBe(first.state.machineConduits);
    continued.enemies.forEach(enemy => { enemy.hp = 1; enemy.stats.defense = 0; });
    continued.conduitSeed = 1;
    const second = attack(continued, 'light');
    const nextDrops = second.events.find(event => event.kind === 'reward')!.conduits!;
    expect(Object.keys(nextDrops).every(id => !(id in drops))).toBe(true);
  });
  it('rejects already-owned drops atomically, preserves historical copies/upgrades and can retry failed saves', () => {
    const saved = storage();
    const result = kill();
    const drops = result.events.find(event => event.kind === 'reward')!.conduits!;
    const id = Object.keys(drops)[0] as ConduitId;
    saveAccount(saved, { ...loadAccount(saved), conduits: { [id]: 4 }, conduitUpgrades: { [id]: 3 } });
    const raw = saved.getItem(ACCOUNT_KEY);
    const write = vi.spyOn(saved, 'setItem');
    expect(() => saveAccountRewards(saved, result, 'owned')).toThrow('unowned');
    expect(write).not.toHaveBeenCalled();
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    expect(loadAccount(saved).conduits?.[id]).toBe(4);
    expect(loadAccount(saved).conduitUpgrades?.[id]).toBe(3);
    const fresh = storage();
    const fail = vi.spyOn(fresh, 'setItem').mockImplementationOnce(() => { throw new Error('Storage denied'); });
    expect(() => saveAccountRewards(fresh, result, 'retry')).toThrow('Storage denied');
    expect(loadAccount(fresh).conduits).toBeUndefined();
    fail.mockRestore();
    expect(saveAccountRewards(fresh, result, 'retry').conduits).toEqual(drops);
  });
  it('uses isolated RNG, commits drops/discovery/receipt once and deduplicates replays', () => {
    const state = createInfusionBattle('machines', 26, 1729, 'ember', { level: 0, evolution: 1 });
    state.enemies.forEach((enemy) => { enemy.hp = 1; enemy.stats.defense = 0; });
    const first = attack({ ...state, conduitSeed: 1 }, 'light');
    const second = attack({ ...state, conduitSeed: 999 }, 'light');
    expect(first.state.seed).toBe(second.state.seed);
    expect(first.state.rewardSeed).toBe(second.state.rewardSeed);
    expect(first.state.captureSeed).toBe(state.captureSeed);
    expect(first.state.lycalisSeed).toBeUndefined();
    const reward = first.events.find((event) => event.kind === 'reward');
    expect(reward?.capture).toBeUndefined();
    expect(reward?.lycalis).toBeUndefined();
    expect(reward?.materials).toEqual({});
    expect(Object.keys(reward?.conduits ?? {})).not.toHaveLength(0);
    const saved = storage();
    const write = vi.spyOn(saved, 'setItem');
    const account = saveAccountRewards(saved, first, 'machine-test');
    expect(write).toHaveBeenCalledTimes(1);
    expect(account.conduits).toEqual(reward?.conduits);
    expect(account.receipts).toEqual(['machine-test:infusion-machines-26-0']);
    expect(account.creatures['infusion:machines:1'].defeated).toBe(true);
    saveAccountRewards(saved, first, 'machine-test');
    expect(write).toHaveBeenCalledTimes(1);
    expect(encounterRewards(first.events).map((entry) => entry.id)).toEqual(lootItems(reward!).map((entry) => entry.id));
  });
  it('rejects ineligible tiers, multiple same-tier awards, wrong sources, forbidden loot and overflow with no writes', () => {
    const saved = storage();
    saveAccount(saved, { ...loadAccount(saved), conduits: { 'duplex-heart': Number.MAX_SAFE_INTEGER } });
    const raw = saved.getItem(ACCOUNT_KEY);
    const write = vi.spyOn(saved, 'setItem');
    const result = kill();
    const rewardIndex = result.events.findIndex((event) => event.kind === 'reward');
    for (const extras of [
      { conduits: { 'duplex-heart': 1 } }, { conduits: { 'duplex-heart': 2 } },
      { conduits: { 'duplex-heart': 1, 'spearwheel-engine': 1 } },
      { conduits: { 'vigil-core': 1 } }, { materials: { 'infernic-common': 1 } }, { lycalis: 1 },
      { capture: { creatureId: 'infusion:machines:4', level: result.state.enemies[0].level! } },
    ]) {
      const invalid = structuredClone(result);
      invalid.events[rewardIndex] = { ...invalid.events[rewardIndex], ...extras };
      expect(() => saveAccountRewards(saved, invalid, 'invalid')).toThrow();
      expect(write).not.toHaveBeenCalled();
      expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    }
    const early = kill(25);
    early.events.find((event) => event.kind === 'reward')!.conduits = { 'infernic-phoenix-reactor': 1 };
    expect(() => saveAccountRewards(saved, early, 'early')).toThrow('Invalid machine');
    const wrong = kill();
    delete wrong.state.infusion;
    expect(() => saveAccountRewards(saved, wrong, 'wrong')).toThrow();
  });
  it('retains old saves without load writes, rejects machine ownership, and persists unlocks/snapshots', () => {
    const saved = storage();
    const write = vi.spyOn(saved, 'setItem');
    loadAccount(saved);
    expect(write).not.toHaveBeenCalled();
    expect(() => createCreatureCopy('infusion:machines:0')).toThrow('eligible');
    expect(() => validateCapturedCharacters([{ instanceId: 'capture:11111111-1111-1111-1111-111111111111', creatureId: 'infusion:machines:0', locked: false }])).toThrow('eligible');
    const state = omnicBattle('infernic');
    state.infusion = { mode: 'machines', stage: 26 };
    const real = createInfusionBattle('machines', 26, 1729, 'ember', { level: 50, evolution: 4 }, ['ember'], { ember: { level: 50, evolution: 4 } }, { ember: slots('infernic-phoenix-reactor') });
    real.phase = 'cleared';
    real.allies[0].conduitCharges = { burnFocus: true };
    const next = nextStage(real, { level: 50, evolution: 4 }).state;
    expect(next.infusion?.stage).toBe(27);
    expect(next.allies[0].conduits).toEqual(real.allies[0].conduits);
    expect(next.allies[0].conduitCharges).toBeUndefined();
    expect(saveAccountRewards(saved, { state: real, events: [] }, 'unlock').infusionStages.machines).toBe(27);
  });
  it('preserves saved stage numbers and discovers/unlocks the expanded late stages without ending at35', () => {
    const saved = storage();
    saveAccount(saved, { ...loadAccount(saved), infusionStages: { machines: 35, heavens: 35 },
      conduits: { 'infernic-phoenix-reactor': 1 }, conduitUpgrades: { 'infernic-phoenix-reactor': 5 } });
    const raw = saved.getItem(ACCOUNT_KEY);
    const write = vi.spyOn(saved, 'setItem');
    expect(loadAccount(saved).infusionStages).toEqual({ machines: 35, heavens: 35 });
    expect(loadAccount(saved).conduitUpgrades).toEqual({ 'infernic-phoenix-reactor': 5 });
    expect(write).not.toHaveBeenCalled();
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    const progress = { level: 105, evolution: 6 };
    for (const stage of [35, 74, 75, 99]) {
      const state = createInfusionBattle('machines', stage, 1, 'ember', progress);
      state.phase = 'cleared';
      expect(nextStage(state, progress).state.infusion?.stage).toBe(stage + 1);
      expect(battleResults(state, [])).toContain('data-result-continue');
      expect(saveAccountRewards(saved, { state, events: [] }, `clear-${stage}`).infusionStages.machines).toBe(stage + 1);
    }
    const final = createInfusionBattle('machines', 100, 1, 'ember', progress);
    final.phase = 'cleared';
    expect(() => nextStage(final, progress)).toThrow('Dungeon complete');
    expect(battleResults(final, [])).toContain('Activity complete');
    expect(battleResults(final, [])).not.toContain('data-result-continue');
    expect(saveAccountRewards(saved, { state: final, events: [] }, 'final').infusionStages.machines).toBe(100);
    const markup = gameplayHub(loadAccount(saved));
    expect(markup).toContain('<dd>100 stages</dd>');
    expect(markup).toContain('<dd>10-120</dd>');
    expect(markup).toContain('Omnic 1% from stage 75');
    expect(markup).toContain('Every Machine drops Broken Mechanical Components for Conduit upgrades: 3 at stage 1');
    expect(markup).toContain('increasing steadily to 125 at stage 100');
    expect(markup).toContain('The final boss drops 625.');
    expect(markup).toContain('value="100" selected');
    expect(validateAccount({ ...loadAccount(saved), infusionStages: { machines: 100 } }).infusionStages.machines).toBe(100);
    expect(() => validateAccount({ ...loadAccount(saved), infusionStages: { machines: 101 } })).toThrow('stage');
    expect(infusionEncounter('heavens', 35).level).toBe(120);
    expect(() => infusionEncounter('heavens', 36)).toThrow();
  });
  it.each(['standard', 'roses'])('saves %s main outcome, bonus, cost and pity together; fails atomically', (banner) => {
    const saved = storage();
    saveAccount(saved, { ...loadAccount(saved), lycalis: 20 });
    const write = vi.spyOn(saved, 'setItem');
    const draw = summonCharacter(saved, () => 0, banner);
    expect(draw.bonusConduit).toBe('worldbreaker-drive');
    expect(draw.account.conduits?.['worldbreaker-drive']).toBe(1);
    expect(draw.account.lycalis).toBe(10);
    expect(draw.account.bannerPity?.[banner === 'standard' ? 'standard' : 'roses']).toBeDefined();
    expect(draw.account.conduitEquipment).toBeUndefined();
    expect(write).toHaveBeenCalledTimes(1);
    const raw = saved.getItem(ACCOUNT_KEY);
    vi.spyOn(saved, 'setItem').mockImplementation(() => { throw new Error('Storage unavailable'); });
    expect(() => summonCharacter(saved, () => 0, banner)).toThrow('Storage unavailable');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
  });
  it('does not roll on unaffordable draws and rejects bonus overflow without charging or advancing pity', () => {
    const saved = storage();
    const random = vi.fn(() => 0);
    expect(() => summonCharacter(saved, random)).toThrow('requires');
    expect(random).not.toHaveBeenCalled();
    saveAccount(saved, { ...loadAccount(saved), lycalis: 10, conduits: { 'worldbreaker-drive': Number.MAX_SAFE_INTEGER } });
    const raw = saved.getItem(ACCOUNT_KEY);
    const write = vi.spyOn(saved, 'setItem');
    expect(() => summonCharacter(saved, random)).toThrow('Conduit inventory');
    expect(write).not.toHaveBeenCalled();
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
  });
});

describe('Conduit equipment and all ten Omnic mechanics', () => {
  it('validates element matching, four-Omnic cap, captured element and drop-only purchases atomically', () => {
    const saved = storage();
    saveAccount(saved, { ...loadAccount(saved), conduits: Object.fromEntries(conduits.map((entry) => [entry.id, 1])) });
    const raw = saved.getItem(ACCOUNT_KEY);
    expect(() => equipConduit(saved, 'ember', 0, 'aquatic-leviathan-pump')).toThrow('requires');
    expect(() => purchaseConduit(saved, 'duplex-heart')).toThrow('not sold');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    expect(equipConduit(saved, 'ember', 0, 'infernic-phoenix-reactor').conduitEquipment?.ember?.[0]).toBe('infernic-phoenix-reactor');
    expect(() => validateConduitSlots([...conduits.filter((entry) => entry.rarity === 'Omnic').slice(0, 5).map((entry) => entry.id), null, null, null])).toThrow('four');
    const copy = createCreatureCopy('infusion:heavens:0');
    expect(() => resolveCapturedFighter(copy, slots('infernic-phoenix-reactor'))).toThrow('requires');
    expect(() => resolveCapturedFighter(copy, slots('tranquilitic-kirin-cradle'))).not.toThrow();
    const invalid = { ...loadAccount(saved), conduitEquipment: { ember: slots('aquatic-leviathan-pump') } };
    expect(() => validateAccount(invalid)).toThrow('requires');
  });
});

describe('expanded Omnic mechanics', () => {

  it('publishes ordered typed debuff snapshots on application, periodic damage, and duration changes', () => {
    const state = expandedBattle('aquatic-undertide-chronometer');
    const application = attack(state, 'skill1');
    const applied = application.events.find((entry) => entry.kind === 'status' && entry.target === state.enemies[0].id)?.debuffs;
    expect(applied?.weakened).toBe(1);
    expect(applied?.weakenFraction).toBe(application.state.enemies[0].weakenFraction);
    const tick = endTurn(application.state);
    const weakenUpdate = tick.events.find((entry) => entry.kind === 'status' && entry.target === state.enemies[0].id);
    expect(weakenUpdate?.debuffs?.weakened).toBe(0);
    expect(weakenUpdate?.debuffs?.weakenFraction).toBe(0);
    const periodicState = structuredClone(state);
    periodicState.enemies[0].burn = { damage: 7, turns: 2, sourceId: state.allies[0].id };
    const periodic = endTurn(periodicState).events.find((entry) => entry.periodic);
    expect(periodic?.debuffs).toEqual({
      burn: { damage: 7, turns: 1 },
      elementalEffects: [{ family: 'burn', kind: 'burn', origin: 'native', source: 'living-self-authored-burn' }],
      weakened: 0, weakenFraction: 0,
    });
  });
});
