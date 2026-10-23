import { describe, expect, it, vi } from 'vitest';
import type { ConduitId } from '../content/conduits';
import { isMasterConduitId, type MasterConduitId } from '../content/master-conduits';
import type { StarterId } from '../content/starters';
import { act, actionUnavailable, combatantCanAct, teamCanAct, createBattle, damageAmount, type BattleState, type BattleEvent } from './battle';
import { nativeBalance } from '../content/native-balance';
import {
  afterConduitBurn, conduitActionCost, conduitCriticalBonus, conduitDeaths, conduitHitModifiers,
  conduitIncoming, effectiveDefense, expireNativeShields, finishConduitAction, gear, generatedHeal,
  generatedShield, initializeConduits, nativeGauge, nativeHeal, nativeShield, prepareConduitAction,
  recordConduitHit, applyConduitWeaken,
} from './conduit-runtime';
import {
  afterCalamiticAction, bankCalamiticDamage, calamiticExtraActionAvailable, deferCalamiticDamage,
  prepareCalamiticAction, settleCalamiticDebt,
} from './calamitic-conduits';
import { nativeInstructionDamage, nativeSupportMultiplier, nativeTurnStart } from './native-kits';

vi.mock('../content/phase-zero-stats', async original => ({
  ...await original<typeof import('../content/phase-zero-stats')>(),
  phaseZeroStatsReady: true,
}));

function fixture(id?: ConduitId | MasterConduitId, level = 0, roster: StarterId[] = ['ember', 'tide', 'sprout']): BattleState {
  const state = createBattle(1729, roster);
  for (const unit of [...state.allies, ...state.enemies]) {
    unit.stats = { ...unit.stats, health: 1000, defense: 100, damage: 100, crit: 0,
      critMultiplier: 1.5, shatterCapacity: 200, skillPower: 1, skillDuration: 0, skillEfficiency: 0, gaugeGain: 1 };
    unit.hp = 1000;
    unit.shatter = 100;
  }
  for (const enemy of state.enemies) {
    enemy.stats.health = 10000;
    enemy.hp = 10000;
    enemy.stats.defense = 0;
  }
  if (isMasterConduitId(id)) state.allies[0].masterConduit = id;
  else if (id) {
    state.allies[0].conduits = [id, null, null, null, null, null, null, null];
    state.conduitUpgrades = { [id]: level };
  }
  initializeConduits(state);
  return state;
}

const variants = [null, 0, 1, 2, 3, 4, 5] as const;
const scaling = (base: number, level: typeof variants[number]) => level === null ? 0 : base * (1 + level * .1);
function setup(id: ConduitId, level: typeof variants[number], roster?: StarterId[]) {
  return fixture(level === null ? undefined : id, level ?? 0, roster);
}
function finishHit(state: BattleState, action: 'light' | 'skill1' | 'skill2' | 'ultimate',
  critical = false, damage = 100, all = false): BattleEvent[] {
  const ctx = prepareConduitAction(state, state.allies[0], action, 25, all);
  for (const target of all ? state.enemies : [state.enemies[0]])
    recordConduitHit(ctx, target, damage, critical, 1.5, 0, damage);
  const events: BattleEvent[] = [];
  finishConduitAction(state, state.allies[0], ctx, events);
  return events;
}

