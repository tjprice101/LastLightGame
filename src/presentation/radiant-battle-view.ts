import { characterName } from '../content/character-art';
import { getStarter } from '../content/starters';
import { radiantAttunement } from '../content/radiant-combat';
import { grantRadiantDrop, personalChargeMaximum, personalChargeUnit, radiantChargeRules,
  readyFlare, sharedChargeThreshold, sharedChargeUnit } from '../game/radiant-gauge';
import type { RadiantCombatState } from '../game/radiant-combat';
import { RadiantSession } from '../online/radiant-session';
import { type RadiantPlayerAction, type RadiantRunResponse, type FrozenRadiantRun } from '../online/radiant-run';
import { compactPortrait } from './compact-portrait';
import { escapeDialogText as escape, gameConfirm } from './game-dialog';
import { rarityFeedback } from './rarity-feedback';
import { reducedMotion } from './settings';
import { battleSpeed } from './battle-speed';
import { radiantImpactFrames, radiantReadout, type RadiantImpactFrame, type RadiantReadout } from './radiant-impact';
import './radiant-battle.css';
import { radiantArenaArt, radiantEnemyArt, radiantAllyArt } from './radiant-battle-art';
import { radiantStatusSnapshot, radiantStatusRows, radiantShieldRows } from './radiant-status';
import { bindArtworkLoading } from './artwork-loading';
import { radiantResultsMarkup, radiantEncounterLabel } from './radiant-results';
import { radiantLeaderReference, radiantFlareNeedsTarget } from './radiant-battle-reference';
import { bindRadiantPortraitGestures, radiantGestureActor } from './radiant-portrait-gesture';
import { characterChoreography } from './battle-effects';
import { formatStat } from '../content/combat';
import { lootArt, lootItems } from './battle-loot';
import { radiantFormation, radiantFormationStyle } from './radiant-formation';

const titleCase = (value: string) => value.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
export function radiantActivityTitle(activity: FrozenRadiantRun['anchor']['activity']): { eyebrow: string; title: string } {
  switch (activity.kind) {
    case 'training': return { eyebrow: 'Squad Training', title: 'Training' };
    case 'story': return { eyebrow: 'Story Campaign', title: 'Story' };
    case 'dungeon': return { eyebrow: 'Elemental Dungeon', title: `${titleCase(activity.element)} Dungeon` };
    case 'infusion': return { eyebrow: activity.mode === 'roses' ? 'Event' : 'Trial', title: titleCase(activity.mode) };
    case 'war': return { eyebrow: 'Elemental War', title: titleCase(activity.character) };
    case 'oblivion': return { eyebrow: 'Calamity', title: 'Gates of Oblivion' };
    case 'calamity': return { eyebrow: 'Calamity', title: titleCase(activity.activity) };
  }
}

export interface RadiantBattleEffects {
  windup(action: RadiantPlayerAction, state: RadiantCombatState): Promise<void>;
  impact(frame: RadiantImpactFrame): Promise<void>;
  pause?(paused: boolean): void;
  cancel(): void;
  dispose?(): void;
}
interface QueuedRadiantPresentation {
  before: RadiantCombatState;
  response: RadiantRunResponse;
  action: RadiantPlayerAction;
  focusedTarget: string | null;
  resolve(): void;
  reject(error: unknown): void;
}

/** Compact card name: the evolution title truncates first so the bearer's own name always stays visible. */
function radiantCardName(full: string): string {
  const split = full.lastIndexOf(', ');
  const title = split > 0 ? `<span class="radiant-name-title">${escape(full.slice(0, split + 1))}</span> ` : '';
  return `<strong title="${escape(full)}">${title}<span class="radiant-name-own">${escape(split > 0 ? full.slice(split + 2) : full)}</span></strong>`;
}

