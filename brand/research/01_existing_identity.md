# 01 — Existing identity audit: Synaptix / 시넵틱스

Date: 2026-09-14. Scope: Google Drive, Figma, public web, local repo (`/home/user/wa-harness`).
Bottom line: **no existing Synaptix brand system, logo, site, app listing, or messaging document was found anywhere.** The name is effectively a blank slate for this redesign, but it is crowded by unrelated third parties.

## 1. Sources found

| Source | What it is | Relevance |
|---|---|---|
| Google Drive folder "Skinclinic-WA Leads & Outreach" (id `1aVfLLS0Zyh1VwPR6_kx6m-_Q5UecWB4l`, created 2026-08-27) | 4 Sheets: `Qualified Leads`, `Price-Unconfirmed`, `Near-Misses`, `Templates` | Only internal material related to this product. Contains **no** brand assets; documents the prior product concept and target-customer research. |
| `Templates` sheet | Touch-1/Touch-2 outreach scripts (EN + KR), sender "Jinho Kim / 김진호", "psychology student at Korea University" | Names the prior product only as "**the WhatsApp intake/qualification tool**" (Touch 2: "this research fed into something you built"). No product name, tagline, or visual used. |
| `Qualified Leads` sheet (~26 Seoul clinics: BLS, EU:GENES, Grand, Leaders, VS Line, ANZ, Nana, ATOP, Allheart, BBAE, Daybeau, Dewyd, Diore, Choiceline, Fresh Dr. Hong, HERSHE, ID Hospital, NEST, New Star, QD, RE:BERRY, Returning, Ruby, SINSANG, VIBE, Woori, Cellin) | Columns: high-ticket procedure & price (threshold ₩1.3M / ~$1,000), foreign-targeting evidence, WhatsApp contact, "Prospect Fit Signal" | Strong picture of the original ICP: Gangnam/Apgujeong/Cheongdam aesthetic clinics courting English-speaking patients, almost all with **manual-only** WhatsApp/Kakao/LINE contact and "no chatbot/automation observed". |

## 2. Sources searched, NOT found

- **Google Drive**: `fullText contains 'Synaptix' / '시넵틱스'`, `title contains 'synaptix'`, `brand`, `브랜드`, `브랜드 가이드`, `logo`, `tagline`, `positioning`, `operating system`, `운영체제`, `pitch`, `deck`, `wa-harness` → zero hits beyond the folder above. No brand guide, deck, logo file, or naming doc.
- **Figma**: account (handle 심소정, student plans: "심소정/시각디자인전공의 팀", "디창실 사이", "아모레퍼시픽_장현포", "애뜨림 - 시원스쿨") has **no Synaptix team, file, or library**. `get_libraries` requires a real file key; none exists. Nothing to reuse.
- **Local repo** `/home/user/wa-harness`: contains only `.git` with no commits/branches. No code, tokens, favicon, or logo.
- **Web** (searches: "Synaptix 시넵틱스", "시넵틱스 클리닉", "synaptix clinic korea", "synaptix.kr OR synaptix.co.kr", "시넵틱스", "Synaptix 의원/클리닉 CRM 결제", "Synaptix aesthetic clinic software Korea"): **no Korean Synaptix** site, Naver/Kakao presence, app-store listing, Instagram, press, or company registration surfaced. Korean results for 시넵틱스 return only 시냅틱스 (Synaptics Inc.) and 시넥틱스 (synectics).
- Direct fetches of `synaptix.kr`, `synaptix.co.kr`, `synaptix.dev`, `.ai`, `.io`, Google Play and LinkedIn were **blocked by the sandbox egress proxy**; existence of the .kr domains is unverified.

### Name collisions to be aware of (all unrelated, none Korean)
- **synaptix.dev** — "Outpatient interpretation, documentation, and patient instructions"; live two-way medical translation (English/Spanish/Mandarin/Cantonese/Arabic), structured HPI/PMH/ROS notes, "six modules in one workspace", "turn-by-turn traceability". US-outpatient clinical scribe. Closest positioning overlap; **not confirmed as this team's product** (no Korea/aesthetic mention, language set is US-oriented).
- gosynaptix.com ("AI co-worker for your enterprise"), Synaptix Systems Inc. (IT strategy), Synaptix Morocco (SaaS dev), synaptix.it (serial comms), Synaptix™ Digital Surgery Platform (MMI micro-surgery), SynaptixBio, "Synaptix Care" Android app (`com.synaptix`, unverified), Synaptix dental practice platform (Synexian), CogniFit "Synaptix" brain game, SYNAPTIX AI LTD (UK).

