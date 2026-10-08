import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { gameConfirm, gameDialogPending, escapeDialogText } from './game-dialog';

afterEach(() => vi.unstubAllGlobals());

function dialogFixture() {
  const focus = vi.fn();
  class Element {
    isConnected = true;
    focus = focus;
  }
  class Dialog extends EventTarget {
    open = false;
    returnValue = '';
    innerHTML = '';
    className = '';
    remove = vi.fn();
    setAttribute = vi.fn();
    showModal = vi.fn(() => { this.open = true; });
    close() { this.open = false; this.dispatchEvent(new Event('close')); }
  }
  const dialog = new Dialog();
  vi.stubGlobal('HTMLElement', Element);
  vi.stubGlobal('document', { activeElement: new Element(), createElement: () => dialog, body: { append: vi.fn() } });
  return { dialog, focus };
}

describe('in-game confirmation foundation', () => {
  it('waits for an explicit confirmation, blocks duplicate dialogs and cleans up with focus restoration', async () => {
    const { dialog, focus } = dialogFixture();
    const pending = gameConfirm('Spend 10 <tokens>?', { title: 'Draw', confirmLabel: 'Summon' });
    expect(gameDialogPending()).toBe(true);
    expect(dialog.open).toBe(true);
    expect(dialog.innerHTML).toContain('Spend 10 &lt;tokens&gt;?');
    expect(dialog.innerHTML).toContain('value="cancel" autofocus');
    expect(await gameConfirm('Duplicate')).toBe(false);
    dialog.returnValue = 'confirm';
    dialog.close();
    expect(await pending).toBe(true);
    expect(gameDialogPending()).toBe(false);
    expect(dialog.remove).toHaveBeenCalledOnce();
    expect(focus).toHaveBeenCalledOnce();
  });
  it('treats Escape or a dismissed dialog as cancellation without retaining the lock', async () => {
    const { dialog } = dialogFixture();
    const pending = gameConfirm('Delete?', { danger: true });
    dialog.returnValue = 'confirm';
    dialog.dispatchEvent(new Event('cancel'));
    dialog.close();
    expect(await pending).toBe(false);
    expect(gameDialogPending()).toBe(false);
    const second = gameConfirm('Retry');
    dialog.returnValue = '';
    dialog.close();
    expect(await second).toBe(false);
  });
  it('surfaces opening failure and releases the pending state', async () => {
    const { dialog } = dialogFixture();
    dialog.showModal.mockImplementation(() => { throw new Error('Dialog failed'); });
    await expect(gameConfirm('Test')).rejects.toThrow('Dialog failed');
    expect(gameDialogPending()).toBe(false);
    expect(dialog.remove).toHaveBeenCalledOnce();
    expect(escapeDialogText(`"'&<>`)).toBe('&quot;&#39;&amp;&lt;&gt;');
  });
  it('handles Escape explicitly without relying on browser default dialog behavior', async () => {
    const { dialog } = dialogFixture();
    const pending = gameConfirm('Test');
    const key = new Event('keydown', { cancelable: true });
    Object.defineProperty(key, 'key', { value: 'Escape' });
    dialog.dispatchEvent(key);
    expect(await pending).toBe(false);
    expect(key.defaultPrevented).toBe(true);
    expect(gameDialogPending()).toBe(false);
  });
  it('forbids browser/OS notification APIs in runtime source, including future screens', () => {
    const root = join(process.cwd(), 'src');
    const files = (directory: string): string[] => readdirSync(directory, { withFileTypes: true })
      .flatMap((entry) => entry.isDirectory() ? files(join(directory, entry.name))
        : entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts') ? [join(directory, entry.name)] : []);
    for (const file of files(root)) {
      const source = readFileSync(file, 'utf8');
      expect(source, file).not.toMatch(/(?:window\.|globalThis\.)(?:alert|confirm|prompt)\s*\(/);
      expect(source, file).not.toMatch(/(?<![\w.])(?:alert|prompt)\s*\(/);
      if (!file.endsWith(`${join('game', 'flow.ts')}`)) expect(source, file).not.toMatch(/(?<![\w.])confirm\s*\(/);
      expect(source, file).not.toMatch(/\bNotification\b|\.showNotification\s*\(/);
    }
  });
});
