/**
 * EXERGIA-Ω // CONTROLS & EXTENDED ANALYSIS MODULE
 * Reality: C5-REAL
 * Performance: Zero-allocation render path, ring buffer LUFS, cached DOM refs
 * Features: Keyboard Shortcuts, Splash Init, Waveform Timeline,
 *           LUFS Integrated Metering, Spectral Tilt Analysis
 */

document.addEventListener('DOMContentLoaded', () => {

    // ═══════════════════════════════════════════════
    // 1. SPLASH INIT SCREEN — Auto-dismiss after engine ready
    // ═══════════════════════════════════════════════
    const splash = document.getElementById('splash-init');
    if (splash) {
        setTimeout(() => {
            splash.classList.add('hidden');
            setTimeout(() => splash.remove(), 1000);
        }, 2200);
    }

    // ═══════════════════════════════════════════════
    // 2. KEYBOARD SHORTCUTS
    // ═══════════════════════════════════════════════
    const shortcutsOverlay = document.getElementById('shortcuts-overlay');
    const shortcutsClose = document.getElementById('shortcuts-close');

    function toggleShortcuts() {
        if (!shortcutsOverlay) return;
        shortcutsOverlay.classList.toggle('visible');
    }

    if (shortcutsClose) {
        shortcutsClose.addEventListener('click', () => {
            shortcutsOverlay.classList.remove('visible');
        });
    }

    const shortcutsToggleBtn = document.getElementById('btn-show-shortcuts');
    if (shortcutsToggleBtn) {
        shortcutsToggleBtn.addEventListener('click', toggleShortcuts);
    }

    // Click outside to dismiss
    if (shortcutsOverlay) {
        shortcutsOverlay.addEventListener('click', (e) => {
            if (e.target === shortcutsOverlay) {
                shortcutsOverlay.classList.remove('visible');
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch (e.key) {
            case ' ':
                e.preventDefault();
                if (typeof engine !== 'undefined') {
                    if (engine.isPlaying) {
                        engine.stop();
                        const playBtn = document.getElementById('btn-play-generator');
                        if (playBtn) playBtn.classList.remove('active');
                        if (typeof addP0Log === 'function') addP0Log('SPACE: Playback Stopped', 'system');
                    } else {
                        engine.startGenerator();
                        const playBtn = document.getElementById('btn-play-generator');
                        if (playBtn) playBtn.classList.add('active');
                        if (typeof addP0Log === 'function') addP0Log('SPACE: Generator Started', 'system');
                    }
                }
                break;

            case 'b':
            case 'B':
                if (typeof engine !== 'undefined' && engine.initialized) {
                    const nextBypass = !engine.bypassMode;
                    engine.setBypass(nextBypass);
                    const bypassBtn = document.getElementById('btn-bypass');
                    if (bypassBtn) {
                        if (nextBypass) {
                            bypassBtn.classList.add('active');
                            bypassBtn.innerText = "BYPASSED";
                        } else {
                            bypassBtn.classList.remove('active');
                            bypassBtn.innerText = "BYPASS";
                        }
                    }
                    if (typeof addP0Log === 'function') addP0Log(`B: Bypass ${nextBypass ? 'ENGAGED' : 'DISENGAGED'}`, 'system');
                }
                break;

            case 'r':
            case 'R':
                const recBtn = document.getElementById('btn-record-performance');
                if (recBtn) recBtn.click();
                break;

            case 'e':
            case 'E':
                const expBtn = document.getElementById('btn-export-session');
                if (expBtn) expBtn.click();
                break;

            case '1': case '2': case '3': case '4': case '5': {
                const presetBtns = document.querySelectorAll('.btn-preset');
                const idx = parseInt(e.key) - 1;
                if (presetBtns[idx]) {
                    presetBtns[idx].click();
                    if (typeof addP0Log === 'function') {
                        addP0Log(`KEY[${e.key}]: Activated Vibe Preset "${presetBtns[idx].innerText}"`, 'system');
                    }
                }
                break;
            }

            case '?':
                toggleShortcuts();
                break;

            case 'a':
            case 'A':
                const abToggleBtn = document.getElementById('btn-ab');
                if (abToggleBtn) abToggleBtn.click();
                break;

            case 'Escape':
                if (shortcutsOverlay && shortcutsOverlay.classList.contains('visible')) {
                    shortcutsOverlay.classList.remove('visible');
                }
                break;
        }
    });

    // ═══════════════════════════════════════════════
    // 3. WAVEFORM TIMELINE RENDERER
    // ═══════════════════════════════════════════════
    const waveformCanvas = document.getElementById('waveform-canvas');
    const waveformContainer = document.getElementById('waveform-container');
    const waveformPlayhead = document.getElementById('waveform-playhead');
    const waveformTime = document.getElementById('waveform-time');

    // Cache the 2d context once — never call getContext per frame
    const ctxWaveform = waveformCanvas ? waveformCanvas.getContext('2d') : null;

    let waveformData = null;
    let waveformDuration = 0;
    let waveformStartTime = 0;

    function computeWaveformPeaks(audioBuffer, numBars) {
        const channelData = audioBuffer.getChannelData(0);
        const samplesPerBar = Math.floor(channelData.length / numBars);
        const peaks = new Float32Array(numBars);

        for (let i = 0; i < numBars; i++) {
            let max = 0;
            const start = i * samplesPerBar;
            const end = Math.min(start + samplesPerBar, channelData.length);
            for (let j = start; j < end; j++) {
                const abs = Math.abs(channelData[j]);
                if (abs > max) max = abs;
            }
            peaks[i] = max;
        }
        return peaks;
    }

    function drawWaveform(ctx, canvas, peaks, playbackPct) {
        const w = canvas.width;
        const h = canvas.height;

        ctx.clearRect(0, 0, w, h);

        if (!peaks || peaks.length === 0) return;

        const barWidth = w / peaks.length;
        const midY = h / 2;

        // Batch played bars
        const splitIdx = Math.ceil(playbackPct * peaks.length);

        ctx.fillStyle = 'rgba(0, 255, 255, 0.7)';
        for (let i = 0; i < splitIdx; i++) {
            const amplitude = peaks[i] * midY * 0.9;
            const x = i * barWidth;
            ctx.fillRect(x, midY - amplitude, Math.max(1, barWidth - 1), amplitude * 2);
        }

        ctx.fillStyle = 'rgba(43, 59, 229, 0.35)';
        for (let i = splitIdx; i < peaks.length; i++) {
            const amplitude = peaks[i] * midY * 0.9;
            const x = i * barWidth;
            ctx.fillRect(x, midY - amplitude, Math.max(1, barWidth - 1), amplitude * 2);
        }

        // Center line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, midY);
        ctx.lineTo(w, midY);
        ctx.stroke();
    }

    // Hook into engine.playFile to capture the buffer
    const _origPlayFile = typeof engine !== 'undefined' ? engine.playFile.bind(engine) : null;
    if (_origPlayFile && typeof engine !== 'undefined') {
        engine.playFile = function(arrayBuffer, name) {
            this.init();
            if (this.isPlaying) this.stop();

            this.ctx.decodeAudioData(arrayBuffer.slice(0), (decodedBuffer) => {
                this.buffer = decodedBuffer;
                const ctx = this.ctx;
                const now = ctx.currentTime;

                this.sourceNode = ctx.createBufferSource();
                this.sourceNode.buffer = this.buffer;
                this.sourceNode.connect(this.inputNode);
                this.sourceNode.start(now);
                this.isPlaying = true;
                document.getElementById('file-name').innerText = `PLAYING: ${name}`;

                waveformDuration = decodedBuffer.duration;
                waveformStartTime = ctx.currentTime;

                if (waveformCanvas && waveformContainer) {
                    waveformContainer.style.display = 'block';

                    const rect = waveformCanvas.getBoundingClientRect();
                    const dpr = window.devicePixelRatio || 1;
                    waveformCanvas.width = rect.width * dpr;
                    waveformCanvas.height = rect.height * dpr;

                    const numBars = Math.min(400, Math.floor(rect.width));
                    waveformData = computeWaveformPeaks(decodedBuffer, numBars);
                }

                this.sourceNode.onended = () => {
                    this.isPlaying = false;
                    document.getElementById('file-name').innerText = `FINISHED: ${name}`;
                    waveformData = null;
                    if (waveformContainer) waveformContainer.style.display = 'none';
                };
            }, (err) => {
                console.error("Error decoding audio data:", err);
                document.getElementById('file-name').innerText = "ERROR AL DECODIFICAR AUDIO";
            });
        };
    }

    // Click-to-seek on waveform
    if (waveformCanvas) {
        waveformCanvas.addEventListener('click', (e) => {
            if (!waveformData || !engine.isPlaying || !engine.buffer) return;
            const rect = waveformCanvas.getBoundingClientRect();
            const clickPct = (e.clientX - rect.left) / rect.width;
            const seekTime = clickPct * waveformDuration;

            try { engine.sourceNode.stop(); } catch(err) {}
            const ctx = engine.ctx;
            engine.sourceNode = ctx.createBufferSource();
            engine.sourceNode.buffer = engine.buffer;
            engine.sourceNode.connect(engine.inputNode);
            engine.sourceNode.start(0, seekTime);
            waveformStartTime = ctx.currentTime - seekTime;

            engine.sourceNode.onended = () => {
                engine.isPlaying = false;
                waveformData = null;
                if (waveformContainer) waveformContainer.style.display = 'none';
            };

            if (typeof addP0Log === 'function') {
                addP0Log(`Seeked to ${formatTime(seekTime)} / ${formatTime(waveformDuration)}`, 'system');
            }
        });
    }

    // ═══════════════════════════════════════════════
    // 4. LUFS METERING — Ring buffer, pre-allocated typed arrays
    // ═══════════════════════════════════════════════
    const LUFS_BUFFER_LENGTH = 512;
    const LUFS_RING_CAPACITY = 256;  // Max sliding window entries

    // Pre-allocate typed arrays ONCE (zero per-frame allocation)
    const _lufsDataL = new Float32Array(LUFS_BUFFER_LENGTH);
    const _lufsDataR = new Float32Array(LUFS_BUFFER_LENGTH);

    // Ring buffer for LUFS history (avoids Array.shift O(n) cost)
    const _lufsRing = new Float64Array(LUFS_RING_CAPACITY);
    let _lufsRingHead = 0;   // Write pointer
    let _lufsRingCount = 0;  // Current entries in ring
    let smoothedLufs = -Infinity;

    function computeApproxLUFS() {
        if (typeof engine === 'undefined' || !engine.initialized || !engine.isPlaying) {
            return -Infinity;
        }

        engine.outAnalL.getFloatTimeDomainData(_lufsDataL);
        engine.outAnalR.getFloatTimeDomainData(_lufsDataR);

        let sumSq = 0;
        for (let i = 0; i < LUFS_BUFFER_LENGTH; i++) {
            const mono = (_lufsDataL[i] + _lufsDataR[i]) * 0.5;
            sumSq += mono * mono;
        }
        const rms = Math.sqrt(sumSq / LUFS_BUFFER_LENGTH);
        const lufsInstant = 20 * Math.log10(Math.max(rms, 1e-10)) - 0.691;

        // Write into ring buffer (overwrite oldest when full)
        _lufsRing[_lufsRingHead] = lufsInstant;
        _lufsRingHead = (_lufsRingHead + 1) % LUFS_RING_CAPACITY;
        if (_lufsRingCount < LUFS_RING_CAPACITY) _lufsRingCount++;

        // Compute max window size based on sample rate
        const sampleRate = engine.ctx.sampleRate || 48000;
        const framesPerWindow = Math.min(
            _lufsRingCount,
            Math.ceil((400 / 1000) * (sampleRate / LUFS_BUFFER_LENGTH))
        );

        // Gated integration over ring buffer tail
        let sum = 0;
        let count = 0;
        for (let i = 0; i < framesPerWindow; i++) {
            const idx = (_lufsRingHead - 1 - i + LUFS_RING_CAPACITY) % LUFS_RING_CAPACITY;
            const val = _lufsRing[idx];
            if (val > -70) {
                sum += Math.pow(10, val / 10);
                count++;
            }
        }
        return count > 0 ? 10 * Math.log10(sum / count) : -Infinity;
    }

    // ═══════════════════════════════════════════════
    // 5. SPECTRAL TILT — Pre-allocated buffers
    // ═══════════════════════════════════════════════
    let _tiltFreqL = null;  // Lazily sized to match analyser bin count
    let _tiltFreqR = null;
    let _tiltBinCount = 0;

    function computeSpectralTilt() {
        if (typeof engine === 'undefined' || !engine.initialized || !engine.isPlaying) {
            return 0;
        }

        const binCount = engine.outAnalL.frequencyBinCount;

        // Lazy-allocate only when bin count changes (happens once)
        if (_tiltBinCount !== binCount) {
            _tiltFreqL = new Uint8Array(binCount);
            _tiltFreqR = new Uint8Array(binCount);
            _tiltBinCount = binCount;
        }

        engine.outAnalL.getByteFrequencyData(_tiltFreqL);
        engine.outAnalR.getByteFrequencyData(_tiltFreqR);

        const q1 = Math.floor(binCount * 0.25);
        const q3 = Math.floor(binCount * 0.75);

        let lowSum = 0, highSum = 0;
        for (let i = 0; i < q1; i++) {
            lowSum += (_tiltFreqL[i] + _tiltFreqR[i]);
        }
        for (let i = q3; i < binCount; i++) {
            highSum += (_tiltFreqL[i] + _tiltFreqR[i]);
        }

        const lowAvg = lowSum / (q1 * 2);
        const highAvg = highSum / ((binCount - q3) * 2);

        return (highAvg - lowAvg) / 255.0;
    }

    // ═══════════════════════════════════════════════
    // 6. EXTENDED ANALYSIS RENDER LOOP — Zero-alloc, cached DOM
    // ═══════════════════════════════════════════════

    // Cache all DOM refs once at init — never call getElementById per frame
    const _domLufsBarFill = document.getElementById('lufs-bar-fill');
    const _domLufsValue = document.getElementById('lufs-value');
    const _domSpectralTilt = document.getElementById('spectral-tilt');

    let prevSpectralTilt = 0;

    // Frame decimation: LUFS and tilt don't need 60fps, 15fps is sufficient
    let _extFrameCounter = 0;
    const LUFS_TILT_DECIMATION = 4;  // Run every 4th frame = ~15fps at 60fps

    // Last values for display throttling (avoid touching DOM if unchanged)
    let _lastLufsText = '-inf';
    let _lastLufsColor = '';
    let _lastLufsWidth = '0%';
    let _lastTiltClass = 'tilt-balanced';
    let _lastTiltAngle = '0';

    function extendedRenderLoop() {
        requestAnimationFrame(extendedRenderLoop);

        _extFrameCounter++;

        // --- Waveform Timeline (needs full framerate for smooth playhead) ---
        if (ctxWaveform && waveformData && typeof engine !== 'undefined' && engine.isPlaying) {
            const elapsed = engine.ctx.currentTime - waveformStartTime;
            const pct = Math.min(1.0, elapsed / waveformDuration);

            drawWaveform(ctxWaveform, waveformCanvas, waveformData, pct);

            if (waveformPlayhead) {
                waveformPlayhead.style.left = `${pct * 100}%`;
            }

            if (waveformTime) {
                const newText = `${formatTime(elapsed)} / ${formatTime(waveformDuration)}`;
                waveformTime.textContent = newText;
            }
        }

        // --- LUFS + Tilt: decimated to every 4th frame ---
        if (_extFrameCounter % LUFS_TILT_DECIMATION !== 0) return;

        // --- LUFS Metering ---
        if (_domLufsBarFill || _domLufsValue) {
            const lufs = computeApproxLUFS();

            if (lufs > -70) {
                smoothedLufs = smoothedLufs === -Infinity ? lufs : smoothedLufs * 0.85 + lufs * 0.15;
            } else if (typeof engine !== 'undefined' && !engine.isPlaying) {
                smoothedLufs = -Infinity;
            }

            if (_domLufsValue) {
                let newText, newColor;
                if (smoothedLufs > -70) {
                    newText = smoothedLufs.toFixed(1);
                    if (smoothedLufs >= -9) {
                        newColor = '#E52B50';
                    } else if (smoothedLufs >= -14) {
                        newColor = '#FF9F1C';
                    } else {
                        newColor = '#00FF66';
                    }
                } else {
                    newText = '-inf';
                    newColor = 'var(--color-text-muted)';
                }

                // Only touch DOM if value changed
                if (newText !== _lastLufsText) {
                    _domLufsValue.textContent = newText;
                    _lastLufsText = newText;
                }
                if (newColor !== _lastLufsColor) {
                    _domLufsValue.style.color = newColor;
                    _lastLufsColor = newColor;
                }
            }

            if (_domLufsBarFill) {
                const fillPct = smoothedLufs > -36 ? Math.min(100, ((smoothedLufs + 36) / 36) * 100) : 0;
                const newWidth = `${fillPct.toFixed(1)}%`;
                if (newWidth !== _lastLufsWidth) {
                    _domLufsBarFill.style.width = newWidth;
                    _lastLufsWidth = newWidth;
                }
            }
        }

        // --- Spectral Tilt ---
        if (_domSpectralTilt) {
            const tilt = computeSpectralTilt();
            prevSpectralTilt = prevSpectralTilt * 0.9 + tilt * 0.1;

            const angle = Math.max(-25, Math.min(25, prevSpectralTilt * 120));
            const angleStr = angle.toFixed(1);

            if (angleStr !== _lastTiltAngle) {
                _domSpectralTilt.style.transform = `rotate(${angleStr}deg)`;
                _lastTiltAngle = angleStr;
            }

            let newClass;
            if (prevSpectralTilt > 0.05) {
                newClass = 'tilt-bright';
            } else if (prevSpectralTilt < -0.05) {
                newClass = 'tilt-dark';
            } else {
                newClass = 'tilt-balanced';
            }

            if (newClass !== _lastTiltClass) {
                _domSpectralTilt.classList.remove(_lastTiltClass);
                _domSpectralTilt.classList.add(newClass);
                const titles = { 'tilt-bright': 'Spectral Tilt: BRIGHT', 'tilt-dark': 'Spectral Tilt: DARK', 'tilt-balanced': 'Spectral Tilt: BALANCED' };
                _domSpectralTilt.title = titles[newClass];
                _lastTiltClass = newClass;
            }
        }
    }

    requestAnimationFrame(extendedRenderLoop);

    // ═══════════════════════════════════════════════
    // UTILITY
    // ═══════════════════════════════════════════════
    function formatTime(seconds) {
        if (!isFinite(seconds) || seconds < 0) return '00:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
});
