import groundAnchors from './radiant-ground-anchors.json';

const anchors: Record<string, number> = groundAnchors.anchors;

export function radiantGroundGap(asset: string): number {
  const gap = anchors[asset];
  if (gap === undefined) throw new Error(`Missing Radiant ground contact for ${asset}.`);
  return gap;
}
