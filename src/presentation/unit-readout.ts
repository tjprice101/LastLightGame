import { formatStat } from '../content/combat';
import { kitPilotDescriptions } from '../content/kit-pilots';
import { type BattleState, type Combatant } from '../game/battle';
import { enemyStatusReadout } from './battle-status';
import { elementalStatusArt, type StatusArtId } from '../content/status-art';
import { statusIcon } from './status-icon';
import { getConduit, isConduitId } from '../content/conduits';
import { astralReserveArt, getMasterConduit } from '../content/master-conduits';
import { assetUrl } from './portrait';
import { buffSnapshot } from '../game/battle-buffs';
import { allyBuffs } from './ally-buffs';
import { conduitStatusReadout } from './conduit-status';
import { nativeMarkerReadout, nativeStateReadout } from './native-kit-presentation';
import { enemyStrengthModifiers } from './enemy-strength';

export function unitReadout(unit: Combatant, compact = false, owners: readonly Combatant[] = [], round = 0, state?: BattleState): string {
  const health = `<span class="unit-health">HP ${formatStat(unit.hp)} / ${formatStat(unit.stats.health)}</span>`;
  const defense = `<span class="unit-stats">DEF ${formatStat(unit.stats.defense)}`;
  const core = compact ? health : `${health}${defense}</span>`;
  if (unit.side === 'enemy') return `${core}${unit.level !== null ? enemyStrengthModifiers({ level: unit.level, boss: unit.boss === true, stats: unit.stats }) : ''}${compact ? '<span class="unit-field-statuses" title="Full status details are in the Battle menu.">' : ''}${unit.definitionId.startsWith('calamity:') ? `<span class="unit-active-buffs">${unit.hp > 0 ? allyBuffs(buffSnapshot(unit), round) : ''}</span>` : ''}${enemyStatusReadout(unit, owners)}${state ? nativeMarkerReadout(state, unit) : ''}${conduitStatusReadout(unit, round, owners, compact)}${compact ? '</span><span class="unit-status-reference">Battle menu: full details</span>' : ''}`;
  const resourceDescriptor = !unit.captured && !unit.kit?.nativeIdentity && unit.kit?.pilot ? kitPilotDescriptions[unit.kit.pilot].resource : undefined;
  const resourceCount = resourceDescriptor ? unit.pilot?.[resourceDescriptor.key] ?? 0 : 0;
  const resourceSummary = resourceDescriptor?.summary;
  const charge = (text: string, icon?: StatusArtId): string =>
    `<span class="unit-stats">${icon ? statusIcon(icon) : ''}${text}</span>`;
  const charges = compact || unit.conduitRuntime ? '' : [
    unit.conduitCharges?.burnFocus && charge('Next offensive action: +5 percentage points Crit.', 'focus'),
    unit.conduitCharges?.normalMomentum && charge('Next offensive skill: +10% outgoing damage.'),
    unit.conduitCharges?.weakenPierce && charge('Next offensive action: ignores 20% Defense.', 'suppression'),
    unit.conduitCharges?.emberSeals && charge(`Conduit Ember Seals ${unit.conduitCharges.emberSeals}: next damaging skill +${unit.conduitCharges.emberSeals * 5}% damage.`, 'burn'),
    unit.conduitCharges?.stormstepSkill1 && charge('Alternating Storm: next Skill1 +10% damage.', 'tempest'),
    unit.conduitCharges?.stormstepSkill2 && charge('Alternating Storm: next Skill2 +10% damage.', 'tempest'),
    unit.conduitCharges?.skythread && charge('Tailwind: next ordinary skill costs 5 less Elemental Gauge (minimum 1).', 'tempest'),
    unit.conduitCharges?.faultkeeperWard && charge('Fault Ward: next direct enemy hit -15% damage.', 'ward'),
    unit.conduitCharges?.verdantNormal && charge('Verdant Strike: next Normal Attack +10% damage.', 'bloom'),
    unit.conduitCharges?.dawnWitness && charge(`Dawn Focus ${unit.conduitCharges.dawnWitness}: next offensive activation +${unit.conduitCharges.dawnWitness * 3} percentage points Crit.`, 'focus'),
    unit.conduitCharges?.stillhour && charge('Stillhour: first direct enemy hit survived grants 8 Elemental Gauge.', 'ward'),
    unit.conduitCharges?.paradox && charge('Rift Echo: first offensive activation after recovery +15% damage.'),
    unit.omnicProtection && charge(`Direct-hit protection: next direct enemy hit -${formatStat(unit.omnicProtection * 100)}% damage (one charge).`, 'ward'),
    ...Object.entries(unit.omnicMemory ?? {}).flatMap(([id, memory]) => memory.bank && isConduitId(id)
      ? [charge(`${getConduit(id).name}: stored reserve ${memory.bank}.`)] : []),
  ].filter(Boolean).join('');
  const resource = unit.hp <= 0 || !resourceDescriptor ? ''
    : `<span data-effect-family="${resourceDescriptor.effect.family}" data-effect-kind="${resourceDescriptor.effect.kind}" data-effect-origin="${resourceDescriptor.effect.origin}" data-effect-source="${resourceDescriptor.effect.source}" title="${resourceSummary} ${resourceDescriptor.detail}">${statusIcon(elementalStatusArt(resourceDescriptor.effect))}${resourceDescriptor.label} ${resourceCount} charges</span>`;
  const statuses = `<span class="unit-active-buffs">${allyBuffs(buffSnapshot(unit), round)}</span>${state ? nativeMarkerReadout(state, unit) : ''}${conduitStatusReadout(unit, round, owners, compact)}`;
  return `${core}${compact ? '' : statuses}
    <span class="shatter-track" role="meter" aria-label="${unit.name} Elemental Gauge" aria-valuemin="0" aria-valuemax="${unit.stats.shatterCapacity}" aria-valuenow="${unit.shatter}"><span style="width:${unit.shatter / unit.stats.shatterCapacity * 100}%"></span></span>
    <span class="unit-gauge">Elemental Gauge ${formatStat(unit.shatter)} / ${formatStat(unit.stats.shatterCapacity)}</span>${compact ? '<span class="unit-field-statuses" title="Full status details are in the Battle menu.">' + statuses : ''}${state ? `<span class="native-kit-slot">${nativeStateReadout(state, unit, compact)}</span>` : ''}${resource ? `<span class="unit-gauge unit-kit-resource">${resource}</span>` : ''}${charges}${compact ? '</span><span class="unit-status-reference">Battle menu: full details</span>' : ''}`;
}
