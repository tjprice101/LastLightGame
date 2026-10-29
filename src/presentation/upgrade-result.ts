import { formatStat, resolveFighter } from '../content/combat';
import { isStarterId } from '../content/starters';
import { type Account, ownedProgress } from '../game/account';
import { resolveCapturedFighter } from '../game/character-instances';
import { ownedCompanion } from './owned-companion';
import { escapeDialogText } from './game-dialog';
import { presentReward, type RewardPresentation } from './reward-screen';
import { statChange, statDirection } from './stat-change';
import { type UpgradeKind } from './upgrade-celebration';
import './upgrade-result.css';
import { evolutionTier, imageSource, rarityTier } from './bubble-ui';
import { phaseZeroStatsReady, statDisplayUnit, type ResolvedStats } from '../content/phase-zero-stats';
import { displayStatKeys, displayStatLabels } from './stat-preview';

function stats(account: Account, id: string) {
  const equipment = account.conduitEquipment?.[id];
  if (isStarterId(id)) {
    if (!account.characters[id]) throw new Error('Upgrade result requires an owned Element-Bearer.');
    return resolveFighter(id, ownedProgress(account, id), equipment, account.conduitUpgrades, account.masterEquipment?.[id] ?? undefined).stats;
  }
  const copy = account.capturedCharacters?.find(entry => entry.instanceId === id);
  if (!copy) throw new Error('Upgrade result requires the saved captured copy.');
  return resolveCapturedFighter(copy, equipment, account.conduitUpgrades).stats;
}

const labels = { ...displayStatLabels, ...(phaseZeroStatsReady ? {} : {
  crit: 'Critical rate', critMultiplier: 'Critical multiplier',
  shatterCapacity: 'Elemental Gauge capacity', elementalDamage: 'Elemental damage',
}) };

function statMarkup(from: ResolvedStats, to: ResolvedStats): string {
  const keys = displayStatKeys;
  const changed = keys.filter(stat => to[stat] !== from[stat]);
  const unchanged = keys.filter(stat => to[stat] === from[stat]);
  const rows = changed.map((stat, index) => {
    const unit = statDisplayUnit(stat);
    const delta = (to[stat] - from[stat]) * (unit === '%' ? 100 : 1);
    const amount = formatStat(delta) === '0' ? String(Number(delta.toPrecision(3))) : formatStat(delta);
    return `<article class="upgrade-result-stat" style="--stat-delay:${index * 70}ms"><small>${labels[stat]}</small>
      <strong>${statChange(from[stat], to[stat], unit)}</strong>
      <span class="stat-change stat-change--${statDirection(from[stat], to[stat])}">${delta > 0 ? '+' : ''}${amount}${unit}</span></article>`;
  }).join('');
  const rest = unchanged.map(stat => {
    const unit = statDisplayUnit(stat);
    return `<li><span>${labels[stat]}</span> <b>${formatStat(unit === '%' ? to[stat] * 100 : to[stat])}${unit}</b></li>`;
  }).join('');
  return `${rows ? `<div class="upgrade-result-stats">${rows}</div>` : '<p class="upgrade-result-none">No stat changes.</p>'}
    ${rest ? `<div class="upgrade-result-unchanged"><span class="stat-change stat-change--unchanged">Unchanged</span><ul>${rest}</ul></div>` : ''}`;
}

export function upgradeResult(before: Account, after: Account, id: string, kind: UpgradeKind): RewardPresentation {
  const previous = ownedCompanion(before, id);
  const current = ownedCompanion(after, id);
  const from = stats(before, id);
  const to = stats(after, id);
  const levelChange = `Level ${previous.level} → ${current.level}`;
  const evolutionChange = kind === 'evolve' && isStarterId(id)
    ? ` · Evolution ${ownedProgress(before, id).evolution} → ${ownedProgress(after, id).evolution}` : '';
  const evolved = kind === 'evolve' && isStarterId(id);
  const fromForm = evolved ? ownedProgress(before, id).evolution : 0;
  const toForm = evolved ? ownedProgress(after, id).evolution : 0;
  return {
    cinematic: evolved ? {
      kind: 'evolution', eyebrow: `Form ${fromForm} \u2192 ${toForm}`, title: 'Evolution', subtitle: current.label,
      fromArt: imageSource(previous.art), art: imageSource(current.art), tier: evolutionTier(toForm),
    } : {
      kind: 'level', eyebrow: 'Level up', title: `Lv.${previous.level} \u2192 ${current.level}`, subtitle: current.label,
      art: imageSource(current.art), tier: rarityTier(current.rarity),
    },
    celebration: evolved ? 'Evolution complete' : 'Growth complete',
    title: kind === 'evolve' ? 'Evolution complete' : 'Level up!',
    name: current.label,
    accent: current.color,
    rarity: current.rarity,
    animationLabel: kind === 'evolve' ? 'A new form awakens' : 'Growing stronger',
    savedLabel: 'Upgrade saved',
    art: `<div class="upgrade-result-portrait">${current.art}</div>`,
    details: `<div class="upgrade-result-identity">
      <p class="upgrade-result-progress"><span class="upgrade-result-level">${escapeDialogText(levelChange + evolutionChange)}</span></p>
      ${current.rating}</div>
      <h4>Stat changes</h4>${statMarkup(from, to)}`,
  };
}

export async function presentUpgrade(before: Account, after: Account, id: string, kind: UpgradeKind): Promise<void> {
  await presentReward(upgradeResult(before, after, id, kind));
}
