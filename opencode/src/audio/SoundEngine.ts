import { createNoise, smoothLoop, type NoiseColor } from './noise'
import { type LayerId } from './sounds'

export type { LayerId } from './sounds'
interface Layer { gain: GainNode; analyser: AnalyserNode }
type Source = AudioBufferSourceNode | OscillatorNode
const safeGain = (value: number) => Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0

export class SoundEngine {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private bus: DynamicsCompressorNode | null = null
  private layers = new Map<LayerId, Layer>()
  private sources = new Set<Source>()
  private nodes = new Set<AudioNode>()

  async init() {
    if (!this.context) {
      const ctx = new AudioContext()
      this.context = ctx
      this.master = this.gain(0)
      this.bus = this.track(ctx.createDynamicsCompressor())
      this.bus.threshold.value = -14
      this.bus.knee.value = 16
      this.bus.ratio.value = 4
      this.bus.attack.value = 0.015
      this.bus.release.value = 0.3
      const highpass = this.filter('highpass', 28)
      highpass.connect(this.bus).connect(this.master).connect(ctx.destination)
      this.busInput = highpass
    }
    if (this.context.state === 'suspended') await this.context.resume()
    if (this.context.state !== 'running') throw new Error('Audio context is not running')
  }

  private busInput: AudioNode | null = null
  private track<T extends AudioNode>(node: T): T { this.nodes.add(node); return node }
  private gain(value: number) {
    const gain = this.track(this.context!.createGain())
    gain.gain.value = value
    return gain
  }
  private filter(type: BiquadFilterType, frequency: number, q = 0.5) {
    const filter = this.track(this.context!.createBiquadFilter())
    filter.type = type
    filter.frequency.value = frequency
    filter.Q.value = q
    return filter
  }
  private start<T extends Source>(source: T): T {
    this.sources.add(source)
    source.start()
    return source
  }
  private modulate(target: AudioParam, frequency: number, depth: number, phase = 0) {
    const lfo = this.track(this.context!.createOscillator())
    lfo.frequency.value = frequency
    if (phase) {
      const wave = this.context!.createPeriodicWave(new Float32Array([0, Math.sin(phase)]), new Float32Array([0, Math.cos(phase)]))
      lfo.setPeriodicWave(wave)
    }
    const amount = this.gain(depth)
    lfo.connect(amount).connect(target)
    this.start(lfo)
  }
  private noise(color: NoiseColor, duration = 12) {
    const ctx = this.context!
    const buffer = ctx.createBuffer(2, Math.floor(ctx.sampleRate * duration), ctx.sampleRate)
    for (let channel = 0; channel < 2; channel++) {
      const data = createNoise(buffer.length, color)
      smoothLoop(data, Math.floor(ctx.sampleRate * 0.04))
      buffer.copyToChannel(data, channel)
    }
    return buffer
  }
  private loop(buffer: AudioBuffer, destination: AudioNode) {
    const source = this.track(this.context!.createBufferSource())
    source.buffer = buffer
    source.loop = true
    source.connect(destination)
    this.start(source)
  }

