import { actionIds, adventureScaling, defenseMode, enemies, formatStat, resolveFighter, isActionId, shatterGauge, type ActionId, type EnemyId, type Stats, type FighterDefinition } from '../content/combat';
import { getStarter, isStarterId, type StarterId } from '../content/starters';
import { type CharacterProgress } from '../content/progression';
import { fractalisDrop, treasuryFractalisDrop, rollDrop, rollStagedLycalis } from '../content/loot-random';
import { dungeonEncounter, materialDrops, type PlayableDungeon } from '../content/dungeons';
import { materialName } from '../content/dungeon-art';
import { infusionEncounter, infusionDrops } from '../content/infusions';
import { dungeonStageCount, infusionStageCount, type InfusionModeId, type ElementId } from '../content/activities';
import { enemyGrowth, enemyStat } from '../content/stat-growth';
import { enemySkills, scheduledEnemySkill, type EnemySkill } from '../content/enemy-skills';
import { getConduit, isConduitId, validateConduitUpgrades, type ConduitId, type ConduitSlots, type ConduitLoadouts, type ConduitMechanic, type ConduitUpgrades } from '../content/conduits';
import { rollMachineComponents } from '../content/mechanical-components';
import { machineConduitDrops } from '../content/machines';
import { capturedProgress, resolveCapturedFighter, type CapturedCharacter } from './character-instances';
import { roseCaptureAllowed } from '../content/roses';
import { getCreature } from '../content/creatures';
import { elementAccents } from '../content/dungeon-art';
import { characterName } from '../content/character-art';

export interface Combatant {
  id: string;
  definitionId: string;
  side: 'ally' | 'enemy';
  name: string;
  element: ElementId;
  level: number | null;
  evolution?: number;
  conduits?: ConduitSlots;
  stats: Stats;
  hp: number;
  shield: number;
  shatter: number;
  spent: boolean;
  recoverThrough: number;
  readyRound: Record<'skill1' | 'skill2', number> & { ultimate?: number };
  burn: { damage: number; turns: number; sourceId?: string };
  weakened: number;
  weakenFraction: number;
  attackBoost?: { fraction: number; throughRound: number };
  conduitCharges?: { burnFocus?: boolean; normalMomentum?: boolean; weakenPierce?: boolean };
  kit: FighterDefinition | null;
  defending: boolean;
  art?: string;
  color?: string;
  enemySkills?: EnemySkill[];
  boss?: boolean;
  creatureId?: string;
  captured?: CapturedCharacter;
}
export interface BattleState {
  wave: number;
  round: number;
  phase: 'player' | 'cleared' | 'defeat';
  seed: number;
  rewardSeed: number;
  captureSeed?: number;
  lycalisSeed?: number;
  conduitSeed?: number;
  componentSeed?: number;
  conduitUpgrades?: ConduitUpgrades;
  allies: Combatant[];
  enemies: Combatant[];
  dungeon?: { element: PlayableDungeon; stage: number };
  infusion?: { mode: InfusionModeId; stage: number };
}
export interface BattleEvent {
  kind: 'attack' | 'damage' | 'heal' | 'shield' | 'status' | 'turn' | 'reward';
  source: string;
  target: string;
  amount: number;
  critical: boolean;
  message: string;
  action?: ActionId;
  enhancedAttack?: boolean;
  abilityName?: string;
  materials?: Record<string, number>;
  shieldRemaining?: number;
  periodic?: boolean;
  capture?: { creatureId: string; level: number };
  lycalis?: number;
  conduits?: Partial<Record<ConduitId, number>>;
  mechanicalComponents?: number;
  conduitUpgrades?: ConduitUpgrades;
}
export interface BattleResult { state: BattleState; events: BattleEvent[] }

function combatant(id: string, definitionId: Combatant['definitionId'], name: string, side: Combatant['side'], stats: Stats, element: ElementId): Combatant {
  return {
    id, definitionId, name, element, side, level: null, stats: { ...stats }, hp: stats.health, shield: 0,
    shatter: shatterGauge.starting, spent: false, recoverThrough: 0,
    readyRound: { skill1: 1, skill2: 1 }, burn: { damage: 0, turns: 0 }, weakened: 0, weakenFraction: 0.25, kit: null, defending: false,
  };
}

