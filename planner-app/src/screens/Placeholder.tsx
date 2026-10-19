import { TABS, type TabId } from '../tabs'

export function Placeholder({ id }: { id: TabId }) {
  const tab = TABS.find((t) => t.id === id)!
  return (
    <div className="flex flex-col items-center px-6 pt-16 text-center">
      <div className={`mb-4 flex h-20 w-20 items-center justify-center rounded-3xl [&_svg]:h-10 [&_svg]:w-10 ${tab.active}`}>{tab.icon}</div>
      <h2 className="text-2xl font-extrabold">{tab.label}</h2>
      <p className="mt-2 max-w-xs text-slate-600 dark:text-slate-400">{tab.blurb}</p>
      <p className="mt-4 rounded-full bg-slate-200 px-3 py-1 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        Coming in phase {tab.phase}
      </p>
    </div>
  )
}
