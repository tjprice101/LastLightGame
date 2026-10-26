// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { emptyAccount } from '../game/account';
import { createCreatureCopy } from '../game/character-instances';
import { bulkSaleControls, bulkSaleCopy, bindCreatureBulkSale } from './creature-bulk-sale';
import { clearRarityFeedback } from './rarity-feedback';

afterEach(() => { clearRarityFeedback(document.body); document.body.replaceChildren(); });

function fixture() {
  const account = emptyAccount();
  const copies = ['heavens:2', 'abyss:1', 'treasury:0', 'roses:0'].map(id => createCreatureCopy(`infusion:${id}`));
  copies[3].locked = true;
  account.capturedCharacters = copies;
  const host = document.createElement('section');
  document.body.append(host);
  host.innerHTML = `${bulkSaleControls()}${copies.map(copy => `<article class="ref-collection-card"><button data-team-capture-detail="${copy.instanceId}">Portrait</button>${bulkSaleCopy(account, copy.instanceId)}</article>`).join('')}`;
  const sell = vi.fn(async () => {});
  const error = vi.fn();
  bindCreatureBulkSale(host, account, sell, error);
  const boxes = Array.from(host.querySelectorAll<HTMLInputElement>('[data-bulk-sale-id]'));
  const button = (selector: string) => host.querySelector<HTMLButtonElement>(`[data-bulk-sale-${selector}]`)!;
  return { host, copies, sell, error, boxes, button };
}

describe('multi-select sale UI', () => {
  it('starts collapsed, selects protected-safe copies and permits individual payouts', async () => {
    const { host, copies, sell, error, boxes, button } = fixture();
    expect(button('confirm').hidden).toBe(true);
    button('toggle').click();
    expect(button('confirm').disabled).toBe(true);
    expect(boxes[3].disabled).toBe(true);
    boxes[0].click();
    expect(host.querySelector('.is-sale-selected')).not.toBeNull();
    expect(host.querySelectorAll('.rarity-feedback')).toHaveLength(1);
    const payout = host.querySelector<HTMLSelectElement>(`[data-bulk-sale-payout="${copies[0].instanceId}"]`)!;
    payout.value = 'heavens-level';
    payout.dispatchEvent(new Event('change'));
    boxes[1].click();
    expect(host.querySelector('[data-bulk-sale-summary]')?.textContent).toContain('3 Chalice of the Undying Dawn');
    expect(host.querySelector('[data-bulk-sale-summary]')?.textContent).toContain('2 Null-Prismatica');
    button('confirm').click();
    await Promise.resolve();
    expect(sell).toHaveBeenCalledExactlyOnceWith([
      { id: copies[0].instanceId, saleOption: 'heavens-level' },
      { id: copies[1].instanceId, saleOption: 'lycalis' },
    ]);
    expect(error).not.toHaveBeenCalled();
  });

  it('selects available only, clears, and cancellation resets transient selection', () => {
    const { host, boxes, button } = fixture();
    button('toggle').click();
    button('all').click();
    expect(boxes.map(box => box.checked)).toEqual([true, true, true, false]);
    button('clear').click();
    expect(boxes.every(box => !box.checked)).toBe(true);
    expect(button('confirm').disabled).toBe(true);
    button('all').click();
    button('toggle').click();
    expect(boxes.every(box => !box.checked)).toBe(true);
    expect(host.querySelector('.is-sale-selected')).toBeNull();
    expect(button('confirm').hidden).toBe(true);
  });

  it('toggles portrait selection instead of opening details while multi-select is active', () => {
    const { host, boxes, button } = fixture();
    const detail = vi.fn();
    const art = host.querySelector<HTMLButtonElement>('[data-team-capture-detail]')!;
    art.addEventListener('click', detail);
    button('toggle').click();
    art.click();
    expect(boxes[0].checked).toBe(true);
    art.click();
    expect(boxes[0].checked).toBe(false);
    expect(detail).not.toHaveBeenCalled();
    button('toggle').click();
    art.click();
    expect(detail).toHaveBeenCalledOnce();
  });

  it('disables repeat submit while confirmation/save is pending and reports errors', async () => {
    const { boxes, sell, error, button } = fixture();
    let reject: (cause: Error) => void = () => {};
    sell.mockImplementationOnce(() => new Promise<void>((_, fail) => { reject = fail; }));
    button('toggle').click();
    boxes[0].click();
    button('confirm').click();
    button('confirm').click();
    expect(sell).toHaveBeenCalledTimes(1);
    expect(button('confirm').disabled).toBe(true);
    reject(new Error('Save denied'));
    await Promise.resolve();
    await Promise.resolve();
    expect(error).toHaveBeenCalledWith(expect.objectContaining({ message: 'Save denied' }));
    expect(boxes[0].checked).toBe(true);
    expect(button('confirm').disabled).toBe(false);
  });
});
