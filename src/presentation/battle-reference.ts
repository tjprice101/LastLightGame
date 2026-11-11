import { radiantMasters, radiantStarterKits, type RadiantLoadout } from '../content/combat-kits';
import { radiantGearAmount } from '../content/conduit-effects';
import { characterName } from '../content/character-art';
import type { RadiantCombatState } from '../game/combat-engine';
import { radiantCharacterSheet } from './character-combat';
import { escapeDialogText as escape } from './game-dialog';

export { radiantConduitDescription } from '../content/conduit-effect-text';
export { radiantFlareDescription, radiantFlareNeedsTarget, radiantPassiveEnhancements } from './combat-description';

const percent = (value: number): string => `${Number((value * 100).toPrecision(12))}%`;
const number = (value: number): string => String(Number(value.toPrecision(12)));

export function radiantLeaderReference(state: RadiantCombatState, living = state.bearers[0].hp > 0): string {
  const leader = state.bearers[0], loadout = leader.loadout, kit = radiantStarterKits[loadout.starter];
  const master = loadout.masterId === null ? null : radiantMasters[loadout.masterId];
  const amount = kit.leaderBonus * (loadout.ascension.skill2 ? 1.5 : 1) +
    (master?.enhancement === 'leader' ? master.magnitude : 0) + radiantGearAmount(loadout.gear, 'leader');
  return `<strong>${escape(kit.leader)} · ${percent(amount)} ${kit.leaderStat === 'hp' ? 'HP' : kit.leaderStat}</strong>
    <p>${escape(characterName(loadout.starter, loadout.form))} is the frozen first member.
    ${living ? 'Active while this leader lives.' : 'Inactive: leader defeated.'}
    No replacement leader is promoted. This multiplies the effective combat stat; it does not grant or restore HP.</p>`;
}

export function radiantBattleReference(loadout: RadiantLoadout, baseCost: number): string {
  const master = loadout.masterId === null ? null : radiantMasters[loadout.masterId];
  const signaturePower = 1 + (master?.rule === 'standard' && master.enhancement === 'signature' ? master.magnitude : 0) +
    (loadout.ascension.lastFlare ? .5 : 0);
  return `<section class="radiant-reference info-surface">${radiantCharacterSheet(loadout, true, 'Frozen battle loadout')}
    <details class="info-lore"><summary>Frozen loadout interactions</summary>
    <p>Personal base cost: ${baseCost} charge. ${loadout.form < 4 ? 'Future form tier: Lustrous unlocks at form4.' : ''} ${loadout.form < 6 ? 'Future form tier: Eternal unlocks at form6.' : ''}</p>
    <p>Stat ascension ${loadout.ascension.stats ? '×1.5 active' : 'inactive'}; weapon rank ${loadout.weaponRank}
    (${percent(.02 * loadout.weaponRank)} grown Attack). Frozen four-stat values include equipped stat Conduits;
    leader, Weaken and Attack boosts apply dynamically in combat.</p>
    <p>Displayed Flare coefficients are authored baselines. Saved signature magnitude ×${number(signaturePower)}
    applies to damage, Burn, Weaken, Exposure, Shields, reduction, healing, Renewal and Attack boosts, not durations.
    Specialized Master effects apply separately. Defense, active statuses and eligible Conduit modifiers govern actual packets;
    these are not guaranteed final damage/healing amounts.</p>
    <p>Effects use this frozen run's gear/ranks, not current menu equipment. Rank magnitudes scale ×(1 +0.1×rank).
    Gear-generated output never triggers native or further gear effects. Charge respects personal/shared caps.
    Independent timed sources are retained; strongest Weaken/Exposure/Attack boost/reduction applies, rather than summing those statuses.
    Shields stack in creation order until broken. Healing and Shields round at the combat packet boundary.</p>
    ${loadout.starter === 'sprout' && loadout.form >= 1 ? '<p>Eternal removes each living ally’s strongest Weaken even if immediate healing restores no HP.</p>' : ''}
    </details></section>`;
}
