import { useEffect, useState } from 'react'
export function useLocalStorage<T>(key: string, fallback: T, validate: (value: unknown) => value is T) {
  const [value, setValue] = useState<T>(() => {
    try { const raw = localStorage.getItem(key); if (raw) { const parsed: unknown = JSON.parse(raw); if (validate(parsed)) return parsed } } catch { /* Storage can be unavailable in private browsing. */ }
    return fallback
  })
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* Keep the workspace usable when storage is full. */ } }, [key, value])
  return [value, setValue] as const
}
