/** Maximum Element-Bearers in an equipped squad, saved loadout or battle (D-471). */
export const squadMemberLimit = 3;
/**
 * Largest squad or loadout accepted when reading stored data. Saves made before
 * D-471 may hold up to six members; they load unchanged (loading never writes),
 * play as their first `squadMemberLimit` members and are trimmed only when the
 * player next saves that squad or loadout.
 */
export const storedSquadLimit = 6;
