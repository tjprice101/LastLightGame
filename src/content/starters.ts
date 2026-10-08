import { flagshipCharacters } from './flagships';

export const openingStarters = [
  {
    id: 'ember',
    stars: 5,
    name: 'Infernis',
    role: 'Attacker',
    art: 'infernis',
    title: 'The spark that refuses to fade',
    element: 'Infernic (Fire)',
    elementId: 'infernic',
    weapon: 'Greatsword',
    color: '#f39b6d',
    description: 'A fire-hearted wanderer with a wooden greatsword and a red scarf. Even the smallest spark can hold back the dark.',
    lore: {
      origin: 'The watchfires of Ashen Vale',
      story: 'When the watchfires of Ashen Vale went cold, Infernis carried the last coal home in a clay lantern. With only a wooden training greatsword and a scarf sewn by the village keepers, she set out to rekindle the beacons. Infernis does not seek a throne or a legend - only a road where no traveler must face the darkness alone.',
      vow: 'If one spark remains, we can begin again.',
      awakening: 'The last coal answers your call.',
    },
  },
  {
    id: 'tide',
    stars: 5,
    name: 'Tizu',
    role: 'Tank',
    art: 'tizu',
    title: 'A quiet tide. An unbroken will.',
    element: 'Aquatic (Water)',
    elementId: 'aquatic',
    weapon: 'Spear',
    color: '#79c9eb',
    description: 'A blue-haired traveler with a simple spear and a blue sash. Where the world falls silent, the tide keeps moving.',
    lore: {
      origin: 'The silent shores of Glasswater',
      story: 'Tizu grew up listening to the bells of Glasswater guide boats through the mist. On the night the bells fell silent, he tied his ferrykeeper sash around his waist and took a practice spear to the shore. He now follows a current only he can hear, searching for the missing keepers and promising to bring every lost voyager safely home.',
      vow: 'No one is lost while the water remembers.',
      awakening: 'A forgotten current finds its way to you.',
    },
  },
  {
    id: 'sprout',
    stars: 5,
    name: 'Flora',
    role: 'Healer ~ Support',
    art: 'flora',
    title: 'Life takes root in the impossible',
    element: 'Efflorescent (Nature)',
    elementId: 'efflorescent',
    weapon: 'Bow',
    color: '#a9d58a',
    description: 'A green-haired archer with a wooden bow and a green neckerchief. A new beginning grows from a single seed.',
    lore: {
      origin: 'The waking roots of Hollowgreen',
      story: 'Flora tended the smallest garden in Hollowgreen, where the old trees had stopped bearing leaves. One morning, a single seed unfurled beneath the gray branches. Carrying a simple bow and the gardeners\' green neckerchief, she left to find soil where that fragile hope could flourish. Flora believes the world is not dying - it is waiting to be cared for.',
      vow: 'Give hope a place to take root.',
      awakening: 'A sleeping seed opens to your light.',
    },
  },
] as const;

export const roseCharacters = [
  {
    id: 'rosetta', stars: 6, name: 'Rosetta', role: 'Attacker', art: 'rosetta',
    title: 'Virtue takes flight beneath a crimson sun', element: 'Luminous (Light)', elementId: 'luminous',
    weapon: 'Bow', color: '#eee2af',
    description: 'A rose-bound archer whose golden thorns and crimson wings scatter the shadows.',
    lore: { origin: 'The gardens beneath sunny skies', story: 'Rosetta carries a quiet vow through the rose gardens: passion must protect life, not possess it. Her bow draws golden thorns across the sky, opening a path for those trapped beneath the crimson canopy.', vow: 'Let every rose shelter a beginning.', awakening: 'A crimson petal turns toward the sun.' },
  },
  {
    id: 'thornia', stars: 6, name: 'Thornia', role: 'Tank', art: 'thornia',
    title: 'The forbidden garden keeps its promises', element: 'Ominous (Shadow)', elementId: 'ominous',
    weapon: 'Greatsword', color: '#bc9bef',
    description: 'A shadow knight with a golden rose in her hair and a greatsword wrapped in crimson thorns.',
    lore: { origin: 'The forbidden garden', story: 'Thornia once guarded a single golden rose at the edge of a forgotten garden. When its gates broke, she took up a greatsword and wove its thorns into armor, refusing to let beauty become another weapon against the defenseless.', vow: 'No one crosses these thorns alone.', awakening: 'The golden rose remembers its guardian.' },
  },
  {
    id: 'crinso', stars: 6, name: 'Crinso', role: 'Attacker', art: 'crinso',
    title: 'Beauty and ruin share a single edge', element: 'Chaotic (Dark Matter ~ Energy)', elementId: 'chaotic',
    weapon: 'Dual-edged sword', color: '#ed8bbe',
    description: 'A swift rose knight wielding one dual-edged sword, golden fire on one edge and crimson lightning on the other.',
    lore: { origin: 'The paths between twin roses', story: 'Crinso learned that a garden needs both gentle tending and the strength to cut away what threatens it. His small double-edged dagger grew into a rose-centered blade as he followed that balance, carrying golden beauty and crimson destruction without surrendering to either.', vow: 'I choose what grows beyond the storm.', awakening: 'Two petals unfold around one resolve.' },
  },
] as const;
export const starters = [...openingStarters, ...roseCharacters, ...flagshipCharacters] as const;
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
