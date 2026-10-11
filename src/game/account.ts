import { elementalMaterials, dungeonStageCount, elementalEnemyLevel, infusionStageCount, isCurrencyMode, evolutionRequirement, type ElementId } from '../content/activities';
import { fractalisDrop, storyFractalisDrop, treasuryFractalisDrop, stagedLycalisOdds } from '../content/loot-random';
import { characterGrowthFactor, characterLevelCap, characterEvolutionCost, characterEvolutionRequirement, fractureRules, characterLevelCost, type CharacterProgress, type UpgradeCost } from '../content/progression';
import { isInfusionMode, specialtyMaterials } from '../content/infusions';
import { type InfusionModeId } from '../content/activities';
import { getStarter, isStarterId, starters, type StarterId } from '../content/starters';
import { isPlayableDungeon, playableDungeons, type PlayableDungeon } from '../content/dungeons';
import { loadProfile, type ProfileStorage } from './profile';
import { type BattleResult } from './battle';
import { materialName } from '../content/dungeon-art';
import { getCreature } from '../content/creatures';
import { getConduit, isConduitId, validateConduitSlots, normalizeLegacyKitSlots, validateConduitElement, conduitSlotCount, validateConduitUpgrades, conduitUpgradeCost, type ConduitId, type ConduitLoadouts, type ConduitUpgrades } from '../content/conduits';
import { machineComponentDrop } from '../content/mechanical-components';
import { bannerConduitBonus, machineConduitLoot } from '../content/machines';
import { isMasterConduitId, masterChest, validateMasterCharacter, type MasterConduitId, type MasterLoadouts } from '../content/master-conduits';
import { validateCapturedCharacters, validateCharacterLocks, capturedProgress, capturedLevelCost, createCreatureCopy, type CapturedCharacter, type CharacterLocks } from './character-instances';
import { infusionEncounter, infusionLoot, creatureSaleOptions } from '../content/infusions';
import { standardBanner, resolveBannerPull, validateBannerPity, type StandardBannerEntry, type BannerPity } from '../content/standard-banner';
import { bannerDuplicateMaterials, type BannerMaterialReward } from '../content/banner-materials';
import { getSummonBanner, isSummonBannerId, type SummonBannerId } from '../content/summon-banners';
import { roseMaterials, roseCaptureMaximumLevel } from '../content/roses';
import { exchangeProduct, isExchangeQuantity } from '../content/material-exchange';
import { isWarCharacter, warEncounter, warLoot, warStageCount, type WarCharacterId } from '../content/elemental-war';
import { canonicalElement, isLegacyElement } from '../content/element-migration';
import { storyEncounter, storyCreature, storyRules, storyBossBonus, storyMaterialLoot } from '../content/story';

