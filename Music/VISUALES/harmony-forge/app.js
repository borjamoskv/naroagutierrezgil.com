// --- HARMONY FORGE // ДЕКОДЕР-9 ---

// Music Theory Tables (21-EDO / 21-TET microtonal framework)
const ROOT_FREQS = {
    "A": 220.00,  // A3 base
    "C": 130.81,  // C3 base
    "D": 146.83,  // D3 base
    "E": 164.81,  // E3 base
    "G": 196.00   // G3 base
};

const SCALES = {
    pentatonic_minor: [0, 5, 9, 12, 17], // Approximates minor pentatonic in 21-EDO
    pentatonic_major: [0, 4, 7, 12, 16], // Approximates major pentatonic in 21-EDO
    dorian: [0, 4, 5, 9, 12, 16, 17],    // Dorian Mode EDO-21
    phrygian_dominant: [0, 2, 7, 9, 12, 14, 17] // Soviet relic mode in EDO-21
};

// Chord progressions (represented by scale index offsets)
const PROGRESSIONS = {
    minor: [
        [0, 2, 3], // i
        [3, 4, 0], // VI
        [4, 1, 3], // VII
        [2, 3, 0]  // v
    ],
    major: [
        [0, 2, 4], // I
        [4, 0, 2], // V
        [1, 3, 4], // vi
        [3, 4, 0]  // IV
    ]
};

// State Variables
let audioCtx = null;
let masterGain = null;
let delayNode = null;
let reverbNode = null;
let noiseNode = null;
let isPlaying = false;
let currentBpm = 90;
let currentRoot = "A";
let currentScaleType = "pentatonic_minor";
let wowFlutterAmount = 0.25;
let tapeWearAmount = 0.35;
let filterCutoff = 800;

// Systems state variables
let enableDrums = false;
let enableTrumpet = true;
let enableTheremin = true;
let enableGuitar = true;
let isNegativeHarmony = false;
let isFractalMode = false;
let drumIntervalId = null;
let drumTickCount = 0;
let lastSequencerBpm = 90;

// Sequencer & Time
let tapeCounterSecs = 0;
let lastProgressTime = 0;
let activeChordIdx = 0;
let padIntervalId = null;

// UI Elements
const playBtn = document.getElementById("play-btn");
const rootSelect = document.getElementById("root-select");
const scaleSelect = document.getElementById("scale-select");
const tempoSlider = document.getElementById("tempo-slider");
const tempoVal = document.getElementById("tempo-val");
const wowFlutterSlider = document.getElementById("wow-flutter-slider");
const wowFlutterVal = document.getElementById("wow-flutter-val");
const tapeWearSlider = document.getElementById("tape-wear-slider");
const tapeWearVal = document.getElementById("tape-wear-val");
const filterCutoffSlider = document.getElementById("filter-cutoff-slider");
const filterCutoffVal = document.getElementById("filter-cutoff-val");
const delaySlider = document.getElementById("delay-slider");
const delayVal = document.getElementById("delay-val");
const reverbSlider = document.getElementById("reverb-slider");
const reverbVal = document.getElementById("reverb-val");

const enablePadCheckbox = document.getElementById("enable-pad");
const enablePluckCheckbox = document.getElementById("enable-pluck");
const enableBellCheckbox = document.getElementById("enable-bell");
const enableTrumpetCheckbox = document.getElementById("enable-trumpet");
const enableThereminCheckbox = document.getElementById("enable-theremin");
const enableGuitarCheckbox = document.getElementById("enable-guitar");
const enableDrumsCheckbox = document.getElementById("enable-drums");
const negativeHarmonyCheckbox = document.getElementById("negative-harmony");
const fractalModeCheckbox = document.getElementById("fractal-mode");

const statusText = document.getElementById("status-text");
const pulseDot = document.querySelector(".pulse-dot");
const tapeCounter = document.getElementById("tape-counter");
const trackingText = document.getElementById("tracking-text");

// Canvas Physics Nodes Setup
const sandboxCanvas = document.getElementById("sandbox-canvas");
const ctxSandbox = sandboxCanvas.getContext("2d");
let balls = [];
const GRAVITY = 0.15;
const FRICTION = 0.99;

// Oscilloscope Canvas
const visualizerCanvas = document.getElementById("visualizer-canvas");
const ctxVisualizer = visualizerCanvas.getContext("2d");
let analyser = null;
let dataArray = null;

// Presets
document.getElementById("preset-slow").addEventListener("click", () => applyPreset("slow"));
document.getElementById("preset-fast").addEventListener("click", () => applyPreset("fast"));
document.getElementById("clear-nodes").addEventListener("click", () => { balls = []; });

