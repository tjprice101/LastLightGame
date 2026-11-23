import { describe, expect, it } from 'vitest';
import type { ConduitId } from '../content/conduits';
import { radiantConduitPrimitives, radiantConduits, type RadiantGear } from '../content/conduit-effects';
import { radiantConduitEffectText } from '../content/conduit-effect-text';
import { resolveRadiantStarterStats, type RadiantBearerId, type RadiantLoadout } from '../content/combat-kits';
import {
  applyRadiantCombatAction, createRadiantCombat, radiantLoadoutSkillStats, radiantSkillStats, validateRadiantCombat,
  type RadiantCombatAction, type RadiantCombatEvent, type RadiantCombatState,
} from './combat-engine';
import { personalChargeMaximum, radiantSkillCost } from './combat-gauge';

/** D-493 batch B1 (Common + Rare), restore text at +0 (phase4-conduit-restoration.md). */
const approved: Record<string, [string, number, true?][]> = {
  'vigil-core': [['hp', .2]],
  'siegebound-drive': [['attack', .07], ['skill-efficiency', .05]],
  'bastion-lock': [['defense', .07], ['skill-power', .25]],
  'parallax-relay': [['hp', .1], ['flare', .1]],
  'fracture-reservoir': [['capacity', .4]],
  'prism-splinter-socket': [['gauge-gain', .075], ['skill-efficiency', .05]],
  // Crit step (D-493, 2026-11-20): real Critical Rate (points) and Critical Damage replace the C9 conversion.
  'precision-escapement': [['crit-damage', .1]],
  'fieldbrace-coupler': [['crit-rate', .25]],
  'reserve-torque-crank': [['capacity', .25], ['gauge-gain', .1]],
  'crosspin-governor': [['skill-power', .4]],
  'aegis-capacitor': [['hp', .15], ['defense', .15]],
  'breach-pendulum': [['enemy-defense', .1]],
  'coilfeed-ratchet': [['skill-efficiency', .08], ['skill-power', .08], ['crit-rate', .08]],
  'duplex-heart': [['ally-heal-self', .05]],
  'falcon-sight': [['hp', .09], ['crit-rate', .25]],
  'glassroot-gimbal': [['health-skill-power', .05]],
  'hammerbalance-link': [['attack', .17], ['crit-damage', .15]],
  'lifeline-flywheel': [['drain', .1]],
  'opal-indexer': [['debuff-power', .75], ['debuff-duration', 1, true]],
  'resonance-crucible': [['defense', .15], ['hp', .1], ['skill-duration', 1, true]],
  'sentinel-aperture': [['skill1-power', .99]],
  'spearwheel-engine': [['skill-pierce', .1]],
  'springwell-pump': [['restore-power', .2]],
  'twinpulse-bellows': [['twin-charge', 7]],
  'wardglass-transformer': [['crit-damage', .35], ['defense', -.07, true]],
};

function gear(rank: number, ...ids: ConduitId[]): RadiantGear {
  return Array.from({ length: 8 }, (_, index) => ids[index] ? { id: ids[index], rank } : null);
}
function member(starter: RadiantBearerId, ids: ConduitId[] = [], rank = 0): RadiantLoadout {
  return { id: starter, starter, level: 0, form: 6, convergenceRank: 1, weaponRank: 0, masterId: null, ascension: {},
    gear: gear(rank, ...ids) };
}
function fixture(squad: [RadiantBearerId, ConduitId[]?][], rank = 0): RadiantCombatState {
  return createRadiantCombat(squad.map(([starter, ids]) => member(starter, ids, rank)),
    ['enemy', 'enemy2'].map(id => ({ id, elementId: null, stats: { hp: 100000, attack: 60, defense: 50, recovery: 0 }, currencyBudget: 1000 })), 0);
}
const act = (state: RadiantCombatState, action: RadiantCombatAction) => applyRadiantCombatAction(state, action);
const damageTo = (events: RadiantCombatEvent[], kind: string) => events
  .filter((event): event is Extract<RadiantCombatEvent, { type: 'damage' }> => event.type === 'damage' && event.source.kind === kind)
  .reduce((sum, event) => sum + event.offered, 0);
