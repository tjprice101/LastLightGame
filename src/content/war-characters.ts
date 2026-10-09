import type { FighterDefinition } from './combat';

export const warCharacters = [
  {
    id: 'nerithe', stars: 6, name: 'Nerithe', role: 'Attacker', art: 'nerithe',
    title: 'The cartographer of the shoreless sea', element: 'Oceanic (Water)', elementId: 'oceanic',
    weapon: 'Surveyor trident', color: '#54c9d4',
    description: 'A human tide-cartographer with a surveyor trident and an expanding dominion of folded currents.',
    lore: { origin: 'The observatories above the spiral sea', story: 'Nerithe charted a current that never returned to shore. Following its meridians, she learned to fold distant tides around the people lost between them.', vow: 'No one is lost beyond my map.', awakening: 'An uncharted current answers.' },
  },
  {
    id: 'orvella', stars: 6, name: 'Orvella', role: 'Tank', art: 'orvella',
    title: 'The foundation that bears the world', element: 'Botanic (Nature)', elementId: 'botanic',
    weapon: 'Crystal mace', color: '#d2b59a',
    description: 'A human foundation sovereign with a crystal mace and an ever-growing citadel of stone.',
    lore: { origin: 'The vaults beneath the faultline', story: 'Orvella once braced a broken village gate with a mason\'s stone. She now carries the weight of buried citadels, raising their foundations to shelter those the world forgot.', vow: 'No shelter falls while I still stand.', awakening: 'The first foundation answers.' },
  },
  {
    id: 'vaelor', stars: 6, name: 'Vaelor', role: 'Attacker', art: 'vaelor',
    title: 'The final chord of the broken sky', element: 'Atmospheric (Wind)', elementId: 'atmospheric',
    weapon: 'Resonance blade', color: '#e6d177',
    description: 'A human storm conductor wielding a resonance blade amid branching thunder architecture.',
    lore: { origin: 'The towers of the thunder choir', story: 'Vaelor listened for the missing rhythm between storms. With a small resonance blade, he followed that silence until the broken sky itself became his choir.', vow: 'Even a broken sky can sing again.', awakening: 'Quiet voltage finds its first rhythm.' },
  },
] as const;

export type WarCharacterId = (typeof warCharacters)[number]['id'];
export function isWarCharacter(value: unknown): value is WarCharacterId {
  return warCharacters.some((character) => character.id === value);
}

export const warEvolutionTitles: Record<WarCharacterId, readonly string[]> = {
  nerithe: ['Uncharted Tide', 'Current Surveyor', 'Keeper of the Spiral Sea',
    'Admiral of the Folded Ocean', 'Sovereign of the Abyssal Meridian', 'The Sea Without a Shore'],
  orvella: ['First Foundation', 'Mason of the Faultline', 'Keeper of the Buried Vault',
    'Architect of the Moving Citadel', 'Sovereign of the Deep Foundations', 'The Throne Beneath the World'],
  vaelor: ['Quiet Voltage', 'Keeper of the Stormbeat', 'Marshal of the Thunder Choir',
    'Conductor of the Broken Sky', 'Sovereign of the Final Frequency', 'The Sky\'s Final Chord'],
};

export const warActionNames: Record<WarCharacterId, { light: string; defend: string }> = {
  nerithe: { light: 'Surveyor\'s Thrust', defend: 'Charted Shelter' },
  orvella: { light: 'Plumbline Strike', defend: 'Foundation Brace' },
  vaelor: { light: 'Tuning Strike', defend: 'Insulated Stance' },
};

export const warFighters: Record<WarCharacterId, FighterDefinition> = {
  nerithe: {
    stats: { health: 235, defense: 13, damage: 40, crit: .18, shatterCapacity: 100, critMultiplier: 1.6, elementalDamage: 0 },
    passive: { name: 'Uncharted Current', description: 'Normal Attack gains 5 additional Gauge, capped by Gauge capacity.', damageBonus: 0, defenseBonus: 0, healFraction: 0, lightGaugeBonus: 5 },
    abilities: {
      skill1: { name: 'Meridian Break', description: '170% damage to one enemy; weaken its next two enemy-phase attacks by 20%.', cooldown: 2, strength: { damageMultiplier: 1.7, weakenFraction: .2 } },
      skill2: { name: 'Fold the Sea', description: '130% damage to all enemies; weaken surviving targets by 15% for two enemy phases.', cooldown: 3, targets: 'all-enemies', strength: { damageMultiplier: 1.3, weakenFraction: .15 } },
      ultimate: { name: 'Ocean Beyond the Map', description: '300% damage to all enemies; weaken surviving targets by 30% for two enemy phases. Recover next turn.', cooldown: 0, targets: 'all-enemies', strength: { damageMultiplier: 3, weakenFraction: .3 } },
    },
  },
  orvella: {
    stats: { health: 300, defense: 20, damage: 32, crit: .1, shatterCapacity: 100, critMultiplier: 1.5, elementalDamage: 0 },
    passive: { name: 'Load-Bearing Will', description: '+10 defense, already included in effective defense.', damageBonus: 0, defenseBonus: 10, healFraction: 0 },
    abilities: {
      skill1: { name: 'Keystone Reversal', description: '160% damage to one enemy; weaken its next two enemy-phase attacks by 25%.', cooldown: 2, strength: { damageMultiplier: 1.6, weakenFraction: .25 } },
      skill2: { name: 'Raise the Faultline', description: 'Give every living ally 40 shield; refreshes rather than stacks.', cooldown: 3, targets: 'all-allies', strength: { shield: 40 } },
      ultimate: { name: 'Worldweight Citadel', description: '260% damage to all enemies and 65 shield to living allies. Recover next turn.', cooldown: 0, targets: 'all-enemies', strength: { damageMultiplier: 2.6, shield: 65 } },
    },
  },
  vaelor: {
    stats: { health: 210, defense: 11, damage: 45, crit: .22, shatterCapacity: 100, critMultiplier: 1.65, elementalDamage: 8 },
    passive: { name: 'Standing Thunder', description: '+25% outgoing damage at or below half health.', damageBonus: .25, defenseBonus: 0, healFraction: 0 },
    abilities: {
      skill1: { name: 'Forked Cadence', description: '180% damage to one enemy with +20 percentage points critical chance.', cooldown: 2, strength: { damageMultiplier: 1.8, critBonus: .2 } },
      skill2: { name: 'Resonance Cascade', description: '140% damage to all enemies.', cooldown: 3, targets: 'all-enemies', strength: { damageMultiplier: 1.4 } },
      ultimate: { name: 'Last Chord of the Sky', description: '330% damage to all enemies. Recover next turn.', cooldown: 0, targets: 'all-enemies', strength: { damageMultiplier: 3.3 } },
    },
  },
};
