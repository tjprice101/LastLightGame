import { describe, expect, it } from 'vitest';
import { auditState, measureCapability } from './roster-capability';
import { makeBattle, measureBattle } from './battle-survey';
import type { MasterConduitId } from '../src/content/master-conduits';
import type { StarterId } from '../src/content/starters';
import { endTurn } from '../src/game/battle';

const characters = ['neralis', 'varkhel', 'seravelle', 'velmira'] as const;
const seeds = [1, 1729, 104729];
const ownedTrio = (id: StarterId): StarterId[] => [id, 'tide', 'sprout'];

describe('bounded Phase 2 War experiments, conditional on owning the tested units and equipment', () => {
  it('measures six-round zero-Defense damage and support separately for owned trios', () => {
    const rows = characters.map(id => {
      const roster = ownedTrio(id);
      const initial = auditState(roster, 105, 'planned', 1729);
      const output = measureCapability(initial, 'planned', 'output', 6);
      const support = measureCapability(initial, 'planned', 'support', 6);
      expect([output.damage, support.healing, support.shields].every(Number.isFinite)).toBe(true);
      expect(output.damage).toBeGreaterThan(0);
      return {
        id, ownedRoster: roster, level: 105, gear: 'Common+0; no Masters; no Calamitic gear',
        damage: output.damage, effectiveHealing: support.healing, shieldCreation: support.shields,
        outputContributions: output.contributions, supportContributions: support.contributions,
      };
    });
    process.stdout.write(`PAPER TRIO level105 owned [new,Tizu,Flora], Common+0 non-Calamitic six rounds, separate zero-Defense damage/effective healing/Shield probes: ${JSON.stringify(rows)}\n`);
  });

  it('measures actual pressured stage10 War fights with mixed+0 equipment and each personal Master alternative', () => {
    const rows = [];
    for (const id of characters) {
      const roster = ownedTrio(id);
      for (const alternative of [0, 1, 2, 3]) {
        const master = alternative ? `master-${id}-${alternative}` as MasterConduitId : undefined;
        const results = seeds.map(seed => measureBattle(makeBattle(
          { kind: 'war', character: id, stage: 10 }, roster, 105, 'mixed0', seed,
          master ? { [id]: master } : {},
        )).result);
        expect(results.every(result => Number.isFinite(result.enemyRemaining))).toBe(true);
        rows.push({ id, ownedRoster: roster, master: master ?? 'none', seeds,
          outcomes: results.map(result => result.outcome), rounds: results.map(result => result.rounds),
          surviving: results.map(result => result.surviving),
          enemyRemaining: results.map(result => Number(result.enemyRemaining.toFixed(4))) });
      }
    }
    process.stdout.write(`PRESSURED level105 owned [new,Tizu,Flora], mixed+0, optional personal Master+0, no Calamitic gear, 48 actual stage10 encounters: ${JSON.stringify(rows)}\n`);
  }, 30000);

  it('records one deterministic actual stage10 enemy packet per owner without Master or support interception', () => {
    const rows = characters.map((id, index) => {
      const roster = ownedTrio(id);
      const state = makeBattle({ kind: 'war', character: id, stage: 10 }, roster, 105, 'mixed0', seeds[index % seeds.length]);
      const target = state.allies.find(ally => ally.definitionId === id)!;
      for (const ally of state.allies) {
        ally.hp = ally.stats.health;
        ally.shield = 0;
        if (ally.id !== target.id) ally.hp = 0;
      }
      const enemy = state.enemies[0];
      enemy.stats.crit = 0;
      enemy.enemySkills = [];
      const result = endTurn(state);
      const packet = result.events.find(event => event.kind === 'damage' && event.source === enemy.id && event.target === target.id);
      expect(packet).toBeDefined();
      expect(Number.isFinite(packet!.amount)).toBe(true);
      return { id, level: 105, equipment: 'mixed+0; no Master; no Calamitic gear',
        directPacket: packet!.amount, hpBefore: target.stats.health,
        hpAfter: result.state.allies.find(ally => ally.id === target.id)!.hp,
        survived: result.state.allies.find(ally => ally.id === target.id)!.hp > 0 };
    });
    process.stdout.write(`SINGLE PACKET survival probes, stage10 boss, level105 solo active owner with owned [Tizu,Flora] incapacitated, mixed+0 non-Calamitic: ${JSON.stringify(rows)}\n`);
  });
});
