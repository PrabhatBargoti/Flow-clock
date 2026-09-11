import { localDateKey } from './time'

const dayStart = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

export function meaningfulSessions(sessions) {
  return sessions.filter((session) => session.meaningful && Number.isFinite(session.durationMs))
}

export function durationForRange(sessions, start, end = new Date()) {
  return meaningfulSessions(sessions).reduce((total, session) => {
    const ended = new Date(session.endedAt)
    return ended >= start && ended <= end ? total + session.durationMs : total
  }, 0)
}

export function calculateStats(sessions, now = new Date()) {
  const today = dayStart(now)
  const week = new Date(today)
  week.setDate(today.getDate() - ((today.getDay() + 6) % 7))
  const month = new Date(today.getFullYear(), today.getMonth(), 1)
  const meaningful = meaningfulSessions(sessions)
  const total = meaningful.reduce((sum, session) => sum + session.durationMs, 0)
  const byMode = meaningful.reduce((result, session) => {
    result[session.modeId] = (result[session.modeId] || 0) + session.durationMs
    return result
  }, {})
  const mostUsedId = Object.keys(byMode).sort((a, b) => byMode[b] - byMode[a])[0] || null
  return {
    today: durationForRange(meaningful, today, now),
    week: durationForRange(meaningful, week, now),
    month: durationForRange(meaningful, month, now),
    total,
    sessionCount: meaningful.length,
    average: meaningful.length ? total / meaningful.length : 0,
    activeDays: new Set(meaningful.map((session) => localDateKey(session.endedAt))).size,
    byMode,
    mostUsedId,
  }
}
