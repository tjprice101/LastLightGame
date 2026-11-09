import { characterName } from '../content/character-art';
import { getStarter } from '../content/starters';
import { radiantAttunement } from '../content/radiant-combat';
import { readyFlare, personalChargeMaximum, sharedChargeThreshold, sharedChargeUnit } from '../game/radiant-gauge';
import type { RadiantCombatState } from '../game/radiant-combat';
import { RadiantSession } from '../online/radiant-session';
import { type RadiantPlayerAction, type RadiantRunResponse, type FrozenRadiantRun } from '../online/radiant-run';
import { compactPortrait } from './compact-portrait';
import { escapeDialogText as escape, gameConfirm, createGameDialog } from './game-dialog';
import { rarityFeedback } from './rarity-feedback';
import { reducedMotion } from './settings';
import { battleSpeed } from './battle-speed';
import { radiantImpactFrames, radiantReadout, type RadiantImpactFrame, type RadiantReadout } from './radiant-impact';
import './radiant-battle.css';
import { radiantArenaArt, radiantEnemyArt, radiantAllyArt } from './radiant-battle-art';
import { radiantStatusSnapshot, radiantStatusRows, radiantShieldRows } from './radiant-status';
import { bindArtworkLoading } from './artwork-loading';
import { radiantResultsMarkup, radiantEncounterLabel } from './radiant-results';
import { radiantBattleReference, radiantLeaderReference, radiantFlareNeedsTarget } from './radiant-battle-reference';
import { bindRadiantPortraitGestures } from './radiant-portrait-gesture';
import { characterChoreography } from './battle-effects';
import { formatStat } from '../content/combat';

export interface RadiantBattleEffects {
  windup(action: RadiantPlayerAction, state: RadiantCombatState): Promise<void>;
  impact(frame: RadiantImpactFrame): Promise<void>;
  pause?(paused: boolean): void;
  cancel(): void;
  dispose?(): void;
}
const tierNames = { glowing: 'Glowing Flare', lustrous: 'Lustrous Flare', eternal: 'Eternal Radiant Flare' };
/** Saved-session battle surface. The caller owns exit routing and supplies
 * authored effects; no local authority, account funding or feature activation. */
