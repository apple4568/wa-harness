# Synaptix — Logo geometry (source for Figma recreation)

Companion to `brand_spec.md` §9. Everything below is what was actually shipped in `brand/exports/`. Coordinates are SVG (y down). Fill rule for every path: **NONZERO** (Figma `vectorPaths[].windingRule = "NONZERO"`). No strokes anywhere — every shape is a filled outline.

## 1. Symbol "The Link S" — 100 × 100 unit box

### 1.1 Construction (centreline, before outlining)
Two circular-arc bowls joined by one straight signal path, 180° rotationally symmetric about (50, 50):
- Bowl circles: centre T = (56.19, 28.76) and T′ = (43.81, 71.24), centreline radius R = 20.35.
- Node A (top-right terminal) = (76.10, 24.53); Node B (bottom-left) = (23.90, 75.47); node radius r = 13.72 (diameter 27.43).
- Top arc: from A at -12° on the bowl circle, counter-clockwise over the top, 219° of arc, ending at E = (43.29, 44.50).
- Spine: straight segment E → E′ = (56.71, 55.50) through (50, 50), inclined 39.3° below horizontal; it is *tangent* to both bowl circles at E / E′ (G1 joins, so the spine never cuts into a counter).
- Bottom arc: point-mirror of the top arc.
- Stroke weight w = 16.81, round caps (caps are hidden inside the nodes).
- Resulting metrics: bowl counter width = 2R − w = 23.9; node-to-spine aperture = 14.1; outline bbox x 10.18–89.82, y 0–100 (79.6 × 100).
- Pre-fit parameters (for re-derivation with `geo.py`): R 23, w 19, r 15.5, ox 7, oy 24, θA −12°, then uniformly scaled ×0.8850 to fit height 100 and centred.

Centreline as SVG (for reference only; the shipped asset is the filled outline):
```
M 76.10 24.53 A 20.35 20.35 0 1 0 43.29 44.50 L 56.71 55.50 A 20.35 20.35 0 1 0 23.90 75.47
```

### 1.2 Filled outline — single-colour symbol (one closed path, NONZERO)
Stroke outline ∪ both node circles, cubic-fitted to ≤ 0.05 unit error. Use this `d` as one `vectorPath` in a 100 × 100 vector node:
```
M 78.89 11.1 C 66.24 -4.96 41.4 -3.3 31.21 14.51 C 29.42 17.64 28.24 21.11 27.72 24.68 C 26.3 34.54 30.26 44.69 37.96 51.01 C 42.43 54.67 46.9 58.33 51.37 61.99 C 53.22 63.51 54.59 65.58 55.27 67.88 C 58.5 78.88 45.84 87.65 36.56 80.74 C 37.46 78.4 37.83 75.95 37.46 73.46 C 37.09 70.94 36 68.54 34.36 66.6 C 26.83 57.72 12.26 61.75 10.36 73.24 C 10.05 75.16 10.14 77.14 10.65 79.02 C 11.19 81.05 12.2 82.94 13.58 84.51 C 15.57 86.79 18.19 88.21 21.11 88.9 C 33.76 104.96 58.6 103.3 68.79 85.49 C 70.58 82.36 71.76 78.89 72.28 75.32 C 73.7 65.46 69.74 55.31 62.04 48.99 C 57.57 45.33 53.1 41.67 48.63 38.01 C 46.78 36.49 45.41 34.42 44.73 32.12 C 41.5 21.12 54.16 12.35 63.44 19.26 C 62.54 21.6 62.17 24.05 62.54 26.54 C 62.82 28.47 63.52 30.33 64.58 31.96 C 70.88 41.74 85.85 39.65 89.23 28.51 C 89.97 26.07 90.01 23.44 89.35 20.98 C 88.81 18.95 87.8 17.06 86.42 15.49 C 84.43 13.21 81.81 11.79 78.89 11.1 Z
```

