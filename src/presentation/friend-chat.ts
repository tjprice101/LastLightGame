import { createGameDialog, escapeDialogText as escape, gameConfirm } from './game-dialog';
import { profilePicture } from './profile-picture';
import type { SocialPeerDisplay } from './online-store-profile';
import { chatOperation, GameOperationError } from '../online/server-game';
import './friend-chat.css';

export interface ChatMember extends SocialPeerDisplay {}
export interface ChatMessageView { id: string; senderId: string; senderName?: string; text: string; createdAt: string }
export interface ChatConversationView {
  id: string; kind: 'direct' | 'group'; name: string; ownerId: string | null;
  members: readonly ChatMember[]; unread: number; pinned: boolean; muted: boolean;
  lastMessage?: string;
  canSend?: boolean;
  invited?: readonly ChatMember[];
}
export interface ChatView {
  selfUserId: string;
  conversations: readonly ChatConversationView[];
  messages: readonly ChatMessageView[];
  invitations: readonly { conversationId: string; name: string; inviter: string }[];
  blocked: readonly ChatMember[];
  hasMore: boolean;
  unreadTotal?: number;
}
export type ChatCommand =
  | { kind: 'read'; conversationId?: string; before?: string }
  | { kind: 'direct'; userId: string }
  | { kind: 'createGroup'; name: string; userIds: string[] }
  | { kind: 'send'; conversationId: string; text: string }
  | { kind: 'invite'; conversationId: string; userId: string }
  | { kind: 'respondInvite'; conversationId: string; accept: boolean }
  | { kind: 'removeMember'; conversationId: string; userId: string }
  | { kind: 'leave'; conversationId: string }
  | { kind: 'preferences'; conversationId: string; pinned?: boolean; muted?: boolean }
  | { kind: 'block'; userId: string }
  | { kind: 'unblock'; userId: string };
export interface ChatUiState {
  selected?: string; drafts: Map<string, string>; query: string;
  pending?: { conversationId: string; text: string; requestId: string };
  retry?: { command: ChatCommand; requestId: string };
  openPeer?: string;
}
export interface ChatTransportResult { view: ChatView; selected?: string }
type Transport = (command: ChatCommand, requestId: string) => Promise<ChatTransportResult>;

export async function onlineChatTransport(command: ChatCommand, requestId: string): Promise<ChatTransportResult> {
  const response = await chatOperation(command, requestId);
  return {
    selected: response.conversationId ?? undefined,
    view: {
      ...response,
      conversations: response.conversations.map(chat => ({ ...chat, lastMessage: chat.lastMessage?.text })),
      invitations: response.invitations.map(invite => ({ ...invite, inviter: invite.inviter.displayName })),
    },
  };
}

export function chatShell(): string {
  return `<div class="friend-chat-layout" data-chat-root>
    <section class="chat-list-panel"><div class="chat-actions"><button data-chat-action="new-direct">New message</button><button data-chat-action="new-group">New group</button></div>
    <label>Search chats<input type="search" data-chat-search placeholder="Name or group"></label><div class="chat-conversations" data-chat-list></div>
    <button data-chat-action="blocked">Blocked players</button><button data-chat-action="refresh">Refresh</button><button data-chat-action="retry" hidden>Retry pending chat action</button></section>
    <section class="chat-thread"><header data-chat-header><h2>Chats</h2></header><p class="chat-status" role="status" data-chat-status>Loading chats…</p>
    <div class="chat-messages" data-chat-messages tabindex="0" aria-label="Conversation messages"></div>
    <form class="chat-composer"><label class="profile-accessible-heading" for="chat-message">Message</label><textarea id="chat-message" data-chat-draft maxlength="500" rows="2" placeholder="Write a message" disabled></textarea>
    <button type="submit" disabled>Send</button><small data-chat-counter>0 / 500 · Text only</small></form></section>
    <aside class="chat-detail-panel" data-chat-details><h2>Conversation details</h2><p>Select a chat or start a message with a friend.</p></aside>
  </div>`;
}

