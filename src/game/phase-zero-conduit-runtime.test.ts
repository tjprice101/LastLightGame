import { describe, expect, it, vi } from 'vitest';

vi.mock('../content/phase-zero-stats', async importOriginal => ({
  ...await importOriginal<typeof import('../content/phase-zero-stats')>(),
  phaseZeroStatsReady: true,
}));

import { createBattle, act, actionUnavailable, type BattleState } from './battle';
import { conduitActionCost, effectiveDefense, generatedGauge, initializeConduits, nativeGauge,
  generatedGaugePercent, nativeShield, prepareConduitAction, finishConduitAction, recordConduitHit,
  conduitIncoming, afterConduitHpLoss, afterConduitBurn } from './conduit-runtime';
import { calamiticShieldBypass } from './calamitic-conduits';
import { nativeAction, nativeAfterAction, nativeEnemyCompleted, nativeIncomingMultiplier, nativePhaseEnd,
  nativeRouteDamage, nativeTurnStart } from './native-kits';
import { phaseZeroSkillCost } from '../content/phase-zero-conduit-stats';
import { conduits, conduitEffect, type Conduit } from '../content/conduits';
import { conduitHitModifiers } from './conduit-runtime';
import { nativeTargetDefense } from './conduit-runtime';
import { nativeBalance } from '../content/native-balance';
import { masterConduits } from '../content/master-conduits';
import { approvedConduitCatalog } from '../content/phase-zero-conduit-catalog';

function fixture(roster: string[] = ['ember', 'tide', 'sprout']): BattleState {
  const state = createBattle(1729, roster);
  for (const unit of [...state.allies, ...state.enemies]) {
    unit.stats = { ...unit.stats, health: 1000, damage: 100, defense: 100, crit: 0, critMultiplier: 1.5,
      shatterCapacity: 200, skillPower: 1, skillDuration: 0, skillEfficiency: 0, gaugeGain: 1 };
    unit.hp = 1000;
    unit.shatter = 100;
  }
  for (const enemy of state.enemies) {
    enemy.stats = { ...enemy.stats, health: 100_000, damage: 100, defense: 0, crit: 0 };
    enemy.hp = enemy.stats.health;
  }
  initializeConduits(state);
  return state;
}

const firstDamage = (state: BattleState) =>
  act(state, state.allies[0].id, 'skill1', state.enemies[0].id).events
    .find(event => event.kind === 'damage' && event.source === state.allies[0].id)?.amount ?? 0;