### 1.3 Two-tone symbol (path Ink #0B1020, nodes Cobalt #2436E0)
Path-only outline (stroke outline without the nodes; its round caps sit under the circles):
```
M 84.29 22.63 C 79.24 0.15 51.3 -7.78 35.36 8.94 C 32.86 11.56 30.86 14.66 29.51 18.02 C 24.86 29.64 28.28 43.07 37.96 51.01 C 42.43 54.67 46.9 58.33 51.37 61.99 C 54.43 64.5 56.08 68.45 55.7 72.39 C 55.47 74.67 54.59 76.87 53.17 78.66 C 48.23 84.89 38.58 84.6 34.02 78.09 C 33.26 77.01 32.69 75.8 32.32 74.54 C 32.12 73.82 31.99 73.08 31.72 72.38 C 31.04 70.67 29.8 69.21 28.22 68.26 C 22.07 64.57 14.34 69.92 15.62 76.98 C 16.23 80.28 17.58 83.53 19.35 86.38 C 31.71 106.28 61.44 103.84 70.4 82.2 C 75.21 70.56 71.77 56.97 62.04 48.99 C 57.57 45.33 53.1 41.67 48.63 38.01 C 45.57 35.5 43.92 31.55 44.3 27.61 C 44.53 25.3 45.43 23.08 46.88 21.28 C 51.84 15.11 61.44 15.42 65.98 21.91 C 66.74 22.99 67.31 24.2 67.68 25.46 C 67.88 26.18 68.01 26.92 68.28 27.62 C 68.96 29.33 70.2 30.79 71.78 31.74 C 76.59 34.62 82.9 32.01 84.26 26.57 C 84.59 25.24 84.52 23.96 84.29 22.63 Z
```
Nodes (draw on top): circle A cx 76.10 cy 24.53 r 13.72; circle B cx 23.90 cy 75.47 r 13.72.

## 2. Wordmarks (pure paths; 1 unit = 1 font unit, 1000 upm, baseline y = 0, y down)

