import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const storageKey = 'last-light.online-auth';
let client: SupabaseClient | undefined;

export function onlineClient(): SupabaseClient {
  const url: unknown = import.meta.env.VITE_SUPABASE_URL;
  const key: unknown = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (typeof url !== 'string' || !/^https:\/\/[a-z]+\.supabase\.co$/.test(url) ||
    typeof key !== 'string' || !key.startsWith('sb_publishable_')) {
    throw new Error('Online accounts are not configured for this deployment.');
  }
  client ??= createClient(url, key, {
    auth: { storageKey, persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return client;
}

export function validUsername(value: string): boolean {
  return /^[a-z0-9_]{3,16}$/i.test(value.trim());
}

export async function accountRequest(
  action: 'login' | 'register' | 'recover',
  username: string,
  password?: string,
  email?: string,
): Promise<string> {
  if (!validUsername(username)) throw new Error('Username must contain 3–16 letters, numbers or underscores.');
  const api = onlineClient();
  const { data, error } = await api.functions.invoke('account-auth', {
    body: { action, username, password, email },
  });
  if (error) {
    if ('context' in error && error.context instanceof Response) {
      const payload: unknown = await error.context.json();
      if (payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string') {
        throw new Error(payload.error);
      }
    }
    throw new Error('Account service could not be reached. Please try again.');
  }
  if (!data || typeof data !== 'object') throw new Error('Account service returned an invalid response.');
  if (action === 'login') {
    if (!('access_token' in data) || typeof data.access_token !== 'string' ||
      !('refresh_token' in data) || typeof data.refresh_token !== 'string') {
      throw new Error('Account service did not return a valid session.');
    }
    const { error: sessionError } = await api.auth.setSession({
      access_token: data.access_token, refresh_token: data.refresh_token,
    });
    if (sessionError) throw new Error('Your session could not be saved. Please sign in again.');
    return 'Signed in. Choose Play Online to continue.';
  }
  if (!('message' in data) || typeof data.message !== 'string') throw new Error('Account service response is incomplete.');
  return data.message;
}

export async function onlineUsername(): Promise<string | null> {
  const api = onlineClient();
  const { data: session, error: sessionError } = await api.auth.getSession();
  if (sessionError) throw new Error('Your online session could not be restored.');
  if (!session.session) return null;
  const { data: user, error: userError } = await api.auth.getUser();
  if (userError || !user.user) throw new Error('Your online session has expired. Sign in again.');
  const { data, error } = await api.from('player_profiles').select('username').eq('user_id', user.user.id).single();
  if (error || !data || typeof data.username !== 'string') throw new Error('Your online profile could not be loaded.');
  return data.username;
}
