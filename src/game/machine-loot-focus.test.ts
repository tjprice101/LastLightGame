import { describe, expect, it, vi } from 'vitest';
import { conduits, getConduit, type ConduitId } from '../content/conduits';
import { machineConduitDrops, machineConduitLoot, machineFocusRarities, machineRules, validateMachineLootFocus, type MachineLootFocus } from '../content/machines';
import { act, createInfusionBattle, nextStage } from './battle';
import { ACCOUNT_KEY, emptyAccount, loadAccount, saveAccount, saveAccountRewards, setMachineLootFocus, summonCharacter, validateAccount } from './account';
import { SAVE_KEY, type ProfileStorage } from './profile';
import { freshGame, resolveOperation, validateRequest } from '../../supabase/functions/game-operation/engine';
import type { GameOperation } from '../online/server-game';

const focus: MachineLootFocus = Object.fromEntries(machineFocusRarities.map(rarity =>
  [rarity, conduits.filter(entry => entry.rarity === rarity).at(-1)!.id]));
function storage(): ProfileStorage {
  const values = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); },
    removeItem: key => { values.delete(key); } };
}
function sequence(values: number[]) {
  let index = 0;
  return vi.fn(() => {
    if (index === values.length) throw new Error('RNG exhausted.');
    return values[index++];
  });
}
function kill(seed = 1, stage = machineRules.omnicStage + 4) {
  const state = createInfusionBattle('machines', stage, 1729, 'ember', { level: 105, evolution: 6 });
  state.enemies.forEach(enemy => { enemy.hp = 1; enemy.stats.defense = 0; });
  state.allies[0].shatter = 100;
  state.conduitSeed = seed;
  state.machineLootFocus = { ...focus };
  return act(state, 'ember', 'light', state.enemies[0].id);
}
const entropy = { seed: () => 1729, random: () => .5, uuid: () => crypto.randomUUID() };

