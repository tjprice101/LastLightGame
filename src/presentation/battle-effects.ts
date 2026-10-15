import { type BattleEvent, type Combatant } from '../game/battle';
import { isStarterId, type StarterId } from '../content/starters';

type Motion = 'slash' | 'thrust' | 'bow' | 'cast' | 'hammer' | 'twin' | 'guard';
type Signature = 'cleave' | 'trident' | 'petal' | 'cyclone' | 'lens' | 'feather' | 'fault' | 'mind' | 'star' | 'eclipse' | 'rose' | 'thorn' | 'twin' | 'meridian' | 'citadel' | 'resonance';

export const characterChoreography = {
  ember: { signature: 'cleave', motion: 'slash', family: 'flame' },
  tide: { signature: 'trident', motion: 'thrust', family: 'tide' },
  sprout: { signature: 'petal', motion: 'bow', family: 'bloom' },
  atmoso: { signature: 'cyclone', motion: 'cast', family: 'force' },
  aurora: { signature: 'lens', motion: 'cast', family: 'radiant' },
  bliss: { signature: 'feather', motion: 'twin', family: 'radiant' },
  bruno: { signature: 'fault', motion: 'hammer', family: 'bloom' },
  disciple: { signature: 'mind', motion: 'cast', family: 'void' },
  elise: { signature: 'star', motion: 'twin', family: 'force' },
  razor: { signature: 'eclipse', motion: 'guard', family: 'void' },
  rosetta: { signature: 'rose', motion: 'bow', family: 'radiant' },
  thornia: { signature: 'thorn', motion: 'guard', family: 'void' },
  crinso: { signature: 'twin', motion: 'twin', family: 'flame' },
  nerithe: { signature: 'meridian', motion: 'thrust', family: 'tide' },
  orvella: { signature: 'citadel', motion: 'hammer', family: 'bloom' },
  vaelor: { signature: 'resonance', motion: 'slash', family: 'force' },
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
};

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
  if (!Number.isInteger(level) || level < 0 || !Number.isInteger(evolution) || evolution < 1 || evolution > 6) {
    throw new Error('Attack flair requires valid combatant progression.');
  }
  const growth = unit.side === 'ally' ? Math.min(1, level / 105) * .65 + (evolution - 1) / 5 * .35
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

export interface NativeMechanicCue {
  label: string;
  path: string;
  motion: 'recall' | 'grow' | 'break' | 'guard' | 'slash';
}

export function nativeMechanicCue(unit: Combatant | undefined, event: BattleEvent): NativeMechanicCue | null {
  if (event.origin === 'conduit') return null;
  const cues: Record<string, NativeMechanicCue> = {
    burn: { label: 'Banked fire', path: 'M50 90Q10 65 40 25L48 50 65 10Q100 65 50 90Z', motion: 'grow' },
    detonation: { label: 'Burn detonation', path: 'M50 5 60 35 90 15 70 45 95 60 65 65 55 95 40 70 10 80 30 50 5 30 40 35Z', motion: 'break' },
    cyclone: { label: 'Cyclone release', path: 'M15 72Q95 88 80 30Q60 2 26 28Q8 58 56 64Q83 49 55 34M8 44Q50 4 92 42', motion: 'grow' },
    recall: { label: 'Shuriken recall', path: 'M50 20 58 42 80 50 58 58 50 80 42 58 20 50 42 42ZM25 15Q90 5 90 65M90 65 78 52M90 65 97 48', motion: 'recall' },
    revenge: { label: 'Wounds spent', path: 'M80 10 20 90M65 15A35 35 0 1 0 65 85M25 55 45 75', motion: 'slash' },
    trap: { label: 'Thorn trap', path: 'M10 85 35 25 45 50 50 10 60 50 70 25 90 85 50 65ZM20 80 50 40 80 80', motion: 'grow' },
    demolition: { label: 'Foundation demolition', path: 'M10 80V30H30V15H40V35H60V15H70V30H90V80M50 25 40 50 60 65 45 90', motion: 'break' },
    redirect: { label: 'Cover interception', path: 'M50 10 85 25V50Q85 75 50 90Q15 75 15 50V25ZM5 50H65M50 35 65 50 50 65', motion: 'guard' },
  };
  if (event.nativeKind && event.origin === 'native') return cues[event.nativeKind] ?? null;
  if (!unit?.kit?.nativeIdentity || unit.captured) return null;
  if (event.kind === 'heal' && unit.definitionId === 'sprout' && event.origin === 'native') {
    return { label: 'Garden recovery', path: 'M50 85V45M50 60Q10 60 20 20Q55 20 50 60M50 45Q90 45 80 10Q45 10 50 45', motion: 'grow' };
  }
  if (event.kind !== 'attack' || event.action === 'light' || event.action === 'defend') return null;
  if (unit.definitionId === 'crinso') return {
    label: event.action === 'skill1' ? 'Gold edge' : event.action === 'skill2' ? 'Crimson edge' : 'Combo finisher',
    path: event.action === 'skill1' ? 'M15 85 85 15M10 65 35 90M60 10 90 40' : 'M15 15 85 85M10 35 35 10M65 90 90 65',
    motion: 'slash',
  };
  if (unit.definitionId === 'atmoso' && event.action === 'skill2') return { ...cues.cyclone, label: 'Cyclone field' };
  if (unit.definitionId === 'elise' && event.action === 'skill1') return { ...cues.recall, label: 'Voltstar Cut', motion: 'slash' };
  if (unit.definitionId === 'orvella' && event.action === 'skill2') return { ...cues.demolition, label: 'Foundation raised', motion: 'grow' };
  if (unit.definitionId === 'tide' && event.action === 'skill2') return { ...cues.redirect, label: 'Tidal Shelter' };
  if (unit.definitionId === 'bruno' && event.action === 'skill2') return { ...cues.redirect, label: 'Cover chosen ally' };
  return null;
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
