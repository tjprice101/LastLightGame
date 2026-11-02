import { describe, expect, it, vi } from 'vitest';
import { ACCOUNT_KEY, emptyAccount, loadAccount, saveAccount, setSquad, equipConduit, equipMasterConduit,
  saveSquadLoadout, renameSquadLoadout, equipSquadLoadout, deleteSquadLoadout,
  saveConduitConfiguration, renameConduitConfiguration, equipConduitConfiguration,
  sellCurrencyCreature, validateAccount } from './account';
import { SAVE_KEY, type ProfileStorage } from './profile';
import { currentEquipment } from './saved-loadouts';
import { conduits } from '../content/conduits';
import { createCreatureCopy } from './character-instances';
import { offlineSave, parseSaveFile } from './save-file';

const id = '00000000-0000-4000-8000-000000000001';
function storage(): ProfileStorage {
  const values = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  const storage: ProfileStorage = { getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); }, removeItem: key => { values.delete(key); } };
  saveAccount(storage, { ...emptyAccount(), characters: {
    ember: { level: 0, evolution: 1 }, tide: { level: 0, evolution: 1 }, sprout: { level: 0, evolution: 1 },
  }, squad: ['ember', 'tide'], conduits: { 'vigil-core': 1, 'bastion-lock': 1 },
    masterConduits: { 'master-ember-1': 1, 'master-ember-2': 1, 'master-tide-1': 1 } });
  return storage;
}
describe('saved squad and Conduit configurations', () => {
  it('loads legacy accounts without creating presets or writing, and preserves save exports', () => {
    const saved = storage(), raw = saved.getItem(ACCOUNT_KEY), writes = vi.spyOn(saved, 'setItem');
    expect(loadAccount(saved).squadLoadouts).toBeUndefined();
    expect(loadAccount(saved).conduitConfigurations).toBeUndefined();
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    expect(writes).not.toHaveBeenCalled();
    saveSquadLoadout(saved, id, ' First team ');
    saveConduitConfiguration(saved, 'ember', 0, 'First config');
    expect(parseSaveFile(JSON.stringify(offlineSave(saved))).account).toEqual(loadAccount(saved));
  });
  it.each([1, 2, 3])('snapshots %i ordered members and restores exact ordinary/Master equipment in one write', count => {
    const saved = storage();
    setSquad(saved, ['tide', 'ember', 'sprout'].slice(0, count));
    equipConduit(saved, 'tide', 7, 'vigil-core');
    equipMasterConduit(saved, 'tide', 'master-tide-1');
    const before = saveSquadLoadout(saved, id, 'Water lead');
    expect(before.squadLoadouts?.[0].members[0]).toMatchObject({
      character: 'tide', master: 'master-tide-1', conduits: [null, null, null, null, null, null, null, 'vigil-core'],
    });
    equipConduit(saved, 'tide', 7, null);
    equipMasterConduit(saved, 'tide', null);
    setSquad(saved, ['sprout']);
    const unrelated = currentEquipment(loadAccount(saved), 'sprout');
    const writes = vi.spyOn(saved, 'setItem');
    const equipped = equipSquadLoadout(saved, id);
    expect(writes).toHaveBeenCalledTimes(1);
    expect(equipped.squad).toEqual(before.squad);
    expect(currentEquipment(equipped, 'tide')).toEqual(currentEquipment(before, 'tide'));
    expect(currentEquipment(equipped, 'sprout')).toEqual(unrelated);
    expect(equipped.fractalis).toBe(before.fractalis);
  });
  it('supports all three named configurations, explicit saves, renaming and independent team snapshots', () => {
    const saved = storage();
    equipConduit(saved, 'ember', 0, 'vigil-core');
    equipMasterConduit(saved, 'ember', 'master-ember-1');
    saveConduitConfiguration(saved, 'ember', 0, 'Attack');
    equipConduit(saved, 'ember', 0, 'bastion-lock');
    equipMasterConduit(saved, 'ember', 'master-ember-2');
    saveConduitConfiguration(saved, 'ember', 1, 'Defense');
    equipConduit(saved, 'ember', 0, null);
    equipMasterConduit(saved, 'ember', null);
    saveConduitConfiguration(saved, 'ember', 2, 'Empty');
    renameConduitConfiguration(saved, 'ember', 0, 'Burst');
    const configs = loadAccount(saved).conduitConfigurations;
    expect(configs?.ember.map(config => config?.name)).toEqual(['Burst', 'Defense', 'Empty']);
    const writes = vi.spyOn(saved, 'setItem');
    expect(equipConduitConfiguration(saved, 'ember', 0).masterEquipment?.ember).toBe('master-ember-1');
    expect(writes).toHaveBeenCalledTimes(1);
    saveSquadLoadout(saved, id, 'Burst squad');
    equipConduitConfiguration(saved, 'ember', 1);
    expect(currentEquipment(loadAccount(saved), 'ember').conduits[0]).toBe('bastion-lock');
    const restored = equipSquadLoadout(saved, id);
    expect(restored.conduitConfigurations).toEqual(configs);
    expect(restored.conduitEquipment?.ember?.[0]).toBe('vigil-core');
    expect(restored.masterEquipment?.ember).toBe('master-ember-1');
    expect(equipConduitConfiguration(saved, 'ember', 2).conduitEquipment?.ember?.every(id => id === null)).toBe(true);
    expect(loadAccount(saved).masterEquipment?.ember).toBeNull();
  });
  it('overwrites and renames only the selected entry, allows many entries, and deletes without changing equipment', () => {
    const saved = storage();
    for (let index = 1; index <= 110; index++) saveSquadLoadout(saved, `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`, `Team ${index}`);
    expect(loadAccount(saved).squadLoadouts).toHaveLength(110);
    const second = structuredClone(loadAccount(saved).squadLoadouts?.[1]);
    setSquad(saved, ['sprout']);
    saveSquadLoadout(saved, id, 'Replaced');
    expect(loadAccount(saved).squadLoadouts?.[0].members.map(member => member.character)).toEqual(['sprout']);
    renameSquadLoadout(saved, id, ' Renamed ');
    expect(loadAccount(saved).squadLoadouts?.[0].name).toBe('Renamed');
    expect(loadAccount(saved).squadLoadouts?.[1]).toEqual(second);
    const before = loadAccount(saved), writes = vi.spyOn(saved, 'setItem');
    const after = deleteSquadLoadout(saved, id);
    expect(writes).toHaveBeenCalledTimes(1);
    expect(after).toEqual({ ...before, squadLoadouts: before.squadLoadouts?.slice(1) });
  });
  it('supports captured configurations and retains an explicitly unavailable team template after sale', () => {
    const saved = storage();
    const copy = createCreatureCopy('infusion:treasury:0');
    saveAccount(saved, { ...loadAccount(saved), capturedCharacters: [copy], squad: [copy.instanceId] });
    equipConduit(saved, copy.instanceId, 0, 'vigil-core');
    saveConduitConfiguration(saved, copy.instanceId, 0, 'Captured build');
    saveSquadLoadout(saved, id, 'Captured squad');
    setSquad(saved, ['ember']);
    equipConduit(saved, copy.instanceId, 0, null);
    const sold = sellCurrencyCreature(saved, copy.instanceId);
    expect(sold.conduitConfigurations?.[copy.instanceId]).toBeUndefined();
    expect(sold.squadLoadouts?.[0].members[0].character).toBe(copy.instanceId);
    const raw = saved.getItem(ACCOUNT_KEY), writes = vi.spyOn(saved, 'setItem');
    expect(() => equipSquadLoadout(saved, id)).toThrow('no longer owned');
    expect(writes).not.toHaveBeenCalled();
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    expect(loadAccount(saved).squad).toEqual(['ember']);
    expect(deleteSquadLoadout(saved, id).squadLoadouts).toEqual([]);
  });
  it.each(['', '   ', 'x'.repeat(41), 'bad\nname', '<script>\u0000'])('rejects invalid name %j without a write', name => {
    const saved = storage(), raw = saved.getItem(ACCOUNT_KEY), writes = vi.spyOn(saved, 'setItem');
    expect(() => saveSquadLoadout(saved, id, name)).toThrow('name');
    expect(() => saveConduitConfiguration(saved, 'ember', 0, name)).toThrow('name');
    expect(writes).not.toHaveBeenCalled();
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
  });
  it.each([-1, 3, 0.5, NaN])('rejects invalid configuration index %j', index => {
    const saved = storage(), writes = vi.spyOn(saved, 'setItem');
    expect(() => saveConduitConfiguration(saved, 'ember', index, 'Build')).toThrow('configuration');
    expect(() => equipConduitConfiguration(saved, 'ember', index)).toThrow('configuration');
    expect(() => renameConduitConfiguration(saved, 'ember', index, 'Build')).toThrow('configuration');
    expect(writes).not.toHaveBeenCalled();
  });
  it('rejects missing IDs, unsaved slots, unowned members and missing profiles without changes', () => {
    const saved = storage(), raw = saved.getItem(ACCOUNT_KEY), writes = vi.spyOn(saved, 'setItem');
    expect(() => saveSquadLoadout(saved, 'bad-id', 'Team')).toThrow('ID');
    expect(() => equipSquadLoadout(saved, id)).toThrow('Choose a saved');
    expect(() => renameSquadLoadout(saved, id, 'Team')).toThrow('Choose a saved');
    expect(() => deleteSquadLoadout(saved, id)).toThrow('Choose a saved');
    expect(() => equipConduitConfiguration(saved, 'ember', 0)).toThrow('first');
    expect(() => saveConduitConfiguration(saved, 'razor', 0, 'Team')).toThrow('no longer owned');
    saved.removeItem(SAVE_KEY);
    expect(() => saveSquadLoadout(saved, id, 'Team')).toThrow('first Element-Bearer');
    expect(writes).not.toHaveBeenCalled();
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
  });
  it('does not partially persist when any save/equip write fails', () => {
    const saved = storage();
    saveConduitConfiguration(saved, 'ember', 0, 'Build');
    saveSquadLoadout(saved, id, 'Team');
    const raw = saved.getItem(ACCOUNT_KEY);
    vi.spyOn(saved, 'setItem').mockImplementation(() => { throw new Error('Storage full'); });
    for (const operation of [
      () => saveSquadLoadout(saved, id, 'Overwrite'), () => renameSquadLoadout(saved, id, 'Rename'),
      () => equipSquadLoadout(saved, id), () => deleteSquadLoadout(saved, id),
      () => saveConduitConfiguration(saved, 'ember', 1, 'New'), () => renameConduitConfiguration(saved, 'ember', 0, 'Rename'),
      () => equipConduitConfiguration(saved, 'ember', 0),
    ]) {
      expect(operation).toThrow('Storage full');
      expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    }
  });
  it('strictly validates preset shapes, members, gear ownership, duplication, limits and elemental/Master compatibility', () => {
    const saved = storage();
    const account = saveSquadLoadout(saved, id, 'Team');
    saveConduitConfiguration(saved, 'ember', 0, 'Build');
    const mutateMember = (change: object) => ({ ...account, squadLoadouts: [{ ...account.squadLoadouts![0],
      members: [{ ...account.squadLoadouts![0].members[0], ...change }] }] });
    for (const value of [
      { ...account, squadLoadouts: {} }, { ...account, squadLoadouts: [...account.squadLoadouts!, ...account.squadLoadouts!] },
      { ...account, squadLoadouts: [{ ...account.squadLoadouts![0], members: [] }] },
      { ...account, squadLoadouts: [{ ...account.squadLoadouts![0], members: Array(4).fill(account.squadLoadouts![0].members[0]) }] },
      mutateMember({ character: 'razor' }), mutateMember({ character: 'capture:invalid' }), mutateMember({ element: 'oceanic' }),
      mutateMember({ conduits: [null] }), mutateMember({ conduits: ['vigil-core', 'vigil-core', ...Array(6).fill(null)] }),
      mutateMember({ conduits: ['unowned', ...Array(7).fill(null)] }), mutateMember({ master: 'master-tide-1' }),
      { ...account, conduitConfigurations: { ember: [] } }, { ...account, conduitConfigurations: { razor: [null, null, null] } },
    ]) expect(() => validateAccount(value)).toThrow();
    const omnic = conduits.filter(conduit => conduit.rarity === 'Omnic' && conduit.element === 'oceanic')[0];
    expect(omnic).toBeDefined();
    expect(() => validateAccount({ ...mutateMember({ conduits: [omnic.id, ...Array(7).fill(null)] }),
      conduits: { ...account.conduits, [omnic.id]: 1 } })).toThrow('requires');
    const five = conduits.filter(conduit => conduit.rarity === 'Omnic').slice(0, 5);
    expect(() => validateAccount({ ...mutateMember({ conduits: [...five.map(entry => entry.id), ...Array(3).fill(null)] }),
      conduits: Object.fromEntries(five.map(entry => [entry.id, 1])) })).toThrow('four Omnic');
  });
});
