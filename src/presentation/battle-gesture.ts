import { type ActionId } from '../content/combat';

export const gestureThreshold = 32;

export function dragAction(dx: number, dy: number): Exclude<ActionId, 'defend'> | null {
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) throw new Error('Invalid battle gesture coordinates.');
  if (Math.hypot(dx, dy) < gestureThreshold) return null;
  if (Math.abs(dx) === Math.abs(dy)) return null;
  if (Math.abs(dx) > Math.abs(dy)) return dx < 0 ? 'skill1' : 'skill2';
  return dy < 0 ? 'ultimate' : 'light';
}
