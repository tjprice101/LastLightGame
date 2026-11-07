import { type ActionId } from '../content/combat';
import { damageAmount, roll, rollCritical, elementalCritFactor, type BattleEvent, type BattleState, type Combatant } from './battle';
import { scheduledEnemySkill } from '../content/enemy-skills';
import { debuffSnapshot } from './battle-debuffs';
import { nativeBalance } from '../content/native-balance';
import { exactDirectDamageIds } from '../content/native-identities';
import { phaseZeroStatsReady } from '../content/phase-zero-stats';
import { calamiticPower } from '../content/calamitic-conduits';
import { isCalamiticCharacter } from '../content/calamitic-characters';
import { afterCalamiticMark, calamiticSkillDefenseIgnore, calamiticSkillShieldBypass } from './calamitic-conduits';
import type { StatusArtId } from '../content/status-art';
import { applyConduitBurn, applyConduitWeaken, nativeGauge, nativeHeal, nativeShield,
  conduitBurnTick, afterConduitBurn, conduitActionTraits, conduitCriticalHit, recordConduitHit,
  timedConduitShield, gear, grantToken, equipped, value, nativeTargetDefense,
  generatedShield, generatedStrike, generatedHeal, generatedGaugePercent, finishNativeHealing, effectiveDefense, resetConduitBurnStreak, refreshConduitStats } from './conduit-runtime';

export interface NativeKitState {
  refusalUsed?: string[];
  fateMarks?: Record<string, { stacks: number; throughPhase: number }>;
  faults?: Record<string, number>;
  hymn?: { owner: string; throughRound: number; criticalDamage: number; skillPower: number };
  burns?: Record<string, { damage: number; turns: number }>;
  seeds?: Record<string, { fraction: number; dueRound: number; empowered?: boolean }>;
  cyclone?: { gusts: number; phases: number; contributors: Record<string, number>; skillPower?: number };
  blades?: [string | null, string | null];
  cover?: { targets: string[]; fraction: number; throughPhase: number };
  instruction?: { kind: 'strike' | 'shelter' | 'resolve'; owner: string; throughRound: number;
    damageBonus?: number; supportBonus?: number };
  seals?: Record<string, { fraction: number; throughPhase: number }>;
  ultimateWardThrough?: number;
  ultimateWardReduction?: number;
  wounds?: number;
  bastion?: { throughPhase: number; loss: number; skillPower?: number; skillDuration?: number };
  quarry?: { target: string; round: number; contributors: string[]; paidRound?: number; hits?: number };
  traps?: Record<string, { charges: number; coefficient: number; throughPhase: number; empowered?: boolean }>;
  combo?: number;
  edge?: 'gold' | 'crimson';
  survey?: { target: string; points: number };
  foundation?: { durability: number; maximum: number; throughPhase: number };
  beat?: 0 | 1 | 2;
  beatRound?: number;
  reduction?: { fraction: number; throughPhase: number };
  firstWard?: Record<string, { throughPhase: number }>;
  hostileReduction?: number;
  conduitGaugeTriggers?: string[];
  heat?: number;
  stillness?: number;
  tauntThrough?: number;
  burnBoostThrough?: number;
  defenseBuff?: { fraction: number; throughRound: number };
  season?: 'sprout' | 'bloom' | 'harvest';
  claim?: { target: string; throughPhase: number };
  guards?: Record<string, number>;
  unreturned?: number;
  load?: number;
  beacon?: number;
  severance?: number;
  promise?: number;
  interval?: number;
  reserve?: number;
  current?: number;
  tension?: number;
  cadence?: number;
  crosscut?: number;
  previousSkill?: 'skill1' | 'skill2';
  branches?: number;
  branchTarget?: string;
  faultCount?: number;
  faultTarget?: string;
  faultThroughPhase?: number;
  aftershock?: { target: string; amount: number; dueRound: number };
  momentum?: number;
  leadTarget?: string;
  path?: 'shelter' | 'flourish';
  intercept?: { targets: string[]; fraction: number; throughPhase: number };
  terms?: { target: string; throughPhase: number };
  accords?: Record<string, number>;
  accord?: { owner: string; throughRound: number };
  signal?: { owner: string; bonus: number; throughRound: number };
  moonflower?: { owner: string; bonus: number; throughRound: number };
  openRoute?: { owner: string; pierce: number; throughRound: number };
  ceasefire?: { owner: string; fraction: number; charges: number; throughPhase: number; reducedRound?: number };
  lead?: { owner: string; fraction: number; throughPhase: number };
  repair?: Record<string, { amount: number; dueRound: number }>;
  skillPowerBuff?: { owner: string; fraction: number; throughRound: number };
  actionStartedAt?: number;
}

export type NativeDamageKind = 'burn' | 'detonation' | 'cyclone' | 'recall' | 'revenge' | 'trap' | 'demolition' | 'redirect';
type Direct = (targets: Combatant[], coefficient: number, pierce?: number, criticalBonus?: number,
  preserveTargets?: boolean) => void;
const living = (state: BattleState) => state.allies.filter(unit => unit.hp > 0);
const foes = (state: BattleState) => state.enemies.filter(unit => unit.hp > 0);
export const hasNativeIdentity = (unit: Combatant): boolean => !unit.captured && unit.kit?.nativeIdentity === true;
export const nativeMemory = (unit: Combatant): NativeKitState => unit.native ??= {};

function status(state: BattleState, events: BattleEvent[], owner: Combatant, target: Combatant, message: string, amount = 0): void {
  events.push({ kind: 'status', source: owner.id, target: target.id, amount, critical: false, origin: 'native', message,
    ...(target.side === 'enemy' ? { debuffs: debuffSnapshot(target) } : {}) });
  attachNativeView(state, events[events.length - 1]);
}

/** Snapshot of every ally's native kit memory, attached to an event so battle playback can show statuses as they change. */
export interface NativeView { round: number; units: Record<string, NativeKitState> }

export function attachNativeView(state: BattleState, event: BattleEvent | undefined): void {
  if (!event || !state.allies.some(hasNativeIdentity)) return;
  const units: Record<string, NativeKitState> = {};
  for (const ally of state.allies) if (ally.native) units[ally.id] = structuredClone(ally.native);
  event.nativeView = { round: state.round, units };
}

function fixed(state: BattleState, owner: Combatant, target: Combatant, power: number, kind: NativeDamageKind, events: BattleEvent[],
  bypass = false, activation?: Parameters<typeof applyConduitBurn>[4], stored = true, origin: 'native' | 'conduit' = 'native'): number {
  if (owner.hp <= 0 || target.hp <= 0 || power <= 0) return 0;
  const hit = activation ? conduitCriticalHit(state, owner, target, activation) : undefined;
  const rolled = hit ?? rollCritical(state, owner.stats.crit);
  const { critical, elemental } = rolled;
  const criticalMultiplier = hit?.criticalMultiplier ??
    owner.stats.critMultiplier * (elemental ? elementalCritFactor : 1);
  let attack = kind === 'revenge' || kind === 'demolition' ? power : owner.stats.damage;
  let ignore = activation ? calamiticSkillDefenseIgnore(state, owner, activation.action) : 0;
  if (phaseZeroStatsReady && activation && hit) {
    const modifiers = hit.modifiers;
    ignore = modifiers.pierce;
    if (!stored) {
      power *= (activation.skillPower + modifiers.skillPowerBonus) * (1 + modifiers.bonus) *
        (owner.stats.damage > 0 ? modifiers.attack / owner.stats.damage : 1) * nativeInstructionDamage(state, owner);
      if (kind === 'revenge') attack = power;
      else attack = modifiers.attack;
    }
  }
  const flareDamage = activation?.action === 'ultimate' ? nativeBalance.lastFlare.damage : 1;
  const taken = kind === 'burn' || phaseZeroStatsReady && activation && !stored ? 1 : nativeDamageTakenMultiplier(state, owner, target, origin);
  const damage = bypass ? Math.round(power * flareDamage * taken * (critical ? criticalMultiplier : 1))
    : damageAmount(attack, power / attack * flareDamage * taken,
      nativeTargetDefense(state, target) * (1 - ignore), critical, criticalMultiplier);
  const shieldBypass = !bypass && activation ? calamiticSkillShieldBypass(state, owner, activation.action) : 0;
  const absorbed = Math.min(target.shield, damage - Math.floor(damage * shieldBypass));
  target.shield -= absorbed;
  const loss = Math.min(target.hp, damage - absorbed);
  target.hp -= loss;
  if (phaseZeroStatsReady && activation) {
    recordConduitHit(activation, target, loss, critical, criticalMultiplier, Math.max(0, damage - loss - absorbed), loss + absorbed);
    nativePrimaryHit(state, owner, target, loss > 0 || absorbed > 0, events);
  }
  events.push({ kind: 'damage', source: owner.id, target: target.id, amount: loss, critical, elementalCritical: elemental,
    origin, nativeKind: kind, periodic: kind === 'burn', shieldRemaining: target.shield, shieldAbsorbed: absorbed,
    debuffs: debuffSnapshot(target),
    message: `${owner.name}: ${kind} deals ${loss} damage to ${target.name}${elemental ? ' (Elemental Crit)' : critical ? ' (critical)' : ''}${absorbed ? ` (${absorbed} shield absorbed)` : ''}.` });
  return loss;
}

function seed(state: BattleState, owner: Combatant, target: Combatant, fraction: number, events: BattleEvent[],
  activation?: Parameters<typeof applyConduitBurn>[4], empowered = false, powerBonus = 0): void {
  if (phaseZeroStatsReady)
    fraction *= (activation?.skillPower ?? owner.stats.skillPower ?? 1) + (activation?.supportPowerBonus ?? 0) + powerBonus;
  else fraction *= nativeSupportMultiplier(state, owner);
  if (!phaseZeroStatsReady && equipped(owner, 'botanic-graft-covenant')) fraction *= 1 + value(state, owner, 'botanic-graft-covenant', .5, 1);
  const seeds = nativeMemory(owner).seeds ??= {};
  if ((seeds[target.id]?.fraction ?? 0) > fraction) return;
  seeds[target.id] = { fraction, dueRound: state.round + 1,
    ...(phaseZeroStatsReady && empowered ? { empowered: true } : {}) };
  status(state, events, owner, target, `${target.name} holds a ${fraction * 100}% Seed for the next player turn.`);
}

function seedPayoff(state: BattleState, owner: Combatant, target: Combatant, empowered: boolean): void {
  if (!phaseZeroStatsReady || !equipped(owner, 'master-sprout-1')) return;
  grantToken(state, target, 'seedSkillPower', .25);
  if (empowered) grantToken(state, target, 'seedSkillEfficiency', .15);
}

function releaseCyclone(state: BattleState, owner: Combatant, events: BattleEvent[], activation?: Parameters<typeof applyConduitBurn>[4]): void {
  const field = owner.native?.cyclone;
  if (!field) return;
  delete owner.native!.cyclone;
  let totalActualHpDamage = 0;
  for (const target of foes(state))
    totalActualHpDamage += fixed(state, owner, target,
      owner.stats.damage * (.7 + .3 * field.gusts) * (phaseZeroStatsReady ? field.skillPower ?? 1 : 1), 'cyclone', events, false, activation);
  if (phaseZeroStatsReady && equipped(owner, 'master-atmoso-1')) {
    const fraction = Math.min(.18, field.gusts * .03);
    for (const ally of living(state)) generatedGaugePercent(owner, ally, fraction, events, state);
  }
  if (phaseZeroStatsReady && equipped(owner, 'master-atmoso-2') && totalActualHpDamage > 0) {
    for (const ally of living(state)) {
      const shield = totalActualHpDamage * .3;
      timedConduitShield(state, owner, ally, shield, 'master-atmoso-2', state.round, events);
    }
  }
}

function recall(state: BattleState, owner: Combatant, events: BattleEvent[], activation?: Parameters<typeof applyConduitBurn>[4]): void {
  const blades = nativeMemory(owner).blades ??= [null, null];
  const targets = [...blades];
  for (const id of new Set(targets.filter((target): target is string => !!target))) {
    const enemy = state.enemies.find(unit => unit.id === id);
    if (enemy) delete gear(enemy).numbers[`eliseSkillPower:${owner.id}`];
  }
  blades[0] = blades[1] = null;
  for (const id of targets) {
    const target = state.enemies.find(enemy => enemy.id === id && enemy.hp > 0);
    if (target) fixed(state, owner, target, owner.stats.damage * .9, 'recall', events, false, activation, false);
  }
  if (targets[0] && targets[0] === targets[1]) {
    const target = state.enemies.find(enemy => enemy.id === targets[0] && enemy.hp > 0);
    if (target) fixed(state, owner, target, owner.stats.damage * .6, 'recall', events, false, activation, false);
  }
}

export function nativeInstructionDamage(state: BattleState, owner: Combatant): number {
  const instruction = owner.native?.instruction;
  return instruction && instruction.throughRound >= state.round && living(state).some(unit => unit.id === instruction.owner) &&
    instruction.kind !== 'shelter' ? 1 + (phaseZeroStatsReady ? instruction.damageBonus ?? .3 : .3) : 1;
}

export function nativeSupportMultiplier(state: BattleState, owner: Combatant): number {
  const instruction = owner.native?.instruction;
  const instructed = instruction && instruction.throughRound >= state.round && living(state).some(unit => unit.id === instruction.owner) &&
    instruction.kind !== 'strike' ? 1 + (phaseZeroStatsReady ? instruction.supportBonus ?? .35 : .35) : 1;
  const skillPowerBuff = owner.native?.skillPowerBuff;
  return instructed * (skillPowerBuff && skillPowerBuff.throughRound >= state.round &&
    living(state).some(unit => unit.id === skillPowerBuff.owner) ? 1 + skillPowerBuff.fraction : 1);
}

export function nativeDamageTakenMultiplier(state: BattleState, source: Combatant, target: Combatant, origin: 'native' | 'conduit' | 'periodic' = 'native'): number {
  if (source.side !== 'ally' || target.side !== 'enemy') return 1;
  let multiplier = 1;
  const weakenOwner = target.weakened > 0
    ? state.allies.find(owner => owner.id === target.weakenSourceId && equipped(owner, 'calamitic-ruinmark-censer'))
    : undefined;
  if (phaseZeroStatsReady && weakenOwner) multiplier *= 1 + calamiticPower(state.conduitUpgrades?.['calamitic-ruinmark-censer'] ?? 0, .1, .15);
  for (const owner of state.allies.filter(hasNativeIdentity)) {
    const mark = owner.native?.fateMarks?.[target.id];
    if (mark && mark.throughPhase >= state.round) multiplier *= (1 + .1 * mark.stacks) * 1.45;
    const faults = owner.native?.faults?.[target.id] ?? 0;
    multiplier *= 1 + .1 * faults;
    if (origin === 'native' && owner.hp > 0 && owner.native?.claim?.target === target.id && owner.native.claim.throughPhase >= state.round) multiplier *= 1.12;
  }
  return multiplier;
}

export function nativeHymn(unit: Combatant, round: number): NonNullable<NativeKitState['hymn']> | undefined {
  return unit.native?.hymn && unit.native.hymn.throughRound >= round ? unit.native.hymn : undefined;
}

export function nativeRefusal(state: BattleState, target: Combatant, loss: number, events: BattleEvent[]): number {
  if (target.side !== 'ally' || target.hp <= 0 || loss < target.hp) return loss;
  const owner = living(state).find(unit => hasNativeIdentity(unit) && unit.definitionId === 'ozriel' &&
    !unit.native?.refusalUsed?.includes(target.id));
  if (!owner) return loss;
  (nativeMemory(owner).refusalUsed ??= []).push(target.id);
  status(state, events, owner, target, `${target.name}: Refusal used; remains at 1 HP (once per encounter).`);
  if (equipped(owner, 'master-ozriel-1')) nativeShield(state, owner, target, target.stats.health * .2, events, { stack: true });
  return Math.max(0, target.hp - 1);
}

export function nativeHeatCap(owner: Combatant): number {
  return equipped(owner, 'master-caldrex-1') ? 5 : 3;
}

function phase2CounterCap(owner: Combatant, master: 1): number {
  if (owner.definitionId === 'neralis') return equipped(owner, 'master-neralis-1') ? 4 : 3;
  if (owner.definitionId === 'varkhel') return equipped(owner, 'master-varkhel-1') ? 5 : 4;
  if (owner.definitionId === 'seravelle') return equipped(owner, 'master-seravelle-1') ? 4 : 3;
  if (owner.definitionId === 'velmira') return equipped(owner, 'master-velmira-1') ? 4 : 3;
  return master;
}

function guardOnce(owner: Combatant, key: string, round: number): boolean {
  const guards = nativeMemory(owner).guards ??= {};
  if (guards[key] === round) return false;
  guards[key] = round;
  return true;
}

const moonSunshadeIdentities = new Set([
  'maerion', 'caevren', 'vespera', 'ilyss', 'asteriel', 'serapha',
  'rhaziel', 'oryn', 'thessara', 'elaris', 'veyr', 'aureth',
]);
function isMoonSunshadeIdentity(id: string): boolean { return moonSunshadeIdentities.has(id); }

function lowestHealthAlly(state: BattleState): Combatant | undefined {
  return living(state).sort((a, b) => a.hp / a.stats.health - b.hp / b.stats.health)[0];
}

