import { ACCOUNT_KEY, isMaterial, saveDamagePaidAccountRewards, validateAccount, type Account } from '../game/account';
import { awardDefeats, type BattleState, type BattleEvent } from '../game/battle';
import { createRadiantAuthoredEncounter, type RadiantPressureAnchor } from '../game/radiant-pressure-encounters';
import type { RadiantCombatState } from '../game/radiant-combat';
import type { ProfileStorage } from '../game/profile';
import { isConduitId } from '../content/conduits';
import { isWarCharacter } from '../content/war-characters';
import { getCreature } from '../content/creatures';
import { parseCalamityChestId } from '../content/calamity';

const seedKeys = ['rewardSeed', 'captureSeed', 'lycalisSeed', 'conduitSeed', 'componentSeed',
  'masterChestSeed', 'recruitmentSeed', 'oblivionSeed'] as const;
type RewardSeeds = Pick<BattleState, typeof seedKeys[number]>;
export interface RadiantRewardLedger {
  defeated: string[];
  seeds: RewardSeeds;
  cleared: boolean;
}
function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
function count(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}
export function validateRadiantRewardEvents(value: unknown, ledger: RadiantRewardLedger): void {
  if (!Array.isArray(value)) throw new Error('Invalid saved Radiant rewards.');
  const sources = new Set<string>();
  const allowed = ['kind', 'source', 'target', 'amount', 'critical', 'message', 'materials', 'capture',
    'lycalis', 'conduits', 'conduitUpgrades', 'mechanicalComponents', 'masterChests', 'calamityChest',
    'recruitment', 'recruitmentOutcome', 'calamiticRecruitment', 'calamityShards', 'storyBonus'];
  for (const event of value) {
    if (!record(event) || Object.keys(event).some(key => !allowed.includes(key)) || event.kind !== 'reward' ||
      typeof event.source !== 'string' || !ledger.defeated.includes(event.source) || sources.has(event.source) ||
      !['', event.source].includes(String(event.target)) || event.critical !== false ||
      !count(event.amount) || typeof event.message !== 'string' || !event.message.length)
      throw new Error('Invalid saved Radiant reward.');
    sources.add(event.source);
    for (const key of ['lycalis', 'mechanicalComponents', 'masterChests', 'calamityShards'])
      if (event[key] !== undefined && (!count(event[key]) || event[key] === 0))
        throw new Error('Invalid saved Radiant reward quantity.');
    for (const key of ['materials', 'conduits', 'conduitUpgrades']) if (event[key] !== undefined) {
      const entries = event[key];
      if (!record(entries) || Object.entries(entries).some(([id, amount]) =>
        !(key === 'materials' ? isMaterial(id) : isConduitId(id)) ||
        !count(amount) || (key === 'conduits' ? amount !== 1 : key === 'conduitUpgrades' ? amount > 5 : amount === 0)))
        throw new Error('Invalid saved Radiant reward holdings.');
    }
    if (event.capture !== undefined) {
      const capture = event.capture;
      if (!record(capture) || Object.keys(capture).some(key => !['creatureId', 'level'].includes(key)) ||
        typeof capture.creatureId !== 'string' || !getCreature(capture.creatureId).mode ||
        !count(capture.level) || capture.level > 120) throw new Error('Invalid saved Radiant capture.');
    }
    if (event.recruitment !== undefined && !isWarCharacter(event.recruitment) ||
      event.recruitmentOutcome !== undefined && (!event.recruitment ||
        !['new', 'duplicate'].includes(String(event.recruitmentOutcome))) ||
      event.calamiticRecruitment !== undefined && !['ozriel', 'ilvaris', 'kaelith'].includes(String(event.calamiticRecruitment)))
      throw new Error('Invalid saved Radiant recruitment.');
    if (event.storyBonus !== undefined && (!record(event.storyBonus) ||
      Object.keys(event.storyBonus).some(key => !['fractalis', 'lycalis'].includes(key)) ||
      !count(event.storyBonus.fractalis) || !count(event.storyBonus.lycalis)))
      throw new Error('Invalid saved Radiant Story bonus.');
    if (event.calamityChest !== undefined) {
      if (typeof event.calamityChest !== 'string' || event.amount !== 0)
        throw new Error('Invalid saved Radiant chest.');
      parseCalamityChestId(event.calamityChest);
    }
  }
}
function seedsOf(state: BattleState): RewardSeeds {
  const seeds: RewardSeeds = { rewardSeed: state.rewardSeed };
  for (const key of seedKeys) if (state[key] !== undefined) seeds[key] = state[key];
  return seeds;
}
export function initialRadiantRewards(anchor: RadiantPressureAnchor, encounterSeed: number,
  previous?: RadiantRewardLedger): RadiantRewardLedger {
  return { defeated: [], cleared: false, seeds: previous ? structuredClone(previous.seeds)
    : seedsOf(createRadiantAuthoredEncounter(anchor, encounterSeed)) };
}
export function validateRadiantRewards(value: unknown, combat: RadiantCombatState): asserts value is RadiantRewardLedger {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid Radiant reward ledger.');
  const ledger = value as RadiantRewardLedger;
  if (Object.keys(ledger).some(key => !['defeated', 'seeds', 'cleared'].includes(key)) ||
    typeof ledger.cleared !== 'boolean' ||
    !Array.isArray(ledger.defeated) || new Set(ledger.defeated).size !== ledger.defeated.length ||
    ledger.cleared && ledger.defeated.length !== combat.enemies.length ||
    ledger.defeated.some(id => typeof id !== 'string' ||
      !combat.enemies.some(enemy => enemy.id === id && enemy.currency.lowestHP === 0)) ||
    !ledger.seeds || typeof ledger.seeds !== 'object' || Array.isArray(ledger.seeds) ||
    Object.keys(ledger.seeds).some(key => !seedKeys.includes(key as typeof seedKeys[number])) ||
    ledger.seeds.rewardSeed === undefined || Object.values(ledger.seeds).some(seed =>
      !Number.isSafeInteger(seed) || seed < 0 || seed > 0xffffffff)) {
    throw new Error('Invalid Radiant reward ledger.');
  }
}
function preserveUntouchedAccount(raw: Account, before: Account, saved: Account): Account {
  const result = structuredClone(raw);
  for (const key of Object.keys(saved) as (keyof Account)[]) {
    if (JSON.stringify(before[key]) === JSON.stringify(saved[key])) continue;
    if (key === 'characters') result.characters = { ...raw.characters,
      ...Object.fromEntries(Object.entries(saved.characters).filter(([id, progress]) =>
        JSON.stringify(progress) !== JSON.stringify(before.characters[id as keyof Account['characters']]))) };
    else if (key === 'capturedCharacters') {
      const existing = new Set((raw.capturedCharacters ?? []).map(copy => copy.instanceId));
      result.capturedCharacters = [...(raw.capturedCharacters ?? []),
        ...(saved.capturedCharacters ?? []).filter(copy => !existing.has(copy.instanceId))];
    } else Object.assign(result, { [key]: structuredClone(saved[key]) });
  }
  return result;
}
/** Canonical loot/progression only. No legacy attacks, actions or combat RNG run.
 * Already-paid enemies remain dead in this ledger through combat Retry. */
