/**
 * Scenario 6 (optional) — Booking uncertainty (中村 陽菜 Nakamura Hina, Instagram, JA).
 * The CRM times out; the demo never claims success until reconciliation proves it.
 */
import type { Scenario } from '../domain/types.ts';
import { DELAY, messagesFor, notify, setClock, step } from './helpers.ts';

const CID = 'conv-ig-hina';
const REQUEST_ID = 'req-hina-1';
/** The reducer creates the appointment as `apt-${requestId}` once reconciled. */
const APPOINTMENT_ID = `apt-${REQUEST_ID}`;
const msg = messagesFor(CID);

const sysTimeout = msg('system', {
  id: 'm-hina-06',
  at: '2026-09-15T10:22:00',
  text: 'CRM did not respond — booking status needs review. No confirmation was sent to the customer',
});

const sysReconciled = msg('system', {
  id: 'm-hina-07',
  at: '2026-09-15T10:25:00',
  text: 'Reconciled with the CRM — the appointment had been created (MD-24817)',
});

const card = msg('assistant', {
  id: 'm-hina-08',
  at: '2026-09-15T10:26:00',
  kind: 'booking_card',
  delivery: 'sending',
  appointmentId: APPOINTMENT_ID,
  text: 'ご予約が確定しました。\n予約番号：MD-24817\n9月21日(月) 14:00（約30分）\nMidam Clinic（ソウル・江南）— 受付時にパスポートをお持ちください。変更が必要な場合はこちらにご連絡ください。',
  translationKo:
    '예약이 확정되었습니다.\n예약 번호: MD-24817\n9월 21일(월) 14:00 (약 30분)\nMidam Clinic(서울 강남) — 접수 시 여권을 지참해 주세요. 변경이 필요하시면 여기로 연락해 주세요.',
  sourceIds: ['kb-consultation-process', 'kb-cancellation-policy'],
  needsLanguageReview: true,
});

export const bookingUncertainty: Scenario = {
  id: 'booking-uncertainty',
  title: 'Booking uncertainty · CRM timeout',
  summary:
    'Hina has already confirmed Mon 21 Sep 14:00. The CRM does not answer in time, so the booking is flagged for review instead of being reported as confirmed. Reconciliation shows the CRM did create it, and only then is the confirmation sent.',
  optional: true,
  setup: [
    { type: 'SELECT_CONVERSATION', conversationId: CID },
    { type: 'TOGGLE_BOOKING_PANEL', open: true },
  ],
  steps: [
    step({
      id: 'submit',
      title: 'Booking submitted to CRM',
      note: 'Waiting for CRM.',
      delayMs: DELAY.system,
      actions: [
        setClock('2026-09-15T10:21:00'),
        { type: 'SUBMIT_BOOKING', conversationId: CID, requestId: REQUEST_ID, resolution: 'scripted' },
      ],
      pauseAfter: true,
    }),
    step({
      id: 'timeout',
      title: 'CRM times out — flagged for review',
      note: 'Booking status needs review — no success claimed, nothing sent to the customer.',
      delayMs: 1600,
      actions: [
        setClock(sysTimeout.at),
        { type: 'CRM_RESULT', requestId: REQUEST_ID, result: 'timeout' },
        { type: 'ADD_MESSAGE', message: sysTimeout },
        notify({
          id: 'ntf-hina-review',
          at: sysTimeout.at,
          kind: 'booking_review',
          title: 'Booking needs review · 中村 陽菜 Nakamura Hina',
          body: 'The CRM did not respond for request req-hina-1 — no confirmation was sent to the customer.',
          conversationId: CID,
        }),
      ],
      pauseAfter: true,
    }),
    step({
      id: 'reconcile',
      title: 'Staff reconciles with the CRM',
      note: 'Reconciliation reveals the CRM did create it.',
      delayMs: DELAY.system,
      actions: [
        setClock(sysReconciled.at),
        { type: 'MARK_NOTIFICATION_READ', notificationId: 'ntf-hina-review' },
        { type: 'RECONCILE_BOOKING', requestId: REQUEST_ID, outcome: 'was_created' },
        { type: 'ADD_MESSAGE', message: sysReconciled },
      ],
      pauseAfter: true,
    }),
    step({
      id: 'send-confirmation',
      title: 'Confirmation card sent — only now',
      delayMs: DELAY.send,
      actions: [setClock(card.at), { type: 'SEND_BOOKING_CONFIRMATION', conversationId: CID, message: card }],
    }),
    step({
      id: 'confirmation-delivered',
      title: 'Confirmation delivered',
      delayMs: DELAY.quick,
      actions: [{ type: 'SET_DELIVERY', messageId: card.id, delivery: 'delivered' }],
    }),
  ],
};
