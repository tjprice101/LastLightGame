import { describe, expect, it } from 'vitest';
import { freshGame } from '../../supabase/functions/game-operation/engine';
import { resolveRadiantRun } from '../online/radiant-run';
import { radiantEncounterRewards, radiantHasNextEncounter, radiantResultsMarkup } from './radiant-results';
import type { Activity } from '../online/server-game';
import { dungeonStageCount, infusionStageCount, storyStageLayout, warStageCount } from '../content/activities';
import { gatesOfOblivionRules } from '../content/gates-of-oblivion';

function run() {
  const game = freshGame('result-test'); game.starterId = 'ember'; game.account.squad = ['ember'];
  game.account.characters.ember = { level: 30, evolution: 1 };
  const id = '00000000-0000-4000-8000-000000000001';
  return resolveRadiantRun({ revision: 0, state: game }, { requestId: id, expectedRevision: 0, runId: null, encounter: null,
    operation: { kind: 'start', activity: { kind: 'training' }, calibration: 'authored-control' } },
  { capability: 'isolated-radiant-study', now: Date.UTC(2026, 10, 8),
    entry: () => ({ runId: id, encounterSeed: 1729, chargeSeed: 7, targetSeed: 104729 }) }).response.run;
}
describe('saved Radiant result receipts', () => {
  it('includes damage-paid Prismatica and actual loot bonuses once, without rewriting saved history', () => {
    const saved = run();
    saved.journal.events = [{ type: 'currency', enemyId: saved.enemies[0].id, amount: 17, totalPaid: 17 }];
    const reward = { kind: 'reward' as const, source: saved.enemies[0].id, target: 'squad', amount: 50,
      critical: false, message: 'Saved first-clear bonus', lycalis: 5 };
    saved.journal.rewards = [reward, structuredClone(reward)];
    const before = structuredClone(saved), rewards = radiantEncounterRewards(saved);
    expect(rewards.find(item => item.id === 'fractalis')!.amount).toBe(67);
    expect(rewards.find(item => item.id === 'lycalis')!.amount).toBe(5);
    saved.state.phase = 'victory';
    expect(radiantResultsMarkup(saved, true)).toContain('+67');
    expect(radiantResultsMarkup(saved, true)).toContain('data-radiant-transition="exit"');
    saved.state.phase = before.state.phase;
    expect(saved).toEqual(before);
  });
  it.each([
    { kind: 'story', stage: storyStageLayout.stages },
    { kind: 'dungeon', element: 'infernic', stage: dungeonStageCount },
    { kind: 'infusion', mode: 'heavens', stage: infusionStageCount('heavens') },
    { kind: 'war', character: 'nerithe', stage: warStageCount },
    { kind: 'oblivion', stage: gatesOfOblivionRules.stages },
    { kind: 'calamity', activity: 'machines', tier: 1 },
  ] satisfies Activity[])('omits Continue at the actual authored $kind endpoint', activity => {
    const saved = run(); saved.anchor.activity = activity; saved.state.phase = 'victory';
    expect(radiantHasNextEncounter(saved)).toBe(false);
    expect(radiantResultsMarkup(saved, false)).not.toContain('data-radiant-transition="continue"');
    expect(radiantResultsMarkup(saved, false)).not.toContain('data-radiant-transition="exit"');
  });
  it('defeat and paused runs retain receipts but never offer Continue or victory copy', () => {
    const saved = run(); saved.state.phase = 'defeat';
    expect(radiantResultsMarkup(saved, true)).not.toContain('Victory');
    expect(radiantResultsMarkup(saved, true)).not.toContain('data-radiant-transition="continue"');
    saved.quit = true; saved.state.phase = 'player';
    expect(radiantResultsMarkup(saved, true)).toContain('Encounter paused');
    expect(radiantResultsMarkup(saved, true)).not.toContain('data-radiant-transition="continue"');
  });
});
