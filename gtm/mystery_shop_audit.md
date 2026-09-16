# 강남 피부과 외국인 문의 응답 실태 — audit spec

The artifact that replaces the cold question. Cheap to run, clinic-specific,
verifiable, and it survives after you leave the room.

Premise: the existing lead sheet already found ~26 target clinics with manual-only
WhatsApp/Kakao/LINE contact and no automation observed. Measure it instead of asserting it.

---

## 1. Sample

- 30 clinics, 강남·서초·압구정, 의원급 dermatology, **registered on KORP** as
  외국인환자 유치의료기관 (unregistered clinics have no workflow to fix).
- Split: 10 with visible foreign-language marketing, 10 hiring bilingual 상담실장,
  10 with neither (control).

## 2. Probes — 3 per clinic, same enquiry, different channel and time

Send a genuine, answerable enquiry for a real high-ticket procedure the clinic
advertises (≥ ₩1.3M — the existing ICP threshold).

| # | Channel | Timing |
|---|---|---|
| 1 | Instagram DM, English | Weekday 15:00 KST (staffed hours) |
| 2 | WhatsApp or LINE, English | Weekday 21:30 KST (after hours) |
| 3 | The clinic's own site chat / KakaoTalk 채널, English | Saturday morning |

Sample enquiry:

> Hi, I'm visiting Seoul from [city] on [dates]. I'm interested in [procedure].
> Could you tell me the price and whether you have availability that week?

Three concrete questions: price, availability, date. A reply is either useful or it isn't.

## 3. Record per probe

| Field | Values |
|---|---|
| 최초 응답 시간 | minutes; `무응답` after 72h |
| 응답 언어 | EN / KO / MT / none |
| 가격 안내 | 제시 / 내원 후 안내 / 무응답 |
| 예약 제안 | 날짜 제시 / 문의만 / 없음 |
| 후속 연락 | 있음 (몇 시간 후) / 없음 |
| 담당자 | 사람 / 자동응답 / 불명 |

Derived per clinic: median first response, out-of-hours response rate, price-quote
rate, booking-offer rate, follow-up rate, and **rank within the 30**.

## 4. Ethics and hygiene

You are a prospective patient asking a real question through a public channel, which
is fair. Keep it that way:

- Never book, never hold a slot, never waste a 상담실장's live time beyond the enquiry.
- Use a real, reachable contact. Answer if they call.
- If asked whether you are a vendor, say yes immediately.
- Do not publish individual clinic names in ranked order. Aggregate publicly;
  name the clinic only in the sheet you hand *to that clinic*.
- Do not reuse the "psychology student researching K-beauty" framing. You are a
  vendor measuring response times. Say so when asked.

## 5. Two outputs

**(a) Per-clinic result sheet — one page, Korean, handed over at the door.**

1. 귀원 결과: 3건의 문의, 최초 응답 [ ]시간 [ ]분, 가격 안내 [ ], 예약 제안 [ ], 후속 [ ]
2. 30곳 중 [N]위 · 상위 5곳 중앙값 [ ]분 vs 귀원 [ ]분
3. 놓친 것의 크기: 월 문의 [추정]건 × 객단가 [₩] × 응답 지연 구간 이탈률 — clearly
   labelled 추정치, with the assumption stated. Never invent a number.
4. 그래서 무엇을 바꾸는가: 3 bullets tied to the specific failure observed at *this*
   clinic (out-of-hours silence → 자동 1차 응답; no price → 비급여 가격표 기반 자동 견적;
   no follow-up → 자동 리마인더).
5. 저희는 건당 수수료를 받지 않습니다. 월 고정 이용료입니다. + 등록/연락처.

**(b) Aggregate report — 강남 피부과 외국인 문의 응답 실태 리포트.**

Anonymised, 6–8 pages, one strong chart (response-time distribution). This is
simultaneously the sales opener, the 학회 booth handout, the press hook and the
inbound magnet. Timing note for framing: 2025 hit 2.01M foreign patients with
dermatology +86.2% YoY, while the 10% VAT refund for foreign cosmetic procedures
ended — clinics are paying more to acquire and converting no better.

## 6. Rules for the numbers

Per the brand spec: no invented figures, no uptime or certification claims, demo data
labelled 예시 데이터. Every estimate carries its assumption inline. The credibility of
this entire play depends on the 실장 being able to check your number against her own
inbox and find it correct.
