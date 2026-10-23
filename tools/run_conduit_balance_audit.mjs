import { build } from 'esbuild';
import { mkdirSync, openSync, writeSync, closeSync, rmSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const [output, scope = 'matrix', prior] = process.argv.slice(2);
if (!output || !['matrix', 'stasis', 'synergy', 'outliers'].includes(scope) || scope === 'outliers' && !prior)
  throw new Error('Usage: node tools\\run_conduit_balance_audit.mjs <existing-directory-output.jsonl> [matrix|stasis|synergy|outliers] [summary.json]');
const scratch = resolve(`.conduit-audit-work-${scope}`);
mkdirSync(scratch);
const bundle = join(scratch, 'audit.mjs');
let fd;
try {
  await build({ entryPoints: ['tools/conduit-balance-audit.ts'], outfile: bundle, bundle: true,
    platform: 'node', format: 'esm', target: 'node22', legalComments: 'none' });
  const audit = await import(pathToFileURL(bundle).href);
  fd = openSync(output, 'wx');
  const files = ['src/content/conduits.ts', 'src/content/master-conduits.ts', 'src/content/phase-zero-conduit-catalog.ts', 'src/content/phase-zero-stats.ts',
    'src/content/phase-zero-conduit-stats.ts', 'src/content/omnic-conduit-stats.ts', 'src/content/stat-growth.ts',
    'src/game/battle.ts', 'src/game/conduit-runtime.ts', 'src/game/calamitic-conduits.ts',
    'src/game/native-benchmark-pilot.ts', 'tools/conduit-balance-audit.ts', 'tools/battle-survey.ts'];
  writeSync(fd, JSON.stringify({ metadata: { scope, catalog: audit.auditCatalog, seeds: audit.auditSeeds,
    limits: audit.auditLimits, commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    hashes: Object.fromEntries(files.map(file => [file, createHash('sha256').update(readFileSync(file)).digest('hex')])),
    started: new Date().toISOString() } }) + '\n');
  let count = 0;
  const start = Date.now();
  const emit = row => {
    writeSync(fd, JSON.stringify(row) + '\n');
    if (++count % 5000 === 0) console.log(`${count} paired fixtures; ${Math.round((Date.now() - start) / 1000)}s`);
  };
  if (scope === 'matrix') audit.runConduitAudit(emit);
  else if (scope === 'stasis') audit.runStasisAudit(emit);
  else if (scope === 'synergy') audit.runSynergyAudit(emit);
  else audit.runWinningAudit(JSON.parse(readFileSync(prior, 'utf8')).tier3Wins, emit);
  writeSync(fd, JSON.stringify({ completed: count, seconds: (Date.now() - start) / 1000, finished: new Date().toISOString() }) + '\n');
  console.log(`Completed ${count} paired fixtures: ${resolve(output)}`);
} finally {
  if (fd !== undefined) closeSync(fd);
  rmSync(scratch, { recursive: true, force: true });
}
