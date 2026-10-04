import { enemies, fighters, isActionId, type ActionId, type EnemyId, type Stats } from '../content/combat';
import { isStarterId, starters, type StarterId } from '../content/starters';

export interface Combatant {
  id: string;
  definitionId: StarterId | EnemyId;
  side: 'ally' | 'enemy';
  name: string;
  stats: Stats;
  hp: number;
  shield: number;
  flare: number;
  spent: boolean;
  recoverThrough: number;
  readyRound: Record<'skill1' | 'skill2', number>;
  burn: { damage: number; turns: number };
  weakened: number;
}
export interface BattleState {
  wave: number;
  round: number;
  phase: 'player' | 'cleared' | 'defeat';
  seed: number;
  allies: Combatant[];
  enemies: Combatant[];
}
export interface BattleEvent {
  kind: 'attack' | 'damage' | 'heal' | 'shield' | 'status' | 'turn';
  source: string;
  target: string;
  amount: number;
  critical: boolean;
  message: string;
  action?: ActionId;
}
export interface BattleResult { state: BattleState; events: BattleEvent[] }

function combatant(id: string, definitionId: Combatant['definitionId'], name: string, side: Combatant['side'], stats: Stats): Combatant {
  return {
    id, definitionId, name, side, stats: { ...stats }, hp: stats.health, shield: 0,
    flare: side === 'ally' ? 100 : 0, spent: false, recoverThrough: 0,
    readyRound: { skill1: 1, skill2: 1 }, burn: { damage: 0, turns: 0 }, weakened: 0,
  };
}

function spawnWave(wave: number): Combatant[] {
  const scale = 1 + (wave - 1) * 0.12;
  return (['goblin', 'imp', 'golem'] as const).map((id, index) => {
    const definition = enemies[id];
    return combatant(`enemy-${wave}-${index}`, id, definition.name, 'enemy', {
      health: Math.round(definition.stats.health * scale),
      defense: definition.stats.defense + Math.floor((wave - 1) / 2),
      damage: Math.round(definition.stats.damage * scale),
      crit: definition.stats.crit,
    });
  });
}

export function createBattle(seed = 1729): BattleState {
  if (!Number.isInteger(seed) || seed < 1 || seed > 0xffffffff) throw new Error('Battle seed must be a nonzero uint32.');
  return {
    wave: 1, round: 1, phase: 'player', seed,
    allies: starters.map((starter) => {
      const stats = { ...fighters[starter.id].stats };
      if (starter.id === 'tide') stats.defense += 8;
      return combatant(starter.id, starter.id, starter.name, 'ally', stats);
    }),
    enemies: spawnWave(1),
  };
}

function roll(state: BattleState): number {
  let seed = state.seed;
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  state.seed = seed >>> 0;
  return state.seed / 0x100000000;
}

export function damageAmount(base: number, multiplier: number, defense: number, critical: boolean): number {
  if (![base, multiplier, defense].every(Number.isFinite) || base < 0 || multiplier < 0 || defense < 0) {
    throw new Error('Invalid damage inputs.');
  }
  return Math.max(1, Math.round(base * multiplier * (critical ? 1.5 : 1)) - defense);
}

export function actionUnavailable(state: BattleState, actor: Combatant, action: ActionId): string | null {
  if (state.phase !== 'player') return 'This wave is not accepting actions.';
  if (actor.side !== 'ally' || !state.allies.some((ally) => ally.id === actor.id)) return 'Choose a team member.';
  if (actor.hp <= 0) return 'This character is defeated.';
  if (actor.spent) return 'This character has already acted this turn.';
  if (actor.recoverThrough >= state.round) return 'Recovering this turn after a heavy attack or Last Flare.';
  if (action === 'ultimate' && actor.flare < 100) return 'Last Flare requires 100 Flare.';
  if ((action === 'skill1' || action === 'skill2') && actor.readyRound[action] > state.round) {
    return `Ready on turn ${actor.readyRound[action]}.`;
  }
  return null;
}

