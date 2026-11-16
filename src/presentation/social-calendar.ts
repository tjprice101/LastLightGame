import { attendanceReward, type SocialReward } from '../content/social-calendar';
import { materialArt, materialName } from '../content/dungeon-art';
import { createGameDialog, escapeDialogText as escape } from './game-dialog';
import { currencyIcon } from './currency-icon';
import { assetUrl } from './portrait';
import { uiIcon } from './ui-icon';
import { presentReward } from './reward-screen';
import { rarityFeedback, clearRarityFeedback } from './rarity-feedback';
import { staggerIn } from './luster';
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
  const currentDay = view.attendedToday ? view.attendance : canClaim ? view.attendance + 1 : 0;
  const today = view.attendedToday ? 'Attendance saved' : canClaim ? socialRewardText(view.nextReward) : 'Monthly rewards complete';
  return `<section class="social-calendar-panel attendance-panel">
    <div class="attendance-metrics">
      <article><span>Rewards saved · ${escape(view.month)}</span><div class="attendance-progress"><strong>${view.attendance} <small>/ ${view.daysInMonth}</small></strong>
        <progress value="${view.attendance}" max="${view.daysInMonth}" aria-label="Monthly attendance rewards saved"></progress></div></article>
      <article><span>Consecutive streak</span><strong>${view.streak} ${view.streak === 1 ? 'day' : 'days'}</strong></article>
      <article class="${view.attendedToday ? 'is-saved' : ''}"><span>${canClaim ? `Next · Day ${view.attendance + 1}` : 'Today'}</span><strong>${escape(today)}</strong>
        ${view.nextReward.streakPremium && canClaim ? `<small>Includes ${view.nextReward.streakPremium} Null-Prismatica streak bonus.</small>` : ''}</article>
    </div>
    <ol class="attendance-ladder" data-days="${view.daysInMonth}" aria-label="Monthly ordinal attendance rewards">${Array.from({ length: view.daysInMonth }, (_, index) => {
      const ordinal = index + 1;
      const reward = attendanceReward(ordinal, 1);
      return `<li class="${ordinal <= view.attendance ? 'is-claimed' : ''} ${ordinal === currentDay ? 'is-current' : ''}">
        <div class="attendance-day"><span>Day ${String(ordinal).padStart(2, '0')}</span>${ordinal === currentDay ? '<b>Today</b>' : ordinal <= view.attendance ? '<b>✓ Saved</b>' : ''}</div>
        <strong>${reward.fractalis.toLocaleString('en-US')} <span>Prismatica</span></strong>
        ${reward.lycalis ? `<small>+${reward.lycalis.toLocaleString('en-US')} Null-Prismatica</small>` : ''}</li>`;
    }).join('')}</ol>
    <p class="social-calendar-policy">Claim once per New York reset day at 8:00 PM. Missed days keep monthly progress but break the consecutive streak. Streaks carry across months; there is no catch-up.</p>
    ${canClaim ? '<footer class="social-calendar-action"><button type="button" data-calendar-action="attend">Save today’s attendance</button><span>Rewards are saved only when you claim.</span></footer>' : ''}
  </section>`;
}
const mailPageSize = 4;
const mailBodyPageSize = 1200;
function mailDate(createdAt: string): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric', year: 'numeric' })
    .format(Date.parse(createdAt));
}
function mailboxMarkup(view: SocialCalendarView, requestedPage = 0): string {
  const unclaimed = view.mail.filter(mail => !mail.informational && !mail.claimed).length;
  const pages = Math.max(1, Math.ceil(view.mail.length / mailPageSize));
  const page = Math.max(0, Math.min(pages - 1, requestedPage));
  const visible = view.mail.slice(page * mailPageSize, (page + 1) * mailPageSize);
  return `<section class="social-calendar-panel mailbox-panel">
    ${visible.length ? `<ul class="social-mail-list">${visible.map(mail => `<li class="social-mail-card" ${mail.read ? '' : 'data-unread="true"'}>
      <button type="button" class="social-mail-open" data-calendar-mail="${escape(mail.id)}" aria-label="Open ${escape(mail.title)} from ${escape(mail.sender)}">
        <span class="social-mail-icon">${uiIcon('mail')}</span><span class="social-mail-copy">
          <span class="social-mail-meta">${escape(mail.sender)} · <time datetime="${escape(mail.createdAt)}">${escape(mailDate(mail.createdAt))}</time></span>
          <b>${escape(mail.title)}</b>${mail.informational ? '' : `<span class="info-number">${escape(socialRewardText(mail.attachment))}</span>`}</span>
        <span class="social-mail-state">${mail.read ? 'Read' : 'Unread'} · ${mail.informational ? 'No attachment' : mail.claimed ? 'Claimed attachment' : 'Unclaimed attachment'}</span>
      </button>
      ${!mail.informational && !mail.claimed ? `<button type="button" class="social-mail-claim" data-calendar-claim="${escape(mail.id)}">Claim</button>` : ''}</li>`).join('')}</ul>`
      : '<p class="mailbox-empty">Your mailbox is empty.</p>'}
    ${view.mail.length > mailPageSize ? `<nav class="social-mail-pages" aria-label="Mailbox pages"><button type="button" data-calendar-mail-page="-1" aria-label="Previous mailbox page" ${page === 0 ? 'disabled' : ''}>Previous</button><span>Page ${page + 1} of ${pages}</span><button type="button" data-calendar-mail-page="1" aria-label="Next mailbox page" ${page === pages - 1 ? 'disabled' : ''}>Next</button></nav>` : ''}
    <div class="mailbox-toolbar"><p class="social-calendar-policy">${view.mail.filter(mail => !mail.read).length} unread · ${view.mail.length} total. Mail never expires; reading does not claim attachments. Receiving gifts has no daily cap.</p>
      ${unclaimed ? `<button type="button" data-calendar-action="claimAll">Claim all attachments · ${unclaimed}</button>` : ''}</div>
  </section>`;
}
function giftsMarkup(view: SocialCalendarView, friends: readonly SocialPeerDisplay[]): string {
  const canSend = !view.giftSentToday && friends.length > 0;
  const seed = (id: string) => {
    const art = materialArt(id);
    return `<label><input type="radio" name="gift" value="${escape(id)}"><span class="social-gift-attachment">
      <span class="social-gift-art">${art ? `<img src="${assetUrl(`materials/${art}.png`)}" alt="" width="48" height="48">` : '<span>Art pending</span>'}</span>
      <span class="info-number">10 ${escape(materialName(id))}</span></span></label>`;
  };
  return `<section class="social-calendar-panel gifts-panel">
    <form data-calendar-gift class="social-gift-form"><div class="social-gift-overview">
      <span class="social-eyebrow">Daily friend benefit</span><h3>Send a free gift</h3>
      <p class="social-gift-availability" role="status">${view.giftSentToday ? 'Sent today' : 'One send available'}</p>
      <p class="social-calendar-policy">Send once per account each New York reset day to one accepted friend. Nothing is deducted from your inventory. Unlaunched Moon/Sunshade Seeds are not eligible.</p>
      <label class="social-gift-recipient"><span>Accepted friend</span><select name="friend" required aria-label="Choose an accepted friend" ${canSend ? '' : 'disabled'}>
        <option value="" selected disabled>Choose a friend</option>${friends.map(friend => `<option value="${escape(friend.userId)}">${escape(friend.displayName)} (@${escape(friend.username)})</option>`).join('')}
      </select></label>${!view.giftSentToday && !friends.length ? '<p class="social-gift-sent">No accepted friends yet. Add and accept a friend first.</p>' : ''}
    </div><div class="social-gift-selection">
      <fieldset class="social-gift-options" ${view.giftSentToday ? 'disabled' : ''}><legend>Gift attachment · Choose one</legend>
        <label><input type="radio" name="gift" value="fractalis" checked><span class="social-gift-attachment"><span class="social-gift-art">${currencyIcon('fractalis')}</span><span class="info-number">1,000 Prismatica</span></span></label>
        <label><input type="radio" name="gift" value="lycalis"><span class="social-gift-attachment"><span class="social-gift-art">${currencyIcon('lycalis')}</span><span class="info-number">10 Null-Prismatica</span></span></label>
        ${view.seedChoices.map(seed).join('')}
      </fieldset>
      <footer class="social-calendar-action"><button type="submit" ${canSend ? '' : 'disabled'}>Review free gift</button><span>One recipient · No inventory cost · Saved to their mailbox</span></footer>
    </div></form></section>`;
}
export function socialCalendarMarkup(view: SocialCalendarView, tab: string, friends: readonly SocialPeerDisplay[], mailPage = 0): string {
  return tab === 'attendance' ? attendanceMarkup(view) : tab === 'gifts' ? giftsMarkup(view, friends) : mailboxMarkup(view, mailPage);
}
function serverTimeMarkup(view: SocialCalendarView): string {
  return `Server reset day <time>${escape(view.resetDay)}</time> · Next reset <time datetime="${escape(view.nextResetAt)}">${escape(new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  }).format(Date.parse(view.nextResetAt)))}</time>`;
}

