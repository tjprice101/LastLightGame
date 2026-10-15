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
var elementalMaterials = elements.flatMap((element) => materialRarities.map((rarity) => ({
  id: `${element.id}-${rarity.toLowerCase()}`,
  elementId: element.id,
  rarity,
  name: `${element.name} ${rarity} Material`
})));
var dungeonStageCount = 35;
var warStageCount = 10;
var elementalDungeonRules = { stages: dungeonStageCount, startingLevel: 38, maximumLevel: 120, maximumLevelStage: dungeonStageCount };
var infusionModes = [
  { id: "heavens", name: "Soar to Heaven", energy: "Light", enemyTheme: "Dawnthorn Slime evolution line", stages: dungeonStageCount, startingLevel: 50, enemyTiers: 6, uniqueEnemies: { minimum: 6, maximum: 6 } },
  { id: "abyss", name: "Delve into the Abyss", energy: "Chaotic", enemyTheme: "Wraththorn Slime evolution line", stages: dungeonStageCount, startingLevel: 50, enemyTiers: 6, uniqueEnemies: { minimum: 6, maximum: 6 } }
];
var currencyModes = [
  { id: "treasury", name: "Crownfall Treasury", stages: 25, startingLevel: 65, maximumLevel: 120, enemyTiers: 6 },
  { id: "sanctuary", name: "Rosethorn Sanctuary", stages: 25, startingLevel: 65, maximumLevel: 120, enemyTiers: 6 }
];
var eventModes = [
  { id: "roses", name: "Passion of Crimson Roses", stages: 35, startingLevel: 80, maximumLevel: 140, enemyTiers: 6 }
];
var machineModes = [
  { id: "machines", name: "Awaken the Machines", stages: 100, startingLevel: 10, maximumLevel: 120, enemyTiers: 6 }
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
    quantitiesDefined: true
  };
}

