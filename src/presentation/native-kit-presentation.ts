import { describeFighter, formatStat, type ActionId } from '../content/combat';
import { nativeIdentities } from '../content/native-identities';
import { isStarterId } from '../content/starters';
import type { BattleState, Combatant } from '../game/battle';
import { nativeForecast, nativeMarkers, nativeReadout } from '../game/native-kits';
import { createGameDialog, escapeDialogText } from './game-dialog';
import './native-kit.css';
import { readableEffect } from './effect-copy';
import { statusIcon } from './status-icon';
import { phaseZeroStatsReady } from '../content/phase-zero-stats';

export function nativeIdentityReference(unit: Combatant): string {
  if (unit.captured || !unit.kit?.nativeIdentity || !isStarterId(unit.definitionId)) return '';
  const identity = nativeIdentities[unit.definitionId];
  return `<p class="native-identity"><strong>${escapeDialogText(identity.role)}</strong> · ${escapeDialogText(identity.playLoop)}</p>`;
}

export function nativeStateReadout(state: BattleState, unit: Combatant, compact = false): string {
  if (unit.captured || !unit.kit?.nativeIdentity || unit.hp <= 0) return '';
  const rows = nativeReadout(state, unit);
  const forecast = nativeForecast(state, unit);
  if (!rows.length && !forecast.length) return '';
  // The field keeps live values only; full descriptions and forecasts stay in the Battle menu.
  return `<span class="native-kit-state" aria-label="Native battle state">${rows.map(row =>
    `<span class="native-state-row" data-native-label="${escapeDialogText(row.label)}" data-native-value="${escapeDialogText(row.value)}"><strong>${(row.icons ?? []).map(statusIcon).join('')}${escapeDialogText(row.label)}: ${escapeDialogText(row.value.replace(/(\d)\/(?=\d)/g, '$1 / '))}</strong>${compact || !row.description ? '' : `<small>${escapeDialogText(readableEffect(row.description))}</small>`}</span>`).join('')}${(compact ? [] : forecast).map(line =>
    `<span class="native-forecast">${escapeDialogText(line)}</span>`).join('')}</span>`;
}

/** Badges for native effects other squad members placed on this unit; the container is always present so playback can patch it. */
export function nativeMarkerReadout(state: BattleState, unit: Combatant): string {
  return `<span class="native-markers">${nativeMarkers(state, unit).map(marker =>
    `<span class="battle-status-badge" data-native-marker="${marker.id}" data-native-owner="${escapeDialogText(marker.owner)}">${statusIcon(marker.icon)}${escapeDialogText(`${marker.label} · ${marker.value}`)}</span>`).join('')}</span>`;
}

export function needsAllyTarget(actor: Combatant, action: ActionId): boolean {
  return !actor.captured && !!actor.kit?.nativeIdentity && action !== 'light'
    && actor.kit.abilities[action].targets === 'one-ally';
}

export function allyTargetCandidates(state: BattleState, actor: Combatant, action: ActionId): Combatant[] {
  if (!needsAllyTarget(actor, action) || action === 'light') return [];
  const living = state.allies.filter(ally => ally.hp > 0);
  return actor.kit!.abilities[action].excludeSelf && living.some(ally => ally.id !== actor.id)
    ? living.filter(ally => ally.id !== actor.id) : living;
}

export function allyTargetHint(actor: Combatant, action: ActionId): string {
  if (!needsAllyTarget(actor, action) || action === 'light') return '';
  return actor.kit!.abilities[action].excludeSelf
    ? 'Choose another living ally · next enemy phase · solo: self protection'
    : actor.definitionId === 'tide' ? 'Choose a living ally · through next enemy phase'
      : 'Choose a living ally · next native action, expires by end of next player turn';
}