function event(events: BattleEvent[], kind: BattleEvent['kind'], source: Combatant, target: Combatant, amount: number, message: string, critical = false): void {
  events.push({ kind, source: source.id, target: target.id, amount, message, critical });
}

function hurt(target: Combatant, amount: number, source: Combatant, events: BattleEvent[], critical = false): void {
  const absorbed = Math.min(target.shield, amount);
  target.shield -= absorbed;
  const loss = Math.min(target.hp, amount - absorbed);
  target.hp -= loss;
  event(events, 'damage', source, target, loss,
    `${target.name}: ${loss} damage${critical ? ' (critical)' : ''}${absorbed ? `, ${absorbed} shield absorbed` : ''}${target.hp === 0 ? ' - defeated' : ''}.`, critical);
}

function healTeam(state: BattleState, source: Combatant, amount: number, events: BattleEvent[], percent = false): void {
  for (const ally of state.allies.filter((unit) => unit.hp > 0)) {
    const restored = Math.min(ally.stats.health - ally.hp, percent ? Math.max(1, Math.round(ally.stats.health * amount)) : amount);
    if (restored <= 0) continue;
    ally.hp += restored;
    event(events, 'heal', source, ally, restored, `${source.name} restores ${restored} health to ${ally.name}.`);
  }
}

function shieldTeam(state: BattleState, source: Combatant, amount: number, events: BattleEvent[]): void {
  for (const ally of state.allies.filter((unit) => unit.hp > 0)) {
    const gained = Math.max(0, amount - ally.shield);
    ally.shield = Math.max(ally.shield, amount);
    event(events, 'shield', source, ally, gained, `${ally.name} has ${ally.shield} shield.`);
  }
}

function checkOutcome(state: BattleState): void {
  if (!state.allies.some((unit) => unit.hp > 0)) state.phase = 'defeat';
  else if (!state.enemies.some((unit) => unit.hp > 0)) state.phase = 'cleared';
}

export function act(previous: BattleState, actorId: string, action: ActionId, targetId: string): BattleResult {
  if (!isActionId(action)) throw new Error('Unknown combat action.');
  const original = previous.allies.find((unit) => unit.id === actorId);
  if (!original) throw new Error('Unknown team member.');
  const reason = actionUnavailable(previous, original, action);
  if (reason) throw new Error(reason);
  const support = action === 'skill2' && actorId !== 'ember';
  if (!support && !previous.enemies.some((enemy) => enemy.id === targetId && enemy.hp > 0)) {
    throw new Error('Choose a living enemy target.');
  }
  const state = structuredClone(previous);
  const actor = state.allies.find((unit) => unit.id === actorId);
  if (!actor) throw new Error('Team state is inconsistent.');
  if (!isStarterId(actor.definitionId)) throw new Error('Invalid ally definition.');
  const definition = fighters[actor.definitionId];
  const events: BattleEvent[] = [];
  const name = action === 'light' ? 'Light Attack' : action === 'heavy' ? 'Heavy Attack' : definition.abilities[action].name;
  events.push({ kind: 'attack', source: actor.id, target: support ? actor.id : targetId, amount: 0, critical: false, message: `${actor.name} uses ${name}.`, action });
  actor.spent = true;
  if (action === 'heavy' || action === 'ultimate') actor.recoverThrough = state.round + 1;
  if (action === 'ultimate') actor.flare -= 100;
  else actor.flare = Math.min(100, actor.flare + (action === 'light' ? 20 : action === 'heavy' ? 30 : 10));
  if (action === 'skill1' || action === 'skill2') actor.readyRound[action] = state.round + definition.abilities[action].cooldown;

  if (!support) {
    const all = action === 'ultimate' || (action === 'skill2' && actorId === 'ember');
    const targets = state.enemies.filter((enemy) => enemy.hp > 0 && (all || enemy.id === targetId));
    let multiplier = action === 'heavy' ? 1.8 : 1;
    if (action === 'skill1') multiplier = actorId === 'ember' ? 1.6 : 1.5;
    if (action === 'skill2') multiplier = 1.1;
    if (action === 'ultimate') multiplier = actorId === 'ember' ? 2.8 : actorId === 'tide' ? 2.2 : 1.8;
    if (actorId === 'ember' && actor.hp <= actor.stats.health / 2) multiplier *= 1.2;
    for (const target of targets) {
      const critical = roll(state) < Math.min(1, actor.stats.crit + (actorId === 'sprout' && action === 'skill1' ? 0.2 : 0));
      hurt(target, damageAmount(actor.stats.damage, multiplier, target.stats.defense, critical), actor, events, critical);
      if (target.hp > 0 && action === 'skill1' && actorId === 'ember') {
        target.burn = { damage: 8, turns: 2 };
        event(events, 'status', actor, target, 8, `${target.name} burns for two enemy phases.`);
      }
      if (target.hp > 0 && action === 'skill1' && actorId === 'tide') {
        target.weakened = 2;
        event(events, 'status', actor, target, 0, `${target.name} is weakened for two enemy phases.`);
      }
    }
  }
  if (actorId === 'tide' && (action === 'skill2' || action === 'ultimate')) {
    shieldTeam(state, actor, action === 'ultimate' ? 35 : 25, events);
  }
  if (actorId === 'sprout' && (action === 'skill2' || action === 'ultimate')) {
    healTeam(state, actor, action === 'ultimate' ? 55 : 30, events);
  }
  checkOutcome(state);
  return { state, events };
}

