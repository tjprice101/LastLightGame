import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('runtime unit art contract', () => {
  it.each(['characters', 'enemies'])('%s exports use 960px square RGBA PNGs', (category) => {
    const directory = new URL(`../../public/assets/${category}/`, import.meta.url);
    const images = readdirSync(directory).filter((filename) => filename.endsWith('.png'));
    expect(images.length).toBeGreaterThan(0);
    for (const filename of images) {
      const png = readFileSync(new URL(filename, directory));
      expect(png.subarray(0, 8).toString('hex'), filename).toBe('89504e470d0a1a0a');
      expect(png.subarray(12, 16).toString('ascii'), filename).toBe('IHDR');
      expect(png.readUInt32BE(16), `${filename} width`).toBe(960);
      expect(png.readUInt32BE(20), `${filename} height`).toBe(960);
      expect(png[24], `${filename} bit depth`).toBe(8);
      expect(png[25], `${filename} RGBA color type`).toBe(6);
    }
  });

  describe('runtime battle scenery', () => {
    it('preserves the supplied opaque landscape without unit-art processing', () => {
      const source = readFileSync(new URL('../../Art/source/backgrounds/Grassy%20Field.png', import.meta.url));
      const runtime = readFileSync(new URL('../../public/assets/backgrounds/grassy-field.png', import.meta.url));
      expect(runtime.equals(source)).toBe(true);
      expect(runtime.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
      expect(runtime.readUInt32BE(16)).toBe(1456);
      expect(runtime.readUInt32BE(20)).toBe(816);
      expect(runtime[25]).toBe(2);
    });
  });
});
