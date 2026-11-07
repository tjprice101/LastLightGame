import { describe, expect, it } from 'vitest';
import { emptyAccount, type SummonDraw } from '../game/account';
import { bannerMaterialDefinition } from '../content/banner-materials';
import { getSummonBanner } from '../content/summon-banners';
import { materialName } from '../content/dungeon-art';
import { summonReward, summonTenReward, type SummonResult } from './summon-presentation';
import { rewardScreenMarkup, summonRevealTier } from './reward-screen';
import { conduitReward } from './conduit-presentation';
import { conduitEffect, getConduit } from '../content/conduits';
import { referencedEffect } from './effect-copy';

describe('saved summon reward presentation', () => {
  it.each(['standard', 'roses'] as const)('preserves historical and versioned %s material receipts without mutation', bannerId => {
    const pool = getSummonBanner(bannerId).pool();
    const character = pool.find(entry => entry.kind === 'character');
    if (!character) throw new Error('Character receipt fixture is missing.');
    const draws: SummonDraw[] = [];
    for (const entry of pool.filter(entry => entry.kind === 'material')) {
      if (entry.kind !== 'material') throw new Error('Material receipt fixture is missing.');
      const tier = bannerMaterialDefinition(entry.id);
      for (const version of [undefined, 1] as const) {
        const amount = version === 1 ? tier.amount : tier.authoredAmount;
        const result: SummonResult = { account: emptyAccount(), entry: { ...entry, amount },
          materials: { id: entry.id, amount }, duplicate: false, guarantee: 'none',
          ...(version === 1 ? { materialRewardVersion: 1 } : {}) };
        const before = structuredClone(result);
        expect(summonReward(result, bannerId).name).toBe(`${amount} ${materialName(entry.id)}`);
        expect(result).toEqual(before);
        expect(() => summonReward({ ...result, materials: { id: entry.id, amount: amount + 1 } }, bannerId)).toThrow('receipt');
        const mismatched = structuredClone(result);
        if (version === 1) delete mismatched.materialRewardVersion;
        else mismatched.materialRewardVersion = 1;
        expect(() => summonReward(mismatched, bannerId)).toThrow('receipt');
        draws.push(result);
      }
    }
    const id = bannerId === 'roses' ? 'rosethorn-rare' : 'infernic-rare';
    for (const version of [undefined, 1] as const) {
      const amount = version === 1 ? 8 : 15;
      const result: SummonResult = { account: emptyAccount(), entry: character,
        materials: { id, amount }, duplicate: true, guarantee: 'none',
        ...(version === 1 ? { materialRewardVersion: 1 } : {}) };
      const before = structuredClone(result);
      expect(summonReward(result, bannerId).name).toBe(`${amount} ${materialName(id)}`);
      expect(result).toEqual(before);
      expect(() => summonReward({ ...result, materials: { id, amount: version === 1 ? 15 : 8 } }, bannerId)).toThrow('receipt');
      draws.push(result);
    }
    const mixed = Array.from({ length: 10 }, (_, index) => draws[index % draws.length]);
    const before = structuredClone(mixed);
    expect(summonTenReward(emptyAccount(), mixed, bannerId).art.match(/class="summon-ten-result/g)).toHaveLength(10);
    expect(mixed).toEqual(before);
  });

  it('rejects invalid material receipt versions and version markers without material rewards', () => {
    const pool = getSummonBanner('standard').pool();
    const entry = pool.find(entry => entry.kind === 'material');
    const character = pool.find(entry => entry.kind === 'character');
    if (!entry || entry.kind !== 'material' || !character) throw new Error('Version receipt fixtures are missing.');
    const result: SummonResult = { account: emptyAccount(), entry, duplicate: false, guarantee: 'none',
      materials: { id: entry.id, amount: entry.amount }, materialRewardVersion: 1 };
    for (const version of [undefined, null, 0, 2, '1', NaN]) {
      const malformed = { ...result, materialRewardVersion: version } as unknown as SummonResult;
      expect(() => summonReward(malformed, 'standard')).toThrow('version');
      expect(() => summonTenReward(emptyAccount(), Array.from({ length: 10 }, () => malformed), 'standard')).toThrow('version');
    }
    expect(() => summonReward({ account: emptyAccount(), entry: character, duplicate: false,
      guarantee: 'none', materialRewardVersion: 1 }, 'standard')).toThrow('version');
  });

  it('shares the saved receipt foundation with purchases/restoration without consuming or equipping copies', () => {
    const account = { ...emptyAccount(), conduits: { 'vigil-core': 2 }, conduitUpgrades: { 'vigil-core': 3 } };
    const before = structuredClone(account);
    const reward = conduitReward('vigil-core', account, 'Conduit upgraded', '100 components spent');
    expect(reward.art).toContain('class="conduit-reward-art"');
    expect(reward.art).toContain('data-conduit-upgrade="3"');
    expect(reward.details).toContain(referencedEffect(conduitEffect(getConduit('vigil-core'), 3)));
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
    expect(reward.art).not.toContain('conduit-reward-art');
    expect(reward.details).toContain('6-star character');
    expect(reward.details).toContain('Lv.0 · Evo.1');
    expect(reward.details).toContain('10 Null-Prismatica spent');
    expect(reward.details).toContain('Roses Under Sunny Skies');
    expect(result).toEqual(before);
  });
  it.each(['standard', 'roses'] as const)('shows the exact converted materials and bonus for %s, not the unawarded character', (id) => {
    const banner = getSummonBanner(id);
    const entry = banner.pool().find((item) => item.kind === 'character');
    if (!entry) throw new Error('Real character outcome missing.');
    const materials = { id: id === 'roses' ? 'rosethorn-rare' : 'infernic-rare', amount: 15 };
    const account = { ...emptyAccount(), materials: { [materials.id]: materials.amount } };
    const result: SummonResult = { account, entry, materials, duplicate: true, guarantee: 'unowned-highest-star', bonusConduit: 'worldbreaker-drive' };
    const reward = summonReward(result, id);
    expect(reward.title).toBe('Duplicate converted');
    expect(reward.name).toBe(`15 ${materialName(materials.id)}`);
    expect(reward.art).toContain('materials/');
    expect(reward.details).toContain('Rare material bundle');
    expect(reward.details).toContain('already owned');
    expect(reward.details).toContain('Pity guarantee: Unowned highest-star character');
    expect(reward.details).toContain('Bonus Conduit');
    expect(reward.details).toContain('Worldbreaker Drive');
    expect(reward.details).toContain('Not auto-equipped');
  });
  it('summarizes all ten saved 10-pull results in one grid without mutating them', () => {
    const pool = getSummonBanner('standard').pool();
    const character = pool.find((item) => item.kind === 'character');
    const material = pool.find((item) => item.kind === 'material');
    if (!character || !material || material.kind !== 'material') throw new Error('Real outcomes missing.');
    const draws = Array.from({ length: 10 }, (_, index) => index === 3
      ? { entry: character, duplicate: false, guarantee: 'highest-star' }
      : { entry: material, materials: { id: material.id, amount: material.amount }, duplicate: false, guarantee: 'none', materialRewardVersion: 1 as const });
    const account = { ...emptyAccount(), characters: { [character.id]: { level: 0, evolution: 1 } }, materials: { [material.id]: material.amount * 9 } };
    const before = structuredClone(draws);
    const reward = summonTenReward(account, draws, 'standard');
    expect(reward.art.match(/class="summon-ten-result/g)).toHaveLength(10);
    expect(reward.art.match(/is-character/g)).toHaveLength(1);
    expect(reward.details).toContain('100 Null-Prismatica spent');
    expect(draws).toEqual(before);
    expect(() => summonTenReward(account, draws.slice(1), 'standard')).toThrow();
  });
  it('shows ordinary materials and hides result controls until the reveal', () => {
    const entry = getSummonBanner('standard').pool().find((item) => item.kind === 'material');
    if (!entry || entry.kind !== 'material') throw new Error('Real material outcome missing.');
    const materials = { id: entry.id, amount: entry.amount };
    const account = { ...emptyAccount(), materials: { [entry.id]: entry.amount } };
    const reward = summonReward({ account, entry, materials, duplicate: false, guarantee: 'none', materialRewardVersion: 1 }, 'standard');
    expect(reward.title).toBe('Materials summoned');
    expect(reward.details).toContain(`${entry.amount} received`);
    const html = rewardScreenMarkup(reward);
    expect(html).toContain('class="reward-art" hidden');
    expect(html).toContain('class="reward-details" hidden');
    expect(html).toContain('data-close-reward hidden');
    expect(html).toContain('data-skip-reward');
    expect(html).toContain('role="status"');
    expect(html).not.toContain('Claim');
    expect(html).not.toContain('data-page=');
  });
  it('maps pulled star values to escalating reveal tiers', () => {
    expect([1, 2, 3, 4].map(summonRevealTier)).toEqual([undefined, undefined, undefined, undefined]);
    expect(summonRevealTier(5)).toBe('five-star');
    expect(summonRevealTier(6)).toBe('six-star');
  });
  it('gives 5-star and 6-star pulls (including duplicates) their own reveal, and ordinary pulls none', () => {
    const pool = getSummonBanner('standard').pool();
    const five = pool.find((item) => item.kind === 'character' && item.stars === 5);
    const six = pool.find((item) => item.kind === 'character' && item.stars === 6);
    const material = pool.find((item) => item.kind === 'material');
    if (!five || !six || !material || material.kind !== 'material') throw new Error('Real outcomes missing.');
    expect(summonReward({ account: emptyAccount(), entry: five, duplicate: false, guarantee: 'none' }, 'standard').tier).toBe('five-star');
    const sixReward = summonReward({ account: emptyAccount(), entry: six, duplicate: false, guarantee: 'none' }, 'standard');
    expect(sixReward.tier).toBe('six-star');
    const duplicate = summonReward({ account: { ...emptyAccount(), materials: { 'infernic-rare': 15 } }, entry: six,
      materials: { id: 'infernic-rare', amount: 15 }, duplicate: true, guarantee: 'none' }, 'standard');
    expect(duplicate.tier).toBe('six-star');
    const plain = summonReward({ account: emptyAccount(), entry: material, materials: { id: material.id, amount: material.amount }, duplicate: false, guarantee: 'none', materialRewardVersion: 1 }, 'standard');
    expect(plain.tier).toBeUndefined();
    expect(rewardScreenMarkup(plain)).not.toContain('reward-rays');
    const html = rewardScreenMarkup(sixReward);
    expect(html).toContain('class="reward-rays" aria-hidden="true"');
    expect(html.match(/--spark-index/g)).toHaveLength(18);
    expect(html).toContain('Prismatic radiance erupts!');
    expect(rewardScreenMarkup(summonReward({ account: emptyAccount(), entry: five, duplicate: false, guarantee: 'none' }, 'standard')).match(/--spark-index/g)).toHaveLength(10);
  });
  it('uses the highest pulled star for a 10-pull and highlights those tiles', () => {
    const pool = getSummonBanner('standard').pool();
    const five = pool.find((item) => item.kind === 'character' && item.stars === 5);
    const six = pool.find((item) => item.kind === 'character' && item.stars === 6);
    const material = pool.find((item) => item.kind === 'material');
    if (!five || !six || !material || material.kind !== 'material') throw new Error('Real outcomes missing.');
    const draws = (special: typeof five[]) => Array.from({ length: 10 }, (_, index) => special[index]
      ? { entry: special[index], duplicate: false, guarantee: 'none' }
      : { entry: material, materials: { id: material.id, amount: material.amount }, duplicate: false, guarantee: 'none', materialRewardVersion: 1 as const });
    const account = { ...emptyAccount(), characters: { [five.id]: { level: 0, evolution: 1 }, [six.id]: { level: 0, evolution: 1 } }, materials: { [material.id]: material.amount * 10 } };
    expect(summonTenReward(account, draws([]), 'standard').tier).toBeUndefined();
    expect(summonTenReward(account, draws([five]), 'standard').tier).toBe('five-star');
    const both = summonTenReward(account, draws([five, six]), 'standard');
    expect(both.tier).toBe('six-star');
    expect(both.art.match(/is-five-star/g)).toHaveLength(1);
    expect(both.art.match(/is-six-star/g)).toHaveLength(1);
  });
  it('rejects missing reward identities instead of presenting a successful blank result', () => {
    const entry = getSummonBanner('standard').pool().find((item) => item.kind === 'material');
    if (!entry) throw new Error('Real material outcome missing.');
    expect(() => summonReward({ account: emptyAccount(), entry, duplicate: false, guarantee: 'none' }, 'standard')).toThrow('definition is missing');
    for (const materials of [{ id: entry.id, amount: 1000 }, { id: 'infernic-omnic', amount: 1 }]) {
      expect(() => summonReward({ account: emptyAccount(), entry, materials, duplicate: false, guarantee: 'none' }, 'standard')).toThrow();
    }
  });
});
