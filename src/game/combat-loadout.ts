import { isConduitId, validateConduitUpgrades, type ConduitId } from '../content/conduits';
import { radiantBearerKits, radiantMasters, validateRadiantLoadout, type RadiantLoadout } from '../content/combat-kits';
import { validateRadiantGear, type RadiantGear } from '../content/conduit-effects';
import { validateRadiantParty } from './combat-engine';
import { isMasterConduitId, type MasterConduitId } from '../content/master-conduits';

export interface RadiantAccountGear {
  conduits?: Partial<Record<ConduitId, number>>;
  conduitUpgrades?: Partial<Record<ConduitId, number>>;
  conduitEquipment?: Partial<Record<string, (ConduitId | null)[]>>;
  masterConduits?: Partial<Record<string, number>>;
  masterEquipment?: Partial<Record<string, MasterConduitId | null>>;
}
export type RadiantLoadoutResult =
  | { ok: true; loadouts: RadiantLoadout[] }
  | { ok: false; errors: { memberId: string; reason: string }[] };

/** Read-only study boundary. The caller supplies acquired bearer identities;
 * captured IDs require a manual replacement, never a fabricated bearer. */
export function adaptRadiantLoadouts(
  members: RadiantLoadout[], acquiredBearerIds: readonly string[], account: RadiantAccountGear,
): RadiantLoadoutResult {
  const errors: { memberId: string; reason: string }[] = [];
  const loadouts: RadiantLoadout[] = [];
  try {
    const upgrades = validateConduitUpgrades(account.conduitUpgrades ?? {});
    for (const [id, count] of Object.entries(account.conduits ?? {})) {
      if (!isConduitId(id) || !Number.isSafeInteger(count) || count! < 0)
        throw new Error('Invalid ordinary Conduit ownership.');
    }
    for (const [id, count] of Object.entries(account.masterConduits ?? {})) {
      if (!isMasterConduitId(id) || !Number.isSafeInteger(count) || count! < 0 || count! > 1)
        throw new Error('Invalid radiant Master ownership.');
    }
    for (const id of Object.keys(upgrades) as ConduitId[])
      if (!(account.conduits?.[id]! > 0)) throw new Error('Upgraded Conduit is not owned.');
    for (const member of members) {
      try {
        if (member.id.startsWith('capture:') || !Object.hasOwn(radiantBearerKits, member.starter))
          throw new Error('Captured Elemental-Devourer requires a manual acquired Element-Bearer choice.');
        if (!acquiredBearerIds.includes(member.starter))
          throw new Error('Element-Bearer is not acquired.');
        const slots = account.conduitEquipment?.[member.id];
        const gear: RadiantGear = slots === undefined ? Array<null>(8).fill(null) : slots.map(id =>
          id === null ? null : { id, rank: upgrades[id] ?? 0 });
        validateRadiantGear(gear, radiantBearerKits[member.starter].elementId);
        for (const slot of gear)
          if (slot && !(account.conduits?.[slot.id]! > 0)) throw new Error('Equipped Conduit is not owned.');
        const masterId = account.masterEquipment?.[member.id] === undefined
          ? member.masterId : account.masterEquipment[member.id]!;
        if (masterId !== null && !(account.masterConduits?.[masterId]! > 0))
          throw new Error('Equipped Master is not owned.');
        if (masterId !== null && !Object.hasOwn(radiantMasters, masterId))
          throw new Error('Equipped Master is not released for radiant combat.');
        const frozen = structuredClone({ ...member, masterId: masterId as RadiantLoadout['masterId'], gear });
        validateRadiantLoadout(frozen);
        loadouts.push(frozen);
      } catch (error) {
        errors.push({ memberId: member.id, reason: error instanceof Error ? error.message : 'Invalid loadout.' });
      }
    }
    if (!errors.length) validateRadiantParty(loadouts);
  } catch (error) {
    errors.push({ memberId: 'party', reason: error instanceof Error ? error.message : 'Invalid account gear.' });
  }
  return errors.length ? { ok: false, errors } : { ok: true, loadouts };
}