describe('saved one-shot Machines Focus Loot', () => {
  it.each(machineFocusRarities)('focuses every unowned %s name without changing rates or RNG draws', rarity => {
    for (const conduit of conduits.filter(entry => entry.rarity === rarity)) {
      const selected = { [rarity]: conduit.id };
      const focusedRng = sequence([0, .37, 0, .37, 0, .37]);
      const generalRng = sequence([0, .37, 0, .37, 0, .37]);
      const drops = machineConduitDrops(machineRules.omnicStage, focusedRng, {}, selected);
      const general = machineConduitDrops(machineRules.omnicStage, generalRng);
      expect(drops[conduit.id]).toBe(1);
      expect(Object.keys(drops)).toHaveLength(3);
      expect(focusedRng.mock.calls.length).toBe(generalRng.mock.calls.length);
      for (const id of Object.keys(general) as ConduitId[]) {
        if (getConduit(id).rarity !== rarity) expect(drops[id]).toBe(1);
      }
      const table = machineConduitLoot(machineRules.omnicStage, {}, selected).filter(drop => getConduit(drop.id).rarity === rarity);
      const chance = rarity === 'Rare' ? .08 : rarity === 'Legendary' ? .035 : .01;
      expect(table.reduce((sum, drop) => sum + drop.chance, 0)).toBe(chance);
      expect(table.filter(drop => drop.chance > 0).map(drop => drop.id)).toEqual([conduit.id]);
    }
  });
  it('retains exact rarity boundaries and Omnic gate with all three focuses', () => {
    expect(machineConduitDrops(machineRules.omnicStage, sequence([.08, .035, .01]), {}, focus)).toEqual({});
    expect(machineConduitDrops(machineRules.omnicStage, sequence([.079999, .9, .034999, .9, .009999, .9]), {}, focus))
      .toEqual(Object.fromEntries(Object.values(focus).map(id => [id, 1])));
    expect(machineConduitDrops(machineRules.omnicStage - 1, sequence([0, .9, 0, .9]), {}, focus))
      .toEqual({ [focus.Rare!]: 1, [focus.Legendary!]: 1 });
    expect(machineConduitLoot(machineRules.omnicStage - 1, {}, focus).some(drop => drop.id === focus.Omnic)).toBe(false);
  });
  it('falls back to the ordinary unowned pool when a focus is already obtained, without duplicates or RNG drift', () => {
    const owned = Object.fromEntries(Object.values(focus).map(id => [id, 1]));
    const rng = sequence([0, .5, 0, .5, 0, .5]);
    const drops = machineConduitDrops(machineRules.omnicStage, rng, owned, focus);
    expect(drops).toEqual(machineConduitDrops(machineRules.omnicStage, sequence([0, .5, 0, .5, 0, .5]), owned));
    expect(Object.keys(drops).every(id => !(id in owned))).toBe(true);
    expect(rng).toHaveBeenCalledTimes(6);
  });
  it('persists simultaneous selections/replacements and clears only the chosen tier, with no load writes', () => {
    const saved = storage();
    const writes = vi.spyOn(saved, 'setItem');
    expect(loadAccount(saved).machineLootFocus).toBeUndefined();
    expect(writes).not.toHaveBeenCalled();
    for (const rarity of machineFocusRarities) setMachineLootFocus(saved, rarity, focus[rarity]!);
    expect(loadAccount(saved).machineLootFocus).toEqual(focus);
    const replacement = conduits.find(entry => entry.rarity === 'Rare')!.id;
    expect(setMachineLootFocus(saved, 'Rare', replacement).machineLootFocus?.Rare).toBe(replacement);
    const result = setMachineLootFocus(saved, 'Rare', null);
    expect(result.machineLootFocus).toEqual({ Legendary: focus.Legendary, Omnic: focus.Omnic });
    const count = writes.mock.calls.length;
    expect(loadAccount(saved)).toEqual(result);
    expect(writes).toHaveBeenCalledTimes(count);
  });
  it.each([null, [], 'Rare', { Common: 'worn-gear' }, { Master: 'ember-master' },
    { Rare: focus.Omnic }, { Rare: 'not-a-conduit' }, { Rare: undefined },
    { Calamitic: conduits.find(entry => entry.rarity === 'Calamitic')!.id }])('rejects malformed focus %j', value => {
    expect(() => validateMachineLootFocus(value)).toThrow();
    expect(() => validateAccount({ ...emptyAccount(), machineLootFocus: value })).toThrow();
  });
  it('rejects owned names and denied focus saves without changing raw storage', () => {
    const saved = storage();
    saveAccount(saved, { ...emptyAccount(), conduits: { [focus.Rare!]: 1 } });
    const raw = saved.getItem(ACCOUNT_KEY);
    expect(() => setMachineLootFocus(saved, 'Rare', focus.Rare!)).toThrow('unowned');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    vi.spyOn(saved, 'setItem').mockImplementation(() => { throw new Error('Storage denied'); });
    expect(() => setMachineLootFocus(saved, 'Omnic', focus.Omnic!)).toThrow('denied');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
  });
  it('clears acquired names at the common atomic save boundary without mutating callers', () => {
    const saved = storage();
    const account = { ...emptyAccount(), machineLootFocus: focus, conduits: { [focus.Rare!]: 1, [focus.Omnic!]: 1 } };
    const before = structuredClone(account);
    expect(saveAccount(saved, account).machineLootFocus).toEqual({ Legendary: focus.Legendary });
    expect(account).toEqual(before);
    expect(loadAccount(saved).machineLootFocus).toEqual({ Legendary: focus.Legendary });
  });
  it('clears a focused banner bonus but never redirects the banner bonus roll', () => {
    const saved = storage();
    saveAccount(saved, { ...emptyAccount(), lycalis: 10, characters: { ember: { level: 0, evolution: 1 } },
      machineLootFocus: { ...focus, Legendary: 'worldbreaker-drive' } });
    const result = summonCharacter(saved, () => 0);
    expect(result.bonusConduit).toBe('worldbreaker-drive');
    expect(result.account.machineLootFocus).toEqual({ Rare: focus.Rare, Omnic: focus.Omnic });
  });
  it('applies focus in real combat, preserves independent RNG, consumes only obtained tiers and carries remaining focuses through Continue', () => {
    const result = kill();
    const awarded = result.events.filter(event => event.kind === 'reward').flatMap(event => Object.keys(event.conduits ?? {}));
    expect(awarded).toContain(focus.Rare);
    for (const rarity of machineFocusRarities) expect(result.state.machineLootFocus?.[rarity]).toBe(awarded.includes(focus[rarity]!) ? undefined : focus[rarity]);
    const generalState = createInfusionBattle('machines', machineRules.omnicStage + 4, 1729, 'ember', { level: 105, evolution: 6 });
    generalState.enemies.forEach(enemy => { enemy.hp = 1; enemy.stats.defense = 0; });
    generalState.allies[0].shatter = 100; generalState.conduitSeed = 1;
    const general = act(generalState, 'ember', 'light', generalState.enemies[0].id);
    for (const field of ['seed', 'rewardSeed', 'conduitSeed', 'componentSeed', 'captureSeed', 'lycalisSeed', 'masterChestSeed'] as const)
      expect(result.state[field]).toBe(general.state[field]);
    const continued = nextStage(result.state, { level: 105, evolution: 6 }).state;
    expect(continued.machineLootFocus).toEqual(result.state.machineLootFocus);
    expect(continued.machineLootFocus).not.toBe(result.state.machineLootFocus);
  });
  it('consumes a focus only once during multi-enemy kills, then returns to the unowned pool', () => {
    const state = createInfusionBattle('machines', machineRules.omnicStage + 1, 1729, 'ember', { level: 105, evolution: 6 });
    state.enemies.forEach(enemy => { enemy.hp = 1; enemy.stats.defense = 0; });
    state.allies[0].shatter = 100; state.conduitSeed = 8; state.machineLootFocus = { ...focus };
    const result = act(state, 'ember', 'skill2', state.enemies[0].id);
    const rewards = result.events.filter(event => event.kind === 'reward');
    expect(rewards).toHaveLength(state.enemies.length);
    expect(rewards[0].conduits?.[focus.Rare!]).toBe(1);
    expect(rewards.slice(1).every(reward => !(focus.Rare! in (reward.conduits ?? {})))).toBe(true);
    expect(state.machineLootFocus).toEqual(focus);
    const saved = storage();
    saveAccount(saved, { ...emptyAccount(), machineLootFocus: focus });
    const account = saveAccountRewards(saved, result, 'multi');
    expect(account.conduits?.[focus.Rare!]).toBe(1);
    expect(account.machineLootFocus?.Rare).toBeUndefined();
  });
  it('enforces focused reward identity, retries denied persistence safely and deduplicates receipts', () => {
    const result = kill(), saved = storage();
    saveAccount(saved, { ...emptyAccount(), machineLootFocus: focus });
    const raw = saved.getItem(ACCOUNT_KEY);
    const bad = structuredClone(result);
    const reward = bad.events.find(event => event.kind === 'reward')!;
    reward.conduits = { [conduits.find(entry => entry.rarity === 'Rare' && entry.id !== focus.Rare)!.id]: 1 };
    expect(() => saveAccountRewards(saved, bad, 'focus')).toThrow('eligible');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    const writes = vi.spyOn(saved, 'setItem').mockImplementationOnce(() => { throw new Error('Storage denied'); });
    expect(() => saveAccountRewards(saved, result, 'focus')).toThrow('denied');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    const account = saveAccountRewards(saved, result, 'focus');
    expect(account.machineLootFocus?.Rare).toBeUndefined();
    const count = writes.mock.calls.length;
    expect(saveAccountRewards(saved, result, 'focus')).toEqual(account);
    expect(writes).toHaveBeenCalledTimes(count);
  });
});

