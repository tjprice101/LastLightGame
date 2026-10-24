import { elements, infusionStageCount, storyStageLayout, type InfusionModeId } from '../src/content/activities';
import { calamityActivities, calamityTierScaling, type CalamityActivityId, type CalamityTier } from '../src/content/calamity';
import { type ActionId } from '../src/content/combat';
import { validateConduitElement, validateConduitSlots, type ConduitId, type ConduitLoadouts,
  type ConduitSlots, type ConduitUpgrades } from '../src/content/conduits';
import { playableDungeons, type PlayableDungeon } from '../src/content/dungeons';
import { masterConduits, type MasterConduitId, type MasterLoadouts } from '../src/content/master-conduits';
import { characterLevelCap, type CharacterProgress } from '../src/content/progression';
import { enemyCalamityApproach, enemyCombatStats, enemyResistanceRamp, enemyStrengthMultiplier } from '../src/content/stat-growth';
import { enemyAbilityMultiplier, enemySkills } from '../src/content/enemy-skills';
import { getStarter, starters, type StarterId } from '../src/content/starters';
import { actAndAdvanceTurn, actionUnavailable, createBattle, createCalamityBattle, createDungeonBattle,
  createInfusionBattle, createStoryBattle, createWarBattle, endTurn, nextWave, withMasterLoadouts,
  type BattleEvent, type BattleState } from '../src/game/battle';
import { benchmarkPriorities, benchmarkTarget } from '../src/game/native-benchmark-pilot';
import { initializeConduits } from '../src/game/conduit-runtime';

export const surveySeeds = [1, 1729, 12345, 54321, 104729, 65537, 314159, 271828, 8675309, 4294967295];
export const surveyLimits = { rounds: 100, decisions: 1800 } as const;
export type Build = 'bare' | 'common0' | 'mixed0' | 'mixed5' | 'omnic0' | 'omnic5' | 'master5' | 'calamitic5';
export type Policy = 'native' | 'flare-first';
export type Encounter =
  | { kind: 'story'; stage: number }
  | { kind: 'dungeon'; element: PlayableDungeon; stage: number }
  | { kind: 'infusion'; mode: InfusionModeId; stage: number }
  | { kind: 'war'; character: 'nerithe' | 'orvella' | 'vaelor'; stage: number }
  | { kind: 'calamity'; activity: CalamityActivityId; tier: CalamityTier };
const common: ConduitId[] = ['vigil-core', 'bastion-lock', 'parallax-relay', 'crosspin-governor',
  'fieldbrace-coupler', 'siegebound-drive', 'reserve-torque-crank', 'prism-splinter-socket'];
const mixed: ConduitId[] = ['immortal-vessel', 'citadel-spine', 'bastion-lock', 'horizon-heartcase',
  'glassroot-gimbal', 'hammerbalance-link', 'starvein-conductor', 'worldbreaker-drive'];
const omnic: Record<ReturnType<typeof getStarter>['elementId'], ConduitId[]> = {
  infernic: ['infernic-cinder-testament', 'emberlife-kiln', 'infernic-phoenix-reactor', 'infernic-pyre-census'],
  oceanic: ['aquatic-undertide-chronometer', 'ward-stitch-spool', 'clearwater-manifold', 'tidebound-reflector'],
  atmospheric: ['atmospheric-griffin-turbine', 'atmospheric-skythread-rudder', 'voltaic-stormstep-dynamo', 'voltaic-thunderbird-coil'],
  botanic: ['efflorescent-verdant-covenant', 'covercharge-drum', 'rootbound-triage-vault', 'botanic-graft-covenant'],
  tranquilitic: ['tranquilitic-stillhour-carillon', 'firstlight-cam', 'aegis-return-spring', 'tranquilitic-accord-bastion'],
  chaotic: ['chaotic-paradox-spindle', 'tension-governor', 'ruinselect-prism', 'ominous-nightglass-archive'],
};
const calamitics: ConduitId[] = ['calamitic-cathedral-final-equation', 'calamitic-causality-funeral-engine',
  'calamitic-horizon-cleaving-godpress', 'calamitic-throne-borrowed-tomorrows'];

