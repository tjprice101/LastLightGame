import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import assert from 'node:assert/strict';
import { conduitRulesVersion, freshGame, resolveOperation } from '../supabase/functions/game-operation/engine.bundle.js';

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
  if (process.argv.includes('--omnic-refresh')) {
    await smokeOmnicRefresh(client, created.user.id, username);
  } else if (process.argv.includes('--conduit-rework')) {
    await smokeConduitRework(client, created.user.id, username);
  } else if (process.argv.includes('--dot-scaling')) {
    await smokeDotScaling(client, created.user.id, username);
  } else if (process.argv.includes('--machines-layout')) {
    await smokeMachinesLayout(client, created.user.id, username);
  } else if (process.argv.includes('--focus-loot')) {
    await smokeFocusLoot(client, created.user.id, username);
  } else if (process.argv.includes('--last-flare')) {
    await smokeLastFlare(client, created.user.id, username);
  } else if (process.argv.includes('--capture-rate')) {
    await smokeFinalLoot(client, created.user.id, username, false, true);
  } else if (process.argv.includes('--rose-progression')) {
    await smokeRoseProgression(client, created.user.id, username);
  } else if (process.argv.includes('--phase-zero')) {
    await smokePhaseZero(client, created.user.id, username);
  } else if (process.argv.includes('--evolution')) {
    await smokeEvolutionFodder(client, created.user.id, username);
  } else if (process.argv.includes('--native-calamity')) {
    await smokeNativeCalamity(client, created.user.id, username);
  } else if (process.argv.includes('--calamitic-economy')) {
    await smokeCalamiticEconomy(client, created.user.id, username);
  } else if (process.argv.includes('--final-loot') || process.argv.includes('--loot-parity')) {
    await smokeFinalLoot(client, created.user.id, username, process.argv.includes('--loot-parity'));
  } else if (process.argv.includes('--masters')) {
    await smokeEquippedMaster(client, created.user.id, username);
  } else if (process.argv.includes('--balance')) {
    await smokeEnemyBalance(client, created.user.id, username);
  } else if (process.argv.includes('--components')) {
    await smokeGuaranteedComponents(client, created.user.id, username);
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
  assert.deepEqual(enter.session.state.enemies[0].stats, {
    health: 87, damage: 23, defense: 4, crit: .12,
    critMultiplier: 1.5, shatterCapacity: 100, elementalDamage: 0,
  });
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
  assert.equal(quit.account.lycalis, 2);
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
  const viewed = await client2.functions.invoke('game-operation', { body: { requestId: randomUUID(), friendProfile: { userId: ids[0] } } });
  assert.equal(viewed.error, null);
  assert.equal(viewed.data.userId, ids[0]);
  assert.equal(viewed.data.profile.username, activeRead.profile.username);
  assert.equal(viewed.data.account.fractalis, 0);
  assert.equal(viewed.data.account.lycalis, 0);
  assert.deepEqual(viewed.data.account.receipts, []);
  assert.equal(viewed.data.account.storyCompleted, friend.account.storyCompleted);
  assert.ok(!('email' in viewed.data.profile));
  const stranger = await client2.functions.invoke('game-operation', { body: { requestId: randomUUID(), friendProfile: { userId: randomUUID() } } });
  assert.equal(stranger.error?.context?.status, 404);
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

async function smokePhaseZero(client, userId, username) {
  assert.equal(conduitRulesVersion, 9, 'The production bundle must activate rules9');
  const id = 'calamitic-causality-funeral-engine';
  const entropy = { seed: () => 7321, uuid: () => randomUUID(), random: () => .9 };
  let game = resolveOperation(freshGame(username), { kind: 'bootstrap', starterId: 'ember' }, entropy).game;
  game.account.characters.tide = { level: 0, evolution: 1 };
  game.account.squad = ['ember', 'tide'];
  game.account.conduits = { [id]: 1 };
  game.account.conduitUpgrades = { [id]: 5 };
  game.account.conduitEquipment = { ember: [id, null, null, null, null, null, null, null] };
  game = resolveOperation(game, { kind: 'enter', activity: { kind: 'training' } }, entropy).game;
  const state = game.run.session.state;
  state.allies[0].stats.damage = 100;
  state.allies[0].stats.crit = 0;
  state.allies[0].shatter = 100;
  for (const enemy of state.enemies) {
    enemy.stats.health = enemy.hp = 10000;
    enemy.stats.defense = enemy.stats.damage = enemy.stats.crit = 0;
  }
  game.account.conduitEquipment = { ember: [null, null, null, null, null, null, null, null] };
  assert.ok(ids.includes(userId), 'Only disposable identities may receive fixtures');
  const seeded = await admin.rpc('load_game_account', { p_user: userId, p_initial: game });
  assert.equal(seeded.error, null);
  async function invoke(operation, revision, requestId = randomUUID()) {
    const result = await client.functions.invoke('game-operation', {
      body: { operation, expectedRevision: revision, requestId },
    });
    if (result.error) throw new Error(`Hosted Phase 0 ${operation.kind} failed (${result.error.context?.status ?? 'transport'}).`);
    return result.data;
  }
  const initial = await invoke({ kind: 'read' }, 0);
  assert.equal(initial.session.state.conduitRulesVersion, 9);
  assert.equal(initial.session.state.allies[0].stats.skillPower, 1);
  assert.equal(initial.session.state.allies[0].stats.skillEfficiency, .5);
  const operation = { kind: 'act', runId: initial.session.runId, actorId: 'ember', action: 'skill1',
    targetId: initial.session.state.enemies[0].id };
  const requestId = randomUUID();
  const resolved = await invoke(operation, initial.revision, requestId);
  const expected = resolveOperation(game, operation, entropy);
  assert.deepEqual(resolved.result, JSON.parse(JSON.stringify(expected.response.result)));
  assert.equal(resolved.session.state.enemies[0].burn.damage, 25);
  assert.equal(resolved.session.state.allies[0].conduits[0], id);
  assert.deepEqual(resolved.account, initial.account);
  assert.deepEqual(await invoke(operation, initial.revision, requestId), resolved);
  const checkpoint = await invoke({ kind: 'checkpoint' }, resolved.revision);
  assert.deepEqual(checkpoint.session, resolved.session);
  assert.deepEqual(checkpoint.account, resolved.account);
  const quit = await invoke({ kind: 'quit', runId: resolved.session.runId }, resolved.revision);
  const fresh = await invoke({ kind: 'enter', activity: { kind: 'training' } }, quit.revision);
  assert.equal(fresh.session.state.allies[0].stats.skillPower, 1, 'A fresh entry uses current menu gear');
  assert.equal(fresh.session.state.conduitRulesVersion, 9);
  assert.equal((await invoke({ kind: 'quit', runId: fresh.session.runId }, fresh.revision)).session, null);
  console.log('Hosted Phase 0 smoke passed: rules9, frozen Funeral +5 Efficiency cap, exact direct-damage parity and25 Burn, unchanged holdings, idempotent action, checkpoint persistence and fresh-entry gear.');
}

async function smokeConduitRework(firstClient, firstId, firstUsername) {
  assert.equal(conduitRulesVersion, 9);
  const replacements = [
    'bastion-lock', 'crosspin-governor', 'fieldbrace-coupler', 'fracture-reservoir', 'parallax-relay',
    'precision-escapement', 'prism-splinter-socket', 'reserve-torque-crank', 'siegebound-drive', 'vigil-core',
    'aegis-capacitor', 'breach-pendulum', 'coilfeed-ratchet', 'duplex-heart', 'falcon-sight', 'glassroot-gimbal',
    'hammerbalance-link', 'lifeline-flywheel', 'opal-indexer', 'resonance-crucible', 'sentinel-aperture',
    'spearwheel-engine', 'springwell-pump', 'twinpulse-bellows', 'wardglass-transformer', 'astral-prism',
    'citadel-spine', 'execution-orrery', 'granite-hourglass', 'horizon-heartcase', 'immortal-vessel',
    'judgment-lens', 'meridian-inverter', 'nullsong-transmission', 'pale-bulwark-diadem', 'siege-cantilever',
    'starvein-conductor', 'stasis-reliquary', 'verdict-caliper', 'worldbreaker-drive',
    'calamitic-cathedral-final-equation', 'calamitic-causality-funeral-engine',
    'calamitic-horizon-cleaving-godpress', 'calamitic-throne-borrowed-tomorrows', 'calamitic-world-eater-orrery',
  ];
  assert.equal(new Set(replacements).size, 45);
  let index = 0;
  for (const level of [0, 5]) for (const batch of [replacements.slice(0, 24), replacements.slice(24)]) {
    let client = firstClient, userId = firstId, username = firstUsername;
    if (index++) {
      username = `rw_${randomUUID().replaceAll('-', '').slice(0, 10)}`;
      const password = randomUUID() + randomUUID(), email = `${username}@example.invalid`;
      const made = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { username } });
      if (made.error || !made.data.user) throw new Error('Conduit rework smoke identity creation failed.');
      userId = made.data.user.id; ids.push(userId);
      client = createClient(url, clientKey, { auth: { persistSession: false } });
      if ((await client.auth.signInWithPassword({ email, password })).error)
        throw new Error('Conduit rework smoke authentication failed.');
    }
    const entropy = { seed: () => 1729, uuid: () => randomUUID(), random: () => .5 };
    let game = freshGame(username);
    game.starterId = 'ember';
    const squad = ['ember', 'tide', 'sprout'];
    game.account.characters = Object.fromEntries(squad.map(id => [id, { level: 0, evolution: 1 }]));
    game.account.squad = squad;
    game.account.conduits = Object.fromEntries(batch.map(id => [id, 1]));
    game.account.conduitUpgrades = Object.fromEntries(batch.map(id => [id, level]));
    game.account.conduitEquipment = Object.fromEntries(squad.map((id, member) => {
      const selected = batch.slice(member * 8, member * 8 + 8);
      return [id, [...selected, ...Array(8 - selected.length).fill(null)]];
    }));
    game = resolveOperation(game, { kind: 'enter', activity: { kind: 'training' } }, entropy).game;
    const runId = game.run.session.runId;
    for (const ally of game.run.session.state.allies) {
      ally.shatter = ally.stats.shatterCapacity;
      ally.hp = Math.round(ally.stats.health * .75);
    }
    for (const enemy of game.run.session.state.enemies) {
      enemy.stats.health = enemy.hp = 1000000;
      enemy.stats.damage = 10; enemy.stats.crit = 0;
    }
    assert.ok(ids.includes(userId), 'Only disposable identities may receive fixtures');
    assert.equal((await admin.rpc('load_game_account', { p_user: userId, p_initial: game })).error, null);
    async function invoke(operation, revision, requestId = randomUUID()) {
      const response = await client.functions.invoke('game-operation', { body: { operation, expectedRevision: revision, requestId } });
      if (response.error) throw new Error(`Hosted Conduit rework ${operation.kind} failed (${response.error.context?.status ?? 'transport'}).`);
      return response.data;
    }
    let read = await invoke({ kind: 'read' }, 0);
    assert.deepEqual(read.session.state, JSON.parse(JSON.stringify(game.run.session.state)));
    for (const operation of [
      { kind: 'act', runId, actorId: 'ember', action: 'skill1', targetId: game.run.session.state.enemies[0].id },
      { kind: 'act', runId, actorId: 'tide', action: 'skill2', targetId: 'sprout' },
      { kind: 'act', runId, actorId: 'sprout', action: 'ultimate', targetId: 'sprout' },
      { kind: 'endTurn', runId },
    ]) {
      const expected = resolveOperation(game, operation, entropy), requestId = randomUUID();
      const actual = await invoke(operation, read.revision, requestId);
      assert.deepEqual(actual.result, JSON.parse(JSON.stringify(expected.response.result)), `Conduit batch${index} +${level}`);
      assert.deepEqual(actual.account, expected.response.account);
      assert.deepEqual(await invoke(operation, read.revision, requestId), actual);
      read = await invoke({ kind: 'read' }, actual.revision);
      assert.deepEqual(read.session.state, actual.session.state);
      game = expected.game;
    }
  }
  console.log('Hosted Conduit rework smoke passed: all45 replacements at +0/+5 across four disposable squads, rules9 static/runtime parity, healing/Shield/Last Flare/enemy-phase results, persisted snapshots and idempotent retries. No owner accounts modified.');
}

