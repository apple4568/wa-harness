/**
 * Pure, immutable reducer for the Synaptix · Midam demo.
 *
 * Guarantees (see docs/DEMO_BRIEF.md → "Reducer guarantees"):
 * - never mutates the incoming state;
 * - assistant messages are rejected unless ownership === 'ai' and the AI is not paused;
 * - photo messages require an approved photo knowledge item;
 * - SUBMIT_BOOKING is idempotent per requestId and ignored while a request is pending;
 * - reschedule mutates the same Appointment, never creates a second one;
 * - APPROVE_KNOWLEDGE / WITHDRAW_KNOWLEDGE require role === 'manager';
 * - every timestamp the reducer generates comes from `state.clock`.
 */
import type {
  Appointment,
  BookingFlow,
  Conversation,
  CrmRequest,
  DemoAction,
  DemoState,
  GuidedState,
  Message,
  ScenarioId,
} from '@/domain/types';
import { nextOpening } from '@/domain/calendar';
import { createInitialState } from '@/data/seed';
import { STAFF_BY_ID } from '@/data/staff';

/** Scenarios pass staff ids (`staff-seoyeon`) or names; system lines always show the name. */
function staffLabel(by: string): string {
  return STAFF_BY_ID[by]?.name ?? by;
}

/* ---------------------------------------------------------------------- */
/* Helpers                                                                 */
/* ---------------------------------------------------------------------- */

function patchConversation(state: DemoState, id: string, patch: Partial<Conversation>): DemoState {
  const conv = state.conversations[id];
  if (!conv) return state;
  return { ...state, conversations: { ...state.conversations, [id]: { ...conv, ...patch } } };
}

function patchBooking(state: DemoState, id: string, patch: Partial<BookingFlow>): DemoState {
  const conv = state.conversations[id];
  if (!conv) return state;
  return patchConversation(state, id, { booking: { ...conv.booking, ...patch } });
}

/** Next runtime id `m-<seq>`, skipping any id that already exists (seed safety). */
function nextMessageId(state: DemoState): { id: string; seq: number } {
  let seq = state.seq + 1;
  while (state.messages[`m-${seq}`]) seq += 1;
  return { id: `m-${seq}`, seq };
}

function isApprovedPhoto(state: DemoState, photoId: string | undefined): boolean {
  if (!photoId) return false;
  const item = state.knowledge[photoId];
  return !!item && item.kind === 'photo' && item.state === 'approved';
}

/** Validates a message against the ownership / approval rules. Returns a reason when rejected. */
function messageRejection(state: DemoState, message: Message): string | null {
  const conv = state.conversations[message.conversationId];
  if (!conv) return 'missing conversation';
  if (message.author === 'assistant' && (conv.ownership !== 'ai' || state.settings.aiPaused)) return 'assistant not allowed';
  if (message.kind === 'photo' && !isApprovedPhoto(state, message.photoId)) return 'photo not approved';
  return null;
}

/** Appends a validated message and updates the conversation's derived fields. */
function appendMessage(state: DemoState, message: Message): DemoState {
  const conv = state.conversations[message.conversationId]!;
  const order = state.messageOrder[conv.id] ?? [];
  const nextOrder = order.includes(message.id) ? order : [...order, message.id];

  const selectedInInbox = state.selectedConversationId === conv.id && state.view === 'inbox';
  const convPatch: Partial<Conversation> = { lastActivityAt: message.at || state.clock };
  if (message.author === 'customer') {
    convPatch.customerTyping = false;
    if (!selectedInInbox) convPatch.unread = conv.unread + 1;
  }
  if (message.author === 'assistant') convPatch.assistant = { kind: 'idle' };

  return {
    ...state,
    messages: { ...state.messages, [message.id]: message },
    messageOrder: { ...state.messageOrder, [conv.id]: nextOrder },
    conversations: { ...state.conversations, [conv.id]: { ...conv, ...convPatch } },
  };
}

