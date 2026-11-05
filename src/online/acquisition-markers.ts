import { onlineClient } from './account-client';
import { validAcquisitionKey, type AcquisitionMarkers } from '../game/acquisition-markers';

export interface AcquisitionSnapshot { revision: number; markers: AcquisitionMarkers }
export async function acquisitionMarkerOperation(keys?: readonly string[]): Promise<AcquisitionSnapshot> {
  const { data, error } = await onlineClient().rpc('acquisition_markers', { p_keys: keys ?? null });
  if (error) throw new Error('New-item acknowledgement could not be saved. Its marker is retained; try again.');
  if (!data || !Number.isSafeInteger(data.revision) || data.revision < 0 || !data.markers ||
    typeof data.markers !== 'object' || Array.isArray(data.markers) ||
    Object.entries(data.markers).some(([key, seen]) => !validAcquisitionKey(key) || typeof seen !== 'boolean')) {
    throw new Error('New-item service returned an invalid response. No markers were cleared.');
  }
  return data as AcquisitionSnapshot;
}
