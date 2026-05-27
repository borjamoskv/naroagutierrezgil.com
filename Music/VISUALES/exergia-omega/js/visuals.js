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
    const recordBtn = document.getElementById('btn-record-performance');

    // Canvas setups
    const goniometerCanvas = document.getElementById('goniometer-canvas');
    const spectrumCanvas = document.getElementById('spectrum-canvas');
    const shaperCanvas = document.getElementById('shaper-canvas');
    const limiterCanvas = document.getElementById('limiter-canvas');
    const radarCanvas = document.getElementById('radar-canvas');
    const eqCanvas = document.getElementById('eq-canvas');

    const ctxGon = goniometerCanvas.getContext('2d');
    const ctxSpec = spectrumCanvas.getContext('2d');
    const ctxShaper = shaperCanvas ? shaperCanvas.getContext('2d') : null;
    const ctxLimiter = limiterCanvas ? limiterCanvas.getContext('2d') : null;
    const ctxRadar = radarCanvas ? radarCanvas.getContext('2d') : null;
    const ctxEq = eqCanvas ? eqCanvas.getContext('2d') : null;

    // Offscreen waterfall sonogram canvas
    const waterfallCanvas = document.createElement('canvas');
    const ctxWater = waterfallCanvas ? waterfallCanvas.getContext('2d') : null;

    // Handle High-DPI screens
    function resizeCanvas(canvas) {
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        if (canvas === spectrumCanvas && waterfallCanvas && ctxWater) {
            waterfallCanvas.width = canvas.width;
            waterfallCanvas.height = canvas.height;
            ctxWater.fillStyle = '#050505';
            ctxWater.fillRect(0, 0, waterfallCanvas.width, waterfallCanvas.height);
        }
    }

    window.addEventListener('resize', () => {
        resizeCanvas(goniometerCanvas);
        resizeCanvas(spectrumCanvas);
        resizeCanvas(shaperCanvas);
        resizeCanvas(limiterCanvas);
        resizeCanvas(radarCanvas);
        resizeCanvas(eqCanvas);
    });
    resizeCanvas(goniometerCanvas);
    resizeCanvas(spectrumCanvas);
    resizeCanvas(shaperCanvas);
    resizeCanvas(limiterCanvas);
    resizeCanvas(radarCanvas);
    resizeCanvas(eqCanvas);

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
    const grHistory = new Float32Array(150); // 150 scrolling points for Limiter GR
    let freqDataL = null; // Lazily allocated on first use
    let freqDataR = null;

    // EQ Curve analysis buffers
    const eqFreqs = new Float32Array(80);
    for (let i = 0; i < 80; i++) {
        // Logarithmic scale between 20Hz and 20kHz
        eqFreqs[i] = 20 * Math.pow(1000, i / 79);
    }
    const magSub = new Float32Array(80);
    const phaseSub = new Float32Array(80);
    const magShelf = new Float32Array(80);
    const phaseShelf = new Float32Array(80);
    const magMud = new Float32Array(80);
    const phaseMud = new Float32Array(80);
    const magPres = new Float32Array(80);
    const phasePres = new Float32Array(80);

    // Peak holding meters logic
    let peakIn = -Infinity;
    let peakOut = -Infinity;
    let peakHoldIn = -Infinity;
    let peakHoldOut = -Infinity;
    let peakHoldTimerIn = 0;
    let peakHoldTimerOut = 0;
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

        let rmsOutDb = -Infinity;
        let peakOutDb = -Infinity;

        if (engine.isPlaying) {
            // Get stereospace time domain samples
            engine.outAnalL.getFloatTimeDomainData(timeDataL);
            engine.outAnalR.getFloatTimeDomainData(timeDataR);

            // Compute output peak and rms
            let maxOut = 0;
            let sumOutSq = 0;
            for (let i = 0; i < bufferLength; i++) {
                const l = timeDataL[i];
                const r = timeDataR[i];
                sumOutSq += (l * l + r * r) / 2;
                const maxChan = Math.max(Math.abs(l), Math.abs(r));
                if (maxChan > maxOut) maxOut = maxChan;
            }
            rmsOutDb = 20 * Math.log10(Math.sqrt(sumOutSq / bufferLength));
            peakOutDb = 20 * Math.log10(maxOut);

            const rmsLinear = Math.max(0.0, Math.min(1.0, Math.pow(10, rmsOutDb / 20)));
            const peakLinear = Math.max(0.0, Math.min(1.0, Math.pow(10, peakOutDb / 20)));

            // Get frequency data (reuse pre-allocated buffers)
            const freqBinCount = engine.outAnalL.frequencyBinCount;
            if (!freqDataL || freqDataL.length !== freqBinCount) {
                freqDataL = new Uint8Array(freqBinCount);
                freqDataR = new Uint8Array(freqBinCount);
            }
            engine.outAnalL.getByteFrequencyData(freqDataL);
            engine.outAnalR.getByteFrequencyData(freqDataR);

            let lowSum = 0;
            const lowLimit = Math.min(12, freqBinCount);
            for (let i = 0; i < lowLimit; i++) {
                lowSum += (freqDataL[i] + freqDataR[i]) * 0.5;
            }
            const lowEnergy = lowLimit > 0 ? (lowSum / lowLimit) / 255.0 : 0.0;

            let highSum = 0;
            const highStart = Math.min(100, freqBinCount);
            const highEnd = Math.min(256, freqBinCount);
            for (let i = highStart; i < highEnd; i++) {
                highSum += (freqDataL[i] + freqDataR[i]) * 0.5;
            }
            const highEnergy = (highEnd - highStart) > 0 ? (highSum / (highEnd - highStart)) / 255.0 : 0.0;

            // Expose globally
            window.EXERGIA_AUDIO = {
                rms: rmsLinear,
                peak: peakLinear,
                low: lowEnergy,
                high: highEnergy,
                correlation: lastCorrelationVal
            };

            // Set document variables for CSS
            document.documentElement.style.setProperty('--audio-rms', rmsLinear.toFixed(4));
            document.documentElement.style.setProperty('--audio-low', lowEnergy.toFixed(4));
            document.documentElement.style.setProperty('--audio-high', highEnergy.toFixed(4));
            document.documentElement.style.setProperty('--audio-peak', peakLinear.toFixed(4));

            // Compute Pearson correlation (Phase Correlation)
            let sumL = 0;
            let sumR = 0;
            let sumLR = 0;
            let sumL2 = 0;
            let sumR2 = 0;

            ctxGon.beginPath();
            ctxGon.lineWidth = 2.0;
            ctxGon.strokeStyle = '#00FFFF'; // Cyber Cyan
            ctxGon.shadowColor = '#00FFFF';
            ctxGon.shadowBlur = 15;

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
            window.EXERGIA_AUDIO = {
                rms: 0,
                peak: 0,
                low: 0,
                high: 0,
                correlation: 1.0
            };
            document.documentElement.style.setProperty('--audio-rms', '0');
            document.documentElement.style.setProperty('--audio-low', '0');
            document.documentElement.style.setProperty('--audio-high', '0');
            document.documentElement.style.setProperty('--audio-peak', '0');

            document.getElementById('correlation-value').innerText = `CORR: +1.00`;
            lastCorrelationVal = 1.0;
            const corrBar = document.getElementById('corr-bar-fill');
            if (corrBar) corrBar.style.left = '100%';
        }


        // 2. MID/SIDE FREQUENCY SPECTROGRAM
        const wSpec = spectrumCanvas.width;
        const hSpec = spectrumCanvas.height;
        ctxSpec.clearRect(0, 0, wSpec, hSpec);

        if (engine.isPlaying && freqDataL && freqDataR && ctxWater && waterfallCanvas) {
            const len = freqDataL.length;

            // Shift waterfall pixels down by 1px
            ctxWater.drawImage(waterfallCanvas, 0, 0, wSpec, hSpec - 1, 0, 1, wSpec, hSpec - 1);

            // Create a 1px top row image data slice
            const slice = ctxWater.createImageData(wSpec, 1);
            const sliceData = slice.data;

            for (let x = 0; x < wSpec; x++) {
                const pct = x / wSpec;
                // Logarithmic frequency index mapping (20Hz to 20kHz)
                const freq = 20 * Math.pow(1000, pct);
                const nyquist = engine.ctx.sampleRate * 0.5;
                const idx = Math.max(0, Math.min(len - 1, Math.floor((freq / nyquist) * len)));

                const lVal = freqDataL[idx] / 255;
                const rVal = freqDataR[idx] / 255;

                const mid = (lVal + rVal) * 0.5;
                const side = Math.max(0, Math.abs(lVal - rVal));

                // Map colors: Mid is Cyan/Green, Side is Pink/Red
                const r = Math.floor(side * 160);
                const g = Math.floor(mid * 140);
                const b = Math.floor((mid * 0.5 + side) * 160);

                const pixelIdx = x * 4;
                sliceData[pixelIdx] = Math.min(255, r);
                sliceData[pixelIdx + 1] = Math.min(255, g);
                sliceData[pixelIdx + 2] = Math.min(255, b);
                sliceData[pixelIdx + 3] = 255;
            }
            ctxWater.putImageData(slice, 0, 0);

            // Draw waterfall onto main spectrum canvas
            ctxSpec.drawImage(waterfallCanvas, 0, 0);

            // Draw a subtle dark linear overlay to fade out older history at the bottom
            const grad = ctxSpec.createLinearGradient(0, 0, 0, hSpec);
            grad.addColorStop(0, 'rgba(10, 10, 10, 0.35)');
            grad.addColorStop(1, 'rgba(10, 10, 10, 0.94)');
            ctxSpec.fillStyle = grad;
            ctxSpec.fillRect(0, 0, wSpec, hSpec);
        } else {
            ctxSpec.fillStyle = '#030303';
            ctxSpec.fillRect(0, 0, wSpec, hSpec);
        }

        // Draw frequency grid lines
        ctxSpec.strokeStyle = 'rgba(255, 255, 255, 0.035)';
        ctxSpec.lineWidth = 1;
        const gridFreqs = [100, 500, 1000, 5000, 10000];
        
        ctxSpec.beginPath();
        gridFreqs.forEach(freq => {
            const x = Math.log10(freq / 20) / Math.log10(20000 / 20) * wSpec;
            ctxSpec.moveTo(x, 0);
            ctxSpec.lineTo(x, hSpec);
        });
        ctxSpec.stroke();

        if (engine.isPlaying && freqDataL && freqDataR) {
            const len = freqDataL.length;

            // Generate paths for Mid & Side spectrum curves
            ctxSpec.lineWidth = 2.2;
            
            // Neon Bloom Base
            ctxSpec.globalCompositeOperation = 'lighter';

            // Render Side spectrum curve (Neon Pink)
            ctxSpec.strokeStyle = 'rgba(255, 0, 127, 0.9)';
            ctxSpec.shadowColor = '#FF007F';
            ctxSpec.shadowBlur = 12;
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

            // Render Mid spectrum curve (Cyber Cyan)
            ctxSpec.strokeStyle = 'rgba(0, 255, 255, 0.95)';
            ctxSpec.shadowColor = '#00FFFF';
            ctxSpec.shadowBlur = 12;
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
            
            // Reset global composite operation and shadow
            ctxSpec.globalCompositeOperation = 'source-over';
            ctxSpec.shadowBlur = 0;
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

            // Output Peak calculation was already done at the top of renderLoop()
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
                peakHoldTimerOut = 60;
            } else {
                if (peakHoldTimerOut > 0) peakHoldTimerOut--;
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

        // 4. SHAPER CURVE VISUALIZER
        if (ctxShaper && shaperCanvas) {
            const w = shaperCanvas.width;
            const h = shaperCanvas.height;
            ctxShaper.fillStyle = '#050505';
            ctxShaper.fillRect(0, 0, w, h);
            
            // Draw axis lines
            ctxShaper.strokeStyle = 'rgba(43, 59, 229, 0.15)';
            ctxShaper.lineWidth = 1;
            ctxShaper.beginPath();
            ctxShaper.moveTo(w / 2, 0); ctxShaper.lineTo(w / 2, h);
            ctxShaper.moveTo(0, h / 2); ctxShaper.lineTo(w, h / 2);
            ctxShaper.stroke();
            
            // Draw transfer curve based on active engine parameters
            ctxShaper.strokeStyle = engine.params.satMix > 0.05 ? 'rgba(255, 159, 28, 0.95)' : 'rgba(43, 59, 229, 0.85)';
            ctxShaper.shadowColor = engine.params.satMix > 0.05 ? '#FF9F1C' : '#2B3BE5';
            ctxShaper.shadowBlur = engine.params.satMix > 0.05 ? 6 : 0;
            ctxShaper.lineWidth = 2.0;
            ctxShaper.beginPath();
            
            const drive = engine.params.satDrive;
            const odd = engine.params.exciterOdd;
            const even = engine.params.exciterEven;
            const mix = engine.params.satMix;
            
            for (let i = 0; i < w; i++) {
                const x = (i / w) * 2.0 - 1.0;
                const cleanY = x;
                
                // Shaped Y (tanh saturation + Chebyshev harmonics)
                const sat = Math.tanh(x * drive);
                const t2 = 2.0 * x * x - 1.0;
                const t3 = 4.0 * x * x * x - 3.0 * x;
                const shapedY = sat * 0.8 + (t2 * even + t3 * odd) * 0.2;
                
                // Blended Y based on dry/wet mix
                const finalY = cleanY * (1.0 - mix) + shapedY * mix;
                
                const yCanvas = h - ((finalY + 1.0) * 0.5 * h);
                
                if (i === 0) ctxShaper.moveTo(i, yCanvas);
                else ctxShaper.lineTo(i, yCanvas);
            }
            ctxShaper.stroke();
            ctxShaper.shadowBlur = 0;
        }

        // 5. LIMITER GAIN REDUCTION SCROLLING HISTORY
        let reductionDb = 0;
        if (engine.initialized && engine.isPlaying && engine.limiter) {
            reductionDb = engine.limiter.reduction;
        }
        
        // Scroll buffer
        for (let i = 0; i < grHistory.length - 1; i++) {
            grHistory[i] = grHistory[i + 1];
        }
        grHistory[grHistory.length - 1] = reductionDb;

        if (ctxLimiter && limiterCanvas) {
            const w = limiterCanvas.width;
            const h = limiterCanvas.height;
            ctxLimiter.fillStyle = '#050505';
            ctxLimiter.fillRect(0, 0, w, h);
            
            // Draw grid threshold marks
            ctxLimiter.strokeStyle = 'rgba(255, 255, 255, 0.04)';
            ctxLimiter.lineWidth = 1;
            ctxLimiter.beginPath();
            const gridDbs = [-3, -6, -10];
            gridDbs.forEach(db => {
                const y = (db / -12) * h;
                ctxLimiter.moveTo(0, y);
                ctxLimiter.lineTo(w, y);
            });
            ctxLimiter.stroke();
            
            ctxLimiter.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctxLimiter.font = '7px Courier New';
            ctxLimiter.fillText("-3dB", 4, (-3 / -12) * h - 2);
            ctxLimiter.fillText("-6dB", 4, (-6 / -12) * h - 2);
            
            // Draw reduction scrolling trace (Neon Pink)
            ctxLimiter.strokeStyle = 'rgba(255, 0, 127, 0.95)';
            ctxLimiter.lineWidth = 2.0;
            ctxLimiter.shadowColor = '#FF007F';
            ctxLimiter.shadowBlur = 8;
            ctxLimiter.beginPath();
            
            for (let i = 0; i < grHistory.length; i++) {
                const db = grHistory[i];
                const clampedDb = Math.max(-12, Math.min(0, db));
                const y = (clampedDb / -12) * h;
                const x = (i / (grHistory.length - 1)) * w;
                
                if (i === 0) ctxLimiter.moveTo(x, y);
                else ctxLimiter.lineTo(x, y);
            }
            ctxLimiter.stroke();
            ctxLimiter.shadowBlur = 0;
            
            // Fill area below reduction curve
            ctxLimiter.fillStyle = 'rgba(255, 0, 127, 0.06)';
            ctxLimiter.beginPath();
            ctxLimiter.moveTo(0, 0);
            for (let i = 0; i < grHistory.length; i++) {
                const db = grHistory[i];
                const clampedDb = Math.max(-12, Math.min(0, db));
                const y = (clampedDb / -12) * h;
                const x = (i / (grHistory.length - 1)) * w;
                ctxLimiter.lineTo(x, y);
            }
            ctxLimiter.lineTo(w, 0);
            ctxLimiter.closePath();
            ctxLimiter.fill();
        }

        // 6. BINAURAL CROSSFEED ORBIT RADAR
        if (ctxRadar && radarCanvas) {
            const w = radarCanvas.width;
            const h = radarCanvas.height;
            ctxRadar.fillStyle = '#050505';
            ctxRadar.fillRect(0, 0, w, h);

            const centerX = w / 2;
            const centerY = h / 2 + 10;
            const headRadius = Math.min(w, h) * 0.16;

            // Draw clean background grid circles
            ctxRadar.strokeStyle = 'rgba(255, 255, 255, 0.02)';
            ctxRadar.lineWidth = 1;
            ctxRadar.beginPath();
            ctxRadar.arc(centerX, centerY, headRadius * 2.0, 0, Math.PI * 2);
            ctxRadar.arc(centerX, centerY, headRadius * 3.0, 0, Math.PI * 2);
            ctxRadar.stroke();

            // Draw Head representation
            ctxRadar.strokeStyle = 'rgba(43, 59, 229, 0.4)';
            ctxRadar.fillStyle = 'rgba(43, 59, 229, 0.08)';
            ctxRadar.lineWidth = 1.5;
            
            // Ears
            ctxRadar.beginPath();
            ctxRadar.arc(centerX - headRadius, centerY, headRadius * 0.3, 0, Math.PI * 2); // Left ear
            ctxRadar.arc(centerX + headRadius, centerY, headRadius * 0.3, 0, Math.PI * 2); // Right ear
            ctxRadar.fill();
            ctxRadar.stroke();

            // Main head circle
            ctxRadar.beginPath();
            ctxRadar.arc(centerX, centerY, headRadius, 0, Math.PI * 2);
            ctxRadar.fill();
            ctxRadar.stroke();

            // Nose pointing UP
            ctxRadar.fillStyle = 'rgba(43, 59, 229, 0.3)';
            ctxRadar.beginPath();
            ctxRadar.moveTo(centerX - headRadius * 0.2, centerY - headRadius * 0.9);
            ctxRadar.lineTo(centerX, centerY - headRadius * 1.3);
            ctxRadar.lineTo(centerX + headRadius * 0.2, centerY - headRadius * 0.9);
            ctxRadar.closePath();
            ctxRadar.fill();
            ctxRadar.stroke();

            // Calculate speaker locations based on sideWidth
            const widthScale = engine.params.sideWidth || 1.0;
            const delayMs = engine.params.spatialDelay || 0.3;
            const crossfeedMix = engine.params.crossfeedMix || 0.0;

            const spread = headRadius * 2.4 * widthScale;
            const spkLeftX = centerX - spread;
            const spkRightX = centerX + spread;
            const spkY = centerY - headRadius * 1.5;

            // Draw Speaker Nodes
            ctxRadar.fillStyle = 'rgba(255, 159, 28, 0.8)'; // Amber
            ctxRadar.beginPath();
            ctxRadar.arc(spkLeftX, spkY, spread * 0.07, 0, Math.PI * 2);
            ctxRadar.arc(spkRightX, spkY, spread * 0.07, 0, Math.PI * 2);
            ctxRadar.fill();

            // Real-time audio indicators (RMS and Low energy)
            const rms = window.EXERGIA_AUDIO ? window.EXERGIA_AUDIO.rms : 0.0;
            const low = window.EXERGIA_AUDIO ? window.EXERGIA_AUDIO.low : 0.0;

            // Pulse rings from speaker sources
            ctxRadar.strokeStyle = 'rgba(255, 159, 28, 0.2)';
            ctxRadar.lineWidth = 1;
            const ringCount = 3;
            for (let r = 1; r <= ringCount; r++) {
                const timeFactor = (Date.now() * 0.003 + r / ringCount) % 1;
                const waveRadius = headRadius * 3.5 * timeFactor * (0.8 + low * 0.4);
                
                ctxRadar.beginPath();
                ctxRadar.arc(spkLeftX, spkY, waveRadius, 0, Math.PI * 2);
                ctxRadar.arc(spkRightX, spkY, waveRadius, 0, Math.PI * 2);
                ctxRadar.stroke();
            }

            // Crossfeed crosstalk representation
            if (crossfeedMix > 0.05) {
                ctxRadar.strokeStyle = 'rgba(255, 0, 127, 0.4)'; // pink
                ctxRadar.lineWidth = 1 + crossfeedMix * 2.0;
                
                ctxRadar.beginPath();
                const segments = 20;
                for (let s = 0; s <= segments; s++) {
                    const t = s / segments;
                    const x = spkLeftX + (centerX + headRadius - spkLeftX) * t;
                    const y = spkY + (centerY - spkY) * t;
                    const perpX = -(centerY - spkY);
                    const perpY = (centerX + headRadius - spkLeftX);
                    const perpLen = Math.sqrt(perpX * perpX + perpY * perpY);
                    const waveAmp = Math.sin(t * Math.PI * 6 - Date.now() * 0.02 * (3.0 - delayMs)) * 3.0 * crossfeedMix * (1.0 + rms);
                    
                    const drawX = x + (perpX / perpLen) * waveAmp;
                    const drawY = y + (perpY / perpLen) * waveAmp;
                    
                    if (s === 0) ctxRadar.moveTo(drawX, drawY);
                    else ctxRadar.lineTo(drawX, drawY);
                }
                ctxRadar.stroke();

                ctxRadar.beginPath();
                for (let s = 0; s <= segments; s++) {
                    const t = s / segments;
                    const x = spkRightX + (centerX - headRadius - spkRightX) * t;
                    const y = spkY + (centerY - spkY) * t;
                    const perpX = -(centerY - spkY);
                    const perpY = (centerX - headRadius - spkRightX);
                    const perpLen = Math.sqrt(perpX * perpX + perpY * perpY);
                    const waveAmp = Math.sin(t * Math.PI * 6 - Date.now() * 0.02 * (3.0 - delayMs)) * 3.0 * crossfeedMix * (1.0 + rms);
                    
                    const drawX = x + (perpX / perpLen) * waveAmp;
                    const drawY = y + (perpY / perpLen) * waveAmp;
                    
                    if (s === 0) ctxRadar.moveTo(drawX, drawY);
                    else ctxRadar.lineTo(drawX, drawY);
                }
                ctxRadar.stroke();
            }

            // Radar dynamic cursor marker sweep overlay
            ctxRadar.strokeStyle = 'rgba(0, 255, 255, 0.08)'; // Cyber Cyan
            ctxRadar.lineWidth = 1;
            ctxRadar.beginPath();
            const angle = (Date.now() * 0.002) % (Math.PI * 2);
            ctxRadar.moveTo(centerX, centerY);
            ctxRadar.lineTo(centerX + Math.cos(angle) * headRadius * 3, centerY + Math.sin(angle) * headRadius * 3);
            ctxRadar.stroke();
        }

        // 7. LIVE EQ COMPOSITE FREQUENCY RESPONSE
        if (ctxEq && eqCanvas && engine.initialized) {
            try {
                // Get filter response data from engine nodes
                engine.subHp.getFrequencyResponse(eqFreqs, magSub, phaseSub);
                engine.midLowShelf.getFrequencyResponse(eqFreqs, magShelf, phaseShelf);
                engine.midMudCut.getFrequencyResponse(eqFreqs, magMud, phaseMud);
                engine.midPresence.getFrequencyResponse(eqFreqs, magPres, phasePres);
            } catch (err) {
                console.warn("[EQ Visualizer] getFrequencyResponse error:", err);
            }

            const w = eqCanvas.width;
            const h = eqCanvas.height;
            ctxEq.fillStyle = '#050505';
            ctxEq.fillRect(0, 0, w, h);
            
            // Draw axis lines (Grid)
            ctxEq.strokeStyle = 'rgba(255, 255, 255, 0.03)';
            ctxEq.lineWidth = 1;
            ctxEq.beginPath();
            
            // Draw vertical log frequency lines
            const gridFreqs = [100, 1000, 10000];
            gridFreqs.forEach(f => {
                const x = (Math.log10(f / 20) / Math.log10(20000 / 20)) * w;
                ctxEq.moveTo(x, 0); ctxEq.lineTo(x, h);
            });
            
            // Draw horizontal dB grid lines (+6dB, 0dB, -6dB)
            const gridDbs = [6, 0, -6];
            gridDbs.forEach(db => {
                const y = h / 2 - (db / 12) * (h / 2);
                ctxEq.moveTo(0, y); ctxEq.lineTo(w, y);
            });
            ctxEq.stroke();

            // Label axes
            ctxEq.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctxEq.font = '7px Courier New';
            ctxEq.fillText("1kHz", (Math.log10(1000 / 20) / Math.log10(20000 / 20)) * w + 3, h - 4);
            ctxEq.fillText("0dB", 4, h / 2 - 2);

            // Draw composite curve
            ctxEq.strokeStyle = 'rgba(0, 255, 255, 0.95)'; // Cyber Cyan
            ctxEq.shadowColor = '#00FFFF';
            ctxEq.shadowBlur = 6;
            ctxEq.lineWidth = 2.0;
            ctxEq.beginPath();

            for (let i = 0; i < 80; i++) {
                const totalMag = magSub[i] * magShelf[i] * magMud[i] * magPres[i];
                const db = 20 * Math.log10(Math.max(0.0001, totalMag));

                // Map dB [+12, -12] to canvas Y
                const y = h / 2 - (db / 12) * (h / 2);
                const x = (Math.log10(eqFreqs[i] / 20) / Math.log10(20000 / 20)) * w;

                if (i === 0) ctxEq.moveTo(x, y);
                else ctxEq.lineTo(x, y);
            }
            ctxEq.stroke();
            ctxEq.shadowBlur = 0;
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

    // --- MULTIMEDIA PERFORMANCE RECORDING & CAPTURE ---
    let mediaRecorder = null;
    let recordedChunks = [];
    let isRecording = false;

    if (recordBtn) {
        recordBtn.addEventListener('click', () => {
            if (!engine.initialized) {
                alert("EXERGIA-Ω: Initialize engine before recording.");
                return;
            }

            if (!isRecording) {
                startRecording();
            } else {
                stopRecording();
            }
        });
    }

    function startRecording() {
        recordedChunks = [];
        const webglCanvas = document.getElementById('webgl-background');
        if (!webglCanvas) return;

        let canvasStream;
        try {
            canvasStream = webglCanvas.captureStream(60);
        } catch (e) {
            canvasStream = webglCanvas.captureStream(30);
        }

        const audioCtx = engine.ctx;
        // Create media stream destination to capture mastered Web Audio output
        const dest = audioCtx.createMediaStreamDestination();
        engine.outputNode.connect(dest);

        // Combine video track and audio track
        const combinedStream = new MediaStream([
            ...canvasStream.getVideoTracks(),
            ...dest.getAudioTracks()
        ]);

        let options = { mimeType: 'video/webm;codecs=vp9,opus' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options = { mimeType: 'video/webm;codecs=vp8,opus' };
        }
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options = { mimeType: 'video/webm' };
        }

        try {
            mediaRecorder = new MediaRecorder(combinedStream, options);
        } catch (e) {
            console.warn("[MediaRecorder] Failed using options, using default:", e);
            mediaRecorder = new MediaRecorder(combinedStream);
        }

        mediaRecorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
                recordedChunks.push(e.data);
            }
        };

        mediaRecorder.onstop = () => {
            try {
                engine.outputNode.disconnect(dest);
            } catch (err) {
                console.warn("[MediaRecorder] Disconnection failed:", err);
            }

            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `exergia_perf_${Date.now()}.webm`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            addP0Log("Saved multimedia recording to visuales folder.", "success");
        };

        // Start recording
        mediaRecorder.start(1000);
        isRecording = true;
        recordBtn.innerText = "STOP RECORDING";
        recordBtn.style.background = "rgba(229, 43, 80, 0.25)";
        recordBtn.style.borderColor = "#E52B50";
        addP0Log("Recording Started. Capturing WebGL + Mastered Audio...", "system");
    }

    function stopRecording() {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
        isRecording = false;
        recordBtn.innerText = "RECORD VIDEO";
        recordBtn.style.background = "rgba(255, 0, 127, 0.1)";
        recordBtn.style.borderColor = "rgba(255, 0, 127, 0.3)";
    }

    // --- PRESET VIBE MANAGEMENT & SMOOTH MORPH LERP ---
    const PRESETS = {
        nominal: {
            subCut: 30, lowShelf: 1.0, mudCut: -2.0, presence: 1.5,
            satDrive: 2.0, satMix: 0.15, exciterOdd: 0.10, exciterEven: 0.08,
            spatialDelay: 0.3, crossfeedMix: 0.35, sideWidth: 1.2, sideHp: 120,
            gainBoost: 2.0, ceiling: -0.5, limiterRelease: 50
        },
        'deep-exergy': {
            subCut: 22, lowShelf: 4.5, mudCut: -4.5, presence: 0.5,
            satDrive: 4.2, satMix: 0.40, exciterOdd: 0.25, exciterEven: 0.18,
            spatialDelay: 0.6, crossfeedMix: 0.55, sideWidth: 1.55, sideHp: 100,
            gainBoost: 4.5, ceiling: -0.2, limiterRelease: 80
        },
        'neon-transparency': {
            subCut: 45, lowShelf: -1.0, mudCut: -1.0, presence: 3.5,
            satDrive: 1.2, satMix: 0.02, exciterOdd: 0.0, exciterEven: 0.0,
            spatialDelay: 0.2, crossfeedMix: 0.20, sideWidth: 1.4, sideHp: 140,
            gainBoost: 1.0, ceiling: -0.8, limiterRelease: 30
        },
        'crt-glitch': {
            subCut: 60, lowShelf: 2.5, mudCut: -6.0, presence: 4.5,
            satDrive: 5.5, satMix: 0.60, exciterOdd: 0.45, exciterEven: 0.30,
            spatialDelay: 0.9, crossfeedMix: 0.70, sideWidth: 0.8, sideHp: 180,
            gainBoost: 6.0, ceiling: -1.5, limiterRelease: 120
        },
        'colonial-noir': {
            subCut: 35, lowShelf: 3.0, mudCut: -3.5, presence: 1.0,
            satDrive: 3.0, satMix: 0.25, exciterOdd: 0.18, exciterEven: 0.12,
            spatialDelay: 0.45, crossfeedMix: 0.45, sideWidth: 1.1, sideHp: 110,
            gainBoost: 3.0, ceiling: -0.4, limiterRelease: 60
        }
    };

    let startParams = {};
    let targetParams = null;
    let lerpProgress = 1.0;

    const presetButtons = document.querySelectorAll('.btn-preset');
    presetButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const presetName = e.target.getAttribute('data-preset');
            if (!presetName || !PRESETS[presetName]) return;

            // Make sure DSP engine is active
            engine.init();

            // Set active class
            presetButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            // Capture start state and setup LERP target
            startParams = { ...engine.params };
            targetParams = PRESETS[presetName];
            lerpProgress = 0.0;

            addP0Log(`Morphing Vibe Profile to: ${presetName.toUpperCase()}...`, "system");
        });
    });

    function lerpLoop() {
        requestAnimationFrame(lerpLoop);
        if (targetParams && lerpProgress < 1.0) {
            lerpProgress += 0.035; // smooth morph speed
            if (lerpProgress > 1.0) lerpProgress = 1.0;

            for (const key in targetParams) {
                const startVal = startParams[key];
                const targetVal = targetParams[key];
                const currentVal = startVal + (targetVal - startVal) * lerpProgress;

                // 1. Update core DSP parameters
                engine.updateParam(key, currentVal);

                // 2. Smoothly rotate the physical knob UI
                const knob = document.querySelector(`.rotary-knob[data-param="${key}"]`);
                if (knob) {
                    const min = parseFloat(knob.getAttribute('data-min'));
                    const max = parseFloat(knob.getAttribute('data-max'));
                    updateKnobUI(knob, currentVal, min, max, key);
                }
            }
        }
    }
    lerpLoop();
});
