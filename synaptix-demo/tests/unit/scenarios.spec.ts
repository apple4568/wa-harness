import { test, expect } from '@playwright/test';
import type { DemoAction, DemoState, Scenario } from '@/domain/types';
import { createInitialState } from '@/data/seed';
import { SCENARIO_LIST, SCENARIOS } from '@/scenarios';
import { reducer } from '@/state/reducer';
import { selectApprovedPhotos, selectMessages } from '@/state/selectors';

/** Action types whose rejection would silently break a story. A no-op result for these fails the run. */
const MUST_CHANGE_STATE = new Set<DemoAction['type']>([
  'UPSERT_CONVERSATION',
  'ADD_MESSAGE',
  'SEND_STAFF_MESSAGE',
  'HANDOVER',
  'TAKE_OVER',
  'RETURN_TO_AI',
  'QUEUE_AFTER_HOURS',
  'OFFER_SLOTS',
  'SELECT_SLOT',
  'CUSTOMER_CONFIRMED',
  'START_CHANGE',
  'SUBMIT_BOOKING',
  'CRM_RESULT',
  'RECONCILE_BOOKING',
  'SEND_BOOKING_CONFIRMATION',
  'ADD_KNOWLEDGE',
  'APPROVE_KNOWLEDGE',
  'WITHDRAW_KNOWLEDGE',
  'PUSH_NOTIFICATION',
  'SET_CLOCK',
  'ADVANCE_CLOCK_TO_NEXT_OPENING',
  'SET_DELIVERY',
]);

function describeAction(action: DemoAction): string {
  const { type, ...rest } = action as DemoAction & Record<string, unknown>;
  const brief: Record<string, unknown> = {};
  for (const key of ['conversationId', 'requestId', 'knowledgeId', 'slotId', 'messageId', 'appointmentId', 'outcome', 'result', 'intent']) {
    if (key in rest) brief[key] = (rest as Record<string, unknown>)[key];
  }
  if ('message' in rest) {
    const m = (rest as { message: { id: string; author: string; kind: string; photoId?: string } }).message;
    brief.message = { id: m.id, author: m.author, kind: m.kind, photoId: m.photoId };
  }
  return `${type} ${JSON.stringify(brief)}`;
}

/** Checks that every id an action refers to exists in the state it is applied to. */
function assertReferences(state: DemoState, action: DemoAction, where: string) {
  const a = action as DemoAction & Record<string, unknown>;
  const conv = (id: string | null | undefined) => {
    if (id == null) return;
    expect(state.conversations[id], `${where}: unknown conversation "${id}" in ${describeAction(action)}`).toBeDefined();
  };
  const slot = (id: string) => expect(state.slots[id], `${where}: unknown slot "${id}" in ${describeAction(action)}`).toBeDefined();
  const knowledge = (id: string | undefined) => {
    if (!id) return;
    expect(state.knowledge[id], `${where}: unknown knowledge item "${id}" in ${describeAction(action)}`).toBeDefined();
  };

  if (action.type === 'UPSERT_CONVERSATION') {
    expect(state.customers[action.conversation.customerId], `${where}: unknown customer "${action.conversation.customerId}"`).toBeDefined();
    return;
  }
  if (action.type === 'ADD_MESSAGE' || action.type === 'SEND_BOOKING_CONFIRMATION') {
    conv(action.message.conversationId);
    if (action.message.kind === 'photo') knowledge(action.message.photoId);
    for (const id of action.message.slotIds ?? []) slot(id);
    for (const id of action.message.sourceIds ?? []) knowledge(id);
    return;
  }
  if (typeof a.conversationId === 'string') conv(a.conversationId);
  if (action.type === 'SEND_STAFF_MESSAGE') knowledge(action.photoId);
  if (action.type === 'OFFER_SLOTS') for (const id of action.slotIds) slot(id);
  if (action.type === 'SELECT_SLOT') slot(action.slotId);
  if (action.type === 'START_CHANGE') {
    expect(state.crm.appointments[action.appointmentId], `${where}: unknown appointment "${action.appointmentId}"`).toBeDefined();
  }
  if (action.type === 'APPROVE_KNOWLEDGE' || action.type === 'WITHDRAW_KNOWLEDGE') knowledge(action.knowledgeId);
  if (action.type === 'CRM_RESULT' || action.type === 'RECONCILE_BOOKING') {
    expect(state.crm.requests[action.requestId], `${where}: unknown request "${action.requestId}"`).toBeDefined();
  }
  if (action.type === 'SET_DELIVERY') {
    expect(state.messages[action.messageId], `${where}: unknown message "${action.messageId}"`).toBeDefined();
  }
  if (action.type === 'PUSH_NOTIFICATION') {
    conv(action.notification.conversationId);
    knowledge(action.notification.knowledgeId);
  }
}

