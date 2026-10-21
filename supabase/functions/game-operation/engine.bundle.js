// src/content/activities.ts
var elements = [
  { id: "infernic", name: "Infernic", affinity: "Fire", dungeon: "Flaming Depths", infusion: "heavens" },
  { id: "oceanic", name: "Oceanic", affinity: "Water", dungeon: "Oceanic Valley", infusion: "heavens" },
  { id: "atmospheric", name: "Atmospheric", affinity: "Wind", dungeon: "Sky-bound Rift", infusion: "heavens" },
  { id: "botanic", name: "Botanic", affinity: "Nature", dungeon: "Garden of Beauty", infusion: "heavens" },
  { id: "tranquilitic", name: "Tranquilitic", affinity: "Peace", dungeon: "City of Heaven", infusion: "abyss" },
  { id: "chaotic", name: "Chaotic", affinity: "Dark Matter & Energy", dungeon: "Ruins of Chaos", infusion: "abyss" }
];
var materialRarities = ["Common", "Uncommon", "Rare", "Epic", "Legendary", "Omnic"];
var materialFirstNeededLevel = { Common: 0, Uncommon: 30, Rare: 45, Epic: 60, Legendary: 75, Omnic: 90 };
var materialDropLevelOffset = 5;
function materialDropLevel(rarity) {
  return rarity === "Common" ? 1 : materialFirstNeededLevel[rarity] + materialDropLevelOffset;
}
var elementalMaterials = elements.flatMap((element) => materialRarities.map((rarity) => ({
  id: `${element.id}-${rarity.toLowerCase()}`,
  elementId: element.id,
  rarity,
  name: `${element.name} ${rarity} Material`
})));
var dungeonStageCount = 35;
var infusionModeStageCount = 25;
var machineStageCount = 75;
var legacyActivityStageCounts = { heavens: 35, abyss: 35, machines: 100 };
function isResizedActivity(mode) {
  return Object.hasOwn(legacyActivityStageCounts, mode);
}
function migrateLegacyActivityStage(mode, stage) {
  const legacy = legacyActivityStageCounts[mode];
  const current = mode === "machines" ? machineStageCount : infusionModeStageCount;
  if (!Number.isSafeInteger(stage) || stage < 1 || stage > legacy) throw new Error("Invalid saved infusion stage.");
  return 1 + Math.ceil((stage - 1) * (current - 1) / (legacy - 1));
}
var warStageCount = 10;
var storyStageLayout = { regionStages: 20, stages: 120, previousRegionStages: 18, previousStages: 108, legacyRegionStages: 25, legacyStages: 150 };
var elementalDungeonRules = { stages: dungeonStageCount, startingLevel: 38, maximumLevel: 120, maximumLevelStage: dungeonStageCount };
var infusionModes = [
  { id: "heavens", name: "Soar to Heaven", energy: "Light", enemyTheme: "Dawnthorn Slime evolution line", stages: infusionModeStageCount, startingLevel: 50, enemyTiers: 6, uniqueEnemies: { minimum: 6, maximum: 6 } },
  { id: "abyss", name: "Delve into the Abyss", energy: "Chaotic", enemyTheme: "Wraththorn Slime evolution line", stages: infusionModeStageCount, startingLevel: 50, enemyTiers: 6, uniqueEnemies: { minimum: 6, maximum: 6 } }
];
var currencyModes = [
  { id: "treasury", name: "Crownfall Treasury", stages: 25, startingLevel: 65, maximumLevel: 120, enemyTiers: 6 },
  { id: "sanctuary", name: "Rosethorn Sanctuary", stages: 25, startingLevel: 65, maximumLevel: 120, enemyTiers: 6 }
];
var eventModes = [
  { id: "roses", name: "Passion of Crimson Roses", stages: 35, startingLevel: 80, maximumLevel: 140, enemyTiers: 6 }
];
var machineModes = [
  { id: "machines", name: "Awaken the Machines", stages: machineStageCount, startingLevel: 10, maximumLevel: 120, enemyTiers: 6 }
];
function isCurrencyMode(mode) {
  return currencyModes.some((entry) => entry.id === mode);
}
function infusionStageCount(mode) {
  const definition = [...infusionModes, ...currencyModes, ...eventModes, ...machineModes].find((entry) => entry.id === mode);
  if (!definition) throw new Error("Unknown staged Elemental-Devourer mode.");
  return definition.stages;
}
function validateMachineStage(stage) {
  const stages = infusionStageCount("machines");
  if (!Number.isInteger(stage) || stage < 1 || stage > stages) {
    throw new Error(`Awaken the Machines stage must be an integer from 1 to ${stages}.`);
  }
}
function getElement(id) {
  const element = elements.find((entry) => entry.id === id);
  if (!element) throw new Error(`Unknown element: ${id}`);
  return element;
}
function elementalEnemyLevel(stage) {
  if (!Number.isInteger(stage) || stage < 1 || stage > elementalDungeonRules.stages) {
    throw new Error(`Elemental dungeon stage must be an integer from 1 to ${dungeonStageCount}.`);
  }
  const progress = Math.min(stage, elementalDungeonRules.maximumLevelStage) - 1;
  return Math.round(elementalDungeonRules.startingLevel + progress * (elementalDungeonRules.maximumLevel - elementalDungeonRules.startingLevel) / (elementalDungeonRules.maximumLevelStage - 1));
}
var evolutionRecipes = [
  { from: 1, to: 2, rarities: ["Common"] },
  { from: 2, to: 3, rarities: ["Common", "Uncommon"] },
  { from: 3, to: 4, rarities: ["Uncommon", "Rare"] },
  { from: 4, to: 5, rarities: ["Rare", "Epic"] },
  { from: 5, to: 6, rarities: ["Epic", "Legendary"] }
];
function evolutionRequirement(elementId, from) {
  const element = getElement(elementId);
  const recipe = evolutionRecipes.find((entry) => entry.from === from);
  if (!recipe) throw new Error("Evolution source must be an integer from 1 to 5.");
  return {
    ...recipe,
    elementId,
    dungeon: element.dungeon,
    infusion: element.infusion,
    requiresFractalis: true,
    requiresInfusableEnemies: from >= 3,
    creatureCount: from >= 3 ? from - 2 : 0,
    minimumCreatureForm: from >= 3 ? from : null,
    /** D-346 addition rule: each captured copy is worth its form (1-6); the chosen copies must total this value. */
    fodderValue: from >= 3 ? (from - 2) * from : 0,
    quantitiesDefined: true
  };
}

// src/content/final-boss-loot.ts
var finalBossLootMultiplier = 5;
function bossLootMultiplier(activity, boss = true) {
  if (!boss) return 1;
  const final = activity.story ? activity.story.storyStage >= storyStageLayout.regionStages && activity.story.storyStage <= storyStageLayout.stages && activity.story.storyStage % storyStageLayout.regionStages === 0 : activity.dungeon ? activity.dungeon.stage === dungeonStageCount : activity.infusion ? activity.infusion.stage === infusionStageCount(activity.infusion.mode) : activity.war ? activity.war.stage === warStageCount : false;
  return final ? finalBossLootMultiplier : 1;
}
function bossLootRange(drop, multiplier) {
  if (!Number.isSafeInteger(multiplier) || multiplier < 1 || !Number.isSafeInteger(drop.minimum * multiplier) || !Number.isSafeInteger(drop.maximum * multiplier)) {
    throw new Error("Final-boss loot exceeds supported quantities.");
  }
  if (multiplier === 1) return drop;
  return { ...drop, minimum: drop.minimum * multiplier, maximum: drop.maximum * multiplier, quantityMultiplier: multiplier };
}

// src/content/loot-random.ts
function lootRoll(random) {
  const value2 = random();
  if (!Number.isFinite(value2) || value2 < 0 || value2 >= 1) throw new Error("Loot roll must be in [0, 1).");
  return value2;
}
function infusionLycalisOdds(level) {
  if (!Number.isInteger(level) || level < 50 || level > 120) throw new Error("Null-Prismatica drops require an infusion enemy level from 50 to 120.");
  if (level < 80) return [{ amount: 0, chance: 1 }];
  const growth = (level - 80) / 40;
  return [
    { amount: 0, chance: 0.9 - 0.15 * growth },
    { amount: 1, chance: 0.08 + 0.02 * growth },
    { amount: 2, chance: 0.015 + 0.085 * growth },
    { amount: 3, chance: 5e-3 + 0.045 * growth }
  ];
}
function sanctuaryLycalisOdds(level) {
  if (!Number.isInteger(level) || level < 65 || level > 120) throw new Error("Sanctuary Null-Prismatica drops require an enemy level from 65 to 120.");
  const growth = (level - 65) / 55;
  const chance = 0.5 + 0.3 * growth;
  return [{ amount: 0, chance: 1 - chance }, { amount: Math.round(1 + 4 * growth), chance }];
}
function stagedLycalisOdds(mode, level, stage) {
  if (mode === "treasury" || mode === "roses" || mode === "machines") throw new Error("This mode does not award Null-Prismatica drops.");
  const multiplier = stage === void 0 ? 1 : bossLootMultiplier({ infusion: { mode, stage } });
  return (mode === "sanctuary" ? sanctuaryLycalisOdds(level) : infusionLycalisOdds(level)).map((outcome) => ({ ...outcome, amount: outcome.amount * multiplier }));
}
function rollStagedLycalis(mode, level, random, stage) {
  return rollLycalisOdds(stagedLycalisOdds(mode, level, stage), random);
}
function rollLycalisOdds(odds, random) {
  const roll2 = lootRoll(random);
  let cumulative = 0;
  for (const outcome of odds) {
    cumulative += outcome.chance;
    if (roll2 < cumulative) return outcome.amount;
  }
  return odds[odds.length - 1].amount;
}
function scaledDrop(level, startingLevel, unlockLevel, startingChance, finalChance, finalQuantity, maximumLevel = 120) {
  if (!Number.isInteger(maximumLevel) || maximumLevel < 120 || maximumLevel > 140) throw new Error("Invalid loot maximum level.");
  if (!Number.isInteger(startingLevel) || startingLevel < 1 || startingLevel >= 120 || !Number.isInteger(level) || level < startingLevel || level > maximumLevel || !Number.isInteger(unlockLevel) || unlockLevel < startingLevel || unlockLevel > maximumLevel || !Number.isFinite(startingChance) || !Number.isFinite(finalChance) || startingChance <= 0 || finalChance < startingChance || finalChance > 1 || !Number.isSafeInteger(finalQuantity * 2) || finalQuantity < 1 || !Number.isInteger(finalQuantity)) throw new Error("Invalid scaled loot configuration.");
  if (level < unlockLevel) return void 0;
  const growth = ((level - startingLevel) / (maximumLevel - startingLevel)) ** 2;
  const minimum = 1 + Math.floor((finalQuantity - 1) * growth);
  const chanceGrowth = unlockLevel === maximumLevel ? 1 : ((level - unlockLevel) / (maximumLevel - unlockLevel)) ** 1.4;
  return { minimum, maximum: minimum * 2, chance: startingChance + (finalChance - startingChance) * chanceGrowth };
}
function rollDrop(drop, random) {
  const multiplier = drop.quantityMultiplier ?? 1;
  if (!Number.isSafeInteger(drop.minimum) || !Number.isSafeInteger(drop.maximum) || !Number.isSafeInteger(multiplier) || multiplier < 1 || drop.minimum % multiplier !== 0 || drop.maximum % multiplier !== 0 || drop.minimum < 1 || drop.maximum < drop.minimum || !Number.isFinite(drop.chance) || drop.chance <= 0 || drop.chance > 1) throw new Error("Invalid loot drop range or chance.");
  if (drop.chance < 1 && lootRoll(random) >= drop.chance) return void 0;
  return (drop.minimum / multiplier + Math.floor(lootRoll(random) * ((drop.maximum - drop.minimum) / multiplier + 1))) * multiplier;
}
function fractalisDrop(level, maximumLevel = 120) {
  if (!Number.isInteger(maximumLevel) || maximumLevel < 120 || maximumLevel > 140 || !Number.isInteger(level) || level < 1 || level > maximumLevel) throw new Error(`Prismatica drops require an enemy level from 1 to ${maximumLevel}.`);
  const minimum = 5 + Math.floor(10 * ((level - 1) / 119) ** 2);
  return { minimum, maximum: minimum * 2, chance: 1 };
}
var storyPrismaticaLine = { base: 5, perLevel: 2 };
var treasuryPrismaticaBoost = { startingLevel: 65, maximumLevel: 120, finalMultiplier: 20 };
function storyFractalisDrop(level) {
  if (!Number.isInteger(level) || level < 1 || level > 120) throw new Error("Story Prismatica requires an enemy level from 1 to 120.");
  const minimum = storyPrismaticaLine.base + storyPrismaticaLine.perLevel * (level - 1);
  return { minimum, maximum: minimum * 2, chance: 1 };
}
var storyEnemyPrismaticaBoost = 1.5;
function storyEnemyFractalisDrop(level, boss) {
  const drop = storyFractalisDrop(level);
  if (boss) return drop;
  const minimum = Math.round(drop.minimum * storyEnemyPrismaticaBoost);
  return { minimum, maximum: minimum * 2, chance: 1 };
}
function treasuryPrismaticaMultiplier(level) {
  const { startingLevel, maximumLevel, finalMultiplier } = treasuryPrismaticaBoost;
  if (!Number.isInteger(level) || level < startingLevel || level > maximumLevel) throw new Error("Treasury drops require an enemy level from 65 to 120.");
  return 1 + (finalMultiplier - 1) * ((level - startingLevel) / (maximumLevel - startingLevel)) ** 2;
}
function treasuryFractalisDrop(level) {
  const multiplier = treasuryPrismaticaMultiplier(level);
  const minimum = Math.round(storyFractalisDrop(level).minimum * multiplier);
  return { minimum, maximum: minimum * 2, chance: 1 };
}
var range = (drop) => `${drop.minimum.toLocaleString("en-US")}-${drop.maximum.toLocaleString("en-US")}`;
var treasuryPrismaticaText = `Prismatica per enemy: ${range(treasuryFractalisDrop(65))} at Lv.65 to ${range(treasuryFractalisDrop(120))} at Lv.120; the stage 25 final boss gives ${range(bossLootRange(treasuryFractalisDrop(120), 5))}.`;

// src/content/conduit-redesign.ts
var conduitRedesign = {
  "vigil-core": {
    "description": "+6% -> +21% to your maximum HP.",
    "ranges": [
      {
        "base": 6,
        "maximum": 21,
        "percent": true,
        "step": false
      }
    ]
  },
  "siegebound-drive": {
    "description": "+8% -> +16% [Normal Attack] Direct Damage.",
    "ranges": [
      {
        "base": 8,
        "maximum": 16,
        "percent": true,
        "step": false
      }
    ]
  },
  "bastion-lock": {
    "description": "+10% -> +35% Defense.",
    "ranges": [
      {
        "base": 10,
        "maximum": 35,
        "percent": true,
        "step": false
      }
    ]
  },
  "parallax-relay": {
    "description": "Attack Actions gain +15 -> +30 percentage points of Critical Rate.",
    "ranges": [
      {
        "base": 15,
        "maximum": 30,
        "percent": false,
        "step": false
      }
    ]
  },
  "fracture-reservoir": {
    "description": "+10 -> +35 [Elemental Gauge] capacity; begin each Battle with 5 -> 10 [Elemental Gauge].",
    "ranges": [
      {
        "base": 10,
        "maximum": 35,
        "percent": false,
        "step": false
      },
      {
        "base": 5,
        "maximum": 10,
        "percent": false,
        "step": false
      }
    ]
  },
  "prism-splinter-socket": {
    "description": "+10% -> +20% [Skill 1] Direct Damage.",
    "ranges": [
      {
        "base": 10,
        "maximum": 20,
        "percent": true,
        "step": false
      }
    ]
  },
  "precision-escapement": {
    "description": "+10% -> +35% Critical Damage multiplier.",
    "ranges": [
      {
        "base": 10,
        "maximum": 35,
        "percent": true,
        "step": false
      }
    ]
  },
  "fieldbrace-coupler": {
    "description": "When a [Shield] on you breaks, restore 6% -> 12% of your maximum HP at the start of your next player turn.",
    "ranges": [
      {
        "base": 6,
        "maximum": 12,
        "percent": true,
        "step": false
      }
    ]
  },
  "reserve-torque-crank": {
    "description": "[Elemental Gauge] you gain from abilities and hits is increased by 10% -> 25% (at least +1).",
    "ranges": [
      {
        "base": 10,
        "maximum": 25,
        "percent": true,
        "step": false
      }
    ]
  },
  "crosspin-governor": {
    "description": "+10% -> +20% [Skill 2] Direct Damage.",
    "ranges": [
      {
        "base": 10,
        "maximum": 20,
        "percent": true,
        "step": false
      }
    ]
  },
  "duplex-heart": {
    "description": "When an enemy hit damages your HP, heal the most injured other ally for 5% -> 10% of your maximum HP.",
    "ranges": [
      {
        "base": 5,
        "maximum": 10,
        "percent": true,
        "step": false
      }
    ]
  },
  "spearwheel-engine": {
    "description": "[Skill 1] ignores 15% -> 30% enemy Defense.",
    "ranges": [
      {
        "base": 15,
        "maximum": 30,
        "percent": true,
        "step": false
      }
    ]
  },
  "falcon-sight": {
    "description": "After two noncritical Attack Actions in a row, your next Attack Action is a guaranteed critical hit with +10% -> +20% Critical Damage.",
    "ranges": [
      {
        "base": 10,
        "maximum": 20,
        "percent": true,
        "step": false
      }
    ]
  },
  "aegis-capacitor": {
    "description": "Gain 4 -> 8 [Elemental Gauge] whenever your [Shield] absorbs enemy damage.",
    "ranges": [
      {
        "base": 4,
        "maximum": 8,
        "percent": false,
        "step": false
      }
    ]
  },
  "springwell-pump": {
    "description": "+20% -> +40% healing from your active abilities.",
    "ranges": [
      {
        "base": 20,
        "maximum": 40,
        "percent": true,
        "step": false
      }
    ]
  },
  "twinpulse-bellows": {
    "description": "Start each Battle with 15% -> 35% of your [Elemental Gauge] capacity added to your [Elemental Gauge].",
    "ranges": [
      {
        "base": 15,
        "maximum": 35,
        "percent": true,
        "step": false
      }
    ]
  },
  "glassroot-gimbal": {
    "description": "Attack Actions deal +1% -> +2% Direct Damage for every 10 [Elemental Gauge] you hold before paying the cost.",
    "ranges": [
      {
        "base": 1,
        "maximum": 2,
        "percent": true,
        "step": false
      }
    ]
  },
  "lifeline-flywheel": {
    "description": "After each Attack Action, heal for 8% -> 16% of the Direct Damage it dealt to HP.",
    "ranges": [
      { "base": 8, "maximum": 16, "percent": true, "step": false }
    ]
  },
  "sentinel-aperture": {
    "description": "Reduce the final Direct Damage of enemy critical hits against you by 25% -> 50%.",
    "ranges": [
      {
        "base": 25,
        "maximum": 50,
        "percent": true,
        "step": false
      }
    ]
  },
  "wardglass-transformer": {
    "description": "+20% -> +40% [Shield] amount from your abilities.",
    "ranges": [
      {
        "base": 20,
        "maximum": 40,
        "percent": true,
        "step": false
      }
    ]
  },
  "hammerbalance-link": {
    "description": "+12% -> +42% Attack; -4% -> -14% Defense.",
    "ranges": [
      {
        "base": 12,
        "maximum": 42,
        "percent": true,
        "step": false
      },
      {
        "base": -4,
        "maximum": -14,
        "percent": true,
        "step": false
      }
    ]
  },
  "breach-pendulum": {
    "description": "Attack Actions deal +20% -> +40% Direct Damage to enemies at full HP.",
    "ranges": [
      { "base": 20, "maximum": 40, "percent": true, "step": false }
    ]
  },
  "coilfeed-ratchet": {
    "description": "Your abilities cost 7% -> 14% less [Elemental Gauge] (rounded down). [Last Flare] cannot drop below 70 [Elemental Gauge].",
    "ranges": [
      {
        "base": 7,
        "maximum": 14,
        "percent": true,
        "step": false
      }
    ]
  },
  "opal-indexer": {
    "description": "Your [Weaken] lasts +1 -> +2 Enemy Turns longer.",
    "ranges": [
      {
        "base": 1,
        "maximum": 2,
        "percent": false,
        "step": true
      }
    ]
  },
  "resonance-crucible": {
    "description": "Damage beyond what defeats an enemy carries over as a [Bonus Strike] on the healthiest other enemy at 30% -> 60%.",
    "ranges": [
      {
        "base": 30,
        "maximum": 60,
        "percent": true,
        "step": false
      }
    ]
  },
  "worldbreaker-drive": {
    "description": "+35% -> +70% [Last Flare] Direct Damage; -6% -> -21% maximum HP.",
    "ranges": [
      {
        "base": 35,
        "maximum": 70,
        "percent": true,
        "step": false
      },
      {
        "base": -6,
        "maximum": -21,
        "percent": true,
        "step": false
      }
    ]
  },
  "immortal-vessel": {
    "description": "+25% -> +87.5% maximum HP; -6% -> -21% Attack.",
    "ranges": [
      {
        "base": 25,
        "maximum": 87.5,
        "percent": true,
        "step": false
      },
      {
        "base": -6,
        "maximum": -21,
        "percent": true,
        "step": false
      }
    ]
  },
  "citadel-spine": {
    "description": "+25% -> +87.5% Defense; -6 -> -21 percentage points of Critical Rate. Your [Shield] abilities also add 10% -> 20% of your Defense to the [Shield] amount.",
    "ranges": [
      { "base": 25, "maximum": 87.5, "percent": true, "step": false },
      { "base": -6, "maximum": -21, "percent": false, "step": false },
      { "base": 10, "maximum": 20, "percent": true, "step": false }
    ]
  },
  "astral-prism": {
    "description": "+20 -> +70 percentage points of Critical Rate; -6% -> -21% Defense. Critical Rate above 100% becomes [Elemental Crit] chance.",
    "ranges": [
      { "base": 20, "maximum": 70, "percent": false, "step": false },
      { "base": -6, "maximum": -21, "percent": true, "step": false }
    ]
  },
  "judgment-lens": {
    "description": "[Skill 1], [Skill 2] and [Last Flare] deal +40% -> +80% critical Direct Damage; [Normal Attack] cannot critically hit.",
    "ranges": [
      {
        "base": 40,
        "maximum": 80,
        "percent": true,
        "step": false
      }
    ]
  },
  "siege-cantilever": {
    "description": "Your all-enemy Attack Actions deal +60% -> +120% Direct Damage when only one enemy is alive.",
    "ranges": [
      {
        "base": 60,
        "maximum": 120,
        "percent": true,
        "step": false
      }
    ]
  },
  "nullsong-transmission": {
    "description": "+40% -> +80% [Normal Attack] Direct Damage; -12% -> -24% [Skill 1] and [Skill 2] Direct Damage.",
    "ranges": [
      {
        "base": 40,
        "maximum": 80,
        "percent": true,
        "step": false
      },
      {
        "base": -12,
        "maximum": -24,
        "percent": true,
        "step": false
      }
    ]
  },
  "horizon-heartcase": {
    "description": "When enemy Direct Damage would defeat you, drain [Elemental Gauge] instead and stay at 1 HP: 1 [Elemental Gauge] per 1% maximum HP of the excess, reduced by 20% -> 50%, plus 10 for each earlier save this Battle. Without enough [Elemental Gauge] you fall.",
    "ranges": [
      {
        "base": 20,
        "maximum": 50,
        "percent": true,
        "step": false
      }
    ]
  },
  "stasis-reliquary": {
    "description": "Direct Damage from a single enemy hit above 20% of your maximum HP is reduced by 30% -> 60%.",
    "ranges": [
      { "base": 30, "maximum": 60, "percent": true, "step": false }
    ]
  },
  "granite-hourglass": {
    "description": "At the start of each player turn, gain a [Shield] equal to 20% -> 40% of the HP you lost to Direct Damage during the previous Enemy Turn.",
    "ranges": [
      { "base": 20, "maximum": 40, "percent": true, "step": false }
    ]
  },
  "pale-bulwark-diadem": {
    "description": "Above 75% HP, take 15% -> 30% less Direct Damage. At or below 75% HP, [Shields] you cast on yourself are 25% -> 50% stronger.",
    "ranges": [
      {
        "base": 15,
        "maximum": 30,
        "percent": true,
        "step": false
      },
      {
        "base": 25,
        "maximum": 50,
        "percent": true,
        "step": false
      }
    ]
  },
  "starvein-conductor": {
    "description": "Abilities that apply [Burn] cost 5% of your maximum HP and give that [Burn] +30% -> +60% damage. The HP cost never drops you below 1 HP.",
    "ranges": [
      {
        "base": 30,
        "maximum": 60,
        "percent": true,
        "step": false
      }
    ]
  },
  "meridian-inverter": {
    "description": "Your [Shield] abilities heal allies for 75% -> 150% of the [Shield] amount instead of granting a [Shield].",
    "ranges": [
      {
        "base": 75,
        "maximum": 150,
        "percent": true,
        "step": false
      }
    ]
  },
  "execution-orrery": {
    "description": "Attack Actions deal +50% -> +100% Direct Damage to targets at or below 25% HP.",
    "ranges": [
      {
        "base": 50,
        "maximum": 100,
        "percent": true,
        "step": false
      }
    ]
  },
  "verdict-caliper": {
    "description": "Your Attack Actions cannot critically hit but deal +35% -> +70% Direct Damage.",
    "ranges": [
      {
        "base": 35,
        "maximum": 70,
        "percent": true,
        "step": false
      }
    ]
  },
  "infernic-phoenix-reactor": {
    "description": "The first time you are defeated each Battle, revive at 25% -> 50% of your maximum HP with 0 [Elemental Gauge].",
    "ranges": [
      {
        "base": 25,
        "maximum": 50,
        "percent": true,
        "step": false
      }
    ]
  },
  "aquatic-leviathan-pump": {
    "description": "Damage your [Shields] absorb during an Enemy Turn fills a healing pool of 30% -> 60% of that amount. At the start of the next player turn, the pool is split equally among injured allies.",
    "ranges": [
      { "base": 30, "maximum": 60, "percent": true, "step": false }
    ]
  },
  "tectonic-atlas-bastion": {
    "description": "[Normal Attack] taunts all enemies for that Enemy Turn and reduces Direct Damage to you by 10% -> 20%.",
    "ranges": [
      {
        "base": 10,
        "maximum": 20,
        "percent": true,
        "step": false
      }
    ]
  },
  "efflorescent-worldtree-heart": {
    "description": "Overhealing from your active abilities stores 50% -> 100% of the excess as a [Seed] on the recipient, which heals them at the start of the next player turn.",
    "ranges": [
      { "base": 50, "maximum": 100, "percent": true, "step": false }
    ]
  },
  "voltaic-thunderbird-coil": {
    "description": "When an Attack Action critically hits, it arcs to the healthiest other enemy for 30% -> 60% of that hit's HP damage.",
    "ranges": [
      { "base": 30, "maximum": 60, "percent": true, "step": false }
    ]
  },
  "atmospheric-griffin-turbine": {
    "description": "When your [Normal Attack] damages HP, each other ally gains [Elemental Gauge] equal to 15% -> 30% of that damage as a share of your Attack, up to 25 [Elemental Gauge] each. A hit for your full Attack gives 15 [Elemental Gauge] at +0.",
    "ranges": [
      {
        "base": 15,
        "maximum": 30,
        "percent": true,
        "step": false
      }
    ]
  },
  "luminous-seraph-mirror": {
    "description": "Critical Attack Actions heal each ally for 8% -> 16% of the HP damage dealt.",
    "ranges": [
      { "base": 8, "maximum": 16, "percent": true, "step": false }
    ]
  },
  "ominous-eclipse-mantle": {
    "description": "Attack Actions against a target with your [Weaken] consume one Enemy Turn of it to ignore 40% -> 60% of the target's Defense.",
    "ranges": [
      {
        "base": 40,
        "maximum": 60,
        "percent": true,
        "step": false
      }
    ]
  },
  "tranquilitic-kirin-cradle": {
    "description": "[Normal Attack] heals the ally with the lowest HP ratio, including you, for 50% -> 100% of your Defense.",
    "ranges": [
      { "base": 50, "maximum": 100, "percent": true, "step": false }
    ]
  },
  "chaotic-ouroboros-core": {
    "description": "[Last Flare] converts your [Elemental Gauge] above its cost into a [Shield] of 0.3% -> 0.6% of your maximum HP per [Elemental Gauge].",
    "ranges": [
      { "base": 0.3, "maximum": 0.6, "percent": true, "step": false }
    ]
  },
  "infernic-cinder-testament": {
    "description": "Your [Burn] deals +20% -> +40% more damage for each consecutive tick on the same enemy. Reapplying [Burn] resets the streak.",
    "ranges": [
      { "base": 20, "maximum": 40, "percent": true, "step": false }
    ]
  },
  "aquatic-undertide-chronometer": {
    "description": "Your first [Weaken] on each enemy each Battle delays its next scheduled skill by 1 -> 2 Enemy Turns.",
    "ranges": [
      {
        "base": 1,
        "maximum": 2,
        "percent": false,
        "step": true
      }
    ]
  },
  "tectonic-faultkeeper-loom": {
    "description": "Other allies gain Defense equal to 15% -> 30% of your Defense while you stand.",
    "ranges": [
      { "base": 15, "maximum": 30, "percent": true, "step": false }
    ]
  },
  "efflorescent-verdant-covenant": {
    "description": "Healing another ally gives their next [Skill 1] or [Skill 2] +20% -> +40% Direct Damage.",
    "ranges": [
      {
        "base": 20,
        "maximum": 40,
        "percent": true,
        "step": false
      }
    ]
  },
  "voltaic-stormstep-dynamo": {
    "description": "Alternating between [Skill 1] and [Skill 2] gives each switch +25% -> +50% Direct Damage. Any other action breaks the chain.",
    "ranges": [
      {
        "base": 25,
        "maximum": 50,
        "percent": true,
        "step": false
      }
    ]
  },
  "atmospheric-skythread-rudder": {
    "description": "Each [Normal Attack] grants a [Tailwind]. Each [Tailwind] reduces your next [Skill 1] or [Skill 2] cost by 10 -> 20 [Elemental Gauge], and that skill spends all of them.",
    "ranges": [
      {
        "base": 10,
        "maximum": 20,
        "percent": false,
        "step": false
      }
    ]
  },
  "luminous-dawn-witness-array": {
    "description": "Each noncritical [Normal Attack] adds a [Witness]. Your next critical Attack Action consumes them for a [Bonus Strike] of 15% -> 30% of your Attack per [Witness].",
    "ranges": [
      {
        "base": 15,
        "maximum": 30,
        "percent": true,
        "step": false
      }
    ]
  },
  "ominous-nightglass-archive": {
    "description": "Your damaging Attack Actions mark each surviving target with a [Fracture]. Your [Normal Attack] consumes them for +10% -> +20% Direct Damage per [Fracture].",
    "ranges": [
      {
        "base": 10,
        "maximum": 20,
        "percent": true,
        "step": false
      }
    ]
  },
  "tranquilitic-stillhour-carillon": {
    "description": "At the start of each [Last Flare] recovery turn, gain 15 -> 30 [Elemental Gauge] and give the same amount to the other ally with the lowest [Elemental Gauge].",
    "ranges": [
      {
        "base": 15,
        "maximum": 30,
        "percent": false,
        "step": false
      }
    ]
  },
  "chaotic-paradox-spindle": {
    "description": "During [Last Flare] recovery, you can use [Normal Attack] at 50% -> 75% Direct Damage.",
    "ranges": [
      {
        "base": 50,
        "maximum": 75,
        "percent": true,
        "step": false
      }
    ]
  },
  "tempered-strike-link": {
    "description": "Each [Normal Attack] against an enemy with your [Burn] consumes one Enemy Turn of it for a [Bonus Strike] of 80% -> 160% of that [Burn]'s tick damage.",
    "ranges": [
      { "base": 80, "maximum": 160, "percent": true, "step": false }
    ]
  },
  "mending-valve": {
    "description": "Each enemy you defeat with Direct Damage heals the most injured ally, including you, for 8% -> 16% of your maximum HP.",
    "ranges": [
      {
        "base": 8,
        "maximum": 16,
        "percent": true,
        "step": false
      }
    ]
  },
  "ward-stitch-spool": {
    "description": "Allies holding a [Shield] from your abilities receive +20% -> +40% healing from every source.",
    "ranges": [
      {
        "base": 20,
        "maximum": 40,
        "percent": true,
        "step": false
      }
    ]
  },
  "cinder-metering-nozzle": {
    "description": "When an enemy with your [Burn] dies, its remaining [Burn] spreads to the healthiest enemy at 25% -> 50% potency. Spread [Burn] cannot spread again.",
    "ranges": [
      {
        "base": 25,
        "maximum": 50,
        "percent": true,
        "step": false
      }
    ]
  },
  "pulse-trigger-pawl": {
    "description": "Critical [Skill 1] or [Skill 2] hits grant 8 -> 16 [Elemental Gauge].",
    "ranges": [
      {
        "base": 8,
        "maximum": 16,
        "percent": false,
        "step": false
      }
    ]
  },
  "firstlight-cam": {
    "description": "During the first Enemy Turn of each Battle, all allies take 25% -> 50% less Direct Damage.",
    "ranges": [
      {
        "base": 25,
        "maximum": 50,
        "percent": true,
        "step": false
      }
    ]
  },
  "secondbeat-rack": {
    "description": "When an enemy with your [Weaken] dies, its [Weaken] moves to the highest-Attack enemy at 60% -> 100% strength. Moved [Weaken] cannot move again.",
    "ranges": [
      {
        "base": 60,
        "maximum": 100,
        "percent": true,
        "step": false
      }
    ]
  },
  "flare-focusing-iris": {
    "description": "For each [Burn] phase consumed by [Flame Arc], your remaining [Burn] on each enemy lasts +1 -> +2 Enemy Turns longer.",
    "ranges": [
      { "base": 1, "maximum": 2, "percent": false, "step": true }
    ]
  },
  "clearwater-manifold": {
    "description": "[Elemental Gauge] you gain beyond your capacity passes 50% -> 100% of the excess to the other ally with the lowest [Elemental Gauge].",
    "ranges": [
      { "base": 50, "maximum": 100, "percent": true, "step": false }
    ]
  },
  "aegis-return-spring": {
    "description": "Each [Shield] you grant another ally also gives them a [Critical Seal], which turns the next enemy critical hit against them into a normal hit.",
    "ranges": []
  },
  "emberlife-kiln": {
    "description": "Your [Burn] heals you for 20% -> 40% of the damage it deals.",
    "ranges": [
      { "base": 20, "maximum": 40, "percent": true, "step": false }
    ]
  },
  "tension-governor": {
    "description": "Your [Weaken] is +5 -> +10 percentage points stronger.",
    "ranges": [
      {
        "base": 5,
        "maximum": 10,
        "percent": false,
        "step": false
      }
    ]
  },
  "covercharge-drum": {
    "description": "When another ally falls, every living ally restores 10% -> 20% of their maximum HP and gains 20 -> 40 [Elemental Gauge].",
    "ranges": [
      {
        "base": 10,
        "maximum": 20,
        "percent": true,
        "step": false
      },
      {
        "base": 20,
        "maximum": 40,
        "percent": false,
        "step": false
      }
    ]
  },
  "sootwake-crucible": {
    "description": "When your [Burn] ticks on a surviving enemy, it gains a [Sootwake]. The next hit from another ally on that enemy consumes all [Sootwake] for +20% -> +40% Direct Damage each.",
    "ranges": [
      {
        "base": 20,
        "maximum": 40,
        "percent": true,
        "step": false
      }
    ]
  },
  "tidebound-reflector": {
    "description": "When your [Shield] absorbs an enemy hit, reflect 20% -> 40% of the absorbed damage to the attacker.",
    "ranges": [
      { "base": 20, "maximum": 40, "percent": true, "step": false }
    ]
  },
  "pressurecrest-governor": {
    "description": "Each critical Attack Action grants a [Windveil] (hold one), which dodges the next enemy normal attack against you. [Windveil] cannot dodge on two Enemy Turns in a row.",
    "ranges": []
  },
  "rootbound-triage-vault": {
    "description": "After your active healing, spend 15 [Elemental Gauge] to heal the ally with the lowest HP up to 20% -> 40% of their maximum HP if they are below it.",
    "ranges": [
      {
        "base": 20,
        "maximum": 40,
        "percent": true,
        "step": false
      }
    ]
  },
  "solace-anchor": {
    "description": "Your first [Normal Attack] each player turn costs 10 -> 5 [Elemental Gauge] and does not spend your action.",
    "ranges": [
      { "base": 10, "maximum": 5, "percent": false, "step": false }
    ]
  },
  "ruinselect-prism": {
    "description": "Your Attack Actions deal +3% -> +6% Direct Damage for every 10% of your maximum HP you are missing.",
    "ranges": [
      { "base": 3, "maximum": 6, "percent": true, "step": false }
    ]
  },
  "infernic-pyre-census": {
    "description": "Your Attack Actions deal +10% -> +20% Direct Damage for each enemy with your [Burn].",
    "ranges": [
      { "base": 10, "maximum": 20, "percent": true, "step": false }
    ]
  },
  "oceanic-shared-tide-pump": {
    "description": "When an ally with your [Shield] is hit, your [Shields] on other allies absorb the hit first.",
    "ranges": []
  },
  "atmospheric-storm-clock": {
    "description": "Each critical Attack Action stores a [Storm Clock] charge that reduces your next [Last Flare] cost by 15 -> 30 [Elemental Gauge]. [Last Flare] spends all charges.",
    "ranges": [
      {
        "base": 15,
        "maximum": 30,
        "percent": false,
        "step": false
      }
    ]
  },
  "botanic-graft-covenant": {
    "description": "[Flora]'s [Seeds] store +50% -> +100% healing. Newly planted and refreshed [Seeds] receive the bonus, which adds to stored healing. No new resource or [Seed] is created.",
    "ranges": [
      { "base": 50, "maximum": 100, "percent": true, "step": false }
    ]
  },
  "tranquilitic-accord-bastion": {
    "description": "Supporting another ally grants them [Accord] (first time each Battle per ally): the next hit that would defeat them leaves them at 1 HP and grants a [Shield] of 10% -> 20% of your maximum HP.",
    "ranges": [
      {
        "base": 10,
        "maximum": 20,
        "percent": true,
        "step": false
      }
    ]
  },
  "chaotic-fault-verdict": {
    "description": "When your Attack Action critically hits and the target survives, spend your [Shield] to deal 50% -> 100% of it as a [Bonus Strike].",
    "ranges": [
      { "base": 50, "maximum": 100, "percent": true, "step": false }
    ]
  },
  "master-ember-1": {
    "description": "When [Infernis]'s [Burn] would expire, pay 3% of maximum HP to extend it by one Enemy Turn while [Infernis] is above 50% HP.",
    "ranges": []
  },
  "master-ember-2": {
    "description": "[Flame Arc] hits one target with double Direct Damage and detonates only that target's [Burn].",
    "ranges": []
  },
  "master-ember-3": {
    "description": "[Flame Arc] detonates your [Burn] on its target, consuming one tick.",
    "ranges": []
  },
  "master-tide-1": {
    "description": "The first time each Battle a hit breaks [Tizu]'s [Shield] on an ally, its damage does not carry over to that ally's HP.",
    "ranges": []
  },
  "master-tide-2": {
    "description": "[Tidal Shelter] gives the selected ally three times its [Shield] amount for one Enemy Turn instead of shielding the team.",
    "ranges": []
  },
  "master-tide-3": {
    "description": "Enemies with [Tizu]'s [Weaken] target [Tizu] with single-target attacks while he lives.",
    "ranges": []
  },
  "master-sprout-1": {
    "description": "After any ally's [Skill 1] or [Skill 2], heal each ally for 2% of their maximum HP.",
    "ranges": []
  },
  "master-sprout-2": {
    "description": "A damaging [Skill 1] applies [Rootbind]: the target's next scheduled skill becomes a [Normal Attack].",
    "ranges": []
  },
  "master-sprout-3": {
    "description": "The first [Last Flare: Worldseed] each Battle that finds a fallen ally revives each fallen ally at 30% of their maximum HP with 0 [Elemental Gauge].",
    "ranges": []
  },
  "master-atmoso-1": {
    "description": "[Normal Attack] hits all enemies at 70% Direct Damage.",
    "ranges": []
  },
  "master-atmoso-2": {
    "description": "[Cyclone Weave] grants [Counterwind] until [Atmoso]'s next action: each Direct Damage hit he survives adds +15% Direct Damage to that action.",
    "ranges": []
  },
  "master-atmoso-3": {
    "description": "Your Attack Actions gain 1% Direct Damage per percentage point of Critical Rate above 100%. Disabled by [Verdict Caliper].",
    "ranges": []
  },
  "master-aurora-1": {
    "description": "Enemies with [Aurora]'s [Seal] have 15% less Defense against allied Attack Actions until the [Seal] ends.",
    "ranges": []
  },
  "master-aurora-2": {
    "description": "[Aurora]'s [Last Flare] applies a [Judgment Seal] to each surviving enemy for two Enemy Turns. Enemies with [Judgment Seal] cannot critically hit.",
    "ranges": []
  },
  "master-aurora-3": {
    "description": "When an enemy with [Aurora]'s [Seal] damages an ally's HP, heal the most injured other ally for 50% of that damage.",
    "ranges": []
  },
  "master-bliss-1": {
    "description": "Before [Skill 2], [Bliss] pays 10% of her maximum HP and splits it as extra healing among the other allies.",
    "ranges": []
  },
  "master-bliss-2": {
    "description": "[Warfeather Cut] strikes the same target twice, each at 70% Direct Damage.",
    "ranges": []
  },
  "master-bliss-3": {
    "description": "[Bliss]'s [Last Flare] gives the other ally with the lowest [Elemental Gauge] a [Quiet Feather]: their next [Skill 1] costs no [Elemental Gauge].",
    "ranges": []
  },
  "master-bruno-1": {
    "description": "Enemy hits deal 20% less Direct Damage to [Bruno] after his [Shield] absorbs damage.",
    "ranges": []
  },
  "master-bruno-2": {
    "description": "[Bruno]'s [Last Flare] grants himself a [Shield] equal to 200% of his Defense, or 20% of his maximum HP if higher. [Cover] is unchanged.",
    "ranges": []
  },
  "master-bruno-3": {
    "description": "Each damaging [Skill 1] removes 15% of the target's Defense for the rest of the Battle. [Skill 2] [Cover] redirects 35% instead of 50%.",
    "ranges": []
  },
  "master-disciple-1": {
    "description": "[Disciple]'s [Instructions] expire two player Rounds later and still apply to the recipient's next action.",
    "ranges": []
  },
  "master-disciple-2": {
    "description": "After [Last Flare], allies are linked for two player Rounds: [Elemental Gauge] gained by a linked ally is split equally among all linked allies.",
    "ranges": []
  },
  "master-disciple-3": {
    "description": "After a [Strike] [Instruction], its recipient makes a [Bonus Strike] of 40% of their own Attack, including applicable Attack buffs, against the first enemy.",
    "ranges": []
  },
  "master-elise-1": {
    "description": "[Elise]'s critical hits ignore 50% enemy Defense, but their critical multiplier is fixed at 1.5.",
    "ranges": []
  },
  "master-elise-2": {
    "description": "[Last Flare] strikes each target four times at 30% Direct Damage each.",
    "ranges": []
  },
  "master-elise-3": {
    "description": "Each enemy [Elise] defeats with Direct Damage lets her act again that player turn.",
    "ranges": []
  },
  "master-razor-1": {
    "description": "After using [Normal Attack], [Razor] parries the first enemy skill aimed at him that Enemy Turn: it deals 50% less Direct Damage and reflects 50% of the prevented damage to the attacker.",
    "ranges": []
  },
  "master-razor-2": {
    "description": "Before [Last Flare], [Razor] consumes his [Shield] for +2% Direct Damage per 1% of maximum HP it held.",
    "ranges": []
  },
  "master-razor-3": {
    "description": "The first [Skill 1] hit on each enemy each Battle applies [Silence]: the target's next scheduled skill becomes a [Normal Attack].",
    "ranges": []
  },
  "master-rosetta-1": {
    "description": "After two allies hit the [Quarry], each further hit on it grants a [Shield] equal to 48% of the maximum HP of the ally with the lowest HP ratio.",
    "ranges": []
  },
  "master-rosetta-2": {
    "description": "After [Skill 2] hits the [Quarry], each other living enemy takes a [Bonus Strike] equal to 25% of the hit's Direct Damage.",
    "ranges": []
  },
  "master-rosetta-3": {
    "description": "Each [Last Flare] adds a [Golden Opening] to the [Quarry]. Each one gives another ally's next hit on it +40% Direct Damage, then is consumed. Openings stack.",
    "ranges": []
  },
  "master-thornia-1": {
    "description": "When an enemy triggers [Thornia]'s trap, deal a [Bonus Strike] of 40% of her Attack to every enemy.",
    "ranges": []
  },
  "master-thornia-2": {
    "description": "When [Skill 2] hits a target with three trap charges, it hits all enemies and applies 15% [Weaken] for one Enemy Turn to the others. The target loses one trap charge.",
    "ranges": []
  },
  "master-thornia-3": {
    "description": "[Gilded Thorn Guard] links its recipients to [Thornia] until the next player turn. Lethal damage to a linked ally is moved to [Thornia]'s [Shield] and HP instead.",
    "ranges": []
  },
  "master-crinso-1": {
    "description": "A critical [Golden Edge] stores its extra critical damage as a bonus for your next [Crimson Rupture]. Stored bonuses stack.",
    "ranges": []
  },
  "master-crinso-2": {
    "description": "Before [Crimson Rupture], consume your [Shield]. After it hits, deal a [Bonus Strike] equal to 50% of the [Shield] consumed.",
    "ranges": []
  },
  "master-crinso-3": {
    "description": "[Golden Edge] and [Crimson Rupture] alternate bonuses, starting with [Golden Edge]: [Golden Edge] deals +30% Direct Damage; [Crimson Rupture] heals [Crinso] for 20% of its HP damage. [Last Flare: Blossoming Cataclysm] gets both bonuses and restarts the order at [Golden Edge].",
    "ranges": []
  },
  "master-nerithe-1": {
    "description": "[Nerithe]'s [Normal Attack] marks its target with [Charted]. Another ally's next single-target Attack Action deals a [Bonus Strike] of 40% of its damage to each other [Charted] enemy, then clears all [Charted].",
    "ranges": []
  },
  "master-nerithe-2": {
    "description": "[Fold the Sea] deals no damage. Instead, it grants each ally 15 [Elemental Gauge] and 15% less damage from their next enemy hit.",
    "ranges": []
  },
  "master-nerithe-3": {
    "description": "[Ocean Beyond the Map] deals 50% less Direct Damage but has no recovery turn.",
    "ranges": []
  },
  "master-orvella-1": {
    "description": "[Foundation] has half durability, and each ally also gains a [Shield] of 5% of your maximum HP when it is created.",
    "ranges": []
  },
  "master-orvella-2": {
    "description": "After [Foundation] is created, its durability heals injured allies in equal shares.",
    "ranges": []
  },
  "master-orvella-3": {
    "description": "[Orvella] gains +20% Defense for each ally protected by a [Shield] or her [Foundation].",
    "ranges": []
  },
  "master-vaelor-1": {
    "description": "[Last Chord of the Sky] costs 20% of [Vaelor]'s current HP and deals +75% Direct Damage.",
    "ranges": []
  },
  "master-vaelor-2": {
    "description": "[Skill 2] used during [Rise] also applies 15% [Weaken] for one Enemy Turn.",
    "ranges": []
  },
  "master-vaelor-3": {
    "description": "[Vaelor]'s [Normal Attack] lets the other ally with the most [Elemental Gauge] act again this player turn.",
    "ranges": []
  }
};
function redesignValue(level, base, maximum) {
  if (!Number.isSafeInteger(level) || level < 0) throw new Error("Invalid Conduit effect level.");
  return base + (maximum - base) * level / 5;
}
function redesignStep(level, base, maximum) {
  redesignValue(level, base, maximum);
  return level < 3 ? base : maximum;
}
function redesignEffect(id, level = 0) {
  const design = conduitRedesign[id];
  if (!design) throw new Error("Missing redesigned Conduit definition: " + id);
  redesignValue(level, 0, 0);
  let index = 0;
  return design.description.replace(
    /([+-]?\d+(?:\.\d+)?)(%?)\s*->\s*([+-]?\d+(?:\.\d+)?)(%?)/g,
    (_match, first, leftUnit, _last, rightUnit) => {
      const range2 = design.ranges[index++];
      const amount = range2.step ? redesignStep(level, range2.base, range2.maximum) : redesignValue(level, range2.base, range2.maximum);
      return (first.startsWith("+") && amount >= 0 ? "+" : "") + Number(amount.toFixed(8)).toString() + (leftUnit || rightUnit);
    }
  );
}

// src/content/kit-conduits.ts
var kitConduitDesigns = [
  {
    id: "tempered-strike-link",
    name: "Phoenix Temper Dominion",
    rarity: "Omnic",
    price: null,
    theme: "infernic",
    element: "infernic",
    buffs: [],
    effect: redesignEffect("tempered-strike-link"),
    lore: "The reborn striking engine tempers its reserve in genuine embers before releasing a measured return.",
    artDesign: "fully reborn articulated striking-link engine with a readable protected crimson ceramic pivot, six majestic phoenix blade fans, nested orange siege rings, a crown of interlocking impact vanes and densely layered scarlet ribbons"
  },
  {
    id: "mending-valve",
    name: "Worldroot Sap Cathedral",
    rarity: "Omnic",
    price: null,
    theme: "botanic",
    element: "botanic",
    buffs: [],
    effect: redesignEffect("mending-valve"),
    lore: "A restored restoration valve stores only the pulse of health actually returned.",
    artDesign: "fully reborn flower-valve cathedral with a readable protected ivory restoration channel, six majestic jade leaf fans, nested root rings, a petal crown and densely layered emerald covenant ribbons between articulated shutters"
  },
  {
    id: "ward-stitch-spool",
    name: "Leviathan Ward Loom",
    rarity: "Omnic",
    price: null,
    theme: "oceanic",
    element: "oceanic",
    buffs: [],
    effect: redesignEffect("ward-stitch-spool"),
    lore: "A completed ward loom recovers the tension spent protecting a living vessel.",
    artDesign: "fully reborn sapphire ward loom with a readable protected spool between pearl guides, six majestic shell fans, nested tidal rings, a leviathan crest crown and densely layered opaque blue ward ribbons"
  },
  {
    id: "cinder-metering-nozzle",
    name: "Eternal Cinder Observatory",
    rarity: "Omnic",
    price: null,
    theme: "infernic",
    element: "infernic",
    buffs: [],
    effect: redesignEffect("cinder-metering-nozzle"),
    lore: "The restored nozzle holds an ember clock rather than creating a flame from nothing.",
    artDesign: "fully reborn triangular cinder observatory with a readable protected three-baffle nozzle, six majestic orange flame fans, nested scarlet clock rings, an ember crown and densely layered opaque crimson pressure ribbons"
  },
  {
    id: "pulse-trigger-pawl",
    name: "Sky Sovereign Escapement",
    rarity: "Omnic",
    price: null,
    theme: "atmospheric",
    element: "atmospheric",
    buffs: [],
    effect: redesignEffect("pulse-trigger-pawl"),
    lore: "A sovereign wind escapement returns a successful pressure pulse to a guarded timing wheel.",
    artDesign: "fully reborn teal ratchet escapement with a readable protected ceramic tooth, six majestic turbine feather fans, nested timing rings, an ivory sky crown and densely layered opaque wind ribbons"
  },
  {
    id: "firstlight-cam",
    name: "Firstlight Concordance",
    rarity: "Omnic",
    price: null,
    theme: "tranquilitic",
    element: "tranquilitic",
    buffs: [],
    effect: redesignEffect("firstlight-cam"),
    lore: "A restored opening cam aligns an allied mechanism only after genuine support.",
    artDesign: "fully reborn ivory concordance cam with a readable protected opening joint, six majestic petal fans, nested precision rings, a pearl sanctuary crown and densely layered turquoise support ribbons between articulated arms"
  },
  {
    id: "secondbeat-rack",
    name: "Secondbeat Rupture Throne",
    rarity: "Omnic",
    price: null,
    theme: "chaotic",
    element: "chaotic",
    buffs: [],
    effect: redesignEffect("secondbeat-rack"),
    lore: "The reborn offset rack measures actual suppression before indexing a new fracture.",
    artDesign: "fully reborn obsidian toothed-rack throne with a readable protected double jaw, six majestic fractured blade fans, nested violet fault rings, a crimson rupture crown and densely layered opaque tension ribbons"
  },
  {
    id: "flare-focusing-iris",
    name: "Ember Coronation Iris",
    rarity: "Omnic",
    price: null,
    theme: "infernic",
    element: "infernic",
    buffs: [],
    effect: redesignEffect("flare-focusing-iris"),
    lore: "An enthroned iris feeds each spent ember back into the flames already burning.",
    artDesign: "fully reborn scarlet six-leaf focusing iris with a readable protected faceted central crystal, six majestic phoenix shield fans, nested coronation rings, an ivory siege crown and densely layered orange protective ribbons"
  },
  {
    id: "clearwater-manifold",
    name: "Abyssal Clearwater Parliament",
    rarity: "Omnic",
    price: null,
    theme: "oceanic",
    element: "oceanic",
    buffs: [],
    effect: redesignEffect("clearwater-manifold"),
    lore: "A restored manifold routes consumed ward pressure to a separate protected chamber.",
    artDesign: "fully reborn three-chamber sapphire manifold with a readable protected return piston, six majestic pearl tide fans, nested channel rings, an abyssal shell crown and densely layered opaque blue return ribbons"
  },
  {
    id: "aegis-return-spring",
    name: "Aegis Covenant Crown",
    rarity: "Omnic",
    price: null,
    theme: "tranquilitic",
    element: "tranquilitic",
    buffs: [],
    effect: redesignEffect("aegis-return-spring"),
    lore: "The restored spring releases protected pressure as a brief ally covenant.",
    artDesign: "fully reborn pearl shield-spring crown with a readable protected compression cage, six majestic sanctuary plate fans, nested covenant rings, an ivory aegis crown and densely layered turquoise return ribbons"
  },
  {
    id: "emberlife-kiln",
    name: "Phoenix Lifeforge",
    rarity: "Omnic",
    price: null,
    theme: "infernic",
    element: "infernic",
    buffs: [],
    effect: redesignEffect("emberlife-kiln"),
    lore: "The completed kiln salvages a measured ember pulse without pretending it is native restoration.",
    artDesign: "fully reborn vaulted crimson lifeforge with a readable protected ceramic kiln core, six majestic phoenix petal fans, nested life-channel rings, an ivory furnace crown and densely layered orange restoration ribbons"
  },
  {
    id: "tension-governor",
    name: "Fractured Mercy Governor",
    rarity: "Omnic",
    price: null,
    theme: "chaotic",
    element: "chaotic",
    buffs: [],
    effect: redesignEffect("tension-governor"),
    lore: "A completed suppression governor diverts a precise fraction of weakened resistance to a separate ward.",
    artDesign: "fully reborn obsidian twin-jaw governor with a readable protected counterweight, six majestic violet fault fans, nested tension rings, a crimson mercy crown and densely layered opaque fractured ribbons"
  },
  {
    id: "covercharge-drum",
    name: "Worldgrove Covercharge Heart",
    rarity: "Omnic",
    price: null,
    theme: "botanic",
    element: "botanic",
    buffs: [],
    effect: redesignEffect("covercharge-drum"),
    lore: "A restored living drum closes its own plates only when another vessel is truly repaired.",
    artDesign: "fully reborn jade armored heart drum with a readable protected reserve wheel, six majestic root plate fans, nested grove rings, a gray stone leaf crown and densely layered emerald protective ribbons"
  },
  {
    id: "sootwake-crucible",
    name: "Sootwake Phoenix Mirror",
    rarity: "Omnic",
    price: null,
    theme: "infernic",
    element: "infernic",
    buffs: [],
    effect: redesignEffect("sootwake-crucible"),
    lore: "The reborn crucible reflects an existing ember channel into a measured self-ward.",
    artDesign: "fully reborn scarlet siege mirror crucible with a readable protected thorn aperture, six majestic phoenix armor fans, nested sootwake rings, an ivory targeting crown and densely layered orange reflection ribbons"
  },
  {
    id: "tidebound-reflector",
    name: "Leviathan Mercy Reflector",
    rarity: "Omnic",
    price: null,
    theme: "oceanic",
    element: "oceanic",
    buffs: [],
    effect: redesignEffect("tidebound-reflector"),
    lore: "A completed tide reflector directs a genuine ward expansion toward the vessel under greatest strain.",
    artDesign: "fully reborn sapphire shell reflector with a readable protected faceted mirror, six majestic ivory tidal plate fans, nested mercy rings, a leviathan pearl crown and densely layered opaque blue shelter ribbons"
  },
  {
    id: "pressurecrest-governor",
    name: "Tempest Shelter Sovereign",
    rarity: "Omnic",
    price: null,
    theme: "atmospheric",
    element: "atmospheric",
    buffs: [],
    effect: redesignEffect("pressurecrest-governor"),
    lore: "A restored pressure crest directs real critical impact into an ally shelter rather than another attack.",
    artDesign: "fully reborn teal feather-vane sovereign with a readable protected pressure governor, six majestic turbine shelter fans, nested calibrated rings, an ivory tempest crown and densely layered opaque wind ribbons"
  },
  {
    id: "rootbound-triage-vault",
    name: "Worldroot Triage Sanctuary",
    rarity: "Omnic",
    price: null,
    theme: "botanic",
    element: "botanic",
    buffs: [],
    effect: redesignEffect("rootbound-triage-vault"),
    lore: "A restored triage vault repairs one timing channel only under genuine pre-heal strain.",
    artDesign: "fully reborn ivory restoration vault with a readable protected triage chamber, six majestic emerald root fans, nested sanctuary rings, a gray stone petal crown and densely layered jade restoration ribbons"
  },
  {
    id: "solace-anchor",
    name: "Solace Witness Monolith",
    rarity: "Omnic",
    price: null,
    theme: "tranquilitic",
    element: "tranquilitic",
    buffs: [],
    effect: redesignEffect("solace-anchor"),
    lore: "A completed sanctuary anchor steadies one swift strike each turn without breaking its bearer\u2019s stance.",
    artDesign: "fully reborn ivory sanctuary anchor with a readable protected locking joint, six majestic fortress fans, nested solace rings, a pearl witness crown and densely layered turquoise covenant ribbons"
  },
  {
    id: "ruinselect-prism",
    name: "Ruinselect Fracture Parliament",
    rarity: "Omnic",
    price: null,
    theme: "chaotic",
    element: "chaotic",
    buffs: [],
    effect: redesignEffect("ruinselect-prism"),
    lore: "The restored parliament draws power from every fracture in its own bearer\u2019s frame.",
    artDesign: "fully reborn fractured obsidian selection orrery with a readable protected central prism, six majestic violet targeting fans, nested fault rings, a crimson parliamentary crown and densely layered opaque precision ribbons"
  },
  {
    id: "infernic-pyre-census",
    name: "Pyre Census Requiem",
    rarity: "Omnic",
    price: null,
    theme: "infernic",
    element: "infernic",
    buffs: [],
    effect: redesignEffect("infernic-pyre-census"),
    lore: "The completed census counts every pyre its bearer has lit and answers each with force.",
    artDesign: "fully reborn crimson census engine with a readable protected three-counter core, six majestic phoenix requiem fans, nested siege rings, an ivory ember crown and densely layered opaque orange census ribbons"
  },
  {
    id: "oceanic-shared-tide-pump",
    name: "Shared Tide Lifesea Engine",
    rarity: "Omnic",
    price: null,
    theme: "oceanic",
    element: "oceanic",
    buffs: [],
    effect: redesignEffect("oceanic-shared-tide-pump"),
    lore: "A completed tide pump repairs the vessel whose own ward actually bore the pressure.",
    artDesign: "fully reborn sapphire lifesea pump with a readable protected three-chamber heart, six majestic pearl shield fans, nested tide rings, a silver leviathan crown and densely layered opaque blue restoration ribbons"
  },
  {
    id: "atmospheric-storm-clock",
    name: "Tempest Return Chronarch",
    rarity: "Omnic",
    price: null,
    theme: "atmospheric",
    element: "atmospheric",
    buffs: [],
    effect: redesignEffect("atmospheric-storm-clock"),
    lore: "A completed storm clock returns a bounded native pressure reserve without moving the combat clock.",
    artDesign: "fully reborn teal chronarch clock with a readable protected escapement, six majestic turbine feather fans, nested ivory timing rings, a tempest crown and densely layered opaque wind and electric zigzag ribbons"
  },
  {
    id: "botanic-graft-covenant",
    name: "Worldroot Graft Coronation",
    rarity: "Omnic",
    price: null,
    theme: "botanic",
    element: "botanic",
    buffs: [],
    effect: redesignEffect("botanic-graft-covenant"),
    lore: "The completed graft engine translates a spent native restoration reserve into one protective covenant.",
    artDesign: "fully reborn emerald graft engine with a readable protected restoration chamber, six majestic articulated root fans, nested covenant rings, an ivory petal crown and densely layered jade protective ribbons across gray stone braces"
  },
  {
    id: "tranquilitic-accord-bastion",
    name: "Accord Seraph Sanctuary",
    rarity: "Omnic",
    price: null,
    theme: "tranquilitic",
    element: "tranquilitic",
    buffs: [],
    effect: redesignEffect("tranquilitic-accord-bastion"),
    lore: "A completed accord bastion binds real support to one bounded protective witness.",
    artDesign: "fully reborn ivory accord bastion with a readable protected sanctuary lock, six majestic seraph fortress fans, nested pearl covenant rings, a turquoise peace crown and densely layered opaque sanctuary ribbons"
  },
  {
    id: "chaotic-fault-verdict",
    name: "Rosefault Precision Sovereign",
    rarity: "Omnic",
    price: null,
    theme: "chaotic",
    element: "chaotic",
    buffs: [],
    effect: redesignEffect("chaotic-fault-verdict"),
    lore: "The completed fault selector distinguishes a genuinely spent Rose reserve from an unearned echo.",
    artDesign: "fully reborn obsidian rosefault selector with a readable protected forked prism, six majestic crimson thorn fans, nested violet precision rings, a fractured rose crown and densely layered opaque crimson and amethyst fault ribbons"
  }
];
var convertedKitConduitIds = new Set(kitConduitDesigns.map((entry) => entry.id));

// src/content/world-lore.ts
var machineOrigin = "The Machines are destroyed prototypes from the time Let and Rise worked together. Their damaged mechanisms still awaken amid the ruins of that collaboration; they are not Elemental-Devourers created by Rise.";
var conduitOrigin = "A Conduit is a surviving mechanism from the age of Let and Rise's collaboration, salvaged and restored for the present search. Elemental Light is the name used for the elemental energy within these devices, not a third creator or a recovered creator's soul.";
var masterOrigin = "Master Conduits are restored mechanisms from Let and Rise's shared prototype work, attuned to a named Element-Bearer. Their power supports that bearer's search for Let's soul; owning one does not recover the soul or decide the contest.";

// src/content/calamitic-conduits.ts
var calamiticTokenPrice = 100;
var calamiticLockMessage = "Rise deems you UNWORTHY of her most prized creations.";
function calamiticStoreUnlocked(account) {
  return !!account && Object.values(account.calamityClears ?? {}).some((tier) => tier !== void 0 && tier >= 1);
}
var calamiticPower = redesignValue;
var calamiticConduits = [
  {
    id: "calamitic-world-eater-orrery",
    name: "World-Eater's Orrery",
    lore: "Rise suspended an annihilation furnace inside counter-rotating planetary rings. Every wound suffered by its bearers winds the machinery toward a single, deliberate ending."
  },
  {
    id: "calamitic-causality-funeral-engine",
    name: "Causality Funeral Engine",
    lore: "Paired black-metal vaults bind the interval between impact and consequence. Rise built them to postpone destruction until her chosen moment, never to forgive it."
  },
  {
    id: "calamitic-horizon-cleaving-godpress",
    name: "Horizon-Cleaving Godpress",
    lore: "Opposing white-metal jaws close around an impossible horizon. Rise designed its crimson rails to press through barriers without mistaking protection for invulnerability."
  },
  {
    id: "calamitic-throne-borrowed-tomorrows",
    name: "Throne of Borrowed Tomorrows",
    lore: "An empty command throne controls a canopy of interlocking timeworks. Rise could order its machinery to consume tomorrow before today had ended."
  },
  {
    id: "calamitic-cathedral-final-equation",
    name: "Cathedral of the Final Equation",
    lore: "Three monumental cipher-engines turn around a captive crimson aperture. Rise built their closing equation to erase whatever she had chosen, not to worship it."
  }
];
function isCalamiticConduitId(id) {
  return calamiticConduits.some((conduit) => conduit.id === id);
}
function calamiticEffect(id, level = 0) {
  const amount = (base, maximum) => Number(calamiticPower(level, base, maximum).toFixed(6));
  switch (id) {
    case "calamitic-world-eater-orrery":
      return `Store ${amount(40, 80)}% of enemy Direct Damage to HP suffered by living squad members. [Normal Attack] releases the reserve as a [Bonus Strike] against the healthiest enemy.`;
    case "calamitic-causality-funeral-engine":
      return `Defer ${amount(40, 60)}% of each enemy hit's Direct Damage to HP after [Shields]. The deferred damage is taken at the start of the next Enemy Turn, ignores [Shields] and can defeat you.`;
    case "calamitic-horizon-cleaving-godpress":
      return `${amount(40, 60)}% of your Attack Actions' Direct Damage bypasses enemy [Shields]. While the target has a [Shield], your Attack Actions also gain +${amount(30, 60)}% Direct Damage.`;
    case "calamitic-throne-borrowed-tomorrows":
      return `Your first [Normal Attack] each player turn does not spend your action and lets you take one additional [Skill 1] or [Skill 2] that turn. Taking it grants ${amount(10, 30)} [Elemental Gauge], but you cannot act on the next player turn.`;
    case "calamitic-cathedral-final-equation":
      return `Use three different action types in succession to complete the [Equation]. Repeating a type restarts the sequence with that action. The third action deals ${amount(120, 240)}% of your Attack as [Bonus Strikes] split equally among enemies, then restarts the sequence.`;
  }
}

// src/content/conduits.ts
var commonConduits = [
  {
    id: "vigil-core",
    name: "Vigil Core",
    rarity: "Common",
    price: 1e3,
    power: "Elemental Light",
    buffs: [{ stat: "health", kind: "percent", amount: 6 }],
    effect: redesignEffect("vigil-core"),
    lore: "An emergency life-support mechanism from Let and Rise's shared prototype work, sealed beneath the battlefields of their later rivalry. Its protected chamber still holds a reserve of elemental energy."
  },
  {
    id: "siegebound-drive",
    name: "Siegebound Drive",
    rarity: "Common",
    price: 1200,
    power: "Mechanical",
    buffs: [],
    effect: redesignEffect("siegebound-drive"),
    lore: "A compact force-transmission engine once hidden inside siege harnesses. Its interlocking gears survived centuries in a buried armory."
  },
  {
    id: "bastion-lock",
    name: "Bastion Lock",
    rarity: "Common",
    price: 1e3,
    power: "Mechanical",
    buffs: [{ stat: "defense", kind: "percent", amount: 10 }],
    effect: redesignEffect("bastion-lock"),
    lore: "A folding ward mechanism recovered from a forgotten defensive vault. Its layered plates were adapted from the creators' shared prototypes into shields for the wars their rivalry provoked."
  },
  {
    id: "parallax-relay",
    name: "Parallax Relay",
    rarity: "Common",
    price: 1500,
    power: "Elemental Light",
    buffs: [],
    effect: redesignEffect("parallax-relay"),
    lore: "A concealed targeting relay with a split crystal lens. A trace of Elemental Light aligns its two sightlines with uncanny precision."
  },
  {
    id: "fracture-reservoir",
    name: "Fracture Reservoir",
    rarity: "Common",
    price: 1200,
    power: "Elemental Light",
    buffs: [{ stat: "shatterCapacity", kind: "flat", amount: 10 }],
    effect: redesignEffect("fracture-reservoir"),
    lore: "A sealed accumulator buried to keep it from the armies drawn into Let and Rise's rivalry. Elemental energy rests within its nested rings, waiting for a new bearer."
  }
];
var additionalCommonConduits = [
  {
    id: "prism-splinter-socket",
    name: "Prism Splinter Socket",
    rarity: "Common",
    price: 1600,
    power: "Elemental Light",
    buffs: [],
    effect: redesignEffect("prism-splinter-socket"),
    lore: "A bronze triangular clamp preserves one split crystal, its paired facets still carrying a trace of Elemental Light."
  },
  {
    id: "precision-escapement",
    name: "Precision Escapement",
    rarity: "Common",
    price: 1800,
    power: "Mechanical",
    buffs: [{ stat: "critMultiplier", kind: "percent", amount: 10 }],
    effect: redesignEffect("precision-escapement"),
    lore: "A compact clock escapement turns an offset sight disc with measured force, preserving the timing of a perfect strike."
  },
  {
    id: "fieldbrace-coupler",
    name: "Fieldbrace Coupler",
    rarity: "Common",
    price: 1400,
    power: "Mechanical",
    buffs: [],
    effect: redesignEffect("fieldbrace-coupler"),
    lore: "Two bronze field braces close around a ceramic cushion, distributing strain across the bearer\u2019s frame."
  },
  {
    id: "reserve-torque-crank",
    name: "Reserve Torque Crank",
    rarity: "Common",
    price: 1500,
    power: "Mechanical",
    buffs: [],
    effect: redesignEffect("reserve-torque-crank"),
    lore: "A folded hand-crank winds a sealed reserve cylinder, trading compact force for a steadier reserve."
  },
  {
    id: "crosspin-governor",
    name: "Crosspin Governor",
    rarity: "Common",
    price: 1500,
    power: "Elemental Light",
    buffs: [],
    effect: redesignEffect("crosspin-governor"),
    lore: "A bronze cross-shaped governor balances two armored counterweights around a stable central pin."
  }
];
var expandedConduits = [
  { id: "twinpulse-bellows", name: "Twinpulse Bellows", rarity: "Rare", buffs: [], effect: redesignEffect("twinpulse-bellows"), lore: "Double silver bellows drive a piston through two measured pulses." },
  { id: "glassroot-gimbal", name: "Glassroot Gimbal", rarity: "Rare", buffs: [], effect: redesignEffect("glassroot-gimbal"), lore: "A spherical silver gimbal suspends a faceted reservoir beside its calibrated sight rings." },
  { id: "lifeline-flywheel", name: "Lifeline Flywheel", rarity: "Rare", buffs: [], effect: redesignEffect("lifeline-flywheel"), lore: "Braided channels feed an open flywheel that holds a measured reserve." },
  { id: "sentinel-aperture", name: "Sentinel Aperture", rarity: "Rare", buffs: [], effect: redesignEffect("sentinel-aperture"), lore: "A shutter iris sits within an armored silver disc, opening only along a precise line." },
  { id: "wardglass-transformer", name: "Wardglass Transformer", rarity: "Rare", buffs: [], effect: redesignEffect("wardglass-transformer"), lore: "Two crystal-insulated towers channel elemental pressure through stepped silver plates." },
  { id: "hammerbalance-link", name: "Hammerbalance Link", rarity: "Rare", buffs: [{ stat: "damage", kind: "percent", amount: 12 }, { stat: "defense", kind: "percent", amount: -4 }], effect: redesignEffect("hammerbalance-link"), lore: "A hinged counterweight beam steadies a central impact joint." },
  { id: "breach-pendulum", name: "Breach Pendulum", rarity: "Rare", buffs: [], effect: redesignEffect("breach-pendulum"), lore: "A silver pendulum blade swings inside an open fork frame." },
  { id: "coilfeed-ratchet", name: "Coilfeed Ratchet", rarity: "Rare", buffs: [], effect: redesignEffect("coilfeed-ratchet"), lore: "A toothed silver ratchet feeds a coiled accumulator in measured increments." },
  { id: "opal-indexer", name: "Opal Indexer", rarity: "Rare", buffs: [], effect: redesignEffect("opal-indexer"), lore: "Five inset opal lenses mark positions on a finely balanced silver indexing wheel." },
  { id: "resonance-crucible", name: "Resonance Crucible", rarity: "Rare", buffs: [], effect: redesignEffect("resonance-crucible"), lore: "A crystal bridge joins two silver chambers, holding elemental resonance under pressure." },
  { id: "siege-cantilever", name: "Siege Cantilever", rarity: "Legendary", buffs: [], effect: redesignEffect("siege-cantilever"), lore: "An ivory siege arm projects from a narrow platinum pivot, sacrificing armor for reach." },
  { id: "nullsong-transmission", name: "Nullsong Transmission", rarity: "Legendary", buffs: [], effect: redesignEffect("nullsong-transmission"), lore: "A platinum gear train turns inside silent crystal baffles, redirecting power from elemental channels." },
  { id: "horizon-heartcase", name: "Horizon Heartcase", rarity: "Legendary", buffs: [], effect: redesignEffect("horizon-heartcase"), lore: "A white radial life chamber opens broad reserve vanes while its ward plates retract." },
  { id: "stasis-reliquary", name: "Stasis Reliquary", rarity: "Legendary", buffs: [], effect: redesignEffect("stasis-reliquary"), lore: "A platinum preservation capsule protects its reserve behind locked targeting rings." },
  { id: "granite-hourglass", name: "Granite Hourglass", rarity: "Legendary", buffs: [], effect: redesignEffect("granite-hourglass"), lore: "Twin armored cones throttle the drive between them to reinforce a dense shell." },
  { id: "pale-bulwark-diadem", name: "Pale Bulwark Diadem", rarity: "Legendary", buffs: [], effect: redesignEffect("pale-bulwark-diadem"), lore: "A crown-shaped fortress lattice folds inward around a narrow reserve core." },
  { id: "starvein-conductor", name: "Starvein Conductor", rarity: "Legendary", buffs: [], effect: redesignEffect("starvein-conductor"), lore: "White conductor branches carry a bright current around a deliberately drained life vessel." },
  { id: "meridian-inverter", name: "Meridian Inverter", rarity: "Legendary", buffs: [], effect: redesignEffect("meridian-inverter"), lore: "A platinum reversing prism displaces its precision lenses to redirect elemental force." },
  { id: "execution-orrery", name: "Execution Orrery", rarity: "Legendary", buffs: [], effect: redesignEffect("execution-orrery"), lore: "An asymmetric celestial orrery folds its armor outward to align a decisive strike." },
  { id: "verdict-caliper", name: "Verdict Caliper", rarity: "Legendary", buffs: [], effect: redesignEffect("verdict-caliper"), lore: "White precision jaws hold a throttled elemental core at an exact point." }
];
var recoveredConduits = [
  { id: "duplex-heart", name: "Duplex Heart", rarity: "Rare", buffs: [], effect: redesignEffect("duplex-heart"), lore: "Twin silver chambers restore a broken machine\u2019s life-support and armor lattice." },
  { id: "spearwheel-engine", name: "Spearwheel Engine", rarity: "Rare", buffs: [], effect: redesignEffect("spearwheel-engine"), lore: "Interlocked silver flywheels translate elemental pressure into striking force." },
  { id: "falcon-sight", name: "Falcon Sight", rarity: "Rare", buffs: [], effect: redesignEffect("falcon-sight"), lore: "A split-wing targeting lens rejoins two forgotten sightlines." },
  { id: "aegis-capacitor", name: "Aegis Capacitor", rarity: "Rare", buffs: [], effect: redesignEffect("aegis-capacitor"), lore: "Silver ward plates protect a restored ring accumulator." },
  { id: "springwell-pump", name: "Springwell Pump", rarity: "Rare", buffs: [], effect: redesignEffect("springwell-pump"), lore: "Two balanced impellers carry Elemental Light through a sealed silver vessel." },
  { id: "worldbreaker-drive", name: "Worldbreaker Drive", rarity: "Legendary", buffs: [{ stat: "health", kind: "percent", amount: -6 }], effect: redesignEffect("worldbreaker-drive"), lore: "An ivory siege crown diverts its life-support reserve into a tremendous striking engine." },
  { id: "immortal-vessel", name: "Immortal Vessel", rarity: "Legendary", buffs: [{ stat: "health", kind: "percent", amount: 25 }, { stat: "damage", kind: "percent", amount: -6 }], effect: redesignEffect("immortal-vessel"), lore: "Platinum sanctuary chambers preserve their bearer by slowing the force-transmission drive." },
  { id: "citadel-spine", name: "Citadel Spine", rarity: "Legendary", buffs: [{ stat: "defense", kind: "percent", amount: 25 }, { stat: "crit", kind: "percentage-points", amount: -6 }], effect: redesignEffect("citadel-spine"), lore: "An articulated white fortress folds around its core, closing its targeting slits for armor." },
  { id: "astral-prism", name: "Astral Prism", rarity: "Legendary", buffs: [{ stat: "crit", kind: "percentage-points", amount: 20 }, { stat: "defense", kind: "percent", amount: -6 }], effect: redesignEffect("astral-prism"), lore: "A platinum prism unfolds its protective plates into an extraordinary precision focus." },
  { id: "judgment-lens", name: "Judgment Lens", rarity: "Legendary", buffs: [], effect: redesignEffect("judgment-lens"), lore: "Nested ivory lenses magnify a perfect strike at the expense of their bearer\u2019s reserve." }
];
var omnicConduits = [
  { id: "infernic-phoenix-reactor", name: "Phoenix Reactor", element: "infernic", effect: redesignEffect("infernic-phoenix-reactor"), buffs: [] },
  { id: "aquatic-leviathan-pump", name: "Leviathan Pump", element: "oceanic", effect: redesignEffect("aquatic-leviathan-pump"), buffs: [] },
  { id: "tectonic-atlas-bastion", name: "Atlas Bastion", element: "botanic", effect: redesignEffect("tectonic-atlas-bastion"), buffs: [] },
  { id: "efflorescent-worldtree-heart", name: "Worldtree Heart", element: "botanic", effect: redesignEffect("efflorescent-worldtree-heart"), buffs: [] },
  { id: "voltaic-thunderbird-coil", name: "Thunderbird Coil", element: "atmospheric", effect: redesignEffect("voltaic-thunderbird-coil"), buffs: [] },
  { id: "atmospheric-griffin-turbine", name: "Griffin Turbine", element: "atmospheric", effect: redesignEffect("atmospheric-griffin-turbine"), buffs: [] },
  { id: "luminous-seraph-mirror", name: "Seraph Mirror", element: "tranquilitic", effect: redesignEffect("luminous-seraph-mirror"), buffs: [] },
  { id: "ominous-eclipse-mantle", name: "Eclipse Mantle", element: "chaotic", effect: redesignEffect("ominous-eclipse-mantle"), buffs: [] },
  { id: "tranquilitic-kirin-cradle", name: "Kirin Cradle", element: "tranquilitic", effect: redesignEffect("tranquilitic-kirin-cradle"), buffs: [] },
  { id: "chaotic-ouroboros-core", name: "Ouroboros Core", element: "chaotic", effect: redesignEffect("chaotic-ouroboros-core"), buffs: [] },
  { id: "infernic-cinder-testament", name: "Cinder Testament", element: "infernic", effect: redesignEffect("infernic-cinder-testament"), buffs: [] },
  { id: "aquatic-undertide-chronometer", name: "Undertide Chronometer", element: "oceanic", effect: redesignEffect("aquatic-undertide-chronometer"), buffs: [] },
  { id: "tectonic-faultkeeper-loom", name: "Faultkeeper Loom", element: "botanic", effect: redesignEffect("tectonic-faultkeeper-loom"), buffs: [] },
  { id: "efflorescent-verdant-covenant", name: "Verdant Covenant", element: "botanic", effect: redesignEffect("efflorescent-verdant-covenant"), buffs: [] },
  { id: "voltaic-stormstep-dynamo", name: "Stormstep Dynamo", element: "atmospheric", effect: redesignEffect("voltaic-stormstep-dynamo"), buffs: [] },
  { id: "atmospheric-skythread-rudder", name: "Skythread Rudder", element: "atmospheric", effect: redesignEffect("atmospheric-skythread-rudder"), buffs: [] },
  { id: "luminous-dawn-witness-array", name: "Dawn Witness Array", element: "tranquilitic", effect: redesignEffect("luminous-dawn-witness-array"), buffs: [] },
  { id: "ominous-nightglass-archive", name: "Nightglass Archive", element: "chaotic", effect: redesignEffect("ominous-nightglass-archive"), buffs: [] },
  { id: "tranquilitic-stillhour-carillon", name: "Stillhour Carillon", element: "tranquilitic", effect: redesignEffect("tranquilitic-stillhour-carillon"), buffs: [] },
  { id: "chaotic-paradox-spindle", name: "Paradox Spindle", element: "chaotic", effect: redesignEffect("chaotic-paradox-spindle"), buffs: [] }
];
var conduits = [
  ...commonConduits.map((entry) => ({ ...entry, art: entry.id, element: null, mechanic: null })),
  ...additionalCommonConduits.map((entry) => ({ ...entry, art: entry.id, element: null, mechanic: null })),
  ...recoveredConduits.map((entry) => ({ ...entry, price: null, power: "Elemental Light", art: entry.id, element: null, mechanic: null })),
  ...expandedConduits.map((entry) => ({ ...entry, price: null, power: "Elemental Light", art: entry.id, element: null, mechanic: null })),
  ...omnicConduits.slice(0, 10).map((entry) => ({
    ...entry,
    rarity: "Omnic",
    price: null,
    power: "Elemental Light",
    art: entry.id,
    lore: "A fully restored elemental masterpiece recovered from one of Let and Rise's destroyed machine prototypes."
  })),
  ...omnicConduits.slice(10).map((entry) => ({
    ...entry,
    rarity: "Omnic",
    price: null,
    power: "Elemental Light",
    art: entry.id,
    lore: "A prismatic elemental masterpiece restored from the mechanisms left behind when Let and Rise's collaboration ended."
  })),
  ...kitConduitDesigns.map((entry) => ({ ...entry, power: "Elemental Light", art: entry.id })),
  ...calamiticConduits.map((entry) => ({
    ...entry,
    rarity: "Calamitic",
    price: null,
    power: "Rise's annihilation machinery",
    art: entry.id,
    element: null,
    mechanic: null,
    buffs: [],
    effect: calamiticEffect(entry.id)
  }))
].map((entry) => ({
  ...entry,
  mechanic: null,
  lore: isCalamiticConduitId(entry.id) ? entry.lore : `${conduitOrigin} ${entry.lore}`
}));
var conduitUpgradeCap = 5;
var conduitUpgradeCosts = [25, 50, 100, 175, 250];
var conduitUpgradeRarityMultipliers = { Common: 1, Rare: 2, Legendary: 4, Omnic: 200, Calamitic: 400 };
function validateConduitUpgradeLevel(value2) {
  if (typeof value2 !== "number" || !Number.isInteger(value2) || value2 < 0 || value2 > conduitUpgradeCap) {
    throw new Error("Conduit upgrade level must be an integer from 0 to 5.");
  }
  return value2;
}
function validateConduitUpgrades(value2) {
  if (typeof value2 !== "object" || value2 === null || Array.isArray(value2)) throw new Error("Invalid saved Conduit upgrades.");
  const result = {};
  for (const [id, level] of Object.entries(value2)) {
    if (!isConduitId(id)) throw new Error("Unknown upgraded Conduit.");
    result[id] = validateConduitUpgradeLevel(level);
  }
  return result;
}
function conduitUpgradeCost(conduit, level) {
  validateConduitUpgradeLevel(level);
  const cost = conduitUpgradeCosts[level];
  return cost === void 0 ? null : cost * conduitUpgradeRarityMultipliers[conduit.rarity];
}
var conduitSlotCount = 8;
function validateConduitSlots(value2) {
  if (!Array.isArray(value2) || value2.length !== conduitSlotCount || !value2.every((id) => id === null || isConduitId(id))) throw new Error("Invalid Conduit slots.");
  const ids = value2.filter((id) => id !== null);
  if (new Set(ids).size !== ids.length) throw new Error("Each named Conduit can be equipped only once per character.");
  if (ids.filter((id) => getConduit(id).rarity === "Omnic").length > 4) throw new Error("Equip at most four Omnic Conduits per character.");
  return [...value2];
}
function normalizeLegacyKitSlots(value2, element) {
  if (!Array.isArray(value2) || value2.length !== conduitSlotCount || !value2.every((id) => id === null || isConduitId(id))) {
    throw new Error("Invalid Conduit slots.");
  }
  const ids = value2.filter((id) => id !== null);
  if (new Set(ids).size !== ids.length) throw new Error("Each named Conduit can be equipped only once per character.");
  const originalSlots = value2.map((id) => id !== null && convertedKitConduitIds.has(id) ? null : id);
  validateConduitElement(originalSlots, element);
  let capacity = 4 - originalSlots.filter((id) => id !== null && getConduit(id).rarity === "Omnic").length;
  const normalized = value2.map((id) => {
    if (id === null || !convertedKitConduitIds.has(id)) return id;
    if (getConduit(id).element !== element || capacity <= 0) return null;
    capacity--;
    return id;
  });
  return validateConduitSlots(normalized);
}
function validateConduitElement(equipment, element) {
  for (const id of validateConduitSlots(equipment)) {
    const conduit = id === null ? null : getConduit(id);
    if (conduit?.element && conduit.element !== element) throw new Error(`${conduit.name} requires a ${conduit.element} character.`);
  }
}
function conduitBuffs(conduit, level = 0) {
  validateConduitUpgradeLevel(level);
  return conduit.buffs.map((buff) => ({ ...buff, amount: buff.amount * (1 + 0.5 * level) }));
}
function isConduitId(value2) {
  return conduits.some((conduit) => conduit.id === value2);
}
function getConduit(id) {
  const conduit = conduits.find((entry) => entry.id === id);
  if (!conduit) throw new Error(`Unknown Conduit: ${id}.`);
  return conduit;
}

// src/content/mechanical-components.ts
var mechanicalComponents = {
  id: "mechanical-components",
  name: "Broken Mechanical Components",
  art: null,
  firstChance: 1,
  finalChance: 1,
  firstQuantity: 3,
  finalQuantity: 125
};
function machineComponentDrop(stage) {
  validateMachineStage(stage);
  const progress = (stage - 1) / (infusionStageCount("machines") - 1);
  const quantity = Math.round(mechanicalComponents.firstQuantity + (mechanicalComponents.finalQuantity - mechanicalComponents.firstQuantity) * progress) * bossLootMultiplier({ infusion: { mode: "machines", stage } });
  return {
    id: mechanicalComponents.id,
    minimum: quantity,
    maximum: quantity,
    chance: mechanicalComponents.firstChance + (mechanicalComponents.finalChance - mechanicalComponents.firstChance) * progress,
    note: "Guaranteed per defeated machine; the final boss multiplies the base stage quantity by 5. Used only for Conduit upgrades."
  };
}
var machineComponentRulesText = `Every Machine drops Broken Mechanical Components: ${mechanicalComponents.firstQuantity} at stage 1, rising to ${mechanicalComponents.finalQuantity} at stage ${infusionStageCount("machines")}; the final boss drops ${mechanicalComponents.finalQuantity * 5}.`;
function rollMachineComponents(stage, random) {
  const drop = machineComponentDrop(stage);
  return lootRoll(random) < drop.chance ? drop.minimum : 0;
}

// src/content/master-conduits.ts
var masterChest = {
  id: "grand-master-chest",
  name: "Cosmic Grand Master Chest",
  chance: 0.01,
  stage: machineStageCount,
  art: "master-conduits/grand-master-chest.png",
  description: "Choose one unowned Master Conduit for any Element-Bearer. Opens once; does not equip the reward."
};
var masterRulesText = `The stage ${machineStageCount} final boss has a 1% chance to drop a Cosmic Grand Master Chest; each Calamity EX+Omnipotent chest holds two. Open one in Inventory to choose an unowned Omnic Master, even for an Element-Bearer you don't own yet. A Master equips only to its named Element-Bearer, in its own slot, and cannot be upgraded. Chests stay unopened once you own all 48.`;
function master(character, slot, name, design) {
  return {
    id: `master-${character}-${slot}`,
    character,
    name,
    rarity: "Omnic",
    art: `master-conduits/master-${character}-${slot}.png`,
    effect: redesignEffect(`master-${character}-${slot}`),
    design,
    lore: masterOrigin
  };
}
var masterConduits = [
  master(
    "ember",
    1,
    "Helios Pyre Cathedral",
    "A furnace cathedral around a crimson miniature sun, twelve greatsword-shaped exhaust wings, stacked gold flame shutters and volcanic orbital rails"
  ),
  master(
    "ember",
    2,
    "Cinderstar Genesis Engine",
    "A split stellar ignition engine, three molten planet chambers, counter-rotating sword-tooth halos and branching crimson ignition conduits"
  ),
  master(
    "ember",
    3,
    "Unbroken Sunforge Throne",
    "A bronze-and-crimson sunforge throne machine, greatsword anvil at its heart, armored flare crowns and six immense mechanical flame fans"
  ),
  master(
    "tide",
    1,
    "Abyssal Shelter Observatory",
    "A sapphire pressure observatory, spear-shaped lighthouse spindle, nested diving-bell shields and immense tidal astrolabe fins"
  ),
  master(
    "tide",
    2,
    "Ocean Memory Worldpump",
    "A world-sized tide pump enclosing three ocean planets, sapphire manifold crown, twelve spearhead vanes and interlocked platinum sea rings"
  ),
  master(
    "tide",
    3,
    "Undertow Sovereign Harpoon",
    "A monumental spear-tip targeting engine, abyssal sapphire prisms, concentric current locks and six armored harpoon-wing arcs"
  ),
  master(
    "sprout",
    1,
    "Worldseed Mercy Foundry",
    "An emerald seed foundry with ivory bow-limb gantries, twelve leaf-blade mechanical wings and a densely interwoven root orrery"
  ),
  master(
    "sprout",
    2,
    "Briar Constellation Loom",
    "A cosmic bowstring loom with three emerald seed planets, intertwined root escapements and vast ivory thorn-constellation fans"
  ),
  master(
    "sprout",
    3,
    "Evergreen Continuance Crucible",
    "A sealed living-world crucible, emerald germination heart, ivory petal armor and six gigantic bow-branch sanctuary wings; no resurrection imagery"
  ),
  master(
    "atmoso",
    1,
    "Sky Without End Turbine",
    "A turquoise sky-axis turbine, wind-staff core, twelve spiraling blade wings and immense counter-sweeping cyclone crowns"
  ),
  master(
    "atmoso",
    2,
    "Horizon Cyclone Orrery",
    "Three turquoise storm planets inside a staff-shaped horizon orrery, ivory turbine ramparts and layered compass-wing vaults"
  ),
  master(
    "atmoso",
    3,
    "Crosswind Imperial Drive",
    "An imperial crosswind staff-drive with crossed turquoise pressure corridors, ivory gale armor and six monumental scythe-shaped wind wings"
  ),
  master(
    "aurora",
    1,
    "Final Dawn Tribunal",
    "An ivory solar tribunal mechanism, amber judgment lens, twelve lens-wing arches and descending platinum verdict locks"
  ),
  master(
    "aurora",
    2,
    "Prismseal Astral Judiciary",
    "Three amber lens planets in an ivory judiciary orrery, interlocking seal plates and vast empty-hand casting aperture wings"
  ),
  master(
    "aurora",
    3,
    "Merciful Eclipse Regulator",
    "A white eclipse regulator surrounding an amber sun lens, twelve protective shutter petals and immense tiered celestial court rails"
  ),
  master(
    "bliss",
    1,
    "Thousandfeather Zenith Loom",
    "An ivory-and-rose feather loom, two immense mechanical warfan assemblies, platinum quill wings and densely nested celestial ribbon gears"
  ),
  master(
    "bliss",
    2,
    "Stillplume Planetary Ballet",
    "Three rose opal planets dancing inside paired ivory fan rotors, counterbalanced feather crowns and platinum orbital ribbons"
  ),
  master(
    "bliss",
    3,
    "Quiet Heaven Fanforge",
    "A double-fan heaven forge, ivory-and-rose central feather heart, twelve platinum quill mandalas and monumental quiet-wing armor"
  ),
  master(
    "bruno",
    1,
    "Living Worldwall Atlas",
    "A basalt-and-bronze atlas machine supporting a faceted ochre world, hammer-shaped axial pillar and twelve titanic faultplate wings"
  ),
  master(
    "bruno",
    2,
    "Quarry Planet Gravitas",
    "Three basalt quarry planets locked in bronze gravitic hammer cages, immense layered bedrock buttresses and ochre orbiting armor rails"
  ),
  master(
    "bruno",
    3,
    "Worldforge Hammer Dominion",
    "A bronze hammer-dominion engine, basalt shelter vaults, ochre crystal pistons and six massive mechanically linked mountain-wing plates"
  ),
  master(
    "disciple",
    1,
    "Unbound Mindcrown Synapse",
    "An amethyst synapse crown engine, scarlet mindflame channels, twelve open-palm-shaped mechanical arches and linked psychic orbital frames"
  ),
  master(
    "disciple",
    2,
    "Concord Planet Thoughtforge",
    "Three amethyst thought planets in scarlet-linked open orbital cages, empty-hand mindcrown apertures and monumental psychic lattice wings"
  ),
  master(
    "disciple",
    3,
    "Sovereign Will Amplifier",
    "A black-amethyst will amplifier with scarlet triple-tier crown rings, huge open psychic handframes and twelve ornate inward-linked flame vanes"
  ),
  master(
    "elise",
    1,
    "Infinite Thunderwheel Arsenal",
    "Exactly two four-point shuriken-shaped thunderwheel rotors with open central grips, yellow-green voltage rails and twelve platinum lightning wings"
  ),
  master(
    "elise",
    2,
    "Twin Star Planetary Ratchet",
    "Three voltage planets held between two four-point star ratchets, yellow-green branching circuitry and huge platinum circuit-crown blades"
  ),
  master(
    "elise",
    3,
    "Storm Empress Execution Clock",
    "A double-shuriken execution clock, segmented yellow-green circuit armor, twelve angular stormblade fans and layered four-point chronometer rails"
  ),
  master(
    "razor",
    1,
    "Unbroken Midnight Bastion",
    "An obsidian midnight bastion engine enclosing one night-sword spindle, violet crescent shield wings and enormous layered eclipse ramparts"
  ),
  master(
    "razor",
    2,
    "Eclipse Planet Watchtower",
    "Three violet eclipse planets behind obsidian tower-shield cages, one night-sword axis and twelve monumental crescent watchtower wings"
  ),
  master(
    "razor",
    3,
    "Nightglass Counterblade Engine",
    "An obsidian counterblade engine, violet nightglass gem chambers, sword-hilt locking clasps and immense double-crescent shield architecture"
  ),
  master(
    "rosetta",
    1,
    "Rose Beyond the Sun Orrery",
    "A rose-gold solar bow orrery with crimson petal gears, ivory wing vaults and twelve enormous gilded thorn-mandala arches"
  ),
  master(
    "rosetta",
    2,
    "Virtuous Planet Rosegarden",
    "Three rose planets in rose-gold garden cages, ivory bow-limb orbit rails and densely layered crimson petal cathedral wings"
  ),
  master(
    "rosetta",
    3,
    "Golden Thorn Judgment Loom",
    "A golden thorn targeting loom with one central rose-bow aperture, crimson rose mandalas, ivory prism petals and twelve sweeping thorn-wing rails"
  ),
  master(
    "thornia",
    1,
    "Forbidden Garden Worldlock",
    "A rose-gold forbidden worldlock, violet eclipse cage, crimson thorn greatsword axis and twelve immense gilded rose-shield fans"
  ),
  master(
    "thornia",
    2,
    "Thousand-Rose Planetary Aegis",
    "Three crimson rose planets nested in golden aegis cages, violet thorn eclipse rails and massive interwoven rose-armored greatsword wings"
  ),
  master(
    "thornia",
    3,
    "Shadow Rose Sovereign Foundry",
    "A violet-and-rose-gold shadow foundry, crimson thorn blade crucible, six immense rose-wing forge arches and dense golden petal countergears"
  ),
  master(
    "crinso",
    1,
    "Twin-Rose Singularity Drive",
    "A rose-gold singularity drive around one connected double-ended blade axle, golden flame and crimson lightning halves with twelve thorn wings"
  ),
  master(
    "crinso",
    2,
    "Duality Planet Flamewheel",
    "Three crimson-gold planets inside one connected dual-edged sword wheel, nested rose hubs, opposed flame rails and lightning petal armor"
  ),
  master(
    "crinso",
    3,
    "Crimson Beauty Pyre Requiem",
    "A golden-crimson pyre requiem engine with a connected double-ended sword core, twelve rose lightning wings and ornate flame-petal crowns"
  ),
  master(
    "nerithe",
    1,
    "Shoreless Meridian Worldchart",
    "A turquoise worldchart engine, surveyor-trident spindle, twelve ocean compass wings and immense folded meridian astrolabe rails"
  ),
  master(
    "nerithe",
    2,
    "Folded Ocean Planetarium",
    "Three turquoise ocean planets in folded ivory meridian cages, surveyor trident locking prongs and huge layered sea-map wings"
  ),
  master(
    "nerithe",
    3,
    "Abyssal Surveyor Crown",
    "A turquoise abyssal crown surveyor, trident-shaped rangefinding lens, ivory ocean ramparts and twelve royal compass-blade wings"
  ),
  master(
    "orvella",
    1,
    "Throne Beneath the World",
    "An ivory-and-ochre planetary foundation throne, crystal-mace cornerstone, twelve monumental stone armor wings and immense bronze support arches"
  ),
  master(
    "orvella",
    2,
    "Deep Foundation Planetpress",
    "Three ochre foundation planets braced by bronze masonry press rings, crystal-mace piston and ivory world-bearing buttress wings"
  ),
  master(
    "orvella",
    3,
    "Keystone Sovereign Counterweight",
    "An ochre keystone counterweight engine with crystal mace fulcrum, bronze celestial load rails and twelve ivory citadel shield wings"
  ),
  master(
    "vaelor",
    1,
    "Final Chord Celestial Resonator",
    "A gold-and-black celestial resonator, resonance-blade tuning core, twelve immense thunder choir wings and branching frequency crown rails"
  ),
  master(
    "vaelor",
    2,
    "Thunder Choir Planetary Fugue",
    "Three gold thunder planets in black conducting cages, resonance-blade axis and vast branching voltage organ-wing architecture"
  ),
  master(
    "vaelor",
    3,
    "Broken Sky Imperial Metronome",
    "A black-and-gold sky metronome with resonance-blade pendulum, twelve thunder-frequency wings and enormous nested conductor halos"
  )
];
function isMasterConduitId(value2) {
  return masterConduits.some((entry) => entry.id === value2);
}
function getMasterConduit(id) {
  const entry = masterConduits.find((entry2) => entry2.id === id);
  if (!entry) throw new Error("Unknown Master Conduit.");
  return entry;
}
function validateMasterCharacter(id, character) {
  if (getMasterConduit(id).character !== character) throw new Error("This Master Conduit requires its named Element-Bearer.");
}
function masterChestDrops(stage, boss, random) {
  return stage === masterChest.stage && boss && lootRoll(random) < masterChest.chance ? 1 : 0;
}

// src/content/machines.ts
var machineRules = { stages: infusionStageCount("machines"), omnicStage: 1 + Math.round(74 * (infusionStageCount("machines") - 1) / 99), rareChance: 0.08, legendaryChance: 0.035, omnicChance: 0.01, bannerBonusChance: 5e-3 };
var machinePools = {
  Rare: conduits.filter((conduit) => conduit.rarity === "Rare"),
  Legendary: conduits.filter((conduit) => conduit.rarity === "Legendary"),
  Omnic: conduits.filter((conduit) => conduit.rarity === "Omnic")
};
var bannerConduitIds = ["worldbreaker-drive", "immortal-vessel", "citadel-spine", "astral-prism", "judgment-lens"];
var bannerPool = conduits.filter((conduit) => bannerConduitIds.some((id) => conduit.id === id));
var machineEnemies = [
  { name: "Fractured Watcher", art: "fractured-watcher", element: "botanic", skill: "Broken Array", theme: "black-and-white cracked spherical sentry with three crooked legs and fractured sensor petals" },
  { name: "Ashwing Harrier", art: "ashwing-harrier", element: "atmospheric", skill: "Rustwind Sweep", theme: "black-and-white mechanical griffin, silver repaired feathers and unfolding turbine wings" },
  { name: "Ivory Kirin", art: "ivory-kirin", element: "tranquilitic", skill: "Merciful Circuit", theme: "ivory mechanical kirin, silver antlers, opal joints and first wing vanes" },
  { name: "Celestial Leviathan", art: "celestial-leviathan", element: "oceanic", skill: "Tidal Reboot", theme: "compact sapphire-and-ivory mechanical leviathan, four fin wings and interlocking tide rings" },
  { name: "Crowned Phoenix", art: "crowned-phoenix", element: "infernic", skill: "Sunforge Rebirth", theme: "crimson-and-ivory mechanized phoenix, eight magnificent blade-feather wings and platinum crown" },
  { name: "Ouroboros of the First Dawn", art: "ouroboros-first-dawn", element: "chaotic", skill: "Genesis Overdrive", theme: "compact opal-and-ivory mechanized celestial dragon coiled around a restored core, sixteen magnificent vaned wings and prismatic regalia" }
];
function machineConduitLoot(stage, owned = {}) {
  validateMachineStage(stage);
  return ["Rare", "Legendary", "Omnic"].filter((rarity) => rarity !== "Omnic" || stage >= machineRules.omnicStage).flatMap((rarity) => {
    const pool = machinePools[rarity];
    const remaining = pool.filter((conduit) => !(owned[conduit.id] ?? 0)).length;
    const chance = rarity === "Rare" ? machineRules.rareChance : rarity === "Legendary" ? machineRules.legendaryChance : machineRules.omnicChance;
    return pool.map((conduit) => ({
      id: conduit.id,
      minimum: 1,
      maximum: 1,
      chance: (owned[conduit.id] ?? 0) > 0 || !remaining ? 0 : chance / remaining,
      note: `Independent ${rarity} tier roll, then equal choice among unowned Conduits in that tier. Owned names have 0% chance; a complete tier awards no Conduit or replacement. Bosses use the same odds.`
    }));
  });
}
function rollTier(pool, chance, random) {
  if (lootRoll(random) >= chance) return void 0;
  const choice = lootRoll(random);
  return pool.length ? pool[Math.floor(choice * pool.length)].id : void 0;
}
function machineConduitDrops(stage, random, owned = {}) {
  validateMachineStage(stage);
  const drops = {};
  for (const [pool, chance] of [
    [machinePools.Rare, machineRules.rareChance],
    [machinePools.Legendary, machineRules.legendaryChance],
    [machinePools.Omnic, stage >= machineRules.omnicStage ? machineRules.omnicChance : 0]
  ]) {
    if (!chance) continue;
    const id = rollTier(pool.filter((conduit) => !(owned[conduit.id] ?? 0)), chance, random);
    if (id) drops[id] = 1;
  }
  return drops;
}
function bannerConduitBonus(random) {
  return rollTier(bannerPool, machineRules.bannerBonusChance, random);
}
var machineRulesText = `<p>${machineOrigin}</p>
  <p>${machineRules.stages} stages, Lv.10-120, a boss every fifth stage. Each enemy drops Prismatica and can drop an unowned Conduit: Rare 8%, Legendary 3.5%, Omnic 1% from stage ${machineRules.omnicStage}.</p>
  <p>Each rarity rolls separately; names within it are equally likely (${machinePools.Rare.length} Rare, ${machinePools.Legendary.length} Legendary, ${machinePools.Omnic.length} Omnic). A fully owned rarity drops nothing. Common Conduits are sold in the Store.</p>
  <p>${machineComponentRulesText} No captures, evolution materials or Null-Prismatica.</p>
  <p>One copy unlocks a Conduit for every Element-Bearer; components upgrade it to +5. Each Element-Bearer has eight slots, up to four matching-element Omnic.</p>
  <p>${masterRulesText}</p>`;

// src/content/flagships.ts
var flagshipCharacters = [
  {
    id: "atmoso",
    stars: 5,
    name: "Atmoso",
    role: "Attacker",
    art: "atmoso",
    title: "Calm charts a road through the broken sky",
    element: "Atmospheric",
    elementId: "atmospheric",
    weapon: "Wind staff",
    color: "#79d6cc",
    description: "An Atmospheric Element-Bearer shaped in Let\u2019s image, Atmoso uses a crystal-tipped wind staff to turn Calm into open roads.",
    lore: {
      origin: "The high roads and mountain settlements of Sky-bound Rift",
      story: "Atmoso once carried messages between Sky-bound Rift\u2019s mountain settlements with a weathered staff and an unusually patient ear. Atmospheric reflects Calm: he waits for each voice in the wind rather than forcing the gale to answer. Let created Element-Bearers in his image, while Rise created Elemental-Devourers in hers and broke convention to steal the same elements. Both factions seek their creators\u2019 souls; neither has been reunited or crowned, and the race remains unresolved. Atmoso follows reports of Let\u2019s scattered soul as carefully as he charts a route home for each lost message.",
      vow: "No road ends while the wind remembers.",
      awakening: "A familiar breeze finds a new direction, not its maker."
    }
  },
  {
    id: "aurora",
    stars: 6,
    name: "Aurora",
    role: "Support",
    art: "aurora",
    title: "Peace sees what every verdict leaves behind",
    element: "Tranquilitic",
    elementId: "tranquilitic",
    weapon: "Empty-hand light casting",
    color: "#eee2af",
    description: "A Tranquilitic Element-Bearer shaped in Let\u2019s image, Aurora casts light through prismatic lenses to defend Peace without wielding a weapon.",
    lore: { origin: "The lens courts of Lustrous River", story: "Aurora inherited a lens in the Lustrous River courts that revealed the lives left outside every verdict. She set aside the courts\u2019 certainty and uses empty-handed light casting to temper violence, not to command obedience. Tranquilitic reflects Peace, the choice to make room for another answer. Let created Element-Bearers in his image; Rise\u2019s Elemental-Devourers later stole the same elements. Both seek their creators\u2019 souls, but both remain unfound and no faction has won. Aurora studies the lens for signs of Let\u2019s soul, refusing to mistake a glimmer for its return.", vow: "Let the dawn reveal a better choice.", awakening: "A prism turns toward an unwritten verdict; the search continues." }
  },
  {
    id: "bliss",
    stars: 6,
    name: "Bliss",
    role: "Attacker",
    art: "bliss",
    title: "Peace moves with a thousand careful feathers",
    element: "Tranquilitic",
    elementId: "tranquilitic",
    weapon: "Paired feather fans",
    color: "#a8ded5",
    description: "A Tranquilitic Element-Bearer shaped in Let\u2019s image, Bliss turns Peace into motion with her paired feather fans.",
    lore: { origin: "The feather courts of City of Heaven", story: "Bliss learned in City of Heaven\u2019s feather courts that Peace is not stillness imposed on others, but attention to how each step affects them. Her paired fans preserve the court\u2019s rhythm as she draws danger away from those unable to flee. Let made Element-Bearers in his image; Rise made Elemental-Devourers in hers and broke convention to steal their elements. Both factions seek their creators\u2019 souls, which remain unfound; no victor has emerged. Bliss follows the scattered traces of Let\u2019s soul, dancing between the pursuit and the people it threatens.", vow: "My stillness will never mean surrender.", awakening: "A quiet feather settles into your hand; the dance remains unfinished." }
  },
  {
    id: "bruno",
    stars: 5,
    name: "Bruno",
    role: "Tank",
    art: "bruno",
    title: "Joy and life endure beneath falling stone",
    element: "Botanic",
    elementId: "botanic",
    weapon: "Stone hammer",
    color: "#c7a782",
    description: "A Botanic Element-Bearer shaped in Let\u2019s image, Bruno bears Joy and Life through a stone hammer and shelters of living bedrock.",
    lore: { origin: "The quarries of Precipice of the Earth", story: "Bruno stayed when the quarries of Precipice began to collapse. With his stone hammer he made broken slabs into shelter, then shared the workers\u2019 relief as a kind of joy worth protecting. Botanic joins Joy with Life: even buried foundations can hold a future. Let created Element-Bearers in his image, and Rise created Elemental-Devourers in hers, stealing the same elements; both factions now seek their creators\u2019 souls. Neither has found or reunited one, so Bruno guards the workers while tracing rumors of Let\u2019s soul, unwilling to call any faction\u2019s claim a victory.", vow: "Stand behind me. We will hold.", awakening: "Bedrock answers a steady hand; the foundation is not a throne." }
  },
  {
    id: "disciple",
    stars: 6,
    name: "Disciple",
    role: "Support",
    art: "disciple",
    title: "Mortality binds no mind to a single will",
    element: "Chaotic",
    elementId: "chaotic",
    weapon: "Empty-hand psychic casting",
    color: "#c68aea",
    description: "A Chaotic Element-Bearer shaped in Let\u2019s image, Disciple uses open-handed psychic casting to share strength without binding another mind.",
    lore: { origin: "The thought forges of Ruins of Chaos", story: "Disciple refused the thought forges of Ruins of Chaos when they demanded one will from every mind. His open hands now weave scarlet mindflame into a freely shared resolve. Chaotic bears Death and Destruction, facts of existence rather than a license to erase another person\u2019s choices. Let created Element-Bearers in his image; Rise created Elemental-Devourers in hers and broke convention to steal the same elements. Both factions hunt their creators\u2019 souls, still unreunited, and neither has prevailed. Disciple searches for Let\u2019s scattered soul while resisting every promise that reunion must mean unquestioned rule.", vow: "Strength shared is freedom preserved.", awakening: "An unbound thought reaches for your own; no mind has claimed its maker." }
  },
  {
    id: "elise",
    stars: 5,
    name: "Elise",
    role: "Attacker",
    art: "elise",
    title: "Calm finds its way through the storm",
    element: "Atmospheric",
    elementId: "atmospheric",
    weapon: "Two four-point shuriken",
    color: "#b6e49a",
    description: "An Atmospheric Element-Bearer shaped in Let\u2019s image, Elise reads a storm with exactly two four-point shuriken and a calm, measured step.",
    lore: { origin: "The circuit paths of Galvanic Field", story: "Elise mapped the forgotten circuits of Galvanic Field with exactly two four-point shuriken and a steady eye. When the field fractured, she learned that Atmospheric Calm is not passivity: it is the pause in which a safe opening can be seen. Let made Element-Bearers in his image; Rise\u2019s Elemental-Devourers stole the same elements, and both factions seek their creators\u2019 souls. Neither creator\u2019s soul has been found or reunited, and no one has won. Elise follows the field\u2019s branching currents for clues to Let\u2019s soul, but never at the cost of leaving a neighbor behind.", vow: "There is always another opening.", awakening: "Two sparks trace a path through the storm; the source remains distant." }
  },
  {
    id: "razor",
    stars: 6,
    name: "Razor",
    role: "Tank",
    art: "razor",
    title: "At midnight, destruction meets a steadfast guard",
    element: "Chaotic",
    elementId: "chaotic",
    weapon: "Night sword",
    color: "#bc9bef",
    description: "A Chaotic Element-Bearer shaped in Let\u2019s image, Razor guards the Valley with one night sword and an eclipse bastion.",
    lore: { origin: "The nightwatch and abandoned gates of Valley of Solitude", story: "Razor kept watch after the Valley of Solitude gates were abandoned. He shaped the darkness around them into a bastion with one night sword, so frightened travelers could pass safely. Chaotic reflects Death and Destruction; Razor knows a guard must face both without turning protection into domination. Let created Element-Bearers in his image, and Rise created Elemental-Devourers in hers, breaking convention to steal the same elements. Both factions seek their creators\u2019 souls, but neither has reunited one and no side has won. Razor tracks signs of Let\u2019s scattered soul between watches, never leaving the gate unguarded for a promised ending.", vow: "The night will find me standing.", awakening: "A silent sentinel answers your call, not the call of a found soul." }
  }
];
var flagshipEvolutionTitles = {
  atmoso: ["Gale Wayfarer", "Crosswind Adept", "Skyspoke Invoker", "Tempest Loom", "Crown of the High Gale", "The Sky Without End"],
  aurora: ["Daybreak Arbiter", "Gleamveil Adjudicator", "Solar Verdict Oracle", "Prismseal Seraph", "Dawncourt Sovereign", "The Dawn Beyond Judgment"],
  bliss: ["Featherstep Duelist", "Stillplume Dancer", "Quietwing Fencer", "Prismplume Arbiter", "Serene Tempest Empress", "The Thousandfeather Stillness"],
  bruno: ["Quarry Sentinel", "Faultline Bulwark", "Bedrock Citadel", "Worldforge Bastion", "Prismatic Mountain Regent", "The Living Worldwall"],
  disciple: ["Mindflame Initiate", "Thoughtforge Adept", "Ascendant Mindbinder", "Prismthought Hierophant", "Mindflame Exarch", "The Unbound Mindcrown"],
  elise: ["Sparkstep Shinobi", "Voltweave Skirmisher", "Stormwheel Striker", "Thunderlace Executioner", "Prismatic Storm Empress", "The Infinite Thunderwheel"],
  razor: ["Nightwatch Bastion", "Duskplate Sentinel", "Eclipse Rampart", "Nightglass Bulwark", "Prismatic Eclipse Regent", "The Unbroken Midnight"]
};
var flagshipFighters = {
  atmoso: {
    pilot: "tempest",
    stats: { health: 205, defense: 9, damage: 39, crit: 0.2, shatterCapacity: 100, critMultiplier: 1.6, elementalDamage: 0 },
    passive: { name: "Gale Cadence", description: "+15% outgoing damage at or below 50% health.", damageBonus: 0.15, defenseBonus: 0, healFraction: 0 },
    abilities: {
      skill1: { name: "Razor Gale", description: "180% damage to one enemy.", cooldown: 0, strength: { damageMultiplier: 1.8 } },
      skill2: { name: "Cyclone Weave", description: "120% damage to every living enemy.", cooldown: 0, targets: "all-enemies", strength: { damageMultiplier: 1.2 } },
      ultimate: { name: "Last Flare: Sky Without End", description: "290% damage to every living enemy. Recover next turn.", cooldown: 0, targets: "all-enemies", strength: { damageMultiplier: 2.9 } }
    }
  },
  aurora: {
    stats: { health: 215, defense: 10, damage: 32, crit: 0.12, shatterCapacity: 100, critMultiplier: 1.5, elementalDamage: 0 },
    passive: { name: "Lens of Diminishment", description: "+6 defense, included in effective defense.", damageBonus: 0, defenseBonus: 6, healFraction: 0 },
    abilities: {
      skill1: { name: "Gleamseal", description: "140% damage to one enemy; weaken by 30% for two enemy phases.", cooldown: 0, strength: { damageMultiplier: 1.4, weakenFraction: 0.3 } },
      skill2: { name: "Eclipse Mandate", description: "90% damage to every living enemy; weaken by 25% for two enemy phases.", cooldown: 0, targets: "all-enemies", strength: { damageMultiplier: 0.9, weakenFraction: 0.25 } },
      ultimate: { name: "Last Flare: Final Dawn Verdict", description: "220% damage to every living enemy; weaken by 40% for two enemy phases. Recover next turn.", cooldown: 0, targets: "all-enemies", strength: { damageMultiplier: 2.2, weakenFraction: 0.4 } }
    }
  },
  bliss: {
    pilot: "bloom",
    stats: { health: 210, defense: 10, damage: 42, crit: 0.25, shatterCapacity: 100, critMultiplier: 1.7, elementalDamage: 0 },
    passive: { name: "Stillfeather Tempo", description: "+20% outgoing damage at or below 50% health.", damageBonus: 0.2, defenseBonus: 0, healFraction: 0 },
    abilities: {
      skill1: { name: "Warfeather Cut", description: "175% damage to one enemy with +15 percentage points critical chance.", cooldown: 0, strength: { damageMultiplier: 1.75, critBonus: 0.15 } },
      skill2: { name: "Quietstorm Flourish", description: "125% damage to every living enemy with +10 percentage points critical chance; restore 12 health to every living ally, no revival.", cooldown: 0, targets: "all-enemies", strength: { damageMultiplier: 1.25, critBonus: 0.1, healing: 12 } },
      ultimate: { name: "Last Flare: Thousandfeather Stillness", description: "300% damage to every living enemy with +20 percentage points critical chance. Recover next turn.", cooldown: 0, targets: "all-enemies", strength: { damageMultiplier: 3, critBonus: 0.2 } }
    }
  },
  bruno: {
    stats: { health: 285, defense: 18, damage: 29, crit: 0.08, shatterCapacity: 100, critMultiplier: 1.5, elementalDamage: 0 },
    passive: { name: "Faultbound Resolve", description: "+9 defense, included in effective defense.", damageBonus: 0, defenseBonus: 9, healFraction: 0 },
    abilities: {
      skill1: { name: "Seismic Hammerfall", description: "155% damage to one enemy; weaken by 20% for two enemy phases.", cooldown: 0, strength: { damageMultiplier: 1.55, weakenFraction: 0.2 } },
      skill2: { name: "Citadel Mantle", description: "Give every living ally 32 shield (refresh; does not stack).", cooldown: 0, targets: "all-allies", strength: { shield: 32 } },
      ultimate: { name: "Last Flare: Worldwall Ascendant", description: "230% damage to every living enemy and 45 shield for allies. Recover next turn.", cooldown: 0, targets: "all-enemies", strength: { damageMultiplier: 2.3, shield: 45 } }
    }
  },
  disciple: {
    stats: { health: 240, defense: 11, damage: 36, crit: 0.12, shatterCapacity: 100, critMultiplier: 1.5, elementalDamage: 0 },
    passive: { name: "Shared Mindflame", description: "+15% outgoing damage at or below 50% health.", damageBonus: 0.15, defenseBonus: 0, healFraction: 0 },
    abilities: {
      skill1: { name: "Thoughtspark Benediction", description: "150% damage to one enemy; increase living allies' outgoing attack damage by 20% this and next player turn (refresh; does not stack).", cooldown: 0, strength: { damageMultiplier: 1.5, attackBoostFraction: 0.2 } },
      skill2: { name: "Concord of Chaos", description: "Increase living allies' outgoing attack damage by 30% this and next player turn and give 20 shield (refresh; does not stack).", cooldown: 0, targets: "all-allies", strength: { attackBoostFraction: 0.3, shield: 20 } },
      ultimate: { name: "Last Flare: Unbound Mindcrown", description: "Increase living allies' outgoing attack damage by 40% this and next player turn and give 40 shield (refresh; does not stack). Recover next turn.", cooldown: 0, targets: "all-allies", strength: { attackBoostFraction: 0.4, shield: 40 } }
    }
  },
  elise: {
    pilot: "tempest",
    stats: { health: 195, defense: 8, damage: 40, crit: 0.25, shatterCapacity: 100, critMultiplier: 1.7, elementalDamage: 0 },
    passive: { name: "Stormwheel Rhythm", description: "+15% outgoing damage at or below 50% health.", damageBonus: 0.15, defenseBonus: 0, healFraction: 0 },
    abilities: {
      skill1: { name: "Voltstar Cut", description: "170% damage to one enemy with +20 percentage points critical chance.", cooldown: 0, strength: { damageMultiplier: 1.7, critBonus: 0.2 } },
      skill2: { name: "Crosscurrent Volley", description: "115% damage to every living enemy.", cooldown: 0, targets: "all-enemies", strength: { damageMultiplier: 1.15 } },
      ultimate: { name: "Last Flare: Infinite Thunderwheel", description: "285% damage to every living enemy with +15 percentage points critical chance. Recover next turn.", cooldown: 0, targets: "all-enemies", strength: { damageMultiplier: 2.85, critBonus: 0.15 } }
    }
  },
  razor: {
    stats: { health: 290, defense: 19, damage: 32, crit: 0.1, shatterCapacity: 100, critMultiplier: 1.5, elementalDamage: 0 },
    passive: { name: "Unbroken Night", description: "+10 defense, included in effective defense.", damageBonus: 0, defenseBonus: 10, healFraction: 0 },
    abilities: {
      skill1: { name: "Nightcleave", description: "165% damage to one enemy; weaken by 25% for two enemy phases.", cooldown: 0, strength: { damageMultiplier: 1.65, weakenFraction: 0.25 } },
      skill2: { name: "Eclipse Bastion", description: "Give every living ally 35 shield (refresh; does not stack).", cooldown: 0, targets: "all-allies", strength: { shield: 35 } },
      ultimate: { name: "Last Flare: Unbroken Midnight", description: "240% damage to every living enemy and 50 shield for allies. Recover next turn.", cooldown: 0, targets: "all-enemies", strength: { damageMultiplier: 2.4, shield: 50 } }
    }
  }
};
function icons(id) {
  return { passive: `${id}-passive`, light: `${id}-light`, skill1: `${id}-skill1`, skill2: `${id}-skill2`, ultimate: `${id}-ultimate` };
}
var flagshipAbilityIcons = {
  atmoso: icons("atmoso"),
  aurora: icons("aurora"),
  bliss: icons("bliss"),
  bruno: icons("bruno"),
  disciple: icons("disciple"),
  elise: icons("elise"),
  razor: icons("razor")
};

// src/content/war-characters.ts
var warCharacters = [
  {
    id: "nerithe",
    stars: 6,
    name: "Nerithe",
    role: "Attacker",
    art: "nerithe",
    title: "Sadness charted beyond the shoreless sea",
    element: "Oceanic",
    elementId: "oceanic",
    weapon: "Surveyor trident",
    color: "#54c9d4",
    description: "An Oceanic Element-Bearer shaped in Let\u2019s image, Nerithe maps Sadness with a surveyor trident and folded currents.",
    lore: {
      origin: "The observatories above the spiral sea",
      story: "From the spiral-sea observatories, Nerithe charted a current that never returned to shore. She learned Oceanic carries Sadness: a record of what is missing that can guide the living, not drown them. With her surveyor trident she folds distant tides around people lost between worlds. Let created Element-Bearers in his image; Rise created Elemental-Devourers in hers and stole those same elements. Both factions search for their creators\u2019 souls, but neither has been reunited and no victor has emerged. Nerithe plots a route toward Let\u2019s scattered soul while marking every voyager still unaccounted for.",
      vow: "No one is lost beyond my map.",
      awakening: "An uncharted current answers; its source is not yet found."
    }
  },
  {
    id: "orvella",
    stars: 6,
    name: "Orvella",
    role: "Tank",
    art: "orvella",
    title: "Joy grows from foundations beneath the world",
    element: "Botanic",
    elementId: "botanic",
    weapon: "Crystal mace",
    color: "#d2b59a",
    description: "A Botanic Element-Bearer shaped in Let\u2019s image, Orvella\u2019s crystal mace raises living foundations where Joy and Life can endure.",
    lore: {
      origin: "The vaults beneath the faultline",
      story: "Orvella first braced a broken village gate with a mason\u2019s stone. In the vaults beneath the faultline she found buried foundations, and with her crystal mace raised them into shelter for people the world had forgotten. Botanic holds Joy and Life together: she celebrates each home restored without pretending the losses never happened. Let made Element-Bearers in his image; Rise made Elemental-Devourers in hers and broke convention to steal the same elements. Both sides seek their creators\u2019 souls; neither has found or reunited one, and no one has won. Orvella follows Let\u2019s trail between repairs, unwilling to leave a community for a promise of rule.",
      vow: "No shelter falls while I still stand.",
      awakening: "The first foundation answers, though its maker\u2019s soul remains lost."
    }
  },
  {
    id: "vaelor",
    stars: 6,
    name: "Vaelor",
    role: "Attacker",
    art: "vaelor",
    title: "Calm holds the note between storms",
    element: "Atmospheric",
    elementId: "atmospheric",
    weapon: "Resonance blade",
    color: "#e6d177",
    description: "An Atmospheric Element-Bearer shaped in Let\u2019s image, Vaelor finds Calm in the thunder choir with a resonance blade.",
    lore: { origin: "The towers of the thunder choir", story: "Vaelor listened in the thunder-choir towers for the missing rhythm between storms. With a small resonance blade he followed the silence, learning that Atmospheric means Calm: the clear interval in which a broken sky can be heard without being forced to sing. Let created Element-Bearers in his image; Rise created Elemental-Devourers in hers and stole the same elements. Both factions seek their creators\u2019 souls, still separate and unfound; the contest has no winner. Vaelor follows the quiet frequencies around rumors of Let\u2019s soul, certain that the missing note must be heard before anyone can claim the final chord.", vow: "Even a broken sky can sing again.", awakening: "Quiet voltage finds its first rhythm, not its final chord." }
  }
];
function isWarCharacter(value2) {
  return warCharacters.some((character) => character.id === value2);
}
var warEvolutionTitles = {
  nerithe: [
    "Uncharted Tide",
    "Current Surveyor",
    "Keeper of the Spiral Sea",
    "Admiral of the Folded Ocean",
    "Sovereign of the Abyssal Meridian",
    "The Sea Without a Shore"
  ],
  orvella: [
    "First Foundation",
    "Mason of the Faultline",
    "Keeper of the Buried Vault",
    "Architect of the Moving Citadel",
    "Sovereign of the Deep Foundations",
    "The Throne Beneath the World"
  ],
  vaelor: [
    "Quiet Voltage",
    "Keeper of the Stormbeat",
    "Marshal of the Thunder Choir",
    "Conductor of the Broken Sky",
    "Sovereign of the Final Frequency",
    "The Sky's Final Chord"
  ]
};
var warActionNames = {
  nerithe: { light: "Surveyor's Thrust" },
  orvella: { light: "Plumbline Strike" },
  vaelor: { light: "Tuning Strike" }
};
var warFighters = {
  nerithe: {
    stats: { health: 235, defense: 13, damage: 40, crit: 0.18, shatterCapacity: 100, critMultiplier: 1.6, elementalDamage: 0 },
    passive: { name: "Uncharted Current", description: "Normal Attack gains 5 additional Elemental Gauge, capped by Elemental Gauge capacity.", damageBonus: 0, defenseBonus: 0, healFraction: 0, lightGaugeBonus: 5 },
    abilities: {
      skill1: { name: "Meridian Break", description: "170% damage to one enemy; weaken its next two enemy-phase attacks by 20%.", cooldown: 0, strength: { damageMultiplier: 1.7, weakenFraction: 0.2 } },
      skill2: { name: "Fold the Sea", description: "130% damage to all enemies; weaken surviving targets by 15% for two enemy phases.", cooldown: 0, targets: "all-enemies", strength: { damageMultiplier: 1.3, weakenFraction: 0.15 } },
      ultimate: { name: "Ocean Beyond the Map", description: "300% damage to all enemies; weaken surviving targets by 30% for two enemy phases. Recover next turn.", cooldown: 0, targets: "all-enemies", strength: { damageMultiplier: 3, weakenFraction: 0.3 } }
    }
  },
  orvella: {
    stats: { health: 300, defense: 20, damage: 32, crit: 0.1, shatterCapacity: 100, critMultiplier: 1.5, elementalDamage: 0 },
    passive: { name: "Load-Bearing Will", description: "+10 defense, already included in effective defense.", damageBonus: 0, defenseBonus: 10, healFraction: 0 },
    abilities: {
      skill1: { name: "Keystone Reversal", description: "160% damage to one enemy; weaken its next two enemy-phase attacks by 25%.", cooldown: 0, strength: { damageMultiplier: 1.6, weakenFraction: 0.25 } },
      skill2: { name: "Raise the Faultline", description: "Give every living ally 40 shield; refreshes rather than stacks.", cooldown: 0, targets: "all-allies", strength: { shield: 40 } },
      ultimate: { name: "Worldweight Citadel", description: "260% damage to all enemies and 65 shield to living allies. Recover next turn.", cooldown: 0, targets: "all-enemies", strength: { damageMultiplier: 2.6, shield: 65 } }
    }
  },
  vaelor: {
    pilot: "tempest",
    stats: { health: 210, defense: 11, damage: 45, crit: 0.22, shatterCapacity: 100, critMultiplier: 1.65, elementalDamage: 8 },
    passive: { name: "Standing Thunder", description: "+25% outgoing damage at or below half health.", damageBonus: 0.25, defenseBonus: 0, healFraction: 0 },
    abilities: {
      skill1: { name: "Forked Cadence", description: "180% damage to one enemy with +20 percentage points critical chance.", cooldown: 0, strength: { damageMultiplier: 1.8, critBonus: 0.2 } },
      skill2: { name: "Resonance Cascade", description: "140% damage to all enemies.", cooldown: 0, targets: "all-enemies", strength: { damageMultiplier: 1.4 } },
      ultimate: { name: "Last Chord of the Sky", description: "330% damage to all enemies. Recover next turn.", cooldown: 0, targets: "all-enemies", strength: { damageMultiplier: 3.3 } }
    }
  }
};

// src/content/starters.ts
var openingStarters = [
  {
    id: "ember",
    stars: 5,
    name: "Infernis",
    role: "Attacker",
    art: "infernis",
    title: "Wrath that guards a fragile beginning",
    element: "Infernic",
    elementId: "infernic",
    weapon: "Greatsword",
    color: "#f39b6d",
    description: "An Infernic Element-Bearer shaped in Let\u2019s image, Infernis carries Wrath in a wooden greatsword and red scarf, turning fierce feeling toward protection.",
    lore: {
      origin: "The watchfires and village keepers of Ashen Vale",
      story: "When Ashen Vale\u2019s watchfires failed, Infernis carried their last coal in a clay lantern, her wooden training greatsword in hand and the keepers\u2019 red scarf at her neck. As an Element-Bearer made in Let\u2019s image, she knows Infernic answers Wrath: anger can burn a refuge down, or give someone the courage to defend it. Rise\u2019s Elemental-Devourers have stolen the same element, and both factions hunt their creators\u2019 scattered souls; Let\u2019s remains unreunited, and no side has won. Infernis follows the rumor of his soul not for a throne, but so no traveler must face the dark alone.",
      vow: "Let my Wrath shelter the next beginning.",
      awakening: "The last coal stirs; the missing soul is still ahead."
    }
  },
  {
    id: "tide",
    stars: 5,
    name: "Tizu",
    role: "Tank",
    art: "tizu",
    title: "Sadness remembered, and carried safely",
    element: "Oceanic",
    elementId: "oceanic",
    weapon: "Spear",
    color: "#79c9eb",
    description: "An Oceanic Element-Bearer shaped in Let\u2019s image, Tizu\u2019s blue hair, simple spear, and blue ferrykeeper sash follow remembered Sadness.",
    lore: {
      origin: "The ferry bells and silent shores of Glasswater",
      story: "Tizu learned every Glasswater bell that guided boats through the mist. After the bells fell silent, he tied on his blue ferrykeeper sash and took a practice spear to the shore. His Oceanic element holds Sadness without letting grief become an anchor: he records the names of the missing keepers and follows currents that might bring them home. Let\u2019s first made Element-Bearers in his image, while Rise made Elemental-Devourers who broke the old boundary and stole the same elements. Both search for their creators\u2019 souls, but neither has been reunited; Tizu seeks Let\u2019s without mistaking a hopeful current for proof.",
      vow: "No one is lost while the water remembers.",
      awakening: "A grieving current rises, but its source remains unknown."
    }
  },
  {
    id: "sprout",
    stars: 5,
    name: "Flora",
    role: "Healer & Support",
    art: "flora",
    title: "Joy gives life room to return",
    element: "Botanic",
    elementId: "botanic",
    weapon: "Bow",
    color: "#a9d58a",
    description: "A Botanic Element-Bearer shaped in Let\u2019s image, Flora\u2019s wooden bow and green neckerchief accompany Joy and Life wherever hope can take root.",
    lore: {
      origin: "The waking roots and gardeners of Hollowgreen",
      story: "Flora tended a small garden in Hollowgreen after the old trees stopped bearing leaves. When one seed opened beneath the gray branches, she took her wooden bow and the gardeners\u2019 green neckerchief to find more ground worth tending. Botanic carries both Joy and Life: delight is not denial of loss, but the choice to make room for what can grow. Let created Element-Bearers in his image; Rise\u2019s Elemental-Devourers later stole those same elements, and both factions now seek their creators\u2019 souls. Flora follows the still-unfound soul of Let, hoping its return might keep the worlds open to renewal; no faction has yet prevailed.",
      vow: "Give joy and life a place to take root.",
      awakening: "A sleeping seed opens; the search is not over."
    }
  }
];
var roseCharacters = [
  {
    id: "rosetta",
    stars: 6,
    name: "Rosetta",
    role: "Attacker",
    art: "rosetta",
    title: "Peace takes flight beneath a crimson sun",
    element: "Tranquilitic",
    elementId: "tranquilitic",
    weapon: "Bow",
    color: "#eee2af",
    description: "A Tranquilitic Element-Bearer shaped in Let\u2019s image, Rosetta\u2019s bow, golden thorns, and crimson wings defend peace without demanding possession.",
    lore: { origin: "The gardens beneath sunny skies", story: "Rosetta learned among the sunny rose gardens that peace is a practice, not a command to be silent. Her bow draws golden thorns through the crimson canopy to open an escape for those caught in others\u2019 quarrels. Tranquilitic reflects Peace, and she carries that meaning as one of the Element-Bearers Let created in his image. Rise\u2019s Elemental-Devourers stole the same element; both factions seek their creators\u2019 souls, still unfound, and no victor can yet claim the world. Rosetta follows the rumors with care, wary of any peace bought by making one creator absolute.", vow: "Let every rose shelter a beginning.", awakening: "A crimson petal turns toward the sun; the soul is still sought." }
  },
  {
    id: "thornia",
    stars: 6,
    name: "Thornia",
    role: "Tank",
    art: "thornia",
    title: "Destruction held to account at the garden gate",
    element: "Chaotic",
    elementId: "chaotic",
    weapon: "Greatsword",
    color: "#bc9bef",
    description: "A Chaotic Element-Bearer shaped in Let\u2019s image, Thornia wears a golden rose in her hair and bears a crimson-thorn-wrapped greatsword.",
    lore: { origin: "The forbidden garden", story: "Thornia guarded a single golden rose at the edge of the forbidden garden. When its gates broke, she wrapped crimson thorns around her greatsword and held the breach so its people could escape. Chaotic reflects Death and Destruction, truths she refuses to disguise as virtue or wield carelessly. Let created Element-Bearers in his image; Rise created Elemental-Devourers in hers and broke convention to steal the same elements. Both factions seek their creators\u2019 souls, but neither soul has been reunited and no one has won. Thornia searches for Let\u2019s, intent on keeping destructive power from deciding who deserves to live.", vow: "No one crosses these thorns alone.", awakening: "The golden rose remembers its guardian, not a victor." }
  },
  {
    id: "crinso",
    stars: 6,
    name: "Crinso",
    role: "Attacker",
    art: "crinso",
    title: "One blade, honest about death and renewal",
    element: "Chaotic",
    elementId: "chaotic",
    weapon: "Dual-edged sword",
    color: "#ed8bbe",
    description: "A Chaotic Element-Bearer shaped in Let\u2019s image, Crinso wields one dual-edged sword: golden fire on one edge, crimson lightning on the other.",
    lore: { origin: "The paths between twin roses", story: "On the paths between twin roses, Crinso learned that tending a garden sometimes means protecting what lives and sometimes accepting what must end. His small double-edged dagger became one rose-centered sword, golden fire and crimson lightning held in a single grip. Chaotic bears Death and Destruction, not a promise of cruelty. Let made Element-Bearers in his image; Rise\u2019s Elemental-Devourers broke convention to steal their elements. Both sides hunt their creators\u2019 souls, still separate and unfound, and Crinso will not call the contest settled before either is found. He follows the trail of Let\u2019s soul while guarding the people caught between factions.", vow: "I choose what grows beyond the storm.", awakening: "Two petals unfold around one resolve; neither soul has returned." }
  }
];
var starters = [...openingStarters, ...roseCharacters, ...flagshipCharacters, ...warCharacters];
var availableStarters = openingStarters;
function isRoseCharacter(id) {
  return roseCharacters.some((character) => character.id === id);
}
function isAvailableStarter(id) {
  return availableStarters.some((starter) => starter.id === id);
}
function isStarterId(value2) {
  return starters.some((starter) => starter.id === value2);
}
function getStarter(id) {
  const starter = starters.find((entry) => entry.id === id);
  if (!starter) throw new Error(`Unknown starter: ${id}`);
  return starter;
}

// src/content/elemental-effects.ts
var elementalEffectFamilies = {
  burn: { element: "infernic", label: "Infernic Embers" },
  ward: { element: "oceanic", label: "Oceanic Protection" },
  bloom: { element: "botanic", label: "Botanic Renewal" },
  tempest: { element: "atmospheric", label: "Atmospheric Charge" },
  focus: { element: "tranquilitic", label: "Tranquilitic Focus" },
  suppression: { element: "chaotic", label: "Chaotic Suppression" }
};
var sharedNativeEffects = {
  ember: {
    family: "burn",
    kind: "burn",
    origin: "native",
    source: "living-self-authored-burn"
  },
  ward: {
    family: "ward",
    kind: "shield-absorption",
    origin: "native",
    source: "living-self-authored-shield"
  },
  bloom: {
    family: "bloom",
    kind: "healing",
    origin: "native",
    source: "living-self-authored-healing"
  },
  tempest: {
    family: "tempest",
    kind: "critical",
    origin: "native",
    source: "living-self-critical-direct-activation"
  }
};

// src/content/kit-pilots.ts
var kitPilotDescriptions = {
  ember: {
    passive: `While you are alive, Burn from your own abilities grants one charge of ${elementalEffectFamilies.burn.label} when it deals damage. Charges have no limit. Save these charges to strengthen Flame Arc or Last Flare.`,
    skill2: `Spends all ${elementalEffectFamilies.burn.label} charges for +8% outgoing damage per charge; one spend for the whole activation.`,
    ultimate: `Spends all ${elementalEffectFamilies.burn.label} charges for +12% outgoing damage per charge; one spend for the whole activation.`,
    resource: { label: elementalEffectFamilies.burn.label, key: "ember", summary: "Gain a charge each time your own Burn deals damage while you are alive. Flame Arc spends them for +8% damage each; Last Flare spends them for +12% each.", detail: `${elementalEffectFamilies.burn.label}: Skill 2 +8% outgoing damage per charge or Last Flare +12% per charge.`, effect: sharedNativeEffects.ember }
  },
  ward: {
    passive: `While you are alive, shields from your own abilities grant one charge of ${elementalEffectFamilies.ward.label} when they absorb a direct enemy hit. Charges have no limit. Save these charges to strengthen Undertow Thrust's Weaken or Last Flare's team shield.`,
    skill1: `Spends all ${elementalEffectFamilies.ward.label} charges for +5 percentage points Weaken per charge.`,
    ultimate: `Spends all ${elementalEffectFamilies.ward.label} charges to increase this ability's team shield by 5% of your maximum Health per charge. Each ally keeps the higher of their remaining shield and this new amount.`,
    resource: { label: elementalEffectFamilies.ward.label, key: "ward", summary: "Gain a charge each time your ability shield absorbs a direct enemy hit while you are alive. Skill 1 spends them to strengthen Weaken; Last Flare spends them for a larger team shield.", detail: `${elementalEffectFamilies.ward.label}: Skill 1 +5 percentage points Weaken per charge or Last Flare adds a shield worth 5% of caster maximum Health per charge.`, effect: sharedNativeEffects.ward }
  },
  bloom: {
    passive: `While you are alive, healing from your own abilities or passive grants one charge of ${elementalEffectFamilies.bloom.label} when it restores missing HP. Charges have no limit. Full-health targets and Conduit healing do not count. Save these charges to strengthen Skill 1 or Last Flare.`,
    resource: { label: elementalEffectFamilies.bloom.label, key: "bloom", summary: "Gain a charge each time your own kit restores missing HP. Skill 1 spends them for extra damage. Last Flare spends them for extra healing (Flora) or team shield (Bliss). Conduit healing does not earn charges.", detail: `${elementalEffectFamilies.bloom.label}: Skill 1 spends charges for extra damage; Last Flare spends them for extra healing (Flora) or team shield (Bliss).`, effect: sharedNativeEffects.bloom }
  },
  tempest: {
    passive: `A critical Normal Attack, Skill 1 or Skill 2 that deals damage grants one charge of ${elementalEffectFamilies.tempest.label}, once per use even against multiple enemies. Charges have no limit. Last Flare grants none. Save these charges for the charge-spending skill or Last Flare's damage bonus.`,
    resource: { label: elementalEffectFamilies.tempest.label, key: "tempest", summary: "Gain a charge from each damaging critical Normal Attack or skill use; Last Flare earns none. Skill 1 (Atmoso and Elise) or Skill 2 (Vaelor) spends them for +8% damage each; Last Flare spends them for +12% each.", detail: `${elementalEffectFamilies.tempest.label}: Skill 1 (Atmoso and Elise) or Skill 2 (Vaelor) spends charges for +8% damage each; Last Flare spends them for +12% each.`, effect: sharedNativeEffects.tempest }
  },
  "rose-grace": {
    passive: "While Rosetta is alive, her abilities or passive grant one Rose Grace charge when they restore missing HP. Charges have no limit. Full-health targets and Conduit healing do not count.",
    skill1: "Spends all Rose Grace for +5 percentage points Weaken each.",
    ultimate: "Spends all Rose Grace for +10% outgoing damage each; one spend for the whole activation.",
    resource: { label: "Rose Grace", key: "roseGrace", summary: "Gain a charge each time Rosetta's own kit restores missing HP while she is alive. Skill 1 spends them for stronger Weaken; Last Flare spends them for +10% damage each. Conduit healing does not earn charges.", detail: "Rose Grace: Skill 1 +5 percentage points Weaken each or Last Flare +10% outgoing damage each.", effect: { family: "bloom", kind: "healing", origin: "rose", source: "living-self-authored-healing" } }
  },
  "thorn-aegis": {
    passive: "While Thornia is alive, shields from her abilities grant one Thorn Aegis charge when they absorb a direct enemy hit. Charges have no limit. Conduit shields do not count.",
    skill2: "Spends all Thorn Aegis for +5 percentage points Weaken each.",
    ultimate: "Spends all Thorn Aegis to add shield points equal to 5% of your maximum Health per charge, before this ability's shield modifiers. Each ally keeps the higher of their remaining shield and this new amount.",
    resource: { label: "Thorn Aegis", key: "thornAegis", summary: "Gain a charge each time Thornia's ability shield absorbs a direct enemy hit while she is alive. Skill 2 spends them for stronger Weaken; Last Flare spends them for a larger team shield. Conduit shields do not earn charges.", detail: "Thorn Aegis: Skill 2 +5 percentage points Weaken each or Last Flare adds 5% caster maximum Health shield each.", effect: { family: "ward", kind: "shield-absorption", origin: "rose", source: "living-self-authored-shield" } }
  },
  "rose-duality": {
    passive: "While Crinso is alive, Burn from his abilities grants one Rose Duality charge when it deals damage. Charges have no limit. The charges are not Burn and are separate from the Ember Seals granted by the Cinder Testament Conduit.",
    skill1: "Spends all Rose Duality for +8% outgoing damage each; one spend for the whole activation.",
    ultimate: "Spends all Rose Duality for +12% outgoing damage each; one spend for the whole activation.",
    resource: { label: "Rose Duality", key: "duality", summary: "Gain a charge each time Crinso's own Burn deals damage while he is alive. Skill 1 spends them for +8% damage each; Last Flare spends them for +12% each. Separate from Conduit charges.", detail: "Rose Duality: Skill 1 +8% outgoing damage each or Last Flare +12% each.", effect: { family: "burn", kind: "burn", origin: "rose", source: "living-self-authored-burn" } }
  }
};

// src/content/native-balance.ts
var nativeBalance = {
  skillDamageScale: 1.6,
  flora: { seed: 0.5, empoweredSeed: 0.65, immediateHeal: 0.5 },
  tizu: { shelter: 0.45, oceanMemory: 0.35 }
};

// src/content/native-identities.ts
function ability(name, description, damageMultiplier, targets, excludeSelf) {
  return {
    name,
    description,
    cooldown: 0,
    strength: damageMultiplier === void 0 ? {} : { damageMultiplier },
    ...targets ? { targets } : {},
    ...excludeSelf ? { excludeSelf } : {}
  };
}
var nativeIdentities = {
  ember: {
    role: "Persistent fire specialist",
    playLoop: "[Infernis] applies [Burn] that lasts across enemy phases; [Flame Arc] can deal its remaining damage at once.",
    passive: {
      name: "Unbroken Ember",
      description: "[Burn] applied by [Infernis] lasts three enemy phases and deals its damage once per enemy phase, starting with the next one. Reapplying it resets the duration to three phases and keeps the higher damage per phase; it never stacks."
    },
    abilities: {
      skill1: ability("Cinder Cleave", "160% direct damage to one enemy, then apply [Burn] dealing 25% of [Infernis]\u2019s Attack per enemy phase for three enemy phases.", 1.6),
      skill2: ability("Flame Arc", "110% direct damage to all enemies. Each surviving enemy carrying [Infernis]\u2019s [Burn] immediately takes the damage of up to two of its remaining [Burn] phases, and those phases are removed. [Burn] applied by other characters is unaffected.", 1.1, "all-enemies"),
      ultimate: ability("Last Flare: Dawnfire", "200% direct damage to all enemies, then apply [Burn] dealing 45% of [Infernis]\u2019s Attack per enemy phase for three enemy phases; an existing stronger [Burn] keeps its higher damage. [Burn] continues during the recovery turn while [Infernis] is alive.", 2, "all-enemies")
    }
  },
  tide: {
    role: "Precise barrier protector",
    playLoop: "[Tizu] places a short-lived shield on one chosen ally before the next enemy attack.",
    passive: {
      name: "Stillwater Guard",
      description: "When a shield from [Tizu]\u2019s abilities fully absorbs an enemy\u2019s direct hit so that no HP is lost, the shielded ally gains 8 [Elemental Gauge]."
    },
    abilities: {
      skill1: { ...ability("Undertow Thrust", "150% direct damage to one enemy and apply 25% [Weaken] for the next enemy phase. [Weaken] reduces the direct damage that enemy deals.", 1.5), strength: { damageMultiplier: 1.5, weakenFraction: 0.25 } },
      skill2: ability("Tidal Shelter", `Choose one living ally. It gains a shield worth ${nativeBalance.tizu.shelter * 100}% of its maximum HP until the next enemy phase ends. Recasting replaces the shield.`, void 0, "one-ally"),
      ultimate: ability("Last Flare: Ocean Memory", `All living allies gain a shield worth ${nativeBalance.tizu.oceanMemory * 100}% of their maximum HP until the second enemy phase ends. The first direct hit each ally takes while this shield remains is reduced by 30% before the shield absorbs it.`, void 0, "all-allies")
    }
  },
  sprout: {
    role: "Delayed recovery gardener",
    playLoop: "[Flora] plants [Seed] healing that restores HP at the start of the next player turn, or harvests it immediately with [Verdant Renewal].",
    passive: {
      name: "Root of Hope",
      description: `Each living ally can hold one [Seed]. At the start of the next player turn, a [Seed] restores ${nativeBalance.flora.seed * 100}% of its holder\u2019s maximum HP and disappears, as long as [Flora] is alive. A [Seed] never stacks or revives. Planting a new [Seed] replaces the old one and resets its timing.`
    },
    abilities: {
      skill1: ability("Briar Shot", "140% direct damage to one enemy, then plant a [Seed] on the living ally with the lowest HP percentage; ties go to the earlier squad position.", 1.4),
      skill2: ability("Verdant Renewal", `Every existing [Seed] immediately heals its holder (${nativeBalance.flora.seed * 100}% of maximum HP, or ${nativeBalance.flora.empoweredSeed * 100}% for an [Empowered Seed]) and is removed. Then every living ally receives a new [Seed]. With no existing [Seed], the harvest heals nothing. A new [Seed] never replaces a pending [Empowered Seed].`, void 0, "all-allies"),
      ultimate: ability("Last Flare: Worldseed", `Every living ally immediately heals ${nativeBalance.flora.immediateHeal * 100}% of its maximum HP, then receives an [Empowered Seed] that restores ${nativeBalance.flora.empoweredSeed * 100}% at the start of the next player turn while [Flora] is alive.`, void 0, "all-allies")
    }
  },
  atmoso: {
    role: "Delayed wind-field attacker",
    playLoop: "[Cyclone Weave] creates a [Cyclone] that grows as allies act and later releases on all enemies; [Razor Gale] can release it early.",
    passive: {
      name: "Gale Cadence",
      description: "While a [Cyclone] is active, the first action each other living ally takes in a player turn ([Normal Attack] or any skill) adds one [Gust]."
    },
    abilities: {
      skill1: ability("Razor Gale", "180% direct damage to one enemy. If a [Cyclone] exists, it releases immediately on all living enemies and ends.", 1.8),
      skill2: ability("Cyclone Weave", "Release any existing [Cyclone], then create a new [Cyclone] with 0 [Gust] lasting two enemy phases. When the second enemy phase ends, it releases on all living enemies. A [Cyclone] release deals 70% of [Atmoso]\u2019s Attack plus 30% per [Gust] and cannot critically hit. [Gust] never carries over to a new [Cyclone]. [Atmoso] must be alive for a release.", void 0, "all-enemies"),
      ultimate: ability("Last Flare: Sky Without End", "Release any active [Cyclone] at its current [Gust] count, then deal 200% direct damage to all enemies.", 2, "all-enemies")
    }
  },
  elise: {
    role: "Two-shuriken placement duelist",
    playLoop: "[Elise] lodges two [Shuriken] in enemies, then recalls them for extra strikes.",
    passive: {
      name: "Stormwheel Rhythm",
      description: "[Elise] has exactly two [Shuriken], both held at the start of battle. Each is either held or lodged in one living enemy. A lodged [Shuriken] returns to her when its enemy is defeated, without dealing damage."
    },
    abilities: {
      skill1: ability("Voltstar Cut", "Throw one held [Shuriken] for 110% direct damage to the selected enemy; it lodges in that enemy. With no [Shuriken] held, deal 140% direct damage instead and neither [Shuriken] moves. Both [Shuriken] can lodge in the same enemy.", 1.1),
      skill2: ability("Crosscurrent Volley", "Recall every lodged [Shuriken]: each strikes its enemy for 90% of [Elise]\u2019s Attack and cannot critically hit. If both were in the same enemy, it takes one extra 60% strike. If both [Shuriken] are already held, deal 140% direct damage to the selected enemy instead. Recalled strikes generate no Gauge.", 1.4),
      ultimate: ability("Last Flare: Infinite Thunderwheel", "Recall every lodged [Shuriken] using the same 90% strikes and 60% same-enemy strike, then deal 260% direct damage to the selected enemy. Both [Shuriken] return to [Elise] afterward.", 2.6)
    }
  },
  bliss: {
    role: "Action-order dancer",
    playLoop: "[Bliss]\u2019s skills change with when she acts in the player turn: acting first adds offense, acting last adds healing and shields. When she is the only living ally, she always counts as acting first.",
    passive: {
      name: "Stillfeather Tempo",
      description: "Each action is [Opening] if no other living ally has acted this player turn, [Closing] if every other living ally has acted, and [Passing] otherwise. When [Bliss] is the only living ally, every action is [Opening]."
    },
    abilities: {
      skill1: ability("Warfeather Cut", "170% direct damage to one enemy. [Opening]: +25 percentage points Critical Rate for this attack. [Closing]: heal the most injured other living ally for 6% of its maximum HP. [Passing]: no bonus.", 1.7),
      skill2: ability("Quietstorm Flourish", "120% direct damage to all enemies. [Opening]: living allies deal 10% more direct damage until this player turn ends. [Closing]: all living allies gain a shield worth 6% of their maximum HP until the next enemy phase ends. [Passing]: no bonus.", 1.2, "all-enemies"),
      ultimate: ability("Last Flare: Thousandfeather Stillness", "250% direct damage to all enemies. [Opening]: +30 percentage points Critical Rate for this attack. [Closing]: heal other living allies for 10% of their maximum HP. [Passing]: no bonus.", 2.5, "all-enemies")
    }
  },
  bruno: {
    role: "Deliberate damage interceptor",
    playLoop: "[Bruno] places [Cover] on allies and takes part of the damage they receive.",
    passive: {
      name: "Faultbound Resolve",
      description: "Damage redirected to [Bruno] by [Cover] is reduced by 25%."
    },
    abilities: {
      skill1: ability("Seismic Hammerfall", "190% direct damage to one enemy.", 1.9),
      skill2: ability("Citadel Mantle", "Place [Cover] on another living ally until the next enemy phase ends: 50% of the direct damage it takes, after Defense, is redirected to [Bruno]. Only one ally can hold this [Cover]; recasting moves it. If [Bruno] is the only living ally, he instead takes 20% less direct damage for that phase. Redirected damage cannot be redirected again.", void 0, "one-ally", true),
      ultimate: ability("Last Flare: Worldwall Ascendant", "Place [Cover] on every other living ally for two enemy phases, redirecting 40% of each direct hit to [Bruno]; this replaces single-ally [Cover]. [Bruno] gains a shield worth 20% of his maximum HP for the same duration.", void 0, "all-allies")
    }
  },
  disciple: {
    role: "Conditional ally instructor",
    playLoop: "[Disciple] gives one ally an [Instruction] ([Strike], [Shelter] or [Resolve]) that strengthens its next matching action.",
    passive: {
      name: "Shared Mindflame",
      description: "[Disciple] maintains one [Instruction] on one living ally, which can be [Disciple]. The ally\u2019s next action of any kind ([Normal Attack] or a skill) uses it up; otherwise it expires at the end of the next player turn. Giving a new [Instruction] replaces the old one. A new [Instruction] takes effect after the action that granted it."
    },
    abilities: {
      skill1: ability("Thoughtspark Benediction", "Give one living ally [Strike]: its next action that deals damage deals 30% more direct damage. If its next action deals no damage, [Strike] is used up with no effect.", void 0, "one-ally"),
      skill2: ability("Concord of Chaos", "Give one living ally [Shelter]: if its next action heals or shields, that healing or shielding is 35% larger. If its next action only deals damage, [Shelter] is used up with no effect. Healing and shields created by Conduits are not increased.", void 0, "one-ally"),
      ultimate: ability("Last Flare: Unbound Mindcrown", "Give [Resolve] to all living allies, replacing their current [Instruction]. Each ally\u2019s next action gains [Strike] (30% more direct damage), [Shelter] (35% more healing and shields) or both, matching what that action does. [Resolve] expires at the end of the next player turn.", void 0, "all-allies")
    }
  },
  aurora: {
    role: "Hostile skill forecaster",
    playLoop: "[Aurora] reveals when each enemy\u2019s next special skill is due; [Seal] and [Last Flare: Final Dawn Verdict] reduce its damage.",
    passive: {
      name: "Lens of Diminishment",
      description: "The battle menu shows each living enemy\u2019s next scheduled special skill or ultimate and the enemy phase it is due, or states that none is scheduled."
    },
    abilities: {
      skill1: ability("Gleamseal", "Place a [Seal] on one enemy: its next scheduled special skill or ultimate within three enemy phases deals 40% less direct damage, then the [Seal] ends. Its [Normal Attack] does not use the [Seal]. Recasting resets the duration and keeps the stronger [Seal]; it never stacks."),
      skill2: ability("Eclipse Mandate", "100% direct damage to all enemies, then place a 25% [Seal] on each survivor, following the same rules as [Gleamseal].", 1, "all-enemies"),
      ultimate: ability("Last Flare: Final Dawn Verdict", "For two enemy phases, all living allies take 50% less direct damage from enemy ultimates. Enemy [Normal Attack] and other skills are unaffected.", void 0, "all-allies")
    }
  },
  razor: {
    role: "Wounds-powered revenge duelist",
    playLoop: "[Razor] stores HP lost to enemy attacks as [Wounds], then spends them for extra damage.",
    passive: {
      name: "Unbroken Night",
      description: "HP [Razor] loses to direct enemy hits is stored as [Wounds]. Damage absorbed by shields, damage redirected to him, [Burn], HP he pays himself and Conduit effects add no [Wounds]. Healing does not remove [Wounds]."
    },
    abilities: {
      skill1: ability("Nightcleave", "160% direct damage to one enemy, then spend all [Wounds] for an extra strike that uses the spent amount as its Attack, is reduced by Defense and cannot critically hit. With no [Wounds], only the first hit occurs.", 1.6),
      skill2: ability("Eclipse Bastion", "[Razor] takes 30% less direct damage during the next enemy phase. If he lost HP to direct hits during that phase, he then gains a shield equal to that HP through the following enemy phase."),
      ultimate: ability("Last Flare: Unbroken Midnight", "220% direct damage to one enemy, then spend all [Wounds] for an extra strike that uses twice the spent amount as its Attack, is reduced by Defense and cannot critically hit.", 2.2)
    }
  },
  rosetta: {
    role: "Coordinated quarry hunter",
    playLoop: "[Rosetta] marks a [Quarry]; when different allies hit it in the same player turn, her abilities gain bonuses.",
    passive: {
      name: "Virtuous Bloom",
      description: "[Rosetta] can have one [Quarry]. Each player turn, the different living allies whose attacks hit it directly are counted. Each direct hit on it after two different allies have hit it that player turn gives each of those allies a shield worth 8% of their maximum HP."
    },
    abilities: {
      skill1: ability("Golden Thorn Volley", "160% direct damage to one enemy and mark it as [Quarry] until it is defeated or [Rosetta] marks another enemy. This hit counts as her contribution. Marking the same enemy again keeps this turn\u2019s count; marking a different enemy resets it.", 1.6),
      skill2: ability("Crimson Skyfall", "200% direct damage to a living [Quarry], plus 25% for each other ally who hit it this player turn. With no living [Quarry], deal 160% direct damage to the selected enemy. Does not mark a [Quarry].", 2),
      ultimate: ability("Last Flare: Rose Beyond the Sun", "300% direct damage to the [Quarry], or to the selected enemy if there is none. If at least two different allies hit the [Quarry] this player turn, those allies heal 10% of their maximum HP; other allies are not healed.", 3)
    }
  },
  thornia: {
    role: "Enemy-action thorn trapper",
    playLoop: "[Thornia] places a [Thorn Trap] that strikes an enemy whenever it attacks; [Shadow Rose Cleave] can spend a charge for immediate damage.",
    passive: {
      name: "Forbidden Garden",
      description: "Each enemy can hold one [Thorn Trap] from [Thornia], with up to three charges. When that enemy finishes an action that deals direct damage to any ally, one charge is spent for a strike of 60% of [Thornia]\u2019s Attack that cannot critically hit. This happens once per enemy action, however many allies it hits. Damage absorbed by shields still counts; actions that deal no damage do not."
    },
    abilities: {
      skill1: ability("Gilded Thorn Guard", "Place a [Thorn Trap] with three charges on the selected enemy for three enemy phases. Recasting resets it to three charges and three enemy phases and never adds more. Recasting on an [Empowered Thorn Trap] keeps it empowered."),
      skill2: ability("Shadow Rose Cleave", "170% direct damage to one enemy. If it has a [Thorn Trap], spend one charge for an extra strike of 80% of [Thornia]\u2019s Attack that cannot critically hit.", 1.7),
      ultimate: ability("Last Flare: Thousand-Rose Dominion", "140% direct damage to all enemies, then place an [Empowered Thorn Trap] with three charges on each survivor for three enemy phases. Its strikes deal 90% of [Thornia]\u2019s Attack and cannot critically hit.", 1.4, "all-enemies")
    }
  },
  crinso: {
    role: "Alternating-edge combo duelist",
    playLoop: "Alternating [Golden Edge] and [Crimson Rupture] builds [Combo]; [Last Flare: Blossoming Cataclysm] spends it.",
    passive: {
      name: "Rose Duality",
      description: "Using [Golden Edge] after [Crimson Rupture], or [Crimson Rupture] after [Golden Edge], adds 1 [Combo]. Using the same one of these two skills twice in a row resets [Combo] to 0. When there is no previous skill to compare (the first use, or after [Last Flare: Blossoming Cataclysm]), the skill starts a new chain at 0 [Combo]. [Normal Attack] does not affect the chain."
    },
    abilities: {
      skill1: ability("Golden Edge", "160% direct damage to one enemy. If [Crinso]\u2019s previous skill was [Crimson Rupture], this attack ignores 20% of the target\u2019s Defense. Then updates [Combo] as described in [Rose Duality].", 1.6),
      skill2: ability("Crimson Rupture", "200% direct damage to one enemy, increased by 40% (240% total) if [Crinso]\u2019s previous skill was [Golden Edge]. Then updates [Combo] as described in [Rose Duality].", 2),
      ultimate: ability("Last Flare: Blossoming Cataclysm", "260% direct damage to one enemy plus 45% per [Combo]. At 3 or more [Combo], the attack also ignores 30% of the target\u2019s Defense. Uses up all [Combo] and ends the chain, so the next [Golden Edge] or [Crimson Rupture] starts a new one.", 2.6)
    }
  },
  nerithe: {
    role: "Survey and precision-pierce attacker",
    playLoop: "[Nerithe]\u2019s [Normal Attack] adds [Survey] points to an enemy; her skills spend them to ignore part of its Defense.",
    passive: {
      name: "Uncharted Current",
      description: "[Nerithe]\u2019s [Normal Attack] gains 5 extra [Elemental Gauge] and adds 1 [Survey] point to its target. Only one enemy can hold [Survey]; surveying another enemy removes the old points. [Survey] disappears when its enemy is defeated."
    },
    abilities: {
      skill1: ability("Meridian Break", "180% direct damage to the enemy holding [Survey], or the selected enemy if none does. Spends 1 [Survey] point, if any, to ignore 25% of the target\u2019s Defense.", 1.8),
      skill2: ability("Fold the Sea", "If an enemy holds [Survey], move it and all its points to the selected living enemy. Then deal 130% direct damage to all enemies.", 1.3, "all-enemies"),
      ultimate: ability("Ocean Beyond the Map", "280% direct damage to the enemy holding [Survey], or the selected enemy if none does. Uses up all [Survey] points; each ignores 15% of the target\u2019s Defense.", 2.8)
    }
  },
  orvella: {
    role: "Finite-durability team architect",
    playLoop: "[Orvella] raises a shared [Foundation] that absorbs damage for the squad until its durability runs out; it can be repaired or spent for damage.",
    passive: {
      name: "Load-Bearing Will",
      description: "Only one [Foundation] can exist. While it has durability, it absorbs up to 20% of each direct hit on a living ally (after Defense), before that ally\u2019s shields, and loses durability equal to the amount absorbed. When one attack hits several allies at once, the absorbed amount is shared proportionally."
    },
    abilities: {
      skill1: ability("Keystone Reversal", "140% direct damage to one enemy, then repair the [Foundation] by 8% of [Orvella]\u2019s maximum HP. With no [Foundation], deal 180% direct damage instead. Never creates a [Foundation].", 1.4),
      skill2: ability("Raise the Faultline", "Create a [Foundation] with durability equal to 30% of [Orvella]\u2019s maximum HP for three enemy phases. Recasting replaces it at full durability; it never stacks.", void 0, "all-allies"),
      ultimate: ability("Worldweight Citadel", "200% direct damage to all enemies. An existing [Foundation] is used up for an extra strike on each enemy that uses its remaining durability as Attack, is reduced by Defense and cannot critically hit.", 2, "all-enemies")
    }
  },
  vaelor: {
    role: "Deterministic three-beat burst attacker",
    playLoop: "[Vaelor]\u2019s skills change with a repeating three-step [Beat]; [Crescendo] strengthens [Last Chord of the Sky].",
    passive: {
      name: "Standing Thunder",
      description: "The [Beat] cycles [Tune] \u2192 [Rise] \u2192 [Crescendo] \u2192 [Tune], moving one step every player turn, even when [Vaelor] is recovering or cannot act. Each battle starts on [Tune]."
    },
    abilities: {
      skill1: ability("Forked Cadence", "170% direct damage to one enemy. On [Tune], +30 percentage points Critical Rate for this attack.", 1.7),
      skill2: ability("Resonance Cascade", "120% direct damage to all enemies. On [Rise], [Vaelor] deals 20% more direct damage until the end of his next player turn; recasting refreshes it and it never stacks.", 1.2, "all-enemies"),
      ultimate: ability("Last Chord of the Sky", "260% direct damage to all enemies, or 340% on [Crescendo]. Usable on any [Beat]. After a cast on [Crescendo], the recovery turn falls on the following [Tune].", 2.6, "all-enemies")
    }
  }
};
var directDescriptionCoefficients = {
  ember: [[160], [110], [200]],
  tide: [[150], [], []],
  sprout: [[140], [], []],
  atmoso: [[180], [], [200]],
  elise: [[110, 140], [140], [260]],
  bliss: [[170], [120], [250]],
  bruno: [[190], [], []],
  disciple: [[], [], []],
  aurora: [[], [100], []],
  razor: [[160], [], [220]],
  rosetta: [[160], [200, 25, 250, 160], [300]],
  thornia: [[], [170], [140]],
  crinso: [[160], [200, 40, 240], [260, 45, 395]],
  nerithe: [[180], [130], [280]],
  orvella: [[140, 180], [], [200]],
  vaelor: [[170], [120], [260, 340]]
};
for (const id of Object.keys(nativeIdentities)) {
  for (const [index, action] of ["skill1", "skill2", "ultimate"].entries()) {
    const definition = nativeIdentities[id].abilities[action];
    if (definition.strength.damageMultiplier !== void 0) definition.strength.damageMultiplier *= nativeBalance.skillDamageScale;
    const coefficients = directDescriptionCoefficients[id][index];
    definition.description = definition.description.replace(/(\d+(?:\.\d+)?)%/g, (text2, amount) => coefficients.includes(Number(amount)) ? `${Number(amount) * nativeBalance.skillDamageScale}%` : text2);
  }
}
var nativeIdentityIds = Object.keys(nativeIdentities);

// src/content/combat.ts
var actionIds = ["light", "skill1", "skill2", "ultimate"];
function basicActionName(id, action) {
  return isWarCharacter(id) ? warActionNames[id][action] : "Normal Attack";
}
var shatterGauge = {
  maximum: 100,
  starting: 0,
  incomingHit: 10,
  gains: { light: 20, skill1: 0, skill2: 0, ultimate: 0 },
  costs: { light: 0, skill1: 25, skill2: 40, ultimate: 100 }
};
var fighters = {
  ...flagshipFighters,
  ...warFighters,
  ember: {
    pilot: "ember",
    stats: { health: 220, defense: 10, damage: 38, crit: 0.15, shatterCapacity: 100, critMultiplier: 1.5, elementalDamage: 8 },
    passive: { name: "Unbroken Ember", description: "+20% outgoing damage at or below 50% health.", damageBonus: 0.2, defenseBonus: 0, healFraction: 0 },
    abilities: {
      skill1: { name: "Cinder Cleave", description: "160% damage to one enemy; burn for 8 damage on its next two enemy phases.", cooldown: 0, strength: { damageMultiplier: 1.6, burnMultiplier: 1 } },
      skill2: { name: "Flame Arc", description: `110% damage to every living enemy. ${kitPilotDescriptions.ember.skill2}`, cooldown: 0, strength: { damageMultiplier: 1.1 } },
      ultimate: { name: "Last Flare: Dawnfire", description: `280% damage to every enemy; burn surviving targets for 6 damage on their next two enemy phases. Recover next turn. ${kitPilotDescriptions.ember.ultimate}`, cooldown: 0, strength: { damageMultiplier: 2.8, burnMultiplier: 0.75 } }
    }
  },
  tide: {
    pilot: "ward",
    stats: { health: 260, defense: 16, damage: 30, crit: 0.1, shatterCapacity: 100, critMultiplier: 1.5, elementalDamage: 0 },
    passive: { name: "Stillwater Guard", description: "+8 defense, already included in displayed effective defense.", damageBonus: 0, defenseBonus: 8, healFraction: 0 },
    abilities: {
      skill1: { name: "Undertow Thrust", description: `150% damage to one enemy; reduce its next two enemy-phase attacks by 25%. ${kitPilotDescriptions.ward.skill1}`, cooldown: 0, strength: { damageMultiplier: 1.5, weakenFraction: 0.25 } },
      skill2: { name: "Tidal Shelter", description: "Give every living ally 25 shield (refresh to at least 25; does not stack).", cooldown: 0, strength: { shield: 25 } },
      ultimate: { name: "Last Flare: Ocean Memory", description: `220% damage to all enemies and 35 shield for allies. Recover next turn. ${kitPilotDescriptions.ward.ultimate}`, cooldown: 0, strength: { damageMultiplier: 2.2, shield: 35 } }
    }
  },
  sprout: {
    pilot: "bloom",
    stats: { health: 190, defense: 8, damage: 32, crit: 0.2, shatterCapacity: 100, critMultiplier: 1.5, elementalDamage: 0 },
    passive: { name: "Root of Hope", description: "At each new player turn, heal living allies by 5% of their maximum health while Flora lives.", damageBonus: 0, defenseBonus: 0, healFraction: 0.05 },
    abilities: {
      skill1: { name: "Briar Shot", description: `150% damage to one enemy with +20 percentage points critical chance. Spends all ${elementalEffectFamilies.bloom.label} charges for +10% outgoing damage per charge.`, cooldown: 0, strength: { damageMultiplier: 1.5, critBonus: 0.2 } },
      skill2: { name: "Verdant Renewal", description: "Restore 30 health to every living ally; cannot revive. Increase living allies' outgoing attack damage by 10% this and next player turn (refresh; does not stack).", cooldown: 0, strength: { healing: 30, attackBoostFraction: 0.1 } },
      ultimate: { name: "Last Flare: Worldseed", description: `180% damage to all enemies and heal living allies by 55. Recover next turn. Spends all ${elementalEffectFamilies.bloom.label} charges for +15% healing from this ability per charge.`, cooldown: 0, strength: { damageMultiplier: 1.8, healing: 55 } }
    }
  },
  rosetta: {
    pilot: "rose-grace",
    stats: { health: 225, defense: 11, damage: 43, crit: 0.2, shatterCapacity: 100, critMultiplier: 1.6, elementalDamage: 0 },
    passive: { name: "Virtuous Bloom", description: "At each new player turn, heal living allies by 2% of maximum health while Rosetta lives.", damageBonus: 0, defenseBonus: 0, healFraction: 0.02 },
    abilities: {
      skill1: { name: "Golden Thorn Volley", description: "170% damage to one enemy; reduce surviving targets' attacks by 20% for two enemy phases.", cooldown: 0, strength: { damageMultiplier: 1.7, weakenFraction: 0.2 } },
      skill2: { name: "Crimson Skyfall", description: "120% damage to every living enemy; weaken by 15% for two enemy phases.", cooldown: 0, targets: "all-enemies", strength: { damageMultiplier: 1.2, weakenFraction: 0.15 } },
      ultimate: { name: "Last Flare: Rose Beyond the Sun", description: "300% damage to every living enemy; weaken by 30% for two enemy phases. Recover next turn.", cooldown: 0, targets: "all-enemies", strength: { damageMultiplier: 3, weakenFraction: 0.3 } }
    }
  },
  thornia: {
    pilot: "thorn-aegis",
    stats: { health: 280, defense: 17, damage: 31, crit: 0.1, shatterCapacity: 100, critMultiplier: 1.5, elementalDamage: 0 },
    passive: { name: "Forbidden Garden", description: "+9 defense, included in effective defense.", damageBonus: 0, defenseBonus: 9, healFraction: 0 },
    abilities: {
      skill1: { name: "Gilded Thorn Guard", description: "Give every living ally 30 shield (refresh; does not stack).", cooldown: 0, targets: "all-allies", strength: { shield: 30 } },
      skill2: { name: "Shadow Rose Cleave", description: "180% damage to one enemy; weaken by 20% for two enemy phases.", cooldown: 0, strength: { damageMultiplier: 1.8, weakenFraction: 0.2 } },
      ultimate: { name: "Last Flare: Thousand-Rose Dominion", description: "240% damage to all enemies and 40 shield for allies. Recover next turn.", cooldown: 0, targets: "all-enemies", strength: { damageMultiplier: 2.4, shield: 40 } }
    }
  },
  crinso: {
    pilot: "rose-duality",
    stats: { health: 205, defense: 9, damage: 41, crit: 0.25, shatterCapacity: 100, critMultiplier: 1.7, elementalDamage: 9 },
    passive: { name: "Rose Duality", description: "+15% outgoing damage at or below 50% health.", damageBonus: 0.15, defenseBonus: 0, healFraction: 0 },
    abilities: {
      skill1: { name: "Golden Edge", description: "180% damage to one enemy with +15 percentage points critical chance.", cooldown: 0, strength: { damageMultiplier: 1.8, critBonus: 0.15 } },
      skill2: { name: "Crimson Rupture", description: "120% damage to every living enemy; burn for 9 on two enemy phases.", cooldown: 0, targets: "all-enemies", strength: { damageMultiplier: 1.2, burnMultiplier: 1 } },
      ultimate: { name: "Last Flare: Blossoming Cataclysm", description: "310% damage to every living enemy; burn for 14 on two enemy phases. Recover next turn.", cooldown: 0, targets: "all-enemies", strength: { damageMultiplier: 3.1, burnMultiplier: 1.5 } }
    }
  }
};
for (const id of Object.keys(fighters)) {
  const identity = nativeIdentities[id];
  const kit = fighters[id];
  delete kit.pilot;
  kit.nativeIdentity = true;
  kit.passive = {
    ...identity.passive,
    damageBonus: 0,
    defenseBonus: 0,
    healFraction: 0,
    ...id === "nerithe" ? { lightGaugeBonus: 5 } : {}
  };
  kit.abilities = structuredClone(identity.abilities);
}
var enemyIds = ["goblin", "imp", "golem"];
var enemies = {
  goblin: { name: "Goblin", art: "goblin", element: "botanic", stats: { health: 110, defense: 5, damage: 23, crit: 0.1, shatterCapacity: 100, critMultiplier: 1.5, elementalDamage: 0 } },
  imp: { name: "Imp", art: "imp", element: "infernic", stats: { health: 90, defense: 3, damage: 28, crit: 0.15, shatterCapacity: 100, critMultiplier: 1.5, elementalDamage: 0 } },
  golem: { name: "Rock Golem", art: "rock-golem", element: "botanic", stats: { health: 160, defense: 15, damage: 20, crit: 0.05, shatterCapacity: 100, critMultiplier: 1.5, elementalDamage: 0 } }
};
function formatStat(value2) {
  return String(Number(value2.toFixed(2)));
}
function resolveFighter(id, progress, equipment, upgrades) {
  const base = fighters[id];
  if (!base) throw new Error("Unknown fighter definition.");
  const factor = progress ? characterGrowthFactor(progress) : 1;
  const potency = progress ? characterPotencyFactor(progress) : 1;
  const kit = structuredClone(base);
  for (const key of ["health", "damage", "elementalDamage"]) {
    kit.stats[key] = base.stats[key] * factor;
  }
  kit.stats.defense = (base.stats.defense + base.passive.defenseBonus) * factor ** 0.7;
  kit.stats.damage *= 1 + (progress?.weaponRank ?? 0) * weaponRules.attackPerRank;
  kit.stats.crit = Math.min(1, base.stats.crit * potency);
  kit.stats.critMultiplier = base.stats.critMultiplier * potency;
  kit.stats.shatterCapacity = base.stats.shatterCapacity * potency;
  kit.passive.defenseBonus *= factor ** 0.7;
  kit.passive.damageBonus = base.passive.damageBonus * potency;
  kit.passive.healFraction = base.passive.healFraction * potency;
  for (const action of ["skill1", "skill2", "ultimate"]) {
    if (kit.nativeIdentity) continue;
    const strength = kit.abilities[action].strength;
    for (const key of ["damageMultiplier", "burnMultiplier", "weakenFraction", "critBonus", "shield", "healing", "attackBoostFraction"]) {
      const value2 = strength[key];
      if (value2 !== void 0) strength[key] = value2 * (key === "shield" || key === "healing" ? factor : potency);
    }
    if (strength.weakenFraction !== void 0) strength.weakenFraction = Math.min(1, strength.weakenFraction);
    if (strength.critBonus !== void 0) strength.critBonus = Math.min(1, strength.critBonus);
  }
  if (equipment) validateConduitElement(equipment, getStarter(id).elementId);
  applyConduitBuffs(kit.stats, equipment, upgrades);
  return describeFighter(id, kit);
}
function describeFighter(id, snapshot) {
  const kit = structuredClone(snapshot);
  if (kit.nativeIdentity) {
    const identity = nativeIdentities[id];
    kit.passive.description = identity.passive.description;
    for (const action of ["skill1", "skill2", "ultimate"]) {
      kit.abilities[action].description = identity.abilities[action].description;
    }
    kit.abilities.ultimate.description += " Recovery: caster skips the next player turn.";
    return kit;
  }
  const pct = (value3) => formatStat(value3 * 100);
  const value2 = (action, key) => {
    const amount = kit.abilities[action].strength[key];
    if (amount === void 0) throw new Error(`Missing ${id} ${action} strength: ${key}.`);
    return amount;
  };
  if (id === "ember") {
    kit.passive.description = `+${pct(kit.passive.damageBonus)}% outgoing damage at or below 50% health.`;
    kit.abilities.skill1.description = `${pct(value2("skill1", "damageMultiplier"))}% damage to one enemy; burn for ${Math.round(kit.stats.elementalDamage * value2("skill1", "burnMultiplier"))} damage on its next two enemy phases.`;
    kit.abilities.skill2.description = `${pct(value2("skill2", "damageMultiplier"))}% damage to every living enemy.`;
    kit.abilities.ultimate.description = `${pct(value2("ultimate", "damageMultiplier"))}% damage to every enemy; burn surviving targets for ${Math.round(kit.stats.elementalDamage * value2("ultimate", "burnMultiplier"))} damage on their next two enemy phases.`;
  } else if (id === "tide") {
    kit.passive.description = `+${formatStat(kit.passive.defenseBonus)} defense, already included in displayed effective defense.`;
    kit.abilities.skill1.description = `${pct(value2("skill1", "damageMultiplier"))}% damage to one enemy; reduce its next two enemy-phase attacks by ${pct(value2("skill1", "weakenFraction"))}%.`;
    kit.abilities.skill2.description = `Give every living ally ${formatStat(value2("skill2", "shield"))} shield points.`;
    kit.abilities.ultimate.description = `${pct(value2("ultimate", "damageMultiplier"))}% damage to all enemies and ${formatStat(value2("ultimate", "shield"))} shield points for every living ally.`;
  } else if (id === "sprout") {
    kit.passive.description = `At each new player turn, heal living allies by ${pct(kit.passive.healFraction)}% of their maximum health while Flora lives.`;
    kit.abilities.skill1.description = `${pct(value2("skill1", "damageMultiplier"))}% damage to one enemy with +${pct(value2("skill1", "critBonus"))} percentage points critical chance.`;
    kit.abilities.skill2.description = `Restore ${formatStat(value2("skill2", "healing"))} health to every living ally; cannot revive. Increase living allies' outgoing attack damage by ${pct(value2("skill2", "attackBoostFraction"))}% this and next player turn (refresh; does not stack).`;
    kit.abilities.ultimate.description = `${pct(value2("ultimate", "damageMultiplier"))}% damage to all enemies and restore ${formatStat(value2("ultimate", "healing"))} HP to every living ally; cannot revive.`;
  } else {
    kit.passive.description = kit.passive.lightGaugeBonus !== void 0 ? `Normal Attack gains ${formatStat(kit.passive.lightGaugeBonus)} additional Elemental Gauge, capped by Elemental Gauge capacity.` : kit.passive.healFraction > 0 ? `At each new player turn, heal living allies by ${pct(kit.passive.healFraction)}% of maximum health while this Element-Bearer lives.` : kit.passive.defenseBonus > 0 ? `+${formatStat(kit.passive.defenseBonus)} defense, included in effective defense.` : `+${pct(kit.passive.damageBonus)}% outgoing damage at or below 50% health.`;
    for (const action of ["skill1", "skill2", "ultimate"]) {
      const ability2 = kit.abilities[action];
      const strength = ability2.strength;
      const effects = [];
      if (strength.damageMultiplier !== void 0) effects.push(`${pct(strength.damageMultiplier)}% damage to ${ability2.targets === "all-enemies" ? "every living enemy" : "one enemy"}`);
      if (strength.weakenFraction !== void 0) effects.push(`reduce surviving targets' next two enemy-phase attacks by ${pct(strength.weakenFraction)}%`);
      if (strength.critBonus !== void 0) effects.push(`+${pct(strength.critBonus)} percentage points critical chance`);
      if (strength.burnMultiplier !== void 0) effects.push(`burn surviving targets for ${Math.round(kit.stats.elementalDamage * strength.burnMultiplier)} damage on their next two enemy phases`);
      if (strength.shield !== void 0) effects.push(`give every living ally ${formatStat(strength.shield)} shield points`);
      if (strength.healing !== void 0) effects.push(`restore ${formatStat(strength.healing)} health to every living ally; cannot revive`);
      if (strength.attackBoostFraction !== void 0) effects.push(`increase living allies' outgoing attack damage by ${pct(strength.attackBoostFraction)}% this and next player turn (refresh; does not stack)`);
      ability2.description = `${effects.join("; ")}.`;
    }
  }
  if (kit.pilot) {
    const descriptions = kitPilotDescriptions[kit.pilot];
    kit.passive.description += ` ${descriptions.passive}`;
    for (const action of ["skill1", "skill2", "ultimate"]) {
      if (descriptions[action]) kit.abilities[action].description += ` ${descriptions[action]}`;
    }
    if (id === "bliss") kit.passive.description += " Bliss must heal another living ally to gain a charge; self-healing does not count.";
  }
  const intrinsicActionCopy = {
    sprout: {
      skill1: `Spends all ${elementalEffectFamilies.bloom.label} charges for +10% outgoing damage per charge.`,
      ultimate: `Spends all ${elementalEffectFamilies.bloom.label} charges for +15% healing from this ability per charge; spent before healing, once for the whole activation.`
    },
    bliss: {
      skill1: `Spends all ${elementalEffectFamilies.bloom.label} charges for +8% outgoing damage per charge.`,
      ultimate: `Spends all ${elementalEffectFamilies.bloom.label} charges to add a shield worth 5% of this caster's maximum Health per charge; refreshes rather than stacks.`
    },
    atmoso: {
      skill1: `Spends all ${elementalEffectFamilies.tempest.label} charges for +8% outgoing damage per charge.`,
      ultimate: `Spends all ${elementalEffectFamilies.tempest.label} charges for +12% outgoing damage per charge.`
    },
    elise: {
      skill1: `Spends all ${elementalEffectFamilies.tempest.label} charges for +8% outgoing damage per charge.`,
      ultimate: `Spends all ${elementalEffectFamilies.tempest.label} charges for +12% outgoing damage per charge.`
    },
    vaelor: {
      skill2: `Spends all ${elementalEffectFamilies.tempest.label} charges for +8% outgoing damage per charge.`,
      ultimate: `Spends all ${elementalEffectFamilies.tempest.label} charges for +12% outgoing damage per charge.`
    }
  };
  for (const [action, text2] of Object.entries(intrinsicActionCopy[id] ?? {})) {
    kit.abilities[action].description += ` ${text2}`;
  }
  for (const action of ["skill1", "skill2", "ultimate"]) {
    const ability2 = kit.abilities[action];
    if (ability2.strength.shield !== void 0 || id === "bliss" && action === "ultimate") {
      ability2.description += " Shield: absorbs damage before HP; persists until depleted; refreshes to the higher amount.";
    }
    if (ability2.strength.weakenFraction !== void 0) {
      ability2.description += " Weaken: outgoing attack damage reduction; Defense unchanged.";
    }
    if (ability2.strength.critBonus !== void 0) {
      ability2.description += " Critical chance bonus: this attack only.";
    }
    if (ability2.strength.burnMultiplier !== void 0) {
      ability2.description += " Burn ignores Defense and replaces existing Burn.";
    }
    if (action === "ultimate") {
      ability2.description += " Recovery: caster skips the next player turn.";
    }
  }
  return kit;
}
function applyConduitBuffs(stats, equipment, upgrades) {
  if (equipment) for (const conduitId of validateConduitSlots(equipment)) {
    if (conduitId === null) continue;
    for (const buff of conduitBuffs(getConduit(conduitId), upgrades?.[conduitId] ?? 0)) {
      if (buff.kind === "percent") stats[buff.stat] *= 1 + buff.amount / 100;
      else if (buff.kind === "percentage-points") {
        const value2 = stats[buff.stat] + buff.amount / 100;
        stats[buff.stat] = buff.stat === "crit" ? value2 : Math.min(1, Math.max(0, value2));
      } else stats[buff.stat] += buff.amount;
    }
  }
  stats.crit = Math.max(0, stats.crit);
}
function isActionId(value2) {
  return actionIds.some((action) => action === value2);
}

// src/content/stat-growth.ts
var playableGrowth = { perLevel: 0.15, perEvolution: 1.5 };
var enemyExponentialRates = { health: 0.026, damage: 0.024, defense: 0.02 };
var enemyStrengthMultiplier = 1.05;
function hostileStat(base, initialRate, rate, level) {
  return Math.round(base * (1 + initialRate * Math.expm1(rate * (level - 1)) / rate) * enemyStrengthMultiplier);
}
var enemyGrowth = {
  maximumLevel: 120,
  maximumHostileLevel: 185,
  health: hostileStat(83, 0.45, enemyExponentialRates.health, 120),
  bossHealth: hostileStat(207.5, 0.45, enemyExponentialRates.health, 120),
  damage: hostileStat(22, 0.25, enemyExponentialRates.damage, 120),
  bossDamage: hostileStat(27.5, 0.25, enemyExponentialRates.damage, 120),
  defense: hostileStat(4, 0.3, enemyExponentialRates.defense, 120),
  bossDefense: hostileStat(16 / 3, 0.3, enemyExponentialRates.defense, 120)
};
var capturedGrowth = { health: 220, damage: 38, defense: 16 };
function enemyCombatStats(level, boss) {
  if (!Number.isInteger(level) || level < 1 || level > enemyGrowth.maximumHostileLevel) throw new Error("Enemy level must be from 1 to 185.");
  return {
    health: hostileStat(boss ? 207.5 : 83, 0.45, enemyExponentialRates.health, level),
    damage: hostileStat(boss ? 27.5 : 22, 0.25, enemyExponentialRates.damage, level),
    defense: hostileStat(boss ? 16 / 3 : 4, 0.3, enemyExponentialRates.defense, level),
    crit: 0.12,
    critMultiplier: 1.5,
    shatterCapacity: 100,
    elementalDamage: 0
  };
}

// src/content/enemy-skills.ts
function enemyAbilityMultiplier(level) {
  if (!Number.isInteger(level) || level < 1 || level > 140) throw new Error("Enemy level must be from 1 to 140.");
  return 1.2 + (level - 1) * 4e-3;
}
function enemySkills(level, boss, strike, multiplier) {
  if (!Number.isInteger(level) || level < 1 || !strike.trim() || !Number.isFinite(multiplier) || multiplier < 1) {
    throw new Error("Enemy skills require a valid level, name and damage multiplier.");
  }
  const first = { name: strike, multiplier, every: boss ? 2 : 3, action: "skill1" };
  if (level < 50) return [first];
  return [first, {
    name: boss ? `Last Ruin: ${strike}` : `Overdrive: ${strike}`,
    multiplier: boss ? Math.max(2.6, multiplier * 1.65) : multiplier * 1.25,
    every: boss ? 6 : 5,
    action: boss ? "ultimate" : "skill2"
  }];
}
function scheduledEnemySkill(skills, round) {
  if (!Number.isInteger(round) || round < 1) throw new Error("Enemy skill schedule requires a valid turn.");
  return skills.find((skill) => skill.action === "ultimate" && round % skill.every === 0) ?? skills.find((skill) => skill.action === "skill2" && round % skill.every === 0) ?? skills.find((skill) => round % skill.every === 0);
}

// src/content/roses.ts
var roseMaterialNames = ["Seed", "Bud", "Bloom", "Crest", "Heart", "Soul"];
var roseMaterials = materialRarities.map((rarity, tier) => ({
  id: `rosethorn-${rarity.toLowerCase()}`,
  name: `${roseMaterialNames[tier]} of Rosethorn`,
  rarity
}));
var roseSaleQuantities = [1, 2, 3, 4, 5, 6];
var roseMaterialUnlocks = materialRarities.map((rarity) => Math.max(80, materialDropLevel(rarity)));
var roseFinalChances = [1, 0.98, 0.9, 0.8, 0.6, 0.35];
var roseCaptureMaximumLevel = 120;
var roseFormStages = [1, 6, 11, 16, 22, 29];
function roseCaptureAllowed(level) {
  if (!Number.isInteger(level) || level < 80 || level > 140) throw new Error("Roselius enemy level must be from 80 to 140.");
  return level <= roseCaptureMaximumLevel;
}
function roseDuplicateMinimumLevel(creatureId) {
  return creatureId === "infusion:treasury:5" ? 50 : creatureId === "infusion:roses:5" ? 80 : void 0;
}

// src/content/infusions.ts
function isInfusionMode(value2) {
  return [...infusionModes, ...currencyModes, ...eventModes, ...machineModes].some((entry) => entry.id === value2);
}
function infusionElements(mode) {
  if (!isInfusionMode(mode)) throw new Error("Unknown infusion mode.");
  return elements.filter((element) => element.infusion === mode);
}
var specialtyMaterials = [
  { id: "heavens-weapon", name: "Dawnsteel of Judgment", art: "heavens-dawnsteel-of-judgment" },
  { id: "heavens-evolution", name: "Crown of the Scarlet Oath", art: "heavens-crown-scarlet-oath" },
  { id: "heavens-level", name: "Chalice of the Undying Dawn", art: "heavens-chalice-undying-dawn" },
  { id: "abyss-weapon", name: "Voidfang of Ruin", art: "abyss-voidfang-of-ruin" },
  { id: "abyss-evolution", name: "Heart of the Shattered Void", art: "abyss-heart-shattered-void" },
  { id: "abyss-level", name: "Hourglass of Endless Wrath", art: "abyss-hourglass-endless-wrath" }
];
function specialtyId(element, purpose) {
  return `${getElement(element).infusion}-${purpose}`;
}
var infusionEnemies = {
  heavens: [
    ["Dawnthorn Slime", "heavens-dawnthorn-slime"],
    ["Scarlet Benediction, Dawnthorn Slime", "heavens-scarlet-benediction"],
    ["Gilded Reproach, Dawnthorn Slime", "heavens-gilded-reproach"],
    ["Thorns of the First Light, Dawnthorn Slime", "heavens-thorns-first-light"],
    ["Crimson Reckoning, Dawnthorn Slime", "heavens-crimson-reckoning"],
    ["The Dawn Without Mercy, Dawnthorn Slime", "heavens-dawn-without-mercy"]
  ],
  abyss: [
    ["Wraththorn Slime", "abyss-wraththorn-slime"],
    ["Starless Murmur, Wraththorn Slime", "abyss-starless-murmur"],
    ["Ruin's Awakening, Wraththorn Slime", "abyss-ruins-awakening"],
    ["Hunger Beyond the Veil, Wraththorn Slime", "abyss-hunger-beyond-veil"],
    ["Worldfall Reverie, Wraththorn Slime", "abyss-worldfall-reverie"],
    ["The Night Without End, Wraththorn Slime", "abyss-night-without-end"]
  ],
  treasury: [
    ["Gleamstone Slime", "gleamstone-slime"],
    ["Diadem of Daybreak, Gleamstone Slime", "diadem-of-daybreak-gleamstone-slime"],
    ["Scepter of Radiance, Gleamstone Slime", "scepter-of-radiance-gleamstone-slime"],
    ["Regalia of the Sun, Gleamstone Slime", "regalia-of-the-sun-gleamstone-slime"],
    ["Sovereign of the Gilded Vault, Gleamstone Slime", "sovereign-of-the-gilded-vault-gleamstone-slime"],
    ["The Crown Beyond Dawn, Gleamstone Slime", "the-crown-beyond-dawn-gleamstone-slime"]
  ],
  sanctuary: [
    ["Rosethorn Wisp", "rosethorn-wisp"],
    ["Votive of First Bloom, Rosethorn Wisp", "votive-of-first-bloom-rosethorn-wisp"],
    ["Laurel of the Sacred Flame, Rosethorn Wisp", "laurel-of-the-sacred-flame-rosethorn-wisp"],
    ["Seraph of the Rose Pyre, Rosethorn Wisp", "seraph-of-the-rose-pyre-rosethorn-wisp"],
    ["Sovereign of the Hallowed Garden, Rosethorn Wisp", "sovereign-of-the-hallowed-garden-rosethorn-wisp"],
    ["The Flame Beyond Eternity, Rosethorn Wisp", "the-flame-beyond-eternity-rosethorn-wisp"]
  ],
  roses: [
    ["Roselius", "roselius"],
    ["Votive of Golden Thorns, Roselius", "roselius-golden-thorns"],
    ["Knight of the Crimson Bloom, Roselius", "roselius-crimson-bloom"],
    ["Seraph of Passion, Roselius", "roselius-seraph-passion"],
    ["Sovereign of the Living Rose, Roselius", "roselius-living-rose"],
    ["The Garden Beyond Eternity, Roselius", "roselius-garden-eternity"]
  ],
  machines: machineEnemies.map((enemy) => [enemy.name, enemy.art])
};
var infusionEnemyElements = { heavens: "tranquilitic", abyss: "chaotic", treasury: "tranquilitic", sanctuary: "tranquilitic", roses: "tranquilitic", machines: "botanic" };
function infusionEnemyStats(level, boss) {
  if (!Number.isInteger(level) || level < 50 || level > 120) throw new Error("Infusion enemy level must be from 50 to 120.");
  return creatureEnemyStats(level, boss);
}
function treasuryEnemyStats(level, boss) {
  if (!Number.isInteger(level) || level < 50 || level > 120) throw new Error("Treasury Elemental-Devourer level must be from 50 to 120.");
  return creatureEnemyStats(level, boss);
}
var treasurySalePrices = [1e3, 3e3, 1e4, 3e4, 1e5, 3e5];
var sanctuarySalePrices = [
  { fractalis: 100, lycalis: 1 },
  { fractalis: 300, lycalis: 2 },
  { fractalis: 1e3, lycalis: 3 },
  { fractalis: 3e3, lycalis: 5 },
  { fractalis: 1e4, lycalis: 7 },
  { fractalis: 3e4, lycalis: 10 }
];
var choiceSaleQuantities = [1, 2, 3, 4, 5, 6];
function creatureSaleOptions(mode, tier) {
  if (mode === "heavens" || mode === "abyss") {
    if (!Number.isInteger(tier) || tier < 0 || tier > 5) throw new Error("Invalid Elemental-Devourer sale tier.");
    const amount = choiceSaleQuantities[tier];
    return [
      { id: "lycalis", fractalis: 0, lycalis: amount, materials: {} },
      ...["evolution", "level", "weapon"].map((purpose) => ({ id: `${mode}-${purpose}`, fractalis: 0, lycalis: 0, materials: { [`${mode}-${purpose}`]: amount } }))
    ];
  }
  return [{ id: "default", ...creatureSaleValue(mode, tier) }];
}
function creatureSaleValue(mode, tier) {
  if (!Number.isInteger(tier) || tier < 0 || tier > 5) throw new Error("Invalid Elemental-Devourer sale tier.");
  if (mode === "heavens" || mode === "abyss") return { fractalis: 0, lycalis: choiceSaleQuantities[tier], materials: {} };
  if (mode === "treasury") return { fractalis: treasurySalePrices[tier], lycalis: 0, materials: {} };
  if (mode === "sanctuary") return { ...sanctuarySalePrices[tier], materials: {} };
  if (mode === "roses") return { fractalis: 0, lycalis: 0, materials: { [roseMaterials[tier].id]: roseSaleQuantities[tier] } };
  throw new Error("This Elemental-Devourer mode does not support sales.");
}
function sanctuaryEnemyStats(level, boss) {
  if (!Number.isInteger(level) || level < 65 || level > 120) throw new Error("Sanctuary Elemental-Devourer level must be from 65 to 120.");
  return creatureEnemyStats(level, boss);
}
function roseEnemyStats(level, boss) {
  if (!Number.isInteger(level) || level < 80 || level > 140) throw new Error("Roselius enemy level must be from 80 to 140.");
  return creatureEnemyStats(level, boss, 140);
}
function creatureEnemyStats(level, boss, maximumLevel = 120) {
  return enemyCombatStats(Math.min(level, maximumLevel), boss);
}
function capturedEnemyStats(level, maximumLevel = 120) {
  if (!Number.isInteger(level) || level < 10 || level > maximumLevel || !Number.isInteger(maximumLevel) || maximumLevel < 120 || maximumLevel > 140) throw new Error("Invalid captured creature level.");
  const factor = 1 + Math.min(level, 120) * playableGrowth.perLevel;
  return {
    health: capturedGrowth.health * factor,
    damage: capturedGrowth.damage * factor,
    defense: capturedGrowth.defense * factor ** 0.7,
    crit: 0.12,
    critMultiplier: 1.5,
    shatterCapacity: 100,
    elementalDamage: 0
  };
}
var infusionLevelAnchors = [[1, 50], [13, 65], [19, 75], [25, 85], [35, 120]];
var infusionAnchorStages = 35;
function infusionEnemyLevel(stage) {
  const stages = infusionModeStageCount;
  if (!Number.isInteger(stage) || stage < 1 || stage > stages) throw new Error("Invalid infusion stage.");
  return anchorLevel(1 + (stage - 1) * (infusionAnchorStages - 1) / (stages - 1));
}
function legacyInfusionEnemyLevel(stage) {
  if (!Number.isInteger(stage) || stage < 1 || stage > infusionAnchorStages) throw new Error("Invalid infusion stage.");
  return anchorLevel(stage);
}
function anchorLevel(position) {
  const nextIndex = infusionLevelAnchors.findIndex(([floor]) => floor >= position);
  if (nextIndex === 0) return 50;
  const [start, level] = infusionLevelAnchors[nextIndex - 1];
  const [end, endLevel] = infusionLevelAnchors[nextIndex];
  return Math.round(level + (position - start) / (end - start) * (endLevel - level));
}
function infusionEncounter(mode, stage, schedule = "caps") {
  const stages = infusionStageCount(mode);
  if (!isInfusionMode(mode) || !Number.isInteger(stage) || stage < 1 || stage > stages) throw new Error(`Infusion stage must be an integer from 1 to ${stages}.`);
  const tier = mode === "roses" ? roseFormStages.filter((first) => stage >= first).length - 1 : Math.min(5, Math.floor((stage - 1) * 6 / stages));
  const definition = [...infusionModes, ...currencyModes, ...eventModes, ...machineModes].find((entry) => entry.id === mode);
  if (!definition) throw new Error("Unknown staged Elemental-Devourer mode.");
  const startingLevel = definition.startingLevel;
  const level = mode === "heavens" || mode === "abyss" ? schedule === "legacy" ? Math.round(80 + (stage - 1) * 40 / (stages - 1)) : infusionEnemyLevel(stage) : Math.round(startingLevel + (stage - 1) * ((mode === "roses" ? 140 : 120) - startingLevel) / (stages - 1));
  const boss = stage % 5 === 0;
  const stats = mode === "treasury" ? treasuryEnemyStats(level, boss) : mode === "sanctuary" ? sanctuaryEnemyStats(level, boss) : mode === "roses" ? roseEnemyStats(level, boss) : mode === "machines" ? creatureEnemyStats(level, boss) : infusionEnemyStats(level, boss);
  const [name, art] = infusionEnemies[mode][tier];
  return {
    name: definition.name,
    stage,
    level,
    boss,
    stats,
    tier,
    forms: 6,
    enemy: { name, art, element: mode === "machines" ? machineEnemies[tier].element : infusionEnemyElements[mode] },
    color: mode === "machines" ? "#dddddd" : mode === "heavens" ? "#ff6565" : mode === "abyss" ? "#f464d4" : mode === "sanctuary" ? "#e7a7bf" : mode === "roses" ? "#d36b7d" : "#eed78b",
    background: `${mode}-arena.png`,
    ability: mode === "machines" ? machineEnemies[tier].skill : mode === "heavens" ? "Scarlet Judgment" : mode === "abyss" ? "Cosmic Wrath" : mode === "sanctuary" ? "Hallowed Rosefire" : mode === "roses" ? "Golden Thorn Benediction" : "Sovereign Facet",
    abilityMultiplier: enemyAbilityMultiplier(level),
    legacyAbilityMultiplier: 1.2 + (stage - 1) / (stages - 1) * (mode === "roses" ? 0.65 : 24 * 0.016)
  };
}
var infusionDropTable = [
  { rarity: "epic", level: 80, chance: 0.15, finalChance: 0.85, quantity: 3 },
  { rarity: "legendary", level: 100, chance: 0.06, finalChance: 0.65, quantity: 3 },
  { rarity: "omnic", level: 115, chance: 0.02, finalChance: 0.4, quantity: 3 }
];
var specialtyDropTable = [
  { purpose: "weapon", level: 50, quantity: 3 },
  { purpose: "evolution", level: 75, quantity: 3 },
  { purpose: "level", level: 75, quantity: 3 }
];
function infusionLoot(mode, stage, schedule = "caps") {
  const { level } = infusionEncounter(mode, stage, schedule);
  const multiplier = bossLootMultiplier({ infusion: { mode, stage } });
  if (isCurrencyMode(mode) || mode === "machines") return { specialties: [], bonuses: [] };
  if (mode === "roses") return {
    specialties: roseMaterials.flatMap((material, tier) => {
      const drop = scaledDrop(level, 80, roseMaterialUnlocks[tier], tier === 0 ? 1 : roseFinalChances[tier] / 2, roseFinalChances[tier], 3, 140);
      return drop ? [bossLootRange({ id: material.id, ...drop }, multiplier)] : [];
    }),
    bonuses: []
  };
  const specialties = specialtyDropTable.flatMap((entry) => {
    const unlock = schedule === "legacy" ? entry.purpose === "weapon" ? 80 : entry.purpose === "evolution" ? 93 : 100 : entry.level;
    const drop = scaledDrop(level, schedule === "legacy" ? 80 : 50, unlock, 1, 1, entry.quantity);
    return drop ? [bossLootRange({ id: `${mode}-${entry.purpose}`, ...drop }, multiplier)] : [];
  });
  const bonuses = infusionDropTable.flatMap((entry) => {
    const drop = scaledDrop(level, schedule === "legacy" ? 80 : 50, entry.level, entry.chance, entry.finalChance, entry.quantity);
    return drop ? [bossLootRange({ rarity: entry.rarity, ...drop }, multiplier)] : [];
  });
  return { specialties, bonuses };
}
function infusionDrops(mode, stage, random, schedule = "caps") {
  const { specialties, bonuses } = infusionLoot(mode, stage, schedule);
  const eligibleElements = infusionElements(mode);
  const drops = {};
  for (const entry of specialties) {
    const amount = rollDrop(entry, random);
    if (amount === void 0 && entry.chance === 1) throw new Error("Guaranteed specialty material did not drop.");
    if (amount !== void 0) drops[entry.id] = amount;
  }
  for (const entry of bonuses) {
    const amount = rollDrop(entry, random);
    if (amount !== void 0) drops[`${eligibleElements[Math.floor(lootRoll(random) * eligibleElements.length)].id}-${entry.rarity}`] = amount;
  }
  return drops;
}

// src/content/progression.ts
var artifactSlots = Array.from({ length: 8 }, (_, index) => index + 1);
var characterGrowth = { forms: 6, firstLevelCap: 30, levelsPerEvolution: 15, ...playableGrowth };
var fractureRules = {
  sourceTier: 1,
  destinationTier: 2,
  levelCap: characterGrowth.firstLevelCap,
  preservesLevel: true,
  lycalisReward: 10
};
var weaponRules = { maximumRank: 10, attackPerRank: 0.02 };
var evolutionBalance = [
  { fractalis: 300, amounts: [15] },
  { fractalis: 600, amounts: [25, 10] },
  { fractalis: 1200, amounts: [25, 10] },
  { fractalis: 2400, amounts: [25, 10] },
  { fractalis: 4800, amounts: [25, 10] }
];
var levelingMaterialTiers = [
  { rarity: "Uncommon", destination: materialFirstNeededLevel.Uncommon + 1 },
  { rarity: "Rare", destination: materialFirstNeededLevel.Rare + 1 },
  { rarity: "Epic", destination: materialFirstNeededLevel.Epic + 1 },
  { rarity: "Legendary", destination: materialFirstNeededLevel.Legendary + 1 },
  { rarity: "Omnic", destination: materialFirstNeededLevel.Omnic + 1 }
];
function levelingMaterials(element, destination) {
  if (element !== "rosethorn") getElement(element);
  if (!Number.isInteger(destination) || destination < 1 || destination > 120) {
    throw new Error("Leveling destination must be an integer from 1 to 120.");
  }
  return {
    [`${element}-common`]: Math.ceil(destination / 30),
    ...Object.fromEntries(levelingMaterialTiers.filter((tier) => destination >= tier.destination).map((tier) => [`${element}-${tier.rarity.toLowerCase()}`, 1]))
  };
}
function levelCost(element, progress) {
  getElement(element);
  characterGrowthFactor(progress);
  if (progress.level === characterLevelCap(progress.evolution)) throw new Error("Reach the next evolution to raise the level cap.");
  const destination = progress.level + 1;
  return { fractalis: 10 + 2 * destination, materials: {
    ...levelingMaterials(element, destination),
    ...progress.evolution >= 5 ? { [specialtyId(element, "level")]: 1 } : {}
  } };
}
function evolutionCost(element, progress) {
  getElement(element);
  characterGrowthFactor(progress);
  if (progress.evolution === characterGrowth.forms) throw new Error("This character has reached its final evolution.");
  const recipe = evolutionRecipes[progress.evolution - 1];
  const balance = evolutionBalance[progress.evolution - 1];
  return {
    fractalis: balance.fractalis,
    materials: {
      ...Object.fromEntries(recipe.rarities.map((rarity, index) => [`${element}-${rarity.toLowerCase()}`, balance.amounts[index]])),
      ...progress.evolution >= 4 ? { [specialtyId(element, "evolution")]: progress.evolution === 4 ? 5 : 10 } : {}
    }
  };
}
function characterLevelCap(evolution) {
  if (!Number.isInteger(evolution) || evolution < 1 || evolution > characterGrowth.forms) {
    throw new Error(`Character evolution must be an integer from 1 to ${characterGrowth.forms}.`);
  }
  return characterGrowth.firstLevelCap + (evolution - 1) * characterGrowth.levelsPerEvolution;
}
function characterLevelCost(id, progress) {
  const cost = levelCost(getStarter(id).elementId, progress);
  if (!isRoseCharacter(id)) return cost;
  const materials = levelingMaterials("rosethorn", progress.level + 1);
  if (progress.evolution >= 5) materials[roseMaterials[5].id] = (materials[roseMaterials[5].id] ?? 0) + 1;
  return { fractalis: cost.fractalis, materials };
}
function characterEvolutionCost(id, progress) {
  const cost = evolutionCost(getStarter(id).elementId, progress);
  if (!isRoseCharacter(id)) return cost;
  const recipe = evolutionRecipes[progress.evolution - 1];
  const balance = evolutionBalance[progress.evolution - 1];
  return { fractalis: cost.fractalis, materials: {
    ...Object.fromEntries(recipe.rarities.map((rarity, index) => [
      roseMaterials[materialRarities.indexOf(rarity)].id,
      balance.amounts[index]
    ])),
    ...progress.evolution >= 4 ? { [roseMaterials[5].id]: progress.evolution === 4 ? 5 : 10 } : {}
  } };
}
function characterEvolutionRequirement(id, evolution) {
  const requirement = evolutionRequirement(getStarter(id).elementId, evolution);
  return { ...requirement, infusion: isRoseCharacter(id) ? "roses" : requirement.infusion };
}
function characterGrowthFactor(progress) {
  if (!Number.isInteger(progress.weaponRank ?? 0) || (progress.weaponRank ?? 0) < 0 || (progress.weaponRank ?? 0) > weaponRules.maximumRank) throw new Error("Invalid weapon rank.");
  const cap = characterLevelCap(progress.evolution);
  if (!Number.isInteger(progress.level) || progress.level < 0 || progress.level > cap) {
    throw new Error(`Character level must be an integer from 0 to ${cap}.`);
  }
  return 1 + progress.level * characterGrowth.perLevel + (progress.evolution - 1) * characterGrowth.perEvolution;
}
function characterPotencyFactor(progress) {
  characterGrowthFactor(progress);
  return 1 + progress.level * 3e-3 + (progress.evolution - 1) * 0.05;
}

// src/content/element-migration.ts
var legacyElementIds = [
  "infernic",
  "aquatic",
  "tectonic",
  "efflorescent",
  "voltaic",
  "atmospheric",
  "luminous",
  "ominous",
  "tranquilitic",
  "chaotic"
];
var elementMigration = {
  infernic: "infernic",
  aquatic: "oceanic",
  tectonic: "botanic",
  efflorescent: "botanic",
  voltaic: "atmospheric",
  atmospheric: "atmospheric",
  luminous: "tranquilitic",
  ominous: "chaotic",
  tranquilitic: "tranquilitic",
  chaotic: "chaotic"
};
function isLegacyElement(value2) {
  return legacyElementIds.some((id) => id === value2);
}
function canonicalElement(value2) {
  if (value2 === "oceanic" || value2 === "botanic") return value2;
  if (!isLegacyElement(value2)) throw new Error(`Unknown element: ${value2}.`);
  return elementMigration[value2];
}
var elementSources = {
  infernic: ["infernic"],
  oceanic: ["aquatic"],
  atmospheric: ["atmospheric", "voltaic"],
  botanic: ["efflorescent", "tectonic"],
  tranquilitic: ["tranquilitic", "luminous"],
  chaotic: ["chaotic", "ominous"]
};
var elementAssetIds = {
  infernic: "infernic",
  oceanic: "aquatic",
  atmospheric: "atmospheric",
  botanic: "efflorescent",
  tranquilitic: "tranquilitic",
  chaotic: "chaotic"
};

// src/content/dungeon-art.ts
var elementAccents = {
  infernic: "#fa8d63",
  oceanic: "#76c8f4",
  botanic: "#93d7a2",
  atmospheric: "#91ddd1",
  tranquilitic: "#edb3d5",
  chaotic: "#ed8bbe"
};
var legacyDungeonArt = {
  ominous: {
    slug: "valley-of-solitude",
    enemies: [
      { name: "Duskmote", art: "duskmote" },
      { name: "Veilcap Imp", art: "veilcap-imp" },
      { name: "Gloomtail Cat", art: "gloomtail-cat" },
      { name: "Hollowmantle Sentinel", art: "hollowmantle-sentinel" },
      { name: "Umbrasilk Weaver", art: "umbrasilk-weaver" },
      { name: "Moonless Gargoyle", art: "moonless-gargoyle" },
      { name: "Eclipse Antler Regent", art: "eclipse-antler-regent" },
      { name: "Monarch of the Silent Eclipse", art: "monarch-of-the-silent-eclipse" }
    ]
  },
  atmospheric: {
    slug: "sky-bound-rift",
    enemies: [
      { name: "Puffling", art: "puffling" },
      { name: "Reedcap Sylph", art: "reedcap-sylph" },
      { name: "Gustfeather Harpy", art: "gustfeather-harpy" },
      { name: "Cloudhorn Ibex", art: "cloudhorn-ibex" },
      { name: "Zephyrcoil Drake", art: "zephyrcoil-drake" },
      { name: "Cyclonewing Griffin", art: "cyclonewing-griffin" },
      { name: "Crownwind Roc", art: "crownwind-roc" },
      { name: "Regent of the Unbroken Sky", art: "regent-of-the-unbroken-sky" }
    ]
  },
  chaotic: {
    slug: "ruins-of-chaos",
    enemies: [
      { name: "Riftpip", art: "riftpip" },
      { name: "Shardcap Gremlin", art: "shardcap-gremlin" },
      { name: "Nullshell Scarab", art: "nullshell-scarab" },
      { name: "Paradox Sentinel", art: "paradox-sentinel" },
      { name: "Fracturecoil Drake", art: "fracturecoil-drake" },
      { name: "Riftwing Chimera", art: "riftwing-chimera" },
      { name: "Crownvoid Behemoth", art: "crownvoid-behemoth" },
      { name: "Sovereign of the Impossible Ruin", art: "sovereign-of-the-impossible-ruin" }
    ]
  },
  tectonic: {
    slug: "precipice-of-the-earth",
    enemies: [
      { name: "Pebblekin", art: "pebblekin" },
      { name: "Claycap Kobold", art: "claycap-kobold" },
      { name: "Flintback Armadillo", art: "flintback-armadillo" },
      { name: "Quartzhorn Ram", art: "quartzhorn-ram" },
      { name: "Geode Cyclops", art: "geode-cyclops" },
      { name: "Pillarwing Gargoyle", art: "pillarwing-gargoyle" },
      { name: "Crownfault Behemoth", art: "crownfault-behemoth" },
      { name: "Atlas of the Crystal Summit", art: "atlas-of-the-crystal-summit" }
    ]
  },
  luminous: {
    slug: "lustrous-river",
    enemies: [
      { name: "Glimmerkin", art: "glimmerkin" },
      { name: "Lanterncap Brownie", art: "lanterncap-brownie" },
      { name: "Prismback Tortoise", art: "prismback-tortoise" },
      { name: "Dawncrest Guardian", art: "dawncrest-guardian" },
      { name: "Opalwing Griffin", art: "opalwing-griffin" },
      { name: "Sunmirror Oracle", art: "sunmirror-oracle" },
      { name: "Crownray Kirin", art: "crownray-kirin" },
      { name: "Sovereign of the Sevenfold Dawn", art: "sovereign-of-the-sevenfold-dawn" }
    ]
  },
  voltaic: {
    slug: "galvanic-field",
    enemies: [
      { name: "Sparkpip", art: "sparkpip", ability: "Twig Spark" },
      { name: "Coppercap Gremlin", art: "coppercap-gremlin", ability: "Copper Chime Surge" },
      { name: "Coilback Scarab", art: "coilback-scarab", ability: "Coil Discharge" },
      { name: "Stormhorn Faun", art: "stormhorn-faun", ability: "Stormhorn Arc" },
      { name: "Thunderclaw Raiju", art: "thunderclaw-raiju", ability: "Thunderclaw Rend" },
      { name: "Tempestwing Roc", art: "tempestwing-roc", ability: "Tempest Wingstrike" },
      { name: "Crowncoil Kirin", art: "crowncoil-kirin", ability: "Crowncoil Judgment" },
      { name: "Sovereign of the Living Storm", art: "sovereign-of-the-living-storm", ability: "Living Storm" }
    ]
  },
  tranquilitic: {
    slug: "city-of-heaven",
    enemies: [
      { name: "Hushbud", art: "hushbud", ability: "Quiet Chime" },
      { name: "Bellcap Keeper", art: "bellcap-keeper", ability: "Bellward Resonance" },
      { name: "Lotusback Tortoise", art: "lotusback-tortoise", ability: "Lotus Shell Crush" },
      { name: "Porcelain Crane", art: "porcelain-crane", ability: "Porcelain Wingstorm" },
      { name: "Concord Lion", art: "concord-lion", ability: "Concord Fang" },
      { name: "Stillbell Oracle", art: "stillbell-oracle", ability: "Stillbell Mandala" },
      { name: "Harmonywing Kirin", art: "harmonywing-kirin", ability: "Harmony Hornfall" },
      { name: "Sovereign of the Unbroken Accord", art: "sovereign-of-the-unbroken-accord", ability: "Unbroken Accord" }
    ]
  },
  efflorescent: {
    slug: "garden-of-beauty",
    enemies: [
      { name: "Budling", art: "budling" },
      { name: "Mosscap Brownie", art: "mosscap-brownie" },
      { name: "Thornshell Beetle", art: "thornshell-beetle" },
      { name: "Petalhorn Satyr", art: "petalhorn-satyr" },
      { name: "Orchid Mantis", art: "orchid-mantis" },
      { name: "Moonbloom Dryad", art: "moonbloom-dryad" },
      { name: "Verdant Antler Regent", art: "verdant-antler-regent" },
      { name: "Empress of the Thousand Blooms", art: "empress-of-the-thousand-blooms" }
    ]
  },
  infernic: {
    slug: "flaming-depths",
    enemies: [
      { name: "Ashling", art: "ashling" },
      { name: "Coalcap Kobold", art: "coalcap-kobold" },
      { name: "Emberhorn Faun", art: "emberhorn-faun" },
      { name: "Furnace Salamander", art: "furnace-salamander" },
      { name: "Cinderhide Cyclops", art: "cinderhide-cyclops" },
      { name: "Obsidian Gargoyle", art: "obsidian-gargoyle" },
      { name: "Brasshorn Minotaur", art: "brasshorn-minotaur" },
      { name: "Pyrewing Harpy", art: "pyrewing-harpy" },
      { name: "Magma Wyrm Knight", art: "magma-wyrm-knight" },
      { name: "Ifrit of the Last Furnace", art: "last-furnace-ifrit" }
    ]
  },
  aquatic: {
    slug: "oceanic-valley",
    enemies: [
      { name: "Pebblefin Sprig", art: "pebblefin-sprig" },
      { name: "Shellcap Kappa", art: "shellcap-kappa" },
      { name: "Brineclaw Sentinel", art: "brineclaw-sentinel" },
      { name: "Coralcrest Nereid", art: "coralcrest-nereid" },
      { name: "Glasswake Kelpie", art: "glasswake-kelpie" },
      { name: "Abyssbell Oracle", art: "abyssbell-oracle" },
      { name: "Pearlscale Leviathan", art: "pearlscale-leviathan" },
      { name: "Sovereign of the Endless Tide", art: "sovereign-of-the-endless-tide" }
    ]
  }
};
var dungeonArt = Object.fromEntries(
  elements.map((element) => [element.id, legacyDungeonArt[elementAssetIds[element.id]]])
);
var materialArtNames = ["Seed", "Bloom", "Shard", "Crest", "Heart", "Soul"];
function materialName(id) {
  const rose = roseMaterials.find((material) => material.id === id);
  if (rose) return rose.name;
  const specialty = specialtyMaterials.find((entry) => entry.id === id);
  if (specialty) return specialty.name;
  const [elementId, rarity] = id.split("-");
  const element = elements.find((entry) => entry.id === elementId);
  const index = materialRarities.findIndex((entry) => entry.toLowerCase() === rarity);
  if (!element || index < 0 || id !== `${elementId}-${rarity}`) throw new Error(`Unknown material: ${id}.`);
  return `${materialArtNames[index]} of ${element.name}`;
}

// src/content/dungeon-enemies.ts
function supplied(element) {
  const pack = legacyDungeonArt[element];
  if (!pack) throw new Error(`Expected supplied dungeon art: ${element}.`);
  return pack.enemies;
}
function pending(names) {
  return names.map((name) => ({ name }));
}
var legacyDungeonEnemies = {
  infernic: supplied("infernic"),
  aquatic: supplied("aquatic"),
  efflorescent: supplied("efflorescent"),
  tectonic: pending([
    "Pebblekin",
    "Claycap Kobold",
    "Flintback Armadillo",
    "Quartzhorn Ram",
    "Geode Cyclops",
    "Pillarwing Gargoyle",
    "Crownfault Behemoth",
    "Atlas of the Crystal Summit"
  ]),
  voltaic: supplied("voltaic"),
  atmospheric: pending([
    "Puffling",
    "Reedcap Sylph",
    "Gustfeather Harpy",
    "Cloudhorn Ibex",
    "Zephyrcoil Drake",
    "Cyclonewing Griffin",
    "Crownwind Roc",
    "Regent of the Unbroken Sky"
  ]),
  luminous: pending([
    "Glimmerkin",
    "Lanterncap Brownie",
    "Prismback Tortoise",
    "Dawncrest Guardian",
    "Opalwing Griffin",
    "Sunmirror Oracle",
    "Crownray Kirin",
    "Sovereign of the Sevenfold Dawn"
  ]),
  ominous: pending([
    "Duskmote",
    "Veilcap Imp",
    "Gloomtail Cat",
    "Hollowmantle Sentinel",
    "Umbrasilk Weaver",
    "Moonless Gargoyle",
    "Eclipse Antler Regent",
    "Monarch of the Silent Eclipse"
  ]),
  tranquilitic: supplied("tranquilitic"),
  chaotic: pending([
    "Riftpip",
    "Shardcap Gremlin",
    "Nullshell Scarab",
    "Paradox Sentinel",
    "Fracturecoil Drake",
    "Riftwing Chimera",
    "Crownvoid Behemoth",
    "Sovereign of the Impossible Ruin"
  ])
};
var legacyDungeonStrikes = {
  infernic: "Furnace Strike",
  aquatic: "Tidal Strike",
  efflorescent: "Thorn Strike",
  tectonic: "Faultline Strike",
  voltaic: "Thunder Strike",
  atmospheric: "Gale Strike",
  luminous: "Radiant Strike",
  ominous: "Umbral Strike",
  tranquilitic: "Concord Strike",
  chaotic: "Rift Strike"
};
var dungeonEnemies = {
  infernic: legacyDungeonEnemies.infernic,
  oceanic: legacyDungeonEnemies.aquatic,
  botanic: legacyDungeonEnemies.efflorescent,
  atmospheric: legacyDungeonEnemies.atmospheric,
  tranquilitic: legacyDungeonEnemies.tranquilitic,
  chaotic: legacyDungeonEnemies.chaotic
};

// src/content/dungeons.ts
var playableDungeons = elements.map((element) => element.id);
function isPlayableDungeon(value2) {
  return playableDungeons.some((element) => element === value2);
}
function dungeonVariants(element, stage) {
  if (!isPlayableDungeon(element)) throw new Error("Dungeon is not playable.");
  elementalEnemyLevel(stage);
  return elementSources[element].map((source) => {
    const art = legacyDungeonArt[source];
    const pack = art?.enemies ?? legacyDungeonEnemies[source];
    if (!pack.length) throw new Error(`Dungeon enemy lineup is missing: ${source}.`);
    const tier = Math.min(pack.length - 1, Math.floor((stage - 1) * pack.length / elementalDungeonRules.stages));
    return {
      source,
      tier,
      forms: pack.length,
      enemy: pack[tier],
      creatureId: `dungeon:${source}:${tier}`,
      ability: pack[tier].ability ?? legacyDungeonStrikes[source]
    };
  });
}
function dungeonEncounter(element, stage, family = 0) {
  if (!isPlayableDungeon(element)) throw new Error("Dungeon is not playable.");
  const level = elementalEnemyLevel(stage);
  const art = dungeonArt[element];
  const variants = dungeonVariants(element, stage);
  if (!Number.isInteger(family) || family < 0 || family >= variants.length) throw new Error("Invalid dungeon enemy family.");
  const variant = variants[family];
  const boss = stage % 5 === 0;
  const stats = enemyCombatStats(level, boss);
  return {
    name: getElement(element).dungeon,
    level,
    stage,
    boss,
    stats,
    ...variant,
    color: elementAccents[element],
    background: art ? `${art.slug}.png` : null,
    abilityMultiplier: enemyAbilityMultiplier(level)
  };
}
var materialRarities2 = ["common", "uncommon", "rare", "epic", "legendary", "omnic"];
var bracketRanges = [
  { common: [4, 5] },
  { common: [8, 10], uncommon: [2, 3] },
  { common: [12, 15], uncommon: [5, 6], rare: [2, 3] },
  { common: [16, 20], uncommon: [8, 10], rare: [5, 6], epic: [2, 3] },
  { common: [20, 25], uncommon: [12, 15], rare: [8, 10], epic: [5, 6], legendary: [2, 3] },
  { common: [25, 30], uncommon: [16, 20], rare: [12, 15], epic: [8, 10], legendary: [5, 6], omnic: [2, 3] }
];
var materialBrackets = bracketRanges.map((ranges, index) => {
  const level = materialDropLevel(materialRarities[index]);
  const firstStage = Array.from({ length: elementalDungeonRules.stages }, (_, stage) => stage + 1).find((stage) => elementalEnemyLevel(stage) >= level) ?? 1;
  return { level, firstStage, ranges };
});
function materialBracket(stage) {
  elementalEnemyLevel(stage);
  return [...materialBrackets].reverse().find((bracket) => stage >= bracket.firstStage);
}
function materialLoot(element, stage) {
  getElement(element);
  const { ranges } = materialBracket(stage);
  const multiplier = bossLootMultiplier({ dungeon: { stage } });
  return materialRarities2.flatMap((rarity) => {
    const range2 = ranges[rarity];
    return range2 ? [bossLootRange({ id: `${element}-${rarity}`, minimum: range2[0], maximum: range2[1], chance: 1 }, multiplier)] : [];
  });
}
function materialDrops(element, stage, random) {
  const drops = {};
  for (const entry of materialLoot(element, stage)) {
    const amount = rollDrop(entry, random);
    if (amount !== void 0) drops[entry.id] = amount;
  }
  return drops;
}

// src/game/profile.ts
var SAVE_KEY = "last-light.profile";
function loadProfile(storage) {
  const raw = storage.getItem(SAVE_KEY);
  if (raw === null) return null;
  const data = JSON.parse(raw);
  if (typeof data !== "object" || data === null || !("version" in data) || data.version !== 1 || !("starterId" in data) || !isStarterId(data.starterId) || !isAvailableStarter(data.starterId)) {
    throw new Error("This local save is invalid or uses an unsupported version.");
  }
  return { version: 1, starterId: data.starterId };
}

// src/content/story-art.ts
var storyRegionArt = {
  infernic: {
    background: "story-emberwake-march-arena.png",
    enemies: ["story-infernic-0", "story-infernic-1", "story-infernic-2", "story-infernic-3"],
    boss: "story-infernic-boss"
  },
  oceanic: {
    background: "story-glasswater-reach-arena.png",
    enemies: ["story-oceanic-0", "story-oceanic-1", "story-oceanic-2", "story-oceanic-3"],
    boss: "story-oceanic-boss"
  },
  atmospheric: {
    background: "story-stormspan-heights-arena.png",
    enemies: ["story-atmospheric-0", "story-atmospheric-1", "story-atmospheric-2", "story-atmospheric-3"],
    boss: "story-atmospheric-boss"
  },
  botanic: {
    background: "story-rootstone-wilds-arena.png",
    enemies: ["story-botanic-0", "story-botanic-1", "story-botanic-2", "story-botanic-3"],
    boss: "story-botanic-boss"
  },
  tranquilitic: {
    background: "story-stillhalo-vale-arena.png",
    enemies: ["story-tranquilitic-0", "story-tranquilitic-1", "story-tranquilitic-2", "story-tranquilitic-3"],
    boss: "story-tranquilitic-boss"
  },
  chaotic: {
    background: "story-riftbound-frontier-arena.png",
    enemies: ["story-chaotic-0", "story-chaotic-1", "story-chaotic-2", "story-chaotic-3"],
    boss: "story-chaotic-boss"
  }
};

// src/content/story.ts
var storyRules = { regionStages: storyStageLayout.regionStages, stages: storyStageLayout.stages, startingLevel: 1, maximumLevel: 55 };
var storyCompletionReward = { fractalis: 150, lycalis: 2 };
var storyReplayReward = { fractalis: storyCompletionReward.fractalis, lycalis: 0 };
function storyClearReward(firstClear) {
  return firstClear ? storyCompletionReward : storyReplayReward;
}
var storyRegionCount = storyStageLayout.stages / storyStageLayout.regionStages;
function remapStoryCompleted(completed, regionStages) {
  if (!Number.isSafeInteger(completed) || completed < 0 || completed > regionStages * storyRegionCount) throw new Error("Invalid saved Story progress.");
  const region = Math.floor(completed / regionStages);
  const within = completed % regionStages;
  return region * storyRules.regionStages + Math.floor(within * storyRules.regionStages / regionStages);
}
function migrateLegacyStoryCompleted(completed) {
  return remapStoryCompleted(completed, storyStageLayout.legacyRegionStages);
}
function migratePreviousStoryCompleted(completed) {
  return remapStoryCompleted(completed, storyStageLayout.previousRegionStages);
}
var storyRegions = [
  {
    element: "infernic",
    name: "Emberwake March",
    introduction: "The search for Let's soul begins among cooling cinders. Rise's seekers wield the same Infernic Wrath. Restore the first beacon to reopen the road.",
    enemies: ["Cinderling", "Ashback Boar", "Coalcrest Moth", "Furnace Jackal"],
    boss: "Kilnheart Warden",
    conclusion: "The first beacon burns again. Let's soul remains unfound; the road leads onward toward Oceanic Sadness."
  },
  {
    element: "oceanic",
    name: "Glasswater Reach",
    introduction: "Oceanic Sadness echoes across the broken causeways of Glasswater. Follow the submerged bells toward the second beacon while Rise's seekers scour the same shores.",
    enemies: ["Tideglass Crab", "Foamfin Drake", "Pearlshell Turtle", "Current Ray"],
    boss: "Deepbell Leviathan",
    conclusion: "The bells ring above the water. The search continues beyond these grieving shores, toward Atmospheric Calm."
  },
  {
    element: "atmospheric",
    name: "Stormspan Heights",
    introduction: "Let named Atmospheric for Calm, even where its winds become a storm. Reconnect the sky bridges as Rise's Elemental-Devourers search the floating ridges.",
    enemies: ["Cloudhorn Ram", "Staticwing Kite", "Gusttail Lynx", "Thundercoil Serpent"],
    boss: "Tempest Crown Roc",
    conclusion: "The sky paths steady without deciding the creators' contest. Below, Botanic Joy and Life point toward the next road."
  },
  {
    element: "botanic",
    name: "Rootstone Wilds",
    introduction: "Botanic carries Let's Joy and Life. Trace the living paths through sealed roads; Rise's seekers have stolen this power too and roam the buried garden.",
    enemies: ["Mossplate Beetle", "Briarback Stag", "Loamjaw Mole", "Fernmantle Basilisk"],
    boss: "Heartwood Colossus",
    conclusion: "The garden opens its gates. Neither creator's soul is here; a quiet procession leads toward Tranquilitic Peace."
  },
  {
    element: "tranquilitic",
    name: "Stillhalo Vale",
    introduction: "Tranquilitic Peace rests over abandoned sanctuaries. Gather the scattered vows to restore the fifth beacon, remembering that Rise's creations can wield Peace as well.",
    enemies: ["Ivoryveil Moth", "Dewhalo Hart", "Vowcrest Crane", "Opalward Lion"],
    boss: "Serene Oathkeeper",
    conclusion: "The vows become a guiding chorus. The search leads to the final route, where Chaotic Death and Destruction have fractured the frontier."
  },
  {
    element: "chaotic",
    name: "Riftbound Frontier",
    introduction: "Let named Chaotic for Death and Destruction; it is not exclusive to Rise or her Nothingness. Cross the fractures and confront her seekers at the final beacon.",
    enemies: ["Riftfang Hound", "Splinterhide Lizard", "Voidcrest Raven", "Faultcoil Wyrm"],
    boss: "Fracture Sovereign",
    conclusion: "Six beacons answer one another and the roads reopen. Neither Let's nor Rise's soul has been found. Both factions continue their search beyond the frontier."
  }
];
function storyEncounter(stage) {
  if (!Number.isInteger(stage) || stage < 1 || stage > storyRules.stages) throw new Error(`Story stage must be from 1 to ${storyRules.stages}.`);
  const regionIndex = Math.floor((stage - 1) / storyRules.regionStages);
  const region = storyRegions[regionIndex];
  const regionStage = (stage - 1) % storyRules.regionStages + 1;
  const level = Math.round(storyRules.startingLevel + (stage - 1) * (storyRules.maximumLevel - storyRules.startingLevel) / (storyRules.stages - 1));
  const boss = regionStage === storyRules.regionStages;
  const stats = enemyCombatStats(level, boss);
  return {
    ...region,
    name: region.name,
    stage,
    regionIndex,
    regionStage,
    level,
    boss,
    stats,
    color: elementAccents[region.element],
    background: storyRegionArt[region.element]?.background ?? null,
    abilityMultiplier: enemyAbilityMultiplier(level)
  };
}
function storyCreature(stage, identity) {
  const encounter2 = storyEncounter(stage);
  if (!Number.isInteger(identity) || identity < 0 || identity >= (encounter2.boss ? 1 : 4)) throw new Error("Invalid Story enemy identity.");
  const art = storyRegionArt[encounter2.element];
  return {
    ...art ? { art: encounter2.boss ? art.boss : art.enemies[identity] } : {},
    id: `story:${encounter2.element}:${encounter2.boss ? "boss" : identity}`,
    name: encounter2.boss ? storyRegions[encounter2.regionIndex].boss : encounter2.enemies[identity]
  };
}
function storyBossBonus(stage) {
  const encounter2 = storyEncounter(stage);
  if (!encounter2.boss) throw new Error("Only a regional Story boss has a first-clear bonus.");
  const numerator = 115 ** encounter2.regionIndex;
  const denominator = 100 ** encounter2.regionIndex;
  return { fractalis: Math.round(1e3 * numerator / denominator), lycalis: Math.round(50 * numerator / denominator) };
}
function storyMaterialLoot(stage) {
  const { element, level } = storyEncounter(stage);
  const growth = ((level - 1) / 54) ** 2;
  const minimum = 1 + Math.floor(2 * growth);
  const drops = [
    { id: `${element}-common`, minimum, maximum: minimum * 2, chance: 1 },
    { id: `${element}-uncommon`, minimum, maximum: minimum * 2, chance: 0.25 + 0.55 * (level - 1) / 54 }
  ];
  return drops.map((drop) => bossLootRange(drop, bossLootMultiplier({ story: { storyStage: stage } })));
}
function storyDrops(stage, random) {
  return Object.fromEntries(storyMaterialLoot(stage).flatMap((drop) => {
    const amount = rollDrop(drop, random);
    return amount === void 0 ? [] : [[drop.id, amount]];
  }));
}
var storyRulesText = `Six regions of ${storyRules.regionStages} stages, Lv.1-55. First clear: 150 Prismatica and 2 Null-Prismatica; replays: 150 Prismatica. Enemies drop Common and Uncommon materials of their region; no captures. Prismatica per kill rises from 8-16 at Lv.1 to 170-340 at Lv.55. Regional bosses give 5x Prismatica (base 5-10 to 113-226) and materials on every clear, plus a one-time bonus of 1,000 Prismatica and 50 Null-Prismatica, rising 15% per region. Continue restores HP and keeps Gauge.`;

// src/content/calamity.ts
var calamityActivities = [
  { id: "treasury", name: "Crownfall Treasury", boss: "Crown of the Ruined Vault", element: "tranquilitic" },
  { id: "sanctuary", name: "Rosethorn Sanctuary", boss: "White Pyre Hierophant", element: "tranquilitic" },
  { id: "heavens", name: "Soar to Heaven", boss: "Heavenfall Seraph", element: "tranquilitic" },
  { id: "abyss", name: "Delve into the Abyss", boss: "Abyssal Nullmaw", element: "chaotic" },
  { id: "machines", name: "Awaken the Machines", boss: "Catastrophe Prime", element: "chaotic" },
  { id: "roses", name: "Passion of Crimson Roses", boss: "The Last Scarlet Bloom", element: "tranquilitic" },
  { id: "infernic", name: "Flaming Depths", boss: "Ashcrown Cataclysm", element: "infernic" },
  { id: "oceanic", name: "Oceanic Valley", boss: "Leviathan of the White Wake", element: "oceanic" },
  { id: "atmospheric", name: "Sky-bound Rift", boss: "Riftstorm Harbinger", element: "atmospheric" },
  { id: "botanic", name: "Garden of Beauty", boss: "Pallid Root Sovereign", element: "botanic" },
  { id: "tranquilitic", name: "City of Heaven", boss: "Silent Meridian", element: "tranquilitic" },
  { id: "chaotic", name: "Ruins of Chaos", boss: "The Scarlet Unmaking", element: "chaotic" }
];
function isCalamityActivityId(value2) {
  return calamityActivities.some((activity) => activity.id === value2);
}
function isCalamityTier(value2) {
  return value2 === 1 || value2 === 2 || value2 === 3;
}
function calamityActivity(id) {
  const activity = calamityActivities.find((entry) => entry.id === id);
  if (!activity) throw new Error("Unknown Calamity activity.");
  return activity;
}
function calamityChestId(activity, tier) {
  calamityActivity(activity);
  if (!isCalamityTier(tier)) throw new Error("Invalid Calamity tier.");
  return `calamity:${activity}:${tier}`;
}
function parseCalamityChestId(id) {
  const match = /^calamity:([a-z]+):([123])$/.exec(id);
  const tier = match ? Number(match[2]) : 0;
  if (!match || !isCalamityActivityId(match[1]) || !isCalamityTier(tier)) throw new Error("Invalid Calamity chest identity.");
  return { activity: match[1], tier };
}
function calamityChest(activity, tier) {
  const id = calamityChestId(activity, tier);
  const title = ["Slayer", "Master", "Omnipotent"][tier - 1];
  return {
    id,
    name: `${calamityActivity(activity).name} EX+${title} Chest`,
    fractalis: [1e5, 25e4, 5e5][tier - 1],
    lycalis: [50, 70, 100][tier - 1],
    calamiticTokens: [1, 3, 8][tier - 1],
    bundles: [3, 5, 7][tier - 1],
    masterChests: tier === 3 ? 2 : 0
  };
}
function materialRows(ids) {
  return ids.map((material, index) => ({
    label: material.name,
    id: material.id,
    kind: "material",
    weight: [10, 15, 25, 25, 15, 10][index],
    min: [30, 20, 15, 10, 6, 3][index],
    max: [60, 40, 30, 20, 12, 6][index]
  }));
}
function calamityLootTable(activity) {
  calamityActivity(activity);
  if (activity === "treasury") return [
    { label: "Prismatica cache", kind: "fractalis", weight: 70, min: 25e3, max: 5e4 },
    { label: "Prismatica vault", kind: "fractalis", weight: 25, min: 75e3, max: 1e5 },
    { label: "Prismatica crown reserve", kind: "fractalis", weight: 5, min: 2e5, max: 25e4 }
  ];
  if (activity === "sanctuary") return [
    { label: "Null-Prismatica cache", kind: "lycalis", weight: 70, min: 5, max: 10 },
    { label: "Null-Prismatica reliquary", kind: "lycalis", weight: 25, min: 15, max: 25 },
    { label: "Null-Prismatica pyre reserve", kind: "lycalis", weight: 5, min: 40, max: 50 }
  ];
  if (activity === "machines") return [
    { label: "Broken Mechanical Components", kind: "components", weight: 60, min: 100, max: 200 },
    ...["Rare", "Legendary", "Omnic"].flatMap((rarity, index) => {
      const pool = conduits.filter((conduit) => conduit.rarity === rarity);
      return pool.map((conduit) => ({
        label: conduit.name,
        kind: "conduit",
        id: conduit.id,
        weight: [20, 15, 5][index] / pool.length,
        min: 1,
        max: 1
      }));
    })
  ];
  if (activity === "roses") return materialRows(roseMaterials);
  if (activity === "heavens" || activity === "abyss") {
    const pool = elements.filter((element) => element.infusion === activity);
    return [
      {
        label: activity === "heavens" ? "Crown of the Scarlet Oath" : "Heart of the Shattered Void",
        id: `${activity}-evolution`,
        kind: "material",
        weight: 35,
        min: 5,
        max: 10
      },
      {
        label: activity === "heavens" ? "Chalice of the Undying Dawn" : "Hourglass of Endless Wrath",
        id: `${activity}-level`,
        kind: "material",
        weight: 35,
        min: 10,
        max: 20
      },
      ...pool.flatMap((element) => ["Epic", "Legendary", "Omnic"].map((rarity, index) => ({
        label: `${element.name} ${rarity} Material`,
        id: `${element.id}-${rarity.toLowerCase()}`,
        kind: "material",
        weight: [15, 10, 5][index] / pool.length,
        min: [10, 6, 3][index],
        max: [20, 12, 6][index]
      })))
    ];
  }
  return materialRows(materialRarities.map((rarity) => ({
    id: `${activity}-${rarity.toLowerCase()}`,
    name: `${calamityActivity(activity).name} ${rarity} Material`
  })));
}
function rollCalamityChest(activity, tier, roll2) {
  const chest = calamityChest(activity, tier);
  const reward = {
    id: chest.id,
    name: chest.name,
    fractalis: chest.fractalis,
    lycalis: chest.lycalis,
    calamiticTokens: chest.calamiticTokens,
    masterChests: chest.masterChests,
    materials: {},
    conduits: {},
    mechanicalComponents: 0
  };
  const table = calamityLootTable(activity);
  const random = () => {
    const value2 = roll2();
    if (!Number.isFinite(value2) || value2 < 0 || value2 >= 1) throw new Error("Calamity loot roll must be in [0, 1).");
    return value2;
  };
  const totalWeight = table.reduce((sum, row) => sum + row.weight, 0);
  for (let bundle = 0; bundle < chest.bundles; bundle++) {
    let pick = random() * totalWeight;
    const row = table.find((entry) => {
      pick -= entry.weight;
      return pick < 0;
    }) ?? table[table.length - 1];
    const amount = row.min + Math.floor(random() * (row.max - row.min + 1));
    if (row.kind === "fractalis" || row.kind === "lycalis") reward[row.kind] += amount;
    else if (row.kind === "components") reward.mechanicalComponents += amount;
    else if (row.kind === "material" && row.id) reward.materials[row.id] = (reward.materials[row.id] ?? 0) + amount;
    else if (row.kind === "conduit" && row.id) {
      const id = conduits.find((conduit) => conduit.id === row.id)?.id;
      if (!id) throw new Error("Unknown Calamity Conduit reward.");
      reward.conduits[id] = (reward.conduits[id] ?? 0) + amount;
    } else throw new Error("Malformed Calamity loot row.");
  }
  return reward;
}
var calamityPatterns = {
  treasury: {
    strike: "Vaultbreaker",
    every: 3,
    multiplier: 1.5,
    ruin: "Crown Collapse",
    ruinEvery: 6,
    ruinMultiplier: 2.4,
    description: "Uses Vaultbreaker every 3 enemy turns. Crown Collapse replaces it every 6 turns."
  },
  sanctuary: {
    strike: "White Pyre",
    every: 2,
    multiplier: 1.3,
    ruin: "Reliquary Descent",
    ruinEvery: 5,
    ruinMultiplier: 1.9,
    shieldEvery: 3,
    shieldFraction: 0.025,
    description: "Uses White Pyre every 2 enemy turns and Reliquary Descent every 5. Before attacking every 3 turns, refreshes a shield worth 2.5% of its max HP."
  },
  heavens: {
    strike: "Scarlet Volley",
    every: 2,
    multiplier: 1.25,
    ruin: "Heavenfall",
    ruinEvery: 7,
    ruinMultiplier: 2.2,
    hits: 3,
    description: "Each attack hits one target 3 times, splitting its damage across the hits. Uses Scarlet Volley every 2 enemy turns and Heavenfall every 7."
  },
  abyss: {
    strike: "Nullmaw Hunt",
    every: 3,
    multiplier: 1.4,
    ruin: "Starless Pursuit",
    ruinEvery: 5,
    ruinMultiplier: 2,
    targeting: "lowest",
    description: "Targets the ally with the lowest percentage of HP remaining, unless taunted. Uses Nullmaw Hunt every 3 enemy turns and Starless Pursuit every 5."
  },
  machines: {
    strike: "Prototype Discharge",
    every: 4,
    multiplier: 2,
    ruin: "Catastrophe Cascade",
    ruinEvery: 8,
    ruinMultiplier: 2.7,
    description: "Uses Prototype Discharge every 4 enemy turns. Catastrophe Cascade replaces it every 8. Uses Normal Attacks between skills."
  },
  roses: {
    strike: "Thorn Requiem",
    every: 2,
    multiplier: 1.4,
    ruin: "Final Scarlet Bloom",
    ruinEvery: 6,
    ruinMultiplier: 2.1,
    healEvery: 4,
    healFraction: 0.015,
    description: "Uses Thorn Requiem every 2 enemy turns and Final Scarlet Bloom every 6. Heals 1.5% of its max HP before attacking every 4 turns."
  },
  infernic: {
    strike: "Cinder Torrent",
    every: 2,
    multiplier: 1.6,
    ruin: "Ashcrown Eruption",
    ruinEvery: 5,
    ruinMultiplier: 2.3,
    description: "Uses Cinder Torrent every 2 enemy turns and Ashcrown Eruption every 5."
  },
  oceanic: {
    strike: "White Wake",
    every: 3,
    multiplier: 1.55,
    ruin: "Leviathan Breach",
    ruinEvery: 6,
    ruinMultiplier: 2.2,
    shieldEvery: 4,
    shieldFraction: 0.04,
    description: "Uses White Wake every 3 enemy turns and Leviathan Breach every 6. Before attacking every 4 turns, refreshes a shield worth 4% of its max HP."
  },
  atmospheric: {
    strike: "Riftstorm Talons",
    every: 3,
    multiplier: 1.7,
    ruin: "Sky Fracture",
    ruinEvery: 7,
    ruinMultiplier: 2.3,
    hits: 4,
    description: "Each attack hits one target 4 times, splitting its damage across the hits. Uses Riftstorm Talons every 3 enemy turns and Sky Fracture every 7."
  },
  botanic: {
    strike: "Pallid Thorns",
    every: 3,
    multiplier: 1.3,
    ruin: "Root Cathedral",
    ruinEvery: 8,
    ruinMultiplier: 2.1,
    healEvery: 3,
    healFraction: 0.025,
    description: "Uses Pallid Thorns every 3 enemy turns and Root Cathedral every 8. Heals 2.5% of its max HP before attacking every 3 turns."
  },
  tranquilitic: {
    strike: "Meridian Sweep",
    every: 4,
    multiplier: 1.6,
    ruin: "Silent Convergence",
    ruinEvery: 7,
    ruinMultiplier: 2.2,
    shieldEvery: 2,
    shieldFraction: 0.02,
    description: "Before attacking every 2 enemy turns, refreshes a shield worth 2% of its max HP. Uses Meridian Sweep every 4 turns and Silent Convergence every 7."
  },
  chaotic: {
    strike: "Fractal Disjunction",
    every: 2,
    multiplier: 1.35,
    ruin: "Scarlet Unmaking",
    ruinEvery: 5,
    ruinMultiplier: 2.1,
    targeting: "highest",
    description: "Targets the ally with the highest percentage of HP remaining, unless taunted. Uses Fractal Disjunction every 2 enemy turns and Scarlet Unmaking every 5."
  }
};
function calamityEncounter(activity, tier) {
  const definition = calamityActivity(activity);
  if (!isCalamityTier(tier)) throw new Error("Invalid Calamity tier.");
  const level = [145, 160, 185][tier - 1];
  const stats = enemyCombatStats(level, true);
  const pattern = calamityPatterns[activity];
  const skills = [
    { name: pattern.strike, multiplier: pattern.multiplier, every: pattern.every, action: "skill1" },
    { name: pattern.ruin, multiplier: pattern.ruinMultiplier, every: pattern.ruinEvery, action: "ultimate" }
  ];
  return { name: definition.boss, level, element: definition.element, stats, skills, description: pattern.description };
}

// src/content/calamity-art.ts
var calamityBossArt = {
  treasury: "calamity-boss-treasury",
  sanctuary: "calamity-boss-sanctuary",
  heavens: "calamity-boss-heavens",
  abyss: "calamity-boss-abyss",
  machines: "calamity-boss-machines",
  roses: "calamity-boss-roses",
  infernic: "calamity-boss-infernic",
  oceanic: "calamity-boss-oceanic",
  atmospheric: "calamity-boss-atmospheric",
  botanic: "calamity-boss-botanic",
  tranquilitic: "calamity-boss-tranquilitic",
  chaotic: "calamity-boss-chaotic"
};

// src/content/creatures.ts
function catalog() {
  const result = enemyIds.map((id) => ({
    id: `adventure:${id}`,
    name: enemies[id].name,
    art: enemies[id].art,
    element: enemies[id].element,
    area: "Training",
    stages: []
  }));
  for (let stage = 1; stage <= storyRules.stages; stage++) {
    const encounter2 = storyEncounter(stage);
    for (let identity = 0; identity < (encounter2.boss ? 1 : 4); identity++) {
      const creature = storyCreature(stage, identity);
      const existing = result.find((entry) => entry.id === creature.id);
      if (existing) existing.stages.push(stage);
      else result.push({ ...creature, element: encounter2.element, area: encounter2.name, story: true, stages: [stage] });
    }
  }
  for (const element of elements) {
    for (let stage = 1; stage <= dungeonStageCount; stage++) {
      for (const variant of dungeonVariants(element.id, stage)) {
        const id = variant.creatureId;
        const entry = result.find((creature) => creature.id === id);
        if (entry) entry.stages.push(stage);
        else result.push({
          id,
          name: variant.enemy.name,
          art: variant.enemy.art,
          area: element.dungeon,
          element: element.id,
          dungeonElement: element.id,
          stages: [stage]
        });
      }
    }
  }
  for (const definition of [...infusionModes, ...currencyModes, ...eventModes, ...machineModes]) {
    const mode = definition.id;
    for (let stage = 1; stage <= definition.stages; stage++) {
      const encounter2 = infusionEncounter(mode, stage);
      const id = `infusion:${mode}:${encounter2.tier}`;
      const entry = result.find((creature) => creature.id === id);
      if (entry) entry.stages.push(stage);
      else result.push({
        id,
        name: encounter2.enemy.name,
        art: encounter2.enemy.art,
        area: encounter2.name,
        element: encounter2.enemy.element,
        mode,
        stages: [stage]
      });
    }
  }
  for (const activity of calamityActivities) {
    result.push({
      id: `calamity:${activity.id}`,
      name: activity.boss,
      area: `${activity.name} \xB7 Calamity`,
      art: calamityBossArt[activity.id],
      element: activity.element,
      calamity: activity.id,
      stages: [1, 2, 3]
    });
  }
  return result;
}
var creatures = catalog();
function getCreature(id) {
  const creature = creatures.find((entry) => entry.id === id);
  if (!creature) throw new Error(`Unknown glossary Elemental-Devourer: ${id}.`);
  return creature;
}

// src/game/character-instances.ts
var capturedLevelCap = 60;
function isCapturedInstanceId(value2) {
  return typeof value2 === "string" && /^capture:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value2);
}
function migrateLegacyCapturedCopies(value2) {
  if (!Array.isArray(value2)) return value2;
  return value2.map((entry) => {
    if (typeof entry !== "object" || entry === null || !("creatureId" in entry) || !("capturedStage" in entry) || typeof entry.creatureId !== "string" || typeof entry.capturedStage !== "number" || typeof entry.level !== "number") return entry;
    const creature = getCreature(entry.creatureId);
    const mode = creature.mode;
    if (mode !== "heavens" && mode !== "abyss") return entry;
    const legacyStages = legacyActivityStageCounts[mode];
    const oldStage = entry.capturedStage;
    if (!Number.isInteger(oldStage) || oldStage < 1 || oldStage > legacyStages || Math.min(5, Math.floor((oldStage - 1) * 6 / legacyStages)) !== infusionEncounter(mode, creature.stages[0]).tier) {
      throw new Error("Invalid captured Elemental-Devourer progression.");
    }
    const savedLevel = entry.level;
    const oldLevel = legacyInfusionEnemyLevel(oldStage);
    const oldBoss = oldStage % 5 === 0;
    const ranked = creature.stages.map((stage) => infusionEncounter(mode, stage)).sort((a, b) => Number(b.boss === oldBoss) - Number(a.boss === oldBoss) || Math.abs(a.level - oldLevel) - Math.abs(b.level - oldLevel));
    const encounter2 = ranked.find((option) => Math.min(capturedLevelCap, option.level) <= savedLevel) ?? ranked[0];
    return {
      ...entry,
      capturedStage: encounter2.stage,
      level: Math.max(savedLevel, Math.min(capturedLevelCap, encounter2.level)),
      skills: enemySkills(encounter2.level, encounter2.boss, encounter2.ability, encounter2.abilityMultiplier)
    };
  });
}
function validateCapturedCharacters(value2) {
  if (!Array.isArray(value2)) throw new Error("Invalid saved captured Elemental-Devourers.");
  const seen = /* @__PURE__ */ new Set();
  return value2.map((entry) => {
    if (typeof entry !== "object" || entry === null || !("instanceId" in entry) || !("creatureId" in entry) || !("locked" in entry) || !isCapturedInstanceId(entry.instanceId) || typeof entry.creatureId !== "string" || typeof entry.locked !== "boolean" || seen.has(entry.instanceId)) {
      throw new Error("Invalid or duplicate captured-character instance.");
    }
    const creature = getCreature(entry.creatureId);
    if (!creature.mode || creature.mode === "machines") throw new Error("This Elemental-Devourer is not eligible for captured-character ownership.");
    seen.add(entry.instanceId);
    const copy = { instanceId: entry.instanceId, creatureId: entry.creatureId, locked: entry.locked };
    if ("acquisition" in entry) {
      if (entry.acquisition !== "banner-duplicate" || roseDuplicateMinimumLevel(creature.id) === void 0) throw new Error("Invalid Elemental-Devourer acquisition source.");
      copy.acquisition = entry.acquisition;
    }
    if ("level" in entry) {
      if (!Number.isInteger(entry.level) || typeof entry.level !== "number" || entry.level < 1 || entry.level > 120 || !("capturedStage" in entry) || typeof entry.capturedStage !== "number" || !creature.stages.includes(entry.capturedStage) || !("skills" in entry) || !Array.isArray(entry.skills)) throw new Error("Invalid captured Elemental-Devourer progression.");
      const expected = infusionEncounter(creature.mode, entry.capturedStage);
      if (creature.mode === "roses" && copy.acquisition !== "banner-duplicate" && expected.level > roseCaptureMaximumLevel) throw new Error("Roselius above level 120 cannot be captured.");
      const candidates = [expected.abilityMultiplier, expected.legacyAbilityMultiplier].map((multiplier) => enemySkills(expected.level, expected.boss, expected.ability, multiplier));
      const retained = entry.skills;
      const valid = candidates.find((skills) => retained.length === skills.length && retained.every((skill, index) => typeof skill === "object" && skill !== null && skill.name === skills[index].name && skill.multiplier === skills[index].multiplier && skill.every === skills[index].every && skill.action === skills[index].action));
      if (!valid || entry.level < Math.min(capturedLevelCap, copy.acquisition === "banner-duplicate" ? roseDuplicateMinimumLevel(creature.id) : expected.level)) throw new Error("Invalid retained enemy abilities or level.");
      copy.level = Math.min(capturedLevelCap, entry.level);
      copy.capturedStage = entry.capturedStage;
      copy.skills = valid;
    } else if ("skills" in entry || "capturedStage" in entry || "acquisition" in entry) throw new Error("Incomplete captured Elemental-Devourer progression.");
    if (creature.mode === "roses" && copy.level === void 0 && infusionEncounter(creature.mode, creature.stages[0]).level > roseCaptureMaximumLevel) throw new Error("Roselius above level 120 requires banner duplicate provenance.");
    return copy;
  });
}
function capturedProgress(copy) {
  const creature = getCreature(copy.creatureId);
  if (!creature.mode || creature.mode === "machines") throw new Error("Captured Elemental-Devourer mode is missing or non-capturable.");
  const stage = copy.capturedStage ?? creature.stages[0];
  const encounter2 = infusionEncounter(creature.mode, stage);
  const legacyLevel = creature.mode === "heavens" || creature.mode === "abyss" ? Math.round(80 + Math.ceil(encounter2.tier * 35 / 6) * 40 / 34) : encounter2.level;
  return {
    level: Math.min(capturedLevelCap, copy.level ?? legacyLevel),
    stage,
    tier: encounter2.tier,
    skills: copy.skills ?? enemySkills(encounter2.level, encounter2.boss, encounter2.ability, encounter2.legacyAbilityMultiplier)
  };
}
function capturedLevelCost(copy) {
  const { level } = capturedProgress(copy);
  if (level >= capturedLevelCap) throw new Error(`Maximum captured Elemental-Devourer level ${capturedLevelCap} reached.`);
  const creature = getCreature(copy.creatureId);
  return {
    fractalis: 10 + 2 * (level + 1),
    materials: levelingMaterials(creature.mode === "roses" ? "rosethorn" : creature.element, level + 1)
  };
}
function resolveCapturedFighter(copy, equipment, upgrades) {
  const creature = getCreature(copy.creatureId);
  if (!creature.mode || creature.mode === "machines") throw new Error("Captured Elemental-Devourer mode is missing or non-capturable.");
  const { level, tier, skills } = capturedProgress(copy);
  const reference = capturedEnemyStats(level, creature.mode === "roses" ? 140 : 120);
  const factor = 0.65 + 0.35 * tier / 5;
  const stats = {
    ...reference,
    health: reference.health * factor,
    damage: reference.damage * factor,
    defense: reference.defense * factor
  };
  const kit = {
    stats,
    passive: { name: "Retained enemy form", description: "Fixed captured form; no additional passive bonus.", damageBonus: 0, defenseBonus: 0, healFraction: 0 },
    abilities: {
      skill1: { name: "Unavailable", description: "This form has no retained first skill.", cooldown: 0, strength: {} },
      skill2: { name: "Unavailable", description: "This form has no retained second skill.", cooldown: 0, strength: {} },
      ultimate: { name: "Unavailable", description: "This form has no retained ultimate.", cooldown: 0, strength: {} }
    },
    unavailableActions: []
  };
  for (const action of ["skill1", "skill2", "ultimate"]) {
    const skill = skills.find((entry) => entry.action === action);
    if (!skill) kit.unavailableActions?.push(action);
    else kit.abilities[action] = {
      name: skill.name,
      cooldown: action === "ultimate" ? skill.every : 0,
      description: `${formatStat(skill.multiplier * 100)}% damage to one enemy; retained enemy skill.`,
      strength: { damageMultiplier: skill.multiplier }
    };
  }
  if (equipment) validateConduitElement(equipment, creature.element);
  applyConduitBuffs(kit.stats, equipment, upgrades);
  return kit;
}
function validateCharacterLocks(value2, owned) {
  if (typeof value2 !== "object" || value2 === null || Array.isArray(value2)) throw new Error("Invalid saved character locks.");
  const locks = {};
  for (const [id, locked] of Object.entries(value2)) {
    if (!isStarterId(id) || owned[id] === void 0 || typeof locked !== "boolean") throw new Error("Character locks require an owned character.");
    locks[id] = locked;
  }
  return locks;
}
function createCreatureCopy(creatureId, stage, level, acquisition) {
  const creature = getCreature(creatureId);
  if (!creature.mode) throw new Error("Elemental-Devourer ownership requires a playable game mode.");
  const capturedStage = stage ?? creature.stages[0];
  if (!creature.stages.includes(capturedStage)) throw new Error("Elemental-Devourer form does not occur at this stage.");
  const encounter2 = infusionEncounter(creature.mode, capturedStage);
  return validateCapturedCharacters([{
    instanceId: `capture:${crypto.randomUUID()}`,
    creatureId,
    locked: false,
    level: level ?? encounter2.level,
    capturedStage,
    ...acquisition ? { acquisition } : {},
    skills: enemySkills(encounter2.level, encounter2.boss, encounter2.ability, encounter2.abilityMultiplier)
  }])[0];
}

// src/content/character-art.ts
var evolutionTitles = {
  ...flagshipEvolutionTitles,
  ...warEvolutionTitles,
  ember: ["Beginner", "Embersteel Knight", "Phoenixflame Templar", "Prismatic Dawn Ascendant", "Seraph of the Heavenly Pyre", "Eternal Heavenflame Sovereign"],
  tide: ["Beginner", "Pearlcurrent Guard", "Tidalcrest Paladin", "Prismatic Wave Ascendant", "Seraph of the Celestial Tide", "Eternal Heavenwater Sovereign"],
  sprout: ["Beginner", "Leaflight Warden", "Bloomcrest Paladin", "Prismatic Garden Ascendant", "Seraph of the Heavenly Bloom", "Eternal Heavenbloom Sovereign"],
  rosetta: ["Gilded Rose", "Gilded Vow", "Daybreak Archer", "Seraph of Virtue", "Sovereign of Passion", "The Rose Beyond the Sun"],
  thornia: ["Burdened by Thorns", "Gilded Squire", "Forbidden Rose Knight", "Warden of the Shadow Garden", "Queen of Golden Shadows", "The Thousand-Rose Empress"],
  crinso: ["Rosebound Page", "Duality Initiate", "Crimson-Gold Knight", "Storm of the Twin Rose", "Sovereign of Beautiful Ruin", "The Rose Beyond Duality"]
};
function characterArt(id, evolution = 1) {
  characterLevelCap(evolution);
  const starter = getStarter(id);
  return {
    art: evolution === 1 ? starter.art : `${starter.art}-evo-${evolution}`,
    title: evolutionTitles[id][evolution - 1],
    available: true
  };
}
function characterName(id, evolution = 1) {
  return `${characterArt(id, evolution).title}, ${getStarter(id).name}`;
}

// src/content/elemental-war.ts
var elementalWars = [
  { character: "nerithe", name: "The Sea Without a Shore", element: "oceanic" },
  { character: "orvella", name: "The Throne Beneath the World", element: "botanic" },
  { character: "vaelor", name: "The Sky's Final Chord", element: "atmospheric" }
];
function warEncounter(character, stage) {
  const mode = elementalWars.find((entry) => entry.character === character);
  if (!mode || !Number.isInteger(stage) || stage < 1 || stage > warStageCount) throw new Error("Invalid Elemental War stage.");
  const level = Math.round(90 + 50 * (stage - 1) / 9);
  const evolution = Math.min(6, stage === 10 ? 6 : Math.ceil(stage / 2));
  const starter = getStarter(character);
  const stats = enemyCombatStats(level, true);
  const kit = warFighters[character];
  const skills = enemySkills(level, true, kit.abilities.skill1.name, enemyAbilityMultiplier(level));
  const ultimate = skills.find((skill) => skill.action === "ultimate");
  if (!ultimate) throw new Error("Elemental War boss ultimate is missing.");
  ultimate.name = kit.abilities.ultimate.name;
  return {
    ...mode,
    stage,
    level,
    evolution,
    tier: evolution - 1,
    forms: 6,
    boss: true,
    enemyName: characterName(character, evolution),
    art: characterArt(character, evolution).art,
    color: starter.color,
    stats,
    skills,
    background: `elemental-war-${character}-arena.png`,
    banner: `elemental-war-${character}-banner.png`
  };
}
function warLoot(stage) {
  warEncounter("orvella", stage);
  const t = (stage - 1) / 9;
  const multiplier = bossLootMultiplier({ war: { stage } });
  return {
    fractalis: bossLootRange({ minimum: Math.round(1500 + 3500 * t * t), maximum: Math.round(2500 + 5500 * t * t) }, multiplier),
    lycalis: { chance: 0.3 + 0.3 * t, quantity: Math.round(1 + 4 * t) * multiplier },
    recruitmentChance: stage === warStageCount ? 0.01 : 0
  };
}
function rollWarRewards(stage, currencyRandom, premiumRandom, recruitmentRandom) {
  const loot = warLoot(stage);
  const roll2 = (random) => {
    const value2 = random();
    if (!Number.isFinite(value2) || value2 < 0 || value2 >= 1) throw new Error("Invalid Elemental War reward roll.");
    return value2;
  };
  const amount = rollDrop({ ...loot.fractalis, chance: 1 }, currencyRandom);
  if (amount === void 0) throw new Error("Guaranteed Elemental War currency did not drop.");
  return {
    amount,
    lycalis: roll2(premiumRandom) < loot.lycalis.chance ? loot.lycalis.quantity : 0,
    recruitment: stage === warStageCount && roll2(recruitmentRandom) < loot.recruitmentChance
  };
}

// src/game/battle-debuffs.ts
function debuffSnapshot(target) {
  if (target.hp <= 0) return { weakened: 0, weakenFraction: 0 };
  const marks = Object.entries(target.conduitMarks ?? {}).filter((entry) => typeof entry[1] === "number" && Number.isInteger(entry[1]) && entry[1] > 0).sort(([left], [right]) => left.localeCompare(right)).map(([bearerId, stacks]) => ({ bearerId, stacks }));
  const elementalEffects = [];
  if (target.burn.turns > 0) {
    elementalEffects.push({
      family: "burn",
      kind: "burn",
      origin: target.burn.origin ?? "native",
      source: "living-self-authored-burn"
    });
  }
  if (target.weakened > 0) elementalEffects.push({
    family: "suppression",
    kind: "weaken",
    origin: target.weakenOrigin ?? "native",
    source: "authored-weaken"
  });
  if (marks.length) elementalEffects.push({
    family: "suppression",
    kind: "fracture",
    origin: "conduit",
    source: "conduit-fracture-mark"
  });
  return {
    ...target.burn.turns > 0 ? { burn: { damage: target.burn.damage, turns: target.burn.turns } } : {},
    weakened: target.weakened,
    weakenFraction: target.weakened > 0 ? target.weakenFraction : 0,
    ...marks.length ? { marks } : {},
    ...elementalEffects.length ? { elementalEffects } : {}
  };
}

// src/game/battle-buffs.ts
function buffSnapshot(unit) {
  if (unit.hp <= 0) return { shield: 0, recoverThrough: 0, protection: 0 };
  return {
    shield: unit.shield,
    recoverThrough: unit.recoverThrough,
    ...unit.attackBoost ? { attackBoost: { fraction: unit.attackBoost.fraction, throughRound: unit.attackBoost.throughRound } } : {},
    protection: unit.omnicProtection ?? 0
  };
}

// src/game/kit-pilots.ts
function charges(unit) {
  return unit.pilot ??= {};
}
function status(events, source, target, message, effect) {
  events.push({
    kind: "status",
    source: source.id,
    target: target.id,
    amount: 0,
    critical: false,
    message,
    debuffs: debuffSnapshot(target),
    ...target.side === "ally" ? { buffs: buffSnapshot(target) } : {},
    ...effect ? { elementalEffect: effect } : {}
  });
}
function nativeOwner(actor) {
  return actor.side === "ally" && actor.hp > 0 && !actor.captured;
}
function resourceLabel(key) {
  return Object.values(kitPilotDescriptions).find((description) => description.resource?.key === key)?.resource?.label ?? key;
}
function resourceEffect(owner) {
  return owner.kit?.pilot ? kitPilotDescriptions[owner.kit.pilot].resource?.effect : void 0;
}
function gainResource(owner, key, events) {
  if (!nativeOwner(owner)) return;
  const current = charges(owner);
  const amount = key === "bloom" && owner.conduits?.includes("botanic-graft-covenant") ? 1 + (owner.conduitRuntime?.numbers.graftBonus ?? 1) : 1;
  current[key] = (current[key] ?? 0) + amount;
  const label = resourceLabel(key);
  status(events, owner, owner, `${owner.name} gains ${label} (${current[key]}).`, resourceEffect(owner));
}
function spendResource(actor, key, events) {
  if (!nativeOwner(actor)) return 0;
  const available = Math.max(0, actor.pilot?.[key] ?? 0);
  const selective = key === "ember" && actor.masterConduit === "master-ember-3" || key === "tempest" && actor.masterConduit === "master-vaelor-2";
  const count2 = selective && actor.conduitRuntime?.numbers.ordinaryResourceSpend ? Math.min(1, available) : available;
  if (count2 <= 0) return 0;
  charges(actor)[key] = available - count2;
  const label = resourceLabel(key);
  status(events, actor, actor, `${actor.name} spends ${count2} ${label}.`, resourceEffect(actor));
  return count2;
}
var outgoingResources = {
  ember: { key: "ember", skill: "skill2", ordinary: 0.08, ultimate: 0.12 },
  "rose-duality": { key: "duality", skill: "skill1", ordinary: 0.08, ultimate: 0.12 },
  "rose-grace": { key: "roseGrace", ordinary: 0, ultimate: 0.1 },
  tempest: { key: "tempest", ordinary: 0.08, ultimate: 0.12 }
};
function pilotOutgoingBonus(actor, action, events) {
  const rule = actor.kit?.pilot ? outgoingResources[actor.kit.pilot] : void 0;
  if (!rule) return 0;
  const skill = actor.definitionId === "atmoso" || actor.definitionId === "elise" ? "skill1" : actor.definitionId === "vaelor" ? "skill2" : rule.skill;
  if (!(action === skill || action === "ultimate" && rule.ultimate !== void 0)) return 0;
  const spent = spendResource(actor, rule.key, events);
  const effective = actor.masterConduit === "master-ember-3" && action === "skill2" && spent > 0 ? 3 : spent;
  return effective * (action === "ultimate" ? rule.ultimate ?? 0 : rule.ordinary);
}
function pilotPrepareStarter(actor, action, events) {
  const bonus = { damage: 0, weaken: 0, shield: 0, healing: 1 };
  if (!nativeOwner(actor)) return bonus;
  if (actor.kit?.pilot === "ward" && (action === "skill1" || action === "ultimate")) {
    const count2 = spendResource(actor, "ward", events);
    if (action === "skill1") bonus.weaken = count2 * 0.05;
    else bonus.shield = actor.stats.health * count2 * 0.05;
  } else if (actor.kit?.pilot === "bloom" && (action === "skill1" || action === "ultimate")) {
    const count2 = spendResource(actor, "bloom", events);
    if (actor.definitionId === "sprout") {
      if (action === "skill1") bonus.damage = count2 * 0.1;
      else bonus.healing += count2 * 0.15;
    } else if (actor.definitionId === "bliss") {
      if (action === "skill1") bonus.damage = count2 * 0.08;
      else bonus.shield = actor.stats.health * count2 * 0.05;
    }
  } else if (actor.kit?.pilot === "rose-grace" && action === "skill1") {
    bonus.weaken = spendResource(actor, "roseGrace", events) * 0.05;
  } else if (actor.kit?.pilot === "thorn-aegis" && (action === "skill2" || action === "ultimate")) {
    const count2 = spendResource(actor, "thornAegis", events);
    if (action === "skill2") bonus.weaken = count2 * 0.05;
    else bonus.shield = actor.stats.health * count2 * 0.05;
  }
  return bonus;
}
function pilotEffectiveHeal(state, owner, target, amount, events) {
  if (amount <= 0 || !nativeOwner(owner)) return;
  if (owner.kit?.pilot === "bloom" && (owner.definitionId !== "bliss" || target.id !== owner.id)) {
    gainResource(owner, "bloom", events);
  }
  if (owner.kit?.pilot === "rose-grace") gainResource(owner, "roseGrace", events);
}
function pilotAuthoredShieldAbsorbed(state, sourceId, amount, events) {
  if (amount <= 0 || !sourceId) return;
  const owner = state.allies.find((ally) => ally.id === sourceId);
  if (!owner || !nativeOwner(owner)) return;
  if (owner.kit?.pilot === "ward") gainResource(owner, "ward", events);
  if (owner.kit?.pilot === "thorn-aegis") gainResource(owner, "thornAegis", events);
}
function pilotBurnDamage(state, owner, amount, events) {
  if (amount <= 0 || !nativeOwner(owner)) return;
  if (owner.kit?.pilot === "ember") gainResource(owner, "ember", events);
  if (owner.kit?.pilot === "rose-duality") gainResource(owner, "duality", events);
}
function pilotAfterDirectActivation(actor, action, events, effectiveCritical = false) {
  if (actor.kit?.pilot === "tempest" && effectiveCritical && (action === "light" || action === "skill1" || action === "skill2")) {
    gainResource(actor, "tempest", events);
  }
}

// src/game/native-kits.ts
var living = (state) => state.allies.filter((unit) => unit.hp > 0);
var foes = (state) => state.enemies.filter((unit) => unit.hp > 0);
var hasNativeIdentity = (unit) => !unit.captured && unit.kit?.nativeIdentity === true;
var nativeMemory = (unit) => unit.native ??= {};
function status2(events, owner, target, message, amount = 0) {
  events.push({
    kind: "status",
    source: owner.id,
    target: target.id,
    amount,
    critical: false,
    origin: "native",
    message,
    ...target.side === "enemy" ? { debuffs: debuffSnapshot(target) } : {}
  });
}
function attachNativeView(state, event2) {
  if (!event2 || !state.allies.some(hasNativeIdentity)) return;
  const units = {};
  for (const ally of state.allies) if (ally.native) units[ally.id] = structuredClone(ally.native);
  event2.nativeView = { round: state.round, units };
}
function fixed(state, owner, target, power2, kind, events, bypass = false) {
  if (owner.hp <= 0 || target.hp <= 0 || power2 <= 0) return;
  const attack = kind === "revenge" || kind === "demolition" ? power2 : owner.stats.damage;
  const damage = bypass ? Math.round(power2) : damageAmount(attack, power2 / attack, nativeTargetDefense(state, target), false);
  const absorbed = Math.min(target.shield, damage);
  target.shield -= absorbed;
  const loss = Math.min(target.hp, damage - absorbed);
  target.hp -= loss;
  events.push({
    kind: "damage",
    source: owner.id,
    target: target.id,
    amount: loss,
    critical: false,
    origin: "native",
    nativeKind: kind,
    periodic: kind === "burn",
    shieldRemaining: target.shield,
    shieldAbsorbed: absorbed,
    debuffs: debuffSnapshot(target),
    message: `${owner.name}: ${kind} deals ${loss} damage to ${target.name}${absorbed ? ` (${absorbed} shield absorbed)` : ""}.`
  });
}
function seed(state, owner, target, fraction, events) {
  fraction *= nativeSupportMultiplier(state, owner);
  if (equipped(owner, "botanic-graft-covenant")) fraction *= 1 + value(state, owner, "botanic-graft-covenant", 0.5, 1);
  const seeds = nativeMemory(owner).seeds ??= {};
  if ((seeds[target.id]?.fraction ?? 0) > fraction) return;
  seeds[target.id] = { fraction, dueRound: state.round + 1 };
  status2(events, owner, target, `${target.name} holds a ${fraction * 100}% Seed for the next player turn.`);
}
function releaseCyclone(state, owner, events) {
  const field = owner.native?.cyclone;
  if (!field) return;
  delete owner.native.cyclone;
  for (const target of foes(state)) fixed(state, owner, target, owner.stats.damage * (0.7 + 0.3 * field.gusts), "cyclone", events);
}
function recall(state, owner, events) {
  const blades = nativeMemory(owner).blades ??= [null, null];
  const targets = [...blades];
  blades[0] = blades[1] = null;
  for (const id of targets) {
    const target = state.enemies.find((enemy) => enemy.id === id && enemy.hp > 0);
    if (target) fixed(state, owner, target, owner.stats.damage * 0.9, "recall", events);
  }
  if (targets[0] && targets[0] === targets[1]) {
    const target = state.enemies.find((enemy) => enemy.id === targets[0] && enemy.hp > 0);
    if (target) fixed(state, owner, target, owner.stats.damage * 0.6, "recall", events);
  }
}
function nativeInstructionDamage(state, owner) {
  const instruction = owner.native?.instruction;
  return instruction && instruction.throughRound >= state.round && living(state).some((unit) => unit.id === instruction.owner) && instruction.kind !== "shelter" ? 1.3 : 1;
}
function nativeSupportMultiplier(state, owner) {
  const instruction = owner.native?.instruction;
  return instruction && instruction.throughRound >= state.round && living(state).some((unit) => unit.id === instruction.owner) && instruction.kind !== "strike" ? 1.35 : 1;
}
function nativeAction(state, owner, action, targetId, events, direct, activation) {
  const memory = nativeMemory(owner);
  const target = state.enemies.find((enemy) => enemy.id === targetId && enemy.hp > 0);
  const ally = state.allies.find((unit) => unit.id === targetId && unit.hp > 0);
  const hit = (coefficient, all = false, pierce = 0, crit = 0, chosen = target) => direct(all ? foes(state) : chosen ? [chosen] : [], coefficient * (action === "light" ? 1 : nativeBalance.skillDamageScale), pierce, crit);
  const allies = living(state);
  const other = allies.filter((unit) => unit.id !== owner.id);
  const acted = other.filter((unit) => unit.spent).length;
  const posture = acted === 0 ? "opening" : acted === other.length ? "closing" : "passing";
  const shield = (recipient, fraction, phases, firstReduction = 0) => nativeShield(
    state,
    owner,
    recipient,
    recipient.stats.health * fraction,
    events,
    { throughPhase: state.round + phases - 1, firstReduction }
  );
  const burn = (recipient, fraction) => {
    const burns = memory.burns ??= {};
    const previous = burns[recipient.id];
    const damage = applyConduitBurn(state, owner, recipient, owner.stats.damage * fraction, activation);
    burns[recipient.id] = { damage: Math.max(previous?.damage ?? 0, damage), turns: 3 };
    recipient.burn = { ...burns[recipient.id], sourceId: owner.id, origin: "native" };
    resetConduitBurnStreak(owner, recipient);
    status2(events, owner, recipient, `${recipient.name}: Infernis Burn, ${burns[recipient.id].damage} per phase for 3 phases.`);
  };
  if (action === "light") {
    hit(1);
    if (owner.definitionId === "nerithe" && target?.hp) {
      memory.survey = { target: target.id, points: memory.survey?.target === target.id ? memory.survey.points + 1 : 1 };
    }
    return;
  }
  switch (owner.definitionId) {
    case "ember":
      if (action === "skill1") {
        hit(1.6);
        if (target?.hp) burn(target, 0.25);
      }
      if (action === "skill2") {
        hit(1.1, true);
        for (const enemy of foes(state).filter((enemy2) => !equipped(owner, "master-ember-2") || enemy2.id === targetId)) {
          const stored = memory.burns?.[enemy.id];
          if (!stored) continue;
          const conserved = equipped(owner, "master-ember-3");
          const ticks = Math.min(conserved ? 1 : 2, stored.turns);
          stored.turns -= ticks;
          activation.spent.ember = (activation.spent.ember ?? 0) + ticks;
          fixed(state, owner, enemy, stored.damage * ticks * (conserved ? 2 : 1), "detonation", events, true);
          if (enemy.burn.sourceId === owner.id) enemy.burn.turns = stored.turns;
        }
      }
      if (action === "ultimate") {
        hit(2, true);
        for (const enemy of foes(state)) burn(enemy, 0.45);
      }
      break;
    case "tide":
      if (action === "skill1") {
        hit(1.5);
        if (target?.hp) applyConduitWeaken(state, owner, target, 0.25, events, action, 1);
      }
      if (action === "skill2" && ally) shield(ally, nativeBalance.tizu.shelter * (equipped(owner, "master-tide-2") ? 3 : 1), 1);
      if (action === "ultimate") for (const recipient of allies) shield(recipient, nativeBalance.tizu.oceanMemory, 2, 0.3);
      break;
    case "sprout":
      if (action === "skill1") {
        hit(1.4);
        const recipient = [...allies].sort((a, b) => a.hp / a.stats.health - b.hp / b.stats.health)[0];
        if (recipient) seed(state, owner, recipient, nativeBalance.flora.seed, events);
      }
      if (action === "skill2") {
        for (const recipient of allies) {
          const pending2 = memory.seeds?.[recipient.id];
          if (pending2) nativeHeal(state, owner, recipient, recipient.stats.health * pending2.fraction, events, true, activation, false);
        }
        delete memory.seeds;
        for (const recipient of allies) seed(state, owner, recipient, nativeBalance.flora.seed, events);
      }
      if (action === "ultimate") for (const recipient of allies) {
        nativeHeal(state, owner, recipient, recipient.stats.health * nativeBalance.flora.immediateHeal, events, true, activation);
        seed(state, owner, recipient, nativeBalance.flora.empoweredSeed, events);
      }
      break;
    case "atmoso":
      if (action === "skill1") {
        hit(1.8);
        releaseCyclone(state, owner, events);
      }
      if (action === "skill2") {
        releaseCyclone(state, owner, events);
        memory.cyclone = { gusts: 0, phases: 2, contributors: {} };
      }
      if (action === "ultimate") {
        releaseCyclone(state, owner, events);
        hit(2, true);
      }
      break;
    case "elise": {
      const blades = memory.blades ??= [null, null];
      if (action === "skill1") {
        const held = blades.indexOf(null);
        hit(held < 0 ? 1.4 : 1.1);
        if (held >= 0 && target?.hp) blades[held] = target.id;
      }
      if (action === "skill2") {
        if (blades.every((blade) => blade === null)) hit(1.4);
        else recall(state, owner, events);
      }
      if (action === "ultimate") {
        recall(state, owner, events);
        hit(2.6);
      }
      break;
    }
    case "bliss":
      if (action === "skill1") {
        hit(1.7, false, 0, posture === "opening" ? 0.25 : 0);
        if (posture === "closing") {
          const recipient = [...other].sort((a, b) => a.hp / a.stats.health - b.hp / b.stats.health)[0];
          if (recipient) nativeHeal(state, owner, recipient, recipient.stats.health * 0.06, events, true, activation);
        }
      }
      if (action === "skill2") {
        hit(1.2, true);
        if (posture === "opening") for (const recipient of allies) {
          const prior = recipient.attackBoost?.throughRound ?? 0;
          if (prior < state.round || (recipient.attackBoost?.fraction ?? 0) <= 0.1)
            recipient.attackBoost = { fraction: 0.1, throughRound: state.round, sourceId: owner.id, origin: "native" };
        }
        if (posture === "closing") for (const recipient of allies) shield(recipient, 0.06, 1);
        if (activation.healExtra > 0) for (const recipient of other)
          nativeHeal(state, owner, recipient, 0, events, true, activation);
      }
      if (action === "ultimate") {
        hit(2.5, true, 0, posture === "opening" ? 0.3 : 0);
        if (posture === "closing") for (const recipient of other)
          nativeHeal(state, owner, recipient, recipient.stats.health * 0.1, events, true, activation);
      }
      break;
    case "bruno":
      if (action === "skill1") hit(1.9);
      if (action === "skill2") {
        if (!other.length) memory.reduction = { fraction: 0.2, throughPhase: state.round };
        else if (ally && ally.id !== owner.id) memory.cover = { targets: [ally.id], fraction: equipped(owner, "master-bruno-3") ? 0.35 : 0.5, throughPhase: state.round };
      }
      if (action === "ultimate") {
        memory.cover = { targets: other.map((unit) => unit.id), fraction: 0.4, throughPhase: state.round + 1 };
        const shield2 = Math.max(
          owner.stats.health * 0.2,
          equipped(owner, "master-bruno-2") ? effectiveDefense(state, owner) * 2 : 0
        );
        nativeShield(state, owner, owner, shield2, events, { throughPhase: state.round + 1 });
      }
      break;
    case "disciple": {
      for (const recipient of state.allies) if (recipient.native?.instruction?.owner === owner.id)
        delete recipient.native.instruction;
      const recipients = action === "ultimate" ? allies : ally ? [ally] : [];
      for (const recipient of recipients) {
        nativeMemory(recipient).instruction = {
          kind: action === "skill1" ? "strike" : action === "skill2" ? "shelter" : "resolve",
          owner: owner.id,
          throughRound: state.round + (equipped(owner, "master-disciple-1") ? 3 : 1)
        };
        status2(events, owner, recipient, `${recipient.name} receives ${action === "skill1" ? "Strike" : action === "skill2" ? "Shelter" : "Resolve"} Instruction.`);
      }
      break;
    }
    case "aurora":
      if (action === "skill2") hit(1, true);
      if (action !== "ultimate") {
        const seals = memory.seals ??= {};
        for (const enemy of action === "skill1" ? target ? [target] : [] : foes(state)) {
          seals[enemy.id] = { fraction: Math.max(seals[enemy.id]?.fraction ?? 0, action === "skill1" ? 0.4 : 0.25), throughPhase: state.round + 2 };
          status2(events, owner, enemy, `${enemy.name} sealed through enemy phase ${state.round + 2}.`);
        }
      } else memory.ultimateWardThrough = state.round + 1;
      break;
    case "razor":
      if (action === "skill2") memory.bastion = { throughPhase: state.round, loss: 0 };
      else {
        const spent = memory.wounds ?? 0;
        memory.wounds = (memory.wounds ?? 0) - spent;
        hit(action === "skill1" ? 1.6 : 2.2);
        if (target?.hp) fixed(state, owner, target, spent * (action === "ultimate" ? 2 : 1), "revenge", events);
        if (action === "skill1" && target?.hp && equipped(owner, "master-razor-3") && !gear(target).numbers[`silenced:${owner.id}`]) {
          gear(target).numbers[`silenced:${owner.id}`] = 1;
          gear(target).numbers.silence = 1;
        }
      }
      break;
    case "rosetta": {
      let quarry = memory.quarry;
      if (action === "skill1" && target) {
        if (quarry?.target !== target.id) quarry = memory.quarry = { target: target.id, round: state.round, contributors: [] };
        hit(1.6);
      } else {
        const marked = foes(state).find((enemy) => enemy.id === quarry?.target);
        const contributors = quarry?.round === state.round ? quarry.contributors : [];
        hit(action === "ultimate" ? 3 : marked ? 2 + 0.25 * contributors.filter((id) => id !== owner.id).length : 1.6, false, 0, 0, marked ?? target);
        if (action === "ultimate" && contributors.length >= 2) for (const recipient of allies.filter((unit) => contributors.includes(unit.id)))
          nativeHeal(state, owner, recipient, recipient.stats.health * 0.1, events, true, activation);
      }
      break;
    }
    case "thornia": {
      const traps = memory.traps ??= {};
      if (action === "skill2") {
        const charged = traps[targetId]?.charges === 3;
        hit(1.7, charged && equipped(owner, "master-thornia-2"));
        if (charged && equipped(owner, "master-thornia-2")) for (const enemy of foes(state)) {
          if (enemy.id !== targetId) {
            enemy.weakened = Math.max(enemy.weakened, 1);
            enemy.weakenFraction = Math.max(enemy.weakenFraction, 0.15);
            enemy.weakenSourceId = owner.id;
            enemy.weakenOrigin = "conduit";
          }
        }
        if (target?.hp && (traps[target.id]?.charges ?? 0) > 0) {
          traps[target.id].charges--;
          fixed(state, owner, target, owner.stats.damage * 0.8, "trap", events);
        }
      } else {
        if (action === "ultimate") hit(1.4, true);
        for (const enemy of action === "skill1" ? target ? [target] : [] : foes(state)) {
          traps[enemy.id] = { charges: 3, coefficient: Math.max(traps[enemy.id]?.coefficient ?? 0, action === "ultimate" ? 0.9 : 0.6), throughPhase: state.round + 2 };
          status2(events, owner, enemy, `${enemy.name}: 3 Thorn trap charges through enemy phase ${state.round + 2}.`);
        }
      }
      break;
    }
    case "crinso":
      if (action === "skill1") {
        hit(1.6, false, memory.edge === "crimson" ? 0.2 : 0);
        memory.combo = memory.edge === "crimson" ? (memory.combo ?? 0) + 1 : 0;
        memory.edge = "gold";
      } else if (action === "skill2") {
        hit(memory.edge === "gold" ? 2.4 : 2);
        memory.combo = memory.edge === "gold" ? (memory.combo ?? 0) + 1 : 0;
        memory.edge = "crimson";
      } else {
        const combo = memory.combo ?? 0;
        memory.combo = 0;
        delete memory.edge;
        activation.spent.duality = combo;
        hit(2.6 + 0.45 * combo, false, combo >= 3 ? 0.3 : 0);
      }
      break;
    case "nerithe": {
      if (action === "skill2" && equipped(owner, "master-nerithe-2")) break;
      const surveyed = foes(state).find((enemy) => enemy.id === memory.survey?.target);
      if (action === "skill2") {
        if (memory.survey && target) memory.survey.target = target.id;
        hit(1.3, true);
      } else {
        const spent = surveyed ? Math.min(memory.survey?.points ?? 0, action === "skill1" ? 1 : Infinity) : 0;
        if (memory.survey) memory.survey.points -= spent;
        hit(action === "skill1" ? 1.8 : 2.8, false, spent * (action === "skill1" ? 0.25 : 0.15), 0, surveyed ?? target);
      }
      break;
    }
    case "orvella":
      if (action === "skill1") {
        hit(memory.foundation ? 1.4 : 1.8);
        if (memory.foundation) {
          memory.foundation.durability += owner.stats.health * 0.08;
          memory.foundation.maximum = Math.max(memory.foundation.maximum, memory.foundation.durability);
        }
      } else if (action === "skill2") {
        const plating = equipped(owner, "master-orvella-1");
        const maximum = owner.stats.health * (plating ? 0.15 : 0.3);
        memory.foundation = { durability: maximum, maximum, throughPhase: state.round + 2 };
        if (plating) for (const recipient of allies)
          generatedShield(owner, recipient, Math.min(recipient.stats.health * 0.15, owner.stats.health * 0.05), events, true, recipient.stats.health * 0.15, true);
      } else {
        const power2 = memory.foundation?.durability ?? 0;
        delete memory.foundation;
        hit(2, true);
        for (const enemy of foes(state)) fixed(state, owner, enemy, power2, "demolition", events);
      }
      break;
    case "vaelor":
      if (action === "skill1") hit(1.7, false, 0, (memory.beat ?? 0) === 0 ? 0.3 : 0);
      if (action === "skill2") {
        hit(1.2, true);
        if (memory.beat === 1) owner.attackBoost = {
          fraction: Math.max(owner.attackBoost?.fraction ?? 0, 0.2),
          throughRound: Math.max(owner.attackBoost?.throughRound ?? 0, state.round + 1),
          sourceId: owner.id,
          origin: "native"
        };
      }
      if (action === "ultimate") hit((memory.beat ?? 0) === 2 ? 3.4 : 2.6, true);
      break;
    default:
      throw new Error(`Missing native identity for ${owner.definitionId}.`);
  }
}
function nativeAfterAction(state, owner, action, priorInstruction, events) {
  if (priorInstruction && owner.native?.instruction === priorInstruction) delete owner.native.instruction;
  for (const caster of living(state).filter(hasNativeIdentity)) {
    const field = caster.native?.cyclone;
    if (field && caster.id !== owner.id && field.contributors[owner.id] !== state.round) {
      field.contributors[owner.id] = state.round;
      field.gusts += 1;
      status2(events, caster, caster, `Cyclone holds ${field.gusts} Gusts.`);
    }
  }
  nativeCleanup(state);
}
function nativePrimaryHit(state, attacker, target, effective, events) {
  if (!effective) return;
  for (const owner of living(state).filter(hasNativeIdentity)) {
    const quarry = owner.native?.quarry;
    if (!quarry || quarry.target !== target.id) continue;
    if (quarry.round !== state.round) {
      quarry.round = state.round;
      quarry.contributors = [];
    }
    if (!quarry.contributors.includes(attacker.id)) quarry.contributors.push(attacker.id);
    if (quarry.contributors.length >= 2) {
      const contributors = living(state).filter((unit) => quarry.contributors.includes(unit.id));
      if (equipped(owner, "master-rosetta-1")) {
        const recipient = [...living(state)].sort((a, b) => a.hp / a.stats.health - b.hp / b.stats.health)[0];
        if (recipient) nativeShield(state, owner, recipient, recipient.stats.health * 0.48, events);
      } else for (const ally of contributors) nativeShield(state, owner, ally, ally.stats.health * 0.08, events);
    }
  }
}
function nativeIncomingMultiplier(state, enemy, target, action, events) {
  let multiplier = 1;
  if (target.native?.reduction && target.native.reduction.throughPhase >= state.round) multiplier *= 1 - target.native.reduction.fraction;
  if (target.native?.bastion && target.native.bastion.throughPhase >= state.round) multiplier *= 0.7;
  let hostile = enemy.native?.hostileReduction;
  if (hostile === void 0) {
    hostile = 1;
    for (const owner of living(state).filter(hasNativeIdentity)) {
      if (action !== "light") {
        const seal = owner.native?.seals?.[enemy.id];
        if (seal && seal.throughPhase >= state.round) {
          hostile *= 1 - seal.fraction;
          delete owner.native.seals[enemy.id];
          status2(events, owner, enemy, `${enemy.name}'s Seal is consumed by its special.`);
        }
      }
      if (action === "ultimate" && (owner.native?.ultimateWardThrough ?? 0) >= state.round) hostile *= 0.5;
    }
    nativeMemory(enemy).hostileReduction = hostile;
  }
  return multiplier * hostile;
}
function nativeRouteDamage(state, enemy, target, amount, events, redirect) {
  let remaining = amount;
  const bruno = living(state).find((unit) => unit.id !== target.id && unit.native?.cover && unit.native.cover.throughPhase >= state.round && unit.native.cover.targets.includes(target.id));
  if (bruno?.native?.cover) {
    const routed = remaining * bruno.native.cover.fraction;
    remaining -= routed;
    redirect(bruno, routed * 0.75);
  }
  for (const owner of living(state)) {
    const foundation = owner.native?.foundation;
    if (!foundation || foundation.throughPhase < state.round) continue;
    const absorbed = Math.min(foundation.durability, remaining * 0.2);
    foundation.durability -= absorbed;
    remaining -= absorbed;
    status2(events, owner, target, `Foundation absorbs ${absorbed}; ${foundation.durability} durability remains.`, absorbed);
    if (foundation.durability <= 0) delete owner.native.foundation;
  }
  return remaining;
}
function nativeDirectHpLoss(state, target, loss, events) {
  if (hasNativeIdentity(target) && target.definitionId === "razor" && loss > 0) {
    const memory = nativeMemory(target);
    memory.wounds = (memory.wounds ?? 0) + loss;
    if (memory.bastion?.throughPhase === state.round) memory.bastion.loss += loss;
    status2(events, target, target, `${target.name} banks ${memory.wounds} Wounds.`, memory.wounds);
  }
}
function nativeAbsorbedHit(state, target, nativeOwners, loss, events) {
  if (loss !== 0) return;
  for (const [id, absorbed] of nativeOwners) {
    const owner = living(state).find((unit) => unit.id === id && hasNativeIdentity(unit) && unit.definitionId === "tide");
    if (!owner || absorbed <= 0) continue;
    nativeGauge(state, target, 8, events);
  }
}
function nativeEnemyCompleted(state, enemy, damaging, events) {
  if (!damaging) return;
  for (const owner of living(state).filter(hasNativeIdentity)) {
    const trap = owner.native?.traps?.[enemy.id];
    if (trap && trap.charges > 0 && trap.throughPhase >= state.round) {
      trap.charges--;
      if (equipped(owner, "master-thornia-1")) {
        for (const target of foes(state)) generatedStrike(state, owner, target, owner.stats.damage * 0.4, events, false);
      } else fixed(state, owner, enemy, owner.stats.damage * trap.coefficient, "trap", events);
    }
  }
}
function nativeBurnPhase(state, enemy, events) {
  for (const owner of living(state).filter(hasNativeIdentity)) {
    const burn = owner.native?.burns?.[enemy.id];
    if (!burn || burn.turns <= 0 || enemy.hp <= 0) continue;
    const otherBurn = enemy.burn.sourceId !== owner.id ? enemy.burn : void 0;
    enemy.burn = { ...burn, sourceId: owner.id, origin: "native" };
    const tick = conduitBurnTick(state, owner, enemy);
    burn.turns--;
    enemy.burn.turns = burn.turns;
    const previous = enemy.hp;
    fixed(state, owner, enemy, tick, "burn", events, true);
    afterConduitBurn(state, owner, enemy, previous - enemy.hp, events);
    burn.turns = enemy.burn.turns;
    if (otherBurn) enemy.burn = otherBurn;
  }
}
function nativePhaseEnd(state, events) {
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
    for (const [id, trap] of Object.entries(memory.traps ?? {})) if (trap.throughPhase <= state.round || trap.charges <= 0) delete memory.traps[id];
    for (const [id, seal] of Object.entries(memory.seals ?? {})) if (seal.throughPhase <= state.round) delete memory.seals[id];
  }
  nativeCleanup(state);
}
function nativeTurnStart(state, events) {
  for (const owner of living(state).filter(hasNativeIdentity)) {
    const memory = nativeMemory(owner);
    if (owner.definitionId === "vaelor" && memory.beatRound !== state.round) {
      memory.beat = ((memory.beat ?? 0) + 1) % 3;
      memory.beatRound = state.round;
    }
    const healing = { healed: 0, overheal: 0 };
    for (const [id, pending2] of Object.entries(memory.seeds ?? {})) {
      if (pending2.dueRound > state.round) continue;
      delete memory.seeds[id];
      const target = living(state).find((unit) => unit.id === id);
      if (target) nativeHeal(state, owner, target, target.stats.health * pending2.fraction, events, true, healing, false);
    }
    finishNativeHealing(state, owner, healing, events);
  }
  for (const ally of state.allies) if (ally.native?.instruction && ally.native.instruction.throughRound < state.round) delete ally.native.instruction;
}
function nativeCleanup(state) {
  const live = new Set(foes(state).map((unit) => unit.id));
  for (const enemy of state.enemies) {
    if (enemy.burn.origin !== "conduit" && state.allies.some((owner) => owner.id === enemy.burn.sourceId && hasNativeIdentity(owner) && owner.hp <= 0))
      enemy.burn.turns = 0;
  }
  for (const ally of state.allies) {
    if (!ally.native) continue;
    if (ally.hp <= 0) {
      delete ally.native;
      continue;
    }
    if (ally.native.instruction && !living(state).some((owner) => owner.id === ally.native?.instruction?.owner))
      delete ally.native.instruction;
    if (ally.native.blades) ally.native.blades = ally.native.blades.map((id) => id && live.has(id) ? id : null);
    if (ally.native.survey && !live.has(ally.native.survey.target)) delete ally.native.survey;
    if (ally.native.quarry && !live.has(ally.native.quarry.target)) delete ally.native.quarry;
    for (const key of ["burns", "traps", "seals"])
      for (const id of Object.keys(ally.native[key] ?? {})) if (!live.has(id)) delete ally.native[key][id];
  }
}

// src/game/calamitic-conduits.ts
function power(state, owner, id, base, maximum) {
  return calamiticPower(state.conduitUpgrades?.[id] ?? 0, base, maximum);
}
function status3(owner, amount, message, events) {
  events.push({ kind: "status", source: owner.id, target: owner.id, amount, critical: false, origin: "conduit", message });
}
function calamiticActionReason(state, owner, action) {
  const n = owner.conduitRuntime?.numbers;
  if (n?.calamiticThroneSkip === state.round) return "Tomorrow is owed to the Throne; cannot act this turn.";
  if (n?.calamiticThroneArmed === state.round && (action === "ultimate" || action === "light")) {
    return "The borrowed action must be an available ordinary skill.";
  }
  return null;
}
function prepareCalamiticAction(state, owner, action) {
  if (!equipped(owner, "calamitic-throne-borrowed-tomorrows")) return false;
  const n = gear(owner).numbers;
  if (n.calamiticThroneArmed === state.round && action !== "light") {
    delete n.calamiticThroneArmed;
    n.calamiticThroneSkip = state.round + 1;
    n.calamiticThroneGrant = state.round;
    return false;
  }
  if (action === "light" && n.calamiticThroneUsed !== state.round && n.calamiticThroneSkip !== state.round + 1) {
    n.calamiticThroneArmed = state.round;
    n.calamiticThroneUsed = state.round;
    return true;
  }
  return false;
}
function afterCalamiticAction(state, owner, action, events) {
  if (owner.hp <= 0) return;
  const n = gear(owner).numbers;
  if (n.calamiticThroneArmed === state.round && action === "light") {
    status3(owner, 1, `${owner.name} may borrow one ordinary skill; using it costs the next player turn.`, events);
  }
  if (n.calamiticThroneGrant === state.round) {
    delete n.calamiticThroneGrant;
    generatedGauge(owner, owner, power(state, owner, "calamitic-throne-borrowed-tomorrows", 10, 30), events);
    status3(owner, state.round + 1, `${owner.name} borrowed tomorrow and cannot act on turn ${state.round + 1}.`, events);
  }
  if (action === "light" && equipped(owner, "calamitic-world-eater-orrery") && (n.calamiticOrrery ?? 0) > 0) {
    const reserve = n.calamiticOrrery;
    n.calamiticOrrery = 0;
    const target = state.enemies.filter((enemy) => enemy.hp > 0).sort((a, b) => b.hp - a.hp)[0];
    status3(owner, reserve, `${owner.name}'s World-Eater's Orrery releases ${Math.round(reserve)} stored force.`, events);
    generatedStrike(state, owner, target, reserve, events, false);
  }
  if (equipped(owner, "calamitic-cathedral-final-equation")) {
    const bit = 1 << ["light", "skill1", "skill2", "ultimate"].indexOf(action);
    const previous = n.calamiticEquation ?? 0;
    const mask = previous & bit ? bit : previous | bit;
    const count2 = mask.toString(2).replace(/0/g, "").length;
    n.calamiticEquation = count2 === 3 ? 0 : mask;
    status3(owner, count2, `${owner.name}'s Final Equation: ${count2} / 3 different actions${count2 === 3 ? " \u2001Edischarge" : ""}.`, events);
    if (count2 === 3) {
      const targets = state.enemies.filter((enemy) => enemy.hp > 0);
      const offer = owner.stats.damage * power(state, owner, "calamitic-cathedral-final-equation", 1.2, 2.4);
      for (const target of targets) generatedStrike(state, owner, target, offer / targets.length, events, false);
    }
  }
}
function calamiticShieldBypass(state, owner) {
  return equipped(owner, "calamitic-horizon-cleaving-godpress") ? power(state, owner, "calamitic-horizon-cleaving-godpress", 0.4, 0.6) : 0;
}
function calamiticSiegeBonus(state, owner, target) {
  return target.shield > 0 && equipped(owner, "calamitic-horizon-cleaving-godpress") ? power(state, owner, "calamitic-horizon-cleaving-godpress", 0.3, 0.6) : 0;
}
function deferCalamiticDamage(state, owner, offered, events) {
  if (offered <= 0 || !equipped(owner, "calamitic-causality-funeral-engine")) return offered;
  const n = gear(owner).numbers;
  const deferredOffer = offered * power(state, owner, "calamitic-causality-funeral-engine", 0.4, 0.6);
  const deferred = Math.floor(deferredOffer + Number.EPSILON * Math.max(1, Math.abs(deferredOffer)));
  if (deferred <= 0) return offered;
  n.calamiticDebt = (n.calamiticDebt ?? 0) + deferred;
  n.calamiticDebtDue = state.round + 1;
  status3(owner, deferred, `${owner.name}'s Funeral Engine defers ${deferred} HP damage until Enemy Turn ${state.round + 1}.`, events);
  return Math.max(0, offered - deferred);
}
function bankCalamiticDamage(state, loss) {
  if (loss <= 0) return;
  for (const owner of state.allies.filter((ally) => ally.hp > 0 && equipped(ally, "calamitic-world-eater-orrery"))) {
    const n = gear(owner).numbers;
    n.calamiticOrrery = (n.calamiticOrrery ?? 0) + loss * power(state, owner, "calamitic-world-eater-orrery", 0.4, 0.8);
  }
}
function settleCalamiticDebt(state, events) {
  for (const owner of state.allies) {
    const n = owner.conduitRuntime?.numbers;
    if (!n || !n.calamiticDebt || n.calamiticDebtDue > state.round) continue;
    const debt = n.calamiticDebt;
    delete n.calamiticDebt;
    delete n.calamiticDebtDue;
    if (owner.hp <= 0) continue;
    const loss = Math.min(owner.hp, debt);
    owner.hp -= loss;
    events.push({
      kind: "damage",
      source: owner.id,
      target: owner.id,
      amount: loss,
      critical: false,
      origin: "conduit",
      periodic: true,
      shieldRemaining: owner.shield,
      message: `${owner.name} pays ${loss} HP to the Funeral Engine${owner.hp === 0 ? " \u2001Edefeated" : ""}.`
    });
  }
}

// src/game/conduit-runtime.ts
var conduitRulesVersion = 4;
function gear(unit) {
  return unit.conduitRuntime ??= { numbers: {}, owners: {} };
}
function equipped(unit, id) {
  return unit.conduits?.some((slot) => slot === id) === true || !unit.captured && unit.masterConduit === id;
}
function value(state, unit, id, base, maximum) {
  const range2 = conduitRedesign[id]?.ranges.find((range3) => Math.abs(range3.base - base) < 1e-9 && Math.abs(range3.maximum - maximum) < 1e-9 || Math.abs(range3.base / 100 - base) < 1e-9 && Math.abs(range3.maximum / 100 - maximum) < 1e-9);
  if (!range2) throw new Error(`Unregistered coefficient for ${id} on ${unit.id}: ${base} -> ${maximum}.`);
  const scale = Math.abs(range2.base - base) < 1e-9 ? 1 : 0.01;
  return redesignValue(state.conduitUpgrades?.[id] ?? 0, range2.base, range2.maximum) * scale;
}
function step(state, id, base, maximum) {
  const range2 = conduitRedesign[id]?.ranges.find((range3) => range3.step && range3.base === base && range3.maximum === maximum);
  if (!range2) throw new Error(`Unregistered stepped coefficient for ${id}: ${base} -> ${maximum}.`);
  return redesignStep(state.conduitUpgrades?.[id] ?? 0, range2.base, range2.maximum);
}
function alive(state) {
  return state.allies.filter((unit) => unit.hp > 0);
}
function injured(state, owner, other = false) {
  return alive(state).filter((unit) => (!other || unit.id !== owner.id) && unit.hp < unit.stats.health).sort((a, b) => a.hp / a.stats.health - b.hp / b.stats.health)[0];
}
function lowestGauge(state, owner) {
  return alive(state).filter((unit) => unit.id !== owner.id && unit.shatter < unit.stats.shatterCapacity).sort((a, b) => a.shatter - b.shatter)[0];
}
function healthiestEnemy(state, excluded) {
  return state.enemies.filter((unit) => unit.hp > 0 && unit.id !== excluded).sort((a, b) => b.hp - a.hp)[0];
}
function emit(events, kind, owner, target, amount, message, native = false) {
  events.push({
    kind,
    source: owner.id,
    target: target.id,
    amount,
    critical: false,
    origin: native ? "native" : "conduit",
    message,
    ...target.side === "ally" ? { buffs: buffSnapshot(target) } : { debuffs: debuffSnapshot(target) },
    ...kind === "shield" || kind === "damage" ? { shieldRemaining: target.shield } : {}
  });
}
function overhealShield(owner, target, excess, events) {
  const amount = Math.round(excess) - target.shield;
  if (amount <= 0 || target.hp <= 0) return 0;
  target.shield += amount;
  emit(events, "shield", owner, target, amount, `${target.name}'s excess healing becomes a ${target.shield} Shield.`);
  return amount;
}
function healingReceived(target) {
  if (!target.conduitRuntime?.layers?.length) return 1;
  return 1 + Math.max(0, ...layers(target).filter((layer) => layer.amount > 0).map((layer) => layer.healBonus ?? 0));
}
function generatedHeal(owner, target, offer, events) {
  if (!target || target.hp <= 0) return 0;
  const healing = Math.max(0, Math.round(offer * healingReceived(target)));
  const amount = Math.min(target.stats.health - target.hp, healing);
  overhealShield(owner, target, healing - Math.max(0, amount), events);
  if (amount <= 0) return 0;
  target.hp += amount;
  emit(events, "heal", owner, target, amount, `${owner.name}'s Conduit restores ${amount} HP to ${target.name}.`);
  return amount;
}
function generatedGauge(owner, target, offer, events, native = false) {
  if (!target || target.hp <= 0) return 0;
  const amount = Math.min(target.stats.shatterCapacity - target.shatter, Math.max(0, offer));
  if (amount <= 0) return 0;
  target.shatter += amount;
  emit(events, "status", owner, target, amount, native ? `${target.name} gains ${amount} Elemental Gauge.` : `${owner.name}'s Conduit gives ${target.name} ${amount} Elemental Gauge.`, native);
  return amount;
}
function layers(unit) {
  const memory = gear(unit);
  const list = memory.layers ??= [];
  const recorded = list.reduce((sum, layer) => sum + layer.amount, 0);
  if (recorded < unit.shield) list.unshift({
    amount: unit.shield - recorded,
    owner: unit.pilot?.authoredShieldSourceId ?? unit.id,
    native: !!unit.pilot?.authoredShieldSourceId
  });
  if (recorded > unit.shield) {
    let excess = recorded - unit.shield;
    for (const layer of list) {
      const spent = Math.min(layer.amount, excess);
      layer.amount -= spent;
      excess -= spent;
    }
  }
  return list;
}
function generatedShield(owner, target, offer, events, additive = false, _cap = Infinity, plate = false) {
  if (!target || target.hp <= 0) return 0;
  const list = layers(target);
  const amount = Math.max(0, Math.round(additive ? offer : offer - target.shield));
  if (amount <= 0) return 0;
  list.push({ amount, owner: owner.id, native: false, ...plate ? { plate } : {} });
  target.shield += amount;
  emit(events, "shield", owner, target, amount, `${owner.name}'s Conduit shields ${target.name} for ${amount}.`);
  return amount;
}
function expireNativeShields(state, events) {
  for (const target of [...state.allies, ...state.enemies]) {
    const list = layers(target);
    const expiredByOwner = /* @__PURE__ */ new Map();
    for (const layer of list) {
      if (!layer.native || layer.expiresAfterPhase === void 0 || layer.expiresAfterPhase > state.round) continue;
      expiredByOwner.set(layer.owner, (expiredByOwner.get(layer.owner) ?? 0) + layer.amount);
      target.shield -= layer.amount;
      layer.amount = 0;
    }
    if (!expiredByOwner.size) continue;
    gear(target).layers = list.filter((layer) => layer.amount > 0);
    for (const [id, amount] of expiredByOwner) {
      if (amount <= 0) continue;
      const owner = state.allies.find((ally) => ally.id === id) ?? target;
      emit(events, "status", owner, target, amount, `${target.name} loses ${Math.round(amount)} expired Shield.`, true);
    }
  }
}
function consumeShield(unit, amount) {
  const list = layers(unit);
  let remaining = amount;
  const native = /* @__PURE__ */ new Map();
  const before = /* @__PURE__ */ new Map();
  for (const layer of list) if (layer.native) before.set(layer.owner, (before.get(layer.owner) ?? 0) + layer.amount);
  for (const layer of [...list.filter((layer2) => !layer2.plate), ...list.filter((layer2) => layer2.plate)]) {
    const spent = Math.min(layer.amount, remaining);
    layer.amount -= spent;
    remaining -= spent;
    unit.shield -= spent;
    if (layer.native && spent > 0) native.set(layer.owner, (native.get(layer.owner) ?? 0) + spent);
    if (remaining <= 0) break;
  }
  const broken = /* @__PURE__ */ new Set();
  for (const [id, total] of before) if ((native.get(id) ?? 0) >= total && total > 0) broken.add(id);
  gear(unit).layers = list.filter((layer) => layer.amount > 0);
  return { absorbed: amount - remaining, native, broken };
}
function payShield(unit, amount) {
  return consumeShield(unit, Math.min(unit.shield, Math.max(0, amount))).absorbed;
}
function generatedStrike(state, owner, target, offer, events, mitigated = true) {
  if (!target || target.hp <= 0 || offer <= 0) return 0;
  const damage = Math.max(1, Math.round(mitigated ? offer : offer * owner.stats.damage / Math.max(1, owner.stats.damage + effectiveDefense(state, target))));
  const absorbed = consumeShield(target, damage).absorbed;
  const loss = Math.min(target.hp, damage - absorbed);
  target.hp -= loss;
  emit(events, "damage", owner, target, loss, `${owner.name}'s Conduit strikes ${target.name} for ${loss}.`);
  return loss;
}
function initializeConduits(state) {
  state.conduitRulesVersion = conduitRulesVersion;
  for (const unit of [...state.allies, ...state.enemies]) {
    gear(unit).numbers.entryDefense = unit.stats.defense;
    if (unit.side === "ally" && equipped(unit, "fracture-reservoir")) {
      unit.shatter = Math.min(unit.stats.shatterCapacity, unit.shatter + value(state, unit, "fracture-reservoir", 5, 10));
    }
    if (unit.side === "ally" && equipped(unit, "twinpulse-bellows")) {
      unit.shatter = Math.min(unit.stats.shatterCapacity, unit.shatter + unit.stats.shatterCapacity * value(state, unit, "twinpulse-bellows", 0.15, 0.35));
    }
  }
}
function effectiveDefense(state, unit) {
  let defense = unit.stats.defense;
  const n = unit.conduitRuntime?.numbers ?? {};
  if (equipped(unit, "master-orvella-3") && unit.hp > 0) {
    const foundation = unit.native?.foundation;
    const protectedByFoundation = foundation && foundation.durability > 0 && foundation.throughPhase >= state.round;
    defense += (n.entryDefense ?? defense) * 0.2 * alive(state).filter((ally) => ally.shield > 0 || protectedByFoundation).length;
  }
  if (unit.side === "enemy") {
    defense = Math.max(0, defense - (n.excavated ?? 0));
  } else if (unit.hp > 0) {
    for (const keeper of alive(state).filter((ally) => ally.id !== unit.id && equipped(ally, "tectonic-faultkeeper-loom")))
      defense += keeper.stats.defense * value(state, keeper, "tectonic-faultkeeper-loom", 0.15, 0.3);
  }
  return defense;
}
function nativeTargetDefense(state, target) {
  const exposed = alive(state).some((owner) => equipped(owner, "master-aurora-1") && nativeControl(state, owner, target));
  return effectiveDefense(state, target) * (exposed ? 0.85 : 1);
}
function nativeControl(state, owner, target) {
  return (owner.native?.seals?.[target.id]?.throughPhase ?? 0) >= state.round || target.weakened > 0 && target.weakenSourceId === owner.id && target.weakenOrigin !== "conduit";
}
function conduitActionCost(actor, action, state, base) {
  const n = actor.conduitRuntime?.numbers ?? {};
  if (action === "light") {
    const cost = solaceCost(state, actor);
    return cost !== void 0 && actor.shatter >= cost ? cost : 0;
  }
  if (action === "skill1" && n.quietFeather) return 0;
  let discount = 0;
  if ((action === "skill1" || action === "skill2") && n.tailwind && equipped(actor, "atmospheric-skythread-rudder")) {
    discount += value(state, actor, "atmospheric-skythread-rudder", 10, 20) * n.tailwind;
  }
  if (action === "ultimate" && n.stormCount && equipped(actor, "atmospheric-storm-clock")) {
    discount += value(state, actor, "atmospheric-storm-clock", 15, 30) * n.stormCount;
  }
  if (base > 0 && equipped(actor, "coilfeed-ratchet")) {
    const cut = Math.floor(base * value(state, actor, "coilfeed-ratchet", 0.07, 0.14));
    discount += action === "ultimate" ? Math.min(cut, Math.max(0, base - discount - 70)) : cut;
  }
  return base === 0 ? 0 : Math.max(1, base - discount);
}
function solaceCost(state, actor) {
  if (!equipped(actor, "solace-anchor") || actor.conduitRuntime?.numbers.solaceRound === state.round) return void 0;
  return Math.max(0, Math.round(value(state, actor, "solace-anchor", 10, 5)));
}
function recoveryNormal(actor) {
  return equipped(actor, "chaotic-paradox-spindle");
}
function conduitActionBlocked(_actor, _state) {
  return false;
}
function prepareConduitAction(state, actor, action, paid, nativeAll) {
  const n = gear(actor).numbers;
  const ctx = {
    action,
    paid,
    bonus: 0,
    criticalBonus: 0,
    guaranteed: false,
    forbidden: false,
    all: nativeAll,
    nativeAll,
    scale: 1,
    impacts: 1,
    hits: [],
    overheal: 0,
    healed: 0,
    spent: {},
    healExtra: 0,
    shieldBurn: 0,
    burnPaid: false,
    freeAction: false,
    eclipseTargets: []
  };
  n.ordinaryResourceSpend = action === "skill2" ? 1 : 0;
  if (action === "light" && solaceCost(state, actor) === paid) {
    n.solaceRound = state.round;
    ctx.freeAction = true;
  }
  if (prepareCalamiticAction(state, actor, action)) ctx.freeAction = true;
  if (action === "skill1" && n.quietFeather) n.quietFeather--;
  if ((action === "skill1" || action === "skill2") && n.tailwind) delete n.tailwind;
  const offensive = action === "light" || actor.kit?.abilities[action].strength.damageMultiplier !== void 0;
  if (offensive && equipped(actor, "parallax-relay")) ctx.criticalBonus += value(state, actor, "parallax-relay", 0.15, 0.3);
  if (offensive && equipped(actor, "ruinselect-prism"))
    ctx.bonus += Math.floor(Math.max(0, actor.stats.health - actor.hp) / (actor.stats.health * 0.1)) * value(state, actor, "ruinselect-prism", 0.03, 0.06);
  if (offensive && equipped(actor, "infernic-pyre-census"))
    ctx.bonus += state.enemies.filter((enemy) => enemy.hp > 0 && enemy.burn.turns > 0 && enemy.burn.sourceId === actor.id).length * value(state, actor, "infernic-pyre-census", 0.1, 0.2);
  if (offensive && equipped(actor, "glassroot-gimbal")) ctx.bonus += Math.floor((actor.shatter + paid) / 10) * value(state, actor, "glassroot-gimbal", 0.01, 0.02);
  ctx.guaranteed = equipped(actor, "falcon-sight") && (n.noncritical ?? 0) >= 2;
  ctx.forbidden = equipped(actor, "verdict-caliper") || action === "light" && equipped(actor, "judgment-lens");
  if (equipped(actor, "verdict-caliper")) ctx.bonus += value(state, actor, "verdict-caliper", 0.35, 0.7);
  if (action === "light") {
    if (equipped(actor, "siegebound-drive")) ctx.bonus += value(state, actor, "siegebound-drive", 0.08, 0.16);
    if (equipped(actor, "nullsong-transmission")) ctx.bonus += value(state, actor, "nullsong-transmission", 0.4, 0.8);
    if (actor.recoverThrough >= state.round && recoveryNormal(actor)) ctx.scale *= value(state, actor, "chaotic-paradox-spindle", 0.5, 0.75);
    if (equipped(actor, "master-atmoso-1")) {
      ctx.all = true;
      ctx.scale *= 0.7;
    }
  } else {
    if (action === "skill1" && equipped(actor, "prism-splinter-socket")) ctx.bonus += value(state, actor, "prism-splinter-socket", 0.1, 0.2);
    if (action === "skill2" && equipped(actor, "crosspin-governor")) ctx.bonus += value(state, actor, "crosspin-governor", 0.1, 0.2);
    if (action !== "ultimate" && equipped(actor, "nullsong-transmission")) ctx.bonus += value(state, actor, "nullsong-transmission", -0.12, -0.24);
    if (action !== "ultimate" && equipped(actor, "voltaic-stormstep-dynamo") && n.previousSkill && n.previousSkill !== (action === "skill1" ? 1 : 2)) {
      ctx.bonus += value(state, actor, "voltaic-stormstep-dynamo", 0.25, 0.5);
    }
    if (action !== "ultimate" && n.verdant) {
      ctx.bonus += n.verdant;
      delete n.verdant;
    }
  }
  n.previousSkill = offensive ? action === "skill1" ? 1 : action === "skill2" ? 2 : 0 : 0;
  if (nativeAll && state.enemies.filter((enemy) => enemy.hp > 0).length === 1 && equipped(actor, "siege-cantilever")) ctx.bonus += value(state, actor, "siege-cantilever", 0.6, 1.2);
  if (action === "ultimate") {
    if (equipped(actor, "atmospheric-storm-clock")) n.stormCount = 0;
    if (equipped(actor, "worldbreaker-drive")) ctx.bonus += value(state, actor, "worldbreaker-drive", 0.35, 0.7);
    if (equipped(actor, "master-nerithe-3")) ctx.scale *= 0.5;
    if (equipped(actor, "master-elise-2")) {
      ctx.impacts = 4;
      ctx.scale *= 1.2;
    }
    if (equipped(actor, "master-razor-2")) ctx.bonus += payShield(actor, actor.shield) / actor.stats.health * 2;
    if (equipped(actor, "master-vaelor-1")) {
      actor.hp -= Math.min(actor.hp - 1, actor.hp * 0.2);
      ctx.bonus += 0.75;
    }
    if (equipped(actor, "chaotic-ouroboros-core")) {
      const excess = actor.shatter;
      actor.shatter = 0;
      n.excessShield = excess * value(state, actor, "chaotic-ouroboros-core", 3e-3, 6e-3) * actor.stats.health;
    }
  }
  if (action === "skill2" && equipped(actor, "master-ember-2")) {
    ctx.all = false;
    ctx.scale *= 2;
  }
  if (action === "skill1" && equipped(actor, "master-bliss-2")) {
    ctx.impacts = 2;
    ctx.scale *= 1.4;
  }
  if (action === "skill2" && equipped(actor, "master-crinso-2")) ctx.shieldBurn = payShield(actor, actor.shield) * 0.5;
  if (action === "skill2" && equipped(actor, "master-bliss-1")) {
    const count2 = alive(state).filter((ally) => ally.id !== actor.id).length;
    if (count2 && actor.hp - actor.stats.health * 0.1 >= 1) {
      ctx.healExtra = actor.stats.health * 0.1 / count2;
      actor.hp -= actor.stats.health * 0.1;
    }
  }
  if (equipped(actor, "master-atmoso-2") && n.counterwind) {
    if (offensive) ctx.bonus += n.counterwind;
    delete n.counterwind;
    delete n.counterwindActive;
  }
  if (equipped(actor, "master-crinso-3")) {
    if (!n.crimson || action === "ultimate") ctx.bonus += 0.3;
  }
  if (action === "skill2" && hasNativeIdentity(actor) && equipped(actor, "master-crinso-1")) {
    ctx.bonus += n.goldImprint ?? 0;
    delete n.goldImprint;
  }
  return ctx;
}
function conduitHitModifiers(state, actor, target, ctx, critical) {
  let bonus = ctx.bonus + calamiticSiegeBonus(state, actor, target);
  let pierce = 0;
  const action = ctx.action;
  if (target.hp >= target.stats.health && equipped(actor, "breach-pendulum")) bonus += value(state, actor, "breach-pendulum", 0.2, 0.4);
  if (target.hp <= target.stats.health * 0.25 && equipped(actor, "execution-orrery")) bonus += value(state, actor, "execution-orrery", 0.5, 1);
  if (action === "skill1" && equipped(actor, "spearwheel-engine")) pierce += value(state, actor, "spearwheel-engine", 0.15, 0.3);
  if (target.weakened > 0 && target.weakenSourceId === actor.id && target.weakenOrigin !== "conduit" && equipped(actor, "ominous-eclipse-mantle")) {
    pierce += value(state, actor, "ominous-eclipse-mantle", 0.4, 0.6);
    ctx.eclipseTargets.push(target.id);
  }
  if (action === "light") {
    const marks = target.conduitMarks?.[actor.id] ?? 0;
    if (marks) {
      bonus += marks * value(state, actor, "ominous-nightglass-archive", 0.1, 0.2);
      delete target.conduitMarks?.[actor.id];
    }
  }
  const targetMemory = gear(target);
  for (const owner of state.allies) {
    if (owner.id === actor.id) continue;
    const sootPrefix = `soot:${owner.id}:`;
    const sootKeys = Object.keys(targetMemory.numbers).filter((key) => key.startsWith(sootPrefix));
    const activeSoot = sootKeys.filter((key) => {
      if (targetMemory.numbers[key] >= state.round) return true;
      delete targetMemory.numbers[key];
      return false;
    });
    const legacySoot = `soot:${owner.id}`;
    const hasLegacySoot = targetMemory.numbers[legacySoot] !== void 0 && targetMemory.numbers[legacySoot] >= state.round;
    if (hasLegacySoot) delete targetMemory.numbers[legacySoot];
    if (activeSoot.length || hasLegacySoot) {
      bonus += value(state, owner, "sootwake-crucible", 0.2, 0.4) * (activeSoot.length + Number(hasLegacySoot));
      for (const key of activeSoot) delete targetMemory.numbers[key];
    }
    const openingKey = `opening:${owner.id}`;
    const openings = targetMemory.numbers[openingKey] ?? 0;
    if (openings > 0 && (hasNativeIdentity(owner) || target.weakened > 0 && target.weakenSourceId === owner.id)) {
      bonus += 0.4;
      if (!hasNativeIdentity(owner)) target.weakened--;
      if (openings > 1) targetMemory.numbers[openingKey] = openings - 1;
      else delete targetMemory.numbers[openingKey];
    }
  }
  if (equipped(actor, "master-atmoso-3") && !ctx.forbidden) bonus += Math.max(0, actor.stats.crit + ctx.criticalBonus - 1);
  if (critical && equipped(actor, "master-elise-1")) pierce += 0.5;
  return {
    bonus,
    pierce,
    attack: actor.stats.damage,
    ...critical && equipped(actor, "master-elise-1") ? { critMultiplier: 1.5 } : {}
  };
}
function resetConduitBurnStreak(owner, target) {
  const n = gear(target).numbers;
  n[`cinder:${owner.id}`] = 0;
  n[`extensions:${owner.id}`] = 0;
}
function applyConduitBurn(state, owner, target, base, ctx) {
  let bonus = 0;
  if (equipped(owner, "starvein-conductor")) {
    const payment = owner.stats.health * 0.05;
    if (!ctx.burnPaid && owner.hp - payment >= 1) {
      owner.hp -= payment;
      ctx.burnPaid = true;
    }
    if (ctx.burnPaid) bonus += value(state, owner, "starvein-conductor", 0.3, 0.6);
  }
  const damage = Math.round((base + ctx.shieldBurn) * (1 + bonus));
  if (target.burn.turns <= 0 || damage >= target.burn.damage) resetConduitBurnStreak(owner, target);
  return damage;
}
function afterConduitImpact(owner, target, ctx) {
  if (ctx.eclipseTargets.includes(target.id) && target.weakened > 0 && target.weakenSourceId === owner.id) {
    target.weakened--;
    if (!target.weakened) {
      target.weakenFraction = 0;
      delete target.weakenSourceId;
      delete target.weakenOrigin;
    }
  }
}
function applyConduitWeaken(state, owner, target, fraction, events, action = "skill1", baseDuration = 2) {
  if (equipped(owner, "master-bruno-3") && action === "skill1") {
    gear(target).numbers.excavated = (gear(target).numbers.excavated ?? 0) + (gear(target).numbers.entryDefense ?? target.stats.defense) * 0.15;
    emit(events, "status", owner, target, gear(target).numbers.excavated, `${target.name}'s Battle-start Defense is excavated.`);
    return;
  }
  const duration = baseDuration + (equipped(owner, "opal-indexer") ? step(state, "opal-indexer", 1, 2) : 0);
  const strength = fraction + (equipped(owner, "tension-governor") ? value(state, owner, "tension-governor", 0.05, 0.1) : 0);
  if (target.weakened > 0 && target.weakenFraction > strength) {
    emit(events, "status", owner, target, target.weakenFraction, `${target.name}'s stronger Weaken remains unchanged.`);
    return;
  }
  target.weakened = duration;
  target.weakenFraction = strength;
  target.weakenSourceId = owner.id;
  target.weakenOrigin = owner.kit?.pilot === "rose-grace" || owner.kit?.pilot === "thorn-aegis" || owner.kit?.pilot === "rose-duality" ? "rose" : "native";
  const n = gear(target).numbers;
  if (equipped(owner, "aquatic-undertide-chronometer") && !n[`undertide:${owner.id}`]) {
    n[`undertide:${owner.id}`] = 1;
    n.scheduleShift = (n.scheduleShift ?? 0) + step(state, "aquatic-undertide-chronometer", 1, 2);
  }
  if (equipped(owner, "master-razor-3") && !n[`silenced:${owner.id}`]) {
    n[`silenced:${owner.id}`] = 1;
    n.silence = 1;
  }
  if (equipped(owner, "master-tide-3")) applyTaunt(owner, target);
  emit(events, "status", owner, target, strength, `${target.name} has ${Math.round(strength * 100)}% [Weaken] for ${target.weakened} Enemy Turns.`, true);
}
function supportEffect(state, owner, target, events) {
  if (owner.id !== target.id && equipped(owner, "tranquilitic-accord-bastion") && !gear(target).owners.accord && !gear(target).numbers.accordGranted) {
    gear(target).owners.accord = owner.id;
    gear(target).numbers.accordGranted = 1;
    emit(events, "status", owner, target, 1, `${target.name} receives one Accord lethal-hit protection.`);
  }
}
function nativeHeal(state, owner, target, offer, events, active, ctx, instruction = active) {
  if (target.hp <= 0) return 0;
  if (instruction) offer *= nativeSupportMultiplier(state, owner);
  let bonus = active && equipped(owner, "springwell-pump") ? value(state, owner, "springwell-pump", 0.2, 0.4) : 0;
  offer = Math.max(0, offer * (1 + bonus) + (active && owner.id !== target.id ? ctx?.healExtra ?? 0 : 0)) * healingReceived(target);
  const restored = Math.min(target.stats.health - target.hp, offer);
  const wasted = offer - restored;
  if (ctx) {
    ctx.overheal += wasted;
    ctx.healed += restored;
  }
  if (active && wasted > 0 && equipped(owner, "efflorescent-worldtree-heart")) {
    const seed2 = wasted * value(state, owner, "efflorescent-worldtree-heart", 0.5, 1);
    const key = `seed:${owner.id}`;
    gear(target).numbers[key] = (gear(target).numbers[key] ?? 0) + seed2;
  }
  overhealShield(owner, target, wasted, events);
  if (restored <= 0) return 0;
  target.hp += restored;
  emit(events, "heal", owner, target, restored, `${owner.name} restores ${restored} HP to ${target.name}.`, true);
  pilotEffectiveHeal(state, owner, target, restored, events);
  supportEffect(state, owner, target, events);
  if (active && owner.id !== target.id && equipped(owner, "efflorescent-verdant-covenant")) gear(target).numbers.verdant = Math.max(gear(target).numbers.verdant ?? 0, value(state, owner, "efflorescent-verdant-covenant", 0.2, 0.4));
  return restored;
}
function finishNativeHealing(state, owner, ctx, events) {
  if (equipped(owner, "rootbound-triage-vault") && ctx.healed > 0 && owner.shatter >= 15) {
    const threshold = value(state, owner, "rootbound-triage-vault", 0.2, 0.4);
    const ally = alive(state).filter((ally2) => ally2.hp < ally2.stats.health * threshold).sort((a, b) => a.hp / a.stats.health - b.hp / b.stats.health)[0];
    if (ally) {
      const restored = generatedHeal(owner, ally, ally.stats.health * threshold - ally.hp, events);
      if (restored > 0) owner.shatter -= 15;
    }
  }
}
function nativeShield(state, owner, target, offer, events, options = {}) {
  if (target.hp <= 0) return;
  offer *= nativeSupportMultiplier(state, owner);
  let bonus = equipped(owner, "wardglass-transformer") ? value(state, owner, "wardglass-transformer", 0.2, 0.4) : 0;
  if (owner.id === target.id && owner.hp <= owner.stats.health * 0.75 && equipped(owner, "pale-bulwark-diadem")) bonus += value(state, owner, "pale-bulwark-diadem", 0.25, 0.5);
  offer *= 1 + bonus;
  if (equipped(owner, "citadel-spine")) offer += effectiveDefense(state, owner) * value(state, owner, "citadel-spine", 0.1, 0.2);
  if (equipped(owner, "meridian-inverter")) {
    generatedHeal(owner, target, offer * value(state, owner, "meridian-inverter", 0.75, 1.5), events);
    return;
  }
  const plate = equipped(owner, "master-orvella-1");
  const finalOffer = offer * (plate ? 0.5 : 1);
  const list = layers(target);
  const existing = target.shield - (plate ? list.filter((layer) => layer.plate).reduce((sum, layer) => sum + layer.amount, 0) : 0);
  const gained = Math.max(0, finalOffer - existing);
  const owned = list.filter((layer) => layer.native && layer.owner === owner.id && layer.amount > 0);
  for (const layer of owned) {
    if (options.throughPhase !== void 0 && layer.expiresAfterPhase !== void 0)
      layer.expiresAfterPhase = Math.max(layer.expiresAfterPhase, options.throughPhase);
  }
  if (options.firstReduction !== void 0 && owned.length) {
    for (const layer of owned) delete layer.firstReduction;
    owned[0].firstReduction = options.firstReduction;
  }
  if (gained > 0) {
    list.push({
      amount: gained,
      owner: owner.id,
      native: true,
      ...options.throughPhase !== void 0 ? { expiresAfterPhase: options.throughPhase } : {},
      ...options.firstReduction !== void 0 && !owned.length ? { firstReduction: options.firstReduction } : {}
    });
    target.shield += gained;
    target.pilot ??= {};
    target.pilot.authoredShieldSourceId = owner.id;
    supportEffect(state, owner, target, events);
    if (target.id !== owner.id && equipped(owner, "aegis-return-spring")) {
      const n = gear(owner).numbers;
      gear(target).numbers.criticalSeal = (gear(target).numbers.criticalSeal ?? 0) + 1;
    }
  }
  emit(events, "shield", owner, target, gained, `${target.name} has ${target.shield} shield.`, true);
  if (equipped(owner, "ward-stitch-spool")) {
    const healBonus = value(state, owner, "ward-stitch-spool", 0.2, 0.4);
    for (const layer of layers(target)) if (layer.native && layer.owner === owner.id) layer.healBonus = healBonus;
  }
  if (plate) {
    const prior = layers(target).filter((layer) => layer.plate && layer.owner === owner.id).reduce((sum, layer) => sum + layer.amount, 0);
    const amount = Math.max(0, Math.round(offer * 0.5) - prior);
    generatedShield(owner, target, amount, events, true, Infinity, true);
  }
}
function nativeGauge(state, target, offer, events, conduit = false) {
  if (offer <= 0 || target.hp <= 0) return;
  if (!conduit && equipped(target, "reserve-torque-crank")) offer += Math.max(1, Math.round(offer * value(state, target, "reserve-torque-crank", 0.1, 0.25)));
  const link = state.allies.find((owner) => owner.hp > 0 && equipped(owner, "master-disciple-2") && (gear(owner).numbers.linkThrough ?? 0) >= state.round && gear(target).owners.link === owner.id);
  const overflow = Math.max(0, target.shatter + offer - target.stats.shatterCapacity);
  if (link) {
    const linked = alive(state).filter((ally) => gear(ally).owners.link === link.id);
    for (const ally of linked) generatedGauge(target, ally, offer / linked.length, events);
  } else generatedGauge(target, target, offer, events, true);
  if (overflow > 0 && equipped(target, "clearwater-manifold")) {
    generatedGauge(target, lowestGauge(state, target), overflow * value(state, target, "clearwater-manifold", 0.5, 1), events);
  }
}
function recordConduitHit(ctx, target, amount, critical, criticalMultiplier, overkill = 0) {
  ctx.hits.push({ target: target.id, damage: amount, critical, criticalMultiplier, ...overkill > 0 ? { overkill } : {} });
}
function adjustBurnTurns(owner, target, delta) {
  target.burn.turns = Math.max(0, target.burn.turns + delta);
  const stored = owner.native?.burns?.[target.id];
  if (stored && target.burn.sourceId === owner.id && target.burn.origin !== "conduit")
    stored.turns = target.burn.turns;
}
function finishConduitAction(state, owner, ctx, events) {
  const n = gear(owner).numbers;
  finishNativeHealing(state, owner, ctx, events);
  if (equipped(owner, "master-nerithe-2") && ctx.action === "skill2") {
    for (const ally of alive(state)) {
      nativeGauge(state, ally, 15, events, true);
      ally.omnicProtection = 1 - (1 - (ally.omnicProtection ?? 0)) * 0.85;
    }
  }
  const damage = ctx.hits.reduce((sum, hit) => sum + hit.damage, 0);
  const critical = ctx.hits.find((hit) => hit.critical && hit.damage > 0);
  const primaryHit = ctx.hits[0];
  const target = state.enemies.find((enemy) => enemy.id === primaryHit?.target);
  const killed = ctx.hits.some((hit) => hit.damage > 0 && state.enemies.some((enemy) => enemy.id === hit.target && enemy.hp <= 0));
  if (critical && ctx.action !== "ultimate" && equipped(owner, "atmospheric-storm-clock"))
    n.stormCount = (n.stormCount ?? 0) + ctx.hits.filter((hit) => hit.critical && hit.damage > 0).length;
  if (!damage) n.previousSkill = 0;
  if (ctx.action === "light") {
    n.normalRound = state.round;
    if (equipped(owner, "atmospheric-skythread-rudder")) n.tailwind = (n.tailwind ?? 0) + 1;
    if (equipped(owner, "tranquilitic-kirin-cradle")) generatedHeal(
      owner,
      alive(state).sort((a, b) => a.hp / a.stats.health - b.hp / b.stats.health)[0],
      effectiveDefense(state, owner) * value(state, owner, "tranquilitic-kirin-cradle", 0.5, 1),
      events
    );
    if (equipped(owner, "tectonic-atlas-bastion")) {
      n.tauntRound = state.round;
      for (const enemy of state.enemies.filter((enemy2) => enemy2.hp > 0)) {
        applyTaunt(owner, enemy);
      }
    }
    if (equipped(owner, "master-vaelor-3")) {
      const ally = alive(state).filter((ally2) => ally2.id !== owner.id && ally2.spent && ally2.recoverThrough < state.round).sort((a, b) => b.shatter - a.shatter)[0];
      if (ally) {
        ally.spent = false;
        emit(events, "status", owner, ally, 1, `${owner.name} donates an action to ${ally.name}.`);
      }
    }
  }
  for (const id of owner.conduits ?? []) {
    if (!id) continue;
    switch (id) {
      case "falcon-sight":
        if (ctx.hits.length) n.noncritical = ctx.guaranteed || ctx.hits.some((hit) => hit.critical) ? 0 : (n.noncritical ?? 0) + 1;
        break;
      case "lifeline-flywheel":
        generatedHeal(owner, owner, damage * value(state, owner, id, 0.08, 0.16), events);
        break;
      case "voltaic-thunderbird-coil":
        for (const hit of ctx.hits.filter((hit2) => hit2.critical && hit2.damage > 0)) generatedStrike(state, owner, healthiestEnemy(state, hit.target), hit.damage * value(state, owner, id, 0.3, 0.6), events);
        break;
      case "atmospheric-griffin-turbine":
        if (ctx.action === "light" && damage > 0) {
          const gauge = Math.min(25, Math.round(100 * damage / Math.max(1, owner.stats.damage) * value(state, owner, id, 0.15, 0.3)));
          for (const ally of alive(state).filter((ally2) => ally2.id !== owner.id)) generatedGauge(owner, ally, gauge, events);
        }
        break;
      case "luminous-seraph-mirror":
        for (const hit of ctx.hits.filter((hit2) => hit2.critical && hit2.damage > 0)) for (const ally of alive(state)) generatedHeal(owner, ally, hit.damage * value(state, owner, id, 0.08, 0.16), events);
        break;
      case "chaotic-ouroboros-core":
        if (ctx.action === "ultimate") {
          generatedShield(owner, owner, n.excessShield ?? 0, events);
          delete n.excessShield;
        }
        break;
      case "luminous-dawn-witness-array":
        if (ctx.hits.some((hit) => hit.critical)) {
          if (target?.hp && (n.witness ?? 0) > 0) {
            generatedStrike(state, owner, target, owner.stats.damage * n.witness * value(state, owner, id, 0.15, 0.3), events, false);
            n.witness = 0;
          }
        } else if (ctx.action === "light") n.witness = (n.witness ?? 0) + 1;
        break;
      case "ominous-nightglass-archive":
        if (ctx.action !== "light") for (const hit of ctx.hits) {
          const enemy = state.enemies.find((enemy2) => enemy2.id === hit.target && enemy2.hp > 0);
          if (enemy) {
            enemy.conduitMarks ??= {};
            enemy.conduitMarks[owner.id] = (enemy.conduitMarks[owner.id] ?? 0) + 1;
          }
        }
        break;
      case "tempered-strike-link":
        if (ctx.action === "light") for (const hit of ctx.hits) {
          const enemy = state.enemies.find((enemy2) => enemy2.id === hit.target && enemy2.hp > 0 && enemy2.burn.turns > 0 && enemy2.burn.sourceId === owner.id && enemy2.burn.origin !== "conduit");
          if (!enemy) continue;
          const tick = conduitBurnTick(state, owner, enemy);
          adjustBurnTurns(owner, enemy, -1);
          generatedStrike(state, owner, enemy, tick * value(state, owner, id, 0.8, 1.6), events);
        }
        break;
      case "mending-valve":
        for (const hit of ctx.hits.filter((hit2) => hit2.damage > 0 && state.enemies.some((enemy) => enemy.id === hit2.target && enemy.hp <= 0)))
          generatedHeal(owner, injured(state, owner), owner.stats.health * value(state, owner, id, 0.08, 0.16), events);
        break;
      case "pulse-trigger-pawl":
        if (critical && (ctx.action === "skill1" || ctx.action === "skill2")) generatedGauge(owner, owner, value(state, owner, id, 8, 16), events);
        break;
      case "resonance-crucible":
        for (const hit of ctx.hits.filter((hit2) => (hit2.overkill ?? 0) > 0))
          generatedStrike(state, owner, healthiestEnemy(state, hit.target), (hit.overkill ?? 0) * value(state, owner, id, 0.3, 0.6), events);
        break;
      case "flare-focusing-iris":
        if ((ctx.spent.ember ?? 0) > 0) for (const enemy of state.enemies.filter((enemy2) => enemy2.hp > 0 && enemy2.burn.turns > 0 && enemy2.burn.sourceId === owner.id && enemy2.burn.origin !== "conduit")) {
          const turns = ctx.spent.ember * step(state, id, 1, 2);
          adjustBurnTurns(owner, enemy, turns);
          emit(events, "status", owner, enemy, turns, `${enemy.name}'s [Burn] lasts ${turns} more Enemy Turns.`);
        }
        break;
      case "pressurecrest-governor":
        if (critical) n.windveil = 1;
        break;
      case "chaotic-fault-verdict":
        for (const hit of ctx.hits.filter((hit2) => hit2.critical && hit2.damage > 0)) {
          const enemy = state.enemies.find((enemy2) => enemy2.id === hit.target && enemy2.hp > 0);
          if (enemy) generatedStrike(state, owner, enemy, payShield(owner, owner.shield) * value(state, owner, id, 0.5, 1), events);
        }
        break;
    }
  }
  switch (owner.masterConduit) {
    case "master-bruno-3":
      if (hasNativeIdentity(owner) && ctx.action === "skill1" && damage > 0 && target?.hp) {
        const memory = gear(target).numbers;
        const base = memory.entryDefense ?? target.stats.defense;
        memory.excavated = (memory.excavated ?? 0) + base * 0.15;
        emit(events, "status", owner, target, memory.excavated, `${target.name}'s Battle-start Defense is excavated.`);
      }
      break;
    case "master-sprout-2":
      if (ctx.action === "skill1" && damage > 0 && target && target.hp > 0 && !gear(target).numbers[`rooted:${owner.id}`]) {
        gear(target).numbers[`rooted:${owner.id}`] = 1;
        gear(target).numbers.rootbind = 1;
      }
      break;
    case "master-sprout-3":
      if (ctx.action === "ultimate" && !n.worldseedRevived) {
        const fallen = state.allies.filter((ally) => ally.id !== owner.id && ally.hp <= 0);
        if (fallen.length) n.worldseedRevived = 1;
        for (const ally of fallen) revive(owner, ally, 0.3, events);
      }
      break;
    case "master-atmoso-2":
      if (ctx.action === "skill2") {
        n.counterwindActive = 1;
        n.counterwind = 0;
      }
      break;
    case "master-aurora-2":
      if (ctx.action === "ultimate") for (const enemy of state.enemies.filter((enemy2) => enemy2.hp > 0)) gear(enemy).numbers.judgmentThrough = state.round + 1;
      break;
    case "master-bliss-3":
      if (ctx.action === "ultimate") {
        const ally = alive(state).filter((ally2) => ally2.id !== owner.id && !ally2.kit?.unavailableActions?.includes("skill1")).sort((a, b) => a.shatter - b.shatter)[0];
        if (ally) gear(ally).numbers.quietFeather = (gear(ally).numbers.quietFeather ?? 0) + 1;
      }
      break;
    case "master-disciple-2":
      if (ctx.action === "ultimate") {
        n.linkThrough = state.round + 2;
        for (const ally of alive(state)) gear(ally).owners.link = owner.id;
      }
      break;
    case "master-disciple-3":
      if (ctx.action === "skill1") {
        const instructed = alive(state).find((ally2) => ally2.native?.instruction?.owner === owner.id && ally2.native.instruction.kind === "strike");
        const ally = hasNativeIdentity(owner) ? instructed : alive(state).filter((ally2) => ally2.id !== owner.id).sort((a, b) => b.stats.damage - a.stats.damage)[0];
        const victim = hasNativeIdentity(owner) ? state.enemies.find((enemy) => enemy.hp > 0) : target;
        if (ally && victim?.hp && (hasNativeIdentity(owner) || damage > 0)) {
          if (!ally.kit) throw new Error("The assisting squad member has no frozen ability kit.");
          const passive = ally.hp <= ally.stats.health / 2 ? 1 + ally.kit.passive.damageBonus : 1;
          const buff = ally.attackBoost && ally.attackBoost.throughRound >= state.round ? 1 + ally.attackBoost.fraction : 1;
          generatedStrike(state, ally, victim, ally.stats.damage * 0.4 * passive * buff, events, false);
        }
      }
      break;
    case "master-elise-3":
      if (killed && owner.recoverThrough < state.round) {
        owner.spent = false;
      }
      break;
    case "master-rosetta-2":
      if (ctx.action === "skill2" && hasNativeIdentity(owner) || ctx.action === "skill1" && (ctx.spent.roseGrace ?? 0) > 0) {
        for (const enemy of state.enemies.filter((enemy2) => enemy2.hp > 0 && enemy2.id !== target?.id))
          generatedStrike(state, owner, enemy, (primaryHit?.damage ?? 0) * 0.25, events);
      }
      break;
    case "master-rosetta-3":
      if (ctx.action === "ultimate") for (const enemy of state.enemies.filter((enemy2) => enemy2.hp > 0 && (hasNativeIdentity(owner) ? enemy2.id === owner.native?.quarry?.target : enemy2.weakened > 0 && enemy2.weakenSourceId === owner.id))) {
        const memory = gear(enemy).numbers, key = `opening:${owner.id}`;
        memory[key] = (memory[key] ?? 0) + 1;
      }
      break;
    case "master-thornia-3":
      if (ctx.action === "skill1") for (const ally of alive(state).filter((ally2) => ally2.id !== owner.id)) {
        gear(ally).owners.guardian = owner.id;
        gear(ally).numbers.guardianRound = state.round;
      }
      break;
    case "master-crinso-1":
      if (ctx.action === "skill1" && primaryHit?.critical && target?.hp) {
        if (hasNativeIdentity(owner)) n.goldImprint = (n.goldImprint ?? 0) + Math.max(0, primaryHit.criticalMultiplier - 1);
        else gear(target).numbers[`imprint:${owner.id}`] = primaryHit.criticalMultiplier;
      }
      break;
    case "master-crinso-2":
      if (hasNativeIdentity(owner) && ctx.action === "skill2" && target?.hp && ctx.shieldBurn > 0)
        generatedStrike(state, owner, target, ctx.shieldBurn, events, false);
      break;
    case "master-crinso-3":
      if (!ctx.hits.length) break;
      if (ctx.action === "ultimate" || n.crimson) generatedHeal(owner, owner, damage * 0.2, events);
      n.crimson = ctx.action === "ultimate" ? 0 : n.crimson ? 0 : 1;
      break;
    case "master-nerithe-1":
      if (ctx.action === "light" && target?.hp) gear(target).owners.chart = owner.id;
      break;
    case "master-orvella-2":
      if (ctx.action === "skill2") {
        const allies = alive(state).filter((ally) => ally.hp < ally.stats.health);
        if (allies.length) {
          const reserve = hasNativeIdentity(owner) ? owner.native?.foundation?.durability ?? 0 : owner.shield;
          const amount = Math.min(reserve, allies.length * Math.min(...allies.map((ally) => ally.stats.health - ally.hp)));
          let total = 0;
          for (const ally of allies) total += generatedHeal(owner, ally, Math.floor(amount / allies.length), events);
          if (hasNativeIdentity(owner) && owner.native?.foundation) owner.native.foundation.durability -= total;
          else payShield(owner, total);
        }
      }
      break;
    case "master-vaelor-2":
      if (ctx.action === "skill2" && (hasNativeIdentity(owner) ? owner.native?.beat === 1 : (ctx.spent.tempest ?? 0) > 0)) for (const hit of ctx.hits) {
        const enemy = state.enemies.find((enemy2) => enemy2.id === hit.target && enemy2.hp > 0);
        if (enemy && (enemy.weakened <= 0 || enemy.weakenFraction < 0.15)) {
          enemy.weakened = 1;
          enemy.weakenFraction = 0.15;
          enemy.weakenSourceId = owner.id;
          enemy.weakenOrigin = "conduit";
        }
      }
      break;
  }
  for (const flora of alive(state).filter((ally) => equipped(ally, "master-sprout-1"))) {
    if (ctx.action !== "skill1" && ctx.action !== "skill2") continue;
    for (const ally of alive(state)) nativeHeal(state, flora, ally, ally.stats.health * 0.02, events, false);
  }
  if (!ctx.all && damage > 0) {
    for (const nerithe of alive(state).filter((ally) => ally.id !== owner.id && equipped(ally, "master-nerithe-1"))) {
      for (const enemy of state.enemies.filter((enemy2) => enemy2.hp > 0 && enemy2.id !== target?.id && gear(enemy2).owners.chart === nerithe.id)) generatedStrike(state, owner, enemy, damage * 0.4, events);
      for (const enemy of state.enemies) if (gear(enemy).owners.chart === nerithe.id) delete gear(enemy).owners.chart;
    }
  }
  afterCalamiticAction(state, owner, ctx.action, events);
}
function revive(owner, target, fraction, events) {
  target.hp = Math.max(1, Math.round(target.stats.health * fraction));
  target.shatter = 0;
  emit(events, "heal", owner, target, target.hp, `${target.name} is revived by a Conduit at ${target.hp} HP.`);
}
function rescue(state, target, loss, events, direct) {
  if (loss < target.hp) return loss;
  const n = gear(target).numbers;
  const accord = state.allies.find((owner) => owner.id === gear(target).owners.accord);
  if (direct && accord) {
    delete gear(target).owners.accord;
    n.accordShield = accord.stats.health * value(state, accord, "tranquilitic-accord-bastion", 0.1, 0.2);
    return Math.max(0, target.hp - 1);
  }
  if (direct && equipped(target, "horizon-heartcase")) {
    const saves = n.heartcaseSaves ?? 0;
    const excess = loss - target.hp + 1;
    const cost = Math.max(1, Math.ceil(excess / (target.stats.health * 0.01) * (1 - value(state, target, "horizon-heartcase", 0.2, 0.5)))) + 10 * saves;
    if (target.shatter >= cost) {
      target.shatter -= cost;
      n.heartcaseSaves = saves + 1;
      emit(events, "status", target, target, cost, `${target.name}'s Horizon Heartcase drains ${cost} Elemental Gauge to stay standing.`);
      return Math.max(0, target.hp - 1);
    }
  }
  return loss;
}
function afterConduitHpLoss(state, target, events) {
  const n = gear(target).numbers;
  if (n.accordShield) {
    generatedShield(target, target, n.accordShield, events);
    delete n.accordShield;
  }
  if (target.hp <= 0 && equipped(target, "infernic-phoenix-reactor") && !n.phoenixUsed) {
    n.phoenixUsed = 1;
    revive(target, target, value(state, target, "infernic-phoenix-reactor", 0.25, 0.5), events);
  }
}
function conduitBurnTick(state, owner, target) {
  if (target.burn.origin === "conduit") return target.burn.damage;
  const n = gear(target).numbers;
  const cinderKey = `cinder:${owner.id}`, imprint = `imprint:${owner.id}`;
  let bonus = 0;
  if (equipped(owner, "infernic-cinder-testament")) bonus += (n[cinderKey] ?? 0) * value(state, owner, "infernic-cinder-testament", 0.2, 0.4);
  return Math.round(target.burn.damage * (1 + bonus) * (n[imprint] ?? 1));
}
function afterConduitBurn(state, owner, target, damage, events) {
  if (target.burn.origin !== "conduit") delete gear(target).numbers[`imprint:${owner.id}`];
  if (damage <= 0 || target.burn.origin === "conduit") return;
  const tn = gear(target).numbers, n = gear(owner).numbers;
  tn[`cinder:${owner.id}`] = (tn[`cinder:${owner.id}`] ?? 0) + 1;
  if (owner.hp > 0 && equipped(owner, "emberlife-kiln"))
    generatedHeal(owner, owner, damage * value(state, owner, "emberlife-kiln", 0.2, 0.4), events);
  if (equipped(owner, "sootwake-crucible") && target.hp > 0) {
    const serialKey = `sootSerial:${owner.id}`;
    const serial = (tn[serialKey] ?? 0) + 1;
    tn[serialKey] = serial;
    tn[`soot:${owner.id}:${serial}`] = state.round + 1;
  }
  if (target.burn.turns === 0 && target.hp > 0 && owner.hp > owner.stats.health * 0.5 && equipped(owner, "master-ember-1") && owner.hp - owner.stats.health * 0.03 >= 1) {
    owner.hp -= owner.stats.health * 0.03;
    target.burn.turns = 1;
    emit(events, "status", owner, target, 1, `${owner.name} pays HP to sustain Burn for one phase.`);
  }
  if (target.burn.turns <= 0) {
    delete tn[`cinder:${owner.id}`];
  }
}
function conduitDeaths(state, previous, events) {
  for (const enemy of state.enemies.filter((enemy2) => enemy2.hp <= 0 && previous.enemies.some((prior) => prior.id === enemy2.id && prior.hp > 0))) {
    if (gear(enemy).numbers.deathProcessed) continue;
    gear(enemy).numbers.deathProcessed = 1;
    const owner = state.allies.find((ally) => ally.id === enemy.burn.sourceId);
    if (owner && enemy.burn.turns > 0 && enemy.burn.origin !== "conduit" && equipped(owner, "cinder-metering-nozzle")) {
      const target = healthiestEnemy(state);
      const damage = conduitBurnTick(state, owner, enemy) * value(state, owner, "cinder-metering-nozzle", 0.25, 0.5);
      if (target && (target.burn.turns <= 0 || target.burn.damage < damage)) target.burn = { damage, turns: enemy.burn.turns, sourceId: owner.id, origin: "conduit" };
    }
    const suppressor = state.allies.find((ally) => ally.id === enemy.weakenSourceId);
    if (suppressor && enemy.weakened > 0 && enemy.weakenOrigin !== "conduit" && equipped(suppressor, "secondbeat-rack")) {
      const target = state.enemies.filter((unit) => unit.hp > 0).sort((a, b) => b.stats.damage - a.stats.damage)[0];
      const fraction = enemy.weakenFraction * value(state, suppressor, "secondbeat-rack", 0.6, 1);
      if (target) {
        target.weakened = enemy.weakened;
        target.weakenFraction = fraction;
        target.weakenSourceId = suppressor.id;
        target.weakenOrigin = "conduit";
        emit(events, "status", suppressor, target, fraction, `${target.name} receives [Weaken].`);
      }
    }
  }
}
function applyTaunt(owner, enemy) {
  const memory = gear(enemy);
  memory.owners.taunt = owner.id;
  memory.numbers.tauntSequence = (memory.numbers.tauntSequence ?? 0) + 1;
  memory.numbers[`taunt:${owner.id}`] = memory.numbers.tauntSequence;
}
function forcedConduitTarget(state, enemy, randomTarget) {
  const memory = gear(enemy);
  const owner = alive(state).filter((ally) => memory.numbers[`taunt:${ally.id}`] && (equipped(ally, "master-tide-3") && enemy.weakened > 0 && enemy.weakenSourceId === ally.id || equipped(ally, "tectonic-atlas-bastion") && gear(ally).numbers.tauntRound === state.round)).sort((a, b) => memory.numbers[`taunt:${b.id}`] - memory.numbers[`taunt:${a.id}`])[0];
  if (owner) memory.owners.taunt = owner.id;
  else delete memory.owners.taunt;
  return owner ?? randomTarget;
}
function conduitSuppressSkill(enemy) {
  const n = gear(enemy).numbers;
  if (!n.rootbind && !n.silence) return false;
  delete n.rootbind;
  delete n.silence;
  return true;
}
function nativeShieldActivationMultiplier(enemy, target) {
  const memory = gear(enemy);
  const prefix = "nativeWardReduction:";
  if (enemy.native === void 0) {
    for (const key2 of Object.keys(memory.numbers)) if (key2.startsWith(prefix)) delete memory.numbers[key2];
  }
  const key = `${prefix}${target.id}`;
  if (memory.numbers[key] !== void 0) return memory.numbers[key];
  let multiplier = 1;
  for (const layer of layers(target)) {
    if (!layer.native || !layer.firstReduction || layer.firstReduction <= 0) continue;
    multiplier *= 1 - Math.min(1, layer.firstReduction);
    delete layer.firstReduction;
  }
  if (multiplier < 1) memory.numbers[key] = multiplier;
  return multiplier;
}
function conduitIncoming(state, enemy, target, damage, critical, scheduled, events, action = scheduled ? "skill1" : "light") {
  const n = gear(target).numbers;
  if (!scheduled && n.windveil && n.windveilRound !== state.round - 1) {
    delete n.windveil;
    n.windveilRound = state.round;
    emit(events, "status", target, target, 0, `${target.name}'s Windveil avoids the Normal Attack.`);
    return;
  }
  const shieldBefore = target.shield;
  let equipmentMultiplier = 1;
  for (const keeper of alive(state).filter((ally) => equipped(ally, "firstlight-cam"))) {
    const memory = gear(keeper).numbers;
    memory.firstlightRound ??= state.round;
    if (memory.firstlightRound === state.round) equipmentMultiplier *= 1 - value(state, keeper, "firstlight-cam", 0.25, 0.5);
  }
  if (critical && equipped(target, "sentinel-aperture")) equipmentMultiplier *= 1 - value(state, target, "sentinel-aperture", 0.25, 0.5);
  if (target.hp > target.stats.health * 0.75 && equipped(target, "pale-bulwark-diadem")) equipmentMultiplier *= 1 - value(state, target, "pale-bulwark-diadem", 0.15, 0.3);
  if (n.tauntRound === state.round && equipped(target, "tectonic-atlas-bastion")) equipmentMultiplier *= 1 - value(state, target, "tectonic-atlas-bastion", 0.1, 0.2);
  const parryKey = `parry:${target.id}`;
  const enemyMemory = gear(enemy).numbers;
  if (!enemy.native) delete enemyMemory[parryKey];
  const hasParry = scheduled && n.normalRound === state.round && equipped(target, "master-razor-1") && (n.parryRound !== state.round || enemyMemory[parryKey] === state.round);
  if (hasParry) {
    n.parryRound = state.round;
    enemyMemory[parryKey] = state.round;
  }
  const wardMultiplier = nativeShieldActivationMultiplier(enemy, target);
  const nativeMultiplier = nativeIncomingMultiplier(state, enemy, target, action, events) * wardMultiplier;
  const temporaryMultiplier = (parry) => equipmentMultiplier * nativeMultiplier * (parry ? 0.5 : 1);
  const totalMultiplier = (parry) => temporaryMultiplier(parry);
  let reflection = 0;
  const beforeParry = damage * totalMultiplier(false);
  let offered = damage * totalMultiplier(hasParry);
  if (hasParry) {
    reflection = Math.max(0, beforeParry - offered) * 0.5;
  }
  if (equipped(target, "stasis-reliquary") && offered > target.stats.health * 0.2)
    offered = target.stats.health * 0.2 + (offered - target.stats.health * 0.2) * (1 - value(state, target, "stasis-reliquary", 0.3, 0.6));
  let remaining = Math.max(1, Math.round(offered));
  const postMitigation = remaining;
  remaining = nativeRouteDamage(
    state,
    enemy,
    target,
    remaining,
    events,
    (recipient, redirected) => routedDamage(state, enemy, recipient, redirected, events, true)
  );
  const networks = alive(state).filter((ally) => equipped(ally, "oceanic-shared-tide-pump") && layers(target).some((layer) => layer.native && layer.owner === ally.id && layer.amount > 0));
  for (const network of networks) {
    let budget = remaining;
    for (const ally of alive(state).filter((ally2) => ally2.id !== target.id)) {
      const list = layers(ally);
      const available = list.filter((layer) => layer.native && layer.owner === network.id).reduce((sum, layer) => sum + layer.amount, 0);
      const amount = Math.min(budget, available);
      if (amount <= 0) continue;
      let consume = amount;
      for (const layer of list.filter((layer2) => layer2.native && layer2.owner === network.id)) {
        const spent = Math.min(consume, layer.amount);
        layer.amount -= spent;
        ally.shield -= spent;
        consume -= spent;
      }
      budget -= amount;
      remaining -= amount;
      pilotAuthoredShieldAbsorbed(state, network.id, amount, events);
      absorbedNative(state, network, ally, enemy, amount, false, events);
      emit(events, "shield", network, ally, -amount, `${ally.name}'s linked shield absorbs ${amount} for ${target.name}.`);
    }
  }
  const absorbed = consumeShield(target, remaining);
  let loss = remaining - absorbed.absorbed;
  if (shieldBefore > 0 && target.shield <= 0 && absorbed.absorbed > 0 && equipped(target, "fieldbrace-coupler")) n.fieldbraceRound = state.round + 1;
  for (const [id, amount] of absorbed.native) {
    const owner = state.allies.find((ally) => ally.id === id);
    if (!owner) continue;
    const broke = absorbed.broken.has(id);
    if (equipped(owner, "master-tide-1") && broke && !n[`tideGuard:${id}`]) {
      n[`tideGuard:${id}`] = 1;
      loss = 0;
    }
    pilotAuthoredShieldAbsorbed(state, id, amount, events);
    absorbedNative(state, owner, target, enemy, amount, broke, events);
  }
  if (absorbed.absorbed > 0 && target.hp > 0) {
    if (equipped(target, "aegis-capacitor")) generatedGauge(target, target, value(state, target, "aegis-capacitor", 4, 8), events);
    if (equipped(target, "tidebound-reflector"))
      generatedStrike(state, target, enemy, absorbed.absorbed * value(state, target, "tidebound-reflector", 0.2, 0.4), events);
  }
  if (equipped(target, "master-bruno-1")) loss *= 0.8;
  const guardian = state.allies.find((ally) => ally.id === gear(target).owners.guardian && ally.hp > 0);
  if (guardian && loss >= target.hp && n.guardianRound === state.round) {
    const routed = loss - target.hp + 1;
    loss -= routed;
    routedDamage(state, enemy, guardian, routed, events);
  }
  loss = deferCalamiticDamage(state, target, loss, events);
  loss = Math.min(target.hp, rescue(state, target, loss, events, true));
  const fullyAbsorbedNative = loss === 0 && absorbed.absorbed >= postMitigation ? new Map([...absorbed.native].filter(([, amount]) => amount >= postMitigation)) : /* @__PURE__ */ new Map();
  nativeAbsorbedHit(state, target, fullyAbsorbedNative, loss, events);
  nativeGauge(state, target, shatterGauge.incomingHit, events);
  target.hp -= loss;
  bankCalamiticDamage(state, loss);
  emit(events, "damage", enemy, target, loss, `${target.name}: ${Math.round(loss)} damage${critical ? " (critical)" : ""}${absorbed.absorbed ? `, ${Math.round(absorbed.absorbed)} shield absorbed` : ""}.`, true);
  events[events.length - 1].shieldAbsorbed = absorbed.absorbed;
  events[events.length - 1].critical = critical;
  nativeDirectHpLoss(state, target, loss, events);
  afterConduitHpLoss(state, target, events);
  if (target.hp <= 0) allyFell(state, target, events);
  if (reflection > 0) generatedStrike(state, target, enemy, reflection, events);
  if (loss > 0) {
    n.phaseLoss = (n.phaseLoss ?? 0) + loss;
    if (target.hp > 0 && equipped(target, "duplex-heart")) generatedHeal(target, injured(state, target, true), target.stats.health * value(state, target, "duplex-heart", 0.05, 0.1), events);
    const aurora = state.allies.find((ally) => ally.hp > 0 && equipped(ally, "master-aurora-3") && nativeControl(state, ally, enemy));
    if (aurora) {
      const an = gear(aurora).numbers;
      const recipient = alive(state).filter((ally) => ally.id !== target.id && ally.hp < ally.stats.health).sort((a, b) => a.hp / a.stats.health - b.hp / b.stats.health)[0];
      generatedHeal(aurora, recipient, loss * 0.5, events);
    }
  }
  if (target.hp > 0) {
    if (n.counterwindActive) n.counterwind = (n.counterwind ?? 0) + 0.15;
  }
}
function allyFell(state, fallen, events) {
  for (const owner of alive(state).filter((ally) => ally.id !== fallen.id && equipped(ally, "covercharge-drum"))) {
    const heal = value(state, owner, "covercharge-drum", 0.1, 0.2), gauge = value(state, owner, "covercharge-drum", 20, 40);
    for (const ally of alive(state)) {
      generatedHeal(owner, ally, ally.stats.health * heal, events);
      generatedGauge(owner, ally, gauge, events);
    }
  }
}
function routedDamage(state, enemy, target, amount, events, nativeRedirect = false) {
  const absorbed = consumeShield(target, amount).absorbed;
  const loss = Math.min(target.hp, amount - absorbed);
  const wasStanding = target.hp > 0;
  target.hp -= loss;
  emit(events, "damage", enemy, target, loss, `${target.name} intercepts ${Math.round(amount)} damage (Conduit routing).`);
  if (nativeRedirect) {
    events[events.length - 1].origin = "native";
    events[events.length - 1].nativeKind = "redirect";
  }
  if (wasStanding && target.hp <= 0 && target.side === "ally") allyFell(state, target, events);
}
function absorbedNative(state, owner, target, enemy, amount, broken, events) {
  if (owner.hp <= 0) return;
  const n = gear(owner).numbers;
  if (equipped(owner, "aquatic-leviathan-pump")) n.absorption = (n.absorption ?? 0) + amount;
  if (broken && equipped(owner, "master-thornia-1")) {
    for (const foe of state.enemies.filter((foe2) => foe2.hp > 0)) generatedStrike(state, owner, foe, amount * 0.4, events);
  }
}
function conduitTurnStart(state, events) {
  for (const owner of alive(state)) {
    const n = gear(owner).numbers;
    if (n.solaceRound !== state.round) delete n.solaceRound;
    if (equipped(owner, "granite-hourglass") && (n.phaseLoss ?? 0) > 0) generatedShield(owner, owner, n.phaseLoss * value(state, owner, "granite-hourglass", 0.2, 0.4), events);
    n.phaseLoss = 0;
    if (n.fieldbraceRound === state.round) {
      delete n.fieldbraceRound;
      generatedHeal(owner, owner, owner.stats.health * value(state, owner, "fieldbrace-coupler", 0.06, 0.12), events);
    }
    if (owner.recoverThrough >= state.round) {
      if (equipped(owner, "tranquilitic-stillhour-carillon")) {
        const amount = value(state, owner, "tranquilitic-stillhour-carillon", 15, 30);
        generatedGauge(owner, owner, amount, events);
        generatedGauge(owner, lowestGauge(state, owner), amount, events);
      }
    }
    if (equipped(owner, "aquatic-leviathan-pump") && (n.absorption ?? 0) > 0) {
      const pool = n.absorption * value(state, owner, "aquatic-leviathan-pump", 0.3, 0.6);
      const recipients = alive(state).filter((ally) => ally.hp < ally.stats.health);
      for (const ally of recipients) generatedHeal(owner, ally, pool / recipients.length, events);
    }
    n.absorption = 0;
    for (const source of state.allies) {
      const key = `seed:${source.id}`;
      const offer = gear(owner).numbers[key];
      if (offer) {
        delete gear(owner).numbers[key];
        generatedHeal(source, owner, offer, events);
      }
    }
  }
}

// src/game/battle.ts
function withMasterLoadouts(state, masters = {}) {
  for (const [character, id] of Object.entries(masters)) {
    if (id !== null && id !== void 0) validateMasterCharacter(id, character);
  }
  for (const ally of state.allies) {
    if (!isStarterId(ally.definitionId) || ally.captured) continue;
    const id = masters[ally.definitionId];
    if (id) ally.masterConduit = id;
  }
  if (state.conduitRulesVersion === void 0) initializeConduits(state);
  return state;
}
function createWarBattle(character, stage, seed2, starter, progress, roster = [starter], teamProgress = { [starter]: progress }, equipment = {}, captures = [], upgrades = {}) {
  const encounter2 = warEncounter(character, stage);
  const state = createBattle(seed2, roster, teamProgress, equipment, captures, upgrades);
  const unit = combatant(`war-${character}-${stage}`, character, encounter2.enemyName, "enemy", encounter2.stats, encounter2.element);
  Object.assign(unit, {
    level: encounter2.level,
    evolution: encounter2.evolution,
    art: encounter2.art,
    color: encounter2.color,
    boss: true,
    enemySkills: encounter2.skills
  });
  state.wave = stage;
  state.war = { character, stage };
  state.enemies = [unit];
  state.lycalisSeed = (seed2 ^ 2692095333) >>> 0 || 1;
  state.recruitmentSeed = (seed2 ^ 3875765969) >>> 0 || 1;
  return state;
}
function warRewardRoll(state, key) {
  const value2 = state[key];
  if (value2 === void 0 || value2 === 0) throw new Error("Elemental War reward stream is missing.");
  let seed2 = value2;
  seed2 ^= seed2 << 13;
  seed2 ^= seed2 >>> 17;
  seed2 ^= seed2 << 5;
  state[key] = seed2 >>> 0;
  return state[key] / 4294967296;
}
function combatant(id, definitionId, name, side, stats, element) {
  return {
    id,
    definitionId,
    name,
    element,
    side,
    level: null,
    stats: { ...stats },
    hp: stats.health,
    shield: 0,
    shatter: shatterGauge.starting,
    spent: false,
    recoverThrough: 0,
    readyRound: { skill1: 1, skill2: 1 },
    burn: { damage: 0, turns: 0 },
    weakened: 0,
    weakenFraction: 0.25,
    kit: null
  };
}
function capCapturedBattleLevels(state) {
  for (const unit of state.allies) {
    if (!unit.captured) continue;
    if (unit.captured.level !== void 0) unit.captured.level = Math.min(capturedLevelCap, unit.captured.level);
    if (unit.level === null || unit.level <= capturedLevelCap) continue;
    const before = capturedEnemyStats(unit.level, 140);
    const after = capturedEnemyStats(capturedLevelCap);
    for (const stat of ["health", "damage", "defense"]) {
      const ratio = after[stat] / before[stat];
      unit.stats[stat] *= ratio;
      if (unit.kit) unit.kit.stats[stat] *= ratio;
    }
    const healthRatio = after.health / before.health;
    unit.hp *= healthRatio;
    unit.shield *= healthRatio;
    unit.level = capturedLevelCap;
  }
}
function spawnWave(wave) {
  const level = Math.min(wave, enemyGrowth.maximumLevel);
  return ["goblin", "imp", "golem"].map((id, index) => {
    const definition = enemies[id];
    const unit = combatant(`enemy-${wave}-${index}`, id, definition.name, "enemy", enemyCombatStats(level, false), definition.element);
    unit.level = level;
    unit.creatureId = `adventure:${id}`;
    const strike = id === "goblin" ? "Wildwood Ambush" : id === "imp" ? "Cinder Mischief" : "Faultline Crush";
    unit.enemySkills = enemySkills(level, false, strike, enemyAbilityMultiplier(level));
    return unit;
  });
}
function createBattle(seed2 = 1729, roster = ["ember"], progress = {}, equipment = {}, captures = [], upgrades = {}) {
  if (!Number.isInteger(seed2) || seed2 < 1 || seed2 > 4294967295) throw new Error("Battle seed must be a nonzero uint32.");
  if (!roster.length || roster.length > 3 || new Set(roster).size !== roster.length || !roster.every((id) => isStarterId(id) || captures.some((copy) => copy.instanceId === id))) {
    throw new Error("Battle roster requires distinct valid starters.");
  }
  const snapshot = validateConduitUpgrades(upgrades);
  const state = {
    wave: 1,
    round: 1,
    phase: "player",
    seed: seed2,
    rewardSeed: seed2,
    captureSeed: seed2,
    conduitUpgrades: snapshot,
    allies: roster.map((id) => {
      if (!isStarterId(id)) {
        const copy = captures.find((entry) => entry.instanceId === id);
        if (!copy) throw new Error("Captured squad instance is missing.");
        const creature = getCreature(copy.creatureId);
        const kit2 = resolveCapturedFighter(copy, equipment[id], snapshot);
        const unit2 = combatant(id, creature.id, `${creature.name} \xB7 Copy ${captures.findIndex((entry) => entry.instanceId === id) + 1}`, "ally", kit2.stats, creature.element);
        unit2.kit = kit2;
        unit2.level = capturedProgress(copy).level;
        unit2.evolution = capturedProgress(copy).tier + 1;
        unit2.captured = structuredClone(copy);
        if (unit2.captured.level !== void 0) unit2.captured.level = unit2.level;
        unit2.creatureId = creature.id;
        unit2.art = creature.art;
        unit2.color = elementAccents[creature.element];
        if (equipment[id]) unit2.conduits = [...equipment[id]];
        return unit2;
      }
      const starter = getStarter(id);
      const kit = resolveFighter(id, progress[id], equipment[id], snapshot);
      const unit = combatant(starter.id, starter.id, characterName(id, progress[id]?.evolution), "ally", kit.stats, starter.elementId);
      unit.kit = kit;
      if (id === "vaelor") unit.native = { beat: 0, beatRound: 1 };
      unit.level = progress[id]?.level ?? null;
      unit.evolution = progress[id]?.evolution ?? 1;
      if (equipment[id]) unit.conduits = [...equipment[id]];
      return unit;
    }),
    enemies: spawnWave(1)
  };
  initializeConduits(state);
  return state;
}
function createDungeonBattle(element, stage, seed2, starter, progress, roster = [starter], teamProgress = { [starter]: progress }, equipment = {}, captures = [], upgrades = {}, encounterSeed) {
  const state = createBattle(seed2, roster, teamProgress, equipment, captures, upgrades);
  let familySeed = encounterSeed ?? ((seed2 ^ 2654435769) >>> 0 || 1);
  if (!Number.isInteger(familySeed) || familySeed < 1 || familySeed > 4294967295) throw new Error("Invalid dungeon encounter seed.");
  const encounter2 = dungeonEncounter(element, stage);
  state.wave = stage;
  state.dungeon = { element, stage };
  state.enemies = Array.from({ length: encounter2.boss ? 1 : 2 }, (_, index) => {
    familySeed ^= familySeed << 13;
    familySeed ^= familySeed >>> 17;
    familySeed ^= familySeed << 5;
    familySeed >>>= 0;
    state.encounterSeed = familySeed;
    const family = Math.floor(familySeed / 4294967296 * elementSources[element].length);
    const selected = dungeonEncounter(element, stage, family);
    const unit = combatant(`dungeon-${element}-${stage}-${index}`, "goblin", selected.enemy.name, "enemy", selected.stats, element);
    unit.level = selected.level;
    unit.creatureId = selected.creatureId;
    unit.art = selected.enemy.art;
    unit.color = selected.color;
    unit.boss = selected.boss;
    unit.enemySkills = enemySkills(selected.level, selected.boss, selected.ability, selected.abilityMultiplier);
    return unit;
  });
  return state;
}
function createStoryBattle(stage, seed2, starter, progress, roster = [starter], teamProgress = { [starter]: progress }, equipment = {}, captures = [], upgrades = {}, encounterSeed) {
  const encounter2 = storyEncounter(stage);
  const state = createBattle(seed2, roster, teamProgress, equipment, captures, upgrades);
  let familySeed = encounterSeed ?? ((seed2 ^ 2654435769) >>> 0 || 1);
  if (!Number.isInteger(familySeed) || familySeed < 1 || familySeed > 4294967295) throw new Error("Invalid Story encounter seed.");
  state.wave = stage;
  state.story = { storyStage: stage };
  state.enemies = Array.from({ length: encounter2.boss ? 1 : 2 }, (_, index) => {
    familySeed ^= familySeed << 13;
    familySeed ^= familySeed >>> 17;
    familySeed ^= familySeed << 5;
    familySeed >>>= 0;
    state.encounterSeed = familySeed;
    const identity = encounter2.boss ? 0 : Math.floor(familySeed / 4294967296 * 4);
    const creature = storyCreature(stage, identity);
    const unit = combatant(`story-${stage}-${index}`, creature.id, creature.name, "enemy", encounter2.stats, encounter2.element);
    unit.level = encounter2.level;
    unit.creatureId = creature.id;
    unit.art = creature.art;
    unit.color = encounter2.color;
    unit.boss = encounter2.boss;
    unit.enemySkills = enemySkills(encounter2.level, encounter2.boss, `${creature.name} Strike`, encounter2.abilityMultiplier);
    return unit;
  });
  return state;
}
function roll(state) {
  let seed2 = state.seed;
  seed2 ^= seed2 << 13;
  seed2 ^= seed2 >>> 17;
  seed2 ^= seed2 << 5;
  state.seed = seed2 >>> 0;
  return state.seed / 4294967296;
}
function createInfusionBattle(mode, stage, seed2, starter, progress, roster = [starter], teamProgress = { [starter]: progress }, equipment = {}, captures = [], upgrades = {}, schedule = "caps") {
  const encounter2 = infusionEncounter(mode, stage, schedule);
  const state = createBattle(seed2, roster, teamProgress, equipment, captures, upgrades);
  state.wave = stage;
  state.infusion = { mode, stage, schedule };
  state.enemies = Array.from({ length: encounter2.boss ? 1 : 2 }, (_, index) => {
    const unit = combatant(`infusion-${mode}-${stage}-${index}`, "goblin", encounter2.enemy.name, "enemy", encounter2.stats, encounter2.enemy.element);
    unit.level = encounter2.level;
    unit.creatureId = `infusion:${mode}:${encounter2.tier}`;
    unit.art = encounter2.enemy.art;
    unit.color = encounter2.color;
    unit.boss = encounter2.boss;
    unit.enemySkills = enemySkills(encounter2.level, encounter2.boss, encounter2.ability, encounter2.abilityMultiplier);
    return unit;
  });
  return state;
}
function createCalamityBattle(activity, tier, seed2, starter, progress, roster = [starter], teamProgress = { [starter]: progress }, equipment = {}, captures = [], upgrades = {}) {
  const encounter2 = calamityEncounter(activity, tier);
  const state = createBattle(seed2, roster, teamProgress, equipment, captures, upgrades);
  state.calamity = { activity, tier };
  const unit = combatant(`calamity-${activity}`, `calamity:${activity}`, encounter2.name, "enemy", encounter2.stats, encounter2.element);
  Object.assign(unit, {
    level: encounter2.level,
    boss: true,
    color: "#df3548",
    enemySkills: encounter2.skills,
    creatureId: `calamity:${activity}`,
    art: getCreature(`calamity:${activity}`).art
  });
  state.enemies = [unit];
  return state;
}
var elementalCritFactor = 1.5;
function rollCritical(state, rate) {
  const critical = roll(state) < Math.min(1, rate);
  const elemental = critical && rate > 1 && roll(state) < Math.min(1, rate - 1);
  return { critical, elemental };
}
function damageAmount(base, multiplier, defense, critical, critMultiplier = 1.5) {
  if (![base, multiplier, defense, critMultiplier].every(Number.isFinite) || base < 0 || multiplier < 0 || defense < 0 || critMultiplier < 1) {
    throw new Error("Invalid damage inputs.");
  }
  const mitigation = base === 0 ? 0 : 1 / (1 + defense / base);
  return Math.max(1, Math.round(base * multiplier * (critical ? critMultiplier : 1) * mitigation));
}
function actionUnavailable(state, actor, action) {
  if (state.phase !== "player") return "This wave is not accepting actions.";
  if (actor.side !== "ally" || !state.allies.some((ally) => ally.id === actor.id)) return "Choose a team member.";
  if (action !== "light" && actor.kit?.unavailableActions?.includes(action)) return "This captured form does not have this ability.";
  if (actor.hp <= 0) return "This character is defeated.";
  if (actor.spent) return "This character has already acted this turn.";
  const calamiticReason = calamiticActionReason(state, actor, action);
  if (calamiticReason) return calamiticReason;
  if (conduitActionBlocked(actor, state)) return "This character cannot take another action this turn.";
  if (actor.recoverThrough >= state.round && !(action === "light" && recoveryNormal(actor))) return "Recovering this turn after Last Flare.";
  if (action === "ultimate" && (actor.readyRound.ultimate ?? 0) > state.round) return `Ready on turn ${actor.readyRound.ultimate}.`;
  const gaugeCost = actionGaugeCost(actor, action, state);
  if (actor.shatter < gaugeCost) return `Requires ${gaugeCost} Elemental Gauge.`;
  return null;
}
function actionGaugeCost(actor, action, state) {
  const cost = shatterGauge.costs[action];
  return conduitActionCost(actor, action, state, cost);
}
function event(events, kind, source, target, amount, message, critical = false) {
  events.push({
    kind,
    source: source.id,
    target: target.id,
    amount,
    message,
    critical,
    ...target.side === "ally" ? { buffs: buffSnapshot(target) } : {},
    ...kind === "status" || kind === "damage" ? { debuffs: debuffSnapshot(target) } : {}
  });
}
function hurt(target, amount, source, events, critical = false, periodic = false, conduitReduction = 0, elementalCritical = false, shieldBypass = 0) {
  if (conduitReduction > 0) amount = Math.max(1, Math.round(amount * (1 - conduitReduction)));
  const bypassed = Math.floor(amount * shieldBypass);
  const absorbed = Math.min(target.shield, amount - bypassed);
  target.shield -= absorbed;
  const loss = Math.min(target.hp, amount - absorbed);
  target.hp -= loss;
  if (target.hp === 0) {
    delete target.conduitMarks;
    delete target.pilot;
  }
  event(
    events,
    "damage",
    source,
    target,
    loss,
    `${target.name}: ${formatStat(loss)} damage${elementalCritical ? " (Elemental Crit)" : critical ? " (critical)" : ""}${absorbed ? `, ${formatStat(absorbed)} shield absorbed` : ""}${target.hp === 0 ? " - defeated" : ""}.`,
    critical
  );
  events[events.length - 1].shieldRemaining = target.shield;
  if (elementalCritical) events[events.length - 1].elementalCritical = true;
  if (periodic) {
    events[events.length - 1].periodic = true;
    events[events.length - 1].debuffs = debuffSnapshot(target);
  }
}
function healTeam(state, source, amount, events, percent = false, ctx) {
  for (const ally of state.allies.filter((unit) => unit.hp > 0)) {
    nativeHeal(state, source, ally, percent ? Math.max(1, Math.round(ally.stats.health * amount)) : amount, events, !percent, ctx);
  }
}
function shieldTeam(state, source, amount, events, authored = true) {
  const recipients = state.allies.filter((unit) => unit.hp > 0);
  const concentrated = equipped(source, "master-tide-2");
  const selected = concentrated ? [...recipients].sort((a, b) => a.hp / a.stats.health - b.hp / b.stats.health).slice(0, 1) : recipients;
  for (const ally of selected) {
    if (authored) {
      nativeShield(state, source, ally, amount * (concentrated ? 3 : 1), events);
      continue;
    }
    const gained = Math.max(0, amount - ally.shield);
    if (gained > 0) {
      delete ally.pilot?.authoredShieldSourceId;
      if (authored && source.hp > 0) {
        ally.pilot ??= {};
        ally.pilot.authoredShieldSourceId = source.id;
      }
    }
    ally.shield = Math.max(ally.shield, amount);
    event(events, "shield", source, ally, gained, `${ally.name} has ${formatStat(ally.shield)} shield.`);
    if (authored && gained > 0) {
    }
  }
}
function checkOutcome(state) {
  if (!state.allies.some((unit) => unit.hp > 0)) state.phase = "defeat";
  else if (!state.enemies.some((unit) => unit.hp > 0)) state.phase = "cleared";
}
function awardDefeats(previous, state, events) {
  for (const enemy of state.enemies) {
    if (enemy.hp > 0 || !previous.enemies.some((unit) => unit.id === enemy.id && unit.hp > 0)) continue;
    const rewardRoll = () => {
      let seed2 = state.rewardSeed;
      seed2 ^= seed2 << 13;
      seed2 ^= seed2 >>> 17;
      seed2 ^= seed2 << 5;
      state.rewardSeed = seed2 >>> 0;
      return state.rewardSeed / 4294967296;
    };
    if (enemy.level === null) throw new Error("Enemy reward level is missing.");
    if (state.calamity) {
      const chest = calamityChest(state.calamity.activity, state.calamity.tier);
      events.push({
        kind: "reward",
        source: enemy.id,
        target: enemy.id,
        amount: 0,
        critical: false,
        calamityChest: chest.id,
        message: `${enemy.name} dropped 1 ${chest.name}.`
      });
      continue;
    }
    if (state.war) {
      const reward = rollWarRewards(
        state.war.stage,
        rewardRoll,
        () => warRewardRoll(state, "lycalisSeed"),
        () => warRewardRoll(state, "recruitmentSeed")
      );
      events.push({
        kind: "reward",
        source: enemy.id,
        target: enemy.id,
        amount: reward.amount,
        critical: false,
        ...reward.lycalis ? { lycalis: reward.lycalis } : {},
        ...reward.recruitment ? { recruitment: state.war.character } : {},
        message: `${enemy.name} dropped ${reward.amount} Prismatica${reward.lycalis ? ` and ${reward.lycalis} Null-Prismatica` : ""}.`
      });
      continue;
    }
    const amount = rollDrop(bossLootRange(
      state.story ? storyEnemyFractalisDrop(enemy.level, enemy.boss === true) : state.infusion?.mode === "treasury" ? treasuryFractalisDrop(enemy.level) : fractalisDrop(enemy.level, state.infusion?.mode === "roses" ? 140 : 120),
      bossLootMultiplier(state, enemy.boss === true)
    ), rewardRoll);
    if (amount === void 0) throw new Error("Guaranteed Prismatica reward did not drop.");
    const materials = state.story ? storyDrops(state.story.storyStage, rewardRoll) : state.infusion ? infusionDrops(state.infusion.mode, state.infusion.stage, rewardRoll, state.infusion.schedule ?? "legacy") : state.dungeon ? materialDrops(state.dungeon.element, state.dungeon.stage, rewardRoll) : void 0;
    const materialText = materials ? Object.entries(materials).map(([id, quantity]) => `${quantity} ${materialName(id)}`).join(", ") : "";
    let capture;
    let lycalis = 0;
    const mechanicalComponents2 = state.infusion?.mode === "machines" ? rollMachineComponents(state.infusion.stage, () => {
      let seed2 = state.componentSeed ?? ((previous.rewardSeed ^ 1821285621) >>> 0 || 1);
      seed2 ^= seed2 << 13;
      seed2 ^= seed2 >>> 17;
      seed2 ^= seed2 << 5;
      state.componentSeed = seed2 >>> 0;
      return state.componentSeed / 4294967296;
    }) : 0;
    const conduits2 = state.infusion?.mode === "machines" ? machineConduitDrops(state.infusion.stage, () => {
      let seed2 = state.conduitSeed ?? ((previous.rewardSeed ^ 2769414579) >>> 0 || 1);
      seed2 ^= seed2 << 13;
      seed2 ^= seed2 >>> 17;
      seed2 ^= seed2 << 5;
      state.conduitSeed = seed2 >>> 0;
      return state.conduitSeed / 4294967296;
    }, state.machineConduits) : void 0;
    if (conduits2) state.machineConduits = { ...state.machineConduits, ...conduits2 };
    const masterChests = state.infusion?.mode === "machines" ? masterChestDrops(state.infusion.stage, enemy.boss === true, () => {
      let seed2 = state.masterChestSeed ?? ((previous.rewardSeed ^ 2135587861) >>> 0 || 1);
      seed2 ^= seed2 << 13;
      seed2 ^= seed2 >>> 17;
      seed2 ^= seed2 << 5;
      state.masterChestSeed = seed2 >>> 0;
      return state.masterChestSeed / 4294967296;
    }) : 0;
    if (state.infusion && state.infusion.mode !== "machines" && enemy.creatureId) {
      let seed2 = state.captureSeed ?? state.seed;
      seed2 ^= seed2 << 13;
      seed2 ^= seed2 >>> 17;
      seed2 ^= seed2 << 5;
      state.captureSeed = seed2 >>> 0;
      if ((state.infusion.mode !== "roses" || roseCaptureAllowed(enemy.level)) && captureSucceeds(state.captureSeed / 4294967296)) capture = { creatureId: enemy.creatureId, level: Math.min(capturedLevelCap, enemy.level) };
      if (state.infusion.mode !== "treasury" && state.infusion.mode !== "roses") lycalis = rollStagedLycalis(state.infusion.mode, enemy.level, () => {
        let premiumSeed = state.lycalisSeed ?? ((previous.seed ^ 2654435769) >>> 0 || 1);
        premiumSeed ^= premiumSeed << 13;
        premiumSeed ^= premiumSeed >>> 17;
        premiumSeed ^= premiumSeed << 5;
        state.lycalisSeed = premiumSeed >>> 0;
        return state.lycalisSeed / 4294967296;
      }, state.infusion.stage);
    }
    events.push({
      kind: "reward",
      source: enemy.id,
      target: "",
      amount,
      critical: false,
      ...materials ? { materials } : {},
      ...capture ? { capture } : {},
      ...lycalis ? { lycalis } : {},
      ...conduits2 ? { conduits: conduits2 } : {},
      ...conduits2 && Object.keys(conduits2).length ? { conduitUpgrades: state.conduitUpgrades } : {},
      ...mechanicalComponents2 ? { mechanicalComponents: mechanicalComponents2 } : {},
      ...masterChests ? { masterChests } : {},
      message: `${enemy.name} drops +${amount} Prismatica${materialText ? ` and ${materialText}` : ""}${lycalis ? ` and +${lycalis} Null-Prismatica` : ""}${mechanicalComponents2 ? ` and +${mechanicalComponents2} Broken Mechanical Components` : ""}${capture ? ` and a captured ${enemy.name} Elemental-Devourer` : ""}${conduits2 && Object.keys(conduits2).length ? ` and ${Object.keys(conduits2).filter(isConduitId).map((id) => getConduit(id).name).join(", ")}` : ""}.`
    });
  }
}
function captureSucceeds(value2) {
  if (!Number.isFinite(value2) || value2 < 0 || value2 >= 1) throw new Error("Capture roll must be in [0, 1).");
  return value2 < 0.2;
}
function act(previous, actorId, action, targetId) {
  if (!isActionId(action)) throw new Error("Unknown combat action.");
  const original = previous.allies.find((unit) => unit.id === actorId);
  if (!original) throw new Error("Unknown team member.");
  const reason = actionUnavailable(previous, original, action);
  if (reason) throw new Error(reason);
  const native = hasNativeIdentity(original);
  const nativeAbility = action === "light" ? void 0 : original.kit?.abilities[action];
  const allyTargeted = native && nativeAbility?.targets === "one-ally";
  if (allyTargeted && !previous.allies.some((ally) => ally.id === targetId && ally.hp > 0 && (!nativeAbility.excludeSelf || ally.id !== actorId || previous.allies.filter((unit) => unit.hp > 0).length === 1))) {
    throw new Error(nativeAbility.excludeSelf ? "Choose another living ally to protect." : "Choose a living ally target.");
  }
  const support = native ? allyTargeted || action !== "light" && nativeAbility?.strength.damageMultiplier === void 0 && nativeAbility?.targets !== "all-enemies" && !(original.definitionId === "thornia" && action === "skill1") && !(original.definitionId === "aurora" && action === "skill1") : action === "skill2" && equipped(original, "master-nerithe-2") || action !== "light" && original.kit?.abilities[action].targets === "all-allies" || action === "skill2" && (original.definitionId === "tide" || original.definitionId === "sprout") && !original.captured;
  if (!support && !previous.enemies.some((enemy) => enemy.id === targetId && enemy.hp > 0)) {
    throw new Error("Choose a living enemy target.");
  }
  const state = structuredClone(previous);
  const actor = state.allies.find((unit) => unit.id === actorId);
  if (!actor) throw new Error("Team state is inconsistent.");
  const definition = actor.kit;
  if (!definition) throw new Error("Ally combat kit is missing.");
  const strength = action === "light" ? null : definition.abilities[action].strength;
  const events = [];
  const name = action === "light" ? basicActionName(actor.definitionId, action) : definition.abilities[action].name;
  const paid = actionGaugeCost(actor, action, state);
  const nativeAll = native ? nativeAbility?.targets === "all-enemies" : !actor.captured && (action === "ultimate" || action === "skill2" && actor.definitionId === "ember" || action !== "light" && definition.abilities[action].targets === "all-enemies");
  actor.shatter -= paid;
  const activation = prepareConduitAction(state, actor, action, paid, nativeAll);
  const priorInstruction = actor.native?.instruction;
  events.push({ kind: "attack", source: actor.id, target: support ? actor.id : targetId, amount: 0, critical: false, message: `${actor.name} uses ${name}.`, action, abilityName: name });
  actor.spent = !activation.freeAction;
  if (action === "ultimate" && !equipped(actor, "master-nerithe-3")) actor.recoverThrough = state.round + 1;
  nativeGauge(state, actor, shatterGauge.gains[action] + (action === "light" ? definition.passive.lightGaugeBonus ?? 0 : 0), events);
  if (action === "skill1" || action === "skill2") actor.readyRound[action] = state.round;
  if (action === "ultimate" && actor.captured) actor.readyRound.ultimate = state.round + definition.abilities.ultimate.cooldown;
  if (native) {
    const direct = (selected, coefficient, pierce = 0, criticalBonus = 0) => {
      const targets = activation.all ? state.enemies.filter((enemy) => enemy.hp > 0) : nativeAll ? selected.filter((enemy) => enemy.id === targetId) : selected;
      for (const target of targets) {
        if (target.hp <= 0) continue;
        const rolled = rollCritical(state, actor.stats.crit + criticalBonus + activation.criticalBonus);
        const critical = !activation.forbidden && (activation.guaranteed || rolled.critical);
        const elemental = critical && rolled.elemental;
        const modifiers = conduitHitModifiers(state, actor, target, activation, critical);
        const criticalMultiplier = modifiers.critMultiplier ?? actor.stats.critMultiplier * (elemental ? elementalCritFactor : 1) * (critical && action !== "light" && equipped(actor, "judgment-lens") ? 1 + value(state, actor, "judgment-lens", 0.4, 0.8) : 1) * (critical && activation.guaranteed && equipped(actor, "falcon-sight") ? 1 + value(state, actor, "falcon-sight", 0.1, 0.2) : 1);
        const boost = actor.attackBoost && actor.attackBoost.throughRound >= state.round ? 1 + actor.attackBoost.fraction : 1;
        const offered = damageAmount(
          modifiers.attack,
          coefficient * activation.scale * boost * nativeInstructionDamage(state, actor) * (1 + modifiers.bonus),
          nativeTargetDefense(state, target) * (1 - Math.min(1, pierce + modifiers.pierce)),
          critical,
          criticalMultiplier
        );
        const shieldBefore = target.shield;
        let hpDamage = 0;
        for (let impact = 0; impact < activation.impacts && target.hp > 0; impact++) {
          const portion = Math.floor(offered / activation.impacts) + (impact === activation.impacts - 1 ? offered % activation.impacts : 0);
          hurt(target, portion, actor, events, critical, false, 0, elemental, calamiticShieldBypass(state, actor));
          events[events.length - 1].origin = "native";
          hpDamage += events[events.length - 1].amount;
        }
        recordConduitHit(
          activation,
          target,
          hpDamage,
          critical,
          criticalMultiplier,
          target.hp <= 0 ? offered - hpDamage - (shieldBefore - target.shield) : 0
        );
        afterConduitImpact(actor, target, activation);
        nativePrimaryHit(state, actor, target, hpDamage > 0 || shieldBefore > target.shield, events);
      }
    };
    nativeAction(state, actor, action, targetId, events, direct, activation);
    nativeAfterAction(state, actor, action, priorInstruction, events);
    finishConduitAction(state, actor, activation, events);
    conduitDeaths(state, previous, events);
    nativeCleanup(state);
    checkOutcome(state);
    awardDefeats(previous, state, events);
    return { state, events };
  }
  const priorResources = { ...actor.pilot };
  const starterBonus = pilotPrepareStarter(actor, action, events);
  let effectiveCriticalDamage = false;
  if (!support) {
    const pilotBonus = pilotOutgoingBonus(actor, action, events) + starterBonus.damage;
    const all = activation.all || action === "skill2" && equipped(actor, "master-thornia-2") && (priorResources.thornAegis ?? 0) >= 3;
    const targets = state.enemies.filter((enemy) => enemy.hp > 0 && (all || enemy.id === targetId));
    let multiplier = 1;
    if (strength) {
      if (strength.damageMultiplier === void 0) throw new Error("Attack skill damage multiplier is missing.");
      multiplier = strength.damageMultiplier;
    }
    if (actor.hp <= actor.stats.health / 2) multiplier *= 1 + definition.passive.damageBonus;
    if (actor.attackBoost && actor.attackBoost.throughRound >= state.round) multiplier *= 1 + actor.attackBoost.fraction;
    for (const target of targets) {
      const rolled = rollCritical(state, actor.stats.crit + (strength?.critBonus ?? 0) + activation.criticalBonus);
      const critical = !activation.forbidden && (activation.guaranteed || rolled.critical);
      const elemental = critical && rolled.elemental;
      const modifiers = conduitHitModifiers(state, actor, target, activation, critical);
      const criticalMultiplier = modifiers.critMultiplier ?? actor.stats.critMultiplier * (elemental ? elementalCritFactor : 1) * (critical && action !== "light" && equipped(actor, "judgment-lens") ? 1 + value(state, actor, "judgment-lens", 0.4, 0.8) : 1) * (critical && activation.guaranteed && equipped(actor, "falcon-sight") ? 1 + value(state, actor, "falcon-sight", 0.1, 0.2) : 1);
      const priorShield = target.shield;
      const priorBurnTurns = target.burn.turns;
      const secondaryCleave = action === "skill2" && equipped(actor, "master-thornia-2") && target.id !== targetId;
      const offered = damageAmount(
        modifiers.attack,
        multiplier * activation.scale * (secondaryCleave ? 0.5 : 1) * (1 + pilotBonus) * (1 + modifiers.bonus) * nativeInstructionDamage(state, actor),
        nativeTargetDefense(state, target) * (1 - modifiers.pierce),
        critical,
        criticalMultiplier
      );
      let hpDamage = 0;
      for (let impact = 0; impact < activation.impacts && target.hp > 0; impact++) {
        const portion = Math.floor(offered / activation.impacts) + (impact === activation.impacts - 1 ? offered % activation.impacts : 0);
        hurt(target, portion, actor, events, critical, false, 0, elemental, calamiticShieldBypass(state, actor));
        events[events.length - 1].origin = "native";
        hpDamage += events[events.length - 1].amount;
      }
      recordConduitHit(
        activation,
        target,
        hpDamage,
        critical,
        criticalMultiplier,
        target.hp <= 0 ? offered - hpDamage - (priorShield - target.shield) : 0
      );
      afterConduitImpact(actor, target, activation);
      const effectiveHit = hpDamage > 0 || priorShield > target.shield;
      nativePrimaryHit(state, actor, target, effectiveHit, events);
      effectiveCriticalDamage ||= critical && effectiveHit;
      if (target.hp > 0 && strength?.burnMultiplier !== void 0) {
        const damage = applyConduitBurn(state, actor, target, actor.stats.elementalDamage * strength.burnMultiplier, activation);
        const clockExtension = Math.max(0, target.burn.turns - priorBurnTurns);
        if (target.burn.turns <= 0 || damage >= target.burn.damage) {
          target.burn = { damage, turns: Math.min(6, 2 + clockExtension), sourceId: actor.id, origin: actor.kit?.pilot === "rose-duality" ? "rose" : "native" };
          event(events, "status", actor, target, damage, `${target.name} burns for ${target.burn.turns} enemy phases.`);
        }
      }
      if (target.hp > 0 && strength?.weakenFraction !== void 0) {
        applyConduitWeaken(state, actor, target, (strength.weakenFraction + starterBonus.weaken) * (secondaryCleave ? 0.5 : 1), events, action, secondaryCleave ? 1 : 2);
      }
    }
  }
  for (const resource of ["ember", "bloom", "tempest", "thornAegis", "duality", "roseGrace"]) activation.spent[resource] = Math.max(0, (priorResources[resource] ?? 0) - (actor.pilot?.[resource] ?? 0));
  pilotAfterDirectActivation(actor, action, events, effectiveCriticalDamage);
  if (strength?.shield !== void 0 || starterBonus.shield > 0) {
    shieldTeam(state, actor, (strength?.shield ?? 0) + starterBonus.shield, events);
  }
  if (strength?.healing !== void 0) {
    healTeam(state, actor, strength.healing * starterBonus.healing, events, false, activation);
  }
  if (strength?.attackBoostFraction !== void 0) {
    for (const ally of state.allies.filter((unit) => unit.hp > 0)) {
      const prior = ally.attackBoost && ally.attackBoost.throughRound >= state.round ? ally.attackBoost.fraction : 0;
      const fraction = Math.min(0.65, strength.attackBoostFraction);
      const previousSourceId = ally.attackBoost && ally.attackBoost.throughRound >= state.round ? ally.attackBoost.sourceId : void 0;
      const sourceId = fraction >= prior ? actor.id : previousSourceId;
      ally.attackBoost = {
        fraction: Math.max(prior, fraction),
        throughRound: state.round + (equipped(actor, "master-disciple-1") ? 3 : 1),
        ...sourceId ? { sourceId } : {},
        ...fraction < prior && ally.attackBoost?.origin === "conduit" ? { origin: "conduit" } : {}
      };
      event(
        events,
        "status",
        actor,
        ally,
        ally.attackBoost.fraction * 100,
        `${ally.name}: outgoing attack damage +${formatStat(ally.attackBoost.fraction * 100)}% this and next player turn (refresh; does not stack).`
      );
      if (fraction > prior) supportEffect(state, actor, ally, events);
    }
  }
  nativeAfterAction(state, actor, action, priorInstruction, events);
  finishConduitAction(state, actor, activation, events);
  conduitDeaths(state, previous, events);
  checkOutcome(state);
  attachNativeView(state, events[events.length - 1]);
  awardDefeats(previous, state, events);
  return { state, events };
}
function newTurn(state, events) {
  state.round++;
  for (const ally of state.allies) {
    ally.spent = false;
    if (ally.attackBoost && ally.attackBoost.throughRound < state.round) delete ally.attackBoost;
  }
  conduitTurnStart(state, events);
  nativeTurnStart(state, events);
  for (const ally of state.allies.filter((unit) => unit.hp > 0 && (unit.kit?.passive.healFraction ?? 0) > 0)) {
    if (!ally.kit) throw new Error("Passive combat kit is missing.");
    if (equipped(ally, "master-sprout-1")) continue;
    if (equipped(ally, "master-rosetta-1")) {
      const target = state.allies.filter((unit) => unit.hp > 0).sort((a, b) => a.hp / a.stats.health - b.hp / b.stats.health)[0];
      if (target) nativeHeal(state, ally, target, target.stats.health * (target.hp < target.stats.health * 0.5 ? 0.12 : 0.06), events, false);
    } else healTeam(state, ally, ally.kit.passive.healFraction, events, true);
  }
  events.push({ kind: "turn", source: "", target: "", amount: state.round, critical: false, message: `Turn ${state.round}. Only Last Flare forces next-turn recovery.` });
  attachNativeView(state, events[events.length - 1]);
}
function endTurn(previous) {
  if (previous.phase !== "player") throw new Error("There is no active player turn.");
  const state = structuredClone(previous);
  const events = [];
  settleCalamiticDebt(state, events);
  for (const enemy of state.enemies) {
    if (enemy.hp <= 0) continue;
    const nativeBurnOwner = enemy.burn.origin !== "conduit" && state.allies.find((unit) => unit.id === enemy.burn.sourceId && hasNativeIdentity(unit) && (unit.native?.burns?.[enemy.id] || unit.hp <= 0));
    nativeBurnPhase(state, enemy, events);
    if (enemy.burn.turns > 0 && !nativeBurnOwner) {
      enemy.burn.turns--;
      const source = state.allies.find((unit) => unit.id === (enemy.burn.sourceId ?? "ember"));
      if (!source) throw new Error("Burn source is missing.");
      const priorHp = enemy.hp;
      hurt(enemy, conduitBurnTick(state, source, enemy), source, events, false, true);
      events[events.length - 1].origin = enemy.burn.origin === "conduit" ? "conduit" : "native";
      if (enemy.burn.origin !== "conduit") pilotBurnDamage(state, source, priorHp - enemy.hp, events);
      afterConduitBurn(state, source, enemy, priorHp - enemy.hp, events);
    }
    if (enemy.hp <= 0) continue;
    const living2 = state.allies.filter((unit) => unit.hp > 0);
    if (!living2.length) break;
    const pattern = state.calamity ? calamityPatterns[state.calamity.activity] : void 0;
    let selected = living2[Math.floor(roll(state) * living2.length)];
    if (pattern?.targeting) selected = [...living2].sort((a, b) => (a.hp / a.stats.health - b.hp / b.stats.health) * (pattern.targeting === "lowest" ? 1 : -1))[0];
    const target = forcedConduitTarget(state, enemy, selected);
    if (pattern?.shieldEvery && state.round % pattern.shieldEvery === 0) {
      const shield = Math.round(enemy.stats.health * (pattern.shieldFraction ?? 0));
      const gained = Math.max(0, shield - enemy.shield);
      enemy.shield = Math.max(shield, enemy.shield);
      event(events, "shield", enemy, enemy, gained, `${enemy.name} refreshes its barrier to ${enemy.shield}.`);
      events[events.length - 1].shieldRemaining = enemy.shield;
    }
    if (pattern?.healEvery && state.round % pattern.healEvery === 0) {
      const restored = Math.min(enemy.stats.health - enemy.hp, Math.round(enemy.stats.health * (pattern.healFraction ?? 0)));
      enemy.hp += restored;
      event(events, "heal", enemy, enemy, restored, `${enemy.name} restores ${restored} HP.`);
    }
    const rolledCritical = roll(state) < enemy.stats.crit;
    const critical = rolledCritical && !((gear(enemy).numbers.judgmentThrough ?? 0) >= state.round);
    const scheduleRound = state.round - (gear(enemy).numbers.scheduleShift ?? 0);
    let ability2 = scheduleRound > 0 ? scheduledEnemySkill(enemy.enemySkills ?? [], scheduleRound) : void 0;
    if (ability2 && conduitSuppressSkill(enemy)) ability2 = void 0;
    events.push({
      kind: "attack",
      source: enemy.id,
      target: target.id,
      amount: 0,
      critical: false,
      message: ability2 ? `${enemy.name} uses ${ability2.name} on ${target.name}.` : `${enemy.name} attacks ${target.name}.`,
      action: ability2?.action ?? "light",
      enhancedAttack: !!ability2,
      abilityName: ability2?.name
    });
    const multiplier = (ability2?.multiplier ?? 1) * (enemy.weakened > 0 ? 1 - enemy.weakenFraction : 1);
    const omnicProtection = target.omnicProtection ?? 0;
    delete target.omnicProtection;
    const criticalMultiplier = critical && gear(target).numbers.criticalSeal ? 1 : enemy.stats.critMultiplier;
    if (critical) delete gear(target).numbers.criticalSeal;
    const incoming = damageAmount(enemy.stats.damage, multiplier, effectiveDefense(state, target), critical, criticalMultiplier) * (1 - omnicProtection);
    const hits = pattern?.hits ?? 1;
    const total = Math.round(incoming);
    const damageStart = events.length;
    delete enemy.native;
    for (let hit = 0; hit < hits && target.hp > 0; hit++) {
      const amount = hit === hits - 1 ? total - Math.floor(total / hits) * (hits - 1) : Math.floor(total / hits);
      conduitIncoming(state, enemy, target, hits === 1 ? incoming : amount, critical, !!ability2, events, ability2?.action ?? "light");
    }
    nativeEnemyCompleted(state, enemy, events.slice(damageStart).some((entry) => entry.kind === "damage" && entry.source === enemy.id && (entry.amount > 0 || (entry.shieldAbsorbed ?? 0) > 0)), events);
    if (enemy.hp > 0 && enemy.weakened > 0) {
      enemy.weakened--;
      if (enemy.weakened === 0) enemy.weakenFraction = 0;
      if (enemy.weakened === 0) delete enemy.weakenOrigin;
      if (enemy.weakened === 0) delete enemy.weakenSourceId;
      event(
        events,
        "status",
        enemy,
        enemy,
        enemy.weakened,
        enemy.weakened > 0 ? `${enemy.name}'s Weaken has ${enemy.weakened} enemy phase remaining.` : `${enemy.name}'s Weaken expires.`
      );
    }
    conduitDeaths(state, previous, events);
    attachNativeView(state, events[events.length - 1]);
  }
  nativePhaseEnd(state, events);
  expireNativeShields(state, events);
  conduitDeaths(state, previous, events);
  checkOutcome(state);
  attachNativeView(state, events[events.length - 1]);
  if (state.phase === "player") newTurn(state, events);
  awardDefeats(previous, state, events);
  return { state, events };
}
function actAndAdvanceTurn(previous, actorId, action, targetId) {
  const actionResult = act(previous, actorId, action, targetId);
  const advanced = advanceUnavailableTurns(actionResult.state);
  return { state: advanced.state, events: [...actionResult.events, ...advanced.events] };
}
function teamCanAct(state) {
  return state.phase === "player" && state.allies.some((ally) => actionIds.some((action) => actionUnavailable(state, ally, action) === null));
}
function advanceUnavailableTurns(previous) {
  let state = previous;
  const events = [];
  while (state.phase === "player" && !teamCanAct(state)) {
    const result = endTurn(state);
    state = result.state;
    events.push(...result.events);
  }
  return { state, events };
}
function nextStage(previous, progress) {
  const destination = previous.story ?? previous.war ?? previous.infusion ?? previous.dungeon;
  if (!destination) throw new Error("Only staged battles can advance to the next stage.");
  if (previous.phase !== "cleared") throw new Error("Clear this stage before advancing.");
  if (previous.wave >= (previous.story ? storyRules.stages : previous.war ? warStageCount : previous.infusion ? infusionStageCount(previous.infusion.mode) : dungeonStageCount)) {
    throw new Error(`${previous.war ? "Activity" : "Dungeon"} complete. Return to Gameplay to replay a stage.`);
  }
  const starter = previous.allies.find((ally) => !ally.captured)?.definitionId ?? "ember";
  if (!isStarterId(starter)) throw new Error("Dungeon starter is missing.");
  const roster = previous.allies.map((ally) => {
    return ally.id;
  });
  const teamProgress = "level" in progress ? { [starter]: progress } : progress;
  for (const id of roster) if (isStarterId(id) && !teamProgress[id]) throw new Error("Continuing character progress is missing.");
  const leaderProgress = teamProgress[starter] ?? (previous.allies.every((ally) => ally.captured) ? { level: 0, evolution: 1 } : void 0);
  if (!leaderProgress) throw new Error("Continuing leader progress is missing.");
  const equipment = {};
  for (const ally of previous.allies) {
    if (ally.conduits) equipment[ally.id] = [...ally.conduits];
  }
  const captures = previous.allies.flatMap((ally) => ally.captured ? [ally.captured] : []);
  const state = "storyStage" in destination ? createStoryBattle(destination.storyStage + 1, previous.seed, starter, leaderProgress, roster, teamProgress, equipment, captures, previous.conduitUpgrades, previous.encounterSeed) : "character" in destination ? createWarBattle(destination.character, destination.stage + 1, previous.seed, starter, leaderProgress, roster, teamProgress, equipment, captures, previous.conduitUpgrades) : "mode" in destination ? createInfusionBattle(destination.mode, destination.stage + 1, previous.seed, starter, leaderProgress, roster, teamProgress, equipment, captures, previous.conduitUpgrades, destination.schedule ?? "legacy") : createDungeonBattle(destination.element, destination.stage + 1, previous.seed, starter, leaderProgress, roster, teamProgress, equipment, captures, previous.conduitUpgrades, previous.encounterSeed);
  for (const ally of state.allies) {
    const prior = previous.allies.find((unit) => unit.id === ally.id);
    if (!prior) throw new Error("Continuing character is missing from the previous encounter.");
    ally.shatter = Math.min(
      prior.shatter + (equipped(ally, "fracture-reservoir") ? value(state, ally, "fracture-reservoir", 5, 10) : 0) + (equipped(ally, "twinpulse-bellows") ? ally.stats.shatterCapacity * value(state, ally, "twinpulse-bellows", 0.15, 0.35) : 0),
      ally.stats.shatterCapacity
    );
    if (prior.masterConduit) ally.masterConduit = prior.masterConduit;
  }
  if (previous.conduitSeed !== void 0) state.conduitSeed = previous.conduitSeed;
  if (previous.machineConduits !== void 0) state.machineConduits = { ...previous.machineConduits };
  if (previous.componentSeed !== void 0) state.componentSeed = previous.componentSeed;
  if (previous.masterChestSeed !== void 0) state.masterChestSeed = previous.masterChestSeed;
  if (previous.war) {
    state.rewardSeed = previous.rewardSeed;
    state.lycalisSeed = previous.lycalisSeed;
    state.recruitmentSeed = previous.recruitmentSeed;
  }
  return { state, events: [{
    kind: "turn",
    source: "",
    target: "",
    amount: state.wave,
    critical: false,
    message: "Next stage. Health and cooldowns reset; Elemental Gauge carries over."
  }] };
}
function nextWave(previous) {
  if (previous.calamity) throw new Error("Calamity has one boss. Return to the activity or replay this challenge.");
  if (previous.story || previous.dungeon || previous.infusion || previous.war) throw new Error("Staged activities must be started as separate encounters.");
  if (previous.phase !== "cleared") throw new Error("Defeat this wave before advancing.");
  const state = structuredClone(previous);
  const events = [];
  state.wave++;
  state.enemies = spawnWave(state.wave);
  state.phase = "player";
  for (const ally of state.allies) {
    delete ally.pilot;
    delete ally.native;
  }
  for (const ally of state.allies) if (ally.definitionId === "vaelor") ally.native = { beat: 0, beatRound: state.round + 1 };
  for (const ally of state.allies) {
    delete ally.omnicMemory;
    delete ally.omnicProtection;
    const layers2 = ally.conduitRuntime?.layers;
    ally.conduitRuntime = { numbers: {}, owners: {}, ...layers2 ? { layers: layers2 } : {} };
    delete ally.conduitCharges;
  }
  initializeConduits(state);
  newTurn(state, events);
  events.push({ kind: "turn", source: "", target: "", amount: state.wave, critical: false, message: `Wave ${state.wave}: enemies grow stronger. Health, shields, Elemental Gauge and recovery carry over.` });
  const advanced = advanceUnavailableTurns(state);
  return { state: advanced.state, events: [...events, ...advanced.events] };
}

// src/content/banner-materials.ts
var bannerMaterialTiers = [
  { rarity: "Common", weight: 50, amount: 10 },
  { rarity: "Uncommon", weight: 30, amount: 6 },
  { rarity: "Rare", weight: 17, amount: 3 }
];
var bannerDuplicateMaterialAmount = 15;
function bannerMaterialDefinition(id) {
  const family = id.slice(0, id.lastIndexOf("-"));
  const tier = bannerMaterialTiers.find((tier2) => id === `${family}-${tier2.rarity.toLowerCase()}`);
  if (!tier || family !== "rosethorn" && !elements.some((element) => element.id === family)) {
    throw new Error("Unknown banner material.");
  }
  return { id, ...tier };
}
function bannerMaterialPool(event2, remaining) {
  const families = event2 ? ["rosethorn"] : elements.map((element) => element.id);
  return bannerMaterialTiers.flatMap((tier, index) => families.map((family) => ({
    kind: "material",
    id: `${family}-${tier.rarity.toLowerCase()}`,
    stars: index + 1,
    amount: tier.amount,
    chance: remaining * tier.weight / 97 / families.length
  })));
}
function bannerDuplicateMaterials(event2, random) {
  const family = event2 ? "rosethorn" : elements[Math.floor(lootRoll(random) * elements.length)].id;
  return { id: `${family}-rare`, amount: bannerDuplicateMaterialAmount };
}

// src/content/standard-banner.ts
var bannerPityLimits = { highestStar: 80, unownedHighestStar: 150 };
var savedBannerPityBounds = { highestStar: 200, unownedHighestStar: 500 };
var bannerCharacterTierRates = { 5: 0.01, 6: 1e-3 };
function validateBannerPity(value2) {
  if (typeof value2 !== "object" || value2 === null || Array.isArray(value2) || !("highestStar" in value2) || typeof value2.highestStar !== "number" || !Number.isInteger(value2.highestStar) || value2.highestStar < 0 || value2.highestStar >= savedBannerPityBounds.highestStar || !("unownedHighestStar" in value2) || typeof value2.unownedHighestStar !== "number" || !Number.isInteger(value2.unownedHighestStar) || value2.unownedHighestStar < 0 || value2.unownedHighestStar >= savedBannerPityBounds.unownedHighestStar) {
    throw new Error("Invalid saved banner pity counters.");
  }
  return { highestStar: value2.highestStar, unownedHighestStar: value2.unownedHighestStar };
}
function resolveBannerPull(pool, ownedCharacters2, counters, random) {
  const pity = validateBannerPity(counters);
  if (!pool.length || new Set(pool.map((entry2) => entry2.id)).size !== pool.length || pool.some((entry2) => !entry2.id || !["character", "creature", "material"].includes(entry2.kind) || !Number.isInteger(entry2.stars) || entry2.stars < 1 || entry2.stars > 6 || !Number.isFinite(entry2.chance) || entry2.chance <= 0 || entry2.chance > 1) || Math.abs(pool.reduce((sum, entry2) => sum + entry2.chance, 0) - 1) > 1e-12) {
    throw new Error("Invalid banner outcome pool.");
  }
  for (const entry2 of pool) {
    if (entry2.kind !== "material") continue;
    const material = bannerMaterialDefinition(entry2.id);
    if (entry2.stars < 1 || entry2.stars > 3 || !("amount" in entry2) || entry2.amount !== material.amount || entry2.id.split("-").at(-1) !== ["common", "uncommon", "rare"][entry2.stars - 1]) {
      throw new Error("Invalid banner material outcome.");
    }
  }
  const highestStars = Math.max(...pool.map((entry2) => entry2.stars));
  const highest = pool.filter((entry2) => entry2.kind === "character" && entry2.stars === highestStars);
  if (!highest.length) throw new Error("Banner pity requires a highest-star character tier.");
  const unowned = highest.filter((entry2) => !ownedCharacters2.includes(entry2.id));
  let eligible = pool;
  let guarantee = "none";
  if (pity.unownedHighestStar + 1 >= bannerPityLimits.unownedHighestStar) {
    eligible = unowned.length ? unowned : highest;
    guarantee = unowned.length ? "unowned-highest-star" : "all-owned-highest-star";
  } else if (pity.highestStar + 1 >= bannerPityLimits.highestStar) {
    eligible = highest;
    guarantee = "highest-star";
  }
  const roll2 = lootRoll(random);
  let entry;
  if (guarantee !== "none") {
    entry = eligible[Math.floor(roll2 * eligible.length)];
  } else {
    let cumulative = 0;
    entry = pool[pool.length - 1];
    for (const candidate of pool) {
      cumulative += candidate.chance;
      if (roll2 < cumulative) {
        entry = candidate;
        break;
      }
    }
  }
  const highestResult = entry.kind === "character" && entry.stars === highestStars;
  const newHighest = highestResult && !ownedCharacters2.includes(entry.id);
  return { entry, guarantee, pity: {
    highestStar: highestResult ? 0 : pity.highestStar + 1,
    unownedHighestStar: newHighest || guarantee === "all-owned-highest-star" ? 0 : pity.unownedHighestStar + 1
  } };
}
var standardBannerArtwork = {
  path: "banners/summon-standard.png",
  aspectRatio: "16:9",
  direction: "Omnic",
  alt: "Standard Banner: a transcendent elemental sanctuary uniting fire, water, nature, Heaven, Abyss, Crownfall Treasury and Rosethorn Sanctuary."
};
var standardBanner = {
  id: "standard",
  name: "Standard Banner",
  cost: 10,
  available: true,
  artwork: standardBannerArtwork
};
function standardBannerPool() {
  const characters = starters.filter((character) => !isRoseCharacter(character.id) && !isWarCharacter(character.id));
  const characterChance = [5, 6].reduce((total, stars) => total + (characters.some((character) => character.stars === stars) ? bannerCharacterTierRates[stars] : 0), 0);
  const remaining = 1 - characterChance;
  const pool = characters.map((character) => ({
    kind: "character",
    id: character.id,
    stars: character.stars,
    chance: bannerCharacterTierRates[character.stars] / characters.filter((entry) => entry.stars === character.stars).length
  }));
  pool.push(...bannerMaterialPool(false, remaining));
  if (Math.abs(pool.reduce((total, entry) => total + entry.chance, 0) - 1) > 1e-12) {
    throw new Error("Standard Banner probabilities must total 100%.");
  }
  return pool;
}

// src/content/rose-banner.ts
var roseBannerCharacterChance = 0.011;
var roseBanner = {
  id: "roses",
  name: "Roses Under Sunny Skies",
  cost: 10,
  available: true,
  artwork: {
    path: "banners/summon-roses.png",
    aspectRatio: "16:9",
    direction: "Omnic",
    alt: "Roses Under Sunny Skies: crimson roses and golden thorns unfurl beneath a radiant sky."
  }
};
function roseBannerPool() {
  const pool = roseCharacters.map((character) => ({
    kind: "character",
    id: character.id,
    stars: character.stars,
    chance: roseBannerCharacterChance / roseCharacters.length
  }));
  pool.push(...bannerMaterialPool(true, 1 - roseBannerCharacterChance));
  return pool;
}

// src/content/summon-banners.ts
var summonBanners = [
  { ...standardBanner, pool: standardBannerPool },
  { ...roseBanner, pool: roseBannerPool }
];
function isSummonBannerId(value2) {
  return summonBanners.some((banner) => banner.id === value2);
}
function getSummonBanner(id) {
  const banner = summonBanners.find((entry) => entry.id === id);
  if (!banner) throw new Error("Unknown summon banner.");
  return banner;
}

// src/content/material-exchange.ts
var exchangeQuantities = [1, 5, 10];
var normalExchangePrice = 80;
var roseExchangePrices = [2500, 7500, 25e3, 75e3, 25e4, 75e4];
var roseMaterialCharacters = ["Rosetta", "Thornia", "Crinso"];
var exchangeProducts = [
  ...elements.map((element) => ({
    id: element.id,
    materialId: `${element.id}-common`,
    category: "normal",
    rarity: "Common",
    price: normalExchangePrice
  })),
  ...roseMaterials.map((material, tier) => ({
    id: material.id,
    materialId: material.id,
    category: "event",
    rarity: material.rarity,
    price: roseExchangePrices[tier],
    restrictedTo: roseMaterialCharacters,
    eventName: "Roses Under Sunny Skies"
  }))
];
function exchangeProduct(id) {
  const product = exchangeProducts.find((entry) => entry.id === id);
  if (!product) throw new Error("Unknown Material Exchange product.");
  return product;
}
function isExchangeQuantity(value2) {
  return exchangeQuantities.includes(value2);
}

// src/game/account.ts
var ACCOUNT_KEY = "last-light.wallet";
function emptyAccount() {
  return { version: 8, fractalis: 0, lycalis: 0, materials: {}, characters: {}, firstFracture: false, dungeonStages: {}, infusionStages: {}, receipts: [], creatures: {} };
}
function count(value2) {
  return typeof value2 === "number" && Number.isSafeInteger(value2) && value2 >= 0;
}
function record(value2) {
  return typeof value2 === "object" && value2 !== null && !Array.isArray(value2);
}
function migrateLegacyDungeonStage(stage, version) {
  if (!count(stage) || stage < 1 || stage > (version === 2 ? 50 : dungeonStageCount)) throw new Error("Invalid saved dungeon stage.");
  const oldStage = version === 2 ? 1 + Math.round((Math.min(stage, 45) - 1) * (dungeonStageCount - 1) / 44) : stage;
  if (oldStage === 1) return 1;
  if (oldStage === dungeonStageCount) return dungeonStageCount;
  const completedLevel = Math.round(10 + (oldStage - 2) * 110 / 34);
  let unlocked = 1;
  for (let floor = 1; floor <= dungeonStageCount; floor++) {
    if (elementalEnemyLevel(floor) <= completedLevel) unlocked = Math.min(dungeonStageCount, floor + 1);
  }
  return unlocked;
}
function validateAccount(value2) {
  if (!record(value2) || value2.version !== 2 && value2.version !== 3 && value2.version !== 4 && value2.version !== 5 && value2.version !== 6 && value2.version !== 7 && value2.version !== 8 || !count(value2.fractalis) || !count(value2.lycalis) || !record(value2.materials) || !record(value2.characters) || !record(value2.dungeonStages) || typeof value2.firstFracture !== "boolean" || !Array.isArray(value2.receipts) || !value2.receipts.every((receipt) => typeof receipt === "string") || new Set(value2.receipts).size !== value2.receipts.length) {
    throw new Error("The local progression save is invalid or unsupported. It has not been overwritten.");
  }
  const account = emptyAccount();
  account.fractalis = value2.fractalis;
  account.lycalis = value2.lycalis;
  if (value2.calamiticTokens !== void 0) {
    if (!count(value2.calamiticTokens)) throw new Error("Invalid saved Calamitic Token balance.");
    account.calamiticTokens = value2.calamiticTokens;
  }
  if (value2.calamityChests !== void 0) {
    if (!record(value2.calamityChests)) throw new Error("Invalid saved Calamity chest inventory.");
    account.calamityChests = {};
    for (const [id, amount] of Object.entries(value2.calamityChests)) {
      parseCalamityChestId(id);
      if (!count(amount)) throw new Error("Invalid saved Calamity chest count.");
      account.calamityChests[id] = amount;
    }
  }
  if (value2.calamityClears !== void 0) {
    if (!record(value2.calamityClears)) throw new Error("Invalid saved Calamity progress.");
    account.calamityClears = {};
    for (const [id, tier] of Object.entries(value2.calamityClears)) {
      if (!isCalamityActivityId(id) || !count(tier) || tier > 3) throw new Error("Invalid saved Calamity clear.");
      account.calamityClears[id] = tier;
    }
  }
  if (value2.normalFinalClears !== void 0) {
    if (!record(value2.normalFinalClears)) throw new Error("Invalid saved final-clear evidence.");
    account.normalFinalClears = {};
    for (const [id, cleared] of Object.entries(value2.normalFinalClears)) {
      if (!isCalamityActivityId(id) || typeof cleared !== "boolean") throw new Error("Invalid saved final-clear evidence.");
      account.normalFinalClears[id] = cleared;
    }
  }
  if (value2.calamitySeed !== void 0) {
    if (!count(value2.calamitySeed) || value2.calamitySeed < 1 || value2.calamitySeed > 4294967295) throw new Error("Invalid saved Calamity seed.");
    account.calamitySeed = value2.calamitySeed;
  }
  if (value2.mechanicalComponents !== void 0) {
    if (!count(value2.mechanicalComponents)) throw new Error("Invalid saved Broken Mechanical Components balance.");
    account.mechanicalComponents = value2.mechanicalComponents;
  }
  if (value2.masterChests !== void 0) {
    if (!count(value2.masterChests)) throw new Error("Invalid saved Master chest count.");
    account.masterChests = value2.masterChests;
  }
  if (value2.masterConduits !== void 0) {
    if (!record(value2.masterConduits)) throw new Error("Invalid saved Master Conduit inventory.");
    account.masterConduits = {};
    for (const [id, amount] of Object.entries(value2.masterConduits)) {
      if (!isMasterConduitId(id) || amount !== 0 && amount !== 1) throw new Error("Invalid saved Master Conduit unlock.");
      account.masterConduits[id] = amount;
    }
  }
  if (value2.bannerPity !== void 0) {
    if (!record(value2.bannerPity)) throw new Error("Invalid saved banner pity.");
    account.bannerPity = {};
    for (const [id, counters] of Object.entries(value2.bannerPity)) {
      if (!isSummonBannerId(id)) throw new Error("Unknown saved pity banner.");
      account.bannerPity[id] = validateBannerPity(counters);
    }
  }
  account.firstFracture = value2.firstFracture;
  account.receipts = [...value2.receipts];
  if (value2.storyCompleted !== void 0) {
    if (!count(value2.storyCompleted)) throw new Error("Invalid saved Story progress.");
    if (value2.version >= 8) {
      if (value2.storyCompleted > storyRules.stages) throw new Error("Invalid saved Story progress.");
      account.storyCompleted = value2.storyCompleted;
    } else if (value2.version >= 6) {
      const previous = value2.storyCompleted;
      account.storyCompleted = migratePreviousStoryCompleted(previous);
      const credited = account.storyCompleted - previous;
      account.fractalis += credited * storyCompletionReward.fractalis;
      account.lycalis += credited * storyCompletionReward.lycalis;
      if (!count(account.fractalis) || !count(account.lycalis)) throw new Error("Story completion grant exceeds the supported balance. The save has not been overwritten.");
    } else {
      const legacy = value2.storyCompleted;
      account.storyCompleted = migrateLegacyStoryCompleted(legacy);
      account.fractalis += legacy * storyCompletionReward.fractalis;
      account.lycalis += legacy * storyCompletionReward.lycalis;
      if (!count(account.fractalis) || !count(account.lycalis)) throw new Error("Story completion grant exceeds the supported balance. The save has not been overwritten.");
    }
  }
  if (value2.warStages !== void 0) {
    if (!record(value2.warStages)) throw new Error("Invalid saved Elemental War progress.");
    account.warStages = {};
    for (const [id, stage] of Object.entries(value2.warStages)) {
      if (!isWarCharacter(id) || !count(stage) || stage < 1 || stage > warStageCount) throw new Error("Invalid saved Elemental War stage.");
      account.warStages[id] = stage;
    }
  }
  if (value2.conduits !== void 0) {
    if (!record(value2.conduits)) throw new Error("Invalid saved Conduit inventory.");
    account.conduits = {};
    for (const [id, amount] of Object.entries(value2.conduits)) {
      if (!isConduitId(id) || !count(amount)) throw new Error("Invalid saved Conduit inventory.");
      account.conduits[id] = amount;
    }
  }
  if (value2.conduitUpgrades !== void 0) {
    account.conduitUpgrades = validateConduitUpgrades(value2.conduitUpgrades);
    for (const id of Object.keys(account.conduitUpgrades)) {
      if (!isConduitId(id) || (account.conduits?.[id] ?? 0) < 1) throw new Error("Conduit upgrades require an owned Conduit.");
    }
  }
  for (const [id, amount] of Object.entries(value2.materials)) {
    let canonicalId = id;
    if (value2.version < 4) {
      const [element, rarity] = id.split("-");
      if (isLegacyElement(element) && id === `${element}-${rarity}`) canonicalId = `${canonicalElement(element)}-${rarity}`;
    }
    if (!isMaterial(canonicalId) || !count(amount)) throw new Error(`Invalid saved material: ${id}.`);
    const total = (account.materials[canonicalId] ?? 0) + amount;
    if (!count(total)) throw new Error(`Merged material balance exceeds the supported maximum: ${canonicalId}. The save has not been overwritten.`);
    account.materials[canonicalId] = total;
  }
  for (const [id, progress] of Object.entries(value2.characters)) {
    if (!isStarterId(id) || !record(progress) || typeof progress.level !== "number" || typeof progress.evolution !== "number") {
      throw new Error("Invalid saved character progress.");
    }
    if (progress.weaponRank !== void 0 && typeof progress.weaponRank !== "number") throw new Error("Invalid saved weapon rank.");
    const entry = {
      level: progress.level,
      evolution: progress.evolution,
      ...progress.weaponRank !== void 0 ? { weaponRank: progress.weaponRank } : {}
    };
    characterGrowthFactor(entry);
    account.characters[id] = entry;
  }
  if (value2.capturedCharacters !== void 0) account.capturedCharacters = validateCapturedCharacters(value2.version < 7 ? migrateLegacyCapturedCopies(value2.capturedCharacters) : value2.capturedCharacters);
  if (value2.characterLocks !== void 0) account.characterLocks = validateCharacterLocks(value2.characterLocks, account.characters);
  if (value2.squad !== void 0) {
    if (!Array.isArray(value2.squad) || value2.squad.length < 1 || value2.squad.length > 3 || new Set(value2.squad).size !== value2.squad.length || !value2.squad.every((id) => typeof id === "string" && ownedCharacterInstances(account).includes(id))) {
      throw new Error("Invalid saved squad. Equip one to three distinct owned characters.");
    }
    account.squad = [...value2.squad];
  }
  if (value2.masterEquipment !== void 0) {
    if (!record(value2.masterEquipment)) throw new Error("Invalid saved Master equipment.");
    account.masterEquipment = {};
    for (const [character, id] of Object.entries(value2.masterEquipment)) {
      if (!isStarterId(character) || !account.characters[character]) throw new Error("Master equipment requires an owned Element-Bearer.");
      if (id !== null) {
        if (!isMasterConduitId(id) || account.masterConduits?.[id] !== 1) throw new Error("Master equipment requires an owned Master Conduit.");
        validateMasterCharacter(id, character);
      }
      account.masterEquipment[character] = id;
    }
  }
  if (value2.conduitEquipment !== void 0) {
    if (!record(value2.conduitEquipment)) throw new Error("Invalid saved Conduit equipment.");
    account.conduitEquipment = {};
    for (const [id, slots] of Object.entries(value2.conduitEquipment)) {
      if (!ownedCharacterInstances(account).includes(id)) throw new Error("Conduit equipment requires an owned character.");
      const copy = account.capturedCharacters?.find((entry) => entry.instanceId === id);
      const element = isStarterId(id) ? getStarter(id).elementId : copy ? getCreature(copy.creatureId).element : void 0;
      if (!element) throw new Error("Conduit equipment requires an owned captured Elemental-Devourer.");
      if (!Array.isArray(slots) || slots.some((conduit) => conduit !== null && (!isConduitId(conduit) || !(account.conduits?.[conduit] ?? 0)))) {
        throw new Error("Conduit equipment requires an owned Conduit.");
      }
      const equipped2 = value2.version < 5 ? normalizeLegacyKitSlots(slots, element) : validateConduitSlots(slots);
      validateConduitElement(equipped2, element);
      account.conduitEquipment[id] = equipped2;
    }
  }
  for (const [id, stage] of Object.entries(value2.dungeonStages)) {
    const canonicalId = value2.version >= 4 ? id : isLegacyElement(id) ? canonicalElement(id) : id;
    if (!isPlayableDungeon(canonicalId) || !count(stage) || stage < 1 || stage > (value2.version === 2 ? 50 : dungeonStageCount)) throw new Error("Invalid saved dungeon stage.");
    const migratedStage = value2.version >= 4 ? stage : migrateLegacyDungeonStage(stage, value2.version === 2 ? 2 : 3);
    account.dungeonStages[canonicalId] = Math.max(account.dungeonStages[canonicalId] ?? 1, migratedStage);
  }
  if (value2.infusionStages !== void 0) {
    if (!record(value2.infusionStages)) throw new Error("Invalid saved infusion stages.");
    for (const [id, stage] of Object.entries(value2.infusionStages)) {
      if (!isInfusionMode(id) || !count(stage) || stage < 1) throw new Error("Invalid saved infusion stage.");
      const resized = value2.version < 7 && isResizedActivity(id) && !(value2.version === 2 && id !== "machines");
      if (!resized && stage > infusionStageCount(id)) throw new Error("Invalid saved infusion stage.");
      account.infusionStages[id] = resized ? migrateLegacyActivityStage(id, stage) : stage;
    }
    if (value2.creatures !== void 0) {
      if (!record(value2.creatures)) throw new Error("Invalid saved Elemental-Devourer discoveries.");
      for (const [id, entry] of Object.entries(value2.creatures)) {
        getCreature(id);
        if (!record(entry) || typeof entry.defeated !== "boolean") throw new Error("Invalid saved Elemental-Devourer discovery.");
        account.creatures[id] = { defeated: entry.defeated };
      }
    }
  }
  return account;
}
function loadAccount(storage) {
  const raw = storage.getItem(ACCOUNT_KEY);
  const value2 = raw === null ? null : JSON.parse(raw);
  const account = raw === null ? emptyAccount() : record(value2) && value2.version === 1 && count(value2.fractalis) ? { ...emptyAccount(), fractalis: value2.fractalis } : validateAccount(value2);
  const profile = loadProfile(storage);
  if (profile) {
    account.characters[profile.starterId] ??= { level: 0, evolution: 1 };
    account.squad ??= [profile.starterId];
  }
  return account;
}
function ownedCharacters(account) {
  return starters.filter((starter) => account.characters[starter.id] !== void 0).map((starter) => starter.id);
}
function ownedCharacterInstances(account) {
  return [...ownedCharacters(account), ...(account.capturedCharacters ?? []).map((copy) => copy.instanceId)];
}
function characterProtection(account, id) {
  if (!ownedCharacterInstances(account).includes(id)) throw new Error("Choose an owned character instance.");
  const locked = isStarterId(id) ? account.characterLocks?.[id] ?? false : account.capturedCharacters?.find((copy) => copy.instanceId === id)?.locked;
  if (locked === void 0) throw new Error("Captured-character instance is missing.");
  const inSquad = (account.squad ?? ownedCharacters(account).slice(0, 1)).some((member) => member === id);
  return { locked, inSquad, protected: locked || inSquad };
}
function evolutionFodderOptions(account, element, evolution, character) {
  const requirement = character ? characterEvolutionRequirement(character, evolution) : evolutionRequirement(element, evolution);
  return (account.capturedCharacters ?? []).map((copy, index) => {
    const creature = getCreature(copy.creatureId);
    const form = capturedProgress(copy).tier + 1;
    const protection = characterProtection(account, copy.instanceId);
    const reasons = [];
    if (!requirement.requiresInfusableEnemies) reasons.push("No Elemental-Devourers required for this evolution");
    if (creature.mode !== requirement.infusion) reasons.push("From a different activity");
    if (protection.locked) reasons.push("Locked");
    if (protection.inSquad) reasons.push("In squad");
    if (account.conduitEquipment?.[copy.instanceId]?.some((id) => id !== null)) reasons.push("Conduits equipped");
    return { copy, index: index + 1, creature, form, value: form, reasons, eligible: reasons.length === 0 };
  });
}
function fodderSelectionStatus(values, required) {
  const total = values.reduce((sum, value2) => sum + value2, 0);
  const surplus = values.length > 0 && total - Math.min(...values) >= required;
  return { total, required, surplus, ready: required > 0 && total >= required && !surplus };
}
function setCharacterLock(storage, id, locked) {
  if (!loadProfile(storage)) throw new Error("Choose your first Element-Bearer before managing characters.");
  if (typeof locked !== "boolean") throw new Error("Invalid character lock value.");
  const account = loadAccount(storage);
  characterProtection(account, id);
  if (isStarterId(id)) account.characterLocks = { ...account.characterLocks, [id]: locked };
  else {
    const copy = account.capturedCharacters?.find((entry) => entry.instanceId === id);
    if (!copy) throw new Error("Captured-character instance is missing.");
    copy.locked = locked;
  }
  return saveAccount(storage, account);
}
function equippedSquad(account) {
  const ids = account.squad ?? ownedCharacters(account).slice(0, 1);
  if (!ids.length || ids.length > 3 || new Set(ids).size !== ids.length || ids.some((id) => !ownedCharacterInstances(account).includes(id))) {
    throw new Error("Equip one to three distinct owned characters before entering battle.");
  }
  return [...ids];
}
function setSquad(storage, ids) {
  if (!loadProfile(storage)) throw new Error("Choose your first Element-Bearer before editing a squad.");
  const account = loadAccount(storage);
  account.squad = [...ids];
  return saveAccount(storage, account);
}
var summonCost = standardBanner.cost;
var multiSummonCount = 10;
function summonCharacter(storage, random = Math.random, bannerId = "standard") {
  const { account, draws } = summonCharacters(storage, random, bannerId, 1);
  return { account, ...draws[0] };
}
function summonCharacters(storage, random = Math.random, bannerId = "standard", count2 = multiSummonCount) {
  if (!loadProfile(storage)) throw new Error("Choose your first Element-Bearer before summoning.");
  const banner = getSummonBanner(bannerId);
  if (count2 !== 1 && count2 !== multiSummonCount) throw new Error("Choose a single or 10-pull summon.");
  if (!banner.available) throw new Error("Banner unavailable.");
  const account = loadAccount(storage);
  const cost = banner.cost * count2;
  if (account.lycalis < cost) throw new Error(`${count2 === 1 ? "Summoning" : "A 10-pull"} requires ${cost} Null-Prismatica.`);
  const draws = Array.from({ length: count2 }, () => drawBanner(account, banner, random));
  account.lycalis -= cost;
  return { account: saveAccount(storage, account), draws };
}
function drawBanner(account, banner, random) {
  const result = resolveBannerPull(
    banner.pool(),
    ownedCharacters(account),
    account.bannerPity?.[banner.id] ?? { highestStar: 0, unownedHighestStar: 0 },
    random
  );
  const duplicate = result.entry.kind === "character" && account.characters[result.entry.id] !== void 0;
  let materials;
  if (duplicate) {
    materials = bannerDuplicateMaterials(banner.id === "roses", random);
  } else if (result.entry.kind === "material") {
    materials = { id: result.entry.id, amount: result.entry.amount };
  } else if (result.entry.kind === "creature") {
    throw new Error("Elemental-Devourer summon outcomes are retired.");
  } else {
    account.characters[result.entry.id] = { level: 0, evolution: 1, weaponRank: 0 };
  }
  if (materials) account.materials[materials.id] = (account.materials[materials.id] ?? 0) + materials.amount;
  account.bannerPity = { ...account.bannerPity, [banner.id]: result.pity };
  const bonusConduit = bannerConduitBonus(random);
  if (bonusConduit) account.conduits = { ...account.conduits, [bonusConduit]: (account.conduits?.[bonusConduit] ?? 0) + 1 };
  return { entry: result.entry, materials, duplicate, guarantee: result.guarantee, bonusConduit };
}
function purchaseExchangeMaterial(storage, productId, quantity) {
  if (!loadProfile(storage)) throw new Error("Choose your first Element-****** using the Material Exchange.");
  const product = exchangeProduct(productId);
  if (!isExchangeQuantity(quantity)) throw new Error("Invalid Material Exchange quantity.");
  const account = loadAccount(storage);
  const cost = product.price * quantity;
  if (account.fractalis < cost) throw new Error(`Not enough Prismatica. ${quantity} costs ${cost}.`);
  const owned = (account.materials[product.materialId] ?? 0) + quantity;
  if (!Number.isSafeInteger(owned)) throw new Error("Material inventory capacity reached.");
  account.fractalis -= cost;
  account.materials[product.materialId] = owned;
  return saveAccount(storage, account);
}
function isSellableCreatureMode(mode) {
  return !!mode && (isCurrencyMode(mode) || mode === "roses" || mode === "heavens" || mode === "abyss");
}
function creatureSaleOffer(account, id, optionId) {
  const copy = account.capturedCharacters?.find((entry) => entry.instanceId === id);
  const mode = copy && getCreature(copy.creatureId).mode;
  if (!copy || !mode || !isSellableCreatureMode(mode)) throw new Error("Only an owned currency-farm, Heaven, Abyss or Roselius Elemental-Devourer can be sold here.");
  const protection = characterProtection(account, id);
  const reasons = [
    ...protection.locked ? ["Locked"] : [],
    ...protection.inSquad ? ["In squad"] : [],
    ...account.conduitEquipment?.[id]?.some((conduit) => conduit !== null) ? ["Conduits equipped"] : []
  ];
  const options = creatureSaleOptions(mode, capturedProgress(copy).tier);
  const chosen = optionId === void 0 ? options[0] : options.find((option2) => option2.id === optionId);
  if (!chosen) throw new Error("Choose one of the listed sale payouts.");
  const { id: option, ...payout } = chosen;
  return { copy, ...payout, option, options, reasons };
}
function sellCurrencyCreature(storage, id, optionId) {
  if (!loadProfile(storage)) throw new Error("Choose your first Element-Bearer before selling Elemental-Devourers.");
  const account = loadAccount(storage);
  const offer = creatureSaleOffer(account, id, optionId);
  if (offer.reasons.length) throw new Error(`Elemental-Devourer cannot be sold: ${offer.reasons.join(", ")}.`);
  account.fractalis += offer.fractalis;
  account.lycalis += offer.lycalis;
  for (const [material, amount] of Object.entries(offer.materials)) account.materials[material] = (account.materials[material] ?? 0) + amount;
  if (![account.fractalis, account.lycalis, ...Object.keys(offer.materials).map((material) => account.materials[material])].every(Number.isSafeInteger)) throw new Error("Currency or material capacity reached.");
  account.capturedCharacters = account.capturedCharacters?.filter((copy) => copy.instanceId !== id);
  if (account.conduitEquipment) delete account.conduitEquipment[id];
  return saveAccount(storage, account);
}
function ownedProgress(account, id) {
  return account.characters[id] ?? { level: 0, evolution: 1 };
}
function purchaseConduit(storage, id) {
  if (!loadProfile(storage)) throw new Error("Choose your first Element-Bearer before visiting the Conduit Store.");
  if (!isConduitId(id)) throw new Error("Unknown Conduit.");
  const conduit = getConduit(id);
  if (isCalamiticConduitId(id)) {
    const account2 = loadAccount(storage);
    if (!calamiticStoreUnlocked(account2)) throw new Error(calamiticLockMessage);
    if ((account2.conduits?.[id] ?? 0) > 0) throw new Error("This Calamitic Conduit is already owned.");
    if ((account2.calamiticTokens ?? 0) < calamiticTokenPrice) throw new Error(`Not enough Calamitic Tokens. ${conduit.name} costs ${calamiticTokenPrice}.`);
    account2.calamiticTokens = (account2.calamiticTokens ?? 0) - calamiticTokenPrice;
    account2.conduits = { ...account2.conduits, [id]: 1 };
    return saveAccount(storage, account2);
  }
  if (conduit.price === null) throw new Error("This Conduit is earned from drops, not sold in the Store.");
  const account = loadAccount(storage);
  if (account.fractalis < conduit.price) throw new Error(`Not enough Prismatica. ${conduit.name} costs ${conduit.price}.`);
  const quantity = account.conduits?.[id] ?? 0;
  if (!Number.isSafeInteger(quantity + 1)) throw new Error("Conduit inventory capacity reached.");
  account.fractalis -= conduit.price;
  account.conduits = { ...account.conduits, [id]: quantity + 1 };
  return saveAccount(storage, account);
}
function equipConduit(storage, character, slot, conduit) {
  if (!loadProfile(storage)) throw new Error("Choose your first Element-Bearer before equipping Conduits.");
  const account = loadAccount(storage);
  if (!ownedCharacterInstances(account).includes(character)) throw new Error("Choose an owned character.");
  if (!Number.isInteger(slot) || slot < 0 || slot >= conduitSlotCount) throw new Error("Choose an ordinary Conduit slot. The Master slot is reserved.");
  if (conduit !== null && (!isConduitId(conduit) || (account.conduits?.[conduit] ?? 0) < 1)) throw new Error("Choose an owned Conduit.");
  const slots = [...account.conduitEquipment?.[character] ?? Array(conduitSlotCount).fill(null)];
  slots[slot] = conduit;
  account.conduitEquipment = { ...account.conduitEquipment, [character]: validateConduitSlots(slots) };
  return saveAccount(storage, account);
}
function unequipAllConduits(storage, character) {
  if (!loadProfile(storage)) throw new Error("Choose your first Element-Bearer before changing equipment.");
  const account = loadAccount(storage);
  if (!ownedCharacterInstances(account).includes(character)) throw new Error("Choose an owned character.");
  account.conduitEquipment = { ...account.conduitEquipment, [character]: Array(conduitSlotCount).fill(null) };
  if (isStarterId(character) && account.masterEquipment?.[character]) {
    account.masterEquipment = { ...account.masterEquipment, [character]: null };
  }
  return saveAccount(storage, account);
}
function openMasterChest(storage, id) {
  if (!loadProfile(storage)) throw new Error("Choose your first Element-Bearer before opening a Master chest.");
  if (!isMasterConduitId(id)) throw new Error("Choose a valid Master Conduit.");
  const account = loadAccount(storage);
  if ((account.masterChests ?? 0) < 1) throw new Error("No Cosmic Grand Master Chest is available.");
  if ((account.masterConduits?.[id] ?? 0) > 0) throw new Error("This Master Conduit is already owned. Choose an unowned Master.");
  account.masterChests = (account.masterChests ?? 0) - 1;
  account.masterConduits = { ...account.masterConduits, [id]: 1 };
  return saveAccount(storage, account);
}
function calamityUnlockedTier(account, activity) {
  if (!isCalamityActivityId(activity)) throw new Error("Unknown Calamity activity.");
  if (account.normalFinalClears?.[activity] !== true) {
    const dungeon = isPlayableDungeon(activity);
    const finalStage = dungeon ? dungeonStageCount : infusionStageCount(activity);
    const access = dungeon ? account.dungeonStages[activity] : account.infusionStages[activity];
    const boss = dungeon ? `dungeon-${activity}-${finalStage}-0` : `infusion-${activity}-${finalStage}-0`;
    const uuid2 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (access !== finalStage || !account.receipts.some((entry) => entry.length === 37 + boss.length && uuid2.test(entry.slice(0, 36)) && entry.slice(36) === `:${boss}`)) return 0;
  }
  return Math.min(3, (account.calamityClears?.[activity] ?? 0) + 1);
}
function openCalamityChest(storage, id, expectedCount) {
  if (!loadProfile(storage)) throw new Error("Choose your first Element-Bearer before opening a Calamity chest.");
  const { activity, tier } = parseCalamityChestId(id);
  const account = loadAccount(storage);
  const available = account.calamityChests?.[id] ?? 0;
  if (!count(expectedCount) || expectedCount < 1 || available !== expectedCount) {
    throw new Error("Calamity chest count changed. Review the current inventory before retrying.");
  }
  let seed2 = account.calamitySeed ?? 2654435769;
  const reward = rollCalamityChest(activity, tier, () => {
    seed2 ^= seed2 << 13;
    seed2 ^= seed2 >>> 17;
    seed2 ^= seed2 << 5;
    seed2 >>>= 0;
    return seed2 / 4294967296;
  });
  const add = (current, amount) => {
    if (!count(amount) || !count(current + amount)) throw new Error("Calamity reward inventory capacity reached.");
    return current + amount;
  };
  account.fractalis = add(account.fractalis, reward.fractalis);
  account.lycalis = add(account.lycalis, reward.lycalis);
  for (const [material, amount] of Object.entries(reward.materials)) {
    if (!isMaterial(material)) throw new Error("Invalid Calamity material reward.");
    account.materials[material] = add(account.materials[material] ?? 0, amount);
  }
  for (const [conduit, amount] of Object.entries(reward.conduits)) {
    if (!isConduitId(conduit)) throw new Error("Invalid Calamity Conduit reward.");
    account.conduits = { ...account.conduits, [conduit]: add(account.conduits?.[conduit] ?? 0, amount) };
  }
  account.mechanicalComponents = add(account.mechanicalComponents ?? 0, reward.mechanicalComponents);
  account.calamiticTokens = add(account.calamiticTokens ?? 0, reward.calamiticTokens);
  account.masterChests = add(account.masterChests ?? 0, reward.masterChests);
  account.calamityChests = { ...account.calamityChests, [id]: available - 1 };
  account.calamitySeed = seed2;
  const saved = saveAccount(storage, account);
  return { account: saved, chest: calamityChest(activity, tier), reward };
}
function equipMasterConduit(storage, character, id) {
  if (!loadProfile(storage)) throw new Error("Choose your first Element-Bearer before equipping a Master.");
  const account = loadAccount(storage);
  if (!isStarterId(character) || !account.characters[character]) throw new Error("Choose an owned Element-Bearer.");
  if (id !== null) {
    if (!isMasterConduitId(id) || account.masterConduits?.[id] !== 1) throw new Error("Choose an owned Master Conduit.");
    validateMasterCharacter(id, character);
  }
  account.masterEquipment = { ...account.masterEquipment, [character]: id };
  return saveAccount(storage, account);
}
function conduitMaxLevelPlan(account, id) {
  if (!isConduitId(id)) throw new Error("Unknown Conduit.");
  if ((account.conduits?.[id] ?? 0) < 1) throw new Error("Choose an owned Conduit to upgrade.");
  const conduit = getConduit(id);
  const currentLevel = account.conduitUpgrades?.[id] ?? 0;
  let targetLevel = currentLevel;
  let cost = 0;
  while (targetLevel < conduitUpgradeCap) {
    const nextCost = conduitUpgradeCost(conduit, targetLevel);
    if (nextCost === null) throw new Error("Conduit upgrade cost is missing.");
    if (cost + nextCost > (account.mechanicalComponents ?? 0)) break;
    cost += nextCost;
    targetLevel++;
  }
  return { id, currentLevel, targetLevel, cost };
}
function upgradeConduitToMaximum(storage, expected) {
  if (!loadProfile(storage)) throw new Error("Choose your first Element-Bearer before upgrading Conduits.");
  const account = loadAccount(storage);
  const plan = conduitMaxLevelPlan(account, expected.id);
  if (plan.currentLevel !== expected.currentLevel || plan.targetLevel !== expected.targetLevel || plan.cost !== expected.cost) {
    throw new Error("This Conduit Max Level preview changed. Review the current level and cost before retrying.");
  }
  if (plan.targetLevel === plan.currentLevel) throw new Error("No additional Conduit upgrades are affordable within the current cap.");
  account.mechanicalComponents = (account.mechanicalComponents ?? 0) - plan.cost;
  account.conduitUpgrades = { ...account.conduitUpgrades, [plan.id]: plan.targetLevel };
  return saveAccount(storage, account);
}
function upgradeConduit(storage, id, expectedLevel) {
  if (!loadProfile(storage)) throw new Error("Choose your first Element-Bearer before upgrading Conduits.");
  if (!isConduitId(id)) throw new Error("Unknown Conduit.");
  const cost = conduitUpgradeCost(getConduit(id), expectedLevel);
  const account = loadAccount(storage);
  if ((account.conduits?.[id] ?? 0) < 1) throw new Error("Choose an owned Conduit to upgrade.");
  const level = account.conduitUpgrades?.[id] ?? 0;
  if (level !== expectedLevel) throw new Error("This Conduit upgrade level changed. Review the current level and cost before retrying.");
  if (cost === null) throw new Error("This Conduit is already upgraded five times.");
  if ((account.mechanicalComponents ?? 0) < cost) throw new Error(`Not enough Broken Mechanical Components. This upgrade costs ${cost}.`);
  account.mechanicalComponents = (account.mechanicalComponents ?? 0) - cost;
  account.conduitUpgrades = { ...account.conduitUpgrades, [id]: level + 1 };
  return saveAccount(storage, account);
}
function saveAccount(storage, account) {
  const validated = validateAccount(account);
  storage.setItem(ACCOUNT_KEY, JSON.stringify(validated));
  return validated;
}
function isMaterial(id) {
  return elementalMaterials.some((material) => material.id === id) || specialtyMaterials.some((material) => material.id === id) || roseMaterials.some((material) => material.id === id);
}
function upgradeCharacter(storage, id, kind, expected, fodderIds = []) {
  if (kind === "weapon") throw new Error("Weapon upgrades are unavailable. Existing weapon bonuses are preserved.");
  if (!loadProfile(storage)) throw new Error("Choose your Owned Element-Bearer to upgrade.");
  if (kind !== "level" && kind !== "evolve") throw new Error("Unknown character upgrade.");
  const account = loadAccount(storage);
  if (account.characters[id] === void 0) throw new Error("Choose your Owned Element-Bearer to upgrade.");
  const current = ownedProgress(account, id);
  if (current.level !== expected.level || current.evolution !== expected.evolution || (current.weaponRank ?? 0) !== (expected.weaponRank ?? 0)) throw new Error("Character progress changed. Reopen this tab before upgrading.");
  const element = getStarter(id).elementId;
  const cost = kind === "level" ? characterLevelCost(id, current) : characterEvolutionCost(id, current);
  if (kind === "evolve" && current.level !== characterLevelCap(current.evolution)) throw new Error("Reach this form level cap before evolving.");
  const requiredValue = kind === "evolve" ? characterEvolutionRequirement(id, current.evolution).fodderValue : 0;
  if (new Set(fodderIds).size !== fodderIds.length) throw new Error("Choose each captured Elemental-Devourer only once.");
  if (!requiredValue && fodderIds.length) throw new Error("This upgrade does not consume Elemental-Devourers.");
  if (requiredValue) {
    const options = evolutionFodderOptions(account, element, current.evolution, id);
    const values = [];
    for (const id2 of fodderIds) {
      const option = options.find((entry) => entry.copy.instanceId === id2);
      if (!option) throw new Error("Selected captured Elemental-Devourer is no longer owned.");
      if (!option.eligible) throw new Error(`Cannot consume [${option.creature.name}]: ${option.reasons.join(", ")}.`);
      values.push(option.value);
    }
    const status4 = fodderSelectionStatus(values, requiredValue);
    if (status4.total < requiredValue) throw new Error(`Choose Elemental-Devourers worth ${requiredValue} Evolution Value (currently ${status4.total}).`);
    if (status4.surplus) throw new Error("Remove extra Elemental-Devourers; the evolution is already covered without one of them.");
  }
  if (account.fractalis < cost.fractalis) throw new Error("Not enough Prismatica.");
  for (const [material, amount] of Object.entries(cost.materials)) {
    if ((account.materials[material] ?? 0) < amount) throw new Error(`Not enough ${materialName(material)}.`);
  }
  account.fractalis -= cost.fractalis;
  for (const [material, amount] of Object.entries(cost.materials)) account.materials[material] -= amount;
  if (fodderIds.length) {
    account.capturedCharacters = account.capturedCharacters?.filter((copy) => !fodderIds.includes(copy.instanceId));
    for (const id2 of fodderIds) if (account.conduitEquipment) delete account.conduitEquipment[id2];
  }
  account.characters[id] = kind === "level" ? { ...current, level: current.level + 1 } : { ...current, evolution: current.evolution + 1 };
  if (kind === "evolve" && !account.firstFracture) {
    account.lycalis += fractureRules.lycalisReward;
    account.firstFracture = true;
  }
  return saveAccount(storage, account);
}
function saveAccountRewards(storage, result, runId) {
  const account = loadAccount(storage);
  if (result.state.calamity !== void 0) {
    const activity = result.state.calamity;
    if (!record(activity) || !isCalamityActivityId(activity.activity) || !isCalamityTier(activity.tier) || result.state.dungeon || result.state.infusion || result.state.story || result.state.war || !["player", "cleared", "defeat"].includes(result.state.phase) || result.state.wave !== 1 || result.state.enemies.length !== 1 || activity.tier > calamityUnlockedTier(account, activity.activity)) {
      throw new Error("Invalid or locked Calamity encounter.");
    }
    const boss = result.state.enemies[0];
    const encounter2 = calamityEncounter(activity.activity, activity.tier);
    const rewards = result.events.filter((event2) => event2.kind === "reward");
    const reward = rewards[0];
    const id = calamityChestId(activity.activity, activity.tier);
    if (!boss.boss || !Number.isFinite(boss.hp) || boss.creatureId !== `calamity:${activity.activity}` || boss.id !== `calamity-${activity.activity}` || boss.definitionId !== `calamity:${activity.activity}` || boss.side !== "enemy" || boss.element !== encounter2.element || boss.level !== encounter2.level || boss.name !== encounter2.name) {
      throw new Error("Invalid Calamity boss.");
    }
    getCreature(boss.creatureId);
    if (rewards.length === 0 && result.state.phase !== "cleared" && boss.hp > 0) {
      if (result.events.some((event2) => event2.calamityChest !== void 0 || event2.capture !== void 0 || event2.recruitment !== void 0 || event2.recruitmentOutcome !== void 0)) throw new Error("Invalid Calamity reward payload.");
      if (account.creatures[boss.creatureId]) return account;
      account.creatures[boss.creatureId] = { defeated: false };
      return saveAccount(storage, account);
    }
    if (result.state.phase !== "cleared" || boss.hp > 0 || rewards.length !== 1 || reward.source !== boss.id || reward.target !== boss.id || reward.amount !== 0 || reward.critical !== false || reward.calamityChest !== id || Object.entries(reward).some(([key, value2]) => value2 !== void 0 && !["kind", "source", "target", "amount", "critical", "message", "calamityChest"].includes(key)) || result.events.some((event2) => event2 !== reward && event2.calamityChest !== void 0)) {
      throw new Error("Invalid Calamity chest reward.");
    }
    const receipt = `${runId}:${boss.id}`;
    if (account.receipts.includes(receipt)) return account;
    const amount = (account.calamityChests?.[id] ?? 0) + 1;
    if (!count(amount)) throw new Error("Calamity chest inventory capacity reached.");
    account.calamityChests = { ...account.calamityChests, [id]: amount };
    account.calamityClears = {
      ...account.calamityClears,
      [activity.activity]: Math.max(account.calamityClears?.[activity.activity] ?? 0, activity.tier)
    };
    account.creatures[boss.creatureId] = { defeated: true };
    account.receipts.push(receipt);
    return saveAccount(storage, account);
  }
  if (result.events.some((event2) => event2.calamityChest !== void 0)) throw new Error("Calamity chests require a Calamity encounter.");
  let changed = false;
  const rewardedEnemies = /* @__PURE__ */ new Set();
  const recruitments = [];
  const storyBonuses = [];
  let storyCompletion = null;
  let storyClearPay = storyClearReward(false);
  const story = result.state.story;
  if (story) {
    const encounter2 = storyEncounter(story.storyStage);
    if (result.state.dungeon || result.state.infusion || result.state.war || result.state.wave !== story.storyStage || story.storyStage > unlockedStoryStage(account) || result.state.enemies.length !== (encounter2.boss ? 1 : 2) || result.state.enemies.some((enemy, index) => enemy.id !== `story-${story.storyStage}-${index}` || enemy.level !== encounter2.level || enemy.element !== encounter2.element || enemy.boss !== encounter2.boss || !Array.from({ length: encounter2.boss ? 1 : 4 }, (_, identity) => storyCreature(story.storyStage, identity).id).includes(enemy.creatureId ?? ""))) {
      throw new Error("Invalid or locked Story encounter.");
    }
  }
  for (const enemy of result.state.enemies) {
    if (!enemy.creatureId) continue;
    getCreature(enemy.creatureId);
    const defeated = result.events.some((event2) => event2.kind === "reward" && event2.source === enemy.id);
    const current = account.creatures[enemy.creatureId];
    if (!current || defeated && !current.defeated) {
      account.creatures[enemy.creatureId] = { defeated: defeated || current?.defeated === true };
      changed = true;
    }
  }
  for (const reward of result.events.filter((event2) => event2.kind === "reward")) {
    if ("calamiticTokens" in reward) throw new Error("Calamitic Tokens only come from opening Calamity chests.");
    const receipt = `${runId}:${reward.source}`;
    if (account.receipts.includes(receipt)) continue;
    const enemy = result.state.enemies.find((unit) => unit.id === reward.source);
    if (!enemy || enemy.level === null) throw new Error("Enemy reward source is missing.");
    const multiplier = bossLootMultiplier(result.state, enemy.boss === true);
    if (reward.masterChests !== void 0) {
      const activity = result.state.infusion;
      if (reward.masterChests !== 1 || activity?.mode !== "machines" || activity.stage !== masterChest.stage || result.state.wave !== masterChest.stage || unlockedInfusionStage(account, "machines") < masterChest.stage || result.state.phase !== "cleared" || result.state.enemies.length !== 1 || enemy.id !== `infusion-machines-${masterChest.stage}-0` || !enemy.boss || enemy.hp > 0 || enemy.creatureId !== "infusion:machines:5" || enemy.level !== 120 || result.state.story || result.state.dungeon || result.state.war) {
        throw new Error("Master chests only drop from the final Awaken the Machines boss.");
      }
      account.masterChests = (account.masterChests ?? 0) + 1;
      if (!count(account.masterChests)) throw new Error("Master chest inventory capacity reached.");
    }
    if (story) {
      const stage = story.storyStage;
      const encounter2 = storyEncounter(stage);
      const range3 = bossLootRange(storyEnemyFractalisDrop(encounter2.level, enemy.boss === true), multiplier);
      const materialPool = storyMaterialLoot(stage);
      if (enemy.hp > 0 || reward.capture !== void 0 || reward.conduits !== void 0 || reward.mechanicalComponents !== void 0 || reward.lycalis !== void 0 || reward.storyBonus !== void 0 || reward.recruitment !== void 0 || reward.recruitmentOutcome !== void 0 || !count(reward.amount) || reward.amount < range3.minimum || reward.amount > range3.maximum || reward.amount % multiplier !== 0 || !record(reward.materials) || !count(reward.materials[`${encounter2.element}-common`])) {
        throw new Error("Invalid Story reward.");
      }
      for (const [id, amount] of Object.entries(reward.materials)) {
        const drop = materialPool.find((entry) => entry.id === id);
        if (!drop || !count(amount) || amount < drop.minimum || amount > drop.maximum || amount % multiplier !== 0) throw new Error("Invalid Story material drop.");
        account.materials[id] = (account.materials[id] ?? 0) + amount;
      }
      account.fractalis += reward.amount;
      if (encounter2.boss && result.state.phase === "cleared" && (account.storyCompleted ?? 0) < stage) {
        const bonus = storyBossBonus(stage);
        account.fractalis += bonus.fractalis;
        account.lycalis += bonus.lycalis;
        storyBonuses.push({ reward, bonus });
      }
      account.receipts.push(receipt);
      changed = true;
      continue;
    }
    if (reward.storyBonus !== void 0) throw new Error("Story bonuses require a regional first clear.");
    if (result.state.war) {
      const { character, stage } = result.state.war;
      const encounter2 = warEncounter(character, stage);
      const loot = warLoot(stage);
      if (result.state.dungeon || result.state.infusion || result.state.enemies.length !== 1 || stage > unlockedWarStage(account, character) || result.state.wave !== stage || result.state.phase !== "cleared" || enemy.hp > 0 || enemy.definitionId !== character || enemy.id !== `war-${character}-${stage}` || enemy.level !== encounter2.level || enemy.element !== encounter2.element || enemy.evolution !== encounter2.evolution || !enemy.boss || enemy.creatureId || reward.capture !== void 0 || reward.materials !== void 0 || reward.conduits !== void 0 || reward.mechanicalComponents !== void 0 || !count(reward.amount) || reward.amount < loot.fractalis.minimum || reward.amount > loot.fractalis.maximum || reward.amount % multiplier !== 0 || reward.lycalis !== void 0 && reward.lycalis !== loot.lycalis.quantity || reward.recruitmentOutcome !== void 0 || reward.recruitment !== void 0 && (stage !== warStageCount || reward.recruitment !== character)) {
        throw new Error("Invalid Elemental War reward.");
      }
      account.fractalis += reward.amount;
      account.lycalis += reward.lycalis ?? 0;
      if (reward.recruitment) {
        const outcome = account.characters[character] ? "duplicate" : "new";
        if (outcome === "duplicate") account.lycalis += 100;
        else account.characters[character] = { level: 0, evolution: 1, weaponRank: 0 };
        recruitments.push({ reward, character, outcome });
      }
      account.receipts.push(receipt);
      changed = true;
      continue;
    }
    if (reward.recruitment !== void 0 || reward.recruitmentOutcome !== void 0) throw new Error("Recruitment requires Elemental War.");
    const range2 = bossLootRange(result.state.infusion?.mode === "treasury" ? treasuryFractalisDrop(enemy.level) : fractalisDrop(enemy.level, result.state.infusion?.mode === "roses" ? 140 : 120), multiplier);
    if (result.state.infusion && (isCurrencyMode(result.state.infusion.mode) || result.state.infusion.mode === "roses" || result.state.infusion.mode === "machines") && (enemy.hp > 0 || !enemy.creatureId || getCreature(enemy.creatureId).mode !== result.state.infusion.mode || !getCreature(enemy.creatureId).stages.includes(result.state.infusion.stage) || enemy.level !== infusionEncounter(result.state.infusion.mode, result.state.infusion.stage, result.state.infusion.schedule ?? "legacy").level)) throw new Error("Invalid currency-farm reward source.");
    if (!count(reward.amount) || reward.amount < range2.minimum || reward.amount > range2.maximum || reward.amount % multiplier !== 0) throw new Error("Invalid enemy Prismatica drop.");
    account.fractalis += reward.amount;
    if (result.state.infusion?.mode === "machines" && reward.mechanicalComponents === void 0) {
      throw new Error("Awaken the Machines rewards require Broken Mechanical Components.");
    }
    if (reward.mechanicalComponents !== void 0) {
      if (result.state.infusion?.mode !== "machines") throw new Error("Broken Mechanical Components only drop in Awaken the Machines.");
      const drop = machineComponentDrop(result.state.infusion.stage);
      if (!count(reward.mechanicalComponents) || reward.mechanicalComponents < drop.minimum || reward.mechanicalComponents > drop.maximum) throw new Error("Invalid Broken Mechanical Components reward.");
      account.mechanicalComponents = (account.mechanicalComponents ?? 0) + reward.mechanicalComponents;
      if (!count(account.mechanicalComponents)) throw new Error("Broken Mechanical Components balance capacity reached.");
    }
    if (reward.conduits !== void 0) {
      if (result.state.infusion?.mode !== "machines") throw new Error("Conduit drops require Awaken the Machines.");
      const eligible = machineConduitLoot(result.state.infusion.stage, account.conduits);
      const tiers = /* @__PURE__ */ new Set();
      for (const [id, amount] of Object.entries(reward.conduits)) {
        if (!isConduitId(id) || amount !== 1 || !eligible.some((drop) => drop.id === id && drop.chance > 0)) throw new Error("Invalid machine Conduit reward: only unowned eligible names may drop.");
        const rarity = getConduit(id).rarity;
        if (tiers.has(rarity)) throw new Error("Only one Conduit per tier may drop per enemy.");
        tiers.add(rarity);
        account.conduits = { ...account.conduits, [id]: (account.conduits?.[id] ?? 0) + amount };
      }
    }
    if (reward.lycalis !== void 0) {
      const creature = enemy.creatureId ? getCreature(enemy.creatureId) : void 0;
      if (!Number.isInteger(reward.lycalis) || reward.lycalis < 1 || !result.state.infusion || result.state.infusion.mode === "treasury" || result.state.infusion.mode === "roses" || result.state.infusion.mode === "machines" || creature?.mode !== result.state.infusion.mode || !creature.stages.includes(result.state.infusion.stage) || enemy.hp > 0 || enemy.level !== infusionEncounter(result.state.infusion.mode, result.state.infusion.stage, result.state.infusion.schedule ?? "legacy").level || !stagedLycalisOdds(result.state.infusion.mode, enemy.level, result.state.infusion.stage).some((outcome) => outcome.amount === reward.lycalis)) {
        throw new Error("Invalid enemy Null-Prismatica reward.");
      }
      account.lycalis += reward.lycalis;
    }
    if (result.state.infusion?.mode === "roses" && !count(reward.materials?.["rosethorn-common"])) throw new Error("Roselius rewards require their guaranteed Seed drop.");
    for (const [id, amount] of Object.entries(reward.materials ?? {})) {
      if (result.state.infusion && (isCurrencyMode(result.state.infusion.mode) || result.state.infusion.mode === "machines")) throw new Error("This activity does not drop materials.");
      if (!count(amount) || !isMaterial(id)) throw new Error("Invalid enemy material drop.");
      if (result.state.infusion?.mode === "roses") {
        const drop = infusionLoot("roses", result.state.infusion.stage).specialties.find((entry) => entry.id === id);
        if (!drop || amount < drop.minimum || amount > drop.maximum || amount % multiplier !== 0) throw new Error("Invalid Rosethorn material drop.");
      } else if (roseMaterials.some((material) => material.id === id)) throw new Error("Rosethorn materials only drop in Passion of Crimson Roses.");
      if (multiplier > 1) {
        const activity = result.state.infusion;
        const pool = result.state.dungeon ? materialLoot(result.state.dungeon.element, result.state.dungeon.stage) : activity ? (() => {
          const loot = infusionLoot(activity.mode, activity.stage, activity.schedule ?? "legacy");
          return [...loot.specialties, ...loot.bonuses.flatMap((drop2) => infusionElements(activity.mode).map((element) => ({ ...drop2, id: `${element.id}-${drop2.rarity}` })))];
        })() : [];
        const drop = pool.find((drop2) => drop2.id === id);
        if (!drop || amount < drop.minimum || amount > drop.maximum || amount % multiplier !== 0) {
          throw new Error("Invalid final-boss material drop.");
        }
      }
      account.materials[id] = (account.materials[id] ?? 0) + amount;
    }
    if (reward.capture) {
      const creature = getCreature(reward.capture.creatureId);
      const stage = result.state.infusion?.stage;
      if (!creature.mode || creature.mode === "machines" || !stage || creature.mode !== result.state.infusion?.mode || enemy.hp > 0 || enemy.creatureId !== creature.id || !creature.stages.includes(stage) || reward.capture.level !== Math.min(capturedLevelCap, enemy.level) || enemy.level !== infusionEncounter(creature.mode, stage, result.state.infusion?.schedule ?? "legacy").level || creature.mode === "roses" && enemy.level > roseCaptureMaximumLevel) {
        throw new Error("Invalid captured enemy reward.");
      }
      const copy = createCreatureCopy(creature.id, stage, enemy.level);
      account.capturedCharacters = validateCapturedCharacters([...account.capturedCharacters ?? [], copy]);
    }
    rewardedEnemies.add(enemy.id);
    account.receipts.push(receipt);
    changed = true;
  }
  const dungeon = result.state.dungeon;
  if (dungeon && result.state.phase === "cleared") {
    const unlocked = Math.min(dungeonStageCount, dungeon.stage + 1);
    if ((account.dungeonStages[dungeon.element] ?? 1) < unlocked) {
      account.dungeonStages[dungeon.element] = unlocked;
      changed = true;
    }
  }
  const infusion = result.state.infusion;
  if (infusion && result.state.phase === "cleared") {
    const unlocked = Math.min(infusionStageCount(infusion.mode), infusion.stage + 1);
    if ((account.infusionStages[infusion.mode] ?? 1) < unlocked) {
      account.infusionStages[infusion.mode] = unlocked;
      changed = true;
    }
  }
  const war = result.state.war;
  if (war && result.state.phase === "cleared" && result.state.enemies.length === 1 && result.state.enemies[0].hp <= 0 && account.receipts.includes(`${runId}:${result.state.enemies[0].id}`)) {
    const unlocked = Math.min(warStageCount, war.stage + 1);
    if (unlockedWarStage(account, war.character) < unlocked) {
      account.warStages = { ...account.warStages, [war.character]: unlocked };
      changed = true;
    }
  }
  if (story && result.state.phase === "cleared") {
    if (result.state.enemies.some((enemy) => enemy.hp > 0 || !account.receipts.includes(`${runId}:${enemy.id}`))) {
      throw new Error("Story clear requires saved rewards for every defeated enemy.");
    }
    const firstClear = (account.storyCompleted ?? 0) < story.storyStage;
    if (firstClear) {
      account.storyCompleted = story.storyStage;
      changed = true;
    }
    const clearReceipt = `${runId}:story-clear-${story.storyStage}`;
    if (!account.receipts.includes(clearReceipt)) {
      storyClearPay = storyClearReward(firstClear);
      account.fractalis += storyClearPay.fractalis;
      account.lycalis += storyClearPay.lycalis;
      account.receipts.push(clearReceipt);
      storyCompletion = result.events.filter((event2) => event2.kind === "reward").at(-1) ?? null;
      changed = true;
    }
  }
  if (!story && !war && result.state.phase === "cleared" && result.state.enemies.length === 1) {
    const boss = result.state.enemies[0];
    let normalActivity;
    if (boss.boss && boss.hp <= 0 && boss.creatureId && rewardedEnemies.has(boss.id) && account.receipts.includes(`${runId}:${boss.id}`)) {
      if (dungeon && !infusion && isPlayableDungeon(dungeon.element) && dungeon.stage === dungeonStageCount && result.state.wave === dungeon.stage && boss.id === `dungeon-${dungeon.element}-${dungeon.stage}-0` && boss.level === elementalEnemyLevel(dungeon.stage) && boss.element === dungeon.element && dungeonVariants(dungeon.element, dungeon.stage).some((variant) => variant.creatureId === boss.creatureId)) {
        normalActivity = dungeon.element;
      } else if (infusion && !dungeon && isInfusionMode(infusion.mode) && infusion.stage === infusionStageCount(infusion.mode) && result.state.wave === infusion.stage && boss.id === `infusion-${infusion.mode}-${infusion.stage}-0`) {
        const encounter2 = infusionEncounter(infusion.mode, infusion.stage, infusion.schedule ?? "legacy");
        if (boss.level === encounter2.level && boss.element === encounter2.enemy.element && boss.creatureId === `infusion:${infusion.mode}:${encounter2.tier}`) normalActivity = infusion.mode;
      }
    }
    if (normalActivity && account.normalFinalClears?.[normalActivity] !== true) {
      account.normalFinalClears = { ...account.normalFinalClears, [normalActivity]: true };
      changed = true;
    }
  }
  const saved = changed ? saveAccount(storage, account) : account;
  for (const { reward, bonus } of storyBonuses) {
    reward.amount += bonus.fractalis;
    reward.lycalis = bonus.lycalis;
    reward.storyBonus = bonus;
    reward.message += ` First regional clear: +${bonus.fractalis} Prismatica and +${bonus.lycalis} Null-Prismatica.`;
  }
  if (storyCompletion) {
    storyCompletion.amount = (storyCompletion.amount ?? 0) + storyClearPay.fractalis;
    if (storyClearPay.lycalis > 0) storyCompletion.lycalis = (storyCompletion.lycalis ?? 0) + storyClearPay.lycalis;
    storyCompletion.message += storyClearPay.lycalis > 0 ? ` First stage clear: +${storyClearPay.fractalis} Prismatica and +${storyClearPay.lycalis} Null-Prismatica.` : ` Stage clear: +${storyClearPay.fractalis} Prismatica.`;
  }
  for (const { reward, character, outcome } of recruitments) {
    reward.recruitmentOutcome = outcome;
    reward.message += outcome === "new" ? ` ${getStarter(character).name} recruited at Lv.0 \xB7 Evo.1.` : " Already-owned recruitment converted to 100 Null-Prismatica.";
  }
  return saved;
}
function unlockedWarStage(account, character) {
  if (!isWarCharacter(character)) throw new Error("Unknown Elemental War challenger.");
  return account.warStages?.[character] ?? 1;
}
function unlockedStoryStage(account) {
  return Math.min(storyRules.stages, (account.storyCompleted ?? 0) + 1);
}
function unlockedStage(account, dungeon) {
  if (!playableDungeons.includes(dungeon)) throw new Error("Dungeon is not playable.");
  return account.dungeonStages[dungeon] ?? 1;
}
function levelCapturedCharacter(storage, id, expectedLevel) {
  if (!loadProfile(storage)) throw new Error("Choose your first Element-Bearer before leveling.");
  const account = loadAccount(storage);
  const copy = account.capturedCharacters?.find((entry) => entry.instanceId === id);
  if (!copy) throw new Error("Choose an owned captured Elemental-Devourer.");
  const progress = capturedProgress(copy);
  if (progress.level !== expectedLevel) throw new Error("Captured Elemental-Devourer level changed. Reopen this screen.");
  const cost = capturedLevelCost(copy);
  if (account.fractalis < cost.fractalis) throw new Error("Not enough Prismatica.");
  for (const [material, amount] of Object.entries(cost.materials)) if ((account.materials[material] ?? 0) < amount) throw new Error(`Not enough ${materialName(material)}.`);
  account.fractalis -= cost.fractalis;
  for (const [material, amount] of Object.entries(cost.materials)) account.materials[material] -= amount;
  copy.level = progress.level + 1;
  copy.capturedStage = progress.stage;
  copy.skills = structuredClone(progress.skills);
  return saveAccount(storage, account);
}
function maxLevelPlan(account, id) {
  if (!ownedCharacterInstances(account).includes(id)) throw new Error("Choose an owned character.");
  const starter = isStarterId(id) ? getStarter(id) : null;
  const copy = account.capturedCharacters?.find((entry) => entry.instanceId === id);
  const current = starter ? ownedProgress(account, starter.id) : copy ? capturedProgress(copy) : null;
  if (!current) throw new Error("Character progress is missing.");
  const cap = starter ? characterLevelCap(ownedProgress(account, starter.id).evolution) : capturedLevelCap;
  const cost = { fractalis: 0, materials: {} };
  let targetLevel = current.level;
  while (targetLevel < cap) {
    const nextCost = starter ? characterLevelCost(starter.id, { ...ownedProgress(account, starter.id), level: targetLevel }) : copy ? capturedLevelCost({ ...copy, level: targetLevel }) : null;
    if (!nextCost) throw new Error("Character level cost is missing.");
    if (cost.fractalis + nextCost.fractalis > account.fractalis || Object.entries(nextCost.materials).some(([material, amount]) => (cost.materials[material] ?? 0) + amount > (account.materials[material] ?? 0))) break;
    cost.fractalis += nextCost.fractalis;
    for (const [material, amount] of Object.entries(nextCost.materials)) {
      cost.materials[material] = (cost.materials[material] ?? 0) + amount;
    }
    targetLevel++;
  }
  return {
    id,
    currentLevel: current.level,
    targetLevel,
    cap,
    cost,
    progressKey: JSON.stringify([starter ? ownedProgress(account, starter.id) : copy, account.conduitEquipment?.[id], account.conduitUpgrades])
  };
}
function levelCharacterToMaximum(storage, expected) {
  if (!loadProfile(storage)) throw new Error("Choose a starter before leveling.");
  const account = loadAccount(storage);
  const plan = maxLevelPlan(account, expected.id);
  if (JSON.stringify(plan) !== JSON.stringify(expected)) throw new Error("Progress or available resources changed. Reopen Max Level.");
  if (plan.targetLevel === plan.currentLevel) throw new Error("No additional levels are affordable within the current cap.");
  account.fractalis -= plan.cost.fractalis;
  for (const [material, amount] of Object.entries(plan.cost.materials)) account.materials[material] -= amount;
  if (isStarterId(plan.id)) {
    account.characters[plan.id] = { ...ownedProgress(account, plan.id), level: plan.targetLevel };
  } else {
    const copy = account.capturedCharacters?.find((entry) => entry.instanceId === plan.id);
    if (!copy) throw new Error("Captured Elemental-Devourer is no longer owned.");
    const progress = capturedProgress(copy);
    copy.level = plan.targetLevel;
    copy.capturedStage = progress.stage;
    copy.skills = structuredClone(progress.skills);
  }
  return saveAccount(storage, account);
}
function unlockedInfusionStage(account, mode) {
  if (!isInfusionMode(mode)) throw new Error("Unknown infusion mode.");
  return account.infusionStages[mode] ?? 1;
}

// src/game/friend-profile.ts
function redactFriendAccount(value2) {
  const source = validateAccount(value2);
  const account = emptyAccount();
  account.characters = source.characters;
  if (source.capturedCharacters) account.capturedCharacters = source.capturedCharacters;
  if (source.squad) account.squad = source.squad;
  if (source.conduits) account.conduits = source.conduits;
  if (source.bannerPity) account.bannerPity = source.bannerPity;
  if (source.storyCompleted !== void 0) account.storyCompleted = source.storyCompleted;
  account.creatures = source.creatures;
  return validateAccount(account);
}

// src/content/profile-pictures.ts
var profilePictures = starters.flatMap((character) => ["base", "omnic"].map((form) => ({
  id: `profile:${character.id}:${form}`,
  characterId: character.id,
  form,
  evolution: form === "base" ? 1 : 6,
  name: characterName(character.id, form === "base" ? 1 : 6),
  requirement: form === "base" ? `Own ${character.name}.` : `Reach Omnic with ${character.name}.`,
  element: character.element
})));
function isProfilePictureId(value2) {
  return typeof value2 === "string" && profilePictures.some((picture) => picture.id === value2);
}
function profilePictureUnlocked(account, id) {
  const picture = profilePictures.find((entry) => entry.id === id);
  return !!picture && ownedCharacters(account).includes(picture.characterId) && (picture.form === "base" || ownedProgress(account, picture.characterId).evolution === 6);
}

// src/game/activity-access.ts
function highestBearerLevel(account) {
  let highest = 0;
  for (const { id } of starters) {
    const progress = account.characters[id];
    if (!progress) continue;
    characterGrowthFactor(progress);
    highest = Math.max(highest, progress.level);
  }
  return highest;
}
function activityAccess(account, activity) {
  if (activity.kind === "calamity") {
    const valid = isCalamityActivityId(activity.activity) && isCalamityTier(activity.tier);
    const highestTier = valid ? calamityUnlockedTier(account, activity.activity) : 0;
    const unlocked = valid && activity.tier <= highestTier;
    const requirement2 = highestTier === 0 ? "Defeat this activity's final boss on Normal" : `Clear Calamity EX+${activity.tier - 1}`;
    return { unlocked, minimumLevel: 0, level: highestBearerLevel(account), requirement: requirement2 };
  }
  const minimumLevel = activity.kind === "dungeon" ? 30 : activity.kind === "war" ? 85 : activity.kind !== "infusion" ? 0 : activity.mode === "machines" ? 10 : activity.mode === "treasury" || activity.mode === "sanctuary" ? 60 : activity.mode === "roses" ? 75 : 50;
  const firstRegion = activity.kind === "infusion" && activity.mode === "machines";
  const level = highestBearerLevel(account);
  const regionCleared = !firstRegion || (account.storyCompleted ?? 0) >= storyRules.regionStages;
  const requirement = `Element-Bearer Lv.${minimumLevel}${firstRegion ? " \xB7 Clear Emberwake March" : ""}`;
  return { unlocked: level >= minimumLevel && regionCleared, minimumLevel, level, requirement };
}
function assertActivityAccess(account, activity) {
  const access = activityAccess(account, activity);
  if (!access.unlocked) throw new Error(`Activity locked. Requires ${access.requirement}. Your highest Element-Bearer is Lv.${access.level}.`);
}

// src/game/save-file.ts
var SAVE_FILE_LIMIT = 4 * 1024 * 1024;
function validateSaveFile(value2) {
  if (!value2 || typeof value2 !== "object" || !("format" in value2) || value2.format !== "last-light-save" || !("version" in value2) || value2.version !== 1 || !("profile" in value2) || !("account" in value2)) {
    throw new Error("Choose a supported Last Light save file.");
  }
  const profile = loadProfile({ getItem: () => JSON.stringify(value2.profile), setItem() {
  }, removeItem() {
  } });
  if (!profile) throw new Error("The save file is missing its starter.");
  const account = validateAccount(value2.account);
  if (!account.characters[profile.starterId] || !account.squad?.length) throw new Error("The save file is missing its owned starter or squad.");
  return { format: "last-light-save", version: 1, profile, account };
}

// src/presentation/conduit-compatibility.ts
var conduitRestartNotice = "Combat rules updated, including exponential enemy growth. This encounter restarted at the current stage with your original squad and equipment. All previously saved rewards are kept.";
function atTrainingWave(state, wave) {
  if (wave <= 1) return state;
  const spawned = nextWave({ ...structuredClone(state), wave: wave - 1, phase: "cleared" });
  state.wave = wave;
  state.enemies = spawned.state.enemies;
  return state;
}

// supabase/functions/game-operation/engine.ts
var chatMessageLength = 500;
var chatGroupNameLength = 48;
var chatGroupMembers = 10;
function isProfileIcon(value2) {
  return value2 === "neutral" || isStarterId(value2) || isProfilePictureId(value2);
}
function profileIconUnlocked(account, icon) {
  if (icon === "neutral") return true;
  return isStarterId(icon) ? ownedCharacters(account).includes(icon) : profilePictureUnlocked(account, icon);
}
function profileActivityFor(operation, previousStoryCompleted, resolved, uuid2) {
  if (operation.kind === "bootstrap") return {
    id: uuid2(),
    message: "Starter selected",
    detail: `${operation.starterId} Element-Bearer`
  };
  if (operation.kind === "importSave") return {
    id: uuid2(),
    message: "Save imported",
    detail: "Existing save moved online"
  };
  if (operation.kind === "summon" || operation.kind === "summonTen") return {
    id: uuid2(),
    message: "Summoned",
    detail: `${operation.bannerId === "roses" ? "Crimson Roses" : "Standard"} \xB7 ${operation.kind === "summonTen" ? 10 : 1} draw${operation.kind === "summonTen" ? "s" : ""}`
  };
  if (operation.kind === "purchaseConduit") return {
    id: uuid2(),
    message: "Conduit purchased",
    detail: getConduit(operation.id).name
  };
  if (resolved.response.result?.state.phase === "cleared" && resolved.game.run?.activity.kind === "story") {
    const stage = resolved.game.run.activity.stage;
    const completed = resolved.game.account.storyCompleted ?? 0;
    const restoredBeacon = Math.floor(completed / storyRules.regionStages) > Math.floor(previousStoryCompleted / storyRules.regionStages);
    return {
      id: uuid2(),
      message: "Story stage cleared",
      detail: `${restoredBeacon ? "Beacon restored \xB7 " : ""}Story \xB7 Stage ${stage}`
    };
  }
  return null;
}
var frames = ["default", "thin-outline", "double-outline", "corner-brackets"];
function freshGame(username, createdAt = (/* @__PURE__ */ new Date()).toISOString()) {
  return { account: emptyAccount(), starterId: null, run: null, profile: {
    username,
    displayName: username,
    bio: "",
    icon: "neutral",
    frame: "default",
    ownedFrames: ["default"],
    createdAt,
    totalDraws: 0,
    statistics: { storyCompleted: 0, ownedBearers: 0, capturedCreatures: 0, discoveredCreatures: 0 }
  } };
}
function record2(value2) {
  return !!value2 && typeof value2 === "object" && !Array.isArray(value2);
}
function keys(value2, allowed) {
  if (Object.keys(value2).some((key) => !allowed.includes(key))) throw new Error("Unexpected request field.");
}
function text(value2, maximum = 100) {
  if (typeof value2 !== "string" || !value2.length || value2.length > maximum) throw new Error("Invalid text input.");
}
function integer(value2) {
  if (!Number.isSafeInteger(value2) || value2 < 0) throw new Error("Invalid integer input.");
}
var operationKeys = {
  friendRequest: ["username", "friendCode"],
  acceptFriendRequest: ["userId"],
  declineFriendRequest: ["userId"],
  cancelFriendRequest: ["userId"],
  removeFriend: ["userId"],
  read: [],
  checkpoint: [],
  bootstrap: ["starterId"],
  importSave: ["save"],
  setSquad: ["ids"],
  setCharacterLock: ["id", "locked"],
  summon: ["bannerId"],
  summonTen: ["bannerId"],
  sellCurrencyCreature: ["id", "saleOption"],
  purchaseConduit: ["id"],
  equipConduit: ["character", "slot", "conduit"],
  upgradeConduit: ["id", "expectedLevel"],
  maxConduit: ["expected"],
  unequipAllConduits: ["character"],
  openMasterChest: ["id"],
  equipMasterConduit: ["character", "conduit"],
  openCalamityChest: ["id", "expectedCount"],
  upgradeCharacter: ["id", "upgradeKind", "expected", "fodderIds"],
  levelCaptured: ["id", "expectedLevel"],
  levelMax: ["id", "expected"],
  purchaseMaterial: ["element", "quantity"],
  purchaseFrame: ["frame"],
  updateProfile: ["displayName", "bio", "icon", "frame"],
  enter: ["activity"],
  act: ["runId", "actorId", "action", "targetId"],
  endTurn: ["runId"],
  continue: ["runId"],
  retry: ["runId"],
  quit: ["runId"]
};
function validateRequest(value2) {
  if (!record2(value2)) throw new Error("Request must be an object.");
  keys(value2, ["requestId", "expectedRevision", "operation"]);
  if (typeof value2.requestId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value2.requestId)) {
    throw new Error("A UUID request ID is required.");
  }
  integer(value2.expectedRevision);
  if (!record2(value2.operation) || typeof value2.operation.kind !== "string" || !Object.hasOwn(operationKeys, value2.operation.kind)) throw new Error("Unknown game operation.");
  const op = value2.operation;
  if (op.kind === "importSave") validateSaveFile(op.save);
  keys(op, ["kind", ...operationKeys[op.kind]]);
  if (operationKeys[op.kind].some((key) => key !== "fodderIds" && key !== "saleOption" && !(op.kind === "friendRequest" && (key === "username" || key === "friendCode")) && !(key in op))) throw new Error("Missing operation field.");
  for (const field of ["id", "character", "runId", "actorId", "targetId", "bannerId", "starterId", "element", "frame", "upgradeKind", "action", "saleOption"]) {
    if (field in op) text(op[field]);
  }
  for (const field of ["slot", "expectedLevel", "quantity", "expectedCount"]) if (field in op) integer(op[field]);
  if (op.kind === "openCalamityChest") {
    parseCalamityChestId(op.id);
    if (op.expectedCount < 1) throw new Error("Choose an owned Calamity chest.");
  }
  if ("locked" in op && typeof op.locked !== "boolean") throw new Error("Invalid lock.");
  for (const field of ["ids", "fodderIds"]) if (field in op) {
    if (!Array.isArray(op[field]) || op[field].length > 3 || !op[field].every((id) => typeof id === "string" && id.length > 0 && id.length <= 100)) throw new Error("Invalid character IDs.");
  }
  if (op.kind === "upgradeCharacter") {
    if (!record2(op.expected)) throw new Error("Invalid expected progress.");
    keys(op.expected, ["level", "evolution", "weaponRank"]);
    integer(op.expected.level);
    integer(op.expected.evolution);
    if ("weaponRank" in op.expected) integer(op.expected.weaponRank);
  }
  if (op.kind === "maxConduit") {
    if (!record2(op.expected)) throw new Error("Invalid Conduit Max Level preview.");
    keys(op.expected, ["id", "currentLevel", "targetLevel", "cost"]);
    text(op.expected.id);
    for (const field of ["currentLevel", "targetLevel", "cost"]) integer(op.expected[field]);
  }
  if (op.kind === "levelMax") {
    if (!record2(op.expected) || op.expected.id !== op.id) throw new Error("Invalid Max Level preview.");
    keys(op.expected, ["id", "currentLevel", "targetLevel", "cap", "cost", "progressKey"]);
    for (const field of ["currentLevel", "targetLevel", "cap"]) integer(op.expected[field]);
    text(op.expected.progressKey, 8192);
    if (!record2(op.expected.cost) || !record2(op.expected.cost.materials)) throw new Error("Invalid Max Level cost.");
    keys(op.expected.cost, ["fractalis", "materials"]);
    integer(op.expected.cost.fractalis);
    for (const amount of Object.values(op.expected.cost.materials)) integer(amount);
  }
  if (op.kind === "enter") {
    if (!record2(op.activity) || !["training", "story", "dungeon", "infusion", "war", "calamity"].includes(String(op.activity.kind))) throw new Error("Invalid activity.");
    if (op.activity.kind === "calamity") {
      keys(op.activity, ["kind", "activity", "tier"]);
      if (!isCalamityActivityId(op.activity.activity) || !isCalamityTier(op.activity.tier)) throw new Error("Invalid Calamity activity or tier.");
    } else {
      keys(op.activity, op.activity.kind === "training" ? ["kind"] : op.activity.kind === "story" ? ["kind", "stage"] : ["kind", "stage", op.activity.kind === "dungeon" ? "element" : op.activity.kind === "infusion" ? "mode" : "character"]);
      if (op.activity.kind !== "training") integer(op.activity.stage);
    }
  }
  if (op.kind === "updateProfile") {
    if (typeof op.displayName !== "string" || !op.displayName.trim().length || [...op.displayName].length > 16 || typeof op.bio !== "string" || [...op.bio].length > 120 || /[\u0000-\u001f\u007f]/.test(op.displayName + op.bio) || !isProfileIcon(op.icon)) throw new Error("Invalid profile fields.");
  }
  if (op.kind === "friendRequest") {
    const hasUsername = typeof op.username === "string";
    const hasCode = typeof op.friendCode === "string";
    if (hasUsername === hasCode || hasUsername && !/^[a-z0-9_]{3,16}$/i.test(op.username) || hasCode && !/^LL-[0-9A-F]{4}-[0-9A-F]{4}$/i.test(op.friendCode)) {
      throw new Error("Enter a valid friend username or friend code.");
    }
  }
  if ("userId" in op && (typeof op.userId !== "string" || !/^[0-9a-f-]{36}$/i.test(op.userId))) throw new Error("Invalid friend user ID.");
  return value2;
}
var chatKeys = {
  read: { required: [], optional: ["conversationId", "before"] },
  direct: { required: ["userId"] },
  createGroup: { required: ["name", "userIds"] },
  send: { required: ["conversationId", "text"] },
  invite: { required: ["conversationId", "userId"] },
  respondInvite: { required: ["conversationId", "accept"] },
  removeMember: { required: ["conversationId", "userId"] },
  leave: { required: ["conversationId"] },
  preferences: { required: ["conversationId"], optional: ["pinned", "muted"] },
  block: { required: ["userId"] },
  unblock: { required: ["userId"] }
};
var uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
var chatControl = /[\u0000-\u0008\u000b-\u001f\u007f]/;
function validateChatRequest(value2) {
  if (!record2(value2)) throw new Error("Request must be an object.");
  keys(value2, ["requestId", "chat"]);
  if (typeof value2.requestId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value2.requestId)) {
    throw new Error("A UUID request ID is required.");
  }
  const op = value2.chat;
  if (!record2(op) || typeof op.kind !== "string" || !Object.hasOwn(chatKeys, op.kind)) throw new Error("Unknown chat operation.");
  const shape = chatKeys[op.kind];
  keys(op, ["kind", ...shape.required, ...shape.optional ?? []]);
  if (shape.required.some((key) => !(key in op))) throw new Error("Missing chat field.");
  for (const key of ["conversationId", "before", "userId"]) {
    if (key in op && (typeof op[key] !== "string" || !uuid.test(op[key]))) throw new Error("Invalid chat identifier.");
  }
  for (const key of ["accept", "pinned", "muted"]) if (key in op && typeof op[key] !== "boolean") throw new Error("Invalid chat option.");
  if ("before" in op && !("conversationId" in op)) throw new Error("Choose a conversation to page.");
  if (op.kind === "preferences" && !("pinned" in op) && !("muted" in op)) throw new Error("Choose a chat preference.");
  if ("text" in op) {
    const body = typeof op.text === "string" ? op.text.trim() : "";
    if (!body || [...body].length > chatMessageLength || chatControl.test(body.replace(/\r\n/g, "\n"))) {
      throw new Error(`Messages must be 1-${chatMessageLength} characters of plain text.`);
    }
  }
  if ("name" in op) {
    const name = typeof op.name === "string" ? op.name.trim() : "";
    if (!name || [...name].length > chatGroupNameLength || /[\u0000-\u001f\u007f]/.test(name)) throw new Error("Invalid group name.");
  }
  if ("userIds" in op && (!Array.isArray(op.userIds) || op.userIds.length > chatGroupMembers - 1 || !op.userIds.every((id) => typeof id === "string" && uuid.test(id)) || new Set(op.userIds.map((id) => id.toLowerCase())).size !== op.userIds.length)) {
    throw new Error(`Invite up to ${chatGroupMembers - 1} distinct friends.`);
  }
  return value2;
}
function validateFriendProfileRequest(value2) {
  if (!record2(value2)) throw new Error("Request must be an object.");
  keys(value2, ["requestId", "friendProfile"]);
  if (typeof value2.requestId !== "string" || !uuid.test(value2.requestId)) throw new Error("A UUID request ID is required.");
  if (!record2(value2.friendProfile)) throw new Error("Choose a friend.");
  keys(value2.friendProfile, ["userId"]);
  if (typeof value2.friendProfile.userId !== "string" || !uuid.test(value2.friendProfile.userId)) throw new Error("Invalid friend user ID.");
  return value2;
}
function friendProfileView(row) {
  if (!record2(row) || typeof row.userId !== "string" || typeof row.username !== "string" || typeof row.createdAt !== "string") {
    throw new Error("Friend profile unavailable.");
  }
  const stored = record2(row.state) ? row.state : freshGame(row.username, row.createdAt);
  const account = redactFriendAccount(stored.account);
  const source = record2(stored.profile) ? stored.profile : freshGame(row.username, row.createdAt).profile;
  const reference = record2(row.reference) ? row.reference : {};
  const icon = isProfileIcon(source.icon) && profileIconUnlocked(account, source.icon) ? source.icon : "neutral";
  const recent = Array.isArray(reference.recentActivity) ? reference.recentActivity.filter((entry) => record2(entry) && typeof entry.id === "string" && typeof entry.message === "string" && typeof entry.detail === "string" && typeof entry.at === "string") : [];
  return {
    userId: row.userId,
    account,
    profile: {
      username: row.username,
      createdAt: row.createdAt,
      displayName: typeof source.displayName === "string" && source.displayName ? source.displayName : row.username,
      bio: typeof source.bio === "string" ? source.bio : "",
      icon,
      frame: typeof source.frame === "string" && frames.includes(source.frame) ? source.frame : "default",
      totalDraws: Number.isSafeInteger(source.totalDraws) ? source.totalDraws : 0,
      ...typeof reference.friendCode === "string" ? { friendCode: reference.friendCode } : {},
      ...typeof reference.playerId === "string" ? { playerId: reference.playerId } : {},
      ...Number.isSafeInteger(reference.daysPlayed) ? { daysPlayed: reference.daysPlayed } : {},
      ...Number.isSafeInteger(reference.playTimeSeconds) ? { playTimeSeconds: reference.playTimeSeconds } : {},
      recentActivity: recent
    }
  };
}
var VirtualStorage = class {
  items = /* @__PURE__ */ new Map();
  constructor(game) {
    this.items.set(ACCOUNT_KEY, JSON.stringify(game.account));
    if (game.starterId) this.items.set(SAVE_KEY, JSON.stringify({ version: 1, starterId: game.starterId }));
  }
  getItem(key) {
    return this.items.get(key) ?? null;
  }
  setItem(key, value2) {
    this.items.set(key, value2);
  }
  removeItem(key) {
    this.items.delete(key);
  }
};
function isLegacyStoryRun(game) {
  const version = game.account.version;
  return typeof version === "number" && version < 8 && !!game.run;
}
function storyCompletedOf(game) {
  return validateAccount(game.account).storyCompleted ?? 0;
}
function publicGame(stored, revision) {
  const game = isLegacyStoryRun(stored) ? { ...stored, run: null } : stored;
  const account = validateAccount(game.account);
  if (game.run) validateRunActivity(game.run);
  const session = game.run ? structuredClone(game.run.session) : null;
  if (session) capCapturedBattleLevels(session.state);
  const profile = { ...game.profile, statistics: {
    storyCompleted: account.storyCompleted ?? 0,
    ownedBearers: ownedCharacters(account).length,
    capturedCreatures: account.capturedCharacters?.length ?? 0,
    discoveredCreatures: Object.keys(account.creatures).length
  } };
  return {
    revision,
    account: structuredClone(account),
    starterId: game.starterId,
    profile,
    session,
    social: { friends: [], incoming: [], outgoing: [] }
  };
}
function validateRunActivity(run) {
  validateRequest({
    requestId: "00000000-0000-4000-8000-000000000001",
    expectedRevision: 0,
    operation: { kind: "enter", activity: run.activity }
  });
  const calamity = run.session.state.calamity;
  if (run.activity.kind === "calamity") {
    if (!record2(calamity) || !isCalamityActivityId(calamity.activity) || !isCalamityTier(calamity.tier) || calamity.activity !== run.activity.activity || calamity.tier !== run.activity.tier) throw new Error("Unsupported saved Calamity encounter.");
  } else if (calamity !== void 0) throw new Error("Unsupported saved Calamity encounter.");
}
function gate(account, activity, entering = true) {
  if (entering) assertActivityAccess(account, activity);
  if (activity.kind === "calamity") {
    assertActivityAccess(account, activity);
    return;
  }
  if (activity.kind === "training") return;
  if (!Number.isInteger(activity.stage) || activity.stage < 1) throw new Error("Invalid stage.");
  const maximum = activity.kind === "story" ? unlockedStoryStage(account) : activity.kind === "dungeon" && isPlayableDungeon(activity.element) ? unlockedStage(account, activity.element) : activity.kind === "infusion" && isInfusionMode(activity.mode) ? unlockedInfusionStage(account, activity.mode) : activity.kind === "war" && isWarCharacter(activity.character) ? unlockedWarStage(account, activity.character) : 0;
  if (activity.stage > maximum) throw new Error("Activity stage is locked or unavailable.");
}
function encounter(game, run, seed2, trainingWave = 1) {
  const s = run.session;
  if (!game.starterId) throw new Error("Choose a starter first.");
  const teamProgress = s.teamProgress ?? { [game.starterId]: s.progress };
  const masters = run.masters ?? Object.fromEntries((s.state?.allies ?? []).filter((unit) => unit.masterConduit).map((unit) => [unit.definitionId, unit.masterConduit]));
  const args = [seed2, game.starterId, s.progress, run.roster, teamProgress, run.equipment, run.captures, run.upgrades];
  const a = run.activity;
  const state = withMasterLoadouts(a.kind === "training" ? atTrainingWave(createBattle(seed2, run.roster, teamProgress, run.equipment, run.captures, run.upgrades), trainingWave) : a.kind === "calamity" ? createCalamityBattle(a.activity, a.tier, ...args) : a.kind === "story" ? createStoryBattle(a.stage, ...args) : a.kind === "dungeon" ? createDungeonBattle(a.element, a.stage, ...args) : a.kind === "infusion" ? createInfusionBattle(a.mode, a.stage, ...args, s.state ? s.state.infusion?.schedule ?? "legacy" : "caps") : createWarBattle(a.character, a.stage, ...args), masters);
  if (state.infusion?.mode === "machines") state.machineConduits = { ...game.account.conduits };
  return state;
}
function resolveOperation(previous, operation, entropy) {
  validateRequest({ requestId: "00000000-0000-4000-8000-000000000001", expectedRevision: 0, operation });
  const game = structuredClone(previous);
  if (isLegacyStoryRun(game)) game.run = null;
  game.account = validateAccount(game.account);
  if (game.run) {
    validateRunActivity(game.run);
    game.run.captures = validateCapturedCharacters(game.run.captures);
    capCapturedBattleLevels(game.run.session.state);
  }
  if (game.run && game.run.session.state.conduitRulesVersion !== conduitRulesVersion) {
    const run = game.run;
    if ("runId" in operation && operation.runId !== run.session.runId) throw new Error("This battle run is no longer active.");
    if (operation.kind !== "quit") {
      const wave = run.session.state.wave;
      run.session.state = encounter(game, run, entropy.seed(), wave);
      run.session.runId = entropy.uuid();
      run.session.stageEvents = [];
      run.session.entrancePending = true;
      run.session.resultsVisible = false;
      run.session.log = [...run.session.log, conduitRestartNotice].slice(-100);
      if (operation.kind === "act" || operation.kind === "endTurn" || operation.kind === "continue" || operation.kind === "retry") {
        return { game, response: publicGame(game, 0) };
      }
    }
  }
  const storage = new VirtualStorage(game);
  let result;
  let summon;
  let summons;
  let calamityOpening;
  if (operation.kind === "read" || operation.kind === "checkpoint") return { game, response: publicGame(game, 0) };
  if (operation.kind === "bootstrap") {
    if (game.starterId || Object.keys(game.account.characters).length) throw new Error("Starter has already been selected.");
    if (!["ember", "tide", "sprout"].includes(operation.starterId)) throw new Error("Invalid initial starter.");
    game.starterId = operation.starterId;
    game.account.characters[operation.starterId] = { level: 0, evolution: 1, weaponRank: 0 };
    game.account.squad = [operation.starterId];
  } else if (operation.kind === "importSave") {
    if (game.starterId || game.run || Object.keys(game.account.characters).length) throw new Error("Save files can only be imported into a new, unstarted online account.");
    const save = validateSaveFile(operation.save);
    game.account = save.account;
    game.starterId = save.profile.starterId;
  } else if (["friendRequest", "acceptFriendRequest", "declineFriendRequest", "cancelFriendRequest", "removeFriend"].includes(operation.kind)) {
  } else {
    if (!game.starterId) throw new Error("Choose your first Element-Bearer before playing.");
    switch (operation.kind) {
      case "setSquad":
        setSquad(storage, operation.ids);
        break;
      case "setCharacterLock":
        setCharacterLock(storage, operation.id, operation.locked);
        break;
      case "summon":
        summon = summonCharacter(storage, entropy.random, operation.bannerId);
        game.profile.totalDraws++;
        if (!Number.isSafeInteger(game.profile.totalDraws)) throw new Error("Draw count overflow.");
        break;
      case "summonTen":
        summons = summonCharacters(storage, entropy.random, operation.bannerId, multiSummonCount).draws;
        game.profile.totalDraws += multiSummonCount;
        if (!Number.isSafeInteger(game.profile.totalDraws)) throw new Error("Draw count overflow.");
        break;
      case "sellCurrencyCreature":
        sellCurrencyCreature(storage, operation.id, operation.saleOption);
        break;
      case "purchaseConduit":
        purchaseConduit(storage, operation.id);
        break;
      case "equipConduit":
        equipConduit(storage, operation.character, operation.slot, operation.conduit);
        break;
      case "unequipAllConduits":
        unequipAllConduits(storage, operation.character);
        break;
      case "openMasterChest":
        openMasterChest(storage, operation.id);
        break;
      case "openCalamityChest": {
        const reward = openCalamityChest(storage, operation.id, operation.expectedCount).reward;
        calamityOpening = {
          id: reward.id,
          name: reward.name,
          fractalis: reward.fractalis,
          lycalis: reward.lycalis,
          materials: reward.materials,
          conduits: reward.conduits,
          mechanicalComponents: reward.mechanicalComponents,
          calamiticTokens: reward.calamiticTokens,
          masterChests: reward.masterChests
        };
        break;
      }
      case "equipMasterConduit":
        equipMasterConduit(storage, operation.character, operation.conduit);
        break;
      case "upgradeConduit":
        upgradeConduit(storage, operation.id, operation.expectedLevel);
        break;
      case "maxConduit":
        upgradeConduitToMaximum(storage, operation.expected);
        break;
      case "upgradeCharacter":
        if (!isStarterId(operation.id) || !ownedCharacters(game.account).includes(operation.id)) throw new Error("Choose an owned Element-Bearer.");
        upgradeCharacter(storage, operation.id, operation.upgradeKind, operation.expected, operation.fodderIds);
        break;
      case "levelCaptured":
        levelCapturedCharacter(storage, operation.id, operation.expectedLevel);
        break;
      case "levelMax":
        levelCharacterToMaximum(storage, operation.expected);
        break;
      case "purchaseMaterial":
        purchaseExchangeMaterial(storage, operation.element, operation.quantity);
        break;
      case "purchaseFrame": {
        if (!frames.includes(operation.frame)) throw new Error("Unknown profile frame.");
        if (game.profile.ownedFrames.includes(operation.frame)) throw new Error("This profile frame is already owned.");
        const account = loadAccount(storage);
        if (account.lycalis < 10) throw new Error("Not enough Null-Prismatica.");
        account.lycalis -= 10;
        saveAccount(storage, account);
        game.profile.ownedFrames.push(operation.frame);
        break;
      }
      case "updateProfile":
        if (!game.profile.ownedFrames.includes(operation.frame)) throw new Error("Choose an owned frame.");
        if (!profileIconUnlocked(game.account, operation.icon)) throw new Error("Choose an owned, unlocked profile picture.");
        Object.assign(game.profile, { displayName: operation.displayName.trim(), bio: operation.bio, icon: operation.icon, frame: operation.frame });
        break;
      case "enter": {
        if (game.run) throw new Error("Quit the current run before entering another activity.");
        gate(game.account, operation.activity);
        const roster = equippedSquad(game.account);
        const teamProgress = structuredClone(game.account.characters);
        const run = {
          activity: structuredClone(operation.activity),
          roster,
          equipment: structuredClone(game.account.conduitEquipment ?? {}),
          captures: structuredClone(game.account.capturedCharacters ?? []),
          upgrades: structuredClone(game.account.conduitUpgrades ?? {}),
          masters: structuredClone(game.account.masterEquipment ?? {}),
          session: {
            state: null,
            runId: entropy.uuid(),
            progress: ownedProgress(game.account, game.starterId),
            teamProgress,
            log: ["Authoritative encounter ready."],
            stageEvents: [],
            entrancePending: true
          }
        };
        run.session.state = encounter(game, run, entropy.seed());
        game.run = run;
        result = advanceUnavailableTurns(run.session.state);
        break;
      }
      case "act":
      case "endTurn":
      case "continue":
      case "retry":
      case "quit": {
        const run = game.run;
        if (!run || run.session.runId !== operation.runId) throw new Error("This battle run is no longer active.");
        const state = run.session.state;
        if (operation.kind === "quit") {
          game.run = null;
          break;
        }
        if (state.infusion?.mode === "machines") state.machineConduits = { ...game.account.conduits };
        if (operation.kind === "act") {
          if (!isActionId(operation.action)) throw new Error("Invalid battle action.");
          const actor = state.allies.find((a) => a.id === operation.actorId);
          if (!actor || actionUnavailable(state, actor, operation.action)) throw new Error("The selected squad member cannot use that action.");
          const targets = [...state.allies, ...state.enemies];
          if (!targets.some((t) => t.id === operation.targetId && t.hp > 0)) throw new Error("Invalid battle target.");
          result = actAndAdvanceTurn(state, operation.actorId, operation.action, operation.targetId);
        } else if (operation.kind === "endTurn") {
          if (state.phase !== "player") throw new Error("Battle is not in the player phase.");
          const first = endTurn(state);
          const advanced = advanceUnavailableTurns(first.state);
          result = { state: advanced.state, events: [...first.events, ...advanced.events] };
        } else if (operation.kind === "continue") {
          if (state.calamity || run.activity.kind === "calamity") throw new Error("Calamity ends after one boss. Enter the next tier from Play.");
          if (state.phase !== "cleared") throw new Error("Clear the encounter before continuing.");
          result = state.dungeon || state.infusion || state.war || state.story ? nextStage(state, run.session.teamProgress) : nextWave(state);
          if (run.activity.kind !== "training") run.activity.stage++;
          gate(game.account, run.activity, false);
          run.session.stageEvents = [];
          run.session.entrancePending = true;
        } else {
          if (state.phase !== "defeat" && run.activity.kind !== "calamity" && !(state.phase === "cleared" && run.activity.kind !== "training")) {
            throw new Error("Retry requires defeat or a cleared stage.");
          }
          run.session.runId = entropy.uuid();
          run.session.stageEvents = [];
          run.session.entrancePending = true;
          result = advanceUnavailableTurns(encounter(game, run, entropy.seed()));
        }
        break;
      }
    }
    if (result && game.run) {
      saveAccountRewards(storage, result, game.run.session.runId);
      game.run.session.state = result.state;
      game.run.session.stageEvents.push(...result.events);
      game.run.session.log = [...game.run.session.log, ...result.events.map((e) => e.message)].slice(-100);
      game.run.session.resultsVisible = result.state.phase !== "player";
    }
    game.account = loadAccount(storage);
  }
  game.account = validateAccount(game.account);
  if (!isProfileIcon(game.profile.icon) || !profileIconUnlocked(game.account, game.profile.icon)) game.profile.icon = "neutral";
  return { game, response: { ...publicGame(game, 0), ...result ? { result } : {}, ...summon ? { summon } : {}, ...summons ? { summons } : {}, ...calamityOpening ? { calamityOpening } : {} } };
}
export {
  conduitRulesVersion,
  frames,
  freshGame,
  friendProfileView,
  profileActivityFor,
  profileIconUnlocked,
  publicGame,
  resolveOperation,
  storyCompletedOf,
  validateChatRequest,
  validateFriendProfileRequest,
  validateRequest
};
