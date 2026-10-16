import { escapeDialogText } from './game-dialog';
import { bracketReferences } from './reference-text';

export function information(id: string, title: string, content: string, label = 'Information', triggerContent = label): string {
  return `<button type="button" class="text-button" data-information="${id}" aria-haspopup="dialog">${triggerContent}</button>
    <dialog class="information-modal" id="${id}" aria-labelledby="${id}-heading">
      <header class="drawer-heading"><h2 id="${id}-heading">${title}</h2>
        <button type="button" class="drawer-close" data-close-information aria-label="Close ${escapeDialogText(label)}">&times;</button></header>
      <div class="information-content">${bracketReferences(content)}</div>
    </dialog>`;
}

export interface InformationTopic { id: string; title: string; summary: string; content: string }

export function informationTopics(id: string, topics: readonly InformationTopic[]): string {
  if (!topics.length || new Set(topics.map(topic => topic.id)).size !== topics.length) throw new Error('Information topics must be unique.');
  return `<div class="information-topics" data-information-topics="${id}">
    <nav class="information-topic-list" aria-label="Topics">${topics.map(topic => `<button type="button" data-info-topic="${topic.id}"><strong>${topic.title}</strong><span>${topic.summary}</span><b aria-hidden="true">&rsaquo;</b></button>`).join('')}</nav>
    ${topics.map(topic => `<section class="information-topic" data-info-panel="${topic.id}" hidden aria-labelledby="${id}-${topic.id}-heading">
      <button type="button" class="text-button information-topic-back" data-info-back>&lsaquo; All topics</button>
      <h3 id="${id}-${topic.id}-heading">${topic.title}</h3>${bracketReferences(topic.content)}</section>`).join('')}</div>`;
}

function showInformationTopic(dialog: Element, topic: string | null): void {
  const container = dialog.querySelector<HTMLElement>('[data-information-topics]');
  if (!container) return;
  const list = container.querySelector<HTMLElement>('.information-topic-list');
  const panels = Array.from(container.querySelectorAll<HTMLElement>('[data-info-panel]'));
  if (topic && !panels.some(panel => panel.dataset.infoPanel === topic)) throw new Error('Unknown information topic.');
  if (list) list.hidden = topic !== null;
  panels.forEach(panel => { panel.hidden = panel.dataset.infoPanel !== topic; });
  dialog.querySelector('.information-content')?.scrollTo?.({ top: 0 });
  const focus = topic ? container.querySelector<HTMLElement>(`[data-info-panel="${topic}"] h3`) : null;
  if (focus) { focus.tabIndex = -1; focus.focus({ preventScroll: true }); }
}

export function bindInformation(host: HTMLElement): void {
  host.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    if (event.target instanceof HTMLDialogElement && event.target.id === 'sanctuary-help') {
      const bounds = event.target.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
        event.target.close();
        return;
      }
    }
    const button = event.target.closest<HTMLButtonElement>('[data-information]');
    if (button) {
      const dialog = document.getElementById(button.dataset.information ?? '');
      if (!(dialog instanceof HTMLDialogElement)) throw new Error('Information panel is missing.');
      button.focus({ preventScroll: true });
      showInformationTopic(dialog, null);
      dialog.showModal();
    }
    const topic = event.target.closest<HTMLButtonElement>('[data-info-topic]');
    if (topic) {
      const dialog = topic.closest('dialog');
      if (!dialog) throw new Error('Information panel is missing.');
      showInformationTopic(dialog, topic.dataset.infoTopic ?? '');
      return;
    }
    const back = event.target.closest<HTMLButtonElement>('[data-info-back]');
    if (back) {
      const dialog = back.closest('dialog');
      if (!dialog) throw new Error('Information panel is missing.');
      const from = back.closest<HTMLElement>('[data-info-panel]')?.dataset.infoPanel;
      showInformationTopic(dialog, null);
      if (from) dialog.querySelector<HTMLElement>(`[data-info-topic="${from}"]`)?.focus({ preventScroll: true });
      return;
    }
    const close = event.target.closest<HTMLButtonElement>('[data-close-information]');
    if (close) {
      const dialog = close.closest('dialog');
      if (!dialog) throw new Error('Information panel is missing.');
      dialog.close();
    }
  });
  host.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !(event.target instanceof Element)) return;
    const dialog = event.target.closest<HTMLDialogElement>('dialog.information-modal[open]');
    if (!dialog) return;
    event.preventDefault();
    event.stopPropagation();
    dialog.close();
  });
}
