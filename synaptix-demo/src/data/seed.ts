/**
 * Seed state factory. Every call returns deep-fresh objects (structuredClone of the
 * module-level constants) so RESET_ALL never shares references with a previous run.
 */
import type { AppNotification, DemoState } from '../domain/types.ts';
import { CONVERSATIONS, MESSAGES, MESSAGE_ORDER } from './conversations.ts';
import { CRM } from './crm.ts';
import { CUSTOMERS } from './customers.ts';
import { KNOWLEDGE, KNOWLEDGE_ORDER } from './knowledge.ts';
import { SETTINGS } from './settings.ts';
import { SLOTS } from './slots.ts';

/** Simulated clinic clock at reset (Tuesday). */
export const DEMO_CLOCK = '2026-09-15T10:20:00';

const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'ntf-seed-daniel',
    at: '2026-09-15T09:49:00',
    kind: 'needs_human',
    title: 'Needs human · Daniel Reyes',
    body: 'Asked whether a laser programme is safe with a medical condition — the assistant handed over.',
    conversationId: 'conv-wa-daniel',
    read: false,
  },
];

export function createInitialState(): DemoState {
  return structuredClone({
    clock: DEMO_CLOCK,
    mode: 'guided',
    guided: { scenarioId: null, stepIndex: 0, status: 'idle', runId: 0 },
    role: 'staff',
    view: 'inbox',
    filters: { channel: 'all', needsHumanOnly: false, search: '' },
    selectedConversationId: null,
    bookingPanelOpen: false,
    notificationsOpen: false,

    customers: CUSTOMERS,
    conversations: CONVERSATIONS,
    messageOrder: MESSAGE_ORDER,
    messages: MESSAGES,
    slots: SLOTS,
    crm: CRM,
    knowledge: KNOWLEDGE,
    knowledgeOrder: KNOWLEDGE_ORDER,
    settings: SETTINGS,
    notifications: SEED_NOTIFICATIONS,
    seq: 1000,
  } satisfies DemoState);
}
