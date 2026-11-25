import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocalStorage } from './useLocalStorage'

export type Mode = 'focus' | 'short' | 'long'
export type Durations = Record<Mode, number>
export const modeNames: Record<Mode, string> = { focus: 'Focus', short: 'Short break', long: 'Long break' }
const validDurations = (v: unknown): v is Durations => typeof v === 'object' && v !== null && ['focus', 'short', 'long'].every(k => { const n = (v as Record<string, unknown>)[k]; return typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 120 })

export function useTimer(onEnd: () => void) {
  const [durations, setDurations] = useLocalStorage<Durations>('still-durations', { focus: 25, short: 5, long: 15 }, validDurations)
  const [mode, setMode] = useState<Mode>('focus')
  const [remaining, setRemaining] = useState(durations.focus * 60)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const end = useRef<number | null>(null)
  const callback = useRef(onEnd)
  useEffect(() => { callback.current = onEnd }, [onEnd])

  const advance = useCallback((continueRunning: boolean, completed: boolean) => {
    const count = sessions + (mode === 'focus' && completed ? 1 : 0)
    const next: Mode = mode === 'focus' ? (count > 0 && count % 4 === 0 ? 'long' : 'short') : 'focus'
    setSessions(count)
    setMode(next)
    setRemaining(durations[next] * 60)
    end.current = continueRunning ? Date.now() + durations[next] * 60000 : null
    setRunning(continueRunning)
  }, [durations, mode, sessions])

  useEffect(() => {
    if (!running) return
    const tick = () => {
      const left = Math.max(0, Math.ceil(((end.current ?? Date.now()) - Date.now()) / 1000))
      setRemaining(left)
      if (left === 0) { callback.current(); advance(true, true) }
    }
    const interval = window.setInterval(tick, 200)
    document.addEventListener('visibilitychange', tick)
    return () => { clearInterval(interval); document.removeEventListener('visibilitychange', tick) }
  }, [running, advance])

  const toggle = useCallback(() => {
    if (running) {
      setRemaining(Math.max(0, Math.ceil(((end.current ?? Date.now()) - Date.now()) / 1000)))
      end.current = null
    } else end.current = Date.now() + remaining * 1000
    setRunning(value => !value)
  }, [running, remaining])
  const reset = useCallback(() => { setRunning(false); end.current = null; setRemaining(durations[mode] * 60) }, [durations, mode])
  const selectMode = (next: Mode) => { setMode(next); setRunning(false); end.current = null; setRemaining(durations[next] * 60) }
  const editDuration = (key: Mode, value: number) => {
    if (!Number.isInteger(value) || value < 1 || value > 120) return
    setDurations(previous => ({ ...previous, [key]: value }))
    if (mode === key) { setRunning(false); end.current = null; setRemaining(value * 60) }
  }
  const formatted = `${Math.floor(remaining / 60).toString().padStart(2, '0')}:${(remaining % 60).toString().padStart(2, '0')}`
  useEffect(() => { document.title = `${formatted} · ${modeNames[mode]} — Still` }, [formatted, mode])
  return { mode, remaining, running, sessions, durations, formatted, toggle, reset, selectMode, editDuration, skip: () => advance(running, false) }
}
