import { describe, expect, it } from 'vitest';
import type { ConduitId } from '../content/conduits';
import { radiantConduitPrimitives, radiantConduits, type RadiantGear } from '../content/conduit-effects';
import { radiantConduitEffectText } from '../content/conduit-effect-text';
import { radiantStarterKits, type RadiantBearerId, type RadiantLoadout } from '../content/combat-kits';
import {
  applyRadiantCombatAction, createRadiantCombat, effectiveRadiantStats, radiantLoadoutSkillStats, radiantMaximumHealth,
  radiantSkillStats, validateRadiantCombat, type RadiantCombatAction, type RadiantCombatEvent, type RadiantCombatState,
} from './combat-engine';
import { radiantFlareCost } from './combat-gauge';

/** D-493 batch B2 (Legendary), restore text at +0 (phase4-conduit-restoration.md). */
const approved: Record<string, [string, number][]> = {
  'astral-prism': [['hp', .1], ['direct', .2125]],
  'citadel-spine': [['attack', .15], ['gauge-gain', .07], ['ally-guard', .35]],
  'execution-orrery': [['skill2-power', .99], ['skill2-efficiency', .1]],
  'granite-hourglass': [['phase-shield', .3]],
  'horizon-heartcase': [['flare', .1375], ['reserve-health', .2], ['reserve-defense', .1]],
  'immortal-vessel': [['hp', .5], ['defense', .15]],
  'judgment-lens': [['skill-direct', .125], ['support-power', .5]],
  'meridian-inverter': [['restore-charge', 4]],
  'nullsong-transmission': [['gamble-power', .75]],
  'pale-bulwark-diadem': [['shield-guard', .5]],
  'siege-cantilever': [['aoe-power', 1.5]],
  'starvein-conductor': [['prism-efficiency', .35], ['prism-gain', .1]],
  'stasis-reliquary': [['last-block', .1]],
  'verdict-caliper': [['exposed-heal', .25]],
  'worldbreaker-drive': [['flare-power', .99], ['direct', .65]],
};

function gear(...ids: ConduitId[]): RadiantGear {
  return Array.from({ length: 8 }, (_, index) => ids[index] ? { id: ids[index], rank: 0 } : null);
}
function member(starter: RadiantBearerId, ids: ConduitId[] = []): RadiantLoadout {
  return { id: starter, starter, level: 0, form: 6, convergenceRank: 1, weaponRank: 0, masterId: null, ascension: {}, gear: gear(...ids) };
}
function fixture(squad: [RadiantBearerId, ConduitId[]?][], seed = 0, attack = 60): RadiantCombatState {
  return createRadiantCombat(squad.map(([starter, ids]) => member(starter, ids)),
    ['enemy', 'enemy2'].map(id => ({ id, elementId: null, stats: { hp: 100000, attack, defense: 50, recovery: 0 }, currencyBudget: 1000 })), seed);
}
const act = (state: RadiantCombatState, action: RadiantCombatAction) => applyRadiantCombatAction(state, action);
const of = <T extends RadiantCombatEvent['type']>(events: RadiantCombatEvent[], type: T) =>
  events.filter((event): event is Extract<RadiantCombatEvent, { type: T }> => event.type === type);
function skill(state: RadiantCombatState, id: string, slot: 1 | 2, targetId?: string) {
  state.gauge.members.find(entry => entry.id === id)!.charge = 40;
  return act(state, { type: 'skill', bearerId: id, slot, ...(targetId ? { targetId } : {}) });
}
/** End the player turn, let `enemy` hit `targets` and finish the enemy phase. */
function enemyPhase(state: RadiantCombatState, targets: string[], coefficient = 1) {
  if (state.phase === 'player') state = act(state, { type: 'end-turn' }).state;
  const hit = act(state, { type: 'enemy-attack', enemyId: 'enemy', targetIds: targets, coefficient });
  state = act(hit.state, { type: 'enemy-heal', enemyId: 'enemy2', amount: 0 }).state;
  const round = act(state, { type: 'finish-enemy-phase' });
  return { hit, round };
}
const element = (id: RadiantBearerId) => radiantStarterKits[id].elementId;

