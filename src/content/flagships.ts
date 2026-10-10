import type { FighterDefinition } from './combat';

export const flagshipCharacters = [
  {
    id: 'atmoso', stars: 5, name: 'Atmoso', role: 'Attacker', art: 'atmoso',
    title: 'Every road belongs to the wind', element: 'Atmospheric (Wind)', elementId: 'atmospheric',
    weapon: 'Wind staff', color: '#79d6cc',
    description: 'A wind caster who weaves sweeping gales through a crystal-tipped staff.',
    lore: { origin: 'The high roads of Sky-bound Rift', story: 'Atmoso follows the winds that once carried messages between the mountain settlements. With a weathered staff and a patient ear, he gathers their scattered voices and opens new paths through the broken sky.', vow: 'No road ends while the wind remembers.', awakening: 'A familiar breeze finds a new direction.' },
  },
  {
    id: 'aurora', stars: 6, name: 'Aurora', role: 'Support', art: 'aurora',
    title: 'The dawn reveals a gentler judgment', element: 'Tranquilitic (Peace)', elementId: 'tranquilitic',
    weapon: 'Empty-hand light casting', color: '#eee2af',
    description: 'A light arbiter whose prismatic lenses restrain enemy attacks.',
    lore: { origin: 'The lens courts of Lustrous River', story: 'Aurora inherited a lens that shows the consequences hidden behind every verdict. She left the courts to seek those their judgments overlooked, shaping the dawn into seals that temper violence rather than reward it.', vow: 'Let the dawn reveal a better choice.', awakening: 'A prism turns toward an unwritten verdict.' },
  },
  {
    id: 'bliss', stars: 6, name: 'Bliss', role: 'Attacker', art: 'bliss',
    title: 'Stillness carries a thousand feathers', element: 'Tranquilitic (Peace)', elementId: 'tranquilitic',
    weapon: 'Paired feather fans', color: '#a8ded5',
    description: 'A poised duelist whose paired feather fans turn quiet steps into sweeping strikes.',
    lore: { origin: 'The feather courts of City of Heaven', story: 'Bliss learned that peace is not the absence of movement but the care taken with it. Her paired fans preserve the rhythm of a vanished feather court as she dances between danger and the people who cannot escape it.', vow: 'My stillness will never mean surrender.', awakening: 'A quiet feather settles into your hand.' },
  },
  {
    id: 'bruno', stars: 5, name: 'Bruno', role: 'Tank', art: 'bruno',
    title: 'A mountain stands where others cannot', element: 'Botanic (Nature)', elementId: 'botanic',
    weapon: 'Stone hammer', color: '#c7a782',
    description: 'A quarry guardian whose stone hammer raises a shelter of living bedrock.',
    lore: { origin: 'The quarries of Precipice of the Earth', story: 'Bruno stayed when the quarry walls began to fall. With a stone hammer and a promise to the workers, he shaped each broken slab into a new shelter. He now carries that promise wherever the earth can still offer refuge.', vow: 'Stand behind me. We will hold.', awakening: 'Bedrock answers a steady hand.' },
  },
  {
    id: 'disciple', stars: 6, name: 'Disciple', role: 'Support', art: 'disciple',
    title: 'Many wills become an unbroken crown', element: 'Chaotic (Dark Matter & Energy)', elementId: 'chaotic',
    weapon: 'Empty-hand psychic casting', color: '#c68aea',
    description: 'A psychic caster who empowers allies with linked mindflame formations.',
    lore: { origin: 'The thought forges of Ruins of Chaos', story: 'Disciple refused the thought forges that demanded a single will. He carries their fractured teachings into a new practice: minds may strengthen one another without surrendering their freedom. His open hands weave scarlet mindflame into a shared resolve.', vow: 'Strength shared is freedom preserved.', awakening: 'An unbound thought reaches for your own.' },
  },
  {
    id: 'elise', stars: 5, name: 'Elise', role: 'Attacker', art: 'elise',
    title: 'Thunder finds the smallest opening', element: 'Atmospheric (Wind)', elementId: 'atmospheric',
    weapon: 'Two four-point shuriken', color: '#b6e49a',
    description: 'A swift storm striker wielding exactly two four-point shuriken.',
    lore: { origin: 'The circuit paths of Galvanic Field', story: 'Elise mapped the forgotten circuit paths with two small throwing stars and a fearless step. When the field fractured, she learned to follow its branching currents, striking the smallest opening before the storm could close it.', vow: 'There is always another opening.', awakening: 'Two sparks trace a path through the storm.' },
  },
  {
    id: 'razor', stars: 6, name: 'Razor', role: 'Tank', art: 'razor',
    title: 'Midnight keeps an unbroken watch', element: 'Chaotic (Dark Matter & Energy)', elementId: 'chaotic',
    weapon: 'Night sword', color: '#bc9bef',
    description: 'A shadow sentinel whose single night sword guards an eclipse bastion.',
    lore: { origin: 'The nightwatch of Valley of Solitude', story: 'Razor kept the last watch when the valley gates were abandoned. He learned to shape the surrounding darkness into a bastion rather than a threat, carrying one night sword and a vow that no frightened traveler would face midnight alone.', vow: 'The night will find me standing.', awakening: 'A silent sentinel answers your call.' },
  },
] as const;

