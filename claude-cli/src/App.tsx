import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Check, CheckCheck, Clock3, Command, Leaf, Moon, Sparkles, X } from 'lucide-react'
import { AmbientEngine } from './audio/engine'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useTimer } from './hooks/useTimer'
import type { Durations } from './hooks/useTimer'
import Timer from './components/Timer'
import Mixer from './components/Mixer'
import Tasks from './components/Tasks'
const validDurations = (value: unknown): value is Durations => typeof value === 'object' && value !== null && ['focus', 'short', 'long'].every(key => { const item = (value as Record<string, unknown>)[key]; return typeof item === 'number' && Number.isInteger(item) && item >= 1 && item <= 180 })
export default function App() {
  const [engine] = useState(() => new AmbientEngine()), [error, setError] = useState(''), [help, setHelp] = useState(false), [soundActive, setSoundActive] = useState(false)
  const [durations, setDurations] = useLocalStorage<Durations>('stillroom.durations', { focus: 25, short: 5, long: 15 }, validDurations)
  const timer = useTimer(durations, () => engine.chime())
  const timerRef = useRef(timer); timerRef.current = timer
  const toggle = () => {
    timerRef.current.toggle()
    void engine.init().catch(() => setError('Audio is unavailable. Your timer will still work.'))
  }
  const toggleRef = useRef(toggle); toggleRef.current = toggle
  useEffect(() => () => engine.dispose(), [engine])
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      const target = event.target
      if (target instanceof HTMLElement && (target.closest('input, textarea, select, button, [contenteditable="true"]') || event.ctrlKey || event.metaKey || event.altKey)) return
      if (event.code === 'Space' && !event.repeat) { event.preventDefault(); void toggleRef.current() }
      if (event.key.toLowerCase() === 'r') timerRef.current.reset()
      if (event.key === 'Escape') setHelp(false)
    }
    window.addEventListener('keydown', keydown); return () => window.removeEventListener('keydown', keydown)
  }, [])
  useEffect(() => {
    if (!help) return
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setHelp(false)
      if (event.key === 'Tab') {
        const buttons = document.querySelectorAll<HTMLButtonElement>('.help-dialog button')
        const first = buttons[0], last = buttons[buttons.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      }
    }
    const previous = document.activeElement
    document.addEventListener('keydown', close)
    return () => { document.removeEventListener('keydown', close); if (previous instanceof HTMLElement) previous.focus() }
  }, [help])
  return <div className={`app-shell ${timer.running ? 'focus-active' : ''} ${soundActive ? 'sound-active' : ''}`}><div className="ambient-light" aria-hidden="true"/><header className="topbar"><a href="./" className="brand" aria-label="Stillroom home"><span className="brand-mark"><i/><i/><i/><i/></span>stillroom<span className="brand-period">.</span></a><span className="topbar-tagline">A little space for deep work.</span><div className="topbar-right"><span className="local-badge"><span className="tiny-dot"/> YOUR PERSONAL WORKSPACE</span><span className="topbar-divider"/><button className="icon-button" aria-label="Show keyboard shortcuts" onClick={() => setHelp(!help)}><Command size={17}/></button><Moon size={17} className="moon-icon"/></div></header>
    <main><div className="page-heading"><div><div className="intro-eyebrow"><span/> AN ONLINE SPACE TO GO A LITTLE OFFLINE.</div><h1>Good things take <span>quiet.</span><span className="heading-star" aria-hidden="true">✳</span></h1><p>Settle in. Find your sound. Give one good thing your full attention.</p></div><div className="workspace-badge"><div className="room-stamp"><Leaf size={22} strokeWidth={1}/><span>EST. RIGHT NOW</span></div><div className="room-label"><span>YOUR QUIET CORNER</span><span>Nothing to prove. Just room to make.</span></div></div></div>
    {error && <div className="error-banner" role="alert">{error}<button className="icon-button" aria-label="Dismiss message" onClick={() => setError('')}><X size={15}/></button></div>}
    <div className="dashboard-grid"><Timer timer={timer} durations={durations} setDurations={setDurations} onToggle={() => void toggle()}/><Mixer engine={engine} reportError={setError} onActivityChange={setSoundActive}/><Tasks/><section className="panel progress-panel" aria-label="This visit's progress"><div className="progress-heading"><span className="eyebrow">LITTLE BY LITTLE, A LOT GETS DONE.</span><Sparkles size={15}/></div><div className="stats"><div><div className="stat-label"><Clock3 size={14}/> Focus time</div><div className="stat-number">{Math.floor(timer.focusSeconds / 60)}<span>min</span></div></div><span className="stat-divider"/><div><div className="stat-label"><CheckCheck size={15}/> Sessions</div><div className="stat-number">{timer.sessions}<span>completed</span></div></div></div><div className="progress-bottom"><span className="leaf-circle"><Leaf size={16}/></span><p>{timer.sessions ? 'Look at you, making meaningful progress.' : 'Showing up is the first step. You’re already here.'}</p><Check size={13}/></div></section></div>
    <aside className="quote-strip"><span className="quote-mark">“</span><p>You don’t have to see the whole staircase. Just take the first step.</p><span className="quote-author">ONE MOMENT AT A TIME</span></aside>
    <footer className="footer"><span><span className="tiny-dot"/> A quieter corner of the internet.</span><span className="footer-shortcuts"><kbd>space</kbd> start / pause <span>·</span><kbd>R</kbd> reset</span><button onClick={() => setHelp(true)}>Stay in your flow<ArrowUpRight size={13}/></button></footer></main>
    {help && <div className="modal-backdrop" onClick={() => setHelp(false)}><section className="panel help-dialog" role="dialog" aria-modal="true" aria-labelledby="help-title" onClick={event => event.stopPropagation()}><button autoFocus className="icon-button close-help" aria-label="Close keyboard shortcuts" onClick={() => setHelp(false)}><X size={18}/></button><Command size={24}/><h2 id="help-title">A few quiet shortcuts</h2><p><kbd>space</kbd> Start or pause your session</p><p><kbd>R</kbd> Reset the current timer</p><p><kbd>↵</kbd> Add a task while typing</p><p className="help-note">Your tasks and timer settings stay in this browser. Sound is generated on your device, and starts only when you choose it.</p><button className="primary-button" onClick={() => setHelp(false)}>Back to my space<ArrowUpRight size={15}/></button></section></div>}
  </div>
}
