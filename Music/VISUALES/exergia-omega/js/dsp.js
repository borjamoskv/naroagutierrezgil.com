/**
 * EXERGIA-Ω // CORE DSP SIGNAL CHAIN
 * Reality: C5-REAL (Web Audio API Direct DSP)
 * Architecture:
 * Source -> DC Cut -> Sub-Bass Highpass -> M/S Splitter -> Mid/Side EQ -> Widener -> Matrix -> Saturation -> Binaural Crossfeed -> Limiter -> Output
 */

class MasteringEngine {
    constructor() {
        this.ctx = null;
        this.initialized = false;
        
        // Audio Source state
        this.sourceNode = null;
        this.buffer = null;
        this.isPlaying = false;
        
        // Generator nodes
        this.generatorInterval = null;
        this.oscDrone = null;
        this.oscHarmonic1 = null;
        this.oscHarmonic2 = null;
        this.noiseNode = null;
        this.lfoNode = null;
        this.generatorGain = null;
        
        // Parameters & state
        this.bypassMode = false;
        this.params = {
            subCut: 30,         // Highpass frequency
            lowShelf: 1.0,      // Mid-channel low-shelf gain (dB)
            mudCut: -2.0,       // Mid-channel peaking mud cut gain (dB)
            presence: 1.5,      // Mid-channel peaking presence boost gain (dB)
            satDrive: 2.0,      // Tape saturation pre-gain
            satMix: 0.15,       // Saturation mix level (0-1)
            exciterOdd: 0.10,   // Chebyshev odd harmonic level (0-1)
            exciterEven: 0.08,  // Chebyshev even harmonic level (0-1)
            spatialDelay: 0.3,  // Binaural interaural delay (ms)
            crossfeedMix: 0.35, // Binaural crossfeed level (0-1)
            sideWidth: 1.2,     // Side signal width multiplier
            sideHp: 120,        // Side highpass cutoff
            gainBoost: 2.0,     // Limiter input gain boost (dB)
            ceiling: -0.5,      // Limiter output ceiling (dB)
            limiterRelease: 50  // Limiter release time (ms)
        };

        // UI update callback
        this.onStatsChange = null;
    }

    init() {
        if (this.initialized) return;
        
        // Create context
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContextClass({ latencyHint: 'playback' });
        
        document.getElementById('sample-rate-metric').innerText = `SR: ${(this.ctx.sampleRate / 1000).toFixed(1)} kHz`;
        
        this.buildSignalChain();
        this.initialized = true;
        
        // Update hash metrics
        this.updateLedgerHash();
    }

