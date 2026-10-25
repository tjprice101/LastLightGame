import { getCreature } from '../content/creatures';
import { isStarterId, type StarterId } from '../content/starters';
import { infusionEncounter, capturedEnemyStats, legacyInfusionEnemyLevel } from '../content/infusions';
import { legacyActivityStageCounts } from '../content/activities';
import { enemySkills, type EnemySkill } from '../content/enemy-skills';
import { applyConduitBuffs, formatStat, type FighterDefinition, type ResolvedFighterDefinition } from '../content/combat';
import { normalizeStats } from '../content/phase-zero-stats';
import { validateConduitElement, type ConduitSlots, type ConduitUpgrades } from '../content/conduits';
import { roseDuplicateMinimumLevel, roseCaptureMaximumLevel } from '../content/roses';
import { levelingMaterials } from '../content/progression';

export interface CapturedCharacter {
  instanceId: string;
  creatureId: string;
  locked: boolean;
  level?: number;
  capturedStage?: number;
  skills?: EnemySkill[];
  acquisition?: 'banner-duplicate' | 'calamity-chest';
}
export type CharacterLocks = Partial<Record<StarterId, boolean>>;
export const capturedLevelCap = 60;

export function isCapturedInstanceId(value: unknown): value is string {
  return typeof value === 'string' && /^capture:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value);
}

/**
 * D-346 read-only migration for pre-v7 wallets: Heaven/Abyss captures retained a stage on the former
 * 35-stage layout. Re-home each onto the same creature's current stage nearest the original encounter
 * (preferring the same boss role) and rebuild its retained skills from that encounter. Levels never drop.
 */
export function migrateLegacyCapturedCopies(value: unknown): unknown {
  if (!Array.isArray(value)) return value;
  return value.map((entry: unknown) => {
    if (typeof entry !== 'object' || entry === null || !('creatureId' in entry) || !('capturedStage' in entry) ||
        typeof entry.creatureId !== 'string' || typeof entry.capturedStage !== 'number' || typeof (entry as { level?: unknown }).level !== 'number') return entry;
    const creature = getCreature(entry.creatureId);
    const mode = creature.mode;
    if (mode !== 'heavens' && mode !== 'abyss') return entry;
    const legacyStages = legacyActivityStageCounts[mode];
    const oldStage = entry.capturedStage;
    if (!Number.isInteger(oldStage) || oldStage < 1 || oldStage > legacyStages ||
        Math.min(5, Math.floor((oldStage - 1) * 6 / legacyStages)) !== infusionEncounter(mode, creature.stages[0]).tier) {
      throw new Error('Invalid captured Elemental-Devourer progression.');
    }
    const savedLevel = (entry as unknown as { level: number }).level;
    const oldLevel = legacyInfusionEnemyLevel(oldStage);
    const oldBoss = oldStage % 5 === 0;
    const ranked = creature.stages.map((stage) => infusionEncounter(mode, stage))
      .sort((a, b) => Number(b.boss === oldBoss) - Number(a.boss === oldBoss) || Math.abs(a.level - oldLevel) - Math.abs(b.level - oldLevel));
    const encounter = ranked.find((option) => Math.min(capturedLevelCap, option.level) <= savedLevel) ?? ranked[0];
    return { ...entry, capturedStage: encounter.stage, level: Math.max(savedLevel, Math.min(capturedLevelCap, encounter.level)),
      skills: enemySkills(encounter.level, encounter.boss, encounter.ability, encounter.abilityMultiplier) };
  });
}

