/**
 * Phase 3 Step 4 fitting sweep (offline only), as level compression: above Lv.80 an enemy of level L
 * gets the shared curve's stats at an effective level E(L) <= L, with E never decreasing. Each
 * calibration point's Health/Attack/Defense factors are base(E)/base(L), so calibrated stats never
 * fall as level rises. Greedy, low to high: the largest E per point whose activity x 20-level bands
 * (earlier rows kept) meet the D-404 ordinary target (>= 95% wins per activity and 20-level band, no timeouts) for the
 * skill-spending `balanced` player; where even holding E flat misses the target the point is
 * marked as a shortfall. Ordinary encounters fit `points`; boss encounters fit
 * `categoryPoints.boss` the same way. Calamity gets its own curve with one point per tier
 * (Lv.145/160/170): the largest E meeting EX+1 >= 80%, EX+2 >= 50%, EX+3 >= 30%, never decreasing.
 */
import type { RadiantCalibrationPoint, RadiantEnemyCalibration } from '../src/content/enemy-calibration';
import { enemyCombatStats } from '../src/content/stat-growth';
import { measureRetune, retuneAnchors, type RetuneEntry, type RetuneRow } from './retune-study';

export const retuneFitLevels = Array.from({ length: 22 }, (_, i) => 80 + i * 5).concat(185)
  .filter((level, i, all) => all.indexOf(level) === i && level <= 185);
const unity = { hp: 1, attack: 1, defense: 1 };
/** Minimum effective-level climb per real level above Lv.105. */
const minimumClimb = 0;
type Schedule = readonly (readonly [number, number])[];

