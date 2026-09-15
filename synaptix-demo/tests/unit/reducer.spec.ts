import { test, expect } from '@playwright/test';
import type { DemoAction, DemoState, Message } from '@/domain/types';
import { createInitialState } from '@/data/seed';
import { reducer } from '@/state/reducer';
import { selectApprovedPhotos, selectAppointmentForConversation, selectMessages, selectPendingRequest } from '@/state/selectors';

const CHIAYING = 'conv-line-chiaying';
const EMILY = 'conv-wa-emily';
const HINA = 'conv-ig-hina';
const STAFF = 'Kim Seo-yeon';

function run(state: DemoState, actions: DemoAction[]): DemoState {
  return actions.reduce(reducer, state);
}

function msg(conversationId: string, author: Message['author'], id: string, extra: Partial<Message> = {}): Message {
  return { id, conversationId, at: '2026-09-15T10:30:00', author, kind: 'text', text: `${author} ${id}`, delivery: 'delivered', ...extra };
}

function appointmentsFor(state: DemoState, conversationId: string) {
  return Object.values(state.crm.appointments).filter((a) => a.conversationId === conversationId);
}

/** Runs a fresh booking for Chia-ying up to `customer_confirmed` on Thu 17 Sep 14:00. */
function confirmedBooking(state: DemoState): DemoState {
  return run(state, [
    { type: 'OFFER_SLOTS', conversationId: CHIAYING, slotIds: ['2026-09-17T14:00', '2026-09-18T11:00'] },
    { type: 'SELECT_SLOT', conversationId: CHIAYING, slotId: '2026-09-17T14:00' },
    { type: 'CUSTOMER_CONFIRMED', conversationId: CHIAYING },
  ]);
}

