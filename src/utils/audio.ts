// Sound FX Engine powered by Web Audio API (Zero external assets required)

class SoundEngine {
  private ctx: AudioContext | null = null
  private enabled: boolean = true

  constructor() {
    // Lazy init audio context on first user interaction
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('naroa_audio_enabled')
      if (saved !== null) {
        this.enabled = saved === 'true'
      }

      // Resume AudioContext on any initial user gesture for browser autoplay policy compliance
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
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
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

  private asmrNoiseNode: AudioNode | null = null;
  private asmrGainNode: GainNode | null = null;

  public startStudioASMR() {
    if (!this.enabled) return
    try {
      this.initCtx()
      if (!this.ctx) return

      if (this.asmrNoiseNode) return // Already playing

      // Create procedural binaural noise for studio atmosphere (slate scraping & ambient friction)
      const bufferSize = this.ctx.sampleRate * 2
      const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate)
      const left = buffer.getChannelData(0)
      const right = buffer.getChannelData(1)

      let lastOutL = 0.0
      let lastOutR = 0.0

      for (let i = 0; i < bufferSize; i++) {
        // Pink noise filtering for warm organic slate rasping
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

      // Bandpass filter centered around 1800Hz for chalk & slate friction texture
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


  public playHover() {
    if (!this.enabled) return
    try {
      this.initCtx()
      if (!this.ctx) return

      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(280, now)
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.055)

      gain.gain.setValueAtTime(0.02, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + 0.055)
    } catch {
      // Ignore audio errors
    }
  }

  public playOpen() {
    if (!this.enabled) return
    try {
      this.initCtx()
      if (!this.ctx) return

      const now = this.ctx.currentTime
      const osc1 = this.ctx.createOscillator()
      const osc2 = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(320, now)
      osc1.frequency.exponentialRampToValueAtTime(720, now + 0.14)

      osc2.type = 'triangle'
      osc2.frequency.setValueAtTime(480, now)
      osc2.frequency.exponentialRampToValueAtTime(960, now + 0.14)

      gain.gain.setValueAtTime(0.05, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15)

      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(this.ctx.destination)

      osc1.start(now)
      osc2.start(now)
      osc1.stop(now + 0.15)
      osc2.stop(now + 0.15)
    } catch {
      // Ignore audio errors
    }
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

