import { createDefaultState, STORAGE_KEY, STOPWATCH_KEY } from '../data/defaults'

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)

function validState(candidate) {
  return isObject(candidate)
    && candidate.version === 1
    && isObject(candidate.preferences)
    && Array.isArray(candidate.modes)
    && Array.isArray(candidate.sessions)
    && isObject(candidate.activity)
    && isObject(candidate.premium)
}

export function loadState() {
  const fallback = createDefaultState()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { state: fallback, storageAvailable: true }
    const parsed = JSON.parse(raw)
    return validState(parsed) ? { state: parsed, storageAvailable: true } : { state: fallback, storageAvailable: true }
  } catch {
    return { state: fallback, storageAvailable: false }
  }
}

export function saveState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

export function loadStopwatch() {
  try {
    const raw = window.localStorage.getItem(STOPWATCH_KEY)
    if (!raw) return null
    const value = JSON.parse(raw)
    if (isObject(value) && typeof value.elapsedMs === 'number' && typeof value.running === 'boolean') return value
  } catch { /* Start a fresh in-memory timer when storage is inaccessible or corrupt. */ }
  return null
}

export function saveStopwatch(value) {
  try { window.localStorage.setItem(STOPWATCH_KEY, JSON.stringify(value)); return true } catch { return false }
}

export function clearStopwatch() {
  try { window.localStorage.removeItem(STOPWATCH_KEY) } catch { /* no persistence available */ }
}
