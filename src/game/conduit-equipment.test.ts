import { describe, expect, it, vi } from 'vitest';

// Historical rules4 contract; Phase 0 numerical coverage lives in the phase-zero suites.
vi.mock('../content/phase-zero-stats', async importOriginal => ({
  ...await importOriginal<typeof import('../content/phase-zero-stats')>(),
  phaseZeroStatsReady: false,
}));
import { ACCOUNT_KEY, loadAccount, saveAccount, equipConduit, unequipAllConduits } from './account';
import { SAVE_KEY, type ProfileStorage } from './profile';
import { commonConduits as conduits, validateConduitSlots, type ConduitSlots } from '../content/conduits';
import { resolveFighter } from '../content/combat';
import { createSession } from '../presentation/battle-view';
import { nextStage, nextWave, act, damageAmount } from './battle';
import { playableDungeons } from '../content/dungeons';
import { characterDetail, homeHub } from '../presentation/hub';
import { getStarter } from '../content/starters';
import { createCreatureCopy } from './character-instances';

function storage(): ProfileStorage {
  const values = new Map([[SAVE_KEY, '{"version":1,"starterId":"ember"}']]);
  const saved = { getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); } };
  saveAccount(saved, { ...loadAccount(saved), characters: { ember: { level: 0, evolution: 1 }, tide: { level: 0, evolution: 1 } },
    conduits: Object.fromEntries(conduits.map((conduit) => [conduit.id, 1])) });
  return saved;
}
const slots: ConduitSlots = [...conduits.map((conduit) => conduit.id), null, null, null];
describe('Conduit loadouts', () => {
  it('clears all ordinary slots and the selected Master in one write without touching ownership or another member', () => {
    const saved = storage();
    const before = loadAccount(saved);
    before.conduitEquipment = { ember: [...slots], tide: [...slots] };
    before.masterConduits = { 'master-ember-1': 1, 'master-tide-1': 1 };
    before.masterEquipment = { ember: 'master-ember-1', tide: 'master-tide-1' };
    before.conduitUpgrades = { 'vigil-core': 3 };
    saveAccount(saved, before);
    const write = vi.spyOn(saved, 'setItem');
    const after = unequipAllConduits(saved, 'ember');
    expect(write).toHaveBeenCalledTimes(1);
    expect(after).toEqual({ ...before,
      conduitEquipment: { ...before.conduitEquipment, ember: Array(8).fill(null) },
      masterEquipment: { ...before.masterEquipment, ember: null } });
    expect(loadAccount(saved)).toEqual(after);
  });
  it('clears captured equipment, permits empty loadouts and preserves storage on invalid owners or failed writes', () => {
    const saved = storage();
    const account = loadAccount(saved);
    const copy = createCreatureCopy('infusion:treasury:0');
    account.capturedCharacters = [copy];
    account.conduitEquipment = { [copy.instanceId]: [...slots] };
    saveAccount(saved, account);
    expect(unequipAllConduits(saved, copy.instanceId).conduitEquipment?.[copy.instanceId]).toEqual(Array(8).fill(null));
    expect(unequipAllConduits(saved, copy.instanceId).masterEquipment).toBeUndefined();
    const raw = saved.getItem(ACCOUNT_KEY);
    expect(() => unequipAllConduits(saved, 'sprout')).toThrow('owned character');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    vi.spyOn(saved, 'setItem').mockImplementation(() => { throw new Error('Write denied'); });
    expect(() => unequipAllConduits(saved, copy.instanceId)).toThrow('Write denied');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
  });
  it('shares one owned unlock across characters without consuming it and saves removals', () => {
    const saved = storage();
    equipConduit(saved, 'ember', 0, 'vigil-core');
    const account = equipConduit(saved, 'tide', 2, 'vigil-core');
    expect(account.conduits?.['vigil-core']).toBe(1);
    expect(account.conduitEquipment?.ember?.[0]).toBe('vigil-core');
    expect(loadAccount(saved).conduitEquipment?.tide?.[2]).toBe('vigil-core');
    expect(equipConduit(saved, 'ember', 0, null).conduitEquipment?.ember).toEqual(Array(8).fill(null));
  });
  it('rejects duplicate names, unowned units/items, invalid slots and failed writes', () => {
    const saved = storage();
    equipConduit(saved, 'ember', 0, 'vigil-core');
    const raw = saved.getItem(ACCOUNT_KEY);
    expect(() => equipConduit(saved, 'ember', 1, 'vigil-core')).toThrow('once');
    expect(() => equipConduit(saved, 'sprout', 1, 'vigil-core')).toThrow('owned character');
    for (const index of [-1, 8, 1.5, NaN]) expect(() => equipConduit(saved, 'ember', index, null)).toThrow('ordinary');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    vi.spyOn(saved, 'setItem').mockImplementation(() => { throw new Error('Storage unavailable'); });
    expect(() => equipConduit(saved, 'ember', 0, null)).toThrow('Storage unavailable');
    expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
  });
  it('rejects malformed or unowned persisted equipment without overwriting it', () => {
    const saved = storage();
    const base = loadAccount(saved);
    for (const equipment of [null, [], { ember: [] }, { sprout: slots }, { ember: ['missing', ...Array(7).fill(null)] },
      { ember: ['vigil-core', 'vigil-core', ...Array(6).fill(null)] }]) {
      const raw = JSON.stringify({ ...base, conduitEquipment: equipment });
      saved.setItem(ACCOUNT_KEY, raw);
      expect(() => loadAccount(saved)).toThrow();
      expect(saved.getItem(ACCOUNT_KEY)).toBe(raw);
    }
    saved.setItem(ACCOUNT_KEY, JSON.stringify({ ...base, conduits: {}, conduitEquipment: { ember: slots } }));
    expect(() => loadAccount(saved)).toThrow('owned Conduit');
  });
  it('applies exact post-growth bonuses, preserves legacy weapon effects, and never mutates base stats', () => {
    for (const progress of [{ level: 0, evolution: 1 }, { level: 105, evolution: 6, weaponRank: 4 }]) {
      const base = resolveFighter('ember', progress);
      const equipped = resolveFighter('ember', progress, slots);
      expect(equipped.stats.health).toBeCloseTo(base.stats.health * 1.06);
      expect(equipped.stats.damage).toBeCloseTo(base.stats.damage);
      expect(equipped.stats.defense).toBeCloseTo(base.stats.defense * 1.1);
      expect(equipped.stats.crit).toBeCloseTo(base.stats.crit);
      expect(equipped.stats.shatterCapacity).toBeCloseTo(base.stats.shatterCapacity + 10);
      expect(resolveFighter('ember', progress)).toEqual(base);
    }
    expect(() => validateConduitSlots(['vigil-core'])).toThrow('slots');
  });
  const destinations = [...playableDungeons.map((element) => ({ element, stage: 1 })),
    ...(['heavens', 'abyss'] as const).map((mode) => ({ mode, stage: 1 }))];
  it.each(destinations)('snapshots effective stats and keeps equipment/Gauge through $element $mode Continue/replay', (destination) => {
    const equipment = { ember: [...slots] };
    const progress = { level: 105, evolution: 6 };
    const session = createSession('ember', progress, destination, { ids: ['ember'], progress: { ember: progress }, equipment });
    equipment.ember.fill(null);
    expect(session.state.allies[0].conduits).toEqual(slots);
    expect(session.state.allies[0].stats).toEqual(resolveFighter('ember', progress, slots).stats);
    session.state.phase = 'cleared';
    session.state.allies[0].shatter = 75;
    const next = nextStage(session.state, progress).state;
    expect(next.allies[0].stats).toEqual(session.state.allies[0].stats);
    expect(next.allies[0].shatter).toBe(80);
    const replay = createSession('ember', progress, destination, { ids: ['ember'], progress: { ember: progress },
      equipment: { ember: next.allies[0].conduits } });
    expect(replay.state.allies[0].stats).toEqual(next.allies[0].stats);
  });
  it('carries equipment through Adventure and exposes effective/base values in menus', () => {
    const saved = storage();
    let account = loadAccount(saved);
    slots.forEach((id, index) => { if (id) account = equipConduit(saved, 'ember', index, id); });
    const session = createSession('ember', { level: 0, evolution: 1 }, undefined, {
      ids: ['ember'], progress: account.characters, equipment: account.conduitEquipment });
    session.state.allies[0].stats.crit = 0;
    const hit = act(session.state, 'ember', 'light', session.state.enemies[0].id);
    const damage = hit.events.find((event) => event.kind === 'damage')!;
    expect(damage.amount).toBe(
      damageAmount(resolveFighter('ember', { level: 0, evolution: 1 }, slots).stats.damage, 1.08,
        session.state.enemies[0].stats.defense, damage.critical));
    session.state.phase = 'cleared';
    expect(nextWave(session.state).state.allies[0].conduits).toEqual(slots);
    expect(homeHub(getStarter('ember'), false, account)).toContain('<strong class="stat-change stat-change--increase">233.2</strong>');
    expect(characterDetail(getStarter('ember'), 'overview', account)).toContain('Before Conduits: 220');
    const html = characterDetail(getStarter('ember'), 'equipment', account);
    expect(html.match(/data-conduit-slot=/g)).toHaveLength(8);
    expect(html).toContain('Vigil Core');
    expect(html).toContain('data-master-equipment="ember"');
    expect(html).toContain('No Master equipped');
  });
});
