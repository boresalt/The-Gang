import Dexie, { type EntityTable } from 'dexie'

export interface Setting {
  key: string
  value: unknown
}

export const db = new Dexie('planner') as Dexie & {
  settings: EntityTable<Setting, 'key'>
}

db.version(1).stores({
  settings: 'key',
})

// Ask the browser not to evict our data under storage pressure
navigator.storage?.persist?.().catch(() => {})
