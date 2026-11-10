import { describe, expect, it } from 'vitest';
import { maximumEncounterSize, ordinaryRewardDrops, stagedEncounterSize, storyEncounterMaximum, trainingRewardDrops, trainingWaveSize, isRewardCarrier } from './encounter-size';

describe('enemy encounter sizing', () => {
  it('keeps bosses solo and varies ordinary formations from two to six through long stages', () => {
    for (const stages of [15, 25, 35, 75, 150]) {
      const sizes = Array.from({ length: stages }, (_, index) => {
        const stage = index + 1;
        const boss = stage % 5 === 0;
        const size = stagedEncounterSize(stage, stages, boss);
        expect(size).toBeGreaterThanOrEqual(boss ? 1 : ordinaryRewardDrops);
        expect(size).toBeLessThanOrEqual(maximumEncounterSize);
        if (boss) expect(size).toBe(1);
        return size;
      });
      expect(sizes.some(size => size === maximumEncounterSize)).toBe(true);
      expect(sizes.some(size => size > 2)).toBe(true);
    }
  });

  it('keeps Training at three to six enemies while cycling past the original species', () => {
    expect(trainingWaveSize(1)).toBe(trainingRewardDrops);
    expect(trainingWaveSize(120)).toBe(maximumEncounterSize);
    for (let wave = 1; wave <= 120; wave++) {
      expect(trainingWaveSize(wave)).toBeGreaterThanOrEqual(trainingRewardDrops);
      expect(trainingWaveSize(wave)).toBeLessThanOrEqual(maximumEncounterSize);
    }
  });

  it('keeps solo-starter Story skirmishes to two enemies while preserving solo bosses', () => {
    for (let stage = 1; stage <= 120; stage++) {
      const size = stagedEncounterSize(stage, 120, stage % 5 === 0, ordinaryRewardDrops, storyEncounterMaximum);
      expect(size).toBeLessThanOrEqual(storyEncounterMaximum);
      if (stage % 5 === 0) expect(size).toBe(1);
    }
  });

  it('preserves the previous number of reward rolls and spreads carriers across larger formations', () => {
    for (let size = 1; size <= maximumEncounterSize; size++) {
      for (let drops = 1; drops <= trainingRewardDrops; drops++) {
        const carriers = Array.from({ length: size }, (_, index) => index)
          .filter(index => isRewardCarrier(index, size, drops));
        expect(carriers).toHaveLength(Math.min(size, drops));
        for (let i = 1; i < carriers.length; i++) {
          expect(carriers[i] - carriers[i - 1]).toBeLessThanOrEqual(Math.ceil(size / Math.min(size, drops)));
        }
      }
    }
    expect(() => isRewardCarrier(-1, 2, 1)).toThrow('Invalid reward carrier query.');
  });
});
