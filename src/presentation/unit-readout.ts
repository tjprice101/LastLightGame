import { formatStat } from '../content/combat';
import { type Combatant } from '../game/battle';

export function unitReadout(unit: Combatant, compact = false): string {
  const health = `<span class="unit-health">HP ${formatStat(unit.hp)} ~ ${formatStat(unit.stats.health)}</span>`;
  const defense = `<span class="unit-stats">DEF ${formatStat(unit.stats.defense)}`;
  const core = compact ? health : `${health}${defense}</span>`;
  if (unit.side === 'enemy') return core;
  const charges = compact ? '' : [
    unit.conduitCharges?.burnFocus && 'Next offensive action: +5 percentage points Crit.',
    unit.conduitCharges?.normalMomentum && 'Next offensive skill: +10% outgoing damage.',
    unit.conduitCharges?.weakenPierce && 'Next offensive action: ignores 20% Defense.',
  ].filter(Boolean).map((text) => `<span class="unit-stats">${text}</span>`).join('');
  return `${core}
    <span class="shatter-track" role="meter" aria-label="${unit.name} Shatter Gauge" aria-valuemin="0" aria-valuemax="${unit.stats.shatterCapacity}" aria-valuenow="${unit.shatter}"><span style="width:${unit.shatter / unit.stats.shatterCapacity * 100}%"></span></span>
    <span class="unit-gauge">${compact ? 'Gauge' : 'Shatter Gauge'} ${formatStat(unit.shatter)} ~ ${formatStat(unit.stats.shatterCapacity)}</span>${charges}`;
}