function readMailMarkup(mail: PlayerMail, requestedPage = 0): string {
  const bodyCharacters = Array.from(mail.body);
  const pages = Math.max(1, Math.ceil(bodyCharacters.length / mailBodyPageSize));
  const page = Math.max(0, Math.min(pages - 1, requestedPage));
  const body = bodyCharacters.slice(page * mailBodyPageSize, (page + 1) * mailBodyPageSize).join('');
  return `<section class="social-calendar-panel mail-reader">
    <header class="social-pane-heading"><div><span class="social-eyebrow">${escape(mail.sender)} · ${escape(mailDate(mail.createdAt))}</span><h3>${escape(mail.title)}</h3></div>
      <button type="button" data-calendar-back>Back to mailbox</button></header>
    <div class="social-mail-body">${escape(body)}</div>
    ${pages > 1 ? `<nav class="social-mail-pages" aria-label="Message pages"><button type="button" data-calendar-body-page="-1" ${page === 0 ? 'disabled' : ''}>Previous</button><span>Message page ${page + 1} of ${pages}</span><button type="button" data-calendar-body-page="1" ${page === pages - 1 ? 'disabled' : ''}>Next</button></nav>` : ''}
    <div class="social-mail-attachment"><div><span class="social-eyebrow">ATTACHMENT · NO EXPIRY</span><strong>${escape(socialRewardText(mail.attachment))}</strong></div>
      <span>${mail.informational ? 'Informational patch notes' : mail.claimed ? 'Attachment already saved' : 'Unclaimed attachment'}</span></div>
    ${!mail.informational && !mail.claimed ? `<button type="button" data-calendar-claim="${escape(mail.id)}">Claim attachment</button>` : ''}
  </section>`;
}