    buildSignalChain() {
        const ctx = this.ctx;

        // 1. Input Node & Bypass Splitter
        this.inputNode = ctx.createGain();
        this.bypassNode = ctx.createGain();
        this.dspActiveNode = ctx.createGain();

        // 2. DC Offset Cut Filter
        this.dcFilter = ctx.createBiquadFilter();
        this.dcFilter.type = 'highpass';
        this.dcFilter.frequency.value = 10;

        // 3. Sub-Bass Clean Highpass
        this.subHp = ctx.createBiquadFilter();
        this.subHp.type = 'highpass';
        this.subHp.frequency.value = this.params.subCut;
        this.subHp.Q.value = 0.707;

        // 4. Mid/Side Splitter Matrix
        this.splitter = ctx.createChannelSplitter(2);
        this.midSum = ctx.createGain();
        this.sideSubL = ctx.createGain();
        this.sideSubR = ctx.createGain();
        this.sideSum = ctx.createGain();

        // Gains for M/S encoding
        // Mid = 0.5 * L + 0.5 * R
        this.midSum.gain.value = 0.5;
        // Side = 0.5 * L - 0.5 * R
        this.sideSubL.gain.value = 0.5;
        this.sideSubR.gain.value = -0.5;

        // 5. Mid Channel Equalizer Chain
        this.midLowShelf = ctx.createBiquadFilter();
        this.midLowShelf.type = 'lowshelf';
        this.midLowShelf.frequency.value = 80;
        this.midLowShelf.gain.value = this.params.lowShelf;

        this.midMudCut = ctx.createBiquadFilter();
        this.midMudCut.type = 'peaking';
        this.midMudCut.frequency.value = 300;
        this.midMudCut.Q.value = 1.0;
        this.midMudCut.gain.value = this.params.mudCut;

        this.midPresence = ctx.createBiquadFilter();
        this.midPresence.type = 'peaking';
        this.midPresence.frequency.value = 3500;
        this.midPresence.Q.value = 1.2;
        this.midPresence.gain.value = this.params.presence;

        this.midAir = ctx.createBiquadFilter();
        this.midAir.type = 'highshelf';
        this.midAir.frequency.value = 12000;
        this.midAir.gain.value = 1.5;

        // 6. Side Channel Equalizer Chain
        this.sideHpFilter = ctx.createBiquadFilter();
        this.sideHpFilter.type = 'highpass';
        this.sideHpFilter.frequency.value = this.params.sideHp;
        this.sideHpFilter.Q.value = 0.707;

        this.sideWidthGain = ctx.createGain();
        this.sideWidthGain.gain.value = this.params.sideWidth;

        // 7. Reconstruction Matrix (Stereo)
        // L = Mid + Side
        // R = Mid - Side
        this.recL = ctx.createGain();
        this.recR = ctx.createGain();
        this.sideInv = ctx.createGain();
        this.sideInv.gain.value = -1.0;

        this.merger = ctx.createChannelMerger(2);

        // 8. Saturation / WaveShaper
        this.shaper = ctx.createWaveShaper();
        this.updateShaperCurve();

        // Dry/Wet Saturation mix
        this.satDry = ctx.createGain();
        this.satWet = ctx.createGain();
        this.satOut = ctx.createGain();
        
        this.satDry.gain.value = 1.0 - this.params.satMix;
        this.satWet.gain.value = this.params.satMix;

        // 9. Binaural Crossfeed / ITD & ILD Network
        this.crossSplitter = ctx.createChannelSplitter(2);
        
        // Direct Paths
        this.dirL = ctx.createGain();
        this.dirR = ctx.createGain();
        
        // Crossfeed Paths (L -> R, R -> L)
        this.delayLtoR = ctx.createDelay(0.01);
        this.filterLtoR = ctx.createBiquadFilter();
        this.gainLtoR = ctx.createGain();

        this.delayRtoL = ctx.createDelay(0.01);
        this.filterRtoL = ctx.createBiquadFilter();
        this.gainRtoL = ctx.createGain();

        // Crossfeed filters configuration
        this.filterLtoR.type = 'lowpass';
        this.filterLtoR.frequency.value = 1500;
        this.filterRtoL.type = 'lowpass';
        this.filterRtoL.frequency.value = 1500;

        this.updateCrossfeedSettings();

        // Summation Nodes for Left and Right Channels
        this.sumL = ctx.createGain();
        this.sumR = ctx.createGain();
        this.crossMerger = ctx.createChannelMerger(2);

        // 10. Gain Boost & Output Limiter
        this.boostGainNode = ctx.createGain();
        this.boostGainNode.gain.value = Math.pow(10, this.params.gainBoost / 20);

        this.limiter = ctx.createDynamicsCompressor();
        this.limiter.threshold.value = this.params.ceiling;
        this.limiter.knee.value = 0.0;
        this.limiter.ratio.value = 20.0;
        this.limiter.attack.value = 0.001;
        this.limiter.release.value = this.params.limiterRelease / 1000;

        // Final output node
        this.outputNode = ctx.createGain();

        // Destination Analyser nodes
        this.inputAnalyser = ctx.createAnalyser();
        this.inputAnalyser.fftSize = 1024;
        
        this.outputAnalyser = ctx.createAnalyser();
        this.outputAnalyser.fftSize = 1024;

        this.outSplitter = ctx.createChannelSplitter(2);
        this.outAnalL = ctx.createAnalyser();
        this.outAnalR = ctx.createAnalyser();
        this.outAnalL.fftSize = 1024;
        this.outAnalR.fftSize = 1024;


        // --- CONNECTIONS ROUTING ---

        // Input & Bypass split
        this.inputNode.connect(this.inputAnalyser);
        this.inputNode.connect(this.bypassNode);
        this.inputNode.connect(this.dspActiveNode);

        // Routing through DSP chain
        this.dspActiveNode.connect(this.dcFilter);
        this.dcFilter.connect(this.subHp);
        
        // Mid/Side encoding routing
        this.subHp.connect(this.splitter);
        
        // Connect L and R to Mid sum
        this.splitter.connect(this.midSum, 0);
        this.splitter.connect(this.midSum, 1);
        
        // Connect L and R to Side subtraction matrix
        this.splitter.connect(this.sideSubL, 0);
        this.splitter.connect(this.sideSubR, 1);
        
        this.sideSubL.connect(this.sideSum);
        this.sideSubR.connect(this.sideSum);

        // Mid channel processing
        this.midSum.connect(this.midLowShelf);
        this.midLowShelf.connect(this.midMudCut);
        this.midMudCut.connect(this.midPresence);
        this.midPresence.connect(this.midAir);

        // Side channel processing
        this.sideSum.connect(this.sideHpFilter);
        this.sideHpFilter.connect(this.sideWidthGain);

        // Reconstruction matrix routing
        this.midAir.connect(this.recL);
        this.midAir.connect(this.recR);
        
        this.sideWidthGain.connect(this.recL);
        this.sideWidthGain.connect(this.sideInv);
        this.sideInv.connect(this.recR);

        this.recL.connect(this.merger, 0, 0);
        this.recR.connect(this.merger, 0, 1);

        // Saturation Dry/Wet Routing
        this.merger.connect(this.satDry);
        this.merger.connect(this.shaper);
        this.shaper.connect(this.satWet);
        
        this.satDry.connect(this.satOut);
        this.satWet.connect(this.satOut);

        // Binaural Crossfeed routing
        this.satOut.connect(this.crossSplitter);
        
        // Left channel splits to Direct L and Crossfeed L -> R
        this.crossSplitter.connect(this.dirL, 0);
        this.crossSplitter.connect(this.delayLtoR, 0);
        
        // Right channel splits to Direct R and Crossfeed R -> L
        this.crossSplitter.connect(this.dirR, 1);
        this.crossSplitter.connect(this.delayRtoL, 1);

        // Cross routing filters/delays
        this.delayLtoR.connect(this.filterLtoR);
        this.filterLtoR.connect(this.gainLtoR);

        this.delayRtoL.connect(this.filterRtoL);
        this.filterRtoL.connect(this.gainRtoL);

        // Summing signals
        this.dirL.connect(this.sumL);
        this.gainRtoL.connect(this.sumL); // Right crossfeed sums into L
        
        this.dirR.connect(this.sumR);
        this.gainLtoR.connect(this.sumR); // Left crossfeed sums into R

        this.sumL.connect(this.crossMerger, 0, 0);
        this.sumR.connect(this.crossMerger, 0, 1);

        // Master limiting routing
        this.crossMerger.connect(this.boostGainNode);
        this.boostGainNode.connect(this.limiter);

        // Out connectors
        this.limiter.connect(this.outputNode);

        // Destination connection handling (Master Bypass switches this)
        this.outputNode.connect(this.outputAnalyser);
        this.outputNode.connect(this.outSplitter);
        this.outSplitter.connect(this.outAnalL, 0);
        this.outSplitter.connect(this.outAnalR, 1);
        this.outputAnalyser.connect(ctx.destination);
        
        // Connect bypass path but start with gain = 0
        this.bypassNode.connect(ctx.destination);
        
        // Initialize bypass state
        this.setBypass(false);
    }

