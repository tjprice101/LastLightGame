import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import assert from 'node:assert/strict';

// Secrets are captured in memory, never printed or persisted.
const keysResult = spawnSync(process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['supabase', 'projects', 'api-keys', '--project-ref', 'ohtfgwomdfteaxubndww', '--reveal', '--output', 'json'],
  { encoding: 'utf8', shell: process.platform === 'win32' });
if (keysResult.status !== 0) throw new Error('Unable to obtain hosted test credentials.');
const parsed = JSON.parse(keysResult.stdout);
const keys = Array.isArray(parsed) ? parsed : parsed.api_keys ?? parsed.keys;
const serviceKey = keys?.find(k => k.name === 'service_role')?.api_key;
const clientKey = keys?.find(k => k.name === 'anon')?.api_key;
if (!serviceKey || !clientKey) throw new Error('Hosted test keys unavailable.');
const url = 'https://ohtfgwomdfteaxubndww.supabase.co';
const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
const ids = [];
try {
  const username = `smoke_${randomUUID().slice(0, 8)}`;
  const password = randomUUID() + randomUUID();
  const email = `${username}@example.invalid`;
  const { data: created, error } = await admin.auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: { username },
  });
  if (error || !created.user) throw new Error('Hosted smoke identity creation failed.');
  ids.push(created.user.id);
  const client = createClient(url, clientKey, { auth: { persistSession: false } });
  const { error: loginError } = await client.auth.signInWithPassword({ email, password });
  if (loginError) throw new Error('Hosted smoke authentication failed.');
  async function call(operation, revision, requestId = randomUUID()) {
    const { data, error: invokeError } = await client.functions.invoke('game-operation', {
      body: { operation, expectedRevision: revision, requestId },
    });
    if (invokeError) {
      const status = invokeError.context?.status;
      const failure = new Error(`Hosted operation ${operation.kind} rejected (${status ?? 'transport'}).`);
      failure.status = status;
      throw failure;
    }
    return data;
  }
  const initial = await call({ kind: 'read' }, 0);
  assert.equal(initial.revision, 0);
  assert.equal(initial.starterId, null);
  assert.equal(initial.account.fractalis, 0);
  await assert.rejects(call({ kind: 'bootstrap', starterId: 'rosetta' }, 0), error => error.status === 400);
  const requestId = randomUUID();
  const bootstrap = await call({ kind: 'bootstrap', starterId: 'ember' }, 0, requestId);
  const retried = await call({ kind: 'bootstrap', starterId: 'ember' }, 0, requestId);
  assert.deepEqual(bootstrap, retried);
  assert.equal(bootstrap.revision, 1);
  assert.deepEqual(Object.keys(bootstrap.account.characters), ['ember']);
  await assert.rejects(call({ kind: 'bootstrap', starterId: 'tide' }, 1), error => error.status === 400);
  await assert.rejects(call({ kind: 'purchaseMaterial', element: 'infernic', quantity: 10 }, 1), error => error.status === 400);
  await assert.rejects(call({ kind: 'enter', activity: { kind: 'story', stage: 2 } }, 1), error => error.status === 400);
  for (const activity of [
    { kind: 'dungeon', element: 'infernic', stage: 1 },
    ...['machines', 'heavens', 'abyss', 'treasury', 'sanctuary', 'roses'].map(mode => ({ kind: 'infusion', mode, stage: 1 })),
    { kind: 'war', character: 'nerithe', stage: 1 },
  ]) await assert.rejects(call({ kind: 'enter', activity }, 1), error => error.status === 400);
  const locked = await call({ kind: 'read' }, 0);
  assert.equal(locked.revision, 1);
  assert.equal(locked.session, null);
  assert.equal(locked.account.fractalis, 0);
  const competing = await Promise.allSettled([
    call({ kind: 'updateProfile', displayName: 'Smoke One', bio: '', icon: 'ember', frame: 'default' }, 1),
    call({ kind: 'updateProfile', displayName: 'Smoke Two', bio: '', icon: 'ember', frame: 'default' }, 1),
  ]);
  assert.equal(competing.filter(r => r.status === 'fulfilled').length, 1);
  const current = await call({ kind: 'read' }, 0);
  assert.equal(current.revision, 2);
  const enter = await call({ kind: 'enter', activity: { kind: 'story', stage: 1 } }, current.revision);
  assert.equal(enter.session.state.story.storyStage, 1);
  assert.equal(enter.session.state.allies[0].definitionId, 'ember');
  assert.equal(enter.session.state.enemies[0].stats.health, 75);
  assert.equal(enter.session.state.enemies[0].stats.defense, 4);
  let action = await call({ kind: 'act', runId: enter.session.runId, actorId: 'ember', action: 'light',
    targetId: enter.session.state.enemies[0].id }, enter.revision);
  assert.ok(action.result.events.some(e => e.kind === 'damage'));
  assert.ok(action.session.state.enemies[0].hp > 0);
  await assert.rejects(call({ kind: 'act', runId: action.session.runId, actorId: 'tide', action: 'light',
    targetId: action.session.state.enemies[0].id }, action.revision), error => error.status === 400);
  let rewards = action.result.events.filter(e => e.kind === 'reward').reduce((sum, e) => sum + e.amount, 0);
  for (let turn = 0; turn < 100 && action.session.state.phase === 'player'; turn++) {
    const target = action.session.state.enemies.find(e => e.hp > 0);
    const requestId = randomUUID();
    const operation = { kind: 'act', runId: action.session.runId, actorId: 'ember', action: 'light', targetId: target.id };
    const revision = action.revision;
    action = await call(operation, revision, requestId);
    assert.deepEqual(await call(operation, revision, requestId), action);
    rewards += action.result.events.filter(e => e.kind === 'reward').reduce((sum, e) => sum + e.amount, 0);
  }
  assert.equal(action.session.state.phase, 'cleared');
  assert.equal(action.account.storyCompleted, 1);
  assert.equal(action.account.fractalis, rewards);
  const continued = await call({ kind: 'continue', runId: action.session.runId }, action.revision);
  assert.equal(continued.session.state.story.storyStage, 2);
  const quit = await call({ kind: 'quit', runId: continued.session.runId }, continued.revision);
  assert.equal(quit.session, null);
  assert.equal(quit.account.lycalis, 0);
  const username2 = `smoke_${randomUUID().slice(0, 8)}`;
  const password2 = randomUUID() + randomUUID();
  const email2 = `${username2}@example.invalid`;
  const second = await admin.auth.admin.createUser({ email: email2, password: password2, email_confirm: true,
    user_metadata: { username: username2 } });
  if (second.error || !second.data.user) throw new Error('Social smoke identity creation failed.');
  ids.push(second.data.user.id);
  const friend = await call({ kind: 'friendRequest', username: username2 }, quit.revision);
  assert.equal(friend.social.outgoing.length, 1);
  assert.equal(Object.keys(friend.social.outgoing[0]).sort().join(','), 'displayName,frame,icon,userId,username');
  const client2 = createClient(url, clientKey, { auth: { persistSession: false } });
  if ((await client2.auth.signInWithPassword({ email: email2, password: password2 })).error) throw new Error('Social smoke auth failed.');
  const incoming = await client2.functions.invoke('game-operation', { body: {
    requestId: randomUUID(), expectedRevision: 0, operation: { kind: 'read' },
  } });
  assert.equal(incoming.data.social.incoming.length, 1);
  const importedSave = {
    format: 'last-light-save', version: 1, profile: { version: 1, starterId: 'ember' },
    account: { ...bootstrap.account, fractalis: 54321, lycalis: 123, storyCompleted: 29,
      receipts: Array.from({ length: 200 }, (_, i) => `${randomUUID()}:offline-enemy-${i}`) },
  };
  const importId = randomUUID();
  const importBody = { requestId: importId, expectedRevision: 0, operation: { kind: 'importSave', save: importedSave } };
  const imported = await client2.functions.invoke('game-operation', { body: importBody });
  assert.equal(imported.error, null);
  assert.equal(imported.data.revision, 1);
  assert.deepEqual(imported.data.account, importedSave.account);
  assert.equal(imported.data.profile.username, username2);
  const importedRetry = await client2.functions.invoke('game-operation', { body: importBody });
  assert.deepEqual(importedRetry.data, imported.data);
  const rejectedImport = await client2.functions.invoke('game-operation', { body: {
    ...importBody, requestId: randomUUID(), expectedRevision: 1,
  } });
  assert.ok(rejectedImport.error);
  await assert.rejects(call({ kind: 'importSave', save: importedSave }, friend.revision), error => error.status === 400);
  const accepted = await client2.functions.invoke('game-operation', { body: {
    requestId: randomUUID(), expectedRevision: 1, operation: { kind: 'acceptFriendRequest', userId: ids[0] },
  } });
  assert.equal(accepted.data.social.friends.length, 1);
  const removed = await call({ kind: 'removeFriend', userId: ids[1] }, friend.revision);
  assert.equal(removed.social.friends.length, 0);
  const anonymous = await fetch(`${url}/functions/v1/game-operation`, { method: 'POST',
    headers: { apikey: clientKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestId: randomUUID(), expectedRevision: 0, operation: { kind: 'read' } }) });
  assert.equal(anonymous.status, 401);
  console.log('Hosted smoke passed: auth denial, fresh bootstrap/idempotency, one-time save import/idempotency/existing-account rejection, concurrent CAS, gates, actual kills/rewards/continue/quit, friend request/accept/remove/privacy.');
} finally {
  for (const id of ids) {
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) throw new Error('Hosted smoke cleanup failed; test identity requires removal.');
  }
  console.log('Hosted smoke identities and cascading gameplay records removed.');
}