export function resolveRadiantRewards(account: Account, anchor: RadiantPressureAnchor, encounterSeed: number,
  ledger: RadiantRewardLedger, combat: RadiantCombatState, receiptNamespace: string, discover = false,
  captureUuid?: (enemyId: string) => string):
  { account: Account; ledger: RadiantRewardLedger; rewards: BattleEvent[] } {
  validateRadiantRewards(ledger, combat);
  const previous = createRadiantAuthoredEncounter(anchor, encounterSeed);
  Object.assign(previous, ledger.seeds);
  for (const enemy of previous.enemies) if (ledger.defeated.includes(enemy.id)) enemy.hp = 0;
  previous.machineConduits = structuredClone(account.conduits ?? {});
  previous.machineLootFocus = structuredClone(account.machineLootFocus ?? {});
  const state = structuredClone(previous);
  for (const enemy of state.enemies) {
    const current = combat.enemies.find(unit => unit.id === enemy.id);
    if (!current) throw new Error('Radiant reward source is missing.');
    if (current.hp <= 0) enemy.hp = 0;
  }
  const newlyDefeated = state.enemies.filter(enemy => enemy.hp <= 0 && !ledger.defeated.includes(enemy.id));
  if (!newlyDefeated.length && !discover && (combat.phase !== 'victory' || ledger.cleared))
    return { account: structuredClone(account),
    ledger: structuredClone(ledger), rewards: [] };
  state.phase = combat.phase === 'victory' ? 'cleared'
    : combat.phase === 'defeat' ? 'defeat' : 'player';
  const rewards: BattleEvent[] = [];
  awardDefeats(previous, state, rewards);
  const before = validateAccount(account);
  const items = new Map([[ACCOUNT_KEY, JSON.stringify(account)]]);
  const storage: ProfileStorage = {
    getItem: key => items.get(key) ?? null,
    setItem: (key, value) => { items.set(key, value); },
    removeItem: key => { items.delete(key); },
  };
  const saved = saveDamagePaidAccountRewards(storage, { state, events: rewards }, receiptNamespace, captureUuid);
  if (!rewards.length && state.story && saved.fractalis > before.fractalis) {
    rewards.push({ kind: 'reward', source: state.enemies.at(-1)!.id, target: '', amount: saved.fractalis - before.fractalis,
      critical: false, message: 'Story stage clear rewards saved.',
      ...(saved.lycalis > before.lycalis ? { lycalis: saved.lycalis - before.lycalis } : {}) });
  }
  return { account: preserveUntouchedAccount(account, before, saved),
    ledger: { defeated: [...ledger.defeated, ...newlyDefeated.map(enemy => enemy.id)], seeds: seedsOf(state),
      cleared: ledger.cleared || combat.phase === 'victory' },
    rewards };
}
