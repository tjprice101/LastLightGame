import { describe, expect, it } from 'vitest';
import { blurFrag, compositeFrag, thresholdFrag } from './glsl';
import { fxSlots, veilModes } from './spectacle-fx';

const sources = { thresholdFrag, blurFrag, compositeFrag };
const count = (text: string, pattern: RegExp) => (text.match(pattern) ?? []).length;

describe('shader sources', () => {
  it.each(Object.entries(sources))('%s is WebGL 1 compatible and well formed', (_name, source) => {
    expect(source.startsWith('#define SHADER_NAME LAST_LIGHT_')).toBe(true);
    expect(source).not.toMatch(/#version|texture\(|\bout vec4\b/);
    expect(source).toContain('gl_FragColor');
    expect(count(source, /\{/g)).toBe(count(source, /\}/g));
    expect(count(source, /\(/g)).toBe(count(source, /\)/g));
  });
  it('declares one uniform slot per state slot', () => {
    const size = (name: string) => Number(new RegExp(`uniform vec4 ${name}\\[(\\d+)\\]`).exec(compositeFrag)?.[1]);
    for (const name of ['uEdgeRect', 'uEdgeColor', 'uEdgeShape']) expect(size(name)).toBe(fxSlots.edge);
    for (const name of ['uCritA', 'uCritB', 'uCritColor']) expect(size(name)).toBe(fxSlots.crit);
    for (const name of ['uVeilA', 'uVeilB', 'uVeilCore', 'uVeilMain', 'uVeilEdge']) expect(size(name)).toBe(fxSlots.veil);
    expect(compositeFrag).toContain(`i < ${fxSlots.edge}; i++) edges += edgeLight`);
    expect(compositeFrag).toContain(`i < ${fxSlots.crit}; i++) crits += critLight`);
    expect(compositeFrag).toContain(`i < ${fxSlots.veil}; i++)`);
  });
  it('names every element veil in mode order', () => {
    const positions = veilModes.map(mode => compositeFrag.indexOf(`// ${mode[0].toUpperCase()}${mode.slice(1)}:`));
    expect(positions.every(position => position > 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });
  it('uses no texture beyond the scene and its bloom', () => {
    expect(count(compositeFrag, /uniform sampler2D/g)).toBe(2);
  });
});
