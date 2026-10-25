import { NativeModules } from 'react-native';
import { AppInfo, FocusPlan, JournalEntry, JournalReminder, Status, Task } from '../types';

const N = NativeModules.FocusModule;

export const DEFAULT_PLAN: FocusPlan = { blockedPackages: [], schedules: [], strictMode: true };

export const FocusLock = {
  savePlan: (p: FocusPlan): Promise<void> => N.savePlan(JSON.stringify(p)),
  loadPlan: async (): Promise<FocusPlan> => ({ ...DEFAULT_PLAN, ...JSON.parse(await N.loadPlan()) }),
  startManualSession: (min: number): Promise<void> => N.startManualSession(min),
  getStatus: (): Promise<Status> => N.getStatus(),
  getInstalledApps: (): Promise<AppInfo[]> => N.getInstalledApps(),
  isAccessibilityEnabled: (): Promise<boolean> => N.isAccessibilityEnabled(),
  openAccessibilitySettings: () => N.openAccessibilitySettings(),
  isAdminActive: (): Promise<boolean> => N.isAdminActive(),
  requestAdmin: () => N.requestAdmin(),
  isBatteryExempt: (): Promise<boolean> => N.isBatteryExempt(),
  requestBatteryExemption: () => N.requestBatteryExemption(),
  startService: () => N.startService(),
  saveTasks: (t: Task[]): Promise<void> => N.saveTasks(JSON.stringify(t)),
  loadTasks: async (): Promise<Task[]> => {
    try { const r = await N.getItem('tasks'); return r ? JSON.parse(r) : []; } catch { return []; }
  },
  loadJournal: async (): Promise<Record<string, JournalEntry>> => {
    try { const r = await N.getItem('journal'); return r ? JSON.parse(r) : {}; } catch { return {}; }
  },
  saveJournal: (j: Record<string, JournalEntry>): Promise<void> => N.setItem('journal', JSON.stringify(j)),
  getJournalReminder: async (): Promise<JournalReminder> => {
    try { const r = await N.getItem('journal_reminder'); return r ? JSON.parse(r) : { enabled: true, minute: 1260 }; }
    catch { return { enabled: true, minute: 1260 }; }
  },
  setJournalReminder: (enabled: boolean, minute: number): Promise<void> => N.setJournalReminder(enabled, minute),
  getStats: async (): Promise<Record<string, number>> => JSON.parse(await N.getStats()),
};
