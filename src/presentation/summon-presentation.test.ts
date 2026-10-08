import { describe, expect, it } from 'vitest';
import { emptyAccount } from '../game/account';
import { getSummonBanner } from '../content/summon-banners';
import { createCreatureCopy } from '../game/character-instances';
import { getCreature } from '../content/creatures';
import { summonReward, type SummonResult } from './summon-presentation';
import { rewardScreenMarkup } from './reward-screen';
import { conduitReward } from './conduit-presentation';

describe('saved summon reward presentation', () => {
  it('shares the saved receipt foundation with purchases/restoration without consuming or equipping copies', () => {
    const account = { ...emptyAccount(), conduits: { 'vigil-core': 2 }, conduitUpgrades: { 'vigil-core': 3 } };
    const before = structuredClone(account);
    const reward = conduitReward('vigil-core', account, 'Conduit upgraded', '100 components spent');
    expect(reward.art).toContain('data-conduit-upgrade="3"');
    expect(reward.details).toContain('+12.5% Health');
    expect(reward.details).toContain('Owned 2');
    expect(reward.details).toContain('100 components spent');
    expect(reward.details).toContain('Not auto-equipped');
    expect(account).toEqual(before);
  });
  it('shows new Element-Bearer base art, actual star rating/element and cost without mutating the account', () => {
    const banner = getSummonBanner('roses');
    const entry = banner.pool().find((item) => item.kind === 'character');
    if (!entry) throw new Error('Real character outcome missing.');
    const account = emptyAccount();
    const result: SummonResult = { account, entry, duplicate: false, guarantee: 'none' };
    const before = structuredClone(result);
    const reward = summonReward(result, 'roses');
    expect(reward.title).toBe('Element-Bearer summoned');
    expect(reward.art).toContain('characters/');
    expect(reward.details).toContain('6-star character');
    expect(reward.details).toContain('Lv.0 ~ Evo.1');
    expect(reward.details).toContain('10 Null-Prismatica spent');
    expect(reward.details).toContain('Roses Under Sunny Skies');
    expect(result).toEqual(before);
  });
  it.each(['standard', 'roses'] as const)('shows the exact converted copy and bonus for %s, not the unawarded character', (id) => {
    const banner = getSummonBanner(id);
    const entry = banner.pool().find((item) => item.kind === 'character');
    if (!entry) throw new Error('Real character outcome missing.');
    const copy = createCreatureCopy(banner.duplicateReward.creatureId, undefined, banner.duplicateReward.level, 'banner-duplicate');
    const account = { ...emptyAccount(), capturedCharacters: [copy] };
    const result: SummonResult = { account, entry, copy, duplicate: true, guarantee: 'unowned-highest-star', bonusConduit: 'worldbreaker-drive' };
    const reward = summonReward(result, id);
    expect(reward.title).toBe('Duplicate converted');
    expect(reward.name).toBe(getCreature(copy.creatureId).name);
    expect(reward.art).toContain('enemies/');
    expect(reward.details).toContain(`Lv.${banner.duplicateReward.level}`);
    expect(reward.details).toContain('already owned');
    expect(reward.details).toContain('Pity guarantee: Unowned highest-star character');
    expect(reward.details).toContain('Bonus Conduit');
    expect(reward.details).toContain('Worldbreaker Drive');
    expect(reward.details).toContain('Not auto-equipped');
  });
  it('shows ordinary creatures with retained form/level and hides result controls until the reveal', () => {
    const entry = getSummonBanner('standard').pool().find((item) => item.kind === 'creature');
    if (!entry) throw new Error('Real creature outcome missing.');
    const copy = createCreatureCopy(entry.id);
    const account = { ...emptyAccount(), capturedCharacters: [copy] };
    const reward = summonReward({ account, entry, copy, duplicate: false, guarantee: 'none' }, 'standard');
    expect(reward.title).toBe('Creature summoned');
    expect(reward.details).toContain(`Lv.${copy.level}`);
    const html = rewardScreenMarkup(reward);
    expect(html).toContain('class="reward-art" hidden');
    expect(html).toContain('class="reward-details" hidden');
    expect(html).toContain('data-close-reward hidden');
    expect(html).toContain('data-skip-reward');
    expect(html).toContain('role="status"');
    expect(html).not.toContain('Claim');
    expect(html).not.toContain('data-page=');
  });
  it('rejects missing reward identities instead of presenting a successful blank result', () => {
    const entry = getSummonBanner('standard').pool().find((item) => item.kind === 'creature');
    if (!entry) throw new Error('Real creature outcome missing.');
    expect(() => summonReward({ account: emptyAccount(), entry, duplicate: false, guarantee: 'none' }, 'standard')).toThrow('definition is missing');
  });
});
