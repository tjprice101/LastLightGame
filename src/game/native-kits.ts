import { type ActionId } from '../content/combat';
import { damageAmount, type BattleEvent, type BattleState, type Combatant } from './battle';
import { scheduledEnemySkill } from '../content/enemy-skills';
import { debuffSnapshot } from './battle-debuffs';
import { nativeBalance } from '../content/native-balance';
import type { StatusArtId } from '../content/status-art';
import { applyConduitBurn, applyConduitWeaken, nativeGauge, nativeHeal, nativeShield,
  conduitBurnTick, afterConduitBurn, gear, equipped, value, nativeTargetDefense,
  generatedShield, generatedStrike, finishNativeHealing } from './conduit-runtime';

export interface NativeKitState {
  burns?: Record<string, { damage: number; turns: number }>;
  seeds?: Record<string, { fraction: number; dueRound: number }>;
  cyclone?: { gusts: number; phases: number; contributors: Record<string, number> };
  blades?: [string | null, string | null];
  cover?: { targets: string[]; fraction: number; throughPhase: number };
  instruction?: { kind: 'strike' | 'shelter' | 'resolve'; owner: string; throughRound: number };
  seals?: Record<string, { fraction: number; throughPhase: number }>;
  ultimateWardThrough?: number;
  wounds?: number;
  bastion?: { throughPhase: number; loss: number };
  quarry?: { target: string; round: number; contributors: string[]; paidRound?: number };
  traps?: Record<string, { charges: number; coefficient: number; throughPhase: number }>;
  combo?: number;
  edge?: 'gold' | 'crimson';
  survey?: { target: string; points: number };
  foundation?: { durability: number; maximum: number; throughPhase: number };
  beat?: 0 | 1 | 2;
  beatRound?: number;
  reduction?: { fraction: number; throughPhase: number };
  firstWard?: Record<string, { throughPhase: number }>;
  hostileReduction?: number;
}

export type NativeDamageKind = 'burn' | 'detonation' | 'cyclone' | 'recall' | 'revenge' | 'trap' | 'demolition' | 'redirect';
type Direct = (targets: Combatant[], coefficient: number, pierce?: number, criticalBonus?: number) => void;
const living = (state: BattleState) => state.allies.filter(unit => unit.hp > 0);
const foes = (state: BattleState) => state.enemies.filter(unit => unit.hp > 0);
export const hasNativeIdentity = (unit: Combatant): boolean => !unit.captured && unit.kit?.nativeIdentity === true;
export const nativeMemory = (unit: Combatant): NativeKitState => unit.native ??= {};

function status(events: BattleEvent[], owner: Combatant, target: Combatant, message: string, amount = 0): void {
  events.push({ kind: 'status', source: owner.id, target: target.id, amount, critical: false, origin: 'native', message });
}

function fixed(state: BattleState, owner: Combatant, target: Combatant, power: number, kind: NativeDamageKind, events: BattleEvent[], bypass = false): void {
  if (owner.hp <= 0 || target.hp <= 0 || power <= 0) return;
  const attack = kind === 'revenge' || kind === 'demolition' ? power : owner.stats.damage;
  const damage = bypass ? Math.round(power) : damageAmount(attack, power / attack, nativeTargetDefense(state, target), false);
  const absorbed = Math.min(target.shield, damage);
  target.shield -= absorbed;
  const loss = Math.min(target.hp, damage - absorbed);
  target.hp -= loss;
  events.push({ kind: 'damage', source: owner.id, target: target.id, amount: loss, critical: false,
    origin: 'native', nativeKind: kind, periodic: kind === 'burn', shieldRemaining: target.shield, shieldAbsorbed: absorbed,
    debuffs: debuffSnapshot(target),
    message: `${owner.name}: ${kind} deals ${loss} damage to ${target.name}${absorbed ? ` (${absorbed} shield absorbed)` : ''}.` });
}