describe('D-493 B2 restoration: approved designs', () => {
  it.each(Object.keys(approved))('%s matches the approved restore row at +0', id => {
    expect(radiantConduits[id as ConduitId].map(entry => [entry.kind, entry.amount])).toEqual(approved[id]);
  });
  it('Stasis Reliquary adds 2 points of chance per rank (C12 exception)', () => {
    expect(radiantConduitPrimitives({ id: 'stasis-reliquary', rank: 5 })[0].amount).toBeCloseTo(.2);
    expect(radiantConduitEffectText('stasis-reliquary', 5)).toContain('20% chance to block');
  });
  it('writes exact tooltips', () => {
    expect(radiantConduitEffectText('nullsong-transmission')).toBe(
      'Each skill and Convergent Light rolls once: 50% chance of 75% more Skill Power, otherwise 75% less Skill Power.');
    expect(radiantConduitEffectText('execution-orrery')).toBe(
      'Skill 2 gains 99% Skill Power. Skill 2 gains 10% Skill Efficiency (total discount up to 50%).');
  });
});

describe('D-493 B2 restoration: Skill stats', () => {
  const delta = (starter: RadiantBearerId, id: ConduitId, slot: 1 | 2 | 'flare', field: 'skillPower' | 'skillEfficiency' = 'skillPower') =>
    Number((radiantLoadoutSkillStats(member(starter, [id]), slot)[field] - radiantLoadoutSkillStats(member(starter), slot)[field]).toFixed(6));
  it('applies slot, area and support traits from the kit definition', () => {
    expect([1, 2, 'flare'].map(slot => delta('ember', 'execution-orrery', slot as 1))).toEqual([0, .99, 0]);
    expect([1, 2, 'flare'].map(slot => delta('ember', 'execution-orrery', slot as 1, 'skillEfficiency'))).toEqual([0, .1, 0]);
    expect([1, 2, 'flare'].map(slot => delta('ember', 'worldbreaker-drive', slot as 1))).toEqual([0, 0, .99]);
    // Infernis: Cinder Cleave hits one enemy; Flame Arc and Dawnfire hit all.
    expect([1, 2, 'flare'].map(slot => delta('ember', 'siege-cantilever', slot as 1))).toEqual([0, 1.5, 1.5]);
    // Infernis's Dawnfire grants Attack Up; Flora's Verdant Renewal and Worldseed heal.
    expect([1, 2, 'flare'].map(slot => delta('ember', 'judgment-lens', slot as 1))).toEqual([0, 0, .5]);
    expect([1, 2, 'flare'].map(slot => delta('sprout', 'judgment-lens', slot as 1))).toEqual([0, .5, .5]);
  });
  it('Starvein Conductor applies only when every squad member has a different element', () => {
    const ids = Object.keys(radiantStarterKits) as RadiantBearerId[];
    const twin = ids.find(id => id !== 'ember' && element(id) === element('ember'))!;
    const other = ids.find(id => element(id) !== element('ember'))!;
    const distinct = fixture([['ember', ['starvein-conductor']], [other]]);
    const shared = fixture([['ember', ['starvein-conductor']], [twin]]);
    expect(radiantSkillStats(distinct, 'ember', 1).skillEfficiency).toBeCloseTo(.35);
    expect(radiantSkillStats(shared, 'ember', 1).skillEfficiency).toBe(0);
    expect(radiantSkillStats(distinct, 'ember', 1).gaugeGain).toBeCloseTo(1.1);
    expect(distinct.gauge.members[0].flareEfficiency).toBeCloseTo(.35);
    expect(shared.gauge.members[0].flareEfficiency).toBeUndefined();
    expect(act(distinct, { type: 'normal', bearerId: 'ember', targetId: 'enemy' }).state.gauge.members[0].charge).toBe(17);
  });
});