function maerionHeal(state: BattleState, owner: Combatant, target: Combatant, offer: number,
  events: BattleEvent[], activation: Parameters<typeof applyConduitBurn>[4]): number {
  const before = target.hp;
  const restored = nativeHeal(state, owner, target, offer, events, true, activation);
  if (equipped(owner, 'master-maerion-3') && before < target.stats.health * .5 &&
      target.hp >= target.stats.health * .5 && guardOnce(owner, `triage:${target.id}`, state.round))
    generatedGaugePercent(owner, target, .15, events, state);
  return restored;
}

function eventDirectModifiers(state: BattleState, attacker: Combatant, target: Combatant, action: ActionId): { bonus: number; pierce: number } {
  if (action === 'light') return { bonus: 0, pierce: 0 };
  let bonus = 0, pierce = 0;
  const signal = attacker.native?.signal;
  const signalOwner = signal && living(state).find(unit => unit.id === signal.owner && unit.definitionId === 'vespera');
  if (signal && signal.throughRound >= state.round && signalOwner) {
    bonus += signal.bonus;
    if (equipped(signalOwner, 'master-vespera-2') && target.burn.sourceId === signalOwner.id && target.burn.turns > 0) pierce += .15;
  }
  const moonflower = attacker.native?.moonflower;
  if (moonflower && moonflower.throughRound >= state.round &&
      living(state).some(unit => unit.id === moonflower.owner && unit.definitionId === 'asteriel'))
    bonus += moonflower.bonus;
  const route = attacker.native?.openRoute;
  if (route && route.throughRound >= state.round &&
      living(state).some(unit => unit.id === route.owner && unit.definitionId === 'elaris')) pierce += route.pierce;
  for (const owner of living(state).filter(unit => unit.definitionId === 'oryn')) {
    if (owner.native?.terms?.target !== target.id || owner.native.terms.throughPhase < state.round ||
        (owner.native.accords?.[attacker.id] ?? -1) < state.round ||
        (owner.native.guards?.[`accord:${state.round}`] ?? -1) === state.round) continue;
    bonus += equipped(owner, 'master-oryn-1') ? .5 : .3;
  }
  return { bonus: Math.min(1.5, bonus), pierce: Math.min(.8, pierce) };
}

function setIntercept(owner: Combatant, targets: readonly Combatant[], fraction: number, throughPhase: number): void {
  nativeMemory(owner).intercept = { targets: targets.map(target => target.id), fraction, throughPhase };
}

export type CleanseChoice = 'burn' | 'weaken';

function cleanseOne(target: Combatant, choice?: CleanseChoice): boolean {
  if (choice !== 'weaken' && target.burn.turns > 0) {
    target.burn = { damage: 0, turns: 0, sourceId: '', origin: 'native' };
    return true;
  }
  if (choice !== 'burn' && target.weakened > 0) {
    target.weakened = 0;
    target.weakenFraction = 0;
    delete target.weakenSourceId;
    delete target.weakenOrigin;
    return true;
  }
  return false;
}

function changeCultivationPath(state: BattleState, owner: Combatant, path: NonNullable<NativeKitState['path']>, events: BattleEvent[]): void {
  const memory = nativeMemory(owner);
  if (memory.path && memory.path !== path)
    memory.promise = Math.min(3, (memory.promise ?? 0) + 1);
  memory.path = path;
  status(state, events, owner, owner, `${owner.name}: ${path === 'shelter' ? 'Shelter' : 'Flourish'} path${memory.promise ? ` · Promise ${memory.promise}/3` : ''}.`);
}

function setMoonflower(owner: Combatant, target: Combatant, bonus: number, throughRound: number): void {
  target.native ??= {};
  target.native.moonflower = { owner: owner.id, bonus, throughRound };
}

function gainReserve(owner: Combatant): void {
  const memory = nativeMemory(owner);
  memory.reserve = Math.min(equipped(owner, 'master-thessara-1') ? 5 : 4, (memory.reserve ?? 0) + 1);
}

function setBranches(state: BattleState, owner: Combatant, target: Combatant, amount: number, events: BattleEvent[]): void {
  const memory = nativeMemory(owner);
  const current = memory.branchTarget === target.id ? memory.branches ?? 0 : 0;
  memory.branchTarget = target.id;
  memory.branches = Math.min(equipped(owner, 'master-elaris-1') ? 4 : 3, current + amount);
  status(state, events, owner, target, `${target.name}: Branch ${memory.branches}/${equipped(owner, 'master-elaris-1') ? 4 : 3}.`);
}

function setVeyrFault(state: BattleState, owner: Combatant, target: Combatant, count: number, events: BattleEvent[]): void {
  const memory = nativeMemory(owner);
  memory.faultTarget = target.id;
  memory.faultCount = Math.min(equipped(owner, 'master-veyr-1') ? 4 : 3, count);
  memory.faultThroughPhase = state.round + 2;
  status(state, events, owner, target, `${target.name}: Fault ${memory.faultCount}/${equipped(owner, 'master-veyr-1') ? 4 : 3} · Defense −${Math.min(40, memory.faultCount * 8)}% through enemy phase ${memory.faultThroughPhase}.`);
}

function moveLead(owner: Combatant, target: Combatant, state: BattleState, phases: number): void {
  const memory = nativeMemory(owner);
  const moved = memory.leadTarget !== target.id;
  if (moved && memory.leadTarget && guardOnce(owner, 'momentum', state.round))
    memory.momentum = Math.min(equipped(owner, 'master-aureth-1') ? 4 : 3, (memory.momentum ?? 0) + 1);
  memory.leadTarget = target.id;
  target.native ??= {};
  target.native.lead = { owner: owner.id, fraction: equipped(owner, 'master-aureth-2') ? .3 : .2,
    throughPhase: state.round + phases };
}

export function nativeTrace(state: BattleState, _owner: Combatant, chance: number): boolean {
  return roll(state) < chance;
}

export function nativeDefenseBonus(state: BattleState, unit: Combatant, baseDefense: number): number {
  if (unit.side !== 'ally' || unit.hp <= 0) return 0;
  let bonus = 0;
  if (hasNativeIdentity(unit) && unit.definitionId === 'caevren' && equipped(unit, 'master-caevren-1'))
    bonus += .1 * (unit.native?.load ?? 0);
  if (hasNativeIdentity(unit) && unit.definitionId === 'caldrex' && equipped(unit, 'master-caldrex-1'))
    bonus += .12 * (unit.native?.heat ?? 0);
  if (hasNativeIdentity(unit) && unit.definitionId === 'varkhel' && equipped(unit, 'master-varkhel-1'))
    bonus += .1 * (unit.native?.tension ?? 0);
  const buff = unit.native?.defenseBuff;
  if (buff && buff.throughRound >= state.round) bonus += buff.fraction;
  return bonus * baseDefense;
}

export function nativeTauntTarget(state: BattleState, enemy: Combatant): Combatant | undefined {
  const taunter = living(state).find(unit => hasNativeIdentity(unit) && (unit.native?.tauntThrough ?? -1) >= state.round);
  const owners = gear(enemy).owners;
  if (taunter) owners.nativeTaunt = taunter.id;
  else delete owners.nativeTaunt;
  return taunter;
}

function warEnemyHit(state: BattleState, enemy: Combatant, events: BattleEvent[]): void {
  let start = events.length - 1;
  while (start >= 0 && !(events[start].kind === 'attack' && events[start].source === enemy.id)) start--;
  const strikes = events.slice(start + 1).filter(entry => entry.kind === 'damage' && entry.source === enemy.id && !entry.periodic &&
    entry.origin !== 'conduit' && entry.nativeKind !== 'redirect' && !entry.message.includes('Conduit routing') && (entry.amount > 0 || (entry.shieldAbsorbed ?? 0) > 0));
  for (const owner of living(state).filter(unit => hasNativeIdentity(unit) && unit.definitionId === 'caldrex')) {
    if (!strikes.some(entry => entry.target === owner.id)) continue;
    const memory = nativeMemory(owner);
    if ((memory.heat ?? 0) < nativeHeatCap(owner) && guardOnce(owner, 'heat', state.round)) {
      memory.heat = (memory.heat ?? 0) + 1;
      status(state, events, owner, owner, `${owner.name} banks Heat ${memory.heat}/${nativeHeatCap(owner)}.`);
    }
    if (equipped(owner, 'master-caldrex-2') && (memory.tauntThrough ?? -1) >= state.round && gear(enemy).owners.nativeTaunt === owner.id)
      fixed(state, owner, enemy, owner.stats.damage * .9, 'revenge', events, false, undefined, true, 'conduit');
  }
  for (const owner of living(state).filter(unit => hasNativeIdentity(unit) && unit.definitionId === 'varkhel')) {
    if (!strikes.some(entry => entry.target === owner.id &&
        (entry.amount > 0 || (entry.shieldAbsorbed ?? 0) > 0))) continue;
    if ((owner.native?.tension ?? 0) >= phase2CounterCap(owner, 1) ||
        !guardOnce(owner, 'tension', state.round)) continue;
    owner.native!.tension = (owner.native?.tension ?? 0) + 1;
    status(state, events, owner, owner, `${owner.name} banks Tension ${owner.native!.tension}/${phase2CounterCap(owner, 1)}.`);
  }
}