function spawnWave(wave: number): Combatant[] {
  const level = Math.min(wave, enemyGrowth.maximumLevel);
  return (['goblin', 'imp', 'golem'] as const).map((id, index) => {
    const definition = enemies[id];
    const unit = combatant(`enemy-${wave}-${index}`, id, definition.name, 'enemy', {
      ...definition.stats,
      health: enemyStat(definition.stats.health, enemyGrowth.health, level, 1, adventureScaling.healthPerWave),
      defense: enemyStat(definition.stats.defense, enemyGrowth.defense, level, 1, adventureScaling.defensePerWave / definition.stats.defense),
      damage: enemyStat(definition.stats.damage, enemyGrowth.damage, level, 1, adventureScaling.damagePerWave),
      crit: definition.stats.crit,
    }, definition.element);
    unit.level = level;
    unit.creatureId = `adventure:${id}`;
    const strike = id === 'goblin' ? 'Wildwood Ambush' : id === 'imp' ? 'Cinder Mischief' : 'Faultline Crush';
    unit.enemySkills = enemySkills(level, false, strike, 1.2 + (level - 1) * .004);
    return unit;
  });
}

export function createBattle(seed = 1729, roster: readonly string[] = ['ember'], progress: Partial<Record<StarterId, CharacterProgress>> = {}, equipment: ConduitLoadouts = {}, captures: readonly CapturedCharacter[] = [], upgrades: ConduitUpgrades = {}): BattleState {
  if (!Number.isInteger(seed) || seed < 1 || seed > 0xffffffff) throw new Error('Battle seed must be a nonzero uint32.');
  if (!roster.length || roster.length > 3 || new Set(roster).size !== roster.length || !roster.every((id) => isStarterId(id) || captures.some((copy) => copy.instanceId === id))) {
    throw new Error('Battle roster requires distinct valid starters.');
  }

  const snapshot = validateConduitUpgrades(upgrades);
  return {
    wave: 1, round: 1, phase: 'player', seed, rewardSeed: seed, captureSeed: seed,
    conduitUpgrades: snapshot,
    allies: roster.map((id) => {
      if (!isStarterId(id)) {
        const copy = captures.find((entry) => entry.instanceId === id);
        if (!copy) throw new Error('Captured squad instance is missing.');
        const creature = getCreature(copy.creatureId);
        const kit = resolveCapturedFighter(copy, equipment[id], snapshot);
        const unit = combatant(id, creature.id, `${creature.name} ~ Copy ${captures.findIndex((entry) => entry.instanceId === id) + 1}`, 'ally', kit.stats, creature.element);
        unit.kit = kit;
        unit.level = capturedProgress(copy).level;
        unit.evolution = capturedProgress(copy).tier + 1;
        unit.captured = structuredClone(copy);
        unit.creatureId = creature.id;
        unit.art = creature.art;
        unit.color = elementAccents[creature.element];
        if (equipment[id]) unit.conduits = [...equipment[id]];
        return unit;
      }
      const starter = getStarter(id);
      const kit = resolveFighter(id, progress[id], equipment[id], snapshot);
      const unit = combatant(starter.id, starter.id, characterName(id, progress[id]?.evolution), 'ally', kit.stats, starter.elementId);
      unit.kit = kit;
      unit.level = progress[id]?.level ?? null;
      unit.evolution = progress[id]?.evolution ?? 1;
      if (equipment[id]) unit.conduits = [...equipment[id]];
      return unit;
    }),
    enemies: spawnWave(1),
  };
}

export function createDungeonBattle(element: PlayableDungeon, stage: number, seed: number, starter: StarterId, progress: CharacterProgress,
  roster: readonly string[] = [starter], teamProgress: Partial<Record<StarterId, CharacterProgress>> = { [starter]: progress }, equipment: ConduitLoadouts = {}, captures: readonly CapturedCharacter[] = [], upgrades: ConduitUpgrades = {}): BattleState {
  const encounter = dungeonEncounter(element, stage);
  const state = createBattle(seed, roster, teamProgress, equipment, captures, upgrades);
  state.wave = stage;
  state.dungeon = { element, stage };
  state.enemies = Array.from({ length: encounter.boss ? 1 : 2 }, (_, index) => {
    const unit = combatant(`dungeon-${element}-${stage}-${index}`, 'goblin', encounter.enemy.name, 'enemy', encounter.stats, element);
    unit.level = encounter.level;
    unit.creatureId = `dungeon:${element}:${encounter.tier}`;
    unit.art = encounter.enemy.art;
    unit.color = encounter.color;
    unit.boss = encounter.boss;
    unit.enemySkills = enemySkills(encounter.level, encounter.boss, encounter.ability, encounter.abilityMultiplier);
    return unit;
  });
  return state;
}

