import { describe, expect, it } from 'vitest';
import { calamityActivities, calamityChest, calamityChestId, calamityEncounter, calamityLootTable,
  calamityPatterns, parseCalamityChestId, rollCalamityChest, type CalamityTier } from '../content/calamity';
import { act, actAndAdvanceTurn, actionUnavailable, createCalamityBattle, endTurn, nextStage, nextWave,
  withMasterLoadouts, type BattleState } from './battle';
import { enemyCombatStats } from '../content/stat-growth';
import { enemyAbilityMultiplier } from '../content/enemy-skills';
import type { ConduitLoadouts } from '../content/conduits';
import { characterLevelCap } from '../content/progression';
import type { StarterId } from '../content/starters';
import { creatureLoot, getCreature } from '../content/creatures';
import { playNativeBenchmark } from './native-benchmark-pilot';

const tiers = [1, 2, 3] as const;
const cases = calamityActivities.flatMap(activity => tiers.map(tier => ({ activity: activity.id, tier })));
const team = ['ember', 'tide', 'sprout'] as const;
const progress = Object.fromEntries(team.map(id => [id, { level: 105, evolution: 6 }]));
const base = ['vigil-core', 'immortal-vessel', 'citadel-spine', 'horizon-heartcase', 'bastion-lock'] as const;
const equipment: ConduitLoadouts = {
  ember: [...base, 'siege-cantilever', 'resonance-crucible', 'infernic-cinder-testament'],
  tide: [...base, 'opal-indexer', 'wardglass-transformer', 'ward-stitch-spool'],
  sprout: [...base, 'springwell-pump', 'coilfeed-ratchet', 'botanic-graft-covenant'],
};
const upgrades = Object.fromEntries(Object.values(equipment).flat().map(id => [id, 5]));
const masters = { ember: 'master-ember-1', tide: 'master-tide-3', sprout: 'master-sprout-1' } as const;

