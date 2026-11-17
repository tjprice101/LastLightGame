import { describe, expect, it } from 'vitest';
import { freshGame } from '../../supabase/functions/game-operation/engine';
import { resolveRadiantRun } from '../online/battle-run';
import { radiantSourceLabel, radiantStatusRows, radiantStatusSnapshot, radiantShieldRows } from './battle-timed-status';
import { applyRadiantCombatAction } from '../game/combat-engine';
const id = '00000000-0000-4000-8000-000000000001';
function run() {
  const state = freshGame('statuses'); state.starterId = 'ember';
  state.account.squad = ['ember', 'tide', 'sprout'];
  for (const member of ['ember', 'tide', 'sprout'] as const)
    state.account.characters[member] = { level: 105, evolution: 6 };
  return resolveRadiantRun({ revision: 0, state }, { requestId: id, expectedRevision: 0, runId: null, encounter: null,
    operation: { kind: 'start', activity: { kind: 'training' }, calibration: 'authored-control' } },
  { capability: 'isolated-radiant-study', now: Date.UTC(2026, 10, 8),
    entry: () => ({ runId: id, encounterSeed: 1729, chargeSeed: 7, targetSeed: 104729 }) }).response.run;
}
describe('source-owned Radiant status reference', () => {
  it('shows one row per category with its strongest source, amount and turn clock (D-473 N6)', () => {
    const frozen = run(), enemy = frozen.state.enemies[0];
    enemy.debuffs = [
      { category: 'burn', source: { kind: 'flare', bearerId: 'ember' }, magnitude: 51, remaining: 2 },
      { category: 'weaken', source: { kind: 'gear', bearerId: 'tide', conduitId: 'vigil-core' }, magnitude: .12, remaining: 1 },
    ];
    const before = structuredClone(frozen);
    const rows = radiantStatusSnapshot(frozen.state)[enemy.id];
    expect(rows).toHaveLength(2);
    const html = radiantStatusRows(rows, frozen);
    expect(html.match(/data-radiant-effect="burn"/g)).toHaveLength(1);
    expect(html).toContain('Burn · 51');
    expect(html).toContain('2 turns remaining'); expect(html).toContain('1 turn remaining');
    expect(html).toContain('Infernis'); expect(html).toContain('Tizu'); expect(html).toContain('Vigil Core');
    expect(html).toContain('Weaken · 12%'); expect(html).not.toContain('status-native');
    expect(frozen).toEqual(before);
  });
  it('keeps Shields indefinitely per layer and owner rather than assigning a fictional duration', () => {
    const frozen = run(), unit = frozen.state.bearers[0];
    unit.shields = [{ id: 1, source: { kind: 'flare', bearerId: 'tide' }, remaining: 78 },
      { id: 2, source: { kind: 'gear', bearerId: 'ember', conduitId: 'vigil-core' }, remaining: 91 }];
    const html = radiantShieldRows(unit.shields, frozen);
    expect(html).toContain('data-radiant-shield-id="1"'); expect(html).toContain('data-radiant-shield-id="2"');
    expect(html.match(/Until broken/g)).toHaveLength(2); expect(html).not.toContain('phase');
    expect(html).toContain('Shield · 78'); expect(html).toContain('Shield · 91');
  });
  it('formats fractional amounts at the presentation boundary without changing stored effects', () => {
    const frozen = run(), unit = frozen.state.bearers[0];
    unit.buffs = [
      { category: 'attack-up', source: { kind: 'flare', bearerId: 'sprout' }, magnitude: .35000000000000003, remaining: 1 },
      { category: 'hot', source: { kind: 'skill', bearerId: 'sprout' }, magnitude: .12345, remaining: 2 },
    ];
    const before = structuredClone(frozen);
    const html = radiantStatusRows(radiantStatusSnapshot(frozen.state).ember, frozen);
    expect(html).toContain('Attack Up · 35%');
    expect(html).toContain('Health Over Time · 12.345%');
    expect(html).toContain('Flora · Skill');
    expect(html).not.toContain('00000000000003');
    expect(frozen).toEqual(before);
  });
  it('round expiration and defeated units use actual settled state, not parsed messages or guessed clocks', () => {
    const frozen = run(), unit = frozen.state.bearers[0];
    unit.buffs = [{ category: 'weaken', source: { kind: 'enemy', enemyId: frozen.enemies[0].id }, magnitude: .1, remaining: 1 }];
    for (const member of frozen.state.bearers) frozen.state.acted.push(member.loadout.id);
    frozen.state.phase = 'enemy'; frozen.state.enemyActed = frozen.state.enemies.map(enemy => enemy.id);
    const result = applyRadiantCombatAction(frozen.state, { type: 'finish-enemy-phase' });
    expect(radiantStatusSnapshot(result.state).ember).toEqual([]);
    unit.hp = 0;
    expect(radiantStatusSnapshot(frozen.state).ember).toEqual([]);
  });
  it('missing status sources fail explicitly and enemy names are escaped in HTML', () => {
    const frozen = run();
    frozen.enemies[0].name = '<img onerror=bad>';
    const html = radiantStatusRows([{ kind: 'weaken', magnitude: .1, remaining: 1,
      source: { kind: 'enemy', enemyId: frozen.enemies[0].id } }], frozen);
    expect(html).toContain('&lt;img onerror=bad&gt;'); expect(html).not.toContain('<img onerror');
    expect(() => radiantSourceLabel({ kind: 'enemy', enemyId: 'missing' }, frozen)).toThrow('missing');
    expect(() => radiantSourceLabel({ kind: 'master', bearerId: 'ember' }, frozen)).toThrow('Master');
  });
});
