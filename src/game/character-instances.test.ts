import { describe, expect, it } from 'vitest';
import { appendCapturedCharacter, validateCapturedCharacters } from './character-instances';
import { emptyAccount, validateAccount, saveAccount, loadAccount, ownedCharacterInstances, characterProtection, setCharacterLock, ACCOUNT_KEY } from './account';
import { SAVE_KEY, type ProfileStorage } from './profile';
import { characterCopyManagement } from '../presentation/roster';

const first = 'capture:00000000-0000-4000-8000-000000000001';
const second = 'capture:00000000-0000-4000-8000-000000000002';
function storage(): ProfileStorage {
  const values = new Map<string, string>();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); }, removeItem: (key) => { values.delete(key); } };
}
function seeded() {
  const saved = storage();
  saved.setItem(SAVE_KEY, JSON.stringify({ version: 1, starterId: 'ember' }));
  const account = emptyAccount();
  account.characters.ember = { level: 12, evolution: 2, weaponRank: 4 };
  account.characters.tide = { level: 0, evolution: 1 };
  account.squad = ['ember'];
  account.conduits = { 'vigil-core': 1 };
  account.conduitEquipment = { ember: ['vigil-core', null, null, null, null, null, null, null] };
  account.capturedCharacters = appendCapturedCharacter([], 'infusion:heavens:0', first);
  account.capturedCharacters = appendCapturedCharacter(account.capturedCharacters, 'infusion:heavens:0', second);
  saveAccount(saved, account);
  return { saved, account };
}

describe('duplicate character-instance foundation', () => {
  it('keeps duplicate definitions in independent slots without mutating input', () => {
    const firstCopy = appendCapturedCharacter([], 'infusion:heavens:0', first);
    const copies = appendCapturedCharacter(firstCopy, 'infusion:heavens:0', second);
    expect(firstCopy).toHaveLength(1);
    expect(copies).toHaveLength(2);
    expect(copies.map((copy) => copy.instanceId)).toEqual([first, second]);
    expect(copies.every((copy) => copy.locked === false)).toBe(true);
    copies[0].locked = true;
    expect(copies[1].locked).toBe(false);
    expect(firstCopy[0].locked).toBe(false);
  });
  it('round-trips duplicates and preserves all existing ownership, progress and gear', () => {
    const { saved, account } = seeded();
    expect(loadAccount(saved)).toEqual(account);
    expect(ownedCharacterInstances(account)).toEqual(['ember', 'tide', first, second]);
    expect(validateAccount(account)).toEqual(account);
  });
  it('accepts hundreds of independent duplicates without a collection-capacity cutoff', () => {
    const account = emptyAccount();
    account.capturedCharacters = Array.from({ length: 500 }, (_, index) => ({
      instanceId: `capture:00000000-0000-4000-8000-${index.toString(16).padStart(12, '0')}`,
      creatureId: 'infusion:abyss:0',
      locked: false,
    }));
    const saved = storage();
    saveAccount(saved, account);
    expect(loadAccount(saved).capturedCharacters).toHaveLength(500);
    expect(new Set(ownedCharacterInstances(loadAccount(saved))).size).toBe(500);
  });
  it('locks only the selected copy and automatically protects squad members', () => {
    const { saved } = seeded();
    const account = setCharacterLock(saved, first, true);
    expect(characterProtection(account, first)).toEqual({ locked: true, inSquad: false, protected: true });
    expect(characterProtection(account, second)).toEqual({ locked: false, inSquad: false, protected: false });
    expect(characterProtection(account, 'ember')).toEqual({ locked: false, inSquad: true, protected: true });
    expect(characterProtection(account, 'tide').protected).toBe(false);
    const locked = setCharacterLock(saved, 'ember', true);
    expect(locked.characterLocks).toEqual({ ember: true });
    const unlocked = setCharacterLock(saved, 'ember', false);
    expect(characterProtection(unlocked, 'ember').protected).toBe(true);
    expect(loadAccount(saved).capturedCharacters?.[0].locked).toBe(true);
    expect(characterProtection(setCharacterLock(saved, first, false), first).protected).toBe(false);
  });
  it('loads legacy accounts without writing or inventing captured copies', () => {
    const saved = storage();
    const account = emptyAccount();
    account.characters.ember = { level: 10, evolution: 1, weaponRank: 3 };
    const raw = JSON.stringify(account);
    saved.setItem(ACCOUNT_KEY, raw);
    expect(loadAccount(saved)).toEqual(account);
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    expect(loadAccount(saved).capturedCharacters).toBeUndefined();
    expect(loadAccount(saved).characterLocks).toBeUndefined();
  });
  it('rejects corrupt IDs, duplicate instance IDs, ineligible creatures and invalid locks', () => {
    const copy = { instanceId: first, creatureId: 'infusion:abyss:0', locked: false };
    for (const value of [null, {}, [copy, copy], [{ ...copy, instanceId: 'ember' }], [{ ...copy, locked: 'yes' }],
      [{ ...copy, creatureId: 'adventure:goblin' }], [{ ...copy, creatureId: 'dungeon:infernic:0' }]]) {
      expect(() => validateCapturedCharacters(value)).toThrow();
    }
    expect(() => validateAccount({ ...emptyAccount(), characterLocks: { ember: true } })).toThrow('owned character');
    expect(() => validateAccount({ ...emptyAccount(), capturedCharacters: [copy, copy] })).toThrow('duplicate');
  });
  it('preserves storage on failed lock writes or unknown instances', () => {
    const { saved } = seeded();
    const raw = saved.getItem(ACCOUNT_KEY);
    expect(() => setCharacterLock(saved, 'fake', true)).toThrow('owned character');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    saved.setItem = () => { throw new Error('Write denied'); };
    expect(() => setCharacterLock(saved, second, true)).toThrow('Write denied');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
  });
  it('shows separate copies and correct protection rather than merging species', () => {
    const { account } = seeded();
    const html = characterCopyManagement(account);
    expect(html).toContain(`data-captured-copy="${first}"`);
    expect(html).toContain(`data-captured-copy="${second}"`);
    expect(html).toContain('Owned copy 1');
    expect(html).toContain('Owned copy 2');
    expect(html).toContain('In squad / Automatically protected');
    expect(html).toContain('Retained abilities');
    expect(characterCopyManagement(emptyAccount())).toContain('No captured creatures yet');
    expect(characterCopyManagement(null)).toContain('role="alert"');
  });
});
