import { type AbilityStrength, type FighterDefinition } from '../content/combat';
import { kitPilotDescriptions } from '../content/kit-pilots';
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

export function kitResource(kit: FighterDefinition): string {
  const resource = kit.pilot ? kitPilotDescriptions[kit.pilot].resource : undefined;
  return resource ? `<span class="ability-status" data-effect-family="${resource.effect.family}" data-effect-origin="${resource.effect.origin}" title="${resource.summary}">
    ${statusIcon(elementalStatusArt(resource.effect))}${resource.label}</span><p class="kit-resource-summary">${resource.summary}</p>` : '';
}
