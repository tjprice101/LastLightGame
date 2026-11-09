import { describe, expect, it } from 'vitest';
import { createRadiantCombat, applyRadiantCombatAction, type RadiantCombatState } from '../game/radiant-combat';
import { radiantFlares, releasedRadiantIds, type RadiantBearerId, type RadiantLoadout } from '../content/radiant-combat';
import { sharedChargeThreshold } from '../game/radiant-gauge';
import { radiantImpactFrames, radiantReadout } from './radiant-impact';
import { radiantStatusSnapshot } from './radiant-status';

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
  it('replays hit and defeat drops for every living member at their enemy impact', () => {
    const before = battle(['ember', 'tide', 'sprout', 'rosetta', 'thornia', 'crinso']);
    const target = before.enemies[0];
    target.hp = 1;
    target.currency.lowestHP = 1;
    target.currency.paid = Math.floor(target.currency.budget * (target.currency.baselineHP - 1) / target.currency.baselineHP);
    before.currencyEarned = target.currency.paid;
    const result = applyRadiantCombatAction(before, { type: 'normal', bearerId: 'ember', targetId: target.id });
    const frames = radiantImpactFrames(before, result.state, result.events);
    const hit = frames.find(frame => frame.events.some(event => event.type === 'damage' && event.targetId === target.id))!;
    const drops = hit.events.filter(event => event.type === 'gauge-drop');
    expect(drops.map(drop => drop.trigger)).toEqual(['hit', 'defeat']);
    const total = drops.reduce((sum, drop) => sum + drop.amount, 0);
    expect(hit.readout.units[target.id].hp).toBe(0);
    expect(hit.readout.gauge.members.map(member => member.charge)).toEqual([total, ...Array(5).fill(total / 10)]);
    expect(frames.at(-1)!.readout).toEqual(radiantReadout(result.state));
  });
  it('rejects a falsified drop source or amount instead of showing an unsaved team gain', () => {
    const before = battle(['ember', 'tide']);
    const result = applyRadiantCombatAction(before, { type: 'normal', bearerId: 'ember', targetId: 'enemy-a' });
    const source = structuredClone(result.events), wrongSource = source.find(event => event.type === 'gauge-drop')!;
    if (wrongSource.type === 'gauge-drop') wrongSource.enemyId = 'tide';
    expect(() => radiantImpactFrames(before, result.state, source)).toThrow('not an enemy');
    const otherEnemy = structuredClone(result.events), wrongEnemy = otherEnemy.find(event => event.type === 'gauge-drop')!;
    if (wrongEnemy.type === 'gauge-drop') wrongEnemy.enemyId = 'enemy-b';
    expect(() => radiantImpactFrames(before, result.state, otherEnemy)).toThrow('does not match');
    const otherBearer = structuredClone(result.events), wrongBearer = otherBearer.find(event => event.type === 'gauge-drop')!;
    if (wrongBearer.type === 'gauge-drop') wrongBearer.bearerId = 'tide';
    expect(() => radiantImpactFrames(before, result.state, otherBearer)).toThrow('does not match');
    const amount = structuredClone(result.events), wrongAmount = amount.find(event => event.type === 'gauge-drop')!;
    if (wrongAmount.type === 'gauge-drop') wrongAmount.amount++;
    expect(() => radiantImpactFrames(before, result.state, amount)).toThrow('amount');
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
  it('replays guard activation, each timed clock decrement, and expirations at their saved boundary', () => {
    const guarded = battle(['ember']);
    const defense = applyRadiantCombatAction(guarded, { type: 'defense', bearerId: 'ember' });
    const defenseFrames = radiantImpactFrames(guarded, defense.state, defense.events);
    expect(defenseFrames.some(frame => frame.statuses.ember.some(row => row.kind === 'guard'))).toBe(true);

    const before = battle(['ember']);
    before.phase = 'enemy'; before.acted = ['ember']; before.enemyActed = before.enemies.map(enemy => enemy.id);
    const enemy = before.enemies[0], ally = before.bearers[0];
    enemy.burns = [{ source: { kind: 'flare', bearerId: 'ember' }, magnitude: 25, remaining: 1 }];
    enemy.weaken = [{ source: { kind: 'enemy', enemyId: enemy.id }, magnitude: .1, remaining: 1 }];
    enemy.exposures = [{ source: { kind: 'flare', bearerId: 'ember' }, magnitude: .2, remaining: 2 }];
    ally.hp -= 100; ally.guarding = true;
    ally.weaken = [{ source: { kind: 'enemy', enemyId: enemy.id }, magnitude: .1, remaining: 2 }];
    ally.reductions = [{ source: { kind: 'flare', bearerId: 'ember' }, magnitude: .2, remaining: 1 }];
    ally.attackBuffs = [{ source: { kind: 'master', bearerId: 'ember' }, magnitude: .1, remaining: 2 }];
    ally.seeds = [{ source: { kind: 'passive', bearerId: 'ember' }, magnitude: 10, remaining: 1 }];
    ally.renewal = [{ source: { kind: 'flare', bearerId: 'ember' }, magnitude: 10, remaining: 2 }];
    const round = applyRadiantCombatAction(before, { type: 'finish-enemy-phase' });
    const frames = radiantImpactFrames(before, round.state, round.events);
    const settled = radiantStatusSnapshot(round.state);
    for (const [id, rows] of Object.entries(settled)) {
      expect(frames.at(-1)!.statuses[id]).toHaveLength(rows.length);
      expect(frames.at(-1)!.statuses[id]).toEqual(expect.arrayContaining(rows));
    }
    expect(frames.some(frame => frame.events.some(event => event.type === 'guard' && !event.guarding) &&
      !frame.statuses.ember.some(row => row.kind === 'guard'))).toBe(true);
    expect(frames.some(frame => frame.events.some(event => event.type === 'status' &&
      event.status === 'burn' && event.clockOnly && event.remaining === 0) &&
      !frame.statuses[enemy.id].some(row => row.kind === 'burn'))).toBe(true);
    expect(frames.at(-1)!.statuses[enemy.id].find(row => row.kind === 'exposure')?.remaining).toBe(1);
    expect(frames.at(-1)!.statuses.ember.find(row => row.kind === 'attack-buff')?.remaining).toBe(1);
    expect(frames.at(-1)!.statuses.ember.find(row => row.kind === 'renewal')?.remaining).toBe(1);
    expect(frames.at(-1)!.statuses.ember.some(row => row.kind === 'reduction' || row.kind === 'seed')).toBe(false);
  });
  it('removes Ember Eternal Flare burn before replaying its saved periodic packet', () => {
    const before = battle(['ember']);
    before.gauge.members[0].charge = before.gauge.members[0].baseCost * 2;
    before.gauge.sharedUnits = sharedChargeThreshold(0);
    before.enemies[0].burns = [{ source: { kind: 'flare', bearerId: 'ember' }, magnitude: 25, remaining: 2 }];
    const result = applyRadiantCombatAction(before, { type: 'flare', bearerId: 'ember' });
    const frames = radiantImpactFrames(before, result.state, result.events);
    const consumed = frames.findIndex(frame => frame.events.some(event =>
      event.type === 'status' && event.status === 'burn' && event.remaining === 0));
    const periodic = frames.findIndex(frame => frame.events.some(event =>
      event.type === 'damage' && event.origin === 'periodic'));
    expect(consumed).toBeGreaterThan(-1);
    expect(periodic).toBeGreaterThan(consumed);
    expect(frames[consumed].statuses['enemy-a'].some(row => row.kind === 'burn')).toBe(false);
  });
});
