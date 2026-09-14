# 00 — Scaffold log

File: `xeHvJ6cogxBAE6AZHCCzJu` — https://www.figma.com/design/xeHvJ6cogxBAE6AZHCCzJu
Editor type: `figma` (design). Date: 2026-09-14.

## Pages (final order, verified via `figma.root.children`)

| # | Page name | Node id |
|---|-----------|---------|
| 0 | 00 Cover & Navigation | `0:1` (renamed default "Page 1") |
| 1 | 01 Research & Sources | `2:2` |
| 2 | 02 Brand Strategy | `2:3` |
| 3 | 03 Creative Routes & Selection | `2:4` |
| 4 | 04 Logo System | `2:5` |
| 5 | 05 Color & Typography | `2:6` |
| 6 | 06 Graphic Language | `2:7` |
| 7 | 07 Applications | `2:8` |
| 8 | 08 Assets & Usage Guide | `2:9` |
| 9 | 99 Components (library) | `2:10` |

All pages are empty (0 children). Temporary font-probe text nodes (`2:11`–`2:18`) were created on `0:1` and deleted in the same script.

Note: `get_metadata` (no nodeId) reported only `0:1` immediately after the scaffold — it reads a cached snapshot and can lag `use_figma`. Trust `figma.root.children` from `use_figma`; pass the page ids above directly to `getNodeByIdAsync` + `setCurrentPageAsync`.

## Font availability (`figma.listAvailableFontsAsync()`, 8,927 fonts / 1,938 families)

| Family | Available | Styles |
|--------|-----------|--------|
| Pretendard | no | — |
| Pretendard Variable | no | — |
| Pretendard JP | no | — |
| Noto Sans KR | **yes** | Thin, Light, DemiLight, Regular, Medium, Bold, Black |
| IBM Plex Sans KR | **yes** | Thin, ExtraLight, Light, Regular, Medium, SemiBold, Bold |
| Spoqa Han Sans Neo | no | — |
| SUIT | no | — |
| SUIT Variable | no | — |
| Wanted Sans | no | — |
| Wanted Sans Variable | no | — |
| Inter | **yes** | Thin, Extra Light, Light, Regular, Medium, Semi Bold, Bold, Extra Bold, Black (+ matching "… Italic" for each; plain "Italic") — NOTE space in "Semi Bold" / "Extra Bold" / "Extra Light" |
| Geist | **yes** | Thin, ExtraLight, Light, Regular, Medium, SemiBold, Bold, ExtraBold, Black |
| Geist Mono | **yes** | Thin, ExtraLight, Light, Regular, Medium, SemiBold, Bold, ExtraBold, Black |
| JetBrains Mono | **yes** | Thin, ExtraLight, Light, Regular, Medium, Bold, ExtraBold (+ "… Italic" each; plain "Italic") |
| IBM Plex Mono | **yes** | Thin, ExtraLight, Light, Regular, Medium, SemiBold, Bold (+ "… Italic" each; plain "Italic") |
| Space Grotesk | **yes** | Light, Regular, Medium, Bold |
| Manrope | **yes** | ExtraLight, Light, Regular, Medium, SemiBold, Bold, ExtraBold |
| Roboto Mono | **yes** | Thin, ExtraLight, Light, Regular, Medium, SemiBold, Bold (+ "… Italic" each; plain "Italic") |
| Noto Sans Mono | no | — (no near-miss; "Noto Sans" family exists but is not the mono cut) |

### Additional Korean-capable families found (not requested, but available)

- **Gothic A1** — Thin, ExtraLight, Light, Regular, Medium, SemiBold, Bold, ExtraBold, Black (9 weights; best Pretendard-like substitute)
- Noto Serif KR — ExtraLight, Light, Regular, Medium, SemiBold, Bold, Black
- Hahmlet (serif) — 9 weights (Thin … Black)
- NanumGothic — Regular, Bold, ExtraBold; NanumMyeongjo — Regular, Bold, ExtraBold; NanumGothicCoding — Regular, Bold
- Gowun Dodum, Gowun Batang (Regular/Bold), KoPub Batang (Light/Regular/Bold), Sunflower (Light/Medium/Bold), Dongle, Gaegu
- Display/single-weight: Black Han Sans, Do Hyeon, Jua, Gasoek One, Moirai One, Song Myung, Stylish, Yeon Sung, Orbit, Diphylleia, Nanum Pen, Nanum Brush Script, etc.
- Legacy system: Batang, Dotum, Gulim (+Che variants), JejuGothic, JejuMyeongjo (Regular only)

### Recommended stack for this file

- Korean primary: `Noto Sans KR` (Regular / Medium / Bold / Black). Alternative: `Gothic A1` (Regular / Bold / ExtraBold), `IBM Plex Sans KR` (Regular / SemiBold / Bold).
- Latin display: `Geist` or `Inter` (remember Inter uses `"Semi Bold"`, `"Extra Bold"`).
- Mono: `Geist Mono` or `JetBrains Mono` (`"Regular"`, `"Medium"`, `"Bold"`).

## Font-load test (`loadFontAsync` + `createText` with "시넵틱스 클리닉 운영체제 0123", fontSize 32)

| Family / style | loadFontAsync | Node created | hasMissingFont | Rendered size |
|---|---|---|---|---|
| Noto Sans KR / Regular | ok | yes | false | 417×38 |
| Noto Sans KR / Bold | ok | yes | false | 422×38 |
| IBM Plex Sans KR / Regular | ok | yes | false | 414×48 |
| IBM Plex Sans KR / Bold | ok | yes | false | 414×48 |
| IBM Plex Sans KR / SemiBold | ok | yes | false | 414×48 |
| Gothic A1 / Regular | ok | yes | false | 433×40 |
| Gothic A1 / Bold | ok | yes | false | 450×40 |
| Gothic A1 / ExtraBold | ok | yes | false | 455×40 |

Font-loading errors: **none**. All 8 temporary nodes deleted; page `0:1` has 0 children.

## Errors encountered

- None from `use_figma`.
- `get_metadata` page listing lagged behind (showed 1 page after 10 existed) — treat as cache staleness, not a failure.

## Cheat-sheet example verification (page `2:6`)

- Run 1 (`3:2`–`3:5`): body text with `textAutoResize='HEIGHT'` + `layoutSizingHorizontal='FILL'` collapsed to width 0 / height 1690 (text-thread gotcha). `exportSettings` (PNG @2x + SVG) and `createVector` + `vectorPaths` worked. Nodes removed.
- Run 2 (`4:2`–`4:4`): same card with `'FIXED'` + `resize(576, h)` rendered correctly (card 640×168, body 576×52). Nodes removed; page has 0 children.
