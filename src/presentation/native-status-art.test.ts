import { describe, expect, it } from 'vitest';
import type { StarterId } from '../content/starters';
import { statusArt, type StatusArtId } from '../content/status-art';
import { nativeBalance } from '../content/native-balance';
import { createBattle, type BattleState } from '../game/battle';
import { createCreatureCopy } from '../game/character-instances';
import { nativeReadout, type NativeKitState } from '../game/native-kits';
import { nativeStateReadout } from './native-kit-presentation';
import { unitReadout } from './unit-readout';

function fixture(id: StarterId, native: NativeKitState = {}) {
  const ids = [id, 'ember', 'tide'].filter((value, index, all) => all.indexOf(value) === index);
  const state = createBattle(7, ids);
  state.allies[0].native = native;
  return state;
}

function check(state: BattleState, expected: readonly StatusArtId[]) {
  const actor = state.allies[0];
  const before = structuredClone(state);
  expect(nativeReadout(state, actor).flatMap(row => row.icons ?? [])).toEqual(expected);
  for (const compact of [false, true]) {
    const html = unitReadout(actor, compact, state.allies, state.round, state);
    for (const id of expected) expect(html).toContain(`data-status-art="${id}"`);
    expect(html.match(/class="status-icon"/g)).toHaveLength(expected.length);
    expect(html).toContain('aria-label="Native battle state"');
  }
  expect(state).toEqual(before);
}

describe('delivered native identity status art', () => {
  it('covers all 27 delivered identities using typed state, not description text', () => {
    const seen = new Set<StatusArtId>();
    const verify = (state: BattleState, icons: readonly StatusArtId[]) => {
      check(state, icons);
      icons.forEach(icon => seen.add(icon));
    };
    const flora = fixture('sprout');
    flora.allies[0].native!.seeds = {
      sprout: { fraction: nativeBalance.flora.seed, dueRound: 2 },
      ember: { fraction: nativeBalance.flora.empoweredSeed, dueRound: 2 },
    };
    verify(flora, ['native-flora-seed', 'native-flora-empowered-seed']);
    verify(fixture('atmoso', { cyclone: { gusts: 3, phases: 2, contributors: {} } }), ['native-atmoso-cyclone']);
    const elise = fixture('elise');
    elise.allies[0].native!.blades = [null, elise.enemies[0].id];
    verify(elise, ['native-elise-held-blade', 'native-elise-lodged-blade']);
    const bliss = fixture('bliss');
    verify(bliss, ['native-bliss-opening']);
    bliss.allies[1].spent = true;
    verify(bliss, ['native-bliss-passing']);
    bliss.allies[2].spent = true;
    verify(bliss, ['native-bliss-closing']);
    for (const kind of ['strike', 'shelter', 'resolve'] as const)
      verify(fixture('disciple', { instruction: { kind, owner: 'disciple', throughRound: 2 } }), [`native-disciple-${kind}`]);
    const aurora = fixture('aurora', { ultimateWardThrough: 2 });
    aurora.allies[0].native!.seals = { [aurora.enemies[0].id]: { fraction: .25, throughPhase: 3 } };
    verify(aurora, ['native-aurora-ultimate-ward', 'native-aurora-seal']);
    verify(fixture('razor', { wounds: 12, bastion: { throughPhase: 2, loss: 4 } }), ['native-razor-wounds', 'native-razor-bastion']);
    const rosetta = fixture('rosetta');
    rosetta.allies[0].native!.quarry = { target: rosetta.enemies[0].id, round: 1, contributors: ['ember'] };
    verify(rosetta, ['native-rosetta-quarry']);
    for (const [coefficient, icon] of [[.6, 'native-thornia-trap'], [.9, 'native-thornia-empowered-trap']] as const) {
      const thornia = fixture('thornia');
      thornia.allies[0].native!.traps = { [thornia.enemies[0].id]: { coefficient, charges: 3, throughPhase: 3,
        empowered: icon === 'native-thornia-empowered-trap' } };
      verify(thornia, [icon]);
    }
    for (const edge of ['gold', 'crimson'] as const)
      verify(fixture('crinso', { combo: 2, edge }), ['native-crinso-combo', `native-crinso-${edge}-edge`]);
    const nerithe = fixture('nerithe');
    nerithe.allies[0].native!.survey = { target: nerithe.enemies[0].id, points: 2 };
    verify(nerithe, ['native-nerithe-survey']);
    verify(fixture('orvella', { foundation: { durability: 40, maximum: 100, throughPhase: 3 } }), ['native-orvella-foundation']);
    for (const [beat, icon] of [[0, 'native-vaelor-tune'], [1, 'native-vaelor-rise'], [2, 'native-vaelor-crescendo']] as const)
      verify(fixture('vaelor', { beat }), [icon]);
    verify(fixture('bruno', { cover: { targets: ['ember'], fraction: .5, throughPhase: 2 } }), ['native-bruno-cover']);
    expect([...seen].sort()).toEqual(Object.keys(statusArt).filter(id => id.startsWith('native-')).sort());
  });

  it('retains target, values and clocks; removes inactive icons without state mutations', () => {
    const state = fixture('razor', { wounds: 12, bastion: { throughPhase: 1, loss: 4 } });
    expect(nativeStateReadout(state, state.allies[0])).toContain('Wounds: 12');
    expect(nativeStateReadout(state, state.allies[0])).toContain('Through enemy phase 1');
    state.round = 2;
    check(state, ['native-razor-wounds']);
    state.allies[0].hp = 0;
    expect(nativeStateReadout(state, state.allies[0])).toBe('');
    const aura = fixture('aurora', { ultimateWardThrough: 1 });
    aura.round = 2;
    expect(nativeStateReadout(aura, aura.allies[0])).not.toContain('native-aurora-ultimate-ward');
    const seed = fixture('sprout', { seeds: { ember: { fraction: .5, dueRound: 2 } } });
    const html = nativeStateReadout(seed, seed.allies[0]);
    expect(html).toContain('Seed: 50%');
    expect(html).toContain(`${seed.allies[1].name}: player turn 2`);
  });

  it('does not assign native art to equipment, missing mechanics or unreached variants', () => {
    const state = fixture('crinso');
    check(state, ['native-crinso-combo']);
    const actor = state.allies[0];
    actor.captured = createCreatureCopy('infusion:heavens:0');
    expect(nativeStateReadout(state, actor)).toBe('');
    const empty = fixture('sprout');
    expect(nativeStateReadout(empty, empty.allies[0])).toBe('');
  });
});
