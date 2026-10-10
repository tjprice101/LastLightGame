import { describe, expect, it } from 'vitest';
import { emptyAccount } from '../game/account';
import { assignSquadSlot, bannerCharacters, characterCopyManagement, characterRoster, squadHub, summonHub } from './roster';
import { standardBannerPool } from '../content/standard-banner';

describe('roster, squad and summon screens', () => {
  const account = { ...emptyAccount(), characters: { ember: { level: 30, evolution: 2 }, tide: { level: 0, evolution: 1 } },
    squad: ['tide', 'ember'] as ('tide' | 'ember')[], lycalis: 10 };
  it('renders owned characters only and highlights the selected Element-Bearer', () => {
    const html = characterRoster(account, 'tide');
    expect(html).toContain('data-owned-character="tide" aria-pressed="true"');
    expect(html).toContain('Lv.30 · Evo.2');
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
  it('places Save beside the filled-slot count while retaining the same submitted form fields', () => {
    const html = squadHub(account);
    const header = html.slice(0, html.indexOf('<form id="squad-form">'));
    expect(header).toContain('2 / 3 slots filled');
    expect(header).toContain('form="squad-form"');
    expect(html.match(/>Save squad<\/button>/g)).toHaveLength(1);
    expect(html.match(/class="squad-member-preview"/g)).toHaveLength(3);
    for (let index = 0; index < 3; index++) expect(html).toContain(`name="slot-${index}"`);
  });
  it('renders an explicit empty state instead of throwing when there are no owned members', () => {
    const html = squadHub(emptyAccount());
    expect(html).toContain('No owned squad members');
    expect(html).toContain('<button class="primary-button" type="submit" form="squad-form" disabled>Save squad</button>');
  });
  it('displays the active Standard Banner and honest cost/pool/duplicate rules', () => {
    const html = summonHub(account);
    expect(html).toContain('Standard Banner');
    expect(html).toContain('10 Null-Prismatica');
    expect(html).not.toContain('disabled');
    expect(html.match(/data-banner-entry=/g)).toHaveLength(22);
    expect(html).toContain('5-star tier: 1%');
    expect(html).toContain('0.166667% per draw');
    expect(html).toContain('The Crown Beyond Dawn, Gleamstone Slime · Omnic · 6-star · Lv.50');
    expect(summonHub({ ...account, lycalis: 9 })).toContain('disabled');
    expect(summonHub({ ...account, characters: { ...account.characters, sprout: { level: 0, evolution: 1 } } }))
      .toContain('Summon · 10 Null-Prismatica');
    expect(html).not.toContain('NEW ELEMENT-BEARER · SAVED');
  });
  it('places one summon action beside its cost and gives the artwork and real rates their own main panel', () => {
    const html = summonHub(account);
    expect(html.match(/id="summon-character"/g)).toHaveLength(1);
    expect(html.match(/id="banner-cost-note"/g)).toHaveLength(1);
    expect(html).toContain('class="summon-main"');
    expect(html.indexOf('class="summon-banner-art')).toBeLessThan(html.indexOf('<table'));
    expect(html).toContain('aria-describedby="banner-cost-note"');
    expect(html).toContain('class="summon-visual"');
    expect(html).toContain('class="summon-sidebar"');
    expect(html).toContain('data-information="summon-information"');
    expect(html).toContain('class="summon-rates"');
    expect(html).toContain('data-rate-stars="all"');
    expect(html).toContain('data-rate-stars="6"');
    expect(html).toContain('aria-label="Highest-star pity progress"');
    expect(html).toContain('aria-label="Unowned highest-star pity progress"');
    const dialog = html.slice(html.indexOf('<dialog class="information-modal" id="summon-information"'), html.indexOf('</aside>'));
    expect(dialog).not.toContain('<table');
    expect(dialog).toContain('Counters are independent');
  });
  it('offers a real roster including each captured UUID and keeps draft assignments distinct', () => {
    const id = 'capture:00000000-0000-4000-8000-000000000001';
    const mixed = { ...account, capturedCharacters: [{ instanceId: id, creatureId: 'infusion:treasury:0', locked: false }] };
    expect(squadHub(mixed)).toContain(`data-squad-pick="${id}"`);
    expect(squadHub(mixed)).toContain('data-squad-assign="0"');
    expect(squadHub(mixed)).toContain('data-squad-remove="2"');
    expect(squadHub(mixed)).not.toContain('data-owned-character');
    const owned = ['tide', 'ember', id];
    const slots = ['tide', 'ember', ''];
    expect(assignSquadSlot(slots, 0, 'ember', owned)).toEqual(['ember', 'tide', '']);
    expect(assignSquadSlot(slots, 2, id, owned)).toEqual(['tide', 'ember', id]);
    expect(assignSquadSlot(slots, 1, '', owned)).toEqual(['tide', '', '']);
    expect(assignSquadSlot(slots, 0, 'tide', owned)).toEqual(slots);
    expect(() => assignSquadSlot(slots, 2, 'tide', owned)).toThrow('replacement leader');
    expect(() => assignSquadSlot(slots, 0, '', owned)).toThrow('leader');
    expect(() => assignSquadSlot(slots, 1, 'unowned', owned)).toThrow('owned');
    expect(() => assignSquadSlot(slots, 3, id, owned)).toThrow('three squad slots');
    expect(() => assignSquadSlot([], 0, id, owned)).toThrow('three squad slots');
    expect(slots).toEqual(['tide', 'ember', '']);
  });
  it('shows exact pity values and every real rate without mutating the account', () => {
    const wallet = { ...account, bannerPity: { standard: { highestStar: 199, unownedHighestStar: 499 } } };
    const before = structuredClone(wallet);
    const html = summonHub(wallet);
    expect(html).toContain('199 / 200');
    expect(html).toContain('499 / 500');
    expect(html).toContain('max="200" value="199"');
    expect(html).toContain('max="500" value="499"');
    expect(html.match(/data-banner-entry=/g)).toHaveLength(standardBannerPool().length);
    for (const outcome of standardBannerPool()) {
      expect(html).toContain(`data-banner-entry="${outcome.id}" data-entry-stars="${outcome.stars}"`);
      expect(html).toContain(`${(outcome.chance * 100).toFixed(6).replace(/0+$/, '').replace(/\.$/, '')}% per draw`);
    }
    expect(wallet).toEqual(before);
  });
  it('selects a single captured copy while retaining a full independent roster', () => {
    const first = 'capture:00000000-0000-4000-8000-000000000001';
    const second = 'capture:00000000-0000-4000-8000-000000000002';
    const captured = { ...account, capturedCharacters: [
      { instanceId: first, creatureId: 'infusion:treasury:0', locked: false },
      { instanceId: second, creatureId: 'infusion:sanctuary:0', locked: true },
    ] };
    const creatures = characterCopyManagement(captured, 'creatures', second);
    expect(creatures.match(/data-owned-capture=/g)).toHaveLength(2);
    expect(creatures.match(/data-captured-copy=/g)).toHaveLength(1);
    expect(creatures).toContain(`data-captured-copy="${second}"`);
    expect(creatures).toContain(`data-max-level="${second}"`);
    expect(creatures).toContain('class="captured-stage"');
    expect(creatures).toContain('class="captured-controls"');
    expect(creatures).not.toContain('Element-Bearer locks');
    expect(characterCopyManagement(captured, 'bearers')).not.toContain('data-captured-copy=');
    expect(characterCopyManagement(captured, 'creatures', 'removed-id')).toContain(`data-captured-copy="${first}"`);
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
    expect(table.match(/data-banner-entry=/g)).toHaveLength(22);
    expect(table).toContain('scope="col">Name');
    expect(table).toContain('scope="col">Rarity · Stars');
    expect(table).toContain('scope="col">Rate');
    expect(table).toContain('Common<span>5-star</span>');
    expect(table).toContain('Uncommon<span>2-star</span>');
    expect(table).toContain('Rare<span>3-star</span>');
    expect(table).not.toMatch(/<img|<svg|portrait|character-role|star-badge|rarity-medallion/);
    expect(html).not.toContain('summon-pool');
    expect(html).toContain('<section class="summon-rules">');
    expect(html).not.toContain('<details');
  });
  it('shows only the banner’s real high-star Element-Bearers with their awarded rarity and element', () => {
    const html = summonHub({ ...account, characters: { ember: { level: 105, evolution: 6 } } });
    const start = html.indexOf('<section class="banner-characters"');
    const featured = html.slice(start, html.indexOf('</section>', start));
    expect(featured.match(/data-banner-character=/g)).toHaveLength(10);
    for (const [id, name, element] of [
      ['ember', 'Infernis', 'infernic'], ['tide', 'Tizu', 'aquatic'], ['sprout', 'Flora', 'efflorescent'],
    ]) {
      expect(featured).toContain(`data-banner-character="${id}"`);
      expect(featured).toContain(`<strong>Beginner, ${name}</strong>`);
      expect(featured).toContain(`assets/elements/${element}.png`);
    }
    expect(featured.match(/aria-label="5-star character"/g)).toHaveLength(6);
    expect(featured.match(/aria-label="6-star character"/g)).toHaveLength(4);
    expect(featured.match(/rarity-common">Common/g)).toHaveLength(10);
    expect(featured).not.toMatch(/Omnic|infusion:|characters\/|abilities\/|portrait/);
    expect(bannerCharacters(standardBannerPool().filter((entry) => entry.kind === 'creature'))).toBe('');
  });
  it('uses authored outcome stars, excludes lower tiers and creatures, and rejects missing definitions', () => {
    const html = bannerCharacters([
      { kind: 'character', id: 'ember', stars: 6, chance: .001 },
      { kind: 'character', id: 'tide', stars: 4, chance: .1 },
      { kind: 'creature', id: 'infusion:treasury:5', stars: 6, chance: .1 },
    ]);
    expect(html.match(/data-banner-character=/g)).toHaveLength(1);
    expect(html).toContain('aria-label="6-star character"');
    expect(html).not.toContain('Tizu');
    expect(() => bannerCharacters([{ kind: 'character', id: 'missing', stars: 5, chance: .01 }])).toThrow('definition is missing');
  });
  it('uses Element-Bearer terminology without changing legacy DOM hooks', () => {
    for (const html of [characterRoster(account, 'tide'), squadHub(account), summonHub(account)]) {
      expect(html).toContain('Element-Bearer');
      expect(html.replace(/class="[^"]*"/g, '')).not.toMatch(/companion/i);
    }
    expect(characterRoster(account, 'tide')).toContain('aria-label="Owned Element-Bearers"');
  });
});
