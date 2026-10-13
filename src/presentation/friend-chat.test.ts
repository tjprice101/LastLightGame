// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { bindFriendChat, chatShell, type ChatUiState, type ChatView, type ChatCommand } from './friend-chat';
import { GameOperationError } from '../online/server-game';

const members = [
  { userId: 'me', username: 'self', displayName: 'Player', icon: 'neutral', frame: 'default' },
  { userId: 'friend', username: 'friend', displayName: 'A friend', icon: 'profile:tide:base', frame: 'default' },
];
const view: ChatView = {
  selfUserId: 'me', conversations: [{ id: 'one', kind: 'direct', name: 'A friend', ownerId: null, members, unread: 1, pinned: false, muted: false }],
  messages: [{ id: 'first', senderId: 'friend', text: '<img src=x onerror=alert(1)>', createdAt: '2026-10-11T00:00:00Z' }],
  hasMore: false, invitations: [], blocked: [],
};
const flush = async () => { await new Promise(resolve => setTimeout(resolve, 0)); };

describe('friend chat presentation', () => {
  let dispose: (() => void) | undefined;
  afterEach(() => { dispose?.(); dispose = undefined; document.body.innerHTML = ''; vi.restoreAllMocks(); });
  const setup = () => {
    document.body.innerHTML = chatShell();
    return { state: { selected: 'one', query: '', drafts: new Map() } satisfies ChatUiState, host: document.body };
  };
  it('escapes message content, preserves composer while refreshing and ignores responses after disposal', async () => {
    const { host, state } = setup();
    const transport = vi.fn(async () => ({ view }));
    dispose = bindFriendChat(host, state, () => members.slice(1), transport, vi.fn());
    await flush();
    expect(host.querySelector('.chat-message p')!.textContent).toBe(view.messages[0].text);
    expect(host.querySelector('.chat-message p img')).toBeNull();
    const draft = host.querySelector<HTMLTextAreaElement>('[data-chat-draft]')!;
    draft.value = 'Unsent draft';
    draft.dispatchEvent(new Event('input', { bubbles: true }));
    host.querySelector<HTMLButtonElement>('[data-chat-action="refresh"]')!.click();
    await flush();
    expect(host.querySelector('[data-chat-draft]')).toBe(draft);
    expect(draft.value).toBe('Unsent draft');
    expect(state.drafts.get('one')).toBe('Unsent draft');
    dispose();
    host.innerHTML = '<p>Other page</p>';
    await flush();
    expect(host.textContent).toBe('Other page');
  });
  it('retries an ambiguous send with the same ID, shows no optimistic message and prevents double submit', async () => {
    const { host, state } = setup();
    let attempts = 0;
    const transport = vi.fn(async (command: ChatCommand, _requestId: string) => {
      if (command.kind === 'send' && ++attempts === 1) throw new Error('Network connection interrupted');
      return { view: command.kind === 'send' ? { ...view, messages: [...view.messages, { id: 'saved', senderId: 'me', text: command.text, createdAt: '2026-10-11T00:01:00Z' }] } : view };
    });
    const report = vi.fn();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    dispose = bindFriendChat(host, state, () => members.slice(1), transport, report);
    await flush();
    const draft = host.querySelector<HTMLTextAreaElement>('[data-chat-draft]')!;
    draft.value = 'A real message'; draft.dispatchEvent(new Event('input', { bubbles: true }));
    const form = host.querySelector('form')!;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await flush();
    expect(attempts).toBe(1);
    expect(host.querySelectorAll('.chat-message')).toHaveLength(1);
    expect(draft.value).toBe('A real message');
    expect(report).toHaveBeenCalledOnce();
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await flush();
    const sends = transport.mock.calls.filter(([command]) => command.kind === 'send');
    expect(sends).toHaveLength(2);
    expect(transport.mock.calls[1][1]).toBe(transport.mock.calls[2][1]);
    expect(host.querySelectorAll('.chat-message')).toHaveLength(2);
    expect(draft.value).toBe('');
  });
  it('retries group creation without creating a second request and keeps selected friends explicit', async () => {
    const { host, state } = setup();
    HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
    HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); this.dispatchEvent(new Event('close')); };
    vi.spyOn(console, 'error').mockImplementation(() => {});
    let attempts = 0;
    const transport = vi.fn(async (command: ChatCommand, _id: string) => {
      if (command.kind === 'createGroup' && ++attempts === 1) throw new Error('Connection lost');
      return { view };
    });
    dispose = bindFriendChat(host, state, () => members.slice(1), transport, vi.fn());
    await flush();
    host.querySelector<HTMLButtonElement>('[data-chat-action="new-group"]')!.click();
    const dialog = document.querySelector('dialog')!;
    dialog.querySelector<HTMLInputElement>('input[name="name"]')!.value = 'Rose group';
    dialog.querySelector<HTMLInputElement>('input[name="friends"]')!.checked = true;
    dialog.querySelector('form')!.dispatchEvent(new SubmitEvent('submit', {
      bubbles: true, cancelable: true, submitter: dialog.querySelector<HTMLButtonElement>('button[value="choose"]')!,
    }));
    await flush();
    expect(transport.mock.calls[1][0]).toEqual({ kind: 'createGroup', name: 'Rose group', userIds: ['friend'] });
    host.querySelector<HTMLButtonElement>('[data-chat-action="retry"]')!.click();
    await flush();
    expect(attempts).toBe(2);
    expect(transport.mock.calls[1][1]).toBe(transport.mock.calls[2][1]);
    expect(host.querySelector<HTMLButtonElement>('[data-chat-action="retry"]')!.hidden).toBe(true);
  });
  it('releases a definitively rejected send for correction and filters muted unread totals', async () => {
    const { host, state } = setup();
    host.insertAdjacentHTML('afterbegin', '<span data-chat-unread></span>');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const transport = vi.fn(async (command: ChatCommand) => {
      if (command.kind === 'send') throw new GameOperationError('Player is unavailable', 400);
      return { view: { ...view, conversations: [{ ...view.conversations[0], muted: true }] } };
    });
    dispose = bindFriendChat(host, state, () => members.slice(1), transport, vi.fn());
    await flush();
    expect(host.querySelector('[data-chat-unread]')!.textContent).toBe('0');
    const draft = host.querySelector<HTMLTextAreaElement>('[data-chat-draft]')!;
    draft.value = 'Message'; draft.dispatchEvent(new Event('input', { bubbles: true }));
    host.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await flush();
    expect(draft.readOnly).toBe(false);
    expect(draft.value).toBe('Message');
  });
  it('retains earlier pages across polling without falsely reopening exhausted pagination', async () => {
    const { host, state } = setup();
    const earlier = { id: 'older', senderId: 'friend', text: 'Earlier text', createdAt: '2026-10-10T00:00:00Z' };
    const transport = vi.fn(async (command: ChatCommand) => ({
      view: command.kind === 'read' && command.before
        ? { ...view, messages: [earlier], hasMore: false }
        : { ...view, hasMore: true },
    }));
    dispose = bindFriendChat(host, state, () => members.slice(1), transport, vi.fn());
    await flush();
    host.querySelector<HTMLButtonElement>('[data-chat-action="older"]')!.click();
    await flush();
    expect(host.querySelectorAll('.chat-message')).toHaveLength(2);
    expect(host.querySelector('[data-chat-action="older"]')).toBeNull();
    host.querySelector<HTMLButtonElement>('[data-chat-action="refresh"]')!.click();
    await flush();
    expect(host.querySelectorAll('.chat-message')).toHaveLength(2);
    expect(host.querySelector('[data-chat-action="older"]')).toBeNull();
  });
});