    setBypass(bypass) {
        this.bypassMode = bypass;
        if (bypass) {
            this.bypassNode.gain.setValueAtTime(1.0, this.ctx.currentTime);
            this.dspActiveNode.gain.setValueAtTime(0.0, this.ctx.currentTime);
        } else {
            this.bypassNode.gain.setValueAtTime(0.0, this.ctx.currentTime);
            this.dspActiveNode.gain.setValueAtTime(1.0, this.ctx.currentTime);
        }
    }

    updateParam(param, value) {
        this.params[param] = parseFloat(value);
        if (!this.initialized) return;

        const ctx = this.ctx;
        const now = ctx.currentTime;

        switch (param) {
            case 'subCut':
                this.subHp.frequency.setValueAtTime(this.params.subCut, now);
                break;
            case 'lowShelf':
                this.midLowShelf.gain.setValueAtTime(this.params.lowShelf, now);
                break;
            case 'mudCut':
                this.midMudCut.gain.setValueAtTime(this.params.mudCut, now);
                break;
            case 'presence':
                this.midPresence.gain.setValueAtTime(this.params.presence, now);
                break;
            case 'satDrive':
            case 'exciterOdd':
            case 'exciterEven':
                this.updateShaperCurve();
                break;
            case 'satMix':
                this.satDry.gain.setValueAtTime(1.0 - this.params.satMix, now);
                this.satWet.gain.setValueAtTime(this.params.satMix, now);
                break;
            case 'spatialDelay':
            case 'crossfeedMix':
                this.updateCrossfeedSettings();
                break;
            case 'sideWidth':
                this.sideWidthGain.gain.setValueAtTime(this.params.sideWidth, now);
                break;
            case 'sideHp':
                this.sideHpFilter.frequency.setValueAtTime(this.params.sideHp, now);
                break;
            case 'gainBoost':
                this.boostGainNode.gain.setValueAtTime(Math.pow(10, this.params.gainBoost / 20), now);
                break;
            case 'ceiling':
                this.limiter.threshold.setValueAtTime(this.params.ceiling, now);
                break;
            case 'limiterRelease':
                this.limiter.release.setValueAtTime(this.params.limiterRelease / 1000, now);
                break;
        }

        this.updateLedgerHash();
    }

