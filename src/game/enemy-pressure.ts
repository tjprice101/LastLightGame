import { radiantFlares, radiantMasters, type RadiantLoadout } from '../content/combat-kits';
import { scheduledEnemySkill } from '../content/enemy-skills';
import { applyRadiantCombatAction, createRadiantCombat, type RadiantCombatState,
  type RadiantCombatEvent, type RadiantCombatAction } from './combat-engine';
import { personalChargeUnit, readyFlare, sharedChargeThreshold } from './combat-gauge';
import type { RadiantPressureEnemy } from './enemy-pressure-encounters';

export type RadiantPressurePolicy = 'balanced' | 'normal-only' | 'support-only';
export interface RadiantPressureMetrics {
  outgoingHPDamage: number; outgoingAbsorbed: number; incomingHPDamage: number; incomingAbsorbed: number;
  effectiveHealing: number; enemyHealing: number; shieldCreated: number; enemyShieldCreated: number;
  personalGranted: number; personalSpent: number; sharedGrantedUnits: number; sharedSpentUnits: number;
  normals: number; defenses: number; flares: number; eternalFlares: number; statuses: number;
  currency: number;
}
export interface RadiantPressureResult {
  outcome: 'victory' | 'defeat' | 'timeout' | 'stalemate';
  completedRounds: number; roundsExecuted: number; displayedRound: number; actions: number; surviving: number;
  initialHP: number; finalHP: number; minimumTeamHP: number; finalShield: number; maximumShield: number;
  enemyHP: number; enemyLowestHP: number; finalPersonalCharge: number; finalSharedUnits: number;
  metrics: RadiantPressureMetrics;
  rounds: { round: number; teamHP: number; shield: number; enemiesHP: number; living: number }[];
}
export function chooseRadiantPressureAction(
  state: RadiantCombatState, id: string, policy: RadiantPressurePolicy,
): RadiantCombatAction {
  const actor = state.bearers.find(member => member.loadout.id === id)!;
  const target = state.enemies.filter(member => member.hp > 0).sort((a, b) => a.hp - b.hp || a.id.localeCompare(b.id))[0];
  const tier = readyFlare(state.gauge, id);
  const offer = tier ? radiantFlares[actor.loadout.starter][tier] : undefined;
  const masterRule = actor.loadout.masterId === null ? undefined : radiantMasters[actor.loadout.masterId].rule;
  const masterStrike = masterRule === 'tide-strike' || masterRule === 'sprout-strike';
  const wounded = state.bearers.some(member => member.hp > 0 && member.hp < member.stats.hp * .8);
  const endangered = actor.hp < actor.stats.hp * .25 && actor.shields.length === 0;
  if (policy !== 'normal-only' && offer && (policy !== 'support-only' || !masterStrike && offer.damage === 0 && offer.burn === 0)) {
    const useful = masterStrike || offer.damage > 0 || offer.burn > 0 || wounded ||
      (offer.shieldDefense > 0 || offer.shieldHP > 0) && state.bearers.some(member => member.hp > 0 && !member.shields.length) ||
      offer.attackBuff > 0 || offer.reduction > 0;
    // Hold the first bar for a stronger Flare unless healing/guarding is urgent.
    if (useful && (tier !== 'glowing' || actor.loadout.form < 4 || wounded || endangered))
      return { type: 'flare', bearerId: id, ...(offer.target === 'one-enemy' || masterStrike ? { targetId: target.id } : {}) };
  }
  return policy === 'support-only' || policy === 'balanced' && endangered
    ? { type: 'defense', bearerId: id } : { type: 'normal', bearerId: id, targetId: target.id };
}
export function radiantPressureEnemyAction(
  state: RadiantCombatState, enemy: RadiantPressureEnemy, targetRandom: () => number,
): Extract<RadiantCombatAction, { type: 'enemy-attack' }> {
  const targets = state.bearers.filter(member => member.hp > 0);
  const targeting = enemy.pattern?.targeting;
  if (targeting) targets.sort((a, b) => (targeting === 'lowest' ? 1 : -1) *
    (a.hp / a.stats.hp - b.hp / b.stats.hp) || a.loadout.id.localeCompare(b.loadout.id));
  const random = targetRandom();
  if (!Number.isFinite(random) || random < 0 || random >= 1) throw new Error('Invalid target seed output.');
  const target = targeting ? targets[0] : targets[Math.floor(random * targets.length)];
  const pattern = enemy.pattern;
  const actor = state.enemies.find(member => member.id === enemy.id)!;
  return { type: 'enemy-attack', enemyId: enemy.id, targetIds: [target.loadout.id],
    coefficient: scheduledEnemySkill(enemy.skills, state.round)?.multiplier ?? 1, hits: pattern?.hits ?? 1,
    ...(pattern?.healEvery && state.round % pattern.healEvery === 0
      ? { healBefore: actor.stats.hp * (pattern.healFraction ?? 0) } : {}),
    ...(pattern?.shieldEvery && state.round % pattern.shieldEvery === 0
      ? { refreshShieldBefore: actor.stats.hp * (pattern.shieldFraction ?? 0) } : {}) };
}
export function runRadiantPressure(
  loadouts: RadiantLoadout[], enemies: RadiantPressureEnemy[],
  options: { chargeSeed: number; targetSeed: number; maximumRounds?: number;
    stalemateRounds?: number; policy?: RadiantPressurePolicy },
): RadiantPressureResult {
  const maximumRounds = options.maximumRounds ?? 100, stalemateRounds = options.stalemateRounds ?? 20;
  for (const cap of [maximumRounds, stalemateRounds])
    if (!Number.isSafeInteger(cap) || cap < 1 || cap > 1000) throw new Error('Invalid pressure round bound.');
  if (!Number.isSafeInteger(options.targetSeed) || options.targetSeed < 1 || options.targetSeed > 0xffffffff)
    throw new Error('Invalid pressure target seed.');
  const policy = options.policy ?? 'balanced';
  if (!['balanced', 'normal-only', 'support-only'].includes(policy)) throw new Error('Invalid pressure policy.');
  let state = createRadiantCombat(loadouts, enemies, options.chargeSeed), targetSeed = options.targetSeed;
  const random = () => {
    targetSeed = (Math.imul(targetSeed, 1664525) + 1013904223) >>> 0;
    return targetSeed / 0x100000000;
  };
  const metrics: RadiantPressureMetrics = {
    outgoingHPDamage: 0, outgoingAbsorbed: 0, incomingHPDamage: 0, incomingAbsorbed: 0,
    effectiveHealing: 0, enemyHealing: 0, shieldCreated: 0, enemyShieldCreated: 0,
    personalGranted: 0, personalSpent: 0, sharedGrantedUnits: 0, sharedSpentUnits: 0,
    normals: 0, defenses: 0, flares: 0, eternalFlares: 0, statuses: 0, currency: 0,
  };
  const hp = () => state.bearers.reduce((sum, member) => sum + member.hp, 0);
  const shield = () => state.bearers.reduce((sum, member) => sum + member.shields.reduce((s, layer) => s + layer.remaining, 0), 0);
  const lowWater = () => state.enemies.reduce((sum, enemy) => sum + enemy.currency.lowestHP, 0);
  const personal = () => state.gauge.members.reduce((sum, member) =>
    sum + Math.round(member.charge * personalChargeUnit), 0) / personalChargeUnit;
  const initialHP = hp(), rounds: RadiantPressureResult['rounds'] = [];
  let minimumTeamHP = initialHP, maximumShield = shield(), actions = 0, completedRounds = 0;
  let lastProgress = 0, lowest = lowWater(), stalemate = false;
  const terminal = () => state.phase === 'victory' || state.phase === 'defeat';
  const record = (event: RadiantCombatEvent) => {
    if (event.type === 'damage') {
      const outgoing = state.enemies.some(enemy => enemy.id === event.targetId);
      metrics[outgoing ? 'outgoingHPDamage' : 'incomingHPDamage'] += event.healthLoss;
      metrics[outgoing ? 'outgoingAbsorbed' : 'incomingAbsorbed'] += event.absorbed;
    } else if (event.type === 'heal') metrics[event.source.kind === 'enemy' ? 'enemyHealing' : 'effectiveHealing'] += event.effective;
    else if (event.type === 'shield') metrics[event.source.kind === 'enemy' ? 'enemyShieldCreated' : 'shieldCreated'] += event.amount;
    else if (event.type === 'currency') metrics.currency += event.amount;
    else if (event.type === 'status') metrics.statuses++;
    else if (event.type === 'flare') { metrics.flares++; if (event.tier === 'eternal') metrics.eternalFlares++; }
  };
  const apply = (action: RadiantCombatAction) => {
    const beforePersonal = personal(), beforeShared = state.gauge.sharedUnits;
    let spent = 0, sharedSpent = 0;
    if (action.type === 'flare') {
      const member = state.gauge.members.find(member => member.id === action.bearerId)!;
      const tier = readyFlare(state.gauge, member.id)!;
      spent = member.baseCost * (tier === 'glowing' ? 1 : 2);
      sharedSpent = tier === 'eternal' ? sharedChargeThreshold(state.gauge.eternalCasts) : 0;
    }
    const result = applyRadiantCombatAction(state, action);
    state = result.state; result.events.forEach(record);
    metrics.personalSpent += spent;
    metrics.personalGranted = Math.round((metrics.personalGranted + personal() - beforePersonal + spent) *
      personalChargeUnit) / personalChargeUnit;
    metrics.sharedSpentUnits += sharedSpent; metrics.sharedGrantedUnits += state.gauge.sharedUnits - beforeShared + sharedSpent;
    if (action.type === 'normal') metrics.normals++;
    if (action.type === 'defense') metrics.defenses++;
    minimumTeamHP = Math.min(minimumTeamHP, hp()); maximumShield = Math.max(maximumShield, shield());
    actions++;
  };
  while (completedRounds < maximumRounds && state.phase !== 'victory' && state.phase !== 'defeat') {
    const round = state.round;
    for (const member of state.bearers) {
      if (state.phase !== 'player') break;
      if (member.hp > 0 && !state.acted.includes(member.loadout.id))
        apply(chooseRadiantPressureAction(state, member.loadout.id, policy));
    }
    if (state.phase === 'enemy') {
      for (const enemy of enemies) {
        if (state.phase !== 'enemy') break;
        if (state.enemies.find(member => member.id === enemy.id)!.hp > 0)
          apply(radiantPressureEnemyAction(state, enemy, random));
      }
      if (state.phase === 'enemy') apply({ type: 'finish-enemy-phase' });
    }
    completedRounds++;
    rounds.push({ round, teamHP: hp(), shield: shield(),
      enemiesHP: state.enemies.reduce((sum, enemy) => sum + enemy.hp, 0), living: state.bearers.filter(member => member.hp > 0).length });
    if (lowWater() < lowest) { lowest = lowWater(); lastProgress = completedRounds; }
    if (!terminal() && completedRounds - lastProgress >= stalemateRounds) {
      stalemate = true; break;
    }
  }
  return { outcome: state.phase === 'victory' ? 'victory' : state.phase === 'defeat' ? 'defeat' : stalemate ? 'stalemate' : 'timeout',
    completedRounds: state.round - 1, roundsExecuted: completedRounds, displayedRound: state.round, actions,
    surviving: state.bearers.filter(member => member.hp > 0).length,
    initialHP, finalHP: hp(), minimumTeamHP, finalShield: shield(), maximumShield,
    enemyHP: state.enemies.reduce((sum, enemy) => sum + enemy.hp, 0), enemyLowestHP: lowWater(),
    finalPersonalCharge: personal(), finalSharedUnits: state.gauge.sharedUnits, metrics, rounds };
}
