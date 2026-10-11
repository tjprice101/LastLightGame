import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { MenuHistory } from './menu-history';

describe('menu traversal history', () => {
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
});
