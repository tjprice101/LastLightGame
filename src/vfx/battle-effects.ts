import { CHARACTER_PROFILES, createVFXSystem, signaturePalette } from './vfx-registry';
import { VFXRenderer } from './vfx-renderer';
import { advanceVFX } from './vfx-motion';
import type { AbilityTier, AbilityVFXDefinition, VFXContext, BaseVFXSystem, VFXArchetype, VFXPalette } from './types';
import type { RadiantBattleEffects } from '../presentation/battle-screen';
import type { RadiantImpactFrame } from '../presentation/battle-impact-frames';
import type { RadiantPlayerAction } from '../online/battle-run';
import type { RadiantCombatState, RadiantCombatEvent } from '../game/combat-engine';
import { readyFlare } from '../game/combat-gauge';
import { radiantBearerKits, radiantFlareName, type RadiantBearerId } from '../content/combat-kits';
import { starters } from '../content/starters';
import { battleSpeed } from '../presentation/battle-speed';
import { reducedMotion } from '../presentation/settings';
import { RadiantSignatureVFX, withRadiantSignature, radiantStatusCueSystem } from './signature-vfx';

interface Effect { system: BaseVFXSystem; context: VFXContext }
const radiantArchetypes: Partial<Record<RadiantBearerId, Record<AbilityTier, VFXArchetype>>> = {
  neralis: { light: 'volley', skill1: 'beam', skill2: 'vortex', ultimate: 'mandala' },
  varkhel: { light: 'slam', skill1: 'slash', skill2: 'vortex', ultimate: 'cataclysm' },
  seravelle: { light: 'volley', skill1: 'slash', skill2: 'beam', ultimate: 'mandala' },
  velmira: { light: 'slash', skill1: 'vortex', skill2: 'volley', ultimate: 'cataclysm' },
  ozriel: { light: 'slam', skill1: 'beam', skill2: 'vortex', ultimate: 'mandala' },
  ilvaris: { light: 'beam', skill1: 'mandala', skill2: 'volley', ultimate: 'cataclysm' },
  kaelith: { light: 'slash', skill1: 'beam', skill2: 'slam', ultimate: 'vortex' },
};
const radiantColors: Partial<Record<RadiantBearerId, readonly [string, string]>> = {
  maerion: ['#3567d9', '#a64ef1'], caevren: ['#315bd1', '#974bfa'],
  vespera: ['#426be0', '#bd58ef'], ilyss: ['#315fe0', '#c34be9'],
  asteriel: ['#285fd7', '#ab4def'], serapha: ['#4774df', '#b568f5'],
  neralis: ['#14b8e4', '#e7aa49'], varkhel: ['#f16724', '#a14dd8'],
  seravelle: ['#f1672a', '#ffce58'], velmira: ['#b043d7', '#e9a43c'],
  solenne: ['#b9a4d8', '#eef1ff'],
  ozriel: ['#dd3950', '#fff0f2'], ilvaris: ['#d83755', '#fff0f2'], kaelith: ['#c72a4d', '#fff0f2'],
};
function radiantPalette(id: RadiantBearerId, original: VFXPalette): VFXPalette {
  const colors = radiantColors[id];
  if (!colors) return original;
  const primary = signaturePalette(id, original.name, colors[0]);
  const secondary = signaturePalette(id, original.name, colors[1]);
  return { ...primary, name: original.name, spectral: { ...secondary.mid, a: .65 } };
}
export function radiantVisualDefinition(id: RadiantBearerId, tier: AbilityTier): AbilityVFXDefinition {
  const existing = CHARACTER_PROFILES[id];
  if (existing) {
    const definition = existing.abilities[tier];
    return { ...definition, palette: radiantPalette(id, definition.palette) };
  }
  const authored = radiantArchetypes[id], character = starters.find(character => character.id === id);
  if (!authored || !character) throw new Error(`Radiant visual profile is missing for ${id}.`);
  const flare = tier === 'skill1' ? 'sparkling' : tier === 'skill2' ? 'glimmering' : tier === 'ultimate' ? 'ultimate' : null;
  const signature = flare ? radiantFlareName(id) : 'Normal Attack';
  return { name: character.name, tier, archetype: authored[tier],
    description: `${signature}: ${radiantBearerKits[id].signatureFamily} signature choreography.`,
    palette: radiantPalette(id, signaturePalette(id, character.name, character.color)),
    duration: 1, chargeDuration: .05, impactDuration: .5 };
}
interface PlayEntry {
  time: number;
  duration: number;
  draw(time: number): void;
  resolve(): void;
  reject(error: unknown): void;
}
interface ActionContext { action: RadiantPlayerAction | null; state: RadiantCombatState; ability: AbilityVFXDefinition }
/** Deterministic hit-spark rays (no gameplay or presentation RNG): bright, short and finite. */
function drawHitSparks(context: CanvasRenderingContext2D, x: number, y: number, progress: number, size: number,
  color: { r: number; g: number; b: number }, seed: number): void {
  if (progress <= 0 || progress >= 1) return;
  const rays = 9, fade = 1 - progress, reach = size * (.35 + progress * .9);
  context.save();
  context.globalCompositeOperation = 'lighter';
  context.lineCap = 'round';
  for (let ray = 0; ray < rays; ray++) {
    const angle = (ray / rays) * Math.PI * 2 + seed * 1.7 + (ray % 2) * .21;
    const inner = reach * (.25 + (ray % 3) * .08), outer = reach * (.75 + ((ray * 7 + seed) % 4) * .09);
    context.strokeStyle = `rgba(${color.r},${color.g},${color.b},${.9 * fade})`;
    context.lineWidth = Math.max(1, 3 * fade);
    context.beginPath();
    context.moveTo(x + Math.cos(angle) * inner, y + Math.sin(angle) * inner);
    context.lineTo(x + Math.cos(angle) * outer, y + Math.sin(angle) * outer);
    context.stroke();
  }
  const flash = context.createRadialGradient(x, y, 0, x, y, reach * .6);
  flash.addColorStop(0, `rgba(255,255,255,${.75 * fade})`);
  flash.addColorStop(1, 'transparent');
  context.fillStyle = flash; context.fillRect(x - reach, y - reach, reach * 2, reach * 2);
  context.restore();
}
/** Saved-impact signature VFX; the owning view controls motion and receipts.
 * Several actions may play at once (Battle Flurry): one frame loop draws every
 * active entry, each with its own clock and its own action context. */
