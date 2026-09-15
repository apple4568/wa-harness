/**
 * Small builders shared by the scripted scenarios. They only produce plain
 * `DemoAction`s / `ScenarioStep`s — no timers, no state.
 */
import type { AppNotification, AssistantActivity, DemoAction, Message, ScenarioStep } from '../domain/types.ts';

export const DELAY = {
  /** Assistant "reading" indicator. */
  reading: 700,
  /** Assistant "retrieving" indicator. */
  retrieving: 900,
  /** Assistant "composing" indicator. */
  composing: 1000,
  /** Assistant message lands. */
  send: 1200,
  /** Customer typing indicator before their message. */
  typing: 1200,
  /** Generic state change (CRM, notifications, navigation). */
  system: 900,
  /** Immediate follow-up (e.g. delivery tick). */
  quick: 600,
} as const;

/* ---------------------------------------------------------------------- */
/* Actions                                                                 */
/* ---------------------------------------------------------------------- */

export const setClock = (iso: string): DemoAction => ({ type: 'SET_CLOCK', iso });

export const typing = (conversationId: string, on: boolean): DemoAction => ({
  type: 'SET_CUSTOMER_TYPING',
  conversationId,
  typing: on,
});

export const activity = (conversationId: string, act: AssistantActivity): DemoAction => ({
  type: 'SET_ASSISTANT_ACTIVITY',
  conversationId,
  activity: act,
});

export const addMessage = (message: Message): DemoAction => ({ type: 'ADD_MESSAGE', message });

export const notify = (notification: Omit<AppNotification, 'read'>): DemoAction => ({
  type: 'PUSH_NOTIFICATION',
  notification: { ...notification, read: false },
});

type MessageInput = Omit<Message, 'conversationId' | 'author' | 'kind' | 'delivery'> & {
  kind?: Message['kind'];
  delivery?: Message['delivery'];
};

/** Message factory bound to one conversation. Defaults: kind 'text', delivery 'delivered'. */
export const messagesFor =
  (conversationId: string) =>
  (author: Message['author'], input: MessageInput): Message => ({
    conversationId,
    author,
    kind: input.kind ?? (author === 'system' ? 'system' : 'text'),
    delivery: input.delivery ?? 'delivered',
    ...input,
  });

/* ---------------------------------------------------------------------- */
/* Step patterns                                                           */
/* ---------------------------------------------------------------------- */

interface CustomerSaysOptions {
  /** Step id prefix; the two steps become `${id}-typing` and `${id}`. */
  id: string;
  title: string;
  message: Message;
  /** Extra actions applied together with the message (e.g. SELECT_SLOT, CUSTOMER_CONFIRMED). */
  also?: DemoAction[];
  note?: string;
  pauseAfter?: boolean;
}

/** Typing indicator → customer message (+ clock moves to the message time). */
export function customerSays(o: CustomerSaysOptions): ScenarioStep[] {
  const cid = o.message.conversationId;
  return [
    {
      id: `${o.id}-typing`,
      title: 'Customer is typing…',
      delayMs: DELAY.system,
      actions: [typing(cid, true)],
    },
    {
      id: o.id,
      title: o.title,
      note: o.note,
      delayMs: DELAY.typing,
      actions: [typing(cid, false), setClock(o.message.at), addMessage(o.message), ...(o.also ?? [])],
      pauseAfter: o.pauseAfter,
    },
  ];
}

interface AssistantRepliesOptions {
  id: string;
  /** Title of the final "send" step. */
  title: string;
  message: Message;
  /** Knowledge ids shown during "retrieving" (defaults to the message's sourceIds). */
  retrieve?: string[];
  /** Actions applied in the same step as the message, before it (e.g. OFFER_SLOTS). */
  before?: DemoAction[];
  /** Actions applied in the same step as the message, after it. */
  after?: DemoAction[];
  note?: string;
  pauseAfter?: boolean;
}

/** reading → retrieving (sourceIds) → composing (draft id) → message lands, assistant idle. */
export function assistantReplies(o: AssistantRepliesOptions): ScenarioStep[] {
  const cid = o.message.conversationId;
  const sources = o.retrieve ?? o.message.sourceIds ?? [];
  return [
    {
      id: `${o.id}-reading`,
      title: 'Assistant reads the message',
      delayMs: DELAY.reading,
      actions: [activity(cid, { kind: 'reading' })],
    },
    {
      id: `${o.id}-retrieving`,
      title: sources.length ? 'Assistant checks approved knowledge' : 'Assistant finds no approved answer',
      delayMs: DELAY.retrieving,
      actions: [activity(cid, { kind: 'retrieving', sourceIds: sources })],
    },
    {
      id: `${o.id}-composing`,
      title: 'Assistant drafts a reply',
      delayMs: DELAY.composing,
      actions: [activity(cid, { kind: 'composing', draftMessageId: o.message.id })],
    },
    {
      id: o.id,
      title: o.title,
      note: o.note,
      delayMs: DELAY.send,
      actions: [
        setClock(o.message.at),
        ...(o.before ?? []),
        addMessage(o.message),
        activity(cid, { kind: 'idle' }),
        ...(o.after ?? []),
      ],
      pauseAfter: o.pauseAfter,
    },
  ];
}

export const step = (s: ScenarioStep): ScenarioStep => s;
