import type { ElementId } from '../content/activities';
import type { BattleState } from '../game/battle';
import type { ProfileStorage } from '../game/profile';
import { storyEncounter } from '../content/story';

export type MusicTrack = 'main-theme' | ElementId;
export const MUSIC_KEY = 'last-light.music';
export interface MusicPreferences { volume: number; muted: boolean }
export const defaultMusicPreferences: MusicPreferences = { volume: 35, muted: false };

export function validateMusicPreferences(value: unknown): MusicPreferences {
  if (typeof value !== 'object' || value === null || !('volume' in value) || !('muted' in value) ||
    typeof value.volume !== 'number' || !Number.isInteger(value.volume) || value.volume < 0 || value.volume > 100 ||
    typeof value.muted !== 'boolean') throw new Error('Music settings must contain a volume from 0 to 100 and a mute choice.');
  return { volume: value.volume, muted: value.muted };
}

export function loadMusicPreferences(storage: ProfileStorage): MusicPreferences {
  const raw = storage.getItem(MUSIC_KEY);
  return raw === null ? { ...defaultMusicPreferences } : validateMusicPreferences(JSON.parse(raw));
}

export function saveMusicPreferences(storage: ProfileStorage, value: MusicPreferences): void {
  storage.setItem(MUSIC_KEY, JSON.stringify(validateMusicPreferences(value)));
}

export function battleMusic(state: Pick<BattleState, 'story' | 'dungeon' | 'infusion' | 'war'>): MusicTrack | null {
  if (state.story) return storyEncounter(state.story.storyStage).element;
  if (state.dungeon) return state.dungeon.element;
  return null;
}

export function musicUrl(track: MusicTrack): string {
  return `${import.meta.env.BASE_URL}assets/music/${track}.mp3`;
}

export const musicCrossfadeDuration = 1600;
interface MusicDeck {
  audio: HTMLAudioElement;
  track: MusicTrack | null;
  gain: number;
  pending: boolean;
  failed: boolean;
  revision: number;
}

export class BackgroundMusic {
  private track: MusicTrack | null = null;
  private unlocked = false;
  private disposed = false;
  private preferences: MusicPreferences = { ...defaultMusicPreferences };
  private decks: MusicDeck[];
  private current: MusicDeck | null = null;
  private outgoing: MusicDeck | null = null;
  private fadeTimer: ReturnType<typeof setInterval> | undefined;

  constructor(audio: HTMLAudioElement, private doc: Document, private report: (message: string) => void,
    secondAudio: HTMLAudioElement = doc.createElement('audio')) {
    this.decks = [audio, secondAudio].map((player) => {
      player.loop = true;
      player.preload = 'none';
      player.volume = 0;
      player.addEventListener('error', this.onError);
      return { audio: player, track: null, gain: 0, pending: false, failed: false, revision: 0 };
    });
    doc.addEventListener('pointerdown', this.onGesture, true);
    doc.addEventListener('click', this.onGesture, true);
    doc.addEventListener('keydown', this.onGesture, true);
    doc.addEventListener('visibilitychange', this.onVisibility);
  }

  setTrack(track: MusicTrack | null): void {
    if (this.disposed || track === this.track) return;
    this.stopFade();
    const audible = [this.current, this.outgoing].find((deck) => deck && !deck.audio.paused && deck.gain > 0) ?? null;
    for (const deck of this.decks) if (deck !== audible) this.clearDeck(deck);
    this.outgoing = audible;
    this.current = null;
    this.track = track;
    if (track) {
      const deck = this.decks.find((candidate) => candidate !== audible);
      if (!deck) throw new Error('Music playback deck is missing.');
      this.current = deck;
      deck.track = track;
      deck.gain = audible ? 0 : 1;
      deck.audio.src = musicUrl(track);
      this.applyVolume(deck);
      deck.audio.load();
    }
    if (!this.canPlay()) this.finishFade();
    else if (this.current) this.play();
    else this.startFade();
  }

  configure(value: MusicPreferences): void {
    this.preferences = validateMusicPreferences(value);
    for (const deck of this.decks) this.applyVolume(deck);
    if (value.muted || value.volume === 0) this.pause();
    else this.play();
  }

