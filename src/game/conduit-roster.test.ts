import { describe, expect, it } from 'vitest';
import { conduitBuffs, conduits, type ConduitId } from '../content/conduits';
import { resolveFighter, type ActionId } from '../content/combat';
import { starters, type StarterId } from '../content/starters';
import { masterConduits, type MasterConduitId } from '../content/master-conduits';
import { nativeBalance } from '../content/native-balance';
import { nativeEnemyCompleted, nativePrimaryHit } from './native-kits';
import { act, actionUnavailable, createBattle, endTurn, type BattleEvent } from './battle';
import {
  afterConduitBurn, afterConduitImpact, applyConduitBurn, applyConduitWeaken, conduitActionCost,
  conduitBurnTick, conduitDeaths, conduitHitModifiers, conduitIncoming, conduitTurnStart, finishConduitAction,
  forcedConduitTarget, gear, initializeConduits, nativeGauge, nativeHeal, nativeShield, effectiveDefense,
  nativeTargetDefense, conduitSuppressSkill,
  prepareConduitAction, recordConduitHit,
} from './conduit-runtime';

function fixture(id: ConduitId, level: number, enabled: boolean, character?: StarterId) {
  const entry = conduits.find(entry => entry.id === id)!;
  const bearer = character ?? starters.find(bearer => bearer.elementId === entry.element)?.id ?? 'ember';
  const roster = [bearer, ...starters.filter(entry => entry.id !== bearer).slice(0, 2).map(entry => entry.id)];
  const state = createBattle(1729, roster);
  const owner = state.allies[0], target = state.enemies[0], ally = state.allies[1];
  for (const unit of [...state.allies, ...state.enemies]) {
    unit.stats = { ...unit.stats, health: 1000, damage: 100, defense: 100, crit: 0, shatterCapacity: 200 };
    unit.hp = 1000; unit.shatter = 100;
  }
  owner.conduits = [enabled ? id : null, null, null, null, null, null, null, null];
  state.conduitUpgrades = { [id]: level };
  initializeConduits(state);
  const events: BattleEvent[] = [];
  const amount = (base: number, maximum: number) => enabled ? base + (maximum - base) * level / 5 : 0;
  const stepped = (base: number, maximum: number) => enabled ? level < 3 ? base : maximum : 0;
  const context = (action: ActionId = 'light', damage = 100, critical = false, paid = 30) => {
    const ctx = prepareConduitAction(state, owner, action, paid, false);
    recordConduitHit(ctx, target, damage, critical, 1.5);
    return ctx;
  };
  return { state, owner, target, ally, events, amount, stepped, context, bearer };
}

