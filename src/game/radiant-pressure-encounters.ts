import { elements, dungeonStageCount, infusionModes, currencyModes, eventModes, machineModes,
  storyStageLayout, warStageCount } from '../content/activities';
import { elementalWars } from '../content/elemental-war';
import { calamityActivities, calamityPatterns } from '../content/calamity';
import { gatesOfOblivionRules } from '../content/gates-of-oblivion';
import { oblivionConstructAtStage } from '../content/gates-of-oblivion';
import { storyCreature } from '../content/story';
import { dungeonVariants, dungeonEncounter } from '../content/dungeons';
import { infusionEncounter } from '../content/infusions';
import { authoredRadiantCalibration } from '../content/radiant-enemy-calibration';
import { enemyCombatStats } from '../content/stat-growth';
import { enemySkills, enemyAbilityMultiplier, type EnemySkill } from '../content/enemy-skills';
import { activityPrismaticaDrop } from '../content/prismatica';
import { calibratedRadiantEnemyStats, radiantEnemyFactors, type RadiantEnemyCalibration,
  type RadiantEnemyCategory } from '../content/radiant-enemy-calibration';
import { createBattle, createStoryBattle, createDungeonBattle, createInfusionBattle,
  createWarBattle, createCalamityBattle, createOblivionBattle, type BattleState } from './battle';
import { assertActivityAccess } from './activity-access';
import { unlockedStoryStage, unlockedStage, unlockedInfusionStage, unlockedWarStage,
  type Account } from './account';
import type { Activity } from '../online/server-game';
import type { RadiantStats } from '../content/radiant-combat';

