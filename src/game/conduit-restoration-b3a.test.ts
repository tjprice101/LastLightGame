import { describe, expect, it } from 'vitest';
import type { ConduitId } from '../content/conduits';
import { radiantConduitPrimitives, radiantConduits, radiantOmnicRules, type RadiantGear } from '../content/conduit-effects';
import { radiantConduitEffectText } from '../content/conduit-effect-text';
import { type RadiantBearerId, type RadiantLoadout } from '../content/combat-kits';
import {
  applyRadiantCombatAction, createRadiantCombat, effectiveRadiantStats, radiantCriticalRate, radiantLoadoutSkillStats, radiantMaximumHealth,
  radiantSkillStats, validateRadiantCombat, type RadiantCombatAction, type RadiantCombatEvent, type RadiantCombatState,
} from './combat-engine';
import { radiantFlareCost } from './combat-gauge';
import { radiantSignatureView } from '../presentation/battle-signatures';

/** D-493 batch B3a (Omnic rows that need no new system), restore text at +0 (phase4-conduit-restoration.md). */
const approved: Record<string, [string, number][]> = {
  'infernic-cinder-testament': [['burn-amp', .2]],
  'ominous-eclipse-mantle': [['skill-power', .35], ['flare', .45], ['weakened-pierce', .35], ['weakened-ally-power', .2]],
  'tectonic-faultkeeper-loom': [['defense', .15], ['skill-power', .55], ['ally-defense-share', .25]],
  'atmospheric-griffin-turbine': [['attack', .198], ['team-charge', 10]],
  'tranquilitic-kirin-cradle': [['defense', .13], ['attack', .4], ['defense-heal', 1]],
  // Crit step (D-493, 2026-11-20): real Critical Rate and Critical Damage replace the C9/C10 conversion.
  'aquatic-leviathan-pump': [['defense', .09], ['crit-rate', .25], ['shield-charge', 5]],
  'ominous-nightglass-archive': [['squad-attack', .4], ['skill-mark', .5]],
  'chaotic-ouroboros-core': [['capacity', .4], ['flare-shield', .1], ['squad-hp', .11]],
  'luminous-seraph-mirror': [['first-crit-heal', .06], ['squad-hp', .13]],
  'tranquilitic-stillhour-carillon': [['hp', .24], ['gauge-gain', .3], ['flare-round-heal', .08], ['flare-round-charge', 10]],
  'aquatic-undertide-chronometer': [['defense', .14], ['skill-efficiency', .3], ['weaken-duration', 1], ['weaken-ally-efficiency', .15]],
  'efflorescent-worldtree-heart': [['hp', .28], ['skill-power', .35], ['overheal-shield', .6]],
  'clearwater-manifold': [['oceanic-power', .35]],
  'aegis-return-spring': [['defense', .18], ['crit-damage', .4], ['skill-shield-crit', .2], ['skill-shield-brace', .3]],
  'flare-focusing-iris': [['attack', .11], ['burn-duration', 1], ['burn-skill-power', .8], ['burn-ally-crit', .2]],
  'cinder-metering-nozzle': [['attack', .45], ['burn-transfer', 1]],
  'firstlight-cam': [['hp', .07], ['skill-power', .45], ['squad-gain', .5], ['squad-defense', .08]],
  'tension-governor': [['skill-efficiency', .25], ['squad-hp', .11], ['weaken-guard', .3], ['weaken-heal', .06]],
  'ward-stitch-spool': [['defense', .11], ['skill-power', .55], ['shielded-restore-power', .3]],
  'tidebound-reflector': [['attack', .25], ['shield-reflect', .4]],
  'emberlife-kiln': [['skill-power', .55], ['capacity', .4], ['burning-attack', 1], ['burn-tick-heal', .08]],
  'infernic-pyre-census': [['hp', .05], ['skill-power', .55], ['census-power', .2]],
  'ruinselect-prism': [['ruin-power', .55], ['ruin-defense', .04]],
  'oceanic-shared-tide-pump': [['hp', .13], ['skill-efficiency', .3], ['shield-echo', .5]],
  'pulse-trigger-pawl': [['skill-power', .65], ['crit-rate', .4], ['first-crit-skill-charge', 8]],
  'solace-anchor': [['attack', .16], ['crit-damage', .35], ['first-turn-attack', .2]],
  'pressurecrest-governor': [['defense', .17], ['crit-rate', .3], ['first-crit-skill-shield', .15]],
  'botanic-graft-covenant': [['hp', .22], ['skill-efficiency', .2], ['low-heal-power', .5], ['lift-guard', .3]],
  'mending-valve': [['attack', .17], ['skill-power', .4], ['skill-drain-ally', .15]],
};

