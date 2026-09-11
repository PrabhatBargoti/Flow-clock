export const STORAGE_KEY = 'flow-clock-state'
export const STOPWATCH_KEY = 'flow-clock-stopwatch'
// Keep this product decision in one place so activity, streaks and rewards agree.
export const MEANINGFUL_SESSION_MS = 5 * 60_000
export const MAX_FREE_MODES = 5
export const MAX_THEME_IMAGE_BYTES = 1_500_000
export const SESSION_HISTORY_LIMIT = 500
export const STORAGE_VERSION = 2

export const defaultModes = [
  { id: 'study', name: 'Study', icon: '📚', accent: '#7c5cff' },
  { id: 'coding', name: 'Coding', icon: '⌘', accent: '#31b7a6' },
  { id: 'reading', name: 'Reading', icon: '◒', accent: '#ef9d4d' },
  { id: 'workout', name: 'Workout', icon: '✦', accent: '#e26e85' },
  { id: 'focus', name: 'Deep focus', icon: '◉', accent: '#4385db' },
]

export const themes = [
  { id: 'midnight', name: 'Midnight', swatch: '#7c5cff' },
  { id: 'ocean', name: 'Ocean', swatch: '#27b6a8' },
  { id: 'sunset', name: 'Sunset', swatch: '#e07a5f' },
  { id: 'light', name: 'Light', swatch: '#eee9ff' },
  { id: 'minimal', name: 'Minimal', swatch: '#8c8c96' },
]

export const createDefaultState = () => ({
  version: STORAGE_VERSION,
  preferences: { clockFormat: '24h', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', selectedModeId: 'study', themeId: 'midnight', customTheme: null },
  modes: defaultModes.map((mode) => ({ ...mode })),
  sessions: [],
  activity: {},
  premium: { enabled: false },
  rewards: { unlockedThemes: ['midnight', 'ocean', 'sunset'], unlockedItems: [] },
})
