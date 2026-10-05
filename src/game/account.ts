import { elementalMaterials, dungeonStageCount } from '../content/activities';
import { fractalisDrop } from '../content/loot-random';
import { characterGrowthFactor, characterLevelCap, evolutionCost, fractureRules, levelCost, weaponCost, type CharacterProgress } from '../content/progression';
import { isInfusionMode, specialtyMaterials } from '../content/infusions';
import { type InfusionModeId } from '../content/activities';
import { getStarter, isStarterId, starters, type StarterId } from '../content/starters';
import { lootRoll } from '../content/loot-random';
import { isPlayableDungeon, playableDungeons, type PlayableDungeon } from '../content/dungeons';
import { loadProfile, type ProfileStorage } from './profile';
import { type BattleResult } from './battle';
import { materialName } from '../content/dungeon-art';
import { getCreature } from '../content/creatures';

export const ACCOUNT_KEY = 'last-light.wallet';
export interface Account {
  version: 3;
  fractalis: number;
  lycalis: number;
  materials: Record<string, number>;
  characters: Partial<Record<StarterId, CharacterProgress>>;
  squad?: StarterId[];
  firstFracture: boolean;
  dungeonStages: Partial<Record<PlayableDungeon, number>>;
  infusionStages: Partial<Record<InfusionModeId, number>>;
  receipts: string[];
  creatures: Record<string, { defeated: boolean }>;
}
export function emptyAccount(): Account {
  return { version: 3, fractalis: 0, lycalis: 0, materials: {}, characters: {}, firstFracture: false, dungeonStages: {}, infusionStages: {}, receipts: [], creatures: {} };
}
function count(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
export function validateAccount(value: unknown): Account {
  if (!record(value) || (value.version !== 2 && value.version !== 3) || !count(value.fractalis) || !count(value.lycalis) ||
      !record(value.materials) || !record(value.characters) || !record(value.dungeonStages) ||
      typeof value.firstFracture !== 'boolean' || !Array.isArray(value.receipts) ||
      !value.receipts.every((receipt) => typeof receipt === 'string') || new Set(value.receipts).size !== value.receipts.length) {
    throw new Error('The local progression save is invalid or unsupported. It has not been overwritten.');
  }
  const account = emptyAccount();
  account.fractalis = value.fractalis;
  account.lycalis = value.lycalis;
  account.firstFracture = value.firstFracture;
  account.receipts = [...value.receipts];
  for (const [id, amount] of Object.entries(value.materials)) {
    if (!isMaterial(id) || !count(amount)) throw new Error(`Invalid saved material: ${id}.`);
    account.materials[id] = amount;
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
  if (value.squad !== undefined) {
    if (!Array.isArray(value.squad) || value.squad.length < 1 || value.squad.length > 3 ||
        new Set(value.squad).size !== value.squad.length ||
        !value.squad.every((id) => isStarterId(id) && account.characters[id] !== undefined)) {
      throw new Error('Invalid saved squad. Equip one to three distinct owned characters.');
    }
    account.squad = [...value.squad];
  }
  for (const [id, stage] of Object.entries(value.dungeonStages)) {
    if (!isPlayableDungeon(id) || !count(stage) || stage < 1 || stage > (value.version === 2 ? 50 : dungeonStageCount)) throw new Error('Invalid saved dungeon stage.');
    account.dungeonStages[id] = value.version === 2
      ? 1 + Math.round((Math.min(stage, 45) - 1) * (dungeonStageCount - 1) / 44) : stage;
  }
  if (value.infusionStages !== undefined) {
    if (!record(value.infusionStages)) throw new Error('Invalid saved infusion stages.');
    for (const [id, stage] of Object.entries(value.infusionStages)) {
      if (!isInfusionMode(id) || !count(stage) || stage < 1 || stage > (value.version === 2 ? 25 : dungeonStageCount)) throw new Error('Invalid saved infusion stage.');
      account.infusionStages[id] = value.version === 2
        ? 1 + Math.round((stage - 1) * (dungeonStageCount - 1) / 24) : stage;
    }
    if (value.creatures !== undefined) {
      if (!record(value.creatures)) throw new Error('Invalid saved creature discoveries.');
      for (const [id, entry] of Object.entries(value.creatures)) {
        getCreature(id);
        if (!record(entry) || typeof entry.defeated !== 'boolean') throw new Error('Invalid saved creature discovery.');
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
export function equippedSquad(account: Account): StarterId[] {
  const ids = account.squad ?? ownedCharacters(account).slice(0, 1);
  if (!ids.length || ids.length > 3 || new Set(ids).size !== ids.length ||
      ids.some((id) => !isStarterId(id) || account.characters[id] === undefined)) {
    throw new Error('Equip one to three distinct owned characters before entering battle.');
  }
  return [...ids];
}
export function setSquad(storage: ProfileStorage, ids: readonly StarterId[]): Account {
  if (!loadProfile(storage)) throw new Error('Choose your first companion before editing a squad.');
  const account = loadAccount(storage);
  account.squad = [...ids];
  return saveAccount(storage, account);
}
export const summonCost = 10;
export function summonPool(account: Account): StarterId[] {
  return starters.filter((starter) => account.characters[starter.id] === undefined).map((starter) => starter.id);
}
export function summonCharacter(storage: ProfileStorage, random: () => number = Math.random): { account: Account; id: StarterId } {
  if (!loadProfile(storage)) throw new Error('Choose your first companion before summoning.');
  const account = loadAccount(storage);
  const pool = summonPool(account);
  if (!pool.length) throw new Error('All available characters are already owned. No Lycalis was spent.');
  if (account.lycalis < summonCost) throw new Error(`Summoning requires ${summonCost} Lycalis.`);
  const id = pool[Math.floor(lootRoll(random) * pool.length)];
  account.lycalis -= summonCost;
  account.characters[id] = { level: 0, evolution: 1, weaponRank: 0 };
  return { account: saveAccount(storage, account), id };
}
export function ownedProgress(account: Account, id: StarterId): CharacterProgress {
  return account.characters[id] ?? { level: 0, evolution: 1 };
}
export function saveAccount(storage: ProfileStorage, account: Account): Account {
  const validated = validateAccount(account);
  storage.setItem(ACCOUNT_KEY, JSON.stringify(validated));
  return validated;
}
function isMaterial(id: string): boolean {
  return elementalMaterials.some((material) => material.id === id) || specialtyMaterials.some((material) => material.id === id);
}
export function upgradeCharacter(storage: ProfileStorage, id: StarterId, kind: 'level' | 'evolve' | 'weapon', expected: CharacterProgress): Account {
  if (!loadProfile(storage)) throw new Error('Choose your owned companion to upgrade.');
  if (kind !== 'level' && kind !== 'evolve' && kind !== 'weapon') throw new Error('Unknown character upgrade.');
  const account = loadAccount(storage);
  if (account.characters[id] === undefined) throw new Error('Choose your owned companion to upgrade.');
  const current = ownedProgress(account, id);
  if (current.level !== expected.level || current.evolution !== expected.evolution || (current.weaponRank ?? 0) !== (expected.weaponRank ?? 0)) throw new Error('Character progress changed. Reopen this tab before upgrading.');
  const element = getStarter(id).elementId;
  const cost = kind === 'level' ? levelCost(element, current) : kind === 'weapon' ? weaponCost(element, current) : evolutionCost(element, current);
  if (kind === 'evolve' && current.level !== characterLevelCap(current.evolution)) throw new Error('Reach this form level cap before evolving.');
  if (account.fractalis < cost.fractalis) throw new Error('Not enough Fractalis.');
  for (const [material, amount] of Object.entries(cost.materials)) {
    if ((account.materials[material] ?? 0) < amount) throw new Error(`Not enough ${materialName(material)}.`);
  }
  account.fractalis -= cost.fractalis;
  for (const [material, amount] of Object.entries(cost.materials)) account.materials[material] -= amount;
  account.characters[id] = kind === 'level' ? { ...current, level: current.level + 1 } : kind === 'weapon'
    ? { ...current, weaponRank: (current.weaponRank ?? 0) + 1 } : { ...current, evolution: current.evolution + 1 };
  if (kind === 'evolve' && !account.firstFracture) {
    account.lycalis += fractureRules.lycalisReward;
    account.firstFracture = true;
  }
  return saveAccount(storage, account);
}
export function saveAccountRewards(storage: ProfileStorage, result: BattleResult, runId: string): Account {
  const account = loadAccount(storage);
  let changed = false;
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
    const range = fractalisDrop(enemy.level);
    if (!count(reward.amount) || reward.amount < range.minimum || reward.amount > range.maximum) throw new Error('Invalid enemy Fractalis drop.');
    account.fractalis += reward.amount;
    for (const [id, amount] of Object.entries(reward.materials ?? {})) {
      if (!count(amount) || !isMaterial(id)) throw new Error('Invalid enemy material drop.');
      account.materials[id] = (account.materials[id] ?? 0) + amount;
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
    const unlocked = Math.min(dungeonStageCount, infusion.stage + 1);
    if ((account.infusionStages[infusion.mode] ?? 1) < unlocked) {
      account.infusionStages[infusion.mode] = unlocked;
      changed = true;
    }
  }
  return changed ? saveAccount(storage, account) : account;
}

export function unlockedStage(account: Account, dungeon: PlayableDungeon): number {
  if (!playableDungeons.includes(dungeon)) throw new Error('Dungeon is not playable.');
  return account.dungeonStages[dungeon] ?? 1;
}
export function unlockedInfusionStage(account: Account, mode: InfusionModeId): number {
  if (!isInfusionMode(mode)) throw new Error('Unknown infusion mode.');
  return account.infusionStages[mode] ?? 1;
}
