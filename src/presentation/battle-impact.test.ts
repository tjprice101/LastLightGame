import { describe, expect, it } from 'vitest';
import { BattleView } from './battle-view';
import { actAndAdvanceTurn, createBattle } from '../game/battle';
import { healthSnapshot, impactEvents } from './battle-health';

describe('attack presentation impact boundary', () => {
  it('keeps automatic enemy-phase burn ticks separate from the triggering skill impact', () => {
    const state = createBattle(1729, ['ember']);
    state.allies[0].shatter = state.allies[0].stats.shatterCapacity;
    state.enemies[0].hp = state.enemies[0].stats.health = 200;
    const result = actAndAdvanceTurn(state, 'ember', 'skill1', state.enemies[0].id);
    const periodicIndex = result.events.findIndex((event) => event.periodic);
    expect(periodicIndex).toBeGreaterThan(0);
    expect(impactEvents(result.events, 0)).not.toContain(periodicIndex);
  });
  it('updates HP/bar and displays damage at impact, before return and number animations finish', async () => {
    const before = createBattle(1729, ['ember']);
    before.allies[0].stats.crit = 0;
    const result = actAndAdvanceTurn(before, 'ember', 'light', before.enemies[0].id);
    const damage = result.events[impactEvents(result.events, 0)[0]];
    const originalHP = before.enemies[0].stats.health;
    const bar = { style: { width: '100%' } };
    const hp = { textContent: `HP ${originalHP} / ${originalHP}` };
    const classes = new Set<string>();
    const numbers: { textContent: string }[] = [];
    const sprite = {};
    const bounds = { x: 0, y: 0, width: 200, height: 200 };
    const art = { append: () => {}, getBoundingClientRect: () => bounds };
    const target = {
      getBoundingClientRect: () => bounds,
      querySelector: (selector: string) => selector === '.health-track > span' ? bar
        : selector === '.unit-health' ? hp : art,
      append: (number: { textContent: string }) => numbers.push(number),
      classList: { add: (value: string) => classes.add(value), remove: (value: string) => classes.delete(value) },
    };
    const source = {
      getBoundingClientRect: () => ({ ...bounds, x: 300 }),
      querySelector: (selector: string) => selector === '.battle-sprite' ? sprite : art,
      style: { getPropertyValue: () => '#fff' },
    };
    const view = Object.create(BattleView.prototype);
    Object.assign(view, {
      session: { state: result.state },
      displayedHealth: healthSnapshot([...before.allies, ...before.enemies]),
      host: { querySelector: (selector: string) => selector.endsWith(' .battle-art') ? art : selector.includes('ember') ? source
        : selector.includes(damage.target) ? target : { textContent: '' }, append: () => {} },
    });
    let finishWindup = () => {};
    let finishVisuals = () => {};
    const windup = new Promise<void>((resolve) => { finishWindup = resolve; });
    const visuals = new Promise<void>((resolve) => { finishVisuals = resolve; });
    let calls = 0;
    view.play = () => ++calls === 1 ? windup : visuals;
    const originalDocument = globalThis.document;
    Object.defineProperty(globalThis, 'document', { configurable: true, value: {
      documentElement: { dataset: { motion: 'system' } },
      createElement: () => ({ dataset: {}, classList: { add: () => {} }, style: { setProperty: () => {} }, setAttribute: () => {}, remove: () => {}, textContent: '' }),
    } });
    const originalMedia = globalThis.matchMedia;
    Object.defineProperty(globalThis, 'matchMedia', { configurable: true, value: () => ({ matches: false }) });
    try {
      const animate = Reflect.get(BattleView.prototype, 'animate');
      const presentation = Reflect.apply(animate, view, [result.events[0], () => Reflect.apply(animate, view, [damage])]);
      expect(hp.textContent).toBe(`HP ${originalHP} / ${originalHP}`);
      expect(bar.style.width).toBe('100%');
      expect(numbers).toHaveLength(0);
      finishWindup();
      for (let frame = 0; frame < 12; frame++) await Promise.resolve();
      expect(hp.textContent).toBe(`HP ${originalHP - damage.amount} / ${originalHP}`);
      expect(Number.parseFloat(bar.style.width)).toBeCloseTo((originalHP - damage.amount) / originalHP * 100);
      expect(numbers[0].textContent).toBe(`-${damage.amount}`);
      finishVisuals();
      await presentation;
    } finally {
      Object.defineProperty(globalThis, 'document', { configurable: true, value: originalDocument });
      Object.defineProperty(globalThis, 'matchMedia', { configurable: true, value: originalMedia });
    }
  });
});
