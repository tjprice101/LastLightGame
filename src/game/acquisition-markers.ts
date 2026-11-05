export type AcquisitionKind = 'character' | 'form' | 'material' | 'conduit' | 'master';
export type AcquisitionMarkers = Record<string, boolean>;
export interface AcquisitionHoldings {
  characters?: Partial<Record<string, unknown>>;
  capturedCharacters?: readonly { instanceId?: string; creatureId: string }[];
  materials?: Record<string, number>;
  conduits?: Partial<Record<string, number>>;
  masterConduits?: Partial<Record<string, number>>;
  acquisitionMarkers?: AcquisitionMarkers;
}
export function acquisitionKey(kind: AcquisitionKind, id: string): string { return `${kind}:${id}`; }
export function validAcquisitionKey(key: string): boolean {
  return /^(character|form|material|conduit|master):[a-z0-9][a-z0-9:_-]{0,159}$/.test(key);
}
export function acquisitionKeys(holdings: AcquisitionHoldings): string[] {
  const keys = [
    ...Object.keys(holdings.characters ?? {}).filter(id => holdings.characters?.[id] !== undefined).map(id => acquisitionKey('character', id)),
    ...(holdings.capturedCharacters ?? []).map(copy => acquisitionKey('form', copy.creatureId)),
    ...(['material', 'conduit', 'master'] as const).flatMap((kind, index) => {
      const counts = [holdings.materials, holdings.conduits, holdings.masterConduits][index];
      return Object.entries(counts ?? {}).filter(([, count]) => (count ?? 0) > 0).map(([id]) => acquisitionKey(kind, id));
    }),
  ];
  return [...new Set(keys)].sort();
}
/** Missing history is legacy: current holdings are seen, without any read-time persistence. */
export function acquisitionView(holdings: AcquisitionHoldings): AcquisitionMarkers {
  const markers = { ...holdings.acquisitionMarkers };
  for (const key of acquisitionKeys(holdings)) if (!Object.hasOwn(markers, key)) markers[key] = true;
  return markers;
}
/** A successful transaction keeps lifetime history even after sales/spending. */
export function advanceAcquisitions(previous: AcquisitionHoldings, next: AcquisitionHoldings): AcquisitionMarkers {
  const markers = acquisitionView(previous);
  for (const [key, seen] of Object.entries(next.acquisitionMarkers ?? {})) {
    if (Object.hasOwn(markers, key) && seen) markers[key] = true;
  }
  for (const key of acquisitionKeys(next)) if (!Object.hasOwn(markers, key)) markers[key] = false;
  return markers;
}
export function unreadAcquisitions(holdings: AcquisitionHoldings): string[] {
  return Object.entries(acquisitionView(holdings)).filter(([, seen]) => !seen).map(([key]) => key).sort();
}
export function acknowledgeAcquisitions(holdings: AcquisitionHoldings, keys: readonly string[]): AcquisitionMarkers {
  const markers = acquisitionView(holdings);
  for (const key of keys) if (Object.hasOwn(markers, key)) markers[key] = true;
  return markers;
}
