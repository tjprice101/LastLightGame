import { build } from 'esbuild';
import { mkdtemp, rm, open, mkdir, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const [output, scope = 'main', prior] = process.argv.slice(2);
if (!output || !['main', 'focused', 'timeouts', 'levels'].includes(scope) || scope === 'timeouts' && !prior)
  throw new Error('Usage: node tools\\run_battle_survey.mjs <output.jsonl> [main|focused|timeouts|levels] [prior-main.jsonl]');
const temp = await mkdtemp(join(tmpdir(), 'last-light-battle-survey-'));
let file;
try {
  const bundle = join(temp, 'survey.mjs');
  await build({ entryPoints: ['tools/battle-survey.ts'], outfile: bundle, bundle: true,
    platform: 'node', format: 'esm', target: 'node22', legalComments: 'none' });
  const { describeSurvey, runSurvey, runFocusedSurvey, runTimeoutSurvey, runLevelSweep } = await import(pathToFileURL(bundle).href);
  const priorRows = scope === 'timeouts' ? (await readFile(prior, 'utf8')).trim().split('\n')
    .map(line => JSON.parse(line)).filter(row => row.category) : [];
  const metadata = describeSurvey();
  await mkdir(dirname(resolve(output)), { recursive: true });
  file = await open(resolve(output), 'wx');
  await file.write(JSON.stringify({ metadata, scope, commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    startedAt: new Date().toISOString() }) + '\n');
  let batch = [], completed = 0;
  const started = Date.now();
  // The simulation is synchronous; bounded batches avoid retaining thousands of full battle states.
  const { writeSync } = await import('node:fs');
  const execute = scope === 'timeouts' ? emit => runTimeoutSurvey(priorRows, emit) :
    scope === 'levels' ? runLevelSweep : scope === 'focused' ? runFocusedSurvey : runSurvey;
  const count = execute(row => {
    batch.push(JSON.stringify(row)); completed++;
    if (batch.length >= 100) { writeSync(file.fd, batch.join('\n') + '\n'); batch = []; }
    if (completed % 2000 === 0) console.log(`${completed} battles (${Math.round((Date.now() - started) / 1000)}s)`);
  });
  if (batch.length) writeSync(file.fd, batch.join('\n') + '\n');
  await file.write(JSON.stringify({ completed: count, seconds: (Date.now() - started) / 1000, finishedAt: new Date().toISOString() }) + '\n');
  console.log(`Completed ${count} battles. Evidence: ${resolve(output)}`);
} finally {
  await file?.close();
  await rm(temp, { recursive: true });
}