async function smokeOmnicRefresh(firstClient, firstId, firstUsername) {
  assert.equal(conduitRulesVersion, 9);
  const source = readFileSync(new URL('../src/content/phase-zero-conduit-catalog.ts', import.meta.url), 'utf8');
  const catalog = JSON.parse(source.slice(source.indexOf('= {') + 2, source.lastIndexOf('};') + 1));
  const ordinary = Object.entries(catalog).filter(([id, entry]) => entry.rarity === 'Omnic' && !id.startsWith('master-'));
  const masters = Object.keys(catalog).filter(id => id.startsWith('master-'));
  assert.equal(ordinary.length, 45); assert.equal(masters.length, 48);
  const characters = { infernic: 'ember', oceanic: 'tide', atmospheric: 'atmoso',
    botanic: 'sprout', tranquilitic: 'bliss', chaotic: 'disciple' };
  const fixtures = [];
  const groups = Object.entries(characters).map(([element, character]) => ({
    character, ids: ordinary.filter(([, entry]) => entry.element.toLowerCase().startsWith(element)).map(([id]) => id),
  }));
  for (const level of [0, 5]) for (const family of [groups.slice(0, 3), groups.slice(3)]) {
    for (let offset = 0; offset < Math.max(...family.map(group => group.ids.length)); offset += 4) {
      const roster = family.map(group => group.character);
      fixtures.push({ roster, level, equipment: Object.fromEntries(family.map(group =>
        [group.character, [...group.ids.slice(offset, offset + 4), ...Array(8 - group.ids.slice(offset, offset + 4).length).fill(null)]])), masters: {} });
    }
  }
  const masterGroups = [];
  for (const id of masters) {
    const character = id.slice(7, id.lastIndexOf('-'));
    let group = masterGroups.find(group => Object.keys(group).length < 3 && !group[character]);
    if (!group) { group = {}; masterGroups.push(group); }
    group[character] = id;
  }
  for (const loadout of masterGroups) fixtures.push({
    roster: [...new Set([...Object.keys(loadout), 'ember', 'tide', 'sprout'])].slice(0, 3),
    level: 0, equipment: {}, masters: loadout,
  });
  assert.equal(new Set(fixtures.flatMap(fixture => Object.values(fixture.equipment).flat().filter(Boolean))).size, 45);
  assert.equal(new Set(fixtures.flatMap(fixture => Object.values(fixture.masters))).size, 48);
  let index = 0;
  for (const fixture of fixtures) {
    let client = firstClient, userId = firstId, username = firstUsername;
    if (index++) {
      username = `om_${randomUUID().replaceAll('-', '').slice(0, 10)}`;
      const password = randomUUID() + randomUUID(), email = `${username}@example.invalid`;
      const made = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { username } });
      if (made.error || !made.data.user) throw new Error('Omnic smoke identity creation failed.');
      userId = made.data.user.id; ids.push(userId);
      client = createClient(url, clientKey, { auth: { persistSession: false } });
      if ((await client.auth.signInWithPassword({ email, password })).error) throw new Error('Omnic smoke login failed.');
    }
    const entropy = { seed: () => 1729, uuid: () => randomUUID(), random: () => .5 };
    let game = freshGame(username);
    game.starterId = 'ember';
    game.account.characters = Object.fromEntries([...new Set(['ember', ...fixture.roster])].map(id => [id, { level: 0, evolution: 1 }]));
    game.account.squad = fixture.roster;
    const equipped = Object.values(fixture.equipment).flat().filter(Boolean);
    game.account.conduits = Object.fromEntries(equipped.map(id => [id, 1]));
    game.account.conduitUpgrades = Object.fromEntries(equipped.map(id => [id, fixture.level]));
    game.account.conduitEquipment = fixture.equipment;
    game.account.masterConduits = Object.fromEntries(Object.values(fixture.masters).map(id => [id, 1]));
    game.account.masterEquipment = fixture.masters;
    game = resolveOperation(game, { kind: 'enter', activity: { kind: 'training' } }, entropy).game;
    const runId = game.run.session.runId;
    for (const unit of game.run.session.state.allies) {
      unit.shatter = unit.stats.shatterCapacity; unit.hp = Math.round(unit.stats.health * .75);
    }
    for (const enemy of game.run.session.state.enemies) {
      enemy.hp = enemy.stats.health = 1000000; enemy.stats.damage = 1; enemy.stats.crit = 0;
    }
    game.account.conduitEquipment = {}; game.account.masterEquipment = {};
    assert.ok(ids.includes(userId), 'Only disposable identities may receive fixtures');
    assert.equal((await admin.rpc('load_game_account', { p_user: userId, p_initial: game })).error, null);
    async function invoke(operation, revision, requestId = randomUUID()) {
      const result = await client.functions.invoke('game-operation', { body: { operation, expectedRevision: revision, requestId } });
      if (result.error) throw new Error(`Hosted Omnic fixture${index} ${operation.kind} failed (${result.error.context?.status ?? 'transport'}).`);
      return result.data;
    }
    let response = await invoke({ kind: 'read' }, 0);
    assert.deepEqual(response.session.state, JSON.parse(JSON.stringify(game.run.session.state)));
    for (const action of ['light', 'ultimate']) {
      for (const actorId of fixture.roster) {
        const actor = game.run.session.state.allies.find(unit => unit.id === actorId);
        const ability = action === 'light' ? null : actor.kit.abilities[action];
        const targetId = ability?.targets === 'one-ally'
          ? fixture.roster.find(id => id !== actorId) : game.run.session.state.enemies[0].id;
        const operation = { kind: 'act', runId, actorId, action, targetId };
        const expected = resolveOperation(game, operation, entropy), requestId = randomUUID();
        const actual = await invoke(operation, response.revision, requestId);
        assert.deepEqual(actual.result, JSON.parse(JSON.stringify(expected.response.result)), `Omnic fixture${index} ${actorId} ${action}`);
        assert.deepEqual(actual.account, expected.response.account);
        assert.deepEqual(await invoke(operation, response.revision, requestId), actual);
        game = expected.game; response = actual;
      }
      if (action === 'light') {
        const operation = { kind: 'endTurn', runId }, expected = resolveOperation(game, operation, entropy);
        response = await invoke(operation, response.revision);
        assert.deepEqual(response.result, JSON.parse(JSON.stringify(expected.response.result)));
        game = expected.game;
      }
    }
    const checkpoint = await invoke({ kind: 'checkpoint' }, response.revision);
    assert.deepEqual(checkpoint.session, response.session);
    assert.deepEqual(checkpoint.account, response.account);
  }
  console.log(`Hosted Omnic refresh passed: all45 ordinary Omnics at +0/+5 and all48 fixed Masters across ${fixtures.length} disposable fixtures, exact Normal/Last Flare/enemy-phase authority parity, frozen investments after menu unequips, idempotent retries and persistent checkpoints.`);
}

