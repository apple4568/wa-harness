# Assets — origin & licence

Everything the demo renders is bundled locally; nothing is fetched from a CDN at runtime.

## Images

| Path | Used as | Origin | Licence / provenance |
|---|---|---|---|
| `public/photos/reception.svg` | Knowledge photo `ph-reception` (approved) | Created for this demo (flat vector illustration) | Illustrative vector rendering created for this demo — not a photograph of Midam Clinic |
| `public/photos/consultation-room.svg` | Knowledge photo `ph-consultation-room` (approved) | Created for this demo | Same provenance line |
| `public/photos/entrance.svg` | Knowledge photo `ph-entrance` (approved) | Created for this demo | Same provenance line |
| `public/photos/treatment-room.svg` | Knowledge photo `ph-treatment-room` (draft) | Created for this demo — no devices depicted | Same provenance line |
| `public/photos/lounge.svg` | Knowledge photo `ph-lounge` (withdrawn, "previous layout") | Created for this demo | Same provenance line |
| `public/photos/recovery-lounge.svg` | Added during Scenario 5 as `ph-recovery-lounge` (draft → approved → withdrawn) | Created for this demo | Same provenance line |
| `public/photos/customer-attachment.svg` | Placeholder for `kind: 'customer_attachment'` messages — never knowledge | Created for this demo (blurred neutral shapes + label, no faces) | Created for this demo |
| `public/brand/symbol-cobalt.svg`, `symbol-two-tone.svg`, `symbol-white.svg` | Synaptix mark (header, favicon variants) | Synaptix brand kit bundled with the project | Brand asset — demo use only |
| `public/brand/horizontal-en.svg`, `horizontal-en-two-tone.svg` | Synaptix wordmark | Synaptix brand kit bundled with the project | Brand asset — demo use only |
| `public/brand/favicon-32.svg` | Favicon | Synaptix brand kit bundled with the project | Brand asset — demo use only |

All `public/photos/*.svg` files: `viewBox 0 0 800 500`, no external references, no embedded raster, no faces, no before/after imagery. Palette: `#F1F3F7`, `#E1E5EC`, `#C4CAD6`, `#3B4459` with `#2436E0` (cobalt) and `#31E3B5` (mint) accents. `customer-attachment.svg` carries one short caption in `system-ui` (no bundled font needed).

## Fonts (loaded via `src/fonts.ts`)

| Family | Package | Weights | Licence |
|---|---|---|---|
| IBM Plex Sans KR | `@fontsource/ibm-plex-sans-kr` | 400, 500, 600 | SIL Open Font License 1.1 |
| IBM Plex Mono | `@fontsource/ibm-plex-mono` | 400, 500 | SIL Open Font License 1.1 |
| Noto Sans JP | `@fontsource/noto-sans-jp` | 400, 500 | SIL Open Font License 1.1 |
| Noto Sans SC | `@fontsource/noto-sans-sc` | 400, 500 | SIL Open Font License 1.1 |
| Noto Sans TC | `@fontsource/noto-sans-tc` | 400, 500 | SIL Open Font License 1.1 |

Icons come from `lucide-react` (ISC licence), bundled from `node_modules`.

## Copy flagged `needsLanguageReview`

Each customer-facing line in Japanese / Chinese carries a fixed Korean translation. Lines a fluent speaker should double-check before the client meeting are flagged with `needsLanguageReview: true` on the `Message` and listed here.

| Message id | Where | Language | Why |
|---|---|---|---|
| `m-chiaying-05` | Scenario 2 (`src/scenarios/human-takeover.ts`) | zh-Hant | Handover wording ("是否適合個別的膚況") — check it reads naturally for a Taiwanese reader |
| `m-wei-05` | Scenario 3 (`src/scenarios/after-hours.ts`) | zh-Hans | Long after-hours explanation with holiday dates — confirm tone and that "下一个营业日 9月28日（周一）" is unambiguous |
| `m-misaki-09` | Scenario 1 (`src/scenarios/inquiry-to-booking.ts`) | ja | Booking-card phrasing ("ご予約が確定しました") — confirm register matches a clinic confirmation |
| `m-hina-08` | Scenario 6 (`src/scenarios/booking-uncertainty.ts`) | ja | Same booking-card phrasing as `m-misaki-09` |

Knowledge bodies (`src/data/knowledge.ts`) were written in all five languages by the data agent; the JA / zh-Hans / zh-Hant versions of `kb-services-overview` (programme category names) are the ones most worth a native read-through, since category naming is clinic-specific.
