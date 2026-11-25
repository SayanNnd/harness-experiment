import { useEffect, useState } from 'react'
import { Coffee, FastForward, Pause, Play, RotateCcw, Settings2, X, Zap } from 'lucide-react'
import { useTimer, modeNames, type Mode } from '../hooks/useTimer'
import type { SoundEngine } from '../audio/SoundEngine'

const modes: Mode[] = ['focus', 'short', 'long']

export function Timer({ engine }: { engine: SoundEngine }) {
  const timer = useTimer(() => engine.chime())
  const { toggle: toggleTimer, reset: resetTimer } = timer
  const [settings, setSettings] = useState(false)
  const [audioError, setAudioError] = useState(false)
  const toggle = () => {
    void engine.init().catch(() => setAudioError(true))
    timer.toggle()
  }
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      const target = event.target
      if (target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName))) return
      if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return
      if (event.code === 'Space') {
        event.preventDefault()
        void engine.init().catch(() => setAudioError(true))
        toggleTimer()
      }
      if (event.key.toLowerCase() === 'r') resetTimer()
    }
    window.addEventListener('keydown', keydown)
    return () => window.removeEventListener('keydown', keydown)
  }, [engine, toggleTimer, resetTimer])

  const radius = 124
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(1, timer.remaining / (timer.durations[timer.mode] * 60))
  const cycleSession = timer.sessions % 4

  return <section className={`panel timer-panel mode-${timer.mode} ${timer.running ? 'timer-running' : ''}`} aria-label="Pomodoro timer">
    <div className="panel-heading"><div className="eyebrow"><span className="section-index">01 /</span> THE FOCUS CHAMBER</div><button className={`icon-button settings-button ${settings ? 'selected' : ''}`} onClick={() => setSettings(!settings)} aria-label="Timer settings" aria-expanded={settings}>{settings ? <X size={16} /> : <Settings2 size={16} />}</button></div>
    <div className="mode-tabs" role="tablist" aria-label="Timer mode">{modes.map(mode => <button key={mode} role="tab" aria-selected={timer.mode === mode} className={timer.mode === mode ? 'active' : ''} onClick={() => timer.selectMode(mode)}>{modeNames[mode]}</button>)}</div>
    {settings && <div className="duration-settings"><div className="settings-heading"><span>MAKE TIME YOUR OWN</span><span>1–120 MIN</span></div><div className="duration-fields">{modes.map(mode => <label key={mode}>{modeNames[mode]}<div><input aria-label={`${modeNames[mode]} minutes`} type="number" min="1" max="120" value={timer.durations[mode]} onChange={event => timer.editDuration(mode, Number(event.target.value))} /><span>min</span></div></label>)}</div><p>Changing the current mode resets its timer.</p></div>}
    <div className="timer-instrument">
      <span className="dial-coordinate coordinate-top">TIME, WELL SPENT</span>
      <span className="dial-coordinate coordinate-left">STILL / 001</span>
      <span className="dial-coordinate coordinate-right">DEEP WORK</span>
      <div className="timer-ring">
        <div className="ring-aura" aria-hidden="true" />
        <svg viewBox="0 0 340 340" className="dial-svg" aria-hidden="true">
          <defs><linearGradient id="ring-gradient" x1="0" y1="0" x2="1" y2="1"><stop stopColor="var(--ring-light)" /><stop offset="1" stopColor="var(--ring-color)" /></linearGradient><radialGradient id="dial-fill"><stop stopColor="var(--ring-color)" stopOpacity=".035" /><stop offset="1" stopColor="var(--ring-color)" stopOpacity=".005" /></radialGradient></defs>
          <circle cx="170" cy="170" r="146" className="dial-outer" />
          {Array.from({ length: 60 }, (_, i) => <line key={i} x1="170" y1={i % 5 === 0 ? '20' : '23'} x2="170" y2={i % 5 === 0 ? '29' : '27'} transform={`rotate(${i * 6} 170 170)`} className={i % 5 === 0 ? 'dial-tick major' : 'dial-tick'} />)}
          <circle cx="170" cy="170" r="112" fill="url(#dial-fill)" className="dial-inner" />
          <circle className="ring-track" cx="170" cy="170" r={radius} />
          <circle className="ring-progress" cx="170" cy="170" r={radius} transform="rotate(-90 170 170)" stroke="url(#ring-gradient)" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)} />
          <g transform={`rotate(${360 * progress} 170 170)`} className="progress-dot"><circle cx="170" cy="46" r="6" className="progress-dot-halo" /><circle cx="170" cy="46" r="2.8" /></g>
          <g className="dial-orbit"><circle cx="170" cy="24" r="2.2" /><path d="M170 24a146 146 0 0 1 62 14" /></g>
          <path className="dial-cross" d="M13 170h6m-3-3v6m305-3h6m-3-3v6" />
        </svg>
        <div className="timer-center"><div className="timer-state">{timer.mode === 'focus' ? <Zap size={11} /> : <Coffee size={11} />}{timer.running ? (timer.mode === 'focus' ? 'IN YOUR ELEMENT' : 'ROOM TO BREATHE') : 'A MOMENT, JUST FOR YOU'}</div><div className="timer-digits" role="timer" aria-label={`${timer.formatted} remaining`}>{timer.formatted.split(':')[0]}<span>:</span>{timer.formatted.split(':')[1]}</div><p key={timer.mode}>{timer.mode === 'focus' ? 'Nothing else. Just this.' : timer.mode === 'short' ? 'Let your mind wander.' : 'You’ve earned a slower moment.'}</p><div className="center-ornament" aria-hidden="true"><i /><span>✦</span><i /></div></div>
      </div>
    </div>
    <div className="timer-controls"><button className="icon-button control-secondary" aria-label="Reset timer" title="Reset (R)" onClick={timer.reset}><RotateCcw size={17} /></button><button className="primary-button" onClick={toggle}>{timer.running ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}<span>{timer.running ? 'Pause the moment' : timer.mode === 'focus' ? 'Enter your flow' : 'Take your break'}</span><kbd>␣</kbd></button><button className="icon-button control-secondary" aria-label="Skip session" title="Skip session" onClick={timer.skip}><FastForward size={17} /></button></div>
    <div className="session-info"><div className="session-dots" aria-label={`${cycleSession} of 4 focus sessions complete`}>{[0, 1, 2, 3].map(n => <span key={n} className={`${n < cycleSession ? 'complete' : ''} ${n === cycleSession ? 'current' : ''}`} />)}</div><span>ROUND <strong>{String(cycleSession + 1).padStart(2, '0')}</strong><span className="session-slash">/ 04</span></span><span className="session-divider" /><span>{timer.sessions} sessions complete</span></div>
    {audioError && <p className="error-message" role="status">Chime unavailable. Your timer still works.</p>}
    <div className="timer-bottom"><span className="status-dot" /><span>{timer.running ? 'The outside world can wait.' : 'Your next good thing starts here.'}</span><span className="tiny-star">✳</span></div>
  </section>
}
