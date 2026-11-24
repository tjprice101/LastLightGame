// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { formatMenuWorkspace, workspaceUnitsMenu } from './menu-workspace';
import { emptyAccount } from '../game/account';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { filterTeamCollection } from './reference-team';
import { menuPager } from './menu-pagination';

describe('live redesigned menus', () => {
  it('does not reset the selected Market product page while applying Team collection filters', () => {
    const root = document.createElement('div');
    root.innerHTML = `<section class="ref-exchange" data-menu-page-size="8" data-menu-current-page="1">
      <div class="exchange-catalog">${Array.from({ length: 16 }, (_, i) => `<button data-market-material="${i}">${i}</button>`).join('')}</div>${menuPager('Materials')}</section>
      <section class="ref-team-collection" data-menu-page-size="1" data-menu-current-page="1">
        <button data-collection-item data-menu-page-item></button><button data-collection-item data-menu-page-item></button>${menuPager('Units')}</section>`;
    formatMenuWorkspace(root);
    filterTeamCollection(root, '');
    expect(root.querySelector('.ref-exchange')!.getAttribute('data-menu-current-page')).toBe('1');
    expect(root.querySelector('.ref-exchange [data-menu-page-status]')!.textContent).toBe('2 / 2');
    expect(root.querySelector('.ref-team-collection')!.getAttribute('data-menu-current-page')).toBe('0');
  });
  it('leaves the shell alone: the collapse toggles are gone and nothing is patched onto it (D-497)', () => {
    const root = document.createElement('div');
    const markup = '<div class="lk-shell"><header class="lk-topbar"></header><nav class="lk-dock"><button data-page="team"><span class="lk-dock-label">Elemental-Bearers</span></button></nav></div>';
    root.innerHTML = markup;
    formatMenuWorkspace(root);
    formatMenuWorkspace(root);
    expect(root.innerHTML).toBe(markup);
  });
  it('uses the production presentation without enabling the isolated test account', () => {
    const main = readFileSync(join(process.cwd(), 'src', 'main.ts'), 'utf8');
    expect(main).toContain("document.documentElement.dataset.menuWorkspace = '';");
    expect(main).not.toContain("if (menuWorkspace) document.documentElement.dataset.menuWorkspace");
    expect(main).toContain('if (sanctuary) formatMenuWorkspace(app, account);');
    expect(main).toContain('menuWorkspace ? createMenuWorkspaceStorage() : new DebugProfileStorage(window.localStorage, import.meta.env.DEV)');
    expect(workspaceUnitsMenu()).not.toContain('isolated test');
    expect(main).toContain("const selectionTab = teamView === 'bearers' ? characterTab : 'overview';");
    expect(main).toContain("if (page === 'team' && !button.dataset.teamArea) teamView = 'menu';");
  });
  it('routes level and evolution through the real owned collection', () => {
    const root = document.createElement('div');
    root.innerHTML = workspaceUnitsMenu();
    expect(root.querySelector('[data-workspace-tab="upgrade-1"]')?.getAttribute('data-team-view')).toBe('bearers');
    expect(root.querySelector('[data-workspace-tab="upgrade-0"]')?.getAttribute('data-team-view')).toBe('bearers');
    expect(root.querySelector('[data-team-view="creatures"]')).not.toBeNull();
    expect(root.querySelector('[data-team-view="loadouts"]')).not.toBeNull();
    expect(root.querySelector('[data-page="conduit-upgrade"]')?.textContent).toContain('Upgrade Conduits');
    expect(root.querySelector('h2')?.textContent).toBe('Elemental-Bearers');
  });
  it('preserves the single shortcut row and original controls during repeated formatting', () => {
    const root = document.createElement('div');
    root.innerHTML = `<div class="home-dashboard"><div class="home-leader-skill">Leader</div><nav class="home-shortcuts">${Array.from({ length: 8 }, (_, i) => `<button>${i}</button>`).join('')}</nav></div>`;
    const button = root.querySelector('button');
    formatMenuWorkspace(root);
    expect(root.querySelector('button')).toBe(button);
    expect(root.querySelectorAll('.workspace-command-group')).toHaveLength(0);
    expect(root.querySelector('.home-shortcuts')?.children).toHaveLength(8);
    expect(root.querySelector('.home-dashboard')?.firstElementChild?.className).toBe('home-leader-skill');
  });
  it('renders only saved squad members and keeps growth separate from collection navigation', () => {
    const account = { ...emptyAccount(), characters: { tide: { level: 15, evolution: 2 } }, squad: ['tide'] };
    const before = structuredClone(account);
    const root = document.createElement('div');
    root.innerHTML = workspaceUnitsMenu(account);
    expect(root.querySelectorAll('.workspace-squad-members button')).toHaveLength(1);
    expect(root.querySelector('.workspace-squad-members img')?.getAttribute('alt')).toContain('Tizu');
    expect(root.querySelectorAll('.workspace-unit-actions > section')).toHaveLength(2);
    expect(root.querySelector('[data-workspace-tab="equipment"]')?.getAttribute('data-team-view')).toBe('bearers');
    expect(account).toEqual(before);
  });
  it('keeps the Leader name compact and exact effects in one dialog alongside upgrade controls', () => {
    const root = document.createElement('div');
    root.innerHTML = '<section class="ref-bearer-detail" data-acquisition-character="ember"><div class="ref-character-identity"></div><button data-character-tab="upgrade-1" aria-pressed="true">Level</button></section>';
    formatMenuWorkspace(root, emptyAccount());
    formatMenuWorkspace(root, emptyAccount());
    expect(root.querySelectorAll('.workspace-leader-skill')).toHaveLength(1);
    expect(root.textContent).toContain('Hearthbound Oath');
    expect(root.querySelector('[data-information]')?.textContent).toBe('Effects');
    const effects = root.querySelector('.information-content')!.textContent!.replace(/[[\]]/g, '');
    expect(effects).toContain('Boosts Normal Attack damage of Infernic allies (+20%)');
    expect(effects).toContain('boosts Burn damage of Infernic allies (+15%)');
  });
});