function exercise(id: ConduitId, level: number, enabled: boolean): void {
  const { state, owner, target, ally, events, amount: n, stepped: s, context, bearer } = fixture(id, level, enabled);
  const finish = (action: ActionId = 'light', critical = false, damage = 100, paid = 30) =>
    finishConduitAction(state, owner, context(action, damage, critical, paid), events);
  const shield = (recipient = owner, value = 100) => nativeShield(state, owner, recipient, value, events);
  const burn = () => { target.burn = { damage: 10, turns: 2, sourceId: owner.id, origin: 'native' }; };
  const weaken = () => { target.weakened = 2; target.weakenFraction = .2; target.weakenSourceId = owner.id; target.weakenOrigin = 'native'; };
  const hit = (damage = 100, critical = false) => conduitIncoming(state, target, owner, damage, critical, false, events);
  switch (id) {
    case 'vigil-core': case 'bastion-lock': case 'precision-escapement': case 'hammerbalance-link':
    case 'immortal-vessel': case 'astral-prism': {
      const entry = conduits.find(entry => entry.id === id)!;
      const base = resolveFighter(bearer);
      const result = resolveFighter(bearer, undefined, owner.conduits, state.conduitUpgrades);
      const expected = { ...base.stats };
      for (const buff of enabled ? conduitBuffs(entry, level) : []) {
        expected[buff.stat] = buff.kind === 'flat' ? expected[buff.stat] + buff.amount : expected[buff.stat] * (1 + buff.amount / 100);
      }
      expect(result.stats).toEqual(expected);
      break;
    }
    case 'siegebound-drive': case 'prism-splinter-socket': case 'crosspin-governor': case 'worldbreaker-drive': {
      const action = id === 'siegebound-drive' ? 'light' : id === 'prism-splinter-socket' ? 'skill1'
        : id === 'crosspin-governor' ? 'skill2' : 'ultimate';
      const range = id === 'siegebound-drive' ? [.08, .16] : id === 'worldbreaker-drive' ? [.35, .7] : [.1, .2];
      expect(context(action).bonus).toBeCloseTo(n(range[0], range[1]));
      break;
    }
    case 'parallax-relay':
      expect(context().criticalBonus).toBeCloseTo(n(.15, .3));
      expect(context().criticalBonus).toBeCloseTo(n(.15, .3));
      break;
    case 'fracture-reservoir':
      expect(owner.shatter).toBeCloseTo(100 + n(5, 10));
      conduitTurnStart(state, events);
      expect(owner.shatter).toBeCloseTo(100 + n(5, 10));
      break;
    case 'fieldbrace-coupler':
      owner.shield = 50; hit(500);
      expect(owner.hp).toBe(550);
      conduitTurnStart(state, events);
      expect(owner.hp).toBe(550);
      state.round += 1; conduitTurnStart(state, events);
      expect(owner.hp).toBe(550 + Math.round(1000 * n(.06, .12)));
      state.round += 1; conduitTurnStart(state, events);
      expect(owner.hp).toBe(550 + Math.round(1000 * n(.06, .12)));
      break;
    case 'reserve-torque-crank':
      nativeGauge(state, owner, 20, events);
      expect(owner.shatter).toBe(120 + (enabled ? Math.max(1, Math.round(20 * n(.1, .25))) : 0));
      break;
    case 'duplex-heart':
      ally.hp = 500; hit();
      expect(ally.hp).toBe(500 + Math.round(1000 * n(.05, .1)));
      hit();
      expect(ally.hp).toBe(500 + 2 * Math.round(1000 * n(.05, .1)));
      break;
    case 'spearwheel-engine':
      expect(conduitHitModifiers(state, owner, target, context('skill1'), false).pierce).toBeCloseTo(n(.15, .3));
      break;
    case 'falcon-sight':
      finish(); finish();
      expect(context('skill1').guaranteed).toBe(enabled);
      break;
    case 'aegis-capacitor':
      owner.shatter = 0; shield(); hit(10);
      expect(owner.shatter).toBeCloseTo(10 + n(4, 8));
      hit(10);
      expect(owner.shatter).toBeCloseTo(20 + 2 * n(4, 8));
      break;
    case 'springwell-pump':
      owner.hp = 100;
      nativeHeal(state, owner, owner, 100, events, true);
      expect(owner.hp).toBeCloseTo(200 + 100 * n(.2, .4));
      break;
    case 'twinpulse-bellows':
      expect(owner.shatter).toBeCloseTo(100 + 200 * n(.15, .35));
      expect(context().bonus).toBe(0);
      break;
    case 'glassroot-gimbal':
      expect(context('light', 100, false, 30).bonus).toBeCloseTo(13 * n(.01, .02));
      owner.shatter = 9;
      expect(context('light', 100, false, 0).bonus).toBe(0);
      expect(context('light', 100, false, 0).criticalBonus).toBe(0);
      break;
    case 'lifeline-flywheel':
      owner.hp = 500; finish();
      expect(owner.hp).toBe(500 + Math.round(100 * n(.08, .16)));
      break;
    case 'sentinel-aperture':
      hit(100, true);
      expect(owner.hp).toBe(1000 - Math.round(100 * (1 - n(.25, .5))));
      break;
    case 'wardglass-transformer':
      shield();
      expect(owner.shield).toBeCloseTo(100 * (1 + n(.2, .4)));
      break;
    case 'breach-pendulum':
      finish();
      expect(owner.shield).toBe(Math.round(100 * n(.08, .16)));
      break;
    case 'coilfeed-ratchet':
      expect(conduitActionCost(owner, 'skill1', state, 25)).toBe(25 - Math.floor(25 * n(.08, .16)));
      expect(conduitActionCost(owner, 'skill2', state, 40)).toBe(40 - Math.floor(40 * n(.08, .16)));
      expect(conduitActionCost(owner, 'ultimate', state, 100)).toBe(100 - Math.floor(100 * n(.08, .16)));
      expect(conduitActionCost(owner, 'ultimate', state, 75)).toBe(enabled ? 70 : 75);
      break;
    case 'opal-indexer':
      applyConduitWeaken(state, owner, target, .2, events, 'skill1');
      expect(target.weakened).toBe(2 + s(1, 2));
      break;
    case 'resonance-crucible': {
      expect(applyConduitBurn(state, owner, target, 100, context('skill1'))).toBe(100);
      const ctx = prepareConduitAction(state, owner, 'skill1', 25, false);
      target.hp = 0; recordConduitHit(ctx, target, 1000, false, 1.5, 200);
      finishConduitAction(state, owner, ctx, events);
      const others = state.enemies.filter(unit => unit.id !== target.id);
      expect(others.reduce((sum, unit) => sum + unit.hp, 0)).toBe(others.length * 1000 - (enabled ? Math.round(200 * n(.3, .6)) : 0));
      break;
    }
    case 'citadel-spine':
      shield();
      expect(owner.shield).toBeCloseTo(100 + 100 * n(.1, .2));
      break;
    case 'judgment-lens':
      expect(context().forbidden).toBe(enabled);
      expect(context('skill1').forbidden).toBe(false);
      break;
    case 'siege-cantilever':
      state.enemies = [target];
      expect(prepareConduitAction(state, owner, 'ultimate', 100, true).bonus).toBeCloseTo(n(.6, 1.2));
      expect(context('ultimate').bonus).toBe(0);
      break;
    case 'nullsong-transmission':
      expect(context().bonus).toBeCloseTo(n(.4, .8));
      expect(context('skill1').bonus).toBeCloseTo(-n(.12, .24));
      expect(context('ultimate').bonus).toBe(0);
      break;
    case 'horizon-heartcase':
      state.round = owner.recoverThrough = 2; owner.hp = 500;
      conduitTurnStart(state, events);
      expect(owner.hp).toBe(500);
      owner.hp = 1000; owner.shatter = 100; hit(1500);
      expect(owner.hp).toBe(enabled ? 1 : 0);
      if (enabled) {
        expect(owner.shatter).toBe(100 - Math.ceil(501 / 10 * (1 - n(.2, .5))) + 10);
        let saves = 1;
        while (owner.hp > 0 && saves < 50) { owner.shatter = 200; hit(1000); if (owner.hp > 0) saves += 1; }
        expect(owner.hp).toBe(0);
        expect(saves).toBeLessThan(20);
      }
      break;
    case 'stasis-reliquary':
      hit(2000);
      expect(owner.hp).toBe(enabled ? 1 : 0);
      state.round++;
      conduitTurnStart(state, events);
      expect(owner.shield).toBe(Math.round(1000 * n(.1, .2)));
      expect(gear(owner).numbers.stasisShieldRound === state.round).toBe(enabled);
      break;
    case 'granite-hourglass':
      hit(); state.round++;
      conduitTurnStart(state, events);
      expect(owner.shield).toBe(Math.round(100 * n(.3, .6)));
      break;
    case 'pale-bulwark-diadem':
      hit();
      expect(owner.hp).toBe(1000 - Math.round(100 * (1 - n(.15, .3))));
      owner.hp = 500; shield();
      expect(owner.shield).toBeCloseTo(100 * (1 + n(.25, .5)));
      break;
    case 'starvein-conductor': {
      const ctx = context('skill1');
      expect(applyConduitBurn(state, owner, target, 100, ctx)).toBe(Math.round(100 * (1 + n(.4, .8))));
      expect(owner.hp).toBe(enabled ? 950 : 1000);
      break;
    }
    case 'meridian-inverter':
      owner.hp = 100; shield();
      expect(owner.shield).toBe(enabled ? 0 : 100);
      expect(owner.hp).toBe(100 + Math.round(100 * n(.75, 1.5)));
      break;
    case 'execution-orrery':
      target.hp = 250;
      expect(conduitHitModifiers(state, owner, target, context(), false).bonus).toBeCloseTo(n(.5, 1));
      target.hp++;
      expect(conduitHitModifiers(state, owner, target, context(), false).bonus).toBe(0);
      break;
    case 'verdict-caliper':
      expect(context().forbidden).toBe(enabled);
      expect(context().bonus).toBeCloseTo(n(.35, .7));
      break;
    case 'infernic-phoenix-reactor':
      hit(2000);
      expect(owner.hp).toBe(Math.round(1000 * n(.25, .5)));
      if (enabled) expect(owner.shatter).toBe(0);
      hit(2000);
      expect(owner.hp).toBe(0);
      break;
    case 'aquatic-leviathan-pump':
      state.allies.forEach(unit => { unit.hp = 500; });
      shield(ally);
      conduitIncoming(state, target, ally, 100, false, false, events);
      state.round++; conduitTurnStart(state, events);
      expect(owner.hp).toBeCloseTo(500 + Math.round(100 * n(.3, .6) / 3));
      break;
    case 'tectonic-atlas-bastion':
      finish('light');
      expect(forcedConduitTarget(state, target, ally).id).toBe(enabled ? owner.id : ally.id);
      hit();
      expect(owner.hp).toBe(1000 - Math.round(100 * (1 - n(.1, .2))));
      break;
    case 'efflorescent-worldtree-heart': {
      nativeHeal(state, owner, ally, 100, events, true, context('skill2'));
      nativeHeal(state, owner, ally, 100, events, true, context('skill2'));
      ally.hp = 500; state.round++; conduitTurnStart(state, events);
      expect(ally.hp).toBe(500 + Math.round(200 * n(.5, 1)));
      break;
    }
    case 'voltaic-thunderbird-coil':
      finish('skill1', true);
      expect(state.enemies[1].hp).toBe(1000 - Math.round(100 * n(.3, .6)));
      break;
    case 'atmospheric-griffin-turbine':
      finish();
      expect(ally.shatter).toBeCloseTo(100 + n(3, 6));
      expect(owner.shatter).toBe(100);
      break;
    case 'luminous-seraph-mirror':
      state.allies.forEach(unit => { unit.hp = 500; });
      finish('skill1', true);
      for (const unit of state.allies) expect(unit.hp).toBe(500 + Math.round(100 * n(.08, .16)));
      break;
    case 'ominous-eclipse-mantle': {
      weaken(); const ctx = context('skill1');
      expect(conduitHitModifiers(state, owner, target, ctx, false).pierce).toBeCloseTo(n(.4, .6));
      expect(target.weakened).toBe(2);
      afterConduitImpact(owner, target, ctx);
      expect(target.weakened).toBe(enabled ? 1 : 2);
      break;
    }
    case 'tranquilitic-kirin-cradle':
      owner.hp = 500; finish('light');
      expect(owner.hp).toBe(500 + Math.round(100 * n(.5, 1)));
      break;
    case 'chaotic-ouroboros-core':
      owner.shatter = 30; finish('ultimate');
      expect(owner.shield).toBe(Math.round(1000 * 30 * n(.003, .006)));
      expect(owner.shatter).toBe(enabled ? 0 : 30);
      break;
    case 'infernic-cinder-testament':
      burn(); afterConduitBurn(state, owner, target, 10, events);
      expect(conduitBurnTick(state, owner, target)).toBe(Math.round(10 * (1 + n(.2, .4))));
      break;
    case 'aquatic-undertide-chronometer':
      applyConduitWeaken(state, owner, target, .2, events, 'skill1');
      expect(gear(target).numbers.scheduleShift ?? 0).toBe(s(1, 2));
      applyConduitWeaken(state, owner, target, .2, events, 'skill1');
      expect(gear(target).numbers.scheduleShift ?? 0).toBe(s(1, 2));
      break;
    case 'tectonic-faultkeeper-loom':
      finish('light');
      conduitIncoming(state, target, ally, 100, false, false, events);
      expect(ally.hp).toBeCloseTo(900 + 100 * n(.3, .6));
      expect(owner.hp).toBeCloseTo(1000 - 100 * n(.3, .6));
      break;
    case 'efflorescent-verdant-covenant':
      ally.hp = 500; nativeHeal(state, owner, ally, 10, events, true);
      expect(prepareConduitAction(state, ally, 'skill1', 30, false).bonus).toBeCloseTo(n(.2, .4));
      break;
    case 'voltaic-stormstep-dynamo':
      expect(context('skill1').bonus).toBe(0);
      expect(context('skill2').bonus).toBeCloseTo(n(.25, .5));
      expect(context('skill2').bonus).toBe(0);
      break;
    case 'atmospheric-skythread-rudder':
      finish('light');
      expect(conduitActionCost(owner, 'skill1', state, 30)).toBeCloseTo(30 - n(10, 20));
      expect(conduitActionCost(owner, 'skill1', state, 30)).toBeCloseTo(30 - n(10, 20));
      break;
    case 'luminous-dawn-witness-array':
      finish(); finish('skill1', true);
      expect(target.hp).toBe(1000 - Math.round(50 * n(.15, .3)));
      break;
    case 'ominous-nightglass-archive': {
      finish('skill1'); const ctx = context();
      expect(conduitHitModifiers(state, owner, target, ctx, false).bonus).toBeCloseTo(n(.1, .2));
      expect(target.conduitMarks?.[owner.id]).toBeUndefined();
      break;
    }
    case 'tranquilitic-stillhour-carillon':
      state.round = owner.recoverThrough = 2; owner.shatter = ally.shatter = 0;
      conduitTurnStart(state, events);
      expect(owner.shatter).toBeCloseTo(n(15, 30));
      expect(ally.shatter).toBeCloseTo(n(15, 30));
      break;
    case 'chaotic-paradox-spindle':
      owner.recoverThrough = state.round;
      expect(context().scale).toBeCloseTo(enabled ? n(.5, .75) : 1);
      break;
    case 'tempered-strike-link':
      burn(); finish();
      expect(target.hp).toBe(1000 - Math.round(10 * n(.8, 1.6)));
      expect(target.burn.turns).toBe(enabled ? 1 : 2);
      break;
    case 'mending-valve':
      state.allies.forEach(unit => { unit.hp = 500; }); target.hp = 0; finish();
      expect(owner.hp).toBe(500 + Math.round(1000 * n(.08, .16)));
      break;
    case 'ward-stitch-spool':
      shield(); owner.hp = 500; ally.hp = 500;
      expect(owner.shield).toBe(100);
      nativeHeal(state, owner, owner, 100, events, true);
      expect(owner.hp).toBeCloseTo(600 + 100 * n(.2, .4));
      nativeHeal(state, owner, ally, 100, events, true);
      expect(ally.hp).toBeCloseTo(600);
      break;
    case 'cinder-metering-nozzle': {
      burn(); const prior = structuredClone(state); target.hp = 0;
      conduitDeaths(state, prior, events);
      expect(state.enemies[1].burn.damage).toBeCloseTo(10 * n(.25, .5));
      if (enabled) expect(state.enemies[1].burn.origin).toBe('conduit');
      break;
    }
    case 'pulse-trigger-pawl':
      finish('skill1', true);
      expect(owner.shatter).toBeCloseTo(100 + n(8, 16));
      break;
    case 'firstlight-cam':
      ally.shatter = 0; finish();
      expect(ally.shatter).toBe(0);
      conduitIncoming(state, target, ally, 100, false, false, events);
      expect(ally.hp).toBe(1000 - Math.round(100 * (1 - n(.25, .5))));
      state.round += 1; ally.hp = 1000;
      conduitIncoming(state, target, ally, 100, false, false, events);
      expect(ally.hp).toBe(900);
      break;
    case 'secondbeat-rack': {
      weaken(); const prior = structuredClone(state); target.hp = 0;
      conduitDeaths(state, prior, events);
      if (enabled) expect(state.enemies[1].weakenFraction).toBeCloseTo(.2 * n(.6, 1));
      expect(state.enemies[1].weakened).toBe(enabled ? 2 : 0);
      break;
    }
    case 'flare-focusing-iris': {
      burn(); const ctx = context('skill2'); ctx.spent.ember = 2;
      target.burn.damage = 100;
      finishConduitAction(state, owner, ctx, events);
      expect(target.hp).toBe(1000 - Math.round(20 * n(.25, .5)));
      expect(state.enemies[1].hp).toBe(1000);
      break;
    }
    case 'clearwater-manifold':
      owner.shatter = 200; ally.shatter = 0;
      nativeGauge(state, owner, 30, events);
      expect(ally.shatter).toBeCloseTo(30 * n(.5, 1));
      expect(owner.shatter).toBe(200);
      break;
    case 'aegis-return-spring':
      shield(ally);
      expect(gear(ally).numbers.criticalSeal ?? 0).toBe(enabled ? 1 : 0);
      expect(gear(owner).numbers.criticalSeal).toBeUndefined();
      break;
    case 'emberlife-kiln':
      owner.hp = 500; burn(); afterConduitBurn(state, owner, target, 100, events);
      expect(owner.hp).toBe(500 + Math.round(100 * n(.2, .4)));
      break;
    case 'tension-governor':
      applyConduitWeaken(state, owner, target, .2, events, 'skill1');
      expect(target.weakenFraction).toBeCloseTo(.2 + n(.05, .1));
      break;
    case 'covercharge-drum': {
      const third = state.allies[2];
      owner.hp = 500; third.hp = 500; third.shatter = 100;
      conduitIncoming(state, target, ally, 5000, false, false, events);
      expect(ally.hp).toBe(0);
      expect(owner.hp).toBe(500 + Math.round(1000 * n(.1, .2)));
      expect(third.hp).toBe(500 + Math.round(1000 * n(.1, .2)));
      expect(third.shatter).toBeCloseTo(100 + n(20, 40));
      break;
    }
    case 'sootwake-crucible':
      burn(); afterConduitBurn(state, owner, target, 100, events);
      afterConduitBurn(state, owner, target, 100, events);
      expect(conduitHitModifiers(state, ally, target, prepareConduitAction(state, ally, 'light', 0, false), false).bonus)
        .toBeCloseTo(2 * n(.2, .4));
      expect(conduitHitModifiers(state, ally, target, prepareConduitAction(state, ally, 'light', 0, false), false).bonus).toBe(0);
      break;
    case 'tidebound-reflector':
      shield(); hit();
      expect(target.hp).toBe(1000 - Math.round(100 * n(.2, .4)));
      expect(owner.hp).toBe(1000);
      break;
    case 'pressurecrest-governor':
      for (let i = 0; i < (level < 3 ? 3 : 2); i++) finish('skill1', true);
      hit();
      expect(owner.hp).toBe(enabled ? 1000 : 900);
      for (let i = 0; i < 3; i++) finish('skill1', true);
      state.round += 1; hit();
      expect(owner.hp).toBe(enabled ? 900 : 800);
      break;
    case 'rootbound-triage-vault': {
      owner.hp = 100; const ctx = context('skill2', 0);
      nativeHeal(state, owner, owner, 10, events, true, ctx);
      finishConduitAction(state, owner, ctx, events);
      expect(owner.hp).toBe(enabled ? Math.round(1000 * n(.2, .4)) : 110);
      expect(owner.shatter).toBe(enabled ? 85 : 100);
      break;
    }
    case 'solace-anchor':
      expect(context('light', 0, false, 10).freeAction).toBe(enabled);
      expect(conduitActionCost(owner, 'light', state, 0)).toBe(0);
      break;
    case 'ruinselect-prism':
      target.conduitMarks = { [owner.id]: 3, [ally.id]: 2 };
      expect(conduitHitModifiers(state, owner, target, context('skill1'), false).bonus).toBeCloseTo(3 * n(.15, .3));
      expect(target.conduitMarks[ally.id]).toBe(2);
      break;
    case 'infernic-pyre-census':
      burn(); afterConduitBurn(state, owner, target, 10, events); afterConduitBurn(state, owner, target, 10, events);
      expect(conduitBurnTick(state, owner, target)).toBe(Math.round(10 * (1 + n(.75, 1.5))));
      break;
    case 'oceanic-shared-tide-pump':
      for (const unit of state.allies) shield(unit);
      hit();
      expect(owner.shield).toBe(enabled ? 100 : 0);
      expect(ally.shield).toBe(enabled ? 0 : 100);
      break;
    case 'atmospheric-storm-clock':
      finish('skill1', true); finish('skill1', true); finish('skill1', true);
      expect(conduitActionCost(owner, 'ultimate', state, 100)).toBeCloseTo(Math.max(1, 100 - 3 * n(15, 30)));
      prepareConduitAction(state, owner, 'ultimate', Math.max(1, 100 - 3 * n(15, 30)), false);
      expect(conduitActionCost(owner, 'ultimate', state, 100)).toBe(100);
      break;
    case 'botanic-graft-covenant': {
      const result = act(state, owner.id, 'skill2', target.id);
      expect(result.state.allies[0].native?.seeds?.[ally.id]?.fraction).toBeCloseTo(nativeBalance.flora.seed * (1 + n(.2, .4)));
      expect(result.state.allies[0].pilot?.bloom).toBeUndefined();
      break;
    }
    case 'tranquilitic-accord-bastion':
      ally.hp = 100; nativeHeal(state, owner, ally, 10, events, true);
      conduitIncoming(state, target, ally, 2000, false, false, events);
      expect(ally.hp).toBe(enabled ? 1 : 0);
      expect(ally.shield).toBe(Math.round(1000 * n(.1, .2)));
      if (enabled) {
        ally.shield = 0; ally.hp = 100; nativeHeal(state, owner, ally, 10, events, true);
        conduitIncoming(state, target, ally, 2000, false, false, events);
        expect(ally.hp).toBe(0);
      }
      break;
    case 'chaotic-fault-verdict':
      shield(); finish('skill1', true);
      expect(target.hp).toBe(1000 - Math.round(100 * n(.5, 1)));
      expect(owner.shield).toBe(enabled ? 0 : 100);
      break;
    default:
      throw new Error(`Missing executable Conduit scenario: ${id}`);
  }
  for (const unit of [...state.allies, ...state.enemies]) {
    expect(Number.isFinite(unit.hp)).toBe(true);
    expect(unit.hp).toBeGreaterThanOrEqual(0);
    expect(unit.hp).toBeLessThanOrEqual(unit.stats.health);
    expect(unit.shield).toBeGreaterThanOrEqual(0);
    expect(unit.shatter).toBeGreaterThanOrEqual(0);
    expect(unit.shatter).toBeLessThanOrEqual(unit.stats.shatterCapacity);
  }
  expect(state.seed).toBe(1729);
}

