// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { emptyAccount } from '../game/account';
import { elements } from '../content/activities';
import { dungeonEncounter, isPlayableDungeon } from '../content/dungeons';
import { infusionEncounter, isInfusionMode } from '../content/infusions';
import { isWarCharacter, warEncounter } from '../content/elemental-war';
import { storyEncounter } from '../content/story';
import { calamityActivities, calamityEncounter } from '../content/calamity';
import { enemyCombatStats } from '../content/stat-growth';
import { formatStat } from '../content/combat';
import { gameplayHub } from './gameplay';
import { storyCampaign, bindStoryNavigation } from './story';
import { bindActivityDifficulties } from './calamity';
import { bindEnemyStrength, enemyStrength } from './enemy-strength';
import { unitReadout } from './unit-readout';
import { createBattle, createCalamityBattle, createDungeonBattle, createInfusionBattle, createStoryBattle, createWarBattle } from '../game/battle';
import { playableDungeons } from '../content/dungeons';

afterEach(() => document.body.replaceChildren());

function expectStats(panel: Element, encounter: { level: number; boss: boolean; stats: ReturnType<typeof enemyCombatStats> }): void {
  expect(panel.querySelector('h4')!.textContent).toBe(`Lv.${encounter.level} · ${encounter.boss ? 'Boss' : 'Standard enemy'}`);
  expect(Array.from(panel.querySelectorAll('dd')).map(cell => cell.textContent)).toEqual(
    [encounter.stats.health, encounter.stats.damage, encounter.stats.defense].map(value => formatStat(value)));
}