export function nativeAction(state: BattleState, owner: Combatant, action: ActionId, targetId: string,
  events: BattleEvent[], direct: Direct, activation: Parameters<typeof applyConduitBurn>[4], cleanseChoice?: CleanseChoice): void {
  const memory = nativeMemory(owner);
  memory.actionStartedAt = events.length;
  if (action !== 'light' && owner.definitionId === 'asteriel' && equipped(owner, 'master-asteriel-1'))
    activation.skillPower += (memory.promise ?? 0) * .05;
  const target = state.enemies.find(enemy => enemy.id === targetId && enemy.hp > 0);
  const ally = state.allies.find(unit => unit.id === targetId && unit.hp > 0);
  const calamitic = isCalamiticCharacter(owner.definitionId);
  const warExact = (exactDirectDamageIds as readonly string[]).includes(owner.definitionId);
  const flareDamage = action === 'ultimate' && !calamitic && !warExact ? nativeBalance.lastFlare.damage : 1;
  const flareSupport = action === 'ultimate' && !warExact ? nativeBalance.lastFlare.support : 1;
  const hit = (coefficient: number, all = false, pierce = 0, crit = 0, chosen = target, preserveTargets = false) => {
    const targets = all ? foes(state) : chosen ? [chosen] : [];
    const modifiers = targets.map(enemy => eventDirectModifiers(state, owner, enemy, action));
    const bonus = modifiers.reduce((highest, current) => Math.max(highest, current.bonus), 0);
    const extraPierce = modifiers.reduce((highest, current) => Math.max(highest, current.pierce), 0);
    direct(targets, coefficient * (action === 'light' || calamitic || warExact ? 1 : nativeBalance.skillDamageScale) *
      flareDamage * (1 + bonus), Math.min(1, (pierce + extraPierce) * flareSupport),
      Math.min(1, crit * flareSupport), preserveTargets);
  };
  const allies = living(state);
  const other = allies.filter(unit => unit.id !== owner.id);
  const acted = other.filter(unit => unit.spent).length;
  const posture = acted === 0 ? 'opening' : acted === other.length ? 'closing' : 'passing';
  const shield = (recipient: Combatant, fraction: number, firstReduction = 0) =>
    nativeShield(state, owner, recipient, recipient.stats.health * fraction, events,
      { firstReduction, skillPower: activation.skillPower, activation, stack: true });
  const burn = (recipient: Combatant, fraction: number) => {
    const burns = memory.burns ??= {};
    const previous = burns[recipient.id];
    const damage = applyConduitBurn(state, owner, recipient, owner.stats.damage * fraction, activation);
    burns[recipient.id] = { damage: Math.max(previous?.damage ?? 0, damage),
      turns: 3 + activation.skillDuration + (phaseZeroStatsReady && equipped(owner, 'flare-focusing-iris') ? 1 : 0) };
    recipient.burn = { ...burns[recipient.id], sourceId: owner.id, origin: 'native' };
    resetConduitBurnStreak(owner, recipient);
    status(state, events, owner, recipient, `${recipient.name}: Burn from ${owner.name}, ${burns[recipient.id].damage} per phase for ${burns[recipient.id].turns} phases.`);
  };
  if (action === 'light') {
    hit(1);
    if (owner.definitionId === 'nerithe' && target?.hp) {
      memory.survey = { target: target.id, points: memory.survey?.target === target.id ? memory.survey.points + 1 : 1 };
    }
    if (!isMoonSunshadeIdentity(owner.definitionId)) return;
  }
  switch (owner.definitionId) {
    case 'maerion': {
      if (action === 'skill1') {
        hit(2);
        const recipient = lowestHealthAlly(state);
        if (recipient) maerionHeal(state, owner, recipient, recipient.stats.health * .25, events, activation);
      } else if (action === 'skill2') {
        const amount = memory.unreturned ?? 0;
        memory.unreturned = 0;
        if (ally) {
          const offer = ally.stats.health * .45 + amount;
          const priorOverheal = activation.overheal;
          maerionHeal(state, owner, ally, offer, events, activation);
          const overheal = Math.max(0, activation.overheal - priorOverheal);
          if (equipped(owner, 'master-maerion-2') && overheal > 0) {
            const existing = nativeShield(state, owner, ally, Math.min(overheal, ally.stats.health * .35), events,
              { skillPower: activation.skillPower, activation, stack: true });
            if (existing > 0) status(state, events, owner, ally, `${ally.name}: Maerion's healing overflow becomes Shield.`, existing);
          }
        }
      } else if (action === 'ultimate') {
        const amount = memory.unreturned ?? 0;
        memory.unreturned = 0;
        for (const recipient of allies)
          maerionHeal(state, owner, recipient, recipient.stats.health * .7 + amount / Math.max(1, allies.length), events, activation);
      }
      finishNativeHealing(state, owner, activation, events);
      break;
    }
    case 'caevren':
      if (action === 'skill1') {
        hit(2.8);
        memory.tauntThrough = state.round + activation.skillDuration;
      } else if (action === 'skill2' && ally) {
        const fraction = equipped(owner, 'master-caevren-2') ? .55 : .3;
        shield(ally, fraction);
        setIntercept(owner, [ally], equipped(owner, 'master-caevren-2') ? .55 : .3, state.round + 2 + activation.skillDuration);
      } else if (action === 'ultimate') {
        const spent = memory.load ?? 0;
        memory.load = 0;
        activation.spent.load = spent;
        shield(owner, .6 + .12 * spent);
        setIntercept(owner, other, .3, state.round + 2 + activation.skillDuration);
      }
      break;
    case 'vespera':
      if (action === 'skill1') {
        hit(2.2);
        if (target?.hp) burn(target, equipped(owner, 'master-vespera-2') ? .25 * 1.3 : .25);
      } else if (action === 'skill2' && ally) {
        ally.native ??= {};
        ally.native.signal = { owner: owner.id, bonus: equipped(owner, 'master-vespera-1') ? .5 : .35,
          throughRound: state.round + 1 + activation.skillDuration };
        status(state, events, owner, ally, `${ally.name}: Signal is ready for their next damaging Skill or Last Flare.`);
      } else if (action === 'ultimate') {
        const spent = memory.beacon ?? 0;
        memory.beacon = 0;
        activation.spent.beacon = spent;
        hit(4.8, true);
        for (const recipient of other) {
          recipient.native ??= {};
          recipient.native.signal = { owner: owner.id, bonus: .5 + .1 * spent,
            throughRound: state.round + 1 + activation.skillDuration };
        }
      }
      break;
    case 'ilyss':
      if (action === 'skill1') {
        hit(2.2);
        if (target?.hp) applyConduitWeaken(state, owner, target, .25, events, action, 2, activation);
      } else if (action === 'skill2' && ally) {
        nativeHeal(state, owner, ally, ally.stats.health * .45, events, true, activation);
        if (cleanseOne(ally, cleanseChoice)) {
          const amount = equipped(owner, 'master-ilyss-1') ? 4 : 3;
          if (guardOnce(owner, 'severance', state.round)) memory.severance = Math.min(amount, (memory.severance ?? 0) + 1);
          if (equipped(owner, 'master-ilyss-2') && guardOnce(owner, `cleanse-shield:${ally.id}`, state.round))
            shield(ally, .15);
          if (equipped(owner, 'master-ilyss-3'))
            ally.native = { ...ally.native, skillPowerBuff: { owner: owner.id, fraction: .25,
              throughRound: state.round + 2 + activation.skillDuration } };
        }
      } else if (action === 'ultimate') {
        const spent = memory.severance ?? 0;
        memory.severance = 0;
        activation.spent.severance = spent;
        const fraction = .65 + spent * (equipped(owner, 'master-ilyss-1') ? .13 : .1);
        for (const recipient of allies) {
          nativeHeal(state, owner, recipient, recipient.stats.health * fraction, events, true, activation);
          if (cleanseOne(recipient)) {
            if (guardOnce(owner, 'severance', state.round))
              memory.severance = Math.min(equipped(owner, 'master-ilyss-1') ? 4 : 3, (memory.severance ?? 0) + 1);
            if (equipped(owner, 'master-ilyss-2') && guardOnce(owner, `cleanse-shield:${recipient.id}`, state.round))
              shield(recipient, .15);
          }
        }
      }
      finishNativeHealing(state, owner, activation, events);
      break;
    case 'asteriel':
      if (action === 'skill1') {
        changeCultivationPath(state, owner, 'shelter', events);
        for (const recipient of allies) shield(recipient, .25);
        if (equipped(owner, 'master-asteriel-2') && guardOnce(owner, 'cultivation-heal', state.round)) {
          const recipient = lowestHealthAlly(state);
          if (recipient) nativeHeal(state, owner, recipient, recipient.stats.health * .2, events, true, activation);
        }
      } else if (action === 'skill2') {
        changeCultivationPath(state, owner, 'flourish', events);
        for (const recipient of allies) setMoonflower(owner, recipient, .3, state.round + 1 + activation.skillDuration);
      } else if (action === 'ultimate') {
        const spent = memory.promise ?? 0;
        memory.promise = 0;
        activation.spent.promise = spent;
        if (memory.path !== 'flourish') {
          for (const recipient of allies) shield(recipient, .45 + .08 * spent);
        } else {
          for (const recipient of allies) setMoonflower(owner, recipient, .5 + .1 * spent,
            state.round + 1 + activation.skillDuration);
        }
      }
      break;
    case 'serapha':
      if (action === 'skill1') {
        hit(2.4);
        if (target?.hp) applyConduitWeaken(state, owner, target, .2, events, action, 2, activation);
      } else if (action === 'skill2' || action === 'ultimate') {
        const spent = action === 'ultimate' ? memory.interval ?? 0 : 0;
        if (action === 'ultimate') {
          memory.interval = 0;
          activation.spent.interval = spent;
        }
        const healFraction = action === 'skill2' ? .3 : .7 + (equipped(owner, 'master-serapha-1') ? .05 : 0) * spent;
        const reduction = action === 'ultimate' ? .2 + .05 * spent : .2;
        const through = state.round + (action === 'ultimate' ? 2 : 1) + activation.skillDuration;
        for (const recipient of allies) {
          nativeHeal(state, owner, recipient, recipient.stats.health * healFraction, events, true, activation);
          recipient.native ??= {};
          recipient.native.ceasefire = { owner: owner.id, fraction: reduction, charges: 1, throughPhase: through };
        }
        finishNativeHealing(state, owner, activation, events);
      }
      break;
    case 'rhaziel':
      if (action === 'skill1' && ally) shield(ally, .35);
      else if (action === 'skill2' || action === 'ultimate') {
        const healing = action === 'skill2' ? .2 : .45;
        const shielding = action === 'skill2' ? .2 : .55;
        for (const recipient of allies) {
          nativeHeal(state, owner, recipient, recipient.stats.health * healing, events, true, activation);
          shield(recipient, shielding);
        }
        finishNativeHealing(state, owner, activation, events);
      }
      break;
    case 'oryn':
      if (action === 'skill1') {
        hit(2.4);
        if (target?.hp) {
          memory.terms = { target: target.id, throughPhase: state.round + 2 + activation.skillDuration };
          applyConduitWeaken(state, owner, target, .25, events, action, 2, activation);
        }
      } else if (action === 'skill2' && ally) {
        memory.accords = { [ally.id]: state.round + 2 + activation.skillDuration };
        ally.native ??= {};
        ally.native.defenseBuff = { fraction: .3, throughRound: state.round + 2 + activation.skillDuration };
        ally.native.accord = { owner: owner.id, throughRound: state.round + 2 + activation.skillDuration };
        if (equipped(owner, 'master-oryn-2')) shield(ally, .25);
      } else if (action === 'ultimate') {
        for (const enemy of foes(state)) {
          applyConduitWeaken(state, owner, enemy, .3, events, action, 2, activation);
          if (memory.terms?.target === enemy.id) memory.terms.throughPhase = state.round + 2 + activation.skillDuration;
        }
        memory.accords = Object.fromEntries(allies.map(member => [member.id, state.round + 2 + activation.skillDuration]));
        for (const recipient of allies) {
          recipient.native ??= {};
          recipient.native.defenseBuff = { fraction: .2, throughRound: state.round + 2 + activation.skillDuration };
          recipient.native.accord = { owner: owner.id, throughRound: state.round + 2 + activation.skillDuration };
        }
      }
      break;
    case 'thessara':
      if (action === 'skill1') {
        hit(2.4);
        if (target?.hp) gainReserve(owner);
      } else if (action === 'skill2' && ally) {
        const spent = memory.reserve ?? 0;
        memory.reserve = 0;
        activation.spent.reserve = spent;
        nativeHeal(state, owner, ally, ally.stats.health * (.2 + spent * (equipped(owner, 'master-thessara-1') ? .12 : .1)),
          events, true, activation);
        nativeGauge(state, ally, spent * (equipped(owner, 'master-thessara-3') ? 10 : 8), events);
        if (equipped(owner, 'master-thessara-2')) shield(ally, .2 + .03 * spent);
        finishNativeHealing(state, owner, activation, events);
      } else if (action === 'ultimate') {
        const spent = memory.reserve ?? 0;
        memory.reserve = 0;
        activation.spent.reserve = spent;
        for (const recipient of allies) {
          nativeHeal(state, owner, recipient, recipient.stats.health * (.5 + .05 * spent), events, true, activation);
          if (recipient.id !== owner.id) nativeGauge(state, recipient, spent * (equipped(owner, 'master-thessara-3') ? 8 : 6), events);
        }
        finishNativeHealing(state, owner, activation, events);
      }
      break;
    case 'elaris':
      if (action === 'skill1') {
        hit(2.8);
        if (target?.hp) setBranches(state, owner, target, equipped(owner, 'master-elaris-2') ? 2 : 1, events);
      } else if (action === 'skill2' && target) {
        const spent = memory.branches ?? 0;
        memory.branches = 0;
        activation.spent.branches = spent;
        const marked = foes(state).find(enemy => enemy.id === memory.branchTarget);
        for (const enemy of foes(state)) hit(2.4, false, enemy === marked ? spent * .08 : 0, 0, enemy, true);
        if (equipped(owner, 'master-elaris-3')) for (const recipient of other) {
          recipient.native ??= {};
          recipient.native.openRoute = { owner: owner.id, pierce: .15, throughRound: state.round + 1 + activation.skillDuration };
        }
      } else if (action === 'ultimate' && target) {
        const spent = memory.branchTarget === target.id ? memory.branches ?? 0 : 0;
        memory.branches = 0;
        activation.spent.branches = spent;
        hit(10.5 + (memory.branchTarget === target.id ? .9 * spent : 0), false,
          memory.branchTarget === target.id ? .1 * spent : 0);
        if (equipped(owner, 'master-elaris-3')) for (const recipient of other) {
          recipient.native ??= {};
          recipient.native.openRoute = { owner: owner.id, pierce: .15, throughRound: state.round + 1 + activation.skillDuration };
        }
      }
      break;
    case 'veyr':
      if (action === 'skill1') {
        hit(3.2);
        if (target?.hp) setVeyrFault(state, owner, target, (memory.faultTarget === target.id ? memory.faultCount ?? 0 : 0) + 1, events);
      } else if (action === 'skill2' && target) {
        const spent = memory.faultTarget === target.id ? memory.faultCount ?? 0 : 0;
        memory.faultCount = 0;
        memory.faultThroughPhase = undefined;
        activation.spent.faults = spent;
        hit(2.4, true);
        if (memory.faultTarget === target.id && target.hp > 0) {
          if (spent > 0) {
            const start = events.length;
            hit(2 * spent, false, 0, 0, target, true);
            for (const event of events.slice(start)) if (event.kind === 'damage') event.nativeKind = 'demolition';
          }
          if (equipped(owner, 'master-veyr-2')) memory.aftershock = {
            target: target.id, amount: owner.stats.damage * spent, dueRound: state.round,
          };
        }
        if (equipped(owner, 'master-veyr-3')) for (const recipient of allies) shield(recipient, .05 * spent);
      } else if (action === 'ultimate' && target) {
        const spent = memory.faultTarget === target.id ? memory.faultCount ?? 0 : 0;
        memory.faultCount = 0;
        memory.faultThroughPhase = undefined;
        activation.spent.faults = spent;
        hit(10.5 + (memory.faultTarget === target.id ? 2 * spent : 0), false, 0, 0, target);
        if (equipped(owner, 'master-veyr-2') && memory.faultTarget === target.id && target.hp > 0)
          memory.aftershock = { target: target.id, amount: owner.stats.damage * spent, dueRound: state.round };
        if (equipped(owner, 'master-veyr-3')) for (const recipient of allies) shield(recipient, .05 * spent);
      }
      break;
    case 'aureth':
      if (action === 'skill1' && ally) {
        shield(ally, .35);
        moveLead(owner, ally, state, 2 + activation.skillDuration);
      } else if (action === 'skill2') {
        hit(2.4, true);
        moveLead(owner, owner, state, 1 + activation.skillDuration);
        memory.tauntThrough = state.round + activation.skillDuration;
      } else if (action === 'ultimate') {
        const spent = memory.momentum ?? 0;
        memory.momentum = 0;
        activation.spent.momentum = spent;
        for (const recipient of allies) {
          shield(recipient, .6 + (equipped(owner, 'master-aureth-1') ? .15 : .1) * spent);
          recipient.native ??= {};
          recipient.native.defenseBuff = { fraction: .1 * spent, throughRound: state.round + 2 + activation.skillDuration };
        }
        moveLead(owner, owner, state, 1 + activation.skillDuration);
        memory.tauntThrough = state.round + activation.skillDuration;
      }
      break;
    case 'ozriel':
      if (action === 'skill1') {
        hit(2.4);
        if (target?.hp) applyConduitWeaken(state, owner, target, .5, events, action, 2, activation);
        if (equipped(owner, 'master-ozriel-2')) for (const enemy of foes(state).filter(enemy => enemy.id !== target?.id))
          applyConduitWeaken(state, owner, enemy, .25, events, action, 1, activation);
      }
      if (action === 'ultimate') {
        hit(4.55, true);
        if (equipped(owner, 'master-ozriel-3') && memory.refusalUsed?.length) {
          const alive = new Set(allies.map(unit => unit.id));
          memory.refusalUsed = memory.refusalUsed.filter(id => !alive.has(id));
          status(state, events, owner, owner, 'Unfallen Continuum Worldengine: Refusal restored for every living squad member.');
        }
      }
      if (action === 'skill2' || action === 'ultimate') for (const recipient of allies)
        nativeShield(state, owner, recipient, action === 'skill2' ? 90 : 140, events,
          { skillPower: activation.skillPower, activation, stack: true });
      break;
    case 'ilvaris': {
      const mark = (enemy: Combatant, added: number) => {
        const marks = memory.fateMarks ??= {};
        const prior = marks[enemy.id];
        marks[enemy.id] = { stacks: Math.min(5, (prior && prior.throughPhase >= state.round ? prior.stacks : 0) + added),
          throughPhase: state.round + 1 + activation.skillDuration };
        status(state, events, owner, enemy, `${enemy.name}: Fate-seared Mark ${marks[enemy.id].stacks}/5; through enemy phase ${marks[enemy.id].throughPhase}.`);
        afterCalamiticMark(state, owner, enemy, events);
      };
      if (action === 'skill1') {
        hit(2.25);
        if (target?.hp) mark(target, equipped(owner, 'master-ilvaris-1') ? 2 : 1);
      }
      if (action === 'ultimate') {
        hit(4.4, true);
        if (equipped(owner, 'master-ilvaris-3')) for (const enemy of foes(state)) mark(enemy, 1);
      }
      if (action === 'skill2' || action === 'ultimate') {
        const power = activation.skillPower - (nativeHymn(owner, state.round)?.skillPower ?? 0) + (activation.supportPowerBonus ?? 0);
        for (const recipient of allies) {
          nativeHeal(state, owner, recipient, recipient.stats.health * (action === 'skill2' ? .35 : .5), events, true, activation);
          if (action === 'skill2') {
            nativeMemory(recipient).hymn = { owner: owner.id, throughRound: state.round + 1 + activation.skillDuration,
              criticalDamage: .45 * power, skillPower: .5 * power };
            status(state, events, owner, recipient, `${recipient.name}: Hymn of Broken Glass; Critical Damage +${45 * power}%, Skill Power +${50 * power}%; refresh, through player turn ${recipient.native!.hymn!.throughRound}.`);
            if (equipped(owner, 'master-ilvaris-2')) generatedGaugePercent(owner, recipient, .08, events, state);
          } else generatedGaugePercent(owner, recipient, .1, events, state);
        }
        finishNativeHealing(state, owner, activation, events);
      }
      break;
    }
    case 'kaelith': {
      const struck = (strike: () => void) => {
        const before = new Map(foes(state).map(enemy => [enemy.id, enemy.hp + enemy.shield]));
        strike();
        return foes(state).filter(enemy => enemy.hp + enemy.shield < (before.get(enemy.id) ?? 0));
      };
      const setFaults = (enemy: Combatant, count: number) => {
        const faults = memory.faults ??= {};
        faults[enemy.id] = Math.min(3, count);
        status(state, events, owner, enemy, `${enemy.name}: Fractalized Incision ${faults[enemy.id]}/3 (+${faults[enemy.id] * 10}% squad damage).`);
      };
      if (action === 'skill1') {
        const hits = struck(() => hit(4.56, true));
        if (equipped(owner, 'master-kaelith-2'))
          for (const enemy of hits) setFaults(enemy, (memory.faults?.[enemy.id] ?? 0) + 1);
      }
      if (action === 'skill2' && target) {
        const spent = memory.faults?.[target.id] ?? 0;
        hit(3.65 * (1 + .2 * spent), false, spent >= 3 && equipped(owner, 'master-kaelith-1') ? .4 : 0);
        if (memory.faults) delete memory.faults[target.id];
        status(state, events, owner, target, `${target.name}: Glass Meridian consumes ${spent} Fractalized Incision stacks; Fractalized Incision 0/3.`);
      }
      if (action === 'ultimate') {
        const hits = struck(() => hit(3.6, true));
        if (equipped(owner, 'master-kaelith-3')) for (const enemy of hits) setFaults(enemy, 3);
      }
      break;
    }
    case 'ember':
      if (action === 'skill1') { hit(1.6); if (target?.hp) burn(target, .25); }
      if (action === 'skill2') {
        hit(1.1, true);
        for (const enemy of foes(state).filter(enemy => phaseZeroStatsReady || !equipped(owner, 'master-ember-2') || enemy.id === targetId)) {
          const stored = memory.burns?.[enemy.id];
          if (!stored) continue;
          const conserved = !phaseZeroStatsReady && equipped(owner, 'master-ember-3');
          const ticks = Math.min(conserved ? 1 : 2, stored.turns);
          stored.turns -= ticks;
          activation.spent.ember = (activation.spent.ember ?? 0) + ticks;
          fixed(state, owner, enemy, stored.damage * ticks * (conserved ? 2 : 1), 'detonation', events, true, activation);
          if (enemy.burn.sourceId === owner.id) enemy.burn.turns = stored.turns;
        }
      }
      if (action === 'ultimate') {
        const focused = phaseZeroStatsReady && equipped(owner, 'master-ember-2');
        hit(2, !focused);
        for (const enemy of focused ? target && target.hp > 0 ? [target] : [] : foes(state))
          burn(enemy, .45 * flareDamage);
      }
      break;
    case 'tide':
      if (action === 'skill1') {
        hit(1.5);
        if (target?.hp) applyConduitWeaken(state, owner, target, .25, events, action, 1, activation);
      }
      if (action === 'skill2' && ally) shield(ally,
        nativeBalance.tizu.shelter * (!phaseZeroStatsReady && equipped(owner, 'master-tide-2') ? 3 : 1));
      if (action === 'ultimate') for (const recipient of allies) shield(recipient, nativeBalance.tizu.oceanMemory, .3 * flareSupport);
      break;
    case 'sprout':
      if (action === 'skill1') {
        hit(1.4);
        const recipients = phaseZeroStatsReady && equipped(owner, 'master-sprout-2') ? allies
          : [[...allies].sort((a, b) => a.hp / a.stats.health - b.hp / b.stats.health)[0]].filter((unit): unit is Combatant => !!unit);
        for (const recipient of recipients) seed(state, owner, recipient, nativeBalance.flora.seed, events,
          activation, false, phaseZeroStatsReady && equipped(owner, 'master-sprout-2') ? .45 : 0);
      }
      if (action === 'skill2') {
        for (const recipient of allies) {
          const pending = memory.seeds?.[recipient.id];
          if (pending) {
            nativeHeal(state, owner, recipient, recipient.stats.health * pending.fraction, events, true, activation, false);
            seedPayoff(state, owner, recipient, !!pending.empowered);
          }
        }
        delete memory.seeds;
        for (const recipient of allies) seed(state, owner, recipient, nativeBalance.flora.seed, events, activation);
      }
      if (action === 'ultimate') for (const recipient of allies) {
        nativeHeal(state, owner, recipient, recipient.stats.health * nativeBalance.flora.immediateHeal, events, true, activation);
        seed(state, owner, recipient, nativeBalance.flora.empoweredSeed, events, activation, true);
      }
      break;
    case 'atmoso':
      if (action === 'skill1') { hit(1.8); releaseCyclone(state, owner, events, activation); }
      if (action === 'skill2') {
        releaseCyclone(state, owner, events, activation);
        memory.cyclone = { gusts: 0, phases: 2 + activation.skillDuration,
          contributors: {}, skillPower: activation.skillPower };
      }
      if (action === 'ultimate') { releaseCyclone(state, owner, events, activation); hit(2, true); }
      break;
    case 'elise': {
      const blades = memory.blades ??= [null, null];
      if (action === 'skill1') {
        const held = blades.indexOf(null);
        hit(held < 0 ? 1.4 : 1.1);
        if (held >= 0 && target?.hp) {
          blades[held] = target.id;
          if (phaseZeroStatsReady && equipped(owner, 'master-elise-2')) {
            const numbers = gear(target).numbers;
            const key = `eliseSkillPower:${owner.id}`;
            numbers[key] = (numbers[key] ?? 0) + 1;
          }
        }
      }
      if (action === 'skill2') {
        if (blades.every(blade => blade === null)) hit(1.4);
        else {
          const targets = [...blades];
          recall(state, owner, events, activation);
          if (phaseZeroStatsReady && equipped(owner, 'master-elise-3')) {
            activation.spent.eliseRecallCount = targets.filter(Boolean).length;
            activation.spent.eliseSameTarget = targets[0] && targets[0] === targets[1] ? 1 : 0;
          }
        }
      }
      if (action === 'ultimate') {
        const targets = [...blades];
        recall(state, owner, events, activation);
        if (phaseZeroStatsReady && equipped(owner, 'master-elise-3')) {
          activation.spent.eliseRecallCount = targets.filter(Boolean).length;
          activation.spent.eliseSameTarget = targets[0] && targets[0] === targets[1] ? 1 : 0;
        }
        hit(2.6);
      }
      break;
    }
    case 'bliss':
      if (action === 'skill1') {
        hit(1.7, false, 0, posture === 'opening' ? .25 : 0);
        if (posture === 'closing') {
          if (phaseZeroStatsReady && equipped(owner, 'master-bliss-2')) {
            for (const recipient of other)
              nativeHeal(state, owner, recipient, recipient.stats.health * .06, events, true, activation);
          } else {
            const recipient = [...other].sort((a, b) => a.hp / a.stats.health - b.hp / b.stats.health)[0];
            if (recipient) nativeHeal(state, owner, recipient, recipient.stats.health * .06, events, true, activation);
          }
        }
        if (phaseZeroStatsReady && equipped(owner, 'master-bliss-2') && posture === 'opening')
          for (const recipient of other) grantToken(state, recipient, 'blissCriticalRate', .25);
      }
      if (action === 'skill2') {
        hit(1.2, true);
        if (posture === 'opening' || phaseZeroStatsReady && equipped(owner, 'master-bliss-1')) for (const recipient of allies) {
          const prior = recipient.attackBoost?.throughRound ?? 0;
          const fraction = .1 * (phaseZeroStatsReady ? activation.skillPower : 1);
          if (prior < state.round || (recipient.attackBoost?.fraction ?? 0) <= fraction)
            recipient.attackBoost = { fraction,
              throughRound: state.round + activation.skillDuration, sourceId: owner.id, origin: 'native' };
        }
        if (posture === 'closing' || phaseZeroStatsReady && equipped(owner, 'master-bliss-1'))
          for (const recipient of allies) shield(recipient, .06);
        if (activation.healExtra > 0) for (const recipient of other)
          nativeHeal(state, owner, recipient, 0, events, true, activation);
      }
      if (action === 'ultimate') {
        hit(2.5, true, 0, posture === 'opening' ? .3 : 0);
        if (phaseZeroStatsReady && equipped(owner, 'master-bliss-3')) for (const recipient of other) {
          grantToken(state, recipient, 'blissSkillEfficiency', .25);
          if (posture === 'closing') grantToken(state, recipient, 'blissSkillDuration', 1);
        }
        if (posture === 'closing') for (const recipient of other)
          nativeHeal(state, owner, recipient, recipient.stats.health * .1 * flareSupport, events, true, activation);
      }
      break;
    case 'bruno':
      if (action === 'skill1') hit(1.9);
      if (action === 'skill2') {
        if (!other.length) memory.reduction = {
          fraction: .2 * (phaseZeroStatsReady ? activation.skillPower : 1),
          throughPhase: state.round + activation.skillDuration,
        };
        else if (ally && ally.id !== owner.id) memory.cover = { targets: [ally.id],
          fraction: Math.min(1, (!phaseZeroStatsReady && equipped(owner, 'master-bruno-3') ? .35 : .5) *
            (phaseZeroStatsReady ? activation.skillPower : 1)),
          throughPhase: state.round + activation.skillDuration };
      }
      if (action === 'ultimate') {
        memory.cover = { targets: other.map(unit => unit.id),
          fraction: Math.min(1, .4 * flareSupport * (phaseZeroStatsReady ? activation.skillPower : 1)),
          throughPhase: state.round + 1 + activation.skillDuration };
        const shield = phaseZeroStatsReady && equipped(owner, 'master-bruno-2')
          ? Math.max(owner.stats.health * .25, effectiveDefense(state, owner) * 2.5)
          : Math.max(owner.stats.health * .2,
            phaseZeroStatsReady || equipped(owner, 'master-bruno-2') ? effectiveDefense(state, owner) * 2 : 0);
        nativeShield(state, owner, owner, shield * flareSupport, events,
          { skillPower: activation.skillPower, activation, stack: true });
      }
      break;
    case 'disciple': {
      for (const recipient of state.allies) if (recipient.native?.instruction?.owner === owner.id)
        delete recipient.native.instruction;
      const recipients = action === 'ultimate' ? allies : ally ? [ally] : [];
      for (const recipient of recipients) {
        nativeMemory(recipient).instruction = { kind: action === 'skill1' ? 'strike' : action === 'skill2' ? 'shelter' : 'resolve',
          owner: owner.id, throughRound: state.round + (equipped(owner, 'master-disciple-1') ? 3 : 1) + activation.skillDuration,
          ...(phaseZeroStatsReady ? { damageBonus: .3 * flareSupport * activation.skillPower,
            supportBonus: .35 * flareSupport * activation.skillPower } : {}) };
        status(state, events, owner, recipient, `${recipient.name} receives ${action === 'skill1' ? 'Strike' : action === 'skill2' ? 'Shelter' : 'Resolve'} Instruction.`);
      }
      break;
    }
    case 'aurora':
      if (action === 'skill2') hit(1, true);
      if (action !== 'ultimate') {
        const seals = memory.seals ??= {};
        for (const enemy of action === 'skill1' ? target ? [target] : [] : foes(state)) {
          seals[enemy.id] = { fraction: Math.max(seals[enemy.id]?.fraction ?? 0,
            Math.min(1, (action === 'skill1' ? .4 : .25) *
              (phaseZeroStatsReady ? activation.skillPower + (activation.debuffPowerBonus ?? 0) : 1))),
          throughPhase: state.round + 2 + activation.skillDuration };
          status(state, events, owner, enemy, `${enemy.name} sealed through enemy phase ${seals[enemy.id].throughPhase}.`);
        }
      } else {
        memory.ultimateWardThrough = state.round + 1 + activation.skillDuration;
        if (phaseZeroStatsReady) memory.ultimateWardReduction = .5 * flareSupport * activation.skillPower;
      }
      break;
    case 'razor':
      if (action === 'skill2') memory.bastion = { throughPhase: state.round, loss: 0,
        ...(phaseZeroStatsReady ? { skillPower: activation.skillPower + (activation.supportPowerBonus ?? 0),
          skillDuration: activation.skillDuration } : {}) };
      else {
        const spent = memory.wounds ?? 0;
        memory.wounds = (memory.wounds ?? 0) - spent;
        activation.spent.wounds = spent;
        hit(action === 'skill1' ? 1.6 : 2.2);
        if (target?.hp) fixed(state, owner, target, spent * (action === 'ultimate' ? 2 : 1),
          'revenge', events, false, activation, false);
        if (!phaseZeroStatsReady && action === 'skill1' && target?.hp && equipped(owner, 'master-razor-3') && !gear(target).numbers[`silenced:${owner.id}`]) {
          gear(target).numbers[`silenced:${owner.id}`] = 1;
          gear(target).numbers.silence = 1;
        }
      }
      break;
    case 'rosetta': {
      let quarry = memory.quarry;
      if (action === 'skill1' && target) {
        if (quarry?.target !== target.id) quarry = memory.quarry = { target: target.id, round: state.round, contributors: [] };
        hit(1.6);
        if (target.hp > 0) afterCalamiticMark(state, owner, target, events);
      } else {
        const marked = foes(state).find(enemy => enemy.id === quarry?.target);
        const contributors = quarry?.round === state.round ? quarry.contributors : [];
        hit(action === 'ultimate' ? 3 : marked ? 2 + .25 * contributors.filter(id => id !== owner.id).length : 1.6, false, 0, 0, marked ?? target);
        if (action === 'ultimate' && contributors.length >= 2) for (const recipient of allies.filter(unit => contributors.includes(unit.id)))
          nativeHeal(state, owner, recipient, recipient.stats.health * .1 * flareSupport, events, true, activation);
      }
      break;
    }
    case 'thornia': {
      const traps = memory.traps ??= {};
      if (action === 'skill2') {
        const charged = traps[targetId]?.charges === 3;
        const legacyMaster = !phaseZeroStatsReady && equipped(owner, 'master-thornia-2');
        hit(1.7, charged && legacyMaster);
        if (charged && legacyMaster) for (const enemy of foes(state)) {
          if (enemy.id !== targetId) {
            enemy.weakened = Math.max(enemy.weakened, 1);
            enemy.weakenFraction = Math.max(enemy.weakenFraction, .15);
            enemy.weakenSourceId = owner.id; enemy.weakenOrigin = 'conduit';
          }
        }
        if (target?.hp && (traps[target.id]?.charges ?? 0) > 0) {
          traps[target.id].charges--;
          fixed(state, owner, target, owner.stats.damage * .8, 'trap', events, false, activation, false);
        }
      } else {
        if (action === 'ultimate') hit(1.4, true);
        for (const enemy of action === 'skill1' ? target ? [target] : [] : foes(state)) {
          traps[enemy.id] = { charges: 3, coefficient: Math.max(traps[enemy.id]?.coefficient ?? 0,
            (action === 'ultimate' ? .9 * flareDamage : .6) * (phaseZeroStatsReady ? activation.skillPower : 1)),
          throughPhase: state.round + 2 + activation.skillDuration,
          ...(phaseZeroStatsReady ? { empowered: action === 'ultimate' || traps[enemy.id]?.empowered === true } : {}) };
          status(state, events, owner, enemy, `${enemy.name}: 3 Thorn trap charges through enemy phase ${traps[enemy.id].throughPhase}.`);
        }
      }
      break;
    }
    case 'crinso':
      if (action === 'skill1') {
        hit(1.6, false, memory.edge === 'crimson' ? .2 : 0);
        const combo = memory.edge === 'crimson' ? (memory.combo ?? 0) + 1 : 0;
        if (phaseZeroStatsReady && combo > (memory.combo ?? 0)) {
          activation.spent.crinsoCombo = combo;
        }
        memory.combo = combo;
        if (phaseZeroStatsReady && equipped(owner, 'master-crinso-2') && memory.edge === 'crimson')
          activation.spent.goldenEdge = 1;
        memory.edge = 'gold';
      } else if (action === 'skill2') {
        hit(memory.edge === 'gold' ? 2.4 : 2);
        const combo = memory.edge === 'gold' ? (memory.combo ?? 0) + 1 : 0;
        if (phaseZeroStatsReady && combo > (memory.combo ?? 0)) {
          activation.spent.crinsoCombo = combo;
        }
        memory.combo = combo;
        memory.edge = 'crimson';
      } else {
        const combo = memory.combo ?? 0;
        memory.combo = 0; delete memory.edge;
        activation.spent.duality = combo;
        hit(2.6 + .45 * combo, false, combo >= 3 ? .3 : 0);
      }
      break;
    case 'nerithe': {
      const surveyed = foes(state).find(enemy => enemy.id === memory.survey?.target);
      if (action === 'skill2') {
        if (!phaseZeroStatsReady && equipped(owner, 'master-nerithe-2')) break;
        if (memory.survey && target) {
          const moved = memory.survey.target !== target.id;
          memory.survey.target = target.id;
          if (phaseZeroStatsReady && moved && equipped(owner, 'master-nerithe-2')) for (const recipient of other) {
            grantToken(state, recipient, 'foldTarget', 1);
            gear(recipient).owners.foldTarget = target.id;
          }
        }
        hit(1.3, true);
      } else {
        const spent = surveyed ? Math.min(memory.survey?.points ?? 0, action === 'skill1' ? 1 : Infinity) : 0;
        if (memory.survey) memory.survey.points -= spent;
        activation.spent.survey = spent;
        hit(action === 'skill1' ? 1.8 : 2.8, false, spent * (action === 'skill1' ? .25 : .15), 0, surveyed ?? target);
      }
      break;
    }
    case 'orvella':
      if (action === 'skill1') {
        hit(memory.foundation ? 1.4 : 1.8);
        if (memory.foundation) {
          const repair = owner.stats.health * .08 * (phaseZeroStatsReady
            ? activation.skillPower + (activation.supportPowerBonus ?? 0) + (equipped(owner, 'master-orvella-3') ? .5 : 0) : 1);
          memory.foundation.durability += repair;
          memory.foundation.maximum = Math.max(memory.foundation.maximum, memory.foundation.durability);
        }
      } else if (action === 'skill2') {
        const plating = !phaseZeroStatsReady && equipped(owner, 'master-orvella-1');
        const maximum = owner.stats.health * (plating ? .15 : .3) * (phaseZeroStatsReady ? activation.skillPower : 1);
        memory.foundation = { durability: maximum, maximum, throughPhase: state.round + 2 + activation.skillDuration };
        if (plating) for (const recipient of allies)
          generatedShield(owner, recipient, Math.min(recipient.stats.health * .15, owner.stats.health * .05), events, true, recipient.stats.health * .15, true);
      } else {
        const power = memory.foundation?.durability ?? 0;
        if (phaseZeroStatsReady && equipped(owner, 'master-orvella-1') && memory.foundation) {
          memory.foundation.durability = power * .4;
        } else delete memory.foundation;
        hit(2, true);
        for (const enemy of foes(state)) fixed(state, owner, enemy, power, 'demolition', events, false, activation);
        if (phaseZeroStatsReady && equipped(owner, 'master-orvella-1'))
          for (const recipient of other) grantToken(state, recipient, 'orvellaSkillEfficiency', .2);
      }
      break;
    case 'vaelor':
      if (action === 'skill1') hit(1.7, false, 0, (memory.beat ?? 0) === 0 ? .3 : 0);
      if (action === 'skill2') {
        hit(1.2, true);
        if (memory.beat === 1) {
          const fraction = .2 * (phaseZeroStatsReady ? activation.skillPower : 1);
          const throughRound = state.round + 1 + activation.skillDuration;
          if (!phaseZeroStatsReady || !owner.attackBoost || owner.attackBoost.throughRound < state.round ||
              owner.attackBoost.fraction <= fraction)
            owner.attackBoost = { fraction: phaseZeroStatsReady ? fraction : Math.max(owner.attackBoost?.fraction ?? 0, fraction),
              throughRound: phaseZeroStatsReady ? throughRound : Math.max(owner.attackBoost?.throughRound ?? 0, throughRound),
              sourceId: owner.id, origin: 'native' };
        }
      }
      if (action === 'ultimate') hit((memory.beat ?? 0) === 2 ? 3.4 : 2.6, true);
      break;
    case 'caldrex': {
      const spent = Math.min(nativeHeatCap(owner), memory.heat ?? 0);
      const taunt = () => {
        memory.tauntThrough = state.round + activation.skillDuration;
        status(state, events, owner, owner, `${owner.name} draws eligible single-target enemy attacks through enemy phase ${memory.tauntThrough}.`);
      };
      if (action === 'skill1') {
        for (const recipient of allies) shield(recipient, .12);
        taunt();
      }
      if (action === 'skill2') {
        memory.heat = 0;
        hit(2.55 + .24 * spent, true);
        for (const enemy of foes(state)) burn(enemy, .25);
        if (spent) status(state, events, owner, owner, `${owner.name} spends ${spent} Heat.`);
      }
      if (action === 'ultimate') {
        memory.heat = 0;
        for (const recipient of allies) {
          shield(recipient, .65);
          if (spent) nativeMemory(recipient).defenseBuff = { fraction: .12 * spent * activation.skillPower,
            throughRound: state.round + 1 + activation.skillDuration };
        }
        taunt();
        memory.burnBoostThrough = state.round + 1 + activation.skillDuration;
        status(state, events, owner, owner, `${owner.name} spends ${spent} Heat; allied ability Burn deals 25% more through enemy phase ${memory.burnBoostThrough}.`);
      }
      break;
    }
    case 'solenne': {
      const spent = Math.min(4, memory.stillness ?? 0);
      if (action === 'skill1') {
        hit(2.4);
        if (target?.hp) applyConduitWeaken(state, owner, target, .25, events, action, 1, activation);
        memory.tauntThrough = state.round + activation.skillDuration;
        status(state, events, owner, owner, `${owner.name} draws eligible single-target enemy attacks through enemy phase ${memory.tauntThrough}.`);
      }
      if (action === 'skill2') {
        memory.stillness = Math.min(4, spent + 2);
        status(state, events, owner, owner, `${owner.name} holds ${memory.stillness}/4 Stillness.`);
        for (const recipient of allies) shield(recipient, .16);
      }
      if (action === 'ultimate') {
        memory.stillness = 0;
        hit(7.2 + .45 * spent, true);
        for (const recipient of allies) shield(recipient, .24 + .045 * spent);
        if (spent && equipped(owner, 'master-solenne-3'))
          for (const recipient of other) generatedGaugePercent(owner, recipient, .03 * spent, events, state);
      }
      if (equipped(owner, 'master-solenne-2')) {
        const lowest = [...allies].sort((a, b) => a.hp / a.stats.health - b.hp / b.stats.health)[0];
        if (lowest) generatedShield(owner, lowest, lowest.stats.health * .2, events, true);
      }
      break;
    }
    case 'myrthen': {
      const season = memory.season ?? 'sprout';
      const harvest = season === 'harvest';
      const bonus = harvest ? (equipped(owner, 'master-myrthen-1') ? .75 : .35) : 0;
      const pierce = harvest ? (action === 'ultimate' ? .3 : .2) : 0;
      if (action === 'skill1') {
        hit(2.72 * (1 + bonus), false, pierce);
        if (target?.hp) {
          memory.claim = { target: target.id, throughPhase: state.round + 1 + activation.skillDuration };
          status(state, events, owner, target, `${target.name}: Reaper’s Claim, +12% direct damage taken from the squad through enemy phase ${memory.claim.throughPhase}.`);
        }
      }
      if (action === 'skill2') hit(1.92 * (1 + bonus), true, pierce);
      if (action === 'ultimate') hit(12.48 * (1 + bonus), false, pierce);
      let next: NonNullable<NativeKitState['season']> = season;
      if (harvest) next = equipped(owner, 'master-myrthen-1') ? 'bloom' : 'sprout';
      else if (action !== 'ultimate') next = season === 'sprout' ? 'bloom' : 'harvest';
      if (equipped(owner, 'master-myrthen-2') && nativeTrace(state, owner, .1)) next = 'harvest';
      memory.season = next;
      status(state, events, owner, owner, `${owner.name} is in ${next[0].toUpperCase()}${next.slice(1)}.`);
      break;
    }
    case 'neralis': {
      const current = Math.min(phase2CounterCap(owner, 1), memory.current ?? 0);
      const heal = (recipient: Combatant, offer: number) => {
        const before = recipient.hp;
        const restored = nativeHeal(state, owner, recipient, offer, events, true, activation);
        if (equipped(owner, 'master-neralis-3') && before < recipient.stats.health * .5 && restored > 0 &&
            guardOnce(owner, `return-gauge:${recipient.id}`, state.round))
          generatedGaugePercent(owner, recipient, .1, events, state);
        return restored;
      };
      if (action === 'skill1' && ally) {
        heal(ally, ally.stats.health * .35);
        const throughRound = state.round + 1 + activation.skillDuration;
        ally.native ??= {};
        ally.native.defenseBuff = { fraction: .3, throughRound };
        status(state, events, owner, ally, `${ally.name}: Station Defense +30% through player turn ${throughRound}.`);
        if (equipped(owner, 'master-neralis-2'))
          nativeShield(state, owner, ally, ally.stats.health * .2, events,
            { skillPower: activation.skillPower, activation, stack: true });
      } else if (action === 'skill2') {
        memory.current = 0;
        const perCurrent = equipped(owner, 'master-neralis-1') ? .09 : .06;
        for (const recipient of allies)
          heal(recipient, recipient.stats.health * (.18 + perCurrent * current));
        status(state, events, owner, owner, `${owner.name} spends ${current} Current.`);
      } else if (action === 'ultimate') {
        memory.current = 0;
        hit(7.2, true);
        for (const recipient of living(state))
          heal(recipient, recipient.stats.health * (.3 + .05 * current));
        status(state, events, owner, owner, `${owner.name} spends ${current} Current.`);
      }
      finishNativeHealing(state, owner, activation, events);
      break;
    }
    case 'varkhel': {
      const tension = Math.min(phase2CounterCap(owner, 1), memory.tension ?? 0);
      if (action === 'skill1') {
        nativeShield(state, owner, owner, owner.stats.health * .25, events,
          { skillPower: activation.skillPower, activation, stack: true });
        memory.defenseBuff = { fraction: .4, throughRound: state.round + 1 + activation.skillDuration };
        memory.tauntThrough = state.round + activation.skillDuration;
        status(state, events, owner, owner, `${owner.name} gains +40% Defense and taunts eligible random single-target attacks through enemy phase ${memory.tauntThrough}.`);
        if (equipped(owner, 'master-varkhel-2')) for (const recipient of other)
          nativeShield(state, owner, recipient, recipient.stats.health * .16, events,
            { skillPower: activation.skillPower, activation, stack: true });
      } else if (action === 'skill2') {
        memory.tension = 0;
        hit(2.85 + .45 * tension, false,
          equipped(owner, 'master-varkhel-3') ? .35 : .2);
        if (tension >= 3 && equipped(owner, 'master-varkhel-3'))
          generatedGaugePercent(owner, owner, .15, events, state);
        if (tension) status(state, events, owner, owner, `${owner.name} spends ${tension} Tension.`);
      } else if (action === 'ultimate') {
        memory.tension = 0;
        hit(6.9 + .55 * tension, true);
        for (const recipient of living(state)) shield(recipient, .3);
        if (tension) status(state, events, owner, owner, `${owner.name} spends ${tension} Tension.`);
      }
      break;
    }
    case 'seravelle': {
      const cadence = Math.min(phase2CounterCap(owner, 1), memory.cadence ?? 0);
      if (action === 'skill1' && target) {
        hit(2.45);
        if (target.hp > 0) {
          const burns = memory.burns ??= {};
          const damage = applyConduitBurn(state, owner, target, owner.stats.damage * .12, activation);
          burns[target.id] = { damage, turns: 2 + activation.skillDuration };
          target.burn = { ...burns[target.id], sourceId: owner.id, origin: 'native' };
          resetConduitBurnStreak(owner, target);
          status(state, events, owner, target, `${target.name}: Burn from ${owner.name}, ${damage} per phase for ${burns[target.id].turns} phases.`);
        }
      } else if (action === 'skill2') {
        memory.cadence = 0;
        const base = equipped(owner, 'master-seravelle-1') ? .4 : .3;
        const fraction = base + .1 * cadence;
        const throughRound = state.round + 1 + activation.skillDuration;
        for (const recipient of allies) {
          const previous = recipient.attackBoost;
          if (!previous || previous.throughRound < state.round || previous.sourceId === owner.id ||
              previous.origin === 'native' && fraction > previous.fraction)
            recipient.attackBoost = { fraction, throughRound, sourceId: owner.id, origin: 'native' };
          else if (previous.sourceId === owner.id && previous.throughRound >= state.round)
            recipient.attackBoost = { ...previous, fraction, throughRound };
          status(state, events, owner, recipient, `${recipient.name}: Direct Attack +${Math.round(fraction * 100)}% through player turn ${throughRound}.`);
        }
        status(state, events, owner, owner, `${owner.name} spends ${cadence} Cadence.`);
      } else if (action === 'ultimate') {
        hit(6.2, true);
        const throughRound = state.round + 1 + activation.skillDuration;
        for (const recipient of other) {
          generatedGaugePercent(owner, recipient, .2, events, state);
          recipient.native ??= {};
          recipient.native.skillPowerBuff = { owner: owner.id, fraction: .3, throughRound };
          status(state, events, owner, recipient, `${recipient.name}: Skill Power +30% and 20% Gauge through player turn ${throughRound}.`);
        }
        if (equipped(owner, 'master-seravelle-3')) for (const recipient of allies)
          nativeShield(state, owner, recipient, recipient.stats.health * .22, events,
            { skillPower: activation.skillPower, activation, stack: true });
      }
      break;
    }
    case 'velmira': {
      const crosscut = Math.min(phase2CounterCap(owner, 1), memory.crosscut ?? 0);
      if (action === 'skill1') {
        const fortified = equipped(owner, 'master-velmira-2') && !!target?.weakened;
        hit(2.8 * (fortified ? 1.35 : 1));
        if (target?.hp) applyConduitWeaken(state, owner, target, .25, events, action, 2, activation);
      } else if (action === 'skill2') {
        const pierce = crosscut >= 2 ? equipped(owner, 'master-velmira-2') ? .35 : .2 : 0;
        hit(2.05, true, pierce);
      } else if (action === 'ultimate') {
        memory.crosscut = 0;
        hit(10.5 + .9 * crosscut, false, .3);
        if (crosscut >= 3 && equipped(owner, 'master-velmira-3')) {
          generatedGaugePercent(owner, owner, .25, events, state);
          nativeHeal(state, owner, owner, owner.stats.health * .18, events, false);
        }
      }
      if (action === 'skill1' || action === 'skill2') {
        const previousSkill = memory.previousSkill;
        if (previousSkill && previousSkill !== action)
          memory.crosscut = Math.min(phase2CounterCap(owner, 1), crosscut + 1);
        memory.previousSkill = action;
        if (equipped(owner, 'master-velmira-1') && guardOnce(owner, 'first-skill', 0))
          memory.crosscut = Math.min(phase2CounterCap(owner, 1), (memory.crosscut ?? 0) + 1);
        status(state, events, owner, owner, `${owner.name} holds ${memory.crosscut ?? 0}/${phase2CounterCap(owner, 1)} Crosscut.`);
      }
      break;
    }
    default: throw new Error(`Missing native identity for ${owner.definitionId}.`);
  }
}