function seed(state: BattleState, owner: Combatant, target: Combatant, fraction: number, events: BattleEvent[]): void {
  fraction *= nativeSupportMultiplier(state, owner);
  if (equipped(owner, 'botanic-graft-covenant')) fraction *= 1 + value(state, owner, 'botanic-graft-covenant', .2, .4);
  const seeds = nativeMemory(owner).seeds ??= {};
  if ((seeds[target.id]?.fraction ?? 0) > fraction) return;
  seeds[target.id] = { fraction, dueRound: state.round + 1 };
  status(events, owner, target, `${target.name} holds a ${fraction * 100}% Seed for the next player turn.`);
}

function releaseCyclone(state: BattleState, owner: Combatant, events: BattleEvent[]): void {
  const field = owner.native?.cyclone;
  if (!field) return;
  delete owner.native!.cyclone;
  for (const target of foes(state)) fixed(state, owner, target, owner.stats.damage * (.7 + .3 * field.gusts), 'cyclone', events);
}

function recall(state: BattleState, owner: Combatant, events: BattleEvent[]): void {
  const blades = nativeMemory(owner).blades ??= [null, null];
  const targets = [...blades];
  blades[0] = blades[1] = null;
  for (const id of targets) {
    const target = state.enemies.find(enemy => enemy.id === id && enemy.hp > 0);
    if (target) fixed(state, owner, target, owner.stats.damage * .9, 'recall', events);
  }
  if (targets[0] && targets[0] === targets[1]) {
    const target = state.enemies.find(enemy => enemy.id === targets[0] && enemy.hp > 0);
    if (target) fixed(state, owner, target, owner.stats.damage * .6, 'recall', events);
  }
}

export function nativeInstructionDamage(state: BattleState, owner: Combatant): number {
  const instruction = owner.native?.instruction;
  return instruction && instruction.throughRound >= state.round && living(state).some(unit => unit.id === instruction.owner) &&
    instruction.kind !== 'shelter' ? 1.3 : 1;
}

export function nativeSupportMultiplier(state: BattleState, owner: Combatant): number {
  const instruction = owner.native?.instruction;
  return instruction && instruction.throughRound >= state.round && living(state).some(unit => unit.id === instruction.owner) &&
    instruction.kind !== 'strike' ? 1.35 : 1;
}

