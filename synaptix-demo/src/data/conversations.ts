/**
 * Seeded conversations (everything except `conv-ig-misaki`, which Scenario 1 creates)
 * and their messages. Timestamps sit within the three days before the demo clock
 * (2026-09-15T10:20:00) and respect clinic opening hours.
 */
import type { BookingFlow, Conversation, Message, MessageKind } from '../domain/types.ts';
import { CHANNEL_ACCOUNTS } from './settings.ts';
import { STAFF } from './staff.ts';

/* ---------------------------------------------------------------------- */
/* Small builders                                                          */
/* ---------------------------------------------------------------------- */

type MessageInput = Omit<Message, 'conversationId' | 'delivery' | 'kind' | 'author'> & {
  kind?: MessageKind;
  delivery?: Message['delivery'];
};

const forConversation =
  (conversationId: string) =>
  (author: Message['author'], input: MessageInput): Message => ({
    conversationId,
    author,
    kind: input.kind ?? (author === 'system' ? 'system' : 'text'),
    delivery: input.delivery ?? 'delivered',
    ...input,
  });

const IDLE_BOOKING: BookingFlow = { stage: 'idle', intent: 'book', offeredSlotIds: [] };

/* ---------------------------------------------------------------------- */
/* conv-line-ken — background, resolved by the assistant, read              */
/* ---------------------------------------------------------------------- */

const ken = forConversation('conv-line-ken');
const KEN_MESSAGES: Message[] = [
  ken('customer', {
    id: 'm-ken-01',
    at: '2026-09-12T11:05:00',
    text: 'こんにちは。来週ソウルに行くのですが、予約なしで直接行ってもカウンセリングは受けられますか？営業時間も教えてください。',
    translationKo: '안녕하세요. 다음 주에 서울에 가는데, 예약 없이 바로 방문해도 상담을 받을 수 있나요? 영업시간도 알려 주세요.',
  }),
  ken('assistant', {
    id: 'm-ken-02',
    at: '2026-09-12T11:06:00',
    text: 'こんにちは、田中様。Midam Clinicの営業時間は月〜金 10:00〜19:00、土曜 10:00〜15:00です（日曜・祝日は休診）。カウンセリングは30分の予約制ですので、事前にご予約いただくと確実です。ご希望の日をお知らせいただければ、空いている時間をご案内します。',
    translationKo:
      '안녕하세요, 다나카 님. Midam Clinic 영업시간은 월–금 10:00–19:00, 토 10:00–15:00입니다(일요일·공휴일 휴무). 상담은 30분 예약제이므로 미리 예약하시면 확실합니다. 원하시는 날짜를 알려 주시면 가능한 시간을 안내해 드리겠습니다.',
    sourceIds: ['kb-hours-location', 'kb-consultation-process'],
  }),
  ken('customer', {
    id: 'm-ken-03',
    at: '2026-09-12T11:10:00',
    text: 'ありがとうございます。日程が決まったらまた連絡します。',
    translationKo: '감사합니다. 일정이 정해지면 다시 연락드릴게요.',
  }),
  ken('assistant', {
    id: 'm-ken-04',
    at: '2026-09-12T11:11:00',
    text: '承知しました。いつでもお気軽にご連絡ください。お待ちしております。',
    translationKo: '알겠습니다. 언제든지 편하게 연락 주세요. 기다리고 있겠습니다.',
    sourceIds: [],
  }),
];

/* ---------------------------------------------------------------------- */
/* conv-wa-emily — booking confirmed (MD-24811, Fri 18 Sep 15:00)           */
/* ---------------------------------------------------------------------- */