export function loadout(roster: readonly StarterId[], build: Build, override: MasterLoadouts = {}) {
  const equipment: ConduitLoadouts = {}, upgrades: ConduitUpgrades = {}, masters: MasterLoadouts = {};
  for (const id of roster) {
    let ids: ConduitSlots = build === 'bare' ? Array<null>(8).fill(null) :
      build === 'common0' ? [...common] : build.startsWith('mixed') ? [...mixed] :
        [...(build === 'calamitic5' ? calamitics : mixed.slice(0, 4)), ...omnic[getStarter(id).elementId]];
    if (id === 'sprout' && build !== 'bare' && build !== 'common0')
      ids = ids.map(item => item === (build.startsWith('mixed') ? 'hammerbalance-link' : 'bastion-lock') ? 'springwell-pump' :
        item === (build.startsWith('mixed') ? 'worldbreaker-drive' : 'horizon-heartcase') ? 'coilfeed-ratchet' : item);
    validateConduitElement(validateConduitSlots(ids), getStarter(id).elementId);
    equipment[id] = ids;
    for (const piece of ids) if (piece) upgrades[piece] = build.endsWith('5') ? 5 : 0;
    if (build === 'master5' || build === 'calamitic5') {
      const preferred = id === 'tide' || id === 'thornia' ? 3 : 1;
      const master = masterConduits.find(entry => entry.character === id && entry.id.endsWith(`-${preferred}`));
      if (!master) throw new Error(`Missing Master for ${id}.`);
      masters[id] = master.id;
    }
  }
  Object.assign(masters, override);
  return { equipment, upgrades, masters };
}

export function progressAt(level: number): CharacterProgress {
  if (!Number.isInteger(level) || level < 0) throw new Error(`Unsupported survey character level ${level}.`);
  const evolution = [1, 2, 3, 4, 5, 6].find(value => characterLevelCap(value) >= level);
  if (evolution === undefined) throw new Error(`Unsupported survey character level ${level}.`);
  return { level, evolution };
}

export function encounterLabel(encounter: Encounter): string {
  switch (encounter.kind) {
    case 'story': return `Story ${encounter.stage}`;
    case 'dungeon': return `${encounter.element} dungeon ${encounter.stage}`;
    case 'infusion': return `${encounter.mode} ${encounter.stage}`;
    case 'war': return `War ${encounter.character} ${encounter.stage}`;
    case 'calamity': return `Calamity ${encounter.activity} EX+${encounter.tier}`;
  }
}

export function makeBattle(encounter: Encounter, roster: readonly StarterId[], level: number, build: Build,
  seed: number, override: MasterLoadouts = {}): BattleState {
  const gear = loadout(roster, build, override), progress = progressAt(level);
  const team = Object.fromEntries(roster.map(id => [id, progress]));
  const leader = roster[0];
  let state: BattleState;
  switch (encounter.kind) {
    case 'story': state = createStoryBattle(encounter.stage, seed, leader, progress, roster, team, gear.equipment, [], gear.upgrades); break;
    case 'dungeon': state = createDungeonBattle(encounter.element, encounter.stage, seed, leader, progress, roster, team, gear.equipment, [], gear.upgrades); break;
    case 'infusion': state = createInfusionBattle(encounter.mode, encounter.stage, seed, leader, progress, roster, team, gear.equipment, [], gear.upgrades); break;
    case 'war': state = createWarBattle(encounter.character, encounter.stage, seed, leader, progress, roster, team, gear.equipment, [], gear.upgrades); break;
    case 'calamity': state = createCalamityBattle(encounter.activity, encounter.tier, seed, leader, progress, roster, team, gear.equipment, [], gear.upgrades); break;
  }
  return withMasterLoadouts(state, gear.masters);
}

export interface Contribution {
  damage: number; healing: number; shieldsCreated: number; periodicDamage: number;
  actions: Partial<Record<ActionId, number>>;
}
export interface Outcome {
  outcome: 'win' | 'defeat' | 'timeout'; rounds: number; decisions: number; surviving: number;
  healthFraction: number; enemyRemaining: number; firstKoRound: number | null;
  contribution: Record<string, Contribution>;
}
const emptyContribution = (): Contribution => ({ damage: 0, healing: 0, shieldsCreated: 0, periodicDamage: 0, actions: {} });

