import { describe, expect, it, vi } from 'vitest';
import { ACCOUNT_KEY, loadAccount, saveAccount, equipConduit } from './account';
import { SAVE_KEY, type ProfileStorage } from './profile';
import { conduits, validateConduitSlots, type ConduitSlots } from '../content/conduits';
import { resolveFighter } from '../content/combat';
import { createSession } from '../presentation/battle-view';
import { nextStage, nextWave, act, damageAmount } from './battle';
import { playableDungeons } from '../content/dungeons';
import { characterDetail, homeHub } from '../presentation/hub';
import { getStarter } from '../content/starters';

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
      expect(equipped.stats.health).toBeCloseTo(base.stats.health * 1.05);
      expect(equipped.stats.damage).toBeCloseTo(base.stats.damage * 1.05);
      expect(equipped.stats.defense).toBeCloseTo(base.stats.defense * 1.05);
      expect(equipped.stats.crit).toBeCloseTo(base.stats.crit + .02);
      expect(equipped.stats.shatterCapacity).toBeCloseTo(base.stats.shatterCapacity + 5);
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
    expect(next.allies[0].shatter).toBe(75);
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
    expect(hit.events.find((event) => event.kind === 'damage')?.amount).toBe(
      damageAmount(resolveFighter('ember', { level: 0, evolution: 1 }, slots).stats.damage, 1,
        session.state.enemies[0].stats.defense, false));
    session.state.phase = 'cleared';
    expect(nextWave(session.state).state.allies[0].conduits).toEqual(slots);
    expect(homeHub(getStarter('ember'), false, account)).toContain('<strong>231</strong>');
    expect(characterDetail(getStarter('ember'), 'overview', account)).toContain('Before Conduits: 220');
    const html = characterDetail(getStarter('ember'), 'equipment', account);
    expect(html.match(/data-conduit-slot=/g)).toHaveLength(8);
    expect(html).toContain('Vigil Core');
    expect(html).toContain('Reserved / Not available');
  });
});
