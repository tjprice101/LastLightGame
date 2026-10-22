import { describe, expect, it, vi } from 'vitest';
import { calamityActivities, calamityChest, calamityChestId, rollCalamityChest, type CalamityActivityId } from '../content/calamity';
import { infusionStageCount } from '../content/activities';
import { isPlayableDungeon } from '../content/dungeons';
import { masterConduits } from '../content/master-conduits';
import { calamiticConduits, calamiticLockMessage, calamiticTokenPrice } from '../content/calamitic-conduits';
import { ACCOUNT_KEY, calamityUnlockedTier, emptyAccount, loadAccount, openCalamityChest, purchaseConduit, saveAccount, saveAccountRewards, validateAccount, type Account } from './account';
import { act, createCalamityBattle, createDungeonBattle, createInfusionBattle, type BattleEvent, type BattleResult } from './battle';
import { SAVE_KEY, type ProfileStorage } from './profile';

function storage() {
  const values = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  let writes = 0;
  let denied = false;
  const saved: ProfileStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      if (denied) throw new Error('Storage denied.');
      values.set(key, value);
      writes++;
    },
    removeItem: (key) => { values.delete(key); },
  };
  return { saved, writes: () => writes, deny: () => { denied = true; }, allow: () => { denied = false; } };
}

function prepared(saved: ProfileStorage, activity: CalamityActivityId, tier: 1 | 2 | 3 = 1): Account {
  const account = emptyAccount();
  account.normalFinalClears = { [activity]: true };
  account.calamityClears = { [activity]: tier - 1 };
  return saveAccount(saved, account);
}

function victory(activity: CalamityActivityId, tier: 1 | 2 | 3): BattleResult {
  const state = createCalamityBattle(activity, tier, 17, 'ember', { level: 105, evolution: 6 });
  const boss = state.enemies[0];
  boss.hp = 0;
  boss.boss = true;
  state.enemies = [boss];
  state.phase = 'cleared';
  state.calamity = { activity, tier };
  const reward: BattleEvent = { kind: 'reward', source: boss.id, target: boss.id, amount: 0, critical: false,
    message: 'Calamity chest.', calamityChest: calamityChestId(activity, tier) };
  return { state, events: [reward] };
}

function rng(seed: number) {
  return () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    seed >>>= 0;
    return seed / 0x100000000;
  };
}

