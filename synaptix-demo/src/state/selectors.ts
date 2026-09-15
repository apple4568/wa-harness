/**
 * Cheap, memo-free selectors over DemoState. All of them are pure functions of the
 * state (and the arguments), safe to call during render.
 */
import type { Appointment, ClinicSlot, Conversation, CrmRequest, Customer, DemoState, KnowledgeItem, Message } from '@/domain/types';
import { isClinicOpen, nextOpening } from '@/domain/calendar';

export function selectCustomer(state: DemoState, conversationId: string | null | undefined): Customer | undefined {
  if (!conversationId) return undefined;
  const conv = state.conversations[conversationId];
  return conv ? state.customers[conv.customerId] : undefined;
}

export function selectConversation(state: DemoState, conversationId: string | null | undefined): Conversation | undefined {
  return conversationId ? state.conversations[conversationId] : undefined;
}

export function selectSelectedConversation(state: DemoState): Conversation | undefined {
  return selectConversation(state, state.selectedConversationId);
}

export function selectMessages(state: DemoState, conversationId: string | null | undefined): Message[] {
  if (!conversationId) return [];
  const order = state.messageOrder[conversationId] ?? [];
  const out: Message[] = [];
  for (const id of order) {
    const m = state.messages[id];
    if (m) out.push(m);
  }
  return out;
}

/** True when a conversation is waiting for a person (Needs human) or queued after hours. */
export function conversationNeedsHuman(conv: Conversation): boolean {
  return conv.ownership === 'needs_human' || conv.afterHoursQueued;
}

function matchesSearch(state: DemoState, conv: Conversation, needle: string): boolean {
  const customer = state.customers[conv.customerId];
  const haystacks: Array<string | undefined> = [customer?.name, customer?.readingKo, customer?.handle];
  // (an unidentified customer is still findable by handle)
  for (const h of haystacks) if (h && h.toLowerCase().includes(needle)) return true;
  for (const id of state.messageOrder[conv.id] ?? []) {
    const m = state.messages[id];
    if (!m) continue;
    if (m.text && m.text.toLowerCase().includes(needle)) return true;
    if (m.translationKo && m.translationKo.toLowerCase().includes(needle)) return true;
  }
  return false;
}

/** Inbox list: filtered by channel / needs-human / search, sorted by last activity (newest first). */
export function selectVisibleConversations(state: DemoState): Conversation[] {
  const { channel, needsHumanOnly, search } = state.filters;
  const needle = search.trim().toLowerCase();
  const list = Object.values(state.conversations).filter((conv) => {
    if (channel !== 'all' && conv.channel !== channel) return false;
    if (needsHumanOnly && !conversationNeedsHuman(conv)) return false;
    if (needle && !matchesSearch(state, conv, needle)) return false;
    return true;
  });
  list.sort((a, b) => (a.lastActivityAt < b.lastActivityAt ? 1 : a.lastActivityAt > b.lastActivityAt ? -1 : a.id.localeCompare(b.id)));
  return list;
}

export function selectKnowledgeList(state: DemoState): KnowledgeItem[] {
  const out: KnowledgeItem[] = [];
  for (const id of state.knowledgeOrder) {
    const item = state.knowledge[id];
    if (item) out.push(item);
  }
  return out;
}

export function selectApprovedKnowledge(state: DemoState): KnowledgeItem[] {
  return selectKnowledgeList(state).filter((k) => k.state === 'approved');
}

/** Approved photo items only — the only photos the assistant or staff may send. */
export function selectApprovedPhotos(state: DemoState): KnowledgeItem[] {
  return selectKnowledgeList(state).filter((k) => k.kind === 'photo' && k.state === 'approved');
}

export function selectUnreadNotificationCount(state: DemoState): number {
  let n = 0;
  for (const notification of state.notifications) if (!notification.read) n += 1;
  return n;
}

export function selectNeedsHumanCount(state: DemoState): number {
  let n = 0;
  for (const conv of Object.values(state.conversations)) if (conversationNeedsHuman(conv)) n += 1;
  return n;
}

export function selectClinicOpen(state: DemoState): boolean {
  return isClinicOpen(state.clock, state.settings.workingHours);
}

export function selectNextOpening(state: DemoState): { at: string; skipped: Array<{ date: string; reason: string }> } {
  return nextOpening(state.clock, state.settings.workingHours);
}

/** The live (non-cancelled) appointment for a conversation, preferring the one the booking flow points at. */
export function selectAppointmentForConversation(state: DemoState, conversationId: string | null | undefined): Appointment | undefined {
  if (!conversationId) return undefined;
  const conv = state.conversations[conversationId];
  if (!conv) return undefined;
  const linked = conv.booking.appointmentId ? state.crm.appointments[conv.booking.appointmentId] : undefined;
  if (linked && linked.conversationId === conversationId) return linked;
  let best: Appointment | undefined;
  for (const apt of Object.values(state.crm.appointments)) {
    if (apt.conversationId !== conversationId || apt.status === 'cancelled') continue;
    if (!best || apt.createdAt > best.createdAt) best = apt;
  }
  return best ?? linked;
}

export function selectPendingRequest(state: DemoState, conversationId: string | null | undefined): CrmRequest | undefined {
  if (!conversationId) return undefined;
  return Object.values(state.crm.requests).find((r) => r.conversationId === conversationId && r.status === 'pending');
}

/** The request the conversation's booking flow currently refers to (pending, timed out, or resolved). */
export function selectCurrentRequest(state: DemoState, conversationId: string | null | undefined): CrmRequest | undefined {
  if (!conversationId) return undefined;
  const conv = state.conversations[conversationId];
  return conv?.booking.requestId ? state.crm.requests[conv.booking.requestId] : undefined;
}

export function selectSlot(state: DemoState, slotId: string | null | undefined): ClinicSlot | undefined {
  return slotId ? state.slots[slotId] : undefined;
}

export function selectSlots(state: DemoState, slotIds: string[]): ClinicSlot[] {
  const out: ClinicSlot[] = [];
  for (const id of slotIds) {
    const s = state.slots[id];
    if (s) out.push(s);
  }
  return out;
}