function applyPreset(type) {
    if (type === "slow") {
        tempoSlider.value = 75;
        wowFlutterSlider.value = 60;
        tapeWearSlider.value = 50;
        filterCutoffSlider.value = 500;
        delaySlider.value = 65;
        reverbSlider.value = 80;
        enablePadCheckbox.checked = true;
        enablePluckCheckbox.checked = false;
        enableBellCheckbox.checked = true;
    } else {
        tempoSlider.value = 120;
        wowFlutterSlider.value = 15;
        tapeWearSlider.value = 15;
        filterCutoffSlider.value = 1800;
        delaySlider.value = 25;
        reverbSlider.value = 30;
        enablePadCheckbox.checked = true;
        enablePluckCheckbox.checked = true;
        enableBellCheckbox.checked = true;
    }
    updateSliderValues();
}

function updateSliderValues() {
    currentBpm = parseInt(tempoSlider.value);
    tempoVal.textContent = currentBpm;
    
    wowFlutterAmount = parseInt(wowFlutterSlider.value) / 100;
    wowFlutterVal.textContent = wowFlutterSlider.value + "%";
    
    tapeWearAmount = parseInt(tapeWearSlider.value) / 100;
    tapeWearVal.textContent = tapeWearSlider.value + "%";
    
    filterCutoff = parseInt(filterCutoffSlider.value);
    filterCutoffVal.textContent = filterCutoff + " Hz";
    
    delayVal.textContent = delaySlider.value + "%";
    reverbVal.textContent = reverbSlider.value + "%";
    
    if (audioCtx) {
        // Dynamic node adjustments
        if (delayNode) {
            delayNode.gainNode.gain.setTargetAtTime(parseInt(delaySlider.value) / 100 * 0.5, audioCtx.currentTime, 0.1);
        }
        if (reverbNode) {
            reverbNode.gain.setTargetAtTime(parseInt(reverbSlider.value) / 100 * 0.6, audioCtx.currentTime, 0.1);
        }
        if (noiseNode) {
            noiseNode.gain.gain.setTargetAtTime(tapeWearAmount * 0.15, audioCtx.currentTime, 0.2);
        }
    }
}

// Add event listeners to sliders
[tempoSlider, wowFlutterSlider, tapeWearSlider, filterCutoffSlider, delaySlider, reverbSlider].forEach(slider => {
    slider.addEventListener("input", updateSliderValues);
});

rootSelect.addEventListener("change", () => { currentRoot = rootSelect.value; });
scaleSelect.addEventListener("change", () => { currentScaleType = scaleSelect.value; });

enableTrumpetCheckbox.addEventListener("change", (e) => { enableTrumpet = e.target.checked; });
enableThereminCheckbox.addEventListener("change", (e) => { enableTheremin = e.target.checked; });
enableGuitarCheckbox.addEventListener("change", (e) => { enableGuitar = e.target.checked; });
enableDrumsCheckbox.addEventListener("change", (e) => { 
    enableDrums = e.target.checked; 
    if (isPlaying && enableDrums) {
        startDrumSequencer();
    } else if (!enableDrums && drumIntervalId) {
        clearInterval(drumIntervalId);
        drumIntervalId = null;
    }
});
negativeHarmonyCheckbox.addEventListener("change", (e) => { isNegativeHarmony = e.target.checked; });
fractalModeCheckbox.addEventListener("change", (e) => { isFractalMode = e.target.checked; });

// Initialize Web Audio API
function initAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Master Gain
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.8, audioCtx.currentTime);
    
    // Filter
    const lowpass = audioCtx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(filterCutoff, audioCtx.currentTime);
    lowpass.Q.setValueAtTime(1, audioCtx.currentTime);
    
    // Analyser
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    dataArray = new Uint8Array(analyser.frequencyBinCount);

    // Setup FX Chain
    setupFX();

    // Connect Lowpass to Analyser and destination
    lowpass.connect(analyser);
    analyser.connect(audioCtx.destination);
    
    // Route signals: Synth nodes -> delay/reverb inputs -> lowpass
    // Procedural tape hiss/noise generator
    setupTapeNoise(lowpass);

    // Track Lowpass filter cutoff dynamically
    setInterval(() => {
        if (audioCtx && lowpass) {
            lowpass.frequency.setTargetAtTime(filterCutoff, audioCtx.currentTime, 0.1);
        }
    }, 100);

    return lowpass;
}