## 3. Current identity description

| Element | Status |
|---|---|
| Logo / mark | **Not found.** No file, export, or description exists in any checked source. |
| Colour palette | **Not found.** |
| Typography (Latin / Hangul) | **Not found.** |
| Imagery / illustration style | **Not found.** |
| Korean wordmark 시넵틱스 | **Not found** in any rendered form; spelling note: the common Korean transliteration of "Synaptics" is 시냅틱스, so 시넵틱스 is distinct but search engines auto-correct it. |

## 4. Current messaging and stated capabilities

- **Tagline (KO / EN)**: none found.
- **Positioning language**: the only internal phrase is "**the WhatsApp intake/qualification tool**" (Templates sheet, Touch 2). Outreach was framed as academic research on "how the K-beauty industry has changed as clinics expand their focus to also serve Western/English-speaking customers" / "K-뷰티 업계가 서양권/영어권 고객을 타겟으로 사업을 확장해온 과정".
- **Listed capabilities**: none published. Implied by lead-sheet criteria only: WhatsApp-first inbound handling for foreign patients, lead qualification, replacing "manual-only contact channels".
- **Pricing**: none found for Synaptix. (Lead sheets record *clinic* procedure prices, ₩1.3M–₩12.8M, as an ICP filter, not product pricing.)
- **Trust signals**: none exist yet (no customers, testimonials, certifications, or press).
- **Tone**: outreach copy is polite, first-person, low-pressure, student-researcher voice; no product voice established. No AI-led claims were made, consistent with the team's stated preference.

## 5. What the shift to "operating system for Korean aesthetic clinics" changes

- **Audience**: from *foreign-patient coordinators / marketing staff* at ~26 Gangnam clinics to **clinic directors (원장) and head managers (실장)** who own the whole workflow — reception, consultation, treatment, CRM, payments, analytics — for domestic and international patients alike. Korean becomes the primary language; English secondary.
- **Promise**: from "answer WhatsApp faster / qualify foreign leads" (a point tool) to "**run the whole clinic on one system**" — continuity of a patient record from first message to payment to follow-up. This competes with incumbents already in the search results (SmartDoctor CRM/EMR, KOS CRM, and the Gangnam Unni / Yeoshin / Babitalk patient-acquisition apps), so the brand must read as infrastructure, not as a chatbot.
- **Proof needs**: whole-clinic claims require evidence of breadth and reliability — module map, data continuity, uptime/security & 개인정보 handling, integration with existing 차트/결제 tools, pilot clinic names, staff-adoption stories. The lead sheets' "manual-only, no automation" finding is the pain to cite. Avoid AI-first proof (per team preference); lead with operational calm and control.
- **Visual implications**: the name is unencumbered, so the mark can be built from scratch. It should (a) not evoke "brain/synapse/neural" iconography that the name suggests and that AI-forward competitors (gosynaptix, synaptix.dev) and Synaptics already use; (b) feel like clinic infrastructure — calm, precise, premium enough for Cheongdam interiors, legible on reception screens and 실장 tablets; (c) carry a Hangul wordmark designed alongside the Latin one, since Korean-first UI and signage are now core; (d) support a modular system (module icons/colour coding for reception, consult, treatment, CRM, payments, analytics) rather than a single "chat" metaphor.

## 6. Research limitations

- Sandbox egress blocked direct fetching of candidate domains, Google Play, LinkedIn; existence/ownership of synaptix.kr / .co.kr and the "Synaptix Care" app is unverified.
- Naver, Kakao, Instagram, and the Korean app stores were not directly searchable; only Google-style web search was available, which auto-corrects 시넵틱스 to 시냅틱스.
- Figma access is limited to the connected student account; a Synaptix file may exist under another account.
- Drive search is limited to this Google account (`k02jizkm@gmail.com`); shared drives of other team members were not visible.
- No stakeholder interviews; the "team preference against AI-led messaging" is taken as given from the brief.
