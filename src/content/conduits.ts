import { type ElementId } from './activities';
import { kitConduitDesigns } from './kit-conduits';

export interface ConduitBuff {
 stat: 'health' | 'damage' | 'defense' | 'crit' | 'critMultiplier' | 'elementalDamage' | 'shatterCapacity';
 kind: 'percent' | 'percentage-points' | 'flat';
 amount: number;
}
export type ConduitMechanic = 'burn-focus' | 'shield-heal' | 'defense-ward' | 'renewal' | 'critical-gauge' |
 'normal-momentum' | 'defeat-gauge' | 'weaken-pierce' | 'defense-heal' | 'ultimate-ward' |
 'ember-seals' | 'undertide-cooldown' | 'faultkeeper-ward' | 'verdant-covenant' | 'stormstep' |
 'skythread' | 'dawn-witness' | 'nightglass' | 'stillhour' | 'paradox' | 'kit-tuning';
type CommonConduitDesign = { id: string; name: string; rarity: 'Common'; price: number; power: string; effect: string; lore: string } &
  ({ buff: ConduitBuff } | { buffs: readonly ConduitBuff[] });

export const commonConduits = [
  { id: 'vigil-core', name: 'Vigil Core', rarity: 'Common', price: 1000,
    power: 'Elemental Light', buff: { stat: 'health', kind: 'percent', amount: 5 }, effect: '+5% Health',
    lore: 'An emergency life-support mechanism sealed beneath the battlefields of the ancient war. Its protected chamber still holds a fragment of Elemental Light.' },
  { id: 'siegebound-drive', name: 'Siegebound Drive', rarity: 'Common', price: 1200,
    power: 'Mechanical', buff: { stat: 'damage', kind: 'percent', amount: 5 }, effect: '+5% Attack',
    lore: 'A compact force-transmission engine once hidden inside siege harnesses. Its interlocking gears survived centuries in a buried armory.' },
  { id: 'bastion-lock', name: 'Bastion Lock', rarity: 'Common', price: 1000,
    power: 'Mechanical', buff: { stat: 'defense', kind: 'percent', amount: 5 }, effect: '+5% Defense',
    lore: 'A folding ward mechanism recovered from a forgotten defensive vault. Its layered plates remember the shape of the ancient war shields.' },
  { id: 'parallax-relay', name: 'Parallax Relay', rarity: 'Common', price: 1500,
    power: 'Elemental Light', buff: { stat: 'crit', kind: 'percentage-points', amount: 2 }, effect: '+2 percentage points Critical Rate',
    lore: 'A concealed targeting relay with a split crystal lens. A trace of Elemental Light aligns its two sightlines with uncanny precision.' },
  { id: 'fracture-reservoir', name: 'Fracture Reservoir', rarity: 'Common', price: 1200,
    power: 'Elemental Light', buff: { stat: 'shatterCapacity', kind: 'flat', amount: 5 }, effect: '+5 Shatter Capacity',
    lore: 'A sealed accumulator buried to keep it from the armies of the ancient war. Elemental Light rests within its nested rings, waiting for a new bearer.' },
] as const satisfies readonly CommonConduitDesign[];

export const additionalCommonConduits = [
  { id: 'prism-splinter-socket', name: 'Prism Splinter Socket', rarity: 'Common', price: 1600,
    power: 'Elemental Light', buff: { stat: 'elementalDamage', kind: 'percent', amount: 5 }, effect: '+5% Elemental Damage',
    lore: 'A bronze triangular clamp preserves one split crystal, its paired facets still carrying a trace of Elemental Light.' },
  { id: 'precision-escapement', name: 'Precision Escapement', rarity: 'Common', price: 1800,
    power: 'Mechanical', buff: { stat: 'critMultiplier', kind: 'percent', amount: 8 }, effect: '+8% Critical Damage multiplier',
    lore: 'A compact clock escapement turns an offset sight disc with measured force, preserving the timing of a perfect strike.' },
  { id: 'fieldbrace-coupler', name: 'Fieldbrace Coupler', rarity: 'Common', price: 1400,
    power: 'Mechanical', buffs: [{ stat: 'health', kind: 'percent', amount: 3 }, { stat: 'defense', kind: 'percent', amount: 3 }],
    effect: '+3% Health ~ +3% Defense', lore: 'Two bronze field braces close around a ceramic cushion, distributing strain across the bearer’s frame.' },
  { id: 'reserve-torque-crank', name: 'Reserve Torque Crank', rarity: 'Common', price: 1500,
    power: 'Mechanical', buffs: [{ stat: 'damage', kind: 'percent', amount: 3 }, { stat: 'health', kind: 'percent', amount: 3 }],
    effect: '+3% Attack ~ +3% Health', lore: 'A folded hand-crank winds a sealed reserve cylinder, trading compact force for a steadier reserve.' },
  { id: 'crosspin-governor', name: 'Crosspin Governor', rarity: 'Common', price: 1500,
    power: 'Elemental Light', buffs: [{ stat: 'damage', kind: 'percent', amount: 3 }, { stat: 'defense', kind: 'percent', amount: 3 }],
    effect: '+3% Attack ~ +3% Defense', lore: 'A bronze cross-shaped governor balances two armored counterweights around a stable central pin.' },
] as const satisfies readonly CommonConduitDesign[];

