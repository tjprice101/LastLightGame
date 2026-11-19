import { describe, expect, it } from 'vitest';
import { freshGame } from '../../supabase/functions/game-operation/engine';
import { resolveRadiantRun } from '../online/battle-run';
import { radiantConduitContributionMarkup, radiantConduitContributions } from './battle-conduit-contribution';
import { radiantResultsMarkup } from './battle-outcome';

function run() {
  const game = freshGame('contribution-test'); game.starterId = 'ember'; game.account.squad = ['ember'];
  game.account.characters.ember = { level: 30, evolution: 1 };
  const id = '00000000-0000-4000-8000-000000000002';
  const saved = resolveRadiantRun({ revision: 0, state: game }, { requestId: id, expectedRevision: 0, runId: null, encounter: null,
    operation: { kind: 'start', activity: { kind: 'training' }, calibration: 'authored-control' } },
  { capability: 'isolated-radiant-study', now: Date.UTC(2026, 10, 8),
    entry: () => ({ runId: id, encounterSeed: 1729, chargeSeed: 7, targetSeed: 104729 }) }).response.run;
  saved.state.bearers[0].loadout.gear = [{ id: 'prism-splinter-socket', rank: 2 }, { id: 'vigil-core', rank: 0 },
    null, null, null, null, null, null];
  return saved;
}
describe('Conduit contribution summary (D-492)', () => {
  it('tallies own effects, boost shares, prevented damage, Luminosity and always-on Health', () => {
    const saved = run(), ember = saved.state.bearers[0].loadout.id, enemy = saved.enemies[0].id;
    const prism = { kind: 'gear' as const, bearerId: ember, conduitId: 'prism-splinter-socket' as const };
    const leader = { kind: 'leader' as const, bearerId: ember };
    saved.journal.events = [
      { type: 'damage', source: { kind: 'normal', bearerId: ember }, targetId: enemy, origin: 'direct', offered: 500,
        absorbed: 0, healthLoss: 500, shields: [], boosts: [{ source: prism, amount: 80 }, { source: leader, amount: 20 }] },
      { type: 'damage', source: { kind: 'enemy', enemyId: enemy }, targetId: ember, origin: 'direct', offered: 90,
        absorbed: 0, healthLoss: 90, shields: [], boosts: [{ source: prism, amount: 7 }] },
      { type: 'charge', bearerId: ember, personal: 30, bonusRolls: 0, bonusOffered: 0, gearSource: prism, gained: 12 },
      { type: 'charge', bearerId: ember, personal: 30, bonusRolls: 0, bonusOffered: 0, gearSource: prism },
    ];
    const before = structuredClone(saved);
    const [group] = radiantConduitContributions(saved);
    const byName = new Map(group.entries.map(entry => [entry.name, entry]));
    expect(byName.get('Prism Splinter Socket')).toMatchObject({ damage: 80, prevented: 7, luminosity: 12 });
    expect(group.entries.find(entry => entry.source.kind === 'leader')!.damage).toBe(20);
    const vigil = group.entries.find(entry => entry.source.kind === 'gear' && entry.source.conduitId === 'vigil-core')!;
    expect(vigil.maxHealth).toBeGreaterThan(0);
    expect(vigil.damage).toBe(0);
    expect(saved).toEqual(before);
  });
  it('renders exact totals inside the results sheet and lists idle Conduits honestly', () => {
    const saved = run();
    saved.journal.events = [];
    const markup = radiantConduitContributionMarkup(saved);
    expect(markup).toContain('<summary>Conduit contribution</summary>');
    expect(markup).toContain('No trigger this battle');
    expect(markup).toMatch(/\+[\d,]+<\/b> max Health/);
    expect(markup).not.toContain('Leader Skill');
    saved.state.phase = 'victory';
    expect(radiantResultsMarkup(saved, true)).toContain('data-radiant-contribution');
  });
  it('omits the section when no Conduit, Master or Leader effect took part', () => {
    const saved = run();
    saved.state.bearers[0].loadout.gear = undefined;
    saved.journal.events = [];
    expect(radiantConduitContributionMarkup(saved)).toBe('');
  });
});

describe('Conduit callouts (D-492)', () => {
  it('merges one Conduit per frame, drops tiny boost shares and caps two per bearer', async () => {
    const { radiantConduitCallouts } = await import('./battle-conduit-contribution');
    const saved = run(), ember = saved.state.bearers[0].loadout.id, enemy = saved.enemies[0].id;
    const prism = { kind: 'gear' as const, bearerId: ember, conduitId: 'prism-splinter-socket' as const };
    const vigil = { kind: 'gear' as const, bearerId: ember, conduitId: 'vigil-core' as const };
    const master = { kind: 'master' as const, bearerId: ember };
    const callouts = radiantConduitCallouts([
      { type: 'damage', source: { kind: 'normal', bearerId: ember }, targetId: enemy, origin: 'direct', offered: 1000,
        absorbed: 0, healthLoss: 1000, shields: [], boosts: [{ source: prism, amount: 200 }, { source: vigil, amount: 40 }] },
      { type: 'shield', source: prism, targetId: ember, amount: 300, shieldId: 4 },
      { type: 'charge', bearerId: ember, personal: 20, bonusRolls: 0, bonusOffered: 0, gearSource: master, gained: 5 },
      { type: 'heal', source: { kind: 'leader', bearerId: ember }, targetId: ember, snapshot: 50, offered: 50, effective: 50 },
    ], saved);
    expect(callouts).toEqual([
      { bearerId: ember, elementId: 'infernic', name: 'Prism Splinter Socket', text: '+200 damage · Shield +300' },
      expect.objectContaining({ bearerId: ember, text: '+5 Luminosity' }),
    ]);
  });
});
