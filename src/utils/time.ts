export const minToStr = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

export const strToMin = (s: string): number | null => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const h = +m[1], mi = +m[2];
  return h < 24 && mi < 60 ? h * 60 + mi : null;
};

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

import type { StudySchedule } from '../types';

export const dateKey = (d: Date = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const addDays = (n: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return dateKey(d);
};

export const prettyDate = (k: string | null): string => {
  if (!k) return 'No due date';
  if (k === dateKey()) return 'Today';
  if (k === addDays(1)) return 'Tomorrow';
  return k;
};

export interface NextSession { schedule: StudySchedule; dayOffset: number; }

/** Next (or currently running) enabled session within the coming 7 days. */
export const nextSession = (schedules: StudySchedule[], now: Date = new Date()): NextSession | null => {
  const nowMin = now.getHours() * 60 + now.getMinutes();
  let best: { s: StudySchedule; off: number; when: number } | null = null;
  for (const s of schedules) {
    if (!s.enabled) continue;
    for (let off = 0; off < 7; off++) {
      const dow = (now.getDay() + off) % 7;
      if (!s.days.includes(dow as any)) continue;
      if (off === 0 && nowMin >= s.endMinute) continue;
      const when = off * 1440 + s.startMinute;
      if (!best || when < best.when) best = { s, off, when };
      break;
    }
  }
  return best ? { schedule: best.s, dayOffset: best.off } : null;
};

export const dayLabel = (off: number) => (off === 0 ? 'Today' : off === 1 ? 'Tomorrow' : DAY_NAMES[(new Date().getDay() + off) % 7]);

export const dayStartMs = (offsetDays: number) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return d.getTime();
};

export const fmtWhen = (ms: number) => {
  const d = new Date(ms);
  const diff = Math.round((new Date(ms).setHours(0, 0, 0, 0) - dayStartMs(0)) / 86400000);
  return `${diff >= 0 && diff < 7 ? dayLabel(diff) : dateKey(d)} ${minToStr(d.getHours() * 60 + d.getMinutes())}`;
};