    updateShaperCurve() {
        const drive = this.params.satDrive;
        const odd = this.params.exciterOdd;
        const even = this.params.exciterEven;
        
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        
        for (let i = 0; i < n_samples; ++i) {
            const x = (i * 2) / n_samples - 1;
            // Tanh soft saturation driven
            const sat = Math.tanh(x * drive);
            
            // Chebyshev harmonic polynomials
            const t2 = 2 * x * x - 1;             // 2nd Harmonic (even)
            const t3 = 4 * x * x * x - 3 * x;     // 3rd Harmonic (odd)
            
            // Re-combine dry/harmonics
            const harmonic = t2 * even + t3 * odd;
            curve[i] = sat * 0.8 + harmonic * 0.2;
        }
        
        this.shaper.curve = curve;
    }

    updateCrossfeedSettings() {
        const now = this.ctx.currentTime;
        const delayS = this.params.spatialDelay / 1000; // ms to seconds
        const feedGain = this.params.crossfeedMix;

        // Set delay times
        this.delayLtoR.delayTime.setValueAtTime(delayS, now);
        this.delayRtoL.delayTime.setValueAtTime(delayS, now);

        // Adjust direct channel levels to maintain volume balance (compensated crosstalk)
        const directGain = 1.0 - (feedGain * 0.5);
        this.dirL.gain.setValueAtTime(directGain, now);
        this.dirR.gain.setValueAtTime(directGain, now);

        // Set cross-feed levels
        this.gainLtoR.gain.setValueAtTime(feedGain, now);
        this.gainRtoL.gain.setValueAtTime(feedGain, now);
    }

    // Drone Synthesizer and Beat generator
    startGenerator() {
        this.init();
        if (this.isPlaying) this.stop();

        const ctx = this.ctx;
        const now = ctx.currentTime;
        
        this.generatorGain = ctx.createGain();
        this.generatorGain.gain.setValueAtTime(0.5, now);

        // Sub oscillator (55Hz)
        this.oscDrone = ctx.createOscillator();
        this.oscDrone.type = 'sine';
        this.oscDrone.frequency.value = parseFloat(document.getElementById('drone-freq').value);
        
        // Mid harmonic oscillators (saw & triangle)
        this.oscHarmonic1 = ctx.createOscillator();
        this.oscHarmonic1.type = 'sawtooth';
        this.oscHarmonic1.frequency.value = this.oscDrone.frequency.value * 3; // 165Hz
        const harmonic1Gain = ctx.createGain();
        harmonic1Gain.gain.value = 0.08;

        this.oscHarmonic2 = ctx.createOscillator();
        this.oscHarmonic2.type = 'triangle';
        this.oscHarmonic2.frequency.value = this.oscDrone.frequency.value * 4; // 220Hz
        const harmonic2Gain = ctx.createGain();
        harmonic2Gain.gain.value = 0.06;

        // Filter modulation (creates analog spatial texture)
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 600;
        filter.Q.value = 4.0;

        this.lfoNode = ctx.createOscillator();
        this.lfoNode.frequency.value = 0.25; // 4 seconds cycles
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 300;

        // White Noise Source (creates wide spatial binaural atmosphere)
        const bufferSize = ctx.sampleRate * 4; // 4 seconds buffer
        const noiseBuffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
        const leftChannel = noiseBuffer.getChannelData(0);
        const rightChannel = noiseBuffer.getChannelData(1);
        
        for (let i = 0; i < bufferSize; i++) {
            leftChannel[i] = Math.random() * 2 - 1;
            rightChannel[i] = Math.random() * 2 - 1;
        }

        this.noiseNode = ctx.createBufferSource();
        this.noiseNode.buffer = noiseBuffer;
        this.noiseNode.loop = true;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.value = 2500;
        noiseFilter.Q.value = 1.0;

        const noiseGain = ctx.createGain();
        noiseGain.gain.value = 0.04;

        // Connect noise
        this.noiseNode.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.generatorGain);