describe('visible enemy strength', () => {
  it('shows signed actual HP/Attack/Defense scaling in both field and full readouts for every activity', () => {
    const states = [
      createBattle(), createStoryBattle(1, 1729, 'ember', { level: 0, evolution: 1 }), createStoryBattle(25, 1729, 'ember', { level: 0, evolution: 1 }),
      ...playableDungeons.map(element => createDungeonBattle(element, 35, 1729, 'ember', { level: 0, evolution: 1 })),
      ...(['heavens', 'abyss', 'treasury', 'sanctuary', 'machines', 'roses'] as const).map(mode => createInfusionBattle(mode, 5, 1729, 'ember', { level: 0, evolution: 1 })),
      ...(['nerithe', 'orvella', 'vaelor'] as const).map(character => createWarBattle(character, 10, 1729, 'ember', { level: 0, evolution: 1 })),
      ...calamityActivities.flatMap(activity => ([1, 2, 3] as const).map(tier => createCalamityBattle(activity.id, tier, 1729, 'ember', { level: 0, evolution: 1 }))),
    ];
    for (const state of states) for (const enemy of state.enemies) {
      for (const compact of [true, false]) {
        document.body.innerHTML = unitReadout(enemy, compact);
        expect(document.querySelectorAll('[data-enemy-scaling]')).toHaveLength(1);
        expect(document.body.textContent).toContain(enemy.boss
          ? `Boss scaling vs standard Lv.${enemy.level} enemy` : `Standard Lv.${enemy.level} stats`);
        const baseline = enemyCombatStats(enemy.level!, false);
        for (const [label, key] of [['HP', 'health'], ['Attack', 'damage'], ['Defense', 'defense']] as const) {
          const badge = document.querySelector(`[data-scaled-stat="${label}"]`);
          if (enemy.stats[key] === baseline[key]) expect(badge).toBeNull();
          else {
            expect(badge?.classList.contains('enemy-scaling-increased')).toBe(true);
            expect(badge?.textContent).toBe(`${label} +${Number(((enemy.stats[key] / baseline[key] - 1) * 100).toFixed(1))}%`);
          }
        }
      }
    }
    for (const ally of states[0].allies) expect(unitReadout(ally)).not.toContain('data-enemy-scaling');
  });

  it('distinguishes reductions from increases without color alone and ignores damage taken or temporary effects', () => {
    const enemy = createBattle().enemies[0];
    enemy.level = 55;
    const standard = enemyCombatStats(55, false);
    enemy.stats = { ...standard, health: standard.health * 1.5, damage: standard.damage * .8 };
    enemy.hp = 1;
    enemy.shield = 100;
    enemy.weakened = 2;
    enemy.weakenFraction = .3;
    const before = structuredClone(enemy);
    document.body.innerHTML = unitReadout(enemy, true);
    expect(document.querySelector('.enemy-scaling-label')?.textContent).toBe('Activity scaling vs standard Lv.55 enemy');
    expect(document.querySelector('.enemy-scaling-increased')?.textContent).toBe('HP +50%');
    expect(document.querySelector('.enemy-scaling-decreased')?.textContent).toBe('Attack -20%');
    expect(document.querySelector('[data-scaled-stat="Defense"]')).toBeNull();
    expect(document.body.textContent).toContain('Weaken -30%');
    expect(enemy).toEqual(before);
    enemy.stats.damage = standard.damage * .99999;
    document.body.innerHTML = unitReadout(enemy, true);
    expect(document.querySelector('.enemy-scaling-decreased')?.textContent).toBe('Attack -<0.1%');
  });

  it('shows exact stats and real same-level differences, not an activity difficulty label', () => {
    for (const level of [1, 38, 55, 120, 140, 145, 160, 185]) {
      for (const boss of [false, true]) {
        const stats = enemyCombatStats(level, boss);
        document.body.innerHTML = enemyStrength({ level, boss, stats });
        expectStats(document.body, { level, boss, stats });
        expect(document.body.textContent).toContain(boss ? `Boss scaling vs standard Lv.${level} enemy` : `Standard Lv.${level} stats`);
      }
    }
    const stats = { ...enemyCombatStats(100, false), defense: enemyCombatStats(100, false).defense * 2 };
    document.body.innerHTML = enemyStrength({ level: 100, boss: false, stats });
    expect(document.body.textContent).toContain('Defense +100%');
    expect(document.body.textContent).not.toContain('+0%');
  });

  it('updates exact selected-stage stats repeatedly across every staged activity without writes', () => {
    const account = emptyAccount();
    account.characters.ember = { level: 105, evolution: 6 };
    account.dungeonStages = Object.fromEntries(elements.map(element => [element.id, 35]));
    account.infusionStages = { heavens: 35, abyss: 35, treasury: 25, sanctuary: 25, machines: 100, roses: 35 };
    account.warStages = { nerithe: 10, orvella: 10, vaelor: 10 };
    const before = structuredClone(account);
    document.body.innerHTML = gameplayHub(account);
    bindEnemyStrength(document.body);
    bindActivityDifficulties(document.body);
    const controls = document.querySelectorAll<HTMLSelectElement>('[data-dungeon-stage], [data-infusion-stage], [data-war-stage]');
    expect(controls).toHaveLength(15);
    for (const control of Array.from(controls)) {
      const panel = control.closest('[data-difficulty-panel], .activity-card')!;
      for (const stage of [Number(control.value), 1, 5, Number(control.options[control.options.length - 1].value)]) {
        control.value = String(stage);
        control.dispatchEvent(new Event('change', { bubbles: true }));
        const { dungeonStage, infusionStage, warStage } = control.dataset;
        const encounter = isPlayableDungeon(dungeonStage) ? dungeonEncounter(dungeonStage, stage)
          : isInfusionMode(infusionStage) ? infusionEncounter(infusionStage, stage)
          : isWarCharacter(warStage) ? warEncounter(warStage, stage) : null;
        if (!encounter) throw new Error('Unexpected stage selector in enemy strength test.');
        expect(encounter.stats).toEqual(enemyCombatStats(encounter.level, encounter.boss));
        expectStats(panel.querySelector('[data-enemy-strength]')!, encounter);
        expect(panel.querySelectorAll('[data-enemy-strength]')).toHaveLength(1);
      }
    }
    document.querySelector<HTMLButtonElement>('#difficulty-heavens-calamity-tab')!.click();
    document.querySelector<HTMLButtonElement>('#difficulty-heavens-normal-tab')!.click();
    expectStats(document.querySelector('#difficulty-heavens-normal [data-enemy-strength]')!, infusionEncounter('heavens', 35));
    for (const activity of calamityActivities) {
      const panel = document.querySelector(`[data-activity-difficulty="${activity.id}"] [data-difficulty-panel="calamity"]`)!;
      for (const tier of [1, 2, 3] as const) {
        expectStats(panel.querySelector(`[data-calamity-tier="${tier}"]`)!.closest('.calamity-tier')!.querySelector('[data-enemy-strength]')!,
          { ...calamityEncounter(activity.id, tier), boss: true });
      }
    }
    expect(account).toEqual(before);
  });

  it('refreshes Story strength when selecting an ordinary stage or regional boss', () => {
    const account = emptyAccount();
    account.storyCompleted = 25;
    document.body.innerHTML = storyCampaign(account, 'ember');
    bindStoryNavigation(document.body, account);
    for (const stage of [25, 1, 25]) {
      document.querySelector<HTMLButtonElement>(`[data-story-select="${stage}"]`)!.click();
      const detail = document.querySelector('[data-story-detail]')!;
      expectStats(detail.querySelector('[data-enemy-strength]')!, storyEncounter(stage));
    }
  });
});
