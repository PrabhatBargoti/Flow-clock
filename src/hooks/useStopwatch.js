import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { clearStopwatch, loadStopwatch, saveStopwatch } from '../services/storage'

const initial = loadStopwatch() || { running: false, startedAt: null, sessionStartedAt: null, elapsedMs: 0 }

function elapsedAt(timer, now = Date.now()) {
  return timer.running && timer.startedAt ? timer.elapsedMs + Math.max(0, now - timer.startedAt) : timer.elapsedMs
}

export function useStopwatch() {
  const [timer, setTimer] = useState(initial)
  const timerRef = useRef(initial)
  const [now, setNow] = useState(() => new Date().valueOf())

  useEffect(() => {
    if (!timer.running) return undefined
    const interval = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [timer.running])

  useEffect(() => { timerRef.current = timer; saveStopwatch(timer) }, [timer])

  const elapsedMs = useMemo(() => elapsedAt(timer, now), [timer, now])
  const start = useCallback(() => setTimer((current) => {
    if (current.running) return current
    const startedAt = Date.now()
    const next = { ...current, running: true, startedAt, sessionStartedAt: current.sessionStartedAt || startedAt }
    timerRef.current = next
    return next
  }), [])
  const pause = useCallback(() => setTimer((current) => {
    const next = { ...current, elapsedMs: elapsedAt(current), running: false, startedAt: null }
    timerRef.current = next
    return next
  }), [])
  const reset = useCallback(() => {
    const current = timerRef.current
    const completed = { durationMs: elapsedAt(current), startedAt: current.sessionStartedAt || current.startedAt || Date.now() }
    const next = { running: false, startedAt: null, sessionStartedAt: null, elapsedMs: 0 }
    timerRef.current = next
    setTimer(next)
    clearStopwatch()
    return completed
  }, [])

  return { elapsedMs, running: timer.running, start, pause, reset }
}