async function smokeNativeCalamity(client, userId, username) {
  const entropy = { seed: () => 1729, uuid: () => randomUUID(), random: () => .5 };
  let game = freshGame(username);
  game.starterId = 'ember';
  game.account.characters = Object.fromEntries(['tide', 'disciple', 'ember']
    .map(id => [id, { level: 105, evolution: 6 }]));
  game.account.squad = ['tide', 'disciple', 'ember'];
  game.account.normalFinalClears = { treasury: true, roses: true };
  game.account.calamityClears = { treasury: 2 };
  game.account.storyCompleted = 120;
  game.account.infusionStages = { machines: 35, roses: 35 };
  game = resolveOperation(game, {
    kind: 'enter', activity: { kind: 'calamity', activity: 'treasury', tier: 3 },
  }, entropy).game;
  game.run.session.state.allies.forEach(ally => { ally.shatter = 100; });
  game.run.session.state.enemies[0].hp = 1;
  assert.ok(ids.includes(userId), 'Only disposable identities may receive fixtures');
  const seeded = await admin.rpc('load_game_account', { p_user: userId, p_initial: game });
  assert.equal(seeded.error, null);
  async function invoke(operation, revision, requestId = randomUUID()) {
    const result = await client.functions.invoke('game-operation', {
      body: { operation, expectedRevision: revision, requestId },
    });
    if (result.error) throw new Error(`Hosted native/Calamity ${operation.kind} failed (${result.error.context?.status ?? 'transport'}).`);
    return result.data;
  }
  let response = await invoke({ kind: 'read' }, 0);
  assert.equal(response.session.state.conduitRulesVersion, conduitRulesVersion);
  assert.equal(response.session.state.enemies[0].level, 185);
  assert.equal(response.session.state.enemies[0].stats.health, 3059413);
  assert.equal(response.session.state.enemies[0].stats.damage, 50059);
  assert.equal(response.session.state.enemies[0].stats.defense, 10938);
  const runId = response.session.runId;
  for (const [actorId, action, targetId] of [
    ['tide', 'skill2', 'disciple'], ['disciple', 'skill1', 'ember'],
  ]) {
    response = await invoke({ kind: 'act', runId, actorId, action, targetId }, response.revision);
  }
  const disciple = response.session.state.allies.find(ally => ally.id === 'disciple');
  const ember = response.session.state.allies.find(ally => ally.id === 'ember');
  assert.ok(disciple.shield > 0);
  assert.equal(ember.native.instruction.kind, 'strike');
  assert.equal(ember.native.instruction.owner, 'disciple');
  const operation = { kind: 'act', runId, actorId: 'ember', action: 'light',
    targetId: response.session.state.enemies[0].id };
  const revision = response.revision;
  const requestId = randomUUID();
  response = await invoke(operation, revision, requestId);
  assert.deepEqual(await invoke(operation, revision, requestId), response);
  assert.equal(response.session.state.phase, 'cleared');
  const chestId = 'calamity:treasury:3';
  assert.equal(response.account.calamityChests[chestId], 1);
  assert.equal(response.account.fractalis, 0);
  assert.equal(response.account.lycalis, 0);
  const open = { kind: 'openCalamityChest', id: chestId, expectedCount: 1 };
  const openId = randomUUID();
  const opened = await invoke(open, response.revision, openId);
  assert.deepEqual(await invoke(open, response.revision, openId), opened);
  assert.equal(opened.calamityOpening.masterChests, 2);
  assert.equal(opened.account.masterChests, 2);
  assert.equal(opened.account.fractalis, opened.calamityOpening.fractalis);
  assert.equal(opened.account.lycalis, opened.calamityOpening.lycalis);
  assert.equal(opened.account.calamityChests[chestId] ?? 0, 0);
  const persisted = await invoke({ kind: 'read' }, opened.revision);
  assert.deepEqual(persisted.account, opened.account);
  const quit = await invoke({ kind: 'quit', runId }, opened.revision);
  assert.equal(quit.session, null);
  const entered = await invoke({ kind: 'enter', activity: { kind: 'calamity', activity: 'treasury', tier: 1 } }, quit.revision);
  assert.equal(entered.session.state.enemies[0].art, 'calamity-boss-treasury');
  assert.equal(entered.session.state.enemies[0].stats.health, 512313);
  assert.equal(entered.session.state.enemies[0].stats.damage, 14367);
  assert.equal(entered.session.state.enemies[0].stats.defense, 3005);
  const leave = await invoke({ kind: 'quit', runId: entered.session.runId }, entered.revision);
  assert.equal(leave.session, null);
  const rose = await invoke({ kind: 'enter', activity: { kind: 'calamity', activity: 'roses', tier: 1 } }, leave.revision);
  assert.equal(rose.session.state.enemies[0].art, 'calamity-boss-roses');
  assert.deepEqual(rose.session.state.enemies[0].stats, entered.session.state.enemies[0].stats);
  let exited = await invoke({ kind: 'quit', runId: rose.session.runId }, rose.revision);
  assert.equal(exited.session, null);
  for (const [mode, level, health, damage, defense] of [
    ['machines', 120, 248758, 8652, 1774], ['roses', 140, 424325, 12589, 2620],
  ]) {
    const normal = await invoke({ kind: 'enter', activity: { kind: 'infusion', mode, stage: 35 } }, exited.revision);
    const enemy = normal.session.state.enemies[0];
    assert.equal(enemy.level, level);
    assert.equal(enemy.hp, health);
    assert.equal(enemy.stats.health, health);
    assert.equal(enemy.stats.damage, damage);
    assert.equal(enemy.stats.defense, defense);
    exited = await invoke({ kind: 'quit', runId: normal.session.runId }, normal.revision);
    assert.equal(exited.session, null);
  }
  console.log(`Hosted native/Calamity smoke passed: rules${conduitRulesVersion}, explicit Tizu/Disciple recipients, Lv185 EX3 chest-only fixture victory, atomic opening with two Master chests, idempotent action/opening, persisted holdings and freshly spawned exact120/140/145/185 resistance stats and artwork.`);
}

