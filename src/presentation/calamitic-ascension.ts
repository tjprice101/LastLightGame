import { type Starter } from '../content/starters';
import { characterRarity, displayEvolution, type CharacterProgress } from '../content/progression';
import { radiantBearerKits } from '../content/combat-kits';
import { characterName } from '../content/character-art';
import { materialArt } from '../content/dungeon-art';
import { ownedProgress, canAscendCharacter, calamiticAscensionCost, type Account, type CalamiticAscensionStep } from '../game/account';
import { portrait, assetUrl } from './portrait';
import { abilityIcon } from './ability-icon';
import { createGameDialog, escapeDialogText as escape, gameDialogPending } from './game-dialog';
import { celebrateAscension } from './upgrade-celebration';
import { isRadiantBearer } from './character-combat';
import './calamitic-ascension.css';

const steps = ['stats', 'skill1', 'skill2', 'lastFlare'] as const;
const crown = '<span class="ascension-crown" aria-hidden="true">♛</span>';

export function ascensionEntry(starter: Starter, account: Account | null, progress?: CharacterProgress): string {
  if (!account || !progress || !isRadiantBearer(starter.id) || (!progress.ascension?.stats && !canAscendCharacter(starter.id, progress, 'stats'))) return '';
  const count = steps.filter(step => progress.ascension?.[step]).length;
  return `<button type="button" class="calamitic-ascension-entry" data-button-surface="art" data-calamitic-ascension="${starter.id}" aria-haspopup="dialog">${crown}<span><strong>Calamitic Ascension</strong><small>${count === 4 ? 'Ascended' : `${count}/4`}</small></span><span aria-hidden="true">↗</span></button>`;
}

function stepName(starter: Starter, step: CalamiticAscensionStep): string {
  if (step === 'stats') return 'Ascend';
  if (!isRadiantBearer(starter.id)) throw new Error('This Element-Bearer has no available Radiant combat kit.');
  const kit = radiantBearerKits[starter.id];
  return step === 'skill1' ? kit.passive.name : step === 'skill2' ? kit.leader : 'Convergent Light';
}

function stepDescription(starter: Starter, step: CalamiticAscensionStep): string {
  if (step === 'stats') return 'Health, Attack, Defense and Recovery ×1.5 · Level cap 115';
  if (!isRadiantBearer(starter.id)) throw new Error('This Element-Bearer has no available Radiant combat kit.');
  if (step === 'skill1') return 'Add 50% of the evolution-enhanced Passive Skill bonus.';
  return step === 'skill2'
    ? 'Add 50% of the native Leader Skill damage bonus while leading and alive.'
    : 'Add 50% of evolution- and rank-enhanced Convergent Light effect magnitudes; durations do not change.';
}

export function ascensionContents(starter: Starter, account: Account): string {
  const progress = ownedProgress(account, starter.id);
  const shards = account.materials['shard-of-calamity'] ?? 0;
  const art = materialArt('shard-of-calamity');
  return `<header class="ascension-hero"><div class="hub-portrait">${portrait(starter, progress.evolution, progress.ascension?.stats === true)}</div><div><p class="ascension-eyebrow">Calamitic Ascension</p><h2>${escape(characterName(starter.id, progress.evolution, progress.ascension?.stats === true))}</h2><p class="ascension-form">Evo. ${displayEvolution(starter.id, progress.evolution)} ? ${characterRarity(starter.id, progress.evolution)}</p><div class="ascension-shards">${art ? `<img src="${assetUrl(`materials/${art}.png`)}" alt="" width="40" height="40">` : '<span class="ascension-shard-token" aria-hidden="true">◆</span>'}<span>Shards of Calamity <strong data-ascension-shards>${shards}</strong></span></div></div></header>
    <div class="ascension-steps">${steps.filter(step => step === 'stats' || progress.ascension?.stats).map(step => {
      const done = progress.ascension?.[step] === true;
      const action = step === 'stats' ? 'Ascend' : 'Imbue';
      const available = canAscendCharacter(starter.id, progress, step) && shards >= calamiticAscensionCost;
      const icon = step === 'stats' ? crown : step === 'skill2' ? '<span aria-hidden="true">★</span>'
        : abilityIcon(starter.id, step === 'skill1' ? 'passive' : 'ultimate') || '<span aria-hidden="true">◆</span>';
      const label = step === 'stats' ? 'Ascension' : step === 'skill1' ? 'Passive Skill' : step === 'skill2' ? 'Leader Skill' : 'Convergent Light';
      return `<article class="ascension-step${done ? ' is-done' : ''}" data-ascension-step="${step}"><div class="ascension-step-icon">${icon}</div><div class="ascension-step-copy"><small>${label}</small><h3>${escape(stepName(starter, step))}</h3><p>${escape(stepDescription(starter, step))}</p><small>${calamiticAscensionCost} Shards</small></div>${done ? '<strong class="ascension-done">✓ Done</strong>' : `<button type="button" class="ascension-action" data-button-surface="art" data-ascension-select="${step}"${available ? '' : ' disabled'}>${available ? action : 'Not enough Shards'}</button>`}</article>`;
    }).join('')}</div>`;
}

