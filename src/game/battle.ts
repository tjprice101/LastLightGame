import { actionIds, enemies, formatStat, resolveFighter, isActionId, shatterGauge, type ActionId, type EnemyId, type Stats, type FighterDefinition } from '../content/combat';
import { getStarter, isStarterId, type StarterId } from '../content/starters';
import { type CharacterProgress } from '../content/progression';
import { fractalisDrop, storyFractalisDrop, treasuryFractalisDrop, rollDrop, rollStagedLycalis } from '../content/loot-random';
import { dungeonEncounter, materialDrops, type PlayableDungeon } from '../content/dungeons';
import { elementSources } from '../content/element-migration';
import { materialName } from '../content/dungeon-art';
import { infusionEncounter, infusionDrops, capturedEnemyStats } from '../content/infusions';
import { dungeonStageCount, infusionStageCount, type InfusionModeId, type ElementId } from '../content/activities';
import { enemyGrowth, enemyCombatStats } from '../content/stat-growth';
import { enemyAbilityMultiplier, enemySkills, scheduledEnemySkill, type EnemySkill } from '../content/enemy-skills';
import { getConduit, isConduitId, validateConduitUpgrades, type ConduitId, type ConduitSlots, type ConduitLoadouts, type ConduitUpgrades } from '../content/conduits';
import { rollMachineComponents } from '../content/mechanical-components';
import { machineConduitDrops } from '../content/machines';
import { capturedProgress, capturedLevelCap, resolveCapturedFighter, type CapturedCharacter } from './character-instances';
import { roseCaptureAllowed } from '../content/roses';
import { getCreature } from '../content/creatures';
import { elementAccents } from '../content/dungeon-art';
import { characterName } from '../content/character-art';
import { basicActionName } from '../content/combat';
import { warEncounter, warStageCount, rollWarRewards, type WarCharacterId } from '../content/elemental-war';
import type { ElementalEffectTag } from '../content/elemental-effects';
import type { KitPilotState } from '../content/kit-pilots';
import { debuffSnapshot } from './battle-debuffs';
import { buffSnapshot, type BattleBuffSnapshot } from './battle-buffs';
import { pilotAfterDirectActivation, pilotAuthoredShieldAbsorbed, pilotBurnDamage, pilotEffectiveHeal, pilotOutgoingBonus, pilotPrepareStarter } from './kit-pilots';
import type { OmnicMemory, ConduitMechanic } from './kit-conduits';
import { masterChestDrops, validateMasterCharacter, type MasterConduitId, type MasterLoadouts } from '../content/master-conduits';
import { storyEncounter, storyCreature, storyDrops, storyRules } from '../content/story';
import { bossLootMultiplier, bossLootRange } from '../content/final-boss-loot';
import { calamityEncounter, calamityPatterns, calamityChest, type CalamityActivityId, type CalamityTier } from '../content/calamity';
import { initializeConduits, equipped, gear, value, effectiveDefense, nativeTargetDefense, afterConduitImpact, conduitActionCost, conduitActionBlocked, recoveryNormal,
  prepareConduitAction, conduitHitModifiers, recordConduitHit, finishConduitAction, applyConduitBurn, applyConduitWeaken,
  nativeHeal, nativeShield, nativeGauge, supportEffect, conduitTurnStart, conduitIncoming, conduitBurnTick, afterConduitBurn,
  conduitDeaths, forcedConduitTarget, conduitSuppressSkill, expireNativeShields, type ConduitRuntimeState, type ConduitActivation } from './conduit-runtime';
import { calamiticActionReason, calamiticShieldBypass, settleCalamiticDebt } from './calamitic-conduits';
import { hasNativeIdentity, nativeAction, nativeAfterAction, nativePrimaryHit, nativeInstructionDamage, nativeCleanup,
  nativeBurnPhase, nativeEnemyCompleted, nativePhaseEnd, nativeTurnStart, attachNativeView, type NativeView, type NativeKitState, type NativeDamageKind } from './native-kits';

export interface Combatant {
  id: string;
  definitionId: string;
  side: 'ally' | 'enemy';
  name: string;
  element: ElementId;
  level: number | null;
  evolution?: number;
  conduits?: ConduitSlots;
  masterConduit?: MasterConduitId;
  conduitRuntime?: ConduitRuntimeState;
  stats: Stats;
  hp: number;
  shield: number;
  shatter: number;
  spent: boolean;
  recoverThrough: number;
  readyRound: Record<'skill1' | 'skill2', number> & { ultimate?: number };
  burn: { damage: number; turns: number; sourceId?: string; origin?: 'native' | 'rose' | 'conduit' };
  weakened: number;
  weakenFraction: number;
  weakenOrigin?: 'native' | 'rose' | 'conduit';
  weakenSourceId?: string;
  attackBoost?: { fraction: number; throughRound: number; sourceId?: string; origin?: 'native' | 'conduit' };
  omnicMemory?: Record<string, OmnicMemory>;
  omnicProtection?: number;
  conduitCharges?: {
    burnFocus?: boolean;
    normalMomentum?: boolean;
    weakenPierce?: boolean;
    emberSeals?: number;
    emberSealRound?: number;
    undertideUsedRound?: number;
    faultkeeperWard?: boolean;
    verdantNormal?: boolean;
    stormstepSkill1?: boolean;
    stormstepSkill2?: boolean;
    skythread?: boolean;
    dawnWitness?: number;
    stillhour?: boolean;
    paradox?: boolean;
  };
  conduitMarks?: Partial<Record<string, number>>;
  pilot?: KitPilotState;
  native?: NativeKitState;
  kit: FighterDefinition | null;
  art?: string;
  color?: string;
  enemySkills?: EnemySkill[];
  boss?: boolean;
  creatureId?: string;
  captured?: CapturedCharacter;
}
export interface BattleState {
  conduitRulesVersion?: number;
  wave: number;
  round: number;
  phase: 'player' | 'cleared' | 'defeat';
  seed: number;
  rewardSeed: number;
  captureSeed?: number;
  lycalisSeed?: number;
  conduitSeed?: number;
  machineConduits?: Partial<Record<ConduitId, number>>;
  componentSeed?: number;
  masterChestSeed?: number;
  recruitmentSeed?: number;
  encounterSeed?: number;
  conduitUpgrades?: ConduitUpgrades;
  allies: Combatant[];
  enemies: Combatant[];
  dungeon?: { element: PlayableDungeon; stage: number };
  infusion?: { mode: InfusionModeId; stage: number; schedule?: 'legacy' | 'caps' };
  war?: { character: WarCharacterId; stage: number };
  story?: { storyStage: number };
  calamity?: { activity: CalamityActivityId; tier: CalamityTier };
}
export interface BattleEvent {
  nativeKind?: NativeDamageKind;
  origin?: 'native' | 'conduit';
  kind: 'attack' | 'damage' | 'heal' | 'shield' | 'status' | 'turn' | 'reward';
  source: string;
  target: string;
  amount: number;
  critical: boolean;
  elementalCritical?: boolean;
  message: string;
  action?: ActionId;
  enhancedAttack?: boolean;
  abilityName?: string;
  materials?: Record<string, number>;
  shieldRemaining?: number;
  shieldAbsorbed?: number;
  buffs?: BattleBuffSnapshot;
  periodic?: boolean;
  debuffs?: BattleDebuffSnapshot;
  capture?: { creatureId: string; level: number };
  lycalis?: number;
  conduits?: Partial<Record<ConduitId, number>>;
  mechanicalComponents?: number;
  masterChests?: number;
  calamityChest?: string;
  recruitment?: WarCharacterId;
  recruitmentOutcome?: 'new' | 'duplicate';
  storyBonus?: { fractalis: number; lycalis: number };
  conduitUpgrades?: ConduitUpgrades;
  elementalEffect?: ElementalEffectTag;
  nativeView?: NativeView;
}
export interface BattleDebuffSnapshot {
  burn?: { damage: number; turns: number };
  weakened: number;
  weakenFraction: number;
  marks?: { bearerId: string; stacks: number }[];
  elementalEffects?: ElementalEffectTag[];
}
export interface BattleResult { state: BattleState; events: BattleEvent[] }

