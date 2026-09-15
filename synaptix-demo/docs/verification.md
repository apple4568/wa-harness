# Verification summary, simulated capabilities and limitations

_Last updated for the demo build on branch `claude/beautiful-heisenberg-7638sx`._

## What was verified

Automated (run with `npm test`; unit tests run node-side, browser tests run against the local dev server
in the pre-installed Chromium):

| Area | Coverage | Result |
|---|---|---|
| Clinic calendar | open/closed logic, Saturday hours, next opening across Chuseok + Sunday (`2026-09-23 21:40 → 2026-09-28 10:00`) | 5 passed |
| Seed data | referential integrity of every conversation / message / knowledge / slot / appointment id; fresh objects per reset | 3 passed |
| Reducer | ownership transitions; takeover discards assistant drafts and blocks assistant messages; AI pause; approved-only photos with preserved history; booking idempotency (same request id twice, second request while pending); CRM success creates one appointment (`MD-24817`); reschedule mutates the same appointment; cancel; timeout → needs review with no appointment; reconciliation never duplicates; manager-only approval/withdrawal; reset keeps mode and bumps run id; confirmation delivery → `confirmation_sent` | 22 passed |
| Scenarios | all six scenarios replayed through the reducer with end-state assertions and id validation | 13 passed |
| Browser workflows | inbox filters/search/selection/keyboard/notifications; scenario 1 booking states; scenario 2 takeover; scenario 3 after-hours queue and clock advance; scenario 4 reschedule + explore-mode cancel; scenario 5 draft → approve → use → withdraw, local file upload; scenario 6 timeout/reconcile; presenter controls (play/pause/next/restart/reset, mode and scenario switching cancel scripted events); settings; viewports 1440×900 / 1100×800 / 900×700; reduced motion; accessible names; no console errors; no non-localhost requests (offline check); bundled fonts and images load | 46 passed, 1 skipped (recording, run separately) |

Manual visual review: inbox, workspace, booking panel, knowledge library and settings were inspected in
Chromium at 1440×900 and 1000–1100 px widths for clipping, hierarchy, density and glyph coverage
(Korean, Japanese, Simplified and Traditional Chinese render from the bundled Noto / IBM Plex fonts).

### Test run

Final run on the delivered build (`npx playwright test`):

- `unit` project: **43 passed** (calendar 5, seed 3, reducer 22, scenarios 13).
- `e2e` project: **46 passed, 1 skipped** — the skipped test is the walkthrough recording, gated behind
  `RECORD=1`; it was run separately and produced `docs/recording/walkthrough.webm`.
- The e2e suite was run four times in full during QA; the last three runs were fully green (no flakes).
- `npm run build` succeeds; the built bundle contains the woff2 font files and no CDN/Google Fonts references.
- Issues found during QA and fixed before delivery: reconciled "not created" bookings now keep their request id so
  the panel shows the outcome and a *Retry with new request* action; the presenter step label states that a loaded
  scenario is paused when switching to Explore; the after-hours banner groups skipped days ("Thu–Sat Chuseok, Sun closed").

Screenshots of the key states are in `docs/screenshots/` (01 inbox · 02 inquiry + photo · 03 booking confirmed ·
04 takeover · 05 knowledge approval · 06 after hours · 07 booking needs review).

## Simulated capabilities (nothing here talks to a real system)

| Capability shown in the demo | How it is simulated |
|---|---|
| Instagram, WhatsApp, LINE, WeChat conversations in one inbox | Fictional conversations in local sample data; channel "connection status" is a settings value |
| Assistant replies in Japanese / Chinese / English | Fixed, pre-written copy in scenario scripts; Korean staff translations are fixed copy, not live translation |
| Retrieval of manager-approved information | Scenario steps reference approved knowledge ids; the UI shows them as "Sources". No search, embeddings or model calls |
| Sending approved clinic photos | Reducer rejects any photo that is not `approved`; photos are illustrative vector renderings, not Midam photographs |
| Consultation booking, reschedule, cancel via the CRM | In-memory CRM record set; success/timeout is decided per conversation by `crmBehavior`; references are fictional (`MD-…`) |
| CRM timeout and reconciliation | Scripted timeout followed by a controlled reconcile action; never a real network call |
| Notifications and escalation recipients | In-app only; no push, email, KakaoTalk or SMS is sent to anyone |
| After-hours behaviour and the clinic clock | A simulated clock (`SET_CLOCK`, "advance to next opening") using the sample working hours and holidays |
| Staff / manager roles | A role switch labelled "Simulated role"; there is no authentication |
| Local photo upload | A real `<input type="file">` creates a session-only draft (object URL); nothing is uploaded anywhere |

## Remaining limitations

- No real channel, CRM, AI, translation or vector-search integration exists; none has been verified.
- Services, prices (e.g. the illustrative consultation fee), photos, hours, holidays and policies are
  illustrative sample content, not verified Midam Clinic information.
- Multilingual copy is fixed. Four lines are flagged `needsLanguageReview` in the data (see `docs/assets.md`)
  and should be read by fluent speakers before any customer-facing use.
- The assistant's "reasoning" is scripted: in Explore mode customers do not send new messages and the assistant
  does not compose new replies; Explore mode is for navigation, takeover/return, staff replies, booking actions
  and knowledge approval.
- State lives in memory only; reloading the page resets the demo (by design).
- Cross-channel identity merging, task management, analytics, payments, treatment appointments, photo
  interpretation and treatment recommendations are intentionally out of scope.
- Time inputs in Settings render in the browser's locale format; stored values are always 24-hour.
- Widths below ~900 px are usable but not tuned for presentation.
- The production schedule (two-week MVP, delivery in three–four weeks) is not represented by this demo's code;
  the demo's stack is not an architecture commitment.
