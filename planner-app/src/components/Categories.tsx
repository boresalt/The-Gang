import { useState } from 'react'
import { MAX_NAME, addCategory, checkName, deleteCategory, nextFreeColor, updateCategory, useCategories } from '../categories'
import { COLORS, COLOR_KEYS, colorHex, type ColorKey } from '../colors'
import type { Category } from '../db'

export function Categories() {
  const categories = useCategories()
  // Which editor is open: a category id, 'new', or none. Only one at a time.
  const [editing, setEditing] = useState<string | null>(null)

  if (!categories) return null

  return (
    <section className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-bold">Categories</h3>
        {categories.length > 0 && <span className="text-sm text-slate-500 dark:text-slate-400">{categories.length}</span>}
      </div>

      {categories.length === 0 && editing !== 'new' && (
        <p className="mb-3 text-slate-600 dark:text-slate-400">
          No categories yet. Add one for each area of your work, like a client, Admin or Learning. Each gets its own colour.
        </p>
      )}

      <ul className="space-y-1">
        {categories.map((c) =>
          editing === c.id ? (
            <li key={c.id}>
              <Editor category={c} all={categories} onDone={() => setEditing(null)} />
            </li>
          ) : (
            <li key={c.id}>
              <button
                onClick={() => setEditing(c.id)}
                className="flex min-h-12 w-full items-center gap-3 rounded-2xl px-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span className="h-6 w-6 shrink-0 rounded-full" style={{ backgroundColor: colorHex(c.color) }} />
                <span className="min-w-0 flex-1 truncate font-semibold">{c.name}</span>
                <span className="text-sm font-semibold text-slate-400">Edit</span>
              </button>
            </li>
          ),
        )}
      </ul>

      {editing === 'new' ? (
        <div className="mt-2">
          <Editor all={categories} onDone={() => setEditing(null)} />
        </div>
      ) : (
        <button
          onClick={() => setEditing('new')}
          className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-violet-300 font-bold text-violet-700 hover:bg-violet-50 dark:border-violet-500/50 dark:text-violet-300 dark:hover:bg-violet-500/10"
        >
          <span className="text-xl leading-none">+</span> Add category
        </button>
      )}
    </section>
  )
}

function Editor({ category, all, onDone }: { category?: Category; all: Category[]; onDone: () => void }) {
  const [name, setName] = useState(category?.name ?? '')
  const [color, setColor] = useState<ColorKey>(category?.color ?? nextFreeColor(all))
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const inputId = category ? `category-name-${category.id}` : 'category-name-new'

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const problem = checkName(name, all, category?.id)
    if (problem) return setError(problem)
    if (category) await updateCategory(category.id, { name, color })
    else await addCategory(name, color)
    onDone()
  }

  return (
    <form
      onSubmit={save}
      className="space-y-3 rounded-2xl border-2 p-3"
      style={{ borderColor: colorHex(color) + '66', backgroundColor: colorHex(color) + '0f' }}
    >
      <div>
        <label htmlFor={inputId} className="mb-1 block text-sm font-bold text-slate-600 dark:text-slate-300">
          Name
        </label>
        <input
          id={inputId}
          autoFocus
          value={name}
          maxLength={MAX_NAME}
          onChange={(e) => {
            setName(e.target.value)
            setError(null)
          }}
          placeholder="e.g. Client work"
          className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 dark:border-slate-700 dark:bg-slate-950"
        />
        {error && <p className="mt-1 text-sm font-semibold text-red-600 dark:text-red-400">{error}</p>}
      </div>

      <fieldset>
        <legend className="mb-1 text-sm font-bold text-slate-600 dark:text-slate-300">Colour</legend>
        <div className="grid grid-cols-6 gap-2">
          {COLOR_KEYS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setColor(k)}
              aria-label={COLORS[k].name}
              aria-pressed={color === k}
              className={`flex aspect-square w-full max-w-12 items-center justify-center justify-self-center rounded-full transition-transform ${
                color === k ? 'scale-110 ring-4 ring-offset-2 ring-offset-white dark:ring-offset-slate-900' : ''
              }`}
              style={{ backgroundColor: COLORS[k].hex, ...(color === k && { ['--tw-ring-color' as string]: COLORS[k].hex + '55' }) }}
            >
              {color === k && (
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth={3} aria-hidden="true">
                  <path d="m5 12 5 5 9-10" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </fieldset>

      {confirmDelete ? (
        <div className="space-y-2 rounded-xl bg-red-50 p-3 dark:bg-red-500/10">
          <p className="font-semibold text-red-700 dark:text-red-300">
            Delete "{category!.name}"? Tasks in it will keep going, just without a category.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={async () => {
                await deleteCategory(category!.id)
                onDone()
              }}
              className="min-h-12 flex-1 rounded-xl bg-red-600 font-bold text-white"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="min-h-12 flex-1 rounded-xl bg-white font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              Keep it
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button type="submit" className="min-h-12 flex-1 rounded-xl bg-violet-600 font-bold text-white shadow-sm active:bg-violet-700">
            {category ? 'Save' : 'Add'}
          </button>
          <button
            type="button"
            onClick={onDone}
            className="min-h-12 flex-1 rounded-xl bg-white font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            Cancel
          </button>
          {category && (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              aria-label={`Delete ${category.name}`}
              className="flex min-h-12 w-12 items-center justify-center rounded-xl bg-white text-red-600 dark:bg-slate-800 dark:text-red-400"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
              </svg>
            </button>
          )}
        </div>
      )}
    </form>
  )
}