const emily = forConversation('conv-wa-emily');
const EMILY_MESSAGES: Message[] = [
  emily('customer', {
    id: 'm-emily-01',
    at: '2026-09-14T10:40:00',
    text: "Hi! I'm in Seoul this week and would love to book a first consultation. Do you have anything on Thursday or Friday?",
    translationKo: '안녕하세요! 이번 주에 서울에 있는데 첫 상담을 예약하고 싶어요. 목요일이나 금요일에 가능한 시간이 있나요?',
  }),
  emily('assistant', {
    id: 'm-emily-02',
    at: '2026-09-14T10:41:00',
    kind: 'slot_offer',
    text: 'Hi Emily, welcome! A first consultation takes about 30 minutes with one of our clinic consultants. Here are the next available times:\n• Thu 17 Sep · 11:00\n• Fri 18 Sep · 15:00\n• Sat 19 Sep · 13:00\nJust reply with the one that suits you.',
    translationKo:
      '안녕하세요 에밀리 님, 환영합니다! 첫 상담은 클리닉 상담사와 약 30분간 진행됩니다. 가장 가까운 가능 시간은 다음과 같습니다:\n• 9월 17일(목) 11:00\n• 9월 18일(금) 15:00\n• 9월 19일(토) 13:00\n편하신 시간을 답장으로 알려 주세요.',
    slotIds: ['2026-09-17T11:00', '2026-09-18T15:00', '2026-09-19T13:00'],
    sourceIds: ['kb-consultation-process'],
  }),
  emily('customer', {
    id: 'm-emily-03',
    at: '2026-09-14T10:45:00',
    text: 'Friday at 3pm works best for me.',
    translationKo: '금요일 오후 3시가 제일 좋아요.',
  }),
  emily('assistant', {
    id: 'm-emily-04',
    at: '2026-09-14T10:45:00',
    text: 'Great — just to confirm before I book it: a first consultation on Friday 18 September at 15:00, about 30 minutes, at Midam Clinic in Gangnam. Shall I go ahead?',
    translationKo:
      '좋습니다. 예약 전에 확인드릴게요: 첫 상담, 9월 18일(금) 15:00, 약 30분, 강남 미담 클리닉. 이대로 진행할까요?',
    sourceIds: ['kb-consultation-process'],
  }),
  emily('customer', {
    id: 'm-emily-05',
    at: '2026-09-14T10:47:00',
    text: 'Yes please, go ahead and book Friday 18 Sep at 15:00.',
    translationKo: '네, 9월 18일(금) 15:00으로 예약해 주세요.',
  }),
  emily('assistant', {
    id: 'm-emily-06',
    at: '2026-09-14T10:48:00',
    kind: 'booking_card',
    text: 'Your consultation is booked.\nReference MD-24811\nFri 18 Sep 2026 · 15:00 (30 min)\nMidam Clinic, Gangnam — please bring your passport. Reply here if you need to reschedule.',
    translationKo:
      '상담 예약이 완료되었습니다.\n예약 번호 MD-24811\n2026년 9월 18일(금) 15:00 (30분)\n강남 미담 클리닉 — 여권을 지참해 주세요. 변경이 필요하시면 여기로 답장해 주세요.',
    appointmentId: 'apt-emily',
    sourceIds: ['kb-consultation-process', 'kb-cancellation-policy'],
  }),
  emily('customer', {
    id: 'm-emily-07',
    at: '2026-09-14T10:50:00',
    text: 'Perfect, thank you! See you Friday.',
    translationKo: '완벽해요, 감사합니다! 금요일에 뵐게요.',
  }),
];

/* ---------------------------------------------------------------------- */
/* conv-line-chiaying — background before Scenario 2                        */
/* ---------------------------------------------------------------------- */

const chiaying = forConversation('conv-line-chiaying');
const CHIAYING_MESSAGES: Message[] = [
  chiaying('customer', {
    id: 'm-chiaying-01',
    at: '2026-09-14T12:10:00',
    text: '你好，我是從台北來的，10月初會在首爾。請問外國人也可以預約諮詢嗎？可以用中文溝通嗎？',
    translationKo: '안녕하세요, 타이베이에서 왔고 10월 초에 서울에 있을 예정이에요. 외국인도 상담 예약이 가능한가요? 중국어로 소통할 수 있나요?',
  }),
  chiaying('assistant', {
    id: 'm-chiaying-02',
    at: '2026-09-14T12:11:00',
    text: '您好，林小姐，當然可以！歡迎海外及首次到訪的顧客，請攜帶護照辦理登記。您可以用中文傳訊息給我們，櫃檯會以中文回覆；當面諮詢以韓語或英語進行，如需當天的語言協助，請提前告知我們。',
    translationKo:
      '안녕하세요, 린 님. 물론 가능합니다! 해외 고객과 첫 방문 고객 모두 환영하며, 접수를 위해 여권을 지참해 주세요. 중국어로 메시지를 보내 주시면 프런트 데스크가 중국어로 답변합니다. 대면 상담은 한국어 또는 영어로 진행되며, 당일 언어 지원이 필요하시면 미리 알려 주세요.',
    sourceIds: ['kb-languages', 'kb-consultation-process'],
  }),
  chiaying('customer', {
    id: 'm-chiaying-03',
    at: '2026-09-14T12:15:00',
    text: '好的，謝謝！我再看看日期。',
    translationKo: '네, 감사합니다! 날짜를 다시 확인해 볼게요.',
  }),
];

