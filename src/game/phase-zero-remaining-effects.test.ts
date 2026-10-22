import { describe, expect, it, vi } from 'vitest';
import type { ConduitId } from '../content/conduits';
import type { ActionId } from '../content/combat';
import type { StarterId } from '../content/starters';
import { act, createBattle, type BattleState, type BattleEvent } from './battle';
import { applyConduitBuffs } from '../content/combat';
import {
  applyConduitBurn, conduitActionCost, conduitBurnTick, conduitCriticalBonus,
  conduitHitModifiers, conduitIncoming, conduitTurnStart, expireNativeShields,
  effectiveDefense, finishConduitAction, finishNativeHealing, gear, initializeConduits, nativeHeal, nativeShield, prepareConduitAction, recordConduitHit,
} from './conduit-runtime';
import { afterCalamiticAction, calamiticExtraActionAvailable } from './calamitic-conduits';

vi.mock('../content/phase-zero-stats', async original => ({
  ...await original<typeof import('../content/phase-zero-stats')>(), phaseZeroStatsReady: true,
}));

const levels = [null, 0, 1, 2, 3, 4, 5] as const;
type Level = typeof levels[number];
const benefit = (base: number, level: Level) => level === null ? 0 : base * (1 + .1 * level);

function fixture(id: ConduitId, level: Level, roster: StarterId[] = ['ember', 'tide', 'sprout']) {
  const state = createBattle(1729, roster);
  for (const unit of [...state.allies, ...state.enemies]) {
    unit.stats = { ...unit.stats, health: 1000, defense: 100, damage: 100, crit: 0,
      critMultiplier: 1.5, shatterCapacity: 200, skillPower: 1, skillDuration: 0, skillEfficiency: 0, gaugeGain: 1 };
    unit.hp = 1000;
    unit.shatter = 100;
  }
  for (const enemy of state.enemies) { enemy.hp = 10000; enemy.stats.health = 10000; enemy.stats.defense = 0; }
  if (level !== null) {
    state.allies[0].conduits = [id, null, null, null, null, null, null, null];
    state.conduitUpgrades = { [id]: level };
  }
  initializeConduits(state);
  return state;
}

function hit(state: BattleState, action: ActionId, damage = 100, critical = false, total = damage, overkill = 0) {
  const ctx = prepareConduitAction(state, state.allies[0], action, 25, false);
  recordConduitHit(ctx, state.enemies[0], damage, critical, 1.5, overkill, total);
  const events: BattleEvent[] = [];
  finishConduitAction(state, state.allies[0], ctx, events);
  return { ctx, events };
}

