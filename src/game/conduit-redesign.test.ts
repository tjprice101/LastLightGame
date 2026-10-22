import { describe, expect, it, vi } from 'vitest';

// Historical rules4 contract; Phase 0 numerical coverage lives in the phase-zero suites.
vi.mock('../content/phase-zero-stats', async importOriginal => ({
  ...await importOriginal<typeof import('../content/phase-zero-stats')>(),
  phaseZeroStatsReady: false,
}));
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { conduits, type ConduitId, type ConduitSlots } from '../content/conduits';
import { masterConduits } from '../content/master-conduits';
import { starters, type StarterId } from '../content/starters';
import { nativeBalance } from '../content/native-balance';
import { conduitRedesign } from '../content/conduit-redesign';
import { conduitGlossary } from '../content/conduit-glossary';
import { calamiticConduits, calamiticEffect } from '../content/calamitic-conduits';

import { act, actionUnavailable, createBattle, endTurn, nextWave, withMasterLoadouts, type BattleEvent } from './battle';
import { applyConduitBurn, applyConduitWeaken, conduitActionCost, conduitBurnTick, conduitHitModifiers,
  conduitIncoming, conduitTurnStart, afterConduitBurn, effectiveDefense, finishConduitAction, gear, generatedShield,
  nativeGauge, nativeHeal, nativeShield, prepareConduitAction, recordConduitHit, initializeConduits, forcedConduitTarget } from './conduit-runtime';

