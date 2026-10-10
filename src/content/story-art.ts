import { type ElementId } from './activities';

export const storyWorldMap = 'story-world-map.png';

interface StoryRegionArt {
  background: string;
  enemies: readonly [string, string, string, string];
  boss: string;
}

export const storyRegionArt: Partial<Record<ElementId, StoryRegionArt>> = {
  infernic: { background: 'story-emberwake-march-arena.png',
    enemies: ['story-infernic-0', 'story-infernic-1', 'story-infernic-2', 'story-infernic-3'], boss: 'story-infernic-boss' },
  oceanic: { background: 'story-glasswater-reach-arena.png',
    enemies: ['story-oceanic-0', 'story-oceanic-1', 'story-oceanic-2', 'story-oceanic-3'], boss: 'story-oceanic-boss' },
  atmospheric: { background: 'story-stormspan-heights-arena.png',
    enemies: ['story-atmospheric-0', 'story-atmospheric-1', 'story-atmospheric-2', 'story-atmospheric-3'], boss: 'story-atmospheric-boss' },
  botanic: { background: 'story-rootstone-wilds-arena.png',
    enemies: ['story-botanic-0', 'story-botanic-1', 'story-botanic-2', 'story-botanic-3'], boss: 'story-botanic-boss' },
  tranquilitic: { background: 'story-stillhalo-vale-arena.png',
    enemies: ['story-tranquilitic-0', 'story-tranquilitic-1', 'story-tranquilitic-2', 'story-tranquilitic-3'], boss: 'story-tranquilitic-boss' },
  chaotic: { background: 'story-riftbound-frontier-arena.png',
    enemies: ['story-chaotic-0', 'story-chaotic-1', 'story-chaotic-2', 'story-chaotic-3'], boss: 'story-chaotic-boss' },
};
