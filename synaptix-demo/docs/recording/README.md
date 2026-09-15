# Walkthrough recording

`walkthrough.webm` is produced by `tests/e2e/recording.spec.ts` (Playwright 1.56, bundled Chromium,
1440 × 900, `recordVideo`). It is skipped in the normal test run; to (re)record it:

```sh
npm run dev            # or let Playwright start the Vite dev server on 127.0.0.1:5173
RECORD=1 npx playwright test tests/e2e/recording.spec.ts --project=e2e
```

What the recording shows (normal playback speed — scripted delays are kept):

1. **Scenario 1 — Instagram inquiry → confirmed booking.** Started from the scenario select, played
   with the presenter bar's Play button. At every decision point (pause) the test waits ~1.5 s and
   presses Play again; when the customer has explicitly confirmed, the Consultation panel is opened so
   the stepper, the CRM line and the customer-confirmation line are visible while the booking is submitted.
2. **Scenario 2 — Human takeover.** Played until the assistant hands over; the notification bell is
   opened and the notification clicked with real clicks, **Take over** is pressed, a reply is typed
   into the composer and sent with Enter (delivery ticks progress to Delivered), then **Return to AI**.

The `.webm` is written by Playwright when the browser context closes and renamed to
`walkthrough.webm`. No audio. Everything on screen is simulated in-process — no external service is
contacted (see the offline check in `tests/e2e/smoke.spec.ts`).
