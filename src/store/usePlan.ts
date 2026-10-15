import { create } from 'zustand';
import { Alert } from 'react-native';
import { FocusPlan } from '../types';
import { DEFAULT_PLAN, FocusLock } from '../native/FocusLock';

interface State {
  plan: FocusPlan;
  load: () => Promise<void>;
  update: (patch: Partial<FocusPlan>) => Promise<void>;
}

export const usePlan = create<State>((set, get) => ({
  plan: DEFAULT_PLAN,
  load: async () => set({ plan: await FocusLock.loadPlan() }),
  update: async patch => {
    const next = { ...get().plan, ...patch };
    try {
      await FocusLock.savePlan(next);
      set({ plan: next });
    } catch (e: any) {
      Alert.alert('Locked', e?.message ?? 'Could not save.');
    }
  },
}));