test.describe('reducer · ownership', () => {
  test('ai → needs_human → human → ai transitions', () => {
    const s0 = createInitialState();
    expect(s0.conversations[CHIAYING].ownership).toBe('ai');

    const s1 = reducer(s0, {
      type: 'HANDOVER',
      conversationId: CHIAYING,
      summary: { reason: 'Individual skin assessment', points: ['Asked whether a treatment suits her skin'], at: s0.clock },
    });
    expect(s1.conversations[CHIAYING].ownership).toBe('needs_human');
    expect(s1.conversations[CHIAYING].handover?.reason).toBe('Individual skin assessment');
    expect(s0.conversations[CHIAYING].ownership).toBe('ai'); // immutability

    const s2 = reducer(s1, { type: 'TAKE_OVER', conversationId: CHIAYING, by: STAFF });
    expect(s2.conversations[CHIAYING].ownership).toBe('human');
    const lines = selectMessages(s2, CHIAYING);
    const last = lines[lines.length - 1];
    expect(last.author).toBe('system');
    expect(last.text).toContain(STAFF);
    expect(s2.seq).toBe(s0.seq + 1);

    const s3 = reducer(s2, { type: 'RETURN_TO_AI', conversationId: CHIAYING, by: STAFF });
    expect(s3.conversations[CHIAYING].ownership).toBe('ai');
    expect(s3.conversations[CHIAYING].handover).toBeUndefined();
    const lines3 = selectMessages(s3, CHIAYING);
    expect(lines3[lines3.length - 1].text).toContain('Returned to AI');
  });

  test('TAKE_OVER discards assistant activity and rejects later assistant messages', () => {
    const s0 = createInitialState();
    const s1 = reducer(s0, { type: 'SET_ASSISTANT_ACTIVITY', conversationId: CHIAYING, activity: { kind: 'composing', draftMessageId: 'draft-1' } });
    expect(s1.conversations[CHIAYING].assistant.kind).toBe('composing');
    const s2 = reducer(s1, { type: 'TAKE_OVER', conversationId: CHIAYING, by: STAFF });
    expect(s2.conversations[CHIAYING].assistant).toEqual({ kind: 'idle' });

    const s3 = reducer(s2, { type: 'ADD_MESSAGE', message: msg(CHIAYING, 'assistant', 'm-test-assistant') });
    expect(s3).toBe(s2);
    expect(s3.messages['m-test-assistant']).toBeUndefined();

    // Assistant activity cannot be set while a person owns the conversation either.
    const s4 = reducer(s3, { type: 'SET_ASSISTANT_ACTIVITY', conversationId: CHIAYING, activity: { kind: 'reading' } });
    expect(s4.conversations[CHIAYING].assistant).toEqual({ kind: 'idle' });

    // Staff can write; the customer can always write.
    const s5 = reducer(s4, { type: 'SEND_STAFF_MESSAGE', conversationId: CHIAYING, text: 'Hello from the front desk' });
    const staffLines = selectMessages(s5, CHIAYING).filter((m) => m.author === 'staff');
    expect(staffLines).toHaveLength(1);
    expect(staffLines[0].delivery).toBe('sending');
    expect(staffLines[0].at).toBe(s5.clock);
  });

  test('SEND_STAFF_MESSAGE is ignored unless ownership is human', () => {
    const s0 = createInitialState();
    const s1 = reducer(s0, { type: 'SEND_STAFF_MESSAGE', conversationId: CHIAYING, text: 'nope' });
    expect(s1).toBe(s0);
  });

  test('aiPaused rejects assistant messages but not customer or staff messages', () => {
    const s0 = reducer(createInitialState(), { type: 'SET_AI_PAUSED', paused: true });
    const s1 = reducer(s0, { type: 'ADD_MESSAGE', message: msg(CHIAYING, 'assistant', 'm-paused-assistant') });
    expect(s1).toBe(s0);
    const s2 = reducer(s1, { type: 'ADD_MESSAGE', message: msg(CHIAYING, 'customer', 'm-paused-customer') });
    expect(s2.messages['m-paused-customer']).toBeDefined();
    expect(s2.conversations[CHIAYING].unread).toBe(s0.conversations[CHIAYING].unread + 1);
  });

  test('customer messages do not bump unread when the conversation is selected in the inbox', () => {
    const s0 = run(createInitialState(), [
      { type: 'SET_VIEW', view: 'inbox' },
      { type: 'SELECT_CONVERSATION', conversationId: CHIAYING },
      { type: 'SET_CUSTOMER_TYPING', conversationId: CHIAYING, typing: true },
    ]);
    expect(s0.conversations[CHIAYING].unread).toBe(0);
    const s1 = reducer(s0, { type: 'ADD_MESSAGE', message: msg(CHIAYING, 'customer', 'm-selected-customer') });
    expect(s1.conversations[CHIAYING].unread).toBe(0);
    expect(s1.conversations[CHIAYING].customerTyping).toBe(false);
    expect(s1.conversations[CHIAYING].lastActivityAt).toBe('2026-09-15T10:30:00');
    const s2 = reducer(s1, { type: 'SET_VIEW', view: 'knowledge' });
    const s3 = reducer(s2, { type: 'ADD_MESSAGE', message: msg(CHIAYING, 'customer', 'm-selected-customer-2') });
    expect(s3.conversations[CHIAYING].unread).toBe(1);
  });

  test('ADD_MESSAGE for an unknown conversation is ignored', () => {
    const s0 = createInitialState();
    expect(reducer(s0, { type: 'ADD_MESSAGE', message: msg('conv-missing', 'customer', 'm-x') })).toBe(s0);
  });
});

