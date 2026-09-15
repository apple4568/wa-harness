import type { ClinicSlot, DemoState } from '@/domain/types';

/** Next `count` available slots after the simulated clock, excluding `excludeSlotId`. */
export function nextAvailableSlots(state: DemoState, count = 3, excludeSlotId?: string): ClinicSlot[] {
  return Object.values(state.slots)
    .filter((s) => s.available && s.startsAt > state.clock && s.id !== excludeSlotId)
    .sort((a, b) => (a.startsAt < b.startsAt ? -1 : a.startsAt > b.startsAt ? 1 : 0))
    .slice(0, count);
}

/** Deterministic, unique CRM request id for a conversation: `req-<conv>-<seq>` (suffixed if taken). */
export function nextRequestId(state: DemoState, conversationId: string): string {
  const base = `req-${conversationId}-${state.seq}`;
  if (!state.crm.requests[base]) return base;
  let n = 2;
  while (state.crm.requests[`${base}-${n}`]) n += 1;
  return `${base}-${n}`;
}