const expandedConduits = [
  { id: 'twinpulse-bellows', name: 'Twinpulse Bellows', rarity: 'Rare', buffs: [{ stat: 'health', kind: 'percent', amount: 15 }, { stat: 'damage', kind: 'percent', amount: 12 }], effect: '+15% Health ~ +12% Attack', lore: 'Double silver bellows drive a piston through two measured pulses.' },
  { id: 'glassroot-gimbal', name: 'Glassroot Gimbal', rarity: 'Rare', buffs: [{ stat: 'health', kind: 'percent', amount: 15 }, { stat: 'critMultiplier', kind: 'percent', amount: 15 }], effect: '+15% Health ~ +15% Critical Damage multiplier', lore: 'A spherical silver gimbal suspends a faceted reservoir beside its calibrated sight rings.' },
  { id: 'lifeline-flywheel', name: 'Lifeline Flywheel', rarity: 'Rare', buffs: [{ stat: 'health', kind: 'percent', amount: 15 }, { stat: 'shatterCapacity', kind: 'flat', amount: 15 }], effect: '+15% Health ~ +15 Shatter Capacity', lore: 'Braided channels feed an open flywheel that holds a measured reserve.' },
  { id: 'sentinel-aperture', name: 'Sentinel Aperture', rarity: 'Rare', buffs: [{ stat: 'defense', kind: 'percent', amount: 15 }, { stat: 'crit', kind: 'percentage-points', amount: 4 }], effect: '+15% Defense ~ +4 percentage points Critical Rate', lore: 'A shutter iris sits within an armored silver disc, opening only along a precise line.' },
  { id: 'wardglass-transformer', name: 'Wardglass Transformer', rarity: 'Rare', buffs: [{ stat: 'defense', kind: 'percent', amount: 15 }, { stat: 'elementalDamage', kind: 'percent', amount: 12 }], effect: '+15% Defense ~ +12% Elemental Damage', lore: 'Two crystal-insulated towers channel elemental pressure through stepped silver plates.' },
  { id: 'hammerbalance-link', name: 'Hammerbalance Link', rarity: 'Rare', buffs: [{ stat: 'damage', kind: 'percent', amount: 15 }, { stat: 'defense', kind: 'percent', amount: 12 }], effect: '+15% Attack ~ +12% Defense', lore: 'A hinged counterweight beam steadies a central impact joint.' },
  { id: 'breach-pendulum', name: 'Breach Pendulum', rarity: 'Rare', buffs: [{ stat: 'damage', kind: 'percent', amount: 15 }, { stat: 'critMultiplier', kind: 'percent', amount: 15 }], effect: '+15% Attack ~ +15% Critical Damage multiplier', lore: 'A silver pendulum blade swings inside an open fork frame.' },
  { id: 'coilfeed-ratchet', name: 'Coilfeed Ratchet', rarity: 'Rare', buffs: [{ stat: 'damage', kind: 'percent', amount: 15 }, { stat: 'shatterCapacity', kind: 'flat', amount: 15 }], effect: '+15% Attack ~ +15 Shatter Capacity', lore: 'A toothed silver ratchet feeds a coiled accumulator in measured increments.' },
  { id: 'opal-indexer', name: 'Opal Indexer', rarity: 'Rare', buffs: [{ stat: 'elementalDamage', kind: 'percent', amount: 12 }, { stat: 'crit', kind: 'percentage-points', amount: 4 }], effect: '+12% Elemental Damage ~ +4 percentage points Critical Rate', lore: 'Five inset opal lenses mark positions on a finely balanced silver indexing wheel.' },
  { id: 'resonance-crucible', name: 'Resonance Crucible', rarity: 'Rare', buffs: [{ stat: 'elementalDamage', kind: 'percent', amount: 15 }, { stat: 'critMultiplier', kind: 'percent', amount: 15 }], effect: '+15% Elemental Damage ~ +15% Critical Damage multiplier', lore: 'A crystal bridge joins two silver chambers, holding elemental resonance under pressure.' },
  { id: 'siege-cantilever', name: 'Siege Cantilever', rarity: 'Legendary', buffs: [{ stat: 'damage', kind: 'percent', amount: 85 }, { stat: 'defense', kind: 'percent', amount: -10 }], effect: '+85% Attack ~ -10% Defense', lore: 'An ivory siege arm projects from a narrow platinum pivot, sacrificing armor for reach.' },
  { id: 'nullsong-transmission', name: 'Nullsong Transmission', rarity: 'Legendary', buffs: [{ stat: 'damage', kind: 'percent', amount: 85 }, { stat: 'elementalDamage', kind: 'percent', amount: -10 }], effect: '+85% Attack ~ -10% Elemental Damage', lore: 'A platinum gear train turns inside silent crystal baffles, redirecting power from elemental channels.' },
  { id: 'horizon-heartcase', name: 'Horizon Heartcase', rarity: 'Legendary', buffs: [{ stat: 'health', kind: 'percent', amount: 85 }, { stat: 'defense', kind: 'percent', amount: -10 }], effect: '+85% Health ~ -10% Defense', lore: 'A white radial life chamber opens broad reserve vanes while its ward plates retract.' },
  { id: 'stasis-reliquary', name: 'Stasis Reliquary', rarity: 'Legendary', buffs: [{ stat: 'health', kind: 'percent', amount: 85 }, { stat: 'critMultiplier', kind: 'percent', amount: -10 }], effect: '+85% Health ~ -10% Critical Damage multiplier', lore: 'A platinum preservation capsule protects its reserve behind locked targeting rings.' },
  { id: 'granite-hourglass', name: 'Granite Hourglass', rarity: 'Legendary', buffs: [{ stat: 'defense', kind: 'percent', amount: 85 }, { stat: 'damage', kind: 'percent', amount: -10 }], effect: '+85% Defense ~ -10% Attack', lore: 'Twin armored cones throttle the drive between them to reinforce a dense shell.' },
  { id: 'pale-bulwark-diadem', name: 'Pale Bulwark Diadem', rarity: 'Legendary', buffs: [{ stat: 'defense', kind: 'percent', amount: 85 }, { stat: 'health', kind: 'percent', amount: -10 }], effect: '+85% Defense ~ -10% Health', lore: 'A crown-shaped fortress lattice folds inward around a narrow reserve core.' },
  { id: 'starvein-conductor', name: 'Starvein Conductor', rarity: 'Legendary', buffs: [{ stat: 'elementalDamage', kind: 'percent', amount: 85 }, { stat: 'health', kind: 'percent', amount: -10 }], effect: '+85% Elemental Damage ~ -10% Health', lore: 'White conductor branches carry a bright current around a deliberately drained life vessel.' },
  { id: 'meridian-inverter', name: 'Meridian Inverter', rarity: 'Legendary', buffs: [{ stat: 'elementalDamage', kind: 'percent', amount: 85 }, { stat: 'critMultiplier', kind: 'percent', amount: -10 }], effect: '+85% Elemental Damage ~ -10% Critical Damage multiplier', lore: 'A platinum reversing prism displaces its precision lenses to redirect elemental force.' },
  { id: 'execution-orrery', name: 'Execution Orrery', rarity: 'Legendary', buffs: [{ stat: 'critMultiplier', kind: 'percent', amount: 85 }, { stat: 'defense', kind: 'percent', amount: -10 }], effect: '+85% Critical Damage multiplier ~ -10% Defense', lore: 'An asymmetric celestial orrery folds its armor outward to align a decisive strike.' },
  { id: 'verdict-caliper', name: 'Verdict Caliper', rarity: 'Legendary', buffs: [{ stat: 'critMultiplier', kind: 'percent', amount: 85 }, { stat: 'elementalDamage', kind: 'percent', amount: -10 }], effect: '+85% Critical Damage multiplier ~ -10% Elemental Damage', lore: 'White precision jaws hold a throttled elemental core at an exact point.' },
] as const satisfies readonly { id: string; name: string; rarity: 'Rare' | 'Legendary'; buffs: readonly ConduitBuff[]; effect: string; lore: string }[];