export function nativeAction(state: BattleState, owner: Combatant, action: ActionId, targetId: string,
  events: BattleEvent[], direct: Direct, activation: Parameters<typeof applyConduitBurn>[4]): void {
  const memory = nativeMemory(owner);
  const target = state.enemies.find(enemy => enemy.id === targetId && enemy.hp > 0);
  const ally = state.allies.find(unit => unit.id === targetId && unit.hp > 0);
  const hit = (coefficient: number, all = false, pierce = 0, crit = 0, chosen = target) =>
    direct(all ? foes(state) : chosen ? [chosen] : [], coefficient * (action === 'light' ? 1 : nativeBalance.skillDamageScale), pierce, crit);
  const allies = living(state);
  const other = allies.filter(unit => unit.id !== owner.id);
  const acted = other.filter(unit => unit.spent).length;
  const posture = acted === 0 ? 'opening' : acted === other.length ? 'closing' : 'passing';
  const shield = (recipient: Combatant, fraction: number, phases: number, firstReduction = 0) =>
    nativeShield(state, owner, recipient, recipient.stats.health * fraction, events,
      { throughPhase: state.round + phases - 1, firstReduction });
  const burn = (recipient: Combatant, fraction: number) => {
    const burns = memory.burns ??= {};
    const previous = burns[recipient.id];
    const damage = applyConduitBurn(state, owner, recipient, owner.stats.damage * fraction, activation);
    burns[recipient.id] = { damage: Math.max(previous?.damage ?? 0, damage), turns: 3 };
    recipient.burn = { ...burns[recipient.id], sourceId: owner.id, origin: 'native' };
    status(events, owner, recipient, `${recipient.name}: Infernis Burn, ${burns[recipient.id].damage} per phase for 3 phases.`);
  };
  if (action === 'light') {
    hit(1);
    if (owner.definitionId === 'nerithe' && target?.hp) {
      memory.survey = { target: target.id, points: memory.survey?.target === target.id ? memory.survey.points + 1 : 1 };
    }
    return;
  }
  switch (owner.definitionId) {
    case 'ember':
      if (action === 'skill1') { hit(1.6); if (target?.hp) burn(target, .25); }
      if (action === 'skill2') {
        hit(1.1, true);
        for (const enemy of foes(state).filter(enemy => !equipped(owner, 'master-ember-2') || enemy.id === targetId)) {
          const stored = memory.burns?.[enemy.id];
          if (!stored) continue;
          const conserved = equipped(owner, 'master-ember-3');
          const ticks = Math.min(conserved ? 1 : 2, stored.turns);
          stored.turns -= ticks;
          activation.spent.ember = (activation.spent.ember ?? 0) + ticks;
          fixed(state, owner, enemy, stored.damage * ticks * (conserved ? 2 : 1), 'detonation', events, true);
          if (enemy.burn.sourceId === owner.id) enemy.burn.turns = stored.turns;
        }
      }
      if (action === 'ultimate') { hit(2, true); for (const enemy of foes(state)) burn(enemy, .45); }
      break;
    case 'tide':
      if (action === 'skill1') {
        hit(1.5);
        if (target?.hp) applyConduitWeaken(state, owner, target, .25, events, action, 1);
      }
      if (action === 'skill2' && ally) shield(ally, nativeBalance.tizu.shelter * (equipped(owner, 'master-tide-2') ? 3 : 1), 1);
      if (action === 'ultimate') for (const recipient of allies) shield(recipient, nativeBalance.tizu.oceanMemory, 2, .3);
      break;
    case 'sprout':
      if (action === 'skill1') {
        hit(1.4);
        const recipient = [...allies].sort((a, b) => a.hp / a.stats.health - b.hp / b.stats.health)[0];
        if (recipient) seed(state, owner, recipient, nativeBalance.flora.seed, events);
      }
      if (action === 'skill2') {
        for (const recipient of allies) {
          const pending = memory.seeds?.[recipient.id];
          if (pending) nativeHeal(state, owner, recipient, recipient.stats.health * pending.fraction, events, true, activation, false);
        }
        delete memory.seeds;
        for (const recipient of allies) seed(state, owner, recipient, nativeBalance.flora.seed, events);
      }
      if (action === 'ultimate') for (const recipient of allies) {
        nativeHeal(state, owner, recipient, recipient.stats.health * nativeBalance.flora.immediateHeal, events, true, activation);
        seed(state, owner, recipient, nativeBalance.flora.empoweredSeed, events);
      }
      break;
    case 'atmoso':
      if (action === 'skill1') { hit(1.8); releaseCyclone(state, owner, events); }
      if (action === 'skill2') { releaseCyclone(state, owner, events); memory.cyclone = { gusts: 0, phases: 2, contributors: {} }; }
      if (action === 'ultimate') { releaseCyclone(state, owner, events); hit(2, true); }
      break;
    case 'elise': {
      const blades = memory.blades ??= [null, null];
      if (action === 'skill1') {
        const held = blades.indexOf(null);
        hit(held < 0 ? 1.4 : 1.1);
        if (held >= 0 && target?.hp) blades[held] = target.id;
      }
      if (action === 'skill2') {
        if (blades.every(blade => blade === null)) hit(1.4);
        else recall(state, owner, events);
      }
      if (action === 'ultimate') { recall(state, owner, events); hit(2.6); }
      break;
    }
    case 'bliss':
      if (action === 'skill1') {
        hit(1.7, false, 0, posture === 'opening' ? .25 : 0);
        if (posture === 'closing') {
          const recipient = [...other].sort((a, b) => a.hp / a.stats.health - b.hp / b.stats.health)[0];
          if (recipient) nativeHeal(state, owner, recipient, recipient.stats.health * .06, events, true, activation);
        }
      }
      if (action === 'skill2') {
        hit(1.2, true);
        if (posture === 'opening') for (const recipient of allies) {
          const prior = recipient.attackBoost?.throughRound ?? 0;
          if (prior < state.round || (recipient.attackBoost?.fraction ?? 0) <= .1)
            recipient.attackBoost = { fraction: .1, throughRound: state.round, sourceId: owner.id, origin: 'native' };
        }
        if (posture === 'closing') for (const recipient of allies) shield(recipient, .06, 1);
        if (activation.healExtra > 0) for (const recipient of other)
          nativeHeal(state, owner, recipient, 0, events, true, activation);
      }
      if (action === 'ultimate') {
        hit(2.5, true, 0, posture === 'opening' ? .3 : 0);
        if (posture === 'closing') for (const recipient of other)
          nativeHeal(state, owner, recipient, recipient.stats.health * .1, events, true, activation);
      }
      break;
    case 'bruno':
      if (action === 'skill1') hit(1.9);
      if (action === 'skill2') {
        if (!other.length) memory.reduction = { fraction: .2, throughPhase: state.round };
        else if (ally && ally.id !== owner.id) memory.cover = { targets: [ally.id], fraction: equipped(owner, 'master-bruno-3') ? .35 : .5, throughPhase: state.round };
      }
      if (action === 'ultimate') {
        memory.cover = { targets: other.map(unit => unit.id), fraction: .4, throughPhase: state.round + 1 };
        nativeShield(state, owner, owner, owner.stats.health * .2, events, { throughPhase: state.round + 1 });
      }
      break;
    case 'disciple': {
      for (const recipient of state.allies) if (recipient.native?.instruction?.owner === owner.id)
        delete recipient.native.instruction;
      const recipients = action === 'ultimate' ? allies : ally ? [ally] : [];
      for (const recipient of recipients) {
        nativeMemory(recipient).instruction = { kind: action === 'skill1' ? 'strike' : action === 'skill2' ? 'shelter' : 'resolve',
          owner: owner.id, throughRound: state.round + (equipped(owner, 'master-disciple-1') ? 3 : 1) };
        status(events, owner, recipient, `${recipient.name} receives ${action === 'skill1' ? 'Strike' : action === 'skill2' ? 'Shelter' : 'Resolve'} Instruction.`);
      }
      break;
    }
    case 'aurora':
      if (action === 'skill2') hit(1, true);
      if (action !== 'ultimate') {
        const seals = memory.seals ??= {};
        for (const enemy of action === 'skill1' ? target ? [target] : [] : foes(state)) {
          seals[enemy.id] = { fraction: Math.max(seals[enemy.id]?.fraction ?? 0, action === 'skill1' ? .4 : .25), throughPhase: state.round + 2 };
          status(events, owner, enemy, `${enemy.name} sealed through enemy phase ${state.round + 2}.`);
        }
      } else memory.ultimateWardThrough = state.round + 1;
      break;
    case 'razor':
      if (action === 'skill2') memory.bastion = { throughPhase: state.round, loss: 0 };
      else {
        const spent = memory.wounds ?? 0;
        memory.wounds = (memory.wounds ?? 0) - spent;
        hit(action === 'skill1' ? 1.6 : 2.2);
        if (target?.hp) fixed(state, owner, target, spent * (action === 'ultimate' ? 2 : 1), 'revenge', events);
        if (action === 'skill1' && target?.hp && equipped(owner, 'master-razor-3') && !gear(target).numbers[`silenced:${owner.id}`]) {
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
      } else {
        const marked = foes(state).find(enemy => enemy.id === quarry?.target);
        const contributors = quarry?.round === state.round ? quarry.contributors : [];
        hit(action === 'ultimate' ? 3 : marked ? 2 + .25 * contributors.filter(id => id !== owner.id).length : 1.6, false, 0, 0, marked ?? target);
        if (action === 'ultimate' && contributors.length >= 2) for (const recipient of allies.filter(unit => contributors.includes(unit.id)))
          nativeHeal(state, owner, recipient, recipient.stats.health * .1, events, true, activation);
      }
      break;
    }
    case 'thornia': {
      const traps = memory.traps ??= {};
      if (action === 'skill2') {
        const charged = traps[targetId]?.charges === 3;
        hit(1.7, charged && equipped(owner, 'master-thornia-2'));
        if (charged && equipped(owner, 'master-thornia-2')) for (const enemy of foes(state)) {
          if (enemy.id !== targetId) {
            enemy.weakened = Math.max(enemy.weakened, 1);
            enemy.weakenFraction = Math.max(enemy.weakenFraction, .15);
            enemy.weakenSourceId = owner.id; enemy.weakenOrigin = 'conduit';
          }
        }
        if (target?.hp && (traps[target.id]?.charges ?? 0) > 0) {
          traps[target.id].charges--;
          fixed(state, owner, target, owner.stats.damage * .8, 'trap', events);
        }
      } else {
        if (action === 'ultimate') hit(1.4, true);
        for (const enemy of action === 'skill1' ? target ? [target] : [] : foes(state)) {
          traps[enemy.id] = { charges: 3, coefficient: Math.max(traps[enemy.id]?.coefficient ?? 0, action === 'ultimate' ? .9 : .6), throughPhase: state.round + 2 };
          status(events, owner, enemy, `${enemy.name}: 3 Thorn trap charges through enemy phase ${state.round + 2}.`);
        }
      }
      break;
    }
    case 'crinso':
      if (action === 'skill1') {
        hit(1.6, false, memory.edge === 'crimson' ? .2 : 0);
        memory.combo = memory.edge === 'crimson' ? (memory.combo ?? 0) + 1 : 0;
        memory.edge = 'gold';
      } else if (action === 'skill2') {
        hit(memory.edge === 'gold' ? 2.4 : 2);
        memory.combo = memory.edge === 'gold' ? (memory.combo ?? 0) + 1 : 0;
        memory.edge = 'crimson';
      } else {
        const combo = memory.combo ?? 0;
        memory.combo = 0; delete memory.edge;
        activation.spent.duality = combo;
        hit(2.6 + .45 * combo, false, combo >= 3 ? .3 : 0);
      }
      break;
    case 'nerithe': {
      if (action === 'skill2' && equipped(owner, 'master-nerithe-2')) break;
      const surveyed = foes(state).find(enemy => enemy.id === memory.survey?.target);
      if (action === 'skill2') {
        if (memory.survey && target) memory.survey.target = target.id;
        hit(1.3, true);
      } else {
        const spent = surveyed ? Math.min(memory.survey?.points ?? 0, action === 'skill1' ? 1 : Infinity) : 0;
        if (memory.survey) memory.survey.points -= spent;
        hit(action === 'skill1' ? 1.8 : 2.8, false, spent * (action === 'skill1' ? .25 : .15), 0, surveyed ?? target);
      }
      break;
    }
    case 'orvella':
      if (action === 'skill1') {
        hit(memory.foundation ? 1.4 : 1.8);
        if (memory.foundation) { memory.foundation.durability += owner.stats.health * .08; memory.foundation.maximum = Math.max(memory.foundation.maximum, memory.foundation.durability); }
      } else if (action === 'skill2') {
        const plating = equipped(owner, 'master-orvella-1');
        const maximum = owner.stats.health * (plating ? .15 : .3);
        memory.foundation = { durability: maximum, maximum, throughPhase: state.round + 2 };
        if (plating) for (const recipient of allies)
          generatedShield(owner, recipient, Math.min(recipient.stats.health * .15, owner.stats.health * .05), events, true, recipient.stats.health * .15, true);
      } else {
        const power = memory.foundation?.durability ?? 0;
        delete memory.foundation;
        hit(2, true);
        for (const enemy of foes(state)) fixed(state, owner, enemy, power, 'demolition', events);
      }
      break;
    case 'vaelor':
      if (action === 'skill1') hit(1.7, false, 0, (memory.beat ?? 0) === 0 ? .3 : 0);
      if (action === 'skill2') {
        hit(1.2, true);
        if (memory.beat === 1) owner.attackBoost = { fraction: Math.max(owner.attackBoost?.fraction ?? 0, .2),
          throughRound: Math.max(owner.attackBoost?.throughRound ?? 0, state.round + 1), sourceId: owner.id, origin: 'native' };
      }
      if (action === 'ultimate') hit((memory.beat ?? 0) === 2 ? 3.4 : 2.6, true);
      break;
    default: throw new Error(`Missing native identity for ${owner.definitionId}.`);
  }
}

