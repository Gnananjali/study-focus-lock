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

export interface Task {
  id: string;
  title: string;
  startAt?: number; // epoch ms
  endAt?: number;   // epoch ms
  done: boolean;
  createdAt: number;
}

export interface JournalEntry {
  text: string;
  mood: number; // 1-5
  updatedAt: number;
}

export interface JournalReminder {
  enabled: boolean;
  minute: number; // minutes from midnight
}
