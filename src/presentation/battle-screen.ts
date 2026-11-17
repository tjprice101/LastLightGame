import { characterName } from '../content/character-art';
import { getStarter } from '../content/starters';
import { radiantAttunement } from '../content/combat-kits';
import { grantRadiantDrop, personalChargeMaximum, personalChargeUnit, radiantChargeRules,
  readyFlare } from '../game/combat-gauge';
import type { RadiantCombatState } from '../game/combat-engine';
import { RadiantSession } from '../online/battle-session';
import { type RadiantPlayerAction, type RadiantRunResponse, type FrozenRadiantRun, type RadiantTurnAction } from '../online/battle-run';
import { lusterSheen } from './luster';
import { compactPortrait } from './compact-portrait';
import { escapeDialogText as escape, gameConfirm } from './game-dialog';
import { reducedMotion } from './settings';
import { applyBattleSpeed, battleSpeed, battleSpeeds } from './battle-speed';
import { radiantImpactFrames, radiantReadout, type RadiantImpactFrame, type RadiantReadout } from './battle-impact-frames';
import './battle-screen.css';
import { radiantArenaArt, radiantEnemyArt, radiantAllyArt } from './battle-art';
import { radiantStatusSnapshot, radiantStatusRows, radiantShieldRows } from './battle-timed-status';
import { bindArtworkLoading } from './artwork-loading';
import { radiantResultsMarkup, radiantEncounterLabel, radiantActivityTitle, radiantOutcome, celebrateRadiantResults, radiantResultIntro } from './battle-outcome';
import { radiantLeaderReference, radiantFlareNeedsTarget } from './battle-reference';
import { bindRadiantPortraitGestures, radiantGestureActor } from './portrait-gesture';
import { characterChoreography } from './battle-effects';
import { formatStat } from '../content/combat';
import { lootArt, lootItems } from './battle-loot';
import { radiantFormation, radiantFormationStyle } from './battle-formation';
import { radiantFlareCutin } from './battle-cutin';
import './battle-cutin.css';
import { radiantBearerKits, radiantFlares } from '../content/combat-kits';
import { elementDamageMultiplier } from '../content/element-matchups';

export { radiantActivityTitle };

