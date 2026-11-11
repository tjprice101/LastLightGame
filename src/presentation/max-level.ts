import { maxLevelPlan, type Account, type MaxLevelPlan } from '../game/account';
import { isStarterId } from '../content/starters';
import { characterName } from '../content/character-art';
import { resolveFighter } from '../content/combat';
import { resolveCapturedFighter } from '../game/character-instances';
import { itemShowcase } from './item-showcase';
import { statPreview } from './stat-preview';
import { phaseZeroStatsReady } from '../content/phase-zero-stats';
import { isRadiantBearer, radiantCharacterLoadout, radiantStatPreview } from './character-combat';
import { escapeDialogText } from './game-dialog';
import './growth-layout.css';

export function maxLevelPreview(account: Account, id: string): { html: string; plan: MaxLevelPlan } {
  const plan = maxLevelPlan(account, id);
  const copy = account.capturedCharacters?.find((entry) => entry.instanceId === id);
  const equipment = account.conduitEquipment?.[id];
  const progress = isStarterId(id) ? account.characters[id] : undefined;
  const before = isStarterId(id) ? resolveFighter(id, progress, equipment, account.conduitUpgrades, account.masterEquipment?.[id] ?? undefined).stats
    : copy ? resolveCapturedFighter(copy, equipment, account.conduitUpgrades).stats : null;
  const after = isStarterId(id) && progress ? resolveFighter(id, { ...progress, level: plan.targetLevel }, equipment, account.conduitUpgrades, account.masterEquipment?.[id] ?? undefined).stats
    : copy ? resolveCapturedFighter({ ...copy, level: plan.targetLevel }, equipment, account.conduitUpgrades).stats : null;
  if (!before || !after) throw new Error('Character stats are unavailable.');
  const resolvedBefore = isRadiantBearer(id) ? radiantCharacterLoadout(account, id) : null;
  const radiantBefore = resolvedBefore?.loadout;
  const radiantAfter = isRadiantBearer(id) ? radiantCharacterLoadout(account, id, { level: plan.targetLevel })?.loadout : undefined;
  const changes = radiantBefore && radiantAfter ? radiantStatPreview(radiantBefore, radiantAfter, 'span') : statPreview(before, after, 'span', phaseZeroStatsReady ? {} : {
      crit: 'Critical rate', critMultiplier: 'Critical multiplier',
      shatterCapacity: 'Elemental Gauge capacity', elementalDamage: 'Elemental damage',
    });
  return { plan, html: `<header class="max-level-summary"><h2 id="max-level-heading">Max Level</h2>
    <p>Level ${plan.currentLevel} &rarr; ${plan.targetLevel} · Cap ${plan.cap}</p>
    ${copy ? '<p>Captured Elemental-Devourers cannot join Radiant squads. These are archived stat changes; leveling does not change sale or evolution value.</p>'
      : resolvedBefore?.issue ? `<p role="alert">${escapeDialogText(resolvedBefore.issue)}</p>` : !radiantBefore ? '<p>These are archived stats; this Element-Bearer is not available in Radiant combat.</p>' : ''}</header>
    <div class="max-level-workspace"><section class="max-level-cost" aria-label="Leveling cost">
    ${itemShowcase([{ id: 'fractalis', amount: plan.cost.fractalis }, ...Object.entries(plan.cost.materials).map(([id, amount]) => ({ id, amount }))], 'Total cost')}
    </section><section class="max-level-stats" aria-label="Stat changes"><h3>Stat changes</h3><div class="upgrade-stat-preview">${changes}</div></section></div>
    <footer class="max-level-actions"><p>${plan.targetLevel === plan.currentLevel ? plan.currentLevel === plan.cap ? 'Level cap reached.' : 'Insufficient resources for the next level.' : `Level ${isStarterId(id) ? characterName(id, progress?.evolution) : 'this Elemental-Devourer'} to ${plan.targetLevel}?`}</p>
    <button type="button" class="primary-button" data-confirm-max-level ${plan.targetLevel === plan.currentLevel ? 'disabled' : ''}>Confirm leveling</button></footer>` };
}