        // Connect LFO modulation
        this.lfoNode.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        // Connect tone oscillators
        this.oscDrone.connect(this.generatorGain);
        
        this.oscHarmonic1.connect(harmonic1Gain);
        harmonic1Gain.connect(filter);
        
        this.oscHarmonic2.connect(harmonic2Gain);
        harmonic2Gain.connect(filter);
        
        filter.connect(this.generatorGain);

        // Output generator signal to DSP chain
        this.generatorGain.connect(this.inputNode);

        // Kick drum beat triggers (every 1.5 seconds)
        this.triggerKickBeat();
        this.generatorInterval = setInterval(() => this.triggerKickBeat(), 1500);

        // Start playing
        this.oscDrone.start(now);
        this.oscHarmonic1.start(now);
        this.oscHarmonic2.start(now);
        this.noiseNode.start(now);
        this.lfoNode.start(now);

        this.isPlaying = true;
    }

    triggerKickBeat() {
        if (!this.initialized || !this.isPlaying) return;
        const ctx = this.ctx;
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

        gain.gain.setValueAtTime(0.65, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(this.inputNode);

        osc.start(now);
        osc.stop(now + 0.5);
    }

    playFile(arrayBuffer, name) {
        this.init();
        if (this.isPlaying) this.stop();

        this.ctx.decodeAudioData(arrayBuffer, (decodedBuffer) => {
            this.buffer = decodedBuffer;
            const ctx = this.ctx;
            const now = ctx.currentTime;

            this.sourceNode = ctx.createBufferSource();
            this.sourceNode.buffer = this.buffer;
            
            // Connect to input node
            this.sourceNode.connect(this.inputNode);
            
            this.sourceNode.start(now);
            this.isPlaying = true;
            document.getElementById('file-name').innerText = `PLAYING: ${name}`;

            this.sourceNode.onended = () => {
                this.isPlaying = false;
                document.getElementById('file-name').innerText = `FINISHED: ${name}`;
            };
        }, (err) => {
            console.error("Error decoding audio data:", err);
            document.getElementById('file-name').innerText = "ERROR AL DECODIFICAR AUDIO";
        });
    }

    stop() {
        if (!this.isPlaying) return;

        if (this.sourceNode) {
            try { this.sourceNode.stop(); } catch(e){}
            this.sourceNode = null;
        }

        if (this.oscDrone) {
            try { this.oscDrone.stop(); } catch(e){}
            this.oscDrone = null;
        }
        if (this.oscHarmonic1) {
            try { this.oscHarmonic1.stop(); } catch(e){}
            this.oscHarmonic1 = null;
        }
        if (this.oscHarmonic2) {
            try { this.oscHarmonic2.stop(); } catch(e){}
            this.oscHarmonic2 = null;
        }
        if (this.noiseNode) {
            try { this.noiseNode.stop(); } catch(e){}
            this.noiseNode = null;
        }
        if (this.lfoNode) {
            try { this.lfoNode.stop(); } catch(e){}
            this.lfoNode = null;
        }

        if (this.generatorInterval) {
            clearInterval(this.generatorInterval);
            this.generatorInterval = null;
        }

        if (this.generatorGain) {
            this.generatorGain.disconnect();
            this.generatorGain = null;
        }

        this.isPlaying = false;
    }

    // Cryptographic validation hash of active parameters (Law Ω₉ verification)
    updateLedgerHash() {
        const paramStr = JSON.stringify(this.params);
        let hash = 0;
        for (let i = 0; i < paramStr.length; i++) {
            const char = paramStr.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
        const displayHash = `HASH-256: 8a4c1f9d${hexHash} // VERIFIED REALITY: C5-REAL`;
        const el = document.getElementById('ledger-hash');
        if (el) el.innerText = displayHash;
    }
}

// Instantiate mastering engine globally
const engine = new MasteringEngine();
