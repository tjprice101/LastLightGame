import { describe, expect, it, vi } from 'vitest';
import { dungeonStageCount, elements, infusionModeStageCount, migratePreviousInfusionStage } from '../content/activities';
import { materialLoot, dungeonFractalisDrop, materialBrackets } from '../content/dungeons';
import { infusionEncounter, infusionLoot } from '../content/infusions';
import { enemySkills } from '../content/enemy-skills';
import { ACCOUNT_KEY, emptyAccount, loadAccount, saveAccount, saveAccountRewards, setMachineLootFocus, validateAccount } from './account';
import { createDungeonBattle, createInfusionBattle, endTurn } from './battle';
import { creatureLoot, getCreature } from '../content/creatures';
import { capturedProgress, resolveCapturedFighter } from './character-instances';
import { freshGame, publicGame, resolveOperation } from '../../supabase/functions/game-operation/engine';
import { SAVE_KEY, type ProfileStorage } from './profile';

const modes = ['heavens', 'abyss'] as const;
const entropy = { seed: () => 1729, random: () => .5, uuid: () => crypto.randomUUID() };
function storage(raw: string): ProfileStorage {
  const items = new Map([[ACCOUNT_KEY, raw], [SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  return { getItem: key => items.get(key) ?? null, setItem: (key, value) => { items.set(key, value); },
    removeItem: key => { items.delete(key); } };
}
function historicalCopy(mode: typeof modes[number], stage: number) {
  const encounter = infusionEncounter(mode, stage, 'caps', 25);
  return { instanceId: `capture:${crypto.randomUUID()}`, creatureId: `infusion:${mode}:${encounter.tier}`, locked: true,
    level: Math.min(60, encounter.level), capturedStage: stage,
    skills: enemySkills(encounter.level, encounter.boss, encounter.ability, encounter.abilityMultiplier) };
}

describe('D-425 material rewards and historical compatibility', () => {
  it('grows all dungeon materials and Prismatica linearly with no final-boss boost', () => {
    const endpoints = [[10, 12], [7, 8], [6, 7], [4, 5], [3, 4], [2, 3]];
    const unlocks = [1, 1, 6, 12, 19, 25];
    expect(materialBrackets.map(bracket => bracket.firstStage)).toEqual(unlocks);
    for (const element of elements) for (let stage = 1; stage <= dungeonStageCount; stage++) {
      const drops = materialLoot(element.id, stage);
      expect(drops).toHaveLength(unlocks.filter(first => stage >= first).length);
      drops.forEach((drop, index) => {
        const progress = (stage - unlocks[index]) / (35 - unlocks[index]);
        const [minimum, maximum] = endpoints[index];
        expect(drop).toMatchObject({ chance: 1, minimum: Math.round(1 + (minimum - 1) * progress),
          maximum: Math.round(2 + (maximum - 2) * progress) });
        expect(drop.quantityMultiplier).toBeUndefined();
        if (stage === unlocks[index]) expect([drop.minimum, drop.maximum]).toEqual([1, 2]);
        if (stage > unlocks[index]) {
          const previous = materialLoot(element.id, stage - 1)[index];
          expect(drop.minimum - previous.minimum).toBeGreaterThanOrEqual(0);
          expect(drop.maximum - previous.maximum).toBeGreaterThanOrEqual(0);
          expect(drop.minimum - previous.minimum).toBeLessThanOrEqual(1);
          expect(drop.maximum - previous.maximum).toBeLessThanOrEqual(1);
        }
      });
      expect(dungeonFractalisDrop(stage)).toEqual({ chance: 1,
        minimum: Math.round(5 + 295 * (stage - 1) / 34), maximum: Math.round(10 + 590 * (stage - 1) / 34) });
    }
    expect(materialLoot('infernic', 35).map(drop => [drop.minimum, drop.maximum]))
      .toEqual(endpoints);
    for (const stage of [0, 36, 1.5, NaN, Infinity]) expect(() => dungeonFractalisDrop(stage)).toThrow();
  });
  it.each(modes)('%s has15 stages, the same normalized level curve, and exactly two linear specialties', mode => {
    expect(infusionModeStageCount).toBe(15);
    for (let stage = 1; stage <= 15; stage++) {
      const progress = (stage - 1) / 14;
      const position = 1 + progress * 34;
      const anchors = [[1, 50], [13, 65], [19, 75], [25, 85], [35, 120]];
      const index = anchors.findIndex(([point]) => point >= position);
      const expectedLevel = index === 0 ? 50 : Math.round(anchors[index - 1][1] +
        (position - anchors[index - 1][0]) * (anchors[index][1] - anchors[index - 1][1]) / (anchors[index][0] - anchors[index - 1][0]));
      expect(infusionEncounter(mode, stage)).toMatchObject({ level: expectedLevel, boss: stage % 5 === 0 });
      for (const schedule of ['caps', 'legacy'] as const) {
        expect(infusionLoot(mode, stage, schedule)).toMatchObject({ bonuses: [], specialties:
          ['evolution', 'level'].map(purpose => ({ id: `${mode}-${purpose}`, chance: 1,
            minimum: Math.round(1 + (purpose === 'evolution' ? 6 : 7) * progress),
            maximum: Math.round(2 + (purpose === 'evolution' ? 6 : 8) * progress) })) });
      }
    }
  });
  it.each(modes)('%s saves both specialty curves at all15 stages and rejects excess evolution rewards atomically', mode => {
    for (let stage = 1; stage <= 15; stage++) {
      const state = createInfusionBattle(mode, stage, 1729, 'ember', { level: 105, evolution: 6 });
      state.enemies.forEach(enemy => { enemy.hp = 1; enemy.burn = { damage: 1, turns: 1 }; });
      const result = endTurn(state), saved = storage(JSON.stringify(emptyAccount()));
      const drops = infusionLoot(mode, stage).specialties;
      const progress = (stage - 1) / 14;
      expect(drops.map(drop => [drop.minimum, drop.maximum])).toEqual([
        [Math.round(1 + 6 * progress), Math.round(2 + 6 * progress)],
        [Math.round(1 + 7 * progress), Math.round(2 + 8 * progress)],
      ]);
      const creature = getCreature(state.enemies[0].creatureId!);
      for (const drop of drops) expect(creatureLoot(creature, stage).find(entry => entry.id === drop.id)).toEqual(drop);
      const forged = structuredClone(result), raw = saved.getItem(ACCOUNT_KEY);
      forged.events.find(event => event.kind === 'reward')!.materials![`${mode}-evolution`] = drops[0].maximum + 1;
      expect(() => saveAccountRewards(saved, forged, 'forged')).toThrow('specialty');
      expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
      const rewards = result.events.filter(event => event.kind === 'reward');
      for (const reward of rewards) for (const drop of drops) {
        expect(reward.materials![drop.id]).toBeGreaterThanOrEqual(drop.minimum);
        expect(reward.materials![drop.id]).toBeLessThanOrEqual(drop.maximum);
      }
      const write = vi.spyOn(saved, 'setItem');
      const account = saveAccountRewards(saved, result, `${mode}-${stage}`);
      for (const drop of drops) expect(account.materials[drop.id])
        .toBe(rewards.reduce((sum, reward) => sum + reward.materials![drop.id], 0));
      expect(saveAccountRewards(saved, result, `${mode}-${stage}`)).toEqual(account);
      expect(write).toHaveBeenCalledOnce();
    }
  });
  it('uses identical linear ranges in actual kills, Collections and atomic saves at every dungeon stage', () => {
    for (const element of elements) for (let stage = 1; stage <= 35; stage++) {
      const state = createDungeonBattle(element.id, stage, 1729, 'ember', { level: 105, evolution: 6 });
      state.enemies.forEach(enemy => { enemy.hp = 1; enemy.burn = { damage: 1, turns: 1 }; });
      const result = endTurn(state);
      const saved = storage(JSON.stringify(emptyAccount()));
      const before = saved.getItem(ACCOUNT_KEY);
      const rewards = result.events.filter(event => event.kind === 'reward');
      expect(rewards).toHaveLength(state.enemies.length);
      const forged = structuredClone(result);
      forged.events.find(event => event.kind === 'reward')!.amount = dungeonFractalisDrop(stage).maximum + 1;
      expect(() => saveAccountRewards(saved, forged, 'bad-currency')).toThrow('Prismatica');
      expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
      const badMaterials = structuredClone(result);
      badMaterials.events.find(event => event.kind === 'reward')!.materials![`${element.id}-common`] =
        materialLoot(element.id, stage)[0].maximum + 1;
      expect(() => saveAccountRewards(saved, badMaterials, 'bad-material')).toThrow('material');
      expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
      for (const reward of rewards) {
        expect(reward.amount).toBeGreaterThanOrEqual(dungeonFractalisDrop(stage).minimum);
        expect(reward.amount).toBeLessThanOrEqual(dungeonFractalisDrop(stage).maximum);
        for (const drop of materialLoot(element.id, stage)) {
          expect(reward.materials![drop.id]).toBeGreaterThanOrEqual(drop.minimum);
          expect(reward.materials![drop.id]).toBeLessThanOrEqual(drop.maximum);
        }
      }
      const loot = creatureLoot(getCreature(state.enemies[0].creatureId!), stage);
      expect(loot.find(drop => drop.id === 'fractalis')).toMatchObject(dungeonFractalisDrop(stage));
      for (const drop of materialLoot(element.id, stage)) expect(loot.find(entry => entry.id === drop.id)).toEqual(drop);
      const write = vi.spyOn(saved, 'setItem');
      const account = saveAccountRewards(saved, result, 'linear');
      expect(account.fractalis).toBe(rewards.reduce((sum, reward) => sum + reward.amount!, 0));
      expect(saveAccountRewards(saved, result, 'linear')).toEqual(account);
      expect(write).toHaveBeenCalledOnce();
    }
  });
  it.each(modes)('%s migrates all historical stages read-only once, retaining genuine final-clear eligibility', mode => {
    for (const version of [2, 3, 6, 7, 8, 9]) {
      const stages = version >= 3 && version < 7 ? 35 : 25;
      for (let stage = 1; stage <= stages; stage++) {
        const receipt = `${crypto.randomUUID()}:infusion-${mode}-${stages}-0`;
        const source = { ...emptyAccount(), version, fractalis: 123, lycalis: 45,
          materials: { [`${mode}-weapon`]: 77 }, infusionStages: { [mode]: stage },
          receipts: stage === stages ? [receipt] : [] };
        const raw = JSON.stringify(source), saved = storage(raw);
        const writes = vi.spyOn(saved, 'setItem');
        const loaded = loadAccount(saved);
        const previous = stages === 35 ? 1 + Math.ceil((stage - 1) * 24 / 34) : stage;
        expect(loaded.infusionStages[mode]).toBe(migratePreviousInfusionStage(previous));
        expect(loaded).toMatchObject({ version: 10, fractalis: 123, lycalis: 45, materials: source.materials });
        expect(loaded.normalFinalClears?.[mode]).toBe(stage === stages ? true : undefined);
        expect(writes).not.toHaveBeenCalled();
        expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
        saveAccount(saved, loaded);
        expect(loadAccount(saved)).toEqual(loaded);
        expect(writes).toHaveBeenCalledOnce();
      }
    }
    expect(validateAccount({ ...emptyAccount(), version: 9, infusionStages: { [mode]: 25 } }).normalFinalClears?.[mode]).toBeUndefined();
    expect(() => validateAccount({ ...emptyAccount(), infusionStages: { [mode]: 16 } })).toThrow();
    expect(() => validateAccount({ ...emptyAccount(), version: 9, infusionStages: { [mode]: 26 } })).toThrow();
  });
  it.each(modes)('%s preserves every old25-stage copy, exact skills, locks and gear across saving', mode => {
    for (let stage = 1; stage <= 25; stage++) {
      const copy = historicalCopy(mode, stage);
      const source = { ...emptyAccount(), version: 9, capturedCharacters: [copy], squad: [copy.instanceId],
        conduits: { 'vigil-core': 1 }, conduitEquipment: { [copy.instanceId]: ['vigil-core', null, null, null, null, null, null, null] } };
      const loaded = validateAccount(source);
      const retained = loaded.capturedCharacters![0];
      expect(retained).toEqual({ ...copy, infusionLayout: 25 });
      expect(capturedProgress(retained).skills).toEqual(copy.skills);
      expect(resolveCapturedFighter(retained).stats.health).toBeGreaterThan(0);
      expect(validateAccount(loaded)).toEqual(loaded);
      expect(loaded.conduitEquipment).toEqual(source.conduitEquipment);
      expect(() => validateAccount({ ...loaded, capturedCharacters: [{ ...retained, capturedStage: 26 }] })).toThrow();
      const forged = structuredClone(retained);
      forged.skills![0].multiplier++;
      expect(() => validateAccount({ ...loaded, capturedCharacters: [forged] })).toThrow();
    }
  });
  it('preserves metadata-free historical forms and defaults on their25-stage layout', () => {
    for (const mode of modes) for (let tier = 0; tier < 6; tier++) {
      const copy = { instanceId: `capture:${crypto.randomUUID()}`, creatureId: `infusion:${mode}:${tier}`, locked: false };
      const retained = validateAccount({ ...emptyAccount(), version: 9, capturedCharacters: [copy] }).capturedCharacters![0];
      const stage = 1 + Math.ceil(tier * 25 / 6);
      const encounter = infusionEncounter(mode, stage, 'caps', 25);
      expect(capturedProgress(retained)).toMatchObject({ stage, tier, level: 60,
        skills: enemySkills(encounter.level, encounter.boss, encounter.ability, encounter.legacyAbilityMultiplier) });
      expect(validateAccount({ ...emptyAccount(), capturedCharacters: [retained] }).capturedCharacters).toEqual([retained]);
    }
  });
  it('preserves raw saves when the first v10 transaction is denied and persists only on success', () => {
    const raw = JSON.stringify({ ...emptyAccount(), version: 9, infusionStages: { heavens: 25 }, materials: { 'heavens-weapon': 22 } });
    const saved = storage(raw);
    vi.spyOn(saved, 'setItem').mockImplementationOnce(() => { throw new Error('Write denied'); });
    expect(() => setMachineLootFocus(saved, 'Rare', 'duplex-heart')).toThrow('denied');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    expect(setMachineLootFocus(saved, 'Rare', 'duplex-heart')).toMatchObject({ version: 10, infusionStages: { heavens: 15 },
      materials: { 'heavens-weapon': 22 } });
  });
  it.each(modes)('%s discards obsolete online encounters, preserving saved rewards and read purity', mode => {
    let game = resolveOperation(freshGame('tester'), { kind: 'bootstrap', starterId: 'ember' }, entropy).game;
    game = resolveOperation(game, { kind: 'enter', activity: { kind: 'training' } }, entropy).game;
    Object.assign(game.account, { version: 9, infusionStages: { [mode]: 25 }, fractalis: 321 });
    game.run!.activity = { kind: 'infusion', mode, stage: 25 };
    const before = structuredClone(game);
    expect(publicGame(game, 1)).toMatchObject({ account: { version: 10, fractalis: 321, infusionStages: { [mode]: 15 } }, session: null });
    expect(game).toEqual(before);
    expect(resolveOperation(game, { kind: 'read' }, entropy).game.run).toBeNull();
  });
  it('retains unrelated online runs with historical copies through read and retry', () => {
    let game = resolveOperation(freshGame('tester'), { kind: 'bootstrap', starterId: 'ember' }, entropy).game;
    const copy = historicalCopy('heavens', 25);
    game.account = validateAccount({ ...game.account, version: 9, capturedCharacters: [copy], squad: [copy.instanceId] });
    game = resolveOperation(game, { kind: 'enter', activity: { kind: 'training' } }, entropy).game;
    Object.assign(game.account, { version: 9, capturedCharacters: [copy] });
    game.run!.captures = [copy];
    game.run!.session.state.allies[0].captured = copy;
    const original = structuredClone(game);
    const read = resolveOperation(game, { kind: 'read' }, entropy);
    expect(read.game.run!.session.runId).toBe(game.run!.session.runId);
    expect(read.game.run!.captures[0]).toEqual({ ...copy, infusionLayout: 25 });
    expect(read.response.session!.state.allies[0].captured!.skills).toEqual(copy.skills);
    expect(game).toEqual(original);
  });
});
