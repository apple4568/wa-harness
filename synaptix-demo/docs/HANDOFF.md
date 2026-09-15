# Handoff — Synaptix · Midam Clinic demo

Give the next session this repository at branch `claude/beautiful-heisenberg-7638sx` (everything is committed;
nothing lives outside the repo) and point it at the files below in this order.

## Read first (context, ~10 minutes)
1. `synaptix-demo/README.md` — what the demo is, how to start/reset it, presenter controls, scripts.
2. `synaptix-demo/docs/DEMO_BRIEF.md` — the build contract: stack, module ownership, fixed demo facts
   (clock, calendar, customers, ids, slots, knowledge seed), state/playback contract, reducer guarantees.
3. `synaptix-demo/docs/walkthrough.md` — the three-minute presenter script and which scenario answers which question.
4. `synaptix-demo/docs/verification.md` — test results, the explicit list of simulated capabilities, and limitations.
5. `synaptix-demo/docs/assets.md` — provenance/licences of fonts and illustrations, and the copy flagged for language review.

## Code entry points
| Concern | Path |
|---|---|
| Shared type contract (read before changing anything) | `synaptix-demo/src/domain/types.ts` |
| Clinic calendar helpers (local ISO, no offset) | `synaptix-demo/src/domain/calendar.ts` |
| Seed state and fictional data | `synaptix-demo/src/data/` (`seed.ts` → `createInitialState()`, `validate.ts`) |
| Six scripted scenarios (pure action lists) | `synaptix-demo/src/scenarios/` (`index.ts` → `SCENARIOS`, `SCENARIO_LIST`) |
| Reducer, selectors, store, scenario player, simulated CRM/delivery services | `synaptix-demo/src/state/` |
| Design tokens and CSS | `synaptix-demo/src/styles/` (`tokens.css`, `base.css`, `components.css`, `app.css`, `views.css`) |
| UI | `synaptix-demo/src/components/` (`layout/`, `inbox/`, `conversation/`, `knowledge/`, `settings/`, `ui/`) |
| Tests | `synaptix-demo/tests/unit/` (reducer/calendar/scenarios), `synaptix-demo/tests/e2e/` (browser flows), `tests/helpers/demo.ts` |
| Brand source | `brand/spec/brand_spec.md` (§10–12 colour, type, motion), `brand/exports/svg/`, copies in `synaptix-demo/public/brand/` |

## Commands
```bash
cd synaptix-demo && npm install
npm start                      # http://127.0.0.1:5173
npm run typecheck && npm run lint
npx playwright test --project=unit
npx playwright test --project=e2e        # needs Chromium: npx playwright install chromium (once, other machines)
RECORD=1 npx playwright test tests/e2e/recording.spec.ts --project=e2e   # regenerates docs/recording/walkthrough.webm
```

## Test hooks another agent can use in the browser
- `window.__synaptix = { getState, dispatch, player }`
- URL params: `?speed=instant` (no scripted delays), `?scenario=<id>` (start paused), `?mode=explore`
- Scenario ids: `inquiry-to-booking`, `human-takeover`, `after-hours`, `reschedule-cancel`, `manager-approved-photo`, `booking-uncertainty`

## Ground rules that must survive
- Local only; no hosting/deploy, no real integrations, no runtime CDN/font/API requests; the "Demo · simulated
  integrations" chip stays visible.
- All business state changes go through the reducer; timers only dispatch actions and are keyed by `guided.runId`.
- Only `approved` knowledge reaches the assistant; customer attachments never become knowledge; bookings are idempotent
  per request id; reschedule mutates the same appointment.
- Fictional customers and illustrative content only — never present it as verified Midam Clinic information.
