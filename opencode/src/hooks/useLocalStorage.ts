import { useEffect, useState } from 'react'

export function useLocalStorage<T>(key: string, initial: T, validate: (value: unknown) => value is T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(key) ?? 'null')
      return validate(saved) ? saved : initial
    } catch { return initial }
  })
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* Storage may be unavailable in private browsing. */ }
  }, [key, value])
  return [value, setValue] as const
}