export function nativeAfterAction(state: BattleState, owner: Combatant, action: ActionId, priorInstruction: NativeKitState['instruction'], events: BattleEvent[]): void {
  if (priorInstruction && owner.native?.instruction === priorInstruction) delete owner.native.instruction;
  for (const caster of living(state).filter(hasNativeIdentity)) {
    const field = caster.native?.cyclone;
    if (field && caster.id !== owner.id && field.contributors[owner.id] !== state.round) {
      field.contributors[owner.id] = state.round;
      field.gusts += 1;
      status(events, caster, caster, `Cyclone holds ${field.gusts} Gusts.`);
    }
  }
  nativeCleanup(state);
}

export function nativePrimaryHit(state: BattleState, attacker: Combatant, target: Combatant, effective: boolean, events: BattleEvent[]): void {
  if (!effective) return;
  for (const owner of living(state).filter(hasNativeIdentity)) {
    const quarry = owner.native?.quarry;
    if (!quarry || quarry.target !== target.id) continue;
    if (quarry.round !== state.round) { quarry.round = state.round; quarry.contributors = []; }
    if (!quarry.contributors.includes(attacker.id)) quarry.contributors.push(attacker.id);
    if (quarry.contributors.length >= 2) {
      const contributors = living(state).filter(unit => quarry.contributors.includes(unit.id));
      if (equipped(owner, 'master-rosetta-1')) {
        const recipient = [...living(state)].sort((a, b) => a.hp / a.stats.health - b.hp / b.stats.health)[0];
        if (recipient) nativeShield(state, owner, recipient, recipient.stats.health * .48, events);
      } else for (const ally of contributors) nativeShield(state, owner, ally, ally.stats.health * .08, events);
    }
  }
}