export const ACCOUNT_KEY = 'last-light.wallet';
export interface Account {
  version: 5;
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
  masterChests?: number;
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
  return { version: 5, fractalis: 0, lycalis: 0, materials: {}, characters: {}, firstFracture: false, dungeonStages: {}, infusionStages: {}, receipts: [], creatures: {} };
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
  if (!record(value) || (value.version !== 2 && value.version !== 3 && value.version !== 4 && value.version !== 5) || !count(value.fractalis) || !count(value.lycalis) ||
      !record(value.materials) || !record(value.characters) || !record(value.dungeonStages) ||
      typeof value.firstFracture !== 'boolean' || !Array.isArray(value.receipts) ||
      !value.receipts.every((receipt) => typeof receipt === 'string') || new Set(value.receipts).size !== value.receipts.length) {
    throw new Error('The local progression save is invalid or unsupported. It has not been overwritten.');
  }
  const account = emptyAccount();
  account.fractalis = value.fractalis;
  account.lycalis = value.lycalis;
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
    if (!count(value.storyCompleted) || value.storyCompleted > storyRules.stages) throw new Error('Invalid saved Story progress.');
    account.storyCompleted = value.storyCompleted;
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
  if (value.capturedCharacters !== undefined) account.capturedCharacters = validateCapturedCharacters(value.capturedCharacters);
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
      if (!isInfusionMode(id) || !count(stage) || stage < 1 || stage > (value.version === 2 && (id === 'heavens' || id === 'abyss') ? 25 : infusionStageCount(id))) throw new Error('Invalid saved infusion stage.');
      account.infusionStages[id] = value.version === 2 && (id === 'heavens' || id === 'abyss')
        ? 1 + Math.round((stage - 1) * (dungeonStageCount - 1) / 24) : stage;
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
    if (creature.mode !== requirement.infusion) reasons.push('Wrong infusion mode');
    if (form < (requirement.minimumCreatureForm ?? 1)) reasons.push(`Requires form ${requirement.minimumCreatureForm} or higher`);
    if (protection.locked) reasons.push('Locked');
    if (protection.inSquad) reasons.push('In squad');
    if (account.conduitEquipment?.[copy.instanceId]?.some((id) => id !== null)) reasons.push('Conduits equipped');
    return { copy, index: index + 1, creature, form, reasons, eligible: reasons.length === 0 };
  });
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
  const creatureCount = kind === 'evolve' ? characterEvolutionRequirement(id, current.evolution).creatureCount : 0;
  if (fodderIds.length !== creatureCount || new Set(fodderIds).size !== fodderIds.length) {
    throw new Error(`Select exactly ${creatureCount} distinct captured Elemental-Devourers for this upgrade.`);
  }
  if (fodderIds.length) {
    const options = evolutionFodderOptions(account, element, current.evolution, id);
    for (const id of fodderIds) {
      const option = options.find((entry) => entry.copy.instanceId === id);
      if (!option) throw new Error('Selected captured Elemental-Devourer is no longer owned.');
      if (!option.eligible) throw new Error(`Cannot consume ${option.creature.name} · Copy ${option.index}: ${option.reasons.join(', ')}.`);
    }
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
  let changed = false;
  const recruitments: { reward: BattleResult['events'][number]; character: WarCharacterId; outcome: 'new' | 'duplicate' }[] = [];
  const storyBonuses: { reward: BattleResult['events'][number]; bonus: ReturnType<typeof storyBossBonus> }[] = [];
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
    const receipt = `${runId}:${reward.source}`;
    if (account.receipts.includes(receipt)) continue;
    const enemy = result.state.enemies.find((unit) => unit.id === reward.source);
    if (!enemy || enemy.level === null) throw new Error('Enemy reward source is missing.');
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
      const range = storyFractalisDrop(encounter.level);
      const materialPool = storyMaterialLoot(stage);
      if (enemy.hp > 0 || reward.capture !== undefined || reward.conduits !== undefined ||
          reward.mechanicalComponents !== undefined || reward.lycalis !== undefined || reward.storyBonus !== undefined ||
          reward.recruitment !== undefined || reward.recruitmentOutcome !== undefined ||
          !count(reward.amount) || reward.amount < range.minimum || reward.amount > range.maximum ||
          !record(reward.materials) || !count(reward.materials[`${encounter.element}-common`])) {
        throw new Error('Invalid Story reward.');
      }
      for (const [id, amount] of Object.entries(reward.materials)) {
        const drop = materialPool.find((entry) => entry.id === id);
        if (!drop || !count(amount) || amount < drop.minimum || amount > drop.maximum) throw new Error('Invalid Story material drop.');
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
          !count(reward.amount) || reward.amount < loot.fractalis.minimum || reward.amount > loot.fractalis.maximum ||
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
    const range = result.state.infusion?.mode === 'treasury' ? treasuryFractalisDrop(enemy.level) : fractalisDrop(enemy.level, result.state.infusion?.mode === 'roses' ? 140 : 120);
    if (result.state.infusion && (isCurrencyMode(result.state.infusion.mode) || result.state.infusion.mode === 'roses' || result.state.infusion.mode === 'machines') &&
        (enemy.hp > 0 || !enemy.creatureId || getCreature(enemy.creatureId).mode !== result.state.infusion.mode ||
          !getCreature(enemy.creatureId).stages.includes(result.state.infusion.stage) ||
          enemy.level !== infusionEncounter(result.state.infusion.mode, result.state.infusion.stage, result.state.infusion.schedule ?? 'legacy').level)) throw new Error('Invalid currency-farm reward source.');
    if (!count(reward.amount) || reward.amount < range.minimum || reward.amount > range.maximum) throw new Error('Invalid enemy Prismatica drop.');
    account.fractalis += reward.amount;
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
      const eligible = machineConduitLoot(result.state.infusion.stage);
      const tiers = new Set<string>();
      for (const [id, amount] of Object.entries(reward.conduits)) {
        if (!isConduitId(id) || amount !== 1 || !eligible.some((drop) => drop.id === id)) throw new Error('Invalid machine Conduit reward.');
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
          !stagedLycalisOdds(result.state.infusion.mode, enemy.level).some((outcome) => outcome.amount === reward.lycalis)) {
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
        if (!drop || amount < drop.minimum || amount > drop.maximum) throw new Error('Invalid Rosethorn material drop.');
      } else if (roseMaterials.some((material) => material.id === id)) throw new Error('Rosethorn materials only drop in Passion of Crimson Roses.');
      account.materials[id] = (account.materials[id] ?? 0) + amount;
    }
    if (reward.capture) {
      const creature = getCreature(reward.capture.creatureId);
      const stage = result.state.infusion?.stage;
      if (!creature.mode || creature.mode === 'machines' || !stage || creature.mode !== result.state.infusion?.mode ||
          enemy.hp > 0 || enemy.creatureId !== creature.id || !creature.stages.includes(stage) || reward.capture.level !== enemy.level ||
          enemy.level !== infusionEncounter(creature.mode, stage, result.state.infusion?.schedule ?? 'legacy').level ||
          (creature.mode === 'roses' && enemy.level > roseCaptureMaximumLevel)) {
        throw new Error('Invalid captured enemy reward.');
      }
      const copy = createCreatureCopy(creature.id, stage, enemy.level);
      account.capturedCharacters = validateCapturedCharacters([...(account.capturedCharacters ?? []), copy]);
    }
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
  const cap = starter ? characterLevelCap(ownedProgress(account, starter.id).evolution) : 120;
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
