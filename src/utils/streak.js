import { localDateKey, parseDateKey } from './time'

export function calculateCurrentStreak(activity, now = new Date()) {
  let cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (!activity[localDateKey(cursor)]) cursor.setDate(cursor.getDate() - 1)

  let streak = 0
  while (activity[localDateKey(cursor)]) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function activityDays(activity, count = 84) {
  const today = new Date()
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - count + 1)
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    const key = localDateKey(date)
    return { key, date, data: activity[key] }
  })
}

export function activityTotal(activity) {
  return Object.values(activity).reduce((total, entry) => total + (entry.totalDurationMs || 0), 0)
}

export function recentActiveDate(activity) {
  const keys = Object.keys(activity).sort()
  return keys.length ? parseDateKey(keys[keys.length - 1]) : null
}
