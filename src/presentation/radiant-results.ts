import { dungeonStageCount, infusionStageCount, storyStageLayout, warStageCount } from '../content/activities';
import { gatesOfOblivionRules } from '../content/gates-of-oblivion';
import type { FrozenRadiantRun } from '../online/radiant-run';
import { encounterRewards, battleRewardItemsMarkup } from './battle-results';
import { formatStat } from '../content/combat';

export function radiantHasNextEncounter(run: FrozenRadiantRun): boolean {
  const activity = run.anchor.activity;
  switch (activity.kind) {
    case 'training': return true;
    case 'calamity': return false;
    case 'story': return activity.stage < storyStageLayout.stages;
    case 'dungeon': return activity.stage < dungeonStageCount;
    case 'infusion': return activity.stage < infusionStageCount(activity.mode);
    case 'war': return activity.stage < warStageCount;
    case 'oblivion': return activity.stage < gatesOfOblivionRules.stages;
  }
}
export function radiantEncounterRewards(run: FrozenRadiantRun): ReturnType<typeof encounterRewards> {
  const rewards = encounterRewards(run.journal.rewards);
  const paid = run.journal.events.reduce((sum, event) => sum + (event.type === 'currency' ? event.amount : 0), 0);
  const currency = rewards.find(item => item.id === 'fractalis');
  if (currency) currency.amount += paid;
  else if (paid > 0) rewards.unshift({ id: 'fractalis', name: 'Prismatica', amount: paid, color: '#ffffff' });
  return rewards;
}
export function radiantEncounterLabel(run: FrozenRadiantRun): string {
  return run.anchor.activity.kind === 'calamity' ? `EX+${run.anchor.activity.tier}` :
    'stage' in run.anchor.activity ? `Stage ${run.anchor.activity.stage}` : `Wave ${run.anchor.trainingWave ?? 1}`;
}
export function radiantResultsMarkup(run: FrozenRadiantRun, canExit: boolean): string {
  const victory = run.state.phase === 'victory', complete = victory && !radiantHasNextEncounter(run);
  const progress = radiantEncounterLabel(run);
  const outgoing = (kind: 'damage' | 'heal' | 'shield') => run.journal.events.reduce((sum, event) =>
    sum + (event.type === kind && event.source.kind !== 'enemy' ?
      event.type === 'damage' ? event.healthLoss : event.type === 'heal' ? event.effective : event.amount : 0), 0);
  const incoming = run.journal.events.reduce((sum, event) =>
    sum + (event.type === 'damage' && event.source.kind === 'enemy' ? event.healthLoss : 0), 0);
  return `<section class="radiant-results" aria-label="Saved battle results">
    <header><h2 data-radiant-result-heading tabindex="-1">${victory ? 'Victory!' : run.quit ? 'Encounter paused' : 'Defeat'}</h2>
      <button type="button" data-radiant-result-dismiss>View battlefield</button></header>
    <p>${progress}${complete ? ' · Activity complete' : ''} · Earned rewards saved and retained.</p>
    <p>No additional claim is required. Retry restores the frozen encounter without paying for previously depleted HP or repeating saved loot.</p>
    <div class="battle-result-rewards"><h3>Saved encounter rewards (including previous retries)</h3>
      ${battleRewardItemsMarkup(radiantEncounterRewards(run))}</div>
    <p>HP damage dealt ${formatStat(outgoing('damage'))} · Received ${formatStat(incoming)}
      · Effective healing ${formatStat(outgoing('heal'))} · Shields created ${formatStat(outgoing('shield'))}</p>
    <div class="radiant-result-actions">${victory && !run.quit && !complete ? '<button type="button" data-radiant-transition="continue">Continue · Next encounter</button>' : ''}
      <button type="button" data-radiant-transition="retry">${victory ? 'Replay' : 'Retry'} encounter</button>
      ${canExit ? '<button type="button" data-radiant-transition="exit">Exit · Keep rewards</button>' : ''}</div></section>`;
}
