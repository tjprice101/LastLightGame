import { describe, expect, it, vi } from 'vitest';
import { elements } from '../content/activities';
import { characterEvolutionCost, characterEvolutionRequirement, characterLevelCap, characterLevelCost,
  increasedMaterialCost, levelCost } from '../content/progression';
import { availableStarters, starters } from '../content/starters';
import { infusionEncounter, infusionLoot } from '../content/infusions';
import { materialLoot } from '../content/dungeons';
import { oblivionMaterialLoot } from '../content/gates-of-oblivion';
import { rollDrop } from '../content/loot-random';
import { createCreatureCopy, capturedLevelCost } from './character-instances';
import { activityAccess } from './activity-access';
import { ACCOUNT_KEY, emptyAccount, evolutionFodderOptions, saveAccount, upgradeCharacter } from './account';
import { SAVE_KEY, type ProfileStorage } from './profile';
import { actionUnavailable, actAndAdvanceTurn, createInfusionBattle } from './battle';
import { type ActionId } from '../content/combat';
import { freshGame, resolveOperation } from '../../supabase/functions/game-operation/engine';
import { characterDetail } from '../presentation/hub';

function storage() {
  const values = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  const saved: ProfileStorage = { getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); }, removeItem: key => { values.delete(key); } };
  return saved;
}