function gear(...ids: ConduitId[]): RadiantGear {
  return Array.from({ length: 8 }, (_, index) => ids[index] ? { id: ids[index], rank: 0 } : null);
}
function member(starter: RadiantBearerId, ids: ConduitId[] = []): RadiantLoadout {
  return { id: starter, starter, level: 0, form: 6, convergenceRank: 1, weaponRank: 0, masterId: null, ascension: {}, gear: gear(...ids) };
}
function fixture(squad: [RadiantBearerId, ConduitId[]?][], seed = 0, attack = 60, enemyHP = [100000, 100000]): RadiantCombatState {
  return createRadiantCombat(squad.map(([starter, ids]) => member(starter, ids)),
    ['enemy', 'enemy2'].map((id, index) => ({ id, elementId: null,
      stats: { hp: enemyHP[index], attack, defense: 50, recovery: 0 }, currencyBudget: 1000 })), seed);
}
const act = (state: RadiantCombatState, action: RadiantCombatAction) => applyRadiantCombatAction(state, action);
const of = <T extends RadiantCombatEvent['type']>(events: RadiantCombatEvent[], type: T) =>
  events.filter((event): event is Extract<RadiantCombatEvent, { type: T }> => event.type === type);
const gauge = (state: RadiantCombatState, id: string) => state.gauge.members.find(entry => entry.id === id)!;
const unit = (state: RadiantCombatState, id: string) => state.bearers.find(entry => entry.loadout.id === id)!;
function skill(state: RadiantCombatState, id: string, slot: 1 | 2, targetId?: string) {
  gauge(state, id).charge = 40;
  return act(state, { type: 'skill', bearerId: id, slot, ...(targetId ? { targetId } : {}) });
}
function flare(state: RadiantCombatState, id: string, targetId?: string) {
  gauge(state, id).charge = radiantFlareCost(gauge(state, id));
  return act(state, { type: 'flare', bearerId: id, ...(targetId ? { targetId } : {}) });
}
/** End the player turn, let `enemy` hit `targets` and finish the enemy phase. */
function enemyPhase(state: RadiantCombatState, targets: string[], coefficient = 1) {
  if (state.phase === 'player') state = act(state, { type: 'end-turn' }).state;
  const hit = act(state, { type: 'enemy-attack', enemyId: 'enemy', targetIds: targets, coefficient });
  state = act(hit.state, { type: 'enemy-heal', enemyId: 'enemy2', amount: 0 }).state;
  const round = act(state, { type: 'finish-enemy-phase' });
  return { hit, round };
}
/** Mark a bearer defeated without an event (fixture only; validation still applies). */
function defeat(state: RadiantCombatState, id: string): void {
  unit(state, id).hp = 0;
  gauge(state, id).living = false;
}
const gearEvents = (events: RadiantCombatEvent[], conduitId: ConduitId) => events.filter(event =>
  ('source' in event && event.source.kind === 'gear' && event.source.conduitId === conduitId) ||
  (event.type === 'charge' && event.gearSource?.kind === 'gear' && event.gearSource.conduitId === conduitId));
const directTo = (events: RadiantCombatEvent[], targetId: string) =>
  of(events, 'damage').filter(event => event.targetId === targetId && event.origin === 'direct').reduce((sum, event) => sum + event.offered, 0);

describe('D-493 B3a restoration: approved designs', () => {
  it.each(Object.keys(approved))('%s matches the approved restore row at +0', id => {
    expect(radiantConduits[id as ConduitId].map(entry => [entry.kind, entry.amount])).toEqual(approved[id]);
  });
  it('keeps fixed rules (turn counts, Burn transfer share) at every rank and scales the rest', () => {
    const at5 = (id: ConduitId) => radiantConduitPrimitives({ id, rank: 5 });
    expect(at5('aquatic-undertide-chronometer').find(entry => entry.kind === 'weaken-duration')!.amount).toBe(1);
    expect(at5('flare-focusing-iris').find(entry => entry.kind === 'burn-duration')!.amount).toBe(1);
    expect(at5('cinder-metering-nozzle').find(entry => entry.kind === 'burn-transfer')!.amount).toBe(1);
    expect(at5('atmospheric-griffin-turbine').find(entry => entry.kind === 'team-charge')!.amount).toBeCloseTo(15);
  });
  it.each(Object.keys(approved))('%s has an exact tooltip with numbers', id => {
    const text = radiantConduitEffectText(id as ConduitId, 0);
    expect(text).toMatch(/[0-9]/);
    expect(text).not.toMatch(/undefined|NaN/);
  });
});

