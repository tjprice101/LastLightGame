import { describe, expect, it } from 'vitest';
import { elements } from '../content/activities';
import { elementalWars } from '../content/elemental-war';
import { calamityActivities, calamityEncounter, calamityPatterns } from '../content/calamity';
import { storyEncounter } from '../content/story';
import { storyCreature, storyRules } from '../content/story';
import { dungeonVariants } from '../content/dungeons';
import { infusionEncounter } from '../content/infusions';
import { infusionModes, currencyModes, eventModes, machineModes, dungeonStageCount } from '../content/activities';
import { oblivionConstructs } from '../content/gates-of-oblivion';
import { enemyCombatStats } from '../content/stat-growth';
import { enemySkills } from '../content/enemy-skills';
import { radiantMasters, type RadiantMasterId } from '../content/combat-kits';
import { authoredRadiantCalibration, pressureRadiantCalibration, radiantEnemyFactors } from '../content/enemy-calibration';
import { pressureStudyLoadouts } from '../../tools/pressure-study';
import { emptyAccount } from './account';
import { adaptRadiantPressureEncounter, radiantPressureAnchors, assertRadiantPressureAccess } from './enemy-pressure-encounters';
import { runRadiantPressure, radiantPressureEnemyAction, chooseRadiantPressureAction } from './enemy-pressure';
import { applyRadiantCombatAction, createRadiantCombat } from './combat-engine';

const anchors = radiantPressureAnchors();
const opening = anchors.find(anchor => anchor.id === 'story:infernic:early')!;
const opponents = () => adaptRadiantPressureEncounter(opening, 1729, authoredRadiantCalibration);
const solo = () => pressureStudyLoadouts(['ember'], 0, 'empty').loadouts;
const options = { chargeSeed: 1729, targetSeed: 1, maximumRounds: 100 };

