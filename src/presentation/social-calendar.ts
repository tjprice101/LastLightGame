import { attendanceReward, type SocialReward } from '../content/social-calendar';
import { materialName } from '../content/dungeon-art';
import { createGameDialog, escapeDialogText as escape } from './game-dialog';
import { currencyIcon } from './currency-icon';
import { presentReward } from './reward-screen';
import { rarityFeedback, clearRarityFeedback } from './rarity-feedback';
import { SocialCalendarRejected, type SocialCalendarCommand, type SocialCalendarView, type PlayerMail } from '../online/social-calendar';
import type { SocialPeerDisplay } from './online-store-profile';
import './social-calendar.css';

export interface SocialCalendarUiState {
  identity?: string;
  pending?: { command: SocialCalendarCommand; requestId: string };
}
interface SocialCalendarOptions {
  identity: string;
  state: SocialCalendarUiState;
  friends: () => readonly SocialPeerDisplay[];
  transport: (command: SocialCalendarCommand, requestId?: string) => Promise<SocialCalendarView>;
  onError: (message: string) => void;
}
export function socialRewardText(reward: SocialReward): string {
  return [
    reward.fractalis ? `${reward.fractalis.toLocaleString('en-US')} Prismatica` : '',
    reward.lycalis ? `${reward.lycalis.toLocaleString('en-US')} Null-Prismatica` : '',
    ...Object.entries(reward.materials).filter(([, n]) => n > 0).map(([id, n]) => `${n.toLocaleString('en-US')} ${materialName(id)}`),
  ].filter(Boolean).join(' + ') || 'No attachment';
}
function rewardArt(reward: SocialReward): string {
  return `<div class="social-reward-art">${reward.fractalis ? currencyIcon('fractalis') : ''}${reward.lycalis ? currencyIcon('lycalis') : ''}</div>
    <p>${escape(socialRewardText(reward))}</p>`;
}
export function attendanceMarkup(view: SocialCalendarView): string {
  const canClaim = !view.attendedToday && view.attendance < view.daysInMonth;
  return `<section><h3>Monthly attendance · ${escape(view.month)}</h3>
    <p>${view.attendance} / ${view.daysInMonth} attendance rewards saved · Consecutive streak: ${view.streak}</p>
    <p>One manual claim per New York reset day (8:00 PM). Missed days keep monthly progress but break your streak. Streaks carry across months. No catch-up.</p>
    <p>${canClaim ? `Next attendance (${view.attendance + 1}): ${escape(socialRewardText(view.nextReward))}` : 'Attendance saved for this reset day. Come back after the next reset.'}</p>
    ${view.nextReward.streakPremium && canClaim ? `<p>Includes ${view.nextReward.streakPremium} Null-Prismatica for the next consecutive streak milestone.</p>` : ''}
    <button type="button" data-calendar-action="attend" ${canClaim ? '' : 'disabled'}>Claim next attendance</button>
    <ol class="attendance-ladder" aria-label="Monthly ordinal attendance rewards">${Array.from({ length: view.daysInMonth }, (_, index) => {
      const ordinal = index + 1;
      return `<li ${ordinal <= view.attendance ? 'data-saved="true"' : ''}><b>Attendance ${ordinal}${ordinal <= view.attendance ? ' · Saved' : ''}</b><span>${escape(socialRewardText(attendanceReward(ordinal, 1)))}</span></li>`;
    }).join('')}</ol></section>`;
}
function mailboxMarkup(view: SocialCalendarView): string {
  const unclaimed = view.mail.filter(mail => !mail.informational && !mail.claimed).length;
  return `<section><h3>Mailbox · ${view.mail.filter(mail => !mail.read).length} unread</h3>
    <p>Patch notes and gifts never expire. Receiving legitimate friend gifts has no daily cap. Reading does not claim attachments.</p>
    <button type="button" data-calendar-action="claimAll" ${unclaimed ? '' : 'disabled'}>Claim all attachments (${unclaimed})</button>
    <ul class="social-mail-list">${view.mail.map(mail => `<li>
      <button type="button" data-calendar-mail="${escape(mail.id)}"><b>${escape(mail.title)}</b>
      <span>${escape(mail.sender)} · ${mail.read ? 'Read' : 'Unread'} · ${mail.informational ? 'Patch notes' : mail.claimed ? 'Claimed' : 'Unclaimed attachment'}</span>
      <small>${escape(socialRewardText(mail.attachment))}</small></button>
      ${!mail.informational && !mail.claimed ? `<button type="button" data-calendar-claim="${escape(mail.id)}">Claim attachment</button>` : ''}
    </li>`).join('')}</ul>${view.mail.length ? '' : '<p>Your mailbox is empty.</p>'}</section>`;
}
function giftsMarkup(view: SocialCalendarView, friends: readonly SocialPeerDisplay[]): string {
  return `<section><h3>Send a free daily gift</h3>
    <p>One send per account per New York reset day, to one accepted friend. Nothing is deducted from your inventory. Unlaunched Moon/Sunshade Seeds are not eligible.</p>
    ${view.giftSentToday ? '<p role="status">Your free gift is already sent for this reset day.</p>' : friends.length ? `<form data-calendar-gift>
    <fieldset><legend>Accepted friend</legend>${friends.map(friend => `<label><input type="radio" name="friend" value="${escape(friend.userId)}" required><span>${escape(friend.displayName)} (@${escape(friend.username)})</span></label>`).join('')}</fieldset>
    <fieldset><legend>Gift attachment (choose one)</legend>
      <label><input type="radio" name="gift" value="fractalis" checked>${currencyIcon('fractalis')} 1,000 Prismatica</label>
      <label><input type="radio" name="gift" value="lycalis">${currencyIcon('lycalis')} 10 Null-Prismatica</label>
      ${view.seedChoices.map(id => `<label><input type="radio" name="gift" value="${escape(id)}">10 ${escape(materialName(id))}</label>`).join('')}
    </fieldset><button type="submit">Send free gift</button></form>` : '<p>No accepted friends yet. Add and accept a friend first.</p>'}</section>`;
}
export function socialCalendarMarkup(view: SocialCalendarView, tab: string, friends: readonly SocialPeerDisplay[]): string {
  return `<p class="social-server-time">Server reset day: <time>${escape(view.resetDay)}</time> · Next reset: <time datetime="${escape(view.nextResetAt)}">${escape(new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  }).format(Date.parse(view.nextResetAt)))}</time></p>
    ${tab === 'attendance' ? attendanceMarkup(view) : tab === 'gifts' ? giftsMarkup(view, friends) : mailboxMarkup(view)}`;
}

