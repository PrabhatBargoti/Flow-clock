# Flow Clock - Project Plan & Architecture

## Project Overview

**Flow Clock** is a modern productivity application for tracking focus sessions, building daily streaks, and visualizing work through activity metrics. It's designed for students, programmers, readers, and productivity-focused professionals to maintain consistent focus habits.

### Core Features
- ⏱️ Real-time session tracking (Start/Pause/Complete)
- 🔥 Daily streak tracking with current & longest streak
- 📊 Comprehensive statistics & analytics dashboard
- 🎨 Theme system with customization support
- 💾 Local-first storage (no cloud sync required)
- 📱 Responsive design (desktop, tablet, mobile)

---

## Project Structure Overview

```
Flow Clock/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/               # Main application pages
│   ├── context/             # React Context for global state
│   ├── hooks/               # Custom React hooks
│   ├── services/            # Core services (storage, persistence)
│   ├── utils/               # Utility functions (calculations, formatting)
│   ├── data/                # Static data & defaults
│   └── assets/              # Static assets
├── public/                  # Public assets
├── index.html               # HTML entry point
├── main.jsx                 # React app entry
├── vite.config.js           # Vite configuration
└── package.json             # Dependencies & scripts
```

---

## Data & Context Layer

### 📦 Context: `src/context/`

#### **FlowContext.jsx**
- Creates the React Context object for global state management
- Minimal file - just creates the context that will be provided by FlowProvider
- Used by `useFlow` hook to access global state

#### **flowStore.js**
- Exports the `FlowContext` constant used throughout the app
- This is a separate file for cleaner separation of concerns

### 📊 Data Structure: `src/context/FlowContext.jsx` (FlowProvider)

The **global state** managed by FlowProvider contains:

```javascript
{
  // User Preferences
  preferences: {
    clockFormat: "24h" | "12h",         // Clock display format
    timezone: string,                    // User's timezone
    selectedModeId: string,              // Currently selected activity mode
    themeId: string,                     // Active theme (midnight, ocean, sunset, light, minimal, custom)
    customTheme: { name: string, image: string } | null
  },
  
  // Activity Modes (Focus categories)
  modes: [
    { 
      id: string,                        // Unique identifier
      name: string,                      // Display name
      icon: string,                      // Emoji or icon
      accent: string                     // Color for mode
    },
    // Default modes: study, coding, reading, workout, focus
  ],
  
  // Session History - all completed focus sessions
  sessions: [
    {
      id: string,                        // Unique session ID
      startedAt: ISO string,             // Session start timestamp
      endedAt: ISO string,               // Session end timestamp
      durationMs: number,                // Duration in milliseconds
      modeId: string,                    // Which mode was used
      meaningful: boolean                // >= MEANINGFUL_SESSION_MS (5 min)?
    }
  ],
  
  // Activity Summary - aggregated by day
  activity: {
    "YYYY-MM-DD": {                      // Local date key
      totalDurationMs: number,           // Total focus time that day
      sessionCount: number               // Number of sessions that day
    }
  },
  
  // Premium Features
  premium: {
    enabled: boolean                     // Preview mode for premium features
  },
  
  // Achievements & Unlocks
  rewards: {
    unlockedThemes: string[],            // Theme IDs unlocked by streaks
    unlockedItems: any[]                 // Future reward items
  }
}
```

### 🎯 Key Calculations (derived from state)

FlowProvider also computes and exposes these derived values:

- **`streak`**: Current consecutive days with meaningful sessions
- **`totalDuration`**: Total milliseconds of all meaningful focus
- **`grid`**: Array of 365 days with activity data (for GitHub-style visualization)
- **`longestStreak`**: Longest consecutive day streak ever achieved
- **`stats`**: Comprehensive statistics object

---

## Hooks: `src/hooks/`

Custom React hooks that provide access to state and logic.

### **useFlow.js** ⚡ (Main Hook)
**Purpose**: Access the global Flow Clock state and dispatch actions

