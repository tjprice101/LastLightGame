import { storyRegions, storyRules } from './story';
import { elementEmotions, worldHistory } from './world-lore';
import { getElement } from './activities';

export const chapterOneTitle = 'Chapter 1: Search the Six Beacons of Emotion';

export const storyCodexEntries = [
  { id: 'founding', stage: 0, title: 'Let and Rise', paragraphs: worldHistory.map(entry => entry.text) },
  ...storyRegions.map((region, index) => ({
    id: `beacon-${region.element}`,
    stage: (index + 1) * storyRules.regionStages,
    title: `${region.name} · Beacon restored`,
    paragraphs: [
      `${region.name} is the ${['first', 'second', 'third', 'fourth', 'fifth', 'sixth'][index]} region of the search. Its ${getElement(region.element).name} element carries ${elementEmotions[region.element]}.`,
      `Rise destroyed the beacons' cores. The Elemental-Devourers oppose their restoration because the beacons are major stepping stones toward finding Let's soul. ${region.boss} guarded this region's beacon.`,
      region.conclusion,
    ],
  })),
] as const;
