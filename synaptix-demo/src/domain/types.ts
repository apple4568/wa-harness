/**
 * Synaptix · Midam demo — shared domain + state contract.
 *
 * Every module (sample data, reducer, scenario player, simulated services, UI)
 * imports from this file. Keep it the single source of truth; do not fork types
 * into components.
 *
 * Conventions
 * - All timestamps are ISO-8601 strings in the clinic's local time zone
 *   (Asia/Seoul) and are derived from the SIMULATED clinic clock, never Date.now().
 * - IDs are stable, human-readable strings so scenarios can reference them.
 * - Business state changes happen only through `DemoAction`s handled by the reducer.
 *   Timers (scenario player, simulated services) may only *dispatch actions*.
 */

/* ---------------------------------------------------------------------- */
/* Channels, languages, people                                             */
/* ---------------------------------------------------------------------- */

export type Channel = 'instagram' | 'whatsapp' | 'line' | 'wechat';

/** Customer language is independent of channel. `zh-Hans` / `zh-Hant` reflect the
 *  customer's script preference for Mandarin. `ko` is used for staff translations. */
export type Language = 'ja' | 'zh-Hans' | 'zh-Hant' | 'en' | 'ko';

export type Role = 'staff' | 'manager';

export interface Customer {
  id: string;
  /** Display name in the customer's own script, e.g. "佐藤 美咲" or "Emily Carter". */
  name: string;
  /** Optional romanised / Korean-friendly reading shown to staff. */
  readingKo?: string;
  language: Language;
  /** Channel handle shown in the contact header, e.g. "@misaki.s". */
  handle: string;
  /** Country/region label for minimal contact context, e.g. "Tokyo, JP". */
  location?: string;
  /** Two-letter monogram for the avatar. */
  monogram: string;
}

/* ---------------------------------------------------------------------- */
/* Messages                                                                */
/* ---------------------------------------------------------------------- */

export type MessageAuthor = 'customer' | 'assistant' | 'staff' | 'system';

export type DeliveryState = 'sending' | 'sent' | 'delivered' | 'failed';

export type MessageKind =
  | 'text'
  /** Assistant/staff sent an approved clinic photo (photoId refers to a KnowledgeItem). */
  | 'photo'
  /** Customer attachment (never eligible as knowledge). */
  | 'customer_attachment'
  /** Assistant offered consultation slots. `slotIds` refers to ClinicSlot ids. */
  | 'slot_offer'
  /** Structured booking confirmation / change / cancellation card. */
  | 'booking_card'
  /** Short assistant handover response before Needs human. */
  | 'handover'
  /** Neutral system line (ownership change, after-hours note, etc.). */
  | 'system';

export interface Message {
  id: string;
  conversationId: string;
  at: string; // ISO, simulated clock
  author: MessageAuthor;
  kind: MessageKind;
  /** Original text in the customer's language (or English/Korean for staff). */
  text?: string;
  /** Fixed Korean translation for staff. Absent for Korean or system lines. */
  translationKo?: string;
  /** Flag copy that still needs a fluent-speaker review. Shown discreetly to staff. */
  needsLanguageReview?: boolean;
  /** For kind='photo': the approved knowledge item used. */
  photoId?: string;
  /** For kind='customer_attachment': a local, bundled placeholder asset path. */
  attachmentSrc?: string;
  /** For kind='slot_offer'. */
  slotIds?: string[];
  /** For kind='booking_card'. */
  appointmentId?: string;
  /** Approved knowledge items the assistant used to compose this message (staff-only source detail). */
  sourceIds?: string[];
  delivery: DeliveryState;
}

/* ---------------------------------------------------------------------- */
/* Conversations & ownership                                               */
/* ---------------------------------------------------------------------- */

/** Ownership is an explicit state machine:
 *  ai ──(HANDOVER / REQUEST_HUMAN)──► needs_human ──(TAKE_OVER)──► human ──(RETURN_TO_AI)──► ai
 *  ai ──(TAKE_OVER)──► human   (staff may take over at any time)
 *  While ownership !== 'ai' the assistant never composes or sends. */