describe('D-493 B3a: squad auras and dynamic stats', () => {
  it('raises every living squad member\'s maximum Health per living wearer and keeps extra Health when a wearer falls', () => {
    const base = fixture([['velmira'], ['tide']]);
    const aura = fixture([['velmira', ['chaotic-ouroboros-core', 'tension-governor']], ['tide']]);
    expect(radiantMaximumHealth(aura, 'tide')).toBe(Math.round(base.bearers[1].stats.hp * (1 + .11 + .11)));
    expect(unit(aura, 'tide').hp).toBe(radiantMaximumHealth(aura, 'tide'));
    const fallen = structuredClone(aura);
    defeat(fallen, 'velmira');
    expect(radiantMaximumHealth(fallen, 'tide')).toBe(Math.round(base.bearers[1].stats.hp));
    expect(() => validateRadiantCombat(fallen)).not.toThrow();
    // Healing cannot raise Health above the lowered maximum; the extra stays until lost.
    expect(unit(fallen, 'tide').hp).toBeGreaterThan(radiantMaximumHealth(fallen, 'tide'));
  });
  it('Nightglass Archive raises squad Attack and marks enemies for other allies\' Normal Attacks (2 turns, +50% Critical Damage)', () => {
    const base = fixture([['velmira'], ['tide']]);
    const state = fixture([['velmira', ['ominous-nightglass-archive']], ['tide']]);
    expect(effectiveRadiantStats(state, 'tide').attack).toBeCloseTo(effectiveRadiantStats(base, 'tide').attack * 1.4);
    const marked = skill(state, 'velmira', 1, 'enemy').state;
    expect(marked.enemies[0].marks).toEqual([{ casterId: 'velmira', remaining: 2 }]);
    // Critical Up of .45 (+90 points) lifts Tizu's 10% to exactly 100%: every hit crits, never Elemental.
    marked.enemies[0].debuffs = [{ category: 'expose', source: { kind: 'skill', bearerId: 'velmira' }, magnitude: .45, remaining: 2 }];
    expect(radiantCriticalRate(marked, 'tide', 'enemy')).toBeCloseTo(1);
    const unmarked = structuredClone(marked);
    delete unmarked.enemies[0].marks;
    const hit = (s: RadiantCombatState) => directTo(act(s, { type: 'normal', bearerId: 'tide', targetId: 'enemy' }).events, 'enemy');
    expect(hit(marked)).toBeGreaterThan(hit(unmarked));
    marked.enemies[0].debuffs = [];
    const once = enemyPhase(marked, ['tide']).round.state;
    expect(once.enemies[0].marks).toEqual([{ casterId: 'velmira', remaining: 1 }]);
    const twice = enemyPhase(once, ['tide']).round.state;
    expect(twice.enemies[0].marks).toBeUndefined();
  });
  it('Firstlight Concordance gives the squad Gauge Gain +50% and Defense +8%', () => {
    const base = fixture([['rosetta'], ['tide']]);
    const state = fixture([['rosetta', ['firstlight-cam']], ['tide']]);
    expect(radiantSkillStats(state, 'tide', 1).gaugeGain).toBeCloseTo(1.5);
    expect(effectiveRadiantStats(state, 'tide').defense).toBeCloseTo(effectiveRadiantStats(base, 'tide').defense * 1.08);
  });
  it('Faultkeeper Loom shares 25% of the wearer\'s current Defense with other living allies', () => {
    const base = fixture([['bruno'], ['tide']]);
    const state = fixture([['bruno', ['tectonic-faultkeeper-loom']], ['tide']]);
    expect(effectiveRadiantStats(state, 'tide').defense)
      .toBeCloseTo(effectiveRadiantStats(base, 'tide').defense + .25 * effectiveRadiantStats(state, 'bruno').defense);
    defeat(state, 'bruno');
    expect(effectiveRadiantStats(state, 'tide').defense).toBeCloseTo(effectiveRadiantStats(base, 'tide').defense);
  });
  it('Clearwater, Pyre Census and Ruinselect read the squad in combat only', () => {
    const water = fixture([['tide', ['clearwater-manifold']], ['nerithe'], ['maerion']]);
    expect(radiantSkillStats(water, 'tide', 1).skillPower - radiantLoadoutSkillStats(water.bearers[0].loadout, 1).skillPower).toBeCloseTo(.7);
    const census = fixture([['ember', ['infernic-pyre-census']], ['tide'], ['sprout']]);
    expect(radiantSkillStats(census, 'ember', 1).skillPower - radiantLoadoutSkillStats(census.bearers[0].loadout, 1).skillPower).toBeCloseTo(.6);
    const ruin = fixture([['velmira', ['ruinselect-prism']], ['tide']]);
    const before = radiantSkillStats(ruin, 'velmira', 1).skillPower, defense = effectiveRadiantStats(ruin, 'velmira').defense;
    defeat(ruin, 'tide');
    expect(radiantSkillStats(ruin, 'velmira', 1).skillPower - before).toBeCloseTo(.55);
    expect(effectiveRadiantStats(ruin, 'velmira').defense).toBeCloseTo(defense * 1.04);
  });
  it('Leviathan Ward Loom adds Skill Power to heal and Shield skills of shielded allies', () => {
    const state = fixture([['tide', ['ward-stitch-spool']], ['maerion']]);
    const before = radiantSkillStats(state, 'maerion', 2).skillPower;
    unit(state, 'maerion').shields.push({ id: state.nextShieldId++, source: { kind: 'skill', bearerId: 'tide' }, remaining: 50 });
    expect(radiantSkillStats(state, 'maerion', 2).skillPower - before).toBeCloseTo(.3);
    // Tide's Skill 1 (Weaken only) gains nothing while Tide holds a Shield.
    const own = radiantSkillStats(state, 'tide', 1).skillPower;
    unit(state, 'tide').shields.push({ id: state.nextShieldId++, source: { kind: 'skill', bearerId: 'tide' }, remaining: 50 });
    expect(radiantSkillStats(state, 'tide', 1).skillPower).toBeCloseTo(own);
  });
  it('Phoenix Lifeforge gives squad Attack Up while any enemy burns and heals the squad on ability Burn ticks', () => {
    const state = fixture([['ember', ['emberlife-kiln']], ['tide']]);
    const cold = effectiveRadiantStats(state, 'tide').attack;
    const burning = skill(state, 'ember', 1, 'enemy').state;
    expect(effectiveRadiantStats(burning, 'tide').attack).toBeCloseTo(cold * 2);
    unit(burning, 'tide').hp = 100;
    const { round } = enemyPhase(burning, ['ember']);
    expect(gearEvents(round.events, 'emberlife-kiln').filter(event => event.type === 'heal' && event.targetId === 'tide')).toHaveLength(1);
  });
});

