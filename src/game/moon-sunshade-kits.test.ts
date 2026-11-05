import { describe, expect, it } from 'vitest';
import { act, createBattle, type BattleEvent, type BattleState } from './battle';
import {
  nativeAuthoredShieldAbsorbed, nativeDirectHpLoss, nativeEnemyCompleted, nativeIncomingMultiplier,
  nativeTurnStart,
} from './native-kits';

function encounter(...roster: string[]): BattleState {
  const state = createBattle(1729, roster);
  for (const ally of state.allies) {
    ally.stats.health = ally.hp = 1000;
    ally.stats.damage = 100;
    ally.stats.skillPower = 1;
    ally.stats.crit = 0;
    ally.shatter = 100;
  }
  for (const enemy of state.enemies) {
    enemy.stats.health = enemy.hp = 100_000;
    enemy.stats.defense = 0;
    enemy.stats.damage = 100;
    enemy.stats.crit = 0;
  }
  return state;
}

function use(state: BattleState, actorId: string, action: 'light' | 'skill1' | 'skill2' | 'ultimate',
  targetId = state.enemies[0].id) {
  const actor = state.allies.find(ally => ally.id === actorId)!;
  actor.spent = false;
  actor.shatter = 100;
  actor.recoverThrough = 0;
  actor.readyRound.skill1 = 0;
  actor.readyRound.skill2 = 0;
  actor.readyRound.ultimate = 0;
  return act(state, actorId, action, targetId);
}

function directEnemyAttack(enemyId: string, targetId: string): BattleEvent[] {
  return [
    { kind: 'attack', source: enemyId, target: targetId, amount: 0, critical: false, message: 'Test attack.' },
    { kind: 'damage', source: enemyId, target: targetId, amount: 0, shieldAbsorbed: 100, critical: false, message: 'Absorbed.' },
  ];
}