describe.each(levels)('remaining ordinary Phase 0 effects: absent/+%s', level => {
  it('nullsong-transmission uses the upgraded Normal Attack stat and a fixed Skill Power penalty, never the old attack multiplier', () => {
    const state = fixture('nullsong-transmission', level), [owner] = state.allies;
    applyConduitBuffs(owner.stats, owner.conduits, state.conduitUpgrades);
    expect(owner.stats.skillPower).toBe(level === null ? 1 : .85);
    const ctx = prepareConduitAction(state, owner, 'light', 0, false);
    expect(conduitHitModifiers(state, owner, state.enemies[0], ctx, false).attack)
      .toBeCloseTo(level === null ? 100 : 100 * benefit(2.5, level));
    const result = act(state, owner.id, 'light', state.enemies[0].id);
    expect(result.events.find(event => event.kind === 'damage' && event.source === owner.id)?.amount)
      .toBe(level === null ? 100 : Math.round(100 * benefit(2.5, level)));
    expect(prepareConduitAction(state, owner, 'skill1', 25, false).skillPower).toBe(level === null ? 1 : .85);
  });
  it('aegis-capacitor grants Defense only on another ally skill Shield and expires next Enemy Turn', () => {
    const state = fixture('aegis-capacitor', level), [owner, ally] = state.allies;
    nativeShield(state, owner, owner, 100, [], { skillPower: 1 });
    expect(effectiveDefense(state, owner)).toBe(100);
    nativeShield(state, owner, ally, 100, [], { skillPower: 1 });
    expect(effectiveDefense(state, owner)).toBeCloseTo(100 * (1 + benefit(.25, level)));
    nativeShield(state, owner, ally, 100, [], { skillPower: 1 });
    expect(effectiveDefense(state, owner)).toBeCloseTo(100 * (1 + benefit(.25, level)));
    state.round++;
    expect(effectiveDefense(state, owner)).toBe(100);
  });

  it('citadel-spine protects only other living allies strictly below half HP', () => {
    const state = fixture('citadel-spine', level), [owner, ally] = state.allies;
    ally.hp = 499;
    expect(effectiveDefense(state, ally)).toBeCloseTo(100 * (1 + benefit(.3, level)));
    ally.hp = 500;
    expect(effectiveDefense(state, ally)).toBe(100);
    owner.hp = 0; ally.hp = 499;
    expect(effectiveDefense(state, ally)).toBe(100);
  });

  it('immortal-vessel shares effective incoming healing with a fixed recipient HP cap per cast', () => {
    const state = fixture('immortal-vessel', level), [owner, healer, third] = state.allies;
    owner.hp = third.hp = 100;
    const ctx = prepareConduitAction(state, healer, 'ultimate', 100, false);
    nativeHeal(state, healer, owner, 100, [], true, ctx);
    expect(third.hp).toBe(100 + Math.round(100 * benefit(.25, level)));
    nativeHeal(state, healer, owner, 100, [], true, ctx);
    nativeHeal(state, healer, owner, 100, [], true, ctx);
    nativeHeal(state, healer, owner, 100, [], true, ctx);
    expect(third.hp).toBe(level === null ? 100 : 180);
  });

  it('sentinel-aperture uses held whole 10-Gauge steps, not a passive Gauge grant', () => {
    const state = fixture('sentinel-aperture', level), [owner] = state.allies;
    owner.shatter = 39;
    expect(effectiveDefense(state, owner)).toBeCloseTo(100 * (1 + 3 * benefit(.05, level)));
    owner.shatter = 0;
    expect(effectiveDefense(state, owner)).toBe(100);
  });

  it('tectonic-atlas-bastion grants other allies recipient-capacity Gauge per aimed attack up to its upgraded cap', () => {
    const state = fixture('tectonic-atlas-bastion', level), [owner, ally] = state.allies;
    ally.shatter = 0;
    hit(state, 'light');
    expect(gear(state.enemies[0]).owners.taunt).toBe(level === null ? undefined : owner.id);
    for (let i = 0; i < 4; i++)
      conduitIncoming(state, state.enemies[i % state.enemies.length], owner, 1, false, false, []);
    expect(ally.shatter).toBe(Math.min(3 * Math.round(200 * benefit(.04, level)),
      Math.round(200 * benefit(.12, level))));
    expect(owner.hp).toBe(996);
  });

  it('aquatic-leviathan-pump grants its Shield recipient Gauge with a per-recipient Enemy Turn cap and no old healing', () => {
    const state = fixture('aquatic-leviathan-pump', level, ['tide', 'ember', 'sprout']), [owner, ally] = state.allies;
    owner.hp = ally.hp = 100; ally.shatter = 0;
    nativeShield(state, owner, ally, 100, []);
    for (let i = 0; i < 4; i++)
      conduitIncoming(state, state.enemies[i % state.enemies.length], ally, 1, false, false, []);
    expect(ally.shatter).toBe(Math.round(200 * benefit(.15, level)) + 4 * (8 + 10));
    expect(owner.hp).toBe(100);
    expect(ally.hp).toBe(100);
  });

  it('ward-stitch-spool buffs support skills only while a source Shield remains and adds one fixed Enemy Turn', () => {
    const state = fixture('ward-stitch-spool', level, ['tide', 'sprout', 'ember']), [owner, ally] = state.allies;
    nativeShield(state, owner, ally, 100, [], { throughPhase: 1 });
    expect(prepareConduitAction(state, ally, 'skill2', 40, false).skillPower).toBeCloseTo(1 + benefit(.3, level));
    expect(prepareConduitAction(state, state.allies[2], 'skill1', 25, false).skillPower).toBe(1);
    expireNativeShields(state, []);
    expect(ally.shield).toBe(level === null ? 0 : 100);
    state.round++;
    expireNativeShields(state, []);
    expect(ally.shield).toBe(0);
    expect(prepareConduitAction(state, ally, 'skill2', 40, false).skillPower).toBe(1);
  });

  it('infernic-phoenix-reactor revives once with upgraded HP and a finite generated squad Shield', () => {
    const state = fixture('infernic-phoenix-reactor', level), [owner, ally] = state.allies;
    conduitIncoming(state, state.enemies[0], owner, 2000, false, false, []);
    expect(owner.hp).toBe(Math.round(1000 * benefit(.35, level)));
    expect(owner.shatter).toBe(level === null ? 110 : 0);
    expect(ally.shield).toBe(Math.round(1000 * benefit(.15, level)));
    expect(ally.conduitRuntime?.layers?.every(layer => !layer.native) ?? true).toBe(true);
    conduitIncoming(state, state.enemies[0], owner, 2000, false, false, []);
    expect(owner.hp).toBe(0);
    expireNativeShields(state, []);
    expect(ally.shield).toBe(0);
  });

  it('pulse-trigger-pawl grants percentage Gauge once per critical skill turn, not per target or Normal', () => {
    const state = fixture('pulse-trigger-pawl', level), [, ally] = state.allies;
    ally.shatter = 0;
    hit(state, 'light', 10, true);
    expect(ally.shatter).toBe(0);
    hit(state, 'skill1', 10, true);
    hit(state, 'skill2', 10, true);
    expect(ally.shatter).toBe(Math.round(200 * benefit(.08, level)));
    state.round++;
    hit(state, 'skill1', 10, true);
    expect(ally.shatter).toBe(2 * Math.round(200 * benefit(.08, level)));
  });

  it('chaotic-ouroboros-core creates upgraded generated Shields for two fixed Enemy Turns after Last Flare', () => {
    const state = fixture('chaotic-ouroboros-core', level);
    hit(state, 'ultimate');
    expect(state.allies.map(ally => ally.shield)).toEqual(Array(3).fill(Math.round(1000 * benefit(.1, level))));
    expireNativeShields(state, []);
    expect(state.allies[1].shield).toBe(Math.round(1000 * benefit(.1, level)));
    state.round++;
    expireNativeShields(state, []);
    expect(state.allies[1].shield).toBe(0);
  });

  it('worldbreaker-drive changes Last Flare Power only, not other skills or a retired AoE override', () => {
    const state = fixture('worldbreaker-drive', level), [owner] = state.allies;
    expect(prepareConduitAction(state, owner, 'ultimate', 100, true).skillPower).toBeCloseTo(1 + benefit(.85, level));
    expect(prepareConduitAction(state, owner, 'skill1', 25, false).skillPower).toBe(1);
  });

  it('calamitic-cathedral-final-equation grants upgraded living-squad Power and Efficiency once across duplicate sources', () => {
    const state = fixture('calamitic-cathedral-final-equation', level), [owner, ally, third] = state.allies;
    third.conduits = owner.conduits ? [...owner.conduits] : undefined;
    expect(prepareConduitAction(state, ally, 'skill1', 25, false).skillPower).toBeCloseTo(1 + benefit(.3, level));
    expect(conduitActionCost(ally, 'skill1', state, 100)).toBe(Math.ceil(100 * (1 - benefit(.25, level))));
    owner.hp = third.hp = 0;
    expect(prepareConduitAction(state, ally, 'skill1', 25, false).skillPower).toBe(1);
    expect(conduitActionCost(ally, 'skill1', state, 100)).toBe(100);
  });

  it('calamitic-throne-borrowed-tomorrows grants spent nonrecovering recipients exactly one extra skill per player turn', () => {
    const state = fixture('calamitic-throne-borrowed-tomorrows', level), [owner, ally, third] = state.allies;
    ally.spent = third.spent = true;
    third.recoverThrough = state.round;
    afterCalamiticAction(state, owner, 'ultimate', []);
    expect(calamiticExtraActionAvailable(state, ally, 'skill1')).toBe(level !== null);
    expect(calamiticExtraActionAvailable(state, third, 'skill1')).toBe(false);
    expect(calamiticExtraActionAvailable(state, ally, 'light')).toBe(false);
  });

  it('calamitic-causality-funeral-engine grants upgraded additive Power and removes Last Flare recovery only', () => {
    const state = fixture('calamitic-causality-funeral-engine', level), [owner] = state.allies;
    applyConduitBuffs(owner.stats, owner.conduits, state.conduitUpgrades);
    expect(prepareConduitAction(state, owner, 'ultimate', 100, true).skillPower).toBeCloseTo(1 + benefit(.8, level));
    const result = act(state, owner.id, 'ultimate', state.enemies[0].id).state;
    expect(result.allies[0].recoverThrough).toBe(level === null ? 2 : 0);
    expect(result.allies[0].spent).toBe(true);
  });

  it('calamitic-world-eater-orrery heals every living ally from each skill total, not Normals or a once-turn limit', () => {
    const state = fixture('calamitic-world-eater-orrery', level), [owner, ally, third] = state.allies;
    ally.hp = 100; third.hp = 0;
    hit(state, 'skill1', 40, false, 100);
    expect(ally.hp).toBe(100 + Math.round(100 * benefit(.1, level)));
    hit(state, 'skill2', 40, false, 100);
    expect(ally.hp).toBe(100 + 2 * Math.round(100 * benefit(.1, level)));
    hit(state, 'light', 100);
    expect(ally.hp).toBe(100 + 2 * Math.round(100 * benefit(.1, level)));
    expect(third.hp).toBe(0);
    expect(owner.hp).toBe(1000);
  });
  it('breach-pendulum scales only Normal critical damage above the strict 75% threshold', () => {
    const state = fixture('breach-pendulum', level);
    const [owner] = state.allies, enemy = state.enemies[0];
    const normal = prepareConduitAction(state, owner, 'light', 0, false);
    expect(conduitHitModifiers(state, owner, enemy, normal, true).criticalDamageBonus ?? 0).toBeCloseTo(benefit(.4, level));
    enemy.hp = 7500;
    expect(conduitHitModifiers(state, owner, enemy, normal, true).criticalDamageBonus ?? 0).toBe(0);
    enemy.hp = 10000;
    expect(conduitHitModifiers(state, owner, enemy, prepareConduitAction(state, owner, 'skill1', 25, false), true)
      .criticalDamageBonus ?? 0).toBe(0);
  });

  it('duplex-heart heals the caster once after effective other-ally skill healing', () => {
    const state = fixture('duplex-heart', level, ['sprout', 'ember', 'tide']);
    const [owner, ally, third] = state.allies;
    owner.hp = ally.hp = third.hp = 100;
    const ctx = prepareConduitAction(state, owner, 'ultimate', 100, false);
    nativeHeal(state, owner, ally, 100, [], true, ctx);
    nativeHeal(state, owner, third, 100, [], true, ctx);
    finishConduitAction(state, owner, ctx, []);
    expect(owner.hp).toBe(100 + Math.round(1000 * benefit(.05, level)));
    expect(ctx.healRecipients).toEqual([ally.id, third.id]);
  });

  it('falcon-sight counts Attack Actions, not targets, and spends one guaranteed critical', () => {
    const state = fixture('falcon-sight', level);
    const [owner] = state.allies;
    hit(state, 'light');
    hit(state, 'skill1');
    const ctx = prepareConduitAction(state, owner, 'light', 0, false);
    expect(ctx.guaranteed).toBe(level !== null);
    expect(ctx.criticalDamageBonus).toBeCloseTo(benefit(.1, level));
    recordConduitHit(ctx, state.enemies[0], 100, true, 1.5);
    recordConduitHit(ctx, state.enemies[1], 100, true, 1.5);
    finishConduitAction(state, owner, ctx, []);
    expect(prepareConduitAction(state, owner, 'light', 0, false).guaranteed).toBe(false);
  });

  it('glassroot-gimbal has no Shield bonus and does not affect Normal Attack', () => {
    const state = fixture('glassroot-gimbal', level), owner = state.allies[0];
    expect(prepareConduitAction(state, owner, 'skill1', 25, false).skillPower).toBeCloseTo(1 + benefit(.35, level));
    expect(prepareConduitAction(state, owner, 'light', 0, false).skillPower).toBe(1);
    owner.shield = 1;
    expect(prepareConduitAction(state, owner, 'skill1', 25, false).skillPower).toBe(1);
  });

  it('lifeline-flywheel counts actual HP plus Shield damage, not overkill', () => {
    const state = fixture('lifeline-flywheel', level), owner = state.allies[0];
    owner.hp = 100;
    hit(state, 'light', 40, false, 100, 500);
    expect(owner.hp).toBe(100 + Math.round(100 * benefit(.08, level)));
  });

  it('opal-indexer only boosts actual native debuff skills', () => {
    const state = fixture('opal-indexer', level), owner = state.allies[0];
    expect(prepareConduitAction(state, owner, 'skill1', 25, false).skillPower).toBeCloseTo(1 + benefit(.25, level));
    expect(prepareConduitAction(state, owner, 'skill2', 40, true).skillPower).toBe(1);
  });

  it('resonance-crucible transfers all named overkill once and does not create native procs', () => {
    const state = fixture('resonance-crucible', level), target = state.enemies[1];
    const before = target.hp;
    const { events } = hit(state, 'skill1', 1, false, 1, 80);
    expect(before - target.hp).toBe(level === null ? 0 : 80);
    expect(events.filter(event => event.kind === 'damage').every(event => event.origin === 'conduit')).toBe(true);
  });

  it('spearwheel-engine pierces every skill but never Normal Attack', () => {
    const state = fixture('spearwheel-engine', level), owner = state.allies[0], target = state.enemies[0];
    for (const action of ['skill1', 'skill2', 'ultimate'] as const)
      expect(conduitHitModifiers(state, owner, target, prepareConduitAction(state, owner, action, 100, false), false).pierce)
        .toBeCloseTo(benefit(.1, level));
    expect(conduitHitModifiers(state, owner, target, prepareConduitAction(state, owner, 'light', 0, false), false).pierce).toBe(0);
  });

  it('springwell-pump classifies healing/Shield abilities, not every skill', () => {
    const state = fixture('springwell-pump', level, ['tide', 'ember', 'sprout']), owner = state.allies[0];
    expect(prepareConduitAction(state, owner, 'skill2', 40, false).skillPower).toBeCloseTo(1 + benefit(.2, level));
    expect(prepareConduitAction(state, owner, 'skill1', 25, false).skillPower).toBe(1);
  });

  it('twinpulse-bellows uses recipient capacity and Gauge percentage with formation ties', () => {
    const state = fixture('twinpulse-bellows', level), [owner, first, second] = state.allies;
    owner.shatter = 0; first.shatter = 50; second.shatter = 40;
    first.stats.shatterCapacity = 400;
    hit(state, 'light');
    expect(owner.shatter).toBe(Math.round(200 * benefit(.05, level)));
    expect(first.shatter).toBe(50 + Math.round(400 * benefit(.05, level)));
    expect(second.shatter).toBe(40);
  });

  it('wardglass-transformer boosts critical skills too, and enemy Shield break grants one Normal token', () => {
    const state = fixture('wardglass-transformer', level), [owner] = state.allies;
    nativeShield(state, owner, owner, 20, []);
    expect(conduitHitModifiers(state, owner, state.enemies[0],
      prepareConduitAction(state, owner, 'skill1', 25, false), true).criticalDamageBonus ?? 0).toBeCloseTo(benefit(.25, level));
    conduitIncoming(state, state.enemies[0], owner, 30, false, false, []);
    const skill = prepareConduitAction(state, owner, 'skill1', 25, false);
    expect(skill.criticalBonus).toBe(0);
    expect(prepareConduitAction(state, owner, 'light', 0, false).criticalBonus).toBeCloseTo(benefit(.2, level));
    expect(prepareConduitAction(state, owner, 'light', 0, false).criticalBonus).toBe(0);
  });

  it('execution-orrery is target-local critical chance below 50%, not obsolete execute damage', () => {
    const state = fixture('execution-orrery', level), [owner] = state.allies, target = state.enemies[0];
    target.hp = 4999;
    expect(conduitCriticalBonus(state, owner, target, 'skill1')).toBeCloseTo(benefit(.35, level));
    expect(conduitCriticalBonus(state, owner, target, 'light')).toBe(0);
    expect(conduitHitModifiers(state, owner, target, prepareConduitAction(state, owner, 'skill1', 25, false), false).bonus).toBe(0);
    target.hp = 5000;
    expect(conduitCriticalBonus(state, owner, target, 'skill1')).toBe(0);
  });

  it('granite-hourglass measures enemy HP loss, excluding Shields and redirected damage', () => {
    const state = fixture('granite-hourglass', level), [owner] = state.allies;
    nativeShield(state, owner, owner, 40, []);
    conduitIncoming(state, state.enemies[0], owner, 100, false, false, []);
    state.round++;
    conduitTurnStart(state, []);
    expect(owner.shield).toBe(Math.round(60 * benefit(.3, level)));
    state.round++;
    owner.shield = 0;
    conduitTurnStart(state, []);
    expect(owner.shield).toBe(0);
  });

  it('horizon-heartcase pays exactly 40 Gauge once and grants upgraded next-skill Power', () => {
    const state = fixture('horizon-heartcase', level), [owner] = state.allies;
    owner.hp = 10; owner.shatter = 40;
    conduitIncoming(state, state.enemies[0], owner, 100, false, false, []);
    expect(owner.hp).toBe(level === null ? 0 : 1);
    expect(gear(owner).numbers.rescueUsed ?? 0).toBe(level === null ? 0 : 1);
    expect(prepareConduitAction(state, owner, 'skill1', 25, false).skillPower).toBeCloseTo(1 + 4 * benefit(.05, level));
    expect(prepareConduitAction(state, owner, 'skill1', 25, false).skillPower).toBe(1);
  });

  it('judgment-lens boosts only skill critical multipliers', () => {
    const state = fixture('judgment-lens', level), [owner] = state.allies;
    expect(conduitHitModifiers(state, owner, state.enemies[0], prepareConduitAction(state, owner, 'skill1', 25, false), true)
      .criticalDamageBonus ?? 0).toBeCloseTo(benefit(.5, level));
    expect(conduitHitModifiers(state, owner, state.enemies[0], prepareConduitAction(state, owner, 'light', 0, false), true)
      .criticalDamageBonus ?? 0).toBe(0);
  });

  it('meridian-inverter grants each effectively healed ally percentage Gauge once per turn', () => {
    const state = fixture('meridian-inverter', level, ['sprout', 'ember', 'tide']), [owner, ally] = state.allies;
    ally.hp = 100; ally.shatter = 0;
    const ctx = prepareConduitAction(state, owner, 'ultimate', 100, false);
    nativeHeal(state, owner, ally, 10, [], true, ctx);
    nativeHeal(state, owner, ally, 10, [], true, ctx);
    expect(ally.shatter).toBe(Math.round(200 * benefit(.08, level)));
  });

  it('siege-cantilever boosts all-enemy damaging skills, not single-target skills', () => {
    const state = fixture('siege-cantilever', level), [owner] = state.allies;
    expect(prepareConduitAction(state, owner, 'skill2', 40, true).skillPower).toBeCloseTo(1 + benefit(.45, level));
    expect(prepareConduitAction(state, owner, 'skill1', 25, false).skillPower).toBe(1);
  });

  it('starvein-conductor pays once and boosts damage only, not Burn or healing in mixed skills', () => {
    const state = fixture('starvein-conductor', level), [owner] = state.allies;
    const ctx = prepareConduitAction(state, owner, 'skill1', 25, false);
    expect(owner.hp).toBe(level === null ? 1000 : 950);
    expect(ctx.skillPower).toBe(1);
    expect(conduitHitModifiers(state, owner, state.enemies[0], ctx, false).skillPowerBonus).toBeCloseTo(benefit(.6, level));
    expect(applyConduitBurn(state, owner, state.enemies[0], 25, ctx)).toBe(25);
    owner.hp = 50;
    expect(conduitHitModifiers(state, owner, state.enemies[0],
      prepareConduitAction(state, owner, 'skill1', 25, false), false).skillPowerBonus).toBe(0);
    expect(owner.hp).toBe(50);
  });

  it('stasis-reliquary treats the impacts of one attack as one threshold total', () => {
    const state = fixture('stasis-reliquary', level), [owner] = state.allies;
    const enemy = state.enemies[0];
    for (let i = 0; i < 3; i++) conduitIncoming(state, enemy, owner, 100, false, true, [], 'skill1');
    expect(1000 - owner.hp).toBeCloseTo(300 - 100 * benefit(.4, level));
  });

  it('verdict-caliper checks other living allies spent and boosts skills without banning critical hits', () => {
    const state = fixture('verdict-caliper', level), [owner, first, second] = state.allies;
    expect(prepareConduitAction(state, owner, 'skill1', 25, false).skillPower).toBe(1);
    first.spent = true; second.hp = 0;
    const ctx = prepareConduitAction(state, owner, 'skill1', 25, false);
    expect(ctx.skillPower).toBeCloseTo(1 + benefit(.45, level));
    expect(ctx.forbidden).toBe(false);
  });

  it('clearwater-manifold transfers the upgraded Shield fraction without creating a native layer', () => {
    const state = fixture('clearwater-manifold', level), [owner, first] = state.allies;
    owner.shield = 200; first.shatter = 0;
    hit(state, 'ultimate');
    const amount = Math.round(200 * benefit(.15, level));
    expect(first.shield).toBe(amount);
    expect(owner.shield).toBe(200 - amount);
    expect(first.conduitRuntime?.layers?.every(layer => !layer.native) ?? true).toBe(true);
    expireNativeShields(state, []);
    expect(first.shield).toBe(0);
  });

  it('infernic-cinder-testament accumulates allied skill Power additively, caps and retains it on refresh', () => {
    const state = fixture('infernic-cinder-testament', level), [owner, ally] = state.allies, target = state.enemies[0];
    const burn = () => {
      const damage = applyConduitBurn(state, owner, target, 100, prepareConduitAction(state, owner, 'skill1', 25, false));
      target.burn = { damage, turns: 3, sourceId: owner.id, origin: 'native' };
    };
    burn();
    for (let i = 0; i < 6; i++) {
      const ctx = prepareConduitAction(state, ally, 'skill1', 25, false);
      recordConduitHit(ctx, target, 1, false, 1);
      recordConduitHit(ctx, target, 1, false, 1);
      finishConduitAction(state, ally, ctx, []);
    }
    expect(conduitBurnTick(state, owner, target)).toBe(Math.round(100 * (1 + benefit(.6, level))));
    burn();
    expect(conduitBurnTick(state, owner, target)).toBe(Math.round(100 * (1 + benefit(.6, level))));
  });

  it('tidebound-reflector reflects source-owned absorption across recipients with a shared Enemy Turn cap', () => {
    const state = fixture('tidebound-reflector', level), [owner, first, second] = state.allies, enemy = state.enemies[0];
    nativeShield(state, owner, first, 500, []);
    nativeShield(state, owner, second, 500, []);
    const before = enemy.hp;
    conduitIncoming(state, enemy, first, 500, false, false, []);
    conduitIncoming(state, enemy, second, 500, false, false, []);
    expect(before - enemy.hp).toBe(Math.round(100 * benefit(1.5, level)));
  });

  it('tranquilitic-stillhour-carillon grants the recovery-turn heal/Gauge only during recovery', () => {
    const state = fixture('tranquilitic-stillhour-carillon', level), [owner, first] = state.allies;
    first.hp = 100; first.shatter = 0;
    owner.recoverThrough = state.round;
    conduitTurnStart(state, []);
    expect(first.hp).toBe(100 + Math.round(1000 * benefit(.08, level)));
    expect(first.shatter).toBe(Math.round(200 * benefit(.1, level)));
    owner.recoverThrough = 0;
    conduitTurnStart(state, []);
    expect(first.shatter).toBe(Math.round(200 * benefit(.1, level)));
  });

  it('voltaic-stormstep-dynamo boosts the switched skill and the next different caster, not an obsolete damage multiplier', () => {
    const state = fixture('voltaic-stormstep-dynamo', level), [owner, first, second] = state.allies;
    prepareConduitAction(state, owner, 'skill1', 25, false);
    const switched = prepareConduitAction(state, owner, 'skill2', 40, true);
    expect(switched.skillPower).toBeCloseTo(1 + benefit(.3, level));
    expect(switched.bonus).toBe(0);
    expect(conduitActionCost(first, 'skill1', state, 25)).toBe(Math.ceil(25 * (1 - benefit(.15, level))));
    prepareConduitAction(state, first, 'skill1', 25, false);
    expect(conduitActionCost(second, 'skill1', state, 25)).toBe(25);
    prepareConduitAction(state, owner, 'light', 0, false);
    expect(prepareConduitAction(state, owner, 'skill1', 25, false).skillPower).toBe(1);
  });

  it('rootbound-triage-vault selects the most injured and expires after any next action', () => {
    const state = fixture('rootbound-triage-vault', level), [, first, second] = state.allies;
    first.hp = 100; second.hp = 500;
    conduitTurnStart(state, []);
    expect(conduitActionCost(first, 'skill1', state, 25)).toBe(Math.ceil(25 * (1 - benefit(.25, level))));
    const ctx = prepareConduitAction(state, first, 'skill2', 40, false);
    expect(ctx.skillPower).toBe(1);
    expect(ctx.supportPowerBonus ?? 0).toBeCloseTo(benefit(.35, level));
    expect(prepareConduitAction(state, second, 'skill2', 40, false).supportPowerBonus ?? 0).toBe(0);
    conduitTurnStart(state, []);
    finishConduitAction(state, first, prepareConduitAction(state, first, 'light', 0, false), []);
    expect(conduitActionCost(first, 'skill1', state, 25)).toBe(25);
    const owner = state.allies[0], before = owner.shatter;
    first.hp = 1;
    const healing = prepareConduitAction(state, owner, 'skill1', 25, false);
    healing.healed = 100;
    finishNativeHealing(state, owner, healing, []);
    expect(owner.shatter).toBe(before);
    expect(first.hp).toBe(1);
  });
});
