import { createDefaultState, MEANINGFUL_SESSION_MS, STORAGE_KEY, STOPWATCH_KEY, STORAGE_VERSION } from '../data/defaults'
import { localDateKey } from '../utils/time'

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value)

function normalizeMode(mode, fallback) {
  if (!isObject(mode) || typeof mode.id !== 'string' || !mode.id || typeof mode.name !== 'string') return null
  return { ...fallback, ...mode, id: mode.id.slice(0, 80), name: mode.name.slice(0, 32) }
}

function normalizeSession(session, modes) {
  if (!isObject(session) || !isFiniteNumber(session.durationMs) || session.durationMs < 0) return null
  const startedAt = new Date(session.startedAt).getTime()
  const endedAt = new Date(session.endedAt).getTime()
  if (!Number.isFinite(startedAt) || !Number.isFinite(endedAt)) return null
  return {
    id: typeof session.id === 'string' ? session.id : `${endedAt}-${Math.random()}`,
    modeId: modes.some((mode) => mode.id === session.modeId) ? session.modeId : modes[0].id,
    startedAt: new Date(startedAt).toISOString(), endedAt: new Date(endedAt).toISOString(),
    durationMs: Math.floor(session.durationMs), meaningful: session.durationMs >= MEANINGFUL_SESSION_MS,
  }
}

function activityFromSessions(sessions) {
  return sessions.reduce((activity, session) => {
    if (!session.meaningful) return activity
    const key = localDateKey(session.endedAt)
    const entry = activity[key] || { totalDurationMs: 0, sessionCount: 0 }
    activity[key] = { totalDurationMs: entry.totalDurationMs + session.durationMs, sessionCount: entry.sessionCount + 1 }
    return activity
  }, {})
}

export function normalizeState(candidate) {
  const fallback = createDefaultState()
  if (!isObject(candidate)) return fallback
  const modes = Array.isArray(candidate.modes) ? candidate.modes.map((mode) => normalizeMode(mode, fallback.modes[0])).filter(Boolean) : []
  const safeModes = modes.length ? modes : fallback.modes
  let sessions = Array.isArray(candidate.sessions) ? candidate.sessions.map((session) => normalizeSession(session, safeModes)).filter(Boolean).slice(-500) : []
  // Very early V1 installs may contain activity without session history. Convert
  // that valid activity into a single legacy session per day so it survives V2.
  if (!sessions.length && isObject(candidate.activity)) {
    sessions = Object.entries(candidate.activity).map(([key, entry]) => {
      const durationMs = entry?.totalDurationMs
      const endedAt = `${key}T12:00:00`
      return normalizeSession({ id: `legacy-${key}`, modeId: safeModes[0].id, startedAt: endedAt, endedAt, durationMs }, safeModes)
    }).filter(Boolean)
  }
  const preferences = isObject(candidate.preferences) ? candidate.preferences : {}
  const selectedModeId = safeModes.some((mode) => mode.id === preferences.selectedModeId) ? preferences.selectedModeId : safeModes[0].id
  return {
    ...fallback, version: STORAGE_VERSION,
    preferences: { ...fallback.preferences, ...preferences, clockFormat: preferences.clockFormat === '12h' ? '12h' : '24h', selectedModeId, customTheme: isObject(preferences.customTheme) && typeof preferences.customTheme.image === 'string' ? preferences.customTheme : null },
    modes: safeModes, sessions,
    activity: activityFromSessions(sessions),
    premium: { enabled: Boolean(candidate.premium?.enabled) },
    rewards: { unlockedThemes: Array.isArray(candidate.rewards?.unlockedThemes) ? candidate.rewards.unlockedThemes : fallback.rewards.unlockedThemes, unlockedItems: Array.isArray(candidate.rewards?.unlockedItems) ? candidate.rewards.unlockedItems : [] },
  }
}

export function loadState() {
  const fallback = createDefaultState()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { state: fallback, storageAvailable: true }
    try { return { state: normalizeState(JSON.parse(raw)), storageAvailable: true } }
    catch { return { state: fallback, storageAvailable: true } }
  } catch { return { state: fallback, storageAvailable: false } }
}

export function saveState(state) {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return true } catch { return false }
}

export function loadStopwatch() {
  try {
    const value = JSON.parse(window.localStorage.getItem(STOPWATCH_KEY) || 'null')
    if (isObject(value) && isFiniteNumber(value.elapsedMs) && typeof value.running === 'boolean') return value
  } catch { /* A corrupt timer must not prevent the app from loading. */ }
  return null
}

export function saveStopwatch(value) {
  try { window.localStorage.setItem(STOPWATCH_KEY, JSON.stringify(value)); return true } catch { return false }
}

export function clearStopwatch() {
  try { window.localStorage.removeItem(STOPWATCH_KEY) } catch { /* Timer remains reset in memory. */ }
}
