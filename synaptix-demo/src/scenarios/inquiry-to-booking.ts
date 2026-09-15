/**
 * Scenario 1 — Instagram inquiry to confirmed booking (佐藤 美咲 Sato Misaki, JA).
 * The conversation does not exist in the seed; the first step creates it.
 */
import type { Conversation, Scenario } from '../domain/types.ts';
import { CHANNEL_ACCOUNTS } from '../data/settings.ts';
import { DELAY, assistantReplies, customerSays, messagesFor, setClock, step } from './helpers.ts';

const CID = 'conv-ig-misaki';
const REQUEST_ID = 'req-misaki-1';
/** The reducer creates the appointment as `apt-${requestId}` on CRM success. */
const APPOINTMENT_ID = `apt-${REQUEST_ID}`;
const OFFERED = ['2026-09-17T14:00', '2026-09-18T11:00', '2026-09-19T11:00'];
const CHOSEN = '2026-09-17T14:00';

const msg = messagesFor(CID);

const conversation: Conversation = {
  id: CID,
  channel: 'instagram',
  account: CHANNEL_ACCOUNTS.instagram,
  customerId: 'cust-misaki',
  ownership: 'ai',
  assistant: { kind: 'idle' },
  customerTyping: false,
  unread: 0,
  lastActivityAt: '2026-09-15T10:21:00',
  afterHoursQueued: false,
  booking: { stage: 'idle', intent: 'book', offeredSlotIds: [] },
  crmBehavior: 'success',
};

const m01 = msg('customer', {
  id: 'm-misaki-01',
  at: '2026-09-15T10:21:00',
  text: 'はじめまして。インスタでクリニックを見つけました。日本から初めて行くのですが、外国人でも大丈夫ですか？どんなクリニックか教えてください。',
  translationKo: '처음 뵙겠습니다. 인스타그램에서 클리닉을 봤어요. 일본에서 처음 가는데 외국인도 괜찮나요? 어떤 클리닉인지 알려 주세요.',
});

const m02 = msg('assistant', {
  id: 'm-misaki-02',
  at: '2026-09-15T10:23:00',
  text: 'はじめまして、佐藤様。Midam Clinicはソウル・江南（カンナム）にあり、営業時間は月〜金 10:00〜19:00、土曜 10:00〜15:00です。海外からのお客様や初めての方も歓迎で、日本語でメッセージをお送りいただけます。ご来院時はまずカウンセラーによる30分のカウンセリングから始まり、受付のためパスポートをお持ちいただいています。',
  translationKo:
    '처음 뵙겠습니다, 사토 님. Midam Clinic은 서울 강남에 있으며 영업시간은 월–금 10:00–19:00, 토 10:00–15:00입니다. 해외 고객과 첫 방문 고객 모두 환영하며, 일본어로 메시지를 보내셔도 됩니다. 방문 시 먼저 상담사와 30분 상담을 진행하며, 접수를 위해 여권을 지참해 주시면 됩니다.',
  sourceIds: ['kb-hours-location', 'kb-languages', 'kb-consultation-process'],
});

const m03 = msg('assistant', {
  id: 'm-misaki-03',
  at: '2026-09-15T10:23:00',
  kind: 'photo',
  photoId: 'ph-reception',
  text: 'こちらが受付と待合スペースです。',
  translationKo: '이곳이 접수처와 대기 공간입니다.',
  sourceIds: ['ph-reception'],
});

const m04 = msg('customer', {
  id: 'm-misaki-04',
  at: '2026-09-15T10:26:00',
  text: '素敵ですね！今週か来週にカウンセリングをお願いしたいです。空いている日はありますか？',
  translationKo: '멋지네요! 이번 주나 다음 주에 상담을 받고 싶어요. 가능한 날이 있나요?',
});

const m05 = msg('assistant', {
  id: 'm-misaki-05',
  at: '2026-09-15T10:28:00',
  kind: 'slot_offer',
  slotIds: OFFERED,
  text: 'ありがとうございます。初回カウンセリングは約30分です。直近の空き時間は次のとおりです。\n① 9月17日(木) 14:00\n② 9月18日(金) 11:00\n③ 9月19日(土) 11:00\nご希望の番号か日時をお知らせください。',
  translationKo:
    '감사합니다. 첫 상담은 약 30분입니다. 가장 가까운 가능 시간은 다음과 같습니다.\n① 9월 17일(목) 14:00\n② 9월 18일(금) 11:00\n③ 9월 19일(토) 11:00\n원하시는 번호나 일시를 알려 주세요.',
  sourceIds: ['kb-consultation-process'],
});

const m06 = msg('customer', {
  id: 'm-misaki-06',
  at: '2026-09-15T10:31:00',
  text: '①の9月17日(木) 14:00でお願いします。',
  translationKo: '①번 9월 17일(목) 14:00으로 부탁드립니다.',
});

const m07 = msg('assistant', {
  id: 'm-misaki-07',
  at: '2026-09-15T10:32:00',
  text: 'ありがとうございます。ご予約前に内容を確認させてください。\n・初回カウンセリング（約30分）\n・9月17日(木) 14:00\n・Midam Clinic（ソウル・江南）\n・受付時にパスポートが必要です\nこちらの内容で予約を進めてよろしいでしょうか？',
  translationKo:
    '감사합니다. 예약 전에 내용을 확인해 주세요.\n・첫 상담(약 30분)\n・9월 17일(목) 14:00\n・Midam Clinic(서울 강남)\n・접수 시 여권 필요\n이 내용으로 예약을 진행해도 될까요?',
  sourceIds: ['kb-consultation-process'],
});

