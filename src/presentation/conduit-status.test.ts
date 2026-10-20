import { describe, expect, it } from 'vitest';
import { createSession } from './battle-view';
import { conduitStatusSnapshot, conduitStatuses } from './conduit-status';
import { unitReadout } from './unit-readout';
import { nativeBalance } from '../content/native-balance';

describe('accessible Conduit control and protection readouts', () => {
  it('describes active Master links as Gauge income, not shared damage', () => {
    const state = createSession('disciple').state;
    const owner = state.allies[0];
    owner.conduitRuntime = { numbers: { linkThrough: 2 }, owners: { link: owner.id } };
    const snapshot = conduitStatusSnapshot(owner);
    expect(conduitStatuses(snapshot, 2, [owner])).toContain(`Linked Gauge income · ${owner.name}.`);
    expect(conduitStatuses(snapshot, 2, [owner])).not.toContain('Shared direct damage');
    expect(conduitStatuses(snapshot, 3, [owner])).not.toContain('Linked Gauge income');
    owner.hp = 0;
    expect(conduitStatuses(snapshot, 2, [owner])).not.toContain('Linked Gauge income');
  });

  it('shows precise text for protection and control without inventing icon URLs', () => {
    const state = createSession('ember').state;
    const ally = state.allies[0];
    const enemy = state.enemies[0];
    ally.conduitRuntime = { numbers: { windveil: 1, criticalSeal: 1, stasisSkip: 2, quietFeather: 1 },
      owners: { accord: ally.id }, layers: [{ amount: 20, owner: ally.id, native: false, plate: true }] };
    enemy.conduitRuntime = { numbers: { rootbind: 1, silence: 1 }, owners: { taunt: ally.id } };
    ally.masterConduit = 'master-tide-3';
    enemy.weakened = 1;
    enemy.weakenSourceId = ally.id;
    const html = unitReadout(ally, true, [ally], 1);
    expect(html).toContain('Windveil');
    expect(html).toContain('Critical Seal');
    expect(html).toContain('cannot act on turn 2');
    expect(html).toContain('Accord');
    expect(html).toContain('Shield plates: 1');
    expect(html).toContain('Skill 1 costs no Elemental Gauge');
    expect(conduitStatuses(conduitStatusSnapshot(ally), 1, [ally])).not.toContain('<img');
    const hostile = unitReadout(enemy, true, [ally], 1);
    expect(hostile).toContain('Rootbind');
    expect(hostile).toContain('Silence');
    expect(hostile).toContain('becomes a Normal Attack');
    expect(hostile).toContain('Taunt');
  });

  it('freezes snapshots, hides consumed/dead states and escapes owner names', () => {
    const state = createSession('ember').state;
    const unit = state.allies[0];
    unit.name = '<script>bad</script>';
    unit.conduitRuntime = { numbers: { windveil: 1, stasisSkip: 1 }, owners: { accord: unit.id } };
    const snapshot = conduitStatusSnapshot(unit);
    delete unit.conduitRuntime.numbers.windveil;
    const html = conduitStatuses(snapshot, 2, [unit]);
    expect(html).toContain('Windveil');
    expect(html).not.toContain('cannot act');
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
    expect(conduitStatuses(conduitStatusSnapshot(unit), 2, [unit])).not.toContain('Windveil');
    unit.hp = 0;
    expect(conduitStatuses(conduitStatusSnapshot(unit), 2, [unit])).toBe('');
  });

  it.each([1, 2])('does not revive native Bloom charges from a historical Graft bonus %s', bonus => {
    const state = createSession('sprout').state;
    const unit = state.allies[0];
    unit.conduitRuntime = { numbers: { graftBonus: bonus }, owners: {} };
    unit.pilot = { bloom: 3 + bonus };
    unit.conduitCharges = { normalMomentum: true };
    unit.native = { seeds: { sprout: { fraction: nativeBalance.flora.seed, dueRound: 2 } } };
    const readout = unitReadout(unit, true, state.allies, state.round, state);
    expect(readout).toContain('Seed');
    expect(readout).toContain(`${nativeBalance.flora.seed * 100}%`);
    expect(readout).toContain('player turn 2');
    expect(readout).not.toContain('Botanic Renewal');
    expect(readout).not.toContain('charges');
    expect(unitReadout(unit)).not.toContain('Next offensive skill: +10%');
  });
});
