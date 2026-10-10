import { describe, expect, it } from 'vitest';
import { elementalEffectDescription, elementalEffectFamilies, sharedNativeEffects } from '../content/elemental-effects';
import { resolveFighter } from '../content/combat';
import { unitReadout } from '../presentation/unit-readout';
import { enemyDebuffs } from '../presentation/battle-status';
import { act, createBattle, endTurn, nextWave } from './battle';
import { debuffSnapshot } from './battle-debuffs';

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
      const actor = createBattle(7, [id]).allies[0];
      const markup = unitReadout(actor, true);
      expect(markup).toContain(elementalEffectFamilies[id === 'ember' ? 'burn' : id === 'tide' ? 'ward' : id === 'sprout' ? 'bloom' : 'tempest'].label);
    }
    expect(resolveFighter('rosetta').pilot).toBe('rose-grace');
    expect(resolveFighter('thornia').pilot).toBe('thorn-aegis');
    expect(resolveFighter('crinso').pilot).toBe('rose-duality');
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
    expect(resolveFighter('tide').pilot).toBe('ward');
  });

  it('renders one typed shared counter and keeps Conduit charges distinct', () => {
    const state = createBattle(7, ['ember']);
    const actor = state.allies[0];
    actor.pilot = { ember: 2 };
    actor.conduitCharges = { emberSeals: 1 };
    const readout = unitReadout(actor);
    expect(readout.match(/unit-kit-resource/g)).toHaveLength(1);
    expect(readout).toContain('Infernic Embers 2 / 3');
    expect(readout).toContain('Conduit Ember Seals 1/3');
    expect(readout).toContain('data-effect-family="burn"');
    expect(readout).toContain('living-self-authored-burn');
    expect(unitReadout({ ...actor, pilot: undefined }, true)).not.toContain('class="unit-kit-resource"');
  });

  it('leaves Aurora without a native pilot while retaining authored Weaken and no Precision bonus', () => {
    const state = createBattle(9, ['aurora']);
    state.enemies = [state.enemies[0]];
    state.enemies[0].hp = state.enemies[0].stats.health = 100_000;
    state.allies[0].shatter = 100;
    expect(state.allies[0].pilot).toBeUndefined();
    const applied = act(state, 'aurora', 'skill1', state.enemies[0].id);
    expect(applied.state.enemies[0].pilot).toBeUndefined();
    expect(applied.state.enemies[0].weakenFraction).toBe(.3);
    expect(applied.events.some((event) => event.elementalEffect?.family === 'focus')).toBe(false);
    const spent = act(endTurn(applied.state).state, 'aurora', 'skill2', state.enemies[0].id);
    expect(spent.state.enemies[0].pilot).toBeUndefined();
    expect(spent.state.allies[0].pilot).toBeUndefined();
    expect(spent.state.enemies[0].weakenFraction).toBe(.25);
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
    expect(next.allies[0].conduitCharges?.normalMomentum).toBe(true);
    expect(sharedNativeEffects.tempest.source).toBe('living-self-critical-direct-activation');
  });
});
