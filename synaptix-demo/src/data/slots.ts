/**
 * Consultation slots on the clinic calendar (ids = local ISO minute).
 * `2026-09-18T15:00` is taken by Emily Carter's existing appointment MD-24811.
 */
import type { ClinicSlot } from '../domain/types.ts';

const DURATION_MIN = 30;

/** [id, room] — rooms are illustrative labels only. */
const SLOT_SPEC: Array<[id: string, room: 1 | 2]> = [
  // Thu 17 Sep
  ['2026-09-17T11:00', 1],
  ['2026-09-17T14:00', 1],
  ['2026-09-17T16:30', 2],
  // Fri 18 Sep
  ['2026-09-18T11:00', 1],
  ['2026-09-18T15:00', 2], // taken: MD-24811
  ['2026-09-18T17:00', 1],
  // Sat 19 Sep
  ['2026-09-19T11:00', 1],
  ['2026-09-19T13:00', 2],
  // Mon 21 Sep
  ['2026-09-21T11:00', 1],
  ['2026-09-21T14:00', 2],
  ['2026-09-21T16:00', 1],
  // Tue 22 Sep
  ['2026-09-22T11:00', 1],
  ['2026-09-22T14:00', 2],
  // Tue 29 Sep (after Chuseok)
  ['2026-09-29T11:00', 1],
  ['2026-09-29T14:00', 2],
];

const UNAVAILABLE = new Set<string>(['2026-09-18T15:00']);

export const SLOT_LIST: ClinicSlot[] = SLOT_SPEC.map(([id, room]) => ({
  id,
  startsAt: `${id}:00`,
  durationMin: DURATION_MIN,
  room: `Consultation room ${room}`,
  available: !UNAVAILABLE.has(id),
}));

export const SLOTS: Record<string, ClinicSlot> = Object.fromEntries(SLOT_LIST.map((s) => [s.id, s]));