// Procedural Algorithmic Reverb (Feedback Delay Network approximation)
function setupFX() {
    // Delay Line
    const delay = audioCtx.createDelay(1.0);
    delay.delayTime.setValueAtTime(0.35, audioCtx.currentTime);
    
    const delayFeedback = audioCtx.createGain();
    delayFeedback.gain.setValueAtTime(0.4, audioCtx.currentTime);
    
    const delayMix = audioCtx.createGain();
    delayMix.gain.setValueAtTime(0.3, audioCtx.currentTime);
    
    // Auto-pan LFO for delay feedback to sweep left/right (ping-pong feeling)
    const delayPanner = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : null;
    if (delayPanner) {
        delayPanner.pan.setValueAtTime(0, audioCtx.currentTime);
        const delayLfo = audioCtx.createOscillator();
        const delayLfoGain = audioCtx.createGain();
        delayLfo.frequency.setValueAtTime(0.2, audioCtx.currentTime); // slow sweep
        delayLfoGain.gain.setValueAtTime(0.85, audioCtx.currentTime); // deep depth
        delayLfo.connect(delayLfoGain);
        delayLfoGain.connect(delayPanner.pan);
        delayLfo.start();
        
        delay.connect(delayPanner);
        delayPanner.connect(delayFeedback);
    } else {
        delay.connect(delayFeedback);
    }
    
    delayFeedback.connect(delay); // feedback loop
    delay.connect(delayMix);
    
    delayNode = {
        delay: delay,
        gainNode: delayMix,
        feedback: delayFeedback
    };

    // Reverb: Algorithmic Feedback Comb Reverb (decaying spaces)
    // Parallel delays representing early reflections and late decay
    const revInput = audioCtx.createGain();
    const revOutput = audioCtx.createGain();
    revOutput.gain.setValueAtTime(0.4, audioCtx.currentTime);

    const combTimes = [0.029, 0.037, 0.043, 0.051];
    combTimes.forEach(t => {
        const d = audioCtx.createDelay();
        d.delayTime.setValueAtTime(t, audioCtx.currentTime);
        const g = audioCtx.createGain();
        g.gain.setValueAtTime(0.78, audioCtx.currentTime); // High decay feedback
        
        revInput.connect(d);
        d.connect(g);
        g.connect(d); // feedback
        g.connect(revOutput);
    });

    reverbNode = revOutput;

    // Connect to Master lowpass filter
    // We will pass `lowpass` object in synth trigger calls
}

// Procedural Tape Noise & Crackle
function setupTapeNoise(destination) {
    const bufferSize = 2 * audioCtx.sampleRate;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    // Generate white noise + occasional impulses (dirt, dust pops)
    for (let i = 0; i < bufferSize; i++) {
        let white = Math.random() * 2 - 1;
        let crackle = 0;
        
        // Random clicks & nicotine box dirt pops
        if (Math.random() < 0.00008) {
            crackle = (Math.random() * 2 - 1) * 0.8;
        }
        
        output[i] = white * 0.05 + crackle;
    }
    
    const noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    
    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.setValueAtTime(400, audioCtx.currentTime);
    noiseFilter.Q.setValueAtTime(0.7, audioCtx.currentTime);
    
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(tapeWearAmount * 0.15, audioCtx.currentTime);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(destination);
    noise.start();

    noiseNode = {
        source: noise,
        gain: noiseGain
    };
}

// --- SYNTH GENERATORS WITH WOW & FLUTTER ---

// Calculate EDO 21 frequency with detune / wow & flutter wobble
function getWobblyFreq(baseFreq, stepOffset) {
    // Step offset represents the number of EDO-21 steps from base frequency
    const cleanFreq = baseFreq * Math.pow(2, stepOffset / 21);
    
    // Wow (0.6Hz slow pitch variation) + Flutter (12Hz fast pitch wobble)
    const time = audioCtx.currentTime;
    const wow = Math.sin(time * 2 * Math.PI * 0.5) * 0.008 * wowFlutterAmount;
    const flutter = Math.sin(time * 2 * Math.PI * 12) * 0.004 * wowFlutterAmount;
    const wobble = 1 + wow + flutter;
    
    return cleanFreq * wobble;
}

// Get scale frequency based on root, scale type, and scale degree in EDO-21
function getScaleFreq(scaleDegree, octave) {
    const baseFreq = ROOT_FREQS[currentRoot] || 220.00;
    const scale = SCALES[currentScaleType];
    const degreeIndex = scaleDegree % scale.length;
    
    // We want 'octave' offset relative to octave 4 as base.
    // So octaveMultiplier = octave - 4.
    const octaveMultiplier = Math.floor(scaleDegree / scale.length) + (octave - 4);
    
    const stepOffset = scale[degreeIndex] + (21 * octaveMultiplier);
    return getWobblyFreq(baseFreq, stepOffset);
}

