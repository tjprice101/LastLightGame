import { describe, expect, it } from 'vitest';
import { act, actionUnavailable, createBattle, damageAmount, endTurn, nextWave, type BattleEvent, type BattleState } from './battle';
import { resolveFighter, type ActionId } from '../content/combat';
import { conduitIncoming, generatedStrike, nativeShield, refreshConduitStats } from './conduit-runtime';
import { nativeBurnPhase, nativeCleanup, nativeDamageTakenMultiplier, nativeHymn, nativeMarkers, nativeMemory,
  nativePhaseEnd, nativeReadout, nativeRefusal, nativeTurnStart } from './native-kits';
import { abilityIcon } from '../presentation/ability-icon';
import { abilityStatuses } from '../presentation/ability-status';
import { nativeMarkerReadout } from '../presentation/native-kit-presentation';
import { attackFlair } from '../presentation/battle-effects';

function encounter(...roster: string[]): BattleState {
  const state = createBattle(1729, roster);
  for (const ally of state.allies) {
    ally.shatter = ally.stats.shatterCapacity;
    ally.stats.crit = 0;
    ally.hp = ally.stats.health = 1000;
    ally.stats.damage = 100;
    ally.stats.defense = 0;
  }
  for (const enemy of state.enemies) {
    enemy.hp = enemy.stats.health = 100000;
    enemy.stats.defense = 0;
    enemy.stats.damage = 10;
    enemy.stats.crit = 0;
  }
  return state;
}
function use(state: BattleState, actor: string, action: ActionId, target = state.enemies[0].id) {
  const unit = state.allies.find(ally => ally.id === actor)!;
  unit.spent = false;
  unit.shatter = unit.stats.shatterCapacity;
  unit.recoverThrough = 0;
  return act(state, actor, action, target);
}
const damage = (events: BattleEvent[], source: string) => events.filter(event => event.kind === 'damage' && event.source === source);

