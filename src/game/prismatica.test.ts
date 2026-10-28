import { describe, expect, it, vi } from 'vitest';
import { activityPrismaticaDrop, linearPrismaticaDrop } from '../content/prismatica';
import { storyRules, storyCompletionReward } from '../content/story';
import { creatureLoot, getCreature } from '../content/creatures';
import { elementalWars } from '../content/elemental-war';
import { infusionStageCount } from '../content/activities';
import { createBattle, createDungeonBattle, createInfusionBattle, createStoryBattle, createWarBattle, endTurn, type BattleState } from './battle';
import { ACCOUNT_KEY, emptyAccount, saveAccountRewards } from './account';
import { SAVE_KEY, type ProfileStorage } from './profile';

const progress = { level: 105, evolution: 6 };
const curves = [
  { name: 'dungeon', count: 35, opening: [5, 10], final: [300, 600],
    create: (stage: number) => createDungeonBattle('infernic', stage, 1729, 'ember', progress) },
  ...(['heavens', 'abyss', 'treasury', 'sanctuary', 'roses', 'machines'] as const).map((mode, index) => ({
    name: mode, count: infusionStageCount(mode),
    opening: [[6, 12], [6, 12], [133, 266], [7, 14], [9, 18], [5, 10]][index],
    final: [[500, 1000], [500, 1000], [30000, 60000], [300, 600], [750, 1500], [500, 1000]][index],
    create: (stage: number) => createInfusionBattle(mode, stage, 1729, 'ember', progress),
  })),
  { name: 'Story', count: storyRules.stages, opening: [8, 16], final: [750, 1500],
    create: (stage: number) => createStoryBattle(stage, 1729, 'ember', progress) },
  ...elementalWars.map(war => ({ name: war.character, count: 10, opening: [1500, 2500], final: [30000, 45000],
    create: (stage: number) => createWarBattle(war.character, stage, 1729, 'ember', progress) })),
];

function storage() {
  const account = emptyAccount();
  account.storyCompleted = storyRules.stages;
  account.infusionStages = { heavens: 15, abyss: 15, treasury: 25, sanctuary: 25, roses: 35, machines: 35 };
  account.warStages = { nerithe: 10, orvella: 10, vaelor: 10 };
  const values = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}'], [ACCOUNT_KEY, JSON.stringify(account)]]);
  const saved: ProfileStorage = { getItem: key => values.get(key) ?? null,
    setItem: vi.fn((key, value) => { values.set(key, value); }), removeItem: key => { values.delete(key); } };
  return saved;
}

function clear(state: BattleState) {
  state.enemies.forEach(enemy => { enemy.hp = 1; enemy.burn = { damage: 1, turns: 1 }; });
  return endTurn(state);
}

describe('D-428 smooth Prismatica without currency boss multipliers', () => {
  it.each(curves)('$name agrees across every stage, actual kills, Collections and one atomic save', curve => {
    let previous = curve.opening;
    for (let stage = 1; stage <= curve.count; stage++) {
      const state = curve.create(stage);
      const progress = (stage - 1) / (curve.count - 1);
      const expected = curve.opening.map((opening, index) => Math.round(opening + (curve.final[index] - opening) * progress));
      const drop = activityPrismaticaDrop(state, state.enemies[0].level!);
      expect(drop).toEqual({ minimum: expected[0], maximum: expected[1], chance: 1 });
      expected.forEach((value, index) => expect(value - previous[index]).toBeGreaterThanOrEqual(0));
      expect(drop).not.toHaveProperty('quantityMultiplier');
      previous = expected;
      const result = clear(state);
      expect(result.state.phase).toBe('cleared');
      const rewards = result.events.filter(event => event.kind === 'reward');
      expect(rewards).toHaveLength(state.enemies.length);
      rewards.forEach(reward => {
        expect(reward.amount).toBeGreaterThanOrEqual(drop.minimum);
        expect(reward.amount).toBeLessThanOrEqual(drop.maximum);
      });
      if (!state.war) expect(creatureLoot(getCreature(state.enemies[0].creatureId!), stage)
        .find(entry => entry.id === 'fractalis')).toEqual({ id: 'fractalis', ...drop });
      const saved = storage(), before = saved.getItem(ACCOUNT_KEY);
      const forged = structuredClone(result);
      forged.events.find(event => event.kind === 'reward')!.amount = drop.maximum + 1;
      expect(() => saveAccountRewards(saved, forged, 'forged')).toThrow();
      expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
      expect(saved.setItem).not.toHaveBeenCalled();
      // Interior integers, not multiples of five, are legal at final bosses too.
      result.events.find(event => event.kind === 'reward')!.amount = drop.minimum + 1;
      const earned = rewards.reduce((sum, reward) => sum + reward.amount!, 0);
      const account = saveAccountRewards(saved, result, `${curve.name}-${stage}`);
      expect(account.fractalis).toBe(earned +
        (state.story ? storyCompletionReward.fractalis : 0));
      expect(saveAccountRewards(saved, result, `${curve.name}-${stage}`)).toEqual(account);
      expect(saved.setItem).toHaveBeenCalledOnce();
    }
  });

  it('grows Training through level120 and rejects malformed progression inputs', () => {
    for (let level = 1; level <= 120; level++) {
      const state = createBattle(1729, ['ember'], { ember: progress });
      state.wave = level;
      state.enemies.forEach(enemy => { enemy.level = level; });
      const drop = activityPrismaticaDrop(state, level);
      expect(drop).toEqual({ minimum: Math.round(5 + 295 * (level - 1) / 119),
        maximum: Math.round(10 + 590 * (level - 1) / 119), chance: 1 });
      expect(creatureLoot(getCreature(state.enemies[0].creatureId!), level).find(entry => entry.id === 'fractalis'))
        .toEqual({ id: 'fractalis', ...drop });
      const result = clear(state), saved = storage();
      const rewards = result.events.filter(event => event.kind === 'reward');
      rewards.forEach(reward => {
        expect(reward.amount).toBeGreaterThanOrEqual(drop.minimum);
        expect(reward.amount).toBeLessThanOrEqual(drop.maximum);
      });
      const account = saveAccountRewards(saved, result, `training-${level}`);
      expect(account.fractalis).toBe(rewards.reduce((sum, reward) => sum + reward.amount!, 0));
      expect(saveAccountRewards(saved, result, `training-${level}`)).toEqual(account);
      expect(saved.setItem).toHaveBeenCalledOnce();
    }
    for (const invalid of [0, -1, 1.5, NaN, Infinity, 121]) {
      expect(() => activityPrismaticaDrop({}, invalid)).toThrow('Prismatica');
      expect(() => linearPrismaticaDrop(invalid, 120, [5, 10], [300, 600])).toThrow('Prismatica');
    }
  });
});
