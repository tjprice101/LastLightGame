import { describe, expect, it } from 'vitest';
import { conduits, validateConduitElement, validateConduitSlots } from '../src/content/conduits';
import { masterConduits } from '../src/content/master-conduits';
import { getStarter } from '../src/content/starters';
import { auditBattle, auditCatalog, auditEncounters, auditGear, auditLimits, runWinningAudit, stasisPacketProbe } from './conduit-balance-audit';
import { measureBattle } from './battle-survey';
import { calamityEncounter } from '../src/content/calamity';
import type { BattleState } from '../src/game/battle';

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
    expect(state.enemies[0].level).toBe(170);
    const copy = structuredClone(state);
    const first = measureBattle(state);
    expect(measureBattle(state)).toEqual(first);
    expect(state).toEqual(copy);
    expect(measureBattle(state, 'native', { rounds: 0, decisions: 0 }).result.outcome).toBe('timeout');
  });
  it('measures seeded Stasis spillover rolls rather than historical whole-turn immunity', () => {
    const base = stasisPacketProbe(0), maximum = stasisPacketProbe(5);
    expect(base[0].protected).toBe(false);
    expect(maximum[0].protected).toBe(true);
    for (const turns of [base, maximum]) {
      expect(turns.filter(turn => turn.protected).every(turn => turn.hpLoss === 100)).toBe(true);
      expect(turns.filter(turn => turn.penalty).every(turn => turn.hpLoss === 249)).toBe(true);
      expect(turns.filter(turn => !turn.protected && !turn.penalty).every(turn => turn.hpLoss === 199)).toBe(true);
      for (let index = 1; index < turns.length; index++)
        expect(turns[index].penalty).toBe(turns[index - 1].protected);
    }
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
  it('emits matching control/event replays under current EX+3 stats, not historical outlier outcomes', () => {
    const rows: unknown[] = [];
    const encounter = { kind: 'calamity', activity: 'atmospheric', tier: 3 } as const;
    const primary = [true, false].map(on => measureBattle(auditBattle('master-razor-1', 'razor',
      0, 'supported', on, encounter, 104729), 'native', auditLimits));
    runWinningAudit([{ category: 'all-calamity-patterns', id: 'master-razor-1', wearer: 'razor',
      level: 0, context: 'supported', encounter: 'Calamity atmospheric EX+3', seed: 104729,
      on: primary[0].result, off: primary[1].result }], row => rows.push(row));
    expect(rows).toHaveLength(1);
    const replay = rows[0] as { on: { outcome: string; initial: { enemies: { hp: number }[] };
      final: BattleState; packets: { events: { nativeKind?: string; amount: number }[] }[] };
      off: { outcome: string; final: BattleState } };
    expect(replay.on.outcome).toBe(primary[0].result.outcome);
    expect(replay.off.outcome).toBe(primary[1].result.outcome);
    expect(replay.on.initial.enemies[0].hp).toBe(calamityEncounter('atmospheric', 3).stats.health);
    expect(replay.on.final).toEqual(primary[0].state);
    expect(replay.off.final).toEqual(primary[1].state);
    expect(replay.on.packets.flatMap(packet => packet.events).find(event => event.nativeKind === 'revenge')!.amount)
      .toBeGreaterThan(0);
  });
});