function readMailMarkup(mail: PlayerMail): string {
  return `<section><h3>${escape(mail.title)}</h3><p>From ${escape(mail.sender)}</p>
    <div class="social-mail-body">${escape(mail.body)}</div><p>${escape(socialRewardText(mail.attachment))}</p>
    <p>${mail.informational ? 'Informational patch notes' : mail.claimed ? 'Attachment already saved' : 'Unclaimed attachment'} · No expiry</p>
    ${!mail.informational && !mail.claimed ? `<button type="button" data-calendar-claim="${escape(mail.id)}">Claim attachment</button>` : ''}
    <button type="button" data-calendar-back>Back to mailbox</button></section>`;
}

export async function openSocialCalendar(tab: string, options: SocialCalendarOptions): Promise<void> {
  if (options.state.identity !== options.identity) {
    options.state.identity = options.identity;
    options.state.pending = undefined;
  }
  const { dialog, dispose } = createGameDialog('Attendance & mail');
  dialog.classList.add('social-calendar-dialog');
  dialog.innerHTML = `<h2>Attendance & mail</h2><nav aria-label="Social and calendar"><button data-calendar-tab="attendance">Attendance</button><button data-calendar-tab="mail">Mailbox</button><button data-calendar-tab="gifts">Free gift</button></nav>
    <div class="social-calendar-feedback"><p data-calendar-status role="status">Loading from the server…</p></div><p data-calendar-error role="alert"></p>
    <button type="button" data-calendar-retry hidden>Retry pending action</button><div data-calendar-content></div>
    <div class="game-dialog-actions"><button type="button" data-calendar-refresh>Refresh from server</button><button type="button" data-calendar-close>Close</button></div>`;
  const content = dialog.querySelector<HTMLElement>('[data-calendar-content]')!;
  const status = dialog.querySelector<HTMLElement>('[data-calendar-status]')!;
  const error = dialog.querySelector<HTMLElement>('[data-calendar-error]')!;
  const retry = dialog.querySelector<HTMLButtonElement>('[data-calendar-retry]')!;
  const feedback = dialog.querySelector<HTMLElement>('.social-calendar-feedback')!;
  let currentTab = ['attendance', 'mail', 'gifts'].includes(tab) ? tab : 'attendance';
  let view: SocialCalendarView | undefined;
  let busy = false;
  let selectedMail: string | undefined;
  let proposedGift: Extract<SocialCalendarCommand, { kind: 'sendGift' }> | undefined;
  let disposed = false;
  let resolveClosed: (() => void) | undefined;
  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    clearRarityFeedback(feedback);
    dispose();
    resolveClosed?.();
  };
  const paint = () => {
    if (!dialog.isConnected || !dialog.open) return;
    dialog.querySelectorAll<HTMLButtonElement>('[data-calendar-tab]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.calendarTab === currentTab)));
    const mail = view?.mail.find(item => item.id === selectedMail);
    if (proposedGift) {
      content.innerHTML = `<section><h3>Confirm free gift</h3><p data-calendar-gift-confirmation></p>
        <p>This uses your one free send for this reset day. Nothing is deducted from your inventory.</p>
        <button type="button" data-calendar-send-confirm>Send gift</button><button type="button" data-calendar-send-cancel>Cancel</button></section>`;
      const recipient = options.friends().find(item => item.userId === proposedGift!.userId);
      const gift = proposedGift.gift === 'seed' ? `10 ${materialName(proposedGift.materialId)}` :
        proposedGift.gift === 'fractalis' ? '1,000 Prismatica' : '10 Null-Prismatica';
      content.querySelector('[data-calendar-gift-confirmation]')!.textContent = `Send ${gift} to ${recipient?.displayName ?? 'your friend'}?`;
    } else content.innerHTML = mail ? readMailMarkup(mail) : view ? socialCalendarMarkup(view, currentTab, options.friends()) : '';
    retry.hidden = !options.state.pending;
    dialog.setAttribute('aria-busy', String(busy));
    content.querySelectorAll<HTMLButtonElement | HTMLInputElement>('button,input').forEach(control => {
      if (busy || options.state.pending) control.disabled = true;
    });
  };
  const execute = async (command: SocialCalendarCommand) => {
    if (busy) return;
    const pending = options.state.pending;
    if (command.kind !== 'read' && pending && JSON.stringify(pending.command) !== JSON.stringify(command)) {
      error.textContent = 'Retry the previous pending action before starting another.';
      return;
    }
    const request = command.kind === 'read' ? undefined : pending ?? { command, requestId: crypto.randomUUID() };
    if (request) options.state.pending = request;
    busy = true; error.textContent = ''; status.textContent = 'Checking the server…'; paint();
    let saved = false;
    try {
      view = await options.transport(command, request?.requestId);
      if (command.kind !== 'read') { saved = true; options.state.pending = undefined; }
      status.textContent = command.kind === 'sendGift' ? 'Gift sent and saved in your friend’s mailbox. Nothing was deducted.' :
        command.kind === 'readMail' ? 'Mail marked as read.' : command.kind === 'read' ? 'Server state loaded.' : 'Saved.';
      if (command.kind === 'readMail') {
        selectedMail = command.id;
      } else if (saved && view.reward && (view.reward.fractalis || view.reward.lycalis || Object.values(view.reward.materials).some(n => n))) {
        if (dialog.open && !disposed) {
          // The shared dialog foundation permits one modal at a time.
          cleanup();
          await presentReward({
            title: command.kind === 'attend' ? 'Attendance reward saved' : 'Mail attachments saved',
            name: socialRewardText(view.reward), art: rewardArt(view.reward), details: '<p>Saved to your online account. No additional claim is needed.</p>',
            accent: '#c7cbd1', animationLabel: 'Your saved reward', savedLabel: 'Reward saved', rarity: 'Uncommon',
          });
        } else options.onError(`Reward saved to your online account: ${socialRewardText(view.reward)}.`);
      }
    } catch (failure) {
      if (failure instanceof SocialCalendarRejected && !saved) options.state.pending = undefined;
      const message = failure instanceof Error ? failure.message : 'The operation failed.';
      error.textContent = saved ? `Your reward is saved, but its presentation could not complete. Check Inventory. ${message}` : message;
      status.textContent = '';
      if (!dialog.open) options.onError(error.textContent);
    } finally {
      busy = false; paint();
      if (saved && command.kind === 'readMail' && dialog.open) content.querySelector<HTMLButtonElement>('[data-calendar-back]')?.focus();
      if (saved && command.kind === 'sendGift' && dialog.open) rarityFeedback(feedback, 'Uncommon');
    }
  };
  dialog.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    if (event.target.closest('[data-calendar-close]')) { cleanup(); return; }
    const tabButton = event.target.closest<HTMLButtonElement>('[data-calendar-tab]');
    if (tabButton) { currentTab = tabButton.dataset.calendarTab!; selectedMail = undefined; proposedGift = undefined; paint(); return; }
    if (event.target.closest('[data-calendar-back]')) {
      selectedMail = undefined; paint(); content.querySelector<HTMLButtonElement>('[data-calendar-mail]')?.focus(); return;
    }
    if (event.target.closest('[data-calendar-send-cancel]')) {
      proposedGift = undefined; paint(); content.querySelector<HTMLButtonElement>('[data-calendar-gift] button')?.focus(); return;
    }
    if (event.target.closest('[data-calendar-send-confirm]') && proposedGift) {
      const command = proposedGift; proposedGift = undefined; void execute(command); return;
    }
    if (event.target.closest('[data-calendar-refresh]')) { void execute({ kind: 'read' }); return; }
    if (event.target.closest('[data-calendar-retry]') && options.state.pending) { void execute(options.state.pending.command); return; }
    const action = event.target.closest<HTMLButtonElement>('[data-calendar-action]')?.dataset.calendarAction;
    if (action === 'attend' || action === 'claimAll') { void execute({ kind: action }); return; }
    const mail = event.target.closest<HTMLButtonElement>('[data-calendar-mail]')?.dataset.calendarMail;
    const claim = event.target.closest<HTMLButtonElement>('[data-calendar-claim]')?.dataset.calendarClaim;
    if (mail) void execute({ kind: 'readMail', id: mail });
    else if (claim) void execute({ kind: 'claimMail', id: claim });
  });
  dialog.addEventListener('submit', event => {
    if (!(event.target instanceof HTMLFormElement) || !event.target.hasAttribute('data-calendar-gift')) return;
    event.preventDefault();
    if (busy || options.state.pending) return;
    const form = new FormData(event.target);
    const userId = String(form.get('friend') ?? '');
    const gift = String(form.get('gift') ?? '');
    const friend = options.friends().find(item => item.userId === userId);
    if (!friend || !view) return;
    proposedGift = gift === 'fractalis' || gift === 'lycalis' ? { kind: 'sendGift', userId, gift } :
      { kind: 'sendGift', userId, gift: 'seed', materialId: gift };
    paint();
    content.querySelector<HTMLButtonElement>('[data-calendar-send-cancel]')?.focus();
  });
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    cleanup();
  });
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    cleanup();
  });
  try {
    await new Promise<void>(resolve => {
      resolveClosed = resolve;
      dialog.addEventListener('close', cleanup, { once: true });
      dialog.showModal();
      dialog.querySelector<HTMLButtonElement>('[data-calendar-close]')?.focus();
      void execute({ kind: 'read' });
    });
  } finally { cleanup(); }
}

export function bindSocialCalendar(root: HTMLElement, options: SocialCalendarOptions): () => void {
  let open = false;
  const click = (event: MouseEvent) => {
    const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>('[data-social-calendar]') : null;
    if (!button || open) return;
    open = true;
    void openSocialCalendar(button.dataset.socialCalendar ?? 'attendance', options)
      .catch(failure => options.onError(failure instanceof Error ? failure.message : 'Social/calendar could not open.'))
      .finally(() => { open = false; });
  };
  root.addEventListener('click', click);
  return () => root.removeEventListener('click', click);
}
