import { uiIcon } from './ui-icon';
import type { Account } from '../game/account';
import { radiantBearerKits } from '../content/combat-kits';
import { radiantCharacterLoadout, radiantLeaderText } from './character-combat';
import { escapeDialogText } from './game-dialog';
import { bindMenuPagination } from './menu-pagination';

const collapsedFrames = { header: false, dock: false };

function bindMenuFrames(root: HTMLElement): void {
  const shell = root.querySelector<HTMLElement>('.sanctuary-shell');
  if (!shell) return;
  const apply = (): void => {
    shell.dataset.headerCollapsed = String(collapsedFrames.header);
    shell.dataset.dockCollapsed = String(collapsedFrames.dock);
    shell.querySelectorAll<HTMLButtonElement>('[data-menu-frame]').forEach(button => {
      const frame = button.dataset.menuFrame;
      if (frame !== 'header' && frame !== 'dock') throw new Error('Unknown menu frame.');
      const collapsed = collapsedFrames[frame];
      const label = `${collapsed ? 'Expand' : 'Collapse'} ${frame === 'header' ? 'top' : 'bottom'} bar`;
      button.setAttribute('aria-expanded', String(!collapsed));
      button.setAttribute('aria-label', label);
      button.title = label;
      button.innerHTML = frame === 'header' ? collapsed ? '&or;' : '&and;' : collapsed ? '&and;' : '&or;';
    });
  };
  shell.querySelectorAll<HTMLButtonElement>('[data-menu-frame]').forEach(button => {
    if (button.dataset.menuFrameBound) return;
    button.dataset.menuFrameBound = 'true';
    button.addEventListener('click', () => {
      const frame = button.dataset.menuFrame;
      if (frame !== 'header' && frame !== 'dock') throw new Error('Unknown menu frame.');
      collapsedFrames[frame] = !collapsedFrames[frame];
      apply();
    });
  });
  apply();
}

export function workspaceUnitsMenu(): string {
  const actions = [
    ['bearers', 'View Units', ''],
    ['formation', 'Manage Squad', ''],
    ['bearers', 'Level Unit', 'upgrade-1'],
    ['bearers', 'Evolve Unit', 'upgrade-0'],
    ['bearers', 'Equip Conduits', 'equipment'],
    ['loadouts', 'Loadouts', ''],
    ['creatures', 'Captured Elemental-Devourers', ''],
  ];
  return `<section class="workspace-units"><header><h2>Units</h2><p>Manage your owned Element-Bearers, squad and equipment.</p></header>
    <nav class="workspace-unit-actions" aria-label="Unit menu">${actions.map(([view, label, tab]) =>
      `<button type="button" data-team-view="${view}"${tab ? ` data-workspace-tab="${tab}"` : ''}>${label}</button>`).join('')}</nav></section>`;
}

export function formatMenuWorkspace(root: HTMLElement, account: Account | null = null): void {
  bindMenuFrames(root);
  root.querySelectorAll<HTMLElement>('.exchange-catalog [data-market-material]').forEach(item => { item.dataset.menuPageItem = ''; });
  bindMenuPagination(root);
  root.querySelectorAll<HTMLElement>('.sanctuary-dock [data-page="team"] .nav-copy > strong').forEach(label => {
    label.textContent = 'Units';
  });
  const profile = root.querySelector('.home-profile-copy');
  const attunement = profile?.querySelector('.home-profile-attunement');
  const level = profile?.querySelector('small:last-of-type');
  if (attunement && level) {
    Array.from(attunement.childNodes).filter(node => node.nodeType === Node.TEXT_NODE).forEach(node => node.remove());
    level.append(attunement);
  }
  const shortcuts = root.querySelector<HTMLElement>('.home-shortcuts');
  if (shortcuts && !shortcuts.querySelector('.workspace-command-group')) {
    const buttons = Array.from(shortcuts.children);
    const left = document.createElement('div');
    const right = document.createElement('div');
    left.className = right.className = 'workspace-command-group';
    left.append(...buttons.slice(0, 4));
    right.append(...buttons.slice(4));
    const separator = document.createElement('span');
    separator.className = 'workspace-command-divider';
    separator.setAttribute('aria-hidden', 'true');
    separator.innerHTML = uiIcon('summon');
    shortcuts.replaceChildren(left, separator, right);
  }
  const leader = root.querySelector('.home-leader-skill');
  const dashboard = root.querySelector('.home-dashboard');
  if (leader && dashboard) dashboard.append(leader);
  const detail = root.querySelector<HTMLElement>('.ref-bearer-detail[data-acquisition-character]');
  const tab = detail?.querySelector('[data-character-tab][aria-pressed="true"]')?.getAttribute('data-character-tab');
  const loadout = detail && radiantCharacterLoadout(account, detail.dataset.acquisitionCharacter ?? '');
  const identity = detail?.querySelector('.ref-character-identity');
  if (identity && loadout && tab !== 'overview' && !identity.querySelector('.workspace-leader-skill')) {
    identity.insertAdjacentHTML('beforeend', `<p class="workspace-leader-skill"><strong>Leader Skill · ${escapeDialogText(radiantBearerKits[loadout.loadout.starter].leader)}</strong> ${escapeDialogText(radiantLeaderText(loadout.loadout))}</p>`);
  }
}
