import { useEffect, useRef } from 'react'
import type { SoundEngine, LayerId } from '../audio/SoundEngine'

export function SoundVisualizer({ engine, id, active }: { engine: SoundEngine; id: LayerId; active: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const bars = Array.from(ref.current?.querySelectorAll<HTMLElement>('i') ?? [])
    const data = new Uint8Array(128)
    let frame = 0
    let last = 0
    const render = (time = 0) => {
      if (time - last > 40 || !last) {
        last = time
        const analyser = engine.analyser(id)
        if (analyser && active) analyser.getByteTimeDomainData(data)
        let energy = 0
        if (analyser && active) {
          for (const value of data) energy += ((value - 128) / 128) ** 2
          energy = Math.sqrt(energy / data.length)
        }
        bars.forEach((bar, index) => {
          const sample = active && analyser ? Math.abs((data[index * 5] - 128) / 128) : 0
          const height = active && analyser ? Math.min(1, 0.1 + sample * 4 + energy * 2) : 0.08 + Math.sin(index * 1.1) ** 2 * 0.07
          bar.style.transform = `scaleY(${height})`
        })
      }
      if (active && !media.matches) frame = requestAnimationFrame(render)
    }
    const restart = () => { cancelAnimationFrame(frame); render() }
    media.addEventListener('change', restart)
    render()
    return () => { cancelAnimationFrame(frame); media.removeEventListener('change', restart) }
  }, [engine, id, active])
  return <div className={`visualizer ${active ? 'is-active' : ''}`} ref={ref} aria-hidden="true">{Array.from({ length: 22 }, (_, index) => <i key={index} />)}</div>
}
