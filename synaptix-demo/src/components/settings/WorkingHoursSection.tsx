import { CalendarPlus } from 'lucide-react';
import { useId, useState } from 'react';
import type { Weekday, WorkingHours } from '@/domain/types';
import { WEEKDAY_LABELS, formatDateTime } from '@/domain/calendar';
import { useDemo } from '@/lib/store';
import { selectClinicOpen, selectNextOpening } from '@/state/selectors';
import { cn } from '@/lib/cn';
import { Dot } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

const WEEKDAYS: Weekday[] = [1, 2, 3, 4, 5, 6, 0];
const WEEKDAY_FULL: Record<Weekday, string> = { 0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday' };
const DEFAULT_SPAN = { open: '10:00', close: '19:00' };

/** "Thu 24 Sep" from "2026-09-24". */
function holidayDate(date: string): string {
  return formatDateTime(`${date}T00:00:00`).split(' · ')[0];
}

export function WorkingHoursSection() {
  const { state, dispatch } = useDemo();
  const hours = state.settings.workingHours;
  const open = selectClinicOpen(state);
  const next = selectNextOpening(state);
  const ids = useId();
  const [newDate, setNewDate] = useState('');
  const [newLabel, setNewLabel] = useState('');

  const commit = (patch: Partial<WorkingHours>) => dispatch({ type: 'SET_WORKING_HOURS', workingHours: { ...hours, ...patch } });

  const setDay = (wd: Weekday, span: { open: string; close: string } | null) => commit({ byWeekday: { ...hours.byWeekday, [wd]: span } });

  const setTime = (wd: Weekday, key: 'open' | 'close', value: string) => {
    const span = hours.byWeekday[wd];
    if (!span || !value) return; // ignore cleared inputs; the day stays as it was
    setDay(wd, { ...span, [key]: value });
  };

  const holidayExists = hours.holidays.some((h) => h.date === newDate);
  const canAddHoliday = /^\d{4}-\d{2}-\d{2}$/.test(newDate) && !holidayExists;
  const addHoliday = () => {
    if (!canAddHoliday) return;
    const holidays = [...hours.holidays, { date: newDate, label: newLabel.trim() || 'Clinic closed' }].sort((a, b) => a.date.localeCompare(b.date));
    commit({ holidays });
    setNewDate('');
    setNewLabel('');
  };

  return (
    <section className="st-panel" aria-labelledby={`${ids}-title`} data-testid="settings-hours">
      <div className="st-panel__head">
        <div>
          <h2 className="st-panel__title" id={`${ids}-title`}>
            Working hours
          </h2>
          <p className="st-panel__caption">Clinic time zone Asia/Seoul. Outside these hours the assistant queues conversations for staff.</p>
        </div>
      </div>

      <div className="st-status" data-testid="hours-status">
        <span>
          Clinic time now: <strong>{formatDateTime(state.clock)}</strong>
        </span>
        <span className="sep">·</span>
        <span className={cn('st-status__state', open && 'is-open')}>
          <Dot tone={open ? 'success' : 'neutral'} />
          {open ? 'Open' : 'Closed'}
        </span>
        <span className="sep">·</span>
        <span>
          Next opening <strong>{formatDateTime(next.at)}</strong>
          {next.skipped.length > 0 ? ` (skips ${next.skipped.length} closed day${next.skipped.length === 1 ? '' : 's'})` : ''}
        </span>
      </div>

      <div className="st-panel__body st-panel__body--flush">
        <table className="st-hours">
          <thead>
            <tr>
              <th scope="col">Day</th>
              <th scope="col">Open</th>
              <th scope="col">Hours</th>
            </tr>
          </thead>
          <tbody>
            {WEEKDAYS.map((wd) => {
              const span = hours.byWeekday[wd];
              const switchId = `${ids}-open-${wd}`;
              return (
                <tr key={wd} data-testid="hours-row" data-weekday={wd} data-closed={span ? 'false' : 'true'}>
                  <td className="st-hours__day">
                    <label htmlFor={switchId}>{WEEKDAY_FULL[wd]}</label>
                    <small>{WEEKDAY_LABELS[wd]}</small>
                  </td>
                  <td className="st-hours__open">
                    <Switch id={switchId} checked={!!span} aria-label={`${WEEKDAY_FULL[wd]} open`} data-testid="hours-open-switch" onCheckedChange={(checked) => setDay(wd, checked ? (span ?? DEFAULT_SPAN) : null)} />
                  </td>
                  <td>
                    {span ? (
                      <span className="st-hours__times">
                        <input type="time" className="st-time" aria-label={`${WEEKDAY_FULL[wd]} opening time`} data-testid="hours-open-time" value={span.open} step={300} onChange={(e) => setTime(wd, 'open', e.target.value)} />
                        <span className="sep">–</span>
                        <input type="time" className="st-time" aria-label={`${WEEKDAY_FULL[wd]} closing time`} data-testid="hours-close-time" value={span.close} step={300} onChange={(e) => setTime(wd, 'close', e.target.value)} />
                      </span>
                    ) : (
                      <span className="st-hours__closed">Closed</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="st-panel__head" style={{ borderTop: '1px solid var(--border)' }}>
          <div>
            <h3 className="st-panel__title">Holidays</h3>
            <p className="st-panel__caption">Closed all day regardless of weekday. Public holidays are seeded; add clinic-specific closures below.</p>
          </div>
        </div>
        <ul className="st-hol" aria-label="Holidays">
          {hours.holidays.map((h) => (
            <li key={h.date} className="st-hol__row" data-testid="holiday-row" data-date={h.date}>
              <span className="st-hol__date">{h.date}</span>
              <span className="st-hol__label">
                {holidayDate(h.date)} · {h.label}
              </span>
            </li>
          ))}
        </ul>
        <form
          className="st-hol__add"
          onSubmit={(e) => {
            e.preventDefault();
            addHoliday();
          }}
        >
          <div className="field field--date">
            <label className="field__label" htmlFor={`${ids}-hol-date`}>
              Date
            </label>
            <input id={`${ids}-hol-date`} type="date" className="st-time st-date" data-testid="holiday-date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
          </div>
          <div className="field">
            <label className="field__label" htmlFor={`${ids}-hol-label`}>
              Label
            </label>
            <Input id={`${ids}-hol-label`} data-testid="holiday-label" placeholder="e.g. Staff training day" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />
          </div>
          <Button type="submit" variant="secondary" data-testid="btn-add-holiday" disabled={!canAddHoliday}>
            <CalendarPlus />
            Add
          </Button>
          {holidayExists ? <span className="field__hint">That date is already listed.</span> : null}
        </form>
      </div>
    </section>
  );
}
