import { elementalMaterials, dungeonStageCount, elementalEnemyLevel, infusionStageCount, isCurrencyMode, evolutionRequirement, isResizedActivity, migrateLegacyActivityStage, type ElementId, type ResizedActivityId } from '../content/activities';
import { fractalisDrop, storyEnemyFractalisDrop, treasuryFractalisDrop, stagedLycalisOdds } from '../content/loot-random';
import { characterGrowthFactor, characterLevelCap, characterEvolutionCost, characterEvolutionRequirement, fractureRules, characterLevelCost, type CharacterProgress, type UpgradeCost } from '../content/progression';
import { isInfusionMode, specialtyMaterials } from '../content/infusions';
import { type InfusionModeId } from '../content/activities';
import { getStarter, isStarterId, starters, type StarterId } from '../content/starters';
import { isPlayableDungeon, playableDungeons, materialLoot, dungeonVariants, type PlayableDungeon } from '../content/dungeons';
import { loadProfile, type ProfileStorage } from './profile';
import { type BattleResult } from './battle';
import { materialName } from '../content/dungeon-art';
import { getCreature } from '../content/creatures';
import { getConduit, isConduitId, validateConduitSlots, normalizeLegacyKitSlots, validateConduitElement, conduitSlotCount, validateConduitUpgrades, conduitUpgradeCost, conduitUpgradeCap, type ConduitId, type ConduitLoadouts, type ConduitUpgrades } from '../content/conduits';
import { machineComponentDrop } from '../content/mechanical-components';
import { bannerConduitBonus, machineConduitLoot } from '../content/machines';
import { isMasterConduitId, masterChest, validateMasterCharacter, type MasterConduitId, type MasterLoadouts } from '../content/master-conduits';
import { validateCapturedCharacters, migrateLegacyCapturedCopies, validateCharacterLocks, capturedProgress, capturedLevelCost, capturedLevelCap, createCreatureCopy, type CapturedCharacter, type CharacterLocks } from './character-instances';
import { infusionEncounter, infusionLoot, infusionElements, creatureSaleOptions } from '../content/infusions';
import { standardBanner, resolveBannerPull, validateBannerPity, type StandardBannerEntry, type BannerPity } from '../content/standard-banner';
import { bannerDuplicateMaterials, type BannerMaterialReward } from '../content/banner-materials';
import { getSummonBanner, isSummonBannerId, type SummonBannerId } from '../content/summon-banners';
import { roseMaterials, roseCaptureMaximumLevel } from '../content/roses';
import { exchangeProduct, isExchangeQuantity } from '../content/material-exchange';
import { isWarCharacter, warEncounter, warLoot, warStageCount, type WarCharacterId } from '../content/elemental-war';
import { canonicalElement, isLegacyElement } from '../content/element-migration';
import { storyEncounter, storyCreature, storyRules, storyBossBonus, storyMaterialLoot, storyCompletionReward, storyClearReward, migrateLegacyStoryCompleted, migratePreviousStoryCompleted } from '../content/story';
import { bossLootMultiplier, bossLootRange } from '../content/final-boss-loot';
import { calamityChest, calamityChestId, calamityEncounter, isCalamityActivityId, isCalamityTier, parseCalamityChestId, rollCalamityChest, type CalamityActivityId } from '../content/calamity';
import { calamiticLockMessage, calamiticStoreUnlocked, calamiticTokenPrice, isCalamiticConduitId } from '../content/calamitic-conduits';

