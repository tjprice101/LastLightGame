export const starters = [
  {
    id: 'ember',
    name: 'Ember Beginner',
    title: 'The spark that refuses to fade',
    element: 'Fire',
    weapon: 'Sword',
    color: '#f39b6d',
    description: 'A copper-haired wanderer with a wooden sword and a red scarf. Even the smallest spark can hold back the dark.',
  },
  {
    id: 'tide',
    name: 'Tide Beginner',
    title: 'A quiet tide. An unbroken will.',
    element: 'Water',
    weapon: 'Spear',
    color: '#79c9eb',
    description: 'A blue-haired traveler with a simple spear and a blue sash. Where the world falls silent, the tide keeps moving.',
  },
  {
    id: 'sprout',
    name: 'Sprout Beginner',
    title: 'Life takes root in the impossible',
    element: 'Grass',
    weapon: 'Bow',
    color: '#a9d58a',
    description: 'A green-haired archer with a wooden bow and a green neckerchief. A new beginning grows from a single seed.',
  },
] as const;

export type Starter = (typeof starters)[number];
export type StarterId = Starter['id'];

export function isStarterId(value: unknown): value is StarterId {
  return starters.some((starter) => starter.id === value);
}

export function getStarter(id: StarterId): Starter {
  const starter = starters.find((entry) => entry.id === id);
  if (!starter) throw new Error(`Unknown starter: ${id}`);
  return starter;
}
