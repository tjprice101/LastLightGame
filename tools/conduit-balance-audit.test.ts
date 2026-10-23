import { describe, expect, it } from 'vitest';
import { conduits, validateConduitElement, validateConduitSlots } from '../src/content/conduits';
import { masterConduits } from '../src/content/master-conduits';
import { getStarter } from '../src/content/starters';
import { auditBattle, auditCatalog, auditEncounters, auditGear, runWinningAudit, stasisPacketProbe } from './conduit-balance-audit';
import { measureBattle } from './battle-survey';

describe('read-only exhaustive Conduit audit integrity', () => {
  it('accounts for all138 IDs, all16 wearer decisions and all legal upgrade endpoints', () => {
    expect(conduits).toHaveLength(90);
    expect(masterConduits).toHaveLength(48);
    expect(auditCatalog).toHaveLength(138);
    expect(new Set(auditCatalog.map(piece => piece.id)).size).toBe(138);
    for (const piece of auditCatalog) {
      expect(piece.eligible.length).toBeGreaterThan(0);
      expect(piece.eligible.length + piece.skipped.length).toBe(16);
      expect(piece.levels).toEqual(piece.rarity === 'Master' ? [0] : [0, 5]);
    }
  });
  it('constructs legal restrictions and exactly one focal difference on/off', () => {
    for (const piece of auditCatalog) for (const wearer of piece.eligible)
      for (const context of ['isolated', 'supported'] as const) {
        const on = auditGear(piece.id, wearer, 5, context, true);
        const off = auditGear(piece.id, wearer, 5, context, false);
        for (const id of on.roster) {
          expect(() => validateConduitElement(validateConduitSlots(on.equipment[id]), getStarter(id).elementId)).not.toThrow();
          if (id !== wearer) expect(on.equipment[id]).toEqual(off.equipment[id]);
        }
        if (piece.rarity === 'Master') {
          expect(on.equipment).toEqual(off.equipment);
          expect(on.masters[wearer]).toBe(piece.id);
          expect(off.masters).toEqual({});
        } else {
          expect(on.equipment[wearer]!.slice(0, 7)).toEqual(off.equipment[wearer]!.slice(0, 7));
          expect(on.equipment[wearer]![7]).toBe(piece.id);
          expect(off.equipment[wearer]![7]).toBeNull();
          expect(off.equipment[wearer]).not.toContain(piece.id);
        }
      }
  });
  it('uses real level105 allies and unchanged native enemies and distinguishes timeouts', () => {
    const state = auditBattle('stasis-reliquary', 'tide', 5, 'supported', true, auditEncounters[5], 1729);
    expect(state.allies.map(unit => unit.level)).toEqual([105, 105, 105]);
    expect(state.enemies[0].level).toBe(185);
    const copy = structuredClone(state);
    const first = measureBattle(state);
    expect(measureBattle(state)).toEqual(first);
    expect(state).toEqual(copy);
    expect(measureBattle(state, 'native', { rounds: 0, decisions: 0 }).result.outcome).toBe('timeout');
  });
  it('reproduces fixed Stasis alternating protection/cooldown across eight turns at both upgrade endpoints', () => {
    const base = stasisPacketProbe(0), maximum = stasisPacketProbe(5);
    expect(base).toEqual(maximum);
    expect(base.map(turn => turn.protected)).toEqual([true, false, true, false, true, false, true, false]);
    expect(base.map(turn => turn.penalty)).toEqual([false, true, false, true, false, true, false, true]);
    expect(base.filter(turn => turn.protected).every(turn => turn.hpLoss === 0)).toBe(true);
    expect(base.filter(turn => turn.penalty).every(turn => turn.hpLoss === 249)).toBe(true);
  });
  it('keeps matched multi-piece synergy controls identical except for Stasis', () => {
    const extra = ['granite-hourglass', 'verdict-caliper', 'fieldbrace-coupler', 'immortal-vessel'] as const;
    for (const context of ['isolated', 'supported'] as const) {
      const on = auditBattle('stasis-reliquary', 'ember', 5, context, true, auditEncounters[0], 1729, [...extra]);
      const off = auditBattle('stasis-reliquary', 'ember', 5, context, false, auditEncounters[0], 1729, [...extra]);
      expect(on.allies[0].conduits!.filter(id => id !== 'stasis-reliquary' && id !== null))
        .toEqual(off.allies[0].conduits!.filter(id => id !== null));
      for (const piece of extra) expect(on.allies[0].conduits).toContain(piece);
      expect(on.allies[0].stats).toEqual(off.allies[0].stats);
      expect(on.enemies).toEqual(off.enemies);
    }
  });
  it('emits complete matching control/event replays for the three-round native EX+3 outlier', () => {
    const rows: unknown[] = [];
    runWinningAudit([{ category: 'all-calamity-patterns', id: 'master-razor-1', wearer: 'razor',
      level: 0, context: 'supported', encounter: 'Calamity atmospheric EX+3', seed: 104729,
      on: { outcome: 'win' }, off: { outcome: 'defeat' } }], row => rows.push(row));
    expect(rows).toHaveLength(1);
    const replay = rows[0] as { on: { outcome: string; initial: { enemies: { hp: number }[] };
      final: { round: number; enemies: { hp: number }[] }; packets: { events: { nativeKind?: string; amount: number }[] }[] };
      off: { outcome: string } };
    expect(replay.on.outcome).toBe('win');
    expect(replay.off.outcome).toBe('defeat');
    expect(replay.on.initial.enemies[0].hp).toBe(3_059_413);
    expect(replay.on.final.round).toBe(3);
    expect(replay.on.final.enemies[0].hp).toBe(0);
    expect(replay.on.packets.flatMap(packet => packet.events).find(event => event.nativeKind === 'revenge')!.amount)
      .toBe(2_074_432);
  });
});
