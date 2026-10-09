import { formatStat } from '../content/combat';
import { type Combatant } from '../game/battle';
import { enemyStatusReadout } from './battle-status';

export function unitReadout(unit: Combatant, compact = false, owners: readonly Combatant[] = [], round = 0): string {
  const health = `<span class="unit-health">HP ${formatStat(unit.hp)} ~ ${formatStat(unit.stats.health)}</span>`;
  const defense = `<span class="unit-stats">DEF ${formatStat(unit.stats.defense)}`;
  const core = compact ? health : `${health}${defense}</span>`;
  if (unit.side === 'enemy') return `${core}${enemyStatusReadout(unit, owners)}`;
  const charges = compact ? '' : [
    unit.conduitCharges?.burnFocus && 'Next offensive action: +5 percentage points Crit.',
    unit.conduitCharges?.normalMomentum && 'Next offensive skill: +10% outgoing damage.',
    unit.conduitCharges?.weakenPierce && 'Next offensive action: ignores 20% Defense.',
    unit.conduitCharges?.emberSeals && `Conduit Ember Seals ${unit.conduitCharges.emberSeals}/3: next damaging skill +${unit.conduitCharges.emberSeals * 5}% damage.`,
    unit.conduitCharges?.stormstepSkill1 && 'Alternating Storm: next Skill1 +10% damage.',
    unit.conduitCharges?.stormstepSkill2 && 'Alternating Storm: next Skill2 +10% damage.',
    unit.conduitCharges?.skythread && 'Tailwind: next ordinary skill costs 5 less Gauge (minimum 1).',
    unit.conduitCharges?.faultkeeperWard && 'Fault Ward: next direct enemy hit -15% damage.',
    unit.conduitCharges?.verdantNormal && 'Verdant Strike: next Normal Attack +10% damage.',
    unit.conduitCharges?.dawnWitness && `Dawn Focus ${unit.conduitCharges.dawnWitness}/3: next offensive activation +${unit.conduitCharges.dawnWitness * 3} percentage points Crit.`,
    unit.conduitCharges?.stillhour && 'Stillhour: first direct enemy hit survived grants 8 Gauge.',
    unit.conduitCharges?.paradox && 'Rift Echo: first offensive activation after recovery +15% damage.',
    unit.conduitCharges?.graftCovenant && 'Graft Covenant: next damaging ordinary skill +15% damage (one charge).',
    unit.pilot?.emberSeals && `Personal Ember Seals ${unit.pilot.emberSeals} ~ 3: Skill2 +${unit.pilot.emberSeals * 8}% damage or Last Flare +${unit.pilot.emberSeals * 12}% damage.`,
    unit.pilot?.tideStacks && `Tide stacks ${unit.pilot.tideStacks} ~ 3: Skill1 +${unit.pilot.tideStacks * 5} percentage points Weaken or Last Flare adds ${unit.pilot.tideStacks * 5}% caster maximum HP shield.`,
    unit.pilot?.blooms && `Blooms ${unit.pilot.blooms} ~ 3: Skill1 +${unit.pilot.blooms * 10}% damage or Last Flare +${unit.pilot.blooms * 15}% healing.`,
    unit.pilot?.restorativeCharges && `Restorative Charges ${unit.pilot.restorativeCharges}/3: Last Flare shield ${unit.pilot.restorativeCharges * 5}% caster maximum HP.`,
    unit.pilot?.shelterWard && 'Shelter Charge: next direct enemy hit -10% damage.',
    unit.pilot?.precision && unit.pilot.precision.throughRound >= round && `Precision +${formatStat(unit.pilot.precision.points * 100)} percentage points Crit.`,
  ].filter(Boolean).map((text) => `<span class="unit-stats">${text}</span>`).join('');
  const resource = unit.hp <= 0 ? '' : unit.kit?.pilot === 'ember-seals'
    ? `Ember Seals ${unit.pilot?.emberSeals ?? 0} ~ 3`
    : unit.kit?.pilot === 'shelter' ? `Tide ${unit.pilot?.tideStacks ?? 0} ~ 3`
    : unit.kit?.pilot === 'bloom' ? `Blooms ${unit.pilot?.blooms ?? 0} ~ 3` : '';
  return `${core}
    <span class="shatter-track" role="meter" aria-label="${unit.name} Shatter Gauge" aria-valuemin="0" aria-valuemax="${unit.stats.shatterCapacity}" aria-valuenow="${unit.shatter}"><span style="width:${unit.shatter / unit.stats.shatterCapacity * 100}%"></span></span>
    <span class="unit-gauge">${compact ? 'Gauge' : 'Shatter Gauge'} ${formatStat(unit.shatter)} ~ ${formatStat(unit.stats.shatterCapacity)}</span>${resource ? `<span class="unit-gauge unit-kit-resource">${resource}</span>` : ''}${charges}`;
}
