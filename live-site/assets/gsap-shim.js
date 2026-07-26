/* ═══════════════════════════════════════════════════════════════
   gsap-shim.js — Implementación mínima de window.gsap
   El bundle main.js usa `gsap.timeline()/.set()` para las
   transiciones de página, pero la librería nunca se carga: sin
   este shim, los botones del menú no hacen nada.
   Solo cubre el subset usado por main.js (timeline.fromTo/to/set).
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.gsap) return;

  var EASES = {
    'expo.inOut': 'cubic-bezier(0.87, 0, 0.13, 1)',
    'expo.out': 'cubic-bezier(0.16, 1, 0.3, 1)',
    'expo.in': 'cubic-bezier(0.7, 0, 0.84, 0)',
    'power2.out': 'cubic-bezier(0.33, 1, 0.68, 1)'
  };
  var TIMING = { duration: 1, ease: 1, delay: 1 };

  function toKeyframe(vars) {
    var k = {};
    for (var p in vars) {
      if (TIMING[p]) continue;
      if (p === 'translateY') k.transform = 'translateY(' + vars[p] + ')';
      else if (p === 'translateX') k.transform = 'translateX(' + vars[p] + ')';
      else k[p] = vars[p];
    }
    return k;
  }

  function animateEl(el, fromVars, toVars) {
    var frames = fromVars ? [toKeyframe(fromVars), toKeyframe(toVars)] : [toKeyframe(toVars)];
    var anim;
    try {
      anim = el.animate(frames, {
        duration: (toVars.duration != null ? toVars.duration : 0.6) * 1000,
        delay: (toVars.delay || 0) * 1000,
        easing: EASES[toVars.ease] || toVars.ease || 'ease',
        fill: 'forwards'
      });
    } catch (e) {
      return Promise.resolve();
    }
    return anim.finished.catch(function () {}).then(function () {
      try { anim.commitStyles(); anim.cancel(); } catch (e) {}
    });
  }

  function applyVars(el, vars) {
    for (var p in vars) {
      if (p === 'translateY') el.style.transform = 'translateY(' + vars[p] + ')';
      else if (p === 'translateX') el.style.transform = 'translateX(' + vars[p] + ')';
      else el.style[p] = vars[p];
    }
  }

  window.gsap = {
    timeline: function (opts) {
      opts = opts || {};
      var started = false, pending = 0;
      function done() {
        if (started && pending === 0 && typeof opts.onComplete === 'function') opts.onComplete();
      }
      function track(promise) {
        pending++;
        if (!started) {
          started = true;
          if (typeof opts.onStart === 'function') opts.onStart();
        }
        return promise.then(function () { pending--; done(); });
      }
      return {
        fromTo: function (el, from, to) { return track(animateEl(el, from, to)); },
        to: function (el, to) { return track(animateEl(el, null, to)); }
      };
    },
    set: applyVars
  };
})();