  private applyVolume(deck: MusicDeck): void {
    deck.audio.volume = deck.gain * this.preferences.volume / 100;
    deck.audio.muted = this.preferences.muted;
  }

  private canPlay(): boolean {
    return !this.disposed && this.unlocked && !this.doc.hidden &&
      !this.preferences.muted && this.preferences.volume > 0;
  }

  private clearDeck(deck: MusicDeck): void {
    deck.revision++;
    deck.pending = false;
    deck.failed = false;
    deck.gain = 0;
    deck.track = null;
    deck.audio.pause();
    if (deck.audio.hasAttribute('src')) {
      deck.audio.removeAttribute('src');
      deck.audio.load();
    }
    this.applyVolume(deck);
  }

  private stopFade(): void {
    clearInterval(this.fadeTimer);
    this.fadeTimer = undefined;
  }

  private finishFade(): void {
    this.stopFade();
    if (this.outgoing) this.clearDeck(this.outgoing);
    this.outgoing = null;
    if (this.current) {
      this.current.gain = 1;
      this.applyVolume(this.current);
    }
  }

  private startFade(): void {
    if (!this.outgoing || this.fadeTimer !== undefined) return;
    const outgoing = this.outgoing;
    const incoming = this.current;
    const initialGain = outgoing.gain;
    const start = Date.now();
    this.fadeTimer = setInterval(() => {
      const progress = Math.min(1, (Date.now() - start) / musicCrossfadeDuration);
      outgoing.gain = initialGain * (1 - progress);
      this.applyVolume(outgoing);
      if (incoming) {
        incoming.gain = progress;
        this.applyVolume(incoming);
      }
      if (progress === 1) this.finishFade();
    }, 20);
  }

  private pause(): void {
    this.finishFade();
    for (const deck of this.decks) {
      deck.revision++;
      deck.pending = false;
      deck.audio.pause();
    }
  }

  private failDeck(deck: MusicDeck): void {
    deck.failed = true;
    deck.pending = false;
    deck.audio.pause();
    if (deck === this.current && this.outgoing) {
      this.stopFade();
      deck.gain = 0;
      this.outgoing.gain = 1;
      this.applyVolume(deck);
      this.applyVolume(this.outgoing);
    } else if (deck === this.outgoing) {
      this.finishFade();
    }
  }

  private play(): void {
    const deck = this.current;
    if (!this.canPlay() || !deck || deck.failed || deck.pending || !deck.audio.paused) return;
    const revision = deck.revision;
    deck.pending = true;
    void deck.audio.play().then(() => {
      if (this.disposed || revision !== deck.revision || deck !== this.current) return;
      this.startFade();
    }).catch((error: unknown) => {
      if (this.disposed || revision !== deck.revision || deck !== this.current) return;
      if (typeof error === 'object' && error !== null && 'name' in error && error.name === 'NotAllowedError') {
        this.unlocked = false;
        this.pause();
        return;
      }
      this.failDeck(deck);
      console.error('Background music playback failed', error);
      this.report('Music could not play. Use another interaction to retry, or mute music in Settings.');
    }).finally(() => {
      if (revision === deck.revision) deck.pending = false;
    });
  }

  private onGesture = (): void => {
    this.unlocked = true;
    if (this.current?.failed) {
      this.current.failed = false;
      this.current.audio.load();
    }
    this.play();
  };

  private onVisibility = (): void => {
    if (this.doc.hidden) this.pause();
    else this.play();
  };

  private onError = (event: Event): void => {
    const deck = this.decks.find((candidate) => candidate.audio === event.currentTarget);
    if (!deck?.track || this.disposed) return;
    this.failDeck(deck);
    console.error('Background music asset failed', deck.track, deck.audio.error);
    this.report(`Music could not load (${deck.track}). Check your connection or mute music in Settings.`);
  };

  dispose(): void {
    this.disposed = true;
    this.pause();
    for (const deck of this.decks) {
      this.clearDeck(deck);
      deck.audio.removeEventListener('error', this.onError);
    }
    this.doc.removeEventListener('pointerdown', this.onGesture, true);
    this.doc.removeEventListener('click', this.onGesture, true);
    this.doc.removeEventListener('keydown', this.onGesture, true);
    this.doc.removeEventListener('visibilitychange', this.onVisibility);
  }
}
