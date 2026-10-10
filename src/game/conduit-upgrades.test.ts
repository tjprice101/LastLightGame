import { describe, expect, it, vi } from 'vitest';
import { ACCOUNT_KEY, emptyAccount, loadAccount, saveAccount, saveAccountRewards, upgradeConduit, purchaseConduit, validateAccount } from './account';
import { SAVE_KEY, type ProfileStorage } from './profile';
import { conduits, getConduit, conduitBuffs, conduitEffect, conduitUpgradeCost, conduitUpgradeCosts, type ConduitSlots } from '../content/conduits';
import { resolveFighter, applyConduitBuffs } from '../content/combat';
import { createCreatureCopy, resolveCapturedFighter } from './character-instances';
import { machineComponentDrop, rollMachineComponents } from '../content/mechanical-components';
import { creatureLoot, getCreature } from '../content/creatures';
import { infusionEncounter } from '../content/infusions';
import { playableDungeons } from '../content/dungeons';
import { createSession } from '../presentation/battle-view';
import { act, createInfusionBattle, createBattle, nextStage, nextWave } from './battle';

function storage(): ProfileStorage {
  const values = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); },
    removeItem: (key) => { values.delete(key); } };
}
function preparedStorage() {
  const saved = storage();
  saveAccount(saved, { ...loadAccount(saved), fractalis: 10000, lycalis: 42, mechanicalComponents: 600,
    conduits: { 'vigil-core': 2, 'worldbreaker-drive': 1 }, materials: { 'infernic-common': 7 },
    conduitEquipment: { ember: ['worldbreaker-drive', 'vigil-core', null, null, null, null, null, null] } });
  return saved;
}
function kill(stage = 1, componentSeed = 1) {
  const state = createInfusionBattle('machines', stage, 1729, 'ember', { level: 0, evolution: 1 });
  for (const enemy of state.enemies) { enemy.hp = 1; enemy.stats.defense = 0; }
  state.componentSeed = componentSeed;
  return act(state, 'ember', 'light', state.enemies[0].id);
}

