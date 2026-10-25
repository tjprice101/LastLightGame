import { afterEach, describe, expect, it, vi } from 'vitest';
import { lootArt, lootBurst, lootItems, lootLayout, lootMotion } from './battle-loot';
import { masterChest } from '../content/master-conduits';
import { setAvifPreferred } from './image-format';
import { BattleView } from './battle-view';
import { act, createDungeonBattle, createInfusionBattle, type BattleEvent } from '../game/battle';
import { conduits, conduitColor } from '../content/conduits';

class Node {
  dataset: Record<string, string> = {};
  className = '';
  textContent = '';
  title = '';
  src = '';
  alt = '';
  children: Node[] = [];
  removed = false;
  attributes = new Map<string, string>();
  properties = new Map<string, string>();
  style = { left: '', top: '', opacity: '', setProperty: (name: string, value: string) => this.properties.set(name, value),
    getPropertyValue: (name: string) => this.properties.get(name) ?? '' };
  setAttribute(name: string, value: string) { this.attributes.set(name, value); }
  getAttribute(name: string) { return this.attributes.get(name) ?? null; }
  append(child: Node) { this.children.push(child); }
  remove() { this.removed = true; }
  get childElementCount() { return this.children.length; }
}
afterEach(() => vi.unstubAllGlobals());

function fixtureDrop(element: Element | undefined): Node {
  if (!(element instanceof Node)) throw new Error('Loot fixture node is missing.');
  return element;
}

function documentFixture(reduced = false) {
  vi.stubGlobal('document', { createElement: () => new Node(), documentElement: { dataset: { motion: reduced ? 'reduced' : 'system' } } });
  vi.stubGlobal('matchMedia', () => ({ matches: false }));
  vi.stubGlobal('innerWidth', 390);
  vi.stubGlobal('innerHeight', 800);
  vi.stubGlobal('HTMLElement', Node);
}
const reward: BattleEvent = { kind: 'reward', source: 'enemy', target: '', amount: 7,
  critical: false, message: 'Loot', materials: { 'heavens-weapon': 2, 'oceanic-epic': 1, 'chaotic-omnic': 1 } };