export function nativeAfterAction(state: BattleState, owner: Combatant, action: ActionId, priorInstruction: NativeKitState['instruction'], events: BattleEvent[]): void {
  const actionEvents = events.slice(owner.native?.actionStartedAt ?? events.length);
  const actionDamage = actionEvents.some(event => event.kind === 'damage' && event.source === owner.id &&
    (event.amount > 0 || (event.shieldAbsorbed ?? 0) > 0));
  const effectiveNativeDamage = actionEvents.some(event => event.kind === 'damage' && event.source === owner.id &&
    event.origin !== 'conduit' && !event.periodic && event.nativeKind !== 'redirect' &&
    (event.amount > 0 || (event.shieldAbsorbed ?? 0) > 0));
  const effectiveNativeHeal = actionEvents.some(event => event.kind === 'heal' && event.source === owner.id &&
    event.origin === 'native' && event.amount > 0);
  if (hasNativeIdentity(owner) && owner.definitionId === 'neralis' &&
      (action === 'light' && effectiveNativeDamage || action !== 'light' && effectiveNativeHeal)) {
    const current = owner.native?.current ?? 0;
    const cap = phase2CounterCap(owner, 1);
    if (current < cap) {
      owner.native!.current = current + 1;
      status(state, events, owner, owner, `${owner.name} gains Current ${owner.native!.current}/${cap}.`);
    }
  }
  if (hasNativeIdentity(owner) && owner.definitionId === 'varkhel' && action === 'light' && effectiveNativeDamage) {
    const tension = owner.native?.tension ?? 0;
    const cap = phase2CounterCap(owner, 1);
    if (tension < cap) {
      owner.native!.tension = tension + 1;
      status(state, events, owner, owner, `${owner.name} gains Tension ${owner.native!.tension}/${cap}.`);
    }
  }
  if (action === 'light' && effectiveNativeDamage) for (const seravelle of living(state).filter(unit =>
      hasNativeIdentity(unit) && unit.definitionId === 'seravelle')) {
    const cap = phase2CounterCap(seravelle, 1);
    if (!guardOnce(seravelle, 'cadence', state.round)) continue;
    if ((seravelle.native?.cadence ?? 0) < cap) {
      seravelle.native!.cadence = (seravelle.native?.cadence ?? 0) + 1;
      status(state, events, seravelle, seravelle, `${seravelle.name} gains Cadence ${seravelle.native!.cadence}/${cap}.`);
    }
  }
  const ability = action === 'light' ? undefined : owner.kit?.abilities[action];
  const traits = phaseZeroStatsReady ? conduitActionTraits(state, owner, action) : undefined;
  const damaging = traits?.damage ?? (action === 'light' || ability?.strength.damageMultiplier !== undefined);
  if (action !== 'light' && damaging && actionDamage) {
    const signal = owner.native?.signal;
    if (signal && signal.throughRound >= state.round) {
      delete owner.native!.signal;
      const source = living(state).find(unit => unit.id === signal.owner && unit.definitionId === 'vespera');
      if (source) {
        const memory = nativeMemory(source);
        memory.beacon = Math.min(equipped(source, 'master-vespera-1') ? 4 : 3, (memory.beacon ?? 0) + 1);
        if (equipped(source, 'master-vespera-3') && guardOnce(source, `signal-gauge:${state.round}`, state.round))
          nativeGauge(state, owner, 10, events);
        status(state, events, source, owner, `${source.name}'s Signal is spent; Beacon ${memory.beacon}/${equipped(source, 'master-vespera-1') ? 4 : 3}.`);
      }
    }
    const moonflower = owner.native?.moonflower;
    if (moonflower && moonflower.throughRound >= state.round) {
      delete owner.native!.moonflower;
      const source = living(state).find(unit => unit.id === moonflower.owner && unit.definitionId === 'asteriel');
      if (source && equipped(source, 'master-asteriel-3') && guardOnce(source, `moonflower-gauge:${state.round}`, state.round))
        nativeGauge(state, owner, 8, events);
      if (source) status(state, events, source, owner, `${owner.name}'s Moonflower is spent.`);
    }
    if (owner.native?.openRoute && owner.native.openRoute.throughRound >= state.round) {
      delete owner.native.openRoute;
      status(state, events, owner, owner, `${owner.name}'s Open Route is spent.`);
    }
    for (const source of living(state).filter(unit => unit.definitionId === 'oryn' && equipped(unit, 'master-oryn-3'))) {
      const term = source.native?.terms;
      if (!term || term.throughPhase < state.round || (source.native?.accords?.[owner.id] ?? -1) < state.round ||
          !actionEvents.some(event => event.kind === 'damage' && event.source === owner.id && event.target === term.target) ||
          !guardOnce(source, `accord-gauge:${state.round}`, state.round)) continue;
      nativeGauge(state, owner, 10, events);
    }
  }
  if (priorInstruction && owner.native?.instruction === priorInstruction) {
    const supporting = traits ? traits.healing || traits.shield :
      ability?.strength.healing !== undefined || ability?.strength.shield !== undefined;
    const matchingOnly = phaseZeroStatsReady && priorInstruction.throughRound >= state.round &&
      living(state).some(unit => unit.id === priorInstruction.owner && equipped(unit, 'master-disciple-1'));
    const mismatch = matchingOnly && (priorInstruction.kind === 'strike' && !damaging ||
      priorInstruction.kind === 'shelter' && !supporting);
    if (!mismatch) delete owner.native.instruction;
  }
  if (phaseZeroStatsReady && priorInstruction?.kind === 'resolve' && priorInstruction.throughRound >= state.round) {
    const disciple = living(state).find(unit => unit.id === priorInstruction.owner && equipped(unit, 'master-disciple-2'));
    if (disciple) for (const ally of living(state).filter(unit => unit.id !== owner.id))
      generatedGaugePercent(disciple, ally, .1, events, state);
  }
  for (const caster of living(state).filter(hasNativeIdentity)) {
    const field = caster.native?.cyclone;
    if (field && caster.id !== owner.id && field.contributors[owner.id] !== state.round) {
      field.contributors[owner.id] = state.round;
      field.gusts += 1;
      if (phaseZeroStatsReady && equipped(caster, 'master-atmoso-3')) {
        const numbers = gear(owner).numbers;
        numbers.crosswindGaugeBonus = .3;
        numbers.crosswindGaugeThrough = state.round + 1;
      }
      status(state, events, caster, caster, `Cyclone holds ${field.gusts} Gusts.`);
    }
  }
  nativeCleanup(state);
}