async function smokeCalamiticEconomy(client, userId, username) {
  const entropy = { seed: () => 1729, uuid: () => randomUUID(), random: () => .5 };
  let game = freshGame(username);
  game.starterId = 'ember';
  game.account.characters = { ember: { level: 105, evolution: 6 } };
  game.account.squad = ['ember'];
  game.account.normalFinalClears = { treasury: true };
  assert.equal(Object.hasOwn(game.account, 'calamiticTokens'), false, 'The fixture exercises legacy accounts without a token field.');
  game = resolveOperation(game, {
    kind: 'enter', activity: { kind: 'calamity', activity: 'treasury', tier: 1 },
  }, entropy).game;
  game.run.session.state.enemies[0].hp = 1;
  assert.ok(ids.includes(userId), 'Only disposable identities may receive fixtures');
  const seeded = await admin.rpc('load_game_account', { p_user: userId, p_initial: game });
  assert.equal(seeded.error, null);

  async function invoke(clientForCall, operation, revision, requestId = randomUUID()) {
    const result = await clientForCall.functions.invoke('game-operation', {
      body: { operation, expectedRevision: revision, requestId },
    });
    if (result.error) {
      const body = await result.error.context?.clone().json().catch(() => null);
      const failure = new Error(`Hosted Calamitic ${operation.kind} rejected (${result.error.context?.status ?? 'transport'}): ${body?.error ?? 'No server error detail.'}`);
      failure.status = result.error.context?.status;
      throw failure;
    }
    return result.data;
  }

  const expectedTokens = [1, 3, 8];
  for (const [index, tier] of [1, 2, 3].entries()) {
    let tierClient = client;
    if (tier > 1) {
      const tierUsername = `smoke_${randomUUID().slice(0, 8)}`;
      const password = randomUUID() + randomUUID();
      const { data: tierUser, error } = await admin.auth.admin.createUser({
        email: `${tierUsername}@example.invalid`, password, email_confirm: true,
        user_metadata: { username: tierUsername },
      });
      if (error || !tierUser.user) throw new Error(`Hosted EX${tier} smoke identity creation failed.`);
      ids.push(tierUser.user.id);
      tierClient = createClient(url, clientKey, { auth: { persistSession: false } });
      const { error: loginError } = await tierClient.auth.signInWithPassword({
        email: `${tierUsername}@example.invalid`, password,
      });
      if (loginError) throw new Error(`Hosted EX${tier} smoke identity authentication failed.`);
      let tierGame = freshGame(tierUsername);
      tierGame.starterId = 'ember';
      tierGame.account.characters = { ember: { level: 105, evolution: 6 } };
      tierGame.account.squad = ['ember'];
      tierGame.account.normalFinalClears = { treasury: true };
      tierGame.account.calamityClears = { treasury: tier - 1 };
      tierGame = resolveOperation(tierGame, {
        kind: 'enter', activity: { kind: 'calamity', activity: 'treasury', tier },
      }, entropy).game;
      tierGame.run.session.state.enemies[0].hp = 1;
      const tierSeed = await admin.rpc('load_game_account', { p_user: tierUser.user.id, p_initial: tierGame });
      assert.equal(tierSeed.error, null);
    }

    let response = await invoke(tierClient, { kind: 'read' }, 0);
    assert.equal(Object.hasOwn(response.account, 'calamiticTokens'), false,
      `EX${tier} legacy fixture reads without a token field or load-time write.`);
    if (tier === 1) {
      await assert.rejects(invoke(tierClient,
        { kind: 'purchaseConduit', id: 'calamitic-world-eater-orrery' }, response.revision),
      error => error.status === 400 && error.message.includes('UNWORTHY'));
    }
    const runId = response.session.runId;
    const attack = { kind: 'act', runId, actorId: 'ember', action: 'light',
      targetId: response.session.state.enemies[0].id };
    response = await invoke(tierClient, attack, response.revision);
    assert.equal(response.session.state.phase, 'cleared');
    const chestId = `calamity:treasury:${tier}`;
    assert.equal(response.account.calamityChests[chestId], 1);
    const open = { kind: 'openCalamityChest', id: chestId, expectedCount: 1 };
    const openId = randomUUID();
    const opening = await invoke(tierClient, open, response.revision, openId);
    assert.equal(opening.calamityOpening.calamiticTokens, expectedTokens[index],
      `EX${tier} chest reports its exact token receipt.`);
    assert.equal(opening.account.calamiticTokens, expectedTokens[index],
      `EX${tier} disposable account receives no prior-tier token balance.`);
    assert.deepEqual(await invoke(tierClient, open, response.revision, openId), opening,
      `EX${tier} chest retry returns the saved receipt without another grant.`);
    response = await invoke(tierClient, { kind: 'quit', runId }, opening.revision);
  }

  const purchaseUsername = `smoke_${randomUUID().slice(0, 8)}`;
  const password = randomUUID() + randomUUID();
  const { data: created, error } = await admin.auth.admin.createUser({
    email: `${purchaseUsername}@example.invalid`, password, email_confirm: true,
    user_metadata: { username: purchaseUsername },
  });
  if (error || !created.user) throw new Error('Hosted Calamitic purchase identity creation failed.');
  ids.push(created.user.id);
  const purchaser = createClient(url, clientKey, { auth: { persistSession: false } });
  const { error: loginError } = await purchaser.auth.signInWithPassword({
    email: `${purchaseUsername}@example.invalid`, password,
  });
  if (loginError) throw new Error('Hosted Calamitic purchase identity authentication failed.');
  const purchaseGame = freshGame(purchaseUsername);
  purchaseGame.starterId = 'ember';
  purchaseGame.account.characters = { ember: { level: 0, evolution: 1 } };
  purchaseGame.account.squad = ['ember'];
  purchaseGame.account.calamiticTokens = 100;
  purchaseGame.account.calamityClears = { infernic: 1 };
  const lockedSeed = await admin.rpc('load_game_account', {
    p_user: created.user.id, p_initial: purchaseGame,
  });
  assert.equal(lockedSeed.error, null);
  const buyer = await invoke(purchaser, { kind: 'read' }, 0);
  const purchase = { kind: 'purchaseConduit', id: 'calamitic-world-eater-orrery' };
  const purchaseId = randomUUID();
  const purchased = await invoke(purchaser, purchase, buyer.revision, purchaseId);
  assert.equal(purchased.account.calamiticTokens, 0, 'The server deducts exactly 100 tokens.');
  assert.equal(purchased.account.conduits[purchase.id], 1);
  assert.deepEqual(await invoke(purchaser, purchase, buyer.revision, purchaseId), purchased,
    'Purchase retry returns the same committed receipt.');
  await assert.rejects(invoke(purchaser, purchase, purchased.revision),
    error => error.status === 400 && error.message.includes('already owned'));
  console.log('Hosted Calamitic economy smoke passed: legacy token balance, exact EX1/EX2/EX3 receipts (1/3/8), opening idempotency, locked-store rejection, recorded-clear unlock, exact 100-token purchase, purchase idempotency, and duplicate rejection.');
}

async function smokeGuaranteedComponents(client, userId, username) {
  const entropy = { seed: () => 1729, uuid: () => randomUUID(), random: () => .5 };
  let game = freshGame(username);
  game.starterId = 'ember';
  game.account.characters = { ember: { level: 105, evolution: 6 } };
  game.account.storyCompleted = 20;
  game.account.squad = ['ember'];
  game.account.infusionStages = { machines: 35 };
  game = resolveOperation(game, { kind: 'enter', activity: { kind: 'infusion', mode: 'machines', stage: 35 } }, entropy).game;
  game.run.session.state.enemies.forEach(enemy => { enemy.hp = 1; });
  // Only the disposable identity receives a near-defeated final-boss fixture.
  assert.ok(ids.includes(userId));
  const seeded = await admin.rpc('load_game_account', { p_user: userId, p_initial: game });
  assert.equal(seeded.error, null);
  async function invoke(operation, revision, requestId = randomUUID()) {
    const result = await client.functions.invoke('game-operation', {
      body: { operation, expectedRevision: revision, requestId },
    });
    if (result.error) throw new Error(`Hosted component ${operation.kind} failed (${result.error.context?.status ?? 'transport'}).`);
    return result.data;
  }
  let response = await invoke({ kind: 'read' }, 0);
  let total = 0;
  for (const stage of [35, 1]) {
    if (stage === 1) response = await invoke({ kind: 'enter', activity: { kind: 'infusion', mode: 'machines', stage } }, response.revision);
    const original = response;
    let kills = 0;
    for (let step = 0; kills === 0 && response.session.state.phase === 'player' && step < 80; step++) {
      const state = response.session.state;
      const actor = state.allies[0];
      const action = actor.shatter >= 25 && (actor.readyRound.skill1 ?? 0) <= state.round ? 'skill1' : 'light';
      const operation = { kind: 'act', runId: response.session.runId,
        actorId: 'ember', action, targetId: state.enemies.find(enemy => enemy.hp > 0).id };
      const revision = response.revision;
      const requestId = randomUUID();
      response = await invoke(operation, revision, requestId);
      const rewards = response.result.events.filter(event => event.kind === 'reward');
      for (const reward of rewards) {
        assert.equal(reward.mechanicalComponents, Math.round(3 + 122 * (stage - 1) / 34) * (stage === 35 ? 5 : 1));
        total += reward.mechanicalComponents;
        kills++;
      }
      if (rewards.length) assert.deepEqual(await invoke(operation, revision, requestId), response);
    }
    assert.ok(kills > 0, `Hosted stage ${stage} fixture must defeat a machine.`);
    assert.equal(response.account.mechanicalComponents, total);
    assert.equal(original.account.mechanicalComponents ?? 0, total - kills * Math.round(3 + 122 * (stage - 1) / 34) * (stage === 35 ? 5 : 1));
    response = await invoke({ kind: 'quit', runId: response.session.runId }, response.revision);
  }
  console.log('Hosted component smoke passed: actual stage1 kills and near-defeated stage35 boss guarantee 3/625 components, atomic balances and idempotent reward retry. No owner accounts modified.');
}

