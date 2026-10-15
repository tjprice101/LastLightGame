import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { conduits, conduitEffect, type ConduitSlots } from '../content/conduits';
import { masterConduits } from '../content/master-conduits';
import { kitConduitRules } from './conduit-store';
import { masterReference } from './master-conduits';
import { createSession, BattleView } from './battle-view';
import { readableEffect } from './effect-copy';

describe('complete equipped Conduit rules', () => {
  it('renders every ordinary complete effect at its actual upgrade level without dropping the first sentence', () => {
    for (const conduit of conduits) {
      const equipment: ConduitSlots = [conduit.id, null, null, null, null, null, null, null];
      for (const level of [0, 3, 5]) {
        const html = kitConduitRules(equipment, { [conduit.id]: level });
        expect(html).toContain(`${conduit.name} +${level}:`);
        expect(html).toContain(readableEffect(conduitEffect(conduit, level)));
        expect(html).not.toContain('scale stats, not these rules');
      }
    }
    expect(kitConduitRules()).toBe('');
  });

  it('shows frozen upgraded combat effects and complete transformed Master rules in the battle reference', () => {
    const slots: ConduitSlots = ['fracture-reservoir', null, null, null, null, null, null, null];
    const session = createSession('ember', { level: 0, evolution: 1 }, undefined,
      { ids: ['ember'], progress: { ember: { level: 0, evolution: 1 } },
        equipment: { ember: slots }, upgrades: { 'fracture-reservoir': 5 }, masters: { ember: 'master-ember-3' } });
    const menu = { addEventListener: () => {}, close: () => {}, showModal: () => {} };
    const host = { innerHTML: '', querySelectorAll: () => [],
      querySelector: (selector: string) => selector === '#battle-menu' ? menu : null };
    const view = Object.create(BattleView.prototype);
    Object.assign(view, { host, session, actorId: 'ember', targetId: '', dragging: false });
    Reflect.apply(Reflect.get(BattleView.prototype, 'render'), view, []);
    expect(host.innerHTML).toContain(kitConduitRules(slots, session.state.conduitUpgrades));
    expect(host.innerHTML).toContain(masterReference('master-ember-3'));
    const hub = readFileSync(join('src', 'presentation', 'hub.ts'), 'utf8');
    const callers = hub.match(/kitConduitRules\([^\n]+?\)/g) ?? [];
    expect(callers).toHaveLength(3);
    for (const caller of callers) expect(caller).toContain('account?.conduitUpgrades');
  });

  it('retains complete rules for all Masters without claiming all effects recur', () => {
    for (const master of masterConduits) {
      const html = masterReference(master.id);
      expect(html).toContain(master.effect);
      expect(html).toContain('Triggers and limits as stated above');
      expect(html).not.toContain('Recurs on qualifying native outcomes');
    }
  });
});
