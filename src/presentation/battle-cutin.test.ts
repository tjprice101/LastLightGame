import { afterEach, describe, expect, it, vi } from 'vitest';
import { portraitCue, portraitCutin } from './battle-cutin';
import { BattleView } from './battle-view';
import { act, createBattle, createDungeonBattle, createInfusionBattle, endTurn } from '../game/battle';
import { unitFacingAttributes } from './unit-facing';
import { readdirSync } from 'node:fs';
import { assetUrl } from './portrait';

afterEach(() => vi.unstubAllGlobals());

describe('skill portrait cut-ins', () => {
  it('shares field-facing metadata for every supplied portrait on both sides, including captured allies', () => {
    const panel = { className: '', setAttribute: vi.fn(), style: { setProperty: vi.fn() }, innerHTML: '',
      querySelector: () => ({ textContent: '' }) };
    vi.stubGlobal('document', { createElement: () => panel });
    const battle = createBattle();
    for (const category of ['characters', 'enemies'] as const) {
      for (const filename of readdirSync(new URL(`../../public/assets/${category}/`, import.meta.url))) {
        if (!filename.endsWith('.png')) continue;
        const art = filename.slice(0, -4);
        for (const side of category === 'characters' ? ['ally'] as const : ['ally', 'enemy'] as const) {
          const unit = { ...(side === 'ally' ? battle.allies[0] : battle.enemies[0]), side,
            captured: category === 'enemies' && side === 'ally'
              ? { instanceId: 'capture:00000000-0000-4000-8000-000000000001', creatureId: 'infusion:heavens:0', locked: false }
              : undefined };
          portraitCutin(unit, { name: 'Facing check', duration: 3500, power: 1, ultimate: false }, art, '#fff');
          expect(panel.innerHTML).toContain(unitFacingAttributes(art, side));
          expect(panel.innerHTML).toContain(`/${category}/${art}.png`);
          expect(panel.innerHTML).toContain(`src="${assetUrl(`${category}/${art}.png`)}"`);
          expect(panel.innerHTML.match(/data-mirrored=/g)).toHaveLength(1);
          expect(panel.innerHTML).toMatch(/<img[^>]+data-facing=/);
        }
      }
    }
  });

  it.each(['ally', 'enemy'] as const)('animates the %s sprite wrapper, never the facing image, during an attack and return', async (side) => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    vi.stubGlobal('document', { documentElement: { dataset: { motion: 'system' } }, createElement: () => ({
      dataset: {}, className: '', innerHTML: '', setAttribute: vi.fn(), remove: vi.fn(),
      classList: { add: vi.fn() }, style: { setProperty: vi.fn(), opacity: '' },
    }) });
    const state = createDungeonBattle('chaotic', 35, 1, 'ember', { level: 105, evolution: 6 });
    const combatant = side === 'ally' ? state.allies[0] : state.enemies[0];
    const defender = side === 'ally' ? state.enemies[0] : state.allies[0];
    const image = { dataset: { facing: side === 'ally' ? 'left' : 'right' } };
    const sprite = { image };
    const bounds = { x: side === 'ally' ? 500 : 100, y: 100, width: 200, height: 200 };
    const art = { append: vi.fn(), getBoundingClientRect: () => bounds };
    const source = { getBoundingClientRect: () => bounds, style: { getPropertyValue: () => '#fff' },
      querySelector: (selector: string) => selector === '.battle-sprite' ? sprite : art };
    const target = { getBoundingClientRect: () => ({ ...bounds, x: 600 - bounds.x }),
      querySelector: () => art };
    const view = Object.create(BattleView.prototype);
    Object.assign(view, { session: { state }, disposed: false, play: vi.fn(async () => {}),
      host: { append: vi.fn(), querySelector: (selector: string) => selector.includes(combatant.id) ? source
        : selector.includes(defender.id) ? target : { textContent: '' } } });
    const impact = vi.fn(async () => {});
    await Reflect.apply(Reflect.get(BattleView.prototype, 'animate'), view, [{
      kind: 'attack', source: combatant.id, target: defender.id, action: 'light',
      message: 'Facing check', amount: 0, critical: false,
    }, impact]);
    expect(view.play.mock.calls.filter(([node]: [unknown]) => node === sprite)).toHaveLength(2);
    expect(view.play.mock.calls.some(([node]: [unknown]) => node === image)).toBe(false);
    expect(image.dataset.facing).toBe(side === 'ally' ? 'left' : 'right');
    expect(impact).toHaveBeenCalledOnce();
  });

  it('shows character skills and supportive abilities with consistent duration and actual form progression', () => {
    const state = createBattle(1, ['tide'], { tide: { level: 105, evolution: 6 } });
    state.allies[0].shatter = 100;
    const skill = act(state, 'tide', 'skill2', state.enemies[0].id).events[0];
    const ultimate = act(state, 'tide', 'ultimate', state.enemies[0].id).events[0];
    const basic = act(state, 'tide', 'light', state.enemies[0].id).events[0];
    expect(portraitCue(state.allies[0], basic)).toBeNull();
    expect(portraitCue(state.allies[0], skill)).toMatchObject({ ultimate: false, power: 1, name: state.allies[0].kit!.abilities.skill2.name });
    expect(portraitCue(state.allies[0], skill)?.duration).toBe(3500);
    expect(portraitCue(state.allies[0], ultimate)?.duration).toBe(3500);
    expect(portraitCue(state.allies[0], ultimate)?.ultimate).toBe(true);
    const young = { ...state.allies[0], level: 0, evolution: 1 };
    expect(portraitCue(young, skill)?.power).toBe(0);
  });

  it('only shows enemy skills from 50 and distinguishes boss ultimates', () => {
    const early = createDungeonBattle('infernic', 1, 1, 'ember', { level: 0, evolution: 1 });
    early.round = 3;
    const event = endTurn(early).events.find((event) => event.kind === 'attack')!;
    expect(event.action).toBe('skill1');
    expect(portraitCue(early.enemies[0], event)).toBeNull();
    for (const mode of ['heavens', 'abyss'] as const) {
      const state = createInfusionBattle(mode, 35, 1, 'ember', { level: 105, evolution: 6 });
      state.round = 6;
      const attack = endTurn(state).events.find((event) => event.kind === 'attack')!;
      expect(portraitCue(state.enemies[0], attack)).toMatchObject({ ultimate: true, power: 1, duration: 3500 });
    }
    expect(portraitCue({ ...early.enemies[0], level: 50 }, event)).not.toBeNull();
  });

  it.each([1, 2, 3])('keeps a measurable reading hold while still scaling at %ix', (speed) => {
    const state = createBattle(1, ['ember'], { ember: { level: 0, evolution: 1 } });
    for (const action of ['skill1', 'ultimate'] as const) {
      const cue = portraitCue(state.allies[0], { kind: 'attack', source: 'ember', target: state.enemies[0].id,
        action, abilityName: 'Reading-time check', message: 'Reading-time check', amount: 0, critical: false })!;
      expect(cue.duration).toBe(3500);
      expect(cue.duration / speed).toBeCloseTo(3500 / speed);
      expect(cue.duration * (.9 - .12) / speed).toBeCloseTo(2730 / speed);
    }
  });

  it('builds element-colored ornamental ribbons with real names rather than interpolated HTML', () => {
    const name = { textContent: '' };
    const ability = { textContent: '' };
    const panel = { className: '', setAttribute: vi.fn(), style: { setProperty: vi.fn() }, innerHTML: '',
      querySelector: (selector: string) => selector === '.cutin-copy strong' ? name : ability };
    vi.stubGlobal('document', { createElement: () => panel });
    const enemy = createInfusionBattle('abyss', 35, 1, 'ember', { level: 105, evolution: 6 }).enemies[0];
    const cue = portraitCue(enemy, { kind: 'attack', source: enemy.id, target: 'ember',
      action: 'ultimate', abilityName: '<Void & Ruin>', message: 'test', amount: 0, critical: false })!;
    portraitCutin(enemy, cue, enemy.art ?? null, '#e45cad');
    expect(panel.className).toContain('cutin-enemy cutin-ultimate');
    expect(panel.innerHTML).toContain('cutin-crest');
    expect(panel.innerHTML).toContain('cutin-edge-top');
    expect(panel.innerHTML).toContain('cutin-divider');
    expect(panel.innerHTML).toContain('BOSS ULTIMATE');
    expect(panel.innerHTML).not.toContain('<Void & Ruin>');
    expect(name.textContent).toBe(enemy.name);
    expect(ability.textContent).toBe('<Void & Ruin>');
    expect(panel.style.setProperty).toHaveBeenCalledWith('--element', '#e45cad');
  });

  it.each(['failed', 'disposed'] as const)('cleans cut-in nodes when %s and never duplicates impact', async (outcome) => {
    vi.stubGlobal('document', { documentElement: { dataset: { motion: 'system' } }, createElement: () => ({
      className: '', setAttribute: vi.fn(), style: { setProperty: vi.fn() }, innerHTML: '',
      querySelector: () => ({ textContent: '' }), remove: vi.fn(),
    }) });
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    const state = createBattle(1, ['ember'], { ember: { level: 105, evolution: 6 } });
    state.allies[0].shatter = 100;
    const entry = act(state, 'ember', 'skill1', state.enemies[0].id).events[0];
    const source = { querySelector: () => ({}), getBoundingClientRect: () => ({ x: 100, y: 100 }) };
    const target = { getBoundingClientRect: () => ({ x: 0, y: 100 }) };
    const view = Object.create(BattleView.prototype);
    const nodes: { remove: ReturnType<typeof vi.fn> }[] = [];
    Object.assign(view, { session: { state }, disposed: false, host: {
      querySelector: (selector: string) => selector.includes('ember') ? source : target,
      append: (node: { remove: ReturnType<typeof vi.fn> }) => nodes.push(node),
    }, play: vi.fn(async () => {
      if (outcome === 'failed') throw new Error('Animation failed');
      view.disposed = true;
    }) });
    const impact = vi.fn();
    const presentation = Reflect.apply(Reflect.get(BattleView.prototype, 'animate'), view, [entry, impact]);
    if (outcome === 'failed') await expect(presentation).rejects.toThrow('Animation failed');
    else await presentation;
    expect(nodes).toHaveLength(1);
    expect(nodes[0].remove).toHaveBeenCalledOnce();
    expect(impact).not.toHaveBeenCalled();
    const frames = view.play.mock.calls[0][1];
    expect(frames[1]).toEqual({ opacity: 1, transform: 'translateX(0) scale(1)', offset: .12 });
    expect(frames[2]).toEqual({ opacity: 1, transform: 'translateX(0) scale(1)', offset: .9 });
    expect(frames[3]).toEqual({ opacity: 0, transform: 'translateX(0) scale(1)' });
    expect(view.play.mock.calls[0][2]).toBe(3500);
  });
});