export function validateCapturedCharacters(value: unknown): CapturedCharacter[] {
  if (!Array.isArray(value)) throw new Error('Invalid saved captured Elemental-Devourers.');
  const seen = new Set<string>();
  return value.map((entry: unknown) => {
    if (typeof entry !== 'object' || entry === null || !('instanceId' in entry) ||
        !('creatureId' in entry) || !('locked' in entry) || !isCapturedInstanceId(entry.instanceId) ||
        typeof entry.creatureId !== 'string' || typeof entry.locked !== 'boolean' || seen.has(entry.instanceId)) {
      throw new Error('Invalid or duplicate captured-character instance.');
    }
    const creature = getCreature(entry.creatureId);
    if (!creature.mode || creature.mode === 'machines') throw new Error('This Elemental-Devourer is not eligible for captured-character ownership.');
    seen.add(entry.instanceId);
    const copy: CapturedCharacter = { instanceId: entry.instanceId, creatureId: entry.creatureId, locked: entry.locked };
    if ('acquisition' in entry) {
      if (!(entry.acquisition === 'banner-duplicate' && roseDuplicateMinimumLevel(creature.id) !== undefined) &&
          !(entry.acquisition === 'calamity-chest' && creature.id === 'infusion:roses:5')) throw new Error('Invalid Elemental-Devourer acquisition source.');
      copy.acquisition = entry.acquisition;
    }
    if ('level' in entry) {
      if (!Number.isInteger(entry.level) || typeof entry.level !== 'number' || entry.level < 1 || entry.level > 120 ||
          !('capturedStage' in entry) || typeof entry.capturedStage !== 'number' || !creature.stages.includes(entry.capturedStage) ||
          !('skills' in entry) || !Array.isArray(entry.skills)) throw new Error('Invalid captured Elemental-Devourer progression.');
      const expected = infusionEncounter(creature.mode, entry.capturedStage);
      if (creature.mode === 'roses' && !copy.acquisition && expected.level > roseCaptureMaximumLevel) throw new Error('Roselius above level 120 cannot be captured.');
      if (copy.acquisition === 'calamity-chest' && (entry.level !== capturedLevelCap || entry.capturedStage !== creature.stages[0])) throw new Error('Invalid Calamity chest Elemental-Devourer progression.');
      const candidates = [expected.abilityMultiplier, expected.legacyAbilityMultiplier]
        .map(multiplier => enemySkills(expected.level, expected.boss, expected.ability, multiplier));
      const retained = entry.skills;
      const valid = candidates.find(skills => retained.length === skills.length && retained.every((skill, index) =>
        typeof skill === 'object' && skill !== null && skill.name === skills[index].name &&
        skill.multiplier === skills[index].multiplier && skill.every === skills[index].every && skill.action === skills[index].action));
      if (!valid ||
        entry.level < Math.min(capturedLevelCap, copy.acquisition === 'banner-duplicate' ? roseDuplicateMinimumLevel(creature.id)! : expected.level)) throw new Error('Invalid retained enemy abilities or level.');
      copy.level = Math.min(capturedLevelCap, entry.level);
      copy.capturedStage = entry.capturedStage;
      copy.skills = valid;
    } else if ('skills' in entry || 'capturedStage' in entry || 'acquisition' in entry) throw new Error('Incomplete captured Elemental-Devourer progression.');
    if (creature.mode === 'roses' && copy.level === undefined && infusionEncounter(creature.mode, creature.stages[0]).level > roseCaptureMaximumLevel) throw new Error('Roselius above level 120 requires banner duplicate provenance.');
    return copy;
  });
}

export function capturedProgress(copy: CapturedCharacter) {
  const creature = getCreature(copy.creatureId);
  if (!creature.mode || creature.mode === 'machines') throw new Error('Captured Elemental-Devourer mode is missing or non-capturable.');
  const stage = copy.capturedStage ?? creature.stages[0];
  const encounter = infusionEncounter(creature.mode, stage);
  // Metadata-free copies predate retained levels; keep their original 35-stage first-form level (D-346).
  const legacyLevel = creature.mode === 'heavens' || creature.mode === 'abyss' ? Math.round(80 + Math.ceil(encounter.tier * 35 / 6) * 40 / 34) : encounter.level;
  return { level: Math.min(capturedLevelCap, copy.level ?? legacyLevel), stage, tier: encounter.tier,
    skills: copy.skills ?? enemySkills(encounter.level, encounter.boss, encounter.ability, encounter.legacyAbilityMultiplier) };
}

