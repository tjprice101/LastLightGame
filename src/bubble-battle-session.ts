import { isStarterId } from './content/starters';
import { getCreature } from './content/creatures';
import { createSession, type BattleSession } from './presentation/battle-view';
import type { BattleSpeed } from './presentation/battle-speed';
import { actAndAdvanceTurn, advanceUnavailableTurns, combatantCanAct, type BattleEvent, type BattleResult, type BattleState } from './game/battle';
import { equippedSquad, saveAccountRewards, type Account } from './game/account';
import { createExampleSession } from './bubble-preview-model';

export type BubbleBattleDestination = Parameters<typeof createSession>[2];
/** Same-origin hand-off from the bubble mock-up page to its embedded live battle frame. */
export interface BubbleBattleBridge {
  account: Account;
  destination: BubbleBattleDestination;
  view: 'battle' | 'results';
  reduced: boolean;
  /** Presentation-only animation speed shared with the mock-up's Settings; never saved. */
  speed: BattleSpeed;
  setSpeed(speed: BattleSpeed): void;
  leave(): void;
  settings(): void;
  /** A battle action on the still battlefield resolves the encounter and shows the live victory sheet. */
  victory(): void;
  next(): void;
  retry(): void;
  quit(): void;
}
declare global { interface Window { lastLightBubbleBattle?: () => BubbleBattleBridge } }
export interface BubbleBattle {
  session: BattleSession;
  /** Story first clear earned in this encounter (live decorates the final reward event). */
  firstClear: boolean;
  storyBonus: { fractalis: number; lycalis: number } | null;
  discoveries: string[];
  captures: string[];
  /** False when the private save rejected the encounter (for example, a locked stage); the sheet still shows the actual kill events. */
  saved: boolean;
}

function turn(state: BattleState): BattleResult {
  const target = state.enemies.find(enemy => enemy.hp > 0);
  const actor = target && state.allies.find(ally => combatantCanAct(state, ally, target.id));
  return actor && target ? actAndAdvanceTurn(state, actor.id, 'light', target.id) : advanceUnavailableTurns(state);
}

/**
 * Builds the live battle session for the bubble mock-up from a copy of its in-memory account.
 * `cleared` resolves real Normal Attacks to victory and commits each result to a throwaway copy,
 * so rewards, first-clear pay and regional bonuses are decorated exactly as the live game does.
 */
export function bubbleBattle(source: Account, destination: BubbleBattleDestination, cleared: boolean): BubbleBattle {
  const copy = structuredClone(source);
  // A player reaching this Story stage has cleared the one before it; only this throwaway copy is adjusted.
  if (destination && 'storyStage' in destination) copy.storyCompleted = Math.max(copy.storyCompleted ?? 0, destination.storyStage - 1);
  const preview = createExampleSession(copy);
  const ids = equippedSquad(source);
  const leader = ids.find(isStarterId) ?? 'ember';
  const session = createSession(leader, source.characters[leader] ?? { level: 0, evolution: 1 }, destination, {
    ids, progress: source.characters, equipment: source.conduitEquipment, captures: source.capturedCharacters,
    upgrades: source.conduitUpgrades, masters: source.masterEquipment,
  });
  session.entrancePending = false;
  let saved = true;
  const commit = (result: BattleResult): void => {
    if (!saved) return;
    try { saveAccountRewards(preview.storage, result, session.runId); }
    catch (error) {
      console.warn('Bubble battle rewards were not decorated:', error);
      saved = false;
    }
  };
  commit({ state: session.state, events: [] });
  const events: BattleEvent[] = [];
  let state = session.state;
  const rounds = cleared ? 800 : 4;
  for (let index = 0; index < rounds && state.phase === 'player'; index++) {
    // Real turns decide the fight; only a stalled encounter is nudged so the victory sheet always appears.
    if (cleared && index >= 400) for (const enemy of state.enemies) if (enemy.hp > 1) enemy.hp = 1;
    const result = turn(state);
    // The battlefield snapshot stops before the final blow so the live arena still shows a fight in progress.
    if (!cleared && (result.state.phase === 'cleared' || result.state.enemies.every(enemy => enemy.hp <= 0))) break;
    commit(result);
    events.push(...result.events);
    state = result.state;
  }
  if (cleared && state.phase !== 'cleared') throw new Error('The encounter could not be resolved to victory.');
  session.state = state;
  session.stageEvents = events;
  session.resultsVisible = cleared;
  const after = preview.account();
  const rewards = events.filter(event => event.kind === 'reward');
  return {
    session, saved,
    firstClear: !!state.story && saved && (source.storyCompleted ?? 0) < state.story.storyStage,
    storyBonus: rewards.find(event => event.storyBonus)?.storyBonus ?? null,
    discoveries: Object.keys(after.creatures ?? {}).filter(id => after.creatures?.[id]?.defeated && !source.creatures?.[id]?.defeated)
      .map(id => { try { return getCreature(id).name; } catch { return null; } }).filter((name): name is string => !!name),
    captures: rewards.flatMap(event => event.capture ? [getCreature(event.capture.creatureId).name] : []),
  };
}