it('documents each of the original 133 equipment IDs exactly once in the generated compatibility matrix', () => {
  const matrix = readFileSync(join('docs', 'character-conduit-compatibility.md'), 'utf8');
  const ids = [...matrix.matchAll(/^\| `([^`]+)` \| (?:Adapted|Retained) \|/gm)].map(match => match[1]);
  expect(ids).toHaveLength(133);
  expect(new Set(ids).size).toBe(133);
  expect(ids.sort()).toEqual([...conduits.filter(item => item.rarity !== 'Calamitic'), ...masterConduits].map(item => item.id).sort());
});

it('keeps description coefficients aligned and removes retired Conduit jargon', () => {
  const forbidden = /capped|maximum \+|at most|native|generated|refresh-only|encounter|enemy phase| offer/i;
  for (const [id, design] of Object.entries(conduitRedesign)) {
    const placeholders = design.description.match(/[-+]?\d+(?:\.\d+)?%?\s*->\s*[-+]?\d+(?:\.\d+)?%?/g) ?? [];
    expect(placeholders, id).toHaveLength(design.ranges.length);
    expect(design.description, id).not.toMatch(forbidden);
  }
  for (const conduit of calamiticConduits) {
    const description = calamiticEffect(conduit.id);
    expect(description).toBeDefined();
    expect(description ?? '').not.toMatch(forbidden);
  }
  expect(conduitGlossary.map(entry => entry.term)).toEqual([
    'Global', 'Attack Action', 'Bonus Strike', 'Direct Damage', 'Shield', 'Enemy Turn', 'Round', 'Battle',
  ]);
});

function fixture(id?: ConduitId, level = 0, bearer?: StarterId) {
  const design = id ? conduits.find(c => c.id === id) : undefined;
  const character = bearer ?? starters.find(starter => starter.elementId === design?.element)?.id ?? 'ember';
  const roster = [character, ...starters.filter(starter => starter.id !== character).slice(0, 2).map(starter => starter.id)];
  const state = createBattle(1729, roster);
  const owner = state.allies[0], target = state.enemies[0];
  for (const ally of state.allies) {
    ally.stats.health = ally.hp = 1000; ally.stats.damage = 100; ally.stats.defense = 100;
    ally.stats.shatterCapacity = 200; ally.shatter = 100; ally.stats.crit = 0;
    if (ally.kit) ally.kit.stats = { ...ally.stats };
  }
  for (const enemy of state.enemies) {
    enemy.stats.health = enemy.hp = 100000; enemy.stats.damage = 100; enemy.stats.defense = 100; enemy.stats.crit = 0;
  }
  if (id) {
    owner.conduits = [id, null, null, null, null, null, null, null];
    state.conduitUpgrades = { [id]: level };
  }
  initializeConduits(state);
  const events: BattleEvent[] = [];
  return { state, owner, target, events };
}

describe('redesigned ordinary Conduit executable effects', () => {
  it('lets a revived ally take an available action in the same player turn', () => {
    const state = createBattle(1729, ['sprout', 'vaelor', 'ember']);
    const [flora, _vaelor, fallen] = state.allies;
    flora.masterConduit = 'master-sprout-3'; flora.shatter = 100;
    fallen.hp = 0;
    const revived = act(state, flora.id, 'ultimate', state.enemies[0].id).state;
    expect(revived.allies[2].hp).toBeGreaterThan(0);
    expect(revived.allies[2].spent).toBe(false);
    expect(actionUnavailable(revived, revived.allies[2], 'light')).toBeFalsy();
    const afterAttack = act(revived, revived.allies[2].id, 'light', revived.enemies[0].id).state;
    expect(afterAttack.allies[2].spent).toBe(true);
  });
  it('can give Quiet Feather at full Gauge, but never to an unavailable Skill 1', () => {
    const { state, owner, events } = fixture(undefined, 0, 'bliss');
    owner.masterConduit = 'master-bliss-3';
    const [first, second] = state.allies.slice(1);
    for (const ally of [first, second]) ally.shatter = ally.stats.shatterCapacity;
    if (!first.kit) throw new Error('Missing test kit.');
    first.kit = { ...first.kit, unavailableActions: ['skill1'] };
    finishConduitAction(state, owner, prepareConduitAction(state, owner, 'ultimate', 100, false), events);
    expect(gear(first).numbers.quietFeather).toBeUndefined();
    expect(gear(second).numbers.quietFeather).toBe(1);
  });
  it('does not reset Burn cadence or grant control for rejected weaker native applications', () => {
    const burn = fixture('infernic-cinder-testament');
    burn.target.burn = { damage: 1000, turns: 3, sourceId: 'other', origin: 'native' };
    const memory = gear(burn.target).numbers;
    memory[`cinder:${burn.owner.id}`] = 2;
    memory[`extensions:${burn.owner.id}`] = 2;
    memory[`census:${burn.owner.id}`] = 3;
    const before = structuredClone(memory);
    applyConduitBurn(burn.state, burn.owner, burn.target, 1, prepareConduitAction(burn.state, burn.owner, 'skill2', 0, true));
    expect(memory).toEqual(before);
    for (const id of [undefined, 'aquatic-undertide-chronometer'] as const) {
      const { state, owner, target, events } = fixture(id, 0, id ? 'tide' : 'razor');
      if (!id) owner.masterConduit = 'master-razor-3';
      target.weakened = 4; target.weakenFraction = .6; target.weakenSourceId = 'other';
      applyConduitWeaken(state, owner, target, .2, events);
      expect(target).toMatchObject({ weakened: 4, weakenFraction: .6, weakenSourceId: 'other' });
      expect(gear(target).numbers.silence).toBeUndefined();
      expect(gear(target).numbers.scheduleShift).toBeUndefined();
    }
  });
  it('refreshes Foundation ordinary shields and plates independently without a plate ceiling', () => {
    const { state, owner, events } = fixture(undefined, 0, 'orvella');
    owner.masterConduit = 'master-orvella-1';
    for (const offer of [100, 200, 200]) nativeShield(state, owner, owner, offer, events);
    expect(owner.shield).toBe(200);
    expect(gear(owner).layers?.filter(layer => layer.native).reduce((sum, layer) => sum + layer.amount, 0)).toBe(100);
    expect(gear(owner).layers?.filter(layer => layer.plate).reduce((sum, layer) => sum + layer.amount, 0)).toBe(100);
    nativeShield(state, owner, owner, 1000, events);
    expect(owner.shield).toBe(1000);
    expect(gear(owner).layers?.filter(layer => layer.plate).reduce((sum, layer) => sum + layer.amount, 0)).toBe(500);
  });
  it.each([false, true])('spends only its own native Shared Tide layers with earlier foreign native shield: %s', foreignShield => {
    const { state, owner, target, events } = fixture('oceanic-shared-tide-pump', 5);
    const recipient = state.allies[1], contributor = state.allies[2];
    generatedShield(contributor, contributor, 200, events);
    nativeShield(state, owner, contributor, 300, events);
    if (foreignShield) nativeShield(state, contributor, recipient, 100, events);
    nativeShield(state, owner, recipient, foreignShield ? 200 : 100, events);
    conduitIncoming(state, target, recipient, 1000, false, false, events);
    expect(contributor.shield).toBe(200);
    expect(gear(contributor).layers?.filter(layer => layer.amount > 0)).toEqual([{ owner: contributor.id, amount: 200, native: false }]);
    expect(recipient.hp).toBe(foreignShield ? 300 : 200);
  });
  it('uses the latest still-active legal forced target in actual application order', () => {
    const { state, owner, target, events } = fixture(undefined, 0, 'tide');
    owner.masterConduit = 'master-tide-3';
    const tank = state.allies.find(ally => ally.definitionId === 'sprout')!;
    tank.conduits = ['tectonic-atlas-bastion', null, null, null, null, null, null, null];
    applyConduitWeaken(state, owner, target, .5, events);
    finishConduitAction(state, tank, prepareConduitAction(state, tank, 'light', 0, false), events);
    expect(forcedConduitTarget(state, target, state.allies[1])).toBe(tank);
    applyConduitWeaken(state, owner, target, .5, events);
    expect(forcedConduitTarget(state, target, tank)).toBe(owner);
    finishConduitAction(state, tank, prepareConduitAction(state, tank, 'light', 0, false), events);
    state.round++;
    expect(forcedConduitTarget(state, target, tank)).toBe(owner);
    owner.hp = 0;
    expect(forcedConduitTarget(state, target, state.allies[1])).toBe(state.allies[1]);
  });
  it('alternates Crinso polarity across Normal Attacks', () => {
    const { state, owner, target, events } = fixture(undefined, 0, 'crinso');
    owner.masterConduit = 'master-crinso-3';
    owner.hp = 500;
    const gold = prepareConduitAction(state, owner, 'light', 0, false);
    recordConduitHit(gold, target, 100, false, 1.5);
    finishConduitAction(state, owner, gold, events);
    expect(gear(owner).numbers.crimson).toBe(1);
    state.round++;
    const crimson = prepareConduitAction(state, owner, 'light', 0, false);
    recordConduitHit(crimson, target, 100, false, 1.5);
    finishConduitAction(state, owner, crimson, events);
    expect(owner.hp).toBe(520);
    expect(gear(owner).numbers.crimson).toBe(0);
  });
  it('scales Disciple assists with native passive and Attack buffs without triggering ally resources', () => {
    const { state, owner, target, events } = fixture(undefined, 0, 'disciple');
    owner.masterConduit = 'master-disciple-3';
    const ally = state.allies[1];
    ally.hp = 400; ally.stats.damage = 200;
    if (!ally.kit) throw new Error('Missing test kit.');
    ally.kit = { ...ally.kit, passive: { ...ally.kit.passive, damageBonus: .25 } };
    ally.attackBoost = { fraction: .4, throughRound: state.round };
    ally.native = { instruction: { kind: 'strike', owner: owner.id, throughRound: state.round + 1 } };
    const before = { gauge: ally.shatter, pilot: structuredClone(ally.pilot), spent: ally.spent, seed: state.seed };
    const ctx = prepareConduitAction(state, owner, 'skill1', 25, false);
    recordConduitHit(ctx, target, 100, false, 1.5);
    finishConduitAction(state, owner, ctx, events);
    expect(events.filter(event => event.kind === 'damage')).toContainEqual(expect.objectContaining({
      source: ally.id, origin: 'conduit', amount: 93, critical: false,
    }));
    expect({ gauge: ally.shatter, pilot: ally.pilot, spent: ally.spent, seed: state.seed }).toEqual(before);
  });
  it.each([0, 1, 2, 3, 4, 5])('resolves direct action bonuses at upgrade +%i, not generic Attack buffs', level => {
    for (const [id, action, base, maximum] of [
      ['siegebound-drive', 'light', .08, .16], ['prism-splinter-socket', 'skill1', .1, .2],
      ['crosspin-governor', 'skill2', .1, .2], ['worldbreaker-drive', 'ultimate', .35, .7],
      ['verdict-caliper', 'light', .35, .7], ['nullsong-transmission', 'light', .4, .8],
    ] as const) {
      const { state, owner } = fixture(id, level);
      const ctx = prepareConduitAction(state, owner, action, 0, false);
      expect(ctx.bonus, id).toBeCloseTo(base + (maximum - base) * level / 5);
      expect(owner.stats.damage).toBe(100);
      if (id === 'verdict-caliper') expect(ctx.forbidden).toBe(true);
    }
  });
  it.each([0, 1, 2, 3, 4, 5])('scales lifesteal healing without design caps at +%i', level => {
    const { state, owner, target, events } = fixture('lifeline-flywheel', level);
    owner.hp = 100;
    const ctx = prepareConduitAction(state, owner, 'light', 0, false);
    recordConduitHit(ctx, target, 100000, false, 1.5);
    finishConduitAction(state, owner, ctx, events);
    expect(owner.hp - 100).toBe(900);
    expect(events.filter(event => event.kind === 'heal')).toHaveLength(1);
    expect(events.every(event => event.origin === 'conduit')).toBe(true);
  });
  it.each([0, 1, 2, 3, 4, 5])('opens on full-HP enemies only with Breach Pendulum at +%i', level => {
    const { state, owner, target, events } = fixture('breach-pendulum', level);
    const ctx = prepareConduitAction(state, owner, 'light', 0, false);
    expect(conduitHitModifiers(state, owner, target, ctx, false).bonus).toBeCloseTo(.2 + .2 * level / 5);
    target.hp -= 1;
    expect(conduitHitModifiers(state, owner, target, ctx, false).bonus).toBe(0);
    recordConduitHit(ctx, target, 100000, false, 1.5);
    finishConduitAction(state, owner, ctx, events);
    expect(owner.shield).toBe(0);
  });
  it.each([0, 1, 2, 3, 4, 5])('resolves native offer-only effects and preserves provenance at +%i', level => {
    const heal = fixture('springwell-pump', level);
    heal.owner.hp = 100;
    nativeHeal(heal.state, heal.owner, heal.owner, 100, heal.events, true);
    expect(heal.owner.hp).toBe(Math.round(100 + 100 * (1.2 + .2 * level / 5)));
    nativeHeal(heal.state, heal.owner, heal.owner, 100, heal.events, false);
    expect(heal.owner.hp).toBe(Math.round(200 + 100 * (1.2 + .2 * level / 5)));
    const shield = fixture('wardglass-transformer', level);
    nativeShield(shield.state, shield.owner, shield.owner, 100, shield.events);
    expect(shield.owner.shield).toBe(Math.round(100 * (1.2 + .2 * level / 5)));
    expect(gear(shield.owner).layers?.every(layer => layer.native)).toBe(true);
  });
  it('preserves mixed native shield layers when a smaller generated offer refreshes, without stolen attribution', () => {
    const { state, owner, events } = fixture();
    const ally = state.allies[1];
    nativeShield(state, owner, ally, 100, events);
    generatedShield(ally, ally, 50, events);
    expect(ally.shield).toBe(100);
    conduitIncoming(state, state.enemies[0], ally, 50, false, false, events);
    expect(gear(ally).layers).toEqual([{ owner: owner.id, native: true, amount: 50 }]);
  });
  it('clips actual damage, forbids criticals and rejects unavailable actions without input mutation', () => {
    const { state, owner, target } = fixture('verdict-caliper');
    owner.stats.crit = 2;
    target.hp = 1;
    const result = act(state, owner.id, 'light', target.id);
    expect(result.events.find(event => event.kind === 'damage')?.amount).toBe(1);
    expect(result.events.find(event => event.kind === 'damage')?.critical).toBe(false);
    const before = structuredClone(result.state);
    expect(() => act(result.state, owner.id, 'light', target.id)).toThrow();
    expect(result.state).toEqual(before);
  });
  it('starts Twinpulse bearers with a share of Gauge capacity instead of a Normal Attack bonus', () => {
    const { state, owner } = fixture('twinpulse-bellows');
    expect(owner.shatter).toBe(130);
    expect(state.allies[1].shatter).toBe(100);
    expect(prepareConduitAction(state, owner, 'light', 0, false).bonus).toBe(0);
    expect(fixture('twinpulse-bellows', 5).owner.shatter).toBe(170);
  });
  it('grants Pulse Trigger Gauge beyond its action cost at high upgrade levels', () => {
    const { state, owner, target, events } = fixture('pulse-trigger-pawl', 50);
    const ctx = prepareConduitAction(state, owner, 'skill1', 10, false);
    recordConduitHit(ctx, target, 100, true, 1.5);
    finishConduitAction(state, owner, ctx, events);
    expect(owner.shatter).toBe(188);
  });
  it('applies Parallax critical chance to every Attack Action and guarantees Falcon after two noncriticals', () => {
    const opening = fixture('parallax-relay', 5);
    expect(prepareConduitAction(opening.state, opening.owner, 'light', 0, false).criticalBonus).toBe(.3);
    expect(prepareConduitAction(opening.state, opening.owner, 'light', 0, false).criticalBonus).toBe(.3);
    const f = fixture('falcon-sight');
    for (let i = 0; i < 2; i++) {
      const ctx = prepareConduitAction(f.state, f.owner, 'light', 0, false);
      recordConduitHit(ctx, f.target, 1, false, 1.5); finishConduitAction(f.state, f.owner, ctx, f.events);
    }
    expect(prepareConduitAction(f.state, f.owner, 'light', 0, false).guaranteed).toBe(true);
  });
  it('discounts every ability by a share of its cost and consumes Tailwind on legal use', () => {
    const f = fixture('coilfeed-ratchet', 5);
    expect(conduitActionCost(f.owner, 'skill2', f.state, 30)).toBe(26);
    expect(conduitActionCost(f.owner, 'skill1', f.state, 30)).toBe(26);
    expect(conduitActionCost(f.owner, 'ultimate', f.state, 100)).toBe(86);
    expect(conduitActionCost(f.owner, 'ultimate', f.state, 80)).toBe(70);
    expect(conduitActionCost(f.owner, 'ultimate', f.state, 75)).toBe(70);
    expect(conduitActionCost(f.owner, 'light', f.state, 0)).toBe(0);
    const t = fixture('atmospheric-skythread-rudder', 5);
    const normal = prepareConduitAction(t.state, t.owner, 'light', 0, false);
    finishConduitAction(t.state, t.owner, normal, t.events);
    expect(conduitActionCost(t.owner, 'skill1', t.state, 20)).toBe(1);
    prepareConduitAction(t.state, t.owner, 'skill1', 1, false);
    expect(conduitActionCost(t.owner, 'skill1', t.state, 20)).toBe(20);
  });
  it('extends only native Weaken and scales threshold counts at +3', () => {
    for (let level = 0; level <= 5; level++) {
      const f = fixture('opal-indexer', level);
      applyConduitWeaken(f.state, f.owner, f.target, .2, f.events);
      expect(f.target.weakened).toBe(level < 3 ? 3 : 4);
      applyConduitWeaken(f.state, f.owner, f.target, .2, f.events);
      expect(f.target.weakened).toBe(level < 3 ? 3 : 4);
    }
  });
  it('carries Resonance overkill onto the healthiest other enemy without touching Burn', () => {
    const f = fixture('resonance-crucible', 5);
    const ctx = prepareConduitAction(f.state, f.owner, 'skill1', 0, false);
    expect(applyConduitBurn(f.state, f.owner, f.target, 100, ctx)).toBe(100);
    f.target.burn = { damage: 100, turns: 1, sourceId: f.owner.id, origin: 'conduit' };
    expect(conduitBurnTick(f.state, f.owner, f.target)).toBe(100);
    afterConduitBurn(f.state, f.owner, f.target, 100, f.events);
    expect(f.events).toEqual([]);
    const other = f.state.enemies[1];
    other.hp = 90000;
    f.target.hp = 0; recordConduitHit(ctx, f.target, 500, false, 1.5, 100);
    finishConduitAction(f.state, f.owner, ctx, f.events);
    expect(f.state.enemies.reduce((sum, unit) => sum + unit.hp, 0)).toBe(100000 * (f.state.enemies.length - 2) + 90000 - 60);
  });
  it('restores Fieldbrace HP at the start of the next player turn after a Shield breaks', () => {
    const f = fixture('fieldbrace-coupler', 5);
    generatedShield(f.owner, f.owner, 50, f.events);
    conduitIncoming(f.state, f.target, f.owner, 300, false, false, f.events);
    expect(f.owner.hp).toBe(750);
    conduitTurnStart(f.state, f.events);
    expect(f.owner.hp).toBe(750);
    f.state.round += 1; conduitTurnStart(f.state, f.events);
    expect(f.owner.hp).toBe(870);
  });
  it('scales Ruinselect with missing HP and leaves Nightglass Fractures alone', () => {
    const f = fixture('ruinselect-prism', 5);
    f.target.conduitMarks = { [f.owner.id]: 3, other: 2 };
    expect(prepareConduitAction(f.state, f.owner, 'light', 0, false).bonus).toBe(0);
    f.owner.hp = f.owner.stats.health * .45;
    const ctx = prepareConduitAction(f.state, f.owner, 'skill1', 0, false);
    expect(conduitHitModifiers(f.state, f.owner, f.target, ctx, false).bonus).toBeCloseTo(ctx.bonus);
    expect(prepareConduitAction(f.state, f.owner, 'light', 0, false).bonus).toBeCloseTo(5 * .06);
    expect(f.target.conduitMarks).toEqual({ [f.owner.id]: 3, other: 2 });
  });
  it('limits Phoenix revival and Stasis protection to the first lethal hit each Battle', () => {
    const f = fixture('infernic-phoenix-reactor');
    f.owner.hp = 1;
    conduitIncoming(f.state, f.target, f.owner, 1000, false, false, f.events);
    expect(f.owner.hp).toBe(250); expect(f.owner.shatter).toBe(0); expect(f.owner.spent).toBe(false);
    conduitIncoming(f.state, f.target, f.owner, 1000, false, false, f.events);
    expect(f.owner.hp).toBe(0);
    const s = fixture('stasis-reliquary');
    s.owner.hp = 5;
    conduitIncoming(s.state, s.target, s.owner, 100, false, false, s.events);
    expect(s.owner.hp).toBe(0);
    s.state.round++;
    conduitTurnStart(s.state, s.events);
    expect(s.owner.shield).toBe(0);
  });
  it('compresses only the part of one enemy hit above 20% maximum HP with Stasis Reliquary', () => {
    const s = fixture('stasis-reliquary', 5);
    conduitIncoming(s.state, s.target, s.owner, 200, false, false, s.events);
    expect(s.owner.hp).toBe(800);
    s.owner.hp = 1000;
    conduitIncoming(s.state, s.target, s.owner, 1200, false, false, s.events);
    expect(s.owner.hp).toBe(400);
    s.owner.hp = 1000;
    conduitIncoming(s.state, s.target, s.owner, 100000, false, false, s.events);
    expect(s.owner.hp).toBe(0);
  });
  it('makes one paid Normal Attack per player turn free while preserving the ordinary action spend', () => {
    const f = fixture('solace-anchor', 5);
    f.owner.shatter = 50;
    const first = act(f.state, f.owner.id, 'light', f.target.id);
    expect(first.state.allies[0].spent).toBe(false);
    expect(first.state.allies[0].shatter).toBe(65);
    const second = act(first.state, f.owner.id, 'light', f.target.id);
    expect(second.state.allies[0].spent).toBe(true);
    expect(second.state.allies[0].shatter).toBe(85);
    expect(() => act(second.state, f.owner.id, 'light', f.target.id)).toThrow();
  });
  it('lowers the Solace Normal Attack cost with upgrades and grants no damage reduction', () => {
    expect(conduitActionCost(fixture('solace-anchor', 0).owner, 'light', fixture('solace-anchor', 0).state, 0)).toBe(10);
    const f = fixture('solace-anchor', 5);
    const cost = conduitActionCost(f.owner, 'light', f.state, 0);
    expect(cost).toBe(5);
    f.owner.shatter -= cost;
    expect(prepareConduitAction(f.state, f.owner, 'light', cost, false).freeAction).toBe(true);
    expect(conduitActionCost(f.owner, 'light', f.state, 0)).toBe(0);
    conduitIncoming(f.state, f.target, f.owner, 100, false, false, f.events);
    expect(f.owner.hp).toBe(900);
    const free = fixture('solace-anchor', 10);
    expect(conduitActionCost(free.owner, 'light', free.state, 0)).toBe(0);
    expect(prepareConduitAction(free.state, free.owner, 'light', 0, false).freeAction).toBe(true);
    expect(prepareConduitAction(free.state, free.owner, 'light', 0, false).freeAction).toBe(false);
  });

  it('routes only native overflow once and conserves transferred Gauge', () => {
    const f = fixture('clearwater-manifold', 5);
    f.owner.shatter = 195;
    f.state.allies[1].shatter = 10;
    f.state.allies[2].shatter = 20;
    nativeGauge(f.state, f.owner, 25, f.events);
    expect(f.owner.shatter).toBe(200); expect(f.state.allies[1].shatter).toBe(30);
    expect(f.state.allies[2].shatter).toBe(20);
  });
  it('recycles prior phase HP loss only once and never heals overkill', () => {
    const f = fixture('granite-hourglass', 5);
    conduitIncoming(f.state, f.target, f.owner, 100, false, false, f.events);
    f.state.round++;
    conduitTurnStart(f.state, f.events);
    expect(f.owner.shield).toBe(40);
    f.owner.shield = 0;
    conduitTurnStart(f.state, f.events);
    expect(f.owner.shield).toBe(0);
  });
  it('distinguishes shield-only absorption, critical resistance and high-health prevention', () => {
    for (const [id, critical, expected] of [['sentinel-aperture', true, 50], ['pale-bulwark-diadem', false, 70]] as const) {
      const f = fixture(id, 5);
      generatedShield(f.owner, f.owner, 200, f.events);
      conduitIncoming(f.state, f.target, f.owner, 100, critical, false, f.events);
      expect(f.owner.shield).toBe(200 - expected);
      expect(f.owner.hp).toBe(1000);
    }
  });
});

describe('redesigned Master transformations', () => {
  it.each([
    ['ember', 2, 'skill2', false, 2, 1], ['atmoso', 1, 'light', true, .7, 1],
    ['bliss', 2, 'skill1', false, 1.4, 2], ['elise', 2, 'ultimate', true, 1.2, 4],
    ['nerithe', 3, 'ultimate', true, .5, 1],
  ] as const)('transforms %s Master %i action shape without duplicate activations', (bearer, slot, action, all, scale, impacts) => {
    const f = fixture(undefined, 0, bearer);
    const master = masterConduits.find(master => master.character === bearer && master.id.endsWith(`-${slot}`))!;
    f.owner.masterConduit = master.id;
    const ctx = prepareConduitAction(f.state, f.owner, action, 0, action === 'ultimate' || action === 'skill2');
    expect(ctx.all).toBe(all); expect(ctx.scale).toBe(scale); expect(ctx.impacts).toBe(impacts);
  });
  it('conserves one Burn tick with Sunforge while retaining the two-tick detonation', () => {
    const f = fixture(undefined, 0, 'ember');
    f.owner.masterConduit = 'master-ember-3';
    f.owner.native = { burns: { [f.target.id]: { damage: 100, turns: 3 } } };
    f.target.burn = { damage: 100, turns: 3, sourceId: f.owner.id, origin: 'native' };
    const result = act(f.state, f.owner.id, 'skill2', f.target.id);
    expect(result.state.allies[0].native?.burns?.[f.target.id]?.turns).toBe(2);
    expect(result.events.find(event => event.nativeKind === 'detonation')?.amount).toBe(200);
  });
  it('strengthens Flora Seeds without granting retired Bloom or another counter', () => {
    const f = fixture('botanic-graft-covenant', 5, 'sprout');
    const result = act(f.state, f.owner.id, 'skill2', f.target.id);
    expect(result.state.allies[0].native?.seeds?.[f.owner.id]?.fraction).toBeCloseTo(nativeBalance.flora.seed * 2);
    expect(result.state.allies[0].pilot?.bloom).toBeUndefined();
  });
  it('replaces native team support with concentrated shield or pure Gauge support', () => {
    const tide = fixture(undefined, 0, 'tide');
    tide.owner.masterConduit = 'master-tide-2';
    tide.state.allies[1].hp = 1;
    const result = act(tide.state, tide.owner.id, 'skill2', tide.state.allies[1].id);
    expect(result.state.allies.filter(ally => ally.shield > 0).map(ally => ally.id)).toEqual([tide.state.allies[1].id]);
    const sea = fixture(undefined, 0, 'nerithe');
    sea.owner.masterConduit = 'master-nerithe-2';
    const support = act(sea.state, sea.owner.id, 'skill2', sea.target.id);
    expect(support.events.some(event => event.kind === 'damage')).toBe(false);
    expect(support.state.allies.map(ally => Number((ally.omnicProtection ?? 0).toFixed(6)))).toEqual([.15, .15, .15]);
  });
  it('donates a ready ally action without a donation-use counter', () => {
    const f = fixture(undefined, 0, 'vaelor');
    f.owner.masterConduit = 'master-vaelor-3';
    f.state.allies[1].spent = true;
    const result = act(f.state, f.owner.id, 'light', f.target.id);
    expect(result.state.allies[1].spent).toBe(false);
    expect(gear(result.state.allies[0]).numbers.donationUsed).toBeUndefined();
  });
  it('derives fortress Defense without recursively changing the entry base', () => {
    const f = fixture(undefined, 0, 'orvella');
    f.owner.masterConduit = 'master-orvella-3';
    f.state.allies.forEach(ally => { ally.shield = 1; });
    expect(effectiveDefense(f.state, f.owner)).toBe(160);
    expect(effectiveDefense(f.state, f.owner)).toBe(160);
    expect(f.owner.stats.defense).toBe(100);
  });
});
