import { type BattleEvent, type Combatant } from '../game/battle';
import { isStarterId, type StarterId } from '../content/starters';
import { isCalamiticCharacter } from '../content/calamitic-characters';

type Motion = 'slash' | 'thrust' | 'bow' | 'cast' | 'hammer' | 'twin' | 'guard';
type Signature = 'cleave' | 'trident' | 'petal' | 'cyclone' | 'lens' | 'feather' | 'fault' | 'mind' | 'star' | 'eclipse' | 'rose' | 'thorn' | 'twin' | 'meridian' | 'citadel' | 'resonance' |
  'ferry' | 'counterweight' | 'beacon' | 'severance' | 'orbit' | 'interval' | 'repair' | 'accord' | 'reserve' | 'branch' | 'loadbearing' | 'corridor' |
  'pillar' | 'flare' | 'vortex' | 'hammer' | 'bloomwheel' | 'halo' | 'returning-current' |
  'suspended-chain' | 'ember-convoy' | 'unfastened-court';

export const characterChoreography = {
  ozriel: { signature: 'citadel', motion: 'guard', family: 'radiant' },
  ilvaris: { signature: 'resonance', motion: 'cast', family: 'force' },
  kaelith: { signature: 'fault', motion: 'slash', family: 'void' },
  ember: { signature: 'cleave', motion: 'slash', family: 'flame' },
  tide: { signature: 'trident', motion: 'thrust', family: 'tide' },
  sprout: { signature: 'petal', motion: 'bow', family: 'bloom' },
  atmoso: { signature: 'cyclone', motion: 'cast', family: 'force' },
  aurora: { signature: 'lens', motion: 'cast', family: 'radiant' },
  bliss: { signature: 'feather', motion: 'twin', family: 'radiant' },
  bruno: { signature: 'hammer', motion: 'hammer', family: 'bloom' },
  disciple: { signature: 'mind', motion: 'cast', family: 'void' },
  elise: { signature: 'star', motion: 'twin', family: 'force' },
  razor: { signature: 'eclipse', motion: 'guard', family: 'void' },
  rosetta: { signature: 'rose', motion: 'bow', family: 'radiant' },
  thornia: { signature: 'thorn', motion: 'guard', family: 'void' },
  crinso: { signature: 'twin', motion: 'twin', family: 'flame' },
  nerithe: { signature: 'meridian', motion: 'thrust', family: 'tide' },
  orvella: { signature: 'pillar', motion: 'hammer', family: 'bloom' },
  vaelor: { signature: 'vortex', motion: 'slash', family: 'force' },
  caldrex: { signature: 'flare', motion: 'guard', family: 'flame' },
  solenne: { signature: 'halo', motion: 'guard', family: 'radiant' },
  myrthen: { signature: 'bloomwheel', motion: 'twin', family: 'bloom' },
  maerion: { signature: 'ferry', motion: 'cast', family: 'tide' },
  caevren: { signature: 'counterweight', motion: 'hammer', family: 'force' },
  vespera: { signature: 'beacon', motion: 'cast', family: 'flame' },
  ilyss: { signature: 'severance', motion: 'twin', family: 'void' },
  asteriel: { signature: 'orbit', motion: 'cast', family: 'bloom' },
  serapha: { signature: 'interval', motion: 'guard', family: 'radiant' },
  rhaziel: { signature: 'repair', motion: 'cast', family: 'void' },
  oryn: { signature: 'accord', motion: 'thrust', family: 'void' },
  thessara: { signature: 'reserve', motion: 'cast', family: 'tide' },
  elaris: { signature: 'branch', motion: 'slash', family: 'bloom' },
  veyr: { signature: 'loadbearing', motion: 'hammer', family: 'flame' },
  aureth: { signature: 'corridor', motion: 'guard', family: 'flame' },
  neralis: { signature: 'returning-current', motion: 'thrust', family: 'tide' },
  varkhel: { signature: 'suspended-chain', motion: 'guard', family: 'flame' },
  seravelle: { signature: 'ember-convoy', motion: 'thrust', family: 'flame' },
  velmira: { signature: 'unfastened-court', motion: 'twin', family: 'void' },
} as const satisfies Record<StarterId, { signature: Signature; motion: Motion; family: AttackFlair['family'] }>;