**Returns**:
```javascript
{
  // State
  flow: { preferences, modes, sessions, activity, premium, rewards },
  completion: { mode, durationMs, streak } | null,
  persistenceError: boolean,            // Storage error flag
  storageAvailable: boolean,            // Can browser save data?
  
  // Derived Values
  selectedMode: { id, name, icon, accent },
  streak: number,                       // Current streak
  totalDuration: number,                // Total milliseconds
  grid: Array,                          // 365-day activity array
  longestStreak: number,                // Longest streak ever
  stats: { today, week, month, total, sessionCount, average, activeDays, byMode, mostUsedId },
  defaultModeIds: Set,                  // Set of default mode IDs
  
  // Action Methods
  updatePreferences(patch),             // Update user preferences
  selectMode(id),                       // Switch active mode
  deleteMode(id),                       // Remove custom mode
  togglePremium(),                      // Enable/disable premium mode
  completeSession(),                    // Finish current session
  dismissCompletion()                   // Close completion message
}
```

**Key Features**:
- Validates state on load (normalizes invalid data)
- Auto-saves to localStorage on any change
- Calculates derived values with useMemo for performance
- Handles session completion logic

---

### **useStopwatch.js** ⏱️
**Purpose**: Manages the active session timer (start, pause, reset)

**Initial State** (persisted):
```javascript
{
  running: boolean,                     // Is timer active?
  startedAt: number,                    // When current interval started
  sessionStartedAt: number,             // When this session started
  elapsedMs: number                     // Accumulated time (when paused)
}
```

**Returns**:
```javascript
{
  // Current State
  elapsedMs: number,                    // Elapsed time in milliseconds
  running: boolean,                     // Is timer running?
  
  // Actions
  start(): void,                        // Start or resume timer
  pause(): void,                        // Pause timer (saves elapsedMs)
  reset(): { startedAt, durationMs },  // Stop and reset timer
  setElapsedMs(value): void             // Manually set elapsed time
}
```

**Behavior**:
- Updates every 1 second when running
- Persists state to localStorage automatically
- Calculates real elapsed time even if browser crashes/refreshes

---

## Services: `src/services/`

Core services for data persistence and business logic.

### **storage.js** 💾

**Functions**:

#### `loadState()`
- Loads state from localStorage
- Normalizes/validates data (handles schema migrations)
- Returns: `{ state: {...}, storageAvailable: boolean }`

#### `saveState(state)`
- Saves state to localStorage
- Returns `true` if successful, `false` if error
- Called automatically by FlowProvider on state change

#### `loadStopwatch()`
- Loads active timer state from localStorage
- Returns timer object or `null` if none saved

#### `saveStopwatch(timer)`
- Saves current timer state to localStorage
- Called automatically by useStopwatch

#### `clearStopwatch()`
- Deletes timer from localStorage
- Called when session is completed

**Storage Keys**:
- `flow-clock-state`: Main application state
- `flow-clock-stopwatch`: Active timer state

**Data Validation**:
- Normalizes modes: validates id/name, truncates to limits
- Normalizes sessions: validates timestamps, duration, calculations
- Normalizes activity: rebuilds from sessions data
- Schema migrations: handles version updates

---

## Utilities: `src/utils/`

Pure utility functions for calculations and formatting.

### **time.js** 🕐

**Time Formatting**:
- `formatDuration(ms)`: "HH:MM:SS" format (e.g., "01:23:45")
- `formatFocusDuration(ms)`: Human-readable (e.g., "1h 23m" or "23m")
- `formatClock(date, format)`: Display clock time with timezone
- `formatDate(date)`: Full date string (e.g., "Monday, September 11, 2026")

**Date Keys**:
- `localDateKey(date)`: Converts date to "YYYY-MM-DD" key for activity tracking
- `parseDateKey(key)`: Parses "YYYY-MM-DD" string back to Date object

**Why separate keys?**: Activity is tracked per local date, not UTC, so "YYYY-MM-DD" ensures consistency regardless of timezone.

---

### **streak.js** 🔥

**Streak Calculations**:

#### `calculateCurrentStreak(activity, now = new Date())`
- Returns: Number of consecutive days with meaningful sessions up to today
- Starts from today, goes backwards
- If today has no activity, looks at yesterday
- Stops when a gap is found

#### `calculateLongestStreak(activity)`
- Returns: Longest consecutive day streak ever achieved
- Iterates through all activity days and finds the longest sequence

#### `activityDays(activity, count = 365)`
- Returns: Array of last N days with activity data
- Each element: `{ key: "YYYY-MM-DD", date: Date, data: {...} }`
- Default 365 = last year for GitHub-style grid visualization
- Used for the activity grid on ActivityPage

#### `activityTotal(activity)`
- Returns: Total milliseconds across all recorded activity days

---

### **stats.js** 📊

#### `meaningfulSessions(sessions)`
- Filters sessions to only those marked as "meaningful"
- Meaningful = duration >= 5 minutes (MEANINGFUL_SESSION_MS)

#### `durationForRange(sessions, start, end = new Date())`
- Returns: Total milliseconds within a date range
- Used to calculate stats for today/week/month

#### `calculateStats(sessions, now = new Date())`
- Comprehensive statistics object:
```javascript
{
  today: number,                // Focus time today
  week: number,                 // Focus time this week (Mon-Sun)
  month: number,                // Focus time this month
  total: number,                // Total focus time ever
  sessionCount: number,         // Total sessions ever
  average: number,              // Average session duration
  activeDays: number,           // Days with meaningful sessions
  byMode: { modeId: number },  // Duration per mode
  mostUsedId: string            // Mode with most time
}
```

---

## Components: `src/components/`

Reusable UI building blocks.

### **Clock.jsx** 🕐
- Displays current time and date
- Updates every 1 second
- Formatted based on user's clock preference (12h/24h)
- **Props**: `{ format: "12h" | "24h" }`

### **Topbar.jsx** 🎯
- Navigation header with brand logo
- Buttons to switch between pages: Home, Activity, Settings
- **Props**: `{ view: string, setView: (view) => void }`

### **TimerCard.jsx** ⏱️
- Displays current active mode and timer
- Buttons: Start/Resume, Pause, Finish & Reset
- Shows "In flow" or "Ready" status
- Displays hint: Sessions of 5+ minutes count toward activity
- **Uses**: `useFlow()` hook for state and actions

### **ModeCard.jsx** 🎨
- Shows list of available activity modes
- User can click to select a mode
- Custom modes can be deleted (default modes cannot)
- Displays mode count and max limit (5 free, unlimited with premium)
- **Uses**: `useFlow()` hook for modes and actions