describe('D-493 B3a: per-target hooks', () => {
  it('Eclipse Mantle: skills hit Weakened enemies harder, more when another ally applied the Weaken', () => {
    const state = fixture([['velmira', ['ominous-eclipse-mantle']], ['ilyss']]);
    const damage = (s: RadiantCombatState) => directTo(skill(s, 'velmira', 2).events, 'enemy');
    const plain = damage(structuredClone(state));
    const byAlly = structuredClone(state);
    byAlly.enemies[0].debuffs.push({ category: 'weaken', source: { kind: 'skill', bearerId: 'ilyss' }, magnitude: .25, remaining: 2 });
    const bySelf = structuredClone(state);
    bySelf.enemies[0].debuffs.push({ category: 'weaken', source: { kind: 'skill', bearerId: 'velmira' }, magnitude: .25, remaining: 2 });
    expect(damage(bySelf)).toBeGreaterThan(plain);
    expect(damage(byAlly)).toBeGreaterThan(damage(bySelf));
  });
  it('Ember Iris: Burn skills gain Skill Power, Burn lasts 1 more turn and allies gain Critical Rate on burning enemies', () => {
    const base = fixture([['ember'], ['tide']]);
    const state = fixture([['ember', ['flare-focusing-iris']], ['tide']]);
    expect(radiantSkillStats(state, 'ember', 1).skillPower - radiantSkillStats(base, 'ember', 1).skillPower).toBeCloseTo(.8);
    expect(radiantSkillStats(state, 'ember', 2).skillPower).toBeCloseTo(radiantSkillStats(base, 'ember', 2).skillPower);
    const burnTurns = (s: RadiantCombatState) => skill(s, 'ember', 1, 'enemy').state.enemies[0].debuffs.find(e => e.category === 'burn')!.remaining;
    expect(burnTurns(structuredClone(state))).toBe(burnTurns(structuredClone(base)) + 1);
    const burning = skill(state, 'ember', 1, 'enemy').state, clean = structuredClone(burning);
    clean.enemies[0].debuffs = [];
    expect(radiantCriticalRate(burning, 'tide', 'enemy') - radiantCriticalRate(clean, 'tide', 'enemy')).toBeCloseTo(.2);
    // The wearer's own hits on its Burn gain nothing.
    expect(radiantCriticalRate(burning, 'ember', 'enemy')).toBeCloseTo(radiantCriticalRate(clean, 'ember', 'enemy'));
  });
  it('Aegis Covenant Crown: holders of the wearer\'s skill Shield gain Critical Rate and take less from enemy critical hits', () => {
    // Find a seed whose first enemy hit is a critical hit (shielded and bare copies share the crit stream).
    for (let seed = 0; seed < 200; seed++) {
      const state = fixture([['solenne', ['aegis-return-spring']], ['rosetta']], seed, 3000);
      const shielded = skill(state, 'solenne', 2).state;
      const bare = structuredClone(shielded);
      unit(bare, 'rosetta').shields = [];
      expect(radiantCriticalRate(shielded, 'rosetta', 'enemy') - radiantCriticalRate(bare, 'rosetta', 'enemy')).toBeCloseTo(.2);
      const hit = (s: RadiantCombatState) => of(enemyPhase(s, ['rosetta'], 3).hit.events, 'damage').filter(event => event.targetId === 'rosetta');
      const guarded = hit(structuredClone(shielded)), open = hit(structuredClone(bare));
      if (!open[0]?.critical) continue;
      expect(guarded[0].critical).toBe(open[0].critical);
      expect(guarded.reduce((sum, event) => sum + event.offered, 0)).toBeLessThan(open.reduce((sum, event) => sum + event.offered, 0));
      return;
    }
    throw new Error('No seed produced an enemy critical hit.');
  });
  it('Undertide Chronometer: Weaken lasts 1 more turn; others pay less for damaging skills on that enemy', () => {
    const base = fixture([['tide'], ['nerithe']]);
    const state = fixture([['tide', ['aquatic-undertide-chronometer']], ['nerithe']]);
    const turns = (s: RadiantCombatState) => skill(s, 'tide', 1, 'enemy').state.enemies[0].debuffs.find(e => e.category === 'weaken')!.remaining;
    expect(turns(structuredClone(state))).toBe(turns(structuredClone(base)) + 1);
    const weakened = skill(state, 'tide', 1, 'enemy').state;
    const cost = (targetId: string) => of(skill(structuredClone(weakened), 'nerithe', 1, targetId).events, 'skill')[0].cost;
    expect(cost('enemy')).toBe(Math.round(25 * (1 - .15)));
    expect(cost('enemy2')).toBe(25);
  });
  it('Worldroot Graft: healing below 40% Health gains Skill Power and a lift grants Defense Up', () => {
    const state = fixture([['sprout', ['botanic-graft-covenant']], ['tide']]);
    const tide = unit(state, 'tide');
    tide.hp = Math.floor(radiantMaximumHealth(state, 'tide') * .1);
    const result = skill(state, 'sprout', 2);
    const after = unit(result.state, 'tide');
    if (after.hp >= radiantOmnicRules.lowHealthLine * radiantMaximumHealth(result.state, 'tide'))
      expect(after.buffs.find(entry => entry.category === 'defense-up')?.source).toEqual(
        { kind: 'gear', bearerId: 'sprout', conduitId: 'botanic-graft-covenant' });
    const base = fixture([['sprout'], ['tide']]);
    unit(base, 'tide').hp = tide.hp;
    const healed = (r: ReturnType<typeof skill>) => of(r.events, 'heal').filter(e => e.targetId === 'tide' && e.source.kind === 'skill')[0].offered;
    expect(healed(result)).toBeGreaterThan(healed(skill(base, 'sprout', 2)));
  });
});