export function nativePrimaryHit(state: BattleState, attacker: Combatant, target: Combatant, effective: boolean, events: BattleEvent[], hits = 1): void {
  if (!effective) return;
  if (hasNativeIdentity(attacker) && attacker.definitionId === 'myrthen' && target.side === 'enemy' && target.hp <= 0 && attacker.hp > 0 &&
      equipped(attacker, 'master-myrthen-3') && foes(state).length > 0 && guardOnce(attacker, 'reaping', state.round)) {
    for (const ally of living(state)) {
      generatedHeal(attacker, ally, ally.stats.health * .06, events, state);
      generatedGaugePercent(attacker, ally, .05, events, state);
    }
  }
  if (hasNativeIdentity(attacker) && attacker.definitionId === 'kaelith' && target.side === 'enemy' && target.hp > 0) {
    const faults = nativeMemory(attacker).faults ??= {};
    faults[target.id] = Math.min(3, (faults[target.id] ?? 0) + hits);
    status(state, events, attacker, target, `${target.name}: Fractalized Incision ${faults[target.id]}/3 (+${faults[target.id] * 10}% squad damage).`);
  }
  for (const owner of living(state).filter(hasNativeIdentity)) {
    const quarry = owner.native?.quarry;
    if (!quarry || quarry.target !== target.id) continue;
    if (phaseZeroStatsReady && equipped(owner, 'master-rosetta-1')) {
      quarry.hits = (quarry.hits ?? 0) + hits;
      while (quarry.hits >= 2) {
        quarry.hits -= 2;
        for (const ally of living(state)) generatedGaugePercent(owner, ally, .12, events, state);
      }
    }
    if (quarry.round !== state.round) { quarry.round = state.round; quarry.contributors = []; }
    if (!quarry.contributors.includes(attacker.id)) quarry.contributors.push(attacker.id);
    if (quarry.contributors.length >= 2) {
      const contributors = living(state).filter(unit => quarry.contributors.includes(unit.id));
      if (phaseZeroStatsReady || !equipped(owner, 'master-rosetta-1'))
        for (const ally of contributors) nativeShield(state, owner, ally, ally.stats.health * .08, events);
      if (!phaseZeroStatsReady && equipped(owner, 'master-rosetta-1')) {
        if (quarry.paidRound !== state.round) {
          quarry.paidRound = state.round;
          if (phaseZeroStatsReady) {
            for (const contributor of contributors.slice(0, 2))
              generatedGaugePercent(owner, contributor, .12, events, state);
          } else {
            const recipient = [...living(state)].sort((a, b) => a.hp / a.stats.health - b.hp / b.stats.health)[0];
            if (recipient) nativeShield(state, owner, recipient, recipient.stats.health * .48, events);
          }
        }
      }
    }
  }
}

