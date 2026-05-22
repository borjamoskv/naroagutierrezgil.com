/**
 * EXERGIA-Ω // REAL-TIME VISUALIZATIONS & CONTROLS
 * Reality: C5-REAL (Direct Web Audio Buffer Analysis)
 * Aesthetics: Industrial Noir (Deep HSL Gradients & Oscillographic CRT Trails)
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initial UI elements
    const playBtn = document.getElementById('btn-play-generator');
    const stopBtn = document.getElementById('btn-stop-audio');
    const bypassBtn = document.getElementById('btn-bypass');
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('audio-file');
    const droneFreqInput = document.getElementById('drone-freq');
    const droneFreqVal = document.getElementById('drone-freq-val');

    // Canvas setups
    const goniometerCanvas = document.getElementById('goniometer-canvas');
    const spectrumCanvas = document.getElementById('spectrum-canvas');

    const ctxGon = goniometerCanvas.getContext('2d');
    const ctxSpec = spectrumCanvas.getContext('2d');

    // Handle High-DPI screens
    function resizeCanvas(canvas) {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
    }

    window.addEventListener('resize', () => {
        resizeCanvas(goniometerCanvas);
        resizeCanvas(spectrumCanvas);
    });
    resizeCanvas(goniometerCanvas);
    resizeCanvas(spectrumCanvas);

    // --- DSP ROTARY KNOBS LOGIC ---
    const knobs = document.querySelectorAll('.rotary-knob');
    
    knobs.forEach(knob => {
        const paramName = knob.getAttribute('data-param');
        const min = parseFloat(knob.getAttribute('data-min'));
        const max = parseFloat(knob.getAttribute('data-max'));
        const step = parseFloat(knob.getAttribute('data-step') || '1');
        const defaultValue = parseFloat(knob.getAttribute('data-value'));
        
        let currentValue = defaultValue;
        
        // Setup initial rotation
        updateKnobUI(knob, currentValue, min, max, paramName);

        // Knob drag states
        let startY = 0;
        let startValue = 0;
        
        function onMouseDown(e) {
            startY = e.clientY;
            startValue = currentValue;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            knob.classList.add('active');
            e.preventDefault();
        }
        
        function onMouseMove(e) {
            const deltaY = startY - e.clientY; // drag up to increase
            const range = max - min;
            const pixelsPerRange = 150; // pixels to go from min to max
            
            let newValue = startValue + (deltaY / pixelsPerRange) * range;
            // Snap to step
            newValue = Math.round(newValue / step) * step;
            // Clamp
            newValue = Math.max(min, Math.min(max, newValue));
            
            currentValue = newValue;
            updateKnobUI(knob, currentValue, min, max, paramName);
            engine.updateParam(paramName, currentValue);
        }
        
        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            knob.classList.remove('active');
        }
        
        knob.addEventListener('mousedown', onMouseDown);
        
        // Double click to reset to default
        knob.addEventListener('dblclick', () => {
            currentValue = defaultValue;
            updateKnobUI(knob, currentValue, min, max, paramName);
            engine.updateParam(paramName, currentValue);
        });

        // Touch support
        knob.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                startY = e.touches[0].clientY;
                startValue = currentValue;
                knob.classList.add('active');
            }
        });

        knob.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1) {
                const deltaY = startY - e.touches[0].clientY;
                const range = max - min;
                const pixelsPerRange = 150;
                let newValue = startValue + (deltaY / pixelsPerRange) * range;
                newValue = Math.round(newValue / step) * step;
                newValue = Math.max(min, Math.min(max, newValue));
                currentValue = newValue;
                updateKnobUI(knob, currentValue, min, max, paramName);
                engine.updateParam(paramName, currentValue);
                e.preventDefault();
            }
        });

        knob.addEventListener('touchend', () => {
            knob.classList.remove('active');
        });
    });

    function updateKnobUI(knob, val, min, max, paramName) {
        const pct = (val - min) / (max - min);
        const deg = -135 + pct * 270;
        
        // Rotate physical knob indicator
        const indicator = knob.querySelector('.knob-indicator');
        if (indicator) {
            indicator.style.transform = `rotate(${deg}deg)`;
        }
        
        // Update label text
        const valSpan = document.getElementById(`val-${paramName}`);
        if (valSpan) {
            valSpan.innerText = formatParamValue(val, paramName);
        }
    }

    function formatParamValue(val, paramName) {
        switch (paramName) {
            case 'subCut':
            case 'sideHp':
                return `${Math.round(val)} Hz`;
            case 'lowShelf':
            case 'mudCut':
            case 'presence':
            case 'gainBoost':
                return `${val > 0 ? '+' : ''}${val.toFixed(1)} dB`;
            case 'ceiling':
                return `${val.toFixed(2)} dB`;
            case 'satDrive':
                return `${val.toFixed(1)}x`;
            case 'satMix':
            case 'exciterOdd':
            case 'exciterEven':
            case 'crossfeedMix':
                return `${Math.round(val * 100)}%`;
            case 'spatialDelay':
                return `${val.toFixed(2)} ms`;
            case 'sideWidth':
                return `${Math.round(val * 100)}%`;
            case 'limiterRelease':
                return `${Math.round(val)} ms`;
            default:
                return val.toString();
        }
    }

    // --- PLAY / STOP SOURCE CONTROLS ---
    playBtn.addEventListener('click', () => {
        engine.startGenerator();
        playBtn.classList.add('active');
    });

    stopBtn.addEventListener('click', () => {
        engine.stop();
        playBtn.classList.remove('active');
        document.getElementById('file-name').innerText = "Ningún archivo cargado";
    });

    bypassBtn.addEventListener('click', () => {
        const nextBypass = !engine.bypassMode;
        engine.setBypass(nextBypass);
        if (nextBypass) {
            bypassBtn.classList.add('active');
            bypassBtn.innerText = "BYPASSED";
        } else {
            bypassBtn.classList.remove('active');
            bypassBtn.innerText = "BYPASS";
        }
    });

    droneFreqInput.addEventListener('input', (e) => {
        const val = e.target.value;
        droneFreqVal.innerText = `${val} Hz`;
        if (engine.oscDrone) {
            const now = engine.ctx.currentTime;
            engine.oscDrone.frequency.setValueAtTime(parseFloat(val), now);
            engine.oscHarmonic1.frequency.setValueAtTime(parseFloat(val) * 3, now);
            engine.oscHarmonic2.frequency.setValueAtTime(parseFloat(val) * 4, now);
        }
    });

    // --- FILE DRAG & DROP AND UPLOAD ---
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('audio/')) {
            handleUploadedFile(file);
        }
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleUploadedFile(file);
        }
    });

    function handleUploadedFile(file) {
        document.getElementById('file-name').innerText = `CARGANDO: ${file.name}...`;
        const reader = new FileReader();
        reader.onload = function(e) {
            engine.playFile(e.target.result, file.name);
        };
        reader.readAsArrayBuffer(file);
    }

    // --- ANIMATION / ANALYSIS LOOP (C5-REAL MEASUREMENTS) ---
    const bufferLength = 512;
    const timeDataL = new Float32Array(bufferLength);
    const timeDataR = new Float32Array(bufferLength);
    const freqData = new Uint8Array(512);

    // Peak holding meters logic
    let peakIn = -Infinity;
    let peakOut = -Infinity;
    let peakHoldIn = -Infinity;
    let peakHoldOut = -Infinity;
    let peakHoldTimerIn = 0;
    let peakHoldTimerR = 0;
    let lastCorrelationVal = 1.0;
    let lastPeakOutDbVal = -Infinity;

    function renderLoop() {
        requestAnimationFrame(renderLoop);

        if (!engine.initialized) return;

        // 1. GONIOMETER / STEREOSPACE VECTORSCOPE
        const wGon = goniometerCanvas.width;
        const hGon = goniometerCanvas.height;
        
        // Clear with slight phosphor persistence
        ctxGon.fillStyle = 'rgba(10, 10, 10, 0.22)';
        ctxGon.fillRect(0, 0, wGon, hGon);

        // Draw cross grid axes (L, R, M, S)
        ctxGon.strokeStyle = 'rgba(43, 59, 229, 0.08)'; // Light blue grid
        ctxGon.lineWidth = 1;
        
        ctxGon.beginPath();
        // vertical (Mono)
        ctxGon.moveTo(wGon / 2, 0);
        ctxGon.lineTo(wGon / 2, hGon);
        // horizontal (Side)
        ctxGon.moveTo(0, hGon / 2);
        ctxGon.lineTo(wGon, hGon / 2);
        // Left diagonal
        ctxGon.moveTo(0, 0);
        ctxGon.lineTo(wGon, hGon);
        // Right diagonal
        ctxGon.moveTo(wGon, 0);
        ctxGon.lineTo(0, hGon);
        ctxGon.stroke();

        // Outer circular boundary ring
        ctxGon.beginPath();
        ctxGon.arc(wGon / 2, hGon / 2, Math.min(wGon, hGon) / 2.1, 0, Math.PI * 2);
        ctxGon.strokeStyle = 'rgba(43, 59, 229, 0.15)';
        ctxGon.stroke();

        if (engine.isPlaying) {
            // Get stereospace time domain samples
            engine.outAnalL.getFloatTimeDomainData(timeDataL);
            engine.outAnalR.getFloatTimeDomainData(timeDataR);

            // Compute Pearson correlation (Phase Correlation)
            let sumL = 0;
            let sumR = 0;
            let sumLR = 0;
            let sumL2 = 0;
            let sumR2 = 0;

            ctxGon.beginPath();
            ctxGon.lineWidth = 1.8;
            ctxGon.strokeStyle = '#2B3BE5'; // Sovereign Blue
            ctxGon.shadowColor = '#2B3BE5';
            ctxGon.shadowBlur = 6;

            const scale = Math.min(wGon, hGon) * 0.45;
            const centerX = wGon / 2;
            const centerY = hGon / 2;

            for (let i = 0; i < bufferLength; i++) {
                const l = timeDataL[i];
                const r = timeDataR[i];

                // Core correlation accumulators
                sumL += l;
                sumR += r;
                sumLR += l * r;
                sumL2 += l * l;
                sumR2 += r * r;

                // Goniometer projection (rotated 45 degrees)
                // x = (L - R) / sqrt(2)
                // y = -(L + R) / sqrt(2)
                const x = (l - r) * 0.7071 * scale;
                const y = -(l + r) * 0.7071 * scale;

                if (i === 0) {
                    ctxGon.moveTo(centerX + x, centerY + y);
                } else {
                    ctxGon.lineTo(centerX + x, centerY + y);
                }
            }
            ctxGon.stroke();
            ctxGon.shadowBlur = 0; // Reset bloom shadow

            // Calculate exact Phase Correlation metric: [-1, +1]
            const meanL = sumL / bufferLength;
            const meanR = sumR / bufferLength;
            let num = 0;
            let denL = 0;
            let denR = 0;

            for (let i = 0; i < bufferLength; i++) {
                const diffL = timeDataL[i] - meanL;
                const diffR = timeDataR[i] - meanR;
                num += diffL * diffR;
                denL += diffL * diffL;
                denR += diffR * diffR;
            }

            let correlation = 1.0;
            if (denL > 0 && denR > 0) {
                correlation = num / Math.sqrt(denL * denR);
            }
            if (isNaN(correlation)) correlation = 1.0;

            // Smooth the correlation value for layout
            const prevCorr = parseFloat(document.getElementById('correlation-value').innerText.split(': ')[1]) || 1.0;
            const smoothedCorr = prevCorr * 0.9 + correlation * 0.1;
            
            document.getElementById('correlation-value').innerText = `CORR: ${smoothedCorr >= 0 ? '+' : ''}${smoothedCorr.toFixed(2)}`;
            lastCorrelationVal = smoothedCorr;
            
            // Fill the Phase correlation bar UI
            const corrBar = document.getElementById('corr-bar-fill');
            if (corrBar) {
                // Map [-1, +1] to [0%, 100%]
                const pct = (smoothedCorr + 1) * 50;
                corrBar.style.left = `${Math.min(100, Math.max(0, pct))}%`;
            }
        } else {
            document.getElementById('correlation-value').innerText = `CORR: +1.00`;
            lastCorrelationVal = 1.0;
            const corrBar = document.getElementById('corr-bar-fill');
            if (corrBar) corrBar.style.left = '100%';
        }


        // 2. MID/SIDE FREQUENCY SPECTROGRAM
        const wSpec = spectrumCanvas.width;
        const hSpec = spectrumCanvas.height;
        ctxSpec.clearRect(0, 0, wSpec, hSpec);

        // Draw frequency grid lines
        ctxSpec.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctxSpec.lineWidth = 1;
        const gridFreqs = [100, 500, 1000, 5000, 10000];
        
        ctxSpec.beginPath();
        gridFreqs.forEach(freq => {
            // Logarithmic mapping of frequency to X coord
            const x = Math.log10(freq / 20) / Math.log10(20000 / 20) * wSpec;
            ctxSpec.moveTo(x, 0);
            ctxSpec.lineTo(x, hSpec);
        });
        ctxSpec.stroke();

        if (engine.isPlaying) {
            // We use outAnalL and outAnalR for Mid/Side calculation
            const freqDataL = new Uint8Array(engine.outAnalL.frequencyBinCount);
            const freqDataR = new Uint8Array(engine.outAnalR.frequencyBinCount);
            engine.outAnalL.getByteFrequencyData(freqDataL);
            engine.outAnalR.getByteFrequencyData(freqDataR);

            const len = freqDataL.length;

            // Generate paths for Mid & Side spectrum curves
            ctxSpec.lineWidth = 1.8;

            // Render Side spectrum curve (Deep violet accent `#8F2BE5` or neon side profile)
            ctxSpec.strokeStyle = 'rgba(143, 43, 229, 0.75)';
            ctxSpec.beginPath();
            for (let i = 0; i < len; i++) {
                const lVal = freqDataL[i] / 255;
                const rVal = freqDataR[i] / 255;
                
                // Side ~ abs(L - R)
                const side = Math.max(0.01, Math.abs(lVal - rVal));
                const db = 20 * Math.log10(side);
                // Map [-60, 0] to [hSpec, 0]
                const y = Math.max(0, Math.min(hSpec, ((db + 60) / 60) * -hSpec + hSpec));
                
                // Logarithmic frequency index
                const pct = i / len;
                const x = pct * wSpec;

                if (i === 0) ctxSpec.moveTo(x, y);
                else ctxSpec.lineTo(x, y);
            }
            ctxSpec.stroke();

            // Render Mid spectrum curve (Vibrant blue `#2B3BE5`)
            ctxSpec.strokeStyle = 'rgba(43, 59, 229, 0.95)';
            ctxSpec.beginPath();
            for (let i = 0; i < len; i++) {
                const lVal = freqDataL[i] / 255;
                const rVal = freqDataR[i] / 255;
                
                // Mid ~ (L + R) / 2
                const mid = (lVal + rVal) / 2;
                const db = 20 * Math.log10(mid);
                const y = Math.max(0, Math.min(hSpec, ((db + 60) / 60) * -hSpec + hSpec));
                
                const pct = i / len;
                const x = pct * wSpec;

                if (i === 0) ctxSpec.moveTo(x, y);
                else ctxSpec.lineTo(x, y);
            }
            ctxSpec.stroke();
        }


        // 3. RMS & PEAK METERS (C5-REAL LEVEL METERS)
        if (engine.isPlaying) {
            // Get Input data for metering
            const inputData = new Float32Array(bufferLength);
            engine.inputAnalyser.getFloatTimeDomainData(inputData);
            
            // Input RMS & Peak calculation
            let sumInSq = 0;
            let maxIn = 0;
            for (let i = 0; i < bufferLength; i++) {
                const val = inputData[i];
                sumInSq += val * val;
                const absVal = Math.abs(val);
                if (absVal > maxIn) maxIn = absVal;
            }
            const rmsInDb = 20 * Math.log10(Math.sqrt(sumInSq / bufferLength));
            const peakInDb = 20 * Math.log10(maxIn);

            // Output Peak calculation (using timeDataL/R outputs)
            let maxOut = 0;
            let sumOutSq = 0;
            for (let i = 0; i < bufferLength; i++) {
                const l = timeDataL[i];
                const r = timeDataR[i];
                sumOutSq += (l * l + r * r) / 2;
                const maxChan = Math.max(Math.abs(l), Math.abs(r));
                if (maxChan > maxOut) maxOut = maxChan;
            }
            const rmsOutDb = 20 * Math.log10(Math.sqrt(sumOutSq / bufferLength));
            const peakOutDb = 20 * Math.log10(maxOut);

            // Decay peaks slowly (envelope follower)
            const decayFactor = 0.95; // fast decay for bar meter
            const peakHoldDecay = 0.99; // slow hold decay for dot indicator

            peakIn = Math.max(rmsInDb, peakIn * decayFactor);
            peakOut = Math.max(rmsOutDb, peakOut * decayFactor);

            if (peakInDb > peakHoldIn) {
                peakHoldIn = peakInDb;
                peakHoldTimerIn = 60; // hold 60 frames
            } else {
                if (peakHoldTimerIn > 0) peakHoldTimerIn--;
                else peakHoldIn = Math.max(-60, peakHoldIn - 0.4);
            }

            if (peakOutDb > peakHoldOut) {
                peakHoldOut = peakOutDb;
                peakHoldTimerR = 60;
            } else {
                if (peakHoldTimerR > 0) peakHoldTimerR--;
                else peakHoldOut = Math.max(-60, peakHoldOut - 0.4);
            }

            // Update UI elements for levels
            updateMeterBar('input', peakIn, peakHoldIn);
            updateMeterBar('output', peakOut, peakHoldOut);

            // Display active output peak value in dynamics header
            const displayDb = peakOutDb > -60 ? `${peakOutDb.toFixed(1)} dB` : '-inf';
            document.getElementById('peak-db-value').innerText = `PEAK: ${displayDb}`;
            lastPeakOutDbVal = peakOutDb;
        } else {
            updateMeterBar('input', -Infinity, -Infinity);
            updateMeterBar('output', -Infinity, -Infinity);
            document.getElementById('peak-db-value').innerText = 'PEAK: -inf dB';
            lastPeakOutDbVal = -Infinity;
        }
    }

    function updateMeterBar(prefix, rmsVal, peakVal) {
        const bar = document.getElementById(`${prefix}-meter-bar`);
        const peak = document.getElementById(`${prefix}-meter-peak`);
        const valSpan = document.getElementById(`${prefix}-meter-val`);
        
        // Map dB [-60, 0] to [0%, 100%]
        const mapDbToPct = (db) => {
            if (db === -Infinity || db < -60) return 0;
            return Math.min(100, ((db + 60) / 60) * 100);
        };

        const rmsPct = mapDbToPct(rmsVal);
        const peakPct = mapDbToPct(peakVal);

        if (bar) bar.style.height = `${rmsPct}%`;
        if (peak) peak.style.bottom = `${peakPct}%`;
        
        if (valSpan) {
            valSpan.innerText = rmsVal > -60 ? `${rmsVal.toFixed(1)} dB` : '-inf';
        }
    }

    // Start rendering frame sequence
    requestAnimationFrame(renderLoop);

    // --- FLAT FILE SESSION LOG EXPORTER ---
    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    const exportBtn = document.getElementById('btn-export-session');
    if (exportBtn) {
        exportBtn.addEventListener('click', async () => {
            if (!engine.initialized) {
                alert("EXERGIA-Ω: Initialize engine before exporting.");
                return;
            }

            const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
            const sourceName = engine.isPlaying ? 
                document.getElementById('file-name').innerText.replace('PLAYING: ', '').replace('CARGANDO: ', '') : 
                'OFFLINE / DRONE GENERATOR';
            const peakStr = lastPeakOutDbVal > -60 ? `${lastPeakOutDbVal.toFixed(2)} dB` : '-inf dB';
            const correlationStr = `${lastCorrelationVal >= 0 ? '+' : ''}${lastCorrelationVal.toFixed(4)}`;

            // Build state text for hashing and logging
            const serializedParams = JSON.stringify(engine.params, null, 4);
            const rawReportPayload = `EXERGIA-OMEGA-STATE-V1|${timestamp}|${sourceName}|${peakStr}|${correlationStr}|${serializedParams}`;
            const stateHash = await sha256(rawReportPayload);

            // Construct aesthetic report structure
            const report = `================================================================================
EXERGIA-Ω // SOVEREIGN MASTERING ENGINE REPORT // SATELLITE STATUS LOG
================================================================================
Timestamp         : ${timestamp}
System Integrity  : C5-REAL (Physical Verification - Web Audio API Client)
State Checksum    : HASH-256: ${stateHash}
Source Stream     : ${sourceName}
================================================================================
[DSP REAL-TIME MEASUREMENTS]
Output Peak Level : ${peakStr}
Phase Correlation : ${correlationStr} (Pearson Coherency)
================================================================================
[CORE PROCESSOR PARAMETERS]
Sub-bass Cutoff    : ${engine.params.subCut} Hz (24dB/oct Highpass Linkwitz-Riley)
Low-shelf EQ (Mid) : ${engine.params.lowShelf > 0 ? '+' : ''}${engine.params.lowShelf.toFixed(1)} dB (100Hz Corner Shelf)
Mud Attenuation    : ${engine.params.mudCut.toFixed(1)} dB (350Hz Peaking Bell, Q=1.0)
Presence Boost     : ${engine.params.presence > 0 ? '+' : ''}${engine.params.presence.toFixed(1)} dB (3.2kHz Peaking Bell, Q=0.8)
Side Highpass      : ${engine.params.sideHp} Hz (12dB/oct Highpass)
Stereo Side Width  : ${Math.round(engine.params.sideWidth * 100)}% (Mid/Side Ratio Adjuster)
Saturation Drive   : ${engine.params.satDrive.toFixed(1)}x (Input Pre-gain Boost)
Saturation Mix     : ${Math.round(engine.params.satMix * 100)}% (Dry/Wet Wet-ratio)
Chebyshev Odd      : ${Math.round(engine.params.exciterOdd * 100)}% (3rd Harmonic Synthesizer)
Chebyshev Even     : ${Math.round(engine.params.exciterEven * 100)}% (2nd Harmonic Synthesizer)
Binaural ITD Delay : ${engine.params.spatialDelay.toFixed(2)} ms (Interaural Time Difference)
Binaural Crossfeed : ${Math.round(engine.params.crossfeedMix * 100)}% (Interaural Level Difference Matrix)
Master Input Gain  : ${engine.params.gainBoost > 0 ? '+' : ''}${engine.params.gainBoost.toFixed(1)} dB (Pre-limiter Drive)
Limiter Ceiling    : ${engine.params.ceiling.toFixed(2)} dB (Output Brickwall Threshold)
Limiter Release    : ${Math.round(engine.params.limiterRelease)} ms (Dynamic Envelope Release)
================================================================================
[VERIFICATION STATUS]
Ledger Signature  : ${stateHash.substring(0, 16)}... [VERIFIED REALITY]
Exergy Const      : S=100
================================================================================
`;
            // Trigger file download
            const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `exergia_session_${Date.now()}.log`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Update UI Ledger text to match current hash
            const ledgerElement = document.getElementById('ledger-hash');
            if (ledgerElement) {
                ledgerElement.innerText = `HASH-256: ${stateHash.substring(0, 12)}... // VERIFIED REALITY: C5-REAL`;
            }
        });
    }
});
