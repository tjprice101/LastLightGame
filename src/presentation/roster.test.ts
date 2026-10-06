import { describe, expect, it } from 'vitest';
import { emptyAccount } from '../game/account';
import { characterRoster, squadHub, summonHub } from './roster';

describe('roster, squad and summon screens', () => {
  const account = { ...emptyAccount(), characters: { ember: { level: 30, evolution: 2 }, tide: { level: 0, evolution: 1 } },
    squad: ['tide', 'ember'] as ('tide' | 'ember')[], lycalis: 10 };
  it('renders owned characters only and highlights the selected Element-Bearer', () => {
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
  it('keeps the squad editor available when no squad is saved yet', () => {
    const accountWithoutSquad = { ...account, squad: undefined };
    const html = squadHub(accountWithoutSquad);
    expect(html).toContain('<option value="ember" selected>');
    expect(html).toContain('Save squad');
    expect(accountWithoutSquad.squad).toBeUndefined();
  });
  it('renders an explicit empty state instead of throwing when there are no owned members', () => {
    const html = squadHub(emptyAccount());
    expect(html).toContain('No owned squad members');
    expect(html).toContain('<button class="primary-button" type="submit" disabled>Save squad</button>');
  });
  it('displays the active Standard Banner and honest cost/pool/duplicate rules', () => {
    const html = summonHub(account);
    expect(html).toContain('Standard Banner');
    expect(html).toContain('10 Lycalis');
    expect(html).not.toContain('disabled');
    expect(html.match(/data-banner-entry=/g)).toHaveLength(15);
    expect(html).toContain('5-star tier: 1%');
    expect(html).toContain('0.333333% per draw');
    expect(html).toContain('highest-rarity crowned slime');
    expect(summonHub({ ...account, lycalis: 9 })).toContain('disabled');
    expect(summonHub({ ...account, characters: { ...account.characters, sprout: { level: 0, evolution: 1 } } }))
      .toContain('Summon / 10 Lycalis');
    expect(html).not.toContain('NEW ELEMENT-BEARER / SAVED');
  });
  it('explicitly reports unavailable account instead of showing a summon button', () => {
    for (const html of [characterRoster(null, 'ember'), squadHub(null), summonHub(null)]) {
      expect(html).toContain('role="alert"');
    }
  });
  it('uses supplied 16:9 banner artwork with a text-only outcome table', () => {
    const html = summonHub(account);
    expect(html).toContain('assets/banners/summon-standard.png');
    expect(html).toContain('width="1456" height="816"');
    expect(html).not.toContain('art-pending');
    const table = html.slice(html.indexOf('<table'), html.indexOf('</table>'));
    expect(table.match(/data-banner-entry=/g)).toHaveLength(15);
    expect(table).toContain('scope="col">Name');
    expect(table).toContain('scope="col">Rarity / Stars');
    expect(table).toContain('scope="col">Rate');
    expect(table).toContain('Common<span>5-star</span>');
    expect(table).toContain('Uncommon<span>2-star</span>');
    expect(table).toContain('Rare<span>3-star</span>');
    expect(table).not.toMatch(/<img|<svg|portrait|character-role|star-badge|rarity-medallion/);
    expect(html).not.toContain('summon-pool');
    expect(html).toContain('<details class="summon-rules">');
  });
  it('uses Element-Bearer terminology without changing legacy DOM hooks', () => {
    for (const html of [characterRoster(account, 'tide'), squadHub(account), summonHub(account)]) {
      expect(html).toContain('Element-Bearer');
      expect(html.replace(/class="[^"]*"/g, '')).not.toMatch(/companion/i);
    }
    expect(characterRoster(account, 'tide')).toContain('aria-label="Owned Element-Bearers"');
  });
});
