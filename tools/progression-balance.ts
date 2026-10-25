import { enemyCombatStats, enemyExponentialRates, enemyResistanceRamp } from '../src/content/stat-growth';
import { calamityActivities, calamityTierScaling } from '../src/content/calamity';
import { elements, infusionStageCount, storyStageLayout } from '../src/content/activities';
import { createBattle, nextWave, withMasterLoadouts, type BattleState } from '../src/game/battle';
import { getConduit } from '../src/content/conduits';
import { loadout, makeBattle, measureBattle, progressAt, surveySquads, type Build, type Encounter } from './battle-survey';
import type { StarterId } from '../src/content/starters';
import { balanceGear } from './calamity-balance';
import { createCalamityBattle } from '../src/game/battle';
import type { CalamityActivityId, CalamityTier } from '../src/content/calamity';
import { createCreatureCopy, validateCapturedCharacters } from '../src/game/character-instances';

export const calibrationSeeds = [1, 1729, 104729];
export const progressionTeams: StarterId[][] = [
  ['ember', 'tide', 'sprout'], ['ember', 'atmoso', 'sprout'], ['elise', 'bruno', 'sprout'],
  ['ember', 'tide', 'atmoso'], ['atmoso', 'bruno', 'sprout'], ['elise', 'tide', 'sprout'],
];
export function assertNonCalamitic(gear: ReturnType<typeof loadout>): void {
  for (const slots of Object.values(gear.equipment)) for (const id of slots ?? [])
    if (id && getConduit(id).rarity === 'Calamitic') throw new Error('Calamitic gear cannot set difficulty benchmarks.');
}
export function trainingBattle(enemyLevel: number, roster: StarterId[], level: number, build: Build, seed: number): BattleState {
  if (!Number.isInteger(enemyLevel) || enemyLevel < 1 || enemyLevel > 120) throw new Error('Training benchmark level must be from 1 to 120.');
  const gear = loadout(roster, build);
  assertNonCalamitic(gear);
  const progress = progressAt(level);
  let state = createBattle(seed, roster, Object.fromEntries(roster.map(id => [id, progress])), gear.equipment, [], gear.upgrades);
  if (enemyLevel > 1) {
    state.phase = 'cleared'; state.wave = enemyLevel - 1;
    state = nextWave(state).state;
  }
  return withMasterLoadouts(state, gear.masters);
}

export function progressionBuild(enemyLevel: number): Build {
  return enemyLevel <= 40 ? 'common0' : enemyLevel <= 80 ? 'mixed0'
    : enemyLevel <= 105 ? 'mixed5' : enemyLevel <= 120 ? 'omnic5' : 'master5';
}
export function playerLevel(enemyLevel: number): number { return Math.min(105, Math.max(0, enemyLevel - 1)); }