export interface RadiantBattleEffects {
  windup(action: RadiantPlayerAction, state: RadiantCombatState): Promise<void>;
  /** `action` is the presented player action, or null for enemy-phase frames (no caster). */
  impact(frame: RadiantImpactFrame, action?: RadiantPlayerAction | null, state?: RadiantCombatState): Promise<void>;
  pause?(paused: boolean): void;
  cancel(): void;
  dispose?(): void;
}
/** One action's presentation; player actions overlap (Battle Flurry, D-472). */
interface ActivePresentation {
  index: number;
  done: Promise<void>;
  cancel(): void;
}
interface QueuedRadiantAction {
  kind: 'normal' | 'flare';
  bearerId: string;
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
const enemyLeadInMs = 320, enemyWindupMs = 420, enemyRecoveryMs = 260;
/** The enemy whose direct authored packet this frame shows, if any. */
function enemyActor(frame: RadiantImpactFrame): string | null {
  for (const event of frame.events)
    if ((event.type === 'damage' && event.origin === 'direct' || event.type === 'heal' || event.type === 'shield') &&
      event.source.kind === 'enemy') return event.source.enemyId;
  return null;
}
/** First frame of the enemy phase in a round-completing response: it waits for the whole flurry. */
function enemyPhaseFrame(frame: RadiantImpactFrame): boolean {
  return frame.events.some(event => event.type === 'round' ||
    'source' in event && event.source.kind === 'enemy' ||
    event.type === 'damage' && event.origin === 'periodic' ||
    event.type === 'status' && event.clockOnly);
}
/** Exact presentation amount: whole numbers grouped, fractional values unrounded beyond 2 places. */
function amountText(value: number): string {
  return Number.isInteger(value) ? value.toLocaleString('en-US') : formatStat(value);
}
const tierNames = { sparkling: 'Sparkling Convergent Light', glimmering: 'Glimmering Convergent Light',
  ultimate: 'Ultimate Convergence of Light' };
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
  private activePresentations = new Set<ActivePresentation>();
  private presentationIndex = 0;
  /** Newest (action, frame) readout shown; an older overlapping frame never rewinds it. */
  private appliedFrame: [number, number] = [0, Number.MAX_SAFE_INTEGER];
  /** Bumped whenever effects are cancelled, so late mote landings cannot change the Haul. */
  private effectsEpoch = 0;
  private numberStacks = new Map<string, number>();
  private shownCharge = new Map<string, number>();
  /** Saved settle response whose materials pour before the results celebrate. */
  private settleLoot: RadiantRunResponse | null = null;
  private lootPouring = false;
  private actionQueue: QueuedRadiantAction[] = [];
  private queuedActionActors = new Set<string>();
  private actionQueueRunning = false;
  private statuses: ReturnType<typeof radiantStatusSnapshot>;
  private artworkCleanup!: () => void;
  private statusMarkup = new Map<string, string>();
  private shieldMarkup = new Map<string, string>();
  private resultKey: string | null = null;
  private resultCelebration: (() => void) | null = null;
  private celebratedKey: string | null = null;
  private leaderMarkup: string | null = null;
  private gestures: ReturnType<typeof bindRadiantPortraitGestures>;
  /** Haul shown so far: follows presented frames, never ahead of what the player has seen. */
  private shownHaul = 0;
  private haulSheen: (() => void) | null = null;
  private settling: Promise<void> | null = null;
  /** Haul submitted by the last settle, kept on screen with the saved result. */
  private finalHaul: number | null = null;
  constructor(private readonly host: HTMLElement, private readonly session: RadiantSession,
    private readonly openSettings: () => void, private readonly effects?: RadiantBattleEffects,
    private readonly onExit?: () => void) {
    const run = session.view().run;
    if (!run) throw new Error('A saved Radiant encounter is required.');
    this.shownHaul = session.view().haul;
    this.displayed = radiantReadout(run.state);
    this.statuses = radiantStatusSnapshot(run.state);
    this.target = run.state.enemies.find(unit => unit.hp > 0)?.id ?? null;
    this.mount(run);
    this.gestures = bindRadiantPortraitGestures(host, {
      ready: id => {
        const gauge = this.session.view().run?.state.gauge;
        const member = gauge?.members.find(member => member.id === id);
        const button = this.host.querySelector<HTMLButtonElement>(`[data-radiant-actor="${id}"]`);
        const tier = member?.living && button && !button.disabled && gauge ? readyFlare(gauge, id) : null;
        return tier ? tierNames[tier] : null;
      },
      cast: id => { this.enqueueAction('flare', id); },
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
            <span class="radiant-hud-progress"><span data-radiant-progress>${radiantEncounterLabel(run)}</span> · <span data-radiant-round></span></span>
            <span class="radiant-haul" data-radiant-haul title="Prismatica gathered this encounter. It is saved when the encounter ends; leaving early forfeits it.">
              <span class="radiant-haul-label">Haul</span> <strong class="radiant-haul-amount" data-radiant-haul-amount>0</strong> <span>Prismatica</span>
              <span class="radiant-haul-state" data-radiant-haul-state></span></span></div>
          <div class="radiant-hud-tools"><button type="button" class="radiant-speed" data-radiant-speed title="Battle speed">1x</button>
          <button type="button" data-radiant-skip aria-label="Skip presentation" title="Skip presentation" disabled><svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M4 5v14l11-7zM17 5h3v14h-3z"/></svg></button>
          <button type="button" data-radiant-settings aria-label="Settings"><span aria-hidden="true">⚙</span></button>
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
            <div class="radiant-target-name"><strong>${escape(enemy.name)}</strong><span>Lv.${enemy.level}</span></div>
            ${this.healthMarkup(enemy.id)}</div>`).join('')}
          <p data-radiant-no-target hidden>No enemy target remains.</p>
        </div>
      </div>
      <div class="radiant-squad" role="group" aria-label="Squad portrait controls" tabindex="0"
        style="--squad-size:${run.state.bearers.length};--squad-columns:${Math.min(3, run.state.bearers.length)};--squad-phone-columns:${Math.min(2, run.state.bearers.length)}">${run.state.bearers.map((unit, index) => {
        const member = unit.loadout, starter = getStarter(member.starter);
        return `<article class="radiant-member" data-radiant-card data-radiant-unit="${escape(member.id)}" data-element="${starter.elementId}">
          <span class="radiant-card-burst" aria-hidden="true"></span>
          <span class="radiant-card-hint" aria-hidden="true"></span>
          <button type="button" class="radiant-face" data-radiant-actor="${escape(member.id)}"
            aria-describedby="radiant-gesture-help" aria-label="${escape(characterName(member.starter, member.form))} · Normal Attack; right click to defend; hold the card and drag upward for ready Convergent Light">
            ${compactPortrait(starter, member.form)}<span class="radiant-visually-hidden">${index ? `Member ${index + 1}` : 'Leader'}</span></button>
          <div class="radiant-member-head radiant-visually-hidden">${radiantCardName(characterName(member.starter, member.form))}
            <span class="radiant-identity">Lv.${member.level} · ${escape(radiantAttunement(member).replace(/^./, letter => letter.toUpperCase()))}</span></div>
          ${this.healthMarkup(member.id, true)}
          <div class="radiant-member-charge">
          <div class="radiant-charge-layers" data-radiant-energy="${escape(member.id)}" aria-label="Personal charge">
            ${[1, ...(member.form >= 4 ? [2] : [])].map(layer =>
              `<meter class="radiant-visually-hidden" data-radiant-charge="${escape(member.id)}" data-layer="${layer}" min="0" max="${run.state.gauge.members[index].baseCost}" aria-label="Convergent Light Luminosity ${layer}"></meter>`).join('')}
            <span class="radiant-energy-track" aria-hidden="true">${[1, ...(member.form >= 4 ? [2] : [])].map(layer =>
              `<span class="radiant-energy-liquid" data-energy-layer="${layer}"></span>`).join('')}</span>
          </div>
          <span class="radiant-visually-hidden" data-radiant-charge-text="${escape(member.id)}"></span>
          </div>
          <div class="radiant-member-foot radiant-visually-hidden"><span data-radiant-readiness="${escape(member.id)}"></span>
          <dl class="radiant-frozen-stats" aria-label="Combat stats">${Object.entries(unit.stats).filter(([stat]) => stat !== 'hp').map(([stat, value]) =>
            `<div><dt><span aria-hidden="true">${escape(stat.slice(0, 3).toUpperCase())}</span><span class="radiant-visually-hidden">${escape(stat[0].toUpperCase() + stat.slice(1))}</span></dt><dd>${formatStat(value)}</dd></div>`).join('')}</dl></div>
        </article>`;
      }).join('')}</div>
      <div class="radiant-battle-footer">
      <p id="radiant-gesture-help">Left click a card to attack · Right click to defend · Hold, then swipe up to release Convergent Light.
        <span class="radiant-visually-hidden">Hold for 350ms and drag upward 32px. Keyboard: Enter attacks, D or the context-menu key defends, F or Up Arrow releases ready Convergent Light.</span></p>
      <p class="radiant-visually-hidden" data-radiant-gesture-status role="status" aria-live="polite"></p>
      <div class="radiant-actions"><button type="button" class="radiant-end-turn" data-radiant-end-turn
        aria-keyshortcuts="E" title="End Turn: members who have not acted skip this round (E)">End Turn</button>
        <button type="button" data-radiant-retry hidden>Retry pending request</button>
        <button type="button" data-radiant-results-show hidden>View saved results</button></div>
      <p class="radiant-visually-hidden" data-radiant-status role="status" aria-live="polite"></p>
      <p data-radiant-error role="alert"></p>
      <details class="radiant-team-reference"><summary>Battle reference</summary>
        <div data-radiant-leader-reference></div>
        <div class="radiant-member-references">${run.state.bearers.map(unit => `<section data-radiant-member-reference="${escape(unit.loadout.id)}">
          <h3>${escape(characterName(unit.loadout.starter, unit.loadout.form))}</h3>
          <ul class="radiant-shield-layers" data-radiant-layers></ul><ul class="radiant-status-list" data-radiant-effects></ul>
          <p data-radiant-no-effects>No active effects.</p></section>`).join('')}</div>
        <p>Tap members in any order: each action resolves at once on this device. End Turn skips members who have not acted; the enemy phase follows once every living member has acted.
        Prismatica gathered during the encounter fills the Haul, which is saved with your rewards when the encounter ends (victory or defeat). Leaving mid-encounter forfeits that encounter’s unsaved Haul; rewards saved from earlier encounters are kept.</p>
        <p>Normal Attack and Defense each use this member’s action for the round. No random critical damage.
        A damaging Normal hit generates ${radiantChargeRules.normal} Luminosity for its attacker and a separate 1 for each other living same-element ally.
        Surviving each direct incoming hit on Health or Shields grants ${radiantChargeRules.incomingAttack} Luminosity to the recipient only.
        Personal capacity is 100, or 200 from form 4. Convergent Light, defeats, Defense, new rounds, generated and periodic damage grant no base personal Luminosity.</p>
        <p>Convergent Light uses 4 Sparkling, 8 Glimmering or 12 Ultimate hits, with at least 1 damage per hit.
        Rank 1–5 is Sparkling; rank 6–10 is Glimmering and requires Evo.4; rank 11–20 is Ultimate and requires Evo.6. Each rank after Rank 1 increases effect magnitudes by 1%. Infernic is weak to Oceanic, Oceanic to Botanic, Botanic to Atmospheric, and Atmospheric to Infernic.
        Advantage deals ×1.5 damage; disadvantage ×0.75. Tranquilitic and Chaotic deal ×1.5 to each other; other matchups are neutral.</p>
        <p>Normal Attack uses 100% effective Attack against one selected living enemy.
        Direct damage is rounded once: Attack × Attack/(Attack + effective enemy Defense) × action coefficient × output modifiers, minimum 1.
        Burn/periodic and generated packets follow their authored rules, not this guaranteed direct-damage formula.
        Defense halves direct enemy damage until the next round, with strongest reduction and gear enhancements; combined multiplier floor 20%.
        Shields absorb in creation order before HP.</p>
        <p>Defeated members are not replaced or promoted. Convergent Light ranks are individually saved for each Element-Bearer.</p>
      </details>
      </div></div>
      <div data-radiant-results hidden></div>
    </section>`;
    this.artworkCleanup = bindArtworkLoading(this.host);
  }
  private healthMarkup(id: string, compact = false): string {
    return `<div class="radiant-health" data-radiant-health="${escape(id)}"><meter min="0" aria-label="HP"></meter>
      <span data-hp></span><span data-shield></span>${compact ? '' : `<ul class="radiant-shield-layers" data-radiant-layers></ul>
      <ul class="radiant-status-list" data-radiant-effects></ul>`}</div>`;
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
    if (button.hasAttribute('data-radiant-speed')) { this.cycleSpeed(); return; }
    if (button.hasAttribute('data-radiant-end-turn')) { this.endTurn(); return; }
    if (button.hasAttribute('data-radiant-leave')) { void this.confirmExit().catch(error => this.report(error)); return; }
    if (button.hasAttribute('data-radiant-result-dismiss') || button.hasAttribute('data-radiant-results-show')) {
      if (button.hasAttribute('data-radiant-result-dismiss')) { this.resultCelebration?.(); this.resultCelebration = null; }
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
      this.enqueueAction('normal', button.dataset.radiantActor); return;
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
    // Defend was removed (D-473); Phase 3 Step 3 opens the Skill 1 / Skill 2 / Flare grid here.
  };
  private keyDown = (event: KeyboardEvent): void => {
    if (this.disposed || event.altKey || event.ctrlKey || event.metaKey || !(event.target instanceof HTMLElement)) return;
    const results = this.element<HTMLElement>('[data-radiant-results]');
    if (!results.hidden) {
      const intro = results.querySelector<HTMLElement>('.radiant-result-intro');
      if (intro && (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault(); event.stopPropagation(); intro.click(); return;
      }
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
    if (event.key.toLowerCase() === 'e' && !event.shiftKey && !(event.target instanceof HTMLInputElement)) {
      const end = this.host.querySelector<HTMLButtonElement>('[data-radiant-end-turn]');
      if (end && !end.disabled) { event.preventDefault(); this.endTurn(); }
      return;
    }
    const id = event.target.dataset.radiantActor;
    if (!id || event.target.hasAttribute('disabled')) return;
    const key = event.key.toLowerCase();
    const kind = key === 'f' || event.key === 'ArrowUp' ? 'flare' : null;
    if (!kind) return;
    event.preventDefault();
    this.enqueueAction(kind, id);
  };
  private selection(button: HTMLElement): void {
    this.selectionCleanup?.(); this.selectionCleanup = null;
    const art = button.querySelector<HTMLElement>('.radiant-unit-idle');
    if (reducedMotion() || !art?.animate) return;
    const animation = art.animate([
      { transform: 'translateY(0) scale(1)' }, { transform: 'translateY(-6px) scale(1.04)', offset: .4 },
      { transform: 'translateY(0) scale(1)' },
    ], { duration: 260, easing: 'cubic-bezier(.3,.7,.3,1)' });
    this.selectionCleanup = () => animation.cancel();
  }
  private report(error: unknown): void {
    if (this.disposed) return;
    this.presentationError = error instanceof Error ? error.message : 'Battle presentation failed; the saved outcome is retained.';
    this.element<HTMLElement>('[data-radiant-error]').textContent = this.presentationError;
  }
  render(): void {
    if (this.disposed) return;
    const view = this.session.view(), run = view.run, saved = view.saved.run;
    if (!run || !saved) { this.host.setAttribute('aria-busy', 'false'); return; }
    this.syncTarget(run);
    const interactionBlocked = view.settingsOpen || view.entrancePending;
    // The next round opens only after the enemy phase has been presented.
    const roundPending = this.displayed.round !== run.state.round;
    const actionUnavailable = interactionBlocked || run.quit || run.state.phase !== 'player' || roundPending;
    const operationBlocked = view.busy || !!view.pending || !!view.preparationPending || !!view.presentation ||
      !!view.preparationPresentation;
    const blocked = actionUnavailable || operationBlocked && !this.actionQueueRunning;
    if (blocked) this.gestures?.cancel();
    this.host.setAttribute('aria-busy', String(view.busy || view.entrancePending));
    this.element<HTMLElement>('.radiant-battle').classList.toggle('is-settings-open', view.settingsOpen);
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
      const id = unit.dataset.radiantHealth!;
      const effectHost = this.host.querySelector<HTMLElement>(`[data-radiant-member-reference="${id}"]`) ?? unit;
      const layers = effectHost.querySelector<HTMLElement>('[data-radiant-layers]')!;
      const shieldMarkup = radiantShieldRows(value.hp > 0 ? value.layers : [], run);
      if (this.shieldMarkup.get(id) !== shieldMarkup) {
        layers.innerHTML = shieldMarkup; this.shieldMarkup.set(id, shieldMarkup);
      }
      const statuses = effectHost.querySelector<HTMLElement>('[data-radiant-effects]')!;
      const statusMarkup = radiantStatusRows(value.hp > 0 ? this.statuses[unit.dataset.radiantHealth!] : [], run);
      if (this.statusMarkup.get(id) !== statusMarkup) {
        statuses.innerHTML = statusMarkup; this.statusMarkup.set(id, statusMarkup);
      }
      const noEffects = effectHost.querySelector<HTMLElement>('[data-radiant-no-effects]');
      if (noEffects) noEffects.hidden = !!(shieldMarkup || statusMarkup);
    }
    for (const button of Array.from(this.host.querySelectorAll<HTMLButtonElement>('[data-radiant-actor]'))) {
      const id = button.dataset.radiantActor!;
      const savedMember = run.state.bearers.find(member => member.loadout.id === id);
      button.disabled = blocked || this.queuedActionActors.has(id) || !savedMember ||
        savedMember.hp === 0 || run.state.acted.includes(id);
      button.closest('.radiant-member')!.classList.toggle('is-defeated', !savedMember || savedMember.hp === 0);
      button.closest('.radiant-member')!.classList.toggle('has-acted', run.state.acted.includes(id));
      const tier = savedMember && savedMember.hp > 0 ? readyFlare(run.state.gauge, id) : null;
      button.dataset.readyTier = !button.disabled && tier ? tier : '';
      button.closest<HTMLElement>('.radiant-member')!.dataset.readyTier = button.dataset.readyTier;
      this.element<HTMLElement>(`[data-radiant-readiness="${id}"]`).textContent =
        !savedMember || savedMember.hp === 0 ? 'Defeated' : run.state.acted.includes(id) ? 'Acted this round' :
          tier ? `${tierNames[tier]} ready` : 'Convergent Light charging';
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
    const displayedTarget = impactTarget ?? this.target;
    for (const detail of Array.from(this.host.querySelectorAll<HTMLElement>('[data-radiant-target-detail]'))) {
      const id = detail.dataset.radiantTargetDetail;
      detail.hidden = id !== displayedTarget;
    }
    this.element<HTMLElement>('[data-radiant-no-target]').hidden = this.target !== null || impactTarget !== null;
    for (const member of this.displayed.gauge.members) {
      const energy = this.element<HTMLElement>(`[data-radiant-energy="${member.id}"]`);
      energy.classList.toggle('is-flowing', member.charge > 0 && this.displayed.units[member.id].hp > 0);
      energy.classList.toggle('has-second-layer', member.charge > member.baseCost);
      for (const meter of Array.from(energy.querySelectorAll<HTMLMeterElement>('[data-radiant-charge]'))) {
        meter.value = Math.min(member.baseCost, Math.max(0, member.charge - (Number(meter.dataset.layer) - 1) * member.baseCost));
        const liquid = energy.querySelector<HTMLElement>(`[data-energy-layer="${meter.dataset.layer}"]`)!;
        liquid.style.width = `${meter.value / member.baseCost * 100}%`;
        liquid.classList.toggle('has-charge', meter.value > 0);
      }
      this.element<HTMLElement>(`[data-radiant-charge-text="${member.id}"]`).textContent =
        `${member.charge} / ${personalChargeMaximum(member)} Luminosity`;
      const shown = this.shownCharge.get(member.id);
      if (shown !== undefined && member.charge > shown && this.displayed.units[member.id].hp > 0) this.surge(energy);
      this.shownCharge.set(member.id, member.charge);
    }
    this.element<HTMLElement>('[data-radiant-round]').textContent = `Round ${this.displayed.round}`;
    const endTurn = this.element<HTMLButtonElement>('[data-radiant-end-turn]');
    endTurn.disabled = blocked || this.actionQueue.length > 0;
    endTurn.hidden = run.state.phase === 'victory' || run.state.phase === 'defeat' || run.quit;
    this.renderHaul(view.busy && view.settleDue, view.settleDue && !view.busy && !!view.pending);
    const leader = this.element<HTMLElement>('[data-radiant-leader-reference]');
    const leaderMarkup = radiantLeaderReference(run.state, this.displayed.units[run.state.bearers[0].loadout.id].hp > 0);
    if (this.leaderMarkup !== leaderMarkup) { leader.innerHTML = leaderMarkup; this.leaderMarkup = leaderMarkup; }
    this.element<HTMLButtonElement>('[data-radiant-retry]').hidden = !view.pending || view.busy;
    this.element<HTMLButtonElement>('[data-radiant-skip]').disabled = !(this.presenting || this.lootPouring) || view.settingsOpen;
    this.renderSpeed();
    const resultBlocked = operationBlocked || interactionBlocked || this.actionQueueRunning || this.presenting || this.lootPouring;
    // Results follow the saved (settled) run only: rewards are celebrated after the authority save.
    const terminal = saved.quit || saved.state.phase === 'victory' || saved.state.phase === 'defeat';
    const leave = this.host.querySelector<HTMLButtonElement>('[data-radiant-leave]');
    if (leave) { leave.disabled = resultBlocked && !view.settleDue || view.busy; leave.hidden = terminal; }
    const results = this.element<HTMLElement>('[data-radiant-results]');
    if (terminal && !resultBlocked) {
      const key = `${saved.id}:${saved.encounter}:${view.saved.revision}`;
      if (this.resultKey !== key) { results.innerHTML = radiantResultsMarkup(saved, !!this.onExit); this.resultKey = key; }
    }
    const wasHidden = results.hidden;
    results.hidden = !terminal || resultBlocked || view.resultsDismissed;
    this.element<HTMLElement>('.radiant-battle-layout').inert = !results.hidden;
    if (wasHidden && !results.hidden) this.element<HTMLElement>('[data-radiant-result-heading]').focus({ preventScroll: true });
    this.element<HTMLButtonElement>('[data-radiant-results-show]').hidden = !terminal || resultBlocked || !view.resultsDismissed;
    for (const button of Array.from(results.querySelectorAll<HTMLButtonElement>('button'))) button.disabled = resultBlocked;
    this.element<HTMLElement>('[data-radiant-error]').textContent = view.error?.message ?? this.presentationError ?? '';
    this.element<HTMLElement>('[data-radiant-status]').textContent = view.busy && view.settleDue ? 'Saving encounter…' :
      view.busy || this.presenting ? '' :
      saved.state.phase === 'victory' ? 'Victory · rewards saved.' :
      saved.state.phase === 'defeat' ? 'Defeat · Haul and earned rewards saved.' : '';
  }
  private targetHaul(): number {
    const view = this.session.view();
    return view.settleDue || view.run?.state.phase === 'player' ? view.haul : this.finalHaul ?? this.shownHaul;
  }
  /** Exact Haul count; a finite sheen marks each gain, static under Reduce motion. */
  private renderHaul(saving: boolean, unsaved: boolean): void {
    const amount = this.element<HTMLElement>('[data-radiant-haul-amount]');
    const text = this.shownHaul.toLocaleString('en-US');
    if (amount.textContent !== text) {
      const gained = Number(amount.textContent?.replace(/,/g, '') ?? 0) < this.shownHaul;
      amount.textContent = text;
      if (gained && !reducedMotion()) { this.haulSheen?.(); this.haulSheen = lusterSheen(amount, 600); }
    }
    const saved = this.session.view().saved.run;
    const settled = !!saved && (saved.state.phase === 'victory' || saved.state.phase === 'defeat');
    this.element<HTMLElement>('[data-radiant-haul-state]').textContent =
      saving ? 'Saving…' : unsaved ? 'Not saved yet' : settled && this.shownHaul > 0 ? 'Saved' : '';
  }
  async finishEntrance(): Promise<void> {
    this.skipped = false;
    await this.animate(this.element('.radiant-squad'), [{ opacity: .3, transform: 'translateY(16px)' }, { opacity: 1, transform: 'translateY(0)' }], 500);
    if (!this.disposed) {
      this.session.finishEntrance(); this.render();
      // A resumed log may already have finished the encounter on this device.
      if (this.session.view().settleDue) void this.settleEncounter();
    }
  }
  /** Saves the finished device-run encounter through one authority replay (D-471). */
  private settleEncounter(): Promise<void> {
    if (this.settling) return this.settling;
    this.settling = (async () => {
      try {
        this.finalHaul = this.session.view().haul;
        const response = await this.session.settle();
        this.finishSettle(response);
      } catch (error) {
        this.report(error);
        // A rejected replay saved nothing; the session restarted play from the saved start.
        const view = this.session.view();
        if (!view.pending && !view.settleDue && view.run && view.run.state.phase === 'player') await this.remount(view.run);
      } finally {
        this.settling = null;
        this.render();
      }
    })();
    return this.settling;
  }
  private finishSettle(response: RadiantRunResponse): void {
    if (this.disposed) return;
    const receipt = this.session.view().presentation;
    if (receipt?.response.revision === response.revision) this.session.finishPresentation(receipt.requestId);
    this.settleLoot = response;
    if (!this.presenting) {
      this.displayed = radiantReadout(response.run.state);
      this.statuses = radiantStatusSnapshot(response.run.state);
      this.appliedFrame = [this.presentationIndex, Number.MAX_SAFE_INTEGER];
      this.render();
      void this.revealSavedResult();
    } else this.render();
  }
  private syncTarget(run: FrozenRadiantRun): void {
    if (!this.target || !run.state.enemies.some(enemy => enemy.id === this.target && enemy.hp > 0))
      this.target = run.state.enemies.find(enemy => enemy.hp > 0)?.id ?? null;
  }
  async act(kind: 'normal' | 'flare', bearerId?: string): Promise<void> {
    this.presentationError = null;
    this.element<HTMLElement>('[data-radiant-gesture-status]').textContent = '';
    const before = this.session.view().run;
    if (!before) throw new Error('A saved encounter is required.');
    // Programmatic callers may omit the member; every card action passes its own.
    const actor = bearerId ?? (before.state.bearers.find(unit => unit.hp > 0 && !before.state.acted.includes(unit.loadout.id))
      ?? before.state.bearers[0]).loadout.id;
    const member = before.state.bearers.find(unit => unit.loadout.id === actor)!;
    const tier = member.hp > 0 ? readyFlare(before.state.gauge, actor) : null;
    const focusedTarget = this.target;
    const action: RadiantPlayerAction =
      kind === 'normal' ? { type: kind, bearerId: actor, targetId: focusedTarget ?? '' } :
      { type: kind, bearerId: actor, ...(tier && radiantFlareNeedsTarget(member.loadout, tier)
        ? { targetId: focusedTarget ?? '' } : {}) };
    try {
      // Resolved instantly on the device; presentation follows without waiting for the network.
      const turn = this.session.act(action);
      this.cardFeedback(action.bearerId, kind === 'flare' ? 'flare' : 'strike');
      const presentation = this.queuePresentation(turn.before, turn.response, action,
        affectedEnemyTarget(turn.response, focusedTarget), false);
      if (this.session.view().settleDue) void this.settleEncounter();
      if (this.actionQueueRunning) void presentation.catch(error => this.report(error));
      else await presentation;
    }
    finally { this.render(); }
  }
  /** End Turn: members who have not acted skip this round and the enemy phase plays. */
  endTurn(): void {
    if (this.disposed || this.actionQueue.length || this.actionQueueRunning) return;
    const button = this.host.querySelector<HTMLButtonElement>('[data-radiant-end-turn]');
    if (!button || button.disabled) return;
    this.presentationError = null;
    try {
      const turn = this.session.act({ type: 'end-turn' });
      void this.queuePresentation(turn.before, turn.response, { type: 'end-turn' }, null, false)
        .catch(error => this.report(error));
      if (this.session.view().settleDue) void this.settleEncounter();
    } catch (error) { this.report(error); }
    finally { this.render(); }
  }
  private enqueueAction(kind: QueuedRadiantAction['kind'], bearerId: string | undefined): void {
    if (!bearerId || this.disposed || this.queuedActionActors.has(bearerId)) return;
    const view = this.session.view(), run = view.run;
    // Taps are accepted while earlier actions are still being presented (flurry); the next
    // round opens only once the enemy phase has been shown.
    if (!run || view.settingsOpen || view.entrancePending || run.quit || run.state.phase !== 'player' ||
      this.displayed.round !== run.state.round || view.preparationPending || view.preparationPresentation ||
      !this.actionQueueRunning && (view.busy || view.pending || view.presentation)) return;
    const member = run.state.bearers.find(unit => unit.loadout.id === bearerId);
    if (!member || member.hp <= 0 || run.state.acted.includes(bearerId)) return;
    if (kind === 'flare' && !readyFlare(run.state.gauge, bearerId)) {
      this.element<HTMLElement>('[data-radiant-gesture-status]').textContent = 'Convergent Light is not ready.';
      return;
    }
    if (!run.state.enemies.some(enemy => enemy.hp > 0)) return;
    this.queuedActionActors.add(bearerId);
    this.actionQueue.push({ kind, bearerId });
    this.gestures.cancel();
    this.render();
    void this.drainActionQueue();
  }
  private async drainActionQueue(): Promise<void> {
    if (this.actionQueueRunning || this.disposed) return;
    this.actionQueueRunning = true;
    this.render();
    try {
      while (this.actionQueue.length && !this.disposed) {
        const queued = this.actionQueue.shift()!;
        const run = this.session.view().run;
        if (!run || run.quit || run.state.phase !== 'player' || this.session.view().settingsOpen) {
          this.actionQueue.length = 0;
          break;
        }
        const member = run.state.bearers.find(unit => unit.loadout.id === queued.bearerId);
        if (!member || member.hp <= 0 || run.state.acted.includes(queued.bearerId)) {
          this.report(new Error(`${member?.loadout.starter ?? 'Squad member'} could not take the queued action.`));
          this.queuedActionActors.delete(queued.bearerId);
          continue;
        }
        try {
          await this.act(queued.kind, queued.bearerId);
        } catch (error) {
          this.actionQueue.length = 0;
          this.report(error);
          break;
        } finally {
          this.queuedActionActors.delete(queued.bearerId);
          this.render();
        }
      }
    } finally {
      this.actionQueueRunning = false;
      this.queuedActionActors.clear();
      this.render();
    }
  }
  async retry(): Promise<void> {
    this.presentationError = null;
    const before = this.session.view().run, request = this.session.view().pending;
    if (!before || !request) throw new Error('An unresolved battle request is required.');
    if (request.operation.kind === 'settle') {
      this.settling = (async () => {
        try { this.finalHaul ??= this.session.view().haul; this.finishSettle(await this.session.retryPending()); }
        finally { this.settling = null; this.render(); }
      })();
      this.render();
      return this.settling;
    }
    const pending = this.session.retryPending(); this.render();
    try {
      const response = await pending;
      if (request.operation.kind === 'continue' || request.operation.kind === 'retry' || request.operation.kind === 'exit')
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
    action: RadiantTurnAction, focusedTarget: string | null, saved = true): Promise<void> {
    if (saved) {
      const receipt = this.session.view().presentation;
      if (!receipt || receipt.response.revision !== response.revision)
        throw new Error('Saved action presentation receipt is missing.');
      this.session.finishPresentation(receipt.requestId);
    }
    this.skipped = false;
    this.presenting = true;
    // Player actions start at once and overlap; an enemy phase waits for every earlier one.
    const index = ++this.presentationIndex;
    const earlier = [...this.activePresentations].map(entry => entry.done);
    const generation = this.presentationGeneration;
    let cancel!: () => void;
    const cancelled = new Promise<false>(resolve => { cancel = () => resolve(false); });
    const entry: ActivePresentation = { index, cancel, done: Promise.resolve() };
    this.activePresentations.add(entry);
    const run = (async () => {
      let failure: unknown = null, completed = false;
      try {
        completed = await Promise.race([this.present(structuredClone(before), structuredClone(response),
          structuredClone(action), focusedTarget, index, earlier).then(() => true), cancelled]);
      } catch (error) { failure = error ?? new Error('Battle presentation failed.'); }
      this.activePresentations.delete(entry);
      if (this.disposed) return;
      if (failure !== null || completed && generation === this.presentationGeneration) this.settle(response, index);
      else if (!this.activePresentations.size) { this.presenting = false; this.activeReceipt = null; this.render(); }
      if (failure !== null) { this.report(failure); throw failure; }
    })();
    entry.done = run.catch(() => {});
    this.render();
    return run;
  }
  private async confirmExit(): Promise<void> {
    this.session.setSettings(true); this.render();
    let confirmed: boolean;
    try {
      const haul = this.session.view().haul;
      confirmed = await gameConfirm(haul > 0
        ? `Leave this encounter? Its unsaved Haul of ${haul.toLocaleString('en-US')} Prismatica is forfeited. Rewards saved from earlier encounters are kept. The current run will end.`
        : 'Leave this encounter? Rewards saved from earlier encounters are kept. The current run will end.',
      { title: 'Exit battle', confirmLabel: haul > 0 ? 'Exit · Forfeit Haul' : 'Exit · Keep saved rewards' });
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
    await this.remount(response.run);
  }
  /** Rebuilds the battle surface for a new or restarted encounter attempt. */
  private async remount(run: FrozenRadiantRun): Promise<void> {
    this.gestures.cancel(); this.cancelEffects(); this.artworkCleanup(); this.resultCelebration?.(); this.resultCelebration = null;
    this.displayed = radiantReadout(run.state); this.statuses = radiantStatusSnapshot(run.state);
    this.statusMarkup.clear(); this.shieldMarkup.clear(); this.resultKey = null; this.leaderMarkup = null;
    this.target = run.state.enemies.find(unit => unit.hp > 0)?.id ?? null;
    this.impactTarget = null; this.finalHaul = null; this.shownHaul = this.session.view().haul;
    this.shownCharge.clear(); this.settleLoot = null; this.lootPouring = false;
    this.appliedFrame = [this.presentationIndex, Number.MAX_SAFE_INTEGER];
    this.mount(run); this.render();
    await this.finishEntrance();
    const first = run.state.bearers.find(unit => unit.hp > 0)?.loadout.id ?? run.state.bearers[0].loadout.id;
    if (!this.disposed) this.element<HTMLElement>(`[data-radiant-actor="${first}"]`).focus();
  }
  private async present(before: RadiantCombatState, response: RadiantRunResponse, action: RadiantTurnAction,
    focusedTarget: string | null, index: number, earlier: Promise<void>[]): Promise<void> {
    if (this.disposed) return;
    const generation = this.presentationGeneration;
    const current = () => !this.disposed && !this.skipped && generation === this.presentationGeneration;
    const restoreScroll = this.revealBattlefield();
    this.presenting = true; this.skipped = false; this.activeReceipt = response; this.impactTarget = focusedTarget; this.render();
    const player = action.type === 'end-turn' ? null : action;
    try {
      const frames = radiantImpactFrames(before, response.run.state, response.events);
      if (restoreScroll) {
        await this.nextPresentationFrame();
        if (!current()) return;
      }
      if (!reducedMotion() && player) {
        const member = before.bearers.find(unit => unit.loadout.id === player.bearerId)!;
        const motion = characterChoreography[member.loadout.starter].motion;
        const poised = motion === 'cast' ? 'translateY(-4px)' : motion === 'bow' ? 'translateX(5px)' :
          motion === 'hammer' ? 'translate(-5px, -4px) rotate(3deg)' : motion === 'guard' ? 'translateX(-3px)' :
            motion === 'twin' ? 'translateX(-8px) rotate(-2deg)' : 'translateX(-12px)';
        await Promise.all([
          this.animate(this.element(`[data-radiant-art="${player.bearerId}"]`),
            [{ transform: 'none' }, { transform: poised }, { transform: 'none' }], 120),
          this.effects ? this.effects.windup(player, structuredClone(before)) :
            this.animate(this.element(`[data-radiant-art="${player.bearerId}"]`),
              [{ filter: 'brightness(1)' }, { filter: 'brightness(1.8)' }, { filter: 'brightness(1)' }], 200),
          this.flareCutin(player, before),
        ]);
      }
      const fx: Promise<void>[] = [], failures: unknown[] = [], played = new Set<number>();
      const track = (effect: Promise<void>) => { fx.push(effect.catch(error => { failures.push(error); })); };
      let shaken = false, enemyPhase = false;
      let previousActor: string | null = null;
      for (const [frameIndex, frame] of frames.entries()) {
        if (!current()) break;
        if (!enemyPhase && enemyPhaseFrame(frame)) {
          enemyPhase = true;
          // The enemy phase plays once the whole flurry and its drops have settled.
          await Promise.all([...earlier, ...fx]);
          if (!current()) break;
        }
        const actor = enemyActor(frame);
        if (actor && !reducedMotion()) {
          await this.enemyWindup(actor, actor !== previousActor);
          if (!current()) break;
        }
        previousActor = actor;
        const previous = frameIndex ? frames[frameIndex - 1].readout : radiantReadout(before);
        if (this.newer(index, frameIndex)) {
          this.displayed = structuredClone(frame.readout); this.statuses = structuredClone(frame.statuses);
        }
        // With motion, Prismatica reaches the Haul when its motes land.
        if (reducedMotion()) this.shownHaul += frame.events.reduce((sum, event) => sum + (event.type === 'currency' ? event.amount : 0), 0);
        this.render();
        if (!reducedMotion()) {
          const random = presentationRandom(`${response.revision}:${index}:${frameIndex}`);
          track(this.chargeOrbs(frame, previous, random));
          track(this.haulMotes(frame, random));
          track(this.damageNumbers(frame, before, random));
          for (const event of frame.events) if (event.type === 'defeated')
            track(this.lootDrops(response, played, event.targetId, random));
          const hit = frame.events.some(event => event.type === 'damage' && event.healthLoss + event.absorbed > 0);
          const defeat = frame.events.some(event => event.type === 'defeated');
          const flareHit = !enemyPhase && player?.type === 'flare';
          if (!shaken && hit && (flareHit || defeat || actor)) {
            shaken = true; track(this.shakeField(flareHit ? 10 : defeat ? 7 : 4));
          }
          await Promise.all([this.fieldImpact(frame), this.effects
            ? this.effects.impact(structuredClone(frame), enemyPhase ? null : player, structuredClone(before)) : this.impact(frame)]);
          if (actor) await this.pause(enemyRecoveryMs);
        }
      }
      if (!reducedMotion() && current()) {
        track(this.lootDrops(response, played, null, presentationRandom(`${response.revision}:${index}:end`)));
        await Promise.all(fx);
        if (failures.length) throw failures[0];
      }
    } catch (error) {
      if (this.disposed || generation !== this.presentationGeneration) return;
      throw error;
    } finally {
      restoreScroll?.();
    }
  }
  /** Marks the newest shown (action, frame); false if an overlapping newer frame is already shown. */
  private newer(index: number, frame: number): boolean {
    const [shownIndex, shownFrame] = this.appliedFrame;
    if (index < shownIndex || index === shownIndex && frame <= shownFrame) return false;
    this.appliedFrame = [index, frame];
    return true;
  }
  private settle(response: RadiantRunResponse, index = this.presentationIndex): void {
    const view = this.session.view();
    const idle = this.activePresentations.size === 0;
    if (idle) {
      // Once nothing else is presenting, show the live run (the saved run after a settle) exactly.
      const shown = view.run ?? response.run;
      this.displayed = radiantReadout(shown.state);
      this.statuses = radiantStatusSnapshot(shown.state);
      this.appliedFrame = [this.presentationIndex, Number.MAX_SAFE_INTEGER];
      this.shownHaul = this.targetHaul();
      this.activeReceipt = null; this.impactTarget = null;
    } else if (this.newer(index, Number.MAX_SAFE_INTEGER)) {
      this.displayed = radiantReadout(response.run.state);
      this.statuses = radiantStatusSnapshot(response.run.state);
    }
    this.presenting = !idle;
    this.presentationError = null;
    const receipt = view.presentation;
    if (receipt?.response.revision === response.revision) this.session.finishPresentation(receipt.requestId);
    const latest = this.session.view().run;
    if (latest) this.syncTarget(latest);
    this.render();
    if (idle) void this.revealSavedResult();
  }
  /** After the authority save only: the saved materials pour from the defeated enemies,
   * then the results celebrate. Skippable; static (no pour) under Reduce motion. */
  private async revealSavedResult(): Promise<void> {
    const loot = this.settleLoot, saved = this.session.view().saved.run;
    const terminal = !!saved && (saved.quit || saved.state.phase === 'victory' || saved.state.phase === 'defeat');
    if (loot && terminal && !this.lootPouring && !this.disposed) {
      this.settleLoot = null;
      if (!reducedMotion() && loot.rewards.some(reward => reward.kind === 'reward')) {
        this.lootPouring = true; this.skipped = false; this.render();
        try { await this.lootDrops(loot, new Set(), null, presentationRandom(`${loot.revision}:settle`)); }
        catch (error) { this.report(error); }
        finally { this.lootPouring = false; }
        if (this.disposed) return;
        this.render();
      }
    }
    if (!this.disposed) this.focusTerminalResult();
  }
  private focusTerminalResult(): void {
    const run = this.session.view().saved.run;
    const results = this.element<HTMLElement>('[data-radiant-results]');
    if (run && !results.hidden) {
      const heading = this.element<HTMLElement>('[data-radiant-result-heading]');
      heading.focus();
      // Once per saved result, and only after a live presentation settles: never on
      // dismiss/reopen, Settings close or a restored terminal checkpoint.
      const sheet = results.querySelector<HTMLElement>('.radiant-results');
      if (sheet && this.resultKey && this.celebratedKey !== this.resultKey) {
        this.celebratedKey = this.resultKey;
        this.resultCelebration?.();
        const outcome = radiantOutcome(run);
        let celebration: (() => void) | null = null;
        const stopIntro = radiantResultIntro(results, outcome, () => { celebration = celebrateRadiantResults(sheet, outcome); });
        this.resultCelebration = () => { stopIntro(); celebration?.(); };
      }
    }
  }
  skip(): void {
    if (this.lootPouring) { this.cancelEffects(); return; }
    if (!this.presenting) return;
    this.skipped = true; this.presentationGeneration++; this.cancelEffects();
    for (const entry of [...this.activePresentations]) entry.cancel();
    this.activePresentations.clear();
    const view = this.session.view(), latest = view.run;
    if (latest) {
      this.displayed = radiantReadout(latest.state);
      this.statuses = radiantStatusSnapshot(latest.state);
      this.appliedFrame = [this.presentationIndex, Number.MAX_SAFE_INTEGER];
      this.shownHaul = this.targetHaul();
      this.presenting = false; this.activeReceipt = null; this.impactTarget = null; this.presentationError = null;
      this.syncTarget(latest);
      // Skip goes straight to the saved results: no material pour.
      this.settleLoot = null;
      this.render();
      void this.revealSavedResult();
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
  /** Paces enemy turns: a short beat before a new attacker, then a readable
   * anticipation pull-back and lunge toward the squad before the impact. */
  private async enemyWindup(enemyId: string, newAttacker: boolean): Promise<void> {
    const art = this.host.querySelector<HTMLElement>(`[data-radiant-art="${enemyId}"]`);
    if (newAttacker) await this.pause(enemyLeadInMs);
    if (!art) return;
    await this.animate(art, [
      { transform: 'none', filter: 'brightness(1)' },
      { transform: 'translateX(10px) scale(.97)', filter: 'brightness(1.25)', offset: .45 },
      { transform: 'translateX(-22px) scale(1.04)', filter: 'brightness(1.4)', offset: .85 },
      { transform: 'none', filter: 'brightness(1)' },
    ], enemyWindupMs, { easing: 'cubic-bezier(.4,0,.2,1)' });
  }
  private pause(duration: number): Promise<void> {
    return this.animate(this.element('.radiant-field'), [], duration);
  }
  private speed = (): void => {
    for (const animation of this.animations) animation.playbackRate = battleSpeed();
    this.renderSpeed();
  };
  /** Cycles 1x → 2x → 3x. The Settings control owns persistence when it is mounted (main.ts). */
  private cycleSpeed(): void {
    const next = battleSpeeds[(battleSpeeds.indexOf(battleSpeed()) + 1) % battleSpeeds.length];
    const control = this.host.ownerDocument.querySelector<HTMLSelectElement>('#battle-speed');
    if (control) { control.value = String(next); control.dispatchEvent(new Event('change', { bubbles: true })); }
    else applyBattleSpeed(next);
    this.renderSpeed();
  }
  private renderSpeed(): void {
    const button = this.host.querySelector<HTMLButtonElement>('[data-radiant-speed]');
    if (!button) return;
    const speed = battleSpeed(), next = battleSpeeds[(battleSpeeds.indexOf(speed) + 1) % battleSpeeds.length];
    const label = `${speed}x`;
    if (button.textContent !== label) button.textContent = label;
    button.setAttribute('aria-label', `Battle speed ${speed}x. Activate for ${next}x.`);
  }
  /** Finite electrified crackle on a gauge that just gained Luminosity; static under Reduce motion. */
  private surge(energy: HTMLElement): void {
    if (reducedMotion()) return;
    energy.classList.remove('is-surging');
    void energy.offsetWidth;
    energy.classList.add('is-surging');
    const end = (event: AnimationEvent) => {
      if (event.target !== energy || event.animationName !== 'radiant-gauge-surge') return;
      energy.classList.remove('is-surging'); energy.removeEventListener('animationend', end);
    };
    energy.addEventListener('animationend', end);
  }
  private cancelEffects(): void {
    this.effectsEpoch++;
    this.numberStacks.clear();
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
  /** A finite mote that pops from `start`, then arcs into `end` (screen coordinates). */
  private arcFlight(className: string, start: { x: number; y: number }, end: { x: number; y: number },
    color: string, duration: number, delay: number, random: () => number): Promise<void> {
    const orb = this.spawn(className, start.x, start.y);
    orb.style.setProperty('--orb', color);
    const pop = { x: (random() - .5) * 120, y: -40 - random() * 70 };
    const dx = end.x - start.x, dy = end.y - start.y;
    const lift = Math.min(-80, dy * .25 - 110 - random() * 60);
    const at = (t: number) => {
      const cx = (pop.x + dx) / 2, cy = lift, u = 1 - t;
      return { x: u * u * pop.x + 2 * u * t * cx + t * t * dx, y: u * u * pop.y + 2 * u * t * cy + t * t * dy };
    };
    const point = (t: number, scale: number) => { const p = at(t); return `translate(${p.x}px, ${p.y}px) scale(${scale})`; };
    return this.animate(orb, [
      { offset: 0, opacity: 0, transform: 'translate(0, 0) scale(.2)', easing: 'cubic-bezier(.2,.9,.3,1)' },
      { offset: .2, opacity: 1, transform: `translate(${pop.x}px, ${pop.y}px) scale(1.2)`, easing: 'ease-in-out' },
      { offset: .3, opacity: 1, transform: `translate(${pop.x}px, ${pop.y + 6}px) scale(1)`, easing: 'cubic-bezier(.55,0,.85,.4)' },
      { offset: .6, opacity: 1, transform: point(.35, .95), easing: 'linear' },
      { offset: .8, opacity: 1, transform: point(.72, .8), easing: 'linear' },
      { offset: 1, opacity: .2, transform: point(1, .45) },
    ], duration, { easing: 'linear', delay }).finally(() => orb.dispatchEvent(new Event('radiant-fx-done')));
  }
  /** Presentation-only orbs follow the saved enemy drop and charge deltas. */
  private async chargeOrbs(frame: RadiantImpactFrame, previous: RadiantReadout, random: () => number): Promise<void> {
    const run = this.session.view().run!;
    const enemies = new Set(run.state.enemies.map(unit => unit.id));
    const sources = [...new Set(frame.events.flatMap(event =>
      event.type === 'damage' && enemies.has(event.targetId) && event.healthLoss + event.absorbed > 0 ? [event.targetId] : []))];
    const flights: Promise<void>[] = [];
    const flight = 720, step = 50;
    const fly = (from: Element, to: Element, color: string, count: number, pulse: Element) => {
      const end = centre(to);
      for (let index = 0; index < count; index++)
        flights.push(this.arcFlight('radiant-orb', centre(from, random), end, color, flight, index * step + random() * 40, random));
      flights.push(this.animate(pulse, [{ filter: 'brightness(1)' }, { filter: 'brightness(2.1) saturate(1.4)', offset: .3 }, { filter: 'brightness(1)' }],
        420, { delay: flight * .85 + count * step }));
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
        node.innerHTML = `${art ? `<img src="${escape(art)}" alt="" decoding="async">` : '<i></i>'}<b>×${formatStat(item.amount)}</b>`;
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
  /** Prismatica motes arc from the struck enemy into the Haul; each landing adds its exact share. */
  private haulMotes(frame: RadiantImpactFrame, random: () => number): Promise<void> {
    const target = this.host.querySelector('[data-radiant-haul-amount]');
    const flights: Promise<void>[] = [], epoch = this.effectsEpoch;
    for (const event of frame.events) {
      if (event.type !== 'currency' || event.amount <= 0) continue;
      const source = this.host.querySelector(`[data-radiant-art="${event.enemyId}"]`);
      if (!target || !source) { this.shownHaul += event.amount; continue; }
      const count = Math.min(6, Math.max(2, Math.ceil(Math.log10(event.amount + 1) * 2)));
      const share = Math.floor(event.amount / count), end = centre(target);
      for (let mote = 0; mote < count; mote++) {
        const part = mote === count - 1 ? event.amount - share * (count - 1) : share;
        flights.push(this.arcFlight('radiant-orb radiant-prism-mote', centre(source, random), end, '#ffffff', 760,
          mote * 45 + random() * 40, random).finally(() => {
          if (this.disposed || epoch !== this.effectsEpoch) return;
          this.shownHaul += part; this.render();
        }));
      }
    }
    return Promise.all(flights).then(() => {});
  }
  /** Stacking damage/heal/Shield numbers with Weakness flair; exact values, finite, aria-hidden. */
  private damageNumbers(frame: RadiantImpactFrame, state: RadiantCombatState, random: () => number): Promise<void> {
    const floats: Promise<void>[] = [];
    const bearerElement = (id: string) => {
      const unit = state.bearers.find(member => member.loadout.id === id);
      return unit ? radiantBearerKits[unit.loadout.starter].elementId : null;
    };
    const enemyElement = (id: string) => state.enemies.find(enemy => enemy.id === id)?.elementId ?? null;
    const enemies = new Set(state.enemies.map(enemy => enemy.id));
    const show = (targetId: string, text: string, kind: string, tag?: string) => {
      const anchor = this.host.querySelector(`[data-radiant-art="${targetId}"]`);
      if (!anchor) return;
      const box = anchor.getBoundingClientRect();
      const stack = this.numberStacks.get(targetId) ?? 0;
      this.numberStacks.set(targetId, stack + 1);
      const node = this.spawn(`radiant-number is-${kind}`, box.left + box.width / 2 + (random() - .5) * box.width * .3,
        box.top + box.height * .32 - (stack % 5) * 22);
      node.innerHTML = `${tag ? `<small>${escape(tag)}</small>` : ''}<b>${escape(text)}</b>`;
      floats.push(this.animate(node, [
        { opacity: 0, transform: 'translate(-50%, 8px) scale(.6)', easing: 'cubic-bezier(.2,.9,.3,1.3)' },
        { opacity: 1, transform: 'translate(-50%, -10px) scale(1.2)', offset: .14, easing: 'ease-out' },
        { opacity: 1, transform: 'translate(-50%, -16px) scale(1)', offset: .3, easing: 'linear' },
        { opacity: 1, transform: 'translate(-50%, -30px) scale(1)', offset: .78, easing: 'ease-in' },
        { opacity: 0, transform: 'translate(-50%, -44px) scale(.92)' },
      ], kind === 'weak' ? 1000 : 860, { easing: 'linear' }).finally(() => {
        const left = (this.numberStacks.get(targetId) ?? 1) - 1;
        if (left > 0) this.numberStacks.set(targetId, left); else this.numberStacks.delete(targetId);
        node.dispatchEvent(new Event('radiant-fx-done'));
      }));
    };
    for (const event of frame.events) {
      if (event.type === 'damage') {
        const attacker = event.source.kind === 'enemy' ? enemyElement(event.source.enemyId) : bearerElement(event.source.bearerId);
        const defender = enemies.has(event.targetId) ? enemyElement(event.targetId) : bearerElement(event.targetId);
        const weak = event.origin === 'direct' && elementDamageMultiplier(attacker, defender) > 1;
        if (event.healthLoss > 0) show(event.targetId, amountText(event.healthLoss),
          !enemies.has(event.targetId) ? 'hurt' : event.origin === 'periodic' ? 'periodic' : weak ? 'weak' : 'damage',
          weak ? 'Weakness' : undefined);
        if (event.absorbed > 0) show(event.targetId, `Shield −${amountText(event.absorbed)}`, 'absorb');
      } else if (event.type === 'heal' && event.effective > 0) show(event.targetId, `+${amountText(event.effective)}`, 'heal');
      else if (event.type === 'shield' && event.amount > 0) show(event.targetId, `Shield +${amountText(event.amount)}`, 'shield');
    }
    return Promise.all(floats).then(() => {});
  }
  /** Flare cut-in during the windup: the bearer's portrait, tier and Flare name. */
  private async flareCutin(action: RadiantPlayerAction, before: RadiantCombatState): Promise<void> {
    if (action.type !== 'flare' || reducedMotion() || this.disposed) return;
    const tier = readyFlare(before.gauge, action.bearerId);
    const member = before.bearers.find(unit => unit.loadout.id === action.bearerId);
    if (!tier || !member) return;
    const card = this.host.querySelector<HTMLElement>(`[data-radiant-unit="${action.bearerId}"]`);
    const color = (card && getComputedStyle(card).getPropertyValue('--accent').trim()) || '#ffffff';
    const panel = radiantFlareCutin({ name: characterName(member.loadout.starter, member.loadout.form),
      flare: radiantFlares[member.loadout.starter][tier].name, tier, tierLabel: tierNames[tier],
      art: radiantAllyArt(member.loadout), color });
    this.fxLayer().append(panel);
    const cleanup = () => panel.remove();
    this.effectsCleanup.add(cleanup);
    try {
      await this.animate(panel, [
        // Linear overall timing; each segment eases itself so the hold stays fully opaque.
        { opacity: 0, transform: 'translateX(-14%) skewX(-8deg)', easing: 'cubic-bezier(.2,.8,.2,1)' },
        { opacity: 1, transform: 'translateX(0) skewX(0deg)', offset: .16, easing: 'linear' },
        { opacity: 1, transform: 'translateX(2%) skewX(0deg)', offset: .82, easing: 'cubic-bezier(.6,0,.9,.4)' },
        { opacity: 0, transform: 'translateX(12%) skewX(6deg)' },
      ], tier === 'ultimate' ? 1100 : 820, { easing: 'linear' });
    } finally { cleanup(); this.effectsCleanup.delete(cleanup); }
  }
  private shakeField(amplitude: number): Promise<void> {
    const a = amplitude;
    return this.animate(this.element('.radiant-field'), [
      { transform: 'translate(0, 0)' }, { transform: `translate(${-a}px, ${a * .5}px)` }, { transform: `translate(${a * .8}px, ${-a * .4}px)` },
      { transform: `translate(${-a * .5}px, ${a * .3}px)` }, { transform: `translate(${a * .25}px, 0)` }, { transform: 'translate(0, 0)' },
    ], 420, { easing: 'cubic-bezier(.3,.7,.4,1)' });
  }
  private async fieldImpact(frame: RadiantImpactFrame): Promise<void> {
    const hits = new Map<string, { enemy: boolean; defeated: boolean }>();
    const run = this.session.view().run!;
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
    this.disposed = true; this.actionQueue.length = 0; this.queuedActionActors.clear(); this.cancelEffects();
    for (const entry of [...this.activePresentations]) entry.cancel();
    this.activePresentations.clear();
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
