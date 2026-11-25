import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { AudioLines, Headphones, Power, Volume2, VolumeX } from 'lucide-react'
import type { SoundEngine } from '../audio/SoundEngine'
import { defaultLevels, presets, sounds, type LayerId, type Levels } from '../audio/sounds'
import { SoundGlyph } from './SoundGlyph'
import { SoundVisualizer } from './SoundVisualizer'

interface MixState {
  enabled: Record<LayerId, boolean>
  volumes: Levels
  master: number
  muted: boolean
  preset: string | null
}
export interface SoundStatus { playing: boolean; name: string }

export function Mixer({ engine, onStatusChange }: { engine: SoundEngine; onStatusChange: (status: SoundStatus) => void }) {
  const [mix, setMix] = useState<MixState>({
    enabled: { rain: false, pad: false, vinyl: false, ocean: false, wind: false, brown: false },
    volumes: { ...defaultLevels }, master: 60, muted: false, preset: null,
  })
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const [hovered, setHovered] = useState<LayerId | null>(null)
  const latest = useRef(mix)
  const mounted = useRef(true)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])

  const sync = async () => {
    try {
      await engine.init()
      if (!mounted.current) return
      const current = latest.current
      engine.setMaster(current.muted ? 0 : current.master / 100)
      for (const { id } of sounds) engine.setLayer(id, current.enabled[id] ? current.volumes[id] / 100 : 0)
      setReady(true)
      setError('')
    } catch {
      if (mounted.current) { setReady(false); setError('Sound could not start. Check browser audio permissions, then try a switch again.') }
    }
  }
  const update = (next: MixState) => { latest.current = next; setMix(next); void sync() }
  const selectPreset = (id: string) => {
    const preset = presets.find(item => item.id === id)
    if (!preset) return
    const enabled = { ...mix.enabled }
    const volumes = { ...mix.volumes }
    for (const sound of sounds) {
      enabled[sound.id] = preset.levels[sound.id] > 0
      if (enabled[sound.id]) volumes[sound.id] = preset.levels[sound.id]
    }
    update({ ...mix, enabled, volumes, muted: false, preset: id })
  }
  const count = sounds.filter(({ id }) => mix.enabled[id] && mix.volumes[id] > 0).length
  const playing = ready && count > 0 && !mix.muted && mix.master > 0
  const preset = presets.find(item => item.id === mix.preset)
  const name = preset?.name ?? 'Your own frequency'
  useEffect(() => { onStatusChange({ playing, name }) }, [playing, name, onStatusChange])
  const detail = sounds.find(sound => sound.id === hovered)

  return <section className={`panel mixer-panel ${playing ? 'mixer-playing' : ''}`} aria-label="Ambient sound mixer">
    <div className="panel-heading"><div className="eyebrow"><AudioLines size={15} /><span>THE SOUND ROOM</span></div><span className={`live-badge ${playing ? 'live' : ''}`}><span />{playing ? 'ON AIR' : 'OFF AIR'}</span></div>
    <div className="mixer-intro"><div><h2>A world of your own.</h2><p>Build a little distance from the noise.</p></div><span className="stereo-label">STEREO<br /><span>06 CHANNELS</span></span></div>
    <div className="preset-label"><span>PLACES TO BEGIN</span><span>or make your own ↓</span></div>
    <div className="preset-list" aria-label="Soundscape presets">{presets.map(item => <button key={item.id} className={`preset-card ${mix.preset === item.id ? 'selected' : ''}`} aria-pressed={mix.preset === item.id} onClick={() => selectPreset(item.id)}><SoundGlyph id={item.id as 'window' | 'night' | 'coast'} /><span><strong>{item.name}</strong><small>{item.subtitle}</small></span><span className="preset-dot" /></button>)}</div>
    <div className="mixer-channels">{sounds.map(({ id, label, shortLabel, number }) => {
      const active = playing && mix.enabled[id] && mix.volumes[id] > 0
      return <div key={id} className={`channel ${mix.enabled[id] ? 'channel-enabled' : ''} ${active ? 'channel-active' : ''}`} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)} onFocus={() => setHovered(id)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setHovered(null) }}>
        <div className="channel-id"><span>{number}</span><i /></div><SoundGlyph id={id} /><h3>{shortLabel}</h3>
        <SoundVisualizer engine={engine} id={id} active={active} />
        <div className="fader-wrap"><div className="fader-scale" aria-hidden="true">{Array.from({ length: 9 }, (_, i) => <i key={i} />)}</div><input className="vertical-fader" type="range" min="0" max="100" value={mix.volumes[id]} aria-label={`${label} volume`} aria-orientation="vertical" style={{ '--level': `${mix.volumes[id]}%` } as CSSProperties} onChange={event => update({ ...latest.current, volumes: { ...latest.current.volumes, [id]: Number(event.target.value) }, preset: null })} /></div>
        <span className="volume-value">{mix.volumes[id]}<span>%</span></span>
        <button className={`power-toggle ${mix.enabled[id] ? 'on' : ''}`} aria-label={`${mix.enabled[id] ? 'Turn off' : 'Turn on'} ${label}`} aria-pressed={mix.enabled[id]} onClick={() => update({ ...mix, enabled: { ...mix.enabled, [id]: !mix.enabled[id] }, preset: null })}><Power size={12} /><span>{mix.enabled[id] ? 'ON' : 'OFF'}</span></button>
      </div>
    })}</div>
    <div className="sound-caption" aria-live="polite">{detail ? <><strong>{detail.label}</strong><span>— {detail.description}</span></> : <><span className="tiny-star">✦</span><span>Six textures. Infinite ways to disappear for a while.</span></>}</div>
    <div className="master-volume"><button className={`master-mute ${mix.muted ? 'muted' : ''}`} aria-label={mix.muted ? 'Unmute soundscape' : 'Mute soundscape'} aria-pressed={mix.muted} onClick={() => update({ ...mix, muted: !mix.muted })}>{mix.muted ? <VolumeX size={17} /> : <Volume2 size={17} />}</button><label htmlFor="master-volume">MASTER</label><input id="master-volume" type="range" min="0" max="100" value={mix.master} aria-label="Master volume" style={{ '--level': `${mix.master}%` } as CSSProperties} onChange={event => update({ ...mix, master: Number(event.target.value) })} /><span className="master-value">{mix.muted ? 'MUTE' : `${mix.master}%`}</span></div>
    {error && <p className="error-message" role="alert">{error}</p>}
    <div className="mixer-bottom"><span><Headphones size={12} />Headphones on. World off.</span><span className="generated-badge">SYNTHESIZED, NOT STREAMED <span>↗</span></span></div>
  </section>
}
