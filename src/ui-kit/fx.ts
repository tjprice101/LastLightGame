/**
 * Action feedback (D-496, D-497): a saved success is answered by a ring, a burst of sparks, the exact
 * number and a pulse through the living scene. Call it only after the change has been saved, never for a
 * failed or cancelled action and never for an ordinary click. Everything here is finite, ignores the
 * pointer, removes itself, and is replaced by a still highlight when motion is reduced.
 */
import { motionAllowed } from './motion';

let kickScene: (amount?: number) => void = () => {};

/** Connects feedback to the living scene. Called once, with the backdrop's `kick`. */
export function setSceneKick(kick: (amount?: number) => void): void {
  kickScene = kick;
}

/** The scene breathes once. For saved successes that already have their own celebration on screen. */
export function sceneKick(amount = .5): void {
  if (motionAllowed()) kickScene(amount);
}

export interface ActionFxOptions {
  /** A CSS colour; defaults to the accent the origin already inherits. */
  accent?: string;
  /** The exact, already formatted figure to float up, such as `+1,250` or `Lv. 16`. */
  amount?: string;
  tone?: 'gain' | 'spend';
  /** Strength of the pulse through the scene, 0 to 1. */
  kick?: number;
}

const sparkCount = 10;
const lifeMs = 950;
const stillMs = 1400;
const goldenAngle = 2.39996;

/** Plays the feedback from the centre of `origin`. Returns a function that removes it at once. */
export function actionFx(origin: Element, options: ActionFxOptions = {}): () => void {
  if (!origin.isConnected) return () => {};
  if (!motionAllowed()) {
    origin.setAttribute('data-lk-confirmed', '');
    const timer = setTimeout(() => origin.removeAttribute('data-lk-confirmed'), stillMs);
    return () => { clearTimeout(timer); origin.removeAttribute('data-lk-confirmed'); };
  }
  const box = origin.getBoundingClientRect();
  const fx = document.createElement('div');
  fx.className = 'lk-fx';
  fx.setAttribute('aria-hidden', 'true');
  if (options.tone) fx.dataset.tone = options.tone;
  fx.style.left = `${box.left + box.width / 2}px`;
  fx.style.top = `${box.top + box.height / 2}px`;
  if (options.accent) fx.style.setProperty('--accent', options.accent);
  fx.append(Object.assign(document.createElement('span'), { className: 'lk-fx-ring' }));
  for (let index = 0; index < sparkCount; index += 1) {
    const spark = document.createElement('i');
    const angle = index * goldenAngle, reach = 46 + (index % 4) * 14;
    spark.className = 'lk-fx-spark';
    spark.style.setProperty('--dx', `${Math.round(Math.cos(angle) * reach)}px`);
    spark.style.setProperty('--dy', `${Math.round(Math.sin(angle) * reach)}px`);
    spark.style.animationDelay = `${index * 12}ms`;
    fx.append(spark);
  }
  if (options.amount) fx.append(Object.assign(document.createElement('b'), { className: 'lk-fx-number', textContent: options.amount }));
  // An open dialog is in the top layer; feedback for a control inside it must be too.
  (origin.closest('dialog[open]') ?? document.body).append(fx);
  kickScene(options.kick ?? .5);
  const remove = (): void => { clearTimeout(timer); fx.remove(); };
  const timer = setTimeout(remove, lifeMs);
  return remove;
}