function affectedEnemyTarget(response: RadiantRunResponse, target: string | null): string | null {
  return target && response.events.some(event => 'targetId' in event && event.targetId === target) ? target : null;
}
const tierNames = { glowing: 'Glowing Flare', lustrous: 'Lustrous Flare', eternal: 'Eternal Radiant Flare' };
function centre(element: Element, random?: () => number): { x: number; y: number } {
  const box = element.getBoundingClientRect();
  const jitter = (size: number) => random ? (random() - .5) * size * .35 : 0;
  return { x: box.left + box.width / 2 + jitter(box.width), y: box.top + box.height / 2 + jitter(box.height) };
}
/** Deterministic presentation scatter keyed by the saved revision; never gameplay RNG. */
function presentationRandom(key: string): () => number {
  let seed = 2166136261;
  for (let index = 0; index < key.length; index++) seed = Math.imul(seed ^ key.charCodeAt(index), 16777619);
  return () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
/** Saved-session battle surface. The caller owns exit routing and supplies
 * authored effects; no local authority, account funding or feature activation. */
export class RadiantBattleView {
  private displayed: RadiantReadout;
  private target: string | null;
  private disposed = false;
  private presenting = false;
  private skipped = false;
  private animations = new Set<Animation>();
  private effectsCleanup = new Set<() => void>();
  private selectionCleanup: (() => void) | null = null;
  private presentationError: string | null = null;
  private activeReceipt: RadiantRunResponse | null = null;
  private impactTarget: string | null = null;
  private presentationGeneration = 0;
  private presentationQueue: QueuedRadiantPresentation[] = [];
  private presentationRunning = false;
  private cancelActivePresentation: (() => void) | null = null;
  private statuses: ReturnType<typeof radiantStatusSnapshot>;
  private artworkCleanup!: () => void;
  private statusMarkup = new Map<string, string>();
  private shieldMarkup = new Map<string, string>();
  private resultKey: string | null = null;
  private resultCelebration: (() => void) | null = null;
  private leaderMarkup: string | null = null;
  private gestures: ReturnType<typeof bindRadiantPortraitGestures>;
  constructor(private readonly host: HTMLElement, private readonly session: RadiantSession,
    private readonly openSettings: () => void, private readonly effects?: RadiantBattleEffects,
    private readonly onExit?: () => void) {
    const run = session.view().saved.run;
    if (!run) throw new Error('A saved Radiant encounter is required.');
    this.displayed = radiantReadout(run.state);
    this.statuses = radiantStatusSnapshot(run.state);
    this.target = run.state.enemies.find(unit => unit.hp > 0)?.id ?? null;
    this.mount(run);
    this.gestures = bindRadiantPortraitGestures(host, {
      ready: id => {
        const gauge = this.session.view().saved.run?.state.gauge;
        const member = gauge?.members.find(member => member.id === id);
        const button = this.host.querySelector<HTMLButtonElement>(`[data-radiant-actor="${id}"]`);
        const tier = member?.living && button && !button.disabled && gauge ? readyFlare(gauge, id) : null;
        return tier ? tierNames[tier] : null;
      },
      cast: id => { void this.act('flare', id).catch(error => this.report(error)); },
      notice: text => { this.element<HTMLElement>('[data-radiant-gesture-status]').textContent = text; },
    });
    host.addEventListener('click', this.click);
    host.addEventListener('contextmenu', this.contextMenu);
    host.addEventListener('keydown', this.keyDown);
    window.addEventListener('last-light-motion-change', this.motion);
    window.addEventListener('last-light-battle-speed-change', this.speed);
    this.render();
  }
  private mount(run: FrozenRadiantRun): void {
    const allies = radiantFormation(run.state.bearers.length);
    const enemies = radiantFormation(run.enemies.length);
    const heading = radiantActivityTitle(run.anchor.activity);
    this.host.innerHTML = `<section class="radiant-battle" aria-label="${escape(heading.title)} battle">
      <div class="radiant-battle-layout">
      <section class="radiant-field" aria-label="Battlefield">
        <div class="radiant-arena">${radiantArenaArt(run.anchor.activity)}</div>
        <div class="radiant-hud">
          <div class="radiant-hud-title"><h2><small class="radiant-eyebrow">${escape(heading.eyebrow)}</small> ${escape(heading.title)}</h2>
            <span class="radiant-hud-progress"><span data-radiant-progress>${radiantEncounterLabel(run)}</span> · <span data-radiant-round></span></span></div>
          <div class="radiant-hud-tools"><button type="button" data-radiant-settings aria-label="Settings"><span aria-hidden="true">⚙</span></button>
          ${this.onExit ? '<button type="button" data-radiant-leave aria-label="Exit battle, keeping saved rewards">Exit</button>' : ''}</div>
        </div>
        <div class="radiant-allies" aria-label="Allied field formation">${run.state.bearers.map((unit, index) =>
          `<div class="radiant-field-ally" data-radiant-field-unit="${escape(unit.loadout.id)}"
            style="${radiantFormationStyle(allies[index], index, true)}">
            <div class="radiant-unit-motion" data-radiant-art="${escape(unit.loadout.id)}">
              <div class="radiant-unit-idle">${radiantAllyArt(unit.loadout)}</div>
            </div><span>${escape(getStarter(unit.loadout.starter).name)}</span>
          </div>`).join('')}</div>
      <div class="radiant-enemies" aria-label="Enemy targets">${run.enemies.map((enemy, index) =>
        `<button type="button" class="radiant-enemy" data-radiant-target="${escape(enemy.id)}"
          data-radiant-field-unit="${escape(enemy.id)}" aria-pressed="false"
          aria-label="Target ${escape(enemy.name)}, level ${enemy.level}"
          style="${radiantFormationStyle(enemies[index], index, false)}">
          <div class="radiant-unit-motion" data-radiant-art="${escape(enemy.id)}"><div class="radiant-unit-idle">${radiantEnemyArt(enemy)}</div></div>
        </button>`).join('')}</div>
      </section>
      <div class="radiant-enemy-banner">
        <div class="radiant-target-strip" role="region" aria-label="Selected enemy">
          ${run.enemies.map(enemy => `<div class="radiant-target-detail" data-radiant-target-detail="${escape(enemy.id)}" tabindex="0" hidden>
            <div class="radiant-target-name"><small class="radiant-target-state" data-radiant-target-state></small><strong>${escape(enemy.name)}</strong><span>Lv.${enemy.level}</span></div>
            ${this.healthMarkup(enemy.id)}</div>`).join('')}
          <p data-radiant-no-target hidden>No enemy target remains.</p>
        </div>
      <section class="radiant-shared" aria-label="Shared Eternal charge"><b>Eternal Radiant Flare</b>
        <meter class="radiant-visually-hidden" data-radiant-shared min="0" aria-label="Shared Eternal charge"></meter>
        <span class="radiant-charge-layers radiant-shared-energy" data-radiant-shared-energy aria-hidden="true">
          <span class="radiant-energy-track"><span class="radiant-energy-liquid"></span></span>
        </span><span data-radiant-shared-text></span></section>
      </div>
      <div class="radiant-squad" role="group" aria-label="Squad portrait controls" tabindex="0"
        style="--squad-size:${run.state.bearers.length};--squad-columns:${Math.min(3, run.state.bearers.length)};--squad-phone-columns:${Math.min(2, run.state.bearers.length)}">${run.state.bearers.map((unit, index) => {
        const member = unit.loadout, starter = getStarter(member.starter);
        return `<article class="radiant-member" data-radiant-card data-radiant-unit="${escape(member.id)}" data-element="${starter.elementId}">
          <span class="radiant-card-burst" aria-hidden="true"></span>
          <span class="radiant-card-hint" aria-hidden="true"></span>
          <button type="button" class="radiant-face" data-radiant-actor="${escape(member.id)}"
            aria-describedby="radiant-gesture-help" aria-label="${escape(characterName(member.starter, member.form))} · Normal Attack; right click to defend; hold the card and drag upward for ready Flare">
            ${compactPortrait(starter, member.form)}<span>${index ? `Member ${index + 1}` : 'Leader'}</span></button>
          <div class="radiant-member-head">${radiantCardName(characterName(member.starter, member.form))}
            <span class="radiant-identity">Lv.${member.level} · ${escape(radiantAttunement(member).replace(/^./, letter => letter.toUpperCase()))}</span></div>
          ${this.healthMarkup(member.id)}
          <div class="radiant-member-charge">
          <div class="radiant-charge-layers" data-radiant-energy="${escape(member.id)}" aria-label="Personal charge">
            ${[1, ...(member.form >= 4 ? [2] : [])].map(layer =>
              `<meter class="radiant-visually-hidden" data-radiant-charge="${escape(member.id)}" data-layer="${layer}" min="0" max="${run.state.gauge.members[index].baseCost}" aria-label="${layer === 1 ? 'Glowing' : 'Lustrous'} charge layer"></meter>`).join('')}
            <span class="radiant-energy-track" aria-hidden="true">${[1, ...(member.form >= 4 ? [2] : [])].map(layer =>
              `<span class="radiant-energy-liquid" data-energy-layer="${layer}"></span>`).join('')}</span>
          </div>
          <span data-radiant-charge-text="${escape(member.id)}"></span>
          </div>
          <div class="radiant-member-foot"><span data-radiant-readiness="${escape(member.id)}"></span>
          <dl class="radiant-frozen-stats" aria-label="Combat stats">${Object.entries(unit.stats).filter(([stat]) => stat !== 'hp').map(([stat, value]) =>
            `<div><dt><span aria-hidden="true">${escape(stat.slice(0, 3).toUpperCase())}</span><span class="radiant-visually-hidden">${escape(stat[0].toUpperCase() + stat.slice(1))}</span></dt><dd>${formatStat(value)}</dd></div>`).join('')}</dl></div>
        </article>`;
      }).join('')}</div>
      <div class="radiant-battle-footer">
      <p id="radiant-gesture-help">Left click a card to attack · Right click to defend · Hold, then swipe up for its highest ready Flare.
        <span class="radiant-visually-hidden">Hold for350ms and drag upward32px. Keyboard: Enter attacks, D or the context-menu key defends, F or Up Arrow releases the highest ready Flare.</span></p>
      <p data-radiant-gesture-status role="status" aria-live="polite"></p>
      <div class="radiant-actions"><button type="button" data-radiant-retry hidden>Retry pending request</button>
        <button type="button" data-radiant-skip hidden>Skip presentation</button>
        <button type="button" data-radiant-results-show hidden>View saved results</button></div>
      <p data-radiant-status role="status" aria-live="polite"></p>
      <p data-radiant-error role="alert"></p>
      <details class="radiant-team-reference"><summary>Battle rules and leader</summary>
        <div data-radiant-leader-reference></div>
        <p>Normal Attack and Defense each use this member’s action for the round. No random critical damage.
        A Normal direct hit on HP or Shields drops ${radiantChargeRules.normal} Gauge; a Flare direct hit drops ${radiantChargeRules.flareHit}.
        An enemy defeated by squad damage drops ${radiantChargeRules.defeatedEnemy} more.
        Each drop grants its full value to its living attacker and ${radiantChargeRules.otherMemberPercent}% to each other living member.
        Fractions carry over; personal caps apply. A defeated source cannot gain charge, but other living members still share its defeat drop.</p>
        <p>Defense grants ${radiantChargeRules.defense} personal charge; living members gain ${radiantChargeRules.round} each new round.
        Surviving a direct enemy action that hits HP or Shields grants ${radiantChargeRules.incomingAttack} personal charge once, not once per hit.
        Each Normal/Flare direct hit has a ${radiantChargeRules.bonusChance * 100}% chance to add ${radiantChargeRules.bonusAmount} to its drop,
        at most ${radiantChargeRules.maximumBonusRolls} rolls per action.
        Generated/periodic hits do not drop Gauge unless they defeat an enemy.</p>
        <p>Normal Attack uses100% effective Attack against one selected living enemy.
        Direct damage is rounded once: Attack ÁEAttack/(Attack + effective enemy Defense) ÁEaction coefficient ÁEoutput modifiers, minimum1.
        Burn/periodic and generated packets follow their authored rules, not this guaranteed direct-damage formula.
        Defense halves direct enemy damage until the next round, with strongest reduction and gear enhancements; combined multiplier floor20%.
        Shields absorb in creation order before HP.</p>
        <p>Shared charge: Normal direct hits/Defense grant6 divided by squad size, ordinary Flares12 divided by squad size;
        each new round adds18. Eternal cannot refill itself. Defeated members are not replaced or promoted.</p>
      </details>
      </div></div>
      <div data-radiant-results hidden></div>
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
    const button = event.target.closest<HTMLButtonElement>('button') ?? radiantGestureActor(event.target, this.host);
    if (!button || !this.host.contains(button) || button.disabled) return;
    if (button.hasAttribute('data-radiant-settings')) { this.session.setSettings(true); this.render(); this.openSettings(); return; }
    if (button.hasAttribute('data-radiant-skip')) { this.skip(); return; }
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
      void this.act('normal', button.dataset.radiantActor).catch(error => this.report(error)); return;
    }
    if (button.dataset.radiantTarget) {
      this.target = button.dataset.radiantTarget; this.render(); this.selection(button); return;
    }
    if (button.hasAttribute('data-radiant-retry')) {
      void this.retry().catch(error => this.report(error)); return;
    }
  };
  /** Right click (or the context-menu key) on an actionable card saves that member's Defense. */
  private contextMenu = (event: MouseEvent): void => {
    if (this.disposed || !(event.target instanceof Element)) return;
    const actor = radiantGestureActor(event.target, this.host);
    if (!actor) return;
    event.preventDefault();
    this.gestures?.cancel();
    if (actor.disabled || !actor.dataset.radiantActor) return;
    void this.act('defense', actor.dataset.radiantActor).catch(error => this.report(error));
  };
  private keyDown = (event: KeyboardEvent): void => {
    if (this.disposed || event.altKey || event.ctrlKey || event.metaKey || !(event.target instanceof HTMLElement)) return;
    const results = this.element<HTMLElement>('[data-radiant-results]');
    if (!results.hidden) {
      if (event.key === 'Escape') {
        event.preventDefault(); event.stopPropagation();
        this.element<HTMLButtonElement>('[data-radiant-result-dismiss]').click();
      } else if (event.key === 'Tab') {
        const controls = Array.from(results.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && (document.activeElement === first || !controls.some(control => control === document.activeElement))) {
          event.preventDefault(); last?.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !results.contains(document.activeElement))) {
          event.preventDefault(); first?.focus();
        }
      }
      return;
    }
    const id = event.target.dataset.radiantActor;
    if (!id || event.target.hasAttribute('disabled')) return;
    const key = event.key.toLowerCase();
    const kind = key === 'd' ? 'defense' : key === 'f' || event.key === 'ArrowUp' ? 'flare' : null;
    if (!kind) return;
    event.preventDefault();
    void this.act(kind, id).catch(error => this.report(error));
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
    this.syncTarget(run);
    const blocked = view.busy || !!view.pending || !!view.preparationPending || !!view.presentation ||
      !!view.preparationPresentation || view.settingsOpen || view.entrancePending ||
      run.quit || run.state.phase !== 'player';
    if (blocked) this.gestures?.cancel();
    this.host.setAttribute('aria-busy', String(view.busy || view.entrancePending));
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
      unit.querySelector<HTMLElement>('[data-shield]')!.hidden = value.shield === 0;
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
        this.presenting && statusMarkup ? 'Saved effects · replaying impacts' : '';
    }
    for (const button of Array.from(this.host.querySelectorAll<HTMLButtonElement>('[data-radiant-actor]'))) {
      const id = button.dataset.radiantActor!;
      const savedMember = run.state.bearers.find(member => member.loadout.id === id);
      button.disabled = blocked || !savedMember || savedMember.hp === 0 || run.state.acted.includes(id);
      button.closest('.radiant-member')!.classList.toggle('is-defeated', !savedMember || savedMember.hp === 0);
      button.closest('.radiant-member')!.classList.toggle('has-acted', run.state.acted.includes(id));
      const tier = savedMember && savedMember.hp > 0 ? readyFlare(run.state.gauge, id) : null;
      button.dataset.readyTier = !button.disabled && tier ? tier : '';
      button.closest<HTMLElement>('.radiant-member')!.dataset.readyTier = button.dataset.readyTier;
      this.element<HTMLElement>(`[data-radiant-readiness="${id}"]`).textContent =
        !savedMember || savedMember.hp === 0 ? 'Defeated' : run.state.acted.includes(id) ? 'Acted this round' :
          tier ? `${tierNames[tier]} ready` : 'Flare charging';
    }
    for (const unit of Array.from(this.host.querySelectorAll<HTMLElement>('[data-radiant-field-unit]'))) {
      const id = unit.dataset.radiantFieldUnit!;
      unit.classList.toggle('is-defeated', this.displayed.units[id].hp === 0);
    }
    for (const button of Array.from(this.host.querySelectorAll<HTMLButtonElement>('[data-radiant-target]'))) {
      const id = button.dataset.radiantTarget!;
      button.disabled = blocked || !run.state.enemies.some(enemy => enemy.id === id && enemy.hp > 0);
      button.setAttribute('aria-pressed', String(id === this.target));
    }
    const impactTarget = this.presenting && this.impactTarget !== this.target ? this.impactTarget : null;
    for (const detail of Array.from(this.host.querySelectorAll<HTMLElement>('[data-radiant-target-detail]'))) {
      const id = detail.dataset.radiantTargetDetail;
      detail.hidden = id !== this.target && id !== impactTarget;
      detail.querySelector<HTMLElement>('[data-radiant-target-state]')!.textContent =
        id === impactTarget ? 'Resolving impact' : impactTarget && id === this.target ? 'Selected target' : '';
    }
    this.element<HTMLElement>('[data-radiant-no-target]').hidden = this.target !== null || impactTarget !== null;
    for (const member of this.displayed.gauge.members) {
      const energy = this.element<HTMLElement>(`[data-radiant-energy="${member.id}"]`);
      energy.classList.toggle('is-flowing', member.charge > 0 && this.displayed.units[member.id].hp > 0);
      energy.classList.toggle('is-lustrous', member.charge > member.baseCost);
      for (const meter of Array.from(energy.querySelectorAll<HTMLMeterElement>('[data-radiant-charge]'))) {
        meter.value = Math.min(member.baseCost, Math.max(0, member.charge - (Number(meter.dataset.layer) - 1) * member.baseCost));
        const liquid = energy.querySelector<HTMLElement>(`[data-energy-layer="${meter.dataset.layer}"]`)!;
        liquid.style.width = `${meter.value / member.baseCost * 100}%`;
        liquid.classList.toggle('has-charge', meter.value > 0);
      }
      this.element<HTMLElement>(`[data-radiant-charge-text="${member.id}"]`).textContent =
        `${member.charge} / ${personalChargeMaximum(member)} charge`;
    }
    const shared = this.element<HTMLMeterElement>('[data-radiant-shared]');
    shared.max = sharedChargeThreshold(this.displayed.gauge.eternalCasts) / sharedChargeUnit;
    shared.value = this.displayed.gauge.sharedUnits / sharedChargeUnit;
    shared.closest<HTMLElement>('.radiant-shared')!.hidden = !this.displayed.gauge.members.some(member => member.form === 6);
    const sharedEnergy = this.element<HTMLElement>('[data-radiant-shared-energy]');
    const sharedLiquid = sharedEnergy.querySelector<HTMLElement>('.radiant-energy-liquid')!;
    sharedLiquid.style.width = `${shared.value / shared.max * 100}%`;
    sharedLiquid.classList.toggle('has-charge', shared.value > 0);
    sharedEnergy.classList.toggle('is-flowing', shared.value > 0 &&
      this.displayed.gauge.members.some(member => this.displayed.units[member.id].hp > 0));
    this.element<HTMLElement>('[data-radiant-shared-text]').textContent =
      `${shared.value} / ${shared.max}`;
    this.element<HTMLElement>('[data-radiant-round]').textContent = `Round ${this.displayed.round}`;
    const leader = this.element<HTMLElement>('[data-radiant-leader-reference]');
    const leaderMarkup = radiantLeaderReference(run.state, this.displayed.units[run.state.bearers[0].loadout.id].hp > 0);
    if (this.leaderMarkup !== leaderMarkup) { leader.innerHTML = leaderMarkup; this.leaderMarkup = leaderMarkup; }
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
    const wasHidden = results.hidden;
    results.hidden = !terminal || resultBlocked || view.resultsDismissed;
    this.element<HTMLElement>('.radiant-battle-layout').inert = !results.hidden;
    if (wasHidden && !results.hidden) this.element<HTMLElement>('[data-radiant-result-heading]').focus({ preventScroll: true });
    this.element<HTMLButtonElement>('[data-radiant-results-show]').hidden = !terminal || resultBlocked || !view.resultsDismissed;
    for (const button of Array.from(results.querySelectorAll<HTMLButtonElement>('button'))) button.disabled = resultBlocked;
    this.element<HTMLElement>('[data-radiant-error]').textContent = view.error?.message ?? this.presentationError ?? '';
    this.element<HTMLElement>('[data-radiant-status]').textContent = view.busy ? 'Awaiting saved outcome…' :
      this.presenting ? 'Impacts playing · other members can act.' : run.state.phase === 'victory' ? 'Victory · rewards saved.' :
      run.state.phase === 'defeat' ? 'Defeat · earned rewards retained.' : '';
  }
  async finishEntrance(): Promise<void> {
    this.skipped = false;
    await this.animate(this.element('.radiant-squad'), [{ opacity: .3, transform: 'translateY(16px)' }, { opacity: 1, transform: 'translateY(0)' }], 500);
    if (!this.disposed) { this.session.finishEntrance(); this.render(); }
  }
  private syncTarget(run: FrozenRadiantRun): void {
    if (!this.target || !run.state.enemies.some(enemy => enemy.id === this.target && enemy.hp > 0))
      this.target = run.state.enemies.find(enemy => enemy.hp > 0)?.id ?? null;
  }
  async act(kind: 'normal' | 'defense' | 'flare', bearerId?: string): Promise<void> {
    this.presentationError = null;
    this.element<HTMLElement>('[data-radiant-gesture-status]').textContent = '';
    const before = this.session.view().saved.run;
    if (!before) throw new Error('A saved encounter is required.');
    // Programmatic callers may omit the member; every card action passes its own.
    const actor = bearerId ?? (before.state.bearers.find(unit => unit.hp > 0 && !before.state.acted.includes(unit.loadout.id))
      ?? before.state.bearers[0]).loadout.id;
    const member = before.state.bearers.find(unit => unit.loadout.id === actor)!;
    const tier = member.hp > 0 ? readyFlare(before.state.gauge, actor) : null;
    const focusedTarget = kind === 'defense' ? null : this.target;
    const action: RadiantPlayerAction = kind === 'defense' ? { type: kind, bearerId: actor } :
      kind === 'normal' ? { type: kind, bearerId: actor, targetId: focusedTarget ?? '' } :
      { type: kind, bearerId: actor, ...(tier && radiantFlareNeedsTarget(member.loadout, tier)
        ? { targetId: focusedTarget ?? '' } : {}) };
    const pending = this.session.perform({ kind: 'action', action }); this.render();
    try {
      const response = await pending;
      if (kind !== 'defense') this.cardFeedback(action.bearerId, kind === 'flare' ? 'flare' : 'strike');
      await this.queuePresentation(before.state, response, action, affectedEnemyTarget(response, focusedTarget));
    }
    finally { this.render(); }
  }
  async retry(): Promise<void> {
    this.presentationError = null;
    const before = this.session.view().saved.run, request = this.session.view().pending;
    if (!before || !request) throw new Error('An unresolved battle request is required.');
    const pending = this.session.retryPending(); this.render();
    try {
      const response = await pending;
      if (request.operation.kind === 'action') {
        const action = request.operation.action;
        const focusedTarget = action.type === 'defense' ? null : 'targetId' in action ? action.targetId ?? this.target : this.target;
        await this.queuePresentation(before.state, response, action, affectedEnemyTarget(response, focusedTarget));
      }
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
  private queuePresentation(before: RadiantCombatState, response: RadiantRunResponse,
    action: RadiantPlayerAction, focusedTarget: string | null): Promise<void> {
    const receipt = this.session.view().presentation;
    if (!receipt || receipt.response.revision !== response.revision)
      throw new Error('Saved action presentation receipt is missing.');
    this.session.finishPresentation(receipt.requestId);
    this.skipped = false;
    this.presenting = true;
    const promise = new Promise<void>((resolve, reject) => {
      this.presentationQueue.push({ before: structuredClone(before), response: structuredClone(response),
        action: structuredClone(action), focusedTarget, resolve, reject });
    });
    this.render();
    void this.drainPresentations();
    return promise;
  }
  private async drainPresentations(): Promise<void> {
    if (this.presentationRunning || this.disposed) return;
    this.presentationRunning = true;
    try {
      while (!this.disposed && this.presentationQueue.length) {
        const queued = this.presentationQueue.shift()!;
        let cancel!: () => void;
        const cancelled = new Promise<void>(resolve => { cancel = resolve; });
        this.cancelActivePresentation = cancel;
        try {
          await Promise.race([this.present(queued.before, queued.response, queued.action, queued.focusedTarget), cancelled]);
          queued.resolve();
        } catch (error) {
          this.settle(queued.response);
          this.report(error);
          queued.reject(error);
        } finally {
          if (this.cancelActivePresentation === cancel) this.cancelActivePresentation = null;
        }
      }
    } finally {
      this.presentationRunning = false;
      this.cancelActivePresentation = null;
      if (!this.disposed) {
        this.presenting = this.presentationQueue.length > 0;
        if (!this.presenting) this.activeReceipt = null;
        this.render();
      }
    }
  }
  private async confirmExit(): Promise<void> {
    this.session.setSettings(true); this.render();
    let confirmed: boolean;
    try {
      confirmed = await gameConfirm('Leave this encounter? Earned rewards are retained. The current run will end.',
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
    this.target = response.run.state.enemies.find(unit => unit.hp > 0)?.id ?? null;
    this.impactTarget = null;
    this.mount(response.run); this.render();
    await this.finishEntrance();
    const first = response.run.state.bearers.find(unit => unit.hp > 0)?.loadout.id ?? response.run.state.bearers[0].loadout.id;
    if (!this.disposed) this.element<HTMLElement>(`[data-radiant-actor="${first}"]`).focus();
  }
  private async present(before: RadiantCombatState, response: RadiantRunResponse, action: RadiantPlayerAction,
    focusedTarget: string | null): Promise<void> {
    if (this.disposed) return;
    const generation = ++this.presentationGeneration;
    const restoreScroll = this.revealBattlefield();
    this.presenting = true; this.skipped = false; this.activeReceipt = response; this.impactTarget = focusedTarget; this.render();
    try {
      const frames = radiantImpactFrames(before, response.run.state, response.events);
      if (restoreScroll) {
        await this.nextPresentationFrame();
        if (this.disposed || this.skipped || generation !== this.presentationGeneration) return;
      }
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
      const fx: Promise<void>[] = [], failures: unknown[] = [], played = new Set<number>();
      const track = (effect: Promise<void>) => { fx.push(effect.catch(error => { failures.push(error); })); };
      let shaken = action.type !== 'flare';
      for (const [frameIndex, frame] of frames.entries()) {
        if (this.disposed || this.skipped || generation !== this.presentationGeneration) break;
        const previous = this.displayed;
        this.displayed = structuredClone(frame.readout); this.statuses = structuredClone(frame.statuses); this.render();
        if (!reducedMotion()) {
          const random = presentationRandom(`${response.revision}:${frameIndex}`);
          track(this.chargeOrbs(frame, previous, random));
          for (const event of frame.events) if (event.type === 'defeated')
            track(this.lootDrops(response, played, event.targetId, random));
          if (!shaken && frame.events.some(event => event.type === 'damage' && event.healthLoss + event.absorbed > 0)) {
            shaken = true; track(this.shakeField(frame));
          }
          await Promise.all([this.fieldImpact(frame), this.effects ? this.effects.impact(structuredClone(frame)) : this.impact(frame)]);
        }
      }
      if (!reducedMotion() && !this.disposed && !this.skipped && generation === this.presentationGeneration) {
        track(this.lootDrops(response, played, null, presentationRandom(`${response.revision}:end`)));
        await Promise.all(fx);
        if (failures.length) throw failures[0];
      }
      if (!this.disposed && generation === this.presentationGeneration) this.settle(response);
    } catch (error) {
      if (this.disposed || generation !== this.presentationGeneration) return;
      this.report(error);
      throw error;
    } finally {
      restoreScroll?.();
    }
  }
  private settle(response: RadiantRunResponse): void {
    this.displayed = radiantReadout(response.run.state);
    this.statuses = radiantStatusSnapshot(response.run.state);
    this.presenting = this.presentationQueue.length > 0; this.activeReceipt = null; this.impactTarget = null;
    this.presentationError = null;
    const receipt = this.session.view().presentation;
    if (receipt?.response.revision === response.revision) this.session.finishPresentation(receipt.requestId);
    const latest = this.session.view().saved.run;
    if (latest) this.syncTarget(latest);
    this.render();
    this.focusTerminalResult(response.run);
  }
  private focusTerminalResult(run: FrozenRadiantRun): void {
    const results = this.element<HTMLElement>('[data-radiant-results]');
    if (!results.hidden) {
      const heading = this.element<HTMLElement>('[data-radiant-result-heading]');
      heading.focus();
      if (!run.quit && run.state.phase === 'victory') {
        this.resultCelebration?.(); this.resultCelebration = rarityFeedback(heading, 'Omnic');
      }
    }
  }
  skip(): void {
    if (!this.presenting) return;
    this.skipped = true; this.presentationGeneration++; this.cancelEffects();
    this.cancelActivePresentation?.();
    for (const queued of this.presentationQueue.splice(0)) queued.resolve();
    const latest = this.session.view().saved.run;
    if (latest) {
      this.displayed = radiantReadout(latest.state);
      this.statuses = radiantStatusSnapshot(latest.state);
      this.presenting = false; this.activeReceipt = null; this.impactTarget = null; this.presentationError = null;
      this.syncTarget(latest);
      this.render();
      this.focusTerminalResult(latest);
    }
  }
  private motion = (): void => { if (reducedMotion()) this.skip(); };
  /** Immediate, finite card acknowledgement of an accepted input; the saved
   * action's field VFX follow separately. Static under Reduce motion. */
  private cardFeedback(id: string, kind: 'strike' | 'flare'): void {
    if (this.disposed || reducedMotion()) return;
    const card = this.host.querySelector<HTMLElement>(`[data-radiant-card][data-radiant-unit="${id}"]`);
    const burst = card?.querySelector<HTMLElement>('.radiant-card-burst');
    if (!card?.animate || !burst) return;
    const run = (target: HTMLElement, frames: Keyframe[], duration: number) => {
      const animation = target.animate(frames, { duration, easing: 'cubic-bezier(.2,.8,.2,1)' });
      animation.playbackRate = battleSpeed(); this.animations.add(animation);
      void animation.finished.catch(() => {}).finally(() => this.animations.delete(animation));
    };
    if (kind === 'strike') {
      run(card, [{ transform: 'translateY(0) scale(1)' }, { transform: 'translateY(2px) scale(.965)', offset: .3 },
        { transform: 'translateY(-4px) scale(1.015)', offset: .65 }, { transform: 'translateY(0) scale(1)' }], 360);
      run(burst, [{ opacity: 0, transform: 'scale(.6)' }, { opacity: .75, transform: 'scale(1)', offset: .35 },
        { opacity: 0, transform: 'scale(1.25)' }], 420);
    } else {
      run(card, [{ transform: 'translateY(-18px) scale(1.02)', filter: 'brightness(1.6) saturate(1.3)' },
        { transform: 'translateY(-30px) scale(1.05)', filter: 'brightness(2) saturate(1.5)', offset: .25 },
        { transform: 'translateY(4px) scale(.99)', filter: 'brightness(1.15)', offset: .7 },
        { transform: 'translateY(0) scale(1)', filter: 'none' }], 760);
      run(burst, [{ opacity: 0, transform: 'scale(.5)' }, { opacity: 1, transform: 'scale(1.1)', offset: .25 },
        { opacity: 0, transform: 'scale(1.7) translateY(-30%)' }], 820);
    }
  }
  private speed = (): void => { for (const animation of this.animations) animation.playbackRate = battleSpeed(); };
  private cancelEffects(): void {
    this.effects?.cancel();
    this.selectionCleanup?.(); this.selectionCleanup = null;
    for (const animation of this.animations) animation.cancel();
    for (const cleanup of this.effectsCleanup) cleanup();
    this.effectsCleanup.clear();
  }
  private nextPresentationFrame(): Promise<void> {
    return new Promise(resolve => {
      let frame = 0, finished = false;
      const finish = () => {
        if (finished) return;
        finished = true; window.cancelAnimationFrame(frame);
        this.effectsCleanup.delete(finish); resolve();
      };
      this.effectsCleanup.add(finish);
      frame = window.requestAnimationFrame(finish);
    });
  }
  private async animate(target: Element, frames: Keyframe[], duration: number,
    options: { easing?: string; delay?: number } = {}): Promise<void> {
    if (this.disposed || this.skipped || reducedMotion() || !target.animate) return;
    const animation = target.animate(frames, { duration, easing: options.easing ?? 'ease-out', delay: options.delay ?? 0, fill: 'both' });
    animation.playbackRate = battleSpeed(); this.animations.add(animation);
    if (this.session.view().settingsOpen) animation.pause();
    try { await animation.finished; }
    catch (error) { if (!(error instanceof DOMException && error.name === 'AbortError')) throw error; }
    finally { this.animations.delete(animation); animation.cancel(); }
  }
  private revealBattlefield(): (() => void) | null {
    if (reducedMotion()) return null;
    const field = this.element<HTMLElement>('.radiant-field');
    const bounds = field.getBoundingClientRect();
    const viewportHeight = window.visualViewport?.height || window.innerHeight;
    if (bounds.top >= 0 && bounds.bottom <= viewportHeight) return null;
    const scrollers: HTMLElement[] = [];
    for (let parent = field.parentElement; parent; parent = parent.parentElement) {
      const overflow = field.ownerDocument.defaultView!.getComputedStyle(parent).overflowY;
      if (/(auto|scroll|overlay)/.test(overflow) && parent.scrollHeight > parent.clientHeight) scrollers.push(parent);
    }
    const rootScroller = field.ownerDocument.scrollingElement;
    if (rootScroller instanceof HTMLElement && !scrollers.includes(rootScroller)) scrollers.push(rootScroller);
    const previous = scrollers.map(element => ({ element, scrollTop: element.scrollTop }));
    field.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
    const revealed = previous.map(({ element }) => ({ element, scrollTop: element.scrollTop }));
    if (previous.every((entry, index) => entry.scrollTop === revealed[index].scrollTop)) return null;
    return () => {
      if (!this.disposed && revealed.every(entry => entry.element.scrollTop === entry.scrollTop))
        for (const entry of previous) entry.element.scrollTop = entry.scrollTop;
    };
  }
  private async impact(frame: RadiantImpactFrame): Promise<void> {
    const targets = new Set(frame.events.filter(event => event.type === 'damage' || event.type === 'heal' || event.type === 'shield')
      .map(event => event.targetId));
    await Promise.all([...targets].map(async id => {
      const target = this.host.querySelector<HTMLElement>(`[data-radiant-target="${id}"] .radiant-unit-motion`) ??
        this.element<HTMLElement>(`[data-radiant-health="${id}"]`);
      const ring = document.createElement('span'); ring.className = 'radiant-impact-ring'; ring.setAttribute('aria-hidden', 'true');
      target.append(ring);
      const cleanup = () => ring.remove(); this.effectsCleanup.add(cleanup);
      try { await this.animate(ring, [{ opacity: .85, transform: 'scale(.3)' }, { opacity: 0, transform: 'scale(1.8)' }], 430); }
      finally { cleanup(); this.effectsCleanup.delete(cleanup); }
    }));
  }
  private fxLayer(): HTMLElement {
    let layer = this.host.querySelector<HTMLElement>(':scope > .radiant-fx-layer');
    if (!layer) {
      layer = document.createElement('div'); layer.className = 'radiant-fx-layer'; layer.setAttribute('aria-hidden', 'true');
      this.host.append(layer);
    }
    return layer;
  }
  private spawn(className: string, x: number, y: number): HTMLElement {
    const node = document.createElement('span'); node.className = className;
    node.style.left = `${x}px`; node.style.top = `${y}px`;
    this.fxLayer().append(node);
    const cleanup = () => node.remove(); this.effectsCleanup.add(cleanup);
    node.addEventListener('radiant-fx-done', () => { cleanup(); this.effectsCleanup.delete(cleanup); }, { once: true });
    return node;
  }
  /** Presentation-only orbs follow the saved enemy drop and charge deltas. */
  private async chargeOrbs(frame: RadiantImpactFrame, previous: RadiantReadout, random: () => number): Promise<void> {
    const run = this.session.view().saved.run!;
    const enemies = new Set(run.state.enemies.map(unit => unit.id));
    const sources = [...new Set(frame.events.flatMap(event =>
      event.type === 'damage' && enemies.has(event.targetId) && event.healthLoss + event.absorbed > 0 ? [event.targetId] : []))];
    const flights: Promise<void>[] = [];
    const fly = (from: Element, to: Element, color: string, count: number, pulse: Element) => {
      const end = centre(to);
      for (let index = 0; index < count; index++) {
        const start = centre(from, random);
        const orb = this.spawn('radiant-orb', start.x, start.y);
        orb.style.setProperty('--orb', color);
        const pop = { x: (random() - .5) * 120, y: -40 - random() * 70 };
        const dx = end.x - start.x, dy = end.y - start.y;
        const lift = Math.min(-80, dy * .25 - 110 - random() * 60);
        const at = (t: number) => {
          const cx = (pop.x + dx) / 2, cy = lift, u = 1 - t;
          return { x: u * u * pop.x + 2 * u * t * cx + t * t * dx, y: u * u * pop.y + 2 * u * t * cy + t * t * dy };
        };
        const point = (t: number, scale: number) => { const p = at(t); return `translate(${p.x}px, ${p.y}px) scale(${scale})`; };
        flights.push(this.animate(orb, [
          { offset: 0, opacity: 0, transform: 'translate(0, 0) scale(.2)', easing: 'cubic-bezier(.2,.9,.3,1)' },
          { offset: .22, opacity: 1, transform: `translate(${pop.x}px, ${pop.y}px) scale(1.2)`, easing: 'ease-in-out' },
          { offset: .34, opacity: 1, transform: `translate(${pop.x}px, ${pop.y + 6}px) scale(1)`, easing: 'cubic-bezier(.55,0,.85,.4)' },
          { offset: .6, opacity: 1, transform: point(.35, .95), easing: 'linear' },
          { offset: .8, opacity: 1, transform: point(.72, .8), easing: 'linear' },
          { offset: 1, opacity: .2, transform: point(1, .45) },
        ], 980, { easing: 'linear', delay: index * 70 + random() * 60 }).finally(() => orb.dispatchEvent(new Event('radiant-fx-done'))));
      }
      flights.push(this.animate(pulse, [{ filter: 'brightness(1)' }, { filter: 'brightness(2.1) saturate(1.4)', offset: .3 }, { filter: 'brightness(1)' }],
        420, { delay: 820 + count * 70 }));
    };
    const flyToMember = (id: string, units: number, source: Element) => {
      if (units <= 0) return;
      const card = this.host.querySelector(`[data-radiant-unit="${id}"]`);
      const meter = card?.querySelector('.radiant-charge-layers'), face = card?.querySelector('.radiant-face');
      if (!card || !meter || !face) throw new Error('Saved Gauge-drop recipient is missing from the battle view.');
      fly(source, face, getComputedStyle(card).getPropertyValue('--accent').trim() || '#ffffff',
        Math.min(6, Math.max(1, Math.ceil(units / (6 * personalChargeUnit)))), meter);
    };
    const dropUnits = new Map<string, number>();
    let simulated = structuredClone(previous.gauge);
    for (const event of frame.events) {
      if (event.type !== 'gauge-drop') continue;
      const after = grantRadiantDrop(simulated, event.bearerId, event.amount);
      const source = this.host.querySelector(`[data-radiant-art="${event.enemyId}"]`);
      if (!source) throw new Error('Saved Gauge-drop enemy is missing from the battle view.');
      for (const member of after.members) {
        const before = simulated.members.find(entry => entry.id === member.id)!;
        const units = Math.round(member.charge * personalChargeUnit) - Math.round(before.charge * personalChargeUnit);
        dropUnits.set(member.id, (dropUnits.get(member.id) ?? 0) + units);
        flyToMember(member.id, units, source);
      }
      simulated = after;
    }
    for (const member of frame.readout.gauge.members) {
      const before = previous.gauge.members.find(entry => entry.id === member.id)?.charge ?? member.charge;
      const units = Math.round(member.charge * personalChargeUnit) - Math.round(before * personalChargeUnit) -
        (dropUnits.get(member.id) ?? 0);
      if (units <= 0) continue;
      const card = this.host.querySelector(`[data-radiant-unit="${member.id}"]`);
      const own = this.host.querySelector(`[data-radiant-art="${member.id}"]`);
      const source = sources.length ? this.host.querySelector(`[data-radiant-art="${sources[Math.floor(random() * sources.length)]}"]`) : own;
      if (!card || !source) throw new Error('Saved charge source is missing from the battle view.');
      flyToMember(member.id, units, source);
    }
    const shared = frame.readout.gauge.sharedUnits - previous.gauge.sharedUnits;
    const sharedMeter = this.host.querySelector('[data-radiant-shared]');
    const origin = sources.length ? this.host.querySelector(`[data-radiant-art="${sources[0]}"]`) : null;
    if (shared > 0 && sharedMeter && origin) fly(origin, sharedMeter, '#f4f1ff', Math.min(4, Math.max(1, Math.ceil(shared / 6))), sharedMeter);
    await Promise.all(flights);
  }
  /** Saved kill rewards only; presentation follows the committed response. */
  private async lootDrops(response: RadiantRunResponse, played: Set<number>, enemyId: string | null, random: () => number): Promise<void> {
    const drops: Promise<void>[] = [];
    response.rewards.forEach((reward, index) => {
      if (played.has(index) || reward.kind !== 'reward' || (enemyId !== null && reward.source !== enemyId)) return;
      played.add(index);
      const origin = this.host.querySelector(`[data-radiant-art="${reward.source}"]`) ?? this.host.querySelector('.radiant-enemies');
      if (!origin) return;
      const bounds = origin.getBoundingClientRect();
      lootItems(reward).slice(0, 6).forEach((item, slot, items) => {
        const start = centre(origin);
        const node = this.spawn('radiant-loot', start.x, start.y);
        if (item.rarity) node.dataset.rarity = item.rarity;
        node.style.setProperty('--loot', item.color);
        const art = lootArt(item);
        node.innerHTML = `${art ? `<img src="${escape(art)}" alt="" decoding="async">` : '<i></i>'}<b>ÁE{formatStat(item.amount)}</b>`;
        const spread = items.length > 1 ? (slot / (items.length - 1) - .5) * Math.min(220, items.length * 60) : 0;
        const dx = spread + (random() - .5) * 26, dy = bounds.height * .42 - 12 + (random() - .5) * 18;
        const peak = -60 - random() * 50;
        drops.push(this.animate(node, [
          { offset: 0, opacity: 0, transform: 'translate(0, 0) scale(.3)', easing: 'cubic-bezier(.15,.7,.4,1)' },
          { offset: .16, opacity: 1, transform: `translate(${dx * .55}px, ${peak}px) scale(1.12)`, easing: 'cubic-bezier(.6,0,.9,.5)' },
          { offset: .32, opacity: 1, transform: `translate(${dx}px, ${dy}px) scale(1)`, easing: 'ease-out' },
          { offset: .4, opacity: 1, transform: `translate(${dx}px, ${dy - 14}px) scale(1.04)`, easing: 'ease-in' },
          { offset: .48, opacity: 1, transform: `translate(${dx}px, ${dy}px) scale(1)`, easing: 'linear' },
          { offset: .8, opacity: 1, transform: `translate(${dx}px, ${dy}px) scale(1)`, easing: 'cubic-bezier(.5,0,.75,0)' },
          { offset: 1, opacity: 0, transform: `translate(${dx}px, ${dy - 90}px) scale(.55)` },
        ], 1600, { easing: 'linear', delay: slot * 90 }).finally(() => node.dispatchEvent(new Event('radiant-fx-done'))));
      });
    });
    await Promise.all(drops);
  }
  private shakeField(frame: RadiantImpactFrame): Promise<void> {
    const heavy = frame.events.some(event => event.type === 'damage' && frame.readout.units[event.targetId]?.hp === 0);
    const a = heavy ? 9 : 6;
    return this.animate(this.element('.radiant-field'), [
      { transform: 'translate(0, 0)' }, { transform: `translate(${-a}px, ${a * .5}px)` }, { transform: `translate(${a * .8}px, ${-a * .4}px)` },
      { transform: `translate(${-a * .5}px, ${a * .3}px)` }, { transform: `translate(${a * .25}px, 0)` }, { transform: 'translate(0, 0)' },
    ], 420, { easing: 'cubic-bezier(.3,.7,.4,1)' });
  }
  private async fieldImpact(frame: RadiantImpactFrame): Promise<void> {
    const hits = new Map<string, { enemy: boolean; defeated: boolean }>();
    const run = this.session.view().saved.run!;
    for (const event of frame.events) {
      if (event.type !== 'damage' || event.healthLoss + event.absorbed <= 0) continue;
      hits.set(event.targetId, { enemy: run.state.enemies.some(unit => unit.id === event.targetId),
        defeated: frame.readout.units[event.targetId].hp === 0 });
    }
    await Promise.all([...hits].map(([id, hit]) => {
      const recoil = hit.enemy ? -14 : 14;
      return this.animate(this.element(`[data-radiant-art="${id}"]`), hit.defeated ? [
        { transform: 'translate(0, 0)', filter: 'brightness(1)', opacity: 1, easing: 'cubic-bezier(.2,.8,.3,1)' },
        { offset: .14, transform: `translate(${recoil}px, -4px)`, filter: 'brightness(2.4) saturate(.6)', opacity: 1, easing: 'ease-out' },
        { offset: .4, transform: `translate(${recoil * .6}px, 0)`, filter: 'brightness(1.2) grayscale(.4)', opacity: .9, easing: 'cubic-bezier(.4,0,.6,1)' },
        { transform: `translate(${recoil * .4}px, 14px) scale(.96)`, filter: 'brightness(.7) grayscale(1)', opacity: .2 },
      ] : [
        { transform: 'translate(0, 0)', filter: 'brightness(1)', easing: 'cubic-bezier(.2,.8,.3,1)' },
        { offset: .2, transform: `translate(${recoil}px, -3px)`, filter: 'brightness(2.2) saturate(.7)', easing: 'cubic-bezier(.3,0,.3,1)' },
        { offset: .55, transform: `translate(${recoil * -.15}px, 0)`, filter: 'brightness(1.05)', easing: 'ease-in-out' },
        { transform: 'translate(0, 0)', filter: 'brightness(1)' },
      ], hit.defeated ? 640 : 380, { easing: 'linear' });
    }));
  }
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true; this.cancelEffects();
    this.cancelActivePresentation?.();
    for (const queued of this.presentationQueue.splice(0)) queued.resolve();
    this.effects?.dispose?.();
    this.gestures.dispose();
    this.resultCelebration?.(); this.resultCelebration = null;
    this.artworkCleanup();
    this.host.removeEventListener('click', this.click);
    this.host.removeEventListener('contextmenu', this.contextMenu);
    this.host.removeEventListener('keydown', this.keyDown);
    window.removeEventListener('last-light-motion-change', this.motion);
    window.removeEventListener('last-light-battle-speed-change', this.speed);
    this.host.replaceChildren();
  }
}
