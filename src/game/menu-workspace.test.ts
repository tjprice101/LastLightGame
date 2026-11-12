// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { loadAccount } from './account';
import { createMenuWorkspaceStorage, menuWorkspaceEnabled } from './menu-workspace';
import { characterReleased } from '../content/release-visibility';
import { isStarterId, starters } from '../content/starters';

describe('isolated local menu workspace', () => {
  it('requires explicit development opt-in', () => {
    expect(menuWorkspaceEnabled(false, '?workspace=menu')).toBe(false);
    expect(menuWorkspaceEnabled(true, '')).toBe(false);
    expect(menuWorkspaceEnabled(true, '?workspace=menu')).toBe(true);
  });
  it('never accesses browser account or preferences storage', () => {
    const before = { ...localStorage };
    const storage = createMenuWorkspaceStorage();
    storage.setItem('test-setting', 'isolated');
    const account = loadAccount(storage);
    expect(storage.active).toBe(true);
    expect(account.characters.ember).toEqual({ level: 15, evolution: 2 });
    expect(Object.keys(account.characters).every(id => isStarterId(id) && characterReleased(id))).toBe(true);
    expect(Object.keys(account.characters).sort()).toEqual(starters.filter(starter => characterReleased(starter.id)).map(starter => starter.id).sort());
    expect(account.conduitUpgrades?.['vigil-core']).toBe(0);
    expect({ ...localStorage }).toEqual(before);
    expect(createMenuWorkspaceStorage().getItem('test-setting')).toBe(null);
  });
});
