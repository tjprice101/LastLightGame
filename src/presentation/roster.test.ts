import { describe, expect, it } from 'vitest';
import { emptyAccount } from '../game/account';
import { characterRoster, squadHub, summonHub } from './roster';
import { getStarter } from '../content/starters';

describe('roster, squad and summon screens', () => {
  const account = { ...emptyAccount(), characters: { ember: { level: 30, evolution: 2 }, tide: { level: 0, evolution: 1 } },
    squad: ['tide', 'ember'] as ('tide' | 'ember')[], lycalis: 10 };
  it('renders owned characters only and highlights the selected companion', () => {
    const html = characterRoster(account, 'tide');
    expect(html).toContain('data-owned-character="tide" aria-pressed="true"');
    expect(html).toContain('Lv.30 / Evo.2');
    expect(html).not.toContain('data-owned-character="sprout"');
  });
  it('renders three ordered slots, optional removal and no starter lock', () => {
    const html = squadHub(account);
    expect(html.match(/class="squad-slot"/g)).toHaveLength(3);
    expect(html).toContain('<option value="tide" selected>');
    expect(html).toContain('Choose leader');
    expect(html).toContain('Empty slot');
    expect(html).toContain('Save squad');
    expect(html).not.toContain('disabled');
  });
  it('displays honest cost, current pool odds and disabled states without inventing income', () => {
    const html = summonHub(account);
    expect(html).toContain('100% chance');
    expect(html).toContain('Summon / 10 Lycalis');
    expect(html).not.toContain('disabled');
    expect(summonHub({ ...account, lycalis: 9 })).toContain('disabled');
    expect(summonHub({ ...account, characters: { ...account.characters, sprout: { level: 0, evolution: 1 } } }))
      .toContain('All companions owned');
    expect(summonHub(account, 'tide')).toContain(getStarter('tide').name);
    expect(summonHub(account, 'tide')).toContain('NEW COMPANION / SAVED');
  });
  it('explicitly reports unavailable account instead of showing a summon button', () => {
    for (const html of [characterRoster(null, 'ember'), squadHub(null), summonHub(null)]) {
      expect(html).toContain('role="alert"');
    }
  });
});
