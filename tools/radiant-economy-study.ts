import { freshGame } from '../supabase/functions/game-operation/engine';
import { chooseRadiantPressureAction, type RadiantPressurePolicy } from '../src/game/radiant-pressure';
import { resolveRadiantRun, type RadiantPlayerAction, type RadiantRunAuthority,
  type RadiantRunOperation, type RadiantRunSnapshot } from '../src/online/radiant-run';
import { pressureStudyLoadouts, pressureStudyNow, pressureStudySeeds } from './radiant-pressure-study';
import { radiantPressureAnchors, assertRadiantPressureAccess,
  type RadiantPressureAnchor } from '../src/game/radiant-pressure-encounters';
import type { RadiantBearerId } from '../src/content/radiant-combat';
import type { Account } from '../src/game/account';
import { storyRules } from '../src/content/story';
import { isStarterId } from '../src/content/starters';

export interface EconomyPoint {
  actions: number;
  damagePrismatica: number;
  bonusPrismatica: number;
  totalPrismatica: number;
  nullPrismatica: number;
  defeated: number;
  phase: string;
  freshCycleRequests: number;
  prismaticaPerRequest: number;
}
export interface EconomyCycle {
  policy: RadiantPressurePolicy;
  firstClearSensitive: boolean;
  outcome: 'victory' | 'defeat' | 'timeout' | 'stalemate';
  budget: number;
  requests: number;
  actions: number;
  full: EconomyPoint;
  bestPartial: EconomyPoint | null;
  partialToFullRatio: number | null;
  repeatPrefix: { attempts: number; requests: number; additionalPrismatica: number; additionalLoot: number } | null;
  exit: { prismatica: number; rewardEvents: number; disposed: boolean };
}
export function measureRadiantEconomyCycle(account: Account, anchor: RadiantPressureAnchor, seed: number,
  options: { maximumActions?: number; stagnationActions?: number; policy?: RadiantPressurePolicy } = {}): EconomyCycle {
  const maximumActions = options.maximumActions ?? 300, stagnationActions = options.stagnationActions ?? 120;
  for (const bound of [maximumActions, stagnationActions])
    if (!Number.isSafeInteger(bound) || bound < 1 || bound > 6000) throw new Error('Invalid economy action bound.');
  if (!Number.isSafeInteger(seed) || seed < 1 || seed > 0xffffffff) throw new Error('Invalid economy seed.');
  const policy = options.policy ?? 'balanced';
  if (!['balanced', 'normal-only', 'support-only'].includes(policy)) throw new Error('Invalid economy policy.');
  let serial = 0;
  const uuid = () => `00000000-0000-4000-8000-${(++serial).toString(16).padStart(12, '0')}`;
  const entries = new Map<string, ReturnType<RadiantRunAuthority['entry']>>();
  const authority: RadiantRunAuthority = { capability: 'isolated-radiant-study', now: pressureStudyNow,
    entry: requestId => {
      if (!entries.has(requestId)) entries.set(requestId, { runId: uuid(), encounterSeed: seed,
        chargeSeed: seed, targetSeed: (seed ^ 0x85ebca6b) >>> 0 || 1 });
      return structuredClone(entries.get(requestId)!);
    } };
  const game = freshGame('economy-fixture');
  game.starterId = Object.keys(account.characters).find(isStarterId) ?? null;
  game.account = structuredClone(account);
  const initial = { revision: 0, state: game };
  const step = (snapshot: RadiantRunSnapshot, operation: RadiantRunOperation) => {
    const run = snapshot.state.radiantStudy;
    const result = resolveRadiantRun(snapshot, { requestId: uuid(), expectedRevision: snapshot.revision,
      runId: operation.kind === 'start' ? null : run!.id,
      encounter: operation.kind === 'start' ? null : run!.encounter, operation }, authority);
    return { snapshot: { revision: result.response.revision, state: result.state },
      rewardCount: result.response.rewards.length };
  };
  let snapshot = step(initial, { kind: 'start', activity: anchor.activity, calibration: 'radiant-pressure-v2' }).snapshot;
  const baseline = structuredClone(snapshot.state.account);
  const budget = snapshot.state.radiantStudy!.enemies.reduce((sum, enemy) => sum + enemy.currencyBudget, 0);
  const point = (value: RadiantRunSnapshot, actions: number): EconomyPoint => {
    const run = value.state.radiantStudy!, totalPrismatica = value.state.account.fractalis - baseline.fractalis;
    return { actions, damagePrismatica: run.state.currencyEarned,
      bonusPrismatica: totalPrismatica - run.state.currencyEarned, totalPrismatica,
      nullPrismatica: value.state.account.lycalis - baseline.lycalis, defeated: run.rewards.defeated.length,
      phase: run.state.phase, freshCycleRequests: actions + 2, prismaticaPerRequest: totalPrismatica / (actions + 2) };
  };
  let actions = 0, bestPartial: EconomyPoint | null = null, bestSnapshot: RadiantRunSnapshot | null = null;
  let stagnation = 0, lowestHP = Infinity, halted: 'timeout' | 'stalemate' | null = null;
  const actionLog: RadiantPlayerAction[] = [];
  while (snapshot.state.radiantStudy!.state.phase === 'player') {
    if (actions >= maximumActions) { halted = 'timeout'; break; }
    if (stagnation >= stagnationActions) { halted = 'stalemate'; break; }
    const state = snapshot.state.radiantStudy!.state;
    const actor = state.bearers.find(unit => unit.hp > 0 && !state.acted.includes(unit.loadout.id));
    if (!actor) throw new Error('Economy player phase lacks an actionable bearer.');
    const action = chooseRadiantPressureAction(state, actor.loadout.id, policy);
    if (action.type !== 'normal' && action.type !== 'defense' && action.type !== 'flare')
      throw new Error('Economy selected a nonplayer action.');
    const choice = action;
    actionLog.push(choice);
    snapshot = step(snapshot, { kind: 'action', action: choice }).snapshot;
    actions++;
    const current = point(snapshot, actions);
    const low = snapshot.state.radiantStudy!.state.enemies.reduce((sum, enemy) => sum + enemy.currency.lowestHP, 0);
    if (low < lowestHP) { lowestHP = low; stagnation = 0; } else stagnation++;
    if (current.phase === 'player' && current.totalPrismatica > 0 &&
      (!bestPartial || current.prismaticaPerRequest > bestPartial.prismaticaPerRequest)) {
      bestPartial = current; bestSnapshot = structuredClone(snapshot);
    }
  }
  const full = point(snapshot, actions);
  let repeatPrefix: EconomyCycle['repeatPrefix'] = null;
  if (bestSnapshot && bestPartial) {
    let replay = bestSnapshot, additionalLoot = 0, requests = 0;
    const before = replay.state.account.fractalis;
    for (let attempt = 0; attempt < 3; attempt++) {
      replay = step(replay, { kind: 'quit' }).snapshot;
      replay = step(replay, { kind: 'retry' }).snapshot;
      requests += 2;
      for (const action of actionLog.slice(0, bestPartial.actions)) {
        const next = step(replay, { kind: 'action', action });
        replay = next.snapshot; additionalLoot += next.rewardCount; requests++;
      }
    }
    repeatPrefix = { attempts: 3, requests,
      additionalPrismatica: replay.state.account.fractalis - before, additionalLoot };
    if (repeatPrefix.additionalPrismatica !== 0 || additionalLoot !== 0)
      throw new Error('Repeated identical prefix repaid currency or loot.');
    const partialExit = step(bestSnapshot, { kind: 'exit' });
    if (partialExit.snapshot.state.account.fractalis !== bestSnapshot.state.account.fractalis ||
      partialExit.rewardCount !== 0 || partialExit.snapshot.state.radiantStudy)
      throw new Error('Partial exit changed banked rewards or failed to dispose.');
  }
  const exit = step(snapshot, { kind: 'exit' });
  const outcome = halted ?? snapshot.state.radiantStudy!.state.phase;
  if (outcome !== 'victory' && outcome !== 'defeat' && outcome !== 'timeout' && outcome !== 'stalemate')
    throw new Error('Invalid economy terminal outcome.');
  return { policy, firstClearSensitive: anchor.activity.kind === 'story' &&
      (account.storyCompleted ?? 0) < anchor.activity.stage,
    outcome, budget, requests: actions + 2, actions, full, bestPartial,
    partialToFullRatio: full.prismaticaPerRequest > 0 && bestPartial
      ? bestPartial.prismaticaPerRequest / full.prismaticaPerRequest : null,
    repeatPrefix, exit: { prismatica: exit.snapshot.state.account.fractalis - snapshot.state.account.fractalis,
      rewardEvents: exit.rewardCount, disposed: exit.snapshot.state.radiantStudy === undefined } };
}
export function executeRadiantEconomyStudy(emit: (row: unknown) => void): void {
  const anchors = radiantPressureAnchors().filter(anchor =>
    ['early', 'final'].includes(anchor.position) && anchor.activity.kind !== 'calamity' &&
    anchor.activity.kind !== 'oblivion' &&
    (anchor.activity.kind !== 'training' || anchor.trainingWave === 1));
  const profiles: { id: string; ids: RadiantBearerId[]; level: number; gear: 'empty' | 'common' | 'farmed';
    free?: boolean; policy?: RadiantPressurePolicy }[] = [
    { id: 'free-ember0', ids: ['ember'], level: 0, gear: 'empty', free: true },
    { id: 'free-tide0', ids: ['tide'], level: 0, gear: 'empty', free: true },
    { id: 'free-sprout0', ids: ['sprout'], level: 0, gear: 'empty', free: true },
    { id: 'free-ember0-normal-only', ids: ['ember'], level: 0, gear: 'empty', free: true, policy: 'normal-only' },
    { id: 'free-tide0-normal-only', ids: ['tide'], level: 0, gear: 'empty', free: true, policy: 'normal-only' },
    { id: 'free-sprout0-normal-only', ids: ['sprout'], level: 0, gear: 'empty', free: true, policy: 'normal-only' },
    { id: 'solo-owned-starter30', ids: ['ember'], level: 30, gear: 'empty' },
    { id: 'conditional-common-trio60', ids: ['ember', 'tide', 'sprout'], level: 60, gear: 'common' },
    { id: 'conditional-farmed-six105', ids: ['ember', 'tide', 'sprout', 'disciple', 'aurora', 'razor'],
      level: 105, gear: 'farmed' },
  ];
  emit({ metadata: { schema: 1, seeds: pressureStudySeeds, now: pressureStudyNow,
    maximumActions: 300, stagnationActions: 120, authorityAttemptsPerMinute: 120,
    assumptions: ['Read-only virtual account authority, no database/network/live player writes.',
      'One starter free; larger squads, levels, gear/Masters and activity prerequisites are conditional laboratory holdings.',
      'Three free-starter controls have no pre-cleared stages/grants; each is a separate one-starter account.',
      'Free Story first-clear outputs are acquisition controls, NOT repeatable currency/premium farm rates.',
      'Developed conditional fixtures pre-clear Story to exclude first-clear bonuses from repeatable farming.',
      'Rate is Prismatica per accepted request including start+actions+exit, NOT observed real-time player income.',
      'Existing SQL limit is120 attempts per60-second window anchored to first request/server time; rejects/retries also consume it.',
      'No animation/network/speed/latency estimate, population clear rate, final tuning approval or global optimization.',
      'Every legal balanced-action prefix is screened, with strongest paying nonterminal prefix compared to terminal play.',
      'Free starters also run Normal-only controls; conservative balanced-policy stalemate is not proven player inability.',
      'Repeat identical prefix through quit/retry three times must pay zero additional currency/loot.',
      'Calamity zero-Prismatica and ownership-gated Oblivion excluded; next-wave Training is not a fresh-entry choice.',
      'Three deterministic seeds are a small comparative sample; all complete and denied cases are retained.'],
    anchors: anchors.map(anchor => ({ id: anchor.id, activity: anchor.activity })), profiles } });
  let measured = 0, denied = 0;
  const cohorts: Record<string, { measured: number; denied: number; outcomes: Record<string, number>;
    strongerPartialOnVictory: number; maximumPartialToFullRatio: number;
    retryAttempts: number; retryRequests: number; retryPrismatica: number; retryLoot: number }> = {};
  for (const profile of profiles) cohorts[profile.id] = { measured: 0, denied: 0, outcomes: {},
    strongerPartialOnVictory: 0, maximumPartialToFullRatio: 0, retryAttempts: 0,
    retryRequests: 0, retryPrismatica: 0, retryLoot: 0 };
  for (const profile of profiles) for (const anchor of anchors) for (const seed of pressureStudySeeds) {
    const fixture = pressureStudyLoadouts(profile.ids, profile.level, profile.gear).account;
    fixture.squad = profile.ids;
    fixture.storyCompleted = profile.free ? 0 : storyRules.stages;
    const activity = anchor.activity;
    if (!profile.free) {
      if (activity.kind === 'dungeon') fixture.dungeonStages[activity.element] = activity.stage;
      if (activity.kind === 'infusion') fixture.infusionStages[activity.mode] = activity.stage;
      if (activity.kind === 'war') fixture.warStages = { [activity.character]: activity.stage };
    }
    if (profile.gear === 'farmed') fixture.masterEquipment = Object.fromEntries(
      pressureStudyLoadouts(profile.ids, profile.level, profile.gear).loadouts.map(member => [member.id, member.masterId!]));
    try {
      assertRadiantPressureAccess(anchor, fixture, pressureStudyNow);
      const result = measureRadiantEconomyCycle(fixture, anchor, seed, { policy: profile.policy });
      emit({ sample: { profile: profile.id, anchor: anchor.id, seed, result } }); measured++;
      const cohort = cohorts[profile.id];
      cohort.measured++;
      cohort.outcomes[result.outcome] = (cohort.outcomes[result.outcome] ?? 0) + 1;
      if (result.outcome === 'victory') {
        if ((result.partialToFullRatio ?? 0) > 1 + 1e-6) cohort.strongerPartialOnVictory++;
        cohort.maximumPartialToFullRatio = Math.max(cohort.maximumPartialToFullRatio, result.partialToFullRatio ?? 0);
      }
      if (result.repeatPrefix) {
        cohort.retryAttempts += result.repeatPrefix.attempts;
        cohort.retryRequests += result.repeatPrefix.requests;
        cohort.retryPrismatica += result.repeatPrefix.additionalPrismatica;
        cohort.retryLoot += result.repeatPrefix.additionalLoot;
      }
    } catch (error) {
      if (!(error instanceof Error) || !error.message.startsWith('Activity locked.') &&
        error.message !== 'Pressure study stage is locked.')
        throw error;
      emit({ denied: { profile: profile.id, anchor: anchor.id, seed, reason: error.message } }); denied++;
      cohorts[profile.id].denied++;
    }
  }
  emit({ completed: { measured, denied, cohorts } });
}