async function smokeMachinesLayout(firstClient, firstId, firstUsername) {
  const entropy = { seed: () => 1729, random: () => .5, uuid: () => randomUUID() };
  const focus = { Rare: 'duplex-heart', Legendary: 'worldbreaker-drive', Omnic: 'infernic-phoenix-reactor' };
  const cases = [{ legacy: 1 }, { legacy: 35 }, { legacy: 56 }, { legacy: 75 },
    { stage: 1 }, { stage: 25 }, { stage: 26 }, { stage: 27 }, { stage: 35 }];
  for (const [index, test] of cases.entries()) {
    let client = firstClient, userId = firstId, username = firstUsername;
    if (index) {
      username = `mach_${randomUUID().replaceAll('-', '').slice(0, 10)}`;
      const password = randomUUID() + randomUUID(), email = `${username}@example.invalid`;
      const made = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { username } });
      if (made.error || !made.data.user) throw new Error('Machines layout smoke identity creation failed.');
      userId = made.data.user.id; ids.push(userId);
      client = createClient(url, clientKey, { auth: { persistSession: false } });
      if ((await client.auth.signInWithPassword({ email, password })).error) throw new Error('Machines layout smoke authentication failed.');
    }
    let game = freshGame(username);
    game.starterId = 'ember';
    game.account.characters = { ember: { level: 105, evolution: 6 } };
    game.account.squad = ['ember']; game.account.storyCompleted = 120;
    game.account.infusionStages = { machines: 35 }; game.account.machineLootFocus = focus;
    if (test.legacy) {
      game.account.version = 8;
      game.account.infusionStages.machines = test.legacy;
      game.account.mechanicalComponents = 99;
      if (test.legacy === 75) game.account.receipts = ['12345678-1234-4abc-8def-123456789abc:infusion-machines-75-0'];
    } else {
      game = resolveOperation(game, { kind: 'enter', activity: { kind: 'infusion', mode: 'machines', stage: test.stage } }, entropy).game;
      game.run.session.state.enemies.forEach(enemy => { enemy.hp = 1; enemy.stats.defense = 0; });
      game.run.session.state.conduitSeed = 0;
      game.run.session.state.masterChestSeed = 0;
    }
    assert.ok(ids.includes(userId));
    assert.equal((await admin.rpc('load_game_account', { p_user: userId, p_initial: game })).error, null);
    async function invoke(operation, revision, requestId = randomUUID()) {
      const response = await client.functions.invoke('game-operation', { body: { operation, expectedRevision: revision, requestId } });
      if (response.error) throw new Error(`Hosted Machines layout ${operation.kind} failed (${response.error.context?.status ?? 'transport'}).`);
      return response.data;
    }
    const read = await invoke({ kind: 'read' }, 0);
    assert.equal(read.account.version, 9);
    if (test.legacy) {
      const stage = Math.max(1, Math.floor(test.legacy * 35 / 75));
      assert.equal(read.account.infusionStages.machines, stage);
      assert.deepEqual(read.account.machineLootFocus, focus);
      assert.equal(read.account.mechanicalComponents, 99);
      if (test.legacy === 75) assert.equal(read.account.normalFinalClears.machines, true);
      const operation = { kind: 'setMachineLootFocus', rarity: 'Rare', id: focus.Rare };
      const id = randomUUID(), saved = await invoke(operation, read.revision, id);
      assert.equal(saved.account.infusionStages.machines, stage);
      assert.deepEqual(await invoke(operation, read.revision, id), saved);
      assert.equal((await invoke({ kind: 'read' }, saved.revision)).account.infusionStages.machines, stage);
    } else {
      const state = game.run.session.state;
      const operation = { kind: 'act', runId: read.session.runId, actorId: 'ember', action: 'light', targetId: state.enemies[0].id };
      const expected = resolveOperation(game, operation, entropy).response;
      const id = randomUUID(), actual = await invoke(operation, read.revision, id);
      assert.deepEqual(actual.result, JSON.parse(JSON.stringify(expected.result)));
      assert.deepEqual(actual.account, expected.account);
      const reward = actual.result.events.find(event => event.kind === 'reward');
      assert.equal(reward.conduits[focus.Rare], 1); assert.equal(reward.conduits[focus.Legendary], 1);
      assert.equal(reward.conduits[focus.Omnic], test.stage >= 26 ? 1 : undefined);
      assert.equal(reward.mechanicalComponents, Math.round(3 + 122 * (test.stage - 1) / 34) * (test.stage === 35 ? 5 : 1));
      assert.equal(reward.masterChests, test.stage === 35 ? 1 : undefined);
      assert.equal(state.enemies[0].level, Math.round(10 + (test.stage - 1) * 110 / 34));
      assert.deepEqual(await invoke(operation, read.revision, id), actual);
    }
  }
  console.log('Hosted Machines layout passed: v8 stages1/35/56/75 migrate once to1/16/26/35; holdings/focus/final-clear access preserved. Stages1/25/26/27/35 retain exact reward/level endpoints, Omnic26 onward and final-only Master chest. Local/hosted parity and retries passed; disposable identities only.');
}

async function smokeFocusLoot(client, userId, username) {
  const entropy = { seed: () => 1729, random: () => .5, uuid: () => randomUUID() };
  const focus = { Rare: 'duplex-heart', Legendary: 'worldbreaker-drive', Omnic: 'infernic-phoenix-reactor' };
  let game = freshGame(username);
  game.starterId = 'ember';
  game.account.characters = { ember: { level: 105, evolution: 6 } };
  game.account.squad = ['ember'];
  game.account.storyCompleted = 120;
  game.account.infusionStages = { machines: 35 };
  game = resolveOperation(game, { kind: 'enter', activity: { kind: 'infusion', mode: 'machines', stage: 30 } }, entropy).game;
  const state = game.run.session.state;
  state.enemies.forEach(enemy => { enemy.hp = 1; enemy.stats.defense = 0; });
  state.conduitSeed = 0;
  assert.ok(ids.includes(userId), 'Only disposable identities may be seeded.');
  const seeded = await admin.rpc('load_game_account', { p_user: userId, p_initial: game });
  assert.equal(seeded.error, null);
  async function invoke(operation, revision, requestId = randomUUID()) {
    const response = await client.functions.invoke('game-operation', { body: { operation, expectedRevision: revision, requestId } });
    if (response.error) throw new Error(`Hosted Focus Loot ${operation.kind} failed (${response.error.context?.status ?? 'transport'}).`);
    return response.data;
  }
  let current = await invoke({ kind: 'read' }, 0);
  for (const [rarity, id] of Object.entries(focus)) {
    const operation = { kind: 'setMachineLootFocus', rarity, id };
    const requestId = randomUUID(), revision = current.revision;
    current = await invoke(operation, revision, requestId);
    assert.equal(current.account.machineLootFocus[rarity], id);
    assert.deepEqual(await invoke(operation, revision, requestId), current);
    game = resolveOperation(game, operation, entropy).game;
  }
  current = await invoke({ kind: 'setMachineLootFocus', rarity: 'Omnic', id: null }, current.revision);
  assert.equal(current.account.machineLootFocus.Omnic, undefined);
  current = await invoke({ kind: 'setMachineLootFocus', rarity: 'Omnic', id: focus.Omnic }, current.revision);
  const operation = { kind: 'act', runId: current.session.runId, actorId: 'ember', action: 'light', targetId: state.enemies[0].id };
  const expected = resolveOperation(game, operation, entropy).response;
  const requestId = randomUUID(), revision = current.revision;
  const actual = await invoke(operation, revision, requestId);
  assert.deepEqual(actual.result, expected.result);
  assert.deepEqual(actual.account, expected.account);
  assert.deepEqual(actual.result.events.find(event => event.kind === 'reward').conduits,
    Object.fromEntries(Object.values(focus).map(id => [id, 1])));
  assert.deepEqual(actual.account.machineLootFocus, {});
  assert.deepEqual(await invoke(operation, revision, requestId), actual);
  const persisted = await invoke({ kind: 'read' }, actual.revision);
  assert.deepEqual(persisted.account, actual.account);
  const denied = await client.functions.invoke('game-operation', {
    body: { operation: { kind: 'setMachineLootFocus', rarity: 'Rare', id: focus.Rare },
      expectedRevision: persisted.revision, requestId: randomUUID() },
  });
  assert.ok(denied.error, 'Owned names cannot be focused.');
  assert.deepEqual((await invoke({ kind: 'read' }, persisted.revision)).account, persisted.account);
  console.log('Hosted Focus Loot passed: saved three-tier selection, clear/reselect, all three focused drops, local/authority parity, persisted clearing, idempotent retries and owned-name rejection. Disposable identity only.');
}

