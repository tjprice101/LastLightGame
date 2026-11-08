import { characterName } from '../content/character-art';
import { getStarter } from '../content/starters';
import { radiantFlares, radiantStarterKits, radiantAttunement } from '../content/radiant-combat';
import { readyFlare, personalChargeMaximum, sharedChargeThreshold, sharedChargeUnit } from '../game/radiant-gauge';
import type { RadiantCombatState } from '../game/radiant-combat';
import { RadiantSession } from '../online/radiant-session';
import { type RadiantPlayerAction, type RadiantRunResponse } from '../online/radiant-run';
import { compactPortrait } from './compact-portrait';
import { escapeDialogText as escape } from './game-dialog';
import { rarityFeedback } from './rarity-feedback';
import { reducedMotion } from './settings';
import { battleSpeed } from './battle-speed';
import { radiantImpactFrames, radiantReadout, type RadiantImpactFrame, type RadiantReadout } from './radiant-impact';
import './radiant-battle.css';
import { radiantArenaArt, radiantEnemyArt } from './radiant-battle-art';
import { radiantStatusSnapshot, radiantStatusRows, radiantShieldRows } from './radiant-status';
import { bindArtworkLoading } from './artwork-loading';

export interface RadiantBattleEffects {
  windup(action: RadiantPlayerAction, state: RadiantCombatState): Promise<void>;
  impact(frame: RadiantImpactFrame): Promise<void>;
  pause?(paused: boolean): void;
  cancel(): void;
}
const tierNames = { glowing: 'Glowing Flare', lustrous: 'Lustrous Flare', eternal: 'Eternal Radiant Flare' };
/** Saved-session battle surface. The caller owns routing/results and supplies
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
  private artworkCleanup: () => void;
  private statusMarkup = new Map<string, string>();
  private shieldMarkup = new Map<string, string>();
  constructor(private readonly host: HTMLElement, private readonly session: RadiantSession,
    private readonly openSettings: () => void, private readonly effects?: RadiantBattleEffects) {
    const run = session.view().saved.run;
    if (!run) throw new Error('A saved Radiant encounter is required.');
    this.displayed = radiantReadout(run.state);
    this.statuses = radiantStatusSnapshot(run.state);
    this.actor = run.state.bearers.find(unit => unit.hp > 0 && !run.state.acted.includes(unit.loadout.id))?.loadout.id
      ?? run.state.bearers[0].loadout.id;
    this.target = run.state.enemies.find(unit => unit.hp > 0)?.id ?? null;
    host.innerHTML = `<section class="radiant-battle" aria-label="Radiant battle">
      <div class="radiant-arena">${radiantArenaArt(run.anchor.activity)}</div>
      <header class="radiant-battle-heading"><div><small>${escape(run.anchor.family)}</small><h2>Radiant battle</h2>
        <span data-radiant-round></span></div><button type="button" data-radiant-settings>Settings</button></header>
      <div class="radiant-enemies" aria-label="Enemy targets">${run.enemies.map(enemy =>
        `<button type="button" class="radiant-enemy" data-radiant-target="${escape(enemy.id)}" aria-pressed="false">
          ${radiantEnemyArt(enemy)}<strong>${escape(enemy.name)}</strong><span>Lv.${enemy.level}</span>
          ${this.healthMarkup(enemy.id)}</button>`).join('')}</div>
      <section class="radiant-shared" aria-label="Shared Eternal charge"><b>Eternal Radiant Flare</b>
        <meter data-radiant-shared min="0" aria-label="Shared Eternal charge"></meter><span data-radiant-shared-text></span></section>
      <div class="radiant-squad" aria-label="Equipped squad">${run.state.bearers.map((unit, index) => {
        const member = unit.loadout, starter = getStarter(member.starter);
        return `<article class="radiant-member" data-radiant-unit="${escape(member.id)}" data-element="${starter.elementId}">
          <button type="button" class="radiant-face" data-radiant-actor="${escape(member.id)}" aria-pressed="false">
            ${compactPortrait(starter, member.form)}<span>${index ? `Member ${index + 1}` : 'Leader'}</span>
            <strong>${escape(characterName(member.starter, member.form))}</strong></button>
          <span class="radiant-identity">Lv.${member.level} · ${escape(radiantAttunement(member))}</span>
          ${this.healthMarkup(member.id)}
          <div class="radiant-charge-layers" aria-label="Personal charge">${[1, ...(member.form >= 4 ? [2] : [])].map(layer =>
            `<meter data-radiant-charge="${escape(member.id)}" data-layer="${layer}" min="0" max="${run.state.gauge.members[index].baseCost}" aria-label="${layer === 1 ? 'Glowing' : 'Lustrous'} charge layer"></meter>`).join('')}</div>
          <span data-radiant-charge-text="${escape(member.id)}"></span>
          <details><summary>Battle reference</summary><dl>${Object.entries(unit.stats).map(([name, value]) =>
            `<div><dt>${name === 'hp' ? 'HP' : escape(name[0].toUpperCase() + name.slice(1))}</dt><dd>${value}</dd></div>`).join('')}</dl>
            <p>${escape(radiantStarterKits[member.starter].passive.description)}</p>
            ${Object.values(radiantFlares[member.starter]).map(offer => `<p><b>${escape(offer.name)}</b> · ${escape(offer.target)}</p>`).join('')}</details>
        </article>`;
      }).join('')}</div>
      <div class="radiant-actions"><button type="button" data-radiant-action="normal">Normal Attack</button>
        <button type="button" data-radiant-action="defense">Defense</button>
        <button type="button" data-radiant-action="flare">Glowing Flare</button>
        <button type="button" data-radiant-retry hidden>Retry pending request</button>
        <button type="button" data-radiant-skip hidden>Skip presentation</button></div>
      <p data-radiant-status role="status" aria-live="polite"></p>
      <p data-radiant-error role="alert"></p>
    </section>`;
    host.addEventListener('click', this.click);
    this.artworkCleanup = bindArtworkLoading(host);
    window.addEventListener('last-light-motion-change', this.motion);
    window.addEventListener('last-light-battle-speed-change', this.speed);
    this.render();
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
    if (button.dataset.radiantActor) {
      this.actor = button.dataset.radiantActor; this.render(); this.selection(button); return;
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
      button.setAttribute('aria-pressed', String(id === this.actor));
      button.closest('.radiant-member')!.classList.toggle('is-selected', id === this.actor);
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
    const actor = this.displayed.gauge.members.find(member => member.id === this.actor)!;
    const tier = actor.living ? readyFlare(this.displayed.gauge, this.actor) : null;
    for (const button of Array.from(this.host.querySelectorAll<HTMLButtonElement>('[data-radiant-action]')))
      button.disabled = blocked || !actor.living || run.state.acted.includes(this.actor) ||
        button.dataset.radiantAction === 'normal' && !this.target ||
        button.dataset.radiantAction === 'flare' && !tier;
    this.element<HTMLElement>('[data-radiant-action="flare"]').textContent = tier ? tierNames[tier] : 'Glowing Flare · charging';
    this.element<HTMLButtonElement>('[data-radiant-retry]').hidden = !view.pending || view.busy;
    this.element<HTMLButtonElement>('[data-radiant-skip]').hidden = !this.presenting;
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
  async act(kind: 'normal' | 'defense' | 'flare'): Promise<void> {
    this.presentationError = null;
    const before = this.session.view().saved.run;
    if (!before) throw new Error('A saved encounter is required.');
    const member = before.state.bearers.find(unit => unit.loadout.id === this.actor)!;
    const tier = member.hp > 0 ? readyFlare(before.state.gauge, this.actor) : null;
    const action: RadiantPlayerAction = kind === 'defense' ? { type: kind, bearerId: this.actor } :
      kind === 'normal' ? { type: kind, bearerId: this.actor, targetId: this.target ?? '' } :
      { type: kind, bearerId: this.actor, ...(tier && radiantFlares[member.loadout.starter][tier].target === 'one-enemy'
        ? { targetId: this.target ?? '' } : {}) };
    const pending = this.session.perform({ kind: 'action', action }); this.render();
    try { const response = await pending; await this.present(before.state, response, action); }
    finally { this.render(); }
  }
  async retry(): Promise<void> {
    this.presentationError = null;
    const before = this.session.view().saved.run, request = this.session.view().pending;
    if (!before || request?.operation.kind !== 'action') throw new Error('Only an unresolved battle action can be retried here.');
    const pending = this.session.retryPending(); this.render();
    try { await this.present(before.state, await pending, request.operation.action); }
    finally { this.render(); }
  }
  private async present(before: RadiantCombatState, response: RadiantRunResponse, action: RadiantPlayerAction): Promise<void> {
    if (this.disposed) return;
    const generation = ++this.presentationGeneration;
    this.presenting = true; this.skipped = false; this.activeReceipt = response; this.render();
    try {
      const frames = radiantImpactFrames(before, response.run.state, response.events);
      if (!reducedMotion()) {
        if (this.effects) await this.effects.windup(action, structuredClone(before));
        else await this.animate(this.element(`[data-radiant-actor="${action.bearerId}"]`),
          [{ filter: 'brightness(1)' }, { filter: 'brightness(1.8)' }, { filter: 'brightness(1)' }], 260);
      }
      for (const frame of frames) {
        if (this.disposed || this.skipped || generation !== this.presentationGeneration) break;
        this.displayed = structuredClone(frame.readout); this.render();
        if (!reducedMotion()) {
          if (this.effects) await this.effects.impact(structuredClone(frame));
          else await this.impact(frame);
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
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true; this.cancelEffects();
    this.artworkCleanup();
    this.host.removeEventListener('click', this.click);
    window.removeEventListener('last-light-motion-change', this.motion);
    window.removeEventListener('last-light-battle-speed-change', this.speed);
    this.host.replaceChildren();
  }
}
