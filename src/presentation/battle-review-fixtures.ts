import { freshGame } from '../../supabase/functions/game-operation/engine';
import { characterLevelCap } from '../content/progression';
import { releasedRadiantIds, type RadiantBearerId } from '../content/combat-kits';
import { personalChargeMaximum, validateRadiantGauge, type RadiantGaugeState } from '../game/combat-gauge';
import type { Activity } from '../online/server-game';

export const radiantReviewEncounters = [
  { id: 'story-25', label: 'Story 25 - Oceanic skirmish', activity: { kind: 'story', stage: 25 } },
  { id: 'story-1', label: 'Story 1 - Infernic skirmish', activity: { kind: 'story', stage: 1 } },
  { id: 'story-20', label: 'Story 20 - regional boss', activity: { kind: 'story', stage: 20 } },
  { id: 'training', label: 'Training - wave 1', activity: { kind: 'training' } },
  { id: 'infernic-34', label: 'Infernic dungeon - floor 34', activity: { kind: 'dungeon', element: 'infernic', stage: 34 } },
  { id: 'machines-34', label: 'Awaken the Machines - stage 34', activity: { kind: 'infusion', mode: 'machines', stage: 34 } },
  { id: 'nerithe-10', label: 'Elemental War: Nerithe - final boss', activity: { kind: 'war', character: 'nerithe', stage: 10 } },
] as const satisfies readonly { id: string; label: string; activity: Activity }[];

export function createRadiantReviewFixture(leader: RadiantBearerId, form: number, encounterId: string, strikeMasters: boolean) {
  if (!releasedRadiantIds.includes(leader)) throw new Error('Preview leader is not a released Radiant Element-Bearer.');
  const encounter = radiantReviewEncounters.find(candidate => candidate.id === encounterId);
  if (!encounter) throw new Error('Unknown Radiant review encounter.');
  const leaderLevel = Math.min(105, characterLevelCap(form, leader));
  const game = freshGame('in-memory-preview', '2026-11-08T00:00:00Z');
  game.starterId = 'ember';
  game.account.storyCompleted = encounter.activity.kind === 'story' ? encounter.activity.stage - 1 : 24;
  const defaults: RadiantBearerId[] = ['ember', 'tide', 'sprout', 'rosetta', 'thornia', 'crinso'];
  const squad = [leader, ...defaults.filter(id => id !== leader)].slice(0, 6);
  game.account.squad = squad;
  for (const id of squad) {
    game.account.characters[id] = id === leader
      ? { level: leaderLevel, evolution: form, weaponRank: 0 }
      : { level: 105, evolution: 6, weaponRank: 0 };
  }
  if (encounter.activity.kind === 'dungeon')
    game.account.dungeonStages[encounter.activity.element] = encounter.activity.stage;
  if (encounter.activity.kind === 'infusion')
    game.account.infusionStages[encounter.activity.mode] = encounter.activity.stage;
  if (encounter.activity.kind === 'war')
    game.account.warStages = { [encounter.activity.character]: encounter.activity.stage };
  if (strikeMasters) {
    game.account.masterConduits = { 'master-tide-3': 1, 'master-sprout-2': 1 };
    game.account.masterEquipment = { tide: 'master-tide-3', sprout: 'master-sprout-2' };
  }
  return { game, activity: encounter.activity };
}

export function setRadiantReviewCharge(gauge: RadiantGaugeState, cycle: number): void {
  if (!Number.isInteger(cycle) || cycle < 0 || cycle > 3) throw new Error('Invalid Radiant review charge cycle.');
  const layers = cycle === 0 ? 0 : cycle === 1 ? 1 : 2;
  for (const member of gauge.members)
    member.charge = Math.min(personalChargeMaximum(member), member.baseCost * layers);
  validateRadiantGauge(gauge);
}
