import { emptyAccount, validateAccount, ACCOUNT_KEY, type Account } from './game/account';
import { SAVE_KEY, type ProfileStorage } from './game/profile';
import { starters, getStarter, isStarterId } from './content/starters';
import { characterArt, characterName } from './content/character-art';
import { conduits } from './content/conduits';
import { masterConduits } from './content/master-conduits';
import { elements, elementalMaterials } from './content/activities';
import { specialtyMaterials } from './content/infusions';
import { roseMaterials } from './content/roses';
import { creatures, getCreature } from './content/creatures';
import { capturedProgress, resolveCapturedFighter } from './game/character-instances';
import { resolveFighter } from './content/combat';
import { evolutionRarity } from './content/progression';

export function exampleAccount(): Account {
  const account = emptyAccount();
  account.fractalis = 248_500;
  account.lycalis = 320;
  account.mechanicalComponents = 1240;
  account.calamiticTokens = 12;
  account.storyCompleted = 24;
  account.characters = Object.fromEntries(starters.map(person =>
    [person.id, { level: person.id === 'ember' ? 75 : 60, evolution: 4, weaponRank: 0 }]));
  account.squad = ['ember', 'tide', 'sprout'];
  account.materials = Object.fromEntries([...elementalMaterials, ...specialtyMaterials.filter(entry => !entry.id.endsWith('-weapon')), ...roseMaterials]
    .map((entry, index) => [entry.id, [132, 85, 81, 68, 46, 28][index % 6]]));
  account.conduits = Object.fromEntries(conduits.filter(entry => entry.rarity !== 'Calamitic').slice(0, 24).map(entry => [entry.id, 1]));
  account.conduitEquipment = Object.fromEntries(starters.map(person =>
    [person.id, [conduits[0].id, conduits[1].id, null, null, null, null, null, null]]));
  account.conduitUpgrades = { [conduits[0].id]: 2 };
  account.masterConduits = Object.fromEntries(masterConduits.slice(0, 2).map(entry => [entry.id, 1]));
  account.masterChests = 1;
  account.calamityChests = { 'calamity:heavens:1': 2, 'calamity:machines:3': 1 };
  account.bannerPity = { standard: { highestStar: 42, unownedHighestStar: 0 }, roses: { highestStar: 17, unownedHighestStar: 0 } };
  account.dungeonStages = Object.fromEntries(elements.map(entry => [entry.id, entry.id === 'infernic' ? 35 : 18]));
  account.infusionStages = { heavens: 15, abyss: 12, machines: 35, treasury: 15, sanctuary: 10, roses: 15 };
  account.normalFinalClears = { infernic: true, heavens: true, machines: true };
  account.calamityClears = { machines: 2 };
  account.warStages = { nerithe: 4, orvella: 1, vaelor: 1 };
  const eligible = creatures.filter(entry => ['heavens', 'abyss', 'treasury', 'sanctuary', 'roses'].includes(entry.mode ?? ''));
  account.capturedCharacters = eligible.map((entry, index) => ({
    instanceId: `capture:00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
    creatureId: entry.id, locked: index === 0,
  }));
  account.creatures = Object.fromEntries(creatures.slice(0, 45).map(entry => [entry.id, { defeated: true }]));
  return validateAccount(account);
}

/** The live transaction code only sees this private Map, never browser storage or a signed-in account. */
export function createExampleSession(initial: Account = exampleAccount()) {
  let current = validateAccount(initial);
  const values = new Map<string, string>([
    [SAVE_KEY, JSON.stringify({ version: 1, starterId: 'ember' })],
    [ACCOUNT_KEY, JSON.stringify(current)],
  ]);
  const storage: ProfileStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => {
      if (key === ACCOUNT_KEY) current = validateAccount(JSON.parse(value));
      values.set(key, value);
    },
    removeItem: key => { values.delete(key); },
  };
  return { storage, account: () => current, reset: () => storage.setItem(ACCOUNT_KEY, JSON.stringify(exampleAccount())) };
}

export function memberDisplay(account: Account, id: string) {
  const equipment = account.conduitEquipment?.[id];
  if (isStarterId(id)) {
    const person = getStarter(id), progress = account.characters[id];
    if (!progress) throw new Error('Element-Bearer is not owned.');
    return { id, name: person.name, fullName: characterName(id, progress.evolution),
      elementId: person.elementId, element: person.element, role: person.role, stars: person.stars,
      rarity: evolutionRarity(progress.evolution), progress, art: `characters/${characterArt(id, progress.evolution).art}`,
      fighter: resolveFighter(id, progress, equipment, account.conduitUpgrades, account.masterEquipment?.[id] ?? undefined) };
  }
  const copy = account.capturedCharacters?.find(entry => entry.instanceId === id);
  if (!copy) throw new Error('Captured Elemental-Devourer is not owned.');
  const creature = getCreature(copy.creatureId), progress = capturedProgress(copy);
  return { id, name: creature.name, fullName: creature.name, elementId: creature.element,
    element: elements.find(entry => entry.id === creature.element)!.name, role: 'Elemental-Devourer',
    stars: progress.tier + 1, rarity: evolutionRarity(progress.tier + 1),
    progress: { level: progress.level, evolution: progress.tier + 1 },
    art: creature.art ? `enemies/${creature.art}` : '', fighter: resolveCapturedFighter(copy, equipment, account.conduitUpgrades) };
}
