import { describe, expect, it, vi } from 'vitest';
import { kitConduitDesigns, convertedKitConduitIds } from '../content/kit-conduits';
import { conduits, getConduit, conduitBuffs, conduitEffect, validateConduitElement, validateConduitSlots, type ConduitId, type ConduitSlots } from '../content/conduits';
import { machineConduitDrops, machineConduitLoot, isBannerConduitEligible } from '../content/machines';
import { resolveFighter } from '../content/combat';
import { starters } from '../content/starters';
import { act, createBattle, createInfusionBattle, endTurn, nextStage, nextWave, actionUnavailable, type BattleState, type BattleEvent } from './battle';
import { ACCOUNT_KEY, emptyAccount, saveAccount, loadAccount, purchaseConduit, equipConduit, saveAccountRewards, upgradeConduit } from './account';
import { SAVE_KEY, type ProfileStorage } from './profile';
import { createCreatureCopy } from './character-instances';
import { conduitInventory, conduitStore, kitConduitRules } from '../presentation/conduit-store';
import { archives } from '../presentation/archives';
import { createSession } from '../presentation/battle-view';
import { unitReadout } from '../presentation/unit-readout';
import { readableEffect } from '../presentation/effect-copy';

function slots(...ids: ConduitId[]): ConduitSlots {
  return [...ids, ...Array<null>(8 - ids.length).fill(null)];
}
function storage(raw?: unknown): ProfileStorage {
  const data = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  if (raw) data.set(ACCOUNT_KEY, JSON.stringify(raw));
  return { getItem: (key) => data.get(key) ?? null, setItem: vi.fn((key, value) => { data.set(key, value); }),
    removeItem: (key) => { data.delete(key); } };
}
function battle(id: ConduitId): BattleState {
  const owner = starters.find((starter) => starter.elementId === getConduit(id).element)!;
  const roster = [owner.id, ...starters.filter((starter) => starter.id !== owner.id).slice(0, 2).map((starter) => starter.id)];
  const state = createBattle(1729, roster, {}, { [owner.id]: slots(id) });
  state.allies.forEach((ally, index) => {
    ally.stats.health = 1000;
    ally.hp = [900, 400, 700][index];
    ally.shatter = 0;
    ally.stats.shatterCapacity = 100;
    ally.stats.crit = 0;
    ally.readyRound = { skill1: 6, skill2: 5 };
  });
  state.enemies.forEach((enemy) => { enemy.hp = enemy.stats.health = 1e8; enemy.stats.defense = 0; enemy.stats.damage = 0; enemy.stats.crit = 0; });
  return state;
}