### **ErrorBoundary.jsx** 🛡️
- Class component that catches React errors
- Shows error UI if component tree crashes
- Offers "Reload Flow Clock" button to recover
- Preserves user data (doesn't clear localStorage)

---

## Pages: `src/pages/`

Full-page views, each displayed based on current navigation.

### **HomePage.jsx** 🏠
**Displays**:
1. Clock component (current time/date)
2. TimerCard (active session timer)
3. ModeCard (select focus mode)
4. Summary card (current streak, total duration)
5. Completion notification (when session finished)

**Uses**: `useFlow()` to access state and actions

### **ActivityPage.jsx** 📊
**Displays**:
1. Statistics grid with 7 metrics:
   - Current streak
   - Total focus time
   - Active days
   - Longest streak
   - This week's total
   - This month's total
   - Average session duration

2. GitHub-style activity grid (last 365 days)
   - Each square = 1 day
   - Shade intensity = amount of focus that day
   - Tooltip shows details: time + session count

**Uses**: `useFlow()` to access statistics and activity grid

### **SettingsPage.jsx** ⚙️
**Displays**:
1. Theme selector (built-in themes)
   - Midnight, Ocean, Sunset, Light, Minimal
   - Custom background upload (premium only)
   - Themes unlock with streaks (e.g., 7-day, 30-day)

2. Custom mode management (future feature area)

3. Other preferences (clock format, timezone - expandable)

**Uses**: `useFlow()` for preferences and upload handling

---

## Data & Defaults: `src/data/`

### **defaults.js** 📋

**Constants**:
```javascript
STORAGE_KEY: "flow-clock-state"           // localStorage key for state
STOPWATCH_KEY: "flow-clock-stopwatch"     // localStorage key for timer
MEANINGFUL_SESSION_MS: 5 * 60_000         // 5 minutes - minimum to count
MAX_FREE_MODES: 5                         // Max custom modes without premium
MAX_THEME_IMAGE_BYTES: 1_500_000          // Max 1.5MB for custom theme image
SESSION_HISTORY_LIMIT: 500                // Keep last 500 sessions
STORAGE_VERSION: 2                        // For schema migrations
```

**Default Modes** (built-in):
```javascript
[
  { id: "study", name: "Study", icon: "📚", accent: "#7c5cff" },
  { id: "coding", name: "Coding", icon: "⌘", accent: "#31b7a6" },
  { id: "reading", name: "Reading", icon: "◒", accent: "#ef9d4d" },
  { id: "workout", name: "Workout", icon: "✦", accent: "#e26e85" },
  { id: "focus", name: "Deep focus", icon: "◉", accent: "#4385db" },
]
```

**Built-in Themes**:
```javascript
[
  { id: "midnight", name: "Midnight", swatch: "#7c5cff" },
  { id: "ocean", name: "Ocean", swatch: "#27b6a8" },
  { id: "sunset", name: "Sunset", swatch: "#e07a5f" },
  { id: "light", name: "Light", swatch: "#eee9ff" },
  { id: "minimal", name: "Minimal", swatch: "#8c8c96" },
]
```

**createDefaultState()**:
- Returns fresh state object with default values
- Called when app first loads or localStorage is cleared
- Sets default theme to "midnight"
- Auto-detects user timezone
- Initializes default modes and themes as unlocked

---

## App Entry Points

### **App.jsx** 🚀
- Root component
- Wraps app with `ErrorBoundary` for crash protection
- Wraps content with `FlowProvider` for global state
- Manages view state (home/activity/settings)
- Renders pages based on current view

### **main.jsx**
- React app entry point
- Mounts App.jsx to DOM element #app
- Enables React 19 features

### **index.html**
- HTML entry point with `<div id="app"></div>`
- Loads main.jsx

### **vite.config.js**
- Vite build configuration
- React plugin for JSX transformation
- Development server settings

---

## Key Workflows

### 📍 Starting a Session
1. User selects a mode in ModeCard
2. User clicks "Start focus" in TimerCard
3. `stopwatch.start()` begins timer
4. Timer updates every 1 second and persists to localStorage
5. Status shows "In flow"

### ⏸️ Pausing & Resuming
1. User clicks "Pause"
2. `stopwatch.pause()` stops timer, saves elapsed time
3. Status shows "Ready"
4. User can click "Resume" to continue from where they left off

### ✅ Completing a Session
1. User clicks "Finish & reset"
2. `completeSession()` stops timer and creates session record
3. If duration >= 5 minutes (meaningful):
   - Session added to history
   - Activity totals updated
   - Streak recalculated
   - Stats updated
4. Completion notification displays with updated streak
5. Timer resets to 00:00:00

### 💾 Data Persistence
1. Any state change triggers `saveState(flow)` via useEffect
2. State serialized to JSON and saved to localStorage
3. If save fails, `persistenceError` flag set
4. Warning banner shown to user: "Changes will last only until this tab closes"
5. On page reload, `loadState()` restores data from localStorage

### 📊 Statistics Calculation
1. `meaningfulSessions` filters sessions >= 5 min
2. `calculateStats` computes all time periods (today/week/month/total)
3. Results cached with `useMemo` to avoid recalculation
4. Dashboard displays stats from `useFlow()` hook

---

## Best Practices & Architecture Notes

### State Management
- **Centralized**: All global state in FlowProvider via React Context
- **Immutable updates**: Always create new objects/arrays
- **Derived values**: Computed with `useMemo` for performance
- **Auto-save**: Effects trigger localStorage persistence

### Data Validation
- **On load**: `normalizeState()` validates and repairs corrupted data
- **Type checking**: Validates types, ranges, string lengths
- **Version migration**: Handles schema changes between versions

### Performance
- Streak, stats, grid calculated once per relevant state change
- memoized calculations prevent unnecessary recalculations
- Timer updates only when running (efficient interval usage)
- Activity grid uses efficient date arithmetic

### Accessibility
- Semantic HTML: `<section>`, `<article>`, `<time>`, `<button>`
- ARIA labels: `aria-label`, `aria-live` for dynamic content
- Keyboard navigation: All controls keyboard accessible
- Color contrast: Theme colors meet WCAG standards

---

## Getting Started for Development

### Key Entry Points to Understand First
1. **App.jsx**: How pages are routed and state is provided
2. **FlowContext.jsx** + **useFlow.js**: How to access global state
3. **HomePage.jsx**: Main UI and component hierarchy
4. **useStopwatch.js**: Timer logic and updates
5. **storage.js**: How data persists

### Common Tasks

**Adding a new statistic**:
1. Calculate in `stats.js` → `calculateStats()`
2. Access via `useFlow()` → `stats.newMetric`
3. Display on ActivityPage or HomePage

**Adding a new mode field**:
1. Update mode object structure in defaults.js
2. Update normalization in storage.js
3. Update components that display modes

**Adding a new preference**:
1. Add to `preferences` in `createDefaultState()`
2. Normalize in `normalizeState()` if needed
3. Update via `updatePreferences()` in FlowProvider
4. Access via `flow.preferences` in components

**Adding a new page**:
1. Create page component in `src/pages/`
2. Import and render in App.jsx based on view state
3. Add nav button in Topbar.jsx
4. Use `useFlow()` to access global state

---

## Technology Stack

- **React 19**: Modern UI with hooks
- **Vite 8**: Fast build tool and dev server
- **Context API**: Global state management (no Redux needed)
- **localStorage**: Browser-based persistence
- **CSS**: Custom styling with theme system
- **Oxlint**: Fast JavaScript linter

---

## File Summary Table

| File | Purpose | Key Exports |
|------|---------|-------------|
| App.jsx | Root component & routing | App |
| FlowContext.jsx | Global state provider | FlowProvider, useFlow actions |
| flowStore.js | Context creation | FlowContext |
| useFlow.js | State access hook | useFlow() |
| useStopwatch.js | Timer hook | useStopwatch() |
| storage.js | Persistence layer | loadState, saveState, normalizeState |
| defaults.js | Constants & defaults | STORAGE_KEY, defaultModes, themes, createDefaultState |
| time.js | Time formatting & keys | formatDuration, formatClock, localDateKey |
| streak.js | Streak calculations | calculateCurrentStreak, calculateLongestStreak |
| stats.js | Statistics calculations | calculateStats, durationForRange |
| Clock.jsx | Time display component | Clock |
| Topbar.jsx | Navigation header | Topbar |
| TimerCard.jsx | Active session UI | TimerCard |
| ModeCard.jsx | Mode selector UI | ModeCard |
| ErrorBoundary.jsx | Error handling | ErrorBoundary |
| HomePage.jsx | Main dashboard | HomePage |
| ActivityPage.jsx | Statistics & grid | ActivityPage |
| SettingsPage.jsx | Preferences & themes | SettingsPage |

---

## Next Steps for Development

1. **Understand the data flow**: Trace a session from start to completion
2. **Test the hooks**: Try `useFlow()` and `useStopwatch()` in console
3. **Explore localStorage**: Check browser DevTools → Application → localStorage
4. **Read component files**: Understand how they use hooks and state
5. **Try modifying state**: Add a new preference or stat calculation
6. **Build a new feature**: Add a new mode type, theme, or statistic

Good luck! Happy coding! 🚀
