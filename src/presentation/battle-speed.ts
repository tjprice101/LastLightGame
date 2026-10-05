import { type ProfileStorage } from '../game/profile';

export const BATTLE_SPEED_KEY = 'last-light.battle-speed';
export const battleSpeeds = [1, 2, 3] as const;
export type BattleSpeed = (typeof battleSpeeds)[number];

export function parseBattleSpeed(value: string): BattleSpeed {
  if (value === '1') return 1;
  if (value === '2') return 2;
  if (value === '3') return 3;
  throw new Error('Battle speed must be 1x, 2x or 3x.');
}

export function loadBattleSpeed(storage: ProfileStorage): BattleSpeed {
  const value = storage.getItem(BATTLE_SPEED_KEY);
  return value === null ? 1 : parseBattleSpeed(value);
}

export function saveBattleSpeed(storage: ProfileStorage, value: BattleSpeed): void {
  storage.setItem(BATTLE_SPEED_KEY, String(parseBattleSpeed(String(value))));
}

export function battleSpeed(): BattleSpeed {
  return parseBattleSpeed(document.documentElement.dataset.battleSpeed ?? '1');
}

export function applyBattleSpeed(value: BattleSpeed): void {
  const speed = parseBattleSpeed(String(value));
  document.documentElement.dataset.battleSpeed = String(speed);
  document.documentElement.style.setProperty('--battle-speed', String(speed));
  window.dispatchEvent(new Event('last-light-battle-speed-change'));
}