/**
 * Emulates `useSimulatedServices` synchronously: delivers every 'sending' message and resolves
 * every pending auto request with the conversation's crmBehavior.
 */
function settleServices(state: DemoState): DemoState {
  let next = state;
  for (const m of Object.values(next.messages)) {
    if (m.delivery !== 'sending') continue;
    next = reducer(next, { type: 'SET_DELIVERY', messageId: m.id, delivery: 'sent' });
    next = reducer(next, { type: 'SET_DELIVERY', messageId: m.id, delivery: 'delivered' });
  }
  for (const r of Object.values(next.crm.requests)) {
    if (r.status !== 'pending' || r.resolution !== 'auto') continue;
    const behaviour = next.conversations[r.conversationId]?.crmBehavior ?? 'success';
    next = reducer(next, { type: 'CRM_RESULT', requestId: r.id, result: behaviour });
  }
  return next;
}

interface RunLog {
  final: DemoState;
  /** State snapshot after each step (index = step index). */
  afterStep: DemoState[];
  /** State snapshot before each step. */
  beforeStep: DemoState[];
}

function runScenario(scenario: Scenario): RunLog {
  let state = reducer(createInitialState(), { type: 'RESET_ALL' });
  state = reducer(state, { type: 'START_SCENARIO', scenarioId: scenario.id });
  expect(state.guided).toMatchObject({ scenarioId: scenario.id, stepIndex: 0, status: 'paused' });

  const apply = (action: DemoAction, where: string) => {
    assertReferences(state, action, where);
    const next = reducer(state, action);
    if (MUST_CHANGE_STATE.has(action.type)) {
      expect(next, `${where}: ${describeAction(action)} was rejected by the reducer`).not.toBe(state);
    }
    state = next;
  };

  scenario.setup.forEach((action, i) => apply(action, `${scenario.id} setup[${i}]`));
  state = reducer(state, { type: 'PLAY' });

  const afterStep: DemoState[] = [];
  const beforeStep: DemoState[] = [];
  scenario.steps.forEach((step, index) => {
    beforeStep.push(state);
    expect(state.guided.stepIndex, `${scenario.id}: stepIndex before "${step.id}"`).toBe(index);
    step.actions.forEach((action, i) => apply(action, `${scenario.id} › ${step.id} (#${index}) action[${i}]`));
    state = reducer(state, { type: 'STEP_APPLIED', stepId: step.id, pauseAfter: !!step.pauseAfter, isLast: index === scenario.steps.length - 1 });
    state = settleServices(state);
    afterStep.push(state);
    if (index < scenario.steps.length - 1 && !step.pauseAfter) expect(state.guided.status).toBe('playing');
    if (index < scenario.steps.length - 1 && step.pauseAfter) {
      expect(state.guided.status).toBe('paused');
      state = reducer(state, { type: 'PLAY' });
    }
  });
  expect(state.guided.status).toBe('complete');
  expect(state.guided.stepIndex).toBe(scenario.steps.length);
  return { final: state, afterStep, beforeStep };
}

