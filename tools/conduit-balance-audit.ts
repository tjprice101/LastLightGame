import { conduits, conduitUpgradeCap, validateConduitElement, validateConduitSlots,
  type ConduitId, type ConduitLoadouts, type ConduitUpgrades } from '../src/content/conduits';
import { masterConduits, type MasterConduitId, type MasterLoadouts } from '../src/content/master-conduits';
import { calamityActivities } from '../src/content/calamity';
import { starters, getStarter, type StarterId } from '../src/content/starters';
import { createInfusionBattle, createWarBattle, createCalamityBattle, withMasterLoadouts,
  actAndAdvanceTurn, actionUnavailable, endTurn, type BattleState, type BattleEvent } from '../src/game/battle';
import { benchmarkPriorities, benchmarkTarget } from '../src/game/native-benchmark-pilot';
import { conduitIncoming, gear, nativeShield } from '../src/game/conduit-runtime';
import { loadout, progressAt, measureBattle, encounterLabel, type Encounter, type Outcome } from './battle-survey';
import type { ActionId } from '../src/content/combat';

export const auditSeeds = [1729, 54321, 104729];
export const auditLimits = { rounds: 100, decisions: 1800 };
export const auditEncounters: Encounter[] = [
  { kind: 'infusion', mode: 'machines', stage: 35 },
  { kind: 'infusion', mode: 'roses', stage: 35 },
  { kind: 'war', character: 'vaelor', stage: 10 },
  ...([1, 2, 3] as const).map(tier => ({ kind: 'calamity' as const, activity: 'machines' as const, tier })),
];
export type AuditId = ConduitId | MasterConduitId;
export type Context = 'isolated' | 'supported';
export const auditCatalog = [
  ...conduits.map(piece => ({ id: piece.id as AuditId, name: piece.name, rarity: piece.rarity,
    eligible: starters.filter(unit => !piece.element || piece.element === unit.elementId).map(unit => unit.id),
    skipped: starters.filter(unit => piece.element && piece.element !== unit.elementId)
      .map(unit => ({ character: unit.id, reason: `Requires ${piece.element}; wearer is ${unit.elementId}` })),
    levels: [0, conduitUpgradeCap] })),
  ...masterConduits.map(piece => ({ id: piece.id as AuditId, name: piece.name, rarity: 'Master',
    eligible: [piece.character], skipped: starters.filter(unit => unit.id !== piece.character)
      .map(unit => ({ character: unit.id, reason: `Named Master requires ${piece.character}` })), levels: [0] })),
];

export function auditRoster(wearer: StarterId): StarterId[] {
  return [wearer, ...(['ember', 'tide', 'sprout'] as StarterId[]).filter(id => id !== wearer)].slice(0, 3);
}

export function auditGear(id: AuditId, wearer: StarterId, level: number, context: Context, equipped: boolean) {
  const roster = auditRoster(wearer);
  const isMaster = id.startsWith('master-');
  const profile = loadout(roster, context === 'supported' ? 'mixed5' : 'bare');
  const equipment: ConduitLoadouts = profile.equipment;
  const upgrades: ConduitUpgrades = profile.upgrades;
  const masters: MasterLoadouts = {};
  if (!isMaster) {
    const retained = equipment[wearer]!.filter((piece): piece is ConduitId => piece !== null && piece !== id).slice(0, 7);
    equipment[wearer] = [...retained, ...Array<null>(7 - retained.length).fill(null), equipped ? id as ConduitId : null];
    upgrades[id as ConduitId] = level;
  } else if (equipped) {
    masters[wearer] = id as MasterConduitId;
  }
  for (const character of roster)
    validateConduitElement(validateConduitSlots(equipment[character]), getStarter(character).elementId);
  return { roster, equipment, upgrades, masters };
}

