import { getStarter, type StarterId } from './starters';
import { characterGrowthFactor, characterPotencyFactor, weaponRules, type CharacterProgress } from './progression';
import { getConduit, conduitBuffs, validateConduitSlots, validateConduitElement, type ConduitSlots, type ConduitUpgrades } from './conduits';
import { type ElementId } from './activities';
import { flagshipFighters } from './flagships';

export const actionIds = ['light', 'skill1', 'skill2', 'ultimate', 'defend'] as const;
export type ActionId = (typeof actionIds)[number];
export const defenseMode = { damageReduction: 0.1 } as const;
export const shatterGauge = {
  maximum: 100,
  starting: 0,
  incomingHit: 10,
  gains: { light: 20, defend: 0, skill1: 0, skill2: 0, ultimate: 0 },
  costs: { light: 0, defend: 0, skill1: 25, skill2: 40, ultimate: 100 },
} as const;
export interface Stats {
  health: number;
  defense: number;
  damage: number;
  crit: number;
  shatterCapacity: number;
  critMultiplier: number;
  elementalDamage: number;
}
export interface AbilityStrength {
  damageMultiplier?: number;
  burnMultiplier?: number;
  weakenFraction?: number;
  critBonus?: number;
  shield?: number;
  healing?: number;
  attackBoostFraction?: number;
}
export interface Ability { name: string; description: string; cooldown: number; strength: AbilityStrength; targets?: 'all-enemies' | 'all-allies' }
export interface FighterDefinition {
  stats: Stats;
  passive: { name: string; description: string; damageBonus: number; defenseBonus: number; healFraction: number };
  abilities: Record<'skill1' | 'skill2' | 'ultimate', Ability>;
  unavailableActions?: ('skill1' | 'skill2' | 'ultimate')[];
}

