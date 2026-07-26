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

  public playTick() {
    if (!this.enabled) return
    try {
      this.initCtx()
      if (!this.ctx) return

      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(520, now)
      osc.frequency.exponentialRampToValueAtTime(1040, now + 0.045)

      gain.gain.setValueAtTime(0.045, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + 0.045)
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
}

export const sound = new SoundEngine()