const signaturePaths: Record<Signature, string> = {
  cleave: 'M18 82 Q18 18 82 18 L58 42 Q35 48 18 82 M35 70 L72 28',
  trident: 'M50 90 V15 M28 18 V38 Q50 58 72 38 V18 M20 25 L28 15 L36 25 M42 24 L50 12 L58 24 M64 25 L72 15 L80 25',
  petal: 'M50 50 Q12 6 50 12 Q88 6 50 50 Q94 28 88 64 Q76 94 50 50 Q62 98 30 86 Q4 62 50 50',
  cyclone: 'M15 72 Q95 88 80 30 Q60 2 26 28 Q8 58 56 64 Q83 49 55 34 M8 44 Q50 4 92 42 M12 78 Q55 100 88 68',
  lens: 'M10 50 Q50 8 90 50 Q50 92 10 50 M50 15 V85 M15 50 H85 M50 30 L70 50 L50 70 L30 50 Z',
  feather: 'M12 80 Q8 18 50 12 Q48 50 12 80 M88 80 Q92 18 50 12 Q52 50 88 80 M22 64 L44 28 M78 64 L56 28',
  fault: 'M12 78 L30 28 L47 45 L62 14 L88 78 Z M30 28 L36 78 M62 14 L56 48 L68 78 M8 88 H92',
  mind: 'M12 60 L22 24 L38 48 L50 10 L62 48 L78 24 L88 60 Z M22 75 Q50 95 78 75 M30 64 H70',
  star: 'M50 8 L61 39 L92 50 L61 61 L50 92 L39 61 L8 50 L39 39 Z M50 35 L65 50 L50 65 L35 50 Z',
  eclipse: 'M72 14 A40 40 0 1 0 72 86 A32 32 0 0 1 72 14 M50 20 V80 M38 40 H62',
  rose: 'M50 50 Q10 10 50 16 Q90 10 50 50 Q90 10 84 50 Q90 90 50 50 Q90 90 50 84 Q10 90 50 50 Q10 90 16 50 Q10 10 50 50 M35 50 L50 35 L65 50 L50 65 Z',
  thorn: 'M12 85 L35 28 L43 48 L50 10 L58 48 L65 28 L88 85 L50 70 Z M22 72 L50 44 L78 72',
  twin: 'M12 88 L38 48 L32 32 L48 38 L88 12 L62 52 L68 68 L52 62 Z M30 70 L70 30',
  meridian: 'M10 50 H90 M50 10 V90 M20 22 Q50 50 20 78 M80 22 Q50 50 80 78 M20 22 Q50 0 80 22 M20 78 Q50 100 80 78',
  citadel: 'M14 84 V38 H28 V22 H40 V38 H60 V22 H72 V38 H86 V84 Z M40 84 V60 L50 48 L60 60 V84 M8 92 H92',
  resonance: 'M8 50 H22 L32 20 L43 80 L55 8 L66 88 L78 36 L86 50 H94 M18 12 L82 88',
  ferry: 'M12 70 Q50 88 88 70 L80 82 H20 Z M22 64 V30 H78 V64 M35 30 V18 H65 V30 M50 18 V8 M32 48 H68',
  counterweight: 'M50 8 V70 M36 70 H64 L72 88 H28 Z M35 28 H65 M42 22 L50 14 L58 22',
  beacon: 'M50 10 V88 M35 30 L50 16 L65 30 M26 42 Q50 22 74 42 M18 56 Q50 34 82 56 M50 62 L42 78 H58 Z',
  severance: 'M18 18 Q52 38 82 82 M82 18 Q48 38 18 82 M32 35 L68 65 M68 35 L32 65 M44 50 H56',
  orbit: 'M50 50 C12 20 20 82 50 50 C80 18 88 80 50 50 M50 8 V18 M50 82 V92 M8 50 H18 M82 50 H92 M50 50 L66 34',
  interval: 'M12 50 H38 M62 50 H88 M38 24 V76 M62 24 V76 M44 34 H56 M44 66 H56',
  repair: 'M50 12 L58 34 L82 28 L66 48 L84 66 L60 62 L50 88 L40 62 L16 66 L34 48 L18 28 L42 34 Z M42 50 H58 M50 42 V58',
  accord: 'M14 30 H42 Q50 30 50 42 V58 Q50 70 58 70 H86 M14 70 H42 Q50 70 50 58 V42 Q50 30 58 30 H86 M25 22 L14 30 L25 38 M75 62 L86 70 L75 78',
  reserve: 'M50 12 C30 28 30 68 50 88 C70 68 70 28 50 12 Z M32 50 H68 M38 38 L50 28 L62 38 M38 62 L50 72 L62 62',
  branch: 'M50 90 V22 M50 48 L28 28 M50 62 L75 38 M28 28 L24 14 M28 28 L12 30 M75 38 L86 20 M75 38 L90 44 M50 22 L42 10 M50 22 L60 10',
  loadbearing: 'M16 82 L30 32 L50 58 L70 18 L86 82 Z M30 32 L42 82 M70 18 L58 52 L66 82 M22 70 H78',
  corridor: 'M14 86 V14 H30 V70 H70 V14 H86 V86 Z M38 58 L50 42 L62 58 M38 34 L50 18 L62 34',
  pillar: 'M28 88 V18 H72 V88 Z M20 18 H80 M36 32 H64 M36 48 H64 M36 64 H64 M20 88 H80',
  flare: 'M50 10 L58 42 L88 24 L68 52 L92 72 L60 64 L50 92 L40 64 L8 72 L32 52 L12 24 L42 42 Z',
  vortex: 'M50 12 C24 12 16 42 38 50 C52 55 64 42 56 34 C50 28 42 34 46 40 M50 88 C76 88 84 58 62 50 C48 45 36 58 44 66 C50 72 58 66 54 60 M20 24 L30 34 M80 76 L70 66',
  hammer: 'M24 18 H76 V34 H24 Z M42 34 H58 V78 H42 Z M30 78 H70 V90 H30 Z',
  bloomwheel: 'M50 50 C30 36 34 18 50 14 C66 18 70 36 50 50 C64 30 82 32 88 46 C84 62 68 66 50 50 C72 56 74 76 60 86 C44 84 40 68 50 50 C36 72 18 70 12 56 C16 40 32 36 50 50 C28 44 26 24 40 14',
  halo: 'M50 12 A38 38 0 1 1 49.9 12 M50 24 A26 26 0 1 0 50.1 24 M50 4 V18 M50 82 V96 M4 50 H18 M82 50 H96',
  'returning-current': 'M12 62 C28 22 70 22 86 62 M18 62 C30 42 46 42 58 62 C68 78 82 78 90 60 M18 76 H82 M50 18 V42 M40 32 L50 42 L60 32',
  'suspended-chain': 'M50 10 L62 22 L50 34 L38 22 Z M50 34 V58 M50 58 C26 58 24 78 50 88 C76 78 74 58 50 58 Z M50 66 L59 75 L50 84 L41 75 Z M28 42 H72',
  'ember-convoy': 'M18 78 L50 18 L82 78 M30 58 H70 M38 72 H62 M50 26 V56 M10 88 H90 M50 8 L58 20 H42 Z',
  'unfastened-court': 'M18 18 C54 24 76 40 82 82 M82 18 C46 24 24 40 18 82 M28 30 L72 70 M72 30 L28 70 M50 8 V28 M50 72 V92 M8 50 H28 M72 50 H92',
};

