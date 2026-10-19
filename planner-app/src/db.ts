import Dexie, { type EntityTable } from 'dexie'
import type { ColorKey } from './colors'

export interface Setting {
  key: string
  value: unknown
}

export interface Category {
  id: string
  name: string
  color: ColorKey
  order: number
  createdAt: number
  sample?: boolean
}

export const db = new Dexie('planner') as Dexie & {
  settings: EntityTable<Setting, 'key'>
  categories: EntityTable<Category, 'id'>
}

db.version(1).stores({
  settings: 'key',
})

db.version(2).stores({
  categories: 'id, order',
})

export function newId() {
  try {
    return crypto.randomUUID()
  } catch {
    return Date.now().toString(36) + Math.random().toString(36).slice(2)
  }
}

// Ask the browser not to evict our data under storage pressure
try {
  navigator.storage?.persist?.().catch(() => {})
} catch {}