function roll(state: BattleState): number {
  let seed = state.seed;
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  state.seed = seed >>> 0;
  return state.seed / 0x100000000;
}

export function createInfusionBattle(mode: InfusionModeId, stage: number, seed: number, starter: StarterId, progress: CharacterProgress,
  roster: readonly string[] = [starter], teamProgress: Partial<Record<StarterId, CharacterProgress>> = { [starter]: progress }, equipment: ConduitLoadouts = {}, captures: readonly CapturedCharacter[] = [], upgrades: ConduitUpgrades = {}): BattleState {
  const encounter = infusionEncounter(mode, stage);
  const state = createBattle(seed, roster, teamProgress, equipment, captures, upgrades);
  state.wave = stage;
  state.infusion = { mode, stage };
  state.enemies = Array.from({ length: encounter.boss ? 1 : 2 }, (_, index) => {
    const unit = combatant(`infusion-${mode}-${stage}-${index}`, 'goblin', encounter.enemy.name, 'enemy', encounter.stats, encounter.enemy.element);
    unit.level = encounter.level;
    unit.creatureId = `infusion:${mode}:${encounter.tier}`;
    unit.art = encounter.enemy.art;
    unit.color = encounter.color;
    unit.boss = encounter.boss;
    unit.enemySkills = enemySkills(encounter.level, encounter.boss, encounter.ability, encounter.abilityMultiplier);
    return unit;
  });
  return state;
}

export function damageAmount(base: number, multiplier: number, defense: number, critical: boolean, critMultiplier = 1.5): number {
  if (![base, multiplier, defense, critMultiplier].every(Number.isFinite) || base < 0 || multiplier < 0 || defense < 0 || critMultiplier < 1) {
    throw new Error('Invalid damage inputs.');
  }
  return Math.max(1, Math.round(base * multiplier * (critical ? critMultiplier : 1)) - defense);
}

export function actionUnavailable(state: BattleState, actor: Combatant, action: ActionId): string | null {
  if (state.phase !== 'player') return 'This wave is not accepting actions.';
  if (actor.side !== 'ally' || !state.allies.some((ally) => ally.id === actor.id)) return 'Choose a team member.';
  if (action !== 'light' && action !== 'defend' && actor.kit?.unavailableActions?.includes(action)) return 'This captured form does not have this ability.';
  if (actor.hp <= 0) return 'This character is defeated.';
  if (actor.spent) return 'This character has already acted this turn.';
  if (actor.recoverThrough >= state.round) return 'Recovering this turn after Last Flare.';
  if (action === 'ultimate' && (actor.readyRound.ultimate ?? 0) > state.round) return `Ready on turn ${actor.readyRound.ultimate}.`;
  if (actor.shatter < shatterGauge.costs[action]) return `Requires ${shatterGauge.costs[action]} Shatter Gauge.`;
  if ((action === 'skill1' || action === 'skill2') && actor.readyRound[action] > state.round) {
    return `Ready on turn ${actor.readyRound[action]}.`;
  }
  return null;
}

function event(events: BattleEvent[], kind: BattleEvent['kind'], source: Combatant, target: Combatant, amount: number, message: string, critical = false): void {
  events.push({ kind, source: source.id, target: target.id, amount, message, critical });
}

function hurt(target: Combatant, amount: number, source: Combatant, events: BattleEvent[], critical = false, periodic = false): void {
  if (target.defending) amount = Math.max(1, Math.round(amount * (1 - defenseMode.damageReduction)));
  const absorbed = Math.min(target.shield, amount);
  target.shield -= absorbed;
  const loss = Math.min(target.hp, amount - absorbed);
  target.hp -= loss;
  event(events, 'damage', source, target, loss,
    `${target.name}: ${formatStat(loss)} damage${critical ? ' (critical)' : ''}${absorbed ? `, ${formatStat(absorbed)} shield absorbed` : ''}${target.hp === 0 ? ' - defeated' : ''}.`, critical);
  events[events.length - 1].shieldRemaining = target.shield;
  if (periodic) events[events.length - 1].periodic = true;
}