export class RadiantBattleView {
  private displayed: RadiantReadout;
  private actor: string;
  private target: string | null;
  private disposed = false;
  private presenting = false;
  private skipped = false;
  private animations = new Set<Animation>();
  private effectsCleanup = new Set<() => void>();
  private selectionCleanup: (() => void) | null = null;
  private presentationError: string | null = null;
  private activeReceipt: RadiantRunResponse | null = null;
  private presentationGeneration = 0;
  private statuses: ReturnType<typeof radiantStatusSnapshot>;
  private artworkCleanup!: () => void;
  private statusMarkup = new Map<string, string>();
  private shieldMarkup = new Map<string, string>();
  private resultKey: string | null = null;
  private resultCelebration: (() => void) | null = null;
  private referenceCleanup: (() => void) | null = null;
  private leaderMarkup: string | null = null;
  private gestures: ReturnType<typeof bindRadiantPortraitGestures>;
  constructor(private readonly host: HTMLElement, private readonly session: RadiantSession,
    private readonly openSettings: () => void, private readonly effects?: RadiantBattleEffects,
    private readonly onExit?: () => void) {
    const run = session.view().saved.run;
    if (!run) throw new Error('A saved Radiant encounter is required.');
    this.displayed = radiantReadout(run.state);
    this.statuses = radiantStatusSnapshot(run.state);
    this.actor = run.state.bearers.find(unit => unit.hp > 0 && !run.state.acted.includes(unit.loadout.id))?.loadout.id
      ?? run.state.bearers[0].loadout.id;
    this.target = run.state.enemies.find(unit => unit.hp > 0)?.id ?? null;
    this.mount(run);
    this.gestures = bindRadiantPortraitGestures(host, {
      select: id => { this.actor = id; this.render(); },
      ready: id => {
        const member = this.displayed.gauge.members.find(member => member.id === id);
        const button = this.host.querySelector<HTMLButtonElement>(`[data-radiant-actor="${id}"]`);
        const tier = member?.living && button && !button.disabled ? readyFlare(this.displayed.gauge, id) : null;
        return tier ? tierNames[tier] : null;
      },
      cast: id => { this.actor = id; void this.act('flare').catch(error => this.report(error)); },
      notice: text => { this.element<HTMLElement>('[data-radiant-gesture-status]').textContent = text; },
    });
    host.addEventListener('click', this.click);
    window.addEventListener('last-light-motion-change', this.motion);
    window.addEventListener('last-light-battle-speed-change', this.speed);
    this.render();
  }
  private mount(run: FrozenRadiantRun): void {
    this.host.innerHTML = `<section class="radiant-battle" aria-label="Radiant battle">
      <header class="radiant-battle-heading"><div><small>${escape(run.anchor.family)}</small><h2>Radiant battle</h2>
        <span data-radiant-progress>${radiantEncounterLabel(run)}</span> · <span data-radiant-round></span></div>
        <button type="button" data-radiant-settings>Settings</button>
        ${this.onExit ? '<button type="button" data-radiant-leave>Exit · Keep rewards</button>' : ''}</header>
      <details class="radiant-team-reference"><summary>Squad rules and frozen leader</summary>
        <div data-radiant-leader-reference></div>
        <p>Normal Attack and Defense each use this member’s action for the round. No random critical damage.
        Normal direct hits grant20 personal charge; Defense grants10; living members gain5 each new round.
        Surviving a direct enemy action that hits HP or Shields grants8 personal charge once, not once per hit.
        Each eligible direct hit has a25% chance of5 bonus charge, at most two rolls per action; generated/periodic packets do not qualify.</p>
        <p>Normal Attack uses100% effective Attack against one selected living enemy.
        Direct damage is rounded once: Attack × Attack/(Attack + effective enemy Defense) × action coefficient × output modifiers, minimum1.
        Burn/periodic and generated packets follow their authored rules, not this guaranteed direct-damage formula.
        Defense halves direct enemy damage until the next round, with strongest reduction and gear enhancements; combined multiplier floor20%.
        Shields absorb in creation order before HP.</p>
        <p>Shared charge: Normal direct hits/Defense grant6 divided by frozen squad size, ordinary Flares12 divided by squad size;
        each new round adds18. Eternal cannot refill itself. Defeated members are not replaced or promoted.</p>
      </details>
      <section class="radiant-field" aria-label="Battlefield">
        <div class="radiant-arena">${radiantArenaArt(run.anchor.activity)}</div>
        <div class="radiant-allies" aria-label="Allied field formation">${run.state.bearers.map((unit, index) =>
          `<div class="radiant-field-ally" data-radiant-field-unit="${escape(unit.loadout.id)}" style="--formation:${index}">
            <div class="radiant-unit-motion" data-radiant-art="${escape(unit.loadout.id)}">
              <div class="radiant-unit-idle">${radiantAllyArt(unit.loadout)}</div>
            </div><span>${escape(getStarter(unit.loadout.starter).name)}</span>
          </div>`).join('')}</div>
      <div class="radiant-enemies" aria-label="Enemy targets">${run.enemies.map(enemy =>
        `<button type="button" class="radiant-enemy" data-radiant-target="${escape(enemy.id)}"
          data-radiant-field-unit="${escape(enemy.id)}" aria-pressed="false">
          <div class="radiant-unit-motion" data-radiant-art="${escape(enemy.id)}"><div class="radiant-unit-idle">${radiantEnemyArt(enemy)}</div></div>
          <strong>${escape(enemy.name)}</strong><span>Lv.${enemy.level}</span>
          ${this.healthMarkup(enemy.id)}</button>`).join('')}</div>
      </section>
      <section class="radiant-shared" aria-label="Shared Eternal charge"><b>Eternal Radiant Flare</b>
        <meter data-radiant-shared min="0" aria-label="Shared Eternal charge"></meter><span data-radiant-shared-text></span></section>
      <div class="radiant-squad" role="group" aria-label="Squad portrait controls; scroll horizontally on narrow screens" tabindex="0">${run.state.bearers.map((unit, index) => {
        const member = unit.loadout, starter = getStarter(member.starter);
        return `<article class="radiant-member" data-radiant-unit="${escape(member.id)}" data-element="${starter.elementId}">
          <button type="button" class="radiant-face" data-radiant-actor="${escape(member.id)}"
            aria-describedby="radiant-gesture-help" aria-label="${escape(characterName(member.starter, member.form))} · Normal Attack; hold and drag upward for ready Flare">
            ${compactPortrait(starter, member.form)}<span>${index ? `Member ${index + 1}` : 'Leader'}</span>
            <strong>${escape(characterName(member.starter, member.form))}</strong></button>
          <span class="radiant-identity">Lv.${member.level} · ${escape(radiantAttunement(member))}</span>
          <dl class="radiant-frozen-stats" aria-label="Frozen combat stats">${Object.entries(unit.stats).filter(([stat]) => stat !== 'hp').map(([stat, value]) =>
            `<div><dt>${escape(stat[0].toUpperCase() + stat.slice(1))}</dt><dd>${formatStat(value)}</dd></div>`).join('')}</dl>
          ${this.healthMarkup(member.id)}
          <div class="radiant-charge-layers" aria-label="Personal charge">${[1, ...(member.form >= 4 ? [2] : [])].map(layer =>
            `<meter data-radiant-charge="${escape(member.id)}" data-layer="${layer}" min="0" max="${run.state.gauge.members[index].baseCost}" aria-label="${layer === 1 ? 'Glowing' : 'Lustrous'} charge layer"></meter>`).join('')}</div>
          <span data-radiant-charge-text="${escape(member.id)}"></span>
          <span data-radiant-readiness="${escape(member.id)}"></span>
          <button type="button" data-radiant-select="${escape(member.id)}" aria-pressed="false">Select · Actions</button>
          <button type="button" data-radiant-reference="${escape(member.id)}" aria-haspopup="dialog">Battle reference</button>
        </article>`;
      }).join('')}</div>
      <p id="radiant-gesture-help">Tap a portrait for Normal Attack. Hold350ms, drag upward32px and release for the highest ready Flare.
        Select · Actions offers the same attacks and Defense without dragging.</p>
      <p data-radiant-gesture-status role="status" aria-live="polite"></p>
      <div class="radiant-actions"><button type="button" data-radiant-action="normal">Normal Attack</button>
        <button type="button" data-radiant-action="defense">Defense</button>
        <button type="button" data-radiant-action="flare">Glowing Flare</button>
        <button type="button" data-radiant-retry hidden>Retry pending request</button>
        <button type="button" data-radiant-skip hidden>Skip presentation</button>
        <button type="button" data-radiant-results-show hidden>View saved results</button></div>
      <div data-radiant-results hidden></div>
      <p data-radiant-status role="status" aria-live="polite"></p>
      <p data-radiant-error role="alert"></p>
    </section>`;
    this.artworkCleanup = bindArtworkLoading(this.host);
  }
  private healthMarkup(id: string): string {
    return `<div class="radiant-health" data-radiant-health="${escape(id)}"><meter min="0" aria-label="HP"></meter>
      <span data-hp></span><span data-shield></span><ul class="radiant-shield-layers" data-radiant-layers></ul>
      <span class="radiant-status-timing" data-radiant-status-timing></span>
      <ul class="radiant-status-list" data-radiant-effects></ul></div>`;
  }
  private element<T extends Element>(selector: string): T {
    const result = this.host.querySelector<T>(selector);
    if (!result) throw new Error('Radiant battle surface is incomplete.');
    return result;
  }
  private click = (event: MouseEvent): void => {
    if (this.disposed || !(event.target instanceof Element)) return;
    const button = event.target.closest<HTMLButtonElement>('button');
    if (!button || !this.host.contains(button) || button.disabled) return;
    if (button.hasAttribute('data-radiant-settings')) { this.session.setSettings(true); this.render(); this.openSettings(); return; }
    if (button.hasAttribute('data-radiant-skip')) { this.skip(); return; }
    if (button.dataset.radiantReference) {
      try { this.openReference(button.dataset.radiantReference); } catch (error) { this.report(error); }
      return;
    }
    if (button.hasAttribute('data-radiant-leave')) { void this.confirmExit().catch(error => this.report(error)); return; }
    if (button.hasAttribute('data-radiant-result-dismiss') || button.hasAttribute('data-radiant-results-show')) {
      this.session.dismissResults(button.hasAttribute('data-radiant-result-dismiss')); this.render();
      if (button.hasAttribute('data-radiant-result-dismiss')) this.element<HTMLElement>('[data-radiant-results-show]').focus();
      else this.element<HTMLElement>('[data-radiant-result-heading]').focus();
      return;
    }
    const transition = button.dataset.radiantTransition;
    if (transition === 'continue' || transition === 'retry' || transition === 'exit') {
      void this.transition(transition).catch(error => this.report(error)); return;
    }
    if (button.dataset.radiantActor) {
      if (this.gestures.consumeClick(button)) return;
      this.actor = button.dataset.radiantActor;
      void this.act('normal').catch(error => this.report(error)); return;
    }
    if (button.dataset.radiantSelect) {
      this.actor = button.dataset.radiantSelect; this.render(); this.selection(button); return;
    }
    if (button.dataset.radiantTarget) {
      this.target = button.dataset.radiantTarget; this.render(); this.selection(button); return;
    }
    if (button.hasAttribute('data-radiant-retry')) {
      void this.retry().catch(error => this.report(error)); return;
    }
    const kind = button.dataset.radiantAction;
    if (kind === 'normal' || kind === 'defense' || kind === 'flare')
      void this.act(kind).catch(error => this.report(error));
  };
  private selection(button: HTMLElement): void {
    this.selectionCleanup?.();
    this.selectionCleanup = rarityFeedback(button, 'Common');
  }
  private report(error: unknown): void {
    if (this.disposed) return;
    this.presentationError = error instanceof Error ? error.message : 'Battle presentation failed; the saved outcome is retained.';
    this.element<HTMLElement>('[data-radiant-error]').textContent = this.presentationError;
  }
  render(): void {
    if (this.disposed) return;
    const view = this.session.view(), run = view.saved.run;
    if (!run) { this.host.setAttribute('aria-busy', 'false'); return; }
    const blocked = view.busy || !!view.pending || !!view.preparationPending || !!view.presentation ||
      !!view.preparationPresentation || view.settingsOpen || view.entrancePending || this.presenting ||
      run.quit || run.state.phase !== 'player';
    if (blocked) this.gestures?.cancel();
    this.host.setAttribute('aria-busy', String(view.busy || this.presenting || view.entrancePending));
    for (const animation of this.animations) {
      if (view.settingsOpen) animation.pause();
      else if (animation.playState === 'paused') animation.play();
    }
    this.effects?.pause?.(view.settingsOpen);
    for (const unit of Array.from(this.host.querySelectorAll<HTMLElement>('[data-radiant-health]'))) {
      const value = this.displayed.units[unit.dataset.radiantHealth!];
      const meter = unit.querySelector<HTMLMeterElement>('meter')!;
      meter.max = value.maximum; meter.value = value.hp;
      unit.querySelector<HTMLElement>('[data-hp]')!.textContent = `HP ${value.hp} / ${value.maximum}`;
      unit.querySelector<HTMLElement>('[data-shield]')!.textContent = `Shield ${value.shield}`;
      const layers = unit.querySelector<HTMLElement>('[data-radiant-layers]')!;
      const id = unit.dataset.radiantHealth!;
      const shieldMarkup = radiantShieldRows(value.hp > 0 ? value.layers : [], run);
      if (this.shieldMarkup.get(id) !== shieldMarkup) {
        layers.innerHTML = shieldMarkup; this.shieldMarkup.set(id, shieldMarkup);
      }
      const statuses = unit.querySelector<HTMLElement>('[data-radiant-effects]')!;
      const statusMarkup = radiantStatusRows(value.hp > 0 ? this.statuses[unit.dataset.radiantHealth!] : [], run);
      if (this.statusMarkup.get(id) !== statusMarkup) {
        statuses.innerHTML = statusMarkup; this.statusMarkup.set(id, statusMarkup);
      }
      unit.querySelector<HTMLElement>('[data-radiant-status-timing]')!.textContent =
        this.presenting && statusMarkup ? 'Effects at last completed action' : '';
    }
    for (const button of Array.from(this.host.querySelectorAll<HTMLButtonElement>('[data-radiant-actor]'))) {
      const id = button.dataset.radiantActor!;
      button.disabled = blocked || this.displayed.units[id].hp === 0 || run.state.acted.includes(id);
      button.closest('.radiant-member')!.classList.toggle('is-selected', id === this.actor);
      button.closest('.radiant-member')!.classList.toggle('is-defeated', this.displayed.units[id].hp === 0);
      const select = this.element<HTMLButtonElement>(`[data-radiant-select="${id}"]`);
      select.disabled = button.disabled; select.setAttribute('aria-pressed', String(id === this.actor));
      const tier = this.displayed.units[id].hp > 0 ? readyFlare(this.displayed.gauge, id) : null;
      button.dataset.readyTier = !button.disabled && tier ? tier : '';
      this.element<HTMLElement>(`[data-radiant-readiness="${id}"]`).textContent =
        this.displayed.units[id].hp === 0 ? 'Defeated' : run.state.acted.includes(id) ? 'Acted this round' :
          tier ? `${tierNames[tier]} ready` : 'Flare charging';
    }
    for (const unit of Array.from(this.host.querySelectorAll<HTMLElement>('[data-radiant-field-unit]'))) {
      const id = unit.dataset.radiantFieldUnit!;
      unit.classList.toggle('is-defeated', this.displayed.units[id].hp === 0);
      unit.classList.toggle('is-selected', id === this.actor);
    }
    for (const button of Array.from(this.host.querySelectorAll<HTMLButtonElement>('[data-radiant-target]'))) {
      const id = button.dataset.radiantTarget!;
      button.disabled = blocked || this.displayed.units[id].hp === 0;
      button.setAttribute('aria-pressed', String(id === this.target));
    }
    for (const member of this.displayed.gauge.members) {
      for (const meter of Array.from(this.host.querySelectorAll<HTMLMeterElement>('[data-radiant-charge]'))) {
        if (meter.dataset.radiantCharge === member.id)
          meter.value = Math.min(member.baseCost, Math.max(0, member.charge - (Number(meter.dataset.layer) - 1) * member.baseCost));
      }
      this.element<HTMLElement>(`[data-radiant-charge-text="${member.id}"]`).textContent =
        `${member.charge} / ${personalChargeMaximum(member)} charge`;
    }
    const shared = this.element<HTMLMeterElement>('[data-radiant-shared]');
    shared.max = sharedChargeThreshold(this.displayed.gauge.eternalCasts) / sharedChargeUnit;
    shared.value = this.displayed.gauge.sharedUnits / sharedChargeUnit;
    shared.closest<HTMLElement>('.radiant-shared')!.hidden = !this.displayed.gauge.members.some(member => member.form === 6);
    this.element<HTMLElement>('[data-radiant-shared-text]').textContent =
      `${shared.value} / ${shared.max}`;
    this.element<HTMLElement>('[data-radiant-round]').textContent = `Round ${this.displayed.round}`;
    const leader = this.element<HTMLElement>('[data-radiant-leader-reference]');
    const leaderMarkup = radiantLeaderReference(run.state, this.displayed.units[run.state.bearers[0].loadout.id].hp > 0);
    if (this.leaderMarkup !== leaderMarkup) { leader.innerHTML = leaderMarkup; this.leaderMarkup = leaderMarkup; }
    const actor = this.displayed.gauge.members.find(member => member.id === this.actor)!;
    const tier = actor.living ? readyFlare(this.displayed.gauge, this.actor) : null;
    for (const button of Array.from(this.host.querySelectorAll<HTMLButtonElement>('[data-radiant-action]')))
      button.disabled = blocked || !actor.living || run.state.acted.includes(this.actor) ||
        button.dataset.radiantAction === 'normal' && !this.target ||
        button.dataset.radiantAction === 'flare' && !tier;
    this.element<HTMLElement>('[data-radiant-action="flare"]').textContent = tier ? tierNames[tier] : 'Glowing Flare · charging';
    this.element<HTMLButtonElement>('[data-radiant-retry]').hidden = !view.pending || view.busy;
    this.element<HTMLButtonElement>('[data-radiant-skip]').hidden = !this.presenting;
    const resultBlocked = view.busy || !!view.pending || !!view.preparationPending || !!view.presentation ||
      !!view.preparationPresentation || view.settingsOpen || view.entrancePending || this.presenting;
    const terminal = run.quit || run.state.phase === 'victory' || run.state.phase === 'defeat';
    const leave = this.host.querySelector<HTMLButtonElement>('[data-radiant-leave]');
    if (leave) { leave.disabled = resultBlocked; leave.hidden = terminal; }
    const results = this.element<HTMLElement>('[data-radiant-results]');
    if (terminal && !resultBlocked) {
      const key = `${run.id}:${run.encounter}:${view.saved.revision}`;
      if (this.resultKey !== key) { results.innerHTML = radiantResultsMarkup(run, !!this.onExit); this.resultKey = key; }
    }
    results.hidden = !terminal || resultBlocked || view.resultsDismissed;
    this.element<HTMLButtonElement>('[data-radiant-results-show]').hidden = !terminal || resultBlocked || !view.resultsDismissed;
    for (const button of Array.from(results.querySelectorAll<HTMLButtonElement>('button'))) button.disabled = resultBlocked;
    this.element<HTMLElement>('[data-radiant-error]').textContent = view.error?.message ?? this.presentationError ?? '';
    this.element<HTMLElement>('[data-radiant-status]').textContent = view.busy ? 'Awaiting saved outcome…' :
      this.presenting ? 'Presenting saved impacts…' : run.state.phase === 'victory' ? 'Victory · rewards saved.' :
      run.state.phase === 'defeat' ? 'Defeat · earned rewards retained.' : 'Choose a squad member and action.';
  }
  async finishEntrance(): Promise<void> {
    this.skipped = false;
    await this.animate(this.element('.radiant-squad'), [{ opacity: .3, transform: 'translateY(16px)' }, { opacity: 1, transform: 'translateY(0)' }], 500);
    if (!this.disposed) { this.session.finishEntrance(); this.render(); }
  }
  private openReference(id: string): void {
    const run = this.session.view().saved.run;
    if (!run) throw new Error('A frozen encounter is required for its reference.');
    const unit = run.state.bearers.find(member => member.loadout.id === id);
    const gauge = this.displayed.gauge.members.find(member => member.id === id);
    if (!unit || !gauge) throw new Error('Frozen battle reference member is missing.');
    const title = characterName(unit.loadout.starter, unit.loadout.form);
    const { dialog, dispose } = createGameDialog(`${title} · Battle reference`);
    dialog.classList.add('radiant-reference-dialog');
    dialog.innerHTML = `<h2>${escape(title)}</h2><p>Four frozen stats (before dynamic leader/status modifiers)</p>
      <dl>${Object.entries(unit.stats).map(([name, value]) =>
        `<div><dt>${name === 'hp' ? 'HP' : escape(name[0].toUpperCase() + name.slice(1))}</dt><dd>${value}</dd></div>`).join('')}</dl>
      ${radiantBattleReference(unit.loadout, gauge.baseCost)}
      <form method="dialog"><button autofocus>Close reference</button></form>`;
    this.session.setSettings(true); this.render();
    const artwork = bindArtworkLoading(dialog);
    let closed = false;
    const cleanup = () => {
      if (closed) return;
      closed = true;
      dialog.removeEventListener('close', cleanup);
      this.referenceCleanup = null; artwork(); dispose();
      if (!this.disposed) { this.session.setSettings(false); this.render(); }
    };
    this.referenceCleanup = cleanup;
    dialog.addEventListener('close', cleanup, { once: true });
    dialog.addEventListener('submit', event => { event.preventDefault(); cleanup(); });
    dialog.addEventListener('cancel', event => { event.preventDefault(); cleanup(); });
    dialog.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); cleanup(); }
    });
    try { dialog.showModal(); }
    catch (error) { cleanup(); throw error; }
  }
  async act(kind: 'normal' | 'defense' | 'flare'): Promise<void> {
    this.presentationError = null;
    this.element<HTMLElement>('[data-radiant-gesture-status]').textContent = '';
    const before = this.session.view().saved.run;
    if (!before) throw new Error('A saved encounter is required.');
    const member = before.state.bearers.find(unit => unit.loadout.id === this.actor)!;
    const tier = member.hp > 0 ? readyFlare(before.state.gauge, this.actor) : null;
    const action: RadiantPlayerAction = kind === 'defense' ? { type: kind, bearerId: this.actor } :
      kind === 'normal' ? { type: kind, bearerId: this.actor, targetId: this.target ?? '' } :
      { type: kind, bearerId: this.actor, ...(tier && radiantFlareNeedsTarget(member.loadout, tier)
        ? { targetId: this.target ?? '' } : {}) };
    const pending = this.session.perform({ kind: 'action', action }); this.render();
    try { const response = await pending; await this.present(before.state, response, action); }
    finally { this.render(); }
  }
  async retry(): Promise<void> {
    this.presentationError = null;
    const before = this.session.view().saved.run, request = this.session.view().pending;
    if (!before || !request) throw new Error('An unresolved battle request is required.');
    const pending = this.session.retryPending(); this.render();
    try {
      const response = await pending;
      if (request.operation.kind === 'action') await this.present(before.state, response, request.operation.action);
      else if (request.operation.kind === 'continue' || request.operation.kind === 'retry' || request.operation.kind === 'exit')
        await this.finishTransition(request.operation.kind, response);
      else throw new Error('Unsupported pending battle transition.');
    }
    finally { this.render(); }
  }
  async transition(kind: 'continue' | 'retry' | 'exit'): Promise<void> {
    if (kind === 'exit' && !this.onExit) throw new Error('Saved battle exit routing is unavailable.');
    const view = this.session.view(), run = view.saved.run;
    if (!run || this.presenting || view.settingsOpen || view.entrancePending ||
      kind !== 'exit' && !(run.quit || run.state.phase === 'victory' || run.state.phase === 'defeat'))
      throw new Error('Finish the saved battle presentation before leaving this encounter.');
    this.presentationError = null;
    const pending = this.session.perform({ kind }); this.render();
    try { await this.finishTransition(kind, await pending); }
    finally { this.render(); }
  }
  private async confirmExit(): Promise<void> {
    this.session.setSettings(true); this.render();
    let confirmed: boolean;
    try {
      confirmed = await gameConfirm('Leave this frozen encounter? Earned rewards are retained. The current run will end.',
        { title: 'Exit battle', confirmLabel: 'Exit · Keep rewards' });
    } finally { if (!this.disposed) { this.session.setSettings(false); this.render(); } }
    if (confirmed && !this.disposed) await this.transition('exit');
  }
  private async finishTransition(kind: 'continue' | 'retry' | 'exit', response: RadiantRunResponse): Promise<void> {
    if (this.disposed) return;
    const receipt = this.session.view().presentation;
    if (!receipt) throw new Error('Saved transition receipt is missing.');
    this.session.finishPresentation(receipt.requestId);
    if (kind === 'exit') {
      this.dispose();
      try { this.onExit!(); }
      catch (error) {
        console.error('Saved Radiant exit routing failed.', error);
        const notice = this.host.ownerDocument.createElement('p'); notice.setAttribute('role', 'alert');
        notice.textContent = 'Encounter exited and rewards retained, but the destination could not open.';
        this.host.append(notice);
        throw error;
      }
      return;
    }
    this.gestures.cancel(); this.cancelEffects(); this.artworkCleanup(); this.resultCelebration?.(); this.resultCelebration = null;
    this.displayed = radiantReadout(response.run.state); this.statuses = radiantStatusSnapshot(response.run.state);
    this.statusMarkup.clear(); this.shieldMarkup.clear(); this.resultKey = null; this.leaderMarkup = null;
    this.actor = response.run.state.bearers.find(unit => unit.hp > 0)?.loadout.id ?? response.run.state.bearers[0].loadout.id;
    this.target = response.run.state.enemies.find(unit => unit.hp > 0)?.id ?? null;
    this.mount(response.run); this.render();
    await this.finishEntrance();
    if (!this.disposed) this.element<HTMLElement>(`[data-radiant-actor="${this.actor}"]`).focus();
  }
  private async present(before: RadiantCombatState, response: RadiantRunResponse, action: RadiantPlayerAction): Promise<void> {
    if (this.disposed) return;
    const generation = ++this.presentationGeneration;
    this.presenting = true; this.skipped = false; this.activeReceipt = response; this.render();
    try {
      const frames = radiantImpactFrames(before, response.run.state, response.events);
      if (!reducedMotion()) {
        const member = before.bearers.find(unit => unit.loadout.id === action.bearerId)!;
        const motion = action.type === 'defense' ? 'guard' : characterChoreography[member.loadout.starter].motion;
        const poised = motion === 'cast' ? 'translateY(-4px)' : motion === 'bow' ? 'translateX(5px)' :
          motion === 'hammer' ? 'translate(-5px, -4px) rotate(3deg)' : motion === 'guard' ? 'translateX(-3px)' :
            motion === 'twin' ? 'translateX(-8px) rotate(-2deg)' : 'translateX(-12px)';
        await Promise.all([
          this.animate(this.element(`[data-radiant-art="${action.bearerId}"]`),
            [{ transform: 'none' }, { transform: poised }, { transform: 'none' }], 180),
          this.effects ? this.effects.windup(action, structuredClone(before)) :
            this.animate(this.element(`[data-radiant-art="${action.bearerId}"]`),
              [{ filter: 'brightness(1)' }, { filter: 'brightness(1.8)' }, { filter: 'brightness(1)' }], 260),
        ]);
      }
      for (const frame of frames) {
        if (this.disposed || this.skipped || generation !== this.presentationGeneration) break;
        this.displayed = structuredClone(frame.readout); this.render();
        if (!reducedMotion()) {
          await Promise.all([this.fieldImpact(frame), this.effects ? this.effects.impact(structuredClone(frame)) : this.impact(frame)]);
        }
      }
      if (!this.disposed && generation === this.presentationGeneration) this.settle(response);
    } catch (error) {
      if (this.disposed || generation !== this.presentationGeneration) return;
      this.report(error);
      throw error;
    }
  }
  private settle(response: RadiantRunResponse): void {
    this.displayed = radiantReadout(response.run.state);
    this.statuses = radiantStatusSnapshot(response.run.state);
    this.presenting = false; this.activeReceipt = null;
    this.presentationError = null;
    const receipt = this.session.view().presentation;
    if (receipt) this.session.finishPresentation(receipt.requestId);
    this.actor = response.run.state.bearers.find(unit => unit.hp > 0 &&
      !response.run.state.acted.includes(unit.loadout.id))?.loadout.id ?? this.actor;
    this.target = response.run.state.enemies.find(unit => unit.hp > 0)?.id ?? null;
    this.render();
    const results = this.element<HTMLElement>('[data-radiant-results]');
    if (!results.hidden) {
      const heading = this.element<HTMLElement>('[data-radiant-result-heading]');
      heading.focus();
      if (response.run.state.phase === 'victory') {
        this.resultCelebration?.(); this.resultCelebration = rarityFeedback(heading, 'Omnic');
      }
    }
  }
  skip(): void {
    this.skipped = true; this.presentationGeneration++; this.cancelEffects();
    if (this.activeReceipt) this.settle(this.activeReceipt);
  }
  private motion = (): void => { if (reducedMotion()) this.skip(); };
  private speed = (): void => { for (const animation of this.animations) animation.playbackRate = battleSpeed(); };
  private cancelEffects(): void {
    this.effects?.cancel();
    this.selectionCleanup?.(); this.selectionCleanup = null;
    for (const animation of this.animations) animation.cancel();
    for (const cleanup of this.effectsCleanup) cleanup();
    this.effectsCleanup.clear();
  }
  private async animate(target: Element, frames: Keyframe[], duration: number): Promise<void> {
    if (this.disposed || this.skipped || reducedMotion() || !target.animate) return;
    const animation = target.animate(frames, { duration, easing: 'ease-out', fill: 'forwards' });
    animation.playbackRate = battleSpeed(); this.animations.add(animation);
    if (this.session.view().settingsOpen) animation.pause();
    try { await animation.finished; }
    catch (error) { if (!(error instanceof DOMException && error.name === 'AbortError')) throw error; }
    finally { this.animations.delete(animation); animation.cancel(); }
  }
  private async impact(frame: RadiantImpactFrame): Promise<void> {
    const targets = new Set(frame.events.filter(event => event.type === 'damage' || event.type === 'heal' || event.type === 'shield')
      .map(event => event.targetId));
    await Promise.all([...targets].map(async id => {
      const target = this.element<HTMLElement>(`[data-radiant-health="${id}"]`);
      const ring = document.createElement('span'); ring.className = 'radiant-impact-ring'; ring.setAttribute('aria-hidden', 'true');
      target.append(ring);
      const cleanup = () => ring.remove(); this.effectsCleanup.add(cleanup);
      try { await this.animate(ring, [{ opacity: .85, transform: 'scale(.3)' }, { opacity: 0, transform: 'scale(1.8)' }], 430); }
      finally { cleanup(); this.effectsCleanup.delete(cleanup); }
    }));
  }
  private async fieldImpact(frame: RadiantImpactFrame): Promise<void> {
    const hits = new Map<string, { enemy: boolean; defeated: boolean }>();
    const run = this.session.view().saved.run!;
    for (const event of frame.events) {
      if (event.type !== 'damage' || event.healthLoss + event.absorbed <= 0) continue;
      hits.set(event.targetId, { enemy: run.state.enemies.some(unit => unit.id === event.targetId),
        defeated: frame.readout.units[event.targetId].hp === 0 });
    }
    await Promise.all([...hits].map(([id, hit]) => this.animate(this.element(`[data-radiant-art="${id}"]`),
      [{ transform: 'translateX(0)', opacity: 1 },
        { transform: `translateX(${hit.enemy ? -8 : 8}px)`, opacity: .75 },
        { transform: 'translateX(0)', opacity: hit.defeated ? .2 : 1 }], 220)));
  }
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true; this.cancelEffects();
    this.effects?.dispose?.();
    this.gestures.dispose();
    this.referenceCleanup?.(); this.referenceCleanup = null;
    this.resultCelebration?.(); this.resultCelebration = null;
    this.artworkCleanup();
    this.host.removeEventListener('click', this.click);
    window.removeEventListener('last-light-motion-change', this.motion);
    window.removeEventListener('last-light-battle-speed-change', this.speed);
    this.host.replaceChildren();
  }
}