export function withMasterLoadouts(state: BattleState, masters: MasterLoadouts = {}): BattleState {
  for (const [character, id] of Object.entries(masters)) {
    if (id !== null && id !== undefined) validateMasterCharacter(id, character);
  }
  for (const ally of state.allies) {
    if (!isStarterId(ally.definitionId) || ally.captured) continue;
    const id = masters[ally.definitionId];
    if (id) ally.masterConduit = id;
  }
  if (state.conduitRulesVersion === undefined) initializeConduits(state);
  return state;
}

export function createWarBattle(character: WarCharacterId, stage: number, seed: number, starter: StarterId, progress: CharacterProgress,
  roster: readonly string[] = [starter], teamProgress: Partial<Record<StarterId, CharacterProgress>> = { [starter]: progress },
  equipment: ConduitLoadouts = {}, captures: readonly CapturedCharacter[] = [], upgrades: ConduitUpgrades = {}): BattleState {
  const encounter = warEncounter(character, stage);
  const state = createBattle(seed, roster, teamProgress, equipment, captures, upgrades);
  const unit = combatant(`war-${character}-${stage}`, character, encounter.enemyName, 'enemy', encounter.stats, encounter.element);
  Object.assign(unit, { level: encounter.level, evolution: encounter.evolution, art: encounter.art,
    color: encounter.color, boss: true, enemySkills: encounter.skills });
  state.wave = stage;
  state.war = { character, stage };
  state.enemies = [unit];
  state.lycalisSeed = ((seed ^ 0xa0761d65) >>> 0) || 1;
  state.recruitmentSeed = ((seed ^ 0xe7037ed1) >>> 0) || 1;
  return state;
}

function warRewardRoll(state: BattleState, key: 'lycalisSeed' | 'recruitmentSeed'): number {
  const value = state[key];
  if (value === undefined || value === 0) throw new Error('Elemental War reward stream is missing.');
  let seed = value;
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  state[key] = seed >>> 0;
  return state[key] / 0x100000000;
}

function combatant(id: string, definitionId: Combatant['definitionId'], name: string, side: Combatant['side'], stats: Stats, element: ElementId): Combatant {
  return {
    id, definitionId, name, element, side, level: null, stats: { ...stats }, hp: stats.health, shield: 0,
    shatter: shatterGauge.starting, spent: false, recoverThrough: 0,
    readyRound: { skill1: 1, skill2: 1 }, burn: { damage: 0, turns: 0 }, weakened: 0, weakenFraction: 0.25, kit: null,
  };
}

export function capCapturedBattleLevels(state: BattleState): void {
  for (const unit of state.allies) {
    if (!unit.captured) continue;
    if (unit.captured.level !== undefined) unit.captured.level = Math.min(capturedLevelCap, unit.captured.level);
    if (unit.level === null || unit.level <= capturedLevelCap) continue;
    const before = capturedEnemyStats(unit.level, 140);
    const after = capturedEnemyStats(capturedLevelCap);
    for (const stat of ['health', 'damage', 'defense'] as const) {
      const ratio = after[stat] / before[stat];
      unit.stats[stat] *= ratio;
      if (unit.kit) unit.kit.stats[stat] *= ratio;
    }
    const healthRatio = after.health / before.health;
    unit.hp *= healthRatio;
    unit.shield *= healthRatio;
    unit.level = capturedLevelCap;
  }
}

function spawnWave(wave: number): Combatant[] {
  const level = Math.min(wave, enemyGrowth.maximumLevel);
  return (['goblin', 'imp', 'golem'] as const).map((id, index) => {
    const definition = enemies[id];
    const unit = combatant(`enemy-${wave}-${index}`, id, definition.name, 'enemy', enemyCombatStats(level, false), definition.element);
    unit.level = level;
    unit.creatureId = `adventure:${id}`;
    const strike = id === 'goblin' ? 'Wildwood Ambush' : id === 'imp' ? 'Cinder Mischief' : 'Faultline Crush';
    unit.enemySkills = enemySkills(level, false, strike, enemyAbilityMultiplier(level));
    return unit;
  });
}

