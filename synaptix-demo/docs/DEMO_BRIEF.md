# Synaptix · Midam Clinic demo — build brief (shared contract for all contributors)

Local-only interactive demo of Synaptix for a client discovery meeting with Midam Clinic
(Korean aesthetic clinic, international customers). Frontend only; every integration
(Instagram, WhatsApp, LINE, WeChat, CRM, AI) is **simulated in-process**. Never claim an
integration is verified. A persistent, discreet "Demo · simulated integrations" chip is always visible.

## Stack (already installed — do not add packages)
React 19 + TypeScript, Vite 8, `motion` (Motion for React, `motion/react`), `lucide-react`,
Radix primitives (`@radix-ui/react-dialog|tabs|switch|popover|tooltip|dropdown-menu|select`)
styled by hand in the Synaptix system (shadcn-style vendored components in `src/components/ui`,
**no Tailwind**, plain CSS with tokens), `@fontsource/*` fonts bundled locally, `@playwright/test@1.56.1`
(matches the pre-installed Chromium at `/opt/pw-browsers`). No XState, no MSW, no vitest
(unit tests run under the Playwright `unit` project, node-side, no browser).

Path alias: `@/` → `src/`. Type contract: `src/domain/types.ts` (read it fully). Calendar helpers:
`src/domain/calendar.ts` (local ISO strings **without** offset, e.g. `2026-09-15T10:20:00`).

## Module ownership
| Area | Path | Owner |
|---|---|---|
| Types, calendar | `src/domain/*` | lead (frozen; ask before changing) |
| Sample data, seed state, photos, scenarios | `src/data/*`, `src/scenarios/*`, `public/photos/*`, `docs/assets.md` | data agent |
| Reducer, selectors, store/provider, scenario player, simulated services | `src/state/*`, `tests/unit/*` | engine agent |
| Design system, UI components, screens, `main.tsx`, `App.tsx`, `src/styles/*` | `src/components/*`, `src/styles/*`, `src/App.tsx`, `src/main.tsx` | UI agent |
| E2E tests, screenshots, recording | `tests/e2e/*`, `docs/screenshots/*` | QA agent |

## Fixed demo facts (use exactly these so scenarios never go stale)
- Simulated clock at reset: **`2026-09-15T10:20:00`** (Tuesday). Clinic time zone Asia/Seoul; UI shows "Clinic time".
- Working hours: Mon–Fri 10:00–19:00 · Sat 10:00–15:00 · Sun closed.
- Holidays: 2026-09-24, 09-25, 09-26 (Chuseok), 2026-10-03 (National Foundation Day), 2026-10-09 (Hangul Day).
- After-hours scenario clock: **`2026-09-23T21:40:00`** (Wed). Next opening = **Mon 2026-09-28 10:00**
  (skips Thu–Sat Chuseok + Sunday) — the point of the scenario.
- Staff identities (simulated login, no auth): staff **Kim Seo-yeon (김서연) · Front desk** (`staff-seoyeon`),
  manager **Park Ji-hoon (박지훈) · Clinic manager** (`manager-jihoon`). `role` toggles who is "logged in".
- Clinic accounts: Instagram `@midam.clinic`, WhatsApp `Midam Clinic (+82 ·· simulated)`, LINE `Midam Clinic (LINE Official)`, WeChat `MidamClinic_Official`.
- Fictional booking references: `MD-24811` (existing), new ones from `crm.nextReferenceNumber` = 24817 upward (`MD-24817`, …).

### Conversations (ids are fixed; customers are fictional)
| id | channel | customer | lang | role in demo |
|---|---|---|---|---|
| `conv-ig-misaki` | instagram | 佐藤 美咲 Sato Misaki, Tokyo | ja | **Scenario 1** — created by the scenario (not in seed) |
| `conv-line-chiaying` | line | 林佳穎 Lin Chia-ying, Taipei | zh-Hant | **Scenario 2** human takeover (asks whether a treatment suits her skin → individual judgment) |
| `conv-wechat-wei` | wechat | 王伟 Wang Wei, Shanghai | zh-Hans | **Scenario 3** after hours (asks about combining a treatment with his medication → unsupported) |
| `conv-wa-emily` | whatsapp | Emily Carter, Sydney | en | **Scenario 4** — has appointment `MD-24811` on `2026-09-18T15:00` |
| `conv-ig-hina` | instagram | 中村 陽菜 Nakamura Hina, Osaka | ja | **Scenario 6** — seeded at `customer_confirmed` with selected slot `2026-09-21T14:00`, `crmBehavior: 'timeout'` |
| `conv-line-ken` | line | 田中 健 Tanaka Ken, Fukuoka | ja | background, resolved by AI, read |
| `conv-wa-sophie` | whatsapp | Sophie Müller, Berlin | en | background, unread 1, asked about access from Incheon airport (AI answered) |
| `conv-wechat-meiling` | wechat | 陈美玲 Chen Meiling, Shenzhen | zh-Hans | background, ownership `human` (staff already handling) |
| `conv-wa-daniel` | whatsapp | Daniel Reyes, Manila | en | background, ownership `needs_human` (asked about a medical condition), unread 2 |

