import './interface.css';
import './presentation/radiant-battle.css';
import { freshGame } from '../supabase/functions/game-operation/engine';
import { RadiantSession } from './online/radiant-session';
import { resolveRadiantRun, type RadiantRunRequest, type RadiantRunResponse, type RadiantRunSnapshot } from './online/radiant-run';
import { RadiantBattleView } from './presentation/radiant-battle-view';
import { applyMotion } from './presentation/settings';
import { applyBattleSpeed, parseBattleSpeed } from './presentation/battle-speed';
import { createGameDialog } from './presentation/game-dialog';
import { readyFlare } from './game/radiant-gauge';

const host = document.querySelector<HTMLElement>('#radiant-preview');
if (!host) throw new Error('Radiant development preview host is missing.');
host.innerHTML = `<header class="radiant-preview-heading"><h1>Radiant battle · development preview</h1>
  <p>In-memory combat only. No sign-in, player account changes or network saves.
  This conditional six-member Lv.105 squad is a test fixture, not a free or average account.
  Starter face crops are installed; the three Rose face portraits are honestly marked pending.
  Generic impact motion is a foundation, not the final unique character VFX.</p>
  <label>Battle speed <select data-preview-speed><option>1</option><option>2</option><option>3</option></select></label>
  <label><input type="checkbox" data-preview-motion> Reduce motion</label>
  <label>Conditional Master fixture <select data-preview-master><option value="none">No personal Masters</option>
    <option value="strikes">Tizu / Flora selected-enemy Masters</option></select></label>
  <button type="button" data-preview-reset>Reset preview encounter</button>
  <button type="button" data-preview-cycle>Charge cycle: normal / Glowing / Lustrous / Eternal</button>
  <p data-preview-status role="status"></p></header><div data-preview-battle></div>`;
const battleHost = host.querySelector<HTMLElement>('[data-preview-battle]')!;
const notice = host.querySelector<HTMLElement>('[data-preview-status]')!;
let session: RadiantSession, view: RadiantBattleView;
let cycle = 0;
function build(): void {
  view?.dispose(); session?.dispose();
  const game = freshGame('in-memory-preview', '2026-11-08T00:00:00Z');
  game.starterId = 'ember'; game.account.storyCompleted = 24;
  game.account.squad = ['ember', 'tide', 'sprout', 'rosetta', 'thornia', 'crinso'];
  for (const id of ['ember', 'tide', 'sprout', 'rosetta', 'thornia', 'crinso'] as const)
    game.account.characters[id] = { level: 105, evolution: 6, weaponRank: 0 };
  if (host!.querySelector<HTMLSelectElement>('[data-preview-master]')!.value === 'strikes') {
    game.account.masterConduits = { 'master-tide-3': 1, 'master-sprout-2': 1 };
    game.account.masterEquipment = { tide: 'master-tide-3', sprout: 'master-sprout-2' };
  }
  const authority = { capability: 'isolated-radiant-study' as const, now: Date.UTC(2026, 10, 8),
    entry: () => ({ runId: crypto.randomUUID(), encounterSeed: 1729, chargeSeed: 7, targetSeed: 104729 }) };
  const entry = resolveRadiantRun({ revision: 0, state: game }, { requestId: crypto.randomUUID(),
    expectedRevision: 0, runId: null, encounter: null, operation: { kind: 'start', activity: { kind: 'story', stage: 25 },
      calibration: 'radiant-pressure-v2' } }, authority);
  // Explicit preview-only charge fixtures; never a route to a player account.
  const combat = entry.state.radiantStudy!.state;
  for (const member of combat.gauge.members) member.charge = member.baseCost * (cycle === 0 ? 0 : cycle === 1 ? 1 : 2);
  combat.gauge.sharedUnits = cycle === 3 ? 6000 : 0;
  let snapshot: RadiantRunSnapshot = { revision: entry.response.revision, state: entry.state };
  const receipts = new Map<string, RadiantRunResponse>();
  const transport = { read: async () => ({ revision: snapshot.revision,
    account: snapshot.state.account, run: snapshot.state.radiantStudy ?? null }),
    execute: async (request: RadiantRunRequest) => {
      const prior = receipts.get(request.requestId);
      if (prior) return structuredClone(prior);
      const resolved = resolveRadiantRun(snapshot, request, authority);
      snapshot = { revision: resolved.response.revision, state: resolved.state };
      receipts.set(request.requestId, structuredClone(resolved.response)); return resolved.response;
    } };
  session = new RadiantSession({ revision: snapshot.revision, account: snapshot.state.account,
    run: snapshot.state.radiantStudy! }, transport);
  view = new RadiantBattleView(battleHost, session, () => {
    const { dialog, dispose } = createGameDialog('Preview Settings');
    dialog.innerHTML = `<h2>Preview Settings</h2><p>The frozen battle and pending presentation are retained.
      Change speed or Reduce motion using the preview controls after closing.</p>
      <form method="dialog"><button autofocus>Close</button></form>`;
    dialog.addEventListener('close', () => { dispose(); session.setSettings(false); view.render(); }, { once: true });
    dialog.showModal();
  }, undefined, () => {
    session.dispose();
    notice.textContent = 'Saved encounter exited. Earned rewards retained in this in-memory fixture. Reset to start a new preview.';
    battleHost.innerHTML = '<p role="status">Preview encounter ended. Use Reset preview encounter to start again.</p>';
  });
  notice.textContent = cycle ? `Explicit ${readyFlare(snapshot.state.radiantStudy!.state.gauge, 'ember')} charge fixture selected.` :
    'Normal charge fixture selected.';
  void view.finishEntrance().catch(error => { notice.textContent = error instanceof Error ? error.message : 'Preview entrance failed.'; });
}
host.querySelector('[data-preview-speed]')!.addEventListener('change', event => {
  applyBattleSpeed(parseBattleSpeed((event.target as HTMLSelectElement).value));
});
host.querySelector('[data-preview-motion]')!.addEventListener('change', event => {
  applyMotion((event.target as HTMLInputElement).checked ? 'reduced' : 'system');
});
host.querySelector('[data-preview-reset]')!.addEventListener('click', build);
host.querySelector('[data-preview-master]')!.addEventListener('change', build);
host.querySelector('[data-preview-cycle]')!.addEventListener('click', () => { cycle = (cycle + 1) % 4; build(); });
window.addEventListener('pagehide', () => { view.dispose(); session.dispose(); }, { once: true });
applyBattleSpeed(1); applyMotion('system'); build();
