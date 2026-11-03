import type { Account } from '../game/account';
import { chapterOneTitle, storyCodexEntries } from '../content/story-codex';
import { escapeDialogText as escape } from './game-dialog';
import './story-codex.css';

export function storyCodex(account: Account | null): string {
  if (!account) return '<p role="alert">Story Codex progress unavailable. Resolve the save error to read your discoveries.</p>';
  const completed = account.storyCompleted ?? 0;
  const unlocked = storyCodexEntries.filter(entry => entry.stage <= completed);
  return `<section class="story-codex" aria-label="Story Codex">
    <header><p class="eyebrow">Story Codex · ${unlocked.length} / ${storyCodexEntries.length} entries</p><h3>${chapterOneTitle}</h3>
    <p>Restore the beacons to uncover the story. Read unlocked entries anytime; existing clears count.</p></header>
    <ol class="story-codex-entries">${storyCodexEntries.map((entry, index) => entry.stage <= completed
      ? `<li><details data-story-codex-entry="${entry.id}"><summary><span class="story-codex-number" aria-hidden="true">${index + 1}</span><span>${escape(entry.title)}<small>${entry.stage ? `Stage ${entry.stage} cleared` : 'Opening prologue'}</small></span></summary><div class="story-codex-copy">${entry.paragraphs.map(text => `<p>${escape(text)}</p>`).join('')}</div></details></li>`
      : `<li class="story-codex-locked"><span class="story-codex-number" aria-hidden="true">${index + 1}</span><span>Undiscovered entry<small>Clear Chapter 1 stage ${entry.stage} to unlock</small></span></li>`).join('')}</ol>
    </section>`;
}
