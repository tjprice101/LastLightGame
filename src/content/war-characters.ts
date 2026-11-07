import type { FighterDefinition } from './combat';

export const warCharacters = [
  {
    id: 'nerithe', stars: 6, name: 'Nerithe', role: 'Attacker', art: 'nerithe',
    title: 'Sadness charted beyond the shoreless sea', element: 'Oceanic', elementId: 'oceanic',
    weapon: 'Surveyor trident', color: '#54c9d4',
    description: 'An Oceanic Element-Bearer shaped in Let’s image, Nerithe maps Sadness with a surveyor trident and folded currents.',
    lore: { origin: 'The observatories above the spiral sea', story: 'From the spiral-sea observatories, Nerithe charted a current that never returned to shore. She learned Oceanic carries Sadness: a record of what is missing that can guide the living, not drown them. With her surveyor trident she folds distant tides around people lost between worlds. Let created Element-Bearers in his image; Rise created Elemental-Devourers in hers and stole those same elements. Both factions search for their creators’ souls, but neither has been reunited and no victor has emerged. Nerithe plots a route toward Let’s scattered soul while marking every voyager still unaccounted for.',
      vow: 'No one is lost beyond my map.',
      awakening: 'An uncharted current answers; its source is not yet found.' },
  },
  {
    id: 'orvella', stars: 6, name: 'Orvella', role: 'Tank', art: 'orvella',
    title: 'Joy grows from foundations beneath the world', element: 'Botanic', elementId: 'botanic',
    weapon: 'Crystal mace', color: '#d2b59a',
    description: 'A Botanic Element-Bearer shaped in Let’s image, Orvella’s crystal mace raises living foundations where Joy and Life can endure.',
    lore: { origin: 'The vaults beneath the faultline', story: 'Orvella first braced a broken village gate with a mason’s stone. In the vaults beneath the faultline she found buried foundations, and with her crystal mace raised them into shelter for people the world had forgotten. Botanic holds Joy and Life together: she celebrates each home restored without pretending the losses never happened. Let made Element-Bearers in his image; Rise made Elemental-Devourers in hers and broke convention to steal the same elements. Both sides seek their creators’ souls; neither has found or reunited one, and no one has won. Orvella follows Let’s trail between repairs, unwilling to leave a community for a promise of rule.',
      vow: 'No shelter falls while I still stand.',
      awakening: 'The first foundation answers, though its maker’s soul remains lost.' },
  },
  {
    id: 'vaelor', stars: 6, name: 'Vaelor', role: 'Attacker', art: 'vaelor',
    title: 'Calm holds the note between storms', element: 'Atmospheric', elementId: 'atmospheric',
    weapon: 'Resonance blade', color: '#e6d177',
    description: 'An Atmospheric Element-Bearer shaped in Let’s image, Vaelor finds Calm in the thunder choir with a resonance blade.',
    lore: { origin: 'The towers of the thunder choir', story: 'Vaelor listened in the thunder-choir towers for the missing rhythm between storms. With a small resonance blade he followed the silence, learning that Atmospheric means Calm: the clear interval in which a broken sky can be heard without being forced to sing. Let created Element-Bearers in his image; Rise created Elemental-Devourers in hers and stole the same elements. Both factions seek their creators’ souls, still separate and unfound; the contest has no winner. Vaelor follows the quiet frequencies around rumors of Let’s soul, certain that the missing note must be heard before anyone can claim the final chord.', vow: 'Even a broken sky can sing again.', awakening: 'Quiet voltage finds its first rhythm, not its final chord.' },
  },
  {
    id: 'caldrex', stars: 6, name: 'Caldrex', role: 'Tank', art: 'caldrex',
    title: 'Wrath banked behind a closed furnace gate', element: 'Infernic', elementId: 'infernic',
    weapon: 'Forge gauntlets', color: '#ff8a2b',
    description: 'An Infernic Element-Bearer shaped in Let’s image, Caldrex banks Wrath in forge gauntlets and holds the furnace gate for his squad.',
    lore: { origin: 'The abandoned kiln floors', story: 'Caldrex tended the last kiln on an abandoned forge floor, learning that Infernic is Wrath: heat that is safest when it is kept, measured and released only to protect others. With forge gauntlets he closes furnace gates around people the world has left exposed. Let created Element-Bearers in his image; Rise created Elemental-Devourers in hers and stole those same elements. Both factions search for their creators’ souls; neither has found one, and no one has won. Caldrex follows the warmth of Let’s trail while keeping every gate behind him shut.',
      vow: 'No flame passes while I hold the gate.',
      awakening: 'The kiln stirs behind the gate; its keeper is not yet found.' },
  },
  {
    id: 'solenne', stars: 6, name: 'Solenne', role: 'Tank', art: 'solenne',
    title: 'Peace held in the silence between two chimes', element: 'Tranquilitic', elementId: 'tranquilitic',
    weapon: 'Temple bell shield', color: '#b9a4d8',
    description: 'A Tranquilitic Element-Bearer shaped in Let’s image, Solenne keeps Peace with a temple bell held as a shield.',
    lore: { origin: 'The moon-silver court', story: 'Solenne kept a temple bell in a moon-silver court and learned that Tranquilitic is Peace: not an absence of sound but a silence patient enough to be held. Her bell shield answers each blow with stillness before it rings. Let made Element-Bearers in his image; Rise made Elemental-Devourers in hers and stole the same elements. Both factions seek their creators’ souls, still unfound and unreconciled. Solenne walks the quiet intervals around rumors of Let’s soul, keeping the bell unstruck until it is needed.',
      vow: 'The bell rings only to keep you whole.',
      awakening: 'A quiet circle widens; its first chime is still to come.' },
  },
  {
    id: 'myrthen', stars: 6, name: 'Myrthen', role: 'Attacker', art: 'myrthen',
    title: 'Joy and Life turn with every season', element: 'Botanic', elementId: 'botanic',
    weapon: 'Chained sickles', color: '#6fbf5a',
    description: 'A Botanic Element-Bearer shaped in Let’s image, Myrthen reaps Joy and Life through every season with chained sickles.',
    lore: { origin: 'The terraced orchard floors', story: 'Myrthen worked the terraced orchards and learned that Botanic is Joy and Life as a cycle: sprout, bloom, harvest, and the return to sprout. Her chained sickles gather what has ripened without denying what must grow again. Let created Element-Bearers in his image; Rise created Elemental-Devourers in hers and stole the same elements. Both factions seek their creators’ souls; no one has been reunited with one and no one has won. Myrthen follows the turning seasons toward Let’s trail, harvesting only what is ready.',
      vow: 'Every season gets its turn.',
      awakening: 'A fifth season stirs between harvest and sprout; its meaning is not yet known.' },
  },
  {
    id: 'neralis', stars: 6, name: 'Neralis', role: 'Healer & Support', art: 'neralis',
    title: 'The current that returns for the last traveler', element: 'Oceanic', elementId: 'oceanic',
    weapon: 'Crescent polearm', color: '#62cce3',
    description: 'An Oceanic Element-Bearer in Let’s image, Neralis carries Sadness as a promise to return for the last traveler.',
    lore: { origin: 'The river stations of the Broken Weirs',
      story: 'Neralis once measured rivers for a council that drew borders where bridges should have been. When a broken weir stranded both banks, he used his crescent polearm to pull the rescue lines across, then returned until the crossing was empty. He keeps amber station lights on his coat so a traveler can recognize a guide before understanding a map. His dark wings are folded river-shadow plumes; the bright blue current follows his weapon rather than a distant moon. Oceanic Sadness teaches him to remember each abandoned crossing without accepting abandonment as its future. Let made Element-Bearers in his image; Rise made Elemental-Devourers in hers and stole the same elements. Both factions seek their creators’ souls; neither has found one and no faction has won. Neralis follows Let’s still-unfound trail between repair journeys.',
      vow: 'A road is not finished until it brings someone back.',
      awakening: 'The river returns for one more traveler.' },
  },
  {
    id: 'varkhel', stars: 6, name: 'Varkhel', role: 'Tank', art: 'varkhel',
    title: 'Wrath held on a chain instead of unleashed', element: 'Infernic', elementId: 'infernic',
    weapon: 'Chained counterweight', color: '#f07450',
    description: 'An Infernic Element-Bearer in Let’s image, Varkhel holds Wrath on a chain so the people behind him can retreat.',
    lore: { origin: 'The chainworks above Cinderfall Span',
      story: 'Varkhel was paid to sever the suspension chains of an occupied bridge. Instead he fastened his counterweight to its failing hinge and held the retreat open. The red sash remembers the warning cloth tied to that hinge, not a royal title. His armor grew around the strain: silver joint plates, black wing mantles and, later, scarlet furnace enamel. Infernic Wrath is the anger he refuses to spend on the people he is protecting. Let made Element-Bearers in his image; Rise made Elemental-Devourers in hers and stole the same elements. Both factions seek their creators’ souls; neither has found one and no faction has won. Varkhel follows Let’s trail through ruined chainworks without abandoning the people behind him.',
      vow: 'Let the chain answer the blow, not the people behind me.',
      awakening: 'The suspended chain answers a measured hand.' },
  },
  {
    id: 'seravelle', stars: 6, name: 'Seravelle', role: 'Support', art: 'seravelle',
    title: 'A signal raised for people, not for conquest', element: 'Infernic', elementId: 'infernic',
    weapon: 'Silver lance', color: '#f1784d',
    description: 'An Infernic Element-Bearer in Let’s image, Seravelle raises Wrath as a signal for everyone who still needs the road.',
    lore: { origin: 'The ash-white courier roads of Bellmarch',
      story: 'Seravelle carried route orders until she found a convoy whose destination had been erased from every official chart. She braided the evacuees’ white cord into her hair and raised her lance where the next wagon could see it. Her red officer panels and gold fittings are repaired courier equipment; her black-white wings turn flame into a visible guide. Infernic Wrath is directed at the ease with which people become inconvenient numbers. Let made Element-Bearers in his image; Rise made Elemental-Devourers in hers and stole the same elements. Both factions seek their creators’ souls; neither has found one and no faction has won. Seravelle searches for Let’s still-scattered soul without claiming that a wing or a flame is divine authority.',
      vow: 'The signal belongs to everyone who still needs the road.',
      awakening: 'A signal crosses the ash-white road.' },
  },
  {
    id: 'velmira', stars: 6, name: 'Velmira', role: 'Attacker', art: 'velmira',
    title: 'The cut that opens a way without erasing what matters', element: 'Chaotic', elementId: 'chaotic',
    weapon: 'Pair of crescent blades', color: '#b98de7',
    description: 'A Chaotic Element-Bearer in Let’s image, Velmira uses Death and Destruction to open a way without calling destruction a cure.',
    lore: { origin: 'The severance ateliers of Thornless Court',
      story: 'Velmira cut ceremonial bindings in an atelier whose rulers praised every beautiful knot and never asked who could untie it. When the court sealed its doors, she turned the atelier’s paired crescent blades against the locking seams. Her white pleats preserve the craft she loved; dark feather fans and violet tips remember what she refused to become. Chaotic Death and Destruction give her the courage to end an oppressive mechanism without calling destruction itself a cure. Let made Element-Bearers in his image; Rise made Elemental-Devourers in hers and stole the same elements. Both factions seek their creators’ souls; neither has found one and no faction has won. Velmira follows Let’s lost soul through abandoned courts.',
      vow: 'A broken lock should leave the doorway standing.',
      awakening: 'The paired blades find a way through.' },
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
  caldrex: ['Kiln Warden', 'Banked Fire', 'The Furnace Holds', 'Bearer of the Closed Gate', 'No Flame Passes', 'The Last Kiln'],
  solenne: ['Moonbell Keeper', 'Between Two Chimes', 'The Patient Circle', 'Keeper of the Unstruck Bell', 'A Silence Held', 'The Bell That Stayed'],
  myrthen: ['Season Reaper', 'First Turning', 'Bough and Blade', 'Harvest in Motion', 'The Orchard Remembers', 'When All Seasons Meet'],
  neralis: ['Weirline Guide', 'Keeper of the Amber Stations', 'A Crossing Remembered',
    'Wings Above the Broken Weir', 'Return Against the Current', 'The River Keeps Its Promise'],
  varkhel: ['Chainwork Holdfast', 'The Warning Cloth', 'Weight Against the Breach',
    'A Span Held Open', 'Wrath Within the Hinge', 'The Chain Refuses to Break'],
  seravelle: ['Ashroad Courier', 'The Braided Route', 'Signal Above the Convoy',
    'Marshal of the Open Road', 'A Standard Without a Throne', 'The Last Wagon Sees the Dawn'],
  velmira: ['Atelier Defector', 'A Knot Unfastened', 'The Measured Cut',
    'Keeper of the Open Threshold', 'An Ending Chosen Carefully', 'What Remains Beyond the Cut'],
};

export const warActionNames: Record<WarCharacterId, { light: string }> = {
  nerithe: { light: 'Surveyor\'s Thrust' },
  orvella: { light: 'Plumbline Strike' },
  vaelor: { light: 'Tuning Strike' },
  caldrex: { light: 'Gate Bash' },
  solenne: { light: 'Bell Tap' },
  myrthen: { light: 'Sickle Cut' },
  neralis: { light: 'Crescent Thrust' },
  varkhel: { light: 'Counterweight Strike' },
  seravelle: { light: 'Beacon Lance' },
  velmira: { light: 'Measured Edge' },
};

export const warFighters: Record<WarCharacterId, FighterDefinition> = {
  nerithe: {
    stats: { health: 235, defense: 13, damage: 40, crit: .18, shatterCapacity: 100, critMultiplier: 1.6, elementalDamage: 0 },
    passive: { name: 'Uncharted Current', description: 'Normal Attack gains 5 additional Elemental Gauge, capped by Elemental Gauge capacity.', damageBonus: 0, defenseBonus: 0, healFraction: 0, lightGaugeBonus: 5 },
    abilities: {
      skill1: { name: 'Meridian Break', description: '170% damage to one enemy; weaken its next two enemy-phase attacks by 20%.', cooldown: 0, strength: { damageMultiplier: 1.7, weakenFraction: .2 } },
      skill2: { name: 'Fold the Sea', description: '130% damage to all enemies; weaken surviving targets by 15% for two enemy phases.', cooldown: 0, targets: 'all-enemies', strength: { damageMultiplier: 1.3, weakenFraction: .15 } },
      ultimate: { name: 'Ocean Beyond the Map', description: '300% damage to all enemies; weaken surviving targets by 30% for two enemy phases. Recover next turn.', cooldown: 0, targets: 'all-enemies', strength: { damageMultiplier: 3, weakenFraction: .3 } },
    },
  },
  orvella: {
    stats: { health: 300, defense: 20, damage: 32, crit: .1, shatterCapacity: 100, critMultiplier: 1.5, elementalDamage: 0 },
    passive: { name: 'Load-Bearing Will', description: '+10 defense, already included in effective defense.', damageBonus: 0, defenseBonus: 10, healFraction: 0 },
    abilities: {
      skill1: { name: 'Keystone Reversal', description: '160% damage to one enemy; weaken its next two enemy-phase attacks by 25%.', cooldown: 0, strength: { damageMultiplier: 1.6, weakenFraction: .25 } },
      skill2: { name: 'Raise the Faultline', description: 'Give every living ally 40 shield; lasts until broken and stacks.', cooldown: 0, targets: 'all-allies', strength: { shield: 40 } },
      ultimate: { name: 'Worldweight Citadel', description: '260% damage to all enemies and 65 shield to living allies. Recover next turn.', cooldown: 0, targets: 'all-enemies', strength: { damageMultiplier: 2.6, shield: 65 } },
    },
  },
  vaelor: {
    pilot: 'tempest',
    stats: { health: 210, defense: 11, damage: 45, crit: .22, shatterCapacity: 100, critMultiplier: 1.65, elementalDamage: 8 },
    passive: { name: 'Standing Thunder', description: '+25% outgoing damage at or below half health.', damageBonus: .25, defenseBonus: 0, healFraction: 0 },
    abilities: {
      skill1: { name: 'Forked Cadence', description: '180% damage to one enemy with +20 percentage points critical chance.', cooldown: 0, strength: { damageMultiplier: 1.8, critBonus: .2 } },
      skill2: { name: 'Resonance Cascade', description: '140% damage to all enemies.', cooldown: 0, targets: 'all-enemies', strength: { damageMultiplier: 1.4 } },
      ultimate: { name: 'Last Chord of the Sky', description: '330% damage to all enemies. Recover next turn.', cooldown: 0, targets: 'all-enemies', strength: { damageMultiplier: 3.3 } },
    },
  },
  caldrex: {
    stats: { health: 300, defense: 20, damage: 32, crit: .1, shatterCapacity: 100, critMultiplier: 1.5, elementalDamage: 0 },
    passive: { name: 'Banked Heat', description: 'Gain 1 Heat (max 3) when an enemy direct attack damages Caldrex’s Health or Shield, once per enemy phase.', damageBonus: 0, defenseBonus: 0, healFraction: 0 },
    abilities: {
      skill1: { name: 'Close the Kiln', description: 'Shield every living squad member and taunt eligible random single-target attacks for the next enemy phase; area-of-effect and scripted attacks are unchanged.', cooldown: 0, targets: 'all-allies', strength: { shield: 1 } },
      skill2: { name: 'Cinder Discharge', description: 'Spend all Heat to strike all enemies and Burn them.', cooldown: 0, targets: 'all-enemies', strength: { damageMultiplier: 2.55 } },
      ultimate: { name: 'Nothing Beyond These Gates', description: 'Spend all Heat for a squad shield, Defense and ally Burn pressure. Recover next turn.', cooldown: 0, targets: 'all-allies', strength: { shield: 1 } },
    },
  },
  solenne: {
    stats: { health: 285, defense: 19, damage: 30, crit: .12, shatterCapacity: 100, critMultiplier: 1.5, elementalDamage: 0 },
    passive: { name: 'Held Stillness', description: 'Hold up to 4 Stillness; each hit consumes 1 to reduce its damage by 20%.', damageBonus: 0, defenseBonus: 0, healFraction: 0 },
    abilities: {
      skill1: { name: 'Answer the Bell', description: 'Strike one enemy, Weaken it and taunt eligible random single-target attacks for the next enemy phase; area-of-effect and scripted attacks are unchanged.', cooldown: 0, strength: { damageMultiplier: 2.4, weakenFraction: .25 } },
      skill2: { name: 'Circle of Repose', description: 'Gain 2 Stillness and shield the squad.', cooldown: 0, targets: 'all-allies', strength: { shield: 1 } },
      ultimate: { name: 'The Last Reverberation', description: 'Spend all Stillness to strike all enemies and shield the squad. Recover next turn.', cooldown: 0, targets: 'all-enemies', strength: { damageMultiplier: 7.2, shield: 1 } },
    },
  },
  myrthen: {
    stats: { health: 220, defense: 11, damage: 44, crit: .22, shatterCapacity: 100, critMultiplier: 1.65, elementalDamage: 0 },
    passive: { name: 'Turning Season', description: 'Skills advance Sprout, Bloom and Harvest; Harvest empowers the next Skill or Last Flare.', damageBonus: 0, defenseBonus: 0, healFraction: 0 },
    abilities: {
      skill1: { name: 'Reaper’s Claim', description: 'Strike one enemy and mark it.', cooldown: 0, strength: { damageMultiplier: 2.72 } },
      skill2: { name: 'Turn the Bough', description: 'Strike all enemies.', cooldown: 0, targets: 'all-enemies', strength: { damageMultiplier: 1.92 } },
      ultimate: { name: 'All That Ripens', description: 'Strike one enemy. Recover next turn.', cooldown: 0, strength: { damageMultiplier: 12.48 } },
    },
  },
  neralis: {
    nativeIdentity: true,
    stats: { health: 240, defense: 12, damage: 32, crit: .12, shatterCapacity: 100, critMultiplier: 1.5, elementalDamage: 0 },
    passive: { name: 'Returning Current', description: 'Gain Current from effective Normal damage or native healing, once per action.', damageBonus: 0, defenseBonus: 0, healFraction: 0 },
    abilities: {
      skill1: { name: 'Light the Next Station', description: 'Heal one living ally for 35% maximum Health, scaled by Skill Power; grant +30% Defense for 2 turns.', cooldown: 0, targets: 'one-ally', strength: {} },
      skill2: { name: 'Carry Them Back', description: 'Spend all Current to heal each living ally for 18% maximum Health plus 6% per Current, scaled by Skill Power.', cooldown: 0, targets: 'all-allies', strength: {} },
      ultimate: { name: 'No Crossing Left Empty', description: 'Spend all Current; deal 720% Direct Attack to all enemies and heal living allies for 30% maximum Health plus 5% per Current, scaled by Skill Power.', cooldown: 0, targets: 'all-enemies', strength: { damageMultiplier: 7.2 } },
    },
  },
  varkhel: {
    nativeIdentity: true,
    stats: { health: 305, defense: 21, damage: 33, crit: .10, shatterCapacity: 100, critMultiplier: 1.5, elementalDamage: 0 },
    passive: { name: 'Tension Held', description: 'Gain Tension when an enemy direct attack effectively damages Health or Shield once per enemy phase, or when a Normal Attack deals damage.', damageBonus: 0, defenseBonus: 0, healFraction: 0 },
    abilities: {
      skill1: { name: 'Set the Warning Chain', description: 'Gain a Shield equal to 25% maximum Health, scaled by Skill Power; +40% Defense for 2 turns and Taunt for the next enemy phase.', cooldown: 0, targets: 'all-allies', strength: {} },
      skill2: { name: 'Return the Strain', description: 'Spend all Tension; deal 285% Direct Attack plus 45% per Tension to one enemy, ignoring 20% Defense.', cooldown: 0, strength: { damageMultiplier: 2.85 } },
      ultimate: { name: 'The Bridge Holds Behind Me', description: 'Spend all Tension; deal 690% Direct Attack plus 55% per Tension to all enemies and shield living allies for 30% maximum Health, scaled by Skill Power.', cooldown: 0, targets: 'all-enemies', strength: { damageMultiplier: 6.9 } },
    },
  },
  seravelle: {
    nativeIdentity: true,
    stats: { health: 235, defense: 13, damage: 34, crit: .14, shatterCapacity: 100, critMultiplier: 1.5, elementalDamage: 0 },
    passive: { name: 'Convoy Cadence', description: 'The first effective manual Normal Attack each round grants Cadence while Seravelle lives.', damageBonus: 0, defenseBonus: 0, healFraction: 0 },
    abilities: {
      skill1: { name: 'Send the Ember Ahead', description: 'Deal 245% Direct Attack to one enemy and apply Burn for 2 enemy phases, dealing 12% of Attack per phase, scaled by Skill Power.', cooldown: 0, strength: { damageMultiplier: 2.45 } },
      skill2: { name: 'Move as One', description: 'Spend all Cadence; grant living allies +30% Direct Attack plus 10% per Cadence for 2 turns. This fixed bonus is not scaled by Skill Power.', cooldown: 0, targets: 'all-allies', strength: {} },
      ultimate: { name: 'The Road Belongs to Everyone', description: 'Deal 620% Direct Attack to all enemies; grant each other living ally 20% maximum Gauge and +30 percentage points Skill Power for 2 turns.', cooldown: 0, targets: 'all-enemies', strength: { damageMultiplier: 6.2 } },
    },
  },
  velmira: {
    nativeIdentity: true,
    stats: { health: 218, defense: 11, damage: 45, crit: .23, shatterCapacity: 100, critMultiplier: 1.65, elementalDamage: 0 },
    passive: { name: 'Alternating Edge', description: 'Gain Crosscut when an ordinary Skill differs from the previous ordinary Skill; the first Skill establishes the sequence.', damageBonus: 0, defenseBonus: 0, healFraction: 0 },
    abilities: {
      skill1: { name: 'Open the Seam', description: 'Deal 280% Direct Attack to one enemy and apply Weaken for 2 enemy phases, reducing its direct damage by 25%.', cooldown: 0, strength: { damageMultiplier: 2.8, weakenFraction: .25 } },
      skill2: { name: 'Turn the Other Edge', description: 'Deal 205% Direct Attack to all enemies; ignore 20% Defense while holding at least 2 Crosscut.', cooldown: 0, targets: 'all-enemies', strength: { damageMultiplier: 2.05 } },
      ultimate: { name: 'Leave the Doorway Standing', description: 'Spend all Crosscut; deal 1,050% Direct Attack plus 90% per Crosscut to one enemy, ignoring 30% Defense.', cooldown: 0, strength: { damageMultiplier: 10.5 } },
    },
  },
};
