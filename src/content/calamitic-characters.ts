import type { FighterDefinition } from './combat';

/** D-435 Phase 0: three 7-star Calamitic Element-Bearers. Contract: docs/calamitic-characters.md. */
export const calamiticCharacters = [
  {
    id: 'ozriel', stars: 7, name: 'Ozriel', role: 'Tank', art: 'ozriel',
    title: 'The wall that refuses the ending', element: 'Tranquilitic', elementId: 'tranquilitic',
    weapon: 'Cathedral tower shield and glass halberd', color: '#e8e4ec',
    description: 'A Tranquilitic Element-Bearer in Let’s image, Ozriel holds a cathedral tower shield against Rise’s calamity and refuses every ending written for his squad.',
    lore: { origin: 'The shattered cathedral at the edge of Rise’s first calamity', story: 'Ozriel was the last warden of a glass cathedral when Rise’s first calamity reached it. The windows broke inward; he did not. Tranquilitic gave him Peace that is chosen, not granted: the stillness of someone who has decided where the line is. Let made Element-Bearers in his image, and Ozriel kept that shape while the calamity tried to rewrite it. Rise’s Elemental-Devourers still hunt the same elements, and neither creator’s soul has been found. Ozriel stands in front of whoever the calamity chooses next.',
      vow: 'The world ends when I allow it. Not before.',
      awakening: 'A single pane holds. The calamity has not finished trying.' },
  },
  {
    id: 'ilvaris', stars: 7, name: 'Ilvaris', role: 'Support', art: 'ilvaris',
    title: 'The choir that sings a different tomorrow', element: 'Atmospheric', elementId: 'atmospheric',
    weapon: 'Glass halo-lyre', color: '#f2eef4',
    description: 'An Atmospheric Element-Bearer in Let’s image, Ilvaris sears fate onto her enemies with a glass halo-lyre and strengthens every squad member who strikes them.',
    lore: { origin: 'The choir vault above the broken heavens', story: 'Ilvaris sang in a choir vault that had already heard the end of the world, a prophecy Rise’s calamity was built to fulfil. She broke from the verse mid-hymn. Atmospheric carries Calm, and in her it became the calm of someone who knows a prophecy is only a song no one has answered. Let made Element-Bearers in his image; Rise made the Devourers and the calamities that follow them. Neither creator’s soul has been found. Ilvaris marks what the calamity sends and makes sure her squad answers it.',
      vow: 'Prophecy is only a song no one has answered yet.',
      awakening: 'The first unsung note breaks the verse.' },
  },
  {
    id: 'kaelith', stars: 7, name: 'Kaelith', role: 'Attacker', art: 'kaelith',
    title: 'The blade that cuts the thread of fate', element: 'Chaotic', elementId: 'chaotic',
    weapon: 'Shatterglass greatscythe', color: '#f3f0f1',
    description: 'A Chaotic Element-Bearer in Let’s image, Kaelith cracks reality around her enemies with a shatterglass greatscythe and cuts through the faults she leaves.',
    lore: { origin: 'The fault lines Rise’s calamity left in the sky', story: 'Where Rise’s calamity split the sky, the cracks stayed. Kaelith walked into one and came back carrying a scythe of fractured glass. Chaotic holds Death and Destruction, and she uses both against the ending Rise wrote for everyone else. Let made Element-Bearers in his image; Rise’s Devourers stole the same elements, and neither side has found its creator’s soul. Kaelith does not wait for fate to arrive. She finds where it is weakest and cuts.',
      vow: 'Whatever was written for us, I’ll unwrite it.',
      awakening: 'A hairline fracture runs through what was supposed to happen.' },
  },
] as const;

export type CalamiticCharacterId = (typeof calamiticCharacters)[number]['id'];
export function isCalamiticCharacter(value: unknown): value is CalamiticCharacterId {
  return calamiticCharacters.some((character) => character.id === value);
}

/** EX tier that awards each character (10% per saved victory, never once owned). */
export const calamiticCharacterByTier = { 1: 'ozriel', 2: 'ilvaris', 3: 'kaelith' } as const satisfies Record<1 | 2 | 3, CalamiticCharacterId>;
export const calamiticCharacterChance = .1;

