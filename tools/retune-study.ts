/**
 * Battle Flurry Phase 3 Step 4: three-member retune study (offline only).
 * D-404 preparation (player level = enemy level - 1, gear by enemy level) on the six ordinary
 * trios and the six Lv.105 Calamity trios, both pressure policies, any calibration.
 */
import { characterLevelCap } from '../src/content/progression';
import type { RadiantBearerId, RadiantLoadout, RadiantMasterId } from '../src/content/combat-kits';
import type { RadiantEnemyCalibration } from '../src/content/enemy-calibration';
import type { StarterId } from '../src/content/starters';
import { emptyAccount } from '../src/game/account';
import { adaptRadiantLoadouts } from '../src/game/combat-loadout';
import { adaptRadiantPressureEncounter, radiantPressureAnchors, type RadiantPressureAnchor } from '../src/game/enemy-pressure-encounters';
import { runRadiantPressure, type RadiantPressurePolicy } from '../src/game/enemy-pressure';
import { loadout, surveySquads, type Build } from './battle-survey';
import { assertNonCalamitic, playerLevel, progressionBuild, progressionTeams } from './progression-balance';

export const retuneSeeds = [1, 1729, 104729] as const;
export const retunePolicies: readonly RadiantPressurePolicy[] = ['balanced', 'flare-saving'];
export const retuneCalamityTeams: StarterId[][] = surveySquads.slice(0, 6).map(squad => squad.roster);

export interface RetuneRow {
  anchor: string; family: string; group: string; position: string; band: number; level: number; playerLevel: number;
  build: Build; ids: StarterId[]; seed: number; policy: RadiantPressurePolicy; calibration: string;
  outcome: string; rounds: number; finalHP: number; initialHP: number; flares: number; skills: number; normals: number;
  luminositySpent: number;
}
/** Activity group used for the D-404 bands: Calamity per tier, everything else per activity family root. */
export function retuneGroup(anchor: RadiantPressureAnchor): string {
  const a = anchor.activity;
  return a.kind === 'calamity' ? `calamity:${a.tier}` : a.kind === 'infusion' ? `infusion:${a.mode}` : a.kind;
}
export function retuneLoadouts(ids: StarterId[], level: number, build: Build): RadiantLoadout[] {
  const gear = loadout(ids, build);
  assertNonCalamitic(gear);
  const account = emptyAccount();
  const pieces = Object.values(gear.equipment).flatMap(slots => (slots ?? []).filter((id): id is NonNullable<typeof id> => !!id));
  account.conduits = Object.fromEntries(pieces.map(id => [id, 1]));
  account.conduitUpgrades = { ...gear.upgrades };
  account.conduitEquipment = gear.equipment;
  account.masterConduits = Object.fromEntries(Object.values(gear.masters).map(id => [id, 1]));
  const members: RadiantLoadout[] = ids.map(id => {
    const form = Math.max(1, [1, 2, 3, 4, 5, 6].find(value => characterLevelCap(value, id) >= level) ?? 6);
    return { id, starter: id as RadiantBearerId, level, form, convergenceRank: 1,
      masterId: (gear.masters[id] ?? null) as RadiantMasterId | null, weaponRank: 0,
      ascension: { stats: false, skill1: false, skill2: false, lastFlare: false } };
  });
  const result = adaptRadiantLoadouts(members, ids, { conduits: account.conduits, conduitUpgrades: account.conduitUpgrades,
    conduitEquipment: account.conduitEquipment, masterConduits: account.masterConduits });
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result.loadouts;
}
const probeCalibration: RadiantEnemyCalibration = { id: 'probe', points: [{ level: 1, hp: 1, attack: 1, defense: 1 },
  { level: 185, hp: 1, attack: 1, defense: 1 }], categories: { ordinary: { hp: 1, attack: 1, defense: 1 },
  boss: { hp: 1, attack: 1, defense: 1 }, calamity: { hp: 1, attack: 1, defense: 1 } } };
