import { characterName } from '../content/character-art';
import { resolveRadiantStarterStats, radiantMasters } from '../content/combat-kits';
import { radiantCalamiticRules, radiantConduitPrimitives } from '../content/conduit-effects';
import { getConduit } from '../content/conduits';
import { getMasterConduit } from '../content/master-conduits';
import type { RadiantCombatEvent, RadiantGearSource } from '../game/combat-engine';
import type { FrozenRadiantRun } from '../online/battle-run';
import { conduitIcon } from './conduit-store';
import { countUp, staggerIn } from './luster';
import { radiantStatusLabel } from './battle-timed-status';
import { radiantBearerKits } from '../content/combat-kits';

/** D-492: what one Conduit, Master or Leader Skill measurably did in this encounter's saved journal. */
export interface RadiantConduitContribution {
  source: RadiantGearSource;
  name: string;
  damage: number;
  prevented: number;
  healing: number;
  shields: number;
  luminosity: number;
  statuses: number;
  /** Always-on bonuses the journal cannot show per event (max Health, starting Luminosity). */
  maxHealth: number;
  startLuminosity: number;
}
export interface RadiantBearerContribution {
  bearerId: string;
  name: string;
  entries: RadiantConduitContribution[];
}

const gearKinds = new Set(['gear', 'master', 'leader']);
function key(source: RadiantGearSource): string {
  return source.kind === 'gear' ? `gear:${source.bearerId}:${source.conduitId}` : `${source.kind}:${source.bearerId}`;
}
function isGear(source: { kind: string }): source is RadiantGearSource {
  return gearKinds.has(source.kind);
}
function blank(source: RadiantGearSource, name: string): RadiantConduitContribution {
  return { source, name, damage: 0, prevented: 0, healing: 0, shields: 0, luminosity: 0, statuses: 0, maxHealth: 0, startLuminosity: 0 };
}

/**
 * Per-bearer Conduit contributions from the saved journal (D-492). Event-producing Conduits count their own
 * damage, healing, Shields, Luminosity and statuses; stat and multiplier Conduits count the `boosts` share the
 * engine recorded. Older journals without `boosts` simply show less. Never writes.
 */
