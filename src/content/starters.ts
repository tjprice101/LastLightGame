import { flagshipCharacters } from './flagships';
import { warCharacters } from './war-characters';

export const openingStarters = [
  {
    id: 'ember',
    stars: 5,
    name: 'Infernis',
    role: 'Attacker',
    art: 'infernis',
    title: 'Wrath that guards a fragile beginning',
    element: 'Infernic',
    elementId: 'infernic',
    weapon: 'Greatsword',
    color: '#f39b6d',
    description: 'A human Infernic Element-Bearer shaped in Let’s image, Infernis carries Wrath in a wooden greatsword and red scarf, turning fierce feeling toward protection.',
    lore: {
      origin: 'The watchfires and village keepers of Ashen Vale',
      story: 'When Ashen Vale’s watchfires failed, Infernis carried their last coal in a clay lantern, her wooden training greatsword in hand and the keepers’ red scarf at her neck. As a human Element-Bearer made in Let’s image, she knows Infernic answers Wrath: anger can burn a refuge down, or give someone the courage to defend it. Rise’s Elemental-Devourers have stolen the same element, and both factions hunt their creators’ scattered souls; Let’s remains unreunited, and no side has won. Infernis follows the rumor of his soul not for a throne, but so no traveler must face the dark alone.',
      vow: 'Let my Wrath shelter the next beginning.',
      awakening: 'The last coal stirs; the missing soul is still ahead.',
    },
  },
  {
    id: 'tide',
    stars: 5,
    name: 'Tizu',
    role: 'Tank',
    art: 'tizu',
    title: 'Sadness remembered, and carried safely',
    element: 'Oceanic',
    elementId: 'oceanic',
    weapon: 'Spear',
    color: '#79c9eb',
    description: 'A human Oceanic Element-Bearer shaped in Let’s image, Tizu’s blue hair, simple spear, and blue ferrykeeper sash follow remembered Sadness.',
    lore: {
      origin: 'The ferry bells and silent shores of Glasswater',
      story: 'Tizu learned every Glasswater bell that guided boats through the mist. After the bells fell silent, he tied on his blue ferrykeeper sash and took a practice spear to the shore. His Oceanic element holds Sadness without letting grief become an anchor: he records the names of the missing keepers and follows currents that might bring them home. Let’s first made human Element-Bearers in his image, while Rise made Elemental-Devourers who broke the old boundary and stole the same elements. Both search for their creators’ souls, but neither has been reunited; Tizu seeks Let’s without mistaking a hopeful current for proof.',
      vow: 'No one is lost while the water remembers.',
      awakening: 'A grieving current rises, but its source remains unknown.',
    },
  },
  {
    id: 'sprout',
    stars: 5,
    name: 'Flora',
    role: 'Healer & Support',
    art: 'flora',
    title: 'Joy gives life room to return',
    element: 'Botanic',
    elementId: 'botanic',
    weapon: 'Bow',
    color: '#a9d58a',
    description: 'A human Botanic Element-Bearer shaped in Let’s image, Flora’s wooden bow and green neckerchief accompany Joy and Life wherever hope can take root.',
    lore: {
      origin: 'The waking roots and gardeners of Hollowgreen',
      story: 'Flora tended a small garden in Hollowgreen after the old trees stopped bearing leaves. When one seed opened beneath the gray branches, she took her wooden bow and the gardeners’ green neckerchief to find more ground worth tending. Botanic carries both Joy and Life: delight is not denial of loss, but the choice to make room for what can grow. Let created human Element-Bearers in his image; Rise’s Elemental-Devourers later stole those same elements, and both factions now seek their creators’ souls. Flora follows the still-unfound soul of Let, hoping its return might keep the worlds open to renewal; no faction has yet prevailed.',
      vow: 'Give joy and life a place to take root.',
      awakening: 'A sleeping seed opens; the search is not over.',
    },
  },
] as const;

