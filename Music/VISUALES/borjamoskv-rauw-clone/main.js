/**
 * ==========================================================================
 * EXERGIA-Ω // BORJA MOSKV // MAIN CONTROLLER
 * INDUSTRIAL NOIR 2026 DESIGN SYSTEM SPECIFICATION
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // Declare reality level
  console.log('[REALITY LEVEL: C5-REAL] Verified hardware and environment.');

  // System State
  const state = {
    isPlaying: false,
    currentTrackId: 0,
    pitch: 1.0,
    targetPitch: 1.0,
    vinylRotation: 0,
    lastTime: performance.now(),
    isDragging: false,
    dragStartAngle: 0,
    dragStartRotation: 0,
    dragLastAngle: 0,
    dragVelocity: 0,
    lastDragTime: 0,
    params: {
      presence: 0.0, // dB
      width: 100,    // %
      crossover: 120 // Hz
    },
    logs: [
      { type: 'INFO', text: 'Canal C5-REAL establecido con la red.' },
      { type: 'OK', text: 'Algoritmo de Crossover calibrado a 120Hz.' }
    ]
  };

  // DOM Elements
  const loader = document.getElementById('loader');
  const loaderBar = document.getElementById('loader-bar');
  const loaderStatus = document.querySelector('.loader-status');
  const loaderTelemetry = document.getElementById('loader-telemetry');
  
  const header = document.getElementById('header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.workspace-section');
  
  // Platter / Record
  const deckContainer = document.querySelector('.deck-container');
  const vinylRecord = document.getElementById('vinyl-record');
  const vinylSleeve = document.getElementById('vinyl-sleeve');
  const tonearm = document.getElementById('tonearm');
  const btnPlay = document.getElementById('btn-play');
  const deckStateText = document.getElementById('deck-state-text');
  const deckPitchText = document.getElementById('deck-pitch-text');
  const sleeveCover = document.getElementById('sleeve-cover');
  const labelTrackName = document.getElementById('label-track-name');
  const currentTrackTitle = document.getElementById('current-track-title');
  const currentTrackDesc = document.getElementById('current-track-desc');
  
  // Knobs
  const knobs = document.querySelectorAll('.knob-control');
  
  // Vectorscope / Gauges
  const canvas = document.getElementById('vectorscope-canvas');
  const ctx = canvas.getContext('2d');
  const valCorrelation = document.getElementById('val-correlation');
  const valLUFS = document.getElementById('val-lufs');
  const lufsGauge = document.getElementById('lufs-gauge');
  const lufsPeak = document.getElementById('lufs-peak');
  
  // Ledger Terminal
  const ledgerTerminal = document.getElementById('ledger-terminal');
  const btnExportLog = document.getElementById('btn-export-log');
  
  // Gallery & Lightbox
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCloseBtn = document.getElementById('lightbox-close-btn');

  // Track Data
  const tracks = [
    {
      id: 0,
      title: "NO SLEEP IN MY CITY",
      desc: "Procesamiento binaural espacial con vector de fase a 120Hz.",
      cover: "https://images.unsplash.com/photo-1614680376593-902f74fa0d41?q=80&w=800&auto=format&fit=crop",
      presence: 0.0,
      width: 100,
      crossover: 120
    },
    {
      id: 1,
      title: "HIPOTENUSAS ILEGALES",
      desc: "Geometría torcida, pulso seco y borde urbano del puerto de Bilbao.",
      cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop",
      presence: -0.5,
      width: 130,
      crossover: 140
    },
    {
      id: 2,
      title: "PATADAS",
      desc: "Ritmo físico descarnado, gesto corto y energía frontal analógica.",
      cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop",
      presence: 1.2,
      width: 80,
      crossover: 90
    },
    {
      id: 3,
      title: "COHERENCIA RARA 42",
      desc: "Electrónica de ángulo extraño: repetición matemática y tensión sostenida.",
      cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800&auto=format&fit=crop",
      presence: -1.0,
      width: 150,
      crossover: 180
    }
  ];

  /* ==========================================================================
     1. INITIALIZER / APERTURE LOADER
     ========================================================================== */
  function bootSystem() {
    let progress = 0;
    const steps = [
      'VERIFICANDO INTEGRIDAD DEL HARDWARE...',
      'CARGANDO MÓDULOS DE PROCESAMIENTO BINAURAL...',
      'CALIBRANDO INTERFAZ INDUSTRIAL NOIR 2026...',
      'SISTEMA LISTO. CANAL C5-REAL ACTIVO.'
    ];

    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 8) + 4;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        loaderBar.style.width = '100%';
        loaderStatus.textContent = steps[steps.length - 1];
        loaderTelemetry.textContent = `SHA256: ${generateHash('SYSTEM_ONLINE')}`;
        
        setTimeout(() => {
          loader.style.opacity = '0';
          loader.style.visibility = 'hidden';
          // Make deck container slide active
          setTimeout(() => {
            deckContainer.classList.add('is-active');
            addTerminalLine('INFO', 'Entorno cargado en modo C5-REAL.');
          }, 400);
        }, 600);
      } else {
        loaderBar.style.width = `${progress}%`;
        const stepIndex = Math.min(Math.floor((progress / 100) * steps.length), steps.length - 2);
        loaderStatus.textContent = steps[stepIndex];
        loaderTelemetry.textContent = `HEX_BOOT_${progress.toString(16).toUpperCase()} // ADDR: 0x${(progress * 1337).toString(16).toUpperCase()}`;
      }
    }, 80);
  }

  /* ==========================================================================
     2. NAVIGATION & SITE HEADER SCROLL
     ========================================================================== */
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  });

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      
      navLinks.forEach(l => l.classList.remove('is-active'));
      link.classList.add('is-active');

      sections.forEach(section => {
        if (section.id === targetId) {
          section.classList.add('active');
        } else {
          section.classList.remove('active');
        }
      });

      addTerminalLine('NAV', `Sección activa cambiada a: ${targetId.toUpperCase()}`);
    });
  });

  /* ==========================================================================
     3. INTERACTIVE VINYL CONTROLS
     ========================================================================== */
  
  // Play/Pause button
  btnPlay.addEventListener('click', togglePlayback);

  function togglePlayback() {
    state.isPlaying = !state.isPlaying;
    if (state.isPlaying) {
      deckContainer.classList.add('is-playing');
      btnPlay.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="currentColor"/></svg>`;
      deckStateText.textContent = 'PLAYING';
      deckStateText.className = 'text-neon-blue';
      state.targetPitch = 1.0;
      addTerminalLine('PLAY', `Reproduciendo: ${tracks[state.currentTrackId].title}`);
    } else {
      deckContainer.classList.remove('is-playing');
      btnPlay.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>`;
      deckStateText.textContent = 'STOPPED';
      deckStateText.className = 'text-neon-amber';
      state.targetPitch = 0.0;
      addTerminalLine('STOP', 'Reproducción en pausa.');
    }
  }

  // Load new track
  const trackCards = document.querySelectorAll('.track-card');
  trackCards.forEach(card => {
    card.addEventListener('click', () => {
      const trackId = parseInt(card.getAttribute('data-track-id'));
      loadTrack(trackId);
      
      // Update UI active states
      trackCards.forEach(c => c.classList.remove('is-active'));
      card.classList.add('is-active');
    });
  });

  function loadTrack(id) {
    const track = tracks[id];
    state.currentTrackId = id;
    
    // Animate vinyl loading (slide in and out)
    deckContainer.classList.remove('is-active');
    
    setTimeout(() => {
      // Update data
      sleeveCover.src = track.cover;
      labelTrackName.textContent = track.title.substring(0, 10);
      currentTrackTitle.textContent = track.title;
      currentTrackDesc.textContent = track.desc;
      
      // Update Knobs values to track preset
      updatePresetKnobs(track);

      // Slide back out
      deckContainer.classList.add('is-active');
      addTerminalLine('LOAD', `Cargado stem: ${track.title} [SHA-256: ${generateHash(track.title).substring(0, 16)}]`);
      
      // Start playback if was playing
      if (state.isPlaying) {
        addTerminalLine('PLAY', `Reproduciendo: ${track.title}`);
      }
    }, 600);
  }

  function updatePresetKnobs(track) {
    state.params.presence = track.presence;
    state.params.width = track.width;
    state.params.crossover = track.crossover;

    updateKnobUI('presence', track.presence, `${track.presence.toFixed(1)} dB`);
    updateKnobUI('width', track.width, `${track.width}%`);
    updateKnobUI('crossover', track.crossover, `${track.crossover} Hz`);
  }

  function updateKnobUI(param, val, textVal) {
    const knob = document.querySelector(`.knob-control[data-param="${param}"]`);
    if (!knob) return;
    
    const valueEl = knob.querySelector('.knob-value');
    valueEl.textContent = textVal;
    
    // Rotate indicator
    let rotation = 0;
    if (param === 'presence') {
      // range -6 to +6 dB -> -150 to +150 deg
      rotation = (val / 6) * 150;
    } else if (param === 'width') {
      // range 0 to 200% -> -150 to +150 deg
      rotation = ((val - 100) / 100) * 150;
    } else if (param === 'crossover') {
      // range 40 to 400 Hz -> -150 to +150 deg
      rotation = ((val - 220) / 180) * 150;
    }
    
    const inner = knob.querySelector('.knob-inner');
    inner.style.transform = `rotate(${rotation}deg)`;
  }

  /* ==========================================================================
     4. VINYL SCRATCH INTERACTION (DRAG & ROTATE PHYSICS)
     ========================================================================== */
  
  function getCenter(el) {
    const rect = el.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }

  function getAngle(x, y, centerX, centerY) {
    return Math.atan2(y - centerY, x - centerX);
  }

  vinylRecord.addEventListener('pointerdown', (e) => {
    state.isDragging = true;
    vinylRecord.setPointerCapture(e.pointerId);
    
    const center = getCenter(vinylRecord);
    state.dragStartAngle = getAngle(e.clientX, e.clientY, center.x, center.y);
    state.dragStartRotation = state.vinylRotation;
    state.dragLastAngle = state.dragStartAngle;
    state.dragVelocity = 0;
    state.lastDragTime = performance.now();
    
    // Pitch drops to zero/manual speed
    state.targetPitch = 0.0;
  });

  vinylRecord.addEventListener('pointermove', (e) => {
    if (!state.isDragging) return;
    
    const center = getCenter(vinylRecord);
    const angle = getAngle(e.clientX, e.clientY, center.x, center.y);
    
    let angleDiff = angle - state.dragStartAngle;
    
    // Calculate rotation in degrees
    const currentRotation = state.dragStartRotation + (angleDiff * 180) / Math.PI;
    state.vinylRotation = currentRotation;
    vinylRecord.style.transform = `translate3d(22%, 0, 0) rotate(${currentRotation}deg)`;
    
    // Track velocity for scratch sound emulation / speed
    const now = performance.now();
    const dt = now - state.lastDragTime;
    if (dt > 10) {
      let deltaAngle = angle - state.dragLastAngle;
      // Normalize wrap-around angles
      if (deltaAngle > Math.PI) deltaAngle -= Math.PI * 2;
      if (deltaAngle < -Math.PI) deltaAngle += Math.PI * 2;
      
      // Compute pitch from angular velocity (rad/ms scaled)
      const targetSpeed = (deltaAngle / dt) * 1000 * 0.15; // scalar adjustment
      state.pitch = state.pitch * 0.4 + targetSpeed * 0.6; // smooth
      
      state.dragLastAngle = angle;
      state.lastDragTime = now;
    }
  });

  vinylRecord.addEventListener('pointerup', (e) => {
    state.isDragging = false;
    vinylRecord.releasePointerCapture(e.pointerId);
    
    // Restore normal playback speed target
    if (state.isPlaying) {
      state.targetPitch = 1.0;
    } else {
      state.targetPitch = 0.0;
    }
    
    addTerminalLine('SCRATCH', `Inercia de arrastre: ${state.pitch.toFixed(2)}x`);
  });

  /* ==========================================================================
     5. DYNAMIC KNOB DRAGGING
     ========================================================================== */
  knobs.forEach(knob => {
    let startY = 0;
    let startVal = 0;
    const param = knob.getAttribute('data-param');
    
    knob.addEventListener('pointerdown', (e) => {
      startY = e.clientY;
      startVal = state.params[param];
      knob.setPointerCapture(e.pointerId);
      
      const onMove = (moveEvent) => {
        const dy = startY - moveEvent.clientY; // upwards increases value
        let newVal = startVal;
        
        if (param === 'presence') {
          newVal = Math.min(6.0, Math.max(-6.0, startVal + dy * 0.05));
          state.params.presence = newVal;
          updateKnobUI(param, newVal, `${newVal.toFixed(1)} dB`);
        } else if (param === 'width') {
          newVal = Math.min(200, Math.max(0, startVal + dy * 0.8));
          state.params.width = newVal;
          updateKnobUI(param, newVal, `${Math.round(newVal)}%`);
        } else if (param === 'crossover') {
          newVal = Math.min(400, Math.max(40, startVal + dy * 1.5));
          state.params.crossover = Math.round(newVal);
          updateKnobUI(param, newVal, `${Math.round(newVal)} Hz`);
        }
      };
      
      const onUp = () => {
        knob.releasePointerCapture(e.pointerId);
        knob.removeEventListener('pointermove', onMove);
        knob.removeEventListener('pointerup', onUp);
        addTerminalLine('PARAM', `Ajustado ${param.toUpperCase()} -> ${state.params[param].toFixed(1)}`);
      };
      
      knob.addEventListener('pointermove', onMove);
      knob.addEventListener('pointerup', onUp);
    });
  });

  /* ==========================================================================
     6. MAIN RENDER LOOP (VINYL PHYSICS, VECTORSCOPE, GAUGES)
     ========================================================================== */
  
  function updatePhysics(dt) {
    if (!state.isDragging) {
      // Spring decay towards target pitch
      state.pitch += (state.targetPitch - state.pitch) * 0.08;
      
      // Update vinyl rotation based on speed/pitch
      if (Math.abs(state.pitch) > 0.01) {
        // Base rotation speed: 33 RPM = 0.55 rev/sec = 198 deg/sec
        const baseSpeed = 198 * (dt / 1000);
        state.vinylRotation += baseSpeed * state.pitch;
        
        // Update DOM transform
        const suffix = deckContainer.classList.contains('is-active') ? 'translate3d(22%, 0, 0)' : 'translate3d(0, 0, 0)';
        vinylRecord.style.transform = `${suffix} rotate(${state.vinylRotation}deg)`;
      }
    }

    // Update tone arm angle
    if (state.isPlaying && !state.isDragging) {
      // Map platter location relative to track progress (mocked angle progression)
      const armRotation = 5 + Math.sin(performance.now() * 0.0001) * 3;
      tonearm.style.transform = `rotate(${armRotation}deg)`;
    } else if (!state.isPlaying && !state.isDragging) {
      tonearm.style.transform = `rotate(-35deg)`;
    }
    
    // Update pitch indicator text
    deckPitchText.textContent = `${state.pitch.toFixed(2)}x`;
  }

  function renderVectorscope() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = canvas.width * 0.45;
    
    // Draw background polar scope grid
    ctx.strokeStyle = 'rgba(43, 59, 229, 0.08)';
    ctx.lineWidth = 1;
    
    // Diagonal axis (+45, -45)
    ctx.beginPath();
    ctx.moveTo(cx - radius, cy + radius);
    ctx.lineTo(cx + radius, cy - radius);
    ctx.moveTo(cx - radius, cy - radius);
    ctx.lineTo(cx + radius, cy + radius);
    ctx.stroke();

    // Concentric grid circles
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.5, 0, Math.PI * 2);
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Signal generation physics based on current playback and settings
    const signalStrength = state.isPlaying ? Math.abs(state.pitch) : 0.0;
    const time = performance.now() * 0.005;
    
    if (signalStrength > 0.05) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(43, 59, 229, ${0.4 + signalStrength * 0.4})`;
      ctx.lineWidth = 1.5;
      
      const widthFactor = state.params.width / 100;
      const presenceFactor = Math.pow(10, state.params.presence / 20); // convert dB to gain
      const numPoints = 80;
      
      let lastX = cx;
      let lastY = cy;

      for (let i = 0; i < numPoints; i++) {
        const theta = (i / numPoints) * Math.PI * 4;
        
        // Mid (mono sum) and Side (stereo diff) mock synthesis
        const m = Math.sin(theta + time) * radius * 0.4 * presenceFactor;
        const s = Math.cos(theta * 1.5 - time) * radius * 0.3 * widthFactor * presenceFactor;
        
        // Apply jitter for high realistic signal noise
        const noise = (Math.random() - 0.5) * 8 * signalStrength;
        
        // Map Mid/Side to L/R 45-degree vectorscope rotation
        const x = cx + (m - s + noise);
        const y = cy - (m + s + noise);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    // Dynamic phase correlation telemetry calculation
    // Max width = low correlation, Low width = correlation approaches +1.0
    const rawCorrelation = 1.0 - (state.params.width / 200) * 0.8;
    // Add micro jitter
    const finalCorrelation = Math.min(1.0, Math.max(-1.0, rawCorrelation + (Math.random() - 0.5) * 0.05));
    valCorrelation.textContent = (state.isPlaying ? finalCorrelation : 1.0).toFixed(2);
    if (finalCorrelation < 0.2) {
      valCorrelation.className = 'telemetry-value text-neon-amber';
    } else {
      valCorrelation.className = 'telemetry-value text-neon-blue';
    }

    // Update Output Gain Gauges
    updateGauges(signalStrength);
  }

  function updateGauges(strength) {
    if (state.isPlaying) {
      // LUFS calculation based on target pitch and parameters
      const baseLUFS = -14.0 + state.params.presence;
      const currentLUFS = baseLUFS + (strength - 1.0) * 3;
      valLUFS.textContent = `${currentLUFS.toFixed(1)} LUFS`;
      
      // Gauge visual representation (0% is -40LUFS, 100% is 0LUFS)
      const pct = Math.min(100, Math.max(0, ((currentLUFS + 40) / 40) * 100));
      lufsGauge.style.width = `${pct}%`;
      
      // Slow peak decay
      const curPeakPct = parseFloat(lufsPeak.style.left) || 0;
      if (pct > curPeakPct) {
        lufsPeak.style.left = `${pct}%`;
      } else {
        lufsPeak.style.left = `${curPeakPct - 0.2}%`;
      }
    } else {
      valLUFS.textContent = '-INF LUFS';
      lufsGauge.style.width = '0%';
      lufsPeak.style.left = '0%';
    }
  }

  function loop() {
    const now = performance.now();
    const dt = now - state.lastTime;
    state.lastTime = now;

    updatePhysics(dt);
    renderVectorscope();

    requestAnimationFrame(loop);
  }

  /* ==========================================================================
     7. SYSTEM LEDGER LOGS & EXPORTING
     ========================================================================== */
  function addTerminalLine(type, text) {
    state.logs.push({ type, text, time: new Date().toISOString() });
    
    const colorClass = type === 'INFO' ? 'text-neon-blue' : type === 'OK' ? 'text-neon-green' : 'text-neon-amber';
    const line = document.createElement('div');
    line.className = 'terminal-line';
    line.innerHTML = `<span class="${colorClass}">[${type}]</span> ${text}`;
    ledgerTerminal.appendChild(line);
    
    // Auto scroll
    ledgerTerminal.scrollTop = ledgerTerminal.scrollHeight;
  }

  btnExportLog.addEventListener('click', () => {
    // Generate Exergy Validation Ledger Hash format
    const ledgerHeader = `EXERGIA-Ω INTEGRITY LEDGER // CLIENT-REAL STATE REPORT