/** Adds a neutral system line to a conversation (delivered immediately). */
function appendSystemLine(state: DemoState, conversationId: string, text: string): DemoState {
  if (!state.conversations[conversationId]) return state;
  const { id, seq } = nextMessageId(state);
  const message: Message = {
    id,
    conversationId,
    at: state.clock,
    author: 'system',
    kind: 'system',
    text,
    delivery: 'delivered',
  };
  return appendMessage({ ...state, seq }, message);
}

function setSlotAvailability(state: DemoState, slotId: string | undefined, available: boolean): DemoState {
  if (!slotId) return state;
  const slot = state.slots[slotId];
  if (!slot || slot.available === available) return state;
  return { ...state, slots: { ...state.slots, [slotId]: { ...slot, available } } };
}

/** Applies the confirmation-delivery mirror for a conversation's confirmation message. */
function mirrorConfirmationDelivery(state: DemoState, conversationId: string, delivery: Message['delivery']): DemoState {
  const conv = state.conversations[conversationId];
  if (!conv) return state;
  const patch: Partial<BookingFlow> = { confirmationDelivery: delivery };
  if (delivery === 'delivered' && conv.booking.stage === 'crm_success') patch.stage = 'confirmation_sent';
  return patchBooking(state, conversationId, patch);
}

/**
 * Applies the CRM "success" mutation for a request: creates / reschedules / cancels the
 * appointment, marks the request, and moves the conversation's booking to `crm_success`.
 * Idempotent: an appointment that already reflects the request is not touched again.
 */
function applyCrmSuccess(
  state: DemoState,
  request: CrmRequest,
  requestStatus: 'success' | 'reconciled',
  reconciledOutcome?: CrmRequest['reconciledOutcome'],
): DemoState {
  const conv = state.conversations[request.conversationId];
  if (!conv) return state;
  let next = state;
  let resultAppointmentId: string | undefined;

  if (request.intent === 'book') {
    const id = `apt-${request.id}`;
    const existing = request.resultAppointmentId ? next.crm.appointments[request.resultAppointmentId] : next.crm.appointments[id];
    if (existing) {
      resultAppointmentId = existing.id;
    } else {
      if (!request.slotId) return state;
      const reference = `MD-${next.crm.nextReferenceNumber}`;
      const appointment: Appointment = {
        id,
        reference,
        conversationId: conv.id,
        customerId: conv.customerId,
        slotId: request.slotId,
        status: 'confirmed',
        createdAt: next.clock,
        history: [{ at: next.clock, change: 'created', toSlotId: request.slotId }],
      };
      next = {
        ...next,
        crm: {
          ...next.crm,
          appointments: { ...next.crm.appointments, [id]: appointment },
          nextReferenceNumber: next.crm.nextReferenceNumber + 1,
        },
      };
      next = setSlotAvailability(next, request.slotId, false);
      resultAppointmentId = id;
    }
  } else if (request.intent === 'reschedule') {
    const appointment = request.appointmentId ? next.crm.appointments[request.appointmentId] : undefined;
    if (!appointment || !request.slotId) return state;
    resultAppointmentId = appointment.id;
    if (appointment.slotId !== request.slotId) {
      const fromSlotId = appointment.slotId;
      const updated: Appointment = {
        ...appointment,
        slotId: request.slotId,
        status: 'rescheduled',
        history: [...appointment.history, { at: next.clock, change: 'rescheduled', fromSlotId, toSlotId: request.slotId }],
      };
      next = { ...next, crm: { ...next.crm, appointments: { ...next.crm.appointments, [appointment.id]: updated } } };
      next = setSlotAvailability(next, fromSlotId, true);
      next = setSlotAvailability(next, request.slotId, false);
    }
  } else {
    const appointment = request.appointmentId ? next.crm.appointments[request.appointmentId] : undefined;
    if (!appointment) return state;
    resultAppointmentId = appointment.id;
    if (appointment.status !== 'cancelled') {
      const updated: Appointment = {
        ...appointment,
        status: 'cancelled',
        history: [...appointment.history, { at: next.clock, change: 'cancelled', fromSlotId: appointment.slotId }],
      };
      next = { ...next, crm: { ...next.crm, appointments: { ...next.crm.appointments, [appointment.id]: updated } } };
      next = setSlotAvailability(next, appointment.slotId, true);
    }
  }

  const updatedRequest: CrmRequest = {
    ...request,
    status: requestStatus,
    resultAppointmentId,
    ...(reconciledOutcome ? { reconciledOutcome } : {}),
  };
  next = { ...next, crm: { ...next.crm, requests: { ...next.crm.requests, [request.id]: updatedRequest } } };

  if (conv.booking.requestId === request.id || conv.booking.stage === 'submitting') {
    next = patchBooking(next, conv.id, { stage: 'crm_success', appointmentId: resultAppointmentId, requestId: request.id });
  }
  return next;
}

