import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'

export type Theme = 'system' | 'light' | 'dark'

export function useSetting<T>(key: string, fallback: T): T {
  const row = useLiveQuery(() => db.settings.get(key), [key])
  return row === undefined ? fallback : (row.value as T)
}

export function setSetting(key: string, value: unknown) {
  return db.settings.put({ key, value })
}
