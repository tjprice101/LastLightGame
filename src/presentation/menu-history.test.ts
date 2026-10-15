import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { MenuHistory } from './menu-history';

describe('menu traversal history', () => {
  it('captures and restores activity difficulty independently of normal-stage selections', () => {
    const main = readFileSync(new URL('../main.ts', import.meta.url), 'utf8');
    expect(main).toContain('difficulties: Array.from(app.querySelectorAll<HTMLButtonElement>(\'[data-difficulty][aria-selected="true"]\'))');
    expect(main).toContain('for (const saved of previous.difficulties)');
    expect(main).toContain('[data-activity-difficulty="${saved.activity}"] [data-difficulty="${saved.difficulty}"]');
    expect(main).toContain('bindActivityDifficulties(app);');
  });
  it('wires toolbar and result exits to the same server-owning Back flow with a resume fallback', () => {
    const main = readFileSync(new URL('../main.ts', import.meta.url), 'utf8');
    const back = main.slice(main.indexOf('async function backMenu('), main.indexOf('\ntry {', main.indexOf('async function backMenu(')));
    expect(back).toContain("page: 'gameplay'");
    expect(back).toContain('menuHistory.back(fallback)');
    expect(back).toContain("await performOnline({ kind: 'quit', runId: battleSession.runId })");
    expect(main).toContain("try { await backMenu(); }");
    expect(main).toContain("}, backMenu, playMode === 'online' ? battleAuthority()");
  });
  it('opens character detail on a fresh Team visit without changing Back restoration', () => {
    const main = readFileSync(new URL('../main.ts', import.meta.url), 'utf8');
    const visit = main.slice(main.indexOf('function visitMenu('), main.indexOf('async function backMenu('));
    expect(visit).toContain("if (page === 'team' || page === 'character') teamView = 'detail';");
    expect(visit).toContain("teamView = 'formation'");
    const history = new MenuHistory<{ page: string; teamView: string }>();
    history.visit({ page: 'team', teamView: 'formation' }, 'home');
    expect(history.back()).toEqual({ page: 'team', teamView: 'formation' });
    expect(main).toContain('teamView = previous.teamView;');
  });
  it('returns through the actual caller chain including cross-links and Home', () => {
    const history = new MenuHistory<{ page: string; tab?: string }>();
    history.visit({ page: 'home' }, 'character');
    history.visit({ page: 'character', tab: 'equipment' }, 'conduit-store');
    history.visit({ page: 'conduit-store' }, 'home');
    expect(history.back().page).toBe('conduit-store');
    expect(history.back()).toEqual({ page: 'character', tab: 'equipment' });
    expect(history.back().page).toBe('home');
    expect(history.previous).toBeUndefined();
    expect(() => history.back()).toThrow('no previous');
  });
  it('does not add rerenders or ended battles as return destinations', () => {
    const history = new MenuHistory<{ page: string; stage?: number }>();
    history.visit({ page: 'gameplay', stage: 35 }, 'gameplay');
    expect(history.previous).toBeUndefined();
    history.visit({ page: 'gameplay', stage: 35 }, 'battle');
    history.visit({ page: 'battle' }, 'stores');
    expect(history.back()).toEqual({ page: 'gameplay', stage: 35 });
    expect(history.previous).toBeUndefined();
  });
  it('clears the trail when leaving the sanctuary', () => {
    const history = new MenuHistory<{ page: string }>();
    history.visit({ page: 'home' }, 'squad');
    history.clear();
    expect(history.previous).toBeUndefined();
  });
  it('uses a battle-resume destination only when there is no actual caller', () => {
    const history = new MenuHistory<{ page: string; stage?: number }>();
    const fallback = { page: 'gameplay' };
    expect(history.back(fallback)).toEqual(fallback);
    history.visit({ page: 'story', stage: 19 }, 'battle');
    expect(history.back(fallback)).toEqual({ page: 'story', stage: 19 });
    expect(() => history.back()).toThrow('no previous');
  });
});