const gearHeals = (events: RadiantCombatEvent[]) =>
  events.filter((event): event is Extract<RadiantCombatEvent, { type: 'heal' }> => event.type === 'heal' && event.source.kind === 'gear');
function skill(state: RadiantCombatState, id: string, slot: 1 | 2, targetId?: string) {
  state.gauge.members.find(entry => entry.id === id)!.charge = 40;
  return act(state, { type: 'skill', bearerId: id, slot, ...(targetId ? { targetId } : {}) });
}

describe('D-493 B1 restoration: approved designs', () => {
  it.each(Object.keys(approved))('%s matches the approved restore row at +0', id => {
    expect(radiantConduits[id as ConduitId].map(entry => [entry.kind, entry.amount, ...('fixed' in entry ? [true] : [])]))
      .toEqual(approved[id]);
  });
  it('scales beneficial values by rank and keeps penalties and flat Skill Duration fixed (C12)', () => {
    expect(radiantConduitPrimitives({ id: 'crosspin-governor', rank: 5 })[0].amount).toBeCloseTo(.6);
    expect(radiantConduitPrimitives({ id: 'opal-indexer', rank: 5 })[1]).toEqual({ kind: 'debuff-duration', amount: 1, fixed: true });
    expect(radiantConduitPrimitives({ id: 'wardglass-transformer', rank: 5 })[1].amount).toBe(-.07);
    expect(radiantConduitPrimitives({ id: 'wardglass-transformer', rank: 5 })[0].amount).toBeCloseTo(.525);
  });
  it('writes exact tooltips for the new effects', () => {
    expect(radiantConduitEffectText('wardglass-transformer')).toBe(
      "Critical Damage +35% (multiplies this bearer's base Critical Damage). Defense decreases by 7%.");
    expect(radiantConduitEffectText('fieldbrace-coupler')).toBe(
      'Critical Rate +25 percentage points on Normal Attacks, skills, Convergent Light, signature strikes and Burn.');
    expect(radiantConduitEffectText('fracture-reservoir')).toContain('Luminosity capacity increases by 40% above the Convergent Light cost');
    expect(radiantConduitEffectText('glassroot-gimbal')).toBe(
      "Skill Power increases by 5% for every full 450 of this bearer's maximum Health.");
    expect(radiantConduitEffectText('sentinel-aperture')).toBe('Skill 1 gains 99% Skill Power.');
  });
});

