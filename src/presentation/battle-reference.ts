import { radiantLeaderBonus, radiantStarterKits, type RadiantLoadout } from '../content/combat-kits';
import { characterName } from '../content/character-art';
import type { RadiantCombatState } from '../game/combat-engine';
import { radiantCharacterSheet } from './character-combat';
import { escapeDialogText as escape } from './game-dialog';

export { radiantConduitDescription } from '../content/conduit-effect-text';
export { radiantFlareDescription, radiantFlareNeedsTarget, radiantPassiveEnhancements } from './combat-description';

const percent = (value: number): string => `${Number((value * 100).toPrecision(12))}%`;

export function radiantLeaderReference(state: RadiantCombatState, living = state.bearers[0].hp > 0): string {
  const leader = state.bearers[0], loadout = leader.loadout, kit = radiantStarterKits[loadout.starter];
  const amount = radiantLeaderBonus(loadout);
  return `<strong>${escape(kit.leader)} · +${percent(amount)} ${kit.element} attack damage</strong>
    <p>${escape(characterName(loadout.starter, loadout.form))} is the frozen first member.
    ${living ? 'Active while this leader lives.' : 'Inactive: leader defeated.'}
    No replacement leader is promoted. Only matching-element squad attacks receive this bonus.</p>`;
}

export function radiantBattleReference(loadout: RadiantLoadout, baseCost: number): string {
  return `<section class="radiant-reference info-surface">${radiantCharacterSheet(loadout, true, 'Frozen battle loadout')}
    <details class="info-lore"><summary>Frozen loadout interactions</summary>
    <p>Sparkling Convergent Light costs ${baseCost} Luminosity. Glimmering and Ultimate Convergent Light cost ${baseCost * 2}; their ranks unlock at Evo.4 and Evo.6, respectively.</p>
    <p>Stat ascension ${loadout.ascension.stats ? '×1.5 active' : 'inactive'}; weapon rank ${loadout.weaponRank}
    (${percent(.02 * loadout.weaponRank)} grown Attack). Frozen four-stat values include equipped stat Conduits;
    living squad passives, Weaken and Attack boosts apply dynamically in combat.</p>
    <p>Displayed Convergent Light coefficients include evolution, rank, saved Imbues and personal Master enhancements.
    Defense, elemental matchups, the living leader and equipped Conduits determine actual attack damage.</p>
    <p>Burn snapshots elemental matchups and the living leader's damage bonus when applied; later leader defeats do not change that snapshot.</p>
    <p>    Effects use this frozen run's gear/ranks, not current menu equipment. Gear-generated output never triggers native or further gear effects.
    Luminosity is personal to each Element-Bearer; there is no shared meter.
    Independent timed sources are retained; strongest Weaken/Exposure/Attack boost/reduction applies, rather than summing those statuses.
    Shields stack in creation order until broken. Healing and Shields round at the combat packet boundary.</p>
    </details></section>`;
}