// 1. Soviet Detuned Pad (Super-saw / Square mix)
function triggerSovietPad(freqs, dest) {
    if (!enablePadCheckbox.checked) return;

    const oscs = [];
    const padGain = audioCtx.createGain();
    padGain.gain.setValueAtTime(0, audioCtx.currentTime);
    padGain.gain.linearRampToValueAtTime(0.18, audioCtx.currentTime + 1.5); // long attack
    
    freqs.forEach((freq, idx) => {
        // detuned pair for lush movement
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        
        osc1.type = idx % 2 === 0 ? "sawtooth" : "triangle";
        osc2.type = "sawtooth";
        
        osc1.frequency.setValueAtTime(freq - 1.2, audioCtx.currentTime);
        osc2.frequency.setValueAtTime(freq + 1.2, audioCtx.currentTime);
        
        osc1.connect(padGain);
        osc2.connect(padGain);
        
        osc1.start();
        osc2.start();
        
        oscs.push(osc1, osc2);
    });

    padGain.connect(dest);
    padGain.connect(reverbNode); // Send pad straight to reverb

    // Long release fadeout
    return {
        stop: () => {
            const stopTime = audioCtx.currentTime + 2.0;
            padGain.gain.cancelScheduledValues(audioCtx.currentTime);
            padGain.gain.setValueAtTime(padGain.gain.value, audioCtx.currentTime);
            padGain.gain.linearRampToValueAtTime(0, stopTime);
            
            setTimeout(() => {
                oscs.forEach(osc => {
                    try { osc.stop(); } catch(e) {}
                });
            }, 2500);
        }
    };
}

// 2. Sport Pluck Synth (Classic subtractive)
function triggerPluck(freq, dest) {
    if (!enablePluckCheckbox.checked) return;

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = "square";
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    // Fast decay envelope filter
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1500, audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.3);

    // Amp Envelope
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(dest);

    // Send to FX loop
    gainNode.connect(delayNode.delay);
    gainNode.connect(reverbNode);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.45);
}

// 3. FM Relic Glass Bell (Frequency Modulation)
function triggerFMBell(freq, dest) {
    if (!enableBellCheckbox.checked) return;

    const carrier = audioCtx.createOscillator();
    const modulator = audioCtx.createOscillator();
    const modGain = audioCtx.createGain();
    const gainNode = audioCtx.createGain();

    carrier.type = "sine";
    modulator.type = "sine";

    carrier.frequency.setValueAtTime(freq, audioCtx.currentTime);
    modulator.frequency.setValueAtTime(freq * 3.5, audioCtx.currentTime); // Metallic bell ratio

    // Modulator Index envelope
    modGain.gain.setValueAtTime(freq * 4, audioCtx.currentTime);
    modGain.gain.exponentialRampToValueAtTime(1, audioCtx.currentTime + 0.6);

    // Amp Envelope
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.002);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);

    modulator.connect(modGain);
    modGain.connect(carrier.frequency); // frequency modulation
    carrier.connect(gainNode);
    gainNode.connect(dest);

    // Send to reverb & delay
    gainNode.connect(delayNode.delay);
    gainNode.connect(reverbNode);

    modulator.start();
    carrier.start();

    modulator.stop(audioCtx.currentTime + 1.3);
    carrier.stop(audioCtx.currentTime + 1.3);
}

