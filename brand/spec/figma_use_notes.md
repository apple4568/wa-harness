# use_figma cheat sheet — file `xeHvJ6cogxBAE6AZHCCzJu`

Verified in this file on 2026-09-14 unless marked "(from skill)". Page ids: `logs/00_scaffold.md`.

## 1. Calling the tool

- Before the first call each session: `mcp__Figma__get_figma_skill` → `skill://figma/figma-use/SKILL.md` (mandatory), then `ToolSearch "select:mcp__Figma__use_figma,mcp__Figma__get_metadata,mcp__Figma__get_screenshot"`.
- Parameters: `fileKey: "xeHvJ6cogxBAE6AZHCCzJu"`, `code` (JS string, **max 50,000 chars**), `description`, `skillNames: "resource:figma-use"`.
- The code runs inside an async wrapper: write plain top-level JS with `await` and end with **`return {...}`**. Do not wrap in an IIFE, do not call `figma.closePlugin()`, `figma.notify()` (throws "not implemented"), `console.log` (never returned), `loadAllPagesAsync`, `setPluginData`, `createImage(Async)`.
- Return value is JSON-serialized. **Always return every created/mutated node id** (`{ createdNodeIds: [...] }`) — ids are the only state that survives between calls. `await node.screenshot()` returns a PNG inline.
- Thrown errors come back as the result with `safeToRetryWithoutCanvasRead`: `true` → fix and retry; `false` → read the canvas first (something may have been created).
- Chunking: ≤10 logical operations per call (create + configure + parent). Build top-down: skeleton frames with `placeholder = true`, fill each section in later calls, set `placeholder = false`. Order: tokens → styles → components → sections → verify.
- Colors are 0–1 floats; paint `color` is `{r,g,b}` only (opacity goes on the paint: `{type:'SOLID', color, opacity:0.5}`); COLOR variable values are `{r,g,b,a}`. Fills/strokes/effects are read-only arrays: clone → edit → reassign.
- `width`/`height` are read-only → `resize(w,h)`; `x`/`y` are writable. `resize()` resets both axis sizing modes to FIXED, so call it **before** setting HUG.

## 2. Pages and placement

- `figma.currentPage` resets to page 0 on every call. Switch with `const p = await figma.getNodeByIdAsync("2:6"); await figma.setCurrentPageAsync(p);` — **at most once per call** (`figma.currentPage = p` throws). Multi-page work = one call per page, issued in parallel in one message.
- Top-level nodes land at (0,0). Compute a clear spot first (`maxX = max(child.x + child.width)`), then `page.appendChild(node); node.x = ...; node.y = ...;`. Set x/y **after** `appendChild` (reparenting does not reset position). Children of auto-layout frames need no x/y.
- `get_metadata` reads a cached snapshot and lagged behind `use_figma` here (showed 1 page after 10 existed). Trust `figma.root.children`. Keep traversals scoped: `frame.findAllWithCriteria({types:['TEXT']})` > `figma.currentPage...` > never `figma.root.findAll`.
- Sections do not auto-size: `section.resizeWithoutConstraints(w, h)` after adding content.

## 3. Fonts and text (the #1 failure source)

Verified font strings in this file:
- Korean: `{family:"Noto Sans KR", style:"Regular"|"Medium"|"Bold"|"Black"|"Light"|"DemiLight"|"Thin"}` (recommended), `{family:"Gothic A1", style:"Regular"|"Bold"|"ExtraBold"|...9 weights}`, `{family:"IBM Plex Sans KR", style:"Regular"|"SemiBold"|"Bold"|...}`. Pretendard, SUIT, Wanted Sans, Spoqa are **not** available.
- Latin: `Inter` (styles have spaces: `"Semi Bold"`, `"Extra Bold"`, `"Extra Light"`), `Geist`, `Manrope`, `Space Grotesk` (`"SemiBold"`/`"ExtraBold"` without a space). Mono: `Geist Mono`, `JetBrains Mono`, `IBM Plex Mono`, `Roboto Mono`. `Noto Sans Mono` is not available.