export function auditBattle(id: AuditId, wearer: StarterId, level: number, context: Context,
  equipped: boolean, encounter: Encounter, seed: number, extra: ConduitId[] = []): BattleState {
  const built = auditGear(id, wearer, level, context, equipped);
  if (extra.length) {
    const slots = built.equipment[wearer]!;
    if (extra.length > 7 || id.startsWith('master-')) throw new Error('Unsupported synergy probe.');
    const retained = slots.filter((piece): piece is ConduitId => piece !== null && piece !== id && !extra.includes(piece))
      .slice(0, 7 - extra.length);
    const pieces = [...retained, ...extra];
    built.equipment[wearer] = [...pieces, ...Array<null>(7 - pieces.length).fill(null), equipped ? id as ConduitId : null];
    for (const piece of extra) built.upgrades[piece] = level;
    validateConduitElement(validateConduitSlots(built.equipment[wearer]), getStarter(wearer).elementId);
  }
  const { roster, equipment, upgrades, masters } = built;
  const progress = progressAt(105), team = Object.fromEntries(roster.map(unit => [unit, progress]));
  let state: BattleState;
  if (encounter.kind === 'infusion')
    state = createInfusionBattle(encounter.mode, encounter.stage, seed, wearer, progress, roster, team, equipment, [], upgrades);
  else if (encounter.kind === 'war')
    state = createWarBattle(encounter.character, encounter.stage, seed, wearer, progress, roster, team, equipment, [], upgrades);
  else if (encounter.kind === 'calamity')
    state = createCalamityBattle(encounter.activity, encounter.tier, seed, wearer, progress, roster, team, equipment, [], upgrades);
  else throw new Error('Audit uses only native late-game encounters.');
  return withMasterLoadouts(state, masters);
}

function compact(result: Outcome) {
  const contribution = Object.values(result.contribution);
  return { outcome: result.outcome, rounds: result.rounds, decisions: result.decisions, surviving: result.surviving,
    healthFraction: result.healthFraction, enemyRemaining: result.enemyRemaining, firstKoRound: result.firstKoRound,
    damage: contribution.reduce((sum, unit) => sum + unit.damage, 0),
    healing: contribution.reduce((sum, unit) => sum + unit.healing, 0),
    shields: contribution.reduce((sum, unit) => sum + unit.shieldsCreated, 0),
    periodic: contribution.reduce((sum, unit) => sum + unit.periodicDamage, 0),
    actions: contribution.reduce((sum, unit) => sum + Object.values(unit.actions).reduce((a, b) => a + b, 0), 0) };
}

export interface AuditRow {
  category: string; id: AuditId; wearer: StarterId; level: number; context: Context; encounter: string; seed: number;
  on: ReturnType<typeof compact>; off: ReturnType<typeof compact>;
}

export function runConduitAudit(emit: (row: AuditRow) => void): number {
  let count = 0;
  const cache = new Map<string, ReturnType<typeof compact>>();
  function sample(category: string, id: AuditId, wearer: StarterId, level: number, context: Context,
    encounter: Encounter, seed: number) {
    const offState = auditBattle(id, wearer, level, context, false, encounter, seed);
    const key = JSON.stringify(offState);
    let off = cache.get(key);
    if (!off) {
      off = compact(measureBattle(offState, 'native', auditLimits).result);
      cache.set(key, off);
    }
    const on = compact(measureBattle(auditBattle(id, wearer, level, context, true, encounter, seed), 'native', auditLimits).result);
    emit({ category, id, wearer, level, context, encounter: encounterLabel(encounter), seed, on, off });
    count++;
  }
  for (const piece of auditCatalog) for (const wearer of piece.eligible) for (const level of piece.levels)
    for (const context of ['isolated', 'supported'] as const) for (const encounter of auditEncounters)
      for (const seed of auditSeeds) sample('wearer-matrix', piece.id, wearer, level, context, encounter, seed);
  for (const piece of auditCatalog) for (const level of piece.levels)
    for (const { id: activity } of calamityActivities) for (const tier of [1, 2, 3] as const)
      for (const seed of auditSeeds)
        sample('all-calamity-patterns', piece.id, piece.eligible[0], level, 'supported',
          { kind: 'calamity', activity, tier }, seed);
  return count;
}

