import { CHARACTER_PROFILES, createVFXSystem, signaturePalette } from './vfx-registry';
import { VFXRenderer } from './vfx-renderer';
import { advanceVFX } from './vfx-motion';
import type { AbilityTier, AbilityVFXDefinition, VFXContext, BaseVFXSystem, VFXArchetype } from './types';
import type { RadiantBattleEffects } from '../presentation/radiant-battle-view';
import type { RadiantImpactFrame } from '../presentation/radiant-impact';
import type { RadiantPlayerAction } from '../online/radiant-run';
import type { RadiantCombatState, RadiantCombatEvent } from '../game/radiant-combat';
import { readyFlare } from '../game/radiant-gauge';
import { radiantFlares, type RadiantBearerId } from '../content/radiant-combat';
import { starters } from '../content/starters';
import { battleSpeed } from '../presentation/battle-speed';
import { reducedMotion } from '../presentation/settings';
import { RadiantSignatureVFX, withRadiantSignature, radiantStatusCueSystem } from './radiant-signature-vfx';

interface Effect { system: BaseVFXSystem; context: VFXContext }
const pilotArchetypes: Partial<Record<RadiantBearerId, readonly [VFXArchetype, VFXArchetype]>> = {
  neralis: ['volley', 'mandala'], varkhel: ['slam', 'vortex'], seravelle: ['volley', 'mandala'],
  velmira: ['slash', 'slash'], ozriel: ['slam', 'vortex'], ilvaris: ['beam', 'mandala'], kaelith: ['slash', 'beam'],
};
function visualDefinition(id: RadiantBearerId, tier: AbilityTier): AbilityVFXDefinition {
  const existing = CHARACTER_PROFILES[id];
  if (existing) return existing.abilities[tier];
  const authored = pilotArchetypes[id], character = starters.find(character => character.id === id);
  if (!authored || !character) throw new Error(`Radiant visual profile is missing for ${id}.`);
  return { name: character.name, tier, archetype: authored[tier === 'light' ? 0 : 1],
    description: 'Radiant signature choreography pilot.', palette: signaturePalette(id, character.name, character.color),
    duration: 1, chargeDuration: .05, impactDuration: .5 };
}
/** Saved-impact pilot: source-aligned emission and bloom, never portrait bloom
 * or a second combat simulation. The owning view controls motion/receipts. */
