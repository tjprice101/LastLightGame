import { getStarter } from '../content/starters';
import { releasedRadiantIds, radiantBearerKits, type RadiantBearerId } from '../content/radiant-combat';
import { liveRadiantCalibrationId } from '../content/radiant-enemy-calibration';
import { radiantPressureAnchors, assertRadiantPressureAccess, isRadiantAccessError,
  type RadiantPressureAnchor } from '../game/radiant-pressure-encounters';
import { capturedProgress } from '../game/character-instances';
import { ownedCompanion } from './owned-companion';
import { RadiantRunError, type RadiantCheckpoint } from '../online/radiant-run';
import { RadiantSession } from '../online/radiant-session';
import { readRadiantStudy } from '../online/radiant-transport';
import { onlineClient } from '../online/account-client';
import { RadiantBattleView } from './radiant-battle-view';
import { RadiantCanvasEffects } from '../vfx/radiant-battle-effects';
import { gameConfirm, escapeDialogText as escape } from './game-dialog';
import './radiant-client.css';

const anchors = [...new Map(radiantPressureAnchors()
  .filter(anchor => anchor.position !== 'species' && (anchor.trainingWave === undefined || anchor.trainingWave === 1))
  .map(anchor => [JSON.stringify([anchor.activity, anchor.trainingWave]), anchor] as const)).values()];
type RadiantTab = 'entry' | 'prepare' | 'holdings';
export interface RadiantClientDependencies {
  authorize(): Promise<void>;
  read(): Promise<RadiantCheckpoint>;
  createSession(checkpoint: RadiantCheckpoint): RadiantSession;
}

const authenticatedDependencies: RadiantClientDependencies = {
  async authorize() {
    const { data, error } = await onlineClient().auth.getUser();
    if (error || !data.user) throw new Error('Sign in to load Radiant encounters.');
  },
  read: readRadiantStudy,
  createSession: checkpoint => new RadiantSession(checkpoint),
};

function activityName(anchor: RadiantPressureAnchor): string {
  const activity = anchor.activity;
  const position = anchor.trainingWave ? `Wave ${anchor.trainingWave}` : anchor.position;
  switch (activity.kind) {
    case 'training': return `Training · ${position}`;
    case 'story': return `Story · Stage ${activity.stage} · ${position}`;
    case 'dungeon': return `${activity.element} dungeon · Stage ${activity.stage} · ${position}`;
    case 'infusion': return `${activity.mode} · Stage ${activity.stage} · ${position}`;
    case 'war': return `${activity.character} War · Stage ${activity.stage} · ${position}`;
    case 'calamity': return `${activity.activity} Calamity · Tier ${activity.tier}`;
    case 'oblivion': return `Gates of Oblivion · Floor ${activity.stage} · ${position}`;
  }
}

function availableAnchors(account: RadiantCheckpoint['account'], now: number): RadiantPressureAnchor[] {
  return anchors.filter(anchor => {
    try { assertRadiantPressureAccess(anchor, account, now); return true; }
    catch (error) {
      if (isRadiantAccessError(error)) return false;
      throw error;
    }
  });
}

function errorCopy(error: unknown): string {
  return error instanceof Error ? error.message : 'Radiant service did not acknowledge the request.';
}

function operationError(error: unknown): string {
  if (error instanceof RadiantRunError) return error.message;
  return errorCopy(error);
}

export class RadiantClient {
  private session: RadiantSession | null = null;
  private battle: RadiantBattleView | null = null;
  private tab: RadiantTab = 'entry';
  private error = '';
  private initialized = false;
  private disposed = false;
  private readonly initialization: Promise<void>;

  constructor(private readonly host: HTMLElement, private readonly openSettings: () => void,
    private readonly now: () => number,
    private readonly navigate: (area: 'bearers' | 'creatures') => void,
    private readonly dependencies: RadiantClientDependencies = authenticatedDependencies) {
    host.addEventListener('click', this.click);
    host.addEventListener('submit', this.submit);
    this.initialization = this.initialize();
  }

  ready(): Promise<void> { return this.initialization; }

