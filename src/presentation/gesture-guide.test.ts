import { describe, expect, it } from 'vitest';
import { createBattle } from '../game/battle';
import { gestureGuide } from './gesture-guide';

describe('ornate directional gesture guide', () => {
  it('shows all four directions with explicit unavailable skills and no Defense direction', () => {
    const state = createBattle(1729, ['ember']);
    const guide = gestureGuide(state, state.allies[0]);
    for (const direction of ['up', 'left', 'right', 'down']) expect(guide).toContain(`gesture-${direction}`);
    expect(guide.match(/data-available="false"/g)).toHaveLength(3);
    expect(guide.match(/data-available="true"/g)).toHaveLength(1);
    expect(guide).toContain('gesture-ornament');
    expect(guide).toContain('role="status"');
    expect(guide).not.toContain('data-gesture-action="defend"');
  });
  it('marks charged skills available without altering state or inventing icons', () => {
    const state = createBattle(1729, ['tide']);
    state.allies[0].shatter = 100;
    const original = structuredClone(state);
    expect(gestureGuide(state, state.allies[0]).match(/data-available="true"/g)).toHaveLength(4);
    expect(state).toEqual(original);
  });
});