export function nativeStillnessMultiplier(state: BattleState, target: Combatant, events: BattleEvent[]): number {
  let multiplier = 1;
  if (hasNativeIdentity(target) && target.definitionId === 'solenne' && target.hp > 0 && (target.native?.stillness ?? 0) > 0) {
    target.native!.stillness!--;
    multiplier *= 1 - (equipped(target, 'master-solenne-1') ? .35 : .2);
    status(state, events, target, target, `${target.name} spends Stillness (${target.native!.stillness}/4 remain).`);
    if (equipped(target, 'master-solenne-3') && guardOnce(target, 'cadence', state.round))
      for (const ally of living(state)) generatedGaugePercent(target, ally, .07, events, state);
  }
  return multiplier;
}

export function nativeIncomingMultiplier(state: BattleState, enemy: Combatant, target: Combatant, action: ActionId, events: BattleEvent[]): number {
  let multiplier = nativeStillnessMultiplier(state, target, events);
  const ceasefire = target.native?.ceasefire;
  if (ceasefire && ceasefire.charges > 0 && ceasefire.throughPhase >= state.round &&
      living(state).some(owner => owner.id === ceasefire.owner && owner.definitionId === 'serapha')) {
    multiplier *= Math.max(0, 1 - ceasefire.fraction);
    ceasefire.charges--;
    ceasefire.reducedRound = state.round;
    status(state, events, state.allies.find(owner => owner.id === ceasefire.owner)!, target,
      `${target.name}'s Ceasefire reduces this direct hit by ${Math.round(ceasefire.fraction * 100)}%.`);
  }
  const lead = target.native?.lead;
  if (lead && lead.throughPhase >= state.round &&
      living(state).some(owner => owner.id === lead.owner && owner.definitionId === 'aureth'))
    multiplier *= Math.max(0, 1 - lead.fraction);
  if (target.native?.reduction && target.native.reduction.throughPhase >= state.round)
    multiplier *= phaseZeroStatsReady ? Math.max(0, 1 - target.native.reduction.fraction) : 1 - target.native.reduction.fraction;
  if (target.native?.bastion && target.native.bastion.throughPhase >= state.round)
    multiplier *= phaseZeroStatsReady ? Math.max(0, 1 - .3 * (target.native.bastion.skillPower ?? 1)) : .7;
  let hostile = enemy.native?.hostileReduction;
  if (hostile === undefined) {
    hostile = 1;
    let strongestSeal = 0;
    let strongestWard = 0;
    for (const owner of living(state).filter(hasNativeIdentity)) {
    if (action !== 'light') {
      const seal = owner.native?.seals?.[enemy.id];
      if (seal && seal.throughPhase >= state.round) {
        if (phaseZeroStatsReady) strongestSeal = Math.max(strongestSeal, seal.fraction);
        else hostile *= 1 - seal.fraction;
        if (phaseZeroStatsReady && equipped(owner, 'master-aurora-1'))
          gear(enemy).owners.auroraShieldOwner = owner.id;
        if (phaseZeroStatsReady && equipped(owner, 'master-aurora-3')) {
          const key = `auroraHeal:${enemy.id}:${state.round}`;
          if (gear(enemy).numbers[key] !== 1) {
            gear(enemy).numbers[key] = 1;
            for (const ally of living(state))
              generatedHeal(owner, ally, ally.stats.health * .08, events, state);
          }
        }
        delete owner.native!.seals![enemy.id];
        status(state, events, owner, enemy, `${enemy.name}'s Seal is consumed by its special.`);
      }
    }
      if ((action === 'ultimate' || phaseZeroStatsReady && equipped(owner, 'master-aurora-2')) &&
          (owner.native?.ultimateWardThrough ?? 0) >= state.round) {
        if (phaseZeroStatsReady) strongestWard = Math.max(strongestWard, owner.native?.ultimateWardReduction ?? .5);
        else hostile *= .5;
      }
    }
    if (phaseZeroStatsReady) hostile *= Math.max(0, 1 - strongestSeal) * Math.max(0, 1 - strongestWard);
    nativeMemory(enemy).hostileReduction = hostile;
  }
  return multiplier * hostile;
}

export function nativeRouteDamage(state: BattleState, enemy: Combatant, target: Combatant, amount: number, events: BattleEvent[], redirect: (target: Combatant, amount: number) => void): number {
  let remaining = amount;
  const bruno = living(state).find(unit => unit.id !== target.id && unit.native?.cover &&
    unit.native.cover.throughPhase >= state.round && unit.native.cover.targets.includes(target.id));
  if (bruno?.native?.cover) {
    const routed = remaining * bruno.native.cover.fraction;
    remaining -= routed;
    if (phaseZeroStatsReady && routed > 0 && equipped(bruno, 'master-bruno-1'))
      grantToken(state, target, 'brunoCoverSkillPower', .3);
    redirect(bruno, routed * .75);
  }
  for (const owner of living(state).filter(unit => unit.definitionId === 'caevren')) {
    const intercept = owner.native?.intercept;
    if (!intercept || intercept.throughPhase < state.round || !intercept.targets.includes(target.id)) continue;
    const routed = remaining * intercept.fraction;
    remaining -= routed;
    if (routed > 0) {
      redirect(owner, routed);
      status(state, events, owner, target, `${owner.name} intercepts ${Math.round(intercept.fraction * 100)}% of the direct hit.`);
    }
  }
  const foundations = living(state).filter(owner => owner.native?.foundation &&
    owner.native.foundation.durability > 0 && owner.native.foundation.throughPhase >= state.round);
  if (phaseZeroStatsReady) foundations.sort((a, b) =>
    b.native!.foundation!.durability - a.native!.foundation!.durability);
  for (const owner of phaseZeroStatsReady ? foundations.slice(0, 1) : foundations) {
    const foundation = owner.native?.foundation;
    if (!foundation || foundation.throughPhase < state.round) continue;
    const absorbed = Math.min(foundation.durability, remaining * .2);
    foundation.durability -= absorbed; remaining -= absorbed;
    if (phaseZeroStatsReady && absorbed > 0 && equipped(owner, 'master-orvella-2')) {
      const numbers = gear(owner).numbers;
      numbers.foundationHealBank = (numbers.foundationHealBank ?? 0) + absorbed * .4;
      numbers.foundationHealDueRound ??= state.round + 1;
    }
    status(state, events, owner, target, `Foundation absorbs ${absorbed}; ${foundation.durability} durability remains.`, absorbed);
    if (foundation.durability <= 0) delete owner.native!.foundation;
  }
  return remaining;
}

export function nativeAllocateFoundation(durability: number, hits: readonly number[]): number[] {
  const shares = hits.map(hit => Math.max(0, hit) * .2);
  const total = shares.reduce((sum, amount) => sum + amount, 0);
  const budget = Math.min(Math.floor(durability), Math.floor(total));
  if (!total) return shares.map(() => 0);
  const result = shares.map(share => Math.floor(budget * share / total));
  let remainder = budget - result.reduce((sum, amount) => sum + amount, 0);
  for (let index = 0; remainder > 0; index = (index + 1) % result.length) {
    if (result[index] < Math.ceil(shares[index])) { result[index]++; remainder--; }
  }
  return result;
}

export function nativeDirectHpLoss(state: BattleState, target: Combatant, loss: number, events: BattleEvent[]): void {
  if (target.side === 'ally' && loss > 0) for (const owner of living(state).filter(unit => unit.definitionId === 'maerion')) {
    const memory = nativeMemory(owner);
    const capacity = owner.stats.health * (equipped(owner, 'master-maerion-1') ? .85 : .45);
    const stored = Math.min(capacity, (memory.unreturned ?? 0) + loss);
    const gained = stored - (memory.unreturned ?? 0);
    memory.unreturned = stored;
    if (gained > 0) status(state, events, owner, target, `${owner.name} records ${gained} direct Health loss as Unreturned (${Math.round(stored)}/${Math.round(capacity)}).`, gained);
  }
  if (hasNativeIdentity(target) && target.definitionId === 'razor' && loss > 0) {
    const memory = nativeMemory(target);
    memory.wounds = (memory.wounds ?? 0) + loss;
    if (memory.bastion?.throughPhase === state.round) memory.bastion.loss += loss;
    status(state, events, target, target, `${target.name} banks ${memory.wounds} Wounds.`, memory.wounds);
  }
}

export function nativeAbsorbedHit(state: BattleState, target: Combatant, nativeOwners: ReadonlyMap<string, number>, loss: number, events: BattleEvent[]): void {
  if (loss !== 0) return;
  for (const [id, absorbed] of nativeOwners) {
    const owner = living(state).find(unit => unit.id === id && hasNativeIdentity(unit) && unit.definitionId === 'tide');
    if (!owner || absorbed <= 0) continue;
    nativeGauge(state, target, 8, events);
  }
}

export function nativeAuthoredShieldAbsorbed(state: BattleState, owner: Combatant, target: Combatant,
  amount: number, broken: boolean, events: BattleEvent[]): void {
  if (!hasNativeIdentity(owner) || owner.definitionId !== 'rhaziel' || amount <= 0) return;
  const memory = nativeMemory(owner);
  if (guardOnce(owner, `repair:${target.id}`, state.round)) {
    const repair = memory.repair ??= {};
    const prior = repair[target.id]?.dueRound === state.round + 1 ? repair[target.id].amount : 0;
    const rate = equipped(owner, 'master-rhaziel-1') ? .35 : .2;
    const cap = target.stats.health * (equipped(owner, 'master-rhaziel-1') ? .3 : .2);
    repair[target.id] = { amount: Math.min(cap, prior + amount * rate), dueRound: state.round + 1 };
    status(state, events, owner, target, `${target.name}: Repair ${Math.round(repair[target.id].amount)} stored for the next player turn.`);
  }
  if (broken && equipped(owner, 'master-rhaziel-2') && guardOnce(owner, `repair-break:${target.id}`, state.round)) {
    target.native ??= {};
    target.native.defenseBuff = { fraction: .25, throughRound: state.round + 2 };
    status(state, events, owner, target, `${target.name}: Rhaziel's broken Shield grants +25% Defense for two player turns.`);
  }
}

export function nativeEnemyCompleted(state: BattleState, enemy: Combatant, damaging: boolean, events: BattleEvent[]): void {
  let attackStart = events.length - 1;
  while (attackStart >= 0 && !(events[attackStart].kind === 'attack' && events[attackStart].source === enemy.id)) attackStart--;
  const strikes = attackStart >= 0 ? events.slice(attackStart + 1).filter(event => event.kind === 'damage' &&
    event.source === enemy.id && !event.periodic && (event.amount > 0 || (event.shieldAbsorbed ?? 0) > 0)) : [];
  const auroraOwnerId = gear(enemy).owners.auroraShieldOwner;
  if (auroraOwnerId) {
    delete gear(enemy).owners.auroraShieldOwner;
    const owner = living(state).find(ally => ally.id === auroraOwnerId &&
      equipped(ally, 'master-aurora-1'));
    const recipient = [...living(state)].sort((a, b) =>
      a.hp / a.stats.health - b.hp / b.stats.health)[0];
    if (phaseZeroStatsReady && owner && recipient)
      timedConduitShield(state, owner, recipient, recipient.stats.health * .15,
        'master-aurora-1', state.round, events);
  }
  warEnemyHit(state, enemy, events);
  if (strikes.length) for (const owner of living(state).filter(hasNativeIdentity)) {
    if (owner.definitionId === 'caevren' && strikes.some(event => event.target === owner.id)) {
      const memory = nativeMemory(owner);
      if (guardOnce(owner, 'load', state.round)) {
        memory.load = Math.min(equipped(owner, 'master-caevren-1') ? 5 : 3, (memory.load ?? 0) + 1);
        status(state, events, owner, owner, `${owner.name}: Load ${memory.load}/${equipped(owner, 'master-caevren-1') ? 5 : 3}.`);
      }
      if (equipped(owner, 'master-caevren-3') && guardOnce(owner, 'counterweight', state.round))
        fixed(state, owner, enemy, owner.stats.damage, 'revenge', events);
    }
    if (owner.definitionId === 'serapha' && enemy.weakenSourceId === owner.id && enemy.weakened > 0) {
      if (guardOnce(owner, 'interval', state.round)) {
        owner.native!.interval = Math.min(equipped(owner, 'master-serapha-1') ? 4 : 3, (owner.native!.interval ?? 0) + 1);
        status(state, events, owner, owner, `${owner.name}: Interval ${owner.native!.interval}/${equipped(owner, 'master-serapha-1') ? 4 : 3}.`);
      }
      if (equipped(owner, 'master-serapha-3') && guardOnce(owner, 'serapha-gauge', state.round)) {
        const recipient = lowestHealthAlly(state);
        if (recipient) nativeGauge(state, recipient, 10, events);
      }
    }
    if (owner.definitionId === 'aureth' && equipped(owner, 'master-aureth-3') &&
        strikes.some(event => event.target === owner.native?.leadTarget) &&
        guardOnce(owner, 'lead-gauge', state.round)) {
      const holder = living(state).find(ally => ally.id === owner.native?.leadTarget);
      if (holder) nativeGauge(state, holder, 8, events);
    }
  }
  for (const event of strikes) {
    const recipient = living(state).find(ally => ally.id === event.target);
    const ceasefire = recipient?.native?.ceasefire;
    if (!recipient || !ceasefire || ceasefire.owner === '' || ceasefire.reducedRound !== state.round) continue;
    const owner = living(state).find(ally => ally.id === ceasefire.owner && ally.definitionId === 'serapha');
    if (owner && equipped(owner, 'master-serapha-2') && guardOnce(owner, `ceasefire-heal:${recipient.id}`, state.round))
      nativeHeal(state, owner, recipient, recipient.stats.health * .12, events, true);
  }
  if (!damaging) return;
  for (const owner of living(state).filter(hasNativeIdentity)) {
    const trap = owner.native?.traps?.[enemy.id];
    if (trap && trap.charges > 0 && trap.throughPhase >= state.round) {
      trap.charges--;
      if (phaseZeroStatsReady && equipped(owner, 'master-thornia-1')) {
        gear(enemy).numbers.thorniaDefenseThrough = state.round + 1;
      }
      if (phaseZeroStatsReady && equipped(owner, 'master-thornia-2') && trap.empowered) {
        const numbers = gear(owner).numbers;
        const key = `thorniaShield:${enemy.id}:${state.round}`;
        if (numbers[key] !== 1) {
          numbers[key] = 1;
          const targets = new Set(events.filter(event => event.kind === 'damage' && event.source === enemy.id &&
            state.allies.some(ally => ally.id === event.target)).map(event => event.target));
          for (const id of targets) {
            const recipient = living(state).find(ally => ally.id === id);
            if (recipient) timedConduitShield(state, owner, recipient, recipient.stats.health * .12,
              'master-thornia-2', state.round, events);
          }
        }
      }
      if (phaseZeroStatsReady && equipped(owner, 'master-thornia-3'))
        grantToken(state, owner, 'thorniaSkillPower', .2);
      if (!phaseZeroStatsReady && equipped(owner, 'master-thornia-1')) {
        for (const target of foes(state)) generatedStrike(state, owner, target, owner.stats.damage * .4, events, false);
      } else fixed(state, owner, enemy, owner.stats.damage * trap.coefficient, 'trap', events);
    }
  }
}

export function nativeBurnPhase(state: BattleState, enemy: Combatant, events: BattleEvent[]): void {
  for (const owner of living(state).filter(hasNativeIdentity)) {
    const burn = owner.native?.burns?.[enemy.id];
    if (!burn || burn.turns <= 0 || enemy.hp <= 0) continue;
    const otherBurn = enemy.burn.sourceId !== owner.id ? enemy.burn : undefined;
    enemy.burn = { ...burn, sourceId: owner.id, origin: 'native' };
    const tick = conduitBurnTick(state, owner, enemy);
    burn.turns--;
    enemy.burn.turns = burn.turns;
    const previous = enemy.hp;
    const warded = living(state).some(unit => hasNativeIdentity(unit) && unit.definitionId === 'caldrex' && (unit.native?.burnBoostThrough ?? -1) >= state.round);
    const hpAndShield = enemy.hp + enemy.shield;
    fixed(state, owner, enemy, warded ? tick * 1.25 : tick, 'burn', events, true);
    if (hpAndShield > enemy.hp + enemy.shield) for (const seravelle of living(state).filter(unit =>
        hasNativeIdentity(unit) && unit.definitionId === 'seravelle' && equipped(unit, 'master-seravelle-2'))) {
      if (!guardOnce(seravelle, 'burn-gauge', state.round)) continue;
      for (const recipient of living(state).filter(unit => unit.id !== seravelle.id))
        generatedGaugePercent(seravelle, recipient, .05, events, state);
    }
    const triage = living(state).find(unit => hasNativeIdentity(unit) && unit.definitionId === 'caldrex' && equipped(unit, 'master-caldrex-3'));
    if (triage && enemy.hp + enemy.shield < hpAndShield && guardOnce(triage, 'triage', state.round))
      for (const ally of living(state)) generatedHeal(triage, ally, ally.stats.health * .08, events, state);
    afterConduitBurn(state, owner, enemy, previous - enemy.hp, events);
    burn.turns = enemy.burn.turns;
    if (otherBurn) enemy.burn = otherBurn;
  }
}

