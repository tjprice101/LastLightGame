import { maxLevelPlan, type Account, type MaxLevelPlan } from '../game/account';
import { isStarterId } from '../content/starters';
import { characterName } from '../content/character-art';
import { resolveFighter } from '../content/combat';
import { resolveCapturedFighter } from '../game/character-instances';
import { itemShowcase } from './item-showcase';
import { statChange } from './stat-change';

export function maxLevelPreview(account: Account, id: string): { html: string; plan: MaxLevelPlan } {
  const plan = maxLevelPlan(account, id);
  const copy = account.capturedCharacters?.find((entry) => entry.instanceId === id);
  const equipment = account.conduitEquipment?.[id];
  const progress = isStarterId(id) ? account.characters[id] : undefined;
  const before = isStarterId(id) ? resolveFighter(id, progress, equipment, account.conduitUpgrades).stats
    : copy ? resolveCapturedFighter(copy, equipment, account.conduitUpgrades).stats : null;
  const after = isStarterId(id) && progress ? resolveFighter(id, { ...progress, level: plan.targetLevel }, equipment, account.conduitUpgrades).stats
    : copy ? resolveCapturedFighter({ ...copy, level: plan.targetLevel }, equipment, account.conduitUpgrades).stats : null;
  if (!before || !after) throw new Error('Character stats are unavailable.');
  const labels = { health: 'Health', defense: 'Defense', damage: 'Attack', crit: 'Critical rate',
    critMultiplier: 'Critical multiplier', shatterCapacity: 'Shatter capacity', elementalDamage: 'Elemental damage' } as const;
  return { plan, html: `<h2 id="max-level-heading">Max Level</h2>
    <p>Level ${plan.currentLevel} &rarr; ${plan.targetLevel} ~ Cap ${plan.cap}</p>
    ${itemShowcase([{ id: 'fractalis', amount: plan.cost.fractalis }, ...Object.entries(plan.cost.materials).map(([id, amount]) => ({ id, amount }))], 'Total cost')}
    <h3>Stat changes</h3><div class="upgrade-stat-preview">${Object.entries(labels).map(([key, label]) => {
      const stat = key as keyof typeof labels;
      return `<span><small>${label}</small><strong>${statChange(before[stat], after[stat], stat === 'crit' ? '%' : stat === 'critMultiplier' ? 'x' : '')}</strong></span>`;
    }).join('')}</div>
    <p>${plan.targetLevel === plan.currentLevel ? plan.currentLevel === plan.cap ? 'Level cap reached.' : 'Insufficient resources for the next level.' : `Level ${isStarterId(id) ? characterName(id, progress?.evolution) : 'this creature'} to ${plan.targetLevel}?`}</p>
    <button type="button" class="primary-button" data-confirm-max-level ${plan.targetLevel === plan.currentLevel ? 'disabled' : ''}>Confirm leveling</button>` };
}
