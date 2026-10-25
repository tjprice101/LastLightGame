import './overlay-pages.css';

const focusable = 'button, input, select, textarea, a[href], [tabindex]';
let sequence = 0;

interface Placement { node: Node; parent: Node; next: Node | null }

/** Native column fragmentation keeps the original controls, forms and event handlers alive across pages. */
export function paginateOverlay(dialog: HTMLDialogElement): () => void {
  const initialFocus = document.activeElement instanceof HTMLElement && dialog.contains(document.activeElement)
    ? document.activeElement : null;
  const managed = dialog.hasAttribute('data-overlay-layout');
  const placements: Placement[] = [];
  const formLinks = new Set<HTMLButtonElement>();
  const scrollers = new Set<HTMLElement>();
  const move = (node: Node, parent: Node): void => {
    placements.push({ node, parent: node.parentNode!, next: node.nextSibling });
    parent.appendChild(node);
  };
  const ownTitle = Array.from(dialog.querySelectorAll<HTMLElement>('h2')).find(title => title.closest('dialog') === dialog);
  let heading = dialog.querySelector<HTMLElement>(':scope > header');
  const shell = document.createElement('div');
  shell.className = 'overlay-shell';
  const viewport = document.createElement('div');
  viewport.className = 'overlay-viewport';
  const flow = document.createElement('div');
  flow.className = 'overlay-flow';
  const footer = document.createElement('footer');
  footer.className = 'overlay-footer';
  const navigation = document.createElement('nav');
  navigation.className = 'overlay-pagination';
  navigation.setAttribute('aria-label', 'Overlay pages');
  navigation.innerHTML = '<button type="button" data-overlay-previous>Previous</button><span role="status" aria-live="polite" aria-atomic="true"></span><button type="button" data-overlay-next>Next</button>';
  const previous = navigation.querySelector<HTMLButtonElement>('[data-overlay-previous]')!;
  const next = navigation.querySelector<HTMLButtonElement>('[data-overlay-next]')!;
  const status = navigation.querySelector<HTMLElement>('[role="status"]')!;
  let body: HTMLElement;
  let ownedHeading = false;
  if (managed) {
    body = dialog.querySelector<HTMLElement>(':scope > [data-overlay-body]')!;
    heading = dialog.querySelector<HTMLElement>(':scope > [data-overlay-heading]');
    if (!body || !heading) throw new Error('Overlay layout is incomplete.');
  } else {
    body = flow;
    if (!heading) {
      heading = document.createElement('header');
      heading.className = 'overlay-heading';
      ownedHeading = true;
      if (ownTitle) move(ownTitle, heading);
      else {
        const text = document.createElement('h2');
        text.textContent = dialog.getAttribute('aria-label') ?? 'Last Light';
        heading.append(text);
      }
    } else if (!heading.querySelector('h2') && ownTitle) {
      move(ownTitle, heading);
    }
    const actions = Array.from(dialog.querySelectorAll<HTMLElement>('.game-dialog-actions, .picture-preview-actions, .battle-result-actions'))
      .find(element => element.closest('dialog') === dialog);
    if (actions) {
      const form = actions.closest('form');
      if (form && form !== actions) {
        if (!form.id) form.id = `overlay-form-${++sequence}`;
        actions.querySelectorAll<HTMLButtonElement>('button:not([type="button"])').forEach(button => {
          if (!button.hasAttribute('form')) { button.setAttribute('form', form.id); formLinks.add(button); }
        });
      }
    }
    const children = Array.from(dialog.childNodes);
    if (heading.parentNode === dialog) move(heading, shell);
    else shell.append(heading);
    if (actions) move(actions, footer);
    const settingsActions = dialog.querySelectorAll<HTMLButtonElement>('.settings-panel > button[type="submit"]');
    if (settingsActions.length) {
      const group = document.createElement('div');
      group.className = 'game-dialog-actions';
      settingsActions.forEach(button => {
        const form = button.form;
        if (!form) throw new Error('Settings action has no form.');
        button.setAttribute('form', form.id);
        formLinks.add(button);
        move(button, group);
      });
      footer.append(group);
    }
    children.filter(node => node !== heading && node !== actions).forEach(node => move(node, flow));
    viewport.append(flow);
    shell.append(viewport, footer);
    dialog.append(shell);
  }
  if (managed) {
    body.classList.add('overlay-viewport');
    const content = body.querySelector<HTMLElement>('[data-overlay-flow]');
    if (!content) throw new Error('Overlay flow is missing.');
    content.classList.add('overlay-flow');
  }
  const content = managed ? body.querySelector<HTMLElement>('[data-overlay-flow]')! : flow;
  const clip = managed ? body : viewport;
  (managed ? dialog.querySelector<HTMLElement>(':scope > [data-overlay-footer]')! : footer).prepend(navigation);
  dialog.classList.add('fullscreen-overlay');
  let page = 0, pages = 1, scheduled = false, disposed = false, firstLayout = true, inspectContent = true;
  const tabStops = new Map<HTMLElement, string | null>();
  const restoreTabs = (): void => {
    tabStops.forEach((value, element) => {
      if (value === null) element.removeAttribute('tabindex');
      else element.setAttribute('tabindex', value);
    });
    tabStops.clear();
  };
  const render = (followFocus = false): void => {
    if (disposed || !dialog.open) return;
    restoreTabs();
    if (inspectContent) {
      content.querySelectorAll<HTMLElement>('*').forEach(element => {
        if (element.closest('dialog') !== dialog || element.matches('input, select, textarea') || scrollers.has(element)) return;
        const style = getComputedStyle(element);
        if (['auto', 'scroll'].includes(style.overflowY) || ['auto', 'scroll'].includes(style.overflowX)) {
          element.dataset.overlayUnscroll = 'true';
          scrollers.add(element);
        }
      });
      inspectContent = false;
    }
    dialog.style.setProperty('--overlay-viewport-height', `${window.visualViewport?.height ?? window.innerHeight}px`);
    const width = clip.clientWidth;
    const height = clip.clientHeight;
    if (!width || !height) return;
    const gap = 32;
    // Table fragments can paint descenders a few pixels beyond their final line box.
    content.style.setProperty('--overlay-page-height', `${Math.max(1, height - 8)}px`);
    content.style.setProperty('--overlay-page-width', `${width}px`);
    content.style.transform = 'none';
    pages = Math.max(1, Math.ceil((content.scrollWidth + gap - 1) / (width + gap)));
    const focused = firstLayout ? initialFocus : followFocus && document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (focused && focused.closest('dialog') === dialog && content.contains(focused)) {
      const offset = focused.getBoundingClientRect().left - clip.getBoundingClientRect().left;
      page = Math.max(0, Math.floor((offset + 1) / (width + gap)));
    }
    firstLayout = false;
    page = Math.min(page, pages - 1);
    content.style.transform = `translateX(${-page * (width + gap)}px)`;
    const text = `Page ${page + 1} of ${pages}`;
    if (status.textContent !== text) status.textContent = text;
    previous.disabled = page === 0;
    next.disabled = page === pages - 1;
    navigation.dataset.singlePage = String(pages === 1);
    dialog.dataset.overlayPage = String(page + 1);
    dialog.dataset.overlayPages = String(pages);
    const bounds = clip.getBoundingClientRect();
    content.querySelectorAll<HTMLElement>(focusable).forEach(element => {
      if (element.closest('dialog') !== dialog) return;
      const rect = element.getBoundingClientRect();
      if (rect.width && (rect.left < bounds.left - 1 || rect.right > bounds.right + 1 || rect.top < bounds.top - 1 || rect.bottom > bounds.bottom + 1)) {
        tabStops.set(element, element.getAttribute('tabindex'));
        element.tabIndex = -1;
      }
    });
  };
  const schedule = (): void => {
    if (!scheduled && !disposed) {
      scheduled = true;
      queueMicrotask(() => { scheduled = false; render(true); });
    }
  };
  const changePage = (delta: number): void => {
    page = Math.max(0, Math.min(pages - 1, page + delta));
    render();
    (delta > 0 ? previous : next).focus({ preventScroll: true });
  };
  const previousPage = (): void => changePage(-1);
  const nextPage = (): void => changePage(1);
  previous.addEventListener('click', previousPage);
  next.addEventListener('click', nextPage);
  const onFocus = (event: Event): void => {
    if (!(event.target instanceof HTMLElement) || event.target.closest('dialog') !== dialog || !content.contains(event.target)) return;
    const rect = event.target.getBoundingClientRect();
    const bounds = clip.getBoundingClientRect();
    if (rect.width && (rect.left < bounds.left - 1 || rect.right > bounds.right + 1)) {
      page = Math.max(0, Math.min(pages - 1, page + Math.floor((rect.left - bounds.left + 1) / (bounds.width + 32))));
      render();
    }
    clip.scrollLeft = clip.scrollTop = 0;
  };
  dialog.addEventListener('focusin', onFocus);
  let validating = false;
  const onInvalid = (event: Event): void => {
    if (validating || !(event.target instanceof HTMLElement) || event.target.closest('dialog') !== dialog) return;
    validating = true;
    onFocus(event);
    queueMicrotask(() => { validating = false; });
  };
  dialog.addEventListener('invalid', onInvalid, true);
  const observer = new MutationObserver(records => {
    const ownRecords = records.filter(record => (record.target instanceof Element ? record.target : record.target.parentElement)?.closest('dialog') === dialog);
    if (ownRecords.some(record => record.type === 'childList')) inspectContent = true;
    if (ownRecords.some(record => record.type === 'attributes' && record.attributeName === 'hidden' ||
      record.type === 'childList' && (record.target instanceof Element && record.target.matches('.ll-master-options')))) page = 0;
    if (ownRecords.length) schedule();
  });
  observer.observe(content, { childList: true, subtree: true, characterData: true,
    attributes: true, attributeFilter: ['hidden', 'open'] });
  const resize = new ResizeObserver(schedule);
  resize.observe(clip);
  dialog.addEventListener('load', schedule, true);
  dialog.addEventListener('toggle', schedule, true);
  window.visualViewport?.addEventListener('resize', schedule);
  window.addEventListener('resize', schedule);
  render();
  initialFocus?.focus({ preventScroll: true });
  schedule();
  return () => {
    disposed = true;
    observer.disconnect();
    resize.disconnect();
    restoreTabs();
    dialog.removeEventListener('focusin', onFocus);
    dialog.removeEventListener('invalid', onInvalid, true);
    dialog.removeEventListener('load', schedule, true);
    dialog.removeEventListener('toggle', schedule, true);
    window.visualViewport?.removeEventListener('resize', schedule);
    window.removeEventListener('resize', schedule);
    navigation.remove();
    formLinks.forEach(button => button.removeAttribute('form'));
    scrollers.forEach(element => delete element.dataset.overlayUnscroll);
    if (!managed && dialog.contains(shell)) {
      for (const placement of placements.reverse()) {
        placement.parent.insertBefore(placement.node, placement.next?.parentNode === placement.parent ? placement.next : null);
      }
      if (ownedHeading) heading?.remove();
      shell.remove();
    }
    dialog.classList.remove('fullscreen-overlay');
    dialog.style.removeProperty('--overlay-viewport-height');
    delete dialog.dataset.overlayPage;
    delete dialog.dataset.overlayPages;
  };
}

/** Covers static, dynamically-created, nested and React-owned native dialogs without changing their transactions. */
export function installOverlayPages(root: HTMLElement = document.body): () => void {
  const dialogs = new Map<HTMLDialogElement, () => void>();
  const refresh = (): void => {
    dialogs.forEach((dispose, dialog) => {
      if (!dialog.open || !root.contains(dialog) || !dialog.querySelector('.overlay-flow')) { dispose(); dialogs.delete(dialog); }
    });
    root.querySelectorAll<HTMLDialogElement>('dialog[open]').forEach(dialog => {
      if (!dialogs.has(dialog)) dialogs.set(dialog, paginateOverlay(dialog));
    });
    document.documentElement.classList.toggle('overlay-open', dialogs.size > 0);
  };
  const observer = new MutationObserver(refresh);
  observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['open'] });
  refresh();
  return () => { observer.disconnect(); dialogs.forEach(dispose => dispose()); dialogs.clear(); document.documentElement.classList.remove('overlay-open'); };
}
