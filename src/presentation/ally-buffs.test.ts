// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { act, actAndAdvanceTurn, createBattle } from '../game/battle';
import { defenseMode, formatStat } from '../content/combat';
import { buffSnapshot } from '../game/battle-buffs';
import { allyBuffs } from './ally-buffs';
import { unitReadout } from './unit-readout';
import { BattleView } from './battle-view';
import { healthSnapshot, impactEvents } from './battle-health';

describe('actual allied effects beside HP', () => {
  it('separates active shields, damage buffs and stored character charges without mutating combat', () => {
    const unit = createBattle(7, ['tide']).allies[0];
    unit.shield = 25.5;
    unit.pilot = { ward: 2 };
    unit.attackBoost = { fraction: .3, throughRound: 3 };
    unit.defending = true;
    unit.omnicProtection = .15;
    const before = structuredClone(unit);
    const html = unitReadout(unit, true, [unit], 2);
    for (const text of ['Shield 25.5', 'Damage +30% · through turn 3', `Defense · -${defenseMode.damageReduction * 100}% damage`,
      'Next hit -15%', 'Oceanic Protection 2 / 3 charges', 'Skill 1 spends them to strengthen Weaken']) expect(html).toContain(text);
    expect(unit).toEqual(before);
    unit.attackBoost.throughRound = 1;
    unit.shield = 0;
    unit.defending = false;
    unit.omnicProtection = 0;
    expect(allyBuffs(buffSnapshot(unit), 2)).toBe('');
    unit.recoverThrough = 3;
    expect(allyBuffs(buffSnapshot(unit), 2)).toContain('Recovering · through turn 3');
    expect(allyBuffs(buffSnapshot(unit), 4)).toBe('');
    unit.hp = 0;
    expect(allyBuffs(buffSnapshot(unit), 2)).toBe('');
  });

  it('captures real team shields and attack buffs at the moment of application', () => {
    const state = createBattle(7, ['tide', 'sprout']);
    state.allies.forEach(unit => { unit.shatter = 100; });
    const shielded = act(state, 'tide', 'skill2', state.enemies[0].id);
    const shields = shielded.events.filter(event => event.kind === 'shield');
    expect(shields).toHaveLength(2);
    for (const event of shields) expect(event.buffs?.shield).toBe(25);
    shielded.state.allies[1].hp -= 40;
    const healed = act(shielded.state, 'sprout', 'skill2', state.enemies[0].id);
    const boosts = healed.events.filter(event => event.kind === 'status' && event.buffs?.attackBoost);
    expect(new Set(boosts.map(event => event.target))).toEqual(new Set(['tide', 'sprout']));
    for (const event of boosts) {
      expect(event.buffs?.attackBoost).toEqual({ fraction: .1, throughRound: 2 });
      expect(event.buffs?.shield).toBe(25);
    }
    for (const event of shields) expect(event.buffs?.attackBoost).toBeUndefined();
    const attackIndex = healed.events.findIndex(event => event.kind === 'attack');
    expect(impactEvents(healed.events, attackIndex)).toEqual(expect.arrayContaining(
      boosts.filter(event => event.target !== 'sprout').map(event => healed.events.indexOf(event))));
  });

  it('updates remaining shield and HP at impact rather than peeking at the final resolved state', async () => {
    const before = createBattle(7, ['tide']);
    before.allies[0].shatter = 100;
    const result = actAndAdvanceTurn(before, 'tide', 'skill2', before.enemies[0].id);
    const shield = result.events.find(event => event.kind === 'shield')!;
    const absorbed = result.events.find(event => event.kind === 'damage' && event.target === 'tide')!;
    expect(shield.buffs?.shield).toBe(25);
    expect(absorbed.buffs?.shield).toBeLessThan(25);
    const target = document.createElement('div');
    target.innerHTML = `<span class="health-track"><span></span></span>${unitReadout(before.allies[0], true, before.allies, 1)}`;
    const view = Object.create(BattleView.prototype);
    Object.assign(view, {
      session: { state: result.state }, displayedHealth: healthSnapshot(before.allies),
      displayedBuffs: new Map(before.allies.map(unit => [unit.id, buffSnapshot(unit)])),
      host: { querySelector: () => target }, play: () => Promise.resolve(),
    });
    const animate = Reflect.get(BattleView.prototype, 'animate');
    await Reflect.apply(animate, view, [shield]);
    expect(target.querySelector('[data-buff="shield"]')?.textContent).toContain('Shield 25');
    expect(target.querySelector('.unit-health')?.textContent).toBe(`HP ${formatStat(before.allies[0].hp)} / ${formatStat(before.allies[0].stats.health)}`);
    await Reflect.apply(animate, view, [absorbed]);
    const remaining = absorbed.buffs!.shield;
    if (remaining > 0) expect(target.querySelector('[data-buff="shield"]')?.textContent).toContain(`Shield ${remaining}`);
    else expect(target.querySelector('[data-buff="shield"]')).toBeNull();
  });

  it('supports legacy shield events without new snapshots and hides effects on defeat', () => {
    const unit = createBattle(7, ['tide']).allies[0];
    const target = document.createElement('div');
    target.innerHTML = unitReadout(unit, true, [unit], 1);
    const view = Object.create(BattleView.prototype);
    Object.assign(view, { session: { state: { allies: [unit], round: 1 } },
      displayedBuffs: new Map([[unit.id, buffSnapshot(unit)]]) });
    const update = Reflect.get(BattleView.prototype, 'updateBuffs');
    const event = { kind: 'shield', target: unit.id, amount: 25 };
    Reflect.apply(update, view, [target, event]);
    expect(target.textContent).toContain('Shield 25');
    Reflect.apply(update, view, [target, { ...event, kind: 'damage', shieldRemaining: 5 }]);
    expect(target.textContent).toContain('Shield 5');
    Reflect.apply(update, view, [target, { ...event, kind: 'damage', shieldRemaining: 0 }, false]);
    expect(target.querySelector('.unit-active-buffs')?.textContent).toBe('');
  });
});
