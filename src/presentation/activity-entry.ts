import { type InfusionModeId } from '../content/activities';
import { unlockedInfusionStage, type Account } from '../game/account';
import { activityAccess } from '../game/activity-access';

export function infusionEntry(mode: { id: InfusionModeId; name: string }, account: Account | null): string {
  if (!account) return '<button disabled>Resolve the save error before entering</button>';
  const unlocked = unlockedInfusionStage(account, mode.id);
  const access = activityAccess(account, { kind: 'infusion', mode: mode.id, stage: unlocked });
  return `<footer class="activity-entry"><label class="dungeon-stage-label">Stage<select data-infusion-stage="${mode.id}" aria-label="${mode.name} stage">${Array.from({ length: unlocked }, (_, index) => `<option value="${index + 1}" ${index + 1 === unlocked ? 'selected' : ''}>${index + 1}</option>`).join('')}</select></label>
    <button class="primary-button" data-infusion="${mode.id}" ${access.unlocked ? '' : 'disabled'}>${access.unlocked ? `Enter ${mode.name}` : 'Locked'}</button>
    ${access.unlocked ? '' : `<p class="activity-unlock-hint">Unlocks at ${access.requirement}. Your highest: Lv.${access.level}.</p>`}</footer>`;
}
