import { describe, expect, it, vi } from 'vitest';
import { ACCOUNT_KEY, emptyAccount, equippedSquad, loadAccount, ownedCharacters, ownedProgress, saveAccount, setSquad,
  summonCharacter, summonPool, upgradeCharacter, validateAccount } from './account';
import { SAVE_KEY, type ProfileStorage } from './profile';
import { levelCost } from '../content/progression';
import { playableDungeons } from '../content/dungeons';
import { type StarterId } from '../content/starters';
import { actAndAdvanceTurn, createBattle, nextStage, nextWave } from './battle';
import { createSession } from '../presentation/battle-view';

function storage(): ProfileStorage {
  const values = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); },
    removeItem: (key) => { values.delete(key); } };
}
function fund(saved: ProfileStorage, lycalis = 20) {
  const account = loadAccount(saved);
  account.lycalis = lycalis;
  return saveAccount(saved, account);
}

describe('owned roster, summoning and saved squads', () => {
  it('normalizes legacy starter ownership on read without writing or losing progress', () => {
    const saved = storage();
    expect(loadAccount(saved).characters).toEqual({ ember: { level: 0, evolution: 1 } });
    expect(equippedSquad(loadAccount(saved))).toEqual(['ember']);
    expect(saved.getItem(ACCOUNT_KEY)).toBeNull();
    for (const version of [1, 2, 3]) {
      const legacy = version === 1 ? { version, fractalis: 45 } : { ...emptyAccount(), version, fractalis: 45,
        characters: { ember: { level: 15, evolution: 2, weaponRank: 1 } } };
      const raw = JSON.stringify(legacy);
      saved.setItem(ACCOUNT_KEY, raw);
      const account = loadAccount(saved);
      expect(ownedCharacters(account)).toEqual(['ember']);
      expect(account.fractalis).toBe(45);
      expect(account.characters.ember?.level).toBe(version === 1 ? 0 : 15);
      expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    }
  });
  it.each([0, 0.49999, 0.5, 0.99999])('draws equal unowned-only pool boundaries at %s', (roll) => {
    const saved = storage();
    fund(saved);
    const pool = summonPool(loadAccount(saved));
    expect(pool).toHaveLength(2);
    const write = vi.spyOn(saved, 'setItem');
    const result = summonCharacter(saved, () => roll);
    expect(result.id).toBe(pool[Math.floor(roll * 2)]);
    expect(result.account.lycalis).toBe(10);
    expect(result.account.characters[result.id]).toEqual({ level: 0, evolution: 1, weaponRank: 0 });
    expect(equippedSquad(result.account)).toEqual(['ember']);
    expect(write).toHaveBeenCalledTimes(1);
    expect(loadAccount(saved)).toEqual(result.account);
  });
  it('acquires both remaining characters without duplicates then rejects another draw without charging', () => {
    const saved = storage();
    fund(saved, 30);
    const first = summonCharacter(saved, () => 0).id;
    const second = summonCharacter(saved, () => 0.999).id;
    expect(first).not.toBe(second);
    expect(ownedCharacters(loadAccount(saved))).toHaveLength(3);
    const before = saved.getItem(ACCOUNT_KEY);
    expect(() => summonCharacter(saved)).toThrow('already owned');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
  });
  it.each([-1, 1, NaN, Infinity])('rejects invalid roll %s before spending', (roll) => {
    const saved = storage();
    fund(saved);
    const before = saved.getItem(ACCOUNT_KEY);
    expect(() => summonCharacter(saved, () => roll)).toThrow('[0, 1)');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
  });
  it('rejects insufficient currency, absent profile and failed persistence without granting or charging', () => {
    const saved = storage();
    fund(saved, 9);
    const random = vi.fn(() => 0);
    expect(() => summonCharacter(saved, random)).toThrow('10 Lycalis');
    expect(random).not.toHaveBeenCalled();
    fund(saved);
    const before = saved.getItem(ACCOUNT_KEY);
    vi.spyOn(saved, 'setItem').mockImplementation(() => { throw new Error('Storage unavailable'); });
    expect(() => summonCharacter(saved, () => 0)).toThrow('Storage unavailable');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
    saved.removeItem(SAVE_KEY);
    expect(() => summonCharacter(saved)).toThrow('first companion');
  });
  it('saves ordered squads, allows replacing starter as leader and removing starter entirely', () => {
    const saved = storage();
    fund(saved);
    summonCharacter(saved, () => 0);
    summonCharacter(saved, () => 0);
    setSquad(saved, ['sprout', 'tide', 'ember']);
    expect(equippedSquad(loadAccount(saved))).toEqual(['sprout', 'tide', 'ember']);
    setSquad(saved, ['tide']);
    expect(equippedSquad(loadAccount(saved))).toEqual(['tide']);
    expect(ownedCharacters(loadAccount(saved))).toHaveLength(3);
  });
  it('does not change the equipped team when saving fails', () => {
    const saved = storage();
    fund(saved);
    summonCharacter(saved, () => 0);
    const before = saved.getItem(ACCOUNT_KEY);
    vi.spyOn(saved, 'setItem').mockImplementation(() => { throw new Error('Storage unavailable'); });
    expect(() => setSquad(saved, ['tide'])).toThrow('Storage unavailable');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
    expect(equippedSquad(loadAccount(saved))).toEqual(['ember']);
  });
  it('rejects empty, duplicate, over-cap, unowned and malformed squads without changing saves', () => {
    const saved = storage();
    fund(saved);
    const before = saved.getItem(ACCOUNT_KEY);
    for (const ids of [[], ['ember', 'ember'], ['tide'], ['ember', 'tide', 'sprout', 'ember']] as StarterId[][]) {
      expect(() => setSquad(saved, ids)).toThrow('Invalid saved squad');
      expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
    }
    for (const squad of [null, 'ember', ['missing'], [4]]) {
      expect(() => validateAccount({ ...loadAccount(saved), squad })).toThrow('Invalid saved squad');
    }
  });
  it('preserves and reports a stored null wallet instead of treating it as a new account', () => {
    const saved = storage();
    saved.setItem(ACCOUNT_KEY, 'null');
    expect(() => loadAccount(saved)).toThrow('invalid or unsupported');
    expect(saved.getItem(ACCOUNT_KEY)).toBe('null');
  });
  it('upgrades summoned characters independently and rejects unowned upgrades', () => {
    const saved = storage();
    fund(saved, 10);
    expect(() => upgradeCharacter(saved, 'tide', 'level', { level: 0, evolution: 1 })).toThrow('owned companion');
    const { id } = summonCharacter(saved, () => 0);
    const account = loadAccount(saved);
    const cost = levelCost(id === 'tide' ? 'aquatic' : 'efflorescent', ownedProgress(account, id));
    account.fractalis = cost.fractalis;
    account.materials = cost.materials;
    saveAccount(saved, account);
    const upgraded = upgradeCharacter(saved, id, 'level', ownedProgress(account, id));
    expect(upgraded.characters[id]?.level).toBe(1);
    expect(upgraded.characters.ember?.level).toBe(0);
    expect(upgraded.lycalis).toBe(0);
  });
});