export function measureBattle(initial: BattleState, policy: Policy = 'native',
  limits: { rounds: number; decisions: number } = surveyLimits) {
  let state = initial, decisions = 0, firstKoRound: number | null = null;
  const startRound = initial.round, initialEnemyHealth = initial.enemies.reduce((sum, unit) => sum + unit.stats.health, 0);
  const contribution = Object.fromEntries(initial.allies.map(unit => [unit.id, emptyContribution()]));
  const enemies = new Set(initial.enemies.map(unit => unit.id));
  function collect(events: BattleEvent[]): void {
    for (const event of events) {
      const source = contribution[event.source];
      if (!source) continue;
      if (event.kind === 'damage' && enemies.has(event.target)) {
        source.damage += event.amount;
        if (event.periodic || event.nativeKind === 'burn') source.periodicDamage += event.amount;
      }
      if (event.kind === 'heal' && contribution[event.target]) source.healing += event.amount;
      if (event.kind === 'shield' && contribution[event.target]) source.shieldsCreated += event.amount;
    }
  }
  while (state.phase === 'player' && decisions < limits.decisions && state.round - startRound < limits.rounds) {
    decisions++;
    const ready = state.allies.filter(unit => unit.hp > 0 &&
      (['light', 'skill1', 'skill2', 'ultimate'] as const).some(action => !actionUnavailable(state, unit, action)));
    const actor = ready.find(unit => unit.definitionId !== 'rosetta' || !unit.native?.quarry) ?? ready[0];
    if (!actor) {
      const result = endTurn(state); state = result.state; collect(result.events);
    } else {
      const native = benchmarkPriorities(state, actor);
      const priorities: ActionId[] = [...(policy === 'flare-first' ? ['ultimate' as const, ...native] : native),
        'skill1', 'skill2', 'light', 'ultimate'];
      const choice = priorities.map(action => ({ action, target: benchmarkTarget(state, actor, action) }))
        .find(({ action, target }) => !actionUnavailable(state, actor, action, target));
      if (!choice) throw new Error(`Survey pilot has no legal choice for ${actor.id}.`);
      contribution[actor.id].actions[choice.action] = (contribution[actor.id].actions[choice.action] ?? 0) + 1;
      const result = actAndAdvanceTurn(state, actor.id, choice.action, choice.target);
      state = result.state; collect(result.events);
    }
    if (firstKoRound === null && state.allies.some(unit => unit.hp <= 0)) firstKoRound = state.round - startRound + 1;
  }
  const result: Outcome = {
    outcome: state.phase === 'cleared' ? 'win' : state.phase === 'defeat' ? 'defeat' : 'timeout',
    rounds: state.round - startRound + 1, decisions, surviving: state.allies.filter(unit => unit.hp > 0).length,
    healthFraction: state.allies.reduce((sum, unit) => sum + unit.hp / unit.stats.health, 0) / state.allies.length,
    enemyRemaining: state.enemies.reduce((sum, unit) => sum + unit.hp, 0) / initialEnemyHealth,
    firstKoRound, contribution,
  };
  if (![result.rounds, result.healthFraction, result.enemyRemaining, ...Object.values(contribution).flatMap(value =>
    [value.damage, value.healing, value.shieldsCreated, value.periodicDamage])].every(Number.isFinite))
    throw new Error('Nonfinite battle survey measurement.');
  return { result, state };
}

export interface SurveyRow extends Outcome {
  category: string; squad: string; roster: readonly StarterId[]; level: number; build: Build;
  encounter: string; enemyLevel: number; seed: number; policy: Policy; master: MasterConduitId | 'default' | 'none';
  scenario?: string;
}

const balanced: StarterId[] = ['ember', 'tide', 'sprout'];
export const surveySquads: { name: string; roster: StarterId[] }[] = [
    { name: 'starters', roster: ['ember', 'tide', 'sprout'] },
    { name: 'rose-balanced', roster: ['rosetta', 'thornia', 'sprout'] },
    { name: 'rose-offense', roster: ['crinso', 'rosetta', 'disciple'] },
    { name: 'war-balanced', roster: ['nerithe', 'orvella', 'vaelor'] },
    { name: 'standard-balanced', roster: ['elise', 'bruno', 'sprout'] },
    { name: 'control', roster: ['bliss', 'razor', 'aurora'] },
    { name: 'two-dps-fire-rose', roster: ['ember', 'crinso'] },
    { name: 'two-dps-wind', roster: ['atmoso', 'elise'] },
];

