// Sound FX Engine powered by Web Audio API (Zero external assets required)

class SoundEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private compressor: DynamicsCompressorNode | null = null
  private enabled: boolean = true

  private beatListeners: Set<(intensity: number) => void> = new Set()
  private asmrNoiseNode: AudioNode | null = null
  private asmrGainNode: GainNode | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('naroa_audio_enabled')
      if (saved !== null) {
        this.enabled = saved === 'true'
      }

      const handleUserInteraction = () => {
        this.initCtx()
        window.removeEventListener('pointerdown', handleUserInteraction)
        window.removeEventListener('keydown', handleUserInteraction)
      }
      window.addEventListener('pointerdown', handleUserInteraction, { once: true })
      window.addEventListener('keydown', handleUserInteraction, { once: true })
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
        // Master Dynamics Compressor & Limiter for Audiophile Clarity
        this.compressor = this.ctx.createDynamicsCompressor()
        this.compressor.threshold.setValueAtTime(-18, this.ctx.currentTime)
        this.compressor.knee.setValueAtTime(12, this.ctx.currentTime)
        this.compressor.ratio.setValueAtTime(6, this.ctx.currentTime)
        this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime)
        this.compressor.release.setValueAtTime(0.15, this.ctx.currentTime)

        this.masterGain = this.ctx.createGain()
        this.masterGain.gain.value = 0.9

        this.compressor.connect(this.masterGain)
        this.masterGain.connect(this.ctx.destination)
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  private getDestination(): AudioNode {
    return this.compressor || this.masterGain || (this.ctx ? this.ctx.destination : null as any)
  }

  public subscribeBeat(cb: (intensity: number) => void) {
    this.beatListeners.add(cb)
    return () => { this.beatListeners.delete(cb) }
  }

  private emitBeat(intensity = 1.0) {
    this.beatListeners.forEach(cb => cb(intensity))
  }

  public toggleSound(): boolean {
    this.enabled = !this.enabled
    localStorage.setItem('naroa_audio_enabled', String(this.enabled))
    if (this.enabled) {
      this.playTick()
    }
    return this.enabled
  }

  public isEnabled(): boolean {
    return this.enabled
  }

  // Synth: Organic Sub-Bass Cardiac Heartbeat Pulse (Latido de Corazón Lub-Dub SOTA)
  public playHeartbeat(volume = 0.08, isDoubleBeat = true) {
    if (!this.enabled) return
    this.emitBeat(1.2)
    try {
      this.initCtx()
      if (!this.ctx) return

      const dest = this.getDestination()
      const now = this.ctx.currentTime

      // 1. First Beat ("LUB" - S1): Fundamental 42Hz Sub-Bass + 84Hz Body Overtone
      const subOsc = this.ctx.createOscillator()
      const bodyOsc = this.ctx.createOscillator()
      const gain1 = this.ctx.createGain()
      const filter1 = this.ctx.createBiquadFilter()

      subOsc.type = 'sine'
      subOsc.frequency.setValueAtTime(58, now)
      subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.14)

      bodyOsc.type = 'triangle'
      bodyOsc.frequency.setValueAtTime(116, now)
      bodyOsc.frequency.exponentialRampToValueAtTime(64, now + 0.14)

      filter1.type = 'lowpass'
      filter1.frequency.value = 100
      filter1.Q.value = 2.0

      gain1.gain.setValueAtTime(volume * 1.2, now)
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.16)

      subOsc.connect(filter1)
      bodyOsc.connect(filter1)
      filter1.connect(gain1)
      gain1.connect(dest)

      subOsc.start(now)
      bodyOsc.start(now)
      subOsc.stop(now + 0.17)
      bodyOsc.stop(now + 0.17)

      // 2. Second Beat ("DUB" - S2): Shorter, slightly higher pitch after 110ms delay
      if (isDoubleBeat) {
        const dubTime = now + 0.11
        const subOsc2 = this.ctx.createOscillator()
        const bodyOsc2 = this.ctx.createOscillator()
        const gain2 = this.ctx.createGain()
        const filter2 = this.ctx.createBiquadFilter()

        subOsc2.type = 'sine'
        subOsc2.frequency.setValueAtTime(70, dubTime)
        subOsc2.frequency.exponentialRampToValueAtTime(40, dubTime + 0.1)

        bodyOsc2.type = 'triangle'
        bodyOsc2.frequency.setValueAtTime(140, dubTime)
        bodyOsc2.frequency.exponentialRampToValueAtTime(80, dubTime + 0.1)

        filter2.type = 'lowpass'
        filter2.frequency.value = 120

        gain2.gain.setValueAtTime(volume * 0.9, dubTime)
        gain2.gain.exponentialRampToValueAtTime(0.0001, dubTime + 0.12)

        subOsc2.connect(filter2)
        bodyOsc2.connect(filter2)
        filter2.connect(gain2)
        gain2.connect(dest)

        subOsc2.start(dubTime)
        bodyOsc2.start(dubTime)
        subOsc2.stop(dubTime + 0.13)
        bodyOsc2.stop(dubTime + 0.13)
      }
    } catch {
      // Ignore audio errors
    }
  }

  // Synth: Organic Air Sigh / Exhalation (Suspiro Orgánico Velvet Pink Noise)
  public playSigh(volume = 0.04) {
    if (!this.enabled) return
    try {
      this.initCtx()
      if (!this.ctx) return

      const dest = this.getDestination()
      const now = this.ctx.currentTime
      const duration = 0.5
      const bufferSize = Math.floor(this.ctx.sampleRate * duration)
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
      const data = buffer.getChannelData(0)

      // Paul Kellet's Pink Noise algorithm for velvety organic air texture
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        b0 = 0.99886 * b0 + white * 0.0555179
        b1 = 0.99332 * b1 + white * 0.0750759
        b2 = 0.96900 * b2 + white * 0.1538520
        b3 = 0.86650 * b3 + white * 0.3104856
        b4 = 0.55000 * b4 + white * 0.5329522
        b5 = -0.7616 * b5 - white * 0.0168980
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08
        b6 = white * 0.115926
      }

      const noise = this.ctx.createBufferSource()
      noise.buffer = buffer

      // Sweeping double lowpass filter emulating human breath
      const filter = this.ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(650, now)
      filter.frequency.exponentialRampToValueAtTime(220, now + duration)
      filter.Q.value = 1.4

      const gain = this.ctx.createGain()
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.linearRampToValueAtTime(volume * 1.1, now + 0.1) // Velvet breath attack
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration) // Gentle sigh fade out

      noise.connect(filter)
      filter.connect(gain)
      gain.connect(dest)

      noise.start(now)
      noise.stop(now + duration + 0.05)
    } catch {
      // Ignore audio errors
    }
  }

  public startStudioASMR() {
    if (!this.enabled) return
    try {
      this.initCtx()
      if (!this.ctx) return

      if (this.asmrNoiseNode) return

      const bufferSize = this.ctx.sampleRate * 2
      const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate)
      const left = buffer.getChannelData(0)
      const right = buffer.getChannelData(1)

      let lastOutL = 0.0
      let lastOutR = 0.0

      for (let i = 0; i < bufferSize; i++) {
        const whiteL = Math.random() * 2 - 1
        const whiteR = Math.random() * 2 - 1
        lastOutL = (lastOutL + 0.02 * whiteL) / 1.02
        lastOutR = (lastOutR + 0.02 * whiteR) / 1.02
        left[i] = lastOutL * 0.15
        right[i] = lastOutR * 0.15
      }

      const noise = this.ctx.createBufferSource()
      noise.buffer = buffer
      noise.loop = true

      const filter = this.ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.value = 1800
      filter.Q.value = 3.5

      const gain = this.ctx.createGain()
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.08, this.ctx.currentTime + 0.5)

      noise.connect(filter)
      filter.connect(gain)
      gain.connect(this.ctx.destination)

      noise.start()
      this.asmrNoiseNode = noise
      this.asmrGainNode = gain
    } catch {
      // Ignore audio errors
    }
  }

  public stopStudioASMR() {
    if (this.asmrGainNode && this.ctx) {
      try {
        const now = this.ctx.currentTime
        this.asmrGainNode.gain.setValueAtTime(this.asmrGainNode.gain.value, now)
        this.asmrGainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.3)
        setTimeout(() => {
          if (this.asmrNoiseNode) {
            (this.asmrNoiseNode as AudioBufferSourceNode).stop()
            this.asmrNoiseNode = null
            this.asmrGainNode = null
          }
        }, 320)
      } catch {
        this.asmrNoiseNode = null
        this.asmrGainNode = null
      }
    }
  }

  public playMicaShimmer() {
    if (!this.enabled) return
    try {
      this.initCtx()
      if (!this.ctx) return

      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(2400, now)
      osc.frequency.exponentialRampToValueAtTime(4800, now + 0.12)

      gain.gain.setValueAtTime(0.03, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + 0.12)
    } catch {
      // Ignore audio errors
    }
  }

  public playSlateRasp() {
    if (!this.enabled) return
    try {
      this.initCtx()
      if (!this.ctx) return

      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(140, now)
      osc.frequency.linearRampToValueAtTime(90, now + 0.08)

      gain.gain.setValueAtTime(0.04, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + 0.08)
    } catch {
      // Ignore audio errors
    }
  }

  public playTick() {
    // Single soft cardiac pulse (lub)
    this.playHeartbeat(0.06, false)
  }

  public playHover() {
    // Subtle organic pulse on hover + faint breath whisper
    this.playHeartbeat(0.035, false)
    this.playSigh(0.015)
  }

  public playOpen() {
    // Deep cardiac heartbeat (lub-dub) + organic sigh of relief on open
    this.playHeartbeat(0.08, true)
    this.playSigh(0.035)
  }

  public playSplatActivate() {
    if (!this.enabled) return
    try {
      this.initCtx()
      if (!this.ctx) return

      const now = this.ctx.currentTime
      const osc1 = this.ctx.createOscillator()
      const osc2 = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(440, now)
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.25)

      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(554.37, now) // C#5 harmonic
      osc2.frequency.exponentialRampToValueAtTime(1108.73, now + 0.25)

      gain.gain.setValueAtTime(0.06, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3)

      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(this.ctx.destination)

      osc1.start(now)
      osc2.start(now)
      osc1.stop(now + 0.3)
      osc2.stop(now + 0.3)
    } catch {
      // Ignore audio errors
    }
  }

  public playSplatLightChange() {
    if (!this.enabled) return
    try {
      this.initCtx()
      if (!this.ctx) return

      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(660, now)
      osc.frequency.exponentialRampToValueAtTime(330, now + 0.08)

      gain.gain.setValueAtTime(0.04, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + 0.08)
    } catch {
      // Ignore audio errors
    }
  }

  public playStep() {
    if (!this.enabled) return
    try {
      this.initCtx()
      if (!this.ctx) return

      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(140, now)
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.06)

      gain.gain.setValueAtTime(0.025, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + 0.06)
    } catch {
      // Ignore audio errors
    }
  }
}

export const sound = new SoundEngine()

