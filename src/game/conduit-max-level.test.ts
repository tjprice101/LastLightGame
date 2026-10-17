import { describe, expect, it, vi } from 'vitest';
import { conduits, conduitUpgradeCost } from '../content/conduits';
import { ACCOUNT_KEY, conduitMaxLevelPlan, emptyAccount, loadAccount, saveAccount, upgradeConduitToMaximum, type ConduitMaxLevelPlan } from './account';
import { SAVE_KEY, type ProfileStorage } from './profile';
import { freshGame, resolveOperation, validateRequest } from '../../supabase/functions/game-operation/engine';

function fixture() {
  const items = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  const storage: ProfileStorage = { getItem: key => items.get(key) ?? null,
    setItem: (key, value) => { items.set(key, value); }, removeItem: key => { items.delete(key); } };
  saveAccount(storage, { ...emptyAccount(), characters: { ember: { level: 0, evolution: 1 } },
    conduits: { 'vigil-core': 2, 'siegebound-drive': 1 }, conduitUpgrades: { 'siegebound-drive': 2 },
    mechanicalComponents: 829, fractalis: 400, lycalis: 10, materials: { 'infernic-common': 2 },
    conduitEquipment: { ember: ['vigil-core', null, null, null, null, null, null, null] } });
  return storage;
}

