import type { ElementalEffectFamily, ElementalEffectTag } from './elemental-effects';

export const statusArt = {
  burn: 'abilities/statuses/status-burn.png',
  ward: 'abilities/statuses/status-ward.png',
  bloom: 'abilities/statuses/status-bloom.png',
  tempest: 'abilities/statuses/status-tempest.png',
  focus: 'abilities/statuses/status-focus.png',
  suppression: 'abilities/statuses/status-suppression.png',
  'rose-grace': 'abilities/statuses/status-rose-grace.png',
  'thorn-aegis': 'abilities/statuses/status-thorn-aegis.png',
  'rose-duality': 'abilities/statuses/status-rose-duality.png',
} as const satisfies Record<ElementalEffectFamily | 'rose-grace' | 'thorn-aegis' | 'rose-duality', string>;

export type StatusArtId = keyof typeof statusArt;

export function elementalStatusArt(effect: ElementalEffectTag): StatusArtId {
  if (effect.origin === 'rose') {
    if (effect.family === 'bloom' && effect.kind === 'healing') return 'rose-grace';
    if (effect.family === 'ward' && effect.kind === 'shield-absorption') return 'thorn-aegis';
    if (effect.family === 'burn' && effect.kind === 'burn') return 'rose-duality';
  }
  return effect.family;
}
