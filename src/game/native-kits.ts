import { type ActionId } from '../content/combat';
import { damageAmount, type BattleEvent, type BattleState, type Combatant } from './battle';
import { scheduledEnemySkill } from '../content/enemy-skills';
import { debuffSnapshot } from './battle-debuffs';
import { nativeBalance } from '../content/native-balance';
import { phaseZeroStatsReady } from '../content/phase-zero-stats';
import { calamiticSkillDefenseIgnore, calamiticSkillShieldBypass } from './calamitic-conduits';
import type { StatusArtId } from '../content/status-art';
import { applyConduitBurn, applyConduitWeaken, nativeGauge, nativeHeal, nativeShield,
  conduitBurnTick, afterConduitBurn, conduitActionTraits, conduitHitModifiers, recordConduitHit,
  timedConduitShield, gear, grantToken, equipped, value, nativeTargetDefense,
  generatedShield, generatedStrike, generatedHeal, generatedGaugePercent, finishNativeHealing, effectiveDefense, resetConduitBurnStreak } from './conduit-runtime';

export interface NativeKitState {
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
  quarry?: { target: string; round: number; contributors: string[]; paidRound?: number };
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
}

export type NativeDamageKind = 'burn' | 'detonation' | 'cyclone' | 'recall' | 'revenge' | 'trap' | 'demolition' | 'redirect';
type Direct = (targets: Combatant[], coefficient: number, pierce?: number, criticalBonus?: number) => void;
const living = (state: BattleState) => state.allies.filter(unit => unit.hp > 0);
const foes = (state: BattleState) => state.enemies.filter(unit => unit.hp > 0);
export const hasNativeIdentity = (unit: Combatant): boolean => !unit.captured && unit.kit?.nativeIdentity === true;
export const nativeMemory = (unit: Combatant): NativeKitState => unit.native ??= {};