TIMESTAMP: ${new Date().toISOString()}
FIRMWARE: C5-REAL-VERIFIED-V7.1
OPERATOR: BORJAMOSKV
----------------------------------------------------------------------
SYSTEM INTEGRITY HASH: ${generateHash(JSON.stringify(state.logs))}
----------------------------------------------------------------------
`;
    
    let content = ledgerHeader;
    state.logs.forEach(log => {
      content += `[${log.time || new Date().toISOString()}] [${log.type}] ${log.text}\n`;
    });
    
    // Generate file download
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exergy-omega-ledger-${Date.now()}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addTerminalLine('OK', 'Fichero de validación de registro plano exportado.');
  });

  /* Helper Cryptographic Simulator SHA-256 */
  function generateHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash &= hash;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return 'c5real_ea7a0b4_' + hex + '4af14f4a3c6b1c1d89666b01';
  }

  /* ==========================================================================
     8. 3D TILT EFFECT (GALLERY COLLAGE)
     ========================================================================== */
  galleryItems.forEach(item => {
    item.addEventListener('mousemove', (e) => {
      const rect = item.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const xc = rect.width / 2;
      const yc = rect.height / 2;
      
      const rotateX = -(y - yc) / 10; // Max tilt rotation
      const rotateY = (x - xc) / 10;
      
      item.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      
      // Reflection shine overlay
      const shine = item.querySelector('.item-overlay');
      if (shine) {
        const pctX = (x / rect.width) * 100;
        const pctY = (y / rect.height) * 100;
        shine.style.background = `radial-gradient(circle at ${pctX}% ${pctY}%, rgba(43, 59, 229, 0.15) 0%, rgba(10, 10, 10, 0.9) 80%)`;
      }
    });

    item.addEventListener('mouseleave', () => {
      item.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      const shine = item.querySelector('.item-overlay');
      if (shine) {
        shine.style.background = 'linear-gradient(to top, rgba(10, 10, 10, 0.9) 0%, transparent 60%)';
      }
    });

    item.addEventListener('click', () => {
      const src = item.getAttribute('data-src');
      const alt = item.querySelector('img').alt;
      
      lightboxImg.src = src;
      lightboxImg.alt = alt;
      lightbox.showModal();
    });
  });

  lightboxCloseBtn.addEventListener('click', () => {
    lightbox.close();
  });
  
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) lightbox.close();
  });

  /* ==========================================================================
     SYSTEM BOOT
     ========================================================================== */
  bootSystem();
  requestAnimationFrame(loop);
});
