import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface UIState {
  saveRecovery: boolean;
  showSaveRecovery: () => void;
  resetOpening: () => void;
}

export const useUIStore = create<UIState>()(immer(set => ({
  saveRecovery: false,
  showSaveRecovery: () => set(state => { state.saveRecovery = true; }),
  resetOpening: () => set(state => { state.saveRecovery = false; }),
})));