export function runProbe(emit: (row: object) => void): void {
  for (const stage of [1, 20, 40, 60, 80, 100, 120]) {
    const encounter = { kind: 'story', stage } as const;
    const probe = makeBattle(encounter, ['ember'], 0, 'common0', 1);
    const enemyLevel = probe.enemies[0].level!;
    for (const build of ['bare', 'common0', 'mixed0'] as const) {
      const outcomes = (['ember', 'tide', 'sprout'] as const).map(id => measureBattle(
        makeBattle(encounter, [id], playerLevel(enemyLevel), build, 1729), 'balanced').result);
      emit({ group: 'story-solo', stage, enemyLevel, build, wins: outcomes.filter(row => row.outcome === 'win').length,
        n: outcomes.length, rounds: outcomes.map(row => row.rounds), health: outcomes.map(row => row.healthFraction) });
    }
  }
  for (const enemyLevel of [1, 10, 20, 30, 40, 50, 60]) for (const build of ['bare', 'common0', 'mixed0'] as const) {
    const outcomes = (['ember', 'tide', 'sprout'] as const).map(id =>
      measureBattle(trainingBattle(enemyLevel, [id], playerLevel(enemyLevel), build, 1729), 'balanced').result);
    emit({ group: 'starter-solo', enemyLevel, build, wins: outcomes.filter(row => row.outcome === 'win').length,
      n: outcomes.length, rounds: outcomes.map(row => row.rounds), health: outcomes.map(row => row.healthFraction) });
  }
  for (const enemyLevel of [1, 10, 20, 40, 60, 80, 100, 105, 120]) {
    for (const build of ['common0', 'mixed0', 'mixed5', 'omnic0', 'omnic5', 'master5'] as const) {
      const outcomes = progressionTeams.map(roster => measureBattle(trainingBattle(enemyLevel, roster,
        playerLevel(enemyLevel), build, 1729), 'balanced').result);
      emit({ group: 'training', enemyLevel, build, wins: outcomes.filter(row => row.outcome === 'win').length,
        n: outcomes.length, rounds: outcomes.map(row => row.rounds), health: outcomes.map(row => row.healthFraction) });
    }
  }
  for (const tier of [1, 2, 3] as const) for (const build of ['mixed5', 'omnic0', 'omnic5', 'master5'] as const) {
    const outcomes = surveySquads.slice(0, 6).flatMap(squad => calamityActivities.map(activity =>
      measureBattle(makeBattle({ kind: 'calamity', activity: activity.id, tier }, squad.roster, 105, build, 1729), 'balanced').result));
    emit({ group: 'calamity', tier, build, wins: outcomes.filter(row => row.outcome === 'win').length,
      n: outcomes.length, rounds: outcomes.map(row => row.rounds) });
  }
}

export function allEncounters(): Encounter[] {
  return [
    ...Array.from({ length: storyStageLayout.stages }, (_, index) => ({ kind: 'story' as const, stage: index + 1 })),
    ...elements.flatMap(element => Array.from({ length: 35 }, (_, index) => ({ kind: 'dungeon' as const, element: element.id, stage: index + 1 }))),
    ...(['machines', 'heavens', 'abyss', 'treasury', 'sanctuary', 'roses'] as const).flatMap(mode =>
      Array.from({ length: infusionStageCount(mode) }, (_, index) => ({ kind: 'infusion' as const, mode, stage: index + 1 }))),
    ...(['nerithe', 'orvella', 'vaelor'] as const).flatMap(character =>
      Array.from({ length: 10 }, (_, index) => ({ kind: 'war' as const, character, stage: index + 1 }))),
    ...calamityActivities.flatMap(activity => ([1, 2, 3] as const).map(tier =>
      ({ kind: 'calamity' as const, activity: activity.id, tier }))),
  ];
}

export function historicalStats(level: number, boss: boolean) {
  const stats = enemyCombatStats(level, boss), p = (level - 80) / 65;
  const effective = level > 80 && level < 145 ? level + 160 * p ** 2 * (1 - p) ** 2 : level;
  for (const [stat, base, slope] of [['health', boss ? 207.5 : 83, .45],
    ['damage', boss ? 27.5 : 22, .25], ['defense', boss ? 16 / 3 : 4, .30]] as const) {
    const rate = enemyExponentialRates[stat];
    stats[stat] = Math.round(base * (1 + slope * Math.expm1(rate * (effective - 1)) / rate) * 1.05 *
      enemyResistanceRamp[stat] ** (Math.max(0, effective - 80) / 60));
  }
  return stats;
}
function restoreHistoricalStats(state: BattleState): BattleState {
  for (const enemy of state.enemies) {
    if (enemy.hp !== enemy.stats.health || enemy.shield) throw new Error('Historical stats require a fresh unshielded encounter.');
    enemy.stats = historicalStats(enemy.level!, enemy.boss ?? false);
    if (state.calamity) for (const stat of ['health', 'damage', 'defense'] as const)
      enemy.stats[stat] = Math.round(enemy.stats[stat] * calamityTierScaling[state.calamity.tier].statMultiplier);
    enemy.hp = enemy.stats.health;
  }
  return state;
}

