import { describe, expect, it } from 'vitest';
import { createBattle } from '../game/battle';
import { unitReadout } from './unit-readout';

describe('field readouts', () => {
  it('shows intrinsic stack counts in the field and explains choices in the menu independently of equipment', () => {
    const state = createBattle(7, ['ember', 'tide', 'sprout']);
    state.allies[0].pilot = { emberSeals: 3 };
    state.allies[1].pilot = { tideStacks: 2 };
    state.allies[2].pilot = { blooms: 3 };
    expect(unitReadout(state.allies[0])).toContain('Last Flare +36% damage');
    expect(unitReadout(state.allies[1])).toContain('Tide stacks 2 ~ 3');
    expect(unitReadout(state.allies[2], false, [], 1)).toContain('Last Flare +45% healing');
    expect(unitReadout(state.allies[0], true)).toContain('Ember Seals 3 ~ 3');
    expect(unitReadout(state.allies[1], true)).toContain('Tide 2 ~ 3');
    expect(unitReadout(state.allies[2], true)).toContain('Blooms 3 ~ 3');
    state.allies[2].hp = 0;
    expect(unitReadout(state.allies[2], true)).not.toContain('unit-kit-resource');
    for (const unit of state.allies) {
      expect(unit.conduits).toBeUndefined();
      expect(unitReadout(unit, true)).not.toContain('unit-stats');
    }
  });
  it('exposes exact pending Conduit charges in the menu, not the compact field', () => {
    const ally = createBattle().allies[0];
    ally.conduitCharges = { burnFocus: true, normalMomentum: true, weakenPierce: true, graftCovenant: true };
    const full = unitReadout(ally);
    for (const text of ['+5 percentage points Crit', '+10% outgoing damage', 'ignores 20% Defense', 'Graft Covenant: next damaging ordinary skill +15%']) {
      expect(full).toContain(text);
      expect(unitReadout(ally, true)).not.toContain(text);
    }
    ally.conduitCharges = {};
    expect(unitReadout(ally)).not.toContain('Next offensive');
  });
  it('keeps the fighting readout compact and leaves Defense in the full reference', () => {
    const state = createBattle();
    for (const unit of [...state.allies, ...state.enemies]) {
      expect(unitReadout(unit, true)).toContain('unit-health');
      expect(unitReadout(unit, true)).not.toContain('unit-stats');
      expect(unitReadout(unit)).toContain('DEF');
    }
    expect(unitReadout(state.allies[0], true)).toContain('Gauge 0 ~ 100');
    expect(unitReadout(state.allies[0], true)).toContain('role="meter"');
  });
  it('shows actual debuffs beside enemy HP without unrelated stats or shields', () => {
    const enemy = createBattle().enemies[0];
    enemy.shield = 20;
    enemy.burn = { damage: 8, turns: 2 };
    const readout = unitReadout(enemy);
    expect(readout).toContain('<span class="unit-health">HP 110 ~ 110</span><span class="unit-stats">DEF 5</span>');
    expect(readout).toContain('Burn 8 ~ 2 enemy phases');
    expect(unitReadout(enemy, true)).toContain('data-debuff="burn"');
    for (const label of ['ATK', 'CRIT', 'Shield', 'Shatter', 'Burning', 'Ready', 'Critical', 'Elemental']) expect(readout).not.toContain(label);
  });
  it('uses separate real Burn/Weaken clocks, hides expired or defeated effects', () => {
    const enemy = createBattle().enemies[0];
    enemy.burn = { damage: 125.25, turns: 1 };
    enemy.weakened = 2;
    enemy.weakenFraction = .3;
    expect(unitReadout(enemy, true)).toContain('Burn 125.25 ~ 1 enemy phase');
    expect(unitReadout(enemy, true)).toContain('Weaken -30% Attack ~ 2 attacks');
    enemy.burn.turns = 0;
    enemy.weakened = 0;
    expect(unitReadout(enemy, true)).not.toContain('battle-status-badge');
    enemy.burn.turns = 2;
    enemy.hp = 0;
    expect(unitReadout(enemy, true)).not.toContain('battle-status-badge');
  });
  it('shows only ally HP, Defense and Shatter Gauge with fractional formatting', () => {
    const ally = createBattle(1729, ['ember'], { ember: { level: 1, evolution: 1 } }).allies[0];
    ally.shield = 25;
    ally.shatter = 20.5;
    const readout = unitReadout(ally);
    for (const text of ['HP 240.4 ~ 240.4', 'DEF 10.64', 'Shatter Gauge 20.5 ~ 100.3', 'aria-valuenow="20.5"']) expect(readout).toContain(text);
    for (const text of ['ATK', 'CRIT', 'Critical', 'Elemental', 'Shield', 'Ready', 'unit-status']) expect(readout).not.toContain(text);
  });
});