export async function openSocialCalendar(tab: string, options: SocialCalendarOptions): Promise<void> {
  if (options.state.identity !== options.identity) {
    options.state.identity = options.identity;
    options.state.pending = undefined;
  }
  const { dialog, dispose } = createGameDialog('Attendance & mail');
  dialog.classList.add('social-calendar-dialog');
  dialog.innerHTML = `<header class="social-calendar-heading"><h2>Attendance &amp; mail</h2><div>
      <button type="button" data-calendar-refresh aria-label="Refresh from server">${uiIcon('refresh')}<span>Refresh</span></button>
      <button type="button" data-calendar-close aria-label="Close Attendance and mail">${uiIcon('close')}</button></div></header>
    <nav class="social-calendar-tabs" aria-label="Social and calendar"><button type="button" data-calendar-tab="attendance">Attendance</button><button type="button" data-calendar-tab="mail">Mailbox</button><button type="button" data-calendar-tab="gifts">Free gift</button></nav>
    <div class="social-calendar-content" data-calendar-content></div>
    <footer class="social-calendar-footer"><div class="social-calendar-feedback"><p data-calendar-status role="status">Loading from the server…</p><p data-calendar-error role="alert"></p>
      <button type="button" data-calendar-retry hidden>Retry pending action</button></div><p class="social-server-time" data-calendar-time></p></footer>`;
  const content = dialog.querySelector<HTMLElement>('[data-calendar-content]')!;
  const status = dialog.querySelector<HTMLElement>('[data-calendar-status]')!;
  const error = dialog.querySelector<HTMLElement>('[data-calendar-error]')!;
  const retry = dialog.querySelector<HTMLButtonElement>('[data-calendar-retry]')!;
  const feedback = dialog.querySelector<HTMLElement>('.social-calendar-feedback')!;
  const clock = dialog.querySelector<HTMLElement>('[data-calendar-time]')!;
  let currentTab = ['attendance', 'mail', 'gifts'].includes(tab) ? tab : 'attendance';
  let view: SocialCalendarView | undefined;
  let busy = false;
  let selectedMail: string | undefined;
  let mailPage = 0;
  let mailBodyPage = 0;
  let proposedGift: Extract<SocialCalendarCommand, { kind: 'sendGift' }> | undefined;
  let disposed = false;
  let resolveClosed: (() => void) | undefined;
  let shownTab: string | undefined;
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
    content.classList.toggle('is-mail-reader', !!mail);
    content.classList.toggle('is-gift-confirmation', !!proposedGift);
    if (proposedGift) {
      content.innerHTML = `<section class="social-calendar-panel gift-confirmation"><span class="social-eyebrow">CONFIRM FREE GIFT</span>
        <h3 data-calendar-gift-confirmation></h3><p>This uses your one free send for this reset day. Nothing is deducted from your inventory.</p>
        <div class="social-calendar-action"><button type="button" data-calendar-send-confirm>Send gift</button><button type="button" data-calendar-send-cancel>Cancel</button></div></section>`;
      const recipient = options.friends().find(item => item.userId === proposedGift!.userId);
      const gift = proposedGift.gift === 'seed' ? `10 ${materialName(proposedGift.materialId)}` :
        proposedGift.gift === 'fractalis' ? '1,000 Prismatica' : '10 Null-Prismatica';
      content.querySelector('[data-calendar-gift-confirmation]')!.textContent = `Send ${gift} to ${recipient?.displayName ?? 'your friend'}?`;
    } else content.innerHTML = mail ? readMailMarkup(mail, mailBodyPage) :
      view ? socialCalendarMarkup(view, currentTab, options.friends(), mailPage) : '';
    clock.innerHTML = view ? serverTimeMarkup(view) : '';
    // Cards cascade once per tab arrival after the server view loads (D-469); refreshes, busy states and
    // the mail reader never replay it. Static under Reduce motion.
    if (view && !mail && !proposedGift && shownTab !== currentTab) {
      shownTab = currentTab;
      const panel = content.querySelector<HTMLElement>('.social-calendar-panel');
      if (panel) staggerIn(panel, '.attendance-metrics > article, .attendance-ladder > li, .social-mail-card, .social-gift-options > label', { stepMs: 18, maxSteps: 16, durationMs: 300 });
    }
    feedback.dataset.state = busy ? 'loading' : error.textContent ? 'error' : 'ready';
    retry.hidden = !options.state.pending;
    dialog.setAttribute('aria-busy', String(busy));
    content.querySelectorAll<HTMLButtonElement | HTMLInputElement | HTMLSelectElement>('button,input,select').forEach(control => {
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
        mailBodyPage = 0;
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
    if (tabButton) {
      currentTab = tabButton.dataset.calendarTab!;
      selectedMail = undefined; mailPage = 0; mailBodyPage = 0; proposedGift = undefined; paint(); return;
    }
    const mailboxPage = event.target.closest<HTMLButtonElement>('[data-calendar-mail-page]');
    if (mailboxPage && view) {
      mailPage = Math.max(0, Math.min(Math.ceil(view.mail.length / mailPageSize) - 1,
        mailPage + Number(mailboxPage.dataset.calendarMailPage)));
      paint();
      content.querySelector<HTMLButtonElement>(`[data-calendar-mail-page="${mailboxPage.dataset.calendarMailPage}"]`)?.focus();
      return;
    }
    const bodyPage = event.target.closest<HTMLButtonElement>('[data-calendar-body-page]');
    if (bodyPage && selectedMail) {
      mailBodyPage += Number(bodyPage.dataset.calendarBodyPage);
      paint();
      content.querySelector<HTMLButtonElement>(`[data-calendar-body-page="${bodyPage.dataset.calendarBodyPage}"]`)?.focus();
      return;
    }
    if (event.target.closest('[data-calendar-back]')) {
      selectedMail = undefined; mailBodyPage = 0; paint(); content.querySelector<HTMLButtonElement>('[data-calendar-mail]')?.focus(); return;
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
    if (!view || view.giftSentToday || !friend) {
      error.textContent = 'Choose an accepted friend with an available free send.';
      return;
    }
    if (gift !== 'fractalis' && gift !== 'lycalis' && !view.seedChoices.includes(gift)) {
      error.textContent = 'Choose an available gift attachment.';
      return;
    }
    error.textContent = '';
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
