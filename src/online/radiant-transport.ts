import { onlineClient } from './account-client';
import { RadiantRunError, isRadiantRunErrorCode, validateRadiantRunRequest, validateRadiantRunResponse,
  validateRadiantCheckpoint, type RadiantCheckpoint, type RadiantRunRequest, type RadiantRunResponse } from './radiant-run';
import { validateRadiantPreparationRequest, type RadiantPreparationRequest } from './radiant-preparation';

export interface RadiantStudyTransportRequest { radiantStudy: RadiantRunRequest }
/** Dedicated transport only. No menu, capability auto-discovery or live battle caller. */
export async function radiantStudyOperation(request: RadiantRunRequest): Promise<RadiantRunResponse> {
  const body: RadiantStudyTransportRequest = { radiantStudy: validateRadiantRunRequest(request) };
  return validateRadiantRunResponse(await invokeRadiantStudy(body));
}
export async function readRadiantStudy(): Promise<RadiantCheckpoint> {
  return validateRadiantCheckpoint(await invokeRadiantStudy({ radiantStudy: { kind: 'read' } }));
}
export async function prepareRadiantStudy(request: RadiantPreparationRequest): Promise<RadiantCheckpoint> {
  return validateRadiantCheckpoint(await invokeRadiantStudy({ radiantStudy: validateRadiantPreparationRequest(request) }));
}
async function invokeRadiantStudy(body: RadiantStudyTransportRequest |
  { radiantStudy: { kind: 'read' } | RadiantPreparationRequest }): Promise<unknown> {
  const { data, error } = await onlineClient().functions.invoke('game-operation', { body, timeout: 30_000 });
  if (error) {
    if ('context' in error && error.context instanceof Response) {
      const reply: unknown = await error.context.json().catch(() => null);
      const message = reply && typeof reply === 'object' && 'error' in reply && typeof reply.error === 'string'
        ? reply.error : 'Study operation was not acknowledged; retry the same request ID.';
      const code = reply && typeof reply === 'object' && 'code' in reply && isRadiantRunErrorCode(reply.code)
        ? reply.code : error.context.status === 409 ? 'stale-revision' :
        error.context.status >= 500 ? 'unavailable' : 'invalid-input';
      throw new RadiantRunError(code, message);
    }
    throw new RadiantRunError('unavailable', 'Connection failed; retry the same study request ID.');
  }
  return data;
}