  private buildLayer(id: LayerId): Layer {
    const ctx = this.context!
    const gain = this.gain(0)
    const analyser = this.track(ctx.createAnalyser())
    analyser.fftSize = 128
    analyser.smoothingTimeConstant = 0.82
    analyser.minDecibels = -85
    analyser.maxDecibels = -15
    gain.connect(analyser).connect(this.busInput!)
    const layer = { gain, analyser }
    this.layers.set(id, layer)

    if (id === 'rain') {
      const wash = this.gain(0.54)
      const low = this.filter('lowpass', 6800)
      const high = this.filter('highpass', 420)
      high.connect(low).connect(wash).connect(gain)
      this.loop(this.noise('pink', 14), high)
      this.modulate(wash.gain, 0.043, 0.055)
      const droplets = ctx.createBuffer(2, ctx.sampleRate * 17, ctx.sampleRate)
      for (let channel = 0; channel < 2; channel++) {
        const data = droplets.getChannelData(channel)
        for (let n = 0; n < 780; n++) {
          const start = Math.floor(Math.random() * (data.length - ctx.sampleRate * 0.12))
          const length = Math.floor(ctx.sampleRate * (0.015 + Math.random() * 0.07))
          const level = 0.035 + Math.random() * 0.08
          const tone = 1600 + Math.random() * 4000
          for (let i = 0; i < length; i++) {
            const time = i / length
            const envelope = Math.min(1, time * 18) * Math.exp(-time * 7)
            data[start + i] += ((Math.random() * 2 - 1) * 0.8 + Math.sin(i * tone * Math.PI * 2 / ctx.sampleRate) * 0.2) * envelope * level
          }
        }
        smoothLoop(data, 512)
      }
      const detail = this.filter('highpass', 1200)
      detail.connect(gain)
      this.loop(droplets, detail)
    } else if (id === 'pad') {
      const sum = this.gain(1)
      const low = this.filter('lowpass', 950, 0.4)
      const dry = this.gain(0.65)
      sum.connect(low).connect(dry).connect(gain)
      const voices = [130.8128, 196, 261.6256, 293.6648]
      voices.forEach((frequency, index) => {
        const voice = this.gain(index < 2 ? 0.045 : 0.022)
        const pan = this.track(ctx.createStereoPanner())
        pan.pan.value = (index - 1.5) * 0.3
        voice.connect(pan).connect(sum)
        for (const detune of [-2.2, 2.2]) {
          const osc = this.track(ctx.createOscillator())
          osc.type = index < 2 ? 'triangle' : 'sine'
          osc.frequency.value = frequency
          osc.detune.value = detune
          osc.connect(voice)
          this.start(osc)
        }
        this.modulate(voice.gain, 0.018 + index * 0.007, index < 2 ? 0.01 : 0.006, index)
      })
      this.modulate(low.frequency, 0.024, 220)
      const reverb = this.track(ctx.createConvolver())
      const impulse = ctx.createBuffer(2, Math.floor(ctx.sampleRate * 3.4), ctx.sampleRate)
      for (let channel = 0; channel < 2; channel++) {
        const data = createNoise(impulse.length, 'pink')
        for (let i = 0; i < data.length; i++) data[i] *= Math.exp(-i / ctx.sampleRate * 2.1) * Math.min(1, i / (ctx.sampleRate * 0.03))
        impulse.copyToChannel(data, channel)
      }
      reverb.buffer = impulse
      const wet = this.gain(0.65)
      low.connect(reverb).connect(wet).connect(gain)
    } else if (id === 'vinyl') {
      const buffer = ctx.createBuffer(2, ctx.sampleRate * 19, ctx.sampleRate)
      for (let channel = 0; channel < 2; channel++) {
        const data = buffer.getChannelData(channel)
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.008
        for (let n = 0; n < 95; n++) {
          const start = Math.floor(Math.random() * (data.length - 512))
          const length = 35 + Math.floor(Math.random() * 150)
          const level = 0.015 + Math.random() ** 3 * 0.12
          for (let i = 0; i < length; i++) data[start + i] += (Math.random() * 2 - 1) * Math.sin(Math.PI * i / length) * Math.exp(-i / length * 4) * level
        }
        smoothLoop(data, 256)
      }
      const high = this.filter('highpass', 850)
      const low = this.filter('lowpass', 6400)
      high.connect(low).connect(gain)
      this.loop(buffer, high)
    } else if (id === 'ocean') {
      const buffer = this.noise('pink', 23)
      for (let index = 0; index < 2; index++) {
        const high = this.filter('highpass', 110)
        const low = this.filter('lowpass', 1500 + index * 700)
        const swell = this.gain(0.24)
        const pan = this.track(ctx.createStereoPanner())
        pan.pan.value = index ? 0.4 : -0.4
        high.connect(low).connect(swell).connect(pan).connect(gain)
        const source = this.track(ctx.createBufferSource())
        source.buffer = buffer
        source.loop = true
        source.playbackRate.value = index ? 0.94 : 1
        source.connect(high)
        this.start(source)
        this.modulate(swell.gain, index ? 0.067 : 0.091, 0.2, index * 2)
        this.modulate(low.frequency, index ? 0.067 : 0.091, 700, index * 2)
      }
    } else if (id === 'wind') {
      const band = this.filter('bandpass', 650, 0.35)
      const low = this.filter('lowpass', 2800)
      const breeze = this.gain(0.55)
      band.connect(low).connect(breeze).connect(gain)
      this.loop(this.noise('pink', 16), band)
      this.modulate(band.frequency, 0.035, 300)
      this.modulate(breeze.gain, 0.049, 0.2, 1.3)
    } else {
      const high = this.filter('highpass', 45)
      const low = this.filter('lowpass', 1000, 0.4)
      const level = this.gain(0.48)
      high.connect(low).connect(level).connect(gain)
      this.loop(this.noise('brown', 15), high)
    }
    return layer
  }

  setLayer(id: LayerId, value: number) {
    if (!this.context) return
    const level = safeGain(value)
    const layer = this.layers.get(id) ?? (level > 0 ? this.buildLayer(id) : undefined)
    layer?.gain.gain.setTargetAtTime(level, this.context.currentTime, 0.3)
  }
  setMaster(value: number) {
    if (this.context) this.master?.gain.setTargetAtTime(safeGain(value), this.context.currentTime, 0.12)
  }
  analyser(id: LayerId) { return this.layers.get(id)?.analyser }

  chime() {
    const ctx = this.context
    if (!ctx || ctx.state !== 'running') return
    for (const [index, frequency] of [523.25, 659.25, 783.99].entries()) {
      const osc = this.track(ctx.createOscillator())
      const gain = this.gain(0)
      const time = ctx.currentTime + index * 0.13
      osc.frequency.value = frequency
      gain.gain.setValueAtTime(0, time)
      gain.gain.linearRampToValueAtTime(0.055, time + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, time + 1.1)
      osc.connect(gain).connect(ctx.destination)
      this.sources.add(osc)
      osc.start(time)
      osc.stop(time + 1.1)
      osc.onended = () => { osc.disconnect(); gain.disconnect(); this.sources.delete(osc); this.nodes.delete(osc); this.nodes.delete(gain) }
    }
  }

  dispose() {
    this.sources.forEach(source => { source.stop(); source.disconnect() })
    this.nodes.forEach(node => node.disconnect())
    void this.context?.close()
    this.sources.clear()
    this.nodes.clear()
    this.layers.clear()
    this.context = null
    this.master = null
    this.bus = null
    this.busInput = null
  }
}
