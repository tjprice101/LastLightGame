import { describe, expect, it } from 'vitest';
import { starters } from '../src/content/starters';
import { act, actionUnavailable } from '../src/game/battle';
import { benchmarkTarget } from '../src/game/native-benchmark-pilot';
import { auditBoundary, auditGear, auditLevels, auditProfiles, auditState, maximumProgress,
  measureCapability, resourceCost, rosterCombinations, screenMasters, chargedBurst, gearBudget,
  tankProbe, validateAuditGear } from './roster-capability';

describe('opponent-free roster capability audit', () => {
  it('covers all16 bearers and every distinct unordered solo/duo/trio', () => {
    const teams = rosterCombinations();
    expect(teams.filter(team => team.length === 1)).toHaveLength(16);
    expect(teams.filter(team => team.length === 2)).toHaveLength(120);
    expect(teams.filter(team => team.length === 3)).toHaveLength(560);
    expect(new Set(teams.map(team => [...team].sort().join(','))).size).toBe(696);
  });
  it('does not grant unreachable early evolutions or legacy weapon ranks', () => {
    expect(auditLevels.map(level => maximumProgress(level).evolution)).toEqual([1, 1, 2, 4, 5, 6, 6]);
    expect(resourceCost('ember', 0).fractalis).toBe(0);
    expect(resourceCost('ember', 20).fractalis).toBe(620);
    expect(resourceCost('ember', 60, true).progress).toEqual({ level: 60, evolution: 4 });
  });
  it('validates all profile loadouts and maintains current caps and finite results', () => {
    for (const profile of auditProfiles) for (const unit of starters) {
      const gear = auditGear([unit.id], profile);
      validateAuditGear([unit.id], gear);
      const state = auditState([unit.id], 105, profile, 1729, gear);
      expect(state.enemies).toHaveLength(1);
      expect(state.enemies[0].stats.defense).toBe(0);
      expect(state.allies[0].shatter).toBe(0);
      const result = measureCapability(state, profile, 'output', 6);
      expect(result.damage).toBeGreaterThanOrEqual(0);
      expect(result.actions).toBeLessThanOrEqual(18);
      expect(result.exhausted).toBe(false);
    }
  });
  it('uses real Normal damage events with no incoming attacks, Gauge or reward grants', () => {
    const state = auditState(['ember'], 0, 'floor', 1);
    const single = act(state, 'ember', 'light', 'measuring-target');
    const expected = single.events.filter(event => event.kind === 'damage').reduce((sum, event) => sum + event.amount, 0);
    const result = measureCapability(state, 'floor', 'output', 1);
    expect(result.damage).toBe(expected);
    expect(result.normal).toBe(1);
    const hp = single.state.allies[0].hp, gauge = single.state.allies[0].shatter;
    const events = auditBoundary(single.state);
    expect(single.state.round).toBe(2);
    expect(single.state.allies[0].hp).toBe(hp);
    expect(single.state.allies[0].shatter).toBe(gauge);
    expect(events.some(event => event.kind === 'reward' || event.source === 'measuring-target')).toBe(false);
  });
  it('preserves recovery, cooldowns and delayed real healing without attributing headroom as damage', () => {
    let state = auditState(['sprout', 'tide'], 60, 'planned', 1729);
    const owner = state.allies[0];
    owner.shatter = owner.stats.shatterCapacity;
    state.allies.forEach(unit => { unit.hp = unit.stats.health * .1; });
    expect(actionUnavailable(state, owner, 'ultimate', benchmarkTarget(state, owner, 'ultimate'))).toBeNull();
    const result = act(state, 'sprout', 'ultimate', benchmarkTarget(state, owner, 'ultimate'));
    state = result.state;
    state.allies.forEach(unit => { unit.hp = unit.stats.health * .1; });
    const events = auditBoundary(state);
    expect(events.some(event => event.kind === 'heal')).toBe(true);
    expect(actionUnavailable(state, state.allies[0], 'light')).not.toBeNull();
    const measured = measureCapability(auditState(['sprout', 'tide'], 60, 'planned', 1729), 'planned', 'support');
    expect(measured.healing).toBeGreaterThan(0);
    expect(measured.contributions.sprout.healing).toBeGreaterThan(0);
    expect(measured.exhausted).toBe(false);
  });
  it('reports deterministic post-Defense survival capacity separately from HP and shields', () => {
    const gear = auditGear(['tide'], 'planned');
    const result = tankProbe('tide', 40, 'planned', gear);
    expect(result.shield).toBeGreaterThan(0);
    expect(result.packet).toBeGreaterThan(result.hp);
    expect(result.censored).toBe(false);
    expect(result.action).toBe('ultimate');
    const repeated = tankProbe('tide', 40, 'planned', gear);
    expect(repeated).toEqual(result);
  });
  it('screens legal packages and all personal Masters without assuming a fixed best build', () => {
    const result = screenMasters('bliss', 105, 'ceiling');
    expect(result.candidates).toHaveLength(9);
    expect(new Set(result.candidates.map(candidate => candidate.master)).size).toBe(3);
    for (const candidate of result.candidates) {
      validateAuditGear(['bliss'], candidate.gear);
      expect(Number.isFinite(candidate.damage)).toBe(true);
      expect(candidate.damage).toBeLessThanOrEqual(result.best.damage);
    }
    const burst = chargedBurst('bliss', 105, 'ceiling', result.best.gear);
    expect(burst.mean).toBeGreaterThan(0);
    expect(burst.maximum).toBeGreaterThanOrEqual(burst.mean);
    const budget = gearBudget(auditGear(['bliss', 'razor'], 'ceiling'));
    expect(budget.calamiticTokens).toBe(400);
    expect(budget.components).toBeGreaterThan(0);
    expect(budget.masters).toBe(2);
  });
  it('does not count a favorable Stasis proc as reliable one-hit capacity', () => {
    const gear = auditGear(['tide'], 'planned');
    gear.equipment.tide![0] = 'stasis-reliquary';
    gear.upgrades['stasis-reliquary'] = 5;
    const stasis = tankProbe('tide', 40, 'planned', gear);
    gear.equipment.tide![0] = null;
    const without = tankProbe('tide', 40, 'planned', gear);
    expect(stasis.packet).toBe(without.packet);
    expect(stasis.censored).toBe(false);
  });
});
