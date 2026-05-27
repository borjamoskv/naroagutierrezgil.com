/**
 * EXERGIA-Ω // CONTROLS & EXTENDED ANALYSIS MODULE
 * Reality: C5-REAL
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
        // Ignore if user is typing in an input
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

    let waveformData = null;      // Pre-computed peaks array
    let waveformDuration = 0;     // Total duration in seconds
    let waveformStartTime = 0;    // AudioContext currentTime at start

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
        const dpr = window.devicePixelRatio || 1;

        ctx.clearRect(0, 0, w, h);

        if (!peaks || peaks.length === 0) return;

        const barWidth = w / peaks.length;
        const midY = h / 2;

        for (let i = 0; i < peaks.length; i++) {
            const barPct = i / peaks.length;
            const amplitude = peaks[i] * midY * 0.9;
            const x = i * barWidth;

            // Color: played = Cyber Cyan, unplayed = YInMn Blue dimmed
            if (barPct <= playbackPct) {
                ctx.fillStyle = 'rgba(0, 255, 255, 0.7)';
            } else {
                ctx.fillStyle = 'rgba(43, 59, 229, 0.35)';
            }

            // Draw symmetric bar
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
            // First call original
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

                // === WAVEFORM TIMELINE INTEGRATION ===
                waveformDuration = decodedBuffer.duration;
                waveformStartTime = ctx.currentTime;

                if (waveformCanvas && waveformContainer) {
                    waveformContainer.style.display = 'block';

                    // Resize canvas for HiDPI
                    const rect = waveformCanvas.getBoundingClientRect();
                    const dpr = window.devicePixelRatio || 1;
                    waveformCanvas.width = rect.width * dpr;
                    waveformCanvas.height = rect.height * dpr;

                    // Compute peaks
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

            // Re-create source at new position
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
    // 4. LUFS METERING (Approximation via RMS windowing)
    // ═══════════════════════════════════════════════
    // True LUFS requires K-weighting + gated window.
    // This provides an RMS-LUFS approximation using a 400ms sliding window.
    const LUFS_WINDOW_SIZE = 400; // ms
    const lufsHistory = [];
    let smoothedLufs = -Infinity;

    function computeApproxLUFS() {
        if (typeof engine === 'undefined' || !engine.initialized || !engine.isPlaying) {
            return -Infinity;
        }

        const bufferLength = 512;
        const dataL = new Float32Array(bufferLength);
        const dataR = new Float32Array(bufferLength);
        engine.outAnalL.getFloatTimeDomainData(dataL);
        engine.outAnalR.getFloatTimeDomainData(dataR);

        // Simple power sum (mono-downmix approximation)
        let sumSq = 0;
        for (let i = 0; i < bufferLength; i++) {
            const mono = (dataL[i] + dataR[i]) * 0.5;
            sumSq += mono * mono;
        }
        const rms = Math.sqrt(sumSq / bufferLength);
        const lufsInstant = 20 * Math.log10(Math.max(rms, 1e-10)) - 0.691;

        // Push to sliding window
        lufsHistory.push(lufsInstant);
        const sampleRate = engine.ctx.sampleRate || 48000;
        const framesPerWindow = Math.ceil((LUFS_WINDOW_SIZE / 1000) * (sampleRate / bufferLength));
        while (lufsHistory.length > framesPerWindow) lufsHistory.shift();

        // Integrated average
        let sum = 0;
        let count = 0;
        for (let i = 0; i < lufsHistory.length; i++) {
            if (lufsHistory[i] > -70) { // Gate at -70 LUFS
                sum += Math.pow(10, lufsHistory[i] / 10);
                count++;
            }
        }
        if (count > 0) {
            return 10 * Math.log10(sum / count);
        }
        return -Infinity;
    }

    // ═══════════════════════════════════════════════
    // 5. SPECTRAL TILT ANALYZER
    // ═══════════════════════════════════════════════
    function computeSpectralTilt() {
        if (typeof engine === 'undefined' || !engine.initialized || !engine.isPlaying) {
            return 0; // balanced
        }

        const binCount = engine.outAnalL.frequencyBinCount;
        const freqDataL = new Uint8Array(binCount);
        const freqDataR = new Uint8Array(binCount);
        engine.outAnalL.getByteFrequencyData(freqDataL);
        engine.outAnalR.getByteFrequencyData(freqDataR);

        // Split into low (0-25%) and high (75-100%) bins
        const q1 = Math.floor(binCount * 0.25);
        const q3 = Math.floor(binCount * 0.75);

        let lowSum = 0, highSum = 0;
        for (let i = 0; i < q1; i++) {
            lowSum += (freqDataL[i] + freqDataR[i]) * 0.5;
        }
        for (let i = q3; i < binCount; i++) {
            highSum += (freqDataL[i] + freqDataR[i]) * 0.5;
        }

        const lowAvg = lowSum / q1;
        const highAvg = highSum / (binCount - q3);

        // Positive = bright, Negative = dark
        return (highAvg - lowAvg) / 255.0;
    }

    // ═══════════════════════════════════════════════
    // 6. EXTENDED ANALYSIS RENDER LOOP
    // ═══════════════════════════════════════════════
    let prevSpectralTilt = 0;

    function extendedRenderLoop() {
        requestAnimationFrame(extendedRenderLoop);

        // --- Waveform Timeline ---
        if (waveformCanvas && waveformData && typeof engine !== 'undefined' && engine.isPlaying) {
            const ctxW = waveformCanvas.getContext('2d');
            const elapsed = engine.ctx.currentTime - waveformStartTime;
            const pct = Math.min(1.0, elapsed / waveformDuration);

            drawWaveform(ctxW, waveformCanvas, waveformData, pct);

            // Update playhead position
            if (waveformPlayhead) {
                waveformPlayhead.style.left = `${pct * 100}%`;
            }

            // Update time display
            if (waveformTime) {
                waveformTime.innerText = `${formatTime(elapsed)} / ${formatTime(waveformDuration)}`;
            }
        }

        // --- LUFS Metering ---
        const lufsBarFill = document.getElementById('lufs-bar-fill');
        const lufsValue = document.getElementById('lufs-value');

        if (lufsBarFill || lufsValue) {
            const lufs = computeApproxLUFS();

            // Smooth
            if (lufs > -70) {
                smoothedLufs = smoothedLufs === -Infinity ? lufs : smoothedLufs * 0.85 + lufs * 0.15;
            } else if (typeof engine !== 'undefined' && !engine.isPlaying) {
                smoothedLufs = -Infinity;
            }

            if (lufsValue) {
                if (smoothedLufs > -70) {
                    lufsValue.innerText = `${smoothedLufs.toFixed(1)}`;
                    // Color coding
                    if (smoothedLufs >= -9) {
                        lufsValue.style.color = '#E52B50'; // Too loud
                    } else if (smoothedLufs >= -14) {
                        lufsValue.style.color = '#FF9F1C'; // Amber warning
                    } else {
                        lufsValue.style.color = '#00FF66'; // Safe green
                    }
                } else {
                    lufsValue.innerText = '-inf';
                    lufsValue.style.color = 'var(--color-text-muted)';
                }
            }

            if (lufsBarFill) {
                // Map [-36, 0] to [0%, 100%]
                const fillPct = smoothedLufs > -36 ? Math.min(100, ((smoothedLufs + 36) / 36) * 100) : 0;
                lufsBarFill.style.width = `${fillPct}%`;
            }
        }

        // --- Spectral Tilt ---
        const tiltEl = document.getElementById('spectral-tilt');
        if (tiltEl) {
            const tilt = computeSpectralTilt();
            prevSpectralTilt = prevSpectralTilt * 0.9 + tilt * 0.1;

            const angle = Math.max(-25, Math.min(25, prevSpectralTilt * 120));
            tiltEl.style.transform = `rotate(${angle}deg)`;

            tiltEl.classList.remove('tilt-bright', 'tilt-dark', 'tilt-balanced');
            if (prevSpectralTilt > 0.05) {
                tiltEl.classList.add('tilt-bright');
                tiltEl.title = 'Spectral Tilt: BRIGHT';
            } else if (prevSpectralTilt < -0.05) {
                tiltEl.classList.add('tilt-dark');
                tiltEl.title = 'Spectral Tilt: DARK';
            } else {
                tiltEl.classList.add('tilt-balanced');
                tiltEl.title = 'Spectral Tilt: BALANCED';
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