export function runStasisBattle(initial: BattleState, shieldFirst: boolean) {
  let state = initial, decisions = 0;
  const protectedTurns: Record<string, number[]> = {}, penaltyTurns: Record<string, number[]> = {};
  const trace: { round: number; actor: string; action: string; hp: number[]; shields: number[] }[] = [];
  let blockedHits = 0;
  function collect(events: BattleEvent[]) {
    for (const event of events) if (event.message.includes('[Stasis Reliquary]') && event.kind === 'status')
      blockedHits++;
    for (const unit of state.allies) {
      const n = gear(unit).numbers;
      if (n.stasisPenalty !== undefined && !(protectedTurns[unit.id] ?? []).includes(n.stasisPenalty - 1))
        (protectedTurns[unit.id] ??= []).push(n.stasisPenalty - 1);
      if (n.stasisPenalty !== undefined && !(penaltyTurns[unit.id] ?? []).includes(n.stasisPenalty))
        (penaltyTurns[unit.id] ??= []).push(n.stasisPenalty);
    }
  }
  while (state.phase === 'player' && decisions++ < auditLimits.decisions && state.round < auditLimits.rounds) {
    const ready = state.allies.filter(unit => unit.hp > 0 &&
      (['light', 'skill1', 'skill2', 'ultimate'] as ActionId[]).some(action => !actionUnavailable(state, unit, action)));
    const actor = ready.find(unit => shieldFirst && unit.definitionId === 'tide') ?? ready[0];
    if (!actor) {
      const step = endTurn(state); state = step.state; collect(step.events); continue;
    }
    const priorities: ActionId[] = shieldFirst && actor.definitionId === 'tide'
      ? ['ultimate', 'skill2', 'light'] : benchmarkPriorities(state, actor);
    const choice = priorities.map(action => ({ action, target: benchmarkTarget(state, actor, action) }))
      .find(({ action, target }) => !actionUnavailable(state, actor, action, target));
    if (!choice) throw new Error('Stasis pilot has no legal action.');
    trace.push({ round: state.round, actor: actor.id, action: choice.action,
      hp: state.allies.map(unit => unit.hp), shields: state.allies.map(unit => unit.shield) });
    const step = actAndAdvanceTurn(state, actor.id, choice.action, choice.target);
    state = step.state; collect(step.events);
  }
  return { outcome: state.phase === 'cleared' ? 'win' : state.phase === 'defeat' ? 'defeat' : 'timeout',
    rounds: state.round, decisions, enemyRemaining: state.enemies.reduce((sum, unit) => sum + unit.hp / unit.stats.health, 0),
    hp: state.allies.map(unit => unit.hp), protectedTurns, penaltyTurns, blockedHits, trace };
}

export function stasisPacketProbe(level: number) {
  const state = auditBattle('stasis-reliquary', 'tide', level, 'isolated', true, auditEncounters[0], 1729);
  const owner = state.allies[0], enemy = state.enemies[0], results = [];
  owner.stats = { ...owner.stats, health: 1_000_000, defense: 0, damage: 100, crit: 0 };
  owner.hp = 1_000_000;
  for (let round = 1; round <= 8; round++) {
    state.round = round;
    nativeShield(state, owner, owner, 1, []);
    const before = owner.hp, events: BattleEvent[] = [];
    conduitIncoming(state, enemy, owner, 100, false, false, events);
    conduitIncoming(state, enemy, owner, 100, false, false, events);
    results.push({ round, hpLoss: before - owner.hp, shield: owner.shield,
      protected: gear(owner).numbers.stasisPenalty === round + 1,
      penalty: gear(owner).numbers.stasisPenalty === round,
      messages: events.map(event => event.message) });
  }
  return results;
}

export function runStasisAudit(emit: (row: unknown) => void) {
  for (const level of [0, 5]) emit({ category: 'stasis-packets', level, turns: stasisPacketProbe(level) });
  const extras: ConduitId[][] = [[], ['pale-bulwark-diadem'], ['lifeline-flywheel'], ['pale-bulwark-diadem', 'lifeline-flywheel'],
    ['granite-hourglass'], ['granite-hourglass', 'pale-bulwark-diadem'],
    ['granite-hourglass', 'verdict-caliper', 'fieldbrace-coupler'],
    ['granite-hourglass', 'verdict-caliper', 'fieldbrace-coupler', 'immortal-vessel']];
  for (const wearer of ['tide', 'bruno', 'thornia', 'razor', 'ember', 'sprout'] as StarterId[])
    for (const extra of extras) for (const context of ['isolated', 'supported'] as const)
      for (const level of [0, 5]) for (const encounter of auditEncounters)
      for (const seed of auditSeeds) for (const policy of ['native', 'shield-first'] as const) {
        // A shield provider is always present; this is a legal full-team probe, not injected Gauge.
        const on = auditBattle('stasis-reliquary', wearer, level, context, true, encounter, seed, extra);
        const off = auditBattle('stasis-reliquary', wearer, level, context, false, encounter, seed, extra);
        emit({ category: 'stasis-native', wearer, extra, context, level, encounter: encounterLabel(encounter), seed, policy,
          on: runStasisBattle(on, policy === 'shield-first'), off: runStasisBattle(off, policy === 'shield-first') });
      }
}

