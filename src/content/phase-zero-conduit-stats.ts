import type { ActionId, Stats } from './combat';
import { validateConduitSlots, validateConduitUpgrades, type ConduitSlots, type ConduitUpgrades } from './conduits';
import { omnicSelfStats, omnicStatBonuses } from './omnic-conduit-stats';
import type { MasterConduitId } from './master-conduits';

export type PhaseZeroEquipmentStats = Pick<Stats,
  'health' | 'defense' | 'damage' | 'crit' | 'critMultiplier' | 'shatterCapacity'> & {
    skillPower: number;
    skillDuration: number;
    skillEfficiency: number;
    gaugeGain: number;
  };

type StatKey = keyof PhaseZeroEquipmentStats;
const statKeys = ['health', 'defense', 'damage', 'crit', 'critMultiplier', 'shatterCapacity',
  'skillPower', 'skillDuration', 'skillEfficiency', 'gaugeGain'] as const satisfies readonly StatKey[];
interface StaticBonus { stat: StatKey; amount: number; additive?: true }
const omnicBonuses = (id: string): StaticBonus[] => Object.entries(omnicStatBonuses(id)).map(([stat, amount]) => ({
  stat: stat as StatKey, amount,
  ...(['crit', 'skillPower', 'skillEfficiency', 'gaugeGain'].includes(stat) ? { additive: true as const } : {}),
}));
type OrdinaryStatId = Exclude<keyof typeof omnicSelfStats, `master-${string}`>;
const ordinaryOmnicBonuses = Object.fromEntries(Object.keys(omnicSelfStats)
  .filter(id => !id.startsWith('master-')).map(id => [id, omnicBonuses(id)])) as Record<OrdinaryStatId, StaticBonus[]>;

export const phaseZeroStaticBonuses = {
  ...ordinaryOmnicBonuses,
  'bastion-lock': [{ stat: 'defense', amount: .35 }, { stat: 'skillPower', amount: .25, additive: true }],
  'crosspin-governor': [{ stat: 'skillPower', amount: .4, additive: true }],
  'fieldbrace-coupler': [{ stat: 'crit', amount: .25, additive: true }],
  'fracture-reservoir': [{ stat: 'shatterCapacity', amount: .4 }],
  'parallax-relay': [{ stat: 'health', amount: .5 }],
  'precision-escapement': [{ stat: 'critMultiplier', amount: .1 }],
  'prism-splinter-socket': [{ stat: 'gaugeGain', amount: .075, additive: true }, { stat: 'skillEfficiency', amount: .05, additive: true }],
  'reserve-torque-crank': [
    { stat: 'shatterCapacity', amount: .25 }, { stat: 'gaugeGain', amount: .1, additive: true },
  ],
  'siegebound-drive': [{ stat: 'damage', amount: .35 }, { stat: 'skillEfficiency', amount: .05, additive: true }],
  'vigil-core': [{ stat: 'health', amount: 1 }],
  'aegis-capacitor': [{ stat: 'health', amount: .75 }, { stat: 'defense', amount: .75 }],
  'coilfeed-ratchet': [{ stat: 'skillEfficiency', amount: .08, additive: true },
    { stat: 'skillPower', amount: .08, additive: true }, { stat: 'crit', amount: .08, additive: true }],
  'falcon-sight': [{ stat: 'crit', amount: .25, additive: true }, { stat: 'health', amount: .45 }],
  'hammerbalance-link': [
    { stat: 'damage', amount: .85 }, { stat: 'critMultiplier', amount: .15 },
  ],
  'astral-prism': [
    { stat: 'crit', amount: .3, additive: true }, { stat: 'critMultiplier', amount: .25 }, { stat: 'health', amount: .5 },
  ],
  'citadel-spine': [{ stat: 'damage', amount: .75 }, { stat: 'gaugeGain', amount: .07, additive: true }],
  'immortal-vessel': [{ stat: 'health', amount: 2.5 }, { stat: 'defense', amount: .75 }],
  'resonance-crucible': [{ stat: 'defense', amount: .75 }, { stat: 'health', amount: .5 },
    { stat: 'skillDuration', amount: 1, additive: true }],
  'wardglass-transformer': [{ stat: 'critMultiplier', amount: .35 }, { stat: 'defense', amount: -.35 }],
  'calamitic-causality-funeral-engine': [{ stat: 'skillEfficiency', amount: 1, additive: true }],
  'calamitic-cathedral-final-equation': [{ stat: 'skillEfficiency', amount: .65, additive: true }],
  'calamitic-horizon-cleaving-godpress': [{ stat: 'defense', amount: .75 }],
  'calamitic-throne-borrowed-tomorrows': [{ stat: 'health', amount: .45 }, { stat: 'defense', amount: .45 }],
  'calamitic-world-eater-orrery': [{ stat: 'skillDuration', amount: 3, additive: true }],
} as const satisfies Partial<Record<ConduitSlots[number] & string, readonly StaticBonus[]>>;

