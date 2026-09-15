# Three-minute guided walkthrough

Target viewport: 1440 × 900 laptop. Start the demo (`npm start`), press **Reset all** once, keep the
mode on **Guided**. The **Demo · simulated integrations** chip stays visible throughout — say so up front.

## 0:00 — One workspace for every channel (Explore, ~40 s)

1. Switch to **Explore**. Point at the inbox: Instagram, WhatsApp, LINE and WeChat conversations in one list,
   each showing the customer's language (JA / ZH / EN), the latest message, unread state, and who owns the
   conversation — the assistant (node glyph) or a staff member.
2. Click the **LINE** filter: "Lin Chia-ying writes Traditional Chinese on LINE — language and channel are separate."
3. Click **Needs human**: Daniel Reyes is waiting for staff. Clear the filter. Type "airport" in search → Sophie.
4. "Everything here is illustrative — channel coverage and integrations are simulated for this demo."

## 0:40 — Inquiry, approved answer, approved photo (Scenario 1, ~50 s)

1. Switch to **Guided**, choose **Inquiry to consultation booking**, press **Play**.
2. A Japanese Instagram inquiry arrives (unread, JA). Playback pauses. Press **Next**: the conversation opens;
   toggle **Korean translation** to show the staff translation under the original.
3. The assistant *reads → retrieves approved information → composes* and answers in Japanese. Click
   **Sources · 3** on the reply: hours & location, languages, consultation process — manager-approved items only.
4. It sends the approved reception photo (from the knowledge library; the treatment-room photo is still a draft,
   so it cannot be chosen).

## 1:30 — Consultation booking with explicit confirmation (Scenario 1 continued, ~50 s)

1. The customer asks for a consultation; the assistant offers three times (calendar-aware, illustrative).
2. The customer chooses Thu 17 Sep 14:00; the assistant restates the details; the customer explicitly confirms.
   Playback pauses — open the **Consultation** panel: stage stepper shows *Time offered → Customer confirmed*.
3. **Next**: *Booking submitted* → simulated CRM returns success with reference **MD-24817**.
   Point out the two separate lines: **CRM: confirmed** and **Customer confirmation: sending → delivered**.
4. The confirmation card reaches the customer in Japanese with the same date, time and reference.

## 2:20 — Reliable human takeover (Scenario 2, ~40 s)

1. Choose **Human takeover**, **Play**. Lin Chia-ying asks whether a program suits her sensitive skin and wants
   a person. The assistant sends a short handover reply (it never assesses or recommends), a notification appears,
   the conversation enters **Needs human**.
2. Click the notification: the conversation opens with the handover summary. Click **Take over** — the assistant
   is paused for this conversation, any pending assistant reply is discarded, and the composer is enabled.
3. Send the staff reply. Finish with **Return to AI** to show the explicit hand-back.

## 3:00 — Close

"Two weeks to an MVP, delivery in three to four weeks; Midam operates it, Synaptix technicians support it."
Keep the other scenarios for questions:

| Question | Scenario |
|---|---|
| "What happens at night or on a holiday?" | **After-hours escalation** — Wed 23 Sep 21:40 → queued → next opening is Mon 28 Sep (Chuseok + Sunday skipped) |
| "Can it move or cancel a booking?" | **Reschedule or cancel** — same reservation MD-24811 moved, explicit confirmation, matching customer message |
| "Who controls what the assistant says and shows?" | **Manager-approved photo** — draft → manager approval → used in an answer → withdrawn |
| "What if the CRM doesn't answer?" | **Booking uncertainty** — timeout → *Booking status needs review* → reconcile, never a false success, no duplicates |

Rehearsal tip: `http://127.0.0.1:5173/?scenario=inquiry-to-booking` opens the demo with that scenario prepared and paused.
