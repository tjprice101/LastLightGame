export function information(id: string, title: string, content: string, label = 'Information'): string {
  return `<button type="button" class="text-button" data-information="${id}" aria-haspopup="dialog">${label}</button>
    <dialog class="information-modal" id="${id}" aria-labelledby="${id}-heading">
      <header class="drawer-heading"><h2 id="${id}-heading">${title}</h2>
        <button type="button" class="drawer-close" data-close-information aria-label="Close ${label}">&times;</button></header>
      <div class="information-content">${content}</div>
    </dialog>`;
}

export function bindInformation(host: HTMLElement): void {
  host.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    if (event.target instanceof HTMLDialogElement && (event.target.id === 'sanctuary-menu' || event.target.id === 'sanctuary-help')) {
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
      dialog.showModal();
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
