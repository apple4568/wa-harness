import type { Scenario, ScenarioId } from '../domain/types.ts';
import { afterHours } from './after-hours.ts';
import { bookingUncertainty } from './booking-uncertainty.ts';
import { humanTakeover } from './human-takeover.ts';
import { inquiryToBooking } from './inquiry-to-booking.ts';
import { managerApprovedPhoto } from './manager-approved-photo.ts';
import { rescheduleCancel } from './reschedule-cancel.ts';

/** Presentation order (matches the brief). */
export const SCENARIO_LIST: Scenario[] = [
  inquiryToBooking,
  humanTakeover,
  afterHours,
  rescheduleCancel,
  managerApprovedPhoto,
  bookingUncertainty,
];

export const SCENARIOS: Record<ScenarioId, Scenario> = {
  'inquiry-to-booking': inquiryToBooking,
  'human-takeover': humanTakeover,
  'after-hours': afterHours,
  'reschedule-cancel': rescheduleCancel,
  'manager-approved-photo': managerApprovedPhoto,
  'booking-uncertainty': bookingUncertainty,
};

export { validateScenario } from './validate.ts';
export { AFTER_HOURS_CLOCK, NEXT_OPENING } from './after-hours.ts';
