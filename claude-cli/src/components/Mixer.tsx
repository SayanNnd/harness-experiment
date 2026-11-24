import { AudioLines, CloudRain, Disc3, Flame, MoonStar, Pause, Power, Sparkles, Volume2, VolumeX, Waves } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { layerIds } from '../audio/engine'
import type { AmbientEngine, Layer } from '../audio/engine'
const layers = [
  { id: 'rain' as const, name: 'Window rain', detail: 'Soft patter · open air', icon: CloudRain, number: '01' },
  { id: 'ocean' as const, name: 'Slow tides', detail: 'Rolling surf · sea foam', icon: Waves, number: '02' },
  { id: 'fire' as const, name: 'Hearthside', detail: 'Warm embers · little sparks', icon: Flame, number: '03' },
  { id: 'garden' as const, name: 'Night garden', detail: 'Distant crickets · still air', icon: MoonStar, number: '04' },
  { id: 'drone' as const, name: 'Soft orbit', detail: 'Floating chords · warm space', icon: Sparkles, number: '05' },
  { id: 'vinyl' as const, name: 'Dust & grooves', detail: 'Needle hiss · soft crackles', icon: Disc3, number: '06' },
]
type Mix = Record<Layer, number>
const initialVolumes: Mix = { rain: .55, ocean: .6, fire: .65, garden: .55, drone: .4, vinyl: .4 }
const presets: { name: string; note: string; mix: Partial<Mix> }[] = [
  { name: 'Window seat', note: 'Rain, a record, nowhere to rush.', mix: { rain: .6, vinyl: .35 } },
  { name: 'After hours', note: 'A warm hearth under a quiet sky.', mix: { fire: .6, garden: .38, drone: .25 } },
  { name: 'Coastline', note: 'A long exhale at the edge of the sea.', mix: { ocean: .65, drone: .22 } },
]
function SoundDrawing({ layer }: { layer: Layer }) {
  return <svg className={`sound-drawing drawing-${layer}`} viewBox="0 0 130 64" fill="none" aria-hidden="true">
    {layer === 'rain' && <><path d="M10 54h104M22 54V9h78v45M61 9v45M22 32h78"/><g className="rain-streaks">{[0,1,2,3,4,5,6,7].map(i => <path key={i} d={`m${32 + i * 9} ${13 + i % 3 * 11} -4 9`}/>)}</g><path d="M14 58h100"/></>}
    {layer === 'ocean' && <><circle cx="93" cy="15" r="7"/><g className="ocean-lines"><path d="M-20 36q15-12 30 0t30 0 30 0 30 0 30 0 30 0M-10 45q15-12 30 0t30 0 30 0 30 0 30 0M-20 54q15-12 30 0t30 0 30 0 30 0 30 0 30 0"/></g></>}
    {layer === 'fire' && <><path d="m35 54 52-8M38 46l48 9M32 57h59"/><g className="flame-shape"><path d="M62 48c-30-3-21-20-12-26-1 8 4 8 5 5 7-10 5-16 10-24 1 13 20 21 15 34-2 8-9 12-18 11Z"/><path d="M60 47c-11-4-7-13 0-19 0 5 13 11 5 19"/></g><path className="ember" d="m40 20 1-3m42 5 2-4M57 12l-1-3"/></>}
    {layer === 'garden' && <><path d="M91 6c-12 10-6 23 7 23-17 8-29-12-7-23ZM19 58q7-25-2-31m4 17Q6 42 9 32q11 2 12 12m0 1q17-10 17-22-18 2-17 22M101 60q-4-19 9-28M45 59q5-14 0-24m0 9q16-3 15-15-14 2-15 15"/><g className="garden-specks"><path d="m54 12 2-4 2 4-2 4ZM80 43l2-3 2 3-2 3ZM106 18l2-3 2 3-2 3Z"/></g></>}
    {layer === 'drone' && <g className="orbit-paths"><ellipse cx="65" cy="32" rx="48" ry="15" transform="rotate(-24 65 32)"/><ellipse cx="65" cy="32" rx="48" ry="15" transform="rotate(24 65 32)"/><circle cx="65" cy="32" r="12"/><circle cx="103" cy="15" r="3" fill="currentColor"/><path d="M65 5v6M65 53v6"/></g>}
    {layer === 'vinyl' && <><g className="record-spin"><circle cx="61" cy="32" r="27"/><circle cx="61" cy="32" r="21"/><circle cx="61" cy="32" r="16"/><circle cx="61" cy="32" r="8"/><circle cx="61" cy="32" r="1" fill="currentColor"/><path d="m40 14 7 6m28 25 5 5"/></g><path d="M105 9v25L90 47m-4-1 8 5"/></>}
  </svg>
}
function Visualizer({ engine, layer, enabled }: { engine: AmbientEngine; layer: Layer; enabled: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!enabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { ref.current?.querySelectorAll<HTMLElement>('i').forEach(bar => { bar.style.transform = 'scaleY(.08)' }); return }
    let frame = 0; const samples = new Uint8Array(128)
    const bars = ref.current?.querySelectorAll<HTMLElement>('i')
    const draw = () => {
      engine.getAnalyser(layer)?.getByteFrequencyData(samples)
      bars?.forEach((bar, index) => { const bin = Math.min(127, Math.round(Math.pow(index / 15, 1.8) * 100)); bar.style.transform = `scaleY(${Math.max(.08, samples[bin] / 255)})` })
      frame = requestAnimationFrame(draw)
    }
    draw(); return () => cancelAnimationFrame(frame)
  }, [enabled, engine, layer])
  return <div className={`visualizer ${enabled ? 'enabled' : ''}`} ref={ref} aria-hidden="true">{Array.from({ length: 16 }, (_, i) => <i key={i}/>)}</div>
}
export default function Mixer({ engine, reportError, onActivityChange }: { engine: AmbientEngine; reportError: (message: string) => void; onActivityChange: (active: boolean) => void }) {
  const [volumes, setVolumes] = useState<Mix>(initialVolumes)
  const [enabled, setEnabled] = useState<Record<Layer, boolean>>({ rain: false, ocean: false, fire: false, garden: false, drone: false, vinyl: false })
  const [master, setMaster] = useState(.55), [muted, setMuted] = useState(false), [preset, setPreset] = useState<string | null>(null), [busy, setBusy] = useState(false)
  const busyRef = useRef(false)
  const activeCount = Object.values(enabled).filter(Boolean).length
  useEffect(() => { onActivityChange(activeCount > 0 && !muted && master > 0) }, [activeCount, muted, master, onActivityChange])
  const activate = async (action: () => void) => {
    if (busyRef.current) return
    busyRef.current = true; setBusy(true)
    try { await engine.init(); engine.setMaster(muted ? 0 : master); action() }
    catch { reportError('Audio could not start. Check your browser’s audio permissions and try again.') }
    finally { busyRef.current = false; setBusy(false) }
  }
  const stopAll = () => { layerIds.forEach(id => engine.setLayer(id, volumes[id], false)); setEnabled({ rain: false, ocean: false, fire: false, garden: false, drone: false, vinyl: false }); setPreset(null) }
  const applyPreset = (item: typeof presets[number]) => void activate(() => {
    const nextVolumes = { ...volumes, ...item.mix }
    const nextEnabled = { ...enabled }
    layerIds.forEach(id => { nextEnabled[id] = item.mix[id] !== undefined; engine.setLayer(id, nextVolumes[id], nextEnabled[id]) })
    setVolumes(nextVolumes); setEnabled(nextEnabled); setPreset(item.name); setMuted(false); engine.setMaster(master)
  })
  return <section className={`panel mixer-panel ${activeCount ? 'mixer-playing' : ''}`} aria-label="Ambient sound mixer">
    <header className="panel-header"><span className="eyebrow">02 / THE SOUND DESK</span><span className="audio-status"><span className={activeCount && !muted ? 'tiny-dot live' : 'tiny-dot'}/>{activeCount ? `${activeCount} LAYER${activeCount > 1 ? 'S' : ''} IN THE ROOM` : 'WAITING FOR YOUR MOOD'}</span></header>
    <div className="mixer-title"><div><h2>A place you can <em>hear.</em></h2><p>Build a world. Leave the noise outside.</p></div><AudioLines size={27} strokeWidth={1}/></div>
    <div className="preset-row"><span>TAKE ME TO</span>{presets.map(item => <button key={item.name} disabled={busy} aria-pressed={preset === item.name} title={item.note} onClick={() => applyPreset(item)}>{item.name}<span>↗</span></button>)}</div>
    <div className="sound-channels">{layers.map(({ id, name, detail, icon: Icon, number }) => <div className={`sound-channel sound-${id} ${enabled[id] ? 'channel-active' : ''}`} key={id}>
      <div className="channel-top"><span className="channel-number">{number}</span><button disabled={busy} className="power-button" aria-label={`${enabled[id] ? 'Turn off' : 'Turn on'} ${name}`} aria-pressed={enabled[id]} onClick={() => void activate(() => { const next = !enabled[id]; engine.setLayer(id, volumes[id], next); setEnabled(value => ({ ...value, [id]: next })); setPreset(null) })}><Power size={12}/></button></div>
      <div className="sound-scene"><SoundDrawing layer={id}/><div className="fader-area"><input className="vertical-fader" type="range" aria-label={`${name} volume`} min="0" max="100" value={Math.round(volumes[id] * 100)} onChange={event => { const volume = Number(event.target.value) / 100; setVolumes(value => ({ ...value, [id]: volume })); engine.setLayer(id, volume, enabled[id]); setPreset(null) }}/></div></div>
      <div className="sound-name"><Icon size={12}/><h3>{name}</h3><span className="volume-value">{Math.round(volumes[id] * 100)}<span>%</span></span></div><p>{detail}</p><Visualizer engine={engine} layer={id} enabled={enabled[id] && !muted && master > 0}/>
    </div>)}</div>
    <div className="master-volume"><button className="icon-button" aria-label={muted ? 'Unmute master' : 'Mute master'} onClick={() => { engine.setMaster(muted ? master : 0); setMuted(!muted) }}>{muted ? <VolumeX size={17}/> : <Volume2 size={17}/>}</button><label htmlFor="master">Room volume</label><input id="master" type="range" min="0" max="100" value={Math.round(master * 100)} onChange={event => { const volume = Number(event.target.value) / 100; setMaster(volume); engine.setMaster(muted ? 0 : volume) }}/><span>{Math.round(master * 100)}%</span><button className="stop-all" disabled={!activeCount} onClick={stopAll} aria-label="Stop all sounds"><Pause size={12}/><span>All off</span></button></div>
    <div className="mixer-foot"><span className="tiny-dot"/>{preset ? presets.find(item => item.name === preset)?.note : 'Six little worlds. Made live, right here on your device.'}</div>
  </section>
}