### Consultation slots (`ClinicSlot.id` = local ISO minute, e.g. `2026-09-17T11:00`)
Thu 17: 11:00, 14:00, 16:30 · Fri 18: 11:00, 15:00 (taken: MD-24811), 17:00 · Sat 19: 11:00, 13:00 ·
Mon 21: 11:00, 14:00, 16:00 · Tue 22: 11:00, 14:00 · Tue 29: 11:00, 14:00. Duration 30 min, rooms "Consultation room 1/2".
Scenario 1 offers `2026-09-17T14:00`, `2026-09-18T11:00`, `2026-09-19T11:00`; Misaki picks **Thu 17 Sep 14:00** → `MD-24817`.
Scenario 4 reschedules Emily from Fri 18 15:00 → **Mon 21 Sep 16:00** (same `MD-24811`).

### Knowledge library seed (ids fixed)
Text (approved unless noted): `kb-hours-location`, `kb-consultation-process`, `kb-services-overview`,
`kb-consultation-fee` (illustrative fee; flagged "illustrative"), `kb-languages`, `kb-airport-access`,
`kb-cancellation-policy`, `kb-photo-policy` (assistant does not assess customer photos),
`kb-medication-questions` (**draft** — so the assistant cannot answer medication questions).
Photos: `ph-reception` (approved), `ph-consultation-room` (approved), `ph-entrance` (approved),
`ph-treatment-room` (draft), `ph-lounge` (withdrawn). Scenario 5 adds `ph-recovery-lounge` from the bundled
sample `/photos/recovery-lounge.svg` as a draft → manager approves → withdraw.
All photos are **illustrative vector renderings created for this demo** (provenance line on each item).
Customer attachments (`kind: 'customer_attachment'`) use `/photos/customer-attachment.svg` and are never knowledge.

## State & playback contract
- `src/state/reducer.ts`: `reducer(state, action)` pure; `src/data/seed.ts`: `createInitialState(): DemoState`.
- `src/state/store.tsx` exports `DemoProvider`, `useDemo(): { state, dispatch }`, `usePlayer()`:
  `{ scenarios, scenario, stepIndex, nextStep, lastStep, status, start(id), play(), pause(), next(), restart(), setMode(mode), resetAll() }`.
- Player owns all timers; every timer captures `guided.runId` and is a no-op if it changed. `RESET_ALL`, `START_SCENARIO`,
  `SET_MODE`, `RESTART_SCENARIO` bump `runId`. `RESET_ALL` returns the seed but keeps `mode`.
- `next()` applies the next step immediately; if status was `playing` it keeps playing, otherwise stays `paused`.
- Steps with `pauseAfter` pause playback at decision points. Completed → `status: 'complete'`.
- `src/state/services.ts` (simulated services effect): resolves `crm.requests` with `resolution:'auto'` after ~1200 ms using
  `conversation.crmBehavior`; advances any message `delivery:'sending'` → `'delivered'` after ~600 ms. Timers are keyed by
  `runId` and cleared on reset. No other background behaviour in explore mode.
- Test hooks: `window.__synaptix = { getState, dispatch, player }`; URL `?speed=instant` makes player/service delays ~0 ms;
  `?scenario=<id>` starts that scenario at load (paused).
- Reducer guarantees: `TAKE_OVER` discards any assistant draft/activity; assistant messages are rejected unless ownership is `ai`
  and `settings.aiPaused` is false; `ADD_MESSAGE`/`SEND_STAFF_MESSAGE` with a `photoId` require an **approved** photo;
  `SUBMIT_BOOKING` is idempotent per `requestId` and ignored while a request is pending; reschedule mutates the same
  `Appointment`; `APPROVE_KNOWLEDGE` requires `role === 'manager'`; `SET_DELIVERY` on the confirmation message updates
  `booking.confirmationDelivery` and moves stage to `confirmation_sent` when delivered.

## Visual system (UI agent — details in its prompt)
Brand: Ink neutrals, Cobalt `#2436E0` as the single interaction accent, Pulse Mint only on Ink. IBM Plex Sans KR primary,
IBM Plex Mono for references/times, Noto Sans JP/SC/TC for JA/ZH text via `:lang()` rules. "Snap, don't float" motion.
Three-column inbox; compact booking panel inside the workspace; no charts, KPI cards, gradients or glow.
