import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { assetUrl } from './portrait';
import { avifPreferred, pngFallback, runtimeArtPath, setAvifPreferred, thumbnailSrcset } from './image-format';

const assets = fileURLToPath(new URL('../../public/assets/', import.meta.url));
const walk = (dir: string): string[] => readdirSync(dir).flatMap(name => {
  const full = join(dir, name);
  return statSync(full).isDirectory() ? walk(full) : [full];
});

beforeEach(() => setAvifPreferred(true));
afterEach(() => setAvifPreferred(false));

describe('runtime image format', () => {
  it('serves AVIF siblings by default and the canonical PNG when AVIF is unsupported', () => {
    expect(avifPreferred()).toBe(true);
    expect(runtimeArtPath('enemies/goblin.png')).toBe('enemies/goblin.avif');
    expect(assetUrl('enemies/goblin.png')).toBe(`${import.meta.env.BASE_URL}assets/enemies/goblin.avif`);
    setAvifPreferred(false);
    expect(assetUrl('enemies/goblin.png')).toBe(`${import.meta.env.BASE_URL}assets/enemies/goblin.png`);
    expect(runtimeArtPath('music/a.mp3')).toBe('music/a.mp3');
  });

  it('keeps byte revisions on the AVIF URL and maps full/thumbnail AVIF back to PNG', () => {
    expect(pngFallback('/assets/characters/a.avif?v=1')).toBe('/assets/characters/a.png?v=1');
    expect(pngFallback('/assets/characters/a.thumb.avif?v=1')).toBe('/assets/characters/a.png?v=1');
    expect(pngFallback('/assets/characters/a.png')).toBeNull();
    expect(thumbnailSrcset('/assets/profile-pictures/p.avif')).toBe('/assets/profile-pictures/p.thumb.avif 384w, /assets/profile-pictures/p.avif 1024w');
    expect(thumbnailSrcset('/assets/backgrounds/b.avif')).toBeNull();
    expect(thumbnailSrcset('/assets/characters/a.png')).toBeNull();
  });

  it('has a current AVIF (and portrait thumbnail) encoded from every runtime PNG', () => {
    const manifest = JSON.parse(readFileSync(fileURLToPath(new URL('../../Art/provenance/runtime-avif.json', import.meta.url)), 'utf8')) as
      { settings: { quality: number; chromaSubsampling: string }; files: Record<string, { source: string; avif: number; bytes: number }> };
    expect(manifest.settings).toMatchObject({ quality: 90, chromaSubsampling: '4:4:4' });
    const stale: string[] = [];
    const pngs = walk(assets).filter(file => file.endsWith('.png'));
    for (const png of pngs) {
      const rel = png.slice(assets.length).split('\\').join('/');
      const entry = manifest.files[rel];
      const hash = createHash('sha256').update(readFileSync(png)).digest('hex');
      const thumbs = /^(characters|enemies|profile-pictures)\//.test(rel);
      if (!entry || entry.source !== hash || !existsSync(png.replace(/\.png$/, '.avif')) ||
        (thumbs && !existsSync(png.replace(/\.png$/, '.thumb.avif')))) stale.push(rel);
    }
    expect(stale, 'Run: node tools/build_avif.mjs').toEqual([]);
    expect(Object.keys(manifest.files)).toHaveLength(pngs.length);
  }, 60_000);
});
