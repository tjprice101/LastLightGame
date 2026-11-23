import { describe, expect, it, vi } from 'vitest';
import { FlashGovernor } from '../spectacle-timing';
import { elementStyles } from '../element-styles';
import { bloomSettings, envelope, fxSlots, softwareRenderer, SpectacleFxState, veilMode, veilModes, type FxView } from './spectacle-fx';

const view: FxView = { fieldLeft: 100, fieldTop: 50, fieldWidth: 800, fieldHeight: 400, width: 1280, height: 720 };
const palette = elementStyles.infernic.palette;
function state(now = () => 0): SpectacleFxState { return new SpectacleFxState(() => .5, now); }

describe('envelope', () => {
  it('rises, holds, falls and is 0 outside its life', () => {
    expect(envelope(-1, 100, 50, 200)).toBe(0);
    expect(envelope(0, 100, 50, 200)).toBe(0);
    expect(envelope(50, 100, 50, 200)).toBeCloseTo(.75);
    expect(envelope(120, 100, 50, 200)).toBe(1);
    expect(envelope(250, 100, 50, 200)).toBeCloseTo(.25);
    expect(envelope(350, 100, 50, 200)).toBe(0);
    expect(envelope(0, 0, 0, 100)).toBe(1);
  });
});

describe('SpectacleFxState lifecycle', () => {
  it('every overlay is finite and reports its end exactly once', () => {
    const fx = state(), ended = vi.fn();
    fx.onEnd = ended;
    expect(fx.edgeBloom({ color: 0xff8a5c, strength: 'soft', attackMs: 50, holdMs: 50, decayMs: 100 })).toBe('soft');
    expect(fx.godRays({ at: { x: 10, y: 10 }, color: 0xffffff, radius: 300, attackMs: 50, holdMs: 0, decayMs: 50 })).toBe(true);
    expect(fx.critFlash({ at: { x: 10, y: 10 }, color: 0xffffff, radius: 80, ms: 150 })).toBe(true);
    expect(fx.veil({ at: { x: 10, y: 10 }, radius: 120, mode: 'oceanic', palette, ms: 300 })).toBe(true);
    expect(fx.count).toBe(4);
    fx.advance(99);
    expect(ended).not.toHaveBeenCalled();
    fx.advance(1);
    expect(ended).toHaveBeenCalledTimes(1);
    fx.advance(200);
    expect(ended).toHaveBeenCalledTimes(4);
    expect(fx.active).toBe(false);
    fx.advance(1000);
    expect(ended).toHaveBeenCalledTimes(4);
  });
  it('does not move while the clock is frozen (hit-stop, Settings)', () => {
    const fx = state();
    fx.critFlash({ at: { x: 0, y: 0 }, color: 0xffffff, radius: 80, ms: 100 });
    const before = Array.from(fx.pack(view).critA);
    fx.advance(0);
    expect(Array.from(fx.pack(view).critA)).toEqual(before);
    expect(fx.count).toBe(1);
  });
  it('clear stops everything at once without end callbacks', () => {
    const fx = state(), ended = vi.fn();
    fx.onEnd = ended;
    fx.edgeBloom({ color: 0xffffff, strength: 'soft' });
    fx.veil({ at: { x: 0, y: 0 }, radius: 100, mode: 'chaotic', palette });
    fx.clear();
    expect(fx.active).toBe(false);
    expect(ended).not.toHaveBeenCalled();
    const u = fx.pack(view);
    expect(u.edgeColor[3]).toBe(0);
    expect(u.veilA[3]).toBe(0);
  });
  it('a full slot list displaces the overlay nearest its end', () => {
    const fx = state(), ended = vi.fn();
    fx.onEnd = ended;
    for (let index = 0; index < fxSlots.crit; index++) {
      fx.critFlash({ at: { x: index, y: 0 }, color: 0xffffff, radius: 80, ms: 300 });
      fx.advance(20);
    }
    fx.critFlash({ at: { x: 99, y: 0 }, color: 0xffffff, radius: 80, ms: 300 });
    expect(fx.count).toBe(fxSlots.crit);
    expect(ended).toHaveBeenCalledTimes(1);
    const xs = [0, 4, 8].map(at => fx.pack(view).critA[at] - view.fieldLeft);
    expect(xs).toEqual([1, 2, 99]);
  });
  it('rejects empty requests', () => {
    const fx = state();
    expect(fx.edgeBloom({ color: 0xffffff, strength: 'full', intensity: 0 })).toBeNull();
    expect(fx.godRays({ at: { x: 0, y: 0 }, color: 0xffffff, radius: 0 })).toBe(false);
    expect(fx.critFlash({ at: { x: 0, y: 0 }, color: 0xffffff, radius: 80, intensity: 0 })).toBe(false);
    expect(fx.veil({ at: { x: 0, y: 0 }, radius: -1, mode: 'botanic', palette })).toBe(false);
    expect(fx.active).toBe(false);
  });
});