export function nativeActionHint(state: BattleState, actor: Combatant, action: ActionId, enemyTargetId?: string): string {
  if (actor.captured || !actor.kit?.nativeIdentity) return '';
  if (needsAllyTarget(actor, action)) return allyTargetHint(actor, action);
  const selected = state.enemies.find(enemy => enemy.id === enemyTargetId && enemy.hp > 0)
    ?? state.enemies.find(enemy => enemy.hp > 0);
  if (action === 'light') return `Enemy: ${selected?.name ?? 'None'} · immediate`;
  const ability = actor.kit.abilities[action];
  const self = action === 'skill2' && (actor.definitionId === 'razor' || actor.definitionId === 'orvella');
  const focusedFlare = phaseZeroStatsReady && actor.definitionId === 'ember' && action === 'ultimate' &&
    actor.masterConduit === 'master-ember-2';
  const target = focusedFlare ? `Enemy: ${selected?.name ?? 'None'} · Focused Last Flare`
    : self ? actor.definitionId === 'orvella' ? 'Shared Foundation' : 'Self'
    : ability.targets === 'all-allies' ? 'All living allies'
    : ability.targets === 'all-enemies' ? 'All living enemies'
    : actor.definitionId === 'rosetta' && action !== 'skill1' ? 'Quarry or selected enemy'
    : actor.definitionId === 'nerithe' && action !== 'skill2' ? 'Survey target or selected enemy'
    : actor.definitionId === 'elise' && action !== 'skill1' ? 'Lodged blades; selected enemy'
    : `Enemy: ${selected?.name ?? 'None'}`;
  const timing = actor.definitionId === 'sprout' ? 'Seed delivery: next player turn'
    : actor.definitionId === 'atmoso' && action === 'skill2' ? 'Release: second enemy-phase end'
    : actor.definitionId === 'tide' && action === 'ultimate' || actor.definitionId === 'bruno' && action === 'ultimate'
      || actor.definitionId === 'aurora' && action === 'ultimate' ? 'Through next two enemy phases'
    : actor.definitionId === 'disciple' ? 'Next native action; ends by next player-turn end'
    : actor.definitionId === 'aurora' ? 'Next special within three enemy phases'
    : actor.definitionId === 'razor' && action === 'skill2' ? 'Guard next enemy phase; shield following phase'
    : actor.definitionId === 'thornia' && action !== 'skill2' ? 'Trap: three enemy phases'
    : actor.definitionId === 'orvella' && action === 'skill2' ? 'Three enemy phases'
    : 'Immediate';
  return `${target} · ${timing}${action === 'ultimate' ? ' · Recover next player turn' : ''}`;
}

export function createAllyTargetPicker(state: BattleState, actor: Combatant, action: ActionId):
  { result: Promise<string | null>; cancel: () => void } {
  if (action === 'light' || !actor.kit) throw new Error('Ally targeting requires an ability.');
  const ability = isStarterId(actor.definitionId) ? describeFighter(actor.definitionId, actor.kit).abilities[action] : actor.kit.abilities[action];
  const candidates = allyTargetCandidates(state, actor, action);
  const { dialog, dispose } = createGameDialog(`Choose ally · ${ability.name}`);
  dialog.classList.add('native-ally-picker');
  dialog.innerHTML = `<h2>${escapeDialogText(ability.name)} · Choose ally</h2>
    <p>${escapeDialogText(allyTargetHint(actor, action))}</p><p>${escapeDialogText(readableEffect(ability.description))}</p>
    <p>Enemy target is unchanged. Choose a recipient to commit this action, or cancel without spending Gauge or a turn.</p>
    <form method="dialog"><div class="native-ally-choices">${candidates.map(ally =>
      `<button type="submit" class="text-button" value="${escapeDialogText(ally.id)}"><strong>${escapeDialogText(ally.name)}</strong><span>HP ${formatStat(ally.hp)} / ${formatStat(ally.stats.health)}${ally.id === actor.id ? ' · Self' : ''}</span></button>`).join('')}</div>
    <div class="game-dialog-actions"><button type="submit" class="text-button" value="" autofocus>Cancel</button></div></form>`;
  let finish: (id: string | null) => void = () => {};
  const result = new Promise<string | null>((resolve, reject) => {
    let settled = false;
    finish = id => {
      if (settled) return;
      settled = true;
      dispose();
      resolve(id);
    };
    dialog.addEventListener('submit', event => {
      event.preventDefault();
      const id = event.submitter instanceof HTMLButtonElement ? event.submitter.value : '';
      finish(candidates.some(ally => ally.id === id) ? id : null);
    });
    dialog.addEventListener('close', () => finish(null));
    dialog.addEventListener('cancel', event => { event.preventDefault(); finish(null); });
    dialog.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); finish(null); }
    });
    try { dialog.showModal(); } catch (error) { dispose(); reject(error); }
  });
  return { result, cancel: () => finish(null) };
}