export function characterSignaturePath(id: StarterId): string {
  return signaturePaths[characterChoreography[id].signature];
}

export interface AttackFlair {
  power: number;
  rings: number;
  rays: number;
  sparks: number;
  size: number;
  duration: number;
  family: 'flame' | 'tide' | 'bloom' | 'radiant' | 'void' | 'force';
  signature: Signature;
  motion: Motion;
  crowns: number;
  arcs: number;
  windup: number;
}

export function attackFlair(unit: Combatant, action: string | undefined, enhancedAttack = false): AttackFlair {
  const level = unit.level ?? 0;
  const evolution = unit.evolution ?? 1;
  const calamitic = !unit.captured && isCalamiticCharacter(unit.definitionId);
  if (!Number.isInteger(level) || level < 0 || !Number.isInteger(evolution) || evolution < 1 || evolution > 6) {
    throw new Error('Attack flair requires valid combatant progression.');
  }
  const growth = unit.side === 'ally' ? Math.min(1, level / (calamitic ? 110 : 105)) * .65 + (evolution - 1) / 5 * .35
    : Math.min(1, level / 120);
  const skill = enhancedAttack || action !== 'light' && action !== undefined;
  const ultimate = action === 'ultimate';
  const power = growth ** 1.5;
  const profile = !unit.captured && isStarterId(unit.definitionId) ? characterChoreography[unit.definitionId] : null;
  const family = profile?.family ?? (unit.creatureId?.startsWith('infusion:heavens:') || unit.creatureId?.startsWith('infusion:treasury:') || unit.creatureId?.startsWith('infusion:sanctuary:') ? 'radiant'
    : unit.creatureId?.startsWith('infusion:abyss:') ? 'void'
    : unit.definitionId === 'ember' || unit.creatureId?.startsWith('dungeon:infernic:') ? 'flame'
    : unit.definitionId === 'tide' || unit.creatureId?.startsWith('dungeon:aquatic:') ? 'tide'
    : unit.definitionId === 'sprout' || unit.creatureId?.startsWith('dungeon:efflorescent:') ? 'bloom'
    : unit.element === 'oceanic' ? 'tide' : unit.element === 'infernic' ? 'flame'
    : unit.element === 'botanic' ? 'bloom' : unit.element === 'chaotic' ? 'void'
    : unit.element === 'tranquilitic' ? 'radiant' : 'force');
  return { power, family, rings: 1 + Math.floor(power * 3) + Number(ultimate),
    rays: Math.floor(power * (ultimate ? 12 : skill ? 9 : 6)),
    sparks: 4 + Math.floor(power * (ultimate ? 28 : skill ? 22 : 16)),
    size: 1 + power * .8 + (ultimate ? .45 : skill ? .2 : 0),
    signature: profile?.signature ?? (family === 'radiant' ? 'lens' : family === 'void' ? 'eclipse' : family === 'tide' ? 'meridian' : family === 'bloom' ? 'petal' : family === 'flame' ? 'cleave' : 'star'),
    motion: profile?.motion ?? 'slash',
    crowns: 1 + Math.floor(power * (ultimate ? 5 : skill ? 3 : 2)),
    arcs: 1 + Math.floor(power * (ultimate ? 7 : skill ? 5 : 3)),
    windup: (ultimate ? 360 : skill ? 250 : 180) + Math.round(power * 120),
    duration: (ultimate ? 650 : skill ? 430 : 310) + Math.round(power * 160) };
}

