export type ElementalEffectFamily = 'burn' | 'ward' | 'bloom' | 'tempest' | 'focus' | 'suppression';
export type ElementalEffectKind = 'burn' | 'shield-absorption' | 'healing' | 'critical' | 'weaken' | 'fracture';
export type ElementalEffectOrigin = 'native' | 'conduit' | 'rose';
export type ElementalEffectSource =
  | 'living-self-authored-burn'
  | 'living-self-authored-shield'
  | 'living-self-authored-healing'
  | 'living-self-critical-direct-activation'
  | 'authored-weaken'
  | 'conduit-fracture-mark';

export interface ElementalEffectTag {
  family: ElementalEffectFamily;
  kind: ElementalEffectKind;
  origin: ElementalEffectOrigin;
  source: ElementalEffectSource;
}

export const elementalEffectFamilies: Record<ElementalEffectFamily, {
  element: 'infernic' | 'oceanic' | 'botanic' | 'atmospheric' | 'tranquilitic' | 'chaotic';
  label: string;
}> = {
  burn: { element: 'infernic', label: 'Infernic Embers' },
  ward: { element: 'oceanic', label: 'Oceanic Protection' },
  bloom: { element: 'botanic', label: 'Botanic Renewal' },
  tempest: { element: 'atmospheric', label: 'Atmospheric Charge' },
  focus: { element: 'tranquilitic', label: 'Tranquilitic Focus' },
  suppression: { element: 'chaotic', label: 'Chaotic Suppression' },
};

export const sharedNativeEffects = {
  ember: {
    family: 'burn', kind: 'burn', origin: 'native', source: 'living-self-authored-burn',
  },
  ward: {
    family: 'ward', kind: 'shield-absorption', origin: 'native', source: 'living-self-authored-shield',
  },
  bloom: {
    family: 'bloom', kind: 'healing', origin: 'native', source: 'living-self-authored-healing',
  },
  tempest: {
    family: 'tempest', kind: 'critical', origin: 'native', source: 'living-self-critical-direct-activation',
  },
} as const satisfies Record<string, ElementalEffectTag>;

export function elementalEffectDescription(effect: ElementalEffectTag): string {
  const family = elementalEffectFamilies[effect.family].label;
  const kind: Record<ElementalEffectKind, string> = {
    burn: 'Burn damage',
    'shield-absorption': 'shield absorption',
    healing: 'healing',
    critical: 'critical hit',
    weaken: 'Weaken',
    fracture: 'Fracture',
  };
  return `${family} · ${kind[effect.kind]} · ${effect.origin}`;
}