export const fighters: Record<StarterId, FighterDefinition> = {
  ...flagshipFighters,
  ember: {
    stats: { health: 220, defense: 10, damage: 38, crit: 0.15, shatterCapacity: 100, critMultiplier: 1.5, elementalDamage: 8 },
    passive: { name: 'Unbroken Ember', description: '+20% outgoing damage at or below 50% health.', damageBonus: 0.2, defenseBonus: 0, healFraction: 0 },
    abilities: {
      skill1: { name: 'Cinder Cleave', description: '160% damage to one enemy; burn for 8 damage on its next two enemy phases.', cooldown: 2, strength: { damageMultiplier: 1.6, burnMultiplier: 1 } },
      skill2: { name: 'Flame Arc', description: '110% damage to every living enemy.', cooldown: 3, strength: { damageMultiplier: 1.1 } },
      ultimate: { name: 'Last Flare: Dawnfire', description: '280% damage to every enemy. Recover next turn.', cooldown: 0, strength: { damageMultiplier: 2.8 } },
    },
  },
  tide: {
    stats: { health: 260, defense: 16, damage: 30, crit: 0.1, shatterCapacity: 100, critMultiplier: 1.5, elementalDamage: 0 },
    passive: { name: 'Stillwater Guard', description: '+8 defense, already included in displayed effective defense.', damageBonus: 0, defenseBonus: 8, healFraction: 0 },
    abilities: {
      skill1: { name: 'Undertow Thrust', description: '150% damage to one enemy; reduce its next two enemy-phase attacks by 25%.', cooldown: 2, strength: { damageMultiplier: 1.5, weakenFraction: 0.25 } },
      skill2: { name: 'Tidal Shelter', description: 'Give every living ally 25 shield (refresh to at least 25; does not stack).', cooldown: 3, strength: { shield: 25 } },
      ultimate: { name: 'Last Flare: Ocean Memory', description: '220% damage to all enemies and 35 shield for allies. Recover next turn.', cooldown: 0, strength: { damageMultiplier: 2.2, shield: 35 } },
    },
  },
  sprout: {
    stats: { health: 190, defense: 8, damage: 32, crit: 0.2, shatterCapacity: 100, critMultiplier: 1.5, elementalDamage: 0 },
    passive: { name: 'Root of Hope', description: 'At each new player turn, heal living allies by 5% of their maximum health while Flora lives.', damageBonus: 0, defenseBonus: 0, healFraction: 0.05 },
    abilities: {
      skill1: { name: 'Briar Shot', description: '150% damage to one enemy with +20 percentage points critical chance.', cooldown: 2, strength: { damageMultiplier: 1.5, critBonus: 0.2 } },
      skill2: { name: 'Verdant Renewal', description: 'Restore 30 health to every living ally; cannot revive.', cooldown: 3, strength: { healing: 30 } },
      ultimate: { name: 'Last Flare: Worldseed', description: '180% damage to all enemies and heal living allies by 55. Recover next turn.', cooldown: 0, strength: { damageMultiplier: 1.8, healing: 55 } },
    },
  },
  rosetta: {
    stats: { health: 225, defense: 11, damage: 43, crit: .2, shatterCapacity: 100, critMultiplier: 1.6, elementalDamage: 0 },
    passive: { name: 'Virtuous Bloom', description: 'At each new player turn, heal living allies by 2% of maximum health while Rosetta lives.', damageBonus: 0, defenseBonus: 0, healFraction: .02 },
    abilities: {
      skill1: { name: 'Golden Thorn Volley', description: '170% damage to one enemy; reduce surviving targets\' attacks by 20% for two enemy phases.', cooldown: 2, strength: { damageMultiplier: 1.7, weakenFraction: .2 } },
      skill2: { name: 'Crimson Skyfall', description: '120% damage to every living enemy; weaken by 15% for two enemy phases.', cooldown: 3, targets: 'all-enemies', strength: { damageMultiplier: 1.2, weakenFraction: .15 } },
      ultimate: { name: 'Last Flare: Rose Beyond the Sun', description: '300% damage to every living enemy; weaken by 30% for two enemy phases. Recover next turn.', cooldown: 0, targets: 'all-enemies', strength: { damageMultiplier: 3, weakenFraction: .3 } },
    },
  },
  thornia: {
    stats: { health: 280, defense: 17, damage: 31, crit: .1, shatterCapacity: 100, critMultiplier: 1.5, elementalDamage: 0 },
    passive: { name: 'Forbidden Garden', description: '+9 defense, included in effective defense.', damageBonus: 0, defenseBonus: 9, healFraction: 0 },
    abilities: {
      skill1: { name: 'Gilded Thorn Guard', description: 'Give every living ally 30 shield (refresh; does not stack).', cooldown: 2, targets: 'all-allies', strength: { shield: 30 } },
      skill2: { name: 'Shadow Rose Cleave', description: '180% damage to one enemy; weaken by 20% for two enemy phases.', cooldown: 3, strength: { damageMultiplier: 1.8, weakenFraction: .2 } },
      ultimate: { name: 'Last Flare: Thousand-Rose Dominion', description: '240% damage to all enemies and 40 shield for allies. Recover next turn.', cooldown: 0, targets: 'all-enemies', strength: { damageMultiplier: 2.4, shield: 40 } },
    },
  },
  crinso: {
    stats: { health: 205, defense: 9, damage: 41, crit: .25, shatterCapacity: 100, critMultiplier: 1.7, elementalDamage: 9 },
    passive: { name: 'Rose Duality', description: '+15% outgoing damage at or below 50% health.', damageBonus: .15, defenseBonus: 0, healFraction: 0 },
    abilities: {
      skill1: { name: 'Golden Edge', description: '180% damage to one enemy with +15 percentage points critical chance.', cooldown: 2, strength: { damageMultiplier: 1.8, critBonus: .15 } },
      skill2: { name: 'Crimson Rupture', description: '120% damage to every living enemy; burn for 9 on two enemy phases.', cooldown: 3, targets: 'all-enemies', strength: { damageMultiplier: 1.2, burnMultiplier: 1 } },
      ultimate: { name: 'Last Flare: Blossoming Cataclysm', description: '310% damage to every living enemy; burn for 14 on two enemy phases. Recover next turn.', cooldown: 0, targets: 'all-enemies', strength: { damageMultiplier: 3.1, burnMultiplier: 1.5 } },
    },
  },
};