/* ---------------------------------------------------------------------- */
/* conv-wechat-wei — background before Scenario 3                           */
/* ---------------------------------------------------------------------- */

const wei = forConversation('conv-wechat-wei');
const WEI_MESSAGES: Message[] = [
  wei('customer', {
    id: 'm-wei-01',
    at: '2026-09-14T16:40:00',
    text: '你好，请问你们的营业时间是几点到几点？第一次咨询要多少钱？',
    translationKo: '안녕하세요, 영업시간이 몇 시부터 몇 시까지인가요? 첫 상담은 얼마인가요?',
  }),
  wei('assistant', {
    id: 'm-wei-02',
    at: '2026-09-14T16:41:00',
    text: '您好，王先生。Midam Clinic 的营业时间为周一至周五 10:00–19:00，周六 10:00–15:00，周日及韩国公众假期休息。首次咨询费为 ₩30,000（演示用示例金额），当天在诊所支付。',
    translationKo:
      '안녕하세요, 왕 님. Midam Clinic 영업시간은 월–금 10:00–19:00, 토 10:00–15:00이며 일요일과 한국 공휴일은 휴무입니다. 초진 상담료는 ₩30,000(데모용 예시 금액)이며 당일 클리닉에서 결제합니다.',
    sourceIds: ['kb-hours-location', 'kb-consultation-fee'],
  }),
  wei('customer', {
    id: 'm-wei-03',
    at: '2026-09-14T16:46:00',
    text: '好的，谢谢。',
    translationKo: '네, 감사합니다.',
  }),
];

/* ---------------------------------------------------------------------- */
/* conv-wechat-meiling — staff already handling (ownership: human)          */
/* ---------------------------------------------------------------------- */

const meiling = forConversation('conv-wechat-meiling');
const MEILING_MESSAGES: Message[] = [
  meiling('customer', {
    id: 'm-meiling-01',
    at: '2026-09-14T15:30:00',
    text: '你好，我下个月想来做皮肤咨询。第一次咨询大概是什么流程？需要付费吗？',
    translationKo: '안녕하세요, 다음 달에 피부 상담을 받으러 가고 싶어요. 첫 상담은 어떤 절차인가요? 비용이 있나요?',
  }),
  meiling('assistant', {
    id: 'm-meiling-02',
    at: '2026-09-14T15:31:00',
    text: '您好，陈女士。每次到访都从与诊所顾问的 30 分钟咨询开始，我们会了解您的需求和皮肤情况，并说明可选方案。首次咨询费为 ₩30,000（演示用示例金额），当天在诊所支付。请携带护照办理登记。',
    translationKo:
      '안녕하세요, 천 님. 모든 방문은 클리닉 상담사와의 30분 상담으로 시작하며, 고객님의 니즈와 피부 상태를 듣고 가능한 옵션을 설명해 드립니다. 초진 상담료는 ₩30,000(데모용 예시 금액)이며 당일 클리닉에서 결제합니다. 접수를 위해 여권을 지참해 주세요.',
    sourceIds: ['kb-consultation-process', 'kb-consultation-fee'],
  }),
  meiling('customer', {
    id: 'm-meiling-03',
    at: '2026-09-14T15:40:00',
    text: '好的。我妈妈想和我一起来，她只会说中文，到时候有人能帮忙吗？',
    translationKo: '네. 어머니도 같이 오시고 싶어 하시는데, 중국어밖에 못 하세요. 그날 도와주실 분이 있을까요?',
  }),
  meiling('system', {
    id: 'm-meiling-04',
    at: '2026-09-14T15:44:00',
    text: 'Kim Seo-yeon took over the conversation',
  }),
  meiling('staff', {
    id: 'm-meiling-05',
    at: '2026-09-14T15:47:00',
    text: "Hi Meiling, this is Seo-yeon from the front desk. You're very welcome to bring your mother along. Let me check with our team about Mandarin support on the day and I'll get back to you here shortly.",
    translationKo:
      '안녕하세요 메이링 님, 프런트 데스크의 서연입니다. 어머니와 함께 오셔도 좋습니다. 당일 중국어 지원이 가능한지 팀에 확인한 뒤 곧 여기로 다시 연락드리겠습니다.',
  }),
];