describe('Phase 0 Master token lifetimes', () => {
  const attacks: {
    id: MasterConduitId; owner: StarterId; action: 'light' | 'skill1' | 'skill2' | 'ultimate';
    rate: number; multiplier: number; setup?: (state: BattleState) => void;
  }[] = [
    { id: 'master-vaelor-3', owner: 'vaelor', action: 'light', rate: .25, multiplier: 0,
      setup: state => { state.allies[0].native = { beat: 0 }; } },
    { id: 'master-razor-3', owner: 'razor', action: 'skill1', rate: .3, multiplier: 0,
      setup: state => { state.allies[0].native = { wounds: 40 }; } },
    { id: 'master-elise-3', owner: 'elise', action: 'skill2', rate: .15, multiplier: .4,
      setup: state => { state.allies[0].native = { blades: [state.enemies[0].id, state.enemies[0].id] }; } },
    { id: 'master-bliss-2', owner: 'bliss', action: 'skill1', rate: .25, multiplier: 0 },
    { id: 'master-crinso-1', owner: 'crinso', action: 'ultimate', rate: 0, multiplier: .6,
      setup: state => { state.allies[0].native = { combo: 4 }; } },
  ];
  for (const entry of attacks) describe(entry.id, () => {
    it.each([false, true])('checks equipped=%s, consumption and expiry through actual native actions', equipped => {
      const state = fixture(equipped ? entry.id : undefined, 0, [entry.owner, 'ember', 'tide']);
      entry.setup?.(state);
      const granted = act(state, state.allies[0].id, entry.action, state.enemies[0].id);
      expect(granted.state.allies[0].spent).toBe(true);
      for (const round of [1, 2, 3]) {
        const current = structuredClone(granted.state);
        current.round = round;
        const target = current.allies[2];
        const active = equipped && round <= 2;
        prepareConduitAction(current, target, 'skill2', 40, false);
        const ctx = prepareConduitAction(current, target, 'light', 0, false);
        expect(ctx.criticalBonus).toBeCloseTo(active ? entry.rate : 0);
        expect(ctx.criticalDamageBonus).toBeCloseTo(active ? entry.multiplier : 0);
        const spent = prepareConduitAction(current, target, 'light', 0, false);
        expect(spent.criticalBonus).toBe(0);
        expect(spent.criticalDamageBonus).toBe(0);
      }
    });

    describe.each([1, 1.5])('Phase 0 native support snapshots at %s Skill Power', power => {
      it.each([0, 2])('scales timed native support with +%s Duration without extending delayed payout clocks', duration => {
        const cast = (id: StarterId, action: 'skill1' | 'skill2' | 'ultimate', master?: MasterConduitId) => {
          const state = fixture(master, 0, [id, 'ember', 'tide']);
          const owner = state.allies[0];
          owner.stats.skillPower = power;
          owner.stats.skillDuration = duration;
          owner.native = { beat: 1 };
          return act(state, owner.id, action,
            id === 'bruno' || id === 'disciple' ? state.allies[2].id : state.enemies[0].id).state;
        };
        const bliss = cast('bliss', 'skill2');
        expect(bliss.allies[1].attackBoost?.fraction).toBeCloseTo(.1 * power);
        expect(bliss.allies[1].attackBoost?.throughRound).toBe(1 + duration);
        const bruno = cast('bruno', 'skill2', 'master-bruno-3');
        expect(bruno.allies[0].native?.cover?.fraction).toBeCloseTo(.5 * power);
        expect(bruno.allies[0].native?.cover?.throughPhase).toBe(1 + duration);
        const disciple = cast('disciple', 'skill2', 'master-disciple-1');
        expect(disciple.allies[2].native?.instruction?.throughRound).toBe(4 + duration);
        expect(nativeSupportMultiplier(disciple, disciple.allies[2])).toBeCloseTo(1 + .35 * power);
        expect(prepareConduitAction(disciple, disciple.allies[2], 'skill1', 25, false).skillPower).toBe(1);
        const aurora = cast('aurora', 'skill1');
        expect(aurora.allies[0].native?.seals?.[aurora.enemies[0].id]?.fraction).toBeCloseTo(.4 * power);
        expect(aurora.allies[0].native?.seals?.[aurora.enemies[0].id]?.throughPhase).toBe(3 + duration);
        const ward = cast('aurora', 'ultimate');
        expect(ward.allies[0].native?.ultimateWardThrough).toBe(2 + duration);
        expect(ward.allies[0].native?.ultimateWardReduction).toBeCloseTo(.75 * power);
        const orvella = cast('orvella', 'skill2', 'master-orvella-1');
        expect(orvella.allies[0].native?.foundation?.durability).toBeCloseTo(300 * power);
        expect(orvella.allies[0].native?.foundation?.throughPhase).toBe(3 + duration);
        expect(orvella.allies.map(ally => ally.shield)).toEqual([0, 0, 0]);
        const vaelor = cast('vaelor', 'skill2', 'master-vaelor-2');
        expect(vaelor.allies[0].attackBoost?.fraction).toBeCloseTo(.2 * power);
        expect(vaelor.allies[0].attackBoost?.throughRound).toBe(2 + duration);
        const razor = cast('razor', 'skill2');
        expect(razor.allies[0].native?.bastion?.throughPhase).toBe(1);
        const flora = cast('sprout', 'ultimate');
        expect(flora.allies[0].native?.seeds?.[flora.allies[1].id]?.dueRound).toBe(2);
      });
    });

    describe('Phase 0 native Instruction and mitigation integration', () => {
      it('Shelter scales only healing and Shields in a mixed skill, once and additively', () => {
        const state = fixture(undefined, 0, ['bliss', 'tide', 'disciple']);
        const [bliss, recipient, disciple] = state.allies;
        bliss.stats.skillPower = 1.5;
        bliss.native = { instruction: { kind: 'shelter', owner: disciple.id, throughRound: 3, supportBonus: .35 } };
        recipient.hp = 100;
        recipient.spent = true;
        disciple.spent = true;
        const baseline = structuredClone(state);
        delete baseline.allies[0].native;
        const result = act(state, bliss.id, 'skill1', state.enemies[0].id);
        const ordinary = act(baseline, bliss.id, 'skill1', baseline.enemies[0].id);
        expect(result.state.enemies[0].hp).toBe(ordinary.state.enemies[0].hp);
        expect(result.state.allies[1].hp - 100).toBeCloseTo(60 * (1.5 + .35));
        expect(result.state.allies[0].native?.instruction).toBeUndefined();
      });

      it.each([false, true])('only Unbound Mindcrown retains a mismatched Instruction, equipped=%s', master => {
        const state = fixture(master ? 'master-disciple-1' : undefined, 0, ['disciple', 'ember', 'tide']);
        const [disciple, recipient] = state.allies;
        recipient.native = { instruction: { kind: 'shelter', owner: disciple.id, throughRound: 3 } };
        const result = act(state, recipient.id, 'light', state.enemies[0].id).state;
        expect(!!result.allies[1].native?.instruction).toBe(master);
      });

      it('Sovereign Will grants Normal Attack critical bonuses only from an active matching Instruction', () => {
        const state = fixture('master-disciple-3', 0, ['disciple', 'ember', 'tide']);
        const [disciple, recipient] = state.allies;
        recipient.native = { instruction: { kind: 'strike', owner: disciple.id, throughRound: 2, damageBonus: .45 } };
        expect(nativeInstructionDamage(state, recipient)).toBeCloseTo(1.45);
        const active = prepareConduitAction(state, recipient, 'light', 0, false);
        expect(active.criticalBonus).toBe(.3);
        expect(active.criticalDamageBonus).toBe(.4);
        state.round = 3;
        const expired = prepareConduitAction(state, recipient, 'light', 0, false);
        expect(expired.criticalBonus).toBe(0);
        expect(expired.criticalDamageBonus).toBe(0);
      });

      it('stacked non-Defense mitigation retains the approved 20% damage floor', () => {
        const state = fixture(undefined, 0, ['aurora', 'razor', 'ember']);
        const [aurora, razor] = state.allies;
        aurora.native = { ultimateWardThrough: 2, ultimateWardReduction: .8 };
        razor.native = { bastion: { throughPhase: 1, loss: 0, skillPower: 2 } };
        conduitIncoming(state, state.enemies[0], razor, 100, false, true, [], 'ultimate');
        expect(razor.hp).toBe(980);
      });
    });
  });

  it('does not accumulate Crinso critical tokens across separate Last Flares', () => {
    const state = fixture('master-crinso-1', 0, ['crinso', 'ember', 'tide']);
    state.allies[0].native = { combo: 2 };
    const first = act(state, state.allies[0].id, 'ultimate', state.enemies[0].id).state;
    first.allies[0].spent = false;
    first.allies[0].recoverThrough = 0;
    first.allies[0].shatter = 100;
    first.allies[0].native = { combo: 2 };
    const second = act(first, first.allies[0].id, 'ultimate', first.enemies[0].id);
    expect(second.state.allies[0].spent).toBe(true);
    expect(prepareConduitAction(second.state, second.state.allies[1], 'light', 0, false).criticalDamageBonus).toBeCloseTo(.3);
  });

  it('expires Flora Seed skill bonuses two player turns after maturity without consuming them in previews', () => {
    const state = fixture('master-sprout-1', 0, ['sprout', 'ember', 'tide']);
    state.allies[0].native = { seeds: { [state.allies[1].id]: {
      fraction: .1, dueRound: 2, empowered: true,
    } } };
    state.round = 2;
    nativeTurnStart(state, []);
    for (const round of [2, 3, 4]) {
      const current = structuredClone(state);
      current.round = round;
      const target = current.allies[1];
      const before = structuredClone(current);
      expect(conduitActionCost(target, 'skill1', current, 25)).toBe(round <= 3 ? 22 : 25);
      expect(current).toEqual(before);
      prepareConduitAction(current, target, 'light', 0, false);
      const ctx = prepareConduitAction(current, target, 'skill1', 25, false);
      expect(ctx.skillPower).toBe(round <= 3 ? 1.25 : 1);
      expect(conduitActionCost(target, 'skill1', current, 25)).toBe(25);
      expect(prepareConduitAction(current, target, 'skill1', 25, false).skillPower).toBe(1);
    }
  });

  it('Orvella absorption-healing Master does not immediately drain Foundation on Skill 2', () => {
    for (const equipped of [false, true]) {
      const state = fixture(equipped ? 'master-orvella-2' : undefined, 0, ['orvella', 'ember', 'tide']);
      for (const ally of state.allies) ally.hp = 500;
      const result = act(state, state.allies[0].id, 'skill2', state.enemies[0].id);
      expect(result.state.allies.map(ally => ally.hp)).toEqual([500, 500, 500]);
      expect(result.state.allies[0].native?.foundation?.durability).toBe(300);
      expect(result.events.filter(event => event.kind === 'heal')).toEqual([]);
    }
  });
});

