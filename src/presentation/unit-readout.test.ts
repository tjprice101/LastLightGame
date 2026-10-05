import { describe, expect, it } from 'vitest';
import { createBattle } from '../game/battle';
import { unitReadout } from './unit-readout';

describe('field readouts', () => {
  it('keeps the fighting readout compact and leaves Defense in the full reference', () => {
    const state = createBattle();
    for (const unit of [...state.allies, ...state.enemies]) {
      expect(unitReadout(unit, true)).toContain('unit-health');
      expect(unitReadout(unit, true)).not.toContain('unit-stats');
      expect(unitReadout(unit)).toContain('DEF');
    }
    expect(unitReadout(state.allies[0], true)).toContain('Gauge 0/100');
    expect(unitReadout(state.allies[0], true)).toContain('role="meter"');
  });
  it('shows only HP and Defense beside enemy names even with statuses and shields', () => {
    const enemy = createBattle().enemies[0];
    enemy.shield = 20;
    enemy.burn = { damage: 8, turns: 2 };
    const readout = unitReadout(enemy);
    expect(readout).toBe('<span class="unit-health">HP 110/110</span><span class="unit-stats">DEF 5</span>');
    for (const label of ['ATK', 'CRIT', 'Shield', 'Shatter', 'Burning', 'Ready', 'Critical', 'Elemental']) expect(readout).not.toContain(label);
  });
  it('shows only ally HP, Defense and Shatter Gauge with fractional formatting', () => {
    const ally = createBattle(1729, ['ember'], { ember: { level: 1, evolution: 1 } }).allies[0];
    ally.shield = 25;
    ally.shatter = 20.5;
    const readout = unitReadout(ally);
    for (const text of ['HP 240.4/240.4', 'DEF 10.64', 'Shatter Gauge 20.5/100.3', 'aria-valuenow="20.5"']) expect(readout).toContain(text);
    for (const text of ['ATK', 'CRIT', 'Critical', 'Elemental', 'Shield', 'Ready', 'unit-status']) expect(readout).not.toContain(text);
  });
});
