// Hosted database proof for the default-off Radiant authority. Runs the real
// radiant-dispatch handler locally against the linked project's SQL RPCs with a
// disposable identity. Deploys nothing and never enables the hosted authority.
// --single-encounter uses Defense after the initial hit to grow one journal.
import { spawnSync } from 'node:child_process';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { createClient } from '@supabase/supabase-js';

const actionsArg = process.argv.find(arg => arg.startsWith('--actions='));
const actionBudget = Math.min(Math.max(Number(actionsArg?.slice(10) ?? 240) || 240, 20), 600);
const singleEncounter = process.argv.includes('--single-encounter');

const work = mkdtempSync(join(tmpdir(), 'radiant-db-'));
const bundle = join(work, 'battle-dispatch.mjs');
await build({
  stdin: {
    contents: `export { handleRadiantRequest } from './supabase/functions/game-operation/battle-dispatch';
export { freshGame, resolveOperation } from './supabase/functions/game-operation/engine';`,
    resolveDir: resolve('.'), loader: 'ts',
  },
  outfile: bundle, bundle: true, platform: 'node', format: 'esm', target: 'es2022',
  external: ['@supabase/supabase-js'], logLevel: 'silent',
});
const { handleRadiantRequest, freshGame, resolveOperation } = await import(pathToFileURL(bundle).href);

// Secrets stay in memory, never printed or persisted.
const keysResult = spawnSync(process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['supabase', 'projects', 'api-keys', '--project-ref', 'ohtfgwomdfteaxubndww', '--reveal', '--output', 'json'],
  { encoding: 'utf8', shell: process.platform === 'win32' });
if (keysResult.status !== 0) throw new Error('Unable to obtain hosted test credentials.');
const parsed = JSON.parse(keysResult.stdout);
const keys = Array.isArray(parsed) ? parsed : parsed.api_keys ?? parsed.keys;
const serviceKey = keys?.find(k => k.name === 'service_role')?.api_key;
if (!serviceKey) throw new Error('Hosted service key unavailable.');
const admin = createClient('https://ohtfgwomdfteaxubndww.supabase.co', serviceKey, { auth: { persistSession: false } });
const config = { enabled: 'true', secret: randomBytes(32).toString('hex'), calibration: 'authored-control' };

let userId = null;
const latencies = [];
let calls = 0, windowStart = Date.now();
async function paced() {
  // Shared authority limit is 120 attempts/minute/user; stay below it.
  if (++calls > 110) {
    const wait = 61_000 - (Date.now() - windowStart);
    if (wait > 0) await new Promise(done => setTimeout(done, wait));
    calls = 1; windowStart = Date.now();
  }
}
async function identityOf(user) {
  const { data, error } = await admin.from('player_profiles').select('username,created_at').eq('user_id', user).single();
  return error ? null : data;
}
async function send(radiantStudy, { timed = false } = {}) {
  await paced();
  const started = performance.now();
  const result = await handleRadiantRequest({ radiantStudy }, userId, admin, config, identityOf, true);
  const elapsed = performance.now() - started;
  if (timed && result.status === 200) latencies.push({ ms: elapsed, bytes: JSON.stringify(result.body).length });
  return result;
}
const ok = result => { assert.equal(result.status, 200, `Expected success, got ${result.status}: ${result.body?.code ?? ''}`); return result.body; };
const read = async () => ok(await send({ kind: 'read' }));
let seedGame = null;
async function storedAggregate() {
  // For an existing account this returns the saved row; p_initial is ignored.
  const { data, error } = await admin.rpc('load_game_account', { p_user: userId, p_initial: seedGame });
  if (error) throw new Error('Stored aggregate unavailable.');
  return data;
}