export function nativeIncomingMultiplier(state: BattleState, enemy: Combatant, target: Combatant, action: ActionId, events: BattleEvent[]): number {
  let multiplier = 1;
  if (target.native?.reduction && target.native.reduction.throughPhase >= state.round) multiplier *= 1 - target.native.reduction.fraction;
  if (target.native?.bastion && target.native.bastion.throughPhase >= state.round) multiplier *= .7;
  let hostile = enemy.native?.hostileReduction;
  if (hostile === undefined) {
    hostile = 1;
    for (const owner of living(state).filter(hasNativeIdentity)) {
    if (action !== 'light') {
      const seal = owner.native?.seals?.[enemy.id];
      if (seal && seal.throughPhase >= state.round) {
        hostile *= 1 - seal.fraction;
        delete owner.native!.seals![enemy.id];
        status(events, owner, enemy, `${enemy.name}'s Seal is consumed by its special.`);
      }
    }
      if (action === 'ultimate' && (owner.native?.ultimateWardThrough ?? 0) >= state.round) hostile *= .5;
    }
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
    redirect(bruno, routed * .75);
  }
  for (const owner of living(state)) {
    const foundation = owner.native?.foundation;
    if (!foundation || foundation.throughPhase < state.round) continue;
    const absorbed = Math.min(foundation.durability, remaining * .2);
    foundation.durability -= absorbed; remaining -= absorbed;
    status(events, owner, target, `Foundation absorbs ${absorbed}; ${foundation.durability} durability remains.`, absorbed);
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
  if (hasNativeIdentity(target) && target.definitionId === 'razor' && loss > 0) {
    const memory = nativeMemory(target);
    memory.wounds = (memory.wounds ?? 0) + loss;
    if (memory.bastion?.throughPhase === state.round) memory.bastion.loss += loss;
    status(events, target, target, `${target.name} banks ${memory.wounds} Wounds.`, memory.wounds);
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

export function nativeEnemyCompleted(state: BattleState, enemy: Combatant, damaging: boolean, events: BattleEvent[]): void {
  if (!damaging) return;
  for (const owner of living(state).filter(hasNativeIdentity)) {
    const trap = owner.native?.traps?.[enemy.id];
    if (trap && trap.charges > 0 && trap.throughPhase >= state.round) {
      trap.charges--;
      if (equipped(owner, 'master-thornia-1')) {
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
    fixed(state, owner, enemy, tick, 'burn', events, true);
    afterConduitBurn(state, owner, enemy, previous - enemy.hp, events);
    burn.turns = enemy.burn.turns;
    if (otherBurn) enemy.burn = otherBurn;
  }
}

export function nativePhaseEnd(state: BattleState, events: BattleEvent[]): void {
  for (const owner of living(state).filter(hasNativeIdentity)) {
    const memory = nativeMemory(owner);
    if (memory.cyclone && --memory.cyclone.phases <= 0) releaseCyclone(state, owner, events);
    if (memory.bastion && memory.bastion.throughPhase <= state.round) {
      if (memory.bastion.loss > 0) nativeShield(state, owner, owner, memory.bastion.loss, events, { throughPhase: state.round + 1 });
      delete memory.bastion;
    }
    if (memory.cover && memory.cover.throughPhase <= state.round) delete memory.cover;
    if (memory.reduction && memory.reduction.throughPhase <= state.round) delete memory.reduction;
    if (memory.foundation && memory.foundation.throughPhase <= state.round) delete memory.foundation;
    for (const [id, trap] of Object.entries(memory.traps ?? {})) if (trap.throughPhase <= state.round || trap.charges <= 0) delete memory.traps![id];
    for (const [id, seal] of Object.entries(memory.seals ?? {})) if (seal.throughPhase <= state.round) delete memory.seals![id];
  }
  nativeCleanup(state);
}

export function nativeTurnStart(state: BattleState, events: BattleEvent[]): void {
  for (const owner of living(state).filter(hasNativeIdentity)) {
    const memory = nativeMemory(owner);
    if (owner.definitionId === 'vaelor' && memory.beatRound !== state.round) {
      memory.beat = (((memory.beat ?? 0) + 1) % 3) as 0 | 1 | 2;
      memory.beatRound = state.round;
    }
    const healing = { healed: 0, overheal: 0 };
    for (const [id, pending] of Object.entries(memory.seeds ?? {})) {
      if (pending.dueRound > state.round) continue;
      delete memory.seeds![id];
      const target = living(state).find(unit => unit.id === id);
      if (target) nativeHeal(state, owner, target, target.stats.health * pending.fraction, events, true, healing, false);
    }
    finishNativeHealing(state, owner, healing, events);
  }
  for (const ally of state.allies) if (ally.native?.instruction && ally.native.instruction.throughRound < state.round) delete ally.native.instruction;
}

export function nativeCleanup(state: BattleState): void {
  const live = new Set(foes(state).map(unit => unit.id));
  for (const enemy of state.enemies) {
    if (enemy.burn.origin !== 'conduit' && state.allies.some(owner => owner.id === enemy.burn.sourceId && hasNativeIdentity(owner) && owner.hp <= 0))
      enemy.burn.turns = 0;
  }
  for (const ally of state.allies) {
    if (!ally.native) continue;
    if (ally.hp <= 0) { delete ally.native; continue; }
    if (ally.native.instruction && !living(state).some(owner => owner.id === ally.native?.instruction?.owner))
      delete ally.native.instruction;
    if (ally.native.blades) ally.native.blades = ally.native.blades.map(id => id && live.has(id) ? id : null) as [string | null, string | null];
    if (ally.native.survey && !live.has(ally.native.survey.target)) delete ally.native.survey;
    if (ally.native.quarry && !live.has(ally.native.quarry.target)) delete ally.native.quarry;
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

export function nativeReadout(state: BattleState, unit: Combatant): NativeReadoutRow[] {
  if (!hasNativeIdentity(unit) && !unit.native?.instruction) return [];
  const memory = unit.native ?? {};
  const rows: NativeReadoutRow[] = [];
  const add = (label: string, value: string, description: string, icons: readonly StatusArtId[] = [], rule = false) =>
    rows.push({ label, value, description, icons, ...(rule ? { rule } : {}) });
  if (hasNativeIdentity(unit) && unit.definitionId === 'bliss') {
    const others = living(state).filter(ally => ally.id !== unit.id);
    const acted = others.filter(ally => ally.spent).length;
    const posture = acted === 0 ? 'opening' : acted === others.length ? 'closing' : 'passing';
    add('Posture', posture[0].toUpperCase() + posture.slice(1),
      'Changes with the other living squad members who have acted this player turn.', [`native-bliss-${posture}`], true);
  }
  for (const recipient of state.allies) {
    const shields = recipient.conduitRuntime?.layers?.filter(layer => layer.native && layer.owner === unit.id &&
      layer.amount > 0 && layer.expiresAfterPhase !== undefined) ?? [];
    for (const layer of shields) add('Shield', `${Math.round(layer.amount)}`,
      `${recipient.name}; expires after enemy phase ${layer.expiresAfterPhase}${layer.firstReduction ? '; first-hit reduction ready' : ''}.`, ['ward']);
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
  if (memory.foundation) add('Foundation', `${Math.ceil(memory.foundation.durability)}/${Math.ceil(memory.foundation.maximum)}`,
    `Shared durability through enemy phase ${memory.foundation.throughPhase}.`, ['native-orvella-foundation']);
  if (unit.definitionId === 'razor') add('Wounds', `${Math.round(memory.wounds ?? 0)}`,
    'Stored from direct enemy HP loss.', ['native-razor-wounds']);
  if (memory.bastion && memory.bastion.throughPhase >= state.round) add('Bastion', '30% direct-hit reduction',
    `Through enemy phase ${memory.bastion.throughPhase}; ${Math.round(memory.bastion.loss)} HP lost stored for the following shield.`, ['native-razor-bastion']);
  if (memory.ultimateWardThrough !== undefined && memory.ultimateWardThrough >= state.round) add('Ultimate Ward', '50% ultimate damage reduction',
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
  for (const [id, burn] of Object.entries(memory.burns ?? {})) if (burn.turns > 0) add('Burn', `${Math.round(burn.damage)} × ${burn.turns}`,
    state.enemies.find(enemy => enemy.id === id)?.name ?? id, ['burn']);
  for (const [id, trap] of Object.entries(memory.traps ?? {})) add(trap.coefficient >= .9 ? 'Empowered Thorn Trap' : 'Thorn Trap', `${trap.charges} charges`,
    `${state.enemies.find(enemy => enemy.id === id)?.name}; through phase ${trap.throughPhase}.`,
    [trap.coefficient >= .9 ? 'native-thornia-empowered-trap' : 'native-thornia-trap']);
  for (const [id, seal] of Object.entries(memory.seals ?? {})) add('Seal', `${seal.fraction * 100}%`,
    `${state.enemies.find(enemy => enemy.id === id)?.name}; through phase ${seal.throughPhase}.`, ['native-aurora-seal']);
  return rows;
}