function avatar(member: ChatMember): string {
  return `<span class="chat-avatar" data-profile-frame="${escape(member.frame)}">${profilePicture(member.icon)}</span>`;
}

async function chooseFriends(friends: readonly SocialPeerDisplay[], group: boolean, title: string): Promise<{ name: string; ids: string[] } | null> {
  const { dialog, dispose } = createGameDialog(title);
  dialog.classList.add('chat-dialog');
  dialog.innerHTML = `<h2>${escape(title)}</h2>${friends.length ? `<form method="dialog">
    ${group ? '<label>Group name<input name="name" maxlength="48" required autocomplete="off"></label>' : ''}
    <fieldset class="chat-friend-choices"><legend>${group ? 'Invite friends (up to 9)' : 'Friend'}</legend>${friends.map(friend => `<label><input type="${group ? 'checkbox' : 'radio'}" name="friends" value="${escape(friend.userId)}" ${group ? '' : 'required'}>${avatar(friend)}<span>${escape(friend.displayName)}<small>@${escape(friend.username)}</small></span></label>`).join('')}</fieldset>
    <p role="alert" data-choice-error></p><div class="game-dialog-actions"><button value="cancel" formnovalidate>Cancel</button><button value="choose">${group ? 'Create and invite' : 'Choose friend'}</button></div></form>` : '<p>No eligible friends. Add a friend first.</p><form method="dialog" class="game-dialog-actions"><button value="cancel">Back</button></form>'}`;
  try {
    return await new Promise((resolve, reject) => {
      const cancel = () => { resolve(null); dialog.close(); };
      dialog.addEventListener('close', () => resolve(null), { once: true });
      dialog.addEventListener('cancel', event => { event.preventDefault(); cancel(); });
      dialog.addEventListener('keydown', event => {
        if (event.key !== 'Escape') return;
        event.preventDefault(); event.stopPropagation(); cancel();
      });
      dialog.addEventListener('submit', event => {
        event.preventDefault();
        if (!(event.submitter instanceof HTMLButtonElement) || event.submitter.value !== 'choose') { cancel(); return; }
        const ids = Array.from(dialog.querySelectorAll<HTMLInputElement>('input[name="friends"]:checked')).map(input => input.value);
        const name = dialog.querySelector<HTMLInputElement>('input[name="name"]')?.value.trim() ?? '';
        if (!ids.length || group && (!name || ids.length > 9)) {
          dialog.querySelector('[data-choice-error]')!.textContent = 'Choose 1–9 friends and enter a group name.';
          return;
        }
        resolve({ name, ids }); dialog.close();
      });
      try { dialog.showModal(); } catch (error) { reject(error); }
    });
  } finally { dispose(); }
}