/* ---------------------------------------------------------------------- */
/* conv-wa-sophie — background, unread 1 (airport access answered)          */
/* ---------------------------------------------------------------------- */

const sophie = forConversation('conv-wa-sophie');
const SOPHIE_MESSAGES: Message[] = [
  sophie('customer', {
    id: 'm-sophie-01',
    at: '2026-09-14T18:20:00',
    text: "Hello! I land at Incheon on the 20th. What's the easiest way to get to your clinic from the airport?",
    translationKo: '안녕하세요! 20일에 인천에 도착해요. 공항에서 클리닉까지 가장 편하게 가는 방법이 뭔가요?',
  }),
  sophie('assistant', {
    id: 'm-sophie-02',
    at: '2026-09-14T18:21:00',
    text: "Hi Sophie! From Incheon International Airport, an airport limousine bus to Gangnam takes about 70–90 minutes, and a taxi about 60–80 minutes depending on traffic. By train, take the AREX to Seoul Station and transfer to the subway (about 90 minutes). We're open Mon–Fri 10:00–19:00 and Sat 10:00–15:00, so do allow a little extra time before your visit.",
    translationKo:
      '안녕하세요 소피 님! 인천국제공항에서 강남까지 공항 리무진 버스로 약 70–90분, 택시로는 교통 상황에 따라 약 60–80분 걸립니다. 열차는 공항철도(AREX)로 서울역까지 간 뒤 지하철로 환승하면 약 90분입니다. 영업시간은 월–금 10:00–19:00, 토 10:00–15:00이니 방문 전 여유 시간을 두시길 권장합니다.',
    sourceIds: ['kb-airport-access', 'kb-hours-location'],
  }),
  sophie('customer', {
    id: 'm-sophie-03',
    at: '2026-09-14T18:26:00',
    text: 'Perfect, thank you! The bus sounds easiest.',
    translationKo: '완벽해요, 감사합니다! 버스가 제일 편할 것 같네요.',
  }),
];

/* ---------------------------------------------------------------------- */
/* conv-wa-daniel — needs_human (medical condition), unread 2               */
/* ---------------------------------------------------------------------- */

const daniel = forConversation('conv-wa-daniel');
const DANIEL_MESSAGES: Message[] = [
  daniel('customer', {
    id: 'm-daniel-01',
    at: '2026-09-15T09:48:00',
    text: "Hi! I'm visiting Seoul in October and I'm interested in a laser programme. I have rosacea that flares up now and then — would laser be safe for me?",
    translationKo:
      '안녕하세요! 10월에 서울에 가는데 레이저 프로그램에 관심이 있어요. 가끔 악화되는 주사(rosacea)가 있는데, 레이저가 저에게 안전할까요?',
  }),
  daniel('assistant', {
    id: 'm-daniel-02',
    at: '2026-09-15T09:49:00',
    kind: 'handover',
    text: "Thanks for letting us know, Daniel. Because this involves a medical condition, it needs to be answered by clinic staff rather than by me. I've passed your question to the team and they'll reply here.",
    translationKo:
      '알려 주셔서 감사합니다, 다니엘 님. 질환과 관련된 내용이라 제가 아닌 클리닉 직원이 답변드려야 합니다. 질문을 팀에 전달했으며 이곳에서 답변드릴 예정입니다.',
    sourceIds: ['kb-consultation-process'],
  }),
  daniel('system', {
    id: 'm-daniel-03',
    at: '2026-09-15T09:49:00',
    text: 'Handed over to staff — the assistant will not reply until a team member takes over',
  }),
  daniel('customer', {
    id: 'm-daniel-04',
    at: '2026-09-15T09:55:00',
    text: 'Ok, thanks. Also — is there a fee for the first consultation?',
    translationKo: '네, 감사합니다. 그리고 첫 상담에 비용이 있나요?',
  }),
];

/* ---------------------------------------------------------------------- */
/* conv-ig-hina — seeded at customer_confirmed (Scenario 6)                 */
/* ---------------------------------------------------------------------- */