test.describe('reducer · photos', () => {
  test('photo messages require an approved photo; history of sent photos survives withdrawal', () => {
    const s0 = reducer(createInitialState(), { type: 'SET_ROLE', role: 'manager' });
    // Approved photo → accepted.
    const s1 = reducer(s0, { type: 'ADD_MESSAGE', message: msg(CHIAYING, 'assistant', 'm-photo-ok', { kind: 'photo', photoId: 'ph-reception' }) });
    expect(s1.messages['m-photo-ok']).toBeDefined();
    // Draft photo → rejected.
    const s2 = reducer(s1, { type: 'ADD_MESSAGE', message: msg(CHIAYING, 'assistant', 'm-photo-draft', { kind: 'photo', photoId: 'ph-treatment-room' }) });
    expect(s2).toBe(s1);
    // Withdrawn photo → rejected.
    const s3 = reducer(s2, { type: 'ADD_MESSAGE', message: msg(CHIAYING, 'assistant', 'm-photo-withdrawn', { kind: 'photo', photoId: 'ph-lounge' }) });
    expect(s3).toBe(s2);
    // Unknown photo → rejected.
    const s4 = reducer(s3, { type: 'ADD_MESSAGE', message: msg(CHIAYING, 'assistant', 'm-photo-unknown', { kind: 'photo', photoId: 'ph-nope' }) });
    expect(s4).toBe(s3);

    // Withdraw the reception photo: earlier photo message remains, new ones are rejected.
    const s5 = reducer(s4, { type: 'WITHDRAW_KNOWLEDGE', knowledgeId: 'ph-reception', by: 'Park Ji-hoon' });
    expect(s5.knowledge['ph-reception'].state).toBe('withdrawn');
    expect(s5.messages['m-photo-ok']).toBeDefined();
    expect(selectMessages(s5, CHIAYING).some((m) => m.photoId === 'ph-reception')).toBe(true);
    const s6 = reducer(s5, { type: 'ADD_MESSAGE', message: msg(CHIAYING, 'assistant', 'm-photo-late', { kind: 'photo', photoId: 'ph-reception' }) });
    expect(s6).toBe(s5);

    // Staff photo send follows the same rule.
    const s7 = reducer(s6, { type: 'TAKE_OVER', conversationId: CHIAYING, by: STAFF });
    const s8 = reducer(s7, { type: 'SEND_STAFF_MESSAGE', conversationId: CHIAYING, text: 'Our treatment room', photoId: 'ph-treatment-room' });
    expect(s8).toBe(s7);
    const s9 = reducer(s8, { type: 'SEND_STAFF_MESSAGE', conversationId: CHIAYING, text: 'Our consultation room', photoId: 'ph-consultation-room' });
    const staffPhoto = selectMessages(s9, CHIAYING).find((m) => m.author === 'staff' && m.kind === 'photo');
    expect(staffPhoto?.photoId).toBe('ph-consultation-room');
  });
});