describe('Conduit Max Level plans and transactions', () => {
  it('uses each rarity cost and every exact affordability boundary for all 90 ordinary names', () => {
    for (const conduit of conduits) for (let currentLevel = 0; currentLevel <= 5; currentLevel++) {
      const account = { ...emptyAccount(), conduits: { [conduit.id]: 1 },
        conduitUpgrades: { [conduit.id]: currentLevel }, mechanicalComponents: 0 };
      let cost = 0;
      for (let targetLevel = currentLevel; targetLevel <= 5; targetLevel++) {
        if (targetLevel > currentLevel) cost += conduitUpgradeCost(conduit, targetLevel - 1)!;
        account.mechanicalComponents = cost;
        const before = structuredClone(account);
        expect(conduitMaxLevelPlan(account, conduit.id)).toEqual({ id: conduit.id, currentLevel, targetLevel, cost });
        expect(account).toEqual(before);
        if (targetLevel > currentLevel) {
          account.mechanicalComponents = cost - 1;
          expect(conduitMaxLevelPlan(account, conduit.id)).toEqual({ id: conduit.id, currentLevel,
            targetLevel: targetLevel - 1, cost: cost - conduitUpgradeCost(conduit, targetLevel - 1)! });
        }
      }
    }
  });
  it('spends the exact total in one save, preserves other names, equipment and all non-component holdings', () => {
    const saved = fixture();
    const before = loadAccount(saved);
    const plan = conduitMaxLevelPlan(before, 'vigil-core');
    expect(plan).toEqual({ id: 'vigil-core', currentLevel: 0, targetLevel: 5, cost: 600 });
    const write = vi.spyOn(saved, 'setItem');
    const after = upgradeConduitToMaximum(saved, plan);
    expect(write).toHaveBeenCalledTimes(1);
    expect(after).toEqual({ ...before, mechanicalComponents: 229,
      conduitUpgrades: { ...before.conduitUpgrades, 'vigil-core': 5 } });
    expect(loadAccount(saved)).toEqual(after);
    expect(() => upgradeConduitToMaximum(saved, plan)).toThrow('changed');
    expect(write).toHaveBeenCalledTimes(1);
  });
  it('upgrades only as far as affordable and handles a previously upgraded name', () => {
    const saved = fixture();
    saveAccount(saved, { ...loadAccount(saved), mechanicalComponents: 174 });
    const partial = conduitMaxLevelPlan(loadAccount(saved), 'vigil-core');
    expect(partial).toMatchObject({ currentLevel: 0, targetLevel: 2, cost: 75 });
    expect(upgradeConduitToMaximum(saved, partial).mechanicalComponents).toBe(99);
    saveAccount(saved, { ...loadAccount(saved), mechanicalComponents: 600 });
    const resumed = conduitMaxLevelPlan(loadAccount(saved), 'siegebound-drive');
    expect(resumed).toMatchObject({ currentLevel: 2, targetLevel: 5, cost: 525 });
    expect(upgradeConduitToMaximum(saved, resumed).conduitUpgrades?.['siegebound-drive']).toBe(5);
  });
  it('rejects missing profile, unowned IDs, insufficient funds, stale/forged previews and failed saves without spending', () => {
    const saved = fixture();
    const plan = conduitMaxLevelPlan(loadAccount(saved), 'vigil-core');
    const raw = saved.getItem(ACCOUNT_KEY);
    const write = vi.spyOn(saved, 'setItem');
    for (const changed of [{ cost: 1 }, { targetLevel: 6 }, { currentLevel: 1 }]) {
      expect(() => upgradeConduitToMaximum(saved, { ...plan, ...changed })).toThrow('changed');
    }
    expect(() => upgradeConduitToMaximum(saved, { ...plan, id: 'bastion-lock' })).toThrow('owned');
    expect(() => conduitMaxLevelPlan(loadAccount(saved), 'missing' as never)).toThrow('Unknown');
    expect(write).not.toHaveBeenCalled();
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    write.mockImplementationOnce(() => { throw new Error('Write denied'); });
    expect(() => upgradeConduitToMaximum(saved, plan)).toThrow('Write denied');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    saved.removeItem(SAVE_KEY);
    expect(() => upgradeConduitToMaximum(saved, plan)).toThrow('Choose your first');
    saved.setItem(SAVE_KEY, '{"version":1,"starterId":"ember"}');
    for (const account of [{ ...loadAccount(saved), mechanicalComponents: 24 },
      { ...loadAccount(saved), mechanicalComponents: 0, conduitUpgrades: { 'vigil-core': 5 } }]) {
      saveAccount(saved, account);
      const noOp = conduitMaxLevelPlan(loadAccount(saved), 'vigil-core');
      expect(noOp.targetLevel).toBe(noOp.currentLevel);
      const before = saved.getItem(ACCOUNT_KEY);
      write.mockClear();
      expect(() => upgradeConduitToMaximum(saved, noOp)).toThrow('No additional');
      expect(write).not.toHaveBeenCalled();
      expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
    }
  });
  it('revalidates authoritative previews, rejects malformed requests and keeps active combat upgrade snapshots frozen', () => {
    const entropy = { seed: () => 1, random: () => .9, uuid: () => crypto.randomUUID() };
    let game = resolveOperation(freshGame('tester'), { kind: 'bootstrap', starterId: 'ember' }, entropy).game;
    game.account = loadAccount(fixture());
    game = resolveOperation(game, { kind: 'enter', activity: { kind: 'training' } }, entropy).game;
    const before = structuredClone(game);
    const expected = conduitMaxLevelPlan(game.account, 'vigil-core');
    const operation = { kind: 'maxConduit' as const, expected };
    const request = { requestId: crypto.randomUUID(), expectedRevision: 0, operation };
    expect(validateRequest(request).operation).toEqual(operation);
    const after = resolveOperation(game, operation, entropy).game;
    expect(after.account.mechanicalComponents).toBe(229);
    expect(after.account.conduitUpgrades?.['vigil-core']).toBe(5);
    expect(after.run).toEqual(before.run);
    expect(game).toEqual(before);
    expect(() => resolveOperation(after, operation, entropy)).toThrow('changed');
    const poor = structuredClone(game);
    poor.account.mechanicalComponents = 25;
    expect(() => resolveOperation(poor, operation, entropy)).toThrow('changed');
    for (const invalid of [undefined, {}, { ...expected, id: 1 }, { ...expected, cost: -1 },
      { ...expected, targetLevel: 1.5 }, { ...expected, extra: true }]) {
      expect(() => validateRequest({ ...request, operation: { kind: 'maxConduit', expected: invalid } })).toThrow();
    }
    const forged: ConduitMaxLevelPlan = { ...expected, cost: 1 };
    expect(() => resolveOperation(game, { kind: 'maxConduit', expected: forged }, entropy)).toThrow('changed');
  });
});
