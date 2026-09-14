# Build log (append-only; every builder appends a section with node ids it created)
File key: xeHvJ6cogxBAE6AZHCCzJu
Pages: 0:1 "00 Cover & Navigation" · 2:2 "01 Research & Sources" · 2:3 "02 Brand Strategy" · 2:4 "03 Creative Routes & Selection" · 2:5 "04 Logo System" · 2:6 "05 Color & Typography" · 2:7 "06 Graphic Language" · 2:8 "07 Applications" · 2:9 "08 Assets & Usage Guide" · 2:10 "99 Components (library)"

## Tokens (agent: tokens)
Built 2026-09-14 via use_figma. Nothing on-canvas was created; all tokens are file-level variables/styles. Verified by read-back: 54 variables, 17 paint styles, 12 text styles, 2 effect styles; every semantic alias resolves to a different hex in Light vs Dark (except text/on-accent = white in both, per spec).

### Collections / modes
- "Synaptix / Color" → `VariableCollectionId:6:2` · modes: Light `6:0` · Dark `6:1` (36 vars; primitives identical in both modes, semantics alias per mode)
- "Synaptix / Layout" → `VariableCollectionId:7:2` · mode: Default `7:0` (18 FLOAT vars)

### Color primitives (COLOR, scopes FRAME_FILL/SHAPE_FILL/TEXT_FILL/STROKE_COLOR/EFFECT_COLOR)
brand/cobalt-600 #2436E0 `VariableID:6:3` · brand/cobalt-700 #1C2BC7 `VariableID:6:4` · brand/cobalt-400 #6B7CFF `VariableID:6:5` · brand/cobalt-100 #E4E7FF `VariableID:6:6`
brand/mint-400 #31E3B5 `VariableID:6:7` · brand/mint-700 #0B6B55 `VariableID:6:8` · brand/mint-100 #DDF9F1 `VariableID:6:9`
ink/950 #0B1020 `VariableID:6:10` · ink/900 #141B2D `VariableID:6:11` · ink/700 #3B4459 `VariableID:6:12` · ink/500 #6B7385 `VariableID:6:13` · ink/300 #C4CAD6 `VariableID:6:14` · ink/200 #E1E5EC `VariableID:6:15` · ink/100 #F1F3F7 `VariableID:6:16` · ink/50 #F8F9FB `VariableID:6:17` · ink/white #FFFFFF `VariableID:6:18`
functional/success-600 #177E5C `VariableID:6:19` · functional/success-300 #5FE3B0 `VariableID:6:20` · functional/warning-600 #B45309 `VariableID:6:21` · functional/warning-300 #FFB454 `VariableID:6:22` · functional/error-600 #C8281B `VariableID:6:23` · functional/error-300 #FF8A80 `VariableID:6:24`

