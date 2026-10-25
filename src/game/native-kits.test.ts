import { describe, expect, it } from 'vitest';
import { act, createBattle, endTurn, damageAmount, nextWave, roll, elementalCritFactor, type BattleEvent, type BattleState, type Combatant } from './battle';
import { nativeAllocateFoundation, nativeForecast, nativeIncomingMultiplier, nativeRouteDamage, nativeDirectHpLoss,
  nativeAbsorbedHit, nativeReadout, nativeMarkers, nativeBurnPhase, nativeEnemyCompleted, nativePhaseEnd } from './native-kits';
import { nativeShield } from './conduit-runtime';
import { nativeBalance } from '../content/native-balance';

function encounter(...roster: string[]): BattleState {
  const state = createBattle(1729, roster);
  for (const ally of state.allies) { ally.shatter = 100; ally.stats.crit = 0; ally.stats.health = ally.hp = 1000; ally.stats.damage = 100; }
  for (const enemy of state.enemies) {
    enemy.stats.health = enemy.hp = 100000;
    enemy.stats.defense = 0; enemy.stats.damage = 20; enemy.stats.crit = 0;
    enemy.enemySkills = [{ name: 'Trial', every: 2, multiplier: 2, action: 'skill1' },
      { name: 'Final Trial', every: 6, multiplier: 3, action: 'ultimate' }];
  }
  return state;
}
function use(state: BattleState, actor: string, action: 'light' | 'skill1' | 'skill2' | 'ultimate', target = state.enemies[0].id) {
  const unit = state.allies.find(ally => ally.id === actor)!;
  unit.spent = false; unit.shatter = 100; unit.recoverThrough = 0;
  if (unit.conduitRuntime) unit.conduitRuntime.numbers.actions = 0;
  return act(state, actor, action, target);
}
const loss = (before: Combatant, after: Combatant) => before.hp - after.hp;

