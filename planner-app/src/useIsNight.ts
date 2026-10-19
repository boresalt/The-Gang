import { useEffect, useState } from 'react'

const NIGHT_FROM = 18 // 6pm
const NIGHT_UNTIL = 6 // 6am

const isNight = () => {
  const h = new Date().getHours()
  return h >= NIGHT_FROM || h < NIGHT_UNTIL
}

/** True from 6pm to 6am; re-checks every minute and when the app comes back to the foreground. */
export function useIsNight() {
  const [night, setNight] = useState(isNight)
  useEffect(() => {
    const check = () => setNight(isNight())
    const id = setInterval(check, 60_000)
    document.addEventListener('visibilitychange', check)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', check)
    }
  }, [])
  return night
}