### 2.1 EN "Synaptix" — Space Grotesk Bold, tracking −3 % (−30 u per gap), kerning applied (HarfBuzz)
Cap height 700; x-height 496; advance width 4082. The i-dot is removed and replaced by a node circle: centre (3447.0, -644.0), r 90 (= 0.129 cap, 1.43 × the i-stem of 126 u; the symbol's node/stroke ratio 0.82 would give r 103 which overpowers the x-height rhythm — 90 chosen visually).
viewBox: `34.0 -734.0 4082.0 934.0`
```
M309 14C471 14 574 -74 574 -202C574 -330 475 -382 326 -414L303 -419C219 -437 180 -462 180 -514C180 -566 217 -598 297 -598C377 -598 426 -566 426 -486V-456H556V-486C556 -638 447 -714 297 -714C147 -714 50 -638 50 -510C50 -382 135 -333 280 -301L303 -296C393 -276 444 -256 444 -198C444 -142 399 -102 309 -102C219 -102 164 -144 164 -228V-256H34V-228C34 -76 147 14 309 14Z M700 200H1012C1078 200 1122 156 1122 88V-496H996V-244C996 -152 951 -98 874 -98C806 -98 768 -135 768 -210V-496H642V-200C642 -77 719 8 835 8C924 8 964 -31 980 -65H998V60C998 80 988 90 970 90H700Z M1232 0H1358V-252C1358 -344 1403 -398 1480 -398C1548 -398 1586 -361 1586 -286V0H1712V-296C1712 -419 1635 -504 1519 -504C1430 -504 1390 -465 1374 -431H1356V-496H1232Z M1972 14C2076 14 2107 -42 2116 -67H2135V-66C2135 -26 2171 0 2220 0H2304V-104H2264C2246 -104 2236 -114 2236 -134V-319C2236 -443 2154 -510 2024 -510C1895 -510 1830 -445 1806 -370L1922 -331C1931 -376 1959 -408 2022 -408C2086 -408 2114 -374 2114 -328V-300H1978C1866 -300 1786 -247 1786 -145C1786 -43 1866 14 1972 14Z M1994 -88C1940 -88 1912 -113 1912 -149C1912 -185 1940 -206 1987 -206H2114V-196C2114 -130 2064 -88 1994 -88Z M2366 200H2492V-57H2510C2531 -22 2574 14 2664 14C2784 14 2888 -78 2888 -240V-256C2888 -418 2783 -510 2664 -510C2574 -510 2531 -474 2508 -436H2490V-496H2366Z M2626 -96C2548 -96 2490 -147 2490 -243V-253C2490 -349 2549 -400 2626 -400C2703 -400 2762 -349 2762 -253V-243C2762 -147 2704 -96 2626 -96Z M3148 0H3288V-104H3192C3174 -104 3164 -114 3164 -134V-392H3300V-496H3164V-650H3038V-496H2914V-392H3038V-112C3038 -44 3082 0 3148 0Z M3384 0H3510V-496H3384Z M3576 0H3724L3837 -167H3855L3968 0H4116L3936 -250L4114 -496H3968L3855 -331H3837L3724 -496H3578L3756 -250Z M 3537 -644 C 3537 -594.3 3496.7 -554 3447 -554 C 3397.3 -554 3357 -594.3 3357 -644 C 3357 -693.7 3397.3 -734 3447 -734 C 3496.7 -734 3537 -693.7 3537 -644 Z
```

### 2.2 KO "시넵틱스" — IBM Plex Sans KR Bold, tracking −2 % (−20 u per gap)
Weight check: Plex Sans KR Bold vertical stem 135 u vs Space Grotesk Bold i-stem 126 u → parity, so Noto Sans KR Black (162 u, visibly heavier) was **not** used. Hangul body spans y −779…+156 (935 u).
viewBox: `31.0 -779.0 3444.0 935.0`
```
M799 -779V109H664V-779Z M402 -408Q422 -408 435 -391L597 -182L493 -94L328 -320Q326 -325 319 -325Q313 -325 310 -320Q283 -267 241 -210.5Q199 -154 134 -78L31 -165Q145 -288 194 -387.5Q243 -487 243 -607V-720H378V-608Q378 -481 338 -379L343 -376L367 -395Q383 -408 402 -408Z M1691 -779V-280H1563V-779Z M1375 -512H1216V-621H1375V-766H1500V-285H1375Z M1316 -333Q1183 -302 1001 -302H930V-725H1056V-411Q1186 -412 1300 -439Z M1559 -236H1691V145H1175Q1090 145 1090 60V-236H1222V-150H1559Z M1559 -45H1222V40H1559Z M2546 -779V-228H2411V-779Z M2334 -275Q2249 -260 2156 -252.5Q2063 -245 1925 -245H1830V-729H2255V-621H1962V-545H2243V-438H1962V-352Q2074 -353 2156 -360Q2238 -367 2318 -380Z M1950 -184H2546V156H2414V-72H1950Z M2752 -260 2676 -365Q2853 -444 2926.5 -520.5Q3000 -597 3000 -690V-734H3139V-687Q3139 -569 3075 -484L3082 -480L3126 -512Q3149 -529 3169 -529Q3188 -529 3210 -515L3448 -369L3371 -263L3098 -441Q3084 -450 3068 -450Q3050 -450 3036 -439L3034 -438Q2989 -394 2920.5 -351.5Q2852 -309 2752 -260Z M3475 -100V14H2649V-100Z
```

### 2.3 EN small "Synaptix" — Space Grotesk Medium, tracking −2 % (bilingual lockup only; same i-node treatment, r 84 = 0.816 × its 103 u stem)
viewBox: `41.0 -728.0 4130.0 928.0`
```
M311 14C468 14 569 -71 569 -196C569 -322 472 -371 337 -401L300 -410C211 -430 164 -456 164 -519C164 -582 213 -619 299 -619C387 -619 446 -582 446 -492V-456H553V-492C553 -639 445 -714 299 -714C154 -714 57 -639 57 -516C57 -393 142 -345 277 -314L314 -305C406 -284 462 -261 462 -194C462 -128 410 -81 311 -81C212 -81 148 -129 148 -229V-254H41V-229C41 -72 154 14 311 14Z M723 200H1029C1090 200 1128 162 1128 101V-493H1025V-243C1025 -137 970 -79 885 -79C809 -79 764 -118 764 -204V-493H661V-196C661 -69 742 9 855 9C949 9 992 -33 1010 -72H1026V80C1026 100 1017 110 998 110H723Z M1260 0H1363V-249C1363 -355 1419 -413 1504 -413C1579 -413 1624 -374 1624 -288V0H1727V-296C1727 -423 1646 -501 1534 -501C1439 -501 1396 -459 1377 -419H1361V-493H1260Z M2008 14C2110 14 2146 -38 2161 -70H2177V-67C2177 -26 2209 0 2255 0H2332V-86H2290C2272 -86 2262 -96 2262 -116V-319C2262 -439 2184 -507 2056 -507C1930 -507 1865 -440 1841 -362L1937 -331C1949 -384 1984 -421 2055 -421C2127 -421 2161 -383 2161 -326V-294H2011C1903 -294 1823 -242 1823 -142C1823 -42 1903 14 2008 14Z M2023 -71C1962 -71 1926 -100 1926 -145C1926 -190 1962 -214 2017 -214H2161V-204C2161 -121 2105 -71 2023 -71Z M2412 200H2515V-67H2531C2554 -27 2601 14 2697 14C2821 14 2925 -80 2925 -239V-254C2925 -413 2820 -507 2697 -507C2601 -507 2554 -466 2529 -422H2513V-493H2412Z M2667 -76C2578 -76 2514 -136 2514 -242V-251C2514 -357 2579 -416 2667 -416C2756 -416 2821 -357 2821 -251V-242C2821 -136 2757 -76 2667 -76Z M3200 0H3336V-87H3233C3214 -87 3205 -97 3205 -117V-406H3352V-493H3205V-656H3102V-493H2966V-406H3102V-99C3102 -38 3139 0 3200 0Z M3453 0H3556V-493H3453Z M3647 0H3770L3901 -181H3917L4049 0H4171L3983 -249L4168 -493H4046L3917 -316H3901L3772 -493H3651L3835 -249Z M 3588.5 -644 C 3588.5 -597.6 3550.9 -560 3504.5 -560 C 3458.1 -560 3420.5 -597.6 3420.5 -644 C 3420.5 -690.4 3458.1 -728 3504.5 -728 C 3550.9 -728 3588.5 -690.4 3588.5 -644 Z
```

## 3. Lockup layout math
Let cap = EN cap height in px (Space Grotesk cap 700 u ⇒ scale k_en = cap / 700). For KO, the Hangul body (935 u) is set to 1.08 × cap (Hangul optically matches Latin caps when ~8 % taller) ⇒ k_ko = cap / 865.7.
- Symbol height h_s = 1.15 × cap; symbol scale = h_s / 100; symbol width = 0.796 × h_s.
- Gap symbol→wordmark = 0.5 × h_s. Symbol is vertically centred on the cap-height band (centre at baseline − cap/2).
- Clear space = one node diameter = 27.43/100 × h_s = 0.274 × h_s on all sides (measured from the tight bbox).
- **horizontal-en** (cap 100): symbol 115 tall / 91.6 wide at x 0; wordmark starts at x 149.1; total 732.2 × 136.1.
- **horizontal-ko** (cap-equivalent 100, Hangul body 108): same symbol; total 546.9 × 125.5.
- **horizontal-bilingual**: KO wordmark at cap-eq 100; EN (Medium) at 0.45 × cap, right-aligned to the KO wordmark, its cap top 0.35 × cap below the Hangul body; symbol height = full text-block height (202.7), gap 57.5.
- **stacked-en / stacked-ko**: symbol height = 2.0 × cap centred over the wordmark; vertical gap = 0.4 × symbol height; block width = max(symbol, wordmark). (The 1.15/0.5 rule is for horizontals; a 1.15-cap symbol above a 5.9-cap-wide wordmark is too small to anchor a stack.)
- **mono-black / mono-white**: horizontal-en with every fill #000000 / #FFFFFF.
- **app-icon-512**: 512 square, Cobalt #2436E0, corner radius 22 % (112.6), white symbol 60 % of icon width (307.2 wide, 385.8 tall), centred.
- **favicon-32**: same construction at 32 px; symbol 74 % of icon *height* (the 60 %-width rule leaves the S under 10 px at 16 px).
- Minimum sizes (from the size test): symbol 16 px / 5 mm; horizontal lockups 96 px / 24 mm; stacked 64 px / 18 mm; two-tone only ≥ 24 px.
