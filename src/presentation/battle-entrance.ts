export function entranceFrames(side: string, bounds: Pick<DOMRect, 'left' | 'right'>, viewportWidth: number): Keyframe[] {
  if (side !== 'ally' && side !== 'enemy') throw new Error('Unknown battle entrance side.');
  const distance = side === 'ally' ? viewportWidth - bounds.left + 32 : -bounds.right - 32;
  return [{ transform: `translateX(${distance}px)`, opacity: 0 }, { transform: 'translateX(0)', opacity: 1 }];
}
