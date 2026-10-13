import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import assert from 'node:assert/strict';
import { freshGame, resolveOperation } from '../supabase/functions/game-operation/engine.bundle.js';

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
    return callAs(client, operation, revision, requestId);
  }
  async function callAs(client, operation, revision, requestId = randomUUID()) {
    const { data, error: invokeError } = await client.functions.invoke('game-operation', {
      body: { operation, expectedRevision: revision, requestId },
    });
    if (invokeError) {
      const body = await invokeError.context?.clone().json().catch(() => null);
      const detail = typeof body?.error === 'string' ? body.error
        .replaceAll(serviceKey, '[redacted]').replaceAll(clientKey, '[redacted]')
        .replace(/\beyJ[\w-]+\.[\w-]+\.[\w-]+\b/g, '[redacted token]')
        .replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, 300) : 'No server error detail.';
      const failure = new Error(`Hosted operation ${operation.kind} rejected (${invokeError.context?.status ?? 'transport'}): ${detail}`);
      failure.status = invokeError.context?.status;
      throw failure;
    }
    return data;
  }
  if (process.argv.includes('--masters')) {
    await smokeRecurringMaster(client, created.user.id, username);
  } else {
  const initialReadId = randomUUID();
  const initial = await call({ kind: 'read' }, 0, initialReadId);
  assert.equal(initial.revision, 0);
  assert.equal(initial.starterId, null);
  assert.equal(initial.account.fractalis, 0);
  assert.match(initial.profile.friendCode, /^LL-[0-9A-F]{4}-[0-9A-F]{4}$/);
  assert.equal(initial.profile.playerId, initial.profile.friendCode.slice(3));
  assert.equal(initial.profile.daysPlayed, 1);
  assert.ok(Number.isSafeInteger(initial.profile.playTimeSeconds));
  assert.ok(initial.profile.recentActivity.some(event => event.message === 'Profile created'));
  assert.deepEqual(await call({ kind: 'read' }, 0, initialReadId), initial);
  await new Promise(resolve => setTimeout(resolve, 1100));
  const activeRead = await call({ kind: 'read' }, 0);
  assert.ok(activeRead.profile.playTimeSeconds >= initial.profile.playTimeSeconds + 1);
  const initialCheckpoint = await call({ kind: 'checkpoint' }, 0);
  assert.equal(initialCheckpoint.revision, initial.revision);
  assert.deepEqual(initialCheckpoint.account, initial.account);
  assert.ok(initialCheckpoint.profile.playTimeSeconds >= activeRead.profile.playTimeSeconds);
  await assert.rejects(call({ kind: 'checkpoint', wallet: {} }, 0), error => error.status === 400);
  await assert.rejects(call({ kind: 'bootstrap', starterId: 'rosetta' }, 0), error => error.status === 400);
  const requestId = randomUUID();
  const bootstrap = await call({ kind: 'bootstrap', starterId: 'ember' }, 0, requestId);
  const retried = await call({ kind: 'bootstrap', starterId: 'ember' }, 0, requestId);
  assert.deepEqual(bootstrap, retried);
  assert.equal(bootstrap.revision, 1);
  assert.ok(bootstrap.profile.recentActivity.some(event => event.message === 'Starter selected'));
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
  const checkpoint = await call({ kind: 'checkpoint' }, enter.revision);
  assert.deepEqual(checkpoint.session, enter.session);
  assert.deepEqual(checkpoint.account, enter.account);
  assert.equal(checkpoint.revision, enter.revision);
  await assert.rejects(call({ kind: 'checkpoint' }, enter.revision - 1), error => error.status === 409);
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
  assert.ok(action.profile.recentActivity.some(event => event.message === 'Story stage cleared' &&
    event.detail === 'Story · Stage 1'));
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
  const client2 = createClient(url, clientKey, { auth: { persistSession: false } });
  if ((await client2.auth.signInWithPassword({ email: email2, password: password2 })).error) throw new Error('Social smoke auth failed.');
  const secondInitial = await callAs(client2, { kind: 'read' }, 0);
  await assert.rejects(call({ kind: 'friendRequest', friendCode: activeRead.profile.friendCode }, quit.revision),
    error => error.status === 400 && /yourself/i.test(error.message));
  const friend = await call({ kind: 'friendRequest', friendCode: secondInitial.profile.friendCode }, quit.revision);
  assert.equal(friend.social.outgoing.length, 1);
  assert.equal(Object.keys(friend.social.outgoing[0]).sort().join(','), 'displayName,frame,icon,userId,username');
  assert.equal(friend.profile.friendCode, activeRead.profile.friendCode);
  const incoming = await client2.functions.invoke('game-operation', { body: {
    requestId: randomUUID(), expectedRevision: 0, operation: { kind: 'read' },
  } });
  assert.equal(incoming.data.social.incoming.length, 1);
  assert.equal(Object.keys(incoming.data.social.incoming[0]).sort().join(','), 'displayName,frame,icon,userId,username');
  assert.equal(incoming.data.profile.friendCode, (await callAs(client2, { kind: 'read' }, 0)).profile.friendCode);
  assert.notEqual(incoming.data.profile.friendCode, activeRead.profile.friendCode);
  assert.equal(incoming.data.profile.playerId, incoming.data.profile.friendCode.slice(3));
  assert.ok(!('email' in incoming.data.profile));
  assert.ok(incoming.data.profile.recentActivity.every(event =>
    typeof event.id === 'string' && typeof event.message === 'string' &&
    typeof event.detail === 'string' && Number.isFinite(Date.parse(event.at))));
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
  assert.equal(imported.data.profile.friendCode, incoming.data.profile.friendCode);
  assert.equal(imported.data.profile.daysPlayed, incoming.data.profile.daysPlayed);
  assert.ok(imported.data.profile.playTimeSeconds >= incoming.data.profile.playTimeSeconds);
  assert.ok(imported.data.profile.recentActivity.some(event => event.message === 'Save imported'));
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
  assert.equal(accepted.data.social.friends[0].online, true);
  assert.ok(Number.isFinite(Date.parse(accepted.data.social.friends[0].lastSeenAt)));
  const peerCheckpoint = await callAs(client2, { kind: 'checkpoint' }, accepted.data.revision);
  const ownerCheckpoint = await call({ kind: 'checkpoint' }, friend.revision);
  assert.equal(ownerCheckpoint.revision, friend.revision);
  assert.deepEqual(ownerCheckpoint.account, friend.account);
  assert.equal(ownerCheckpoint.social.friends[0].online, true);
  assert.ok(Number.isFinite(Date.parse(ownerCheckpoint.social.friends[0].lastSeenAt)));
  assert.equal(peerCheckpoint.revision, accepted.data.revision);
  assert.deepEqual(peerCheckpoint.account, accepted.data.account);
  const observedOwner = await callAs(client2, { kind: 'read' }, 0);
  assert.equal(observedOwner.social.friends[0].online, true);
  assert.ok(Date.parse(observedOwner.social.friends[0].lastSeenAt) >=
    Date.parse(peerCheckpoint.social.friends[0].lastSeenAt),
    'checkpoint touches server presence before another accepted friend observes it');
  await assert.rejects(call({ kind: 'checkpoint', online: true }, friend.revision),
    error => error.status === 400);
  await assert.rejects(call({ kind: 'read', lastSeenAt: new Date().toISOString() }, 0),
    error => error.status === 400);
  async function chatAs(client, chat, requestId = randomUUID()) {
    const { data, error: invokeError } = await client.functions.invoke('game-operation', { body: { requestId, chat } });
    if (invokeError) {
      const body = await invokeError.context?.clone().json().catch(() => null);
      const failure = new Error(`Hosted chat ${chat.kind} rejected (${invokeError.context?.status ?? 'transport'}): ${
        typeof body?.error === 'string' ? body.error.slice(0, 200) : 'No server error detail.'}`);
      failure.status = invokeError.context?.status;
      throw failure;
    }
    return data;
  }
  const ownerBeforeChat = await call({ kind: 'read' }, 0);
  const peerBeforeChat = await callAs(client2, { kind: 'read' }, 0);
  const direct = await chatAs(client, { kind: 'direct', userId: ids[1] });
  assert.equal(direct.selfUserId, ids[0]);
  const directId = direct.conversationId;
  assert.equal(direct.conversations.find(entry => entry.id === directId).kind, 'direct');
  const sendId = randomUUID();
  const sent = await chatAs(client, { kind: 'send', conversationId: directId, text: '  <b>hello</b>\r\nfriend  ' }, sendId);
  const resent = await chatAs(client, { kind: 'send', conversationId: directId, text: '  <b>hello</b>\r\nfriend  ' }, sendId);
  assert.equal(sent.messages.length, 1);
  assert.equal(sent.messages[0].text, '<b>hello</b>\nfriend');
  assert.deepEqual(resent.messages.map(message => message.id), sent.messages.map(message => message.id));
  await assert.rejects(chatAs(client, { kind: 'send', conversationId: directId, text: 'different' }, sendId),
    error => error.status === 409);
  await assert.rejects(chatAs(client, { kind: 'send', conversationId: directId, text: 'x'.repeat(501) }),
    error => error.status === 400);
  await assert.rejects(chatAs(client, { kind: 'read', conversationId: randomUUID() }), error => error.status === 400);
  const peerOverview = await chatAs(client2, { kind: 'read' });
  assert.equal(peerOverview.unreadTotal, 1);
  assert.equal(peerOverview.conversations[0].unread, 1);
  const peerOpened = await chatAs(client2, { kind: 'read', conversationId: directId });
  assert.equal(peerOpened.messages.at(-1).text, '<b>hello</b>\nfriend');
  assert.equal(peerOpened.unreadTotal, 0);
  const pinned = await chatAs(client2, { kind: 'preferences', conversationId: directId, pinned: true, muted: true });
  assert.ok(pinned.conversations[0].pinned && pinned.conversations[0].muted);
  assert.equal((await chatAs(client, { kind: 'read' })).conversations[0].pinned, false);
  const group = await chatAs(client, { kind: 'createGroup', name: 'Smoke <Group>', userIds: [ids[1]] });
  const groupId = group.conversationId;
  const groupView = group.conversations.find(entry => entry.id === groupId);
  assert.equal(groupView.ownerId, ids[0]);
  assert.equal(groupView.invited.length, 1);
  assert.equal((await chatAs(client2, { kind: 'read' })).invitations[0].conversationId, groupId);
  await assert.rejects(chatAs(client2, { kind: 'send', conversationId: groupId, text: 'early' }), error => error.status === 400);
  const joined = await chatAs(client2, { kind: 'respondInvite', conversationId: groupId, accept: true });
  assert.equal(joined.conversations.find(entry => entry.id === groupId).members.length, 2);
  await chatAs(client2, { kind: 'send', conversationId: groupId, text: 'group hello' });
  await assert.rejects(chatAs(client2, { kind: 'removeMember', conversationId: groupId, userId: ids[0] }),
    error => error.status === 400);
  const ownerGroup = await chatAs(client, { kind: 'read', conversationId: groupId });
  assert.equal(ownerGroup.messages.at(-1).text, 'group hello');
  const transferred = await chatAs(client, { kind: 'leave', conversationId: groupId });
  assert.ok(!transferred.conversations.some(entry => entry.id === groupId));
  assert.equal((await chatAs(client2, { kind: 'read' })).conversations.find(entry => entry.id === groupId).ownerId, ids[1]);
  assert.equal((await call({ kind: 'read' }, 0)).revision, ownerBeforeChat.revision, 'chat never revises gameplay');
  assert.equal((await callAs(client2, { kind: 'read' }, 0)).revision, peerBeforeChat.revision, 'chat never revises gameplay');
  const removed = await call({ kind: 'removeFriend', userId: ids[1] }, friend.revision);
  const hiddenDirect = await chatAs(client, { kind: 'read' });
  assert.ok(!hiddenDirect.conversations.some(entry => entry.id === directId), 'unfriending hides direct chat');
  await assert.rejects(chatAs(client, { kind: 'send', conversationId: directId, text: 'gone' }), error => error.status === 400);
  const blocked = await chatAs(client2, { kind: 'block', userId: ids[0] });
  assert.equal(blocked.blocked[0].userId, ids[0]);
  const ownerAfterBlock = await call({ kind: 'read' }, 0);
  await assert.rejects(call({ kind: 'friendRequest', friendCode: peerBeforeChat.profile.friendCode }, ownerAfterBlock.revision),
    error => error.status === 400);
  assert.equal((await chatAs(client2, { kind: 'unblock', userId: ids[0] })).blocked.length, 0);
  assert.equal(removed.social.friends.length, 0);
  let owner = await call({ kind: 'read' }, 0);
  async function makePeer(sendRequest = true) {
    const username = `cap_${randomUUID().replaceAll('-', '').slice(0, 10)}`;
    const email = `${username}@example.invalid`;
    const password = randomUUID() + randomUUID();
    const made = await admin.auth.admin.createUser({ email, password, email_confirm: true,
      user_metadata: { username } });
    if (made.error || !made.data.user) throw new Error('Friend-cap smoke identity creation failed.');
    ids.push(made.data.user.id);
    const peerClient = createClient(url, clientKey, { auth: { persistSession: false } });
    if ((await peerClient.auth.signInWithPassword({ email, password })).error) throw new Error('Friend-cap smoke authentication failed.');
    if (sendRequest) await callAs(peerClient, { kind: 'friendRequest', friendCode: owner.profile.friendCode }, 0);
    return { id: made.data.user.id, username, client: peerClient };
  }
  for (let index = 0; index < 29; index++) {
    const peer = await makePeer();
    owner = await call({ kind: 'acceptFriendRequest', userId: peer.id }, owner.revision);
  }
  const contenders = await Promise.all([makePeer(false), makePeer(false)]);
  const latestContenders = await Promise.all(contenders.map(peer =>
    callAs(peer.client, { kind: 'read' }, 0)));
  for (const peer of contenders) {
    owner = await call({ kind: 'friendRequest', username: peer.username }, owner.revision);
  }
  const contested = await Promise.allSettled(contenders.map((peer, index) =>
    callAs(peer.client, { kind: 'acceptFriendRequest', userId: ids[0] }, latestContenders[index].revision)));
  assert.equal(contested.filter(result => result.status === 'fulfilled').length, 1,
    'exactly one concurrent friend acceptance should use the final slot');
  assert.equal(contested.filter(result => result.status === 'rejected').length, 1,
    'the other concurrent acceptance should be rejected');
  assert.ok(contested.some(result => result.status === 'rejected' &&
    result.reason.status === 400 && /friend limit/i.test(result.reason.message)),
    'the independent-revision loser must hit the friend cap, not CAS');
  owner = await call({ kind: 'read' }, 0);
  assert.equal(owner.social.friends.length, 30);
  const contenderStates = await Promise.all(contenders.map(peer => callAs(peer.client, { kind: 'read' }, 0)));
  assert.deepEqual(contenderStates.map(state => state.social.friends.length).sort(), [0, 1]);
  assert.deepEqual(contenderStates.map(state => state.social.incoming.length).sort(), [0, 1]);
  const anonymous = await fetch(`${url}/functions/v1/game-operation`, { method: 'POST',
    headers: { apikey: clientKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestId: randomUUID(), expectedRevision: 0, operation: { kind: 'read' } }) });
  assert.equal(anonymous.status, 401);
  console.log('Hosted smoke passed: auth denial, stable public profile references, bounded session metrics/idempotency, recent confirmed activity, fresh bootstrap/save import, concurrent CAS, gates, actual kills/rewards/continue/quit, friend-code requests, accepted-only real read/checkpoint presence, privacy, race-safe friend cap, and friend/group chat (idempotent sends, unread/pin/mute, invites, owner transfer, block, no gameplay revisions).');
  }
} finally {
  const failures = [];
  for (const id of ids) {
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) failures.push(id);
  }
  if (failures.length) throw new Error(`Hosted smoke cleanup failed for disposable identity IDs: ${failures.join(', ')}`);
  console.log('Hosted smoke identities and cascading gameplay records removed.');
}

