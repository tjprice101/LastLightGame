import type { RadiantBearerId } from '../content/radiant-combat';

export const radiantMotifPaths = {
  flame: 'M50 8 C72 32 78 46 72 65 C68 82 56 91 50 94 C32 88 23 76 27 59 C30 46 39 36 42 21 C49 35 50 42 50 51 C58 43 58 26 50 8 Z',
  blade: 'M50 7 L61 44 L57 72 L50 84 L43 72 L39 44 Z M30 75 H70 M50 84 V94',
  spire: 'M12 86 L27 45 L40 58 L51 12 L64 52 L76 32 L90 86 Z M28 79 L40 58 M63 78 L76 32',
  current: 'M10 60 C28 26 49 24 61 47 C70 64 82 63 91 46 M10 76 C27 52 41 52 53 69 C65 87 81 83 92 65',
  spear: 'M50 8 L64 35 L55 31 V83 H45 V31 L36 35 Z M34 71 H66',
  leaf: 'M16 82 C12 35 41 13 83 14 C84 56 61 85 16 82 Z M20 78 L76 22 M42 58 L35 38 M58 42 L72 48',
  blossom: 'M50 50 C21 28 29 10 50 14 C71 10 79 28 50 50 C78 22 92 36 84 54 C80 73 64 71 50 50 C65 78 52 91 37 83 C20 75 28 59 50 50 Z',
  branch: 'M50 90 V22 M50 52 L27 31 M50 65 L75 38 M27 31 L20 15 M27 31 L10 30 M75 38 L86 20 M75 38 L91 44',
  wind: 'M8 32 C36 9 83 16 80 37 C78 49 64 48 59 40 M10 54 C34 32 92 39 89 60 C87 72 70 72 65 62 M12 76 C31 64 57 70 58 85',
  vane: 'M13 18 H47 L38 43 H72 L88 22 V48 L63 63 H27 L13 82 Z M20 30 H37 M32 72 H62',
  orbit: 'M50 13 C16 13 9 77 50 87 C91 77 84 13 50 13 Z M14 50 C14 29 86 29 86 50 C86 71 14 71 14 50 Z M50 41 L59 50 L50 59 L41 50 Z',
  lens: 'M8 50 Q50 8 92 50 Q50 92 8 50 Z M50 22 L75 50 L50 78 L25 50 Z M50 7 V21 M50 79 V93',
  ray: 'M50 7 L55 38 L83 23 L64 47 L94 52 L63 57 L78 83 L54 65 L50 94 L45 65 L20 82 L37 57 L7 52 L37 47 L18 22 L45 38 Z',
  feather: 'M16 86 C14 37 43 12 83 10 C86 42 66 76 16 86 Z M21 81 L75 20 M38 64 L29 46 M53 48 L45 31 M58 49 L75 51',
  hammer: 'M15 17 H85 V37 H58 V80 H70 V91 H30 V80 H42 V37 H15 Z M23 24 H77',
  fracture: 'M50 7 L40 34 L56 42 L38 61 L50 70 L43 93 M16 32 L40 34 M56 42 L82 26 M38 61 L14 73 M50 70 L82 86',
  crown: 'M11 68 L18 25 L37 47 L50 10 L63 47 L82 25 L89 68 Z M20 78 H80 M35 58 H65',
  lattice: 'M50 9 L91 50 L50 91 L9 50 Z M50 24 L76 50 L50 76 L24 50 Z M50 9 V91 M9 50 H91',
  star: 'M50 7 L59 39 L93 50 L59 61 L50 93 L41 61 L7 50 L41 39 Z M50 34 L66 50 L50 66 L34 50 Z',
  crossing: 'M12 16 Q55 29 88 84 M88 16 Q45 29 12 84 M24 26 L76 74 M76 26 L24 74',
  bolt: 'M55 8 L29 52 H46 L37 92 L72 42 H55 Z',
  crescent: 'M69 10 C37 10 16 29 16 52 C16 75 37 92 69 90 C44 80 36 66 36 51 C36 35 45 21 69 10 Z',
  wall: 'M14 86 V31 H27 V18 H40 V31 H60 V18 H73 V31 H86 V86 Z M37 86 V60 L50 48 L63 60 V86',
  rose: 'M50 50 C21 19 41 8 50 25 C59 8 79 19 50 50 C83 25 91 45 72 51 C88 65 75 82 50 63 C25 82 12 65 28 51 C9 45 17 25 50 50 Z',
  arrow: 'M10 50 H78 M64 34 L80 50 L64 66 M18 50 L10 39 M18 50 L10 61',
  thorn: 'M10 86 L28 42 L38 56 L50 10 L62 56 L72 42 L90 86 L50 70 Z M22 75 L50 48 L78 75',
  bell: 'M27 67 Q31 43 32 33 Q35 18 50 18 Q65 18 68 33 Q69 43 73 67 L82 75 H18 Z M43 82 Q50 93 57 82 M50 8 V18',
  halo: 'M50 12 A38 38 0 1 1 49.9 12 M50 25 A25 25 0 1 0 50.1 25 M50 3 V18 M50 82 V97 M3 50 H18 M82 50 H97',
  vessel: 'M10 65 Q50 82 90 65 L78 84 H22 Z M23 61 V36 Q50 22 77 36 V61 M30 51 Q50 40 70 51',
  counterweight: 'M50 8 V34 M39 14 L50 5 L61 14 M33 37 Q50 27 67 37 L72 62 Q70 83 50 91 Q30 83 28 62 Z M38 52 L50 41 L62 52 L50 68 Z',
  beacon: 'M50 12 V84 M36 32 L50 17 L64 32 M25 43 Q50 23 75 43 M16 56 Q50 31 84 56 M40 84 H60',
  link: 'M24 28 C8 28 8 51 24 51 H42 M58 49 H76 C92 49 92 72 76 72 H58 M34 33 L46 45 M54 55 L66 67',
  ribbon: 'M10 25 C32 15 38 43 54 50 C70 57 74 83 91 74 M9 73 C26 82 32 58 46 50 C60 42 68 18 90 25',
  fan: 'M50 84 L12 33 Q32 12 50 18 Q68 12 88 33 Z M50 84 L30 25 M50 84 V20 M50 84 L70 25',
  chain: 'M30 14 C18 14 18 40 30 40 H42 C54 40 54 14 42 14 Z M58 60 C46 60 46 86 58 86 H70 C82 86 82 60 70 60 Z M42 38 L58 62',
  glass: 'M50 6 L87 31 L78 80 L50 94 L16 72 L12 30 Z M50 6 L42 39 L78 80 M12 30 L42 39 L16 72 M42 39 L87 31 M42 39 L50 94',
  lyre: 'M22 17 C12 30 14 73 50 85 C86 73 88 30 78 17 M22 17 H78 M34 22 V67 M45 20 V75 M55 20 V75 M66 22 V67',
} as const;

