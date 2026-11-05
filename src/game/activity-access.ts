import { calamityUnlockedTier, hasCalamiticElementBearer, unlockedOblivionStage, type Account } from './account';
import { isCalamityActivityId, isCalamityTier } from '../content/calamity';
import type { Activity } from '../online/server-game';
import { starters } from '../content/starters';
import { storyRules } from '../content/story';
import { characterGrowthFactor } from '../content/progression';
import { gatesOfOblivionRules, isOblivionStage } from '../content/gates-of-oblivion';
import { isNewEventId, newEventDefinition, newEventWindowActive } from '../content/moon-sunshade-events';

export function highestBearerLevel(account: Account): number {
  let highest = 0;
  for (const { id } of starters) {
    const progress = account.characters[id];
    if (!progress) continue;
    characterGrowthFactor(progress, id);
    highest = Math.max(highest, progress.level);
  }
  return highest;
}

export function activityAccess(account: Account, activity: Activity, now = Date.now()) {
  if (activity.kind === 'oblivion') {
    const owned = hasCalamiticElementBearer(account);
    const stageUnlocked = isOblivionStage(activity.stage) && activity.stage <= unlockedOblivionStage(account);
    return { unlocked: owned && stageUnlocked, minimumLevel: 0, level: highestBearerLevel(account),
      requirement: !owned ? 'Own any Calamitic Element-Bearer' : `Clear Gates of Oblivion Floor ${activity.stage - 1}` };
  }
  if (activity.kind === 'calamity') {
    const valid = isCalamityActivityId(activity.activity) && isCalamityTier(activity.tier);
    const highestTier = valid ? calamityUnlockedTier(account, activity.activity) : 0;
    const unlocked = valid && activity.tier <= highestTier;
    const requirement = highestTier === 0 ? 'Defeat this activity\'s final boss on Normal'
      : `Clear Calamity EX+${activity.tier - 1}`;
    return { unlocked, minimumLevel: 0, level: highestBearerLevel(account), requirement };
  }
  const event = activity.kind === 'infusion' && isNewEventId(activity.mode) ? newEventDefinition(activity.mode) : undefined;
  const minimumLevel = activity.kind === 'dungeon' ? 30 : activity.kind === 'war' ? 85
    : activity.kind !== 'infusion' ? 0 : activity.mode === 'machines' ? 10
    : activity.mode === 'treasury' || activity.mode === 'sanctuary' ? 60
    : activity.mode === 'roses' || event ? 75 : 50;
  const firstRegion = activity.kind === 'infusion' && activity.mode === 'machines';
  const level = highestBearerLevel(account);
  const regionCleared = !firstRegion || (account.storyCompleted ?? 0) >= storyRules.regionStages;
  const requirement = `Element-Bearer Lv.${minimumLevel}${firstRegion ? ' · Clear Emberwake March' : ''}`;
  const active = !event || newEventWindowActive(event.id, now);
  return { unlocked: level >= minimumLevel && regionCleared && active, minimumLevel, level,
    requirement: event && !active ? `${event.activityName} is not active` : requirement };
}

export function assertActivityAccess(account: Account, activity: Activity, now = Date.now()): void {
  if (activity.kind === 'oblivion' && !isOblivionStage(activity.stage)) {
    throw new Error(`Gates of Oblivion floor must be an integer from 1 to ${gatesOfOblivionRules.stages}.`);
  }
  const access = activityAccess(account, activity, now);
  if (!access.unlocked) throw new Error(`Activity locked. Requires ${access.requirement}. Your highest Element-Bearer is Lv.${access.level}.`);
}