test.describe('reducer · booking', () => {
  test('SELECT_SLOT requires an offered, available slot; CUSTOMER_CONFIRMED requires a selection', () => {
    const s0 = reducer(createInitialState(), { type: 'OFFER_SLOTS', conversationId: CHIAYING, slotIds: ['2026-09-17T14:00'] });
    expect(s0.conversations[CHIAYING].booking.stage).toBe('slots_offered');
    expect(s0.conversations[CHIAYING].booking.intent).toBe('book');
    expect(reducer(s0, { type: 'CUSTOMER_CONFIRMED', conversationId: CHIAYING })).toBe(s0);
    expect(reducer(s0, { type: 'SELECT_SLOT', conversationId: CHIAYING, slotId: '2026-09-18T11:00' })).toBe(s0); // not offered
    expect(reducer(s0, { type: 'SELECT_SLOT', conversationId: CHIAYING, slotId: '2026-09-18T15:00' })).toBe(s0); // taken
    const s1 = reducer(s0, { type: 'SELECT_SLOT', conversationId: CHIAYING, slotId: '2026-09-17T14:00' });
    expect(s1.conversations[CHIAYING].booking.selectedSlotId).toBe('2026-09-17T14:00');
  });

  test('SUBMIT_BOOKING is idempotent per requestId and ignored while pending', () => {
    const s0 = confirmedBooking(createInitialState());
    expect(s0.conversations[CHIAYING].booking.stage).toBe('customer_confirmed');
    const s1 = reducer(s0, { type: 'SUBMIT_BOOKING', conversationId: CHIAYING, requestId: 'req-1', resolution: 'scripted' });
    expect(s1.conversations[CHIAYING].booking.stage).toBe('submitting');
    expect(s1.conversations[CHIAYING].booking.requestId).toBe('req-1');
    expect(s1.crm.requests['req-1']).toMatchObject({ status: 'pending', intent: 'book', slotId: '2026-09-17T14:00', resolution: 'scripted' });

    const s2 = reducer(s1, { type: 'SUBMIT_BOOKING', conversationId: CHIAYING, requestId: 'req-1' });
    expect(s2).toBe(s1);
    const s3 = reducer(s2, { type: 'SUBMIT_BOOKING', conversationId: CHIAYING, requestId: 'req-2' });
    expect(s3).toBe(s2);
    expect(Object.keys(s3.crm.requests).filter((id) => s3.crm.requests[id].conversationId === CHIAYING)).toEqual(['req-1']);
    expect(selectPendingRequest(s3, CHIAYING)?.id).toBe('req-1');

    // Not confirmed yet → ignored.
    const fresh = reducer(createInitialState(), { type: 'OFFER_SLOTS', conversationId: CHIAYING, slotIds: ['2026-09-17T14:00'] });
    expect(reducer(fresh, { type: 'SUBMIT_BOOKING', conversationId: CHIAYING, requestId: 'req-early' })).toBe(fresh);
  });

  test('CRM success creates exactly one appointment MD-24817 and takes the slot', () => {
    const s0 = run(confirmedBooking(createInitialState()), [
      { type: 'SUBMIT_BOOKING', conversationId: CHIAYING, requestId: 'req-1', resolution: 'scripted' },
    ]);
    const before = Object.keys(s0.crm.appointments).length;
    const s1 = reducer(s0, { type: 'CRM_RESULT', requestId: 'req-1', result: 'success' });
    expect(Object.keys(s1.crm.appointments).length).toBe(before + 1);
    const apt = selectAppointmentForConversation(s1, CHIAYING);
    expect(apt).toMatchObject({ id: 'apt-req-1', reference: 'MD-24817', slotId: '2026-09-17T14:00', status: 'confirmed', conversationId: CHIAYING });
    expect(apt?.history).toEqual([{ at: s1.clock, change: 'created', toSlotId: '2026-09-17T14:00' }]);
    expect(s1.crm.nextReferenceNumber).toBe(24818);
    expect(s1.slots['2026-09-17T14:00'].available).toBe(false);
    expect(s1.crm.requests['req-1']).toMatchObject({ status: 'success', resultAppointmentId: 'apt-req-1' });
    expect(s1.conversations[CHIAYING].booking).toMatchObject({ stage: 'crm_success', appointmentId: 'apt-req-1', requestId: 'req-1' });

    // A second CRM_RESULT for the same request is a no-op.
    expect(reducer(s1, { type: 'CRM_RESULT', requestId: 'req-1', result: 'success' })).toBe(s1);
  });

  test('SEND_BOOKING_CONFIRMATION + SET_DELIVERY flips stage to confirmation_sent', () => {
    const s0 = run(confirmedBooking(createInitialState()), [
      { type: 'SUBMIT_BOOKING', conversationId: CHIAYING, requestId: 'req-1', resolution: 'scripted' },
      { type: 'CRM_RESULT', requestId: 'req-1', result: 'success' },
    ]);
    const card = msg(CHIAYING, 'assistant', 'm-card', { kind: 'booking_card', appointmentId: 'apt-req-1', delivery: 'sending' });
    const s1 = reducer(s0, { type: 'SEND_BOOKING_CONFIRMATION', conversationId: CHIAYING, message: card });
    expect(s1.messages['m-card']).toBeDefined();
    expect(s1.conversations[CHIAYING].booking).toMatchObject({ stage: 'crm_success', confirmationMessageId: 'm-card', confirmationDelivery: 'sending' });

    const s2 = reducer(s1, { type: 'SET_DELIVERY', messageId: 'm-card', delivery: 'sent' });
    expect(s2.conversations[CHIAYING].booking).toMatchObject({ stage: 'crm_success', confirmationDelivery: 'sent' });
    const s3 = reducer(s2, { type: 'SET_DELIVERY', messageId: 'm-card', delivery: 'delivered' });
    expect(s3.messages['m-card'].delivery).toBe('delivered');
    expect(s3.conversations[CHIAYING].booking).toMatchObject({ stage: 'confirmation_sent', confirmationDelivery: 'delivered' });

    // A confirmation that is already delivered flips the stage immediately.
    const direct = reducer(s0, { type: 'SEND_BOOKING_CONFIRMATION', conversationId: CHIAYING, message: { ...card, id: 'm-card-2', delivery: 'delivered' } });
    expect(direct.conversations[CHIAYING].booking.stage).toBe('confirmation_sent');

    // The confirmation is an assistant message: rejected when ownership is not ai.
    const human = reducer(s0, { type: 'TAKE_OVER', conversationId: CHIAYING, by: STAFF });
    expect(reducer(human, { type: 'SEND_BOOKING_CONFIRMATION', conversationId: CHIAYING, message: card })).toBe(human);
  });

  test('reschedule mutates the same appointment (MD-24811)', () => {
    const s0 = createInitialState();
    const existing = selectAppointmentForConversation(s0, EMILY)!;
    expect(existing.reference).toBe('MD-24811');
    const count = Object.keys(s0.crm.appointments).length;

    const s1 = run(s0, [
      { type: 'START_CHANGE', conversationId: EMILY, appointmentId: existing.id, intent: 'reschedule' },
      { type: 'OFFER_SLOTS', conversationId: EMILY, slotIds: ['2026-09-21T14:00', '2026-09-21T16:00'] },
      { type: 'SELECT_SLOT', conversationId: EMILY, slotId: '2026-09-21T16:00' },
      { type: 'CUSTOMER_CONFIRMED', conversationId: EMILY },
      { type: 'SUBMIT_BOOKING', conversationId: EMILY, requestId: 'req-emily', resolution: 'scripted' },
    ]);
    expect(s1.conversations[EMILY].booking).toMatchObject({ intent: 'reschedule', stage: 'submitting', appointmentId: existing.id });
    expect(s1.crm.requests['req-emily']).toMatchObject({ intent: 'reschedule', appointmentId: existing.id, slotId: '2026-09-21T16:00' });

    const s2 = reducer(s1, { type: 'CRM_RESULT', requestId: 'req-emily', result: 'success' });
    expect(Object.keys(s2.crm.appointments).length).toBe(count);
    const moved = s2.crm.appointments[existing.id];
    expect(moved).toMatchObject({ id: existing.id, reference: 'MD-24811', slotId: '2026-09-21T16:00', status: 'rescheduled' });
    expect(moved.history[moved.history.length - 1]).toEqual({ at: s2.clock, change: 'rescheduled', fromSlotId: '2026-09-18T15:00', toSlotId: '2026-09-21T16:00' });
    expect(s2.slots['2026-09-18T15:00'].available).toBe(true);
    expect(s2.slots['2026-09-21T16:00'].available).toBe(false);
    expect(s2.crm.nextReferenceNumber).toBe(s0.crm.nextReferenceNumber);
    expect(s2.conversations[EMILY].booking).toMatchObject({ stage: 'crm_success', appointmentId: existing.id });
    expect(selectAppointmentForConversation(s2, EMILY)?.id).toBe(existing.id);
  });

  test('cancel marks the appointment cancelled and frees the slot', () => {
    const s0 = createInitialState();
    const existing = selectAppointmentForConversation(s0, EMILY)!;
    const count = Object.keys(s0.crm.appointments).length;
    const s1 = run(s0, [
      { type: 'START_CHANGE', conversationId: EMILY, appointmentId: existing.id, intent: 'cancel' },
      { type: 'CUSTOMER_CONFIRMED', conversationId: EMILY },
      { type: 'SUBMIT_BOOKING', conversationId: EMILY, requestId: 'req-cancel', resolution: 'scripted' },
      { type: 'CRM_RESULT', requestId: 'req-cancel', result: 'success' },
    ]);
    expect(Object.keys(s1.crm.appointments).length).toBe(count);
    expect(s1.crm.appointments[existing.id].status).toBe('cancelled');
    expect(s1.crm.appointments[existing.id].history[s1.crm.appointments[existing.id].history.length - 1].change).toBe('cancelled');
    expect(s1.slots['2026-09-18T15:00'].available).toBe(true);
    expect(s1.conversations[EMILY].booking.stage).toBe('crm_success');

    // Cancelling the flow afterwards drops the (now cancelled) appointment link.
    const s2 = reducer(s1, { type: 'CANCEL_BOOKING_FLOW', conversationId: EMILY });
    expect(s2.conversations[EMILY].booking).toMatchObject({ stage: 'idle', intent: 'book', offeredSlotIds: [] });
    expect(s2.conversations[EMILY].booking.appointmentId).toBeUndefined();
  });

  test('CANCEL_BOOKING_FLOW keeps a live appointment link', () => {
    const s0 = createInitialState();
    const existing = selectAppointmentForConversation(s0, EMILY)!;
    const s1 = run(s0, [
      { type: 'START_CHANGE', conversationId: EMILY, appointmentId: existing.id, intent: 'reschedule' },
      { type: 'OFFER_SLOTS', conversationId: EMILY, slotIds: ['2026-09-21T16:00'] },
      { type: 'CANCEL_BOOKING_FLOW', conversationId: EMILY },
    ]);
    expect(s1.conversations[EMILY].booking).toMatchObject({ stage: 'idle', appointmentId: existing.id, offeredSlotIds: [] });
    expect(s1.conversations[EMILY].booking.selectedSlotId).toBeUndefined();
  });

  test('timeout → needs_review with no appointment; reconcile was_created is idempotent', () => {
    const s0 = createInitialState();
    expect(s0.conversations[HINA].booking.stage).toBe('customer_confirmed');
    expect(appointmentsFor(s0, HINA)).toHaveLength(0);

    const s1 = run(s0, [
      { type: 'SUBMIT_BOOKING', conversationId: HINA, requestId: 'req-hina', resolution: 'scripted' },
      { type: 'CRM_RESULT', requestId: 'req-hina', result: 'timeout' },
    ]);
    expect(s1.crm.requests['req-hina'].status).toBe('timeout');
    expect(s1.conversations[HINA].booking).toMatchObject({ stage: 'needs_review', requestId: 'req-hina' });
    expect(appointmentsFor(s1, HINA)).toHaveLength(0);
    expect(s1.slots['2026-09-21T14:00'].available).toBe(true);

    // Reconcile: the CRM did create it → exactly one appointment, even when dispatched twice.
    const s2 = reducer(s1, { type: 'RECONCILE_BOOKING', requestId: 'req-hina', outcome: 'was_created' });
    const s3 = reducer(s2, { type: 'RECONCILE_BOOKING', requestId: 'req-hina', outcome: 'was_created' });
    expect(s3).toBe(s2);
    expect(appointmentsFor(s3, HINA)).toHaveLength(1);
    expect(appointmentsFor(s3, HINA)[0]).toMatchObject({ reference: 'MD-24817', slotId: '2026-09-21T14:00', status: 'confirmed' });
    expect(s3.crm.requests['req-hina']).toMatchObject({ status: 'reconciled', reconciledOutcome: 'was_created', resultAppointmentId: 'apt-req-hina' });
    expect(s3.conversations[HINA].booking).toMatchObject({ stage: 'crm_success', appointmentId: 'apt-req-hina' });
    expect(s3.slots['2026-09-21T14:00'].available).toBe(false);
  });

  test('reconcile not_created lets a resubmission with a new id succeed', () => {
    const s0 = run(createInitialState(), [
      { type: 'SUBMIT_BOOKING', conversationId: HINA, requestId: 'req-hina', resolution: 'scripted' },
      { type: 'CRM_RESULT', requestId: 'req-hina', result: 'timeout' },
      { type: 'RECONCILE_BOOKING', requestId: 'req-hina', outcome: 'not_created' },
    ]);
    expect(s0.crm.requests['req-hina']).toMatchObject({ status: 'reconciled', reconciledOutcome: 'not_created' });
    expect(s0.conversations[HINA].booking.stage).toBe('customer_confirmed');
    expect(s0.conversations[HINA].booking.requestId).toBeUndefined();
    expect(appointmentsFor(s0, HINA)).toHaveLength(0);

    // Same id again → ignored; a new id → pending, and a success creates exactly one appointment.
    expect(reducer(s0, { type: 'SUBMIT_BOOKING', conversationId: HINA, requestId: 'req-hina' })).toBe(s0);
    const s1 = reducer(s0, { type: 'SUBMIT_BOOKING', conversationId: HINA, requestId: 'req-hina-2', resolution: 'scripted' });
    expect(s1.crm.requests['req-hina-2'].status).toBe('pending');
    expect(s1.conversations[HINA].booking).toMatchObject({ stage: 'submitting', requestId: 'req-hina-2' });
    const s2 = reducer(s1, { type: 'CRM_RESULT', requestId: 'req-hina-2', result: 'success' });
    expect(appointmentsFor(s2, HINA)).toHaveLength(1);
    expect(appointmentsFor(s2, HINA)[0].reference).toBe('MD-24817');
    expect(s2.conversations[HINA].booking.stage).toBe('crm_success');
  });

  test('RECONCILE_BOOKING is ignored for requests that did not time out', () => {
    const s0 = run(confirmedBooking(createInitialState()), [
      { type: 'SUBMIT_BOOKING', conversationId: CHIAYING, requestId: 'req-1', resolution: 'scripted' },
    ]);
    expect(reducer(s0, { type: 'RECONCILE_BOOKING', requestId: 'req-1', outcome: 'was_created' })).toBe(s0);
    expect(reducer(s0, { type: 'RECONCILE_BOOKING', requestId: 'req-missing', outcome: 'not_created' })).toBe(s0);
  });
});