describe('Moon and Sunshade native combat loops', () => {
  it.each(['burn', 'weaken'] as const)('Ilyss removes the chosen %s while preserving the other application', choice => {
    const state = encounter('ilyss', 'ember');
    const ally = state.allies[1];
    ally.hp = 100;
    ally.burn = { damage: 25, turns: 2, sourceId: 'enemy-a', origin: 'native' };
    ally.weakened = 2;
    ally.weakenFraction = .25;
    ally.weakenSourceId = 'enemy-b';
    ally.weakenOrigin = 'native';
    const before = structuredClone(state);
    const result = act(state, 'ilyss', 'skill2', ally.id, choice);
    const healed = result.state.allies[1];
    expect(healed.burn).toEqual(choice === 'weaken' ? before.allies[1].burn :
      { damage: 0, turns: 0, sourceId: '', origin: 'native' });
    expect(healed.weakened).toBe(choice === 'burn' ? 2 : 0);
    if (choice === 'burn') expect(healed.weakenSourceId).toBe('enemy-b');
    expect(result.state.allies[0].native?.severance).toBe(1);
    expect(healed.hp).toBeGreaterThan(100);
    expect(state).toEqual(before);
    expect(result.state.seed).toBe(state.seed);
    expect(() => act(state, 'ilyss', 'skill2', ally.id)).toThrow('Choose Burn or Weaken');
  });

  it('rejects forged choices before any action, healing, clocks or RNG change', () => {
    const state = encounter('ilyss', 'ember');
    const before = structuredClone(state);
    for (const request of [
      ['ilyss', 'skill2', 'ember', 'invalid'],
      ['ember', 'skill2', 'ilyss', 'burn'],
      ['ilyss', 'skill1', state.enemies[0].id, 'burn'],
      ['ilyss', 'skill2', 'ember', 'weaken'],
    ] as const) {
      expect(() => act(state, request[0], request[1], request[2], request[3] as never)).toThrow();
      expect(state).toEqual(before);
    }
  });

  it('automatically removes a single status and keeps Last Flare Burn-first one-application priority', () => {
    for (const only of ['burn', 'weaken'] as const) {
      const state = encounter('ilyss', 'ember');
      const ally = state.allies[1];
      if (only === 'burn') ally.burn = { damage: 1, turns: 2 };
      else { ally.weakened = 2; ally.weakenFraction = .25; }
      const result = act(state, 'ilyss', 'skill2', 'ember');
      expect(result.state.allies[1].burn.turns).toBe(0);
      expect(result.state.allies[1].weakened).toBe(0);
    }
    const state = encounter('ilyss', 'ember');
    state.allies[1].burn = { damage: 1, turns: 2 };
    state.allies[1].weakened = 2;
    const result = act(state, 'ilyss', 'ultimate', state.enemies[0].id);
    expect(result.state.allies[1].burn.turns).toBe(0);
    expect(result.state.allies[1].weakened).toBe(2);
  });

  it.each(['master-ilyss-1', 'master-ilyss-2', 'master-ilyss-3'] as const)(
    '%s pays its actual removal predicate for either chosen status', master => {
      for (const choice of ['burn', 'weaken'] as const) {
        const state = encounter('ilyss', 'ember');
        const owner = state.allies[0], ally = state.allies[1];
        owner.masterConduit = master;
        owner.native = { ...owner.native, severance: 3 };
        ally.hp = 100;
        ally.burn = { damage: 1, turns: 2, sourceId: 'enemy-a', origin: 'native' };
        ally.weakened = 2;
        ally.weakenFraction = .25;
        ally.weakenSourceId = 'enemy-b';
        const result = act(state, 'ilyss', 'skill2', ally.id, choice);
        expect(result.state.allies[0].native?.severance).toBe(master === 'master-ilyss-1' ? 4 : 3);
        if (master === 'master-ilyss-2') expect(result.state.allies[1].shield).toBeGreaterThan(0);
        if (master === 'master-ilyss-3')
          expect(result.state.allies[1].native?.skillPowerBuff).toMatchObject({ owner: 'ilyss', fraction: .25 });
      }
    });
  it('Elaris preserves the approved 240% sweep without a second global skill multiplier', () => {
    const state = encounter('elaris');
    for (const enemy of state.enemies) enemy.stats.defense = 200;
    const result = use(state, 'elaris', 'skill2');
    const hits = result.events.filter(event => event.kind === 'damage' && event.source === 'elaris' && !event.periodic);
    expect(hits).toHaveLength(state.enemies.length);
    expect(hits.map(event => event.amount)).toEqual(state.enemies.map(() => 80));
    const marked = use(state, 'elaris', 'skill1').state;
    const sweep = use(marked, 'elaris', 'skill2', marked.enemies[1].id);
    const sweepHits = sweep.events.filter(event => event.kind === 'damage' && event.source === 'elaris' && !event.periodic);
    expect(sweepHits.map(event => event.amount)).toEqual([85, 80, 80]);
  });

  it('Veyr applies 200% per Fault outside base Attack/Defense mitigation, not as inflated base Attack', () => {
    let state = encounter('veyr');
    const target = state.enemies[0];
    state = use(state, 'veyr', 'skill1', target.id).state;
    state = use(state, 'veyr', 'skill1', target.id).state;
    state.enemies[0].stats.defense = 100;
    const result = use(state, 'veyr', 'skill2', target.id);
    expect(result.events.find(event => event.kind === 'damage' && event.nativeKind === 'demolition'))
      .toMatchObject({ source: 'veyr', target: target.id, amount: 200, critical: false });
    expect(result.events.filter(event => event.kind === 'damage' && event.nativeKind === 'demolition')).toHaveLength(1);
  });

  it('Maerion stores only reported direct Health loss up to his cap, spends it on the chosen heal, and rolls no extra RNG', () => {
    const state = encounter('maerion', 'ember');
    const maerion = state.allies[0];
    const recipient = state.allies[1];
    maerion.stats.health = 1000;
    recipient.hp = 100;
    const events: BattleEvent[] = [];
    nativeDirectHpLoss(state, recipient, 200, events);
    nativeDirectHpLoss(state, recipient, 1000, events);
    expect(maerion.native?.unreturned).toBe(450);
    const seed = state.seed;
    const result = use(state, maerion.id, 'skill2', recipient.id);
    expect(result.state.seed).toBe(seed);
    expect(result.state.allies[1].hp).toBe(1000);
    expect(result.state.allies[0].native?.unreturned).toBe(0);
    expect(result.events.some(event => event.kind === 'heal' && event.source === maerion.id &&
      event.target === recipient.id && event.amount === 900)).toBe(true);
  });

  it('Caevren earns Load only from his own effective direct hits, once per enemy phase, then spends it on his shield', () => {
    const state = encounter('caevren');
    const owner = state.allies[0];
    const enemy = state.enemies[0];
    nativeEnemyCompleted(state, enemy, true, directEnemyAttack(enemy.id, owner.id));
    nativeEnemyCompleted(state, state.enemies[1], true, directEnemyAttack(state.enemies[1].id, owner.id));
    expect(owner.native?.load).toBe(1);
    state.round++;
    nativeEnemyCompleted(state, enemy, true, directEnemyAttack(enemy.id, owner.id));
    expect(owner.native?.load).toBe(2);
    const result = use(state, owner.id, 'ultimate');
    expect(result.state.allies[0].native?.load).toBe(0);
    expect(result.state.allies[0].shield).toBe(840);
    expect(result.state.allies[0].native?.intercept?.throughPhase).toBeGreaterThan(state.round);
  });

  it('Vespera gives a sourced Signal that boosts one ally action and is consumed by that action', () => {
    const baseline = encounter('vespera', 'ember');
    const signaled = structuredClone(baseline);
    const targetId = baseline.enemies[0].id;
    const without = use(baseline, 'ember', 'skill1', targetId);
    const signal = use(signaled, 'vespera', 'skill2', 'ember');
    expect(signal.state.allies[1].native?.signal).toMatchObject({ owner: 'vespera', bonus: .35 });
    const withSignal = use(signal.state, 'ember', 'skill1', targetId);
    expect(withSignal.events.find(event => event.kind === 'damage' && event.source === 'ember')!.amount)
      .toBeGreaterThan(without.events.find(event => event.kind === 'damage' && event.source === 'ember')!.amount);
    expect(withSignal.state.allies[1].native?.signal).toBeUndefined();
  });

  it('Ilyss earns Severance from a real cleanse and spends it on a stronger, sourced team heal', () => {
    const state = encounter('ilyss', 'ember');
    const ally = state.allies[1];
    ally.hp = 300;
    ally.burn = { damage: 25, turns: 2, sourceId: 'enemy', origin: 'native' };
    const cleanse = use(state, 'ilyss', 'skill2', ally.id);
    expect(cleanse.state.allies[1].burn.turns).toBe(0);
    expect(cleanse.state.allies[0].native?.severance).toBe(1);
    expect(cleanse.events.some(event => event.kind === 'heal' && event.origin === 'native' && event.source === 'ilyss')).toBe(true);
    const flare = use(cleanse.state, 'ilyss', 'ultimate');
    expect(flare.state.allies[0].native?.severance).toBe(0);
    expect(flare.state.allies.every(unit => unit.hp > 300)).toBe(true);
  });

  it('Asteriel records path changes as Promise and pays the retained Flourish path into timed Moonflowers', () => {
    let state = encounter('asteriel', 'ember');
    state = use(state, 'asteriel', 'skill1').state;
    expect(state.allies[0].native?.path).toBe('shelter');
    state = use(state, 'asteriel', 'skill2').state;
    expect(state.allies[0].native?.path).toBe('flourish');
    expect(state.allies[0].native?.promise).toBe(1);
    const flare = use(state, 'asteriel', 'ultimate');
    expect(flare.state.allies[0].native?.promise).toBe(0);
    expect(flare.state.allies[0].native?.path).toBe('flourish');
    expect(flare.state.allies[1].native?.moonflower).toMatchObject({
      owner: 'asteriel', bonus: .6, throughRound: state.round + 1,
    });
  });

  it('Serapha earns Interval only from a live enemy weakened by her and spends it into a timed Ceasefire', () => {
    let state = encounter('serapha', 'ember');
    state = use(state, 'serapha', 'skill1').state;
    const enemy = state.enemies[0];
    expect(enemy.weakenSourceId).toBe('serapha');
    nativeEnemyCompleted(state, enemy, true, directEnemyAttack(enemy.id, state.allies[1].id));
    expect(state.allies[0].native?.interval).toBe(1);
    state.round++;
    nativeEnemyCompleted(state, enemy, true, directEnemyAttack(enemy.id, state.allies[1].id));
    expect(state.allies[0].native?.interval).toBe(2);
    const flare = use(state, 'serapha', 'ultimate');
    expect(flare.state.allies[0].native?.interval).toBe(0);
    expect(flare.state.allies[1].native?.ceasefire).toMatchObject({
      owner: 'serapha', charges: 1, throughPhase: state.round + 2,
    });
    expect(flare.state.allies[1].native!.ceasefire!.fraction).toBeCloseTo(.3);
  });

  it('Rhaziel banks effective authored-shield absorption once per ally and pays Repair at the next player turn', () => {
    const state = encounter('rhaziel', 'ember');
    const owner = state.allies[0];
    const recipient = state.allies[1];
    recipient.hp = 500;
    const shield = use(state, owner.id, 'skill1', recipient.id);
    expect(shield.state.allies[1].shield).toBe(350);
    const events: BattleEvent[] = [];
    const shieldOwner = shield.state.allies[0];
    const shieldRecipient = shield.state.allies[1];
    shieldRecipient.shield -= 100;
    nativeAuthoredShieldAbsorbed(shield.state, shieldOwner, shieldRecipient, 100, false, events);
    nativeAuthoredShieldAbsorbed(shield.state, shieldOwner, shieldRecipient, 100, false, events);
    expect(shieldOwner.native?.repair?.[recipient.id]).toEqual({ amount: 20, dueRound: state.round + 1 });
    const hpBeforeRepair = shieldRecipient.hp;
    shield.state.round++;
    nativeTurnStart(shield.state, events);
    expect(shield.state.allies[1].hp).toBe(hpBeforeRepair + 20);
    expect(shield.state.allies[0].native?.repair?.[recipient.id]).toBeUndefined();
    expect(events.some(event => event.kind === 'heal' && event.source === owner.id && event.amount === 20)).toBe(true);
  });

  it('Oryn keeps Terms target-specific and assigns Accord with an explicit turn clock', () => {
    let state = encounter('oryn', 'ember');
    const target = state.enemies[1];
    state = use(state, 'oryn', 'skill1', target.id).state;
    expect(state.allies[0].native?.terms).toMatchObject({ target: target.id, throughPhase: state.round + 2 });
    expect(state.enemies[1].weakenSourceId).toBe('oryn');
    state = use(state, 'oryn', 'skill2', 'ember').state;
    expect(state.allies[0].native?.accords).toMatchObject({ ember: state.round + 2 });
    expect(state.allies[1].native?.accord).toMatchObject({ owner: 'oryn', throughRound: state.round + 2 });
  });

  it('Thessara earns Reserve from an effective strike and spends it on healing and Gauge', () => {
    let state = encounter('thessara', 'ember');
    state = use(state, 'thessara', 'skill1').state;
    expect(state.allies[0].native?.reserve).toBe(1);
    state.allies[1].hp = 500;
    state.allies[1].shatter = 0;
    const payoff = use(state, 'thessara', 'skill2', 'ember');
    expect(payoff.state.allies[0].native?.reserve).toBe(0);
    expect(payoff.state.allies[1].hp).toBeGreaterThan(500);
    expect(payoff.state.allies[1].shatter).toBe(8);
  });

  it('Elaris spends only the branches accumulated against the selected enemy', () => {
    let state = encounter('elaris');
    const marked = state.enemies[0];
    const other = state.enemies[1];
    state = use(state, 'elaris', 'skill1', marked.id).state;
    expect(state.allies[0].native?.branchTarget).toBe(marked.id);
    expect(state.allies[0].native?.branches).toBe(1);
    state = use(state, 'elaris', 'skill2', other.id).state;
    expect(state.allies[0].native?.branches).toBe(0);
    expect(state.allies[0].native?.branchTarget).toBe(marked.id);
    expect(state.allies[0].native?.actionStartedAt).toBeDefined();
  });

  it('Veyr builds a target-bound Fault and consumes it for the authored demolition payoff', () => {
    let state = encounter('veyr');
    const target = state.enemies[0];
    state = use(state, 'veyr', 'skill1', target.id).state;
    state = use(state, 'veyr', 'skill1', target.id).state;
    expect(state.allies[0].native?.faultCount).toBe(2);
    const payoff = use(state, 'veyr', 'skill2', target.id);
    expect(payoff.state.allies[0].native?.faultCount).toBe(0);
    expect(payoff.events.some(event => event.kind === 'damage' && event.source === 'veyr' &&
      event.nativeKind === 'demolition')).toBe(true);
  });

  it('Aureth moves the lead to a chosen ally and reduces that ally’s direct incoming damage for the stated phases', () => {
    const state = encounter('aureth', 'ember');
    const recipient = state.allies[1];
    const enemy = state.enemies[0];
    const result = use(state, 'aureth', 'skill1', recipient.id);
    expect(result.state.allies[1].native?.lead).toMatchObject({
      owner: 'aureth', fraction: .2, throughPhase: state.round + 2,
    });
    expect(nativeIncomingMultiplier(result.state, enemy, result.state.allies[1], 'light', [])).toBe(.8);
    expect(nativeIncomingMultiplier(result.state, enemy, result.state.allies[0], 'light', [])).toBe(1);
  });
});
