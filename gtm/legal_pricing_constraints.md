# The legal fork that decides WA Harness's pricing model

Read this before the next sales conversation. It is not background — it determines
what you are allowed to charge, and it is the reason the front desk shuts you down.

---

## 1. Why "foreign patient intake" is the worst possible opening line

Two statutes make patient-brokering criminal in Korea, and clinic staff are trained
to terminate that conversation on contact:

- **의료법 제27조 제3항** — introducing, soliciting or brokering patients to a medical
  institution *for profit* is prohibited. Up to **3 years / ₩30M**. The clinic that
  pays is liable too.
- **의료해외진출법** — attracting *foreign* patients without 유치업자 registration:
  up to **3 years / ₩30M**, names publicly disclosed, commissions confiscated. The
  clinic taking patients from an unregistered broker faces suspension of its
  foreign-patient business (1–3 months first offence) or registration cancellation.

When you walk in and say "외국인환자 유치 관련" you have self-identified as the single
category the desk must refuse. They are not evaluating your software. They are closing
a liability, which is why they never look up. You are a vendor being rejected as a broker.

**Fix the sentence.** Say 솔루션 / 프로그램 / 상담 관리 시스템 and name the workflow.
Never 유치, never 환자 소개, never 모객.

---

## 2. 강남언니 vs 로톡 — the line your pricing model must stay on

This is the clearest available precedent and every 원장 in Gangnam knows the case.

| | Model | Outcome |
|---|---|---|
| **강남언니** | Per-patient **commission** (dressed up as an advertising contract) | CEO convicted — 징역 8개월 / 집행유예 2년. 71 hospitals, 9,215 patients, ~₩170M in fees, 2015–2018. Upheld on appeal as 환자 알선. A **피부과 의사 who paid the fees was also convicted.** 강남언니 now takes advertising revenue only. |
| **로톡** | Flat **advertising / subscription** fee | Not guilty. |

The court's line is not "platform good / platform bad." It is **whether the fee tracks
the patient.** A fixed fee for a service is lawful; a fee that rises when a patient
books is 알선.

### What this means for WA Harness

**Price as a flat monthly fee per clinic or per seat. Never:**
- per qualified lead
- per booked appointment
- per converted patient
- revenue share on treatment value
- tiered pricing where the tier is defined by patient volume converted

A usage tier based on *message volume* or *seats* is defensible. A tier based on
*patients acquired* is the 강남언니 fact pattern with extra steps.

**Say it out loud in the first 30 seconds of every meeting:**

> 저희는 건당 수수료를 받지 않습니다. 월 고정 이용료입니다.

That one sentence moves you from "threat the 원장's licence" to "tool the clinic
operates." It is the fastest available route past the desk reflex, and the 원장 will
immediately understand why you said it.

---

## 3. Automated DMs are regulated messages

The product sends messages on a clinic's behalf, so the clinic's regulatory exposure
becomes your product spec.

- **카카오 알림톡 정보성 / 광고성 rules** — 정보성 (booking confirmation, pre/post-care
  instructions, reminders) may be sent to existing patients; anything promotional is
  광고성 and requires consent and labelling. Your templates must be classifiable on
  their face, and the product should refuse to send a 광고성 body through a 정보성 slot.
- **의료법 제56조 / 제57조 medical advertising limits** — no patient testimonials, no
  superlatives, no before/after claims of guaranteed outcomes, and prior review
  (심의) for covered ad channels. Auto-generated replies quoting prices or outcomes
  are advertising. Ship a reviewed template library, not a free-text generator.
- **Personal information** — foreign patient data crossing borders (WeChat, LINE,
  WhatsApp) triggers 개인정보보호법 obligations on cross-border transfer. Clinics will
  ask. Have the answer written down before they do; per the team's own EMR research,
  security is a 37.6–38.5% objection and stability is the #1 selection criterion (48.16%).

These constraints are a **moat, not a burden.** A generic omnichannel inbox cannot
make these guarantees. A product that ships compliant templates and refuses unlawful
sends is defensible against 채널톡 in a way that "we also have a unified inbox" is not.

---

## Sources

- [의료법 제27조 제3항 — '합법'과 '위법'의 갈래에서 (의협신문 법률칼럼)](https://www.doctorsnews.co.kr/news/articleView.html?idxno=144078)
- ['강남언니' 앱에 수수료 내고 환자 소개받은 피부과 의사 — 의료법 위반 유죄 (리걸타임즈)](https://www.legaltimes.co.kr/news/articleView.html?idxno=67750)
- [광고비 받은 '로톡' 무죄, 수수료 받은 '강남언니' 유죄 (파이낸셜뉴스)](https://www.fnnews.com/news/202307061827216638)
- [강남언니, 의료법 위반 징역형…비대면 플랫폼 영향 '촉각' (데일리팜)](https://dailypharm.com/user/news/26459)
- ['강남언니' 수수료, 2심도 '환자 알선' 인정](https://v.daum.net/v/HLRUgGujTA)
- [환자유인·알선 신고 안내 (대한치과의사협회)](https://kda.or.kr/kda/medicalLow/medicalNotice/board_read.kda?board_key=38861)
- [미등록기관 외국인환자 유치, 처벌 대폭 강화 (의협신문)](https://www.doctorsnews.co.kr/news/articleView.html?idxno=109167)
- [외국인환자 유치기관 등록제도 안내 (서울특별시)](https://news.seoul.go.kr/welfare/archives/531323)