describe('Phase 0 shared runtime math', () => {
  it('uses the approved default effect text for every one of the 138 entries', () => {
    const entries = [...conduits, ...masterConduits];
    expect(entries).toHaveLength(138);
    expect(Object.keys(approvedConduitCatalog)).toHaveLength(138);
    for (const entry of entries) {
      expect(approvedConduitCatalog[entry.id]?.name, entry.id).toBe(entry.name);
      if (entry.rarity === 'Calamitic') continue;
      const effect = 'character' in entry ? entry.effect : conduitEffect(entry as Conduit, 0);
      expect(effect, entry.id).toBe(approvedConduitCatalog[entry.id]?.ability);
    }
  });

  it('scales native skill damage once by Skill Power but leaves Normal Attack unchanged', () => {
    const baseSkill = fixture();
    const poweredSkill = fixture();
    poweredSkill.allies[0].stats.skillPower = 1.5;
    expect(firstDamage(poweredSkill)).toBe(Math.round(firstDamage(baseSkill) * 1.5));

    const baseNormal = fixture();
    const poweredNormal = fixture();
    poweredNormal.allies[0].stats.skillPower = 2;
    const light = (state: BattleState) =>
      act(state, state.allies[0].id, 'light', state.enemies[0].id).events
        .find(event => event.kind === 'damage' && event.source === state.allies[0].id)?.amount;
    expect(light(poweredNormal)).toBe(light(baseNormal));
  });

  it('applies efficiency floors and one ceiling operation', () => {
    expect(phaseZeroSkillCost(25, .15, 'skill1')).toBe(22);
    expect(phaseZeroSkillCost(100, .25, 'ultimate')).toBe(75);
    expect(phaseZeroSkillCost(80, .5, 'ultimate')).toBe(70);
    expect(phaseZeroSkillCost(0, .5, 'light')).toBe(0);
    const state = fixture();
    state.allies[0].stats.skillEfficiency = .15;
    expect(conduitActionCost(state.allies[0], 'skill1', state, 25)).toBe(22);
  });

  it('applies Gauge Gain once to native and generated positive Gauge receipts', () => {
    const state = fixture();
    const [owner, target] = state.allies;
    target.stats.gaugeGain = 1.5;
    target.shatter = 0;
    nativeGauge(state, target, 11, []);
    expect(target.shatter).toBe(17);
    target.shatter = 0;
    generatedGauge(owner, target, 11, []);
    expect(target.shatter).toBe(17);
  });

  it('scales authored Burn damage by Skill Power and adds whole Skill Duration turns', () => {
    const state = fixture();
    const owner = state.allies[0];
    owner.stats.skillPower = 1.5;
    owner.stats.skillDuration = 1;
    owner.shatter = 200;
    const result = act(state, owner.id, 'skill1', state.enemies[0].id).state;
    expect(result.enemies[0].burn.damage).toBe(38);
    expect(result.enemies[0].burn.turns).toBe(4);
  });

  it('removes the retired Sentinel and Aegis conditional Defense hooks', () => {
    const state = fixture();
    const [owner, ally] = state.allies;
    owner.conduits = ['sentinel-aperture', null, null, null, null, null, null, null];
    owner.shatter = 30;
    expect(effectiveDefense(state, owner)).toBe(100);
    owner.conduits = ['aegis-capacitor', null, null, null, null, null, null, null];
    nativeShield(state, owner, ally, 100, [], { skillPower: 1 });
    expect(effectiveDefense(state, owner)).toBe(100);
  });

  it('uses Tizu Shield Defense only while the source-owned Shield remains', () => {
    const state = fixture(['tide', 'sprout', 'ember']);
    const [tide, recipient] = state.allies;
    tide.masterConduit = 'master-tide-1';
    nativeShield(state, tide, recipient, 100, []);
    expect(effectiveDefense(state, recipient)).toBe(130);
    recipient.shield = 0;
    expect(effectiveDefense(state, recipient)).toBe(100);
  });

  it('extends Ward Stitch Shields and grants their holders upgraded healing/Shield Skill Power', () => {
    const state = fixture(['sprout', 'tide', 'ember']);
    const [owner, recipient] = state.allies;
    owner.conduits = ['ward-stitch-spool', null, null, null, null, null, null, null];
    nativeShield(state, owner, recipient, 100, [], { throughPhase: state.round });
    expect(recipient.conduitRuntime?.layers?.[0].expiresAfterPhase).toBe(state.round + 1);
    expect(prepareConduitAction(state, recipient, 'skill2', 40, false).skillPower).toBe(1.3);
    state.conduitUpgrades = { 'ward-stitch-spool': 1 };
    expect(prepareConduitAction(state, recipient, 'skill2', 40, false).skillPower).toBe(1.33);
  });

  it('Cathedral no longer grants a squad Power or Efficiency aura', () => {
    const state = fixture();
    const [actor, aura] = state.allies;
    aura.conduits = ['calamitic-cathedral-final-equation', null, null, null, null, null, null, null];
    expect(prepareConduitAction(state, actor, 'skill1', 25, false).skillPower).toBe(1);
    expect(conduitActionCost(actor, 'skill1', state, 25)).toBe(25);
    aura.hp = 0;
    expect(prepareConduitAction(state, actor, 'skill1', 25, false).skillPower).toBe(1);
    expect(conduitActionCost(actor, 'skill1', state, 25)).toBe(25);
  });

  it('uses the Throne only for an eligible once-per-turn extra skill after Last Flare', () => {
    const state = fixture();
    const [owner, ally] = state.allies;
    owner.conduits = ['calamitic-throne-borrowed-tomorrows', null, null, null, null, null, null, null];
    owner.shatter = owner.stats.shatterCapacity;
    act(state, ally.id, 'light', state.enemies[0].id);
    const afterFlare = act(state, owner.id, 'ultimate', state.enemies[0].id).state;
    expect(actionUnavailable(afterFlare, afterFlare.allies[1], 'skill1')).toBeNull();
    const afterExtra = act(afterFlare, afterFlare.allies[1].id, 'skill1', afterFlare.enemies[0].id).state;
    expect(actionUnavailable(afterExtra, afterExtra.allies[1], 'skill2')).toBe('This character has already acted this turn.');
  });

  it('keeps Causality Funeral Engine Last Flare recovery-free', () => {
    const state = fixture();
    const owner = state.allies[0];
    owner.conduits = ['calamitic-causality-funeral-engine', null, null, null, null, null, null, null];
    owner.shatter = owner.stats.shatterCapacity;
    const result = act(state, owner.id, 'ultimate', state.enemies[0].id).state;
    expect(result.allies[0].recoverThrough).toBe(0);
  });

  it('applies Horizon-Cleaving skill Defense ignore without bypassing Shields', () => {
    const state = fixture();
    const owner = state.allies[0], target = state.enemies[0];
    owner.conduits = ['calamitic-horizon-cleaving-godpress', null, null, null, null, null, null, null];
    target.stats.defense = 100;
    target.shield = 1000;
    const result = act(state, owner.id, 'skill1', target.id);
    expect(result.events.find(event => event.kind === 'damage' && event.source === owner.id)?.amount).toBe(0);
    expect(result.state.enemies[0].shield).toBeGreaterThan(0);
    expect(result.state.enemies[0].shield).toBeLessThan(1000);
    expect(result.state.enemies[0].hp).toBe(100_000);
    expect(calamiticShieldBypass(state, owner, 'light')).toBe(0);
    expect(calamiticShieldBypass(state, owner, 'skill1')).toBe(0);
  });

  it('World-Eater boosts debuff skills without healing the squad', () => {
    const state = fixture();
    const owner = state.allies[0], ally = state.allies[1];
    owner.conduits = ['calamitic-world-eater-orrery', null, null, null, null, null, null, null];
    ally.hp = 500;
    const result = act(state, owner.id, 'skill1', state.enemies[0].id);
    const damage = result.events.find(event => event.kind === 'damage' && event.source === owner.id)?.amount ?? 0;
    expect(damage).toBeGreaterThan(0);
    expect(result.state.allies[1].hp).toBe(500);
  });

  it('uses recipient capacity for percentage Gauge grants and applies Gauge Gain once', () => {
    const state = fixture();
    const [owner, target] = state.allies;
    target.shatter = 0;
    target.stats.gaugeGain = 1.5;
    generatedGaugePercent(owner, target, .08, [], state);
    expect(target.shatter).toBe(24);
    target.shatter = 0;
    generatedGaugePercent(owner, target, .08, [], state);
    expect(target.shatter).toBe(24);
  });

  it('applies Firstlight only during the first two turns to Gauge Gain and Defense', () => {
    const state = fixture();
    const [owner, target] = state.allies;
    owner.conduits = ['firstlight-cam', null, null, null, null, null, null, null];
    target.shatter = 0;
    nativeGauge(state, target, 20, []);
    expect(target.shatter).toBe(30);
    expect(effectiveDefense(state, target)).toBe(140);
    target.shatter = 0;
    state.round = 3;
    nativeGauge(state, target, 20, []);
    expect(target.shatter).toBe(20);
    expect(effectiveDefense(state, target)).toBe(100);
  });

  it('grants Pulse Trigger Gauge to other allies only once on the first critical skill each turn', () => {
    const state = fixture();
    const [owner, first, second] = state.allies;
    owner.conduits = ['pulse-trigger-pawl', null, null, null, null, null, null, null];
    owner.stats.crit = 1;
    first.shatter = 0;
    second.shatter = 0;
    state.conduitUpgrades = { 'pulse-trigger-pawl': 2 };
    const result = act(state, owner.id, 'skill1', state.enemies[0].id).state;
    expect(result.allies[1].shatter).toBe(19);
    expect(result.allies[2].shatter).toBe(19);
    const next = structuredClone(result);
    const activation = prepareConduitAction(next, next.allies[0], 'skill2', 25, false);
    recordConduitHit(activation, next.enemies[0], 1, true, 1.5);
    finishConduitAction(next, next.allies[0], activation, []);
    expect(next.allies[1].shatter).toBe(19);
    expect(next.allies[2].shatter).toBe(19);
    const absent = fixture();
    absent.allies[0].stats.crit = 1;
    absent.allies[1].shatter = 0;
    act(absent, absent.allies[0].id, 'skill1', absent.enemies[0].id);
    expect(absent.allies[1].shatter).toBe(0);
  });

  it('uses Griffin Turbine actual HP damage as a recipient-capacity fraction', () => {
    const state = fixture();
    const [owner, first, second] = state.allies;
    owner.conduits = ['atmospheric-griffin-turbine', null, null, null, null, null, null, null];
    first.shatter = 0;
    second.shatter = 0;
    const result = act(state, owner.id, 'light', state.enemies[0].id).state;
    const actualLoss = 100_000 - result.enemies[0].hp;
    const fraction = Math.min(.2, .2 * actualLoss / owner.stats.damage);
    expect(result.allies[1].shatter).toBe(Math.round(200 * fraction));
    expect(result.allies[2].shatter).toBe(Math.round(200 * fraction));
  });

  it('spends Survey points for the Surveyor Crown Gauge cap per cast', () => {
    const state = fixture(['nerithe', 'tide', 'sprout']);
    const [owner, first, second] = state.allies;
    owner.masterConduit = 'master-nerithe-3';
    first.shatter = 0;
    second.shatter = 0;
    const activation = prepareConduitAction(state, owner, 'ultimate', 100, false);
    activation.spent.survey = 6;
    finishConduitAction(state, owner, activation, []);
    expect(owner.shatter).toBe(140);
    expect(first.shatter).toBe(40);
    expect(second.shatter).toBe(40);
  });

  it('moves Nerithe Survey and holds the Master skill-power bonus for that target', () => {
    const state = fixture(['nerithe', 'tide', 'sprout']);
    const [owner, ally] = state.allies;
    owner.masterConduit = 'master-nerithe-2';
    owner.native = { survey: { target: state.enemies[0].id, points: 2 } };
    const target = state.enemies[1];
    const activation = prepareConduitAction(state, owner, 'skill2', 40, false);
    nativeAction(state, owner, 'skill2', target.id, [], () => {}, activation);
    expect(owner.native.survey?.target).toBe(target.id);
    const allyActivation = prepareConduitAction(state, ally, 'skill1', 25, false);
    expect(conduitHitModifiers(state, ally, target, allyActivation, false).skillPowerBonus).toBeCloseTo(.4);
    expect(conduitHitModifiers(state, ally, target, allyActivation, false).skillPowerBonus).toBeCloseTo(.4);
    expect(allyActivation.skillPower).toBe(1);
    expect(conduitHitModifiers(state, ally, state.enemies[0], allyActivation, false).skillPowerBonus).toBe(0);
  });

  it('releases Atmoso Master Gust Gauge to all living allies', () => {
    const state = fixture(['atmoso', 'tide', 'sprout']);
    const [owner, first, second] = state.allies;
    owner.masterConduit = 'master-atmoso-1';
    owner.native = { cyclone: { gusts: 6, phases: 1, contributors: {} } };
    owner.shatter = first.shatter = second.shatter = 0;
    nativePhaseEnd(state, []);
    expect(owner.shatter).toBe(36);
    expect(first.shatter).toBe(36);
    expect(second.shatter).toBe(36);
  });

  it('shields allies from Atmoso Cyclone actual HP damage with the approved cap', () => {
    const state = fixture(['atmoso', 'tide', 'sprout']);
    const [owner, first, second] = state.allies;
    owner.masterConduit = 'master-atmoso-2';
    owner.stats.damage = 2000;
    owner.native = { cyclone: { gusts: 1, phases: 1, contributors: {} } };
    nativePhaseEnd(state, []);
    expect(first.shield).toBe(150);
    expect(second.shield).toBe(150);
    expect(owner.shield).toBe(150);
    expect(owner.conduitRuntime?.layers?.[0].expiresAfterPhase).toBe(state.round);
  });

  it('caps Leviathan Gauge at 15% per recipient during one Enemy Turn', () => {
    const state = fixture();
    const [owner, recipient] = state.allies;
    owner.conduits = ['aquatic-leviathan-pump', null, null, null, null, null, null, null];
    recipient.shatter = 0;
    nativeShield(state, owner, recipient, 200, []);
    for (let index = 0; index < 4; index++) {
      delete state.enemies[0].native;
      conduitIncoming(state, state.enemies[0], recipient, 50, false, false, [], 'light');
    }
    expect(recipient.shatter).toBe(70);
  });

  it('caps Atlas Bastion Gauge at 12% per other ally during the taunted Enemy Turn', () => {
    const state = fixture();
    const [owner, first, second] = state.allies;
    owner.conduits = ['tectonic-atlas-bastion', null, null, null, null, null, null, null];
    owner.conduitRuntime!.numbers.tauntRound = state.round;
    first.shatter = second.shatter = 0;
    for (let index = 0; index < 4; index++) {
      delete state.enemies[0].native;
      conduitIncoming(state, state.enemies[0], owner, 1, false, false, [], 'light');
    }
    expect(first.shatter).toBe(24);
    expect(second.shatter).toBe(24);
  });

  it('applies Crosswind Gauge Gain only through the next player turn', () => {
    const state = fixture(['atmoso', 'tide', 'sprout']);
    const [owner, contributor] = state.allies;
    owner.masterConduit = 'master-atmoso-3';
    owner.native = { cyclone: { gusts: 0, phases: 2, contributors: {} } };
    contributor.shatter = 0;
    nativeAfterAction(state, contributor, 'light', undefined, []);
    nativeGauge(state, contributor, 10, []);
    expect(contributor.shatter).toBe(13);
    contributor.shatter = 0;
    state.round += 2;
    nativeGauge(state, contributor, 10, []);
    expect(contributor.shatter).toBe(10);
  });

  it('applies Cinderstar Gauge per Burn turn consumed', () => {
    const state = fixture(['ember', 'tide', 'sprout']);
    const [owner, first, second] = state.allies;
    owner.masterConduit = 'master-ember-2';
    first.shatter = second.shatter = 0;
    const activation = prepareConduitAction(state, owner, 'skill2', 40, true);
    activation.spent.ember = 2;
    finishConduitAction(state, owner, activation, []);
    expect(first.shatter).toBe(16);
    expect(second.shatter).toBe(16);
  });

  it('extends Aurora Verdict protection to enemy skills and grants its end-turn Gauge', () => {
    const state = fixture(['aurora', 'tide', 'sprout']);
    const owner = state.allies[0], enemy = state.enemies[0];
    owner.masterConduit = 'master-aurora-2';
    owner.native = { ultimateWardThrough: state.round };
    expect(nativeIncomingMultiplier(state, enemy, owner, 'skill1', [])).toBe(.5);
    const gaugeState = fixture(['aurora', 'tide', 'sprout']);
    const [aurora, first, second] = gaugeState.allies;
    aurora.masterConduit = 'master-aurora-2';
    aurora.native = { ultimateWardThrough: gaugeState.round };
    aurora.shatter = first.shatter = second.shatter = 0;
    nativePhaseEnd(gaugeState, []);
    expect(aurora.shatter).toBe(16);
    expect(first.shatter).toBe(16);
    expect(second.shatter).toBe(16);
  });

  it('applies Aurora seal defense and shield-on-resolution only with Final Dawn equipped', () => {
    const active = fixture(['aurora', 'tide', 'sprout']);
    const [aurora, first, second] = active.allies;
    const enemy = active.enemies[0];
    aurora.masterConduit = 'master-aurora-1';
    enemy.stats.defense = 100;
    aurora.native = { seals: { [enemy.id]: { fraction: .2, throughPhase: active.round } } };
    expect(nativeTargetDefense(active, enemy)).toBe(75);
    first.hp = 500;
    second.hp = 700;
    nativeIncomingMultiplier(active, enemy, first, 'skill1', []);
    nativeEnemyCompleted(active, enemy, true, []);
    expect(first.shield).toBe(150);
    expect(second.shield).toBe(0);

    const absent = fixture(['aurora', 'tide', 'sprout']);
    const unarmedEnemy = absent.enemies[0];
    unarmedEnemy.stats.defense = 100;
    absent.allies[0].native = {
      seals: { [unarmedEnemy.id]: { fraction: .2, throughPhase: absent.round } },
    };
    expect(nativeTargetDefense(absent, unarmedEnemy)).toBe(100);
    nativeIncomingMultiplier(absent, unarmedEnemy, absent.allies[0], 'skill1', []);
    nativeEnemyCompleted(absent, unarmedEnemy, true, []);
    expect(absent.allies[0].shield).toBe(0);
  });

  it('heals all living allies once when Master Aurora seals are consumed', () => {
    const state = fixture(['aurora', 'tide', 'sprout']);
    const [aurora, first, second] = state.allies;
    const enemy = state.enemies[0];
    aurora.masterConduit = 'master-aurora-3';
    aurora.native = { seals: { [enemy.id]: { fraction: .2, throughPhase: state.round } } };
    first.hp = 800;
    second.hp = 700;
    nativeIncomingMultiplier(state, enemy, aurora, 'skill1', []);
    expect(aurora.hp).toBe(1000);
    expect(first.hp).toBe(880);
    expect(second.hp).toBe(780);
  });

  it('adds Bruno cover Defense and Gauge Gain and uses the revised Last Flare Shield', () => {
    const state = fixture(['bruno', 'tide', 'sprout']);
    const [bruno, ally] = state.allies;
    bruno.masterConduit = 'master-bruno-2';
    bruno.native = { cover: { targets: [ally.id], fraction: .4, throughPhase: state.round } };
    ally.shatter = 0;
    nativeGauge(state, ally, 10, []);
    expect(ally.shatter).toBe(13);
    expect(effectiveDefense(state, bruno)).toBe(100);

    const activation = prepareConduitAction(state, bruno, 'ultimate', 100, false);
    nativeAction(state, bruno, 'ultimate', state.enemies[0].id, [], () => {}, activation);
    expect(bruno.shield).toBe(Math.round(Math.max(250, effectiveDefense(state, bruno) * 2.5) *
      activation.skillPower * 1.5));
  });

  it('grants Master Bruno the Cover Defense and next-skill power only after routing damage', () => {
    const state = fixture(['bruno', 'tide', 'sprout']);
    const [bruno, recipient] = state.allies;
    bruno.masterConduit = 'master-bruno-1';
    bruno.native = { cover: { targets: [recipient.id], fraction: .4, throughPhase: state.round } };
    expect(effectiveDefense(state, bruno)).toBe(140);
    nativeRouteDamage(state, state.enemies[0], recipient, 100, [], () => {});
    expect(prepareConduitAction(state, recipient, 'skill1', 25, false).skillPower).toBe(1.3);
    expect(prepareConduitAction(state, recipient, 'skill1', 25, false).skillPower).toBe(1);

    const absent = fixture(['bruno', 'tide', 'sprout']);
    absent.allies[0].native = { cover: { targets: [absent.allies[1].id], fraction: .4, throughPhase: absent.round } };
    nativeRouteDamage(absent, absent.enemies[0], absent.allies[1], 100, [], () => {});
    expect(prepareConduitAction(absent, absent.allies[1], 'skill1', 25, false).skillPower).toBe(1);
  });

  it('grants Disciple instruction critical bonuses only for an equipped Master and damaging actions', () => {
    const state = fixture(['disciple', 'tide', 'sprout']);
    const [disciple, recipient] = state.allies;
    disciple.masterConduit = 'master-disciple-3';
    recipient.native = { instruction: { kind: 'strike', owner: disciple.id, throughRound: state.round } };
    const activation = prepareConduitAction(state, recipient, 'skill1', 25, false);
    expect(activation.criticalBonus).toBe(.3);
    expect(activation.criticalDamageBonus).toBe(.4);
    const support = prepareConduitAction(state, recipient, 'skill2', 40, false);
    expect(support.criticalBonus).toBe(0);
    expect(support.criticalDamageBonus).toBe(0);

    const absent = fixture(['disciple', 'tide', 'sprout']);
    absent.allies[1].native = { instruction: { kind: 'strike', owner: absent.allies[0].id, throughRound: absent.round } };
    const unarmed = prepareConduitAction(absent, absent.allies[1], 'skill1', 25, false);
    expect(unarmed.criticalBonus).toBe(0);
    expect(unarmed.criticalDamageBonus).toBe(0);
  });

  it('grants Crinso the combo Shield only when Golden Edge follows Crimson Rupture', () => {
    const state = fixture(['crinso', 'tide', 'sprout']);
    const [crinso, first, second] = state.allies;
    crinso.masterConduit = 'master-crinso-2';
    first.hp = 500;
    second.hp = 700;
    crinso.native = { edge: 'crimson', combo: 1 };
    const activation = prepareConduitAction(state, crinso, 'skill1', 25, false);
    nativeAction(state, crinso, 'skill1', state.enemies[0].id, [], () => {}, activation);
    finishConduitAction(state, crinso, activation, []);
    expect(activation.spent.goldenEdge).toBe(1);
    expect(first.shield).toBe(120);
    expect(second.shield).toBe(0);

    const absent = fixture(['crinso', 'tide', 'sprout']);
    absent.allies[0].native = { edge: 'crimson', combo: 1 };
    const noMaster = prepareConduitAction(absent, absent.allies[0], 'skill1', 25, false);
    nativeAction(absent, absent.allies[0], 'skill1', absent.enemies[0].id, [], () => {}, noMaster);
    finishConduitAction(absent, absent.allies[0], noMaster, []);
    expect(absent.allies[1].shield).toBe(0);
  });

  it('heals Crinso\'s most injured ally on alternate-skill Combo and the squad at Combo three', () => {
    const state = fixture(['crinso', 'tide', 'sprout']);
    const [crinso, first, second] = state.allies;
    crinso.masterConduit = 'master-crinso-3';
    first.hp = 500;
    second.hp = 700;
    crinso.native = { edge: 'crimson', combo: 0 };
    const activation = prepareConduitAction(state, crinso, 'skill1', 25, false);
    nativeAction(state, crinso, 'skill1', state.enemies[0].id, [], () => {}, activation);
    finishConduitAction(state, crinso, activation, []);
    expect(first.hp).toBe(580);
    expect(second.hp).toBe(700);

    first.hp = second.hp = 500;
    crinso.native = { edge: 'gold', combo: 2 };
    const third = prepareConduitAction(state, crinso, 'skill2', 40, false);
    nativeAction(state, crinso, 'skill2', state.enemies[0].id, [], () => {}, third);
    finishConduitAction(state, crinso, third, []);
    expect(first.hp).toBe(580);
    expect(second.hp).toBe(580);
  });

  it('applies Elise Shuriken Defense reduction only while the blades are lodged', () => {
    const state = fixture(['elise', 'tide', 'sprout']);
    const [elise] = state.allies;
    const enemy = state.enemies[0];
    enemy.stats.defense = 100;
    elise.masterConduit = 'master-elise-1';
    elise.native = { blades: [enemy.id, enemy.id] };
    expect(nativeTargetDefense(state, enemy)).toBe(70);
    elise.native.blades = [null, null];
    expect(nativeTargetDefense(state, enemy)).toBe(100);

    const absent = fixture(['elise', 'tide', 'sprout']);
    absent.enemies[0].stats.defense = 100;
    absent.allies[0].native = { blades: [absent.enemies[0].id, absent.enemies[0].id] };
    expect(nativeTargetDefense(absent, absent.enemies[0])).toBe(100);
  });

  it('applies Foundation protection, repair Skill Power, and delayed Master Orvella healing', () => {
    const state = fixture(['orvella', 'tide', 'sprout']);
    const [orvella, first, second] = state.allies;
    orvella.masterConduit = 'master-orvella-3';
    orvella.native = { foundation: { durability: 500, maximum: 500, throughPhase: state.round + 1 } };
    expect(effectiveDefense(state, first)).toBe(125);
    const repair = prepareConduitAction(state, orvella, 'skill1', 25, false);
    expect(repair.skillPower).toBe(1);
    nativeAction(state, orvella, 'skill1', state.enemies[0].id, [], () => {}, repair);
    expect(orvella.native.foundation?.durability).toBe(620);
    orvella.masterConduit = 'master-orvella-2';
    first.hp = 500;
    second.hp = 600;
    nativeRouteDamage(state, state.enemies[0], first, 1000, [], () => {});
    expect(orvella.conduitRuntime?.numbers.foundationHealBank).toBe(80);
    state.round++;
    nativeTurnStart(state, []);
    expect(first.hp).toBe(540);
    expect(second.hp).toBe(640);
  });

  it('preserves Foundation and grants one-skill Efficiency after Master Orvella Last Flare', () => {
    const state = fixture(['orvella', 'tide', 'sprout']);
    const [orvella, first, second] = state.allies;
    orvella.masterConduit = 'master-orvella-1';
    orvella.native = { foundation: { durability: 500, maximum: 500, throughPhase: state.round + 1 } };
    const activation = prepareConduitAction(state, orvella, 'ultimate', 100, false);
    nativeAction(state, orvella, 'ultimate', state.enemies[0].id, [], () => {}, activation);
    expect(orvella.native.foundation?.durability).toBe(200);
    expect(conduitActionCost(first, 'skill1', state, 100)).toBe(80);
    expect(conduitActionCost(second, 'skill2', state, 100)).toBe(80);
    prepareConduitAction(state, first, 'skill1', 80, false);
    expect(conduitActionCost(first, 'skill1', state, 100)).toBe(100);
  });

  it('adds Tizu shielded-ally Defense ignore only against his own Weaken', () => {
    const state = fixture(['tide', 'sprout', 'ember']);
    const [tide, ally] = state.allies;
    const enemy = state.enemies[0];
    tide.masterConduit = 'master-tide-3';
    nativeShield(state, tide, ally, 100, []);
    enemy.weakened = 1;
    enemy.weakenSourceId = tide.id;
    const activation = prepareConduitAction(state, ally, 'light', 0, false);
    expect(conduitHitModifiers(state, ally, enemy, activation, false).pierce).toBe(.25);
    enemy.weakenSourceId = state.allies[1].id;
    expect(conduitHitModifiers(state, ally, enemy, activation, false).pierce).toBe(0);
  });

  it('applies Bruno Hammerfall Defense reduction and Cover recipient Attack only while protected', () => {
    const state = fixture(['bruno', 'tide', 'sprout']);
    const [bruno, ally] = state.allies;
    const enemy = state.enemies[0];
    enemy.stats.defense = 100;
    bruno.masterConduit = 'master-bruno-3';
    bruno.native = { cover: { targets: [ally.id], fraction: .4, throughPhase: state.round } };
    const activation = prepareConduitAction(state, ally, 'light', 0, false);
    expect(conduitHitModifiers(state, ally, enemy, activation, false).attack).toBe(125);
    const hit = act(state, bruno.id, 'skill1', enemy.id).state;
    expect(hit.enemies[0].conduitRuntime?.numbers.brunoDefenseThrough).toBe(state.round + 1);
    expect(nativeTargetDefense(hit, hit.enemies[0])).toBe(75);
    bruno.native!.cover!.throughPhase = state.round - 1;
    expect(conduitHitModifiers(state, ally, enemy, activation, false).attack).toBe(100);
  });

  it('makes Briar Shot seed every ally with its Skill Power bonus', () => {
    const state = fixture(['sprout', 'tide', 'ember']);
    const [owner, first, second] = state.allies;
    owner.masterConduit = 'master-sprout-2';
    owner.native = {};
    const activation = prepareConduitAction(state, owner, 'skill1', 25, false);
    nativeAction(state, owner, 'skill1', state.enemies[0].id, [], () => {}, activation);
    for (const ally of [owner, first, second])
      expect(owner.native.seeds?.[ally.id]?.fraction).toBeCloseTo(nativeBalance.flora.seed * 1.2);
  });

  it('grants Seed harvest or maturity Skill Power and Efficiency bonuses once', () => {
    const state = fixture(['sprout', 'tide', 'ember']);
    const [owner, recipient] = state.allies;
    owner.masterConduit = 'master-sprout-1';
    owner.native = { seeds: { [recipient.id]: { fraction: .1, dueRound: state.round, empowered: true } } };
    nativeTurnStart(state, []);
    expect(conduitActionCost(recipient, 'skill1', state, 100)).toBe(85);
    const activation = prepareConduitAction(state, recipient, 'skill1', 25, false);
    expect(activation.skillPower).toBe(1.25);
    const next = prepareConduitAction(state, recipient, 'skill2', 25, false);
    expect(next.skillPower).toBe(1);
    expect(conduitActionCost(recipient, 'skill2', state, 100)).toBe(100);
  });

  it('grants pending empowered-Seed Defense and revives Worldseed allies once', () => {
    const state = fixture(['sprout', 'tide', 'ember']);
    const [owner, recipient, fallen] = state.allies;
    owner.masterConduit = 'master-sprout-3';
    owner.native = { seeds: { [recipient.id]: { fraction: .1, dueRound: state.round + 1, empowered: true } } };
    expect(effectiveDefense(state, recipient)).toBe(125);
    fallen.hp = 0;
    const activation = prepareConduitAction(state, owner, 'ultimate', 100, false);
    finishConduitAction(state, owner, activation, []);
    expect(fallen.hp).toBe(350);
    expect(fallen.shatter).toBe(0);
    const repeat = prepareConduitAction(state, owner, 'ultimate', 100, false);
    finishConduitAction(state, owner, repeat, []);
    expect(fallen.hp).toBe(350);
  });

  it('applies Tide Shelter Skill Power and consumes its shield-linked next-skill discount', () => {
    const state = fixture(['tide', 'ember', 'sprout']);
    const [owner, recipient] = state.allies;
    owner.masterConduit = 'master-tide-2';
    const activation = prepareConduitAction(state, owner, 'skill2', 40, false);
    expect(activation.skillPower).toBe(1.5);
    nativeAction(state, owner, 'skill2', recipient.id, [], () => {}, activation);
    expect(recipient.shield).toBeCloseTo(recipient.stats.health * nativeBalance.tizu.shelter * 1.5);
    expect(conduitActionCost(recipient, 'skill1', state, 25)).toBe(19);
    prepareConduitAction(state, recipient, 'skill1', 19, false);
    expect(conduitActionCost(recipient, 'skill2', state, 25)).toBe(25);
  });

  it('grants Bliss Skill Efficiency and Closing Skill Duration for one skill', () => {
    const state = fixture(['bliss', 'tide', 'sprout']);
    const [owner, first, second] = state.allies;
    owner.masterConduit = 'master-bliss-3';
    owner.native = {};
    first.spent = second.spent = true;
    const activation = prepareConduitAction(state, owner, 'ultimate', 100, true);
    nativeAction(state, owner, 'ultimate', state.enemies[0].id, [], () => {}, activation);
    expect(conduitActionCost(first, 'skill1', state, 100)).toBe(75);
    const nextSkill = prepareConduitAction(state, first, 'skill1', 75, false);
    expect(nextSkill.skillDuration).toBe(1);
    expect(conduitActionCost(first, 'skill2', state, 100)).toBe(100);
  });

  it('grants Vaelor Last Chord Skill Power to other allies, stronger on Crescendo', () => {
    const state = fixture(['vaelor', 'tide', 'sprout']);
    const [owner, first] = state.allies;
    owner.masterConduit = 'master-vaelor-1';
    owner.native = { beat: 2 };
    finishConduitAction(state, owner, prepareConduitAction(state, owner, 'ultimate', 100, false), []);
    expect(prepareConduitAction(state, first, 'skill1', 25, false).skillPower).toBeCloseTo(1.6);
  });

  it('grants Vaelor Tune or Crescendo critical bonuses for the next ally attack', () => {
    const state = fixture(['vaelor', 'tide', 'sprout']);
    const [owner, ally] = state.allies;
    owner.masterConduit = 'master-vaelor-3';
    owner.native = { beat: 0 };
    finishConduitAction(state, owner, prepareConduitAction(state, owner, 'light', 0, false), []);
    const tune = prepareConduitAction(state, ally, 'skill1', 25, false);
    expect(tune.criticalBonus).toBe(.25);
    const crescendo = fixture(['vaelor', 'tide', 'sprout']);
    const [crescendoOwner, crescendoAlly] = crescendo.allies;
    crescendoOwner.masterConduit = 'master-vaelor-3';
    crescendoOwner.native = { beat: 2 };
    finishConduitAction(crescendo, crescendoOwner, prepareConduitAction(crescendo, crescendoOwner, 'light', 0, false), []);
    const attack = prepareConduitAction(crescendo, crescendoAlly, 'skill1', 25, false);
    expect(conduitHitModifiers(crescendo, crescendoAlly, crescendo.enemies[0], attack, true).criticalDamageBonus).toBe(.4);
  });

  it('heals the most injured ally from actual Infernis Burn HP damage', () => {
    const state = fixture(['ember', 'tide', 'sprout']);
    const [owner, first] = state.allies;
    owner.masterConduit = 'master-ember-1';
    first.hp = 500;
    const target = state.enemies[0];
    target.burn = { damage: 100, turns: 1, sourceId: owner.id, origin: 'native' };
    afterConduitBurn(state, owner, target, 200, []);
    nativePhaseEnd(state, []);
    expect(first.hp).toBe(550);
  });

  it('grants Dawnfire Skill Power only against Infernis Burn targets', () => {
    const state = fixture(['ember', 'tide', 'sprout']);
    const [owner, ally] = state.allies;
    owner.masterConduit = 'master-ember-3';
    owner.native = {};
    state.enemies[0].burn = { damage: 10, turns: 2, sourceId: owner.id, origin: 'native' };
    const activation = prepareConduitAction(state, owner, 'ultimate', 100, false);
    finishConduitAction(state, owner, activation, []);
    const next = prepareConduitAction(state, ally, 'skill1', 25, false);
    expect(conduitHitModifiers(state, ally, state.enemies[0], next, false).skillPowerBonus).toBe(.4);
    expect(conduitHitModifiers(state, ally, state.enemies[1], next, false).skillPowerBonus).toBe(0);
  });

  it('applies Thornia trap Defense reduction and the first-trigger ally Shield', () => {
    const defenseState = fixture(['thornia', 'tide', 'sprout']);
    const [owner] = defenseState.allies;
    owner.masterConduit = 'master-thornia-1';
    expect(owner.kit?.nativeIdentity).toBe(true);
    defenseState.enemies[0].stats.defense = 100;
    defenseState.enemies[0].conduitRuntime!.numbers.entryDefense = 100;
    owner.native = { traps: { [defenseState.enemies[0].id]: { charges: 3, coefficient: .6, throughPhase: 2 } } };
    nativeEnemyCompleted(defenseState, defenseState.enemies[0], true, []);
    expect(owner.native.traps?.[defenseState.enemies[0].id]?.charges).toBe(2);
    expect(defenseState.enemies[0].conduitRuntime?.numbers.thorniaDefenseThrough).toBe(2);
    expect(nativeTargetDefense(defenseState, defenseState.enemies[0])).toBe(80);

    const shieldState = fixture(['thornia', 'tide', 'sprout']);
    const [thornia, recipient] = shieldState.allies;
    const enemy = shieldState.enemies[0];
    thornia.masterConduit = 'master-thornia-2';
    thornia.native = { traps: { [enemy.id]: { charges: 3, coefficient: .9, throughPhase: 2, empowered: true } } };
    const attack = { kind: 'damage' as const, source: enemy.id, target: recipient.id,
      amount: 10, critical: false, message: 'test attack' };
    nativeEnemyCompleted(shieldState, enemy, true, [attack]);
    expect(recipient.shield).toBe(120);
    expect(recipient.conduitRuntime?.layers?.[0].expiresAfterPhase).toBe(shieldState.round);
  });

  it('reduces trapped enemies’ Direct Damage to other allies and powers Thornia’s next skill', () => {
    const state = fixture(['thornia', 'tide', 'sprout']);
    const [thornia, ally] = state.allies;
    const enemy = state.enemies[0];
    thornia.masterConduit = 'master-thornia-3';
    thornia.native = { traps: { [enemy.id]: { charges: 3, coefficient: .6, throughPhase: 2 } } };
    const startingHp = ally.hp;
    conduitIncoming(state, enemy, ally, 100, false, false, [], 'light');
    expect(startingHp - ally.hp).toBe(85);
    nativeEnemyCompleted(state, enemy, true, []);
    expect(prepareConduitAction(state, thornia, 'skill1', 25, false).skillPower).toBe(1.2);
  });

  it('shares Razor Bastion Shields and applies Master Wound spend payoffs', () => {
    const bastionState = fixture(['razor', 'tide', 'sprout']);
    const [owner, ally] = bastionState.allies;
    owner.masterConduit = 'master-razor-2';
    owner.native = { bastion: { throughPhase: bastionState.round, loss: 100, skillPower: 1.2, skillDuration: 0 } };
    nativePhaseEnd(bastionState, []);
    expect(owner.shield).toBe(120);
    expect(ally.shield).toBe(48);
    expect(ally.conduitRuntime?.layers?.[0].expiresAfterPhase).toBe(bastionState.round);

    const healState = fixture(['razor', 'tide', 'sprout']);
    const [razor, first, second] = healState.allies;
    razor.masterConduit = 'master-razor-1';
    first.hp = 500;
    const wounds = prepareConduitAction(healState, razor, 'ultimate', 100, false);
    wounds.spent.wounds = 100;
    finishConduitAction(healState, razor, wounds, []);
    expect(first.hp).toBe(520);
    expect(second.hp).toBe(1000);

    const critState = fixture(['razor', 'tide', 'sprout']);
    const [razorCrit, critAlly] = critState.allies;
    razorCrit.masterConduit = 'master-razor-3';
    razorCrit.native = { wounds: 100 };
    const critActivation = prepareConduitAction(critState, razorCrit, 'skill1', 25, false);
    nativeAction(critState, razorCrit, 'skill1', critState.enemies[0].id, [], () => {}, critActivation);
    finishConduitAction(critState, razorCrit, critActivation, []);
    expect(prepareConduitAction(critState, critAlly, 'skill1', 25, false).criticalBonus).toBe(.3);
  });

  it('applies Survey Defense ignore and Master Crinso Last Flare Critical Damage', () => {
    const surveyState = fixture(['nerithe', 'tide', 'sprout']);
    const [nerithe, ally] = surveyState.allies;
    const enemy = surveyState.enemies[0];
    nerithe.masterConduit = 'master-nerithe-1';
    nerithe.native = { survey: { target: enemy.id, points: 3 } };
    enemy.conduitRuntime!.owners.chart = nerithe.id;
    const attack = prepareConduitAction(surveyState, ally, 'skill1', 25, false);
    expect(conduitHitModifiers(surveyState, ally, enemy, attack, false).pierce).toBeCloseTo(.3);
    expect(conduitHitModifiers(surveyState, ally, enemy,
      prepareConduitAction(surveyState, ally, 'light', 0, false), false).pierce).toBe(0);

    const crinsoState = fixture(['crinso', 'tide', 'sprout']);
    const [crinso, first] = crinsoState.allies;
    crinso.masterConduit = 'master-crinso-1';
    crinso.native = { edge: 'gold', combo: 2 };
    const flare = prepareConduitAction(crinsoState, crinso, 'ultimate', 100, false);
    nativeAction(crinsoState, crinso, 'ultimate', crinsoState.enemies[0].id, [], () => {}, flare);
    finishConduitAction(crinsoState, crinso, flare, []);
    const next = prepareConduitAction(crinsoState, first, 'light', 0, false);
    expect(next.criticalDamageBonus).toBe(.3);
    expect(prepareConduitAction(crinsoState, first, 'light', 0, false).criticalDamageBonus).toBe(0);
  });

  it('uses lodged Elise Shuriken charges and grants the Recall payoff only when both are recalled', () => {
    const state = fixture(['elise', 'tide', 'sprout']);
    const [elise, ally] = state.allies;
    const enemy = state.enemies[0];
    elise.masterConduit = 'master-elise-2';
    const firstShot = prepareConduitAction(state, elise, 'skill1', 25, false);
    nativeAction(state, elise, 'skill1', enemy.id, [], () => {}, firstShot);
    const power = prepareConduitAction(state, ally, 'skill1', 25, false);
    expect(conduitHitModifiers(state, ally, enemy, power, false).skillPowerBonus).toBe(.35);
    expect(power.skillPower).toBe(1);
    const noCharge = prepareConduitAction(state, ally, 'skill1', 25, false);
    expect(conduitHitModifiers(state, ally, enemy, noCharge, false).skillPowerBonus).toBe(0);
    expect(noCharge.skillPower).toBe(1);

    elise.masterConduit = 'master-elise-3';
    const secondShot = prepareConduitAction(state, elise, 'skill1', 25, false);
    nativeAction(state, elise, 'skill1', enemy.id, [], () => {}, secondShot);
    const recall = prepareConduitAction(state, elise, 'skill2', 40, false);
    nativeAction(state, elise, 'skill2', enemy.id, [], () => {}, recall);
    finishConduitAction(state, elise, recall, []);
    const next = prepareConduitAction(state, ally, 'light', 0, false);
    expect(next.criticalBonus).toBe(.15);
    expect(next.criticalDamageBonus).toBe(.4);
  });

  it('revives Phoenix Reactor at 35% and shields other living allies for one enemy turn', () => {
    const state = fixture();
    const [owner, first, second] = state.allies;
    owner.conduits = ['infernic-phoenix-reactor', null, null, null, null, null, null, null];
    owner.hp = 0;
    afterConduitHpLoss(state, owner, []);
    expect(owner.hp).toBe(350);
    expect(owner.shatter).toBe(0);
    expect(first.shield).toBe(150);
    expect(second.shield).toBe(150);
    expect(first.conduitRuntime?.layers?.[0].expiresAfterPhase).toBe(state.round);
  });

  it('grants Disciple Resolve Gauge to the other allies when consumed', () => {
    const state = fixture(['disciple', 'tide', 'sprout']);
    const [disciple, recipient, other] = state.allies;
    disciple.masterConduit = 'master-disciple-2';
    const instruction = { kind: 'resolve' as const, owner: disciple.id, throughRound: state.round };
    recipient.native = { instruction };
    recipient.shatter = other.shatter = 0;
    nativeAfterAction(state, recipient, 'skill1', instruction, []);
    expect(disciple.shatter).toBe(120);
    expect(recipient.shatter).toBe(0);
    expect(other.shatter).toBe(20);
  });

  it('converts full-health Kirin healing into Gauge and keeps the effect absent otherwise', () => {
    const state = fixture();
    const owner = state.allies[0];
    owner.conduits = ['tranquilitic-kirin-cradle', null, null, null, null, null, null, null];
    state.allies.forEach(ally => { ally.shatter = 0; });
    const result = act(state, owner.id, 'light', state.enemies[0].id).state;
    const missing = fixture();
    missing.allies.forEach(ally => { ally.shatter = 0; });
    const baseline = act(missing, missing.allies[0].id, 'light', missing.enemies[0].id).state;
    expect(result.allies[0].shatter - baseline.allies[0].shatter).toBe(16);
  });
});
