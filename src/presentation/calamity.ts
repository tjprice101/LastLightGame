import { calamityActivities, calamityChest, calamityEncounter, calamityLootTable, calamityPatterns, calamityWarning,
  parseCalamityChestId, isCalamityActivityId, isCalamityTier, type CalamityActivityId, type CalamityTier } from '../content/calamity';
import { type Account, type openCalamityChest } from '../game/account';
import { activityAccess, assertActivityAccess } from '../game/activity-access';
import { information } from './information';
import { imageSource, rarityPalette } from './bubble-ui';
import { escapeDialogText, gameConfirm, gameDialogPending } from './game-dialog';
import { materialArt, materialName, materialRarity } from '../content/dungeon-art';
import { getConduit, isConduitId } from '../content/conduits';
import { type RewardPresentation } from './reward-screen';
import { calamityBossArt, calamityChestArt, calamityArenaArt } from '../content/calamity-art';
import { assetUrl } from './portrait';
import { pngFallback } from './image-format';
import './calamity.css';
import { enemyStrength } from './enemy-strength';
import { currencyIcon } from './currency-icon';
import { conduitIcon } from './conduit-store';
import { conduitElement } from './conduit-element';
import { masterChestIcon } from './master-conduits';
import { getCreature } from '../content/creatures';
import { type Rarity } from '../content/rarity';

function devourerReward(creatureId: string) {
  const creature = getCreature(creatureId);
  return { name: `${creature.name} · Omnic · Lv.60`, art: creature.art
    ? `<img src="${assetUrl(`enemies/${creature.art}.png`)}" alt="" width="80" height="80">`
    : '<span class="art-pending">Artwork pending</span>' };
}

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
    const showError = (): void => {
      const fallback = pngFallback(image.getAttribute('src') ?? '');
      if (fallback) { image.src = fallback; return; }
      error.hidden = false; image.hidden = true;
    };
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
  return `<div class="calamity-loot">
    <div class="calamity-loot-hero">${calamityChestIcon(tier)}<div>
      <p class="calamity-loot-eyebrow">Calamity rewards / EX+${tier}</p>
      <h3>${escapeDialogText(chest.name)}</h3>
      <p>Every chest includes guaranteed contents and ${chest.bundles} additional random rewards.</p>
    </div></div>
    <div class="calamity-loot-columns">
      <section class="calamity-loot-panel calamity-loot-guarantees" aria-label="Guaranteed contents">
        <header><p class="calamity-loot-eyebrow">Included in every chest</p><h4>Guaranteed contents</h4></header>
        ${calamityChestContents(activity, tier)}
      </section>
      <section class="calamity-loot-panel calamity-loot-random" aria-label="Random reward pool">
        <header><p class="calamity-loot-eyebrow">${chest.bundles} independent selections</p><h4>Random reward pool</h4></header>
        <p>Random rewards roll separately and can repeat, except Conduits.</p>
        <table><caption>Chance and quantity for each random reward</caption>
          <thead><tr><th scope="col">Reward</th><th scope="col">Chance per reward</th><th scope="col">Quantity</th></tr></thead><tbody>${rows.map(row =>
          `<tr><th scope="row">${escapeDialogText(row.label)}</th><td>${Number((row.weight / weight * 100).toFixed(6))}%</td><td>${row.min.toLocaleString('en-US')}-${row.max.toLocaleString('en-US')}</td></tr>`).join('')}</tbody></table>
        ${chest.componentRange ? `<aside class="calamity-loot-rules"><h5>Conduit selection &amp; duplicate conversion</h5><ul><li>Conduits are chosen equally from unowned names in the rolled rarity. No duplicates within a chest.</li><li>Rarity chances stay fixed; listed per-Conduit chances assume none are owned.</li><li>Fully owned rarity: ${chest.componentRange.min.toLocaleString('en-US')}-${chest.componentRange.max.toLocaleString('en-US')} extra Broken Mechanical Components instead.</li><li>Component bonuses add to the guaranteed amount.</li></ul></aside>` : ''}
      </section>
    </div>
  </div>`;
}

