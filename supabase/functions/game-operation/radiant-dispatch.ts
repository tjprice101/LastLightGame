import type { SupabaseClient } from '@supabase/supabase-js';
import { freshGame } from './engine';
import { executeRadiantRun, radiantRpcRepository, RadiantRunError, validateRadiantRunRequest,
  validateRadiantRunSnapshot, validateRadiantCheckpoint, radiantRpcRepositoryFor,
  type RadiantRunAuthority } from '../../../src/online/radiant-run';
import { executeRadiantPreparation, validateRadiantPreparationRequest } from '../../../src/online/radiant-preparation';

export interface RadiantServerConfig {
  enabled?: string;
  secret?: string;
  calibration?: string;
}
const encoder = new TextEncoder();
/** Domain separated, length-delimited inputs; retries never need a random fallback. */
export async function deriveRadiantEntry(secret: string, user: string, requestId: string):
  Promise<ReturnType<RadiantRunAuthority['entry']>> {
  if (!secret || encoder.encode(secret).length < 32)
    throw new RadiantRunError('unavailable', 'Radiant study entropy is not configured.');
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']);
  const bytes = new Uint8Array(await crypto.subtle.sign('HMAC', key,
    encoder.encode(JSON.stringify(['last-light:radiant-entry:v1', user.toLowerCase(), requestId.toLowerCase()]))));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes.slice(0, 16), byte => byte.toString(16).padStart(2, '0')).join('');
  const view = new DataView(bytes.buffer);
  return { runId: `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`,
    encounterSeed: view.getUint32(16) || 1, chargeSeed: view.getUint32(20) || 1,
    targetSeed: view.getUint32(24) || 1 };
}
export async function handleRadiantRequest(value: object, user: string,
  admin: Pick<SupabaseClient, 'rpc'>, config: RadiantServerConfig,
  identityOf: (user: string) => Promise<{ username: string; created_at: string } | null>):
  Promise<{ status: number; body: unknown }> {
  if (config.enabled !== 'true') return { status: 503,
    body: { code: 'unavailable', error: 'Radiant study authority is unavailable.' } };
  if (!config.secret || encoder.encode(config.secret).length < 32 ||
    config.calibration !== undefined && !['authored-control', 'radiant-pressure-v2'].includes(config.calibration))
    return { status: 503, body: { code: 'unavailable', error: 'Radiant study authority is not configured.' } };
  try {
    if (Object.keys(value).length !== 1 || !('radiantStudy' in value))
      throw new RadiantRunError('invalid-input', 'Use only the dedicated radiantStudy request.');
    const operation = value.radiantStudy;
    const load = async () => {
      const profile = await identityOf(user);
      if (!profile) throw new RadiantRunError('unavailable', 'Online identity unavailable.');
      const { data, error } = await admin.rpc('load_game_account', {
        p_user: user, p_initial: freshGame(profile.username, profile.created_at),
      });
      if (error) throw new RadiantRunError('unavailable', 'Online account storage unavailable.');
      const snapshot = validateRadiantRunSnapshot(data);
      if (snapshot.state.radiantStudy &&
        snapshot.state.radiantStudy.calibration !== (config.calibration ?? 'authored-control'))
        throw new RadiantRunError('unavailable', 'Frozen study calibration is not enabled by the authority.');
      return snapshot;
    };
    if (operation && typeof operation === 'object' && !Array.isArray(operation) &&
      'kind' in operation && operation.kind === 'read') {
      if (Object.keys(operation).length !== 1)
        throw new RadiantRunError('invalid-input', 'Unexpected Radiant checkpoint field.');
      const { data: allowed, error: limitError } = await admin.rpc('consume_game_attempt', { p_user: user });
      if (limitError) throw new RadiantRunError('unavailable', 'Game rate-limit storage unavailable.');
      if (!allowed) return { status: 429, body: { error: 'Too many game operations. Wait one minute.' } };
      const snapshot = await load();
      const run = snapshot.state.radiantStudy ?? null;
      return { status: 200, body: { revision: snapshot.revision, account: snapshot.state.account, run } };
    }
    if (operation && typeof operation === 'object' && !Array.isArray(operation) &&
      'kind' in operation && operation.kind === 'prepare') {
      const input = validateRadiantPreparationRequest(operation);
      const { data: allowed, error: limitError } = await admin.rpc('consume_game_attempt', { p_user: user });
      if (limitError) throw new RadiantRunError('unavailable', 'Game rate-limit storage unavailable.');
      if (!allowed) return { status: 429, body: { error: 'Too many game operations. Wait one minute.' } };
      const result = await executeRadiantPreparation(
        radiantRpcRepositoryFor(admin, user, load, validateRadiantCheckpoint), input);
      return { status: 200, body: result };
    }
    const input = validateRadiantRunRequest(value.radiantStudy);
    const calibration = config.calibration ?? 'authored-control';
    if (input.operation.kind === 'start' && input.operation.calibration !== calibration)
      throw new RadiantRunError('unavailable', 'Requested study calibration is not enabled by the authority.');
    const { data: allowed, error: limitError } = await admin.rpc('consume_game_attempt', { p_user: user });
    if (limitError) throw new RadiantRunError('unavailable', 'Game rate-limit storage unavailable.');
    if (!allowed) return { status: 429, body: { error: 'Too many game operations. Wait one minute.' } };
    const entropy = await deriveRadiantEntry(config.secret, user, input.requestId);
    const repository = radiantRpcRepository(admin, user, load);
    const result = await executeRadiantRun(repository, input, {
      capability: 'isolated-radiant-study', now: Date.now(), entry: () => entropy,
    });
    return { status: 200, body: result };
  } catch (error) {
    if (!(error instanceof RadiantRunError)) {
      console.error('Unexpected Radiant study authority failure; no successful commit acknowledged.');
      return { status: 503,
        body: { code: 'unavailable', error: 'Study authority was not acknowledged; retry the same request ID.' } };
    }
    const status = ['stale-revision', 'stale-run', 'receipt-conflict'].includes(error.code) ? 409 :
      ['unavailable', 'denied-write'].includes(error.code) ? 503 : 400;
    return { status, body: { code: error.code, error: error.message } };
  }
}
