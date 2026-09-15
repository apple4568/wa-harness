/**
 * TEMPORARY dev stub — deleted once src/data/seed.ts + src/scenarios land.
 * Mirrors the public API of src/state/store.tsx with a tiny local reducer.
 */
import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react';
import type { DemoAction, DemoState, Dispatch, Message } from '@/domain/types';
import type { Player } from '@/state/player';
import { createStubState } from './stubState';

interface Ctx {
  state: DemoState;
  dispatch: Dispatch;
}
const DemoContext = createContext<Ctx | null>(null);

function patchConv(state: DemoState, id: string, patch: Partial<DemoState['conversations'][string]>): DemoState {
  const conv = state.conversations[id];
  if (!conv) return state;
  return { ...state, conversations: { ...state.conversations, [id]: { ...conv, ...patch } } };
}

function append(state: DemoState, m: Message): DemoState {
  return {
    ...state,
    messages: { ...state.messages, [m.id]: m },
    messageOrder: { ...state.messageOrder, [m.conversationId]: [...(state.messageOrder[m.conversationId] ?? []), m.id] },
    conversations: { ...state.conversations, [m.conversationId]: { ...state.conversations[m.conversationId], lastActivityAt: m.at } },
  };
}

function stubReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.mode };
    case 'SET_ROLE':
      return { ...state, role: action.role };
    case 'SET_VIEW':
      return { ...state, view: action.view };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.filters } };
    case 'SELECT_CONVERSATION': {
      const next = { ...state, selectedConversationId: action.conversationId, notificationsOpen: false };
      return action.conversationId ? patchConv(next, action.conversationId, { unread: 0 }) : next;
    }
    case 'TOGGLE_BOOKING_PANEL':
      return { ...state, bookingPanelOpen: action.open ?? !state.bookingPanelOpen };
    case 'TOGGLE_NOTIFICATIONS':
      return { ...state, notificationsOpen: action.open ?? !state.notificationsOpen };
    case 'MARK_NOTIFICATION_READ':
      return { ...state, notifications: state.notifications.map((n) => (n.id === action.notificationId ? { ...n, read: true } : n)) };
    case 'TAKE_OVER': {
      const s = patchConv(state, action.conversationId, { ownership: 'human', assistant: { kind: 'idle' } });
      const id = `m-${state.seq + 1}`;
      return append(
        { ...s, seq: state.seq + 1 },
        { id, conversationId: action.conversationId, at: state.clock, author: 'system', kind: 'system', text: `${action.by} took over · AI paused for this conversation`, delivery: 'delivered' },
      );
    }
    case 'RETURN_TO_AI': {
      const s = patchConv(state, action.conversationId, { ownership: 'ai', handover: undefined });
      const id = `m-${state.seq + 1}`;
      return append({ ...s, seq: state.seq + 1 }, { id, conversationId: action.conversationId, at: state.clock, author: 'system', kind: 'system', text: `Returned to AI · ${action.by}`, delivery: 'delivered' });
    }
    case 'SEND_STAFF_MESSAGE': {
      const conv = state.conversations[action.conversationId];
      if (!conv || conv.ownership !== 'human') return state;
      const id = `m-${state.seq + 1}`;
      return append(
        { ...state, seq: state.seq + 1 },
        { id, conversationId: conv.id, at: state.clock, author: 'staff', kind: action.photoId ? 'photo' : 'text', text: action.text, photoId: action.photoId, delivery: 'sent' },
      );
    }
    case 'OFFER_SLOTS': {
      const conv = state.conversations[action.conversationId];
      if (!conv) return state;
      return patchConv(state, conv.id, { booking: { ...conv.booking, stage: 'slots_offered', offeredSlotIds: action.slotIds, selectedSlotId: undefined, intent: action.intent ?? conv.booking.intent } });
    }
    case 'SELECT_SLOT': {
      const conv = state.conversations[action.conversationId];
      if (!conv) return state;
      return patchConv(state, conv.id, { booking: { ...conv.booking, selectedSlotId: action.slotId } });
    }
    case 'CUSTOMER_CONFIRMED': {
      const conv = state.conversations[action.conversationId];
      if (!conv) return state;
      return patchConv(state, conv.id, { booking: { ...conv.booking, stage: 'customer_confirmed' } });
    }
    case 'RESET_ALL':
      return { ...createStubState(), mode: state.mode };
    default:
      return state;
  }
}

const stubPlayer: Player = {
  scenarios: [],
  scenario: null,
  stepIndex: 0,
  nextStep: undefined,
  lastStep: undefined,
  status: 'idle',
  start: () => {},
  play: () => {},
  pause: () => {},
  next: () => {},
  restart: () => {},
  setMode: () => {},
  resetAll: () => {},
};
const PlayerContext = createContext<Player>(stubPlayer);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(stubReducer, undefined, createStubState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  const player = useMemo<Player>(
    () => ({
      ...stubPlayer,
      setMode: (mode) => dispatch({ type: 'SET_MODE', mode }),
      resetAll: () => dispatch({ type: 'RESET_ALL' }),
    }),
    [],
  );
  return (
    <DemoContext.Provider value={value}>
      <PlayerContext.Provider value={player}>{children}</PlayerContext.Provider>
    </DemoContext.Provider>
  );
}

export function useDemo(): Ctx {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo outside provider');
  return ctx;
}

export function usePlayer(): Player {
  return useContext(PlayerContext);
}
