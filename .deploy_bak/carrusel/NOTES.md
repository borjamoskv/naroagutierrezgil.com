# NOTES — Parallax Carousel (Naroa Gutiérrez Gil)

Distilled research for the self-contained parallax carousel in `public/carrusel/` (7 images, POP hyper-realistic portraits).

**Sources:**
- [Parallax scrolling: 14 mind-blowing examples (Creative Bloq, 2025)](https://www.creativebloq.com/web-design/parallax-scrolling-1131762)
- Classic patterns: Firewatch demo (6 layers), layered multiplane-style parallax carousels, reference implementations utilizing `data-depth` + lerp (pattern popularized by CodePen demos and libraries like Rellax/Parallax.js, applied here in vanilla).

---

## 1. Defining the "Parallax Carousel" Visual Pattern

Parallax originates from the multiplane camera of classic animation: **proximal layers traverse faster than distal layers**, and this velocity differential engineers depth illusion. The canonical example from the article is **Firewatch**: 6 layers drifting at distinct velocities, "simple and discrete" effect, zero scroll hijacking. Relevant horizontal examples (Canals, Delassus Group) demonstrate that parallax performs equally well —if not better— on a horizontal carousel axis: "smooth horizontal scrolling makes great use of parallax to draw attention to each new section... subtle impression of depth".

Ported to a slide carousel, the strict pattern is:

- **Each slide houses multiple stacked layers** (2–4 per slide): background/atmosphere, primary image (portrait), and foreground or graphic element (title, grain, POP shape). 6 layers like Firewatch are unnecessary; 3 tightly calibrated layers suffice for the effect.
- **During carousel translation, each layer moves at a distinct fraction of the global translation**, dictated by its `data-depth`. A layer with depth 0 matches track velocity; layers with higher depth move slower (appearing to "lag behind" = distance) or advanced (aggressive foreground, negative depth).
- **Slide ingress/egress**: outgoing and incoming slides overlap temporally. During transition, outgoing slide layers maintain their drift velocity (residual drift) while incoming layers "land" from an opposing offset. This yields the perception of a camera penetrating 3D space rather than sliding a flat carousel. Additionally, subtle scaling (scale 1.05 → 1.0) on the active slide's primary image reinforces depth.
- **Continuous interaction**: beyond slide transitions, pointer/tilt input can inject micro-parallax (±10–20 px) across identical layers. Optional but computationally cheap via existing infrastructure.

Direct design lessons from the article:
- **Restraint**: Firewatch succeeds through subtle, bounded execution. In an art portfolio, the artwork dictates; parallax provides atmosphere, not the focal point.
- **Zero aggressive scroll hijacking**: navigation must respond instantly and never "hijack" the user.
- **Payload risk**: multiple list examples suffer severe load latency (Hadaka). With 7 hyper-realistic (heavy) images, selective preloading is mandatory (see §6).

---

## 2. Self-Contained Static Page Architecture: Verdict

### Verdict: **Vanilla JS + rAF, zero libraries.**

Rationale:

1. **The operation is trivially linear.** The entire carousel reduces to interpolating a few `translate3d` transformations per layer per frame. A singular rAF loop with lerp (≈100–150 lines) covers all vectors: drag, wheel, keyboard, inertia, parallax. Zero complex timelines, chained easing sequences, or page scroll scrubbing exist to justify GSAP.
2. **The monorepo already leverages GSAP in `capitulos/` due to scroll-driven storytelling** (ScrollTrigger + Lenis), a valid GSAP use-case. Here, zero page scroll exists: it is a fixed viewport with a horizontal track. Importing GSAP (≈70 KB min+gzip with plugins) via CDN to execute interpolatable `x: 100` is severe overkill.
3. **True self-containment.** Static page = `index.html` + `style.css` + `main.js` + images. Zero external dependencies = zero CDN failure vectors, zero version pinning, offline capability, and native deployment on any static host.
4. **Granular physics control.** Manual lerp grants exact smoothing factor control and allows clean deactivation under `prefers-reduced-motion`. Drag inertia physics (velocity + exponential decay) requires 10 lines.

**When to reconsider GSAP**: if future requirements demand choreographed ingress transitions (clip-path masks, character-split text, intro sequences). Even then, GSAP should be CDN-injected solely for the intro, leaving the parallax loop in rAF.

**Three.js: ABORT.** The effect is strictly 2D positional (translate/scale/opacity on layers). WebGL provides nothing that `transform` doesn't already hardware-accelerate via the browser's compositor, and it forces a canvas context, texture management, and shader overhead to replicate the exact same output with elevated complexity and degraded accessibility (images cease to be semantic `<img>` nodes). Explicitly discarded.

### Proposed File Structure

```
public/carrusel/
├── index.html      # markup: viewport > track > 7 slides > layers
├── style.css       # layout, absolute layers, will-change, reduced-motion
├── main.js         # rAF loop, state, input (drag/wheel/keys/dots), lerp
├── img/            # 7 optimized images (jpg/webp, ≤ ~250 KB ea)
└── NOTES.md        # this document
```

---

## 3. Data Structure/Layers per Slide and Translation Formulas

### Data Model

Declarative configuration injected at `main.js` init (or natively in HTML via attributes):

```js
const SLIDES = [
  {
    img: 'img/obra-01.webp',
    title: 'Artwork Title',
    layers: [
      { selector: '.layer-bg',    depth: 0.15 },  // background / color halo
      { selector: '.layer-img',   depth: 0.35 },  // primary portrait
      { selector: '.layer-front', depth: 0.65 },  // title / POP foreground element
    ],
  },
  // ... 7 slides
];
```

In HTML, slides map layers with `data-depth` so formulas extract from DOM without config duplication:

```html
<section class="slide">
  <div class="layer layer-bg"    data-depth="0.15"></div>
  <div class="layer layer-img"   data-depth="0.35"><img ...></div>
  <div class="layer layer-front" data-depth="0.65"><h2>...</h2></div>
</section>
```

Sign convention: `depth ∈ [0, 1]` where 1 = moves 1:1 with track (anchored extreme foreground) and lower values "lag behind". For foreground elements that overtake, depth > 1 (e.g., 1.2).

### Translation Formulas

Given:
- `currentX` = interpolated track position (px), `currentX → targetX` via lerp.
- `slideW` = viewport width.
- For a slide at index `i`, its **relative progress** against the camera is:
  `p = (currentX / slideW) - i` → `p = 0` when slide is centered, `±1` on neighbors.

Each layer translates via:

```
layerX = -p · slideW · depth        // internal parallax drift
```

Meaning, the layer compensates a `depth` fraction of the slide's displacement: higher depth = tighter camera lock; lower depth = heavy drift. The slide container is positioned via `translate3d(i·slideW, 0, 0)` inside the track, and the track via `translate3d(-currentX, 0, 0)`; the layer strictly injects its internal offset. Total per layer: a singular `translate3d` composite on its node — the browser composites the rest at zero cost.

Additional scalar effects on the same `p` (strictly transform/opacity):

```
scale  = 1 + |p| · 0.04              // active slide "breathes" to 1.0
opacity_fg = 1 - |p| · 0.6           // foreground decays on egress
```

Pointer micro-parallax (optional, injected to each layer's offset):

```
pointerX_norm ∈ [-1, 1]
layerX += pointerX_norm · 20 · depth
```

### Main Loop (Skeleton)

```js
let targetX = 0, currentX = 0;
const EASE = 0.085; // lerp factor; lower = higher butter, higher latency

function tick() {
  currentX += (targetX - currentX) * EASE;
  if (Math.abs(targetX - currentX) < 0.1) currentX = targetX;
  track.style.transform = `translate3d(${-currentX}px,0,0)`;
  for (const slide of slides) updateLayers(slide, currentX);
  requestAnimationFrame(tick);
}
```

Golden rule: **One single rAF** executing everything (track + layers + inertia + pointer). Zero listeners directly mutating styles; listeners strictly dump into state vectors (`targetX`, velocity, pointer) and the tick consumes them.

---

## 4. Navigation: Inertia Drag + Wheel + Keyboard + Dots

All inputs mutate identical state vectors (`targetX` + `velocity`), guaranteeing coherent physics regardless of input vector.

**Inertia Drag** (Pointer Events, unifying mouse and touch):
- `pointerdown`: capture pointer, cache `startX`, `lastX`, `lastT`, set `dragging = true` and halt slide easing (track locks 1:1 to finger: `targetX = dragBase - (x - startX)`).
- `pointermove`: compute `targetX` and estimate velocity: `v = (x - lastX) / dt`.
- `pointerup`: release with impulse vector: `targetX += -v · 180` (bonus inertia px payload) followed by **snap to nearest slide**: `targetX = round(targetX / slideW) · slideW`, clamped to `[0, (n-1)·slideW]`. The loop's lerp converts the snap into a buttered landing.
- Intent threshold: if total drag < ~50 px and velocity is minimal, abort to current slide (rubber-band).

**Wheel**: intercept `wheel` via `{ passive: false }` strictly on viewport; aggregate `deltaY`/`deltaX` (whichever is greater, supporting trackpads) routing through a **~250 ms debounce**: one wheel gesture = one slide, absolutely zero continuous intermediate positioning (terminates ugly scroll hijacking and hyper-sensitive trackpad multi-fire). Execute `e.preventDefault()` only during cross-slide gestures, preserving native page scroll if carousel is embedded.

**Keyboard**: `ArrowLeft/ArrowRight` (and `Home/End`, `PageUp/Down` for exhaustive coverage) → `goTo(index ± 1)`. Container requires `tabindex="0"` and `role="region"` + `aria-roledescription="carousel"`.

**Dots**: one discrete `<button>` per slide (native, packing `aria-label="Go to artwork N"` and `aria-current` on active). Click → `goTo(i)`. Active dot mutation occurs inside the tick reading `round(currentX / slideW)`, not inside handlers — granting free sync across drag, wheel, and keyboard.

**Physics**: constant factor lerp (`0.08–0.12`) is sufficient and deterministic; this is the industry standard for these carousels. Spring integration (e.g., `spring physics` with stiffness/damping) is unnecessary unless elastic edge bouncing is mandated — if demanded, clamp with damped overshoot: on bound exceed, `targetX = limit + excess · 0.3` (rubber) and snap to limit on release.

---

## 5. Mobile/Touch and prefers-reduced-motion

**Touch**:
- Pointer Events blanket touch natively; inject `touch-action: pan-y` on viewport commanding the browser to yield the horizontal axis to the carousel while preserving vertical page scroll.
- Viewports < 768 px: throttle parallax amplitude (multiply all `depth` by 0.5) or terminate background layer drift. Heavy differentials trigger nausea on compact displays and burn mobile GPU fill-rate.
- Terminate pointer micro-parallax on touch (hover does not exist); deviceorientation is an optional alternative, but heavily discouraged — permission friction and battery burn.
- Swipe is the primary vector; dots must enforce ≥ 44 × 44 px hit areas.

**prefers-reduced-motion**:
```js
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
```
- If `reduced`: carousel remains navigable, but (a) parallax drift is zeroed (`depth = 0` on all layers), (b) snap executes instantly or via a rapid CSS opacity crossfade (150 ms), (c) zero inertia, zero scale, zero micro-parallax. The payload (the 7 artworks) remains 100% accessible.
- CSS reinforcement via `@media (prefers-reduced-motion: reduce) { .layer { transition: none !important; } }`.
- Honor hot-swapping: `mediaQuery.addEventListener('change', ...)` capturing user OS toggles during active sessions.

**Hard Accessibility**: every image demands descriptive `alt` (artwork title), active slide broadcast via `aria-live="polite"` on a visually-hidden node ("Artwork 3 of 7: …"), high-contrast visible focus on dots.

---

## 6. Performance Engineering

- **Strictly `transform` and `opacity`**. Zero animations touching `top/left/width/height` or filters (animated `blur`, `drop-shadow` = compositor death). All translation is `translate3d`, all scaling is `scale`.
- **`will-change: transform`** on animated layers and track. Do not abuse: inject exclusively into visible/neighbor slide layers (toggle via class analyzing `|p| < 1.5`), as every `will-change` allocates a compositor layer and texture memory footprint. 7 slides × 3 layers = 21 permanent layers will crush low-end mobile; 3 active slides × 3 layers = 9 layers runs flawlessly.
- **Visibility culling**: slides with `|p| > 1.5` receive `visibility: hidden` (or `content-visibility: auto`) — stripping paint and composite overhead.
- **Neighbor preloading**: active slide image and ±1 neighbors load eager (standard `<img>`); the remainder load with `loading="lazy"` and `decoding="async"`. On slide mutation, instantiate `new Image()` to pre-warm the ±2 neighbor in the trajectory vector. All 7 images must be optimized (WebP, max width ~1600 px, ≤ ~250 KB) — as the article warns: the classic parallax assassin is payload load latency.
- **Singular rAF** executing early-exit when state reaches absolute rest (`targetX === currentX` and zero drag): terminate loop and re-arm on next input. Idle battery/GPU footprint = 0.
- **Resize**: recompute `slideW` and reposition via `ResizeObserver` or debounced `resize`; preserve `currentX/slideW` ratio to prevent slide jumping.
- Eradicate layout thrashing: geometry reads (`getBoundingClientRect`, `offsetWidth`) execute strictly on init/resize, never inside the tick.
- Images mandate declared `width`/`height` (or `aspect-ratio`) eliminating CLS during load.

---

## TL;DR for Implementation

- **Verdict**: vanilla JS + singular rAF loop with lerp. Zero GSAP (absent scroll-storytelling to justify CDN), **zero Three.js (discarded: 2D positional effect, WebGL injects zero value)**.
- **Core Formula**: per slide `i`, `p = currentX/slideW − i`; per layer `layerX = −p · slideW · depth`.
- **Inputs → state, state → tick**: drag/wheel/keyboard/dots strictly dump into `targetX` + velocity; the tick interpolates, executes snap/inertia, and syncs dots.
- **Guardrails**: `transform/opacity` exclusively, `will-change` culled to active slides, ±1 neighbor preload, throttled mobile parallax, `prefers-reduced-motion` = crossfade minus drift.
