import { conduits, getConduit, isConduitId, conduitEffect, conduitUpgradeCap, conduitUpgradeCost, conduitUpgradeCosts, conduitUpgradeRarityMultipliers, type ConduitId } from '../content/conduits';
import { upgradeConduit, type Account } from '../game/account';
import { type ProfileStorage } from '../game/profile';
import { conduitIcon, conduitRarity } from './conduit-store';
import { mechanicalComponentIcon } from './mechanical-component-icon';
import { information } from './information';
import './conduit-upgrade.css';
import { machineComponentRulesText } from '../content/mechanical-components';
import { gameConfirm } from './game-dialog';
import { presentReward } from './reward-screen';
import { conduitReward } from './conduit-presentation';

export function conduitUpgradeMenu(account: Account | null, selected?: string): string {
  const owned = conduits.filter((conduit) => (account?.conduits?.[conduit.id] ?? 0) > 0);
  const choice = owned.find(entry => entry.id === selected) ?? owned[0];
  const costInformation = Object.entries(conduitUpgradeRarityMultipliers).map(([rarity, multiplier]) =>
    `<p>${rarity}: ${conduitUpgradeCosts.map((cost) => cost * multiplier).join(' / ')} components for +1 through +5.</p>`).join('');
  return `<section class="conduit-upgrade-menu ref-screen ref-conduit-upgrade">
    <nav class="ref-market-tabs"><button aria-current="page">Conduit Upgrade</button><button data-page="conduit-store">Conduit Store →</button></nav>
    <aside class="ref-panel"><header class="ref-panel-heading">Owned · ${owned.length}</header><div class="ref-scroll">${owned.map(conduit => `<button class="ref-member-row ${conduit.id === choice?.id ? 'is-selected' : ''}" data-select-upgrade-conduit="${conduit.id}"><span class="ref-thumb">${conduitIcon(conduit.id, account?.conduitUpgrades?.[conduit.id])}</span><span><b>${conduit.name}</b><small>${conduit.rarity} · +${account?.conduitUpgrades?.[conduit.id] ?? 0} / ${conduitUpgradeCap}</small></span></button>`).join('')}</div></aside>
    ${account && choice ? (() => {
      const level = account.conduitUpgrades?.[choice.id] ?? 0;
      const cost = conduitUpgradeCost(choice, level);
      const affordable = cost !== null && (account.mechanicalComponents ?? 0) >= cost;
      return `<section class="ref-panel ref-upgrade-detail" data-upgrade-card="${choice.id}"><header class="ref-panel-heading">Selected Conduit</header><div class="ref-upgrade-identity"><div class="ref-store-hero">${conduitIcon(choice.id, level)}</div><div><h2>${choice.name}</h2>${conduitRarity(choice.id)}<p>Upgrade +${level} / ${conduitUpgradeCap} · Owned ${account.conduits?.[choice.id]}</p><div class="ref-pips">${Array.from({ length: conduitUpgradeCap }, (_, index) => `<i class="${index < level ? 'is-filled' : ''}"></i>`).join('')}</div><section class="conduit-upgrade-values"><h4>Current</h4><p>${conduitEffect(choice, level)}</p>${cost !== null ? `<h4>Next · +${level + 1}</h4><p>${conduitEffect(choice, level + 1)}</p>` : '<p>Maximum upgrade reached.</p>'}</section></div></div><header class="ref-panel-heading">Effect by upgrade</header><div class="ref-scroll ref-effect-progression">${Array.from({ length: conduitUpgradeCap + 1 }, (_, upgrade) => `<article class="${upgrade === level ? 'is-current' : ''}"><small>+${upgrade}</small><p>${conduitEffect(choice, upgrade)}</p></article>`).join('')}</div></section>
      <aside class="ref-panel ref-upgrade-resources"><header class="ref-panel-heading">Required resources</header><article class="component-balance">${mechanicalComponentIcon()}<div><strong id="mechanical-components-balance">${account.mechanicalComponents ?? 0}</strong><span>Broken Mechanical Components</span></div></article>
      <p class="conduit-upgrade-cost">${cost === null ? 'No further upgrades' : `${cost} Broken Mechanical Components required`}</p>${cost === null ? '<p>Maximum upgrade reached.</p>' : `<meter min="0" max="${cost}" value="${Math.min(account.mechanicalComponents ?? 0, cost)}" aria-label="Components towards upgrade"></meter>`}
      <footer><button class="primary-button" type="button" data-upgrade-conduit="${choice.id}" data-expected-upgrade="${level}" ${affordable ? '' : 'disabled'}>${cost === null ? 'Maximum upgrade +5' : `Upgrade to +${level + 1} · ${cost} components`}</button>
      ${cost !== null && !affordable ? '<p class="quiet">Not enough Broken Mechanical Components.</p>' : ''}<button class="ref-link" data-page="gameplay" data-machine-activity>Earn components →</button></footer></aside>`;
    })() : `<section class="ref-panel ref-empty"><p ${account ? '' : 'role="alert"'}>${account ? 'No owned Conduits to upgrade.' : 'Conduit upgrades unavailable. Resolve the save error.'}</p><button class="ref-link" data-page="conduit-store">Open Conduit Store →</button></section>`}
    <div class="ref-upgrade-information">
    ${information('conduit-upgrade-information', 'Conduit upgrades', `<p>Each owned Conduit name can be upgraded five times account-wide. All characters sharing that name benefit; copies are not consumed. Each upgrade adds 50% of its original stat modifiers, reaching 3.5 times their original values at +5 (+250%). Legendary penalties grow too; Omnic special mechanics do not change. Critical Rate can exceed 100%: every hit then crits, and each point above 100% is the chance for an Elemental Crit (1.5 times normal critical damage).</p><p>Only Broken Mechanical Components are spent. Costs increase with rarity; Omnic restoration is a long-term goal.</p>${costInformation}<p>Components drop only from defeated machines, independently of other rewards. ${machineComponentRulesText} No clear bonus or exchange.</p><p>Current and next values include drawbacks. Ongoing battles keep the upgrade levels snapshotted at entry; new runs use current upgrades.</p>`)}
    <p id="conduit-upgrade-result" role="status" tabindex="-1"></p>
  </div></section>`;
}

