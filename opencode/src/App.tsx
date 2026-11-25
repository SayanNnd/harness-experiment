import { useEffect, useRef, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, AudioLines, Command, Focus, Keyboard, X } from 'lucide-react'
import { SoundEngine } from './audio/SoundEngine'
import { Mixer, type SoundStatus } from './components/Mixer'
import { Tasks } from './components/Tasks'
import { Timer } from './components/Timer'

function App() {
  const [engine] = useState(() => new SoundEngine())
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [soundStatus, setSoundStatus] = useState<SoundStatus>({ playing: false, name: 'Your own frequency' })
  const closeButton = useRef<HTMLButtonElement>(null)
  const opener = useRef<HTMLElement | null>(null)

  useEffect(() => () => engine.dispose(), [engine])
  useEffect(() => {
    if (!showShortcuts) return
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    closeButton.current?.focus()
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowShortcuts(false)
      if (event.key === 'Tab') { event.preventDefault(); closeButton.current?.focus() }
    }
    window.addEventListener('keydown', dismiss)
    return () => { window.removeEventListener('keydown', dismiss); opener.current?.focus() }
  }, [showShortcuts])

  return <div className={`app-shell ${soundStatus.playing ? 'sound-is-playing' : ''}`}>
    <div className="ambient-light" aria-hidden="true" />
    <header className="site-header">
      <a className="brand" href="." aria-label="Still home"><span className="brand-mark"><Focus size={25} strokeWidth={1.3} /></span>still<span className="brand-period">®</span></a>
      <span className="header-tagline">A quieter kind of productive.</span>
      <div className="header-right"><span className="studio-badge"><span />INDEPENDENT FOCUS STUDIO</span><button className="icon-button keyboard-button" aria-label="Show keyboard shortcuts" aria-haspopup="dialog" onClick={() => setShowShortcuts(true)}><Keyboard size={18} /></button><span className="edition-badge">VOL. 001</span></div>
    </header>
    <main>
      <div className="intro">
        <div className="intro-copy"><div className="workspace-label"><span className="label-rule" />A SMALL ESCAPE FOR A BUSY MIND</div><h1>Less noise.<br className="mobile-break" /> More <em>presence.</em><span className="headline-star" aria-hidden="true">✳</span></h1><p>Your time, your atmosphere. Make a little room for the work that matters.</p></div>
        <div className="intro-side"><div className="intro-orbits" aria-hidden="true"><i /><i /><span>✦</span></div><span>NOT ANOTHER TAB.<br /><strong>A DIFFERENT HEADSPACE.</strong></span><ArrowDownRight size={20} strokeWidth={1} /></div>
      </div>
      <div className="workspace-strip"><span><span className="status-dot" />YOUR SPACE IS READY</span><span className={`now-playing ${soundStatus.playing ? 'active' : ''}`}><AudioLines size={12} />{soundStatus.playing ? soundStatus.name : 'A little quiet before you begin'}<span className="strip-indicator">{soundStatus.playing ? 'LIVE' : 'IDLE'}</span></span></div>
      <div className="dashboard-grid">
        <Timer engine={engine} />
        <Mixer engine={engine} onStatusChange={setSoundStatus} />
        <Tasks />
        <aside className="mindful-card">
          <div className="mindful-copy"><div className="eyebrow"><span className="section-index">A NOTE /</span> TO YOURSELF</div><blockquote>Do less.<br />Be <em>here.</em></blockquote><p>You don’t need to do it all.<br />Just the next thing, with a little care.</p><span className="mindful-signature">Presence over productivity <ArrowUpRight size={12} /></span></div>
          <div className="zen-garden" aria-hidden="true"><div className="zen-rings"><i /><i /><i /><i /><i /><i /><i /></div><span className="zen-stone stone-one" /><span className="zen-stone stone-two" /><span className="zen-stone stone-three" /><span className="garden-caption">FIG. 01 — FIND YOUR CENTER</span><span className="garden-star">✦</span></div>
        </aside>
      </div>
      <footer className="site-footer"><span><Focus size={13} strokeWidth={1.4} />MADE FOR THE IN-BETWEEN.</span><button onClick={() => setShowShortcuts(true)}><Command size={11} />The little shortcuts<ArrowUpRight size={11} /></button><span className="footer-local"><span />ON YOUR DEVICE. OFF THE GRID.</span></footer>
    </main>
    {showShortcuts && <div className="modal-backdrop" onClick={event => { if (event.target === event.currentTarget) setShowShortcuts(false) }}><section className="shortcuts-popover" role="dialog" aria-modal="true" aria-labelledby="shortcut-title"><div className="panel-heading"><span className="eyebrow">A FEW SMALL SHORTCUTS</span><button className="icon-button" ref={closeButton} onClick={() => setShowShortcuts(false)} aria-label="Close shortcuts"><X size={17} /></button></div><h2 id="shortcut-title">Stay in your flow.</h2><p>Start / pause timer <kbd>Space</kbd></p><p>Reset timer <kbd>R</kbd></p><p>Add a task <kbd>Enter</kbd></p><small>Timer shortcuts step aside while you’re typing or using controls.</small></section></div>}
  </div>
}
export default App
