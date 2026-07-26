/* ============================================================
   NAROA — Capítulos · experiencia scroll
   Stack: GSAP 3.15.0 + ScrollTrigger + Lenis 1.3.25 (NOTES.md)
   Animaciones solo transform/opacity.
   ============================================================ */
(function () {
  'use strict';

  /* Orden curatorial: abrir con impacto (Marilyn) y cerrar con el
     autoretrato — "yo también soy lo que miro". */
  var CHAPTER_ORDER = [
    'marilyn',
    'johnny',
    'amy',
    'audrey',
    'baroque-farrokh',
    'cantinflas',
    'amor-en-conserva',
    'obra-1',
    'obra-13',
    'autoretrato'
  ];

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var animated = !reducedMotion && hasGsap;

  /* ---------- Datos: manifest + copy (fuentes de verdad, sin tocarlos) ---------- */

  function loadData() {
    return Promise.all([
      fetch('./manifest.json').then(function (r) { return r.json(); }),
      fetch('./capitulos-copy.json').then(function (r) { return r.json(); })
    ]).then(function (results) {
      var manifest = results[0];
      var copy = results[1];
      var copyBySlug = {};
      copy.forEach(function (c) { copyBySlug[c.slug] = c; });
      return CHAPTER_ORDER
        .map(function (slug) {
          var work = null;
          manifest.forEach(function (w) { if (w.slug === slug) work = w; });
          return work ? { work: work, copy: copyBySlug[slug] || {} } : null;
        })
        .filter(Boolean);
    });
  }

  /* ---------- Construcción del DOM de capítulos ---------- */

  function pad(n) { return String(n).padStart(2, '0'); }

  function chapterHTML(item, index) {
    var w = item.work;
    var c = item.copy;
    var fx = Math.round(w.focalPoint.x * 100);
    var fy = Math.round(w.focalPoint.y * 100);
    var num = pad(index + 1);
    var eager = index === 0 ? 'eager' : 'lazy';

    return (
      '<section class="chapter" data-slug="' + w.slug + '" data-index="' + index + '" ' +
        'style="--dominant:' + w.dominantColor + '">' +
        '<div class="chapter__bg layer" data-depth="0.12" aria-hidden="true"></div>' +
        '<figure class="chapter__art layer" data-depth="0.32" ' +
          'style="--fx:' + fx + '%;--fy:' + fy + '%;--blur:url(\'' + w.blur + '\')">' +
          '<img src="' + w.file + '" width="' + w.w + '" height="' + w.h + '" ' +
            'alt="' + (c.titulo || w.slug) + ' — ' + (c.subtitulo || '') + '" ' +
            'loading="' + eager + '" decoding="async">' +
        '</figure>' +
        '<div class="chapter__veil layer" data-depth="0.55" aria-hidden="true"></div>' +
        '<div class="chapter__text layer" data-depth="0.8">' +
          '<p class="chapter__index">Capítulo ' + num + '</p>' +
          '<p class="chapter__kicker">' + (c.kicker || '') + '</p>' +
          '<h2 class="chapter__title">' + (c.titulo || '') + '</h2>' +
          '<p class="chapter__sub">' + (c.subtitulo || '') + '</p>' +
          '<p class="chapter__body">' + (c.cuerpo || '') + '</p>' +
          '<blockquote class="chapter__quote">«' + (c.cita || '') + '»</blockquote>' +
        '</div>' +
      '</section>'
    );
  }

  function buildChapters(items) {
    var host = document.getElementById('chapters');
    host.innerHTML = items.map(chapterHTML).join('');

    /* LQIP: el blur ya está de fondo; el webp grande hace fade-in al cargar */
    host.querySelectorAll('.chapter__art').forEach(function (fig) {
      var img = fig.querySelector('img');
      function ready() { fig.classList.add('is-loaded'); }
      if (img.complete && img.naturalWidth > 0) ready();
      else img.addEventListener('load', ready, { once: true });
    });
  }

  /* ---------- UI: contador + barra de progreso ---------- */

  function setupUI(total) {
    var counter = document.getElementById('counter');
    var bar = document.getElementById('progress-bar');

    /* Contador: IntersectionObserver funciona con y sin pins */
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var i = parseInt(entry.target.getAttribute('data-index'), 10);
            counter.textContent = pad(i + 1) + ' / ' + pad(total);
          }
        });
      }, { threshold: 0.35 });
      document.querySelectorAll('.chapter').forEach(function (ch) { io.observe(ch); });
    }

    /* Barra de progreso sobre el scroll total (rAF-throttled) */
    var ticking = false;
    function updateBar() {
      ticking = false;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar.style.transform = 'scaleX(' + p + ')';
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(updateBar); }
    }, { passive: true });
    updateBar();
  }

  /* ---------- Precarga de la obra del siguiente capítulo ---------- */

  function preloadNext(items, currentIndex) {
    var next = items[currentIndex + 1];
    if (!next) return;
    var img = new Image();
    img.src = next.work.file;
  }

  /* ---------- Lenis + ScrollTrigger (NOTES.md §1.3 y §3.2) ---------- */

  function setupMotion(items) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    var lenis = null;
    if (typeof window.Lenis !== 'undefined') {
      lenis = new Lenis({
        lerp: 0.1,
        smoothWheel: true,
        syncTouch: false // en táctil manda el scroll nativo
      });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) {
        lenis.raf(time * 1000); // gsap da segundos; lenis espera ms
      });
      gsap.ticker.lagSmoothing(0);
    }

    /* Portada: el contenido se desvanece al salir (sin pin) */
    gsap.to('.cover__inner', {
      yPercent: -18,
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: '.cover',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

    /* Un ScrollTrigger pinneado por capítulo, con una única timeline */
    gsap.utils.toArray('.chapter').forEach(function (chapter, i) {
      var layers = chapter.querySelectorAll('.layer');
      var art = chapter.querySelector('.chapter__art');
      var veil = chapter.querySelector('.chapter__veil');
      var textChildren = chapter.querySelectorAll('.chapter__text > *');

      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: chapter,
          start: 'top top',
          end: '+=150%',
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onEnter: function () { preloadNext(items, i); }
        }
      });

      /* Parallax multicapa: cada capa viaja a distinta velocidad */
      layers.forEach(function (layer) {
        var depth = parseFloat(layer.getAttribute('data-depth') || '0.3');
        tl.fromTo(layer,
          { yPercent: 12 * depth * 10 / 4 },
          { yPercent: -12 * depth * 10 / 4, duration: 1 }, 0);
      });

      /* Zoom-out sutil de la obra durante el capítulo */
      tl.fromTo(art, { scale: 1.07 }, { scale: 1.01, duration: 1 }, 0);

      /* Texto sincronizado: entra escalonado en el primer tercio,
         sale en el último (kicker → título → cuerpo → cita) */
      tl.fromTo(textChildren,
        { yPercent: 60, opacity: 0 },
        { yPercent: 0, opacity: 1, stagger: 0.045, duration: 0.22, ease: 'power2.out' }, 0.12)
        .to(textChildren,
        { yPercent: -40, opacity: 0, stagger: 0.03, duration: 0.18, ease: 'power2.in' }, 0.76);

      /* Salida limpia: la obra crece apenas y la veladura oscurece
         mientras el siguiente capítulo la cubre (crossfade natural) */
      tl.to(art, { scale: 1.06, duration: 0.2, ease: 'power1.in' }, 0.8);
      tl.to(veil, { opacity: 1.9, duration: 0.2, ease: 'power1.in' }, 0.8);
    });

    /* Cierre: revelado suave al entrar (sin pin) */
    gsap.fromTo('.outro__inner > *',
      { yPercent: 24, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        stagger: 0.08,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.outro',
          start: 'top 70%',
          toggleActions: 'play none none reverse'
        }
      });

    /* Las imágenes llevan width/height fijos, pero refrescamos tras
       la carga completa por seguridad (fuentes, etc.) */
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }

  /* ---------- Arranque ---------- */

  loadData()
    .then(function (items) {
      buildChapters(items);
      setupUI(items.length);
      if (animated) setupMotion(items);
      else document.documentElement.classList.add('reduced-motion');
    })
    .catch(function (err) {
      var host = document.getElementById('chapters');
      host.innerHTML =
        '<p style="padding:4rem 2rem;text-align:center;color:rgba(245,239,232,.6);">' +
        'No se pudieron cargar los capítulos. Visita ' +
        '<a href="https://naroa.online" style="color:#d8a24a;">naroa.online</a>.</p>';
      if (window.console && console.error) console.error(err);
    });
})();
