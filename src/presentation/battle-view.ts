import { actionIds, fighters, enemies, isActionId, shatterGauge, type ActionId } from '../content/combat';
import { getStarter, isStarterId, type StarterId } from '../content/starters';
import { act, actionUnavailable, createBattle, endTurn, nextWave, type BattleState, type BattleEvent, type BattleResult, type Combatant } from '../game/battle';
import { commands, keyLabel, type Bindings, type Command } from '../game/hotkeys';
import { assetUrl } from './portrait';
import { reducedMotion } from './settings';

export interface BattleSession { state: BattleState; log: string[] }
export function createSession(starterId: StarterId): BattleSession {
  return { state: createBattle(crypto.getRandomValues(new Uint32Array(1))[0] || 1, [starterId]), log: ['Solo Free Battle ready. No rewards or permanent progression.'] };
}

function definition(unit: Combatant): { art: string; color: string } {
  if (unit.side === 'ally' && isStarterId(unit.definitionId)) return getStarter(unit.definitionId);
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
  private animations = new Set<Animation>();
  private motion = matchMedia('(prefers-reduced-motion: reduce)');
  private onMotion = (): void => {
    if (reducedMotion()) for (const animation of this.animations) animation.cancel();
  };

  constructor(private host: HTMLElement, private session: BattleSession, private bindings: Bindings) {
    this.targetId = session.state.enemies.find((enemy) => enemy.hp > 0)?.id ?? '';
    this.render();
    document.addEventListener('keydown', this.onKey);
    this.motion.addEventListener('change', this.onMotion);
    window.addEventListener('last-light-motion-change', this.onMotion);
  }

  destroy(): void {
    this.disposed = true;
    document.removeEventListener('keydown', this.onKey);
    this.motion.removeEventListener('change', this.onMotion);
    window.removeEventListener('last-light-motion-change', this.onMotion);
    for (const animation of this.animations) animation.cancel();
    this.animations.clear();
  }

  private onKey = (event: KeyboardEvent): void => {
    if (this.busy || this.disposed || event.repeat || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return;
    if (event.target instanceof Element && event.target.closest('input,select,textarea,[contenteditable="true"]')) return;
    const command = commands.find(([id]) => this.bindings[id] === event.code)?.[0];
    if (!command) return;
    event.preventDefault();
    this.command(command);
  };

  private command(command: Command): void {
    if (this.busy || this.disposed) return;
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
        result = state.phase === 'cleared' ? nextWave(state) : endTurn(state);
      } else {
        result = act(state, this.actorId, command, this.targetId);
      }
      void this.present(result);
    } catch (error) {
      console.error('Free Battle action rejected', error);
      this.error(error instanceof Error ? error.message : 'Battle action failed.');
    }
  }

  private error(message: string): void {
    const status = this.host.querySelector('#battle-error');
    if (!status) throw new Error('Battle status region is missing.');
    status.textContent = message;
  }

  private async present(result: BattleResult): Promise<void> {
    this.busy = true;
    this.session.state = result.state;
    this.session.log.push(...result.events.map((entry) => entry.message));
    this.session.log = this.session.log.slice(-40);
    this.host.querySelectorAll<HTMLButtonElement>('button').forEach((button) => { button.disabled = true; });
    try {
      if (!reducedMotion()) {
        for (const entry of result.events) {
          if (this.disposed || reducedMotion()) break;
          await this.animate(entry);
        }
      }
    } catch (error) {
      console.error('Battle animation failed; resolved combat state is preserved', error);
      if (!this.disposed) {
        this.busy = false;
        this.render();
        this.error('The attack animation failed. Combat results are preserved; you can continue.');
        return;
      }
    } finally {
      this.busy = false;
    }
    if (!this.disposed) {
      this.render();
      this.host.querySelector<HTMLElement>('h1')?.focus();
    }
  }

  private async play(element: Element, frames: Keyframe[], duration: number): Promise<void> {
    const animation = element.animate(frames, { duration, easing: 'ease-out' });
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

  private async animate(entry: BattleEvent): Promise<void> {
    const source = this.host.querySelector<HTMLElement>(`[data-unit="${entry.source}"]`);
    const target = this.host.querySelector<HTMLElement>(`[data-unit="${entry.target}"]`);
    if (entry.kind === 'attack' && source && target) {
      const sprite = source.querySelector('img');
      if (!sprite) throw new Error('Battle sprite is missing.');
      const from = source.getBoundingClientRect();
      const to = target.getBoundingClientRect();
      const distance = Math.max(-170, Math.min(170, to.x - from.x));
      const ultimate = entry.action === 'ultimate';
      const support = entry.source === entry.target;
      const color = source.style.getPropertyValue('--element');
      const effect = document.createElement('span');
      effect.className = `attack-effect effect-${entry.source} action-${entry.action} ${ultimate ? 'effect-ultimate' : ''}`;
      effect.setAttribute('aria-hidden', 'true');
      effect.style.setProperty('--element', color);
      target.querySelector('.battle-art')?.append(effect);
      const label = this.host.querySelector('#battle-announcement');
      if (label) label.textContent = entry.message;
      try {
        await Promise.all([
          this.play(sprite, [
            { transform: 'translate(0,0) scale(1)' },
            { transform: support ? 'translateY(-12px) scale(1.08)' : `translateX(${distance}px) rotate(${entry.source === 'sprout' ? -5 : 5}deg) scale(${ultimate ? 1.12 : 1.04})`, offset: 0.45 },
            { transform: 'translate(0,0) scale(1)' },
          ], ultimate ? 800 : entry.action === 'heavy' ? 600 : 420),
          this.play(effect, [
            { opacity: 0, transform: 'scale(.3) rotate(-40deg)' },
            { opacity: 0.8, transform: 'scale(1) rotate(0deg)', offset: 0.4 },
            { opacity: 0, transform: 'scale(1.5) rotate(45deg)' },
          ], ultimate ? 850 : 450),
        ]);
      } finally { effect.remove(); }
    } else if ((entry.kind === 'damage' || entry.kind === 'heal' || entry.kind === 'shield') && target) {
      const amount = document.createElement('span');
      amount.className = `damage-number ${entry.kind}`;
      amount.textContent = `${entry.kind === 'damage' ? '-' : '+'}${entry.amount}${entry.critical ? ' CRIT' : ''}`;
      target.append(amount);
      try {
        await this.play(amount, [
          { opacity: 1, transform: 'translateY(0)' },
          { opacity: 0, transform: 'translateY(-36px)' },
        ], 320);
      } finally { amount.remove(); }
    }
  }

  private unit(unit: Combatant): string {
    const { art, color } = definition(unit);
    const selected = unit.side === 'ally' ? unit.id === this.actorId : unit.id === this.targetId;
    const recovery = unit.recoverThrough >= this.session.state.round;
    const state = unit.hp <= 0 ? 'Defeated' : unit.side === 'ally' && unit.spent ? `Acted${recovery ? ' - recover next turn' : ''}` : recovery ? 'Recovery turn' : 'Ready';
    return `<button class="battle-unit ${selected ? 'selected-unit' : ''} ${unit.hp <= 0 ? 'fallen' : ''}"
      data-unit="${unit.id}" data-side="${unit.side}" aria-pressed="${selected}" style="--element:${color}" ${unit.hp <= 0 ? 'disabled' : ''}>
      <span class="unit-name">${unit.name}</span><span class="battle-art">
      <img src="${assetUrl(`${unit.side === 'ally' ? 'characters' : 'enemies'}/${art}.png`)}" alt="${unit.name}" width="960" height="960" />
      </span><span class="health-track"><span style="width:${unit.hp / unit.stats.health * 100}%"></span></span>
      <span class="unit-health">HP ${unit.hp}/${unit.stats.health}${unit.shield ? ` &middot; Shield ${unit.shield}` : ''}</span>
      <span class="unit-stats">DEF ${unit.stats.defense} &middot; DMG ${unit.stats.damage} &middot; CRIT ${Math.round(unit.stats.crit * 100)}%</span>
      ${unit.side === 'ally' ? `<span class="shatter-track" role="meter" aria-label="${unit.name} Shatter Gauge" aria-valuemin="0" aria-valuemax="${shatterGauge.maximum}" aria-valuenow="${unit.shatter}"><span style="width:${unit.shatter / shatterGauge.maximum * 100}%"></span></span>
      <span class="unit-gauge">Shatter Gauge ${unit.shatter}/${shatterGauge.maximum}</span>` : ''}
      <span class="unit-status">${state}${unit.burn.turns ? ' &middot; Burning' : ''}${unit.weakened ? ' &middot; Weakened' : ''}</span>
    </button>`;
  }

  private render(): void {
    const state = this.session.state;
    if (!state.enemies.some((enemy) => enemy.id === this.targetId && enemy.hp > 0)) this.targetId = state.enemies.find((enemy) => enemy.hp > 0)?.id ?? '';
    if (!state.allies.some((ally) => ally.id === this.actorId && ally.hp > 0)) this.actorId = state.allies.find((ally) => ally.hp > 0)?.id ?? 'ember';
    const actor = state.allies.find((unit) => unit.id === this.actorId);
    if (!actor || !isStarterId(actor.definitionId)) throw new Error('Battle actor definition is missing.');
    const kit = fighters[actor.definitionId];
    this.host.innerHTML = `<div class="battle-top"><h1 tabindex="-1">Free Battle</h1>
      <span>Wave ${state.wave} &middot; Turn ${state.round} &middot; ${state.phase === 'player' ? 'Player turn' : state.phase === 'cleared' ? 'Wave cleared' : 'Character defeated'}</span></div>
      <p class="quiet">Solo Free Battle: ${actor.name}. No rewards or battle saves.</p>
      <div class="battle-arena"><img class="battle-scenery" src="${assetUrl('backgrounds/grassy-field.png')}" alt="Sunlit grassy-field battle scenery" width="1456" height="816" />
      <div class="battle-side enemies"><h2>Enemies &middot; Left</h2>${state.enemies.map((unit) => this.unit(unit)).join('')}</div>
      <div class="battle-divider" aria-hidden="true">VS</div>
      <div class="battle-side allies solo"><h2>Your character &middot; Right</h2>${state.allies.map((unit) => this.unit(unit)).join('')}</div></div>
      <p id="battle-announcement" role="status">${state.phase === 'cleared' ? 'Wave cleared. Continue when ready; recovery and health carry over.' : state.phase === 'defeat' ? 'Your character has fallen. Restart Free Battle to try again.' : 'Choose an enemy on the left, then an action for your character.'}</p>
      <div class="battle-controls"><div class="actor-info"><strong>${actor.name}</strong><span>Passive: ${kit.passive.name} &mdash; ${kit.passive.description}</span></div>
      <div class="battle-actions">${actionIds.map((action) => this.actionButton(state, actor, action)).join('')}</div>
      <p class="quiet">One action per living character per turn. Only Last Flare forces a full recovery turn.
        Shatter Gauge starts at ${shatterGauge.starting}; attacks build it and each incoming hit adds ${shatterGauge.incomingHit}, even through shields.
        Ending a turn forfeits unused actions.
        <kbd>${keyLabel(this.bindings.nextAlly)}</kbd> next ally &middot; <kbd>${keyLabel(this.bindings.nextTarget)}</kbd> next enemy</p>
      <button id="end-battle-turn" class="primary-button" ${state.phase === 'defeat' ? 'disabled' : ''}><kbd>${keyLabel(this.bindings.endTurn)}</kbd> ${state.phase === 'cleared' ? 'Next wave' : 'End turn / enemy attacks'}</button>
      <button id="restart-battle" class="text-button">Restart Free Battle</button></div>
      <p id="battle-error" role="alert" class="status"></p>
      <details class="battle-log"><summary>Battle log (${this.session.log.length} recent events)</summary><ol>${this.session.log.map((line) => `<li>${line}</li>`).join('')}</ol></details>`;
    this.host.querySelectorAll<HTMLButtonElement>('[data-unit]').forEach((button) => {
      button.addEventListener('click', () => {
        if (this.busy) return;
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
        this.command(button.dataset.action);
      });
    });
    this.host.querySelector('#end-battle-turn')?.addEventListener('click', () => this.command('endTurn'));
    this.host.querySelector('#restart-battle')?.addEventListener('click', () => {
      if (!confirm('Restart this practice battle? Current wave progress will be lost.')) return;
      const starterId = this.session.state.allies[0].definitionId;
      if (!isStarterId(starterId)) throw new Error('Solo starter definition is missing.');
      this.session.state = createSession(starterId).state;
      this.session.log = ['Free Battle restarted.'];
      this.render();
    });
  }

  private actionButton(state: BattleState, actor: Combatant, action: ActionId): string {
    if (!isStarterId(actor.definitionId)) throw new Error('Invalid ally definition.');
    const ability = action === 'light' || action === 'heavy' ? null : fighters[actor.definitionId].abilities[action];
    const name = ability?.name ?? (action === 'light' ? 'Light Attack' : 'Heavy Attack');
    const detail = ability?.description ?? `${action === 'light' ? '100%' : '180%'} damage; +${shatterGauge.gains[action]} Shatter Gauge.`;
    const reason = actionUnavailable(state, actor, action);
    return `<button data-action="${action}" class="battle-action" ${reason ? 'disabled' : ''}>
      <kbd>${keyLabel(this.bindings[action])}</kbd><strong>${name}</strong><span>${detail}</span>
      ${ability ? `<span>Costs ${shatterGauge.costs[action]} Shatter Gauge${ability.cooldown ? `; ${ability.cooldown}-turn cooldown` : ''}.</span>` : ''}
      <small>${reason ?? 'Ready'}</small></button>`;
  }
}