// src/content/final-boss-loot.ts
var finalBossLootMultiplier = 5;
var finalBossLootText = "Final bosses award 5x normal currency, material and component quantities on every clear, including replays. Rare-drop, capture and recruitment chances, Conduit and chest counts, recruitment duplicate conversions and one-time Story bonuses are unchanged. Training has no final boss.";
function bossLootMultiplier(activity, boss = true) {
  if (!boss) return 1;
  const final = activity.story ? activity.story.storyStage >= 25 && activity.story.storyStage <= 150 && activity.story.storyStage % 25 === 0 : activity.dungeon ? activity.dungeon.stage === dungeonStageCount : activity.infusion ? activity.infusion.stage === infusionStageCount(activity.infusion.mode) : activity.war ? activity.war.stage === warStageCount : false;
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
  const value = random();
  if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error("Loot roll must be in [0, 1).");
  return value;
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
var treasuryPrismaticaText = `Guaranteed per-kill Prismatica starts at ${range(treasuryFractalisDrop(65))} at Lv.65 and multiplies up to a base ${range(treasuryFractalisDrop(120))} at Lv.120. The stage 25 final boss awards ${range(bossLootRange(treasuryFractalisDrop(120), 5))} on every clear. Earlier stages keep their existing curve.`;

// src/content/kit-conduits.ts
function stats(first, second, third) {
  return [first, second, third].map((stat, index) => ({ stat, kind: "percent", amount: [60, 50, 40][index] }));
}
var kitConduitDesigns = [
  {
    id: "tempered-strike-link",
    name: "Phoenix Temper Dominion",
    rarity: "Omnic",
    price: null,
    theme: "infernic",
    element: "infernic",
    buffs: stats("damage", "defense", "health"),
    kitEffects: { rule: {
      trigger: "direct",
      actions: ["light"],
      bank: { trigger: "burn-tick", maximum: 3 },
      outcomes: [{ kind: "gauge", recipient: "self", amount: 2 }]
    } },
    effect: "+60% Attack, +50% Defense, +40% Health. Actual Burn damage from your abilities banks one Temper per round (max 3). An effective Normal Attack spends all Temper for 2 Gauge each, once per round.",
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
    buffs: stats("health", "elementalDamage", "defense"),
    kitEffects: { rule: {
      trigger: "defense",
      bank: { trigger: "heal", maximum: 3 },
      outcomes: [{ kind: "gauge", recipient: "injured", amount: 3 }]
    } },
    effect: "+60% Health, +50% Elemental Damage, +40% Defense. Effective healing from your abilities banks one Sap per round (max 3). Defense spends all Sap to grant the most injured living ally 3 Gauge each, once per round.",
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
    buffs: stats("defense", "health", "elementalDamage"),
    kitEffects: { rule: { trigger: "shield-absorbed", outcomes: [{ kind: "shield", recipient: "self", amount: 0, ratio: 0.25, cap: 0.03 }] } },
    effect: "+60% Defense, +50% Health, +40% Elemental Damage. Actual direct absorption by a shield from your abilities refreshes your own Conduit shield to 25% of absorbed damage, capped at 3% of your max HP, once per round.",
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
    buffs: stats("elementalDamage", "damage", "defense"),
    kitEffects: { rule: {
      trigger: "direct",
      actions: ["skill1", "skill2", "ultimate"],
      ownBurn: true,
      bank: { trigger: "burn-applied", maximum: 1 },
      outcomes: [{ kind: "burn-clock", amount: 1 }]
    } },
    effect: "+60% Elemental Damage, +50% Attack, +40% Defense. An effective Burn application from your abilities banks one Cinder relay per round (refresh only). A later damaging skill hitting your existing Burn spends it to extend that Burn by one phase, capped at 3 remaining phases, once per round; never adds Burn.",
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
    buffs: stats("damage", "critMultiplier", "defense"),
    kitEffects: { rule: {
      trigger: "defense",
      bank: { trigger: "critical", maximum: 1 },
      outcomes: [{ kind: "cooldown", recipient: "self", amount: 1 }]
    } },
    effect: "+60% Attack, +50% Critical Damage multiplier, +40% Defense. An effective critical direct activation banks one Sky tooth per round (refresh only). Defense spends it to shorten your longest available ordinary-skill cooldown by one, never before next round, once per round.",
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
    buffs: stats("damage", "health", "defense"),
    kitEffects: { rule: {
      trigger: "direct",
      actions: ["light"],
      bank: { trigger: "support", maximum: 1, other: true },
      outcomes: [{ kind: "cooldown", recipient: "injured-other", amount: 1 }]
    } },
    effect: "+60% Attack, +50% Health, +40% Defense. Effective support from your abilities to another ally banks one Concordance per round. Your next effective Normal Attack spends it to shorten the most injured other ally\u2019s longest available ordinary-skill cooldown by one, never before next round, once per round.",
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
    buffs: stats("damage", "elementalDamage", "defense"),
    kitEffects: { rule: {
      trigger: "direct",
      actions: ["light"],
      ownWeaken: true,
      bank: { trigger: "weaken-applied", maximum: 1 },
      outcomes: [{ kind: "fracture", amount: 1 }]
    } },
    effect: "+60% Attack, +50% Elemental Damage, +40% Defense. An effective Weaken application from your abilities banks one Rupture per round. A later effective Normal Attack on your Weakened target spends it to place one personal Fracture Mark after impact (max 2), once per round.",
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
    buffs: stats("elementalDamage", "health", "damage"),
    kitEffects: { rule: {
      trigger: "resource-spent",
      resources: ["ember"],
      outcomes: [{ kind: "shield", recipient: "injured", amount: 0, ratio: 0.04, cap: 0.12 }]
    } },
    effect: "+60% Elemental Damage, +50% Health, +40% Attack. Actually spending your Infernic Embers refreshes the most injured living ally\u2019s Conduit shield to 4% of your max HP per spent stack (max 12%), once per round; no resource is granted.",
    lore: "An enthroned iris returns spent native embers as a protective coronation.",
    artDesign: "fully reborn scarlet six-leaf focusing iris with a readable protected faceted central crystal, six majestic phoenix shield fans, nested coronation rings, an ivory siege crown and densely layered orange protective ribbons"
  },
  {
    id: "clearwater-manifold",
    name: "Abyssal Clearwater Parliament",
    rarity: "Omnic",
    price: null,
    theme: "oceanic",
    element: "oceanic",
    buffs: stats("health", "defense", "elementalDamage"),
    kitEffects: { rule: { trigger: "shield-absorbed", outcomes: [{ kind: "gauge", recipient: "lowest-gauge-other", amount: 4 }] } },
    effect: "+60% Health, +50% Defense, +40% Elemental Damage. Actual direct absorption by a shield from your abilities grants the lowest-Gauge other living ally 4 Gauge, once per round; no eligible ally means no effect.",
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
    buffs: stats("defense", "health", "elementalDamage"),
    kitEffects: { rule: {
      trigger: "defense",
      bank: { trigger: "shield-grown", maximum: 1 },
      outcomes: [{ kind: "boost", recipient: "injured-other", amount: 0.08 }]
    } },
    effect: "+60% Defense, +50% Health, +40% Elemental Damage. Actually increasing a shield with your abilities banks one Covenant per round. Defense spends it to refresh the most injured other living ally\u2019s outgoing Attack buff to 8% through next round, never stacking or replacing a stronger buff, once per round.",
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
    buffs: stats("health", "elementalDamage", "damage"),
    kitEffects: { rule: { trigger: "burn-tick", outcomes: [{ kind: "heal", recipient: "injured-other", amount: 0, ratio: 0.25, cap: 0.02 }] } },
    effect: "+60% Health, +50% Elemental Damage, +40% Attack. Actual Burn HP damage from your abilities restores the most injured other living ally by 25% of that damage, capped at 2% of your max HP, once per round. This Conduit healing does not count as ability healing and cannot build Botanic Renewal.",
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
    buffs: stats("defense", "elementalDamage", "health"),
    kitEffects: { rule: {
      trigger: "direct",
      ownWeaken: true,
      outcomes: [{ kind: "shield", recipient: "injured-other", amount: 0, ratio: 0.1, cap: 0.03 }]
    } },
    effect: "+60% Defense, +50% Elemental Damage, +40% Health. Effective direct HP damage to a target already carrying Weaken from your abilities refreshes the most injured other living ally\u2019s Conduit shield to 10% of damage, capped at 3% of your max HP, once per round.",
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
    buffs: stats("defense", "health", "elementalDamage"),
    kitEffects: { rule: { trigger: "heal", other: true, outcomes: [{ kind: "shield", recipient: "self", amount: 0.04 }] } },
    effect: "+60% Defense, +50% Health, +40% Elemental Damage. Actually healing another ally with your abilities refreshes your own Conduit shield to 4% of your max HP, once per round; full-health refreshes do not qualify.",
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
    buffs: stats("damage", "health", "defense"),
    kitEffects: { rule: {
      trigger: "direct",
      actions: ["light"],
      ownBurn: true,
      outcomes: [{ kind: "shield", recipient: "self", amount: 0, ratio: 0.1, cap: 0.04 }]
    } },
    effect: "+60% Attack, +50% Health, +40% Defense. Effective Normal Attack HP damage to your already Burning target refreshes your own Conduit shield to 10% of damage, capped at 4% of your max HP, once per round; the first Burn application does not qualify.",
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
    buffs: stats("health", "defense", "damage"),
    kitEffects: { rule: { trigger: "shield-grown", outcomes: [{ kind: "shield", recipient: "injured", amount: 0.05 }] } },
    effect: "+60% Health, +50% Defense, +40% Attack. Actually increasing a shield with your abilities refreshes the most injured living ally\u2019s Conduit shield to at least 5% of your max HP, once per round; stronger shields remain unchanged.",
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
    buffs: stats("critMultiplier", "damage", "health"),
    kitEffects: { rule: { trigger: "critical", outcomes: [{ kind: "shield", recipient: "injured-other", amount: 0, ratio: 0.1, cap: 0.03 }] } },
    effect: "+60% Critical Damage multiplier, +50% Attack, +40% Health. Effective critical direct HP damage refreshes the most injured other living ally\u2019s Conduit shield to 10% of damage, capped at 3% of your max HP, once per round; shield-only hits do not create shelter.",
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
    buffs: stats("health", "defense", "elementalDamage"),
    kitEffects: { rule: { trigger: "heal", belowHalf: true, outcomes: [{ kind: "cooldown", recipient: "target", amount: 1 }] } },
    effect: "+60% Health, +50% Defense, +40% Elemental Damage. Effective healing from your abilities on an ally at or below half HP before healing shortens that recipient\u2019s longest available ordinary-skill cooldown by one, never before next round, once per round. It neither revives nor bypasses recovery.",
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
    buffs: stats("defense", "health", "damage"),
    kitEffects: { rule: {
      trigger: "defense",
      bank: { trigger: "support", maximum: 1, other: true },
      outcomes: [{ kind: "gauge", recipient: "injured-other", amount: 5 }]
    } },
    effect: "+60% Defense, +50% Health, +40% Attack. Effective healing, shield growth or Attack support from your abilities to another ally banks one Witness per round (refresh only). Defense spends it to grant the most injured other living ally 5 Gauge, once per round; Defense still spends your action.",
    lore: "A completed sanctuary anchor stores the witness of a genuine covenant before releasing a reserve.",
    artDesign: "fully reborn ivory sanctuary anchor with a readable protected locking joint, six majestic fortress fans, nested solace rings, a pearl witness crown and densely layered turquoise covenant ribbons"
  },
  {
    id: "ruinselect-prism",
    name: "Ruinselect Fracture Parliament",
    rarity: "Omnic",
    price: null,
    theme: "chaotic",
    element: "chaotic",
    buffs: stats("elementalDamage", "damage", "health"),
    kitEffects: { rule: { trigger: "fracture-spent", outcomes: [{ kind: "gauge", recipient: "lowest-gauge-other", amount: 0, ratio: 2 }] } },
    effect: "+60% Elemental Damage, +50% Attack, +40% Health. Actually consuming your personal Fracture Marks with an effective Normal Attack grants the lowest-Gauge other living ally 2 Gauge per consumed Mark (max 4), once per round. It creates no marks and never consumes another owner\u2019s marks.",
    lore: "The restored selection orrery routes spent personal fractures to one allied reserve.",
    artDesign: "fully reborn fractured obsidian selection orrery with a readable protected central prism, six majestic violet targeting fans, nested fault rings, a crimson parliamentary crown and densely layered opaque precision ribbons"
  },
  {
    id: "infernic-pyre-census",
    name: "Pyre Census Requiem",
    rarity: "Omnic",
    price: null,
    theme: "infernic",
    element: "infernic",
    buffs: stats("damage", "elementalDamage", "health"),
    kitEffects: { rule: { trigger: "burn-tick", lethal: true, outcomes: [{ kind: "cooldown", recipient: "self", amount: 1, bothSkills: true }] } },
    effect: "+60% Attack, +50% Elemental Damage, +40% Health. A Burn tick from your abilities that actually defeats its target shortens both of your available ordinary-skill cooldowns by one, never before next round, once per round. Burn retains its source and HP-side damage semantics.",
    lore: "The completed census records only an ember channel that truly closes.",
    artDesign: "fully reborn crimson census engine with a readable protected three-counter core, six majestic phoenix requiem fans, nested siege rings, an ivory ember crown and densely layered opaque orange census ribbons"
  },
  {
    id: "oceanic-shared-tide-pump",
    name: "Shared Tide Lifesea Engine",
    rarity: "Omnic",
    price: null,
    theme: "oceanic",
    element: "oceanic",
    buffs: stats("health", "defense", "elementalDamage"),
    kitEffects: { rule: {
      trigger: "shield-absorbed",
      other: true,
      outcomes: [{ kind: "heal", recipient: "target", amount: 0, ratio: 0.3, cap: 0.03 }]
    } },
    effect: "+60% Health, +50% Defense, +40% Elemental Damage. Actual direct absorption by a shield from your abilities on another living ally restores that recipient by 30% of absorbed damage, capped at 3% of your max HP, once per round. Conduit healing cannot build healing charges such as Botanic Renewal.",
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
    buffs: stats("damage", "critMultiplier", "defense"),
    kitEffects: { rule: { trigger: "resource-spent", resources: ["tempest"], outcomes: [{ kind: "gauge", recipient: "self", amount: 0, ratio: 2 }] } },
    effect: "+60% Attack, +50% Critical Damage multiplier, +40% Defense. Actually spending intrinsic Atmospheric Charge returns 2 Gauge per spent stack (max 6), once per round. No resource is granted, action costs and recovery remain, and account upgrades never scale this return.",
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
    buffs: stats("health", "elementalDamage", "defense"),
    kitEffects: { rule: {
      trigger: "resource-spent",
      resources: ["bloom"],
      outcomes: [{ kind: "shield", recipient: "injured", amount: 0, ratio: 0.03, cap: 0.09 }]
    } },
    effect: "+60% Health, +50% Elemental Damage, +40% Defense. Actually spending your Botanic Renewal refreshes the most injured living ally\u2019s Conduit shield to 3% of your max HP per spent stack (max 9%), once per round; it grants neither healing nor resources.",
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
    buffs: stats("defense", "health", "elementalDamage"),
    kitEffects: { rule: { trigger: "support", other: true, outcomes: [{ kind: "protection", recipient: "target", amount: 0.1 }] } },
    effect: "+60% Defense, +50% Health, +40% Elemental Damage. Effective healing, shield growth or Attack support from your abilities to another living ally gives that recipient one 10% direct-hit protection charge, refresh only, once per round. It is consumed on their next direct enemy hit, never reduces Burn and resets each encounter.",
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
    buffs: stats("elementalDamage", "damage", "health"),
    kitEffects: { rule: {
      trigger: "resource-spent",
      resources: ["thornAegis", "duality"],
      outcomes: [{ kind: "heal", recipient: "self", amount: 0, ratio: 0.02, cap: 0.06 }]
    } },
    effect: "+60% Elemental Damage, +50% Attack, +40% Health. Actually spending your Thorn Aegis or Rose Duality restores your own HP by 2% of max HP per spent charge (max 6%), once per round. This is Conduit healing, not healing from Rose abilities; no resource, Weaken or Burn is granted.",
    lore: "The completed fault selector distinguishes a genuinely spent Rose reserve from an unearned echo.",
    artDesign: "fully reborn obsidian rosefault selector with a readable protected forked prism, six majestic crimson thorn fans, nested violet precision rings, a fractured rose crown and densely layered opaque crimson and amethyst fault ribbons"
  }
];
var convertedKitConduitIds = new Set(kitConduitDesigns.map((entry) => entry.id));

// src/content/world-lore.ts
var machineOrigin = "The Machines are destroyed prototypes from the time Let and Rise worked together. Their damaged mechanisms still awaken amid the ruins of that collaboration; they are not Elemental-Devourers created by Rise.";
var conduitOrigin = "A Conduit is a surviving mechanism from the age of Let and Rise's collaboration, salvaged and restored for the present search. Elemental Light is the name used for the elemental energy within these devices, not a third creator or a recovered creator's soul.";
var masterOrigin = "Master Conduits are restored mechanisms from Let and Rise's shared prototype work, attuned to a named Element-Bearer. Their power supports that bearer's search for Let's soul; owning one does not recover the soul or decide the contest.";

// src/content/conduits.ts
var commonConduits = [
  {
    id: "vigil-core",
    name: "Vigil Core",
    rarity: "Common",
    price: 1e3,
    power: "Elemental Light",
    buff: { stat: "health", kind: "percent", amount: 5 },
    effect: "+5% Health",
    lore: "An emergency life-support mechanism from Let and Rise's shared prototype work, sealed beneath the battlefields of their later rivalry. Its protected chamber still holds a reserve of elemental energy."
  },
  {
    id: "siegebound-drive",
    name: "Siegebound Drive",
    rarity: "Common",
    price: 1200,
    power: "Mechanical",
    buff: { stat: "damage", kind: "percent", amount: 5 },
    effect: "+5% Attack",
    lore: "A compact force-transmission engine once hidden inside siege harnesses. Its interlocking gears survived centuries in a buried armory."
  },
  {
    id: "bastion-lock",
    name: "Bastion Lock",
    rarity: "Common",
    price: 1e3,
    power: "Mechanical",
    buff: { stat: "defense", kind: "percent", amount: 5 },
    effect: "+5% Defense",
    lore: "A folding ward mechanism recovered from a forgotten defensive vault. Its layered plates were adapted from the creators' shared prototypes into shields for the wars their rivalry provoked."
  },
  {
    id: "parallax-relay",
    name: "Parallax Relay",
    rarity: "Common",
    price: 1500,
    power: "Elemental Light",
    buff: { stat: "crit", kind: "percentage-points", amount: 2 },
    effect: "+2 percentage points Critical Rate",
    lore: "A concealed targeting relay with a split crystal lens. A trace of Elemental Light aligns its two sightlines with uncanny precision."
  },
  {
    id: "fracture-reservoir",
    name: "Fracture Reservoir",
    rarity: "Common",
    price: 1200,
    power: "Elemental Light",
    buff: { stat: "shatterCapacity", kind: "flat", amount: 5 },
    effect: "+5 Shatter Capacity",
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
    buff: { stat: "elementalDamage", kind: "percent", amount: 5 },
    effect: "+5% Elemental Damage",
    lore: "A bronze triangular clamp preserves one split crystal, its paired facets still carrying a trace of Elemental Light."
  },
  {
    id: "precision-escapement",
    name: "Precision Escapement",
    rarity: "Common",
    price: 1800,
    power: "Mechanical",
    buff: { stat: "critMultiplier", kind: "percent", amount: 8 },
    effect: "+8% Critical Damage multiplier",
    lore: "A compact clock escapement turns an offset sight disc with measured force, preserving the timing of a perfect strike."
  },
  {
    id: "fieldbrace-coupler",
    name: "Fieldbrace Coupler",
    rarity: "Common",
    price: 1400,
    power: "Mechanical",
    buffs: [{ stat: "health", kind: "percent", amount: 3 }, { stat: "defense", kind: "percent", amount: 3 }],
    effect: "+3% Health, +3% Defense",
    lore: "Two bronze field braces close around a ceramic cushion, distributing strain across the bearer\u2019s frame."
  },
  {
    id: "reserve-torque-crank",
    name: "Reserve Torque Crank",
    rarity: "Common",
    price: 1500,
    power: "Mechanical",
    buffs: [{ stat: "damage", kind: "percent", amount: 3 }, { stat: "health", kind: "percent", amount: 3 }],
    effect: "+3% Attack, +3% Health",
    lore: "A folded hand-crank winds a sealed reserve cylinder, trading compact force for a steadier reserve."
  },
  {
    id: "crosspin-governor",
    name: "Crosspin Governor",
    rarity: "Common",
    price: 1500,
    power: "Elemental Light",
    buffs: [{ stat: "damage", kind: "percent", amount: 3 }, { stat: "defense", kind: "percent", amount: 3 }],
    effect: "+3% Attack, +3% Defense",
    lore: "A bronze cross-shaped governor balances two armored counterweights around a stable central pin."
  }
];
var expandedConduits = [
  { id: "twinpulse-bellows", name: "Twinpulse Bellows", rarity: "Rare", buffs: [{ stat: "health", kind: "percent", amount: 15 }, { stat: "damage", kind: "percent", amount: 12 }], effect: "+15% Health, +12% Attack", lore: "Double silver bellows drive a piston through two measured pulses." },
  { id: "glassroot-gimbal", name: "Glassroot Gimbal", rarity: "Rare", buffs: [{ stat: "health", kind: "percent", amount: 15 }, { stat: "critMultiplier", kind: "percent", amount: 15 }], effect: "+15% Health, +15% Critical Damage multiplier", lore: "A spherical silver gimbal suspends a faceted reservoir beside its calibrated sight rings." },
  { id: "lifeline-flywheel", name: "Lifeline Flywheel", rarity: "Rare", buffs: [{ stat: "health", kind: "percent", amount: 15 }, { stat: "shatterCapacity", kind: "flat", amount: 15 }], effect: "+15% Health, +15 Shatter Capacity", lore: "Braided channels feed an open flywheel that holds a measured reserve." },
  { id: "sentinel-aperture", name: "Sentinel Aperture", rarity: "Rare", buffs: [{ stat: "defense", kind: "percent", amount: 15 }, { stat: "crit", kind: "percentage-points", amount: 4 }], effect: "+15% Defense, +4 percentage points Critical Rate", lore: "A shutter iris sits within an armored silver disc, opening only along a precise line." },
  { id: "wardglass-transformer", name: "Wardglass Transformer", rarity: "Rare", buffs: [{ stat: "defense", kind: "percent", amount: 15 }, { stat: "elementalDamage", kind: "percent", amount: 12 }], effect: "+15% Defense, +12% Elemental Damage", lore: "Two crystal-insulated towers channel elemental pressure through stepped silver plates." },
  { id: "hammerbalance-link", name: "Hammerbalance Link", rarity: "Rare", buffs: [{ stat: "damage", kind: "percent", amount: 15 }, { stat: "defense", kind: "percent", amount: 12 }], effect: "+15% Attack, +12% Defense", lore: "A hinged counterweight beam steadies a central impact joint." },
  { id: "breach-pendulum", name: "Breach Pendulum", rarity: "Rare", buffs: [{ stat: "damage", kind: "percent", amount: 15 }, { stat: "critMultiplier", kind: "percent", amount: 15 }], effect: "+15% Attack, +15% Critical Damage multiplier", lore: "A silver pendulum blade swings inside an open fork frame." },
  { id: "coilfeed-ratchet", name: "Coilfeed Ratchet", rarity: "Rare", buffs: [{ stat: "damage", kind: "percent", amount: 15 }, { stat: "shatterCapacity", kind: "flat", amount: 15 }], effect: "+15% Attack, +15 Shatter Capacity", lore: "A toothed silver ratchet feeds a coiled accumulator in measured increments." },
  { id: "opal-indexer", name: "Opal Indexer", rarity: "Rare", buffs: [{ stat: "elementalDamage", kind: "percent", amount: 12 }, { stat: "crit", kind: "percentage-points", amount: 4 }], effect: "+12% Elemental Damage, +4 percentage points Critical Rate", lore: "Five inset opal lenses mark positions on a finely balanced silver indexing wheel." },
  { id: "resonance-crucible", name: "Resonance Crucible", rarity: "Rare", buffs: [{ stat: "elementalDamage", kind: "percent", amount: 15 }, { stat: "critMultiplier", kind: "percent", amount: 15 }], effect: "+15% Elemental Damage, +15% Critical Damage multiplier", lore: "A crystal bridge joins two silver chambers, holding elemental resonance under pressure." },
  { id: "siege-cantilever", name: "Siege Cantilever", rarity: "Legendary", buffs: [{ stat: "damage", kind: "percent", amount: 85 }, { stat: "defense", kind: "percent", amount: -10 }], effect: "+85% Attack, -10% Defense", lore: "An ivory siege arm projects from a narrow platinum pivot, sacrificing armor for reach." },
  { id: "nullsong-transmission", name: "Nullsong Transmission", rarity: "Legendary", buffs: [{ stat: "damage", kind: "percent", amount: 85 }, { stat: "elementalDamage", kind: "percent", amount: -10 }], effect: "+85% Attack, -10% Elemental Damage", lore: "A platinum gear train turns inside silent crystal baffles, redirecting power from elemental channels." },
  { id: "horizon-heartcase", name: "Horizon Heartcase", rarity: "Legendary", buffs: [{ stat: "health", kind: "percent", amount: 85 }, { stat: "defense", kind: "percent", amount: -10 }], effect: "+85% Health, -10% Defense", lore: "A white radial life chamber opens broad reserve vanes while its ward plates retract." },
  { id: "stasis-reliquary", name: "Stasis Reliquary", rarity: "Legendary", buffs: [{ stat: "health", kind: "percent", amount: 85 }, { stat: "critMultiplier", kind: "percent", amount: -10 }], effect: "+85% Health, -10% Critical Damage multiplier", lore: "A platinum preservation capsule protects its reserve behind locked targeting rings." },
  { id: "granite-hourglass", name: "Granite Hourglass", rarity: "Legendary", buffs: [{ stat: "defense", kind: "percent", amount: 85 }, { stat: "damage", kind: "percent", amount: -10 }], effect: "+85% Defense, -10% Attack", lore: "Twin armored cones throttle the drive between them to reinforce a dense shell." },
  { id: "pale-bulwark-diadem", name: "Pale Bulwark Diadem", rarity: "Legendary", buffs: [{ stat: "defense", kind: "percent", amount: 85 }, { stat: "health", kind: "percent", amount: -10 }], effect: "+85% Defense, -10% Health", lore: "A crown-shaped fortress lattice folds inward around a narrow reserve core." },
  { id: "starvein-conductor", name: "Starvein Conductor", rarity: "Legendary", buffs: [{ stat: "elementalDamage", kind: "percent", amount: 85 }, { stat: "health", kind: "percent", amount: -10 }], effect: "+85% Elemental Damage, -10% Health", lore: "White conductor branches carry a bright current around a deliberately drained life vessel." },
  { id: "meridian-inverter", name: "Meridian Inverter", rarity: "Legendary", buffs: [{ stat: "elementalDamage", kind: "percent", amount: 85 }, { stat: "critMultiplier", kind: "percent", amount: -10 }], effect: "+85% Elemental Damage, -10% Critical Damage multiplier", lore: "A platinum reversing prism displaces its precision lenses to redirect elemental force." },
  { id: "execution-orrery", name: "Execution Orrery", rarity: "Legendary", buffs: [{ stat: "critMultiplier", kind: "percent", amount: 85 }, { stat: "defense", kind: "percent", amount: -10 }], effect: "+85% Critical Damage multiplier, -10% Defense", lore: "An asymmetric celestial orrery folds its armor outward to align a decisive strike." },
  { id: "verdict-caliper", name: "Verdict Caliper", rarity: "Legendary", buffs: [{ stat: "critMultiplier", kind: "percent", amount: 85 }, { stat: "elementalDamage", kind: "percent", amount: -10 }], effect: "+85% Critical Damage multiplier, -10% Elemental Damage", lore: "White precision jaws hold a throttled elemental core at an exact point." }
];
var recoveredConduits = [
  { id: "duplex-heart", name: "Duplex Heart", rarity: "Rare", buffs: [{ stat: "health", kind: "percent", amount: 15 }, { stat: "defense", kind: "percent", amount: 12 }], effect: "+15% Health, +12% Defense", lore: "Twin silver chambers restore a broken machine\u2019s life-support and armor lattice." },
  { id: "spearwheel-engine", name: "Spearwheel Engine", rarity: "Rare", buffs: [{ stat: "damage", kind: "percent", amount: 15 }, { stat: "elementalDamage", kind: "percent", amount: 15 }], effect: "+15% Attack, +15% Elemental Damage", lore: "Interlocked silver flywheels translate elemental pressure into striking force." },
  { id: "falcon-sight", name: "Falcon Sight", rarity: "Rare", buffs: [{ stat: "crit", kind: "percentage-points", amount: 4 }, { stat: "damage", kind: "percent", amount: 12 }], effect: "+4 percentage points Critical Rate, +12% Attack", lore: "A split-wing targeting lens rejoins two forgotten sightlines." },
  { id: "aegis-capacitor", name: "Aegis Capacitor", rarity: "Rare", buffs: [{ stat: "defense", kind: "percent", amount: 15 }, { stat: "shatterCapacity", kind: "flat", amount: 15 }], effect: "+15% Defense, +15 Shatter Capacity", lore: "Silver ward plates protect a restored ring accumulator." },
  { id: "springwell-pump", name: "Springwell Pump", rarity: "Rare", buffs: [{ stat: "health", kind: "percent", amount: 15 }, { stat: "elementalDamage", kind: "percent", amount: 12 }], effect: "+15% Health, +12% Elemental Damage", lore: "Two balanced impellers carry Elemental Light through a sealed silver vessel." },
  { id: "worldbreaker-drive", name: "Worldbreaker Drive", rarity: "Legendary", buffs: [{ stat: "damage", kind: "percent", amount: 85 }, { stat: "health", kind: "percent", amount: -10 }], effect: "+85% Attack, -10% Health", lore: "An ivory siege crown diverts its life-support reserve into a tremendous striking engine." },
  { id: "immortal-vessel", name: "Immortal Vessel", rarity: "Legendary", buffs: [{ stat: "health", kind: "percent", amount: 85 }, { stat: "damage", kind: "percent", amount: -10 }], effect: "+85% Health, -10% Attack", lore: "Platinum sanctuary chambers preserve their bearer by slowing the force-transmission drive." },
  { id: "citadel-spine", name: "Citadel Spine", rarity: "Legendary", buffs: [{ stat: "defense", kind: "percent", amount: 85 }, { stat: "elementalDamage", kind: "percent", amount: -10 }], effect: "+85% Defense, -10% Elemental Damage", lore: "An articulated white fortress folds around its core, sacrificing elemental output for armor." },
  { id: "astral-prism", name: "Astral Prism", rarity: "Legendary", buffs: [{ stat: "elementalDamage", kind: "percent", amount: 85 }, { stat: "defense", kind: "percent", amount: -10 }], effect: "+85% Elemental Damage, -10% Defense", lore: "A platinum prism unfolds its protective plates into an extraordinary elemental focus." },
  { id: "judgment-lens", name: "Judgment Lens", rarity: "Legendary", buffs: [{ stat: "critMultiplier", kind: "percent", amount: 85 }, { stat: "health", kind: "percent", amount: -10 }], effect: "+85% Critical Damage multiplier, -10% Health", lore: "Nested ivory lenses magnify a perfect strike at the expense of their bearer\u2019s reserve." }
];
var omnicConduits = [
  { id: "infernic-phoenix-reactor", name: "Phoenix Reactor", element: "infernic", mechanic: "burn-focus", effect: "+60% Attack, +50% Elemental Damage, +40% Health. Inflicting Burn grants +5 percentage points Critical Rate for your next offensive activation; refreshes, never stacks.", buffs: [{ stat: "damage", kind: "percent", amount: 60 }, { stat: "elementalDamage", kind: "percent", amount: 50 }, { stat: "health", kind: "percent", amount: 40 }] },
  { id: "aquatic-leviathan-pump", name: "Leviathan Pump", element: "oceanic", mechanic: "shield-heal", effect: "+60% Health, +50% Defense, +40% Attack. When your ability increases an ally's shield, restore 5% of your maximum HP, once per activation; cannot revive.", buffs: [{ stat: "health", kind: "percent", amount: 60 }, { stat: "defense", kind: "percent", amount: 50 }, { stat: "damage", kind: "percent", amount: 40 }] },
  { id: "tectonic-atlas-bastion", name: "Atlas Bastion", element: "botanic", mechanic: "defense-ward", effect: "+60% Defense, +50% Health, +40% Attack. Entering Defense grants a shield worth 10% of your maximum HP; refreshes, never stacks.", buffs: [{ stat: "defense", kind: "percent", amount: 60 }, { stat: "health", kind: "percent", amount: 50 }, { stat: "damage", kind: "percent", amount: 40 }] },
  { id: "efflorescent-worldtree-heart", name: "Worldtree Heart", element: "botanic", mechanic: "renewal", effect: "+60% Health, +50% Elemental Damage, +40% Defense. At each new player turn, restore 2% of your maximum HP; cannot revive.", buffs: [{ stat: "health", kind: "percent", amount: 60 }, { stat: "elementalDamage", kind: "percent", amount: 50 }, { stat: "defense", kind: "percent", amount: 40 }] },
  { id: "voltaic-thunderbird-coil", name: "Thunderbird Coil", element: "atmospheric", mechanic: "critical-gauge", effect: "+60% Attack, +50% Elemental Damage, +40% Defense. An activation that critically hits an enemy restores 5 Shatter Gauge, once per activation.", buffs: [{ stat: "damage", kind: "percent", amount: 60 }, { stat: "elementalDamage", kind: "percent", amount: 50 }, { stat: "defense", kind: "percent", amount: 40 }] },
  { id: "atmospheric-griffin-turbine", name: "Griffin Turbine", element: "atmospheric", mechanic: "normal-momentum", effect: "+60% Attack, +50% Defense, +40% Health. Normal Attack empowers your next offensive skill by 10% outgoing damage; refreshes, never stacks.", buffs: [{ stat: "damage", kind: "percent", amount: 60 }, { stat: "defense", kind: "percent", amount: 50 }, { stat: "health", kind: "percent", amount: 40 }] },
  { id: "luminous-seraph-mirror", name: "Seraph Mirror", element: "tranquilitic", mechanic: "defeat-gauge", effect: "+60% Elemental Damage, +50% Health, +40% Defense. Defeating an enemy with an offensive activation restores 5 Shatter Gauge, once per activation.", buffs: [{ stat: "elementalDamage", kind: "percent", amount: 60 }, { stat: "health", kind: "percent", amount: 50 }, { stat: "defense", kind: "percent", amount: 40 }] },
  { id: "ominous-eclipse-mantle", name: "Eclipse Mantle", element: "chaotic", mechanic: "weaken-pierce", effect: "+60% Attack, +50% Health, +40% Defense. Inflicting Weaken makes your next offensive activation ignore 20% of enemy Defense; refreshes, never stacks.", buffs: [{ stat: "damage", kind: "percent", amount: 60 }, { stat: "health", kind: "percent", amount: 50 }, { stat: "defense", kind: "percent", amount: 40 }] },
  { id: "tranquilitic-kirin-cradle", name: "Kirin Cradle", element: "tranquilitic", mechanic: "defense-heal", effect: "+60% Health, +50% Defense, +40% Elemental Damage. Entering Defense restores 5% of your maximum HP; cannot revive.", buffs: [{ stat: "health", kind: "percent", amount: 60 }, { stat: "defense", kind: "percent", amount: 50 }, { stat: "elementalDamage", kind: "percent", amount: 40 }] },
  { id: "chaotic-ouroboros-core", name: "Ouroboros Core", element: "chaotic", mechanic: "ultimate-ward", effect: "+60% Attack, +50% Elemental Damage, +40% Health. Last Flare grants a shield worth 15% of your maximum HP; refreshes, never stacks. Recovery still applies.", buffs: [{ stat: "damage", kind: "percent", amount: 60 }, { stat: "elementalDamage", kind: "percent", amount: 50 }, { stat: "health", kind: "percent", amount: 40 }] },
  { id: "infernic-cinder-testament", name: "Cinder Testament", element: "infernic", mechanic: "ember-seals", effect: "+60% Elemental Damage, +50% Attack, +40% Defense. When your Burn damages an enemy, gain one Ember Seal, at most once per enemy phase and three total. Your next damaging skill consumes all seals for +5% outgoing damage per seal.", buffs: [{ stat: "elementalDamage", kind: "percent", amount: 60 }, { stat: "damage", kind: "percent", amount: 50 }, { stat: "defense", kind: "percent", amount: 40 }] },
  { id: "aquatic-undertide-chronometer", name: "Undertide Chronometer", element: "oceanic", mechanic: "undertide-cooldown", effect: "+60% Defense, +50% Health, +40% Elemental Damage. Your damaging skill hitting a Weakened enemy reduces your other ordinary skill cooldown by one, at most once per player turn; never reduces Last Flare recovery.", buffs: [{ stat: "defense", kind: "percent", amount: 60 }, { stat: "health", kind: "percent", amount: 50 }, { stat: "elementalDamage", kind: "percent", amount: 40 }] },
  { id: "tectonic-faultkeeper-loom", name: "Faultkeeper Loom", element: "botanic", mechanic: "faultkeeper-ward", effect: "+60% Health, +50% Defense, +40% Elemental Damage. The first direct enemy hit after each Defense deals 15% less damage to you; consumes the ward even if shield absorbs the hit.", buffs: [{ stat: "health", kind: "percent", amount: 60 }, { stat: "defense", kind: "percent", amount: 50 }, { stat: "elementalDamage", kind: "percent", amount: 40 }] },
  { id: "efflorescent-verdant-covenant", name: "Verdant Covenant", element: "botanic", mechanic: "verdant-covenant", effect: "+60% Elemental Damage, +50% Health, +40% Attack. When your healing restores another living ally, that ally gains +10% outgoing Normal Attack damage for its next Normal Attack; refreshes, never stacks.", buffs: [{ stat: "elementalDamage", kind: "percent", amount: 60 }, { stat: "health", kind: "percent", amount: 50 }, { stat: "damage", kind: "percent", amount: 40 }] },
  { id: "voltaic-stormstep-dynamo", name: "Stormstep Dynamo", element: "atmospheric", mechanic: "stormstep", effect: "+60% Attack, +50% Defense, +40% Elemental Damage. Skill 1 primes +10% outgoing damage for Skill 2; Skill 2 primes the same for Skill 1. One charge per slot; the current slot charge is consumed before priming the other, with no same-activation bonus.", buffs: [{ stat: "damage", kind: "percent", amount: 60 }, { stat: "defense", kind: "percent", amount: 50 }, { stat: "elementalDamage", kind: "percent", amount: 40 }] },
  { id: "atmospheric-skythread-rudder", name: "Skythread Rudder", element: "atmospheric", mechanic: "skythread", effect: "+60% Defense, +50% Attack, +40% Health. Defense grants one Tailwind charge. Your next ordinary skill costs five less Gauge, minimum one; consumed only on legal activation, refreshes rather than stacks.", buffs: [{ stat: "defense", kind: "percent", amount: 60 }, { stat: "damage", kind: "percent", amount: 50 }, { stat: "health", kind: "percent", amount: 40 }] },
  { id: "luminous-dawn-witness-array", name: "Dawn Witness Array", element: "tranquilitic", mechanic: "dawn-witness", effect: "+60% Health, +50% Elemental Damage, +40% Defense. A noncritical Normal Attack grants +3 percentage points Critical Rate for your next offensive activation, up to three charges. Critical activations use then clear all charges.", buffs: [{ stat: "health", kind: "percent", amount: 60 }, { stat: "elementalDamage", kind: "percent", amount: 50 }, { stat: "defense", kind: "percent", amount: 40 }] },
  { id: "ominous-nightglass-archive", name: "Nightglass Archive", element: "chaotic", mechanic: "nightglass", effect: "+60% Elemental Damage, +50% Defense, +40% Attack. Your damaging skill applies one Fracture Mark to each surviving target, maximum two per bearer and target. Your next Normal Attack consumes those marks for +8% outgoing damage each.", buffs: [{ stat: "elementalDamage", kind: "percent", amount: 60 }, { stat: "defense", kind: "percent", amount: 50 }, { stat: "damage", kind: "percent", amount: 40 }] },
  { id: "tranquilitic-stillhour-carillon", name: "Stillhour Carillon", element: "tranquilitic", mechanic: "stillhour", effect: "+60% Health, +50% Attack, +40% Defense. After Defense, the first direct enemy hit you survive grants +8 Shatter Gauge once; shield-absorbed hits qualify, damage over time does not.", buffs: [{ stat: "health", kind: "percent", amount: 60 }, { stat: "damage", kind: "percent", amount: 50 }, { stat: "defense", kind: "percent", amount: 40 }] },
  { id: "chaotic-paradox-spindle", name: "Paradox Spindle", element: "chaotic", mechanic: "paradox", effect: "+60% Attack, +50% Elemental Damage, +40% Health. After Last Flare, prime +15% outgoing damage for your first offensive activation once normal recovery ends. No bonus during that Last Flare and no recovery bypass.", buffs: [{ stat: "damage", kind: "percent", amount: 60 }, { stat: "elementalDamage", kind: "percent", amount: 50 }, { stat: "health", kind: "percent", amount: 40 }] }
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
  ...kitConduitDesigns.map((entry) => ({ ...entry, mechanic: "kit-interaction", power: "Elemental Light", art: entry.id }))
].map((entry) => ({ ...entry, lore: `${conduitOrigin} ${entry.lore}` }));
var conduitUpgradeCap = 5;
var conduitUpgradeCosts = [25, 50, 100, 175, 250];
var conduitUpgradeRarityMultipliers = { Common: 1, Rare: 2, Legendary: 4, Omnic: 200 };
function validateConduitUpgradeLevel(value) {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > conduitUpgradeCap) {
    throw new Error("Conduit upgrade level must be an integer from 0 to 5.");
  }
  return value;
}
function validateConduitUpgrades(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error("Invalid saved Conduit upgrades.");
  const result = {};
  for (const [id, level] of Object.entries(value)) {
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
function validateConduitSlots(value) {
  if (!Array.isArray(value) || value.length !== conduitSlotCount || !value.every((id) => id === null || isConduitId(id))) throw new Error("Invalid Conduit slots.");
  const ids = value.filter((id) => id !== null);
  if (new Set(ids).size !== ids.length) throw new Error("Each named Conduit can be equipped only once per character.");
  if (ids.filter((id) => getConduit(id).rarity === "Omnic").length > 4) throw new Error("Equip at most four Omnic Conduits per character.");
  return [...value];
}
function normalizeLegacyKitSlots(value, element) {
  if (!Array.isArray(value) || value.length !== conduitSlotCount || !value.every((id) => id === null || isConduitId(id))) {
    throw new Error("Invalid Conduit slots.");
  }
  const ids = value.filter((id) => id !== null);
  if (new Set(ids).size !== ids.length) throw new Error("Each named Conduit can be equipped only once per character.");
  const originalSlots = value.map((id) => id !== null && convertedKitConduitIds.has(id) ? null : id);
  validateConduitElement(originalSlots, element);
  let capacity = 4 - originalSlots.filter((id) => id !== null && getConduit(id).rarity === "Omnic").length;
  const normalized = value.map((id) => {
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
  const buffs = "buff" in conduit ? [conduit.buff] : conduit.buffs;
  return buffs.map((buff) => ({ ...buff, amount: buff.amount * (1 + 0.5 * level) }));
}
function isConduitId(value) {
  return conduits.some((conduit) => conduit.id === value);
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
var machineComponentRulesText = `Every defeated machine guarantees Broken Mechanical Components: ${mechanicalComponents.firstQuantity} per enemy at stage 1, rising linearly by stage to a base ${mechanicalComponents.finalQuantity} at stage ${infusionStageCount("machines")}, rounded to whole components. The final boss awards 5x that quantity (${mechanicalComponents.finalQuantity * 5}); earlier bosses use the ordinary stage quantity.`;
function rollMachineComponents(stage, random) {
  const drop = machineComponentDrop(stage);
  return lootRoll(random) < drop.chance ? drop.minimum : 0;
}

// src/content/master-conduits.ts
var masterChest = {
  id: "grand-master-chest",
  name: "Cosmic Grand Master Chest",
  chance: 0.01,
  stage: 100,
  art: "master-conduits/grand-master-chest.png",
  description: "Choose one unowned Master Conduit for any Element-Bearer. Opens once; does not equip the reward."
};
var masterRulesText = "The final Awaken the Machines boss (stage 100) independently has a 1% chance to drop a Cosmic Grand Master Chest. Open it in Inventory to choose one unowned Omnic Master for any Element-Bearer, even one not yet owned. One matching Master equips in its own slot; no ordinary slots, copies or upgrades are consumed. Masters are always-active bearer enhancements: every qualifying native outcome can apply their fixed effect, without a once-per-round activation limit. Generated Conduit effects cannot trigger them. Resource caps, shield and buff refresh limits, skill costs and recovery still apply. Masters cannot be upgraded. Extra chests remain unopened when all 48 Masters are owned.";
function master(character, slot, name, effect, design, rule) {
  return {
    id: `master-${character}-${slot}`,
    character,
    name,
    rarity: "Omnic",
    art: `master-conduits/master-${character}-${slot}.png`,
    effect,
    design,
    rule,
    lore: masterOrigin
  };
}
var masterConduits = [
  master(
    "ember",
    1,
    "Helios Pyre Cathedral",
    "Every damage tick of Infernis\u2019s own Burn adds a Conduit strike for 50% of the Burn damage and heals Infernis for 20% of that Burn damage (up to 10% max HP). Does not extend Burn.",
    "A furnace cathedral around a crimson miniature sun, twelve greatsword-shaped exhaust wings, stacked gold flame shutters and volcanic orbital rails",
    { trigger: "burn-tick", outcomes: [{ kind: "strike", recipient: "struck", amount: 0, ratio: 0.5 }, { kind: "heal", amount: 0, ratio: 0.2, cap: 0.1 }] }
  ),
  master(
    "ember",
    2,
    "Cinderstar Genesis Engine",
    "Every native Burn application stores 1 Astral Reserve (maximum 3). Flame Arc spends all of it: per reserve, gain a shield worth 4% max HP and deal 15% Attack to every enemy (reduced by Defense).",
    "A split stellar ignition engine, three molten planet chambers, counter-rotating sword-tooth halos and branching crimson ignition conduits",
    { trigger: "activation", actions: ["skill2"], bank: { trigger: "burn-applied", maximum: 3 }, outcomes: [{ kind: "shield", amount: 0.04 }, { kind: "strike", recipient: "all-enemies", amount: 0.15 }] }
  ),
  master(
    "ember",
    3,
    "Unbroken Sunforge Throne",
    "Every Infernic Embers spend returns 10 Gauge per charge spent and shortens one skill cooldown by one round (never ready before next round).",
    "A bronze-and-crimson sunforge throne machine, greatsword anvil at its heart, armored flare crowns and six immense mechanical flame fans",
    { trigger: "resource-spent", resources: ["ember"], outcomes: [{ kind: "gauge", amount: 0, ratio: 10 }, { kind: "cooldown", amount: 1 }] }
  ),
  master(
    "tide",
    1,
    "Abyssal Shelter Observatory",
    "Every enemy hit absorbed by Tizu\u2019s authored shields shortens one of her skill cooldowns by one round (never ready before next round) and refreshes 15% next-direct-hit protection for every ally.",
    "A sapphire pressure observatory, spear-shaped lighthouse spindle, nested diving-bell shields and immense tidal astrolabe fins",
    { trigger: "shield-absorbed", outcomes: [{ kind: "cooldown", amount: 1 }, { kind: "protection", recipient: "all-allies", amount: 0.15 }] }
  ),
  master(
    "tide",
    2,
    "Ocean Memory Worldpump",
    "Every enemy hit absorbed by Tizu\u2019s authored shields stores 1 Astral Reserve (maximum 3). Tidal Shelter spends all of it to heal every ally by 5% of Tizu\u2019s max HP per reserve.",
    "A world-sized tide pump enclosing three ocean planets, sapphire manifold crown, twelve spearhead vanes and interlocked platinum sea rings",
    { trigger: "activation", actions: ["skill2"], bank: { trigger: "shield-absorbed", maximum: 3 }, outcomes: [{ kind: "heal", recipient: "all-allies", amount: 0.05 }] }
  ),
  master(
    "tide",
    3,
    "Undertow Sovereign Harpoon",
    "Every native Weaken application lasts one more enemy phase (maximum 3) and the enemy gains 2 personal Fracture Marks (Tizu\u2019s next hit on it is stronger, maximum 2 marks).",
    "A monumental spear-tip targeting engine, abyssal sapphire prisms, concentric current locks and six armored harpoon-wing arcs",
    { trigger: "weaken-applied", outcomes: [{ kind: "weaken-clock", amount: 1 }, { kind: "fracture", amount: 2 }] }
  ),
  master(
    "sprout",
    1,
    "Worldseed Mercy Foundry",
    "Every effective native heal by Flora gives the most injured other ally a shield worth 50% of the HP restored (up to 15% of Flora\u2019s max HP; refresh, not stack).",
    "An emerald seed foundry with ivory bow-limb gantries, twelve leaf-blade mechanical wings and a densely interwoven root orrery",
    { trigger: "heal", outcomes: [{ kind: "shield", recipient: "injured-other", amount: 0, ratio: 0.5, cap: 0.15 }] }
  ),
  master(
    "sprout",
    2,
    "Briar Constellation Loom",
    "Every effective native heal by Flora stores 1 Astral Reserve (maximum 3). Briar Shot spends all of it: per reserve, add a 20% Attack Conduit strike to its target (reduced by Defense) and return 5 Gauge.",
    "A cosmic bowstring loom with three emerald seed planets, intertwined root escapements and vast ivory thorn-constellation fans",
    { trigger: "activation", actions: ["skill1"], bank: { trigger: "heal", maximum: 3 }, outcomes: [{ kind: "strike", recipient: "struck", amount: 0.2 }, { kind: "gauge", amount: 5 }] }
  ),
  master(
    "sprout",
    3,
    "Evergreen Continuance Crucible",
    "Every Last Flare refreshes 35% next-direct-hit protection for every ally and shortens both of Flora\u2019s skill cooldowns by one round (never ready before next round).",
    "A sealed living-world crucible, emerald germination heart, ivory petal armor and six gigantic bow-branch sanctuary wings; no resurrection imagery",
    { trigger: "activation", actions: ["ultimate"], outcomes: [{ kind: "protection", recipient: "all-allies", amount: 0.35 }, { kind: "cooldown", amount: 1, bothSkills: true }] }
  ),
  master(
    "atmoso",
    1,
    "Sky Without End Turbine",
    "Every native critical hit adds a follow-up gust strike to the same enemy for 40% of the damage dealt (up to 100% of Attack).",
    "A turquoise sky-axis turbine, wind-staff core, twelve spiraling blade wings and immense counter-sweeping cyclone crowns",
    { trigger: "critical", outcomes: [{ kind: "strike", recipient: "struck", amount: 0, ratio: 0.4, cap: 1 }] }
  ),
  master(
    "atmoso",
    2,
    "Horizon Cyclone Orrery",
    "Every native critical hit stores 1 Astral Reserve (maximum 3). Cyclone Weave spends all of it: per reserve, refresh 10% next-direct-hit protection and return 8 Gauge.",
    "Three turquoise storm planets inside a staff-shaped horizon orrery, ivory turbine ramparts and layered compass-wing vaults",
    { trigger: "activation", actions: ["skill2"], bank: { trigger: "critical", maximum: 3 }, outcomes: [{ kind: "protection", amount: 0.1 }, { kind: "gauge", amount: 8 }] }
  ),
  master(
    "atmoso",
    3,
    "Crosswind Imperial Drive",
    "Every Razor Gale hit against an enemy at or below half HP adds a 60% Attack crosswind strike to it (reduced by Defense) and returns 20 Gauge.",
    "An imperial crosswind staff-drive with crossed turquoise pressure corridors, ivory gale armor and six monumental scythe-shaped wind wings",
    { trigger: "direct", actions: ["skill1"], belowHalf: true, outcomes: [{ kind: "strike", recipient: "struck", amount: 0.6 }, { kind: "gauge", amount: 20 }] }
  ),
  master(
    "aurora",
    1,
    "Final Dawn Tribunal",
    "Every native Weaken application lasts one more enemy phase (maximum 3) and returns 5 Gauge to every ally.",
    "An ivory solar tribunal mechanism, amber judgment lens, twelve lens-wing arches and descending platinum verdict locks",
    { trigger: "weaken-applied", outcomes: [{ kind: "weaken-clock", amount: 1 }, { kind: "gauge", recipient: "all-allies", amount: 5 }] }
  ),
  master(
    "aurora",
    2,
    "Prismseal Astral Judiciary",
    "Every native Weaken application stores 1 Astral Reserve (maximum 3). Last Flare spends all of it to give every ally +10% Attack per reserve through next round (refresh, not stack).",
    "Three amber lens planets in an ivory judiciary orrery, interlocking seal plates and vast empty-hand casting aperture wings",
    { trigger: "activation", actions: ["ultimate"], bank: { trigger: "weaken-applied", maximum: 3 }, outcomes: [{ kind: "boost", recipient: "all-allies", amount: 0.1 }] }
  ),
  master(
    "aurora",
    3,
    "Merciful Eclipse Regulator",
    "Every native direct hit against Aurora\u2019s existing Weaken heals the most injured other ally by 15% of Aurora\u2019s max HP and refreshes their next-direct-hit protection at 30%.",
    "A white eclipse regulator surrounding an amber sun lens, twelve protective shutter petals and immense tiered celestial court rails",
    { trigger: "direct", ownWeaken: true, outcomes: [{ kind: "heal", recipient: "injured-other", amount: 0.15 }, { kind: "protection", recipient: "injured-other", amount: 0.3 }] }
  ),
  master(
    "bliss",
    1,
    "Thousandfeather Zenith Loom",
    "Every native critical hit gives the most injured other ally a shield worth 30% of the damage dealt (up to 15% of Bliss\u2019s max HP; refresh, not stack).",
    "An ivory-and-rose feather loom, two immense mechanical warfan assemblies, platinum quill wings and densely nested celestial ribbon gears",
    { trigger: "critical", outcomes: [{ kind: "shield", recipient: "injured-other", amount: 0, ratio: 0.3, cap: 0.15 }] }
  ),
  master(
    "bliss",
    2,
    "Stillplume Planetary Ballet",
    "Every effective native heal of another ally stores 1 Astral Reserve (maximum 3). Warfeather Cut spends all of it: per reserve, shorten one skill cooldown by one round (never ready before next round) and strike the target for 15% Attack (reduced by Defense).",
    "Three rose opal planets dancing inside paired ivory fan rotors, counterbalanced feather crowns and platinum orbital ribbons",
    { trigger: "activation", actions: ["skill1"], bank: { trigger: "heal", maximum: 3, other: true }, outcomes: [{ kind: "cooldown", amount: 1 }, { kind: "strike", recipient: "struck", amount: 0.15 }] }
  ),
  master(
    "bliss",
    3,
    "Quiet Heaven Fanforge",
    "Every Last Flare gives the most injured other ally a shield worth 20% of Bliss\u2019s max HP and 35% Attack through next round (refresh, not stack).",
    "A double-fan heaven forge, ivory-and-rose central feather heart, twelve platinum quill mandalas and monumental quiet-wing armor",
    { trigger: "activation", actions: ["ultimate"], outcomes: [{ kind: "shield", recipient: "injured-other", amount: 0.2 }, { kind: "boost", recipient: "injured-other", amount: 0.35 }] }
  ),
  master(
    "bruno",
    1,
    "Living Worldwall Atlas",
    "Every Defense refreshes a shield for every ally worth 12% of Bruno\u2019s max HP (does not stack).",
    "A basalt-and-bronze atlas machine supporting a faceted ochre world, hammer-shaped axial pillar and twelve titanic faultplate wings",
    { trigger: "defense", outcomes: [{ kind: "shield", recipient: "all-allies", amount: 0.12 }] }
  ),
  master(
    "bruno",
    2,
    "Quarry Planet Gravitas",
    "Every effective native shield increase by Bruno stores 1 Astral Reserve (maximum 3). Last Flare spends all of it to strike every enemy for 25% Attack per reserve (reduced by Defense).",
    "Three basalt quarry planets locked in bronze gravitic hammer cages, immense layered bedrock buttresses and ochre orbiting armor rails",
    { trigger: "activation", actions: ["ultimate"], bank: { trigger: "shield-grown", maximum: 3 }, outcomes: [{ kind: "strike", recipient: "all-enemies", amount: 0.25 }] }
  ),
  master(
    "bruno",
    3,
    "Worldforge Hammer Dominion",
    "Every native Weaken application adds an aftershock strike to that enemy for 60% Attack (reduced by Defense) and shortens one skill cooldown by one round (never ready before next round).",
    "A bronze hammer-dominion engine, basalt shelter vaults, ochre crystal pistons and six massive mechanically linked mountain-wing plates",
    { trigger: "weaken-applied", outcomes: [{ kind: "strike", recipient: "struck", amount: 0.6 }, { kind: "cooldown", amount: 1 }] }
  ),
  master(
    "disciple",
    1,
    "Unbound Mindcrown Synapse",
    "Every effective native support outcome returns 20 Gauge to the lowest-Gauge other ally and refreshes their next-direct-hit protection at 30%.",
    "An amethyst synapse crown engine, scarlet mindflame channels, twelve open-palm-shaped mechanical arches and linked psychic orbital frames",
    { trigger: "support", outcomes: [{ kind: "gauge", recipient: "lowest-gauge-other", amount: 20 }, { kind: "protection", recipient: "lowest-gauge-other", amount: 0.3 }] }
  ),
  master(
    "disciple",
    2,
    "Concord Planet Thoughtforge",
    "Every effective native support outcome on another ally stores 1 Astral Reserve (maximum 3). Last Flare spends all of it to give every ally 8 Gauge per reserve.",
    "Three amethyst thought planets in scarlet-linked open orbital cages, empty-hand mindcrown apertures and monumental psychic lattice wings",
    { trigger: "activation", actions: ["ultimate"], bank: { trigger: "support", maximum: 3, other: true }, outcomes: [{ kind: "gauge", recipient: "all-allies", amount: 8 }] }
  ),
  master(
    "disciple",
    3,
    "Sovereign Will Amplifier",
    "Every Thoughtspark Benediction hit shortens one of Disciple\u2019s skill cooldowns by one round (never ready before next round) and gives the lowest-Gauge other ally 15 Gauge.",
    "A black-amethyst will amplifier with scarlet triple-tier crown rings, huge open psychic handframes and twelve ornate inward-linked flame vanes",
    { trigger: "direct", actions: ["skill1"], outcomes: [{ kind: "cooldown", amount: 1 }, { kind: "gauge", recipient: "lowest-gauge-other", amount: 15 }] }
  ),
  master(
    "elise",
    1,
    "Infinite Thunderwheel Arsenal",
    "Every native critical hit shortens both skill cooldowns by one round (never ready before next round) and refreshes Elise\u2019s shield to 20% of damage dealt (up to 10% max HP).",
    "Exactly two four-point shuriken-shaped thunderwheel rotors with open central grips, yellow-green voltage rails and twelve platinum lightning wings",
    { trigger: "critical", outcomes: [{ kind: "cooldown", amount: 1, bothSkills: true }, { kind: "shield", amount: 0, ratio: 0.2, cap: 0.1 }] }
  ),
  master(
    "elise",
    2,
    "Twin Star Planetary Ratchet",
    "Every native critical hit stores 1 Astral Reserve (maximum 3). Last Flare spends all of it: per reserve, both skill cooldowns shorten by one round (never ready before next round) and Elise gains 10 Gauge.",
    "Three voltage planets held between two four-point star ratchets, yellow-green branching circuitry and huge platinum circuit-crown blades",
    { trigger: "activation", actions: ["ultimate"], bank: { trigger: "critical", maximum: 3 }, outcomes: [{ kind: "cooldown", amount: 1, bothSkills: true }, { kind: "gauge", amount: 10 }] }
  ),
  master(
    "elise",
    3,
    "Storm Empress Execution Clock",
    "Every enemy defeated by a native direct hit returns 30 Gauge and refreshes Elise\u2019s +30% Attack through next round.",
    "A double-shuriken execution clock, segmented yellow-green circuit armor, twelve angular stormblade fans and layered four-point chronometer rails",
    { trigger: "direct", lethal: true, outcomes: [{ kind: "gauge", amount: 30 }, { kind: "boost", amount: 0.3 }] }
  ),
  master(
    "razor",
    1,
    "Unbroken Midnight Bastion",
    "Every Defense heals 18% max HP and refreshes 40% next-direct-hit protection.",
    "An obsidian midnight bastion engine enclosing one night-sword spindle, violet crescent shield wings and enormous layered eclipse ramparts",
    { trigger: "defense", outcomes: [{ kind: "heal", amount: 0.18 }, { kind: "protection", amount: 0.4 }] }
  ),
  master(
    "razor",
    2,
    "Eclipse Planet Watchtower",
    "Every Defense stores 1 Astral Reserve (maximum 3). Last Flare spends all of it: per reserve, strike the target for 30% Attack (reduced by Defense) and refresh Razor\u2019s next-direct-hit protection by 20% (maximum 60%).",
    "Three violet eclipse planets behind obsidian tower-shield cages, one night-sword axis and twelve monumental crescent watchtower wings",
    { trigger: "activation", actions: ["ultimate"], bank: { trigger: "defense", maximum: 3 }, outcomes: [{ kind: "strike", recipient: "struck", amount: 0.3 }, { kind: "protection", amount: 0.2 }] }
  ),
  master(
    "razor",
    3,
    "Nightglass Counterblade Engine",
    "Every native Weaken application places two personal Fracture Marks (maximum 2) and refreshes a shield worth 25% of Razor\u2019s max HP.",
    "An obsidian counterblade engine, violet nightglass gem chambers, sword-hilt locking clasps and immense double-crescent shield architecture",
    { trigger: "weaken-applied", outcomes: [{ kind: "fracture", amount: 2 }, { kind: "shield", amount: 0.25 }] }
  ),
  master(
    "rosetta",
    1,
    "Rose Beyond the Sun Orrery",
    "Every native Weaken application returns 20 Gauge and refreshes a shield on the most injured other ally worth 12% of Rosetta\u2019s max HP.",
    "A rose-gold solar bow orrery with crimson petal gears, ivory wing vaults and twelve enormous gilded thorn-mandala arches",
    { trigger: "weaken-applied", outcomes: [{ kind: "gauge", amount: 20 }, { kind: "shield", recipient: "injured-other", amount: 0.12 }] }
  ),
  master(
    "rosetta",
    2,
    "Virtuous Planet Rosegarden",
    "Every effective native heal by Rosetta stores 1 Astral Reserve (maximum 3). Golden Thorn Volley spends all of it: per reserve, shorten one skill cooldown by one round (never ready before next round) and refresh every ally\u2019s shield to 3% of Rosetta\u2019s max HP.",
    "Three rose planets in rose-gold garden cages, ivory bow-limb orbit rails and densely layered crimson petal cathedral wings",
    { trigger: "activation", actions: ["skill1"], bank: { trigger: "heal", maximum: 3 }, outcomes: [{ kind: "cooldown", amount: 1 }, { kind: "shield", recipient: "all-allies", amount: 0.03 }] }
  ),
  master(
    "rosetta",
    3,
    "Golden Thorn Judgment Loom",
    "Every native direct hit against Rosetta\u2019s existing Weaken refreshes +45% Attack through next round and places two personal Fracture Marks (maximum 2).",
    "A golden thorn targeting loom with one central rose-bow aperture, crimson rose mandalas, ivory prism petals and twelve sweeping thorn-wing rails",
    { trigger: "direct", ownWeaken: true, outcomes: [{ kind: "boost", amount: 0.45 }, { kind: "fracture", amount: 2 }] }
  ),
  master(
    "thornia",
    1,
    "Forbidden Garden Worldlock",
    "Every enemy hit absorbed by Thornia\u2019s authored shields adds a counterstrike against the attacker for 100% of damage blocked (up to 100% of Attack) and returns 10 Gauge.",
    "A rose-gold forbidden worldlock, violet eclipse cage, crimson thorn greatsword axis and twelve immense gilded rose-shield fans",
    { trigger: "shield-absorbed", outcomes: [{ kind: "strike", recipient: "attacker", amount: 0, ratio: 1, cap: 1 }, { kind: "gauge", amount: 10 }] }
  ),
  master(
    "thornia",
    2,
    "Thousand-Rose Planetary Aegis",
    "Every enemy hit absorbed by Thornia\u2019s authored shields stores 1 Astral Reserve (maximum 3). Shadow Rose Cleave spends all of it to refresh every ally\u2019s shield to 6% of Thornia\u2019s max HP per reserve.",
    "Three crimson rose planets nested in golden aegis cages, violet thorn eclipse rails and massive interwoven rose-armored greatsword wings",
    { trigger: "activation", actions: ["skill2"], bank: { trigger: "shield-absorbed", maximum: 3 }, outcomes: [{ kind: "shield", recipient: "all-allies", amount: 0.06 }] }
  ),
  master(
    "thornia",
    3,
    "Shadow Rose Sovereign Foundry",
    "Every native Weaken application lasts one more enemy phase (maximum 3) and heals Thornia by 12% of her max HP.",
    "A violet-and-rose-gold shadow foundry, crimson thorn blade crucible, six immense rose-wing forge arches and dense golden petal countergears",
    { trigger: "weaken-applied", outcomes: [{ kind: "weaken-clock", amount: 1 }, { kind: "heal", amount: 0.12 }] }
  ),
  master(
    "crinso",
    1,
    "Twin-Rose Singularity Drive",
    "Every native critical hit refreshes a shield worth 15% of Crinso\u2019s max HP and +40% Attack through next round.",
    "A rose-gold singularity drive around one connected double-ended blade axle, golden flame and crimson lightning halves with twelve thorn wings",
    { trigger: "critical", outcomes: [{ kind: "shield", amount: 0.15 }, { kind: "boost", amount: 0.4 }] }
  ),
  master(
    "crinso",
    2,
    "Duality Planet Flamewheel",
    "Every native Burn application stores 1 Astral Reserve (maximum 3). Last Flare spends all of it: per reserve, Crinso heals 8% of max HP and refreshes 10% next-direct-hit protection.",
    "Three crimson-gold planets inside one connected dual-edged sword wheel, nested rose hubs, opposed flame rails and lightning petal armor",
    { trigger: "activation", actions: ["ultimate"], bank: { trigger: "burn-applied", maximum: 3 }, outcomes: [{ kind: "heal", amount: 0.08 }, { kind: "protection", amount: 0.1 }] }
  ),
  master(
    "crinso",
    3,
    "Crimson Beauty Pyre Requiem",
    "Every native direct hit against Crinso\u2019s existing Burn heals 15% max HP and extends that Burn by one phase (maximum 3). Burn ticks do not extend themselves.",
    "A golden-crimson pyre requiem engine with a connected double-ended sword core, twelve rose lightning wings and ornate flame-petal crowns",
    { trigger: "direct", ownBurn: true, outcomes: [{ kind: "heal", amount: 0.15 }, { kind: "burn-clock", amount: 1 }] }
  ),
  master(
    "nerithe",
    1,
    "Shoreless Meridian Worldchart",
    "Every native Normal Attack hit refreshes a shield worth 10% of Nerithe\u2019s max HP and +30% Attack through next round. Does not repeat her passive\u2019s Gauge award.",
    "A turquoise worldchart engine, surveyor-trident spindle, twelve ocean compass wings and immense folded meridian astrolabe rails",
    { trigger: "direct", actions: ["light"], outcomes: [{ kind: "shield", amount: 0.1 }, { kind: "boost", amount: 0.3 }] }
  ),
  master(
    "nerithe",
    2,
    "Folded Ocean Planetarium",
    "Every native Weaken application stores 1 Astral Reserve (maximum 3). Normal Attack spends all of it to strike the target for 25% Attack per reserve (reduced by Defense).",
    "Three turquoise ocean planets in folded ivory meridian cages, surveyor trident locking prongs and huge layered sea-map wings",
    { trigger: "activation", actions: ["light"], bank: { trigger: "weaken-applied", maximum: 3 }, outcomes: [{ kind: "strike", recipient: "struck", amount: 0.25 }] }
  ),
  master(
    "nerithe",
    3,
    "Abyssal Surveyor Crown",
    "Every native Weaken application places two personal Fracture Marks (maximum 2) and refreshes 35% next-direct-hit protection.",
    "A turquoise abyssal crown surveyor, trident-shaped rangefinding lens, ivory ocean ramparts and twelve royal compass-blade wings",
    { trigger: "weaken-applied", outcomes: [{ kind: "fracture", amount: 2 }, { kind: "protection", amount: 0.35 }] }
  ),
  master(
    "orvella",
    1,
    "Throne Beneath the World",
    "Every effective native shield increase by Orvella refreshes 40% next-direct-hit protection and returns 15 Gauge.",
    "An ivory-and-ochre planetary foundation throne, crystal-mace cornerstone, twelve monumental stone armor wings and immense bronze support arches",
    { trigger: "shield-grown", outcomes: [{ kind: "protection", amount: 0.4 }, { kind: "gauge", amount: 15 }] }
  ),
  master(
    "orvella",
    2,
    "Deep Foundation Planetpress",
    "Every enemy hit absorbed by Orvella\u2019s authored shields stores 1 Astral Reserve (maximum 3). Keystone Reversal spends all of it: the target\u2019s own Weaken lasts one more enemy phase (maximum 3) and both skill cooldowns shorten by one round per reserve (never ready before next round).",
    "Three ochre foundation planets braced by bronze masonry press rings, crystal-mace piston and ivory world-bearing buttress wings",
    { trigger: "activation", actions: ["skill1"], bank: { trigger: "shield-absorbed", maximum: 3 }, outcomes: [{ kind: "weaken-clock", amount: 1 }, { kind: "cooldown", amount: 1, bothSkills: true }] }
  ),
  master(
    "orvella",
    3,
    "Keystone Sovereign Counterweight",
    "Every native direct hit against Orvella\u2019s existing Weaken refreshes the most injured other ally\u2019s shield to 25% of her max HP and +30% Attack through next round.",
    "An ochre keystone counterweight engine with crystal mace fulcrum, bronze celestial load rails and twelve ivory citadel shield wings",
    { trigger: "direct", ownWeaken: true, outcomes: [{ kind: "shield", recipient: "injured-other", amount: 0.25 }, { kind: "boost", recipient: "injured-other", amount: 0.3 }] }
  ),
  master(
    "vaelor",
    1,
    "Final Chord Celestial Resonator",
    "While Vaelor is at or below half HP, every native direct hit heals Vaelor by 25% of damage dealt (up to 15% max HP) and returns 10 Gauge.",
    "A gold-and-black celestial resonator, resonance-blade tuning core, twelve immense thunder choir wings and branching frequency crown rails",
    { trigger: "direct", selfBelowHalf: true, outcomes: [{ kind: "heal", amount: 0, ratio: 0.25, cap: 0.15 }, { kind: "gauge", amount: 10 }] }
  ),
  master(
    "vaelor",
    2,
    "Thunder Choir Planetary Fugue",
    "Every native critical hit stores 1 Astral Reserve (maximum 3). Last Flare spends all of it to strike every enemy for 20% Attack per reserve (reduced by Defense).",
    "Three gold thunder planets in black conducting cages, resonance-blade axis and vast branching voltage organ-wing architecture",
    { trigger: "activation", actions: ["ultimate"], bank: { trigger: "critical", maximum: 3 }, outcomes: [{ kind: "strike", recipient: "all-enemies", amount: 0.2 }] }
  ),
  master(
    "vaelor",
    3,
    "Broken Sky Imperial Metronome",
    "Every Defense refreshes +50% Attack through next round and returns 15 Gauge.",
    "A black-and-gold sky metronome with resonance-blade pendulum, twelve thunder-frequency wings and enormous nested conductor halos",
    { trigger: "defense", outcomes: [{ kind: "boost", amount: 0.5 }, { kind: "gauge", amount: 15 }] }
  )
];
function isMasterConduitId(value) {
  return masterConduits.some((entry) => entry.id === value);
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
var machineRules = { stages: infusionStageCount("machines"), omnicStage: 75, rareChance: 0.08, legendaryChance: 0.035, omnicChance: 0.01, bannerBonusChance: 5e-3 };
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
function machineConduitLoot(stage) {
  validateMachineStage(stage);
  return [
    ...machinePools.Rare.map((conduit) => ({
      id: conduit.id,
      minimum: 1,
      maximum: 1,
      chance: machineRules.rareChance / machinePools.Rare.length,
      note: "Independent Rare tier roll, then equal choice within the tier; bosses use the same odds."
    })),
    ...machinePools.Legendary.map((conduit) => ({
      id: conduit.id,
      minimum: 1,
      maximum: 1,
      chance: machineRules.legendaryChance / machinePools.Legendary.length,
      note: "Independent Legendary tier roll, then equal choice within the tier; bosses use the same odds."
    })),
    ...stage >= machineRules.omnicStage ? machinePools.Omnic.map((conduit) => ({
      id: conduit.id,
      minimum: 1,
      maximum: 1,
      chance: machineRules.omnicChance / machinePools.Omnic.length,
      note: "Independent Omnic tier roll, then equal choice within the tier; bosses use the same odds."
    })) : []
  ];
}
function rollTier(pool, chance, random) {
  if (lootRoll(random) >= chance) return void 0;
  if (!pool.length) throw new Error("Conduit reward pool is empty.");
  return pool[Math.floor(lootRoll(random) * pool.length)].id;
}
function machineConduitDrops(stage, random) {
  validateMachineStage(stage);
  const drops = {};
  for (const [pool, chance] of [
    [machinePools.Rare, machineRules.rareChance],
    [machinePools.Legendary, machineRules.legendaryChance],
    [machinePools.Omnic, stage >= machineRules.omnicStage ? machineRules.omnicChance : 0]
  ]) {
    if (!chance) continue;
    const id = rollTier(pool, chance, random);
    if (id) drops[id] = 1;
  }
  return drops;
}
function bannerConduitBonus(random) {
  return rollTier(bannerPool, machineRules.bannerBonusChance, random);
}
var machineRulesText = `<p>${machineOrigin}</p><p>${machineRules.stages} stages \xB7 Lv.10-120 \xB7 Boss every fifth stage. Each defeated enemy grants ordinary Prismatica and independently rolls Rare Conduits at 8%, Legendary at 3.5%, and Omnic at 1% from stage ${machineRules.omnicStage} onward. A successful tier roll awards one equally chosen Conduit: ${machinePools.Rare.length} Rare, ${machinePools.Legendary.length} Legendary or ${machinePools.Omnic.length} element-specific Omnic. Multiple tiers may drop together; bosses use the same odds. All Common Conduits are Store-only and have no machine drop roll. ${machineComponentRulesText} No captures, evolution materials, Null-Prismatica or clear bonus.</p><p>One owned ordinary copy unlocks its name for every character. Each ordinary name can be upgraded account-wide five times using only components, adding 50% of the original stat modifiers each time, including penalties (3.5 times at +5). Kit effects and special mechanics are unchanged by upgrades. Up to four ordinary Omnic Conduits may occupy the eight ordinary slots; each must match that character's combat element.</p><p>${masterRulesText}</p>`;

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
    description: "A human Atmospheric Element-Bearer shaped in Let\u2019s image, Atmoso uses a crystal-tipped wind staff to turn Calm into open roads.",
    lore: {
      origin: "The high roads and mountain settlements of Sky-bound Rift",
      story: "Atmoso once carried messages between Sky-bound Rift\u2019s mountain settlements with a weathered staff and an unusually patient ear. Atmospheric reflects Calm: he waits for each voice in the wind rather than forcing the gale to answer. Let created human Element-Bearers in his image, while Rise created Elemental-Devourers in hers and broke convention to steal the same elements. Both factions seek their creators\u2019 souls; neither has been reunited or crowned, and the race remains unresolved. Atmoso follows reports of Let\u2019s scattered soul as carefully as he charts a route home for each lost message.",
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
    description: "A human Tranquilitic Element-Bearer shaped in Let\u2019s image, Aurora casts light through prismatic lenses to defend Peace without wielding a weapon.",
    lore: { origin: "The lens courts of Lustrous River", story: "Aurora inherited a lens in the Lustrous River courts that revealed the lives left outside every verdict. She set aside the courts\u2019 certainty and uses empty-handed light casting to temper violence, not to command obedience. Tranquilitic reflects Peace, the choice to make room for another answer. Let created human Element-Bearers in his image; Rise\u2019s Elemental-Devourers later stole the same elements. Both seek their creators\u2019 souls, but both remain unfound and no faction has won. Aurora studies the lens for signs of Let\u2019s soul, refusing to mistake a glimmer for its return.", vow: "Let the dawn reveal a better choice.", awakening: "A prism turns toward an unwritten verdict; the search continues." }
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
    description: "A human Tranquilitic Element-Bearer shaped in Let\u2019s image, Bliss turns Peace into motion with her paired feather fans.",
    lore: { origin: "The feather courts of City of Heaven", story: "Bliss learned in City of Heaven\u2019s feather courts that Peace is not stillness imposed on others, but attention to how each step affects them. Her paired fans preserve the court\u2019s rhythm as she draws danger away from those unable to flee. Let made human Element-Bearers in his image; Rise made Elemental-Devourers in hers and broke convention to steal their elements. Both factions seek their creators\u2019 souls, which remain unfound; no victor has emerged. Bliss follows the scattered traces of Let\u2019s soul, dancing between the pursuit and the people it threatens.", vow: "My stillness will never mean surrender.", awakening: "A quiet feather settles into your hand; the dance remains unfinished." }
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
    description: "A human Botanic Element-Bearer shaped in Let\u2019s image, Bruno bears Joy and Life through a stone hammer and shelters of living bedrock.",
    lore: { origin: "The quarries of Precipice of the Earth", story: "Bruno stayed when the quarries of Precipice began to collapse. With his stone hammer he made broken slabs into shelter, then shared the workers\u2019 relief as a kind of joy worth protecting. Botanic joins Joy with Life: even buried foundations can hold a future. Let created human Element-Bearers in his image, and Rise created Elemental-Devourers in hers, stealing the same elements; both factions now seek their creators\u2019 souls. Neither has found or reunited one, so Bruno guards the workers while tracing rumors of Let\u2019s soul, unwilling to call any faction\u2019s claim a victory.", vow: "Stand behind me. We will hold.", awakening: "Bedrock answers a steady hand; the foundation is not a throne." }
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
    description: "A human Chaotic Element-Bearer shaped in Let\u2019s image, Disciple uses open-handed psychic casting to share strength without binding another mind.",
    lore: { origin: "The thought forges of Ruins of Chaos", story: "Disciple refused the thought forges of Ruins of Chaos when they demanded one will from every mind. His open hands now weave scarlet mindflame into a freely shared resolve. Chaotic bears Death and Destruction, facts of existence rather than a license to erase another person\u2019s choices. Let created human Element-Bearers in his image; Rise created Elemental-Devourers in hers and broke convention to steal the same elements. Both factions hunt their creators\u2019 souls, still unreunited, and neither has prevailed. Disciple searches for Let\u2019s scattered soul while resisting every promise that reunion must mean unquestioned rule.", vow: "Strength shared is freedom preserved.", awakening: "An unbound thought reaches for your own; no mind has claimed its maker." }
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
    description: "A human Atmospheric Element-Bearer shaped in Let\u2019s image, Elise reads a storm with exactly two four-point shuriken and a calm, measured step.",
    lore: { origin: "The circuit paths of Galvanic Field", story: "Elise mapped the forgotten circuits of Galvanic Field with exactly two four-point shuriken and a steady eye. When the field fractured, she learned that Atmospheric Calm is not passivity: it is the pause in which a safe opening can be seen. Let made human Element-Bearers in his image; Rise\u2019s Elemental-Devourers stole the same elements, and both factions seek their creators\u2019 souls. Neither creator\u2019s soul has been found or reunited, and no one has won. Elise follows the field\u2019s branching currents for clues to Let\u2019s soul, but never at the cost of leaving a neighbor behind.", vow: "There is always another opening.", awakening: "Two sparks trace a path through the storm; the source remains distant." }
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
    description: "A human Chaotic Element-Bearer shaped in Let\u2019s image, Razor guards the Valley with one night sword and an eclipse bastion.",
    lore: { origin: "The nightwatch and abandoned gates of Valley of Solitude", story: "Razor kept watch after the Valley of Solitude gates were abandoned. He shaped the darkness around them into a bastion with one night sword, so frightened travelers could pass safely. Chaotic reflects Death and Destruction; Razor knows a guard must face both without turning protection into domination. Let created human Element-Bearers in his image, and Rise created Elemental-Devourers in hers, breaking convention to steal the same elements. Both factions seek their creators\u2019 souls, but neither has reunited one and no side has won. Razor tracks signs of Let\u2019s scattered soul between watches, never leaving the gate unguarded for a promised ending.", vow: "The night will find me standing.", awakening: "A silent sentinel answers your call, not the call of a found soul." }
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
  return { passive: `${id}-passive`, light: `${id}-light`, skill1: `${id}-skill1`, skill2: `${id}-skill2`, ultimate: `${id}-ultimate`, defend: `${id}-defend` };
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
    description: "A human Oceanic Element-Bearer shaped in Let\u2019s image, Nerithe maps Sadness with a surveyor trident and folded currents.",
    lore: {
      origin: "The observatories above the spiral sea",
      story: "From the spiral-sea observatories, Nerithe charted a current that never returned to shore. She learned Oceanic carries Sadness: a record of what is missing that can guide the living, not drown them. With her surveyor trident she folds distant tides around people lost between worlds. Let created human Element-Bearers in his image; Rise created Elemental-Devourers in hers and stole those same elements. Both factions search for their creators\u2019 souls, but neither has been reunited and no victor has emerged. Nerithe plots a route toward Let\u2019s scattered soul while marking every voyager still unaccounted for.",
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
    description: "A human Botanic Element-Bearer shaped in Let\u2019s image, Orvella\u2019s crystal mace raises living foundations where Joy and Life can endure.",
    lore: {
      origin: "The vaults beneath the faultline",
      story: "Orvella first braced a broken village gate with a mason\u2019s stone. In the vaults beneath the faultline she found buried foundations, and with her crystal mace raised them into shelter for people the world had forgotten. Botanic holds Joy and Life together: she celebrates each home restored without pretending the losses never happened. Let made human Element-Bearers in his image; Rise made Elemental-Devourers in hers and broke convention to steal the same elements. Both sides seek their creators\u2019 souls; neither has found or reunited one, and no one has won. Orvella follows Let\u2019s trail between repairs, unwilling to leave a community for a promise of rule.",
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
    description: "A human Atmospheric Element-Bearer shaped in Let\u2019s image, Vaelor finds Calm in the thunder choir with a resonance blade.",
    lore: { origin: "The towers of the thunder choir", story: "Vaelor listened in the thunder-choir towers for the missing rhythm between storms. With a small resonance blade he followed the silence, learning that Atmospheric means Calm: the clear interval in which a broken sky can be heard without being forced to sing. Let created human Element-Bearers in his image; Rise created Elemental-Devourers in hers and stole the same elements. Both factions seek their creators\u2019 souls, still separate and unfound; the contest has no winner. Vaelor follows the quiet frequencies around rumors of Let\u2019s soul, certain that the missing note must be heard before anyone can claim the final chord.", vow: "Even a broken sky can sing again.", awakening: "Quiet voltage finds its first rhythm, not its final chord." }
  }
];
function isWarCharacter(value) {
  return warCharacters.some((character) => character.id === value);
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
  nerithe: { light: "Surveyor's Thrust", defend: "Charted Shelter" },
  orvella: { light: "Plumbline Strike", defend: "Foundation Brace" },
  vaelor: { light: "Tuning Strike", defend: "Insulated Stance" }
};
var warFighters = {
  nerithe: {
    stats: { health: 235, defense: 13, damage: 40, crit: 0.18, shatterCapacity: 100, critMultiplier: 1.6, elementalDamage: 0 },
    passive: { name: "Uncharted Current", description: "Normal Attack gains 5 additional Gauge, capped by Gauge capacity.", damageBonus: 0, defenseBonus: 0, healFraction: 0, lightGaugeBonus: 5 },
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
    description: "A human Infernic Element-Bearer shaped in Let\u2019s image, Infernis carries Wrath in a wooden greatsword and red scarf, turning fierce feeling toward protection.",
    lore: {
      origin: "The watchfires and village keepers of Ashen Vale",
      story: "When Ashen Vale\u2019s watchfires failed, Infernis carried their last coal in a clay lantern, her wooden training greatsword in hand and the keepers\u2019 red scarf at her neck. As a human Element-Bearer made in Let\u2019s image, she knows Infernic answers Wrath: anger can burn a refuge down, or give someone the courage to defend it. Rise\u2019s Elemental-Devourers have stolen the same element, and both factions hunt their creators\u2019 scattered souls; Let\u2019s remains unreunited, and no side has won. Infernis follows the rumor of his soul not for a throne, but so no traveler must face the dark alone.",
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
    description: "A human Oceanic Element-Bearer shaped in Let\u2019s image, Tizu\u2019s blue hair, simple spear, and blue ferrykeeper sash follow remembered Sadness.",
    lore: {
      origin: "The ferry bells and silent shores of Glasswater",
      story: "Tizu learned every Glasswater bell that guided boats through the mist. After the bells fell silent, he tied on his blue ferrykeeper sash and took a practice spear to the shore. His Oceanic element holds Sadness without letting grief become an anchor: he records the names of the missing keepers and follows currents that might bring them home. Let\u2019s first made human Element-Bearers in his image, while Rise made Elemental-Devourers who broke the old boundary and stole the same elements. Both search for their creators\u2019 souls, but neither has been reunited; Tizu seeks Let\u2019s without mistaking a hopeful current for proof.",
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
    description: "A human Botanic Element-Bearer shaped in Let\u2019s image, Flora\u2019s wooden bow and green neckerchief accompany Joy and Life wherever hope can take root.",
    lore: {
      origin: "The waking roots and gardeners of Hollowgreen",
      story: "Flora tended a small garden in Hollowgreen after the old trees stopped bearing leaves. When one seed opened beneath the gray branches, she took her wooden bow and the gardeners\u2019 green neckerchief to find more ground worth tending. Botanic carries both Joy and Life: delight is not denial of loss, but the choice to make room for what can grow. Let created human Element-Bearers in his image; Rise\u2019s Elemental-Devourers later stole those same elements, and both factions now seek their creators\u2019 souls. Flora follows the still-unfound soul of Let, hoping its return might keep the worlds open to renewal; no faction has yet prevailed.",
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
    description: "A human Tranquilitic Element-Bearer shaped in Let\u2019s image, Rosetta\u2019s bow, golden thorns, and crimson wings defend peace without demanding possession.",
    lore: { origin: "The gardens beneath sunny skies", story: "Rosetta learned among the sunny rose gardens that peace is a practice, not a command to be silent. Her bow draws golden thorns through the crimson canopy to open an escape for those caught in others\u2019 quarrels. Tranquilitic reflects Peace, and she carries that meaning as one of the human Element-Bearers Let created in his image. Rise\u2019s Elemental-Devourers stole the same element; both factions seek their creators\u2019 souls, still unfound, and no victor can yet claim the world. Rosetta follows the rumors with care, wary of any peace bought by making one creator absolute.", vow: "Let every rose shelter a beginning.", awakening: "A crimson petal turns toward the sun; the soul is still sought." }
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
    description: "A human Chaotic Element-Bearer shaped in Let\u2019s image, Thornia wears a golden rose in her hair and bears a crimson-thorn-wrapped greatsword.",
    lore: { origin: "The forbidden garden", story: "Thornia guarded a single golden rose at the edge of the forbidden garden. When its gates broke, she wrapped crimson thorns around her greatsword and held the breach so its people could escape. Chaotic reflects Death and Destruction, truths she refuses to disguise as virtue or wield carelessly. Let created human Element-Bearers in his image; Rise created Elemental-Devourers in hers and broke convention to steal the same elements. Both factions seek their creators\u2019 souls, but neither soul has been reunited and no one has won. Thornia searches for Let\u2019s, intent on keeping destructive power from deciding who deserves to live.", vow: "No one crosses these thorns alone.", awakening: "The golden rose remembers its guardian, not a victor." }
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
    description: "A human Chaotic Element-Bearer shaped in Let\u2019s image, Crinso wields one dual-edged sword: golden fire on one edge, crimson lightning on the other.",
    lore: { origin: "The paths between twin roses", story: "On the paths between twin roses, Crinso learned that tending a garden sometimes means protecting what lives and sometimes accepting what must end. His small double-edged dagger became one rose-centered sword, golden fire and crimson lightning held in a single grip. Chaotic bears Death and Destruction, not a promise of cruelty. Let made human Element-Bearers in his image; Rise\u2019s Elemental-Devourers broke convention to steal their elements. Both sides hunt their creators\u2019 souls, still separate and unfound, and Crinso will not call the contest settled before either is found. He follows the trail of Let\u2019s soul while guarding the people caught between factions.", vow: "I choose what grows beyond the storm.", awakening: "Two petals unfold around one resolve; neither soul has returned." }
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
function isStarterId(value) {
  return starters.some((starter) => starter.id === value);
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
    passive: `While you are alive, Burn from your own abilities grants one charge of ${elementalEffectFamilies.burn.label} when it deals damage, at most once per enemy phase (maximum 3). Save these charges to strengthen Flame Arc or Last Flare.`,
    skill2: `Spends all ${elementalEffectFamilies.burn.label} charges for +8% outgoing damage per charge (maximum +24%); one spend for the whole activation.`,
    ultimate: `Spends all ${elementalEffectFamilies.burn.label} charges for +12% outgoing damage per charge (maximum +36%); one spend for the whole activation.`,
    resource: { label: elementalEffectFamilies.burn.label, key: "ember", summary: "Save up to 3 charges from your own Burn damage, once per enemy phase while alive. Flame Arc spends them for +8% damage each; Last Flare spends them for +12% each.", detail: `${elementalEffectFamilies.burn.label}: Skill 2 +8% outgoing damage per charge or Last Flare +12% per charge.`, effect: sharedNativeEffects.ember }
  },
  ward: {
    passive: `While you are alive, shields from your own abilities grant one charge of ${elementalEffectFamilies.ward.label} when they absorb a direct enemy hit, at most once per enemy phase across the team (maximum 3). Save these charges to strengthen Undertow Thrust's Weaken or Last Flare's team shield.`,
    skill1: `Spends all ${elementalEffectFamilies.ward.label} charges for +5 percentage points Weaken per charge (maximum +15; total reduction capped at 60%).`,
    ultimate: `Spends all ${elementalEffectFamilies.ward.label} charges to increase this ability's team shield by 5% of your maximum Health per charge (maximum 15%). Each ally keeps the higher of their remaining shield and this new amount.`,
    resource: { label: elementalEffectFamilies.ward.label, key: "ward", summary: "Save up to 3 charges when your ability shield absorbs a direct enemy hit, once per enemy phase while alive. Skill 1 spends them to strengthen Weaken; Last Flare spends them for a larger team shield.", detail: `${elementalEffectFamilies.ward.label}: Skill 1 +5 percentage points Weaken per charge or Last Flare adds a shield worth 5% of caster maximum Health per charge.`, effect: sharedNativeEffects.ward }
  },
  bloom: {
    passive: `While you are alive, healing from your own abilities or passive grants one charge of ${elementalEffectFamilies.bloom.label} when it restores missing HP, at most once per turn (maximum 3). Full-health targets and Conduit healing do not count. Save these charges to strengthen Skill 1 or Last Flare.`,
    resource: { label: elementalEffectFamilies.bloom.label, key: "bloom", summary: "Save up to 3 charges by restoring missing HP with your own kit, once per turn. Skill 1 spends them for extra damage. Last Flare spends them for extra healing (Flora) or team shield (Bliss). Conduit healing does not earn charges.", detail: `${elementalEffectFamilies.bloom.label}: Skill 1 spends charges for extra damage; Last Flare spends them for extra healing (Flora) or team shield (Bliss).`, effect: sharedNativeEffects.bloom }
  },
  tempest: {
    passive: `A critical Normal Attack, Skill 1 or Skill 2 that deals damage grants one charge of ${elementalEffectFamilies.tempest.label}, at most once per use even against multiple enemies (maximum 3). Last Flare grants none. Save these charges for the charge-spending skill or Last Flare's damage bonus.`,
    resource: { label: elementalEffectFamilies.tempest.label, key: "tempest", summary: "Save up to 3 charges from damaging critical Normal Attacks or skills, once per use; Last Flare earns none. Skill 1 (Atmoso and Elise) or Skill 2 (Vaelor) spends them for +8% damage each; Last Flare spends them for +12% each.", detail: `${elementalEffectFamilies.tempest.label}: Skill 1 (Atmoso and Elise) or Skill 2 (Vaelor) spends charges for +8% damage each; Last Flare spends them for +12% each.`, effect: sharedNativeEffects.tempest }
  },
  "rose-grace": {
    passive: "While Rosetta is alive, her abilities or passive grant one Rose Grace charge when they restore missing HP, at most once per turn (maximum 3). Full-health targets and Conduit healing do not count.",
    skill1: "Spends all Rose Grace for +5 percentage points Weaken each (maximum +15; combined reduction capped at 60%).",
    ultimate: "Spends all Rose Grace for +10% outgoing damage each (maximum +30%); one spend for the whole activation.",
    resource: { label: "Rose Grace", key: "roseGrace", summary: "Save up to 3 charges by restoring missing HP with Rosetta's own kit, once per turn while alive. Skill 1 spends them for stronger Weaken; Last Flare spends them for +10% damage each. Conduit healing does not earn charges.", detail: "Rose Grace: Skill 1 +5 percentage points Weaken each or Last Flare +10% outgoing damage each.", effect: { family: "bloom", kind: "healing", origin: "rose", source: "living-self-authored-healing" } }
  },
  "thorn-aegis": {
    passive: "While Thornia is alive, shields from her abilities grant one Thorn Aegis charge when they absorb a direct enemy hit, at most once per enemy phase across the team (maximum 3). Conduit shields do not count.",
    skill2: "Spends all Thorn Aegis for +5 percentage points Weaken each (maximum +15; combined reduction capped at 60%).",
    ultimate: "Spends all Thorn Aegis to add shield points equal to 5% of your maximum Health per charge (maximum 15%), before this ability's shield modifiers. Each ally keeps the higher of their remaining shield and this new amount.",
    resource: { label: "Thorn Aegis", key: "thornAegis", summary: "Save up to 3 charges when Thornia's ability shield absorbs a direct enemy hit, once per enemy phase while alive. Skill 2 spends them for stronger Weaken; Last Flare spends them for a larger team shield. Conduit shields do not earn charges.", detail: "Thorn Aegis: Skill 2 +5 percentage points Weaken each or Last Flare adds 5% caster maximum Health shield each.", effect: { family: "ward", kind: "shield-absorption", origin: "rose", source: "living-self-authored-shield" } }
  },
  "rose-duality": {
    passive: "While Crinso is alive, Burn from his abilities grants one Rose Duality charge when it deals damage, at most once per enemy phase (maximum 3). The charges are not Burn and are separate from the Ember Seals granted by the Cinder Testament Conduit.",
    skill1: "Spends all Rose Duality for +8% outgoing damage each (maximum +24%); one spend for the whole activation.",
    ultimate: "Spends all Rose Duality for +12% outgoing damage each (maximum +36%); one spend for the whole activation.",
    resource: { label: "Rose Duality", key: "duality", summary: "Save up to 3 charges from Crinso's own Burn damage, once per enemy phase while alive. Skill 1 spends them for +8% damage each; Last Flare spends them for +12% each. Separate from Conduit charges.", detail: "Rose Duality: Skill 1 +8% outgoing damage each or Last Flare +12% each.", effect: { family: "burn", kind: "burn", origin: "rose", source: "living-self-authored-burn" } }
  }
};

// src/content/combat.ts
var actionIds = ["light", "skill1", "skill2", "ultimate", "defend"];
function basicActionName(id, action) {
  return isWarCharacter(id) ? warActionNames[id][action] : action === "light" ? "Normal Attack" : "Defense";
}
var defenseMode = { damageReduction: 0.1 };
var shatterGauge = {
  maximum: 100,
  starting: 0,
  incomingHit: 10,
  gains: { light: 20, defend: 0, skill1: 0, skill2: 0, ultimate: 0 },
  costs: { light: 0, defend: 0, skill1: 25, skill2: 40, ultimate: 100 }
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
      skill1: { name: "Briar Shot", description: `150% damage to one enemy with +20 percentage points critical chance. Spends all ${elementalEffectFamilies.bloom.label} charges for +10% outgoing damage per charge (maximum +30%).`, cooldown: 0, strength: { damageMultiplier: 1.5, critBonus: 0.2 } },
      skill2: { name: "Verdant Renewal", description: "Restore 30 health to every living ally; cannot revive. Increase living allies' outgoing attack damage by 10% this and next player turn (refresh; does not stack).", cooldown: 0, strength: { healing: 30, attackBoostFraction: 0.1 } },
      ultimate: { name: "Last Flare: Worldseed", description: `180% damage to all enemies and heal living allies by 55. Recover next turn. Spends all ${elementalEffectFamilies.bloom.label} charges for +15% healing from this ability per charge (maximum +45%).`, cooldown: 0, strength: { damageMultiplier: 1.8, healing: 55 } }
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
var enemyIds = ["goblin", "imp", "golem"];
var enemies = {
  goblin: { name: "Goblin", art: "goblin", element: "botanic", stats: { health: 110, defense: 5, damage: 23, crit: 0.1, shatterCapacity: 100, critMultiplier: 1.5, elementalDamage: 0 } },
  imp: { name: "Imp", art: "imp", element: "infernic", stats: { health: 90, defense: 3, damage: 28, crit: 0.15, shatterCapacity: 100, critMultiplier: 1.5, elementalDamage: 0 } },
  golem: { name: "Rock Golem", art: "rock-golem", element: "botanic", stats: { health: 160, defense: 15, damage: 20, crit: 0.05, shatterCapacity: 100, critMultiplier: 1.5, elementalDamage: 0 } }
};
function formatStat(value) {
  return String(Number(value.toFixed(2)));
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
  kit.stats.crit = Math.min(0.75, base.stats.crit * potency);
  kit.stats.critMultiplier = Math.min(3, base.stats.critMultiplier * potency);
  kit.stats.shatterCapacity = base.stats.shatterCapacity * potency;
  kit.passive.defenseBonus *= factor ** 0.7;
  kit.passive.damageBonus = Math.min(0.75, base.passive.damageBonus * potency);
  kit.passive.healFraction = Math.min(0.1, base.passive.healFraction * potency);
  for (const action of ["skill1", "skill2", "ultimate"]) {
    const strength = kit.abilities[action].strength;
    for (const key of ["damageMultiplier", "burnMultiplier", "weakenFraction", "critBonus", "shield", "healing", "attackBoostFraction"]) {
      const value = strength[key];
      if (value !== void 0) strength[key] = value * (key === "shield" || key === "healing" ? factor : potency);
    }
    if (strength.weakenFraction !== void 0) strength.weakenFraction = Math.min(0.5, strength.weakenFraction);
    if (strength.critBonus !== void 0) strength.critBonus = Math.min(0.5, strength.critBonus);
    if (strength.attackBoostFraction !== void 0) strength.attackBoostFraction = Math.min(0.5, strength.attackBoostFraction);
  }
  if (equipment) validateConduitElement(equipment, getStarter(id).elementId);
  applyConduitBuffs(kit.stats, equipment, upgrades);
  return describeFighter(id, kit);
}
function describeFighter(id, snapshot) {
  const kit = structuredClone(snapshot);
  const pct = (value2) => formatStat(value2 * 100);
  const value = (action, key) => {
    const amount = kit.abilities[action].strength[key];
    if (amount === void 0) throw new Error(`Missing ${id} ${action} strength: ${key}.`);
    return amount;
  };
  if (id === "ember") {
    kit.passive.description = `+${pct(kit.passive.damageBonus)}% outgoing damage at or below 50% health.`;
    kit.abilities.skill1.description = `${pct(value("skill1", "damageMultiplier"))}% damage to one enemy; burn for ${Math.round(kit.stats.elementalDamage * value("skill1", "burnMultiplier"))} damage on its next two enemy phases.`;
    kit.abilities.skill2.description = `${pct(value("skill2", "damageMultiplier"))}% damage to every living enemy.`;
    kit.abilities.ultimate.description = `${pct(value("ultimate", "damageMultiplier"))}% damage to every enemy; burn surviving targets for ${Math.round(kit.stats.elementalDamage * value("ultimate", "burnMultiplier"))} damage on their next two enemy phases.`;
  } else if (id === "tide") {
    kit.passive.description = `+${formatStat(kit.passive.defenseBonus)} defense, already included in displayed effective defense.`;
    kit.abilities.skill1.description = `${pct(value("skill1", "damageMultiplier"))}% damage to one enemy; reduce its next two enemy-phase attacks by ${pct(value("skill1", "weakenFraction"))}%.`;
    kit.abilities.skill2.description = `Give every living ally ${formatStat(value("skill2", "shield"))} shield points.`;
    kit.abilities.ultimate.description = `${pct(value("ultimate", "damageMultiplier"))}% damage to all enemies and ${formatStat(value("ultimate", "shield"))} shield points for every living ally.`;
  } else if (id === "sprout") {
    kit.passive.description = `At each new player turn, heal living allies by ${pct(kit.passive.healFraction)}% of their maximum health while Flora lives.`;
    kit.abilities.skill1.description = `${pct(value("skill1", "damageMultiplier"))}% damage to one enemy with +${pct(value("skill1", "critBonus"))} percentage points critical chance.`;
    kit.abilities.skill2.description = `Restore ${formatStat(value("skill2", "healing"))} health to every living ally; cannot revive. Increase living allies' outgoing attack damage by ${pct(value("skill2", "attackBoostFraction"))}% this and next player turn (refresh; does not stack).`;
    kit.abilities.ultimate.description = `${pct(value("ultimate", "damageMultiplier"))}% damage to all enemies and restore ${formatStat(value("ultimate", "healing"))} HP to every living ally; cannot revive.`;
  } else {
    kit.passive.description = kit.passive.lightGaugeBonus !== void 0 ? `Normal Attack gains ${formatStat(kit.passive.lightGaugeBonus)} additional Gauge, capped by Gauge capacity.` : kit.passive.healFraction > 0 ? `At each new player turn, heal living allies by ${pct(kit.passive.healFraction)}% of maximum health while this Element-Bearer lives.` : kit.passive.defenseBonus > 0 ? `+${formatStat(kit.passive.defenseBonus)} defense, included in effective defense.` : `+${pct(kit.passive.damageBonus)}% outgoing damage at or below 50% health.`;
    for (const action of ["skill1", "skill2", "ultimate"]) {
      const ability = kit.abilities[action];
      const strength = ability.strength;
      const effects = [];
      if (strength.damageMultiplier !== void 0) effects.push(`${pct(strength.damageMultiplier)}% damage to ${ability.targets === "all-enemies" ? "every living enemy" : "one enemy"}`);
      if (strength.weakenFraction !== void 0) effects.push(`reduce surviving targets' next two enemy-phase attacks by ${pct(strength.weakenFraction)}%`);
      if (strength.critBonus !== void 0) effects.push(`+${pct(strength.critBonus)} percentage points critical chance`);
      if (strength.burnMultiplier !== void 0) effects.push(`burn surviving targets for ${Math.round(kit.stats.elementalDamage * strength.burnMultiplier)} damage on their next two enemy phases`);
      if (strength.shield !== void 0) effects.push(`give every living ally ${formatStat(strength.shield)} shield points`);
      if (strength.healing !== void 0) effects.push(`restore ${formatStat(strength.healing)} health to every living ally; cannot revive`);
      if (strength.attackBoostFraction !== void 0) effects.push(`increase living allies' outgoing attack damage by ${pct(strength.attackBoostFraction)}% this and next player turn (refresh; does not stack)`);
      ability.description = `${effects.join("; ")}.`;
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
      skill1: `Spends all ${elementalEffectFamilies.bloom.label} charges for +10% outgoing damage per charge (maximum +30%).`,
      ultimate: `Spends all ${elementalEffectFamilies.bloom.label} charges for +15% healing from this ability per charge (maximum +45%); spent before healing, once for the whole activation.`
    },
    bliss: {
      skill1: `Spends all ${elementalEffectFamilies.bloom.label} charges for +8% outgoing damage per charge (maximum +24%).`,
      ultimate: `Spends all ${elementalEffectFamilies.bloom.label} charges to add a shield worth 5% of this caster's maximum Health per charge (maximum 15%); refreshes rather than stacks.`
    },
    atmoso: {
      skill1: `Spends all ${elementalEffectFamilies.tempest.label} charges for +8% outgoing damage per charge (maximum +24%).`,
      ultimate: `Spends all ${elementalEffectFamilies.tempest.label} charges for +12% outgoing damage per charge (maximum +36%).`
    },
    elise: {
      skill1: `Spends all ${elementalEffectFamilies.tempest.label} charges for +8% outgoing damage per charge (maximum +24%).`,
      ultimate: `Spends all ${elementalEffectFamilies.tempest.label} charges for +12% outgoing damage per charge (maximum +36%).`
    },
    vaelor: {
      skill2: `Spends all ${elementalEffectFamilies.tempest.label} charges for +8% outgoing damage per charge (maximum +24%).`,
      ultimate: `Spends all ${elementalEffectFamilies.tempest.label} charges for +12% outgoing damage per charge (maximum +36%).`
    }
  };
  for (const [action, text2] of Object.entries(intrinsicActionCopy[id] ?? {})) {
    kit.abilities[action].description += ` ${text2}`;
  }
  for (const action of ["skill1", "skill2", "ultimate"]) {
    const ability = kit.abilities[action];
    if (ability.strength.shield !== void 0 || id === "bliss" && action === "ultimate") {
      ability.description += " Shield: absorbs damage before HP; persists until depleted; refreshes to the higher amount.";
    }
    if (ability.strength.weakenFraction !== void 0) {
      ability.description += " Weaken: outgoing attack damage reduction; Defense unchanged.";
    }
    if (ability.strength.critBonus !== void 0) {
      ability.description += " Critical chance bonus: this attack only.";
    }
    if (ability.strength.burnMultiplier !== void 0) {
      ability.description += " Burn ignores Defense and replaces existing Burn.";
    }
    if (action === "ultimate") {
      ability.description += " Recovery: caster skips the next player turn.";
    }
  }
  return kit;
}
function applyConduitBuffs(stats2, equipment, upgrades) {
  if (equipment) for (const conduitId of validateConduitSlots(equipment)) {
    if (conduitId === null) continue;
    for (const buff of conduitBuffs(getConduit(conduitId), upgrades?.[conduitId] ?? 0)) {
      if (buff.kind === "percent") stats2[buff.stat] *= 1 + buff.amount / 100;
      else if (buff.kind === "percentage-points") {
        const value = Math.max(0, stats2[buff.stat] + buff.amount / 100);
        stats2[buff.stat] = buff.stat === "crit" ? value : Math.min(1, value);
      } else stats2[buff.stat] += buff.amount;
    }
  }
}
function isActionId(value) {
  return actionIds.some((action) => action === value);
}

// src/content/stat-growth.ts
var playableGrowth = { perLevel: 0.15, perEvolution: 1.5 };
var enemyGrowth = {
  maximumLevel: 120,
  health: 9e3,
  bossHealth: 35e3,
  damage: 1200,
  bossDamage: 3e3,
  defense: 400,
  bossDefense: 600
};
var capturedGrowth = { health: 220, damage: 38, defense: 16 };
function enemyCombatStats(level, boss) {
  if (!Number.isInteger(level) || level < 1 || level > 140) throw new Error("Enemy level must be from 1 to 140.");
  const bounded = Math.min(level, enemyGrowth.maximumLevel);
  const extension = (1 + Math.max(0, level - enemyGrowth.maximumLevel) * 0.018) ** 2;
  const stat = (base, target, rate) => {
    const linear = 1 + (bounded - 1) * rate;
    const acceleration = Math.log(target / (base * (1 + 119 * rate)));
    return Math.round(base * linear * Math.exp(acceleration * Math.max(0, bounded - 25) / 95) * extension);
  };
  return {
    health: stat(boss ? 207.5 : 83, boss ? enemyGrowth.bossHealth : enemyGrowth.health, 0.45),
    damage: stat(boss ? 27.5 : 22, boss ? enemyGrowth.bossDamage : enemyGrowth.damage, 0.25),
    defense: stat(boss ? 16 / 3 : 4, boss ? enemyGrowth.bossDefense : enemyGrowth.defense, 0.3),
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
function enemySkills(level, boss, strike2, multiplier) {
  if (!Number.isInteger(level) || level < 1 || !strike2.trim() || !Number.isFinite(multiplier) || multiplier < 1) {
    throw new Error("Enemy skills require a valid level, name and damage multiplier.");
  }
  const first = { name: strike2, multiplier, every: boss ? 2 : 3, action: "skill1" };
  if (level < 50) return [first];
  return [first, {
    name: boss ? `Last Ruin: ${strike2}` : `Overdrive: ${strike2}`,
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
var roseMaterialUnlocks = [80, 90, 100, 110, 120, 130];
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
function isInfusionMode(value) {
  return [...infusionModes, ...currencyModes, ...eventModes, ...machineModes].some((entry) => entry.id === value);
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
function infusionEnemyLevel(stage) {
  if (!Number.isInteger(stage) || stage < 1 || stage > 35) throw new Error("Invalid infusion stage.");
  const nextIndex = infusionLevelAnchors.findIndex(([floor]) => floor >= stage);
  if (nextIndex === 0) return 50;
  const [start, level] = infusionLevelAnchors[nextIndex - 1];
  const [end, endLevel] = infusionLevelAnchors[nextIndex];
  return Math.round(level + (stage - start) / (end - start) * (endLevel - level));
}
function infusionEncounter(mode, stage, schedule = "caps") {
  const stages = infusionStageCount(mode);
  if (!isInfusionMode(mode) || !Number.isInteger(stage) || stage < 1 || stage > stages) throw new Error(`Infusion stage must be an integer from 1 to ${stages}.`);
  const tier = mode === "roses" ? roseFormStages.filter((first) => stage >= first).length - 1 : Math.min(5, Math.floor((stage - 1) * 6 / stages));
  const definition = [...infusionModes, ...currencyModes, ...eventModes, ...machineModes].find((entry) => entry.id === mode);
  if (!definition) throw new Error("Unknown staged Elemental-Devourer mode.");
  const startingLevel = definition.startingLevel;
  const level = mode === "heavens" || mode === "abyss" ? schedule === "legacy" ? Math.round(80 + (stage - 1) * 40 / 34) : infusionEnemyLevel(stage) : Math.round(startingLevel + (stage - 1) * ((mode === "roses" ? 140 : 120) - startingLevel) / (stages - 1));
  const boss = stage % 5 === 0;
  const stats2 = mode === "treasury" ? treasuryEnemyStats(level, boss) : mode === "sanctuary" ? sanctuaryEnemyStats(level, boss) : mode === "roses" ? roseEnemyStats(level, boss) : mode === "machines" ? creatureEnemyStats(level, boss) : infusionEnemyStats(level, boss);
  const [name, art] = infusionEnemies[mode][tier];
  return {
    name: definition.name,
    stage,
    level,
    boss,
    stats: stats2,
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
function levelCost(element, progress) {
  getElement(element);
  characterGrowthFactor(progress);
  if (progress.level === characterLevelCap(progress.evolution)) throw new Error("Reach the next evolution to raise the level cap.");
  const destination = progress.level + 1;
  return { fractalis: 10 + 2 * destination, materials: {
    [`${element}-common`]: Math.ceil(destination / 30),
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
  return { fractalis: cost.fractalis, materials: {
    [roseMaterials[0].id]: Math.ceil((progress.level + 1) / 30),
    ...progress.evolution >= 5 ? { [roseMaterials[5].id]: 1 } : {}
  } };
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
function isLegacyElement(value) {
  return legacyElementIds.some((id) => id === value);
}
function canonicalElement(value) {
  if (value === "oceanic" || value === "botanic") return value;
  if (!isLegacyElement(value)) throw new Error(`Unknown element: ${value}.`);
  return elementMigration[value];
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
function isPlayableDungeon(value) {
  return playableDungeons.some((element) => element === value);
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
  const stats2 = enemyCombatStats(level, boss);
  return {
    name: getElement(element).dungeon,
    level,
    stage,
    boss,
    stats: stats2,
    ...variant,
    color: elementAccents[element],
    background: art ? `${art.slug}.png` : null,
    abilityMultiplier: enemyAbilityMultiplier(level)
  };
}
var materialDropTable = [
  { rarity: "uncommon", level: 23, chance: 0.25, finalChance: 0.98, quantity: 3 },
  { rarity: "rare", level: 48, chance: 0.12, finalChance: 0.9, quantity: 3 },
  { rarity: "epic", level: 73, chance: 0.06, finalChance: 0.8, quantity: 3 },
  { rarity: "legendary", level: 98, chance: 0.025, finalChance: 0.6, quantity: 3 },
  { rarity: "omnic", level: 120, chance: 0.01, finalChance: 0.35, quantity: 3 }
];
function materialLoot(element, stage) {
  getElement(element);
  const level = elementalEnemyLevel(stage);
  const common = scaledDrop(level, 10, 10, 1, 1, 3);
  if (!common) throw new Error("Common material loot is missing.");
  const loot = [{ id: `${element}-common`, ...common }];
  for (const entry of materialDropTable) {
    const drop = scaledDrop(level, 10, entry.level, entry.chance, entry.finalChance, entry.quantity);
    if (drop) loot.push({ id: `${element}-${entry.rarity}`, ...drop });
  }
  return loot.map((drop) => bossLootRange(drop, bossLootMultiplier({ dungeon: { stage } })));
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
var storyRules = { regionStages: 25, stages: 150, startingLevel: 1, maximumLevel: 55 };
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
  if (!Number.isInteger(stage) || stage < 1 || stage > storyRules.stages) throw new Error("Story stage must be from 1 to 150.");
  const regionIndex = Math.floor((stage - 1) / storyRules.regionStages);
  const region = storyRegions[regionIndex];
  const regionStage = (stage - 1) % storyRules.regionStages + 1;
  const level = Math.round(storyRules.startingLevel + (stage - 1) * (storyRules.maximumLevel - storyRules.startingLevel) / (storyRules.stages - 1));
  const boss = regionStage === storyRules.regionStages;
  const stats2 = enemyCombatStats(level, boss);
  return {
    ...region,
    name: region.name,
    stage,
    regionIndex,
    regionStage,
    level,
    boss,
    stats: stats2,
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
var storyRulesText = `Six regions in a fixed order, 25 stages each, enemy levels 1-55. Enemy level and boss rank determine combat strength consistently across activities; higher-level enemies demand stronger Conduits and a reliable squad. Common and Uncommon matching-element materials only; no captures. Regional bosses grant a one-time account bonus, starting at 1,000 Prismatica and 50 Null-Prismatica and growing 15% per region. Base per-kill Prismatica rises in a straight line by enemy level: 5-10 at Lv.1, +2 minimum per level, 113-226 at Lv.55. Every regional boss multiplies ordinary Prismatica and material quantities by 5, including replays; first-clear bonuses do not multiply or repeat. Continue restores HP and retains Gauge. ${finalBossLootText}`;

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
  return result;
}
var creatures = catalog();
function getCreature(id) {
  const creature = creatures.find((entry) => entry.id === id);
  if (!creature) throw new Error(`Unknown glossary Elemental-Devourer: ${id}.`);
  return creature;
}

// src/game/character-instances.ts
function isCapturedInstanceId(value) {
  return typeof value === "string" && /^capture:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value);
}
function validateCapturedCharacters(value) {
  if (!Array.isArray(value)) throw new Error("Invalid saved captured Elemental-Devourers.");
  const seen = /* @__PURE__ */ new Set();
  return value.map((entry) => {
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
      if (!valid || entry.level < (copy.acquisition === "banner-duplicate" ? roseDuplicateMinimumLevel(creature.id) : expected.level)) throw new Error("Invalid retained enemy abilities or level.");
      copy.level = entry.level;
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
  const legacyLevel = creature.mode === "heavens" || creature.mode === "abyss" ? Math.round(80 + (stage - 1) * 40 / 34) : encounter2.level;
  return {
    level: copy.level ?? legacyLevel,
    stage,
    tier: encounter2.tier,
    skills: copy.skills ?? enemySkills(encounter2.level, encounter2.boss, encounter2.ability, encounter2.legacyAbilityMultiplier)
  };
}
function capturedLevelCost(copy) {
  const { level } = capturedProgress(copy);
  if (level >= 120) throw new Error("Maximum captured Elemental-Devourer level reached.");
  const creature = getCreature(copy.creatureId);
  return { fractalis: 10 + 2 * (level + 1), materials: { [creature.mode === "roses" ? roseMaterials[0].id : `${creature.element}-common`]: Math.ceil((level + 1) / 30) } };
}
function resolveCapturedFighter(copy, equipment, upgrades) {
  const creature = getCreature(copy.creatureId);
  if (!creature.mode || creature.mode === "machines") throw new Error("Captured Elemental-Devourer mode is missing or non-capturable.");
  const { level, tier, skills } = capturedProgress(copy);
  const reference = capturedEnemyStats(level, creature.mode === "roses" ? 140 : 120);
  const factor = 0.65 + 0.35 * tier / 5;
  const stats2 = {
    ...reference,
    health: reference.health * factor,
    damage: reference.damage * factor,
    defense: reference.defense * factor
  };
  const kit = {
    stats: stats2,
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
function validateCharacterLocks(value, owned) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error("Invalid saved character locks.");
  const locks = {};
  for (const [id, locked] of Object.entries(value)) {
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
  const stats2 = enemyCombatStats(level, true);
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
    stats: stats2,
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
    const value = random();
    if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error("Invalid Elemental War reward roll.");
    return value;
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
  if (unit.hp <= 0) return { shield: 0, defending: false, recoverThrough: 0, protection: 0 };
  return {
    shield: unit.shield,
    defending: unit.defending,
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
function gainResource(owner, key, events, roundKey, round) {
  if (!nativeOwner(owner)) return;
  const current = charges(owner);
  if (roundKey) {
    if (current[roundKey] === round) return;
    current[roundKey] = round;
  }
  if ((current[key] ?? 0) >= 3) return;
  current[key] = (current[key] ?? 0) + 1;
  const label = resourceLabel(key);
  status(events, owner, owner, `${owner.name} gains ${label} (${current[key]}/3).`, resourceEffect(owner));
}
function spendResource(actor, key, events) {
  if (!nativeOwner(actor)) return 0;
  const count2 = Math.min(3, Math.max(0, actor.pilot?.[key] ?? 0));
  if (count2 <= 0) return 0;
  charges(actor)[key] = 0;
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
  return spendResource(actor, rule.key, events) * (action === "ultimate" ? rule.ultimate ?? 0 : rule.ordinary);
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
    gainResource(owner, "bloom", events, "bloomRound", state.round);
  }
  if (owner.kit?.pilot === "rose-grace") gainResource(owner, "roseGrace", events, "roseGraceRound", state.round);
}
function pilotAuthoredShieldAbsorbed(state, sourceId, amount, events) {
  if (amount <= 0 || !sourceId) return;
  const owner = state.allies.find((ally) => ally.id === sourceId);
  if (!owner || !nativeOwner(owner)) return;
  if (owner.kit?.pilot === "ward") gainResource(owner, "ward", events, "wardRound", state.round);
  if (owner.kit?.pilot === "thorn-aegis") gainResource(owner, "thornAegis", events, "thornAegisRound", state.round);
}
function pilotBurnDamage(state, owner, amount, events) {
  if (amount <= 0 || !nativeOwner(owner)) return;
  if (owner.kit?.pilot === "ember") gainResource(owner, "ember", events, "emberRound", state.round);
  if (owner.kit?.pilot === "rose-duality") gainResource(owner, "duality", events, "dualityRound", state.round);
}
function pilotAfterDirectActivation(actor, action, events, effectiveCritical = false) {
  if (actor.kit?.pilot === "tempest" && effectiveCritical && (action === "light" || action === "skill1" || action === "skill2")) {
    gainResource(actor, "tempest", events);
  }
}

// src/game/kit-conduits.ts
var enemyRecipients = ["struck", "attacker", "all-enemies"];
function recipient(state, owner, target, choice = "self") {
  if (enemyRecipients.includes(choice) || choice === "all-allies") return void 0;
  if (choice === "self") return owner.hp > 0 ? owner : void 0;
  if (choice === "target") return target?.side === "ally" && target.hp > 0 ? target : void 0;
  const eligible = state.allies.filter((unit) => unit.hp > 0 && (choice === "injured" || unit.id !== owner.id));
  return eligible.sort((a, b) => choice === "lowest-gauge-other" ? a.shatter - b.shatter : a.hp / a.stats.health - b.hp / b.stats.health)[0];
}
function status2(events, owner, target, name, amount) {
  events.push({
    kind: "status",
    source: owner.id,
    target: target.id,
    amount,
    critical: false,
    message: `${owner.name}: ${name}.`,
    debuffs: debuffSnapshot(target),
    ...target.side === "ally" ? { buffs: buffSnapshot(target) } : {}
  });
}
function applyOutcome(state, owner, context, outcome, scale, name, events, resolved) {
  if (outcome.recipient === "all-allies" && !resolved) {
    let any = false;
    for (const ally of state.allies.filter((unit) => unit.hp > 0)) {
      any = applyOutcome(state, owner, context, outcome, scale, name, events, { target: ally }) || any;
    }
    return any;
  }
  if (outcome.kind === "strike") return strike(state, owner, context, outcome, scale, name, events);
  if (outcome.kind === "charge") {
    const resource = owner.kit?.pilot ? kitPilotDescriptions[owner.kit.pilot].resource : void 0;
    if (!resource || owner.captured) return false;
    const current = owner.pilot?.[resource.key] ?? 0;
    const next = Math.min(3, current + Math.round(outcome.amount * scale));
    if (next <= current) return false;
    owner.pilot = { ...owner.pilot, [resource.key]: next };
    status2(events, owner, owner, `${name} grants ${next - current} ${resource.label} (${next}/3)`, next - current);
    return true;
  }
  if (outcome.kind === "weaken-clock") {
    const enemy = context.target;
    if (!enemy || enemy.side !== "enemy" || enemy.hp <= 0 || enemy.weakened <= 0 || enemy.weakenSourceId !== owner.id) return false;
    const next = Math.min(3, enemy.weakened + outcome.amount);
    if (next <= enemy.weakened) return false;
    enemy.weakened = next;
    status2(events, owner, enemy, `${name} extends existing Weaken to ${next} enemy phases`, outcome.amount);
    return true;
  }
  const target = resolved ? resolved.target : recipient(state, owner, context.target, outcome.recipient);
  if (outcome.kind === "burn-clock") {
    const enemy = context.target;
    if (!enemy || enemy.hp <= 0 || enemy.burn.turns <= 0 || enemy.burn.sourceId !== owner.id) return false;
    const next = Math.min(3, enemy.burn.turns + outcome.amount);
    if (next <= enemy.burn.turns) return false;
    enemy.burn.turns = next;
    status2(events, owner, enemy, `${name} extends existing Burn to ${next} phases`, outcome.amount);
    return true;
  }
  if (outcome.kind === "fracture") {
    const enemy = context.target;
    if (!enemy || enemy.hp <= 0 || enemy.weakened <= 0 || enemy.weakenSourceId !== owner.id) return false;
    const marks = enemy.conduitMarks?.[owner.id] ?? 0;
    if (marks >= 2) return false;
    const gained = Math.min(2 - marks, outcome.amount);
    enemy.conduitMarks = { ...enemy.conduitMarks, [owner.id]: marks + gained };
    status2(events, owner, enemy, `${name} places ${gained} personal Fracture Mark${gained === 1 ? "" : "s"}`, gained);
    return true;
  }
  if (!target) return false;
  const triggerAmount = context.trigger === "resource-spent" ? (context.amount ?? 0) * owner.stats.health : context.hpDamage ?? context.amount ?? 0;
  if (outcome.kind === "heal" || outcome.kind === "shield") {
    const desired = Math.max(0, Math.round(Math.min(
      owner.stats.health * outcome.amount + triggerAmount * (outcome.ratio ?? 0),
      outcome.cap === void 0 ? Infinity : owner.stats.health * outcome.cap
    ) * scale));
    const amount = outcome.kind === "heal" ? Math.min(target.stats.health - target.hp, desired) : Math.max(0, desired - target.shield);
    if (amount <= 0) return false;
    if (outcome.kind === "heal") target.hp += amount;
    else {
      target.shield += amount;
      delete target.pilot?.authoredShieldSourceId;
    }
    events.push({
      kind: outcome.kind,
      source: owner.id,
      target: target.id,
      amount,
      critical: false,
      message: `${owner.name}: ${name} ${outcome.kind === "heal" ? "restores" : "wards"} ${target.name} for ${amount} (Conduit effect).`,
      buffs: buffSnapshot(target),
      ...outcome.kind === "shield" ? { shieldRemaining: target.shield } : {}
    });
    return true;
  }
  if (outcome.kind === "gauge") {
    const desired = (outcome.amount + (context.amount ?? 0) * (outcome.ratio ?? 0)) * scale;
    const amount = Math.min(target.stats.shatterCapacity - target.shatter, desired);
    if (amount <= 0) return false;
    target.shatter += amount;
    status2(events, owner, target, `${name} returns ${amount} Gauge to ${target.name}`, amount);
    return true;
  }
  if (outcome.kind === "cooldown") {
    const available = ["skill1", "skill2"].filter((action) => !!target.kit && !target.kit.unavailableActions?.includes(action) && target.readyRound[action] > state.round + 1).sort((a, b) => target.readyRound[b] - target.readyRound[a]);
    const selected = outcome.bothSkills ? available : available.slice(0, 1);
    if (!selected.length) return false;
    const rounds = Math.round(outcome.amount * scale);
    for (const action of selected) target.readyRound[action] = Math.max(state.round + 1, target.readyRound[action] - rounds);
    status2(events, owner, target, `${name} reindexes ${target.name}'s skill cooldown (never before next round)`, outcome.amount);
    return true;
  }
  if (outcome.kind === "boost") {
    const prior = target.attackBoost && target.attackBoost.throughRound >= state.round ? target.attackBoost.fraction : 0;
    const offered = Math.min(0.65, Math.round(outcome.amount * scale * 1e3) / 1e3);
    const fraction = Math.max(prior, offered);
    const throughRound = Math.max(target.attackBoost?.throughRound ?? 0, state.round + 1);
    if (prior === fraction && target.attackBoost?.throughRound === throughRound) return false;
    target.attackBoost = {
      fraction,
      throughRound,
      sourceId: prior > offered ? target.attackBoost?.sourceId : owner.id,
      origin: prior > offered ? target.attackBoost?.origin : "conduit"
    };
    status2(events, owner, target, `${name} lends ${formatStat(fraction * 100)}% Attack through next round`, fraction * 100);
    return true;
  }
  if (outcome.kind === "protection") {
    const amount = Math.min(0.6, Math.round(outcome.amount * scale * 1e3) / 1e3);
    if ((target.omnicProtection ?? 0) >= amount) return false;
    target.omnicProtection = amount;
    status2(events, owner, target, `${name} primes one ${formatStat(amount * 100)}% direct-hit protection`, amount * 100);
    return true;
  }
  return false;
}
function strike(state, owner, context, outcome, scale, name, events) {
  if (context.trigger === "defense") return false;
  const choice = outcome.recipient ?? "struck";
  const enemies2 = choice === "all-enemies" ? state.enemies.filter((unit) => unit.hp > 0) : [choice === "attacker" ? context.attacker : context.target].filter((unit) => !!unit && unit.side === "enemy" && unit.hp > 0);
  const echo = context.trigger === "resource-spent" ? 0 : (context.hpDamage ?? context.amount ?? 0) * (outcome.ratio ?? 0);
  let dealt = false;
  for (const enemy of enemies2) {
    const base = owner.stats.damage;
    const mitigation = base > 0 ? base / (base + enemy.stats.defense) : 0;
    const raw = base * outcome.amount * mitigation + echo;
    if (raw <= 0) continue;
    const amount = Math.max(1, Math.round(Math.min(raw, outcome.cap === void 0 ? Infinity : base * outcome.cap) * scale));
    const absorbed = Math.min(enemy.shield, amount);
    enemy.shield -= absorbed;
    const loss = Math.min(enemy.hp, amount - absorbed);
    enemy.hp -= loss;
    if (enemy.hp === 0) {
      delete enemy.conduitMarks;
      delete enemy.pilot;
    }
    events.push({
      kind: "damage",
      source: owner.id,
      target: enemy.id,
      amount: loss,
      critical: false,
      message: `${enemy.name}: ${formatStat(loss)} damage from ${name} (Conduit strike)${absorbed ? `, ${formatStat(absorbed)} shield absorbed` : ""}${enemy.hp === 0 ? " - defeated" : ""}.`,
      shieldRemaining: enemy.shield,
      debuffs: debuffSnapshot(enemy)
    });
    dealt = true;
  }
  return dealt;
}
function qualifies(owner, rule, context) {
  return (!rule.actions || !!context.action && rule.actions.includes(context.action)) && (!rule.other || !!context.target && context.target.id !== owner.id) && (!rule.belowHalf || !!context.target && (context.beforeHp ?? context.target.hp) <= context.target.stats.health / 2) && (!rule.ownBurn || context.ownBurn === true) && (!rule.ownWeaken || context.ownWeaken === true) && (!rule.lethal || context.lethal === true) && (!rule.selfBelowHalf || owner.hp <= owner.stats.health / 2) && (!rule.resources || !!context.resource && rule.resources.includes(context.resource));
}
function resolveOmnicInteraction(state, owner, context, events) {
  if (owner.side !== "ally" || owner.hp <= 0 || context.trigger !== "defense" && (context.amount ?? 0) <= 0) return;
  const interactions = [];
  for (const id of owner.conduits ?? []) {
    if (id) {
      const conduit = getConduit(id);
      if ("kitEffects" in conduit) interactions.push({ id, name: conduit.name, rule: conduit.kitEffects.rule });
    }
  }
  if (owner.masterConduit) {
    if (owner.captured) throw new Error("Captured Elemental-Devourers cannot equip character Master Conduits.");
    validateMasterCharacter(owner.masterConduit, owner.definitionId);
    interactions.push(getMasterConduit(owner.masterConduit));
  }
  for (const conduit of interactions) {
    const { id, rule } = conduit;
    const isMaster = owner.masterConduit === id;
    const memory = owner.omnicMemory?.[id] ?? {};
    const remember = () => {
      (owner.omnicMemory ??= {})[id] = memory;
    };
    if (rule.bank?.trigger === context.trigger && (!rule.bank.other || !!context.target && context.target.id !== owner.id) && (isMaster || memory.bankRound !== state.round)) {
      if ((memory.bank ?? 0) < rule.bank.maximum) {
        memory.bank = Math.min(rule.bank.maximum, (memory.bank ?? 0) + 1);
        if (!isMaster) memory.bankRound = state.round;
        remember();
        status2(events, owner, owner, `${conduit.name} stores ${owner.masterConduit === id ? "Astral Reserve" : "a reserve"} (${memory.bank}/${rule.bank.maximum})`, memory.bank);
      }
    }
    if (rule.trigger !== context.trigger || !isMaster && memory.usedRound === state.round || !qualifies(owner, rule, context)) continue;
    const scale = rule.bank ? Math.min(rule.bank.maximum, Math.max(0, memory.bank ?? 0)) : 1;
    if (scale <= 0) continue;
    let effective = false;
    const selected = /* @__PURE__ */ new Map();
    if (owner.masterConduit === id) {
      for (const outcome of rule.outcomes) {
        const choice = outcome.recipient ?? "self";
        if (choice === "all-allies" || enemyRecipients.includes(choice)) continue;
        if (!selected.has(choice)) selected.set(choice, { target: recipient(state, owner, context.target, choice) });
      }
    }
    for (const outcome of rule.outcomes) effective = applyOutcome(
      state,
      owner,
      context,
      outcome,
      scale,
      conduit.name,
      events,
      selected.get(outcome.recipient ?? "self")
    ) || effective;
    if (effective) {
      if (!isMaster) memory.usedRound = state.round;
      if (rule.bank) memory.bank = 0;
      remember();
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
  return state;
}
function createWarBattle(character, stage, seed, starter, progress, roster = [starter], teamProgress = { [starter]: progress }, equipment = {}, captures = [], upgrades = {}) {
  const encounter2 = warEncounter(character, stage);
  const state = createBattle(seed, roster, teamProgress, equipment, captures, upgrades);
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
  state.lycalisSeed = (seed ^ 2692095333) >>> 0 || 1;
  state.recruitmentSeed = (seed ^ 3875765969) >>> 0 || 1;
  return state;
}
function warRewardRoll(state, key) {
  const value = state[key];
  if (value === void 0 || value === 0) throw new Error("Elemental War reward stream is missing.");
  let seed = value;
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  state[key] = seed >>> 0;
  return state[key] / 4294967296;
}
function combatant(id, definitionId, name, side, stats2, element) {
  return {
    id,
    definitionId,
    name,
    element,
    side,
    level: null,
    stats: { ...stats2 },
    hp: stats2.health,
    shield: 0,
    shatter: shatterGauge.starting,
    spent: false,
    recoverThrough: 0,
    readyRound: { skill1: 1, skill2: 1 },
    burn: { damage: 0, turns: 0 },
    weakened: 0,
    weakenFraction: 0.25,
    kit: null,
    defending: false
  };
}
function spawnWave(wave) {
  const level = Math.min(wave, enemyGrowth.maximumLevel);
  return ["goblin", "imp", "golem"].map((id, index) => {
    const definition = enemies[id];
    const unit = combatant(`enemy-${wave}-${index}`, id, definition.name, "enemy", enemyCombatStats(level, false), definition.element);
    unit.level = level;
    unit.creatureId = `adventure:${id}`;
    const strike2 = id === "goblin" ? "Wildwood Ambush" : id === "imp" ? "Cinder Mischief" : "Faultline Crush";
    unit.enemySkills = enemySkills(level, false, strike2, enemyAbilityMultiplier(level));
    return unit;
  });
}
function createBattle(seed = 1729, roster = ["ember"], progress = {}, equipment = {}, captures = [], upgrades = {}) {
  if (!Number.isInteger(seed) || seed < 1 || seed > 4294967295) throw new Error("Battle seed must be a nonzero uint32.");
  if (!roster.length || roster.length > 3 || new Set(roster).size !== roster.length || !roster.every((id) => isStarterId(id) || captures.some((copy) => copy.instanceId === id))) {
    throw new Error("Battle roster requires distinct valid starters.");
  }
  const snapshot = validateConduitUpgrades(upgrades);
  return {
    wave: 1,
    round: 1,
    phase: "player",
    seed,
    rewardSeed: seed,
    captureSeed: seed,
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
      unit.level = progress[id]?.level ?? null;
      unit.evolution = progress[id]?.evolution ?? 1;
      if (equipment[id]) unit.conduits = [...equipment[id]];
      return unit;
    }),
    enemies: spawnWave(1)
  };
}
function createDungeonBattle(element, stage, seed, starter, progress, roster = [starter], teamProgress = { [starter]: progress }, equipment = {}, captures = [], upgrades = {}, encounterSeed) {
  const state = createBattle(seed, roster, teamProgress, equipment, captures, upgrades);
  let familySeed = encounterSeed ?? ((seed ^ 2654435769) >>> 0 || 1);
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
function createStoryBattle(stage, seed, starter, progress, roster = [starter], teamProgress = { [starter]: progress }, equipment = {}, captures = [], upgrades = {}, encounterSeed) {
  const encounter2 = storyEncounter(stage);
  const state = createBattle(seed, roster, teamProgress, equipment, captures, upgrades);
  let familySeed = encounterSeed ?? ((seed ^ 2654435769) >>> 0 || 1);
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
  let seed = state.seed;
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  state.seed = seed >>> 0;
  return state.seed / 4294967296;
}
function createInfusionBattle(mode, stage, seed, starter, progress, roster = [starter], teamProgress = { [starter]: progress }, equipment = {}, captures = [], upgrades = {}, schedule = "caps") {
  const encounter2 = infusionEncounter(mode, stage, schedule);
  const state = createBattle(seed, roster, teamProgress, equipment, captures, upgrades);
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
  if (action !== "light" && action !== "defend" && actor.kit?.unavailableActions?.includes(action)) return "This captured form does not have this ability.";
  if (actor.hp <= 0) return "This character is defeated.";
  if (actor.spent) return "This character has already acted this turn.";
  if (actor.recoverThrough >= state.round) return "Recovering this turn after Last Flare.";
  if (action === "ultimate" && (actor.readyRound.ultimate ?? 0) > state.round) return `Ready on turn ${actor.readyRound.ultimate}.`;
  const gaugeCost = actionGaugeCost(actor, action);
  if (actor.shatter < gaugeCost) return `Requires ${gaugeCost} Shatter Gauge.`;
  return null;
}
function actionGaugeCost(actor, action) {
  const cost = shatterGauge.costs[action];
  return (action === "skill1" || action === "skill2") && actor.conduitCharges?.skythread && hasMechanic(actor, "skythread") ? Math.max(1, cost - 5) : cost;
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
function hurt(target, amount, source, events, critical = false, periodic = false, conduitReduction = 0, elementalCritical = false) {
  if (conduitReduction > 0) amount = Math.max(1, Math.round(amount * (1 - conduitReduction)));
  if (target.defending) amount = Math.max(1, Math.round(amount * (1 - Math.min(
    0.5,
    defenseMode.damageReduction
  ))));
  const absorbed = Math.min(target.shield, amount);
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
function gainShatter(target, amount, events) {
  const gained = Math.min(target.stats.shatterCapacity - target.shatter, amount);
  if (gained <= 0) return;
  target.shatter += gained;
  event(events, "status", target, target, gained, `${target.name} gains ${formatStat(gained)} Shatter Gauge (${formatStat(target.shatter)} / ${formatStat(target.stats.shatterCapacity)}).`);
}
function healTeam(state, source, amount, events, percent = false) {
  for (const ally of state.allies.filter((unit) => unit.hp > 0)) {
    const restored = Math.min(ally.stats.health - ally.hp, percent ? Math.max(1, Math.round(ally.stats.health * amount)) : amount);
    if (restored <= 0) continue;
    const beforeHp = ally.hp;
    ally.hp += restored;
    event(events, "heal", source, ally, restored, `${source.name} restores ${formatStat(restored)} health to ${ally.name}.`);
    pilotEffectiveHeal(state, source, ally, restored, events);
    resolveOmnicInteraction(state, source, { trigger: "heal", target: ally, amount: restored, beforeHp }, events);
    resolveOmnicInteraction(state, source, { trigger: "support", target: ally, amount: restored }, events);
    if (source.id !== ally.id && hasMechanic(source, "verdant-covenant")) {
      ally.conduitCharges = { ...ally.conduitCharges, verdantNormal: true };
      event(events, "status", source, ally, 10, `${ally.name}'s next Normal Attack gains +10% outgoing damage (refresh; does not stack).`);
    }
  }
}
function shieldTeam(state, source, amount, events, authored = true) {
  for (const ally of state.allies.filter((unit) => unit.hp > 0)) {
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
      resolveOmnicInteraction(state, source, { trigger: "shield-grown", target: ally, amount: gained }, events);
      resolveOmnicInteraction(state, source, { trigger: "support", target: ally, amount: gained }, events);
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
      let seed = state.rewardSeed;
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      state.rewardSeed = seed >>> 0;
      return state.rewardSeed / 4294967296;
    };
    if (enemy.level === null) throw new Error("Enemy reward level is missing.");
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
      state.story ? storyFractalisDrop(enemy.level) : state.infusion?.mode === "treasury" ? treasuryFractalisDrop(enemy.level) : fractalisDrop(enemy.level, state.infusion?.mode === "roses" ? 140 : 120),
      bossLootMultiplier(state, enemy.boss === true)
    ), rewardRoll);
    if (amount === void 0) throw new Error("Guaranteed Prismatica reward did not drop.");
    const materials = state.story ? storyDrops(state.story.storyStage, rewardRoll) : state.infusion ? infusionDrops(state.infusion.mode, state.infusion.stage, rewardRoll, state.infusion.schedule ?? "legacy") : state.dungeon ? materialDrops(state.dungeon.element, state.dungeon.stage, rewardRoll) : void 0;
    const materialText = materials ? Object.entries(materials).map(([id, quantity]) => `${quantity} ${materialName(id)}`).join(", ") : "";
    let capture;
    let lycalis = 0;
    const mechanicalComponents2 = state.infusion?.mode === "machines" ? rollMachineComponents(state.infusion.stage, () => {
      let seed = state.componentSeed ?? ((previous.rewardSeed ^ 1821285621) >>> 0 || 1);
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      state.componentSeed = seed >>> 0;
      return state.componentSeed / 4294967296;
    }) : 0;
    const conduits2 = state.infusion?.mode === "machines" ? machineConduitDrops(state.infusion.stage, () => {
      let seed = state.conduitSeed ?? ((previous.rewardSeed ^ 2769414579) >>> 0 || 1);
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      state.conduitSeed = seed >>> 0;
      return state.conduitSeed / 4294967296;
    }) : void 0;
    const masterChests = state.infusion?.mode === "machines" ? masterChestDrops(state.infusion.stage, enemy.boss === true, () => {
      let seed = state.masterChestSeed ?? ((previous.rewardSeed ^ 2135587861) >>> 0 || 1);
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      state.masterChestSeed = seed >>> 0;
      return state.masterChestSeed / 4294967296;
    }) : 0;
    if (state.infusion && state.infusion.mode !== "machines" && enemy.creatureId) {
      let seed = state.captureSeed ?? state.seed;
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      state.captureSeed = seed >>> 0;
      if ((state.infusion.mode !== "roses" || roseCaptureAllowed(enemy.level)) && captureSucceeds(state.captureSeed / 4294967296)) capture = { creatureId: enemy.creatureId, level: enemy.level };
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
function captureSucceeds(value) {
  if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error("Capture roll must be in [0, 1).");
  return value < 0.2;
}
function hasMechanic(unit, mechanic) {
  return unit.conduits?.some((id) => id !== null && getConduit(id).mechanic === mechanic) ?? false;
}
function conduitShield(actor, fraction, events) {
  const amount = Math.round(actor.stats.health * fraction);
  const gained = Math.max(0, amount - actor.shield);
  if (gained > 0) delete actor.pilot?.authoredShieldSourceId;
  actor.shield = Math.max(actor.shield, amount);
  if (gained > 0) event(events, "shield", actor, actor, gained, `${actor.name}'s Conduit grants ${formatStat(gained)} shield.`);
}
function conduitHeal(actor, fraction, events) {
  const restored = Math.min(actor.stats.health - actor.hp, Math.round(actor.stats.health * fraction));
  if (actor.hp <= 0 || restored <= 0) return;
  actor.hp += restored;
  event(events, "heal", actor, actor, restored, `${actor.name}'s Conduit restores ${formatStat(restored)} health.`);
}
function chargeConduit(actor, key, events, effect) {
  actor.conduitCharges = { ...actor.conduitCharges, [key]: true };
  event(events, "status", actor, actor, 0, `${actor.name}: ${effect} (refresh; does not stack).`);
}
function primeConduitCharge(actor, key, events, effect) {
  actor.conduitCharges = { ...actor.conduitCharges, [key]: true };
  event(events, "status", actor, actor, 0, `${actor.name}: ${effect} (refresh; does not stack).`);
}
function act(previous, actorId, action, targetId) {
  if (!isActionId(action)) throw new Error("Unknown combat action.");
  const original = previous.allies.find((unit) => unit.id === actorId);
  if (!original) throw new Error("Unknown team member.");
  const reason = actionUnavailable(previous, original, action);
  if (reason) throw new Error(reason);
  const support = action === "defend" || action !== "light" && original.kit?.abilities[action].targets === "all-allies" || action === "skill2" && (original.definitionId === "tide" || original.definitionId === "sprout") && !original.captured;
  if (!support && !previous.enemies.some((enemy) => enemy.id === targetId && enemy.hp > 0)) {
    throw new Error("Choose a living enemy target.");
  }
  const state = structuredClone(previous);
  const actor = state.allies.find((unit) => unit.id === actorId);
  if (!actor) throw new Error("Team state is inconsistent.");
  const definition = actor.kit;
  if (!definition) throw new Error("Ally combat kit is missing.");
  const strength = action === "light" || action === "defend" ? null : definition.abilities[action].strength;
  const events = [];
  const name = action === "light" || action === "defend" ? basicActionName(actor.definitionId, action) : definition.abilities[action].name;
  if (action === "defend") {
    actor.spent = true;
    actor.defending = true;
    const defenseReduction = defenseMode.damageReduction;
    event(events, "status", actor, actor, defenseReduction * 100, `${actor.name} enters ${name}: incoming ${defenseReduction > defenseMode.damageReduction ? "direct " : ""}damage reduced by ${formatStat(defenseReduction * 100)}% until the next player turn.`);
    if (hasMechanic(actor, "defense-ward")) conduitShield(actor, 0.1, events);
    if (hasMechanic(actor, "defense-heal")) conduitHeal(actor, 0.05, events);
    if (hasMechanic(actor, "faultkeeper-ward")) primeConduitCharge(actor, "faultkeeperWard", events, "the next direct enemy hit deals 15% less damage");
    if (hasMechanic(actor, "stillhour")) primeConduitCharge(actor, "stillhour", events, "the first direct enemy hit you survive grants 8 Shatter Gauge");
    if (hasMechanic(actor, "skythread")) primeConduitCharge(actor, "skythread", events, "your next ordinary skill costs 5 less Shatter Gauge");
    resolveOmnicInteraction(state, actor, { trigger: "defense", action }, events);
    return { state, events };
  }
  events.push({ kind: "attack", source: actor.id, target: support ? actor.id : targetId, amount: 0, critical: false, message: `${actor.name} uses ${name}.`, action, abilityName: name });
  actor.spent = true;
  if (action === "ultimate") actor.recoverThrough = state.round + 1;
  actor.shatter -= actionGaugeCost(actor, action);
  gainShatter(actor, shatterGauge.gains[action] + (action === "light" ? definition.passive.lightGaugeBonus ?? 0 : 0), events);
  if (action === "skill1" || action === "skill2") actor.readyRound[action] = state.round;
  if (action === "ultimate" && actor.captured) actor.readyRound.ultimate = state.round + definition.abilities.ultimate.cooldown;
  const stormstepBonus = action === "skill1" && actor.conduitCharges?.stormstepSkill1 || action === "skill2" && actor.conduitCharges?.stormstepSkill2 ? 0.1 : 0;
  if (action === "skill1") delete actor.conduitCharges?.stormstepSkill1;
  if (action === "skill2") delete actor.conduitCharges?.stormstepSkill2;
  if (action === "skill1" || action === "skill2") delete actor.conduitCharges?.skythread;
  const priorResources = { ...actor.pilot };
  const starterBonus = pilotPrepareStarter(actor, action, events);
  let hitWeakenedEnemy = false;
  let effectiveDirectDamage = false;
  let effectiveCriticalDamage = false;
  if (!support) {
    const pilotBonus = pilotOutgoingBonus(actor, action, events) + starterBonus.damage;
    const emberBonus = action !== "light" ? 0.05 * (actor.conduitCharges?.emberSeals ?? 0) : 0;
    const paradoxBonus = actor.conduitCharges?.paradox ? 0.15 : 0;
    const verdantBonus = action === "light" && actor.conduitCharges?.verdantNormal ? 0.1 : 0;
    const dawnWitnessCharges = actor.conduitCharges?.dawnWitness ?? 0;
    const critBonus = (actor.conduitCharges?.burnFocus ? 0.05 : 0) + 0.03 * dawnWitnessCharges;
    const pierce = actor.conduitCharges?.weakenPierce ? 0.2 : 0;
    const momentum = action !== "light" && actor.conduitCharges?.normalMomentum ? 0.1 : 0;
    if (actor.conduitCharges) {
      delete actor.conduitCharges.burnFocus;
      delete actor.conduitCharges.weakenPierce;
      if (action !== "light") delete actor.conduitCharges.normalMomentum;
      if (action === "light") delete actor.conduitCharges.verdantNormal;
      delete actor.conduitCharges.paradox;
      if (action !== "light") delete actor.conduitCharges.emberSeals;
      delete actor.conduitCharges.dawnWitness;
    }
    const all = !actor.captured && (action === "ultimate" || action === "skill2" && actor.definitionId === "ember" || action !== "light" && definition.abilities[action].targets === "all-enemies");
    const targets = state.enemies.filter((enemy) => enemy.hp > 0 && (all || enemy.id === targetId));
    let multiplier = 1;
    if (strength) {
      if (strength.damageMultiplier === void 0) throw new Error("Attack skill damage multiplier is missing.");
      multiplier = strength.damageMultiplier;
    }
    if (actor.hp <= actor.stats.health / 2) multiplier *= 1 + definition.passive.damageBonus;
    if (actor.attackBoost && actor.attackBoost.throughRound >= state.round) multiplier *= 1 + actor.attackBoost.fraction;
    const additiveOutgoingBonus = momentum + emberBonus + stormstepBonus + paradoxBonus + verdantBonus + pilotBonus;
    hitWeakenedEnemy = (action === "skill1" || action === "skill2") && targets.some((target) => target.weakened > 0);
    let burned = false;
    let weakened = false;
    let hitCritical = false;
    for (const target of targets) {
      const { critical, elemental } = rollCritical(state, actor.stats.crit + (strength?.critBonus ?? 0) + critBonus);
      hitCritical ||= critical;
      const marks = action === "light" ? target.conduitMarks?.[actor.id] ?? 0 : 0;
      if (marks && target.conduitMarks) {
        delete target.conduitMarks[actor.id];
        if (!Object.keys(target.conduitMarks).length) delete target.conduitMarks;
      }
      const criticalMultiplier = actor.stats.critMultiplier * (elemental ? elementalCritFactor : 1);
      const priorShield = target.shield;
      const priorBurnTurns = target.burn.turns;
      const ownBurn = target.burn.turns > 0 && target.burn.sourceId === actor.id;
      const ownWeaken = target.weakened > 0 && target.weakenSourceId === actor.id;
      hurt(target, damageAmount(
        actor.stats.damage,
        multiplier * (1 + additiveOutgoingBonus) * (1 + marks * 0.08),
        target.stats.defense * (1 - Math.min(0.75, pierce)),
        critical,
        criticalMultiplier
      ), actor, events, critical, false, 0, elemental);
      const hpDamage = events[events.length - 1].amount;
      effectiveDirectDamage ||= events[events.length - 1].amount > 0;
      const effectiveHit = events[events.length - 1].amount > 0 || priorShield > target.shield;
      effectiveCriticalDamage ||= critical && effectiveHit;
      const actualDamage = hpDamage + priorShield - target.shield;
      resolveOmnicInteraction(state, actor, { trigger: "direct", action, target, amount: actualDamage, hpDamage, ownBurn, ownWeaken, lethal: target.hp === 0 }, events);
      if (critical) resolveOmnicInteraction(state, actor, { trigger: "critical", action, target, amount: actualDamage, hpDamage }, events);
      if (marks && effectiveHit) resolveOmnicInteraction(state, actor, { trigger: "fracture-spent", action, target, amount: marks }, events);
      if (marks) event(events, "status", actor, target, 0, `${target.name} loses ${marks} Fracture Mark${marks === 1 ? "" : "s"} from ${actor.name}.`);
      if (target.hp > 0 && strength?.burnMultiplier !== void 0) {
        const damage = Math.round(actor.stats.elementalDamage * strength.burnMultiplier);
        const previousBurn = { ...target.burn };
        const clockExtension = Math.max(0, target.burn.turns - priorBurnTurns);
        target.burn = { damage, turns: Math.min(3, 2 + clockExtension), sourceId: actor.id, origin: actor.kit?.pilot === "rose-duality" ? "rose" : "native" };
        event(events, "status", actor, target, damage, `${target.name} burns for ${target.burn.turns === 2 ? "two" : "three"} enemy phases.`);
        if (damage > 0 && (previousBurn.sourceId !== actor.id || previousBurn.damage < damage || previousBurn.turns < 2)) {
          resolveOmnicInteraction(state, actor, { trigger: "burn-applied", action, target, amount: damage }, events);
        }
        burned = true;
      }
      if (target.hp > 0 && strength?.weakenFraction !== void 0) {
        const previousWeaken = { turns: target.weakened, fraction: target.weakenFraction, source: target.weakenSourceId };
        target.weakened = 2;
        target.weakenSourceId = actor.id;
        target.weakenOrigin = actor.kit?.pilot === "rose-grace" || actor.kit?.pilot === "thorn-aegis" || actor.kit?.pilot === "rose-duality" ? "rose" : "native";
        const weakenBonus = starterBonus.weaken;
        target.weakenFraction = weakenBonus > 0 ? Math.min(0.6, strength.weakenFraction + weakenBonus) : strength.weakenFraction;
        event(events, "status", actor, target, 0, `${target.name} is weakened for two enemy phases.`);
        if (target.weakenFraction > 0 && (previousWeaken.source !== actor.id || previousWeaken.turns < 2 || previousWeaken.fraction < target.weakenFraction)) {
          resolveOmnicInteraction(state, actor, { trigger: "weaken-applied", action, target, amount: target.weakenFraction }, events);
        }
        weakened = true;
      }
      if (target.hp > 0 && action !== "light" && hasMechanic(actor, "nightglass")) {
        const priorMarks = target.conduitMarks?.[actor.id] ?? 0;
        if (priorMarks < 2) {
          target.conduitMarks = { ...target.conduitMarks, [actor.id]: priorMarks + 1 };
          event(events, "status", actor, target, priorMarks + 1, `${target.name} gains a Fracture Mark from ${actor.name} (${priorMarks + 1}/2).`);
        }
      }
    }
    if (burned && hasMechanic(actor, "burn-focus")) chargeConduit(actor, "burnFocus", events, "next offensive activation gains +5 percentage points Critical Rate");
    if (weakened && hasMechanic(actor, "weaken-pierce")) chargeConduit(actor, "weakenPierce", events, "next offensive activation ignores 20% Defense");
    if (action === "light" && hasMechanic(actor, "normal-momentum")) chargeConduit(actor, "normalMomentum", events, "next offensive skill gains +10% outgoing damage");
    if (hitCritical && hasMechanic(actor, "critical-gauge")) gainShatter(actor, 5, events);
    if (action === "light" && hasMechanic(actor, "dawn-witness")) {
      if (hitCritical) {
        if (actor.conduitCharges) delete actor.conduitCharges.dawnWitness;
      } else {
        const charges2 = Math.min(3, dawnWitnessCharges + 1);
        actor.conduitCharges = { ...actor.conduitCharges, dawnWitness: charges2 };
        event(
          events,
          "status",
          actor,
          actor,
          charges2 * 3,
          `${actor.name} gains Dawn Witness (+${charges2 * 3} percentage points Critical Rate on the next offensive activation; maximum three charges).`
        );
      }
    }
    if ((action === "skill1" || action === "skill2") && hitWeakenedEnemy && hasMechanic(actor, "undertide-cooldown") && actor.conduitCharges?.undertideUsedRound !== state.round) {
      actor.conduitCharges = { ...actor.conduitCharges, undertideUsedRound: state.round };
      const otherSkill = action === "skill1" ? "skill2" : "skill1";
      if (actor.readyRound[otherSkill] > state.round) {
        actor.readyRound[otherSkill] = Math.max(state.round, actor.readyRound[otherSkill] - 1);
        event(events, "status", actor, actor, 1, `${actor.name}'s ${otherSkill === "skill1" ? "Skill 1" : "Skill 2"} cooldown is reduced by one turn.`);
      }
    }
  }
  for (const resource of ["ember", "bloom", "tempest", "thornAegis", "duality"]) {
    const spent = (priorResources[resource] ?? 0) - (actor.pilot?.[resource] ?? 0);
    if (!actor.captured && spent > 0) resolveOmnicInteraction(state, actor, { trigger: "resource-spent", action, resource, amount: Math.min(3, spent) }, events);
  }
  pilotAfterDirectActivation(actor, action, events, effectiveCriticalDamage);
  if ((action === "skill1" || action === "skill2") && hasMechanic(actor, "stormstep")) {
    primeConduitCharge(
      actor,
      action === "skill1" ? "stormstepSkill2" : "stormstepSkill1",
      events,
      `the next ${action === "skill1" ? "Skill 2" : "Skill 1"} gains +10% outgoing damage`
    );
  }
  if (strength?.shield !== void 0 || starterBonus.shield > 0) {
    shieldTeam(state, actor, (strength?.shield ?? 0) + starterBonus.shield, events);
  }
  if (strength?.healing !== void 0) {
    healTeam(state, actor, strength.healing * starterBonus.healing, events);
  }
  if (strength?.attackBoostFraction !== void 0) {
    for (const ally of state.allies.filter((unit) => unit.hp > 0)) {
      const prior = ally.attackBoost && ally.attackBoost.throughRound >= state.round ? ally.attackBoost.fraction : 0;
      const fraction = Math.min(0.65, strength.attackBoostFraction);
      const previousSourceId = ally.attackBoost && ally.attackBoost.throughRound >= state.round ? ally.attackBoost.sourceId : void 0;
      const sourceId = fraction >= prior ? actor.id : previousSourceId;
      ally.attackBoost = {
        fraction: Math.max(prior, fraction),
        throughRound: state.round + 1,
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
      if (fraction > prior) resolveOmnicInteraction(state, actor, { trigger: "support", action, target: ally, amount: fraction - prior }, events);
    }
  }
  if (hasMechanic(actor, "shield-heal") && events.some((entry) => entry.kind === "shield" && entry.source === actor.id && entry.amount > 0)) conduitHeal(actor, 0.05, events);
  if (hasMechanic(actor, "defeat-gauge") && events.some((entry) => entry.kind === "damage" && entry.source === actor.id && state.enemies.some((enemy) => enemy.id === entry.target && enemy.hp === 0))) gainShatter(actor, 5, events);
  if (action === "ultimate" && hasMechanic(actor, "ultimate-ward")) conduitShield(actor, 0.15, events);
  if (action === "ultimate" && hasMechanic(actor, "paradox")) primeConduitCharge(
    actor,
    "paradox",
    events,
    "your first offensive activation after normal recovery gains +15% outgoing damage"
  );
  resolveOmnicInteraction(state, actor, {
    trigger: "activation",
    action,
    amount: 1,
    target: support ? void 0 : state.enemies.find((enemy) => enemy.id === targetId)
  }, events);
  checkOutcome(state);
  awardDefeats(previous, state, events);
  return { state, events };
}
function newTurn(state, events) {
  state.round++;
  for (const ally of state.allies) {
    ally.spent = false;
    ally.defending = false;
    if (ally.attackBoost && ally.attackBoost.throughRound < state.round) delete ally.attackBoost;
    if (hasMechanic(ally, "renewal")) conduitHeal(ally, 0.02, events);
  }
  for (const ally of state.allies.filter((unit) => unit.hp > 0 && (unit.kit?.passive.healFraction ?? 0) > 0)) {
    if (!ally.kit) throw new Error("Passive combat kit is missing.");
    healTeam(state, ally, ally.kit.passive.healFraction, events, true);
  }
  events.push({ kind: "turn", source: "", target: "", amount: state.round, critical: false, message: `Turn ${state.round}. Only Last Flare forces next-turn recovery.` });
}
function endTurn(previous) {
  if (previous.phase !== "player") throw new Error("There is no active player turn.");
  const state = structuredClone(previous);
  const events = [];
  for (const enemy of state.enemies) {
    if (enemy.hp <= 0) continue;
    if (enemy.burn.turns > 0) {
      enemy.burn.turns--;
      const source = state.allies.find((unit) => unit.id === (enemy.burn.sourceId ?? "ember"));
      if (!source) throw new Error("Burn source is missing.");
      const priorHp = enemy.hp;
      hurt(enemy, enemy.burn.damage, source, events, false, true);
      pilotBurnDamage(state, source, priorHp - enemy.hp, events);
      resolveOmnicInteraction(state, source, { trigger: "burn-tick", target: enemy, amount: priorHp - enemy.hp, lethal: enemy.hp === 0 }, events);
      if (enemy.hp < priorHp && source.hp > 0 && hasMechanic(source, "ember-seals") && source.conduitCharges?.emberSealRound !== state.round && (source.conduitCharges?.emberSeals ?? 0) < 3) {
        const seals = (source.conduitCharges?.emberSeals ?? 0) + 1;
        source.conduitCharges = { ...source.conduitCharges, emberSeals: seals, emberSealRound: state.round };
        event(events, "status", source, source, seals, `${source.name} gains an Ember Seal (${seals}/3; at most one per enemy phase).`);
      }
    }
    if (enemy.hp <= 0) continue;
    const living = state.allies.filter((unit) => unit.hp > 0);
    if (!living.length) break;
    const target = living[Math.floor(roll(state) * living.length)];
    const critical = roll(state) < enemy.stats.crit;
    const ability = scheduledEnemySkill(enemy.enemySkills ?? [], state.round);
    events.push({
      kind: "attack",
      source: enemy.id,
      target: target.id,
      amount: 0,
      critical: false,
      message: ability ? `${enemy.name} uses ${ability.name} on ${target.name}.` : `${enemy.name} attacks ${target.name}.`,
      action: ability?.action ?? "light",
      enhancedAttack: !!ability,
      abilityName: ability?.name
    });
    const multiplier = (ability?.multiplier ?? 1) * (enemy.weakened > 0 ? 1 - enemy.weakenFraction : 1);
    const faultkeeperWard = target.conduitCharges?.faultkeeperWard === true;
    if (faultkeeperWard && target.conduitCharges) {
      delete target.conduitCharges.faultkeeperWard;
      event(events, "status", target, target, 15, `${target.name}'s Faultkeeper ward reduces this direct hit by 15%.`);
    }
    const priorShield = target.shield;
    const shieldSourceId = target.pilot?.authoredShieldSourceId;
    const omnicProtection = target.omnicProtection ?? 0;
    delete target.omnicProtection;
    hurt(
      target,
      damageAmount(enemy.stats.damage, multiplier, target.stats.defense, critical, enemy.stats.critMultiplier),
      enemy,
      events,
      critical,
      false,
      omnicProtection > 0 ? 1 - (1 - (faultkeeperWard ? 0.15 : 0)) * (1 - omnicProtection) : faultkeeperWard ? 0.15 : 0
    );
    pilotAuthoredShieldAbsorbed(state, shieldSourceId, priorShield - target.shield, events);
    const shieldOwner = state.allies.find((ally) => ally.id === shieldSourceId);
    if (shieldOwner) resolveOmnicInteraction(state, shieldOwner, { trigger: "shield-absorbed", target, attacker: enemy, amount: priorShield - target.shield }, events);
    if (target.hp > 0 && target.conduitCharges?.stillhour) {
      delete target.conduitCharges.stillhour;
      gainShatter(target, 8, events);
    }
    gainShatter(target, shatterGauge.incomingHit, events);
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
  }
  checkOutcome(state);
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
    ally.shatter = Math.min(prior.shatter, ally.stats.shatterCapacity);
    if (prior.masterConduit) ally.masterConduit = prior.masterConduit;
    if (prior.conduitCharges) {
      ally.conduitCharges = { ...prior.conduitCharges };
      delete ally.conduitCharges.emberSealRound;
      delete ally.conduitCharges.undertideUsedRound;
    }
  }
  if (previous.conduitSeed !== void 0) state.conduitSeed = previous.conduitSeed;
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
    message: "Next stage. Health and cooldowns reset; Shatter Gauge carries over."
  }] };
}
function nextWave(previous) {
  if (previous.story || previous.dungeon || previous.infusion || previous.war) throw new Error("Staged activities must be started as separate encounters.");
  if (previous.phase !== "cleared") throw new Error("Defeat this wave before advancing.");
  const state = structuredClone(previous);
  const events = [];
  state.wave++;
  state.enemies = spawnWave(state.wave);
  state.phase = "player";
  for (const ally of state.allies) delete ally.pilot;
  for (const ally of state.allies) {
    delete ally.omnicMemory;
    delete ally.omnicProtection;
  }
  newTurn(state, events);
  events.push({ kind: "turn", source: "", target: "", amount: state.wave, critical: false, message: `Wave ${state.wave}: enemies grow stronger. Health, shields, Shatter Gauge and recovery carry over.` });
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
function validateBannerPity(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value) || !("highestStar" in value) || typeof value.highestStar !== "number" || !Number.isInteger(value.highestStar) || value.highestStar < 0 || value.highestStar >= savedBannerPityBounds.highestStar || !("unownedHighestStar" in value) || typeof value.unownedHighestStar !== "number" || !Number.isInteger(value.unownedHighestStar) || value.unownedHighestStar < 0 || value.unownedHighestStar >= savedBannerPityBounds.unownedHighestStar) {
    throw new Error("Invalid saved banner pity counters.");
  }
  return { highestStar: value.highestStar, unownedHighestStar: value.unownedHighestStar };
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
function isSummonBannerId(value) {
  return summonBanners.some((banner) => banner.id === value);
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
function isExchangeQuantity(value) {
  return exchangeQuantities.includes(value);
}

// src/game/account.ts
var ACCOUNT_KEY = "last-light.wallet";
function emptyAccount() {
  return { version: 5, fractalis: 0, lycalis: 0, materials: {}, characters: {}, firstFracture: false, dungeonStages: {}, infusionStages: {}, receipts: [], creatures: {} };
}
function count(value) {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}
function record(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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
function validateAccount(value) {
  if (!record(value) || value.version !== 2 && value.version !== 3 && value.version !== 4 && value.version !== 5 || !count(value.fractalis) || !count(value.lycalis) || !record(value.materials) || !record(value.characters) || !record(value.dungeonStages) || typeof value.firstFracture !== "boolean" || !Array.isArray(value.receipts) || !value.receipts.every((receipt) => typeof receipt === "string") || new Set(value.receipts).size !== value.receipts.length) {
    throw new Error("The local progression save is invalid or unsupported. It has not been overwritten.");
  }
  const account = emptyAccount();
  account.fractalis = value.fractalis;
  account.lycalis = value.lycalis;
  if (value.mechanicalComponents !== void 0) {
    if (!count(value.mechanicalComponents)) throw new Error("Invalid saved Broken Mechanical Components balance.");
    account.mechanicalComponents = value.mechanicalComponents;
  }
  if (value.masterChests !== void 0) {
    if (!count(value.masterChests)) throw new Error("Invalid saved Master chest count.");
    account.masterChests = value.masterChests;
  }
  if (value.masterConduits !== void 0) {
    if (!record(value.masterConduits)) throw new Error("Invalid saved Master Conduit inventory.");
    account.masterConduits = {};
    for (const [id, amount] of Object.entries(value.masterConduits)) {
      if (!isMasterConduitId(id) || amount !== 0 && amount !== 1) throw new Error("Invalid saved Master Conduit unlock.");
      account.masterConduits[id] = amount;
    }
  }
  if (value.bannerPity !== void 0) {
    if (!record(value.bannerPity)) throw new Error("Invalid saved banner pity.");
    account.bannerPity = {};
    for (const [id, counters] of Object.entries(value.bannerPity)) {
      if (!isSummonBannerId(id)) throw new Error("Unknown saved pity banner.");
      account.bannerPity[id] = validateBannerPity(counters);
    }
  }
  account.firstFracture = value.firstFracture;
  account.receipts = [...value.receipts];
  if (value.storyCompleted !== void 0) {
    if (!count(value.storyCompleted) || value.storyCompleted > storyRules.stages) throw new Error("Invalid saved Story progress.");
    account.storyCompleted = value.storyCompleted;
  }
  if (value.warStages !== void 0) {
    if (!record(value.warStages)) throw new Error("Invalid saved Elemental War progress.");
    account.warStages = {};
    for (const [id, stage] of Object.entries(value.warStages)) {
      if (!isWarCharacter(id) || !count(stage) || stage < 1 || stage > warStageCount) throw new Error("Invalid saved Elemental War stage.");
      account.warStages[id] = stage;
    }
  }
  if (value.conduits !== void 0) {
    if (!record(value.conduits)) throw new Error("Invalid saved Conduit inventory.");
    account.conduits = {};
    for (const [id, amount] of Object.entries(value.conduits)) {
      if (!isConduitId(id) || !count(amount)) throw new Error("Invalid saved Conduit inventory.");
      account.conduits[id] = amount;
    }
  }
  if (value.conduitUpgrades !== void 0) {
    account.conduitUpgrades = validateConduitUpgrades(value.conduitUpgrades);
    for (const id of Object.keys(account.conduitUpgrades)) {
      if (!isConduitId(id) || (account.conduits?.[id] ?? 0) < 1) throw new Error("Conduit upgrades require an owned Conduit.");
    }
  }
  for (const [id, amount] of Object.entries(value.materials)) {
    let canonicalId = id;
    if (value.version < 4) {
      const [element, rarity] = id.split("-");
      if (isLegacyElement(element) && id === `${element}-${rarity}`) canonicalId = `${canonicalElement(element)}-${rarity}`;
    }
    if (!isMaterial(canonicalId) || !count(amount)) throw new Error(`Invalid saved material: ${id}.`);
    const total = (account.materials[canonicalId] ?? 0) + amount;
    if (!count(total)) throw new Error(`Merged material balance exceeds the supported maximum: ${canonicalId}. The save has not been overwritten.`);
    account.materials[canonicalId] = total;
  }
  for (const [id, progress] of Object.entries(value.characters)) {
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
  if (value.capturedCharacters !== void 0) account.capturedCharacters = validateCapturedCharacters(value.capturedCharacters);
  if (value.characterLocks !== void 0) account.characterLocks = validateCharacterLocks(value.characterLocks, account.characters);
  if (value.squad !== void 0) {
    if (!Array.isArray(value.squad) || value.squad.length < 1 || value.squad.length > 3 || new Set(value.squad).size !== value.squad.length || !value.squad.every((id) => typeof id === "string" && ownedCharacterInstances(account).includes(id))) {
      throw new Error("Invalid saved squad. Equip one to three distinct owned characters.");
    }
    account.squad = [...value.squad];
  }
  if (value.masterEquipment !== void 0) {
    if (!record(value.masterEquipment)) throw new Error("Invalid saved Master equipment.");
    account.masterEquipment = {};
    for (const [character, id] of Object.entries(value.masterEquipment)) {
      if (!isStarterId(character) || !account.characters[character]) throw new Error("Master equipment requires an owned Element-Bearer.");
      if (id !== null) {
        if (!isMasterConduitId(id) || account.masterConduits?.[id] !== 1) throw new Error("Master equipment requires an owned Master Conduit.");
        validateMasterCharacter(id, character);
      }
      account.masterEquipment[character] = id;
    }
  }
  if (value.conduitEquipment !== void 0) {
    if (!record(value.conduitEquipment)) throw new Error("Invalid saved Conduit equipment.");
    account.conduitEquipment = {};
    for (const [id, slots] of Object.entries(value.conduitEquipment)) {
      if (!ownedCharacterInstances(account).includes(id)) throw new Error("Conduit equipment requires an owned character.");
      const copy = account.capturedCharacters?.find((entry) => entry.instanceId === id);
      const element = isStarterId(id) ? getStarter(id).elementId : copy ? getCreature(copy.creatureId).element : void 0;
      if (!element) throw new Error("Conduit equipment requires an owned captured Elemental-Devourer.");
      if (!Array.isArray(slots) || slots.some((conduit) => conduit !== null && (!isConduitId(conduit) || !(account.conduits?.[conduit] ?? 0)))) {
        throw new Error("Conduit equipment requires an owned Conduit.");
      }
      const equipped = value.version < 5 ? normalizeLegacyKitSlots(slots, element) : validateConduitSlots(slots);
      validateConduitElement(equipped, element);
      account.conduitEquipment[id] = equipped;
    }
  }
  for (const [id, stage] of Object.entries(value.dungeonStages)) {
    const canonicalId = value.version >= 4 ? id : isLegacyElement(id) ? canonicalElement(id) : id;
    if (!isPlayableDungeon(canonicalId) || !count(stage) || stage < 1 || stage > (value.version === 2 ? 50 : dungeonStageCount)) throw new Error("Invalid saved dungeon stage.");
    const migratedStage = value.version >= 4 ? stage : migrateLegacyDungeonStage(stage, value.version === 2 ? 2 : 3);
    account.dungeonStages[canonicalId] = Math.max(account.dungeonStages[canonicalId] ?? 1, migratedStage);
  }
  if (value.infusionStages !== void 0) {
    if (!record(value.infusionStages)) throw new Error("Invalid saved infusion stages.");
    for (const [id, stage] of Object.entries(value.infusionStages)) {
      if (!isInfusionMode(id) || !count(stage) || stage < 1 || stage > (value.version === 2 && (id === "heavens" || id === "abyss") ? 25 : infusionStageCount(id))) throw new Error("Invalid saved infusion stage.");
      account.infusionStages[id] = value.version === 2 && (id === "heavens" || id === "abyss") ? 1 + Math.round((stage - 1) * (dungeonStageCount - 1) / 24) : stage;
    }
    if (value.creatures !== void 0) {
      if (!record(value.creatures)) throw new Error("Invalid saved Elemental-Devourer discoveries.");
      for (const [id, entry] of Object.entries(value.creatures)) {
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
  const value = raw === null ? null : JSON.parse(raw);
  const account = raw === null ? emptyAccount() : record(value) && value.version === 1 && count(value.fractalis) ? { ...emptyAccount(), fractalis: value.fractalis } : validateAccount(value);
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
    if (creature.mode !== requirement.infusion) reasons.push("Wrong infusion mode");
    if (form < (requirement.minimumCreatureForm ?? 1)) reasons.push(`Requires form ${requirement.minimumCreatureForm} or higher`);
    if (protection.locked) reasons.push("Locked");
    if (protection.inSquad) reasons.push("In squad");
    if (account.conduitEquipment?.[copy.instanceId]?.some((id) => id !== null)) reasons.push("Conduits equipped");
    return { copy, index: index + 1, creature, form, reasons, eligible: reasons.length === 0 };
  });
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
  const creatureCount = kind === "evolve" ? characterEvolutionRequirement(id, current.evolution).creatureCount : 0;
  if (fodderIds.length !== creatureCount || new Set(fodderIds).size !== fodderIds.length) {
    throw new Error(`Select exactly ${creatureCount} distinct captured Elemental-Devourers for this upgrade.`);
  }
  if (fodderIds.length) {
    const options = evolutionFodderOptions(account, element, current.evolution, id);
    for (const id2 of fodderIds) {
      const option = options.find((entry) => entry.copy.instanceId === id2);
      if (!option) throw new Error("Selected captured Elemental-Devourer is no longer owned.");
      if (!option.eligible) throw new Error(`Cannot consume ${option.creature.name} \xB7 Copy ${option.index}: ${option.reasons.join(", ")}.`);
    }
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
  let changed = false;
  const recruitments = [];
  const storyBonuses = [];
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
      const range3 = bossLootRange(storyFractalisDrop(encounter2.level), multiplier);
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
      const eligible = machineConduitLoot(result.state.infusion.stage);
      const tiers = /* @__PURE__ */ new Set();
      for (const [id, amount] of Object.entries(reward.conduits)) {
        if (!isConduitId(id) || amount !== 1 || !eligible.some((drop) => drop.id === id)) throw new Error("Invalid machine Conduit reward.");
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
      if (!creature.mode || creature.mode === "machines" || !stage || creature.mode !== result.state.infusion?.mode || enemy.hp > 0 || enemy.creatureId !== creature.id || !creature.stages.includes(stage) || reward.capture.level !== enemy.level || enemy.level !== infusionEncounter(creature.mode, stage, result.state.infusion?.schedule ?? "legacy").level || creature.mode === "roses" && enemy.level > roseCaptureMaximumLevel) {
        throw new Error("Invalid captured enemy reward.");
      }
      const copy = createCreatureCopy(creature.id, stage, enemy.level);
      account.capturedCharacters = validateCapturedCharacters([...account.capturedCharacters ?? [], copy]);
    }
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
    if ((account.storyCompleted ?? 0) < story.storyStage) {
      account.storyCompleted = story.storyStage;
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
  const cap = starter ? characterLevelCap(ownedProgress(account, starter.id).evolution) : 120;
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
function isProfilePictureId(value) {
  return typeof value === "string" && profilePictures.some((picture) => picture.id === value);
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
  const minimumLevel = activity.kind === "dungeon" ? 30 : activity.kind === "war" ? 85 : activity.kind !== "infusion" ? 0 : activity.mode === "machines" ? 10 : activity.mode === "treasury" || activity.mode === "sanctuary" ? 60 : activity.mode === "roses" ? 75 : 50;
  const firstRegion = activity.kind === "infusion" && activity.mode === "machines";
  const level = highestBearerLevel(account);
  const regionCleared = !firstRegion || (account.storyCompleted ?? 0) >= 25;
  const requirement = `Element-Bearer Lv.${minimumLevel}${firstRegion ? " \xB7 Clear Emberwake March" : ""}`;
  return { unlocked: level >= minimumLevel && regionCleared, minimumLevel, level, requirement };
}
function assertActivityAccess(account, activity) {
  const access = activityAccess(account, activity);
  if (!access.unlocked) throw new Error(`Activity locked. Requires ${access.requirement}. Your highest Element-Bearer is Lv.${access.level}.`);
}

// src/game/save-file.ts
var SAVE_FILE_LIMIT = 4 * 1024 * 1024;
function validateSaveFile(value) {
  if (!value || typeof value !== "object" || !("format" in value) || value.format !== "last-light-save" || !("version" in value) || value.version !== 1 || !("profile" in value) || !("account" in value)) {
    throw new Error("Choose a supported Last Light save file.");
  }
  const profile = loadProfile({ getItem: () => JSON.stringify(value.profile), setItem() {
  }, removeItem() {
  } });
  if (!profile) throw new Error("The save file is missing its starter.");
  const account = validateAccount(value.account);
  if (!account.characters[profile.starterId] || !account.squad?.length) throw new Error("The save file is missing its owned starter or squad.");
  return { format: "last-light-save", version: 1, profile, account };
}

// supabase/functions/game-operation/engine.ts
var chatMessageLength = 500;
var chatGroupNameLength = 48;
var chatGroupMembers = 10;
function isProfileIcon(value) {
  return value === "neutral" || isStarterId(value) || isProfilePictureId(value);
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
    const restoredBeacon = Math.floor(completed / 25) > Math.floor(previousStoryCompleted / 25);
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
function record2(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function keys(value, allowed) {
  if (Object.keys(value).some((key) => !allowed.includes(key))) throw new Error("Unexpected request field.");
}
function text(value, maximum = 100) {
  if (typeof value !== "string" || !value.length || value.length > maximum) throw new Error("Invalid text input.");
}
function integer(value) {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error("Invalid integer input.");
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
  openMasterChest: ["id"],
  equipMasterConduit: ["character", "conduit"],
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
function validateRequest(value) {
  if (!record2(value)) throw new Error("Request must be an object.");
  keys(value, ["requestId", "expectedRevision", "operation"]);
  if (typeof value.requestId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.requestId)) {
    throw new Error("A UUID request ID is required.");
  }
  integer(value.expectedRevision);
  if (!record2(value.operation) || typeof value.operation.kind !== "string" || !Object.hasOwn(operationKeys, value.operation.kind)) throw new Error("Unknown game operation.");
  const op = value.operation;
  if (op.kind === "importSave") validateSaveFile(op.save);
  keys(op, ["kind", ...operationKeys[op.kind]]);
  if (operationKeys[op.kind].some((key) => key !== "fodderIds" && key !== "saleOption" && !(op.kind === "friendRequest" && (key === "username" || key === "friendCode")) && !(key in op))) throw new Error("Missing operation field.");
  for (const field of ["id", "character", "runId", "actorId", "targetId", "bannerId", "starterId", "element", "frame", "upgradeKind", "action", "saleOption"]) {
    if (field in op) text(op[field]);
  }
  for (const field of ["slot", "expectedLevel", "quantity"]) if (field in op) integer(op[field]);
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
    if (!record2(op.activity) || !["training", "story", "dungeon", "infusion", "war"].includes(String(op.activity.kind))) throw new Error("Invalid activity.");
    keys(op.activity, op.activity.kind === "training" ? ["kind"] : op.activity.kind === "story" ? ["kind", "stage"] : ["kind", "stage", op.activity.kind === "dungeon" ? "element" : op.activity.kind === "infusion" ? "mode" : "character"]);
    if (op.activity.kind !== "training") integer(op.activity.stage);
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
  return value;
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
function validateChatRequest(value) {
  if (!record2(value)) throw new Error("Request must be an object.");
  keys(value, ["requestId", "chat"]);
  if (typeof value.requestId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.requestId)) {
    throw new Error("A UUID request ID is required.");
  }
  const op = value.chat;
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
  return value;
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
  setItem(key, value) {
    this.items.set(key, value);
  }
  removeItem(key) {
    this.items.delete(key);
  }
};
function publicGame(game, revision) {
  const account = game.account;
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
    session: game.run ? structuredClone(game.run.session) : null,
    social: { friends: [], incoming: [], outgoing: [] }
  };
}
function gate(account, activity, entering = true) {
  if (entering) assertActivityAccess(account, activity);
  if (activity.kind === "training") return;
  if (!Number.isInteger(activity.stage) || activity.stage < 1) throw new Error("Invalid stage.");
  const maximum = activity.kind === "story" ? unlockedStoryStage(account) : activity.kind === "dungeon" && isPlayableDungeon(activity.element) ? unlockedStage(account, activity.element) : activity.kind === "infusion" && isInfusionMode(activity.mode) ? unlockedInfusionStage(account, activity.mode) : activity.kind === "war" && isWarCharacter(activity.character) ? unlockedWarStage(account, activity.character) : 0;
  if (activity.stage > maximum) throw new Error("Activity stage is locked or unavailable.");
}
function encounter(game, run, seed) {
  const s = run.session;
  if (!game.starterId) throw new Error("Choose a starter first.");
  const args = [seed, game.starterId, s.progress, run.roster, s.teamProgress, run.equipment, run.captures, run.upgrades];
  const a = run.activity;
  return withMasterLoadouts(a.kind === "training" ? createBattle(seed, run.roster, s.teamProgress, run.equipment, run.captures, run.upgrades) : a.kind === "story" ? createStoryBattle(a.stage, ...args) : a.kind === "dungeon" ? createDungeonBattle(a.element, a.stage, ...args) : a.kind === "infusion" ? createInfusionBattle(a.mode, a.stage, ...args, s.state ? s.state.infusion?.schedule ?? "legacy" : "caps") : createWarBattle(a.character, a.stage, ...args), run.masters);
}
function resolveOperation(previous, operation, entropy) {
  validateRequest({ requestId: "00000000-0000-4000-8000-000000000001", expectedRevision: 0, operation });
  const game = structuredClone(previous);
  const storage = new VirtualStorage(game);
  let result;
  let summon;
  let summons;
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
      case "openMasterChest":
        openMasterChest(storage, operation.id);
        break;
      case "equipMasterConduit":
        equipMasterConduit(storage, operation.character, operation.conduit);
        break;
      case "upgradeConduit":
        upgradeConduit(storage, operation.id, operation.expectedLevel);
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
          if (state.phase !== "cleared") throw new Error("Clear the encounter before continuing.");
          result = state.dungeon || state.infusion || state.war || state.story ? nextStage(state, run.session.teamProgress) : nextWave(state);
          if (run.activity.kind !== "training") run.activity.stage++;
          gate(game.account, run.activity, false);
          run.session.stageEvents = [];
          run.session.entrancePending = true;
        } else {
          if (state.phase !== "defeat") throw new Error("Retry is only available after defeat.");
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
  return { game, response: { ...publicGame(game, 0), ...result ? { result } : {}, ...summon ? { summon } : {}, ...summons ? { summons } : {} } };
}
export {
  frames,
  freshGame,
  profileActivityFor,
  profileIconUnlocked,
  publicGame,
  resolveOperation,
  validateChatRequest,
  validateRequest
};
