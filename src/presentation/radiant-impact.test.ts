import { describe, expect, it } from 'vitest';
import { createRadiantCombat, applyRadiantCombatAction, type RadiantCombatState } from '../game/radiant-combat';
import { radiantFlares, releasedRadiantIds, type RadiantBearerId, type RadiantLoadout } from '../content/radiant-combat';
import { sharedChargeThreshold } from '../game/radiant-gauge';
import { radiantImpactFrames, radiantReadout } from './radiant-impact';

function loadout(starter: RadiantBearerId): RadiantLoadout {
  return { id: starter, starter, level: 105, form: 6, weaponRank: 0, masterId: null, ascension: {} };
}
function battle(ids: RadiantBearerId[] = ['ember', 'tide', 'sprout']): RadiantCombatState {
  return createRadiantCombat(ids.map(loadout), ['enemy-a', 'enemy-b'].map(id => ({
    id, stats: { hp: 1000000, attack: 100, defense: 100, recovery: 100 }, currencyBudget: 30000,
  })), 1729);
}
describe('saved ordered Radiant impact ledger', () => {
  it.each(releasedRadiantIds.map(id => ({ id })))('reproduces all tiers and incoming/round packets for $id', ({ id }) => {
    for (const tier of ['glowing', 'lustrous', 'eternal'] as const) {
      const before = battle([id]);
      before.bearers[0].hp = Math.floor(before.bearers[0].hp * .6);
      before.gauge.members[0].charge = before.gauge.members[0].baseCost * (tier === 'glowing' ? 1 : 2);
      before.gauge.sharedUnits = tier === 'eternal' ? sharedChargeThreshold(0) : 0;
      const result = applyRadiantCombatAction(before, { type: 'flare', bearerId: id,
        ...(radiantFlares[id][tier].target === 'one-enemy' ? { targetId: 'enemy-a' } : {}) });
      const frames = radiantImpactFrames(before, result.state, result.events);
      expect(frames.at(-1)!.readout).toEqual(radiantReadout(result.state));
      if (result.state.phase === 'enemy') {
        const hit = applyRadiantCombatAction(result.state, { type: 'enemy-attack', enemyId: 'enemy-a',
          targetIds: [id], coefficient: 1, hits: 3, refreshShieldBefore: 200, healBefore: 100 });
        expect(radiantImpactFrames(result.state, hit.state, hit.events).at(-1)!.readout).toEqual(radiantReadout(hit.state));
        const second = applyRadiantCombatAction(hit.state, { type: 'enemy-attack', enemyId: 'enemy-b',
          targetIds: [id], coefficient: 1 });
        radiantImpactFrames(hit.state, second.state, second.events);
        const round = applyRadiantCombatAction(second.state, { type: 'finish-enemy-phase' });
        expect(radiantImpactFrames(second.state, round.state, round.events).at(-1)!.readout).toEqual(radiantReadout(round.state));
      }
    }
  });
  it('keeps the old health until impact and updates distinct AoE targets together', () => {
    const before = battle(['ember']); before.gauge.members[0].charge = before.gauge.members[0].baseCost;
    const original = structuredClone(before);
    const result = applyRadiantCombatAction(before, { type: 'flare', bearerId: 'ember' });
    const frames = radiantImpactFrames(before, result.state, result.events);
    expect(frames[0].events[0].type).toBe('flare');
    expect(frames[0].readout.units['enemy-a'].hp).toBe(before.enemies[0].hp);
    const aoe = frames.find(frame => frame.events.filter(event => event.type === 'damage').length === 2)!;
    expect(aoe.readout.units['enemy-a'].hp).toBeLessThan(before.enemies[0].hp);
    expect(aoe.readout.units['enemy-b'].hp).toBeLessThan(before.enemies[1].hp);
    expect(before).toEqual(original);
  });
  it('rejects missing or dishonest event batches rather than jumping to success-shaped final readouts', () => {
    const before = battle(['ember']);
    const result = applyRadiantCombatAction(before, { type: 'normal', bearerId: 'ember', targetId: 'enemy-a' });
    expect(() => radiantImpactFrames(before, result.state, [])).toThrow('history');
    const invalid = structuredClone(result.events);
    const damage = invalid.find(event => event.type === 'damage')!;
    if (damage.type === 'damage') damage.healthLoss = before.enemies[0].hp + 1;
    expect(() => radiantImpactFrames(before, result.state, invalid)).toThrow('exceeds');
  });
  it('uses the actual rounded combat HP ceiling while preserving fractional raw stats', () => {
    const state = battle(['thornia']);
    expect(state.bearers[0].stats.hp).toBe(7638.75);
    expect(radiantReadout(state).units.thornia.maximum).toBe(7639);
    const result = applyRadiantCombatAction(state, { type: 'defense', bearerId: 'thornia' });
    expect(radiantImpactFrames(state, result.state, result.events).at(-1)!.readout.units.thornia.hp).toBe(7639);
  });
  it('consumes independent Shield layers in engine order at impact, including multi-hit breaks', () => {
    const before = battle(['ember']); before.phase = 'enemy'; before.acted = ['ember'];
    before.bearers[0].shields = [
      { id: 1, source: { kind: 'flare', bearerId: 'ember' }, remaining: 1 },
      { id: 2, source: { kind: 'passive', bearerId: 'ember' }, remaining: 250 },
    ]; before.nextShieldId = 3;
    const result = applyRadiantCombatAction(before, { type: 'enemy-attack', enemyId: 'enemy-a',
      targetIds: ['ember'], coefficient: 1, hits: 3 });
    const frames = radiantImpactFrames(before, result.state, result.events);
    const hits = frames.filter(frame => frame.events.some(event => event.type === 'damage'));
    expect(hits).toHaveLength(3);
    expect(hits[0].readout.units.ember.layers.map(layer => layer.id)).toEqual([2]);
    expect(hits[0].readout.units.ember.layers[0].source).toEqual(before.bearers[0].shields[1].source);
    for (const frame of hits) {
      expect(frame.readout.units.ember.layers.reduce((sum, layer) => sum + layer.remaining, 0))
        .toBe(frame.readout.units.ember.shield);
    }
    expect(before.bearers[0].shields[0].remaining).toBe(1);
    const dishonest = structuredClone(result.events);
    const damage = dishonest.find(event => event.type === 'damage');
    if (!damage || damage.type !== 'damage') throw new Error('Expected a damage packet.');
    damage.shields[0].source = { kind: 'normal', bearerId: 'ember' };
    expect(() => radiantImpactFrames(before, result.state, dishonest)).toThrow('absorption');
  });
});