export type FlagshipId = (typeof flagshipCharacters)[number]['id'];

export const flagshipEvolutionTitles: Record<FlagshipId, readonly string[]> = {
  atmoso: ['Gale Wayfarer', 'Crosswind Adept', 'Skyspoke Invoker', 'Tempest Loom', 'Crown of the High Gale', 'The Sky Without End'],
  aurora: ['Daybreak Arbiter', 'Gleamveil Adjudicator', 'Solar Verdict Oracle', 'Prismseal Seraph', 'Dawncourt Sovereign', 'The Dawn Beyond Judgment'],
  bliss: ['Featherstep Duelist', 'Stillplume Dancer', 'Quietwing Fencer', 'Prismplume Arbiter', 'Serene Tempest Empress', 'The Thousandfeather Stillness'],
  bruno: ['Quarry Sentinel', 'Faultline Bulwark', 'Bedrock Citadel', 'Worldforge Bastion', 'Prismatic Mountain Regent', 'The Living Worldwall'],
  disciple: ['Mindflame Initiate', 'Thoughtforge Adept', 'Ascendant Mindbinder', 'Prismthought Hierophant', 'Mindflame Exarch', 'The Unbound Mindcrown'],
  elise: ['Sparkstep Shinobi', 'Voltweave Skirmisher', 'Stormwheel Striker', 'Thunderlace Executioner', 'Prismatic Storm Empress', 'The Infinite Thunderwheel'],
  razor: ['Nightwatch Bastion', 'Duskplate Sentinel', 'Eclipse Rampart', 'Nightglass Bulwark', 'Prismatic Eclipse Regent', 'The Unbroken Midnight'],
};

