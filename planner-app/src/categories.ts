import { useLiveQuery } from 'dexie-react-hooks'
import { COLOR_KEYS, type ColorKey } from './colors'
import { db, newId, type Category } from './db'

export const MAX_NAME = 30

export function useCategories(): Category[] | undefined {
  return useLiveQuery(() => db.categories.orderBy('order').toArray(), [])
}

/** Returns an error message, or null if the name is fine. */
export function checkName(name: string, all: Category[], ignoreId?: string): string | null {
  const n = name.trim()
  if (!n) return 'Give the category a name.'
  if (all.some((c) => c.id !== ignoreId && c.name.trim().toLowerCase() === n.toLowerCase())) {
    return `You already have a category called "${n}".`
  }
  return null
}

/** First palette colour not used yet, so new categories look different by default. */
export function nextFreeColor(all: Category[]): ColorKey {
  const used = new Set(all.map((c) => c.color))
  return COLOR_KEYS.find((k) => !used.has(k)) ?? COLOR_KEYS[all.length % COLOR_KEYS.length]
}

export async function addCategory(name: string, color: ColorKey) {
  const last = await db.categories.orderBy('order').last()
  await db.categories.add({ id: newId(), name: name.trim(), color, order: (last?.order ?? 0) + 1, createdAt: Date.now() })
}

export function updateCategory(id: string, changes: Partial<Pick<Category, 'name' | 'color'>>) {
  return db.categories.update(id, { ...changes, ...(changes.name !== undefined && { name: changes.name.trim() }) })
}

export function deleteCategory(id: string) {
  // Tasks arrive in feature #3; they'll be left without a category rather than deleted.
  return db.categories.delete(id)
}
