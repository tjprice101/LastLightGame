/**
 * Battle Spectacle timing (D-483 R2/R6, D-484). Pure data: no DOM, no Phaser.
 * Every value is in milliseconds at battle speed 1; callers divide by the
 * battle speed (WAAPI playbackRate, GPU time scale). Presentation only: never
 * read by combat resolution or RNG.
 */
import type { FlareTier } from '../game/combat-gauge';

export type SpectacleTier = 'normal' | 'skill1' | 'skill2' | 'flare';
export interface SpectacleBeats {
  tier: SpectacleTier;
  flare: FlareTier | null;
  windup: number;
  travel: number;
  /** The whole impact beat; multi-hit actions split it across their hits. */
  impact: number;
  aftermath: number;
  hits: number;
  /** Average slot per hit (impact / hits). */
  hitInterval: number;
  /** D-490: the wait after each hit; with `gather` they sum exactly to `impact`. */
  slots: number[];
  /** Index (in `slots`) of the finisher hit; Convergent Light only, otherwise the last hit. */
  finisherAt: number;
  /** D-490: light gathers onto the targets for this long just before the finisher hit (0 = none). */
  gather: number;
  total: number;
}
type Beat = readonly [windup: number, travel: number, impact: number, aftermath: number];
/** R2: Normal Attack ~0.45 s < Skill 1 ~0.85 s < Skill 2 ~1.2 s < Convergent Light 1.5 / 1.9 / 3.0 s
 * (D-490: the Ultimate full-screen cut-in stretches Ultimate from 2.4 s to 3.0 s). */
export const spectacleBeatTable: Record<Exclude<SpectacleTier, 'flare'>, Beat> & { flare: Record<FlareTier, Beat> } = {
  normal: [100, 100, 150, 100],
  skill1: [200, 150, 300, 200],
  skill2: [300, 200, 450, 250],
  // Wind-up holds the cut-in and the dim; the impact beat carries every hit and the finisher.
  flare: { sparkling: [450, 150, 600, 300], glimmering: [550, 200, 850, 300], ultimate: [1000, 300, 1400, 300] },
};
/** D-490: the gather before a Convergent Light finisher, by tier. */
export const flareGatherMs: Record<FlareTier, number> = { sparkling: 80, glimmering: 110, ultimate: 180 };
/** D-490 cadence weights: the run accelerates from the first gap to the last; the finisher holds longest;
 * frames after the finisher (buffs, statuses) pass quickly. */
const cadence = { lead: 1.6, tail: 1, finisher: 2, after: .6 } as const;

/** `finisherAt` is the finisher's index among the hits (default the last). */
export function beatPlan(tier: SpectacleTier, flare: FlareTier | null, hits: number, finisherAt?: number): SpectacleBeats {
  if (tier === 'flare' && !flare) throw new Error('A Convergent Light presentation needs its tier.');
  const [windup, travel, impact, aftermath] = tier === 'flare' ? spectacleBeatTable.flare[flare!] : spectacleBeatTable[tier];
  const count = Math.max(1, Math.floor(Number.isFinite(hits) ? hits : 1));
  const requested = finisherAt !== undefined && Number.isFinite(finisherAt) ? Math.floor(finisherAt) : count - 1;
  const finisher = Math.min(count - 1, Math.max(0, requested));
  const cinematic = tier === 'flare' && count >= 2;
  const gather = cinematic && finisher > 0 ? flareGatherMs[flare!] : 0;
  const weights = Array.from({ length: count }, (_, index) => !cinematic ? 1
    : index === finisher ? cadence.finisher : index > finisher ? cadence.after
      : finisher <= 1 ? cadence.tail : cadence.lead - (cadence.lead - cadence.tail) * index / (finisher - 1));
  const unit = (impact - gather) / weights.reduce((sum, weight) => sum + weight, 0);
  return { tier, flare: tier === 'flare' ? flare : null, windup, travel, impact, aftermath, hits: count,
    hitInterval: impact / count, slots: weights.map(weight => weight * unit), finisherAt: finisher, gather,
    total: windup + travel + impact + aftermath };
}
/** D-490: escalation of one hit from 0 (first) to 1 (the finisher and after). */
export function hitProgress(beats: SpectacleBeats, index: number): number {
  return beats.finisherAt > 0 ? Math.min(1, Math.max(0, index / beats.finisherAt)) : 1;
}