export function capturedLevelCost(copy: CapturedCharacter) {
  const { level } = capturedProgress(copy);
  if (level >= capturedLevelCap) throw new Error(`Maximum captured Elemental-Devourer level ${capturedLevelCap} reached.`);
  const creature = getCreature(copy.creatureId);
  return { fractalis: 10 + 2 * (level + 1),
    materials: levelingMaterials(creature.mode === 'roses' ? 'rosethorn' : creature.element, level + 1) };
}

export function resolveCapturedFighter(copy: CapturedCharacter, equipment?: ConduitSlots, upgrades?: ConduitUpgrades): ResolvedFighterDefinition {
  const creature = getCreature(copy.creatureId);
  if (!creature.mode || creature.mode === 'machines') throw new Error('Captured Elemental-Devourer mode is missing or non-capturable.');
  const { level, tier, skills } = capturedProgress(copy);
  // Fixed forms use linear playable growth, never the accelerating hostile curve.
  const reference = capturedEnemyStats(level, creature.mode === 'roses' ? 140 : 120);
  const factor = .65 + .35 * tier / 5;
  const stats = { ...reference, health: reference.health * factor,
    damage: reference.damage * factor, defense: reference.defense * factor };
  const kit: FighterDefinition = { stats,
    passive: { name: 'Retained enemy form', description: 'Fixed captured form; no additional passive bonus.', damageBonus: 0, defenseBonus: 0, healFraction: 0 },
    abilities: {
      skill1: { name: 'Unavailable', description: 'This form has no retained first skill.', cooldown: 0, strength: {} },
      skill2: { name: 'Unavailable', description: 'This form has no retained second skill.', cooldown: 0, strength: {} },
      ultimate: { name: 'Unavailable', description: 'This form has no retained ultimate.', cooldown: 0, strength: {} },
    }, unavailableActions: [] };
  for (const action of ['skill1', 'skill2', 'ultimate'] as const) {
    const skill = skills.find((entry) => entry.action === action);
    if (!skill) kit.unavailableActions?.push(action);
    else kit.abilities[action] = { name: skill.name, cooldown: action === 'ultimate' ? skill.every : 0,
      description: `${formatStat(skill.multiplier * 100)}% damage to one enemy; retained enemy skill.`, strength: { damageMultiplier: skill.multiplier } };
  }
  if (equipment) validateConduitElement(equipment, creature.element);
  applyConduitBuffs(kit.stats, equipment, upgrades);
  return { ...kit, stats: normalizeStats(kit.stats) };
}

export function validateCharacterLocks(value: unknown, owned: Partial<Record<StarterId, unknown>>): CharacterLocks {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error('Invalid saved character locks.');
  const locks: CharacterLocks = {};
  for (const [id, locked] of Object.entries(value)) {
    if (!isStarterId(id) || owned[id] === undefined || typeof locked !== 'boolean') throw new Error('Character locks require an owned character.');
    locks[id] = locked;
  }
  return locks;
}

export function appendCapturedCharacter(copies: readonly CapturedCharacter[], creatureId: string,
  instanceId = `capture:${crypto.randomUUID()}`): CapturedCharacter[] {
  return validateCapturedCharacters([...copies, { instanceId, creatureId, locked: false }]);
}

export function createCreatureCopy(creatureId: string, stage?: number, level?: number, acquisition?: CapturedCharacter['acquisition']): CapturedCharacter {
  const creature = getCreature(creatureId);
  if (!creature.mode) throw new Error('Elemental-Devourer ownership requires a playable game mode.');
  const capturedStage = stage ?? creature.stages[0];
  if (!creature.stages.includes(capturedStage)) throw new Error('Elemental-Devourer form does not occur at this stage.');
  const encounter = infusionEncounter(creature.mode, capturedStage);
  return validateCapturedCharacters([{ instanceId: `capture:${crypto.randomUUID()}`, creatureId, locked: false,
    level: level ?? encounter.level, capturedStage,
    ...(acquisition ? { acquisition } : {}),
    skills: enemySkills(encounter.level, encounter.boss, encounter.ability, encounter.abilityMultiplier) }])[0];
}
