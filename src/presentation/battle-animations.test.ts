import { describe, expect, it, vi } from 'vitest';
import { act, type BattleEvent } from '../game/battle';
import { BattleView, createSession } from './battle-view';
import { attackFlair } from './battle-effects';
import { infusionStageCount } from '../content/activities';
import { storyRules } from '../content/story';

vi.mock('./settings', () => ({ reducedMotion: () => false }));

const destinations = [
  undefined, { storyStage: storyRules.stages },
  ...(['infernic', 'oceanic', 'botanic', 'atmospheric', 'tranquilitic', 'chaotic'] as const).map(element => ({ element, stage: 35 })),
  ...(['heavens', 'abyss', 'machines', 'treasury', 'sanctuary', 'roses'] as const).map(mode => ({ mode, stage: infusionStageCount(mode) })),
  ...(['nerithe', 'orvella', 'vaelor'] as const).map(character => ({ character, stage: 10 })),
];

describe('shared animation dispatch in every battle activity', () => {
  it('does not let a disposed animation unlock the replacement view on the same host', async () => {
    const session = createSession('ember');
    const result = act(session.state, 'ember', 'light', session.state.enemies[0].id);
    let finish!: () => void;
    const host = { setAttribute: vi.fn(), querySelectorAll: () => [], querySelector: () => null };
    const view = Object.create(BattleView.prototype);
    Object.assign(view, { session, disposed: false, host,
      animate: () => new Promise<void>(resolve => { finish = resolve; }),
      render: vi.fn(), focusResults: vi.fn(), showTurnCue: vi.fn() });
    const pending = Reflect.apply(Reflect.get(BattleView.prototype, 'present'), view, [result]);
    view.disposed = true;
    host.setAttribute('aria-busy', 'true');
    finish();
    await pending;
    expect(host.setAttribute).not.toHaveBeenCalledWith('aria-busy', 'false');
    expect(view.render).not.toHaveBeenCalled();
  });
  it.each(destinations.map((destination, index) => [index, destination] as const))('presents skill and impact events in activity %i locally and authoritatively', async (_index, destination) => {
    for (const online of [false, true]) {
      const session = createSession('nerithe', { level: 105, evolution: 6 }, destination);
      session.entrancePending = false;
      session.state.allies[0].shatter = 100;
      const before = structuredClone(session.state);
      const result = act(session.state, 'nerithe', 'skill2', session.state.enemies[0].id);
      const events: BattleEvent[] = [];
      const animate = vi.fn(async (entry: BattleEvent, impact?: () => Promise<void>) => {
        events.push(entry);
        if (impact) await impact();
      });
      const view = Object.create(BattleView.prototype);
      Object.assign(view, { session, disposed: false, host: {
        setAttribute: vi.fn(), querySelectorAll: () => [], querySelector: () => null,
      }, animate, render: vi.fn(), focusResults: vi.fn(), showTurnCue: vi.fn() });
      if (online) await Reflect.apply(Reflect.get(BattleView.prototype, 'presentAuthoritative'), view,
        [{ session: { ...session, state: result.state }, result }, result]);
      else await Reflect.apply(Reflect.get(BattleView.prototype, 'present'), view, [result]);
      expect(events.filter(event => event.kind === 'attack')).toHaveLength(1);
      expect(events.filter(event => event.kind === 'damage')).toHaveLength(before.enemies.length);
      expect(events.find(event => event.kind === 'attack')?.abilityName).toBe(before.allies[0].kit?.abilities.skill2.name);
      expect(attackFlair(before.allies[0], 'skill2').signature).toBe('meridian');
      expect(view.busy).toBe(false);
      expect(view.host.setAttribute).toHaveBeenLastCalledWith('aria-busy', 'false');
    }
  });
});
