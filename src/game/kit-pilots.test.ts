import { describe, expect, it } from 'vitest';
import { elementalEffectDescription, elementalEffectFamilies, sharedNativeEffects } from '../content/elemental-effects';
import { resolveFighter } from '../content/combat';
import { unitReadout } from '../presentation/unit-readout';
import { enemyDebuffs } from '../presentation/battle-status';
import { act, createBattle, endTurn, nextWave } from './battle';
import { debuffSnapshot } from './battle-debuffs';
import { pilotAfterDirectActivation, pilotAuthoredShieldAbsorbed, pilotBurnDamage,
  pilotEffectiveHeal, pilotOutgoingBonus, pilotPrepareStarter } from './kit-pilots';
import type { KitPilot } from '../content/kit-pilots';
import type { StarterId } from '../content/starters';

function historical(id: StarterId, pilot: KitPilot) {
  const state = createBattle(7, [id]);
  const actor = state.allies[0];
  delete actor.kit!.nativeIdentity;
  actor.kit!.pilot = pilot;
  delete actor.native;
  return { state, actor };
}

describe('shared elemental effect descriptors and snapshots', () => {
  it('uses thematic display names while preserving family and resource IDs', () => {
    expect(Object.fromEntries(Object.entries(elementalEffectFamilies).map(([id, effect]) => [id, effect.label]))).toEqual({
      burn: 'Infernic Embers',
      ward: 'Oceanic Protection',
      bloom: 'Botanic Renewal',
      tempest: 'Atmospheric Charge',
      focus: 'Tranquilitic Focus',
      suppression: 'Chaotic Suppression',
    });
    for (const id of ['ember', 'tide', 'sprout', 'atmoso'] as const) {
      const pilot = id === 'ember' ? 'ember' : id === 'tide' ? 'ward' : id === 'sprout' ? 'bloom' : 'tempest';
      const { actor } = historical(id, pilot);
      const markup = unitReadout(actor, true);
      expect(markup).toContain(elementalEffectFamilies[id === 'ember' ? 'burn' : id === 'tide' ? 'ward' : id === 'sprout' ? 'bloom' : 'tempest'].label);
    }
    for (const id of ['rosetta', 'thornia', 'crinso'] as const) {
      expect(resolveFighter(id).pilot).toBeUndefined();
      expect(resolveFighter(id).nativeIdentity).toBe(true);
    }
  });
  it('maps all six effect families to their canonical element without altering combatant affinity', () => {
    expect(Object.fromEntries(Object.entries(elementalEffectFamilies).map(([family, entry]) => [family, entry.element]))).toEqual({
      burn: 'infernic',
      ward: 'oceanic',
      bloom: 'botanic',
      tempest: 'atmospheric',
      focus: 'tranquilitic',
      suppression: 'chaotic',
    });
    expect(resolveFighter('aurora').stats.crit).toBe(.12);
    expect(resolveFighter('tide').pilot).toBeUndefined();
  });

  it('renders one typed shared counter and keeps Conduit charges distinct', () => {
    const { actor } = historical('ember', 'ember');
    actor.pilot = { ember: 2 };
    actor.conduitCharges = { emberSeals: 1 };
    const readout = unitReadout(actor);
    expect(readout.match(/unit-kit-resource/g)).toHaveLength(1);
    expect(readout).toContain('Infernic Embers 2');
    expect(readout).not.toContain('2 / 3');
    expect(readout).not.toContain('Conduit Ember Seals');
    expect(readout).toContain('data-effect-family="burn"');
    expect(readout).toContain('living-self-authored-burn');
    expect(unitReadout({ ...actor, pilot: undefined }, true)).not.toContain('class="unit-kit-resource"');
  });

  it('Aurora replaces old Weaken with a non-damaging Seal and never earns a shared Focus bank', () => {
    const state = createBattle(9, ['aurora']);
    state.enemies = [state.enemies[0]];
    state.enemies[0].hp = state.enemies[0].stats.health = 100_000;
    state.allies[0].shatter = 100;
    expect(state.allies[0].pilot).toBeUndefined();
    const applied = act(state, 'aurora', 'skill1', state.enemies[0].id);
    expect(applied.state.enemies[0].pilot).toBeUndefined();
    expect(applied.state.enemies[0].weakened).toBe(0);
    expect(applied.events.some(event => event.kind === 'damage')).toBe(false);
    expect(applied.state.allies[0].native?.seals?.[state.enemies[0].id]?.fraction).toBe(.4);
    expect(applied.events.some((event) => event.elementalEffect?.family === 'focus')).toBe(false);
    const spent = act(endTurn(applied.state).state, 'aurora', 'skill2', state.enemies[0].id);
    expect(spent.state.enemies[0].pilot).toBeUndefined();
    expect(spent.state.allies[0].pilot).toBeUndefined();
    expect(spent.state.enemies[0].weakened).toBe(0);
    expect(spent.state.allies[0].native?.seals?.[state.enemies[0].id]?.fraction).toBe(.4);
  });

  it('tags currently active Burn, Weaken, and Conduit Fracture snapshots by precise effect and origin', () => {
    const state = createBattle(13, ['crinso']);
    const target = state.enemies[0];
    target.burn = { damage: 9, turns: 2, sourceId: 'crinso', origin: 'rose' };
    target.weakened = 2;
    target.weakenFraction = .25;
    target.conduitMarks = { crinso: 1 };
    const snapshot = debuffSnapshot(target);
    expect(snapshot.elementalEffects).toEqual([
      { family: 'burn', kind: 'burn', origin: 'rose', source: 'living-self-authored-burn' },
      { family: 'suppression', kind: 'weaken', origin: 'native', source: 'authored-weaken' },
      { family: 'suppression', kind: 'fracture', origin: 'conduit', source: 'conduit-fracture-mark' },
    ]);
    expect(elementalEffectDescription(snapshot.elementalEffects![2])).toContain('conduit');
    expect(enemyDebuffs(snapshot)).toContain('data-effect-family="suppression"');
  });

  it('does not reset independent Conduit charges when fresh native state is reset for the next wave', () => {
    const state = createBattle(17, ['atmoso']);
    state.allies[0].pilot = { tempest: 2 };
    state.allies[0].conduitCharges = { normalMomentum: true };
    state.enemies.forEach((enemy) => { enemy.hp = 0; });
    state.phase = 'cleared';
    const next = nextWave(state).state;
    expect(next.allies[0].pilot).toBeUndefined();
    expect(next.allies[0].conduitCharges?.normalMomentum).toBeUndefined();
    expect(sharedNativeEffects.tempest.source).toBe('living-self-critical-direct-activation');
  });
});

