import { build } from 'esbuild';
import { mkdtemp, rm, open } from 'node:fs/promises';
import { writeSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const [output, mode = 'probe'] = process.argv.slice(2);
if (!output || !['probe', 'verify', 'baseline', 'optimized', 'access'].includes(mode)) throw new Error('Usage: node tools\\run_progression_balance.mjs <new-results.jsonl> [probe|verify|baseline|optimized|access]');
const temporary = await mkdtemp(join(tmpdir(), 'last-light-progression-'));
let file;
try {
  const bundle = join(temporary, 'calibration.mjs');
  await build({ entryPoints: ['tools/progression-balance.ts'], outfile: bundle, bundle: true,
    platform: 'node', format: 'esm', target: 'node22', legalComments: 'none' });
  const api = await import(pathToFileURL(bundle).href);
  file = await open(resolve(output), 'wx');
  const emit = row => writeSync(file.fd, JSON.stringify(row) + '\n');
  emit({ metadata: { mode, commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    sourceHash: createHash('sha256').update(readFileSync(bundle)).digest('hex'),
    calamitic: false, seeds: api.calibrationSeeds, startedAt: new Date().toISOString() }, stats: api.statTable(mode === 'baseline') });
  const summary = new Map();
  let count = 0;
  const sample = row => {
    emit(row); count++;
    if (mode === 'probe') { console.log(JSON.stringify(row)); return; }
    const key = row.encounter.kind === 'calamity' ? `calamity EX+${row.encounter.tier}`
      : `${row.encounter.kind} ${Math.ceil(row.enemyLevel / 20) * 20}`;
    const entry = summary.get(key) ?? { fights: 0, wins: 0, defeats: 0, timeouts: 0, rounds: 0, hp: 0 };
    entry.fights++; entry.wins += Number(row.outcome === 'win'); entry.defeats += Number(row.outcome === 'defeat');
    entry.timeouts += Number(row.outcome === 'timeout'); entry.rounds += row.rounds; entry.hp += row.healthFraction;
    summary.set(key, entry);
    if (count % 1000 === 0) console.log('Measured', count);
  };
  if (mode === 'probe') api.runProbe(sample);
  else if (mode === 'optimized') api.runOptimized(sample);
  else if (mode === 'access') api.runAccess(sample);
  else api.runCalibration(sample, mode === 'baseline');
  const completed = { completed: count, summary: Object.fromEntries(summary) };
  emit(completed); console.log(JSON.stringify(completed, null, 2));
} finally {
  await file?.close();
  await rm(temporary, { recursive: true });
}
