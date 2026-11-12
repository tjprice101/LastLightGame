import { characterReleased } from '../content/release-visibility';
import { starters } from '../content/starters';
import { characterGrowth, characterLevelCap } from '../content/progression';
import { loadAccount, saveAccount } from './account';
import { DebugProfileStorage } from './debug-profile';
import type { ProfileStorage } from './profile';

export function menuWorkspaceEnabled(development: boolean, search: string): boolean {
  return development && new URLSearchParams(search).get('workspace') === 'menu';
}

export const menuWorkspace = menuWorkspaceEnabled(import.meta.env.DEV, location.search);

export function createMenuWorkspaceStorage(): DebugProfileStorage {
  const memory = new Map<string, string>();
  const backing: ProfileStorage = {
    getItem: key => memory.get(key) ?? null,
    setItem: (key, value) => { memory.set(key, value); },
    removeItem: key => { memory.delete(key); },
  };
  const storage = new DebugProfileStorage(backing, true);
  storage.activate();
  const account = loadAccount(storage);
  for (const { id } of starters) {
    if (!characterReleased(id)) delete account.characters[id];
    else account.characters[id] ??= { level: characterLevelCap(characterGrowth.forms, id), evolution: characterGrowth.forms };
  }
  for (const id of ['ember', 'tide', 'sprout'] as const) {
    account.characters[id] = { level: 15, evolution: 2 };
  }
  account.conduitUpgrades = { ...account.conduitUpgrades, 'vigil-core': 0 };
  saveAccount(storage, account);
  return storage;
}