test.describe('reducer · knowledge', () => {
  test('APPROVE_KNOWLEDGE is ignored for staff and applied for the manager', () => {
    const s0 = createInitialState();
    expect(s0.role).toBe('staff');
    const staffTry = reducer(s0, { type: 'APPROVE_KNOWLEDGE', knowledgeId: 'ph-treatment-room', by: 'Kim Seo-yeon' });
    expect(staffTry).toBe(s0);
    expect(staffTry.knowledge['ph-treatment-room'].state).toBe('draft');

    const s1 = run(s0, [
      { type: 'SET_ROLE', role: 'manager' },
      { type: 'APPROVE_KNOWLEDGE', knowledgeId: 'ph-treatment-room', by: 'Park Ji-hoon' },
    ]);
    expect(s1.knowledge['ph-treatment-room']).toMatchObject({ state: 'approved', approvedBy: 'Park Ji-hoon', approvedAt: s1.clock });
    expect(selectApprovedPhotos(s1).map((k) => k.id)).toContain('ph-treatment-room');

    // Approving an already-withdrawn item is not possible.
    const s2 = reducer(s1, { type: 'APPROVE_KNOWLEDGE', knowledgeId: 'ph-lounge', by: 'Park Ji-hoon' });
    expect(s2).toBe(s1);
  });

  test('ADD_KNOWLEDGE always lands as a session draft; WITHDRAW removes it from approved photos', () => {
    const s0 = reducer(createInitialState(), {
      type: 'ADD_KNOWLEDGE',
      item: {
        id: 'ph-recovery-lounge',
        kind: 'photo',
        title: 'Recovery lounge',
        category: 'facility',
        state: 'approved', // must be forced back to draft
        photo: { src: '/photos/recovery-lounge.svg', alt: 'Recovery lounge', usage: 'Show the lounge', provenance: 'Illustrative rendering created for this demo' },
        createdBy: 'staff-seoyeon',
        createdAt: '2026-09-15T10:40:00',
        origin: 'seed',
      },
    });
    expect(s0.knowledge['ph-recovery-lounge']).toMatchObject({ state: 'draft', origin: 'session' });
    expect(s0.knowledgeOrder[s0.knowledgeOrder.length - 1]).toBe('ph-recovery-lounge');
    expect(selectApprovedPhotos(s0).map((k) => k.id)).not.toContain('ph-recovery-lounge');

    const s1 = run(s0, [
      { type: 'WITHDRAW_KNOWLEDGE', knowledgeId: 'ph-reception', by: 'Kim Seo-yeon' }, // staff → ignored
    ]);
    expect(s1).toBe(s0);
    const s2 = run(s1, [
      { type: 'SET_ROLE', role: 'manager' },
      { type: 'APPROVE_KNOWLEDGE', knowledgeId: 'ph-recovery-lounge', by: 'Park Ji-hoon' },
    ]);
    expect(selectApprovedPhotos(s2).map((k) => k.id)).toContain('ph-recovery-lounge');
    const s3 = reducer(s2, { type: 'WITHDRAW_KNOWLEDGE', knowledgeId: 'ph-recovery-lounge', by: 'Park Ji-hoon' });
    expect(s3.knowledge['ph-recovery-lounge']).toMatchObject({ state: 'withdrawn', withdrawnAt: s3.clock });
    expect(selectApprovedPhotos(s3).map((k) => k.id)).not.toContain('ph-recovery-lounge');
    expect(s3.knowledgeOrder).toContain('ph-recovery-lounge');
  });
});