const recoveredConduits = [
  { id: 'duplex-heart', name: 'Duplex Heart', rarity: 'Rare', buffs: [{ stat: 'health', kind: 'percent', amount: 15 }, { stat: 'defense', kind: 'percent', amount: 12 }], effect: '+15% Health ~ +12% Defense', lore: 'Twin silver chambers restore a broken machine’s life-support and armor lattice.' },
  { id: 'spearwheel-engine', name: 'Spearwheel Engine', rarity: 'Rare', buffs: [{ stat: 'damage', kind: 'percent', amount: 15 }, { stat: 'elementalDamage', kind: 'percent', amount: 15 }], effect: '+15% Attack ~ +15% Elemental Damage', lore: 'Interlocked silver flywheels translate elemental pressure into striking force.' },
  { id: 'falcon-sight', name: 'Falcon Sight', rarity: 'Rare', buffs: [{ stat: 'crit', kind: 'percentage-points', amount: 4 }, { stat: 'damage', kind: 'percent', amount: 12 }], effect: '+4 percentage points Critical Rate ~ +12% Attack', lore: 'A split-wing targeting lens rejoins two forgotten sightlines.' },
  { id: 'aegis-capacitor', name: 'Aegis Capacitor', rarity: 'Rare', buffs: [{ stat: 'defense', kind: 'percent', amount: 15 }, { stat: 'shatterCapacity', kind: 'flat', amount: 15 }], effect: '+15% Defense ~ +15 Shatter Capacity', lore: 'Silver ward plates protect a restored ring accumulator.' },
  { id: 'springwell-pump', name: 'Springwell Pump', rarity: 'Rare', buffs: [{ stat: 'health', kind: 'percent', amount: 15 }, { stat: 'elementalDamage', kind: 'percent', amount: 12 }], effect: '+15% Health ~ +12% Elemental Damage', lore: 'Two balanced impellers carry Elemental Light through a sealed silver vessel.' },
  { id: 'worldbreaker-drive', name: 'Worldbreaker Drive', rarity: 'Legendary', buffs: [{ stat: 'damage', kind: 'percent', amount: 85 }, { stat: 'health', kind: 'percent', amount: -10 }], effect: '+85% Attack ~ -10% Health', lore: 'An ivory siege crown diverts its life-support reserve into a tremendous striking engine.' },
  { id: 'immortal-vessel', name: 'Immortal Vessel', rarity: 'Legendary', buffs: [{ stat: 'health', kind: 'percent', amount: 85 }, { stat: 'damage', kind: 'percent', amount: -10 }], effect: '+85% Health ~ -10% Attack', lore: 'Platinum sanctuary chambers preserve their bearer by slowing the force-transmission drive.' },
  { id: 'citadel-spine', name: 'Citadel Spine', rarity: 'Legendary', buffs: [{ stat: 'defense', kind: 'percent', amount: 85 }, { stat: 'elementalDamage', kind: 'percent', amount: -10 }], effect: '+85% Defense ~ -10% Elemental Damage', lore: 'An articulated white fortress folds around its core, sacrificing elemental output for armor.' },
  { id: 'astral-prism', name: 'Astral Prism', rarity: 'Legendary', buffs: [{ stat: 'elementalDamage', kind: 'percent', amount: 85 }, { stat: 'defense', kind: 'percent', amount: -10 }], effect: '+85% Elemental Damage ~ -10% Defense', lore: 'A platinum prism unfolds its protective plates into an extraordinary elemental focus.' },
  { id: 'judgment-lens', name: 'Judgment Lens', rarity: 'Legendary', buffs: [{ stat: 'critMultiplier', kind: 'percent', amount: 85 }, { stat: 'health', kind: 'percent', amount: -10 }], effect: '+85% Critical Damage multiplier ~ -10% Health', lore: 'Nested ivory lenses magnify a perfect strike at the expense of their bearer’s reserve.' },
] as const satisfies readonly { id: string; name: string; rarity: 'Rare' | 'Legendary'; buffs: readonly ConduitBuff[]; effect: string; lore: string }[];