function gainShatter(target: Combatant, amount: number, events: BattleEvent[]): void {
  const gained = Math.min(target.stats.shatterCapacity - target.shatter, amount);
  if (gained <= 0) return;
  target.shatter += gained;
  event(events, 'status', target, target, gained, `${target.name} gains ${formatStat(gained)} Shatter Gauge (${formatStat(target.shatter)} ~ ${formatStat(target.stats.shatterCapacity)}).`);
}

function healTeam(state: BattleState, source: Combatant, amount: number, events: BattleEvent[], percent = false): void {
  for (const ally of state.allies.filter((unit) => unit.hp > 0)) {
    const restored = Math.min(ally.stats.health - ally.hp, percent ? Math.max(1, Math.round(ally.stats.health * amount)) : amount);
    if (restored <= 0) continue;
    ally.hp += restored;
    event(events, 'heal', source, ally, restored, `${source.name} restores ${formatStat(restored)} health to ${ally.name}.`);
  }
}

function shieldTeam(state: BattleState, source: Combatant, amount: number, events: BattleEvent[]): void {
  for (const ally of state.allies.filter((unit) => unit.hp > 0)) {
    const gained = Math.max(0, amount - ally.shield);
    ally.shield = Math.max(ally.shield, amount);
    event(events, 'shield', source, ally, gained, `${ally.name} has ${formatStat(ally.shield)} shield.`);
  }
}

function checkOutcome(state: BattleState): void {
  if (!state.allies.some((unit) => unit.hp > 0)) state.phase = 'defeat';
  else if (!state.enemies.some((unit) => unit.hp > 0)) state.phase = 'cleared';
}

function awardDefeats(previous: BattleState, state: BattleState, events: BattleEvent[]): void {
  for (const enemy of state.enemies) {
    if (enemy.hp > 0 || !previous.enemies.some((unit) => unit.id === enemy.id && unit.hp > 0)) continue;
    const rewardRoll = (): number => {
      let seed = state.rewardSeed;
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      state.rewardSeed = seed >>> 0;
      return state.rewardSeed / 0x100000000;
    };
    if (enemy.level === null) throw new Error('Enemy reward level is missing.');
    const amount = rollDrop(state.infusion?.mode === 'treasury' ? treasuryFractalisDrop(enemy.level) : fractalisDrop(enemy.level, state.infusion?.mode === 'roses' ? 140 : 120), rewardRoll);
    if (amount === undefined) throw new Error('Guaranteed Prismatica reward did not drop.');
    const materials = state.infusion ? infusionDrops(state.infusion.mode, state.infusion.stage, rewardRoll)
      : state.dungeon ? materialDrops(state.dungeon.element, state.dungeon.stage, rewardRoll) : undefined;
    const materialText = materials ? Object.entries(materials).map(([id, quantity]) => `${quantity} ${materialName(id)}`).join(', ') : '';
    let capture: BattleEvent['capture'];
    let lycalis = 0;
    const mechanicalComponents = state.infusion?.mode === 'machines' ? rollMachineComponents(state.infusion.stage, () => {
      let seed = state.componentSeed ?? (((previous.rewardSeed ^ 0x6c8e9cf5) >>> 0) || 1);
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      state.componentSeed = seed >>> 0;
      return state.componentSeed / 0x100000000;
    }) : 0;
    const conduits = state.infusion?.mode === 'machines' ? machineConduitDrops(state.infusion.stage, () => {
      let seed = state.conduitSeed ?? (((previous.rewardSeed ^ 0xa511e9b3) >>> 0) || 1);
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      state.conduitSeed = seed >>> 0;
      return state.conduitSeed / 0x100000000;
    }) : undefined;
    if (state.infusion && state.infusion.mode !== 'machines' && enemy.creatureId) {
      let seed = state.captureSeed ?? state.seed;
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      state.captureSeed = seed >>> 0;
      if ((state.infusion.mode !== 'roses' || roseCaptureAllowed(enemy.level)) && captureSucceeds(state.captureSeed / 0x100000000)) capture = { creatureId: enemy.creatureId, level: enemy.level };
      if (state.infusion.mode !== 'treasury' && state.infusion.mode !== 'roses') lycalis = rollStagedLycalis(state.infusion.mode, enemy.level, () => {
        let premiumSeed = state.lycalisSeed ?? (((previous.seed ^ 0x9e3779b9) >>> 0) || 1);
        premiumSeed ^= premiumSeed << 13;
        premiumSeed ^= premiumSeed >>> 17;
        premiumSeed ^= premiumSeed << 5;
        state.lycalisSeed = premiumSeed >>> 0;
        return state.lycalisSeed / 0x100000000;
      });
    }
    events.push({ kind: 'reward', source: enemy.id, target: '', amount, critical: false,
      ...(materials ? { materials } : {}),
      ...(capture ? { capture } : {}),
      ...(lycalis ? { lycalis } : {}),
      ...(conduits ? { conduits } : {}),
      ...(conduits && Object.keys(conduits).length ? { conduitUpgrades: state.conduitUpgrades } : {}),
      ...(mechanicalComponents ? { mechanicalComponents } : {}),
      message: `${enemy.name} drops +${amount} Prismatica${materialText ? ` and ${materialText}` : ''}${lycalis ? ` and +${lycalis} Null-Prismatica` : ''}${mechanicalComponents ? ` and +${mechanicalComponents} Broken Mechanical Components` : ''}${capture ? ` and a captured ${enemy.name} creature` : ''}${conduits && Object.keys(conduits).length ? ` and ${Object.keys(conduits).filter(isConduitId).map((id) => getConduit(id).name).join(', ')}` : ''}.` });
  }

}

