import { type Profile, type ProfileStorage, loadProfile, saveStarter } from './profile';
import { isAvailableStarter, type StarterId } from '../content/starters';

export type Screen = 'title' | 'selection' | 'menu';

export class Journey {
  screen: Screen = 'title';
  profile: Profile | null = null;
  selected: StarterId | null = null;

  enter(storage: ProfileStorage): void {
    if (this.screen !== 'title') return;
    const profile = loadProfile(storage);
    this.profile = profile;
    this.screen = profile && isAvailableStarter(profile.starterId) ? 'menu' : 'selection';
  }

  select(id: StarterId): void {
    if (this.screen !== 'selection') throw new Error('Starter selection is not open.');
    if (!isAvailableStarter(id)) throw new Error('Choose an available Element-Bearer.');
    this.selected = id;
  }

  confirm(storage: ProfileStorage): void {
    if (this.screen !== 'selection' || !this.selected) {
      throw new Error('Select an Element-Bearer before beginning.');
    }
    if (!isAvailableStarter(this.selected)) throw new Error('This Element-Bearer is not available.');
    this.profile = saveStarter(storage, this.selected);
    this.screen = 'menu';
  }
}
