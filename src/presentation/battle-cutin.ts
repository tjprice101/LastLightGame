import { type BattleEvent, type Combatant } from '../game/battle';
import { assetUrl } from './portrait';
import { unitFacingAttributes } from './unit-facing';
import { isStarterId } from '../content/starters';

export function portraitCue(unit: Combatant, event: BattleEvent) {
  const action = event.action;
  if (event.kind !== 'attack' || (action !== 'skill1' && action !== 'skill2' && action !== 'ultimate')) return null;
  if (unit.side === 'enemy' && (unit.level ?? 0) < 50) return null;
  const ultimate = action === 'ultimate';
  const power = unit.side === 'ally' ? Math.min(1, (unit.level ?? 0) / 105 * .65 + ((unit.evolution ?? 1) - 1) / 5 * .35)
    : Math.min(1, (unit.level ?? 0) / 120);
  const name = event.abilityName ?? (unit.side === 'ally' ? unit.kit?.abilities[action].name
    : unit.enemySkills?.find((skill) => skill.action === action)?.name);
  if (!name) throw new Error('Portrait cut-in requires an ability name.');
  return { ultimate, power, name, duration: 3500 };
}

export function portraitCutin(unit: Combatant, cue: NonNullable<ReturnType<typeof portraitCue>>, art: string | null, color: string): HTMLElement {
  const panel = document.createElement('div');
  panel.className = `portrait-cutin cutin-${unit.side}${cue.ultimate ? ' cutin-ultimate' : ''}`;
  panel.setAttribute('role', 'status');
  panel.setAttribute('aria-label', `${unit.name} · ${cue.name}${cue.ultimate ? ' · Ultimate' : ''}`);
  panel.style.setProperty('--element', color);
  panel.style.setProperty('--cutin-power', String(cue.power));
  panel.innerHTML = `<span class="cutin-streaks" aria-hidden="true"></span><span class="cutin-sigil" aria-hidden="true"></span>
    <span class="cutin-crest" aria-hidden="true"><span></span></span><span class="cutin-edge cutin-edge-top" aria-hidden="true"></span><span class="cutin-edge cutin-edge-bottom" aria-hidden="true"></span>
    <span class="cutin-portrait" aria-hidden="true">${art ? `<img src="${assetUrl(`${isStarterId(unit.definitionId) && !unit.captured ? 'characters' : 'enemies'}/${art}.png`)}" alt="" ${unitFacingAttributes(art, unit.side)} width="960" height="960">`
      : '<span class="pending-enemy-art"><span></span></span>'}</span>
    <span class="cutin-copy"><small>${cue.ultimate ? unit.boss ? 'BOSS ULTIMATE' : 'LAST FLARE' : unit.side === 'enemy' ? 'ENEMY SKILL' : 'SKILL RELEASE'}</small><strong></strong><span></span><i class="cutin-divider" aria-hidden="true"></i></span>`;
  const name = panel.querySelector('.cutin-copy strong');
  const ability = panel.querySelector('.cutin-copy > span');
  if (!name || !ability) throw new Error('Portrait cut-in identity region is missing.');
  name.textContent = unit.name;
  ability.textContent = cue.name;
  return panel;
}
