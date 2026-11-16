import { dungeonStageCount, infusionStageCount, storyStageLayout, warStageCount } from '../content/activities';
import { gatesOfOblivionRules } from '../content/gates-of-oblivion';
import type { FrozenRadiantRun } from '../online/battle-run';
import { encounterRewards, battleRewardItemsMarkup } from './battle-results';
import { formatStat } from '../content/combat';
import { isRarity, type Rarity } from '../content/rarity';
import { countUp, lusterSheen, staggerIn } from './luster';
import { rarityFeedback } from './rarity-feedback';
import { reducedMotion } from './settings';

const titleCase = (value: string) => value.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
export function radiantActivityTitle(activity: FrozenRadiantRun['anchor']['activity']): { eyebrow: string; title: string } {
  switch (activity.kind) {
    case 'training': return { eyebrow: 'Squad Training', title: 'Training' };
    case 'story': return { eyebrow: 'Story Campaign', title: 'Story' };
    case 'dungeon': return { eyebrow: 'Elemental Dungeon', title: `${titleCase(activity.element)} Dungeon` };
    case 'infusion': return { eyebrow: activity.mode === 'roses' ? 'Event' : 'Trial', title: titleCase(activity.mode) };
    case 'war': return { eyebrow: 'Elemental War', title: titleCase(activity.character) };
    case 'oblivion': return { eyebrow: 'Calamity', title: 'Gates of Oblivion' };
    case 'calamity': return { eyebrow: 'Calamity', title: titleCase(activity.activity) };
  }
}

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
export type RadiantOutcome = 'victory' | 'defeat' | 'paused';
export function radiantOutcome(run: FrozenRadiantRun): RadiantOutcome {
  return run.quit ? 'paused' : run.state.phase === 'victory' ? 'victory' : 'defeat';
}
const outcomeHeadings: Record<RadiantOutcome, string> = { victory: 'Victory!', defeat: 'Defeat', paused: 'Encounter paused' };
const outcomeNotes: Record<RadiantOutcome, string> = {
  victory: 'Rewards saved.',
  defeat: 'Your squad fell. Rewards from defeated enemies are saved.',
  paused: 'Encounter paused. Earned rewards are saved.',
};
export function radiantResultsMarkup(run: FrozenRadiantRun, canExit: boolean): string {
  const outcome = radiantOutcome(run), victory = outcome === 'victory', complete = victory && !radiantHasNextEncounter(run);
  const identity = radiantActivityTitle(run.anchor.activity);
  const outgoing = (kind: 'damage' | 'heal' | 'shield') => run.journal.events.reduce((sum, event) =>
    sum + (event.type === kind && event.source.kind !== 'enemy' ?
      event.type === 'damage' ? event.healthLoss : event.type === 'heal' ? event.effective : event.amount : 0), 0);
  const incoming = run.journal.events.reduce((sum, event) =>
    sum + (event.type === 'damage' && event.source.kind === 'enemy' ? event.healthLoss : 0), 0);
  const primary = (button: boolean) => button ? ' class="radiant-result-primary"' : '';
  return `<section class="radiant-results" data-outcome="${outcome}" role="dialog" aria-modal="true" aria-label="Saved battle results">
    ${run.quit ? '' : `<div class="radiant-result-aura" aria-hidden="true"><span></span>${Array.from({ length: 8 }, (_, index) =>
      `<i style="--ray:${index}"></i>`).join('')}</div>`}
    <header><div class="radiant-result-outcome"><p class="radiant-result-eyebrow">${identity.eyebrow}</p>
      <h2 data-radiant-result-heading tabindex="-1">${outcomeHeadings[outcome]}</h2></div>
      <button type="button" data-radiant-result-dismiss>View battlefield</button></header>
    <p class="radiant-result-identity">${identity.title} · ${radiantEncounterLabel(run)}${complete ? ' · Activity complete' : ''}</p>
    <p class="radiant-result-note">${outcomeNotes[outcome]}${complete ? ' Every encounter in this activity is cleared.' : ''}</p>
    <div class="battle-result-rewards"><h3>Saved encounter rewards</h3>
      <p class="radiant-result-muted">Includes rewards from earlier retries of this encounter.</p>
      ${battleRewardItemsMarkup(radiantEncounterRewards(run))}</div>
    <details class="radiant-result-details"><summary>Battle summary</summary>
      <p>HP damage dealt ${formatStat(outgoing('damage'))} · Received ${formatStat(incoming)}
        · Effective healing ${formatStat(outgoing('heal'))} · Shields created ${formatStat(outgoing('shield'))}</p>
      <p class="radiant-result-muted">Retry restores the frozen encounter; HP lost earlier and saved loot are not charged or repeated. No additional claim is required.</p></details>
    <div class="radiant-result-actions">${victory && !complete ? `<button type="button"${primary(true)} data-radiant-transition="continue">Continue · Next encounter</button>` : ''}
      <button type="button"${primary(!victory)} data-radiant-transition="retry">${victory ? 'Replay' : 'Retry'} encounter</button>
      ${canExit ? `<button type="button"${primary(complete)} data-radiant-transition="exit">Exit · Keep rewards</button>` : ''}</div></section>`;
}