function calamityChestContents(activity: CalamityActivityId, tier: CalamityTier): string {
  const chest = calamityChest(activity, tier);
  return `<ul class="calamity-reward-list">
    <li><span>Prismatica</span><strong>${chest.fractalis.toLocaleString('en-US')}</strong></li>
    <li><span>Null-Prismatica</span><strong>${chest.lycalis}</strong></li>
    <li><span class="currency-reward">${currencyIcon('calamitic-tokens')}Calamitic Tokens</span><strong>${chest.calamiticTokens}</strong></li>
    ${chest.masterChests ? `<li><span>Machine's Master Chests</span><strong>${chest.masterChests}</strong></li>` : ''}
    ${chest.devourerCopies ? `<li><span>${escapeDialogText(devourerReward(chest.devourerCopies.creatureId).name)}</span><strong>${chest.devourerCopies.amount}</strong></li>` : ''}
    ${chest.componentRange ? `<li><span>Broken Mechanical Components</span><strong>${chest.componentRange.min.toLocaleString('en-US')}-${chest.componentRange.max.toLocaleString('en-US')}</strong></li>` : ''}
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
      ${information(`${prefix}-rules`, 'Calamity rules', '<p>One boss, one chest, no other drops. Open the chest in Inventory. Entry and retries are free.</p>', 'Calamity rules')}</div>
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
        ${information(`calamity-${activity}-${tier}-loot`, 'Calamity chest · View Loot', calamityLoot(activity, tier), 'View Loot')}</footer></div></article>`;
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
  const items: { label: string; art: string; chest?: boolean; badge?: string; rarity?: Rarity }[] = [
    ...(reward.fractalis ? [{ label: `${reward.fractalis} Prismatica`, art: currencyIcon('fractalis') }] : []),
    ...(reward.lycalis ? [{ label: `${reward.lycalis} Null-Prismatica`, art: currencyIcon('lycalis') }] : []),
    ...Object.entries(reward.materials).map(([material, amount]) => {
      const art = materialArt(material);
      return { label: `${amount} ${materialName(material)}`, rarity: materialRarity(material), art: art
        ? `<img src="${assetUrl(`materials/${art}.png`)}" alt="" width="80" height="80">`
        : '<span class="art-pending">Artwork pending</span>' };
    }),
    ...Object.entries(reward.conduits).map(([conduit, amount]) => {
      if (!isConduitId(conduit)) throw new Error('Unknown Conduit in chest receipt.');
      return { label: `${amount} ${getConduit(conduit).name}`, rarity: getConduit(conduit).rarity, art: conduitIcon(conduit), badge: conduitElement(conduit) };
    }),
    ...(reward.mechanicalComponents ? [{ label: `${reward.mechanicalComponents} Broken Mechanical Components`, art: currencyIcon('mechanical-components') }] : []),
    ...(reward.masterChests ? [{ label: `${reward.masterChests} Machine's Master Chests`, rarity: 'Omnic' as const, art: masterChestIcon(), chest: true }] : []),
    ...(reward.devourerCopies ? [{ label: `${reward.devourerCopies.amount} ${devourerReward(reward.devourerCopies.creatureId).name}`, rarity: 'Omnic' as const, art: devourerReward(reward.devourerCopies.creatureId).art }]
      : reward.roseliusCopies ? [{ label: `${reward.roseliusCopies} ${devourerReward('infusion:roses:5').name}`, rarity: 'Omnic' as const, art: devourerReward('infusion:roses:5').art }] : []),
    ...(reward.calamiticTokens ? [{ label: `${reward.calamiticTokens} Calamitic Tokens`, rarity: 'Calamitic' as const, art: currencyIcon('calamitic-tokens') }] : []),
  ];
  return { cinematic: { kind: 'chest', eyebrow: 'Calamity chest', title: chest.name, subtitle: `${items.length} reward${items.length === 1 ? '' : 's'}`, art: imageSource(calamityChestIcon(tier)), tier: 'prismatic', palette: rarityPalette('Calamitic') },
    celebration: 'Rewards saved',
    title: 'Calamity chest opened', name: chest.name,
    art: `<ul class="summon-ten-grid calamity-reward-grid" aria-label="Received loot">${items.map(item =>
      `<li${item.rarity ? ` data-rarity="${item.rarity}"` : ''} class="summon-ten-result${item.chest ? ' chest-reward-result' : ''}"><div class="summon-ten-art">${item.art}</div><b>${escapeDialogText(item.label)}</b>${item.badge ?? ''}</li>`).join('')}</ul>`,
    details: '<p>Rewards added to Inventory.</p>',
    rarity: 'Calamitic', accent: '#ed4545', animationLabel: 'Opening chest…', savedLabel: 'Rewards saved' };
}