export const ACCOUNT_KEY = 'last-light.wallet';
export interface Account {
  version: 8;
  fractalis: number;
  lycalis: number;
  bannerPity?: Partial<Record<SummonBannerId, BannerPity>>;
  materials: Record<string, number>;
  characters: Partial<Record<StarterId, CharacterProgress>>;
  squad?: string[];
  capturedCharacters?: CapturedCharacter[];
  characterLocks?: CharacterLocks;
  conduits?: Partial<Record<ConduitId, number>>;
  conduitEquipment?: ConduitLoadouts;
  conduitUpgrades?: ConduitUpgrades;
  mechanicalComponents?: number;
  calamiticTokens?: number;
  masterChests?: number;
  calamityChests?: Record<string, number>;
  calamityClears?: Partial<Record<CalamityActivityId, number>>;
  normalFinalClears?: Partial<Record<CalamityActivityId, boolean>>;
  calamitySeed?: number;
  masterConduits?: Partial<Record<MasterConduitId, number>>;
  masterEquipment?: MasterLoadouts;
  firstFracture: boolean;
  dungeonStages: Partial<Record<PlayableDungeon, number>>;
  infusionStages: Partial<Record<InfusionModeId, number>>;
  warStages?: Partial<Record<WarCharacterId, number>>;
  storyCompleted?: number;
  receipts: string[];
  creatures: Record<string, { defeated: boolean }>;
}
export function emptyAccount(): Account {
  return { version: 8, fractalis: 0, lycalis: 0, materials: {}, characters: {}, firstFracture: false, dungeonStages: {}, infusionStages: {}, receipts: [], creatures: {} };
}
function count(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
export function migrateLegacyDungeonStage(stage: number, version: 2 | 3): number {
  if (!count(stage) || stage < 1 || stage > (version === 2 ? 50 : dungeonStageCount)) throw new Error('Invalid saved dungeon stage.');
  const oldStage = version === 2
    ? 1 + Math.round((Math.min(stage, 45) - 1) * (dungeonStageCount - 1) / 44) : stage;
  if (oldStage === 1) return 1;
  if (oldStage === dungeonStageCount) return dungeonStageCount;
  const completedLevel = Math.round(10 + (oldStage - 2) * 110 / 34);
  let unlocked = 1;
  for (let floor = 1; floor <= dungeonStageCount; floor++) {
    if (elementalEnemyLevel(floor) <= completedLevel) unlocked = Math.min(dungeonStageCount, floor + 1);
  }
  return unlocked;
}
export function validateAccount(value: unknown): Account {
  if (!record(value) || (value.version !== 2 && value.version !== 3 && value.version !== 4 && value.version !== 5 && value.version !== 6 && value.version !== 7 && value.version !== 8) || !count(value.fractalis) || !count(value.lycalis) ||
      !record(value.materials) || !record(value.characters) || !record(value.dungeonStages) ||
      typeof value.firstFracture !== 'boolean' || !Array.isArray(value.receipts) ||
      !value.receipts.every((receipt) => typeof receipt === 'string') || new Set(value.receipts).size !== value.receipts.length) {
    throw new Error('The local progression save is invalid or unsupported. It has not been overwritten.');
  }
  const account = emptyAccount();
  account.fractalis = value.fractalis;
  account.lycalis = value.lycalis;
  if (value.calamiticTokens !== undefined) {
    if (!count(value.calamiticTokens)) throw new Error('Invalid saved Calamitic Token balance.');
    account.calamiticTokens = value.calamiticTokens;
  }
  if (value.calamityChests !== undefined) {
    if (!record(value.calamityChests)) throw new Error('Invalid saved Calamity chest inventory.');
    account.calamityChests = {};
    for (const [id, amount] of Object.entries(value.calamityChests)) {
      parseCalamityChestId(id);
      if (!count(amount)) throw new Error('Invalid saved Calamity chest count.');
      account.calamityChests[id] = amount;
    }
  }
  if (value.calamityClears !== undefined) {
    if (!record(value.calamityClears)) throw new Error('Invalid saved Calamity progress.');
    account.calamityClears = {};
    for (const [id, tier] of Object.entries(value.calamityClears)) {
      if (!isCalamityActivityId(id) || !count(tier) || tier > 3) throw new Error('Invalid saved Calamity clear.');
      account.calamityClears[id] = tier;
    }
  }
  if (value.normalFinalClears !== undefined) {
    if (!record(value.normalFinalClears)) throw new Error('Invalid saved final-clear evidence.');
    account.normalFinalClears = {};
    for (const [id, cleared] of Object.entries(value.normalFinalClears)) {
      if (!isCalamityActivityId(id) || typeof cleared !== 'boolean') throw new Error('Invalid saved final-clear evidence.');
      account.normalFinalClears[id] = cleared;
    }
  }
  if (value.calamitySeed !== undefined) {
    if (!count(value.calamitySeed) || value.calamitySeed < 1 || value.calamitySeed > 0xffffffff) throw new Error('Invalid saved Calamity seed.');
    account.calamitySeed = value.calamitySeed;
  }
  if (value.mechanicalComponents !== undefined) {
    if (!count(value.mechanicalComponents)) throw new Error('Invalid saved Broken Mechanical Components balance.');
    account.mechanicalComponents = value.mechanicalComponents;
  }
  if (value.masterChests !== undefined) {
    if (!count(value.masterChests)) throw new Error('Invalid saved Master chest count.');
    account.masterChests = value.masterChests;
  }
  if (value.masterConduits !== undefined) {
    if (!record(value.masterConduits)) throw new Error('Invalid saved Master Conduit inventory.');
    account.masterConduits = {};
    for (const [id, amount] of Object.entries(value.masterConduits)) {
      if (!isMasterConduitId(id) || (amount !== 0 && amount !== 1)) throw new Error('Invalid saved Master Conduit unlock.');
      account.masterConduits[id] = amount;
    }
  }
  if (value.bannerPity !== undefined) {
    if (!record(value.bannerPity)) throw new Error('Invalid saved banner pity.');
    account.bannerPity = {};
    for (const [id, counters] of Object.entries(value.bannerPity)) {
      if (!isSummonBannerId(id)) throw new Error('Unknown saved pity banner.');
      account.bannerPity[id] = validateBannerPity(counters);
    }
  }
  account.firstFracture = value.firstFracture;
  account.receipts = [...value.receipts];
  if (value.storyCompleted !== undefined) {
    if (!count(value.storyCompleted)) throw new Error('Invalid saved Story progress.');
    if (value.version >= 8) {
      if (value.storyCompleted > storyRules.stages) throw new Error('Invalid saved Story progress.');
      account.storyCompleted = value.storyCompleted;
    } else if (value.version >= 6) {
      // v6-v7 counted clears on 18-stage regions. Read-only conversion to 20-stage regions (D-347); stages
      // newly credited by the remap pay their first-clear reward once, and the first successful save persists v8.
      const previous = value.storyCompleted;
      account.storyCompleted = migratePreviousStoryCompleted(previous);
      const credited = account.storyCompleted - previous;
      account.fractalis += credited * storyCompletionReward.fractalis;
      account.lycalis += credited * storyCompletionReward.lycalis;
      if (!count(account.fractalis) || !count(account.lycalis)) throw new Error('Story completion grant exceeds the supported balance. The save has not been overwritten.');
    } else {
      // Pre-v6 wallets counted clears on the 25-stage layout. Read-only conversion plus the one-time D-340
      // completion grant for every legacy clear; the first successful save persists both as v8.
      const legacy = value.storyCompleted;
      account.storyCompleted = migrateLegacyStoryCompleted(legacy);
      account.fractalis += legacy * storyCompletionReward.fractalis;
      account.lycalis += legacy * storyCompletionReward.lycalis;
      if (!count(account.fractalis) || !count(account.lycalis)) throw new Error('Story completion grant exceeds the supported balance. The save has not been overwritten.');
    }
  }
  if (value.warStages !== undefined) {
    if (!record(value.warStages)) throw new Error('Invalid saved Elemental War progress.');
    account.warStages = {};
    for (const [id, stage] of Object.entries(value.warStages)) {
      if (!isWarCharacter(id) || !count(stage) || stage < 1 || stage > warStageCount) throw new Error('Invalid saved Elemental War stage.');
      account.warStages[id] = stage;
    }
  }
  if (value.conduits !== undefined) {
    if (!record(value.conduits)) throw new Error('Invalid saved Conduit inventory.');
    account.conduits = {};
    for (const [id, amount] of Object.entries(value.conduits)) {
      if (!isConduitId(id) || !count(amount)) throw new Error('Invalid saved Conduit inventory.');
      account.conduits[id] = amount;
    }
  }
  if (value.conduitUpgrades !== undefined) {
    account.conduitUpgrades = validateConduitUpgrades(value.conduitUpgrades);
    for (const id of Object.keys(account.conduitUpgrades)) {
      if (!isConduitId(id) || (account.conduits?.[id] ?? 0) < 1) throw new Error('Conduit upgrades require an owned Conduit.');
    }
  }
  for (const [id, amount] of Object.entries(value.materials)) {
    let canonicalId = id;
    if (value.version < 4) {
      const [element, rarity] = id.split('-');
      if (isLegacyElement(element) && id === `${element}-${rarity}`) canonicalId = `${canonicalElement(element)}-${rarity}`;
    }
    if (!isMaterial(canonicalId) || !count(amount)) throw new Error(`Invalid saved material: ${id}.`);
    const total = (account.materials[canonicalId] ?? 0) + amount;
    if (!count(total)) throw new Error(`Merged material balance exceeds the supported maximum: ${canonicalId}. The save has not been overwritten.`);
    account.materials[canonicalId] = total;
  }
  for (const [id, progress] of Object.entries(value.characters)) {
    if (!isStarterId(id) || !record(progress) || typeof progress.level !== 'number' || typeof progress.evolution !== 'number') {
      throw new Error('Invalid saved character progress.');
    }
    if (progress.weaponRank !== undefined && typeof progress.weaponRank !== 'number') throw new Error('Invalid saved weapon rank.');
    const entry: CharacterProgress = { level: progress.level, evolution: progress.evolution,
      ...(progress.weaponRank !== undefined ? { weaponRank: progress.weaponRank } : {}) };
    characterGrowthFactor(entry);
    account.characters[id] = entry;
  }
  if (value.capturedCharacters !== undefined) account.capturedCharacters = validateCapturedCharacters(value.version < 7 ? migrateLegacyCapturedCopies(value.capturedCharacters) : value.capturedCharacters);
  if (value.characterLocks !== undefined) account.characterLocks = validateCharacterLocks(value.characterLocks, account.characters);
  if (value.squad !== undefined) {
    if (!Array.isArray(value.squad) || value.squad.length < 1 || value.squad.length > 3 ||
        new Set(value.squad).size !== value.squad.length ||
        !value.squad.every((id) => typeof id === 'string' && ownedCharacterInstances(account).includes(id))) {
      throw new Error('Invalid saved squad. Equip one to three distinct owned characters.');
    }
    account.squad = [...value.squad];
  }
  if (value.masterEquipment !== undefined) {
    if (!record(value.masterEquipment)) throw new Error('Invalid saved Master equipment.');
    account.masterEquipment = {};
    for (const [character, id] of Object.entries(value.masterEquipment)) {
      if (!isStarterId(character) || !account.characters[character]) throw new Error('Master equipment requires an owned Element-Bearer.');
      if (id !== null) {
        if (!isMasterConduitId(id) || account.masterConduits?.[id] !== 1) throw new Error('Master equipment requires an owned Master Conduit.');
        validateMasterCharacter(id, character);
      }
      account.masterEquipment[character] = id;
    }
  }
  if (value.conduitEquipment !== undefined) {
    if (!record(value.conduitEquipment)) throw new Error('Invalid saved Conduit equipment.');
    account.conduitEquipment = {};
    for (const [id, slots] of Object.entries(value.conduitEquipment)) {
      if (!ownedCharacterInstances(account).includes(id)) throw new Error('Conduit equipment requires an owned character.');
      const copy = account.capturedCharacters?.find((entry) => entry.instanceId === id);
      const element = isStarterId(id) ? getStarter(id).elementId : copy ? getCreature(copy.creatureId).element : undefined;
      if (!element) throw new Error('Conduit equipment requires an owned captured Elemental-Devourer.');
      if (!Array.isArray(slots) || slots.some((conduit) => conduit !== null && (!isConduitId(conduit) || !(account.conduits?.[conduit] ?? 0)))) {
        throw new Error('Conduit equipment requires an owned Conduit.');
      }
      const equipped = value.version < 5 ? normalizeLegacyKitSlots(slots, element) : validateConduitSlots(slots);
      validateConduitElement(equipped, element);
      account.conduitEquipment[id] = equipped;
    }
  }
  for (const [id, stage] of Object.entries(value.dungeonStages)) {
    const canonicalId = value.version >= 4 ? id : isLegacyElement(id) ? canonicalElement(id) : id;
    if (!isPlayableDungeon(canonicalId) || !count(stage) || stage < 1 || stage > (value.version === 2 ? 50 : dungeonStageCount)) throw new Error('Invalid saved dungeon stage.');
    const migratedStage = value.version >= 4 ? stage : migrateLegacyDungeonStage(stage, value.version === 2 ? 2 : 3);
    account.dungeonStages[canonicalId] = Math.max(account.dungeonStages[canonicalId] ?? 1, migratedStage);
  }
  if (value.infusionStages !== undefined) {
    if (!record(value.infusionStages)) throw new Error('Invalid saved infusion stages.');
    for (const [id, stage] of Object.entries(value.infusionStages)) {
      if (!isInfusionMode(id) || !count(stage) || stage < 1) throw new Error('Invalid saved infusion stage.');
      // D-346: v2 Heaven/Abyss already used 25 stages; v3-v6 used 35 Heaven/Abyss and 100 Machines stages.
      const resized = value.version < 7 && isResizedActivity(id) && !(value.version === 2 && id !== 'machines');
      if (!resized && stage > infusionStageCount(id)) throw new Error('Invalid saved infusion stage.');
      account.infusionStages[id] = resized ? migrateLegacyActivityStage(id as ResizedActivityId, stage) : stage;
    }
    if (value.creatures !== undefined) {
      if (!record(value.creatures)) throw new Error('Invalid saved Elemental-Devourer discoveries.');
      for (const [id, entry] of Object.entries(value.creatures)) {
        getCreature(id);
        if (!record(entry) || typeof entry.defeated !== 'boolean') throw new Error('Invalid saved Elemental-Devourer discovery.');
        account.creatures[id] = { defeated: entry.defeated };
      }
    }
  }
  return account;
}
export function loadAccount(storage: ProfileStorage): Account {
  const raw = storage.getItem(ACCOUNT_KEY);
  const value: unknown = raw === null ? null : JSON.parse(raw);
  const account = raw === null ? emptyAccount()
    : record(value) && value.version === 1 && count(value.fractalis)
      ? { ...emptyAccount(), fractalis: value.fractalis } : validateAccount(value);
  const profile = loadProfile(storage);
  if (profile) {
    account.characters[profile.starterId] ??= { level: 0, evolution: 1 };
    account.squad ??= [profile.starterId];
  }
  return account;
}
export function ownedCharacters(account: Account): StarterId[] {
  return starters.filter((starter) => account.characters[starter.id] !== undefined).map((starter) => starter.id);
}
export function ownedCharacterInstances(account: Account): string[] {
  return [...ownedCharacters(account), ...(account.capturedCharacters ?? []).map((copy) => copy.instanceId)];
}
export function characterProtection(account: Account, id: string): { locked: boolean; inSquad: boolean; protected: boolean } {
  if (!ownedCharacterInstances(account).includes(id)) throw new Error('Choose an owned character instance.');
  const locked = isStarterId(id) ? account.characterLocks?.[id] ?? false
    : account.capturedCharacters?.find((copy) => copy.instanceId === id)?.locked;
  if (locked === undefined) throw new Error('Captured-character instance is missing.');
  const inSquad = (account.squad ?? ownedCharacters(account).slice(0, 1)).some((member) => member === id);
  return { locked, inSquad, protected: locked || inSquad };
}
export function evolutionFodderOptions(account: Account, element: ElementId, evolution: number, character?: StarterId) {
  const requirement = character ? characterEvolutionRequirement(character, evolution) : evolutionRequirement(element, evolution);
  return (account.capturedCharacters ?? []).map((copy, index) => {
    const creature = getCreature(copy.creatureId);
    const form = capturedProgress(copy).tier + 1;
    const protection = characterProtection(account, copy.instanceId);
    const reasons: string[] = [];
    if (!requirement.requiresInfusableEnemies) reasons.push('No Elemental-Devourers required for this evolution');
    if (creature.mode !== requirement.infusion) reasons.push('From a different activity');
    if (protection.locked) reasons.push('Locked');
    if (protection.inSquad) reasons.push('In squad');
    if (account.conduitEquipment?.[copy.instanceId]?.some((id) => id !== null)) reasons.push('Conduits equipped');
    return { copy, index: index + 1, creature, form, value: form, reasons, eligible: reasons.length === 0 };
  });
}
/**
 * D-346 addition rule: each consumed Elemental-Devourer adds its form (1-6) to the Evolution Value. A choice is
 * ready once it reaches the required value without any surplus copy (dropping the smallest would still suffice).
 */
export function fodderSelectionStatus(values: readonly number[], required: number) {
  const total = values.reduce((sum, value) => sum + value, 0);
  const surplus = values.length > 0 && total - Math.min(...values) >= required;
  return { total, required, surplus, ready: required > 0 && total >= required && !surplus };
}
export function setCharacterLock(storage: ProfileStorage, id: string, locked: boolean): Account {
  if (!loadProfile(storage)) throw new Error('Choose your first Element-Bearer before managing characters.');
  if (typeof locked !== 'boolean') throw new Error('Invalid character lock value.');
  const account = loadAccount(storage);
  characterProtection(account, id);
  if (isStarterId(id)) account.characterLocks = { ...account.characterLocks, [id]: locked };
  else {
    const copy = account.capturedCharacters?.find((entry) => entry.instanceId === id);
    if (!copy) throw new Error('Captured-character instance is missing.');
    copy.locked = locked;
  }
  return saveAccount(storage, account);
}
export function equippedSquad(account: Account): string[] {
  const ids = account.squad ?? ownedCharacters(account).slice(0, 1);
  if (!ids.length || ids.length > 3 || new Set(ids).size !== ids.length ||
      ids.some((id) => !ownedCharacterInstances(account).includes(id))) {
    throw new Error('Equip one to three distinct owned characters before entering battle.');
  }
  return [...ids];
}
export function setSquad(storage: ProfileStorage, ids: readonly string[]): Account {
  if (!loadProfile(storage)) throw new Error('Choose your first Element-Bearer before editing a squad.');
  const account = loadAccount(storage);
  account.squad = [...ids];
  return saveAccount(storage, account);
}
export const summonCost = standardBanner.cost;
export interface SummonDraw {
  entry: StandardBannerEntry; materials?: BannerMaterialReward; copy?: CapturedCharacter; duplicate: boolean; guarantee: string; bonusConduit?: ConduitId;
}
export const multiSummonCount = 10;
export function summonCharacter(storage: ProfileStorage, random: () => number = Math.random, bannerId: string = 'standard'):
  { account: Account } & SummonDraw {
  const { account, draws } = summonCharacters(storage, random, bannerId, 1);
  return { account, ...draws[0] };
}
/** Resolves draws sequentially (pity, ownership and bonuses carry forward), then saves cost and every reward in one write. */
export function summonCharacters(storage: ProfileStorage, random: () => number = Math.random, bannerId: string = 'standard', count: number = multiSummonCount):
  { account: Account; draws: SummonDraw[] } {
  if (!loadProfile(storage)) throw new Error('Choose your first Element-Bearer before summoning.');
  const banner = getSummonBanner(bannerId);
  if (count !== 1 && count !== multiSummonCount) throw new Error('Choose a single or 10-pull summon.');
  if (!banner.available) throw new Error('Banner unavailable.');
  const account = loadAccount(storage);
  const cost = banner.cost * count;
  if (account.lycalis < cost) throw new Error(`${count === 1 ? 'Summoning' : 'A 10-pull'} requires ${cost} Null-Prismatica.`);
  const draws = Array.from({ length: count }, () => drawBanner(account, banner, random));
  account.lycalis -= cost;
  return { account: saveAccount(storage, account), draws };
}
function drawBanner(account: Account, banner: ReturnType<typeof getSummonBanner>, random: () => number): SummonDraw {
  const result = resolveBannerPull(banner.pool(), ownedCharacters(account),
    account.bannerPity?.[banner.id] ?? { highestStar: 0, unownedHighestStar: 0 }, random);
  const duplicate = result.entry.kind === 'character' && account.characters[result.entry.id] !== undefined;
  let materials: BannerMaterialReward | undefined;
  if (duplicate) {
    materials = bannerDuplicateMaterials(banner.id === 'roses', random);
  } else if (result.entry.kind === 'material') {
    materials = { id: result.entry.id, amount: result.entry.amount };
  } else if (result.entry.kind === 'creature') {
    throw new Error('Elemental-Devourer summon outcomes are retired.');
  } else {
    account.characters[result.entry.id] = { level: 0, evolution: 1, weaponRank: 0 };
  }
  if (materials) account.materials[materials.id] = (account.materials[materials.id] ?? 0) + materials.amount;
  account.bannerPity = { ...account.bannerPity, [banner.id]: result.pity };
  const bonusConduit = bannerConduitBonus(random);
  if (bonusConduit) account.conduits = { ...account.conduits, [bonusConduit]: (account.conduits?.[bonusConduit] ?? 0) + 1 };
  return { entry: result.entry, materials, duplicate, guarantee: result.guarantee, bonusConduit };
}
export function purchaseExchangeMaterial(storage: ProfileStorage, productId: string, quantity: number): Account {
  if (!loadProfile(storage)) throw new Error('Choose your first Element-****** using the Material Exchange.');
  const product = exchangeProduct(productId);
  if (!isExchangeQuantity(quantity)) throw new Error('Invalid Material Exchange quantity.');
  const account = loadAccount(storage);
  const cost = product.price * quantity;
  if (account.fractalis < cost) throw new Error(`Not enough Prismatica. ${quantity} costs ${cost}.`);
  const owned = (account.materials[product.materialId] ?? 0) + quantity;
  if (!Number.isSafeInteger(owned)) throw new Error('Material inventory capacity reached.');
  account.fractalis -= cost;
  account.materials[product.materialId] = owned;
  return saveAccount(storage, account);
}

export function treasurySaleOffer(account: Account, id: string) {
  const copy = account.capturedCharacters?.find((entry) => entry.instanceId === id);
  if (!copy || getCreature(copy.creatureId).mode !== 'treasury') throw new Error('Only an owned Crownfall Treasury slime can be sold here.');
  const offer = creatureSaleOffer(account, id);
  return { ...offer, amount: offer.fractalis };
}
export function isSellableCreatureMode(mode: InfusionModeId | undefined): boolean {
  return !!mode && (isCurrencyMode(mode) || mode === 'roses' || mode === 'heavens' || mode === 'abyss');
}
export function creatureSaleOffer(account: Account, id: string, optionId?: string) {
  const copy = account.capturedCharacters?.find((entry) => entry.instanceId === id);
  const mode = copy && getCreature(copy.creatureId).mode;
  if (!copy || !mode || !isSellableCreatureMode(mode)) throw new Error('Only an owned currency-farm, Heaven, Abyss or Roselius Elemental-Devourer can be sold here.');
  const protection = characterProtection(account, id);
  const reasons = [
    ...(protection.locked ? ['Locked'] : []), ...(protection.inSquad ? ['In squad'] : []),
    ...(account.conduitEquipment?.[id]?.some((conduit) => conduit !== null) ? ['Conduits equipped'] : []),
  ];
  const options = creatureSaleOptions(mode, capturedProgress(copy).tier);
  const chosen = optionId === undefined ? options[0] : options.find((option) => option.id === optionId);
  if (!chosen) throw new Error('Choose one of the listed sale payouts.');
  const { id: option, ...payout } = chosen;
  return { copy, ...payout, option, options, reasons };
}
export function sellTreasuryCreature(storage: ProfileStorage, id: string): Account {
  treasurySaleOffer(loadAccount(storage), id);
  return sellCurrencyCreature(storage, id);
}
export function sellCurrencyCreature(storage: ProfileStorage, id: string, optionId?: string): Account {
  if (!loadProfile(storage)) throw new Error('Choose your first Element-Bearer before selling Elemental-Devourers.');
  const account = loadAccount(storage);
  const offer = creatureSaleOffer(account, id, optionId);
  if (offer.reasons.length) throw new Error(`Elemental-Devourer cannot be sold: ${offer.reasons.join(', ')}.`);
  account.fractalis += offer.fractalis;
  account.lycalis += offer.lycalis;
  for (const [material, amount] of Object.entries(offer.materials)) account.materials[material] = (account.materials[material] ?? 0) + amount;
  if (![account.fractalis, account.lycalis, ...Object.keys(offer.materials).map((material) => account.materials[material])].every(Number.isSafeInteger)) throw new Error('Currency or material capacity reached.');
  account.capturedCharacters = account.capturedCharacters?.filter((copy) => copy.instanceId !== id);
  if (account.conduitEquipment) delete account.conduitEquipment[id];
  return saveAccount(storage, account);
}
export function ownedProgress(account: Account, id: StarterId): CharacterProgress {
  return account.characters[id] ?? { level: 0, evolution: 1 };
}
export function purchaseConduit(storage: ProfileStorage, id: ConduitId): Account {
  if (!loadProfile(storage)) throw new Error('Choose your first Element-Bearer before visiting the Conduit Store.');
  if (!isConduitId(id)) throw new Error('Unknown Conduit.');
  const conduit = getConduit(id);
  if (isCalamiticConduitId(id)) {
    const account = loadAccount(storage);
    if (!calamiticStoreUnlocked(account)) throw new Error(calamiticLockMessage);
    if ((account.conduits?.[id] ?? 0) > 0) throw new Error('This Calamitic Conduit is already owned.');
    if ((account.calamiticTokens ?? 0) < calamiticTokenPrice) throw new Error(`Not enough Calamitic Tokens. ${conduit.name} costs ${calamiticTokenPrice}.`);
    account.calamiticTokens = (account.calamiticTokens ?? 0) - calamiticTokenPrice;
    account.conduits = { ...account.conduits, [id]: 1 };
    return saveAccount(storage, account);
  }
  if (conduit.price === null) throw new Error('This Conduit is earned from drops, not sold in the Store.');
  const account = loadAccount(storage);
  if (account.fractalis < conduit.price) throw new Error(`Not enough Prismatica. ${conduit.name} costs ${conduit.price}.`);
  const quantity = account.conduits?.[id] ?? 0;
  if (!Number.isSafeInteger(quantity + 1)) throw new Error('Conduit inventory capacity reached.');
  account.fractalis -= conduit.price;
  account.conduits = { ...account.conduits, [id]: quantity + 1 };
  return saveAccount(storage, account);
}
export function equipConduit(storage: ProfileStorage, character: string, slot: number, conduit: ConduitId | null): Account {
  if (!loadProfile(storage)) throw new Error('Choose your first Element-Bearer before equipping Conduits.');
  const account = loadAccount(storage);
  if (!ownedCharacterInstances(account).includes(character)) throw new Error('Choose an owned character.');
  if (!Number.isInteger(slot) || slot < 0 || slot >= conduitSlotCount) throw new Error('Choose an ordinary Conduit slot. The Master slot is reserved.');
  if (conduit !== null && (!isConduitId(conduit) || (account.conduits?.[conduit] ?? 0) < 1)) throw new Error('Choose an owned Conduit.');
  const slots = [...(account.conduitEquipment?.[character] ?? Array<ConduitId | null>(conduitSlotCount).fill(null))];
  slots[slot] = conduit;
  account.conduitEquipment = { ...account.conduitEquipment, [character]: validateConduitSlots(slots) };
  return saveAccount(storage, account);
}
export function unequipAllConduits(storage: ProfileStorage, character: string): Account {
  if (!loadProfile(storage)) throw new Error('Choose your first Element-Bearer before changing equipment.');
  const account = loadAccount(storage);
  if (!ownedCharacterInstances(account).includes(character)) throw new Error('Choose an owned character.');
  account.conduitEquipment = { ...account.conduitEquipment, [character]: Array<null>(conduitSlotCount).fill(null) };
  if (isStarterId(character) && account.masterEquipment?.[character]) {
    account.masterEquipment = { ...account.masterEquipment, [character]: null };
  }
  return saveAccount(storage, account);
}
export function openMasterChest(storage: ProfileStorage, id: MasterConduitId): Account {
  if (!loadProfile(storage)) throw new Error('Choose your first Element-Bearer before opening a Master chest.');
  if (!isMasterConduitId(id)) throw new Error('Choose a valid Master Conduit.');
  const account = loadAccount(storage);
  if ((account.masterChests ?? 0) < 1) throw new Error('No Cosmic Grand Master Chest is available.');
  if ((account.masterConduits?.[id] ?? 0) > 0) throw new Error('This Master Conduit is already owned. Choose an unowned Master.');
  account.masterChests = (account.masterChests ?? 0) - 1;
  account.masterConduits = { ...account.masterConduits, [id]: 1 };
  return saveAccount(storage, account);
}
export function calamityUnlockedTier(account: Account, activity: CalamityActivityId): number {
  if (!isCalamityActivityId(activity)) throw new Error('Unknown Calamity activity.');
  if (account.normalFinalClears?.[activity] !== true) {
    const dungeon = isPlayableDungeon(activity);
    const finalStage = dungeon ? dungeonStageCount : infusionStageCount(activity);
    const access = dungeon ? account.dungeonStages[activity] : account.infusionStages[activity];
    const boss = dungeon ? `dungeon-${activity}-${finalStage}-0` : `infusion-${activity}-${finalStage}-0`;
    // Historical sessions used randomUUID run IDs; floor access alone is not victory evidence.
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (access !== finalStage || !account.receipts.some((entry) =>
      entry.length === 37 + boss.length && uuid.test(entry.slice(0, 36)) && entry.slice(36) === `:${boss}`)) return 0;
  }
  return Math.min(3, (account.calamityClears?.[activity] ?? 0) + 1);
}

export interface CalamityChestResult {
  account: Account;
  chest: ReturnType<typeof calamityChest>;
  reward: ReturnType<typeof rollCalamityChest>;
}

export function openCalamityChest(storage: ProfileStorage, id: string, expectedCount: number): CalamityChestResult {
  if (!loadProfile(storage)) throw new Error('Choose your first Element-Bearer before opening a Calamity chest.');
  const { activity, tier } = parseCalamityChestId(id);
  const account = loadAccount(storage);
  const available = account.calamityChests?.[id] ?? 0;
  if (!count(expectedCount) || expectedCount < 1 || available !== expectedCount) {
    throw new Error('Calamity chest count changed. Review the current inventory before retrying.');
  }
  let seed = account.calamitySeed ?? 0x9e3779b9;
  const reward = rollCalamityChest(activity, tier, () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    seed >>>= 0;
    return seed / 0x100000000;
  });
  const add = (current: number, amount: number): number => {
    if (!count(amount) || !count(current + amount)) throw new Error('Calamity reward inventory capacity reached.');
    return current + amount;
  };
  account.fractalis = add(account.fractalis, reward.fractalis);
  account.lycalis = add(account.lycalis, reward.lycalis);
  for (const [material, amount] of Object.entries(reward.materials)) {
    if (!isMaterial(material)) throw new Error('Invalid Calamity material reward.');
    account.materials[material] = add(account.materials[material] ?? 0, amount);
  }
  for (const [conduit, amount] of Object.entries(reward.conduits)) {
    if (!isConduitId(conduit)) throw new Error('Invalid Calamity Conduit reward.');
    account.conduits = { ...account.conduits, [conduit]: add(account.conduits?.[conduit] ?? 0, amount) };
  }
  account.mechanicalComponents = add(account.mechanicalComponents ?? 0, reward.mechanicalComponents);
  account.calamiticTokens = add(account.calamiticTokens ?? 0, reward.calamiticTokens);
  account.masterChests = add(account.masterChests ?? 0, reward.masterChests);
  account.calamityChests = { ...account.calamityChests, [id]: available - 1 };
  account.calamitySeed = seed;
  const saved = saveAccount(storage, account);
  return { account: saved, chest: calamityChest(activity, tier), reward };
}
export function equipMasterConduit(storage: ProfileStorage, character: StarterId, id: MasterConduitId | null): Account {
  if (!loadProfile(storage)) throw new Error('Choose your first Element-Bearer before equipping a Master.');
  const account = loadAccount(storage);
  if (!isStarterId(character) || !account.characters[character]) throw new Error('Choose an owned Element-Bearer.');
  if (id !== null) {
    if (!isMasterConduitId(id) || account.masterConduits?.[id] !== 1) throw new Error('Choose an owned Master Conduit.');
    validateMasterCharacter(id, character);
  }
  account.masterEquipment = { ...account.masterEquipment, [character]: id };
  return saveAccount(storage, account);
}
export interface ConduitMaxLevelPlan {
  id: ConduitId;
  currentLevel: number;
  targetLevel: number;
  cost: number;
}

