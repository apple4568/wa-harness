# Synaptix · 시넵틱스 — Logo exports

Original vector identity for Route A "The Link S" (brand_spec.md §8–9): two circular nodes joined by one thick signal path. Every SVG is pure filled paths (no `<text>`, no strokes, no gradients), hex fills only, tight viewBox. Geometry for Figma recreation: `../spec/logo_geometry.md`. Design iteration log: `symbol-iterations.md`.

## Files

### svg/
| File | What | Fill |
|---|---|---|
| `symbol-primary.svg` | Link S symbol, single path | Ink #0B1020 |
| `symbol-two-tone.svg` | Path Ink + node circles Cobalt (primary colour usage) | #0B1020 / #2436E0 |
| `symbol-cobalt.svg` | Symbol on white / light neutrals | #2436E0 |
| `symbol-white.svg` | Reversed symbol (transparent bg) for Ink / Cobalt / photo-with-Ink-overlay | #FFFFFF |
| `symbol-mint.svg` | Pulse Mint symbol — **on Ink 950 only** (mint fails contrast on white) | #31E3B5 |
| `wordmark-en.svg` | "Synaptix", Space Grotesk Bold, −3 % tracking, i-dot replaced by node | Ink |
| `wordmark-ko.svg` | "시넵틱스", IBM Plex Sans KR Bold, −2 % tracking | Ink |
| `horizontal-en.svg` / `horizontal-ko.svg` | Symbol + wordmark, symbol = 1.15 × cap height, gap = 0.5 × symbol height | Ink |
| `horizontal-en-two-tone.svg` | Horizontal EN with Cobalt nodes | Ink / Cobalt |
| `horizontal-bilingual.svg` | KO primary, "Synaptix" (Space Grotesk Medium) at 45 % below-right | Ink |
| `stacked-en.svg` / `stacked-ko.svg` | Symbol (2 × cap) centred above the wordmark | Ink |
| `mono-black.svg` / `mono-white.svg` | Horizontal EN, pure #000000 / #FFFFFF (print, engraving, reversed) | — |
| `app-icon-512.svg` | Cobalt tile, 22 % corner radius, white symbol at 60 % width | #2436E0 / #FFFFFF |
| `favicon-32.svg` | Cobalt tile, white symbol at 74 % height (tuned for 16 px) | #2436E0 / #FFFFFF |

### png/ (Chromium renders, transparent unless the tile has its own background)
- `symbol-*@1x/@2x/@4x.png` — 256 / 512 / 1024 px tall, all five colourways
- `horizontal-*@1x/@2x.png`, `stacked-*@1x/@2x.png`, `mono-*@1x/@2x.png`, `wordmark-*@1x/@2x.png` — 600 px wide (1x) and 1200 px (2x)
- `app-icon-512.png`, `app-icon-1024.png`
- `favicon-16.png`, `favicon-32.png`, `favicon-64.png`
- `size-test.png` (+ `size-test@3x.png`) — contact sheet: symbol at 16/24/32/48/64 px and horizontal lockups at 96/128/200 px, on white and on Ink

## Usage rules (summary of brand_spec.md §9)
- **Colour**: Ink on light surfaces; white on Ink 950 / Cobalt / photos with ≥ 60 % Ink overlay; Cobalt symbol allowed on white. Two-tone (Ink + Cobalt nodes) is the primary colour version at ≥ 24 px. Mint symbol only on Ink.
- **Clear space**: one node diameter on all sides = 0.274 × symbol height (symbol alone) — for a horizontal lockup at cap height *c*, that is 0.315 × *c*. Measure from the tight bounding box.
- **Minimum sizes**: symbol 16 px / 5 mm · horizontal lockups 96 px / 24 mm · stacked 64 px / 18 mm · two-tone 24 px+ · favicon: use `favicon-*.png` (tile version), never the bare symbol at 16 px on unknown backgrounds.
- **Don't**: stretch, rotate, recolour off-palette, add gradients, outline-stroke the symbol, drop shadows, change node size, put it on low-contrast backgrounds, or add extra nodes/connectors (the mark is one path between two points — never a mesh).
- **Which lockup**: Korean-first surfaces use `horizontal-ko` / `stacked-ko`; English surfaces `horizontal-en`; mixed audiences `horizontal-bilingual`. App/social avatars use `app-icon-*`.

## Fonts (all SIL OFL 1.1 — outlines are flattened, no font files needed to use these assets)
- Space Grotesk Bold / Medium — github.com/floriankarsten/space-grotesk (`fonts/otf`)
- IBM Plex Sans KR Bold — google/fonts mirror (`ofl/ibmplexsanskr`), since the IBM/plex tree path in the brief was 404
- Noto Sans CJK KR Black was downloaded for the weight comparison but **not used**: Plex Sans KR Bold (stem 135 u) already matches Space Grotesk Bold (stem 126 u); Noto Black (162 u) is visibly heavier.
