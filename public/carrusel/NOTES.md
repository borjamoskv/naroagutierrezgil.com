# NOTES — Carrusel Parallax (Naroa Gutiérrez Gil)

Research destilado para el carrusel parallax autocontenido en `public/carrusel/` (7 imágenes, retratos hiperrealistas POP).

**Fuentes:**
- [Parallax scrolling: 14 mind-blowing examples (Creative Bloq, 2025)](https://www.creativebloq.com/web-design/parallax-scrolling-1131762)
- Patrones clásicos: demo Firewatch (6 capas), layered parallax carousels tipo "multiplane", implementaciones de referencia con `data-depth` + lerp (patrón popularizado por demos de CodePen y por librerías como Rellax/Parallax.js, aquí aplicado en vanilla).

---

## 1. Qué patrón visual define "carrusel estilo parallax"

El parallax nace de la cámara multiplano de la animación clásica: **las capas cercanas se mueven más rápido que las lejanas**, y ese diferencial de velocidad crea ilusión de profundidad. El ejemplo canónico del artículo es **Firewatch**: 6 capas que se desplazan a distinta velocidad, efecto "simple y discreto", sin scroll hijacking. Los ejemplos horizontales relevantes (Canals, Delassus Group) demuestran que el parallax funciona igual de bien —o mejor— en un eje horizontal tipo carrusel: "smooth horizontal scrolling makes great use of parallax to draw attention to each new section... subtle impression of depth".

Trasladado a un carrusel de slides, el patrón concreto es:

- **Cada slide contiene varias capas apiladas** (2–4 por slide): fondo/atmosphere, imagen principal (retrato), y primer plano o elemento gráfico (título, grano, forma POP). No hacen falta 6 capas como Firewatch; con 3 bien calibradas basta para el efecto.
- **Durante el desplazamiento del carrusel, cada capa se mueve a una fracción distinta del desplazamiento global**, según su `data-depth`. La capa con depth 0 va a la velocidad del track; las de mayor depth van más despacio (parecen "quedarse atrás" = lejanía) o adelantadas (primer plano agresivo, depth negativo).
- **Entrada/salida de slides**: el slide que sale y el que entra se solapan temporalmente. Durante la transición, las capas del slide saliente siguen derivando a su velocidad (deriva residual) mientras las del entrante "aterrizan" desde un offset opuesto. Esto produce la sensación de que la cámara atraviesa un espacio 3D en lugar de deslizar un carrusel plano. Además, un ligero escalado (scale 1.05 → 1.0) en la imagen principal del slide activo refuerza la profundidad.
- **Interacción continua**: además del cambio de slide, el puntero/tilt puede aplicar un micro-parallax (±10–20 px) sobre las mismas capas. Opcional pero barato con la misma infraestructura.

Lecciones del artículo que aplican directamente al diseño:
- **Moderación**: Firewatch triunfa porque el efecto es sutil y está acotado. En un portfolio de arte, la obra manda; el parallax es atmósfera, no protagonista.
- **Sin scroll hijacking agresivo**: la navegación debe responder inmediatamente y nunca "secuestrar" al usuario.
- **Riesgo de peso**: varios ejemplos del listado pecan de carga lenta (Hadaka). Con 7 imágenes hiperrealistas (pesadas), la precarga selectiva es obligatoria (ver §6).

---

## 2. Arquitectura para página estática autocontenida: veredicto

### Veredicto: **Vanilla JS + rAF, sin librerías.**

Motivos:

1. **El trabajo es trivialmente lineal.** Todo el carrusel se reduce a interpolar unas pocas transformaciones `translate3d` por capa en cada frame. Un único loop rAF con lerp (≈100–150 líneas) lo cubre todo: drag, wheel, teclado, inercia, parallax. No hay timelines complejos, ni secuencias de easing encadenadas, ni scrubbing de scroll de página que justifiquen GSAP.
2. **El repo ya usa GSAP en `capitulos/` porque allí hay scroll-driven storytelling** (ScrollTrigger + Lenis), un caso donde GSAP sí paga. Aquí no hay scroll de página: es un viewport fijo con un track horizontal. Importar GSAP (≈70 KB min+gzip con plugins) por CDN para hacer `x: 100` interpolables es sobrematarse.
3. **Autocontención real.** Página estática = `index.html` + `style.css` + `main.js` + imágenes. Cero dependencias externas = cero puntos de fallo de CDN, cero versiones que pinnear, funciona offline, y se despliega tal cual en cualquier hosting estático.
4. **Control fino de la física.** Con lerp manual controlamos exactamente el factor de suavizado y podemos desactivarlo bajo `prefers-reduced-motion` de forma limpia. La física de inercia del drag (velocidad + decaimiento exponencial) son 10 líneas.

**Cuándo reconsiderar GSAP**: si más adelante se quieren transiciones de entrada coreografiadas (máscaras de clip-path, texto partido por caracteres, secuencias de intro). Incluso entonces, GSAP puede añadirse por CDN solo para la intro y dejar el loop de parallax en rAF.

**Three.js: NO.** El efecto es 2D puramente posicional (translate/scale/opacity sobre capas). WebGL no aporta nada que `transform` no haga ya acelerado por GPU en el compositor del navegador, y añadiría un contexto de canvas, gestión de texturas y shaders para reproducir exactamente lo mismo con más complejidad y peor accesibilidad (las imágenes dejan de ser `<img>` semánticas). Queda descartado de forma explícita.

### Estructura de archivos propuesta

```
public/carrusel/
├── index.html      # markup: viewport > track > 7 slides > capas
├── style.css       # layout, capas absolutas, will-change, reduced-motion
├── main.js         # loop rAF, estado, input (drag/wheel/keys/dots), lerp
├── img/            # 7 imágenes optimizadas (jpg/webp, ≤ ~250 KB c/u)
└── NOTES.md        # este documento
```

---

## 3. Estructura de datos/capas por slide y fórmulas de desplazamiento

### Modelo de datos

Configuración declarativa al inicio de `main.js` (o en el propio HTML vía atributos):

```js
const SLIDES = [
  {
    img: 'img/obra-01.webp',
    title: 'Título de la obra',
    layers: [
      { selector: '.layer-bg',    depth: 0.15 },  // fondo / halo de color
      { selector: '.layer-img',   depth: 0.35 },  // retrato principal
      { selector: '.layer-front', depth: 0.65 },  // título / elemento POP frontal
    ],
  },
  // ... 7 slides
];
```

En el HTML, cada slide lleva las capas con `data-depth` para que las fórmulas lean del DOM sin duplicar config:

```html
<section class="slide">
  <div class="layer layer-bg"    data-depth="0.15"></div>
  <div class="layer layer-img"   data-depth="0.35"><img ...></div>
  <div class="layer layer-front" data-depth="0.65"><h2>...</h2></div>
</section>
```

Convención de signos: `depth ∈ [0, 1]` donde 1 = se mueve con el track (primerísimo plano anclado) y valores menores se "quedan atrás". Para primer plano que se adelante, depth > 1 (p. ej. 1.2).

### Fórmulas de desplazamiento

Sea:
- `currentX` = posición interpolada del track (px), `currentX → targetX` vía lerp.
- `slideW` = ancho del viewport.
- Para un slide en índice `i`, su **progreso relativo** respecto a la cámara es:
  `p = (currentX / slideW) - i` → `p = 0` cuando el slide está centrado, `±1` en los vecinos.

Cada capa se desplaza:

```
layerX = -p · slideW · depth        // deriva parallax interna
```

Es decir, la capa compensa una fracción `depth` del desplazamiento del slide: cuanto mayor el depth, más se "pega" a la cámara; cuanto menor, más deriva. El contenedor del slide ya se coloca con `translate3d(i·slideW, 0, 0)` dentro del track, y el track con `translate3d(-currentX, 0, 0)`; la capa solo añade su offset interno. Total por capa: una única `translate3d` compuesta en su propio elemento — el navegador compone el resto gratis.

Efectos adicionales sobre el mismo `p` (todos transform/opacity):

```
scale  = 1 + |p| · 0.04              // el slide activo "respira" a 1.0
opacity_fg = 1 - |p| · 0.6           // el primer plano se desvanece al salir
```

Micro-parallax de puntero (opcional, sumar al offset de cada capa):

```
pointerX_norm ∈ [-1, 1]
layerX += pointerX_norm · 20 · depth
```

### Bucle principal (esqueleto)

```js
let targetX = 0, currentX = 0;
const EASE = 0.085; // factor lerp; menor = más mantequilla, más latencia

function tick() {
  currentX += (targetX - currentX) * EASE;
  if (Math.abs(targetX - currentX) < 0.1) currentX = targetX;
  track.style.transform = `translate3d(${-currentX}px,0,0)`;
  for (const slide of slides) updateLayers(slide, currentX);
  requestAnimationFrame(tick);
}
```

Regla de oro: **un solo rAF** para todo (track + capas + inercia + puntero). Nada de listeners que muten estilos directamente; los listeners solo escriben en el estado (`targetX`, velocidad, puntero) y el tick lo consume.

---

## 4. Navegación: drag con inercia + wheel + teclado + dots

Todas las entradas escriben sobre el mismo estado (`targetX` + `velocity`), así la física es coherente sin importar el origen.

**Drag con inercia** (Pointer Events, que unifican ratón y touch):
- `pointerdown`: capturar puntero, guardar `startX`, `lastX`, `lastT`, poner `dragging = true` y pausar el easing hacia slide (el track sigue al dedo 1:1: `targetX = dragBase - (x - startX)`).
- `pointermove`: actualizar `targetX` y estimar velocidad: `v = (x - lastX) / dt`.
- `pointerup`: soltar con impulso: `targetX += -v · 180` (px de recorrido extra por inercia) y luego **snap al slide más cercano**: `targetX = round(targetX / slideW) · slideW`, clamped a `[0, (n-1)·slideW]`. El lerp del loop convierte el snap en un aterrizaje suave.
- Umbral de intención: si el drag total < ~50 px y la velocidad es baja, volver al slide actual (rubber-band).

**Wheel**: escuchar `wheel` con `{ passive: false }` solo sobre el viewport; acumular `deltaY`/`deltaX` (el mayor de los dos, para trackpads) con un **debounce de ~250 ms**: cada gesto de rueda = un slide, nunca media posición intermedia continua (evita el scroll hijacking feo y el disparo múltiple de trackpads sensibles). `e.preventDefault()` solo cuando el gesto cambia de slide, para no romper el scroll de página si el carrusel está embebido.

**Teclado**: `ArrowLeft/ArrowRight` (y `Home/End`, `PageUp/Down` si se quiere ser exhaustivo) → `goTo(index ± 1)`. Contenedor con `tabindex="0"` y `role="region"` + `aria-roledescription="carousel"`.

**Dots**: un botón por slide (`<button>` real, con `aria-label="Ir a la obra N"` y `aria-current` en el activo). Click → `goTo(i)`. El dot activo se actualiza dentro del tick leyendo `round(currentX / slideW)`, no en los handlers — así drag, wheel y teclado lo actualizan gratis.

**Física**: el lerp con factor constante (`0.08–0.12`) es suficiente y predecible; es la técnica estándar de estos carruseles. No hace falta integración de springs (tipo `spring physics` con stiffness/damping) salvo que se quiera rebote elástico en los bordes — si se quiere, clamp con sobreimpulso amortiguado: al exceder el límite, `targetX = límite + exceso · 0.3` (goma) y al soltar, snap al límite.

---

## 5. Móvil/touch y prefers-reduced-motion

**Touch**:
- Pointer Events cubren touch sin código extra; añadir `touch-action: pan-y` en el viewport para que el navegador ceda el eje horizontal al carrusel pero conserve el scroll vertical de la página.
- En pantallas < 768 px: reducir la amplitud del parallax (multiplicar todos los `depth` por 0.5) o desactivar la deriva de la capa de fondo. Los diferenciales grandes marean en pantallas pequeñas y cuestan fill-rate en GPUs móviles.
- Desactivar el micro-parallax de puntero en touch (no hay hover); alternativa opcional: deviceorientation, mejor no — permisos y batería.
- El swipe es el gesto primario; los dots deben tener área táctil ≥ 44 × 44 px.

**prefers-reduced-motion**:
```js
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
```
- Si `reduced`: el carrusel sigue siendo navegable, pero (a) la deriva parallax se anula (`depth = 0` en todas las capas), (b) el snap es instantáneo o con una transición CSS de opacity corta (crossfade 150 ms), (c) sin inercia, sin scale, sin micro-parallax. El contenido (las 7 obras) permanece 100 % accesible.
- Refuerzo en CSS con `@media (prefers-reduced-motion: reduce) { .layer { transition: none !important; } }`.
- Respetar cambios en caliente: `mediaQuery.addEventListener('change', ...)` por si el usuario lo alterna con la página abierta.

**Accesibilidad extra**: cada imagen con `alt` descriptivo (título de la obra), anuncio del slide activo con `aria-live="polite"` en un elemento visually-hidden ("Obra 3 de 7: …"), foco visible en dots.

---

## 6. Rendimiento

- **Solo `transform` y `opacity`**. Ninguna animación toca `top/left/width/height` ni filtros (`blur`, `drop-shadow` animados = muerte del compositor). Todo desplazamiento es `translate3d`, todo escalado es `scale`.
- **`will-change: transform`** en las capas animadas y en el track. No abusar: aplicarlo solo a las capas de los slides visibles/vecinos (alternarlo por clase según `|p| < 1.5`), porque cada `will-change` reserva una capa de composición con su memoria de textura. Con 7 slides × 3 capas = 21 capas permanentes, un móvil modesto se queja; con 3 slides activos × 3 capas = 9, va sobrado.
- **Visibilidad**: slides con `|p| > 1.5` reciben `visibility: hidden` (o `content-visibility: auto`) — no se pintan ni componen.
- **Precarga de vecinos**: la imagen del slide activo y sus ±1 vecinos se cargan eager (`<img>` normal); el resto con `loading="lazy"` y `decoding="async"`. Al cambiar de slide, `new Image()` para precalentar el vecino ±2 en la dirección del movimiento. Las 7 imágenes deben estar optimizadas (WebP, ancho máx ~1600 px, ≤ ~250 KB) — el artículo lo advierte: el enemigo clásico del parallax es el tiempo de carga.
- **Un solo rAF** que early-exit cuando el estado está en reposo (`targetX === currentX` y sin drag): parar el loop y rearmarlo en el próximo input. Batería y GPU en idle = 0.
- **Resize**: recalcular `slideW` y reposicionar con `ResizeObserver` o `resize` debounced; mantener la proporción `currentX/slideW` para no saltar de slide.
- Evitar layout thrashing: lecturas de geometría (`getBoundingClientRect`, `offsetWidth`) solo en init/resize, nunca dentro del tick.
- Imágenes con `width`/`height` declarados (o `aspect-ratio`) para que no haya CLS al cargar.

---

## TL;DR para implementación

- **Veredicto**: vanilla JS + un único loop rAF con lerp. Sin GSAP (no hay scroll-storytelling que justifique CDN), **sin Three.js (descartado: efecto 2D posicional, WebGL no aporta nada)**.
- **Fórmula núcleo**: por slide `i`, `p = currentX/slideW − i`; cada capa `layerX = −p · slideW · depth`.
- **Inputs → estado, estado → tick**: drag/wheel/teclado/dots solo escriben `targetX` + velocidad; el tick interpola, hace snap e inercia, y actualiza dots.
- **Guardarraíles**: `transform/opacity` only, `will-change` solo en slides activos, precarga ±1 vecinos, parallax reducido en móvil, `prefers-reduced-motion` = crossfade sin deriva.
