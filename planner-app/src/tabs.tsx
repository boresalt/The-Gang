import type { ReactNode } from 'react'

export type TabId = 'today' | 'tasks' | 'calendar' | 'stats' | 'goals'
export type ScreenId = TabId | 'settings'

const svg = (path: ReactNode) => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {path}
  </svg>
)

export const TABS: { id: TabId; label: string; icon: ReactNode; active: string; phase: number; blurb: string }[] = [
  {
    id: 'today',
    label: 'Today',
    icon: svg(<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>),
    active: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-400/15',
    phase: 2,
    blurb: 'Clock in and out, pick today\'s tasks and see your hours.',
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: svg(<><rect x="3" y="4" width="18" height="16" rx="3" /><path d="m7 12 3 3 7-7" /></>),
    active: 'text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-400/15',
    phase: 1,
    blurb: 'Your task list with smart sorting, badges and a Done archive.',
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: svg(<><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" /></>),
    active: 'text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-400/15',
    phase: 3,
    blurb: 'Month and week views with deadlines and meetings.',
  },
  {
    id: 'stats',
    label: 'Stats',
    icon: svg(<path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />),
    active: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-400/15',
    phase: 4,
    blurb: 'Time per task, estimate accuracy, workday trends and streaks.',
  },
  {
    id: 'goals',
    label: 'Goals',
    icon: svg(<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>),
    active: 'text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-400/15',
    phase: 5,
    blurb: 'Personal goals with milestones, plus your wishlist.',
  },
]

export const settingsIcon = svg(
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
  </>,
)
