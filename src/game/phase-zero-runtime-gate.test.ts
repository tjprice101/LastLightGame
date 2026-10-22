import { describe, expect, it, vi } from 'vitest';

vi.mock('../content/phase-zero-stats', async importOriginal => ({
  ...await importOriginal<typeof import('../content/phase-zero-stats')>(),
  phaseZeroStatsReady: false,
}));

import { createBattle, act } from './battle';
import { calamiticConduits, calamiticEffect } from '../content/calamitic-conduits';
import { conduitRulesVersion, gear, initializeConduits, nativeGauge, prepareConduitAction,
  conduitActionCost } from './conduit-runtime';
import { nativeAction } from './native-kits';
import { calamiticNoLastFlareRecovery, calamiticSkillPowerBonus,
  calamiticSkillEfficiencyBonus } from './calamitic-conduits';

describe('Phase 0 runtime release gate', () => {
  it('keeps the historical session rules version until release', () => {
    expect(conduitRulesVersion).toBe(4);
  });

  it('preserves all five historical Calamitic descriptions', () => {
    expect(calamiticConduits.map(entry => calamiticEffect(entry.id))).toEqual([
      "Store 40% of enemy Direct Damage to HP suffered by living squad members. [Normal Attack] releases the reserve as a [Bonus Strike] against the healthiest enemy.",
      "Defer 40% of each enemy hit's Direct Damage to HP after [Shields]. The deferred damage is taken at the start of the next Enemy Turn, ignores [Shields] and can defeat you.",
      "40% of your Attack Actions' Direct Damage bypasses enemy [Shields]. While the target has a [Shield], your Attack Actions also gain +30% Direct Damage.",
      "Your first [Normal Attack] each player turn does not spend your action and lets you take one additional [Skill 1] or [Skill 2] that turn. Taking it grants 10 [Elemental Gauge], but you cannot act on the next player turn.",
      "Use three different action types in succession to complete the [Equation]. Repeating a type restarts the sequence with that action. The third action deals 120% of your Attack as [Bonus Strikes] split equally among enemies, then restarts the sequence.",
    ]);
  });

  it('ignores new player math, Cathedral auras and Causality recovery with the flag false', () => {
    const state = createBattle(1729, ['ember', 'tide', 'sprout']);
    const [actor, aura] = state.allies;
    actor.stats.skillPower = 20;
    actor.stats.skillDuration = 2;
    actor.stats.skillEfficiency = .5;
    actor.stats.gaugeGain = 20;
    actor.conduits = ['calamitic-causality-funeral-engine', null, null, null, null, null, null, null];
    aura.conduits = ['calamitic-cathedral-final-equation', null, null, null, null, null, null, null];
    const activation = prepareConduitAction(state, actor, 'skill1', 25, false);
    expect(activation.skillPower).toBe(1);
    expect(activation.skillDuration).toBe(0);
    expect(conduitActionCost(actor, 'skill1', state, 25)).toBe(25);
    expect(calamiticSkillPowerBonus(state)).toBe(0);
    expect(calamiticSkillEfficiencyBonus(state)).toBe(0);
    expect(calamiticNoLastFlareRecovery(actor)).toBe(false);
    actor.shatter = 0;
    nativeGauge(state, actor, 10, []);
    expect(actor.shatter).toBe(10);
  });

  it('preserves pre-receipt Clearwater overflow when Gauge is split through Disciple links', () => {
    const state = createBattle(1729, ['disciple', 'tide', 'sprout']);
    const [disciple, recipient, other] = state.allies;
    for (const ally of state.allies) {
      ally.stats.shatterCapacity = 200;
      ally.shatter = 0;
    }
    disciple.masterConduit = 'master-disciple-2';
    recipient.conduits = ['clearwater-manifold', null, null, null, null, null, null, null];
    initializeConduits(state);
    recipient.shatter = 195;
    gear(disciple).numbers.linkThrough = state.round;
    gear(recipient).owners.link = disciple.id;
    gear(disciple).owners.link = disciple.id;
    nativeGauge(state, recipient, 10, []);
    expect(recipient.shatter).toBe(200);
    expect(disciple.shatter).toBe(5);
    expect(other.shatter).toBe(2.5);
  });

  it('keeps legacy Flora and Razor native snapshots free of Phase 0 payload fields', () => {
    const floraState = createBattle(1729, ['sprout', 'tide']);
    const flora = floraState.allies[0];
    const activation = prepareConduitAction(floraState, flora, 'ultimate', 100, false);
    nativeAction(floraState, flora, 'ultimate', flora.id, [], () => {}, activation);
    for (const seed of Object.values(flora.native?.seeds ?? {}))
      expect(seed).not.toHaveProperty('empowered');
    const razorState = createBattle(1729, ['razor', 'tide']);
    const razor = razorState.allies[0];
    const bastion = prepareConduitAction(razorState, razor, 'skill2', 40, false);
    nativeAction(razorState, razor, 'skill2', razor.id, [], () => {}, bastion);
    expect(razor.native?.bastion).toEqual({ throughPhase: razorState.round, loss: 0 });
  });

  it('preserves actual damage when optional Phase 0 stats are populated but unreleased', () => {
    const baseline = createBattle(1729, ['ember', 'tide', 'sprout']);
    const pending = structuredClone(baseline);
    const actor = pending.allies[0];
    Object.assign(actor.stats, { skillPower: 10, skillDuration: 2, skillEfficiency: .5, gaugeGain: 10 });
    baseline.allies[0].shatter = actor.shatter = 100;
    const base = act(baseline, baseline.allies[0].id, 'skill1', baseline.enemies[0].id);
    const result = act(pending, actor.id, 'skill1', pending.enemies[0].id);
    expect(result.events).toEqual(base.events);
    expect(result.state.enemies).toEqual(base.state.enemies);
    expect(result.state.allies[0].shatter).toBe(base.state.allies[0].shatter);
  });
});
