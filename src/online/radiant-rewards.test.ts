import { describe, expect, it } from 'vitest';
import { ACCOUNT_KEY, emptyAccount, saveAccountRewards, type Account } from '../game/account';
import { awardDefeats, type BattleEvent } from '../game/battle';
import { createRadiantCombat, depleteRadiantCurrency } from '../game/radiant-combat';
import { adaptRadiantPressureEncounter, createRadiantAuthoredEncounter, radiantPressureAnchors,
  type RadiantPressureAnchor } from '../game/radiant-pressure-encounters';
import { authoredRadiantCalibration } from '../content/radiant-enemy-calibration';
import { calamityActivities } from '../content/calamity';
import { storyRules, storyBossBonus, storyClearReward } from '../content/story';
import { dungeonStageCount, infusionStageCount, warStageCount } from '../content/activities';
import { elementalWars } from '../content/elemental-war';
import { gatesOfOblivionRules } from '../content/gates-of-oblivion';
import { initialRadiantRewards, resolveRadiantRewards, validateRadiantRewardEvents } from './radiant-rewards';

const anchors = radiantPressureAnchors();
const namespace = 'radiant-study:v1:00000000-0000-4000-8000-000000000001:1:loot';
function fixture(): Account {
  const account = emptyAccount();
  account.characters.ember = { level: 105, evolution: 6, weaponRank: 0 };
  account.characters.ozriel = { level: 0, evolution: 1, weaponRank: 0 };
  account.squad = ['ember'];
  account.storyCompleted = storyRules.stages;
  account.oblivionStage = gatesOfOblivionRules.stages;
  for (const anchor of anchors) {
    const a = anchor.activity;
    if (a.kind === 'dungeon') account.dungeonStages[a.element] = dungeonStageCount;
    if (a.kind === 'infusion') account.infusionStages[a.mode] = infusionStageCount(a.mode);
  }
  account.warStages = Object.fromEntries(elementalWars.map(war => [war.character, warStageCount]));
  account.normalFinalClears = Object.fromEntries(calamityActivities.map(activity => [activity.id, true]));
  account.calamityClears = Object.fromEntries(calamityActivities.map(activity => [activity.id, 3]));
  return account;
}
function killed(anchor: RadiantPressureAnchor, seed = 1729) {
  const enemies = adaptRadiantPressureEncounter(anchor, seed, authoredRadiantCalibration);
  const combat = createRadiantCombat([{ id: 'ember', starter: 'ember', level: 105, form: 6,
    weaponRank: 0, masterId: null, ascension: {} }], enemies, 7);
  combat.enemies.forEach(enemy => {
    enemy.hp = 0; enemy.currency = depleteRadiantCurrency(enemy.currency, 0).ledger;
  });
  combat.currencyEarned = combat.enemies.reduce((sum, enemy) => sum + enemy.currency.paid, 0);
  combat.phase = 'victory';
  return combat;
}
function storage(account: Account) {
  const items = new Map([[ACCOUNT_KEY, JSON.stringify(account)]]);
  return { getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => { items.set(key, value); },
    removeItem: (key: string) => { items.delete(key); } };
}
describe('authored Radiant kill loot parity, not a combat clear-rate estimate', () => {
  it.each(anchors.map(anchor => [anchor.id, anchor] as const))('%s keeps non-Prismatica rolls and progression', (_id, anchor) => {
    const account = fixture(), before = structuredClone(account), combat = killed(anchor);
    const legacy = createRadiantAuthoredEncounter(anchor, 1729);
    const resolved = structuredClone(legacy);
    resolved.enemies.forEach(enemy => { enemy.hp = 0; });
    resolved.phase = 'cleared';
    legacy.machineConduits = {}; legacy.machineLootFocus = {};
    resolved.machineConduits = {}; resolved.machineLootFocus = {};
    const events: BattleEvent[] = [];
    awardDefeats(legacy, resolved, events);
    const base = events.reduce((sum, event) => sum + event.amount, 0);
    const normal = saveAccountRewards(storage(account), { state: resolved, events }, namespace);
    const result = resolveRadiantRewards(account, anchor, 1729,
      initialRadiantRewards(anchor, 1729), combat, namespace);
    expect(result.account.fractalis).toBe(normal.fractalis - base);
    expect(result.account.lycalis).toBe(normal.lycalis);
    for (const key of ['materials', 'conduits', 'mechanicalComponents', 'masterChests', 'calamityChests',
      'calamityClears', 'calamityShardSeed', 'calamityRecruitmentSeed', 'characters', 'dungeonStages',
      'infusionStages', 'warStages', 'oblivionStage', 'normalFinalClears', 'storyCompleted', 'creatures', 'receipts'] as const)
      expect(result.account[key], key).toEqual(normal[key]);
    expect(result.account.capturedCharacters?.map(({ instanceId: _instanceId, ...copy }) => copy))
      .toEqual(normal.capturedCharacters?.map(({ instanceId: _instanceId, ...copy }) => copy));
    expect(result.ledger.seeds.rewardSeed).toBe(resolved.rewardSeed);
    expect(result.ledger.defeated).toEqual(combat.enemies.map(enemy => enemy.id));
    validateRadiantRewardEvents(result.rewards, result.ledger);
    expect(account).toEqual(before);
    const again = resolveRadiantRewards(result.account, anchor, 1729, result.ledger, combat, namespace);
    expect(again.account).toEqual(result.account); expect(again.rewards).toEqual([]);
    expect(again.ledger).toEqual(result.ledger);
  });
  it('preserves first stage/regional bonuses exactly once while enemy currency is damage-paid', () => {
    const anchor: RadiantPressureAnchor = { id: 'first-boss', family: 'story', position: 'boss',
      activity: { kind: 'story', stage: storyRules.regionStages } };
    const account = fixture();
    account.storyCompleted = storyRules.regionStages - 1;
    const combat = killed(anchor), bonus = storyBossBonus(storyRules.regionStages), clear = storyClearReward(true);
    const result = resolveRadiantRewards(account, anchor, 1729, initialRadiantRewards(anchor, 1729), combat, namespace);
    expect(result.account.fractalis).toBe(bonus.fractalis + clear.fractalis);
    expect(result.account.lycalis).toBe(bonus.lycalis + clear.lycalis);
    expect(result.account.storyCompleted).toBe(storyRules.regionStages);
    expect(result.rewards[0].amount).toBe(bonus.fractalis + clear.fractalis);
    const replay = resolveRadiantRewards(result.account, anchor, 1729, initialRadiantRewards(anchor, 1729),
      combat, `${namespace}:fresh`);
    expect(replay.account.fractalis - result.account.fractalis).toBe(storyClearReward(false).fractalis);
    expect(replay.account.lycalis).toBe(result.account.lycalis);
  });
  it('saves per kill, marks remaining enemies seen and cannot replay loot after healing/retry', () => {
    const anchor = anchors.find(anchor => anchor.id === 'story:infernic:early')!;
    const combat = killed(anchor), account = fixture();
    combat.enemies[1].hp = combat.enemies[1].currency.baselineHP;
    combat.enemies[1].currency.lowestHP = combat.enemies[1].hp;
    combat.enemies[1].currency.paid = 0; combat.phase = 'player';
    const first = resolveRadiantRewards(account, anchor, 1729, initialRadiantRewards(anchor, 1729), combat, namespace);
    expect(first.rewards).toHaveLength(1);
    expect(Object.values(first.account.creatures).some(entry => !entry.defeated)).toBe(true);
    combat.enemies[0].hp = combat.enemies[0].currency.baselineHP;
    const retry = resolveRadiantRewards(first.account, anchor, 1729, first.ledger, combat, namespace);
    expect(retry.rewards).toEqual([]); expect(retry.account).toEqual(first.account);
    combat.enemies.forEach(enemy => { enemy.hp = 0; enemy.currency = depleteRadiantCurrency(enemy.currency, 0).ledger; });
    combat.phase = 'victory';
    const last = resolveRadiantRewards(first.account, anchor, 1729, first.ledger, combat, namespace);
    expect(last.rewards).toHaveLength(1); expect(last.ledger.defeated).toHaveLength(2);
  });
  it('does not overflow on a suppressed kill roll but still rejects a real material overflow', () => {
    const anchor = anchors.find(anchor => anchor.id === 'dungeon:infernic:early')!;
    const account = fixture(), combat = killed(anchor);
    account.fractalis = Number.MAX_SAFE_INTEGER;
    const result = resolveRadiantRewards(account, anchor, 1729, initialRadiantRewards(anchor, 1729), combat, namespace);
    expect(result.account.fractalis).toBe(Number.MAX_SAFE_INTEGER);
    for (const id of Object.keys(result.account.materials)) account.materials[id] = Number.MAX_SAFE_INTEGER;
    const before = structuredClone(account);
    expect(() => resolveRadiantRewards(account, anchor, 1729, initialRadiantRewards(anchor, 1729), combat, namespace)).toThrow();
    expect(account).toEqual(before);
  });
  it('a kill retained from a quit attempt cannot falsely complete the next attempt', () => {
    const anchor = anchors.find(anchor => anchor.id === 'story:infernic:early')!;
    const account = fixture(); account.storyCompleted = 0;
    const combat = killed(anchor);
    const revive = (index: number, fresh = false) => {
      const enemy = combat.enemies[index]; enemy.hp = enemy.currency.baselineHP;
      if (fresh) { enemy.currency.lowestHP = enemy.hp; enemy.currency.paid = 0; }
    };
    revive(1, true); combat.phase = 'player';
    const first = resolveRadiantRewards(account, anchor, 1729, initialRadiantRewards(anchor, 1729), combat, namespace);
    revive(0); combat.enemies[1].hp = 0;
    combat.enemies[1].currency = depleteRadiantCurrency(combat.enemies[1].currency, 0).ledger;
    const second = resolveRadiantRewards(first.account, anchor, 1729, first.ledger, combat, namespace);
    expect(second.ledger.defeated).toHaveLength(2); expect(second.ledger.cleared).toBe(false);
    expect(second.account.storyCompleted).toBe(0); expect(second.account.fractalis).toBe(0);
    combat.enemies[0].hp = 0; combat.phase = 'victory';
    const clear = resolveRadiantRewards(second.account, anchor, 1729, second.ledger, combat, namespace);
    expect(clear.account.storyCompleted).toBe(1); expect(clear.ledger.cleared).toBe(true);
    expect(clear.account.materials).toEqual(second.account.materials);
    expect(clear.rewards).toHaveLength(1);
    expect(clear.rewards[0].amount).toBe(storyClearReward(true).fractalis);
    validateRadiantRewardEvents(clear.rewards, clear.ledger);
    expect(resolveRadiantRewards(clear.account, anchor, 1729, clear.ledger, combat, namespace).rewards).toEqual([]);
  });
  it('guaranteed War recruitment fixture preserves new and already-owned conversion outcomes', () => {
    const anchor = anchors.find(anchor => anchor.id === 'war:nerithe:final')!, combat = killed(anchor);
    const account = fixture(), ledger = initialRadiantRewards(anchor, 1729);
    ledger.seeds.recruitmentSeed = 1;
    const first = resolveRadiantRewards(account, anchor, 1729, ledger, combat, namespace);
    expect(first.rewards[0].recruitment).toBe('nerithe');
    expect(first.rewards[0].recruitmentOutcome).toBe('new');
    expect(first.account.characters.nerithe).toEqual({ level: 0, evolution: 1, weaponRank: 0 });
    const second = resolveRadiantRewards(first.account, anchor, 1729, ledger, combat, `${namespace}:fresh`);
    expect(second.rewards[0].recruitmentOutcome).toBe('duplicate');
    expect(second.account.lycalis - first.account.lycalis).toBe(100 + (second.rewards[0].lycalis ?? 0));
    expect(second.account.characters).toEqual(first.account.characters);
  });
  it('Calamity banks a chest and server-owned shard/recruitment rolls, never kill Prismatica', () => {
    const anchor = anchors.find(anchor => anchor.activity.kind === 'calamity' && anchor.activity.tier === 2)!;
    const account = fixture(); account.calamityRecruitmentSeed = 1; account.calamityShardSeed = 1;
    const result = resolveRadiantRewards(account, anchor, 1729, initialRadiantRewards(anchor, 1729), killed(anchor), namespace);
    expect(result.account.fractalis).toBe(0);
    expect(Object.values(result.account.calamityChests!)).toEqual([1]);
    expect(result.rewards[0].calamiticRecruitment).toBe('ilvaris');
    expect(result.account.characters.ilvaris).toEqual({ level: 0, evolution: 1, weaponRank: 0 });
    expect(result.rewards[0].calamityShards).toBeGreaterThan(0);
  });
});