const m08 = msg('customer', {
  id: 'm-misaki-08',
  at: '2026-09-15T10:34:00',
  text: 'はい、お願いします。9月17日(木) 14:00で予約してください。',
  translationKo: '네, 부탁드립니다. 9월 17일(목) 14:00으로 예약해 주세요.',
});

const m09 = msg('assistant', {
  id: 'm-misaki-09',
  at: '2026-09-15T10:36:00',
  kind: 'booking_card',
  delivery: 'sending',
  appointmentId: APPOINTMENT_ID,
  text: 'ご予約が確定しました。\n予約番号：MD-24817\n9月17日(木) 14:00（約30分）\nMidam Clinic（ソウル・江南）— 受付時にパスポートをお持ちください。変更が必要な場合はこちらにご連絡ください。',
  translationKo:
    '예약이 확정되었습니다.\n예약 번호: MD-24817\n9월 17일(목) 14:00 (약 30분)\nMidam Clinic(서울 강남) — 접수 시 여권을 지참해 주세요. 변경이 필요하시면 여기로 연락해 주세요.',
  sourceIds: ['kb-consultation-process', 'kb-cancellation-policy'],
  needsLanguageReview: true,
});

export const inquiryToBooking: Scenario = {
  id: 'inquiry-to-booking',
  title: 'Instagram inquiry → confirmed booking',
  summary:
    'A first-time customer from Tokyo writes in Japanese on Instagram. The assistant answers from approved knowledge, shares an approved photo, offers consultation slots, gets an explicit confirmation, submits to the CRM and sends the confirmation only after the CRM succeeds.',
  setup: [{ type: 'SELECT_CONVERSATION', conversationId: null }],
  steps: [
    step({
      id: 'inquiry-arrives',
      title: 'New Instagram inquiry arrives',
      note: 'Unread badge appears in the inbox; nothing is selected yet.',
      delayMs: DELAY.system,
      actions: [
        setClock(m01.at),
        { type: 'UPSERT_CONVERSATION', conversation },
        { type: 'ADD_MESSAGE', message: m01 },
      ],
      pauseAfter: true,
    }),
    step({
      id: 'staff-opens',
      title: 'Staff opens the conversation',
      delayMs: DELAY.quick,
      actions: [{ type: 'SELECT_CONVERSATION', conversationId: CID }],
    }),
    ...assistantReplies({
      id: 'reply-intro',
      title: 'Assistant replies in Japanese',
      message: m02,
      note: 'Sources: hours & location, languages, consultation process.',
    }),
    step({
      id: 'send-reception-photo',
      title: 'Assistant sends the approved reception photo',
      note: 'Only approved photos are selectable — the draft treatment-room photo is not.',
      delayMs: DELAY.send,
      actions: [{ type: 'ADD_MESSAGE', message: m03 }],
      pauseAfter: true,
    }),
    ...customerSays({ id: 'asks-consultation', title: 'Customer asks for a consultation', message: m04 }),
    ...assistantReplies({
      id: 'offer-slots',
      title: 'Assistant offers three consultation slots',
      message: m05,
      before: [{ type: 'OFFER_SLOTS', conversationId: CID, slotIds: OFFERED, intent: 'book' }],
      note: 'Booking panel: stage "Slots offered".',
      pauseAfter: true,
    }),
    ...customerSays({
      id: 'picks-slot',
      title: 'Customer chooses Thu 17 Sep 14:00',
      message: m06,
      also: [{ type: 'SELECT_SLOT', conversationId: CID, slotId: CHOSEN }],
    }),
    ...assistantReplies({
      id: 'restate',
      title: 'Assistant restates the details and asks for confirmation',
      message: m07,
    }),
    ...customerSays({
      id: 'confirms',
      title: 'Customer explicitly confirms',
      message: m08,
      also: [{ type: 'CUSTOMER_CONFIRMED', conversationId: CID }],
      note: 'Nothing has been sent to the CRM yet.',
      pauseAfter: true,
    }),
    step({
      id: 'submit-crm',
      title: 'Booking submitted to CRM',
      delayMs: DELAY.system,
      actions: [{ type: 'SUBMIT_BOOKING', conversationId: CID, requestId: REQUEST_ID, resolution: 'scripted' }],
    }),
    step({
      id: 'crm-success',
      title: 'CRM confirms — MD-24817 created',
      note: 'Reference comes from the CRM; the customer has not been told yet.',
      delayMs: 1400,
      actions: [{ type: 'CRM_RESULT', requestId: REQUEST_ID, result: 'success' }],
      pauseAfter: true,
    }),
    step({
      id: 'compose-confirmation',
      title: 'Assistant drafts the confirmation',
      delayMs: DELAY.composing,
      actions: [{ type: 'SET_ASSISTANT_ACTIVITY', conversationId: CID, activity: { kind: 'composing', draftMessageId: m09.id } }],
    }),
    step({
      id: 'send-confirmation',
      title: 'Confirmation card sent to the customer',
      delayMs: DELAY.send,
      actions: [
        setClock(m09.at),
        { type: 'SEND_BOOKING_CONFIRMATION', conversationId: CID, message: m09 },
        { type: 'SET_ASSISTANT_ACTIVITY', conversationId: CID, activity: { kind: 'idle' } },
      ],
    }),
    step({
      id: 'confirmation-delivered',
      title: 'Confirmation delivered',
      note: 'Booking stage → "Confirmation sent".',
      delayMs: DELAY.quick,
      actions: [{ type: 'SET_DELIVERY', messageId: m09.id, delivery: 'delivered' }],
    }),
  ],
};
