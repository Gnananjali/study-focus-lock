import { create } from 'zustand';
import { JournalEntry } from '../types';
import { FocusLock } from '../native/FocusLock';

interface State {
  entries: Record<string, JournalEntry>;
  load: () => Promise<void>;
  save: (date: string, text: string, mood: number) => Promise<void>;
}

export const useJournal = create<State>((set, get) => ({
  entries: {},
  load: async () => set({ entries: await FocusLock.loadJournal() }),
  save: async (date, text, mood) => {
    const entries = { ...get().entries, [date]: { text, mood, updatedAt: Date.now() } };
    await FocusLock.saveJournal(entries);
    set({ entries });
  },
}));