describe('radiant authored pressure adapter', () => {
  it('enumerates current regions, all War trials and every Calamity branch/tier', () => {
    for (const element of elements) {
      expect(anchors.filter(a => a.family === `story:${element.id}` && a.position !== 'species')).toHaveLength(4);
      expect(anchors.filter(a => a.family === `dungeon:${element.id}` && a.position !== 'species')).toHaveLength(4);
    }
    for (const war of elementalWars) expect(anchors.filter(a => a.family === `war:${war.character}` && a.position !== 'species')).toHaveLength(4);
    for (const branch of calamityActivities) expect(anchors.filter(a => a.family === `calamity:${branch.id}`)).toHaveLength(3);
    for (const mode of ['heavens', 'abyss', 'treasury', 'sanctuary', 'machines', 'roses', 'moon', 'sunshade'])
      expect(anchors.filter(a => a.family === `infusion:${mode}` && a.position !== 'species')).toHaveLength(4);
    expect(anchors.filter(a => a.family === 'oblivion' && a.position !== 'species')).toHaveLength(4);
    expect(new Set(anchors.map(a => a.id)).size).toBe(anchors.length);
  });
  it.each(anchors.map(anchor => [anchor.id, anchor] as const))('adapts %s finite authored pressure without modifying content', (_, anchor) => {
    const before = JSON.stringify(anchor);
    const control = adaptRadiantPressureEncounter(anchor, 1, authoredRadiantCalibration);
    const tuned = adaptRadiantPressureEncounter(anchor, 1, pressureRadiantCalibration);
    expect(control.length).toBeGreaterThan(0);
    for (let i = 0; i < control.length; i++) {
      expect(control[i].stats.hp).toBe(control[i].authoredStats.health);
      expect(control[i].stats.attack).toBe(control[i].authoredStats.damage);
      expect(control[i].stats.defense).toBe(control[i].authoredStats.defense);
      expect(tuned[i].skills).toEqual(control[i].skills);
      expect(tuned[i].level).toBe(control[i].level);
      expect(tuned[i].currencyBudget).toBe(control[i].currencyBudget);
    }
    expect(JSON.stringify(anchor)).toBe(before);
  });
  it('preserves actual Story, Training and EX+3 levels/stats', () => {
    expect(opponents()[0].authoredStats).toEqual(storyEncounter(1).stats);
    const training = adaptRadiantPressureEncounter(anchors.find(a => a.id === 'training:120')!, 1, authoredRadiantCalibration);
    expect(training).toHaveLength(6);
    expect(training[0].authoredStats).toEqual(enemyCombatStats(120, false));
    const boss = adaptRadiantPressureEncounter(anchors.find(a => a.id === 'calamity:machines:3')!, 1, authoredRadiantCalibration)[0];
    expect(boss.level).toBe(170);
    expect(boss.authoredStats).toEqual(calamityEncounter('machines', 3).stats);
  });
  it('exercises every currently authored live-spawn species and all six War forms, including inactive Sunshade laboratory cases', () => {
    const measured = new Set(anchors.flatMap(anchor => [1, 1729, 104729].flatMap(seed =>
      adaptRadiantPressureEncounter(anchor, seed, authoredRadiantCalibration).map(enemy => enemy.identity))));
    for (const element of elements) for (let stage = 1; stage <= dungeonStageCount; stage++)
      for (const variant of dungeonVariants(element.id, stage)) expect(measured.has(variant.creatureId)).toBe(true);
    for (let stage = 1; stage <= storyRules.stages; stage++)
      for (let identity = 0; identity < (stage % storyRules.regionStages === 0 ? 1 : 4); identity++)
        expect(measured.has(storyCreature(stage, identity).id)).toBe(true);
    for (const mode of [...infusionModes, ...currencyModes, ...eventModes, ...machineModes])
      for (let stage = 1; stage <= mode.stages; stage++)
        expect(measured.has(`infusion:${mode.id}:${infusionEncounter(mode.id, stage).tier}`)).toBe(true);
    for (const war of elementalWars) for (let form = 1; form <= 6; form++)
      expect(measured.has(`war:${war.character}:${form}`)).toBe(true);
    for (const construct of oblivionConstructs) expect(measured.has(construct.id)).toBe(true);
    expect(measured.size).toBe(245);
  });
  it('validates factors, endpoints and interpolation without extrapolating', () => {
    expect(radiantEnemyFactors(120, 'boss', pressureRadiantCalibration)).toEqual({ hp: .25, attack: .2, defense: .6 });
    expect(radiantEnemyFactors(40, 'ordinary', pressureRadiantCalibration).attack).toBeCloseTo(.75 - .25 / 3);
    expect(() => radiantEnemyFactors(186, 'boss', pressureRadiantCalibration)).toThrow();
    expect(() => radiantEnemyFactors(1, 'boss', { ...pressureRadiantCalibration, points: [] })).toThrow();
    expect(() => radiantEnemyFactors(1, 'boss', { ...pressureRadiantCalibration,
      points: [{ level: 1, hp: NaN, attack: 1, defense: 1 }, { level: 185, hp: 1, attack: 1, defense: 1 }] })).toThrow();
  });
  it('keeps actual stage, level, normal-clear, Calamitic-ownership and event-window gates', () => {
    const account = emptyAccount(), before = JSON.stringify(account);
    expect(() => assertRadiantPressureAccess(opening, account, Date.parse('2026-11-08'))).not.toThrow();
    expect(() => assertRadiantPressureAccess(anchors.find(a => a.family === 'dungeon:infernic')!, account, 0)).toThrow();
    expect(() => assertRadiantPressureAccess(anchors.find(a => a.family === 'calamity:infernic')!, account, 0)).toThrow();
    expect(() => assertRadiantPressureAccess(anchors.find(a => a.family === 'oblivion')!, account, 0)).toThrow();
    expect(() => assertRadiantPressureAccess(anchors.find(a => a.id === 'story:infernic:final')!, account, 0)).toThrow('stage');
    expect(JSON.stringify(account)).toBe(before);
    const late = pressureStudyLoadouts(['ember'], 105, 'common').account;
    expect(() => assertRadiantPressureAccess(anchors.find(a => a.family === 'infusion:sunshade')!, late, Date.parse('2026-11-08'))).toThrow('active');
    expect(() => assertRadiantPressureAccess(anchors.find(a => a.family === 'infusion:moon')!, late, Date.parse('2026-11-08'))).not.toThrow();
    expect(() => assertRadiantPressureAccess(anchors.find(a => a.family === 'infusion:machines')!, late, 0)).toThrow();
  });
});