export class RadiantCanvasEffects implements RadiantBattleEffects {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private renderer: VFXRenderer;
  private frame: number | null = null;
  private previous: number | null = null;
  private entries = new Set<PlayEntry>();
  private paused = false;
  private disposed = false;
  /** Context of the latest windup, for callers that do not pass their action to `impact`. */
  private latest: ActionContext | null = null;
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
    const pixelWidth = Math.round(width * dpr), pixelHeight = Math.round(height * dpr);
    if (this.canvas.width !== pixelWidth || this.canvas.height !== pixelHeight) {
      this.canvas.width = pixelWidth; this.canvas.height = pixelHeight;
    }
    this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { width, height, dpr };
  }
  private clear(): void {
    this.context.save(); this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height); this.context.restore();
  }
  private readonly step = (timestamp: number): void => {
    this.frame = null;
    const elapsed = this.previous === null ? 0 : Math.min(.05, Math.max(0, (timestamp - this.previous) / 1000));
    this.previous = timestamp;
    if (reducedMotion()) { this.cancel(); return; }
    if (!this.paused) {
      this.clear();
      for (const entry of [...this.entries]) {
        entry.time = Math.min(entry.duration, entry.time + elapsed * battleSpeed());
        if (entry.time >= entry.duration) { this.entries.delete(entry); entry.resolve(); continue; }
        try { entry.draw(entry.time); }
        catch (error) { this.entries.delete(entry); entry.reject(error); }
      }
    }
    if (this.entries.size && !this.disposed) this.frame = requestAnimationFrame(this.step);
    else { this.previous = null; this.clear(); }
  };
  private play(duration: number, draw: (time: number) => void): Promise<void> {
    if (this.disposed || reducedMotion()) return Promise.resolve();
    return new Promise((resolve, reject) => {
      this.entries.add({ time: 0, duration, draw, resolve, reject });
      if (this.frame === null) { this.previous = null; this.frame = requestAnimationFrame(this.step); }
    });
  }
  private actionContext(action: RadiantPlayerAction | null, state: RadiantCombatState): ActionContext {
    const bearer = action ? state.bearers.find(unit => unit.loadout.id === action.bearerId) : state.bearers[0];
    if (!bearer) throw new Error('Radiant visual caster is missing.');
    const flare = action?.type === 'flare' ? readyFlare(state.gauge, action.bearerId) : null;
    // D-479: skills use their own Skill 1 / Skill 2 visuals (shared with the Sparkling and Glimmering Flare tiers).
    const tier: AbilityTier = flare === 'ultimate' ? 'ultimate' : flare === 'glimmering' ? 'skill2' : flare === 'sparkling' ? 'skill1' :
      action?.type === 'skill' ? (action.slot === 1 ? 'skill1' : 'skill2') : 'light';
    const original = radiantVisualDefinition(bearer.loadout.starter, tier);
    return { action, state: structuredClone(state), ability: { ...original,
      name: flare ? radiantFlareName(bearer.loadout.starter) : action?.type === 'skill'
        ? radiantBearerKits[bearer.loadout.starter].kit[action.slot === 1 ? 'skill1' : 'skill2'].name : 'Normal Attack' } };
  }
  async windup(action: RadiantPlayerAction, state: RadiantCombatState): Promise<void> {
    const saved = this.actionContext(action, state); this.latest = saved;
    const bearer = state.bearers.find(unit => unit.loadout.id === action.bearerId)!;
    const flare = action.type === 'flare' ? readyFlare(state.gauge, action.bearerId) : null;
    const tier = saved.ability.tier;
    const original = radiantVisualDefinition(bearer.loadout.starter, tier);
    const size = this.size(), signature = this.signature(bearer.loadout.starter);
    const rect = this.anchor(action.bearerId);
    const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
    const duration = flare === 'ultimate' ? .6 : flare ? .4 : action.type === 'skill' ? .26 : .14;
    const color = original.palette.mid;
    await this.play(duration, time => {
      const p = time / duration, extent = Math.min(rect.width, rect.height);
      const radius = Math.min(flare ? 110 : 70, extent * (flare ? .45 : .4)) * (.4 + p * .6);
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
        radius: Math.min(flare ? 52 : 32, extent * (flare ? .25 : .2)), progress: p,
        tier, phase: 'charge', color, secondaryColor: original.palette.spectral });
      this.renderer.composite(size.width, size.height, { enabled: true, intensity: .7, radius: 12 });
    });
  }
  /** `action` null = enemy phase / End Turn (no caster); omitted = the latest windup's action. */
  async impact(frame: RadiantImpactFrame, action?: RadiantPlayerAction | null, state?: RadiantCombatState): Promise<void> {
    const saved = action === undefined ? this.latest : state ? this.actionContext(action, state) : null;
    if (!saved) throw new Error('Radiant effects have no saved action context.');
    const { ability } = saved, caster = saved.action;
    const packets = frame.events.filter((event): event is Extract<RadiantCombatEvent,
      { type: 'damage' | 'heal' | 'shield' | 'status' }> =>
      event.type === 'damage' && event.healthLoss + event.absorbed > 0 ||
      event.type === 'heal' && event.effective > 0 ||
      event.type === 'shield' && event.amount > 0 ||
      event.type === 'status' && !event.clockOnly && event.remaining > 0 && event.status !== 'weaken-removed');
    if (!packets.length) return;
    if (new Set(packets.map(packet => packet.targetId)).size > 6)
      throw new Error('Radiant visual impact exceeds the six-target frame bound.');
    const size = this.size(), effects: Effect[] = [];
    const sparks: { x: number; y: number; at: number; size: number; color: { r: number; g: number; b: number } }[] = [];
    for (const packet of packets) {
      const rect = this.anchor(packet.targetId);
      const targetX = rect.left + rect.width / 2, targetY = rect.top + rect.height / 2;
      const own = !!caster && packet.source.kind !== 'enemy' && packet.source.bearerId === caster.bearerId;
      // Support and periodic packets never borrow offensive projectile choreography.
      const support = packet.type !== 'damage';
      const authored = own && ['normal', 'skill', 'flare', 'master'].includes(packet.source.kind);
      const simple = !authored || packet.type === 'damage' && packet.origin !== 'direct';
      const duration = packet.type === 'status' ? .35 : simple ? .45 : ability.tier === 'ultimate' ? 1.2 : ability.tier === 'light' ? .5 : .85;
      const ownerId = packet.source.kind !== 'enemy' ? packet.source.bearerId : null;
      const source = ownerId ? saved.state.bearers.find(unit => unit.loadout.id === ownerId) : null;
      if (ownerId && !source) throw new Error('Radiant visual packet owner is missing from the frozen squad.');
      const palette = source ? radiantVisualDefinition(source.loadout.starter, 'light').palette : {
        ...ability.palette,
        id: 'radiant-neutral', name: 'Neutral enemy packet cue',
        core: { r: 255, g: 255, b: 255, a: 1 },
        inner: { r: 220, g: 225, b: 235, a: .9 }, mid: { r: 170, g: 175, b: 190, a: .8 },
        outer: { r: 90, g: 95, b: 110, a: .6 }, spectral: { r: 210, g: 215, b: 230, a: .4 },
        smoke: { r: 30, g: 35, b: 45, a: .3 },
        groundGlow: 'rgba(170,175,190,.2)',
      };
      const definition: AbilityVFXDefinition = { ...ability, palette,
        archetype: support ? packet.type === 'shield' ? 'vortex' : 'mandala' : simple ? 'mandala' : ability.archetype,
        chargeDuration: .05, impactDuration: duration * .5, duration };
      const baseSystem = packet.type === 'status' ? radiantStatusCueSystem() : createVFXSystem(definition.archetype);
      const system = source && !simple ? withRadiantSignature(baseSystem, this.signature(source.loadout.starter),
        packet.type === 'status' ? 'status' : 'impact') : baseSystem;
      const casterRect = own ? this.anchor(caster!.bearerId) : rect;
      const context: VFXContext = { ctx: this.context, ...size, t: 0, dt: 0, progress: 0,
        casterX: support || simple ? targetX : casterRect.left + casterRect.width / 2,
        casterY: support || simple ? targetY : casterRect.top + casterRect.height / 2,
        targetX, targetY, definition, palette: definition.palette, secondaryTarget: effects.length > 0,
        scale: Math.min(.75, Math.max(.2, Math.min(rect.width, rect.height) / 300)) * (simple || packet.type === 'status' ? .5 : 1),
        batchFissureShadows: true, shakeCallback: () => {} };
      system.reset(); effects.push({ system, context });
      if (packet.type === 'damage' && packet.origin === 'direct')
        sparks.push({ x: targetX, y: targetY, at: simple ? .08 : duration * .42,
          size: Math.min(120, Math.max(40, Math.min(rect.width, rect.height) * .6)), color: palette.inner });
    }
    const sparkLength = .28;
    const duration = Math.max(...effects.map(effect => effect.context.definition.duration),
      ...sparks.map(spark => spark.at + sparkLength));
    await this.play(duration, time => {
      this.renderer.begin(size.width, size.height, size.dpr);
      for (const effect of effects) {
        if (time >= effect.context.definition.duration) continue;
        advanceVFX(effect.system, effect.context, time);
        this.renderer.render(effect.system, effect.context, true, false);
      }
      this.renderer.composite(size.width, size.height, { enabled: true, intensity: 1.1, radius: 18 });
      sparks.forEach((spark, index) =>
        drawHitSparks(this.context, spark.x, spark.y, (time - spark.at) / sparkLength, spark.size, spark.color, index));
    });
  }
  cancel(): void {
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    this.frame = null; this.previous = null;
    const pending = [...this.entries]; this.entries.clear();
    this.clear();
    for (const entry of pending) entry.resolve();
  }
  dispose(): void {
    this.disposed = true; this.cancel(); window.removeEventListener('resize', this.resized); this.canvas.remove();
    window.removeEventListener('scroll', this.resized, true);
    this.signatures.clear();
  }
}
