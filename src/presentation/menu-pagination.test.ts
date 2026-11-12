// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { bindMenuPagination, menuPager } from './menu-pagination';

function collection(): HTMLElement {
  const root = document.createElement('div');
  root.innerHTML = `<section data-menu-page-size="2">${Array.from({ length: 5 }, (_, i) =>
    `<label data-menu-page-item><input type="checkbox" value="${i}">Copy ${i}</label>`).join('')}${menuPager('Copies')}</section>`;
  bindMenuPagination(root);
  return root;
}

describe('compact menu pagination', () => {
  it('keeps selection, focusable controls and DOM identities across pages and repeated binding', () => {
    const root = collection();
    const input = root.querySelector<HTMLInputElement>('input')!;
    input.checked = true;
    bindMenuPagination(root);
    root.querySelector<HTMLButtonElement>('[data-menu-page="1"]')!.click();
    expect(root.querySelector('[data-menu-page-status]')!.textContent).toBe('2 / 3');
    expect(root.querySelectorAll('[data-menu-page-item]:not([hidden])')).toHaveLength(2);
    root.querySelector<HTMLButtonElement>('[data-menu-page="-1"]')!.click();
    expect(root.querySelector('input')).toBe(input);
    expect(input.checked).toBe(true);
    expect(root.querySelector<HTMLButtonElement>('[data-menu-page="-1"]')!.disabled).toBe(true);
  });
  it('resets to matching results after filtering, including an empty collection', () => {
    const root = collection(), panel = root.querySelector<HTMLElement>('section')!;
    root.querySelector<HTMLButtonElement>('[data-menu-page="1"]')!.click();
    const items = Array.from(root.querySelectorAll<HTMLElement>('[data-menu-page-item]'));
    items.forEach((item, index) => { item.dataset.menuFiltered = String(index !== 4); });
    panel.dispatchEvent(new Event('menu-list-filtered'));
    expect(items.filter(item => !item.hidden)).toEqual([items[4]]);
    expect(root.querySelector('[data-menu-page-status]')!.textContent).toBe('1 / 1');
    items[4].dataset.menuFiltered = 'true';
    panel.dispatchEvent(new Event('menu-list-filtered'));
    expect(items.every(item => item.hidden)).toBe(true);
    expect(root.querySelector<HTMLButtonElement>('[data-menu-page="1"]')!.disabled).toBe(true);
  });
  it('rejects invalid authored page sizes explicitly', () => {
    const root = document.createElement('div');
    root.innerHTML = '<section data-menu-page-size="0"></section>';
    expect(() => bindMenuPagination(root)).toThrow('Invalid menu page size.');
  });
  it('does not rewrite unchanged visibility or controls on a repeated render', () => {
    const root = collection();
    const observer = new MutationObserver(() => {});
    observer.observe(root, { attributes: true, childList: true, subtree: true });
    bindMenuPagination(root);
    root.querySelector('section')!.dispatchEvent(new Event('menu-list-filtered'));
    expect(observer.takeRecords()).toHaveLength(0);
    observer.disconnect();
  });
});
