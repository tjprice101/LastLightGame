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
  ozriel: { passive: 'ozriel-passive', skill1: 'ozriel-skill1', skill2: 'ozriel-skill2', ultimate: 'ozriel-ultimate' },
  ilvaris: { passive: 'ilvaris-passive', skill1: 'ilvaris-skill1', skill2: 'ilvaris-skill2', ultimate: 'ilvaris-ultimate' },
  kaelith: { passive: 'kaelith-passive', skill1: 'kaelith-skill1', skill2: 'kaelith-skill2', ultimate: 'kaelith-ultimate' },
  nerithe: { passive: 'nerithe-passive', skill1: 'nerithe-skill1',
    skill2: 'nerithe-skill2', ultimate: 'nerithe-ultimate' },
  orvella: { passive: 'orvella-passive', light: 'orvella-light', skill1: 'orvella-skill1',
    skill2: 'orvella-skill2', ultimate: 'orvella-ultimate' },
  vaelor: { passive: 'vaelor-passive', light: 'vaelor-light', skill1: 'vaelor-skill1',
    skill2: 'vaelor-skill2', ultimate: 'vaelor-ultimate' },
  caldrex: { passive: 'caldrex-passive', light: 'caldrex-light', skill1: 'caldrex-skill1',
    skill2: 'caldrex-skill2', ultimate: 'caldrex-ultimate' },
  solenne: { passive: 'solenne-passive', light: 'solenne-light', skill1: 'solenne-skill1',
    skill2: 'solenne-skill2', ultimate: 'solenne-ultimate' },
  myrthen: { passive: 'myrthen-passive', light: 'myrthen-light', skill1: 'myrthen-skill1',
    skill2: 'myrthen-skill2', ultimate: 'myrthen-ultimate' },
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
  maerion: { passive: '', skill1: '', skill2: '', ultimate: '' },
  caevren: { passive: '', skill1: '', skill2: '', ultimate: '' },
  vespera: { passive: '', skill1: '', skill2: '', ultimate: '' },
  ilyss: { passive: '', skill1: '', skill2: '', ultimate: '' },
  asteriel: { passive: '', skill1: '', skill2: '', ultimate: '' },
  serapha: { passive: '', skill1: '', skill2: '', ultimate: '' },
  rhaziel: { passive: '', skill1: '', skill2: '', ultimate: '' },
  oryn: { passive: '', skill1: '', skill2: '', ultimate: '' },
  thessara: { passive: '', skill1: '', skill2: '', ultimate: '' },
  elaris: { passive: '', skill1: '', skill2: '', ultimate: '' },
  veyr: { passive: '', skill1: '', skill2: '', ultimate: '' },
  aureth: { passive: '', skill1: '', skill2: '', ultimate: '' },
} as const satisfies Record<StarterId, Record<'skill1' | 'skill2' | 'ultimate' | 'passive', string> & { light?: string }>;

export function abilityIcon(starterId: StarterId, action: ActionId | 'passive'): string {
  const icons: Partial<Record<ActionId | 'passive', string>> = abilityIcons[starterId];
  const icon = action === 'light' ? 'universal-normal-attack' : icons[action];
  if (!icon) return '';
  return `<img class="ability-icon" src="${assetUrl(`abilities/${icon}.png`)}" alt="" aria-hidden="true" width="256" height="256" />`;
}
