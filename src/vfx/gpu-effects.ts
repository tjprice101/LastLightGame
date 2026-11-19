/**
 * Battle Spectacle effects (D-484): the RadiantBattleEffects implementation
 * backed by one shared Phaser WebGL layer (spectacle-scene.ts). Replaces the
 * Phase 2 canvas effects. Without WebGL, or while textures load, every impact
 * shows one static element ring (owner choice, 2026-11-18). The view owns
 * Reduce motion and never calls these effects then.
 */
import type { RadiantBattleEffects, RadiantScreenCue } from '../presentation/battle-screen';
import type { RadiantImpactFrame } from '../presentation/battle-impact-frames';
import type { RadiantPlayerAction } from '../online/battle-run';
import type { RadiantCombatEvent, RadiantCombatState } from '../game/combat-engine';
import { readyFlare } from '../game/combat-gauge';
import { radiantBearerKits } from '../content/combat-kits';
import { radiantKits, type RadiantKitId, type KitSkillTarget } from '../content/radiant-kits';
import { characterChoreography } from '../presentation/battle-effects';
import { battleSpeed } from '../presentation/battle-speed';
import { beatPlan, enemyImpactMs, FlashGovernor, spectacleTier, staticImpactMs, tintCss,
  type SpectacleBeats } from './spectacle-timing';
import { elementStyle, type ElementStyle } from './element-styles';
import { bearerElementStyle } from './bearer-signatures';
import type { BurstKind, Point, SpectacleScene, SpectacleStats } from './spectacle-scene';
import type Phaser from 'phaser';

interface SpectacleRuntime { game: Phaser.Game; scene: SpectacleScene; host: HTMLElement }
let shared: Promise<SpectacleRuntime | null> | null = null;
let owner: GpuBattleEffects | null = null;

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch { return false; }
}
/** Boots the shared layer once per page; null when WebGL is unavailable. */
function spectacleRuntime(): Promise<SpectacleRuntime | null> {
  shared ??= (async () => {
    if (!webglAvailable()) return null;
    const [{ default: PhaserRuntime }, { SpectacleScene }] = await Promise.all([import('phaser'), import('./spectacle-scene')]);
    const host = document.createElement('div');
    host.className = 'radiant-gpu-layer';
    host.setAttribute('aria-hidden', 'true');
    document.body.append(host);
    return new Promise<SpectacleRuntime | null>(resolve => {
      const scene = new SpectacleScene();
      let game: Phaser.Game;
      scene.onReady = () => {
        const runtime = { game, scene, host };
        scene.onActivity = active => {
          if (active) game.loop.wake(); else game.loop.sleep();
        };
        game.loop.sleep();
        exposeStats(scene.stats);
        if (import.meta.env.DEV) (window as Window & { lastLightSpectacle?: SpectacleRuntime }).lastLightSpectacle = runtime;
        resolve(runtime);
      };
      try {
        game = new PhaserRuntime.Game({
          type: PhaserRuntime.WEBGL, parent: host, transparent: true, scene, banner: false,
          scale: { mode: PhaserRuntime.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight },
          render: { antialias: true, powerPreference: 'high-performance' },
          // No delta smoothing: GPU beats stay on the wall clock with the DOM animations after a stall.
          fps: { target: 60, smoothStep: false }, audio: { noAudio: true },
        });
      } catch (error) {
        console.error('Battle effects could not start the GPU layer; static rings are shown instead.', error);
        host.remove(); resolve(null);
      }
    });
  })();
  return shared;
}
/** Development and `?spectacle-stats` builds expose frame timing for the GPU check. */
function exposeStats(stats: SpectacleStats): void {
  if (import.meta.env.DEV || new URLSearchParams(location.search).has('spectacle-stats'))
    (window as Window & { lastLightSpectacleStats?: SpectacleStats }).lastLightSpectacleStats = stats;
}

type Packet = Extract<RadiantCombatEvent, { type: 'damage' | 'heal' | 'shield' | 'status' }>;
const meleeMotions = new Set(['slash', 'thrust', 'hammer', 'twin', 'guard']);

export class GpuBattleEffects implements RadiantBattleEffects {
  private runtime: SpectacleRuntime | null = null;
  private disposed = false;
  private paused = false;
  /** Bumped by cancel, so a wind-up resumed by Skip does not launch its travel beat. */
  private generation = 0;
  private readonly governor = new FlashGovernor();
  /** Fallback timers (no GPU yet) and their static rings. */
  private fallbacks = new Set<{ timer: number; finish: () => void }>();

