import { type AbilityStrength, type FighterDefinition } from '../content/combat';
import { kitPilotDescriptions, kitResourceUses } from '../content/kit-pilots';
import type { StarterId } from '../content/starters';
import { elementalStatusArt } from '../content/status-art';
import { statusIcon } from './status-icon';
import { elementalEffectFamilies, type ElementalEffectFamily } from '../content/elemental-effects';

export function abilityStatuses(strength: AbilityStrength): string {
  const effects: readonly [number | undefined, ElementalEffectFamily, string][] = [
    [strength.burnMultiplier, 'burn', 'Burn'],
    [strength.weakenFraction, 'suppression', 'Weaken'],
    [strength.shield, 'ward', 'Shield'],
    [strength.healing, 'bloom', 'Healing'],
    [strength.critBonus, 'focus', 'Critical boost'],
    [strength.attackBoostFraction, 'focus', 'Attack boost'],
  ];
  const active = effects.filter(([value]) => value !== undefined && value > 0);
  return active.length ? `<span class="ability-statuses">${active.map(([, family, label]) =>
    `<span class="ability-status" data-effect-family="${family}" title="${elementalEffectFamilies[family].label} · ${label}">${statusIcon(family)}${label}</span>`).join('')}</span>` : '';
}

export function kitResource(kit: FighterDefinition, character?: StarterId): string {
  const resource = kit.pilot ? kitPilotDescriptions[kit.pilot].resource : undefined;
  const usage = character ? kitResourceUses[character] : resource?.detail;
  return resource ? `<span class="ability-status" data-effect-family="${resource.effect.family}" data-effect-origin="${resource.effect.origin}">
    ${statusIcon(elementalStatusArt(resource.effect))}${resource.label} · Up to 3 charges</span><p class="kit-resource-summary"><strong>What the charges do:</strong> ${usage} Spending resets the saved charges to 0. At 0 charges, the skill still has its normal effect.</p>` : '';
}
