// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { starters } from '../content/starters';
import { conduits, conduitUpgradeCap } from '../content/conduits';
import { masterConduits } from '../content/master-conduits';
import { creatures } from '../content/creatures';
import { elementalMaterials, currencyModes, eventModes, infusionModes, machineModes, dungeonStageCount } from '../content/activities';
import { specialtyMaterials } from '../content/infusions';
import { roseMaterials } from '../content/roses';
import { elementalWars, warStageCount } from '../content/elemental-war';
import { playableDungeons } from '../content/dungeons';
import { characterGrowth, characterLevelCap } from '../content/progression';
import { storyRules } from '../content/story';
import { ACCOUNT_KEY, emptyAccount, equipConduit, loadAccount, setSquad, summonCharacter } from './account';
import { capturedProgress } from './character-instances';
import { SAVE_KEY, loadProfile, type ProfileStorage } from './profile';
import { bindDebugPhrase, createDebugAccount, DebugProfileStorage, debugPhrase } from './debug-profile';

afterEach(() => { document.body.replaceChildren(); });

function savedStorage() {
  const data = new Map([
    [SAVE_KEY, JSON.stringify({ version: 1, starterId: 'tide' })],
    [ACCOUNT_KEY, JSON.stringify({ ...emptyAccount(), fractalis: 27, characters: { tide: { level: 0, evolution: 1 } }, squad: ['tide'] })],
    ['last-light.online-auth', 'untouched-auth'],
  ]);
  const storage: ProfileStorage = {
    getItem: vi.fn(key => data.get(key) ?? null),
    setItem: vi.fn((key, value) => { data.set(key, value); }),
    removeItem: vi.fn(key => { data.delete(key); }),
  };
  return { data, storage };
}

describe('isolated development profile', () => {
  it('unlocks every authored gameplay catalog with valid maximum progress and abundant resources', () => {
    const account = createDebugAccount();
    expect(Object.keys(account.characters)).toHaveLength(starters.length);
    for (const starter of starters) expect(account.characters[starter.id]).toEqual({
      level: characterLevelCap(characterGrowth.forms), evolution: characterGrowth.forms,
    });
    for (const conduit of conduits) {
      expect(account.conduits?.[conduit.id]).toBe(1);
      expect(account.conduitUpgrades?.[conduit.id]).toBe(conduitUpgradeCap);
    }
    expect(Object.keys(account.masterConduits ?? {})).toHaveLength(masterConduits.length);
    expect(Object.values(account.masterConduits ?? {}).every(count => count === 1)).toBe(true);
    for (const material of [...elementalMaterials, ...specialtyMaterials, ...roseMaterials]) expect(account.materials[material.id]).toBe(1_000_000);
    for (const dungeon of playableDungeons) expect(account.dungeonStages[dungeon]).toBe(dungeonStageCount);
    for (const mode of [...infusionModes, ...currencyModes, ...eventModes, ...machineModes]) expect(account.infusionStages[mode.id]).toBe(mode.stages);
    for (const war of elementalWars) expect(account.warStages?.[war.character]).toBe(warStageCount);
    expect(account.storyCompleted).toBe(storyRules.stages);
    expect(Object.keys(account.creatures)).toHaveLength(creatures.length);
    expect(Object.values(account.creatures).every(entry => entry.defeated)).toBe(true);
    for (const creature of creatures.filter(creature => creature.mode && creature.mode !== 'machines')) {
      const copies = account.capturedCharacters?.filter(copy => copy.creatureId === creature.id) ?? [];
      expect(copies).toHaveLength(3);
      expect(copies.every(copy => capturedProgress(copy).level === 60)).toBe(true);
    }
    expect(account.conduitEquipment).toBeUndefined();
    expect(account.masterEquipment).toBeUndefined();
  });

  it('forwards ordinary storage but permanently isolates all debug transactions and settings until reload', () => {
    const { data, storage } = savedStorage();
    const game = new DebugProfileStorage(storage, true);
    expect(game.getItem(SAVE_KEY)).toBe(data.get(SAVE_KEY));
    game.setItem('normal-setting', 'normal');
    game.removeItem('normal-setting');
    const before = new Map(data);
    vi.mocked(storage.setItem).mockClear();
    vi.mocked(storage.removeItem).mockClear();
    game.activate();
    expect(game.active).toBe(true);
    expect(loadProfile(game)?.starterId).toBe('ember');
    setSquad(game, ['vaelor', 'nerithe', 'orvella']);
    equipConduit(game, 'vaelor', 0, 'vigil-core');
    summonCharacter(game, () => .99);
    game.setItem('test-setting', 'debug');
    game.removeItem('last-light.online-auth');
    expect(loadAccount(game).squad).toEqual(['vaelor', 'nerithe', 'orvella']);
    expect(loadAccount(game).conduitEquipment?.vaelor?.[0]).toBe('vigil-core');
    expect(loadAccount(game).lycalis).toBe(999_999_990);
    expect(data).toEqual(before);
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(storage.removeItem).not.toHaveBeenCalled();
    expect(() => game.activate()).toThrow('already active');
    const reloaded = new DebugProfileStorage(storage, true);
    expect(reloaded.active).toBe(false);
    expect(loadProfile(reloaded)?.starterId).toBe('tide');
    expect(loadAccount(reloaded).fractalis).toBe(27);
  });

  it('cannot activate a test profile in a production build', () => {
    const { data, storage } = savedStorage();
    const before = new Map(data);
    const game = new DebugProfileStorage(storage, false);
    expect(() => game.activate()).toThrow('development builds');
    expect(game.active).toBe(false);
    expect(data).toEqual(before);
  });
});

describe('debug keyboard phrase', () => {
  it('matches exact case, ignores repeats/modifiers/fields, and resets when menus are unavailable', () => {
    let allowed = true;
    const activate = vi.fn();
    const dispose = bindDebugPhrase(document, () => allowed, activate);
    const type = (text: string, target: EventTarget = document, options: KeyboardEventInit = {}) => {
      for (const key of text) target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...options }));
    };
    try {
      type('iamthelight');
      expect(activate).not.toHaveBeenCalled();
      for (const tag of ['input', 'textarea', 'select', 'div']) {
        const field = document.createElement(tag);
        if (tag === 'div') field.setAttribute('contenteditable', 'true');
        document.body.append(field);
        type(debugPhrase, field);
      }
      type(debugPhrase, document, { ctrlKey: true });
      type(debugPhrase, document, { metaKey: true });
      type(debugPhrase, document, { altKey: true });
      type(debugPhrase, document, { repeat: true });
      type('Iam');
      allowed = false;
      type('the');
      allowed = true;
      type('light');
      expect(activate).not.toHaveBeenCalled();
      type(debugPhrase);
      expect(activate).toHaveBeenCalledOnce();
      dispose();
      type(debugPhrase);
      expect(activate).toHaveBeenCalledOnce();
    } finally { dispose(); }
  });
});
