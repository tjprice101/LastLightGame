import { describe, expect, it, vi } from 'vitest';
import type { ConduitId } from '../content/conduits';
import type { ActionId } from '../content/combat';
import type { StarterId } from '../content/starters';
import { act, createBattle, type BattleState, type BattleEvent } from './battle';
import { applyConduitBuffs } from '../content/combat';
import {
  applyConduitBurn, conduitActionCost, conduitBurnTick, conduitCriticalBonus,
  conduitHitModifiers, conduitIncoming, conduitTurnStart, expireNativeShields,
  effectiveDefense, finishConduitAction, finishNativeHealing, gear, initializeConduits, nativeHeal, nativeShield, prepareConduitAction, recordConduitHit, refreshConduitStats,
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
  it('nullsong-transmission rolls one cast bonus without altering Normal Attack or static Power', () => {
    const state = fixture('nullsong-transmission', level), [owner] = state.allies;
    applyConduitBuffs(owner.stats, owner.conduits, state.conduitUpgrades);
    expect(owner.stats.skillPower).toBe(1);
    const ctx = prepareConduitAction(state, owner, 'light', 0, false);
    expect(conduitHitModifiers(state, owner, state.enemies[0], ctx, false).attack)
      .toBe(100);
    const result = act(state, owner.id, 'light', state.enemies[0].id);
    expect(result.events.find(event => event.kind === 'damage' && event.source === owner.id)?.amount)
      .toBe(100);
    expect(prepareConduitAction(state, owner, 'skill1', 25, false).skillPower).toBeCloseTo(1 + benefit(.75, level));
  });
  it('aegis-capacitor grants permanent Health and Defense, not a Shield-triggered aura', () => {
    const state = fixture('aegis-capacitor', level), [owner, ally] = state.allies;
    applyConduitBuffs(owner.stats, owner.conduits, state.conduitUpgrades);
    nativeShield(state, owner, owner, 100, [], { skillPower: 1 });
    expect(effectiveDefense(state, owner)).toBeCloseTo(100 * (1 + benefit(.75, level)));
    nativeShield(state, owner, ally, 100, [], { skillPower: 1 });
    expect(effectiveDefense(state, owner)).toBeCloseTo(100 * (1 + benefit(.75, level)));
    nativeShield(state, owner, ally, 100, [], { skillPower: 1 });
    expect(effectiveDefense(state, owner)).toBeCloseTo(100 * (1 + benefit(.75, level)));
    state.round++;
    expect(effectiveDefense(state, owner)).toBeCloseTo(100 * (1 + benefit(.75, level)));
    expect(owner.stats.health).toBeCloseTo(1000 * (1 + benefit(.75, level)));
  });

  it('citadel-spine protects only other living allies strictly below 75% Health', () => {
    const state = fixture('citadel-spine', level), [owner, ally] = state.allies;
    ally.hp = 749;
    expect(effectiveDefense(state, ally)).toBeCloseTo(100 * (1 + benefit(.35, level)));
    ally.hp = 750;
    expect(effectiveDefense(state, ally)).toBe(100);
    owner.hp = 0; ally.hp = 499;
    expect(effectiveDefense(state, ally)).toBe(100);
  });

  it('immortal-vessel grants its new stats without forwarding incoming heals', () => {
    const state = fixture('immortal-vessel', level), [owner, healer, third] = state.allies;
    applyConduitBuffs(owner.stats, owner.conduits, state.conduitUpgrades);
    expect(owner.stats.health).toBeCloseTo(1000 * (1 + benefit(2.5, level)));
    expect(owner.stats.defense).toBeCloseTo(100 * (1 + benefit(.75, level)));
    owner.hp = third.hp = 100;
    const ctx = prepareConduitAction(state, healer, 'ultimate', 100, false);
    nativeHeal(state, healer, owner, 100, [], true, ctx);
    expect(third.hp).toBe(100);
    nativeHeal(state, healer, owner, 100, [], true, ctx);
    nativeHeal(state, healer, owner, 100, [], true, ctx);
    nativeHeal(state, healer, owner, 100, [], true, ctx);
    expect(third.hp).toBe(100);
  });

  it('sentinel-aperture boosts only Skill 1 and no longer grants held-Gauge Defense', () => {
    const state = fixture('sentinel-aperture', level), [owner] = state.allies;
    owner.shatter = 39;
    expect(effectiveDefense(state, owner)).toBe(100);
    expect(prepareConduitAction(state, owner, 'skill1', 25, false).skillPower).toBeCloseTo(1 + benefit(.99, level));
    expect(prepareConduitAction(state, owner, 'skill2', 40, true).skillPower).toBe(1);
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
    const health = 1000 * (1 + benefit(.55, level));
    expect(owner.hp).toBe(Math.round(health * benefit(.35, level)));
    expect(owner.shatter).toBe(level === null ? 110 : 0);
    expect(ally.shield).toBe(Math.round(health * benefit(.15, level)));
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
    const shield = Math.round(1000 * (1 + benefit(.55, level)) * benefit(.1, level));
    expect(state.allies.map(ally => ally.shield)).toEqual(Array(3).fill(shield));
    expireNativeShields(state, []);
    expect(state.allies[1].shield).toBe(shield);
    state.round++;
    expireNativeShields(state, []);
    expect(state.allies[1].shield).toBe(0);
  });

  it('worldbreaker-drive changes Last Flare Power only, not other skills or a retired AoE override', () => {
    const state = fixture('worldbreaker-drive', level), [owner] = state.allies;
    expect(prepareConduitAction(state, owner, 'ultimate', 100, true).skillPower).toBeCloseTo(1 + benefit(.99, level));
    expect(prepareConduitAction(state, owner, 'skill1', 25, false).skillPower).toBe(1);
    for (const action of ['light', 'skill1', 'skill2', 'ultimate'] as const)
      expect(prepareConduitAction(state, owner, action, 0, false).bonus).toBeCloseTo(benefit(.65, level));
  });

  it('calamitic-cathedral-final-equation buffs its bearer only, without the retired squad aura', () => {
    const state = fixture('calamitic-cathedral-final-equation', level), [owner, ally, third] = state.allies;
    third.conduits = owner.conduits ? [...owner.conduits] : undefined;
    const ctx = prepareConduitAction(state, owner, 'skill1', 25, false);
    expect(ctx.criticalBonus).toBeCloseTo(benefit(2.5, level));
    expect(ctx.criticalDamageBonus).toBeCloseTo(benefit(1.2, level));
    expect(prepareConduitAction(state, ally, 'skill1', 25, false).skillPower).toBe(1);
    expect(conduitActionCost(ally, 'skill1', state, 100)).toBe(100);
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

  it('calamitic-causality-funeral-engine grants Efficiency and Last Flare damage without free actions', () => {
    const state = fixture('calamitic-causality-funeral-engine', level), [owner] = state.allies;
    applyConduitBuffs(owner.stats, owner.conduits, state.conduitUpgrades);
    const ctx = prepareConduitAction(state, owner, 'ultimate', 100, true);
    expect(ctx.skillPower).toBe(1);
    expect(ctx.bonus).toBeCloseTo(benefit(1.25, level));
    expect(conduitActionCost(owner, 'ultimate', state, 100)).toBe(level === null ? 100 : 70);
    const result = act(state, owner.id, 'ultimate', state.enemies[0].id).state;
    expect(result.allies[0].recoverThrough).toBe(level === null ? 2 : 0);
    expect(result.allies[0].spent).toBe(true);
  });

  it('calamitic-world-eater-orrery boosts debuff skills and duration without the retired healing', () => {
    const state = fixture('calamitic-world-eater-orrery', level), [owner, ally, third] = state.allies;
    ally.hp = 100; third.hp = 0;
    hit(state, 'skill1', 40, false, 100);
    expect(ally.hp).toBe(100);
    hit(state, 'skill2', 40, false, 100);
    expect(ally.hp).toBe(100);
    hit(state, 'light', 100);
    expect(ally.hp).toBe(100);
    applyConduitBuffs(owner.stats, owner.conduits, state.conduitUpgrades);
    const ctx = prepareConduitAction(state, owner, 'skill1', 25, false);
    expect(ctx.skillPower).toBe(1);
    expect(ctx.debuffPowerBonus ?? 0).toBeCloseTo(benefit(1.25, level));
    expect(applyConduitBurn(state, owner, state.enemies[0], 100, ctx)).toBe(Math.round(100 * (1 + benefit(1.25, level))));
    expect(ctx.skillDuration).toBe(level === null ? 0 : 3);
    expect(third.hp).toBe(0);
    expect(owner.hp).toBe(1000);
  });
  it('breach-pendulum reduces starting Defense once, without a Normal critical bonus', () => {
    const state = fixture('breach-pendulum', level);
    const [owner] = state.allies, enemy = state.enemies[0];
    const normal = prepareConduitAction(state, owner, 'light', 0, false);
    expect(conduitHitModifiers(state, owner, enemy, normal, true).criticalDamageBonus ?? 0).toBe(0);
    enemy.stats.defense = 100;
    delete gear(enemy).numbers.breachApplied;
    initializeConduits(state);
    initializeConduits(state);
    expect(enemy.stats.defense).toBeCloseTo(100 * (1 - benefit(.1, level)));
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

  it('falcon-sight grants static stats without a guaranteed critical sequence', () => {
    const state = fixture('falcon-sight', level);
    const [owner] = state.allies;
    hit(state, 'light');
    hit(state, 'skill1');
    const ctx = prepareConduitAction(state, owner, 'light', 0, false);
    expect(ctx.guaranteed).toBe(false);
    expect(ctx.criticalDamageBonus).toBe(0);
    applyConduitBuffs(owner.stats, owner.conduits, state.conduitUpgrades);
    expect(owner.stats.crit).toBeCloseTo(benefit(.25, level));
    expect(owner.stats.health).toBeCloseTo(1000 * (1 + benefit(.45, level)));
    recordConduitHit(ctx, state.enemies[0], 100, true, 1.5);
    recordConduitHit(ctx, state.enemies[1], 100, true, 1.5);
    finishConduitAction(state, owner, ctx, []);
    expect(prepareConduitAction(state, owner, 'light', 0, false).guaranteed).toBe(false);
  });

  it('glassroot-gimbal converts maximum Health to Power regardless of Shield, not Normal damage', () => {
    const state = fixture('glassroot-gimbal', level), owner = state.allies[0];
    applyConduitBuffs(owner.stats, owner.conduits, state.conduitUpgrades);
    expect(prepareConduitAction(state, owner, 'skill1', 25, false).skillPower).toBeCloseTo(1 + 5 * benefit(.05, level));
    expect(prepareConduitAction(state, owner, 'light', 0, false).skillPower).toBe(1);
    owner.shield = 1;
    expect(prepareConduitAction(state, owner, 'skill1', 25, false).skillPower).toBeCloseTo(1 + 5 * benefit(.05, level));
  });

  it('lifeline-flywheel counts actual HP plus Shield damage, not overkill', () => {
    const state = fixture('lifeline-flywheel', level), owner = state.allies[0];
    owner.hp = 100;
    hit(state, 'light', 40, false, 100, 500);
    expect(owner.hp).toBe(100 + Math.round(100 * benefit(.1, level)));
  });

  it('opal-indexer only boosts actual native debuff skills', () => {
    const state = fixture('opal-indexer', level), owner = state.allies[0];
    expect(prepareConduitAction(state, owner, 'skill1', 25, false).skillPower).toBeCloseTo(1 + benefit(.75, level));
    expect(prepareConduitAction(state, owner, 'skill1', 25, false).skillDuration).toBe(level === null ? 0 : 1);
    expect(prepareConduitAction(state, owner, 'skill2', 40, true).skillPower).toBe(1);
  });

  it('resonance-crucible grants stats/duration without retired overkill strikes', () => {
    const state = fixture('resonance-crucible', level), target = state.enemies[1];
    const before = target.hp;
    const { events } = hit(state, 'skill1', 1, false, 1, 80);
    expect(before - target.hp).toBe(0);
    const owner = state.allies[0];
    applyConduitBuffs(owner.stats, owner.conduits, state.conduitUpgrades);
    expect(owner.stats.health).toBeCloseTo(1000 * (1 + benefit(.5, level)));
    expect(owner.stats.defense).toBeCloseTo(100 * (1 + benefit(.75, level)));
    expect(owner.stats.skillDuration).toBe(level === null ? 0 : 1);
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
    expect(owner.shatter).toBe(Math.round(200 * benefit(.07, level)));
    expect(first.shatter).toBe(50 + Math.round(400 * benefit(.07, level)));
    expect(second.shatter).toBe(40);
  });

  it('wardglass-transformer grants unconditional critical multiplier with fixed Defense penalty and no break token', () => {
    const state = fixture('wardglass-transformer', level), [owner] = state.allies;
    nativeShield(state, owner, owner, 20, []);
    expect(conduitHitModifiers(state, owner, state.enemies[0],
      prepareConduitAction(state, owner, 'skill1', 25, false), true).criticalDamageBonus ?? 0).toBe(0);
    conduitIncoming(state, state.enemies[0], owner, 30, false, false, []);
    const skill = prepareConduitAction(state, owner, 'skill1', 25, false);
    expect(skill.criticalBonus).toBe(0);
    expect(prepareConduitAction(state, owner, 'light', 0, false).criticalBonus).toBe(0);
    expect(prepareConduitAction(state, owner, 'light', 0, false).criticalBonus).toBe(0);
    applyConduitBuffs(owner.stats, owner.conduits, state.conduitUpgrades);
    expect(owner.stats.critMultiplier).toBeCloseTo(1.5 * (1 + benefit(.35, level)));
    expect(owner.stats.defense).toBeCloseTo(level === null ? 100 : 65);
  });

  it('execution-orrery boosts Skill 2 Power and Efficiency, without a target Health predicate', () => {
    const state = fixture('execution-orrery', level), [owner] = state.allies, target = state.enemies[0];
    target.hp = 4999;
    expect(conduitCriticalBonus(state, owner, target, 'skill1')).toBe(0);
    expect(prepareConduitAction(state, owner, 'skill2', 40, true).skillPower).toBeCloseTo(1 + benefit(.99, level));
    expect(conduitActionCost(owner, 'skill2', state, 40)).toBe(Math.ceil(40 * (1 - benefit(.1, level))));
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

  it('horizon-heartcase conditionally grants Health/Defense, never its retired rescue', () => {
    const state = fixture('horizon-heartcase', level), [owner] = state.allies;
    owner.shatter = 40;
    refreshConduitStats(state);
    expect(owner.stats.health).toBeCloseTo(1000 * (1 + benefit(.2, level)));
    expect(effectiveDefense(state, owner)).toBeCloseTo(100 * (1 + benefit(.1, level)));
    owner.shatter = 100;
    owner.spent = true;
    refreshConduitStats(state);
    expect(owner.stats.health).toBe(1000);
    const ctx = prepareConduitAction(state, owner, 'ultimate', 100, true);
    expect(ctx.criticalBonus).toBeCloseTo(benefit(.1, level));
    expect(ctx.criticalDamageBonus).toBeCloseTo(benefit(.35, level));
    owner.hp = 10;
    conduitIncoming(state, state.enemies[0], owner, 100, false, false, []);
    expect(owner.hp).toBe(0);
    expect(gear(owner).numbers.rescueUsed ?? 0).toBe(0);
    expect(prepareConduitAction(state, owner, 'skill1', 25, false).skillPower).toBe(1);
  });

  it('judgment-lens boosts only skill critical multipliers', () => {
    const state = fixture('judgment-lens', level), [owner] = state.allies;
    expect(conduitHitModifiers(state, owner, state.enemies[0], prepareConduitAction(state, owner, 'skill1', 25, false), true)
      .criticalDamageBonus ?? 0).toBeCloseTo(benefit(.5, level));
    expect(conduitHitModifiers(state, owner, state.enemies[0], prepareConduitAction(state, owner, 'light', 0, false), true)
      .criticalDamageBonus ?? 0).toBe(0);
  });

  it('meridian-inverter grants each effectively healed ally percentage Gauge once per cast', () => {
    const state = fixture('meridian-inverter', level, ['sprout', 'ember', 'tide']), [owner, ally] = state.allies;
    ally.hp = 100; ally.shatter = 0;
    const ctx = prepareConduitAction(state, owner, 'ultimate', 100, false);
    nativeHeal(state, owner, ally, 10, [], true, ctx);
    nativeHeal(state, owner, ally, 10, [], true, ctx);
    expect(ally.shatter).toBe(Math.round(200 * benefit(.04, level)));
    nativeHeal(state, owner, ally, 10, [], true, prepareConduitAction(state, owner, 'skill2', 40, false));
    expect(ally.shatter).toBe(2 * Math.round(200 * benefit(.04, level)));
  });

  it('siege-cantilever boosts all-enemy damaging skills, not single-target skills', () => {
    const state = fixture('siege-cantilever', level), [owner] = state.allies;
    expect(prepareConduitAction(state, owner, 'skill2', 40, true).skillPower).toBeCloseTo(1 + benefit(1.5, level));
    expect(prepareConduitAction(state, owner, 'skill1', 25, false).skillPower).toBe(1);
  });

  it('starvein-conductor rewards a diverse frozen Squad without spending Health or adding Skill Power', () => {
    const state = fixture('starvein-conductor', level), [owner] = state.allies;
    const ctx = prepareConduitAction(state, owner, 'skill1', 25, false);
    expect(owner.hp).toBe(1000);
    expect(ctx.skillPower).toBe(1);
    expect(conduitHitModifiers(state, owner, state.enemies[0], ctx, false).skillPowerBonus).toBe(0);
    expect(conduitActionCost(owner, 'skill1', state, 100)).toBe(Math.ceil(100 * (1 - Math.min(.5, benefit(.35, level)))));
    expect(applyConduitBurn(state, owner, state.enemies[0], 25, ctx)).toBe(25);
    owner.hp = 50;
    expect(conduitHitModifiers(state, owner, state.enemies[0],
      prepareConduitAction(state, owner, 'skill1', 25, false), false).skillPowerBonus).toBe(0);
    expect(owner.hp).toBe(50);
    state.allies[1].element = owner.element;
    expect(conduitActionCost(owner, 'skill1', state, 100)).toBe(100);
  });

  it('stasis-reliquary blocks Shield-break spillover and subsequent hits, then applies one penalty turn', () => {
    const state = fixture('stasis-reliquary', level), [owner] = state.allies;
    const enemy = state.enemies[0];
    owner.shield = 50;
    for (let i = 0; i < 3; i++) conduitIncoming(state, enemy, owner, 100, false, true, [], 'skill1');
    expect(owner.hp).toBe(level === null ? 750 : 1000);
    state.round++;
    owner.shield = 50;
    conduitIncoming(state, enemy, owner, 100, false, true, [], 'skill1');
    expect(owner.hp).toBe(level === null ? 700 : 925);
    state.round++;
    owner.shield = 50;
    conduitIncoming(state, enemy, owner, 100, false, true, [], 'skill1');
    expect(owner.hp).toBe(level === null ? 650 : 925);
  });

  it('verdict-caliper heals once per critical Attack Action without requiring other allies to act', () => {
    const state = fixture('verdict-caliper', level), [owner, first, second] = state.allies;
    expect(prepareConduitAction(state, owner, 'skill1', 25, false).skillPower).toBe(1);
    first.spent = true; second.hp = 0;
    const ctx = prepareConduitAction(state, owner, 'skill1', 25, false);
    expect(ctx.skillPower).toBe(1);
    expect(ctx.forbidden).toBe(false);
    owner.hp = 100;
    for (const target of state.enemies) recordConduitHit(ctx, target, 10, true, 1.5);
    finishConduitAction(state, owner, ctx, []);
    expect(owner.hp).toBe(100 + Math.round(1000 * benefit(.25, level)));
  });

  it('clearwater-manifold counts other Oceanic Squad Members even when defeated, without transferring Shields', () => {
    const state = fixture('clearwater-manifold', level), [owner, first] = state.allies;
    first.element = 'oceanic';
    owner.shield = 200; first.shatter = 0;
    expect(prepareConduitAction(state, owner, 'skill1', 25, false).skillPower).toBeCloseTo(1 + benefit(.35, level));
    first.hp = 0;
    expect(prepareConduitAction(state, owner, 'skill1', 25, false).skillPower).toBeCloseTo(1 + benefit(.35, level));
    hit(state, 'ultimate');
    expect(first.shield).toBe(0);
    expect(owner.shield).toBe(200);
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
