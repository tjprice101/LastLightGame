import { describe, expect, it, vi } from 'vitest';
import { infusionEncounter } from '../content/infusions';
import { enemySkills } from '../content/enemy-skills';
import { creatures } from '../content/creatures';
import { capturedLevelCost, capturedProgress, createCreatureCopy, resolveCapturedFighter, validateCapturedCharacters } from './character-instances';
import { ACCOUNT_KEY, emptyAccount, loadAccount, maxLevelPlan, saveAccountRewards } from './account';
import { SAVE_KEY, type ProfileStorage } from './profile';
import { createInfusionBattle, endTurn } from './battle';

function storage() {
  const items = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  const saved: ProfileStorage = {
    getItem: key => items.get(key) ?? null,
    setItem: (key, value) => { items.set(key, value); },
    removeItem: key => { items.delete(key); },
  };
  return saved;
}

describe('captured Elemental-Devourer levels have no limit', () => {
  it('keeps the defeated level for every capturable form while preserving source-stage abilities and identity', () => {
    for (const creature of creatures.filter(creature => creature.mode && creature.mode !== 'machines')) {
      const stage = creature.stages[0];
      const encounter = infusionEncounter(creature.mode!, stage);
      const duplicate = creature.mode === 'roses' && encounter.level > 120;
      const copy = createCreatureCopy(creature.id, stage, duplicate ? 80 : undefined, duplicate ? 'banner-duplicate' : undefined);
      expect(copy.level).toBe(duplicate ? 80 : encounter.level);
      expect(copy.capturedStage).toBe(stage);
      expect(copy.skills).toEqual(enemySkills(encounter.level, encounter.boss, encounter.ability, encounter.abilityMultiplier));
    }
  });

  it.each(['heavens', 'abyss', 'treasury', 'sanctuary', 'roses'] as const)(
    'records actual %s capture levels in the reward event and atomic receipt', mode => {
      const stage = mode === 'roses' ? 23 : mode === 'heavens' || mode === 'abyss' ? 35 : 25;
      const state = createInfusionBattle(mode, stage, 1, 'ember', { level: 105, evolution: 6 });
      const level = state.enemies[0].level;
      expect(level).toBeGreaterThan(60);
      state.enemies.forEach(enemy => { enemy.hp = 1; enemy.burn = { damage: 1, turns: 1 }; });
      const result = endTurn(state);
      const captures = result.events.filter(event => event.capture);
      expect(captures.length).toBeGreaterThan(0);
      expect(captures.every(event => event.capture?.level === level)).toBe(true);
      const saved = storage();
      const write = vi.spyOn(saved, 'setItem');
      const account = saveAccountRewards(saved, result, `uncapped-${mode}`);
      expect(write).toHaveBeenCalledTimes(1);
      for (const copy of account.capturedCharacters ?? []) expect(copy.level).toBe(level);
      const forged = structuredClone(result);
      forged.events.find(event => event.capture)!.capture!.level = level! + 1;
      expect(() => saveAccountRewards(saved, forged, 'forged-level')).toThrow('Invalid captured');
    });

  it('loads high saved levels unchanged and keeps leveling beyond them', () => {
    const saved = storage();
    const copy = createCreatureCopy('infusion:abyss:5', 35);
    const account = emptyAccount();
    account.characters.ember = { level: 90, evolution: 6 };
    account.capturedCharacters = [{ ...copy, level: 500 }];
    account.fractalis = 10_000_000;
    account.materials = Object.fromEntries(['common', 'uncommon', 'rare', 'epic', 'legendary', 'omnic'].map(tier => [`chaotic-${tier}`, 999_999]));
    saved.setItem(ACCOUNT_KEY, JSON.stringify(account));
    const loaded = loadAccount(saved);
    expect(loaded.capturedCharacters![0].level).toBe(500);
    expect(capturedProgress(loaded.capturedCharacters![0]).level).toBe(500);
    expect(resolveCapturedFighter(loaded.capturedCharacters![0]).stats.health)
      .toBeGreaterThan(resolveCapturedFighter({ ...copy, level: 120 }).stats.health);
    expect(capturedLevelCost(loaded.capturedCharacters![0]).fractalis).toBeGreaterThan(0);
    expect(maxLevelPlan(loaded, copy.instanceId).targetLevel).toBeGreaterThan(500);
    for (const invalid of [0, 59.5, NaN]) expect(() => validateCapturedCharacters([{ ...copy, level: invalid }])).toThrow();
  });
});
