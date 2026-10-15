import { calamityActivities, calamityChest, calamityEncounter, calamityLootTable, calamityPatterns, calamityWarning,
  parseCalamityChestId, isCalamityActivityId, isCalamityTier, type CalamityActivityId, type CalamityTier } from '../content/calamity';
import { type Account, type openCalamityChest } from '../game/account';
import { activityAccess, assertActivityAccess } from '../game/activity-access';
import { information } from './information';
import { escapeDialogText, gameConfirm, gameDialogPending } from './game-dialog';
import { materialName } from '../content/dungeon-art';
import { getConduit, isConduitId } from '../content/conduits';
import { type RewardPresentation } from './reward-screen';
import { calamityBossArt, calamityChestArt, calamityArenaArt } from '../content/calamity-art';
import { assetUrl } from './portrait';
import './calamity.css';

export function calamityChestIcon(tier: CalamityTier): string {
  return `<img class="calamity-chest-art" draggable="false" src="${assetUrl(`items/${calamityChestArt[tier]}.png`)}" alt="" width="256" height="256">`;
}

export function calamityLoot(activity: CalamityActivityId, tier: CalamityTier): string {
  const chest = calamityChest(activity, tier);
  const rows = calamityLootTable(activity);
  const weight = rows.reduce((sum, row) => sum + row.weight, 0);
  return `${calamityChestIcon(tier)}<p>${escapeDialogText(chest.name)}</p><h3>Fixed contents</h3>
    <p>${chest.fractalis} Prismatica · ${chest.lycalis} Null-Prismatica · ${chest.masterChests} Cosmic Grand Master Chests</p>
    <p>${chest.bundles} independent weighted bundle rolls. Quantities below are per bundle.</p>
    <table><thead><tr><th>Bundle</th><th>Weight</th><th>Chance per roll</th><th>Quantity</th></tr></thead><tbody>${rows.map(row =>
    `<tr><td>${escapeDialogText(row.label)}</td><td>${row.weight}</td><td>${Number((row.weight / weight * 100).toFixed(6))}%</td><td>${row.min}-${row.max}</td></tr>`).join('')}</tbody></table>
    <p>Opening consumes one chest and saves its actual contents once. Repeated bundles combine. No captures or recruitment.</p>`;
}

export function calamitySection(activity: CalamityActivityId, account: Account | null): string {
  const definition = calamityActivities.find(entry => entry.id === activity);
  if (!definition) throw new Error('Unknown Calamity activity.');
  return `<section class="calamity-section" aria-label="${escapeDialogText(definition.name)} Calamity">
    <h3>Calamity</h3><p>One boss per tier. No entry cost. A victory saves one sealed chest; open it explicitly in Inventory.</p>
    <div class="calamity-tiers">${([1, 2, 3] as const).map(tier => {
      const encounter = calamityEncounter(activity, tier);
      const chest = calamityChest(activity, tier);
      const access = account ? activityAccess(account, { kind: 'calamity', activity, tier }) : null;
      const art = calamityBossArt[activity];
      return `<article class="calamity-tier"><div class="calamity-tier-scene">
        <img class="calamity-tier-arena" draggable="false" src="${assetUrl(`backgrounds/${calamityArenaArt[tier]}`)}" alt="" width="1456" height="816">
        ${art ? `<img class="calamity-tier-boss" draggable="false" src="${assetUrl(`enemies/${art}.png`)}" alt="${escapeDialogText(encounter.name)}" width="960" height="960">`
          : `<span class="calamity-placeholder">${escapeDialogText(encounter.name)} · Artwork pending</span>`}</div>
        <h4>EX+${tier} · ${escapeDialogText(encounter.name)}</h4><p>Lv.${encounter.level} · ${escapeDialogText(encounter.element)}</p>
        <p>${escapeDialogText(encounter.description)}</p><p>Victory: 1 ${escapeDialogText(chest.name)}</p>
        ${calamityChestIcon(tier)}
        <button class="primary-button" data-calamity="${activity}" data-calamity-tier="${tier}" ${access?.unlocked ? '' : 'disabled'}>Enter EX+${tier}</button>
        ${access?.unlocked ? '' : `<p class="activity-unlock-hint">${account ? escapeDialogText(access!.requirement) : 'Resolve the save error before entering.'}</p>`}
        ${information(`calamity-${activity}-${tier}-loot`, `${chest.name} · View Loot`, calamityLoot(activity, tier), 'View Loot')}</article>`;
    }).join('')}</div></section>`;
}

