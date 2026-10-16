import type { ElementalEffectTag } from './elemental-effects';

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
  'native-flora-seed': 'abilities/statuses/status-native-flora-seed.png',
  'native-flora-empowered-seed': 'abilities/statuses/status-native-flora-empowered-seed.png',
  'native-atmoso-cyclone': 'abilities/statuses/status-native-atmoso-cyclone.png',
  'native-elise-held-blade': 'abilities/statuses/status-native-elise-held-blade.png',
  'native-elise-lodged-blade': 'abilities/statuses/status-native-elise-lodged-blade.png',
  'native-bliss-opening': 'abilities/statuses/status-native-bliss-opening.png',
  'native-bliss-passing': 'abilities/statuses/status-native-bliss-passing.png',
  'native-bliss-closing': 'abilities/statuses/status-native-bliss-closing.png',
  'native-disciple-strike': 'abilities/statuses/status-native-disciple-strike.png',
  'native-disciple-shelter': 'abilities/statuses/status-native-disciple-shelter.png',
  'native-disciple-resolve': 'abilities/statuses/status-native-disciple-resolve.png',
  'native-aurora-seal': 'abilities/statuses/status-native-aurora-seal.png',
  'native-aurora-ultimate-ward': 'abilities/statuses/status-native-aurora-ultimate-ward.png',
  'native-razor-wounds': 'abilities/statuses/status-native-razor-wounds.png',
  'native-razor-bastion': 'abilities/statuses/status-native-razor-bastion.png',
  'native-rosetta-quarry': 'abilities/statuses/status-native-rosetta-quarry.png',
  'native-thornia-trap': 'abilities/statuses/status-native-thornia-trap.png',
  'native-thornia-empowered-trap': 'abilities/statuses/status-native-thornia-empowered-trap.png',
  'native-crinso-gold-edge': 'abilities/statuses/status-native-crinso-gold-edge.png',
  'native-crinso-crimson-edge': 'abilities/statuses/status-native-crinso-crimson-edge.png',
  'native-crinso-combo': 'abilities/statuses/status-native-crinso-combo.png',
  'native-nerithe-survey': 'abilities/statuses/status-native-nerithe-survey.png',
  'native-orvella-foundation': 'abilities/statuses/status-native-orvella-foundation.png',
  'native-vaelor-tune': 'abilities/statuses/status-native-vaelor-tune.png',
  'native-vaelor-rise': 'abilities/statuses/status-native-vaelor-rise.png',
  'native-vaelor-crescendo': 'abilities/statuses/status-native-vaelor-crescendo.png',
  'native-bruno-cover': 'abilities/statuses/status-native-bruno-cover.png',
} as const;

export type StatusArtId = keyof typeof statusArt;

export function elementalStatusArt(effect: ElementalEffectTag): StatusArtId {
  if (effect.origin === 'rose') {
    if (effect.family === 'bloom' && effect.kind === 'healing') return 'rose-grace';
    if (effect.family === 'ward' && effect.kind === 'shield-absorption') return 'thorn-aegis';
    if (effect.family === 'burn' && effect.kind === 'burn') return 'rose-duality';
  }
  return effect.family;
}