function status(events: BattleEvent[], owner: Combatant, target: Combatant, message: string, amount = 0): void {
  events.push({ kind: 'status', source: owner.id, target: target.id, amount, critical: false, origin: 'native', message,
    ...(target.side === 'enemy' ? { debuffs: debuffSnapshot(target) } : {}) });
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
  bypass = false, activation?: Parameters<typeof applyConduitBurn>[4], stored = true): number {
  if (owner.hp <= 0 || target.hp <= 0 || power <= 0) return 0;
  let attack = kind === 'revenge' || kind === 'demolition' ? power : owner.stats.damage;
  let ignore = activation ? calamiticSkillDefenseIgnore(state, owner, activation.action) : 0;
  if (phaseZeroStatsReady && activation) {
    const modifiers = conduitHitModifiers(state, owner, target, activation, false);
    ignore = modifiers.pierce;
    if (!stored) {
      power *= (activation.skillPower + modifiers.skillPowerBonus) * (1 + modifiers.bonus) *
        (owner.stats.damage > 0 ? modifiers.attack / owner.stats.damage : 1) * nativeInstructionDamage(state, owner);
      if (kind === 'revenge') attack = power;
      else attack = modifiers.attack;
    }
  }
  const damage = bypass ? Math.round(power) : damageAmount(attack, power / attack,
    nativeTargetDefense(state, target) * (1 - ignore), false);
  const shieldBypass = !bypass && activation ? calamiticSkillShieldBypass(state, owner, activation.action) : 0;
  const absorbed = Math.min(target.shield, damage - Math.floor(damage * shieldBypass));
  target.shield -= absorbed;
  const loss = Math.min(target.hp, damage - absorbed);
  target.hp -= loss;
  if (phaseZeroStatsReady && activation) {
    recordConduitHit(activation, target, loss, false, 1, Math.max(0, damage - loss - absorbed), loss + absorbed);
    nativePrimaryHit(state, owner, target, loss > 0 || absorbed > 0, events);
  }
  events.push({ kind: 'damage', source: owner.id, target: target.id, amount: loss, critical: false,
    origin: 'native', nativeKind: kind, periodic: kind === 'burn', shieldRemaining: target.shield, shieldAbsorbed: absorbed,
    debuffs: debuffSnapshot(target),
    message: `${owner.name}: ${kind} deals ${loss} damage to ${target.name}${absorbed ? ` (${absorbed} shield absorbed)` : ''}.` });
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
  status(events, owner, target, `${target.name} holds a ${fraction * 100}% Seed for the next player turn.`);
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
      const shield = Math.min(totalActualHpDamage * .3, ally.stats.health * .15);
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
  return instruction && instruction.throughRound >= state.round && living(state).some(unit => unit.id === instruction.owner) &&
    instruction.kind !== 'strike' ? 1 + (phaseZeroStatsReady ? instruction.supportBonus ?? .35 : .35) : 1;
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
      { throughPhase: state.round + phases - 1 + activation.skillDuration, firstReduction, skillPower: activation.skillPower, activation });
  const burn = (recipient: Combatant, fraction: number) => {
    const burns = memory.burns ??= {};
    const previous = burns[recipient.id];
    const damage = applyConduitBurn(state, owner, recipient, owner.stats.damage * fraction, activation);
    burns[recipient.id] = { damage: Math.max(previous?.damage ?? 0, damage),
      turns: 3 + activation.skillDuration + (phaseZeroStatsReady && equipped(owner, 'flare-focusing-iris') ? 1 : 0) };
    recipient.burn = { ...burns[recipient.id], sourceId: owner.id, origin: 'native' };
    resetConduitBurnStreak(owner, recipient);
    status(events, owner, recipient, `${recipient.name}: Infernis Burn, ${burns[recipient.id].damage} per phase for ${burns[recipient.id].turns} phases.`);
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
      if (action === 'ultimate') { hit(2, true); for (const enemy of foes(state)) burn(enemy, .45); }
      break;
    case 'tide':
      if (action === 'skill1') {
        hit(1.5);
        if (target?.hp) applyConduitWeaken(state, owner, target, .25, events, action, 1, activation);
      }
      if (action === 'skill2' && ally) shield(ally,
        nativeBalance.tizu.shelter * (!phaseZeroStatsReady && equipped(owner, 'master-tide-2') ? 3 : 1), 1);
      if (action === 'ultimate') for (const recipient of allies) shield(recipient, nativeBalance.tizu.oceanMemory, 2, .3);
      break;
    case 'sprout':
      if (action === 'skill1') {
        hit(1.4);
        const recipients = phaseZeroStatsReady && equipped(owner, 'master-sprout-2') ? allies
          : [[...allies].sort((a, b) => a.hp / a.stats.health - b.hp / b.stats.health)[0]].filter((unit): unit is Combatant => !!unit);
        for (const recipient of recipients) seed(state, owner, recipient, nativeBalance.flora.seed, events,
          activation, false, phaseZeroStatsReady && equipped(owner, 'master-sprout-2') ? .2 : 0);
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
          for (const recipient of allies) shield(recipient, .06, 1);
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
          nativeHeal(state, owner, recipient, recipient.stats.health * .1, events, true, activation);
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
          fraction: Math.min(1, .4 * (phaseZeroStatsReady ? activation.skillPower : 1)),
          throughPhase: state.round + 1 + activation.skillDuration };
        const shield = phaseZeroStatsReady && equipped(owner, 'master-bruno-2')
          ? Math.max(owner.stats.health * .25, effectiveDefense(state, owner) * 2.5)
          : Math.max(owner.stats.health * .2,
            phaseZeroStatsReady || equipped(owner, 'master-bruno-2') ? effectiveDefense(state, owner) * 2 : 0);
        nativeShield(state, owner, owner, shield, events,
          { throughPhase: state.round + 1 + activation.skillDuration, skillPower: activation.skillPower, activation });
      }
      break;
    case 'disciple': {
      for (const recipient of state.allies) if (recipient.native?.instruction?.owner === owner.id)
        delete recipient.native.instruction;
      const recipients = action === 'ultimate' ? allies : ally ? [ally] : [];
      for (const recipient of recipients) {
        nativeMemory(recipient).instruction = { kind: action === 'skill1' ? 'strike' : action === 'skill2' ? 'shelter' : 'resolve',
          owner: owner.id, throughRound: state.round + (equipped(owner, 'master-disciple-1') ? 3 : 1) + activation.skillDuration,
          ...(phaseZeroStatsReady ? { damageBonus: .3 * activation.skillPower, supportBonus: .35 * activation.skillPower } : {}) };
        status(events, owner, recipient, `${recipient.name} receives ${action === 'skill1' ? 'Strike' : action === 'skill2' ? 'Shelter' : 'Resolve'} Instruction.`);
      }
      break;
    }
    case 'aurora':
      if (action === 'skill2') hit(1, true);
      if (action !== 'ultimate') {
        const seals = memory.seals ??= {};
        for (const enemy of action === 'skill1' ? target ? [target] : [] : foes(state)) {
          seals[enemy.id] = { fraction: Math.max(seals[enemy.id]?.fraction ?? 0,
            Math.min(1, (action === 'skill1' ? .4 : .25) * (phaseZeroStatsReady ? activation.skillPower : 1))),
          throughPhase: state.round + 2 + activation.skillDuration };
          status(events, owner, enemy, `${enemy.name} sealed through enemy phase ${seals[enemy.id].throughPhase}.`);
        }
      } else {
        memory.ultimateWardThrough = state.round + 1 + activation.skillDuration;
        if (phaseZeroStatsReady) memory.ultimateWardReduction = .5 * activation.skillPower;
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
            (action === 'ultimate' ? .9 : .6) * (phaseZeroStatsReady ? activation.skillPower : 1)),
          throughPhase: state.round + 2 + activation.skillDuration,
          ...(phaseZeroStatsReady ? { empowered: action === 'ultimate' } : {}) };
          status(events, owner, enemy, `${enemy.name}: 3 Thorn trap charges through enemy phase ${traps[enemy.id].throughPhase}.`);
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
    default: throw new Error(`Missing native identity for ${owner.definitionId}.`);
  }
}