const introWords: Record<Exclude<RadiantOutcome, 'paused'>, { text: string; durationMs: number }> = {
  victory: { text: 'Win!!', durationMs: 1300 },
  defeat: { text: 'Defeat...', durationMs: 1700 },
};
/**
 * Finite outcome word shown over the hidden result sheet before it is revealed: gold "Win!!"
 * that fades, or stone "Defeat..." that cracks and crumbles. Click or `skip()` ends it early.
 * Paused results and Reduce motion reveal immediately. `onReveal` runs exactly once when the
 * word ends naturally or is skipped; the returned cleanup removes it without revealing effects.
 */
export function radiantResultIntro(results: HTMLElement, outcome: RadiantOutcome, onReveal: () => void): () => void {
  if (outcome === 'paused' || reducedMotion() || !results.isConnected) { onReveal(); return () => {}; }
  const { text, durationMs } = introWords[outcome];
  const intro = document.createElement('div');
  intro.className = 'radiant-result-intro';
  intro.dataset.outcome = outcome;
  intro.setAttribute('aria-hidden', 'true');
  intro.innerHTML = `<span class="radiant-result-intro-word">${Array.from(text, (char, index) =>
    `<i data-ch="${char}" style="--i:${index}">${char}</i>`).join('')}</span>`;
  results.classList.add('is-result-intro');
  results.append(intro);
  let done = false;
  const end = (reveal: boolean): void => {
    if (done) return;
    done = true;
    clearTimeout(timer);
    window.removeEventListener('last-light-motion-change', motion);
    intro.remove();
    results.classList.remove('is-result-intro');
    if (reveal) onReveal();
  };
  const motion = (): void => { if (reducedMotion()) end(true); };
  const timer = setTimeout(() => end(true), durationMs);
  intro.addEventListener('click', () => end(true));
  window.addEventListener('last-light-motion-change', motion);
  return () => end(false);
}

const burstRarities: ReadonlySet<Rarity> = new Set(['Legendary', 'Omnic', 'Calamitic']);
/**
 * Finite reward choreography for a freshly saved result sheet; call once per saved result,
 * only after the live presentation settles. Victory: gold sheen, Omnic title light, staggered
 * cards, count-up to the exact saved amounts and bursts for top rarities. Defeat and paused
 * only stagger the cards in. Everything is static under Reduce motion.
 */
export function celebrateRadiantResults(sheet: HTMLElement, outcome: RadiantOutcome): () => void {
  const cleanups: Array<() => void> = [];
  const list = sheet.querySelector<HTMLElement>('.battle-result-rewards ul');
  if (list) cleanups.push(staggerIn(list, ':scope > li', { stepMs: 50 }));
  if (outcome === 'victory') {
    cleanups.push(lusterSheen(sheet, 1100));
    const heading = sheet.querySelector<HTMLElement>('[data-radiant-result-heading]');
    if (heading) cleanups.push(rarityFeedback(heading, 'Omnic'));
    let bursts = 0;
    list?.querySelectorAll<HTMLElement>(':scope > li').forEach((item, index) => {
      const amount = item.querySelector<HTMLElement>(':scope > strong');
      if (amount) cleanups.push(countUp(amount, { delayMs: Math.min(index, 12) * 50 }));
      const rarity = item.dataset.rarity;
      if (isRarity(rarity) && burstRarities.has(rarity) && bursts < 6) { bursts++; cleanups.push(rarityFeedback(item, rarity)); }
    });
  }
  return () => { for (const cleanup of cleanups.splice(0)) cleanup(); };
}