export async function confirmCalamity(activity: CalamityActivityId, tier: CalamityTier): Promise<boolean> {
  return gameConfirm(calamityWarning(activity, tier), { title: `Calamity EX+${tier} warning`, confirmLabel: `Enter EX+${tier}` });
}

export function bindCalamityEntries(host: HTMLElement, account: () => Account,
  enter: (activity: CalamityActivityId, tier: CalamityTier) => Promise<void>,
  blocked: () => boolean, reportError: (error: unknown) => void): void {
  host.querySelectorAll<HTMLButtonElement>('[data-calamity]').forEach(button => button.addEventListener('click', async () => {
    if (gameDialogPending() || blocked()) return;
    try {
      const activity = button.dataset.calamity;
      const tier = Number(button.dataset.calamityTier);
      if (!isCalamityActivityId(activity) || !isCalamityTier(tier)) throw new Error('Unknown Calamity tier.');
      assertActivityAccess(account(), { kind: 'calamity', activity, tier });
      if (!await confirmCalamity(activity, tier)) return;
      await enter(activity, tier);
    } catch (error) {
      console.error('Calamity entry rejected', error);
      reportError(error);
    }
  }));
}

export function calamityCadence(activity: CalamityActivityId, round: number): string {
  const pattern = calamityPatterns[activity];
  const nextPhase = (every: number): number => round + (every - round % every) % every;
  let strikePhase = nextPhase(pattern.every);
  while (strikePhase % pattern.ruinEvery === 0) strikePhase += pattern.every;
  const entries = [`${pattern.strike}: phase ${strikePhase}`, `${pattern.ruin}: phase ${nextPhase(pattern.ruinEvery)} (replaces the ordinary strike)`];
  if (pattern.shieldEvery) entries.push(`Barrier refresh: phase ${nextPhase(pattern.shieldEvery)}`);
  if (pattern.healEvery) entries.push(`Restoration: phase ${nextPhase(pattern.healEvery)}`);
  return `<p class="calamity-cadence">Authored cadence · Current enemy phase ${round} · ${entries.map(escapeDialogText).join(' · ')}.</p>`;
}

export function calamityOpeningReward(id: string, reward: ReturnType<typeof openCalamityChest>['reward']): RewardPresentation {
  const { activity, tier } = parseCalamityChestId(id);
  const chest = calamityChest(activity, tier);
  const lines = [
    ...(reward.fractalis ? [`${reward.fractalis} Prismatica`] : []),
    ...(reward.lycalis ? [`${reward.lycalis} Null-Prismatica`] : []),
    ...Object.entries(reward.materials).map(([material, amount]) => `${amount} ${materialName(material)}`),
    ...Object.entries(reward.conduits).map(([conduit, amount]) => {
      if (!isConduitId(conduit)) throw new Error('Unknown Conduit in chest receipt.');
      return `${amount} ${getConduit(conduit).name}`;
    }),
    ...(reward.mechanicalComponents ? [`${reward.mechanicalComponents} Broken Mechanical Components`] : []),
    ...(reward.masterChests ? [`${reward.masterChests} Cosmic Grand Master Chests`] : []),
  ];
  return { title: 'Calamity chest opened', name: chest.name, art: calamityChestIcon(tier),
    details: `<ul>${lines.map(line => `<li>${escapeDialogText(line)}</li>`).join('')}</ul><p>These contents are already saved. No equipment was changed.</p>`,
    accent: '#ed4545', animationLabel: 'Opening your saved chest reward…', savedLabel: 'Chest contents saved' };
}
