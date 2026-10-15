import { NativeModules } from 'react-native';
import { AppInfo, FocusPlan, Status } from '../types';

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
  getStats: async (): Promise<Record<string, number>> => JSON.parse(await N.getStats()),
};
