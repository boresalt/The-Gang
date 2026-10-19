import { useEffect } from 'react'
import { useSetting, type Theme } from './settings'

const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')

/** Keeps the `dark` class on <html> in sync with the saved theme and the system setting. */
export function useApplyTheme() {
  const theme = useSetting<Theme>('theme', (localStorage.getItem('planner-theme') as Theme) || 'system')

  useEffect(() => {
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && darkQuery.matches)
      document.documentElement.classList.toggle('dark', dark)
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#020617' : '#f8fafc')
    }
    apply()
    try {
      localStorage.setItem('planner-theme', theme)
    } catch {}
    darkQuery.addEventListener('change', apply)
    return () => darkQuery.removeEventListener('change', apply)
  }, [theme])
}