export const enemyIds = ['goblin', 'imp', 'golem'] as const;
export const adventureScaling = { healthPerWave: 0.24, damagePerWave: 0.24, defensePerWave: 2 } as const;
export type EnemyId = (typeof enemyIds)[number];
export const enemies: Record<EnemyId, { name: string; art: string; element: ElementId; stats: Stats }> = {
  goblin: { name: 'Goblin', art: 'goblin', element: 'efflorescent', stats: { health: 110, defense: 5, damage: 23, crit: 0.1, shatterCapacity: 100, critMultiplier: 1.5, elementalDamage: 0 } },
  imp: { name: 'Imp', art: 'imp', element: 'infernic', stats: { health: 90, defense: 3, damage: 28, crit: 0.15, shatterCapacity: 100, critMultiplier: 1.5, elementalDamage: 0 } },
  golem: { name: 'Rock Golem', art: 'rock-golem', element: 'tectonic', stats: { health: 160, defense: 15, damage: 20, crit: 0.05, shatterCapacity: 100, critMultiplier: 1.5, elementalDamage: 0 } },
};

export function formatStat(value: number): string {
  return String(Number(value.toFixed(2)));
}

export function resolveFighter(id: StarterId, progress?: CharacterProgress, equipment?: ConduitSlots, upgrades?: ConduitUpgrades): FighterDefinition {
  const base = fighters[id];
  if (!base) throw new Error('Unknown fighter definition.');
  const factor = progress ? characterGrowthFactor(progress) : 1;
  const potency = progress ? characterPotencyFactor(progress) : 1;
  const kit = structuredClone(base);
  for (const key of ['health', 'damage', 'elementalDamage'] as const) {
    kit.stats[key] = base.stats[key] * factor;
  }
  kit.stats.defense = (base.stats.defense + base.passive.defenseBonus) * factor ** .7;
  kit.stats.damage *= 1 + (progress?.weaponRank ?? 0) * weaponRules.attackPerRank;
  kit.stats.crit = Math.min(.75, base.stats.crit * potency);
  kit.stats.critMultiplier = Math.min(3, base.stats.critMultiplier * potency);
  kit.stats.shatterCapacity = base.stats.shatterCapacity * potency;
  kit.passive.defenseBonus *= factor ** .7;
  kit.passive.damageBonus = Math.min(.75, base.passive.damageBonus * potency);
  kit.passive.healFraction = Math.min(.1, base.passive.healFraction * potency);
  for (const action of ['skill1', 'skill2', 'ultimate'] as const) {
    const strength = kit.abilities[action].strength;
    for (const key of ['damageMultiplier', 'burnMultiplier', 'weakenFraction', 'critBonus', 'shield', 'healing', 'attackBoostFraction'] as const) {
      const value = strength[key];
      if (value !== undefined) strength[key] = value * (key === 'shield' || key === 'healing' ? factor : potency);
    }
    if (strength.weakenFraction !== undefined) strength.weakenFraction = Math.min(.5, strength.weakenFraction);
    if (strength.critBonus !== undefined) strength.critBonus = Math.min(.5, strength.critBonus);
    if (strength.attackBoostFraction !== undefined) strength.attackBoostFraction = Math.min(.5, strength.attackBoostFraction);
  }
  if (equipment) validateConduitElement(equipment, getStarter(id).elementId);
  applyConduitBuffs(kit.stats, equipment, upgrades);
  const pct = (value: number) => formatStat(value * 100);
  const value = (action: 'skill1' | 'skill2' | 'ultimate', key: keyof AbilityStrength): number => {
    const amount = kit.abilities[action].strength[key];
    if (amount === undefined) throw new Error(`Missing ${id} ${action} strength: ${key}.`);
    return amount;
  };
  if (id === 'ember') {
    kit.passive.description = `+${pct(kit.passive.damageBonus)}% outgoing damage at or below 50% health.`;
    kit.abilities.skill1.description = `${pct(value('skill1', 'damageMultiplier'))}% damage to one enemy; burn for ${Math.round(kit.stats.elementalDamage * value('skill1', 'burnMultiplier'))} damage on its next two enemy phases.`;
    kit.abilities.skill2.description = `${pct(value('skill2', 'damageMultiplier'))}% damage to every living enemy.`;
    kit.abilities.ultimate.description = `${pct(value('ultimate', 'damageMultiplier'))}% damage to every enemy. Recover next turn.`;
  } else if (id === 'tide') {
    kit.passive.description = `+${formatStat(kit.passive.defenseBonus)} defense, already included in displayed effective defense.`;
    kit.abilities.skill1.description = `${pct(value('skill1', 'damageMultiplier'))}% damage to one enemy; reduce its next two enemy-phase attacks by ${pct(value('skill1', 'weakenFraction'))}%.`;
    kit.abilities.skill2.description = `Give every living ally ${formatStat(value('skill2', 'shield'))} shield (refresh to at least ${formatStat(value('skill2', 'shield'))}; does not stack).`;
    kit.abilities.ultimate.description = `${pct(value('ultimate', 'damageMultiplier'))}% damage to all enemies and ${formatStat(value('ultimate', 'shield'))} shield for allies. Recover next turn.`;
  } else if (id === 'sprout') {
    kit.passive.description = `At each new player turn, heal living allies by ${pct(kit.passive.healFraction)}% of their maximum health while Flora lives.`;
    kit.abilities.skill1.description = `${pct(value('skill1', 'damageMultiplier'))}% damage to one enemy with +${pct(value('skill1', 'critBonus'))} percentage points critical chance.`;
    kit.abilities.skill2.description = `Restore ${formatStat(value('skill2', 'healing'))} health to every living ally; cannot revive.`;
    kit.abilities.ultimate.description = `${pct(value('ultimate', 'damageMultiplier'))}% damage to all enemies and heal living allies by ${formatStat(value('ultimate', 'healing'))}. Recover next turn.`;
  } else {
    kit.passive.description = kit.passive.healFraction > 0
      ? `At each new player turn, heal living allies by ${pct(kit.passive.healFraction)}% of maximum health while this Element-Bearer lives.`
      : kit.passive.defenseBonus > 0 ? `+${formatStat(kit.passive.defenseBonus)} defense, included in effective defense.`
        : `+${pct(kit.passive.damageBonus)}% outgoing damage at or below 50% health.`;
    for (const action of ['skill1', 'skill2', 'ultimate'] as const) {
      const ability = kit.abilities[action];
      const strength = ability.strength;
      const effects: string[] = [];
      if (strength.damageMultiplier !== undefined) effects.push(`${pct(strength.damageMultiplier)}% damage to ${ability.targets === 'all-enemies' ? 'every living enemy' : 'one enemy'}`);
      if (strength.weakenFraction !== undefined) effects.push(`reduce surviving targets' next two enemy-phase attacks by ${pct(strength.weakenFraction)}%`);
      if (strength.critBonus !== undefined) effects.push(`+${pct(strength.critBonus)} percentage points critical chance`);
      if (strength.burnMultiplier !== undefined) effects.push(`burn surviving targets for ${Math.round(kit.stats.elementalDamage * strength.burnMultiplier)} damage on their next two enemy phases`);
      if (strength.shield !== undefined) effects.push(`give every living ally ${formatStat(strength.shield)} shield (refresh; does not stack)`);
      if (strength.healing !== undefined) effects.push(`restore ${formatStat(strength.healing)} health to every living ally; cannot revive`);
      if (strength.attackBoostFraction !== undefined) effects.push(`increase living allies' outgoing attack damage by ${pct(strength.attackBoostFraction)}% this and next player turn (refresh; does not stack)`);
      ability.description = `${effects.join('; ')}.${action === 'ultimate' ? ' Recover next turn.' : ''}`;
    }
  }
  return kit;
}

export function applyConduitBuffs(stats: Stats, equipment?: ConduitSlots, upgrades?: ConduitUpgrades): void {
  if (equipment) for (const conduitId of validateConduitSlots(equipment)) {
    if (conduitId === null) continue;
    for (const buff of conduitBuffs(getConduit(conduitId), upgrades?.[conduitId] ?? 0)) {
      if (buff.kind === 'percent') stats[buff.stat] *= 1 + buff.amount / 100;
      else if (buff.kind === 'percentage-points') stats[buff.stat] = Math.min(1, Math.max(0, stats[buff.stat] + buff.amount / 100));
      else stats[buff.stat] += buff.amount;
    }
  }
}

export function isActionId(value: unknown): value is ActionId {
  return actionIds.some((action) => action === value);
}
