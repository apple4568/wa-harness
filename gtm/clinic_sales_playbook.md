# Selling WA Harness into Korean aesthetic clinics

Working notes: why cold walk-ins get deflected, what to change, and the channels that
actually reach a decision maker. Product context from `brand/spec/brand_spec.md` and
`brand/research/01_existing_identity.md`. Legal constraints in
`gtm/legal_pricing_constraints.md`. Sources at the bottom.

---

## 1. The diagnosis

You are a software vendor being rejected as a broker.

Saying "외국인환자 유치 관련" at the desk classifies you, in one phrase, as the one
category Korean clinic staff are legally trained to refuse on contact (see
`legal_pricing_constraints.md` §1). "저희는 그런 거 안 합니다" is not a verdict on
your product. It is the staff closing a liability, and it is why they never look up.

Three separate failures are stacked:

| Failure | What they experience |
|---|---|
| **Mis-categorised** | The words you use put you in the 브로커 bucket. Nothing after that is heard. |
| **Wrong person** | 데스크 is not the 실장 and is not the 원장. It is the wall built to stop this exact conversation. |
| **Nothing to file** | An anonymous question with no artifact. There is no version of "yes" available to the person you are talking to. |

Everything below is about removing one of those three.

---

## 2. Reposition before you re-approach

### 2.1 WhatsApp is the wrong flag to plant in Korea

2025 foreign-patient reality: **2.01M patients, 87.2% treated in Seoul, dermatology
+86.2% YoY, and China overtook Japan for the first time** — China and Japan together
are 60.6% (~1.22M). That traffic arrives on **WeChat / 小红书 and LINE**. Domestic and
booking confirmations run on **KakaoTalk 알림톡**. Instagram DM carries the rest.

WhatsApp is real but it is the *smallest* of those lanes — English-speaking, SEA,
Middle East, US expat. A 실장 who hears "WhatsApp tool" does the arithmetic instantly:
*solves one of my five inboxes.* That is a "no" that sounds like "we'll think about it."

The brand work already reached the right conclusion — Synaptix / 클리닉 운영체제, not
WA-anything. Carry that through: **WhatsApp is one connector, not the product name,
not the pitch.**

### 2.2 "Unified inbox" is already taken — the qualification layer is not

Be honest about the competitive floor:

- **채널톡 (Channel Talk)** already unifies KakaoTalk, LINE and Instagram DM into one
  console and markets "상담 통합" directly. Generic omnichannel is their ground.
- **애프터닥 (afterdoc.ai)** owns clinic CRM — 알림톡-based automated patient messaging,
  re-visit and post-procedure management, **and it already ships a 스마트닥터 EMR
  integration.** 원장 testimonials delivered from the podium at 대미레 학회.
- Foreign-patient-specific players already exist: **메디케이메이트** (medical-tourism
  workflow CRM structured around WeChat), **위디컬 + 텔어스** (foreign-patient CRM wired
  to real-time AI interpretation), **포위드닥터** (WeChat mini-program for hospital
  booking and DB management).

So "we unify your channels" is not a wedge. What none of them is built around is the
part you already said is your job: **qualifying the foreign inquiry.**

That means, concretely: language detection and reply in-language; qualifying against
the clinic's own 비급여 price list (your lead research already used a ₩1.3M high-ticket
threshold — that logic belongs in the product); travel-window and visa questions;
timezone-aware first response; deposit capture to kill no-shows; and a clean handoff
of a *qualified, priced, date-bounded* patient into the chart. That is a different
product from an inbox, and it is defensible.

### 2.3 Pick the pricing model now, and lead with it

Flat monthly fee. Never per-lead, per-booking or per-converted-patient — that is
literally the 강남언니 fact pattern, and the 피부과 의사 who paid those fees was
convicted alongside the platform. Full reasoning in `legal_pricing_constraints.md` §2.

