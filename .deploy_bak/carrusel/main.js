/* ============================================================
   Carrusel parallax — Naroa Gutiérrez Gil
   Vanilla JS + un único loop rAF con lerp (ver NOTES.md §2-§6).
   Sin GSAP, sin Three.js, sin dependencias.
   Fórmula núcleo por slide i:  p = currentX/slideW − i
   Cada capa:                   layerX = −p · slideW · data-depth
   ============================================================ */
'use strict';

(async () => {
  const viewport = document.getElementById('carrusel');
  const track = document.getElementById('track');
  const dotsNav = document.getElementById('dots');
  const cntA = document.getElementById('cnt-actual');
  const cntT = document.getElementById('cnt-total');
  const live = document.getElementById('live');
  const hint = document.getElementById('hint');
  const root = document.documentElement;

  const EASE = 0.085;          // factor lerp (NOTES §3): mantequilla sin rebote
  const SNAP_VEL = 180;        // px de recorrido extra por inercia al soltar
  const WHEEL_DEBOUNCE = 250;  // ms: 1 gesto de rueda = 1 slide
  const NEAR = 1.5;            // |p| < 1.5 → visible + will-change
  const INTRO_OFFSET = -0.22;  // el parallax "aterriza" desde aquí en la intro

  const mqReduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mqMobile = matchMedia('(max-width: 767px)');
  const mqFine = matchMedia('(pointer: fine)');

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const hexToRgb = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const rgba = (hex, a) => {
    const [r, g, b] = hexToRgb(hex);
    return `rgba(${r},${g},${b},${a})`;
  };

  /* ---------- Derivados del manifest (fuente única de verdad) ---------- */

  // Acento de color: se extrae de la descripción de cada obra.
  function acentoDe(desc) {
    const d = desc.toLowerCase();
    if (d.includes('fucsia')) return { c: '#f237a6', nombre: 'rosa fucsia' };
    if (d.includes('dorado')) return { c: '#d4a437', nombre: 'dorado' };
    if (d.includes('rojo')) return { c: '#d0342c', nombre: 'rojo' };
    if (d.includes('azul')) return { c: '#4a90e2', nombre: 'azul' };
    if (d.includes('lima')) return { c: '#9fbd3b', nombre: 'verde lima' };
    if (d.includes('agua') || d.includes('pez')) return { c: '#7fb6c9', nombre: 'agua' };
    return { c: '#a3a8ad', nombre: 'grafito' };
  }

  // Fondo nocturno: dominantColor oscurecido; papel blanco → carbón #111.
  function fondoDe(hex) {
    const [r, g, b] = hexToRgb(hex);
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    if (lum > 0.85) return '#111111';
    const f = 0.16;
    return `rgb(${Math.round(r * f)},${Math.round(g * f)},${Math.round(b * f)})`;
  }

  // Título = primera cláusula de la descripción.
  function tituloDe(desc) {
    const t = desc.split(/[;:]/)[0].trim();
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  // Kicker = fragmento de paleta/técnica (última cláusula si la menciona).
  function paletaDe(desc) {
    const parts = desc.split(';').map((s) => s.trim());
    const last = parts[parts.length - 1].replace(/\.$/, '');
    return /paleta|grafito|acento/i.test(last) ? last : '';
  }

  // Capa media "pop": el primer elemento de capasSugeridas (el más cercano a la
  // cámara) se duplica enmascarado. x/y/r en % sobre la obra, verificados visualmente.
  const MID = {
    'guitarrista':  { x: 71, y: 17, r: 34 },  // pala y mástil de la Gibson
    'chico-pez':    { x: 18, y: 44, r: 32 },  // vaso de agua con el pez
    'pippi':        { x: 68, y: 47, r: 28 },  // mono al hombro
    'pippi-cartas': { x: 46, y: 62, r: 34 },  // abanico de cartas
    'roisin-full':  { x: 55, y: 12, r: 30 },  // plumas desbordando el marco
  };

  /* ---------- Carga del manifest ---------- */

  let obras;
  try {
    const res = await fetch('./manifest.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    obras = await res.json();
  } catch (err) {
    track.innerHTML = '<p class="error">No se pudo cargar <code>manifest.json</code>. ' +
      'Sirve la página por HTTP (p. ej. <code>npm run dev</code>).</p>';
    document.body.classList.add('is-ready');
    return;
  }

  /* ---------- Construcción de slides ---------- */

  const state = {
    n: obras.length,
    slideW: 1,
    maxX: 0,
    targetX: 0,
    currentX: 0,
    vel: 0,
    dragging: false,
    startX: 0, lastX: 0, lastT: 0, dragBase: 0,
    pointerX: 0, pointerTX: 0,
    active: 0,
    qaOff: 0,
    raf: null,
    reduced: mqReduced.matches,
  };

  const slides = [];
  const dots = [];

  obras.forEach((obra, i) => {
    const titulo = tituloDe(obra.descripcion);
    const acento = acentoDe(obra.descripcion);
    const kicker = paletaDe(obra.descripcion) || `acento ${acento.nombre}`;
    const mid = MID[obra.slug] || null;
    const hasMid = Boolean(mid);
    // capasSugeridas → nº de capas: obras con elemento frontal destacado
    // (≥ 3 capas sugeridas) componen 4 planos; las de 2, tres planos.
    const depths = hasMid
      ? { bg: 0.15, art: 0.35, mid: 0.52, front: 0.70 }
      : { bg: 0.15, art: 0.38, front: 0.68 };

    const slide = document.createElement('section');
    slide.className = 'slide';
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'diapositiva');
    slide.setAttribute('aria-label', `${i + 1} de ${state.n}: ${titulo}`);
    slide.style.setProperty('--bg', fondoDe(obra.dominantColor));
    slide.style.setProperty('--ac', acento.c);
    slide.style.setProperty('--ac-40', rgba(acento.c, 0.4));
    slide.style.setProperty('--ac-25', rgba(acento.c, 0.25));
    slide.style.setProperty('--glow-x', `${(obra.focalPoint.x * 100).toFixed(1)}%`);
    slide.style.setProperty('--glow-y', `${(obra.focalPoint.y * 100).toFixed(1)}%`);

    const maskCss = mid
      ? `radial-gradient(ellipse ${mid.r}% ${mid.r}% at ${mid.x}% ${mid.y}%, ` +
        `#000 0%, rgba(0,0,0,.55) 46%, transparent 74%)`
      : '';

    slide.innerHTML =
      `<div class="layer l-bg" data-depth="${depths.bg}">` +
        `<img class="bg-blur" src="${esc(obra.blur)}" alt="" aria-hidden="true">` +
        `<div class="bg-glow"></div>` +
      `</div>` +
      `<div class="layer l-art" data-depth="${depths.art}">` +
        `<figure class="artwork" style="background-image:url('${esc(obra.blur)}')">` +
          `<img class="art" data-src="${esc(obra.file)}" alt="${esc(obra.descripcion)}" ` +
               `width="${obra.w}" height="${obra.h}" draggable="false" loading="lazy" decoding="async">` +
        `</figure>` +
      `</div>` +
      (hasMid
        ? `<div class="layer l-mid" data-depth="${depths.mid}">` +
            `<img class="mid" data-src="${esc(obra.file)}" alt="" aria-hidden="true" draggable="false" ` +
                 `style="-webkit-mask-image:${maskCss};mask-image:${maskCss};` +
                 `--mx:${mid.x}%;--my:${mid.y}%">` +
          `</div>`
        : '') +
      `<div class="layer l-front" data-depth="${depths.front}">` +
        `<div class="marco-eco"></div>` +
        `<div class="caption">` +
          `<p class="kicker">${esc(kicker)}</p>` +
          `<h2 class="titulo">${esc(titulo)}</h2>` +
        `</div>` +
      `</div>`;

    track.appendChild(slide);

    slides.push({
      el: slide,
      w: obra.w,
      h: obra.h,
      titulo,
      accent: acento,
      near: false,
      loaded: false,
      artImg: slide.querySelector('.art'),
      midImg: slide.querySelector('.mid'),
      layers: Array.from(slide.querySelectorAll('.layer')).map((el) => ({
        el,
        depth: parseFloat(el.dataset.depth),
        kind: el.classList.contains('l-art') ? 'art'
            : el.classList.contains('l-front') ? 'front' : 'plain',
      })),
    });

    const dot = document.createElement('button');
    dot.className = 'dot';
    dot.type = 'button';
    dot.setAttribute('aria-label', `Ir a la obra ${i + 1}: ${titulo}`);
    dot.setAttribute('aria-current', i === 0 ? 'true' : 'false');
    dot.addEventListener('click', () => goTo(i));
    dotsNav.appendChild(dot);
    dots.push(dot);
  });

  cntT.textContent = String(state.n).padStart(2, '0');

  /* ---------- LQIP + precarga (NOTES §6) ---------- */

  function ensureLoaded(i) {
    const s = slides[i];
    if (!s || s.loaded) return;
    s.loaded = true;
    const obra = obras[i];
    s.el.style.setProperty('--img', `url("${obra.file}")`);   // halo (::after)
    if (s.artImg) {
      s.artImg.addEventListener('load', () => s.artImg.classList.add('is-loaded'), { once: true });
      s.artImg.src = obra.file;
      if (s.artImg.complete && s.artImg.naturalWidth > 0) s.artImg.classList.add('is-loaded');
    }
    if (s.midImg) s.midImg.src = obra.file;                   // mismo archivo → misma caché
  }

  // Eager: activo ± 1. El resto espera a entrar en la ventana (lazy manual).
  function loadWindow(center) {
    for (let d = -1; d <= 1; d++) ensureLoaded(center + d);
  }

  /* ---------- Estado activo: contador, dots, acento, aria-live ---------- */

  function setActive(idx) {
    const prev = state.active;
    state.active = idx;
    cntA.textContent = String(idx + 1).padStart(2, '0');
    dots.forEach((d, k) => d.setAttribute('aria-current', k === idx ? 'true' : 'false'));
    slides.forEach((s, k) => s.el.classList.toggle('is-active', k === idx));
    const ac = slides[idx].accent;
    root.style.setProperty('--ac', ac.c);
    root.style.setProperty('--ac-40', rgba(ac.c, 0.4));
    root.style.setProperty('--ac-25', rgba(ac.c, 0.25));
    live.textContent = `Obra ${idx + 1} de ${state.n}: ${slides[idx].titulo}`;
    loadWindow(idx);
    // Precalentar el vecino ±2 en la dirección del movimiento (NOTES §6)
    const pre = idx + (idx >= prev ? 2 : -2);
    if (pre >= 0 && pre < state.n && pre !== idx) {
      const im = new Image();
      im.src = obras[pre].file;
    }
  }

  /* ---------- Layout (init/resize; nunca dentro del tick) ---------- */

  function layout() {
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    state.slideW = vw;
    state.maxX = (state.n - 1) * vw;
    const mob = mqMobile.matches;
    const maxW = Math.min(vw * (mob ? 0.86 : 0.8), 1150);
    const maxH = vh * (mob ? 0.52 : 0.64);
    slides.forEach((s, i) => {
      const ar = s.w / s.h;
      const aw = Math.min(maxW, maxH * ar);
      const ah = aw / ar;
      s.el.style.setProperty('--aw', `${aw.toFixed(1)}px`);
      s.el.style.setProperty('--ah', `${ah.toFixed(1)}px`);
      if (!state.reduced) s.el.style.transform = `translate3d(${i * vw}px,0,0)`;
    });
    // Mantener el slide activo sin saltos al redimensionar (qaOff solo QA)
    state.targetX = (state.active + state.qaOff) * vw;
    state.currentX = state.targetX;
  }

  let resizeT = 0;
  addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => { layout(); wake(); }, 100);
  });

  /* ---------- Bucle principal: UN solo rAF (NOTES §3) ---------- */

  function tick() {
    state.raf = null;

    // Micro-parallax de puntero (solo desktop, pointer:fine)
    state.pointerX += (state.pointerTX - state.pointerX) * 0.08;
    if (Math.abs(state.pointerTX - state.pointerX) < 0.001) state.pointerX = state.pointerTX;

    // Lerp principal
    state.currentX += (state.targetX - state.currentX) * EASE;
    if (Math.abs(state.targetX - state.currentX) < 0.08) state.currentX = state.targetX;

    track.style.transform = `translate3d(${-state.currentX}px,0,0)`;

    const pNorm = state.currentX / state.slideW;
    const dScale = mqMobile.matches ? 0.5 : 1;           // depth × 0.5 en móvil
    const ptrAmp = (mqFine.matches && !mqMobile.matches) ? 20 : 0;

    for (let i = 0; i < state.n; i++) {
      const s = slides[i];
      const p = pNorm - i;                               // progreso relativo
      const near = Math.abs(p) < NEAR;
      if (near !== s.near) {
        s.near = near;
        s.el.classList.toggle('is-near', near);          // will-change solo aquí
      }
      if (!near) continue;
      for (const L of s.layers) {
        const d = L.depth * dScale;
        const x = -p * state.slideW * d + state.pointerX * ptrAmp * d;
        let t = `translate3d(${x.toFixed(2)}px,0,0)`;
        if (L.kind === 'art') t += ` scale(${(1 + Math.min(Math.abs(p), 1.5) * 0.04).toFixed(4)})`;
        L.el.style.transform = t;
        if (L.kind === 'front') {
          L.el.style.opacity = Math.max(0, 1 - Math.abs(p) * 0.6).toFixed(3);
        }
      }
    }

    const idx = clamp(Math.round(pNorm), 0, state.n - 1);
    if (idx !== state.active) setActive(idx);

    // Early-exit: en reposo el loop duerme (batería/GPU = 0)
    const settled = state.currentX === state.targetX &&
                    !state.dragging &&
                    state.pointerX === state.pointerTX;
    if (!settled) state.raf = requestAnimationFrame(tick);
  }

  function wake() {
    if (!state.raf && !state.reduced) state.raf = requestAnimationFrame(tick);
  }

  /* ---------- Navegación ---------- */

  function goTo(idx) {
    idx = clamp(idx, 0, state.n - 1);
    hideHint();
    state.qaOff = 0;
    if (state.reduced) { setActive(idx); return; }       // crossfade vía CSS
    state.targetX = idx * state.slideW;
    wake();
  }

  let hintHidden = false;
  function hideHint() {
    if (hintHidden) return;
    hintHidden = true;
    hint.classList.add('is-hidden');
  }

  // Drag con inercia + snap (Pointer Events: ratón + touch)
  viewport.addEventListener('pointerdown', (e) => {
    if (e.button !== undefined && e.button > 0) return;
    e.preventDefault();
    state.dragging = true;
    try { viewport.setPointerCapture(e.pointerId); } catch (_) { /* noop */ }
    state.startX = state.lastX = e.clientX;
    state.lastT = performance.now();
    state.vel = 0;
    state.qaOff = 0;
    state.dragBase = state.targetX;
    viewport.classList.add('is-dragging');
    hideHint();
    wake();
  });

  viewport.addEventListener('pointermove', (e) => {
    if (state.dragging) {
      const now = performance.now();
      const dt = Math.max(1, now - state.lastT);
      const v = (e.clientX - state.lastX) / dt;          // px/ms
      state.vel = state.vel * 0.8 + v * 0.2;             // suavizado exponencial
      state.lastX = e.clientX;
      state.lastT = now;
      // El track sigue al dedo 1:1, con clamp duro (sin rebote de goma)
      state.targetX = clamp(state.dragBase - (e.clientX - state.startX), 0, state.maxX);
    } else if (mqFine.matches && !state.reduced) {
      state.pointerTX = (e.clientX / state.slideW - 0.5) * 2;
    }
    wake();
  });

  function endDrag() {
    if (!state.dragging) return;
    state.dragging = false;
    viewport.classList.remove('is-dragging');
    if (!state.reduced) {
      // Impulso por inercia y snap al slide más cercano (clamp duro)
      state.targetX = clamp(state.targetX - state.vel * SNAP_VEL, 0, state.maxX);
    }
    goTo(clamp(Math.round(state.targetX / state.slideW), 0, state.n - 1));
  }
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);

  // Rueda con debounce: 1 gesto = 1 slide (NOTES §4)
  let wheelLock = 0;
  viewport.addEventListener('wheel', (e) => {
    if (e.ctrlKey) return;                               // pinch-zoom del trackpad
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(d) < 12) return;
    e.preventDefault();
    const now = performance.now();
    if (now - wheelLock < WHEEL_DEBOUNCE) return;
    wheelLock = now;
    goTo(state.active + (d > 0 ? 1 : -1));
  }, { passive: false });

  // Teclado
  addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    let handled = true;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') goTo(state.active + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') goTo(state.active - 1);
    else if (e.key === 'Home') goTo(0);
    else if (e.key === 'End') goTo(state.n - 1);
    else handled = false;
    if (handled) e.preventDefault();
  });

  /* ---------- prefers-reduced-motion: crossfade simple ---------- */

  function applyMotionMode() {
    state.reduced = mqReduced.matches;
    document.body.classList.toggle('reduced', state.reduced);
    if (state.reduced) {
      if (state.raf) { cancelAnimationFrame(state.raf); state.raf = null; }
      track.style.transform = '';
      slides.forEach((s) => {
        s.el.style.transform = '';
        s.near = true;
        s.el.classList.add('is-near');                   // todos visibles (stack)
        s.layers.forEach((L) => { L.el.style.transform = ''; L.el.style.opacity = ''; });
      });
      setActive(state.active);
    } else {
      layout();
      wake();
    }
  }
  mqReduced.addEventListener('change', applyMotionMode);
  mqMobile.addEventListener('change', () => { layout(); wake(); });

  /* ---------- Init: entra directo en la primera obra (fade + settle) ---------- */

  layout();

  /* Deep-link / QA: ?slide=N (1-10) salta a la obra N; &off=±0.x fija una
     deriva entre slides (para capturas de parallax). Sin params: intro normal. */
  const q = new URLSearchParams(location.search);
  const qSlide = clamp((parseInt(q.get('slide'), 10) || 1) - 1, 0, state.n - 1);
  const qOff = parseFloat(q.get('off') || '0') || 0;
  state.qaOff = clamp(qOff, -0.49, 0.49);
  setActive(qSlide);
  if (state.reduced) {
    applyMotionMode();
  } else if (q.has('slide') || qOff) {
    state.targetX = clamp((qSlide + qOff) * state.slideW, 0, state.maxX);
    state.currentX = state.targetX;
    wake();
  } else {
    state.currentX = INTRO_OFFSET * state.slideW;        // parallax desplazado…
    wake();                                              // …que "aterriza" vía lerp
  }
  requestAnimationFrame(() => document.body.classList.add('is-ready'));
  setTimeout(hideHint, 6500);
})();