export type FlashKind = 'none' | 'soft' | 'full';
export interface ScreenTools {
  /** Field shake amplitude in CSS px. */
  shake: number;
  hitStop: number;
  /** Flash on the first hit (Skill 2) or on the finisher (Convergent Light). */
  flash: FlashKind;
  /** Field dim opacity during a Convergent Light; 0 for other tiers. */
  dim: number;
  zoom: number;
}
const flareDim: Record<FlareTier, number> = { sparkling: .3, glimmering: .42, ultimate: .55 };
/** D-490: the finisher's shake and hit-stop escalate by tier (R2 had one 8 px / 90 ms row). */
const flareFinisher: Record<FlareTier, { shake: number; hitStop: number }> = {
  sparkling: { shake: 6, hitStop: 70 }, glimmering: { shake: 8, hitStop: 90 }, ultimate: { shake: 10, hitStop: 120 },
};
export function screenTools(tier: SpectacleTier, flare: FlareTier | null): ScreenTools {
  if (tier === 'normal') return { shake: 2, hitStop: 0, flash: 'none', dim: 0, zoom: 1 };
  if (tier === 'skill1') return { shake: 3, hitStop: 40, flash: 'none', dim: 0, zoom: 1 };
  if (tier === 'skill2') return { shake: 5, hitStop: 60, flash: 'soft', dim: 0, zoom: 1 };
  if (!flare) throw new Error('A Convergent Light presentation needs its tier.');
  return { ...flareFinisher[flare], flash: 'full', dim: flareDim[flare], zoom: 1.06 };
}
/** Enemy hits keep their Phase 2 weight until Step 6 adds telegraphs. */
export const enemyScreenTools: ScreenTools = { shake: 4, hitStop: 0, flash: 'none', dim: 0, zoom: 1 };
/** Enemy-phase impact pacing (ms at speed 1); the view adds the wind-up and recovery. */
export const enemyImpactMs = 300;
/** R6: Reduce motion shows one static ring and the number per impact, for at most this long. */
export const staticImpactMs = 200;

export function spectacleTier(action: { type: string; slot?: number }): SpectacleTier {
  if (action.type === 'flare') return 'flare';
  if (action.type === 'skill') return action.slot === 2 ? 'skill2' : 'skill1';
  return 'normal';
}

/**
 * WCAG 2.3.1: never more than three full flashes in any one second. A full
 * flash over the limit is softened, never dropped silently.
 */
export class FlashGovernor {
  private recent: number[] = [];
  constructor(private readonly limit = 3, private readonly windowMs = 1000) {}
  request(kind: FlashKind, now: number): FlashKind {
    if (kind !== 'full') return kind;
    this.recent = this.recent.filter(time => now - time < this.windowMs);
    if (this.recent.length >= this.limit) return 'soft';
    this.recent.push(now);
    return 'full';
  }
  reset(): void { this.recent = []; }
}

/** One tint per element, matching the HUD accents in battle-screen.css (`.radiant-member[data-element]`). */
export const elementTints: Readonly<Record<string, number>> = {
  infernic: 0xff8a5c,
  oceanic: 0x6cc4ff,
  botanic: 0x8fdc7a,
  atmospheric: 0xb9e6f2,
  tranquilitic: 0xf2a9c4,
  chaotic: 0xd48cff,
};
export const neutralTint = 0xd6d9e2;
export function elementTint(elementId: string | null | undefined): number {
  return elementId ? elementTints[elementId] ?? neutralTint : neutralTint;
}
export function tintCss(tint: number): string {
  return `#${tint.toString(16).padStart(6, '0')}`;
}