Then open every meeting with **"저희는 건당 수수료를 받지 않습니다. 월 고정 이용료입니다."**
Every 원장 in Gangnam knows that case. That sentence is the fastest route from
"threat to my licence" to "tool I can buy."

---

## 3. Sell to the 실장, not the 원장 (and definitely not the 데스크)

In 의원급 the 원장 owns the budget, but the **상담실장 / 총괄실장** is the user, owns the
pain, and is the internal champion. Korean clinic software gets bought 실장 → 원장,
essentially never the reverse, and never via the front desk.

- Ask for the **실장** by title. Asking cold for the 원장 marks you as someone who does
  not know how a clinic works.
- The 실장's pain is concrete and personal: five inboxes, foreign messages arriving at
  2am, no price given without her, no-shows she gets blamed for, and (per the team's
  own hypothesis list) high turnover meaning context dies when she leaves.
- Build the demo around *her* day, not the 원장's dashboard. The 원장 buys what the
  실장 says she cannot work without.

---

## 4. The wedge: stop asking questions, arrive with a finding

This is the highest-leverage thing in this document and it costs nothing but time.

Your existing lead sheet already records ~26 Gangnam/Apgujeong/Cheongdam clinics with
**manual-only WhatsApp/Kakao/LINE contact and "no chatbot/automation observed."** Turn
that observation into an artifact.

**Mystery-shop the inbound.** Message each target clinic's public WhatsApp / Instagram
DM / LINE as a genuine foreign patient with a high-ticket enquiry. Log: first-response
time, language of reply, whether a price was given, whether a booking was offered,
whether anyone followed up. Repeat across three time slots including one out-of-hours.
Spec in `gtm/mystery_shop_audit.md`.

Then the opening line is not a question, it is a finding about *them*:

> 9월 8일 오후 3시에 귀원 인스타 DM으로 영어 문의를 남겼는데 답장은 19시간 뒤에
> 왔고, 가격 안내는 없었습니다. 같은 주에 강남 12곳을 같은 방식으로 확인했고
> 귀원은 [N]위입니다. 실장님께 결과지 1장만 두고 가겠습니다.

Clinic-specific, verifiable, mildly embarrassing, and impossible to file under "we
don't do that." It gets forwarded upward, which is the only thing you need the desk
to do. Aggregate the whole set into a **강남 피부과 외국인 문의 응답 실태 리포트** — that
report is simultaneously your sales asset, your conference talk, your press hook and
your inbound engine.

**One caution.** The earlier outreach templates use a "Korea University psychology
student researching K-beauty" framing. If the same person now returns to the same 26
clinics as a vendor, that reads as a pretext and will cost more trust than it bought.
Retire the student framing and let the audit be the honest version of the same idea —
you are not pretending to research, you are showing them their own response times.

---

## 5. Channels that actually reach a decision maker

### Door A — 학회 booth (highest density of 원장 per won)

- **대한피부과의사회 추계학술대회 — 2026-12-11~13, COEX 마곡.**
  **협력업체 (vendor booth) applications: 2026-06-01 ~ 10-30.** Open now, ~6 weeks left.
- 대한피부과의사회 춘계학술대회 — 2026-03-29, 스위스그랜드호텔 (next cycle).
- 제24차 대경피부치료 학술대회 — 06-21, Daegu (regional, cheaper, less saturated).

This is the one setting where approaching a 원장 cold is socially normal. It is also
exactly how 애프터닥 built credibility — a 대표원장 giving a usage testimonial from the
podium at 대미레 학회 is worth more than any amount of walk-ins. Book the booth, then
spend the next two months earning one pilot clinic willing to stand next to you.

### Door B — the EMR integration *is* the distribution channel

"Connect straight to the API" is right, but pick the right API. Per the team's own
competitor research:

