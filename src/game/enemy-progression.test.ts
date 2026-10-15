import { describe, expect, it } from 'vitest';
import { enemyCombatStats } from '../content/stat-growth';
import { resolveFighter } from '../content/combat';
import { act, actAndAdvanceTurn, createBattle, createDungeonBattle, createInfusionBattle, createStoryBattle, createWarBattle, damageAmount, endTurn, actionUnavailable, nextWave, type BattleState } from './battle';
import { elementalEnemyLevel, infusionStageCount } from '../content/activities';
import { resolveCapturedFighter, createCreatureCopy, capturedProgress } from './character-instances';
import { capturedEnemyStats, infusionEncounter } from '../content/infusions';
import type { ConduitLoadouts } from '../content/conduits';
import { starters } from '../content/starters';
import { playableDungeons } from '../content/dungeons';
import { storyEncounter } from '../content/story';
import { enemyAbilityMultiplier, enemySkills } from '../content/enemy-skills';
import { characterLevelCap } from '../content/progression';
import { validateCapturedCharacters } from './character-instances';

const lateSlots = ['worldbreaker-drive', 'immortal-vessel', 'citadel-spine', 'astral-prism',
  'siege-cantilever', 'duplex-heart', 'twinpulse-bellows', 'springwell-pump'] as const;
const team = ['ember', 'tide', 'sprout'] as const;
const lateProgress = Object.fromEntries(team.map(id => [id, { level: 105, evolution: 6 }]));
const lateEquipment: ConduitLoadouts = Object.fromEntries(team.map(id => [id, [...lateSlots]]));
const commonSlots = ['vigil-core', 'siegebound-drive', 'bastion-lock', 'parallax-relay',
  'fieldbrace-coupler', 'reserve-torque-crank', 'crosspin-governor', 'precision-escapement'] as const;
const commonEquipment: ConduitLoadouts = Object.fromEntries(team.map(id => [id, [...commonSlots]]));

function playSquad(initial: BattleState): BattleState {
  let state = initial;
  for (let step = 0; state.phase === 'player' && step < 600; step++) {
    const actor = state.allies.find(unit => unit.hp > 0 && !actionUnavailable(state, unit, 'light'));
    if (!actor) {
      state = endTurn(state).state;
      continue;
    }
    const priorities = actor.definitionId === 'sprout' && state.allies.some(unit => unit.hp > 0 && unit.hp < unit.stats.health * .65)
      ? ['skill2', 'ultimate', 'skill1', 'light'] as const
      : actor.definitionId === 'tide' && state.allies.some(unit => unit.hp > 0 && unit.shield < 100)
      ? ['skill2', 'ultimate', 'skill1', 'light'] as const
      : ['ultimate', 'skill1', 'skill2', 'light'] as const;
    const action = priorities.find(id => !actionUnavailable(state, actor, id));
    const target = state.enemies.find(enemy => enemy.hp > 0);
    if (!action || !target) throw new Error('The balance fixture has no legal action/target.');
    state = actAndAdvanceTurn(state, actor.id, action, target.id).state;
  }
  return state;
}

