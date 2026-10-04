import { type ActionId } from '../content/combat';
import { type StarterId } from '../content/starters';
import { assetUrl } from './portrait';

export const infernisIcons = {
  passive: 'infernis-unbroken-ember',
  light: 'infernis-light-attack',
  heavy: 'infernis-heavy-attack',
  skill1: 'infernis-cinder-cleave',
  skill2: 'infernis-flame-arc',
  ultimate: 'infernis-last-flare-dawnfire',
} as const;

export function abilityIcon(starterId: StarterId, action: ActionId | 'passive'): string {
  if (starterId !== 'ember') return '';
  return `<img class="ability-icon" src="${assetUrl(`abilities/${infernisIcons[action]}.png`)}" alt="" aria-hidden="true" width="256" height="256" />`;
}
