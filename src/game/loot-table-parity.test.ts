import { describe, expect, it } from 'vitest';
import { creatureLoot, getCreature } from '../content/creatures';
import { infusionStageCount, type InfusionModeId } from '../content/activities';
import { playableDungeons } from '../content/dungeons';
import { elementalWars, warLoot } from '../content/elemental-war';
import { act, createBattle, createDungeonBattle, createInfusionBattle, createStoryBattle, createWarBattle, type BattleState } from './battle';

const progress = { level: 105, evolution: 6 };
const modes: InfusionModeId[] = ['heavens', 'abyss', 'treasury', 'sanctuary', 'roses', 'machines'];
const sequences = [
  { name: 'Training', stages: 120, create: (level: number) => {
    const state = createBattle(1729, ['ember'], { ember: progress });
    state.wave = level;
    state.enemies.forEach(enemy => { enemy.level = level; });
    return state;
  } },
  { name: 'Story', stages: 150, create: (stage: number) => createStoryBattle(stage, 1729, 'ember', progress) },
  ...playableDungeons.map(element => ({ name: element, stages: 35,
    create: (stage: number) => createDungeonBattle(element, stage, 1729, 'ember', progress) })),
  ...modes.map(mode => ({ name: mode, stages: infusionStageCount(mode),
    create: (stage: number) => createInfusionBattle(mode, stage, 1729, 'ember', progress) })),
];

function kill(state: BattleState, seed: number) {
  state.allies[0].shatter = 100;
  state.enemies.forEach(enemy => { enemy.hp = 1; enemy.stats.defense = 0; });
  state.rewardSeed = seed;
  state.conduitSeed = seed;
  state.componentSeed = seed;
  state.masterChestSeed = seed;
  return act(state, 'ember', 'skill2', state.enemies[0].id);
}

describe('live enemy drops match published per-stage loot tables', () => {
  it.each(sequences)('checks every enemy and stage in $name, including boosted bosses', ({ stages, create }) => {
    for (let stage = 1; stage <= stages; stage++) for (const seed of [0, 1, 1729, 0xffffffff]) {
      const state = create(stage);
      const result = kill(state, seed);
      const rewards = result.events.filter(event => event.kind === 'reward');
      expect(rewards).toHaveLength(state.enemies.length);
      for (const reward of rewards) {
        const enemy = state.enemies.find(unit => unit.id === reward.source)!;
        const table = creatureLoot(getCreature(enemy.creatureId!), stage).filter(drop => !drop.note?.includes('Account first clear'));
        const actual: Record<string, number> = { fractalis: reward.amount, ...reward.materials, ...reward.conduits,
          ...(reward.lycalis ? { lycalis: reward.lycalis } : {}),
          ...(reward.mechanicalComponents ? { 'mechanical-components': reward.mechanicalComponents } : {}),
          ...(reward.masterChests ? { 'grand-master-chest': reward.masterChests } : {}) };
        for (const [id, amount] of Object.entries(actual)) {
          const possibilities = table.filter(drop => drop.id === id);
          expect(possibilities.some(drop => amount >= drop.minimum && amount <= drop.maximum), `${enemy.name}, stage ${stage}: ${id} x${amount}`).toBe(true);
        }
        for (const drop of table.filter(drop => drop.chance === 1)) expect(actual[drop.id], `${enemy.name}, stage ${stage}: guaranteed ${drop.id}`).toBeDefined();
        if (seed === 0 && state.story) expect(reward.materials![`${enemy.element}-uncommon`]).toBeDefined();
      }
    }
  });

  it.each(elementalWars)('checks every $character War boss against its exact currency table', ({ character }) => {
    for (let stage = 1; stage <= 10; stage++) {
      const table = warLoot(stage);
      const state = createWarBattle(character, stage, 1729, 'ember', progress);
      state.lycalisSeed = 1;
      state.recruitmentSeed = 1;
      const reward = kill(state, 0).events.find(event => event.kind === 'reward')!;
      expect(reward.amount).toBe(table.fractalis.minimum);
      expect(reward.lycalis).toBe(table.lycalis.quantity);
      expect(reward.recruitment).toBe(stage === 10 ? character : undefined);
      expect(reward.materials).toBeUndefined();
      expect(reward.capture).toBeUndefined();
    }
  });
});