| | Scale | Posture | Verdict |
|---|---|---|---|
| **스마트닥터 (전능아이티)** | 3,527 clinics, "신규개원의 4명 중 3명", dominant in 피부·성형·미용, 40-year incumbent | No incentive to help a newcomer, but **애프터닥 already integrates with it** — precedent exists, so it is gettable | The prize. Go second. |
| **닥터팔레트 (위버케어)** | ~150 clinics, 25% 성형외과, cloud-native, doctor-founder | Growth-mode, needs differentiation, actually has a modern cloud stack to integrate against | **Go first.** Fastest yes, real API. |

Being able to print "닥터팔레트 연동" on the one-pager does more for trust than fifty
walk-ins, because it answers the documented #1 buying criterion: stability (48.16%,
n=1,030), against cloud fears of security (38.5%) and unproven-ness (19%).

Same logic for resale partners who already sit with the 원장: 개원 컨설팅 firms, 병원
전문 마케팅 대행사, aesthetic device distributors, 의료 전문 세무·노무사. Industry
write-ups are blunt that these partnerships make leads arrive automatically, and that
consultants who pair consulting with sales close ~27% better than cold reps.

### Door C — government B2B matchmaking (free credibility, slower)

Attend as a **solution provider**, not an agency:
- **Medical Korea** (MOHW + KHIDI), COEX, every March — the 2026 edition ran 667
  business-matching consultations. Office: mkconf2026@gmail.com / 02-6215-0261.
- **서울의료관광 국제트래블마트 (SITMMT)** — 서울관광재단, ~370 companies; the 2026
  edition ran 09-08~09. Seller applications open late August (sitmmt.org).
- 부산국제의료관광컨벤션 (BIMTC), August, Busan.

---

## 6. Target list: stop walking into random clinics

1. **KORP registry** (medicalkorea.or.kr/korp) — search blank to return all registered
   **외국인환자 유치의료기관**. A clinic that never registered has no foreign-patient
   workflow to fix and will not buy this. Filter to 강남·서초 의원급 피부과.
2. **Hiring signals** — clinics posting on 사람인/잡코리아 for 중국어/일본어 가능 상담실장
   or 국제진료 코디네이터 are staffing up intake *this quarter*. They have already
   decided to spend on the problem; you are offering the cheaper half of the solution.
   Warmest public cold lead available.
3. **Behavioural signals** — Japanese/Chinese Instagram or RED accounts, 강남언니 global
   listing, translated price page. Demand already arriving; channel already broken.
4. **Deprioritise** top-tier 압구정 brand clinics (in-house 국제진료팀, existing vendors).
   Mid-tier clinics with a fresh laser loan and empty afternoon slots will actually listen.
5. **Timing hook** — the 10% VAT refund on foreign cosmetic procedures sunset at end of
   2025; 대한성형외과의사회 estimates a 20–30% drop in foreign volume since. An extension
   bill sits in subcommittee. Clinics got 10% more expensive overnight and are looking
   for conversion efficiency right now. That is the sentence that makes a 원장 look up.

---

## 7. Sequence

| When | Action |
|---|---|
| This week | Fix the vocabulary (솔루션, not 유치). Lock flat-fee pricing. Kill the student-research framing. |
| → Oct 30 | **Apply for the 대한피부과의사회 추계학술대회 booth** (Dec 11–13, COEX 마곡). Hard deadline. |
| Weeks 1–2 | Run the mystery-shop audit on 30 KORP-registered 강남/서초 derm clinics. |
| Weeks 2–3 | Publish the aggregate 실태 리포트. Use per-clinic result sheets as the walk-in artifact. |
| Weeks 2–6 | Open the 닥터팔레트 integration conversation. Parallel: 3–5 coffees with 개원 컨설턴트 / device distributors. |
| Weeks 4–8 | Re-approach clinics — asking for the **실장** by title, leading with their own response time, leaving one page. |
| Weeks 6–12 | Convert one pilot into a named reference willing to speak at the December booth. |

The order matters. Vocabulary and pricing stop the instant rejection; the audit
replaces the question with a finding; the integration answers the stability objection;
the 학회 booth turns cold into warm. Walk-ins are the *last* step, not the first.

---

## Sources

