# The Link S — symbol iteration notes

All geometry in the 100×100 unit box. Metrics: aperture = clear gap between a node and the spine (edge to edge); counter = open width inside a bowl; both in box units (16 px render ⇒ 1 unit = 0.16 px).

| it | change | aperture | counter | verdict |
|---|---|---|---|---|
| 1 | Spec §9 geometry verbatim (nodes r13 @ (71,25)/(29,75); cubic S, weight 17). Stroke outlined via shapely round buffer ∪ circles, cubic-fitted (tol 0.05). | ≈8 | ≈11 (slit) | Nodes only 1.5× the stroke → read as bumps; top-right node hangs into the aperture; top counter nearly closed even at 256 px. Fails the 16 px test. |
| 2 | Re-parametrised with 180° rotational symmetry; w 16, r 14; single symmetric cubic spine. | 11.6 | 7.4 | Nodes now read as circles at 24 px, but the elbow where arc meets spine turns too hard → bowl counters are diagonal slits. |
| 3 a–d | Spine split into two cubics with explicit centre tangent (40–50°) to steepen it. | 6–12 | 1–5 | Spine acquires an inflection wiggle (P1 tangent near-vertical then 45° at centre). Rejected. |
| 4 a–d | New geometric construction: each bowl = circular arc (centre T, radius R); spine = straight line through the box centre, *tangent* to both bowl circles (G1 joins, spine never intrudes into a counter). Shape fit to height 100. | 17–19 | 25–27 | Counters fully open, but bowl centres too far apart → spine 48–62°, reads as a swash/script S. |
| 5 a–d | Bowl centres stacked almost vertically (ox 3–7, oy 24–27), larger R (23–25), heavier pre-scale stroke. | 9–15 | 25 | Upright bold S. 5d (spine 39°) best; 5b/5c apertures too small (<10). |
| 6 a–d | Refine 5d: stroke 18.5–20, r 15.5–16 pre-scale, node angle −8…−15°. | 13–14.5 | 23–24 | **6a selected**: R 23, w 19, r 15.5, ox 7, oy 24, θA −12° → after fit: node r 13.72, stroke 16.81, spine 39.3°, aperture 14.1 (2.3 px @16), counter 23.9 (3.8 px @16). Closest to spec weights (17/13). |

Final checks on 6a (true rasters, Chromium): 16 px — S unmistakable, both counters open, nodes read as heavier terminals; 24 px — nodes visibly round; 32 px+ — fully resolved. White-on-Ink identical. Two nodes + one path only ⇒ not a mesh.