type RadiantMotif = keyof typeof radiantMotifPaths;
export const radiantMotifSequences = {
  ember: ['flame', 'blade', 'spire'], tide: ['current', 'spear', 'orbit'],
  sprout: ['leaf', 'blossom', 'branch'], atmoso: ['wind', 'vane', 'orbit'],
  aurora: ['lens', 'ray', 'orbit'], bliss: ['feather', 'fan', 'ray'],
  bruno: ['hammer', 'fracture', 'spire'], disciple: ['crown', 'lattice', 'ray'],
  elise: ['star', 'crossing', 'bolt'], razor: ['crescent', 'blade', 'wall'],
  rosetta: ['rose', 'arrow', 'ray'], thornia: ['thorn', 'wall', 'rose'],
  crinso: ['crossing', 'flame', 'bolt'], nerithe: ['spear', 'current', 'orbit'],
  orvella: ['wall', 'branch', 'spire'], vaelor: ['current', 'bolt', 'orbit'],
  caldrex: ['flame', 'wall', 'orbit'], solenne: ['bell', 'halo', 'wall'],
  myrthen: ['leaf', 'crescent', 'blossom'],
  maerion: ['vessel', 'current', 'crescent'], caevren: ['vane', 'orbit', 'counterweight'],
  vespera: ['beacon', 'ray', 'flame'], ilyss: ['link', 'ribbon', 'crescent'],
  asteriel: ['orbit', 'branch', 'blossom'], serapha: ['fan', 'crescent', 'halo'],
  neralis: ['current', 'spear', 'vessel'], varkhel: ['chain', 'counterweight', 'fracture'],
  seravelle: ['ray', 'spear', 'feather'], velmira: ['crossing', 'crescent', 'fracture'],
  ozriel: ['wall', 'glass', 'halo'], ilvaris: ['lyre', 'glass', 'current'],
  kaelith: ['crescent', 'glass', 'fracture'],
} as const satisfies Record<RadiantBearerId, readonly [RadiantMotif, RadiantMotif, RadiantMotif]>;

export type RadiantMotifMotion = 'sweep' | 'tide' | 'unfurl' | 'spiral' | 'orbit' |
  'brace' | 'pulse' | 'relay' | 'fracture';
