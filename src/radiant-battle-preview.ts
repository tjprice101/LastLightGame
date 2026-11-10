import './interface.css';
import './presentation/radiant-battle.css';
import { RadiantSession } from './online/radiant-session';
import { resolveRadiantRun, type RadiantRunRequest, type RadiantRunResponse, type RadiantRunSnapshot } from './online/radiant-run';
import { RadiantBattleView } from './presentation/radiant-battle-view';
import { createRadiantReviewFixture, radiantReviewEncounters, setRadiantReviewCharge } from './presentation/radiant-review-fixtures';
import { measureRadiantCadence, type RadiantCadenceOutcome } from './presentation/radiant-preview-cadence';
import { applyMotion } from './presentation/settings';
import { applyBattleSpeed, parseBattleSpeed } from './presentation/battle-speed';
import { createGameDialog, escapeDialogText } from './presentation/game-dialog';
import { readyFlare } from './game/radiant-gauge';
import { RadiantCanvasEffects } from './vfx/radiant-battle-effects';
import { releasedRadiantIds } from './content/radiant-combat';
import { getStarter } from './content/starters';
import { bindShopHosts, shopHost, type ShopHostId } from './presentation/shop-host';

const host = document.querySelector<HTMLElement>('#radiant-preview');
if (!host) throw new Error('Radiant development preview host is missing.');
const reviewHosts: ShopHostId[] = ['mirel', 'veylin', 'torven', 'edda', 'sarev', 'nimra'];
host.innerHTML = `<header class="radiant-preview-heading"><h1>Radiant battle · development preview</h1>
  <p>In-memory combat only. No sign-in, player account changes or network saves.
  This conditional six-member squad is a test fixture, not a free or average account.
  All 192 released face crops use reviewed source-bound artwork; unreleased faces keep a neutral pending tile.
  All 32 bearers use authored identity paths, motifs and tier-specific choreography.
  This in-memory preview is not physical GPU/cadence or owner visual approval.</p>
  <label>Battle speed <select data-preview-speed><option>1</option><option>2</option><option>3</option></select></label>
  <label><input type="checkbox" data-preview-motion> Reduce motion</label>
  <label>Conditional leader VFX fixture <select data-preview-leader>${releasedRadiantIds.map(id =>
    `<option value="${id}">${escapeDialogText(getStarter(id).name)}</option>`).join('')}</select></label>
  <label>Leader form <select data-preview-form>${Array.from({ length: 6 }, (_, index) =>
    `<option value="${index + 1}"${index === 5 ? ' selected' : ''}>Form ${index + 1}</option>`).join('')}</select></label>
  <label>Encounter <select data-preview-encounter>${radiantReviewEncounters.map(encounter =>
    `<option value="${encounter.id}">${escapeDialogText(encounter.label)}</option>`).join('')}</select></label>
  <label>Conditional Master fixture <select data-preview-master><option value="none">No personal Masters</option>
    <option value="strikes">Tizu / Flora selected-enemy Masters</option></select></label>
  <button type="button" data-preview-reset>Reset preview encounter</button>
  <button type="button" data-preview-cycle>Charge cycle: normal / Glowing / Lustrous / Eternal</button>
  <p>Available Flare tiers depend on each selected form.</p>
  <p data-preview-status role="status"></p>
  <details class="radiant-preview-cadence"><summary>Measure desktop frame delivery</summary>
    <p>In a visible browser on the desktop being reviewed, choose a formation and settings, then play normally during
    the 15-second sample. Changing a preview fixture or setting stops the sample. Record the machine, browser,
    display refresh rate and graphics settings alongside the result. Browser frame timing and JavaScript heap
    are not GPU timing or GPU memory measurements.</p>
    <button type="button" data-preview-cadence-start>Measure 15 seconds</button>
    <button type="button" data-preview-cadence-stop hidden>Cancel measurement</button>
    <p data-preview-cadence-result role="status" aria-live="polite"></p>
  </details>
  <details class="radiant-preview-hosts" data-preview-host-review><summary>Review the six shop hosts</summary>
    <p>These are the existing dialogue components, not active shops. Portrait artwork is pending; no purchases are available here.</p>
    <div class="sanctuary-shell radiant-preview-host-grid">${reviewHosts.map(id => shopHost(id)).join('')}</div>
  </details></header><div data-preview-battle></div>`;
