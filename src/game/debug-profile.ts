import { currencyModes, dungeonStageCount, elementalMaterials, eventModes, infusionModes, machineModes } from '../content/activities';
import { conduits, conduitUpgradeCap } from '../content/conduits';
import { creatures } from '../content/creatures';
import { playableDungeons } from '../content/dungeons';
import { elementalWars, warStageCount } from '../content/elemental-war';
import { infusionEncounter, specialtyMaterials } from '../content/infusions';
import { masterConduits } from '../content/master-conduits';
import { characterGrowth, characterLevelCap } from '../content/progression';
import { roseMaterials } from '../content/roses';
import { starters } from '../content/starters';
import { storyRules } from '../content/story';
import { ACCOUNT_KEY, emptyAccount, validateAccount, type Account } from './account';
import { createCreatureCopy } from './character-instances';
import { SAVE_KEY, type ProfileStorage } from './profile';

export const debugPhrase = 'Iamthelight';

export function createDebugAccount(): Account {
  const account = emptyAccount();
  account.fractalis = 1_000_000_000;
  account.lycalis = 1_000_000_000;
  account.mechanicalComponents = 1_000_000_000;
  account.masterChests = 100;
  account.materials = Object.fromEntries([...elementalMaterials, ...specialtyMaterials, ...roseMaterials].map(material => [material.id, 1_000_000]));
  account.characters = Object.fromEntries(starters.map(starter => [starter.id, {
    level: characterLevelCap(characterGrowth.forms), evolution: characterGrowth.forms,
  }]));
  account.squad = ['ember', 'tide', 'sprout'];
  account.conduits = Object.fromEntries(conduits.map(conduit => [conduit.id, 1]));
  account.conduitUpgrades = Object.fromEntries(conduits.map(conduit => [conduit.id, conduitUpgradeCap]));
  account.masterConduits = Object.fromEntries(masterConduits.map(master => [master.id, 1]));
  account.firstFracture = true;
  account.storyCompleted = storyRules.stages;
  account.dungeonStages = Object.fromEntries(playableDungeons.map(dungeon => [dungeon, dungeonStageCount]));
  account.infusionStages = Object.fromEntries([...infusionModes, ...currencyModes, ...eventModes, ...machineModes].map(mode => [mode.id, mode.stages]));
  account.warStages = Object.fromEntries(elementalWars.map(war => [war.character, warStageCount]));
  account.creatures = Object.fromEntries(creatures.map(creature => [creature.id, { defeated: true }]));
  account.capturedCharacters = creatures.flatMap(creature => {
    const mode = creature.mode;
    if (!mode || mode === 'machines') return [];
    return Array.from({ length: 3 }, () => {
      const stage = creature.stages[0];
      const encounter = infusionEncounter(mode, stage);
      return createCreatureCopy(creature.id, stage, 120, encounter.level > 120 ? 'banner-duplicate' : undefined);
    });
  });
  return validateAccount(account);
}

export class DebugProfileStorage implements ProfileStorage {
  private memory: Map<string, string> | null = null;

  constructor(private readonly saved: ProfileStorage, private readonly development: boolean) {}

  get active(): boolean { return this.memory !== null; }

  activate(): void {
    if (!this.development) throw new Error('Debug profiles are available only in development builds.');
    if (this.active) throw new Error('The debug profile is already active.');
    const account = createDebugAccount();
    this.memory = new Map([
      [SAVE_KEY, JSON.stringify({ version: 1, starterId: 'ember' })],
      [ACCOUNT_KEY, JSON.stringify(account)],
    ]);
  }

  getItem(key: string): string | null {
    return this.memory ? this.memory.get(key) ?? null : this.saved.getItem(key);
  }

  setItem(key: string, value: string): void {
    if (this.memory) this.memory.set(key, value);
    else this.saved.setItem(key, value);
  }

  removeItem(key: string): void {
    if (this.memory) this.memory.delete(key);
    else this.saved.removeItem(key);
  }
}

export function bindDebugPhrase(host: Document, allowed: () => boolean, activate: () => void): () => void {
  let typed = '';
  const listener = (event: KeyboardEvent): void => {
    const target = event.target;
    if (!allowed() || event.ctrlKey || event.metaKey || event.altKey ||
        (target instanceof Element && target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])'))) {
      typed = '';
      return;
    }
    if (event.repeat || event.key === 'Shift') return;
    if (event.key.length !== 1) { typed = ''; return; }
    typed = (typed + event.key).slice(-debugPhrase.length);
    if (debugPhrase.startsWith(typed)) event.preventDefault();
    if (typed !== debugPhrase) return;
    typed = '';
    activate();
  };
  host.addEventListener('keydown', listener);
  return () => host.removeEventListener('keydown', listener);
}
