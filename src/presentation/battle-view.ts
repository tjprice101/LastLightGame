import { actionIds, enemies, formatStat, isActionId, shatterGauge, type ActionId } from '../content/combat';
import { getStarter, isStarterId, type StarterId } from '../content/starters';
import { actAndAdvanceTurn, advanceUnavailableTurns, teamCanAct, actionUnavailable, createBattle, createDungeonBattle, createInfusionBattle, endTurn, nextStage, nextWave, type BattleState, type BattleEvent, type BattleResult, type Combatant } from '../game/battle';
import { type CharacterProgress } from '../content/progression';
import { dungeonEncounter, type PlayableDungeon } from '../content/dungeons';
import { commands, type Bindings, type Command } from '../game/hotkeys';
import { attackFlair, attackEffectMarkup } from './battle-effects';
import './battle-cinematic.css';
import { battleResults } from './battle-results';
import './battle-results.css';
import { portraitCue, portraitCutin } from './battle-cutin';
import './battle-cutin.css';
import './battle-ui.css';
import './battle-focus.css';
import { assetUrl } from './portrait';
import { reducedMotion } from './settings';
import { battleSpeed } from './battle-speed';
import { abilityIcon } from './ability-icon';
import { dragAction } from './battle-gesture';
import { characterArt } from '../content/character-art';
import { elementalDungeonRules, dungeonStageCount } from '../content/activities';
import { unitFacingAttributes } from './unit-facing';
import { gestureGuide, updateGestureGuide } from './gesture-guide';
import { unitReadout } from './unit-readout';
import { healthAfterEvent, healthSnapshot, impactEvents } from './battle-health';
import { characterRole } from './character-role';
import { activityTransitionPending, transitionActivity, waitForActivityTransition } from './activity-transition';
import { entranceFrames } from './battle-entrance';
import { infusionEncounter } from '../content/infusions';
import { battleArtScale } from './battle-scale';
import { lootBurst } from './battle-loot';
import { type InfusionModeId } from '../content/activities';

export interface BattleSession { state: BattleState; log: string[]; runId: string; progress: CharacterProgress; teamProgress?: Partial<Record<StarterId, CharacterProgress>>; stageEvents: BattleEvent[]; entrancePending?: boolean; resultsVisible?: boolean }
export function createSession(starterId: StarterId, progress: CharacterProgress = { level: 0, evolution: 1 }, dungeon?: { element: PlayableDungeon; stage: number } | { mode: InfusionModeId; stage: number },
  team?: { ids: readonly StarterId[]; progress: Partial<Record<StarterId, CharacterProgress>> }): BattleSession {
  const seed = crypto.getRandomValues(new Uint32Array(1))[0] || 1;
  const ids = team?.ids ?? [starterId];
  const teamProgress = structuredClone(team?.progress ?? { [starterId]: progress });
  for (const id of ids) if (!teamProgress[id]) throw new Error('Squad character progress is missing.');
  return {
    state: dungeon ? 'mode' in dungeon ? createInfusionBattle(dungeon.mode, dungeon.stage, seed, starterId, progress, ids, teamProgress)
      : createDungeonBattle(dungeon.element, dungeon.stage, seed, starterId, progress, ids, teamProgress) : createBattle(seed, ids, teamProgress),
    runId: crypto.randomUUID(), progress: { ...progress }, teamProgress, stageEvents: [], entrancePending: true,
    log: [dungeon ? 'Dungeon ready. Defeated enemies grant level-scaled Fractalis and materials.' : 'Squad Adventure ready at wave 1. Fractalis drops increase with enemy level.'],
  };
}

function definition(unit: Combatant): { art: string | null; color: string } {
  if (unit.side === 'ally' && isStarterId(unit.definitionId)) {
    return { art: characterArt(unit.definitionId, unit.evolution ?? 1).art, color: getStarter(unit.definitionId).color };
  }
  if (unit.color) return { art: unit.art ?? null, color: unit.color };
  if (unit.definitionId === 'goblin' || unit.definitionId === 'imp' || unit.definitionId === 'golem') {
    return { art: enemies[unit.definitionId].art, color: '#c2b9a0' };
  }
  throw new Error('Unknown combatant art definition.');
}

export class BattleView {
  private actorId = 'ember';
  private targetId = '';
  private busy = false;
  private disposed = false;
  private dragging = false;
  private displayedHealth = new Map<string, number>();
  private animations = new Set<Animation>();
  private motion = matchMedia('(prefers-reduced-motion: reduce)');
  private onSpeed = (): void => {
    for (const animation of this.animations) animation.updatePlaybackRate(battleSpeed());
  };
  private onMotion = (): void => {
    if (reducedMotion()) for (const animation of this.animations) animation.cancel();
  };

  constructor(private host: HTMLElement, private session: BattleSession, private bindings: Bindings,
    private commitRewards: (result: BattleResult) => void, private quit?: () => Promise<void>) {
    this.targetId = session.state.enemies.find((enemy) => enemy.hp > 0)?.id ?? '';
    this.actorId = session.state.allies[0]?.id ?? '';
    this.render();
    document.addEventListener('keydown', this.onKey);
    this.motion.addEventListener('change', this.onMotion);
    window.addEventListener('last-light-motion-change', this.onMotion);
    window.addEventListener('last-light-battle-speed-change', this.onSpeed);
    if (session.entrancePending) void this.enterEncounter();
    else {
      this.focusResults();
      queueMicrotask(() => this.advanceIdleTurn());
    }
  }

