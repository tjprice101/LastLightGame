import type { Account } from './account';
import type { Activity } from '../online/server-game';
import { starters } from '../content/starters';
import { characterGrowthFactor } from '../content/progression';

export function highestBearerLevel(account: Account): number {
  let highest = 0;
  for (const { id } of starters) {
    const progress = account.characters[id];
    if (!progress) continue;
    characterGrowthFactor(progress);
    highest = Math.max(highest, progress.level);
  }
  return highest;
}

export function activityAccess(account: Account, activity: Activity) {
  const minimumLevel = activity.kind === 'dungeon' ? 30 : activity.kind === 'war' ? 85
    : activity.kind !== 'infusion' ? 0 : activity.mode === 'machines' ? 10
    : activity.mode === 'treasury' || activity.mode === 'sanctuary' ? 60
    : activity.mode === 'roses' ? 75 : 50;
  const firstRegion = activity.kind === 'infusion' && activity.mode === 'machines';
  const level = highestBearerLevel(account);
  const regionCleared = !firstRegion || (account.storyCompleted ?? 0) >= 25;
  const requirement = `Element-Bearer Lv.${minimumLevel}${firstRegion ? ' · Clear Emberwake March' : ''}`;
  return { unlocked: level >= minimumLevel && regionCleared, minimumLevel, level, requirement };
}

export function assertActivityAccess(account: Account, activity: Activity): void {
  const access = activityAccess(account, activity);
  if (!access.unlocked) throw new Error(`Activity locked. Requires ${access.requirement}. Your highest Element-Bearer is Lv.${access.level}.`);
}
