/**
 * Simulated integrations (CRM + channel delivery). Mounted inside `DemoProvider`.
 *
 * - Every `crm.requests` entry that is `pending` with `resolution: 'auto'` is resolved after
 *   ~1200 ms with the conversation's `crmBehavior` ('success' | 'timeout').
 *   Scripted requests are never touched — the scenario dispatches CRM_RESULT itself.
 * - Every message with `delivery: 'sending'` moves to 'sent' (~300 ms) then 'delivered' (~400 ms).
 *
 * Timers are keyed by id and stamped with `guided.runId`; a runId change clears them all and any
 * callback whose runId is stale is a no-op.
 */
import { useEffect, useLayoutEffect, useRef } from 'react';
import type { DemoAction, DemoState } from '@/domain/types';
import type { PlaybackSpeed } from './player';

interface Scheduled {
  runId: number;
  timer: ReturnType<typeof setTimeout>;
}

export const SERVICE_DELAYS = {
  normal: { crm: 1200, sent: 300, delivered: 400 },
  instant: { crm: 10, sent: 5, delivered: 5 },
} as const;

export function useSimulatedServices(state: DemoState, dispatch: (action: DemoAction) => void, speed: PlaybackSpeed = 'normal'): void {
  const stateRef = useRef(state);
  useLayoutEffect(() => {
    stateRef.current = state;
  });
  const timersRef = useRef<Map<string, Scheduled>>(new Map());
  const runId = state.guided.runId;

  // A new run invalidates every pending timer.
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const { timer } of timers.values()) clearTimeout(timer);
      timers.clear();
    };
  }, [runId]);

  useEffect(() => {
    const timers = timersRef.current;
    const delays = SERVICE_DELAYS[speed];
    const isStale = (scheduledRunId: number) => stateRef.current.guided.runId !== scheduledRunId;

    for (const request of Object.values(state.crm.requests)) {
      if (request.status !== 'pending' || request.resolution !== 'auto') continue;
      const key = `crm:${request.id}`;
      if (timers.has(key)) continue;
      const timer = setTimeout(() => {
        timers.delete(key);
        if (isStale(runId)) return;
        const cur = stateRef.current;
        const live = cur.crm.requests[request.id];
        if (!live || live.status !== 'pending') return;
        const behaviour = cur.conversations[live.conversationId]?.crmBehavior ?? 'success';
        dispatch({ type: 'CRM_RESULT', requestId: live.id, result: behaviour });
      }, delays.crm);
      timers.set(key, { runId, timer });
    }

    for (const message of Object.values(state.messages)) {
      if (message.delivery !== 'sending') continue;
      const key = `msg:${message.id}`;
      if (timers.has(key)) continue;
      const timer = setTimeout(() => {
        if (isStale(runId)) {
          timers.delete(key);
          return;
        }
        const live = stateRef.current.messages[message.id];
        if (!live || live.delivery !== 'sending') {
          timers.delete(key);
          return;
        }
        dispatch({ type: 'SET_DELIVERY', messageId: message.id, delivery: 'sent' });
        const second = setTimeout(() => {
          timers.delete(key);
          if (isStale(runId)) return;
          const now = stateRef.current.messages[message.id];
          if (!now || now.delivery !== 'sent') return;
          dispatch({ type: 'SET_DELIVERY', messageId: message.id, delivery: 'delivered' });
        }, delays.delivered);
        timers.set(key, { runId, timer: second });
      }, delays.sent);
      timers.set(key, { runId, timer });
    }
  }, [state, dispatch, speed, runId]);

  // Clear everything on unmount.
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const { timer } of timers.values()) clearTimeout(timer);
      timers.clear();
    };
  }, []);
}