  constructor(private readonly host: HTMLElement) {
    void spectacleRuntime().then(runtime => {
      if (!runtime || this.disposed) return;
      this.runtime = runtime;
      this.claim();
    });
  }
  /** The latest mounted battle owns the shared layer. */
  private claim(): void {
    if (!this.runtime) return;
    owner = this;
    this.runtime.host.style.visibility = '';
    this.runtime.scene.attach(() => this.host.querySelector<HTMLElement>('.radiant-field'));
    this.runtime.scene.setPaused(this.paused);
  }
  private scene(): SpectacleScene | null {
    if (!this.runtime || this.disposed) return null;
    if (owner !== this) this.claim();
    return this.runtime.scene.ready ? this.runtime.scene : null;
  }
  private anchor(id: string): DOMRect | null {
    const element = Array.from(this.host.querySelectorAll<HTMLElement>('[data-radiant-art]'))
      .find(candidate => candidate.dataset.radiantArt === id);
    const rect = element && (element.querySelector('img') ?? element).getBoundingClientRect();
    return rect && rect.width > 0 && rect.height > 0 ? rect : null;
  }
  private static centre(rect: DOMRect): Point { return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }; }
  /** Element base set (D-485) of the caster's kit plus its signature layers (D-486); neutral when unknown. */
  private bearerStyle(state: RadiantCombatState, id: string): ElementStyle {
    const unit = state.bearers.find(member => member.loadout.id === id);
    return unit ? bearerElementStyle(unit.loadout.starter, radiantBearerKits[unit.loadout.starter]?.elementId) : elementStyle(null);
  }
  private wait(ms: number): Promise<void> {
    const scene = this.scene();
    if (scene) return scene.wait(ms);
    return new Promise(resolve => {
      const entry = { timer: 0, finish: () => { window.clearTimeout(entry.timer); this.fallbacks.delete(entry); resolve(); } };
      entry.timer = window.setTimeout(entry.finish, ms / battleSpeed());
      this.fallbacks.add(entry);
    });
  }
  /** Static element ring (no GPU): finite, pointer-transparent, removed by cancel. */
  private staticRing(rect: DOMRect, tint: number): void {
    const layer = this.host.querySelector<HTMLElement>(':scope > .radiant-fx-layer') ?? this.host;
    const ring = document.createElement('span');
    ring.className = 'radiant-static-ring'; ring.setAttribute('aria-hidden', 'true');
    const centre = GpuBattleEffects.centre(rect);
    ring.style.left = `${centre.x}px`; ring.style.top = `${centre.y}px`;
    ring.style.setProperty('--ring', tintCss(tint));
    layer.append(ring);
    const entry = { timer: 0, finish: () => { window.clearTimeout(entry.timer); this.fallbacks.delete(entry); ring.remove(); } };
    entry.timer = window.setTimeout(entry.finish, staticImpactMs / battleSpeed());
    this.fallbacks.add(entry);
  }
  private shape(action: RadiantPlayerAction, state: RadiantCombatState): { target: KitSkillTarget; melee: boolean; power: number } {
    const unit = state.bearers.find(member => member.loadout.id === action.bearerId);
    const starter = unit?.loadout.starter;
    const kit = starter ? radiantKits[starter as RadiantKitId] : undefined;
    const target: KitSkillTarget = action.type === 'normal' ? 'one-enemy' : action.type === 'skill'
      ? kit?.[action.slot === 2 ? 'skill2' : 'skill1'].target ?? 'one-enemy' : kit?.flare.target ?? 'all-enemies';
    const motion = starter ? characterChoreography[starter as keyof typeof characterChoreography]?.motion : undefined;
    const tier = spectacleTier(action);
    const power = tier === 'normal' ? 0 : tier === 'skill1' ? .35 : tier === 'skill2' ? .65 : 1;
    return { target, melee: meleeMotions.has(motion ?? 'cast'), power };
  }
  private defaultBeats(action: RadiantPlayerAction, state: RadiantCombatState): SpectacleBeats {
    const tier = spectacleTier(action);
    return beatPlan(tier, tier === 'flare' ? readyFlare(state.gauge, action.bearerId) : null, 1);
  }
  async windup(action: RadiantPlayerAction, state: RadiantCombatState, beats?: SpectacleBeats): Promise<void> {
    if (this.disposed) return;
    const plan = beats ?? this.defaultBeats(action, state);
    const scene = this.scene();
    const caster = this.anchor(action.bearerId);
    if (!scene || !caster) { await this.wait(plan.windup + plan.travel); return; }
    const style = this.bearerStyle(state, action.bearerId);
    const shape = this.shape(action, state);
    const from = GpuBattleEffects.centre(caster);
    const generation = this.generation;
    scene.chargeAura(from, plan.windup, style, shape.power);
    await scene.wait(plan.windup);
    if (this.disposed || generation !== this.generation) return;
    const enemies = state.enemies.filter(enemy => enemy.hp > 0).map(enemy => enemy.id);
    const targets = shape.target === 'none' ? [] : shape.target === 'one-enemy'
      ? ['targetId' in action && action.targetId && enemies.includes(action.targetId) ? action.targetId : enemies[0]]
      : enemies;
    if (!targets.length || !targets[0]) {
      // Support kits pulse from the caster to every living ally.
      scene.pulse(from, plan.travel, style, shape.power);
      for (const ally of state.bearers) {
        const rect = ally.hp > 0 && ally.loadout.id !== action.bearerId ? this.anchor(ally.loadout.id) : null;
        if (rect) scene.pulse(GpuBattleEffects.centre(rect), plan.travel, style, shape.power * .6);
      }
    } else {
      for (const id of targets.slice(0, 6)) {
        const rect = this.anchor(id!);
        if (!rect) continue;
        const to = GpuBattleEffects.centre(rect);
        if (shape.melee) scene.slash(to, from, plan.travel, style, shape.power, Math.min(rect.width, rect.height));
        else scene.projectile(from, to, plan.travel, style, shape.power);
      }
    }
    await scene.wait(plan.travel);
  }
  /** `action` null = enemy phase (no caster). Resolves after this hit's slot; particles linger (see `idle`). */
  async impact(frame: RadiantImpactFrame, action?: RadiantPlayerAction | null, state?: RadiantCombatState,
    beats?: SpectacleBeats, finisher = false): Promise<void> {
    if (this.disposed) return;
    const packets = frame.events.filter((event): event is Packet =>
      event.type === 'damage' && event.healthLoss + event.absorbed > 0 ||
      event.type === 'heal' && event.effective > 0 ||
      event.type === 'shield' && event.amount > 0 ||
      event.type === 'status' && !event.clockOnly && event.remaining > 0 && event.status !== 'weaken-removed');
    const slot = action ? (beats ?? (state ? this.defaultBeats(action, state) : null))?.hitInterval ?? 150 : enemyImpactMs;
    if (!packets.length) return;
    const scene = this.scene();
    const tier = action ? spectacleTier(action) : null;
    const seen = new Set<string>();
    for (const packet of packets) {
      if (seen.has(packet.targetId)) continue;
      seen.add(packet.targetId);
      const rect = this.anchor(packet.targetId);
      if (!rect) continue;
      // Enemy hits use the attacker's element base set at the smaller enemy size (owner choice, D-485).
      const style = packet.source.kind === 'enemy'
        ? elementStyle(state?.enemies.find(enemy => enemy.id === (packet.source as { enemyId: string }).enemyId)?.elementId)
        : state ? this.bearerStyle(state, packet.source.bearerId) : elementStyle(null);
      if (!scene) { this.staticRing(rect, style.palette.main); continue; }
      const own = !!action && packet.source.kind !== 'enemy' && packet.source.bearerId === action.bearerId &&
        ['normal', 'skill', 'flare', 'master'].includes(packet.source.kind);
      const kind: BurstKind = packet.type === 'status' ? 'status' : packet.type !== 'damage' ? 'support'
        : packet.source.kind === 'enemy' ? 'enemy'
          : !own || packet.origin !== 'direct' || !tier ? 'normal'
            : tier === 'flare' ? finisher ? 'finisher' : 'flare' : tier;
      scene.burst(GpuBattleEffects.centre(rect), kind, style, Math.min(rect.width, rect.height));
    }
    await this.wait(slot);
  }
  /** Flash, dim and hit-stop requested by the view (R2); flashes pass the WCAG governor. */
  screen(cue: RadiantScreenCue): void {
    const scene = this.scene();
    if (!scene) return;
    if (cue.dim) scene.dim(cue.dim.alpha, cue.dim.inMs, cue.dim.holdMs, cue.dim.outMs);
    if (cue.flash && cue.flash !== 'none') {
      const kind = this.governor.request(cue.flash, performance.now());
      if (kind !== 'none') scene.flash(kind, kind === 'full' ? 220 : 160);
    }
    if (cue.freeze) scene.freeze(cue.freeze);
  }
  idle(): Promise<void> {
    const scene = this.scene();
    return scene ? scene.idle() : Promise.resolve();
  }
  pause(paused: boolean): void {
    this.paused = paused;
    if (owner === this) this.runtime?.scene.setPaused(paused);
  }
  cancel(): void {
    this.generation++;
    for (const entry of [...this.fallbacks]) entry.finish();
    if (owner === this) this.runtime?.scene.cancelAll();
  }
  dispose(): void {
    if (this.disposed) return;
    this.cancel();
    this.disposed = true;
    if (owner === this && this.runtime) {
      owner = null;
      this.runtime.host.style.visibility = 'hidden';
      this.runtime.scene.attach(null);
      this.runtime.scene.setPaused(false);
    }
  }
}
