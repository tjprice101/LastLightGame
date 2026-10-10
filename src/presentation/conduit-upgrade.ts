import { conduits, getConduit, isConduitId, conduitEffect, conduitUpgradeCap, conduitUpgradeCost, conduitUpgradeCosts, conduitUpgradeRarityMultipliers } from '../content/conduits';
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

export function conduitUpgradeMenu(account: Account | null): string {
  const owned = conduits.filter((conduit) => (account?.conduits?.[conduit.id] ?? 0) > 0);
  const costInformation = Object.entries(conduitUpgradeRarityMultipliers).map(([rarity, multiplier]) =>
    `<p>${rarity}: ${conduitUpgradeCosts.map((cost) => cost * multiplier).join(' / ')} components for +1 through +5.</p>`).join('');
  return `<section class="conduit-upgrade-menu">
    <div class="conduit-upgrade-heading"><div><h2>Conduit Upgrade</h2></div>
      <button class="text-button" data-page="gameplay" data-machine-activity>Earn components &rarr;</button></div>
    <article class="component-balance">${mechanicalComponentIcon()}<div><strong id="mechanical-components-balance">${account ? account.mechanicalComponents ?? 0 : 'Unavailable'}</strong><span>Broken Mechanical Components</span></div></article>
    ${information('conduit-upgrade-information', 'Conduit upgrades', `<p>Each owned Conduit name can be upgraded five times account-wide. All characters sharing that name benefit; copies are not consumed. Each upgrade adds 50% of its original stat modifiers, reaching 3.5 times their original values at +5 (+250%). Legendary penalties grow too; Omnic special mechanics do not change. Critical Rate remains capped at 100%.</p><p>Only Broken Mechanical Components are spent. Costs increase with rarity; Omnic restoration is a long-term goal.</p>${costInformation}<p>Components drop only from defeated machines, independently of other rewards. ${machineComponentRulesText} No clear bonus or exchange.</p><p>Current and next values include drawbacks. Ongoing battles keep the upgrade levels snapshotted at entry; new runs use current upgrades.</p>`)}
    ${!account ? '<p role="alert">Conduit upgrades unavailable. Resolve the save error.</p>' : owned.length ? `<div class="conduit-catalog">${owned.map((conduit) => {
      const level = account.conduitUpgrades?.[conduit.id] ?? 0;
      const cost = conduitUpgradeCost(conduit, level);
      const affordable = cost !== null && (account.mechanicalComponents ?? 0) >= cost;
      return `<article class="conduit-card" data-upgrade-card="${conduit.id}">
        <div class="conduit-mechanism">${conduitIcon(conduit.id, level)}</div>
        <h3>${conduit.name}</h3>${conduitRarity(conduit.id)}<p>Upgrade +${level} / ${conduitUpgradeCap} · Owned ${account.conduits?.[conduit.id]}</p>
        <section class="conduit-upgrade-values"><h4>Current</h4><p>${conduitEffect(conduit, level)}</p>
          ${cost !== null ? `<h4>Next · +${level + 1}</h4><p>${conduitEffect(conduit, level + 1)}</p>` : '<p>Maximum upgrade reached.</p>'}</section>
        <p class="conduit-upgrade-cost">${cost === null ? 'No further upgrades' : `${cost} Broken Mechanical Components`}</p>
        <button class="primary-button" type="button" data-upgrade-conduit="${conduit.id}" data-expected-upgrade="${level}" ${affordable ? '' : 'disabled'}>${cost === null ? 'Maximum upgrade +5' : `Upgrade to +${level + 1} · ${cost} components`}</button>
        ${cost !== null && !affordable ? '<p class="quiet">Not enough Broken Mechanical Components.</p>' : ''}
      </article>`;
    }).join('')}</div>` : '<p>No owned Conduits to upgrade.</p>'}
    <p id="conduit-upgrade-result" role="status" tabindex="-1"></p>
  </section>`;
}

export function bindConduitUpgrades(host: HTMLElement, storage: ProfileStorage,
  refresh: (account: Account) => void, reportError: (message: string) => void): void {
  host.querySelectorAll<HTMLButtonElement>('[data-upgrade-conduit]').forEach((button) => {
    button.addEventListener('click', async () => {
      let saved = false;
      try {
        if (button.disabled) return;
        const id = button.dataset.upgradeConduit;
        if (!isConduitId(id)) throw new Error('Unknown Conduit.');
        const level = Number(button.dataset.expectedUpgrade);
        const conduit = getConduit(id);
        const cost = conduitUpgradeCost(conduit, level);
        if (cost === null) throw new Error('This Conduit is already fully upgraded.');
        if (!await gameConfirm(`Spend ${cost} Broken Mechanical Components to upgrade ${conduit.name} from +${level} to +${level + 1} account-wide? Current: ${conduitEffect(conduit, level)}. Next: ${conduitEffect(conduit, level + 1)}. Penalties also grow. No copies or other currency are spent.`, { title: 'Upgrade Conduit', confirmLabel: 'Upgrade' })) return;
        const account = upgradeConduit(storage, id, level);
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
      }
    });
  });
}
