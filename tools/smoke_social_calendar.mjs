import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';

// Hosted mutations require an explicit operator opt-in after deploying both migrations.
// Keys, passwords, sessions, response bodies and assertion errors never leave memory.
if (!process.argv.includes('--execute')) {
  console.log('After deployment: node tools\\smoke_social_calendar.mjs --execute');
  process.exit(0);
}

const project = 'ohtfgwomdfteaxubndww';
const ids = [];
let admin;
let phase = 'credentials';
let failed = false;
let cleanupFailed = false;

function reward(day, streak) {
  const monthly = ({ 15: 20, 25: 30, 28: 40, 30: 50, 31: 60 })[day] ?? (day % 5 ? 0 : 10);
  const streakPremium = streak % 7 ? 0 : streak % 28 === 0 ? 30 : streak % 14 === 0 ? 20 : 10;
  return { fractalis: 1000 + 500 * (day - 1), lycalis: monthly + streakPremium, materials: {}, streakPremium };
}
function resetDay(serverTime) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', hourCycle: 'h23',
  }).formatToParts(serverTime).map(part => [part.type, part.value]));
  const date = new Date(`${parts.year}-${parts.month}-${parts.day}T00:00:00Z`);
  if (Number(parts.hour) < 20) date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}
async function rejected(action, code) {
  const response = await action();
  assert.ok(response.error);
  if (code) assert.equal(response.error.code ?? response.error.context?.status, code);
}

