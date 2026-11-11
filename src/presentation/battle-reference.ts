import { radiantFlares, radiantMasters, radiantStarterKits, radiantAttunement, radiantAttunements,
  type RadiantLoadout, type RadiantFlareOffer } from '../content/combat-kits';
import { radiantConduitPrimitives, radiantGearAmount } from '../content/conduit-effects';
import { radiantConduitDescription } from '../content/conduit-effect-text';
export { radiantConduitDescription };
import { getConduit } from '../content/conduits';
import { getMasterConduit } from '../content/master-conduits';
import { characterName } from '../content/character-art';
import type { RadiantCombatState } from '../game/combat-engine';
import type { FlareTier } from '../game/combat-gauge';
import { escapeDialogText as escape } from './game-dialog';

const percent = (value: number): string => `${Number((value * 100).toPrecision(12))}%`;
const number = (value: number): string => String(Number(value.toPrecision(12)));
const tierNames: Record<FlareTier, string> = {
  glowing: 'Glowing Flare', lustrous: 'Lustrous Flare', eternal: 'Eternal Radiant Flare',
};
export function radiantFlareNeedsTarget(loadout: RadiantLoadout, tier: FlareTier): boolean {
  const master = loadout.masterId === null ? null : radiantMasters[loadout.masterId];
  return radiantFlares[loadout.starter][tier].target === 'one-enemy' ||
    master?.rule === 'tide-strike' || master?.rule === 'sprout-strike';
}
export function radiantFlareDescription(offer: RadiantFlareOffer): string[] {
  const lines: string[] = [];
  const enemies = offer.target === 'all-enemies' ? 'All living enemies' : 'Selected living enemy';
  if (offer.damage) lines.push(`${enemies}: direct damage at ${percent(offer.damage)} caster Attack before Defense mitigation.`);
  if (offer.burn) lines.push(`${enemies} surviving impact: Burn at ${percent(offer.burn)} caster Attack per enemy phase for ${offer.burnPhases} phases.`);
  if (offer.weaken) lines.push(`${enemies} surviving impact: ${percent(offer.weaken)} Weaken for ${offer.weakenPhases} enemy phases.`);
  if (offer.exposure) lines.push(`${enemies} surviving impact: ${percent(offer.exposure)} Exposure (increased direct damage taken) for ${offer.exposurePhases} enemy phases.`);
  if (offer.shieldDefense || offer.shieldHP)
    lines.push(`All living allies: Shield from ${percent(offer.shieldDefense)} caster Defense + ${percent(offer.shieldHP)} recipient maximum HP; persists until broken.`);
  if (offer.reduction) lines.push(`All living allies: ${percent(offer.reduction)} direct enemy damage reduction for ${offer.reductionPhases} enemy phases.`);
  if (offer.heal) lines.push(`All living allies: immediate healing at ${percent(offer.heal)} caster Recovery, capped by missing HP; no revival.`);
  if (offer.renewal) lines.push(`All living allies: Renewal at ${percent(offer.renewal)} caster Recovery at each of the next ${offer.renewalRounds} round starts.`);
  if (offer.attackBuff) lines.push(`All living allies: ${percent(offer.attackBuff)} Attack boost for ${offer.attackBuffRounds} rounds.`);
  return lines;
}
export function radiantPassiveEnhancements(loadout: RadiantLoadout): string[] {
  const passive = radiantStarterKits[loadout.starter].passive;
  const master = loadout.masterId === null ? null : radiantMasters[loadout.masterId];
  const passiveMaster = master?.rule === 'standard' && master.enhancement === 'passive';
  if (passive.rule === 'flare-cleanse' || passive.rule === 'guard-cleanse') {
    return [
      ...(loadout.ascension.skill1 ? ['Passive Imbue heals each ally whose Weaken this passive removes for 50% of caster Recovery.'] : []),
      ...(passiveMaster ? ['The Master separately heals each ally whose Weaken this passive removes for 15% of caster Recovery.'] : []),
    ];
  }
  const power = 1 + (passiveMaster ? master.magnitude : 0) + (loadout.ascension.skill1 ? .5 : 0);
  return power === 1 ? [] : [`Passive effect magnitude ×${number(power)} from the saved Passive Imbue and Master; durations do not change.`];
}
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
  const kit = radiantStarterKits[loadout.starter], attunement = radiantAttunement(loadout);
  const master = loadout.masterId === null ? null : radiantMasters[loadout.masterId];
  const signaturePower = 1 + (master?.rule === 'standard' && master.enhancement === 'signature' ? master.magnitude : 0) +
    (loadout.ascension.lastFlare ? .5 : 0);
  return `<section class="radiant-reference"><h3>Frozen loadout</h3>
    <p>${escape(attunement)}: ${Object.entries(radiantAttunements[attunement]).map(([stat, multiplier]) =>
      `${stat === 'hp' ? 'HP' : stat} ×${number(multiplier)}`).join(' · ')}.</p>
    <p>Stat ascension ${loadout.ascension.stats ? '×1.5 active' : 'inactive'}; weapon rank ${loadout.weaponRank}
    (${percent(.02 * loadout.weaponRank)} grown Attack). Frozen four-stat values above include these and equipped stat Conduits;
    leader/Weaken/Attack boosts are applied dynamically in combat.</p>
    <h3>Passive · ${escape(kit.passive.name)}</h3><p>${escape(kit.passive.description)}</p>
    ${radiantPassiveEnhancements(loadout).map(line => `<p>${escape(line)}</p>`).join('')}
    <h3>Progressive Flares</h3><p>The highest ready tier is cast automatically; spending retains personal remainder.
    Lustrous unlocks at form4; Eternal requires form6 and a full shared meter as well as two full personal layers.
    Shared threshold starts100, rises25 after each Eternal, capped200; Eternal empties it. No third personal layer.</p>
    ${(['glowing', 'lustrous', 'eternal'] as const).map(tier => {
      const offer = radiantFlares[loadout.starter][tier];
      return `<section data-radiant-reference-tier="${tier}"><h4>${tierNames[tier]} · ${escape(offer.name)}</h4>
        <p>${tier === 'glowing' || loadout.form >= (tier === 'lustrous' ? 4 : 6) ? 'Unlocked form' : 'Future form tier'} ·
        ${baseCost * (tier === 'glowing' ? 1 : 2)} personal charge${tier === 'eternal' ? ' + full shared meter' : ''}.
        ${radiantFlareNeedsTarget(loadout, tier) ? 'Select a living enemy.' : 'Uses its authored living target set.'}</p>
        <ul>${radiantFlareDescription(offer).map(line => `<li>${escape(line)}</li>`).join('')}</ul>
        ${loadout.starter === 'ember' && tier === 'eternal' ? '<p>First consumes all Infernis-owned Burns on each target, paying each remaining phase as periodic damage; surviving targets receive the new Burn after direct impact.</p>' : ''}
        ${loadout.starter === 'sprout' && tier === 'eternal' ? '<p>Also removes each living ally’s strongest Weaken, even if immediate healing restores no HP.</p>' : ''}
      </section>`;
    }).join('')}
    <p>Displayed Flare coefficients are authored baselines. Saved signature magnitude ×${number(signaturePower)}
    applies to damage, Burn, Weaken, Exposure, Shields, reduction, healing, Renewal and Attack boosts, not durations.
    Specialized Master effects below apply separately. Defense, active statuses and eligible Conduit modifiers still govern actual packets;
    these are not guaranteed final damage/healing amounts.</p>
    <h3>Personal Master</h3>${loadout.masterId === null ? '<p>No Master equipped · Equinox.</p>' :
      `<p>${escape(getMasterConduit(loadout.masterId).name)} · ${escape(master!.effect)}</p>`}
    <h3>Ordinary Conduits</h3><ol>${(loadout.gear ?? Array.from({ length: 8 }, () => null)).map((slot, index) =>
      `<li>${slot ? `<strong>Slot${index + 1} · ${escape(getConduit(slot.id).name)} · Rank${slot.rank}</strong>
        <ul>${radiantConduitPrimitives(slot).map(primitive => `<li>${escape(radiantConduitDescription(primitive))}</li>`).join('')}</ul>` :
        `Slot${index + 1} · Empty`}</li>`).join('')}</ol>
    <p>Effects use this frozen run's gear/ranks, not current menu equipment. Rank magnitudes scale ×(1 +0.1×rank).
    Gear-generated output never triggers native or further gear effects. Charge respects personal/shared caps.
    Independent timed sources are retained; strongest Weaken/Exposure/Attack boost/reduction applies, rather than summing those statuses.
    Shields stack in creation order until broken. Healing and Shields round at the combat packet boundary.</p></section>`;
}
