import { describe, expect, it } from 'vitest';
import { enemySkills, scheduledEnemySkill } from './enemy-skills';
import { createBattle, createDungeonBattle, createInfusionBattle, endTurn, nextWave } from '../game/battle';
import { playableDungeons } from './dungeons';

describe('level-dependent enemy skill kits', () => {
  it('has exactly one below50 and two from50, with one boss ultimate only in two-skill kits', () => {
    for (let level = 1; level <= 120; level++) for (const boss of [false, true]) {
      const skills = enemySkills(level, boss, 'Thornstrike', 1.5);
      expect(skills).toHaveLength(level < 50 ? 1 : 2);
      expect(skills.filter((skill) => skill.action === 'ultimate')).toHaveLength(level >= 50 && boss ? 1 : 0);
      if (level >= 50) expect(skills[1].multiplier).toBeGreaterThan(skills[0].multiplier);
    }
    for (const level of [0, 1.5, NaN]) expect(() => enemySkills(level, false, 'Strike', 1.2)).toThrow();
    expect(() => enemySkills(50, false, '', 1.2)).toThrow();
    expect(() => scheduledEnemySkill([], 0)).toThrow();
  });

  it('schedules one action per turn and prioritizes second skill/ultimate at collisions', () => {
    const normal = enemySkills(50, false, 'Strike', 1.2);
    expect(scheduledEnemySkill(normal, 1)).toBeUndefined();
    expect(scheduledEnemySkill(normal, 3)?.action).toBe('skill1');
    expect(scheduledEnemySkill(normal, 5)?.action).toBe('skill2');
    expect(scheduledEnemySkill(normal, 15)?.action).toBe('skill2');
    const boss = enemySkills(50, true, 'Strike', 1.2);
    expect(scheduledEnemySkill(boss, 2)?.action).toBe('skill1');
    expect(scheduledEnemySkill(boss, 6)?.action).toBe('ultimate');
    expect(scheduledEnemySkill(boss, 6)?.multiplier).toBe(2.6);
  });

  it('wires all elemental stages, both modes and the Adventure49/50 boundary, including early enemies', () => {
    const progress = { level: 105, evolution: 6 };
    for (const element of playableDungeons) for (let stage = 1; stage <= 35; stage++) {
      const state = createDungeonBattle(element, stage, 1, 'ember', progress);
      for (const enemy of state.enemies) expect(enemy.enemySkills).toHaveLength(enemy.level! < 50 ? 1 : 2);
    }
    for (const mode of ['heavens', 'abyss'] as const) for (let stage = 1; stage <= 35; stage++) {
      const state = createInfusionBattle(mode, stage, 1, 'ember', progress);
      expect(state.enemies[0].enemySkills).toHaveLength(2);
      expect(state.enemies[0].enemySkills?.[1].action).toBe(stage % 5 === 0 ? 'ultimate' : 'skill2');
    }
    let state = createBattle();
    for (let wave = 1; wave < 50; wave++) {
      expect(state.enemies.every((enemy) => enemy.enemySkills?.length === 1)).toBe(true);
      state.phase = 'cleared';
      state = nextWave(state).state;
    }
    expect(state.enemies.every((enemy) => enemy.level === 50 && enemy.enemySkills?.length === 2)).toBe(true);
  });

  it('emits named real skills and heavy boss ultimates, while retaining one damage resolution and seed determinism', () => {
    const initial = createInfusionBattle('abyss', 35, 1729, 'tide', { level: 105, evolution: 6 });
    const health = initial.enemies[0].hp;
    const damage: number[] = [];
    for (const round of [1, 2, 6]) {
      const state = structuredClone(initial);
      state.round = round;
      state.enemies[0].stats.crit = 0;
      const result = endTurn(state);
      const attacks = result.events.filter((event) => event.kind === 'attack');
      expect(attacks).toHaveLength(1);
      expect(attacks[0].action).toBe(round === 1 ? 'light' : round === 2 ? 'skill1' : 'ultimate');
      if (round > 1) {
        expect(attacks[0].abilityName).toContain('Cosmic Wrath');
        expect(attacks[0].enhancedAttack).toBe(true);
      }
      damage.push(result.events.find((event) => event.kind === 'damage')!.amount);
      expect(result).toEqual(endTurn(state));
      expect(result.state.enemies[0].hp).toBe(health);
    }
    expect(damage[2]).toBeGreaterThan(damage[1]);
    expect(damage[1]).toBeGreaterThan(damage[0]);
  });
});