export const calamiticEvolutionTitles: Record<CalamiticCharacterId, readonly string[]> = {
  ozriel: ['Unbroken Pane', 'Warden of the Glass Nave', 'Bastion of Refused Endings',
    'Seraph of the Shattered Cathedral', 'Sovereign of the Unfallen Wall', 'The Ending That Was Denied'],
  ilvaris: ['First Unsung Note', 'Cantor of Cracked Heavens', 'Choir-Seraph of the Glass Vault',
    'Herald of the Unwritten Hymn', 'Sovereign of the Severed Prophecy', 'The Song That Defied Fate'],
  kaelith: ['Hairline Fracture', 'Glass-Edged Herald', 'Reaper of Written Endings',
    'Seraph of the Broken Thread', 'Sovereign of Shattered Fate', 'The Fate That Was Never Written'],
};

export const calamiticActionNames: Record<CalamiticCharacterId, { light: string }> = {
  ozriel: { light: 'Halberd Verdict' },
  ilvaris: { light: 'Struck Chord' },
  kaelith: { light: 'Fault Reap' },
};

export const calamiticFighters: Record<CalamiticCharacterId, FighterDefinition> = {
  ozriel: {
    stats: { health: 345, defense: 24, damage: 34, crit: .1, shatterCapacity: 100, critMultiplier: 1.5, elementalDamage: 0 },
    passive: { name: 'Refusal', description: '+65% Defense and +65% Health. Once per encounter for each squad member, a hit that would defeat them leaves them at 1 HP instead, only while Ozriel is alive; never revives a defeated unit.', damageBonus: 0, defenseBonus: 0, healFraction: 0 },
    abilities: {
      skill1: { name: 'Pane of Absolution', description: '240% damage to one enemy; Weaken it by 50% for two enemy phases.', cooldown: 0, strength: { damageMultiplier: 2.4, weakenFraction: .5 } },
      skill2: { name: 'Cathedral of Shards', description: 'Give every living ally 90 Shield; lasts until broken and stacks. Shield: absorbs damage before HP; higher amount shields stack.', cooldown: 0, targets: 'all-allies', strength: { shield: 90 } },
      ultimate: { name: 'The World Refuses', description: '455% damage to all enemies and 140 Shield to living allies; lasts until broken and stacks. Shield: absorbs damage before HP; higher amount shields stack. Recover next turn.', cooldown: 0, targets: 'all-enemies', strength: { damageMultiplier: 4.55, shield: 140 } },
    },
  },
  ilvaris: {
    stats: { health: 265, defense: 16, damage: 40, crit: .15, shatterCapacity: 100, critMultiplier: 1.55, elementalDamage: 5 },
    passive: { name: 'Severed Prophecy', description: '+200% Health and +100% Defense. Squad members deal +45% more damage to enemies carrying a Fate-seared Mark.', damageBonus: 0, defenseBonus: 0, healFraction: 0 },
    abilities: {
      skill1: { name: 'Unwritten Verse', description: '225% damage to one enemy and one Fate-seared Mark stack for two enemy phases: +10% damage taken per stack, up to 5. Recasting adds a stack and refreshes the duration.', cooldown: 0, strength: { damageMultiplier: 2.25 } },
      skill2: { name: 'Hymn of Broken Glass', description: 'Heal every living ally 35% of max Health; +45% Critical Damage multiplier and +50% Skill Power for two turns. Each cast heals again and refreshes, never stacks, the buff.', cooldown: 0, targets: 'all-allies', strength: { healing: .35 } },
      ultimate: { name: 'Tomorrow, Unwritten', description: '440% damage to all enemies; heal all allies 50% of max Health and give them 10% Elemental Gauge. Recover next turn.', cooldown: 0, targets: 'all-enemies', strength: { damageMultiplier: 4.4, healing: .5 } },
    },
  },
  kaelith: {
    stats: { health: 240, defense: 13, damage: 50, crit: .22, shatterCapacity: 100, critMultiplier: 1.7, elementalDamage: 10 },
    passive: { name: 'Reality Fault', description: '+75% Skill Power and +5% Skill Critical Rate. Direct hits add 1 Fault (cap 3); each Fault makes that enemy take +10% damage from the squad.', damageBonus: 0, defenseBonus: 0, healFraction: 0 },
    abilities: {
      skill1: { name: 'Shatterfall', description: '456% damage to all enemies and 1 Fault on each.', cooldown: 0, targets: 'all-enemies', strength: { damageMultiplier: 4.56 } },
      skill2: { name: 'Glass Meridian', description: '365% damage to one enemy; consumes its Faults for +20% damage each.', cooldown: 0, strength: { damageMultiplier: 3.65 } },
      ultimate: { name: 'Denial of Fate', description: '360% damage to all enemies. Faults are kept. Recover next turn.', cooldown: 0, targets: 'all-enemies', strength: { damageMultiplier: 3.6 } },
    },
  },
};
