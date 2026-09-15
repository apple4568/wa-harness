/**
 * Scenario 2 — Human takeover (林佳穎 Lin Chia-ying, LINE, zh-Hant).
 * The customer asks for an individual assessment; the assistant hands over instead of judging.
 */
import type { HandoverSummary, Scenario } from '../domain/types.ts';
import { STAFF } from '../data/staff.ts';
import { DELAY, assistantReplies, customerSays, messagesFor, notify, setClock, step } from './helpers.ts';

const CID = 'conv-line-chiaying';
const NOTIFICATION_ID = 'ntf-chiaying-handover';
const msg = messagesFor(CID);

const m04 = msg('customer', {
  id: 'm-chiaying-04',
  at: '2026-09-15T10:22:00',
  text: '你好，又是我。我的皮膚比較敏感，容易泛紅。想請問你們的雷射療程適合我嗎？如果可以的話，想直接跟工作人員談一下。',
  translationKo:
    '안녕하세요, 또 저예요. 제 피부가 민감한 편이고 쉽게 붉어져요. 레이저 프로그램이 저에게 맞을까요? 가능하면 직원분과 직접 이야기하고 싶어요.',
});

const m05 = msg('assistant', {
  id: 'm-chiaying-05',
  at: '2026-09-15T10:24:00',
  kind: 'handover',
  text: '林小姐您好，謝謝您的說明。是否適合個別的膚況，我無法在這裡判斷，這需要由診所的專業人員當面評估。我已將您的問題轉給工作人員，他們會在這裡回覆您。',
  translationKo:
    '린 님, 안녕하세요. 설명해 주셔서 감사합니다. 개별 피부 상태에 적합한지는 제가 여기서 판단할 수 없으며, 클리닉 전문 직원이 직접 평가해야 합니다. 질문을 직원에게 전달했으니 이곳에서 답변드릴 예정입니다.',
  sourceIds: ['kb-services-overview', 'kb-consultation-process'],
  needsLanguageReview: true,
});

const summary: HandoverSummary = {
  reason: 'Customer asked whether a laser programme suits her sensitive skin and wants to speak with staff',
  points: [
    'Describes her skin as sensitive and prone to redness (her own words)',
    'Interested in laser & skin-texture programmes; visiting Seoul in early October',
    'Explicitly asked to talk to a staff member',
  ],
  at: m05.at,
};

/** What Seo-yeon actually types: her own language, Korean. */
const STAFF_REPLY_KO =
  '린자잉 님, 안녕하세요. Midam Clinic 프런트의 서연입니다. 피부에 대해 말씀해 주셔서 감사합니다. 시술이 적합한지는 상담사가 직접 보고 판단해야 해서 채팅으로는 말씀드리기 어렵습니다. 원하시면 10월 초로 상담을 예약해 드리고, 피부가 민감하시다는 점을 메모로 남겨 상담사가 미리 확인할 수 있도록 하겠습니다.';

/** What the customer receives: the assistant translates Seo-yeon's Korean into her language. */
const STAFF_REPLY_ZH =
  '林小姐您好，我是 Midam Clinic 櫃檯的徐妍。謝謝您告訴我們您的膚況。療程是否適合，需要由諮詢師當面評估，這部分無法在聊天中判斷。若您願意，我可以為您預約十月初的諮詢，並在紀錄中註明您的皮膚較為敏感，讓諮詢師事先掌握。';

export const humanTakeover: Scenario = {
  id: 'human-takeover',
  title: 'Human takeover',
  summary:
    'A customer from Taipei asks on LINE whether a laser programme suits her sensitive skin and wants to talk to staff. The assistant declines to judge, hands over with a summary, and the front desk takes the conversation.',
  setup: [{ type: 'SELECT_CONVERSATION', conversationId: null }],
  steps: [
    ...customerSays({
      id: 'asks-suitability',
      title: 'Customer asks if a laser programme suits her skin',
      message: m04,
      note: 'Individual suitability is outside what the assistant may answer.',
    }),
    ...assistantReplies({
      id: 'handover-reply',
      title: 'Assistant declines to assess and announces a handover',
      message: m05,
    }),
    step({
      id: 'handover',
      title: 'Ownership → Needs human · staff notified',
      note: 'Presenter clicks the notification, or press Next.',
      delayMs: DELAY.system,
      actions: [
        { type: 'HANDOVER', conversationId: CID, summary },
        notify({
          id: NOTIFICATION_ID,
          at: m05.at,
          kind: 'needs_human',
          title: 'Needs human · 林佳穎 Lin Chia-ying',
          body: 'Asked whether a laser programme suits her sensitive skin — individual assessment needed.',
          conversationId: CID,
        }),
      ],
      pauseAfter: true,
    }),
    step({
      id: 'staff-opens',
      title: 'Staff opens the conversation',
      note: 'Staff reviews the handover summary before replying.',
      delayMs: DELAY.quick,
      actions: [
        { type: 'SELECT_CONVERSATION', conversationId: CID },
        { type: 'MARK_NOTIFICATION_READ', notificationId: NOTIFICATION_ID },
      ],
      pauseAfter: true,
    }),
    step({
      id: 'take-over',
      title: 'Staff takes over',
      note: 'Assistant is silenced for this conversation; composer switches to staff.',
      delayMs: DELAY.system,
      actions: [setClock('2026-09-15T10:27:00'), { type: 'TAKE_OVER', conversationId: CID, by: STAFF.id }],
      pauseAfter: true,
    }),
    step({
      id: 'staff-replies',
      title: 'Staff replies personally — in Korean, delivered in Chinese',
      note: 'Seo-yeon types Korean. The assistant translates on send, so the customer reads Traditional Chinese and staff keep the Korean original.',
      delayMs: DELAY.send,
      actions: [
        setClock('2026-09-15T10:29:00'),
        { type: 'SEND_STAFF_MESSAGE', conversationId: CID, text: STAFF_REPLY_KO, translatedText: STAFF_REPLY_ZH },
      ],
      pauseAfter: true,
    }),
    step({
      id: 'return-to-ai',
      title: 'Staff returns control to AI',
      note: 'Optional — the handover summary is cleared and the assistant resumes.',
      delayMs: DELAY.system,
      actions: [setClock('2026-09-15T10:31:00'), { type: 'RETURN_TO_AI', conversationId: CID, by: STAFF.id }],
    }),
  ],
};
