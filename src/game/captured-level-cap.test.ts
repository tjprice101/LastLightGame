import { infusionStageCount } from '../content/activities';
import { describe, expect, it, vi } from 'vitest';
import { capturedEnemyStats, infusionEncounter } from '../content/infusions';
import { enemySkills } from '../content/enemy-skills';
import { creatures } from '../content/creatures';
import { capturedLevelCap, capturedProgress, createCreatureCopy, resolveCapturedFighter, validateCapturedCharacters } from './character-instances';
import { ACCOUNT_KEY, emptyAccount, levelCapturedCharacter, levelCharacterToMaximum, loadAccount, maxLevelPlan, saveAccount, saveAccountRewards } from './account';
import { SAVE_KEY, type ProfileStorage } from './profile';
import { createInfusionBattle, endTurn } from './battle';
import { freshGame, publicGame, resolveOperation } from '../../supabase/functions/game-operation/engine';

function storage() {
  const items = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  const saved: ProfileStorage = {
    getItem: key => items.get(key) ?? null,
    setItem: (key, value) => { items.set(key, value); },
    removeItem: key => { items.delete(key); },
  };
  return saved;
}
const entropy = { seed: () => 1, random: () => .9, uuid: () => crypto.randomUUID() };

describe('captured Elemental-Devourer level 60 ceiling', () => {
  it('caps every capturable form and duplicate award while preserving source-stage abilities and identity', () => {
    expect(capturedLevelCap).toBe(60);
    for (const creature of creatures.filter(creature => creature.mode && creature.mode !== 'machines')) {
      const stage = creature.stages[0];
      const encounter = infusionEncounter(creature.mode!, stage);
      const duplicate = creature.mode === 'roses' && encounter.level > 120;
      const copy = createCreatureCopy(creature.id, stage, duplicate ? 80 : undefined, duplicate ? 'banner-duplicate' : undefined);
      expect(copy.level).toBe(Math.min(60, duplicate ? 80 : encounter.level));
      expect(copy.creatureId).toBe(creature.id);
      expect(copy.capturedStage).toBe(stage);
      expect(copy.skills).toEqual(enemySkills(encounter.level, encounter.boss, encounter.ability, encounter.abilityMultiplier));
      expect(capturedProgress(copy).level).toBeLessThanOrEqual(60);
    }
    expect(createCreatureCopy('infusion:treasury:5', 22, 50, 'banner-duplicate').level).toBe(50);
    expect(createCreatureCopy('infusion:heavens:0', 1, 59).level).toBe(59);
  });

  it.each(['heavens', 'abyss', 'treasury', 'sanctuary', 'roses'] as const)(
    'caps actual %s captures in the reward event and atomic persisted receipt, retaining hostile skills', mode => {
      const stage = mode === 'roses' ? 23 : infusionStageCount(mode);
      const state = createInfusionBattle(mode, stage, 1, 'ember', { level: 105, evolution: 6 });
      expect(state.enemies[0].level).toBeGreaterThan(60);
      state.enemies.forEach(enemy => { enemy.hp = 1; enemy.burn = { damage: 1, turns: 1 }; });
      const result = endTurn(state);
      const captures = result.events.filter(event => event.capture);
      expect(captures.length).toBeGreaterThan(0);
      expect(captures.every(event => event.capture?.level === 60)).toBe(true);
      const saved = storage();
      const write = vi.spyOn(saved, 'setItem');
      const account = saveAccountRewards(saved, result, `cap-${mode}`);
      expect(write).toHaveBeenCalledTimes(1);
      expect(account.capturedCharacters).toHaveLength(captures.length);
      for (const copy of account.capturedCharacters ?? []) {
        expect(copy.level).toBe(60);
        expect(copy.skills).toEqual(state.enemies[0].enemySkills);
      }
      expect(saveAccountRewards(saved, result, `cap-${mode}`)).toEqual(account);
      expect(write).toHaveBeenCalledTimes(1);
      const forged = structuredClone(result);
      forged.events.find(event => event.capture)!.capture!.level = 61;
      expect(() => saveAccountRewards(saved, forged, 'forged-cap')).toThrow('Invalid captured');
      expect(write).toHaveBeenCalledTimes(1);
    });

  it('normalizes old explicit and metadata-free saves without load writes, refunds or unrelated data loss', () => {
    const saved = storage();
    const copy = createCreatureCopy('infusion:abyss:5', infusionStageCount('abyss'));
    const legacy = { ...copy, instanceId: `capture:${crypto.randomUUID()}` };
    const { level: _level, capturedStage: _stage, skills: _skills, ...metadataFree } = legacy;
    const account = emptyAccount();
    account.characters.ember = { level: 90, evolution: 6 };
    account.capturedCharacters = [{ ...copy, level: 120, locked: true }, metadataFree];
    account.conduits = { 'vigil-core': 1 };
    account.conduitEquipment = { [copy.instanceId]: ['vigil-core', null, null, null, null, null, null, null] };
    account.squad = [copy.instanceId, 'ember'];
    account.fractalis = 100000;
    account.materials = { 'chaotic-common': 999 };
    const raw = JSON.stringify(account);
    saved.setItem(ACCOUNT_KEY, raw);
    const write = vi.spyOn(saved, 'setItem');
    const loaded = loadAccount(saved);
    expect(loaded).toEqual({ ...account, capturedCharacters: [{ ...copy, level: 60, locked: true }, metadataFree] });
    expect(capturedProgress(metadataFree).level).toBe(60);
    expect(resolveCapturedFighter(metadataFree).stats).toEqual(resolveCapturedFighter(copy).stats);
    expect(write).not.toHaveBeenCalled();
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    expect(() => levelCapturedCharacter(saved, copy.instanceId, 60)).toThrow('Maximum');
    expect(() => levelCapturedCharacter(saved, copy.instanceId, 120)).toThrow('changed');
    const plan = maxLevelPlan(loaded, copy.instanceId);
    expect(plan).toMatchObject({ currentLevel: 60, targetLevel: 60, cap: 60, cost: { fractalis: 0, materials: {} } });
    expect(() => levelCharacterToMaximum(saved, plan)).toThrow('No additional levels');
    expect(write).not.toHaveBeenCalled();
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    saveAccount(saved, loaded);
    expect(JSON.parse(saved.getItem(ACCOUNT_KEY)!).capturedCharacters[0].level).toBe(60);
    for (const invalid of [0, 121, 59.5, NaN]) {
      expect(() => validateCapturedCharacters([{ ...copy, level: invalid }])).toThrow();
    }
  });

  it('caps authoritative reads and resumed run snapshots without healing, resetting turns or mutating input', () => {
    let game = resolveOperation(freshGame('tester'), { kind: 'bootstrap', starterId: 'ember' }, entropy).game;
    const copy = createCreatureCopy('infusion:abyss:5', infusionStageCount('abyss'));
    game.account.capturedCharacters = [copy];
    game.account.squad = [copy.instanceId];
    game = resolveOperation(game, { kind: 'enter', activity: { kind: 'training' } }, entropy).game;
    game.account.capturedCharacters![0].level = 120;
    const run = game.run!;
    run.captures[0].level = 120;
    const unit = run.session.state.allies[0];
    unit.level = 120;
    unit.captured!.level = 120;
    const beforeStats = capturedEnemyStats(120);
    const afterStats = capturedEnemyStats(60);
    for (const stat of ['health', 'damage', 'defense'] as const) {
      const ratio = beforeStats[stat] / afterStats[stat];
      unit.stats[stat] *= ratio;
      unit.kit!.stats[stat] *= ratio;
    }
    unit.hp = unit.stats.health / 2;
    unit.shield = unit.stats.health / 4;
    unit.shatter = 77;
    unit.spent = true;
    unit.readyRound.ultimate = 6;
    const before = structuredClone(game);
    const publicView = publicGame(game, 3);
    expect(publicView.account.capturedCharacters![0].level).toBe(60);
    expect(publicView.session!.state.allies[0].level).toBe(60);
    const read = resolveOperation(game, { kind: 'read' }, entropy);
    const capped = read.game.run!.session.state.allies[0];
    expect(capped.level).toBe(60);
    expect(capped.captured!.level).toBe(60);
    expect(capped.stats.health).toBeCloseTo(resolveCapturedFighter(copy).stats.health);
    expect(capped.hp / capped.stats.health).toBeCloseTo(.5);
    expect(capped.shield / capped.stats.health).toBeCloseTo(.25);
    expect(capped.shatter).toBe(77);
    expect(capped.spent).toBe(true);
    expect(capped.readyRound.ultimate).toBe(6);
    expect(capped.kit!.abilities).toEqual(before.run!.session.state.allies[0].kit!.abilities);
    expect(read.game.run!.captures[0].level).toBe(60);
    expect(resolveOperation(read.game, { kind: 'read' }, entropy).game).toEqual(read.game);
    expect(() => resolveOperation(game, { kind: 'levelCaptured', id: copy.instanceId, expectedLevel: 60 }, entropy)).toThrow('Maximum');
    expect(game).toEqual(before);
  });
});
