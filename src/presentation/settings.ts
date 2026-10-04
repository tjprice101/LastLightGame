import { type ProfileStorage } from '../game/profile';

export const SETTINGS_KEY = 'last-light.settings';
export type MotionPreference = 'system' | 'reduced';

export function loadMotion(storage: ProfileStorage): MotionPreference {
  const value = storage.getItem(SETTINGS_KEY);
  if (value === null) return 'system';
  if (value !== 'system' && value !== 'reduced') throw new Error('Unsupported motion setting.');
  return value;
}

export function saveMotion(storage: ProfileStorage, value: MotionPreference): void {
  if (value !== 'system' && value !== 'reduced') throw new Error('Invalid motion preference.');
  storage.setItem(SETTINGS_KEY, value);
}

export function applyMotion(value: MotionPreference): void {
  document.documentElement.dataset.motion = value;
  window.dispatchEvent(new Event('last-light-motion-change'));
}

export function reducedMotion(): boolean {
  return document.documentElement.dataset.motion === 'reduced' ||
    matchMedia('(prefers-reduced-motion: reduce)').matches;
}