export function nativePhaseEnd(state: BattleState, events: BattleEvent[]): void {
  for (const owner of state.allies) for (const [id, mark] of Object.entries(owner.native?.fateMarks ?? {}))
    if (mark.throughPhase <= state.round) delete owner.native!.fateMarks![id];
  refreshConduitStats(state);
  if (phaseZeroStatsReady) {
    const owner = living(state).find(unit => equipped(unit, 'master-aurora-2') &&
      (unit.native?.ultimateWardThrough ?? 0) >= state.round);
    if (owner) for (const ally of living(state)) generatedGaugePercent(owner, ally, .08, events, state);
  }
  if (phaseZeroStatsReady) for (const owner of living(state).filter(unit => equipped(unit, 'master-ember-1'))) {
    const numbers = gear(owner).numbers;
    const damage = numbers.masterEmberBurnDamage ?? 0;
    delete numbers.masterEmberBurnDamage;
    if (damage <= 0) continue;
    const target = [...living(state)].sort((a, b) => a.hp / a.stats.health - b.hp / b.stats.health)[0];
    if (target) generatedHeal(owner, target, damage * .25, events, state, target.stats.health * .12);
  }
  for (const owner of living(state).filter(hasNativeIdentity)) {
    const memory = nativeMemory(owner);
    if (memory.aftershock && memory.aftershock.dueRound <= state.round) {
      const target = foes(state).find(enemy => enemy.id === memory.aftershock?.target);
      if (target) fixed(state, owner, target, memory.aftershock.amount, 'detonation', events, true);
      delete memory.aftershock;
    }
    if (memory.faultTarget && (memory.faultThroughPhase ?? -1) <= state.round) {
      status(state, events, owner, state.enemies.find(enemy => enemy.id === memory.faultTarget) ?? owner,
        `${owner.name}'s Fault expires.`);
      delete memory.faultTarget;
      delete memory.faultCount;
      delete memory.faultThroughPhase;
    }
    if (memory.cyclone && --memory.cyclone.phases <= 0) releaseCyclone(state, owner, events);
    if (memory.bastion && memory.bastion.throughPhase <= state.round) {
      if (memory.bastion.loss > 0) {
        const shield = memory.bastion.loss;
        const created = nativeShield(state, owner, owner, shield, events, {
          ...(phaseZeroStatsReady ? { skillPower: memory.bastion.skillPower ?? 1 } : {}),
          stack: true,
        });
        if (phaseZeroStatsReady && equipped(owner, 'master-razor-2')) for (const ally of living(state).filter(unit => unit.id !== owner.id)) {
          const offer = Math.min(created * .4, ally.stats.health * .45);
          timedConduitShield(state, owner, ally, offer, 'master-razor-2', state.round, events);
        }
      }
      delete memory.bastion;
    }
    if (memory.cover && memory.cover.throughPhase <= state.round) delete memory.cover;
    if (memory.intercept && memory.intercept.throughPhase <= state.round) delete memory.intercept;
    if (memory.tauntThrough !== undefined && memory.tauntThrough <= state.round) delete memory.tauntThrough;
    if (memory.burnBoostThrough !== undefined && memory.burnBoostThrough <= state.round) delete memory.burnBoostThrough;
    if (memory.claim && memory.claim.throughPhase <= state.round) delete memory.claim;
    if (memory.reduction && memory.reduction.throughPhase <= state.round) delete memory.reduction;
    if (memory.foundation && memory.foundation.throughPhase <= state.round) delete memory.foundation;
    for (const [id, trap] of Object.entries(memory.traps ?? {})) if (trap.throughPhase <= state.round || trap.charges <= 0) delete memory.traps![id];
    for (const [id, seal] of Object.entries(memory.seals ?? {})) if (seal.throughPhase <= state.round) delete memory.seals![id];
  }
  for (const unit of state.allies) {
    if (unit.native?.ceasefire && unit.native.ceasefire.throughPhase <= state.round) delete unit.native.ceasefire;
    if (unit.native?.lead && unit.native.lead.throughPhase <= state.round) delete unit.native.lead;
  }
  nativeCleanup(state);
}

export function nativeTurnStart(state: BattleState, events: BattleEvent[]): void {
  refreshConduitStats(state);
  if (phaseZeroStatsReady) for (const owner of living(state).filter(unit => equipped(unit, 'master-orvella-2'))) {
    const numbers = gear(owner).numbers;
    if ((numbers.foundationHealDueRound ?? Number.POSITIVE_INFINITY) > state.round) continue;
    const bank = numbers.foundationHealBank ?? 0;
    delete numbers.foundationHealBank;
    delete numbers.foundationHealDueRound;
    const recipients = living(state).filter(ally => ally.hp < ally.stats.health);
    if (bank > 0 && recipients.length) {
      const share = bank / recipients.length;
      for (const ally of recipients)
        generatedHeal(owner, ally, share, events, state, ally.stats.health * .12);
    }
  }
  for (const owner of living(state).filter(unit => unit.definitionId === 'rhaziel' && hasNativeIdentity(unit))) {
    const repairs = owner.native?.repair;
    if (!repairs) continue;
    for (const [id, repair] of Object.entries(repairs)) {
      if (repair.dueRound > state.round) continue;
      delete repairs[id];
      const target = living(state).find(ally => ally.id === id);
      if (!target || repair.amount <= 0) continue;
      const restored = nativeHeal(state, owner, target, repair.amount, events, true);
      if (restored > 0 && equipped(owner, 'master-rhaziel-3') &&
          guardOnce(owner, `repair-gauge:${target.id}`, state.round))
        nativeGauge(state, target, 8, events);
    }
  }
  for (const owner of living(state).filter(hasNativeIdentity)) {
    const memory = nativeMemory(owner);
    if (owner.definitionId === 'vaelor' && memory.beatRound !== state.round) {
      memory.beat = (((memory.beat ?? 0) + 1) % 3) as 0 | 1 | 2;
      memory.beatRound = state.round;
    }
    const healing = { healed: 0, overheal: 0 };
    for (const member of state.allies) {
      const id = member.id, pending = memory.seeds?.[id];
      if (!pending || pending.dueRound > state.round) continue;
      delete memory.seeds![id];
      const target = living(state).find(unit => unit.id === id);
      if (target) {
        nativeHeal(state, owner, target, target.stats.health * pending.fraction, events, true, healing, false);
        seedPayoff(state, owner, target, !!pending.empowered);
      }
    }
    finishNativeHealing(state, owner, healing, events);
  }
  for (const ally of state.allies) if (ally.native?.hymn && ally.native.hymn.throughRound < state.round) delete ally.native.hymn;
  for (const ally of state.allies) if (ally.native?.defenseBuff && ally.native.defenseBuff.throughRound < state.round) delete ally.native.defenseBuff;
  for (const ally of state.allies) if (ally.native?.instruction && ally.native.instruction.throughRound < state.round) delete ally.native.instruction;
  for (const ally of state.allies) {
    if (ally.native?.signal && ally.native.signal.throughRound < state.round) delete ally.native.signal;
    if (ally.native?.moonflower && ally.native.moonflower.throughRound < state.round) delete ally.native.moonflower;
    if (ally.native?.openRoute && ally.native.openRoute.throughRound < state.round) delete ally.native.openRoute;
    if (ally.native?.accord && ally.native.accord.throughRound < state.round) delete ally.native.accord;
    if (ally.native?.skillPowerBuff && ally.native.skillPowerBuff.throughRound < state.round) delete ally.native.skillPowerBuff;
  }
}

export function nativeCleanup(state: BattleState): void {
  const live = new Set(foes(state).map(unit => unit.id));
  for (const enemy of state.enemies) {
    if (enemy.burn.origin !== 'conduit' && state.allies.some(owner => owner.id === enemy.burn.sourceId && hasNativeIdentity(owner) && owner.hp <= 0))
      enemy.burn.turns = 0;
  }
  for (const ally of state.allies) {
    if (!ally.native) continue;
    for (const key of ['fateMarks', 'faults'] as const)
      for (const id of Object.keys(ally.native[key] ?? {})) if (!live.has(id)) delete ally.native[key]![id];
    if (ally.hp <= 0) {
      const { fateMarks, faults, refusalUsed } = ally.native;
      ally.native = { ...(fateMarks ? { fateMarks } : {}), ...(faults ? { faults } : {}),
        ...(refusalUsed ? { refusalUsed } : {}) };
      if (!fateMarks && !faults && !refusalUsed) delete ally.native;
      continue;
    }
    if (ally.native.instruction && !living(state).some(owner => owner.id === ally.native?.instruction?.owner))
      delete ally.native.instruction;
    if (ally.native.blades) ally.native.blades = ally.native.blades.map(id => id && live.has(id) ? id : null) as [string | null, string | null];
    if (ally.native.survey && !live.has(ally.native.survey.target)) delete ally.native.survey;
    if (ally.native.quarry && !live.has(ally.native.quarry.target)) delete ally.native.quarry;
    if (ally.native.claim && !live.has(ally.native.claim.target)) delete ally.native.claim;
    for (const key of ['burns', 'traps', 'seals'] as const)
      for (const id of Object.keys(ally.native[key] ?? {})) if (!live.has(id)) delete ally.native[key]![id];
  }
}

export function nativeForecast(state: BattleState, unit: Combatant): string[] {
  if (!hasNativeIdentity(unit) || unit.definitionId !== 'aurora') return [];
  return foes(state).map(enemy => {
    const skills = enemy.enemySkills ?? [];
    if (!skills.length) return `${enemy.name}: no scheduled special.`;
    const shift = gear(enemy).numbers.scheduleShift ?? 0;
    const next = Array.from({ length: Math.max(...skills.map(skill => skill.every)) + shift + 1 }, (_, index) => state.round + index)
      .map(phase => ({ phase, skill: phase > shift ? scheduledEnemySkill(skills, phase - shift) : undefined })).find(entry => entry.skill);
    return next ? `${enemy.name}: ${next.skill!.name}, enemy phase ${next.phase}.` : `${enemy.name}: no scheduled special.`;
  });
}

export interface NativeReadoutRow {
  label: string;
  value: string;
  description: string;
  icons?: readonly StatusArtId[];
  /** Description is static rule text (kept in the Battle menu reference, omitted from field cards). */
  rule?: boolean;
}

export interface NativeMarker { id: string; owner: string; label: string; value: string; icon?: StatusArtId }

/** Native effects that another squad member's kit has placed on this unit (Seeds, Cover, Traps, Seals, lodged blades, ...). */
export function nativeMarkers(state: BattleState, unit: Combatant): NativeMarker[] {
  if (unit.hp <= 0) return [];
  const markers: NativeMarker[] = [];
  const name = (id: string) => state.enemies.find(enemy => enemy.id === id)?.name ?? state.allies.find(ally => ally.id === id)?.name ?? id;
  if (unit.side === 'ally' && unit.native?.instruction && !hasNativeIdentity(unit)) {
    const kind = unit.native.instruction.kind;
    markers.push({ id: 'instruction', owner: unit.native.instruction.owner, label: `${kind[0].toUpperCase()}${kind.slice(1)} Instruction`,
      value: `next action · ${name(unit.native.instruction.owner)}`, icon: `native-disciple-${kind}` });
  }
  if (unit.side === 'ally' && nativeHymn(unit, state.round)) {
    const hymn = nativeHymn(unit, state.round)!;
    markers.push({ id: 'hymn', owner: hymn.owner, label: 'Hymn of Broken Glass',
      value: `Critical Damage +${Math.round(hymn.criticalDamage * 100)}% · Skill Power +${Math.round(hymn.skillPower * 100)}% · through player turn ${hymn.throughRound}` });
  }
  const buff = unit.side === 'ally' ? unit.native?.defenseBuff : undefined;
  if (buff && buff.throughRound >= state.round) markers.push({ id: 'gate-ward', owner: unit.id,
    label: unit.definitionId === 'neralis' ? 'Station Defense' : unit.definitionId === 'varkhel' ? 'Warning Chain' : 'Gate Ward',
    value: `Defense +${Math.round(buff.fraction * 100)}% · through player turn ${buff.throughRound}`, icon: 'ward' });
  for (const owner of state.allies.filter(hasNativeIdentity)) {
    const claim = owner.native?.claim;
    if (unit.side === 'enemy' && claim?.target === unit.id && claim.throughPhase >= state.round)
      markers.push({ id: 'reapers-claim', owner: owner.id, label: 'Reaper’s Claim', value: `+12% direct damage taken · through enemy phase ${claim.throughPhase}` });
    const mark = owner.native?.fateMarks?.[unit.id];
    if (unit.side === 'enemy' && mark && mark.throughPhase >= state.round)
      markers.push({ id: 'fate-mark', owner: owner.id, label: 'Fate-seared Mark',
        value: `${mark.stacks}/5 · damage taken +${mark.stacks * 10}% · Severed Prophecy +45% · through enemy phase ${mark.throughPhase}`, icon: 'calamitic-fate-mark' });
    const faults = owner.native?.faults?.[unit.id];
    if (unit.side === 'enemy' && faults)
      markers.push({ id: 'fault', owner: owner.id, label: 'Fractalized Incision', value: `${faults}/3 · squad damage +${faults * 10}%`, icon: 'calamitic-fault' });
    if (unit.side === 'ally' && owner.definitionId === 'ozriel' && owner.hp > 0)
      markers.push({ id: 'refusal', owner: owner.id, label: 'Refusal', value: owner.native?.refusalUsed?.includes(unit.id) ? 'Used this encounter' : 'Ready · once this encounter', icon: 'calamitic-refusal' });
    if (owner.hp <= 0 || owner.id === unit.id) continue;
    const memory = owner.native ?? {};
    if (unit.side === 'ally') {
      const seed = memory.seeds?.[unit.id];
      if (seed) {
        const empowered = seed.fraction >= nativeBalance.flora.empoweredSeed;
        markers.push({ id: 'seed', owner: owner.id, label: empowered ? 'Empowered Seed' : 'Seed',
          value: `heals ${Math.round(seed.fraction * 100)}% max HP on player turn ${seed.dueRound}`,
          icon: empowered ? 'native-flora-empowered-seed' : 'native-flora-seed' });
      }
      if (memory.cover && memory.cover.throughPhase >= state.round && memory.cover.targets.includes(unit.id))
        markers.push({ id: 'cover', owner: owner.id, label: 'Cover', value: `${owner.name} takes ${Math.round(memory.cover.fraction * 100)}% of direct hits · through enemy phase ${memory.cover.throughPhase}`, icon: 'native-bruno-cover' });
      if (memory.foundation && memory.foundation.throughPhase >= state.round)
        markers.push({ id: 'foundation', owner: owner.id, label: 'Foundation', value: `${Math.ceil(memory.foundation.durability)} durability · ${owner.name}`, icon: 'native-orvella-foundation' });
      if (memory.intercept && memory.intercept.throughPhase >= state.round && memory.intercept.targets.includes(unit.id))
        markers.push({ id: 'intercept', owner: owner.id, label: 'Interception',
          value: `${owner.name} redirects ${Math.round(memory.intercept.fraction * 100)}% of enemy direct damage · through enemy phase ${memory.intercept.throughPhase}` });
      if (memory.repair?.[unit.id])
        markers.push({ id: 'repair', owner: owner.id, label: 'Repair',
          value: `${Math.round(memory.repair[unit.id].amount)} heals on player turn ${memory.repair[unit.id].dueRound}` });
      if (unit.native?.signal)
        markers.push({ id: 'signal', owner: unit.native.signal.owner, label: 'Signal',
          value: `next damaging Skill or Last Flare +${Math.round(unit.native.signal.bonus * 100)}% · through player turn ${unit.native.signal.throughRound}` });
      if (unit.native?.moonflower)
        markers.push({ id: 'moonflower', owner: unit.native.moonflower.owner, label: 'Moonflower',
          value: `next damaging Skill or Last Flare +${Math.round(unit.native.moonflower.bonus * 100)}% · through player turn ${unit.native.moonflower.throughRound}` });
      if (unit.native?.openRoute)
        markers.push({ id: 'open-route', owner: unit.native.openRoute.owner, label: 'Open Route',
          value: `next damaging Skill or Last Flare ignores ${Math.round(unit.native.openRoute.pierce * 100)}% Defense · through player turn ${unit.native.openRoute.throughRound}` });
      if (unit.native?.accord && unit.native.accord.throughRound >= state.round)
        markers.push({ id: 'accord', owner: unit.native.accord.owner, label: 'Accord', value: `boost against Terms · through player turn ${unit.native.accord.throughRound}` });
      if (unit.native?.ceasefire && unit.native.ceasefire.throughPhase >= state.round)
        markers.push({ id: 'ceasefire', owner: unit.native.ceasefire.owner, label: 'Ceasefire',
          value: `${unit.native.ceasefire.charges ? 'next direct hit' : 'spent'} −${Math.round(unit.native.ceasefire.fraction * 100)}% · through enemy phase ${unit.native.ceasefire.throughPhase}` });
      if (unit.native?.lead && unit.native.lead.throughPhase >= state.round)
        markers.push({ id: 'lead', owner: unit.native.lead.owner, label: 'Lead',
          value: `enemy direct damage −${Math.round(unit.native.lead.fraction * 100)}% · through enemy phase ${unit.native.lead.throughPhase}` });
      if (unit.native?.skillPowerBuff && unit.native.skillPowerBuff.throughRound >= state.round)
        markers.push({ id: 'skill-power', owner: unit.native.skillPowerBuff.owner, label: 'Skill Power',
          value: `+${Math.round(unit.native.skillPowerBuff.fraction * 100)}% · through player turn ${unit.native.skillPowerBuff.throughRound}` });
    } else {
      const trap = memory.traps?.[unit.id];
      if (trap && trap.charges > 0) {
        const empowered = trap.empowered === true;
        markers.push({ id: 'trap', owner: owner.id, label: empowered ? 'Empowered Thorn Trap' : 'Thorn Trap',
          value: `${trap.charges} charge${trap.charges === 1 ? '' : 's'} · through enemy phase ${trap.throughPhase}`,
          icon: empowered ? 'native-thornia-empowered-trap' : 'native-thornia-trap' });
      }
      const seal = memory.seals?.[unit.id];
      if (seal) markers.push({ id: 'seal', owner: owner.id, label: 'Seal',
        value: `next special -${Math.round(seal.fraction * 100)}% · through enemy phase ${seal.throughPhase}`, icon: 'native-aurora-seal' });
      const lodged = (memory.blades ?? []).filter(id => id === unit.id).length;
      if (lodged) markers.push({ id: 'blade', owner: owner.id, label: lodged === 2 ? 'Lodged Blades' : 'Lodged Blade',
        value: `${lodged} · ${owner.name}`, icon: 'native-elise-lodged-blade' });
      if (memory.survey?.target === unit.id) markers.push({ id: 'survey', owner: owner.id, label: 'Survey',
        value: `${memory.survey.points} point${memory.survey.points === 1 ? '' : 's'} · ${owner.name}`, icon: 'native-nerithe-survey' });
      if (memory.quarry?.target === unit.id) markers.push({ id: 'quarry', owner: owner.id, label: 'Quarry',
        value: `${memory.quarry.round === state.round ? memory.quarry.contributors.length : 0} contributors this turn · ${owner.name}`, icon: 'native-rosetta-quarry' });
      if (owner.definitionId === 'veyr' && memory.faultTarget === unit.id &&
          (memory.faultThroughPhase ?? -1) >= state.round)
        markers.push({ id: 'fault', owner: owner.id, label: 'Fault',
          value: `${memory.faultCount ?? 0}/4 · Defense −${Math.min(40, (memory.faultCount ?? 0) * 8)}% · through enemy phase ${memory.faultThroughPhase}` });
    }
  }
  return markers;
}

