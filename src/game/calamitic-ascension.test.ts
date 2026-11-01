import { describe, expect, it } from 'vitest';
import { characterName } from '../content/character-art';
import { characterLevelCap, characterLevelCost, type CharacterProgress } from '../content/progression';
import { resolveFighter } from '../content/combat';
import { createCalamityBattle, createBattle, type BattleResult } from './battle';
import { conduitActionCost, prepareConduitAction } from './conduit-runtime';
import { ACCOUNT_KEY, ascendCharacter, canAscendCharacter, emptyAccount, loadAccount, rollCalamityShards, saveAccount, saveAccountRewards, type Account } from './account';
import { SAVE_KEY, type ProfileStorage } from './profile';
import { calamityChestId } from '../content/calamity';
import { validCalamityRewardEvent } from '../online/server-game';
import { validateAccount } from './account';
import { validateRequest } from '../../supabase/functions/game-operation/engine';

function storage(): ProfileStorage {
  const values = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); }, removeItem: key => { values.delete(key); } };
}
function accountWith(id: 'ember' | 'kaelith', progress: CharacterProgress): { saved: ProfileStorage; account: Account } {
  const saved = storage();
  const account = emptyAccount();
  account.materials['shard-of-calamity'] = 100;
  account.characters[id] = progress;
  saveAccount(saved, account);
  return { saved, account: loadAccount(saved) };
}
function victory(tier: 1 | 2 | 3): BattleResult {
  const state = createCalamityBattle('heavens', tier, 1729, 'ember', { level: 0, evolution: 1 });
  const boss = state.enemies[0];
  state.phase = 'cleared';
  boss.hp = 0;
  return { state, events: [{ kind: 'reward', source: boss.id, target: boss.id, amount: 0, critical: false,
    calamityChest: calamityChestId('heavens', tier), message: 'Calamity chest saved.' }] };
}

