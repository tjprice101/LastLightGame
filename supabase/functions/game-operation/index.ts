import { createClient } from 'npm:@supabase/supabase-js@2';
import { conduitRulesVersion, freshGame, friendProfileView, profileActivityFor, publicGame, resolveOperation, storyCompletedOf, validateChatRequest, validateFriendProfileRequest, validateRequest } from './engine.bundle.js';
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
// Usernames/creation dates never change, so a warm isolate skips that lookup on later operations.
const identities = new Map<string, { username: string; created_at: string }>();
async function identityOf(user: string): Promise<{ username: string; created_at: string } | null> {
  const known = identities.get(user);
  if (known) return known;
  const { data, error } = await admin.from('player_profiles').select('username,created_at').eq('user_id', user).single();
  if (error || !data) return null;
  if (identities.size > 5000) identities.clear();
  identities.set(user, data);
  return data;
}
/** Verifies the JWT locally against the project's signing keys when possible; falls back to the Auth server. */
async function authenticatedUser(token: string): Promise<string | null> {
  const auth = admin.auth as unknown as { getClaims?: (jwt: string) => Promise<{ data: { claims?: { sub?: string } } | null; error: unknown }> };
  if (typeof auth.getClaims === 'function') {
    try {
      const { data, error } = await auth.getClaims(token);
      if (!error && typeof data?.claims?.sub === 'string') return data.claims.sub;
      if (error) return null;
    } catch { /* fall through to the Auth server */ }
  }
  const { data: identity, error } = await admin.auth.getUser(token);
  return error || !identity.user ? null : identity.user.id;
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
    const user = await authenticatedUser(authorization.slice(7));
    if (!user) return response(401, { error: 'Your online session expired.' }, origin);
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
    // Friend profiles are read-only: accepted friends only, redacted by the engine, never committed.
    if (!parseFailed && parsed && typeof parsed === 'object' && !Array.isArray(parsed) && 'friendProfile' in parsed) {
      if (body.length > 8192) return response(400, { error: 'Request too large.' }, origin);
      const lookup = validateFriendProfileRequest(parsed);
      const { data: allowed, error: limitError } = await admin.rpc('consume_game_attempt', { p_user: user });
      if (limitError) return response(503, { error: 'Game rate-limit storage unavailable.' }, origin);
      if (!allowed) return response(429, { error: 'Too many game operations. Wait one minute.' }, origin);
      const { data: row, error: friendError } = await admin.rpc('friend_profile', { p_user: user, p_friend: lookup.friendProfile.userId });
      if (friendError) return response(503, { error: 'Friend profiles are unavailable. Try again.' }, origin);
      if (!row) return response(404, { error: 'Only accepted friends can view this profile.' }, origin);
      return response(200, friendProfileView(row), origin);
    }
    // The limit, cache lookup and account load are independent reads, so they share one round trip.
    // The limit is still checked first: a limited or malformed request never resolves an operation.
    const limit = admin.rpc('consume_game_attempt', { p_user: user });
    let input;
    try {
      if (parseFailed) throw new SyntaxError('Request must be JSON.');
      input = validateRequest(parsed);
    } catch (error) {
      const { data: allowed, error: limitError } = await limit;
      if (limitError) return response(503, { error: 'Game rate-limit storage unavailable.' }, origin);
      if (!allowed) return response(429, { error: 'Too many game operations. Wait one minute.' }, origin);
      throw error;
    }
    const hash = await fingerprint(input);
    const lookup = admin.rpc('find_game_request', { p_user: user, p_request: input.requestId, p_fingerprint: hash });
    const loading = identityOf(user).then(profile => profile ? admin.rpc('load_game_account', {
      p_user: user, p_initial: freshGame(profile.username, profile.created_at),
    }) : null);
    const [{ data: allowed, error: limitError }, { data: cached, error: cacheError }, loaded] = await Promise.all([limit, lookup, loading]);
    if (limitError) return response(503, { error: 'Game rate-limit storage unavailable.' }, origin);
    if (!allowed) return response(429, { error: 'Too many game operations. Wait one minute.' }, origin);
    if (input.operation.kind !== 'importSave' && body.length > 8192) return response(400, { error: 'Request too large.' }, origin);
    if (cacheError) return response(409, { error: 'Request ID was already used with different input.' }, origin);
    // This includes the saved Calamity opening receipt; never resolve a second roll.
    if (cached) return response(200, cached, origin);
    if (!loaded) return response(503, { error: 'Online identity unavailable.' }, origin);
    const { data: stored, error: loadError } = loaded;
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
      const [{ data: profileReference, error: trackingError }, { data: social, error: socialError }] = await Promise.all([
        admin.rpc('track_game_session', { p_user: user, p_request: input.requestId }),
        admin.rpc('game_social', { p_user: user }),
      ]);
      if (trackingError || !profileReference) return response(503, { error: 'Online profile tracking unavailable. Retry the same request.' }, origin);
      snapshot.state.profile = { ...snapshot.state.profile, ...profileReference };
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
    const previousStoryCompleted = storyCompletedOf(stored.state);
    const resolved = resolveOperation(stored.state, input.operation, {
      seed: () => crypto.getRandomValues(new Uint32Array(1))[0] || 1,
      uuid: () => crypto.randomUUID(),
      random: () => crypto.getRandomValues(new Uint32Array(1))[0] / 0x100000000,
    });
    const activity = profileActivityFor(input.operation, previousStoryCompleted,
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
