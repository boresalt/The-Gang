import { TABS, type ScreenId, type TabId } from '../tabs'

export function TabBar({ current, onSelect }: { current: ScreenId; onSelect: (id: TabId) => void }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex max-w-2xl justify-around px-1 py-1.5">
        {TABS.map((t) => {
          const on = t.id === current
          return (
            <li key={t.id} className="flex-1">
              <button
                onClick={() => onSelect(t.id)}
                aria-current={on ? 'page' : undefined}
                className={`mx-auto flex min-h-14 w-full max-w-20 flex-col items-center justify-center gap-0.5 rounded-2xl text-xs font-bold transition-colors ${
                  on ? t.active : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