const hina = forConversation('conv-ig-hina');
const HINA_MESSAGES: Message[] = [
  hina('customer', {
    id: 'm-hina-01',
    at: '2026-09-15T10:02:00',
    text: 'はじめまして。来週ソウルに行くので、初めてのカウンセリングを予約したいです。月曜か火曜は空いていますか？',
    translationKo: '처음 뵙겠습니다. 다음 주에 서울에 가는데 첫 상담을 예약하고 싶어요. 월요일이나 화요일에 자리가 있나요?',
  }),
  hina('assistant', {
    id: 'm-hina-02',
    at: '2026-09-15T10:03:00',
    kind: 'slot_offer',
    text: 'はじめまして、中村様。初回カウンセリングは約30分です。来週の空き時間は次のとおりです。\n① 9月21日(月) 11:00\n② 9月21日(月) 14:00\n③ 9月22日(火) 11:00\nご希望の番号か日時をお知らせください。',
    translationKo:
      '처음 뵙겠습니다, 나카무라 님. 첫 상담은 약 30분입니다. 다음 주 가능 시간은 다음과 같습니다.\n① 9월 21일(월) 11:00\n② 9월 21일(월) 14:00\n③ 9월 22일(화) 11:00\n원하시는 번호나 일시를 알려 주세요.',
    slotIds: ['2026-09-21T11:00', '2026-09-21T14:00', '2026-09-22T11:00'],
    sourceIds: ['kb-consultation-process'],
  }),
  hina('customer', {
    id: 'm-hina-03',
    at: '2026-09-15T10:09:00',
    text: '②の9月21日(月) 14:00でお願いします。',
    translationKo: '②번 9월 21일(월) 14:00으로 부탁드립니다.',
  }),
  hina('assistant', {
    id: 'm-hina-04',
    at: '2026-09-15T10:10:00',
    text: 'ありがとうございます。ご予約前に内容を確認させてください。\n・初回カウンセリング（約30分）\n・9月21日(月) 14:00\n・Midam Clinic（ソウル・江南）\n・受付時にパスポートが必要です\nこちらの内容で予約を進めてよろしいでしょうか？',
    translationKo:
      '감사합니다. 예약 전에 내용을 확인해 주세요.\n・첫 상담(약 30분)\n・9월 21일(월) 14:00\n・Midam Clinic(서울 강남)\n・접수 시 여권 필요\n이 내용으로 예약을 진행해도 될까요?',
    sourceIds: ['kb-consultation-process'],
  }),
  hina('customer', {
    id: 'm-hina-05',
    at: '2026-09-15T10:14:00',
    text: 'はい、その内容でお願いします。',
    translationKo: '네, 그 내용으로 부탁드립니다.',
  }),
];

/* ---------------------------------------------------------------------- */
/* Conversations                                                           */
/* ---------------------------------------------------------------------- */

const lastAt = (messages: Message[]) => messages[messages.length - 1]!.at;

