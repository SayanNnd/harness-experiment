export type LayerId = 'rain' | 'pad' | 'vinyl' | 'ocean' | 'wind' | 'brown'
export type Levels = Record<LayerId, number>

export const sounds: { id: LayerId; label: string; shortLabel: string; description: string; number: string }[] = [
  { id: 'rain', label: 'Window rain', shortLabel: 'Rain', description: 'Soft rainfall, tiny droplets, a window between you and the world.', number: '01' },
  { id: 'pad', label: 'Warm pad', shortLabel: 'Pad', description: 'A slow, spacious chord. Less hum, more room to think.', number: '02' },
  { id: 'vinyl', label: 'Vinyl texture', shortLabel: 'Vinyl', description: 'A little analog warmth, with gentle dust and quiet imperfections.', number: '03' },
  { id: 'ocean', label: 'Slow ocean', shortLabel: 'Ocean', description: 'Overlapping waves rolling in, then letting go.', number: '04' },
  { id: 'wind', label: 'Open air', shortLabel: 'Wind', description: 'Soft, wandering gusts. An open window for your mind.', number: '05' },
  { id: 'brown', label: 'Brown noise', shortLabel: 'Brown', description: 'A smooth, low-frequency blanket for a busy mind.', number: '06' },
]

export const defaultLevels: Levels = { rain: 65, pad: 38, vinyl: 28, ocean: 55, wind: 35, brown: 45 }
export const silentLevels: Levels = { rain: 0, pad: 0, vinyl: 0, ocean: 0, wind: 0, brown: 0 }
export const presets: { id: string; name: string; subtitle: string; levels: Levels }[] = [
  { id: 'window', name: 'Rainy window', subtitle: 'Somewhere indoors', levels: { rain: 72, pad: 22, vinyl: 28, ocean: 0, wind: 0, brown: 0 } },
  { id: 'night', name: 'Night shift', subtitle: 'The world can wait', levels: { rain: 0, pad: 38, vinyl: 20, ocean: 0, wind: 0, brown: 54 } },
  { id: 'coast', name: 'Coastal quiet', subtitle: 'Nothing on the horizon', levels: { rain: 0, pad: 14, vinyl: 0, ocean: 68, wind: 32, brown: 0 } },
]