export function captureSucceeds(value: number): boolean {
  if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error('Capture roll must be in [0, 1).');
  return value < .2;
}

function hasMechanic(unit: Combatant, mechanic: ConduitMechanic): boolean {
  return unit.conduits?.some((id) => id !== null && getConduit(id).mechanic === mechanic) ?? false;
}

function conduitShield(actor: Combatant, fraction: number, events: BattleEvent[]): void {
  const amount = Math.round(actor.stats.health * fraction);
  const gained = Math.max(0, amount - actor.shield);
  actor.shield = Math.max(actor.shield, amount);
  if (gained > 0) event(events, 'shield', actor, actor, gained, `${actor.name}'s Conduit grants ${formatStat(gained)} shield.`);
}

function conduitHeal(actor: Combatant, fraction: number, events: BattleEvent[]): void {
  const restored = Math.min(actor.stats.health - actor.hp, Math.round(actor.stats.health * fraction));
  if (actor.hp <= 0 || restored <= 0) return;
  actor.hp += restored;
  event(events, 'heal', actor, actor, restored, `${actor.name}'s Conduit restores ${formatStat(restored)} health.`);
}

function chargeConduit(actor: Combatant, key: 'burnFocus' | 'normalMomentum' | 'weakenPierce', events: BattleEvent[], effect: string): void {
  actor.conduitCharges = { ...actor.conduitCharges, [key]: true };
  event(events, 'status', actor, actor, 0, `${actor.name}: ${effect} (refresh; does not stack).`);
}

