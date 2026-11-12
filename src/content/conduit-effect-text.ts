import { radiantConduitPrimitives, type RadiantConduitEffect, type RadiantConduitPrimitive } from './conduit-effects';
import type { ConduitId } from './conduits';

const percent = (value: number): string => `${Number((value * 100).toPrecision(12))}%`;
const number = (value: number): string => String(Number(value.toPrecision(12)));

const conduitDescriptions: Record<RadiantConduitEffect, (amount: number) => string> = {
  hp: a => `Maximum Health +${percent(a)}.`,
  attack: a => `Attack +${percent(a)}.`,
  defense: a => `Defense +${percent(a)}.`,
  recovery: a => `Recovery +${percent(a)}.`,
  normal: a => `Normal direct damage multiplier +${percent(a)}.`,
  flare: a => `Flare direct damage multiplier +${percent(a)}.`,
  pierce: a => `Normal/Flare ignore ${percent(a)} enemy Defense; combined pierce capped at 80%.`,
  healing: a => `Native/Flare/Master healing +${percent(a)}; does not amplify generated gear healing.`,
  shielding: a => `Native/Flare/Master Shield creation +${percent(a)}; does not amplify generated gear Shields.`,
  resilience: a => `Reduce the strongest incoming Weaken magnitude by ${percent(a)}; combined resistance capped at 80%.`,
  guard: a => `Defense's 50% damage multiplier is further reduced by ${percent(a)}; combined enhancement capped at60%, final damage multiplier floor 20%.`,
  leader: a => `First living bearer only: leader stat bonus +${percent(a)} (percentage points). No promotion after leader defeat.`,
  'normal-charge': a => `A Normal direct hit (Health or Shield) grants ${number(a)} additional personal charge, rounded once.`,
  'guard-charge': a => `Defense grants ${number(a)} additional personal charge, rounded once.`,
  'shared-normal': a => `A Normal direct hit adds ${number(a / 60)} shared charge (${number(a)} internal units, rounded once); requires a final-form squad member.`,
  'team-charge': a => `A Normal direct hit grants each other living ally ${number(a)} personal charge, rounded once.`,
  'guard-shield': a => `Defense creates a Shield on this bearer at ${percent(a)} effective Defense.`,
  'normal-heal': a => `Normal Health damage heals the most wounded living ally at ${percent(a)} effective Recovery.`,
  leech: a => `Native Normal/Flare direct Health damage heals the bearer at ${percent(a)} total Health damage dealt.`,
  'heal-charge': a => `Actual native healing grants ${number(a)} personal charge once per resolved action, rounded once; Shattering Light cannot refill itself.`,
  'heal-buff': a => `Each living ally actually healed by native output gains ${percent(Math.min(.8, a))} Attack for one round (cap 80%).`,
  'absorbed-charge': a => `Direct enemy absorption of this bearer's native/Master Shields grants ${number(a)} personal charge, rounded once; once per Conduit per round.`,
  reflect: a => `After direct enemy absorption of this bearer's native/Master Shields, reflect ${percent(a)} absorbed damage (cap effective Attack) to the first attacker; once per Conduit per round.`,
  'hurt-shield': a => `Direct enemy Health loss on this bearer creates a Shield on this bearer at ${percent(a)} maximum Health; once per Conduit per round.`,
  'flare-shield': a => `Casting any Flare creates Shields on living allies at ${percent(a)} each recipient's maximum Health.`,
  'round-heal': a => `New round: heal the most wounded living ally at ${percent(a)} effective Recovery.`,
  'round-shield': a => `New round: Shield the most wounded living ally at ${percent(a)} effective Defense.`,
  'normal-burn': a => `Normal Health damage applies Burn to the surviving target at ${percent(a)} effective Attack for one enemy phase.`,
  'normal-expose': a => `Normal Health damage applies ${percent(Math.min(.8, a))} Exposure to the surviving target for one enemy phase (cap 80%).`,
  'normal-weaken': a => `Normal Health damage applies ${percent(Math.min(.8, a))} Weaken to the surviving target for one enemy phase (cap 80%).`,
  cooperation: a => `Normal/Flare direct damage multiplier +${percent(a)} after another squad member has acted this round.`,
  'next-buff': a => `Normal Health damage grants the next living unacted ally ${percent(Math.min(.8, a))} Attack for the rest of this round (cap 80%).`,
  'status-shield': a => `Native Burn/Weaken/Exposure application Shields the most wounded living ally at ${percent(a)} effective Defense, once per resolved action.`,
};

/** Radiant effects that combat sums across every equipped Conduit before applying them once. */
export const radiantSummedConduitEffects = [
  'hp', 'attack', 'defense', 'recovery', 'normal', 'flare', 'pierce', 'healing', 'shielding',
  'resilience', 'guard', 'leader', 'cooperation',
] as const satisfies readonly RadiantConduitEffect[];

/** Exact player-facing text for one Radiant primitive, shared by menus and the battle reference. */
export function radiantConduitDescription(primitive: RadiantConduitPrimitive): string {
  return conduitDescriptions[primitive.kind](primitive.amount);
}
/** Each Radiant effect line a Conduit applies at an upgrade rank (magnitudes ×(1 + 0.1×rank)). */
export function radiantConduitEffectLines(id: ConduitId, rank = 0): string[] {
  return radiantConduitPrimitives({ id, rank }).map(radiantConduitDescription);
}
/** The complete Radiant combat effect of a Conduit at an upgrade rank, as one tooltip sentence group. */
export function radiantConduitEffectText(id: ConduitId, rank = 0): string {
  return radiantConduitEffectLines(id, rank).join(' ');
}