Rules:
1. `await figma.loadFontAsync({family, style})` for **every** family+style you will touch, before `createText`/`characters`/`fontName`/`fontSize`, and before `appendChild`/`setBoundVariable` on nodes that already contain text. Batch: `await Promise.all(fonts.map(f => figma.loadFontAsync(f)))`.
2. Order per node: `fontName` → `fontSize` → `lineHeight`/`letterSpacing` (objects: `{value:24, unit:'PIXELS'}` / `{unit:'AUTO'}`) → `textAutoResize` → append → sizing → `characters`.
3. Mixed styles in one node: set `characters` first, then `setRangeFontName(start, end, {family, style})`, `setRangeFontSize`, `setRangeFills` (every range font must be loaded). Editing existing text: load `node.getStyledTextSegments(['fontName'])` fonts, not a guess.
4. **Wrapping body text**: `textAutoResize = 'HEIGHT'` + `layoutSizingHorizontal = 'FIXED'` + `resize(width, node.height)`. In this file, `'FILL'` on the text collapsed it to width 0 and 1,690 px tall even with `'HEIGHT'` set and a FIXED-width parent. Assert `node.width > 0`.
5. Single-line labels/titles: leave `WIDTH_AND_HEIGHT` and set `layoutSizingHorizontal = 'HUG'` after appending.

## 4. Auto-layout order

`figma.createAutoLayout('VERTICAL', {name, itemSpacing})` gives a hugging frame. Then: paddings/alignment → `page.appendChild(frame)` → `x/y` → `resize(w,h)` (if fixed width) → `layoutSizingHorizontal='FIXED'`, `layoutSizingVertical='HUG'`. For children: `parent.appendChild(child)` **first**, then `layoutSizingHorizontal/Vertical = 'FILL'|'HUG'|'FIXED'`. `HUG` is legal only on auto-layout frames and TEXT children; `FILL` needs an auto-layout parent that is itself FIXED/FILL (a HUG parent collapses FILL children). `counterAxisAlignItems` has no `'STRETCH'` — use `'MIN'` + child FILL. `primaryAxisSizingMode`/`counterAxisSizingMode` take `'FIXED'|'AUTO'` (a different enum). Wrap grids: `layoutWrap='WRAP'`, `itemSpacing`, `counterAxisSpacing`.

## 5. Vectors, icons, export

- Path: `const v = figma.createVector(); v.vectorPaths = [{windingRule:'NONZERO'|'EVENODD', data:'M 0 0 L 40 0 L 40 40 Z'}]; v.fills=[...]; v.strokes=[...]; v.strokeWeight=2;` (verified; resulting size = path bounds). Network form (from skill): `await v.setVectorNetworkAsync({vertices:[{x,y},...], segments:[{start,end,tangentStart?,tangentEnd?}], regions:[{windingRule, loops:[[segIdx...]]}]})`. Dash: `v.dashPattern=[4,8]`.
- Icons/logos from SVG: `const n = figma.createNodeFromSvg(svgString); n.resize(24,24);` — include `viewBox` + `width`/`height`. Never rebuild icons from rotated lines. Booleans: `figma.union/subtract/intersect/exclude(nodes, parent)`, `figma.flatten(nodes, parent)`.
- Export settings (verified): `node.exportSettings = [{format:'PNG', suffix:'@2x', constraint:{type:'SCALE', value:2}}, {format:'SVG', suffix:'', svgOutlineText:true, svgIdAttribute:false, svgSimplifyStroke:true}, {format:'PDF', suffix:''}]`. Figma fills in `contentsOnly:true, colorProfile:'DOCUMENT'`. Images: use the `upload_assets` tool, never bytes in-script.

## 6. Variables, styles, components

