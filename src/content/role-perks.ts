import { getStarter, isStarterId } from './starters';

export type IntrinsicBonuses = Partial<Record<'health' | 'defense' | 'damage' | 'skillPower', number>>;
export function intrinsicRole(id: string, captured = false): 'Tank' | 'Attacker' | 'Support' | undefined {
  if (captured || !isStarterId(id)) return undefined;
  const role = getStarter(id).role;
  return role === 'Healer & Support' ? 'Support' : role;
}
export function roleBonuses(id: string, captured = false): IntrinsicBonuses {
  switch (intrinsicRole(id, captured)) {
    case 'Tank': return { defense: .5 };
    case 'Attacker': return { damage: 1, skillPower: .5 };
    case 'Support': return { health: .5, skillPower: .25 };
    default: return {};
  }
}
export function rolePerkText(id: string, captured = false): string {
  switch (intrinsicRole(id, captured)) {
    case 'Tank': return 'Tank perk: Enemies target this character more often. +50% Defense.';
    case 'Attacker': return 'Attacker perk: +100% Direct Damage, +50% Skill Power.';
    case 'Support': return 'Support perk: Skills and Last Flare heal the squad for 4% max Health. +50% Health, +25% Skill Power.';
    default: return '';
  }
}
export function roleTarget<T extends { definitionId: string; captured?: unknown }>(living: readonly T[], roll: number): T {
  if (!living.length) throw new Error('Target selection needs a living member.');
  const weight = (unit: T) => intrinsicRole(unit.definitionId, !!unit.captured) === 'Tank' ? 1.25 : 1;
  let remaining = roll * living.reduce((sum, unit) => sum + weight(unit), 0);
  for (const unit of living) {
    remaining -= weight(unit);
    if (remaining < 0) return unit;
  }
  return living[living.length - 1];
}