describe('Calamity account transactions', () => {
  it.each(calamityActivities.flatMap(({ id }) => ([1, 2, 3] as const).map((tier) => [id, tier] as const)))(
    '%s EX%i atomically earns and opens exactly its chest without ordinary loot',
    (activity, tier) => {
      const { saved, writes } = storage();
      prepared(saved, activity, tier);
      const before = writes();
      const result = victory(activity, tier);
      const account = saveAccountRewards(saved, result, 'run');
      const id = calamityChestId(activity, tier);
      expect(writes()).toBe(before + 1);
      expect(account.calamityChests).toEqual({ [id]: 1 });
      expect(account.calamityClears?.[activity]).toBe(tier);
      expect(account.fractalis).toBe(0);
      expect(account.materials).toEqual({});
      expect(account.creatures).toEqual({ [`calamity:${activity}`]: { defeated: true } });
      expect(account.capturedCharacters).toBeUndefined();
      expect(account.masterChests).toBeUndefined();
      const after = writes();
      expect(saveAccountRewards(saved, result, 'run')).toEqual(account);
      expect(writes()).toBe(after);
      const opened = openCalamityChest(saved, id, 1);
      expect(opened.chest).toEqual(calamityChest(activity, tier));
      expect(opened.account).toEqual(loadAccount(saved));
      expect(opened.account.calamityChests?.[id]).toBe(0);
      expect(opened.account.fractalis).toBe(opened.reward.fractalis);
      expect(opened.account.lycalis).toBe(opened.reward.lycalis);
      expect(opened.account.materials).toEqual(opened.reward.materials);
      expect(opened.account.conduits ?? {}).toEqual(opened.reward.conduits);
      expect(opened.account.masterChests).toBe(opened.reward.masterChests);
      expect(opened.account.calamitySeed).toBeGreaterThan(0);
      expect(opened.reward.calamiticTokens).toBe([1, 3, 8][tier - 1]);
      expect(opened.account.calamiticTokens).toBe([1, 3, 8][tier - 1]);
      expect(writes()).toBe(after + 1);
    },
  );

  it.each([
    { calamityChests: [] }, { calamityChests: { invalid: 1 } },
    { calamityChests: { [calamityChestId('infernic', 1)]: -1 } },
    { calamityChests: { [calamityChestId('infernic', 1)]: 0.5 } },
    { calamityChests: { [calamityChestId('infernic', 1)]: Number.MAX_SAFE_INTEGER + 1 } },
    { calamityClears: [] }, { calamityClears: { invalid: 1 } },
    { calamityClears: { infernic: -1 } }, { calamityClears: { infernic: 4 } },
    { calamityClears: { infernic: 1.5 } }, { normalFinalClears: [] },
    { normalFinalClears: { invalid: true } }, { normalFinalClears: { infernic: 1 } },
    { calamiticTokens: -1 }, { calamiticTokens: 0.5 }, { calamiticTokens: Number.MAX_SAFE_INTEGER + 1 },
    { calamiticTokens: '1' }, { calamiticTokens: null },
    { calamitySeed: 0 }, { calamitySeed: -1 }, { calamitySeed: 0.5 },
    { calamitySeed: 0x100000000 }, { calamitySeed: '1' },
    { calamityChests: null }, { calamityClears: null }, { normalFinalClears: null }, { calamitySeed: null },
  ])('rejects malformed optional persistence without replacing it: %j', (fields) => {
    const { saved, writes } = storage();
    const raw = JSON.stringify({ ...emptyAccount(), ...fields });
    saved.setItem(ACCOUNT_KEY, raw);
    const before = writes();
    expect(() => loadAccount(saved)).toThrow();
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    expect(writes()).toBe(before);
  });

  it('loads legacy and optional zero/false fields without writing or inventing evidence', () => {
    const { saved, writes } = storage();
    const raw = JSON.stringify({ ...emptyAccount(), dungeonStages: { infernic: 35 }, infusionStages: { machines: infusionStageCount('machines') },
      receipts: ['ambiguous:infusion-machines-100-0', 'ambiguous:dungeon-infernic-35-0'] });
    saved.setItem(ACCOUNT_KEY, raw);
    const before = writes();
    const account = loadAccount(saved);
    expect(calamityUnlockedTier(account, 'infernic')).toBe(0);
    expect(calamityUnlockedTier(account, 'machines')).toBe(0);
    expect(account.calamitySeed).toBeUndefined();
    expect(account.calamiticTokens).toBeUndefined();
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    expect(writes()).toBe(before);
    const legacyRaw = JSON.stringify({ ...emptyAccount(), version: 4 });
    saved.setItem(ACCOUNT_KEY, legacyRaw);
    expect(loadAccount(saved).calamiticTokens).toBeUndefined();
    expect(saved.getItem(ACCOUNT_KEY)).toBe(legacyRaw);
    expect(validateAccount({ ...emptyAccount(), calamityClears: { infernic: 0 },
      normalFinalClears: { infernic: false }, calamityChests: { [calamityChestId('infernic', 1)]: 0 },
      calamitySeed: 0xffffffff, calamiticTokens: Number.MAX_SAFE_INTEGER }).calamiticTokens).toBe(Number.MAX_SAFE_INTEGER);
    expect(validateAccount({ ...emptyAccount(), calamiticTokens: 0 }).calamiticTokens).toBe(0);
  });

  it.each(calamityActivities)('$id recognizes exact historical UUID kill receipts with final-stage access without writes', ({ id }) => {
    const { saved, writes } = storage();
    const account = emptyAccount();
    const dungeon = isPlayableDungeon(id);
    const final = dungeon ? 35 : infusionStageCount(id);
    if (dungeon) account.dungeonStages[id] = final;
    else account.infusionStages[id] = final;
    account.receipts = [`12345678-1234-4abc-8def-123456789abc:${dungeon ? 'dungeon' : 'infusion'}-${id}-${final}-0`];
    account.calamityClears = { [id]: 1 };
    const raw = JSON.stringify(account);
    saved.setItem(ACCOUNT_KEY, raw);
    const before = writes();
    const loaded = loadAccount(saved);
    expect(calamityUnlockedTier(loaded, id)).toBe(2);
    expect(loaded.normalFinalClears).toBeUndefined();
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    expect(writes()).toBe(before);
  });

  it('requires exact current-final receipt identity, UUIDv4 provenance, and matching final access', () => {
    const uuid = '12345678-1234-4abc-8def-123456789abc';
    const account = emptyAccount();
    account.infusionStages.machines = infusionStageCount('machines');
    for (const receipt of [
      `${uuid}:infusion-machines-75-0`,
      `${uuid}:infusion-machines-100-1`,
      `${uuid}:infusion-machines-100-0:extra`,
      `prefix${uuid}:infusion-machines-100-0`,
      `prefix:${uuid}:infusion-machines-100-0`,
      `ambiguous:infusion-machines-100-0`,
      '12345678-1234-1abc-8def-123456789abc:infusion-machines-100-0',
      '12345678-1234-4abc-7def-123456789abc:infusion-machines-100-0',
      `${uuid}:infusion-treasury-25-0`,
      `${uuid}:dungeon-machines-100-0`,
      `${uuid}:infusion-machines-100-0\n`,
    ]) {
      account.receipts = [receipt];
      expect(calamityUnlockedTier(account, 'machines'), receipt).toBe(0);
    }
    account.receipts = [`${uuid}:infusion-machines-100-0`];
    account.infusionStages.machines = infusionStageCount('machines') - 1;
    expect(calamityUnlockedTier(account, 'machines')).toBe(0);
    delete account.infusionStages.machines;
    expect(calamityUnlockedTier(account, 'machines')).toBe(0);
    account.normalFinalClears = { machines: true };
    expect(calamityUnlockedTier(account, 'machines')).toBe(1);
  });

  it('requires normal victory and sequential per-activity tiers while allowing replay', () => {
    const { saved } = storage();
    expect(() => saveAccountRewards(saved, victory('infernic', 1), 'locked')).toThrow('locked');
    prepared(saved, 'infernic');
    expect(() => saveAccountRewards(saved, victory('infernic', 2), 'skip')).toThrow('locked');
    expect(() => saveAccountRewards(saved, victory('oceanic', 1), 'other')).toThrow('locked');
    for (const tier of [1, 2, 3] as const) {
      const account = saveAccountRewards(saved, victory('infernic', tier), `tier-${tier}`);
      expect(calamityUnlockedTier(account, 'infernic')).toBe(Math.min(3, tier + 1));
    }
    const replay = saveAccountRewards(saved, victory('infernic', 1), 'replay');
    expect(replay.calamityClears?.infernic).toBe(3);
    expect(replay.calamityChests?.[calamityChestId('infernic', 1)]).toBe(2);
  });

  it('records seen on valid entry and defeat, then defeated only with an atomic chest reward', () => {
    const { saved, writes } = storage();
    prepared(saved, 'infernic');
    const state = createCalamityBattle('infernic', 1, 17, 'ember', { level: 105, evolution: 6 });
    const entry = saveAccountRewards(saved, { state, events: [] }, 'entry');
    expect(entry.creatures['calamity:infernic']).toEqual({ defeated: false });
    expect(entry.calamityChests).toBeUndefined();
    const before = writes();
    state.phase = 'defeat';
    saveAccountRewards(saved, { state, events: [] }, 'entry');
    expect(writes()).toBe(before);
    const cleared = saveAccountRewards(saved, victory('infernic', 1), 'entry');
    expect(cleared.creatures['calamity:infernic']).toEqual({ defeated: true });
    state.phase = 'player';
    expect(saveAccountRewards(saved, { state, events: [] }, 'replay').creatures['calamity:infernic']).toEqual({ defeated: true });
  });

  it('does not discover a locked or malformed entry, or persist discovery if storage denies the write', () => {
    const { saved, deny } = storage();
    const state = createCalamityBattle('infernic', 1, 17, 'ember', { level: 105, evolution: 6 });
    expect(() => saveAccountRewards(saved, { state, events: [] }, 'locked')).toThrow('locked');
    prepared(saved, 'infernic');
    const raw = saved.getItem(ACCOUNT_KEY);
    state.enemies[0].creatureId = 'adventure:goblin';
    expect(() => saveAccountRewards(saved, { state, events: [] }, 'forged')).toThrow('Invalid Calamity');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    state.enemies[0].creatureId = 'calamity:infernic';
    deny();
    expect(() => saveAccountRewards(saved, { state, events: [] }, 'denied')).toThrow('denied');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
  });

  it.each(calamityActivities)('$id only records normal final victory with saved boss rewards', ({ id }) => {
    const { saved } = storage();
    const stage = isPlayableDungeon(id) ? 35 : infusionStageCount(id);
    const state = isPlayableDungeon(id)
      ? createDungeonBattle(id, stage, 1729, 'ember', { level: 105, evolution: 6 })
      : createInfusionBattle(id, stage, 1729, 'ember', { level: 105, evolution: 6 });
    state.enemies[0].hp = 1;
    state.allies[0].stats.damage = 1e12;
    state.allies[0].stats.crit = 0;
    const result = act(state, 'ember', 'light', state.enemies[0].id);
    expect(result.state.phase).toBe('cleared');
    const account = saveAccountRewards(saved, result, `normal-${id}`);
    expect(account.normalFinalClears?.[id]).toBe(true);
    expect(calamityUnlockedTier(account, id)).toBe(1);
    expect(account.calamityChests).toBeUndefined();
  });

  it('does not turn empty or unfinished normal clears into Calamity access', () => {
    const { saved } = storage();
    const state = createDungeonBattle('infernic', 35, 17, 'ember', { level: 105, evolution: 6 });
    state.enemies[0].hp = 0;
    state.phase = 'cleared';
    expect(saveAccountRewards(saved, { state, events: [] }, 'empty').normalFinalClears).toBeUndefined();
    expect(calamityUnlockedTier(loadAccount(saved), 'infernic')).toBe(0);
  });

  it('does not promote an ambiguous retained reward receipt to normal final evidence', () => {
    const { saved } = storage();
    const state = createDungeonBattle('infernic', 35, 17, 'ember', { level: 105, evolution: 6 });
    state.enemies[0].hp = 0;
    state.phase = 'cleared';
    const account = emptyAccount();
    account.dungeonStages.infernic = 35;
    account.receipts = [`legacy:${state.enemies[0].id}`];
    saveAccount(saved, account);
    const result: BattleResult = { state, events: [{ kind: 'reward', source: state.enemies[0].id,
      target: state.enemies[0].id, amount: 0, critical: false, message: 'Unverifiable historical payload.' }] };
    expect(saveAccountRewards(saved, result, 'legacy').normalFinalClears).toBeUndefined();
  });

  it.each(['materials', 'capture', 'lycalis', 'conduits', 'mechanicalComponents', 'calamiticTokens', 'masterChests', 'recruitment', 'recruitmentOutcome', 'storyBonus'])(
    'rejects forbidden %s payload before receipt deduplication', (key) => {
      const { saved } = storage();
      prepared(saved, 'infernic');
      const result = victory('infernic', 1);
      saveAccountRewards(saved, result, 'run');
      const raw = saved.getItem(ACCOUNT_KEY);
      Object.assign(result.events[0], { [key]: key === 'materials' || key === 'conduits' ? {} : 1 });
      expect(() => saveAccountRewards(saved, result, 'run')).toThrow('Invalid Calamity');
      expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    },
  );

  it.each([
    (result: BattleResult) => { result.events.push({ ...result.events[0] }); },
    (result: BattleResult) => { result.events = []; },
    (result: BattleResult) => { result.events[0].calamityChest = calamityChestId('oceanic', 1); },
    (result: BattleResult) => { result.events[0].source = 'forged'; },
    (result: BattleResult) => { result.events[0].target = 'ember'; },
    (result: BattleResult) => { result.events[0].amount = 1; },
    (result: BattleResult) => { result.state.phase = 'player'; },
    (result: BattleResult) => { result.state.enemies[0].hp = 1; },
    (result: BattleResult) => { result.state.enemies[0].boss = false; },
    (result: BattleResult) => { result.state.enemies[0].id = 'forged'; },
    (result: BattleResult) => { result.state.enemies[0].definitionId = 'goblin'; },
    (result: BattleResult) => { result.state.enemies[0].level = 1; },
    (result: BattleResult) => { result.state.enemies[0].element = 'oceanic'; },
    (result: BattleResult) => { result.state.enemies[0].hp = Number.NaN; },
    (result: BattleResult) => { result.state.wave = 2; },
    (result: BattleResult) => { result.events[0].conduitUpgrades = {}; },
    (result: BattleResult) => { result.state.enemies[0].creatureId = 'adventure:goblin'; },
    (result: BattleResult) => { result.state.dungeon = { element: 'infernic', stage: 35 }; },
    (result: BattleResult) => { result.state.infusion = { mode: 'machines', stage: 100 }; },
    (result: BattleResult) => { result.state.story = { storyStage: 1 }; },
    (result: BattleResult) => { result.state.war = { character: 'nerithe', stage: 10 }; },
    (result: BattleResult) => { delete result.state.calamity; },
  ])('rejects forged encounter/reward variants %# atomically', (forge) => {
    const { saved } = storage();
    prepared(saved, 'infernic');
    const raw = saved.getItem(ACCOUNT_KEY);
    const result = victory('infernic', 1);
    forge(result);
    expect(() => saveAccountRewards(saved, result, 'forged')).toThrow();
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
  });

  it('does not record a chest, clear, or receipt on denied writes or count overflow', () => {
    const denied = storage();
    prepared(denied.saved, 'infernic');
    const raw = denied.saved.getItem(ACCOUNT_KEY);
    denied.deny();
    expect(() => saveAccountRewards(denied.saved, victory('infernic', 1), 'denied')).toThrow('denied');
    expect(denied.saved.getItem(ACCOUNT_KEY)).toBe(raw);
    const { saved } = storage();
    const account = prepared(saved, 'infernic');
    account.calamityChests = { [calamityChestId('infernic', 1)]: Number.MAX_SAFE_INTEGER };
    saveAccount(saved, account);
    const full = saved.getItem(ACCOUNT_KEY);
    expect(() => saveAccountRewards(saved, victory('infernic', 1), 'overflow')).toThrow('capacity');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(full);
  });

  it('rejects unknown, empty, stale and fractional chest openings without writes', () => {
    const { saved, writes } = storage();
    const account = prepared(saved, 'infernic');
    const id = calamityChestId('infernic', 1);
    account.calamityChests = { [id]: 2 };
    saveAccount(saved, account);
    const raw = saved.getItem(ACCOUNT_KEY);
    const before = writes();
    for (const [chest, amount] of [[id, 0], [id, 1], [id, 1.5], ['invalid', 2], [calamityChestId('oceanic', 1), 1]] as const) {
      expect(() => openCalamityChest(saved, chest, amount)).toThrow();
    }
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    expect(writes()).toBe(before);
  });

  it.each(['denied', 'fractalis', 'lycalis', 'materials', 'conduits', 'mechanicalComponents', 'calamiticTokens', 'masterChests'] as const)(
    'failed %s opening preserves chest count and RNG for an identical retry', (failure) => {
      const { saved, deny, allow } = storage();
      const activity = failure === 'materials' ? 'infernic' : 'machines';
      const id = calamityChestId(activity, 3);
      const account = prepared(saved, activity, 3);
      account.calamityChests = { [id]: 1 };
      let seed = 123;
      while (failure === 'conduits' && Object.keys(rollCalamityChest(activity, 3, rng(seed)).conduits).length === 0) seed++;
      account.calamitySeed = seed;
      const expected = rollCalamityChest(activity, 3, rng(seed));
      if (failure === 'fractalis' || failure === 'lycalis') account[failure] = Number.MAX_SAFE_INTEGER;
      if (failure === 'materials') for (const material of Object.keys(expected.materials)) account.materials[material] = Number.MAX_SAFE_INTEGER;
      if (failure === 'conduits') account.conduits = Object.fromEntries(Object.keys(expected.conduits).map((conduit) => [conduit, Number.MAX_SAFE_INTEGER]));
      if (failure === 'mechanicalComponents') account.mechanicalComponents = Number.MAX_SAFE_INTEGER;
      if (failure === 'calamiticTokens') account.calamiticTokens = Number.MAX_SAFE_INTEGER;
      if (failure === 'masterChests') account.masterChests = Number.MAX_SAFE_INTEGER;
      saveAccount(saved, account);
      const raw = saved.getItem(ACCOUNT_KEY);
      if (failure === 'denied') deny();
      expect(() => openCalamityChest(saved, id, 1)).toThrow();
      expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
      allow();
      account.fractalis = 0;
      account.lycalis = 0;
      account.materials = {};
      account.conduits = {};
      account.mechanicalComponents = 0;
      account.calamiticTokens = 0;
      account.masterChests = 0;
      saveAccount(saved, account);
      expect(openCalamityChest(saved, id, 1).reward).toEqual(expected);
    },
  );

  it('persists one dedicated deterministic stream across activities and preserves other fields', () => {
    const { saved } = storage();
    const account = prepared(saved, 'infernic');
    const first = calamityChestId('infernic', 1);
    const second = calamityChestId('oceanic', 2);
    account.calamityChests = { [first]: 1, [second]: 1 };
    account.calamitySeed = 23;
    account.firstFracture = true;
    account.receipts = ['existing'];
    account.storyCompleted = 3;
    account.bannerPity = { standard: { highestStar: 12, unownedHighestStar: 23 } };
    saveAccount(saved, account);
    const random = rng(23);
    const expectedFirst = rollCalamityChest('infernic', 1, random);
    const expectedSecond = rollCalamityChest('oceanic', 2, random);
    expect(openCalamityChest(saved, first, 1).reward).toEqual(expectedFirst);
    const opened = openCalamityChest(saved, second, 1);
    expect(opened.reward).toEqual(expectedSecond);
    expect(opened.account.firstFracture).toBe(true);
    expect(opened.account.storyCompleted).toBe(3);
    expect(opened.account.receipts).toEqual(['existing']);
    expect(opened.account.bannerPity).toEqual(account.bannerPity);
    expect(() => openCalamityChest(saved, second, 1)).toThrow('changed');
  });

  it('allows EX3 to award two independent Master chests even when every Master is owned', () => {
    const { saved } = storage();
    let seed = 1;
    while (seed < 100000 && rollCalamityChest('machines', 3, rng(seed)).masterChests !== 2) seed++;
    expect(seed).toBeLessThan(100000);
    const account = prepared(saved, 'machines', 3);
    const id = calamityChestId('machines', 3);
    account.calamityChests = { [id]: 1 };
    account.calamitySeed = seed;
    account.masterConduits = Object.fromEntries(masterConduits.map((master) => [master.id, 1]));
    saveAccount(saved, account);
    const opened = openCalamityChest(saved, id, 1);
    expect(opened.reward.masterChests).toBe(2);
    expect(opened.account.masterChests).toBe(2);
    expect(opened.account.masterConduits).toEqual(account.masterConduits);
  });

  it('purchases Calamitic Conduits for exactly 100 tokens after any recorded Calamity victory', () => {
    for (const { id } of calamiticConduits) {
      const { saved, writes } = storage();
      const account = emptyAccount();
      account.calamityClears = { infernic: 1 };
      account.calamiticTokens = calamiticTokenPrice;
      saveAccount(saved, account);
      const before = writes();
      const purchased = purchaseConduit(saved, id);
      expect(writes()).toBe(before + 1);
      expect(purchased.calamiticTokens).toBe(0);
      expect(purchased.conduits?.[id]).toBe(1);
    }
  });

  it('keeps Calamitic purchase locked without an EX tier clear even with normal-final access and a chest', () => {
    const { saved, writes } = storage();
    const account = emptyAccount();
    account.normalFinalClears = { infernic: true };
    account.dungeonStages.infernic = 35;
    account.calamityChests = { [calamityChestId('infernic', 1)]: 1 };
    account.calamiticTokens = calamiticTokenPrice;
    saveAccount(saved, account);
    const raw = saved.getItem(ACCOUNT_KEY);
    const before = writes();
    expect(() => purchaseConduit(saved, calamiticConduits[0].id)).toThrow(calamiticLockMessage);
    expect(writes()).toBe(before);
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
  });

  it('rejects insufficient funds, duplicate ownership and failed saves without changing the token balance', () => {
    const { saved } = storage();
    const account = emptyAccount();
    account.calamityClears = { machines: 1 };
    account.calamiticTokens = calamiticTokenPrice - 1;
    saveAccount(saved, account);
    const id = calamiticConduits[0].id;
    const raw = saved.getItem(ACCOUNT_KEY);
    expect(() => purchaseConduit(saved, id)).toThrow('Not enough Calamitic Tokens');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    account.calamiticTokens = calamiticTokenPrice;
    saveAccount(saved, account);
    const owned = loadAccount(saved);
    owned.conduits = { [id]: 1 };
    saveAccount(saved, owned);
    const ownedRaw = saved.getItem(ACCOUNT_KEY);
    expect(() => purchaseConduit(saved, id)).toThrow('already owned');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(ownedRaw);
    const unowned = loadAccount(saved);
    delete unowned.conduits;
    saveAccount(saved, unowned);
    const beforeFailure = saved.getItem(ACCOUNT_KEY);
    const denied = vi.spyOn(saved, 'setItem').mockImplementation(() => { throw new Error('Storage denied.'); });
    expect(() => purchaseConduit(saved, id)).toThrow('Storage denied');
    expect(denied).toHaveBeenCalledTimes(1);
    expect(saved.getItem(ACCOUNT_KEY)).toBe(beforeFailure);
  });
});
