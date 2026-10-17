import { type ActionId } from '../content/combat';
import { type StarterId } from '../content/starters';
import { assetUrl } from './portrait';
import { flagshipAbilityIcons } from '../content/flagships';

export const infernisIcons = {
  passive: 'infernis-unbroken-ember',
  light: 'infernis-light-attack',
  skill1: 'infernis-cinder-cleave',
  skill2: 'infernis-flame-arc',
  ultimate: 'infernis-last-flare-dawnfire',
} as const;

export const abilityIcons = {
  ...flagshipAbilityIcons,
  nerithe: { passive: 'nerithe-passive', skill1: 'nerithe-skill1',
    skill2: 'nerithe-skill2', ultimate: 'nerithe-ultimate' },
  orvella: { passive: 'orvella-passive', light: 'orvella-light', skill1: 'orvella-skill1',
    skill2: 'orvella-skill2', ultimate: 'orvella-ultimate' },
  vaelor: { passive: 'vaelor-passive', light: 'vaelor-light', skill1: 'vaelor-skill1',
    skill2: 'vaelor-skill2', ultimate: 'vaelor-ultimate' },
  ember: infernisIcons,
  tide: {
    passive: 'tizu-stillwater-guard',
    light: 'tizu-normal-attack',
    skill1: 'tizu-undertow-thrust',
    skill2: 'tizu-tidal-shelter',
    ultimate: 'tizu-last-flare-ocean-memory',
  },
  sprout: {
    passive: 'flora-root-of-hope',
    light: 'flora-normal-attack',
    skill1: 'flora-briar-shot',
    skill2: 'flora-verdant-renewal',
    ultimate: 'flora-last-flare-worldseed',
  },
  rosetta: {
    passive: 'rosetta-passive', light: 'rosetta-light', skill1: 'rosetta-skill1',
    skill2: 'rosetta-skill2', ultimate: 'rosetta-ultimate',
  },
  thornia: {
    passive: 'thornia-passive', light: 'thornia-light', skill1: 'thornia-skill1',
    skill2: 'thornia-skill2', ultimate: 'thornia-ultimate',
  },
  crinso: {
    passive: 'crinso-passive', light: 'crinso-light', skill1: 'crinso-skill1',
    skill2: 'crinso-skill2', ultimate: 'crinso-ultimate',
  },
} as const satisfies Record<StarterId, Record<'skill1' | 'skill2' | 'ultimate' | 'passive', string> & { light?: string }>;

export function abilityIcon(starterId: StarterId, action: ActionId | 'passive'): string {
  const icons: Partial<Record<ActionId | 'passive', string>> = abilityIcons[starterId];
  const icon = action === 'light' ? 'universal-normal-attack' : icons[action];
  if (!icon) return '';
  return `<img class="ability-icon" src="${assetUrl(`abilities/${icon}.png`)}" alt="" aria-hidden="true" width="256" height="256" />`;
}