export const radiantMotionPaths: Record<RadiantMotifMotion, string> = {
  sweep: 'M-94 42 C-58 -47 11 -92 90 -44 M-90 70 C-42 -12 23 -56 85 -18 M-82 -44 C-40 18 18 66 85 48',
  tide: 'M-96 30 C-60 -34 -27 -36 2 0 C29 34 61 34 95 -24 M-94 57 C-58 3 -27 2 0 29 C29 57 62 59 95 8',
  unfurl: 'M0 70 C-20 25 -75 20 -79 -35 C-42 -36 -13 -14 0 25 C13 -14 42 -36 79 -35 C75 20 20 25 0 70 M0 25 C-28 -4 -28 -55 0 -80 C28 -55 28 -4 0 25',
  spiral: 'M-90 30 C-84 -62 -7 -92 57 -50 C100 -20 81 44 31 43 C-8 42 -25 8 0 -15 M-75 61 C-45 89 2 94 43 75',
  orbit: 'M-94 0 C-94 -54 94 -54 94 0 C94 54 -94 54 -94 0 M-40 -85 C7 -102 83 63 40 85 C-7 102 -83 -63 -40 -85',
  brace: 'M-86 62 V-22 L-54 -56 L-20 -70 M86 62 V-22 L54 -56 L20 -70 M-86 62 L-56 78 H-24 M86 62 L56 78 H24 M-71 40 V-16 L-48 -40 M71 40 V-16 L48 -40',
  pulse: 'M-94 -45 Q-42 0 -94 45 M-70 -55 Q-6 0 -70 55 M94 -45 Q42 0 94 45 M70 -55 Q6 0 70 55 M-42 -76 Q0 -53 42 -76 M-42 76 Q0 53 42 76',
  relay: 'M-94 -42 H48 L76 -60 M-94 0 H75 M-94 42 H48 L76 60 M55 -15 L78 0 L55 15 M-72 -55 L-54 -42 L-72 -29 M-72 29 L-54 42 L-72 55',
  fracture: 'M0 -88 L-13 -50 L10 -27 L-18 0 L5 25 L-8 85 M-13 -50 L-65 -67 M10 -27 L75 -53 M-18 0 L-82 21 M5 25 L71 62 M-8 65 L-50 86',
};
export const radiantMotifMotions = {
  ember: 'sweep', tide: 'tide', sprout: 'unfurl', atmoso: 'spiral', aurora: 'orbit',
  bliss: 'unfurl', bruno: 'fracture', disciple: 'pulse', elise: 'spiral', razor: 'brace',
  rosetta: 'relay', thornia: 'brace', crinso: 'sweep', nerithe: 'tide', orvella: 'brace',
  vaelor: 'pulse', caldrex: 'brace', solenne: 'pulse', myrthen: 'unfurl',
  maerion: 'tide', caevren: 'brace', vespera: 'relay', ilyss: 'sweep',
  asteriel: 'orbit', serapha: 'unfurl', neralis: 'tide', varkhel: 'brace',
  seravelle: 'relay', velmira: 'sweep', ozriel: 'brace', ilvaris: 'pulse', kaelith: 'fracture',
} as const satisfies Record<RadiantBearerId, RadiantMotifMotion>;

export function radiantMotifPlacement(motion: RadiantMotifMotion, index: number, count: number,
  layer: number, radius: number, progress: number, charging: boolean): readonly [number, number, number] {
  const direction = layer % 2 ? -1 : 1;
  const travel = charging ? 1.12 - progress * .12 : .9 + progress * .22;
  let angle = index * Math.PI * 2 / count + direction * progress * .8;
  if (motion === 'spiral') angle += direction * progress * .7;
  let x = Math.cos(angle) * radius * travel;
  let y = Math.sin(angle) * radius * travel;
  let rotation = angle + Math.PI / 2;
  switch (motion) {
    case 'sweep':
      x *= 1.1; y *= .7; rotation += direction * progress * .3;
      break;
    case 'tide':
      x *= 1.05; y = y * .72 + Math.sin(progress * Math.PI * 2 + index) * radius * .12;
      break;
    case 'unfurl':
      x *= .8 + progress * .2; y = y * .85 - progress * radius * .16;
      break;
    case 'spiral':
      y *= .8;
      break;
    case 'orbit':
      y *= .7;
      break;
    case 'brace':
      x *= 1.05; y *= .7; rotation = 0;
      break;
    case 'pulse':
      x *= .9 + progress * .1; y *= .9 + progress * .1;
      break;
    case 'relay':
      x = x * 1.1 + Math.sin(progress * Math.PI) * radius * .12; y *= .68;
      break;
    case 'fracture':
      x *= 1.1; y *= .85; rotation = direction * progress * .25;
      break;
  }
  return [x, y, rotation];
}
