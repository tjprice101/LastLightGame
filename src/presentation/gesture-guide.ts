import { actionUnavailable, type BattleState, type Combatant } from '../game/battle';
import { shatterGauge, type ActionId } from '../content/combat';
import { abilityIcon } from './ability-icon';
import { isStarterId } from '../content/starters';

export function gestureGuide(state: BattleState, actor: Combatant): string {
  if (!actor.kit) throw new Error('Gesture guide requires an owned character kit.');
  const starterId = actor.definitionId;
  const directions = [
    { action: 'ultimate', direction: 'up', arrow: '&uarr;', label: 'Last Flare' },
    { action: 'skill1', direction: 'left', arrow: '&larr;', label: 'Skill 1' },
    { action: 'skill2', direction: 'right', arrow: '&rarr;', label: 'Skill 2' },
    { action: 'light', direction: 'down', arrow: '&darr;', label: 'Normal' },
  ] as const;
  return `<svg class="gesture-ornament" viewBox="0 0 280 280" aria-hidden="true">
    <circle cx="140" cy="140" r="90"/><circle cx="140" cy="140" r="82"/>
    <path d="M140 20 260 140 140 260 20 140ZM140 42V112M168 140H238M140 168V238M42 140H112"/>
    <path d="m140 106 34 34-34 34-34-34Zm0-80 8 10-8 10-8-10Zm114 114-10 8-10-8 10-8ZM140 254l-8-10 8-10 8 10ZM26 140l10-8 10 8-10 8"/>
    </svg>${directions.map(({ action, direction, arrow, label }) => {
      const reason = actionUnavailable(state, actor, action);
      return `<span class="gesture-direction gesture-${direction}" data-gesture-action="${action}" data-available="${!reason}">
        <span class="gesture-arrow">${arrow}</span>${isStarterId(starterId) ? abilityIcon(starterId, action) : ''}
        <strong>${label}</strong><small>${reason ? 'Unavailable' : action === 'light' ? `+${shatterGauge.gains.light} Gauge` : `${shatterGauge.costs[action]} Gauge`}</small></span>`;
    }).join('')}<span class="gesture-center" aria-hidden="true">DRAG</span>
    <span class="gesture-status" role="status">Choose a direction / Release near center to cancel</span>`;
}

export function updateGestureGuide(guide: HTMLElement, state: BattleState, actor: Combatant, action: Exclude<ActionId, 'defend'> | null): void {
  if (!actor.kit) throw new Error('Gesture combat kit is missing.');
  guide.querySelectorAll<HTMLElement>('[data-gesture-action]').forEach((direction) => {
    direction.dataset.selected = String(direction.dataset.gestureAction === action);
  });
  const status = guide.querySelector('.gesture-status');
  if (!status) throw new Error('Gesture status is missing.');
  const name = action === null ? 'Choose a direction' : action === 'light' ? 'Normal Attack' : actor.kit.abilities[action].name;
  status.textContent = `${name} / ${action ? actionUnavailable(state, actor, action) ?? 'Release to use' : 'Release near center to cancel'}`;
}
