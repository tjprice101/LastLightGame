import { describe, expect, it } from 'vitest';
import { sceneFragment, sceneIds, sceneUniforms, sceneVertex } from './scene-glsl';

const count = (text: string, pattern: RegExp) => (text.match(pattern) ?? []).length;

describe('scene shader sources', () => {
  it('has the ten first scenes', () => {
    expect(sceneIds).toEqual(['sanctuary', 'astral', 'vault', 'expanse', 'ember', 'tide', 'gale', 'grove', 'stillness', 'rift']);
  });
  it.each(sceneIds)('%s is WebGL 1 compatible and well formed', id => {
    const source = sceneFragment(id);
    expect(source).not.toMatch(/#version|texture\(|\bout vec4\b|fragColor/);
    expect(source).toContain('gl_FragColor');
    expect(count(source, /vec3 scene\(vec2 p, vec2 uv\)/g)).toBe(1);
    expect(count(source, /void main\(\)/g)).toBe(1);
    expect(count(source, /\{/g)).toBe(count(source, /\}/g));
    expect(count(source, /\(/g)).toBe(count(source, /\)/g));
  });
  it.each(sceneIds)('%s declares every uniform the engine sets and samples no texture', id => {
    const source = sceneFragment(id);
    for (const name of sceneUniforms) expect(source).toMatch(new RegExp(`uniform (float|vec2|vec3) ${name};`));
    expect(source).not.toContain('sampler2D');
  });
  it.each(sceneIds)('%s writes every number as a float', id => {
    // GLSL ES 1.00 has no implicit int-to-float conversion: a bare integer in float maths fails to compile.
    const body = sceneFragment(id).replace(/\/\/.*$/gm, '').replace(/for \(int i = 0; i < \d+; i\+\+\)/g, '')
      .replace(/\b(vec[234]|mat2|uC[123]|fbm3|hash1)\b/g, 'name');
    expect(body.match(/(?<![\w.])\d+(?![\w.])/g) ?? []).toEqual([]);
  });
  it.each(sceneIds)('%s only calls smoothstep with rising edges', id => {
    // smoothstep(a, b, x) with a >= b is undefined in GLSL; falling edges use fall().
    const calls = [...sceneFragment(id).matchAll(/smoothstep\((-?[\d.]+), (-?[\d.]+),/g)];
    for (const [call, low, high] of calls) expect(Number(low), call).toBeLessThan(Number(high));
  });
  it('the vertex shader draws the supplied triangle', () => {
    expect(sceneVertex).toContain('attribute vec2 aPos');
  });
});
