import { elementalEffectDescription } from '../content/elemental-effects';
import { formatStat } from '../content/combat';
import { kitPilotDescriptions } from '../content/kit-pilots';
import { type Combatant } from '../game/battle';
import { enemyStatusReadout } from './battle-status';
import { elementalStatusArt, type StatusArtId } from '../content/status-art';
import { statusIcon } from './status-icon';
import { getConduit, isConduitId } from '../content/conduits';

export function unitReadout(unit: Combatant, compact = false, owners: readonly Combatant[] = [], _round = 0): string {
  const health = `<span class="unit-health">HP ${formatStat(unit.hp)} / ${formatStat(unit.stats.health)}</span>`;
  const defense = `<span class="unit-stats">DEF ${formatStat(unit.stats.defense)}`;
  const core = compact ? health : `${health}${defense}</span>`;
  if (unit.side === 'enemy') return `${core}${enemyStatusReadout(unit, owners)}`;
  const resourceDescriptor = !unit.captured && unit.kit?.pilot ? kitPilotDescriptions[unit.kit.pilot].resource : undefined;
  const resourceCount = resourceDescriptor ? unit.pilot?.[resourceDescriptor.key] ?? 0 : 0;
  const charge = (text: string, icon?: StatusArtId): string =>
    `<span class="unit-stats">${icon ? statusIcon(icon) : ''}${text}</span>`;
  const charges = compact ? '' : [
    unit.conduitCharges?.burnFocus && charge('Next offensive action: +5 percentage points Crit.', 'focus'),
    unit.conduitCharges?.normalMomentum && charge('Next offensive skill: +10% outgoing damage.'),
    unit.conduitCharges?.weakenPierce && charge('Next offensive action: ignores 20% Defense.', 'suppression'),
    unit.conduitCharges?.emberSeals && charge(`Conduit Ember Seals ${unit.conduitCharges.emberSeals}/3: next damaging skill +${unit.conduitCharges.emberSeals * 5}% damage.`, 'burn'),
    unit.conduitCharges?.stormstepSkill1 && charge('Alternating Storm: next Skill1 +10% damage.', 'tempest'),
    unit.conduitCharges?.stormstepSkill2 && charge('Alternating Storm: next Skill2 +10% damage.', 'tempest'),
    unit.conduitCharges?.skythread && charge('Tailwind: next ordinary skill costs 5 less Gauge (minimum 1).', 'tempest'),
    unit.conduitCharges?.faultkeeperWard && charge('Fault Ward: next direct enemy hit -15% damage.', 'ward'),
    unit.conduitCharges?.verdantNormal && charge('Verdant Strike: next Normal Attack +10% damage.', 'bloom'),
    unit.conduitCharges?.dawnWitness && charge(`Dawn Focus ${unit.conduitCharges.dawnWitness}/3: next offensive activation +${unit.conduitCharges.dawnWitness * 3} percentage points Crit.`, 'focus'),
    unit.conduitCharges?.stillhour && charge('Stillhour: first direct enemy hit survived grants 8 Gauge.', 'ward'),
    unit.conduitCharges?.paradox && charge('Rift Echo: first offensive activation after recovery +15% damage.'),
    unit.omnicProtection && charge(`Accord protection: next direct enemy hit -${formatStat(unit.omnicProtection * 100)}% damage (one charge).`, 'ward'),
    ...Object.entries(unit.omnicMemory ?? {}).flatMap(([id, memory]) => memory.bank && isConduitId(id)
      ? [charge(`${getConduit(id).name}: stored reserve ${memory.bank}.`)] : []),
  ].filter(Boolean).join('');
  const resource = unit.hp <= 0 || !resourceDescriptor ? ''
    : `<span data-effect-family="${resourceDescriptor.effect.family}" data-effect-kind="${resourceDescriptor.effect.kind}" data-effect-origin="${resourceDescriptor.effect.origin}" data-effect-source="${resourceDescriptor.effect.source}" title="${elementalEffectDescription(resourceDescriptor.effect)}">${statusIcon(elementalStatusArt(resourceDescriptor.effect))}${resourceDescriptor.label} ${resourceCount} / 3</span>`;
  return `${core}
    <span class="shatter-track" role="meter" aria-label="${unit.name} Shatter Gauge" aria-valuemin="0" aria-valuemax="${unit.stats.shatterCapacity}" aria-valuenow="${unit.shatter}"><span style="width:${unit.shatter / unit.stats.shatterCapacity * 100}%"></span></span>
    <span class="unit-gauge">${compact ? 'Gauge' : 'Shatter Gauge'} ${formatStat(unit.shatter)} / ${formatStat(unit.stats.shatterCapacity)}</span>${resource ? `<span class="unit-gauge unit-kit-resource">${resource}</span>` : ''}${charges}`;
}
