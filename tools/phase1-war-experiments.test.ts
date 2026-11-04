import { describe, expect, it } from 'vitest';
import { auditState, measureCapability } from './roster-capability';
import { makeBattle, measureBattle } from './battle-survey';
import type { MasterConduitId } from '../src/content/master-conduits';
import type { StarterId } from '../src/content/starters';

const characters = ['caldrex', 'solenne', 'myrthen'] as const;
const seeds = [1, 1729, 104729];

describe('bounded Phase 1 War experiments, conditional on owning the tested units and equipment', () => {
  it('measures six-round solo zero-Defense output and support separately, without incoming attacks', () => {
    const rows = characters.map(id => {
      const state = auditState([id], 105, 'planned', 1729);
      const output = measureCapability(state, 'planned', 'output', 6);
      const support = measureCapability(state, 'planned', 'support', 6);
      expect(output.damage).toBeGreaterThan(0);
      expect([output.damage, support.healing, support.shields].every(Number.isFinite)).toBe(true);
      return { id, damage: output.damage, healing: support.healing, shields: support.shields };
    });
    process.stdout.write(`PAPER SOLO level105 Common+0 six rounds, separate output/support, no incoming: ${JSON.stringify(rows)}\n`);
  });

  it('measures actual pressured stage10 War fights with mixed+0 equipment and each personal Master alternative', () => {
    const rows = [];
    for (const id of characters) {
      const roster: StarterId[] = [id, 'tide', 'sprout'];
      for (const alternative of [0, 1, 2, 3]) {
        const master = alternative ? `master-${id}-${alternative}` as MasterConduitId : undefined;
        const results = seeds.map(seed => measureBattle(makeBattle(
          { kind: 'war', character: id, stage: 10 }, roster, 105, 'mixed0', seed,
          master ? { [id]: master } : {},
        )).result);
        expect(results.every(result => Number.isFinite(result.enemyRemaining))).toBe(true);
        rows.push({ id, master: master ?? 'none', outcomes: results.map(r => r.outcome),
          rounds: results.map(r => r.rounds), surviving: results.map(r => r.surviving),
          enemyRemaining: results.map(r => Number(r.enemyRemaining.toFixed(4))) });
      }
    }
    process.stdout.write(`PRESSURED level105 owned [new,tide,sprout], mixed+0, optional personal Master+0, no Calamitic gear: ${JSON.stringify(rows)}\n`);
  }, 30000);
});