export function runCalibration(emit: (row: object) => void, historical = false): number {
  let count = 0;
  for (const encounter of allEncounters()) {
    const probe = makeBattle(encounter, progressionTeams[0], 105, 'common0', 1);
    const enemyLevel = probe.enemies[0].level!;
    const level = playerLevel(enemyLevel);
    const build = encounter.kind === 'calamity' ? 'master5' : progressionBuild(enemyLevel);
    const teams = encounter.kind === 'calamity' ? surveySquads.slice(0, 6).map(squad => squad.roster) : progressionTeams;
    for (const roster of teams) for (const seed of calibrationSeeds) {
      const gear = loadout(roster, build); assertNonCalamitic(gear);
      const state = makeBattle(encounter, roster, level, build, seed);
      if (historical) restoreHistoricalStats(state);
      const result = measureBattle(state, 'balanced').result;
      emit({ encounter, enemyLevel, playerLevel: level, build, roster, seed, ...result });
      count++;
    }
  }
  for (let enemyLevel = 1; enemyLevel <= 120; enemyLevel++) {
    const level = playerLevel(enemyLevel), build = progressionBuild(enemyLevel);
    for (const roster of progressionTeams) for (const seed of calibrationSeeds) {
      const state = trainingBattle(enemyLevel, roster, level, build, seed);
      if (historical) restoreHistoricalStats(state);
      const result = measureBattle(state, 'balanced').result;
      emit({ encounter: { kind: 'training', stage: enemyLevel }, enemyLevel, playerLevel: level, build, roster, seed, ...result });
      count++;
    }
  }
  return count;
}

export function optimizedBattle(activity: CalamityActivityId, tier: CalamityTier, roster: StarterId[], seed: number): BattleState {
  const gear = balanceGear(roster, 'glassroot-stasis');
  assertNonCalamitic(gear);
  const progress = progressAt(105), team = Object.fromEntries(roster.map(id => [id, progress]));
  return withMasterLoadouts(createCalamityBattle(activity, tier, seed, roster[0],
    progress, roster, team, gear.equipment, [], gear.upgrades), gear.masters);
}

export function runOptimized(emit: (row: object) => void): number {
  let count = 0;
  for (const activity of calamityActivities) for (const tier of [1, 2, 3] as const)
    for (const squad of surveySquads.slice(0, 6)) for (const seed of calibrationSeeds)
      for (const policy of ['balanced', 'flare-first'] as const) {
        const result = measureBattle(optimizedBattle(activity.id, tier, squad.roster, seed), policy).result;
        emit({ encounter: { kind: 'calamity', activity: activity.id, tier }, roster: squad.roster,
          enemyLevel: [145, 160, 170][tier - 1], playerLevel: 105, build: 'glassroot-stasis', seed, policy, ...result });
        count++;
      }
  return count;
}

export function runAccess(emit: (row: object) => void): number {
  let count = 0;
  const copies = validateCapturedCharacters([0, 1].map(index => ({ ...createCreatureCopy('infusion:heavens:0', 1),
    instanceId: `capture:00000000-0000-4000-8000-00000000000${index}` })));
  for (const id of ['ember', 'tide', 'sprout'] as const)
    for (const enemyLevel of [50, 60, 80, 100, 120]) for (const slots of [1, 2, 3])
      for (const build of ['common0', 'mixed0', 'mixed5'] as const) for (const seed of calibrationSeeds) {
        const captured = copies.slice(0, slots - 1), roster = [id, ...captured.map(copy => copy.instanceId)];
        const gear = loadout([id], build), progress = progressAt(playerLevel(enemyLevel));
        for (const copy of captured) gear.equipment[copy.instanceId] = [...gear.equipment[id]!];
        assertNonCalamitic(gear);
        let state = createBattle(seed, roster, { [id]: progress }, gear.equipment, captured, gear.upgrades);
        state.phase = 'cleared'; state.wave = enemyLevel - 1;
        state = nextWave(state).state;
        emit({ encounter: { kind: 'training', stage: enemyLevel }, enemyLevel,
          playerLevel: progress.level, roster, slots, build, seed, capturedLevels: captured.map(copy => copy.level),
          ...measureBattle(state, 'balanced').result });
        count++;
      }
  return count;
}

export function statTable(historical = false) {
  const stats = historical ? historicalStats : enemyCombatStats;
  return Array.from({ length: 185 }, (_, index) => ({ level: index + 1,
    ordinary: stats(index + 1, false), boss: stats(index + 1, true) }));
}