async function smokeDotScaling(firstClient, firstId, firstUsername) {
  const entropy = { seed: () => 1729, uuid: () => randomUUID(), random: () => .5 };
  for (const [index, level] of [0, 30, 60, 105].entries()) {
    let client = firstClient, userId = firstId, username = firstUsername;
    if (index) {
      username = `dot_${randomUUID().replaceAll('-', '').slice(0, 10)}`;
      const password = randomUUID() + randomUUID(), email = `${username}@example.invalid`;
      const made = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { username } });
      if (made.error || !made.data.user) throw new Error('DoT smoke identity creation failed.');
      userId = made.data.user.id; ids.push(userId);
      client = createClient(url, clientKey, { auth: { persistSession: false } });
      if ((await client.auth.signInWithPassword({ email, password })).error) throw new Error('DoT smoke authentication failed.');
    }
    let game = freshGame(username);
    game.starterId = 'ember';
    game.account.characters = { ember: { level, evolution: 6 }, tide: { level: 0, evolution: 1 } };
    game.account.squad = ['ember', 'tide'];
    game = resolveOperation(game, { kind: 'enter', activity: { kind: 'training' } }, entropy).game;
    for (const ally of game.run.session.state.allies) {
      ally.stats.health = ally.hp = 10000; ally.stats.damage = 100; ally.stats.crit = 0; ally.shatter = 100;
    }
    for (const enemy of game.run.session.state.enemies) {
      enemy.stats.health = enemy.hp = 100000; enemy.stats.defense = 0; enemy.stats.damage = 1; enemy.stats.crit = 0;
    }
    assert.ok(ids.includes(userId));
    const seeded = await admin.rpc('load_game_account', { p_user: userId, p_initial: game });
    assert.equal(seeded.error, null);
    async function invoke(operation, revision, requestId = randomUUID()) {
      const response = await client.functions.invoke('game-operation', { body: { operation, expectedRevision: revision, requestId } });
      if (response.error) throw new Error(`Hosted DoT ${operation.kind} failed (${response.error.context?.status ?? 'transport'}).`);
      return response.data;
    }
    let read = await invoke({ kind: 'read' }, 0);
    for (const step of ['apply', 'tick', 'detonate']) {
      const operation = step === 'tick' ? { kind: 'endTurn', runId: game.run.session.runId }
        : { kind: 'act', runId: game.run.session.runId, actorId: 'ember', action: step === 'apply' ? 'skill1' : 'skill2',
          targetId: game.run.session.state.enemies[0].id };
      const expected = resolveOperation(game, operation, entropy), requestId = randomUUID();
      const actual = await invoke(operation, read.revision, requestId);
      assert.deepEqual(actual.result, JSON.parse(JSON.stringify(expected.response.result)), `DoT level${level} ${step}`);
      const damage = Math.round(25 * (1 + level / 30));
      if (step === 'apply') assert.equal(actual.session.state.enemies[0].burn.damage, damage);
      else assert.equal(actual.result.events.find(event => event.nativeKind === (step === 'tick' ? 'burn' : 'detonation'))?.amount,
        damage * (step === 'tick' ? 1 : 2));
      assert.deepEqual(actual.account, expected.response.account);
      assert.deepEqual(await invoke(operation, read.revision, requestId), actual);
      read = await invoke({ kind: 'read' }, actual.revision);
      assert.deepEqual(read.session.state, actual.session.state);
      game = expected.game;
    }
  }
  console.log('Hosted DoT smoke passed: levels0/30/60/105, exact application/tick/detonation parity, once-only scaling, persisted snapshots and idempotent retries. No owner accounts modified.');
}

async function smokeLastFlare(firstClient, firstId, firstUsername) {
  const roster = ['ember', 'tide', 'sprout', 'atmoso', 'elise', 'bliss', 'bruno', 'disciple',
    'aurora', 'razor', 'rosetta', 'thornia', 'crinso', 'nerithe', 'orvella', 'vaelor'];
  const entropy = { seed: () => 1729, uuid: () => randomUUID(), random: () => .5 };
  for (const [index, actorId] of roster.entries()) {
    let client = firstClient, userId = firstId, username = firstUsername;
    if (index) {
      username = `flare_${randomUUID().replaceAll('-', '').slice(0, 10)}`;
      const password = randomUUID() + randomUUID(), email = `${username}@example.invalid`;
      const made = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { username } });
      if (made.error || !made.data.user) throw new Error('Last Flare smoke identity creation failed.');
      userId = made.data.user.id;
      ids.push(userId);
      client = createClient(url, clientKey, { auth: { persistSession: false } });
      if ((await client.auth.signInWithPassword({ email, password })).error) throw new Error('Last Flare smoke authentication failed.');
    }
    let game = freshGame(username);
    game.starterId = 'ember';
    const other = actorId === 'ember' ? 'tide' : 'ember';
    game.account.characters = Object.fromEntries([actorId, other].map(id => [id, { level: 0, evolution: 1 }]));
    game.account.squad = [actorId, other];
    game = resolveOperation(game, { kind: 'enter', activity: { kind: 'training' } }, entropy).game;
    const state = game.run.session.state;
    for (const ally of state.allies) {
      ally.stats.health = 1000; ally.hp = 100; ally.stats.damage = 100;
      ally.stats.crit = 0; ally.shatter = 100;
    }
    for (const enemy of state.enemies) {
      enemy.stats.health = enemy.hp = 100000; enemy.stats.defense = 100;
    }
    const owner = state.allies[0], target = state.enemies[0];
    if (actorId === 'elise') owner.native = { blades: [target.id, target.id] };
    if (actorId === 'atmoso') owner.native = { cyclone: { gusts: 2, phases: 2, contributors: {}, skillPower: 1 } };
    if (actorId === 'razor') owner.native = { wounds: 200 };
    if (actorId === 'orvella') owner.native = { foundation: { durability: 200, maximum: 300, throughPhase: 3 } };
    if (actorId === 'crinso') owner.native = { combo: 3, edge: 'crimson' };
    if (actorId === 'nerithe') owner.native = { survey: { target: target.id, points: 2 } };
    if (actorId === 'rosetta') owner.native = { quarry: { target: target.id, round: 1, contributors: [other] } };
    assert.ok(ids.includes(userId));
    const seeded = await admin.rpc('load_game_account', { p_user: userId, p_initial: game });
    assert.equal(seeded.error, null);
    async function invoke(operation, revision, requestId = randomUUID()) {
      const response = await client.functions.invoke('game-operation', { body: { operation, expectedRevision: revision, requestId } });
      if (response.error) throw new Error(`Hosted Last Flare ${operation.kind} failed (${response.error.context?.status ?? 'transport'}).`);
      return response.data;
    }
    const operation = { kind: 'act', runId: game.run.session.runId, actorId, action: 'ultimate', targetId: target.id };
    const expected = resolveOperation(game, operation, entropy).response;
    const requestId = randomUUID();
    const read = await invoke({ kind: 'read' }, 0);
    const actual = await invoke(operation, read.revision, requestId);
    assert.deepEqual(actual.result, expected.result, actorId);
    assert.equal(actual.session.state.allies[0].shatter, 0);
    assert.equal(actual.session.state.allies[0].recoverThrough, 2);
    assert.deepEqual(actual.account, expected.account);
    assert.deepEqual(await invoke(operation, read.revision, requestId), actual);
    const persisted = await invoke({ kind: 'read' }, actual.revision);
    assert.deepEqual(persisted.session.state, actual.session.state);
  }
  console.log('Hosted Last Flare smoke passed: all16 characters, exact client/server damage/support and stored follow-ups, unchanged costs/recovery, persisted snapshots and idempotent retries. No owner accounts modified.');
}

