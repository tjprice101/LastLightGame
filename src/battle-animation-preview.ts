import './style.css';
import './interface.css';
import './numeric-layout.css';
import { starters, isStarterId } from './content/starters';
import { isActionId } from './content/combat';
import { infusionStageCount } from './content/activities';
import { isInfusionMode } from './content/infusions';
import { defaultBindings } from './game/hotkeys';
import { act, endTurn } from './game/battle';
import { BattleView, createSession, type BattleSession, type BattleAuthority } from './presentation/battle-view';
import { applyMotion } from './presentation/settings';
import { applyBattleSpeed, parseBattleSpeed } from './presentation/battle-speed';

if (!import.meta.env.DEV) throw new Error('The animation studio is development-only.');

function select(id: string): HTMLSelectElement {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLSelectElement)) throw new Error(`Missing preview selector: ${id}`);
  return element;
}

const character = select('preview-character');
const evolution = select('preview-evolution');
const formation = select('preview-formation');
const mode = select('preview-mode');
const action = select('preview-action');
const speed = select('preview-speed');
const host = document.getElementById('battle-root');
const error = document.getElementById('preview-error');
if (!host || !error) throw new Error('Animation studio regions are missing.');
const battleHost = host;
const errorRegion = error;
const options = <T extends string>(control: HTMLSelectElement, entries: readonly (readonly [T, string])[]) => {
  control.replaceChildren(...entries.map(([value, label]) => new Option(label, value)));
};
options(character, starters.map(unit => [unit.id, unit.name] as const));
options(evolution, ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Omnic'].map((label, index) => [String(index + 1), `${index + 1} - ${label}`]));
options(mode, [['training', 'Training'], ['story', 'Story'], ['dungeons', 'Material dungeon'], ['heavens', 'Heaven'], ['abyss', 'Abyss'],
  ['machines', 'Machines'], ['treasury', 'Treasury'], ['sanctuary', 'Sanctuary'], ['roses', 'Crimson Roses'], ['war', 'Elemental War']]);
evolution.value = '6';
mode.value = 'machines';
applyMotion('system');
applyBattleSpeed(1);

let view: BattleView | undefined;
let session: BattleSession;
function rebuild(entrance: boolean): void {
  view?.destroy();
  if (!isStarterId(character.value)) throw new Error('Invalid preview character.');
  const stage = Number(evolution.value);
  if (!Number.isInteger(stage) || stage < 1 || stage > 6) throw new Error('Invalid preview evolution.');
  const progress = { level: [0, 30, 45, 60, 90, 105][stage - 1], evolution: stage };
  const destination = mode.value === 'training' ? undefined
    : mode.value === 'story' ? { storyStage: 150 }
    : mode.value === 'dungeons' ? { element: 'infernic' as const, stage: 35 }
    : mode.value === 'war' ? { character: 'vaelor' as const, stage: 10 }
    : isInfusionMode(mode.value)
      ? { mode: mode.value, stage: infusionStageCount(mode.value) }
      : null;
  if (destination === null) throw new Error('Invalid preview battle.');
  const ids = formation.value === 'solo' ? [character.value]
    : formation.value === 'squad' ? [character.value,
        ...(['ember', 'tide', 'sprout'] as const).filter(id => id !== character.value).slice(0, 2)]
    : null;
  if (!ids) throw new Error('Invalid preview formation.');
  session = createSession(character.value, progress, destination, {
    ids, progress: Object.fromEntries(ids.map(id => [id, progress])),
  });
  session.entrancePending = entrance;
  session.state.allies[0].shatter = 100;
  if (formation.value === 'squad') {
    for (const ally of session.state.allies) ally.hp *= .65;
  }
  for (const enemy of session.state.enemies) {
    enemy.stats.health = Math.max(enemy.stats.health, session.state.allies[0].stats.damage * 100);
    enemy.hp = enemy.stats.health;
  }
  const unsupported = async (): Promise<never> => { throw new Error('Use the studio controls to reset or change battles.'); };
  const authority: BattleAuthority = {
    action: async (actor, selectedAction, target) => {
      const result = act(session.state, actor, selectedAction, target);
      return { session: { ...session, state: result.state }, result };
    },
    endTurn: async () => {
      const result = endTurn(session.state);
      return { session: { ...session, state: result.state }, result };
    },
    nextStage: unsupported, nextWave: unsupported, retry: unsupported, quit: unsupported,
  };
  view = new BattleView(battleHost, session, defaultBindings, () => {
    throw new Error('Preview must never persist rewards.');
  }, unsupported, authority);
}
function run(operation: () => void): void {
  try { errorRegion.textContent = ''; operation(); }
  catch (failure) {
    console.error('Animation studio failed', failure);
    errorRegion.textContent = failure instanceof Error ? failure.message : 'Animation studio failed.';
  }
}
for (const control of [character, evolution, formation, mode]) control.addEventListener('change', () => run(() => rebuild(false)));
speed.addEventListener('change', () => run(() => applyBattleSpeed(parseBattleSpeed(speed.value))));
document.getElementById('preview-entrance')?.addEventListener('click', () => run(() => rebuild(true)));
document.getElementById('preview-play')?.addEventListener('click', () => run(() => {
  rebuild(false);
  if (!isActionId(action.value)) throw new Error('Invalid preview action.');
  const button = battleHost.querySelector<HTMLButtonElement>(`[data-action="${action.value}"]`);
  if (!button || button.disabled) throw new Error('This ability is unavailable.');
  button.click();
}));
window.addEventListener('pagehide', () => view?.destroy(), { once: true });
run(() => rebuild(false));
