import { useCallback, useEffect, useMemo, useState } from 'react'
import { clearStopwatch, loadStopwatch, saveStopwatch } from '../services/storage'

const initial = loadStopwatch() || { running: false, startedAt: null, sessionStartedAt: null, elapsedMs: 0 }

function elapsedAt(timer, now = Date.now()) {
  return timer.running && timer.startedAt ? timer.elapsedMs + Math.max(0, now - timer.startedAt) : timer.elapsedMs
}

export function useStopwatch() {
  const [timer, setTimer] = useState(initial)
  const [now, setNow] = useState(() => new Date().valueOf())

  useEffect(() => {
    if (!timer.running) return undefined
    const interval = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [timer.running])

  useEffect(() => { saveStopwatch(timer) }, [timer])

  const elapsedMs = useMemo(() => elapsedAt(timer, now), [timer, now])
  const start = useCallback(() => setTimer((current) => {
    if (current.running) return current
    const startedAt = Date.now()
    return { ...current, running: true, startedAt, sessionStartedAt: current.sessionStartedAt || startedAt }
  }), [])
  const pause = useCallback(() => setTimer((current) => ({ ...current, elapsedMs: elapsedAt(current), running: false, startedAt: null })), [])
  const reset = useCallback(() => {
    const completed = { durationMs: elapsedAt(timer), startedAt: timer.sessionStartedAt || timer.startedAt || Date.now() }
    setTimer({ running: false, startedAt: null, sessionStartedAt: null, elapsedMs: 0 })
    clearStopwatch()
    return completed
  }, [timer])

  return { elapsedMs, running: timer.running, start, pause, reset }
}
