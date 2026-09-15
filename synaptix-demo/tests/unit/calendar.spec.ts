import { test, expect } from '@playwright/test';
import type { WorkingHours } from '@/domain/types';
import {
  addDays,
  addMinutes,
  diffMinutes,
  formatDateTime,
  formatRelative,
  isClinicOpen,
  nextOpening,
  openingFor,
  weekdayOf,
} from '@/domain/calendar';

/** Hours exactly as fixed in docs/DEMO_BRIEF.md (the seed must match these too). */
const HOURS: WorkingHours = {
  timeZone: 'Asia/Seoul',
  byWeekday: {
    0: null,
    1: { open: '10:00', close: '19:00' },
    2: { open: '10:00', close: '19:00' },
    3: { open: '10:00', close: '19:00' },
    4: { open: '10:00', close: '19:00' },
    5: { open: '10:00', close: '19:00' },
    6: { open: '10:00', close: '15:00' },
  },
  holidays: [
    { date: '2026-09-24', label: 'Chuseok' },
    { date: '2026-09-25', label: 'Chuseok' },
    { date: '2026-09-26', label: 'Chuseok' },
    { date: '2026-10-03', label: 'National Foundation Day' },
    { date: '2026-10-09', label: 'Hangul Day' },
  ],
};

test.describe('calendar', () => {
  test('weekday and arithmetic helpers', () => {
    expect(weekdayOf('2026-09-15T10:20:00')).toBe(2); // Tuesday
    expect(weekdayOf('2026-09-20')).toBe(0); // Sunday
    expect(addMinutes('2026-09-15T23:50:00', 20)).toBe('2026-09-16T00:10:00');
    expect(addDays('2026-09-30T10:00:00', 1)).toBe('2026-10-01T10:00:00');
    expect(diffMinutes('2026-09-15T10:00:00', '2026-09-15T11:30:00')).toBe(90);
  });

  test('isClinicOpen honours weekday hours, Saturday hours, Sunday and holidays', () => {
    expect(isClinicOpen('2026-09-15T10:20:00', HOURS)).toBe(true); // Tue, reset clock
    expect(isClinicOpen('2026-09-15T09:59:00', HOURS)).toBe(false);
    expect(isClinicOpen('2026-09-15T19:00:00', HOURS)).toBe(false); // close is exclusive
    expect(isClinicOpen('2026-09-19T14:59:00', HOURS)).toBe(true); // Sat before 15:00
    expect(isClinicOpen('2026-09-19T15:00:00', HOURS)).toBe(false); // Sat after 15:00
    expect(isClinicOpen('2026-09-20T12:00:00', HOURS)).toBe(false); // Sunday
    expect(isClinicOpen('2026-09-24T12:00:00', HOURS)).toBe(false); // Chuseok
    expect(isClinicOpen('2026-09-23T21:40:00', HOURS)).toBe(false); // after-hours scenario clock
    expect(openingFor('2026-09-19T08:00:00', HOURS)).toEqual({ open: '2026-09-19T10:00:00', close: '2026-09-19T15:00:00' });
    expect(openingFor('2026-09-20T08:00:00', HOURS)).toBeNull();
  });

  test('nextOpening skips Chuseok + Sunday from the after-hours clock', () => {
    const result = nextOpening('2026-09-23T21:40:00', HOURS);
    expect(result.at).toBe('2026-09-28T10:00:00');
    expect(result.skipped).toHaveLength(4);
    expect(result.skipped.map((s) => s.date)).toEqual(['2026-09-24', '2026-09-25', '2026-09-26', '2026-09-27']);
    expect(result.skipped.slice(0, 3).every((s) => s.reason === 'Chuseok')).toBe(true);
    expect(result.skipped[3].reason).toBe('Closed');
  });

  test('nextOpening from inside opening hours is the next day; before opening is today', () => {
    expect(nextOpening('2026-09-15T10:20:00', HOURS).at).toBe('2026-09-16T10:00:00');
    expect(nextOpening('2026-09-15T08:00:00', HOURS).at).toBe('2026-09-15T10:00:00');
    // Saturday evening → Monday (Sunday skipped)
    const sat = nextOpening('2026-09-19T16:00:00', HOURS);
    expect(sat.at).toBe('2026-09-21T10:00:00');
    expect(sat.skipped).toEqual([{ date: '2026-09-20', reason: 'Closed' }]);
  });

  test('formatting helpers', () => {
    expect(formatDateTime('2026-09-15T10:20:00')).toBe('Tue 15 Sep · 10:20');
    const clock = '2026-09-15T10:20:00';
    expect(formatRelative('2026-09-15T08:05:00', clock)).toBe('08:05');
    expect(formatRelative('2026-09-14T18:00:00', clock)).toBe('Yesterday');
    expect(formatRelative('2026-09-12T18:00:00', clock)).toBe('Sat');
    expect(formatRelative('2026-09-01T18:00:00', clock)).toBe('1 Sep');
  });
});
