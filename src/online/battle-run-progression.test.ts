import { describe, expect, it } from 'vitest';
import { freshGame } from '../../supabase/functions/game-operation/engine';
import { resolveRadiantRun, validateFrozenRadiantRun, validateRadiantRunResponse, type RadiantRunSnapshot, type RadiantRunOperation,
  type RadiantRunResponse, type RadiantRunAuthority } from './battle-run';
import { storyRules, storyClearReward } from '../content/story';
import { infusionStageCount, warStageCount } from '../content/activities';
import { createRadiantCombat, depleteRadiantCurrency } from '../game/combat-engine';

let sequence = 0;
const uuid = () => `00000000-0000-4000-8000-${(++sequence).toString(16).padStart(12, '0')}`;
const authority: RadiantRunAuthority = { capability: 'isolated-radiant-study', now: Date.UTC(2026, 10, 8),
  entry: () => ({ runId: uuid(), encounterSeed: 1729, chargeSeed: 104729, targetSeed: 7 }) };
function fixture(): RadiantRunSnapshot {
  const state = freshGame('progression-player');
  state.starterId = 'ember'; state.account.squad = ['ember'];
  state.account.characters.ember = { level: 105, evolution: 6, weaponRank: 0 };
  return { revision: 0, state };
}
function step(snapshot: RadiantRunSnapshot, operation: RadiantRunOperation) {
  const result = resolveRadiantRun(snapshot, { requestId: uuid(), expectedRevision: snapshot.revision,
    runId: operation.kind === 'start' ? null : snapshot.state.radiantStudy!.id,
    encounter: operation.kind === 'start' ? null : snapshot.state.radiantStudy!.encounter, operation }, authority);
  validateRadiantRunResponse(result.response);
  return { snapshot: { revision: result.response.revision, state: result.state }, response: result.response };
}
function clear(snapshot: RadiantRunSnapshot) {
  const responses: RadiantRunResponse[] = [];
  for (let i = 0; i < 100 && snapshot.state.radiantStudy!.state.phase === 'player'; i++) {
    const run = snapshot.state.radiantStudy!;
    const result = step(snapshot, { kind: 'action', action: { type: 'normal',
      bearerId: run.state.bearers.find(unit => unit.hp > 0 && !run.state.acted.includes(unit.loadout.id))!.loadout.id,
      targetId: run.state.enemies.find(unit => unit.hp > 0)!.id } });
    snapshot = result.snapshot; responses.push(result.response);
  }
  expect(snapshot.state.radiantStudy!.state.phase).toBe('victory');
  return { snapshot, responses };
}
function variedVictory(activity: 'story' | 'training'): RadiantRunSnapshot {
  const account = fixture();
  account.state.account.squad = ['ember', 'tide', 'sprout'];
  account.state.account.characters.tide = { level: 105, evolution: 6, weaponRank: 0 };
  account.state.account.characters.sprout = { level: 105, evolution: 6, weaponRank: 0 };
  const entry = step(account, { kind: 'start',
    activity: activity === 'story' ? { kind: 'story', stage: 1 } : { kind: 'training' },
    calibration: 'authored-control' }).snapshot;
  const victory = clear(entry).snapshot, state = victory.state.radiantStudy!.state;
  state.bearers[0].hp = Math.round(state.bearers[0].stats.hp / 2);
  state.bearers[0].shields = [
    { id: 1, source: { kind: 'flare', bearerId: 'tide' }, remaining: 121 },
    { id: 3, source: { kind: 'passive', bearerId: 'ember' }, remaining: 34 },
  ];
  state.bearers[1].shields = [{ id: 2, source: { kind: 'flare', bearerId: 'tide' }, remaining: 55 }];
  state.bearers[0].renewal = [{ source: { kind: 'flare', bearerId: 'sprout' }, magnitude: 25, remaining: 2 }];
  state.bearers[0].seeds = [{ source: { kind: 'passive', bearerId: 'sprout' }, magnitude: 8, remaining: 1 }];
  state.bearers[0].reductions = [{ source: { kind: 'flare', bearerId: 'tide' }, magnitude: .2, remaining: 2 }];
  state.bearers[0].attackBuffs = [{ source: { kind: 'passive', bearerId: 'ember' }, magnitude: .1, remaining: 1 }];
  state.bearers[0].guarding = true;
  state.bearers[2].hp = 0;
  state.gauge.members[2].living = false;
  state.gauge.members[0].charge = 20.3;
  state.gauge.members[1].charge = 6.7;
  state.gauge.members[2].charge = 4.1;
  state.nextShieldId = 4;
  validateFrozenRadiantRun(victory.state.radiantStudy);
  return victory;
}
describe('actual Radiant action-to-reward and progression authority', () => {
  it('first Story clear, banked Retry, newly unlocked Continue and frozen gear are coherent', () => {
    let snapshot = step(fixture(), { kind: 'start', activity: { kind: 'story', stage: 1 },
      calibration: 'radiant-pressure-v2' }).snapshot;
    expect(Object.values(snapshot.state.account.creatures)).toEqual([{ defeated: false }, { defeated: false }]);
    const first = clear(snapshot);
    snapshot = first.snapshot;
    const run = snapshot.state.radiantStudy!, clearPay = storyClearReward(true);
    expect(snapshot.state.account.fractalis).toBe(run.state.currencyEarned + clearPay.fractalis);
    expect(snapshot.state.account.lycalis).toBe(clearPay.lycalis);
    expect(snapshot.state.account.storyCompleted).toBe(1);
    expect(first.responses.flatMap(response => response.rewards)).toHaveLength(2);
    expect(first.responses.reduce((sum, response) => sum + response.rewards.reduce((s, reward) => s + reward.amount, 0), 0))
      .toBe(clearPay.fractalis);
    const banked = structuredClone(snapshot.state.account), ledger = structuredClone(run.rewards);
    snapshot = step(snapshot, { kind: 'retry' }).snapshot;
    expect(snapshot.state.radiantStudy!.rewards).toEqual(ledger);
    const replay = clear(snapshot);
    expect(replay.responses.flatMap(response => response.rewards)).toEqual([]);
    expect(replay.snapshot.state.account.fractalis).toBe(banked.fractalis);
    expect(replay.snapshot.state.account.materials).toEqual(banked.materials);
    snapshot = replay.snapshot;
    snapshot.state.account.characters.ember = { level: 0, evolution: 1 };
    snapshot = step(snapshot, { kind: 'continue' }).snapshot;
    expect(snapshot.state.radiantStudy!.anchor.activity).toEqual({ kind: 'story', stage: 2 });
    expect(snapshot.state.radiantStudy!.initial.bearers[0].loadout.level).toBe(105);
    expect(snapshot.state.radiantStudy!.rewards.defeated).toEqual([]);
    expect(snapshot.state.radiantStudy!.rewards.seeds).toEqual(ledger.seeds);
    const next = clear(snapshot);
    expect(next.snapshot.state.account.storyCompleted).toBe(2);
    expect(next.snapshot.state.account.lycalis - banked.lycalis).toBe(clearPay.lycalis);
  });
  it('Training Continue increments real wave/level and carries reward seeds instead of restarting wave1', () => {
    const entry = step(fixture(), { kind: 'start', activity: { kind: 'training' },
      calibration: 'radiant-pressure-v2' }).snapshot;
    const victory = clear(entry).snapshot;
    const next = step(victory, { kind: 'continue' }).snapshot;
    expect(next.state.radiantStudy!.anchor.trainingWave).toBe(2);
    expect(next.state.radiantStudy!.enemies.every(enemy => enemy.level === 2)).toBe(true);
    expect(next.state.radiantStudy!.rewards.seeds).toEqual(victory.state.radiantStudy!.rewards.seeds);
    expect(next.state.account.fractalis).toBe(victory.state.account.fractalis);
    expect(clear(next).snapshot.state.account.fractalis).toBeGreaterThan(victory.state.account.fractalis);
  });
  it('staged Continue revives/restores HP and resets effects while preserving exact personal charge', () => {
    const victory = variedVictory('story'), prior = structuredClone(victory.state.radiantStudy!.state);
    const next = step(victory, { kind: 'continue' }).snapshot.state.radiantStudy!;
    expect(next.initial.gauge).toEqual({ ...prior.gauge,
      members: prior.gauge.members.map(member => ({ ...member, living: true })) });
    expect(next.state.gauge).toEqual(next.initial.gauge);
    expect(next.state.bearers.map(member => member.hp)).toEqual(next.state.bearers.map(member => Math.round(member.stats.hp)));
    for (const member of next.state.bearers) {
      expect(member.shields).toEqual([]);
      expect([member.renewal, member.seeds, member.weaken, member.reductions, member.attackBuffs]).toEqual([[], [], [], [], []]);
      expect(member.guarding).toBe(false);
    }
    expect(next.state.nextShieldId).toBe(1);
    expect(next.state.round).toBe(1);
    expect(next.continuation?.state).toEqual(prior);
    expect(validateFrozenRadiantRun(JSON.parse(JSON.stringify(next)))).toEqual(next);
  });
  it('Training Continue preserves HP, defeated members, sourced Shields and statuses, then retries from that frozen entry', () => {
    const victory = variedVictory('training'), prior = structuredClone(victory.state.radiantStudy!.state);
    let next = step(victory, { kind: 'continue' }).snapshot;
    const run = next.state.radiantStudy!;
    expect(run.initial.bearers).toEqual(prior.bearers);
    expect(run.initial.gauge).toEqual(prior.gauge);
    expect(run.initial.nextShieldId).toBe(prior.nextShieldId);
    expect(run.initial.round).toBe(prior.round + 1);
    expect(run.initial.acted).toEqual([]);
    expect(run.state).toEqual(run.initial);
    expect(run.anchor.trainingWave).toBe(2);
    expect(validateFrozenRadiantRun(JSON.parse(JSON.stringify(run)))).toEqual(run);
    const initial = structuredClone(run.initial);
    next = step(next, { kind: 'action', action: { type: 'normal', bearerId: 'ember',
      targetId: run.state.enemies[0].id } }).snapshot;
    next = step(next, { kind: 'quit' }).snapshot;
    next = step(next, { kind: 'retry' }).snapshot;
    expect(next.state.radiantStudy!.state.bearers).toEqual(initial.bearers);
    expect(next.state.radiantStudy!.state.gauge).toEqual(initial.gauge);
    expect(next.state.radiantStudy!.state.nextShieldId).toBe(initial.nextShieldId);
    expect(next.state.radiantStudy!.state.round).toBe(initial.round);
  });
  it('accepts pre-existing version-3 snapshots without continuation provenance', () => {
    const victory = clear(step(fixture(), { kind: 'start', activity: { kind: 'story', stage: 1 },
      calibration: 'authored-control' }).snapshot).snapshot;
    const legacy = step(victory, { kind: 'continue' }).snapshot.state.radiantStudy!;
    delete legacy.continuation;
    legacy.initial = createRadiantCombat(legacy.initial.bearers.map(member => member.loadout), legacy.enemies, legacy.initialChargeSeed);
    legacy.state = structuredClone(legacy.initial);
    expect(validateFrozenRadiantRun(JSON.parse(JSON.stringify(legacy)))).toEqual(legacy);
  });
  it('rejects altered continuation provenance, unearned charge, invalid Shields and mismatched seeds', () => {
    const valid = step(variedVictory('training'), { kind: 'continue' }).snapshot.state.radiantStudy!;
    const mutations: ((run: typeof valid) => void)[] = [
      run => { run.continuation!.state.phase = 'player'; },
      run => { run.initial.gauge.members[0].charge += .1; },
      run => { run.continuation!.state.gauge.members[0].charge = 9999; run.initial.gauge.members[0].charge = 9999; },
      run => { run.continuation!.state.bearers[0].shields[0].source = { kind: 'passive', bearerId: 'missing' }; },
      run => { run.continuation!.state.bearers[0].shields[1].id = 1; },
      run => { run.continuation!.state.nextShieldId = 3; },
      run => { run.continuation!.anchor.trainingWave = 4; },
      run => { run.initialChargeSeed = run.initialChargeSeed === 1 ? 2 : 1; },
      run => { run.continuation!.state.enemies[0].stats.hp += 1; },
      run => { delete run.continuation; },
    ];
    for (const mutate of mutations) {
      const corrupt = structuredClone(valid);
      mutate(corrupt);
      expect(() => validateFrozenRadiantRun(corrupt)).toThrow('Invalid saved Radiant encounter');
    }
  });
  it('explicit exit disposes the run, retains all saved rewards and permits a new authorized entry', () => {
    const entry = step(fixture(), { kind: 'start', activity: { kind: 'training' },
      calibration: 'radiant-pressure-v2' }).snapshot;
    const victory = clear(entry).snapshot;
    const exit = step(victory, { kind: 'exit' });
    expect(exit.snapshot.state.radiantStudy).toBeUndefined(); expect(exit.response.run.quit).toBe(true);
    expect(exit.snapshot.state.account.fractalis).toBe(victory.state.account.fractalis);
    const fresh = step(exit.snapshot, { kind: 'start', activity: { kind: 'training' },
      calibration: 'radiant-pressure-v2' });
    expect(fresh.snapshot.state.radiantStudy!.id).not.toBe(victory.state.radiantStudy!.id);
    expect(fresh.snapshot.state.account.fractalis).toBe(victory.state.account.fractalis);
  });
  it.each([
    { kind: 'story', stage: storyRules.stages } as const,
    { kind: 'infusion', mode: 'machines', stage: infusionStageCount('machines') } as const,
    { kind: 'war', character: 'nerithe', stage: warStageCount } as const,
  ])('synthetic victory denies beyond final %j without changing the account', activity => {
    const value = fixture();
    value.state.account.storyCompleted = storyRules.stages;
    value.state.account.infusionStages.machines = infusionStageCount('machines');
    value.state.account.warStages = { nerithe: warStageCount };
    const entry = step(value, { kind: 'start', activity, calibration: 'radiant-pressure-v2' }).snapshot;
    const run = entry.state.radiantStudy!;
    run.state.enemies.forEach(enemy => { enemy.hp = 0;
      enemy.currency = depleteRadiantCurrency(enemy.currency, 0).ledger; });
    run.state.currencyEarned = run.state.enemies.reduce((sum, enemy) => sum + enemy.currency.paid, 0);
    run.state.phase = 'victory';
    const before = structuredClone(entry);
    expect(() => step(entry, { kind: 'continue' })).toThrow();
    expect(entry).toEqual(before);
  });
  it('rejects malformed saved reward payloads before presentation', () => {
    const entry = step(fixture(), { kind: 'start', activity: { kind: 'story', stage: 1 },
      calibration: 'radiant-pressure-v2' }).snapshot;
    const saved = clear(entry).responses.find(response => response.rewards.length)!;
    for (const mutation of [
      { amount: -1 }, { materials: { invented: 1 } }, { source: 'client-enemy' },
      { capture: { creatureId: 'unknown', level: 1 } }, { storyBonus: { fractalis: Infinity, lycalis: 2 } },
    ]) {
      const invalid = structuredClone(saved); Object.assign(invalid.rewards[0], mutation);
      expect(() => validateRadiantRunResponse(invalid)).toThrow();
    }
  });
});