/** Factors that give a level-L enemy the shared curve's level-E stats. */
export function compressionFactors(level: number, effective: number): RadiantCalibrationPoint {
  const actual = enemyCombatStats(level, false), target = enemyCombatStats(effective, false);
  const round = (value: number) => Math.round(value * 10000) / 10000;
  return { level, hp: round(target.health / actual.health), attack: round(target.damage / actual.damage),
    defense: round(target.defense / actual.defense) };
}
function curve(schedule: Schedule): RadiantCalibrationPoint[] {
  const tail = schedule.at(-1)!;
  const full = tail[0] === 185 ? schedule : [...schedule, [185, Math.min(185, tail[1] + 185 - tail[0])] as const];
  return [{ level: 1, ...unity }, ...full.map(([level, e]) => compressionFactors(level, e))];
}
export function compressionCalibration(ordinary: Schedule, boss: Schedule, calamity: Schedule,
  id = 'radiant-trio-v1'): RadiantEnemyCalibration {
  return { id, points: curve(ordinary), categoryPoints: { boss: curve(boss), calamity: curve(calamity) },
    categories: { ordinary: unity, boss: unity, calamity: unity } };
}
function meetsOrdinary(rows: RetuneRow[]): boolean {
  const cells = new Map<string, { wins: number; n: number; stuck: number }>();
  for (const row of rows) {
    const key = `${row.group}|${row.band}`;
    const cell = cells.get(key) ?? { wins: 0, n: 0, stuck: 0 };
    cell.n++; if (row.outcome === 'victory') cell.wins++;
    if (row.outcome === 'timeout' || row.outcome === 'stalemate') cell.stuck++;
    cells.set(key, cell);
  }
  return [...cells.values()].every(cell => cell.wins / cell.n >= .95 && cell.stuck === 0);
}
function calamityRates(rows: RetuneRow[]): number[] {
  return [1, 2, 3].map(tier => {
    const tierRows = rows.filter(row => row.group === `calamity:${tier}`);
    return tierRows.filter(row => row.outcome === 'victory').length / tierRows.length;
  });
}
function fitSchedule(entries: RetuneEntry[], build: (schedule: Schedule) => RadiantEnemyCalibration,
  emit: (row: unknown) => void, label: string): [number, number][] {
  const schedule: [number, number][] = [[80, 80]];
  // D-404 judges whole activity x 20-level bands: rows below the step are measured once and kept, then each
  // candidate is judged on every band cell the step touches (earlier rows plus the step's own rows).
  const accepted: RetuneRow[] = [];
  measureRetune(entries.filter(entry => entry.level <= 80), build(schedule), ['balanced'], row => accepted.push(row));
  for (const level of retuneFitLevels.slice(1)) {
    const [previousLevel, previousE] = schedule.at(-1)!;
    const segment = entries.filter(entry => entry.level > previousLevel && entry.level <= level);
    // No evidence here: merge this step into the next one instead of guessing a climb.
    if (!segment.length && level < 185) continue;
    const rowsFor = (e: number) => {
      const rows: RetuneRow[] = [];
      measureRetune(segment, build([...schedule, [level, e]]), ['balanced'], row => rows.push(row));
      return rows;
    };
    const meets = (rows: RetuneRow[]) => {
      const cells = new Set(rows.map(row => `${row.group}|${row.band}`));
      return meetsOrdinary([...accepted.filter(row => cells.has(`${row.group}|${row.band}`)), ...rows]);
    };
    const floor = level > 105 ? previousE + Math.round((level - previousLevel) * minimumClimb) : previousE;
    let low = floor, high = previousE + (level - previousLevel), shortfall = false;
    let best = rowsFor(high);
    if (!segment.length || meets(best)) low = high;
    else {
      best = rowsFor(low);
      if (!meets(best)) shortfall = true;
      else while (high - low > 1) {
        const mid = Math.floor((low + high) / 2), rows = rowsFor(mid);
        if (meets(rows)) { low = mid; best = rows; } else high = mid;
      }
    }
    accepted.push(...best);
    schedule.push([level, low]);
    emit({ fitPoint: { curve: label, level, effective: low, anchors: segment.length, shortfall } });
  }
  return schedule;
}
export function executeRetuneFit(emit: (row: unknown) => void): void {
  const ordinary = retuneAnchors((anchor, _level, boss) => anchor.activity.kind !== 'calamity' && !boss);
  const bosses = retuneAnchors((anchor, _level, boss) => anchor.activity.kind !== 'calamity' && boss);
  const calamity = retuneAnchors(anchor => anchor.activity.kind === 'calamity');
  const identity: Schedule = [[80, 80]];
  const ordinarySchedule = fitSchedule(ordinary, schedule => compressionCalibration(schedule, identity, identity), emit, 'ordinary');
  const bossSchedule = fitSchedule(bosses, schedule => compressionCalibration(ordinarySchedule, schedule, identity), emit, 'boss');
  const tiers = [[145, .8], [160, .5], [170, .3]] as const;
  const calamitySchedule: [number, number][] = [[80, 80]];
  const tierRate = (tier: number, schedule: Schedule) => {
    const rows: RetuneRow[] = [];
    measureRetune(calamity.filter(entry => entry.anchor.activity.kind === 'calamity' && entry.anchor.activity.tier === tier),
      compressionCalibration(ordinarySchedule, bossSchedule, schedule), ['balanced'], row => rows.push(row));
    return calamityRates(rows)[tier - 1];
  };
  tiers.forEach(([level, target], index) => {
    const tier = index + 1, floor = calamitySchedule.at(-1)![1];
    const at = (e: number) => tierRate(tier, [...calamitySchedule, [level, e]]);
    let low = floor, high = level, shortfall = false;
    if (at(high) >= target) low = high;
    else if (at(low) < target) shortfall = true;
    else while (high - low > 1) { const mid = Math.floor((low + high) / 2); if (at(mid) >= target) low = mid; else high = mid; }
    const rate = at(low);
    calamitySchedule.push([level, low]);
    emit({ fitPoint: { curve: 'calamity', level, effective: low, rate, target, shortfall } });
  });
  emit({ fitted: { ordinarySchedule, bossSchedule, calamitySchedule,
    calibration: compressionCalibration(ordinarySchedule, bossSchedule, calamitySchedule) } });
}
