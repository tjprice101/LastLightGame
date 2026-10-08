import { type InfusionModeId } from '../content/activities';
import { unlockedInfusionStage, type Account } from '../game/account';

export function infusionEntry(mode: { id: InfusionModeId; name: string }, account: Account | null): string {
  if (!account) return '<button disabled>Resolve the save error before entering</button>';
  const unlocked = unlockedInfusionStage(account, mode.id);
  return `<footer class="activity-entry"><label class="dungeon-stage-label">Stage<select data-infusion-stage="${mode.id}" aria-label="${mode.name} stage">${Array.from({ length: unlocked }, (_, index) => `<option value="${index + 1}" ${index + 1 === unlocked ? 'selected' : ''}>${index + 1}</option>`).join('')}</select></label>
    <button class="primary-button" data-infusion="${mode.id}">Enter ${mode.name}</button></footer>`;
}
