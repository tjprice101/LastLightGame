import { createRoot, type Root } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { TitleScreen } from './title-screen';
import { PlayerInfoScreen, PlayerSaveData } from './player-save-data';
import { StarterSelection } from './starter-selection';
import '../styles/ui.css';

let titleRoot: Root | undefined;

export function unmountTitle(): void {
  titleRoot?.unmount();
  titleRoot = undefined;
}

export function mountTitle(host: HTMLElement, props: Parameters<typeof TitleScreen>[0]): void {
  unmountTitle();
  titleRoot = createRoot(host);
  flushSync(() => titleRoot!.render(<TitleScreen {...props} />));
}

export function mountPlayerInfo(host: HTMLElement, props: Parameters<typeof PlayerInfoScreen>[0]): void {
  unmountTitle();
  titleRoot = createRoot(host);
  flushSync(() => titleRoot!.render(<PlayerInfoScreen {...props} />));
}

export function mountStarterSelection(host: HTMLElement, props: Parameters<typeof StarterSelection>[0]): void {
  unmountTitle();
  titleRoot = createRoot(host);
  flushSync(() => titleRoot!.render(<StarterSelection {...props} />));
}

class PlayerSaveElement extends HTMLElement {
  private root: Root | undefined;
  connectedCallback(): void {
    if (this.root) return;
    this.root = createRoot(this);
    this.classList.add('ll-ui');
    flushSync(() => this.root!.render(<PlayerSaveData
      onChanged={change => { this.dispatchEvent(new CustomEvent('offline-save-changed', { detail: change, bubbles: true })); }}
      onReady={() => { this.dispatchEvent(new CustomEvent('online-save-ready', { bubbles: true })); }}
      onAccount={() => { this.dispatchEvent(new CustomEvent('player-account-open', { bubbles: true })); }} />));
  }
  disconnectedCallback(): void {
    const root = this.root;
    queueMicrotask(() => {
      if (this.isConnected || this.root !== root) return;
      root?.unmount(); this.root = undefined;
    });
  }
}

if (!customElements.get('ll-player-save-data')) customElements.define('ll-player-save-data', PlayerSaveElement);