describe('replacement Omnic catalog, acquisition and stable identity', () => {
  it('replaces exactly25 entries, retains90 identities, and authors unique bounded interactions and epic devices', () => {
    expect(kitConduitDesigns).toHaveLength(25);
    expect(conduits).toHaveLength(90);
    for (const [rarity, count] of [['Common', 10], ['Rare', 15], ['Legendary', 15], ['Omnic', 45], ['Calamitic', 5]] as const) {
      expect(conduits.filter((entry) => entry.rarity === rarity)).toHaveLength(count);
    }
    expect(new Set(kitConduitDesigns.map((entry) => entry.id)).size).toBe(25);
    expect(new Set(kitConduitDesigns.map((entry) => entry.effect)).size).toBe(25);
    expect(new Set(kitConduitDesigns.map((entry) => entry.artDesign)).size).toBe(25);
    expect(new Set(kitConduitDesigns.map((entry) => entry.theme)).size).toBe(6);
    for (const entry of kitConduitDesigns) {
      expect(entry.rarity).toBe('Omnic');
      expect(entry.element).toBe(entry.theme);
      expect(entry.price).toBeNull();
      expect(entry.artDesign).toContain('fully reborn');
      expect(entry.artDesign).toContain('six majestic');
      expect(entry.artDesign).not.toContain('small bronze');
      expect(entry.buffs).toEqual([]);
      expect(isBannerConduitEligible(entry.id)).toBe(false);
      expect(conduitEffect(getConduit(entry.id), 5)).not.toContain('->');
      expect(conduitBuffs(getConduit(entry.id), 5)).toEqual([]);
    }
  });

  it('rolls each of45 Omnics at1%/45 from stage75 without changing lower totals or roll counts', () => {
    const pool = conduits.filter((entry) => entry.rarity === 'Omnic');
    for (const [index, entry] of pool.entries()) {
      const values = [.08, .035, 0, (index + .5) / pool.length];
      const random = vi.fn(() => values.shift()!);
      expect(machineConduitDrops(75, random)).toEqual({ [entry.id]: 1 });
      expect(random).toHaveBeenCalledTimes(4);
      expect(machineConduitLoot(75).find((drop) => drop.id === entry.id)?.chance).toBeCloseTo(.01 / 45, 12);
      expect(machineConduitLoot(74).some((drop) => drop.id === entry.id)).toBe(false);
    }
    for (const [rarity, chance] of [['Rare', .08], ['Legendary', .035], ['Omnic', .01]] as const) {
      expect(machineConduitLoot(75).filter((drop) => getConduit(drop.id).rarity === rarity).reduce((sum, drop) => sum + drop.chance, 0)).toBeCloseTo(chance);
    }
    const below = vi.fn(() => .99);
    expect(machineConduitDrops(74, below)).toEqual({});
    expect(below).toHaveBeenCalledTimes(2);
    expect(conduits.filter((entry) => isBannerConduitEligible(entry.id))).toHaveLength(5);
  });

  it('removes replacement entries from Store while inventory, Archive and detailed references share live rules', () => {
    const account = { ...emptyAccount(), conduits: Object.fromEntries(kitConduitDesigns.map((entry) => [entry.id, 1])) };
    const saved = storage(account);
    for (const entry of kitConduitDesigns) {
      expect(conduitInventory(account)).toContain(entry.name);
      expect(archives(account, 'conduits')).toContain(entry.name);
      expect(kitConduitRules(slots(entry.id))).toContain(readableEffect(conduitEffect(getConduit(entry.id))));
      expect(conduitStore(account)).not.toContain(entry.name);
      expect(() => purchaseConduit(saved, entry.id)).toThrow('not sold');
    }
    expect(saved.setItem).not.toHaveBeenCalled();
  });

  it('saves actual Omnic machine awards once, preserving raw wallets on overflow and denied writes', () => {
    const state = createInfusionBattle('machines', 75, 1729, 'ember', { level: 0, evolution: 1 });
    state.enemies[0].hp = 1;
    const result = act(state, 'ember', 'light', state.enemies[0].id);
    const reward = result.events.find((entry) => entry.kind === 'reward')!;
    reward.conduits = { 'firstlight-cam': 1, 'duplex-heart': 1, 'worldbreaker-drive': 1 };
    const saved = storage();
    const account = saveAccountRewards(saved, result, 'new-omnic');
    expect(account.conduits).toEqual(reward.conduits);
    expect(saveAccountRewards(saved, result, 'new-omnic')).toEqual(account);
    expect(saved.setItem).toHaveBeenCalledTimes(1);
    const overflowing = storage({ ...emptyAccount(), version: 4, conduits: { 'firstlight-cam': Number.MAX_SAFE_INTEGER } });
    const raw = overflowing.getItem(ACCOUNT_KEY);
    expect(() => saveAccountRewards(overflowing, result, 'overflow')).toThrow();
    expect(overflowing.getItem(ACCOUNT_KEY)).toBe(raw);
    const denied = storage({ ...emptyAccount(), version: 4 });
    const deniedRaw = denied.getItem(ACCOUNT_KEY);
    denied.setItem = () => { throw new Error('Storage unavailable'); };
    expect(() => saveAccountRewards(denied, result, 'denied')).toThrow('Storage unavailable');
    expect(denied.getItem(ACCOUNT_KEY)).toBe(deniedRaw);
  });
});