export function conduitMaxLevelPlan(account: Account, id: ConduitId): ConduitMaxLevelPlan {
  if (!isConduitId(id)) throw new Error('Unknown Conduit.');
  if ((account.conduits?.[id] ?? 0) < 1) throw new Error('Choose an owned Conduit to upgrade.');
  const conduit = getConduit(id);
  const currentLevel = account.conduitUpgrades?.[id] ?? 0;
  let targetLevel = currentLevel;
  let cost = 0;
  while (targetLevel < conduitUpgradeCap) {
    const nextCost = conduitUpgradeCost(conduit, targetLevel);
    if (nextCost === null) throw new Error('Conduit upgrade cost is missing.');
    if (cost + nextCost > (account.mechanicalComponents ?? 0)) break;
    cost += nextCost;
    targetLevel++;
  }
  return { id, currentLevel, targetLevel, cost };
}

export function upgradeConduitToMaximum(storage: ProfileStorage, expected: ConduitMaxLevelPlan): Account {
  if (!loadProfile(storage)) throw new Error('Choose your first Element-Bearer before upgrading Conduits.');
  const account = loadAccount(storage);
  const plan = conduitMaxLevelPlan(account, expected.id);
  if (plan.currentLevel !== expected.currentLevel || plan.targetLevel !== expected.targetLevel || plan.cost !== expected.cost) {
    throw new Error('This Conduit Max Level preview changed. Review the current level and cost before retrying.');
  }
  if (plan.targetLevel === plan.currentLevel) throw new Error('No additional Conduit upgrades are affordable within the current cap.');
  account.mechanicalComponents = (account.mechanicalComponents ?? 0) - plan.cost;
  account.conduitUpgrades = { ...account.conduitUpgrades, [plan.id]: plan.targetLevel };
  return saveAccount(storage, account);
}

