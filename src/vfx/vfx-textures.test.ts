import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { spectacleTextures, spectacleTextureUrl } from './vfx-textures';

const root = join(__dirname, '..', '..');
const provenance = JSON.parse(readFileSync(join(root, 'Art/provenance/vfx-library-intake.json'), 'utf8')) as {
  assets: { asset: string; runtime_mode: string }[];
};

describe('Battle Spectacle texture manifest (D-484)', () => {
  it('lists unique textures that exist as runtime PNG and AVIF', () => {
    expect(new Set(spectacleTextures).size).toBe(spectacleTextures.length);
    for (const key of spectacleTextures) {
      expect(existsSync(join(root, 'public/assets/vfx', `${key}.png`)), key).toBe(true);
      expect(existsSync(join(root, 'public/assets/vfx', `${key}.avif`)), key).toBe(true);
    }
  });
  it('uses only grayscale library textures, so runtime tinting stays true to each element', () => {
    for (const key of spectacleTextures) {
      const entry = provenance.assets.find(asset => asset.asset === key);
      expect(entry, key).toBeDefined();
      expect(['L', 'LA'], key).toContain(entry!.runtime_mode);
    }
  });
  it('builds URLs under the deployment base', () => {
    expect(spectacleTextureUrl('glow/soft-glow', 'png')).toBe(`${import.meta.env.BASE_URL}assets/vfx/glow/soft-glow.png`);
    expect(spectacleTextureUrl('glow/soft-glow', 'avif')).toMatch(/assets\/vfx\/glow\/soft-glow\.avif$/);
  });
});
