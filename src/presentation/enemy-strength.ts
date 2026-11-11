import { formatStat, type Stats } from '../content/combat';
import { enemyCombatStats } from '../content/stat-growth';
import { dungeonEncounter, isPlayableDungeon } from '../content/dungeons';
import { infusionEncounter, isInfusionMode } from '../content/infusions';
import { isWarCharacter, warEncounter } from '../content/elemental-war';
import { oblivionEncounter } from '../content/gates-of-oblivion';
import { authoredRadiantCalibration, calibratedRadiantEnemyStats } from '../content/enemy-calibration';
import { stageBossStats } from '../game/battle';
import './enemy-strength.css';
import { phaseZeroStatsReady } from '../content/phase-zero-stats';

interface EnemyStrength {
  level: number;
  boss: boolean;
  stats: Stats;
}

function strengthValues(encounter: EnemyStrength) {
  const standard = enemyCombatStats(encounter.level, false);
  return [
    ['HP', encounter.stats.health, standard.health],
    [phaseZeroStatsReady ? 'Direct Attack' : 'Attack', encounter.stats.damage, standard.damage],
    ['Defense', encounter.stats.defense, standard.defense],
  ] as const;
}

function scalingMarkup(encounter: EnemyStrength, values: readonly (readonly [string, number, number])[]): string {
  const differences = values.filter(([, value, base]) => value !== base);
  const comparison = `standard Lv.${encounter.level} enemy`;
  return `<span class="enemy-scaling" data-enemy-scaling>
    <span class="enemy-scaling-label">${differences.length
      ? `${encounter.boss ? 'Boss' : 'Activity'} scaling vs ${comparison}`
      : `Standard Lv.${encounter.level} stats`}</span>
    ${differences.map(([label, value, base]) => {
      const change = (value / base - 1) * 100;
      const magnitude = Number(Math.abs(change).toFixed(1));
      return `<span class="enemy-scaling-${change > 0 ? 'increased' : 'decreased'}" data-scaled-stat="${label}">${label} ${change > 0 ? '+' : '-'}${magnitude || '&lt;0.1'}%</span>`;
    }).join(' ')}
  </span>`;
}

export function enemyStrengthModifiers(encounter: EnemyStrength): string {
  return scalingMarkup(encounter, strengthValues(encounter));
}

export function enemyStrength(encounter: EnemyStrength, kind: 'stage' | 'calamity' = 'stage'): string {
  const category = kind === 'calamity' ? 'calamity' : encounter.boss ? 'boss' : 'ordinary';
  const authored = kind === 'calamity' ? encounter.stats : stageBossStats(encounter.stats, encounter.boss);
  const actual = calibratedRadiantEnemyStats(authored, encounter.level, category, authoredRadiantCalibration);
  const standard = calibratedRadiantEnemyStats(enemyCombatStats(encounter.level, false), encounter.level, 'ordinary', authoredRadiantCalibration);
  const values = [
    ['HP', actual.hp, standard.hp],
    ['Attack', actual.attack, standard.attack],
    ['Defense', actual.defense, standard.defense],
  ] as const;
  return `<section class="enemy-strength" data-enemy-strength aria-label="Enemy strength">
    <h4>Lv.${encounter.level} · ${encounter.boss ? 'Boss' : 'Standard enemy'}</h4>
    <dl>${values.map(([label, value]) => `<div><dt>${label}</dt><dd>${formatStat(value)}</dd></div>`).join('')}</dl>
    ${scalingMarkup(encounter, values)}
    </section>`;
}

export function bindEnemyStrength(host: HTMLElement): void {
  host.querySelectorAll<HTMLSelectElement>('[data-dungeon-stage], [data-infusion-stage], [data-war-stage], [data-oblivion-stage]').forEach(control => {
    const panel = control.closest('[data-difficulty-panel], .activity-card');
    if (!panel?.querySelector('[data-enemy-strength]')) throw new Error('Activity enemy strength panel is missing.');
    control.addEventListener('change', () => {
      const stage = Number(control.value);
      const element = control.dataset.dungeonStage;
      const mode = control.dataset.infusionStage;
      const character = control.dataset.warStage;
      const encounter = isPlayableDungeon(element) ? dungeonEncounter(element, stage)
        : isInfusionMode(mode) ? infusionEncounter(mode, stage)
        : isWarCharacter(character) ? warEncounter(character, stage)
        : control.hasAttribute('data-oblivion-stage') ? oblivionEncounter(stage) : null;
      if (!encounter) throw new Error('Unknown activity enemy strength.');
      const strength = panel.querySelector<HTMLElement>('[data-enemy-strength]');
      if (!strength) throw new Error('Activity enemy strength panel is missing.');
      strength.outerHTML = enemyStrength(encounter);
    });
  });
}