describe('component progression and isolated rewards', () => {
  it('uses exact stage endpoints, monotonically increasing chance/quantity and one roll per kill', () => {
    expect(machineComponentDrop(1)).toMatchObject({ minimum: 1, maximum: 1, chance: .25 });
    expect(machineComponentDrop(100)).toMatchObject({ minimum: 100, maximum: 100, chance: 1 });
    let lastChance = 0;
    let lastQuantity = 0;
    for (let stage = 1; stage <= 100; stage++) {
      const drop = machineComponentDrop(stage);
      expect(drop.chance).toBeCloseTo(.25 + .75 * (stage - 1) / 99, 14);
      expect(drop.minimum).toBe(Math.round(1 + 99 * ((stage - 1) / 99) ** 2));
      expect(drop.chance).toBeGreaterThan(lastChance);
      expect(drop.minimum).toBeGreaterThanOrEqual(lastQuantity);
      const hit = vi.fn(() => drop.chance - 1e-10);
      expect(rollMachineComponents(stage, hit)).toBe(drop.minimum);
      expect(hit).toHaveBeenCalledTimes(1);
      if (drop.chance < 1) expect(rollMachineComponents(stage, () => drop.chance)).toBe(0);
      else expect(rollMachineComponents(stage, () => 1 - 1e-10)).toBe(100);
      lastChance = drop.chance; lastQuantity = drop.minimum;
      const encounter = infusionEncounter('machines', stage);
      expect(creatureLoot(getCreature(`infusion:machines:${encounter.tier}`), stage)).toContainEqual(drop);
    }
    for (const stage of [0, 101, NaN, Infinity, 1.5]) expect(() => machineComponentDrop(stage)).toThrow();
    for (const value of [-1, 1, NaN, Infinity]) expect(() => rollMachineComponents(1, () => value)).toThrow('Loot roll');
  });
  it('does not perturb combat, Conduit, currency, capture or premium RNG and drops only per actual kill', () => {
    const success = kill(1, 1);
    const miss = kill(1, 0x80000000);
    expect(success.events.find((event) => event.kind === 'reward')?.mechanicalComponents).toBe(1);
    expect(miss.events.find((event) => event.kind === 'reward')?.mechanicalComponents).toBeUndefined();
    for (const key of ['seed', 'rewardSeed', 'conduitSeed', 'captureSeed', 'lycalisSeed'] as const) {
      expect(success.state[key]).toBe(miss.state[key]);
    }
    expect(success.events.filter((event) => event.kind !== 'reward')).toEqual(miss.events.filter((event) => event.kind !== 'reward'));
    const rewards = (result: ReturnType<typeof kill>) => result.events.filter((event) => event.kind === 'reward')
      .map(({ mechanicalComponents: _components, message: _message, ...reward }) => reward);
    expect(rewards(success)).toEqual(rewards(miss));
    const battle = createBattle();
    battle.enemies[0].hp = 1; battle.enemies[0].stats.defense = 0;
    expect(act(battle, 'ember', 'light', battle.enemies[0].id).events.find((event) => event.kind === 'reward')?.mechanicalComponents).toBeUndefined();
    for (const stage of [1, 5, 35, 75, 99, 100]) {
      const result = kill(stage);
      expect(result.events.filter((event) => event.kind === 'reward')).toHaveLength(1);
      expect(result.events.find((event) => event.kind === 'reward')?.mechanicalComponents).toBe(machineComponentDrop(stage).minimum);
    }
  });
  it('commits components with all ordinary rewards and receipt once, with no partial writes on failure', () => {
    const saved = storage();
    const result = kill(100);
    const write = vi.spyOn(saved, 'setItem');
    const account = saveAccountRewards(saved, result, 'components');
    expect(account.mechanicalComponents).toBe(100);
    expect(account.fractalis).toBeGreaterThan(0);
    expect(account.creatures['infusion:machines:5'].defeated).toBe(true);
    expect(account.receipts).toHaveLength(1);
    expect(write).toHaveBeenCalledTimes(1);
    expect(saveAccountRewards(saved, result, 'components')).toEqual(account);
    expect(write).toHaveBeenCalledTimes(1);
    const raw = saved.getItem(ACCOUNT_KEY);
    write.mockImplementation(() => { throw new Error('Storage unavailable'); });
    expect(() => saveAccountRewards(saved, result, 'second')).toThrow('Storage unavailable');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
  });
  it('validates and saves exact BMC quantities across all100 real encounters without duplicate awards', () => {
    const saved = storage();
    let components = 0;
    for (let stage = 1; stage <= 100; stage++) {
      const result = kill(stage);
      components += machineComponentDrop(stage).minimum;
      const account = saveAccountRewards(saved, result, `stage-${stage}`);
      expect(account.mechanicalComponents).toBe(components);
      expect(saveAccountRewards(saved, result, `stage-${stage}`).mechanicalComponents).toBe(components);
    }
    expect(loadAccount(saved).receipts).toHaveLength(100);
    expect(loadAccount(saved).infusionStages.machines).toBe(100);
  });
  it('rejects invalid quantities, activities, sources, alive enemies and overflow without changing any save data', () => {
    const saved = storage();
    saveAccount(saved, { ...loadAccount(saved), mechanicalComponents: Number.MAX_SAFE_INTEGER });
    const raw = saved.getItem(ACCOUNT_KEY);
    const write = vi.spyOn(saved, 'setItem');
    for (const quantity of [0, -1, 1.5, 4, 6, Infinity, NaN, Number.MAX_SAFE_INTEGER]) {
      const result = kill(100);
      const reward = result.events.find((event) => event.kind === 'reward')!;
      reward.mechanicalComponents = quantity;
      expect(() => saveAccountRewards(saved, result, 'bad')).toThrow();
    }
    expect(() => saveAccountRewards(saved, kill(100), 'overflow')).toThrow('capacity');
    for (const mode of ['heavens', 'abyss', 'treasury', 'sanctuary', 'roses'] as const) {
      const state = createInfusionBattle(mode, 1, 1729, 'ember', { level: 0, evolution: 1 });
      state.enemies[0].hp = 1; state.enemies[0].stats.defense = 0;
      const result = act(state, 'ember', 'light', state.enemies[0].id);
      result.events.find((event) => event.kind === 'reward')!.mechanicalComponents = 1;
      expect(() => saveAccountRewards(saved, result, 'bad-mode')).toThrow('only drop');
    }
    const alive = kill(100);
    alive.state.enemies[0].hp = 1;
    expect(() => saveAccountRewards(saved, alive, 'alive')).toThrow('source');
    const wrongSource = kill(100);
    wrongSource.events.find((event) => event.kind === 'reward')!.source = 'missing';
    expect(() => saveAccountRewards(saved, wrongSource, 'source')).toThrow('source');
    expect(write).not.toHaveBeenCalled();
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
  });
});

