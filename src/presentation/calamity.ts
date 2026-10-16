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
import { enemyStrength } from './enemy-strength';
import { currencyIcon } from './currency-icon';

export function activityDifficulty(activity: CalamityActivityId, normal: string, account: Account | null): string {
  const name = calamityActivities.find(entry => entry.id === activity)?.name;
  if (!name) throw new Error('Unknown difficulty activity.');
  const prefix = `difficulty-${activity}`;
  return `<div class="activity-difficulty" data-activity-difficulty="${activity}">
    <div class="activity-difficulty-tabs" role="tablist" aria-label="${escapeDialogText(name)} difficulty">
      ${(['normal', 'calamity'] as const).map(difficulty => `<button type="button" role="tab" id="${prefix}-${difficulty}-tab"
        data-difficulty="${difficulty}" aria-selected="${difficulty === 'normal'}" aria-controls="${prefix}-${difficulty}"
        tabindex="${difficulty === 'normal' ? 0 : -1}">${difficulty === 'normal' ? 'Normal' : 'Calamity'}</button>`).join('')}
    </div>
    <div role="tabpanel" id="${prefix}-normal" aria-labelledby="${prefix}-normal-tab" data-difficulty-panel="normal">${normal}</div>
    <div role="tabpanel" id="${prefix}-calamity" aria-labelledby="${prefix}-calamity-tab" data-difficulty-panel="calamity" hidden>${calamitySection(activity, account)}</div>
  </div>`;
}

export function bindActivityDifficulties(host: HTMLElement): void {
  const bindTabs = (group: HTMLElement, tabSelector: string, panelSelector: string): void => {
    const tabs = Array.from(group.querySelectorAll<HTMLButtonElement>(tabSelector));
    const panels = Array.from(group.querySelectorAll<HTMLElement>(panelSelector));
    const select = (tab: HTMLButtonElement): void => {
      tabs.forEach(button => {
        button.setAttribute('aria-selected', String(button === tab));
        button.tabIndex = button === tab ? 0 : -1;
      });
      panels.forEach(panel => { panel.hidden = panel.id !== tab.getAttribute('aria-controls'); });
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => { select(tab); });
      tab.addEventListener('keydown', event => {
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 :
          event.key === 'ArrowRight' ? (index + 1) % tabs.length :
          event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length : null;
        if (next === null) return;
        event.preventDefault();
        select(tabs[next]);
        tabs[next].focus();
      });
    });
  };
  host.querySelectorAll<HTMLElement>('[data-activity-difficulty]').forEach(group =>
    bindTabs(group, '[data-difficulty]', '[data-difficulty-panel]'));
  host.querySelectorAll<HTMLElement>('[data-calamity-tiers]').forEach(group =>
    bindTabs(group, '[data-calamity-choice]', '[data-calamity-panel]'));
  host.querySelectorAll<HTMLImageElement>('.calamity-tier-boss').forEach(image => {
    const scene = image.closest<HTMLElement>('.calamity-tier-scene')!;
    const error = scene.querySelector<HTMLElement>('[data-calamity-art-error]')!;
    const showError = (): void => { error.hidden = false; image.hidden = true; };
    image.addEventListener('error', showError);
    image.addEventListener('load', () => { error.hidden = true; image.hidden = false; });
    if (image.complete && !image.naturalWidth) showError();
    error.querySelector('button')!.addEventListener('click', () => {
      const url = new URL(image.src, location.href);
      url.searchParams.set('retry', String(Date.now()));
      error.hidden = true;
      image.hidden = false;
      image.src = url.href;
    });
  });
}

export function calamityChestIcon(tier: CalamityTier): string {
  return `<img class="calamity-chest-art" draggable="false" src="${assetUrl(`items/${calamityChestArt[tier]}.png`)}" alt="" width="256" height="256">`;
}

export function calamityLoot(activity: CalamityActivityId, tier: CalamityTier): string {
  const chest = calamityChest(activity, tier);
  const rows = calamityLootTable(activity);
  const weight = rows.reduce((sum, row) => sum + row.weight, 0);
  return `${calamityChestIcon(tier)}<p>${escapeDialogText(chest.name)}</p><h3>Guaranteed contents</h3>
    ${calamityChestContents(activity, tier)}
    <p>Each random reward is chosen separately from this table. The same reward can appear more than once.</p>
    <table><thead><tr><th>Reward</th><th>Chance per reward</th><th>Quantity</th></tr></thead><tbody>${rows.map(row =>
    `<tr><td>${escapeDialogText(row.label)}</td><td>${Number((row.weight / weight * 100).toFixed(6))}%</td><td>${row.min}-${row.max}</td></tr>`).join('')}</tbody></table>
    <p>Open in Inventory to receive these rewards. Opening uses one chest.</p>`;
}

function calamityChestContents(activity: CalamityActivityId, tier: CalamityTier): string {
  const chest = calamityChest(activity, tier);
  return `<ul class="calamity-reward-list">
    <li><span>Prismatica</span><strong>${chest.fractalis.toLocaleString('en-US')}</strong></li>
    <li><span>Null-Prismatica</span><strong>${chest.lycalis}</strong></li>
    <li><span class="currency-reward">${currencyIcon('calamitic-tokens')}Calamitic Tokens</span><strong>${chest.calamiticTokens}</strong></li>
    ${chest.masterChests ? `<li><span>Cosmic Grand Master Chests</span><strong>${chest.masterChests}</strong></li>` : ''}
    <li><span>Random rewards</span><strong>${chest.bundles}</strong></li>
  </ul>`;
}

