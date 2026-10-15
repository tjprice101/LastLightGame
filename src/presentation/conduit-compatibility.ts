import { createBattle, createCalamityBattle, createDungeonBattle, createInfusionBattle, createStoryBattle, createWarBattle, nextWave, withMasterLoadouts, type BattleState } from '../game/battle';
import { conduitRulesVersion } from '../game/conduit-runtime';
import { isStarterId } from '../content/starters';
import type { BattleSession } from './battle-view';
import { isCalamityActivityId, isCalamityTier } from '../content/calamity';

export const conduitRestartNotice = 'Combat rules updated, including exponential enemy growth. This encounter restarted at the current stage with your original squad and equipment. All previously saved rewards are kept.';

/** Use the existing wave spawner without carrying its turn changes into the restarted encounter. */
export function atTrainingWave(state: BattleState, wave: number): BattleState {
  if (wave <= 1) return state;
  const spawned = nextWave({ ...structuredClone(state), wave: wave - 1, phase: 'cleared' });
  state.wave = wave;
  state.enemies = spawned.state.enemies;
  return state;
}

export function restartHistoricalConduitSession(session: BattleSession): boolean {
  const old = session.state;
  if (old.calamity !== undefined && (!old.calamity ||
    !isCalamityActivityId(old.calamity.activity) || !isCalamityTier(old.calamity.tier))) throw new Error('Unsupported saved Calamity encounter.');
  if (old.conduitRulesVersion === conduitRulesVersion) return false;
  const starter = old.allies.find(unit => isStarterId(unit.definitionId))?.definitionId ?? 'ember';
  if (!isStarterId(starter)) throw new Error('Frozen squad definition is missing.');
  const roster = old.allies.map(unit => unit.id);
  const equipment = Object.fromEntries(old.allies.map(unit => [unit.id, unit.conduits ?? Array(8).fill(null)]));
  const captures = old.allies.flatMap(unit => unit.captured ? [structuredClone(unit.captured)] : []);
  const masters = Object.fromEntries(old.allies.filter(unit => unit.masterConduit).map(unit => [unit.definitionId, unit.masterConduit]));
  const progress = session.teamProgress ?? { [starter]: session.progress };
  const seed = crypto.getRandomValues(new Uint32Array(1))[0] || 1;
  const args = [seed, starter, session.progress, roster, progress, equipment, captures, old.conduitUpgrades] as const;
  const fresh = old.calamity ? createCalamityBattle(old.calamity.activity, old.calamity.tier, ...args)
    : old.story ? createStoryBattle(old.story.storyStage, ...args)
    : old.war ? createWarBattle(old.war.character, old.war.stage, ...args)
    : old.infusion ? createInfusionBattle(old.infusion.mode, old.infusion.stage, ...args, old.infusion.schedule ?? 'legacy')
    : old.dungeon ? createDungeonBattle(old.dungeon.element, old.dungeon.stage, ...args)
    : atTrainingWave(createBattle(seed, roster, progress, equipment, captures, old.conduitUpgrades), old.wave);
  session.state = withMasterLoadouts(fresh, masters);
  if (old.machineConduits) session.state.machineConduits = { ...old.machineConduits };
  session.runId = crypto.randomUUID();
  session.stageEvents = [];
  session.entrancePending = true;
  session.resultsVisible = false;
  session.log = [...session.log, conduitRestartNotice].slice(-100);
  return true;
}