const summary = {};
try {
  const username = `rdb_${randomUUID().slice(0, 8)}`;
  const { data: created, error } = await admin.auth.admin.createUser({
    email: `${username}@example.invalid`, password: randomUUID() + randomUUID(), email_confirm: true,
    user_metadata: { username },
  });
  if (error || !created.user) throw new Error(`Disposable identity creation failed: ${String(error?.message ?? '').slice(0, 160)}`);
  userId = created.user.id;

  const entropy = { seed: () => 1729, random: () => .5, uuid: () => randomUUID() };
  const game = resolveOperation(freshGame(username), { kind: 'bootstrap', starterId: 'ember' }, entropy).game;
  for (const id of ['ember', 'tide', 'caldrex']) game.account.characters[id] = { level: 90, evolution: 6 };
  seedGame = game;
  const seeded = await admin.rpc('load_game_account', { p_user: userId, p_initial: game });
  assert.equal(seeded.error, null, 'Disposable fixture seed failed.');

  // 1. Preparation: atomic commit, exact replay, conflicting reuse.
  let checkpoint = await read();
  const r0 = checkpoint.revision;
  const prepId = randomUUID();
  const prepare = ids => ({ kind: 'prepare', requestId: prepId, expectedRevision: r0, operation: { kind: 'setSquad', ids } });
  const prepared = ok(await send(prepare(['ember', 'tide', 'caldrex'])));
  assert.equal(prepared.revision, r0 + 1);
  assert.deepEqual(ok(await send(prepare(['ember', 'tide', 'caldrex']))), prepared, 'preparation replay must be identical');
  const reuse = await send(prepare(['ember']));
  assert.equal(reuse.status, 409, 'request ID reuse with different input must conflict');
  checkpoint = await read();
  assert.equal(checkpoint.revision, r0 + 1);
  assert.deepEqual(checkpoint.account.squad, ['ember', 'tide', 'caldrex']);
  summary.preparation = 'commit, identical replay, 409 conflicting reuse';

  // 2. Stale revision: rejected, nothing written.
  const before = await storedAggregate();
  const start = (revision, requestId = randomUUID()) => ({ requestId, expectedRevision: revision, runId: null,
    encounter: null, operation: { kind: 'start', activity: { kind: 'training' }, calibration: 'authored-control' } });
  const stale = await send(start(r0));
  assert.equal(stale.status, 409);
  const afterStale = await storedAggregate();
  if (before && afterStale) assert.deepEqual(afterStale, before, 'stale write must not change the stored aggregate');
  summary.stale = before ? 'stale 409, stored aggregate byte-identical' : 'stale 409, revision unchanged';

  // 3. Concurrent CAS: two distinct starts at the same revision, exactly one wins.
  const raced = await Promise.all([send(start(r0 + 1)), send(start(r0 + 1))]);
  const winners = raced.filter(result => result.status === 200);
  assert.equal(winners.length, 1, `exactly one concurrent start may commit (statuses ${raced.map(r => r.status)})`);
  assert.ok(raced.some(result => result.status === 409));
  checkpoint = await read();
  assert.equal(checkpoint.revision, r0 + 2);
  assert.equal(checkpoint.run.id, winners[0].body.run.id);
  summary.concurrency = `statuses ${raced.map(r => r.status).sort().join('/')}; winner persisted at revision ${r0 + 2}`;

  // 4. Action idempotency: exact replay returns stored response, no double currency.
  let run = checkpoint.run, revision = checkpoint.revision;
  const enemy = run.state.enemies.find(unit => unit.hp > 0);
  const actionRequest = { requestId: randomUUID(), expectedRevision: revision, runId: run.id, encounter: run.encounter,
    operation: { kind: 'action', action: { type: 'normal', bearerId: 'ember', targetId: enemy.id } } };
  const acted = ok(await send(actionRequest, { timed: true }));
  assert.deepEqual(ok(await send(actionRequest)), acted, 'action replay must return the stored response');
  checkpoint = await read();
  assert.equal(checkpoint.revision, acted.revision);
  assert.equal(checkpoint.account.fractalis, acted.account.fractalis, 'replay must not pay twice');
  const drops = acted.events.filter(event => event.type === 'gauge-drop' && event.bearerId === 'ember');
  assert.ok(drops.length, 'the saved hit must contain an enemy Gauge drop');
  const dropped = drops.reduce((sum, event) => sum + event.amount, 0);
  assert.equal(dropped, 10, 'a Normal hit grants exactly ten Luminosity');
  const attacker = run.state.gauge.members.find(member => member.id === 'ember');
  for (const member of acted.run.state.gauge.members) {
    const beforeCharge = run.state.gauge.members.find(entry => entry.id === member.id).charge;
    const capacity = member.baseCost * (member.form >= 4 ? 2 : 1);
    const share = member.id === 'ember' ? dropped : member.elementId === attacker.elementId ? dropped / 10 : 0;
    assert.equal(member.charge, Math.min(capacity, beforeCharge + share), `saved Gauge share for ${member.id}`);
  }
  assert.deepEqual(checkpoint.run.state.gauge, acted.run.state.gauge, 'read must preserve every saved Gauge share');
  summary.idempotency = 'action replay identical; revision/currency unchanged by replay';
  summary.gauge = 'Normal Luminosity saved once; only same-element teammates share ten percent through replay/read';

  // 5. Bounded long Training run through the actual database.
  run = acted.run; revision = acted.revision;
  let actions = 1, victories = 0, defeats = 0, maxEncounterEvents = run.journal.events.length;
  const firstEncounter = run.encounter;
  let lastRequest = null, lastResponse = null;
  let maxStored = 0;
  while (actions < actionBudget) {
    let operation;
    if (run.state.phase === 'victory') {
      if (singleEncounter) throw new Error('Single-encounter fixture ended in victory before the requested action budget.');
      operation = { kind: 'continue' }; victories++;
    }
    else if (run.state.phase === 'defeat') {
      if (singleEncounter) throw new Error('Single-encounter fixture ended in defeat before the requested action budget.');
      operation = { kind: 'retry' }; defeats++;
    }
    else {
      const bearer = run.state.bearers.find(unit => unit.hp > 0 && !run.state.acted.includes(unit.loadout.id));
      if (!bearer) throw new Error('No legal player action in a player phase.');
      if (singleEncounter) operation = { kind: 'action', action: { type: 'defense', bearerId: bearer.loadout.id } };
      else {
        const target = run.state.enemies.find(unit => unit.hp > 0);
        if (!target) throw new Error('No living enemy in a player phase.');
        operation = { kind: 'action', action: { type: 'normal', bearerId: bearer.loadout.id, targetId: target.id } };
      }
      actions++;
    }
    const request = { requestId: randomUUID(), expectedRevision: revision, runId: run.id,
      encounter: run.encounter, operation };
    const result = await send(request, { timed: true });
    if (result.status !== 200) throw new Error(`Long run rejected ${JSON.stringify(operation)} in phase ` +
      `${run.state.phase}, round ${run.state.round}, acted ${JSON.stringify(run.state.acted)}: ${result.body?.error}`);
    const body = result.body;
    assert.equal(body.revision, revision + 1);
    lastRequest = request; lastResponse = body;
    run = body.run; revision = body.revision;
    maxEncounterEvents = Math.max(maxEncounterEvents, run.journal.events.length);
    if (singleEncounter && actions % 100 === 0)
      console.log(`Single-encounter progress: ${actions} actions, ${run.journal.events.length} events.`);
    if (actions % 40 === 0) {
      const stored = await storedAggregate();
      if (stored) maxStored = Math.max(maxStored, JSON.stringify(stored.state).length);
    }
  }
  const stored = await storedAggregate();
  if (stored) {
    assert.equal(stored.revision, revision, 'stored revision matches the last acknowledged response');
    maxStored = Math.max(maxStored, JSON.stringify(stored.state).length);
  }
  if (singleEncounter) {
    assert.equal(run.encounter, firstEncounter, 'the entire stress run must remain in one encounter');
    assert.equal(run.state.phase, 'player', 'the stress encounter must still be playable');
    assert.ok(lastRequest && lastResponse, 'the stress run must contain an action to replay');
    assert.ok(isDeepStrictEqual(ok(await send(lastRequest)), lastResponse), 'large-journal action replay must remain identical');
    const started = performance.now();
    const restored = await read();
    const readMs = performance.now() - started;
    assert.equal(restored.revision, revision, 'large-journal replay must not advance the revision');
    assert.ok(isDeepStrictEqual(restored.run.journal.events, run.journal.events), 'read must preserve the complete journal');
    summary.longJournalRead = `${run.journal.events.length} events restored without truncation in ${readMs.toFixed(0)} ms; last action replay identical`;
  }
  const sorted = latencies.map(entry => entry.ms).sort((a, b) => a - b);
  const pct = p => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))].toFixed(0);
  summary.longRun = `${singleEncounter ? 'single-encounter Defense stress; ' : ''}${actions} actions, ${latencies.length} timed commits, ${victories} victories/${defeats} defeats, ` +
    `encounter ${run.encounter}, max encounter journal ${maxEncounterEvents} events`;
  summary.latency = `p50 ${pct(.5)} ms, p95 ${pct(.95)} ms, max ${sorted.at(-1).toFixed(0)} ms (local handler + hosted RPCs)`;
  summary.payload = `max response ${Math.max(...latencies.map(entry => entry.bytes))} bytes` +
    (maxStored ? `, max stored aggregate ${maxStored} bytes` : '');

  // 6. Saved exit removes the run atomically.
  const exited = ok(await send({ requestId: randomUUID(), expectedRevision: revision, runId: run.id,
    encounter: run.encounter, operation: { kind: 'exit' } }));
  checkpoint = await read();
  assert.equal(checkpoint.run, null);
  assert.equal(checkpoint.revision, exited.revision);
  summary.exit = 'saved exit cleared the run at the acknowledged revision';

  for (const [key, value] of Object.entries(summary)) console.log(`${key}: ${value}`);
  console.log('Radiant hosted DB proof passed.');
} finally {
  rmSync(work, { recursive: true, force: true });
  if (userId) {
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) throw new Error(`Cleanup failed for disposable identity ${userId}.`);
    console.log('Disposable identity and cascading records removed.');
  }
}
