import { describe, expect, it } from 'vitest';
import { starters } from '../content/starters';
import { characterRole } from './character-role';
import { characterHub, homeHub } from './hub';
import { BattleView } from './battle-view';
import { createBattle } from '../game/battle';

describe('character role medals', () => {
  it('classifies the current kits without changing combat stats', () => {
    expect(starters.map(({ name, role }) => [name, role])).toEqual([
      ['Infernis', 'Attacker'], ['Tizu', 'Tank'], ['Flora', 'Healer & Support'],
      ['Rosetta', 'Attacker'], ['Thornia', 'Tank'], ['Crinso', 'Attacker'],
      ['Atmoso', 'Attacker'], ['Aurora', 'Support'], ['Bliss', 'Attacker'],
      ['Bruno', 'Tank'], ['Disciple', 'Support'], ['Elise', 'Attacker'], ['Razor', 'Tank'],
      ['Nerithe', 'Attacker'], ['Orvella', 'Tank'], ['Vaelor', 'Attacker'],
    ]);
  });

  it.each(starters)('shows $name role text and decorative medal across menus and battle', (starter) => {
    const badge = characterRole(starter.id);
    expect(badge).toContain(`data-character-role="${starter.role}"`);
    expect(badge).toContain(`<span>${starter.role}</span>`);
    expect(badge).toContain('aria-hidden="true"');
    expect(homeHub(starter, false)).toContain(badge);
    expect(characterHub(starter, 'overview')).toContain(badge);
    const state = createBattle(1729, [starter.id]);
    const view = Object.create(BattleView.prototype);
    Object.assign(view, { session: { state } });
    const renderUnit = Reflect.get(BattleView.prototype, 'unit');
    expect(Reflect.apply(renderUnit, view, [state.allies[0]])).toContain(badge);
    expect(Reflect.apply(renderUnit, view, [state.enemies[0]])).not.toContain('character-role');
  });
});