export function bindFriendChat(host: HTMLElement, state: ChatUiState, friends: () => readonly SocialPeerDisplay[],
  transport: Transport, report: (error: unknown) => void): () => void {
  const root = host.querySelector<HTMLElement>('[data-chat-root]');
  if (!root) return () => {};
  const list = root.querySelector<HTMLElement>('[data-chat-list]')!;
  const messages = root.querySelector<HTMLElement>('[data-chat-messages]')!;
  const details = root.querySelector<HTMLElement>('[data-chat-details]')!;
  const header = root.querySelector<HTMLElement>('[data-chat-header]')!;
  const status = root.querySelector<HTMLElement>('[data-chat-status]')!;
  const form = root.querySelector<HTMLFormElement>('.chat-composer')!;
  const draft = root.querySelector<HTMLTextAreaElement>('[data-chat-draft]')!;
  const send = form.querySelector<HTMLButtonElement>('button')!;
  const search = root.querySelector<HTMLInputElement>('[data-chat-search]')!;
  let view: ChatView | null = null, disposed = false, busy = false, sequence = 0;
  if (state.pending) state.selected = state.pending.conversationId;
  let loadedId: string | undefined, messageSignature = '';
  const alive = () => !disposed && root.isConnected;
  const active = () => view?.conversations.find(chat => chat.id === state.selected);
  const updateComposer = () => {
    const chat = active();
    const blocked = chat?.kind === 'direct' && chat.members.some(member => view?.blocked.some(person => person.userId === member.userId));
    draft.disabled = !chat || busy || !!blocked || chat.canSend === false;
    send.disabled = draft.disabled || !draft.value.trim();
    draft.readOnly = !!state.pending;
    send.textContent = state.pending ? 'Retry send' : 'Send';
    root.querySelector<HTMLElement>('[data-chat-action="retry"]')!.hidden = !state.retry;
    root.querySelector('[data-chat-counter]')!.textContent = `${draft.value.length} / 500 · Text only`;
  };
  const draw = (reset = false) => {
    if (!view || !alive()) return;
    const unread = host.querySelector<HTMLElement>('[data-chat-unread]');
    if (unread) unread.textContent = String(view.unreadTotal ?? view.conversations.filter(chat => !chat.muted).reduce((sum, chat) => sum + chat.unread, 0));
    const chat = active(), previousScroll = messages.scrollTop, listScroll = list.scrollTop;
    const nearBottom = messages.scrollHeight - messages.clientHeight - previousScroll < 50;
    const pinnedFirst = [...view.conversations].sort((a, b) => Number(b.pinned) - Number(a.pinned));
    list.innerHTML = pinnedFirst.filter(entry => entry.name.toLowerCase().includes(state.query.toLowerCase())).map(entry =>
      `<button class="chat-conversation" data-chat-select="${escape(entry.id)}" aria-pressed="${entry.id === state.selected}">${entry.kind === 'direct' ? avatar(entry.members.find(member => member.userId !== view!.selfUserId) ?? entry.members[0]) : '<span class="chat-avatar" aria-hidden="true">Group</span>'}<span><b>${escape(entry.name)}</b><small>${entry.unread ? `${entry.unread} unread · ` : ''}${entry.pinned ? 'Pinned · ' : ''}${entry.muted ? 'Muted · ' : ''}${escape(entry.lastMessage ?? 'No messages yet')}</small></span></button>`).join('') || '<p>No matching conversations.</p>';
    list.scrollTop = listScroll;
    header.innerHTML = chat ? `<h2>${escape(chat.name)}</h2><div class="chat-actions"><button data-chat-action="pin" aria-pressed="${chat.pinned}">${chat.pinned ? 'Unpin' : 'Pin'}</button><button data-chat-action="mute" aria-pressed="${chat.muted}">${chat.muted ? 'Unmute' : 'Mute'}</button></div>` : '<h2>Chats</h2>';
    const signature = JSON.stringify([state.selected, view.messages, view.hasMore]);
    if (signature !== messageSignature) {
      messages.innerHTML = chat ? `${view.hasMore ? '<button data-chat-action="older">Load earlier messages</button>' : ''}${view.messages.map(message => {
        const member = chat.members.find(person => person.userId === message.senderId);
        return `<article class="chat-message ${message.senderId === view!.selfUserId ? 'is-self' : ''}" data-chat-message="${escape(message.id)}">${member ? avatar(member) : '<span class="chat-avatar">?</span>'}<div class="chat-message-content"><small>${escape(member?.displayName ?? message.senderName ?? 'Former member')} · <time datetime="${escape(message.createdAt)}">${escape(new Date(message.createdAt).toLocaleString())}</time></small><p>${escape(message.text)}</p></div></article>`;
      }).join('') || '<p>No messages yet.</p>'}` : '<p>Select a conversation to read messages.</p>';
      messageSignature = signature;
      if (reset || nearBottom) messages.scrollTop = messages.scrollHeight;
      else messages.scrollTop = previousScroll;
    }
    details.innerHTML = `${chat ? `<h2>${escape(chat.kind === 'group' ? chat.name : 'Friend details')}</h2><p>${chat.kind === 'group' ? `${chat.members.length} members + ${chat.invited?.length ?? 0} invited / 10 · Invite only` : 'Private text conversation'}</p>${chat.members.map(member => `<div class="chat-member">${avatar(member)}<span>${escape(member.displayName)}<small>${member.userId === chat.ownerId ? ' · Owner' : ''}</small></span>${chat.kind === 'group' && member.userId !== view!.selfUserId ? `<div class="chat-actions">${chat.ownerId === view!.selfUserId ? `<button data-chat-remove="${escape(member.userId)}">Remove</button>` : ''}<button data-chat-block="${escape(member.userId)}">Block</button></div>` : ''}</div>`).join('')}${chat.invited?.map(member => `<div class="chat-member">${avatar(member)}<span>${escape(member.displayName)} · Invited</span>${chat.ownerId === view!.selfUserId ? `<button data-chat-remove="${escape(member.userId)}">Cancel invite</button>` : ''}</div>`).join('') ?? ''}<div class="chat-actions">${chat.kind === 'group' ? `${chat.ownerId === view.selfUserId ? `<button data-chat-action="invite" ${chat.members.length + (chat.invited?.length ?? 0) >= 10 ? 'disabled' : ''}>Invite friend</button>` : ''}<button data-chat-action="leave">Leave group</button>` : `<button data-chat-action="block">Block player</button>`}</div>` : '<h2>Conversation details</h2><p>Choose a chat to see members.</p>'}
      ${view.invitations.length ? `<h3>Group invitations</h3>${view.invitations.map(invite => `<article><b>${escape(invite.name)}</b><p>Invited by ${escape(invite.inviter)}</p><div class="chat-actions"><button data-chat-invite="${escape(invite.conversationId)}" data-accept="true">Accept</button><button data-chat-invite="${escape(invite.conversationId)}" data-accept="false">Decline</button></div></article>`).join('')}` : ''}`;
    if (loadedId !== state.selected) {
      draft.value = state.selected ? state.drafts.get(state.selected) ?? '' : '';
      loadedId = state.selected;
    }
    updateComposer();
  };
  const request = async (command: ChatCommand, requestId: string = crypto.randomUUID(), older = false) => {
    if (!alive() || busy) return;
    if (command.kind !== 'read') state.retry = { command, requestId };
    busy = true; updateComposer();
    const current = ++sequence, selected = state.selected;
    try {
      const response = await transport(command, requestId);
      if (!alive() || current !== sequence) return;
      if (older && view) {
        const height = messages.scrollHeight;
        const seen = new Set(view.messages.map(message => message.id));
        view = { ...response.view, messages: [...response.view.messages.filter(message => !seen.has(message.id)), ...view.messages] };
        draw(); messages.scrollTop += messages.scrollHeight - height;
      } else {
        if (view && command.kind === 'read' && command.conversationId === selected && selected === loadedId
          && response.view.conversations.some(chat => chat.id === selected)) {
          const merged = new Map([...view.messages, ...response.view.messages]
            .filter(message => !response.view.blocked.some(peer => peer.userId === message.senderId))
            .map(message => [message.id, message]));
          const keptEarlier = view.messages.length > 0 && response.view.messages.length > 0
            && view.messages[0].id !== response.view.messages[0].id
            && Date.parse(view.messages[0].createdAt) <= Date.parse(response.view.messages[0].createdAt);
          view = { ...response.view, hasMore: keptEarlier ? view.hasMore : response.view.hasMore,
            messages: [...merged.values()].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)) };
        } else view = response.view;
        if (response.selected) state.selected = response.selected;
        if (state.selected && !active()) state.selected = undefined;
        if (command.kind === 'send') {
          state.pending = undefined;
          state.drafts.delete(command.conversationId);
          if (state.selected === command.conversationId) draft.value = '';
        }
        draw(selected !== state.selected);
      }
      if (command.kind !== 'read') state.retry = undefined;
      if (command.kind === 'direct') state.openPeer = undefined;
      status.textContent = '';
    } catch (error) {
      if (!alive() || current !== sequence) return;
      console.error('Chat operation failed', error);
      if (error instanceof GameOperationError && [400, 401, 403, 409].includes(error.status ?? 0)) {
        state.retry = undefined;
        state.pending = undefined;
        if (command.kind === 'direct') state.openPeer = undefined;
      }
      status.textContent = error instanceof Error ? error.message : 'Chat request failed. Retry to reconnect.';
      report(error);
    } finally { if (alive() && current === sequence) { busy = false; updateComposer(); } }
  };
  const onInput = (event: Event) => {
    if (event.target === search) { state.query = search.value; draw(); }
    if (event.target === draft) {
      if (state.selected) state.drafts.set(state.selected, draft.value);
      updateComposer();
    }
  };
  const onSubmit = (event: Event) => {
    if (event.target !== form) return;
    event.preventDefault();
    const chat = active();
    if (!chat || busy || !draft.value.trim() || send.disabled) return;
    if (state.retry && state.retry.command.kind !== 'send') {
      status.textContent = 'Retry the pending chat action before sending a message.';
      return;
    }
    if (draft.value.length > 500) {
      status.textContent = 'Messages must contain at most 500 characters.';
      return;
    }
    if (state.pending && (state.pending.conversationId !== chat.id || state.pending.text !== draft.value.trim())) {
      status.textContent = 'Retry the pending message before changing it or sending another message.';
      return;
    }
    state.pending ??= { conversationId: chat.id, text: draft.value.trim(), requestId: crypto.randomUUID() };
    void request({ kind: 'send', conversationId: state.pending.conversationId, text: state.pending.text }, state.pending.requestId);
  };
  const onClick = (event: Event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest<HTMLButtonElement>('button');
    if (!button || button.disabled || busy) return;
    void (async () => {
      if (button.dataset.chatAction === 'retry' && state.retry) {
        await request(state.retry.command, state.retry.requestId);
        return;
      }
      if (state.retry && button.dataset.chatAction !== 'refresh') {
        status.textContent = 'Retry the pending chat action before making another change.';
        return;
      }
      if (button.dataset.chatSelect) {
        if (state.pending) { status.textContent = 'Retry the pending message before switching conversations.'; return; }
        state.selected = button.dataset.chatSelect;
        await request({ kind: 'read', conversationId: state.selected });
        return;
      }
      if (button.dataset.chatInvite) {
        await request({ kind: 'respondInvite', conversationId: button.dataset.chatInvite, accept: button.dataset.accept === 'true' }); return;
      }
      const chat = active(), action = button.dataset.chatAction;
      if (state.pending && action !== 'refresh') {
        status.textContent = 'Retry the pending message before changing the conversation.';
        return;
      }
      if (button.dataset.chatRemove && chat) {
        if (await gameConfirm('Remove this member from the group?', { title: 'Remove member', confirmLabel: 'Remove' }) && alive())
          await request({ kind: 'removeMember', conversationId: chat.id, userId: button.dataset.chatRemove });
        return;
      }
      if (button.dataset.chatBlock && chat) {
        const member = chat.members.find(peer => peer.userId === button.dataset.chatBlock);
        if (member && await gameConfirm(`Block ${member.displayName}? They cannot message you or send new friend requests. Their group messages will be hidden.`, { title: 'Block player', confirmLabel: 'Block' }) && alive()) {
          await request({ kind: 'block', userId: member.userId });
        }
        return;
      }
      if (action === 'refresh') { await request({ kind: 'read', conversationId: state.selected }); return; }
      if (action === 'new-direct' || action === 'new-group' || action === 'invite') {
        const eligible = friends().filter(friend => !view?.blocked.some(member => member.userId === friend.userId) && (action !== 'invite' || ![...(chat?.members ?? []), ...(chat?.invited ?? [])].some(member => member.userId === friend.userId)));
        const selection = await chooseFriends(eligible, action === 'new-group', action === 'invite' ? 'Invite friend' : action === 'new-group' ? 'New group' : 'New message');
        if (!selection || !alive()) return;
        await request(action === 'new-group' ? { kind: 'createGroup', name: selection.name, userIds: selection.ids }
          : action === 'invite' && chat ? { kind: 'invite', conversationId: chat.id, userId: selection.ids[0] }
          : { kind: 'direct', userId: selection.ids[0] }); return;
      }
      if (action === 'blocked') {
        const { dialog, dispose } = createGameDialog('Blocked players');
        dialog.innerHTML = `<h2>Blocked players</h2><p>Blocked players cannot message you or send new friend requests.</p>${view?.blocked.map(member => `<p>${escape(member.displayName)} <button data-chat-unblock="${escape(member.userId)}">Unblock</button></p>`).join('') || '<p>No blocked players.</p>'}<form method="dialog" class="game-dialog-actions"><button>Back</button></form>`;
        const userId = await new Promise<string | null>((resolve, reject) => {
          const cancel = () => { resolve(null); dialog.close(); };
          dialog.addEventListener('close', () => resolve(null), { once: true });
          dialog.addEventListener('cancel', event => { event.preventDefault(); cancel(); });
          dialog.addEventListener('keydown', event => {
            if (event.key !== 'Escape') return;
            event.preventDefault(); event.stopPropagation(); cancel();
          });
          dialog.addEventListener('submit', event => { event.preventDefault(); cancel(); });
          dialog.addEventListener('click', event => { if (event.target instanceof Element) {
            const unblock = event.target.closest<HTMLElement>('[data-chat-unblock]');
            if (unblock) { resolve(unblock.dataset.chatUnblock!); dialog.close(); }
          } });
          try { dialog.showModal(); } catch (error) { reject(error); }
        }).finally(dispose);
        if (userId && alive()) await request({ kind: 'unblock', userId });
        return;
      }
      if (!chat) return;
      if (action === 'pin' || action === 'mute') await request({ kind: 'preferences', conversationId: chat.id, ...(action === 'pin' ? { pinned: !chat.pinned } : { muted: !chat.muted }) });
      if (action === 'older' && view?.messages[0]) await request({ kind: 'read', conversationId: chat.id, before: view.messages[0].id }, undefined, true);
      if (action === 'leave' && await gameConfirm('Leave this group? If you own it, ownership passes to the earliest remaining member.', { title: 'Leave group', confirmLabel: 'Leave' }) && alive()) await request({ kind: 'leave', conversationId: chat.id });
      if (action === 'block') {
        const peer = chat.members.find(member => member.userId !== view?.selfUserId);
        if (peer && await gameConfirm(`Block ${peer.displayName}? They cannot send you messages or new friend requests.`, { title: 'Block player', confirmLabel: 'Block' }) && alive()) await request({ kind: 'block', userId: peer.userId });
      }
    })().catch(error => { if (alive()) { console.error('Chat control failed', error); report(error); } });
  };
  search.value = state.query;
  root.addEventListener('input', onInput);
  root.addEventListener('click', onClick);
  root.addEventListener('submit', onSubmit);
  const refresh = () => { if (alive() && !busy && !state.retry && document.visibilityState === 'visible') void request({ kind: 'read', conversationId: state.selected }); };
  document.addEventListener('visibilitychange', refresh);
  const timer = window.setInterval(refresh, 10000);
  void request(state.openPeer && !state.retry ? { kind: 'direct', userId: state.openPeer } : { kind: 'read', conversationId: state.selected });
  return () => {
    disposed = true; sequence++;
    window.clearInterval(timer);
    document.removeEventListener('visibilitychange', refresh);
    root.removeEventListener('input', onInput); root.removeEventListener('click', onClick); root.removeEventListener('submit', onSubmit);
  };
}
