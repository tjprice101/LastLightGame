import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { elementalStatusArt, statusArt } from '../content/status-art';
import { sharedNativeEffects } from '../content/elemental-effects';
import { createBattle } from '../game/battle';
import { debuffSnapshot } from '../game/battle-debuffs';
import { assetUrl } from './portrait';
import { statusIcon } from './status-icon';
import { unitReadout } from './unit-readout';
import { enemyDebuffs } from './battle-status';

describe('delivered shared elemental status icons', () => {
  it('serves all nine real exports with byte-derived revisions and decorative accessible markup', () => {
    expect(Object.keys(statusArt)).toHaveLength(9);
    for (const [id, path] of Object.entries(statusArt)) {
      const bytes = readFileSync(`public/assets/${path}`);
      const revision = createHash('sha256').update(bytes).digest('hex').slice(0, 16);
      expect(assetUrl(path)).toContain(`assets/${path}?v=${revision}`);
      expect(statusIcon(id as keyof typeof statusArt)).toContain('alt="" aria-hidden="true"');
    }
  });

  it('preserves delivered family mappings without assigning retired Rose counters to new native identities', () => {
    expect(elementalStatusArt(sharedNativeEffects.ember)).toBe('burn');
    expect(elementalStatusArt(sharedNativeEffects.ward)).toBe('ward');
    expect(elementalStatusArt(sharedNativeEffects.bloom)).toBe('bloom');
    expect(elementalStatusArt(sharedNativeEffects.tempest)).toBe('tempest');
    for (const [id, art] of [['rosetta', 'rose-grace'], ['thornia', 'thorn-aegis'], ['crinso', 'rose-duality']] as const) {
      const state = createBattle(7, [id]);
      const unit = state.allies[0];
      const readout = unitReadout(unit, true, state.allies, state.round, state);
      expect(readout).not.toContain(`data-status-art="${art}"`);
      expect(readout).not.toContain('unit-kit-resource');
      if (id === 'crinso') expect(readout).toContain('Combo: 0 / 3');
      unit.hp = 0;
      expect(unitReadout(unit, true)).not.toContain('status-icon');
    }
  });

  it('keeps actual Burn, Weaken and Fracture text/clocks/owners beside family icons', () => {
    const enemy = createBattle().enemies[0];
    enemy.burn = { damage: 8.5, turns: 2 };
    enemy.weakened = 1;
    enemy.weakenFraction = .25;
    enemy.conduitMarks = { ember: 2 };
    const before = debuffSnapshot(enemy);
    const html = enemyDebuffs(before, [{ id: 'ember', name: 'Infernis' }]);
    expect(html).toContain('data-status-art="burn"');
    expect(html.match(/data-status-art="suppression"/g)).toHaveLength(2);
    expect(html).toContain('Burn 8.5 · 2 enemy phases');
    expect(html).toContain('Weaken -25% Attack · 1 attack');
    expect(html).toContain('Fracture Mark 2/2 · Infernis');
    enemy.hp = 0;
    expect(unitReadout(enemy, true)).not.toContain('status-icon');
    expect(enemyDebuffs(before)).toContain('Burn 8.5');
  });

  it('keeps redesigned equipment protections textual without borrowing unrelated elemental icons', () => {
    const unit = createBattle().allies[0];
    unit.conduitCharges = { burnFocus: true, weakenPierce: true, normalMomentum: true, verdantNormal: true };
    unit.conduitRuntime = { numbers: { windveil: 1, criticalSeal: 1 }, owners: {} };
    for (const compact of [false, true]) {
      const html = unitReadout(unit, compact);
      expect(html).toContain('Windveil: avoids the next enemy Normal Attack.');
      expect(html).toContain('Critical Seal: the next enemy critical hit loses its critical multiplier.');
      for (const art of ['focus', 'suppression', 'bloom']) expect(html).not.toContain(`data-status-art="${art}"`);
      expect(html).not.toContain('Next offensive skill: +10% outgoing damage.');
      expect(html).not.toContain('ignores 20% Defense');
    }
  });
});