describe('D-493 B3a: triggers', () => {
  it('Griffin Turbine: each Normal Attack fills every other living ally with 10 Luminosity', () => {
    const result = act(fixture([['atmoso', ['atmospheric-griffin-turbine']], ['tide']]), { type: 'normal', bearerId: 'atmoso', targetId: 'enemy' });
    expect(gauge(result.state, 'tide').charge).toBe(10);
  });
  it('Kirin Cradle: heals the lowest ally from current Defense (capped) or fills them when everyone is full', () => {
    const full = act(fixture([['rosetta', ['tranquilitic-kirin-cradle']], ['tide']]), { type: 'normal', bearerId: 'rosetta', targetId: 'enemy' });
    expect(gearEvents(full.events, 'tranquilitic-kirin-cradle').filter(event => event.type === 'charge')).toHaveLength(1);
    expect(gauge(full.state, 'rosetta').charge).toBe(15 + radiantOmnicRules.defenseHealCharge);
    const hurt = fixture([['rosetta', ['tranquilitic-kirin-cradle']], ['tide']]);
    unit(hurt, 'tide').hp = 1;
    const heal = of(act(hurt, { type: 'normal', bearerId: 'rosetta', targetId: 'enemy' }).events, 'heal')
      .find(event => event.source.kind === 'gear')!;
    expect(heal.targetId).toBe('tide');
    expect(heal.offered).toBe(Math.round(Math.min(effectiveRadiantStats(hurt, 'rosetta').defense, .5 * unit(hurt, 'tide').stats.hp)));
  });
  it('Leviathan Pump: an ally whose Shield absorbs an enemy attack gains 5 Luminosity', () => {
    const run = (ids: ConduitId[]) => {
      const state = fixture([['tide', ids], ['maerion']]);
      unit(state, 'maerion').shields.push({ id: state.nextShieldId++, source: { kind: 'skill', bearerId: 'tide' }, remaining: 100000 });
      return gauge(enemyPhase(state, ['maerion']).hit.state, 'maerion').charge;
    };
    expect(run(['aquatic-leviathan-pump']) - run([])).toBe(5);
  });
  it('Seraph Mirror, Sky Sovereign and Tempest Shelter fire on the first action that lands a critical hit', () => {
    // Critical Up at its cap (+160 points) makes every hit on `enemy` a critical hit; without the crit stream none is.
    const certain = (state: RadiantCombatState, critical: boolean) => {
      if (critical) state.enemies[0].debuffs = [{ category: 'expose', source: { kind: 'skill', bearerId: state.bearers[0].loadout.id }, magnitude: .8, remaining: 2 }];
      else delete state.critSeed;
      return state;
    };
    for (const critical of [true, false]) {
      const seraph = certain(fixture([['rosetta', ['luminous-seraph-mirror']], ['tide']]), critical);
      unit(seraph, 'tide').hp = 100;
      const healed = act(seraph, { type: 'normal', bearerId: 'rosetta', targetId: 'enemy' });
      expect(gearEvents(healed.events, 'luminous-seraph-mirror').filter(event => event.type === 'heal' && event.targetId === 'tide'))
        .toHaveLength(critical ? 1 : 0);
      const sky = skill(certain(fixture([['atmoso', ['pulse-trigger-pawl']], ['tide']]), critical), 'atmoso', 1, 'enemy');
      expect(gauge(sky.state, 'tide').charge).toBe(critical ? 8 : 0);
      const shelter = certain(fixture([['atmoso', ['pressurecrest-governor']], ['tide']]), critical);
      unit(shelter, 'tide').hp = 100;
      const shielded = skill(shelter, 'atmoso', 1, 'enemy');
      expect(gearEvents(shielded.events, 'pressurecrest-governor').filter(event => event.type === 'shield' && event.targetId === 'tide'))
        .toHaveLength(critical ? 1 : 0);
    }
  });
  it('Stillhour Carillon: the turn after its Convergent Light heals and fills every living ally', () => {
    const state = fixture([['serapha', ['tranquilitic-stillhour-carillon']], ['tide']]);
    const lit = flare(state, 'serapha').state;
    expect(lit.flared).toEqual(['serapha']);
    unit(lit, 'tide').hp = 100;
    const { round } = enemyPhase(lit, ['serapha']);
    const own = gearEvents(round.events, 'tranquilitic-stillhour-carillon');
    expect(own.filter(event => event.type === 'heal' && event.targetId === 'tide')).toHaveLength(1);
    expect(own.filter(event => event.type === 'charge')).toHaveLength(2);
    expect(round.state.flared).toBeUndefined();
  });
  it('Worldtree Heart: overhealing becomes this Conduit\'s Shield, capped, raised rather than stacked', () => {
    const state = fixture([['sprout', ['efflorescent-worldtree-heart']], ['tide']]);
    const first = skill(state, 'sprout', 2);
    const layers = (s: RadiantCombatState) => unit(s, 'tide').shields.filter(layer => layer.source.kind === 'gear');
    expect(layers(first.state)).toHaveLength(1);
    expect(layers(first.state)[0].remaining).toBeLessThanOrEqual(Math.round(radiantOmnicRules.overhealCap * unit(state, 'tide').stats.hp));
    const again = enemyPhase(first.state, ['sprout'], 0.0001).round.state;
    expect(layers(skill(again, 'sprout', 2).state)).toHaveLength(1);
  });
  it('Cinder Testament: other allies\' skills on this bearer\'s Burn raise it by 20%, up to 60%', () => {
    let state = skill(fixture([['ember', ['infernic-cinder-testament']], ['velmira']]), 'ember', 1, 'enemy').state;
    for (let turn = 0; turn < 4; turn++) {
      state = skill(state, 'velmira', 1, 'enemy').state;
      if (state.phase === 'enemy') state = enemyPhase(state, ['ember']).round.state;
      const burn = state.enemies[0].debuffs.find(effect => effect.category === 'burn');
      if (!burn) break;
      expect(burn.amp).toBeCloseTo(Math.min(.6, .2 * (turn + 1)));
      if (state.phase === 'player' && !state.acted.includes('ember')) state = skill(state, 'ember', 1, 'enemy').state;
    }
  });
  it('Eternal Cinder: a burning enemy\'s defeat strikes the healthiest other enemy with the remaining Burn', () => {
    const state = fixture([['ember', ['cinder-metering-nozzle']], ['tide']], 0, 60, [5, 100000]);
    state.enemies[0].debuffs.push({ category: 'burn', source: { kind: 'skill', bearerId: 'ember' }, magnitude: 10, remaining: 2 });
    const result = act(state, { type: 'normal', bearerId: 'tide', targetId: 'enemy' });
    const strike = gearEvents(result.events, 'cinder-metering-nozzle').find(event => event.type === 'damage');
    expect(strike).toMatchObject({ targetId: 'enemy2', origin: 'generated', offered: 20 });
  });
  it('Fractured Mercy Governor: a Weaken skill guards and (below 50%) heals the most-wounded ally', () => {
    const state = fixture([['velmira', ['tension-governor']], ['tide']]);
    unit(state, 'tide').hp = 100;
    const result = skill(state, 'velmira', 1, 'enemy');
    const own = gearEvents(result.events, 'tension-governor');
    expect(own.filter(event => event.type === 'status' && event.targetId === 'tide')).toHaveLength(1);
    expect(own.filter(event => event.type === 'heal' && event.targetId === 'tide')).toHaveLength(1);
  });
  it('Mercy Reflector: this bearer\'s Shields reflect absorbed damage, capped per enemy phase', () => {
    const shielded = skill(fixture([['tide', ['tidebound-reflector']], ['maerion']], 0, 5000), 'tide', 2).state;
    const { hit, round } = enemyPhase(shielded, ['maerion'], 2);
    const reflect = gearEvents(hit.events, 'tidebound-reflector').filter(event => event.type === 'damage');
    expect(reflect).toHaveLength(1);
    const cap = radiantOmnicRules.reflectCap * effectiveRadiantStats(shielded, 'tide').attack;
    expect(reflect[0].type === 'damage' && reflect[0].offered).toBeLessThanOrEqual(Math.floor(cap));
    expect(unit(round.state, 'tide').reflected).toBeUndefined();
  });
  it('Solace Monolith: acting first gives other living allies Attack Up for the rest of the turn', () => {
    const first = act(fixture([['rosetta', ['solace-anchor']], ['tide']]), { type: 'normal', bearerId: 'rosetta', targetId: 'enemy' });
    expect(unit(first.state, 'tide').buffs.find(entry => entry.category === 'attack-up')?.magnitude).toBeCloseTo(.2);
    const late = act(act(fixture([['rosetta', ['solace-anchor']], ['tide']]), { type: 'normal', bearerId: 'tide', targetId: 'enemy' }).state,
      { type: 'normal', bearerId: 'rosetta', targetId: 'enemy' });
    expect(gearEvents(late.events, 'solace-anchor')).toHaveLength(0);
  });
  it('Sap Cathedral: damaging skills heal the lowest ally from enemy Health removed, capped per cast', () => {
    const state = fixture([['sprout', ['mending-valve']], ['tide']]);
    unit(state, 'tide').hp = 1;
    const result = skill(state, 'sprout', 1, 'enemy');
    const heal = of(result.events, 'heal').find(event => event.source.kind === 'gear' && event.targetId === 'tide')!;
    const removed = of(result.events, 'damage').filter(e => e.source.kind === 'skill').reduce((sum, e) => sum + e.healthLoss, 0);
    expect(heal.offered).toBe(Math.round(Math.min(.15 * removed, radiantOmnicRules.drainAllyCap * unit(state, 'tide').stats.hp)));
  });
  it('Shared Tide (B3b adaptation): a skill that Shields every ally echoes onto the most-wounded recipient', () => {
    const state = fixture([['tide', ['oceanic-shared-tide-pump']], ['maerion']]);
    unit(state, 'maerion').hp = Math.round(unit(state, 'maerion').hp / 2);
    const result = skill(state, 'tide', 2);
    const echo = gearEvents(result.events, 'oceanic-shared-tide-pump');
    expect(echo).toHaveLength(1);
    expect(echo[0]).toMatchObject({ type: 'shield', targetId: 'maerion' });
    const received = result.events.filter(event => event.type === 'shield' && event.source.kind === 'skill' && event.targetId === 'maerion')
      .reduce((sum, event) => sum + (event.type === 'shield' ? event.amount : 0), 0);
    expect(echo[0].type === 'shield' && echo[0].amount).toBe(Math.round(.5 * received));
  });
});

