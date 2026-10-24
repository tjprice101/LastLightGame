import { describe, expect, it } from 'vitest';
import { starters } from '../content/starters';
import { characterRole } from './character-role';
import { characterHub, homeHub } from './hub';
import { BattleView, createSession } from './battle-view';
import { nativeIdentities } from '../content/native-identities';

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
    expect(badge).toContain(`<span>${nativeIdentities[starter.id].role}</span>`);
    expect(badge).toContain('aria-hidden="true"');
    expect(homeHub(starter, false)).toContain(badge);
    expect(characterHub(starter, 'overview')).toContain(badge);
    const session = createSession(starter.id);
    const state = session.state;
    const view = Object.create(BattleView.prototype);
    const menu = { addEventListener: () => {}, close: () => {} };
    const host = { innerHTML: '', querySelectorAll: () => [], querySelector: (selector: string) => selector === '#battle-menu' ? menu : null };
    Object.assign(view, { session, host, actorId: starter.id, targetId: state.enemies[0].id });
    const renderUnit = Reflect.get(BattleView.prototype, 'unit');
    expect(Reflect.apply(renderUnit, view, [state.allies[0]])).not.toContain(badge);
    expect(Reflect.apply(renderUnit, view, [state.enemies[0]])).not.toContain('character-role');
    Reflect.apply(Reflect.get(BattleView.prototype, 'render'), view, []);
    expect(host.innerHTML.slice(host.innerHTML.indexOf('class="battle-unit-intel"'))).toContain(badge);
  });
});