function freshScenarioState(state: DemoState, scenarioId: ScenarioId): DemoState {
  const fresh = createInitialState();
  const guided: GuidedState = { scenarioId, stepIndex: 0, status: 'paused', runId: state.guided.runId + 1 };
  return { ...fresh, mode: 'guided', guided };
}

/* ---------------------------------------------------------------------- */
/* Reducer                                                                 */
/* ---------------------------------------------------------------------- */

export function reducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    /* --- presentation & navigation --- */
    case 'RESET_ALL': {
      const fresh = createInitialState();
      return {
        ...fresh,
        mode: state.mode,
        guided: { scenarioId: null, stepIndex: 0, status: 'idle', runId: state.guided.runId + 1 },
      };
    }
    case 'SET_MODE': {
      const leavingWhilePlaying = action.mode !== 'guided' && state.guided.status === 'playing';
      return {
        ...state,
        mode: action.mode,
        guided: {
          ...state.guided,
          runId: state.guided.runId + 1,
          status: leavingWhilePlaying ? 'paused' : state.guided.status,
        },
      };
    }
    case 'SET_ROLE':
      return state.role === action.role ? state : { ...state, role: action.role };
    case 'SET_VIEW':
      return state.view === action.view ? state : { ...state, view: action.view };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.filters } };
    case 'SELECT_CONVERSATION': {
      let next: DemoState = { ...state, selectedConversationId: action.conversationId, notificationsOpen: false };
      if (action.conversationId) next = patchConversation(next, action.conversationId, { unread: 0 });
      return next;
    }
    case 'TOGGLE_BOOKING_PANEL':
      return { ...state, bookingPanelOpen: action.open ?? !state.bookingPanelOpen };
    case 'TOGGLE_NOTIFICATIONS':
      return { ...state, notificationsOpen: action.open ?? !state.notificationsOpen };
    case 'SET_CLOCK':
      return { ...state, clock: action.iso };
    case 'ADVANCE_CLOCK_TO_NEXT_OPENING':
      return { ...state, clock: nextOpening(state.clock, state.settings.workingHours).at };

    /* --- guided playback --- */
    case 'START_SCENARIO':
      return freshScenarioState(state, action.scenarioId);
    case 'RESTART_SCENARIO':
      return state.guided.scenarioId ? freshScenarioState(state, state.guided.scenarioId) : state;
    case 'PLAY': {
      const g = state.guided;
      if (!g.scenarioId || g.status === 'complete' || g.status === 'playing') return state;
      return { ...state, guided: { ...g, status: 'playing' } };
    }
    case 'PAUSE':
      return state.guided.status === 'playing' ? { ...state, guided: { ...state.guided, status: 'paused' } } : state;
    case 'STEP_APPLIED': {
      const g = state.guided;
      const status = action.isLast ? 'complete' : action.pauseAfter ? 'paused' : g.status === 'playing' ? 'playing' : 'paused';
      return { ...state, guided: { ...g, stepIndex: g.stepIndex + 1, status } };
    }

    /* --- conversation & messages --- */
    case 'UPSERT_CONVERSATION': {
      const conv = action.conversation;
      return {
        ...state,
        conversations: { ...state.conversations, [conv.id]: conv },
        messageOrder: { ...state.messageOrder, [conv.id]: state.messageOrder[conv.id] ?? [] },
      };
    }
    case 'SET_CUSTOMER_TYPING':
      return patchConversation(state, action.conversationId, { customerTyping: action.typing });
    case 'SET_ASSISTANT_ACTIVITY': {
      const conv = state.conversations[action.conversationId];
      if (!conv) return state;
      // The assistant never reads/retrieves/composes while it does not own the conversation.
      if (action.activity.kind !== 'idle' && (conv.ownership !== 'ai' || state.settings.aiPaused)) return state;
      return patchConversation(state, conv.id, { assistant: action.activity });
    }
    case 'ADD_MESSAGE':
      return messageRejection(state, action.message) ? state : appendMessage(state, action.message);
    case 'SET_DELIVERY': {
      const message = state.messages[action.messageId];
      if (!message) return state;
      let next: DemoState = { ...state, messages: { ...state.messages, [message.id]: { ...message, delivery: action.delivery } } };
      const conv = next.conversations[message.conversationId];
      if (conv && conv.booking.confirmationMessageId === message.id) {
        next = mirrorConfirmationDelivery(next, conv.id, action.delivery);
      }
      return next;
    }
    case 'MARK_READ':
      return patchConversation(state, action.conversationId, { unread: 0 });
    case 'SEND_STAFF_MESSAGE': {
      const conv = state.conversations[action.conversationId];
      if (!conv || conv.ownership !== 'human') return state;
      if (action.photoId && !isApprovedPhoto(state, action.photoId)) return state;
      const { id, seq } = nextMessageId(state);
      // Staff write Korean; the assistant translates before sending. `text` is always
      // what the customer receives, `translationKo` always the staff-side Korean.
      const translated = action.translatedText;
      const message: Message = {
        id,
        conversationId: conv.id,
        at: state.clock,
        author: 'staff',
        kind: action.photoId ? 'photo' : 'text',
        text: translated ?? action.text,
        ...(translated ? { translationKo: action.text, translatedFromKo: true } : {}),
        ...(action.photoId ? { photoId: action.photoId } : {}),
        delivery: 'sending',
      };
      return appendMessage({ ...state, seq }, message);
    }

    case 'IDENTIFY_CUSTOMER': {
      const customer = state.customers[action.customerId];
      if (!customer) return state;
      return {
        ...state,
        customers: {
          ...state.customers,
          [customer.id]: {
            ...customer,
            name: action.name,
            ...(action.readingKo ? { readingKo: action.readingKo } : {}),
          },
        },
      };
    }

    /* --- ownership --- */
    case 'HANDOVER': {
      const conv = state.conversations[action.conversationId];
      if (!conv) return state;
      return patchConversation(state, conv.id, {
        ownership: 'needs_human',
        handover: action.summary,
        assistant: { kind: 'idle' },
      });
    }
    case 'TAKE_OVER': {
      const conv = state.conversations[action.conversationId];
      if (!conv || conv.ownership === 'human') return state;
      const next = patchConversation(state, conv.id, { ownership: 'human', handledBy: action.by, assistant: { kind: 'idle' } });
      return appendSystemLine(next, conv.id, `${staffLabel(action.by)} took over · AI paused for this conversation`);
    }
    case 'RETURN_TO_AI': {
      const conv = state.conversations[action.conversationId];
      if (!conv || conv.ownership === 'ai') return state;
      const next = patchConversation(state, conv.id, { ownership: 'ai', handover: undefined, handledBy: undefined, assistant: { kind: 'idle' } });
      return appendSystemLine(next, conv.id, `Returned to AI · ${staffLabel(action.by)}`);
    }

    /* --- after hours --- */
    case 'QUEUE_AFTER_HOURS':
      return patchConversation(state, action.conversationId, { afterHoursQueued: true });
    case 'DEQUEUE_AFTER_HOURS':
      return patchConversation(state, action.conversationId, { afterHoursQueued: false });

    /* --- booking flow --- */
    case 'OFFER_SLOTS': {
      const conv = state.conversations[action.conversationId];
      if (!conv) return state;
      return patchBooking(state, conv.id, {
        stage: 'slots_offered',
        offeredSlotIds: [...action.slotIds],
        intent: action.intent ?? conv.booking.intent ?? 'book',
        appointmentId: action.appointmentId ?? conv.booking.appointmentId,
        selectedSlotId: undefined,
        requestId: undefined,
        confirmationDelivery: undefined,
        confirmationMessageId: undefined,
      });
    }
    case 'SELECT_SLOT': {
      const conv = state.conversations[action.conversationId];
      if (!conv) return state;
      const slot = state.slots[action.slotId];
      if (!slot || !slot.available || !conv.booking.offeredSlotIds.includes(action.slotId)) return state;
      return patchBooking(state, conv.id, { selectedSlotId: action.slotId });
    }
    case 'START_CHANGE': {
      const conv = state.conversations[action.conversationId];
      const appointment = state.crm.appointments[action.appointmentId];
      if (!conv || !appointment || appointment.status === 'cancelled') return state;
      return patchBooking(state, conv.id, {
        stage: 'idle',
        intent: action.intent,
        appointmentId: action.appointmentId,
        offeredSlotIds: [],
        selectedSlotId: undefined,
        requestId: undefined,
        confirmationDelivery: undefined,
        confirmationMessageId: undefined,
      });
    }
    case 'CUSTOMER_CONFIRMED': {
      const conv = state.conversations[action.conversationId];
      if (!conv) return state;
      const b = conv.booking;
      if (b.stage !== 'idle' && b.stage !== 'slots_offered' && b.stage !== 'customer_confirmed') return state;
      if (b.intent !== 'cancel' && !b.selectedSlotId) return state;
      if (b.intent !== 'book' && !b.appointmentId) return state;
      return patchBooking(state, conv.id, { stage: 'customer_confirmed' });
    }
    case 'SUBMIT_BOOKING': {
      const conv = state.conversations[action.conversationId];
      if (!conv || conv.booking.stage !== 'customer_confirmed') return state;
      if (state.crm.requests[action.requestId]) return state;
      const pending = Object.values(state.crm.requests).some((r) => r.conversationId === conv.id && r.status === 'pending');
      if (pending) return state;
      const b = conv.booking;
      const request: CrmRequest = {
        id: action.requestId,
        conversationId: conv.id,
        intent: b.intent,
        ...(b.intent === 'cancel' ? {} : { slotId: b.selectedSlotId }),
        ...(b.intent === 'book' ? {} : { appointmentId: b.appointmentId }),
        submittedAt: state.clock,
        resolution: action.resolution ?? 'auto',
        status: 'pending',
      };
      const next: DemoState = { ...state, crm: { ...state.crm, requests: { ...state.crm.requests, [request.id]: request } } };
      return patchBooking(next, conv.id, { stage: 'submitting', requestId: request.id });
    }
    case 'CRM_RESULT': {
      const request = state.crm.requests[action.requestId];
      if (!request || request.status !== 'pending') return state;
      if (action.result === 'success') return applyCrmSuccess(state, request, 'success');
      const timedOut: CrmRequest = { ...request, status: 'timeout' };
      let next: DemoState = { ...state, crm: { ...state.crm, requests: { ...state.crm.requests, [request.id]: timedOut } } };
      const conv = next.conversations[request.conversationId];
      if (conv && (conv.booking.requestId === request.id || conv.booking.stage === 'submitting')) {
        next = patchBooking(next, conv.id, { stage: 'needs_review', requestId: request.id });
      }
      return next;
    }
    case 'RECONCILE_BOOKING': {
      const request = state.crm.requests[action.requestId];
      if (!request || request.status !== 'timeout') return state;
      if (action.outcome === 'was_created') return applyCrmSuccess(state, request, 'reconciled', 'was_created');
      const reconciled: CrmRequest = { ...request, status: 'reconciled', reconciledOutcome: 'not_created' };
      let next: DemoState = { ...state, crm: { ...state.crm, requests: { ...state.crm.requests, [request.id]: reconciled } } };
      const conv = next.conversations[request.conversationId];
      if (conv && conv.booking.requestId === request.id) {
        // Keep requestId so the panel can show the reconciled-not-created outcome; a resubmission
        // uses a fresh request id (SUBMIT_BOOKING only blocks on pending/duplicate ids).
        next = patchBooking(next, conv.id, { stage: 'customer_confirmed' });
      }
      return next;
    }
    case 'SEND_BOOKING_CONFIRMATION': {
      const message = action.message;
      if (message.conversationId !== action.conversationId) return state;
      if (messageRejection(state, message)) return state;
      let next = appendMessage(state, message);
      next = patchBooking(next, action.conversationId, { confirmationMessageId: message.id });
      return mirrorConfirmationDelivery(next, action.conversationId, message.delivery);
    }
    case 'CANCEL_BOOKING_FLOW': {
      const conv = state.conversations[action.conversationId];
      if (!conv) return state;
      const live = conv.booking.appointmentId ? state.crm.appointments[conv.booking.appointmentId] : undefined;
      const keepAppointment = !!live && live.status !== 'cancelled';
      return patchBooking(state, conv.id, {
        stage: 'idle',
        intent: 'book',
        offeredSlotIds: [],
        selectedSlotId: undefined,
        requestId: undefined,
        appointmentId: keepAppointment ? conv.booking.appointmentId : undefined,
      });
    }

    /* --- knowledge --- */
    case 'ADD_KNOWLEDGE': {
      const item = { ...action.item, state: 'draft' as const, origin: 'session' as const, createdAt: action.item.createdAt || state.clock };
      const order = state.knowledgeOrder.includes(item.id) ? state.knowledgeOrder : [...state.knowledgeOrder, item.id];
      return { ...state, knowledge: { ...state.knowledge, [item.id]: item }, knowledgeOrder: order };
    }
    case 'APPROVE_KNOWLEDGE': {
      const item = state.knowledge[action.knowledgeId];
      if (state.role !== 'manager' || !item || item.state !== 'draft') return state;
      return {
        ...state,
        knowledge: {
          ...state.knowledge,
          [item.id]: { ...item, state: 'approved', approvedBy: action.by, approvedAt: state.clock },
        },
      };
    }
    case 'WITHDRAW_KNOWLEDGE': {
      const item = state.knowledge[action.knowledgeId];
      if (state.role !== 'manager' || !item || item.state !== 'approved') return state;
      return { ...state, knowledge: { ...state.knowledge, [item.id]: { ...item, state: 'withdrawn', withdrawnAt: state.clock } } };
    }

    /* --- settings --- */
    case 'SET_AI_PAUSED':
      return { ...state, settings: { ...state.settings, aiPaused: action.paused } };
    case 'SET_WORKING_HOURS':
      return { ...state, settings: { ...state.settings, workingHours: action.workingHours } };
    case 'SET_ESCALATION_ENABLED':
      return {
        ...state,
        settings: {
          ...state.settings,
          escalation: state.settings.escalation.map((r) => (r.id === action.recipientId ? { ...r, enabled: action.enabled } : r)),
        },
      };
    case 'SET_CONNECTION_STATUS': {
      if (action.target === 'crm') {
        return {
          ...state,
          settings: { ...state.settings, crmStatus: action.status },
          crm: { ...state.crm, connected: action.status !== 'disconnected' },
        };
      }
      const channel = state.settings.channels[action.target];
      if (!channel) return state;
      return {
        ...state,
        settings: { ...state.settings, channels: { ...state.settings.channels, [action.target]: { ...channel, status: action.status } } },
      };
    }

    /* --- notifications --- */
    case 'PUSH_NOTIFICATION': {
      const rest = state.notifications.filter((n) => n.id !== action.notification.id);
      return { ...state, notifications: [{ ...action.notification, read: false }, ...rest] };
    }
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) => (n.id === action.notificationId && !n.read ? { ...n, read: true } : n)),
      };
    case 'CLEAR_NOTIFICATIONS':
      return state.notifications.length ? { ...state, notifications: [] } : state;

    default:
      return state;
  }
}
