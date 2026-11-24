import { ArrowRight, Coffee, Maximize2, Pause, Play, RotateCcw, Settings2, SkipForward, X } from 'lucide-react'
import { useState } from 'react'
import RoomArt from './RoomArt'
import { modeLabels } from '../hooks/useTimer'
import type { Durations, Mode, useTimer } from '../hooks/useTimer'
type Props = { timer: ReturnType<typeof useTimer>; durations: Durations; setDurations: (value: Durations) => void; onToggle: () => void }
export default function Timer({ timer, durations, setDurations, onToggle }: Props) {
  const [settings, setSettings] = useState(false), [expanded, setExpanded] = useState(false)
  return <section className={`panel timer-panel ${expanded ? 'expanded' : ''}`} aria-label="Pomodoro timer">
    <header className="panel-header"><span className="eyebrow"><span className="tiny-dot" /> 01 / A MOMENT, UNDIVIDED</span><div className="icon-group"><button className="icon-button" onClick={() => setSettings(!settings)} aria-label="Timer settings" aria-expanded={settings}>{settings ? <X size={17}/> : <Settings2 size={17}/>}</button><button className="icon-button" onClick={() => setExpanded(!expanded)} aria-label={expanded ? 'Exit expanded timer' : 'Expand timer'}><Maximize2 size={16}/></button></div></header>
    <RoomArt active={timer.running}/>
    <div className="timer-intro"><span className="handwritten">a little less rush,</span><h2>a little more <em>here.</em></h2></div>
    <div className="mode-tabs" role="group" aria-label="Timer mode">{(Object.keys(modeLabels) as Mode[]).map(mode => <button aria-pressed={timer.mode === mode} key={mode} onClick={() => timer.selectMode(mode)} className={timer.mode === mode ? 'active' : ''}>{modeLabels[mode]}</button>)}</div>
    {settings && <div className="timer-settings">{(Object.keys(modeLabels) as Mode[]).map(mode => <label key={mode}>{modeLabels[mode]}<div><input aria-label={`${modeLabels[mode]} minutes`} type="number" min="1" max="180" value={durations[mode]} onChange={event => { const value = Number(event.target.value); if (Number.isInteger(value) && value >= 1 && value <= 180) setDurations({ ...durations, [mode]: value }) }}/><span>min</span></div></label>)}</div>}
    <div className={`timer-ring mode-${timer.mode} ${timer.running ? 'is-running' : ''}`}>
      <svg className="dial-ticks" viewBox="0 0 360 360" aria-hidden="true">{Array.from({ length: 60 }, (_, index) => <line key={index} x1="180" y1={index % 5 === 0 ? '6' : '10'} x2="180" y2="17" transform={`rotate(${index * 6} 180 180)`} className={index % 5 === 0 ? 'major-tick' : ''}/>)}</svg>
      <svg className="ring-svg" viewBox="0 0 320 320" aria-hidden="true"><circle className="ring-track" cx="160" cy="160" r="146"/><circle className="ring-progress" cx="160" cy="160" r="146" strokeDasharray={917.35} strokeDashoffset={917.35 * (1 - timer.progress)}/></svg>
      <div className="timer-face"><span className="timer-status">{timer.mode === 'focus' ? 'TIME TO FOCUS' : 'TAKE A BREATHER'}</span><span className="timer-digits" role="timer" aria-label={`${timer.time} remaining`}>{timer.time}</span><span className="timer-caption">{timer.running ? 'One thing at a time. You’ve got this.' : timer.mode === 'focus' ? 'Less noise. More meaningful work.' : 'A little pause goes a long way.'}</span><div className="ring-divider"/><span className="session-in-ring">SESSION {timer.sessions % 4 + 1} <span>/ 4</span></span></div>
    </div>
    <div className="timer-controls"><button className="icon-button reset-button" title="Reset (R)" aria-label="Reset timer" onClick={timer.reset}><RotateCcw size={19}/></button><button className="primary-button" onClick={onToggle}>{timer.running ? <Pause size={17} fill="currentColor"/> : <Play size={17} fill="currentColor"/>}{timer.running ? 'Pause session' : 'Start session'}<kbd>space</kbd></button><button className="icon-button reset-button" title="Skip session" aria-label="Skip session" onClick={timer.skip}><SkipForward size={19}/></button></div>
    <div className="session-row"><div className="session-dots">{[0,1,2,3].map(index => <span key={index} className={index < timer.sessions % 4 ? 'completed' : index === timer.sessions % 4 ? 'current' : ''}/>)}</div><span>Long break after 4 sessions</span><Coffee size={14}/></div>
    <div className="timer-bottom"><span><span className={`status-dot ${timer.running ? 'live' : ''}`}/>{timer.running ? 'Deep work in progress' : 'Your next great idea starts here'}</span><ArrowRight size={15}/></div>
  </section>
}