// 4. Vocoder Trumpet (ТРУБА) - Desafinada con vocoder + voces gratinadas
function triggerTrumpet(freq, dest) {
    if (!enableTrumpet) return;

    // Carrier
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const vibrato = audioCtx.createOscillator();
    const vibratoGain = audioCtx.createGain();
    
    osc1.type = "sawtooth";
    osc2.type = "sawtooth";
    
    // Very detuned (desafinada)
    osc1.frequency.setValueAtTime(freq * 0.98, audioCtx.currentTime);
    osc2.frequency.setValueAtTime(freq * 1.02, audioCtx.currentTime);
    
    // Vibrato (pitch wobble)
    vibrato.frequency.setValueAtTime(6.8, audioCtx.currentTime); // 6.8 Hz
    vibratoGain.gain.setValueAtTime(20, audioCtx.currentTime); // cents pitch wobble
    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc1.frequency);
    vibratoGain.connect(osc2.frequency);
    
    // Amp Env
    const mainGain = audioCtx.createGain();
    mainGain.gain.setValueAtTime(0, audioCtx.currentTime);
    mainGain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.08); // soft brass attack
    mainGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.1);
    
    // Gratinada vocal crunch (formant parallel filters)
    const filter1 = audioCtx.createBiquadFilter();
    const filter2 = audioCtx.createBiquadFilter();
    const filter3 = audioCtx.createBiquadFilter();
    
    filter1.type = "bandpass";
    filter2.type = "bandpass";
    filter3.type = "bandpass";
    
    // Soviet gratinada vowel formants (approx "A" / "O")
    filter1.frequency.setValueAtTime(650, audioCtx.currentTime);
    filter1.Q.setValueAtTime(10, audioCtx.currentTime);
    
    filter2.frequency.setValueAtTime(1050, audioCtx.currentTime);
    filter2.Q.setValueAtTime(10, audioCtx.currentTime);
    
    filter3.frequency.setValueAtTime(2200, audioCtx.currentTime);
    filter3.Q.setValueAtTime(8, audioCtx.currentTime);
    
    osc1.connect(filter1);
    osc1.connect(filter2);
    osc1.connect(filter3);
    
    osc2.connect(filter1);
    osc2.connect(filter2);
    osc2.connect(filter3);
    
    const filterMix = audioCtx.createGain();
    filter1.connect(filterMix);
    filter2.connect(filterMix);
    filter3.connect(filterMix);
    
    // Add a vocal crunch modulator (AM ring modulation at high speed)
    const crunchOsc = audioCtx.createOscillator();
    const crunchGain = audioCtx.createGain();
    crunchOsc.frequency.setValueAtTime(130, audioCtx.currentTime); // gratinada voice buzz frequency
    crunchOsc.type = "sawtooth";
    
    const ringMod = audioCtx.createGain();
    ringMod.gain.setValueAtTime(0.4, audioCtx.currentTime);
    
    crunchOsc.connect(crunchGain);
    crunchGain.connect(ringMod.gain);
    
    filterMix.connect(ringMod);
    ringMod.connect(mainGain);
    
    // Connect to destination & FX
    mainGain.connect(dest);
    mainGain.connect(delayNode.delay);
    mainGain.connect(reverbNode);
    
    osc1.start();
    osc2.start();
    vibrato.start();
    crunchOsc.start();
    
    const stopTime = audioCtx.currentTime + 1.2;
    osc1.stop(stopTime);
    osc2.stop(stopTime);
    vibrato.stop(stopTime);
    crunchOsc.stop(stopTime);
}

// 5. Happy Theremin (ТЕРЕМИН) - High-energy portamento sine/triangle
let lastThereminFreq = 440;
function triggerTheremin(freq, dest) {
    if (!enableTheremin) return;
    
    const osc = audioCtx.createOscillator();
    const vibrato = audioCtx.createOscillator();
    const vibratoGain = audioCtx.createGain();
    const gainNode = audioCtx.createGain();
    
    osc.type = "triangle";
    
    // Portamento glide from last triggered theremin frequency
    const startFreq = lastThereminFreq;
    lastThereminFreq = freq;
    
    osc.frequency.setValueAtTime(startFreq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq, audioCtx.currentTime + 0.18); // glide
    
    // Active happy vibrato
    vibrato.frequency.setValueAtTime(6.2, audioCtx.currentTime);
    vibratoGain.gain.setValueAtTime(30, audioCtx.currentTime); // cents wobble depth
    
    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);
    
    // Envelope: slow attack, long expressive tail
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.08);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.6);
    
    osc.connect(gainNode);
    gainNode.connect(dest);
    
    gainNode.connect(delayNode.delay);
    gainNode.connect(reverbNode);
    
    osc.start();
    vibrato.start();
    
    const stopTime = audioCtx.currentTime + 1.7;
    osc.stop(stopTime);
    vibrato.stop(stopTime);
}