- Variables: `const c = figma.variables.createVariableCollection('Color'); c.renameMode(c.modes[0].modeId,'Light'); const dark = c.addMode('Dark'); const v = figma.variables.createVariable('brand/500', c, 'COLOR'); v.setValueForMode(c.modes[0].modeId, {r,g,b,a:1}); v.scopes = ['FRAME_FILL','SHAPE_FILL'];` (**always set scopes**; `[]` hides primitives; `TEXT_FILL`, `STROKE_COLOR`, `GAP`, `CORNER_RADIUS`, `WIDTH_HEIGHT`, `FONT_SIZE`...). Alias: `sem.setValueForMode(mode, {type:'VARIABLE_ALIAS', id: prim.id})`. Duplicate names do not throw — check `getLocalVariablesAsync()` first. Return `collection.id`, mode ids, variable ids.
- Bind fill: `node.fills = [figma.variables.setBoundVariableForPaint({type:'SOLID', color:{r:0,g:0,b:0}}, 'color', v)]` (returns a **new** paint; SOLID only). Numbers: `node.setBoundVariable('itemSpacing'|'paddingTop'|'topLeftRadius'|'width'|'opacity', floatVar)` — not `cornerRadius`, `fontSize`, `lineHeight`. Frames showing a mode: `frame.setExplicitVariableModeForCollection(collection, modeId)`.
- Paint style: `const s = figma.createPaintStyle(); s.name='Brand/Primary'; s.paints=[{type:'SOLID', color}]; await node.setFillStyleIdAsync(s.id)`. Text style: load font → `const t = figma.createTextStyle(); t.name='KR/Heading/XL'; t.fontName={family:'Noto Sans KR', style:'Bold'}; t.fontSize=40; t.lineHeight={value:52,unit:'PIXELS'}; t.letterSpacing={value:-1,unit:'PERCENT'}; await text.setTextStyleIdAsync(t.id)`. Effect style: `figma.createEffectStyle()` + `effects=[{type:'DROP_SHADOW', color:{r,g,b,a}, offset:{x,y}, radius, spread:0, visible:true, blendMode:'NORMAL'}]`; `node.effectStyleId`. List with `getLocalPaintStylesAsync/TextStylesAsync/EffectStylesAsync`.
- Components: `const c = figma.createComponent(); c.name='Logo/Primary'; c.description='...'` (description only on COMPONENT/COMPONENT_SET) or `figma.createComponentFromNode(frame)`. Instances: `c.createInstance()` then append + position. Variants: name each `prop=value, prop2=value`, `addComponentProperty` (returns a **string key**) before `figma.combineAsVariants(components, page)`, then lay children out manually and `set.resizeWithoutConstraints(...)`. Find on-canvas: `page.findAllWithCriteria({types:['COMPONENT','COMPONENT_SET']})` (no `getLocalComponents`). Instance text: `instance.setProperties({[key]: 'text'})`. Put components on `99 Components (library)` (`2:10`) and instance them elsewhere via ids.

## 7. Concurrency / ordering caveats

- Each call is a fresh script context — only node/variable/style ids survive.
- Parallel calls are fine when they touch different pages or disjoint subtrees; do not run two calls that append to the same auto-layout frame or that both compute "next free x" on the same page.
- Independent awaits (`loadFontAsync`, `getNodeByIdAsync`, `getVariableByIdAsync`) → `Promise.all`. Only `setCurrentPageAsync` must be sequential and single.
- `detachInstance()` changes ancestor ids. Narrow before type-specific props (`'characters' in node`) — `?.` does not protect you; unknown property writes throw "object is not extensible".

## 8. Verified example — Korean card on page 05 (result: card 640×168, body 576×52)

```js
const page = await figma.getNodeByIdAsync("2:6");          // 05 Color & Typography
await figma.setCurrentPageAsync(page);
await Promise.all([
  figma.loadFontAsync({ family: "Noto Sans KR", style: "Bold" }),
  figma.loadFontAsync({ family: "Noto Sans KR", style: "Regular" }),
]);
const W = 640, PAD = 32;
const card = figma.createAutoLayout("VERTICAL", { name: "Example Card", itemSpacing: 12 });
card.paddingTop = PAD; card.paddingBottom = PAD; card.paddingLeft = PAD; card.paddingRight = PAD;
card.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
card.cornerRadius = 16;
figma.currentPage.appendChild(card);
card.x = 400; card.y = 400;
card.resize(W, 200);                       // resize BEFORE sizing modes
card.layoutSizingHorizontal = "FIXED";
card.layoutSizingVertical = "HUG";

const title = figma.createText();
title.fontName = { family: "Noto Sans KR", style: "Bold" };
title.fontSize = 32;
title.lineHeight = { value: 40, unit: "PIXELS" };
title.characters = "시넵틱스 클리닉 운영체제";
title.fills = [{ type: "SOLID", color: { r: 0.06, g: 0.07, b: 0.09 } }];
card.appendChild(title);
title.layoutSizingHorizontal = "HUG";

const body = figma.createText();
body.fontName = { family: "Noto Sans KR", style: "Regular" };
body.fontSize = 16;
body.lineHeight = { value: 26, unit: "PIXELS" };
body.textAutoResize = "HEIGHT";            // wrap vertically
card.appendChild(body);
body.layoutSizingHorizontal = "FIXED";     // NOT 'FILL' — it collapses to width 0
body.resize(W - PAD * 2, body.height);
body.characters = "브랜드 시스템 문서는 리서치, 전략, 크리에이티브 루트, 로고, 컬러, 타이포그래피, 그래픽 언어, 적용 예시로 구성됩니다.";
body.fills = [{ type: "SOLID", color: { r: 0.3, g: 0.32, b: 0.36 } }];
if (body.width === 0) throw new Error("text collapsed");
return { createdNodeIds: [card.id, title.id, body.id], size: [card.width, card.height] };
```
