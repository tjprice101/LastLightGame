import { describe, expect, it, vi } from 'vitest';
import { dungeonStageCount, elements, infusionModeStageCount, migratePreviousInfusionStage } from '../content/activities';
import { materialLoot } from '../content/dungeons';
import { materialRangesAtLevel } from '../content/material-drops';
import { infusionEncounter, infusionLoot } from '../content/infusions';
import { enemySkills } from '../content/enemy-skills';
import { ACCOUNT_KEY, emptyAccount, loadAccount, saveAccount, setMachineLootFocus, validateAccount } from './account';
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
  it('tapers actual dungeon ranges from10% to70% without changing unlocks or final currencies', () => {
    for (const element of elements) for (let stage = 1; stage <= dungeonStageCount; stage++) {
      const base = materialRangesAtLevel(Math.round(38 + (stage - 1) * 82 / 34));
      const drops = materialLoot(element.id, stage);
      expect(drops).toHaveLength(Object.keys(base).length);
      for (const drop of drops) {
        const rarity = drop.id.slice(element.id.length + 1) as keyof typeof base;
        const range = base[rarity]!;
        const retained = .9 - .6 * (stage - 1) / 34;
        const boost = stage === 35 ? 5 : 1;
        expect(drop).toMatchObject({ chance: 1, minimum: Math.max(1, Math.round(range[0] * boost * retained)),
          maximum: Math.max(1, Math.round(range[1] * boost * retained)) });
        expect(drop.quantityMultiplier).toBeUndefined();
      }
    }
    expect(materialLoot('infernic', 35).map(drop => [drop.minimum, drop.maximum]))
      .toEqual([[38, 45], [24, 30], [18, 23], [12, 15], [8, 9], [3, 5]]);
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
            minimum: Math.round(1 + 10 * progress), maximum: Math.round(2 + 21 * progress) })) });
      }
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
