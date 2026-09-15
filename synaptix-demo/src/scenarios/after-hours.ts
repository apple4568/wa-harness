/**
 * Scenario 3 — After hours (王伟 Wang Wei, WeChat, zh-Hans).
 * Wed 23 Sep 21:40; next opening is Mon 28 Sep 10:00 (Chuseok 24–26 Sep, Sunday closed).
 */
import type { HandoverSummary, Scenario } from '../domain/types.ts';
import { STAFF } from '../data/staff.ts';
import { DELAY, assistantReplies, customerSays, messagesFor, notify, setClock, step } from './helpers.ts';

const CID = 'conv-wechat-wei';
export const AFTER_HOURS_CLOCK = '2026-09-23T21:40:00';
export const NEXT_OPENING = '2026-09-28T10:00:00';
const msg = messagesFor(CID);

const m04 = msg('customer', {
  id: 'm-wei-04',
  at: '2026-09-23T21:41:00',
  text: '你好，我最近在按医生的处方吃药。请问在吃药期间可以做你们的激光项目吗？会不会有影响？',
  translationKo: '안녕하세요, 요즘 의사 처방약을 복용 중입니다. 약을 먹는 동안 레이저 프로그램을 받아도 되나요? 영향이 있을까요?',
});

const m05 = msg('assistant', {
  id: 'm-wei-05',
  at: '2026-09-23T21:43:00',
  text: '王先生您好。关于用药期间能否进行治疗，我无法在这里判断，需要由诊所的工作人员来回答。诊所目前已下班，9月24日至26日为中秋节假期，周日休息，工作人员会在下一个营业日 9月28日（周一）10:00 之后尽快回复您。给您带来不便，敬请谅解。',
  translationKo:
    '왕 님, 안녕하세요. 복용 중인 약과 시술 병행 여부는 제가 여기서 판단할 수 없으며 클리닉 직원이 답변드려야 합니다. 현재 클리닉은 영업이 끝났고 9월 24–26일은 추석 연휴, 일요일은 휴무라 다음 영업일인 9월 28일(월) 10:00 이후 직원이 최대한 빨리 답변드리겠습니다. 불편을 드려 죄송합니다.',
  sourceIds: ['kb-hours-location'],
  needsLanguageReview: true,
});

const m06 = msg('system', {
  id: 'm-wei-06',
  at: '2026-09-23T21:43:00',
  text: 'Queued for staff — clinic closed until Mon 28 Sep 10:00 (Chuseok 24–26 Sep, Sun closed)',
});

const summary: HandoverSummary = {
  reason: 'Medication question — outside approved knowledge, received after hours',
  points: [
    'Taking prescription medication; asks whether a laser programme can be combined with it',
    'The medication guideline is still a draft, so the assistant had no approved answer',
    'Customer was told staff will follow up after the clinic reopens on Mon 28 Sep',
  ],
  at: m05.at,
};

const STAFF_REPLY =
  "Good morning Wei, this is Seo-yeon from Midam Clinic — sorry for the wait over the holiday. Questions about medication are answered by our clinic team: could you tell me the name of the medication and how long you've been taking it? I'll check with our consultant and reply here today.";

export const afterHours: Scenario = {
  id: 'after-hours',
  title: 'After hours · queued for staff',
  summary:
    'Late on Wednesday 23 Sep, a customer in Shanghai asks on WeChat whether a treatment can be combined with his medication. The medication guideline is only a draft, so the assistant does not answer it; it tells him when staff will follow up (Mon 28 Sep — after Chuseok and Sunday) and queues the conversation.',
  setup: [setClock(AFTER_HOURS_CLOCK), { type: 'SELECT_CONVERSATION', conversationId: CID }],
  steps: [
    ...customerSays({
      id: 'asks-medication',
      title: 'Customer asks about medication (21:41, clinic closed)',
      message: m04,
    }),
    ...assistantReplies({
      id: 'no-approved-answer',
      title: 'Assistant explains staff will follow up on Mon 28 Sep',
      message: m05,
      retrieve: [],
      note: 'kb-medication-questions is a draft — not retrievable. Only hours & holidays are used.',
    }),
    step({
      id: 'queue',
      title: 'Conversation queued for the next opening',
      note: 'Conversation remains queued — no further assistant replies.',
      delayMs: DELAY.system,
      actions: [
        { type: 'HANDOVER', conversationId: CID, summary },
        { type: 'QUEUE_AFTER_HOURS', conversationId: CID },
        { type: 'ADD_MESSAGE', message: m06 },
        notify({
          id: 'ntf-wei-queued',
          at: m05.at,
          kind: 'after_hours_queue',
          title: 'After-hours queue · 王伟 Wang Wei',
          body: 'Medication question received at 21:41 — queued until the clinic opens Mon 28 Sep 10:00.',
          conversationId: CID,
        }),
      ],
      pauseAfter: true,
    }),
    step({
      id: 'next-opening',
      title: 'Clock jumps to Mon 28 Sep 10:00 — clinic opens',
      note: 'Thu–Sat were Chuseok, Sunday is closed.',
      delayMs: DELAY.system,
      actions: [
        { type: 'ADVANCE_CLOCK_TO_NEXT_OPENING' },
        notify({
          id: 'ntf-wei-waiting',
          at: NEXT_OPENING,
          kind: 'needs_human',
          title: 'Queued after-hours conversation is waiting',
          body: '王伟 Wang Wei asked about medication on Wed 23 Sep — waiting since before the Chuseok break.',
          conversationId: CID,
        }),
      ],
      pauseAfter: true,
    }),
    step({
      id: 'staff-follows-up',
      title: 'Staff takes over and replies',
      delayMs: DELAY.send,
      actions: [
        setClock('2026-09-28T10:06:00'),
        { type: 'MARK_NOTIFICATION_READ', notificationId: 'ntf-wei-waiting' },
        { type: 'TAKE_OVER', conversationId: CID, by: STAFF.id },
        { type: 'DEQUEUE_AFTER_HOURS', conversationId: CID },
        { type: 'SEND_STAFF_MESSAGE', conversationId: CID, text: STAFF_REPLY },
      ],
    }),
  ],
};