export function openCalamiticAscension(starter: Starter, readAccount: () => Account,
  transact: (step: CalamiticAscensionStep, expected: CharacterProgress) => Promise<void>, refresh: () => void): void {
  if (gameDialogPending()) return;
  const returnFocus = document.activeElement;
  const { dialog, dispose } = createGameDialog('Calamitic Ascension');
  dialog.classList.add('calamitic-ascension-modal');
  dialog.style.setProperty('--accent', '#a80f2d');
  dialog.style.setProperty('--ui-accent', '#a80f2d');
  dialog.innerHTML = `<button type="button" class="ascension-close" aria-label="Close Calamitic Ascension" autofocus>×</button><p class="ascension-result" role="status" aria-live="polite"></p><div data-ascension-content></div><div class="ascension-confirm" hidden></div>`;
  const content = dialog.querySelector<HTMLElement>('[data-ascension-content]')!;
  const confirmation = dialog.querySelector<HTMLElement>('.ascension-confirm')!;
  const status = dialog.querySelector<HTMLElement>('.ascension-result')!;
  const render = (): void => { content.innerHTML = ascensionContents(starter, readAccount()); };
  let selected: CalamiticAscensionStep | undefined;
  let pending = false;
  let closed = false;
  let clearCelebration: (() => void) | undefined;
  const close = (): void => { if (closed) return; closed = true; clearCelebration?.(); dispose();
    if (!(returnFocus instanceof HTMLElement) || !returnFocus.isConnected) document.querySelector<HTMLButtonElement>(`[data-calamitic-ascension="${starter.id}"]`)?.focus({ preventScroll: true });
  };
  const cancelConfirmation = (): void => {
    confirmation.hidden = true;
    dialog.querySelector<HTMLButtonElement>(`[data-ascension-select="${selected}"]`)?.focus();
    selected = undefined;
  };
  dialog.addEventListener('cancel', event => { event.preventDefault(); if (selected && !pending) cancelConfirmation(); else close(); });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Tab') {
      const controls = Array.from(dialog.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')).filter(button => !button.closest('[hidden]'));
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault(); first?.focus();
      }
      return;
    }
    if (event.key !== 'Escape') return;
    event.preventDefault(); event.stopPropagation();
    if (selected && !pending) cancelConfirmation(); else close();
  });
  dialog.addEventListener('close', close, { once: true });
  dialog.addEventListener('click', async event => {
    const target = event.target instanceof Element ? event.target.closest<HTMLButtonElement>('button') : null;
    if (!target || target.disabled) return;
    if (target.matches('.ascension-close')) { close(); return; }
    if (pending) return;
    if (target.hasAttribute('data-ascension-cancel')) { cancelConfirmation(); return; }
    const step = target.dataset.ascensionSelect;
    if (steps.includes(step as CalamiticAscensionStep)) {
      selected = step as CalamiticAscensionStep;
      status.textContent = '';
      confirmation.innerHTML = `<p>${escape(selected === 'stats' ? 'Ascend' : `Imbue ${stepName(starter, selected)}`)} · ${calamiticAscensionCost} Shards?</p><div><button type="button" class="text-button" data-ascension-cancel>Cancel</button><button type="button" class="primary-button" data-ascension-confirm>Confirm</button></div>`;
      confirmation.hidden = false;
      confirmation.querySelector<HTMLButtonElement>('[data-ascension-cancel]')!.focus();
      confirmation.scrollIntoView({ block: 'nearest' });
      return;
    }
    if (!target.hasAttribute('data-ascension-confirm') || !selected) return;
    const chosen = selected;
    const expected = ownedProgress(readAccount(), starter.id);
    pending = true;
    dialog.setAttribute('aria-busy', 'true');
    dialog.querySelectorAll<HTMLButtonElement>('.ascension-step button, .ascension-confirm button').forEach(button => { button.disabled = true; });
    let saved = false;
    try {
      await transact(chosen, expected);
      saved = true;
      refresh();
      if (closed) return;
      clearCelebration?.();
      render();
      confirmation.hidden = true;
      selected = undefined;
      status.textContent = chosen === 'stats' ? 'Ascended' : `${stepName(starter, chosen)} imbued`;
      clearCelebration = celebrateAscension(dialog, starter, chosen, ownedProgress(readAccount(), starter.id));
      dialog.querySelector<HTMLButtonElement>('[data-ascension-select]:not(:disabled), .ascension-close')?.focus({ preventScroll: true });
    } catch (error) {
      if (!closed) {
        status.textContent = saved ? 'Saved. Close to refresh.' : error instanceof Error ? error.message : 'Ascension failed.';
        confirmation.hidden = true;
        selected = undefined;
        render();
        dialog.querySelector<HTMLButtonElement>('.ascension-close')?.focus({ preventScroll: true });
      }
    } finally { pending = false; dialog.removeAttribute('aria-busy'); }
  });
  render();
  dialog.showModal();
}