describe('D-493 B1 restoration: Skill stats', () => {
  it('adds flat, slot and trait Skill Power from the kit definition (C3, C13)', () => {
    const base = (starter: RadiantBearerId, slot: 1 | 2 | 'flare') => radiantLoadoutSkillStats(member(starter), slot).skillPower;
    const withGear = (starter: RadiantBearerId, id: ConduitId, slot: 1 | 2 | 'flare') =>
      Number((radiantLoadoutSkillStats(member(starter, [id]), slot).skillPower - base(starter, slot)).toFixed(6));
    for (const slot of [1, 2, 'flare'] as const) expect(withGear('ember', 'crosspin-governor', slot)).toBeCloseTo(.4);
    expect([1, 2, 'flare'].map(slot => withGear('ember', 'sentinel-aperture', slot as 1))).toEqual([.99, 0, 0]);
    // Ember: Cinder Cleave and Dawnfire apply Burn; Flame Arc does not.
    expect([1, 2, 'flare'].map(slot => withGear('ember', 'opal-indexer', slot as 1))).toEqual([.75, 0, .75]);
    // Flora: Verdant Renewal and Worldseed heal; Briar Shot does not.
    expect([1, 2, 'flare'].map(slot => withGear('sprout', 'springwell-pump', slot as 1))).toEqual([0, .2, .2]);
    const health = resolveRadiantStarterStats(member('bruno', ['glassroot-gimbal'])).hp;
    expect(withGear('bruno', 'glassroot-gimbal', 1)).toBeCloseTo(Math.floor(health / 450) * .05);
  });
  it('adds Skill Duration to timed skill effects only, with Opal Indexer limited to debuff skills', () => {
    expect([1, 2, 'flare'].map(slot => radiantLoadoutSkillStats(member('ember', ['opal-indexer'], 5), slot as 1).skillDuration))
      .toEqual([1, 0, 1]);
    expect(radiantLoadoutSkillStats(member('ember', ['resonance-crucible']), 2).skillDuration).toBe(1);
    const burn = (ids: ConduitId[]) => skill(fixture([['ember', ids]]), 'ember', 1, 'enemy').events
      .find(event => event.type === 'status' && event.status === 'burn');
    expect(burn([])).toMatchObject({ remaining: 3 });
    expect(burn(['opal-indexer'])).toMatchObject({ remaining: 4 });
  });
  it('discounts skills and Convergent Light with Skill Efficiency (C4)', () => {
    const state = fixture([['ember', ['coilfeed-ratchet', 'siegebound-drive', 'prism-splinter-socket']]]);
    expect(radiantSkillStats(state, 'ember', 2).skillEfficiency).toBeCloseTo(.18);
    expect(state.gauge.members[0].flareEfficiency).toBeCloseTo(.18);
    const used = skill(state, 'ember', 2).events.find(event => event.type === 'skill');
    expect(used).toMatchObject({ cost: radiantSkillCost(2, .18) });
  });
  it('raises Skill Power damage and keeps the frozen state valid', () => {
    const cast = (ids: ConduitId[]) => damageTo(skill(fixture([['ember', ids]]), 'ember', 2).events, 'skill');
    expect(cast(['crosspin-governor'])).toBeGreaterThan(cast([]));
    expect(cast(['bastion-lock'])).toBeGreaterThan(cast([]));
  });
});

describe('D-493 B1 restoration: Luminosity', () => {
  it('adds capacity above the Convergent Light cost, summed and capped at +100% (C8)', () => {
    const max = (ids: ConduitId[], rank = 0) => personalChargeMaximum(fixture([['ember', ids]], rank).gauge.members[0]);
    // Infernis at form 6: Convergent Light (and base capacity) 200.
    expect(max([])).toBe(200);
    expect(max(['fracture-reservoir'])).toBe(280);
    expect(max(['fracture-reservoir'], 5)).toBe(320);
    expect(max(['fracture-reservoir', 'reserve-torque-crank'], 5)).toBe(395);
    const state = fixture([['ember', ['fracture-reservoir']]]);
    state.gauge.members[0].charge = 270;
    expect(act(state, { type: 'normal', bearerId: 'ember', targetId: 'enemy' }).state.gauge.members[0].charge).toBe(280);
    const tampered = structuredClone(state);
    tampered.gauge.members[0].capacity = 1;
    expect(() => validateRadiantCombat(tampered)).toThrow(/Gauge member mismatch/);
  });
  it('multiplies Luminosity gains by Gauge Gain, rounded once (C6)', () => {
    const fill = (ids: ConduitId[]) =>
      act(fixture([['ember', ids]]), { type: 'normal', bearerId: 'ember', targetId: 'enemy' }).state.gauge.members[0].charge;
    expect(fill([])).toBe(15);
    expect(fill(['prism-splinter-socket'])).toBe(16);
    expect(fill(['prism-splinter-socket', 'reserve-torque-crank'])).toBe(18);
  });
  it('Twinpulse Bellows fills the attacker and the other living ally with the lowest Luminosity percentage', () => {
    const state = fixture([['ember', ['twinpulse-bellows']], ['tide'], ['rosetta']]);
    state.gauge.members[1].charge = 20;
    state.gauge.members[2].charge = 5;
    const result = act(state, { type: 'normal', bearerId: 'ember', targetId: 'enemy' });
    expect(result.state.gauge.members.map(entry => entry.charge)).toEqual([22, 20, 12]);
    expect(result.events.filter(event => event.type === 'charge' && event.gearSource?.kind === 'gear')).toHaveLength(2);
  });
});