describe('v5 marker and read-only converted equipment compatibility', () => {
  function legacy() {
    const converted = kitConduitDesigns.filter((entry) => entry.element === 'infernic').map((entry) => entry.id);
    const original = conduits.filter((entry) => entry.element === 'infernic' && !convertedKitConduitIds.has(entry.id)).map((entry) => entry.id);
    const copy = createCreatureCopy('infusion:treasury:0', 1, 65);
    copy.locked = true;
    const equipment = slots(...converted.slice(0, 6), ...original);
    return { ...emptyAccount(), version: 4, fractalis: 4000, lycalis: 37, mechanicalComponents: 5000,
      characters: { ember: { level: 30, evolution: 2, weaponRank: 3 }, tide: { level: 0, evolution: 1 } },
      conduits: Object.fromEntries([...converted, ...original, 'firstlight-cam', 'vigil-core'].map((id) => [id, 2])),
      conduitEquipment: { ember: equipment, tide: slots('tempered-strike-link', 'vigil-core'), [copy.instanceId]: slots('firstlight-cam') },
      conduitUpgrades: { 'tempered-strike-link': 3, 'firstlight-cam': 5 },
      capturedCharacters: [copy], characterLocks: { ember: true }, squad: [copy.instanceId, 'ember'],
      materials: { 'infernic-common': 8 }, dungeonStages: { infernic: 13 }, storyCompleted: 9,
      receipts: ['prior'], creatures: { 'infusion:treasury:0': { defeated: true } },
      bannerPity: { standard: { highestStar: 77, unownedHighestStar: 99 } } };
  }
  it('only unequips converted mismatches/excess, reserves original final slots, preserves ownership/upgrades/locks/squad and writes nothing on load', () => {
    const raw = legacy();
    const saved = storage(raw);
    const before = saved.getItem(ACCOUNT_KEY);
    const account = loadAccount(saved);
    expect(account.version).toBe(5);
    expect(account.conduitEquipment?.ember).toEqual([...raw.conduitEquipment.ember.slice(0, 2), null, null, null, null, ...raw.conduitEquipment.ember.slice(6)]);
    expect(account.conduitEquipment?.tide).toEqual(slots('vigil-core').map((id, index) => index === 1 ? 'vigil-core' : null));
    expect(account.conduitEquipment?.[raw.capturedCharacters[0].instanceId]).toEqual(raw.conduitEquipment[raw.capturedCharacters[0].instanceId]);
    for (const key of ['conduits', 'conduitUpgrades', 'capturedCharacters', 'characterLocks', 'squad', 'characters',
      'materials', 'dungeonStages', 'storyCompleted', 'receipts', 'creatures', 'bannerPity', 'lycalis', 'mechanicalComponents'] as const) {
      expect(account[key]).toEqual(raw[key]);
    }
    expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
    expect(saved.setItem).not.toHaveBeenCalled();
    const purchased = purchaseConduit(saved, 'vigil-core');
    expect(purchased.version).toBe(5);
    expect(saved.setItem).toHaveBeenCalledTimes(1);
    expect(loadAccount(saved)).toEqual(purchased);
    const corrupted = { ...purchased, conduitEquipment: { ...purchased.conduitEquipment, tide: slots('tempered-strike-link') } };
    saved.setItem(ACCOUNT_KEY, JSON.stringify(corrupted));
    const invalidRaw = saved.getItem(ACCOUNT_KEY);
    expect(() => loadAccount(saved)).toThrow('requires');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(invalidRaw);
  });
  it('uses the same compatibility path for v2/v3 without remigrating v4/v5 material and dungeon keys', () => {
    for (const version of [2, 3, 4]) {
      const raw = { ...legacy(), version, dungeonStages: { infernic: 1 } };
      const saved = storage(raw);
      expect(loadAccount(saved).conduitEquipment?.tide?.[0]).toBeNull();
      expect(loadAccount(saved).version).toBe(5);
      expect(saved.setItem).not.toHaveBeenCalled();
    }
    expect(loadAccount(storage({ ...emptyAccount(), version: 4, dungeonStages: { infernic: 13 } })).dungeonStages).toEqual({ infernic: 13 });
    expect(loadAccount(storage({ version: 1, fractalis: 123 })).fractalis).toBe(123);
  });
  it('does not repair other malformed legacy data, including duplicate/unowned converted gear or original element/limit corruption', () => {
    const raw = legacy();
    const original = raw.conduitEquipment.ember.slice(6).filter((id): id is ConduitId => id !== null);
    for (const changed of [
      { ...raw, conduitEquipment: { ember: slots('tempered-strike-link', 'tempered-strike-link') } },
      { ...raw, conduits: {}, conduitEquipment: { tide: slots('tempered-strike-link') } },
      { ...raw, conduitEquipment: { tide: slots(...original) } },
      { ...raw, conduitEquipment: { ember: [null] } },
      { ...raw, conduitUpgrades: { 'tempered-strike-link': 6 } },
    ]) {
      const saved = storage(changed);
      const before = saved.getItem(ACCOUNT_KEY);
      expect(() => loadAccount(saved)).toThrow();
      expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
      expect(saved.setItem).not.toHaveBeenCalled();
    }
  });
  it('preserves legacy raw data on transaction rejection and denied persistence; subsequent retry migrates exactly once', () => {
    const saved = storage(legacy());
    const before = saved.getItem(ACCOUNT_KEY);
    expect(() => equipConduit(saved, 'tide', 0, 'tempered-strike-link')).toThrow('requires');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
    const write = saved.setItem;
    saved.setItem = () => { throw new Error('Denied'); };
    expect(() => purchaseConduit(saved, 'vigil-core')).toThrow('Denied');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
    saved.setItem = write;
    purchaseConduit(saved, 'vigil-core');
    expect(saved.setItem).toHaveBeenCalledTimes(1);
    expect(loadAccount(saved).version).toBe(5);
  });
  it('strictly rejects new/current wrong elements and fifth Omnics at account and fighter boundaries', () => {
    const all = kitConduitDesigns.filter((entry) => entry.element === 'infernic').map((entry) => entry.id);
    expect(() => validateConduitSlots(slots(...all.slice(0, 5)))).toThrow('four');
    expect(() => validateConduitElement(slots('tempered-strike-link'), 'oceanic')).toThrow('requires');
    expect(() => resolveFighter('tide', { level: 0, evolution: 1 }, slots('tempered-strike-link'))).toThrow('requires');
    const saved = storage({ ...emptyAccount(), characters: { ember: { level: 0, evolution: 1 } },
      conduits: Object.fromEntries(all.map((id) => [id, 1])), conduitEquipment: { ember: slots(...all.slice(0, 4)) } });
    const before = saved.getItem(ACCOUNT_KEY);
    expect(() => equipConduit(saved, 'ember', 7, all[4])).toThrow('four');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(before);
  });
});
