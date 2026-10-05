import { type BattleState, type Combatant } from '../game/battle';
import { characterLevelCap, characterGrowth } from '../content/progression';
import { dungeonEncounter } from '../content/dungeons';
import { infusionEncounter } from '../content/infusions';

export function battleArtScale(state: BattleState, unit: Combatant): number {
  if (unit.side === 'ally') {
    const evolution = unit.evolution ?? 1;
    characterLevelCap(evolution);
    return 1 + (evolution - 1) / (characterGrowth.forms - 1) * 1.7;
  }
  const encounter = state.infusion ? infusionEncounter(state.infusion.mode, state.infusion.stage)
    : state.dungeon ? dungeonEncounter(state.dungeon.element, state.dungeon.stage) : null;
  if (encounter) return 1 + encounter.tier / (encounter.forms - 1) * 1.7 + (encounter.boss ? .4 : 0);
  return unit.definitionId === 'golem' ? 1.2 : 1;
}
