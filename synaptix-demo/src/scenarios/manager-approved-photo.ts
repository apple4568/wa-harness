/**
 * Scenario 5 — Manager-approved photo (knowledge governance).
 * Staff adds a draft photo → manager approves → the assistant can use it → manager withdraws it.
 */
import type { Scenario } from '../domain/types.ts';
import { createRecoveryLoungeDraft } from '../data/knowledge.ts';
import { MANAGER } from '../data/staff.ts';
import { DELAY, assistantReplies, customerSays, messagesFor, notify, setClock, step } from './helpers.ts';

const CID = 'conv-wa-sophie';
const PHOTO_ID = 'ph-recovery-lounge';
const msg = messagesFor(CID);

const draft = createRecoveryLoungeDraft('2026-09-15T10:21:00');

const m04 = msg('customer', {
  id: 'm-sophie-04',
  at: '2026-09-15T10:27:00',
  text: 'One more question — is there somewhere I can sit and rest for a bit after the consultation before I head out?',
  translationKo: '질문이 하나 더 있어요. 상담 후 나가기 전에 잠시 앉아서 쉴 수 있는 곳이 있나요?',
});

const m05 = msg('assistant', {
  id: 'm-sophie-05',
  at: '2026-09-15T10:29:00',
  kind: 'photo',
  photoId: PHOTO_ID,
  text: "Yes — there's a quiet recovery lounge right next to the consultation rooms, and you're welcome to rest there for as long as you like.",
  translationKo: '네, 상담실 바로 옆에 조용한 회복 라운지가 있어요. 원하시는 만큼 편하게 쉬셔도 됩니다.',
  sourceIds: [PHOTO_ID],
});

export const managerApprovedPhoto: Scenario = {
  id: 'manager-approved-photo',
  title: 'Manager-approved photo',
  summary:
    'Front desk uploads a new lounge photo as a draft. It stays unavailable to the assistant until the clinic manager approves it; once approved, the assistant can send it to a customer. Withdrawing it later removes it from selection without touching message history.',
  setup: [
    { type: 'SET_VIEW', view: 'knowledge' },
    { type: 'SET_ROLE', role: 'staff' },
    { type: 'SELECT_CONVERSATION', conversationId: null },
  ],
  steps: [
    step({
      id: 'add-draft',
      title: 'Staff adds "Recovery lounge" as a draft photo',
      note: 'Draft waits for manager approval — the assistant cannot select it yet.',
      delayMs: DELAY.system,
      actions: [setClock(draft.createdAt), { type: 'ADD_KNOWLEDGE', item: draft }],
      pauseAfter: true,
    }),
    step({
      id: 'manager-signs-in',
      title: 'Manager signs in (simulated)',
      note: 'Role switch — only a manager can approve.',
      delayMs: DELAY.system,
      actions: [setClock('2026-09-15T10:23:00'), { type: 'SET_ROLE', role: 'manager' }],
      pauseAfter: true,
    }),
    step({
      id: 'approve',
      title: 'Manager approves the photo',
      note: 'Now available to the assistant.',
      delayMs: DELAY.system,
      actions: [
        setClock('2026-09-15T10:24:00'),
        { type: 'APPROVE_KNOWLEDGE', knowledgeId: PHOTO_ID, by: MANAGER.id },
        notify({
          id: 'ntf-recovery-lounge-approved',
          at: '2026-09-15T10:24:00',
          kind: 'knowledge_approval',
          title: 'Photo approved · Recovery lounge',
          body: `${MANAGER.name} approved "Recovery lounge" — now available to the assistant.`,
          knowledgeId: PHOTO_ID,
        }),
      ],
      pauseAfter: true,
    }),
    step({
      id: 'open-sophie',
      title: 'Back to the inbox — Sophie Müller',
      delayMs: DELAY.quick,
      actions: [
        { type: 'SET_VIEW', view: 'inbox' },
        { type: 'SELECT_CONVERSATION', conversationId: CID },
      ],
    }),
    ...customerSays({ id: 'asks-rest', title: 'Customer asks where she can rest afterwards', message: m04 }),
    ...assistantReplies({
      id: 'send-lounge-photo',
      title: 'Assistant sends the newly approved photo',
      message: m05,
      retrieve: [PHOTO_ID, 'kb-consultation-process'],
      note: 'The photo was not selectable a minute ago.',
      pauseAfter: true,
    }),
    step({
      id: 'withdraw',
      title: 'Manager withdraws the photo',
      note: 'Withdrawn — no longer selectable; earlier message history is preserved.',
      delayMs: DELAY.system,
      actions: [
        setClock('2026-09-15T10:33:00'),
        { type: 'SET_VIEW', view: 'knowledge' },
        { type: 'WITHDRAW_KNOWLEDGE', knowledgeId: PHOTO_ID, by: MANAGER.id },
      ],
    }),
  ],
};
