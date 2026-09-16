# Midam Clinic — deal risks

Reviewed 2026-09-16 against `gtm/legal_pricing_constraints.md` and
`gtm/clinic_sales_playbook.md`. Ordered by how badly each one can end the deal.

---

## R1 — The Taiwan manager is described as "a broker". This is the biggest risk in the deal.

From the discovery meeting: the clinic has a manager in Taiwan who is "essentially a
broker" — they source and qualify Taiwanese patients and convert them to bookings.

Two Korean statutes bear directly on that arrangement (`gtm/legal_pricing_constraints.md` §1):

- **의료법 제27조 제3항** — brokering patients to a medical institution *for profit*.
  Up to 3 years / ₩30M. **The clinic that pays is liable too.**
- **의료해외진출법** — attracting *foreign* patients without 유치업자 registration.
  Up to 3 years / ₩30M, names publicly disclosed, commissions confiscated. The clinic
  receiving patients from an unregistered broker faces suspension of its foreign-patient
  business (1–3 months first offence) or cancellation of registration.

The 강남언니 precedent decides it on one question: **does the fee track the patient?**
A flat retainer is lawful. A fee that rises when a patient books is 알선 — and in that
case the 피부과 의사 who paid was convicted alongside the platform.

### What this means for us

We would be building the operating software for that workflow. Before writing a line
of code we need to know:

- [ ] Is Midam on the **KORP registry** as a 외국인환자 유치의료기관?
      (medicalkorea.or.kr/korp — searchable, we can check this ourselves without asking.)
- [ ] Is the Taiwan manager **registered as a 유치업자**, or employed by the clinic?
- [ ] Is that person paid a **salary/retainer**, or **per patient**?

If the answer is "per patient, unregistered", the clinic is already exposed and our
product becomes the instrument of it. That is not a deal to take quietly — it is a
conversation to have with the 원장 before proposing anything, and it may be the most
valuable thing we tell him.

**Handle it as a service, not an accusation.** The 원장 may not know. Framing:
「대만 담당자분 계약 형태를 여쭙는 이유는, 건당 정산 구조면 병원 쪽 리스크가 생겨서입니다.
설계를 그 부분 피해서 잡으려고 합니다.」

---

## R2 — Our own pricing must be flat, and we must say so early

Not per-DM-handled, not per-qualified-lead, not per-booking. Flat monthly per clinic
or per seat. Message-volume or seat tiers are defensible; patient-volume tiers are the
강남언니 fact pattern with extra steps.

Open the next meeting with it — first 30 seconds:

> 저희는 건당 수수료를 받지 않습니다. 월 고정 이용료입니다.

This matters doubly here because of R1: if the clinic already has a per-patient
arrangement with Taiwan, a per-patient arrangement with us stacks the same exposure.

**Not yet said to Midam.** Say it at the next contact.

---

## R3 — Vegas CRM read/write is inside the 90-day condition and outside our control

Full detail in `2026-09-16-discovery-meeting.md` §6–7 and the outreach log.
Status: vendor deflected to email; no manager contact given.

Note from `gtm/clinic_sales_playbook.md` §5 Door B: the strategic EMR integration
targets identified are **닥터팔레트** (cloud-native, ~150 clinics, go first) and
**스마트닥터** (3,527 clinics, the prize). **Vegas CRM is in neither tier.** So the
effort being spent prying open Vegas buys access to *one* account, not distribution.
Worth doing for Midam; not worth treating as company strategy.

---

## R4 — "We automate your Instagram DMs" lands on 채널톡's ground, not ours

`gtm/clinic_sales_playbook.md` §2.2 is blunt: 채널톡 already unifies KakaoTalk, LINE
and Instagram DM and markets 상담 통합 directly. 애프터닥 owns clinic CRM messaging and
already ships a 스마트닥터 EMR integration. Foreign-patient-specific players exist
(메디케이메이트, 위디컬+텔어스, 포위드닥터).

If the Midam pitch is "we answer your DMs", the 원장 can buy that elsewhere, cheaper,
from a company with more customers.

**The wedge is the qualification layer**: reply in-language, qualify against the
clinic's own 비급여 price list, travel-window and visa questions, timezone-aware first
response, deposit capture against no-shows, and handing over a *qualified, priced,
date-bounded* patient. Reframe the Midam collateral around that, not around inbox
volume.

---

## R5 — Everything the bot sends is a regulated message

`gtm/legal_pricing_constraints.md` §3. Auto-replies quoting prices or outcomes are
advertising under 의료법 56/57. Ship a reviewed template library, not a free-text
generator. 알림톡 정보성/광고성 must be classifiable on its face. Taiwanese patient data
crossing borders triggers 개인정보보호법 cross-border transfer obligations — the clinic
*will* ask, and security is a 37.6–38.5% objection with stability the #1 criterion
(48.16%).

Per the playbook, this is a **moat, not a burden**: a generic inbox cannot make these
guarantees and we can.

---

## R6 — Single-prospect pipeline

Midam is currently the only prospect. Every obstacle therefore reads as existential,
which is bad for negotiating posture. `gtm/clinic_sales_playbook.md` §4 and §6 already
contain a built wedge for prospect #2+ (the mystery-shop audit over ~26 Gangnam clinics,
plus the KORP registry and hiring-signal target lists). That work exists and is not
blocked by anyone. Use it.

Timing hook from the playbook §6.5: the 10% VAT refund on foreign cosmetic procedures
sunset at end of 2025 and 대한성형외과의사회 estimates a 20–30% drop in foreign volume.
Clinics got 10% more expensive overnight and are looking for conversion efficiency
right now — which is exactly what the qualification layer sells.