- [2025년 외국인 환자 유치 200만 돌파 — 보건복지부](https://www.mohw.go.kr/board.es?mid=a10503010100&bid=0027&act=view&list_no=1490280)
- [2024년 외국인 환자 유치 117만 명 — 보건복지부](https://www.mohw.go.kr/board.es?mid=a10503010100&bid=0027&act=view&list_no=1485191)
- [2024년 외국인 환자 역대 최대…피부과·의원급·서울 — 메디게이트뉴스](https://medigatenews.com/news/4023448200)
- [채널톡, 카카오·라인 이어 인스타그램도 연동 — 한경매거진](https://magazine.hankyung.com/job-joy/article/202109280350d)
- [상담 통합이란? 카카오 상담톡부터 인스타 DM까지 — 채널톡 블로그](https://channel.io/ko/blog/articles/what-is-unified-cs-049f73c7)
- [스마트닥터 EMR과 연동되는 환자 재진유도 프로그램 — 애프터닥 블로그](https://afterdoc.ai/blog/%EC%8A%A4%EB%A7%88%ED%8A%B8%EB%8B%A5%ED%84%B0%EC%99%80-%EC%97%B0%EB%8F%99%EB%90%98%EB%8A%94-%ED%99%98%EC%9E%90-%EC%9E%AC%EC%A7%84%EC%9C%A0%EB%8F%84-%EB%B0%8F-%EC%9C%A0%EC%A7%80-%EA%B4%80%EB%A6%AC-%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%A8-%EC%B6%94%EC%B2%9C-33721)
- [피부과 원장님들이 추천하는 애프터닥 — 애프터닥 블로그](https://afterdoc.ai/blog/%ED%94%BC%EB%B6%80%EA%B3%BC-%EC%9B%90%EC%9E%A5%EB%8B%98%EB%93%A4%EC%9D%B4-%EC%A7%81%EC%A0%91-%EC%8D%A8%EB%B3%B4%EA%B3%A0-%EC%B6%94%EC%B2%9C%ED%95%98%EB%8A%94-%EC%95%A0%ED%94%84%ED%84%B0%EB%8B%A5%EC%9D%98-3%EA%B0%80%EC%A7%80-%EB%A7%A4%EB%A0%A5-63001)
- [메디케이메이트, 외국인환자 유치 서비스 확대 — 스포츠월드](https://www.sportsworldi.com/newsView/20260826516881)
- [위디컬-텔어스 AI 협력: 외국인 환자 상담·통역·사후관리 — 벤처스퀘어](https://www.venturesquare.net/1109602)
- [아이엠폼, 병원용 위챗 미니프로그램 '포위드닥터' — 뷰어스](https://theviewers.co.kr/View.aspx?No=4045573)
- [대한피부과의사회 (학술대회 일정·협력업체 신청)](https://www.xn--vb0bz3y9vbc6qsyab49c.com/)
- [Medical Korea 2026](https://mkconf.org/fairContents.do?FAIRMENU_IDX=12685&hl=KOR)
- [2026 서울의료관광 국제트래블마트 — 서울관광재단](https://www.sto.or.kr/tourism04/view?stBusinessSeq=17)
- [외국인 미용성형 부가세 환급 특례 '중단' 예고 — 데일리메디](https://www.dailymedi.com/news/news_view.php?wr_id=927583)
- [외국인 미용성형 부가세 환급 연장법, 국회 소위 회부 — 한국경제](https://www.hankyung.com/article/2026073169026)
- [외국인환자유치 정보시스템 (KORP)](https://www.medicalkorea.or.kr/korp/main.do)
- [개원 컨설팅과 영업을 잇는 전략적 접근법 — 메디킹](https://mediking.net/boards/blog_detail/349/)
- Internal: `brand/research/01_existing_identity.md` (ICP, 26-clinic lead sheet, "manual-only, no automation"), `brand/research/02_competitors.md` (스마트닥터 / 닥터팔레트 / 채널톡 profiles, EMR buying-criteria surveys)