describe('D-493 B2 restoration: Defense and Health conditions', () => {
  it('Citadel Spine gives other living allies below 75% Health Defense Up +35%; copies do not stack', () => {
    const state = fixture([['tide', ['citadel-spine']], ['ember']]);
    const base = fixture([['tide'], ['ember']]);
    const defense = (input: RadiantCombatState) => effectiveRadiantStats(input, 'ember').defense;
    expect(defense(state)).toBeCloseTo(defense(base));
    for (const input of [state, base]) input.bearers[1].hp = Math.floor(input.bearers[1].hp * .7);
    expect(defense(state)).toBeCloseTo(defense(base) * 1.35);
    // The wearer itself does not benefit.
    state.bearers[0].hp = Math.floor(state.bearers[0].hp * .5);
    expect(effectiveRadiantStats(state, 'tide').defense).toBeCloseTo(effectiveRadiantStats(base, 'tide').defense);
    const both = fixture([['tide', ['citadel-spine']], ['ember'], ['sprout', ['citadel-spine']]]);
    both.bearers[1].hp = Math.floor(both.bearers[1].hp * .7);
    expect(defense(both)).toBeCloseTo(defense(base) * 1.35);
  });
  it('Horizon Heartcase raises maximum Health and Defense while Luminosity is below the Convergent Light cost', () => {
    const state = fixture([['ember', ['horizon-heartcase']]]);
    const frozen = Math.round(state.bearers[0].stats.hp);
    expect(state.bearers[0].hp).toBe(Math.round(state.bearers[0].stats.hp * 1.2));
    expect(radiantMaximumHealth(state, 'ember')).toBe(state.bearers[0].hp);
    const plain = fixture([['ember']]);
    expect(effectiveRadiantStats(state, 'ember').defense).toBeCloseTo(effectiveRadiantStats(plain, 'ember').defense * 1.1);
    // At the cost the maximum returns to normal: Health above it stays, but healing cannot add more.
    state.gauge.members[0].charge = radiantFlareCost(state.gauge.members[0]) - 15;
    const ready = act(state, { type: 'normal', bearerId: 'ember', targetId: 'enemy' }).state;
    expect(radiantMaximumHealth(ready, 'ember')).toBe(frozen);
    expect(ready.bearers[0].hp).toBe(Math.round(state.bearers[0].stats.hp * 1.2));
    validateRadiantCombat(ready);
    const capped = fixture([['ember', ['horizon-heartcase', 'lifeline-flywheel']]]);
    capped.gauge.members[0].charge = radiantFlareCost(capped.gauge.members[0]);
    capped.bearers[0].hp = frozen - 5;
    const drained = act(capped, { type: 'normal', bearerId: 'ember', targetId: 'enemy' }).events
      .find(event => event.type === 'heal' && event.source.kind === 'gear');
    expect(drained).toMatchObject({ targetId: 'ember', effective: 5 });
  });
});

describe('D-493 B2 restoration: Shields', () => {
  it('Granite Hourglass shields 30% of Health lost to direct enemy damage in the previous enemy phase', () => {
    const { hit, round } = enemyPhase(fixture([['ember', ['granite-hourglass']]]), ['ember']);
    const lost = of(hit.events, 'damage').reduce((sum, event) => sum + event.healthLoss, 0);
    expect(lost).toBeGreaterThan(0);
    expect(hit.state.bearers[0].phaseLoss).toBe(lost);
    expect(of(round.events, 'shield')).toEqual([expect.objectContaining({ targetId: 'ember', amount: Math.round(.3 * lost) })]);
    expect(round.state.bearers[0].phaseLoss).toBeUndefined();
  });
  it('Pale Bulwark Diadem halves the Shield an enemy hit removes', () => {
    const state = fixture([['ember', ['pale-bulwark-diadem']]]);
    state.bearers[0].shields.push({ id: state.nextShieldId++, source: { kind: 'skill', bearerId: 'ember' }, remaining: 100000 });
    const hit = of(enemyPhase(state, ['ember']).hit.events, 'damage')[0];
    expect(hit.healthLoss).toBe(0);
    expect(hit.absorbed).toBe(Math.ceil(hit.offered * .5));
  });
  it('Stasis Reliquary may block the rest of a Shield-breaking hit, then raises damage taken for the next enemy phase', () => {
    let blocked: ReturnType<typeof enemyPhase> | undefined, seed = 0;
    for (; seed < 200 && !blocked; seed++) {
      const state = fixture([['ember', ['stasis-reliquary']]], seed);
      expect(state.conduitSeed).toBeTypeOf('number');
      state.bearers[0].shields.push({ id: state.nextShieldId++, source: { kind: 'skill', bearerId: 'ember' }, remaining: 1 });
      const result = enemyPhase(state, ['ember']);
      if (result.hit.state.bearers[0].stasis) blocked = result;
    }
    expect(blocked).toBeDefined();
    expect(of(blocked!.hit.events, 'damage')[0].healthLoss).toBe(0);
    expect(blocked!.hit.state.bearers[0].stasis).toBe('current');
    expect(blocked!.round.state.bearers[0].stasis).toBe('next');
    // The next enemy phase: +25% damage, no further block; afterwards the Conduit is available again.
    const control = structuredClone(blocked!.round.state);
    delete control.bearers[0].stasis;
    const exposed = enemyPhase(blocked!.round.state, ['ember']), plain = enemyPhase(control, ['ember']);
    expect(of(exposed.hit.events, 'damage')[0].offered).toBe(Math.round(of(plain.hit.events, 'damage')[0].offered * 1.25));
    expect(exposed.round.state.bearers[0].stasis).toBeUndefined();
  });
});