describe('enemy-death loot presentation', () => {
  it('uses the revisioned Master chest PNG and a large chest drop instead of a text token', () => {
    documentFixture();
    setAvifPreferred(true);
    const event = { ...reward, amount: 0, materials: {}, masterChests: 1 };
    const item = lootItems(event)[0];
    expect(item.name).toBe(masterChest.name);
    expect(lootArt(item)).toMatch(/assets\/master-conduits\/grand-master-chest\.png\?v=[0-9a-f]{16}$/);
    const burst = lootBurst(event);
    const drop = fixtureDrop(burst.children[0]);
    expect(drop.className).toBe('loot-drop loot-chest');
    expect(drop.children.some(child => child.src.includes('grand-master-chest.png'))).toBe(true);
    expect(drop.children.some(child => child.className === 'loot-token')).toBe(false);
    setAvifPreferred(false);
  });
  it('gives actual Calamity reward chests the large chest-drop treatment', () => {
    documentFixture();
    const burst = lootBurst({ ...reward, amount: 0, materials: {}, calamityChest: 'calamity:machines:3' });
    expect(fixtureDrop(burst.children[0]).className).toBe('loot-drop loot-chest');
  });
  it('shows an actual Machine Conduit award as a named radiant-beam drop beside its other rewards', () => {
    documentFixture();
    const state = createInfusionBattle('machines', 1, 1729, 'ember', { level: 105, evolution: 6 });
    state.conduitSeed = 1;
    state.enemies[0].hp = 1;
    const result = act(state, 'ember', 'light', state.enemies[0].id);
    const event = result.events.find(event => event.kind === 'reward')!;
    expect(Object.keys(event.conduits ?? {})).not.toHaveLength(0);
    const before = structuredClone(event);
    const burst = lootBurst(event, () => .5);
    for (const [id, amount] of Object.entries(event.conduits ?? {})) {
      const drop = fixtureDrop(Array.from(burst.children).find(drop => fixtureDrop(drop).dataset.lootId === `conduit:${id}`));
      expect(drop.className).toBe('loot-drop loot-conduit');
      expect(drop.children[0].className).toBe('loot-beam');
      expect(drop.title).toContain(`+${amount}`);
    }
    expect(event).toEqual(before);
  });

  it('gives every Machine-tier Conduit its own artwork, beam color and saved upgrade marker', () => {
    documentFixture();
    const eligible = conduits.filter(conduit => ['Rare', 'Legendary', 'Omnic'].includes(conduit.rarity));
    const event = { ...reward, materials: undefined, conduits: Object.fromEntries(eligible.map(conduit => [conduit.id, 1])) };
    const burst = lootBurst(event, () => .5);
    eligible.forEach((conduit, index) => {
      const drop = fixtureDrop(burst.children[index + 1]);
      expect(drop.dataset.lootId).toBe(`conduit:${conduit.id}`);
      expect(drop.className).toBe('loot-drop loot-conduit');
      expect(drop.children[0].className).toBe('loot-beam');
      expect(drop.properties.get('--loot-color')).toBe(conduitColor(conduit));
      expect(drop.children[1].src).toContain(`assets/conduits/${conduit.art}.png`);
      expect(drop.children[2].className).toContain('loot-upgrade-marker');
      expect(drop.title).toContain(conduit.name);
    });
  });

  it('preserves ordinary drop scaling while large chest artwork uses its own footprint', () => {
    documentFixture();
    const event: BattleEvent = { ...reward, lycalis: 3, mechanicalComponents: 125, masterChests: 1,
      conduits: { 'aegis-capacitor': 1 }, capture: { creatureId: 'infusion:treasury:0', level: 65 },
      recruitment: 'nerithe', recruitmentOutcome: 'new' };
    const before = structuredClone(event);
    for (const random of [0, .5, .999999]) {
      const burst = lootBurst(event, () => random);
      const scale = lootMotion(() => random).size * 1.5;
      Array.from(burst.children).forEach(drop =>
        expect(fixtureDrop(drop).style.getPropertyValue('--loot-size')).toBe(String(
          fixtureDrop(drop).dataset.lootId === masterChest.id ? lootMotion(() => random).size : scale)));
      const captured = fixtureDrop(Array.from(burst.children).find(drop => fixtureDrop(drop).dataset.lootId.startsWith('capture:')));
      expect(captured.children[1].src).toContain('assets/enemies/');
      expect(captured.children[0].className).toBe('loot-beam');
    }
    expect(event).toEqual(before);
  });
  it.each([320, 390, 1280])('reserves room for large simultaneous chest drops at %ipx', width => {
    documentFixture();
    vi.stubGlobal('innerWidth', width);
    const burst = lootBurst({ ...reward, masterChests: 1 }, () => .5);
    const layout = lootLayout(burst.childElementCount, width, 800, true);
    expect(burst.dataset.largeLoot).toBe('true');
    expect(layout.spread * 2).toBeLessThanOrEqual(width);
    expect(layout.columnGap).toBe(152);
    expect(layout.top + layout.bottom).toBeLessThanOrEqual(800);
    for (const drop of Array.from(burst.children).map(fixtureDrop)) {
      expect(Math.abs(parseFloat(drop.style.getPropertyValue('--loot-x'))) + 80).toBeLessThanOrEqual(width / 2);
    }
  });

  it.each([320, 390, 1280])('spreads loot in a compact viewport-bounded cluster at %ipx', width => {
    documentFixture();
    vi.stubGlobal('innerWidth', width);
    const burst = lootBurst(reward, () => .5);
    const layout = lootLayout(burst.childElementCount, width);
    expect(layout.spread * 2).toBeLessThanOrEqual(width);
    const large = lootLayout(13, width, 740);
    expect(large.top + large.bottom).toBeLessThanOrEqual(740);
    const positions = Array.from(burst.children).map(drop => ({
      x: parseFloat(fixtureDrop(drop).style.getPropertyValue('--loot-x')),
      y: parseFloat(fixtureDrop(drop).style.getPropertyValue('--loot-y')),
    }));
    expect(positions.every(position => Math.abs(position.x) + 52 <= width / 2)).toBe(true);
    expect(layout.columns).toBe(2);
    expect(new Set(positions.map(position => position.y)).size).toBe(4);
    expect(new Set(positions.map(position => position.x)).size).toBe(2);
  });
  it('staggers even two drops instead of placing them in a horizontal line', () => {
    documentFixture();
    const event = { ...reward, materials: undefined, lycalis: 3 };
    const burst = lootBurst(event, () => .5);
    const drops = Array.from(burst.children).map(fixtureDrop);
    expect(drops).toHaveLength(2);
    expect(drops[0].style.getPropertyValue('--loot-y')).not.toBe(drops[1].style.getPropertyValue('--loot-y'));
    expect(event).toEqual({ ...reward, materials: undefined, lycalis: 3 });
  });
  it.each([0, 3, 5])('shows the snapshotted Conduit level %i as five squares', (level) => {
    documentFixture();
    const burst = lootBurst({ ...reward, materials: undefined, conduits: { 'vigil-core': 1 },
      conduitUpgrades: { 'vigil-core': level } });
    const drop = burst.children[1];
    if (!(drop instanceof Node)) throw new Error('Loot fixture node is missing.');
    const meter = drop.children[2];
    expect(meter.className).toBe('conduit-upgrade-meter loot-upgrade-marker');
    expect(meter.dataset.upgradeLevel).toBe(String(level));
    expect(meter.children).toHaveLength(5);
    expect(meter.children.filter((square) => square.className.includes('is-filled'))).toHaveLength(level);
    expect(meter.getAttribute('aria-label')).toBe(`Conduit upgrade +${level} of 5`);
  });
  it('varies each stack size, scatter and pickup speed independently within bounds', () => {
    documentFixture();
    expect(lootMotion(() => 0)).toEqual({ size: .75, scatter: -7, height: -12, duration: 850 });
    const upper = lootMotion(() => .999999);
    expect(upper.size).toBeLessThan(1.35);
    expect(upper.duration).toBe(1849);
    let draw = 0;
    const burst = lootBurst(reward, () => (++draw % 10) / 10);
    const drops = Array.from(burst.children).filter((drop): drop is HTMLElement => drop instanceof HTMLElement);
    expect(new Set(drops.map((drop) => drop.dataset.pickupDuration)).size).toBeGreaterThan(1);
    expect(new Set(drops.map((drop) => drop.style.getPropertyValue('--loot-size'))).size).toBeGreaterThan(1);
  });

  it('collects fast stacks before slow ones without removing the remaining loot', async () => {
    documentFixture();
    const art = { getBoundingClientRect: () => ({ x: 10, y: 100, width: 180, height: 180 }) };
    const source = { querySelector: () => art, classList: { add: vi.fn() } };
    const bursts: Node[] = [];
    const finish: Array<() => void> = [];
    const view = Object.create(BattleView.prototype);
    Object.assign(view, { host: { querySelector: () => source, append: (node: Node) => bursts.push(node) },
      play: vi.fn((element) => element === art ? Promise.resolve() : new Promise<void>((resolve) => finish.push(resolve))) });
    const presentation = Reflect.apply(Reflect.get(BattleView.prototype, 'animate'), view, [reward]) as Promise<void>;
    await Promise.resolve();
    finish[0]();
    await Promise.resolve();
    expect(bursts[0].children[0].style.opacity).toBe('0');
    expect(bursts[0].children[1].style.opacity).toBe('');
    expect(bursts[0].removed).toBe(false);
    finish.slice(1).forEach((resolve) => resolve());
    await presentation;
    expect(bursts[0].removed).toBe(true);
  });
  it('shows exactly the awarded stacks, quantities, supplied icons and rarity beams', () => {
    documentFixture();
    const items = lootItems(reward);
    expect(items.map((item) => item.amount)).toEqual([7, 2, 1, 1]);
    expect(items[1].art).toBe('heavens-dawnsteel-of-judgment');
    expect(items[2].color).toBe('#c898ff');
    expect(items[3].color).toBe('#ff85d9');
    const burst = lootBurst(reward);
    const currencyDrop = burst.children[0];
    if (!(currencyDrop instanceof Node)) throw new Error('Loot fixture node is missing.');
    expect(currencyDrop.children[1].src).toContain('assets/currencies/fractalis.png');
    expect(burst.childElementCount).toBe(4);
    expect(burst.getAttribute('aria-label')).toContain('7 Prismatica, 2 Dawnsteel of Judgment');
    expect(lootItems({ ...reward, materials: undefined })).toHaveLength(1);
    expect(() => lootItems({ ...reward, kind: 'damage' })).toThrow('reward');
  });

  it.each([false, true])('fades defeated enemies, briefly displays loot, collects and cleans up (reduced=%s)', async (reduced) => {
    documentFixture(reduced);
    const art = { getBoundingClientRect: () => ({ x: 10, y: 100, width: 180, height: 180 }) };
    const classes = new Set<string>();
    const source = { querySelector: () => art, classList: { add: (name: string) => classes.add(name) } };
    const bursts: Node[] = [];
    const view = Object.create(BattleView.prototype);
    let finish = () => {};
    const pending = new Promise<void>((resolve) => { finish = resolve; });
    Object.assign(view, { host: { querySelector: () => source, append: (node: Node) => bursts.push(node) },
      play: vi.fn((element) => element === art ? Promise.resolve() : pending) });
    const presentation = Reflect.apply(Reflect.get(BattleView.prototype, 'animate'), view, [reward]) as Promise<void>;
    await Promise.resolve();
    expect(classes.has('fallen')).toBe(true);
    expect(bursts).toHaveLength(1);
    expect(bursts[0].children).toHaveLength(4);
    expect(bursts[0].removed).toBe(false);
    expect(view.play).toHaveBeenCalledTimes(reduced ? 1 : 5);
    const duration = view.play.mock.calls.at(-1)?.[2];
    if (reduced) expect(duration).toBe(650);
    else { expect(duration).toBeGreaterThanOrEqual(850); expect(duration).toBeLessThan(1850); }
    finish();
    await presentation;
    expect(bursts[0].removed).toBe(true);
  });

  it('reduced-motion result presentation still shows rewards, without replaying attack animation', async () => {
    documentFixture(true);
    const state = createDungeonBattle('infernic', 1, 1729, 'ember', { level: 105, evolution: 6 });
    state.enemies[0].hp = 1;
    const result = act(state, 'ember', 'light', state.enemies[0].id);
    expect(result.state.phase).toBe('player');
    const rewards = result.events.filter((event) => event.kind === 'reward');
    expect(rewards).toHaveLength(1);
    expect(rewards[0].materials?.['infernic-common']).toBeGreaterThanOrEqual(8);
    expect(rewards[0].materials?.['infernic-common']).toBeLessThanOrEqual(10);
    const view = Object.create(BattleView.prototype);
    Object.assign(view, { session: { state, stageEvents: [], log: [] }, disposed: false,
      host: { setAttribute: vi.fn(), querySelectorAll: () => [], querySelector: () => null },
      animate: vi.fn(async () => {}), render: vi.fn() });
    await Reflect.apply(Reflect.get(BattleView.prototype, 'present'), view, [result]);
    expect(view.animate).toHaveBeenCalledOnce();
    expect(view.animate.mock.calls[0][0]).toBe(rewards[0]);
    expect(view.busy).toBe(false);
  });

  it('cleans loot on animation failure and does not spawn it after disposal during a fade', async () => {
    documentFixture();
    const art = { getBoundingClientRect: () => ({ x: 10, y: 100, width: 180, height: 180 }) };
    const source = { querySelector: () => art, classList: { add: vi.fn() } };
    const bursts: Node[] = [];
    const view = Object.create(BattleView.prototype);
    Object.assign(view, { host: { querySelector: () => source, append: (node: Node) => bursts.push(node) },
      play: vi.fn(async (element) => { if (element !== art) throw new Error('Animation rejected'); }) });
    await expect(Reflect.apply(Reflect.get(BattleView.prototype, 'animate'), view, [reward])).rejects.toThrow('Animation rejected');
    expect(bursts[0].removed).toBe(true);
    view.play = vi.fn(async () => { view.disposed = true; });
    bursts.length = 0;
    await Reflect.apply(Reflect.get(BattleView.prototype, 'animate'), view, [reward]);
    expect(bursts).toHaveLength(0);
  });
});
