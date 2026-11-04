import type { FighterDefinition } from './combat';

/** D-435 Phase 0: three 7-star Calamitic Element-Bearers. Contract: docs/calamitic-characters.md. */
export const calamiticCharacters = [
  {
    id: 'ozriel', stars: 7, name: 'Ozriel', role: 'Tank', art: 'ozriel',
    title: 'The wall that refuses the ending', element: 'Tranquilitic', elementId: 'tranquilitic',
    weapon: 'Cathedral tower shield and glass halberd', color: '#e8e4ec',
    description: 'A Tranquilitic Element-Bearer in Let’s image, Ozriel guards his squad with a cathedral tower shield and glass halberd.',
    lore: { origin: 'The shattered cathedral at the edge of Rise’s first calamity', story: 'Ozriel was the last warden of a glass cathedral when Rise’s first calamity struck. He held its entrance as the windows broke around him. His Tranquilitic Peace steadies his shield against Rise’s Elemental-Devourers. He seeks Let’s soul; the Devourers seek Rise’s. Both remain unfound.',
      vow: 'The world ends when I allow it. Not before.',
      awakening: 'A single pane holds. The calamity has not finished trying.' },
  },
  {
    id: 'ilvaris', stars: 7, name: 'Ilvaris', role: 'Support', art: 'ilvaris',
    title: 'The choir that sings a different tomorrow', element: 'Atmospheric', elementId: 'atmospheric',
    weapon: 'Glass halo-lyre', color: '#f2eef4',
    description: 'An Atmospheric Element-Bearer in Let’s image, Ilvaris marks enemies with her glass halo-lyre to strengthen the squad’s attacks.',
    lore: { origin: 'The choir vault above the broken heavens', story: 'Ilvaris left a choir whose hymns foretold Rise’s calamity. She took a glass halo-lyre from its vault and turned those hymns against the approaching Elemental-Devourers. Atmospheric Calm lets her keep singing under attack. She seeks Let’s soul; Rise’s Elemental-Devourers seek hers. Both remain unfound.',
      vow: 'Prophecy is only a song no one has answered yet.',
      awakening: 'The first unsung note breaks the verse.' },
  },
  {
    id: 'kaelith', stars: 7, name: 'Kaelith', role: 'Attacker', art: 'kaelith',
    title: 'The blade that cuts the thread of fate', element: 'Chaotic', elementId: 'chaotic',
    weapon: 'Shatterglass greatscythe', color: '#f3f0f1',
    description: 'A Chaotic Element-Bearer in Let’s image, Kaelith’s greatscythe applies Fractalized Incision to make enemies vulnerable to the squad.',
    lore: { origin: 'The fault lines Rise’s calamity left in the sky', story: 'Kaelith entered a crack left in the sky by Rise’s calamity and returned with a scythe of fractured glass. She turns Chaotic Death and Destruction against Rise’s Elemental-Devourers. She seeks Let’s soul; the Devourers seek Rise’s. Both remain unfound.',
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
    passive: { name: 'Refusal', description: 'Ozriel gains +65% Defense and +65% Health. While he is alive, each squad member (including Ozriel) survives one lethal hit per encounter with 1 HP.', damageBonus: 0, defenseBonus: 0, healFraction: 0 },
    abilities: {
      skill1: { name: 'Pane of Absolution', description: 'Deal 240% direct damage to one enemy, then reduce its direct damage by 50% with Weaken for the next two Enemy Turns.', cooldown: 0, strength: { damageMultiplier: 2.4, weakenFraction: .5 } },
      skill2: { name: 'Cathedral of Shards', description: 'Grant each living squad member a 90-strength Shield, scaled by Skill Power.', cooldown: 0, targets: 'all-allies', strength: { shield: 90 } },
      ultimate: { name: 'The World Refuses', description: 'Deal 455% direct damage to all enemies. Grant each living squad member a 140-strength Shield, scaled by Skill Power. Recover next turn.', cooldown: 0, targets: 'all-enemies', strength: { damageMultiplier: 4.55, shield: 140 } },
    },
  },
  ilvaris: {
    stats: { health: 265, defense: 16, damage: 40, crit: .15, shatterCapacity: 100, critMultiplier: 1.55, elementalDamage: 5 },
    passive: { name: 'Severed Prophecy', description: 'Ilvaris gains +200% Health and +100% Defense. The whole squad deals 45% more damage to enemies with Fate-seared Mark, in addition to the Mark’s own damage bonus.', damageBonus: 0, defenseBonus: 0, healFraction: 0 },
    abilities: {
      skill1: { name: 'Unwritten Verse', description: 'Deal 225% direct damage to one enemy, then add 1 Fate-seared Mark (max 5). Each stack makes it take 10% more squad damage. Marks last through the next two Enemy Turns; reapplying adds a stack and refreshes their duration.', cooldown: 0, strength: { damageMultiplier: 2.25 } },
      skill2: { name: 'Hymn of Broken Glass', description: 'Heal each living squad member for 35% of their maximum Health. Increase their Critical Damage multiplier by 45% and Skill Power by 50 percentage points through the next Player Turn. Recasting refreshes the buffs.', cooldown: 0, targets: 'all-allies', strength: { healing: .35 } },
      ultimate: { name: 'Tomorrow, Unwritten', description: 'Deal 440% direct damage to all enemies. Heal each living squad member for 50% of their maximum HP and restore 10% of their Elemental Gauge capacity. Recover next turn.', cooldown: 0, targets: 'all-enemies', strength: { damageMultiplier: 4.4, healing: .5 } },
    },
  },
  kaelith: {
    stats: { health: 240, defense: 13, damage: 50, crit: .22, shatterCapacity: 100, critMultiplier: 1.7, elementalDamage: 10 },
    passive: { name: 'Reality Fault', description: 'Kaelith gains +75% Skill Power and +5% Skill Critical Rate. Each of her direct hits adds 1 Fractalized Incision stack (max 3). Each stack makes that enemy take 10% more squad damage, up to 30%, until consumed by Glass Meridian.', damageBonus: 0, defenseBonus: 0, healFraction: 0 },
    abilities: {
      skill1: { name: 'Shatterfall', description: 'Deal 456% direct damage to all enemies.', cooldown: 0, targets: 'all-enemies', strength: { damageMultiplier: 4.56 } },
      skill2: { name: 'Glass Meridian', description: 'Deal 365% direct damage to one enemy, increased by 20% for each Fractalized Incision stack it already has (up to 60%). Consume all of its stacks after the hit, including the stack added by Reality Fault.', cooldown: 0, strength: { damageMultiplier: 3.65 } },
      ultimate: { name: 'Denial of Fate', description: 'Deal 360% direct damage to all enemies. Recover next turn.', cooldown: 0, targets: 'all-enemies', strength: { damageMultiplier: 3.6 } },
    },
  },
};
