import { create } from 'zustand';
import { Task } from '../types';
import { FocusLock } from '../native/FocusLock';

interface State {
  tasks: Task[];
  load: () => Promise<void>;
  add: (t: Pick<Task, 'title' | 'startAt' | 'endAt'>) => void;
  toggle: (id: string) => void;
  remove: (id: string) => void;
}

export const useTasks = create<State>((set, get) => {
  const commit = (tasks: Task[]) => {
    set({ tasks });
    FocusLock.saveTasks(tasks).catch(() => {});
  };
  return {
    tasks: [],
    load: async () => set({ tasks: await FocusLock.loadTasks() }),
    add: t => commit([...get().tasks, { ...t, id: String(Date.now()), done: false, createdAt: Date.now() }]),
    toggle: id => commit(get().tasks.map(x => (x.id === id ? { ...x, done: !x.done } : x))),
    remove: id => commit(get().tasks.filter(x => x.id !== id)),
  };
});
