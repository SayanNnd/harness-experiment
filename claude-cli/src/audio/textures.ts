export type NoiseColor = 'white' | 'pink' | 'brown'

/** Independent stereo noise, with a short wrap crossfade to remove loop-edge clicks. */
export function noiseBuffer(ctx: BaseAudioContext, color: NoiseColor, seconds = 19): AudioBuffer {
  const buffer = ctx.createBuffer(2, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate)
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel)
    let b0 = 0, b1 = 0, b2 = 0, brown = 0
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1
      b0 = .99765 * b0 + white * .099046
      b1 = .963 * b1 + white * .2965164
      b2 = .57 * b2 + white * 1.0526913
      brown = (brown + .02 * white) / 1.02
      data[i] = color === 'white' ? white * .35 : color === 'brown' ? brown * 3.5 : (b0 + b1 + b2 + white * .1848) * .075
    }
    smoothWrap(data, 2048)
  }
  const seamless = ctx.createBuffer(2, buffer.length - 2048, ctx.sampleRate)
  for (let channel = 0; channel < 2; channel++) seamless.getChannelData(channel).set(buffer.getChannelData(channel).subarray(2048))
  return seamless
}

function smoothWrap(data: Float32Array, count: number) {
  const end = data.length - count
  for (let i = 0; i < count; i++) {
    const mix = i / count
    data[end + i] = data[end + i] * (1 - mix) + data[i] * mix
  }
  // Playback omits the source head; the blended tail meets the next sample after it.
}

/** Soft, finite transients rather than single-sample digital clicks. */
export function textureBuffer(ctx: BaseAudioContext, kind: 'drops' | 'fire' | 'vinyl' | 'insects'): AudioBuffer {
  const rate = ctx.sampleRate, seconds = 31, buffer = ctx.createBuffer(2, rate * seconds, rate)
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel)
    if (kind === 'insects') {
      // Three distant cricket voices: staggered chirp groups with rounded envelopes.
      for (let voice = 0; voice < 3; voice++) {
        const frequency = 2700 + voice * 490 + channel * 23
        for (let time = .4 + voice * .61; time < seconds - .4; time += 1.7 + voice * .59 + Math.random() * .8) {
          const chirps = 3 + Math.floor(Math.random() * 4)
          for (let chirp = 0; chirp < chirps; chirp++) {
            const start = Math.floor((time + chirp * .075) * rate), length = Math.floor(rate * .036)
            for (let j = 0; j < length && start + j < data.length; j++) {
              const envelope = Math.sin(Math.PI * j / length) ** 2
              data[start + j] += Math.sin(2 * Math.PI * frequency * j / rate) * envelope * .045 / (voice + 1)
            }
          }
        }
      }
    } else {
      const events = kind === 'drops' ? 1100 : kind === 'fire' ? 470 : 170
      for (let event = 0; event < events; event++) {
        const start = Math.floor((.1 + Math.random() * (seconds - .5)) * rate)
        const duration = kind === 'drops' ? .008 + Math.random() * .025 : kind === 'fire' ? .012 + Math.random() * .09 : .001 + Math.random() * .004
        const length = Math.floor(duration * rate), amplitude = Math.random() ** 2 * (kind === 'fire' ? .38 : kind === 'drops' ? .12 : .16)
        const frequency = kind === 'drops' ? 1100 + Math.random() * 3400 : 250 + Math.random() * 1800
        for (let j = 0; j < length && start + j < data.length; j++) {
          const envelope = Math.min(1, j / (rate * .0008)) * Math.exp(-j / (length * .2))
          const tone = kind === 'drops' ? Math.sin(2 * Math.PI * frequency * j / rate) * .3 : 0
          data[start + j] += ((Math.random() * 2 - 1) + tone) * envelope * amplitude
        }
      }
    }
  }
  return buffer
}

export function roomImpulse(ctx: BaseAudioContext): AudioBuffer {
  const buffer = noiseBuffer(ctx, 'white', 3.2)
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel)
    for (let i = 0; i < data.length; i++) data[i] *= Math.exp(-i / (ctx.sampleRate * .48)) * Math.min(1, i / 350)
  }
  return buffer
}
