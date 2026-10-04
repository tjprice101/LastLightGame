import { type Profile, type ProfileStorage, loadProfile, saveStarter } from './profile';
import { type StarterId } from '../content/starters';

export type Screen = 'title' | 'selection' | 'menu';

export class Journey {
  screen: Screen = 'title';
  profile: Profile | null = null;
  selected: StarterId | null = null;

  enter(storage: ProfileStorage): void {
    if (this.screen !== 'title') return;
    const profile = loadProfile(storage);
    this.profile = profile;
    this.screen = profile ? 'menu' : 'selection';
  }

  select(id: StarterId): void {
    if (this.screen !== 'selection') throw new Error('Starter selection is not open.');
    this.selected = id;
  }

  confirm(storage: ProfileStorage): void {
    if (this.screen !== 'selection' || !this.selected) {
      throw new Error('Select a companion before beginning.');
    }
    this.profile = saveStarter(storage, this.selected);
    this.screen = 'menu';
  }
}
