import { radiantConduitPrimitives, type RadiantConduitEffect, type RadiantConduitPrimitive } from './conduit-effects';
import type { ConduitId } from './conduits';

const percent = (value: number): string => `${Number((value * 100).toPrecision(12))}%`;
const number = (value: number): string => String(Number(value.toPrecision(12)));
const conditionalDamage = (amount: number, condition: string): string =>
  `Normal Attacks, skills and Convergent Light deal ${percent(amount)} more direct damage ${condition}.`;

const conduitDescriptions: Record<RadiantConduitEffect, (amount: number) => string> = {
  hp: a => `Maximum Health increases by ${percent(a)}.`,
  attack: a => `Attack increases by ${percent(a)}.`,
  defense: a => `Defense increases by ${percent(a)}.`,
  recovery: a => `Recovery increases by ${percent(a)}.`,
  normal: a => `Normal Attacks deal ${percent(a)} more damage.`,
  flare: a => `Convergent Light deals ${percent(a)} more damage.`,
  pierce: a => `Normal Attacks, skills and Convergent Light ignore ${percent(a)} of enemy Defense, up to 80% total.`,
  healing: a => `Healing from this bearer's abilities is ${percent(a)} stronger. Conduit-generated healing is unchanged.`,
  shielding: a => `Shields from this bearer's abilities are ${percent(a)} stronger. Conduit-generated Shields are unchanged.`,
  resilience: a => `Reduces the strength of the strongest Weaken on this bearer by ${percent(a)}, up to 80% total.`,
  guard: a => `After this bearer uses Skill 1 or Skill 2, they take ${percent(Math.min(.6, a))} less direct damage for the rest of the round, up to 60%; damage taken cannot fall below 20%.`,
  leader: a => `This bearer's Leader Skill effects are ${percent(a)} stronger while they are the living leader.`,
  'normal-charge': a => `A Normal Attack that hits Health or a Shield grants the attacker ${number(a)} extra Luminosity. Any fraction is rounded once.`,
  'guard-charge': a => `Using Skill 1 or Skill 2 grants this bearer ${number(a)} extra Luminosity. Any fraction is rounded once.`,
  'team-charge': a => `When a Normal Attack hits Health or a Shield, each other living ally gains ${number(a)} Luminosity. Any fraction is rounded once.`,
  'guard-shield': a => `When this bearer uses Skill 1 or Skill 2, they gain a Shield equal to ${percent(a)} of their current Defense.`,
  'normal-heal': a => `When this bearer's Normal Attack damages Health, it heals the most-wounded living ally for ${percent(a)} of this bearer's current Recovery.`,
  leech: a => `This bearer's Normal Attacks, skills and Convergent Light restore their Health by ${percent(a)} of the direct Health damage they deal.`,
  'heal-charge': a => `Once per action, actual healing from this bearer's abilities grants them ${number(a)} Luminosity. Any fraction is rounded once.`,
  'heal-buff': a => `Each living ally actually healed by this bearer's abilities gains ${percent(Math.min(.8, a))} Attack for the rest of the round, up to 80%.`,
  'absorbed-charge': a => `Once per round, when an enemy's direct attack damages a Shield from this bearer's abilities, gain ${number(a)} Luminosity, rounded once.`,
  reflect: a => `Once per round, reflect ${percent(a)} of the damage an enemy's direct attack deals to this bearer's ability-applied Shields, up to this bearer's current Attack.`,
  'hurt-shield': a => `Each equipped copy can trigger once per round: when an enemy's direct attack damages this bearer's Health, they gain a Shield equal to ${percent(a)} of their maximum Health.`,
  'flare-shield': a => `When this bearer uses Convergent Light, each living ally, including the bearer, gains a Shield equal to ${percent(a)} of their own maximum Health.`,
  'round-heal': a => `At the start of each new round, heal the most-wounded living ally for ${percent(a)} of this bearer's current Recovery.`,
  'round-shield': a => `At the start of each new round, the most-wounded living ally gains a Shield equal to ${percent(a)} of this bearer's current Defense.`,
  'normal-burn': a => `When a Normal Attack damages Health, the surviving target burns through the next enemy phase, taking damage equal to ${percent(a)} of this bearer's current Attack.`,
  'normal-expose': a => `When a Normal Attack damages Health, the surviving target takes ${percent(Math.min(.8, a))} more direct damage for the rest of the round, up to 80%.`,
  'normal-weaken': a => `When a Normal Attack damages Health, the surviving target deals ${percent(Math.min(.8, a))} less damage during the next enemy phase, up to 80%.`,
  cooperation: a => `After another squad member acts this round, this bearer's Normal Attacks, skills and Convergent Light deal ${percent(a)} more damage.`,
  'next-buff': a => `When a Normal Attack damages Health, the next living ally who has not acted gains ${percent(Math.min(.8, a))} Attack for the rest of the round, up to 80%.`,
  'status-shield': a => `When one of this bearer's abilities applies Burn, Weaken or Exposure, the most-wounded living ally gains a Shield equal to ${percent(a)} of this bearer's current Defense, once per action.`,
  opening: a => conditionalDamage(a, 'against enemies at full Health'),
  execution: a => conditionalDamage(a, 'against enemies at or below 25% Health'),
  burning: a => conditionalDamage(a, 'against burning enemies'),
  exposed: a => conditionalDamage(a, 'against enemies with Exposure'),
  weakened: a => conditionalDamage(a, 'against weakened enemies'),
  shielded: a => conditionalDamage(a, 'while this bearer has a Shield'),
  wounded: a => conditionalDamage(a, 'while this bearer is at or below half Health'),
  solo: a => conditionalDamage(a, 'while only one enemy remains'),
  'first-action': a => conditionalDamage(a, 'when this bearer acts before every other ally this round'),
  'burn-power': a => `Burn applied by this bearer's abilities deals ${percent(a)} more damage. Conduit-generated Burn is unchanged.`,
  shelter: a => `Above 75% Health, this bearer takes ${percent(a)} less direct enemy damage.`,
  brace: a => `Enemy attacks exceeding 20% of this bearer's maximum Health deal ${percent(a)} less direct damage.`,
  'start-charge': a => `Begin each encounter with ${number(a)} Luminosity, rounded once and limited by capacity.`,
  'guard-heal': a => `Using Skill 1 or Skill 2 heals this bearer for ${percent(a)} of their current Recovery.`,
  'flare-heal': a => `Convergent Light heals the most-wounded living ally for ${percent(a)} of this bearer's current Recovery.`,
  'normal-shield': a => `A Normal Attack that damages Health gives this bearer a Shield worth ${percent(a)} of their current Defense.`,
  'heal-shield': a => `Each ally actually healed by this bearer's abilities gains a Shield worth ${percent(a)} of this bearer's current Defense, once per action.`,
  'hurt-heal': a => `Once per round, surviving direct enemy Health damage heals the most-wounded other living ally for ${percent(a)} of this bearer's current Recovery.`,
  'break-heal': a => `Once per round, when an enemy breaks this bearer's last Shield, heal them for ${percent(a)} of their current Recovery. Cannot revive.`,
  'burn-heal': a => `This bearer heals for ${percent(a)} of the Health damage dealt by their ability-applied Burn.`,
  'kill-heal': a => `Once per action, directly defeating an enemy heals the most-wounded living ally for ${percent(a)} of this bearer's maximum Health.`,
  'kill-charge': a => `Once per action, directly defeating an enemy grants this bearer ${number(a)} Luminosity, rounded once.`,
  'normal-splash': a => `A Normal Attack that damages Health strikes the healthiest other enemy for ${percent(a)} of that Health damage. This extra strike cannot trigger other effects.`,
  'flare-team-charge': a => `Convergent Light grants each other living ally ${number(a)} Luminosity, rounded once.`,
  'hurt-charge': a => `Once per round, surviving direct enemy Health damage grants this bearer ${number(a)} Luminosity, rounded once.`,
  'heal-team-charge': a => `Once per action, actual healing from this bearer's abilities grants each other living ally ${number(a)} Luminosity, rounded once.`,
  'guard-team-shield': a => `When this bearer uses Skill 1 or Skill 2, every living ally gains a Shield worth ${percent(a)} of this bearer's current Defense.`,
  'flare-weaken': a => `Convergent Light weakens all surviving enemies by ${percent(Math.min(.8, a))} through the next enemy phase.`,
  'normal-reduction': a => `After a Normal Attack damages Health, this bearer takes ${percent(Math.min(.8, a))} less direct enemy damage through the next enemy phase.`,
  'round-charge': a => `At each new round, this bearer gains ${number(a)} Luminosity, rounded once.`,
  'round-team-heal': a => `At each new round, heal every living ally for ${percent(a)} of this bearer's current Recovery.`,
  'skill-leech': a => `Once per action, this bearer's skills and Convergent Light heal the most-wounded living ally for ${percent(a)} of the direct Health damage they deal.`,
  'shield-break': a => `This bearer's Normal Attacks, skills and Convergent Light deal ${percent(a)} more damage to enemy Shields.`,
};

/** Radiant effects that combat sums across every equipped Conduit before applying them once. */
export const radiantSummedConduitEffects = [
  'hp', 'attack', 'defense', 'recovery', 'normal', 'flare', 'pierce', 'healing', 'shielding',
  'resilience', 'guard', 'leader', 'cooperation', 'opening', 'execution', 'burning', 'exposed',
  'weakened', 'shielded', 'wounded', 'solo', 'first-action', 'burn-power', 'shelter', 'brace', 'start-charge', 'shield-break',
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
