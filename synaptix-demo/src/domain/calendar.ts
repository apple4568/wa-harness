/**
 * Clinic calendar helpers. All times are treated as clinic-local wall-clock time
 * (Asia/Seoul). ISO strings carry NO offset ("2026-09-15T10:20:00") so that the
 * demo behaves identically on any presenter machine.
 */
import type { Weekday, WorkingHours } from './types';

export interface LocalDateTime {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  hour: number;
  minute: number;
}

const pad = (n: number) => String(n).padStart(2, '0');

export function parseLocal(iso: string): LocalDateTime {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(iso);
  if (!m) throw new Error(`Invalid local ISO: ${iso}`);
  return { year: +m[1], month: +m[2], day: +m[3], hour: m[4] ? +m[4] : 0, minute: m[5] ? +m[5] : 0 };
}

export function toLocalIso(d: LocalDateTime): string {
  return `${d.year}-${pad(d.month)}-${pad(d.day)}T${pad(d.hour)}:${pad(d.minute)}:00`;
}

export function dateKey(iso: string): string {
  return iso.slice(0, 10);
}

/** Convert to a JS Date in UTC fields (used only for weekday math / arithmetic). */
function toUtcDate(d: LocalDateTime): Date {
  return new Date(Date.UTC(d.year, d.month - 1, d.day, d.hour, d.minute));
}

function fromUtcDate(date: Date): LocalDateTime {
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
  };
}

export function weekdayOf(iso: string): Weekday {
  return toUtcDate(parseLocal(iso)).getUTCDay() as Weekday;
}

export function addMinutes(iso: string, minutes: number): string {
  const d = toUtcDate(parseLocal(iso));
  d.setUTCMinutes(d.getUTCMinutes() + minutes);
  return toLocalIso(fromUtcDate(d));
}

export function addDays(iso: string, days: number): string {
  return addMinutes(iso, days * 24 * 60);
}

/** Minutes between two local ISO strings (b - a). */
export function diffMinutes(a: string, b: string): number {
  return Math.round((toUtcDate(parseLocal(b)).getTime() - toUtcDate(parseLocal(a)).getTime()) / 60000);
}

export function compareIso(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function isHoliday(iso: string, hours: WorkingHours): { date: string; label: string } | undefined {
  const key = dateKey(iso);
  return hours.holidays.find((h) => h.date === key);
}

/** Opening window for the calendar day containing `iso`, or null when closed that day. */
export function openingFor(iso: string, hours: WorkingHours): { open: string; close: string } | null {
  if (isHoliday(iso, hours)) return null;
  const wd = weekdayOf(iso);
  const span = hours.byWeekday[wd];
  if (!span) return null;
  const day = dateKey(iso);
  return { open: `${day}T${span.open}:00`, close: `${day}T${span.close}:00` };
}

export function isClinicOpen(iso: string, hours: WorkingHours): boolean {
  const win = openingFor(iso, hours);
  if (!win) return false;
  const t = parseLocal(iso);
  const minutes = t.hour * 60 + t.minute;
  const wd = weekdayOf(iso);
  const span = hours.byWeekday[wd]!;
  return minutes >= timeToMinutes(span.open) && minutes < timeToMinutes(span.close);
}

/**
 * Next opening strictly after `iso` (if currently open, returns the next day's opening).
 * Honours weekday closures and holidays; searches up to 60 days ahead.
 */
export function nextOpening(iso: string, hours: WorkingHours): { at: string; skipped: Array<{ date: string; reason: string }> } {
  const skipped: Array<{ date: string; reason: string }> = [];
  const start = parseLocal(iso);
  const startMinutes = start.hour * 60 + start.minute;

  for (let i = 0; i < 60; i++) {
    const dayIso = addDays(toLocalIso({ ...start, hour: 0, minute: 0 }), i);
    const hol = isHoliday(dayIso, hours);
    const wd = weekdayOf(dayIso);
    const span = hours.byWeekday[wd];
    if (hol) {
      skipped.push({ date: dateKey(dayIso), reason: hol.label });
      continue;
    }
    if (!span) {
      skipped.push({ date: dateKey(dayIso), reason: 'Closed' });
      continue;
    }
    if (i === 0 && startMinutes >= timeToMinutes(span.open)) {
      // Today's opening already passed (or we're inside it) — look at the next day.
      continue;
    }
    return { at: `${dateKey(dayIso)}T${span.open}:00`, skipped };
  }
  throw new Error('No opening found within 60 days');
}

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  0: 'Sun',
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
};

export const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "Tue 15 Sep · 10:20" */
export function formatDateTime(iso: string): string {
  const d = parseLocal(iso);
  return `${WEEKDAY_LABELS[weekdayOf(iso)]} ${d.day} ${MONTH_LABELS[d.month - 1]} · ${pad(d.hour)}:${pad(d.minute)}`;
}

/** "10:20" */
export function formatTime(iso: string): string {
  const d = parseLocal(iso);
  return `${pad(d.hour)}:${pad(d.minute)}`;
}

/** "Tue 15 Sep" */
export function formatDate(iso: string): string {
  const d = parseLocal(iso);
  return `${WEEKDAY_LABELS[weekdayOf(iso)]} ${d.day} ${MONTH_LABELS[d.month - 1]}`;
}

/** Relative label for the inbox list given the simulated clock: "10:20", "Yesterday", "Mon". */
export function formatRelative(iso: string, clock: string): string {
  if (dateKey(iso) === dateKey(clock)) return formatTime(iso);
  const days = Math.floor(diffMinutes(`${dateKey(iso)}T00:00`, `${dateKey(clock)}T00:00`) / (24 * 60));
  if (days === 1) return 'Yesterday';
  if (days < 7) return WEEKDAY_LABELS[weekdayOf(iso)];
  const d = parseLocal(iso);
  return `${d.day} ${MONTH_LABELS[d.month - 1]}`;
}
