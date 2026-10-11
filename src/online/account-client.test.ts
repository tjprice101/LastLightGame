import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  invoke: vi.fn(), setSession: vi.fn(), getSession: vi.fn(), getUser: vi.fn(),
  single: vi.fn(), select: vi.fn(), eq: vi.fn(), from: vi.fn(),
  createClient: vi.fn(),
}));
vi.mock('@supabase/supabase-js', () => ({ createClient: mocks.createClient }));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.stubEnv('VITE_SUPABASE_URL', 'https://ohtfgwomdfteaxubndww.supabase.co');
  vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_fixture');
  mocks.from.mockReturnValue({ select: mocks.select });
  mocks.select.mockReturnValue({ eq: mocks.eq });
  mocks.eq.mockReturnValue({ single: mocks.single });
  mocks.createClient.mockReturnValue({
    functions: { invoke: mocks.invoke },
    auth: { setSession: mocks.setSession, getSession: mocks.getSession, getUser: mocks.getUser },
    from: mocks.from,
  });
});

describe('isolated online identity client', () => {
  it('accepts only the approved username alphabet and length', async () => {
    const { validUsername } = await import('./account-client');
    for (const name of ['abc', 'A_b12', 'a'.repeat(16)]) expect(validUsername(name)).toBe(true);
    for (const name of ['ab', 'a'.repeat(17), 'a-b', 'abc@a', '<tag>', 'a b']) expect(validUsername(name)).toBe(false);
  });

  it('requires configuration and uses a separate session key without a wallet API', async () => {
    const { onlineClient } = await import('./account-client');
    onlineClient();
    expect(mocks.createClient).toHaveBeenCalledWith(expect.any(String), expect.any(String),
      expect.objectContaining({ auth: expect.objectContaining({ storageKey: 'last-light.online-auth' }) }));
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('rejects missing configuration without fabricating an offline account', async () => {
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', '');
    const { onlineClient } = await import('./account-client');
    expect(onlineClient).toThrow('not configured');
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it('stores a returned login session only after the server succeeds', async () => {
    mocks.invoke.mockResolvedValue({ data: { access_token: 'access', refresh_token: 'refresh' }, error: null });
    mocks.setSession.mockResolvedValue({ error: null });
    const { accountRequest } = await import('./account-client');
    await expect(accountRequest('login', 'User', 'password')).resolves.toContain('Signed in');
    expect(mocks.invoke).toHaveBeenCalledWith('account-auth', {
      body: { action: 'login', username: 'User', password: 'password', email: undefined },
    });
    expect(mocks.setSession).toHaveBeenCalledWith({ access_token: 'access', refresh_token: 'refresh' });
  });

  it('surfaces server rejections and never installs a session on failure', async () => {
    mocks.invoke.mockResolvedValue({
      data: null, error: { context: new Response(JSON.stringify({ error: 'Too many attempts.' }), { status: 429 }) },
    });
    const { accountRequest } = await import('./account-client');
    await expect(accountRequest('login', 'user', 'password')).rejects.toThrow('Too many attempts.');
    expect(mocks.setSession).not.toHaveBeenCalled();
  });

  it('rejects malformed success responses and failed local session persistence', async () => {
    const { accountRequest } = await import('./account-client');
    mocks.invoke.mockResolvedValue({ data: {}, error: null });
    await expect(accountRequest('login', 'user', 'password')).rejects.toThrow('valid session');
    mocks.invoke.mockResolvedValue({ data: { access_token: 'a', refresh_token: 'r' }, error: null });
    mocks.setSession.mockResolvedValue({ error: new Error('storage denied') });
    await expect(accountRequest('login', 'user', 'password')).rejects.toThrow('could not be saved');
  });

  it('registration does not log in or create gameplay progress', async () => {
    mocks.invoke.mockResolvedValue({ data: { message: 'Check your email.' }, error: null });
    const { accountRequest } = await import('./account-client');
    await expect(accountRequest('register', 'user', 'password', 'user@example.com')).resolves.toBe('Check your email.');
    expect(mocks.setSession).not.toHaveBeenCalled();
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('checks the authenticated user before reading only their profile', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: {} }, error: null });
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-id' } }, error: null });
    mocks.single.mockResolvedValue({ data: { username: 'user' }, error: null });
    const { onlineUsername } = await import('./account-client');
    await expect(onlineUsername()).resolves.toBe('user');
    expect(mocks.eq).toHaveBeenCalledWith('user_id', 'user-id');
  });

  it('does not accept a stale token as verified identity', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: {} }, error: null });
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: new Error('expired') });
    const { onlineUsername } = await import('./account-client');
    await expect(onlineUsername()).rejects.toThrow('expired');
    expect(mocks.from).not.toHaveBeenCalled();
  });
});
