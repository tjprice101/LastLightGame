/**
 * The menu backdrop (D-496): mounts the living scene engine in `#backdrop` and shows the scene for the
 * current screen. Without WebGL, on software rendering, or if no scene compiles, nothing is mounted and
 * the CSS backdrop underneath stays (`html.scene-live` is what hides it).
 */
import { type ElementId } from '../content/activities';
import { type AmbientScreen } from '../presentation/ambient-background';
import { reducedMotion } from '../presentation/settings';
import { softwareRenderer } from '../vfx/shaders/spectacle-fx';
import { SceneEngine, type SceneQuality } from './scene-engine';
import { sceneFor } from './scene-palettes';

export interface SceneBackdrop {
  /** True while the shader scene is drawing (false on the CSS fallback). */
  readonly live: boolean;
  /** Shows the scene for a screen; `battle` puts the backdrop to sleep. */
  show(screen: AmbientScreen, leader: ElementId | null): void;
  /** A successful action: the scene breathes once. Ignored on the fallback and under Reduce motion. */
  kick(amount?: number): void;
}

function deviceQuality(): SceneQuality {
  const info = navigator as Navigator & { deviceMemory?: number };
  return (navigator.hardwareConcurrency || 8) <= 4 || (info.deviceMemory ?? 8) <= 4 ? 'low' : 'high';
}

export function createSceneBackdrop(host: HTMLElement): SceneBackdrop {
  const fallback: SceneBackdrop = { live: false, show() {}, kick() {} };
  const canvas = document.createElement('canvas');
  const systemMotion = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
  let live = false;
  const stop = (): void => {
    live = false;
    document.documentElement.classList.remove('scene-live');
    canvas.remove();
  };
  let engine: SceneEngine;
  try {
    host.append(canvas);
    engine = new SceneEngine(canvas, {
      quality: deviceQuality(),
      motionAllowed: () => !reducedMotion() && !systemMotion?.matches,
      onFail: () => { stop(); engine.dispose(); },
    });
  } catch (error) {
    console.error('The living backdrop could not start; the static backdrop is shown instead.', error);
    stop();
    return fallback;
  }
  if (!engine.supported || softwareRenderer(engine.renderer)) {
    stop();
    engine.dispose();
    return fallback;
  }
  live = true;
  document.documentElement.classList.add('scene-live');
  systemMotion?.addEventListener('change', engine.refresh);
  window.addEventListener('last-light-motion-change', engine.refresh);
  if (import.meta.env.DEV) (window as Window & { lastLightScene?: SceneEngine }).lastLightScene = engine;
  return {
    get live() { return live; },
    show(screen, leader) {
      if (!live) return;
      const resolved = sceneFor(screen, leader);
      if (!resolved) { engine.setActive(false); return; }
      engine.setScene(resolved.scene, resolved.palette);
      engine.setIntensity(resolved.intensity);
      engine.setActive(true);
    },
    kick(amount) { if (live) engine.kick(amount); },
  };
}
