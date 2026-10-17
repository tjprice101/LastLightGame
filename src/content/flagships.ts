import type { FighterDefinition } from './combat';

export const flagshipCharacters = [
  {
    id: 'atmoso', stars: 5, name: 'Atmoso', role: 'Attacker', art: 'atmoso',
    title: 'Calm charts a road through the broken sky', element: 'Atmospheric', elementId: 'atmospheric',
    weapon: 'Wind staff', color: '#79d6cc',
    description: 'A human Atmospheric Element-Bearer shaped in Let’s image, Atmoso uses a crystal-tipped wind staff to turn Calm into open roads.',
    lore: { origin: 'The high roads and mountain settlements of Sky-bound Rift', story: 'Atmoso once carried messages between Sky-bound Rift’s mountain settlements with a weathered staff and an unusually patient ear. Atmospheric reflects Calm: he waits for each voice in the wind rather than forcing the gale to answer. Let created human Element-Bearers in his image, while Rise created Elemental-Devourers in hers and broke convention to steal the same elements. Both factions seek their creators’ souls; neither has been reunited or crowned, and the race remains unresolved. Atmoso follows reports of Let’s scattered soul as carefully as he charts a route home for each lost message.',
      vow: 'No road ends while the wind remembers.',
      awakening: 'A familiar breeze finds a new direction, not its maker.' },
  },
  {
    id: 'aurora', stars: 6, name: 'Aurora', role: 'Support', art: 'aurora',
    title: 'Peace sees what every verdict leaves behind', element: 'Tranquilitic', elementId: 'tranquilitic',
    weapon: 'Empty-hand light casting', color: '#eee2af',
    description: 'A human Tranquilitic Element-Bearer shaped in Let’s image, Aurora casts light through prismatic lenses to defend Peace without wielding a weapon.',
    lore: { origin: 'The lens courts of Lustrous River', story: 'Aurora inherited a lens in the Lustrous River courts that revealed the lives left outside every verdict. She set aside the courts’ certainty and uses empty-handed light casting to temper violence, not to command obedience. Tranquilitic reflects Peace, the choice to make room for another answer. Let created human Element-Bearers in his image; Rise’s Elemental-Devourers later stole the same elements. Both seek their creators’ souls, but both remain unfound and no faction has won. Aurora studies the lens for signs of Let’s soul, refusing to mistake a glimmer for its return.', vow: 'Let the dawn reveal a better choice.', awakening: 'A prism turns toward an unwritten verdict; the search continues.' },
  },
  {
    id: 'bliss', stars: 6, name: 'Bliss', role: 'Attacker', art: 'bliss',
    title: 'Peace moves with a thousand careful feathers', element: 'Tranquilitic', elementId: 'tranquilitic',
    weapon: 'Paired feather fans', color: '#a8ded5',
    description: 'A human Tranquilitic Element-Bearer shaped in Let’s image, Bliss turns Peace into motion with her paired feather fans.',
    lore: { origin: 'The feather courts of City of Heaven', story: 'Bliss learned in City of Heaven’s feather courts that Peace is not stillness imposed on others, but attention to how each step affects them. Her paired fans preserve the court’s rhythm as she draws danger away from those unable to flee. Let made human Element-Bearers in his image; Rise made Elemental-Devourers in hers and broke convention to steal their elements. Both factions seek their creators’ souls, which remain unfound; no victor has emerged. Bliss follows the scattered traces of Let’s soul, dancing between the pursuit and the people it threatens.', vow: 'My stillness will never mean surrender.', awakening: 'A quiet feather settles into your hand; the dance remains unfinished.' },
  },
  {
    id: 'bruno', stars: 5, name: 'Bruno', role: 'Tank', art: 'bruno',
    title: 'Joy and life endure beneath falling stone', element: 'Botanic', elementId: 'botanic',
    weapon: 'Stone hammer', color: '#c7a782',
    description: 'A human Botanic Element-Bearer shaped in Let’s image, Bruno bears Joy and Life through a stone hammer and shelters of living bedrock.',
    lore: { origin: 'The quarries of Precipice of the Earth', story: 'Bruno stayed when the quarries of Precipice began to collapse. With his stone hammer he made broken slabs into shelter, then shared the workers’ relief as a kind of joy worth protecting. Botanic joins Joy with Life: even buried foundations can hold a future. Let created human Element-Bearers in his image, and Rise created Elemental-Devourers in hers, stealing the same elements; both factions now seek their creators’ souls. Neither has found or reunited one, so Bruno guards the workers while tracing rumors of Let’s soul, unwilling to call any faction’s claim a victory.', vow: 'Stand behind me. We will hold.', awakening: 'Bedrock answers a steady hand; the foundation is not a throne.' },
  },
  {
    id: 'disciple', stars: 6, name: 'Disciple', role: 'Support', art: 'disciple',
    title: 'Mortality binds no mind to a single will', element: 'Chaotic', elementId: 'chaotic',
    weapon: 'Empty-hand psychic casting', color: '#c68aea',
    description: 'A human Chaotic Element-Bearer shaped in Let’s image, Disciple uses open-handed psychic casting to share strength without binding another mind.',
    lore: { origin: 'The thought forges of Ruins of Chaos', story: 'Disciple refused the thought forges of Ruins of Chaos when they demanded one will from every mind. His open hands now weave scarlet mindflame into a freely shared resolve. Chaotic bears Death and Destruction, facts of existence rather than a license to erase another person’s choices. Let created human Element-Bearers in his image; Rise created Elemental-Devourers in hers and broke convention to steal the same elements. Both factions hunt their creators’ souls, still unreunited, and neither has prevailed. Disciple searches for Let’s scattered soul while resisting every promise that reunion must mean unquestioned rule.', vow: 'Strength shared is freedom preserved.', awakening: 'An unbound thought reaches for your own; no mind has claimed its maker.' },
  },
  {
    id: 'elise', stars: 5, name: 'Elise', role: 'Attacker', art: 'elise',
    title: 'Calm finds its way through the storm', element: 'Atmospheric', elementId: 'atmospheric',
    weapon: 'Two four-point shuriken', color: '#b6e49a',
    description: 'A human Atmospheric Element-Bearer shaped in Let’s image, Elise reads a storm with exactly two four-point shuriken and a calm, measured step.',
    lore: { origin: 'The circuit paths of Galvanic Field', story: 'Elise mapped the forgotten circuits of Galvanic Field with exactly two four-point shuriken and a steady eye. When the field fractured, she learned that Atmospheric Calm is not passivity: it is the pause in which a safe opening can be seen. Let made human Element-Bearers in his image; Rise’s Elemental-Devourers stole the same elements, and both factions seek their creators’ souls. Neither creator’s soul has been found or reunited, and no one has won. Elise follows the field’s branching currents for clues to Let’s soul, but never at the cost of leaving a neighbor behind.', vow: 'There is always another opening.', awakening: 'Two sparks trace a path through the storm; the source remains distant.' },
  },
  {
    id: 'razor', stars: 6, name: 'Razor', role: 'Tank', art: 'razor',
    title: 'At midnight, destruction meets a steadfast guard', element: 'Chaotic', elementId: 'chaotic',
    weapon: 'Night sword', color: '#bc9bef',
    description: 'A human Chaotic Element-Bearer shaped in Let’s image, Razor guards the Valley with one night sword and an eclipse bastion.',
    lore: { origin: 'The nightwatch and abandoned gates of Valley of Solitude', story: 'Razor kept watch after the Valley of Solitude gates were abandoned. He shaped the darkness around them into a bastion with one night sword, so frightened travelers could pass safely. Chaotic reflects Death and Destruction; Razor knows a guard must face both without turning protection into domination. Let created human Element-Bearers in his image, and Rise created Elemental-Devourers in hers, breaking convention to steal the same elements. Both factions seek their creators’ souls, but neither has reunited one and no side has won. Razor tracks signs of Let’s scattered soul between watches, never leaving the gate unguarded for a promised ending.', vow: 'The night will find me standing.', awakening: 'A silent sentinel answers your call, not the call of a found soul.' },
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
      skill1: { name: 'Razor Gale', description: '180% damage to one enemy.', cooldown: 0, strength: { damageMultiplier: 1.8 } },
      skill2: { name: 'Cyclone Weave', description: '120% damage to every living enemy.', cooldown: 0, targets: 'all-enemies', strength: { damageMultiplier: 1.2 } },
      ultimate: { name: 'Last Flare: Sky Without End', description: '290% damage to every living enemy. Recover next turn.', cooldown: 0, targets: 'all-enemies', strength: { damageMultiplier: 2.9 } },
    },
  },
  aurora: {
    stats: { health: 215, defense: 10, damage: 32, crit: .12, shatterCapacity: 100, critMultiplier: 1.5, elementalDamage: 0 },
    passive: { name: 'Lens of Diminishment', description: '+6 defense, included in effective defense.', damageBonus: 0, defenseBonus: 6, healFraction: 0 },
    abilities: {
      skill1: { name: 'Gleamseal', description: '140% damage to one enemy; weaken by 30% for two enemy phases.', cooldown: 0, strength: { damageMultiplier: 1.4, weakenFraction: .3 } },
      skill2: { name: 'Eclipse Mandate', description: '90% damage to every living enemy; weaken by 25% for two enemy phases.', cooldown: 0, targets: 'all-enemies', strength: { damageMultiplier: .9, weakenFraction: .25 } },
      ultimate: { name: 'Last Flare: Final Dawn Verdict', description: '220% damage to every living enemy; weaken by 40% for two enemy phases. Recover next turn.', cooldown: 0, targets: 'all-enemies', strength: { damageMultiplier: 2.2, weakenFraction: .4 } },
    },
  },
  bliss: {
    pilot: 'bloom',
    stats: { health: 210, defense: 10, damage: 42, crit: .25, shatterCapacity: 100, critMultiplier: 1.7, elementalDamage: 0 },
    passive: { name: 'Stillfeather Tempo', description: '+20% outgoing damage at or below 50% health.', damageBonus: .2, defenseBonus: 0, healFraction: 0 },
    abilities: {
      skill1: { name: 'Warfeather Cut', description: '175% damage to one enemy with +15 percentage points critical chance.', cooldown: 0, strength: { damageMultiplier: 1.75, critBonus: .15 } },
      skill2: { name: 'Quietstorm Flourish', description: '125% damage to every living enemy with +10 percentage points critical chance; restore 12 health to every living ally, no revival.', cooldown: 0, targets: 'all-enemies', strength: { damageMultiplier: 1.25, critBonus: .1, healing: 12 } },
      ultimate: { name: 'Last Flare: Thousandfeather Stillness', description: '300% damage to every living enemy with +20 percentage points critical chance. Recover next turn.', cooldown: 0, targets: 'all-enemies', strength: { damageMultiplier: 3, critBonus: .2 } },
    },
  },
  bruno: {
    stats: { health: 285, defense: 18, damage: 29, crit: .08, shatterCapacity: 100, critMultiplier: 1.5, elementalDamage: 0 },
    passive: { name: 'Faultbound Resolve', description: '+9 defense, included in effective defense.', damageBonus: 0, defenseBonus: 9, healFraction: 0 },
    abilities: {
      skill1: { name: 'Seismic Hammerfall', description: '155% damage to one enemy; weaken by 20% for two enemy phases.', cooldown: 0, strength: { damageMultiplier: 1.55, weakenFraction: .2 } },
      skill2: { name: 'Citadel Mantle', description: 'Give every living ally 32 shield (refresh; does not stack).', cooldown: 0, targets: 'all-allies', strength: { shield: 32 } },
      ultimate: { name: 'Last Flare: Worldwall Ascendant', description: '230% damage to every living enemy and 45 shield for allies. Recover next turn.', cooldown: 0, targets: 'all-enemies', strength: { damageMultiplier: 2.3, shield: 45 } },
    },
  },
  disciple: {
    stats: { health: 240, defense: 11, damage: 36, crit: .12, shatterCapacity: 100, critMultiplier: 1.5, elementalDamage: 0 },
    passive: { name: 'Shared Mindflame', description: '+15% outgoing damage at or below 50% health.', damageBonus: .15, defenseBonus: 0, healFraction: 0 },
    abilities: {
      skill1: { name: 'Thoughtspark Benediction', description: '150% damage to one enemy; increase living allies\' outgoing attack damage by 20% this and next player turn (refresh; does not stack).', cooldown: 0, strength: { damageMultiplier: 1.5, attackBoostFraction: .2 } },
      skill2: { name: 'Concord of Chaos', description: 'Increase living allies\' outgoing attack damage by 30% this and next player turn and give 20 shield (refresh; does not stack).', cooldown: 0, targets: 'all-allies', strength: { attackBoostFraction: .3, shield: 20 } },
      ultimate: { name: 'Last Flare: Unbound Mindcrown', description: 'Increase living allies\' outgoing attack damage by 40% this and next player turn and give 40 shield (refresh; does not stack). Recover next turn.', cooldown: 0, targets: 'all-allies', strength: { attackBoostFraction: .4, shield: 40 } },
    },
  },
  elise: {
    pilot: 'tempest',
    stats: { health: 195, defense: 8, damage: 40, crit: .25, shatterCapacity: 100, critMultiplier: 1.7, elementalDamage: 0 },
    passive: { name: 'Stormwheel Rhythm', description: '+15% outgoing damage at or below 50% health.', damageBonus: .15, defenseBonus: 0, healFraction: 0 },
    abilities: {
      skill1: { name: 'Voltstar Cut', description: '170% damage to one enemy with +20 percentage points critical chance.', cooldown: 0, strength: { damageMultiplier: 1.7, critBonus: .2 } },
      skill2: { name: 'Crosscurrent Volley', description: '115% damage to every living enemy.', cooldown: 0, targets: 'all-enemies', strength: { damageMultiplier: 1.15 } },
      ultimate: { name: 'Last Flare: Infinite Thunderwheel', description: '285% damage to every living enemy with +15 percentage points critical chance. Recover next turn.', cooldown: 0, targets: 'all-enemies', strength: { damageMultiplier: 2.85, critBonus: .15 } },
    },
  },
  razor: {
    stats: { health: 290, defense: 19, damage: 32, crit: .1, shatterCapacity: 100, critMultiplier: 1.5, elementalDamage: 0 },
    passive: { name: 'Unbroken Night', description: '+10 defense, included in effective defense.', damageBonus: 0, defenseBonus: 10, healFraction: 0 },
    abilities: {
      skill1: { name: 'Nightcleave', description: '165% damage to one enemy; weaken by 25% for two enemy phases.', cooldown: 0, strength: { damageMultiplier: 1.65, weakenFraction: .25 } },
      skill2: { name: 'Eclipse Bastion', description: 'Give every living ally 35 shield (refresh; does not stack).', cooldown: 0, targets: 'all-allies', strength: { shield: 35 } },
      ultimate: { name: 'Last Flare: Unbroken Midnight', description: '240% damage to every living enemy and 50 shield for allies. Recover next turn.', cooldown: 0, targets: 'all-enemies', strength: { damageMultiplier: 2.4, shield: 50 } },
    },
  },
};

function icons(id: FlagshipId) {
  return { passive: `${id}-passive`, light: `${id}-light`, skill1: `${id}-skill1`, skill2: `${id}-skill2`, ultimate: `${id}-ultimate` };
}

export const flagshipAbilityIcons = {
  atmoso: icons('atmoso'), aurora: icons('aurora'), bliss: icons('bliss'), bruno: icons('bruno'),
  disciple: icons('disciple'), elise: icons('elise'), razor: icons('razor'),
};
