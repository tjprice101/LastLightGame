/**
 * Shared Spectacle GPU layer (D-484, D-495 step S1): one transparent Phaser WebGL game over the
 * page, booted lazily once and lent to one owner at a time. Battle effects own it during a
 * battle; the summon sequence owns it while it plays. The latest claim wins.
 */
import type Phaser from 'phaser';
import type { SpectacleScene, SpectacleStats } from './spectacle-scene';
import type { FlashGovernor } from './spectacle-timing';

export interface SpectacleRuntime { game: Phaser.Game; scene: SpectacleScene; host: HTMLElement }

/** Who is using the layer. `battle` follows battle speed; `summon` runs on the UI clock (audit §6.5). */
export type SpectacleOwnerKind = 'battle' | 'summon';
export interface SpectacleClaim {
  kind: SpectacleOwnerKind;
  /** The element whose box the scene treats as its frame (battle: the field; summon: a full-screen host). */
  frame: () => HTMLElement | null;
  paused?: boolean;
  governor?: FlashGovernor;
}

let shared: Promise<SpectacleRuntime | null> | null = null;
let current: { owner: object; kind: SpectacleOwnerKind } | null = null;

export function webglAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch { return false; }
}

/** Boots the shared layer once per page; null when WebGL is unavailable or the game cannot start. */
export function spectacleRuntime(): Promise<SpectacleRuntime | null> {
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
        console.error('Spectacle effects could not start the GPU layer; static fallbacks are shown instead.', error);
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

/** Lends the layer to `owner`: shows it, points the scene at the owner's frame and clock. */
export function claimSpectacle(runtime: SpectacleRuntime, owner: object, claim: SpectacleClaim): void {
  if (current && current.owner !== owner) runtime.scene.cancelAll();
  current = { owner, kind: claim.kind };
  runtime.host.style.visibility = '';
  runtime.host.dataset.spectacleOwner = claim.kind;
  runtime.scene.setClock(claim.kind === 'battle' ? 'battle' : 'ui');
  runtime.scene.attach(claim.frame);
  runtime.scene.setPaused(claim.paused ?? false);
  if (claim.governor) runtime.scene.shareFlashGovernor(claim.governor);
}

export function ownsSpectacle(owner: object): boolean { return current?.owner === owner; }

/** Returns the layer if `owner` still holds it: hidden, detached, unpaused, on the battle clock. */
export function releaseSpectacle(runtime: SpectacleRuntime, owner: object): void {
  if (current?.owner !== owner) return;
  current = null;
  runtime.host.style.visibility = 'hidden';
  delete runtime.host.dataset.spectacleOwner;
  runtime.scene.attach(null);
  runtime.scene.setPaused(false);
  runtime.scene.setClock('battle');
}
