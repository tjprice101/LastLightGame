export const currencies = [
  { id: 'fractalis', name: 'Fractalis', role: 'Main currency' },
  { id: 'lycalis', name: 'Lycalis', role: 'Premium currency' },
] as const;

export const artifactSlots = Array.from({ length: 8 }, (_, index) => index + 1);
export const upgradePaths = [
  { name: 'Evolution', detail: 'Unlock a new character form.' },
  { name: 'Character level', detail: 'Increase the character\'s level.' },
  { name: 'Weapon upgrade', detail: 'Improve the character\'s weapon.' },
  { name: 'Unique passive', detail: 'Upgrade the character\'s unique passive ability.' },
  { name: 'Ability 1', detail: 'Upgrade the first active ability.' },
  { name: 'Ability 2', detail: 'Upgrade the second active ability.' },
  { name: 'Last Flare', detail: 'Upgrade the ultimate. Naming format: Last Flare: <character-specific name>.' },
] as const;
