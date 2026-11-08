import { describe, expect, it } from 'vitest';
import { freshGame } from '../../supabase/functions/game-operation/engine';
import { resolveRadiantRun, validateRadiantRunResponse, type RadiantRunSnapshot, type RadiantRunOperation,
  type RadiantRunResponse, type RadiantRunAuthority } from './radiant-run';
import { storyRules, storyClearReward } from '../content/story';
import { infusionStageCount, warStageCount } from '../content/activities';
import { depleteRadiantCurrency } from '../game/radiant-combat';

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
      bearerId: run.state.bearers.find(unit => unit.hp > 0)!.loadout.id,
      targetId: run.state.enemies.find(unit => unit.hp > 0)!.id } });
    snapshot = result.snapshot; responses.push(result.response);
  }
  expect(snapshot.state.radiantStudy!.state.phase).toBe('victory');
  return { snapshot, responses };
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