export function runSynergyAudit(emit: (row: unknown) => void) {
  const scenarios: { id: ConduitId; roster: StarterId[] }[] = [
    { id: 'ominous-nightglass-archive', roster: ['thornia', 'crinso', 'disciple'] },
    { id: 'firstlight-cam', roster: ['rosetta', 'bliss', 'aurora'] },
    { id: 'chaotic-ouroboros-core', roster: ['thornia', 'crinso', 'disciple'] },
    { id: 'glassroot-gimbal', roster: ['ember', 'tide', 'sprout'] },
  ];
  for (const scenario of scenarios) for (const stacks of [1, 3]) {
    const profile = loadout(scenario.roster, 'mixed5');
    const masters = Object.fromEntries(scenario.roster.map(id =>
      [id, masterConduits.find(piece => piece.character === id && piece.id.endsWith('-1'))!.id]));
    for (const wearer of scenario.roster) {
      const retained = profile.equipment[wearer]!.filter((piece): piece is ConduitId => piece !== null && piece !== scenario.id).slice(0, 7);
      profile.equipment[wearer] = [...retained, ...Array<null>(8 - retained.length).fill(null)];
    }
    profile.upgrades[scenario.id] = 5;
    for (const { id: activity } of calamityActivities) for (const tier of [1, 2, 3] as const) for (const seed of auditSeeds) {
      const make = (on: boolean) => {
        const equipment = structuredClone(profile.equipment);
        for (const [index, wearer] of scenario.roster.entries()) {
          if (on && index < stacks) equipment[wearer]![7] = scenario.id;
          validateConduitElement(validateConduitSlots(equipment[wearer]), getStarter(wearer).elementId);
        }
        const progress = progressAt(105), team = Object.fromEntries(scenario.roster.map(id => [id, progress]));
        return withMasterLoadouts(createCalamityBattle(activity, tier, seed, scenario.roster[0], progress,
          scenario.roster, team, equipment, [], profile.upgrades), masters);
      };
      const on = make(true), off = make(false);
      emit({ category: 'stacked-synergy', id: scenario.id, roster: scenario.roster, stacks, level: 5, seed,
        encounter: `Calamity ${activity} EX+${tier}`, onStats: on.allies.map(unit => unit.stats),
        offStats: off.allies.map(unit => unit.stats),
        on: compact(measureBattle(on).result), off: compact(measureBattle(off).result) });
    }
  }
}

export function runWinningAudit(rows: (Omit<AuditRow, 'on' | 'off'> & {
  on: Pick<Outcome, 'outcome'>; off: Pick<Outcome, 'outcome'>;
})[], emit: (row: unknown) => void) {
  for (const row of rows) {
    const match = /^Calamity ([a-z]+) EX\+([123])$/.exec(row.encounter);
    if (!match) throw new Error('Winning replay expects a native Calamity fixture.');
    const encounter: Encounter = { kind: 'calamity', activity: match[1] as typeof calamityActivities[number]['id'],
      tier: Number(match[2]) as 1 | 2 | 3 };
    function replay(on: boolean) {
      let state = auditBattle(row.id, row.wearer, row.level, row.context, on, encounter, row.seed), decisions = 0;
      const initial = structuredClone(state), packets = [];
      while (state.phase === 'player' && decisions++ < auditLimits.decisions && state.round - initial.round < auditLimits.rounds) {
        const ready = state.allies.filter(unit => unit.hp > 0 &&
          (['light', 'skill1', 'skill2', 'ultimate'] as const).some(action => !actionUnavailable(state, unit, action)));
        const actor = ready.find(unit => unit.definitionId !== 'rosetta' || !unit.native?.quarry) ?? ready[0];
        const round = state.round;
        if (!actor) {
          const result = endTurn(state); state = result.state;
          packets.push({ round, actor: null, action: null, events: result.events });
        } else {
          const choice = benchmarkPriorities(state, actor).map(action => ({ action, target: benchmarkTarget(state, actor, action) }))
            .find(({ action, target }) => !actionUnavailable(state, actor, action, target));
          if (!choice) throw new Error('Winning replay pilot has no legal action.');
          const result = actAndAdvanceTurn(state, actor.id, choice.action, choice.target);
          state = result.state;
          packets.push({ round, actor: actor.id, action: choice.action, events: result.events });
        }
      }
      const outcome = state.phase === 'cleared' ? 'win' : state.phase === 'defeat' ? 'defeat' : 'timeout';
      if (outcome !== (on ? row.on.outcome : row.off.outcome)) throw new Error('Winning replay differs from primary outcome.');
      return { outcome, initial, final: state, packets };
    }
    emit({ category: 'winning-replay', id: row.id, wearer: row.wearer, level: row.level,
      context: row.context, encounter: row.encounter, seed: row.seed, on: replay(true), off: replay(false) });
  }
}