describe('authoritative Machines focus', () => {
  it.each([
    { kind: 'setMachineLootFocus', rarity: 'Common', id: focus.Rare },
    { kind: 'setMachineLootFocus', rarity: 'Rare', id: focus.Omnic },
    { kind: 'setMachineLootFocus', rarity: 'Rare' },
    { kind: 'setMachineLootFocus', rarity: 'Rare', id: null, extra: true },
    { kind: 'setMachineLootFocus', rarity: 'Master', id: null },
  ])('rejects malformed operation %j', operation => {
    expect(() => validateRequest({ requestId: crypto.randomUUID(), expectedRevision: 0, operation })).toThrow();
  });
  it('sets/clears all tiers through strict requests and persists authoritative drop parity', () => {
    let game = resolveOperation(freshGame('focus'), { kind: 'bootstrap', starterId: 'ember' }, entropy).game;
    game.account.infusionStages.machines = machineRules.omnicStage + 4;
    game.account.characters.ember = { level: 105, evolution: 6 };
    game.account.storyCompleted = 108;
    for (const rarity of machineFocusRarities) {
      const operation: GameOperation = { kind: 'setMachineLootFocus', rarity, id: focus[rarity]! };
      validateRequest({ requestId: crypto.randomUUID(), expectedRevision: 0, operation });
      game = resolveOperation(game, operation, entropy).game;
    }
    const clear = { kind: 'setMachineLootFocus', rarity: 'Omnic', id: null } as const;
    validateRequest({ requestId: crypto.randomUUID(), expectedRevision: 0, operation: clear });
    game = resolveOperation(game, clear, entropy).game;
    game = resolveOperation(game, { kind: 'enter', activity: { kind: 'infusion', mode: 'machines', stage: machineRules.omnicStage + 4 } }, entropy).game;
    const state = game.run!.session.state;
    expect(state.machineLootFocus).toEqual({ Rare: focus.Rare, Legendary: focus.Legendary });
    state.enemies.forEach(enemy => { enemy.hp = 1; enemy.stats.defense = 0; });
    state.conduitSeed = 1;
    const before = structuredClone(game);
    const result = resolveOperation(game, { kind: 'act', runId: game.run!.session.runId, actorId: 'ember', action: 'light', targetId: state.enemies[0].id }, entropy);
    expect(result.response.result?.events.find(event => event.kind === 'reward')?.conduits?.[focus.Rare!]).toBe(1);
    expect(result.game.account.machineLootFocus?.Rare).toBeUndefined();
    expect(result.game.account.conduits?.[focus.Rare!]).toBe(1);
    expect(game).toEqual(before);
    expect(resolveOperation(result.game, { kind: 'read' }, entropy).response.account).toEqual(result.response.account);
  });
});
