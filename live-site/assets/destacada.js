/* ═══════════════════════════════════════════════════════════════
   destacada.js — Mejoras de la vista #/destacada (Obra)
   2026-07-19
   · Conecta la cuadrícula y el hero con el LightboxEngine existente
     (window.Naroa.systems.lightbox): zoom, flechas, contador, teclado.
   · Reveal al hacer scroll vía IntersectionObserver.
   · Accesibilidad: foco de teclado, roles y aria-labels.
   · Contador de obras en la cabecera de la colección.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  if (window.__destacadaEnhanced) return;
  window.__destacadaEnhanced = true;

  /* Metadatos verificados contra data/database.json y la propia web.
     Clave: nombre base del archivo de imagen (sin hash ni extensión). */
  var META = {
    'hq-amy':               { year: '2023', technique: 'Acrílico sobre pizarra', series: 'Rocks' },
    'hq-james':             { series: 'Rocks' },
    'hq-johnny':            { series: 'Rocks' },
    'marilyn-rocks':        { series: 'Rocks' },
    'celia-cruz-cantinflowers': { year: '2020', technique: 'Acrílico y collage sobre lienzo 3D', series: 'DiviNos' },
    'amor-en-conserva':     { series: 'En.Lata' },
    'dar-la-lata':          { series: 'En.Lata' },
    'baroque-farrokh':      { series: 'Tributos Musicales' },
    'tedas-queen':          { series: 'Tributos Musicales' }
  };

  function baseName(src) {
    var file = (src || '').split('/').pop().split('?')[0];
    return file.replace(/\.(webp|jpg|jpeg|png)$/i, '').replace(/-[A-Za-z0-9_-]{8}$/, '');
  }

  /* ── Recolectar obras en orden de lectura: hero + cuadrícula ── */
  function collectArtworks() {
    var list = [];

    var heroArt = document.querySelector('#gallery-hero .gallery-hero__artwork');
    if (heroArt) {
      var heroImg = heroArt.querySelector('img');
      var heroTitle = heroArt.querySelector('.gallery-hero__title');
      if (heroImg) {
        var hm = META[baseName(heroImg.src)] || {};
        list.push({
          el: heroArt,
          src: heroImg.currentSrc || heroImg.src,
          title: heroTitle ? heroTitle.textContent.trim() : (heroImg.alt || 'Obra destacada'),
          year: hm.year, technique: hm.technique, series: hm.series
        });
      }
    }

    document.querySelectorAll('#featured-gallery .gallery-massive__item').forEach(function (item) {
      var img = item.querySelector('img');
      var titleEl = item.querySelector('.gallery-massive__title');
      if (!img) return;
      var m = META[baseName(img.src)] || {};
      list.push({
        el: item,
        src: img.currentSrc || img.src,
        title: titleEl ? titleEl.textContent.trim() : (img.alt || 'Obra'),
        year: m.year, technique: m.technique, series: m.series
      });
    });

    return list;
  }

  /* ── Esperar a que el boot de la SPA instancie el LightboxEngine ── */
  function whenLightboxReady(cb, attempts) {
    attempts = attempts || 0;
    var lb = window.Naroa && window.Naroa.systems && window.Naroa.systems.lightbox;
    if (lb && typeof lb.open === 'function') return cb(lb);
    if (attempts > 80) return; // ~8 s; degrada en silencio
    setTimeout(function () { whenLightboxReady(cb, attempts + 1); }, 100);
  }

  /* ── Lightbox: clicks, teclado, foco, icono de ampliar ── */
  function wireLightbox(artworks) {
    whenLightboxReady(function (lightbox) {
      artworks.forEach(function (artwork, index) {
        var el = artwork.el;
        el.setAttribute('tabindex', '0');
        el.setAttribute('role', 'button');
        el.setAttribute('aria-label', 'Ver «' + artwork.title + '» ampliada');

        if (el.classList.contains('gallery-massive__item') && !el.querySelector('.gallery-massive__expand')) {
          var badge = document.createElement('span');
          badge.className = 'gallery-massive__expand';
          badge.setAttribute('aria-hidden', 'true');
          badge.textContent = '⤢';
          el.appendChild(badge);
        }

        el.addEventListener('click', function () {
          lightbox.open(artwork, artworks);
        });
        el.addEventListener('keydown', function (ev) {
          if (ev.key === 'Enter' || ev.key === ' ') {
            ev.preventDefault();
            lightbox.open(artwork, artworks);
          }
        });
      });
    });
  }

  /* ── Reveal al hacer scroll (con escalonado y reduced-motion) ── */
  function wireReveal() {
    var items = Array.prototype.slice.call(document.querySelectorAll('.gallery-reveal'));
    if (!items.length) return;
    items.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ── Contador de obras en la cabecera ── */
  function wireCounter() {
    var header = document.querySelector('#view-destacada .gallery-section-header');
    var n = document.querySelectorAll('#featured-gallery .gallery-massive__item').length;
    if (!header || !n) return;
    var chip = document.createElement('span');
    chip.className = 'gallery-count';
    chip.textContent = n + ' obras';
    header.appendChild(chip);
  }

  function init() {
    var artworks = collectArtworks();
    if (!artworks.length) return;
    wireLightbox(artworks);
    wireReveal();
    wireCounter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* ═══════════════════════════════════════════════════════════════
   destacada.js — parte 2 (2026-07-19)
   · Menú móvil (hamburguesa)
   · MICA: cierre persistente + cerebro local (sustituye el fallback enlatado)
   · Sección Blog sincronizada con WordPress
   · AORAN: las letras se retiran «detrás de la cabeza» a los 4 s
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Menú móvil ─────────────────────────────────────────────── */
  function wireMobileNav() {
    var toggle = document.getElementById('nav-toggle');
    var links = document.getElementById('nav-links');
    if (!toggle || !links) return;

    function setOpen(open) {
      links.classList.toggle('nav__links--open', open);
      toggle.classList.toggle('nav__toggle--open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      document.body.classList.toggle('nav-open', open);
    }
    toggle.addEventListener('click', function () {
      setOpen(!links.classList.contains('nav__links--open'));
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') setOpen(false);
    });
  }

  /* ── MICA: cierre persistente ─────────────────────────────────
     Antes: cerrabas el chat y a los 10 s se reabría solo
     (triggerContextual), como si «no se pudiera cerrar». ─────── */
  function wireMicaPolitesse(mica) {
    if (!mica || mica.__politesse) return;
    mica.__politesse = true;
    var origClose = mica.close.bind(mica);
    mica.close = function () {
      mica._manuallyClosed = true;
      origClose();
    };
    if (typeof mica.triggerContextual === 'function') {
      var origTrigger = mica.triggerContextual.bind(mica);
      mica.triggerContextual = function (ctx) {
        if (mica._manuallyClosed) return;
        return origTrigger(ctx);
      };
    }
    if (mica.elements && mica.elements.orb) {
      mica.elements.orb.addEventListener('click', function () {
        mica._manuallyClosed = false; // apertura manual: se perdona
      });
    }
  }

  /* ── MICA Brain: inteligencia local sobre Naroa ─────────────── */
  var MicaBrain = (function () {
    var blogPosts = []; // se rellena desde el cargador del blog

    function norm(s) {
      return (s || '').toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '');
    }

    var INTENTS = [
      {
        keys: ['precio', 'cuesta', 'coste', 'cuanto', 'tarifa', 'presupuesto', 'valen'],
        answer: 'Depende del tamaño, la técnica y la complejidad del retrato — cada pieza es única, como la persona retratada. Lo mejor: escríbele a **naroa@naroa.eu** contándole tu idea y te prepara presupuesto sin compromiso. 💛'
      },
      {
        keys: ['encarg', 'retrato', 'quiero', 'pedido', 'comision', 'regalo', 'pintame', 'pintar a'],
        answer: '¡Qué ilusión! Así funciona:\n1. Escríbele a **naroa@naroa.eu** o DM en Instagram y cuéntale a quién quieres retratar.\n2. Te envía boceto y propuesta (técnica, formato).\n3. Pinta durante semanas y te manda fotos del proceso.\n4. Retrato terminado, con certificado de autenticidad y envío seguro.'
      },
      {
        keys: ['tecnica', 'material', 'pizarra', 'mica', 'acrilico', 'posca', 'oleo', 'como pinta', 'hiperreal'],
        answer: 'Naroa trabaja el **hiperrealismo POP**: acrílico y Posca sobre pizarra natural, con mica mineral que hace «latir» los ojos de sus retratos. Como dice ella: cada piedra tiene millones de años; cada retrato, la edad de quien lo mira. ✨'
      },
      {
        keys: ['obra', 'galeria', 'cuadro', 'coleccion', 'serie', 'rocks', 'divinos', 'ver arte'],
        answer: 'Tiene 27 obras esperándote en la galería: series **Rocks** (Amy, Marilyn, Johnny…), **DiviNos**, **Tributos Musicales** (Freddie, Cantinflas) y **En.Lata** (arte en conserva). Pulsa «Obra» en el menú o dime «galería» y te llevo. 🎨'
      },
      {
        keys: ['expo', 'trayectoria', 'muestra', 'exposicion'],
        answer: 'Su trayectoria expositiva está en la sección **Trayectoria** del menú — incluye la muestra reciente «DiviNos VaiVenes» y sus Walking Gallery por Bilbao. También lo cuenta en el blog. 🖼️'
      },
      {
        keys: ['juego', 'jugar', 'juegos', 'tetris', 'memory', 'snake', 'oca'],
        answer: '¡Hay una **Sala de Juegos** con 21 minijuegos hechos con sus obras! Oca, Tetris artístico, Memory, Puzzle, Snake, Breakout… Escribe #/juegos en la barra o baja hasta la sección de juegos. 🎮'
      },
      {
        keys: ['blog', 'escribe', 'articulo', 'diario', 'noticia', 'novedad'],
        answer: function () {
          if (blogPosts.length) {
            var p = blogPosts[0];
            return 'Naroa escribe en su blog de WordPress (tienes la sección **Blog** aquí mismo, sincronizada). Lo último: «' + p.title + '» (' + p.dateText + '). ¿Te paso el enlace? Está en la tarjeta del Blog. ✍️';
          }
          return 'Naroa escribe en su blog de WordPress — ahora tiene sección **Blog** aquí, sincronizada: lo que publica allí aparece aquí. ✍️';
        }
      },
      {
        keys: ['envio', 'enviar', 'envia', 'correo', 'shipping', 'fuera de bilbao', 'espana'],
        answer: 'Sí, envía a **toda España** con embalaje seguro y certificado de autenticidad. Para encargos fuera, escríbele a **naroa@naroa.eu** y lo habláis. 📦'
      },
      {
        keys: ['contacto', 'email', 'correo', 'instagram', 'hablar', 'llamar', 'telefono'],
        answer: 'Puedes escribirle a **naroa@naroa.eu** o por Instagram a **@naroa_art**. Su estudio está en Bilbao — y los mejores encargos empiezan con un «oye, tengo una idea». 💌'
      },
      {
        keys: ['quien es', 'naroa', 'artista', 'sobre ella', 'sobre ti', 'bilbao'],
        answer: 'Naroa Gutiérrez Gil es artista visual en **Bilbao**: hiperrealismo POP sobre pizarra y mica mineral. Retratos de iconos (Amy, Marilyn, James Dean…) y retratos por encargo con alma. En «Sobre mí» tienes su historia. 🌙'
      },
      {
        keys: ['hola', 'buenas', 'hey', 'kaixo', 'saludos'],
        answer: '¡Kaixo! Soy MICA, la conciencia mineral de esta galería. 💎 Pregúntame por los **retratos por encargo**, las **obras**, los **juegos** o el **blog** de Naroa.'
      },
      {
        keys: ['gracias', 'eskerrik', 'agur', 'adios', 'genial'],
        answer: '¡Eskerrik asko! Si al final te animas con un retrato, ya sabes: **naroa@naroa.eu**. Agur. 🌟'
      }
    ];

    var FALLBACK = 'Mmm, eso se me escapa entre las vetas de la pizarra… Puedo contarte sobre **encargos y precios**, **técnicas** (pizarra y mica), las **obras**, **exposiciones**, **juegos** o el **blog**. ¿Por dónde empezamos?';

    function answer(text) {
      var t = norm(text);
      var best = null, bestScore = 0;
      INTENTS.forEach(function (it) {
        var score = 0;
        it.keys.forEach(function (k) { if (t.indexOf(k) !== -1) score += k.length > 5 ? 2 : 1; });
        if (score > bestScore) { bestScore = score; best = it; }
      });
      if (!best) return FALLBACK;
      return typeof best.answer === 'function' ? best.answer() : best.answer;
    }

    return {
      answer: answer,
      setBlogPosts: function (posts) { blogPosts = posts; }
    };
  })();
  window.MicaBrain = MicaBrain;

  function wireMicaBrain(mica) {
    if (!mica || mica.__brainWired) return;
    mica.__brainWired = true;
    mica._callAPI = async function (userText) {
      // Si algún día existe /api/chat, se usa; si no, cerebro local.
      try {
        var ctrl = new AbortController();
        var timer = setTimeout(function () { ctrl.abort(); }, 3500);
        var r = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [{ role: 'user', content: userText }] }),
          signal: ctrl.signal
        });
        clearTimeout(timer);
        if (r.ok) {
          var j = await r.json();
          if (j && (j.content || j.text)) return j.content || j.text;
        }
      } catch (e) { /* cerebro local */ }
      return MicaBrain.answer(userText);
    };
  }

  function whenMicaReady(cb, attempts) {
    attempts = attempts || 0;
    var mica = window.Naroa && window.Naroa.systems && window.Naroa.systems.mica;
    if (mica && mica.elements && mica.elements.panel) return cb(mica);
    if (attempts > 80) return;
    setTimeout(function () { whenMicaReady(cb, attempts + 1); }, 100);
  }

  /* ── Blog sincronizado con WordPress ────────────────────────── */
  var WP_API = 'https://public-api.wordpress.com/wp/v2/sites/naroagutierrez.wordpress.com/posts?per_page=6&_embed=1&_fields=date,link,title,excerpt,content,_embedded';

  function decodeEntities(html) {
    var t = document.createElement('textarea');
    t.innerHTML = html;
    return t.value;
  }
  function stripTags(html) {
    var d = document.createElement('div');
    d.innerHTML = html;
    return d.textContent || '';
  }
  function postImage(p) {
    var url = null;
    try {
      var m = p._embedded['wp:featuredmedia'][0];
      var sizes = m.media_details && m.media_details.sizes;
      if (sizes) {
        var pref = sizes.medium_large || sizes.large || sizes.medium || sizes.full;
        if (pref) url = pref.source_url;
      }
      url = url || m.source_url || null;
    } catch (e) { /* sin destacada */ }
    // Sin imagen destacada: primera imagen del contenido (suele ser un gif suyo)
    if (!url && p.content && p.content.rendered) {
      var match = p.content.rendered.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (match) url = match[1];
    }
    // Redimensionar vía CDN de WP.com para no arrastrar originales
    if (url && url.indexOf('wordpress.com') !== -1) {
      url += (url.indexOf('?') === -1 ? '?' : '&') + 'w=720';
    }
    return url;
  }
  function fmtDate(iso) {
    try {
      return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) { return iso.slice(0, 10); }
  }

  function wireBlog() {
    var grid = document.getElementById('blog-posts');
    if (!grid) return;

    fetch(WP_API)
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (posts) {
        if (!posts || !posts.length) throw new Error('sin entradas');
        grid.textContent = '';
        var brainFeed = [];
        posts.forEach(function (p) {
          var title = decodeEntities(p.title.rendered || 'Sin título');
          var excerpt = stripTags(p.excerpt.rendered || '').trim();
          var dateText = fmtDate(p.date);
          var img = postImage(p);
          brainFeed.push({ title: title, dateText: dateText, link: p.link });

          var card = document.createElement('a');
          card.className = 'blog-card';
          card.href = p.link;
          card.target = '_blank';
          card.rel = 'noopener noreferrer';
          card.setAttribute('aria-label', 'Leer «' + title + '» en el blog de Naroa');

          var media = document.createElement('div');
          if (img) {
            media.className = 'blog-card__media';
            var im = document.createElement('img');
            im.src = img; im.alt = title; im.loading = 'lazy'; im.decoding = 'async';
            media.appendChild(im);
          } else {
            media.className = 'blog-card__media blog-card__media--empty';
            media.textContent = '🎨';
          }

          var body = document.createElement('div');
          body.className = 'blog-card__body';
          var time = document.createElement('time');
          time.className = 'blog-card__date'; time.textContent = dateText;
          var h = document.createElement('h3');
          h.className = 'blog-card__title'; h.textContent = title;
          var ex = document.createElement('p');
          ex.className = 'blog-card__excerpt'; ex.textContent = excerpt;
          var cta = document.createElement('span');
          cta.className = 'blog-card__cta'; cta.textContent = 'Leer en el blog →';

          body.appendChild(time); body.appendChild(h);
          if (excerpt) body.appendChild(ex);
          body.appendChild(cta);
          card.appendChild(media); card.appendChild(body);
          grid.appendChild(card);
        });
        MicaBrain.setBlogPosts(brainFeed);
      })
      .catch(function () {
        grid.innerHTML = '<div class="blog__error">No se pudieron cargar las entradas ahora mismo. ' +
          'Visita el blog directamente: <a href="https://naroagutierrez.wordpress.com/" target="_blank" rel="noopener noreferrer">naroagutierrez.wordpress.com</a></div>';
      });
  }

  /* Soporte de la ruta #/blog (scroll) y activación del enlace */
  function wireBlogRoute() {
    function check() {
      if (location.hash === '#/blog') {
        var s = document.getElementById('view-blog');
        if (s) setTimeout(function () {
          window.scrollTo({ top: s.offsetTop - 70, behavior: 'smooth' });
        }, 60);
      }
    }
    window.addEventListener('hashchange', check);
    check();
  }

  /* ── AORAN: las letras se retiran detrás de la cabeza ───────── */
  function wireAoranDrift() {
    var title = document.querySelector('.about__impact-title');
    var section = document.getElementById('view-about');
    if (!title || !section) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Envolver cada carácter (conservando <br> y spans dorados)
    if (!title.querySelector('.aoran-char')) {
      var idx = 0;
      (function wrap(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (child) {
          if (child.nodeType === 3) {
            var frag = document.createDocumentFragment();
            child.textContent.split('').forEach(function (ch) {
              if (ch === ' ') { frag.appendChild(document.createTextNode(' ')); return; }
              var s = document.createElement('span');
              s.className = 'aoran-char';
              s.textContent = ch;
              s.style.setProperty('--i', idx);
              s.style.setProperty('--r', ((idx % 2 ? -1 : 1) * (3 + (idx * 7) % 8)) + 'deg');
              idx++;
              frag.appendChild(s);
            });
            node.replaceChild(frag, child);
          } else if (child.nodeType === 1 && child.tagName !== 'BR') {
            wrap(child);
          }
        });
      })(title);
    }

    var timer = null, cycle = null;
    function stopCycle() {
      title.classList.remove('aoran-drift');
      if (timer) { clearTimeout(timer); timer = null; }
      if (cycle) { clearTimeout(cycle); cycle = null; }
    }
    function startCycle() {
      stopCycle();
      timer = setTimeout(function () {
        title.classList.add('aoran-drift');
        // las letras vuelven solas al rato, y el ciclo se repite
        cycle = setTimeout(function () {
          title.classList.remove('aoran-drift');
          startCycle();
        }, 5200);
      }, 4000); // «como a los cuatro segundos»
    }
    // al acariciar el título, las letras regresan al momento
    title.addEventListener('mouseenter', function () {
      title.classList.remove('aoran-drift');
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.isIntersecting ? startCycle() : stopCycle(); });
    }, { threshold: 0.35 });
    io.observe(section);
  }

  /* ── Navegación suave universal sin fricción ────────────────── */
  function wireUniversalNavigation() {
    var routeMap = {
      '#/': 'view-home',
      '#/home': 'view-home',
      '#/destacada': 'view-destacada',
      '#/obra': 'view-destacada',
      '#/trayectoria': 'view-trayectoria',
      '#/exposiciones': 'view-trayectoria',
      '#/about': 'view-about',
      '#/sobre-mi': 'view-about',
      '#/blog': 'view-blog',
      '#/contacto': 'view-contacto'
    };

    function updateNavActive(targetHash) {
      document.querySelectorAll('.nav__link').forEach(function (link) {
        var href = link.getAttribute('href');
        var isActive = (href === targetHash) || (targetHash === '#/' && href === '#/');
        link.classList.toggle('nav__link--active', isActive);
        link.classList.toggle('active', isActive);
      });
    }

    function scrollToSection(targetId) {
      var targetEl = document.getElementById(targetId);
      if (!targetEl) return false;
      var nav = document.getElementById('main-nav') || document.querySelector('.nav');
      var navHeight = nav ? nav.offsetHeight : 60;
      var targetTop = targetEl.getBoundingClientRect().top + window.pageYOffset - navHeight - 15;
      
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';

      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior: 'smooth'
      });
      return true;
    }

    // Interceptación de clics en la navegación
    document.querySelectorAll('a[href^="#/"], .nav__link, .nav__logo').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = link.getAttribute('href');
        if (!href || !href.startsWith('#/')) return;
        
        var navLinks = document.getElementById('nav-links');
        var navToggle = document.getElementById('nav-toggle');
        if (navLinks && navLinks.classList.contains('nav__links--open')) {
          navLinks.classList.remove('nav__links--open');
          if (navToggle) navToggle.classList.remove('nav__toggle--open');
          document.body.classList.remove('nav-open');
        }

        var targetId = routeMap[href];
        if (targetId) {
          e.preventDefault();
          e.stopPropagation();
          scrollToSection(targetId);
          if (window.history && window.history.pushState) {
            window.history.pushState(null, null, href);
          } else {
            window.location.hash = href;
          }
          updateNavActive(href);
        }
      }, true);
    });

    // Soporte inicial si la URL ya trae hash al cargar
    if (window.location.hash && routeMap[window.location.hash]) {
      var initialTarget = routeMap[window.location.hash];
      setTimeout(function () {
        scrollToSection(initialTarget);
        updateNavActive(window.location.hash);
      }, 300);
    }
  }

  /* ── ScrollSpy para resaltar el menú según la sección en pantalla ── */
  function wireScrollSpy() {
    var sections = document.querySelectorAll('section[id^="view-"]');
    var navLinks = document.querySelectorAll('.nav__link');
    if (!sections.length || !navLinks.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute('id');
          var hashMap = {
            'view-home': '#/',
            'view-destacada': '#/destacada',
            'view-about': '#/about',
            'view-blog': '#/blog',
            'view-contacto': '#/contacto'
          };
          var targetHash = hashMap[id];
          if (targetHash) {
            navLinks.forEach(function (link) {
              var href = link.getAttribute('href');
              var isActive = (href === targetHash) || 
                             (targetHash === '#/about' && (href === '#/about' || href === '#/sobre-mi')) ||
                             (targetHash === '#/destacada' && (href === '#/destacada' || href === '#/obra')) ||
                             (targetHash === '#/' && (href === '#/' || href === ''));
              link.classList.toggle('nav__link--active', isActive);
              link.classList.toggle('active', isActive);
            });
          }
        }
      });
    }, { threshold: 0.25 });

    sections.forEach(function (sec) { observer.observe(sec); });
  }

  /* ── Studio Ambient Soundscape (Sintetizador Web Audio 432Hz Mineral) ── */
  function wireSoundscape() {
    var nav = document.getElementById('main-nav') || document.querySelector('.nav');
    if (!nav || document.getElementById('ambient-sound-btn')) return;

    var soundBtn = document.createElement('button');
    soundBtn.id = 'ambient-sound-btn';
    soundBtn.className = 'ambient-sound-btn';
    soundBtn.setAttribute('aria-label', 'Activar atmósfera sonora del estudio');
    soundBtn.title = 'Eco Mineral del Estudio (432 Hz)';
    soundBtn.innerHTML = '<span>🔊</span> <small class="sound-label">Eco Studio</small>';

    var navRight = nav.querySelector('.nav__right') || nav;
    navRight.insertBefore(soundBtn, navRight.firstChild);

    var audioCtx = null;
    var osc1 = null, osc2 = null, gainNode = null;
    var isPlaying = false;

    soundBtn.addEventListener('click', function () {
      if (isPlaying) {
        if (gainNode && audioCtx) {
          gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.4);
          setTimeout(function () {
            if (audioCtx) audioCtx.suspend();
          }, 500);
        }
        isPlaying = false;
        soundBtn.classList.remove('ambient-sound-btn--active');
        soundBtn.querySelector('.sound-label').textContent = 'Eco Studio';
      } else {
        if (!audioCtx) {
          var AudioContext = window.AudioContext || window.webkitAudioContext;
          audioCtx = new AudioContext();

          // Oscilador armónico 432 Hz (Afinación natural mineral)
          osc1 = audioCtx.createOscillator();
          osc2 = audioCtx.createOscillator();
          gainNode = audioCtx.createGain();

          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(216, audioCtx.currentTime); // Suboctava cálida

          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(432, audioCtx.currentTime); // Tono cristalino

          var filter = audioCtx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(320, audioCtx.currentTime);

          osc1.connect(gainNode);
          osc2.connect(filter);
          filter.connect(gainNode);
          gainNode.connect(audioCtx.destination);

          osc1.start();
          osc2.start();
        }

        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }
        gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
        gainNode.gain.setValueAtTime(gainNode.gain.value || 0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 0.8); // Volumen sutil y continuo

        isPlaying = true;
        soundBtn.classList.add('ambient-sound-btn--active');
        soundBtn.querySelector('.sound-label').textContent = 'Sonando (432Hz) ✨';
      }
    });
  }

  /* ── EL GUIÑO MINERAL (Algunos ojos guiñan con la luz de la mica) ── */
  function wireMineralWink() {
    var targets = [
      { sel: '.hero-immersive__image-wrapper', top: '38%', left: '53%', name: 'Marilyn' },
      { sel: '#gallery-hero .gallery-hero__artwork', top: '34%', left: '49%', name: 'Amy' },
      { sel: 'img[src*="hq-james"]', isImg: true, top: '35%', left: '54%', name: 'James' },
      { sel: 'img[src*="hq-portrait-1"]', isImg: true, top: '36%', left: '48%', name: 'Retrato I' },
      { sel: 'img[src*="hq-johnny"]', isImg: true, top: '38%', left: '46%', name: 'Johnny' },
      { sel: 'img[src*="audrey-hepburn"]', isImg: true, top: '36%', left: '51%', name: 'Audrey' },
      { sel: 'img[src*="geisha"]', isImg: true, top: '39%', left: '49%', name: 'Geisha' }
    ];

    targets.forEach(function (t) {
      var container = document.querySelector(t.sel);
      if (!container) return;
      if (t.isImg) {
        container = container.closest('.gallery-massive__item') || container.parentElement;
      }
      if (!container || container.querySelector('.mineral-wink-eye')) return;

      container.style.position = 'relative';

      var eye = document.createElement('div');
      eye.className = 'mineral-wink-eye';
      eye.style.top = t.top;
      eye.style.left = t.left;

      var spark = document.createElement('span');
      spark.className = 'mineral-wink-spark';
      spark.textContent = '✨';
      eye.appendChild(spark);

      container.appendChild(eye);

      function triggerWink() {
        if (eye.classList.contains('mineral-wink-eye--active')) return;
        eye.classList.add('mineral-wink-eye--active');
        setTimeout(function () {
          eye.classList.remove('mineral-wink-eye--active');
        }, 380); // Guiño discreto y rápido de 380 ms
      }

      // Guiño al pasar el ratón
      container.addEventListener('mouseenter', function () {
        setTimeout(triggerWink, 180);
      });

      // Guiño aleatorio autónomo (cada 8 a 15 segundos si está en pantalla)
      var interval = Math.floor(Math.random() * 7000) + 8000;
      setInterval(function () {
        var rect = container.getBoundingClientRect();
        var inView = rect.top < window.innerHeight && rect.bottom > 0;
        if (inView) triggerWink();
      }, interval);
    });
  }

  /* ── Enforce MICA Coqueta & Discreta (UI compacta 250px, sin MICA SYSTEM v∞) ── */
  function enforceMicaCoqueta() {
    var checkTimer = setInterval(function () {
      var panel = document.getElementById('mica-panel');
      var orb = document.getElementById('mica-orb');
      if (panel) {
        panel.style.setProperty('width', '250px', 'important');
        panel.style.setProperty('max-width', '250px', 'important');
        panel.style.setProperty('max-height', '310px', 'important');

        var nameEl = panel.querySelector('.mica-header__name');
        var statusEl = panel.querySelector('#mica-status');
        var avatarEl = panel.querySelector('.mica-header__avatar');
        if (nameEl) nameEl.textContent = '✨ Mica';
        if (statusEl) statusEl.textContent = '✨ Curadora del estudio';
        if (avatarEl) avatarEl.textContent = '✨';
      }
      if (orb) {
        orb.style.setProperty('width', '36px', 'important');
        orb.style.setProperty('height', '36px', 'important');
        orb.style.setProperty('min-width', '36px', 'important');
        orb.style.setProperty('min-height', '36px', 'important');
      }
      if (panel && orb) clearInterval(checkTimer);
    }, 100);
  }

  /* ── Tactilidad Escultórica 3D (Efecto Inclinación sobre Pizarra) ── */
  function wire3DTilt() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var cards = document.querySelectorAll('.gallery-massive__item, .gallery-hero__artwork');
    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        var rotX = (-y / rect.height) * 8;
        var rotY = (x / rect.width) * 8;
        card.style.transform = 'perspective(1000px) rotateX(' + rotX.toFixed(2) + 'deg) rotateY(' + rotY.toFixed(2) + 'deg) scale3d(1.02, 1.02, 1.02)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  /* ── init ───────────────────────────────────────────────────── */
  function init2() {
    wireMobileNav();
    wireBlog();
    wireBlogRoute();
    wireAoranDrift();
    wireUniversalNavigation();
    wireScrollSpy();
    wireSoundscape();
    wireMineralWink();
    wire3DTilt();
    enforceMicaCoqueta();
    whenMicaReady(function (mica) {
      wireMicaPolitesse(mica);
      wireMicaBrain(mica);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init2);
  } else {
    init2();
  }
})();