// 6. Sad Guitar (ГИТАРА) - Karplus-Strong physical modeling string pluck
function triggerGuitar(freq, dest) {
    if (!enableGuitar) return;
    
    const delayTime = 1 / freq;
    
    // Short noise burst to excite the delay line
    const noiseLength = 0.025; // 25ms pluck
    const bufferSize = audioCtx.sampleRate * noiseLength;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    
    // Generate noise decay simulation
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-5 * i / bufferSize);
    }
    
    const noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.25, audioCtx.currentTime); // pluck level
    
    // Loop nodes
    const delay = audioCtx.createDelay(1.0);
    delay.delayTime.setValueAtTime(delayTime, audioCtx.currentTime);
    
    const feedback = audioCtx.createGain();
    // Decay factor (feedback) - slightly damp for a sad acoustic guitar pluck
    feedback.gain.setValueAtTime(0.985, audioCtx.currentTime);
    
    const dampFilter = audioCtx.createBiquadFilter();
    dampFilter.type = "lowpass";
    dampFilter.frequency.setValueAtTime(1800, audioCtx.currentTime); // damp higher frequencies
    
    // Connect string loop
    noiseSource.connect(noiseGain);
    noiseGain.connect(delay);
    
    delay.connect(dampFilter);
    dampFilter.connect(feedback);
    feedback.connect(delay);
    
    // Envelope for decay
    const outputGain = audioCtx.createGain();
    outputGain.gain.setValueAtTime(1.0, audioCtx.currentTime);
    outputGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.8);
    
    dampFilter.connect(outputGain);
    outputGain.connect(dest);
    
    outputGain.connect(delayNode.delay);
    outputGain.connect(reverbNode);
    
    noiseSource.start();
    
    // Cleanup nodes
    setTimeout(() => {
        try {
            noiseSource.stop();
            noiseSource.disconnect();
            noiseGain.disconnect();
            delay.disconnect();
            dampFilter.disconnect();
            feedback.disconnect();
            outputGain.disconnect();
        } catch(e) {}
    }, 2200);
}

// --- SEQUENCER & CHORD AUTOMATOR ---
let activePadNotes = null;
let currentPad = null;

function updatePadChord(dest) {
    if (!isPlaying) return;
    
    const scale = SCALES[currentScaleType];
    const baseFreq = ROOT_FREQS[currentRoot] || 220.00;
    const isMinor = currentScaleType.includes("minor") || currentScaleType.includes("dorian") || currentScaleType.includes("phrygian");
    const prog = isMinor ? PROGRESSIONS.minor : PROGRESSIONS.major;
    
    // Pick chord notes from current progression index
    const chordOffsets = prog[activeChordIdx];
    activeChordIdx = (activeChordIdx + 1) % prog.length;
    
    const chordFreqs = chordOffsets.map(offset => {
        const degree = scale[offset % scale.length];
        // We want pad in octave 3, so octaveOffset = -1 relative to octave 4.
        const totalSteps = degree + 21 * -1;
        return getWobblyFreq(baseFreq, totalSteps);
    });

    if (currentPad) {
        currentPad.stop();
    }
    
    currentPad = triggerSovietPad(chordFreqs, dest);
    activePadNotes = chordOffsets; // Store chord offsets for lead bias
}

// --- GRAVITATIONAL SOUNDBOX (PHYSICS CANVAS) ---

// Sound Node Class
class SoundNode {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 5;
        this.vy = (Math.random() - 0.5) * 5;
        this.radius = 12 + Math.random() * 8;
        
        // Pick dynamic scale degree mapping
        this.scaleDegree = Math.floor(Math.random() * 10); // scale degrees
        this.lastTriggerTime = 0;
        this.trail = [];

        // Random instrument type
        const types = ["pluck", "bell", "trumpet", "theremin", "guitar"];
        this.instrumentType = types[Math.floor(Math.random() * types.length)];
        
