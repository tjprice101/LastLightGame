import { build } from 'esbuild';
import { mkdtemp, rm, open } from 'node:fs/promises';
import { writeSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const [output, variant = 'current'] = process.argv.slice(2);
if (!output || !['previous', 'candidate', 'current'].includes(variant))
  throw new Error('Usage: node tools\\run_calamity_balance.mjs <new-output.jsonl> [previous|candidate|current]');
const temp = await mkdtemp(join(tmpdir(), 'last-light-calamity-balance-'));
let file;
try {
  const bundle = join(temp, 'balance.mjs');
  await build({ entryPoints: ['tools/calamity-balance.ts'], outfile: bundle, bundle: true,
    platform: 'node', format: 'esm', target: 'node22', legalComments: 'none' });
  const { runCalamityBalance, balanceSeeds, balanceLimits, balanceBuilds } = await import(pathToFileURL(bundle).href);
  file = await open(resolve(output), 'wx');
  writeSync(file.fd, JSON.stringify({ metadata: { variant, seeds: balanceSeeds, limits: balanceLimits,
    builds: balanceBuilds, commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    startedAt: new Date().toISOString() } }) + '\n');
  const summaries = new Map();
  const started = Date.now();
  const count = runCalamityBalance(variant, row => {
    writeSync(file.fd, JSON.stringify(row) + '\n');
    const key = `${row.tier} ${row.build} ${row.policy}`;
    const summary = summaries.get(key) ?? { fights: 0, win: 0, defeat: 0, timeout: 0, rounds: 0 };
    summary.fights++; summary[row.outcome]++; summary.rounds += row.rounds;
    summaries.set(key, summary);
  });
  writeSync(file.fd, JSON.stringify({ completed: count, seconds: (Date.now() - started) / 1000,
    summary: Object.fromEntries(summaries) }) + '\n');
  console.log(JSON.stringify({ variant, count, seconds: (Date.now() - started) / 1000,
    summary: Object.fromEntries(summaries) }, null, 2));
} finally {
  await file?.close();
  await rm(temp, { recursive: true });
}
