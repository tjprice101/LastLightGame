import { type ActionId } from '../content/combat';
import { type StarterId } from '../content/starters';
import { assetUrl } from './portrait';

export const infernisIcons = {
  passive: 'infernis-unbroken-ember',
  light: 'infernis-light-attack',
  skill1: 'infernis-cinder-cleave',
  skill2: 'infernis-flame-arc',
  ultimate: 'infernis-last-flare-dawnfire',
} as const;

export const abilityIcons = {
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
} as const satisfies Record<StarterId, Record<Exclude<ActionId, 'defend'> | 'passive', string>>;

export function abilityIcon(starterId: StarterId, action: ActionId | 'passive'): string {
  if (action === 'defend') return '';
  return `<img class="ability-icon" src="${assetUrl(`abilities/${abilityIcons[starterId][action]}.png`)}" alt="" aria-hidden="true" width="256" height="256" />`;
}