describe('sixteen native identities without equipment', () => {
  it('Infernis banks three fire phases, preserves stronger ticks, and detonates exactly two owned ticks', () => {
    let state = encounter('ember');
    const target = state.enemies[0].id;
    state = use(state, 'ember', 'skill1').state;
    expect(state.allies[0].native?.burns?.[target]).toEqual({ damage: 25, turns: 3 });
    expect(state.allies[0].pilot?.ember).toBeUndefined();
    const result = use(state, 'ember', 'skill2');
    expect(result.events.find(event => event.nativeKind === 'detonation')?.amount).toBe(50);
    expect(result.state.allies[0].native?.burns?.[target]?.turns).toBe(1);
    state = use(state, 'ember', 'ultimate').state;
    state = use(state, 'ember', 'skill1').state;
    expect(state.allies[0].native?.burns?.[target]).toEqual({ damage: 135, turns: 3 });
    const phase = endTurn(state);
    expect(phase.events.find(event => event.nativeKind === 'burn')?.amount).toBe(135);
  });

  it('Tizu explicitly shields one selected ally and expires it after the phase, with a non-damaging ultimate', () => {
    const state = encounter('tide', 'ember');
    expect(() => use(state, 'tide', 'skill2')).toThrow('living ally');
    const shield = use(state, 'tide', 'skill2', 'ember');
    expect(shield.state.allies.map(unit => unit.shield)).toEqual([0, 1000 * nativeBalance.tizu.shelter]);
    expect(state.allies[1].shield).toBe(0);
    expect(endTurn(shield.state).state.allies[1].shield).toBe(0);
    const ultimate = use(state, 'tide', 'ultimate');
    expect(ultimate.events.filter(event => event.kind === 'damage')).toHaveLength(0);
    expect(ultimate.state.allies.map(unit => unit.shield)).toEqual([1000 * nativeBalance.tizu.oceanMemory, 1000 * nativeBalance.tizu.oceanMemory]);
  });

  it('Tizu grants eight Gauge for every absorbed native hit', () => {
    const state = encounter('tide', 'ember');
    state.allies[1].shatter = 0;
    const events: Parameters<typeof nativeAbsorbedHit>[4] = [];
    nativeAbsorbedHit(state, state.allies[1], new Map([['tide', 20]]), 0, events);
    nativeAbsorbedHit(state, state.allies[1], new Map([['tide', 20]]), 0, events);
    expect(state.allies[1].shatter).toBe(16);
    expect(events.filter(event => event.amount === 8)).toHaveLength(2);
  });

  it('Flora empty harvest heals nothing; normal seeds deliver next turn and do not downgrade empowered ones', () => {
    let state = encounter('sprout', 'ember');
    state.allies.forEach(unit => unit.hp = 500);
    const plant = use(state, 'sprout', 'skill2');
    expect(plant.events.filter(event => event.kind === 'heal')).toHaveLength(0);
    const delivery = endTurn(plant.state);
    state = delivery.state;
    expect(delivery.events.filter(event => event.kind === 'heal').map(event => event.amount)).toEqual([1000 * nativeBalance.flora.seed, 1000 * nativeBalance.flora.seed]);
    state = use(state, 'sprout', 'ultimate').state;
    state = use(state, 'sprout', 'skill1').state;
    expect(Object.values(state.allies[0].native?.seeds ?? {}).every(pending => pending.fraction === nativeBalance.flora.empoweredSeed)).toBe(true);
  });

  it('Flora cannot deliver seeds while dead or revive their dead recipients', () => {
    const state = use(encounter('sprout', 'ember'), 'sprout', 'skill2').state;
    state.allies[0].hp = 0;
    state.allies[1].hp = 500;
    const next = endTurn(state);
    expect(next.events.some(event => event.kind === 'heal' && event.source === 'sprout')).toBe(false);
  });

  it('Atmoso charges from other allies once per turn and releases after exactly two phases', () => {
    let state = use(encounter('atmoso', 'ember', 'tide'), 'atmoso', 'skill2').state;
    state = use(state, 'ember', 'light').state;
    state = use(state, 'ember', 'light').state;
    state = use(state, 'tide', 'light').state;
    expect(state.allies[0].native?.cyclone?.gusts).toBe(2);
    const first = endTurn(state);
    expect(first.events.some(event => event.nativeKind === 'cyclone')).toBe(false);
    const second = endTurn(first.state);
    expect(second.events.filter(event => event.nativeKind === 'cyclone').map(event => event.amount)).toEqual([130, 130, 130]);
    expect(second.state.allies[0].native?.cyclone).toBeUndefined();
  });

  it('Atmoso recasting releases the actual old field and starts from zero, while solo early release works', () => {
    let state = use(encounter('atmoso'), 'atmoso', 'skill2').state;
    const recast = use(state, 'atmoso', 'skill2');
    expect(recast.events.filter(event => event.nativeKind === 'cyclone')[0].amount).toBe(70);
    expect(recast.state.allies[0].native?.cyclone?.gusts).toBe(0);
    state = use(recast.state, 'atmoso', 'skill1').state;
    expect(state.allies[0].native?.cyclone).toBeUndefined();
  });

  it('Elise concentrated blades add one convergence strike and roll one critical outcome per strike', () => {
    let state = encounter('elise');
    state = use(state, 'elise', 'skill1').state;
    state = use(state, 'elise', 'skill1').state;
    const expected = structuredClone(state);
    for (let hit = 0; hit < 3; hit++) roll(expected);
    const recall = use(state, 'elise', 'skill2');
    expect(recall.events.filter(event => event.nativeKind === 'recall').map(event => event.amount)).toEqual([
      damageAmount(100, .9, 0, false), damageAmount(100, .9, 0, false), damageAmount(100, .6, 0, false),
    ]);
    expect(recall.events.filter(event => event.nativeKind === 'recall').every(event => !event.critical)).toBe(true);
    expect(recall.state.seed).toBe(expected.seed);
    expect(recall.state.allies[0].native?.blades).toEqual([null, null]);
    const fallback = use(recall.state, 'elise', 'skill2');
    expect(fallback.events.find(event => event.kind === 'damage')?.amount).toBe(damageAmount(100, 1.4 * nativeBalance.skillDamageScale, 0, false));
  });

  it('Elise split placement recalls independently and defeated targets return blades harmlessly', () => {
    let state = encounter('elise', 'ember');
    state = use(state, 'elise', 'skill1').state;
    state = use(state, 'elise', 'skill1', state.enemies[1].id).state;
    const split = use(state, 'elise', 'skill2');
    expect(split.events.filter(event => event.nativeKind === 'recall')).toHaveLength(2);
    state.enemies[0].hp = 1;
    state = use(state, 'ember', 'light').state;
    expect(state.allies[0].native?.blades?.[0]).toBeNull();
  });

  it('Bliss opening buffs remaining allies, closing heals another ally, and solo never closes', () => {
    const opening = use(encounter('bliss', 'ember'), 'bliss', 'skill2');
    expect(opening.state.allies.every(unit => unit.attackBoost?.fraction === .1)).toBe(true);
    let state = encounter('bliss', 'ember');
    state.allies[1].hp = 500;
    state = use(state, 'ember', 'light').state;
    const closing = use(state, 'bliss', 'skill1');
    expect(closing.state.allies[1].hp).toBe(560);
    const solo = use(encounter('bliss'), 'bliss', 'skill2');
    expect(solo.state.allies[0].shield).toBe(0);
  });

  it('Bruno covers only a selected other ally and reduces redirected damage without a second Defense roll', () => {
    const state = use(encounter('bruno', 'ember', 'tide'), 'bruno', 'skill2', 'ember').state;
    const routed: number[] = [];
    const remainder = nativeRouteDamage(state, state.enemies[0], state.allies[1], 100, [], (_, amount) => routed.push(amount));
    expect(remainder).toBe(50);
    expect(routed).toEqual([37.5]);
    expect(nativeRouteDamage(state, state.enemies[0], state.allies[2], 100, [], () => {})).toBe(100);
    expect(() => use(state, 'bruno', 'skill2', 'bruno')).toThrow('another living ally');
    const solo = use(encounter('bruno'), 'bruno', 'skill2', 'bruno');
    expect(solo.state.allies[0].native?.reduction?.fraction).toBe(.2);
  });

  it('Disciple Strike enhances only the recipients next action; Shelter is a separate support instruction', () => {
    let state = encounter('disciple', 'ember', 'tide');
    state = use(state, 'disciple', 'skill1', 'ember').state;
    const strike = use(state, 'ember', 'light');
    expect(strike.events.find(event => event.kind === 'damage')?.amount).toBe(130);
    expect(strike.state.allies[1].native?.instruction).toBeUndefined();
    state = use(state, 'disciple', 'skill2', 'tide').state;
    state = use(state, 'tide', 'skill2', 'ember').state;
    expect(state.allies[1].shield).toBe(1000 * nativeBalance.tizu.shelter * 1.35);
    expect(state.allies[2].native?.instruction).toBeUndefined();
  });

  it('Disciple self-instruction survives its granting action and wrong action type consumes it without benefit', () => {
    let state = use(encounter('disciple', 'ember'), 'disciple', 'skill1', 'disciple').state;
    expect(state.allies[0].native?.instruction?.kind).toBe('strike');
    const defense = use(state, 'disciple', 'light');
    expect(defense.state.allies[0].native?.instruction).toBeUndefined();
    state = use(state, 'disciple', 'skill2', 'ember').state;
    const strike = use(state, 'ember', 'light');
    expect(strike.events.find(event => event.kind === 'damage')?.amount).toBe(100);
  });

  it('Aurora ignores Normal Attacks, seals the whole special activation, and forecasts exact schedules', () => {
    const state = use(encounter('aurora', 'ember'), 'aurora', 'skill1').state;
    const enemy = state.enemies[0];
    expect(nativeIncomingMultiplier(state, enemy, state.allies[1], 'light', [])).toBe(1);
    expect(state.allies[0].native?.seals?.[enemy.id]).toBeDefined();
    delete enemy.native;
    expect(nativeIncomingMultiplier(state, enemy, state.allies[1], 'skill1', [])).toBe(.6);
    expect(nativeIncomingMultiplier(state, enemy, state.allies[1], 'skill1', [])).toBe(.6);
    expect(state.allies[0].native?.seals?.[enemy.id]).toBeUndefined();
    expect(nativeForecast(state, state.allies[0])[0]).toContain('enemy phase 2');
  });

  it('Aurora retains the stronger Seal, and ultimate ward applies only to hostile ultimates', () => {
    let state = use(encounter('aurora'), 'aurora', 'skill1').state;
    state = use(state, 'aurora', 'skill2').state;
    expect(state.allies[0].native?.seals?.[state.enemies[0].id]?.fraction).toBe(.4);
    state = use(state, 'aurora', 'ultimate').state;
    delete state.allies[0].native!.seals;
    expect(nativeIncomingMultiplier(state, state.enemies[0], state.allies[0], 'skill1', [])).toBe(1);
    delete state.enemies[0].native;
    expect(nativeIncomingMultiplier(state, state.enemies[0], state.allies[0], 'ultimate', [])).toBe(.25);
  });

  it('Razor banks all actual direct HP loss and spends every Wound on revenge', () => {
    const state = encounter('razor');
    nativeDirectHpLoss(state, state.allies[0], 500, []);
    expect(state.allies[0].native?.wounds).toBe(500);
    const small = use(state, 'razor', 'skill1');
    expect(small.state.allies[0].native?.wounds).toBe(0);
    expect(small.events.find(event => event.nativeKind === 'revenge')?.amount).toBe(500);
    const large = use(state, 'razor', 'ultimate');
    expect(large.state.allies[0].native?.wounds).toBe(0);
    expect(large.events.find(event => event.nativeKind === 'revenge')?.amount).toBe(3000);
  });

  it('Razor defensive stance shields only actual phase HP loss, and has no automatic team protection', () => {
    let state = use(encounter('razor', 'ember'), 'razor', 'skill2').state;
    nativeDirectHpLoss(state, state.allies[0], 200, []);
    const phase = endTurn(state);
    expect(phase.state.allies[0].shield).toBeGreaterThanOrEqual(200);
    expect(phase.state.allies[1].shield).toBe(0);
  });

  it('Rosetta requires distinct allies, not repeated hits, and marks before her own contribution', () => {
    let state = use(encounter('rosetta', 'ember', 'tide'), 'rosetta', 'skill1').state;
    expect(state.allies[0].native?.quarry?.contributors).toEqual(['rosetta']);
    state = use(state, 'rosetta', 'light').state;
    expect(state.allies[0].shield).toBe(0);
    state = use(state, 'ember', 'light').state;
    expect(state.allies.map(unit => unit.shield)).toEqual([80, 80, 0]);
    const cash = use(state, 'rosetta', 'skill2');
    expect(cash.events.find(event => event.kind === 'damage')?.amount).toBe(damageAmount(100, 2.25 * nativeBalance.skillDamageScale, 0, false));
  });

  it('Rosetta changing quarry clears contributors while same-target marking retains them', () => {
    let state = use(encounter('rosetta', 'ember'), 'rosetta', 'skill1').state;
    state = use(state, 'ember', 'light').state;
    state = use(state, 'rosetta', 'skill1').state;
    expect(state.allies[0].native?.quarry?.contributors).toHaveLength(2);
    state = use(state, 'rosetta', 'skill1', state.enemies[1].id).state;
    expect(state.allies[0].native?.quarry?.contributors).toEqual(['rosetta']);
  });

  it('Thornia plants without damage, retaliates once per hostile activation, or spends a charge immediately', () => {
    let state = use(encounter('thornia'), 'thornia', 'skill1').state;
    expect(state.enemies[0].hp).toBe(100000);
    const phase = endTurn(state);
    expect(phase.events.filter(event => event.nativeKind === 'trap')).toHaveLength(1);
    expect(phase.state.allies[0].native?.traps?.[state.enemies[0].id]?.charges).toBe(2);
    const harvest = use(state, 'thornia', 'skill2');
    expect(harvest.events.find(event => event.nativeKind === 'trap')?.amount).toBe(80);
    expect(harvest.state.allies[0].native?.traps?.[state.enemies[0].id]?.charges).toBe(2);
  });

  it('Thornia stronger empowered traps survive ordinary refreshes', () => {
    let state = use(encounter('thornia'), 'thornia', 'ultimate').state;
    state = use(state, 'thornia', 'skill1').state;
    expect(state.allies[0].native?.traps?.[state.enemies[0].id]).toMatchObject({ charges: 3, coefficient: 2.7, empowered: true });
    expect(nativeMarkers(state, state.enemies[0]).find(marker => marker.id === 'trap')?.label).toBe('Empowered Thorn Trap');
  });

  it('Thornia Skill1 stays a normal trap even when Skill Power raises its coefficient above empowered base damage', () => {
    const initial = encounter('thornia');
    initial.allies[0].stats.skillPower = 5;
    const state = use(initial, 'thornia', 'skill1').state;
    const trap = state.allies[0].native?.traps?.[state.enemies[0].id];
    expect(trap).toMatchObject({ charges: 3, coefficient: 3, empowered: false });
    expect(nativeMarkers(state, state.enemies[0]).find(marker => marker.id === 'trap'))
      .toMatchObject({ label: 'Thorn Trap', icon: 'native-thornia-trap' });
    expect(nativeReadout(state, state.allies[0]).find(row => row.label === 'Thorn Trap')?.icons)
      .toEqual(['native-thornia-trap']);
  });

  it('Crinso alternates four edges for Combo3, repeats reset, and never authors Burn', () => {
    let state = encounter('crinso');
    for (const action of ['skill1', 'skill2', 'skill1', 'skill2'] as const) state = use(state, 'crinso', action).state;
    expect(state.allies[0].native).toMatchObject({ edge: 'crimson', combo: 3 });
    expect(state.enemies.every(enemy => enemy.burn.turns === 0)).toBe(true);
    const ultimate = use(state, 'crinso', 'ultimate');
    expect(ultimate.events.find(event => event.kind === 'damage')?.amount).toBe(damageAmount(100, 3.95 * nativeBalance.skillDamageScale * 3, 0, false));
    expect(ultimate.state.allies[0].native).toMatchObject({ combo: 0 });
    expect(ultimate.state.allies[0].native?.edge).toBeUndefined();
    const repeated = use(state, 'crinso', 'skill2');
    expect(repeated.state.allies[0].native?.combo).toBe(0);
  });

  it('Crinso Normal/Defense preserves combination and alternate Gold pierces effective Defense', () => {
    let state = use(encounter('crinso'), 'crinso', 'skill2').state;
    state = use(state, 'crinso', 'light').state;
    state.enemies[0].stats.defense = 100;
    const gold = use(state, 'crinso', 'skill1');
    expect(gold.events.find(event => event.kind === 'damage')?.amount).toBe(damageAmount(100, 1.6 * nativeBalance.skillDamageScale, 80, false));
  });

  it('Nerithe normals gain fixed extra five, survey one target, move points, then spend precise pierce', () => {
    let state = encounter('nerithe');
    state.allies[0].shatter = 0;
    const normal = act(state, 'nerithe', 'light', state.enemies[0].id);
    expect(normal.events.find(event => event.kind === 'damage')?.amount).toBe(damageAmount(100, 1, 0, false));
    state = normal.state;
    expect(state.allies[0].shatter).toBe(25);
    state = use(state, 'nerithe', 'light').state;
    expect(state.allies[0].native?.survey?.points).toBe(2);
    state = use(state, 'nerithe', 'skill2', state.enemies[1].id).state;
    expect(state.allies[0].native?.survey).toEqual({ target: state.enemies[1].id, points: 2 });
    state.enemies[1].stats.defense = 100;
    const pierce = use(state, 'nerithe', 'skill1');
    expect(pierce.events.find(event => event.kind === 'damage')?.target).toBe(state.enemies[1].id);
    expect(pierce.events.find(event => event.kind === 'damage')?.amount).toBe(damageAmount(100, 1.8 * nativeBalance.skillDamageScale, 75, false));
    expect(pierce.state.allies[0].native?.survey?.points).toBe(1);
  });

  it('Nerithe switching survey through Normal resets to one, unlike moving an existing designation', () => {
    let state = use(encounter('nerithe'), 'nerithe', 'light').state;
    state = use(state, 'nerithe', 'light', state.enemies[1].id).state;
    expect(state.allies[0].native?.survey?.points).toBe(1);
  });

  it('Orvella has one shared Foundation, repairs past its starting durability, and demolishes with all of it', () => {
    let state = encounter('orvella', 'ember');
    const bare = use(state, 'orvella', 'skill1');
    expect(bare.events.find(event => event.kind === 'damage')?.amount).toBe(damageAmount(100, 1.8 * nativeBalance.skillDamageScale, 0, false));
    state = use(state, 'orvella', 'skill2').state;
    const remainder = nativeRouteDamage(state, state.enemies[0], state.allies[1], 100, [], () => {});
    expect(remainder).toBe(80);
    expect(state.allies[0].native?.foundation?.durability).toBe(280);
    state = use(state, 'orvella', 'skill1').state;
    expect(state.allies[0].native?.foundation?.durability).toBe(360);
    const demolition = use(state, 'orvella', 'ultimate');
    expect(demolition.events.filter(event => event.nativeKind === 'demolition').map(event => event.amount)).toEqual([1080, 1080, 1080]);
    expect(demolition.state.allies[0].native?.foundation).toBeUndefined();
  });

  it('Foundation simultaneous allocation is proportional with stable remainder and exact budget', () => {
    expect(nativeAllocateFoundation(25, [100, 200, 100])).toEqual([7, 12, 6]);
    expect(nativeAllocateFoundation(100, [100, 200, 100])).toEqual([20, 40, 20]);
    expect(nativeAllocateFoundation(25, [0, 0])).toEqual([0, 0]);
  });

  it('Vaelor beats advance through recovery; Rise prepares next-turn Crescendo without forcing action restrictions', () => {
    let state = encounter('vaelor');
    expect(nativeReadout(state, state.allies[0]).find(row => row.label === 'Beat')?.value).toBe('Tune');
    state = endTurn(state).state;
    expect(state.allies[0].native?.beat).toBe(1);
    state = use(state, 'vaelor', 'skill2').state;
    expect(state.allies[0].attackBoost).toMatchObject({ fraction: .2, throughRound: 3 });
    state = endTurn(state).state;
    const crescendo = use(state, 'vaelor', 'ultimate');
    expect(crescendo.events.find(event => event.kind === 'damage')?.amount).toBe(damageAmount(100, 3.4 * nativeBalance.skillDamageScale * 1.2 * 3, 0, false));
    expect(crescendo.state.allies[0].recoverThrough).toBe(4);
    state = endTurn(crescendo.state).state;
    expect(state.allies[0].native?.beat).toBe(0);
  });

  it('fresh Training encounters reset identity state and preserve preexisting carryover resources', () => {
    const state = use(encounter('crinso'), 'crinso', 'skill1').state;
    state.phase = 'cleared';
    const next = nextWave(state);
    expect(next.state.allies[0].native?.edge).toBeUndefined();
  });

  it('support cancellation/invalid targeting does not mutate state or spend Gauge', () => {
    const state = encounter('disciple', 'ember');
    const before = structuredClone(state);
    expect(() => act(state, 'disciple', 'skill1', 'unknown')).toThrow();
    expect(state).toEqual(before);
  });
});

