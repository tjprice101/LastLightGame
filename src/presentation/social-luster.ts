import { lusterSheen, staggerIn } from './luster';

/*
 * Social and profile entrance (UI audit session 5, D-465). Panels cascade in once per arrival at a
 * Social view: Player info, Friends, Chats or a friend's profile. Re-renders of the same view (presence
 * refresh, saved profile edits, wallet refresh) never replay it. The profile picture glints once on
 * arrival at Player info. Static under Reduce motion (luster.ts). Presentation only.
 */

const panelSelector = [
  '.online-profile-panel', '.profile-metric', '.profile-story', '.profile-collection', '.profile-account',
  '.ref-profile-right > section', '.ref-profile-social:not([hidden]) .profile-friends-list',
  '.ref-profile-social:not([hidden]) .profile-friends-sidebar > section', '.friend-chat-layout > :is(section, aside)',
].join(', ');

let shownView: string | null = null;

function socialView(screen: HTMLElement): string {
  if (screen.dataset.friendProfile) return `friend:${screen.dataset.friendProfile}`;
  if (screen.classList.contains('profile-chat-layout')) return 'chats';
  return screen.querySelector<HTMLElement>('[data-profile-tab][aria-pressed="true"]')?.dataset.profileTab ?? 'info';
}

export function animateSocial(host: ParentNode): () => void {
  const screen = host.querySelector<HTMLElement>('.ref-profile');
  if (!screen) {
    shownView = null;
    return () => {};
  }
  const view = socialView(screen);
  if (view === shownView) return () => {};
  shownView = view;
  const stops = [staggerIn(screen, panelSelector, { stepMs: 35, maxSteps: 10, durationMs: 340 })];
  const avatar = screen.querySelector<HTMLElement>('.profile-main-avatar');
  if (avatar && view === 'info') stops.push(lusterSheen(avatar, 1100));
  return () => stops.forEach(stop => stop());
}

/** Test seam: forget which Social view was last shown. */
export function resetSocialEntrance(): void {
  shownView = null;
}

/** Profile picture browser: tiles cascade in when the dialog opens. */
export function animatePictureBrowser(dialog: HTMLElement): () => void {
  const collection = dialog.querySelector<HTMLElement>('.picture-collection');
  return collection ? staggerIn(collection, '[data-picture]:not([hidden])', { stepMs: 30, maxSteps: 12, durationMs: 320 }) : () => {};
}

/** Profile picture browser: the preview glints when the player picks a different picture (not on filter changes). */
export function glintPicturePreview(dialog: HTMLElement): () => void {
  const art = dialog.querySelector<HTMLElement>('.picture-preview-art');
  return art ? lusterSheen(art, 800) : () => {};
}
