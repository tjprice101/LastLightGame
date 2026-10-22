import type { ActionId, Stats } from './combat';
import { validateConduitSlots, validateConduitUpgrades, type ConduitSlots, type ConduitUpgrades } from './conduits';

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

export const phaseZeroStaticBonuses = {
  'bastion-lock': [{ stat: 'defense', amount: .2 }],
  'crosspin-governor': [{ stat: 'skillPower', amount: .15, additive: true }],
  'fieldbrace-coupler': [
    { stat: 'skillPower', amount: .2, additive: true }, { stat: 'defense', amount: -.05 },
  ],
  'fracture-reservoir': [{ stat: 'shatterCapacity', amount: .5 }],
  'parallax-relay': [
    { stat: 'health', amount: .45 }, { stat: 'skillPower', amount: -.05, additive: true },
  ],
  'precision-escapement': [{ stat: 'critMultiplier', amount: .1 }],
  'prism-splinter-socket': [{ stat: 'gaugeGain', amount: .05, additive: true }],
  'reserve-torque-crank': [
    { stat: 'gaugeGain', amount: .15, additive: true }, { stat: 'damage', amount: -.05 },
  ],
  'siegebound-drive': [{ stat: 'damage', amount: .3 }],
  'vigil-core': [{ stat: 'health', amount: .35 }],
  'coilfeed-ratchet': [{ stat: 'skillEfficiency', amount: .07, additive: true }],
  'hammerbalance-link': [
    { stat: 'damage', amount: .24 }, { stat: 'defense', amount: -.08 },
  ],
  'astral-prism': [
    { stat: 'crit', amount: .3, additive: true }, { stat: 'defense', amount: -.1 },
  ],
  'citadel-spine': [{ stat: 'defense', amount: .35 }],
  'immortal-vessel': [{ stat: 'health', amount: .6 }],
  'nullsong-transmission': [{ stat: 'skillPower', amount: -.15, additive: true }],
  'worldbreaker-drive': [{ stat: 'health', amount: -.12 }],
  'chaotic-ouroboros-core': [{ stat: 'shatterCapacity', amount: .4 }],
  'calamitic-causality-funeral-engine': [{ stat: 'skillPower', amount: .8, additive: true }],
  'calamitic-world-eater-orrery': [{ stat: 'skillDuration', amount: 2, additive: true }],
} as const satisfies Partial<Record<ConduitSlots[number] & string, readonly StaticBonus[]>>;

export function phaseZeroUpgradeMagnitude(base: number, level: number): number {
  if (!Number.isInteger(level) || level < 0 || level > 5) {
    throw new Error('Conduit upgrade level must be an integer from 0 to 5.');
  }
  if (!Number.isFinite(base)) throw new Error('Conduit magnitude must be finite.');
  return base > 0 ? base * (1 + level * .1) : base;
}

export function phaseZeroStatBase(
  value: number, stat: 'defense' | 'damage' | 'critMultiplier',
  equipment: ConduitSlots | undefined, upgrades: ConduitUpgrades = {},
): number {
  let bonus = 0;
  for (const id of equipment ?? []) {
    if (id === null || !(id in phaseZeroStaticBonuses)) continue;
    const effects: readonly StaticBonus[] = phaseZeroStaticBonuses[id as keyof typeof phaseZeroStaticBonuses];
    for (const effect of effects) if (effect.stat === stat && !effect.additive)
      bonus += phaseZeroUpgradeMagnitude(effect.amount, upgrades[id] ?? 0);
  }
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
  base: PhaseZeroEquipmentStats, slots: ConduitSlots, upgrades: ConduitUpgrades = {},
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
  const result = { ...base };
  for (const key of statKeys) {
    const amount = base[key] * (1 + (percent[key] ?? 0)) + (additive[key] ?? 0);
    result[key] = key === 'skillEfficiency' ? amount : Math.max(0, amount);
  }
  result.skillDuration = Math.min(2, Math.floor(result.skillDuration));
  result.skillEfficiency = Math.min(.5, result.skillEfficiency);
  return result;
}
