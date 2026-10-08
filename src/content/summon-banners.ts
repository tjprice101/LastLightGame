import { standardBanner, standardBannerPool } from './standard-banner';
import { roseBanner, roseBannerPool } from './rose-banner';

export const summonBanners = [
  { ...standardBanner, pool: standardBannerPool },
  { ...roseBanner, pool: roseBannerPool },
] as const;

export type SummonBanner = (typeof summonBanners)[number];
export type SummonBannerId = SummonBanner['id'];

export function isSummonBannerId(value: unknown): value is SummonBannerId {
  return summonBanners.some((banner) => banner.id === value);
}

export function getSummonBanner(id: string): SummonBanner {
  const banner = summonBanners.find((entry) => entry.id === id);
  if (!banner) throw new Error('Unknown summon banner.');
  return banner;
}