export function upgradeConduit(storage: ProfileStorage, id: ConduitId, expectedLevel: number): Account {
  if (!loadProfile(storage)) throw new Error('Choose your first Element-Bearer before upgrading Conduits.');
  if (!isConduitId(id)) throw new Error('Unknown Conduit.');
  const cost = conduitUpgradeCost(getConduit(id), expectedLevel);
  const account = loadAccount(storage);
  if ((account.conduits?.[id] ?? 0) < 1) throw new Error('Choose an owned Conduit to upgrade.');
  const level = account.conduitUpgrades?.[id] ?? 0;
  if (level !== expectedLevel) throw new Error('This Conduit upgrade level changed. Review the current level and cost before retrying.');
  if (cost === null) throw new Error('This Conduit is already upgraded five times.');
  if ((account.mechanicalComponents ?? 0) < cost) throw new Error(`Not enough Broken Mechanical Components. This upgrade costs ${cost}.`);
  account.mechanicalComponents = (account.mechanicalComponents ?? 0) - cost;
  account.conduitUpgrades = { ...account.conduitUpgrades, [id]: level + 1 };
  return saveAccount(storage, account);
}
export function saveAccount(storage: ProfileStorage, account: Account): Account {
  const validated = validateAccount(account);
  storage.setItem(ACCOUNT_KEY, JSON.stringify(validated));
  return validated;
}
function isMaterial(id: string): boolean {
  return elementalMaterials.some((material) => material.id === id) || specialtyMaterials.some((material) => material.id === id) ||
    roseMaterials.some((material) => material.id === id);
}
export function upgradeCharacter(storage: ProfileStorage, id: StarterId, kind: 'level' | 'evolve' | 'weapon', expected: CharacterProgress, fodderIds: readonly string[] = []): Account {
  if (kind === 'weapon') throw new Error('Weapon upgrades are unavailable. Existing weapon bonuses are preserved.');
  if (!loadProfile(storage)) throw new Error('Choose your Owned Element-Bearer to upgrade.');
  if (kind !== 'level' && kind !== 'evolve') throw new Error('Unknown character upgrade.');
  const account = loadAccount(storage);
  if (account.characters[id] === undefined) throw new Error('Choose your Owned Element-Bearer to upgrade.');
  const current = ownedProgress(account, id);
  if (current.level !== expected.level || current.evolution !== expected.evolution || (current.weaponRank ?? 0) !== (expected.weaponRank ?? 0)) throw new Error('Character progress changed. Reopen this tab before upgrading.');
  const element = getStarter(id).elementId;
  const cost = kind === 'level' ? characterLevelCost(id, current) : characterEvolutionCost(id, current);
  if (kind === 'evolve' && current.level !== characterLevelCap(current.evolution)) throw new Error('Reach this form level cap before evolving.');
  const requiredValue = kind === 'evolve' ? characterEvolutionRequirement(id, current.evolution).fodderValue : 0;
  if (new Set(fodderIds).size !== fodderIds.length) throw new Error('Choose each captured Elemental-Devourer only once.');
  if (!requiredValue && fodderIds.length) throw new Error('This upgrade does not consume Elemental-Devourers.');
  if (requiredValue) {
    const options = evolutionFodderOptions(account, element, current.evolution, id);
    const values: number[] = [];
    for (const id of fodderIds) {
      const option = options.find((entry) => entry.copy.instanceId === id);
      if (!option) throw new Error('Selected captured Elemental-Devourer is no longer owned.');
      if (!option.eligible) throw new Error(`Cannot consume [${option.creature.name}]: ${option.reasons.join(', ')}.`);
      values.push(option.value);
    }
    const status = fodderSelectionStatus(values, requiredValue);
    if (status.total < requiredValue) throw new Error(`Choose Elemental-Devourers worth ${requiredValue} Evolution Value (currently ${status.total}).`);
    if (status.surplus) throw new Error('Remove extra Elemental-Devourers; the evolution is already covered without one of them.');
  }
  if (account.fractalis < cost.fractalis) throw new Error('Not enough Prismatica.');
  for (const [material, amount] of Object.entries(cost.materials)) {
    if ((account.materials[material] ?? 0) < amount) throw new Error(`Not enough ${materialName(material)}.`);
  }
  account.fractalis -= cost.fractalis;
  for (const [material, amount] of Object.entries(cost.materials)) account.materials[material] -= amount;
  if (fodderIds.length) {
    account.capturedCharacters = account.capturedCharacters?.filter((copy) => !fodderIds.includes(copy.instanceId));
    for (const id of fodderIds) if (account.conduitEquipment) delete account.conduitEquipment[id];
  }
  account.characters[id] = kind === 'level' ? { ...current, level: current.level + 1 } : { ...current, evolution: current.evolution + 1 };
  if (kind === 'evolve' && !account.firstFracture) {
    account.lycalis += fractureRules.lycalisReward;
    account.firstFracture = true;
  }
  return saveAccount(storage, account);
}
export function saveAccountRewards(storage: ProfileStorage, result: BattleResult, runId: string): Account {
  const account = loadAccount(storage);
  if (result.state.calamity !== undefined) {
    const activity = result.state.calamity;
    if (!record(activity) || !isCalamityActivityId(activity.activity) || !isCalamityTier(activity.tier) ||
        result.state.dungeon || result.state.infusion || result.state.story || result.state.war ||
        !['player', 'cleared', 'defeat'].includes(result.state.phase) || result.state.wave !== 1 || result.state.enemies.length !== 1 ||
        activity.tier > calamityUnlockedTier(account, activity.activity)) {
      throw new Error('Invalid or locked Calamity encounter.');
    }
    const boss = result.state.enemies[0];
    const encounter = calamityEncounter(activity.activity, activity.tier);
    const rewards = result.events.filter((event) => event.kind === 'reward');
    const reward = rewards[0];
    const id = calamityChestId(activity.activity, activity.tier);
    if (!boss.boss || !Number.isFinite(boss.hp) || boss.creatureId !== `calamity:${activity.activity}` ||
        boss.id !== `calamity-${activity.activity}` || boss.definitionId !== `calamity:${activity.activity}` ||
        boss.side !== 'enemy' || boss.element !== encounter.element || boss.level !== encounter.level || boss.name !== encounter.name) {
      throw new Error('Invalid Calamity boss.');
    }
    getCreature(boss.creatureId);
    if (rewards.length === 0 && result.state.phase !== 'cleared' && boss.hp > 0) {
      if (result.events.some((event) => event.calamityChest !== undefined || event.capture !== undefined ||
          event.recruitment !== undefined || event.recruitmentOutcome !== undefined)) throw new Error('Invalid Calamity reward payload.');
      if (account.creatures[boss.creatureId]) return account;
      account.creatures[boss.creatureId] = { defeated: false };
      return saveAccount(storage, account);
    }
    if (result.state.phase !== 'cleared' || boss.hp > 0 || rewards.length !== 1 ||
        reward.source !== boss.id || reward.target !== boss.id || reward.amount !== 0 ||
        reward.critical !== false || reward.calamityChest !== id ||
        Object.entries(reward).some(([key, value]) => value !== undefined &&
          !['kind', 'source', 'target', 'amount', 'critical', 'message', 'calamityChest'].includes(key)) ||
        result.events.some((event) => event !== reward && event.calamityChest !== undefined)) {
      throw new Error('Invalid Calamity chest reward.');
    }
    const receipt = `${runId}:${boss.id}`;
    if (account.receipts.includes(receipt)) return account;
    const amount = (account.calamityChests?.[id] ?? 0) + 1;
    if (!count(amount)) throw new Error('Calamity chest inventory capacity reached.');
    account.calamityChests = { ...account.calamityChests, [id]: amount };
    account.calamityClears = { ...account.calamityClears,
      [activity.activity]: Math.max(account.calamityClears?.[activity.activity] ?? 0, activity.tier) };
    account.creatures[boss.creatureId] = { defeated: true };
    account.receipts.push(receipt);
    return saveAccount(storage, account);
  }
  if (result.events.some((event) => event.calamityChest !== undefined)) throw new Error('Calamity chests require a Calamity encounter.');
  let changed = false;
  const rewardedEnemies = new Set<string>();
  const recruitments: { reward: BattleResult['events'][number]; character: WarCharacterId; outcome: 'new' | 'duplicate' }[] = [];
  const storyBonuses: { reward: BattleResult['events'][number]; bonus: ReturnType<typeof storyBossBonus> }[] = [];
  let storyCompletion: BattleResult['events'][number] | null = null;
  let storyClearPay: { fractalis: number; lycalis: number } = storyClearReward(false);
  const story = result.state.story;
  if (story) {
    const encounter = storyEncounter(story.storyStage);
    if (result.state.dungeon || result.state.infusion || result.state.war || result.state.wave !== story.storyStage ||
        story.storyStage > unlockedStoryStage(account) ||
        result.state.enemies.length !== (encounter.boss ? 1 : 2) ||
        result.state.enemies.some((enemy, index) => enemy.id !== `story-${story.storyStage}-${index}` ||
          enemy.level !== encounter.level || enemy.element !== encounter.element || enemy.boss !== encounter.boss ||
          !Array.from({ length: encounter.boss ? 1 : 4 }, (_, identity) => storyCreature(story.storyStage, identity).id).includes(enemy.creatureId ?? ''))) {
      throw new Error('Invalid or locked Story encounter.');
    }
  }
  for (const enemy of result.state.enemies) {
    if (!enemy.creatureId) continue;
    getCreature(enemy.creatureId);
    const defeated = result.events.some((event) => event.kind === 'reward' && event.source === enemy.id);
    const current = account.creatures[enemy.creatureId];
    if (!current || (defeated && !current.defeated)) {
      account.creatures[enemy.creatureId] = { defeated: defeated || current?.defeated === true };
      changed = true;
    }
  }
  for (const reward of result.events.filter((event) => event.kind === 'reward')) {
    if ('calamiticTokens' in reward) throw new Error('Calamitic Tokens only come from opening Calamity chests.');
    const receipt = `${runId}:${reward.source}`;
    if (account.receipts.includes(receipt)) continue;
    const enemy = result.state.enemies.find((unit) => unit.id === reward.source);
    if (!enemy || enemy.level === null) throw new Error('Enemy reward source is missing.');
    const multiplier = bossLootMultiplier(result.state, enemy.boss === true);
    if (reward.masterChests !== undefined) {
      const activity = result.state.infusion;
      if (reward.masterChests !== 1 || activity?.mode !== 'machines' || activity.stage !== masterChest.stage ||
          result.state.wave !== masterChest.stage || unlockedInfusionStage(account, 'machines') < masterChest.stage ||
          result.state.phase !== 'cleared' || result.state.enemies.length !== 1 ||
          enemy.id !== `infusion-machines-${masterChest.stage}-0` || !enemy.boss || enemy.hp > 0 ||
          enemy.creatureId !== 'infusion:machines:5' || enemy.level !== 120 || result.state.story || result.state.dungeon || result.state.war) {
        throw new Error('Master chests only drop from the final Awaken the Machines boss.');
      }
      account.masterChests = (account.masterChests ?? 0) + 1;
      if (!count(account.masterChests)) throw new Error('Master chest inventory capacity reached.');
    }
    if (story) {
      const stage = story.storyStage;
      const encounter = storyEncounter(stage);
      const range = bossLootRange(storyEnemyFractalisDrop(encounter.level, enemy.boss === true), multiplier);
      const materialPool = storyMaterialLoot(stage);
      if (enemy.hp > 0 || reward.capture !== undefined || reward.conduits !== undefined ||
          reward.mechanicalComponents !== undefined || reward.lycalis !== undefined || reward.storyBonus !== undefined ||
          reward.recruitment !== undefined || reward.recruitmentOutcome !== undefined ||
          !count(reward.amount) || reward.amount < range.minimum || reward.amount > range.maximum || reward.amount % multiplier !== 0 ||
          !record(reward.materials) || !count(reward.materials[`${encounter.element}-common`])) {
        throw new Error('Invalid Story reward.');
      }
      for (const [id, amount] of Object.entries(reward.materials)) {
        const drop = materialPool.find((entry) => entry.id === id);
        if (!drop || !count(amount) || amount < drop.minimum || amount > drop.maximum || amount % multiplier !== 0) throw new Error('Invalid Story material drop.');
        account.materials[id] = (account.materials[id] ?? 0) + amount;
      }
      account.fractalis += reward.amount;
      if (encounter.boss && result.state.phase === 'cleared' && (account.storyCompleted ?? 0) < stage) {
        const bonus = storyBossBonus(stage);
        account.fractalis += bonus.fractalis;
        account.lycalis += bonus.lycalis;
        storyBonuses.push({ reward, bonus });
      }
      account.receipts.push(receipt);
      changed = true;
      continue;
    }
    if (reward.storyBonus !== undefined) throw new Error('Story bonuses require a regional first clear.');
    if (result.state.war) {
      const { character, stage } = result.state.war;
      const encounter = warEncounter(character, stage);
      const loot = warLoot(stage);
      if (result.state.dungeon || result.state.infusion || result.state.enemies.length !== 1 ||
          stage > unlockedWarStage(account, character) || result.state.wave !== stage || result.state.phase !== 'cleared' ||
          enemy.hp > 0 || enemy.definitionId !== character || enemy.id !== `war-${character}-${stage}` ||
          enemy.level !== encounter.level || enemy.element !== encounter.element || enemy.evolution !== encounter.evolution || !enemy.boss ||
          enemy.creatureId || reward.capture !== undefined || reward.materials !== undefined ||
          reward.conduits !== undefined || reward.mechanicalComponents !== undefined ||
          !count(reward.amount) || reward.amount < loot.fractalis.minimum || reward.amount > loot.fractalis.maximum || reward.amount % multiplier !== 0 ||
          (reward.lycalis !== undefined && reward.lycalis !== loot.lycalis.quantity) ||
          reward.recruitmentOutcome !== undefined ||
          (reward.recruitment !== undefined && (stage !== warStageCount || reward.recruitment !== character))) {
        throw new Error('Invalid Elemental War reward.');
      }
      account.fractalis += reward.amount;
      account.lycalis += reward.lycalis ?? 0;
      if (reward.recruitment) {
        const outcome = account.characters[character] ? 'duplicate' : 'new';
        if (outcome === 'duplicate') account.lycalis += 100;
        else account.characters[character] = { level: 0, evolution: 1, weaponRank: 0 };
        recruitments.push({ reward, character, outcome });
      }
      account.receipts.push(receipt);
      changed = true;
      continue;
    }
    if (reward.recruitment !== undefined || reward.recruitmentOutcome !== undefined) throw new Error('Recruitment requires Elemental War.');
    const range = bossLootRange(result.state.infusion?.mode === 'treasury' ? treasuryFractalisDrop(enemy.level) : fractalisDrop(enemy.level, result.state.infusion?.mode === 'roses' ? 140 : 120), multiplier);
    if (result.state.infusion && (isCurrencyMode(result.state.infusion.mode) || result.state.infusion.mode === 'roses' || result.state.infusion.mode === 'machines') &&
        (enemy.hp > 0 || !enemy.creatureId || getCreature(enemy.creatureId).mode !== result.state.infusion.mode ||
          !getCreature(enemy.creatureId).stages.includes(result.state.infusion.stage) ||
          enemy.level !== infusionEncounter(result.state.infusion.mode, result.state.infusion.stage, result.state.infusion.schedule ?? 'legacy').level)) throw new Error('Invalid currency-farm reward source.');
    if (!count(reward.amount) || reward.amount < range.minimum || reward.amount > range.maximum || reward.amount % multiplier !== 0) throw new Error('Invalid enemy Prismatica drop.');
    account.fractalis += reward.amount;
    if (result.state.infusion?.mode === 'machines' && reward.mechanicalComponents === undefined) {
      throw new Error('Awaken the Machines rewards require Broken Mechanical Components.');
    }
    if (reward.mechanicalComponents !== undefined) {
      if (result.state.infusion?.mode !== 'machines') throw new Error('Broken Mechanical Components only drop in Awaken the Machines.');
      const drop = machineComponentDrop(result.state.infusion.stage);
      if (!count(reward.mechanicalComponents) || reward.mechanicalComponents < drop.minimum ||
          reward.mechanicalComponents > drop.maximum) throw new Error('Invalid Broken Mechanical Components reward.');
      account.mechanicalComponents = (account.mechanicalComponents ?? 0) + reward.mechanicalComponents;
      if (!count(account.mechanicalComponents)) throw new Error('Broken Mechanical Components balance capacity reached.');
    }
    if (reward.conduits !== undefined) {
      if (result.state.infusion?.mode !== 'machines') throw new Error('Conduit drops require Awaken the Machines.');
      const eligible = machineConduitLoot(result.state.infusion.stage, account.conduits);
      const tiers = new Set<string>();
      for (const [id, amount] of Object.entries(reward.conduits)) {
        if (!isConduitId(id) || amount !== 1 || !eligible.some((drop) => drop.id === id && drop.chance > 0)) throw new Error('Invalid machine Conduit reward: only unowned eligible names may drop.');
        const rarity = getConduit(id).rarity;
        if (tiers.has(rarity)) throw new Error('Only one Conduit per tier may drop per enemy.');
        tiers.add(rarity);
        account.conduits = { ...account.conduits, [id]: (account.conduits?.[id] ?? 0) + amount };
      }
    }
    if (reward.lycalis !== undefined) {
      const creature = enemy.creatureId ? getCreature(enemy.creatureId) : undefined;
      if (!Number.isInteger(reward.lycalis) || reward.lycalis < 1 ||
          !result.state.infusion || result.state.infusion.mode === 'treasury' || result.state.infusion.mode === 'roses' || result.state.infusion.mode === 'machines' || creature?.mode !== result.state.infusion.mode ||
          !creature.stages.includes(result.state.infusion.stage) || enemy.hp > 0 ||
          enemy.level !== infusionEncounter(result.state.infusion.mode, result.state.infusion.stage, result.state.infusion.schedule ?? 'legacy').level ||
          !stagedLycalisOdds(result.state.infusion.mode, enemy.level, result.state.infusion.stage).some((outcome) => outcome.amount === reward.lycalis)) {
        throw new Error('Invalid enemy Null-Prismatica reward.');
      }
      account.lycalis += reward.lycalis;
    }
    if (result.state.infusion?.mode === 'roses' && !count(reward.materials?.['rosethorn-common'])) throw new Error('Roselius rewards require their guaranteed Seed drop.');
    for (const [id, amount] of Object.entries(reward.materials ?? {})) {
      if (result.state.infusion && (isCurrencyMode(result.state.infusion.mode) || result.state.infusion.mode === 'machines')) throw new Error('This activity does not drop materials.');
      if (!count(amount) || !isMaterial(id)) throw new Error('Invalid enemy material drop.');
      if (result.state.infusion?.mode === 'roses') {
        const drop = infusionLoot('roses', result.state.infusion.stage).specialties.find((entry) => entry.id === id);
        if (!drop || amount < drop.minimum || amount > drop.maximum || amount % multiplier !== 0) throw new Error('Invalid Rosethorn material drop.');
      } else if (roseMaterials.some((material) => material.id === id)) throw new Error('Rosethorn materials only drop in Passion of Crimson Roses.');
      if (multiplier > 1) {
        const activity = result.state.infusion;
        const pool = result.state.dungeon ? materialLoot(result.state.dungeon.element, result.state.dungeon.stage)
          : activity ? (() => {
            const loot = infusionLoot(activity.mode, activity.stage, activity.schedule ?? 'legacy');
            return [...loot.specialties, ...loot.bonuses.flatMap(drop => infusionElements(activity.mode)
              .map(element => ({ ...drop, id: `${element.id}-${drop.rarity}` })))];
          })() : [];
        const drop = pool.find(drop => drop.id === id);
        if (!drop || amount < drop.minimum || amount > drop.maximum || amount % multiplier !== 0) {
          throw new Error('Invalid final-boss material drop.');
        }
      }
      account.materials[id] = (account.materials[id] ?? 0) + amount;
    }
    if (reward.capture) {
      const creature = getCreature(reward.capture.creatureId);
      const stage = result.state.infusion?.stage;
      if (!creature.mode || creature.mode === 'machines' || !stage || creature.mode !== result.state.infusion?.mode ||
          enemy.hp > 0 || enemy.creatureId !== creature.id || !creature.stages.includes(stage) || reward.capture.level !== Math.min(capturedLevelCap, enemy.level) ||
          enemy.level !== infusionEncounter(creature.mode, stage, result.state.infusion?.schedule ?? 'legacy').level ||
          (creature.mode === 'roses' && enemy.level > roseCaptureMaximumLevel)) {
        throw new Error('Invalid captured enemy reward.');
      }
      const copy = createCreatureCopy(creature.id, stage, enemy.level);
      account.capturedCharacters = validateCapturedCharacters([...(account.capturedCharacters ?? []), copy]);
    }
    rewardedEnemies.add(enemy.id);
    account.receipts.push(receipt);
    changed = true;
  }

  const dungeon = result.state.dungeon;
  if (dungeon && result.state.phase === 'cleared') {
    const unlocked = Math.min(dungeonStageCount, dungeon.stage + 1);
    if ((account.dungeonStages[dungeon.element] ?? 1) < unlocked) {
      account.dungeonStages[dungeon.element] = unlocked;
      changed = true;
    }
  }
  const infusion = result.state.infusion;
  if (infusion && result.state.phase === 'cleared') {
    const unlocked = Math.min(infusionStageCount(infusion.mode), infusion.stage + 1);
    if ((account.infusionStages[infusion.mode] ?? 1) < unlocked) {
      account.infusionStages[infusion.mode] = unlocked;
      changed = true;
    }
  }
  const war = result.state.war;
  if (war && result.state.phase === 'cleared' && result.state.enemies.length === 1 &&
      result.state.enemies[0].hp <= 0 && account.receipts.includes(`${runId}:${result.state.enemies[0].id}`)) {
    const unlocked = Math.min(warStageCount, war.stage + 1);
    if (unlockedWarStage(account, war.character) < unlocked) {
      account.warStages = { ...account.warStages, [war.character]: unlocked };
      changed = true;
    }
  }
  if (story && result.state.phase === 'cleared') {
    if (result.state.enemies.some((enemy) => enemy.hp > 0 || !account.receipts.includes(`${runId}:${enemy.id}`))) {
      throw new Error('Story clear requires saved rewards for every defeated enemy.');
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
      storyCompletion = result.events.filter((event) => event.kind === 'reward').at(-1) ?? null;
      changed = true;
    }
  }
  if (!story && !war && result.state.phase === 'cleared' && result.state.enemies.length === 1) {
    const boss = result.state.enemies[0];
    let normalActivity: CalamityActivityId | undefined;
    if (boss.boss && boss.hp <= 0 && boss.creatureId &&
        rewardedEnemies.has(boss.id) &&
        account.receipts.includes(`${runId}:${boss.id}`)) {
      if (dungeon && !infusion && isPlayableDungeon(dungeon.element) && dungeon.stage === dungeonStageCount &&
          result.state.wave === dungeon.stage && boss.id === `dungeon-${dungeon.element}-${dungeon.stage}-0` &&
          boss.level === elementalEnemyLevel(dungeon.stage) && boss.element === dungeon.element &&
          dungeonVariants(dungeon.element, dungeon.stage).some((variant) => variant.creatureId === boss.creatureId)) {
        normalActivity = dungeon.element;
      } else if (infusion && !dungeon && isInfusionMode(infusion.mode) && infusion.stage === infusionStageCount(infusion.mode) &&
          result.state.wave === infusion.stage && boss.id === `infusion-${infusion.mode}-${infusion.stage}-0`) {
        const encounter = infusionEncounter(infusion.mode, infusion.stage, infusion.schedule ?? 'legacy');
        if (boss.level === encounter.level && boss.element === encounter.enemy.element &&
            boss.creatureId === `infusion:${infusion.mode}:${encounter.tier}`) normalActivity = infusion.mode;
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
    storyCompletion.message += storyClearPay.lycalis > 0
      ? ` First stage clear: +${storyClearPay.fractalis} Prismatica and +${storyClearPay.lycalis} Null-Prismatica.`
      : ` Stage clear: +${storyClearPay.fractalis} Prismatica.`;
  }
  for (const { reward, character, outcome } of recruitments) {
    reward.recruitmentOutcome = outcome;
    reward.message += outcome === 'new' ? ` ${getStarter(character).name} recruited at Lv.0 · Evo.1.`
      : ' Already-owned recruitment converted to 100 Null-Prismatica.';
  }
  return saved;
}

export function unlockedWarStage(account: Account, character: WarCharacterId): number {
  if (!isWarCharacter(character)) throw new Error('Unknown Elemental War challenger.');
  return account.warStages?.[character] ?? 1;
}

export function unlockedStoryStage(account: Account): number {
  return Math.min(storyRules.stages, (account.storyCompleted ?? 0) + 1);
}

export function unlockedStage(account: Account, dungeon: PlayableDungeon): number {
  if (!playableDungeons.includes(dungeon)) throw new Error('Dungeon is not playable.');
  return account.dungeonStages[dungeon] ?? 1;
}

export function levelCapturedCharacter(storage: ProfileStorage, id: string, expectedLevel: number): Account {
  if (!loadProfile(storage)) throw new Error('Choose your first Element-Bearer before leveling.');
  const account = loadAccount(storage);
  const copy = account.capturedCharacters?.find((entry) => entry.instanceId === id);
  if (!copy) throw new Error('Choose an owned captured Elemental-Devourer.');
  const progress = capturedProgress(copy);
  if (progress.level !== expectedLevel) throw new Error('Captured Elemental-Devourer level changed. Reopen this screen.');
  const cost = capturedLevelCost(copy);
  if (account.fractalis < cost.fractalis) throw new Error('Not enough Prismatica.');
  for (const [material, amount] of Object.entries(cost.materials)) if ((account.materials[material] ?? 0) < amount) throw new Error(`Not enough ${materialName(material)}.`);
  account.fractalis -= cost.fractalis;
  for (const [material, amount] of Object.entries(cost.materials)) account.materials[material] -= amount;
  copy.level = progress.level + 1;
  copy.capturedStage = progress.stage;
  copy.skills = structuredClone(progress.skills);
  return saveAccount(storage, account);
}

export interface MaxLevelPlan {
  id: string;
  currentLevel: number;
  targetLevel: number;
  cap: number;
  cost: UpgradeCost;
  progressKey: string;
}

export function maxLevelPlan(account: Account, id: string): MaxLevelPlan {
  if (!ownedCharacterInstances(account).includes(id)) throw new Error('Choose an owned character.');
  const starter = isStarterId(id) ? getStarter(id) : null;
  const copy = account.capturedCharacters?.find((entry) => entry.instanceId === id);
  const current = starter ? ownedProgress(account, starter.id) : copy ? capturedProgress(copy) : null;
  if (!current) throw new Error('Character progress is missing.');
  const cap = starter ? characterLevelCap(ownedProgress(account, starter.id).evolution) : capturedLevelCap;
  const cost: UpgradeCost = { fractalis: 0, materials: {} };
  let targetLevel = current.level;
  while (targetLevel < cap) {
    const nextCost = starter
      ? characterLevelCost(starter.id, { ...ownedProgress(account, starter.id), level: targetLevel })
      : copy ? capturedLevelCost({ ...copy, level: targetLevel }) : null;
    if (!nextCost) throw new Error('Character level cost is missing.');
    if (cost.fractalis + nextCost.fractalis > account.fractalis ||
        Object.entries(nextCost.materials).some(([material, amount]) =>
          (cost.materials[material] ?? 0) + amount > (account.materials[material] ?? 0))) break;
    cost.fractalis += nextCost.fractalis;
    for (const [material, amount] of Object.entries(nextCost.materials)) {
      cost.materials[material] = (cost.materials[material] ?? 0) + amount;
    }
    targetLevel++;
  }
  return { id, currentLevel: current.level, targetLevel, cap, cost,
    progressKey: JSON.stringify([starter ? ownedProgress(account, starter.id) : copy, account.conduitEquipment?.[id], account.conduitUpgrades]) };
}

export function levelCharacterToMaximum(storage: ProfileStorage, expected: MaxLevelPlan): Account {
  if (!loadProfile(storage)) throw new Error('Choose a starter before leveling.');
  const account = loadAccount(storage);
  const plan = maxLevelPlan(account, expected.id);
  if (JSON.stringify(plan) !== JSON.stringify(expected)) throw new Error('Progress or available resources changed. Reopen Max Level.');
  if (plan.targetLevel === plan.currentLevel) throw new Error('No additional levels are affordable within the current cap.');
  account.fractalis -= plan.cost.fractalis;
  for (const [material, amount] of Object.entries(plan.cost.materials)) account.materials[material] -= amount;
  if (isStarterId(plan.id)) {
    account.characters[plan.id] = { ...ownedProgress(account, plan.id), level: plan.targetLevel };
  } else {
    const copy = account.capturedCharacters?.find((entry) => entry.instanceId === plan.id);
    if (!copy) throw new Error('Captured Elemental-Devourer is no longer owned.');
    const progress = capturedProgress(copy);
    copy.level = plan.targetLevel;
    copy.capturedStage = progress.stage;
    copy.skills = structuredClone(progress.skills);
  }
  return saveAccount(storage, account);
}
export function unlockedInfusionStage(account: Account, mode: InfusionModeId): number {
  if (!isInfusionMode(mode)) throw new Error('Unknown infusion mode.');
  return account.infusionStages[mode] ?? 1;
}
