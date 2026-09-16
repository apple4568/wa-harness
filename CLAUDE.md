# wa-harness — working conventions

This repo is the second brain for Synaptix (product) and its go-to-market. Notes,
research, scripts, drafts and call logs all live here as files.

## Rule 1 — everything gets written to a file

**Anything produced in a session is logged into the repo, not left in chat.** Call
scripts, email drafts, meeting notes, pricing decisions, research findings, objection
handling, plans — if it would be useful next week, it is a file in a folder.

Chat is scratch. The folder is the record.

## Rule 2 — read the neighbours before writing

Before advising on sales, pricing, legal posture or outreach, read `gtm/`. Before
writing anything client-facing, read `brand/spec/brand_spec.md`. Work that contradicts
an existing file is a bug in one of them; reconcile it explicitly rather than quietly
writing a second opinion.

## Rule 3 — one trunk

Session branches that never merge caused real damage: `gtm/` sat unread on a separate
branch while a full day of sales advice was given without it. Merge finished work back;
do not leave findings stranded on a branch.

## Layout

| Folder | Holds |
|---|---|
| `brand/` | Brand system 2.0 — research, master spec, page content, logo geometry, exports |
| `gtm/` | Go-to-market: sales playbook, legal/pricing constraints, KO scripts, mystery-shop spec, field notes |
| `prospects/` | One folder per account. Meeting logs, outreach logs, deal risks, per-account collateral |

## Non-negotiables that apply to every client-facing artifact

Sourced from `gtm/legal_pricing_constraints.md` and `brand/spec/brand_spec.md`:

- **Flat monthly fee only.** Never per-lead, per-booking, per-converted-patient, or
  revenue share. 강남언니 was convicted on exactly that fact pattern, and so was the
  피부과 의사 who paid. Say 「저희는 건당 수수료를 받지 않습니다. 월 고정 이용료입니다」 early.
- **Never say 유치 / 환자 소개 / 모객.** Say 솔루션 · 프로그램 · 상담 관리 시스템 and name
  the workflow. The broker word is why front desks refuse on contact.
- Never invent integrations, certifications, customer counts, results or uptime.
- Demo data is labelled **예시 데이터 · Demo data**.
- Korean leads, English is the equivalent. Never headline "AI".
- 의료법 56/57: no testimonials, no superlatives, no guaranteed-outcome claims in
  anything the product sends or the company publishes.