export function runSurvey(emit: (row: SurveyRow) => void): number {
  let count = 0;
  const squads = surveySquads;
  function sample(category: string, squad: string, roster: StarterId[], level: number, build: Build, encounter: Encounter,
    seeds = surveySeeds.slice(0, 3), policy: Policy = 'native', override: MasterLoadouts = {}, master: SurveyRow['master'] = 'default'): void {
    for (const seed of seeds) {
      const state = makeBattle(encounter, roster, level, build, seed, override);
      const { result } = measureBattle(state, policy);
      emit({ ...result, category, squad, roster, level, build, encounter: encounterLabel(encounter),
        enemyLevel: state.enemies[0].level ?? 0, seed, policy, master });
      count++;
    }
  }
  const modes: InfusionModeId[] = ['machines', 'heavens', 'abyss', 'treasury', 'sanctuary', 'roses'];
  for (const level of [0, 15, 30, 45, 60, 75, 90, 105]) {
    for (const build of ['bare', 'common0', 'mixed0'] as const) {
      for (let stage = 1; stage <= storyStageLayout.stages; stage++)
        sample('story-progression', 'starters', balanced, level, build, { kind: 'story', stage });
      for (const mode of modes) {
        const stages = mode === 'machines' ? [1, 5, 10, 15, 20, 25, 26, 30, 34, 35] : [1, 5, 10, 15, 20, infusionStageCount(mode)];
        for (const stage of [...new Set(stages)])
          sample('activity-progression', 'starters', balanced, level, build, { kind: 'infusion', mode, stage });
      }
      for (const element of playableDungeons) for (const stage of [1, 5, 10, 15, 20, 25, 30, 34, 35])
        sample('dungeon-progression', 'starters', balanced, level, build, { kind: 'dungeon', element, stage });
    }
  }
  const endpoints: Encounter[] = [
    ...modes.map(mode => ({ kind: 'infusion' as const, mode, stage: infusionStageCount(mode) })),
    ...elements.map(({ id }) => ({ kind: 'dungeon' as const, element: id, stage: 35 })),
    ...(['nerithe', 'orvella', 'vaelor'] as const).map(character => ({ kind: 'war' as const, character, stage: 10 })),
    ...calamityActivities.flatMap(({ id }) => ([1, 2, 3] as const).map(tier =>
      ({ kind: 'calamity' as const, activity: id, tier }))),
  ];
  for (const squad of squads) for (const build of ['bare', 'common0', 'mixed0', 'mixed5', 'omnic0', 'omnic5', 'master5', 'calamitic5'] as const)
    for (const encounter of endpoints) sample('endgame', squad.name, squad.roster, 105, build, encounter, surveySeeds);
  const probes: Encounter[] = [
    { kind: 'infusion', mode: 'machines', stage: 35 }, { kind: 'infusion', mode: 'roses', stage: 35 },
    { kind: 'war', character: 'vaelor', stage: 10 },
    ...([1, 2, 3] as const).map(tier => ({ kind: 'calamity' as const, activity: 'machines' as const, tier })),
  ];
  for (const character of starters) {
    const roster: StarterId[] = [character.id, ...balanced.filter(id => id !== character.id)].slice(0, 3);
    for (const master of [null, ...masterConduits.filter(entry => entry.character === character.id).map(entry => entry.id)]) {
      for (const policy of ['native', 'flare-first'] as const) for (const encounter of probes)
        sample('character-masters', character.name, roster, 105, 'master5', encounter, surveySeeds, policy,
          { [character.id]: master }, master ?? 'none');
    }
    for (const build of ['bare', 'mixed5', 'master5'] as const) for (const encounter of probes)
      sample('solo', character.name, [character.id], 105, build, encounter, surveySeeds);
  }
  for (const squad of squads) for (const build of ['bare', 'common0', 'mixed5', 'master5'] as const) {
    for (const seed of surveySeeds.slice(0, 3)) {
      const gear = loadout(squad.roster, build);
      const progress = Object.fromEntries(squad.roster.map(id => [id, progressAt(105)]));
      let state = withMasterLoadouts(createBattle(seed, squad.roster, progress, gear.equipment, [], gear.upgrades), gear.masters);
      while (state.wave <= 125) {
        const enemyLevel = state.enemies[0].level ?? 0, wave = state.wave;
        const measured = measureBattle(state); state = measured.state;
        emit({ ...measured.result, category: 'training-continuous', squad: squad.name, roster: squad.roster,
          level: 105, build, encounter: `Training ${wave}`, enemyLevel, seed, policy: 'native', master: 'default' });
        count++;
        if (state.phase !== 'cleared' || wave === 125) break;
        state = nextWave(state).state;
      }
    }
  }
  return count;
}