describe('actual bounded action-driven radiant pressure', () => {
  it.each(Object.keys(radiantMasters) as RadiantMasterId[])('chooses legal frozen Master-aware targets for %s', masterId => {
    const id = radiantMasters[masterId].starter;
    const loadouts = pressureStudyLoadouts([id], 105, ['ozriel', 'ilvaris', 'kaelith'].includes(id) ? 'calamitic' : 'farmed').loadouts;
    loadouts[0].masterId = masterId;
    const state = createRadiantCombat(loadouts, [{ elementId: null, id: 'foe', stats: { hp: 1000000, attack: 1, defense: 1, recovery: 0 }, currencyBudget: 0 }], 1);
    state.gauge.members[0].charge = state.gauge.members[0].baseCost * 2;
    state.bearers[0].hp -= 1;
    const action = chooseRadiantPressureAction(state, id, 'balanced');
    expect(() => applyRadiantCombatAction(state, action)).not.toThrow();
    const control = chooseRadiantPressureAction(state, id, 'support-only');
    if (radiantMasters[masterId].rule === 'tide-strike' || radiantMasters[masterId].rule === 'sprout-strike')
      expect(control.type).toBe('defense');
  });
  it('is reproducible, finite and frozen on an authored encounter', () => {
    const loadouts = pressureStudyLoadouts(['ember', 'tide', 'sprout'], 105, 'farmed').loadouts;
    const enemies = adaptRadiantPressureEncounter(anchors.find(a => a.id === 'training:60')!, 1729, pressureRadiantCalibration);
    const before = JSON.stringify({ loadouts, enemies });
    const result = runRadiantPressure(loadouts, enemies, options);
    expect(runRadiantPressure(loadouts, enemies, options)).toEqual(result);
    expect(JSON.stringify({ loadouts, enemies })).toBe(before);
    expect(result.roundsExecuted).toBeLessThanOrEqual(100);
    expect(result.metrics.incomingHPDamage).toBeGreaterThan(0);
    expect(result.metrics.outgoingHPDamage).toBeGreaterThan(0);
    expect(result.metrics.personalGranted).toBeGreaterThan(0);
    expect(result.metrics.currency).toBeLessThanOrEqual(enemies.reduce((sum, e) => sum + e.currencyBudget, 0));
  });
  it('distinguishes effective healing and actual Shield absorption in a sustained support fixture', () => {
    const loadouts = pressureStudyLoadouts(['ember', 'tide', 'sprout'], 0, 'empty').loadouts;
    const enemies = [{ ...opponents()[0], pattern: { ...calamityPatterns.treasury, hits: 4 },
      stats: { hp: 1000000, attack: 30, defense: 0, recovery: 0 } }];
    const result = runRadiantPressure(loadouts, enemies, options);
    expect(result.outcome).toBe('timeout');
    expect(result.metrics.effectiveHealing).toBeGreaterThan(0);
    expect(result.metrics.shieldCreated).toBeGreaterThan(0);
    expect(result.metrics.incomingAbsorbed).toBeGreaterThan(0);
    expect(result.metrics.incomingAbsorbed).toBeLessThanOrEqual(result.metrics.shieldCreated);
  });
  it('reports defeat, timeout and support-only stalemate rather than fake clear', () => {
    const lethal = opponents().map(enemy => ({ ...enemy, stats: { hp: 1000000, attack: 100000, defense: 0, recovery: 0 } }));
    expect(runRadiantPressure(solo(), lethal, options).outcome).toBe('defeat');
    const harmless = opponents().map(enemy => ({ ...enemy, stats: { hp: 1000000, attack: .001, defense: 0, recovery: 0 } }));
    expect(runRadiantPressure(solo(), harmless, { ...options, maximumRounds: 2 }).outcome).toBe('timeout');
    const stalemate = runRadiantPressure(solo(), harmless, { ...options, policy: 'support-only', stalemateRounds: 5 });
    expect(stalemate.outcome).toBe('stalemate');
    expect(stalemate.roundsExecuted).toBe(5);
    expect(stalemate.metrics.outgoingHPDamage).toBe(0);
    expect(stalemate.metrics.currency).toBe(0);
    expect(stalemate.surviving).toBe(1);
  });
  it('records actual HP depletion currency only and living-member losses', () => {
    const tiny = opponents().map(enemy => ({ ...enemy, stats: { hp: 1, attack: 1, defense: 0, recovery: 0 }, currencyBudget: 17 }));
    const result = runRadiantPressure(solo(), tiny, options);
    expect(result.outcome).toBe('victory');
    expect(result.metrics.outgoingHPDamage).toBe(2);
    expect(result.metrics.currency).toBe(34);
    expect(result.metrics.effectiveHealing).toBe(0);
    expect(result.enemyHP).toBe(0);
    expect(result.completedRounds).toBe(1); // Second enemy falls on the second player's turn.
    expect(result.roundsExecuted).toBe(2);
  });
  it('preserves scheduled priority, targeting and preattack sustain', () => {
    const enemy = adaptRadiantPressureEncounter(anchors.find(a => a.id === 'calamity:roses:1')!, 1, authoredRadiantCalibration)[0];
    let state = createRadiantCombat(solo(), [enemy], 1);
    state.round = 4;
    expect(radiantPressureEnemyAction(state, enemy, () => 0).healBefore).toBe(state.enemies[0].stats.hp * .015);
    state.round = 6;
    expect(radiantPressureEnemyAction(state, enemy, () => 0).coefficient).toBe(2.1);
    enemy.skills = enemySkills(100, true, 'authored', 1.5);
    expect(radiantPressureEnemyAction(state, enemy, () => 0).coefficient).toBe(2.6);
  });
  it('bounds options and rejects invalid ownership/Calamitic ordinary controls', () => {
    expect(() => runRadiantPressure(solo(), opponents(), { ...options, maximumRounds: Infinity })).toThrow();
    expect(() => runRadiantPressure(solo(), opponents(), { ...options, targetSeed: 0 })).toThrow();
    expect(() => pressureStudyLoadouts(['ozriel'], 105, 'common')).toThrow('Calamitic');
    expect(() => pressureStudyLoadouts(['ember', 'ember'], 0, 'empty')).toThrow();
    const farmed = pressureStudyLoadouts(['ember', 'tide', 'sprout'], 105, 'farmed');
    expect(farmed.loadouts.every(member => member.masterId !== null)).toBe(true);
    const calamity = pressureStudyLoadouts(['ozriel', 'ilvaris', 'kaelith', 'tide', 'sprout', 'disciple'], 105, 'calamitic');
    expect(calamity.loadouts.every(member => member.gear!.filter(slot => slot !== null).length === 8)).toBe(true);
  });
});

