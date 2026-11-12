export function menuPager(label: string): string {
  return `<nav class="menu-pager" aria-label="${label} pages"><button type="button" data-menu-page="-1" aria-label="Previous page">&lsaquo;</button><span data-menu-page-status role="status"></span><button type="button" data-menu-page="1" aria-label="Next page">&rsaquo;</button></nav>`;
}

export function bindMenuPagination(root: ParentNode): void {
  root.querySelectorAll<HTMLElement>('[data-menu-page-size]').forEach(panel => {
    const render = (requested: number): void => {
      const items = Array.from(panel.querySelectorAll<HTMLElement>('[data-menu-page-item]'));
      const matching = items.filter(item => item.dataset.menuFiltered !== 'true');
      const size = Number(panel.dataset.menuPageSize);
      if (!Number.isInteger(size) || size < 1) throw new Error('Invalid menu page size.');
      const pages = Math.max(1, Math.ceil(matching.length / size));
      const page = Math.max(0, Math.min(pages - 1, requested));
      if (panel.dataset.menuCurrentPage !== String(page)) panel.dataset.menuCurrentPage = String(page);
      const visible = new Set(matching.slice(page * size, (page + 1) * size));
      items.forEach(item => {
        const hidden = !visible.has(item);
        if (item.hidden !== hidden) item.hidden = hidden;
      });
      const status = panel.querySelector('[data-menu-page-status]');
      const text = `${page + 1} / ${pages}`;
      if (status && status.textContent !== text) status.textContent = text;
      panel.querySelectorAll<HTMLButtonElement>('[data-menu-page]').forEach(button => {
        const disabled = Number(button.dataset.menuPage) < 0 ? page === 0 : page === pages - 1;
        if (button.disabled !== disabled) button.disabled = disabled;
      });
    };
    render(Number(panel.dataset.menuCurrentPage ?? 0));
    if (panel.dataset.menuPagerBound) return;
    panel.dataset.menuPagerBound = 'true';
    panel.addEventListener('click', event => {
      const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>('[data-menu-page]') : null;
      if (!button || button.disabled) return;
      render(Number(panel.dataset.menuCurrentPage) + Number(button.dataset.menuPage));
    });
    panel.addEventListener('menu-list-filtered', () => render(0));
  });
}
