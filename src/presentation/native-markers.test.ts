import { describe, expect, it } from 'vitest';
import { nativeBalance } from '../content/native-balance';
import { actAndAdvanceTurn, createBattle, type BattleState } from '../game/battle';
import { nativeMarkers, type NativeKitState } from '../game/native-kits';
import { unitReadout } from './unit-readout';

function encounter(...roster: string[]): BattleState {
  const state = createBattle(7, roster);
  state.enemies = [state.enemies[0]];
  state.allies.forEach(unit => { unit.shatter = 100; unit.stats.crit = 0; unit.stats.damage = 100; unit.hp = unit.stats.health = 1000; });
  Object.assign(state.enemies[0].stats, { health: 100_000, defense: 0, damage: 0, crit: 0 });
  state.enemies[0].hp = 100_000;
  return state;
}

const readout = (state: BattleState, id: string) =>
  unitReadout([...state.allies, ...state.enemies].find(unit => unit.id === id)!, true, state.allies, state.round, state);

describe('native statuses on the units they affect (D-339)', () => {
  it('shows Seeds, Cover and Foundation on recipient allies, not duplicated on the owner card', () => {
    const state = encounter('sprout', 'ember', 'tide');
    state.allies[0].native = { seeds: { ember: { fraction: nativeBalance.flora.seed, dueRound: 2 },
      tide: { fraction: nativeBalance.flora.empoweredSeed, dueRound: 2 } } };
    expect(readout(state, 'ember')).toContain('data-status-art="native-flora-seed"');
    expect(readout(state, 'ember')).toContain('on player turn 2');
    expect(readout(state, 'tide')).toContain('data-status-art="native-flora-empowered-seed"');
    expect(readout(state, 'sprout')).not.toContain('data-native-marker');
    const bruno = encounter('bruno', 'ember');
    bruno.allies[0].native = { cover: { targets: ['ember'], fraction: .5, throughPhase: 1 } };
    expect(readout(bruno, 'ember')).toContain('data-status-art="native-bruno-cover"');
    bruno.round = 2;
    expect(readout(bruno, 'ember')).not.toContain('native-bruno-cover');
  });

  it('shows Traps, Seals, lodged blades, Survey and Quarry on the enemy they target', () => {
    const cases: [string, (enemy: string) => NativeKitState, string][] = [
      ['thornia', enemy => ({ traps: { [enemy]: { charges: 2, coefficient: .6, throughPhase: 3 } } }), 'native-thornia-trap'],
      ['aurora', enemy => ({ seals: { [enemy]: { fraction: .4, throughPhase: 3 } } }), 'native-aurora-seal'],
      ['elise', enemy => ({ blades: [enemy, null] }), 'native-elise-lodged-blade'],
      ['nerithe', enemy => ({ survey: { target: enemy, points: 2 } }), 'native-nerithe-survey'],
      ['rosetta', enemy => ({ quarry: { target: enemy, round: 1, contributors: [] } }), 'native-rosetta-quarry'],
    ];
    for (const [id, native, icon] of cases) {
      const state = encounter(id, 'ember');
      const enemy = state.enemies[0].id;
      state.allies[0].native = native(enemy);
      expect(readout(state, enemy)).toContain(`data-status-art="${icon}"`);
      state.enemies[0].hp = 0;
      expect(nativeMarkers(state, state.enemies[0])).toEqual([]);
    }
  });

  it('playback snapshots show a Seed planted by the last actor before it is delivered next turn', () => {
    const state = encounter('ember', 'sprout');
    state.allies[0].spent = true;
    state.allies[1].hp = 600;
    const result = actAndAdvanceTurn(state, 'sprout', 'skill1', state.enemies[0].id);
    const turn = result.events.findIndex(event => event.kind === 'turn');
    expect(turn).toBeGreaterThan(0);
    const planted = result.events.slice(0, turn).filter(event => event.nativeView?.units.sprout?.seeds?.sprout);
    expect(planted.length).toBeGreaterThan(0);
    expect(result.events[turn].nativeView?.units.sprout?.seeds ?? {}).toEqual({});
    expect(result.events.some(event => event.kind === 'heal' && event.target === 'sprout')).toBe(true);
  });
});