  private async initialize(): Promise<void> {
    this.host.innerHTML = '<p role="status">Loading authenticated Radiant checkpoint…</p>';
    try {
      await this.dependencies.authorize();
      const checkpoint = await this.dependencies.read();
      if (this.disposed) return;
      this.session = this.dependencies.createSession(checkpoint);
      this.initialized = true;
      this.render();
    } catch (error) {
      if (this.disposed) return;
      this.error = operationError(error);
      this.host.innerHTML = `<section class="radiant-client-message"><h2>Radiant is unavailable</h2>
        <p role="alert">${escape(this.error)}</p><button type="button" data-radiant-refresh>Retry checkpoint</button></section>`;
    }
  }

  private click = (event: Event): void => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest<HTMLButtonElement>('[data-radiant-tab], [data-radiant-start], [data-radiant-retry], [data-radiant-refresh], [data-radiant-nav]');
    if (!button || button.disabled) return;
    if (button.dataset.radiantNav) {
      if (button.dataset.radiantNav !== 'bearers' && button.dataset.radiantNav !== 'creatures')
        throw new Error('Unknown Radiant destination.');
      this.navigate(button.dataset.radiantNav);
      return;
    }
    if (button.dataset.radiantTab) {
      const tab = button.dataset.radiantTab;
      if (tab !== 'entry' && tab !== 'prepare' && tab !== 'holdings') throw new Error('Unknown Radiant view.');
      this.tab = tab;
      this.render();
      return;
    }
    if (button.hasAttribute('data-radiant-refresh')) { void this.refresh(); return; }
    if (button.hasAttribute('data-radiant-retry')) { void this.retry(); return; }
    if (button.hasAttribute('data-radiant-start')) { void this.start(); }
  };

  private submit = (event: Event): void => {
    if (!(event.target instanceof HTMLFormElement)) return;
    const form = event.target;
    if (!form.matches('[data-radiant-squad-form]')) return;
    event.preventDefault();
    void this.saveSquad(form);
  };

  private async start(): Promise<void> {
    const session = this.requireSession();
    const form = this.host.querySelector<HTMLSelectElement>('[data-radiant-anchor]');
    const anchor = anchors.find(item => item.id === form?.value);
    if (!anchor || !availableAnchors(session.view().saved.account, this.now()).some(item => item.id === anchor.id)) {
      this.error = 'Choose an unlocked activity and refresh its eligibility.';
      this.render();
      return;
    }
    this.error = '';
    try {
      const pending = session.perform({ kind: 'start', activity: anchor.activity, calibration: liveRadiantCalibrationId });
      this.render();
      await pending;
      this.openSavedRun();
    } catch (error) {
      this.error = operationError(error);
      this.render();
    }
  }

  private async saveSquad(form: HTMLFormElement): Promise<void> {
    const slots = Array.from(form.querySelectorAll<HTMLSelectElement>('[data-radiant-squad-slot]'))
      .map(select => select.value);
    const firstEmpty = slots.indexOf('');
    const ids = firstEmpty < 0 ? slots : slots.slice(0, firstEmpty);
    if (!ids.length || firstEmpty > 0 && slots.slice(firstEmpty + 1).some(Boolean) ||
      new Set(ids).size !== ids.length) {
      this.error = 'Choose a leader, then up to five distinct members in order with no gaps.';
      this.render();
      return;
    }
    this.error = '';
    try {
      const session = this.requireSession();
      const pending = session.prepare({ kind: 'setSquad', ids });
      this.render();
      await pending;
      const receipt = this.requireSession().view().preparationPresentation;
      if (receipt) this.requireSession().finishPreparation(receipt.requestId);
      this.render();
    } catch (error) {
      this.error = operationError(error);
      this.render();
    }
  }

  private async retry(): Promise<void> {
    const session = this.requireSession();
    this.error = '';
    try {
      const view = session.view();
      if (view.pending) {
        const pending = session.retryPending();
        this.render();
        await pending;
        const receipt = session.view().presentation;
        if (receipt) {
          session.finishPresentation(receipt.requestId);
          if (receipt.response.run && receipt.response.run.encounter === 1) {
            this.openSavedRun();
            return;
          }
        }
      } else if (view.preparationPending) {
        const pending = session.retryPreparation();
        this.render();
        await pending;
        const receipt = session.view().preparationPresentation;
        if (receipt) session.finishPreparation(receipt.requestId);
      } else {
        throw new Error('There is no unresolved Radiant request to retry.');
      }
      this.render();
    } catch (error) {
      this.error = operationError(error);
      this.render();
    }
  }

  private async refresh(): Promise<void> {
    if (!this.session) { this.error = ''; void this.initialize(); return; }
    this.error = '';
    try {
      const pending = this.session.refresh();
      this.render();
      await pending;
      this.render();
    } catch (error) {
      this.error = operationError(error);
      this.render();
    }
  }

  private openSavedRun(): void {
    const session = this.requireSession();
    const receipt = session.view().presentation;
    if (receipt) session.finishPresentation(receipt.requestId);
    this.battle?.dispose();
    this.battle = new RadiantBattleView(this.host, session, this.openSettings,
      new RadiantCanvasEffects(this.host), () => {
        this.battle = null;
        this.tab = 'entry';
        this.render();
      });
    void this.battle.finishEntrance().catch(error => {
      this.error = operationError(error);
      this.render();
    });
  }

  private render(): void {
    const session = this.requireSession();
    const checkpoint = session.view().saved;
    if (checkpoint.run) {
      this.battle?.dispose();
      this.battle = new RadiantBattleView(this.host, session, this.openSettings,
        new RadiantCanvasEffects(this.host), () => {
          this.battle = null;
          this.tab = 'entry';
          this.render();
        });
      void this.battle.finishEntrance().catch(error => {
        this.error = operationError(error);
        this.render();
      });
      return;
    }
    this.battle?.dispose();
    this.battle = null;
    const state = session.view();
    const candidates = availableAnchors(checkpoint.account, this.now());
    const bearerIds = releasedRadiantIds.filter(id => !!checkpoint.account.characters[id]);
    const squad = checkpoint.account.squad ?? [];
    const squadReady = squad.length > 0 && squad.length <= 6 && new Set(squad).size === squad.length &&
      squad.every(id => releasedRadiantIds.includes(id as RadiantBearerId) && !!checkpoint.account.characters[id as RadiantBearerId]);
    const activeTab = this.tab;
    const captured = checkpoint.account.capturedCharacters ?? [];
    this.host.innerHTML = `<section class="radiant-client">
      <header class="radiant-client-heading"><div><p>Saved online combat · separate from legacy battles</p>
        <h2>Radiant Encounters</h2><span>Rewards and progress are committed by the authenticated authority.</span></div>
        <button type="button" data-radiant-refresh>Refresh saved checkpoint</button></header>
      <nav class="radiant-client-tabs" aria-label="Radiant options">
        <button type="button" data-radiant-tab="entry" aria-pressed="${activeTab === 'entry'}">Enter</button>
        <button type="button" data-radiant-tab="prepare" aria-pressed="${activeTab === 'prepare'}">Prepare squad</button>
        <button type="button" data-radiant-tab="holdings" aria-pressed="${activeTab === 'holdings'}">Captured holdings · ${captured.length}</button>
      </nav>
      ${activeTab === 'entry' ? `<section class="radiant-client-panel"><h3>Choose an unlocked encounter</h3>
        <p>Only encounters currently available to this account are listed. Entry uses the saved, manually selected squad and frozen loadout.</p>
        ${candidates.length ? `<label>Activity <select data-radiant-anchor>${candidates.map((anchor, index) =>
          `<option value="${escape(anchor.id)}" ${index === 0 ? 'selected' : ''}>${escape(activityName(anchor))}</option>`).join('')}</select></label>` :
          '<p role="status">No Radiant encounter is currently unlocked for this account.</p>'}
        <button type="button" class="primary-button" data-radiant-start ${!candidates.length || !squadReady || state.busy ? 'disabled' : ''}>Enter with saved squad</button>
        ${squadReady ? '' : '<p role="status">Prepare a released Element-Bearer squad before entering.</p>'}
        ${state.pending || state.preparationPending ? '<button type="button" data-radiant-retry>Retry the same saved request</button>' : ''}
      </section>` : activeTab === 'prepare' ? `<section class="radiant-client-panel"><h3>Prepare acquired Element-Bearers</h3>
        <p>Select one to six distinct released Element-Bearers in leader-first order. Captured Elemental-Devourers remain holdings and fodder; they cannot enter this squad.</p>
        <form data-radiant-squad-form>${Array.from({ length: 6 }, (_, index) => {
          const current = checkpoint.account.squad?.[index] ?? '';
          const selected = bearerIds.includes(current as RadiantBearerId) ? current : '';
          return `<label>${index === 0 ? 'Leader' : `Member ${index + 1}`}<select data-radiant-squad-slot aria-label="${index === 0 ? 'Leader' : `Member ${index + 1}`}">
            <option value="">${index === 0 ? 'Choose a leader' : 'Empty slot'}</option>
            ${bearerIds.map(id => `<option value="${id}" ${selected === id ? 'selected' : ''}>${escape(getStarter(id).name)}</option>`).join('')}
          </select></label>`;
        }).join('')}
        <button type="submit" class="primary-button" ${state.busy || state.saved.run ? 'disabled' : ''}>Save squad securely</button>
        <button type="button" data-radiant-nav="bearers">Open Team equipment &amp; Master setup</button></form>
        <p>Changes apply to future Radiant entries; an active encounter always keeps its frozen squad and equipment.</p>
      </section>` : `<section class="radiant-client-panel"><h3>Captured Elemental-Devourer holdings</h3>
        <p>Copies remain saved, independently locked and available for their existing uses. Radiant entry never grants, sells or equips captured copies.</p>
        ${captured.length ? `<ul class="radiant-holdings">${captured.map(copy => {
          const member = ownedCompanion(checkpoint.account, copy.instanceId);
          const progress = capturedProgress(copy);
          return `<li><span class="radiant-holding-art">${member.art}</span><span><b>${escape(member.name)}</b>
            <small>Copy ${escape(copy.instanceId)} · Lv.${progress.level} · ${progress.tier + 1}-star · ${copy.locked ? 'Locked' : 'Unlocked'}</small></span></li>`;
        }).join('')}</ul>` : '<p>No captured holdings yet.</p>'}
        <button type="button" data-radiant-nav="creatures">Open captured holdings in Team</button>
      </section>`}
      <p class="radiant-client-status" role="status"></p>
      <p class="radiant-client-error" data-radiant-error role="alert">${escape(this.error || state.error?.message || '')}</p>
    </section>`;
  }

  private requireSession(): RadiantSession {
    if (!this.initialized || !this.session) throw new Error('Authenticated Radiant checkpoint is not loaded.');
    return this.session;
  }

  async beforeLeave(): Promise<boolean> {
    if (!this.session) return true;
    const view = this.session.view();
    if (view.pending || view.preparationPending || view.busy || view.presentation || view.preparationPresentation) {
      this.error = 'Resolve the exact pending request before leaving; do not discard an unconfirmed save.';
      const error = this.host.querySelector<HTMLElement>('[data-radiant-error], .radiant-client-error');
      if (error) error.textContent = this.error;
      return false;
    }
    if (!view.saved.run) return true;
    if (view.entrancePending || view.settingsOpen) {
      this.error = 'Finish the pending saved action and its presentation, then use Exit.';
      const error = this.host.querySelector<HTMLElement>('[data-radiant-error]');
      if (error) error.textContent = this.error;
      return false;
    }
    if (!await gameConfirm('Leave this saved Radiant encounter? Earned rewards are retained.',
      { title: 'Exit Radiant battle', confirmLabel: 'Exit · Keep rewards' })) return false;
    try {
      await this.session.perform({ kind: 'exit' });
      const receipt = this.session.view().presentation;
      if (!receipt) throw new Error('The saved Radiant exit receipt is missing.');
      this.session.finishPresentation(receipt.requestId);
      this.battle?.dispose();
      this.battle = null;
      return true;
    } catch (error) {
      this.error = operationError(error);
      const errorNode = this.host.querySelector<HTMLElement>('[data-radiant-error]');
      if (errorNode) errorNode.textContent = this.error;
      return false;
    }
  }

  settingsClosed(): void {
    if (!this.session) return;
    this.session.setSettings(false);
    this.battle?.render();
  }

  settingsOpened(): void {
    if (!this.session?.view().saved.run) return;
    this.session.setSettings(true);
    this.battle?.render();
  }

  dispose(): void {
    this.disposed = true;
    this.host.removeEventListener('click', this.click);
    this.host.removeEventListener('submit', this.submit);
    this.battle?.dispose();
    this.session?.dispose();
    this.battle = null;
    this.session = null;
  }
}
