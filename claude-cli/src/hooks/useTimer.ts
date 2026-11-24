import { useCallback, useEffect, useRef, useState } from 'react'
export type Mode = 'focus' | 'short' | 'long'
export type Durations = Record<Mode, number>
export const modeLabels: Record<Mode, string> = { focus: 'Focus', short: 'Short break', long: 'Long break' }
export function useTimer(durations: Durations, onComplete: () => void) {
  const [mode, setMode] = useState<Mode>('focus'), [remaining, setRemaining] = useState(durations.focus * 60), [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0), [focusSeconds, setFocusSeconds] = useState(0)
  const end = useRef<number | null>(null), remainingRef = useRef(remaining), completion = useRef(onComplete)
  completion.current = onComplete; remainingRef.current = remaining
  const advance = useCallback((finished: boolean) => {
    const count = mode === 'focus' && finished ? sessions + 1 : sessions
    if (mode === 'focus' && finished) { setSessions(count); setFocusSeconds(value => value + durations.focus * 60) }
    const next: Mode = mode === 'focus' ? (count > 0 && count % 4 === 0 ? 'long' : 'short') : 'focus'
    setMode(next); setRemaining(durations[next] * 60); end.current = running ? Date.now() + durations[next] * 60000 : null
  }, [durations, mode, running, sessions])
  useEffect(() => {
    if (!running) return
    const tick = () => {
      const seconds = Math.max(0, Math.ceil(((end.current ?? Date.now()) - Date.now()) / 1000))
      setRemaining(seconds)
      if (seconds === 0) { completion.current(); advance(true) }
    }
    tick(); const interval = window.setInterval(tick, 200); return () => clearInterval(interval)
  }, [running, advance])
  const toggle = useCallback(() => {
    if (running) { const next = Math.max(0, Math.ceil(((end.current ?? Date.now()) - Date.now()) / 1000)); setRemaining(next); end.current = null }
    else end.current = Date.now() + remainingRef.current * 1000
    setRunning(value => !value)
  }, [running])
  const reset = useCallback(() => { setRunning(false); end.current = null; setRemaining(durations[mode] * 60) }, [durations, mode])
  const selectMode = (next: Mode) => { setMode(next); setRunning(false); end.current = null; setRemaining(durations[next] * 60) }
  useEffect(() => { if (!running) setRemaining(durations[mode] * 60) }, [durations, mode])
  const time = `${Math.floor(remaining / 60).toString().padStart(2, '0')}:${(remaining % 60).toString().padStart(2, '0')}`
  useEffect(() => { document.title = `${time} · ${modeLabels[mode]} — Stillroom` }, [time, mode])
  return { mode, remaining, running, sessions, focusSeconds, time, toggle, reset, selectMode, skip: () => advance(false), progress: remaining / (durations[mode] * 60) }
}
