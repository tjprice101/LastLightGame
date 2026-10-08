import { describe, expect, it } from 'vitest';
import { ACCOUNT_KEY, emptyAccount, levelCharacterToMaximum, loadAccount, maxLevelPlan, saveAccount, type Account } from './account';
import { SAVE_KEY, type ProfileStorage } from './profile';
import { capturedProgress, capturedLevelCost } from './character-instances';
import { levelCost } from '../content/progression';
import { maxLevelPreview } from '../presentation/max-level';

function storage() {
  const values = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  let writes = 0;
  let fail = false;
  const saved: ProfileStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { if (fail) throw new Error('Storage unavailable'); values.set(key, value); writes++; },
    removeItem: (key) => { values.delete(key); },
  };
  return { saved, writes: () => writes, fail: () => { fail = true; } };
}
function funded(): Account {
  const account = emptyAccount();
  account.characters.ember = { level: 0, evolution: 1, weaponRank: 3 };
  account.fractalis = 100000;
  account.lycalis = 100;
  account.materials = { 'infernic-common': 1000, 'heavens-level': 1000, 'luminous-common': 1000 };
  account.squad = ['ember'];
  account.receipts = ['keep-this-receipt'];
  return account;
}

describe('Max Level plans and transactions', () => {
  it('previews exact cumulative costs without mutating the account or save', () => {
    const store = storage();
    const account = saveAccount(store.saved, funded());
    const before = structuredClone(account);
    const writes = store.writes();
    const plan = maxLevelPlan(account, 'ember');
    expect(plan).toMatchObject({ currentLevel: 0, targetLevel: 30, cap: 30, cost: { fractalis: 1230, materials: { 'infernic-common': 30 } } });
    expect(account).toEqual(before);
    expect(store.writes()).toBe(writes);
    expect(maxLevelPreview(account, 'ember').html).toContain('Level 0 &rarr; 30 ~ Cap 30');
    expect(maxLevelPreview(account, 'ember').html.match(/<span><small>/g)).toHaveLength(7);
    expect(maxLevelPreview(account, 'ember').html).toContain('stat-change--increase');
  });
  it.each([
    [25, 100, 1, 12, 1], [26, 100, 2, 26, 2],
    [1000, 1, 1, 12, 1], [11, 100, 0, 0, 0], [1000, 0, 0, 0, 0],
  ])('uses exact affordability thresholds with %i Prismatica ~ %i materials', (fractalis, materials, target, currency, quantity) => {
    const account = funded();
    account.fractalis = fractalis;
    account.materials['infernic-common'] = materials;
    const plan = maxLevelPlan(account, 'ember');
    expect(plan.targetLevel).toBe(target);
    expect(plan.cost.fractalis).toBe(currency);
    expect(plan.cost.materials['infernic-common'] ?? 0).toBe(quantity);
  });
  it('stops at specialty material limits for late forms and never evolves', () => {
    const account = funded();
    account.characters.ember = { level: 75, evolution: 5, weaponRank: 3 };
    account.materials['heavens-level'] = 2;
    const plan = maxLevelPlan(account, 'ember');
    expect(plan).toMatchObject({ targetLevel: 77, cost: { fractalis: 326, materials: { 'infernic-common': 6, 'heavens-level': 2 } } });
    account.characters.ember = { level: 104, evolution: 6 };
    expect(maxLevelPlan(account, 'ember').targetLevel).toBe(105);
  });
  it('commits the entire starter upgrade in exactly one write and preserves unrelated data', () => {
    const store = storage();
    const before = saveAccount(store.saved, funded());
    const plan = maxLevelPlan(before, 'ember');
    const writes = store.writes();
    const after = levelCharacterToMaximum(store.saved, plan);
    expect(store.writes()).toBe(writes + 1);
    expect(loadAccount(store.saved)).toEqual(after);
    expect(after.characters.ember).toEqual({ level: 30, evolution: 1, weaponRank: 3 });
    expect(after.fractalis).toBe(before.fractalis - 1230);
    expect(after.materials['infernic-common']).toBe(970);
    for (const key of ['lycalis', 'squad', 'receipts', 'firstFracture'] as const) expect(after[key]).toEqual(before[key]);
  });
  it('levels exact captured IDs to 120 retaining form, locks, gear and kit', () => {
    const store = storage();
    const account = funded();
    const id = 'capture:00000000-0000-4000-8000-000000000001';
    const original = { instanceId: id, creatureId: 'infusion:treasury:5', locked: true };
    account.capturedCharacters = [original, { ...original, instanceId: 'capture:00000000-0000-4000-8000-000000000002' }];
    account.squad = [id];
    account.conduits = { 'vigil-core': 1 };
    account.conduitEquipment = { [id]: ['vigil-core', null, null, null, null, null, null, null] };
    const before = saveAccount(store.saved, account);
    const progress = capturedProgress(original);
    const plan = maxLevelPlan(before, id);
    let expectedCurrency = 0;
    let expectedMaterials = 0;
    for (let level = progress.level; level < 120; level++) {
      const cost = capturedLevelCost({ ...original, level });
      expectedCurrency += cost.fractalis;
      expectedMaterials += cost.materials['luminous-common'];
    }
    expect(plan.targetLevel).toBe(120);
    expect(plan.cost).toEqual({ fractalis: expectedCurrency, materials: { 'luminous-common': expectedMaterials } });
    const writes = store.writes();
    const after = levelCharacterToMaximum(store.saved, plan);
    expect(store.writes()).toBe(writes + 1);
    expect(after.capturedCharacters?.[0]).toMatchObject({ ...original, level: 120, capturedStage: progress.stage, skills: progress.skills });
    expect(after.capturedCharacters?.[1]).toEqual(before.capturedCharacters?.[1]);
    expect(after.conduitEquipment).toEqual(before.conduitEquipment);
    expect(after.squad).toEqual(before.squad);
  });
  it.each(['resources', 'level', 'equipment', 'removed'] as const)('rejects stale %s previews without writes', (change) => {
    const store = storage();
    const account = saveAccount(store.saved, funded());
    const plan = maxLevelPlan(account, 'ember');
    if (change === 'resources') account.fractalis = 12;
    if (change === 'level') account.characters.ember!.level = 1;
    if (change === 'equipment') {
      account.conduits = { 'vigil-core': 1 };
      account.conduitEquipment = { ember: ['vigil-core', null, null, null, null, null, null, null] };
    }
    if (change === 'removed') plan.id = 'tide';
    saveAccount(store.saved, account);
    const raw = store.saved.getItem(ACCOUNT_KEY);
    const writes = store.writes();
    expect(() => levelCharacterToMaximum(store.saved, plan)).toThrow();
    expect(store.writes()).toBe(writes);
    expect(store.saved.getItem(ACCOUNT_KEY)).toBe(raw);
  });
  it('rejects capped, unaffordable and unowned requests', () => {
    const store = storage();
    const account = funded();
    account.characters.ember!.level = 30;
    saveAccount(store.saved, account);
    const plan = maxLevelPlan(account, 'ember');
    expect(plan.targetLevel).toBe(30);
    expect(() => levelCharacterToMaximum(store.saved, plan)).toThrow('No additional levels');
    expect(() => maxLevelPlan(account, 'tide')).toThrow('owned');
    account.characters.ember!.level = 0;
    account.fractalis = 0;
    const preview = maxLevelPreview(account, 'ember').html;
    expect(preview).toContain('disabled>Confirm leveling');
    expect(preview.match(/stat-change--unchanged/g)).toHaveLength(7);
    expect(preview).not.toContain('stat-change--increase');
  });
  it('does not persist partial spending when the save fails', () => {
    const store = storage();
    const account = saveAccount(store.saved, funded());
    const raw = store.saved.getItem(ACCOUNT_KEY);
    store.fail();
    expect(() => levelCharacterToMaximum(store.saved, maxLevelPlan(account, 'ember'))).toThrow('Storage unavailable');
    expect(store.saved.getItem(ACCOUNT_KEY)).toBe(raw);
  });
  it('matches repeated ordinary per-level costs at an intermediate form', () => {
    const account = funded();
    account.characters.ember = { level: 30, evolution: 2 };
    const plan = maxLevelPlan(account, 'ember');
    const currency = Array.from({ length: 15 }, (_, index) => levelCost('infernic', { level: 30 + index, evolution: 2 }).fractalis).reduce((sum, value) => sum + value, 0);
    expect(plan).toMatchObject({ targetLevel: 45, cost: { fractalis: currency, materials: { 'infernic-common': 30 } } });
  });
});