describe('WCAG flash budget (R6)', () => {
  it('plays a fourth full edge bloom within a second as soft, and shares the budget with flat flashes', () => {
    let now = 0;
    const fx = state(() => now);
    const governor = new FlashGovernor();
    fx.governor = governor;
    expect(governor.request('full', now)).toBe('full');
    expect(fx.edgeBloom({ color: 0xffffff, strength: 'full' })).toBe('full');
    expect(fx.edgeBloom({ color: 0xffffff, strength: 'full' })).toBe('full');
    expect(fx.edgeBloom({ color: 0xffffff, strength: 'full' })).toBe('soft');
    now = 1001;
    expect(fx.edgeBloom({ color: 0xffffff, strength: 'full' })).toBe('full');
  });
  it('soft blooms never spend the budget', () => {
    const fx = state();
    const governor = new FlashGovernor();
    fx.governor = governor;
    for (let index = 0; index < 6; index++) fx.edgeBloom({ color: 0xffffff, strength: 'soft' });
    expect(governor.request('full', 0)).toBe('full');
  });
});

describe('uniform packing', () => {
  it('converts field-relative points to canvas pixels', () => {
    const fx = state();
    fx.godRays({ at: { x: 200, y: 100 }, color: 0xff0000, radius: 400, attackMs: 0, holdMs: 500 });
    fx.advance(10);
    const u = fx.pack(view);
    expect(Array.from(u.rayA)).toEqual([300, 150, 400, 1]);
    expect(Array.from(u.rayColor)).toEqual([1, 0, 0, 1]);
  });
  it('edge bloom covers the field by default and the whole canvas on request', () => {
    const fx = state();
    fx.edgeBloom({ color: 0xffffff, strength: 'soft' });
    fx.edgeBloom({ color: 0xffffff, strength: 'soft', area: 'screen', reach: .25 });
    const u = fx.pack(view);
    expect(Array.from(u.edgeRect)).toEqual([100, 50, 800, 400, 0, 0, 1280, 720]);
    expect(u.edgeShape[4]).toBe(180);
  });
  it('full is brighter than soft and both fade to nothing', () => {
    const soft = state(), full = state();
    soft.edgeBloom({ color: 0xffffff, strength: 'soft', attackMs: 0, holdMs: 100, decayMs: 100 });
    full.edgeBloom({ color: 0xffffff, strength: 'full', attackMs: 0, holdMs: 100, decayMs: 100 });
    soft.advance(50); full.advance(50);
    expect(full.pack(view).edgeColor[3]).toBeGreaterThan(soft.pack(view).edgeColor[3]);
    full.advance(149);
    expect(full.pack(view).edgeColor[3]).toBeLessThan(.001);
  });
  it('the critical-hit ring expands while it fades', () => {
    const fx = state();
    fx.critFlash({ at: { x: 0, y: 0 }, color: 0xffffff, radius: 100, ms: 300 });
    fx.advance(30);
    const early = Array.from(fx.pack(view).critA);
    fx.advance(200);
    const late = Array.from(fx.pack(view).critA);
    expect(late[2]).toBeGreaterThan(early[2]);
    expect(late[2]).toBeLessThanOrEqual(100);
    expect(late[3]).toBeLessThan(early[3]);
  });
  it('veils carry their element mode and palette', () => {
    const fx = state();
    veilModes.slice(0, fxSlots.veil).forEach((mode, index) =>
      fx.veil({ at: { x: index, y: 0 }, radius: 100, mode, palette: elementStyles[mode].palette }));
    fx.advance(100);
    const u = fx.pack(view);
    expect([0, 4, 8, 12].map(at => u.veilB[at])).toEqual([0, 1, 2, 3]);
    expect(u.veilMain[0]).toBeCloseTo(((elementStyles.infernic.palette.main >> 16) & 255) / 255);
    expect(u.veilA[3]).toBeGreaterThan(0);
  });
});

describe('software rendering guard', () => {
  it('recognises software WebGL and leaves real GPUs alone', () => {
    expect(softwareRenderer('ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)')).toBe(true);
    expect(softwareRenderer('llvmpipe (LLVM 15.0.7, 256 bits)')).toBe(true);
    expect(softwareRenderer('ANGLE (Microsoft, Microsoft Basic Render Driver Direct3D11 vs_5_0 ps_5_0, D3D11)')).toBe(true);
    expect(softwareRenderer('ANGLE (AMD, AMD Radeon(TM) Graphics (0x00001638) Direct3D11 vs_5_0 ps_5_0, D3D11)')).toBe(false);
    expect(softwareRenderer('Apple GPU')).toBe(false);
    expect(softwareRenderer(null)).toBe(false);
  });
});

describe('element and quality tables', () => {
  it('has one veil mode per element, in shader order', () => {
    expect(veilModes).toEqual(['infernic', 'oceanic', 'atmospheric', 'botanic', 'tranquilitic', 'chaotic']);
    for (const mode of veilModes) expect(elementStyles[mode].id).toBe(mode);
    expect(veilMode('oceanic')).toBe('oceanic');
    expect(veilMode('neutral')).toBeNull();
    expect(veilMode(null)).toBeNull();
  });
  it('low quality is cheaper, not a different look (R7)', () => {
    expect(bloomSettings.low.spreads.length).toBeLessThan(bloomSettings.high.spreads.length);
    expect(bloomSettings.low.octaves).toBeLessThan(bloomSettings.high.octaves);
    expect(bloomSettings.low.strength).toBe(bloomSettings.high.strength);
    expect(bloomSettings.low.threshold).toBe(bloomSettings.high.threshold);
  });
});