export interface RetuneEntry { anchor: RadiantPressureAnchor; level: number; boss: boolean }
/** Anchors with their level and whether any enemy is a boss (boss-category factor applies). */
export function retuneAnchors(filter: (anchor: RadiantPressureAnchor, level: number, boss: boolean) => boolean = () => true): RetuneEntry[] {
  return radiantPressureAnchors().map(anchor => {
    const enemies = adaptRadiantPressureEncounter(anchor, 1, probeCalibration);
    return { anchor, level: enemies[0].level, boss: enemies.some(enemy => enemy.category === 'boss') };
  }).filter(entry => filter(entry.anchor, entry.level, entry.boss));
}
const loadoutCache = new Map<string, RadiantLoadout[]>();
export function measureRetune(
  entries: readonly RetuneEntry[], calibration: RadiantEnemyCalibration,
  policies: readonly RadiantPressurePolicy[], emit: (row: RetuneRow) => void,
): void {
  for (const { anchor, level } of entries) {
    const calamity = anchor.activity.kind === 'calamity';
    const pLevel = calamity ? 105 : playerLevel(level);
    const build: Build = calamity ? 'master5' : progressionBuild(level);
    const teams = calamity ? retuneCalamityTeams : progressionTeams;
    const seeds = anchor.position === 'species' ? [1] : retuneSeeds;
    for (const seed of seeds) {
      const enemies = adaptRadiantPressureEncounter(anchor, seed, calibration);
      for (const ids of teams) {
        const key = `${ids.join('+')}:${pLevel}:${build}`;
        let loadouts = loadoutCache.get(key);
        if (!loadouts) { loadouts = retuneLoadouts(ids, pLevel, build); loadoutCache.set(key, loadouts); }
        for (const policy of policies) {
          const result = runRadiantPressure(loadouts, enemies, { chargeSeed: seed, targetSeed: (seed ^ 0x85ebca6b) >>> 0, policy });
          emit({ anchor: anchor.id, family: anchor.family, group: retuneGroup(anchor), position: anchor.position,
            band: calamity ? 0 : Math.floor((level - 1) / 20), level, playerLevel: pLevel, build, ids, seed, policy,
            calibration: calibration.id, outcome: result.outcome, rounds: result.roundsExecuted, finalHP: result.finalHP,
            initialHP: result.initialHP, flares: result.metrics.flares, skills: result.metrics.skills,
            normals: result.metrics.normals, luminositySpent: result.metrics.personalSpent });
        }
      }
    }
  }
}
export interface RetuneCell { wins: number; n: number; timeouts: number; rounds: number; health: number; flares: number }
export function summarizeRetune(rows: RetuneRow[], by: (row: RetuneRow) => string = row => `${row.group}|${row.band}`) {
  const cells = new Map<string, RetuneCell>();
  for (const row of rows) {
    const key = `${row.calibration}|${row.policy}|${by(row)}`;
    const cell = cells.get(key) ?? { wins: 0, n: 0, timeouts: 0, rounds: 0, health: 0, flares: 0 };
    cell.n++; if (row.outcome === 'victory') cell.wins++;
    if (row.outcome === 'timeout' || row.outcome === 'stalemate') cell.timeouts++;
    cell.rounds += row.rounds; cell.health += row.outcome === 'victory' ? row.finalHP / row.initialHP : 0; cell.flares += row.flares;
    cells.set(key, cell);
  }
  return cells;
}
export function executeRadiantRetuneStudy(emit: (row: unknown) => void, calibrations: RadiantEnemyCalibration[]): void {
  const entries = retuneAnchors();
  emit({ metadata: { schema: 1, study: 'phase3-step4-retune', seeds: retuneSeeds, policies: retunePolicies,
    calibrations, ordinaryTeams: progressionTeams, calamityTeams: retuneCalamityTeams,
    preparation: 'D-404: player level = enemy level - 1 (cap 105), least evolution; gear common0 <=40, mixed0 <=80, mixed5 <=105, omnic5 <=120, master5 above; Calamity Lv.105 master5. Convergent Light rank 1, no ascension.' } });
  for (const calibration of calibrations) measureRetune(entries, calibration, retunePolicies, row => emit({ measurement: row }));
  emit({ completed: { anchors: entries.length } });
}
