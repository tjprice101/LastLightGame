import { formatStat, type Stats } from '../content/combat';
import { enemyCombatStats } from '../content/stat-growth';
import { dungeonEncounter, isPlayableDungeon } from '../content/dungeons';
import { infusionEncounter, isInfusionMode } from '../content/infusions';
import { isWarCharacter, warEncounter } from '../content/elemental-war';
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

export function enemyStrengthModifiers(encounter: EnemyStrength): string {
  const values = strengthValues(encounter);
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

export function enemyStrength(encounter: EnemyStrength): string {
  const values = strengthValues(encounter);
  return `<section class="enemy-strength" data-enemy-strength aria-label="Enemy strength">
    <h4>Lv.${encounter.level} · ${encounter.boss ? 'Boss' : 'Standard enemy'}</h4>
    <dl>${values.map(([label, value]) => `<div><dt>${label}</dt><dd>${formatStat(value)}</dd></div>`).join('')}</dl>
    ${enemyStrengthModifiers(encounter)}
    </section>`;
}

export function bindEnemyStrength(host: HTMLElement): void {
  host.querySelectorAll<HTMLSelectElement>('[data-dungeon-stage], [data-infusion-stage], [data-war-stage]').forEach(control => {
    const panel = control.closest('[data-difficulty-panel], .activity-card');
    if (!panel?.querySelector('[data-enemy-strength]')) throw new Error('Activity enemy strength panel is missing.');
    control.addEventListener('change', () => {
      const stage = Number(control.value);
      const element = control.dataset.dungeonStage;
      const mode = control.dataset.infusionStage;
      const character = control.dataset.warStage;
      const encounter = isPlayableDungeon(element) ? dungeonEncounter(element, stage)
        : isInfusionMode(mode) ? infusionEncounter(mode, stage)
        : isWarCharacter(character) ? warEncounter(character, stage) : null;
      if (!encounter) throw new Error('Unknown activity enemy strength.');
      const strength = panel.querySelector<HTMLElement>('[data-enemy-strength]');
      if (!strength) throw new Error('Activity enemy strength panel is missing.');
      strength.outerHTML = enemyStrength(encounter);
    });
  });
}