describe('critical hits from every native damage path', () => {
  const cases = [
    { character: 'ember', kind: 'detonation', action: 'skill2' },
    { character: 'elise', kind: 'recall', action: 'skill2' },
    { character: 'razor', kind: 'revenge', action: 'skill1' },
    { character: 'orvella', kind: 'demolition', action: 'ultimate' },
    { character: 'thornia', kind: 'trap', action: 'skill2' },
    { character: 'atmoso', kind: 'cyclone', action: 'skill1' },
    { character: 'ember', kind: 'burn' },
    { character: 'thornia', kind: 'retaliation' },
    { character: 'atmoso', kind: 'delayed-cyclone' },
  ] as const;

  function run(entry: typeof cases[number], rate: number) {
    const state = encounter(entry.character);
    const owner = state.allies[0], enemy = state.enemies[0];
    owner.stats.crit = rate;
    owner.stats.critMultiplier = 2;
    owner.native = {
      burns: { [enemy.id]: { damage: 40, turns: 3 } },
      blades: [enemy.id, enemy.id], wounds: 40,
      foundation: { durability: 40, maximum: 40, throughPhase: state.round + 2 },
      traps: { [enemy.id]: { charges: 3, coefficient: .6, throughPhase: state.round + 2 } },
      cyclone: { gusts: 2, phases: 1, contributors: {}, skillPower: 1 },
    };
    enemy.burn = { damage: 40, turns: 3, sourceId: owner.id, origin: 'native' };
    const events: BattleEvent[] = [];
    if ('action' in entry) return use(state, owner.id, entry.action).events.filter(event => event.nativeKind === entry.kind);
    if (entry.kind === 'burn') nativeBurnPhase(state, enemy, events);
    if (entry.kind === 'retaliation') nativeEnemyCompleted(state, enemy, true, events);
    if (entry.kind === 'delayed-cyclone') nativePhaseEnd(state, events);
    return events.filter(event => event.kind === 'damage' && event.origin === 'native');
  }

  it.each(cases)('$kind uses its owner’s Critical Rate, multiplier and Elemental Crit overflow', entry => {
    const normal = run(entry, 0);
    expect(normal.length).toBeGreaterThan(0);
    expect(normal.every(event => !event.critical)).toBe(true);
    for (const rate of [1, 2]) {
      const critical = run(entry, rate);
      expect(critical).toHaveLength(normal.length);
      critical.forEach((event, index) => {
        expect(event.critical).toBe(true);
        expect(event.elementalCritical).toBe(rate === 2);
        expect(event.amount).toBe(Math.round(normal[index].amount * 2 * (rate === 2 ? elementalCritFactor : 1)));
      });
      expect(run(entry, rate)).toEqual(critical);
    }
  });

  it('critically hits with captured-kit Burn but does not make Conduit Burn critical', () => {
    for (const origin of ['native', 'conduit'] as const) {
      const state = encounter('ember');
      const source = state.allies[0], enemy = state.enemies[0];
      source.captured = { instanceId: 'capture:native-burn', creatureId: 'infusion:roses:0', locked: false };
      source.stats.crit = 1;
      source.stats.critMultiplier = 2;
      enemy.burn = { damage: 40, turns: 2, sourceId: source.id, origin };
      const result = endTurn(state);
      const tick = result.events.find(event => event.kind === 'damage' && event.periodic && event.source === source.id);
      expect(tick).toMatchObject({ amount: origin === 'native' ? 80 : 40, critical: origin === 'native', origin });
    }
  });
});