export function bindConduitUpgrades(host: HTMLElement, storage: ProfileStorage,
  refresh: (account: Account) => void, reportError: (message: string) => void,
  performUpgrade?: (id: ConduitId, level: number) => Promise<Account>): void {
  let pending = false;
  host.querySelectorAll<HTMLButtonElement>('[data-upgrade-conduit]').forEach((button) => {
    button.addEventListener('click', async () => {
      let saved = false;
      try {
        if (button.disabled || pending) return;
        pending = true;
        const id = button.dataset.upgradeConduit;
        if (!isConduitId(id)) throw new Error('Unknown Conduit.');
        const level = Number(button.dataset.expectedUpgrade);
        const conduit = getConduit(id);
        const cost = conduitUpgradeCost(conduit, level);
        if (cost === null) throw new Error('This Conduit is already fully upgraded.');
        if (!await gameConfirm(`Spend ${cost} Broken Mechanical Components to upgrade ${conduit.name} from +${level} to +${level + 1} account-wide? Current: ${conduitEffect(conduit, level)}. Next: ${conduitEffect(conduit, level + 1)}. Penalties also grow. No copies or other currency are spent.`, { title: 'Upgrade Conduit', confirmLabel: 'Upgrade' })) return;
        const account = performUpgrade ? await performUpgrade(id, level) : upgradeConduit(storage, id, level);
        saved = true;
        refresh(account);
        const status = host.querySelector<HTMLElement>('#conduit-upgrade-result');
        if (!status) throw new Error('Conduit upgrade status is missing.');
        status.textContent = `${conduit.name} upgraded to +${level + 1}. ${cost} Broken Mechanical Components spent. Applies account-wide to new runs.`;
        await presentReward(conduitReward(id, account, 'Conduit upgraded', `${cost} Broken Mechanical Components spent`));
        const next = host.querySelector<HTMLButtonElement>(`[data-upgrade-conduit="${id}"]`);
        if (next && !next.disabled) next.focus({ preventScroll: true });
        else status.focus({ preventScroll: true });
      } catch (error) {
        console.error('Conduit upgrade rejected', error);
        reportError(`${saved ? 'Conduit upgrade is saved, but its presentation could not complete.' : 'Conduit upgrade was not completed.'} ${error instanceof Error ? error.message : String(error)}`);
      } finally { pending = false; }
    });
  });
}

export function updateConduitUpgradeMenu(host: HTMLElement, account: Account | null, selected?: string): void {
  const current = host.querySelector<HTMLElement>('.ref-conduit-upgrade');
  if (!current) throw new Error('Conduit Upgrade is missing.');
  const template = document.createElement('template');
  template.innerHTML = conduitUpgradeMenu(account, selected);
  const next = template.content;
  const chosen = next.querySelector<HTMLElement>('[data-upgrade-card]')?.dataset.upgradeCard;
  current.querySelectorAll<HTMLButtonElement>('[data-select-upgrade-conduit]').forEach(button => {
    const id = button.dataset.selectUpgradeConduit;
    button.classList.toggle('is-selected', id === chosen);
    button.setAttribute('aria-pressed', String(id === chosen));
    if (isConduitId(id)) {
      const small = button.querySelector('small');
      const level = account?.conduitUpgrades?.[id] ?? 0;
      if (small) small.textContent = `${getConduit(id).rarity} · +${level} / ${conduitUpgradeCap}`;
      const icon = button.querySelector<HTMLElement>('.conduit-icon-frame');
      if (icon && icon.dataset.conduitUpgrade !== String(level)) {
        const thumb = button.querySelector('.ref-thumb');
        if (thumb) thumb.innerHTML = conduitIcon(id, level);
      }
    }
  });
  for (const selector of ['.ref-upgrade-detail', '.ref-upgrade-resources']) {
    const panel = current.querySelector<HTMLElement>(selector);
    const updated = next.querySelector<HTMLElement>(selector);
    if (!panel || !updated) throw new Error('Conduit Upgrade panels are missing.');
    const scroll = panel.querySelector<HTMLElement>('.ref-scroll')?.scrollTop ?? 0;
    const earnComponents = panel.querySelector('[data-machine-activity]');
    panel.replaceChildren(...Array.from(updated.childNodes));
    if (earnComponents) panel.querySelector('[data-machine-activity]')?.replaceWith(earnComponents);
    if (updated.dataset.upgradeCard) panel.dataset.upgradeCard = updated.dataset.upgradeCard;
    const scroller = panel.querySelector<HTMLElement>('.ref-scroll');
    if (scroller) scroller.scrollTop = scroll;
  }
}
