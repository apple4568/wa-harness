# Synaptix · Midam Clinic — interactive demo

A local-only, fully simulated demonstration of Synaptix: one staff workspace that oversees an
autonomous assistant answering international customers across Instagram, WhatsApp, LINE and
WeChat, booking consultations through a (simulated) clinic CRM, and handing conversations to
staff when a human is needed.

> **Demo · simulated integrations.** Nothing in this app connects to a real messaging account,
> CRM, AI model or translation service. All customers, conversations, services, prices, photos
> and booking references are fictional and illustrative — they are not verified Midam Clinic
> information. A successful simulation does not imply that any real integration has been verified.

## Requirements

- Node.js 20+ (built and tested with Node 22) and npm.
- Internet access **only** for the one-time `npm install`. After that the demo runs offline:
  fonts, icons, images and sample data are bundled; there are no runtime CDN, API or font requests.

## Setup, start, reset

```bash
cd synaptix-demo
npm install          # one time
npm start            # opens http://127.0.0.1:5173 in your default browser
```

`npm run dev` starts the same server without opening a browser. For a production-style build:
`npm run build && npm run preview` (serves the built bundle at http://127.0.0.1:4173).

**Reset demo:** click **Reset all** in the presenter bar (top). It cancels every pending scripted
event and timer, clears notifications, and restores the original sample data, clinic clock
(Tue 15 Sep 2026, 10:20 clinic time) and knowledge library. Reloading the page has the same effect —
nothing is persisted.

## Presenter controls (top bar)

| Control | What it does |
|---|---|
| **Guided / Explore** | Guided plays scripted scenarios step by step. Explore is normal use with no background script; switching modes cancels pending scripted events. |
| **Scenario** | Choose one of six scripted scenarios. Choosing a scenario resets the demo and prepares its starting state. |
| **Play / Pause / Next / Restart** | Playback pauses automatically at decision points (e.g. before a booking is submitted). *Next* applies the next step immediately. |
| **Reset all** | Full reset (see above). |
| **Simulated role** | Switch between *Staff* (front desk) and *Manager*. Only the manager can approve or withdraw knowledge. |
| **Clinic time** | The simulated clinic clock. Scenarios move it deliberately (e.g. to after hours). |

Useful URL parameters for rehearsal/testing: `?scenario=inquiry-to-booking` (start a scenario paused),
`?mode=explore`, `?speed=instant` (no scripted delays).

## Suggested three-minute walkthrough

See [`docs/walkthrough.md`](docs/walkthrough.md). Short version:

1. **Unified inbox** (Explore) — channels, languages, unread, AI/human ownership, *Needs human* filter, search.
2. **Inquiry → approved answer + photo** (Scenario 1, first half) — Japanese Instagram inquiry, Korean
   translation, the assistant's reply built from approved information (open *Sources*), approved facility photo.
3. **Consultation booking** (Scenario 1, second half) — times offered → explicit customer confirmation →
   booking submitted → CRM success with reference → confirmation message delivered (each state shown separately).
4. **Human takeover** (Scenario 2) — handover reply, notification, *Needs human*, take over, reply, return to AI.

Keep Scenarios 3–6 (after-hours escalation, reschedule/cancel, manager-approved photo, booking uncertainty)
for questions.

## What is simulated, and what the demo does not do

Screenshots of the main states are in [`docs/screenshots/`](docs/screenshots/) and a backup recording of the
walkthrough (scenarios 1 and 2) is [`docs/recording/walkthrough.webm`](docs/recording/walkthrough.webm).

See [`docs/verification.md`](docs/verification.md) for the verification summary and the explicit list of
simulated capabilities and remaining limitations, and [`docs/assets.md`](docs/assets.md) for asset provenance
and licences.

## Project layout

```
src/domain      types + clinic calendar helpers (shared contract)
src/data        fictional customers, conversations, knowledge, slots, settings, seed state
src/scenarios   six scripted scenarios (pure action lists; no timers inside)
src/state       typed reducer, selectors, store/provider, scenario player, simulated services
src/components  UI (shadcn-style primitives restyled for Synaptix, inbox, conversation, knowledge, settings)
src/styles      design tokens and component CSS
public/brand    Synaptix logo assets · public/photos: illustrative facility renderings
tests/unit      reducer / calendar / scenario tests (Playwright "unit" project, no browser)
tests/e2e       browser workflow tests and screenshots
```

## Scripts

| Script | Purpose |
|---|---|
| `npm start` / `npm run dev` | Local dev server on http://127.0.0.1:5173 |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the build on http://127.0.0.1:4173 |
| `npm test` | Run unit + browser tests (uses the dev server; starts it if needed) |
| `npm run lint` / `npm run typecheck` | Lint / type-check |

Browser tests use the Playwright Chromium already present on this machine (`@playwright/test@1.56.1`);
on another machine run `npx playwright install chromium` once.