        // Color-coding based on instrument type (Aesthetic-Omega palette matching)
        if (this.instrumentType === "pluck") {
            this.color = "rgba(229, 178, 43, 0.75)"; // amber nicotine yellow
            this.trailColor = "rgba(229, 178, 43, 0.1)";
        } else if (this.instrumentType === "bell") {
            this.color = "rgba(0, 200, 255, 0.75)"; // glass cold cyan
            this.trailColor = "rgba(0, 200, 255, 0.1)";
        } else if (this.instrumentType === "trumpet") {
            this.color = "rgba(255, 68, 68, 0.75)"; // vocoder red
            this.trailColor = "rgba(255, 68, 68, 0.1)";
        } else if (this.instrumentType === "theremin") {
            this.color = "rgba(100, 255, 100, 0.75)"; // happy radio neon green
            this.trailColor = "rgba(100, 255, 100, 0.1)";
        } else {
            this.color = "rgba(200, 100, 255, 0.75)"; // guitar sad purple/brown
            this.trailColor = "rgba(200, 100, 255, 0.1)";
        }
    }

    update() {
        this.vy += GRAVITY;
        this.vx *= FRICTION;
        this.vy *= FRICTION;

        this.x += this.vx;
        this.y += this.vy;

        // Trail logic
        this.trail.push({x: this.x, y: this.y});
        if (this.trail.length > 8) {
            this.trail.shift();
        }
    }

    draw(ctx) {
        // Draw trail
        this.trail.forEach((p, idx) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, this.radius * (idx / this.trail.length), 0, Math.PI * 2);
            ctx.fillStyle = this.trailColor;
            ctx.fill();
        });

        // Core node
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        // Pulsing glow on trigger
        const isTriggered = Date.now() - this.lastTriggerTime < 150;
        ctx.fillStyle = isTriggered ? `rgba(255, 255, 255, 0.95)` : this.color;
        ctx.strokeStyle = isTriggered ? `#2B3BE5` : `var(--border-color)`;
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();

        // Node ID mark (VHS look)
        ctx.fillStyle = "#000000";
        ctx.font = "8px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        // Show instrument shorthand prefix + degree
        const short = this.instrumentType.substring(0, 2).toUpperCase();
        ctx.fillText(`${short}-${this.scaleDegree}`, this.x, this.y);
    }

    bounceCheck(width, height, dest) {
        let bounced = false;
        
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx = -this.vx * 0.95;
            bounced = true;
        } else if (this.x + this.radius > width) {
            this.x = width - this.radius;
            this.vx = -this.vx * 0.95;
            bounced = true;
        }

        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.vy = -this.vy * 0.95;
            bounced = true;
        } else if (this.y + this.radius > height) {
            this.y = height - this.radius;
            this.vy = -this.vy * 0.95;
            bounced = true;
        }

        if (bounced && isPlaying) {
            this.lastTriggerTime = Date.now();
            
            // Generate harmonious tone biased toward active pad chord notes
            let targetDegree = this.scaleDegree;
            if (activePadNotes && Math.random() < 0.7) {
                // Bias notes to fit current chord notes perfectly
                const padOffset = activePadNotes[Math.floor(Math.random() * activePadNotes.length)];
                targetDegree = padOffset + (Math.random() < 0.5 ? 0 : 5); // higher octave or base chord tones
            }

            const freq = getScaleFreq(targetDegree, 4); // Pluck/Guitar octaves
            const highFreq = getScaleFreq(targetDegree, 5); // High octaves
            const subFreq = getScaleFreq(targetDegree, 3); // Bass/Trumpet octaves
            
            // Dynamic routing based on ball instrument type
            if (this.instrumentType === "pluck") {
                triggerPluck(freq, dest);
            } else if (this.instrumentType === "bell") {
                triggerFMBell(highFreq, dest);
            } else if (this.instrumentType === "trumpet") {
                triggerTrumpet(subFreq, dest);
            } else if (this.instrumentType === "theremin") {
                triggerTheremin(highFreq, dest);
            } else if (this.instrumentType === "guitar") {
                triggerGuitar(freq, dest);
            }
        }
    }
}

// Init Canvas dimensions
function resizeCanvases() {
    sandboxCanvas.width = sandboxCanvas.parentElement.clientWidth;
    sandboxCanvas.height = sandboxCanvas.parentElement.clientHeight - 100;
    
    visualizerCanvas.width = visualizerCanvas.parentElement.clientWidth;
    visualizerCanvas.height = visualizerCanvas.parentElement.clientHeight - 50;
}

window.addEventListener("resize", resizeCanvases);
resizeCanvases();

// Tap canvas to add node
sandboxCanvas.addEventListener("click", (e) => {
    const rect = sandboxCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (balls.length < 15) {
        balls.push(new SoundNode(x, y));
    }
});

// Setup default nodes
function seedNodes() {
    balls = [];
    const w = sandboxCanvas.width;
    const h = sandboxCanvas.height;
    for (let i = 0; i < 6; i++) {
        balls.push(new SoundNode(w * 0.2 + w * 0.15 * i, h * 0.3 + Math.random() * h * 0.2));
    }
}
seedNodes();

// --- ANIMATION / DSP PROCESSING LOOPS ---

let lowpassNode = null;