try {
  const result = spawnSync(process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['supabase', 'projects', 'api-keys', '--project-ref', project, '--reveal', '--output', 'json'],
    { encoding: 'utf8', shell: process.platform === 'win32' });
  assert.equal(result.status, 0);
  const parsed = JSON.parse(result.stdout);
  const keys = Array.isArray(parsed) ? parsed : parsed.api_keys ?? parsed.keys;
  const service = keys?.find(key => key.name === 'service_role')?.api_key;
  const anon = keys?.find(key => key.name === 'anon')?.api_key;
  assert.ok(service && anon);
  const url = `https://${project}.supabase.co`;
  const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };
  admin = createClient(url, service, options);
  const anonymous = createClient(url, anon, options);
  await rejected(() => anonymous.rpc('social_calendar', { p_command: { kind: 'read' }, p_request: null }));
  await rejected(() => anonymous.rpc('acquisition_markers', { p_keys: null }));
  async function rawGame(peer, operation, revision, requestId = randomUUID()) {
    return peer.client.functions.invoke('game-operation', {
      body: { operation, expectedRevision: revision, requestId },
    });
  }
  async function game(peer, operation = { kind: 'read' }, revision = peer.state?.revision ?? 0) {
    const response = await rawGame(peer, operation, revision);
    assert.equal(response.error, null);
    peer.state = response.data;
    return response.data;
  }
  async function rawSocial(peer, command = { kind: 'read' }, requestId = randomUUID()) {
    return peer.client.rpc('social_calendar', {
      p_command: command, p_request: command.kind === 'read' ? null : requestId,
    });
  }
  async function social(peer, command, requestId) {
    const response = await rawSocial(peer, command, requestId);
    assert.equal(response.error, null);
    return response.data;
  }
  async function markers(peer, keys = null) {
    const response = await peer.client.rpc('acquisition_markers', { p_keys: keys });
    assert.equal(response.error, null);
    return response.data;
  }
  function sameGameplay(actual, expected) {
    assert.equal(actual.revision, expected.revision);
    assert.deepEqual(actual.account, expected.account);
    assert.deepEqual(actual.session, expected.session);
  }
  phase = 'disposable unfunded identities';
  const peers = [];
  for (let index = 0; index < 4; index++) {
    const username = `social_${randomUUID().slice(0, 8)}`;
    const email = `${username}@example.invalid`;
    const password = randomUUID() + randomUUID();
    const created = await admin.auth.admin.createUser({
      email, password, email_confirm: true, user_metadata: { username },
    });
    assert.equal(created.error, null);
    assert.ok(created.data.user);
    ids.push(created.data.user.id);
    const client = createClient(url, anon, options);
    assert.equal((await client.auth.signInWithPassword({ email, password })).error, null);
    const peer = { client, id: created.data.user.id };
    await game(peer, { kind: 'bootstrap', starterId: 'ember' }, 0);
    assert.equal(peer.state.account.fractalis, 0);
    assert.equal(peer.state.account.lycalis, 0);
    assert.deepEqual(peer.state.account.materials, {});
    peers.push(peer);
  }
  const [recipient, ...senders] = peers;
  phase = 'read-only calendar and server reset';
  await game(recipient, { kind: 'enter', activity: { kind: 'story', stage: 1 } });
  const frozen = structuredClone(recipient.state);
  const initial = await social(recipient);
  assert.equal(initial.attendance, 0);
  assert.equal(initial.streak, 0);
  assert.equal(initial.attendedToday, false);
  assert.equal(initial.giftSentToday, false);
  assert.equal(initial.resetDay, resetDay(initial.serverTime));
  assert.equal(initial.month, initial.resetDay.slice(0, 7));
  const [year, month] = initial.month.split('-').map(Number);
  assert.equal(initial.daysInMonth, new Date(Date.UTC(year, month, 0)).getUTCDate());
  assert.deepEqual(initial.nextReward, reward(1, 1));
  assert.ok(initial.seedChoices.includes('infernic-common'));
  assert.ok(!initial.seedChoices.includes('moonwake-common') && !initial.seedChoices.includes('dawnforge-common'));
  await social(recipient);
  sameGameplay(await game(recipient), frozen);
  // The full ladder is independently checked locally, never by forging hosted dates.
  assert.equal(Array.from({ length: 31 }, (_, i) => reward(i + 1, 1).fractalis).reduce((a, b) => a + b), 263500);
  assert.equal(Array.from({ length: 31 }, (_, i) => reward(i + 1, 1).lycalis).reduce((a, b) => a + b), 230);
  assert.equal(Array.from({ length: 31 }, (_, i) => reward(i + 1, i + 1).streakPremium).reduce((a, b) => a + b), 70);

  phase = 'accepted friends and free daily gifts';
  const giftCommands = [
    { kind: 'sendGift', userId: recipient.id, gift: 'seed', materialId: 'infernic-common' },
    { kind: 'sendGift', userId: recipient.id, gift: 'fractalis' },
    { kind: 'sendGift', userId: recipient.id, gift: 'lycalis' },
  ];
  for (const [index, sender] of senders.entries()) {
    await rejected(() => rawSocial(sender, giftCommands[index]), 'P0001');
    await game(sender, { kind: 'friendRequest', friendCode: recipient.state.profile.friendCode });
    await rejected(() => rawSocial(sender, giftCommands[index]), 'P0001');
    await game(recipient, { kind: 'acceptFriendRequest', userId: sender.id });
    await game(sender);
    const before = structuredClone(sender.state);
    const id = randomUUID();
    const sent = await social(sender, giftCommands[index], id);
    assert.equal(sent.giftSentToday, true);
    assert.equal(sent.resetDay, initial.resetDay, 'Run crossed reset: rerun with fresh identities.');
    assert.deepEqual(await social(sender, giftCommands[index], id), sent);
    await rejected(() => rawSocial(sender, { ...giftCommands[index], gift: 'lycalis' }), 'P0001');
    await rejected(() => rawSocial(sender, { kind: 'claimAll' }, id), 'P0001');
    sameGameplay(await game(sender), before);
    assert.equal(sender.state.account.fractalis, 0);
    assert.equal(sender.state.account.lycalis, 0);
  }
  phase = 'mail reading and atomic idempotent claim-all';
  const inbox = await social(recipient);
  const gifts = inbox.mail.filter(mail => !mail.informational);
  assert.equal(gifts.length, 3);
  assert.ok(gifts.every(mail => !mail.read && !mail.claimed));
  const beforeMail = structuredClone(await game(recipient));
  const patch = inbox.mail.find(mail => mail.informational);
  assert.ok(patch);
  const readPatch = await social(recipient, { kind: 'readMail', id: patch.id });
  assert.equal(readPatch.mail.find(mail => mail.id === patch.id).read, true);
  assert.equal((await social(recipient)).mail.find(mail => mail.id === patch.id).read, true);
  await rejected(() => rawSocial(senders[0], { kind: 'claimMail', id: gifts[0].id }), 'P0001');
  const read = await social(recipient, { kind: 'readMail', id: gifts[0].id });
  assert.equal(read.mail.find(mail => mail.id === gifts[0].id).read, true);
  assert.equal(read.mail.find(mail => mail.id === gifts[0].id).claimed, false);
  sameGameplay(await game(recipient), beforeMail);
  const claimId = randomUUID();
  const claimed = await social(recipient, { kind: 'claimAll' }, claimId);
  assert.equal(claimed.claimedCount, 3);
  assert.deepEqual(claimed.reward, { fractalis: 1000, lycalis: 10, materials: { 'infernic-common': 10 } });
  assert.deepEqual(await social(recipient, { kind: 'claimAll' }, claimId), claimed);
  await game(recipient);
  assert.equal(recipient.state.revision, beforeMail.revision + 1);
  assert.deepEqual(recipient.state.session, frozen.session);
  assert.equal(recipient.state.account.fractalis, 1000);
  assert.equal(recipient.state.account.lycalis, 10);
  assert.equal(recipient.state.account.materials['infernic-common'], 10);
  const savedClaim = structuredClone(recipient.state);
  assert.equal((await social(recipient, { kind: 'claimAll' })).claimedCount, 0);
  await social(recipient, { kind: 'claimMail', id: gifts[0].id });
  sameGameplay(await game(recipient), savedClaim);
  const retained = await social(recipient);
  assert.equal(retained.mail.filter(mail => !mail.informational).length, 3);
  assert.ok(retained.mail.filter(mail => !mail.informational).every(mail => mail.claimed));

  phase = 'manual attendance and revision-safe frozen run';
  const attendanceId = randomUUID();
  const attended = await social(recipient, { kind: 'attend' }, attendanceId);
  assert.equal(attended.resetDay, initial.resetDay, 'Run crossed reset: rerun with fresh identities.');
  assert.equal(attended.attendance, 1);
  assert.equal(attended.streak, 1);
  assert.equal(attended.attendedToday, true);
  assert.deepEqual(attended.reward, reward(1, 1));
  assert.deepEqual(await social(recipient, { kind: 'attend' }, attendanceId), attended);
  await rejected(() => rawSocial(recipient, { kind: 'claimAll' }, attendanceId), 'P0001');
  await rejected(() => rawSocial(recipient, { kind: 'attend' }), 'P0001');
  await game(recipient);
  assert.equal(recipient.state.revision, savedClaim.revision + 1);
  assert.equal(recipient.state.account.fractalis, 2000);
  assert.equal(recipient.state.account.lycalis, 10);
  assert.deepEqual(recipient.state.session, frozen.session);
  await rejected(() => rawGame(recipient, { kind: 'quit', runId: frozen.session.runId }, savedClaim.revision), 409);

  phase = 'persistent marker acknowledgement and friend privacy';
  const beforeAck = structuredClone(recipient.state);
  const unread = await markers(recipient);
  assert.equal(unread.markers['character:ember'], false);
  assert.equal(unread.markers['material:infernic-common'], false);
  assert.equal(unread.revision, beforeAck.revision);
  const seen = await markers(recipient, ['material:infernic-common']);
  assert.equal(seen.markers['material:infernic-common'], true);
  assert.equal(seen.markers['character:ember'], false);
  assert.deepEqual(await markers(recipient, ['material:infernic-common']), seen);
  assert.deepEqual(await markers(recipient), seen);
  const afterAck = await game(recipient, { kind: 'checkpoint' }, beforeAck.revision);
  assert.equal(afterAck.revision, beforeAck.revision);
  assert.deepEqual(afterAck.session, beforeAck.session);
  assert.deepEqual(afterAck.account, {
    ...beforeAck.account, acquisitionMarkers: { ...beforeAck.account.acquisitionMarkers, 'material:infernic-common': true },
  });
  const viewed = await senders[0].client.functions.invoke('game-operation', {
    body: { requestId: randomUUID(), friendProfile: { userId: recipient.id } },
  });
  assert.equal(viewed.error, null);
  assert.equal(viewed.data.account.fractalis, 0);
  assert.equal(viewed.data.account.lycalis, 0);
  assert.deepEqual(viewed.data.account.receipts, []);
  const forbidden = new Set(['acquisitionMarkers', 'mail', 'attendance', 'calendar', 'giftSentToday', 'unread', 'email']);
  function checkPrivate(value) {
    if (!value || typeof value !== 'object') return;
    for (const [key, child] of Object.entries(value)) {
      assert.ok(!forbidden.has(key));
      checkPrivate(child);
    }
  }
  checkPrivate(viewed.data);
} catch {
  // Never print underlying errors: SDK/assertion errors may contain secrets or private state.
  failed = true;
} finally {
  for (const id of ids) {
    try {
      if ((await admin.auth.admin.deleteUser(id)).error) cleanupFailed = true;
    } catch {
      cleanupFailed = true;
    }
  }
}
if (failed || cleanupFailed) {
  console.error(`Hosted social smoke failed at ${phase}.${cleanupFailed ? ' Disposable identity cleanup also failed; operator follow-up required.' : ' Disposable identities cleaned up.'}`);
  process.exitCode = 1;
} else {
  console.log('Hosted social smoke passed: accepted-friend eligibility; three legitimate incoming gift choices; free one-send/day; persistent read/claimed mail; atomic idempotent claim-all; manual current-reset attendance; private persistent markers; frozen-run and revision safety. Disposable unfunded identities deleted. Multi-day budgets/overflow remain covered by local SQL, not forged hosted time.');
}