export const roseCharacters = [
  {
    id: 'rosetta', stars: 6, name: 'Rosetta', role: 'Attacker', art: 'rosetta',
    title: 'Peace takes flight beneath a crimson sun', element: 'Tranquilitic', elementId: 'tranquilitic',
    weapon: 'Bow', color: '#eee2af',
    description: 'A human Tranquilitic Element-Bearer shaped in Let’s image, Rosetta’s bow, golden thorns, and crimson wings defend peace without demanding possession.',
    lore: { origin: 'The gardens beneath sunny skies', story: 'Rosetta learned among the sunny rose gardens that peace is a practice, not a command to be silent. Her bow draws golden thorns through the crimson canopy to open an escape for those caught in others’ quarrels. Tranquilitic reflects Peace, and she carries that meaning as one of the human Element-Bearers Let created in his image. Rise’s Elemental-Devourers stole the same element; both factions seek their creators’ souls, still unfound, and no victor can yet claim the world. Rosetta follows the rumors with care, wary of any peace bought by making one creator absolute.', vow: 'Let every rose shelter a beginning.', awakening: 'A crimson petal turns toward the sun; the soul is still sought.' },
  },
  {
    id: 'thornia', stars: 6, name: 'Thornia', role: 'Tank', art: 'thornia',
    title: 'Destruction held to account at the garden gate', element: 'Chaotic', elementId: 'chaotic',
    weapon: 'Greatsword', color: '#bc9bef',
    description: 'A human Chaotic Element-Bearer shaped in Let’s image, Thornia wears a golden rose in her hair and bears a crimson-thorn-wrapped greatsword.',
    lore: { origin: 'The forbidden garden', story: 'Thornia guarded a single golden rose at the edge of the forbidden garden. When its gates broke, she wrapped crimson thorns around her greatsword and held the breach so its people could escape. Chaotic reflects Death and Destruction, truths she refuses to disguise as virtue or wield carelessly. Let created human Element-Bearers in his image; Rise created Elemental-Devourers in hers and broke convention to steal the same elements. Both factions seek their creators’ souls, but neither soul has been reunited and no one has won. Thornia searches for Let’s, intent on keeping destructive power from deciding who deserves to live.', vow: 'No one crosses these thorns alone.', awakening: 'The golden rose remembers its guardian, not a victor.' },
  },
  {
    id: 'crinso', stars: 6, name: 'Crinso', role: 'Attacker', art: 'crinso',
    title: 'One blade, honest about death and renewal', element: 'Chaotic', elementId: 'chaotic',
    weapon: 'Dual-edged sword', color: '#ed8bbe',
    description: 'A human Chaotic Element-Bearer shaped in Let’s image, Crinso wields one dual-edged sword: golden fire on one edge, crimson lightning on the other.',
    lore: { origin: 'The paths between twin roses', story: 'On the paths between twin roses, Crinso learned that tending a garden sometimes means protecting what lives and sometimes accepting what must end. His small double-edged dagger became one rose-centered sword, golden fire and crimson lightning held in a single grip. Chaotic bears Death and Destruction, not a promise of cruelty. Let made human Element-Bearers in his image; Rise’s Elemental-Devourers broke convention to steal their elements. Both sides hunt their creators’ souls, still separate and unfound, and Crinso will not call the contest settled before either is found. He follows the trail of Let’s soul while guarding the people caught between factions.', vow: 'I choose what grows beyond the storm.', awakening: 'Two petals unfold around one resolve; neither soul has returned.' },
  },
] as const;
export const starters = [...openingStarters, ...roseCharacters, ...flagshipCharacters, ...warCharacters] as const;
export type Starter = (typeof starters)[number];
export type StarterId = Starter['id'];
export type RoseCharacterId = (typeof roseCharacters)[number]['id'];
export const availableStarters = openingStarters;

export function isRoseCharacter(id: StarterId): id is RoseCharacterId {
  return roseCharacters.some((character) => character.id === id);
}

export function isAvailableStarter(id: StarterId): boolean {
  return availableStarters.some((starter) => starter.id === id);
}

export function isStarterId(value: unknown): value is StarterId {
  return starters.some((starter) => starter.id === value);
}

export function getStarter(id: StarterId): Starter {
  const starter = starters.find((entry) => entry.id === id);
  if (!starter) throw new Error(`Unknown starter: ${id}`);
  return starter;
}