describe('approved farm, upgrade and all-evolution economy', () => {
  it('applies50% once to final material costs, rounds up, preserves currency and rejects overflow', () => {
    expect(increasedMaterialCost({ fractalis: 123, materials: { one: 1, two: 2, five: 5, late: 50 } }))
      .toEqual({ fractalis: 123, materials: { one: 2, two: 3, five: 8, late: 75 } });
    expect(() => increasedMaterialCost({ fractalis: 1, materials: { invalid: 0 } })).toThrow();
    expect(() => increasedMaterialCost({ fractalis: 1, materials: { invalid: Number.MAX_SAFE_INTEGER } })).toThrow('overflow');
    expect(levelCost('infernic', { level: 0, evolution: 1 })).toEqual({ fractalis: 12, materials: { 'infernic-common': 2 } });
    expect(characterLevelCost('ember', { level: 60, evolution: 4 }).materials)
      .toEqual({ 'infernic-common': 9, 'infernic-uncommon': 3, 'infernic-rare': 3, 'infernic-epic': 3 });
    expect(characterEvolutionCost('ember', { level: 30, evolution: 1 }))
      .toEqual({ fractalis: 300, materials: { 'infernic-common': 23 } });
    const copy = { ...createCreatureCopy('infusion:heavens:0', 1), level: 30 };
    expect(capturedLevelCost(copy)).toEqual({ fractalis: 72,
      materials: { 'tranquilitic-common': 3, 'tranquilitic-uncommon': 2 } });
  });

  it('preserves family, locks, squad and equipment protections for both early evolutions across the entire roster', () => {
    for (const character of starters) for (const evolution of [1, 2]) {
      const saved = storage(), account = emptyAccount();
      const progress = { level: characterLevelCap(evolution, character.id), evolution };
      account.characters[character.id] = progress;
      account.squad = [character.id];
      account.fractalis = 10_000;
      const cost = characterEvolutionCost(character.id, progress);
      account.materials = { ...cost.materials };
      const requirement = characterEvolutionRequirement(character.id, evolution);
      expect(requirement.fodderValue).toBe(evolution);
      const eligible = createCreatureCopy(`infusion:${requirement.infusion}:0`, 1);
      const wrongMode = requirement.infusion === 'heavens' ? 'abyss' : 'heavens';
      const wrong = createCreatureCopy(`infusion:${wrongMode}:0`, 1);
      const locked = { ...createCreatureCopy(`infusion:${requirement.infusion}:0`, 1), locked: true };
      const inSquad = createCreatureCopy(`infusion:${requirement.infusion}:0`, 1);
      const equipped = createCreatureCopy(`infusion:${requirement.infusion}:0`, 1);
      account.capturedCharacters = [eligible, wrong, locked, inSquad, equipped];
      account.squad.push(inSquad.instanceId);
      account.conduits = { 'vigil-core': 1 };
      account.conduitEquipment = { [equipped.instanceId]: ['vigil-core', null, null, null, null, null, null, null] };
      if (evolution === 2) account.capturedCharacters.push(createCreatureCopy(`infusion:${requirement.infusion}:0`, 1));
      saveAccount(saved, account);
      const before = saved.getItem(ACCOUNT_KEY);
      const options = evolutionFodderOptions(account, character.elementId, evolution, character.id);
      expect(options.filter(option => option.eligible)).toHaveLength(evolution);
      for (const ids of [[], [wrong.instanceId], [locked.instanceId], [inSquad.instanceId], [equipped.instanceId]]) {
        expect(() => upgradeCharacter(saved, character.id, 'evolve', progress, ids)).toThrow();
        expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
      }
      const ids = options.filter(option => option.eligible).map(option => option.copy.instanceId);
      const write = vi.spyOn(saved, 'setItem');
      const result = upgradeCharacter(saved, character.id, 'evolve', progress, ids);
      expect(write).toHaveBeenCalledOnce();
      expect(result.characters[character.id]).toEqual({ ...progress, evolution: evolution + 1 });
      expect(result.capturedCharacters).toHaveLength(4);
      expect(result.materials).toEqual(Object.fromEntries(Object.keys(cost.materials).map(id => [id, 0])));
      expect(result.fractalis).toBe(account.fractalis - cost.fractalis);
    }
  });

  it('keeps write failures atomic for the first fracture and validates the same recipe through the authority', () => {
    const saved = storage(), account = emptyAccount(), progress = { level: 30, evolution: 1 };
    account.characters.ember = progress;
    account.fractalis = 300;
    account.materials = { 'infernic-common': 23 };
    const copy = createCreatureCopy('infusion:heavens:0', 1);
    account.capturedCharacters = [copy];
    saveAccount(saved, account);
    const before = saved.getItem(ACCOUNT_KEY);
    vi.spyOn(saved, 'setItem').mockImplementation(() => { throw new Error('Save denied'); });
    expect(() => upgradeCharacter(saved, 'ember', 'evolve', progress, [copy.instanceId])).toThrow('Save denied');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
    const entropy = { seed: () => 1729, random: () => .5, uuid: () => crypto.randomUUID() };
    const game = resolveOperation(freshGame('economy_fixture'), { kind: 'bootstrap', starterId: 'ember' }, entropy).game;
    game.account = account;
    const raw = structuredClone(game);
    expect(() => resolveOperation(game, { kind: 'upgradeCharacter', id: 'ember', upgradeKind: 'evolve', expected: progress, fodderIds: [] }, entropy)).toThrow();
    expect(game).toEqual(raw);
    const result = resolveOperation(game, { kind: 'upgradeCharacter', id: 'ember', upgradeKind: 'evolve', expected: progress, fodderIds: [copy.instanceId] }, entropy);
    expect(result.game.account.characters.ember?.evolution).toBe(2);
    expect(result.game.account.firstFracture).toBe(true);
    expect(result.game.account.lycalis).toBe(10);
  });

  it('preserves authored random draw counts and exposes the same doubly-rounded farm quantities', () => {
    const tables = elements.flatMap(element => [1, 18, 35].map(stage => materialLoot(element.id, stage)));
    tables.push(...[1, 13, 25].map(oblivionMaterialLoot));
    for (const mode of ['heavens', 'abyss'] as const) {
      tables.push(...[1, 8, 15].map(stage => infusionLoot(mode, stage).specialties));
    }
    for (const drops of tables) for (const drop of drops) for (const roll of [0, .49, .999999]) {
      const source = drop.quantitySource!;
      const random = vi.fn(() => roll);
      const authored = source.minimum + Math.floor(roll * (source.maximum - source.minimum + 1));
      expect(rollDrop(drop, random)).toBe(Math.max(1, Math.round(Math.round(authored * .5) * .65)));
      expect(random).toHaveBeenCalledOnce();
      expect(drop.chance).toBe(1);
    }
  });

  it.each(availableStarters)('gives the single $name starter access to viable first-evolution fodder at its cap', character => {
    const account = emptyAccount();
    account.characters[character.id] = { level: 30, evolution: 1 };
    account.squad = [character.id];
    const mode = characterEvolutionRequirement(character.id, 1).infusion;
    expect(activityAccess(account, { kind: 'infusion', mode, stage: 1 }).unlocked).toBe(true);
    expect(infusionEncounter(mode, 1).level).toBe(30);
    expect(characterDetail(character, 'upgrade-0', account)).toContain('Evolution Value');
    let clears = 0;
    for (const seed of [17, 1729, 42, 104729, 2026]) {
      let state = createInfusionBattle(mode, 1, seed, character.id, account.characters[character.id]!);
      for (let turn = 0; turn < 100 && state.phase === 'player'; turn++) {
        const enemy = state.enemies.find(enemy => enemy.hp > 0)!;
        const actor = state.allies[0];
        const priorities: ActionId[] = character.id === 'tide'
          ? actor.shield < actor.stats.health * .15 ? ['ultimate', 'skill2', 'skill1', 'light'] : ['skill1', 'light']
          : character.id === 'sprout' && actor.hp < actor.stats.health * .65
            ? ['ultimate', 'skill2', 'skill1', 'light'] : ['ultimate', 'skill1', 'skill2', 'light'];
        const target = (action: ActionId) => action !== 'light' && actor.kit?.abilities[action].targets === 'one-ally'
          ? actor.id : enemy.id;
        const action = priorities.find(action => !actionUnavailable(state, actor, action, target(action)))!;
        state = actAndAdvanceTurn(state, character.id, action, target(action)).state;
      }
      if (state.phase === 'cleared') clears++;
    }
    expect(clears, `${character.name}: five actual seeded attempts`).toBeGreaterThanOrEqual(4);
  });
});