export const CONVERSATION_LIST: Conversation[] = [
  {
    id: 'conv-line-chiaying',
    channel: 'line',
    account: CHANNEL_ACCOUNTS.line,
    customerId: 'cust-chiaying',
    ownership: 'ai',
    assistant: { kind: 'idle' },
    customerTyping: false,
    unread: 0,
    lastActivityAt: lastAt(CHIAYING_MESSAGES),
    afterHoursQueued: false,
    booking: { ...IDLE_BOOKING },
    crmBehavior: 'success',
  },
  {
    id: 'conv-wechat-wei',
    channel: 'wechat',
    account: CHANNEL_ACCOUNTS.wechat,
    customerId: 'cust-wei',
    ownership: 'ai',
    assistant: { kind: 'idle' },
    customerTyping: false,
    unread: 0,
    lastActivityAt: lastAt(WEI_MESSAGES),
    afterHoursQueued: false,
    booking: { ...IDLE_BOOKING },
    crmBehavior: 'success',
  },
  {
    id: 'conv-wa-emily',
    channel: 'whatsapp',
    account: CHANNEL_ACCOUNTS.whatsapp,
    customerId: 'cust-emily',
    ownership: 'ai',
    assistant: { kind: 'idle' },
    customerTyping: false,
    unread: 0,
    lastActivityAt: lastAt(EMILY_MESSAGES),
    afterHoursQueued: false,
    booking: {
      stage: 'confirmation_sent',
      intent: 'book',
      offeredSlotIds: ['2026-09-17T11:00', '2026-09-18T15:00', '2026-09-19T13:00'],
      selectedSlotId: '2026-09-18T15:00',
      appointmentId: 'apt-emily',
      confirmationDelivery: 'delivered',
      confirmationMessageId: 'm-emily-06',
    },
    crmBehavior: 'success',
    note: 'First visit · consultation MD-24811 on Fri 18 Sep 15:00',
  },
  {
    id: 'conv-ig-hina',
    channel: 'instagram',
    account: CHANNEL_ACCOUNTS.instagram,
    customerId: 'cust-hina',
    ownership: 'ai',
    assistant: { kind: 'idle' },
    customerTyping: false,
    unread: 1,
    lastActivityAt: lastAt(HINA_MESSAGES),
    afterHoursQueued: false,
    booking: {
      stage: 'customer_confirmed',
      intent: 'book',
      offeredSlotIds: ['2026-09-21T11:00', '2026-09-21T14:00', '2026-09-22T11:00'],
      selectedSlotId: '2026-09-21T14:00',
    },
    crmBehavior: 'timeout',
  },
  {
    id: 'conv-line-ken',
    channel: 'line',
    account: CHANNEL_ACCOUNTS.line,
    customerId: 'cust-ken',
    ownership: 'ai',
    assistant: { kind: 'idle' },
    customerTyping: false,
    unread: 0,
    lastActivityAt: lastAt(KEN_MESSAGES),
    afterHoursQueued: false,
    booking: { ...IDLE_BOOKING },
    crmBehavior: 'success',
  },
  {
    id: 'conv-wa-sophie',
    channel: 'whatsapp',
    account: CHANNEL_ACCOUNTS.whatsapp,
    customerId: 'cust-sophie',
    ownership: 'ai',
    assistant: { kind: 'idle' },
    customerTyping: false,
    unread: 1,
    lastActivityAt: lastAt(SOPHIE_MESSAGES),
    afterHoursQueued: false,
    booking: { ...IDLE_BOOKING },
    crmBehavior: 'success',
  },
  {
    id: 'conv-wechat-meiling',
    channel: 'wechat',
    account: CHANNEL_ACCOUNTS.wechat,
    customerId: 'cust-meiling',
    ownership: 'human',
    handledBy: 'staff-seoyeon',
    assistant: { kind: 'idle' },
    customerTyping: false,
    unread: 0,
    lastActivityAt: lastAt(MEILING_MESSAGES),
    afterHoursQueued: false,
    booking: { ...IDLE_BOOKING },
    crmBehavior: 'success',
    note: `Checking Mandarin support for a family visit — ${STAFF.name}`,
  },
  {
    id: 'conv-wa-daniel',
    channel: 'whatsapp',
    account: CHANNEL_ACCOUNTS.whatsapp,
    customerId: 'cust-daniel',
    ownership: 'needs_human',
    assistant: { kind: 'idle' },
    handover: {
      reason: 'Customer asked whether a laser programme is safe with a medical condition (rosacea)',
      points: [
        'Visiting Seoul in October; interested in a laser programme',
        'Mentions rosacea with occasional flare-ups — individual medical judgment needed',
        'Follow-up question about the consultation fee is still unanswered',
      ],
      at: '2026-09-15T09:49:00',
    },
    customerTyping: false,
    unread: 2,
    lastActivityAt: lastAt(DANIEL_MESSAGES),
    afterHoursQueued: false,
    booking: { ...IDLE_BOOKING },
    crmBehavior: 'success',
  },
];

export const CONVERSATIONS: Record<string, Conversation> = Object.fromEntries(
  CONVERSATION_LIST.map((c) => [c.id, c]),
);

const ALL_MESSAGES: Message[] = [
  ...KEN_MESSAGES,
  ...EMILY_MESSAGES,
  ...CHIAYING_MESSAGES,
  ...WEI_MESSAGES,
  ...MEILING_MESSAGES,
  ...SOPHIE_MESSAGES,
  ...DANIEL_MESSAGES,
  ...HINA_MESSAGES,
];

export const MESSAGES: Record<string, Message> = Object.fromEntries(ALL_MESSAGES.map((m) => [m.id, m]));

export const MESSAGE_ORDER: Record<string, string[]> = Object.fromEntries(
  CONVERSATION_LIST.map((c) => [c.id, ALL_MESSAGES.filter((m) => m.conversationId === c.id).map((m) => m.id)]),
);
