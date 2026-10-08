export const ambientScreens = [
  'title', 'selection', 'home', 'character', 'summon', 'squad', 'gameplay',
  'inventory', 'stores', 'collections', 'story', 'events', 'battle', 'settings',
] as const;

export type AmbientScreen = (typeof ambientScreens)[number];

export function ambientBackground(screen: AmbientScreen): string {
  return `<div class="ambient-background" data-ambient-screen="${screen}" aria-hidden="true">
    <span class="ambient-pattern"></span><span class="ambient-orbit"></span><span class="ambient-drift"></span>
  </div>`;
}