describe('D-435 Calamitic Ascension', () => {
  it('requires an owned final-form Element-Bearer at its unascended cap, and not an Elemental-Devourer', () => {
    expect(canAscendCharacter('ember', { level: 104, evolution: 6 }, 'stats')).toBe(false);
    expect(canAscendCharacter('ember', { level: 105, evolution: 6 }, 'stats')).toBe(true);
    expect(canAscendCharacter('kaelith', { level: 109, evolution: 6 }, 'stats')).toBe(false);
    expect(canAscendCharacter('kaelith', { level: 110, evolution: 6 }, 'stats')).toBe(true);
    expect(canAscendCharacter('ember', { level: 105, evolution: 6, ascension: { stats: true } }, 'stats')).toBe(false);
    expect(canAscendCharacter('ember', { level: 105, evolution: 6 }, 'skill1')).toBe(false);
  });

  it('spends 25 Shards atomically, unlocks the extended cap without skipping levels, and enforces step ordering', () => {
    const { saved, account } = accountWith('ember', { level: 105, evolution: 6 });
    expect(() => ascendCharacter(saved, 'ember', 'skill1', account.characters.ember!)).toThrow('Stat Ascension');
    expect(loadAccount(saved)).toEqual(account);
    let writes = 0;
    const setItem = saved.setItem;
    saved.setItem = (key, value) => { writes++; setItem(key, value); };
    const ascended = ascendCharacter(saved, 'ember', 'stats', account.characters.ember!);
    expect(writes).toBe(1);
    expect(ascended.characters.ember).toEqual({ level: 105, evolution: 6, ascension: { stats: true } });
    expect(ascended.materials['shard-of-calamity']).toBe(75);
    expect(characterLevelCap(6, 'ember', true)).toBe(115);
    expect(characterLevelCost('ember', { ...ascended.characters.ember!, level: 105 }).materials['infernic-common']).toBeGreaterThan(0);
    for (const step of ['skill1', 'skill2', 'lastFlare'] as const) {
      const current = ascended.characters.ember!;
      expect(canAscendCharacter('ember', current, step)).toBe(true);
      ascendCharacter(saved, 'ember', step, current);
      ascended.characters.ember = { ...current, ascension: { ...current.ascension, [step]: true } };
      expect(loadAccount(saved).characters.ember).toEqual(ascended.characters.ember);
    }
    expect(loadAccount(saved).materials['shard-of-calamity']).toBe(0);
    expect(() => ascendCharacter(saved, 'ember', 'skill2', ascended.characters.ember!)).toThrow('already complete');
  });

  it('uses Calamity-chain and Fragment costs for the added Calamitic levels', () => {
    const progress: CharacterProgress = { level: 110, evolution: 6, ascension: { stats: true } };
    expect(characterLevelCap(6, 'kaelith', true)).toBe(115);
    const cost = characterLevelCost('kaelith', progress);
    expect(cost.materials['calamity-common']).toBe(8);
    expect(cost.materials['fragment-of-rise']).toBe(2);
    expect(cost.materials['infernic-common']).toBeUndefined();
    expect(characterLevelCost('kaelith', { ...progress, level: 114 }).materials['fragment-of-rise']).toBe(2);
  });

  it('multiplies resolved stats by 50% and applies skill power/efficiency only to the imbued action, respecting the efficiency cap', () => {
    const baseProgress = { level: 105, evolution: 6 };
    const ascendedProgress = { ...baseProgress, ascension: { stats: true, skill1: true } };
    const before = resolveFighter('ember', baseProgress).stats;
    const after = resolveFighter('ember', ascendedProgress).stats;
    for (const key of Object.keys(before) as (keyof typeof before)[]) expect(after[key]).toBeCloseTo(before[key] * 1.5);
    const unimbued = createBattle(1729, ['ember'], { ember: { ...baseProgress, ascension: { stats: true } } });
    const imbued = createBattle(1729, ['ember'], { ember: ascendedProgress });
    const plainPower = prepareConduitAction(unimbued, unimbued.allies[0], 'skill1', 0, false).skillPower;
    const imbuedPower = prepareConduitAction(imbued, imbued.allies[0], 'skill1', 0, false).skillPower;
    const unchangedPower = prepareConduitAction(imbued, imbued.allies[0], 'skill2', 0, false).skillPower;
    expect(imbuedPower - plainPower).toBeCloseTo(.5);
    expect(unchangedPower).toBeCloseTo(prepareConduitAction(unimbued, unimbued.allies[0], 'skill2', 0, false).skillPower);
    const actor = imbued.allies[0];
    actor.stats.skillEfficiency = .48;
    const cappedCost = conduitActionCost(actor, 'skill1', imbued, 25);
    actor.stats.skillEfficiency = .5;
    expect(conduitActionCost(actor, 'skill1', imbued, 25)).toBe(cappedCost);
    expect(cappedCost).toBeLessThan(conduitActionCost(actor, 'skill2', imbued, 40));
  });

  it('rolls Shards at the three declared rates on an independent reproducible stream', () => {
    const chances = [0, .05, .08, .12] as const;
    for (const tier of [1, 2, 3] as const) {
      let seed = 1776, successes = 0;
      const quantities = new Set<number>();
      const trials = 20_000;
      for (let index = 0; index < trials; index++) {
        const result = rollCalamityShards(tier, seed);
        seed = result.seed;
        if (result.amount) { successes++; quantities.add(result.amount); }
      }
      expect(successes / trials).toBeCloseTo(chances[tier], 2);
      expect([...quantities].sort()).toEqual([2, 3, 4]);
    }
    expect(rollCalamityShards(3, 12345)).toEqual(rollCalamityShards(3, 12345));
  });

  it('saves the Shard grant with the chest and receipt, preserves the recruitment stream, and annotates only after persistence', () => {
    const saved = storage();
    const account = emptyAccount();
    account.normalFinalClears = { heavens: true };
    account.characters.ozriel = { level: 0, evolution: 1 };
    account.calamityShardSeed = 12345;
    account.calamityRecruitmentSeed = 98765;
    const initial = rollCalamityShards(1, account.calamityShardSeed);
    let seed = 1;
    while (!rollCalamityShards(1, seed).amount) seed++;
    account.calamityShardSeed = seed;
    saveAccount(saved, account);
    const event = victory(1).events[0];
    const result = victory(1);
    result.events[0] = event;
    const committed = saveAccountRewards(saved, result, '00000000-0000-4000-8000-000000000001');
    expect(result.events[0].calamityShards).toBeGreaterThanOrEqual(2);
    expect(result.events[0].calamityShards).toBeLessThanOrEqual(4);
    expect(committed.materials['shard-of-calamity']).toBe(result.events[0].calamityShards);
    expect(committed.calamityRecruitmentSeed).toBe(98765);
    expect(committed.calamityShardSeed).toBe(rollCalamityShards(1, seed).seed);
    expect(committed.calamityChests?.[calamityChestId('heavens', 1)]).toBe(1);
    expect(committed.receipts).toHaveLength(1);
    expect(initial.seed).toBe(rollCalamityShards(1, 12345).seed);
  });

  it('leaves the save and presentation event untouched when the atomic victory write fails', () => {
    const saved = storage();
    const account = emptyAccount();
    account.normalFinalClears = { heavens: true };
    account.characters.ozriel = { level: 0, evolution: 1 };
    let seed = 1;
    while (!rollCalamityShards(1, seed).amount) seed++;
    account.calamityShardSeed = seed;
    saveAccount(saved, account);
    const before = saved.getItem(ACCOUNT_KEY);
    const result = victory(1);
    const setItem = saved.setItem;
    saved.setItem = () => { throw new Error('Storage denied'); };
    expect(() => saveAccountRewards(saved, result, '00000000-0000-4000-8000-000000000002')).toThrow('Storage denied');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
    expect(result.events[0].calamityShards).toBeUndefined();
    saved.setItem = setItem;
  });

  it('validates server ascension operations strictly and adds the Rise-blessed name suffix', () => {
    const base = { requestId: '00000000-0000-4000-8000-000000000003', expectedRevision: 0,
      operation: { kind: 'ascendCharacter', id: 'ember', step: 'skill1', expected: { level: 105, evolution: 6, ascension: { stats: true } } } };
    expect(validateRequest(base).operation.kind).toBe('ascendCharacter');
    expect(() => validateRequest({ ...base, operation: { ...base.operation, step: 'ultimate' } })).toThrow();
    expect(() => validateRequest({ ...base, operation: { ...base.operation, expected: { ...base.operation.expected, ascension: { stats: true, extra: true } } } })).toThrow();
    expect(characterName('ember', 6, true)).toBe('Eternal Heavenflame Sovereign, Infernis, Rise-blessed');
    expect(characterName('ember', 6)).toBe('Eternal Heavenflame Sovereign, Infernis');
    expect(validateAccount({ ...emptyAccount(), characters: { ember: { level: 105, evolution: 6, ascension: { stats: true } } } })).toBeDefined();
    expect(() => validateAccount({ ...emptyAccount(), characters: { ember: { level: 105, evolution: 6, ascension: { stats: true, extra: true } } } })).toThrow('Ascension');
    const reward = { kind: 'reward', source: 'calamity-heavens', target: 'calamity-heavens', amount: 0,
      message: 'Saved', calamityChest: calamityChestId('heavens', 1), calamityShards: 3 };
    expect(validCalamityRewardEvent(reward)).toBe(true);
    expect(validCalamityRewardEvent({ ...reward, calamityShards: 5 })).toBe(false);
  });
});