export function act(previous: BattleState, actorId: string, action: ActionId, targetId: string): BattleResult {
  if (!isActionId(action)) throw new Error('Unknown combat action.');
  const original = previous.allies.find((unit) => unit.id === actorId);
  if (!original) throw new Error('Unknown team member.');
  const reason = actionUnavailable(previous, original, action);
  if (reason) throw new Error(reason);
  const support = action === 'defend' || (action !== 'light' && original.kit?.abilities[action].targets === 'all-allies') ||
    (action === 'skill2' && (original.definitionId === 'tide' || original.definitionId === 'sprout') && !original.captured);
  if (!support && !previous.enemies.some((enemy) => enemy.id === targetId && enemy.hp > 0)) {
    throw new Error('Choose a living enemy target.');
  }
  const state = structuredClone(previous);
  const actor = state.allies.find((unit) => unit.id === actorId);
  if (!actor) throw new Error('Team state is inconsistent.');
  const definition = actor.kit;
  if (!definition) throw new Error('Ally combat kit is missing.');
  const strength = action === 'light' || action === 'defend' ? null : definition.abilities[action].strength;
  const events: BattleEvent[] = [];
  const name = action === 'light' ? 'Normal Attack' : action === 'defend' ? 'Defense' : definition.abilities[action].name;
  if (action === 'defend') {
    actor.spent = true;
    actor.defending = true;
    event(events, 'status', actor, actor, defenseMode.damageReduction * 100, `${actor.name} enters Defense: incoming damage reduced by 10% until the next player turn.`);
    if (hasMechanic(actor, 'defense-ward')) conduitShield(actor, .1, events);
    if (hasMechanic(actor, 'defense-heal')) conduitHeal(actor, .05, events);
    return { state, events };
  }
  events.push({ kind: 'attack', source: actor.id, target: support ? actor.id : targetId, amount: 0, critical: false, message: `${actor.name} uses ${name}.`, action, abilityName: name });
  actor.spent = true;
  if (action === 'ultimate') actor.recoverThrough = state.round + 1;
  actor.shatter -= shatterGauge.costs[action];
  gainShatter(actor, shatterGauge.gains[action], events);
  if (action === 'skill1' || action === 'skill2') actor.readyRound[action] = state.round + definition.abilities[action].cooldown;
  if (action === 'ultimate' && actor.captured) actor.readyRound.ultimate = state.round + definition.abilities.ultimate.cooldown;

  if (!support) {
    const critBonus = actor.conduitCharges?.burnFocus ? .05 : 0;
    const pierce = actor.conduitCharges?.weakenPierce ? .2 : 0;
    const momentum = action !== 'light' && actor.conduitCharges?.normalMomentum ? .1 : 0;
    if (actor.conduitCharges) {
      delete actor.conduitCharges.burnFocus;
      delete actor.conduitCharges.weakenPierce;
      if (action !== 'light') delete actor.conduitCharges.normalMomentum;
    }
    const all = !actor.captured && (action === 'ultimate' || (action === 'skill2' && actor.definitionId === 'ember') ||
      (action !== 'light' && definition.abilities[action].targets === 'all-enemies'));
    const targets = state.enemies.filter((enemy) => enemy.hp > 0 && (all || enemy.id === targetId));
    let multiplier = 1;
    if (strength) {
      if (strength.damageMultiplier === undefined) throw new Error('Attack skill damage multiplier is missing.');
      multiplier = strength.damageMultiplier;
    }
    if (actor.hp <= actor.stats.health / 2) multiplier *= 1 + definition.passive.damageBonus;
    if (actor.attackBoost && actor.attackBoost.throughRound >= state.round) multiplier *= 1 + actor.attackBoost.fraction;
    multiplier *= 1 + momentum;
    let burned = false;
    let weakened = false;
    let hitCritical = false;
    for (const target of targets) {
      const critical = roll(state) < Math.min(1, actor.stats.crit + (strength?.critBonus ?? 0) + critBonus);
      hitCritical ||= critical;
      hurt(target, damageAmount(actor.stats.damage, multiplier, target.stats.defense * (1 - pierce), critical, actor.stats.critMultiplier), actor, events, critical);
      if (target.hp > 0 && strength?.burnMultiplier !== undefined) {
        const damage = Math.round(actor.stats.elementalDamage * strength.burnMultiplier);
        target.burn = { damage, turns: 2, sourceId: actor.id };
        event(events, 'status', actor, target, damage, `${target.name} burns for two enemy phases.`);
        burned = true;
      }
      if (target.hp > 0 && strength?.weakenFraction !== undefined) {
        target.weakened = 2;
        target.weakenFraction = strength.weakenFraction;
        event(events, 'status', actor, target, 0, `${target.name} is weakened for two enemy phases.`);
        weakened = true;
      }
    }
    if (burned && hasMechanic(actor, 'burn-focus')) chargeConduit(actor, 'burnFocus', events, 'next offensive activation gains +5 percentage points Critical Rate');
    if (weakened && hasMechanic(actor, 'weaken-pierce')) chargeConduit(actor, 'weakenPierce', events, 'next offensive activation ignores 20% Defense');
    if (action === 'light' && hasMechanic(actor, 'normal-momentum')) chargeConduit(actor, 'normalMomentum', events, 'next offensive skill gains +10% outgoing damage');
    if (hitCritical && hasMechanic(actor, 'critical-gauge')) gainShatter(actor, 5, events);
  }
  if (strength?.shield !== undefined) {
    shieldTeam(state, actor, strength.shield, events);
  }
  if (strength?.healing !== undefined) {
    healTeam(state, actor, strength.healing, events);
  }
  if (strength?.attackBoostFraction !== undefined) {
    for (const ally of state.allies.filter((unit) => unit.hp > 0)) {
      const prior = ally.attackBoost && ally.attackBoost.throughRound >= state.round ? ally.attackBoost.fraction : 0;
      ally.attackBoost = { fraction: Math.max(prior, strength.attackBoostFraction), throughRound: state.round + 1 };
      event(events, 'status', actor, ally, ally.attackBoost.fraction * 100,
        `${ally.name}: outgoing attack damage +${formatStat(ally.attackBoost.fraction * 100)}% this and next player turn (refresh; does not stack).`);
    }
  }
  if (hasMechanic(actor, 'shield-heal') && events.some((entry) => entry.kind === 'shield' && entry.source === actor.id && entry.amount > 0)) conduitHeal(actor, .05, events);
  if (hasMechanic(actor, 'defeat-gauge') && events.some((entry) => entry.kind === 'damage' && entry.source === actor.id && state.enemies.some((enemy) => enemy.id === entry.target && enemy.hp === 0))) gainShatter(actor, 5, events);
  if (action === 'ultimate' && hasMechanic(actor, 'ultimate-ward')) conduitShield(actor, .15, events);
  checkOutcome(state);
  awardDefeats(previous, state, events);
  return { state, events };
}

