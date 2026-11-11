import { build } from 'esbuild';
import { mkdir, open, rm } from 'node:fs/promises';
import { readFileSync, writeSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const [output, mode] = process.argv.slice(2);
if (!output || mode && mode !== '--tuned-only')
  throw new Error('Usage: node tools\\run_pressure_study.mjs <report.jsonl> [--tuned-only]');
const directory = resolve('.radiant-pressure-runner');
await mkdir(directory, { recursive: false });
let file;
try {
  const bundle = join(directory, 'study.mjs');
  await build({ entryPoints: [resolve('tools\\pressure-study.ts')], outfile: bundle, bundle: true,
    platform: 'node', format: 'esm', target: 'node22', legalComments: 'none' });
  file = await open(resolve(output), 'wx');
  const emit = row => writeSync(file.fd, JSON.stringify(row) + '\n');
  emit({ source: { commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    bundleSHA256: createHash('sha256').update(readFileSync(bundle)).digest('hex'), startedAt: new Date().toISOString() } });
  const api = await import(pathToFileURL(bundle).href);
  api.executeRadiantPressureStudy(emit, mode === '--tuned-only');
  console.log(`Pressure study complete: ${resolve(output)}`);
} finally {
  await file?.close();
  await rm(directory, { recursive: true, force: true });
}
