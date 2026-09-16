# Midam Clinic — discovery meeting

- **Date:** 2026-09-16
- **Stage:** prospect (discovery)
- **Source of this note:** verbal debrief after the meeting; not a transcript. Items marked _(unverified)_ need confirming with the clinic.

---

## 1. Who they are

Aesthetic clinic running inbound patient acquisition largely through Instagram, with a
**Taiwanese patient base**. Two sides to the operation:

- **Korean side** — clinic staff, the only people with access to the clinic's CRM.
- **Taiwan side** — a manager based in Taiwan who functions as a **broker**: they qualify and
  convert the Taiwanese inquiries but have **no CRM access at all**, because they are abroad and
  cannot open the system.

## 2. The stated problem (their words, their priority)

**Roughly 300+ Instagram DMs / inquiries per month, in Taiwanese, that they cannot answer.**

- Volume exceeds what the team can reply to, so replies routinely lag **over a week**.
- Taiwanese prospects lose patience and re-contact through **LINE** or even **KakaoTalk**.
- Net effect: leads leak out of the channel the clinic actually controls, and arrive scattered
  across channels the clinic does not staff well.

He was explicit about the ranking at the end of the meeting: **fragmented channels are a real
problem but secondary.** The thing he wants gotten right first is **getting through the ~300
Instagram DMs a month on Instagram itself.**

## 3. Current workflow (as described)

```
Instagram DM inquiry
  → lead qualification            (Taiwan manager / broker)
  → reservation confirmation      (Taiwan manager / broker)
  → details sent to a Korean employee + uploaded to Google Calendar
  → Korean employee checks the dates and opens the CRM to verify
  → Korean employee inputs the booking into Vegas CRM
```

Two hand-offs are doing all the damage: the DM backlog at the front, and the
**manual re-entry by a Korean employee** at the back because the person who actually took the
booking cannot touch the CRM.

## 4. Systems / constraints

| Item | Status |
|---|---|
| **Vegas CRM** | The clinic's system of record. **API access is partnership-only** — confirmed by research, not available to us today. **We can neither read nor write Vegas CRM at present.** |
| Existing AI vendor | Vegas CRM is already partnered with an AI solution — name captured as **"Wise AI" / "WiseUp AI" _(unverified, needs confirming)_**. Their focus is mostly **domestic (Korean) inbound phone calls**, i.e. a different surface from Instagram DM. |
| Google Calendar | In use today as the informal bridge between the Taiwan broker and the Korean staff. |
| Instagram | The channel that matters. Primary inbound. |
| LINE / KakaoTalk | Overflow channels patients fall back to. Secondary for now. |

## 5. What he asked for

1. **Instagram DM automation** — handle the inbound volume on Instagram.
2. **Chatbot for the simple questions**, in Taiwanese. The three he named:
   - "Do you have *X* procedure?"
   - "How much is *Y*?"
   - "Can I reserve *Z* date?"
3. **Human fallback with notification** — anything that needs a person routes to an employee and
   they get told about it.
4. **Chatbot able to read and write Vegas CRM.**

## 6. Buying signal

> In the next 90 days, if this was achieved, he would be likely to move on.

So: a **90-day window**, with the Instagram DM channel as the pass/fail criterion.

## 7. Risks and open questions

- **Vegas CRM read/write is the one item we currently cannot deliver.** It is gated behind a
  partnership that a competing AI vendor already holds. Before committing to it in a 90-day scope
  we need one of: (a) the clinic sponsoring/requesting API access on our behalf as their customer,
  (b) a partnership approach to Vegas directly, or (c) an agreed interim design that does **not**
  depend on the CRM API.
- Worth noting the interim design is close to their existing workflow: the bot handles DMs,
  qualifies, and produces a structured booking record that the Korean employee confirms into
  Vegas CRM — same last step they already perform, but with the backlog and the re-typing removed.
  That also gives the **Taiwan broker a surface they are allowed to use**, which the CRM will
  never be while they are abroad.
- Confirm the existing AI vendor's name and the exact scope of their contract — if it is
  calls-only, Instagram DM may be uncontested; if it is exclusive, that changes the deal.
- Confirm "300+" is per month (stated both as a standing backlog and as a monthly figure) and get
  the actual split: how many are genuinely the three simple question types vs. need a human.
- Language: Taiwanese patients — confirm Traditional Chinese, and who reviews bot copy for tone.
- Medical-advertising constraints apply to anything the bot says about procedures and pricing
  (의료법 Art. 56/57) — pricing answers and procedure claims need a reviewed, fixed answer set.

## 8. Next steps

- [ ] Confirm the existing AI vendor's name and contract scope.
- [ ] Establish whether Vegas CRM API access is obtainable via the clinic as customer.
- [ ] Get sample DMs (anonymised) to size the simple-vs-human split.
- [ ] Draft a 90-day scope for the Instagram DM channel that stands on its own without the CRM API,
      with CRM read/write as a phase 2 conditional on access.

---

> **Note:** the debrief ended mid-sentence — _"He said if I were to automate the instagram dm
> channel +"_ — so there is at least one more condition or ask from the close of the meeting that
> is not captured here. To be filled in.
