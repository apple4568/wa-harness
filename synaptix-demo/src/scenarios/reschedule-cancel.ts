/**
 * Scenario 4 — Reschedule (Emily Carter, WhatsApp, EN).
 * Moves MD-24811 from Fri 18 Sep 15:00 to Mon 21 Sep 16:00 — same appointment record.
 * Cancellation is available as an explore-mode action in the booking panel.
 */
import type { Scenario } from '../domain/types.ts';
import { DELAY, assistantReplies, customerSays, messagesFor, setClock, step } from './helpers.ts';

const CID = 'conv-wa-emily';
const APPOINTMENT_ID = 'apt-emily';
const REQUEST_ID = 'req-emily-resched-1';
const OFFERED = ['2026-09-21T14:00', '2026-09-21T16:00', '2026-09-22T11:00'];
const CHOSEN = '2026-09-21T16:00';
const msg = messagesFor(CID);

const m08 = msg('customer', {
  id: 'm-emily-08',
  at: '2026-09-15T10:22:00',
  text: "Hi again! Something's come up at work on Friday. Could I move my consultation to next week instead?",
  translationKo: '안녕하세요, 또 연락드려요! 금요일에 회사 일이 생겼어요. 상담을 다음 주로 옮길 수 있을까요?',
});

const m09 = msg('assistant', {
  id: 'm-emily-09',
  at: '2026-09-15T10:24:00',
  kind: 'slot_offer',
  slotIds: OFFERED,
  text: 'Of course, Emily — your Friday consultation (MD-24811, Fri 18 Sep 15:00) can be moved free of charge. Here are next week\'s openings:\n• Mon 21 Sep · 14:00\n• Mon 21 Sep · 16:00\n• Tue 22 Sep · 11:00\nWhich one suits you?',
  translationKo:
    '물론이죠, 에밀리 님. 금요일 상담(MD-24811, 9월 18일(금) 15:00)은 무료로 변경할 수 있습니다. 다음 주 가능 시간은 다음과 같습니다:\n• 9월 21일(월) 14:00\n• 9월 21일(월) 16:00\n• 9월 22일(화) 11:00\n어느 시간이 좋으세요?',
  sourceIds: ['kb-cancellation-policy'],
});

const m10 = msg('customer', {
  id: 'm-emily-10',
  at: '2026-09-15T10:27:00',
  text: 'Monday at 4pm please.',
  translationKo: '월요일 오후 4시로 부탁드려요.',
});

const m11 = msg('assistant', {
  id: 'm-emily-11',
  at: '2026-09-15T10:28:00',
  text: 'To confirm the change: your consultation moves from Fri 18 Sep 15:00 to Mon 21 Sep 16:00, same reference MD-24811, 30 minutes at Midam Clinic in Gangnam. Shall I update the booking?',
  translationKo:
    '변경 내용을 확인해 주세요: 상담이 9월 18일(금) 15:00에서 9월 21일(월) 16:00으로 이동하며, 예약 번호는 MD-24811 그대로, 강남 미담 클리닉에서 30분입니다. 예약을 변경할까요?',
  sourceIds: ['kb-cancellation-policy'],
});

const m12 = msg('customer', {
  id: 'm-emily-12',
  at: '2026-09-15T10:30:00',
  text: 'Yes, please move it to Monday 21 Sep at 16:00.',
  translationKo: '네, 9월 21일(월) 16:00으로 옮겨 주세요.',
});

const m13 = msg('assistant', {
  id: 'm-emily-13',
  at: '2026-09-15T10:32:00',
  kind: 'booking_card',
  delivery: 'sending',
  appointmentId: APPOINTMENT_ID,
  text: 'Your consultation has been rescheduled.\nReference MD-24811\nMon 21 Sep 2026 · 16:00 (30 min) — previously Fri 18 Sep 15:00\nMidam Clinic, Gangnam — please bring your passport.',
  translationKo:
    '상담 일정이 변경되었습니다.\n예약 번호 MD-24811\n2026년 9월 21일(월) 16:00 (30분) — 기존 9월 18일(금) 15:00\n강남 미담 클리닉 — 여권을 지참해 주세요.',
  sourceIds: ['kb-cancellation-policy', 'kb-consultation-process'],
});

export const rescheduleCancel: Scenario = {
  id: 'reschedule-cancel',
  title: 'Reschedule an existing booking',
  summary:
    'Emily asks to move Friday\'s consultation (MD-24811) to next week. The assistant offers alternatives, asks for an explicit confirmation and updates the same appointment in the CRM — the reference never changes. Cancellation is available as an explore-mode action in the booking panel.',
  setup: [
    { type: 'SELECT_CONVERSATION', conversationId: CID },
    { type: 'TOGGLE_BOOKING_PANEL', open: true },
  ],
  steps: [
    ...customerSays({ id: 'asks-move', title: 'Customer asks to move Friday\'s consultation', message: m08 }),
    ...assistantReplies({
      id: 'offer-alternatives',
      title: 'Assistant offers next week\'s slots',
      message: m09,
      before: [
        { type: 'START_CHANGE', conversationId: CID, appointmentId: APPOINTMENT_ID, intent: 'reschedule' },
        { type: 'OFFER_SLOTS', conversationId: CID, slotIds: OFFERED, intent: 'reschedule', appointmentId: APPOINTMENT_ID },
      ],
      note: 'Booking panel shows the existing MD-24811 and intent "Reschedule".',
      pauseAfter: true,
    }),
    ...customerSays({
      id: 'picks-monday',
      title: 'Customer picks Mon 21 Sep 16:00',
      message: m10,
      also: [{ type: 'SELECT_SLOT', conversationId: CID, slotId: CHOSEN }],
    }),
    ...assistantReplies({
      id: 'restate-change',
      title: 'Assistant restates old vs new and asks for confirmation',
      message: m11,
    }),
    ...customerSays({
      id: 'confirms-change',
      title: 'Customer explicitly confirms the change',
      message: m12,
      also: [{ type: 'CUSTOMER_CONFIRMED', conversationId: CID }],
      pauseAfter: true,
    }),
    step({
      id: 'submit-change',
      title: 'Change submitted to CRM',
      delayMs: DELAY.system,
      actions: [{ type: 'SUBMIT_BOOKING', conversationId: CID, requestId: REQUEST_ID, resolution: 'scripted' }],
    }),
    step({
      id: 'crm-success',
      title: 'CRM updates MD-24811 — same record, new slot',
      note: 'Fri 18 Sep 15:00 is released; Mon 21 Sep 16:00 is taken.',
      delayMs: 1400,
      actions: [{ type: 'CRM_RESULT', requestId: REQUEST_ID, result: 'success' }],
      pauseAfter: true,
    }),
    step({
      id: 'send-confirmation',
      title: 'Updated confirmation card sent',
      delayMs: DELAY.send,
      actions: [setClock(m13.at), { type: 'SEND_BOOKING_CONFIRMATION', conversationId: CID, message: m13 }],
    }),
    step({
      id: 'confirmation-delivered',
      title: 'Confirmation delivered',
      delayMs: DELAY.quick,
      actions: [{ type: 'SET_DELIVERY', messageId: m13.id, delivery: 'delivered' }],
    }),
  ],
};
