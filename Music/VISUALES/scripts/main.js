const navToggle = document.querySelector(".nav-toggle");
const lightbox = document.querySelector(".lightbox");
const lightboxImage = document.querySelector(".lightbox img");
const lightboxCaption = document.querySelector(".lightbox figcaption");
const consultToggle = document.querySelector(".consult-toggle");
const consultPanel = document.querySelector(".consult-panel");

if (navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("menu-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

// Lightbox Close Logic
document.querySelector(".lightbox-close")?.addEventListener("click", () => {
  lightbox?.classList.remove("open");
  lightbox?.setAttribute("hidden", "");
});

lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    lightbox.classList.remove("open");
    lightbox.setAttribute("hidden", "");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    lightbox?.classList.remove("open");
    lightbox?.setAttribute("hidden", "");
    consultPanel?.classList.remove("open");
    consultToggle?.setAttribute("aria-expanded", "false");
  }
});

consultToggle?.addEventListener("click", () => {
  const isOpen = consultPanel?.classList.toggle("open") || false;
  consultToggle.setAttribute("aria-expanded", String(isOpen));
});

// ==========================================================================
// SOVEREIGN KINETICS ENGINE (MOSKV AESTHETIC 2026)
// ==========================================================================

const isFinePointer = window.matchMedia("(pointer: fine)").matches;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Global animation loops registration
const ticks = [];

// 1. Custom Premium Cursor Setup
let cursorState = null;
if (isFinePointer && !prefersReducedMotion) {
  const dot = document.createElement("div");
  dot.className = "custom-cursor";
  const ring = document.createElement("div");
  ring.className = "custom-cursor-ring";
  document.body.appendChild(dot);
  document.body.appendChild(ring);
  document.body.classList.add("has-custom-cursor");

  cursorState = {
    mouse: { x: -100, y: -100 },
    dot: { x: -100, y: -100 },
    ring: { x: -100, y: -100 }
  };

  window.addEventListener("pointermove", (e) => {
    cursorState.mouse.x = e.clientX;
    cursorState.mouse.y = e.clientY;
  }, { passive: true });

  // Update hover classes dynamically
  const setupHoverState = (selector, className) => {
    document.querySelectorAll(selector).forEach(el => {
      el.addEventListener("pointerenter", () => document.body.classList.add(className));
      el.addEventListener("pointerleave", () => document.body.classList.remove(className));
    });
  };

  setupHoverState("a, button, summary, input, textarea", "cursor-hover");
  setupHoverState(".art-card, .minimal-piece, .room-piece", "cursor-hover");
  setupHoverState(".disruptive-card", "cursor-drag");

  ticks.push(() => {
    cursorState.dot.x += (cursorState.mouse.x - cursorState.dot.x) * 0.35;
    cursorState.dot.y += (cursorState.mouse.y - cursorState.dot.y) * 0.35;
    cursorState.ring.x += (cursorState.mouse.x - cursorState.ring.x) * 0.15;
    cursorState.ring.y += (cursorState.mouse.y - cursorState.ring.y) * 0.15;

    dot.style.transform = `translate3d(${cursorState.dot.x}px, ${cursorState.dot.y}px, 0)`;
    ring.style.transform = `translate3d(${cursorState.ring.x}px, ${cursorState.ring.y}px, 0)`;
  });
}

