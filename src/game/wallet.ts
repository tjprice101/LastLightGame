import { type ProfileStorage } from './profile';
import { type BattleResult } from './battle';

export const WALLET_KEY = 'last-light.wallet';

export function loadFractalis(storage: ProfileStorage): number {
  const raw = storage.getItem(WALLET_KEY);
  if (raw === null) return 0;
  const value: unknown = JSON.parse(raw);
  if (typeof value !== 'object' || value === null ||
      !('version' in value) || value.version !== 1 ||
      !('fractalis' in value) || typeof value.fractalis !== 'number' ||
      !Number.isSafeInteger(value.fractalis) || value.fractalis < 0) {
    throw new Error('The local Fractalis balance is invalid or unsupported. The saved value has not been overwritten.');
  }
  return value.fractalis;
}

export function saveBattleRewards(storage: ProfileStorage, result: BattleResult): number {
  const balance = loadFractalis(storage);
  const rewards = result.events.filter((event) => event.kind === 'reward');
  let total = balance;
  for (const reward of rewards) {
    if (!Number.isSafeInteger(reward.amount) || reward.amount < 5 || reward.amount > 10) {
      throw new Error('Invalid enemy Fractalis drop.');
    }
    total += reward.amount;
    if (!Number.isSafeInteger(total)) throw new Error('Fractalis balance exceeds the supported maximum.');
  }
  if (rewards.length) storage.setItem(WALLET_KEY, JSON.stringify({ version: 1, fractalis: total }));
  return total;
}
