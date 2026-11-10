import { eventDevourerProduct, eventDevourerWarning } from '../content/event-devourers';
import type { Account } from '../game/account';
import { gameConfirm, gameDialogPending } from './game-dialog';
import { ownedCompanion } from './owned-companion';
import { presentReward } from './reward-screen';
import { setShopHostLine } from './shop-host';

interface EventDevourerPurchaseServices {
  online: () => boolean;
  account: () => Account;
  purchase: (id: string) => Promise<Account>;
  refresh: () => void;
  report: (message: string, tone?: 'success') => void;
  errorMessage: (error: unknown) => string;
}

export async function presentSavedEventDevourer(root: HTMLElement, id: string, account: Account,
  before: ReadonlySet<string>, report: EventDevourerPurchaseServices['report']): Promise<void> {
  const product = eventDevourerProduct(id);
  const copy = account.capturedCharacters?.find(entry => entry.creatureId === product.id && !before.has(entry.instanceId));
  if (!copy) throw new Error('The new copy could not be displayed. Check Team.');
  setShopHostLine(root, 'nimra', 'saved');
  report(`${product.creature.name} purchased and saved.`, 'success');
  await presentReward({ title: 'Event Elemental-Devourer acquired', name: product.creature.name,
    art: ownedCompanion(account, copy.instanceId).art, rarity: product.rarity,
    details: `<p>One copy saved at Lv.${copy.level}. Not automatically equipped or added to your squad.</p>`,
    accent: '#ffffff', animationLabel: 'Your saved purchase arrives.' });
}

export function bindEventDevourerPurchases(root: HTMLElement, services: EventDevourerPurchaseServices): void {
  let pending = false;
  root.addEventListener('click', async event => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest<HTMLButtonElement>('[data-buy-event-devourer]');
    if (!button || !root.contains(button) || button.disabled || pending || gameDialogPending()) return;
    pending = true;
    let saved = false;
    try {
      if (!services.online()) throw new Error('Sign in online to purchase Event Elemental-Devourers.');
      const product = eventDevourerProduct(button.dataset.buyEventDevourer ?? '');
      const noEventBearer = !product.bearerIds.some(id => services.account().characters[id]);
      if (!await gameConfirm(`${noEventBearer ? `${eventDevourerWarning(product)}\n\n` : ''}Buy one ${product.creature.name} for ${product.price.toLocaleString('en-US')} Prismatica?`, {
        title: noEventBearer ? 'Event warning' : 'Event Elemental-Devourers', confirmLabel: 'Purchase',
      })) {
        setShopHostLine(root, 'nimra', 'cancel');
        return;
      }
      const before = new Set(services.account().capturedCharacters?.map(copy => copy.instanceId));
      const account = await services.purchase(product.id);
      saved = true;
      services.refresh();
      await presentSavedEventDevourer(root, product.id, account, before, services.report);
    } catch (error) {
      console.error('Event Elemental-Devourer purchase failed', error);
      services.report(`${saved ? 'Purchase saved, but its presentation could not complete. ' : ''}${services.errorMessage(error)}`);
    } finally {
      pending = false;
    }
  });
}