export type Ownership = 'ai' | 'needs_human' | 'human';

/** What the assistant is doing right now inside a conversation. Purely presentational
 *  except that any pending draft is discarded when ownership leaves 'ai'. */
export type AssistantActivity =
  | { kind: 'idle' }
  | { kind: 'reading' }
  | { kind: 'retrieving'; sourceIds: string[] }
  | { kind: 'composing'; draftMessageId: string };

export interface HandoverSummary {
  /** One-line reason, e.g. "Customer asked to speak with staff". */
  reason: string;
  /** 2–4 bullet points of context the assistant collected. */
  points: string[];
  /** ISO time the handover happened. */
  at: string;
}

export interface Conversation {
  id: string;
  channel: Channel;
  /** Clinic account on that channel, e.g. "@midam.clinic" or "Midam Clinic (LINE Official)". */
  account: string;
  customerId: string;
  ownership: Ownership;
  assistant: AssistantActivity;
  handover?: HandoverSummary;
  /** Customer typing indicator (scripted). */
  customerTyping: boolean;
  unread: number;
  /** ISO time of the latest message; used for ordering. */
  lastActivityAt: string;
  /** True when the conversation is waiting for staff after hours. */
  afterHoursQueued: boolean;
  /** Booking flow for THIS conversation (mirrors CRM state; source of truth for the UI). */
  booking: BookingFlow;
  /** Which simulated CRM behaviour applies for this conversation's submissions. */
  crmBehavior: 'success' | 'timeout';
  /** Optional short staff note shown in the contact context. */
  note?: string;
}

/* ---------------------------------------------------------------------- */
/* Consultation scheduling                                                 */
/* ---------------------------------------------------------------------- */

/** A bookable consultation slot on the clinic calendar. */
export interface ClinicSlot {
  id: string; // e.g. "2026-09-18T14:00"
  startsAt: string; // ISO
  durationMin: number;
  /** Consultant label, e.g. "Consultation room 1". Illustrative only. */
  room: string;
  available: boolean;
}

export type AppointmentStatus = 'confirmed' | 'rescheduled' | 'cancelled';

/** One logical reservation in the simulated CRM. Rescheduling mutates this record
 *  (new slotId, status 'rescheduled', history entry); it never creates a second one. */
export interface Appointment {
  id: string;
  reference: string; // e.g. "MD-24817"
  conversationId: string;
  customerId: string;
  slotId: string;
  status: AppointmentStatus;
  createdAt: string;
  history: Array<{ at: string; change: 'created' | 'rescheduled' | 'cancelled'; fromSlotId?: string; toSlotId?: string }>;
}

/** Booking flow stages — separated deliberately so the UI can show each one:
 *  idle → slots_offered → customer_confirmed → submitting → (crm_success | needs_review)
 *  crm_success → confirmation_sent (once the assistant's confirmation message is delivered) */
export type BookingStage =
  | 'idle'
  | 'slots_offered'
  | 'customer_confirmed'
  | 'submitting'
  | 'crm_success'
  | 'needs_review'
  | 'confirmation_sent';

export type BookingIntent = 'book' | 'reschedule' | 'cancel';

export interface BookingFlow {
  stage: BookingStage;
  intent: BookingIntent;
  offeredSlotIds: string[];
  selectedSlotId?: string;
  /** Existing appointment when intent is reschedule/cancel. */
  appointmentId?: string;
  /** Idempotency key for the CRM request in flight / last submitted. */
  requestId?: string;
  /** Delivery state of the customer-facing confirmation message (distinct from CRM state). */
  confirmationDelivery?: DeliveryState;
  confirmationMessageId?: string;
}