export function nativeAfterAction(state: BattleState, owner: Combatant, action: ActionId, priorInstruction: NativeKitState['instruction'], events: BattleEvent[]): void {
  if (priorInstruction && owner.native?.instruction === priorInstruction) {
    const ability = action === 'light' ? undefined : owner.kit?.abilities[action];
    const traits = phaseZeroStatsReady ? conduitActionTraits(state, owner, action) : undefined;
    const damaging = traits?.damage ?? (action === 'light' || ability?.strength.damageMultiplier !== undefined);
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
      if (phaseZeroStatsReady || !equipped(owner, 'master-rosetta-1'))
        for (const ally of contributors) nativeShield(state, owner, ally, ally.stats.health * .08, events);
      if (equipped(owner, 'master-rosetta-1')) {
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

export function nativeIncomingMultiplier(state: BattleState, enemy: Combatant, target: Combatant, action: ActionId, events: BattleEvent[]): number {
  let multiplier = 1;
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
        status(events, owner, enemy, `${enemy.name}'s Seal is consumed by its special.`);
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
    fixed(state, owner, enemy, tick, 'burn', events, true);
    afterConduitBurn(state, owner, enemy, previous - enemy.hp, events);
    burn.turns = enemy.burn.turns;
    if (otherBurn) enemy.burn = otherBurn;
  }
}

export function nativePhaseEnd(state: BattleState, events: BattleEvent[]): void {
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
    if (memory.cyclone && --memory.cyclone.phases <= 0) releaseCyclone(state, owner, events);
    if (memory.bastion && memory.bastion.throughPhase <= state.round) {
      if (memory.bastion.loss > 0) {
        const shield = memory.bastion.loss;
        const created = nativeShield(state, owner, owner, shield, events, {
          throughPhase: state.round + 1 + (phaseZeroStatsReady ? memory.bastion.skillDuration ?? 0 : 0),
          ...(phaseZeroStatsReady ? { skillPower: memory.bastion.skillPower ?? 1 } : {}),
        });
        if (phaseZeroStatsReady && equipped(owner, 'master-razor-2')) for (const ally of living(state).filter(unit => unit.id !== owner.id)) {
          const offer = Math.min(created * .4, ally.stats.health * .15);
          timedConduitShield(state, owner, ally, offer, 'master-razor-2', state.round, events);
        }
      }
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
      if (target) {
        nativeHeal(state, owner, target, target.stats.health * pending.fraction, events, true, healing, false);
        seedPayoff(state, owner, target, !!pending.empowered);
      }
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

export interface NativeMarker { id: string; owner: string; label: string; value: string; icon: StatusArtId }

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
  for (const owner of living(state).filter(hasNativeIdentity)) {
    if (owner.id === unit.id) continue;
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
    } else {
      const trap = memory.traps?.[unit.id];
      if (trap && trap.charges > 0) {
        const empowered = trap.coefficient >= .9;
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
    }
  }
  return markers;
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
  for (const [id, trap] of Object.entries(memory.traps ?? {})) add(trap.coefficient >= .9 ? 'Empowered Thorn Trap' : 'Thorn Trap', `${trap.charges} charges`,
    `${state.enemies.find(enemy => enemy.id === id)?.name}; through phase ${trap.throughPhase}.`,
    [trap.coefficient >= .9 ? 'native-thornia-empowered-trap' : 'native-thornia-trap']);
  for (const [id, seal] of Object.entries(memory.seals ?? {})) add('Seal', `${seal.fraction * 100}%`,
    `${state.enemies.find(enemy => enemy.id === id)?.name}; through phase ${seal.throughPhase}.`, ['native-aurora-seal']);
  return rows;
}
