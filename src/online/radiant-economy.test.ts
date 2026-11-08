import { describe, expect, it } from 'vitest';
import { measureRadiantEconomyCycle } from '../../tools/radiant-economy-study';
import { pressureStudyLoadouts } from '../../tools/radiant-pressure-study';
import { storyRules } from '../content/story';
import type { RadiantPressureAnchor } from '../game/radiant-pressure-encounters';

const anchor: RadiantPressureAnchor = { id: 'story', family: 'story', position: 'early',
  activity: { kind: 'story', stage: 1 } };
describe('fresh-entry economy uses accepted authority actions and exact output shapes', () => {
  it.each([1, 1729, 104729])('developed solo %i pays replay bonus separately and exit preserves rewards', seed => {
    const account = pressureStudyLoadouts(['ember'], 105, 'empty').account;
    account.squad = ['ember']; account.storyCompleted = storyRules.stages;
    const raw = structuredClone(account);
    const result = measureRadiantEconomyCycle(account, anchor, seed);
    expect(result.outcome).toBe('victory');
    expect(result.full.damagePrismatica).toBe(result.budget);
    expect(result.full.bonusPrismatica).toBe(150); expect(result.full.nullPrismatica).toBe(0);
    expect(result.full.totalPrismatica).toBe(result.budget + 150);
    expect(result.requests).toBe(result.actions + 2);
    expect(result.full.prismaticaPerRequest).toBe(result.full.totalPrismatica / result.requests);
    expect(result.exit).toEqual({ prismatica: 0, rewardEvents: 0, disposed: true });
    expect(account).toEqual(raw);
  });
  it('partial bounded cycle reports timeout, actual partial payouts and zero repeated-prefix gains', () => {
    const account = pressureStudyLoadouts(['ember'], 0, 'empty').account;
    account.squad = ['ember']; account.storyCompleted = storyRules.stages;
    const result = measureRadiantEconomyCycle(account, { ...anchor,
      activity: { kind: 'story', stage: storyRules.regionStages } }, 1729, { maximumActions: 2 });
    expect(result.outcome).toBe('timeout'); expect(result.actions).toBe(2);
    expect(result.full.damagePrismatica).toBeLessThan(result.budget);
    expect(result.full.bonusPrismatica).toBe(0);
    expect(result.bestPartial).not.toBeNull();
    expect(result.repeatPrefix).toMatchObject({ attempts: 3, additionalPrismatica: 0, additionalLoot: 0 });
    expect(result.repeatPrefix!.requests).toBe(3 * (2 + result.bestPartial!.actions));
  });
  it.each([0, -1, Infinity, 1.5, 6001])('rejects invalid finite action bound %s without mutation', maximumActions => {
    const account = pressureStudyLoadouts(['ember'], 0, 'empty').account;
    account.squad = ['ember'];
    expect(() => measureRadiantEconomyCycle(account, anchor, 1, { maximumActions })).toThrow('bound');
  });
  it.each(['ember', 'tide', 'sprout'] as const)('%s free Normal-only training is an independent policy control', id => {
    const account = pressureStudyLoadouts([id], 0, 'empty').account;
    account.squad = [id];
    const result = measureRadiantEconomyCycle(account, { ...anchor, activity: { kind: 'training' } }, 1729,
      { policy: 'normal-only' });
    expect(result.policy).toBe('normal-only');
    expect(result.full.bonusPrismatica).toBe(0); expect(result.full.nullPrismatica).toBe(0);
    expect(result.outcome).toBe('victory');
    expect(result.full.damagePrismatica).toBe(result.budget);
    expect(result.firstClearSensitive).toBe(false);
  });
  it('first Story acquisition and repeat farming are explicitly different measurements', () => {
    const account = pressureStudyLoadouts(['ember'], 0, 'empty').account;
    account.squad = ['ember'];
    const first = measureRadiantEconomyCycle(account, anchor, 1729);
    expect(first.firstClearSensitive).toBe(true);
    expect(first.full.nullPrismatica).toBe(2);
    account.storyCompleted = 1;
    const replay = measureRadiantEconomyCycle(account, anchor, 1729);
    expect(replay.firstClearSensitive).toBe(false);
    expect(replay.full.nullPrismatica).toBe(0);
    expect(replay.full.damagePrismatica).toBe(first.full.damagePrismatica);
  });
  it('denies inaccessible or corrupt fixtures instead of emitting a success-shaped zero rate', () => {
    const account = pressureStudyLoadouts(['ember'], 0, 'empty').account;
    account.squad = ['ember'];
    expect(() => measureRadiantEconomyCycle(account, { ...anchor,
      activity: { kind: 'dungeon', element: 'infernic', stage: 1 } }, 1)).toThrow('Activity locked.');
    account.squad = ['capture:missing'];
    expect(() => measureRadiantEconomyCycle(account, anchor, 1)).toThrow('Invalid saved squad.');
  });
});