/** Simulated CRM request record. `SUBMIT_BOOKING` with an existing requestId is a no-op. */
export interface CrmRequest {
  id: string;
  conversationId: string;
  intent: BookingIntent;
  slotId?: string;
  appointmentId?: string;
  submittedAt: string;
  resolution: 'auto' | 'scripted';
  status: 'pending' | 'success' | 'timeout' | 'reconciled';
  /** Populated on success/reconciled. */
  resultAppointmentId?: string;
  /** How the timeout was reconciled, if applicable. */
  reconciledOutcome?: 'was_created' | 'not_created';
}

export interface CrmState {
  connected: boolean;
  appointments: Record<string, Appointment>;
  requests: Record<string, CrmRequest>;
  /** Running counter for fictional references (deterministic). */
  nextReferenceNumber: number;
}

/* ---------------------------------------------------------------------- */
/* Knowledge library                                                       */
/* ---------------------------------------------------------------------- */

export type KnowledgeKind = 'text' | 'photo';
export type KnowledgeState = 'draft' | 'approved' | 'withdrawn';
export type KnowledgeCategory = 'facility' | 'services' | 'access' | 'hours' | 'policies' | 'consultation';

export interface LocalizedText {
  en: string;
  ko: string;
  ja?: string;
  'zh-Hans'?: string;
  'zh-Hant'?: string;
}

export interface KnowledgeItem {
  id: string;
  kind: KnowledgeKind;
  title: string;
  category: KnowledgeCategory;
  state: KnowledgeState;
  /** For text items: the approved answer content per language (fixed copy, no live translation). */
  body?: LocalizedText;
  /** For photo items. */
  photo?: {
    src: string; // local path under /photos
    alt: string;
    /** Guidance shown to staff and used by the simulated assistant to choose a photo. */
    usage: string;
    /** Provenance / licence line, e.g. "Illustrative rendering created for this demo". */
    provenance: string;
  };
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  withdrawnAt?: string;
  /** Items seeded with the demo vs. added during the session. */
  origin: 'seed' | 'session';
}

/* ---------------------------------------------------------------------- */
/* Clinic calendar & settings                                              */
/* ---------------------------------------------------------------------- */

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday

export interface WorkingHours {
  /** Per weekday; `null` = closed. Times are "HH:MM" local. */
  byWeekday: Record<Weekday, { open: string; close: string } | null>;
  /** ISO dates (YYYY-MM-DD) the clinic is closed regardless of weekday. */
  holidays: Array<{ date: string; label: string }>;
  timeZone: 'Asia/Seoul';
}

export interface EscalationRecipient {
  id: string;
  name: string;
  role: string;
  /** Simulated destination label, e.g. "KakaoTalk (simulated)" — never a real contact. */
  via: string;
  enabled: boolean;
}

export type ConnectionStatus = 'connected' | 'degraded' | 'disconnected';

export interface Settings {
  workingHours: WorkingHours;
  escalation: EscalationRecipient[];
  channels: Record<Channel, { status: ConnectionStatus; account: string }>;
  crmStatus: ConnectionStatus;
  aiPaused: boolean;
}

/* ---------------------------------------------------------------------- */
/* Notifications                                                           */
/* ---------------------------------------------------------------------- */

export type NotificationKind =
  | 'needs_human'
  | 'after_hours_queue'
  | 'booking_review'
  | 'booking_confirmed'
  | 'knowledge_approval'
  | 'info';

export interface AppNotification {
  id: string;
  at: string;
  kind: NotificationKind;
  title: string;
  body: string;
  conversationId?: string;
  knowledgeId?: string;
  read: boolean;
}

/* ---------------------------------------------------------------------- */
/* Presentation: modes, scenarios, playback                                */
/* ---------------------------------------------------------------------- */

export type DemoMode = 'guided' | 'explore';

export type ScenarioId =
  | 'inquiry-to-booking'
  | 'human-takeover'
  | 'after-hours'
  | 'reschedule-cancel'
  | 'manager-approved-photo'
  | 'booking-uncertainty';

export interface ScenarioStep {
  id: string;
  /** Short label shown in the presenter bar, e.g. "Customer confirms 14:00". */
  title: string;
  /** Optional one-line presenter note (not shown to the audience prominently). */
  note?: string;
  /** Delay before this step's actions are applied when playing (ms). Default 900. */
  delayMs?: number;
  /** Actions applied atomically, in order. */
  actions: DemoAction[];
  /** Playback pauses after this step (a meaningful decision point). */
  pauseAfter?: boolean;
}

