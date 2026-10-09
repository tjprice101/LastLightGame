import { describe, expect, it, vi } from 'vitest';
import { existsSync } from 'node:fs';
import { flagshipCharacters } from '../content/flagships';
import { availableStarters, isAvailableStarter } from '../content/starters';
import { characterArt, characterName } from '../content/character-art';
import { fighters, resolveFighter } from '../content/combat';
import type { ConduitLoadouts } from '../content/conduits';
import { standardBannerPool } from '../content/standard-banner';
import { playableDungeons } from '../content/dungeons';
import { characterEvolutionRequirement, characterLevelCost, characterPotencyFactor } from '../content/progression';
import { abilityIcon } from '../presentation/ability-icon';
import { characterRole } from '../presentation/character-role';
import { archives } from '../presentation/archives';
import { createSession } from '../presentation/battle-view';
import { ACCOUNT_KEY, emptyAccount, equipConduit, loadAccount, saveAccount, setSquad, summonCharacter, upgradeCharacter } from './account';
import { SAVE_KEY, type ProfileStorage } from './profile';
import { act, createBattle, damageAmount, endTurn, nextStage, nextWave } from './battle';
import { createCreatureCopy } from './character-instances';

function storage() {
  const map = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  const setItem = vi.fn((key: string, value: string) => { map.set(key, value); });
  const saved: ProfileStorage = { getItem: (key) => map.get(key) ?? null, setItem, removeItem: (key) => { map.delete(key); } };
  return { saved, setItem };
}
function rollFor(id: string) {
  const pool = standardBannerPool();
  const index = pool.findIndex((entry) => entry.id === id);
  if (index < 0) throw new Error('Missing test outcome.');
  return pool.slice(0, index).reduce((sum, entry) => sum + entry.chance, 0) + pool[index].chance / 2;
}
function controlled() {
  const state = createBattle(12345, ['disciple', 'bruno', 'elise']);
  state.allies.forEach((unit) => { unit.shatter = 100; unit.stats.crit = 0; unit.shield = 10000; });
  state.enemies.forEach((unit) => { unit.hp = 10000; unit.stats.health = 10000; unit.stats.crit = 0; });
  return state;
}

