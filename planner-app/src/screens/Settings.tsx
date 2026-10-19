import { Categories } from '../components/Categories'
import { setSetting, useSetting, type Theme } from '../settings'

const THEMES: { id: Theme; label: string }[] = [
  { id: 'system', label: 'Auto' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
]

export function Settings() {
  const theme = useSetting<Theme>('theme', 'system')
  return (
    <div className="space-y-4 px-4 pt-2">
      <Categories />
      <section className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900">
        <h3 className="mb-3 font-bold">Appearance</h3>
        <div role="radiogroup" aria-label="Theme" className="grid grid-cols-3 gap-1 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
          {THEMES.map((t) => (
            <button
              key={t.id}
              role="radio"
              aria-checked={theme === t.id}
              onClick={() => setSetting('theme', t.id)}
              className={`min-h-12 rounded-xl font-bold transition-colors ${
                theme === t.id ? 'bg-violet-600 text-white shadow' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Auto follows your phone's light/dark setting.</p>
      </section>
    </div>
  )
}
