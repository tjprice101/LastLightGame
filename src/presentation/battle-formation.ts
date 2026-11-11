export interface RadiantFormationSlot {
  x: number;
  y: number;
  scale: number;
}

const formations: readonly (readonly RadiantFormationSlot[])[] = [
  [{ x: 50, y: 90, scale: 1.35 }],
  [{ x: 34, y: 80, scale: 1.1 }, { x: 66, y: 92, scale: 1.2 }],
  [{ x: 34, y: 84, scale: 1.08 }, { x: 50, y: 67, scale: 1 }, { x: 66, y: 92, scale: 1.16 }],
  [{ x: 26, y: 62, scale: .88 }, { x: 70, y: 58, scale: .86 },
    { x: 37, y: 94, scale: 1 }, { x: 70, y: 91, scale: .97 }],
  [{ x: 25, y: 59, scale: .86 }, { x: 49, y: 57, scale: .82 }, { x: 75, y: 57, scale: .86 },
    { x: 32, y: 95, scale: .97 }, { x: 69, y: 90, scale: .96 }],
  [{ x: 25, y: 62, scale: .85 }, { x: 49, y: 52, scale: .82 }, { x: 75, y: 64, scale: .85 },
    { x: 30, y: 92, scale: .97 }, { x: 55, y: 97, scale: .94 }, { x: 70, y: 94, scale: .97 }],
];

export function radiantFormation(size: number): readonly RadiantFormationSlot[] {
  if (!Number.isInteger(size) || size < 1 || size > formations.length)
    throw new Error('Radiant formations require one to six units.');
  return formations[size - 1];
}

export function radiantFormationStyle(slot: RadiantFormationSlot, index: number, ally: boolean): string {
  const x = ally ? 100 - slot.x : slot.x;
  return `--formation:${index};--formation-x:${x}%;--formation-y:${slot.y}%;` +
    `--formation-scale:${slot.scale};--formation-depth:${slot.y}`;
}
