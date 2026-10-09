import { describe, expect, it } from 'vitest';
import { createBattle, type BattleEvent } from '../game/battle';
import { debuffSnapshot } from '../game/battle-debuffs';
import { enemyDebuffs, enemyStatusReadout } from './battle-status';
import { impactEvents } from './battle-health';

describe('actual ordered enemy debuff display', () => {
  it('renders owner-specific Fracture/Verdict marks alongside actual clocks without treating owners as HTML', () => {
    const state = createBattle();
    const enemy = state.enemies[0];
    enemy.conduitMarks = { ember: 2, other: 1 };
    enemy.pilot = { verdictMarks: { aurora: { stacks: 2, turns: 1 } } };
    const markup = enemyDebuffs(debuffSnapshot(enemy), [{ id: 'ember', name: '<Ember>' }, { id: 'aurora', name: 'Aurora' }]);
    expect(markup).toContain('Fracture Mark 2/2 ~ &lt;Ember&gt;');
    expect(markup).toContain('Fracture Mark 1/2 ~ other');
    expect(markup).toContain('Verdict Mark 2/2 ~ Aurora ~ 1 enemy phase');
    expect(markup).not.toContain('<img');
    enemy.hp = 0;
    expect(enemyStatusReadout(enemy)).not.toContain('battle-status-badge');
  });

  it('detaches snapshots and groups status application with attack impact, not message text or future final state', () => {
    const enemy = createBattle().enemies[0];
    enemy.burn = { damage: 8, turns: 2 };
    const before = debuffSnapshot(enemy);
    enemy.burn.turns = 0;
    expect(enemyDebuffs(before)).toContain('2 enemy phases');
    expect(enemyStatusReadout(enemy)).not.toContain('Burn');
    const events: BattleEvent[] = [
      { kind: 'attack', source: 'ember', target: enemy.id, amount: 0, critical: false, message: 'attack' },
      { kind: 'damage', source: 'ember', target: enemy.id, amount: 1, critical: false, message: 'damage', debuffs: { weakened: 0, weakenFraction: 0 } },
      { kind: 'status', source: 'ember', target: enemy.id, amount: 0, critical: false, message: 'arbitrary localized text', debuffs: before },
      { kind: 'damage', source: 'ember', target: enemy.id, amount: 8, critical: false, message: 'periodic', periodic: true },
    ];
    expect(impactEvents(events, 0)).toEqual([1, 2]);
  });
});