function animate() {
    // 1. Draw Physics Sandbox
    ctxSandbox.fillStyle = "#090807"; // grimy tint
    ctxSandbox.fillRect(0, 0, sandboxCanvas.width, sandboxCanvas.height);

    // Draw horizontal scanline noise on sandbox
    if (Math.random() < 0.03) {
        ctxSandbox.fillStyle = "rgba(229, 178, 43, 0.05)";
        ctxSandbox.fillRect(0, Math.random() * sandboxCanvas.height, sandboxCanvas.width, 4);
    }

    balls.forEach(ball => {
        ball.update();
        ball.bounceCheck(sandboxCanvas.width, sandboxCanvas.height, lowpassNode);
        ball.draw(ctxSandbox);
    });

    // 2. Draw CRT Oscilloscope visualizer
    ctxVisualizer.fillStyle = "#070605";
    ctxVisualizer.fillRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);

    if (isPlaying && analyser) {
        analyser.getByteTimeDomainData(dataArray);
        
        ctxVisualizer.lineWidth = 2;
        ctxVisualizer.strokeStyle = "#00FF66"; // phosphorous green
        ctxVisualizer.shadowBlur = 4;
        ctxVisualizer.shadowColor = "#00FF66";
        
        ctxVisualizer.beginPath();
        const sliceWidth = visualizerCanvas.width / analyser.frequencyBinCount;
        let x = 0;
        
        for (let i = 0; i < analyser.frequencyBinCount; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * visualizerCanvas.height / 2;
            
            if (i === 0) {
                ctxVisualizer.moveTo(x, y);
            } else {
                ctxVisualizer.lineTo(x, y);
            }
            x += sliceWidth;
        }
        ctxVisualizer.lineTo(visualizerCanvas.width, visualizerCanvas.height / 2);
        ctxVisualizer.stroke();
        
        // Reset shadow
        ctxVisualizer.shadowBlur = 0;

        // Overlay horizontal corrupt line
        if (Math.random() < 0.02) {
            ctxVisualizer.fillStyle = "rgba(209, 25, 25, 0.25)";
            ctxVisualizer.fillRect(0, Math.random() * visualizerCanvas.height, visualizerCanvas.width, 2);
        }
    } else {
        // Draw flat line
        ctxVisualizer.lineWidth = 1;
        ctxVisualizer.strokeStyle = "rgba(229, 178, 43, 0.3)";
        ctxVisualizer.beginPath();
        ctxVisualizer.moveTo(0, visualizerCanvas.height / 2);
        ctxVisualizer.lineTo(visualizerCanvas.width, visualizerCanvas.height / 2);
        ctxVisualizer.stroke();
    }

    // VHS Timestamp update
    if (isPlaying) {
        const time = Date.now() - lastProgressTime;
        if (time > 1000) {
            tapeCounterSecs++;
            lastProgressTime = Date.now();
            
            const hrs = String(Math.floor(tapeCounterSecs / 3600)).padStart(2, '0');
            const mins = String(Math.floor((tapeCounterSecs % 3600) / 60)).padStart(2, '0');
            const secs = String(tapeCounterSecs % 60).padStart(2, '0');
            tapeCounter.textContent = `${hrs}:${mins}:${secs}`;
        }
    }

    requestAnimationFrame(animate);
}

// Start/Stop engine toggle
playBtn.addEventListener("click", () => {
    if (!isPlaying) {
        // Init Web Audio
        if (!audioCtx) {
            lowpassNode = initAudio();
            
            // Connect Reverb & Delay Node output to lowpass destination
            delayNode.gainNode.connect(lowpassNode);
            reverbNode.connect(lowpassNode);
        }
        
        if (audioCtx.state === "suspended") {
            audioCtx.resume();
        }
        
        isPlaying = true;
        playBtn.textContent = "STOP TAPE / СТОП";
        playBtn.style.background = "#E5B22B";
        playBtn.style.boxShadow = "0 4px 0px #A0740A, 0 6px 10px rgba(0,0,0,0.6)";
        
        statusText.textContent = "DECODER SYSTEM ACTIVE // 1989-REAL";
        pulseDot.classList.add("active");
        trackingText.textContent = "PLAYING • SYSTEM OK";
        
        lastProgressTime = Date.now();

        // Start Ambient Pad Chord Loops
        updatePadChord(lowpassNode);
        padIntervalId = setInterval(() => {
            // Chord transition matches tempo settings
            updatePadChord(lowpassNode);
        }, (60 / currentBpm) * 4000); // changes chord every 4 beats
        
    } else {
        isPlaying = false;
        playBtn.textContent = "START TAPE / ПУСК";
        playBtn.style.background = "var(--accent)";
        playBtn.style.boxShadow = "0 4px 0px #700B0B, 0 6px 10px rgba(0,0,0,0.6)";
        
        statusText.textContent = "SYSTEM STANDBY";
        pulseDot.classList.remove("active");
        trackingText.textContent = "TAPE PAUSED";

        if (currentPad) {
            currentPad.stop();
            currentPad = null;
        }
        clearInterval(padIntervalId);
        
        if (audioCtx) {
            audioCtx.suspend();
        }
    }
});

// Kick off animation rendering
requestAnimationFrame(animate);
updateSliderValues();