export function nativeReadout(state: BattleState, unit: Combatant): NativeReadoutRow[] {
  if (!hasNativeIdentity(unit) && !unit.native?.instruction && !nativeHymn(unit, state.round)) return [];
  const memory = unit.native ?? {};
  const rows: NativeReadoutRow[] = [];
  const add = (label: string, value: string, description: string, icons: readonly StatusArtId[] = [], rule = false) =>
    rows.push({ label, value, description, icons, ...(rule ? { rule } : {}) });
  if (unit.definitionId === 'ozriel') for (const recipient of state.allies)
    add('Refusal', memory.refusalUsed?.includes(recipient.id) ? 'Used' : unit.hp > 0 ? 'Ready' : 'Unavailable',
      `${recipient.name}; once per encounter while Ozriel is alive; a lethal hit leaves 1 HP, never revives.`, ['calamitic-refusal']);
  if (unit.definitionId === 'neralis')
    add('Current', `${memory.current ?? 0}/${phase2CounterCap(unit, 1)}`,
      'Gain once per action from effective Normal damage or native healing. Skill2 and Last Flare spend Current.',
      ['native-phase2-current'], true);
  if (unit.definitionId === 'varkhel')
    add('Tension', `${memory.tension ?? 0}/${phase2CounterCap(unit, 1)}`,
      'Gain from effective enemy direct Health or Shield damage once per enemy phase, or an effective Normal Attack. Skill2 and Last Flare spend Tension.',
      ['native-phase2-tension'], true);
  if (unit.definitionId === 'seravelle')
    add('Cadence', `${memory.cadence ?? 0}/${phase2CounterCap(unit, 1)}`,
      'Gain at most once per round from an effective manual Normal Attack while Seravelle lives. Move as One spends Cadence.',
      ['native-phase2-cadence'], true);
  if (unit.definitionId === 'velmira')
    add('Crosscut', `${memory.crosscut ?? 0}/${phase2CounterCap(unit, 1)}`,
      `Ordinary Skill sequence: ${memory.previousSkill ?? 'not started'}. Only alternating ordinary Skills add Crosscut; Last Flare spends it.`,
      ['native-phase2-crosscut'], true);
  for (const [id, mark] of Object.entries(memory.fateMarks ?? {})) if (mark.throughPhase >= state.round)
    add('Fate-seared Mark', `${mark.stacks}/5`, `${state.enemies.find(enemy => enemy.id === id)?.name}; +${mark.stacks * 10}% damage taken and +45% Severed Prophecy; through enemy phase ${mark.throughPhase}.`, ['calamitic-fate-mark']);
  for (const [id, faults] of Object.entries(memory.faults ?? {}))
    add('Fractalized Incision', `${faults}/3`, `${state.enemies.find(enemy => enemy.id === id)?.name}; +${faults * 10}% squad damage; Glass Meridian consumes for +20% each.`, ['calamitic-fault']);
  const hymn = nativeHymn(unit, state.round);
  if (hymn) add('Hymn of Broken Glass', `Critical Damage +${Math.round(hymn.criticalDamage * 100)}% · Skill Power +${Math.round(hymn.skillPower * 100)}%`,
    `Refreshes without stacking; through player turn ${hymn.throughRound}.`);
  if (hasNativeIdentity(unit) && unit.definitionId === 'bliss') {
    const others = living(state).filter(ally => ally.id !== unit.id);
    const acted = others.filter(ally => ally.spent).length;
    const posture = acted === 0 ? 'opening' : acted === others.length ? 'closing' : 'passing';
    add('Posture', posture[0].toUpperCase() + posture.slice(1),
      'Changes with the other living squad members who have acted this player turn.', [`native-bliss-${posture}`], true);
  }
  for (const recipient of state.allies) {
    const shields = recipient.conduitRuntime?.layers?.filter(layer => layer.native && layer.owner === unit.id && layer.amount > 0) ?? [];
    if (!shields.length) continue;
    const total = shields.reduce((sum, layer) => sum + layer.amount, 0);
    add('Shield', `${Math.round(total)}`,
      `${recipient.name}; lasts until broken${shields.length > 1 ? ` (${shields.length} stacked)` : ''}${shields.some(layer => layer.firstReduction) ? '; first-hit reduction ready' : ''}.`, ['ward']);
  }
  if (memory.cyclone) add('Cyclone', `${memory.cyclone.gusts} Gusts`, `${memory.cyclone.phases} enemy phases until release.`, ['native-atmoso-cyclone']);
  if (unit.definitionId === 'elise') {
    const blades = memory.blades ?? [null, null];
    add('Shuriken', blades.map(id => state.enemies.find(enemy => enemy.id === id)?.name ?? 'Held').join(' / '),
      'Lodge two blades; recall for fixed strikes and convergence.',
      blades.map(id => state.enemies.some(enemy => enemy.id === id) ? 'native-elise-lodged-blade' : 'native-elise-held-blade'), true);
  }
  if (unit.definitionId === 'crinso') add('Combo', `${memory.combo ?? 0} · ${memory.edge === 'gold' ? 'Last: Golden Edge' : memory.edge === 'crimson' ? 'Last: Crimson Rupture' : 'New chain'}`,
    'Alternate Golden Edge and Crimson Rupture to build Combo; Last Flare spends it.',
    ['native-crinso-combo', ...(memory.edge ? [`native-crinso-${memory.edge}-edge` as const] : [])], true);
  if (unit.definitionId === 'vaelor') add('Beat', ['Tune', 'Rise', 'Crescendo'][memory.beat ?? 0],
    'Advances every global player turn, including recovery.', [(['native-vaelor-tune', 'native-vaelor-rise', 'native-vaelor-crescendo'] as const)[memory.beat ?? 0]], true);
  if (unit.definitionId === 'caldrex') {
    add('Heat', `${memory.heat ?? 0}/${nativeHeatCap(unit)}`, 'Banked when an enemy direct attack damages Health or Shield, once per enemy phase; Cinder Discharge and Nothing Beyond These Gates spend it.', [], true);
    if (memory.tauntThrough !== undefined && memory.tauntThrough >= state.round) add('Taunt', `through enemy phase ${memory.tauntThrough}`, 'Enemies target Caldrex.', ['suppression']);
    if (memory.burnBoostThrough !== undefined && memory.burnBoostThrough >= state.round) add('Burn Surge', '+25%', `Allied ability-applied Burn through enemy phase ${memory.burnBoostThrough}.`, ['burn']);
  }
  if (unit.definitionId === 'solenne') {
    add('Stillness', `${memory.stillness ?? 0}/4`, `Each hit consumes 1 Stillness to reduce damage by ${equipped(unit, 'master-solenne-1') ? 35 : 20}%.`, [], true);
    if (memory.tauntThrough !== undefined && memory.tauntThrough >= state.round) add('Taunt', `through enemy phase ${memory.tauntThrough}`, 'Enemies target Solenne.', ['suppression']);
  }
  if (unit.definitionId === 'myrthen') {
    const season = memory.season ?? 'sprout';
    add('Season', `${season[0].toUpperCase()}${season.slice(1)}`, 'Skills advance Sprout, Bloom, then Harvest; Harvest empowers the next Skill or Last Flare.', [], true);
    if (memory.claim && memory.claim.throughPhase >= state.round) add('Reaper’s Claim', state.enemies.find(enemy => enemy.id === memory.claim?.target)?.name ?? '', `+12% direct damage taken through enemy phase ${memory.claim.throughPhase}.`);
  }
  if (memory.defenseBuff && memory.defenseBuff.throughRound >= state.round) add('Gate Ward', `Defense +${Math.round(memory.defenseBuff.fraction * 100)}%`, `Through player turn ${memory.defenseBuff.throughRound}.`, ['ward']);
  if (memory.foundation) add('Foundation', `${Math.ceil(memory.foundation.durability)}/${Math.ceil(memory.foundation.maximum)}`,
    `Shared durability through enemy phase ${memory.foundation.throughPhase}.`, ['native-orvella-foundation']);
  if (unit.definitionId === 'razor') add('Wounds', `${Math.round(memory.wounds ?? 0)}`,
    'Stored from direct enemy HP loss.', ['native-razor-wounds']);
  if (unit.definitionId === 'maerion') {
    const capacity = unit.stats.health * (equipped(unit, 'master-maerion-1') ? .85 : .45);
    add('Unreturned', `${Math.round(memory.unreturned ?? 0)}/${Math.round(capacity)}`,
      'Direct Health damage taken by allies; redirected damage and damage-over-time are excluded. Crescent Triage spends none; Ferry and Last Flare spend the stored amount.');
  }
  if (unit.definitionId === 'caevren')
    add('Load', `${memory.load ?? 0}/${equipped(unit, 'master-caevren-1') ? 5 : 3}`,
      'Gain one when an enemy direct attack damages Caevren’s Health or Shield, once per enemy phase. Counterweight Covenant and Last Flare spend Load.');
  if (unit.definitionId === 'vespera')
    add('Beacon', `${memory.beacon ?? 0}/${equipped(unit, 'master-vespera-1') ? 4 : 3}`,
      'Gain one when another living ally spends Vespera’s Signal, once per player turn. Last Flare spends Beacon.');
  if (unit.definitionId === 'ilyss')
    add('Severance', `${memory.severance ?? 0}/${equipped(unit, 'master-ilyss-1') ? 4 : 3}`,
      'Gain when Skills or Last Flare remove Burn or Weaken, once per player turn. Last Flare spends Severance.');
  if (unit.definitionId === 'asteriel') {
    add('Cultivation', memory.path ? memory.path[0].toUpperCase() + memory.path.slice(1) : 'Unchosen',
      'Skill1 enters Shelter; Skill2 enters Flourish. Changing between paths grants one Promise.');
    add('Promise', `${memory.promise ?? 0}/3`, 'Earned by changing cultivation path; Last Flare spends Promise.');
  }
  if (unit.definitionId === 'serapha')
    add('Interval', `${memory.interval ?? 0}/${equipped(unit, 'master-serapha-1') ? 4 : 3}`,
      'Gain when an enemy carrying Serapha’s Weaken uses a direct attack, once per enemy phase. Last Flare spends Interval.');
  if (unit.definitionId === 'rhaziel') for (const [id, repair] of Object.entries(memory.repair ?? {}))
    add('Repair', `${Math.round(repair.amount)}`, `${state.allies.find(ally => ally.id === id)?.name}; due player turn ${repair.dueRound}.`);
  if (unit.definitionId === 'oryn') {
    if (memory.terms) add('Terms', state.enemies.find(enemy => enemy.id === memory.terms?.target)?.name ?? '',
      `Direct damage taken −${state.enemies.find(enemy => enemy.id === memory.terms?.target)?.weakenFraction
        ? Math.round((state.enemies.find(enemy => enemy.id === memory.terms?.target)?.weakenFraction ?? 0) * 100) : 0}% · through enemy phase ${memory.terms.throughPhase}.`);
    add('Accord', `${Object.keys(memory.accords ?? {}).length} ally`,
      'Once per player turn, an accorded ally deals bonus direct damage to the Terms target.');
  }
  if (unit.definitionId === 'thessara')
    add('Reserve', `${memory.reserve ?? 0}/${equipped(unit, 'master-thessara-1') ? 5 : 4}`,
      'Normal Attacks and Skill1 that hit directly gain one Reserve. Skill2 and Last Flare spend it.');
  if (unit.definitionId === 'elaris' && memory.branchTarget)
    add('Branch', `${memory.branches ?? 0}/${equipped(unit, 'master-elaris-1') ? 4 : 3}`,
      `${state.enemies.find(enemy => enemy.id === memory.branchTarget)?.name ?? ''}; Normal Attacks and Skill1 build Branch. Skill2 and Last Flare spend it.`);
  if (unit.definitionId === 'veyr' && memory.faultTarget)
    add('Fault', `${memory.faultCount ?? 0}/${equipped(unit, 'master-veyr-1') ? 4 : 3}`,
      `${state.enemies.find(enemy => enemy.id === memory.faultTarget)?.name ?? ''}; Defense −${Math.min(40, (memory.faultCount ?? 0) * 8)}% · through enemy phase ${memory.faultThroughPhase}.`);
  if (unit.definitionId === 'aureth') {
    add('Momentum', `${memory.momentum ?? 0}/${equipped(unit, 'master-aureth-1') ? 4 : 3}`,
      'Moving Lead to a different ally grants one Momentum, once per player turn. Last Flare spends Momentum.');
    add('Lead', state.allies.find(ally => ally.id === memory.leadTarget)?.name ?? 'Unassigned',
      'The Lead holder takes reduced enemy direct damage while Aureth lives.');
  }
  if (memory.bastion && memory.bastion.throughPhase >= state.round) add('Bastion', '30% direct-hit reduction',
    `Through enemy phase ${memory.bastion.throughPhase}; ${Math.round(memory.bastion.loss)} HP lost stored for the following shield.`, ['native-razor-bastion']);
  if (memory.ultimateWardThrough !== undefined && memory.ultimateWardThrough >= state.round) add('Ultimate Ward',
    `${Number((Math.min(1, memory.ultimateWardReduction ?? .5) * 100).toFixed(2))}% ultimate damage reduction`,
    `Through enemy phase ${memory.ultimateWardThrough}.`, ['native-aurora-ultimate-ward']);
  if (memory.survey) add('Survey', `${memory.survey.points}`, state.enemies.find(enemy => enemy.id === memory.survey?.target)?.name ?? '', ['native-nerithe-survey']);
  if (memory.quarry) add('Quarry', state.enemies.find(enemy => enemy.id === memory.quarry?.target)?.name ?? '',
    `${memory.quarry.round === state.round ? memory.quarry.contributors.length : 0} distinct contributors this turn.`, ['native-rosetta-quarry']);
  if (memory.cover) add('Cover', memory.cover.targets.map(id => state.allies.find(ally => ally.id === id)?.name ?? id).join(', '),
    `Redirect ${memory.cover.fraction * 100}% through enemy phase ${memory.cover.throughPhase}.`, ['native-bruno-cover']);
  if (memory.instruction) add('Instruction', memory.instruction.kind[0].toUpperCase() + memory.instruction.kind.slice(1), `Next action; expires after player turn ${memory.instruction.throughRound}.`,
    [`native-disciple-${memory.instruction.kind}`]);
  for (const [id, pending] of Object.entries(memory.seeds ?? {})) add(pending.fraction >= nativeBalance.flora.empoweredSeed ? 'Empowered Seed' : 'Seed', `${pending.fraction * 100}%`,
    `${state.allies.find(ally => ally.id === id)?.name}: player turn ${pending.dueRound}.`,
    [pending.fraction >= nativeBalance.flora.empoweredSeed ? 'native-flora-empowered-seed' : 'native-flora-seed']);
  for (const [id, trap] of Object.entries(memory.traps ?? {})) add(trap.empowered ? 'Empowered Thorn Trap' : 'Thorn Trap', `${trap.charges} charges`,
    `${state.enemies.find(enemy => enemy.id === id)?.name}; through phase ${trap.throughPhase}.`,
    [trap.empowered ? 'native-thornia-empowered-trap' : 'native-thornia-trap']);
  for (const [id, seal] of Object.entries(memory.seals ?? {})) add('Seal', `${seal.fraction * 100}%`,
    `${state.enemies.find(enemy => enemy.id === id)?.name}; through phase ${seal.throughPhase}.`, ['native-aurora-seal']);
  return rows;
}