  private advanceIdleTurn(): void {
    if (this.busy || this.disposed || this.session.state.phase !== 'player' || teamCanAct(this.session.state)) return;
    try {
      const result = advanceUnavailableTurns(this.session.state);
      this.commitRewards(result);
      void this.present(result);
    } catch (error) {
      console.error('Automatic turn advancement failed', error);
      this.error(error instanceof Error ? error.message : 'The turn could not advance. Combat state is preserved.');
    }
  }

  private async enterEncounter(): Promise<void> {
    this.busy = true;
    this.host.setAttribute('aria-busy', 'true');
    this.host.classList.add('battle-entering');
    this.host.querySelectorAll<HTMLButtonElement>('button').forEach((button) => { button.disabled = true; });
    const announcement = this.host.querySelector('#battle-announcement');
    if (announcement) announcement.textContent = 'Combatants are taking their positions...';
    try {
      await waitForActivityTransition();
      if (this.disposed) return;
      const units = Array.from(this.host.querySelectorAll<HTMLElement>('.battle-unit'));
      const frames = units.map((unit) => entranceFrames(unit.dataset.side ?? '', unit.getBoundingClientRect(), innerWidth));
      if (!reducedMotion()) {
        // Start all animations before removing the pre-entry hiding class.
        const animations = units.map((unit, index) => this.play(unit, frames[index], 650 + index * 70));
        this.host.classList.remove('battle-entering');
        await Promise.all(animations);
      }
      if (!this.disposed) this.session.entrancePending = false;
    } catch (error) {
      console.error('Battle entrance failed; encounter state is preserved', error);
      if (!this.disposed) {
        this.session.entrancePending = false;
        this.busy = false;
        this.render();
        this.error('The activity entrance could not finish. Encounter state is preserved; you can continue.');
      }
      return;
    } finally {
      this.host.classList.remove('battle-entering');
      this.busy = false;
      this.host.setAttribute('aria-busy', 'false');
    }
    if (!this.disposed) {
      this.render();
      this.host.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true });
      this.advanceIdleTurn();
    }
  }

  destroy(): void {
    this.disposed = true;
    this.dragging = false;
    document.removeEventListener('keydown', this.onKey);
    this.motion.removeEventListener('change', this.onMotion);
    window.removeEventListener('last-light-motion-change', this.onMotion);
    window.removeEventListener('last-light-battle-speed-change', this.onSpeed);
    for (const animation of this.animations) animation.cancel();
    this.animations.clear();
    this.host.querySelector<HTMLDialogElement>('#battle-menu')?.close();
    this.host.querySelectorAll('.battle-turn-cue,.portrait-cutin').forEach((cue) => cue.remove());
  }

  private onKey = (event: KeyboardEvent): void => {
    if (activityTransitionPending() || this.busy || this.disposed || this.dragging || this.session.state.phase !== 'player' || event.repeat || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return;
    if (event.target instanceof Element && event.target.closest('input,select,textarea,[contenteditable="true"]')) return;
    if (this.host.querySelector<HTMLDialogElement>('#battle-menu')?.open) return;
    const command = commands.find(([id]) => this.bindings[id] === event.code)?.[0];
    if (!command) return;
    event.preventDefault();
    this.command(command);
  };

  private command(command: Command | ActionId | 'endTurn'): void {
    if (activityTransitionPending() || this.busy || this.disposed || this.dragging) return;
    if (command === 'nextAlly' || command === 'nextTarget') {
      const allies = command === 'nextAlly';
      const list = (allies ? this.session.state.allies : this.session.state.enemies).filter((unit) => unit.hp > 0);
      if (!list.length) return;
      const current = allies ? this.actorId : this.targetId;
      const next = list[(list.findIndex((unit) => unit.id === current) + 1) % list.length];
      if (allies) this.actorId = next.id;
      else this.targetId = next.id;
      this.render();
      this.host.querySelector<HTMLButtonElement>(`[data-unit="${next.id}"]`)?.focus();
      return;
    }
    try {
      const state = this.session.state;
      let result: BattleResult;
      if (command === 'endTurn') {
        if (state.phase === 'cleared' && (state.dungeon || state.infusion)) {
          result = nextStage(state, this.session.teamProgress ?? this.session.progress);
        } else {
          result = state.phase === 'cleared' ? nextWave(state) : endTurn(state);
          const advanced = advanceUnavailableTurns(result.state);
          result = { state: advanced.state, events: [...result.events, ...advanced.events] };
        }
      } else {
        result = actAndAdvanceTurn(state, this.actorId, command, this.targetId);
      }
      this.commitRewards(result);
      if (result.state.wave !== state.wave) {
        void transitionActivity(() => {
          if (!this.disposed) return this.present(result, true);
        }).catch((error: unknown) => {
          console.error('Encounter transition failed', error);
          if (!this.disposed) this.error(error instanceof Error ? error.message : 'Encounter transition failed.');
        });
      } else void this.present(result);
    } catch (error) {
      console.error('Adventure action rejected', error);
      this.error(error instanceof Error ? error.message : 'Battle action failed.');
    }
  }

  private error(message: string): void {
    const status = this.host.querySelector('#battle-error');
    if (!status) throw new Error('Battle status region is missing.');
    status.textContent = message;
  }

  private async present(result: BattleResult, entrance = false): Promise<void> {
    this.busy = true;
    this.host.setAttribute('aria-busy', 'true');
    this.displayedHealth = healthSnapshot([...this.session.state.allies, ...this.session.state.enemies]);
    const turnEnded = result.state.round > this.session.state.round && result.state.wave === this.session.state.wave;
    if (result.state.wave !== this.session.state.wave) this.session.stageEvents = [];
    this.session.stageEvents.push(...result.events);
    if (result.state.phase !== 'player') this.session.resultsVisible = true;
    this.session.state = result.state;
    this.session.log.push(...result.events.map((entry) => entry.message));
    this.session.log = this.session.log.slice(-40);
    if (entrance) {
      this.session.entrancePending = true;
      this.render();
      void this.enterEncounter();
      return;
    }
    this.host.querySelectorAll<HTMLButtonElement>('button').forEach((button) => { button.disabled = true; });
    this.host.querySelectorAll('.ultimate-ready').forEach((unit) => unit.classList.remove('ultimate-ready'));
    try {
      {
        const presented = new Set<number>();
        let enemyCueShown = false;
        for (let index = 0; index < result.events.length; index++) {
          if (this.disposed) break;
          if (presented.has(index)) continue;
          const entry = result.events[index];
          if (entry.kind === 'turn') enemyCueShown = false;
          if (!enemyCueShown && entry.kind === 'attack' && this.session.state.enemies.some((enemy) => enemy.id === entry.source)) {
            this.showTurnCue('Enemy turn');
            enemyCueShown = true;
          }
          if (reducedMotion() && entry.kind !== 'reward') continue;
          const impacts = entry.kind === 'attack' ? impactEvents(result.events, index) : [];
          await this.animate(entry, async () => {
            await Promise.all(impacts.map((impact) => {
              presented.add(impact);
              return this.animate(result.events[impact]);
            }));
          });
        }
      }
    } catch (error) {
      console.error('Battle animation failed; resolved combat state is preserved', error);
      if (!this.disposed) {
        this.busy = false;
        this.render();
        this.error('The attack animation failed. Combat results are preserved; you can continue.');
        this.focusResults();
        return;
      }
    } finally {
      this.busy = false;
      this.host.setAttribute('aria-busy', 'false');
    }
    if (!this.disposed) {
      this.render();
      if (this.session.state.phase !== 'player') this.focusResults();
      else {
        this.host.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true });
        if (turnEnded) this.showTurnCue(`Your turn / Turn ${this.session.state.round}`);
      }
    }

  }

  private focusResults(): void {
    const heading = this.host.querySelector<HTMLElement>('#battle-result-heading');
    if (!heading) return;
    heading.focus({ preventScroll: true });
    heading.closest('.battle-results')?.scrollIntoView({ block: 'end', behavior: 'instant' });
  }

  private showTurnCue(message: string): void {
    this.host.querySelector('.battle-turn-cue')?.remove();
    const cue = document.createElement('div');
    cue.className = 'battle-turn-cue';
    cue.setAttribute('role', 'status');
    cue.textContent = message;
    this.host.append(cue);
    void this.play(cue, reducedMotion() ? [{ opacity: 1 }, { opacity: 1 }] : [
      { opacity: 0, transform: 'translateY(-8px)' },
      { opacity: 1, transform: 'translateY(0)', offset: .15 },
      { opacity: 1, offset: .75 },
      { opacity: 0, transform: 'translateY(-4px)' },
    ], 1100).catch((error: unknown) => {
      console.error('Turn indicator failed', error);
      if (!this.disposed) this.error('The turn indicator could not display. Combat results are unchanged.');
    }).finally(() => cue.remove());
  }

  private async play(element: Element, frames: Keyframe[], duration: number): Promise<void> {
    const animation = element.animate(frames, { duration, easing: 'ease-out' });
    animation.playbackRate = battleSpeed();
    this.animations.add(animation);
    try {
      await animation.finished;
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) throw error;
    } finally {
      this.animations.delete(animation);
      animation.cancel();
    }
  }

  private async animate(entry: BattleEvent, impact: () => Promise<void> = async () => {}): Promise<void> {
    const source = this.host.querySelector<HTMLElement>(`[data-unit="${entry.source}"]`);
    const target = this.host.querySelector<HTMLElement>(`[data-unit="${entry.target}"]`);
    if (entry.kind === 'reward') {
      if (!source) throw new Error('Defeated enemy loot anchor is missing.');
      const art = source.querySelector<HTMLElement>('.battle-art');
      if (!art) throw new Error('Defeated enemy artwork is missing.');
      const bounds = art.getBoundingClientRect();
      const burst = lootBurst(entry);
      const spread = burst.childElementCount * 38 / 2 + 24;
      burst.style.left = `${Math.max(Math.min(spread, innerWidth / 2), Math.min(innerWidth - spread, bounds.x + bounds.width / 2))}px`;
      burst.style.top = `${Math.min(innerHeight - 45, bounds.y + bounds.height * .8)}px`;
      try {
        if (!reducedMotion()) await this.play(art, [{ opacity: 1 }, { opacity: 0, transform: 'translateY(-10px) scale(.95)' }], 280);
        if (this.disposed) return;
        source.classList.add('fallen');
        this.host.append(burst);
        if (reducedMotion()) await this.play(burst, [{ opacity: 1 }, { opacity: 1 }], 650);
        else await Promise.all(Array.from(burst.children).map(async (drop) => {
          if (!(drop instanceof HTMLElement)) throw new Error('Loot stack element is invalid.');
          const duration = Number(drop.dataset.pickupDuration);
          if (!Number.isInteger(duration) || duration < 850 || duration >= 1850) throw new Error('Loot pickup duration is invalid.');
          await this.play(drop, [{ opacity: 0, transform: 'translateY(-15px) scale(.5)' },
            { opacity: 1, transform: 'translateY(0) scale(1.1)', offset: .16 },
            { opacity: 1, transform: 'translateY(0) scale(1)', offset: .78 },
            { opacity: 0, transform: 'translateY(-70px) scale(.35)' }], duration);
          drop.style.opacity = '0';
        }));
      } finally { burst.remove(); }
    } else if (entry.kind === 'attack' && source && target) {
      const sprite = source.querySelector('.battle-sprite');
      if (!sprite) throw new Error('Battle sprite is missing.');
      const from = source.getBoundingClientRect();
      const to = target.getBoundingClientRect();
      const distance = Math.max(-170, Math.min(170, to.x - from.x));
      const vertical = Math.max(-80, Math.min(80, to.y - from.y));
      const combatant = [...this.session.state.allies, ...this.session.state.enemies].find((unit) => unit.id === entry.source);
      if (!combatant) throw new Error('Attack effect combatant is missing.');
      const cue = portraitCue(combatant, entry);
      if (cue && !reducedMotion()) {
        const visual = definition(combatant);
        const panel = portraitCutin(combatant, cue, visual.art, visual.color);
        this.host.append(panel);
        try {
          const direction = combatant.side === 'ally' ? 1 : -1;
          await this.play(panel, [
            { opacity: 0, transform: `translateX(${direction * 65}%) scale(.92)` },
            { opacity: 1, transform: 'translateX(0) scale(1)', offset: .12 },
            { opacity: 1, transform: 'translateX(0) scale(1)', offset: .9 },
            { opacity: 0, transform: 'translateX(0) scale(1)' },
          ], cue.duration);
        } finally { panel.remove(); }
        if (this.disposed || reducedMotion()) return;
      }
      const flair = attackFlair(combatant, entry.action, entry.enhancedAttack);
      const ultimate = entry.action === 'ultimate';
      const support = entry.source === entry.target;
      const color = source.style.getPropertyValue('--element');
      const sourceArt = source.querySelector('.battle-art')?.getBoundingClientRect();
      const targetArt = target.querySelector('.battle-art')?.getBoundingClientRect();
      if (!sourceArt || !targetArt) throw new Error('Cinematic attack anchors are missing.');
      const effect = document.createElement('span');
      effect.className = `attack-effect cinematic-impact flair-${flair.family} action-${entry.action}`;
      effect.innerHTML = attackEffectMarkup(flair);
      effect.dataset.power = String(flair.power);
      effect.setAttribute('aria-hidden', 'true');
      effect.style.setProperty('--element', color);
      effect.style.setProperty('--flair-duration', `${flair.duration}ms`);
      effect.style.opacity = '0';
      target.querySelector('.battle-art')?.append(effect);
      const trail = document.createElement('span');
      trail.className = `cinematic-trail flair-${flair.family}`;
      trail.setAttribute('aria-hidden', 'true');
      trail.style.setProperty('--element', color);
      const dx = targetArt.x + targetArt.width / 2 - sourceArt.x - sourceArt.width / 2;
      const dy = targetArt.y + targetArt.height / 2 - sourceArt.y - sourceArt.height / 2;
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      trail.style.left = `${sourceArt.x + sourceArt.width / 2}px`;
      trail.style.top = `${sourceArt.y + sourceArt.height / 2}px`;
      trail.style.width = `${Math.hypot(dx, dy)}px`;
      trail.style.opacity = '0';
      if (!support) this.host.append(trail);
      const label = this.host.querySelector('#battle-announcement');
      if (label) label.textContent = entry.message;
      try {
        const pose = support ? 'translateY(-12px) scale(1.08)' : `translate(${distance}px,${vertical}px) rotate(${entry.source === 'sprout' ? -5 : 5}deg) scale(${ultimate ? 1.12 : 1.04})`;
        await this.play(sprite, [
          { transform: 'translate(0,0) scale(1)' },
          { transform: pose },
        ], ultimate ? 360 : 180);
        if (this.disposed || reducedMotion()) return;
        effect.style.opacity = '1';
        effect.classList.add('effect-active');
        await Promise.all([
          this.play(sprite, [
            { transform: pose },
            { transform: 'translate(0,0) scale(1)' },
          ], ultimate ? 440 : 240),
          this.play(effect, [
            { opacity: 0, transform: 'scale(.35) rotate(-15deg)' },
            { opacity: .85, transform: `scale(${flair.size}) rotate(0deg)`, offset: .25 },
            { opacity: 0, transform: `scale(${flair.size * 1.35}) rotate(35deg)` },
          ], flair.duration),
          ...(support ? [] : [this.play(trail, [
            { opacity: 0, transform: `rotate(${angle}deg) scaleX(.05)` },
            { opacity: .75, transform: `rotate(${angle}deg) scaleX(1)`, offset: .35 },
            { opacity: 0, transform: `rotate(${angle}deg) scaleX(1)` },
          ], flair.duration)]),
          impact(),
        ]);
      } finally { effect.remove(); trail.remove(); }
    } else if ((entry.kind === 'damage' || entry.kind === 'heal' || entry.kind === 'shield') && target) {
      {
        const unit = [...this.session.state.allies, ...this.session.state.enemies].find((unit) => unit.id === entry.target);
        const hp = this.displayedHealth.get(entry.target);
        if (!unit || hp === undefined) throw new Error('Animated health snapshot is missing.');
        const next = healthAfterEvent(hp, unit.stats.health, entry);
        this.displayedHealth.set(entry.target, next);
        const bar = target.querySelector<HTMLElement>('.health-track > span');
        const label = target.querySelector('.unit-health');
        if (!bar || !label) throw new Error('Animated health readout is missing.');
        bar.style.width = `${next / unit.stats.health * 100}%`;
        label.textContent = `HP ${formatStat(next)}/${formatStat(unit.stats.health)}`;
        if (next > 0) target.classList.remove('fallen');
      }
      const amount = document.createElement('span');
      amount.className = `damage-number ${entry.kind}${entry.critical ? ' critical' : ''}`;
      amount.textContent = `${entry.kind === 'damage' ? '-' : '+'}${formatStat(entry.amount)}${entry.critical ? ' CRIT' : ''}`;
      target.append(amount);
      try {
        await this.play(amount, [
          { opacity: 1, transform: 'translateY(6px) scale(.75)' },
          { opacity: 1, transform: 'translateY(-8px) scale(1.18)', offset: .18 },
          { opacity: 1, transform: 'translateY(-24px) scale(1)', offset: .7 },
          { opacity: 0, transform: 'translateY(-48px) scale(.95)' },
        ], 850);
      } finally { amount.remove(); }
    }
  }

  private unit(unit: Combatant): string {
    const { art, color } = definition(unit);
    const selected = unit.side === 'ally' ? unit.id === this.actorId : unit.id === this.targetId;
    const ultimateReady = unit.side === 'ally' && actionUnavailable(this.session.state, unit, 'ultimate') === null;
    return `<button class="battle-unit ${selected ? 'selected-unit' : ''} ${unit.hp <= 0 ? 'fallen' : ''} ${ultimateReady ? 'ultimate-ready' : ''} ${unit.defending ? 'defending-unit' : ''}"
      data-unit="${unit.id}" data-side="${unit.side}" aria-pressed="${selected}" style="--element:${color};--unit-scale:${battleArtScale(this.session.state, unit)}" ${unit.hp <= 0 ? 'disabled' : ''}>
      <span class="unit-name">${unit.name}${unit.level !== null ? ` / Lv. ${unit.level}` : ''}${unit.side === 'ally' && isStarterId(unit.definitionId) ? characterRole(unit.definitionId) : ''}</span><span class="battle-art">
      <span class="battle-sprite"><span class="unit-idle">${art ? `<img src="${assetUrl(`${unit.side === 'ally' ? 'characters' : 'enemies'}/${art}.png`)}" alt="${unit.name}" ${unitFacingAttributes(art, unit.side)} width="960" height="960" />`
        : '<span class="pending-enemy-art" aria-hidden="true"><span></span></span>'}</span></span>
      </span><span class="unit-readout"><span class="health-track"><span style="width:${unit.hp / unit.stats.health * 100}%"></span></span>
      ${unitReadout(unit, true)}</span>
    </button>`;
  }

  private render(): void {
    this.dragging = false;
    const state = this.session.state;
    if (!state.enemies.some((enemy) => enemy.id === this.targetId && enemy.hp > 0)) this.targetId = state.enemies.find((enemy) => enemy.hp > 0)?.id ?? '';
    if (!state.allies.some((ally) => ally.id === this.actorId && ally.hp > 0 &&
        (state.phase !== 'player' || actionUnavailable(state, ally, 'light') === null))) {
      const fallback = state.allies.find((ally) => actionUnavailable(state, ally, 'light') === null) ??
        state.allies.find((ally) => ally.hp > 0) ?? state.allies[0];
      if (!fallback) throw new Error('Battle has no character.');
      this.actorId = fallback.id;
    }
    const actor = state.allies.find((unit) => unit.id === this.actorId);
    if (!actor || !isStarterId(actor.definitionId)) throw new Error('Battle actor definition is missing.');
    const kit = actor.kit;
    if (!kit) throw new Error('Ally combat kit is missing.');
    const dungeon = state.infusion ? infusionEncounter(state.infusion.mode, state.infusion.stage)
      : state.dungeon ? dungeonEncounter(state.dungeon.element, state.dungeon.stage) : null;
    const stages = dungeonStageCount;
    const complete = !!dungeon && dungeon.stage === stages && state.phase === 'cleared';
    const results = this.session.resultsVisible !== false ? battleResults(state, this.session.stageEvents) : '';
    this.host.innerHTML = `${dungeon && !dungeon.background
      ? `<div class="battle-scenery pending-dungeon-scenery" style="--element:${dungeon.color}" aria-hidden="true"></div>`
      : `<img class="battle-scenery" src="${assetUrl(`backgrounds/${dungeon?.background ?? 'grassy-field.png'}`)}" alt="${dungeon?.name ?? 'Grassy field'} battle scenery" width="1456" height="816" />`}
      <div class="battle-top"><div class="battle-heading"><span class="eyebrow">${state.infusion ? 'INFUSION TRIAL' : dungeon ? 'ELEMENTAL DUNGEON' : state.allies.length === 1 ? 'SOLO ADVENTURE' : 'SQUAD ADVENTURE'}</span><h1 tabindex="-1">${dungeon?.name ?? 'Adventure'}</h1></div>
      <span class="battle-progress">${dungeon ? 'Stage' : 'Wave'} ${state.wave}${dungeon ? ` / ${stages}` : ''} &middot; Turn ${state.round} &middot; ${this.session.entrancePending ? 'Entering encounter' : complete ? 'Dungeon complete' : state.phase === 'player' ? 'Player turn' : state.phase === 'cleared' ? 'Encounter cleared' : 'Character defeated'}</span>
      <button id="open-battle-menu" class="battle-chrome-button" aria-haspopup="dialog" aria-controls="battle-menu">Battle menu</button>
      ${state.phase !== 'player' ? `<button data-result-show class="battle-turn-button">${state.phase === 'cleared' ? 'View victory' : 'View results'}</button>` : ''}</div>
      <div class="battle-arena">
      <div class="battle-side enemies" style="--enemy-count:${state.enemies.length}" role="group" aria-label="Enemies on the left">${state.enemies.map((unit) => this.unit(unit)).join('')}</div>
      <div class="battle-side allies ${state.allies.length === 1 ? 'solo' : 'squad'}" role="group" aria-label="Your squad on the right">${state.allies.map((unit) => this.unit(unit)).join('')}</div></div>
      <div class="battle-feedback">
      ${results}
      <p id="battle-error" role="alert" class="status"></p>
      <p id="battle-announcement" role="status">${complete ? `All ${stages} stages cleared. Return to Gameplay to replay unlocked stages.` : state.phase === 'cleared' ? (dungeon ? 'Stage cleared. Continue with full health; Shatter Gauge carries over.' : 'Wave cleared. Continue when ready; recovery and health carry over.') : state.phase === 'defeat' ? 'Your character has fallen. Restart to try again; earned rewards are kept.' : 'Choose an enemy. Hold your character and drag: Up Last Flare / Left Skill 1 / Right Skill 2 / Down Normal. Release to act; right-click to defend.'}</p>
      </div>
      <dialog id="battle-menu" class="battle-menu" aria-labelledby="battle-menu-heading">
      <header class="drawer-heading"><div><p class="eyebrow">TACTICS / REFERENCE</p><h2 id="battle-menu-heading">Battle menu</h2></div><button id="close-battle-menu" class="drawer-close" aria-label="Close battle menu">&times;</button></header>
      <div class="battle-utilities">
      <section class="battle-combat-menu"><h3>Actions / ${actor.name}</h3><p class="quiet">Choose an enemy on the battlefield, then use an action here or drag your character. Turns advance automatically when no teammate can act.</p>
      <div class="battle-actor-picker" role="group" aria-label="Choose acting companion">${state.allies.map((ally) => `<button class="text-button" data-actor="${ally.id}" aria-pressed="${ally.id === this.actorId}" ${this.busy || ally.hp <= 0 || actionUnavailable(state, ally, 'light') !== null ? 'disabled' : ''}>${ally.name}${ally.hp <= 0 ? ' / defeated' : actionUnavailable(state, ally, 'light') !== null ? ' / unavailable' : ''}</button>`).join('')}</div>
      <div class="battle-context-actions">${actionIds.map((action) => this.actionButton(state, actor, action)).join('')}</div>
      ${state.phase === 'player' ? '<button id="end-battle-turn" class="battle-chrome-button">Pass remaining actions</button>' : ''}</section>
      <section class="battle-unit-intel"><h3>Combatants</h3>${[...state.allies, ...state.enemies].map((unit) =>
        `<article><strong>${unit.name}${unit.level !== null ? ` / Lv.${unit.level}` : ''}</strong>${unitReadout(unit)}<small>${unit.hp <= 0 ? 'Defeated' : unit.recoverThrough >= state.round ? 'Recovering after Last Flare' : unit.spent ? 'Action used' : 'Ready'}</small></article>`).join('')}</section>
      <details class="battle-help"><summary>Abilities and battle rules</summary>
      <button id="restart-battle" data-result-restart class="text-button">${dungeon ? 'Replay stage' : 'Restart Adventure'}</button>
      <div class="actor-info"><strong>${actor.name}</strong><span class="passive-summary">${abilityIcon(actor.definitionId, 'passive')}<span>Passive: ${kit.passive.name} &mdash; ${kit.passive.description}</span></span></div>
      <details class="enemy-skill-guide"><summary>Enemy skills and timing</summary>${state.enemies.map((enemy) => `<p><strong>${enemy.name} / Lv.${enemy.level}${enemy.boss ? ' / Boss' : ''}</strong></p><ul>${(enemy.enemySkills ?? []).map((skill) =>
        `<li>${skill.name}${skill.action === 'ultimate' ? ' (Ultimate)' : ''}: ${formatStat(skill.multiplier * 100)}% Attack, every ${skill.every} turns${state.round % skill.every === 0 ? ' / Due this turn' : ''}.</li>`).join('')}</ul>`).join('')}
        <p class="quiet">One attack per enemy turn. The second skill takes priority on overlapping schedules; boss ultimates take highest priority. Normal attacks on other turns.</p></details>
      ${actionIds.map((action) => `<p><strong>${action === 'light' ? 'Normal Attack' : action === 'defend' ? 'Defense' : kit.abilities[action].name}:</strong> ${action === 'light' ? '100% damage; +20 Shatter Gauge.' : action === 'defend' ? 'Consumes your action; reduces incoming damage by 10% until the next player turn. Incoming hits still grant Shatter Gauge.' : kit.abilities[action].description}</p>`).join('')}
      <p class="quiet">Drag at least 32 pixels and release to execute. Return near the starting point to cancel.
        White glow and shimmer mean Last Flare is usable now. Reduced motion keeps a steady white glow.
        Battle menu provides Defense and accessible buttons on touch/keyboard.
        Attack hotkeys and the Space end-turn shortcut are disabled.</p>
      <p class="quiet">One action per living character per turn. Only Last Flare forces a full recovery turn.
        Shatter Gauge starts at ${shatterGauge.starting}; attacks build it and each incoming hit adds ${shatterGauge.incomingHit}, even through shields.
        Enemy turns resolve automatically whenever no living teammate has a legal action, including Last Flare recovery.
        Passing manually forfeits unused actions.
        Only ally/target selection keys remain configurable in Settings.</p>
      <p class="quiet">${state.infusion ? `${dungeonStageCount} stages, enemy levels 80-120. Specialty materials unlock at levels 80/93/100; Epic/Legendary/Omnic bonuses from this mode's associated elements unlock at levels 80/100/115. Every fifth stage is a boss. Quantities and bonus chances grow with level. Health resets between stages; Gauge carries over.` : dungeon ? `Enemies grow from level ${elementalDungeonRules.startingLevel} to ${elementalDungeonRules.maximumLevel} across ${elementalDungeonRules.stages} stages. Every fifth stage is a boss; later enemies use stronger periodic strikes. Seeds are guaranteed; higher-rarity chances and stack sizes increase with enemy level. Health resets between stages; Gauge carries over.` : 'Enemy level follows the wave up to 120. Accelerating HP, attack and defense growth starts at twice the previous rate.'}
        Fractalis drops grow from 5-10 at level 1 to 15-30 at level 120, saved locally. Material stacks grow to 3-6 per successful drop. Quitting ends this run; ${dungeon ? 'unlocked stages can be replayed from Gameplay' : 'entering again starts at wave 1'}.
        Settings preserves the current run. Reloading resets battle progress.</p>
      </details>
      <details class="battle-log"><summary>Battle log (${this.session.log.length} recent events)</summary><ol>${this.session.log.map((line) => `<li>${line}</li>`).join('')}</ol></details></div></dialog>`;
    const menu = this.host.querySelector<HTMLDialogElement>('#battle-menu');
    if (!menu) throw new Error('Battle menu is missing.');
    const closeMenu = (): void => {
      menu.close();
      this.host.querySelector<HTMLButtonElement>('#open-battle-menu')?.focus({ preventScroll: true });
    };
    this.host.querySelector('#open-battle-menu')?.addEventListener('click', () => {
      if (!this.busy && !this.disposed && !activityTransitionPending()) menu.showModal();
    });
    this.host.querySelector('#close-battle-menu')?.addEventListener('click', closeMenu);
    menu.addEventListener('cancel', (event) => { event.preventDefault(); closeMenu(); });
    this.host.querySelectorAll<HTMLButtonElement>('[data-actor]').forEach((button) => {
      button.addEventListener('click', () => {
        if (this.busy || button.disabled) return;
        this.actorId = button.dataset.actor ?? '';
        const open = menu.open;
        this.render();
        if (open) {
          const nextMenu = this.host.querySelector<HTMLDialogElement>('#battle-menu');
          if (!nextMenu) throw new Error('Battle menu dialog is missing.');
          nextMenu.showModal();
          nextMenu.querySelector<HTMLButtonElement>(`[data-actor="${this.actorId}"]`)?.focus();
        }
      });
    });
    this.host.querySelectorAll<HTMLButtonElement>('[data-unit]').forEach((button) => {
      let gesture: { pointerId: number; x: number; y: number } | null = null;
      let suppressClick = false;
      const cancel = (): void => {
        gesture = null;
        this.dragging = false;
        button.classList.remove('gesture-active');
        button.querySelector('.gesture-choice')?.remove();
      };
      if (button.dataset.side === 'ally') {
        button.addEventListener('dragstart', (event) => event.preventDefault());
        button.addEventListener('pointerdown', (event) => {
          if (activityTransitionPending() || event.button !== 0 || !event.isPrimary || this.busy || this.disposed || this.dragging) return;
          const id = button.dataset.unit;
          const actor = this.session.state.allies.find((unit) => unit.id === id);
          if (!actor) throw new Error('Gesture actor is missing.');
          const reason = actionUnavailable(this.session.state, actor, 'light');
          if (reason) { this.error(reason); return; }
          this.actorId = actor.id;
          suppressClick = false;
          gesture = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
          this.dragging = true;
          button.setPointerCapture(event.pointerId);
          button.classList.add('gesture-active');
          const label = document.createElement('span');
          label.className = 'gesture-choice';
          label.innerHTML = gestureGuide(this.session.state, actor);
          button.append(label);
          const art = button.querySelector('.battle-art')?.getBoundingClientRect();
          if (!art) throw new Error('Gesture anchor is missing.');
          const size = label.getBoundingClientRect().width;
          label.style.left = `${Math.max(size / 2 + 12, Math.min(innerWidth - size / 2 - 12, art.x + art.width / 2))}px`;
          label.style.top = `${Math.max(size / 2 + 12, Math.min(innerHeight - size / 2 - 60, art.y + art.height / 2))}px`;
        });
        button.addEventListener('pointermove', (event) => {
          if (!gesture || gesture.pointerId !== event.pointerId) return;
          const action = dragAction(event.clientX - gesture.x, event.clientY - gesture.y);
          const actor = this.session.state.allies.find((unit) => unit.id === this.actorId);
          if (!actor?.kit) throw new Error('Gesture combat kit is missing.');
          const label = button.querySelector<HTMLElement>('.gesture-choice');
          if (!label) throw new Error('Gesture label is missing.');
          updateGestureGuide(label, this.session.state, actor, action);
        });
        button.addEventListener('pointerup', (event) => {
          if (!gesture || gesture.pointerId !== event.pointerId) return;
          const action = dragAction(event.clientX - gesture.x, event.clientY - gesture.y);
          suppressClick = true;
          cancel();
          if (button.hasPointerCapture(event.pointerId)) button.releasePointerCapture(event.pointerId);
          if (action) this.command(action);
        });
        button.addEventListener('pointercancel', (event) => {
          if (gesture?.pointerId === event.pointerId) { suppressClick = true; cancel(); }
        });
        button.addEventListener('lostpointercapture', (event) => {
          if (gesture?.pointerId === event.pointerId) { suppressClick = true; cancel(); }
        });
        button.addEventListener('contextmenu', (event) => {
          event.preventDefault();
          if (this.busy || this.disposed) return;
          cancel();
          const id = button.dataset.unit;
          if (!id) throw new Error('Defense actor is missing.');
          this.actorId = id;
          this.command('defend');
        });
      }
      button.addEventListener('click', () => {
        if (suppressClick) { suppressClick = false; return; }
        if (activityTransitionPending() || this.busy || this.dragging) return;
        const id = button.dataset.unit;
        if (!id) throw new Error('Combatant ID is missing.');
        if (button.dataset.side === 'ally') this.actorId = id;
        else this.targetId = id;
        this.render();
        this.host.querySelector<HTMLButtonElement>(`[data-unit="${id}"]`)?.focus();
      });
    });
    this.host.querySelectorAll<HTMLButtonElement>('[data-action]').forEach((button) => {
      button.addEventListener('click', () => {
        if (!isActionId(button.dataset.action)) throw new Error('Unknown battle action.');
        menu.close();
        this.command(button.dataset.action);
      });
    });
    this.host.querySelector('#end-battle-turn')?.addEventListener('click', () => { menu.close(); this.command('endTurn'); });
    this.host.querySelector('[data-result-continue]')?.addEventListener('click', () => this.command('endTurn'));
    this.host.querySelector('[data-result-dismiss]')?.addEventListener('click', () => {
      this.session.resultsVisible = false;
      this.render();
      this.host.querySelector<HTMLButtonElement>('[data-result-show]')?.focus({ preventScroll: true });
      this.host.querySelector<HTMLElement>('h1')?.scrollIntoView({ block: 'start', behavior: 'instant' });
    });
    this.host.querySelector('[data-result-show]')?.addEventListener('click', () => {
      this.session.resultsVisible = true;
      this.render();
      this.focusResults();
    });
    this.host.querySelector('[data-result-quit]')?.addEventListener('click', async () => {
      if (activityTransitionPending() || this.busy || this.disposed) return;
      this.busy = true;
      try {
        if (!this.quit) throw new Error('Battle exit is unavailable.');
        await this.quit();
      } catch (error) {
        console.error('Battle exit failed', error);
        if (!this.disposed) this.error(error instanceof Error ? error.message : 'Could not return to Gameplay. Rewards are preserved.');
      } finally { this.busy = false; }
    });
    this.host.querySelectorAll('[data-result-restart]').forEach((button) => button.addEventListener('click', async () => {
      if (activityTransitionPending() || this.busy || this.disposed || this.dragging) return;
      const dungeon = this.session.state.infusion ?? this.session.state.dungeon;
      if (this.session.state.phase === 'player' && !confirm(dungeon ? 'Replay this stage? Earned rewards are kept.' : 'Restart Adventure at wave 1? Current run progress will be lost; earned Fractalis is kept.')) return;
      const starterId = this.session.state.allies[0].definitionId;
      if (!isStarterId(starterId)) throw new Error('Squad leader definition is missing.');
      const ids = this.session.state.allies.map((ally) => {
        if (!isStarterId(ally.definitionId)) throw new Error('Squad character definition is missing.');
        return ally.definitionId;
      });
      const fresh = createSession(starterId, this.session.progress, dungeon, {
        ids, progress: this.session.teamProgress ?? { [starterId]: this.session.progress },
      });
      try {
        await transitionActivity(() => {
          if (this.disposed) return;
          Object.assign(this.session, fresh);
          this.session.resultsVisible = true;
          this.render();
          void this.enterEncounter();
        });
      } catch (error) {
        console.error('Battle restart transition failed', error);
        if (!this.disposed) this.error(error instanceof Error ? error.message : 'Battle restart transition failed.');
      }
    }));
  }

  private actionButton(state: BattleState, actor: Combatant, action: ActionId): string {
    if (!isStarterId(actor.definitionId)) throw new Error('Invalid ally definition.');
    if (!actor.kit) throw new Error('Ally combat kit is missing.');
    const ability = action === 'light' || action === 'defend' ? null : actor.kit.abilities[action];
    const name = ability?.name ?? (action === 'light' ? 'Normal Attack' : 'Defense');
    const reason = actionUnavailable(state, actor, action);
    return `<button data-action="${action}" class="battle-action" ${reason ? 'disabled' : ''}>
      <span class="battle-action-heading">${abilityIcon(actor.definitionId, action)}<strong>${name}</strong></span>
      ${action === 'light' ? `<span>Down / +${shatterGauge.gains[action]} Shatter Gauge</span>` : action === 'defend' ? '<span>Right-click / -10% incoming damage</span>' : `<span>${action === 'ultimate' ? 'Up' : action === 'skill1' ? 'Left' : 'Right'}</span>`}
      ${ability ? `<span>Costs ${shatterGauge.costs[action]} Shatter Gauge${ability.cooldown ? `; ${ability.cooldown}-turn cooldown` : ''}.</span>` : ''}
      <small>${reason ?? 'Ready'}</small></button>`;
  }

}