function play(initial: BattleState) {
  return playNativeBenchmark(initial);
}
describe('isolated Calamity definitions and rewards', () => {
  it('has exactly twelve distinct identities and thirty-six distinct chests', () => {
    expect(calamityActivities).toHaveLength(12);
    expect(new Set(calamityActivities.map(activity => activity.boss)).size).toBe(12);
    expect(new Set(cases.map(({ activity, tier }) => calamityChestId(activity, tier))).size).toBe(36);
  });
  it.each(cases)('$activity EX+$tier uses the right single boss and chest-only victory without consuming normal RNG', ({ activity, tier }) => {
    const state = createCalamityBattle(activity, tier, 1729, 'ember', progress.ember);
    expect(state.enemies).toHaveLength(1);
    expect(state.enemies[0]).toMatchObject({ name: calamityActivities.find(entry => entry.id === activity)!.boss,
      level: [145, 160, 185][tier - 1], boss: true });
    expect(state.enemies[0].art).toBeUndefined();
    expect(state.enemies[0].creatureId).toBe(`calamity:${activity}`);
    expect(creatureLoot(getCreature(`calamity:${activity}`), tier)).toEqual([
      expect.objectContaining({ id: calamityChestId(activity, tier), minimum: 1, maximum: 1, chance: 1 }),
    ]);
    expect(state.dungeon ?? state.infusion ?? state.story ?? state.war).toBeUndefined();
    state.enemies[0].hp = 1;
    state.enemies[0].shield = 0;
    state.enemies[0].stats.defense = 0;
    const result = act(state, 'ember', 'light', state.enemies[0].id);
    expect(result.state.phase).toBe('cleared');
    const rewards = result.events.filter(event => event.kind === 'reward');
    expect(rewards).toHaveLength(1);
    expect(rewards[0]).toEqual({ kind: 'reward', source: state.enemies[0].id, target: state.enemies[0].id,
      amount: 0, critical: false, calamityChest: calamityChestId(activity, tier),
      message: `${state.enemies[0].name} dropped 1 ${calamityChest(activity, tier).name}.` });
    for (const key of ['rewardSeed', 'captureSeed', 'lycalisSeed', 'componentSeed', 'conduitSeed', 'masterChestSeed', 'recruitmentSeed'] as const) {
      expect(result.state[key]).toBe(state[key]);
    }
    expect(() => nextStage(result.state, progress)).toThrow();
    expect(() => nextWave(result.state)).toThrow('Calamity');
  });
  it.each(cases)('$activity EX+$tier draws exactly the independent bundle count and fixed rewards', ({ activity, tier }) => {
    let calls = 0;
    const reward = rollCalamityChest(activity, tier, () => { calls++; return 0; });
    expect(Object.keys(reward).sort()).toEqual([
      'conduits', 'fractalis', 'id', 'lycalis', 'masterChests', 'materials', 'mechanicalComponents', 'name',
    ]);
    const chest = calamityChest(activity, tier);
    expect(calls).toBe(chest.bundles * 2);
    expect(reward.masterChests).toBe(tier === 3 ? 2 : 0);
    expect(reward.fractalis).toBe(chest.fractalis + (activity === 'treasury' ? chest.bundles * 25_000 : 0));
    expect(reward.lycalis).toBe(chest.lycalis + (activity === 'sanctuary' ? chest.bundles * 5 : 0));
    expect(parseCalamityChestId(chest.id)).toEqual({ activity, tier });
    const table = calamityLootTable(activity);
    expect(table.reduce((sum, row) => sum + row.weight, 0)).toBeCloseTo(100, 10);
    expect(table.every(row => row.weight > 0 && row.min > 0 && row.max >= row.min)).toBe(true);
  });
  it('rolls each weighted row at its boundaries, inclusive quantities, and merges repeated draws', () => {
    for (const { id } of calamityActivities) {
      const table = calamityLootTable(id);
      let offset = 0;
      for (const row of table) {
        for (const quantity of [0, 1 - Number.EPSILON]) {
          let calls = 0;
          const reward = rollCalamityChest(id, 1, () => calls++ % 2 === 0 ? (offset + row.weight / 2) / 100 : quantity);
          const expected = (quantity === 0 ? row.min : row.max) * 3;
          if (row.kind === 'material') expect(reward.materials).toEqual({ [row.id!]: expected });
          if (row.kind === 'conduit') expect(reward.conduits).toEqual({ [row.id!]: expected });
          if (row.kind === 'fractalis') expect(reward.fractalis).toBe(100_000 + expected);
          if (row.kind === 'lycalis') expect(reward.lycalis).toBe(50 + expected);
          if (row.kind === 'components') expect(reward.mechanicalComponents).toBe(expected);
        }
        offset += row.weight;
      }
      expect(() => rollCalamityChest(id, 1, () => 1)).toThrow();
    }
  });
  it('restricts all random materials and excludes weapon-only materials and Master rewards', () => {
    for (const { id } of calamityActivities) {
      const table = calamityLootTable(id);
      for (const row of table) {
        expect(row.id ?? '').not.toContain('weapon');
        expect(row.id ?? '').not.toContain('master-');
        if (id === 'heavens' || id === 'abyss') {
          const prefixes = id === 'heavens' ? ['heavens', 'infernic', 'oceanic', 'atmospheric', 'botanic'] : ['abyss', 'tranquilitic', 'chaotic'];
          expect(prefixes.some(prefix => row.id?.startsWith(prefix))).toBe(true);
        } else if (['infernic', 'oceanic', 'atmospheric', 'botanic', 'tranquilitic', 'chaotic'].includes(id)) {
          expect(row.id?.startsWith(`${id}-`)).toBe(true);
        }
      }
    }
  });
  it('rejects malformed identifiers and out-of-scope hostile levels without raising ordinary caps', () => {
    for (const id of ['calamity:story:1', 'calamity:machines:4', 'calamity:machines:01', 'calamity:machines:1:x']) {
      expect(() => parseCalamityChestId(id)).toThrow();
    }
    expect(() => calamityEncounter('machines', 4 as CalamityTier)).toThrow();
    expect(() => enemyCombatStats(145, true)).toThrow();
    expect(() => enemyAbilityMultiplier(185)).toThrow();
    expect(characterLevelCap(6)).toBe(105);
  });
});

