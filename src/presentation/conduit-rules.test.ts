import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { conduitEffect, getConduit, type ConduitSlots } from '../content/conduits';
import { masterConduits } from '../content/master-conduits';
import { masterReference } from './master-conduits';
import { createSession, BattleView } from './battle-view';
import { referencedEffect as readableEffect } from './effect-copy';

describe('Conduit rules stay on Conduit screens', () => {
  it('keeps equipped Conduit and Master rules out of the battle ability reference and Character ability views', () => {
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
    expect(host.innerHTML).not.toContain('Equipped kit rules');
    expect(host.innerHTML).not.toContain(readableEffect(conduitEffect(getConduit('fracture-reservoir'), 5)));
    expect(host.innerHTML).not.toContain(masterReference('master-ember-3'));
    const hub = readFileSync(join('src', 'presentation', 'hub.ts'), 'utf8');
    expect(hub).not.toMatch(/kitConduitRules|masterReference/);
  });

  it('retains complete rules for all Masters without claiming all effects recur', () => {
    for (const master of masterConduits) {
      const html = masterReference(master.id);
      expect(html).toContain(readableEffect(master.effect));
      expect(html).toContain('Triggers and limits as stated above');
      expect(html).not.toContain('Recurs on qualifying native outcomes');
    }
  });
});
