export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday

export interface PlannedBreak {
  startOffsetMin: number; // minutes after session start
  durationMin: number;
}

export interface StudySchedule {
  id: string;
  label: string;
  days: Weekday[];
  startMinute: number; // minutes from midnight
  endMinute: number;
  breaks: PlannedBreak[];
  enabled: boolean;
}

export interface FocusPlan {
  blockedPackages: string[];
  schedules: StudySchedule[];
  strictMode: boolean;
}

export interface AppInfo {
  package: string;
  label: string;
}

export interface Status {
  active: boolean;
  onBreak: boolean;
  remainingMin: number;
  source: 'manual' | 'schedule' | 'none';
}