describe('owner-authored Calamitic native kits', () => {
  it('applies own passive stats multiplicatively and preserves them through conduit stat refresh', () => {
    const ozriel = resolveFighter('ozriel'), ilvaris = resolveFighter('ilvaris'), kaelith = resolveFighter('kaelith');
    expect(ozriel.stats.health).toBeCloseTo(345 * 1.65);
    expect(ozriel.stats.defense).toBeCloseTo(24 * 1.65);
    expect(ilvaris.stats.health).toBe(265 * 3);
    expect(ilvaris.stats.defense).toBe(16 * 2);
    expect(kaelith.stats.skillPower).toBe(1.75);
    for (const id of ['ozriel', 'ilvaris', 'kaelith'] as const)
      expect(resolveFighter(id, { level: 110, evolution: 6 }).nativeIdentity).toBe(true);
    const state = createBattle(1729, ['ozriel', 'ilvaris', 'kaelith']);
    const before = state.allies.map(unit => ({ ...unit.stats }));
    refreshConduitStats(state);
    expect(state.allies.map(unit => unit.stats)).toEqual(before);
  });

  it('Refusal saves each living member once per encounter, including Ozriel, without RNG or revival', () => {
    const state = encounter('ozriel', 'ember', 'tide');
    const events: BattleEvent[] = [];
    const seed = state.seed;
    for (const member of state.allies) {
      member.hp = 100;
      conduitIncoming(state, state.enemies[0], member, 10000, false, false, events);
      expect(member.hp).toBe(1);
    }
    expect(state.allies[0].native?.refusalUsed).toEqual(['ozriel', 'ember', 'tide']);
    expect(state.seed).toBe(seed);
    conduitIncoming(state, state.enemies[0], state.allies[1], 10000, false, false, events);
    expect(state.allies[1].hp).toBe(0);
    expect(nativeRefusal(state, state.allies[1], 10, events)).toBe(10);
    expect(state.allies[1].hp).toBe(0);
    expect(nativeReadout(state, state.allies[0]).filter(row => row.label === 'Refusal').map(row => row.value)).toEqual(['Used', 'Used', 'Used']);
    expect(events.some(event => event.message.includes('Refusal used') && event.nativeView?.units.ozriel.refusalUsed)).toBe(true);
  });

  it('Refusal is unavailable while Ozriel is defeated, and does not spend on a shield-absorbed hit', () => {
    const state = encounter('ozriel', 'ember');
    const [ozriel, ally] = state.allies;
    nativeShield(state, ozriel, ally, 1000, [], { stack: true });
    ally.hp = 100;
    conduitIncoming(state, state.enemies[0], ally, 500, false, false, []);
    expect(ally.hp).toBe(100);
    expect(ozriel.native?.refusalUsed).toBeUndefined();
    ozriel.hp = 0;
    conduitIncoming(state, state.enemies[0], ally, 10000, false, false, []);
    expect(ally.hp).toBe(0);
  });

  it('Refusal use survives Ozriel falling and any independent restoration within the encounter', () => {
    const state = encounter('ozriel', 'ember');
    const [ozriel, ally] = state.allies;
    expect(nativeRefusal(state, ally, 10000, [])).toBe(999);
    ozriel.hp = 0;
    nativeCleanup(state);
    expect(ozriel.native?.refusalUsed).toEqual(['ember']);
    ozriel.hp = 100;
    expect(nativeRefusal(state, ally, 10000, [])).toBe(10000);
    expect(nativeRefusal(state, ozriel, 10000, [])).toBe(99);
  });

  it('Pane of Absolution deals 240% damage and applies 50% Weaken for exactly two enemy phases', () => {
    const result = use(encounter('ozriel'), 'ozriel', 'skill1');
    expect(damage(result.events, 'ozriel')[0].amount).toBe(240);
    expect(result.state.enemies[0].weakenFraction).toBe(.5);
    expect(result.state.enemies[0].weakened).toBe(2);
    const one = endTurn(result.state).state;
    expect(one.enemies[0].weakened).toBe(1);
    expect(endTurn(one).state.enemies[0].weakened).toBe(0);
  });

  it('Cathedral and The World Refuses shield every living ally, stack uncapped, and never expire', () => {
    let state = encounter('ozriel', 'ember', 'tide');
    state.allies[2].hp = 0;
    state = use(state, 'ozriel', 'skill2').state;
    state = use(state, 'ozriel', 'skill2').state;
    expect(state.allies.map(ally => ally.shield)).toEqual([180, 180, 0]);
    const flare = use(state, 'ozriel', 'ultimate');
    expect(damage(flare.events, 'ozriel').map(event => event.amount)).toEqual([455, 455, 455]);
    expect(flare.state.allies.map(ally => ally.shield)).toEqual([320, 320, 0]);
    for (let round = 1; round <= 20; round++) { flare.state.round = round; nativePhaseEnd(flare.state, []); }
    expect(flare.state.allies.map(ally => ally.shield)).toEqual([320, 320, 0]);
    expect(flare.state.allies[0].conduitRuntime?.layers?.every(layer => !('throughPhase' in layer))).toBe(true);
  });

  it('Fate-seared Mark stacks to five, refreshes two phases, and combines 10% per stack with Severed Prophecy', () => {
    let state = encounter('ilvaris', 'ember');
    const target = state.enemies[0].id;
    for (let cast = 1; cast <= 7; cast++) {
      state = use(state, 'ilvaris', 'skill1').state;
      const stacks = Math.min(5, cast);
      expect(state.allies[0].native?.fateMarks?.[target]).toEqual({ stacks, throughPhase: 2 });
      expect(nativeDamageTakenMultiplier(state, state.allies[1], state.enemies[0])).toBeCloseTo((1 + stacks * .1) * 1.45);
    }
    const hit = use(state, 'ember', 'light');
    expect(damage(hit.events, 'ember')[0].amount).toBe(damageAmount(100, 1.5 * 1.45, 0, false));
    state.round = 2;
    state = use(state, 'ilvaris', 'skill1').state;
    expect(state.allies[0].native?.fateMarks?.[target]?.throughPhase).toBe(3);
    nativePhaseEnd(state, []);
    expect(state.allies[0].native?.fateMarks?.[target]?.stacks).toBe(5);
    state.round = 3;
    nativePhaseEnd(state, []);
    expect(state.allies[0].native?.fateMarks?.[target]).toBeUndefined();
    expect(nativeDamageTakenMultiplier(state, state.allies[1], state.enemies[0])).toBe(1);
  });

  it('Mark damage-taken bonuses apply once to native Burn and generated damage, retaining source ownership', () => {
    let state = encounter('ilvaris', 'ember');
    state = use(state, 'ilvaris', 'skill1').state;
    state = use(state, 'ember', 'skill1').state;
    const events: BattleEvent[] = [];
    nativeBurnPhase(state, state.enemies[0], events);
    expect(damage(events, 'ember')[0].amount).toBe(Math.round(25 * 1.1 * 1.45));
    const before = state.enemies[0].hp;
    generatedStrike(state, state.allies[1], state.enemies[0], 100, []);
    expect(before - state.enemies[0].hp).toBe(Math.round(100 * 1.1 * 1.45));
    state.allies[0].hp = 0;
    nativeCleanup(state);
    expect(nativeDamageTakenMultiplier(state, state.allies[1], state.enemies[0])).toBeCloseTo(1.1 * 1.45);
  });

  it('Hymn heals on every cast and refreshes, not stacks or self-amplifies, its two-turn buff', () => {
    let state = encounter('ilvaris', 'ember', 'tide');
    state.allies.forEach(ally => ally.hp = 100);
    state.allies[2].hp = 0;
    const first = use(state, 'ilvaris', 'skill2');
    state = first.state;
    expect(state.allies.map(ally => ally.hp)).toEqual([450, 450, 0]);
    expect(state.allies[1].native?.hymn).toEqual({ owner: 'ilvaris', throughRound: 2, criticalDamage: .45, skillPower: .5 });
    expect(state.allies[2].native?.hymn).toBeUndefined();
    state.round = 2;
    const repeat = use(state, 'ilvaris', 'skill2');
    state = repeat.state;
    expect(damage(repeat.events, 'ilvaris')).toEqual([]);
    expect(state.allies[1].hp).toBe(975);
    expect(state.allies[1].native?.hymn).toEqual({ owner: 'ilvaris', throughRound: 3, criticalDamage: .45, skillPower: .5 });
    expect(nativeHymn(state.allies[1], 3)).toBeTruthy();
    state.round = 4;
    nativeTurnStart(state, []);
    expect(state.allies[1].native?.hymn).toBeUndefined();
  });

  it('Hymn adds Skill Power to damage and support, and multiplies existing critical damage by 1.45', () => {
    let state = encounter('ilvaris', 'ember', 'tide');
    state = use(state, 'ilvaris', 'skill2').state;
    state.allies[1].stats.crit = 1;
    state.allies[1].stats.critMultiplier = 2;
    const result = use(state, 'ember', 'skill1');
    expect(damage(result.events, 'ember')[0].amount).toBe(Math.round(100 * 1.6 * 1.6 * 1.5 * 2 * 1.45));
    const shield = use(state, 'tide', 'skill2', 'ember').state;
    expect(shield.allies[1].shield).toBeCloseTo(1000 * .45 * 1.5);
    expect(state.allies[1].stats.skillEfficiency).toBeLessThanOrEqual(.5);
  });

  it('Tomorrow, Unwritten deals 440% AoE, heals 50% only living allies, and gives 10% capacity Gauge', () => {
    const state = encounter('ilvaris', 'ember', 'tide');
    state.allies.forEach(ally => ally.hp = 100);
    state.allies[1].stats.shatterCapacity = 200;
    state.allies[1].shatter = 10;
    state.allies[2].hp = 0;
    state.allies[2].shatter = 0;
    const flare = use(state, 'ilvaris', 'ultimate');
    expect(damage(flare.events, 'ilvaris').map(event => event.amount)).toEqual([440, 440, 440]);
    expect(flare.state.allies.map(ally => ally.hp)).toEqual([600, 600, 0]);
    expect(flare.state.allies[1].shatter).toBe(30);
    expect(flare.state.allies[2].shatter).toBe(0);
  });

  it('Kaelith direct hits build Faults to three, granting the entire squad 10% per stack', () => {
    let state = encounter('kaelith', 'ember');
    for (let count = 1; count <= 5; count++) {
      const hit = use(state, 'kaelith', 'light');
      expect(damage(hit.events, 'kaelith')[0].amount).toBe(Math.round(100 * (1 + Math.min(3, count - 1) * .1)));
      state = hit.state;
      expect(state.allies[0].native?.faults?.[state.enemies[0].id]).toBe(Math.min(3, count));
    }
    const allied = use(state, 'ember', 'light');
    expect(damage(allied.events, 'ember')[0].amount).toBe(130);
    const area = use(state, 'kaelith', 'skill1');
    expect(damage(area.events, 'kaelith').map(event => event.amount)).toEqual([Math.round(456 * 1.75 * 1.3), 798, 798]);
    expect(Object.values(area.state.allies[0].native?.faults ?? {})).toEqual([3, 1, 1]);
  });

  it('Glass Meridian spends the prior Faults for +20% each and leaves no Fault after its own direct hit', () => {
    const state = encounter('kaelith');
    nativeMemory(state.allies[0]).faults = { [state.enemies[0].id]: 3, [state.enemies[1].id]: 2 };
    const result = use(state, 'kaelith', 'skill2');
    expect(damage(result.events, 'kaelith')[0].amount).toBe(Math.round(365 * 1.75 * 1.6 * 1.3));
    expect(result.state.allies[0].native?.faults?.[state.enemies[0].id]).toBeUndefined();
    expect(result.state.allies[0].native?.faults?.[state.enemies[1].id]).toBe(2);
    expect(result.events.some(event => event.message.includes('consumes 3 Faults'))).toBe(true);
  });

  it('Kaelith Skills use the existing crit roll with five extra percentage points, not a new RNG stream', () => {
    const base = encounter('kaelith');
    const skill = use(base, 'kaelith', 'skill2');
    const normal = use(base, 'kaelith', 'light');
    expect(skill.state.seed).toBe(normal.state.seed);
    base.allies[0].stats.crit = .95;
    expect(damage(use(base, 'kaelith', 'skill2').events, 'kaelith')[0].critical).toBe(true);
    expect(damage(use(base, 'kaelith', 'skill2').events, 'kaelith')[0].elementalCritical).not.toBe(true);
  });

  it.each(['ozriel', 'ilvaris', 'kaelith'])('%s Last Flare retains the next-turn Recover contract', id => {
    const state = encounter(id);
    if (id === 'kaelith') nativeMemory(state.allies[0]).faults = Object.fromEntries(state.enemies.map(enemy => [enemy.id, 3]));
    const result = use(state, id, 'ultimate');
    expect(result.state.allies[0].recoverThrough).toBe(2);
    if (id === 'kaelith') {
      expect(damage(result.events, id).map(event => event.amount)).toEqual([819, 819, 819]);
      expect(Object.values(result.state.allies[0].native?.faults ?? {})).toEqual([3, 3, 3]);
    }
    const recovering = endTurn(result.state).state;
    expect(actionUnavailable(recovering, recovering.allies[0], 'light')).toMatch(/recover/i);
    expect(endTurn(recovering).state.allies[0].recoverThrough).toBe(2);
  });

  it('resets bounded native memories on a new encounter, with readable icon-free statuses', () => {
    let state = encounter('ozriel', 'ilvaris', 'kaelith');
    state = use(state, 'ilvaris', 'skill1').state;
    state = use(state, 'ilvaris', 'skill2').state;
    state = use(state, 'kaelith', 'light').state;
    nativeMemory(state.allies[0]).refusalUsed = ['ozriel'];
    expect(nativeMarkers(state, state.enemies[0]).map(marker => marker.label)).toEqual(['Fate-seared Mark', 'Fault']);
    expect(nativeMarkerReadout(state, state.enemies[0])).toContain('Fault');
    expect(nativeMarkerReadout(state, state.enemies[0])).not.toContain('<img');
    expect(nativeMarkerReadout(state, state.allies[0])).toContain('Used this encounter');
    expect(nativeMarkerReadout(state, state.allies[0])).toContain('Hymn of Broken Glass');
    for (const id of ['ozriel', 'ilvaris', 'kaelith'] as const) {
      expect(abilityIcon(id, 'passive')).toBe('');
      expect(abilityIcon(id, 'skill1')).toBe('');
      expect(abilityStatuses({}, id, 'passive')).not.toContain('<img');
      const unit = state.allies.find(ally => ally.id === id)!;
      unit.evolution = 6;
      unit.level = 110;
      expect(attackFlair(unit, 'ultimate').power).toBeLessThanOrEqual(1);
    }
    state.enemies.forEach(enemy => enemy.hp = 0);
    state.phase = 'cleared';
    const next = nextWave(state).state;
    expect(next.allies.every(ally => Object.keys(ally.native ?? {}).length === 0)).toBe(true);
  });
});