const omnicConduits = [
  { id: 'infernic-phoenix-reactor', name: 'Phoenix Reactor', element: 'infernic', mechanic: 'burn-focus', effect: '+60% Attack ~ +50% Elemental Damage ~ +40% Health. Inflicting Burn grants +5 percentage points Critical Rate for your next offensive activation; refreshes, never stacks.', buffs: [{ stat: 'damage', kind: 'percent', amount: 60 }, { stat: 'elementalDamage', kind: 'percent', amount: 50 }, { stat: 'health', kind: 'percent', amount: 40 }] },
  { id: 'aquatic-leviathan-pump', name: 'Leviathan Pump', element: 'oceanic', mechanic: 'shield-heal', effect: '+60% Health ~ +50% Defense ~ +40% Attack. When your ability increases an ally\'s shield, restore 5% of your maximum HP, once per activation; cannot revive.', buffs: [{ stat: 'health', kind: 'percent', amount: 60 }, { stat: 'defense', kind: 'percent', amount: 50 }, { stat: 'damage', kind: 'percent', amount: 40 }] },
  { id: 'tectonic-atlas-bastion', name: 'Atlas Bastion', element: 'botanic', mechanic: 'defense-ward', effect: '+60% Defense ~ +50% Health ~ +40% Attack. Entering Defense grants a shield worth 10% of your maximum HP; refreshes, never stacks.', buffs: [{ stat: 'defense', kind: 'percent', amount: 60 }, { stat: 'health', kind: 'percent', amount: 50 }, { stat: 'damage', kind: 'percent', amount: 40 }] },
  { id: 'efflorescent-worldtree-heart', name: 'Worldtree Heart', element: 'botanic', mechanic: 'renewal', effect: '+60% Health ~ +50% Elemental Damage ~ +40% Defense. At each new player turn, restore 2% of your maximum HP; cannot revive.', buffs: [{ stat: 'health', kind: 'percent', amount: 60 }, { stat: 'elementalDamage', kind: 'percent', amount: 50 }, { stat: 'defense', kind: 'percent', amount: 40 }] },
  { id: 'voltaic-thunderbird-coil', name: 'Thunderbird Coil', element: 'atmospheric', mechanic: 'critical-gauge', effect: '+60% Attack ~ +50% Elemental Damage ~ +40% Defense. An activation that critically hits an enemy restores 5 Shatter Gauge, once per activation.', buffs: [{ stat: 'damage', kind: 'percent', amount: 60 }, { stat: 'elementalDamage', kind: 'percent', amount: 50 }, { stat: 'defense', kind: 'percent', amount: 40 }] },
  { id: 'atmospheric-griffin-turbine', name: 'Griffin Turbine', element: 'atmospheric', mechanic: 'normal-momentum', effect: '+60% Attack ~ +50% Defense ~ +40% Health. Normal Attack empowers your next offensive skill by 10% outgoing damage; refreshes, never stacks.', buffs: [{ stat: 'damage', kind: 'percent', amount: 60 }, { stat: 'defense', kind: 'percent', amount: 50 }, { stat: 'health', kind: 'percent', amount: 40 }] },
  { id: 'luminous-seraph-mirror', name: 'Seraph Mirror', element: 'tranquilitic', mechanic: 'defeat-gauge', effect: '+60% Elemental Damage ~ +50% Health ~ +40% Defense. Defeating an enemy with an offensive activation restores 5 Shatter Gauge, once per activation.', buffs: [{ stat: 'elementalDamage', kind: 'percent', amount: 60 }, { stat: 'health', kind: 'percent', amount: 50 }, { stat: 'defense', kind: 'percent', amount: 40 }] },
  { id: 'ominous-eclipse-mantle', name: 'Eclipse Mantle', element: 'chaotic', mechanic: 'weaken-pierce', effect: '+60% Attack ~ +50% Health ~ +40% Defense. Inflicting Weaken makes your next offensive activation ignore 20% of enemy Defense; refreshes, never stacks.', buffs: [{ stat: 'damage', kind: 'percent', amount: 60 }, { stat: 'health', kind: 'percent', amount: 50 }, { stat: 'defense', kind: 'percent', amount: 40 }] },
  { id: 'tranquilitic-kirin-cradle', name: 'Kirin Cradle', element: 'tranquilitic', mechanic: 'defense-heal', effect: '+60% Health ~ +50% Defense ~ +40% Elemental Damage. Entering Defense restores 5% of your maximum HP; cannot revive.', buffs: [{ stat: 'health', kind: 'percent', amount: 60 }, { stat: 'defense', kind: 'percent', amount: 50 }, { stat: 'elementalDamage', kind: 'percent', amount: 40 }] },
  { id: 'chaotic-ouroboros-core', name: 'Ouroboros Core', element: 'chaotic', mechanic: 'ultimate-ward', effect: '+60% Attack ~ +50% Elemental Damage ~ +40% Health. Last Flare grants a shield worth 15% of your maximum HP; refreshes, never stacks. Recovery still applies.', buffs: [{ stat: 'damage', kind: 'percent', amount: 60 }, { stat: 'elementalDamage', kind: 'percent', amount: 50 }, { stat: 'health', kind: 'percent', amount: 40 }] },
  { id: 'infernic-cinder-testament', name: 'Cinder Testament', element: 'infernic', mechanic: 'ember-seals', effect: '+60% Elemental Damage ~ +50% Attack ~ +40% Defense. When your Burn damages an enemy, gain one Ember Seal, at most once per enemy phase and three total. Your next damaging skill consumes all seals for +5% outgoing damage per seal.', buffs: [{ stat: 'elementalDamage', kind: 'percent', amount: 60 }, { stat: 'damage', kind: 'percent', amount: 50 }, { stat: 'defense', kind: 'percent', amount: 40 }] },
  { id: 'aquatic-undertide-chronometer', name: 'Undertide Chronometer', element: 'oceanic', mechanic: 'undertide-cooldown', effect: '+60% Defense ~ +50% Health ~ +40% Elemental Damage. Your damaging skill hitting a Weakened enemy reduces your other ordinary skill cooldown by one, at most once per player turn; never reduces Last Flare recovery.', buffs: [{ stat: 'defense', kind: 'percent', amount: 60 }, { stat: 'health', kind: 'percent', amount: 50 }, { stat: 'elementalDamage', kind: 'percent', amount: 40 }] },
  { id: 'tectonic-faultkeeper-loom', name: 'Faultkeeper Loom', element: 'botanic', mechanic: 'faultkeeper-ward', effect: '+60% Health ~ +50% Defense ~ +40% Elemental Damage. The first direct enemy hit after each Defense deals 15% less damage to you; consumes the ward even if shield absorbs the hit.', buffs: [{ stat: 'health', kind: 'percent', amount: 60 }, { stat: 'defense', kind: 'percent', amount: 50 }, { stat: 'elementalDamage', kind: 'percent', amount: 40 }] },
  { id: 'efflorescent-verdant-covenant', name: 'Verdant Covenant', element: 'botanic', mechanic: 'verdant-covenant', effect: '+60% Elemental Damage ~ +50% Health ~ +40% Attack. When your healing restores another living ally, that ally gains +10% outgoing Normal Attack damage for its next Normal Attack; refreshes, never stacks.', buffs: [{ stat: 'elementalDamage', kind: 'percent', amount: 60 }, { stat: 'health', kind: 'percent', amount: 50 }, { stat: 'damage', kind: 'percent', amount: 40 }] },
  { id: 'voltaic-stormstep-dynamo', name: 'Stormstep Dynamo', element: 'atmospheric', mechanic: 'stormstep', effect: '+60% Attack ~ +50% Defense ~ +40% Elemental Damage. Skill 1 primes +10% outgoing damage for Skill 2; Skill 2 primes the same for Skill 1. One charge per slot; the current slot charge is consumed before priming the other, with no same-activation bonus.', buffs: [{ stat: 'damage', kind: 'percent', amount: 60 }, { stat: 'defense', kind: 'percent', amount: 50 }, { stat: 'elementalDamage', kind: 'percent', amount: 40 }] },
  { id: 'atmospheric-skythread-rudder', name: 'Skythread Rudder', element: 'atmospheric', mechanic: 'skythread', effect: '+60% Defense ~ +50% Attack ~ +40% Health. Defense grants one Tailwind charge. Your next ordinary skill costs five less Gauge, minimum one; consumed only on legal activation, refreshes rather than stacks.', buffs: [{ stat: 'defense', kind: 'percent', amount: 60 }, { stat: 'damage', kind: 'percent', amount: 50 }, { stat: 'health', kind: 'percent', amount: 40 }] },
  { id: 'luminous-dawn-witness-array', name: 'Dawn Witness Array', element: 'tranquilitic', mechanic: 'dawn-witness', effect: '+60% Health ~ +50% Elemental Damage ~ +40% Defense. A noncritical Normal Attack grants +3 percentage points Critical Rate for your next offensive activation, up to three charges. Critical activations use then clear all charges.', buffs: [{ stat: 'health', kind: 'percent', amount: 60 }, { stat: 'elementalDamage', kind: 'percent', amount: 50 }, { stat: 'defense', kind: 'percent', amount: 40 }] },
  { id: 'ominous-nightglass-archive', name: 'Nightglass Archive', element: 'chaotic', mechanic: 'nightglass', effect: '+60% Elemental Damage ~ +50% Defense ~ +40% Attack. Your damaging skill applies one Fracture Mark to each surviving target, maximum two per bearer and target. Your next Normal Attack consumes those marks for +8% outgoing damage each.', buffs: [{ stat: 'elementalDamage', kind: 'percent', amount: 60 }, { stat: 'defense', kind: 'percent', amount: 50 }, { stat: 'damage', kind: 'percent', amount: 40 }] },
  { id: 'tranquilitic-stillhour-carillon', name: 'Stillhour Carillon', element: 'tranquilitic', mechanic: 'stillhour', effect: '+60% Health ~ +50% Attack ~ +40% Defense. After Defense, the first direct enemy hit you survive grants +8 Shatter Gauge once; shield-absorbed hits qualify, damage over time does not.', buffs: [{ stat: 'health', kind: 'percent', amount: 60 }, { stat: 'damage', kind: 'percent', amount: 50 }, { stat: 'defense', kind: 'percent', amount: 40 }] },
  { id: 'chaotic-paradox-spindle', name: 'Paradox Spindle', element: 'chaotic', mechanic: 'paradox', effect: '+60% Attack ~ +50% Elemental Damage ~ +40% Health. After Last Flare, prime +15% outgoing damage for your first offensive activation once normal recovery ends. No bonus during that Last Flare and no recovery bypass.', buffs: [{ stat: 'damage', kind: 'percent', amount: 60 }, { stat: 'elementalDamage', kind: 'percent', amount: 50 }, { stat: 'health', kind: 'percent', amount: 40 }] },
] as const satisfies readonly { id: string; name: string; element: ElementId; mechanic: ConduitMechanic; effect: string; buffs: readonly ConduitBuff[] }[];