async function smokeFinalLoot(firstClient, firstId, firstUsername, includeEarly = false, captureRate = false) {
  const entropy = { seed: () => 1729, uuid: () => randomUUID(), random: () => .5 };
  const activities = captureRate ? [
    ...['heavens', 'abyss', 'treasury', 'sanctuary', 'roses']
      .flatMap(mode => [1, 5].map(stage => ({ kind: 'infusion', mode, stage }))),
    { kind: 'infusion', mode: 'roses', stage: 35 },
  ] : [
    ...(includeEarly ? [
      ...[1, 17].map(stage => ({ kind: 'story', stage })),
      ...['infernic', 'oceanic', 'atmospheric', 'botanic', 'tranquilitic', 'chaotic']
        .map(element => ({ kind: 'dungeon', element, stage: 1 })),
      ...['heavens', 'abyss', 'treasury', 'sanctuary', 'roses', 'machines'].map(mode => ({ kind: 'infusion', mode, stage: 1 })),
      { kind: 'infusion', mode: 'machines', stage: 35 },
    ] : []),
    ...[20, 40, 60, 80, 100, 120].map(stage => ({ kind: 'story', stage })),
    ...['infernic', 'oceanic', 'atmospheric', 'botanic', 'tranquilitic', 'chaotic']
      .map(element => ({ kind: 'dungeon', element, stage: 35 })),
    ...['heavens', 'abyss', 'treasury', 'sanctuary', 'roses', 'machines']
      .map(mode => ({ kind: 'infusion', mode, stage: mode === 'machines' ? 35 : ['heavens', 'abyss', 'treasury', 'sanctuary'].includes(mode) ? 25 : 35 })),
    ...['nerithe', 'orvella', 'vaelor'].map(character => ({ kind: 'war', character, stage: 10 })),
  ];
  for (const [index, activity] of activities.entries()) {
    let client = firstClient;
    let userId = firstId;
    let username = firstUsername;
    if (index > 0) {
      username = `loot_${randomUUID().replaceAll('-', '').slice(0, 10)}`;
      const password = randomUUID() + randomUUID();
      const email = `${username}@example.invalid`;
      const made = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { username } });
      if (made.error || !made.data.user) throw new Error('Final-loot smoke identity creation failed.');
      userId = made.data.user.id;
      ids.push(userId);
      client = createClient(url, clientKey, { auth: { persistSession: false } });
      if ((await client.auth.signInWithPassword({ email, password })).error) throw new Error('Final-loot smoke authentication failed.');
    }
    let game = freshGame(username);
    game.starterId = 'ember';
    game.account.characters = { ember: { level: 105, evolution: 6 } };
    game.account.squad = ['ember'];
    game.account.storyCompleted = activity.kind === 'story' ? activity.stage - 1 : 120;
    game.account.dungeonStages = Object.fromEntries(['infernic', 'oceanic', 'atmospheric', 'botanic', 'tranquilitic', 'chaotic'].map(element => [element, 35]));
    game.account.infusionStages = { heavens: 25, abyss: 25, treasury: 25, sanctuary: 25, roses: 35, machines: 35 };
    game.account.warStages = { nerithe: 10, orvella: 10, vaelor: 10 };
    game = resolveOperation(game, { kind: 'enter', activity }, entropy).game;
    const state = game.run.session.state;
    state.allies[0].shatter = 100;
    state.enemies.forEach(enemy => { enemy.hp = 1; enemy.stats.defense = 0; });
    state.rewardSeed = 0; state.componentSeed = 0; state.conduitSeed = 0;
    state.masterChestSeed = 0; state.lycalisSeed = activity.kind === 'war' ? 1 : 15500;
    state.captureSeed = captureRate ? 5000 : 0x80000000; state.recruitmentSeed = 0x80000000;
    assert.ok(ids.includes(userId), 'Fixtures must belong only to disposable identities.');
    const seeded = await admin.rpc('load_game_account', { p_user: userId, p_initial: game });
    assert.equal(seeded.error, null);
    async function invoke(operation, revision, requestId = randomUUID()) {
      const result = await client.functions.invoke('game-operation', { body: { operation, expectedRevision: revision, requestId } });
      if (result.error) throw new Error(`Hosted final-loot ${operation.kind} failed (${result.error.context?.status ?? 'transport'}).`);
      return result.data;
    }
    const read = await invoke({ kind: 'read' }, 0);
    const operation = { kind: 'act', runId: read.session.runId, actorId: 'ember', action: 'skill2', targetId: state.enemies[0].id };
    const expected = resolveOperation(game, operation, entropy).response;
    const requestId = randomUUID();
    const actual = await invoke(operation, read.revision, requestId);
    assert.equal(actual.session.state.phase, 'cleared');
    const rewards = actual.result.events.filter(event => event.kind === 'reward');
    assert.equal(rewards.length, state.enemies.length);
    assert.deepEqual(rewards, expected.result.events.filter(event => event.kind === 'reward'));
    if (captureRate) {
      const eligible = activity.mode !== 'roses' || state.enemies[0].level <= 120;
      assert.equal(!!rewards[0].capture, eligible, 'First capture roll is between20% and50%; Roses above120 remains excluded.');
      assert.equal(actual.account.capturedCharacters?.length ?? 0, rewards.filter(reward => reward.capture).length);
      for (const copy of actual.account.capturedCharacters ?? []) assert.ok(copy.level <= 60);
    }
    const final = activity.kind === 'story' ? activity.stage % 18 === 0 : activity.kind === 'war' ? activity.stage === 10
      : activity.kind === 'dungeon' ? activity.stage === 35 : activity.stage === (activity.mode === 'machines' ? 35 : ['treasury', 'sanctuary'].includes(activity.mode) ? 25 : 35);
    if (final) {
      assert.equal((rewards[0].amount - (rewards[0].storyBonus?.fractalis ?? 0)) % 5, 0);
      for (const quantity of Object.values(rewards[0].materials ?? {})) assert.equal(quantity % 5, 0);
    }
    if (activity.kind === 'story') {
      const element = state.enemies[0].element;
      for (const reward of rewards) assert.ok(reward.materials[`${element}-uncommon`] > 0, 'Listed Story Uncommon material must be reachable below Lv.23 too.');
    }
    if (activity.mode === 'machines' && final) {
      assert.equal(rewards[0].mechanicalComponents, 625);
      assert.equal(rewards[0].masterChests, 1);
      assert.deepEqual(Object.values(rewards[0].conduits), [1, 1, 1]);
    }
    if (activity.mode === 'treasury' && final) assert.equal(rewards[0].amount, 24300);
    if (activity.kind === 'war') assert.equal(rewards[0].amount, 25000);
    if ((activity.mode === 'sanctuary' || activity.kind === 'war') && final) assert.equal(rewards[0].lycalis, 25);
    for (const key of ['fractalis', 'lycalis', 'materials', 'mechanicalComponents', 'conduits', 'masterChests', 'storyCompleted', 'receipts']) {
      assert.deepEqual(actual.account[key], expected.account[key], `${activity.kind} ${key}`);
    }
    assert.deepEqual(await invoke(operation, read.revision, requestId), actual);
    const persisted = await invoke({ kind: 'read' }, actual.revision);
    assert.deepEqual(persisted.account, actual.account);
    if (includeEarly) {
      const replayId = randomUUID();
      const replay = { kind: 'retry', runId: actual.session.runId };
      const replayed = await invoke(replay, persisted.revision, replayId);
      assert.deepEqual(await invoke(replay, persisted.revision, replayId), replayed);
      assert.notEqual(replayed.session.runId, actual.session.runId);
      assert.equal(replayed.session.state.phase, 'player');
      assert.equal(replayed.session.state.wave, activity.stage);
      assert.equal(replayed.session.state.allies[0].shatter, 0);
      assert.equal(replayed.session.state.allies[0].hp, replayed.session.state.allies[0].stats.health);
      assert.deepEqual(replayed.session.stageEvents, []);
      const { creatures: replayDiscoveries, ...replayHoldings } = replayed.account;
      const { creatures: priorDiscoveries, ...priorHoldings } = actual.account;
      assert.deepEqual(replayHoldings, priorHoldings);
      for (const [id, discovery] of Object.entries(priorDiscoveries)) assert.deepEqual(replayDiscoveries[id], discovery);
      for (const [id, discovery] of Object.entries(replayDiscoveries)) {
        if (!priorDiscoveries[id]) assert.deepEqual(discovery, { defeated: false });
      }
      await invoke({ kind: 'quit', runId: replayed.session.runId }, replayed.revision);
    } else await invoke({ kind: 'quit', runId: actual.session.runId }, persisted.revision);
  }
  if (captureRate) {
    console.log(`Hosted capture-rate smoke passed: ${activities.length} cases, ordinary/boss captures on a roll between20% and50% in all five eligible modes, no Roses capture above120, owned cap60, exact client/server rewards, persisted accounts and idempotent retries. No owner accounts modified.`);
  } else {
    console.log(`Hosted ${includeEarly ? 'loot-parity/replay' : 'final-loot'} smoke passed: ${activities.length} activity/stage cases, exact client/server rewards, boosted final quantities, unchanged rare counts, separate first-clear bonuses, atomic persisted accounts and idempotent retries${includeEarly ? ', reachable early Story Uncommon drops and victory replays with fresh HP/Gauge and no extra claim' : ''}. No owner accounts modified.`);
  }
}

async function smokeEnemyBalance(client, userId, username) {
  const entropy = { seed: () => 1729, uuid: () => randomUUID(), random: () => .5 };
  let game = freshGame(username);
  game.starterId = 'ember';
  game.account.characters = { ember: { level: 60, evolution: 3 } };
  game.account.squad = ['ember'];
  game.account.dungeonStages = { infernic: 35 };
  game.account.infusionStages = { heavens: 25 };
  game = resolveOperation(game, { kind: 'enter', activity: { kind: 'training' } }, entropy).game;
  for (let wave = 1; wave < 59; wave++) {
    game.run.session.state.phase = 'cleared';
    game.run.session.state.enemies.forEach(enemy => { enemy.hp = 0; });
    game = resolveOperation(game, { kind: 'continue', runId: game.run.session.runId }, entropy).game;
  }
  game.run.session.state.phase = 'cleared';
  game.run.session.state.enemies.forEach(enemy => { enemy.hp = 0; });
  // Only the disposable smoke identity receives this zero-currency progression fixture.
  assert.ok(ids.includes(userId));
  const seeded = await admin.rpc('load_game_account', { p_user: userId, p_initial: game });
  assert.equal(seeded.error, null);
  assert.equal(seeded.data.revision, 0);
  async function invoke(operation, revision) {
    const result = await client.functions.invoke('game-operation', {
      body: { operation, expectedRevision: revision, requestId: randomUUID() },
    });
    if (result.error) throw new Error(`Hosted balance ${operation.kind} failed (${result.error.context?.status ?? 'transport'}).`);
    return result.data;
  }
  const ordinary = { health: 5573, damage: 774, defense: 146, crit: .12,
    critMultiplier: 1.5, shatterCapacity: 100, elementalDamage: 0,
    skillPower: 1, skillDuration: 0, skillEfficiency: 0, gaugeGain: 1 };
  const boss = { ...ordinary, health: 13932, damage: 967, defense: 195 };
  let response = await invoke({ kind: 'continue', runId: game.run.session.runId }, 0);
  for (const [activity, level, stats] of [
    [null, 60, ordinary],
    [{ kind: 'infusion', mode: 'heavens', stage: 9 }, 64, { ...ordinary, health: 6339, damage: 874, defense: 163 }],
    [{ kind: 'dungeon', element: 'infernic', stage: 10 }, 60, boss],
  ]) {
    if (activity) response = await invoke({ kind: 'enter', activity }, response.revision);
    for (const enemy of response.session.state.enemies) {
      assert.equal(enemy.level, level);
      assert.deepEqual(enemy.stats, stats);
      assert.equal(enemy.enemySkills[0].multiplier, 1.2 + (level - 1) * .004);
      assert.equal(enemy.enemySkills[0].every, enemy.boss ? 2 : 3);
    }
    assert.equal(response.account.fractalis, 0);
    assert.equal(response.account.lycalis, 0);
    const snapshot = await invoke({ kind: 'read' }, response.revision);
    assert.deepEqual(snapshot.session, response.session);
    response = await invoke({ kind: 'quit', runId: response.session.runId }, response.revision);
  }
  console.log('Hosted balance smoke passed: unchanged Lv60 Training/material boss and Lv64 Heaven stats, shared level-based skill strength, frozen read and quit; zero currencies granted.');
}