export const enemyScenarios = {
  live: { health: 1, attack: 1 },
  'hp125': { health: 1.25, attack: 1 },
  'hp150': { health: 1.5, attack: 1 },
  'hp150-attack110': { health: 1.5, attack: 1.1 },
  'hp200': { health: 2, attack: 1 },
} as const;

export function enemyWhatIf(initial: BattleState, scenario: keyof typeof enemyScenarios): BattleState {
  const state = structuredClone(initial), factors = enemyScenarios[scenario];
  for (const enemy of state.enemies) {
    if ((enemy.level ?? 0) < 100) continue;
    enemy.stats.health = Math.round(enemy.stats.health * factors.health);
    enemy.hp = enemy.stats.health;
    enemy.stats.damage = Math.round(enemy.stats.damage * factors.attack);
  }
  return state;
}

export function runFocusedSurvey(emit: (row: SurveyRow) => void): number {
  let count = 0;
  function sample(category: string, squad: string, roster: StarterId[], level: number, build: Build,
    encounter: Encounter, scenario: keyof typeof enemyScenarios = 'live'): void {
    for (const seed of surveySeeds) {
      const state = enemyWhatIf(makeBattle(encounter, roster, level, build, seed), scenario);
      const { result } = measureBattle(state);
      emit({ ...result, category, squad, roster, level, build, encounter: encounterLabel(encounter),
        enemyLevel: state.enemies[0].level ?? 0, seed, policy: 'native', master: 'default', scenario });
      count++;
    }
  }
  for (const squad of surveySquads) for (const level of [90, 105]) {
    for (const build of ['bare', 'common0', 'mixed5', 'master5'] as const) {
      for (const stage of [20, 25, 30, 35])
        sample('late-curve', squad.name, squad.roster, level, build, { kind: 'infusion', mode: 'machines', stage });
    }
  }
  const encounters: Encounter[] = [
    { kind: 'infusion', mode: 'machines', stage: 35 },
    { kind: 'infusion', mode: 'roses', stage: 35 },
    { kind: 'war', character: 'vaelor', stage: 10 },
    ...([1, 2, 3] as const).map(tier => ({ kind: 'calamity' as const, activity: 'machines' as const, tier })),
  ];
  for (const squad of surveySquads) for (const build of ['common0', 'mixed5', 'master5', 'calamitic5'] as const)
    for (const encounter of encounters) for (const scenario of Object.keys(enemyScenarios) as (keyof typeof enemyScenarios)[])
      sample('enemy-what-if', squad.name, squad.roster, 105, build, encounter, scenario);
  return count;
}

export const timeoutFollowupLimits = { rounds: 1000, decisions: 18000 };

export const levelSweepLevels = [80, 90, 100, 110, 120, 130, 140, 145, 150, 160, 170, 180, 185] as const;

export function makeLevelProbe(enemyLevel: number, roster: readonly StarterId[], build: Build,
  seed: number, pattern: CalamityActivityId | 'standard', override: MasterLoadouts = {}): BattleState {
  if (!levelSweepLevels.some(level => level === enemyLevel) || pattern === 'standard' && enemyLevel > 140)
    throw new Error('Unsupported level-sweep probe.');
  const encounter: Encounter = pattern === 'standard' ? { kind: 'infusion', mode: enemyLevel > 120 ? 'roses' : 'machines', stage: 35 } :
    { kind: 'calamity', activity: pattern, tier: enemyLevel === calamityTierScaling[3].level ? 3 : enemyLevel === calamityTierScaling[2].level ? 2 : 1 };
  const state = makeBattle(encounter, roster, 105, build, seed, override);
  if (state.enemies[0].level === enemyLevel) return state;
  const enemy = state.enemies[0];
  enemy.level = enemyLevel;
  enemy.stats = enemyCombatStats(enemyLevel, true);
  enemy.hp = enemy.stats.health;
  delete enemy.conduitRuntime;
  if (pattern === 'standard') {
    const strike = enemy.enemySkills?.[0]?.name;
    if (!strike) throw new Error('Standard probe requires a real authored strike.');
    enemy.enemySkills = enemySkills(enemyLevel, true, strike, enemyAbilityMultiplier(enemyLevel));
  }
  initializeConduits(state);
  return state;
}