function newTurn(state: BattleState, events: BattleEvent[]): void {
  state.round++;
  for (const ally of state.allies) {
    ally.spent = false;
    ally.defending = false;
    if (ally.attackBoost && ally.attackBoost.throughRound < state.round) delete ally.attackBoost;
    if (hasMechanic(ally, 'renewal')) conduitHeal(ally, .02, events);
  }
  for (const ally of state.allies.filter((unit) => unit.hp > 0 && (unit.kit?.passive.healFraction ?? 0) > 0)) {
    if (!ally.kit) throw new Error('Passive combat kit is missing.');
    healTeam(state, ally, ally.kit.passive.healFraction, events, true);
  }
  events.push({ kind: 'turn', source: '', target: '', amount: state.round, critical: false, message: `Turn ${state.round}. Only Last Flare forces next-turn recovery.` });
}

export function endTurn(previous: BattleState): BattleResult {
  if (previous.phase !== 'player') throw new Error('There is no active player turn.');
  const state = structuredClone(previous);
  const events: BattleEvent[] = [];
  for (const enemy of state.enemies) {
    if (enemy.hp <= 0) continue;
    if (enemy.burn.turns > 0) {
      enemy.burn.turns--;
      const source = state.allies.find((unit) => unit.id === (enemy.burn.sourceId ?? 'ember'));
      if (!source) throw new Error('Burn source is missing.');
      hurt(enemy, enemy.burn.damage, source, events, false, true);
    }
    if (enemy.hp <= 0) continue;
    const living = state.allies.filter((unit) => unit.hp > 0);
    if (!living.length) break;
    const target = living[Math.floor(roll(state) * living.length)];
    const critical = roll(state) < enemy.stats.crit;
    const ability = scheduledEnemySkill(enemy.enemySkills ?? [], state.round);
    events.push({ kind: 'attack', source: enemy.id, target: target.id, amount: 0, critical: false,
      message: ability ? `${enemy.name} uses ${ability.name} on ${target.name}.` : `${enemy.name} attacks ${target.name}.`,
      action: ability?.action ?? 'light', enhancedAttack: !!ability, abilityName: ability?.name });
    const multiplier = (ability?.multiplier ?? 1) * (enemy.weakened > 0 ? 1 - enemy.weakenFraction : 1);
    hurt(target, damageAmount(enemy.stats.damage, multiplier, target.stats.defense, critical, enemy.stats.critMultiplier), enemy, events, critical);
    gainShatter(target, shatterGauge.incomingHit, events);
    if (enemy.weakened > 0) enemy.weakened--;
  }
  checkOutcome(state);
  if (state.phase === 'player') newTurn(state, events);
  awardDefeats(previous, state, events);
  return { state, events };
}