export function calamitySection(activity: CalamityActivityId, account: Account | null): string {
  const definition = calamityActivities.find(entry => entry.id === activity);
  if (!definition) throw new Error('Unknown Calamity activity.');
  const prefix = `calamity-${activity}`;
  return `<section class="calamity-section" data-calamity-tiers="${activity}" aria-label="${escapeDialogText(definition.name)} Calamity">
    <div class="calamity-heading"><div><h3>${escapeDialogText(definition.name)} · Calamity</h3>
      <p>Free entry. One sealed tier chest per victory.</p></div>
      ${information(`${prefix}-rules`, 'Calamity rules', '<p>Defeat one boss to earn one chest. Open it in Inventory to receive its contents. The boss drops nothing else. Entry is free, and losing costs nothing.</p>', 'Calamity rules')}</div>
    <div class="calamity-tier-tabs" role="tablist" aria-label="Calamity tier">
      ${([1, 2, 3] as const).map(tier => `<button type="button" role="tab" id="${prefix}-${tier}-tab" data-calamity-choice="${tier}"
        aria-controls="${prefix}-${tier}-panel" aria-selected="${tier === 1}" tabindex="${tier === 1 ? 0 : -1}">
        <strong>EX+${tier}</strong><span>Lv.${calamityEncounter(activity, tier).level}</span></button>`).join('')}
    </div>
    <div class="calamity-tiers">${([1, 2, 3] as const).map(tier => {
      const encounter = calamityEncounter(activity, tier);
      const chest = calamityChest(activity, tier);
      const access = account ? activityAccess(account, { kind: 'calamity', activity, tier }) : null;
      const art = calamityBossArt[activity];
      return `<article class="calamity-tier" role="tabpanel" id="${prefix}-${tier}-panel" data-calamity-panel="${tier}" aria-labelledby="${prefix}-${tier}-tab" ${tier === 1 ? '' : 'hidden'}>
        <div class="calamity-tier-scene">
        <img class="calamity-tier-arena" draggable="false" src="${assetUrl(`backgrounds/${calamityArenaArt[tier]}`)}" alt="" width="1456" height="816">
        ${art ? `<img class="calamity-tier-boss" draggable="false" src="${assetUrl(`enemies/${art}.png`)}" alt="${escapeDialogText(encounter.name)}" width="960" height="960">`
          : `<span class="calamity-placeholder">${escapeDialogText(encounter.name)} · Artwork pending</span>`}
        <header class="calamity-boss-heading"><h4>${escapeDialogText(encounter.name)}</h4><p>Lv.${encounter.level} · ${escapeDialogText(encounter.element)}</p></header>
        <div class="calamity-art-error" data-calamity-art-error role="alert" hidden><p>Boss image could not load.</p><button type="button">Retry image</button></div></div>
        <div class="calamity-tier-details">
        <div class="calamity-boss-description">${enemyStrength({ ...encounter, boss: true })}
          ${information(`${prefix}-${tier}-mechanics`, `${escapeDialogText(encounter.name)} · Boss abilities`, `<p>${escapeDialogText(encounter.description)}</p>`, 'Boss abilities')}</div>
        <section class="calamity-tier-reward" aria-label="Victory reward">
          <div class="calamity-chest-heading">${calamityChestIcon(tier)}<div><h5>Victory reward</h5><p>1 ${escapeDialogText(chest.name.replace(`${definition.name} `, ''))}</p><small>Open in Inventory.</small></div></div>
          ${calamityChestContents(activity, tier)}</section>
        <footer class="calamity-tier-actions">
        <button class="primary-button" data-calamity="${activity}" data-calamity-tier="${tier}" ${access?.unlocked ? '' : 'disabled'}>Enter EX+${tier}</button>
        <p class="activity-unlock-hint">${access?.unlocked ? '' : account ? escapeDialogText(access!.requirement) : 'Resolve the save error before entering.'}</p>
        ${information(`calamity-${activity}-${tier}-loot`, `${chest.name} · View Loot`, calamityLoot(activity, tier), 'View Loot')}</footer></div></article>`;
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
  const entries = [`${pattern.strike}: turn ${strikePhase}`, `${pattern.ruin}: turn ${nextPhase(pattern.ruinEvery)} (replaces the other skill)`];
  if (pattern.shieldEvery) entries.push(`Shield refresh: turn ${nextPhase(pattern.shieldEvery)}`);
  if (pattern.healEvery) entries.push(`Healing: turn ${nextPhase(pattern.healEvery)}`);
  return `<p class="calamity-cadence">Enemy turn ${round} · ${entries.map(escapeDialogText).join(' · ')}.</p>`;
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
    details: `<ul>${lines.map(line => `<li>${escapeDialogText(line)}</li>`).join('')}${
      reward.calamiticTokens ? `<li class="currency-reward">${currencyIcon('calamitic-tokens')}${reward.calamiticTokens} Calamitic Tokens</li>` : ''}</ul>`,
    accent: '#ed4545', animationLabel: 'Opening chest…', savedLabel: 'Rewards saved' };
}
