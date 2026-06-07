export class SplatAudioEngine {
  private ctx: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private masterGain: GainNode | null = null;
  private isInitialized = false;

  public async init() {
    if (this.isInitialized) return;
    
    try {
      this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      
      // Generate a procedural noise buffer (Slate/Canvas scratching texture)
      const bufferSize = this.ctx.sampleRate * 2.0; // 2 seconds
      this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = this.noiseBuffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        // Brown noise approximation for a deep, earthy scratching sound
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        
        // Add some high frequency grit
        output[i] += (Math.random() * 2 - 1) * 0.2;
      }

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.5; // Master volume
      this.masterGain.connect(this.ctx.destination);

      this.isInitialized = true;
    } catch (e) {
      console.warn("SplatAudioEngine: Web Audio API not supported or blocked.", e);
    }
  }

  public async resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  // Triggered during pointer move / force injection
  public playGrain(velocity: number, pressure: number) {
    if (!this.isInitialized || !this.ctx || !this.noiseBuffer || !this.masterGain) return;

    // Filter out micro-movements
    if (velocity < 0.1) return;

    // 1. Create Buffer Source (The grain)
    const source = this.ctx.createBufferSource();
    source.buffer = this.noiseBuffer;
    
    // Playback rate depends on velocity (faster movement = higher pitch)
    const rate = Math.max(0.5, Math.min(3.0, 0.5 + (velocity * 0.05)));
    source.playbackRate.value = rate;

    // 2. Create Envelope (Grain window)
    const envelope = this.ctx.createGain();
    
    // Volume depends on pressure and velocity
    const maxVol = Math.min(0.8, (pressure / 50.0) * (velocity * 0.05));
    
    const now = this.ctx.currentTime;
    const grainDuration = 0.05 + (Math.random() * 0.05); // 50ms - 100ms grain

    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(maxVol, now + grainDuration * 0.2); // Attack
    envelope.gain.exponentialRampToValueAtTime(0.001, now + grainDuration); // Decay

    // 3. Create Filter (Muffle depending on pressure, harder = brighter)
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 500 + (pressure * 40); // 500Hz to ~2500Hz
    filter.Q.value = 1.5;

    // Connect graph: Source -> Filter -> Envelope -> Master
    source.connect(filter);
    filter.connect(envelope);
    envelope.connect(this.masterGain);

    // Pick random start time in the noise buffer
    const offset = Math.random() * (this.noiseBuffer.duration - grainDuration);
    
    source.start(now, offset, grainDuration);
    source.stop(now + grainDuration);
  }
}

// Variables for brown noise generation
let lastOut = 0;
