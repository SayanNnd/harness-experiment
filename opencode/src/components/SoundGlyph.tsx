import type { LayerId } from '../audio/sounds'

export function SoundGlyph({ id }: { id: LayerId | 'window' | 'night' | 'coast' }) {
  return <svg viewBox="0 0 64 44" fill="none" aria-hidden="true" className={`sound-glyph glyph-${id}`}>
    {id === 'rain' && <><path d="M10 15h44M16 10l-4 9m17-9-4 9m17-9-4 9m17-9-4 9" opacity=".35" /><g className="rain-lines"><path d="m16 24-3 8m15-10-4 11m17-10-4 10m16-9-3 8" /></g></>}
    {id === 'pad' && <><ellipse cx="32" cy="22" rx="23" ry="8" transform="rotate(-25 32 22)" /><ellipse cx="32" cy="22" rx="23" ry="8" transform="rotate(25 32 22)" opacity=".5" /><circle cx="32" cy="22" r="3" fill="currentColor" stroke="none" /></>}
    {id === 'vinyl' && <><circle cx="32" cy="22" r="17" /><circle cx="32" cy="22" r="12" opacity=".5" /><circle cx="32" cy="22" r="6" opacity=".35" /><circle cx="32" cy="22" r="2" fill="currentColor" stroke="none" /><path d="m46 6-5 14h-5" /></>}
    {id === 'ocean' && <>{[12, 22, 32].map((y, i) => <path key={y} d={`M7 ${y}c8-9 17 9 25 0s17 9 25 0`} opacity={1 - i * 0.23} />)}</>}
    {id === 'wind' && <><path d="M7 16h35c12 0 12-13 3-13M14 23h35c11 0 11 13 2 13M8 30h23c9 0 9 10 2 10" /><path d="M17 9h15M4 23h4" opacity=".4" /></>}
    {id === 'brown' && <>{[9, 17, 25, 33, 41, 49, 57].map((x, i) => <path key={x} d={`M${x} ${18 - Math.sin(i * 1.3) * 9}v${10 + Math.sin(i * 1.3) * 18}`} opacity={0.4 + i * 0.08} />)}</>}
    {id === 'window' && <><rect x="16" y="4" width="32" height="35" rx="2" /><path d="M32 4v35M16 23h32M12 40h40" opacity=".5" /><path className="rain-lines" d="m23 11-2 5m20-5-2 5m-15 15-2 4m19-5-2 4" /></>}
    {id === 'night' && <><path d="M40 5a16 16 0 1 0 9 24A16 16 0 0 1 40 5Z" /><path d="M51 5v7m-3-3h6M17 7v5m-2-2h5M51 33v6m-3-3h6" opacity=".5" /></>}
    {id === 'coast' && <><path d="M7 28h50M9 35c8-6 14 6 22 0s14 6 23 0" opacity=".6" /><path d="M21 23a11 11 0 0 1 22 0M32 3v4M12 11l4 4m32-4-4 4" /></>}
  </svg>
}
