import type { CleanseChoice } from '../game/native-kits';
import { createGameDialog } from './game-dialog';

export function createCleanseChoicePicker(): {
  result: Promise<CleanseChoice | null>; cancel: () => void;
} {
  const { dialog, dispose } = createGameDialog('Choose a status to remove');
  dialog.innerHTML = `<h2>Choose a status to remove</h2><p>Remove one application from the selected ally. The other status remains.</p>
    <form method="dialog" class="game-dialog-actions"><button value="cancel" autofocus>Cancel</button>
    <button value="burn">Remove Burn</button><button value="weaken">Remove Weaken</button></form>`;
  let finish: (choice: CleanseChoice | null) => void = () => {};
  const result = new Promise<CleanseChoice | null>(resolve => {
    let settled = false;
    finish = choice => {
      if (settled) return;
      settled = true;
      dispose();
      resolve(choice);
    };
    dialog.addEventListener('submit', event => {
      event.preventDefault();
      const value = event.submitter instanceof HTMLButtonElement ? event.submitter.value : '';
      if (value === 'burn' || value === 'weaken') finish(value);
      else finish(null);
    });
    dialog.addEventListener('cancel', event => { event.preventDefault(); finish(null); });
    dialog.addEventListener('close', () => finish(null));
    dialog.addEventListener('click', event => { if (event.target === dialog) finish(null); });
  });
  try { dialog.showModal(); } catch (error) { finish(null); throw error; }
  return { result, cancel: () => finish(null) };
}