async function smokeRecurringMaster(client, userId, username) {
  const game = freshGame(username);
  game.starterId = 'ember';
  game.account.characters = { ember: { level: 0, evolution: 1 }, atmoso: { level: 0, evolution: 1 } };
  game.account.squad = ['atmoso'];
  game.account.masterConduits = { 'master-atmoso-1': 1 };
  game.account.masterEquipment = { atmoso: 'master-atmoso-1' };
  const entropy = { seed: () => 1729, uuid: () => randomUUID(), random: () => .5 };
  const entered = resolveOperation(game, { kind: 'enter', activity: { kind: 'training' } }, entropy).game;
  assert.ok(entered.run);
  const state = entered.run.session.state;
  const owner = state.allies[0];
  owner.stats.crit = 1;
  owner.shatter = owner.stats.shatterCapacity;
  owner.readyRound.skill2 = state.round;
  owner.omnicMemory = { 'master-atmoso-1': { usedRound: state.round, bankRound: state.round } };
  state.enemies.forEach(enemy => {
    enemy.hp = enemy.stats.health = 10000;
    enemy.stats.damage = 0;
    enemy.stats.crit = 0;
  });
  // Only this newly created disposable identity receives deterministic combat fixtures.
  assert.ok(ids.includes(userId));
  const seeded = await admin.rpc('load_game_account', { p_user: userId, p_initial: entered });
  assert.equal(seeded.error, null);
  assert.equal(seeded.data.revision, 0);
  async function invoke(operation, revision, requestId = randomUUID()) {
    const result = await client.functions.invoke('game-operation', {
      body: { operation, expectedRevision: revision, requestId },
    });
    if (result.error) throw new Error(`Hosted Master ${operation.kind} failed (${result.error.context?.status ?? 'transport'}).`);
    return result.data;
  }
  const initial = await invoke({ kind: 'read' }, 0);
  assert.equal(initial.session.state.allies[0].masterConduit, 'master-atmoso-1');
  const operation = { kind: 'act', runId: initial.session.runId, actorId: 'atmoso',
    action: 'skill2', targetId: initial.session.state.enemies[0].id };
  const requestId = randomUUID();
  const resolved = await invoke(operation, initial.revision, requestId);
  const followups = resolved.result.events.filter(event =>
    event.kind === 'damage' && event.message.includes('Sky Without End Turbine'));
  assert.ok(state.enemies.length > 1);
  assert.equal(followups.length, state.enemies.length, 'Master recurs once per native AoE critical, without recursion');
  assert.equal(new Set(followups.map(event => event.target)).size, state.enemies.length);
  assert.equal(resolved.session.state.allies[0].omnicMemory['master-atmoso-1'].usedRound, state.round,
    'Legacy round stamps remain untouched and do not block Master effects');
  assert.equal(resolved.revision, initial.revision + 1);
  assert.deepEqual(await invoke(operation, initial.revision, requestId), resolved, 'Retry never resolves combat twice');
  const checkpoint = await invoke({ kind: 'checkpoint' }, resolved.revision);
  assert.deepEqual(checkpoint.session, resolved.session);
  assert.deepEqual(checkpoint.account, resolved.account);
  assert.equal(checkpoint.revision, resolved.revision);
  assert.equal((await invoke({ kind: 'quit', runId: resolved.session.runId }, resolved.revision)).session, null);
  console.log(`Hosted Master smoke passed: ${followups.length} distinct native AoE critical payoffs in one round, ignored legacy gates, nonrecursive strikes, frozen loadout, idempotent retry, checkpoint persistence and quit.`);
}