export function phaseZeroUpgradeMagnitude(base: number, level: number): number {
  if (!Number.isInteger(level) || level < 0 || level > 5) {
    throw new Error('Conduit upgrade level must be an integer from 0 to 5.');
  }
  if (!Number.isFinite(base)) throw new Error('Conduit magnitude must be finite.');
  return base > 0 ? base * (1 + level * .1) : base;
}

export function phaseZeroStatBase(
  value: number, stat: 'health' | 'defense' | 'damage' | 'critMultiplier' | 'shatterCapacity',
  equipment: ConduitSlots | undefined, upgrades: ConduitUpgrades = {}, master?: MasterConduitId,
): number {
  let bonus = 0;
  for (const id of equipment ?? []) {
    if (id === null || !(id in phaseZeroStaticBonuses)) continue;
    const effects: readonly StaticBonus[] = phaseZeroStaticBonuses[id as keyof typeof phaseZeroStaticBonuses];
    for (const effect of effects) if (effect.stat === stat && !effect.additive)
      bonus += phaseZeroUpgradeMagnitude(effect.amount, upgrades[id] ?? 0);
  }
  bonus += omnicStatBonuses(master ?? '')[stat] ?? 0;
  return value / (1 + bonus);
}

export function phaseZeroSkillCost(base: number, efficiency: number, action: ActionId): number {
  if (!Number.isFinite(base) || base < 0 || !Number.isFinite(efficiency)) {
    throw new Error('Invalid Phase 0 skill cost or efficiency.');
  }
  if (action !== 'skill1' && action !== 'skill2' && action !== 'ultimate') return base;
  return Math.max(action === 'ultimate' ? 70 : 1, Math.ceil(base * (1 - Math.min(.5, efficiency))));
}

export function phaseZeroGaugeOffer(offer: number, gaugeGain: number): number {
  if (!Number.isFinite(offer) || offer < 0 || !Number.isFinite(gaugeGain) || gaugeGain < 0) {
    throw new Error('Invalid Phase 0 Gauge offer or gain.');
  }
  return Math.round(offer * gaugeGain);
}

export function phaseZeroPercentageGaugeOffer(capacity: number, fraction: number, gaugeGain: number): number {
  if (!Number.isFinite(capacity) || capacity <= 0 || !Number.isFinite(fraction) || fraction < 0) {
    throw new Error('Invalid Phase 0 Gauge capacity or percentage.');
  }
  return phaseZeroGaugeOffer(capacity * fraction, gaugeGain);
}

/** Release preparation only: callers must not combine this with legacy equipment bonuses. */
export function applyPhaseZeroStaticBonuses(
  base: PhaseZeroEquipmentStats, slots: ConduitSlots, upgrades: ConduitUpgrades = {}, master?: MasterConduitId,
): PhaseZeroEquipmentStats {
  const equipment = validateConduitSlots(slots);
  const levels = validateConduitUpgrades(upgrades);
  for (const key of statKeys) {
    const amount = base[key];
    if (!Number.isFinite(amount) || (amount < 0 && key !== 'skillEfficiency')) {
      throw new Error(`Invalid Phase 0 base stat: ${key}.`);
    }
  }
  const percent: Partial<Record<StatKey, number>> = {};
  const additive: Partial<Record<StatKey, number>> = {};
  for (const id of equipment) {
    if (id === null) continue;
    const bonuses: readonly StaticBonus[] = id in phaseZeroStaticBonuses
      ? phaseZeroStaticBonuses[id as keyof typeof phaseZeroStaticBonuses] : [];
    for (const bonus of bonuses) {
      const amount = bonus.stat === 'skillDuration' ? bonus.amount :
        phaseZeroUpgradeMagnitude(bonus.amount, levels[id] ?? 0);
      const pool = bonus.additive ? additive : percent;
      pool[bonus.stat] = (pool[bonus.stat] ?? 0) + amount;
    }
  }
  if (master) for (const bonus of omnicBonuses(master)) {
    const pool = bonus.additive ? additive : percent;
    pool[bonus.stat] = (pool[bonus.stat] ?? 0) + bonus.amount;
  }
  const result = { ...base };
  for (const key of statKeys) {
    const amount = base[key] * (1 + (percent[key] ?? 0)) + (additive[key] ?? 0);
    result[key] = key === 'skillEfficiency' ? amount : Math.max(0, amount);
  }
  result.skillDuration = Math.floor(result.skillDuration);
  result.skillEfficiency = Math.min(.5, result.skillEfficiency);
  if (equipment.includes('glassroot-gimbal'))
    result.skillPower += Math.floor(result.health / 200) *
      phaseZeroUpgradeMagnitude(.05, levels['glassroot-gimbal'] ?? 0);
  return result;
}
