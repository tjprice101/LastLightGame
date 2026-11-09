import type { RadiantCombatEvent, RadiantCombatState, RadiantShield, RadiantSource, RadiantTimedEffect } from '../game/radiant-combat';
import { characterName } from '../content/character-art';
import { getConduit } from '../content/conduits';
import { getMasterConduit } from '../content/master-conduits';
import { radiantMasters } from '../content/radiant-combat';
import type { FrozenRadiantRun } from '../online/radiant-run';
import { escapeDialogText as escape } from './game-dialog';
import { statusIcon } from './status-icon';
import type { StatusArtId } from '../content/status-art';

export interface RadiantStatusRow {
  kind: 'burn' | 'exposure' | 'weaken' | 'seed' | 'renewal' | 'reduction' | 'attack-buff' | 'guard';
  magnitude: number;
  remaining: number | null;
  source: RadiantSource | null;
}
export type RadiantStatusSnapshot = Record<string, RadiantStatusRow[]>;
export function radiantStatusSnapshot(state: RadiantCombatState): RadiantStatusSnapshot {
  const result: Record<string, RadiantStatusRow[]> = {};
  for (const unit of [...state.bearers, ...state.enemies]) {
    const rows: RadiantStatusRow[] = [];
    const add = (kind: RadiantStatusRow['kind'], effects: RadiantTimedEffect[]) => {
      for (const effect of effects) rows.push({ kind, ...structuredClone(effect) });
    };
    if ('loadout' in unit) {
      add('seed', unit.seeds); add('renewal', unit.renewal); add('reduction', unit.reductions);
      add('attack-buff', unit.attackBuffs);
      if (unit.guarding) rows.push({ kind: 'guard', magnitude: .5, remaining: null, source: null });
    } else { add('burn', unit.burns); add('exposure', unit.exposures); }
    add('weaken', unit.weaken);
    result['loadout' in unit ? unit.loadout.id : unit.id] = unit.hp > 0 ? rows : [];
  }
  return result;
}
function sameSource(a: RadiantSource, b: RadiantSource): boolean {
  if (a.kind !== b.kind) return false;
  return 'enemyId' in a && 'enemyId' in b ? a.enemyId === b.enemyId :
    'bearerId' in a && 'bearerId' in b && a.bearerId === b.bearerId &&
      (a.kind !== 'gear' || b.kind === 'gear' && a.conduitId === b.conduitId);
}
export function applyRadiantStatusEvent(
  snapshot: RadiantStatusSnapshot, event: Extract<RadiantCombatEvent, { type: 'status' | 'guard' }>,
): void {
  const rows = snapshot[event.targetId];
  if (!rows) throw new Error('Saved status target is missing.');
  if (event.type === 'guard') {
    snapshot[event.targetId] = event.guarding
      ? [...rows.filter(row => row.kind !== 'guard'), { kind: 'guard', magnitude: .5,
        remaining: null, source: null }]
      : rows.filter(row => row.kind !== 'guard');
    return;
  }
  if (event.status === 'weaken-removed') {
    if (!event.source) throw new Error('Saved removed status has no source.');
    snapshot[event.targetId] = rows.filter(row => row.kind !== 'weaken' || !row.source ||
      !sameSource(row.source, event.source!));
    return;
  }
  if (!event.source) throw new Error('Saved timed status has no source.');
  const kind = event.status;
  const retained = rows.filter(row => row.kind !== kind || !row.source || !sameSource(row.source, event.source!));
  if (event.remaining > 0)
    retained.push({ kind, magnitude: event.magnitude, remaining: event.remaining, source: structuredClone(event.source) });
  snapshot[event.targetId] = retained;
}
export function radiantSourceLabel(source: RadiantSource, run: FrozenRadiantRun): string {
  if (source.kind === 'enemy') {
    const enemy = run.enemies.find(enemy => enemy.id === source.enemyId);
    if (!enemy) throw new Error('Status enemy source is missing.');
    return enemy.name;
  }
  const bearer = run.state.bearers.find(unit => unit.loadout.id === source.bearerId);
  if (!bearer) throw new Error('Status bearer source is missing.');
  const name = characterName(bearer.loadout.starter, bearer.loadout.form);
  if (source.kind === 'gear') return `${name} · ${getConduit(source.conduitId).name}`;
  if (source.kind === 'master') {
    const id = bearer.loadout.masterId;
    if (id === null || !Object.hasOwn(radiantMasters, id)) throw new Error('Status Master source is missing.');
    return `${name} · ${getMasterConduit(id).name}`;
  }
  return `${name} · ${source.kind === 'normal' ? 'Normal Attack' : source.kind === 'flare' ? 'Flare' : 'Passive'}`;
}
const descriptions: Record<RadiantStatusRow['kind'], { label: string; clock: string; icon?: StatusArtId; percent: boolean }> = {
  burn: { label: 'Burn', clock: 'enemy phase', icon: 'burn', percent: false },
  exposure: { label: 'Exposure', clock: 'enemy phase', percent: true },
  weaken: { label: 'Weaken', clock: 'enemy phase', percent: true },
  seed: { label: 'Seed', clock: 'round start', percent: false },
  renewal: { label: 'Renewal', clock: 'round start', percent: false },
  reduction: { label: 'Direct damage reduction', clock: 'enemy phase', percent: true },
  'attack-buff': { label: 'Attack boost', clock: 'round', percent: true },
  guard: { label: 'Guard', clock: 'until next round', percent: true },
};
export function radiantStatusRows(rows: readonly RadiantStatusRow[], run: FrozenRadiantRun): string {
  return rows.map(row => {
    const definition = descriptions[row.kind];
    const amount = definition.percent ? `${Number((row.magnitude * 100).toPrecision(12))}%` : String(row.magnitude);
    const clock = row.remaining === null ? definition.clock :
      `${row.remaining} ${definition.clock}${row.remaining === 1 ? '' : 's'} remaining`;
    return `<li data-radiant-effect="${row.kind}">${definition.icon ? statusIcon(definition.icon) : ''}
      <strong>${definition.label}${row.kind === 'guard' ? '' : ` · ${amount}`}</strong><span>${clock}</span>
      ${row.source ? `<small>${escape(radiantSourceLabel(row.source, run))}</small>` : ''}</li>`;
  }).join('');
}
export function radiantShieldRows(layers: readonly RadiantShield[], run: FrozenRadiantRun): string {
  return layers.map(layer => `<li data-radiant-shield-id="${layer.id}">${statusIcon('ward')}
    <strong>Shield · ${layer.remaining}</strong><span>Until broken</span>
    <small>${escape(radiantSourceLabel(layer.source, run))}</small></li>`).join('');
}
