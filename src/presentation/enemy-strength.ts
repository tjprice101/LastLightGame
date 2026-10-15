import { formatStat, type Stats } from '../content/combat';
import { enemyCombatStats } from '../content/stat-growth';
import { dungeonEncounter, isPlayableDungeon } from '../content/dungeons';
import { infusionEncounter, isInfusionMode } from '../content/infusions';
import { isWarCharacter, warEncounter } from '../content/elemental-war';

interface EnemyStrength {
  level: number;
  boss: boolean;
  stats: Stats;
}

export function enemyStrength(encounter: EnemyStrength): string {
  const standard = enemyCombatStats(encounter.level, false);
  const values = [
    ['HP', encounter.stats.health, standard.health],
    ['Attack', encounter.stats.damage, standard.damage],
    ['Defense', encounter.stats.defense, standard.defense],
  ] as const;
  const differences = values.filter(([, value, base]) => value !== base);
  return `<section class="enemy-strength" data-enemy-strength aria-label="Enemy strength">
    <h4>Lv.${encounter.level} · ${encounter.boss ? 'Boss' : 'Standard enemy'}</h4>
    <dl>${values.map(([label, value]) => `<div><dt>${label}</dt><dd>${formatStat(value)}</dd></div>`).join('')}</dl>
    <p>${differences.length ? `Compared with a standard Lv.${encounter.level} enemy: ${differences.map(([label, value, base]) => {
      const change = (value / base - 1) * 100;
      return `${change > 0 ? '+' : ''}${Number(change.toFixed(1))}% ${label}`;
    }).join(' · ')}.` : 'Standard stats for this level.'}</p>
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