describe('explicit legacy pilot helpers for historical snapshots', () => {
  it.each([
    ['ember', 'ember', 'ember'], ['crinso', 'rose-duality', 'duality'],
  ] as const)('%s old Burn earnings are owner-bound and uncapped', (id, pilot, resource) => {
    const { state, actor } = historical(id, pilot);
    const events: Parameters<typeof pilotBurnDamage>[3] = [];
    pilotBurnDamage(state, actor, 0, events);
    expect(actor.pilot).toBeUndefined();
    for (let phase = 0; phase < 5; phase++) {
      state.round = phase + 1;
      pilotBurnDamage(state, actor, 10, events);
      pilotBurnDamage(state, actor, 10, events);
    }
    expect(actor.pilot?.[resource]).toBe(10);
    const before = structuredClone(actor.pilot);
    actor.hp = 0;
    pilotBurnDamage(state, actor, 10, events);
    expect(actor.pilot).toEqual(before);
  });

  it.each([
    ['tide', 'ward', 'ward'], ['thornia', 'thorn-aegis', 'thornAegis'],
  ] as const)('%s old shield earnings require its own effective absorption', (id, pilot, resource) => {
    const { state, actor } = historical(id, pilot);
    const events: Parameters<typeof pilotAuthoredShieldAbsorbed>[3] = [];
    pilotAuthoredShieldAbsorbed(state, 'unrelated', 10, events);
    pilotAuthoredShieldAbsorbed(state, actor.id, 0, events);
    expect(actor.pilot).toBeUndefined();
    pilotAuthoredShieldAbsorbed(state, actor.id, 10, events);
    pilotAuthoredShieldAbsorbed(state, actor.id, 10, events);
    expect(actor.pilot?.[resource]).toBe(2);
    state.round++;
    pilotAuthoredShieldAbsorbed(state, actor.id, 10, events);
    expect(actor.pilot?.[resource]).toBe(3);
  });

  it('old Flora/Rosetta healing counts every effective heal and rejects captures', () => {
    for (const [id, pilot, resource] of [['sprout', 'bloom', 'bloom'], ['rosetta', 'rose-grace', 'roseGrace']] as const) {
      const { state, actor } = historical(id, pilot);
      const events: Parameters<typeof pilotEffectiveHeal>[4] = [];
      pilotEffectiveHeal(state, actor, actor, 0, events);
      expect(actor.pilot).toBeUndefined();
      pilotEffectiveHeal(state, actor, actor, 10, events);
      pilotEffectiveHeal(state, actor, actor, 10, events);
      expect(actor.pilot?.[resource]).toBe(2);
      state.round++;
      actor.captured = { instanceId: 'capture:legacy', creatureId: 'infusion:roses:0', locked: false };
      pilotEffectiveHeal(state, actor, actor, 10, events);
      expect(actor.pilot?.[resource]).toBe(2);
    }
  });

  it('old Bliss self-healing cannot charge Bloom and old starter spend multipliers stay bounded', () => {
    const { state, actor } = historical('bliss', 'bloom');
    const events: Parameters<typeof pilotEffectiveHeal>[4] = [];
    pilotEffectiveHeal(state, actor, actor, 10, events);
    expect(actor.pilot).toBeUndefined();
    pilotEffectiveHeal(state, actor, { ...actor, id: 'another-living-ally' }, 10, events);
    expect(actor.pilot?.bloom).toBe(1);
    actor.pilot = { bloom: 3 };
    expect(pilotPrepareStarter(actor, 'skill1', events).damage).toBe(.24);
    expect(actor.pilot.bloom).toBe(0);
    const flora = historical('sprout', 'bloom').actor;
    flora.pilot = { bloom: 3 };
    expect(pilotPrepareStarter(flora, 'ultimate', []).healing).toBeCloseTo(1.45);
    const tizu = historical('tide', 'ward').actor;
    tizu.pilot = { ward: 3 };
    expect(pilotPrepareStarter(tizu, 'skill1', []).weaken).toBeCloseTo(.15);
  });

  it('old Tempest spends before earning once per activation and no ultimate or ineffective hit earns', () => {
    const { actor } = historical('atmoso', 'tempest');
    const events: Parameters<typeof pilotAfterDirectActivation>[2] = [];
    actor.pilot = { tempest: 3 };
    expect(pilotOutgoingBonus(actor, 'skill1', events)).toBe(.24);
    expect(actor.pilot.tempest).toBe(0);
    pilotAfterDirectActivation(actor, 'skill1', events, true);
    expect(actor.pilot.tempest).toBe(1);
    pilotAfterDirectActivation(actor, 'ultimate', events, true);
    pilotAfterDirectActivation(actor, 'light', events, false);
    expect(actor.pilot.tempest).toBe(1);
    actor.pilot.tempest = 3;
    expect(pilotOutgoingBonus(actor, 'ultimate', events)).toBe(.36);
    expect(actor.pilot.tempest).toBe(0);
  });
});
