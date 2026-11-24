import { noiseBuffer, roomImpulse, textureBuffer } from './textures'
import type { NoiseColor } from './textures'
export type Layer = 'rain' | 'drone' | 'vinyl' | 'ocean' | 'fire' | 'garden'
export const layerIds: Layer[] = ['rain', 'ocean', 'fire', 'garden', 'drone', 'vinyl']
type Voice = { gain: GainNode; analyser: AnalyserNode; sources: AudioScheduledSourceNode[]; nodes: AudioNode[] }

export class AmbientEngine {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private compressor: DynamicsCompressorNode | null = null
  private masterValue = .55
  private voices = new Map<Layer, Voice>()
  private noise = new Map<NoiseColor, AudioBuffer>()
  async init() {
    if (!this.context) {
      const ctx = new AudioContext()
      this.context = ctx; this.master = ctx.createGain(); this.master.gain.value = this.masterValue
      const compressor = ctx.createDynamicsCompressor()
      compressor.threshold.value = -12; compressor.knee.value = 12; compressor.ratio.value = 3; compressor.attack.value = .02; compressor.release.value = .3
      this.master.connect(compressor); compressor.connect(ctx.destination); this.compressor = compressor
    }
    if (this.context.state === 'suspended') await this.context.resume()
  }
  private create(layer: Layer): Voice {
    const ctx = this.context!, gain = ctx.createGain(), analyser = ctx.createAnalyser()
    gain.gain.value = 0; analyser.fftSize = 256; analyser.smoothingTimeConstant = .86
    gain.connect(analyser); analyser.connect(this.master!)
    const voice: Voice = { gain, analyser, sources: [], nodes: [gain, analyser] }
    const track = <T extends AudioNode>(node: T): T => { voice.nodes.push(node); return node }
    const level = (amount: number, output: AudioNode) => { const node = track(ctx.createGain()); node.gain.value = amount; node.connect(output); return node }
    const filter = (type: BiquadFilterType, frequency: number, output: AudioNode, q = .55) => {
      const node = track(ctx.createBiquadFilter()); node.type = type; node.frequency.value = frequency; node.Q.value = q; node.connect(output); return node
    }
    const loop = (buffer: AudioBuffer, output: AudioNode) => {
      const source = ctx.createBufferSource(); source.buffer = buffer; source.loop = true; source.connect(output); voice.sources.push(source); return source
    }
    const noise = (color: NoiseColor, output: AudioNode) => {
      if (!this.noise.has(color)) this.noise.set(color, noiseBuffer(ctx, color))
      return loop(this.noise.get(color)!, output)
    }
    const modulate = (parameter: AudioParam, frequency: number, depth: number) => {
      const lfo = ctx.createOscillator(), amount = track(ctx.createGain()); lfo.frequency.value = frequency; amount.gain.value = depth
      lfo.connect(amount); amount.connect(parameter); voice.sources.push(lfo)
    }
    if (layer === 'rain') {
      // A wide, airy rain bed plus small scattered drops; no resonant low-pass rumble.
      const air = filter('lowpass', 7800, level(.48, gain))
      noise('white', filter('highpass', 750, air))
      const body = filter('lowpass', 2200, level(.22, gain)); noise('pink', filter('highpass', 300, body))
      modulate(air.frequency, .037, 750)
      loop(textureBuffer(ctx, 'drops'), filter('highpass', 850, level(.65, gain)))
    } else if (layer === 'ocean') {
      const swell = level(.47, gain), cutoff = filter('lowpass', 1550, swell)
      noise('pink', filter('highpass', 95, cutoff))
      modulate(swell.gain, .083, .34); modulate(cutoff.frequency, .083, 900)
      const foam = level(.1, gain); noise('white', filter('highpass', 1700, filter('lowpass', 6500, foam)))
      modulate(foam.gain, .071, .07)
    } else if (layer === 'fire') {
      noise('brown', filter('highpass', 65, filter('lowpass', 600, level(.4, gain))))
      noise('pink', filter('highpass', 700, filter('lowpass', 2400, level(.1, gain))))
      loop(textureBuffer(ctx, 'fire'), filter('lowpass', 4300, level(.85, gain)))
    } else if (layer === 'garden') {
      noise('pink', filter('highpass', 280, filter('lowpass', 1900, level(.09, gain))))
      loop(textureBuffer(ctx, 'insects'), filter('lowpass', 5200, level(.6, gain)))
    } else if (layer === 'vinyl') {
      noise('pink', filter('highpass', 1100, filter('lowpass', 5400, level(.075, gain))))
      loop(textureBuffer(ctx, 'vinyl'), filter('highpass', 650, filter('lowpass', 6000, level(.75, gain))))
    } else {
      // Cmaj9: rounded, quiet fundamentals with tiny detuning and a diffuse stereo tail.
      const tone = filter('lowpass', 1250, gain)
      const reverb = track(ctx.createConvolver()); reverb.buffer = roomImpulse(ctx); reverb.connect(level(.38, tone))
      const frequencies = [130.8128, 195.9977, 261.6256, 293.6648, 329.6276]
      frequencies.forEach((frequency, index) => {
        const pan = track(ctx.createStereoPanner()); pan.pan.value = (index - 2) * .27
        const envelope = level(index === 0 ? .075 : .045, pan); pan.connect(tone); pan.connect(reverb)
        modulate(envelope.gain, .021 + index * .007, .008)
        for (const detune of [-1.8, 1.8]) {
          const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = frequency; osc.detune.value = detune
          osc.connect(envelope); voice.sources.push(osc)
        }
      })
      modulate(tone.frequency, .025, 190)
    }
    voice.sources.forEach(source => source.start())
    this.voices.set(layer, voice); return voice
  }
  setLayer(layer: Layer, volume: number, enabled: boolean) {
    if (!this.context || (!enabled && !this.voices.has(layer))) return
    const voice = this.voices.get(layer) ?? this.create(layer)
    voice.gain.gain.setTargetAtTime(enabled ? volume : 0, this.context.currentTime, layer === 'drone' ? .65 : .25)
  }
  setMaster(value: number) { this.masterValue = value; if (this.context && this.master) this.master.gain.setTargetAtTime(value, this.context.currentTime, .12) }
  getAnalyser(layer: Layer) { return this.voices.get(layer)?.analyser }
  chime() {
    if (!this.context || !this.master) return
    const ctx = this.context
    ;[523.25, 659.25, 783.99].forEach((frequency, index) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain(), start = ctx.currentTime + index * .16
      osc.frequency.value = frequency; gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(.09, start + .02); gain.gain.exponentialRampToValueAtTime(.001, start + 1.4)
      osc.connect(gain); gain.connect(this.master!); osc.start(start); osc.stop(start + 1.5); osc.onended = () => { osc.disconnect(); gain.disconnect() }
    })
  }
  dispose() {
    this.voices.forEach(voice => { voice.sources.forEach(source => { source.stop(); source.disconnect() }); voice.nodes.forEach(node => node.disconnect()) })
    this.voices.clear(); this.noise.clear(); this.master?.disconnect(); this.compressor?.disconnect(); void this.context?.close(); this.context = null; this.master = null; this.compressor = null
  }
}
