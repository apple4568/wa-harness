/**
 * Knowledge library seed. Text bodies are fixed, staff-approved copy per language
 * (no live translation). Photos are illustrative vector renderings created for this demo.
 */
import type { KnowledgeItem } from '../domain/types.ts';
import { MANAGER, STAFF } from './staff.ts';

export const PHOTO_PROVENANCE = 'Illustrative vector rendering created for this demo — not a photograph of Midam Clinic';

const seedApproved = (createdAt: string, approvedAt: string) =>
  ({
    createdBy: STAFF.id,
    createdAt,
    approvedBy: MANAGER.id,
    approvedAt,
    origin: 'seed',
    state: 'approved',
  }) as const;

export const KNOWLEDGE_LIST: KnowledgeItem[] = [
  /* ------------------------------------------------------------------ */
  /* Text items                                                          */
  /* ------------------------------------------------------------------ */
  {
    id: 'kb-hours-location',
    kind: 'text',
    title: 'Opening hours & location',
    category: 'hours',
    ...seedApproved('2026-08-18T09:30:00', '2026-08-18T14:10:00'),
    body: {
      en: 'Midam Clinic is open Monday to Friday 10:00–19:00 and Saturday 10:00–15:00; we are closed on Sundays and Korean public holidays. The clinic is in Gangnam, Seoul — the exact address and directions are included with every booking confirmation.',
      ko: '미담 클리닉은 월–금 10:00–19:00, 토요일 10:00–15:00에 운영하며 일요일과 한국 공휴일은 휴무입니다. 클리닉은 서울 강남에 있으며, 정확한 주소와 오시는 길은 예약 확인 메시지와 함께 안내해 드립니다.',
      ja: 'Midam Clinicの営業時間は月〜金 10:00〜19:00、土曜 10:00〜15:00です。日曜日と韓国の祝日は休診となります。クリニックはソウル・江南（カンナム）にあり、詳しい住所とアクセスはご予約確認と一緒にご案内します。',
      'zh-Hans': 'Midam Clinic 的营业时间为周一至周五 10:00–19:00，周六 10:00–15:00；周日及韩国公众假期休息。诊所位于首尔江南，详细地址和路线会随预约确认一起发送给您。',
      'zh-Hant': 'Midam Clinic 的營業時間為週一至週五 10:00–19:00，週六 10:00–15:00；週日及韓國國定假日休息。診所位於首爾江南，詳細地址與路線會隨預約確認一併提供。',
    },
  },
  {
    id: 'kb-consultation-process',
    kind: 'text',
    title: 'How a first consultation works',
    category: 'consultation',
    ...seedApproved('2026-08-18T09:40:00', '2026-08-18T14:10:00'),
    body: {
      en: 'Every visit begins with a 30-minute consultation with a clinic consultant, who listens to your goals and skin history and explains the options available. International and first-time customers are welcome; please bring your passport for registration. Nothing is decided in chat — recommendations are made in person during the consultation.',
      ko: '모든 방문은 클리닉 상담사와의 30분 상담으로 시작합니다. 고객님의 목표와 피부 이력을 듣고 가능한 옵션을 설명해 드립니다. 외국인 고객과 첫 방문 고객 모두 환영하며, 접수를 위해 여권을 지참해 주세요. 채팅에서는 어떤 것도 결정하지 않으며, 모든 권장 사항은 상담 시 직접 안내드립니다.',
      ja: 'ご来院時は、まずクリニックのカウンセラーによる30分のカウンセリングから始まります。ご希望やお肌の状態をお伺いし、選べる選択肢をご説明します。海外からのお客様や初めての方も歓迎です。受付のためパスポートをお持ちください。チャット上で施術を決めることはなく、ご提案はカウンセリング時に直接行います。',
      'zh-Hans': '每次到访都从与诊所顾问的 30 分钟咨询开始，我们会了解您的需求和皮肤情况，并说明可选方案。欢迎海外及首次到访的顾客，请携带护照办理登记。聊天中不做任何决定，所有建议都会在咨询时当面提出。',
      'zh-Hant': '每次到訪都從與診所顧問的 30 分鐘諮詢開始，我們會了解您的需求與膚況，並說明可選擇的方案。歡迎海外及首次到訪的顧客，請攜帶護照辦理登記。聊天中不會做任何決定，所有建議都會在諮詢時當面提出。',
    },
  },
  {
    id: 'kb-services-overview',
    kind: 'text',
    title: 'Services overview (illustrative categories)',
    category: 'services',
    ...seedApproved('2026-08-19T10:05:00', '2026-08-19T16:30:00'),
    body: {
      en: 'Midam Clinic offers four general programme areas: skin consultation, laser & skin-texture programmes, lifting & contouring programmes, and post-treatment care. Whether any programme is suitable is decided only after an in-person consultation; we do not assess or recommend treatments over chat.',
      ko: '미담 클리닉은 크게 네 가지 프로그램 영역을 운영합니다: 피부 상담, 레이저·피부 결 개선 프로그램, 리프팅·윤곽 프로그램, 시술 후 관리. 어떤 프로그램이 적합한지는 대면 상담 후에만 결정되며, 채팅으로는 시술을 평가하거나 추천하지 않습니다.',
      ja: 'Midam Clinicでは大きく4つの分野をご用意しています。スキンカウンセリング、レーザー・肌質改善プログラム、リフティング・輪郭プログラム、施術後のケアです。どのプログラムが適しているかは対面カウンセリングの後にのみ決まります。チャットでの施術の判断やおすすめは行っていません。',
      'zh-Hans': 'Midam Clinic 主要提供四大类项目：皮肤咨询、激光与肤质改善项目、提拉与轮廓项目，以及治疗后护理。是否适合、适合哪种项目，都只会在当面咨询后确定；我们不会通过聊天评估或推荐治疗。',
      'zh-Hant': 'Midam Clinic 主要提供四大類療程：皮膚諮詢、雷射與膚質改善療程、拉提與輪廓療程，以及療程後護理。是否適合、適合哪種療程，都只會在當面諮詢後決定；我們不會透過聊天評估或推薦療程。',
    },
  },
  {
    id: 'kb-consultation-fee',
    kind: 'text',
    title: 'Consultation fee (illustrative)',
    category: 'consultation',
    ...seedApproved('2026-08-19T10:20:00', '2026-08-19T16:30:00'),
    body: {
      en: 'The first consultation fee is ₩30,000 — illustrative demo value. It is paid at the clinic on the day, and staff will explain at the consultation whether it is credited toward a programme.',
      ko: '초진 상담료는 ₩30,000입니다 — 데모용 예시 금액. 당일 클리닉에서 결제하며, 프로그램 비용에서 차감되는지는 상담 시 직원이 안내해 드립니다.',
      ja: '初回カウンセリング料は₩30,000です（デモ用の例示金額）。当日クリニックでお支払いいただき、プログラム費用に充当されるかはカウンセリング時にスタッフがご説明します。',
      'zh-Hans': '首次咨询费为 ₩30,000（演示用示例金额）。当天在诊所支付，是否可抵扣项目费用，工作人员会在咨询时说明。',
      'zh-Hant': '首次諮詢費為 ₩30,000（示範用示例金額）。當天於診所支付，是否可折抵療程費用，將由工作人員在諮詢時說明。',
    },
  },
  {
    id: 'kb-languages',
    kind: 'text',
    title: 'Languages we support',
    category: 'consultation',
    ...seedApproved('2026-08-20T11:00:00', '2026-08-20T15:45:00'),
    body: {
      en: 'You can message us in Japanese, Chinese (Simplified or Traditional) or English, and our front desk will reply in your language. In-person consultations are held in Korean or English; if you would like language support on the day, please tell us in advance.',
      ko: '일본어, 중국어(간체·번체), 영어로 메시지를 보내 주시면 프런트 데스크가 고객님의 언어로 답변합니다. 대면 상담은 한국어 또는 영어로 진행되며, 당일 언어 지원이 필요하시면 미리 알려 주세요.',
      ja: '日本語・中国語（簡体字／繁体字）・英語でメッセージをお送りいただけます。受付がお客様の言語で返信します。対面カウンセリングは韓国語または英語で行いますので、当日の言語サポートをご希望の場合は事前にお知らせください。',
      'zh-Hans': '您可以用日语、中文（简体或繁体）或英语给我们发消息，前台会用您的语言回复。当面咨询以韩语或英语进行，如需当天的语言协助，请提前告知我们。',
      'zh-Hant': '您可以用日文、中文（簡體或繁體）或英文傳訊息給我們，櫃檯會以您的語言回覆。當面諮詢以韓語或英語進行，如需當天的語言協助，請提前告知我們。',
    },
  },
  {
    id: 'kb-airport-access',
    kind: 'text',
    title: 'Getting here from Incheon Airport',
    category: 'access',
    ...seedApproved('2026-08-20T11:20:00', '2026-08-20T15:45:00'),
    body: {
      en: 'From Incheon International Airport, an airport limousine bus to Gangnam takes about 70–90 minutes, and a taxi about 60–80 minutes depending on traffic. By train, take the AREX to Seoul Station and transfer to the subway (about 90 minutes). Please allow extra time before your consultation.',
      ko: '인천국제공항에서 강남까지 공항 리무진 버스로 약 70–90분, 택시로는 교통 상황에 따라 약 60–80분 소요됩니다. 열차 이용 시 공항철도(AREX)로 서울역까지 이동 후 지하철로 환승하면 약 90분입니다. 상담 전 여유 시간을 두고 오시길 권장합니다.',
      ja: '仁川国際空港から江南までは、空港リムジンバスで約70〜90分、タクシーで交通状況により約60〜80分です。電車の場合は空港鉄道（AREX）でソウル駅まで行き、地下鉄に乗り換えて約90分です。カウンセリング前には余裕を持ってお越しください。',
      'zh-Hans': '从仁川国际机场到江南，乘机场大巴约 70–90 分钟，乘出租车视路况约 60–80 分钟。乘火车可搭机场铁路（AREX）到首尔站再换乘地铁，约 90 分钟。请为咨询预留充足的时间。',
      'zh-Hant': '從仁川國際機場到江南，搭乘機場巴士約 70–90 分鐘，搭計程車視路況約 60–80 分鐘。搭火車可搭機場鐵路（AREX）到首爾站再轉乘地鐵，約 90 分鐘。請在諮詢前預留充足的時間。',
    },
  },
  {
    id: 'kb-cancellation-policy',
    kind: 'text',
    title: 'Rescheduling & cancellation',
    category: 'policies',
    ...seedApproved('2026-08-21T09:15:00', '2026-08-21T13:00:00'),
    body: {
      en: 'Consultations can be rescheduled or cancelled free of charge up to 24 hours before the appointment — just message us here with your booking reference (e.g. MD-24811). Changes within 24 hours are handled by staff and may not always be possible.',
      ko: '상담 예약은 예약 시간 24시간 전까지 무료로 변경 또는 취소할 수 있습니다. 예약 번호(예: MD-24811)와 함께 이 채널로 메시지를 보내 주세요. 24시간 이내의 변경은 직원이 처리하며, 항상 가능하지는 않을 수 있습니다.',
      ja: 'カウンセリングのご予約は、予約時間の24時間前まで無料で変更・キャンセルできます。予約番号（例：MD-24811）を添えて、こちらにメッセージをお送りください。24時間以内の変更はスタッフが対応しますが、ご希望に添えない場合もあります。',
      'zh-Hans': '咨询预约可在预约时间 24 小时前免费改期或取消，请在此附上预约编号（如 MD-24811）给我们留言。24 小时以内的变更由工作人员处理，不一定都能安排。',
      'zh-Hant': '諮詢預約可在預約時間 24 小時前免費改期或取消，請在此附上預約編號（如 MD-24811）傳訊息給我們。24 小時內的變更由工作人員處理，不一定都能安排。',
    },
  },
  {
    id: 'kb-photo-policy',
    kind: 'text',
    title: 'Customer photos — the assistant does not assess them',
    category: 'policies',
    ...seedApproved('2026-08-21T09:30:00', '2026-08-21T13:00:00'),
    body: {
      en: 'The assistant never assesses photos sent by customers. If you share a photo, a staff member will look at it and follow up; any assessment of your skin happens in person during the consultation.',
      ko: '어시스턴트는 고객이 보낸 사진을 절대 평가하지 않습니다. 사진을 보내 주시면 직원이 확인 후 답변드리며, 피부 상태에 대한 판단은 상담 시 대면으로만 이루어집니다.',
      ja: 'アシスタントはお客様から送られた写真を判断することはありません。写真をお送りいただいた場合はスタッフが確認してご連絡します。お肌の評価はカウンセリング時に対面で行います。',
      'zh-Hans': '助手不会对顾客发送的照片做任何评估。如果您分享了照片，工作人员会查看并跟进；对皮肤的任何评估都会在咨询时当面进行。',
      'zh-Hant': '助理不會對顧客傳送的照片做任何評估。若您分享了照片，工作人員會查看並跟進；對膚況的任何評估都會在諮詢時當面進行。',
    },
  },
  {
    id: 'kb-medication-questions',
    kind: 'text',
    title: 'Medication & medical-condition questions',
    category: 'policies',
    state: 'draft',
    origin: 'seed',
    createdBy: STAFF.id,
    createdAt: '2026-09-11T17:05:00',
    body: {
      en: 'Questions about medication, allergies or medical conditions are answered by clinic staff only. The assistant collects the question and hands the conversation to a team member.',
      ko: '약물, 알레르기, 질환에 관한 질문은 클리닉 직원만 답변합니다. 어시스턴트는 질문을 수집한 뒤 대화를 직원에게 넘깁니다.',
      ja: 'お薬・アレルギー・持病に関するご質問は、クリニックのスタッフのみがお答えします。アシスタントはご質問を受け取り、担当スタッフへ引き継ぎます。',
      'zh-Hans': '有关用药、过敏或健康状况的问题只由诊所工作人员回答。助手会记录您的问题并转交给团队成员。',
      'zh-Hant': '有關用藥、過敏或健康狀況的問題只由診所工作人員回答。助理會記錄您的問題並轉交給團隊成員。',
    },
  },

  /* ------------------------------------------------------------------ */
  /* Photo items                                                         */
  /* ------------------------------------------------------------------ */
  {
    id: 'ph-reception',
    kind: 'photo',
    title: 'Reception & waiting area',
    category: 'facility',
    ...seedApproved('2026-08-22T10:00:00', '2026-08-22T15:20:00'),
    photo: {
      src: '/photos/reception.svg',
      alt: 'Illustration of the clinic reception desk with two waiting chairs and a plant',
      usage: 'Send when a customer asks what the clinic looks like, where to check in, or where they will wait.',
      provenance: PHOTO_PROVENANCE,
    },
  },
  {
    id: 'ph-consultation-room',
    kind: 'photo',
    title: 'Consultation room',
    category: 'facility',
    ...seedApproved('2026-08-22T10:05:00', '2026-08-22T15:20:00'),
    photo: {
      src: '/photos/consultation-room.svg',
      alt: 'Illustration of a consultation room with a desk, two chairs and a window',
      usage: 'Send when a customer asks where the consultation takes place or what to expect on arrival.',
      provenance: PHOTO_PROVENANCE,
    },
  },
  {
    id: 'ph-entrance',
    kind: 'photo',
    title: 'Clinic entrance',
    category: 'facility',
    ...seedApproved('2026-08-22T10:10:00', '2026-08-22T15:20:00'),
    photo: {
      src: '/photos/entrance.svg',
      alt: 'Illustration of the clinic street entrance with a glass door, canopy and planters',
      usage: 'Send when a customer asks how to recognise the building or find the entrance.',
      provenance: PHOTO_PROVENANCE,
    },
  },
  {
    id: 'ph-treatment-room',
    kind: 'photo',
    title: 'Treatment room',
    category: 'facility',
    state: 'draft',
    origin: 'seed',
    createdBy: STAFF.id,
    createdAt: '2026-09-12T14:30:00',
    photo: {
      src: '/photos/treatment-room.svg',
      alt: 'Illustration of a treatment room with a reclining bed, cabinet and curtain',
      usage: 'Draft — not selectable until approved. Intended for questions about what a treatment room looks like.',
      provenance: PHOTO_PROVENANCE,
    },
  },
  {
    id: 'ph-lounge',
    kind: 'photo',
    title: 'Lounge (previous layout)',
    category: 'facility',
    state: 'withdrawn',
    origin: 'seed',
    createdBy: STAFF.id,
    createdAt: '2026-08-22T10:15:00',
    approvedBy: MANAGER.id,
    approvedAt: '2026-08-22T15:20:00',
    withdrawnAt: '2026-09-08T11:40:00',
    photo: {
      src: '/photos/lounge.svg',
      alt: 'Illustration of the old lounge with a sofa, low table and tall window',
      usage: 'Withdrawn — the lounge was refurbished. Use the recovery lounge photo once it is approved.',
      provenance: PHOTO_PROVENANCE,
    },
  },
];

export const KNOWLEDGE: Record<string, KnowledgeItem> = Object.fromEntries(KNOWLEDGE_LIST.map((k) => [k.id, k]));
export const KNOWLEDGE_ORDER: string[] = KNOWLEDGE_LIST.map((k) => k.id);

/** Photo added during Scenario 5 (draft → approved → withdrawn). Exported so the scenario and tests share one definition. */
export function createRecoveryLoungeDraft(createdAt: string): KnowledgeItem {
  return {
    id: 'ph-recovery-lounge',
    kind: 'photo',
    title: 'Recovery lounge',
    category: 'facility',
    state: 'draft',
    origin: 'session',
    createdBy: STAFF.id,
    createdAt,
    photo: {
      src: '/photos/recovery-lounge.svg',
      alt: 'Illustration of the recovery lounge with two recliners, a side table and a wide window',
      usage: 'Send when a customer asks where they can rest after a consultation or treatment.',
      provenance: PHOTO_PROVENANCE,
    },
  };
}