describe('playable flagship roster', () => {
  it('preserves the three opening choices and authored fixed stars', () => {
    expect(availableStarters.map((entry) => entry.id)).toEqual(['ember', 'tide', 'sprout']);
    expect(flagshipCharacters.filter((entry) => entry.stars === 5).map((entry) => entry.id)).toEqual(['atmoso', 'bruno', 'elise']);
    expect(flagshipCharacters.filter((entry) => entry.stars === 6).map((entry) => entry.id)).toEqual(['aurora', 'bliss', 'disciple', 'razor']);
    for (const character of flagshipCharacters) expect(isAvailableStarter(character.id)).toBe(false);
  });
  it.each(flagshipCharacters)('$name has all six portraits, six action icons, roles and real skills', (character) => {
    for (let evolution = 1; evolution <= 6; evolution++) {
      const form = characterArt(character.id, evolution);
      expect(form.available).toBe(true);
      expect(existsSync(`public/assets/characters/${form.art}.png`)).toBe(true);
      expect(characterName(character.id, evolution)).toBe(`${form.title}, ${character.name}`);
    }
    for (const action of ['passive', 'light', 'skill1', 'skill2', 'ultimate', 'defend'] as const) {
      expect(abilityIcon(character.id, action)).toContain(`abilities/${character.id}-${action}.png`);
      expect(existsSync(`public/assets/abilities/${character.id}-${action}.png`)).toBe(true);
    }
    expect(characterRole(character.id)).toContain(`data-character-role="${character.role}"`);
    for (const action of ['light', 'skill1', 'skill2', 'ultimate', 'defend'] as const) {
      const state = createBattle(12345, [character.id]);
      state.allies[0].shatter = 100;
      state.enemies.forEach((unit) => { unit.hp = 10000; unit.stats.health = 10000; });
      const result = act(state, character.id, action, state.enemies[0].id);
      expect(result.state.allies[0].spent).toBe(true);
      if (action !== 'light' && action !== 'defend') {
        expect(result.events.find((entry) => entry.kind === 'attack')?.abilityName).toBe(fighters[character.id].abilities[action].name);
      }
    }
  });
  it.each(flagshipCharacters)('$name awards atomically, preserves old progress and never auto-equips', (character) => {
    const { saved, setItem } = storage();
    const account = emptyAccount();
    account.lycalis = 100;
    account.characters.ember = { level: 30, evolution: 2, weaponRank: 3 };
    account.squad = ['ember'];
    account.bannerPity = { standard: { highestStar: 12, unownedHighestStar: 25 } };
    saveAccount(saved, account);
    const before = saved.getItem(ACCOUNT_KEY);
    setItem.mockClear();
    loadAccount(saved);
    expect(setItem).not.toHaveBeenCalled();
    const roll = () => rollFor(character.id);
    setItem.mockImplementationOnce(() => { throw new Error('Write denied'); });
    expect(() => summonCharacter(saved, roll)).toThrow('Write denied');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
    setItem.mockClear();
    const result = summonCharacter(saved, roll);
    expect(setItem).toHaveBeenCalledTimes(1);
    expect(result.entry.id).toBe(character.id);
    expect(result.account.characters[character.id]).toEqual({ level: 0, evolution: 1, weaponRank: 0 });
    expect(result.account.characters.ember).toEqual(account.characters.ember);
    expect(result.account.squad).toEqual(['ember']);
    expect(result.account.conduitEquipment).toBeUndefined();
    expect(result.account.lycalis).toBe(90);
    expect(result.account.bannerPity?.standard).toEqual(character.stars === 6
      ? { highestStar: 0, unownedHighestStar: 0 } : { highestStar: 13, unownedHighestStar: 26 });
    const duplicate = summonCharacter(saved, roll);
    expect(duplicate.duplicate).toBe(true);
    expect(duplicate.copy?.creatureId).toBe('infusion:treasury:5');
    expect(duplicate.copy?.level).toBe(50);
    expect(duplicate.account.characters[character.id]).toEqual(result.account.characters[character.id]);
  });
  it('shares leveling, evolution routes, squad saves and gear without granting resources', () => {
    const { saved } = storage();
    const account = emptyAccount();
    account.characters = { bruno: { level: 0, evolution: 1 }, disciple: { level: 0, evolution: 1 }, elise: { level: 0, evolution: 1 } };
    account.fractalis = 100;
    account.materials['botanic-common'] = 2;
    account.conduits = { 'siegebound-drive': 1 };
    saveAccount(saved, account);
    expect(setSquad(saved, ['disciple', 'bruno', 'elise']).squad).toEqual(['disciple', 'bruno', 'elise']);
    expect(equipConduit(saved, 'bruno', 0, 'siegebound-drive').conduitEquipment?.bruno?.[0]).toBe('siegebound-drive');
    const cost = characterLevelCost('bruno', { level: 0, evolution: 1 });
    const upgraded = upgradeCharacter(saved, 'bruno', 'level', { level: 0, evolution: 1 });
    expect(upgraded.fractalis).toBe(100 - cost.fractalis);
    expect(upgraded.materials['botanic-common']).toBe(2 - cost.materials['botanic-common']);
    expect(upgraded.characters.bruno?.level).toBe(1);
    for (const character of flagshipCharacters) {
      expect(characterEvolutionRequirement(character.id, 4).infusion).toBe(
        ['botanic', 'atmospheric'].includes(character.elementId) ? 'heavens' : 'abyss');
    }
    expect(archives(upgraded)).toContain('data-archive-character="bruno"');
  });
  it('snapshots mixed flagship squads and gear in Adventure and every staged activity', () => {
    const progress = { disciple: { level: 30, evolution: 2 }, bruno: { level: 45, evolution: 3 }, elise: { level: 60, evolution: 4 } };
    const team = { ids: ['disciple', 'bruno', 'elise'], progress };
    const equipment: ConduitLoadouts = { bruno: ['siegebound-drive', null, null, null, null, null, null, null] };
    const activities = [...playableDungeons.map((element) => ({ element, stage: 1 })),
      ...(['heavens', 'abyss', 'treasury', 'sanctuary', 'roses'] as const).map((mode) => ({ mode, stage: 1 }))];
    for (const destination of [undefined, ...activities]) {
      const session = createSession('disciple', progress.disciple, destination, { ...team, equipment });
      expect(session.state.allies.map((unit) => unit.id)).toEqual(team.ids);
      expect(session.state.allies.map((unit) => unit.level)).toEqual([30, 45, 60]);
      expect(session.state.allies[1].conduits).toEqual(equipment.bruno);
      session.state.phase = 'cleared';
      const next = destination ? nextStage(session.state, session.teamProgress!) : nextWave(session.state);
      expect(next.state.allies[1].conduits).toEqual(equipment.bruno);
      expect(next.state.allies[1].stats.damage).toBe(session.state.allies[1].stats.damage);
    }
  });
});