export class RadiantCanvasEffects implements RadiantBattleEffects {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private renderer: VFXRenderer;
  private frame: number | null = null;
  private finish: (() => void) | null = null;
  private paused = false;
  private disposed = false;
  private action: RadiantPlayerAction | null = null;
  private state: RadiantCombatState | null = null;
  private ability: AbilityVFXDefinition | null = null;
  private signatures = new Map<RadiantBearerId, RadiantSignatureVFX>();
  private readonly resized = () => this.cancel();
  constructor(private readonly host: HTMLElement) {
    this.canvas = host.ownerDocument.createElement('canvas');
    this.canvas.className = 'radiant-vfx-canvas';
    this.canvas.setAttribute('aria-hidden', 'true');
    this.canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100dvh;pointer-events:none;z-index:4;';
    const context = this.canvas.getContext('2d', { alpha: true });
    if (!context) throw new Error('Radiant effects could not initialize the emission canvas.');
    this.context = context; this.renderer = new VFXRenderer(context);
    host.ownerDocument.body.append(this.canvas);
    window.addEventListener('resize', this.resized);
    window.addEventListener('scroll', this.resized, { capture: true, passive: true });
  }
  pause(paused: boolean): void { this.paused = paused; }
  private signature(id: RadiantBearerId): RadiantSignatureVFX {
    let signature = this.signatures.get(id);
    if (!signature) { signature = new RadiantSignatureVFX(id); this.signatures.set(id, signature); }
    return signature;
  }
  private anchor(id: string): DOMRect {
    const element = Array.from(this.host.querySelectorAll<HTMLElement>('[data-radiant-art]'))
      .find(element => element.dataset.radiantArt === id);
    if (!element) throw new Error('Radiant effect target is missing from the saved field.');
    const rect = (element.querySelector('img') ?? element).getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) throw new Error('Radiant effect target has no visible area.');
    return rect;
  }
  private size(): { width: number; height: number; dpr: number } {
    const width = innerWidth, height = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 1.5, 1600 / Math.max(width, height));
    this.canvas.width = Math.round(width * dpr); this.canvas.height = Math.round(height * dpr);
    this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { width, height, dpr };
  }
  private clear(): void {
    this.context.save(); this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height); this.context.restore();
  }
  private play(duration: number, draw: (time: number) => void): Promise<void> {
    this.cancel();
    if (this.disposed || reducedMotion()) return Promise.resolve();
    return new Promise((resolve, reject) => {
      this.finish = resolve;
      let time = 0, previous: number | null = null;
      const step = (timestamp: number) => {
        try {
          const elapsed = previous === null ? 0 : Math.min(.05, Math.max(0, (timestamp - previous) / 1000));
          previous = timestamp;
          if (!this.paused) time = Math.min(duration, time + elapsed * battleSpeed());
          if (time >= duration || reducedMotion()) { this.frame = null; this.finish = null; this.clear(); resolve(); return; }
          if (!this.paused) { this.clear(); draw(time); }
          this.frame = requestAnimationFrame(step);
        } catch (error) {
          this.finish = null; this.cancel(); reject(error);
        }
      };
      this.frame = requestAnimationFrame(step);
    });
  }
  async windup(action: RadiantPlayerAction, state: RadiantCombatState): Promise<void> {
    this.action = action; this.state = structuredClone(state);
    const bearer = state.bearers.find(unit => unit.loadout.id === action.bearerId);
    if (!bearer) throw new Error('Radiant visual caster is missing.');
    const flare = action.type === 'flare' ? readyFlare(state.gauge, action.bearerId) : null;
    const tier: AbilityTier = flare === 'eternal' ? 'ultimate' : flare === 'lustrous' ? 'skill2' : flare === 'glowing' ? 'skill1' : 'light';
    const original = visualDefinition(bearer.loadout.starter, tier);
    this.ability = { ...original, name: flare ? radiantFlares[bearer.loadout.starter][flare].name : action.type === 'defense' ? 'Defense' : 'Normal Attack' };
    const size = this.size(), signature = this.signature(bearer.loadout.starter);
    const rect = this.anchor(action.bearerId);
    const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
    const duration = flare === 'eternal' ? .6 : flare ? .4 : .2;
    const color = original.palette.mid;
    await this.play(duration, time => {
      const p = time / duration, radius = Math.min(70, Math.min(rect.width, rect.height) * .4) * (.4 + p * .6);
      const glow = this.context.createRadialGradient(x, y, 0, x, y, radius * 2);
      glow.addColorStop(0, `rgba(255,255,255,${.3 * Math.sin(p * Math.PI)})`);
      glow.addColorStop(.4, `rgba(${color.r},${color.g},${color.b},${.25 * Math.sin(p * Math.PI)})`);
      glow.addColorStop(1, 'transparent');
      this.context.fillStyle = glow; this.context.fillRect(x - radius * 2, y - radius * 2, radius * 4, radius * 4);
      this.context.strokeStyle = `rgba(${color.r},${color.g},${color.b},${Math.sin(p * Math.PI)})`;
      this.context.lineWidth = 2;
      this.context.beginPath(); this.context.arc(x, y, radius, p * 3, p * 3 + Math.PI * 1.6); this.context.stroke();
      const emission = this.renderer.begin(size.width, size.height, size.dpr);
      signature.render(emission, { x, y: rect.top + rect.height * .15,
        radius: Math.min(32, Math.min(rect.width, rect.height) * .2), progress: p,
        tier, phase: 'charge', color });
      this.renderer.composite(size.width, size.height, { enabled: true, intensity: .7, radius: 12 });
    });
  }
  async impact(frame: RadiantImpactFrame): Promise<void> {
    if (!this.ability || !this.action || !this.state) throw new Error('Radiant effects have no saved action context.');
    const packets = frame.events.filter((event): event is Extract<RadiantCombatEvent,
      { type: 'damage' | 'heal' | 'shield' | 'status' }> =>
      event.type === 'damage' && event.healthLoss + event.absorbed > 0 ||
      event.type === 'heal' && event.effective > 0 ||
      event.type === 'shield' && event.amount > 0 || event.type === 'status');
    if (!packets.length) return;
    if (new Set(packets.map(packet => packet.targetId)).size > 6)
      throw new Error('Radiant visual impact exceeds the six-target frame bound.');
    const size = this.size(), effects: Effect[] = [];
    for (const packet of packets) {
      const rect = this.anchor(packet.targetId);
      const targetX = rect.left + rect.width / 2, targetY = rect.top + rect.height / 2;
      const own = packet.source.kind !== 'enemy' && packet.source.bearerId === this.action.bearerId;
      // Support and periodic packets never borrow offensive projectile choreography.
      const support = packet.type !== 'damage';
      const authored = own && ['normal', 'flare', 'master'].includes(packet.source.kind);
      const simple = !authored || packet.type === 'damage' && packet.origin !== 'direct';
      const duration = packet.type === 'status' ? .35 : simple ? .45 : this.ability.tier === 'ultimate' ? 1.2 : this.ability.tier === 'light' ? .55 : .85;
      const ownerId = packet.source.kind !== 'enemy' ? packet.source.bearerId : null;
      const source = ownerId ? this.state.bearers.find(unit => unit.loadout.id === ownerId) : null;
      if (ownerId && !source) throw new Error('Radiant visual packet owner is missing from the frozen squad.');
      const palette = source ? visualDefinition(source.loadout.starter, 'light').palette : {
        ...this.ability.palette,
        id: 'radiant-neutral', name: 'Neutral enemy packet cue',
        core: { r: 255, g: 255, b: 255, a: 1 },
        inner: { r: 220, g: 225, b: 235, a: .9 }, mid: { r: 170, g: 175, b: 190, a: .8 },
        outer: { r: 90, g: 95, b: 110, a: .6 }, spectral: { r: 210, g: 215, b: 230, a: .4 },
        smoke: { r: 30, g: 35, b: 45, a: .3 },
        groundGlow: 'rgba(170,175,190,.2)',
      };
      const definition: AbilityVFXDefinition = { ...this.ability, palette,
        archetype: support ? packet.type === 'shield' ? 'vortex' : 'mandala' : simple ? 'mandala' : this.ability.archetype,
        chargeDuration: .05, impactDuration: duration * .5, duration };
      const baseSystem = packet.type === 'status' ? radiantStatusCueSystem() : createVFXSystem(definition.archetype);
      const system = source && !simple ? withRadiantSignature(baseSystem, this.signature(source.loadout.starter),
        packet.type === 'status' ? 'status' : 'impact') : baseSystem;
      const caster = own ? this.anchor(this.action.bearerId) : rect;
      const context: VFXContext = { ctx: this.context, ...size, t: 0, dt: 0, progress: 0,
        casterX: support || simple ? targetX : caster.left + caster.width / 2,
        casterY: support || simple ? targetY : caster.top + caster.height / 2,
        targetX, targetY, definition, palette: definition.palette, secondaryTarget: effects.length > 0,
        scale: Math.min(.75, Math.max(.2, Math.min(rect.width, rect.height) / 300)) * (simple || packet.type === 'status' ? .5 : 1), shakeCallback: () => {} };
      system.reset(); effects.push({ system, context });
    }
    const duration = Math.max(...effects.map(effect => effect.context.definition.duration));
    await this.play(duration, time => {
      this.renderer.begin(size.width, size.height, size.dpr);
      for (const effect of effects) {
        advanceVFX(effect.system, effect.context, Math.min(time, effect.context.definition.duration));
        this.renderer.render(effect.system, effect.context, true, false);
      }
      this.renderer.composite(size.width, size.height, { enabled: true, intensity: 1.1, radius: 18 });
    });
  }
  cancel(): void {
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    this.frame = null; const finish = this.finish; this.finish = null;
    this.clear(); finish?.();
  }
  dispose(): void {
    this.disposed = true; this.cancel(); window.removeEventListener('resize', this.resized); this.canvas.remove();
    window.removeEventListener('scroll', this.resized, true);
    this.signatures.clear();
  }
}