export interface Scenario {
  id: ScenarioId;
  title: string;
  summary: string;
  /** Applied when the scenario starts, after a full reset (e.g. select a conversation, set the clock). */
  setup: DemoAction[];
  steps: ScenarioStep[];
  /** True for scenarios kept optional in the main walkthrough. */
  optional?: boolean;
}

export type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'complete';

export interface GuidedState {
  scenarioId: ScenarioId | null;
  /** Index of the NEXT step to apply. */
  stepIndex: number;
  status: PlaybackStatus;
  /** Incremented on every reset/scenario switch/mode switch; timers compare against it. */
  runId: number;
}

export type View = 'inbox' | 'knowledge' | 'settings';

export type ChannelFilter = 'all' | Channel;

export interface InboxFilters {
  channel: ChannelFilter;
  needsHumanOnly: boolean;
  search: string;
}

/* ---------------------------------------------------------------------- */
/* Root state                                                              */
/* ---------------------------------------------------------------------- */

export interface DemoState {
  /** Simulated clinic clock (ISO). Never Date.now(). */
  clock: string;
  mode: DemoMode;
  guided: GuidedState;
  role: Role;
  view: View;
  filters: InboxFilters;
  selectedConversationId: string | null;
  /** Whether the compact booking panel is open in the workspace. */
  bookingPanelOpen: boolean;
  notificationsOpen: boolean;

  customers: Record<string, Customer>;
  conversations: Record<string, Conversation>;
  /** Message ids per conversation, in chronological order. */
  messageOrder: Record<string, string[]>;
  messages: Record<string, Message>;
  slots: Record<string, ClinicSlot>;
  crm: CrmState;
  knowledge: Record<string, KnowledgeItem>;
  knowledgeOrder: string[];
  settings: Settings;
  notifications: AppNotification[];
  /** Monotonic counter for ids created at runtime (staff messages, uploads). */
  seq: number;
}

/* ---------------------------------------------------------------------- */
/* Actions                                                                 */
/* ---------------------------------------------------------------------- */

