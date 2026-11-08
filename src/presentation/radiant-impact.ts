import { validateRadiantCombat, type RadiantCombatEvent, type RadiantCombatState, type RadiantShield, type RadiantSource } from '../game/radiant-combat';
import { spendReadyFlare, type RadiantGaugeState } from '../game/radiant-gauge';

export interface RadiantReadout {
  units: Record<string, { hp: number; maximum: number; shield: number; layers: RadiantShield[] }>;
  gauge: RadiantGaugeState;
  currency: number;
  round: number;
}
export interface RadiantImpactFrame {
  events: RadiantCombatEvent[];
  readout: RadiantReadout;
}
export function radiantReadout(state: RadiantCombatState): RadiantReadout {
  validateRadiantCombat(state);
  return { units: Object.fromEntries([...state.bearers, ...state.enemies].map(unit => [
    'loadout' in unit ? unit.loadout.id : unit.id,
    { hp: unit.hp, maximum: Math.round(unit.stats.hp), shield: unit.shields.reduce((sum, layer) => sum + layer.remaining, 0),
      layers: structuredClone(unit.shields) },
  ])), gauge: structuredClone(state.gauge), currency: state.currencyEarned, round: state.round };
}
function ownerKey(source: RadiantSource): string {
  return `${source.kind}:${
    'enemyId' in source ? source.enemyId : source.bearerId}:${source.kind === 'gear' ? source.conduitId : ''}`;
}
function sourceKey(event: RadiantCombatEvent): string | null {
  if (event.type !== 'damage' && event.type !== 'heal' && event.type !== 'shield') return null;
  return `${event.type}:${event.type === 'damage' ? event.origin : ''}:${ownerKey(event.source)}`;
}
function apply(readout: RadiantReadout, event: RadiantCombatEvent): void {
  if ('targetId' in event) {
    const unit = readout.units[event.targetId];
    if (!unit) throw new Error('Saved impact target is missing.');
    if (event.type === 'damage') {
      if (event.healthLoss > unit.hp || event.absorbed > unit.shield + .000001)
        throw new Error('Saved impact exceeds the displayed HP or Shield.');
      unit.hp -= event.healthLoss; unit.shield = Math.max(0, unit.shield - event.absorbed);
      let absorbed = event.absorbed;
      const consumed: { source: RadiantSource; amount: number }[] = [];
      for (const layer of unit.layers) {
        const amount = Math.min(layer.remaining, absorbed);
        if (amount > 0) consumed.push({ source: layer.source, amount });
        layer.remaining -= amount; absorbed -= amount;
      }
      if (consumed.length !== event.shields.length || consumed.some((layer, index) =>
        ownerKey(layer.source) !== ownerKey(event.shields[index].source) ||
        Math.abs(layer.amount - event.shields[index].amount) > .000001))
        throw new Error('Saved Shield absorption does not match source-owned layers.');
      unit.layers = unit.layers.filter(layer => layer.remaining > 0);
      const member = readout.gauge.members.find(member => member.id === event.targetId);
      if (member) member.living = unit.hp > 0;
    } else if (event.type === 'heal') unit.hp += event.effective;
    else if (event.type === 'shield') {
      unit.shield += event.amount;
      const existing = unit.layers.find(layer => layer.id === event.shieldId);
      if (existing) {
        if (ownerKey(existing.source) !== ownerKey(event.source))
          throw new Error('Saved Shield refresh changes its source owner.');
        existing.remaining += event.amount;
      }
      else unit.layers.push({ id: event.shieldId, source: structuredClone(event.source), remaining: event.amount });
    }
    else if (event.type === 'defeated' && unit.hp !== 0) throw new Error('Saved defeat precedes its impact.');
    if (unit.hp > unit.maximum) throw new Error('Saved healing exceeds displayed maximum HP.');
  }
  if (event.type === 'flare') {
    const spent = spendReadyFlare(readout.gauge, event.bearerId);
    if (spent.tier !== event.tier) throw new Error('Saved Flare tier does not match displayed charge.');
    readout.gauge = spent.state;
  } else if (event.type === 'charge') {
    const member = readout.gauge.members.find(member => member.id === event.bearerId);
    if (!member) throw new Error('Saved charge owner is missing.');
    member.charge = event.personal; readout.gauge.sharedUnits = event.sharedUnits;
  } else if (event.type === 'currency') readout.currency += event.amount;
  else if (event.type === 'round') readout.round = event.round;
}
/** Distinct targets of the same authored packet share an impact. Repeated hits,
 * generated follow-ups and periodic packets retain their own ordered boundary. */
export function radiantImpactFrames(before: RadiantCombatState, after: RadiantCombatState,
  events: readonly RadiantCombatEvent[]): RadiantImpactFrame[] {
  const displayed = radiantReadout(before), expected = radiantReadout(after);
  const frames: RadiantImpactFrame[] = [];
  for (let index = 0; index < events.length;) {
    const batch: RadiantCombatEvent[] = [], first = events[index], key = sourceKey(first);
    const targets = new Set<string>();
    do {
      const event = events[index++];
      batch.push(structuredClone(event)); apply(displayed, event);
      if ('targetId' in event && sourceKey(event) !== null) targets.add(event.targetId);
      const next = events[index];
      if (!next || key === null) break;
      if (next.type === 'currency' || next.type === 'defeated') continue;
      if (next.type === 'status' && targets.has(next.targetId)) continue;
      if (sourceKey(next) !== key || !('targetId' in next) || targets.has(next.targetId)) break;
    } while (index < events.length);
    frames.push({ events: batch, readout: structuredClone(displayed) });
  }
  for (const [id, unit] of Object.entries(expected.units)) {
    const actual = displayed.units[id];
    if (!actual || actual.hp !== unit.hp || Math.abs(actual.shield - unit.shield) > .000001)
      throw new Error('Saved impact history does not reproduce final HP and Shields.');
    if (actual.layers.length !== unit.layers.length || actual.layers.some((layer, index) =>
      layer.id !== unit.layers[index].id || ownerKey(layer.source) !== ownerKey(unit.layers[index].source) ||
      Math.abs(layer.remaining - unit.layers[index].remaining) > .000001))
      throw new Error('Saved impact history does not reproduce source-owned Shield layers.');
  }
  if (Object.keys(displayed.units).length !== Object.keys(expected.units).length ||
    JSON.stringify(displayed.gauge) !== JSON.stringify(expected.gauge) ||
    displayed.currency !== expected.currency || displayed.round !== expected.round)
    throw new Error('Saved impact history does not reproduce final charge and earnings.');
  return frames;
}