export function actAndAdvanceTurn(previous: BattleState, actorId: string, action: ActionId, targetId: string): BattleResult {
  const actionResult = act(previous, actorId, action, targetId);
  const advanced = advanceUnavailableTurns(actionResult.state);
  return { state: advanced.state, events: [...actionResult.events, ...advanced.events] };
}

export function teamCanAct(state: BattleState): boolean {
  return state.phase === 'player' && state.allies.some((ally) =>
    actionIds.some((action) => actionUnavailable(state, ally, action) === null));
}

export function advanceUnavailableTurns(previous: BattleState): BattleResult {
  let state = previous;
  const events: BattleEvent[] = [];
  while (state.phase === 'player' && !teamCanAct(state)) {
    const result = endTurn(state);
    state = result.state;
    events.push(...result.events);
  }
  return { state, events };
}

export function nextStage(previous: BattleState, progress: CharacterProgress | Partial<Record<StarterId, CharacterProgress>>): BattleResult {
  const destination = previous.infusion ?? previous.dungeon;
  if (!destination) throw new Error('Only staged battles can advance to the next stage.');
  if (previous.phase !== 'cleared') throw new Error('Clear this stage before advancing.');
  if (previous.wave >= (previous.infusion ? infusionStageCount(previous.infusion.mode) : dungeonStageCount)) throw new Error('Dungeon complete. Return to Gameplay to replay a stage.');
  const starter = previous.allies.find((ally) => !ally.captured)?.definitionId ?? 'ember';
  if (!isStarterId(starter)) throw new Error('Dungeon starter is missing.');
  const roster = previous.allies.map((ally) => {
    return ally.id;
  });
  const teamProgress = 'level' in progress ? { [starter]: progress } : progress;
  for (const id of roster) if (isStarterId(id) && !teamProgress[id]) throw new Error('Continuing character progress is missing.');
  const leaderProgress = teamProgress[starter] ?? (previous.allies.every((ally) => ally.captured) ? { level: 0, evolution: 1 } : undefined);
  if (!leaderProgress) throw new Error('Continuing leader progress is missing.');
  const equipment: ConduitLoadouts = {};
  for (const ally of previous.allies) {
    if (ally.conduits) equipment[ally.id] = [...ally.conduits];
  }
  const captures = previous.allies.flatMap((ally) => ally.captured ? [ally.captured] : []);
  const state = 'mode' in destination
    ? createInfusionBattle(destination.mode, destination.stage + 1, previous.seed, starter, leaderProgress, roster, teamProgress, equipment, captures, previous.conduitUpgrades)
    : createDungeonBattle(destination.element, destination.stage + 1, previous.seed, starter, leaderProgress, roster, teamProgress, equipment, captures, previous.conduitUpgrades);
  for (const ally of state.allies) {
    const prior = previous.allies.find((unit) => unit.id === ally.id);
    if (!prior) throw new Error('Continuing character is missing from the previous encounter.');
    ally.shatter = Math.min(prior.shatter, ally.stats.shatterCapacity);
    if (prior.conduitCharges) ally.conduitCharges = { ...prior.conduitCharges };
  }
  if (previous.conduitSeed !== undefined) state.conduitSeed = previous.conduitSeed;
  if (previous.componentSeed !== undefined) state.componentSeed = previous.componentSeed;
  return { state, events: [{ kind: 'turn', source: '', target: '', amount: state.wave, critical: false,
    message: 'Next stage. Health and cooldowns reset; Shatter Gauge carries over.' }] };
}

export function nextWave(previous: BattleState): BattleResult {
  if (previous.dungeon || previous.infusion) throw new Error('Dungeon stages must be started as separate encounters.');
  if (previous.phase !== 'cleared') throw new Error('Defeat this wave before advancing.');
  const state = structuredClone(previous);
  const events: BattleEvent[] = [];
  state.wave++;
  state.enemies = spawnWave(state.wave);
  state.phase = 'player';
  newTurn(state, events);
  events.push({ kind: 'turn', source: '', target: '', amount: state.wave, critical: false, message: `Wave ${state.wave}: enemies grow stronger. Health, shields, Shatter Gauge and recovery carry over.` });
  const advanced = advanceUnavailableTurns(state);
  return { state: advanced.state, events: [...events, ...advanced.events] };
}