describe('D-493 B1 restoration: damage and Defense', () => {
  const normalDamage = (squad: [RadiantBearerId, ConduitId[]?][]) =>
    damageTo(act(fixture(squad), { type: 'normal', bearerId: squad[0][0], targetId: 'enemy' }).events, 'normal');
  it('Spearwheel Engine ignores Defense on skills only', () => {
    expect(normalDamage([['ember', ['spearwheel-engine']]])).toBe(normalDamage([['ember']]));
    const cast = (ids: ConduitId[]) => damageTo(skill(fixture([['ember', ids]]), 'ember', 2).events, 'skill');
    expect(cast(['spearwheel-engine'])).toBeGreaterThan(cast([]));
  });
  it('Breach Pendulum lowers enemy Defense for every squad member, and copies do not stack (C14)', () => {
    const plain = normalDamage([['ember'], ['tide']]);
    const aura = normalDamage([['ember'], ['tide', ['breach-pendulum']]]);
    expect(aura).toBeGreaterThan(plain);
    expect(normalDamage([['ember', ['breach-pendulum']], ['tide', ['breach-pendulum']]])).toBe(aura);
    const hit = act(fixture([['ember'], ['tide', ['breach-pendulum']]]), { type: 'normal', bearerId: 'ember', targetId: 'enemy' })
      .events.find(event => event.type === 'damage');
    expect(hit?.type === 'damage' && hit.boosts?.some(entry =>
      entry.source.kind === 'gear' && entry.source.conduitId === 'breach-pendulum' && entry.source.bearerId === 'tide')).toBe(true);
  });
  it('Wardglass Transformer lowers Defense by a fixed 7% at every rank', () => {
    const base = resolveRadiantStarterStats(member('ember')).defense;
    expect(resolveRadiantStarterStats(member('ember', ['wardglass-transformer'], 5)).defense).toBeCloseTo(base * .93);
  });
});

describe('D-493 B1 restoration: sustain', () => {
  it('Lifeline Flywheel heals 10% of direct damage dealt to enemy Health and Shields', () => {
    const state = fixture([['ember', ['lifeline-flywheel']]]);
    state.bearers[0].hp = 10;
    state.enemies[0].shields.push({ id: state.nextShieldId++, source: { kind: 'enemy', enemyId: 'enemy' }, remaining: 20 });
    const result = act(state, { type: 'normal', bearerId: 'ember', targetId: 'enemy' });
    const hit = result.events.find(event => event.type === 'damage')!;
    if (hit.type !== 'damage') throw new Error('Missing damage.');
    expect(hit.absorbed).toBe(20);
    expect(gearHeals(result.events)).toEqual([expect.objectContaining({
      targetId: 'ember', offered: Math.round(.1 * (hit.healthLoss + hit.absorbed)) })]);
  });
  it('Duplex Heart heals the bearer once when their skill restores another ally', () => {
    const state = fixture([['sprout', ['duplex-heart']], ['ember'], ['tide']]);
    state.bearers.forEach(entry => { entry.hp = 50; });
    const heals = gearHeals(skill(state, 'sprout', 2).events);
    expect(heals).toEqual([expect.objectContaining({ targetId: 'sprout', offered: Math.round(.05 * state.bearers[0].stats.hp) })]);
    const plain = fixture([['sprout', ['duplex-heart']], ['ember']]);
    plain.bearers.forEach(entry => { entry.hp = 50; });
    expect(gearHeals(act(plain, { type: 'normal', bearerId: 'sprout', targetId: 'enemy' }).events)).toEqual([]);
  });
});
