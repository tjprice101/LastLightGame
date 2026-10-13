import { canonicalProfilePicture, profilePictures, profilePictureUnlocked, isProfilePictureId } from '../content/profile-pictures';
import type { Account } from '../game/account';
import { getStarter } from '../content/starters';
import { profilePicture } from './profile-picture';
import { createGameDialog, escapeDialogText } from './game-dialog';
import './profile-picture-browser.css';

function lockedPicture(id: string): string {
  return `<span class="picture-locked-art">${profilePicture(id)}<span class="picture-lock" aria-hidden="true">Locked</span></span>`;
}

export async function chooseProfilePicture(account: Account, current: string): Promise<string | null> {
  const inUse = canonicalProfilePicture(current);
  let selected = inUse;
  const unlocked = profilePictures.filter(picture => profilePictureUnlocked(account, picture.id)).length;
  const { dialog, dispose } = createGameDialog('Profile pictures');
  const title = (name: string, character: string) => name.endsWith(`, ${character}`) ? name.slice(0, -character.length - 2) : name;
  const percent = Math.round((unlocked + 1) / 33 * 100);
  dialog.classList.add('profile-picture-dialog');
  dialog.innerHTML = `<form method="dialog" class="picture-back-bar"><button value="cancel">← Back to profile</button><span>Profile <span aria-hidden="true">›</span> <strong>Profile pictures</strong></span></form>
    <div class="profile-picture-browser"><section class="picture-catalog" aria-label="Picture collection">
    <header><div class="picture-progress" style="--picture-progress:${percent}%" role="progressbar" aria-label="Profile pictures unlocked" aria-valuenow="${unlocked + 1}" aria-valuemin="0" aria-valuemax="33"><span>${percent}%</span></div><div><h2>Profile pictures</h2><p>${unlocked + 1} of 33 unlocked <span>· ${unlocked} of 32 character pictures</span></p></div></header>
    <div class="picture-tools"><label><span class="picture-sr-only">Search pictures</span><input type="search" data-picture-search placeholder="Search by name or character"></label><nav aria-label="Picture filters"><button type="button" data-picture-filter="all" aria-pressed="true">All</button><button type="button" data-picture-filter="unlocked" aria-pressed="false">Unlocked</button><button type="button" data-picture-filter="locked" aria-pressed="false">Locked</button></nav></div>
    <nav class="picture-categories" aria-label="Picture categories">${[['all', 'All', unlocked + 1, 33], ['default', 'Default', 1, 1], ['characters', 'Characters', unlocked, 32], ['base', 'Acquisition', profilePictures.filter(p => p.form === 'base' && profilePictureUnlocked(account, p.id)).length, 16], ['omnic', 'Omnic', profilePictures.filter(p => p.form === 'omnic' && profilePictureUnlocked(account, p.id)).length, 16]].map(([id, label, count, total]) => `<button type="button" data-picture-category="${id}" aria-pressed="${id === 'all'}">${label} <span>${count}/${total}</span></button>`).join('')}</nav>
    <p class="picture-showing" data-picture-showing></p><div class="picture-collection">
    <section data-picture-group="default"><h3>Default <span>1 / 1</span></h3><div class="picture-grid"><button type="button" data-picture="neutral" data-picture-category-id="default" aria-pressed="${selected === 'neutral'}"><span class="picture-tile-art">${profilePicture('neutral')}<span class="picture-selected-mark" aria-hidden="true">✓</span></span><b>Last Light</b><small>Default · Available to everyone</small></button></div></section>
    <section data-picture-group="characters"><h3>Characters <span>${unlocked} / 32</span></h3><div class="picture-grid">${profilePictures.map(picture => {
      const available = profilePictureUnlocked(account, picture.id);
      const character = getStarter(picture.characterId).name;
      return `<button type="button" data-picture="${picture.id}" data-picture-category-id="${picture.form}" data-picture-name="${escapeDialogText(`${picture.name} ${picture.form === 'base' ? 'Acquisition Base Common' : 'Omnic'}`.toLowerCase())}" data-unlocked="${available}" aria-label="${escapeDialogText(picture.name)} · ${available ? 'Unlocked' : 'Locked'}" aria-pressed="${selected === picture.id}"><span class="picture-tile-art">${available ? profilePicture(picture.id) : lockedPicture(picture.id)}<span class="picture-selected-mark" aria-hidden="true">✓</span></span><b>${escapeDialogText(title(picture.name, character))}</b><small>${picture.form === 'base' ? 'Common' : 'Omnic'} · ${escapeDialogText(character)}</small></button>`;
    }).join('')}</div></section><p data-picture-empty hidden>No matching pictures.</p></div></section>
    <aside class="picture-preview"><div class="picture-preview-content" aria-live="polite"></div><form method="dialog" class="picture-preview-actions"><button value="use" data-dialog-value="use">Use this picture</button><button value="cancel">← Back to profile</button></form></aside></div>`;
  try {
      let filter = 'all';
      let category = 'all';
      const refresh = () => {
        const query = dialog.querySelector<HTMLInputElement>('[data-picture-search]')!.value.trim().toLowerCase();
        dialog.querySelectorAll<HTMLElement>('[data-picture]').forEach(button => {
          const available = button.dataset.unlocked !== 'false';
          const matchesCategory = category === 'all' || category === button.dataset.pictureCategoryId ||
            category === 'characters' && button.dataset.picture !== 'neutral';
          button.hidden = !matchesCategory || !(button.dataset.pictureName ?? 'last light default').includes(query) || filter === 'locked' && available || filter === 'unlocked' && !available;
          button.setAttribute('aria-pressed', String(button.dataset.picture === selected));
        });
        dialog.querySelectorAll<HTMLElement>('[data-picture-group]').forEach(group => {
          group.hidden = !group.querySelector('[data-picture]:not([hidden])');
        });
        const visible = dialog.querySelectorAll('[data-picture]:not([hidden])').length;
        dialog.querySelector<HTMLElement>('[data-picture-showing]')!.textContent = `Showing ${visible} of 33 pictures`;
        const picture = profilePictures.find(entry => entry.id === selected);
        const available = selected === 'neutral' || isProfilePictureId(selected) && profilePictureUnlocked(account, selected);
        const character = picture ? getStarter(picture.characterId).name : '';
        dialog.querySelector('.picture-preview-content')!.innerHTML = `<div class="picture-preview-hero"><div class="picture-preview-navigation"><button type="button" data-picture-step="-1" aria-label="Previous picture" ${visible < 2 ? 'disabled' : ''}>‹</button><div class="picture-preview-art">${available ? profilePicture(selected) : lockedPicture(selected)}</div><button type="button" data-picture-step="1" aria-label="Next picture" ${visible < 2 ? 'disabled' : ''}>›</button></div><h3>${escapeDialogText(picture ? title(picture.name, character) : 'Last Light')}</h3>${character ? `<p>${escapeDialogText(character)}</p>` : ''}<div class="picture-badges"><span>${picture?.form === 'omnic' ? 'Omnic' : picture ? 'Common' : 'Default'}</span>${picture ? `<span>${picture.form === 'base' ? 'Acquisition' : 'Final evolution'}</span>` : ''}${selected === inUse ? '<span class="picture-in-use">In use</span>' : ''}</div></div>
          <div class="picture-preview-detail"><div class="picture-requirement"><small>${available ? '✓ Unlocked' : 'Locked'}</small><p>${escapeDialogText(picture?.requirement ?? 'Available to every player.')}</p></div><div class="picture-use-previews">${['Profile', 'Chat', 'Friends'].map(label => `<div><small>${label}</small><span class="picture-use-example"><span class="picture-use-avatar">${available ? profilePicture(selected) : lockedPicture(selected)}</span><span><b>${label === 'Chat' ? 'Your messages' : label === 'Friends' ? 'Your friend card' : 'Your profile'}</b><small>${label === 'Chat' ? 'Message appearance' : 'Picture appearance'}</small></span></span></div>`).join('')}</div></div>`;
        const use = dialog.querySelector<HTMLButtonElement>('[data-dialog-value="use"]')!;
        use.disabled = !available || selected === inUse;
        use.textContent = selected === inUse ? 'Currently in use' : !available ? 'Picture locked' : 'Use this picture';
        dialog.querySelector<HTMLElement>('[data-picture-empty]')!.hidden = visible > 0;
      };
      dialog.addEventListener('input', refresh);
      dialog.addEventListener('click', event => {
        if (!(event.target instanceof Element)) return;
        const picture = event.target.closest<HTMLElement>('[data-picture]');
        const tab = event.target.closest<HTMLElement>('[data-picture-filter]');
        const categoryButton = event.target.closest<HTMLElement>('[data-picture-category]');
        const step = event.target.closest<HTMLElement>('[data-picture-step]');
        if (picture) selected = canonicalProfilePicture(picture.dataset.picture!);
        if (tab) {
          filter = tab.dataset.pictureFilter!;
          dialog.querySelectorAll('[data-picture-filter]').forEach(button => button.setAttribute('aria-pressed', String(button === tab)));
        }
        if (categoryButton) {
          category = categoryButton.dataset.pictureCategory!;
          dialog.querySelectorAll('[data-picture-category]').forEach(button => button.setAttribute('aria-pressed', String(button === categoryButton)));
        }
        if (step) {
          const visible = Array.from(dialog.querySelectorAll<HTMLElement>('[data-picture]:not([hidden])'));
          if (visible.length) {
            const index = visible.findIndex(button => button.dataset.picture === selected);
            const next = index < 0 ? Number(step.dataset.pictureStep) > 0 ? 0 : visible.length - 1 : (index + Number(step.dataset.pictureStep) + visible.length) % visible.length;
            selected = canonicalProfilePicture(visible[next].dataset.picture!);
          }
        }
        if (picture || tab || categoryButton || step) refresh();
        if (step) dialog.querySelector<HTMLButtonElement>(`[data-picture-step="${step.dataset.pictureStep}"]`)?.focus({ preventScroll: true });
      });
      refresh();
      return await new Promise<string | null>((resolve, reject) => {
        dialog.addEventListener('close', () => resolve(null), { once: true });
        dialog.addEventListener('submit', event => {
          event.preventDefault();
          const use = event.submitter instanceof HTMLButtonElement && event.submitter.value === 'use';
          if (use && selected !== 'neutral' && (!isProfilePictureId(selected) || !profilePictureUnlocked(account, selected))) {
            reject(new Error('This profile picture is locked.'));
            dialog.close();
            return;
          }
          resolve(use && selected !== inUse ? selected : null);
          dialog.close();
        });
        dialog.addEventListener('cancel', event => { event.preventDefault(); resolve(null); dialog.close(); });
        dialog.addEventListener('keydown', event => {
          if (event.key !== 'Escape') return;
          event.preventDefault();
          event.stopPropagation();
          resolve(null);
          dialog.close();
        });
        try { dialog.showModal(); } catch (error) { reject(error); }
      });
  } finally { dispose(); }
}