export const conduits = [
  ...commonConduits.map((entry) => ({ ...entry, art: entry.id, element: null, mechanic: null })),
  ...additionalCommonConduits.map((entry) => ({ ...entry, art: null, element: null, mechanic: null })),
  ...recoveredConduits.map((entry) => ({ ...entry, price: null, power: 'Elemental Light', art: entry.id, element: null, mechanic: null })),
  ...expandedConduits.map((entry) => ({ ...entry, price: null, power: 'Elemental Light', art: null, element: null, mechanic: null })),
  ...omnicConduits.slice(0, 10).map((entry) => ({ ...entry, rarity: 'Omnic' as const, price: null, power: 'Elemental Light', art: entry.id,
    lore: 'A fully restored elemental masterpiece from the ancient white machine.' })),
  ...omnicConduits.slice(10).map((entry) => ({ ...entry, rarity: 'Omnic' as const, price: null, power: 'Elemental Light', art: null,
    lore: 'A newly catalogued prismatic elemental masterpiece, awaiting its original reviewed artwork.' })),
  ...kitConduitDesigns.map((entry) => ({ ...entry, mechanic: 'kit-tuning' as const, power: 'Elemental Light', art: null })),
] as const;

export type Conduit = (typeof conduits)[number];
export type ConduitId = Conduit['id'];
export type ConduitSlots = (ConduitId | null)[];
export type ConduitLoadouts = Partial<Record<string, ConduitSlots>>;
export type ConduitUpgrades = Partial<Record<ConduitId, number>>;
export const conduitUpgradeCap = 5;
export const conduitUpgradeCosts = [25, 50, 100, 175, 250] as const;
export const conduitUpgradeRarityMultipliers = { Common: 1, Rare: 2, Legendary: 4, Omnic: 200 } as const satisfies Record<Conduit['rarity'], number>;
export function validateConduitUpgradeLevel(value: unknown): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > conduitUpgradeCap) {
    throw new Error('Conduit upgrade level must be an integer from 0 to 5.');
  }
  return value;
}
export function validateConduitUpgrades(value: unknown): ConduitUpgrades {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error('Invalid saved Conduit upgrades.');
  const result: ConduitUpgrades = {};
  for (const [id, level] of Object.entries(value)) {
    if (!isConduitId(id)) throw new Error('Unknown upgraded Conduit.');
    result[id] = validateConduitUpgradeLevel(level);
  }
  return result;
}
export function conduitUpgradeCost(conduit: Conduit, level: number): number | null {
  validateConduitUpgradeLevel(level);
  const cost = conduitUpgradeCosts[level];
  return cost === undefined ? null : cost * conduitUpgradeRarityMultipliers[conduit.rarity];
}
export const conduitSlotCount = 8;
export function validateConduitSlots(value: unknown): ConduitSlots {
  if (!Array.isArray(value) || value.length !== conduitSlotCount ||
      !value.every((id) => id === null || isConduitId(id))) throw new Error('Invalid Conduit slots.');
  const ids = value.filter((id) => id !== null);
  if (new Set(ids).size !== ids.length) throw new Error('Each named Conduit can be equipped only once per character.');
  if (ids.filter((id) => getConduit(id).rarity === 'Omnic').length > 4) throw new Error('Equip at most four Omnic Conduits per character.');
  return [...value];
}
export function validateConduitElement(equipment: ConduitSlots, element: ElementId): void {
  for (const id of validateConduitSlots(equipment)) {
    const conduit = id === null ? null : getConduit(id);
    if (conduit?.element && conduit.element !== element) throw new Error(`${conduit.name} requires a ${conduit.element} character.`);
  }
}
export function conduitBuffs(conduit: Conduit, level = 0): readonly ConduitBuff[] {
  validateConduitUpgradeLevel(level);
  const buffs = 'buff' in conduit ? [conduit.buff] : conduit.buffs;
  return buffs.map((buff) => ({ ...buff, amount: buff.amount * (1 + .5 * level) }));
}
export function conduitEffect(conduit: Conduit, level = 0): string {
  validateConduitUpgradeLevel(level);
  if (level === 0) return conduit.effect;
  const labels = { health: 'Health', damage: 'Attack', defense: 'Defense', crit: 'Critical Rate',
    critMultiplier: 'Critical Damage multiplier', elementalDamage: 'Elemental Damage', shatterCapacity: 'Shatter Capacity' };
  const stats = conduitBuffs(conduit, level).map((buff) => {
    const number = `${buff.amount > 0 ? '+' : ''}${buff.amount.toLocaleString('en-US', { maximumFractionDigits: 20 })}`;
    return `${number}${buff.kind === 'percent' ? '%' : buff.kind === 'percentage-points' ? ' percentage points' : ''} ${labels[buff.stat]}`;
  }).join(' ~ ');
  return conduit.mechanic ? `${stats}. ${conduit.effect.slice(conduit.effect.indexOf('. ') + 2)}` : stats;
}
export function conduitColor(conduit: Conduit): string {
  return conduit.rarity === 'Common' ? '#c39874' : conduit.rarity === 'Rare' ? '#c7cbd1' :
    conduit.rarity === 'Legendary' ? '#f1f0e9' : '#ded0ff';
}
export function conduitEquipReason(conduit: Conduit, element: ElementId, slots: ConduitSlots, slot: number): string | null {
  if (conduit.element && conduit.element !== element) return 'Element mismatch';
  const others = slots.filter((_, index) => index !== slot);
  if (others.includes(conduit.id)) return 'Already equipped';
  if (conduit.rarity === 'Omnic' && others.filter((id) => id !== null && getConduit(id).rarity === 'Omnic').length >= 4) return 'Four Omnic limit';
  return null;
}
export function isConduitId(value: unknown): value is ConduitId {
  return conduits.some((conduit) => conduit.id === value);
}
export function getConduit(id: ConduitId): Conduit {
  const conduit = conduits.find((entry) => entry.id === id);
  if (!conduit) throw new Error(`Unknown Conduit: ${id}.`);
  return conduit;
}
