import { emptyAccount, validateAccount, type Account } from './account';

/**
 * Friend profiles show the same collection/progress view the owner sees (D-340), never
 * balances, materials, receipts, seeds, chests or gear. Only fields the profile renders survive.
 */
export function redactFriendAccount(value: unknown): Account {
  const source = validateAccount(value);
  const account = emptyAccount();
  account.characters = source.characters;
  if (source.capturedCharacters) account.capturedCharacters = source.capturedCharacters;
  if (source.squad) account.squad = source.squad;
  if (source.conduits) account.conduits = source.conduits;
  if (source.bannerPity) account.bannerPity = source.bannerPity;
  if (source.storyCompleted !== undefined) account.storyCompleted = source.storyCompleted;
  account.creatures = source.creatures;
  return validateAccount(account);
}
