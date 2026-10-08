import { type ProfileStorage } from './profile';
import { type BattleResult } from './battle';
import { loadAccount, saveAccount } from './account';
import { fractalisDrop } from '../content/loot-random';

export const WALLET_KEY = 'last-light.wallet';

export function loadFractalis(storage: ProfileStorage): number {
  return loadAccount(storage).fractalis;
}

export function saveBattleRewards(storage: ProfileStorage, result: BattleResult): number {
  const account = loadAccount(storage);
  const balance = account.fractalis;
  const rewards = result.events.filter((event) => event.kind === 'reward');
  let total = balance;
  for (const reward of rewards) {
    const enemy = result.state.enemies.find((unit) => unit.id === reward.source);
    if (!enemy || enemy.level === null) throw new Error('Enemy reward source is missing.');
    const range = fractalisDrop(enemy.level);
    if (!Number.isSafeInteger(reward.amount) || reward.amount < range.minimum || reward.amount > range.maximum) {
      throw new Error('Invalid enemy Prismatica drop.');
    }
    total += reward.amount;
    if (!Number.isSafeInteger(total)) throw new Error('Prismatica balance exceeds the supported maximum.');
  }
  if (rewards.length) saveAccount(storage, { ...account, fractalis: total });
  return total;
}