describe.each(variants)('Phase 0 replacement effects: absent/+%s', level => {
  it('Firstlight adds upgraded Gauge Gain once to existing Gain and expires after turn two', () => {
    const state = setup('firstlight-cam', level);
    const target = state.allies[1];
    target.stats.gaugeGain = 1.2;
    target.shatter = 0;
    nativeGauge(state, target, 20, []);
    expect(target.shatter).toBe(Math.round(20 * (1.2 + scaling(.5, level))));
    expect(effectiveDefense(state, target)).toBeCloseTo(100 * (1 + scaling(.4, level)));
    state.round = 3;
    target.shatter = 0;
    nativeGauge(state, target, 20, []);
    expect(target.shatter).toBe(24);
    expect(effectiveDefense(state, target)).toBe(100);
  });

  it('Pale protects only its wearer Shields without the retired outgoing Power aura', () => {
    const state = setup('pale-bulwark-diadem', level);
    const [owner, target] = state.allies;
    nativeShield(state, owner, target, 100, [], { skillPower: 1 });
    expect(prepareConduitAction(state, target, 'skill1', 25, false).skillPower)
      .toBe(1);
    expect(prepareConduitAction(state, target, 'skill2', 40, false).skillPower).toBe(1);
    target.shield = 0;
    expect(prepareConduitAction(state, target, 'skill1', 25, false).skillPower).toBe(1);
    owner.shield = 100;
    conduitIncoming(state, state.enemies[0], owner, 150, false, false, []);
    const reduction = scaling(.5, level);
    expect(owner.hp).toBe(1000 - Math.round(Math.max(0, 150 - 100 / (1 - reduction))));
    expect(owner.shield).toBeCloseTo(Math.max(0, 100 - 150 * (1 - reduction)));
  });

  it('Griffin uses total HP damage, recipient capacity and Gain, with an upgraded capacity cap', () => {
    const state = setup('atmospheric-griffin-turbine', level);
    const target = state.allies[1];
    target.shatter = 0;
    target.stats.shatterCapacity = 300;
    target.stats.gaugeGain = 1.2;
    finishHit(state, 'light', false, 50);
    expect(target.shatter).toBe(Math.round(300 * scaling(.2, level) * .5 * 1.2));
    target.shatter = 0;
    finishHit(state, 'light', false, 10000);
    expect(target.shatter).toBe(Math.round(300 * scaling(.2, level) * 1.2));
  });

  it('Kirin heals from effective Defense with its recipient-HP cap and full-HP Gauge alternative', () => {
    const state = setup('tranquilitic-kirin-cradle', level);
    const [owner, target] = state.allies;
    target.hp = 100;
    owner.stats.defense = 200;
    finishHit(state, 'light');
    expect(target.hp).toBe(100 + (level === null ? 0 : 120));
    target.hp = 1000;
    target.shatter = 0;
    owner.shatter = 0;
    finishHit(state, 'light');
    expect(owner.shatter).toBe(Math.round(200 * scaling(.08, level)));
  });

  it('Faultkeeper shares personal effective Defense without recursive or duplicate squad-aura inflation', () => {
    const state = setup('tectonic-faultkeeper-loom', level);
    const [owner, recipient, other] = state.allies;
    if (level !== null) owner.conduits![1] = 'horizon-heartcase';
    owner.shatter = 40;
    const ownDefense = level === null ? 100 : 110;
    expect(effectiveDefense(state, recipient)).toBeCloseTo(100 + ownDefense * scaling(.25, level));
    if (level !== null) other.conduits = ['tectonic-faultkeeper-loom', null, null, null, null, null, null, null];
    expect(effectiveDefense(state, recipient)).toBeCloseTo(100 + ownDefense * scaling(.25, level));
  });

  it('Dawn Witness gives one refreshable next-Attack bonus and expires rather than accumulating strikes', () => {
    const state = setup('luminous-dawn-witness-array', level);
    const [owner, ally] = state.allies;
    finishHit(state, 'light');
    finishHit(state, 'light');
    const ctx = prepareConduitAction(state, ally, 'skill1', 25, false);
    expect(ctx.criticalBonus).toBeCloseTo(scaling(.15, level));
    expect(prepareConduitAction(state, ally, 'light', 0, false).criticalBonus).toBe(0);
    expect(prepareConduitAction(state, owner, 'light', 0, false).criticalDamageBonus)
      .toBeCloseTo(scaling(.3, level));
    finishHit(state, 'light');
    state.round += 2;
    expect(prepareConduitAction(state, ally, 'light', 0, false).criticalBonus).toBe(0);
  });

  it('Nightglass marks only damaging skills, buffs other-ally Normals and expires after two turns', () => {
    const state = setup('ominous-nightglass-archive', level);
    const ally = state.allies[1], target = state.enemies[0];
    finishHit(state, 'skill1');
    const ctx = prepareConduitAction(state, ally, 'light', 0, false);
    expect(conduitHitModifiers(state, ally, target, ctx, true).criticalDamageBonus ?? 0)
      .toBeCloseTo(scaling(.5, level));
    expect(conduitHitModifiers(state, state.allies[0], target,
      prepareConduitAction(state, state.allies[0], 'light', 0, false), true).criticalDamageBonus ?? 0).toBe(0);
    state.round += 2;
    expect(conduitHitModifiers(state, ally, target, ctx, true).criticalDamageBonus ?? 0).toBe(0);
  });

  it('Thunderbird arcs once from primary skill HP damage, or grants other allies the fallback', () => {
    const state = setup('voltaic-thunderbird-coil', level);
    const events = finishHit(state, 'skill1', true, 100, true);
    expect(events.filter(event => event.kind === 'damage' && event.origin === 'conduit')).toHaveLength(level === null ? 0 : 1);
    const amount = events.find(event => event.kind === 'damage' && event.origin === 'conduit')?.amount ?? 0;
    expect(amount).toBeCloseTo(Math.round(scaling(.4, level) * 100));
    state.enemies = [state.enemies[0]];
    finishHit(state, 'skill1', true);
    expect(prepareConduitAction(state, state.allies[1], 'light', 0, false).criticalBonus)
      .toBeCloseTo(scaling(.2, level));
    expect(prepareConduitAction(state, state.allies[1], 'light', 0, false).criticalBonus).toBe(0);
  });

  it('Seraph heals each recipient from their own max HP once per turn, not per target', () => {
    const state = setup('luminous-seraph-mirror', level);
    for (const ally of state.allies) ally.hp = 100;
    const expected = 100 + Math.round(1000 * scaling(.06, level));
    finishHit(state, 'skill1', true, 100, true);
    for (const ally of state.allies) expect(ally.hp).toBe(expected);
    finishHit(state, 'light', true);
    for (const ally of state.allies) expect(ally.hp).toBe(expected);
    state.round++;
    finishHit(state, 'light', true);
    for (const ally of state.allies) expect(ally.hp).toBe(100 + 2 * Math.round(1000 * scaling(.06, level)));
  });

  it('Mending heals the lowest HP-percentage ally from total skill HP damage, with a per-cast cap', () => {
    const state = setup('mending-valve', level);
    state.allies[1].hp = 100;
    finishHit(state, 'skill1', false, 100, true);
    const damage = 100 * state.enemies.length;
    expect(state.allies[1].hp).toBe(100 + Math.round(Math.min(100, damage * scaling(.15, level))));
    state.allies[1].hp = 100;
    finishHit(state, 'skill1', false, 10000, true);
    expect(state.allies[1].hp).toBe(level === null ? 100 : 200);
    finishHit(state, 'light', false, 10000);
    expect(state.allies[1].hp).toBe(level === null ? 100 : 200);
  });

  it('Eclipse ignores Weakened Defense and adds target-only Power without consuming Weaken', () => {
    const state = setup('ominous-eclipse-mantle', level);
    const [owner, ally] = state.allies, target = state.enemies[0];
    target.weakened = 2; target.weakenFraction = .25; target.weakenSourceId = ally.id;
    const ctx = prepareConduitAction(state, owner, 'skill1', 25, true);
    const modifiers = conduitHitModifiers(state, owner, target, ctx, false);
    expect(modifiers.pierce).toBeCloseTo(scaling(.35, level));
    expect(modifiers.skillPowerBonus).toBeCloseTo(scaling(.2, level));
    expect(ctx.skillPower).toBe(1);
    expect(target.weakened).toBe(2);
    expect(conduitHitModifiers(state, owner, state.enemies[1], ctx, false).skillPowerBonus).toBe(0);
    expect(conduitHitModifiers(state, owner, target, prepareConduitAction(state, owner, 'light', 0, false), false).pierce).toBe(0);
  });

  it('Iris extends only authored Burn and gives other allies the target-dependent Critical Rate', () => {
    const state = setup('flare-focusing-iris', level);
    const result = act(state, state.allies[0].id, 'skill1', state.enemies[0].id).state;
    expect(result.enemies[0].burn.turns).toBe(level === null ? 3 : 4);
    expect(conduitCriticalBonus(result, result.allies[1], result.enemies[0])).toBeCloseTo(scaling(.2, level));
    expect(conduitCriticalBonus(result, result.allies[0], result.enemies[0])).toBe(0);
  });

  it('Cinder Nozzle releases remaining Burn as one capped Bonus Strike, not another Burn', () => {
    const state = setup('cinder-metering-nozzle', level);
    const previous = structuredClone(state), enemy = state.enemies[0];
    enemy.burn = { sourceId: state.allies[0].id, damage: 1000, turns: 3, origin: 'native' };
    enemy.hp = 0;
    const events: BattleEvent[] = [];
    conduitDeaths(state, previous, events);
    expect(events.filter(event => event.kind === 'damage')).toHaveLength(level === null ? 0 : 1);
    expect(events.find(event => event.kind === 'damage')?.amount ?? 0).toBe(Math.round(100 * scaling(2, level)));
    expect(state.enemies[1].burn.turns).toBe(0);
    conduitDeaths(state, previous, events);
    expect(events.filter(event => event.kind === 'damage')).toHaveLength(level === null ? 0 : 1);
  });

  it('Aegis Return follows the source Shield, adding Critical Rate and reducing enemy critical damage', () => {
    const state = setup('aegis-return-spring', level);
    const [owner, ally] = state.allies;
    nativeShield(state, owner, ally, 100, [], { skillPower: 1 });
    expect(conduitCriticalBonus(state, ally, state.enemies[0])).toBeCloseTo(scaling(.2, level));
    conduitIncoming(state, state.enemies[0], ally, 200, true, false, []);
    expect(ally.hp).toBe(1000 - Math.max(0, Math.round(200 * (1 - scaling(.3, level))) - 100));
    expect(conduitCriticalBonus(state, ally, state.enemies[0])).toBe(0);
  });

  it('Tension gives one injured ally Defense and a bounded heal, not additional Weaken potency', () => {
    const state = setup('tension-governor', level);
    const [owner, ally] = state.allies;
    ally.hp = 100;
    const ctx = prepareConduitAction(state, owner, 'skill1', 25, false);
    applyConduitWeaken(state, owner, state.enemies[0], .25, [], 'skill1', 1, ctx);
    applyConduitWeaken(state, owner, state.enemies[1], .25, [], 'skill1', 1, ctx);
    expect(ally.hp).toBe(100 + Math.round(1000 * scaling(.06, level)));
    expect(effectiveDefense(state, ally)).toBeCloseTo(100 * (1 + scaling(.3, level)));
    expect(state.enemies[0].weakenFraction).toBe(.25);
    state.round++;
    expect(effectiveDefense(state, ally)).toBe(100);
  });

  it('Paradox buffs only other allies during recovery and does not allow recovery Normals', () => {
    const state = setup('chaotic-paradox-spindle', level);
    const [owner, ally] = state.allies;
    owner.recoverThrough = state.round;
    expect(prepareConduitAction(state, ally, 'skill1', 25, false).skillPower).toBeCloseTo(1 + scaling(.4, level));
    expect(conduitActionCost(ally, 'skill1', state, 25)).toBe(Math.ceil(25 * (1 - scaling(.2, level))));
    expect(actionUnavailable(state, owner, 'light')).toMatch(/Recovering/);
    owner.recoverThrough = 0;
    expect(prepareConduitAction(state, ally, 'skill1', 25, false).skillPower).toBe(1);
  });

  it('Emberlife increases squad received healing only during its own Burn, without a Burn-triggered heal', () => {
    const state = setup('emberlife-kiln', level);
    const [owner, ally] = state.allies;
    ally.hp = 100;
    state.enemies[0].burn = { damage: 10, turns: 2, sourceId: owner.id, origin: 'native' };
    generatedHeal(owner, ally, 100, [], state);
    expect(ally.hp).toBe(100 + Math.round(100 * (1 + scaling(.3, level))));
    const events: BattleEvent[] = [];
    afterConduitBurn(state, owner, state.enemies[0], 10, events);
    expect(events.some(event => event.kind === 'heal')).toBe(false);
    state.enemies[0].burn.turns = 0;
    expect(generatedHeal(owner, ally, 100, [], state)).toBe(100);
  });

  it('Pyre Census counts distinct living elements and buffs only other-element allies', () => {
    const state = setup('infernic-pyre-census', level);
    const [owner, other, same] = state.allies;
    same.element = owner.element;
    expect(prepareConduitAction(state, owner, 'skill1', 25, false).skillPower).toBeCloseTo(1 + 2 * scaling(.15, level));
    expect(conduitHitModifiers(state, other, state.enemies[0],
      prepareConduitAction(state, other, 'light', 0, false), false).attack).toBeCloseTo(100 * (1 + scaling(.15, level)));
    expect(conduitHitModifiers(state, same, state.enemies[0],
      prepareConduitAction(state, same, 'light', 0, false), false).attack).toBe(100);
    other.hp = 0;
    expect(prepareConduitAction(state, owner, 'skill1', 25, false).skillPower).toBeCloseTo(1 + scaling(.15, level));
  });

  it('Tempered exchanges one received-skill-heal Attack bonus for the healer next-skill Efficiency', () => {
    const state = setup('tempered-strike-link', level);
    const [owner, healer] = state.allies;
    owner.hp = 100;
    nativeHeal(state, healer, owner, 100, [], true, prepareConduitAction(state, healer, 'skill2', 40, false));
    const ctx = prepareConduitAction(state, owner, 'light', 0, false);
    expect(conduitHitModifiers(state, owner, state.enemies[0], ctx, false).attack)
      .toBeCloseTo(100 * (1 + scaling(.4, level)));
    recordConduitHit(ctx, state.enemies[0], 100, false, 1.5);
    finishConduitAction(state, owner, ctx, []);
    expect(conduitActionCost(healer, 'skill1', state, 25)).toBe(Math.ceil(25 * (1 - scaling(.2, level))));
    prepareConduitAction(state, healer, 'skill1', 25, false);
    expect(conduitActionCost(healer, 'skill1', state, 25)).toBe(25);
    expect(conduitHitModifiers(state, owner, state.enemies[0],
      prepareConduitAction(state, owner, 'light', 0, false), false).attack).toBe(100);
  });

  it('Accord prevents one fatal enemy hit, grants only a next-skill discount and cannot rescue twice', () => {
    const state = setup('tranquilitic-accord-bastion', level);
    const [owner, recipient] = state.allies;
    recipient.hp = 100;
    nativeHeal(state, owner, recipient, 10, [], true, prepareConduitAction(state, owner, 'skill1', 25, false));
    conduitIncoming(state, state.enemies[0], recipient, 10000, false, false, []);
    expect(recipient.hp).toBe(level === null ? 0 : 1);
    if (level !== null) {
      expect(recipient.shield).toBe(0);
      expect(conduitActionCost(recipient, 'skill1', state, 25)).toBe(Math.ceil(25 * (1 - scaling(.25, level))));
      prepareConduitAction(state, recipient, 'skill1', 25, false);
      expect(conduitActionCost(recipient, 'skill1', state, 25)).toBe(25);
      nativeHeal(state, owner, recipient, 10, [], true, prepareConduitAction(state, owner, 'skill1', 25, false));
      conduitIncoming(state, state.enemies[0], recipient, 10000, false, false, []);
      expect(recipient.hp).toBe(0);
    }
  });

  it('Fault Verdict buffs Shielded critical damage and rewards the supplier once per turn without consuming Shield', () => {
    const state = setup('chaotic-fault-verdict', level);
    const [owner, supplier] = state.allies;
    nativeShield(state, supplier, owner, 100, [], { skillPower: 1 });
    const ctx = prepareConduitAction(state, owner, 'light', 0, false);
    expect(ctx.criticalDamageBonus).toBeCloseTo(scaling(.5, level));
    recordConduitHit(ctx, state.enemies[0], 100, true, 1.5);
    finishConduitAction(state, owner, ctx, []);
    expect(owner.shield).toBe(100);
    expect(prepareConduitAction(state, supplier, 'skill1', 25, false).skillPower)
      .toBeCloseTo(1 + scaling(.2, level));
    finishHit(state, 'light', true);
    expect(prepareConduitAction(state, supplier, 'skill1', 25, false).skillPower).toBe(1);
  });

  it('Ruinselect retains low-HP Power through an allied heal for one action only', () => {
    const state = setup('ruinselect-prism', level);
    const [owner, healer] = state.allies;
    owner.hp = 300;
    nativeHeal(state, healer, owner, 600, [], true, prepareConduitAction(state, healer, 'skill2', 40, false));
    expect(owner.hp).toBe(900);
    expect(prepareConduitAction(state, owner, 'skill1', 25, false).skillPower)
      .toBeCloseTo(1 + scaling(.4, level));
    expect(prepareConduitAction(state, owner, 'skill1', 25, false).skillPower).toBe(1);
    owner.hp = 300;
    generatedHeal(healer, owner, 600, [], state);
    expect(prepareConduitAction(state, owner, 'skill1', 25, false).skillPower).toBe(1);
  });

  it('Secondbeat holds one damaged target and grants the source Gauge only when the damaging skill uses it', () => {
    const state = setup('secondbeat-rack', level);
    const [owner, source] = state.allies;
    source.shatter = 0;
    const hit = prepareConduitAction(state, source, 'light', 0, false);
    recordConduitHit(hit, state.enemies[0], 100, false, 1.5);
    finishConduitAction(state, source, hit, []);
    const ctx = prepareConduitAction(state, owner, 'skill1', 25, true);
    expect(conduitHitModifiers(state, owner, state.enemies[1], ctx, false).skillPowerBonus).toBe(0);
    expect(conduitHitModifiers(state, owner, state.enemies[0], ctx, false).skillPowerBonus)
      .toBeCloseTo(scaling(.35, level));
    expect(ctx.skillPower).toBe(1);
    recordConduitHit(ctx, state.enemies[0], 100, false, 1.5);
    finishConduitAction(state, owner, ctx, []);
    expect(source.shatter).toBe(Math.round(200 * scaling(.08, level)));
    expect(conduitHitModifiers(state, owner, state.enemies[0],
      prepareConduitAction(state, owner, 'skill1', 25, false), false).skillPowerBonus).toBe(0);
  });

  it('Shared Tide copies a single-target skill Shield at its scaled size and same expiry, with no damage-network sharing', () => {
    const state = setup('oceanic-shared-tide-pump', level, ['tide', 'ember', 'sprout']);
    const [owner, target, injured] = state.allies;
    injured.hp = 100;
    const ctx = prepareConduitAction(state, owner, 'skill2', 40, false);
    nativeShield(state, owner, target, 100, [], { throughPhase: state.round, skillPower: 1, activation: ctx });
    expect(injured.shield).toBe(Math.round(100 * scaling(.5, level)));
    conduitIncoming(state, state.enemies[0], target, 150, false, false, []);
    expect(injured.shield).toBe(Math.round(100 * scaling(.5, level)));
    expect(target.hp).toBe(950);
    expireNativeShields(state, []);
    expect(injured.shield).toBe(0);
  });

  it('Skythread selects Gauge percentage, refreshes one ordinary-skill discount and does not discount Last Flare', () => {
    const state = setup('atmospheric-skythread-rudder', level);
    const [, first, second] = state.allies;
    first.shatter = 40;
    second.shatter = 60;
    second.stats.shatterCapacity = 400;
    finishHit(state, 'light');
    finishHit(state, 'light');
    expect(conduitActionCost(first, 'skill1', state, 25)).toBe(25);
    expect(conduitActionCost(second, 'ultimate', state, 100)).toBe(100);
    expect(conduitActionCost(second, 'skill1', state, 25)).toBe(Math.ceil(25 * (1 - scaling(.25, level))));
    prepareConduitAction(state, second, 'skill1', 25, false);
    expect(conduitActionCost(second, 'skill2', state, 40)).toBe(40);
  });

  it('Solace grants other allies this-turn Attack without free Normals or Gauge costs', () => {
    const state = setup('solace-anchor', level);
    const [owner, other] = state.allies;
    const result = act(state, owner.id, 'light', state.enemies[0].id).state;
    expect(result.allies[0].spent).toBe(true);
    expect(result.allies[0].shatter).toBe(120);
    const actor = result.allies[1];
    expect(conduitHitModifiers(result, actor, result.enemies[0],
      prepareConduitAction(result, actor, 'light', 0, false), false).attack).toBeCloseTo(100 * (1 + scaling(.2, level)));
    result.round++;
    expect(conduitHitModifiers(result, actor, result.enemies[0],
      prepareConduitAction(result, actor, 'light', 0, false), false).attack).toBe(100);
    expect(other.stats.damage).toBe(100);
  });

  it('Sootwake holds one target bonus per other ally, consumed by their next action without stacking Burn ticks', () => {
    const state = setup('sootwake-crucible', level);
    const [owner, ally, support] = state.allies;
    const target = state.enemies[0];
    target.burn = { damage: 10, turns: 2, sourceId: owner.id, origin: 'native' };
    afterConduitBurn(state, owner, target, 10, []);
    afterConduitBurn(state, owner, target, 10, []);
    const ctx = prepareConduitAction(state, ally, 'skill1', 25, false);
    expect(conduitHitModifiers(state, ally, target, ctx, false).skillPowerBonus).toBeCloseTo(scaling(.3, level));
    expect(conduitHitModifiers(state, ally, state.enemies[1], ctx, false).skillPowerBonus).toBe(0);
    finishConduitAction(state, support, prepareConduitAction(state, support, 'skill2', 40, false), []);
    expect(conduitHitModifiers(state, support, target,
      prepareConduitAction(state, support, 'skill1', 25, false), false).skillPowerBonus).toBe(0);
  });

  it('Storm Clock counts critical Attack Actions, not AoE impacts, and holds one next-Last-Flare discount', () => {
    const state = setup('atmospheric-storm-clock', level);
    const ally = state.allies[1];
    finishHit(state, 'skill1', true, 100, true);
    expect(conduitActionCost(ally, 'ultimate', state, 100)).toBe(100);
    finishHit(state, 'light', true);
    expect(conduitActionCost(ally, 'ultimate', state, 100)).toBe(100);
    finishHit(state, 'ultimate', true);
    const expected = Math.max(70, Math.ceil(100 * (1 - scaling(.25, level))));
    expect(conduitActionCost(ally, 'ultimate', state, 100)).toBe(expected);
    expect(conduitActionCost(ally, 'skill1', state, 25)).toBe(25);
    prepareConduitAction(state, ally, 'ultimate', expected, false);
    expect(conduitActionCost(ally, 'ultimate', state, 100)).toBe(100);
  });

  it('Pressurecrest grants one timed injured-ally Shield per turn, never the retired dodge', () => {
    const state = setup('pressurecrest-governor', level);
    const ally = state.allies[1];
    ally.hp = 100;
    finishHit(state, 'skill1', true, 100, true);
    const shield = Math.round(1000 * scaling(.15, level));
    expect(ally.shield).toBe(shield);
    ally.shield = 0;
    finishHit(state, 'skill1', true);
    expect(ally.shield).toBe(0);
    state.round++;
    finishHit(state, 'skill1', true);
    expect(ally.shield).toBe(shield);
    expireNativeShields(state, []);
    expect(ally.shield).toBe(0);
    expect(gear(state.allies[0]).numbers.windveil).toBeUndefined();
  });

  it('Undertide extends Weaken and discounts another ally against the chosen Weakened target only', () => {
    const state = setup('aquatic-undertide-chronometer', level, ['tide', 'ember', 'sprout']);
    const [owner, ally] = state.allies, target = state.enemies[0];
    applyConduitWeaken(state, owner, target, .25, [], 'skill1', 1,
      prepareConduitAction(state, owner, 'skill1', 25, false));
    expect(target.weakened).toBe(level === null ? 1 : 2);
    expect(gear(target).numbers.scheduleShift).toBeUndefined();
    const expected = Math.ceil(25 * (1 - scaling(.15, level)));
    expect(conduitActionCost(ally, 'skill1', state, 25, target.id)).toBe(expected);
    expect(conduitActionCost(ally, 'skill1', state, 25, state.enemies[1].id)).toBe(25);
    ally.shatter = expected;
    expect(actionUnavailable(state, ally, 'skill1', target.id)).toBeNull();
    const result = act(state, ally.id, 'skill1', target.id).state;
    expect(result.allies[1].shatter).toBe(0);
  });

  it('Verdant grants one next-damaging-skill Power token only on effective skill healing', () => {
    const state = setup('efflorescent-verdant-covenant', level);
    const [owner, recipient] = state.allies;
    recipient.hp = 100;
    nativeHeal(state, owner, recipient, 100, [], true, prepareConduitAction(state, owner, 'skill1', 25, false));
    nativeHeal(state, owner, recipient, 100, [], true, prepareConduitAction(state, owner, 'skill1', 25, false));
    expect(prepareConduitAction(state, recipient, 'skill2', 40, false).skillPower).toBe(1);
    expect(prepareConduitAction(state, recipient, 'skill1', 25, false).skillPower).toBeCloseTo(1 + scaling(.3, level));
    expect(prepareConduitAction(state, recipient, 'skill1', 25, false).skillPower).toBe(1);
  });

  it('Covercharge gives the next different skill caster one mixed-skill bonus, not every ally', () => {
    const state = setup('covercharge-drum', level);
    const [owner, first, second] = state.allies;
    const ctx = prepareConduitAction(state, owner, 'skill1', 25, false);
    recordConduitHit(ctx, state.enemies[0], 100, false, 1.5);
    ctx.healed = 100;
    finishConduitAction(state, owner, ctx, []);
    expect(conduitActionCost(first, 'skill1', state, 25)).toBe(Math.ceil(25 * (1 - scaling(.15, level))));
    expect(prepareConduitAction(state, first, 'skill1', 25, false).skillPower).toBeCloseTo(1 + scaling(.2, level));
    expect(conduitActionCost(second, 'skill1', state, 25)).toBe(25);
    expect(prepareConduitAction(state, second, 'skill1', 25, false).skillPower).toBe(1);
  });

  it('Graft adds healing Power rather than multiplying it and grants Defense after crossing 40% HP', () => {
    const state = setup('botanic-graft-covenant', level);
    const [owner, recipient] = state.allies;
    recipient.hp = 300;
    owner.stats.skillPower = 1.2;
    const ctx = prepareConduitAction(state, owner, 'skill1', 25, false);
    nativeHeal(state, owner, recipient, 100, [], true, ctx);
    expect(recipient.hp).toBeCloseTo(300 + 100 * (1.2 + scaling(.5, level)));
    expect(effectiveDefense(state, recipient)).toBeCloseTo(100 * (1 + scaling(.3, level)));
    state.round++;
    expect(effectiveDefense(state, recipient)).toBe(100);
  });

  it('Worldtree creates a capped timed replacement Shield, not an accumulating heal reserve or generic overheal Shield', () => {
    const state = setup('efflorescent-worldtree-heart', level);
    const [owner, recipient] = state.allies;
    const ctx = prepareConduitAction(state, owner, 'skill1', 25, false);
    nativeHeal(state, owner, recipient, 1000, [], true, ctx);
    expect(recipient.shield).toBe(level === null ? 0 : 200);
    nativeHeal(state, owner, recipient, 100, [], true, ctx);
    expect(recipient.shield).toBe(Math.round(100 * scaling(.6, level)));
    expect(gear(recipient).numbers[`seed:${owner.id}`]).toBeUndefined();
    state.round++;
    expireNativeShields(state, []);
    expect(recipient.shield).toBe(0);
    generatedHeal(owner, recipient, 1000, [], state);
    expect(recipient.shield).toBe(0);
  });

  it('Godpress ignores Defense for skills without bypassing Shields or changing Normal damage', () => {
    const state = setup('calamitic-horizon-cleaving-godpress', level);
    const owner = state.allies[0], target = state.enemies[0];
    target.stats.defense = 100;
    target.shield = 10000;
    const damage = damageAmount(100, 1.6 * nativeBalance.skillDamageScale,
      100 * (1 - Math.min(.75, scaling(.55, level))), false);
    const result = act(state, owner.id, 'skill1', target.id);
    const hit = result.events.find(event => event.kind === 'damage' && event.source === owner.id);
    expect(hit?.amount).toBe(0);
    expect(result.state.enemies[0].shield).toBe(10000 - damage);
    const normal = act(state, owner.id, 'light', target.id).state;
    expect(normal.enemies[0].hp).toBe(10000);
    expect(normal.enemies[0].shield).toBe(9950);
  });
});