describe('Calamity atomic preattack and split packets', () => {
  function attack(hits: number) {
    let state = createRadiantCombat(solo(), [{ elementId: null, id: 'foe', stats: { hp: 10000, attack: 30, defense: 0, recovery: 0 }, currencyBudget: 0 }], 1);
    state = applyRadiantCombatAction(state, { type: 'defense', bearerId: 'ember' }).state;
    return { before: state, result: applyRadiantCombatAction(state, {
      type: 'enemy-attack', enemyId: 'foe', targetIds: ['ember'], coefficient: 1, hits,
    }) };
  }
  it('splits one mitigated total and grants ten Luminosity per surviving direct hit', () => {
    const single = attack(1), split = attack(4);
    const damage = (result: typeof single.result) => result.events.filter(e => e.type === 'damage').reduce((sum, e) => sum + e.healthLoss + e.absorbed, 0);
    expect(damage(split.result)).toBe(damage(single.result));
    expect(split.result.events.filter(e => e.type === 'damage')).toHaveLength(4);
    expect(single.result.state.gauge.members[0].charge).toBe(10);
    expect(split.result.state.gauge.members[0].charge).toBe(40);
    expect(split.result.state.gauge.sharedUnits).toBe(single.result.state.gauge.sharedUnits);
    expect(() => applyRadiantCombatAction(split.before, { type: 'enemy-attack', enemyId: 'foe',
      targetIds: ['ember'], coefficient: 1, hits: 17 })).toThrow('bounded');
  });
  it('heals and refreshes rather than stacks enemy shields before its one action', () => {
    const { before } = attack(1);
    before.enemies[0].hp = 9000;
    before.enemies[0].currency.lowestHP = 9000;
    before.enemies[0].shields = [{ id: before.nextShieldId++, source: { kind: 'enemy', enemyId: 'foe' }, remaining: 100 }];
    const result = applyRadiantCombatAction(before, { type: 'enemy-attack', enemyId: 'foe', targetIds: ['ember'],
      coefficient: 1, healBefore: 150, refreshShieldBefore: 200 });
    expect(result.state.enemies[0].hp).toBe(9150);
    expect(result.state.enemies[0].shields).toHaveLength(1);
    expect(result.state.enemies[0].shields[0].remaining).toBe(200);
    expect(result.events[0]).toMatchObject({ type: 'heal', effective: 150 });
    expect(result.events[1]).toMatchObject({ type: 'shield', amount: 100 });
    expect(result.state.enemyActed).toEqual(['foe']);
    expect(result.state.currencyEarned).toBe(0);
    expect(before.enemies[0].hp).toBe(9000);
  });
});
