import assert from 'node:assert/strict'
import { test } from 'node:test'

import * as noise from '../src/audio/noise.ts'
import * as catalog from '../src/audio/sounds.ts'

function random() {
  let seed = 42
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296 }
}

test('colored noise produces finite, nonconstant, bounded, DC-free samples', () => {
  assert.equal(typeof noise.createNoise, 'function', 'createNoise must exist')
  for (const color of ['white', 'pink', 'brown']) {
    const samples = noise.createNoise(48000, color, random())
    assert.equal(samples.length, 48000)
    assert.ok(samples.every(value => Number.isFinite(value) && Math.abs(value) <= 1))
    const mean = samples.reduce((sum, value) => sum + value, 0) / samples.length
    assert.ok(Math.abs(mean) < 0.00001, `${color} has DC offset`)
    assert.ok(samples.some(value => Math.abs(value) > 0.1))
  }
})

test('pink and brown noise are progressively smoother than white noise', () => {
  assert.equal(typeof noise.createNoise, 'function')
  const roughness = color => {
    const samples = noise.createNoise(48000, color, random())
    return samples.slice(1).reduce((sum, value, i) => sum + Math.abs(value - samples[i]), 0)
  }
  assert.ok(roughness('white') > roughness('pink'))
  assert.ok(roughness('pink') > roughness('brown'))
})

test('loop smoothing removes the wrap discontinuity without silencing the buffer', () => {
  assert.equal(typeof noise.smoothLoop, 'function', 'smoothLoop must exist')
  const samples = Float32Array.from({ length: 4096 }, (_, i) => Math.sin(i * 0.01) + 0.2)
  noise.smoothLoop(samples, 256)
  assert.ok(Math.abs(samples[0] - samples.at(-1)) < 0.000001)
  assert.ok(samples.some(value => Math.abs(value) > 0.1))
})

test('six sounds and three presets expose valid complete gain maps', () => {
  assert.ok(Array.isArray(catalog.sounds), 'sound catalog must exist')
  const ids = catalog.sounds.map(sound => sound.id)
  assert.deepEqual(ids, ['rain', 'pad', 'vinyl', 'ocean', 'wind', 'brown'])
  assert.equal(catalog.presets.length, 3)
  for (const preset of catalog.presets) {
    assert.deepEqual(Object.keys(preset.levels).sort(), [...ids].sort())
    assert.ok(Object.values(preset.levels).every(value => Number.isFinite(value) && value >= 0 && value <= 100))
    assert.ok(Object.values(preset.levels).filter(value => value > 0).length >= 2)
  }
})