export type DemoAction =
  /* --- presentation & navigation --- */
  | { type: 'RESET_ALL' }
  | { type: 'SET_MODE'; mode: DemoMode }
  | { type: 'SET_ROLE'; role: Role }
  | { type: 'SET_VIEW'; view: View }
  | { type: 'SET_FILTERS'; filters: Partial<InboxFilters> }
  | { type: 'SELECT_CONVERSATION'; conversationId: string | null }
  | { type: 'TOGGLE_BOOKING_PANEL'; open?: boolean }
  | { type: 'TOGGLE_NOTIFICATIONS'; open?: boolean }
  | { type: 'SET_CLOCK'; iso: string }
  | { type: 'ADVANCE_CLOCK_TO_NEXT_OPENING' }

  /* --- guided playback (reducer only tracks position/status; the player owns timers) --- */
  | { type: 'START_SCENARIO'; scenarioId: ScenarioId }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  /** Marks a step as applied: advances stepIndex; sets status per `pauseAfter` / completion. */
  | { type: 'STEP_APPLIED'; stepId: string; pauseAfter: boolean; isLast: boolean }
  | { type: 'RESTART_SCENARIO' }

  /* --- conversation & messages --- */
  /** Adds (or replaces) a conversation, e.g. when a new inquiry arrives in a scenario. */
  | { type: 'UPSERT_CONVERSATION'; conversation: Conversation }
  | { type: 'SET_CUSTOMER_TYPING'; conversationId: string; typing: boolean }
  | { type: 'SET_ASSISTANT_ACTIVITY'; conversationId: string; activity: AssistantActivity }
  /** Appends a message (customer, assistant, staff or system). Increments unread for customer messages
   *  unless the conversation is selected. Updates lastActivityAt. */
  | { type: 'ADD_MESSAGE'; message: Message }
  | { type: 'SET_DELIVERY'; messageId: string; delivery: DeliveryState }
  | { type: 'MARK_READ'; conversationId: string }
  /** Staff composer submit. Ignored unless ownership === 'human'. */
  | { type: 'SEND_STAFF_MESSAGE'; conversationId: string; text: string; photoId?: string }

  /* --- ownership --- */
  /** Assistant hands over: adds handover summary, ownership → needs_human, assistant idle, discards draft. */
  | { type: 'HANDOVER'; conversationId: string; summary: HandoverSummary }
  /** Staff takes over: ownership → human, discards pending assistant draft (any activity → idle). */
  | { type: 'TAKE_OVER'; conversationId: string; by: string }
  /** Staff returns control: ownership → ai, clears handover, adds a system line. */
  | { type: 'RETURN_TO_AI'; conversationId: string; by: string }

  /* --- after hours --- */
  | { type: 'QUEUE_AFTER_HOURS'; conversationId: string }
  | { type: 'DEQUEUE_AFTER_HOURS'; conversationId: string }

  /* --- booking flow --- */
  | { type: 'OFFER_SLOTS'; conversationId: string; slotIds: string[]; intent?: BookingIntent; appointmentId?: string }
  | { type: 'SELECT_SLOT'; conversationId: string; slotId: string }
  /** Customer (or staff on their behalf) explicitly confirms the selected slot & details. */
  | { type: 'CUSTOMER_CONFIRMED'; conversationId: string }
  /** Begin a reschedule/cancel flow for an existing appointment (stage → customer_confirmed after explicit confirm). */
  | { type: 'START_CHANGE'; conversationId: string; appointmentId: string; intent: 'reschedule' | 'cancel' }
  /** Submit to the simulated CRM. Idempotent on requestId: a second dispatch with the same id is ignored.
   *  Also ignored while a request for this conversation is already pending.
   *  `resolution` = 'scripted' when a scenario step will dispatch CRM_RESULT itself; otherwise the
   *  simulated services effect resolves it after a short delay using `conversation.crmBehavior`. */
  | { type: 'SUBMIT_BOOKING'; conversationId: string; requestId: string; resolution?: 'auto' | 'scripted' }
  /** Simulated CRM answered. On success an Appointment is created/updated and a reference assigned. */
  | { type: 'CRM_RESULT'; requestId: string; result: 'success' | 'timeout' }
  /** Controlled reconciliation of a timed-out request. */
  | { type: 'RECONCILE_BOOKING'; requestId: string; outcome: 'was_created' | 'not_created' }
  /** Assistant sends the customer-facing confirmation card; tracks confirmationDelivery separately. */
  | { type: 'SEND_BOOKING_CONFIRMATION'; conversationId: string; message: Message }
  | { type: 'CANCEL_BOOKING_FLOW'; conversationId: string }

  /* --- knowledge --- */
  | { type: 'ADD_KNOWLEDGE'; item: KnowledgeItem }
  /** Only a manager may approve. The reducer enforces role === 'manager'. */
  | { type: 'APPROVE_KNOWLEDGE'; knowledgeId: string; by: string }
  | { type: 'WITHDRAW_KNOWLEDGE'; knowledgeId: string; by: string }

  /* --- settings --- */
  | { type: 'SET_AI_PAUSED'; paused: boolean }
  | { type: 'SET_WORKING_HOURS'; workingHours: WorkingHours }
  | { type: 'SET_ESCALATION_ENABLED'; recipientId: string; enabled: boolean }
  | { type: 'SET_CONNECTION_STATUS'; target: Channel | 'crm'; status: ConnectionStatus }

  /* --- notifications --- */
  | { type: 'PUSH_NOTIFICATION'; notification: AppNotification }
  | { type: 'MARK_NOTIFICATION_READ'; notificationId: string }
  | { type: 'CLEAR_NOTIFICATIONS' };

export type Dispatch = (action: DemoAction) => void;