describe('hostile progression balance', () => {
  it.each(['ember', 'tide', 'sprout'] as const)('%s needs sustained attacks with gradually increasing hostile pressure', (id) => {
    for (const [level, evolution] of [[0, 1], [10, 1], [19, 1], [30, 1], [45, 2], [60, 3], [75, 4], [90, 5], [105, 6]]) {
      const fighter = resolveFighter(id, { level, evolution });
      let previousHits = 0;
      for (const gap of [0, 5, 8, 10]) {
        const enemy = enemyCombatStats(Math.max(1, level + gap), false);
        const state = createBattle(1729, [id], { [id]: { level, evolution } });
        state.enemies = [state.enemies[0]];
        Object.assign(state.enemies[0].stats, enemy);
        state.enemies[0].hp = enemy.health;
        state.allies[0].stats.crit = 0;
        const hit = act(state, id, 'light', state.enemies[0].id).events.find(event => event.kind === 'damage')!.amount!;
        const hits = Math.ceil(enemy.health / hit);
        expect(hits, `${id} Lv.${level} +${gap}`).toBeGreaterThanOrEqual(Math.max(3, previousHits));
        if (gap === 0) expect(hits, `${id} Lv.${level}`).toBeLessThanOrEqual(id === 'ember' ? 12 : 16);
        previousHits = hits;
        expect(damageAmount(fighter.stats.damage, 1, enemy.defense, true)).toBeLessThan(enemy.health);
      }
    }
  });

  it.each(starters)('$name cannot trivialize Lv.19 standard or Story enemies with a critical Normal Attack', ({ id }) => {
    const fighter = resolveFighter(id, { level: 19, evolution: 1 });
    const story = Array.from({ length: 150 }, (_, index) => storyEncounter(index + 1))
      .find(encounter => encounter.level === 19 && !encounter.boss)!;
    for (const enemy of [enemyCombatStats(19, false), story.stats]) {
      expect(fighter.stats.health / enemy.health).toBeLessThan(3);
      expect(damageAmount(fighter.stats.damage, 1, enemy.defense, true, fighter.stats.critMultiplier)).toBeLessThan(enemy.health);
      expect(Math.ceil(enemy.health / damageAmount(fighter.stats.damage, 1, enemy.defense, false))).toBeGreaterThanOrEqual(3);
    }
  });

  it('increases relative incoming pressure smoothly and makes real Conduits close the late gap', () => {
    const pressure = (level: number, evolution: number) => {
      const fighter = resolveFighter('ember', { level, evolution });
      const enemy = enemyCombatStats(level, false);
      return damageAmount(enemy.damage, 1, fighter.stats.defense, false) / fighter.stats.health;
    };
    expect(pressure(105, 6)).toBeGreaterThan(pressure(19, 1) * 1.2);
    expect(pressure(60, 3)).toBeGreaterThan(.12);
    for (let level = 90; level < 120; level++) {
      const before = enemyCombatStats(level, false);
      const after = enemyCombatStats(level + 1, false);
      for (const stat of ['health', 'damage', 'defense'] as const) expect(after[stat] / before[stat]).toBeLessThan(1.05);
    }
    const plain = resolveFighter('ember', lateProgress.ember);
    const built = resolveFighter('ember', lateProgress.ember, [...lateSlots]);
    const enemy = enemyCombatStats(120, false);
    expect(Math.ceil(enemy.health / damageAmount(plain.stats.damage, 1, enemy.defense, false))).toBeGreaterThanOrEqual(13);
    expect(Math.ceil(enemy.health / damageAmount(built.stats.damage, 1, enemy.defense, false))).toBeLessThanOrEqual(8);
    expect(damageAmount(enemy.damage, 1, built.stats.defense, false) / built.stats.health)
      .toBeLessThan(damageAmount(enemy.damage, 1, plain.stats.defense, false) / plain.stats.health * .5);
  });

  it.each(['heavens', 'abyss', 'treasury', 'sanctuary', 'machines', 'roses'] as const)(
    'requires a built reliable squad for the final %s boss, without making it impossible', mode => {
      for (const seed of [1, 1729, 12345]) {
        const stage = infusionStageCount(mode);
        const create = (gear: ConduitLoadouts) => createInfusionBattle(mode, stage, seed, 'ember', lateProgress.ember, team, lateProgress, gear);
        expect(playSquad(create(lateEquipment)).phase, `${mode} built seed ${seed}`).toBe('cleared');
        expect(playSquad(create({})).phase, `${mode} unbuilt seed ${seed}`).toBe('defeat');
      }
    });

  it.each(playableDungeons)('keeps built squads viable at the final %s material boss', element => {
    for (const seed of [1, 1729, 12345]) {
      expect(playSquad(createDungeonBattle(element, 35, seed, 'ember', lateProgress.ember, team, lateProgress, lateEquipment)).phase).toBe('cleared');
    }
  });

  it.each(['nerithe', 'orvella', 'vaelor'] as const)('keeps the final %s War boss viable for a built squad', id => {
    for (const seed of [1, 1729, 12345]) {
      expect(playSquad(createWarBattle(id, 10, seed, 'ember', lateProgress.ember, team, lateProgress, lateEquipment)).phase).toBe('cleared');
    }
  });

  it.each(['ember', 'tide', 'sprout'] as const)('%s can clear the first Story encounter at Lv.0 without equipment', (id) => {
    for (const seed of [1, 1729, 12345]) {
      let state = createStoryBattle(1, seed, id, { level: 0, evolution: 1 });
      for (let turn = 0; state.phase === 'player' && turn < 30; turn++) {
        const actor = state.allies[0];
        const action = (['skill1', 'light'] as const).find(action => !actionUnavailable(state, actor, action));
        if (action) state = act(state, id, action, state.enemies.find(enemy => enemy.hp > 0)!.id).state;
        if (state.phase === 'player') state = endTurn(state).state;
      }
      expect(state.phase).toBe('cleared');
    }
  });

  it('grows every hostile stat monotonically and rejects invalid levels', () => {
    for (const boss of [false, true]) for (let level = 2; level <= 140; level++) {
      const before = enemyCombatStats(level - 1, boss);
      const after = enemyCombatStats(level, boss);
      for (const stat of ['health', 'damage', 'defense'] as const) expect(after[stat]).toBeGreaterThanOrEqual(before[stat]);
    }
    for (const level of [0, 141, 1.5, NaN, Infinity]) expect(() => enemyCombatStats(level, false)).toThrow();
  });

  it.each(['ember', 'tide', 'sprout'] as const)('%s can reach the first regional bonus without recruiting a squad', id => {
    const progress = { level: 15, evolution: 1 };
    for (const seed of [1, 1729, 12345]) {
      expect(playSquad(createStoryBattle(25, seed, id, progress, [id], { [id]: progress }, { [id]: [...commonSlots] })).phase).toBe('cleared');
    }
  });

  it.each([25, 50, 75, 100, 125, 150])('keeps Story regional boss %s viable for a same-level Common-equipped squad', stage => {
    const level = storyEncounter(stage).level;
    const evolution = Array.from({ length: 6 }, (_, index) => index + 1).find(form => characterLevelCap(form) >= level)!;
    const progress = { level, evolution };
    for (const seed of [1, 1729, 12345]) {
      const initial = createStoryBattle(stage, seed, 'ember', progress, team,
        Object.fromEntries(team.map(id => [id, progress])), commonEquipment);
      expect(playSquad(initial).phase).toBe('cleared');
    }
  });

  it('keeps a complementary Common Store-equipped squad viable through material and fodder milestones', () => {
    const rareStage = Array.from({ length: 35 }, (_, index) => index + 1).find(stage => elementalEnemyLevel(stage) >= 48)!;
    for (const seed of [1, 1729, 12345]) {
      const first = { level: 30, evolution: 2 };
      const rare = { level: 45, evolution: 2 };
      const infusion = { level: 60, evolution: 3 };
      const progress = (value: typeof first) => Object.fromEntries(team.map(id => [id, value]));
      for (const initial of [
        createDungeonBattle('infernic', 1, seed, 'ember', first, team, progress(first), commonEquipment),
        createDungeonBattle('infernic', rareStage, seed, 'ember', rare, team, progress(rare), commonEquipment),
        createInfusionBattle('abyss', 13, seed, 'ember', infusion, team, progress(infusion), commonEquipment),
      ]) {
        expect(playSquad(initial).phase, `seed ${seed}, ${initial.infusion?.mode ?? 'dungeon'} stage ${initial.wave}`).toBe('cleared');
      }
    }
  });

  it('uses identical level/rank stats and skill power for every real spawned enemy in every activity', () => {
    const check = (state: BattleState) => {
      for (const enemy of state.enemies) {
        const level = enemy.level!;
        const boss = enemy.boss ?? false;
        expect(enemy.stats, `${enemy.name} Lv.${level}`).toEqual(enemyCombatStats(level, boss));
        expect(enemy.hp).toBe(enemy.stats.health);
        const first = enemy.enemySkills![0];
        const expected = enemySkills(level, boss, first.name, enemyAbilityMultiplier(level));
        const shape = (skills: typeof expected) => skills.map(({ name: _name, ...mechanics }) => mechanics);
        expect(shape(enemy.enemySkills!)).toEqual(shape(expected));
      }
    };
    for (let stage = 1; stage <= 150; stage++) check(createStoryBattle(stage, 1729, 'ember', lateProgress.ember));
    for (const element of playableDungeons) for (let stage = 1; stage <= 35; stage++) {
      check(createDungeonBattle(element, stage, 1729, 'ember', lateProgress.ember));
    }
    for (const mode of ['heavens', 'abyss', 'treasury', 'sanctuary', 'machines', 'roses'] as const) {
      for (let stage = 1; stage <= infusionStageCount(mode); stage++) {
        check(createInfusionBattle(mode, stage, 1729, 'ember', lateProgress.ember));
        if (mode === 'heavens' || mode === 'abyss') check(createInfusionBattle(mode, stage, 1729, 'ember', lateProgress.ember, undefined, undefined, undefined, undefined, undefined, 'legacy'));
      }
    }
    for (const id of ['nerithe', 'orvella', 'vaelor'] as const) for (let stage = 1; stage <= 10; stage++) {
      check(createWarBattle(id, stage, 1729, 'ember', lateProgress.ember));
    }
    let training = createBattle(1729);
    for (let wave = 1; wave <= 120; wave++) {
      check(training);
      training.phase = 'cleared';
      training.enemies.forEach(enemy => { enemy.hp = 0; });
      training = nextWave(training).state;
    }
  });

  it.each(starters)('$name struggles against enemies ten levels above its legal evolution across progression', ({ id }) => {
    for (const level of [19, 30, 45, 60, 75, 90, 105]) {
      const evolution = Array.from({ length: 6 }, (_, index) => index + 1).find(form => characterLevelCap(form) >= level)!;
      const fighter = resolveFighter(id, { level, evolution });
      const enemy = enemyCombatStats(level + 10, false);
      const same = enemyCombatStats(level, false);
      const normal = damageAmount(fighter.stats.damage, 1, enemy.defense, false);
      expect(Math.ceil(enemy.health / normal), `${id} Lv.${level} +10`).toBeGreaterThanOrEqual(7);
      expect(damageAmount(enemy.damage, 1, fighter.stats.defense, false) / fighter.stats.health).toBeGreaterThan(.1);
      expect(enemy.health / normal).toBeGreaterThan(same.health / damageAmount(fighter.stats.damage, 1, same.defense, false) * 1.15);
      const state = createBattle(1729, [id], { [id]: { level, evolution } });
      state.enemies = [state.enemies[0]];
      Object.assign(state.enemies[0], { level: level + 10, stats: enemy, hp: enemy.health });
      state.allies[0].shatter = state.allies[0].stats.shatterCapacity;
      state.allies[0].stats.crit = 0;
      if (!actionUnavailable(state, state.allies[0], 'skill1')) {
        const hit = act(state, id, 'skill1', state.enemies[0].id).events.find(event => event.kind === 'damage');
        if (hit) expect(hit.amount).toBeLessThan(enemy.health * .8);
      }
    }
  });

  it('preserves exact historical captured kits while new captures retain current hostile skills', () => {
    for (const mode of ['heavens', 'abyss', 'treasury', 'sanctuary', 'roses'] as const) {
      const stage = 5;
      const encounter = infusionEncounter(mode, stage);
      const copy = createCreatureCopy(`infusion:${mode}:${encounter.tier}`, stage);
      expect(copy.skills).toEqual(enemySkills(encounter.level, true, encounter.ability, encounter.abilityMultiplier));
      const legacy = { ...copy, skills: enemySkills(encounter.level, true, encounter.ability, encounter.legacyAbilityMultiplier) };
      expect(validateCapturedCharacters([legacy])).toEqual([legacy]);
      expect(capturedProgress(legacy).skills).toEqual(legacy.skills);
      expect(() => validateCapturedCharacters([{ ...legacy, skills: legacy.skills.map(skill => ({ ...skill, multiplier: skill.multiplier + .001 })) }])).toThrow('Invalid retained');
      if (copy.skills![1].multiplier !== legacy.skills[1].multiplier) {
        expect(() => validateCapturedCharacters([{ ...legacy, skills: [copy.skills![0], legacy.skills[1]] }])).toThrow('Invalid retained');
      }
    }
  });

  it('resolves legacy and new captures on linear playable growth without mutating saved copies', () => {
    for (const mode of ['heavens', 'abyss'] as const) {
      const legacy = { instanceId: 'capture:00000000-0000-4000-8000-000000000001', creatureId: `infusion:${mode}:0`, locked: false };
      expect(capturedProgress(legacy).level).toBe(80);
      expect(resolveCapturedFighter(legacy).stats.health).toBe(capturedEnemyStats(80).health * .65);
      const current = createCreatureCopy(`infusion:${mode}:0`, 1);
      const before = structuredClone(current);
      expect(current.level).toBe(50);
      expect(resolveCapturedFighter(current).stats.health).toBe(capturedEnemyStats(50).health * .65);
      expect(resolveCapturedFighter(current).stats.health).toBeLessThan(resolveFighter('ember', { level: 50, evolution: 3 }).stats.health);
      expect(resolveCapturedFighter({ ...current, level: 120 }).stats.damage).toBeLessThan(enemyCombatStats(120, false).damage);
      expect(current).toEqual(before);
    }
  });
});
