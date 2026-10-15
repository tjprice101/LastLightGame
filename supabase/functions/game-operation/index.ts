import { createClient } from 'npm:@supabase/supabase-js@2';
import { conduitRulesVersion, freshGame, profileActivityFor, publicGame, resolveOperation, validateChatRequest, validateRequest } from './engine.bundle.js';
const maximumRequestBytes = 4 * 1024 * 1024 + 8192;

const url = Deno.env.get('SUPABASE_URL');
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
if (!url || !serviceKey) throw new Error('Game service configuration missing.');
const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
const origins = new Set(['http://127.0.0.1:5173', 'http://localhost:5173', 'https://tjprice101.github.io']);
function response(status: number, body: unknown, origin: string | null): Response {
  return new Response(JSON.stringify(body), { status, headers: {
    'Content-Type': 'application/json', 'Cache-Control': 'no-store', Vary: 'Origin',
    ...(origin && origins.has(origin) ? { 'Access-Control-Allow-Origin': origin } : {}),
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  } });
}
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(',')}}`;
  return JSON.stringify(value);
}
async function fingerprint(value: unknown): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical(value)));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}
Deno.serve(async request => {
  const origin = request.headers.get('origin');
  if (origin && !origins.has(origin)) return response(403, { error: 'Origin not permitted.' }, origin);
  if (request.method === 'OPTIONS') return response(200, {}, origin);
  if (request.method !== 'POST') return response(405, { error: 'Use POST.' }, origin);
  try {
    const authorization = request.headers.get('authorization');
    if (!authorization?.startsWith('Bearer ')) return response(401, { error: 'Sign in to play online.' }, origin);
    const { data: identity, error: authError } = await admin.auth.getUser(authorization.slice(7));
    if (authError || !identity.user) return response(401, { error: 'Your online session expired.' }, origin);
    const user = identity.user.id;
    if (Number(request.headers.get('content-length')) > maximumRequestBytes) return response(400, { error: 'Request too large.' }, origin);
    const body = await request.text();
    if (new TextEncoder().encode(body).length > maximumRequestBytes) return response(400, { error: 'Request too large.' }, origin);
    let parsed: unknown;
    let parseFailed = false;
    try { parsed = JSON.parse(body); } catch { parseFailed = true; }
    // Chat is a separate service-authoritative path: it never loads, revises or commits the game account.
    if (!parseFailed && parsed && typeof parsed === 'object' && !Array.isArray(parsed) && 'chat' in parsed) {
      if (body.length > 8192) return response(400, { error: 'Request too large.' }, origin);
      const chat = validateChatRequest(parsed);
      const { data: chatAllowed, error: chatLimitError } = await admin.rpc('consume_chat_attempt', {
        p_user: user, p_send: chat.chat.kind === 'send',
      });
      if (chatLimitError) return response(503, { error: 'Chat rate-limit storage unavailable.' }, origin);
      if (!chatAllowed) return response(429, { error: 'Too many chat requests. Wait one minute.' }, origin);
      const { data: view, error: chatError } = await admin.rpc('chat_operation', {
        p_user: user, p_request: chat.requestId, p_fingerprint: await fingerprint(chat.chat), p_operation: chat.chat,
      });
      if (chatError) {
        if (chatError.code === 'P0001') return response(400, { error: chatError.message }, origin);
        if (chatError.code === 'LL409') return response(409, { error: 'Request ID was already used with different input.' }, origin);
        return response(503, { error: 'Chat was not acknowledged. Retry the same request ID.' }, origin);
      }
      return response(200, view, origin);
    }
    const { data: allowed, error: limitError } = await admin.rpc('consume_game_attempt', { p_user: user });
    if (limitError) return response(503, { error: 'Game rate-limit storage unavailable.' }, origin);
    if (!allowed) return response(429, { error: 'Too many game operations. Wait one minute.' }, origin);
    if (parseFailed) return response(400, { error: 'Request must be JSON.' }, origin);
    const input = validateRequest(parsed);
    if (input.operation.kind !== 'importSave' && body.length > 8192) return response(400, { error: 'Request too large.' }, origin);
    const hash = await fingerprint(input);
    const { data: cached, error: cacheError } = await admin.rpc('find_game_request', {
      p_user: user, p_request: input.requestId, p_fingerprint: hash,
    });
    if (cacheError) return response(409, { error: 'Request ID was already used with different input.' }, origin);
    // This includes the saved Calamity opening receipt; never resolve a second roll.
    if (cached) return response(200, cached, origin);
    const { data: profile, error: profileError } = await admin.from('player_profiles')
      .select('username,created_at').eq('user_id', user).single();
    if (profileError || !profile) return response(503, { error: 'Online identity unavailable.' }, origin);
    const { data: stored, error: loadError } = await admin.rpc('load_game_account', {
      p_user: user, p_initial: freshGame(profile.username, profile.created_at),
    });
    if (loadError || !stored) return response(503, { error: 'Online account storage unavailable.' }, origin);
    if (input.operation.kind === 'read' || input.operation.kind === 'checkpoint') {
      let snapshot = stored;
      if (input.operation.kind === 'checkpoint') {
        const { data: checkpoint, error: saveError } = await admin.rpc('checkpoint_game_account', {
          p_user: user, p_revision: input.expectedRevision,
        });
        if (saveError || !checkpoint) return response(503, { error: 'Online autosave was not acknowledged. Please retry.' }, origin);
        if (checkpoint.conflict) return response(409, { error: 'Account changed. Refresh before continuing.', revision: checkpoint.revision }, origin);
        snapshot = checkpoint;
      }
      const { data: profileReference, error: trackingError } = await admin.rpc('track_game_session', {
        p_user: user, p_request: input.requestId,
      });
      if (trackingError || !profileReference) return response(503, { error: 'Online profile tracking unavailable. Retry the same request.' }, origin);
      snapshot.state.profile = { ...snapshot.state.profile, ...profileReference };
      const { data: social, error: socialError } = await admin.rpc('game_social', { p_user: user });
      if (socialError) return response(503, { error: 'Social storage unavailable.' }, origin);
      if (snapshot.state.run && snapshot.state.run.session.state.conduitRulesVersion !== conduitRulesVersion) {
        const resolved = resolveOperation(snapshot.state, input.operation, {
          seed: () => crypto.getRandomValues(new Uint32Array(1))[0] || 1,
          uuid: () => crypto.randomUUID(),
          random: () => crypto.getRandomValues(new Uint32Array(1))[0] / 0x100000000,
        });
        resolved.response.social = social;
        // Reads use the loaded revision; checkpoints already validated the caller's revision above.
        const { data: committed, error: commitError } = await admin.rpc('commit_game_operation', {
          p_user: user, p_request: input.requestId, p_fingerprint: hash, p_revision: snapshot.revision,
          p_state: resolved.game, p_response: resolved.response, p_social: null, p_activity: null,
        });
        if (commitError) {
          if (commitError.code === 'P0001') return response(400, { error: commitError.message }, origin);
          return response(503, { error: 'The operation was not acknowledged. Retry the same request ID.' }, origin);
        }
        if (committed?.conflict) return response(409, { error: 'Account changed. Reload before issuing a new operation.', revision: committed.revision }, origin);
        return response(200, committed, origin);
      }
      return response(200, { ...publicGame(snapshot.state, snapshot.revision), social }, origin);
    }
    if (input.expectedRevision !== stored.revision) {
      const { data: retry, error: retryError } = await admin.rpc('find_game_request', {
        p_user: user, p_request: input.requestId, p_fingerprint: hash,
      });
      if (!retryError && retry) return response(200, retry, origin);
      return response(409, { error: 'Account changed. Reload before issuing a new operation.', revision: stored.revision }, origin);
    }
    if (input.operation.kind === 'importSave' && stored.revision !== 0) return response(400, { error: 'Save import is only available before the first online operation.' }, origin);
    const resolved = resolveOperation(stored.state, input.operation, {
      seed: () => crypto.getRandomValues(new Uint32Array(1))[0] || 1,
      uuid: () => crypto.randomUUID(),
      random: () => crypto.getRandomValues(new Uint32Array(1))[0] / 0x100000000,
    });
    const activity = profileActivityFor(input.operation, stored.state.account.storyCompleted ?? 0,
      resolved, () => crypto.randomUUID());
    const { data: committed, error: commitError } = await admin.rpc('commit_game_operation', {
      p_user: user, p_request: input.requestId, p_fingerprint: hash, p_revision: input.expectedRevision,
      p_state: resolved.game, p_response: resolved.response,
      p_social: ['friendRequest', 'acceptFriendRequest', 'declineFriendRequest', 'cancelFriendRequest', 'removeFriend']
        .includes(input.operation.kind) ? input.operation : null,
      p_activity: activity,
    });
    if (commitError) {
      if (commitError.code === 'P0001') return response(400, { error: commitError.message }, origin);
      return response(503, { error: 'The operation was not acknowledged. Retry the same request ID.' }, origin);
    }
    if (committed?.conflict) return response(409, { error: 'Account changed. Reload before issuing a new operation.', revision: committed.revision }, origin);
    return response(200, committed, origin);
  } catch (error) {
    return response(400, { error: error instanceof Error ? error.message : 'Invalid game operation.' }, origin);
  }
});