// 2. 3D Card Tilt with Sub-Image Parallax Shift
const cardStates = [];
document.querySelectorAll(".art-card, .minimal-piece, .room-piece").forEach((card) => {
  const img = card.querySelector("img");
  const title = card.dataset.title || card.querySelector("h3")?.textContent || card.querySelector("figcaption")?.textContent || img?.alt || "";

  card.tabIndex = 0;
  card.setAttribute("role", "button");
  if (title) card.setAttribute("aria-label", `Ver ${title}`);

  const openArtwork = () => {
    const meta = card.dataset.meta;
    if (!img || !lightbox || !lightboxImage || !lightboxCaption) return;
    lightboxImage.src = img.currentSrc || img.src;
    lightboxImage.alt = img.alt;
    lightboxCaption.textContent = meta ? `${title} · ${meta}` : title;
    lightbox.classList.add("open");
    lightbox.removeAttribute("hidden");
  };

  card.addEventListener("click", openArtwork);
  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openArtwork();
  });

  if (isFinePointer && !prefersReducedMotion) {
    const state = {
      card,
      img,
      currRotX: 0, currRotY: 0,
      targetRotX: 0, targetRotY: 0,
      currImgX: 0, currImgY: 0,
      targetImgX: 0, targetImgY: 0
    };
    cardStates.push(state);

    card.addEventListener("pointermove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xc = rect.width / 2;
      const yc = rect.height / 2;

      // Rotate X around horizontal axis, Rotate Y around vertical axis
      state.targetRotY = ((x - xc) / xc) * 8; 
      state.targetRotX = ((yc - y) / yc) * 8; 

      // Shift image in opposite direction for visual parallax depth
      state.targetImgX = ((x - xc) / xc) * -10;
      state.targetImgY = ((y - yc) / yc) * -10;
    });

    card.addEventListener("pointerleave", () => {
      state.targetRotX = 0;
      state.targetRotY = 0;
      state.targetImgX = 0;
      state.targetImgY = 0;
      card.classList.add("resetting");
      setTimeout(() => card.classList.remove("resetting"), 600);
    });
  } else {
    // Basic fallback for simple gradient positioning on pointermove
    card.addEventListener("pointermove", (event) => {
      if (!card.classList.contains("room-piece")) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${((event.clientX - rect.left) / rect.width) * 100}%`);
      card.style.setProperty("--my", `${((event.clientY - rect.top) / rect.height) * 100}%`);
    }, { passive: true });
  }
});

if (cardStates.length > 0) {
  ticks.push(() => {
    for (let i = 0; i < cardStates.length; i++) {
      const s = cardStates[i];
      s.currRotX += (s.targetRotX - s.currRotX) * 0.12;
      s.currRotY += (s.targetRotY - s.currRotY) * 0.12;
      s.currImgX += (s.targetImgX - s.currImgX) * 0.12;
      s.currImgY += (s.targetImgY - s.currImgY) * 0.12;

      s.card.style.transform = `perspective(1000px) rotateX(${s.currRotX}deg) rotateY(${s.currRotY}deg)`;
      if (s.img) {
        s.img.style.transform = `scale(1.08) translate3d(${s.currImgX}px, ${s.currImgY}px, 0)`;
      }
    }
  });
}

// 3. Magnetic Hover Pull for Buttons/Links
const magneticElements = [];
if (isFinePointer && !prefersReducedMotion) {
  document.querySelectorAll(".brand-mark, .nav-links a, .minimal-actions a, .consult-toggle, .lightbox-close").forEach((el) => {
    const state = {
      el,
      currX: 0, currY: 0,
      targetX: 0, targetY: 0
    };
    magneticElements.push(state);

    el.addEventListener("pointermove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      // Draw element 35% of the distance to the pointer
      state.targetX = x * 0.35;
      state.targetY = y * 0.35;
    });

    el.addEventListener("pointerleave", () => {
      state.targetX = 0;
      state.targetY = 0;
    });
  });
}

if (magneticElements.length > 0) {
  ticks.push(() => {
    for (let i = 0; i < magneticElements.length; i++) {
      const s = magneticElements[i];
      s.currX += (s.targetX - s.currX) * 0.15;
      s.currY += (s.targetY - s.currY) * 0.15;
      
      const isNeutral = Math.abs(s.currX) < 0.05 && Math.abs(s.currY) < 0.05;
      s.el.style.transform = isNeutral ? "" : `translate3d(${s.currX}px, ${s.currY}px, 0)`;
    }
  });
}

// 4. Draggable Disruptive Card with Bouncing Physics and Elasticity
const disruptiveCard = document.getElementById("rara-avis-card");
if (disruptiveCard) {
  let isDragging = false;
  let startX = 0, startY = 0;
  let cardX = 0, cardY = 0;
  let velX = 0, velY = 0;
  let lastX = 0, lastY = 0;
  let lastTime = 0;
  let currentRotation = 5;
  let targetRotation = 5;
  let dragDistance = 0;

  disruptiveCard.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    isDragging = true;
    startX = e.clientX - cardX;
    startY = e.clientY - cardY;
    lastX = e.clientX;
    lastY = e.clientY;
    lastTime = performance.now();
    velX = 0;
    velY = 0;
    dragDistance = 0;

    document.body.classList.add("cursor-drag");
    disruptiveCard.setPointerCapture(e.pointerId);
    e.stopPropagation();
  });

  disruptiveCard.addEventListener("pointermove", (e) => {
    if (!isDragging) return;
    const now = performance.now();
    const dt = now - lastTime;
    
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    dragDistance += Math.sqrt(dx * dx + dy * dy);

    cardX = e.clientX - startX;
    cardY = e.clientY - startY;

    if (dt > 0) {
      velX = dx / (dt / 16.666);
      velY = dy / (dt / 16.666);
    }

    lastX = e.clientX;
    lastY = e.clientY;
    lastTime = now;
  });

  disruptiveCard.addEventListener("pointerup", (e) => {
    if (!isDragging) return;
    isDragging = false;
    disruptiveCard.releasePointerCapture(e.pointerId);
    document.body.classList.remove("cursor-drag");

    // Click / lightbox opening on short pointer release
    if (dragDistance < 8) {
      const img = disruptiveCard.querySelector("img");
      const title = disruptiveCard.dataset.title || "Rara Avis";
      const meta = disruptiveCard.dataset.meta || "Edición especial";
      if (img && lightbox && lightboxImage && lightboxCaption) {
        lightboxImage.src = img.src;
        lightboxImage.alt = img.alt;
        lightboxCaption.textContent = `${title} · ${meta}`;
        lightbox.classList.add("open");
        lightbox.removeAttribute("hidden");
      }
    }
  });

  ticks.push(() => {
    if (!isDragging) {
      // Apply momentum decay
      cardX += velX;
      cardY += velY;
      velX *= 0.94;
      velY *= 0.94;

      // Bound collision checking with elasticity
      const rect = disruptiveCard.getBoundingClientRect();
      const pad = 16;

      if (rect.left < pad) {
        cardX += pad - rect.left;
        velX *= -0.55;
      } else if (rect.right > window.innerWidth - pad) {
        cardX += (window.innerWidth - pad) - rect.right;
        velX *= -0.55;
      }

      if (rect.top < pad) {
        cardY += pad - rect.top;
        velY *= -0.55;
      } else if (rect.bottom > window.innerHeight - pad) {
        cardY += (window.innerHeight - pad) - rect.bottom;
        velY *= -0.55;
      }

      targetRotation = 5 + (velX * 0.5);
    } else {
      targetRotation = velX * 1.6;
    }

    currentRotation += (targetRotation - currentRotation) * 0.12;
    disruptiveCard.style.transform = `translate3d(${cardX}px, ${cardY}px, 0) rotate(${currentRotation}deg)`;
  });
}

// Global single tick loop
function globalTick() {
  for (let i = 0; i < ticks.length; i++) {
    ticks[i]();
  }
  requestAnimationFrame(globalTick);
}
if (ticks.length > 0) {
  requestAnimationFrame(globalTick);
}

// 5. Interactive Mica-Canvas follow-pointer smoothing
function initMicaCanvas() {
  const canvas = document.querySelector(".mica-canvas");
  if (!canvas || prefersReducedMotion) return;

  const gl = canvas.getContext("webgl2", {
    alpha: true,
    antialias: false,
    powerPreference: "high-performance"
  });
  if (!gl) return;

  const vertexSource = `#version 300 es
    in vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const fragmentSource = `#version 300 es
    precision highp float;
    uniform vec2 u_resolution;
    uniform vec2 u_pointer;
    uniform float u_time;
    out vec4 outColor;

    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 345.45));
      p += dot(p, p + 34.345);
      return fract(p.x * p.y);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
        u.y
      );
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      vec2 pointer = u_pointer;
      vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
      float d = length((uv - pointer) * aspect);
      float grain = noise(uv * 84.0 + u_time * 0.12);
      float slow = noise(uv * 6.0 + vec2(u_time * 0.06, -u_time * 0.03));
      float vein = sin((uv.y + slow * 0.09) * 30.0 + u_time * 0.7);
      float mica = smoothstep(0.78, 1.0, vein * 0.5 + 0.5) * (0.35 + grain * 0.65);
      float lens = exp(-d * d * 22.0);
      float edge = smoothstep(0.18, 0.0, abs(d - 0.16));
      vec3 gold = vec3(1.0, 0.72, 0.18);
      vec3 red = vec3(0.95, 0.08, 0.14);
      vec3 pearl = vec3(0.88, 0.95, 1.0);
      vec3 color = mix(red, gold, mica);
      color = mix(color, pearl, edge * 0.45);
      float alpha = mica * 0.18 + lens * 0.26 + edge * 0.18;
      outColor = vec4(color, alpha);
    }
  `;

  const compileShader = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const vertexShader = compileShader(gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertexShader || !fragmentShader) return;

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW
  );

  const position = gl.getAttribLocation(program, "a_position");
  const resolution = gl.getUniformLocation(program, "u_resolution");
  const pointer = gl.getUniformLocation(program, "u_pointer");
  const time = gl.getUniformLocation(program, "u_time");

  const pointerState = { x: 0.58, y: 0.52 };
  const targetPointer = { x: 0.58, y: 0.52 };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.floor(rect.width * ratio));
    canvas.height = Math.max(1, Math.floor(rect.height * ratio));
    gl.viewport(0, 0, canvas.width, canvas.height);
  };

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pointermove", (event) => {
    const rect = canvas.getBoundingClientRect();
    targetPointer.x = (event.clientX - rect.left) / rect.width;
    targetPointer.y = 1 - (event.clientY - rect.top) / rect.height;
  }, { passive: true });

  resize();
  gl.useProgram(program);
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const render = (now) => {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Smooth follow-pointer interpolation (Liquid Aura)
    pointerState.x += (targetPointer.x - pointerState.x) * 0.05;
    pointerState.y += (targetPointer.y - pointerState.y) * 0.05;
    
    gl.uniform2f(resolution, canvas.width, canvas.height);
    gl.uniform2f(pointer, pointerState.x, pointerState.y);
    gl.uniform1f(time, now * 0.001);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(render);
  };

  requestAnimationFrame(render);
}

initMicaCanvas();
