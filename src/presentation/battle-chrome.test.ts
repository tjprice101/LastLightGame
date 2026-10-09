import { describe, expect, it } from 'vitest';
import { playableDungeons } from '../content/dungeons';
import { BattleView, createSession } from './battle-view';
import { elementLabel } from './element-label';

function markup(session: ReturnType<typeof createSession>): string {
  const menu = { addEventListener: () => {}, close: () => {}, showModal: () => {} };
  const host = { innerHTML: '', querySelectorAll: () => [], querySelector: (selector: string) => selector === '#battle-menu' ? menu : null };
  const view: BattleView = Object.create(BattleView.prototype);
  Object.assign(view, { host, session, actorId: 'ember', targetId: '', dragging: false });
  Reflect.apply(Reflect.get(BattleView.prototype, 'render'), view, []);
  return host.innerHTML;
}

describe('shared battle chrome', () => {
  const progress = { level: 105, evolution: 6 };
  it('renders the complete squad and accessible acting Element-Bearer selector', () => {
    const session = createSession('tide', progress, undefined, { ids: ['tide', 'sprout', 'ember'],
      progress: { tide: progress, sprout: { level: 10, evolution: 1 }, ember: progress } });
    const html = markup(session);
    expect(html).toContain('allies squad');
    expect(html).toContain('SQUAD TRAINING');
    for (const id of ['tide', 'sprout', 'ember']) expect(html).toContain(`data-actor="${id}"`);
    session.state.allies.find((ally) => ally.id === 'ember')!.spent = true;
    expect(markup(session)).toContain('data-actor="tide" aria-pressed="true"');
  });
  it('shows enemy levels and elements on field nameplates and in reference menus across all modes', () => {
    const sessions = [
      createSession('ember', progress),
      ...playableDungeons.flatMap((element) => [1, 35].map((stage) => createSession('ember', progress, { element, stage }))),
      ...(['heavens', 'abyss'] as const).map((mode) => createSession('ember', progress, { mode, stage: 35 })),
    ];
    for (const session of sessions) {
      const html = markup(session);
      for (const enemy of session.state.enemies) {
        expect(html).toContain(`<span class="unit-name">${enemy.name} ~ Lv. ${enemy.level}${elementLabel(enemy.element)}</span>`);
        const intel = html.slice(html.indexOf('class="battle-unit-intel"'));
        expect(intel).toContain(elementLabel(enemy.element));
      }
      expect(html).toContain('<span class="unit-name">Eternal Heavenflame Sovereign, Infernis ~ Lv. 105');
      expect(html).not.toContain('Lv. null');
    }
  });
  it('gives Training a themed heading and progress panel without changing field controls', () => {
    const html = markup(createSession('ember', progress));
    expect(html).toContain('class="battle-heading"');
    expect(html).toContain('SOLO TRAINING');
    expect(html).toContain('class="battle-progress"');
    expect(html).toContain('Wave 1');
    expect(html).toContain('id="end-battle-turn"');
    expect(html).toContain('class="unit-readout"');
    expect(html).toContain('class="unit-health"');
    expect(html).not.toContain('class="battle-hud"');
    const field = html.slice(0, html.indexOf('<dialog'));
    expect(field).not.toContain('battle-utilities');
    expect(field).not.toContain('id="end-battle-turn"');
    expect(field).not.toContain('unit-stats');
    expect(field).toContain('id="open-battle-menu"');
    expect(html).toContain('aria-labelledby="battle-menu-heading"');
    expect(html).toContain('Pass remaining actions');
    expect(html).toContain('class="battle-unit-intel"');
  });
  it('shows Story stage 150, neutral pending art, regional narrative and final-stage controls', () => {
    const session = createSession('ember', progress, { storyStage: 150 });
    let html = markup(session);
    expect(html).toContain('STORY CAMPAIGN');
    expect(html).toContain('Stage 150 ~ 150');
    expect(html).toContain('Riftbound Frontier');
    expect(html).toContain('pending-dungeon-scenery');
    expect(html).toContain('pending-enemy-art');
    expect(html).not.toContain('backgrounds/grassy-field');
    expect(html).toContain('Six regions in a fixed order');
    session.state.phase = 'cleared';
    html = markup(session);
    expect(html).not.toContain('data-result-continue');
    expect(html).toContain('All 150 stages cleared');
  });
  it.each(playableDungeons)('uses the same heading and readout structure in %s', (element) => {
    const html = markup(createSession('ember', progress, { element, stage: 5 }));
    expect(html).toContain('ELEMENTAL DUNGEON');
    expect(html).toContain('class="battle-heading"');
    expect(html).toContain('class="battle-progress"');
    expect(html).toContain('Stage 5 ~ 35');
    expect(html).toContain('class="unit-readout"');
  });
  it.each(['heavens', 'abyss'] as const)('uses shared chrome for %s, victory and defeat', (mode) => {
    const session = createSession('ember', progress, { mode, stage: 35 });
    const html = markup(session);
    expect(html).toContain('INFUSION TRIAL');
    expect(html).toContain('Stage 35 ~ 35');
    expect(html).toContain('class="battle-heading"');
    for (const phase of ['cleared', 'defeat'] as const) {
      session.state.phase = phase;
      const result = markup(session);
      expect(result).toContain('class="battle-progress"');
      expect(result).toContain('data-result-show');
      expect(result).toContain('battle-results');
    }
  });
});
