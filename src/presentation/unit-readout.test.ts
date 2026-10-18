import { describe, expect, it } from 'vitest';
import { createBattle } from '../game/battle';
import { unitReadout } from './unit-readout';
import { nativeBalance } from '../content/native-balance';

describe('field readouts', () => {
  it('shows native state without retired shared intrinsic stack counters', () => {
    const state = createBattle(7, ['ember', 'tide', 'sprout']);
    state.allies[0].pilot = { ember: 3 };
    state.allies[1].pilot = { ward: 2 };
    state.allies[2].pilot = { bloom: 3 };
    state.allies[0].conduitCharges = { emberSeals: 1 };
    state.allies[0].native = { burns: { [state.enemies[0].id]: { damage: 15, turns: 2 } } };
    state.allies[2].native = { seeds: { tide: { fraction: nativeBalance.flora.seed, dueRound: 2 } } };
    const fire = unitReadout(state.allies[0], true, state.allies, state.round, state);
    expect(fire).not.toContain('15 × 2');
    expect(fire).not.toContain('Burn');
    expect(unitReadout(state.allies[2], true, state.allies, state.round, state)).toContain('Seed');
    expect(fire).not.toContain('Infernic Embers 3 / 3');
    expect(unitReadout(state.allies[1], true, state.allies, state.round, state)).not.toContain('Oceanic Protection 2 / 3');
    expect(unitReadout(state.allies[0])).not.toContain('Conduit Ember Seals 1/3');
    expect(fire).not.toContain('native-kit-state');
    state.allies[2].hp = 0;
    expect(unitReadout(state.allies[2], true)).not.toContain('class="unit-kit-resource"');
    for (const unit of state.allies) {
      expect(unit.conduits).toBeUndefined();
      expect(unitReadout(unit, true)).not.toContain('unit-stats');
    }
  });
  it('exposes current Conduit protection in the menu and compact field without retired charge text', () => {
    const ally = createBattle().allies[0];
    ally.conduitCharges = { burnFocus: true, normalMomentum: true, weakenPierce: true };
    ally.conduitRuntime = { numbers: { criticalSeal: 1, windveil: 1 }, owners: {} };
    const full = unitReadout(ally);
    for (const text of ['Critical Seal', 'Windveil']) {
      expect(full).toContain(text);
      expect(unitReadout(ally, true)).toContain(text);
    }
    for (const text of ['+5 percentage points Crit', '+10% outgoing damage', 'ignores 20% Defense']) expect(full).not.toContain(text);
    ally.conduitRuntime.numbers = {};
    expect(unitReadout(ally)).not.toContain('Critical Seal');
    expect(unitReadout(ally)).not.toContain('Windveil');
    expect(unitReadout(ally)).not.toContain('Next offensive');
  });
  it('keeps the fighting readout compact and leaves Defense in the full reference', () => {
    const state = createBattle();
    for (const unit of [...state.allies, ...state.enemies]) {
      expect(unitReadout(unit, true)).toContain('unit-health');
      expect(unitReadout(unit, true)).not.toContain('unit-stats');
      expect(unitReadout(unit)).toContain('DEF');
    }
    expect(unitReadout(state.allies[0], true)).toContain('Gauge 0 / 100');
    expect(unitReadout(state.allies[0], true)).toContain('role="meter"');
  });
  it('shows actual debuffs beside enemy HP without unrelated stats or shields', () => {
    const enemy = createBattle().enemies[0];
    enemy.shield = 20;
    enemy.burn = { damage: 8, turns: 2 };
    const readout = unitReadout(enemy);
    expect(readout).toContain('<span class="unit-health">HP 87 / 87</span><span class="unit-stats">DEF 4</span>');
    expect(readout).toContain('Burn 8 · 2 enemy phases');
    expect(unitReadout(enemy, true)).toContain('data-debuff="burn"');
    for (const label of ['ATK', 'CRIT', 'Shield', 'Shatter', 'Burning', 'Ready', 'Critical', 'Elemental']) expect(readout).not.toContain(label);
  });
  it('uses separate real Burn/Weaken clocks, hides expired or defeated effects', () => {
    const enemy = createBattle().enemies[0];
    enemy.burn = { damage: 125.25, turns: 1 };
    enemy.weakened = 2;
    enemy.weakenFraction = .3;
    expect(unitReadout(enemy, true)).toContain('Burn 125.25 · 1 enemy phase');
    expect(unitReadout(enemy, true)).toContain('Weaken -30% Attack · 2 attacks');
    enemy.burn.turns = 0;
    enemy.weakened = 0;
    expect(unitReadout(enemy, true)).not.toContain('battle-status-badge');
    enemy.burn.turns = 2;
    enemy.hp = 0;
    expect(unitReadout(enemy, true)).not.toContain('battle-status-badge');
  });
  it('shows no fake counters on timing, forecast or support identities', () => {
    const pilots = createBattle(7, ['atmoso', 'aurora', 'bliss']).allies;
    for (const unit of pilots) {
      expect(unitReadout(unit, true)).not.toContain('Atmospheric Charge 0 / 3');
      expect(unitReadout(unit, true)).not.toContain('Botanic Renewal 0 / 3');
      expect(unitReadout(unit, true)).not.toContain('class="unit-kit-resource"');
    }
    for (const id of ['bruno', 'disciple', 'razor', 'nerithe', 'orvella']) {
      const unit = createBattle(7, [id]).allies[0];
      expect(unitReadout(unit, true)).not.toContain('class="unit-kit-resource"');
      expect(unit.pilot).toBeUndefined();
    }
    const war = createBattle(9, ['vaelor']);
    expect(unitReadout(war.allies[0], true, war.allies, war.round, war)).toContain('Tune');
    expect(unitReadout(war.allies[0], true)).not.toContain('Atmospheric Charge 0 / 3');
  });
  it('shows real allied shield points with HP, Defense and Shatter Gauge', () => {
    const ally = createBattle(1729, ['ember'], { ember: { level: 1, evolution: 1 } }).allies[0];
    ally.shield = 25;
    ally.shatter = 20.5;
    const readout = unitReadout(ally);
    for (const text of ['HP 253 / 253', 'DEF 11.03', 'Shatter Gauge 20.5 / 100.3', 'aria-valuenow="20.5"']) expect(readout).toContain(text);
    expect(readout).toContain('Shield 25');
    expect(unitReadout(ally, true)).toContain('Shield 25');
    for (const text of ['ATK', 'CRIT', 'Critical', 'Elemental', 'Ready', 'unit-status']) expect(readout).not.toContain(text);
  });
});