describe('full-team battle snapshots', () => {
  const ids: StarterId[] = ['sprout', 'tide', 'ember'];
  const progress = { sprout: { level: 8, evolution: 1, weaponRank: 1 }, tide: { level: 30, evolution: 2, weaponRank: 2 },
    ember: { level: 105, evolution: 6, weaponRank: 3 } };
  const destinations = [
    ...playableDungeons.map((element) => ({ element, stage: 1 })),
    ...(['heavens', 'abyss'] as const).map((mode) => ({ mode, stage: 1 })),
  ];
  it.each(destinations)('preserves all progress and per-unit Gauge through Continue in $element $mode', (destination) => {
    const session = createSession('sprout', progress.sprout, destination, { ids, progress });
    expect(session.state.allies.map((ally) => ally.definitionId)).toEqual(ids);
    expect(session.state.allies.map((ally) => ally.level)).toEqual([8, 30, 105]);
    session.state.phase = 'cleared';
    session.state.allies.forEach((ally, index) => { ally.shatter = 20 + index * 15; ally.hp = 0; });
    const next = nextStage(session.state, session.teamProgress!).state;
    expect(next.allies.map((ally) => ally.definitionId)).toEqual(ids);
    expect(next.allies.map((ally) => ally.shatter)).toEqual([20, 35, 50]);
    expect(next.allies.map((ally) => ally.stats)).toEqual(session.state.allies.map((ally) => ally.stats));
    expect(next.allies.every((ally) => ally.hp === ally.stats.health)).toBe(true);
    const replay = createSession('sprout', progress.sprout, destination, { ids, progress: session.teamProgress! });
    expect(replay.state.allies.map((ally) => ally.stats)).toEqual(next.allies.map((ally) => ally.stats));
    expect(replay.state.allies.every((ally) => ally.shatter === 0)).toBe(true);
  });
  it('freezes the run roster/progress and keeps Adventure allies across waves', () => {
    const source = structuredClone(progress);
    const roster = [...ids];
    const session = createSession('sprout', source.sprout, undefined, { ids: roster, progress: source });
    roster.reverse();
    source.sprout.level = 9;
    expect(session.teamProgress?.sprout?.level).toBe(8);
    session.state.phase = 'cleared';
    session.state.allies.forEach((ally, index) => { ally.shatter = index * 20; });
    const next = nextWave(session.state).state;
    expect(next.allies.map((ally) => ally.definitionId)).toEqual(ids);
    expect(next.allies.map((ally) => ally.shatter)).toEqual([0, 20, 40]);
  });
  it('waits for all three actions before enemies act, then resets team actions', () => {
    let state = createBattle(42, ids, progress);
    for (const enemy of state.enemies) enemy.hp = 1000000;
    state = actAndAdvanceTurn(state, 'sprout', 'defend', state.enemies[0].id).state;
    expect(state.round).toBe(1);
    expect(state.allies.find((ally) => ally.id === 'sprout')?.spent).toBe(true);
    state = actAndAdvanceTurn(state, 'tide', 'defend', state.enemies[0].id).state;
    expect(state.round).toBe(1);
    state = actAndAdvanceTurn(state, 'ember', 'defend', state.enemies[0].id).state;
    expect(state.round).toBe(2);
    expect(state.allies.every((ally) => !ally.spent)).toBe(true);
  });
});