export function signatureMarkup(flair: AttackFlair): string {
  return Array.from({ length: flair.crowns }, (_, index) =>
    `<svg class="flair-signature" viewBox="0 0 100 100" aria-hidden="true" style="--crown:${index};--rotation:${index * 360 / flair.crowns}deg"><path d="${signaturePaths[flair.signature]}" /></svg>`).join('');
}

export function attackPose(flair: AttackFlair, distance: number, vertical: number, support: boolean): string {
  if (support || flair.motion === 'cast') return `translateY(${-8 - flair.power * 14}px) scale(${1.04 + flair.power * .1})`;
  const direction = distance >= 0 ? 1 : -1;
  const tilt = { slash: 9, thrust: 0, bow: -7, cast: 0, hammer: -14, twin: 12, guard: 5 }[flair.motion] * direction;
  const reach = flair.motion === 'bow' ? -.18 : flair.motion === 'thrust' ? 1 : .65;
  return `translate(${distance * reach}px,${vertical}px) rotate(${tilt}deg) scale(${1.04 + flair.power * .1})`;
}

export function attackEffectMarkup(flair: AttackFlair): string {
  return `<span class="flair-core"></span>
    <span class="flair-optical-bloom" aria-hidden="true"></span>
    <span class="flair-anamorphic-streak" aria-hidden="true"></span>
    <span class="flair-glare-burst" aria-hidden="true"></span>
    <span class="flair-distortion-ring" aria-hidden="true"></span>
    ${signatureMarkup(flair)}
    ${Array.from({ length: flair.arcs }, (_, index) =>
    `<span class="flair-arc" style="--rotation:${index * 360 / flair.arcs}deg;--arc:${index}"></span>`).join('')}
    ${Array.from({ length: flair.rings }, (_, index) =>
    `<span class="flair-ring" style="--ring:${index};--rotation:${index * 37}deg"></span>`).join('')}
    ${Array.from({ length: flair.rays }, (_, index) =>
    `<span class="flair-ray" style="--rotation:${index * 360 / flair.rays}deg"></span>`).join('')}
    ${Array.from({ length: flair.sparks }, (_, index) => {
      const angle = index * 2.399963;
      const radius = 45 + index % 4 * 16;
      return `<span class="flair-spark" style="--spark-x:${Math.cos(angle) * radius}%;--spark-y:${Math.sin(angle) * radius}%;--flight-x:${Math.cos(angle) * radius}px;--flight-y:${Math.sin(angle) * radius}px;--rotation:${index * 137.5}deg;--spark-delay:${index % 5 * 18}ms"></span>`;
    }).join('')}`;
}