### Semantic aliases (Light → Dark)
semantic/bg/canvas `VariableID:8:2` ink/white→ink/950 · semantic/bg/surface `VariableID:8:3` ink/50→ink/900 · semantic/bg/inverse `VariableID:8:4` ink/950→ink/white
semantic/text/primary `VariableID:8:5` ink/950→ink/white · semantic/text/secondary `VariableID:8:6` ink/700→ink/300 · semantic/text/muted `VariableID:8:7` ink/500→ink/300 · semantic/text/on-accent `VariableID:8:8` white→white
semantic/border/default `VariableID:8:9` ink/200→ink/700 (scope STROKE_COLOR)
semantic/accent/default `VariableID:8:10` cobalt-600→cobalt-400 · semantic/accent/hover `VariableID:8:11` cobalt-700→cobalt-400 · semantic/pulse `VariableID:8:12` mint-700→mint-400
semantic/status/success `VariableID:8:13` success-600→success-300 · semantic/status/warning `VariableID:8:14` warning-600→warning-300 · semantic/status/error `VariableID:8:15` error-600→error-300
Scopes: bg/* = FRAME_FILL,SHAPE_FILL · text/* = TEXT_FILL · border = STROKE_COLOR · accent/pulse/status = all four.

### Layout (FLOAT)
space/4 `VariableID:7:3` · space/8 `7:4` · space/12 `7:5` · space/16 `7:6` · space/24 `7:7` · space/32 `7:8` · space/48 `7:9` · space/64 `7:10` · space/96 `7:11` · space/128 `7:12` (scopes GAP, WIDTH_HEIGHT)
radius/4 `VariableID:7:13` · radius/8 `7:14` · radius/12 `7:15` · radius/999 `7:16` (scope CORNER_RADIUS)
grid/desktop-margin 80 `VariableID:7:17` · grid/desktop-gutter 24 `7:18` · grid/mobile-margin 20 `7:19` · grid/mobile-gutter 16 `7:20`
(All short ids above are `VariableID:<n>`.)

### Paint styles (each paint bound to its variable via setBoundVariableForPaint — all 17 bound)
Brand/Cobalt 600 `S:6726344c97ed6b6c0687871ae99f8692e12a6bb9,` · Brand/Cobalt 700 `S:27858cc1b3ec43f05f118e302bd7c2311602cdaa,` · Brand/Cobalt 400 `S:86c386b3fe9b7f1fb8e6fc120b75ce7cef37361b,`
Brand/Mint 400 `S:b61c7642bf207bcec7203d20783822881eab277b,` · Brand/Mint 700 `S:3c7c038e03d2c2df91284815bf9f6080717ceab8,`
Ink/950 `S:8cba3180e5fb43ba239ad7dbfc648d9f79236d8b,` · Ink/900 `S:2f2dd25241f2fe038bdf206e5a8d580e66ec7f79,` · Ink/700 `S:e68ddcd2fdde32994118ac7436b55089d8ed4d5f,` · Ink/500 `S:b489ece618f9a7b24239be1d44f46413aac6f841,` · Ink/300 `S:4eed346c6bf57c3dd70cdd83536102be0b0cfe9b,` · Ink/200 `S:43069f1776cc31c7a429d3ce9e27049f57bc1c18,` · Ink/100 `S:e10c923d46a3547cfcf2c6f91c51e25d80e7f50d,` · Ink/50 `S:74526adaab8a17a92c56fc70e3a72bb98fbef67b,` · Ink/White `S:66588327fb3654020a9f113b00d42144430431ef,`
Functional/Success 600 `S:fc6fb831b462456562428a03a3304b15b1150cd5,` · Functional/Warning 600 `S:5abafef4bb375932744a4b521605b0d68c603ea4,` · Functional/Error 600 `S:cca8fd29ac101efe3679b50d3364f75be7cc8c98,`

### Text styles (fonts verified: "IBM Plex Sans KR" Bold/SemiBold/Medium/Regular · "IBM Plex Mono" Medium/Regular)
Display/64 `S:c3fae033542eda4b96908888cb323f203f287372,` · Heading/H1 48 `S:6aa5116ef64754ed2d4d0f83e75e1df598dd6f43,` · Heading/H2 32 `S:3a96ba6120afe784500fbf8373c805a382c0e6b3,` · Heading/H3 24 `S:8b1bba71b3ee225df46971b9976298f36354ee97,` · Heading/H4 20 `S:efe25f1a8e358e7e454283e96413b8e75f23934d,`
Body/L 18 `S:d1dab5e7419599fac8b835c54e7f7434e5eccabe,` · Body/M 16 `S:0049b56200cd0b13b431f79fa0d09351ced9df6b,` · Body/S 14 `S:75d481ebff1e1f8721fe46eab1c4e99e435e7377,` · Caption/12 `S:1a0ac18ebe66e24561824d2cdf8957e833f9839b,`
Numeric/L 32 `S:4d139cf478f8b13ce520c117c7e3425f34a25263,` · Numeric/M 16 `S:29223d603b7a010f79fb29b2dff8131201968207,` · Label/12 Mono (UPPER) `S:f27ed7209b81824750e2551f12fe4d468a7038c8,`
NOTE: style ids include the trailing comma — pass them verbatim.

### Effect styles
Elevation/Card (0 2 8 rgba(11,16,32,.08)) `S:15bceaff0b28ceb5e6446535b5e4ef1a6d9ce4e8,` · Elevation/Panel (0 8 24 rgba(11,16,32,.12)) `S:52037c02b321ac16ffce0743025735b1318a5254,`

### How to bind (copy into any use_figma script)
```js
const V = Object.fromEntries((await figma.variables.getLocalVariablesAsync()).map(v => [v.name, v]));           // lookup by name, e.g. V["semantic/bg/surface"]
frame.fills = [figma.variables.setBoundVariableForPaint({type:"SOLID", color:{r:0,g:0,b:0}}, "color", V["semantic/bg/surface"])];   // fill (returns NEW paint); same for strokes with V["semantic/border/default"]
frame.setBoundVariable("itemSpacing", V["space/16"]); frame.setBoundVariable("topLeftRadius", V["radius/8"]);   // FLOATs: padding*/itemSpacing/topLeftRadius.. (not cornerRadius); frame.effectStyleId = "S:15bceaff0b28ceb5e6446535b5e4ef1a6d9ce4e8,"
await figma.loadFontAsync({family:"IBM Plex Sans KR", style:"Regular"}); await textNode.setTextStyleIdAsync("S:0049b56200cd0b13b431f79fa0d09351ced9df6b,");   // Body/M 16 — load the style's font first; then bind text color: textNode.fills = [figma.variables.setBoundVariableForPaint({type:"SOLID",color:{r:0,g:0,b:0}}, "color", V["semantic/text/primary"])]
darkFrame.setExplicitVariableModeForCollection(await figma.variables.getVariableCollectionByIdAsync("VariableCollectionId:6:2"), "6:1");   // show Dark mode on a frame (Light = "6:0")
```
