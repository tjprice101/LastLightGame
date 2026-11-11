import { build } from 'esbuild';
import { mkdtemp, open, rm } from 'node:fs/promises';
import { readFileSync, writeSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';

const [output, ...extra] = process.argv.slice(2);
if (!output || extra.length) throw new Error('Usage: node tools\\run_radiant_economy.mjs <new-report.jsonl>');
const directory = await mkdtemp(join(tmpdir(), 'last-light-economy-'));
let file;
try {
  const bundle = join(directory, 'study.mjs');
  await build({ entryPoints: [resolve('tools\\radiant-economy-study.ts')], outfile: bundle, bundle: true,
    platform: 'node', format: 'esm', target: 'node22', legalComments: 'none' });
  file = await open(resolve(output), 'wx');
  const emit = row => writeSync(file.fd, JSON.stringify(row) + '\n');
  emit({ source: { commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    worktreeDirty: execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim().length > 0,
    bundleSHA256: createHash('sha256').update(readFileSync(bundle)).digest('hex'), startedAt: new Date().toISOString() } });
  const api = await import(pathToFileURL(bundle).href);
  api.executeRadiantEconomyStudy(emit);
  console.log(`Economy study complete: ${resolve(output)}`);
} finally {
  await file?.close();
  await rm(directory, { recursive: true, force: true });
}