describe('Calamity visible boss patterns', () => {
  it.each(['heavens', 'atmospheric'] as const)('%s splits one computed total without multiplying attack damage', activity => {
    const state = createCalamityBattle(activity, 1, 1729, 'ember', progress.ember);
    state.allies[0].hp = state.allies[0].stats.health = 1_000_000;
    const single = structuredClone(state);
    single.calamity!.activity = 'treasury';
    const result = endTurn(state);
    const baseline = endTurn(single);
    const damage = (events: typeof result.events) => events.filter(event => event.kind === 'damage' && event.source === state.enemies[0].id);
    expect(damage(result.events).reduce((sum, event) => sum + event.amount, 0)).toBe(damage(baseline.events)[0].amount);
    expect(damage(result.events).map(event => event.amount)).toEqual([
      ...Array((calamityPatterns[activity].hits ?? 1) - 1).fill(Math.floor(damage(baseline.events)[0].amount / calamityPatterns[activity].hits!)),
      damage(baseline.events)[0].amount % calamityPatterns[activity].hits! + Math.floor(damage(baseline.events)[0].amount / calamityPatterns[activity].hits!),
    ]);
  });
  it('lets authored Burn defeat a restoring boss before restoration or attack', () => {
    const state = createCalamityBattle('botanic', 1, 1729, 'ember', progress.ember);
    state.round = 3;
    state.enemies[0].hp = 1;
    state.enemies[0].burn = { damage: 2, turns: 1, sourceId: 'ember', origin: 'native' };
    const result = endTurn(state);
    expect(result.state.phase).toBe('cleared');
    expect(result.events.some(event => event.source === state.enemies[0].id && (event.kind === 'heal' || event.kind === 'attack'))).toBe(false);
    expect(result.events.filter(event => event.kind === 'reward')).toHaveLength(1);
  });
  it.each(calamityActivities)('$boss executes only its declared barrier/restoration rhythm', ({ id }) => {
    const state = createCalamityBattle(id, 1, 12345, 'ember', progress.ember);
    const enemy = state.enemies[0];
    const pattern = calamityPatterns[id];
    const round = pattern.shieldEvery ?? pattern.healEvery ?? pattern.every;
    state.round = round;
    enemy.hp -= Math.round(enemy.stats.health * .2);
    state.allies[0].stats.health = state.allies[0].hp = 1_000_000;
    const result = endTurn(state);
    const shields = result.events.filter(event => event.kind === 'shield' && event.source === enemy.id);
    const heals = result.events.filter(event => event.kind === 'heal' && event.source === enemy.id);
    expect(shields.length).toBe(pattern.shieldEvery && round % pattern.shieldEvery === 0 ? 1 : 0);
    expect(heals.length).toBe(pattern.healEvery && round % pattern.healEvery === 0 ? 1 : 0);
    if (shields.length) expect(shields[0].amount).toBe(Math.round(enemy.stats.health * pattern.shieldFraction!));
    if (heals.length) expect(heals[0].amount).toBe(Math.round(enemy.stats.health * pattern.healFraction!));
    expect(result.events.filter(event => event.kind === 'damage' && event.source === enemy.id)).toHaveLength(pattern.hits ?? 1);
  });
  it.each(['abyss', 'chaotic'] as const)('%s selects the announced HP-fraction target', activity => {
    const state = createCalamityBattle(activity, 1, 1729, 'ember', progress.ember, team, progress);
    state.allies.forEach((ally, index) => { ally.hp = ally.stats.health * [.8, .2, .5][index]; });
    const attack = endTurn(state).events.find(event => event.kind === 'attack');
    expect(attack?.target).toBe(activity === 'abyss' ? 'tide' : 'ember');
  });
});

describe('Calamity seeded difficulty benchmarks', () => {
  it.each(tiers)('retains a viable non-Rose/non-War starter route at EX+%s across three seeds', tier => {
    const results = calamityActivities.flatMap(({ id }) => [1, 1729, 12345].map(seed => {
      const state = createCalamityBattle(id, tier, seed, 'ember', progress.ember, team, progress, equipment, [], upgrades);
      const result = play(withMasterLoadouts(state, masters));
      return { activity: id, seed, phase: result.phase, rounds: result.round, survivors: result.allies.filter(ally => ally.hp > 0).length };
    }));
    expect(results.every(result => result.phase !== 'player')).toBe(true);
    expect(results.filter(result => result.phase === 'cleared').length).toBeGreaterThanOrEqual([30, 24, 20][tier - 1]);
    expect(results.filter(result => result.phase === 'cleared').every(result => result.rounds >= 10 && result.rounds <= 350)).toBe(true);
  });
  it.each(tiers)('permits complementary mixed squads at EX+%s rather than one lucky build/seed', tier => {
    const roles = {
      sprout: ['springwell-pump', 'coilfeed-ratchet', 'botanic-graft-covenant'],
      rosetta: ['wardglass-transformer', 'verdict-caliper', 'tranquilitic-accord-bastion'],
      thornia: ['lifeline-flywheel', 'breach-pendulum', 'verdict-caliper'],
    } as const;
    const roster = ['rosetta', 'thornia', 'sprout'] as const satisfies readonly StarterId[];
    const progress = Object.fromEntries(roster.map(id => [id, { level: 105, evolution: 6 }]));
    const equipment: ConduitLoadouts = Object.fromEntries(roster.map(id => [id, [
      ...base.slice(0, 4), 'sentinel-aperture', ...roles[id],
    ]]));
    const upgrades = Object.fromEntries(Object.values(equipment).flat().map(id => [id, 5]));
    for (const { id } of calamityActivities) for (const seed of [1, 1729, 12345]) {
      const state = createCalamityBattle(id, tier, seed, 'rosetta', progress.rosetta, roster, progress, equipment, [], upgrades);
      const result = play(withMasterLoadouts(state, {
        rosetta: 'master-rosetta-1', thornia: 'master-thornia-3', sprout: 'master-sprout-1',
      }));
      expect(result.phase, `${id} seed ${seed}`).toBe('cleared');
      expect(result.round, `${id} seed ${seed}`).toBeGreaterThanOrEqual(10);
      expect(result.round, `${id} seed ${seed}`).toBeLessThanOrEqual(250);
    }
  });
  it('rejects an undeveloped solo starter at every tier', () => {
    for (const tier of tiers) {
      const result = play(createCalamityBattle('treasury', tier, 1729, 'ember', { level: 0, evolution: 1 }));
      expect(result.phase).toBe('defeat');
      expect(play(createCalamityBattle('treasury', tier, 1729, 'ember', progress.ember, team, progress)).phase).toBe('defeat');
    }
  });
});
