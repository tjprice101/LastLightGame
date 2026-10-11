import { createClient } from 'npm:@supabase/supabase-js@2';

const url = Deno.env.get('SUPABASE_URL');
const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
if (!url || !anonKey || !serviceKey) throw new Error('Account authentication configuration is missing.');
const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
const origins = new Set([
  'http://127.0.0.1:5173', 'http://localhost:5173', 'https://tjprice101.github.io',
]);

function response(status: number, body: unknown, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Vary': 'Origin',
      ...(origin && origins.has(origin) ? { 'Access-Control-Allow-Origin': origin } : {}),
      'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    },
  });
}

async function bucket(value: string): Promise<string> {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async request => {
  const origin = request.headers.get('origin');
  if (origin && !origins.has(origin)) return response(403, { error: 'Origin is not permitted.' }, origin);
  if (request.method === 'OPTIONS') return response(200, {}, origin);
  if (request.method !== 'POST') return response(405, { error: 'Use POST.' }, origin);
  try {
    if (Number(request.headers.get('content-length')) > 4096) {
      return response(400, { error: 'Authentication request is too large.' }, origin);
    }
    const text = await request.text();
    if (text.length > 4096) return response(400, { error: 'Authentication request is too large.' }, origin);
    let body: unknown;
    try { body = JSON.parse(text); } catch {
      return response(400, { error: 'Authentication request must be JSON.' }, origin);
    }
    if (!body || typeof body !== 'object' ||
      !('action' in body) || !['login', 'register', 'recover'].includes(String(body.action)) ||
      !('username' in body) || typeof body.username !== 'string') {
      return response(400, { error: 'Invalid authentication request.' }, origin);
    }
    const username = body.username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,16}$/.test(username)) {
      return response(400, { error: 'Username must contain 3–16 letters, numbers or underscores.' }, origin);
    }
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    for (const [key, maximum] of [[`ip:${ip}`, 30], [`user:${username}`, 10]] as const) {
      const { data, error } = await admin.rpc('consume_login_attempt', {
        p_bucket: await bucket(key), p_max: maximum,
      });
      if (error) throw new Error('Authentication rate-limit storage failed.');
      if (data !== true) return response(429, { error: 'Too many attempts. Try again in 15 minutes.' }, origin);
    }
    const client = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
    if (body.action === 'register') {
      if (!('email' in body) || typeof body.email !== 'string' ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) || body.email.length > 254 ||
        !('password' in body) || typeof body.password !== 'string' ||
        body.password.length < 12 || body.password.length > 128) {
        return response(400, { error: 'Enter a valid email and a password of 12–128 characters.' }, origin);
      }
      const { error } = await client.auth.signUp({
        email: body.email.trim(), password: body.password,
        options: { data: { username }, emailRedirectTo: origin ? `${origin}/LastLightGame/` : undefined },
      });
      if (error) return response(400, {
        error: 'Registration could not complete. Check your details or try another username.',
      }, origin);
      return response(200, { message: 'Check your email to verify your account before signing in.' }, origin);
    }
    const { data: profile, error: profileError } = await admin
      .from('player_profiles').select('user_id').eq('username', username).maybeSingle();
    if (profileError) throw new Error('Account lookup failed.');
    let email = 'unknown-account@invalid.invalid';
    if (profile) {
      const { data, error } = await admin.auth.admin.getUserById(profile.user_id);
      if (error || !data.user.email) throw new Error('Account identity lookup failed.');
      email = data.user.email;
    }
    if (body.action === 'recover') {
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: origin ? `${origin}/LastLightGame/` : undefined,
      });
      if (error) throw new Error('Password recovery delivery failed.');
      return response(200, { message: 'If the account exists, a recovery email has been requested.' }, origin);
    }
    if (!('password' in body) || typeof body.password !== 'string' || body.password.length > 128) {
      return response(400, { error: 'Enter your password.' }, origin);
    }
    const { data, error } = await client.auth.signInWithPassword({ email, password: body.password });
    if (error || !profile || !data.session) return response(401, {
      error: 'Sign-in failed. Check your username, password and email verification.',
    }, origin);
    return response(200, {
      access_token: data.session.access_token, refresh_token: data.session.refresh_token,
    }, origin);
  } catch {
    console.error('Account authentication failed unexpectedly.');
    return response(503, { error: 'Account service is unavailable. Please try again later.' }, origin);
  }
});
