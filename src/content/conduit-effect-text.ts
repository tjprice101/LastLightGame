import { radiantConduitPrimitives, type RadiantConduitEffect, type RadiantConduitPrimitive } from './conduit-effects';
import type { ConduitId } from './conduits';

const percent = (value: number): string => `${Number((value * 100).toPrecision(12))}%`;
const number = (value: number): string => String(Number(value.toPrecision(12)));

const conduitDescriptions: Record<RadiantConduitEffect, (amount: number) => string> = {
  hp: a => `Maximum Health increases by ${percent(a)}.`,
  attack: a => `Attack increases by ${percent(a)}.`,
  defense: a => `Defense increases by ${percent(a)}.`,
  recovery: a => `Recovery increases by ${percent(a)}.`,
  normal: a => `Normal Attacks deal ${percent(a)} more damage.`,
  flare: a => `Convergent Light deals ${percent(a)} more damage.`,
  pierce: a => `Normal Attacks and Convergent Light ignore ${percent(a)} of enemy Defense, up to 80% total.`,
  healing: a => `Healing from this bearer's abilities, Convergent Light and Master effects is ${percent(a)} stronger. This does not boost healing from other Conduits.`,
  shielding: a => `Shields from this bearer's abilities, Convergent Light and Master effects are ${percent(a)} stronger. This does not boost Shields from other Conduits.`,
  resilience: a => `Reduces the strength of the strongest Weaken on this bearer by ${percent(a)}, up to 80% total.`,
  guard: a => `While defending, this bearer takes 50% less direct damage. This Conduit further reduces the damage left by ${percent(a)}, up to a 60% combined bonus; damage taken cannot fall below 20%.`,
  leader: a => `While this bearer is alive and leads the squad, their Leader Skill bonus increases by ${percent(a)} percentage points.`,
  'normal-charge': a => `A Normal Attack that hits Health or a Shield grants the attacker ${number(a)} extra Luminosity. Any fraction is rounded once.`,
  'guard-charge': a => `Defending grants this bearer ${number(a)} extra Luminosity. Any fraction is rounded once.`,
  'team-charge': a => `When a Normal Attack hits Health or a Shield, each other living ally gains ${number(a)} Luminosity. Any fraction is rounded once.`,
  'guard-shield': a => `When this bearer Defends, they gain a Shield equal to ${percent(a)} of their current Defense.`,
  'normal-heal': a => `When this bearer's Normal Attack damages Health, it heals the most-wounded living ally for ${percent(a)} of this bearer's current Recovery.`,
  leech: a => `This bearer's Normal Attacks and Convergent Light restore their Health by ${percent(a)} of the direct Health damage they deal.`,
  'heal-charge': a => `Once per action, actual healing from this bearer's abilities grants them ${number(a)} Luminosity. Any fraction is rounded once.`,
  'heal-buff': a => `Each living ally actually healed by this bearer's abilities gains ${percent(Math.min(.8, a))} Attack for the rest of the round, up to 80%.`,
  'absorbed-charge': a => `Each equipped copy can trigger once per round: when an enemy's direct attack absorbs a Shield from this bearer's ability or Master, the bearer gains ${number(a)} Luminosity. Any fraction is rounded once.`,
  reflect: a => `Each equipped copy can trigger once per round: when an enemy's direct attack absorbs a Shield from this bearer's ability or Master, the first attacker takes damage equal to ${percent(a)} of the amount absorbed, up to this bearer's current Attack.`,
  'hurt-shield': a => `Each equipped copy can trigger once per round: when an enemy's direct attack damages this bearer's Health, they gain a Shield equal to ${percent(a)} of their maximum Health.`,
  'flare-shield': a => `When this bearer uses Convergent Light, each living ally, including the bearer, gains a Shield equal to ${percent(a)} of their own maximum Health.`,
  'round-heal': a => `At the start of each new round, heal the most-wounded living ally for ${percent(a)} of this bearer's current Recovery.`,
  'round-shield': a => `At the start of each new round, the most-wounded living ally gains a Shield equal to ${percent(a)} of this bearer's current Defense.`,
  'normal-burn': a => `When a Normal Attack damages Health, the surviving target burns through the next enemy phase, taking damage equal to ${percent(a)} of this bearer's current Attack.`,
  'normal-expose': a => `When a Normal Attack damages Health, the surviving target takes ${percent(Math.min(.8, a))} more direct damage for the rest of the round, up to 80%.`,
  'normal-weaken': a => `When a Normal Attack damages Health, the surviving target deals ${percent(Math.min(.8, a))} less damage during the next enemy phase, up to 80%.`,
  cooperation: a => `After another squad member acts this round, this bearer's Normal Attacks and Convergent Light deal ${percent(a)} more damage.`,
  'next-buff': a => `When a Normal Attack damages Health, the next living ally who has not acted gains ${percent(Math.min(.8, a))} Attack for the rest of the round, up to 80%.`,
  'status-shield': a => `When one of this bearer's abilities applies Burn, Weaken or Exposure, the most-wounded living ally gains a Shield equal to ${percent(a)} of this bearer's current Defense, once per action.`,
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