describe('Phase 0 Calamitic replacement safety', () => {
  it('Throne recipients need no Throne equipment, spend Gauge once and cannot receive another extra action that turn', () => {
    const state = fixture('calamitic-throne-borrowed-tomorrows');
    const [owner, ally, recovering] = state.allies;
    ally.spent = true;
    recovering.spent = true;
    recovering.recoverThrough = state.round;
    afterCalamiticAction(state, owner, 'ultimate', []);
    expect(calamiticExtraActionAvailable(state, ally, 'skill1')).toBe(true);
    expect(calamiticExtraActionAvailable(state, recovering, 'skill1')).toBe(false);
    expect(actionUnavailable(state, ally, 'skill1', state.enemies[0].id)).toBeNull();
    expect(combatantCanAct(state, ally, state.enemies[0].id)).toBe(true);
    const result = act(state, ally.id, 'skill1', state.enemies[0].id).state;
    expect(result.allies[1].shatter).toBe(75);
    expect(actionUnavailable(result, result.allies[1], 'skill2')).toMatch(/already acted/);
    afterCalamiticAction(result, result.allies[0], 'ultimate', []);
    expect(calamiticExtraActionAvailable(result, result.allies[1], 'skill2')).toBe(false);
    result.round++;
    afterCalamiticAction(result, result.allies[0], 'ultimate', []);
    expect(calamiticExtraActionAvailable(result, result.allies[1], 'skill2')).toBe(true);
  });

  it('Causality never defers damage or settles retired debt, and Orrery never banks a reserve', () => {
    const state = fixture('calamitic-causality-funeral-engine');
    const owner = state.allies[0], events: BattleEvent[] = [];
    expect(deferCalamiticDamage(state, owner, 200, events)).toBe(200);
    expect(gear(owner).numbers.calamiticDebt).toBeUndefined();
    gear(owner).numbers.calamiticDebt = 200;
    gear(owner).numbers.calamiticDebtDue = state.round;
    settleCalamiticDebt(state, events);
    expect(owner.hp).toBe(1000);
    owner.conduits![0] = 'calamitic-world-eater-orrery';
    bankCalamiticDamage(state, 100);
    expect(gear(owner).numbers.calamiticOrrery).toBeUndefined();
    expect(events).toEqual([]);
  });

  it('extra actions cannot recursively grant another action even if the recipient also equips Throne', () => {
    const state = fixture('calamitic-throne-borrowed-tomorrows');
    const [owner, ally, third] = state.allies;
    ally.conduits = [...owner.conduits!];
    ally.spent = true;
    afterCalamiticAction(state, owner, 'ultimate', []);
    prepareCalamiticAction(state, ally, 'skill1');
    third.spent = true;
    afterCalamiticAction(state, ally, 'ultimate', []);
    expect(calamiticExtraActionAvailable(state, third, 'skill1')).toBe(false);
  });

  it('turn advancement considers a target-dependent affordable skill instead of discarding a Throne action', () => {
    const state = fixture('aquatic-undertide-chronometer', 0, ['tide', 'ember']);
    const [owner, recipient] = state.allies;
    owner.spent = true;
    recipient.spent = true;
    recipient.shatter = 22;
    gear(recipient).numbers.calamiticThroneExtra = state.round;
    applyConduitWeaken(state, owner, state.enemies[1], .25, [], 'skill1', 1);
    expect(actionUnavailable(state, recipient, 'skill1', state.enemies[0].id)).toContain('Requires');
    expect(actionUnavailable(state, recipient, 'skill1', state.enemies[1].id)).toBeNull();
    expect(teamCanAct(state)).toBe(true);
  });

  it('Orrery does not boost Recall or heal from its stored damage', () => {
    const state = fixture('calamitic-world-eater-orrery', 0, ['elise', 'tide']);
    const [elise, recipient] = state.allies;
    recipient.hp = 100;
    elise.stats.skillPower = 1.5;
    elise.native = { blades: [state.enemies[0].id, state.enemies[0].id] };
    const result = act(state, elise.id, 'skill2', state.enemies[0].id);
    const damage = result.events.filter(event => event.kind === 'damage' && event.origin === 'native')
      .reduce((sum, event) => sum + event.amount + (event.shieldAbsorbed ?? 0), 0);
    expect(damage).toBe(360);
    expect(result.state.allies[1].hp).toBe(100);
    expect(result.events.filter(event => event.kind === 'heal' && event.origin === 'conduit' &&
      event.target === recipient.id)).toHaveLength(0);
  });
});