async function smokeEvolutionFodder(client, userId, username) {
  const game = freshGame(username);
  game.starterId = 'ember';
  game.account.characters = { ember: { level: 90, evolution: 5 } };
  game.account.firstFracture = true;
  game.account.squad = ['ember'];
  game.account.fractalis = 10000;
  game.account.materials = { 'infernic-epic': 25, 'infernic-legendary': 10, 'heavens-evolution': 10 };
  game.account.capturedCharacters = [4, 4, 4, 3].map(form => ({
    instanceId: `capture:${randomUUID()}`, creatureId: `infusion:heavens:${form - 1}`, locked: false,
  }));
  assert.ok(ids.includes(userId), 'Evolution fixtures must belong only to a disposable identity.');
  const seeded = await admin.rpc('load_game_account', { p_user: userId, p_initial: game });
  assert.equal(seeded.error, null);
  async function invoke(operation, revision, requestId = randomUUID()) {
    const result = await client.functions.invoke('game-operation', {
      body: { operation, expectedRevision: revision, requestId },
    });
    if (result.error) throw new Error(`Hosted evolution ${operation.kind} failed (${result.error.context?.status ?? 'transport'}).`);
    return result.data;
  }
  const initial = await invoke({ kind: 'read' }, 0);
  const operation = { kind: 'upgradeCharacter', id: 'ember', upgradeKind: 'evolve',
    expected: { level: 90, evolution: 5 }, fodderIds: game.account.capturedCharacters.map(copy => copy.instanceId) };
  const requestId = randomUUID();
  const evolved = await invoke(operation, initial.revision, requestId);
  assert.equal(evolved.account.characters.ember.level, 90);
  assert.equal(evolved.account.characters.ember.evolution, 6);
  assert.equal(evolved.account.fractalis, 5200);
  assert.equal(evolved.account.lycalis, initial.account.lycalis);
  assert.deepEqual(evolved.account.capturedCharacters, []);
  for (const material of Object.keys(game.account.materials)) assert.equal(evolved.account.materials[material] ?? 0, 0);
  assert.equal(evolved.revision, initial.revision + 1);
  assert.deepEqual(await invoke(operation, initial.revision, requestId), evolved);
  assert.deepEqual((await invoke({ kind: 'read' }, evolved.revision)).account, evolved.account);
  console.log('Hosted evolution smoke passed: Infernis Evo.5->6 with 4+4+4+3 Evolution Value, exact costs and four-copy consumption, one revision, idempotent retry and persisted account. No owner accounts modified.');
}

async function smokeRoseProgression(client, userId, username) {
  const game = freshGame(username);
  game.starterId = 'ember';
  game.account.characters = { ember: { level: 0, evolution: 1 },
    ...Object.fromEntries(['rosetta', 'thornia', 'crinso'].map(id => [id, { level: 75, evolution: 4 }])) };
  game.account.squad = ['rosetta', 'thornia', 'crinso'];
  game.account.firstFracture = true;
  game.account.fractalis = 10000;
  game.account.materials = { 'rosethorn-common': 9, 'rosethorn-uncommon': 3,
    'rosethorn-rare': 78, 'rosethorn-epic': 33, 'rosethorn-legendary': 3 };
  game.account.capturedCharacters = Array.from({ length: 6 }, () => ({
    instanceId: `capture:${randomUUID()}`, creatureId: 'infusion:roses:3', locked: false,
  }));
  assert.ok(ids.includes(userId), 'Rose fixtures must belong only to a disposable identity.');
  const seeded = await admin.rpc('load_game_account', { p_user: userId, p_initial: game });
  assert.equal(seeded.error, null);
  async function invoke(operation, revision, requestId = randomUUID()) {
    const result = await client.functions.invoke('game-operation', {
      body: { operation, expectedRevision: revision, requestId },
    });
    if (result.error) throw new Error(`Hosted Rose ${operation.kind} failed (${result.error.context?.status ?? 'transport'}).`);
    return result.data;
  }
  let current = await invoke({ kind: 'read' }, 0);
  for (const [index, id] of ['rosetta', 'thornia', 'crinso'].entries()) {
    for (const operation of [
      { kind: 'upgradeCharacter', id, upgradeKind: 'evolve', expected: { level: 75, evolution: 4 },
        fodderIds: game.account.capturedCharacters.slice(index * 2, index * 2 + 2).map(copy => copy.instanceId) },
      { kind: 'upgradeCharacter', id, upgradeKind: 'level', expected: { level: 75, evolution: 5 } },
    ]) {
      const revision = current.revision;
      const requestId = randomUUID();
      current = await invoke(operation, revision, requestId);
      assert.deepEqual(await invoke(operation, revision, requestId), current);
    }
    assert.deepEqual(current.account.characters[id], { level: 76, evolution: 5 });
    assert.equal(current.account.materials['rosethorn-omnic'] ?? 0, 0);
  }
  assert.equal(current.account.fractalis, 2314);
  assert.deepEqual(current.account.capturedCharacters, []);
  for (const material of Object.keys(game.account.materials)) assert.equal(current.account.materials[material] ?? 0, 0);
  assert.deepEqual((await invoke({ kind: 'read' }, current.revision)).account, current.account);
  console.log('Hosted Rose progression passed: all three characters evolve4->5 with base recipes, level75->76 without Souls, exact costs/fodder, idempotent retries and persisted holdings. No owner accounts modified.');
}

async function smokeEquippedMaster(client, userId, username) {
  const game = freshGame(username);
  game.starterId = 'ember';
  game.account.characters = { ember: { level: 0, evolution: 1 }, atmoso: { level: 0, evolution: 1 } };
  game.account.squad = ['atmoso', 'ember'];
  game.account.masterConduits = { 'master-atmoso-1': 1 };
  game.account.masterEquipment = { atmoso: 'master-atmoso-1' };
  const entropy = { seed: () => 1729, uuid: () => randomUUID(), random: () => .5 };
  const entered = resolveOperation(game, { kind: 'enter', activity: { kind: 'training' } }, entropy).game;
  assert.ok(entered.run);
  const state = entered.run.session.state;
  const owner = state.allies[0];
  owner.stats.crit = 0;
  owner.stats.damage = 1000;
  owner.shatter = 0;
  owner.omnicMemory = { 'master-atmoso-1': { usedRound: state.round, bankRound: state.round } };
  state.enemies.forEach(enemy => {
    enemy.hp = enemy.stats.health = 10000;
    enemy.stats.damage = 0;
    enemy.stats.defense = 0;
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
    action: 'light', targetId: initial.session.state.enemies[0].id };
  const requestId = randomUUID();
  const resolved = await invoke(operation, initial.revision, requestId);
  const hits = resolved.result.events.filter(event =>
    event.kind === 'damage' && event.source === 'atmoso' && event.origin === 'native');
  assert.ok(state.enemies.length > 1);
  assert.equal(hits.length, state.enemies.length, 'Master Normal Attack hits every enemy exactly once');
  assert.equal(new Set(hits.map(event => event.target)).size, state.enemies.length);
  assert.ok(hits.every(event => event.amount === 700 && !event.critical), 'Each target takes 70% Normal Attack damage');
  assert.equal(resolved.result.events.filter(event => event.kind === 'attack' && event.source === 'atmoso').length, 1);
  assert.equal(resolved.session.state.allies[0].shatter, 20, 'Normal Attack grants Gauge once, not per target');
  assert.equal(resolved.session.state.allies[0].native?.cyclone, undefined, 'Own Normal Attack does not create a Cyclone');
  assert.equal(resolved.session.state.allies[0].omnicMemory['master-atmoso-1'].usedRound, state.round,
    'Legacy round stamps remain untouched and do not block Master effects');
  assert.equal(resolved.revision, initial.revision + 1);
  assert.deepEqual(await invoke(operation, initial.revision, requestId), resolved, 'Retry never resolves combat twice');
  const checkpoint = await invoke({ kind: 'checkpoint' }, resolved.revision);
  assert.deepEqual(checkpoint.session, resolved.session);
  assert.deepEqual(checkpoint.account, resolved.account);
  assert.equal(checkpoint.revision, resolved.revision);
  assert.equal((await invoke({ kind: 'quit', runId: resolved.session.runId }, resolved.revision)).session, null);
  console.log(`Hosted Master smoke passed: ${hits.length} distinct Normal Attack targets at exactly 70% damage, one Gauge grant, no self-Cyclone, ignored legacy gates, frozen loadout, idempotent retry, checkpoint persistence and quit.`);
}