test.describe('scenario definitions', () => {
  test('SCENARIO_LIST covers the six scenario ids with unique step ids', () => {
    expect(SCENARIO_LIST.map((s) => s.id)).toEqual([
      'inquiry-to-booking',
      'human-takeover',
      'after-hours',
      'reschedule-cancel',
      'manager-approved-photo',
      'booking-uncertainty',
    ]);
    for (const scenario of SCENARIO_LIST) {
      expect(SCENARIOS[scenario.id]).toBe(scenario);
      expect(scenario.steps.length, `${scenario.id} has steps`).toBeGreaterThan(0);
      const ids = scenario.steps.map((s) => s.id);
      expect(new Set(ids).size, `${scenario.id}: duplicate step ids in ${ids.join(', ')}`).toBe(ids.length);
      for (const step of scenario.steps) {
        expect(step.title.trim().length, `${scenario.id}/${step.id} title`).toBeGreaterThan(0);
        expect(step.actions.length, `${scenario.id}/${step.id} has actions`).toBeGreaterThan(0);
        if (step.delayMs !== undefined) expect(step.delayMs).toBeGreaterThanOrEqual(0);
      }
    }
  });

  for (const scenario of SCENARIO_LIST) {
    test(`${scenario.id} plays through the reducer without rejected actions`, () => {
      const { final } = runScenario(scenario);
      expect(final.mode).toBe('guided');
    });
  }

  test('scenario 1 · inquiry-to-booking ends with MD-24817 confirmed for Misaki', () => {
    const { final } = runScenario(SCENARIOS['inquiry-to-booking']);
    const conv = final.conversations['conv-ig-misaki'];
    expect(conv).toBeDefined();
    const appointments = Object.values(final.crm.appointments).filter((a) => a.conversationId === 'conv-ig-misaki');
    expect(appointments).toHaveLength(1);
    expect(appointments[0]).toMatchObject({ reference: 'MD-24817', slotId: '2026-09-17T14:00', status: 'confirmed' });
    expect(final.slots['2026-09-17T14:00'].available).toBe(false);
    expect(conv.booking.stage).toBe('confirmation_sent');
    expect(conv.booking.appointmentId).toBe(appointments[0].id);
    expect(conv.booking.confirmationDelivery).toBe('delivered');
    expect(conv.ownership).toBe('ai');
    const requests = Object.values(final.crm.requests).filter((r) => r.conversationId === 'conv-ig-misaki');
    expect(requests).toHaveLength(1);
    expect(requests[0].status).toBe('success');
  });

  test('scenario 2 · human-takeover goes ai → needs_human → human → ai', () => {
    const { final, afterStep } = runScenario(SCENARIOS['human-takeover']);
    const id = 'conv-line-chiaying';
    const owned = afterStep.map((s) => s.conversations[id].ownership);
    expect(owned).toContain('needs_human');
    expect(owned).toContain('human');
    expect(owned.indexOf('needs_human')).toBeLessThan(owned.indexOf('human'));
    expect(final.conversations[id].ownership).toBe('ai');
    expect(final.conversations[id].handover).toBeUndefined();
    const messages = selectMessages(final, id);
    expect(messages.some((m) => m.author === 'staff')).toBe(true);
    expect(messages.some((m) => m.author === 'system' && m.text?.includes('took over'))).toBe(true);
    expect(messages.some((m) => m.author === 'system' && m.text?.includes('Returned to AI'))).toBe(true);
    // No assistant message was accepted while a person owned the conversation.
    afterStep.forEach((s, i) => {
      if (s.conversations[id].ownership !== 'ai') {
        const prev = i > 0 ? afterStep[i - 1] : undefined;
        const added = selectMessages(s, id).filter((m) => !prev || !prev.messages[m.id]);
        expect(added.filter((m) => m.author === 'assistant'), `step #${i} accepted an assistant message while ownership was ${s.conversations[id].ownership}`).toHaveLength(0);
      }
    });
  });

  test('scenario 3 · after-hours queues Wei and reopens on Mon 28 Sep 10:00', () => {
    const scenario = SCENARIOS['after-hours'];
    const { final, afterStep } = runScenario(scenario);
    const id = 'conv-wechat-wei';
    const firstPause = scenario.steps.findIndex((s) => s.pauseAfter);
    expect(firstPause, 'after-hours has a pause point').toBeGreaterThanOrEqual(0);
    expect(afterStep[firstPause].clock).toBe('2026-09-23T21:40:00');
    expect(afterStep[firstPause].conversations[id].afterHoursQueued).toBe(true);
    expect(afterStep.some((s) => s.clock === '2026-09-28T10:00:00')).toBe(true);
    expect(final.clock).toBe('2026-09-28T10:00:00');
    expect(final.conversations[id].afterHoursQueued).toBe(false);
    // The medication question stays unanswered by the assistant: the draft item is never approved by the story.
    expect(final.knowledge['kb-medication-questions'].state).toBe('draft');
  });

  test('scenario 4 · reschedule-cancel moves MD-24811 to Mon 21 Sep 16:00 without a second appointment', () => {
    const { final, afterStep } = runScenario(SCENARIOS['reschedule-cancel']);
    const id = 'conv-wa-emily';
    const appointments = Object.values(final.crm.appointments).filter((a) => a.conversationId === id);
    expect(appointments).toHaveLength(1);
    const apt = appointments[0];
    expect(apt.reference).toBe('MD-24811');
    expect(apt.history.some((h) => h.change === 'rescheduled' && h.fromSlotId === '2026-09-18T15:00' && h.toSlotId === '2026-09-21T16:00')).toBe(true);
    // At some point the appointment sat at 16:00 on Mon 21 Sep, with the old slot released.
    const moved = afterStep.find((s) => s.crm.appointments[apt.id]?.slotId === '2026-09-21T16:00');
    expect(moved).toBeDefined();
    expect(moved!.crm.appointments[apt.id].status).toBe('rescheduled');
    expect(moved!.slots['2026-09-18T15:00'].available).toBe(true);
    expect(moved!.slots['2026-09-21T16:00'].available).toBe(false);
    expect(Object.keys(final.crm.appointments).length).toBe(Object.keys(afterStep[0].crm.appointments).length);
    expect(final.crm.nextReferenceNumber).toBe(24817);
  });

  test('scenario 5 · manager-approved-photo: recovery lounge is sent to Sophie, then withdrawn', () => {
    const { final, afterStep } = runScenario(SCENARIOS['manager-approved-photo']);
    const item = final.knowledge['ph-recovery-lounge'];
    expect(item).toBeDefined();
    expect(item.kind).toBe('photo');
    expect(item.state).toBe('withdrawn');
    expect(item.origin).toBe('session');
    expect(item.approvedBy).toBeTruthy();
    expect(afterStep.some((s) => s.knowledge['ph-recovery-lounge']?.state === 'approved')).toBe(true);
    const photos = selectMessages(final, 'conv-wa-sophie').filter((m) => m.kind === 'photo' && m.photoId === 'ph-recovery-lounge');
    expect(photos).toHaveLength(1);
    expect(selectApprovedPhotos(final).map((k) => k.id)).not.toContain('ph-recovery-lounge');
  });

  test('scenario 6 · booking-uncertainty ends with exactly one appointment for Hina', () => {
    const { final, afterStep } = runScenario(SCENARIOS['booking-uncertainty']);
    const id = 'conv-ig-hina';
    expect(afterStep.some((s) => s.conversations[id].booking.stage === 'needs_review')).toBe(true);
    const appointments = Object.values(final.crm.appointments).filter((a) => a.conversationId === id);
    expect(appointments).toHaveLength(1);
    expect(appointments[0]).toMatchObject({ slotId: '2026-09-21T14:00', reference: 'MD-24817' });
    expect(['crm_success', 'confirmation_sent']).toContain(final.conversations[id].booking.stage);
    const requests = Object.values(final.crm.requests).filter((r) => r.conversationId === id);
    expect(requests.filter((r) => r.status === 'pending')).toHaveLength(0);
    expect(requests.some((r) => r.status === 'reconciled' || r.status === 'success')).toBe(true);
  });
});