function newTurn(state: BattleState, events: BattleEvent[]): void {
  state.round++;
  for (const ally of state.allies) ally.spent = false;
  const flores = state.allies.find((unit) => unit.id === 'sprout' && unit.hp > 0);
  if (flores) healTeam(state, flores, 0.05, events, true);
  events.push({ kind: 'turn', source: '', target: '', amount: state.round, critical: false, message: `Turn ${state.round}. Heavy/ultimate users recover for exactly their next turn.` });
}

export function endTurn(previous: BattleState): BattleResult {
  if (previous.phase !== 'player') throw new Error('There is no active player turn.');
  const state = structuredClone(previous);
  const events: BattleEvent[] = [];
  for (const enemy of state.enemies) {
    if (enemy.hp <= 0) continue;
    if (enemy.burn.turns > 0) {
      enemy.burn.turns--;
      const source = state.allies.find((unit) => unit.id === 'ember');
      if (!source) throw new Error('Burn source is missing.');
      hurt(enemy, enemy.burn.damage, source, events);
    }
    if (enemy.hp <= 0) continue;
    const living = state.allies.filter((unit) => unit.hp > 0);
    if (!living.length) break;
    const target = living[Math.floor(roll(state) * living.length)];
    const critical = roll(state) < enemy.stats.crit;
    events.push({ kind: 'attack', source: enemy.id, target: target.id, amount: 0, critical: false, message: `${enemy.name} attacks ${target.name}.`, action: 'light' });
    hurt(target, damageAmount(enemy.stats.damage, enemy.weakened > 0 ? 0.75 : 1, target.stats.defense, critical), enemy, events, critical);
    if (enemy.weakened > 0) enemy.weakened--;
  }
  checkOutcome(state);
  if (state.phase === 'player') newTurn(state, events);
  return { state, events };
}

export function nextWave(previous: BattleState): BattleResult {
  if (previous.phase !== 'cleared') throw new Error('Defeat this wave before advancing.');
  const state = structuredClone(previous);
  const events: BattleEvent[] = [];
  state.wave++;
  state.enemies = spawnWave(state.wave);
  state.phase = 'player';
  newTurn(state, events);
  events.push({ kind: 'turn', source: '', target: '', amount: state.wave, critical: false, message: `Wave ${state.wave}: enemies grow stronger. Health, shields, Flare and recovery carry over.` });
  return { state, events };
}
