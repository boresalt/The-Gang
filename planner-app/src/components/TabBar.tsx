import { TABS, TAB_ORDER, moonIcon, type ScreenId, type TabId } from '../tabs'
import { useIsNight } from '../useIsNight'

export function TabBar({ current, onSelect }: { current: ScreenId; onSelect: (id: TabId) => void }) {
  const night = useIsNight()
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex max-w-2xl items-end justify-around px-1 py-1.5">
        {TAB_ORDER.map((id) => {
          const t = TABS.find((tab) => tab.id === id)!
          const on = id === current

          if (id === 'today') {
            // Raised round button in the centre of the bar
            return (
              <li key={id} className="flex-1">
                <button
                  onClick={() => onSelect(id)}
                  aria-current={on ? 'page' : undefined}
                  className="mx-auto flex w-full max-w-20 flex-col items-center gap-1.5 pb-[7px] text-xs font-bold"
                >
                  <span
                    className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-lg ring-4 ${
                      night ? 'from-indigo-500 to-violet-700 shadow-indigo-500/30' : 'from-amber-400 to-orange-500 shadow-orange-500/30'
                    } ring-white transition-transform dark:ring-slate-900 [&_svg]:h-8 [&_svg]:w-8 ${
                      on ? 'scale-105' : ''
                    }`}
                  >
                    {night ? moonIcon : t.icon}
                  </span>
                  <span
                    className={
                      !on ? 'text-slate-500 dark:text-slate-400' : night ? 'text-indigo-600 dark:text-indigo-300' : 'text-orange-600 dark:text-amber-400'
                    }
                  >
                    {t.label}
                  </span>
                </button>
              </li>
            )
          }

          return (
            <li key={id} className="flex-1">
              <button
                onClick={() => onSelect(id)}
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
