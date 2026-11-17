import { describe, expect, it } from 'vitest';
import { createRadiantCombat, type RadiantCombatState } from '../game/combat-engine';
import { releasedRadiantIds, type RadiantBearerId, type RadiantLoadout } from '../content/combat-kits';
import { radiantSignatureView } from './battle-signatures';

const loadout = (id: RadiantBearerId): RadiantLoadout => ({ id, starter: id, masterId: null, form: 6, level: 105,
  convergenceRank: 1, weaponRank: 0, ascension: {} });
const enemy = (id: string) => ({ elementId: null, id, stats: { hp: 1000, attack: 1, defense: 1, recovery: 1 }, currencyBudget: 1 });
const combat = (ids: RadiantBearerId[]): RadiantCombatState =>
  createRadiantCombat(ids.map(loadout), [enemy('e1'), enemy('e2')], 1);
// Signatures that live only on holders (Seeds, Cover) or in events (detonation, refunds) have no owner chip.
const holderOnly = new Set<RadiantBearerId>(['ember', 'tide', 'sprout', 'bruno']);

describe('signature counter view (D-479)', () => {
  it.each(releasedRadiantIds)('%s shows its starting counter on its own card', id => {
    const view = radiantSignatureView(combat([id]));
    if (holderOnly.has(id) || id === 'aurora' || id === 'disciple') expect(view.owners[id]).toEqual([]);
    else expect(view.owners[id].length).toBeGreaterThan(0);
  });
  it('reads counters, caps and holder marks from state', () => {
    const state = combat(['ilvaris', 'crinso', 'sprout']);
    const [ilvaris, crinso, flora] = state.bearers;
    ilvaris.signature = { kind: 'marks', marks: [{ enemyId: 'e2', stacks: 3, remaining: 2 }] };
    crinso.signature = { kind: 'combo', combo: 4, last: 1 };
    flora.seed = { casterId: 'sprout', value: .3 };
    crinso.cover = { casterId: 'sprout', share: .4, remaining: 1 };
    const view = radiantSignatureView(state);
    expect(view.owners.ilvaris).toEqual(['Marks on 1 enemy']);
    expect(view.holders.e2).toEqual(['Fate-seared Mark ×3 · 2 turns']);
    expect(view.owners.crinso).toEqual(['Combo 4/5']);
    expect(view.holders.sprout).toEqual(['Seed · heals 30% next turn']);
    expect(view.holders.crinso[0]).toMatch(/^Cover · .+ takes 40% · 1 turn$/);
  });
  it('shows counter kinds with their caps and named states', () => {
    const state = combat(['caldrex', 'myrthen', 'asteriel']);
    const [caldrex, myrthen, asteriel] = state.bearers;
    caldrex.signature = { kind: 'heat', count: 2, latch: false };
    caldrex.burnUp = { value: .25, remaining: 2 };
    myrthen.signature = { kind: 'season', count: 2, latch: false };
    asteriel.signature = { kind: 'path', count: 1, path: 'flourish' };
    const view = radiantSignatureView(state);
    expect(view.owners.caldrex).toEqual(['Burn boost +25% · 2 turns', 'Heat 2/3']);
    expect(view.owners.myrthen).toEqual(['Season · Harvest']);
    expect(view.owners.asteriel).toEqual(['Promise 1/3 · Flourish']);
  });
  it('hides a defeated bearer\'s chips', () => {
    const state = combat(['razor', 'tide', 'ember']);
    state.bearers[0].hp = 0;
    expect(radiantSignatureView(state).owners.razor).toEqual([]);
  });
});