describe('account-wide five-step Conduit restoration', () => {
  it('requires120000 components to max one Omnic name without changing previous upgrades', () => {
    const conduit = getConduit('infernic-phoenix-reactor');
    expect(conduitUpgradeCosts.reduce((sum, _cost, level) => sum + (conduitUpgradeCost(conduit, level) ?? 0), 0)).toBe(120000);
    const saved = storage();
    saveAccount(saved, { ...loadAccount(saved), conduits: { [conduit.id]: 1 }, mechanicalComponents: 120000 });
    for (let level = 0; level < 5; level++) upgradeConduit(saved, conduit.id, level);
    expect(loadAccount(saved).mechanicalComponents).toBe(0);
    expect(loadAccount(saved).conduitUpgrades?.[conduit.id]).toBe(5);
  });
  it('spends only components, never copies, preserving every other account field through all five upgrades', () => {
    const saved = preparedStorage();
    saveAccount(saved, { ...loadAccount(saved), mechanicalComponents: 2400 });
    const before = loadAccount(saved);
    const write = vi.spyOn(saved, 'setItem');
    for (let level = 0; level < 5; level++) {
      const account = upgradeConduit(saved, 'worldbreaker-drive', level);
      const spent = conduitUpgradeCosts.slice(0, level + 1).reduce((sum, cost) => sum + cost * 4, 0);
      expect(account).toEqual({ ...before, mechanicalComponents: 2400 - spent, conduitUpgrades: { 'worldbreaker-drive': level + 1 } });
      expect(write).toHaveBeenCalledTimes(level + 1);
      expect(loadAccount(saved)).toEqual(account);
    }
    expect(conduitUpgradeCost(getConduit('worldbreaker-drive'), 5)).toBeNull();
    expect(() => upgradeConduit(saved, 'worldbreaker-drive', 5)).toThrow('five times');
    expect(write).toHaveBeenCalledTimes(5);
  });
  it.each(conduits)('charges exact rarity costs for every upgrade of $name, rejecting one-component short balances', (conduit) => {
    const costs = {
      Common: [25, 50, 100, 175, 250],
      Rare: [50, 100, 200, 350, 500],
      Legendary: [100, 200, 400, 700, 1000],
      Omnic: [5000, 10000, 20000, 35000, 50000],
    }[conduit.rarity];
    const saved = storage();
    for (let level = 0; level < 5; level++) {
      const cost = costs[level];
      expect(conduitUpgradeCost(conduit, level)).toBe(cost);
      saveAccount(saved, { ...loadAccount(saved), conduits: { [conduit.id]: 1 },
        conduitUpgrades: { [conduit.id]: level }, mechanicalComponents: cost - 1 });
      const raw = saved.getItem(ACCOUNT_KEY);
      const write = vi.spyOn(saved, 'setItem');
      expect(() => upgradeConduit(saved, conduit.id, level)).toThrow(`costs ${cost}`);
      expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
      expect(write).not.toHaveBeenCalled();
      write.mockRestore();
      saveAccount(saved, { ...loadAccount(saved), mechanicalComponents: cost });
      const upgradeWrite = vi.spyOn(saved, 'setItem');
      const account = upgradeConduit(saved, conduit.id, level);
      expect(account.mechanicalComponents).toBe(0);
      expect(account.conduitUpgrades?.[conduit.id]).toBe(level + 1);
      expect(upgradeWrite).toHaveBeenCalledTimes(1);
      upgradeWrite.mockRestore();
    }
    expect(conduitUpgradeCost(conduit, 5)).toBeNull();
  });
  it('rejects unowned, stale, malformed, capped, insufficient and failed upgrades without writes', () => {
    const saved = preparedStorage();
    for (const level of [-1, 6, NaN, Infinity, 1.5]) expect(() => upgradeConduit(saved, 'vigil-core', level)).toThrow();
    expect(() => upgradeConduit(saved, 'duplex-heart', 0)).toThrow('owned');
    expect(() => Reflect.apply(upgradeConduit, null, [saved, 'unknown', 0])).toThrow('Unknown');
    upgradeConduit(saved, 'vigil-core', 0);
    const raw = saved.getItem(ACCOUNT_KEY);
    const write = vi.spyOn(saved, 'setItem');
    expect(() => upgradeConduit(saved, 'vigil-core', 0)).toThrow('changed');
    expect(write).not.toHaveBeenCalled();
    write.mockImplementation(() => { throw new Error('Write failed'); });
    expect(() => upgradeConduit(saved, 'vigil-core', 1)).toThrow('Write failed');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    const empty = storage();
    saveAccount(empty, { ...loadAccount(empty), conduits: { 'vigil-core': 1 } });
    const emptyRaw = empty.getItem(ACCOUNT_KEY);
    expect(() => upgradeConduit(empty, 'vigil-core', 0)).toThrow('Not enough');
    expect(empty.getItem(ACCOUNT_KEY)).toBe(emptyRaw);
    empty.removeItem(SAVE_KEY);
    expect(() => upgradeConduit(empty, 'vigil-core', 0)).toThrow('first Element-Bearer');
  });
  it('loads legacy levels/balance without writes and validates all optional save shapes and ownership', () => {
    const saved = preparedStorage();
    const before = saved.getItem(ACCOUNT_KEY);
    const write = vi.spyOn(saved, 'setItem');
    const account = loadAccount(saved);
    expect(account.conduitUpgrades).toBeUndefined();
    expect(write).not.toHaveBeenCalled();
    expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
    for (const value of [null, [], -1, 1.5, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1, '10']) {
      expect(() => validateAccount({ ...account, mechanicalComponents: value })).toThrow('Components');
    }
    for (const value of [null, [], { unknown: 1 }, { 'vigil-core': -1 }, { 'vigil-core': 6 }, { 'vigil-core': 1.5 }, { 'duplex-heart': 1 }]) {
      expect(() => validateAccount({ ...account, conduitUpgrades: value })).toThrow();
      expect(() => validateAccount({ ...emptyAccount(), conduitUpgrades: value })).toThrow();
    }
    expect(validateAccount({ ...emptyAccount(), conduitUpgrades: {} }).conduitUpgrades).toEqual({});
    expect(validateAccount({ ...emptyAccount(), mechanicalComponents: 0 }).mechanicalComponents).toBe(0);
    expect(() => validateAccount({ ...emptyAccount(), conduitUpgrades: { 'vigil-core': 1 } })).toThrow('owned Conduit');
    expect(() => validateAccount({ ...emptyAccount(), conduitUpgrades: { unknown: 1 } })).toThrow('Unknown');
    const legacy = storage();
    const legacyWrite = vi.spyOn(legacy, 'setItem');
    expect(loadAccount(legacy).mechanicalComponents).toBeUndefined();
    expect(loadAccount(legacy).conduitUpgrades).toBeUndefined();
    expect(legacyWrite).not.toHaveBeenCalled();
    const upgraded = upgradeConduit(saved, 'vigil-core', 0);
    expect(purchaseConduit(saved, 'vigil-core').conduitUpgrades).toEqual(upgraded.conduitUpgrades);
  });
  it.each(conduits)('scales every $name stat modifier and drawback exactly through +5, without scaling mechanics', (conduit) => {
    const original = structuredClone(conduit);
    const base = conduitBuffs(conduit);
    for (let level = 0; level <= 5; level++) {
      expect(conduitBuffs(conduit, level)).toEqual(base.map((buff) => ({ ...buff, amount: buff.amount * (1 + .5 * level) })));
      if (conduit.mechanic) expect(conduitEffect(conduit, level)).toContain(conduit.effect.slice(conduit.effect.indexOf('. ') + 2));
    }
    expect(conduit).toEqual(original);
  });
  it('uses grown stats for both starters and captures, scales flat/percentage-points, and caps crit', () => {
    const equipment: ConduitSlots = ['worldbreaker-drive', 'parallax-relay', 'fracture-reservoir', null, null, null, null, null];
    const upgrades = { 'worldbreaker-drive': 5, 'parallax-relay': 5, 'fracture-reservoir': 5 };
    const progress = { level: 105, evolution: 6, weaponRank: 4 };
    const base = resolveFighter('ember', progress).stats;
    const stats = resolveFighter('ember', progress, equipment, upgrades).stats;
    expect(stats.damage).toBeCloseTo(base.damage * 3.975);
    expect(stats.health).toBeCloseTo(base.health * .65);
    expect(stats.crit).toBeCloseTo(Math.min(1, base.crit + .07));
    expect(stats.shatterCapacity).toBeCloseTo(base.shatterCapacity + 17.5);
    const capped = { ...base, crit: .98 };
    applyConduitBuffs(capped, equipment, upgrades);
    expect(capped.crit).toBe(1);
    const copy = createCreatureCopy('infusion:heavens:0', 1, 80);
    const capturedBase = resolveCapturedFighter(copy).stats;
    const captured = resolveCapturedFighter(copy, equipment, upgrades).stats;
    expect(captured.damage).toBeCloseTo(capturedBase.damage * 3.975);
    expect(captured.health).toBeCloseTo(capturedBase.health * .65);
    expect(resolveFighter('ember', progress).stats).toEqual(base);
    expect(conduitEffect(conduits.find((c) => c.id === 'worldbreaker-drive')!, 5)).toBe('+297.5% Attack, -35% Health');
  });
  const destinations = [undefined, ...playableDungeons.map((element) => ({ element, stage: 1 })),
    ...(['heavens', 'abyss', 'treasury', 'sanctuary', 'roses', 'machines'] as const).map((mode) => ({ mode, stage: 1 }))];
  it.each(destinations)('snapshots upgrades across activity entry, Continue/next wave, Settings state and replay %j', (destination) => {
    const upgrades = { 'vigil-core': 3 };
    const slots: ConduitSlots = ['vigil-core', null, null, null, null, null, null, null];
    const progress = { level: 105, evolution: 6 };
    const session = createSession('ember', progress, destination, { ids: ['ember'], progress: { ember: progress }, equipment: { ember: slots }, upgrades });
    upgrades['vigil-core'] = 5;
    expect(session.state.conduitUpgrades).toEqual({ 'vigil-core': 3 });
    expect(session.state.allies[0].stats.health).toBeCloseTo(resolveFighter('ember', progress).stats.health * 1.125);
    session.state.phase = 'cleared';
    session.state.componentSeed = 42;
    const next = (destination ? nextStage(session.state, progress) : nextWave(session.state)).state;
    expect(next.conduitUpgrades).toEqual(session.state.conduitUpgrades);
    expect(next.allies[0].stats).toEqual(session.state.allies[0].stats);
    expect(next.componentSeed).toBe(42);
    const replay = createSession('ember', progress, destination, { ids: ['ember'], progress: { ember: progress },
      equipment: { ember: next.allies[0].conduits }, upgrades: next.conduitUpgrades });
    expect(replay.state.allies[0].stats).toEqual(next.allies[0].stats);
    expect(createSession('ember', progress, destination, { ids: ['ember'], progress: { ember: progress }, equipment: { ember: slots }, upgrades })
      .state.allies[0].stats.health).toBeGreaterThan(session.state.allies[0].stats.health);
  });
});
