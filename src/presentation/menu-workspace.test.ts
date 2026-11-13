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
  it('collapses either frame once after repeated formatting and retains state across navigation without save writes', () => {
    const root = document.createElement('div');
    const markup = '<div class="sanctuary-shell"><button data-menu-frame="header"></button><button data-menu-frame="dock"></button></div>';
    root.innerHTML = markup;
    formatMenuWorkspace(root);
    formatMenuWorkspace(root);
    root.querySelector<HTMLButtonElement>('[data-menu-frame="header"]')!.click();
    expect(root.querySelector('.sanctuary-shell')!.getAttribute('data-header-collapsed')).toBe('true');
    root.innerHTML = markup;
    formatMenuWorkspace(root);
    expect(root.querySelector('[data-menu-frame="header"]')!.getAttribute('aria-expanded')).toBe('false');
    root.querySelector<HTMLButtonElement>('[data-menu-frame="header"]')!.click();
    root.querySelector<HTMLButtonElement>('[data-menu-frame="dock"]')!.click();
    expect(root.querySelector('.sanctuary-shell')!.getAttribute('data-dock-collapsed')).toBe('true');
    root.querySelector<HTMLButtonElement>('[data-menu-frame="dock"]')!.click();
    expect(root.querySelector('[data-menu-frame="dock"]')!.getAttribute('aria-label')).toBe('Collapse bottom bar');
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
  });
  it('moves original controls without replacing them and separates utility groups', () => {
    const root = document.createElement('div');
    root.innerHTML = `<div class="home-dashboard"><div class="home-leader-skill">Leader</div><nav class="home-shortcuts">${Array.from({ length: 8 }, (_, i) => `<button>${i}</button>`).join('')}</nav></div>`;
    const button = root.querySelector('button');
    formatMenuWorkspace(root);
    expect(root.querySelector('button')).toBe(button);
    expect(Array.from(root.querySelectorAll('.workspace-command-group')).map(group => group.children.length)).toEqual([4, 4]);
    expect(root.querySelector('.home-dashboard')?.lastElementChild?.className).toBe('home-leader-skill');
  });
  it('keeps the actual Leader Skill visible alongside upgrade controls without duplication', () => {
    const root = document.createElement('div');
    root.innerHTML = '<section class="ref-bearer-detail" data-acquisition-character="ember"><div class="ref-character-identity"></div><button data-character-tab="upgrade-1" aria-pressed="true">Level</button></section>';
    formatMenuWorkspace(root, emptyAccount());
    formatMenuWorkspace(root, emptyAccount());
    expect(root.querySelectorAll('.workspace-leader-skill')).toHaveLength(1);
    expect(root.textContent).toContain('Hearthbound Oath');
    expect(root.textContent).toContain('20% more attack damage');
  });
  it('keeps level and attunement together without repeating the subtype', () => {
    const root = document.createElement('div');
    root.innerHTML = '<div class="home-profile-copy"><small>Leader</small><b>Name</b><small>Lv.15</small><span class="home-profile-attunement"><span class="radiant-attunement-chip">Equinox</span>Equinox</span></div>';
    formatMenuWorkspace(root);
    expect(root.querySelector('small:last-of-type')?.textContent).toBe('Lv.15Equinox');
    expect(root.textContent?.match(/Equinox/g)).toHaveLength(1);
  });
});
