import { moonCharacters, sunshadeCharacters } from './moon-sunshade-characters';
import { moonSunshadeNativeIdentities } from './moon-sunshade-native-identities';
import type { FighterDefinition } from './combat';
export type MoonSunshadeCharacterId = (typeof moonCharacters)[number]['id'] | (typeof sunshadeCharacters)[number]['id'];

const roleStats = {
  Tank: { health: 280, defense: 17, damage: 31, crit: .1, critMultiplier: 1.5 },
  Attacker: { health: 210, defense: 10, damage: 42, crit: .25, critMultiplier: 1.7 },
  Support: { health: 215, defense: 10, damage: 32, crit: .12, critMultiplier: 1.5 },
} as const;

export const moonSunshadeFighters: Record<MoonSunshadeCharacterId, FighterDefinition> = Object.fromEntries(
  [...moonCharacters, ...sunshadeCharacters].map(character => {
    const identity = moonSunshadeNativeIdentities[character.id];
    const stats = roleStats[character.role === 'Attacker' ? 'Attacker' :
      character.role === 'Tank' ? 'Tank' : 'Support'];
    const fighter: FighterDefinition = {
      stats: { ...stats, shatterCapacity: 100, elementalDamage: 0 },
      passive: { ...identity.passive, damageBonus: 0, defenseBonus: 0, healFraction: 0 },
      abilities: structuredClone(identity.abilities),
      nativeIdentity: true,
    };
    return [character.id, fighter];
  }),
) as Record<MoonSunshadeCharacterId, FighterDefinition>;