describe.each([0, 1, 2, 3, 4, 5])('every pre-Calamitic ordinary Conduit at upgrade +%i', level => {
  it.each(conduits.filter(entry => entry.rarity !== 'Calamitic'))('$id executes its exact replacement, with no old stat bundle', entry => exercise(entry.id, level, true));
  it.each(conduits.filter(entry => entry.rarity !== 'Calamitic'))('$id cannot run without the named equipment', entry => exercise(entry.id, level, false));
});

function exerciseMaster(id: MasterConduitId, enabled: boolean): void {
  const entry = masterConduits.find(entry => entry.id === id)!;
  const { state, owner, target, ally, events, context } = fixture('vigil-core', 0, false, entry.character);
  if (enabled) owner.masterConduit = id;
  const finish = (action: ActionId = 'skill1', critical = false) =>
    finishConduitAction(state, owner, context(action, 100, critical), events);
  const shield = () => nativeShield(state, owner, ally, 100, events);
  const weaken = () => applyConduitWeaken(state, owner, target, .2, events, 'skill1');
  const attack = (action: ActionId) => act(state, owner.id, action,
    action !== 'light' && owner.kit?.abilities[action].targets === 'one-ally' ? ally.id : target.id);
  switch (id) {
    case 'master-ember-1':
      target.burn = { damage: 10, turns: 0, sourceId: owner.id, origin: 'native' };
      afterConduitBurn(state, owner, target, 10, events);
      expect(target.burn.turns).toBe(enabled ? 1 : 0);
      expect(owner.hp).toBe(enabled ? 970 : 1000);
      break;
    case 'master-ember-2': {
      const ctx = prepareConduitAction(state, owner, 'skill2', 30, true);
      expect(ctx.all).toBe(!enabled); expect(ctx.scale).toBe(enabled ? 2 : 1);
      break;
    }
    case 'master-ember-3':
      owner.native = { burns: { [target.id]: { damage: 10, turns: 3 } } };
      target.burn = { damage: 10, turns: 3, sourceId: owner.id, origin: 'native' };
      expect(attack('skill2').state.allies[0].native?.burns?.[target.id]?.turns).toBe(enabled ? 2 : 1);
      break;
    case 'master-tide-1':
      shield(); conduitIncoming(state, target, ally, 200, false, false, events);
      expect(ally.hp).toBe(enabled ? 1000 : 900);
      shield(); conduitIncoming(state, target, ally, 200, false, false, events);
      expect(ally.hp).toBe(enabled ? 900 : 800);
      break;
    case 'master-tide-2': {
      ally.hp = 1;
      const result = attack('skill2');
      expect(result.state.allies.filter(unit => unit.shield > 0)).toHaveLength(1);
      expect(result.state.allies[1].shield).toBeCloseTo(1000 * nativeBalance.tizu.shelter * (enabled ? 3 : 1));
      break;
    }
    case 'master-tide-3':
      weaken();
      expect(forcedConduitTarget(state, target, ally).id).toBe(enabled ? owner.id : ally.id);
      break;
    case 'master-sprout-1':
      state.allies.forEach(unit => { unit.hp = 500; });
      finish('skill1');
      expect(ally.hp).toBe(enabled ? 520 : 500);
      finish('skill1');
      expect(ally.hp).toBe(enabled ? 540 : 500);
      break;
    case 'master-sprout-2':
      finish('skill1');
      expect(conduitSuppressSkill(target)).toBe(enabled);
      expect(conduitSuppressSkill(target)).toBe(false);
      finish('skill1');
      expect(conduitSuppressSkill(target)).toBe(false);
      break;
    case 'master-sprout-3':
      ally.hp = 0; finish('ultimate');
      expect(ally.hp).toBe(enabled ? 300 : 0);
      if (enabled) {
        expect(ally.shatter).toBe(0);
        expect(ally.spent).toBe(false);
        expect(actionUnavailable(state, ally, 'light')).toBeNull();
        ally.hp = 0; finish('ultimate');
        expect(ally.hp).toBe(0);
      }
      break;
    case 'master-atmoso-1': {
      const ctx = context('light');
      expect(ctx.all).toBe(enabled); expect(ctx.scale).toBe(enabled ? .7 : 1);
      break;
    }
    case 'master-atmoso-2':
      finish('skill2');
      conduitIncoming(state, target, owner, 100, false, false, events);
      conduitIncoming(state, target, owner, 100, false, false, events);
      expect(context('light').bonus).toBeCloseTo(enabled ? .3 : 0);
      expect(context('light').bonus).toBe(0);
      break;
    case 'master-atmoso-3':
      owner.stats.crit = 1.4;
      expect(conduitHitModifiers(state, owner, target, context(), true).bonus).toBeCloseTo(enabled ? .4 : 0);
      break;
    case 'master-aurora-1':
      weaken();
      expect(nativeTargetDefense(state, target)).toBe(enabled ? 85 : 100);
      expect(effectiveDefense(state, target)).toBe(100);
      break;
    case 'master-aurora-2':
      finish('ultimate');
      expect(gear(target).numbers.judgmentThrough ?? 0).toBe(enabled ? 2 : 0);
      break;
    case 'master-aurora-3':
      weaken(); owner.hp = 500;
      conduitIncoming(state, target, ally, 100, false, false, events);
      expect(owner.hp).toBe(enabled ? 550 : 500);
      expect(ally.hp).toBe(900);
      break;
    case 'master-bliss-1': {
      const ctx = context('skill2');
      expect(ctx.healExtra).toBe(enabled ? 50 : 0);
      expect(owner.hp).toBe(enabled ? 900 : 1000);
      break;
    }
    case 'master-bliss-2': {
      const ctx = context('skill1');
      expect(ctx.impacts).toBe(enabled ? 2 : 1); expect(ctx.scale).toBe(enabled ? 1.4 : 1);
      break;
    }
    case 'master-bliss-3':
      ally.shatter = 0; finish('ultimate');
      expect(conduitActionCost(ally, 'skill1', state, 30)).toBe(enabled ? 0 : 30);
      prepareConduitAction(state, ally, 'skill1', enabled ? 0 : 30, false);
      expect(conduitActionCost(ally, 'skill1', state, 30)).toBe(30);
      break;
    case 'master-bruno-1':
      conduitIncoming(state, target, owner, 500, false, false, events);
      expect(owner.hp).toBe(enabled ? 600 : 500);
      conduitIncoming(state, target, owner, 500, false, false, events);
      expect(owner.hp).toBe(enabled ? 200 : 0);
      break;
    case 'master-bruno-2':
      owner.stats.damage = 200;
      expect(conduitHitModifiers(state, owner, target, context('ultimate'), false).attack).toBe(enabled ? 100 : 200);
      expect(conduitHitModifiers(state, owner, target, context(), false).attack).toBe(200);
      break;
    case 'master-bruno-3':
      weaken();
      expect(effectiveDefense(state, target)).toBe(enabled ? 85 : 100);
      expect(target.weakened).toBe(enabled ? 0 : 2);
      weaken(); weaken();
      expect(effectiveDefense(state, target)).toBe(enabled ? 55 : 100);
      break;
    case 'master-disciple-1': {
      const result = attack('skill2');
      expect(result.state.allies[1].native?.instruction?.throughRound).toBe(enabled ? 4 : 2);
      expect(result.state.allies[1].native?.instruction?.kind).toBe('shelter');
      break;
    }
    case 'master-disciple-2':
      finish('ultimate'); state.allies.forEach(unit => { unit.shatter = 0; });
      nativeGauge(state, owner, 30, events);
      expect(state.allies.map(unit => unit.shatter)).toEqual(enabled ? [10, 10, 10] : [30, 0, 0]);
      break;
    case 'master-disciple-3':
      ally.native = { instruction: { kind: 'strike', owner: owner.id, throughRound: 2 } };
      finish('skill1');
      expect(target.hp).toBe(enabled ? 980 : 1000);
      expect(events.filter(event => event.kind === 'damage' && event.origin === 'conduit')).toHaveLength(enabled ? 1 : 0);
      break;
    case 'master-elise-1': {
      const modifiers = conduitHitModifiers(state, owner, target, context(), true);
      expect(modifiers.pierce).toBe(enabled ? .5 : 0);
      expect(modifiers.critMultiplier).toBe(enabled ? 1.5 : undefined);
      break;
    }
    case 'master-elise-2': {
      const ctx = context('ultimate');
      expect(ctx.impacts).toBe(enabled ? 4 : 1); expect(ctx.scale).toBe(enabled ? 1.2 : 1);
      break;
    }
    case 'master-elise-3':
      target.hp = 0; owner.spent = true; finish('skill1');
      expect(owner.spent).toBe(!enabled);
      owner.spent = true; finish('skill1');
      expect(owner.spent).toBe(!enabled);
      break;
    case 'master-razor-1':
      finish('light');
      conduitIncoming(state, target, owner, 100, false, true, events);
      expect(owner.hp).toBe(enabled ? 950 : 900);
      expect(target.hp).toBe(enabled ? 975 : 1000);
      break;
    case 'master-razor-2':
      owner.shield = 200;
      expect(context('ultimate').bonus).toBe(enabled ? .4 : 0);
      expect(owner.shield).toBe(enabled ? 0 : 200);
      break;
    case 'master-razor-3':
      weaken(); expect(conduitSuppressSkill(target)).toBe(enabled);
      weaken(); expect(conduitSuppressSkill(target)).toBe(false);
      break;
    case 'master-rosetta-1': {
      ally.hp = 300;
      owner.native = { quarry: { target: target.id, round: state.round, contributors: [] } };
      nativePrimaryHit(state, owner, target, true, events);
      nativePrimaryHit(state, ally, target, true, events);
      expect(ally.shield).toBe(enabled ? 480 : 80);
      expect(owner.shield).toBe(enabled ? 0 : 80);
      expect(ally.hp).toBe(300);
      break;
    }
    case 'master-rosetta-2': {
      owner.native = { quarry: { target: target.id, round: state.round, contributors: [owner.id] } };
      const ctx = context('skill2');
      finishConduitAction(state, owner, ctx, events);
      expect(state.enemies.slice(1).map(enemy => enemy.hp)).toEqual(enabled ? [975, 975] : [1000, 1000]);
      break;
    }
    case 'master-rosetta-3':
      owner.native = { quarry: { target: target.id, round: state.round, contributors: [] } };
      finish('ultimate');
      if (enabled) finish('ultimate');
      const firstOpening = conduitHitModifiers(state, ally, target, prepareConduitAction(state, ally, 'light', 0, false), false);
      expect(firstOpening.bonus).toBe(enabled ? .4 : 0);
      if (enabled) {
        const secondOpening = conduitHitModifiers(state, ally, target, prepareConduitAction(state, ally, 'light', 0, false), false);
        expect(secondOpening.bonus).toBe(.4);
        expect(conduitHitModifiers(state, ally, target, prepareConduitAction(state, ally, 'light', 0, false), false).bonus).toBe(0);
      }
      expect(target.weakened).toBe(0);
      break;
    case 'master-thornia-1':
      owner.native = { traps: { [target.id]: { charges: 3, coefficient: .6, throughPhase: 3 } } };
      nativeEnemyCompleted(state, target, true, events);
      expect(state.enemies.map(enemy => enemy.hp)).toEqual(enabled ? [980, 980, 980] : [970, 1000, 1000]);
      break;
    case 'master-thornia-2': {
      owner.native = { traps: { [target.id]: { charges: 3, coefficient: .6, throughPhase: 3 } } };
      const result = attack('skill2');
      expect(result.events.filter(event => event.kind === 'damage' && event.origin === 'native' && !event.nativeKind)).toHaveLength(enabled ? 3 : 1);
      expect(result.state.enemies[1].weakened).toBe(enabled ? 1 : 0);
      expect(result.state.allies[0].native?.traps?.[target.id]?.charges).toBe(2);
      break;
    }
    case 'master-thornia-3':
      finish('skill1'); ally.hp = 100;
      conduitIncoming(state, target, ally, 150, false, false, events);
      expect(ally.hp).toBe(enabled ? 1 : 0);
      expect(owner.hp).toBe(enabled ? 949 : 1000);
      break;
    case 'master-crinso-1':
      finish('skill1', true);
      expect(context('skill2').bonus).toBe(enabled ? .5 : 0);
      expect(context('skill2').bonus).toBe(0);
      break;
    case 'master-crinso-2':
      owner.shield = 100;
      finish('skill2');
      expect(target.hp).toBe(enabled ? 975 : 1000);
      expect(owner.shield).toBe(enabled ? 0 : 100);
      break;
    case 'master-crinso-3':
      owner.hp = 500;
      expect(context('light').bonus).toBe(enabled ? .3 : 0);
      finish('light');
      expect(context('light').bonus).toBe(0);
      finish('light');
      expect(owner.hp).toBe(enabled ? 520 : 500);
      break;
    case 'master-nerithe-1':
      finish('light');
      finishConduitAction(state, ally, prepareConduitAction(state, ally, 'skill1', 30, false), events);
      expect(target.hp).toBe(1000);
      {
        const ctx = prepareConduitAction(state, ally, 'skill1', 30, false);
        recordConduitHit(ctx, state.enemies[1], 100, false, 1.5);
        finishConduitAction(state, ally, ctx, events);
        expect(target.hp).toBe(enabled ? 960 : 1000);
      }
      break;
    case 'master-nerithe-2': {
      const result = attack('skill2');
      expect(result.events.some(event => event.kind === 'damage')).toBe(!enabled);
      expect(result.state.allies.every(unit => Math.abs((unit.omnicProtection ?? 0) - .15) < 1e-9)).toBe(enabled);
      break;
    }
    case 'master-nerithe-3': {
      const result = attack('ultimate');
      expect(result.state.allies[0].recoverThrough).toBe(enabled ? 0 : 2);
      expect(context('ultimate').scale).toBe(enabled ? .5 : 1);
      break;
    }
    case 'master-orvella-1':
      shield();
      expect(ally.shield).toBe(100);
      expect(gear(ally).layers?.some(layer => layer.plate)).toBe(enabled);
      expect(gear(ally).layers?.filter(layer => layer.native).reduce((sum, layer) => sum + layer.amount, 0)).toBe(enabled ? 50 : 100);
      break;
    case 'master-orvella-2':
      owner.native = { foundation: { durability: 200, maximum: 300, throughPhase: 3 } };
      state.allies.forEach(unit => { unit.hp = 500; });
      finish('skill2');
      expect(owner.native.foundation?.durability).toBe(enabled ? 2 : 200);
      expect(state.allies.map(unit => unit.hp)).toEqual(enabled ? [566, 566, 566] : [500, 500, 500]);
      break;
    case 'master-orvella-3':
      state.allies.forEach(unit => { unit.shield = 1; });
      expect(effectiveDefense(state, owner)).toBe(enabled ? 160 : 100);
      expect(effectiveDefense(state, owner)).toBe(enabled ? 160 : 100);
      expect(owner.stats.defense).toBe(100);
      break;
    case 'master-vaelor-1': {
      const ctx = context('ultimate');
      expect(owner.hp).toBe(enabled ? 800 : 1000);
      expect(ctx.bonus).toBe(enabled ? .75 : 0);
      break;
    }
    case 'master-vaelor-2': {
      owner.native = { beat: 1 };
      const result = attack('skill2');
      expect(result.state.allies[0].native?.beat).toBe(1);
      expect(result.state.enemies[0].weakenOrigin).toBe(enabled ? 'conduit' : undefined);
      expect(result.state.enemies[0].weakened).toBe(enabled ? 1 : 0);
      break;
    }
    case 'master-vaelor-3':
      ally.spent = true; finish('light');
      expect(ally.spent).toBe(!enabled);
      ally.spent = true; finish('light');
      expect(ally.spent).toBe(!enabled);
      break;
    default:
      throw new Error(`Missing executable Master scenario: ${id}`);
  }
}

describe('every fixed Master replacement', () => {
  it.each(masterConduits)('$id executes its unique native transformation or effect', entry => exerciseMaster(entry.id, true));
  it.each(masterConduits)('$id cannot run without that matching Master', entry => exerciseMaster(entry.id, false));
});