test.describe('reducer · presentation', () => {
  test('RESET_ALL keeps mode and bumps runId; START_SCENARIO resets and enters guided', () => {
    const s0 = run(createInitialState(), [
      { type: 'SET_MODE', mode: 'explore' },
      { type: 'SET_ROLE', role: 'manager' },
      { type: 'TAKE_OVER', conversationId: CHIAYING, by: STAFF },
    ]);
    const runId = s0.guided.runId;
    const s1 = reducer(s0, { type: 'RESET_ALL' });
    expect(s1.mode).toBe('explore');
    expect(s1.guided).toEqual({ scenarioId: null, stepIndex: 0, status: 'idle', runId: runId + 1 });
    expect(s1.role).toBe('staff');
    expect(s1.conversations[CHIAYING].ownership).toBe('ai');

    const s2 = reducer(s0, { type: 'START_SCENARIO', scenarioId: 'human-takeover' });
    expect(s2.mode).toBe('guided');
    expect(s2.guided).toEqual({ scenarioId: 'human-takeover', stepIndex: 0, status: 'paused', runId: runId + 1 });
    expect(s2.conversations[CHIAYING].ownership).toBe('ai');
  });

  test('PLAY / PAUSE / STEP_APPLIED / SET_MODE bookkeeping', () => {
    const s0 = reducer(createInitialState(), { type: 'START_SCENARIO', scenarioId: 'inquiry-to-booking' });
    const playing = reducer(s0, { type: 'PLAY' });
    expect(playing.guided.status).toBe('playing');

    const stepped = reducer(playing, { type: 'STEP_APPLIED', stepId: 's1', pauseAfter: false, isLast: false });
    expect(stepped.guided).toMatchObject({ stepIndex: 1, status: 'playing' });
    const pausedAt = reducer(stepped, { type: 'STEP_APPLIED', stepId: 's2', pauseAfter: true, isLast: false });
    expect(pausedAt.guided).toMatchObject({ stepIndex: 2, status: 'paused' });
    const manual = reducer(pausedAt, { type: 'STEP_APPLIED', stepId: 's3', pauseAfter: false, isLast: false });
    expect(manual.guided.status).toBe('paused');
    const done = reducer(manual, { type: 'STEP_APPLIED', stepId: 's4', pauseAfter: false, isLast: true });
    expect(done.guided).toMatchObject({ stepIndex: 4, status: 'complete' });
    expect(reducer(done, { type: 'PLAY' })).toBe(done);

    const paused = reducer(playing, { type: 'PAUSE' });
    expect(paused.guided.status).toBe('paused');
    const explore = reducer(playing, { type: 'SET_MODE', mode: 'explore' });
    expect(explore.mode).toBe('explore');
    expect(explore.guided.status).toBe('paused');
    expect(explore.guided.runId).toBe(playing.guided.runId + 1);

    const restarted = reducer(done, { type: 'RESTART_SCENARIO' });
    expect(restarted.guided).toMatchObject({ scenarioId: 'inquiry-to-booking', stepIndex: 0, status: 'paused', runId: done.guided.runId + 1 });
    expect(reducer(createInitialState(), { type: 'PLAY' }).guided.status).toBe('idle');
  });

  test('clock, selection, notifications and toggles', () => {
    const s0 = run(createInitialState(), [
      { type: 'SET_CLOCK', iso: '2026-09-23T21:40:00' },
      { type: 'ADVANCE_CLOCK_TO_NEXT_OPENING' },
    ]);
    expect(s0.clock).toBe('2026-09-28T10:00:00');

    const s1 = run(s0, [
      { type: 'TOGGLE_NOTIFICATIONS' },
      { type: 'PUSH_NOTIFICATION', notification: { id: 'n-1', at: s0.clock, kind: 'info', title: 'One', body: '', read: true } },
      { type: 'PUSH_NOTIFICATION', notification: { id: 'n-2', at: s0.clock, kind: 'info', title: 'Two', body: '', read: false } },
    ]);
    expect(s1.notificationsOpen).toBe(true);
    expect(s1.notifications.slice(0, 2).map((n) => n.id)).toEqual(['n-2', 'n-1']);
    expect(s1.notifications[1].read).toBe(false);

    const s2 = reducer(s1, { type: 'SELECT_CONVERSATION', conversationId: 'conv-wa-daniel' });
    expect(s2.selectedConversationId).toBe('conv-wa-daniel');
    expect(s2.conversations['conv-wa-daniel'].unread).toBe(0);
    expect(s2.notificationsOpen).toBe(false);

    const s3 = run(s2, [
      { type: 'MARK_NOTIFICATION_READ', notificationId: 'n-2' },
      { type: 'TOGGLE_BOOKING_PANEL', open: true },
      { type: 'TOGGLE_BOOKING_PANEL' },
      { type: 'SET_FILTERS', filters: { channel: 'whatsapp' } },
    ]);
    expect(s3.notifications.find((n) => n.id === 'n-2')?.read).toBe(true);
    expect(s3.bookingPanelOpen).toBe(false);
    expect(s3.filters).toMatchObject({ channel: 'whatsapp', needsHumanOnly: s2.filters.needsHumanOnly });
    expect(reducer(s3, { type: 'CLEAR_NOTIFICATIONS' }).notifications).toEqual([]);
  });
});