export function radiantConduitContributions(run: FrozenRadiantRun): RadiantBearerContribution[] {
  const bearers = run.state.bearers;
  const leader = bearers[0];
  const rows = new Map<string, RadiantConduitContribution>();
  const groups: RadiantBearerContribution[] = bearers.map(unit => {
    const id = unit.loadout.id;
    const entries: RadiantConduitContribution[] = [];
    const add = (source: RadiantGearSource, name: string) => {
      const row = blank(source, name);
      rows.set(key(source), row);
      entries.push(row);
      return row;
    };
    const gear = unit.loadout.gear ?? [];
    const seen = new Set<string>();
    gear.forEach((slot, index) => {
      if (slot === null || seen.has(slot.id)) return;
      seen.add(slot.id);
      const row = add({ kind: 'gear', bearerId: id, conduitId: slot.id }, getConduit(slot.id).name);
      const without = gear.map((entry, at) => at === index || entry?.id === slot.id ? null : entry);
      row.maxHealth = Math.max(0, Math.round(resolveRadiantStarterStats(unit.loadout).hp -
        resolveRadiantStarterStats({ ...unit.loadout, gear: without }).hp));
      row.startLuminosity = Math.round(gear.filter(entry => entry?.id === slot.id)
        .flatMap(entry => radiantConduitPrimitives(entry!)).filter(entry => entry.kind === 'start-charge')
        .reduce((sum, entry) => sum + entry.amount, 0));
    });
    const masterId = unit.loadout.masterId;
    if (masterId !== null && Object.hasOwn(radiantMasters, masterId))
      add({ kind: 'master', bearerId: id }, getMasterConduit(masterId).name);
    return { bearerId: id, name: characterName(unit.loadout.starter, unit.loadout.form), entries };
  });
  const leaderRow = blank({ kind: 'leader', bearerId: leader.loadout.id }, 'Leader Skill');
  rows.set(key(leaderRow.source), leaderRow);
  groups[0].entries.push(leaderRow);
  const row = (source: RadiantGearSource) => rows.get(key(source));
  for (const event of run.journal.events as readonly RadiantCombatEvent[]) {
    if (event.type === 'damage') {
      if (isGear(event.source)) { const own = row(event.source); if (own) own.damage += event.healthLoss + event.absorbed; }
      for (const boost of event.boosts ?? []) {
        const own = row(boost.source);
        if (!own) continue;
        if (event.source.kind === 'enemy') own.prevented += boost.amount; else own.damage += boost.amount;
      }
    } else if (event.type === 'heal') {
      if (isGear(event.source)) { const own = row(event.source); if (own) own.healing += event.effective; }
      for (const boost of event.boosts ?? []) { const own = row(boost.source); if (own) own.healing += boost.amount; }
    } else if (event.type === 'shield') {
      if (isGear(event.source)) { const own = row(event.source); if (own) own.shields += event.amount; }
      for (const boost of event.boosts ?? []) { const own = row(boost.source); if (own) own.shields += boost.amount; }
    } else if (event.type === 'charge' && event.gearSource) {
      const own = row(event.gearSource);
      if (own) own.luminosity += event.gained ?? 0;
    } else if (event.type === 'status' && !event.clockOnly && isGear(event.source)) {
      const own = row(event.source);
      if (own) own.statuses++;
    }
  }
  for (const group of groups) group.entries = group.entries.filter(entry => entry.source.kind !== 'leader' || measured(entry));
  return groups.filter(group => group.entries.length > 0);
}
function measured(entry: RadiantConduitContribution): boolean {
  return entry.damage + entry.prevented + entry.healing + entry.shields + entry.luminosity + entry.statuses +
    entry.maxHealth + entry.startLuminosity > 0;
}
const number = (value: number) => value.toLocaleString('en-US');
function facts(entry: RadiantConduitContribution): string[] {
  const list: [number, string][] = [
    [entry.damage, 'damage'], [entry.prevented, 'damage prevented'], [entry.healing, 'healing'],
    [entry.shields, 'Shield'], [entry.luminosity, 'Luminosity'], [entry.maxHealth, 'max Health'],
    [entry.startLuminosity, 'starting Luminosity'],
  ];
  const out = list.filter(([value]) => value > 0)
    .map(([value, label]) => `<span class="radiant-contribution-fact"><b>+${number(value)}</b> ${label}</span>`);
  if (entry.statuses > 0)
    out.push(`<span class="radiant-contribution-fact"><b>${number(entry.statuses)}</b> ${entry.statuses === 1 ? 'effect applied' : 'effects applied'}</span>`);
  return out;
}
const escape = (value: string) => value.replace(/[&<>"']/g, character =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);

/** "Conduit contribution" results section; empty string when no Conduits, Masters or Leader effect took part. */
export function radiantConduitContributionMarkup(run: FrozenRadiantRun): string {
  const groups = radiantConduitContributions(run);
  if (groups.length === 0) return '';
  const rank = (bearerId: string, conduitId: string) =>
    run.state.bearers.find(unit => unit.loadout.id === bearerId)?.loadout.gear?.find(slot => slot?.id === conduitId)?.rank ?? 0;
  return `<details class="radiant-result-details radiant-contribution" data-radiant-contribution>
    <summary>Conduit contribution</summary>
    ${groups.map(group => `<section class="radiant-contribution-bearer" aria-label="${escape(group.name)} Conduits">
      <h4>${escape(group.name)}</h4><ul>${group.entries.map(entry => {
        const shown = facts(entry);
        const icon = entry.source.kind === 'gear' ? conduitIcon(entry.source.conduitId, rank(entry.source.bearerId, entry.source.conduitId))
          : `<span class="radiant-contribution-glyph" data-kind="${entry.source.kind}" aria-hidden="true"></span>`;
        return `<li class="radiant-contribution-row"${shown.length ? '' : ' data-idle'}>${icon}
          <div><p class="radiant-contribution-name">${escape(entry.name)}</p>
          <p class="radiant-contribution-facts">${shown.length ? shown.join('') : '<span class="radiant-result-muted">No trigger this battle</span>'}</p></div></li>`;
      }).join('')}</ul></section>`).join('')}
    <p class="radiant-result-muted">Totals for this encounter, including earlier retries. Burn strength and Shield-break bonuses are not itemized.</p>
  </details>`;
}

/** First open of the contribution section staggers its rows in and counts each total up (static under Reduce motion). */
export function bindConduitContribution(sheet: HTMLElement): () => void {
  const details = sheet.querySelector<HTMLDetailsElement>('[data-radiant-contribution]');
  if (!details) return () => {};
  const cleanups: Array<() => void> = [];
  const open = () => {
    if (!details.open) return;
    details.removeEventListener('toggle', open);
    details.querySelectorAll<HTMLElement>('.radiant-contribution-bearer ul').forEach(list =>
      cleanups.push(staggerIn(list, ':scope > li', { stepMs: 50 })));
    details.querySelectorAll<HTMLElement>('.radiant-contribution-fact > b').forEach((value, index) =>
      cleanups.push(countUp(value, { delayMs: Math.min(index, 12) * 40 })));
  };
  details.addEventListener('toggle', open);
  return () => { details.removeEventListener('toggle', open); for (const cleanup of cleanups.splice(0)) cleanup(); };
}

/** D-492 on-field callout: one pill above the owning bearer naming the Conduit and what it just did. */
export interface RadiantConduitCallout {
  bearerId: string;
  elementId: string;
  name: string;
  text: string;
}
/** Boost shares below this fraction of their hit are folded away so callouts stay readable. */
export const conduitCalloutThreshold = .1;
const calloutsPerBearer = 2, calloutsPerFrame = 4;
/** Callouts for one impact frame: merged per Conduit, capped per bearer and per frame. Pure; never reads RNG. */
export function radiantConduitCallouts(events: readonly RadiantCombatEvent[], run: FrozenRadiantRun): RadiantConduitCallout[] {
  const facts = new Map<string, { source: RadiantGearSource; damage: number; prevented: number; healing: number;
    shields: number; luminosity: number; statuses: string[]; notes: string[] }>();
  const at = (source: RadiantGearSource) => {
    let entry = facts.get(key(source));
    if (!entry) facts.set(key(source), entry = { source, damage: 0, prevented: 0, healing: 0, shields: 0, luminosity: 0, statuses: [], notes: [] });
    return entry;
  };
  const boosted = (boosts: readonly { source: RadiantGearSource; amount: number }[] | undefined, whole: number,
    add: (entry: ReturnType<typeof at>, amount: number) => void) => {
    for (const boost of boosts ?? []) if (boost.amount >= Math.max(1, whole * conduitCalloutThreshold)) add(at(boost.source), boost.amount);
  };
  for (const event of events) {
    if (event.type === 'damage') {
      if (isGear(event.source)) at(event.source).damage += event.healthLoss + event.absorbed;
      if (event.source.kind === 'enemy') boosted(event.boosts, event.offered, (entry, amount) => { entry.prevented += amount; });
      else boosted(event.boosts, event.offered, (entry, amount) => { entry.damage += amount; });
    } else if (event.type === 'heal') {
      if (isGear(event.source) && event.effective > 0) at(event.source).healing += event.effective;
      boosted(event.boosts, event.effective, (entry, amount) => { entry.healing += amount; });
    } else if (event.type === 'shield') {
      if (isGear(event.source)) at(event.source).shields += event.amount;
      boosted(event.boosts, event.amount, (entry, amount) => { entry.shields += amount; });
    } else if (event.type === 'charge' && event.gearSource && event.gained) {
      at(event.gearSource).luminosity += event.gained;
    } else if (event.type === 'revive') {
      // D-493 B3c: rescue and taunt moments lead their Conduit's callout.
      at(event.source).notes.push(`Revived · ${number(event.amount)} Health`);
    } else if (event.type === 'signature' && (event.op === 'accord-save' || event.op === 'taunt')) {
      const conduitId = event.op === 'taunt' ? 'tectonic-atlas-bastion' : 'tranquilitic-accord-bastion';
      at({ kind: 'gear', bearerId: event.bearerId, conduitId }).notes.push(event.op === 'taunt' ? 'Taunt · all enemies'
        : `${characterLabel(run, event.holderId)} kept at 1 Health`);
    } else if (event.type === 'signature' && (event.op === 'sunder' || event.op === 'refusal-restore')) {
      // D-493 B5b Master moments: Seismic Hammerfall's sunder and The World Refuses restoring Refusal.
      at({ kind: 'master', bearerId: event.bearerId }).notes.push(event.op === 'sunder'
        ? "Seismic Hammerfall · target sundered" : `Refusal restored · ${characterLabel(run, event.holderId)}`);
    } else if (event.type === 'signature' && event.op === 'borrowed') {
      // D-493 B4: Throne of Borrowed Tomorrows names each ally granted a borrowed skill.
      at({ kind: 'gear', bearerId: event.bearerId, conduitId: 'calamitic-throne-borrowed-tomorrows' })
        .notes.push(`Borrowed Tomorrows · ${characterLabel(run, event.holderId)} may use one more skill`);
    } else if (event.type === 'signature' && event.op === 'choir') {
      // D-493 B4: Choir-Array of Branded Stars (its Luminosity follows from the charge events).
      const wearer = run.state.bearers.find(unit => unit.loadout.id === event.bearerId);
      const slot = wearer?.loadout.gear?.find(entry => entry?.id === 'calamitic-choir-array-of-branded-stars');
      const power = slot ? radiantConduitPrimitives(slot).find(entry => entry.kind === 'mark-team-power')?.amount ?? 0 : 0;
      at({ kind: 'gear', bearerId: event.bearerId, conduitId: 'calamitic-choir-array-of-branded-stars' })
        .notes.push(`Squad +${number(Math.round(power * 1000) / 10)}% Skill Power this turn (${event.amount}/${radiantCalamiticRules.markTriggers})`);
    } else if (event.type === 'status' && !event.clockOnly && isGear(event.source)) {
      const label = radiantStatusLabel(event.status);
      const entry = at(event.source);
      if (!entry.statuses.includes(label)) entry.statuses.push(label);
    }
  }
  const perBearer = new Map<string, number>(), out: RadiantConduitCallout[] = [];
  for (const entry of facts.values()) {
    const parts = [
      ...entry.notes,
      entry.damage > 0 ? `+${number(entry.damage)} damage` : '',
      entry.prevented > 0 ? `${number(entry.prevented)} damage prevented` : '',
      entry.healing > 0 ? `Heal +${number(entry.healing)}` : '',
      entry.shields > 0 ? `Shield +${number(entry.shields)}` : '',
      entry.luminosity > 0 ? `+${number(entry.luminosity)} Luminosity` : '',
      ...entry.statuses,
    ].filter(Boolean).slice(0, 2);
    if (parts.length === 0) continue;
    // Leader effects show over the leader; Conduits and Masters over the bearer who equips them.
    const owner = run.state.bearers.find(unit => unit.loadout.id === entry.source.bearerId);
    if (!owner) continue;
    const count = perBearer.get(owner.loadout.id) ?? 0;
    if (count >= calloutsPerBearer || out.length >= calloutsPerFrame) continue;
    perBearer.set(owner.loadout.id, count + 1);
    out.push({ bearerId: owner.loadout.id, elementId: radiantBearerKits[owner.loadout.starter].elementId,
      name: sourceName(entry.source, owner.loadout.masterId), text: parts.join(' · ') });
  }
  return out;
}
function sourceName(source: RadiantGearSource, masterId: string | null): string {
  if (source.kind === 'gear') return getConduit(source.conduitId).name;
  if (source.kind === 'leader') return 'Leader Skill';
  return masterId !== null && Object.hasOwn(radiantMasters, masterId)
    ? getMasterConduit(masterId as keyof typeof radiantMasters).name : 'Master Conduit';
}
/** A bearer's display name for callouts (falls back to "Ally"). */
function characterLabel(run: FrozenRadiantRun, id: string | undefined): string {
  const member = run.state.bearers.find(unit => unit.loadout.id === id);
  return member ? characterName(member.loadout.starter) : 'Ally';
}
