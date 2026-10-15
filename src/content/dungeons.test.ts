import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { dungeonEncounter, isPlayableDungeon, materialDrops, materialDropTable, playableDungeons } from './dungeons';
import { act, actAndAdvanceTurn, actionUnavailable, createDungeonBattle, endTurn, nextWave } from '../game/battle';
import { starters } from './starters';
import { elements, elementalEnemyLevel } from './activities';
import { dungeonArt } from './dungeon-art';
import { readFileSync } from 'node:fs';
import { enemyCombatStats } from './stat-growth';
import { enemyAbilityMultiplier } from './enemy-skills';
import type { ConduitLoadouts } from './conduits';
import { benchmarkTarget, playNativeBenchmark } from '../game/native-benchmark-pilot';

describe('elemental material dungeons', () => {
  it('enables exactly the ten canonical elements and rejects unknown dungeons', () => {
    expect(playableDungeons).toEqual(elements.map((element) => element.id));
    for (const value of ['unknown', '', null, undefined]) expect(isPlayableDungeon(value)).toBe(false);
  });
  it.each(playableDungeons)('%s defines all 35 stage encounters with explicit art availability and level 10-120 scaling', (element) => {
    for (let stage = 1; stage <= 35; stage++) {
      const encounter = dungeonEncounter(element, stage);
      expect(encounter.level).toBe(Math.round(38 + (stage - 1) * 82 / 34));
      if (dungeonArt[element]) {
        expect(encounter.enemy.art).toBeDefined();
        expect(existsSync(resolve('public', 'assets', 'enemies', `${encounter.enemy.art}.png`))).toBe(true);
        if (!encounter.background) throw new Error('Supplied dungeon background is missing.');
        expect(existsSync(resolve('public', 'assets', 'backgrounds', encounter.background))).toBe(true);
      } else {
        expect(encounter.enemy.art).toBeUndefined();
        expect(encounter.background).toBeNull();
      }
      expect(encounter.boss).toBe(stage % 5 === 0);
      expect(encounter.stats.health).toBeGreaterThan(0);
      expect(encounter.abilityMultiplier).toBeGreaterThanOrEqual(1.2);
    }
    for (const stage of [0, 36, NaN, 1.5]) expect(() => dungeonEncounter(element, stage)).toThrow();
    expect(dungeonEncounter(element, 35).stats.health).toBeGreaterThan(dungeonEncounter(element, 5).stats.health);
  });
  it.each(elements.filter((element) => !dungeonArt[element.id]))('$name uses all eight enemies in the existing art prompt pack', (element) => {
    const prompt = readFileSync(resolve('Art', 'dungeons', `${element.dungeon}.md`), 'utf8');
    const names = [...prompt.matchAll(/^### \d+\. (.+)\r?$/gm)].map((match) => match[1].trim());
    const encountered = new Set(Array.from({ length: 35 }, (_, index) => dungeonEncounter(element.id, index + 1).enemy.name));
    expect([...encountered]).toEqual(names);
    expect(encountered.size).toBe(8);
  });
  it.each(playableDungeons)('%s grants only its own materials; final bosses reject unbuilt solo clears', (element) => {
    expect(materialDrops(element, 35, () => 0)).toEqual({
      [`${element}-common`]: 15, [`${element}-uncommon`]: 15, [`${element}-rare`]: 15,
      [`${element}-epic`]: 15, [`${element}-legendary`]: 15, [`${element}-omnic`]: 15,
    });
    for (const stage of [1, 35]) {
      let state = createDungeonBattle(element, stage, 1729, 'ember', stage === 1 ? { level: 38, evolution: 2 } : { level: 105, evolution: 6 });
      state = playNativeBenchmark(state);
      expect(state.phase, `${element} stage ${stage}`).toBe('defeat');
    }
  });
  it('guarantees Seeds, gates each higher rarity exactly and checks probability boundaries', () => {
    expect(materialDrops('infernic', 1, () => 0)).toEqual({ 'infernic-common': 1, 'infernic-uncommon': 1 });
    expect(materialDrops('infernic', 35, () => 0.99)).toEqual({ 'infernic-common': 30 });
    for (const entry of materialDropTable) {
      const stage = Array.from({ length: 35 }, (_, i) => i + 1).find((value) => elementalEnemyLevel(value) >= entry.level)!;
      if (stage > 1) expect(materialDrops('oceanic', stage - 1, () => 0)[`oceanic-${entry.rarity}`]).toBeUndefined();
      expect(materialDrops('oceanic', stage, () => 0)[`oceanic-${entry.rarity}`]).toBeGreaterThanOrEqual(1);
    }
    expect(() => materialDrops('infernic', 6, () => 1)).toThrow();
  });
  it.each(starters)('$name can clear early material stages with Common gear and complementary allies', (starter) => {
    if (!isPlayableDungeon(starter.elementId)) throw new Error('Starter dungeon is unavailable.');
    const roster = [...new Set([starter.id, 'tide', 'sprout', 'ember'] as const)].slice(0, 3);
    const progress = { level: 45, evolution: 2 };
    const teamProgress = Object.fromEntries(roster.map(id => [id, progress]));
    const equipment: ConduitLoadouts = Object.fromEntries(roster.map(id => [id, [
      'vigil-core', 'siegebound-drive', 'bastion-lock', 'parallax-relay',
      'fieldbrace-coupler', 'reserve-torque-crank', 'crosspin-governor', 'precision-escapement',
    ]]));
    for (const stage of [1, 5]) {
      let state = createDungeonBattle(starter.elementId, stage, 1729, starter.id, progress, roster, teamProgress, equipment);
      let turns = 0;
      while (state.phase === 'player' && turns++ < 100) {
        const actor = state.allies.find(ally => ally.hp > 0 && !actionUnavailable(state, ally, 'light'));
        if (!actor) { state = endTurn(state).state; continue; }
        const priorities = actor.id === 'sprout' && state.allies.some(ally => ally.hp > 0 && ally.hp < ally.stats.health * .65)
          ? ['skill2', 'ultimate', 'skill1', 'light'] as const : ['ultimate', 'skill1', 'skill2', 'light'] as const;
        const action = priorities.find(action => !actionUnavailable(state, actor, action));
        if (!action) throw new Error('Early material fixture has no legal action.');
        state = actAndAdvanceTurn(state, actor.id, action, benchmarkTarget(state, actor, action)).state;
      }
      expect(state.phase, `${starter.name} stage ${stage}`).toBe('cleared');
      expect(turns).toBeLessThan(100);
      expect(() => nextWave(state)).toThrow('separate encounters');
    }
  });
  it('preserves final enemy endpoints while increasing loot', () => {
    const encounter = dungeonEncounter('infernic', 35);
    expect(encounter.abilityMultiplier).toBe(enemyAbilityMultiplier(120));
    expect(encounter.level).toBe(120);
    expect(encounter.stats).toEqual(enemyCombatStats(120, true));
    expect(materialDropTable.map((drop) => drop.level)).toEqual([23, 48, 73, 98, 120]);
    expect(materialDrops('infernic', 35, () => 0)).toEqual({
      'infernic-common': 15, 'infernic-uncommon': 15, 'infernic-rare': 15,
      'infernic-epic': 15, 'infernic-legendary': 15, 'infernic-omnic': 15,
    });
  });
  it('uses stronger periodic enemy abilities, including weakening and Defense mitigation', () => {
    const state = createDungeonBattle('infernic', 35, 1729, 'ember', { level: 0, evolution: 1 });
    state.allies[0].hp = state.allies[0].stats.health = 1_000_000;
    state.round = 2;
    const result = endTurn(state);
    expect(result.events.some((event) => event.message.includes('Furnace Strike'))).toBe(true);
    const guarding = structuredClone(state);
    guarding.allies[0].defending = true;
    const damage = result.events.find((event) => event.kind === 'damage')!.amount;
    const guarded = endTurn(guarding).events.find((event) => event.kind === 'damage')!.amount;
    expect(guarded).toBe(Math.max(1, Math.round(damage * 0.9)));
  });
});
