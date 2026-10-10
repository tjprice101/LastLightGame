import { type BattleEvent, type BattleState } from '../game/battle';
import { formatStat } from '../content/combat';
import { lootItems, lootArt } from './battle-loot';
import { dungeonStageCount, infusionStageCount } from '../content/activities';
import { conduitIcon } from './conduit-store';
import { isConduitId } from '../content/conduits';
import { mechanicalComponentIcon } from './mechanical-component-icon';
import { warStageCount } from '../content/elemental-war';
import { storyEncounter, storyRules } from '../content/story';

export function encounterRewards(events: readonly BattleEvent[]) {
  const totals = new Map<string, ReturnType<typeof lootItems>[number]>();
  const kills = new Set<string>();
  for (const event of events) {
    if (event.kind !== 'reward' || kills.has(event.source)) continue;
    kills.add(event.source);
    for (const item of lootItems(event)) {
      const saved = totals.get(item.id);
      if (saved) saved.amount += item.amount;
      else totals.set(item.id, { ...item });
    }
  }
  return [...totals.values()];
}

export function battleResults(state: BattleState, events: readonly BattleEvent[]): string {
  if (state.phase === 'player') return '';
  const victory = state.phase === 'cleared';
  const staged = !!(state.story || state.dungeon || state.infusion || state.war);
  const complete = staged && state.wave === (state.story ? storyRules.stages : state.war ? warStageCount : state.infusion ? infusionStageCount(state.infusion.mode) : dungeonStageCount);
  const rewards = encounterRewards(events);
  const allies = new Set(state.allies.map((ally) => ally.id));
  const total = (kind: BattleEvent['kind'], outgoing: boolean): number => events
    .filter((event) => event.kind === kind && allies.has(event.source) === outgoing)
    .reduce((sum, event) => sum + event.amount, 0);
  return `<section class="battle-results ${victory ? 'result-victory' : 'result-defeat'}" aria-labelledby="battle-result-heading" aria-describedby="battle-result-note">
    <div class="battle-result-title"><div><p class="eyebrow">${staged ? 'Stage' : 'Wave'} ${state.wave} ${victory ? 'cleared' : 'ended'}${victory && complete ? ' · Activity complete' : ''}</p>
      <h2 id="battle-result-heading" tabindex="-1">${victory ? 'Victory!' : 'Defeat'}</h2></div>
      <button class="text-button" data-result-dismiss>View battlefield</button></div>
    <p id="battle-result-note">${victory ? 'The encounter is over. Your earned rewards are already saved.' : 'Your squad has fallen. Rewards from defeated enemies are already saved and will not be lost.'}
      ${victory ? complete ? 'All stages completed. Return to Gameplay to replay unlocked stages.' : staged ? 'Continue with full HP; Shatter Gauge carries into the next stage.' : 'Health, Gauge and recovery carry into the next wave.' : ''}</p>
    ${victory && state.story && storyEncounter(state.story.storyStage).boss ? `<p class="story-conclusion">${storyEncounter(state.story.storyStage).conclusion}</p>` : ''}
    <div class="battle-result-rewards"><h3>Rewards earned this ${staged ? 'stage' : 'wave'}</h3>
      ${rewards.length ? `<ul>${rewards.map((item) => {
        const conduitId = item.id.startsWith('conduit:') ? item.id.slice('conduit:'.length) : null;
        return `<li style="--reward-color:${item.color}">${isConduitId(conduitId) ? conduitIcon(conduitId, item.upgradeLevel) : item.id === 'mechanical-components' ? mechanicalComponentIcon() : lootArt(item)
        ? `<img src="${lootArt(item)}" alt="" width="40" height="40">` : '<span class="result-reward-token" aria-hidden="true">+</span>'}
        <span>${item.name}</span><strong>+${formatStat(item.amount)}</strong></li>`;
      }).join('')}</ul>`
        : '<p class="quiet">No enemy rewards earned in this encounter.</p>'}
      <p class="quiet">Collected from defeated enemies. This summary does not grant extra rewards.</p></div>
    <section class="battle-result-stats"><h3>Battle summary</h3>
      <p>Damage dealt ${formatStat(total('damage', true))} · Received ${formatStat(total('damage', false))}
        · Healing ${formatStat(total('heal', true))} · Shields ${formatStat(total('shield', true))}</p>
      <p>${state.allies.map((ally) => `${ally.name}: HP ${formatStat(ally.hp)} / ${formatStat(ally.stats.health)}`).join(' · ')}</p></section>
    <div class="battle-result-actions">${victory && !complete ? `<button class="primary-button" data-result-continue>Continue · Next ${staged ? 'stage' : 'wave'}</button>` : ''}
      ${!victory ? `<button class="primary-button" data-result-restart>${staged ? 'Retry stage' : 'Restart Training'}</button>` : ''}
      <button class="${complete && victory ? 'primary-button' : 'text-button'}" data-result-quit>${complete && victory ? 'Return to Gameplay' : 'Quit · Keep rewards'}</button></div>
  </section>`;
}
