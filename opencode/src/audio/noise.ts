export type NoiseColor = 'white' | 'pink' | 'brown'

export function createNoise(length: number, color: NoiseColor, random: () => number = Math.random): Float32Array<ArrayBuffer> {
  const samples = new Float32Array(length)
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
  let brown = 0
  let sum = 0
  for (let i = 0; i < length; i++) {
    const white = random() * 2 - 1
    let value = white
    if (color === 'pink') {
      b0 = 0.99886 * b0 + white * 0.0555179
      b1 = 0.99332 * b1 + white * 0.0750759
      b2 = 0.969 * b2 + white * 0.153852
      b3 = 0.8665 * b3 + white * 0.3104856
      b4 = 0.55 * b4 + white * 0.5329522
      b5 = -0.7616 * b5 - white * 0.016898
      value = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
      b6 = white * 0.115926
    } else if (color === 'brown') {
      brown = (brown + white * 0.02) / 1.02
      value = brown * 3.5
    }
    samples[i] = value
    sum += value
  }
  const mean = sum / Math.max(1, length)
  let peak = 0
  for (let i = 0; i < length; i++) {
    samples[i] -= mean
    peak = Math.max(peak, Math.abs(samples[i]))
  }
  if (peak > 0) for (let i = 0; i < length; i++) samples[i] *= 0.95 / peak
  return samples
}

export function smoothLoop(samples: Float32Array, fadeLength: number) {
  const fade = Math.min(fadeLength, Math.floor(samples.length / 2))
  if (fade < 2) return
  const last = samples.length - 1
  const seam = (samples[0] + samples[last]) / 2
  const startCorrection = seam - samples[0]
  const endCorrection = seam - samples[last]
  for (let i = 0; i < fade; i++) {
    const weight = (1 + Math.cos(Math.PI * i / (fade - 1))) / 2
    samples[i] += startCorrection * weight
    samples[last - i] += endCorrection * weight
  }
}