export function runLevelSweep(emit: (row: SurveyRow) => void): number {
  let count = 0;
  function sample(category: string, squad: string, roster: StarterId[], build: Build, enemyLevel: number,
    pattern: CalamityActivityId | 'standard', override: MasterLoadouts = {}, master: SurveyRow['master'] = 'default') {
    const native = pattern === 'standard' ? [120, 140].includes(enemyLevel) :
      Object.values(calamityTierScaling).some(tier => tier.level === enemyLevel);
    for (const seed of surveySeeds) {
      const initial = makeLevelProbe(enemyLevel, roster, build, seed, pattern, override);
      const { result } = measureBattle(initial);
      emit({ ...result, category, squad, roster, level: 105, build, enemyLevel, seed, policy: 'native', master,
        encounter: `${pattern === 'standard' ? 'Standard boss' : `Calamity ${pattern}`} Lv${enemyLevel}`,
        scenario: native ? 'native-encounter' : 'controlled-level-probe' });
      count++;
    }
  }
  for (const enemyLevel of levelSweepLevels) {
    for (const squad of surveySquads) {
      for (const build of ['bare', 'common0', 'mixed0', 'mixed5', 'omnic0', 'omnic5', 'master5', 'calamitic5'] as const) {
        for (const { id } of calamityActivities)
          sample('level-sweep-calamity', squad.name, squad.roster, build, enemyLevel, id);
        if (enemyLevel <= 140)
          sample('level-sweep-standard', squad.name, squad.roster, build, enemyLevel, 'standard');
      }
    }
    for (const character of starters) {
      const roster: StarterId[] = [character.id, ...balanced.filter(id => id !== character.id)].slice(0, 3);
      for (const master of [null, ...masterConduits.filter(entry => entry.character === character.id).map(entry => entry.id)])
        sample('level-sweep-character', character.name, roster, 'master5', enemyLevel, 'machines',
          { [character.id]: master }, master ?? 'none');
    }
  }
  return count;
}

export function runTimeoutSurvey(source: SurveyRow[], emit: (row: SurveyRow) => void): number {
  const pending = source.filter(row => row.outcome === 'timeout');
  for (const row of pending) {
    const encounter = calamityActivities.flatMap(({ id }) => ([1, 2, 3] as const).map(tier =>
      ({ kind: 'calamity' as const, activity: id, tier }))).find(value => encounterLabel(value) === row.encounter);
    if (!encounter || row.master !== 'default') throw new Error('Timeout follow-up requires an ordinary endgame Calamity fixture.');
    const { result } = measureBattle(makeBattle(encounter, row.roster, row.level, row.build, row.seed),
      row.policy, timeoutFollowupLimits);
    emit({ ...row, ...result, category: 'timeout-followup' });
  }
  return pending.length;
}

export function describeSurvey() {
  return {
    seeds: surveySeeds, limits: surveyLimits, timeoutFollowupLimits, common, mixed, omnic, calamitics, enemyScenarios,
    enemyTuning: { enemyStrengthMultiplier, enemyResistanceRamp, enemyCalamityApproach },
    levelSweep: { levels: levelSweepLevels, characterLevel: 105, policies: ['native'],
      methodology: 'Controlled single-boss level probes use exact shared boss stats and unchanged authored Calamity patterns at each requested level. Standard boss probes use Machines through120 and Roses at130/140, rebuilding level-dependent scheduled skills. Standard120/140 and Calamity145/160/185 are unchanged native encounter controls; all other level/pattern combinations are synthetic offline probes, not playable stages.' },
    builds: Object.fromEntries((['bare', 'common0', 'mixed0', 'mixed5', 'omnic0', 'omnic5', 'master5', 'calamitic5'] as const)
      .map(build => [build, loadout(starters.map(character => character.id), build)])),
    progression: 'Minimum legal evolution for each sampled level; level105 is evolution6. Weapon rank0.',
    methodology: 'Fresh full-Health entries with natural opening Gauge except continuous Training (real nextWave carries Health/Gauge/recovery). No enemy stats or character stats altered. Native pilot and separate flare-first sensitivity policy; neither is an optimal-play proof. Damage is emitted effective HP damage, healing is emitted healing, Shields are created amounts, not absorbed mitigation.',
  };
}
