export const starters = [
  {
    id: 'ember',
    name: 'Ember Beginner',
    title: 'The spark that refuses to fade',
    element: 'Fire',
    weapon: 'Sword',
    color: '#f39b6d',
    description: 'A copper-haired wanderer with a wooden sword and a red scarf. Even the smallest spark can hold back the dark.',
    lore: {
      origin: 'The watchfires of Ashen Vale',
      story: 'When the watchfires of Ashen Vale went cold, Ember carried the last coal home in a clay lantern. With only a wooden training sword and a scarf sewn by the village keepers, this young wanderer set out to rekindle the beacons. Ember does not seek a throne or a legend - only a road where no traveler must face the darkness alone.',
      vow: 'If one spark remains, we can begin again.',
      awakening: 'The last coal answers your call.',
    },
  },
  {
    id: 'tide',
    name: 'Tide Beginner',
    title: 'A quiet tide. An unbroken will.',
    element: 'Water',
    weapon: 'Spear',
    color: '#79c9eb',
    description: 'A blue-haired traveler with a simple spear and a blue sash. Where the world falls silent, the tide keeps moving.',
    lore: {
      origin: 'The silent shores of Glasswater',
      story: 'Tide grew up listening to the bells of Glasswater guide boats through the mist. On the night the bells fell silent, he tied his ferrykeeper sash around his waist and took a practice spear to the shore. He now follows a current only he can hear, searching for the missing keepers and promising to bring every lost voyager safely home.',
      vow: 'No one is lost while the water remembers.',
      awakening: 'A forgotten current finds its way to you.',
    },
  },
  {
    id: 'sprout',
    name: 'Sprout Beginner',
    title: 'Life takes root in the impossible',
    element: 'Grass',
    weapon: 'Bow',
    color: '#a9d58a',
    description: 'A green-haired archer with a wooden bow and a green neckerchief. A new beginning grows from a single seed.',
    lore: {
      origin: 'The waking roots of Hollowgreen',
      story: 'Sprout tended the smallest garden in Hollowgreen, where the old trees had stopped bearing leaves. One morning, a single seed unfurled beneath the gray branches. Carrying a simple bow and the gardeners\' green neckerchief, this archer left to find soil where that fragile hope could flourish. Sprout believes the world is not dying - it is waiting to be cared for.',
      vow: 'Give hope a place to take root.',
      awakening: 'A sleeping seed opens to your light.',
    },
  },
] as const;

export type Starter = (typeof starters)[number];
export type StarterId = Starter['id'];
export const availableStarters = starters.filter((starter) => starter.id === 'ember');

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