bindShopHosts(host);
const battleHost = host.querySelector<HTMLElement>('[data-preview-battle]')!;
const notice = host.querySelector<HTMLElement>('[data-preview-status]')!;
let session: RadiantSession, view: RadiantBattleView;
let cycle = 0;
let stopCadence: ((reason: string) => void) | undefined;
function build(): void {
  stopCadence?.('The preview fixture changed. Start a new sample.');
  view?.dispose(); session?.dispose();
  const selected = host!.querySelector<HTMLSelectElement>('[data-preview-leader]')!.value;
  const leader = releasedRadiantIds.find(id => id === selected);
  if (!leader) throw new Error('Preview leader is not a released Radiant Element-Bearer.');
  const form = Number(host!.querySelector<HTMLSelectElement>('[data-preview-form]')!.value);
  const encounter = host!.querySelector<HTMLSelectElement>('[data-preview-encounter]')!.value;
  const strikes = host!.querySelector<HTMLSelectElement>('[data-preview-master]')!.value === 'strikes';
  const { game, activity } = createRadiantReviewFixture(leader, form, encounter, strikes);
  const authority = { capability: 'isolated-radiant-study' as const, now: Date.UTC(2026, 10, 8),
    entry: () => ({ runId: crypto.randomUUID(), encounterSeed: 1729, chargeSeed: 7, targetSeed: 104729 }) };
  const entry = resolveRadiantRun({ revision: 0, state: game }, { requestId: crypto.randomUUID(),
    expectedRevision: 0, runId: null, encounter: null, operation: { kind: 'start', activity,
      calibration: 'radiant-pressure-v2' } }, authority);
  // Explicit preview-only charge fixtures; never a route to a player account.
  const combat = entry.state.radiantStudy!.state;
  setRadiantReviewCharge(combat.gauge, cycle);
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
  }, new RadiantCanvasEffects(battleHost), () => {
    session.dispose();
    notice.textContent = 'Saved encounter exited. Earned rewards retained in this in-memory fixture. Reset to start a new preview.';
    battleHost.innerHTML = '<p role="status">Preview encounter ended. Use Reset preview encounter to start again.</p>';
  });
  notice.textContent = cycle ? `Explicit ${readyFlare(snapshot.state.radiantStudy!.state.gauge, leader)} charge fixture selected.` :
    'Normal charge fixture selected.';
  void view.finishEntrance().catch(error => { notice.textContent = error instanceof Error ? error.message : 'Preview entrance failed.'; });
}
host.querySelector('[data-preview-speed]')!.addEventListener('change', event => {
  stopCadence?.('The preview settings changed. Start a new sample.');
  applyBattleSpeed(parseBattleSpeed((event.target as HTMLSelectElement).value));
});
host.querySelector('[data-preview-motion]')!.addEventListener('change', event => {
  stopCadence?.('The preview settings changed. Start a new sample.');
  applyMotion((event.target as HTMLInputElement).checked ? 'reduced' : 'system');
});
const cadenceStart = host.querySelector<HTMLButtonElement>('[data-preview-cadence-start]')!;
const cadenceStop = host.querySelector<HTMLButtonElement>('[data-preview-cadence-stop]')!;
const cadenceResult = host.querySelector<HTMLElement>('[data-preview-cadence-result]')!;
cadenceStart.addEventListener('click', () => {
  if (document.visibilityState !== 'visible' || !document.hasFocus()) {
    cadenceResult.textContent = 'A visible foreground tab is required. Bring this browser to the front and try again.';
    return;
  }
  const leader = host.querySelector<HTMLSelectElement>('[data-preview-leader]')!;
  const encounter = host.querySelector<HTMLSelectElement>('[data-preview-encounter]')!;
  const form = host.querySelector<HTMLSelectElement>('[data-preview-form]')!.value;
  const speed = host.querySelector<HTMLSelectElement>('[data-preview-speed]')!.value;
  const reduced = host.querySelector<HTMLInputElement>('[data-preview-motion]')!.checked;
  const settings = `${leader.selectedOptions[0].text}, form ${form}; ${encounter.selectedOptions[0].text}; ${speed}x; ${reduced ? 'Reduce motion' : 'system motion'}`;
  const report = (outcome: RadiantCadenceOutcome) => {
    stopCadence = undefined; cadenceStart.disabled = false; cadenceStop.hidden = true;
    if (outcome.kind === 'stopped') { cadenceResult.textContent = outcome.reason; return; }
    const sample = outcome.summary;
    const heap = sample.heapBefore === null || sample.heapAfter === null ? 'JavaScript heap unavailable.'
      : `JavaScript heap ${(sample.heapBefore / 1048576).toFixed(1)} to ${(sample.heapAfter / 1048576).toFixed(1)} MiB (GC-sensitive, not GPU memory).`;
    cadenceResult.textContent = `${settings}. ${(sample.durationMs / 1000).toFixed(1)} s, ${sample.intervals} frame intervals, ` +
      `${sample.framesPerSecond.toFixed(1)} fps; frame time median ${sample.medianMs.toFixed(2)} ms, ` +
      `p95 ${sample.p95Ms.toFixed(2)} ms, p99 ${sample.p99Ms.toFixed(2)} ms, maximum ${sample.maximumMs.toFixed(2)} ms; ` +
      `${sample.overTarget} intervals over 16.67 ms. ${heap} Record the device and browser separately; GPU profiling remains required.`;
  };
  cadenceStart.disabled = true; cadenceStop.hidden = false;
  cadenceResult.textContent = 'Sampling for 15 seconds. Keep this tab visible and play normally.';
  stopCadence = measureRadiantCadence(report);
});
cadenceStop.addEventListener('click', () => stopCadence?.('Cadence sample cancelled.'));
host.querySelector('[data-preview-reset]')!.addEventListener('click', build);
host.querySelector('[data-preview-master]')!.addEventListener('change', build);
host.querySelector('[data-preview-leader]')!.addEventListener('change', build);
host.querySelector('[data-preview-form]')!.addEventListener('change', build);
host.querySelector('[data-preview-encounter]')!.addEventListener('change', build);
host.querySelector('[data-preview-cycle]')!.addEventListener('click', () => { cycle = (cycle + 1) % 4; build(); });
window.addEventListener('pagehide', () => {
  stopCadence?.('Cadence sample stopped because the preview closed.');
  view.dispose(); session.dispose();
}, { once: true });
applyBattleSpeed(1); applyMotion('system'); build();
