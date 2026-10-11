import { type ElementId } from '../content/activities';
import { elementAccents } from '../content/dungeon-art';
import { getCreature } from '../content/creatures';
import { getStarter, isStarterId } from '../content/starters';
import { equippedSquad, type Account } from '../game/account';
import { type BattleState } from '../game/battle';

export function leaderElement(account: Account | null, battle?: BattleState): ElementId | null {
  if (battle) {
    const leader = battle.allies[0];
    if (!leader) throw new Error('Battle squad leader is missing.');
    return leader.element;
  }
  if (!account) return null;
  const id = equippedSquad(account)[0];
  if (isStarterId(id)) return getStarter(id).elementId;
  const copy = account.capturedCharacters?.find(entry => entry.instanceId === id);
  if (!copy) throw new Error('Saved squad leader is missing.');
  return getCreature(copy.creatureId).element;
}

export function applyLeaderTheme(root: { dataset: DOMStringMap; style: Pick<CSSStyleDeclaration, 'setProperty'> }, element: ElementId | null): void {
  root.style.setProperty('--ui-accent', element ? elementAccents[element] : '#f4f4f5');
  if (element) root.dataset.leaderElement = element;
  else delete root.dataset.leaderElement;
}