describe('D-493 B2 restoration: RNG, Luminosity and sustain', () => {
  it('Nullsong Transmission rolls on its own stream and swings Skill Power up or down', () => {
    expect(fixture([['ember']]).conduitSeed).toBeUndefined();
    const plain = of(skill(fixture([['ember']]), 'ember', 2).events, 'damage').reduce((sum, event) => sum + event.offered, 0);
    const outcomes = new Set<string>();
    for (let seed = 0; seed < 20; seed++) {
      const state = fixture([['ember', ['nullsong-transmission']]], seed);
      const result = skill(state, 'ember', 2);
      expect(result.state.chargeSeed).toBe(state.chargeSeed);
      expect(result.state.conduitSeed).not.toBe(state.conduitSeed);
      const dealt = of(result.events, 'damage').reduce((sum, event) => sum + event.offered, 0);
      outcomes.add(dealt > plain ? 'up' : 'down');
      expect(skill(fixture([['ember', ['nullsong-transmission']]], seed), 'ember', 2).events).toEqual(result.events);
    }
    expect(outcomes).toEqual(new Set(['up', 'down']));
  });
  it('Meridian Inverter fills each ally its skill heals once', () => {
    const state = fixture([['sprout', ['meridian-inverter']], ['ember'], ['tide']]);
    state.bearers.forEach(entry => { entry.hp = 50; });
    const result = skill(state, 'sprout', 2);
    const grants = of(result.events, 'charge').filter(event => event.gearSource?.kind === 'gear');
    expect(grants.map(event => event.bearerId).sort()).toEqual(['ember', 'sprout', 'tide']);
    expect(result.state.gauge.members.slice(1).map(entry => entry.charge)).toEqual([4, 4]);
  });
  it('Verdict Caliper heals 25% of maximum Health once per action against an enemy with Exposure', () => {
    const heals = (exposed: boolean) => {
      const state = fixture([['ember', ['verdict-caliper']]]);
      state.bearers[0].hp = 10;
      if (exposed) state.enemies[0].debuffs.push({ category: 'expose', source: { kind: 'skill', bearerId: 'ember' }, magnitude: .2, remaining: 2 });
      return of(act(state, { type: 'normal', bearerId: 'ember', targetId: 'enemy' }).events, 'heal').filter(event => event.source.kind === 'gear');
    };
    expect(heals(false)).toEqual([]);
    expect(heals(true)).toEqual([expect.objectContaining({ offered: Math.round(.25 * fixture([['ember']]).bearers[0].stats.hp) })]);
  });
  it('Worldbreaker Drive and Astral Prism add direct damage to Normal Attacks', () => {
    const hit = (ids: ConduitId[]) =>
      of(act(fixture([['ember', ids]]), { type: 'normal', bearerId: 'ember', targetId: 'enemy' }).events, 'damage')[0].offered;
    expect(hit(['worldbreaker-drive'])).toBeGreaterThan(hit(['astral-prism']));
    expect(hit(['astral-prism'])).toBeGreaterThan(hit([]));
  });
});