export const flagshipFighters: Record<FlagshipId, FighterDefinition> = {
  atmoso: {
    pilot: 'tempest',
    stats: { health: 205, defense: 9, damage: 39, crit: .2, shatterCapacity: 100, critMultiplier: 1.6, elementalDamage: 0 },
    passive: { name: 'Gale Cadence', description: '+15% outgoing damage at or below 50% health.', damageBonus: .15, defenseBonus: 0, healFraction: 0 },
    abilities: {
      skill1: { name: 'Razor Gale', description: '180% damage to one enemy.', cooldown: 2, strength: { damageMultiplier: 1.8 } },
      skill2: { name: 'Cyclone Weave', description: '120% damage to every living enemy.', cooldown: 3, targets: 'all-enemies', strength: { damageMultiplier: 1.2 } },
      ultimate: { name: 'Last Flare: Sky Without End', description: '290% damage to every living enemy. Recover next turn.', cooldown: 0, targets: 'all-enemies', strength: { damageMultiplier: 2.9 } },
    },
  },
  aurora: {
    stats: { health: 215, defense: 10, damage: 32, crit: .12, shatterCapacity: 100, critMultiplier: 1.5, elementalDamage: 0 },
    passive: { name: 'Lens of Diminishment', description: '+6 defense, included in effective defense.', damageBonus: 0, defenseBonus: 6, healFraction: 0 },
    abilities: {
      skill1: { name: 'Gleamseal', description: '140% damage to one enemy; weaken by 30% for two enemy phases.', cooldown: 2, strength: { damageMultiplier: 1.4, weakenFraction: .3 } },
      skill2: { name: 'Eclipse Mandate', description: '90% damage to every living enemy; weaken by 25% for two enemy phases.', cooldown: 3, targets: 'all-enemies', strength: { damageMultiplier: .9, weakenFraction: .25 } },
      ultimate: { name: 'Last Flare: Final Dawn Verdict', description: '220% damage to every living enemy; weaken by 40% for two enemy phases. Recover next turn.', cooldown: 0, targets: 'all-enemies', strength: { damageMultiplier: 2.2, weakenFraction: .4 } },
    },
  },
  bliss: {
    pilot: 'bloom',
    stats: { health: 210, defense: 10, damage: 42, crit: .25, shatterCapacity: 100, critMultiplier: 1.7, elementalDamage: 0 },
    passive: { name: 'Stillfeather Tempo', description: '+20% outgoing damage at or below 50% health.', damageBonus: .2, defenseBonus: 0, healFraction: 0 },
    abilities: {
      skill1: { name: 'Warfeather Cut', description: '175% damage to one enemy with +15 percentage points critical chance.', cooldown: 2, strength: { damageMultiplier: 1.75, critBonus: .15 } },
      skill2: { name: 'Quietstorm Flourish', description: '125% damage to every living enemy with +10 percentage points critical chance; restore 12 health to every living ally, no revival.', cooldown: 3, targets: 'all-enemies', strength: { damageMultiplier: 1.25, critBonus: .1, healing: 12 } },
      ultimate: { name: 'Last Flare: Thousandfeather Stillness', description: '300% damage to every living enemy with +20 percentage points critical chance. Recover next turn.', cooldown: 0, targets: 'all-enemies', strength: { damageMultiplier: 3, critBonus: .2 } },
    },
  },
  bruno: {
    stats: { health: 285, defense: 18, damage: 29, crit: .08, shatterCapacity: 100, critMultiplier: 1.5, elementalDamage: 0 },
    passive: { name: 'Faultbound Resolve', description: '+9 defense, included in effective defense.', damageBonus: 0, defenseBonus: 9, healFraction: 0 },
    abilities: {
      skill1: { name: 'Seismic Hammerfall', description: '155% damage to one enemy; weaken by 20% for two enemy phases.', cooldown: 2, strength: { damageMultiplier: 1.55, weakenFraction: .2 } },
      skill2: { name: 'Citadel Mantle', description: 'Give every living ally 32 shield (refresh; does not stack).', cooldown: 3, targets: 'all-allies', strength: { shield: 32 } },
      ultimate: { name: 'Last Flare: Worldwall Ascendant', description: '230% damage to every living enemy and 45 shield for allies. Recover next turn.', cooldown: 0, targets: 'all-enemies', strength: { damageMultiplier: 2.3, shield: 45 } },
    },
  },
  disciple: {
    stats: { health: 240, defense: 11, damage: 36, crit: .12, shatterCapacity: 100, critMultiplier: 1.5, elementalDamage: 0 },
    passive: { name: 'Shared Mindflame', description: '+15% outgoing damage at or below 50% health.', damageBonus: .15, defenseBonus: 0, healFraction: 0 },
    abilities: {
      skill1: { name: 'Thoughtspark Benediction', description: '150% damage to one enemy; increase living allies\' outgoing attack damage by 20% this and next player turn (refresh; does not stack).', cooldown: 2, strength: { damageMultiplier: 1.5, attackBoostFraction: .2 } },
      skill2: { name: 'Concord of Chaos', description: 'Increase living allies\' outgoing attack damage by 30% this and next player turn and give 20 shield (refresh; does not stack).', cooldown: 3, targets: 'all-allies', strength: { attackBoostFraction: .3, shield: 20 } },
      ultimate: { name: 'Last Flare: Unbound Mindcrown', description: 'Increase living allies\' outgoing attack damage by 40% this and next player turn and give 40 shield (refresh; does not stack). Recover next turn.', cooldown: 0, targets: 'all-allies', strength: { attackBoostFraction: .4, shield: 40 } },
    },
  },
  elise: {
    pilot: 'tempest',
    stats: { health: 195, defense: 8, damage: 40, crit: .25, shatterCapacity: 100, critMultiplier: 1.7, elementalDamage: 0 },
    passive: { name: 'Stormwheel Rhythm', description: '+15% outgoing damage at or below 50% health.', damageBonus: .15, defenseBonus: 0, healFraction: 0 },
    abilities: {
      skill1: { name: 'Voltstar Cut', description: '170% damage to one enemy with +20 percentage points critical chance.', cooldown: 2, strength: { damageMultiplier: 1.7, critBonus: .2 } },
      skill2: { name: 'Crosscurrent Volley', description: '115% damage to every living enemy.', cooldown: 3, targets: 'all-enemies', strength: { damageMultiplier: 1.15 } },
      ultimate: { name: 'Last Flare: Infinite Thunderwheel', description: '285% damage to every living enemy with +15 percentage points critical chance. Recover next turn.', cooldown: 0, targets: 'all-enemies', strength: { damageMultiplier: 2.85, critBonus: .15 } },
    },
  },
  razor: {
    stats: { health: 290, defense: 19, damage: 32, crit: .1, shatterCapacity: 100, critMultiplier: 1.5, elementalDamage: 0 },
    passive: { name: 'Unbroken Night', description: '+10 defense, included in effective defense.', damageBonus: 0, defenseBonus: 10, healFraction: 0 },
    abilities: {
      skill1: { name: 'Nightcleave', description: '165% damage to one enemy; weaken by 25% for two enemy phases.', cooldown: 2, strength: { damageMultiplier: 1.65, weakenFraction: .25 } },
      skill2: { name: 'Eclipse Bastion', description: 'Give every living ally 35 shield (refresh; does not stack).', cooldown: 3, targets: 'all-allies', strength: { shield: 35 } },
      ultimate: { name: 'Last Flare: Unbroken Midnight', description: '240% damage to every living enemy and 50 shield for allies. Recover next turn.', cooldown: 0, targets: 'all-enemies', strength: { damageMultiplier: 2.4, shield: 50 } },
    },
  },
};

function icons(id: FlagshipId) {
  return { passive: `${id}-passive`, light: `${id}-light`, skill1: `${id}-skill1`, skill2: `${id}-skill2`, ultimate: `${id}-ultimate`, defend: `${id}-defend` };
}

export const flagshipAbilityIcons = {
  atmoso: icons('atmoso'), aurora: icons('aurora'), bliss: icons('bliss'), bruno: icons('bruno'),
  disciple: icons('disciple'), elise: icons('elise'), razor: icons('razor'),
};