describe('Disciple ally empowerment', () => {
  it('empowers captured allies too and carries the remaining duration through Adventure Continue', () => {
    const copy = createCreatureCopy('infusion:heavens:0');
    const state = createBattle(12345, ['disciple', copy.instanceId, 'bruno'], {}, {}, [copy]);
    state.allies.forEach((unit) => { unit.shatter = 100; unit.stats.crit = 0; });
    state.enemies.forEach((unit) => { unit.hp = 1000000; unit.stats.health = 1000000; });
    const supported = act(state, 'disciple', 'skill1', state.enemies[0].id).state;
    expect(supported.allies[1].attackBoost).toEqual({ fraction: .2, throughRound: 2 });
    const result = act(supported, copy.instanceId, 'light', supported.enemies[0].id);
    expect(result.events.find((entry) => entry.kind === 'damage')?.amount)
      .toBe(damageAmount(supported.allies[1].stats.damage, 1.2, supported.enemies[0].stats.defense, false));
    result.state.phase = 'cleared';
    result.state.enemies.forEach((unit) => { unit.hp = 0; });
    const next = nextWave(result.state).state;
    expect(next.round).toBe(2);
    expect(next.allies[1].attackBoost).toEqual({ fraction: .2, throughRound: 2 });
  });
  it('boosts actual damage for living allies, persists on clone/resume, and expires after the next turn', () => {
    const state = controlled();
    const original = structuredClone(state);
    const result = act(state, 'disciple', 'skill1', state.enemies[0].id);
    expect(state).toEqual(original);
    expect(result.state.allies.every((ally) => ally.attackBoost?.fraction === .2)).toBe(true);
    expect(result.events.filter((entry) => entry.kind === 'status')).toHaveLength(3);
    const resumed = structuredClone(result.state);
    const attack = act(resumed, 'elise', 'light', resumed.enemies[0].id);
    expect(attack.events.find((entry) => entry.kind === 'damage')?.amount).toBe(damageAmount(40, 1.2, state.enemies[0].stats.defense, false));
    const next = endTurn(attack.state).state;
    expect(next.allies[2].attackBoost).toEqual({ fraction: .2, throughRound: 2 });
    expect(endTurn(next).state.allies.every((ally) => ally.attackBoost === undefined)).toBe(true);
  });
  it('refreshes instead of stacking, protects dead allies, and gives the advertised shields', () => {
    let state = controlled();
    state.allies[1].hp = 0;
    state.allies.forEach((ally) => { ally.shield = 0; });
    state = act(state, 'disciple', 'skill2', '').state;
    expect(state.allies[0].attackBoost?.fraction).toBe(.3);
    expect(state.allies[0].shield).toBe(20);
    expect(state.allies[1].attackBoost).toBeUndefined();
    expect(state.allies[1].shield).toBe(0);
    state = endTurn(state).state;
    state = act(state, 'disciple', 'skill1', state.enemies[0].id).state;
    expect(state.allies[0].attackBoost).toEqual({ fraction: .3, throughRound: 3 });
    const ultimate = controlled();
    const result = act(ultimate, 'disciple', 'ultimate', '');
    expect(result.state.allies[0].attackBoost?.fraction).toBe(.4);
    expect(result.state.allies[0].recoverThrough).toBe(2);
    const growth = { level: 105, evolution: 6 };
    const kit = resolveFighter('disciple', growth);
    expect(kit.abilities.skill1.strength.attackBoostFraction).toBeCloseTo(.2 * characterPotencyFactor(growth));
    expect(kit.abilities.ultimate.strength.attackBoostFraction).toBe(.5);
    expect(kit.abilities.ultimate.description).toContain('50%');
  });
});
