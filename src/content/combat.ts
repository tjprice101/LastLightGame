import { type StarterId } from './starters';

export const actionIds = ['light', 'heavy', 'skill1', 'skill2', 'ultimate'] as const;
export type ActionId = (typeof actionIds)[number];
export interface Stats { health: number; defense: number; damage: number; crit: number }
export interface Ability { name: string; description: string; cooldown: number }
export interface FighterDefinition {
  stats: Stats;
  passive: { name: string; description: string };
  abilities: Record<'skill1' | 'skill2' | 'ultimate', Ability>;
}

export const fighters: Record<StarterId, FighterDefinition> = {
  ember: {
    stats: { health: 220, defense: 10, damage: 38, crit: 0.15 },
    passive: { name: 'Unbroken Ember', description: '+20% outgoing damage at or below 50% health.' },
    abilities: {
      skill1: { name: 'Cinder Cleave', description: '160% damage to one enemy; burn for 8 damage on its next two enemy phases.', cooldown: 2 },
      skill2: { name: 'Flame Arc', description: '110% damage to every living enemy.', cooldown: 3 },
      ultimate: { name: 'Last Flare: Dawnfire', description: '280% damage to every enemy. Costs 100 Flare; recover next turn.', cooldown: 0 },
    },
  },
  tide: {
    stats: { health: 260, defense: 16, damage: 30, crit: 0.1 },
    passive: { name: 'Stillwater Guard', description: '+8 defense, already included in displayed effective defense.' },
    abilities: {
      skill1: { name: 'Undertow Thrust', description: '150% damage to one enemy; reduce its next two enemy-phase attacks by 25%.', cooldown: 2 },
      skill2: { name: 'Tidal Shelter', description: 'Give every living ally 25 shield (refresh to at least 25; does not stack).', cooldown: 3 },
      ultimate: { name: 'Last Flare: Ocean Memory', description: '220% damage to all enemies and 35 shield for allies. Costs 100 Flare; recover next turn.', cooldown: 0 },
    },
  },
  sprout: {
    stats: { health: 190, defense: 8, damage: 32, crit: 0.2 },
    passive: { name: 'Root of Hope', description: 'At each new player turn, heal living allies by 5% of their maximum health while Flores lives.' },
    abilities: {
      skill1: { name: 'Briar Shot', description: '150% damage to one enemy with +20 percentage points critical chance.', cooldown: 2 },
      skill2: { name: 'Verdant Renewal', description: 'Restore 30 health to every living ally; cannot revive.', cooldown: 3 },
      ultimate: { name: 'Last Flare: Worldseed', description: '180% damage to all enemies and heal living allies by 55. Costs 100 Flare; recover next turn.', cooldown: 0 },
    },
  },
};

export const enemyIds = ['goblin', 'imp', 'golem'] as const;
export type EnemyId = (typeof enemyIds)[number];
export const enemies: Record<EnemyId, { name: string; art: string; stats: Stats }> = {
  goblin: { name: 'Goblin', art: 'goblin', stats: { health: 110, defense: 5, damage: 23, crit: 0.1 } },
  imp: { name: 'Imp', art: 'imp', stats: { health: 90, defense: 3, damage: 28, crit: 0.15 } },
  golem: { name: 'Rock Golem', art: 'rock-golem', stats: { health: 160, defense: 15, damage: 20, crit: 0.05 } },
};

export function isActionId(value: unknown): value is ActionId {
  return actionIds.some((action) => action === value);
}