describe('D-493 B3a: battle tags', () => {
  it('shows Nightglass marks and Cinder Testament Burn bonuses on enemies', () => {
    const state = fixture([['velmira', ['ominous-nightglass-archive']], ['ember', ['infernic-cinder-testament']]]);
    state.enemies[0].marks = [{ casterId: 'velmira', remaining: 2 }];
    state.enemies[0].debuffs.push({ category: 'burn', source: { kind: 'skill', bearerId: 'ember' }, magnitude: 5, remaining: 2, amp: .4 });
    const tags = radiantSignatureView(state).holders.enemy;
    expect(tags.some(tag => tag.startsWith('Nightglass Mark') && tag.endsWith('2 turns'))).toBe(true);
    expect(tags).toContain('Cinder Testament · Burn +40%');
  });
});

describe('D-493 B3a: validation and determinism', () => {
  it('rejects malformed marks, ledgers and Burn bonuses', () => {
    const state = fixture([['velmira', ['ominous-nightglass-archive']], ['tide', ['tidebound-reflector']]]);
    const bad = (edit: (s: RadiantCombatState) => void) => { const copy = structuredClone(state); edit(copy); return () => validateRadiantCombat(copy); };
    expect(bad(s => { s.enemies[0].marks = [{ casterId: 'tide', remaining: 1 }]; })).toThrow();
    expect(bad(s => { s.enemies[0].marks = [{ casterId: 'velmira', remaining: 3 }]; })).toThrow();
    expect(bad(s => { s.enemies[0].marks = []; })).toThrow();
    expect(bad(s => { unit(s, 'velmira').reflected = 5; })).toThrow();
    expect(bad(s => { s.flared = ['velmira']; })).toThrow();
    expect(bad(s => { s.enemies[0].debuffs.push({ category: 'burn', source: { kind: 'skill', bearerId: 'velmira' }, magnitude: 5, remaining: 1, amp: .7 }); })).toThrow();
    expect(bad(s => { s.enemies[0].marks = [{ casterId: 'velmira', remaining: 2 }]; unit(s, 'tide').reflected = 5; })).not.toThrow();
  });
  it('replays identically', () => {
    const run = () => {
      let state = fixture([['velmira', ['ominous-nightglass-archive', 'tension-governor']], ['tide', ['tidebound-reflector', 'aquatic-undertide-chronometer']]], 7);
      const log: RadiantCombatEvent[] = [];
      for (const action of [{ type: 'skill', bearerId: 'velmira', slot: 1, targetId: 'enemy' }, { type: 'normal', bearerId: 'tide', targetId: 'enemy' }] as RadiantCombatAction[]) {
        if (action.type === 'skill') gauge(state, action.bearerId).charge = 40;
        const result = act(state, action); state = result.state; log.push(...result.events);
      }
      return { state, log };
    };
    expect(run()).toEqual(run());
  });
});
