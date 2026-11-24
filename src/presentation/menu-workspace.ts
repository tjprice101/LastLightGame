import { uiIcon } from './ui-icon';
import { equippedSquad, type Account } from '../game/account';
import { getStarter, isStarterId } from '../content/starters';
import { ownedCompanion } from './owned-companion';
import { radiantBearerKits } from '../content/combat-kits';
import { radiantCharacterLoadout, radiantLeaderText } from './character-combat';
import { escapeDialogText } from './game-dialog';
import { bindMenuPagination } from './menu-pagination';
import { information } from './information';
import { readableEffect } from './effect-copy';

export function workspaceUnitsMenu(account: Account | null = null): string {
  const squad = account ? equippedSquad(account) : [];
  const action = (view: string, label: string, description: string, icon: Parameters<typeof uiIcon>[0], tab = '') =>
    `<button type="button" data-team-view="${view}"${tab ? ` data-workspace-tab="${tab}"` : ''}><span class="workspace-action-icon">${uiIcon(icon)}</span><span><strong>${label}</strong><small>${description}</small></span><span aria-hidden="true">&rsaquo;</span></button>`;
  return `<section class="workspace-units"><header><h2>Elemental-Bearers</h2><p>Manage your Element-Bearers, squad and equipment.</p></header>
    <section class="workspace-squad-strip" aria-label="Your squad"><div><h3>Your squad</h3><p>${squad.length && account ? `Led by ${escapeDialogText(ownedCompanion(account, squad[0]).name)}` : 'Choose your formation'}</p></div>
      <div class="workspace-squad-members">${account ? squad.map((id, index) => {
        const member = ownedCompanion(account, id);
        return `<button type="button" data-team-view="formation" aria-label="${escapeDialogText(member.name)}${index ? '' : ', squad leader'}"><span class="workspace-squad-art${index ? '' : ' is-leader'}" style="--member-accent:${member.color}">${member.compactArt}</span><small>${escapeDialogText(isStarterId(id) ? getStarter(id).name : member.name)}</small></button>`;
      }).join('') : '<p role="status">Squad unavailable.</p>'}</div>
      <button type="button" data-team-view="loadouts">Loadouts</button><button type="button" class="workspace-primary" data-team-view="formation">Manage squad</button>
    </section>
    <nav class="workspace-unit-actions" aria-label="Unit menu"><section><h3>Make them stronger</h3>
      ${action('bearers', 'Level Unit', "Raise a unit's level to make it stronger.", 'level', 'upgrade-1')}
      ${action('bearers', 'Evolve Unit', 'Evolve a unit into its next form.', 'evolution', 'upgrade-0')}
      ${action('bearers', 'View Conduits', 'Choose an Element-Bearer to manage their Conduits.', 'weapon', 'equipment')}
      <button type="button" data-page="conduit-upgrade"><span class="workspace-action-icon">${uiIcon('weapon')}</span><span><strong>Upgrade Conduits</strong><small>Upgrade owned Conduits for your squad.</small></span><span aria-hidden="true">&rsaquo;</span></button></section>
      <section><h3>Your collection</h3>${action('bearers', 'View Units', 'Browse every Element-Bearer you own.', 'overview')}
      ${action('creatures', 'Captured Elemental-Devourers', "See the Elemental-Devourers you've captured.", 'squad')}</section></nav></section>`;
}

export function formatMenuWorkspace(root: HTMLElement, account: Account | null = null): void {
  root.querySelectorAll<HTMLElement>('.exchange-catalog [data-market-material]').forEach(item => { item.dataset.menuPageItem = ''; });
  bindMenuPagination(root);
  const detail = root.querySelector<HTMLElement>('.ref-bearer-detail[data-acquisition-character]');
  const tab = detail?.querySelector('[data-character-tab][aria-pressed="true"]')?.getAttribute('data-character-tab');
  const loadout = detail && radiantCharacterLoadout(account, detail.dataset.acquisitionCharacter ?? '');
  const identity = detail?.querySelector('.ref-character-identity');
  if (identity && loadout && tab !== 'overview') {
    const kit = radiantBearerKits[loadout.loadout.starter];
    const copy = `<span><strong>Leader Skill · ${escapeDialogText(kit.leader)}</strong><small>${kit.element} allies · While leading and alive</small></span>${information(`viewer-leader-${loadout.loadout.starter}`, `${escapeDialogText(kit.leader)} · Leader Skill`, `<p>${escapeDialogText(readableEffect(radiantLeaderText(loadout.loadout)))}</p>`, 'Effects')}`;
    const existing = identity.querySelector('.workspace-leader-skill');
    if (existing) existing.innerHTML = copy;
    else identity.insertAdjacentHTML('beforeend', `<section class="workspace-leader-skill">${copy}</section>`);
  }
}