export interface RadiantPressureAnchor {
  id: string;
  family: string;
  position: 'early' | 'mid' | 'final' | 'boss' | 'species';
  activity: Activity;
  trainingWave?: number;
  identitySelection?: number;
}
export interface RadiantPressureEnemy {
  id: string;
  identity: string;
  name: string;
  level: number;
  category: RadiantEnemyCategory;
  authoredStats: BattleState['enemies'][number]['stats'];
  stats: RadiantStats;
  factors: ReturnType<typeof radiantEnemyFactors>;
  skills: EnemySkill[];
  pattern?: (typeof calamityPatterns)[keyof typeof calamityPatterns];
  currencyBudget: number;
}
export function radiantPressureAnchors(): RadiantPressureAnchor[] {
  const anchors: RadiantPressureAnchor[] = [];
  const add = (family: string, first: number, last: number, activity: (stage: number) => Activity) => {
    const stages = { early: first, mid: Math.floor((first + last) / 2), final: last,
      boss: family.startsWith('story:') ? last : Math.min(last, Math.ceil(first / 5) * 5) };
    for (const position of ['early', 'mid', 'final', 'boss'] as const)
      anchors.push({ id: `${family}:${position}`, family, position, activity: activity(stages[position]) });
  };
  elements.forEach((element, i) => add(`story:${element.id}`, i * storyStageLayout.regionStages + 1,
    (i + 1) * storyStageLayout.regionStages, stage => ({ kind: 'story', stage })));
  for (const wave of [1, 30, 60, 80, 120])
    anchors.push({ id: `training:${wave}`, family: 'training', position: wave === 1 ? 'early' : wave === 120 ? 'final' : 'mid',
      activity: { kind: 'training' }, trainingWave: wave });
  elements.forEach(element => add(`dungeon:${element.id}`, 1, dungeonStageCount,
    stage => ({ kind: 'dungeon', element: element.id, stage })));
  [...infusionModes, ...currencyModes, ...eventModes, ...machineModes].forEach(mode =>
    add(`infusion:${mode.id}`, 1, mode.stages, stage => ({ kind: 'infusion', mode: mode.id, stage })));
  elementalWars.forEach(war => add(`war:${war.character}`, 1, warStageCount,
    stage => ({ kind: 'war', character: war.character, stage })));
  add('oblivion', 1, gatesOfOblivionRules.stages, stage => ({ kind: 'oblivion', stage }));
  for (const activity of calamityActivities) for (const tier of [1, 2, 3] as const)
    anchors.push({ id: `calamity:${activity.id}:${tier}`, family: `calamity:${activity.id}`,
      position: tier === 1 ? 'early' : tier === 2 ? 'mid' : 'final',
      activity: { kind: 'calamity', activity: activity.id, tier } });
  const covered = new Set(anchors.flatMap(anchor => [1, 1729, 104729].flatMap(seed =>
    adaptRadiantPressureEncounter(anchor, seed, authoredRadiantCalibration).map(enemy => enemy.identity))));
  const include = (identity: string, family: string, activity: Activity, identitySelection?: number) => {
    if (covered.has(identity)) return;
    covered.add(identity);
    anchors.push({ id: `${family}:species:${identity}`, family, position: 'species', activity, identitySelection });
  };
  for (const element of elements) for (let stage = 1; stage <= dungeonStageCount; stage++)
    dungeonVariants(element.id, stage).forEach((variant, selection) =>
      include(variant.creatureId, `dungeon:${element.id}`, { kind: 'dungeon', element: element.id, stage }, selection));
  for (let stage = 1; stage <= storyStageLayout.stages; stage++) {
    const boss = stage % storyStageLayout.regionStages === 0;
    const family = `story:${elements[Math.floor((stage - 1) / storyStageLayout.regionStages)].id}`;
    for (let identity = 0; identity < (boss ? 1 : 4); identity++)
      include(storyCreature(stage, identity).id, family, { kind: 'story', stage }, identity);
  }
  for (const mode of [...infusionModes, ...currencyModes, ...eventModes, ...machineModes])
    for (let stage = 1; stage <= mode.stages; stage++)
      include(`infusion:${mode.id}:${infusionEncounter(mode.id, stage).tier}`, `infusion:${mode.id}`,
        { kind: 'infusion', mode: mode.id, stage });
  for (const war of elementalWars) for (let stage = 1; stage <= warStageCount; stage++)
    include(`war:${war.character}:${Math.min(6, stage === 10 ? 6 : Math.ceil(stage / 2))}`, `war:${war.character}`,
      { kind: 'war', character: war.character, stage });
  for (let stage = 1; stage <= gatesOfOblivionRules.stages; stage++)
    include(oblivionConstructAtStage(stage).id, 'oblivion', { kind: 'oblivion', stage });
  return anchors;
}
export function assertRadiantPressureAccess(anchor: RadiantPressureAnchor, account: Account, now: number): void {
  const a = anchor.activity;
  assertActivityAccess(account, a, now);
  const unlocked = a.kind === 'story' ? unlockedStoryStage(account)
    : a.kind === 'dungeon' ? unlockedStage(account, a.element)
    : a.kind === 'infusion' ? unlockedInfusionStage(account, a.mode)
    : a.kind === 'war' ? unlockedWarStage(account, a.character) : Infinity;
  if ('stage' in a && a.stage > unlocked) throw new Error('Pressure study stage is locked.');
}
/** Uses real spawns but never runs the legacy engine, rewards or account transactions. */
export function adaptRadiantPressureEncounter(
  anchor: RadiantPressureAnchor, encounterSeed: number, calibration: RadiantEnemyCalibration,
): RadiantPressureEnemy[] {
  const a = anchor.activity, progress = { level: 0, evolution: 1, weaponRank: 0 };
  let live: BattleState;
  switch (a.kind) {
    case 'story': live = createStoryBattle(a.stage, encounterSeed, 'ember', progress); break;
    case 'dungeon': live = createDungeonBattle(a.element, a.stage, encounterSeed, 'ember', progress); break;
    case 'infusion': live = createInfusionBattle(a.mode, a.stage, encounterSeed, 'ember', progress); break;
    case 'war': live = createWarBattle(a.character, a.stage, encounterSeed, 'ember', progress); break;
    case 'oblivion': live = createOblivionBattle(a.stage, encounterSeed, 'ember', progress); break;
    case 'calamity': live = createCalamityBattle(a.activity, a.tier, encounterSeed, 'ember', progress); break;
    case 'training': {
      const wave = anchor.trainingWave ?? 1;
      if (!Number.isSafeInteger(wave) || wave < 1) throw new Error('Invalid Training wave.');
      live = createBattle(encounterSeed);
      for (const unit of live.enemies) {
        unit.level = Math.min(wave, 120);
        unit.stats = enemyCombatStats(unit.level, false);
        unit.enemySkills = enemySkills(unit.level, false, unit.enemySkills![0].name, enemyAbilityMultiplier(unit.level));
      }
      break;
    }
  }
  return live.enemies.map(unit => {
    if (anchor.identitySelection !== undefined) {
      if (a.kind === 'story') {
        const creature = storyCreature(a.stage, anchor.identitySelection);
        unit.name = creature.name; unit.creatureId = creature.id;
        unit.enemySkills = enemySkills(unit.level!, !!unit.boss, `${creature.name} Strike`, enemyAbilityMultiplier(unit.level!));
      } else if (a.kind === 'dungeon') {
        const variant = dungeonEncounter(a.element, a.stage, anchor.identitySelection);
        unit.name = variant.enemy.name; unit.creatureId = variant.creatureId;
        unit.enemySkills = enemySkills(unit.level!, !!unit.boss, variant.ability, variant.abilityMultiplier);
      } else throw new Error('Invalid pressure identity selection.');
    }
    const level = unit.level!;
    const category: RadiantEnemyCategory = a.kind === 'calamity' ? 'calamity' : unit.boss ? 'boss' : 'ordinary';
    // Budget is an explicitly fixed minimum, not a second reward roll or chest grant.
    const currencyBudget = a.kind === 'calamity' ? 0 : activityPrismaticaDrop(live, level).minimum;
    return { id: unit.id, identity: a.kind === 'war' ? `war:${a.character}:${unit.evolution}` :
      unit.creatureId ?? unit.definitionId, name: unit.name, level, category,
      authoredStats: structuredClone(unit.stats), stats: calibratedRadiantEnemyStats(unit.stats, level, category, calibration),
      factors: radiantEnemyFactors(level, category, calibration), skills: structuredClone(unit.enemySkills ?? []),
      ...(a.kind === 'calamity' ? { pattern: structuredClone(calamityPatterns[a.activity]) } : {}), currencyBudget };
  });
}
