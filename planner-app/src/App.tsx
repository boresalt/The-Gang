import { useEffect, useRef, useState } from 'react'
import { TabBar } from './components/TabBar'
import { Placeholder } from './screens/Placeholder'
import { Settings } from './screens/Settings'
import { TABS, settingsIcon, type ScreenId } from './tabs'
import { useApplyTheme } from './useTheme'

const SCREENS: ScreenId[] = ['today', 'tasks', 'calendar', 'stats', 'goals', 'settings']

// The current screen lives in the URL hash so a refresh keeps you where you were
function readHash(): ScreenId {
  const h = location.hash.slice(1) as ScreenId
  return SCREENS.includes(h) ? h : 'today'
}

export default function App() {
  useApplyTheme()
  const [screen, setScreen] = useState<ScreenId>(readHash)
  // Where the settings close button returns to
  const lastTab = useRef<ScreenId>(screen === 'settings' ? 'today' : screen)
  if (screen !== 'settings') lastTab.current = screen

  useEffect(() => {
    const onHash = () => setScreen(readHash())
    addEventListener('hashchange', onHash)
    return () => removeEventListener('hashchange', onHash)
  }, [])

  const go = (id: ScreenId) => {
    location.hash = id
    window.scrollTo(0, 0)
  }

  const title = screen === 'settings' ? 'Settings' : TABS.find((t) => t.id === screen)!.label
  const date = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="mx-auto min-h-dvh max-w-2xl pb-28">
      <header
        className="sticky top-0 z-10 flex items-center justify-between bg-slate-50/90 px-4 pb-3 pt-4 backdrop-blur dark:bg-slate-950/90"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
      >
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{date}</p>
          <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
        </div>
        <button
          onClick={() => go(screen === 'settings' ? lastTab.current : 'settings')}
          aria-label={screen === 'settings' ? 'Close settings' : 'Settings'}
          className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors ${
            screen === 'settings'
              ? 'bg-violet-600 text-white'
              : 'bg-white text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300'
          }`}
        >
          {settingsIcon}
        </button>
      </header>

      <main>{screen === 'settings' ? <Settings /> : <Placeholder id={screen} />}</main>

      <TabBar current={screen} onSelect={go} />
    </div>
  )
}