export function createBattle(seed = 1729, roster: readonly string[] = ['ember'], progress: Partial<Record<StarterId, CharacterProgress>> = {}, equipment: ConduitLoadouts = {}, captures: readonly CapturedCharacter[] = [], upgrades: ConduitUpgrades = {}): BattleState {
  if (!Number.isInteger(seed) || seed < 1 || seed > 0xffffffff) throw new Error('Battle seed must be a nonzero uint32.');
  if (!roster.length || roster.length > 3 || new Set(roster).size !== roster.length || !roster.every((id) => isStarterId(id) || captures.some((copy) => copy.instanceId === id))) {
    throw new Error('Battle roster requires distinct valid starters.');
  }

  const snapshot = validateConduitUpgrades(upgrades);
  const state: BattleState = {
    wave: 1, round: 1, phase: 'player', seed, rewardSeed: seed, captureSeed: seed,
    conduitUpgrades: snapshot,
    allies: roster.map((id) => {
      if (!isStarterId(id)) {
        const copy = captures.find((entry) => entry.instanceId === id);
        if (!copy) throw new Error('Captured squad instance is missing.');
        const creature = getCreature(copy.creatureId);
        const kit = resolveCapturedFighter(copy, equipment[id], snapshot);
        const unit = combatant(id, creature.id, `${creature.name} · Copy ${captures.findIndex((entry) => entry.instanceId === id) + 1}`, 'ally', kit.stats, creature.element);
        unit.kit = kit;
        unit.level = capturedProgress(copy).level;
        unit.evolution = capturedProgress(copy).tier + 1;
        unit.captured = structuredClone(copy);
        if (unit.captured.level !== undefined) unit.captured.level = unit.level;
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
      if (id === 'vaelor') unit.native = { beat: 0, beatRound: 1 };
      unit.level = progress[id]?.level ?? null;
      unit.evolution = progress[id]?.evolution ?? 1;
      if (equipment[id]) unit.conduits = [...equipment[id]];
      return unit;
    }),
    enemies: spawnWave(1),
  };
  initializeConduits(state);
  return state;
}

export function createDungeonBattle(element: PlayableDungeon, stage: number, seed: number, starter: StarterId, progress: CharacterProgress,
  roster: readonly string[] = [starter], teamProgress: Partial<Record<StarterId, CharacterProgress>> = { [starter]: progress }, equipment: ConduitLoadouts = {}, captures: readonly CapturedCharacter[] = [], upgrades: ConduitUpgrades = {}, encounterSeed?: number): BattleState {
  const state = createBattle(seed, roster, teamProgress, equipment, captures, upgrades);
  let familySeed = encounterSeed ?? (((seed ^ 0x9e3779b9) >>> 0) || 1);
  if (!Number.isInteger(familySeed) || familySeed < 1 || familySeed > 0xffffffff) throw new Error('Invalid dungeon encounter seed.');
  const encounter = dungeonEncounter(element, stage);
  state.wave = stage;
  state.dungeon = { element, stage };
  state.enemies = Array.from({ length: encounter.boss ? 1 : 2 }, (_, index) => {
    familySeed ^= familySeed << 13;
    familySeed ^= familySeed >>> 17;
    familySeed ^= familySeed << 5;
    familySeed >>>= 0;
    state.encounterSeed = familySeed;
    const family = Math.floor(familySeed / 0x100000000 * elementSources[element].length);
    const selected = dungeonEncounter(element, stage, family);
    const unit = combatant(`dungeon-${element}-${stage}-${index}`, 'goblin', selected.enemy.name, 'enemy', selected.stats, element);
    unit.level = selected.level;
    unit.creatureId = selected.creatureId;
    unit.art = selected.enemy.art;
    unit.color = selected.color;
    unit.boss = selected.boss;
    unit.enemySkills = enemySkills(selected.level, selected.boss, selected.ability, selected.abilityMultiplier);
    return unit;
  });
  return state;
}

export function createStoryBattle(stage: number, seed: number, starter: StarterId, progress: CharacterProgress,
  roster: readonly string[] = [starter], teamProgress: Partial<Record<StarterId, CharacterProgress>> = { [starter]: progress },
  equipment: ConduitLoadouts = {}, captures: readonly CapturedCharacter[] = [], upgrades: ConduitUpgrades = {}, encounterSeed?: number): BattleState {
  const encounter = storyEncounter(stage);
  const state = createBattle(seed, roster, teamProgress, equipment, captures, upgrades);
  let familySeed = encounterSeed ?? (((seed ^ 0x9e3779b9) >>> 0) || 1);
  if (!Number.isInteger(familySeed) || familySeed < 1 || familySeed > 0xffffffff) throw new Error('Invalid Story encounter seed.');
  state.wave = stage;
  state.story = { storyStage: stage };
  state.enemies = Array.from({ length: encounter.boss ? 1 : 2 }, (_, index) => {
    familySeed ^= familySeed << 13;
    familySeed ^= familySeed >>> 17;
    familySeed ^= familySeed << 5;
    familySeed >>>= 0;
    state.encounterSeed = familySeed;
    const identity = encounter.boss ? 0 : Math.floor(familySeed / 0x100000000 * 4);
    const creature = storyCreature(stage, identity);
    const unit = combatant(`story-${stage}-${index}`, creature.id, creature.name, 'enemy', encounter.stats, encounter.element);
    unit.level = encounter.level;
    unit.creatureId = creature.id;
    unit.art = creature.art;
    unit.color = encounter.color;
    unit.boss = encounter.boss;
    unit.enemySkills = enemySkills(encounter.level, encounter.boss, `${creature.name} Strike`, encounter.abilityMultiplier);
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
  roster: readonly string[] = [starter], teamProgress: Partial<Record<StarterId, CharacterProgress>> = { [starter]: progress }, equipment: ConduitLoadouts = {}, captures: readonly CapturedCharacter[] = [], upgrades: ConduitUpgrades = {}, schedule: 'legacy' | 'caps' = 'caps'): BattleState {
  const encounter = infusionEncounter(mode, stage, schedule);
  const state = createBattle(seed, roster, teamProgress, equipment, captures, upgrades);
  state.wave = stage;
  state.infusion = { mode, stage, schedule };
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

export function createCalamityBattle(activity: CalamityActivityId, tier: CalamityTier, seed: number, starter: StarterId, progress: CharacterProgress,
  roster: readonly string[] = [starter], teamProgress: Partial<Record<StarterId, CharacterProgress>> = { [starter]: progress },
  equipment: ConduitLoadouts = {}, captures: readonly CapturedCharacter[] = [], upgrades: ConduitUpgrades = {}): BattleState {
  const encounter = calamityEncounter(activity, tier);
  const state = createBattle(seed, roster, teamProgress, equipment, captures, upgrades);
  state.calamity = { activity, tier };
  const unit = combatant(`calamity-${activity}`, `calamity:${activity}`, encounter.name, 'enemy', encounter.stats, encounter.element);
  Object.assign(unit, { level: encounter.level, boss: true, color: '#df3548', enemySkills: encounter.skills,
    creatureId: `calamity:${activity}`, art: getCreature(`calamity:${activity}`).art });
  state.enemies = [unit];
  return state;
}

/** Elemental Crits multiply the normal critical multiplier by this factor. */
export const elementalCritFactor = 1.5;

/** Rolls a hit's critical outcome. Rates above 100% always crit and roll (rate - 100%) for an Elemental Crit; no extra roll otherwise. */
export function rollCritical(state: BattleState, rate: number): { critical: boolean; elemental: boolean } {
  const critical = roll(state) < Math.min(1, rate);
  const elemental = critical && rate > 1 && roll(state) < Math.min(1, rate - 1);
  return { critical, elemental };
}

export function damageAmount(base: number, multiplier: number, defense: number, critical: boolean, critMultiplier = 1.5): number {
  if (![base, multiplier, defense, critMultiplier].every(Number.isFinite) || base < 0 || multiplier < 0 || defense < 0 || critMultiplier < 1) {
    throw new Error('Invalid damage inputs.');
  }
  const mitigation = base === 0 ? 0 : 1 / (1 + defense / base);
  return Math.max(1, Math.round(base * multiplier * (critical ? critMultiplier : 1) * mitigation));
}

export function actionUnavailable(state: BattleState, actor: Combatant, action: ActionId): string | null {
  if (state.phase !== 'player') return 'This wave is not accepting actions.';
  if (actor.side !== 'ally' || !state.allies.some((ally) => ally.id === actor.id)) return 'Choose a team member.';
  if (action !== 'light' && actor.kit?.unavailableActions?.includes(action)) return 'This captured form does not have this ability.';
  if (actor.hp <= 0) return 'This character is defeated.';
  if (actor.spent) return 'This character has already acted this turn.';
  const calamiticReason = calamiticActionReason(state, actor, action);
  if (calamiticReason) return calamiticReason;
  if (conduitActionBlocked(actor, state)) return 'This character cannot take another action this turn.';
  if (actor.recoverThrough >= state.round && !(action === 'light' && recoveryNormal(actor))) return 'Recovering this turn after Last Flare.';
  if (action === 'ultimate' && (actor.readyRound.ultimate ?? 0) > state.round) return `Ready on turn ${actor.readyRound.ultimate}.`;
  const gaugeCost = actionGaugeCost(actor, action, state);
  if (actor.shatter < gaugeCost) return `Requires ${gaugeCost} Shatter Gauge.`;
  return null;
}

function actionGaugeCost(actor: Combatant, action: ActionId, state: BattleState): number {
  const cost = shatterGauge.costs[action];
  return conduitActionCost(actor, action, state, cost);
}

function event(events: BattleEvent[], kind: BattleEvent['kind'], source: Combatant, target: Combatant, amount: number, message: string, critical = false): void {
  events.push({ kind, source: source.id, target: target.id, amount, message, critical,
    ...(target.side === 'ally' ? { buffs: buffSnapshot(target) } : {}),
    ...(kind === 'status' || kind === 'damage' ? { debuffs: debuffSnapshot(target) } : {}) });
}

function hurt(target: Combatant, amount: number, source: Combatant, events: BattleEvent[], critical = false, periodic = false, conduitReduction = 0, elementalCritical = false, shieldBypass = 0): void {
  if (conduitReduction > 0) amount = Math.max(1, Math.round(amount * (1 - conduitReduction)));
  const bypassed = Math.floor(amount * shieldBypass);
  const absorbed = Math.min(target.shield, amount - bypassed);
  target.shield -= absorbed;
  const loss = Math.min(target.hp, amount - absorbed);
  target.hp -= loss;
  if (target.hp === 0) {
    delete target.conduitMarks;
    delete target.pilot;
  }
  event(events, 'damage', source, target, loss,
    `${target.name}: ${formatStat(loss)} damage${elementalCritical ? ' (Elemental Crit)' : critical ? ' (critical)' : ''}${absorbed ? `, ${formatStat(absorbed)} shield absorbed` : ''}${target.hp === 0 ? ' - defeated' : ''}.`, critical);
  events[events.length - 1].shieldRemaining = target.shield;
  if (elementalCritical) events[events.length - 1].elementalCritical = true;
  if (periodic) {
    events[events.length - 1].periodic = true;
    events[events.length - 1].debuffs = debuffSnapshot(target);
  }
}

function healTeam(state: BattleState, source: Combatant, amount: number, events: BattleEvent[], percent = false, ctx?: ConduitActivation): void {
  for (const ally of state.allies.filter((unit) => unit.hp > 0)) {
    nativeHeal(state, source, ally, percent ? Math.max(1, Math.round(ally.stats.health * amount)) : amount, events, !percent, ctx);
  }
}

function shieldTeam(state: BattleState, source: Combatant, amount: number, events: BattleEvent[], authored = true): void {
  const recipients = state.allies.filter(unit => unit.hp > 0);
  const concentrated = equipped(source, 'master-tide-2');
  const selected = concentrated ? [...recipients].sort((a, b) => a.hp / a.stats.health - b.hp / b.stats.health).slice(0, 1) : recipients;
  for (const ally of selected) {
    if (authored) { nativeShield(state, source, ally, amount * (concentrated ? 3 : 1), events); continue; }
    const gained = Math.max(0, amount - ally.shield);
    if (gained > 0) {
      delete ally.pilot?.authoredShieldSourceId;
      if (authored && source.hp > 0) {
        ally.pilot ??= {};
        ally.pilot.authoredShieldSourceId = source.id;
      }
    }
    ally.shield = Math.max(ally.shield, amount);
    event(events, 'shield', source, ally, gained, `${ally.name} has ${formatStat(ally.shield)} shield.`);
    if (authored && gained > 0) {
    }
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
    if (state.calamity) {
      const chest = calamityChest(state.calamity.activity, state.calamity.tier);
      events.push({ kind: 'reward', source: enemy.id, target: enemy.id, amount: 0, critical: false,
        calamityChest: chest.id, message: `${enemy.name} dropped 1 ${chest.name}.` });
      continue;
    }
    if (state.war) {
      const reward = rollWarRewards(state.war.stage, rewardRoll,
        () => warRewardRoll(state, 'lycalisSeed'), () => warRewardRoll(state, 'recruitmentSeed'));
      events.push({ kind: 'reward', source: enemy.id, target: enemy.id, amount: reward.amount, critical: false,
        ...(reward.lycalis ? { lycalis: reward.lycalis } : {}),
        ...(reward.recruitment ? { recruitment: state.war.character } : {}),
        message: `${enemy.name} dropped ${reward.amount} Prismatica${reward.lycalis ? ` and ${reward.lycalis} Null-Prismatica` : ''}.` });
      continue;
    }
    const amount = rollDrop(bossLootRange(state.story ? storyFractalisDrop(enemy.level) : state.infusion?.mode === 'treasury' ? treasuryFractalisDrop(enemy.level) : fractalisDrop(enemy.level, state.infusion?.mode === 'roses' ? 140 : 120),
      bossLootMultiplier(state, enemy.boss === true)), rewardRoll);
    if (amount === undefined) throw new Error('Guaranteed Prismatica reward did not drop.');
    const materials = state.story ? storyDrops(state.story.storyStage, rewardRoll)
      : state.infusion ? infusionDrops(state.infusion.mode, state.infusion.stage, rewardRoll, state.infusion.schedule ?? 'legacy')
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
    }, state.machineConduits) : undefined;
    if (conduits) state.machineConduits = { ...state.machineConduits, ...conduits };
    const masterChests = state.infusion?.mode === 'machines' ? masterChestDrops(state.infusion.stage, enemy.boss === true, () => {
      let seed = state.masterChestSeed ?? (((previous.rewardSeed ^ 0x7f4a7c15) >>> 0) || 1);
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      state.masterChestSeed = seed >>> 0;
      return state.masterChestSeed / 0x100000000;
    }) : 0;
    if (state.infusion && state.infusion.mode !== 'machines' && enemy.creatureId) {
      let seed = state.captureSeed ?? state.seed;
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      state.captureSeed = seed >>> 0;
      if ((state.infusion.mode !== 'roses' || roseCaptureAllowed(enemy.level)) && captureSucceeds(state.captureSeed / 0x100000000)) capture = { creatureId: enemy.creatureId, level: Math.min(capturedLevelCap, enemy.level) };
      if (state.infusion.mode !== 'treasury' && state.infusion.mode !== 'roses') lycalis = rollStagedLycalis(state.infusion.mode, enemy.level, () => {
        let premiumSeed = state.lycalisSeed ?? (((previous.seed ^ 0x9e3779b9) >>> 0) || 1);
        premiumSeed ^= premiumSeed << 13;
        premiumSeed ^= premiumSeed >>> 17;
        premiumSeed ^= premiumSeed << 5;
        state.lycalisSeed = premiumSeed >>> 0;
        return state.lycalisSeed / 0x100000000;
      }, state.infusion.stage);
    }
    events.push({ kind: 'reward', source: enemy.id, target: '', amount, critical: false,
      ...(materials ? { materials } : {}),
      ...(capture ? { capture } : {}),
      ...(lycalis ? { lycalis } : {}),
      ...(conduits ? { conduits } : {}),
      ...(conduits && Object.keys(conduits).length ? { conduitUpgrades: state.conduitUpgrades } : {}),
      ...(mechanicalComponents ? { mechanicalComponents } : {}),
      ...(masterChests ? { masterChests } : {}),
      message: `${enemy.name} drops +${amount} Prismatica${materialText ? ` and ${materialText}` : ''}${lycalis ? ` and +${lycalis} Null-Prismatica` : ''}${mechanicalComponents ? ` and +${mechanicalComponents} Broken Mechanical Components` : ''}${capture ? ` and a captured ${enemy.name} Elemental-Devourer` : ''}${conduits && Object.keys(conduits).length ? ` and ${Object.keys(conduits).filter(isConduitId).map((id) => getConduit(id).name).join(', ')}` : ''}.` });
  }

}

export function captureSucceeds(value: number): boolean {
  if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error('Capture roll must be in [0, 1).');
  return value < .2;
}

export function act(previous: BattleState, actorId: string, action: ActionId, targetId: string): BattleResult {
  if (!isActionId(action)) throw new Error('Unknown combat action.');
  const original = previous.allies.find((unit) => unit.id === actorId);
  if (!original) throw new Error('Unknown team member.');
  const reason = actionUnavailable(previous, original, action);
  if (reason) throw new Error(reason);
  const native = hasNativeIdentity(original);
  const nativeAbility = action === 'light' ? undefined : original.kit?.abilities[action];
  const allyTargeted = native && nativeAbility?.targets === 'one-ally';
  if (allyTargeted && !previous.allies.some(ally => ally.id === targetId && ally.hp > 0 &&
    (!nativeAbility.excludeSelf || ally.id !== actorId || previous.allies.filter(unit => unit.hp > 0).length === 1))) {
    throw new Error(nativeAbility.excludeSelf ? 'Choose another living ally to protect.' : 'Choose a living ally target.');
  }
  const support = native ? allyTargeted || (action !== 'light' && nativeAbility?.strength.damageMultiplier === undefined &&
    nativeAbility?.targets !== 'all-enemies' && !(original.definitionId === 'thornia' && action === 'skill1') &&
    !(original.definitionId === 'aurora' && action === 'skill1')) :
    (action === 'skill2' && equipped(original, 'master-nerithe-2')) || (action !== 'light' && original.kit?.abilities[action].targets === 'all-allies') ||
    (action === 'skill2' && (original.definitionId === 'tide' || original.definitionId === 'sprout') && !original.captured);
  if (!support && !previous.enemies.some((enemy) => enemy.id === targetId && enemy.hp > 0)) {
    throw new Error('Choose a living enemy target.');
  }
  const state = structuredClone(previous);
  const actor = state.allies.find((unit) => unit.id === actorId);
  if (!actor) throw new Error('Team state is inconsistent.');
  const definition = actor.kit;
  if (!definition) throw new Error('Ally combat kit is missing.');
  const strength = action === 'light' ? null : definition.abilities[action].strength;
  const events: BattleEvent[] = [];
  const name = action === 'light' ? basicActionName(actor.definitionId, action) : definition.abilities[action].name;
  const paid = actionGaugeCost(actor, action, state);
  const nativeAll = native ? nativeAbility?.targets === 'all-enemies' : !actor.captured && (action === 'ultimate' || (action === 'skill2' && actor.definitionId === 'ember') ||
    (action !== 'light' && definition.abilities[action].targets === 'all-enemies'));
  actor.shatter -= paid;
  const activation = prepareConduitAction(state, actor, action, paid, nativeAll);
  const priorInstruction = actor.native?.instruction;
  events.push({ kind: 'attack', source: actor.id, target: support ? actor.id : targetId, amount: 0, critical: false, message: `${actor.name} uses ${name}.`, action, abilityName: name });
  actor.spent = !activation.freeAction;
  if (action === 'ultimate' && !equipped(actor, 'master-nerithe-3')) actor.recoverThrough = state.round + 1;
  nativeGauge(state, actor, shatterGauge.gains[action] + (action === 'light' ? (definition.passive.lightGaugeBonus ?? 0) : 0), events);
  if (action === 'skill1' || action === 'skill2') actor.readyRound[action] = state.round;
  if (action === 'ultimate' && actor.captured) actor.readyRound.ultimate = state.round + definition.abilities.ultimate.cooldown;
  if (native) {
    const direct = (selected: Combatant[], coefficient: number, pierce = 0, criticalBonus = 0) => {
      const targets = activation.all ? state.enemies.filter(enemy => enemy.hp > 0) :
        nativeAll ? selected.filter(enemy => enemy.id === targetId) : selected;
      for (const target of targets) {
        if (target.hp <= 0) continue;
        const rolled = rollCritical(state, actor.stats.crit + criticalBonus + activation.criticalBonus);
        const critical = !activation.forbidden && (activation.guaranteed || rolled.critical);
        const elemental = critical && rolled.elemental;
        const modifiers = conduitHitModifiers(state, actor, target, activation, critical);
        const criticalMultiplier = modifiers.critMultiplier ?? actor.stats.critMultiplier * (elemental ? elementalCritFactor : 1) *
          (critical && action !== 'light' && equipped(actor, 'judgment-lens') ? 1 + value(state, actor, 'judgment-lens', .4, .8) : 1) *
          (critical && activation.guaranteed && equipped(actor, 'falcon-sight') ? 1 + value(state, actor, 'falcon-sight', .1, .2) : 1);
        const boost = actor.attackBoost && actor.attackBoost.throughRound >= state.round ? 1 + actor.attackBoost.fraction : 1;
        const offered = damageAmount(modifiers.attack, coefficient * activation.scale * boost *
          nativeInstructionDamage(state, actor) * (1 + modifiers.bonus),
          nativeTargetDefense(state, target) * (1 - Math.min(1, pierce + modifiers.pierce)), critical, criticalMultiplier);
        const shieldBefore = target.shield;
        let hpDamage = 0;
        for (let impact = 0; impact < activation.impacts && target.hp > 0; impact++) {
          const portion = Math.floor(offered / activation.impacts) + (impact === activation.impacts - 1 ? offered % activation.impacts : 0);
          hurt(target, portion, actor, events, critical, false, 0, elemental, calamiticShieldBypass(state, actor));
          events[events.length - 1].origin = 'native';
          hpDamage += events[events.length - 1].amount;
        }
        recordConduitHit(activation, target, hpDamage, critical, criticalMultiplier);
        afterConduitImpact(actor, target, activation);
        nativePrimaryHit(state, actor, target, hpDamage > 0 || shieldBefore > target.shield, events);
      }
    };
    nativeAction(state, actor, action, targetId, events, direct, activation);
    nativeAfterAction(state, actor, action, priorInstruction, events);
    finishConduitAction(state, actor, activation, events);
    conduitDeaths(state, previous, events);
    nativeCleanup(state);
    checkOutcome(state);
    awardDefeats(previous, state, events);
    return { state, events };
  }
  const priorResources = { ...actor.pilot };
  const starterBonus = pilotPrepareStarter(actor, action, events);
  let effectiveCriticalDamage = false;

  if (!support) {
    const pilotBonus = pilotOutgoingBonus(actor, action, events) + starterBonus.damage;
    const all = activation.all || (action === 'skill2' && equipped(actor, 'master-thornia-2') && (priorResources.thornAegis ?? 0) >= 3);
    const targets = state.enemies.filter((enemy) => enemy.hp > 0 && (all || enemy.id === targetId));
    let multiplier = 1;
    if (strength) {
      if (strength.damageMultiplier === undefined) throw new Error('Attack skill damage multiplier is missing.');
      multiplier = strength.damageMultiplier;
    }
    if (actor.hp <= actor.stats.health / 2) multiplier *= 1 + definition.passive.damageBonus;
    if (actor.attackBoost && actor.attackBoost.throughRound >= state.round) multiplier *= 1 + actor.attackBoost.fraction;
    for (const target of targets) {
      const rolled = rollCritical(state, actor.stats.crit + (strength?.critBonus ?? 0) + activation.criticalBonus);
      const critical = !activation.forbidden && (activation.guaranteed || rolled.critical);
      const elemental = critical && rolled.elemental;
      const modifiers = conduitHitModifiers(state, actor, target, activation, critical);
      const criticalMultiplier = modifiers.critMultiplier ?? actor.stats.critMultiplier * (elemental ? elementalCritFactor : 1) *
        (critical && action !== 'light' && equipped(actor, 'judgment-lens') ? 1 + value(state, actor, 'judgment-lens', .4, .8) : 1) *
        (critical && activation.guaranteed && equipped(actor, 'falcon-sight') ? 1 + value(state, actor, 'falcon-sight', .1, .2) : 1);
      const priorShield = target.shield;
      const priorBurnTurns = target.burn.turns;
      const secondaryCleave = action === 'skill2' && equipped(actor, 'master-thornia-2') && target.id !== targetId;
      const offered = damageAmount(modifiers.attack, multiplier * activation.scale * (secondaryCleave ? .5 : 1) *
        (1 + pilotBonus) * (1 + modifiers.bonus) * nativeInstructionDamage(state, actor),
        nativeTargetDefense(state, target) * (1 - modifiers.pierce), critical, criticalMultiplier);
      let hpDamage = 0;
      for (let impact = 0; impact < activation.impacts && target.hp > 0; impact++) {
        const portion = Math.floor(offered / activation.impacts) + (impact === activation.impacts - 1 ? offered % activation.impacts : 0);
        hurt(target, portion, actor, events, critical, false, 0, elemental, calamiticShieldBypass(state, actor));
        events[events.length - 1].origin = 'native';
        hpDamage += events[events.length - 1].amount;
      }
      recordConduitHit(activation, target, hpDamage, critical, criticalMultiplier);
      afterConduitImpact(actor, target, activation);
      const effectiveHit = hpDamage > 0 || priorShield > target.shield;
      nativePrimaryHit(state, actor, target, effectiveHit, events);
      effectiveCriticalDamage ||= critical && effectiveHit;
      if (target.hp > 0 && strength?.burnMultiplier !== undefined) {
        const damage = applyConduitBurn(state, actor, target, actor.stats.elementalDamage * strength.burnMultiplier, activation);
        const clockExtension = Math.max(0, target.burn.turns - priorBurnTurns);
        if (target.burn.turns <= 0 || damage >= target.burn.damage) {
          target.burn = { damage, turns: Math.min(6, 2 + clockExtension), sourceId: actor.id, origin: actor.kit?.pilot === 'rose-duality' ? 'rose' : 'native' };
          event(events, 'status', actor, target, damage, `${target.name} burns for ${target.burn.turns} enemy phases.`);
        }
      }
      if (target.hp > 0 && strength?.weakenFraction !== undefined) {
        applyConduitWeaken(state, actor, target, (strength.weakenFraction + starterBonus.weaken) * (secondaryCleave ? .5 : 1), events, action, secondaryCleave ? 1 : 2);
      }
    }
  }
  for (const resource of ['ember', 'bloom', 'tempest', 'thornAegis', 'duality', 'roseGrace'] as const) activation.spent[resource] = Math.max(0, (priorResources[resource] ?? 0) - (actor.pilot?.[resource] ?? 0));
  pilotAfterDirectActivation(actor, action, events, effectiveCriticalDamage);
  if (strength?.shield !== undefined || starterBonus.shield > 0) {
    shieldTeam(state, actor, (strength?.shield ?? 0) + starterBonus.shield, events);
  }
  if (strength?.healing !== undefined) {
    healTeam(state, actor, strength.healing * starterBonus.healing, events, false, activation);
  }
  if (strength?.attackBoostFraction !== undefined) {
    for (const ally of state.allies.filter((unit) => unit.hp > 0)) {
      const prior = ally.attackBoost && ally.attackBoost.throughRound >= state.round ? ally.attackBoost.fraction : 0;
      const fraction = Math.min(.65, strength.attackBoostFraction);
      const previousSourceId = ally.attackBoost && ally.attackBoost.throughRound >= state.round
        ? ally.attackBoost.sourceId : undefined;
      const sourceId = fraction >= prior ? actor.id : previousSourceId;
      ally.attackBoost = {
        fraction: Math.max(prior, fraction),
        throughRound: state.round + (equipped(actor, 'master-disciple-1') ? 3 : 1),
        ...(sourceId ? { sourceId } : {}),
        ...(fraction < prior && ally.attackBoost?.origin === 'conduit' ? { origin: 'conduit' as const } : {}),
      };
      event(events, 'status', actor, ally, ally.attackBoost.fraction * 100,
        `${ally.name}: outgoing attack damage +${formatStat(ally.attackBoost.fraction * 100)}% this and next player turn (refresh; does not stack).`);
      if (fraction > prior) supportEffect(state, actor, ally, events);
    }
  }
  nativeAfterAction(state, actor, action, priorInstruction, events);
  finishConduitAction(state, actor, activation, events);
  conduitDeaths(state, previous, events);
  checkOutcome(state);
  attachNativeView(state, events[events.length - 1]);
  awardDefeats(previous, state, events);
  return { state, events };
}

function newTurn(state: BattleState, events: BattleEvent[]): void {
  state.round++;
  for (const ally of state.allies) {
    ally.spent = false;
    if (ally.attackBoost && ally.attackBoost.throughRound < state.round) delete ally.attackBoost;
  }
  conduitTurnStart(state, events);
  nativeTurnStart(state, events);
  for (const ally of state.allies.filter((unit) => unit.hp > 0 && (unit.kit?.passive.healFraction ?? 0) > 0)) {
    if (!ally.kit) throw new Error('Passive combat kit is missing.');
    if (equipped(ally, 'master-sprout-1')) continue;
    if (equipped(ally, 'master-rosetta-1')) {
      const target = state.allies.filter(unit => unit.hp > 0).sort((a, b) => a.hp / a.stats.health - b.hp / b.stats.health)[0];
      if (target) nativeHeal(state, ally, target, target.stats.health * (target.hp < target.stats.health * .5 ? .12 : .06), events, false);
    } else healTeam(state, ally, ally.kit.passive.healFraction, events, true);
  }
  events.push({ kind: 'turn', source: '', target: '', amount: state.round, critical: false, message: `Turn ${state.round}. Only Last Flare forces next-turn recovery.` });
  attachNativeView(state, events[events.length - 1]);
}

export function endTurn(previous: BattleState): BattleResult {
  if (previous.phase !== 'player') throw new Error('There is no active player turn.');
  const state = structuredClone(previous);
  const events: BattleEvent[] = [];
  settleCalamiticDebt(state, events);
  for (const enemy of state.enemies) {
    if (enemy.hp <= 0) continue;
    const nativeBurnOwner = enemy.burn.origin !== 'conduit' && state.allies.find(unit => unit.id === enemy.burn.sourceId &&
      hasNativeIdentity(unit) && (unit.native?.burns?.[enemy.id] || unit.hp <= 0));
    nativeBurnPhase(state, enemy, events);
    if (enemy.burn.turns > 0 && !nativeBurnOwner) {
      enemy.burn.turns--;
      const source = state.allies.find((unit) => unit.id === (enemy.burn.sourceId ?? 'ember'));
      if (!source) throw new Error('Burn source is missing.');
      const priorHp = enemy.hp;
      hurt(enemy, conduitBurnTick(state, source, enemy), source, events, false, true);
      events[events.length - 1].origin = enemy.burn.origin === 'conduit' ? 'conduit' : 'native';
      if (enemy.burn.origin !== 'conduit') pilotBurnDamage(state, source, priorHp - enemy.hp, events);
      afterConduitBurn(state, source, enemy, priorHp - enemy.hp, events);
    }
    if (enemy.hp <= 0) continue;
    const living = state.allies.filter((unit) => unit.hp > 0);
    if (!living.length) break;
    const pattern = state.calamity ? calamityPatterns[state.calamity.activity] : undefined;
    let selected = living[Math.floor(roll(state) * living.length)];
    if (pattern?.targeting) selected = [...living].sort((a, b) =>
      (a.hp / a.stats.health - b.hp / b.stats.health) * (pattern.targeting === 'lowest' ? 1 : -1))[0];
    const target = forcedConduitTarget(state, enemy, selected);
    if (pattern?.shieldEvery && state.round % pattern.shieldEvery === 0) {
      const shield = Math.round(enemy.stats.health * (pattern.shieldFraction ?? 0));
      const gained = Math.max(0, shield - enemy.shield);
      enemy.shield = Math.max(shield, enemy.shield);
      event(events, 'shield', enemy, enemy, gained, `${enemy.name} refreshes its barrier to ${enemy.shield}.`);
      events[events.length - 1].shieldRemaining = enemy.shield;
    }
    if (pattern?.healEvery && state.round % pattern.healEvery === 0) {
      const restored = Math.min(enemy.stats.health - enemy.hp, Math.round(enemy.stats.health * (pattern.healFraction ?? 0)));
      enemy.hp += restored;
      event(events, 'heal', enemy, enemy, restored, `${enemy.name} restores ${restored} HP.`);
    }
    const rolledCritical = roll(state) < enemy.stats.crit;
    const critical = rolledCritical && !((gear(enemy).numbers.judgmentThrough ?? 0) >= state.round);
    const scheduleRound = state.round - (gear(enemy).numbers.scheduleShift ?? 0);
    let ability = scheduleRound > 0 ? scheduledEnemySkill(enemy.enemySkills ?? [], scheduleRound) : undefined;
    if (ability && conduitSuppressSkill(enemy)) ability = undefined;
    events.push({ kind: 'attack', source: enemy.id, target: target.id, amount: 0, critical: false,
      message: ability ? `${enemy.name} uses ${ability.name} on ${target.name}.` : `${enemy.name} attacks ${target.name}.`,
      action: ability?.action ?? 'light', enhancedAttack: !!ability, abilityName: ability?.name });
    const multiplier = (ability?.multiplier ?? 1) * (enemy.weakened > 0 ? 1 - enemy.weakenFraction : 1);
    const omnicProtection = target.omnicProtection ?? 0;
    delete target.omnicProtection;
    const criticalMultiplier = critical && gear(target).numbers.criticalSeal ? 1 : enemy.stats.critMultiplier;
    if (critical) delete gear(target).numbers.criticalSeal;
    const incoming = damageAmount(enemy.stats.damage, multiplier, effectiveDefense(state, target), critical, criticalMultiplier) * (1 - omnicProtection);
    const hits = pattern?.hits ?? 1;
    const total = Math.round(incoming);
    const damageStart = events.length;
    delete enemy.native;
    for (let hit = 0; hit < hits && target.hp > 0; hit++) {
      const amount = hit === hits - 1 ? total - Math.floor(total / hits) * (hits - 1) : Math.floor(total / hits);
      conduitIncoming(state, enemy, target, hits === 1 ? incoming : amount, critical, !!ability, events, ability?.action ?? 'light');
    }
    nativeEnemyCompleted(state, enemy, events.slice(damageStart).some(entry =>
      entry.kind === 'damage' && entry.source === enemy.id && (entry.amount > 0 ||
        (entry.shieldAbsorbed ?? 0) > 0)), events);
    if (enemy.hp > 0 && enemy.weakened > 0) {
      enemy.weakened--;
      if (enemy.weakened === 0) enemy.weakenFraction = 0;
      if (enemy.weakened === 0) delete enemy.weakenOrigin;
      if (enemy.weakened === 0) delete enemy.weakenSourceId;
      event(events, 'status', enemy, enemy, enemy.weakened,
        enemy.weakened > 0 ? `${enemy.name}'s Weaken has ${enemy.weakened} enemy phase remaining.` : `${enemy.name}'s Weaken expires.`);
    }
    conduitDeaths(state, previous, events);
    attachNativeView(state, events[events.length - 1]);
  }
  nativePhaseEnd(state, events);
  expireNativeShields(state, events);
  conduitDeaths(state, previous, events);
  checkOutcome(state);
  attachNativeView(state, events[events.length - 1]);
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
  const destination = previous.story ?? previous.war ?? previous.infusion ?? previous.dungeon;
  if (!destination) throw new Error('Only staged battles can advance to the next stage.');
  if (previous.phase !== 'cleared') throw new Error('Clear this stage before advancing.');
  if (previous.wave >= (previous.story ? storyRules.stages : previous.war ? warStageCount : previous.infusion ? infusionStageCount(previous.infusion.mode) : dungeonStageCount)) {
    throw new Error(`${previous.war ? 'Activity' : 'Dungeon'} complete. Return to Gameplay to replay a stage.`);
  }
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
  const state = 'storyStage' in destination
    ? createStoryBattle(destination.storyStage + 1, previous.seed, starter, leaderProgress, roster, teamProgress, equipment, captures, previous.conduitUpgrades, previous.encounterSeed)
    : 'character' in destination
    ? createWarBattle(destination.character, destination.stage + 1, previous.seed, starter, leaderProgress, roster, teamProgress, equipment, captures, previous.conduitUpgrades)
    : 'mode' in destination
    ? createInfusionBattle(destination.mode, destination.stage + 1, previous.seed, starter, leaderProgress, roster, teamProgress, equipment, captures, previous.conduitUpgrades, destination.schedule ?? 'legacy')
    : createDungeonBattle(destination.element, destination.stage + 1, previous.seed, starter, leaderProgress, roster, teamProgress, equipment, captures, previous.conduitUpgrades, previous.encounterSeed);
  for (const ally of state.allies) {
    const prior = previous.allies.find((unit) => unit.id === ally.id);
    if (!prior) throw new Error('Continuing character is missing from the previous encounter.');
    ally.shatter = Math.min(prior.shatter + (equipped(ally, 'fracture-reservoir') ? value(state, ally, 'fracture-reservoir', 5, 10) : 0),
      ally.stats.shatterCapacity);
    if (prior.masterConduit) ally.masterConduit = prior.masterConduit;
  }
  if (previous.conduitSeed !== undefined) state.conduitSeed = previous.conduitSeed;
  if (previous.machineConduits !== undefined) state.machineConduits = { ...previous.machineConduits };
  if (previous.componentSeed !== undefined) state.componentSeed = previous.componentSeed;
  if (previous.masterChestSeed !== undefined) state.masterChestSeed = previous.masterChestSeed;
  if (previous.war) {
    state.rewardSeed = previous.rewardSeed;
    state.lycalisSeed = previous.lycalisSeed;
    state.recruitmentSeed = previous.recruitmentSeed;
  }
  return { state, events: [{ kind: 'turn', source: '', target: '', amount: state.wave, critical: false,
    message: 'Next stage. Health and cooldowns reset; Shatter Gauge carries over.' }] };
}

export function nextWave(previous: BattleState): BattleResult {
  if (previous.calamity) throw new Error('Calamity has one boss. Return to the activity or replay this challenge.');
  if (previous.story || previous.dungeon || previous.infusion || previous.war) throw new Error('Staged activities must be started as separate encounters.');
  if (previous.phase !== 'cleared') throw new Error('Defeat this wave before advancing.');
  const state = structuredClone(previous);
  const events: BattleEvent[] = [];
  state.wave++;
  state.enemies = spawnWave(state.wave);
  state.phase = 'player';
  for (const ally of state.allies) { delete ally.pilot; delete ally.native; }
  for (const ally of state.allies) if (ally.definitionId === 'vaelor') ally.native = { beat: 0, beatRound: state.round + 1 };
  for (const ally of state.allies) {
    delete ally.omnicMemory;
    delete ally.omnicProtection;
    const layers = ally.conduitRuntime?.layers;
    ally.conduitRuntime = { numbers: {}, owners: {}, ...(layers ? { layers } : {}) };
    delete ally.conduitCharges;
  }
  initializeConduits(state);
  newTurn(state, events);
  events.push({ kind: 'turn', source: '', target: '', amount: state.wave, critical: false, message: `Wave ${state.wave}: enemies grow stronger. Health, shields, Shatter Gauge and recovery carry over.` });
  const advanced = advanceUnavailableTurns(state);
  return { state: advanced.state, events: [...events, ...advanced.events] };
}
