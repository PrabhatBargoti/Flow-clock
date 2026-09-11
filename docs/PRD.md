# Flow Clock — V1.5 Product Requirements Document

## Project

Flow Clock V1.5 is an iteration of Flow Clock focused on improving the core productivity experience introduced in V1.

V1 establishes the foundation:

> Clock → Stopwatch → Focus Mode → Activity → Streak

V1.5 improves this loop with better rewards, statistics, themes, animations, session history, and overall UX.

The goal is to make Flow Clock feel more polished and motivating without introducing authentication, cloud databases, payments, or unnecessary backend infrastructure.

---

# Goal

## Problem

Users may start using Flow Clock but lose motivation because simply tracking time and maintaining a streak is not enough to make the experience engaging over a long period.

V1.5 should make progress more visible and rewarding.

## Solution

V1.5 introduces:

* Better session tracking
* Session history
* Improved streaks
* More meaningful statistics
* Better rewards
* More themes
* Improved animations
* Better focus modes
* Improved responsive UX
* Better performance

The product should create a stronger loop:

```text
Start session
      ↓
Focus
      ↓
Complete session
      ↓
Earn progress/reward
      ↓
Streak grows
      ↓
Statistics improve
      ↓
Unlock/customize
      ↓
Return tomorrow
```

---

# Users

The primary users remain:

* Students
* Self-learners
* Programmers
* Readers
* People building daily habits
* Productivity-focused users

V1.5 should especially benefit users who already used Flow Clock in V1 and want more reasons to keep using it.

---

# Core Features

## Feature 1 — Improved Stopwatch / Focus Sessions

The stopwatch from V1 becomes a proper session tracker.

### Requirements

Users can:

* Start a session
* Pause a session
* Resume a session
* Complete a session
* Cancel/reset a session

Each completed session should record:

* Date
* Start time
* End time
* Duration
* Mode
* Session status

Example:

```text
September 11

Coding
1h 24m

Study
45m

Reading
30m
```

### Session Validation

Very short accidental sessions should not count toward meaningful productivity.

The application should define a minimum meaningful session duration.

Example:

```text
< 5 minutes
= not counted

≥ 5 minutes
= meaningful session
```

The exact threshold should be configurable in the implementation.

---

# Feature 2 — Session History

Users can see their previous completed sessions.

### Display

Each session should show:

* Mode
* Duration
* Date
* Time

Example:

```text
Today

Coding          1h 20m
Study             45m
Reading           30m
```

### Requirements

* Newest sessions first
* Group sessions by date
* Allow users to view recent history
* Store history in localStorage
* Avoid storing unnecessary data

---

# Feature 3 — Improved Streak System

The V1 streak system is improved to make progress more meaningful.

### Daily Activity

A day becomes active when the user completes meaningful focused work.

Example:

```text
5+ minutes of meaningful work
        ↓
Active day
        ↓
Streak can continue
```

### Streak Information

Display:

* Current streak
* Longest streak
* Total active days
* Today's status

Example:

```text
🔥 12 Day Streak

Longest: 24 days
Active days: 86
```

### Streak Protection

V1.5 may introduce a simple streak protection/recovery mechanic.

Example:

* User misses one day
* Streak protection can preserve the streak

This should be optional and should not make streaks meaningless.

If implemented, users should have a limited number of protections.

---

# Feature 4 — GitHub-Style Activity Grid

Improve the activity visualization from V1.

Each day represents productivity activity.

Activity intensity should represent meaningful work duration.

Example:

```text
Less                         More
□ ░ ▒ ▓ █
```

### Requirements

* Display approximately the last 12 months
* Hover/tap a day to see information
* Show date
* Show total focused time
* Show number of sessions
* Show primary mode
* Clearly distinguish inactive days

Example:

```text
September 10

Focused: 2h 35m
Sessions: 4
Main mode: Coding
```

### Free Users

Can view:

* Activity
* Focused time
* Sessions
* Current streak

### Premium-ready

Architecture should allow additional statistics later.

---

# Feature 5 — Statistics

Introduce a dedicated statistics experience.

### Basic Statistics

Users can view:

* Total focused time
* Today's focused time
* Weekly focused time
* Monthly focused time
* Number of sessions
* Current streak
* Longest streak

Example:

```text
This Week

Focused Time
8h 42m

Sessions
17

Average Session
31m

Active Days
6 / 7
```

### Mode Statistics

Show time spent in each mode.

Example:

```text
Coding      12h 20m
Study        8h 15m
Reading      3h 40m
Workout      2h 10m
```

Charts should remain lightweight and should not unnecessarily increase bundle size.

---

# Feature 6 — Most Used Mode

Track which focus mode the user uses most.

### Monthly Statistics

Display:

```text
Your Top Mode

💻 Coding

18h 42m
```

For the first version of this feature, calculations should happen locally.

No backend is required.

---

# Feature 7 — Rewards

V1.5 introduces a lightweight reward system.

Rewards should encourage consistency rather than encourage users to spend excessive time working.

### Possible Rewards

Users can unlock:

* Themes
* Accent styles
* Clock styles
* Small visual effects
* Badges

Example:

```text
🔥 7 Day Streak
Unlocked: Night Theme
```

### Reward Principles

Rewards should be:

* Simple
* Visual
* Non-intrusive
* Optional
* Based on consistency

Avoid aggressive gamification such as:

* Constant notifications
* Punishing users for stopping
* Infinite reward popups
* Competitive leaderboards

---

# Feature 8 — Themes

Expand the V1 theme system.

### Free Users

Provide a small collection of built-in themes.

Example:

* Default
* Dark
* Light
* Midnight
* Minimal

### Premium-ready

Architecture should support:

* Additional themes
* Custom theme uploads
* Theme metadata
* Theme unlocking

V1.5 does not require real payment verification.

---

# Feature 9 — Improved Focus Modes

Focus modes become more customizable.

Each mode can contain:

* Name
* Icon
* Accent
* Optional description
* Total focused time
* Number of sessions

Example:

```text
💻 Coding

Sessions: 32
Focused: 18h 42m
```

### Free Limit

Maximum 5 custom/active modes.

### Future Premium

More than 5 modes.

---

# Feature 10 — Better Animations

Improve the visual experience without harming performance.

Animations may include:

* Clock transitions
* Stopwatch state changes
* Session completion
* Streak increases
* Reward unlocks
* Theme transitions
* Mode selection

### Requirements

Animations should:

* Be short
* Feel smooth
* Not block interaction
* Respect `prefers-reduced-motion`
* Avoid unnecessary continuous animations

---

# Feature 11 — Session Completion Experience

When a meaningful session ends, show a small completion state.

Example:

```text
Session Complete ✓

Coding
42 minutes

🔥 8 Day Streak

+1 Achievement
```

The completion screen should quickly return the user to the main application.

Avoid turning every session into a large popup.

---

# Feature 12 — Improved Dashboard

The main dashboard should provide a quick overview.

### Dashboard should contain

* Current time
* Current date/day
* Active mode
* Stopwatch/focus session
* Current streak
* Today's focused time
* Quick access to statistics
* Recent activity

The dashboard should prioritize the current session rather than overwhelming users with data.

---

# Data Storage

## V1.5

Continue using:

```text
localStorage
```

No external database is required.

### Suggested Data Structure

```text
flowClock
├── preferences
│   ├── theme
│   ├── clockFormat
│   └── selectedMode
│
├── modes
│   └── user modes
│
├── sessions
│   └── completed sessions
│
├── activity
│   └── daily activity
│
├── streak
│   ├── current
│   ├── longest
│   └── activeDays
│
└── rewards
    └── unlocked rewards
```

The exact implementation can use separate localStorage keys or a versioned storage object.

---

# Data Migration

V1.5 must safely handle existing V1 localStorage data.

If V1 data exists:

```text
V1 data
   ↓
Detect storage version
   ↓
Migrate data
   ↓
V1.5 format
```

Users should not lose their existing:

* Streak
* Theme
* Modes
* Preferences
* Activity

Storage should use a version number to make future migrations possible.

Example:

```text
storageVersion: 1.5
```

---

# Backend

## V1.5

Backend remains unnecessary.

Do NOT introduce Node.js/Express unless a V1.5 feature genuinely requires server-side processing.

The application should remain primarily client-side.

---

# Authentication

## V1.5

No authentication.

Users should continue using Flow Clock without:

* Signup
* Login
* Password
* Account

---

# Premium Architecture

V1.5 should be **premium-ready**, but not implement real subscriptions.

Premium features can be represented through a local development flag.

Example:

```text
isPremium: false
```

This is only for development/testing.

It must NOT be treated as secure subscription verification.

Real premium access control will be implemented after authentication and backend infrastructure are introduced.

---

# Tech Stack

## Frontend

* React.js
* Vite
* JavaScript
* Tailwind CSS

## State Management

* React state/hooks
* Zustand where global state is beneficial

## Animation

* Framer Motion

## Charts

* Recharts only where useful

## Storage

* localStorage

## Backend

None required.

Future:

* Node.js
* Express

## Database

None.

Future:

* Supabase

## Authentication

None.

Future:

* Supabase Auth

## Deployment

* Vercel

---

# Performance Requirements

Flow Clock V1.5 should remain lightweight.

### Requirements

* Fast startup
* Responsive UI
* Minimal unnecessary re-renders
* Efficient localStorage access
* Efficient stopwatch implementation
* Lazy-load heavy statistics components where appropriate
* Optimize theme assets
* Avoid unnecessary dependencies

### Timer Architecture

Do not update the stopwatch using extremely frequent state updates.

Prefer timestamp-based calculations:

```text
elapsed = currentTimestamp - startTimestamp
```

The UI can update at a reasonable interval while calculating the actual elapsed time from timestamps.

---

# Responsive Design

## Mobile

Prioritize:

1. Clock
2. Active session
3. Mode
4. Streak
5. Today's progress

Navigation should be touch-friendly.

## Tablet

Use a larger dashboard layout with more information visible simultaneously.

## Desktop

Use the complete dashboard experience with:

* Sidebar/navigation
* Clock
* Focus session
* Streak
* Statistics
* Activity

---

# Accessibility

V1.5 should improve accessibility.

Requirements:

* Keyboard navigation
* Visible focus states
* Sufficient text contrast
* Semantic HTML
* Accessible buttons
* Screen-reader-friendly labels
* Reduced-motion support

Animations must not be the only way information is communicated.

---

# Error Handling

The application should handle localStorage failures gracefully.

Possible problems:

* Storage unavailable
* Corrupted stored data
* Invalid stored values
* Storage quota exceeded

If stored data is invalid:

```text
Detect invalid data
       ↓
Attempt recovery
       ↓
Preserve valid data
       ↓
Reset only corrupted section
```

The application should avoid crashing because of malformed local data.

---

# Security

Since V1.5 has no authentication or backend:

* Do not store sensitive information
* Do not trust local premium flags for future real subscriptions
* Sanitize uploaded theme assets
* Validate image types and sizes
* Avoid executing user-provided content
* Keep dependencies updated

Custom uploaded themes should be treated as untrusted user input.

---

# Testing

## Unit Testing

Test:

* Streak calculation
* Activity calculation
* Session duration
* Mode statistics
* Date calculations
* Reward unlocking
* Storage migration

## Component Testing

Test:

* Stopwatch
* Clock
* Mode selector
* Streak grid
* Statistics
* Theme selector

## Integration Testing

Test:

```text
Start session
→ Complete session
→ Save session
→ Update activity
→ Update streak
→ Update statistics
```

## Responsive Testing

Test:

* Mobile
* Tablet
* Desktop

---

# Deployment

Deploy using:

```text
Vercel
```

The project should be production-build tested before deployment.

---

# Constraints

## Budget

₹0

No paid infrastructure should be required.

---

## Hosting

Vercel free tier.

---

## Database

No external database.

Use localStorage.

---

## Authentication

No authentication.

---

## Backend

No backend unless technically necessary.

---

## Performance

The application should comfortably handle at least:

> 100 users

Since V1.5 remains primarily client-side, user count should have minimal impact on the core application.

---

# V1.5 Must Have

* [ ] Improved stopwatch/session tracking
* [ ] Session history
* [ ] Improved streak system
* [ ] GitHub-style activity grid
* [ ] Weekly statistics
* [ ] Monthly statistics
* [ ] Total focused time
* [ ] Mode statistics
* [ ] Most-used mode
* [ ] Improved dashboard
* [ ] Reward system
* [ ] More built-in themes
* [ ] Improved focus modes
* [ ] Session completion experience
* [ ] Better animations
* [ ] Responsive improvements
* [ ] Accessibility improvements
* [ ] V1 → V1.5 localStorage migration
* [ ] Performance optimization

---

# V1.5 Should NOT Include

* [ ] Authentication
* [ ] User accounts
* [ ] Real payments
* [ ] Subscription system
* [ ] Supabase
* [ ] Cloud synchronization
* [ ] Node.js/Express backend
* [ ] Social features
* [ ] AI features
* [ ] Leaderboards
* [ ] Complex multiplayer functionality

---

# Success Criteria

V1.5 is successful when a user can:

1. Open Flow Clock immediately without authentication.
2. Start a focused session.
3. Select a mode.
4. Complete meaningful work.
5. Automatically save the session.
6. See their daily activity update.
7. See their streak update.
8. Review previous sessions.
9. View weekly/monthly productivity statistics.
10. See which mode they use most.
11. Unlock meaningful rewards through consistency.
12. Customize their experience with themes.
13. Return later and have all local data preserved.

The primary success metric is:

> Does Flow Clock make consistent focused work feel more rewarding than simply using a normal stopwatch?

---

# Product Principle

Flow Clock should never become a productivity dashboard that users spend more time configuring than working.

The priority remains:

```text
WORK > TRACK > REWARD > RETURN
```

Every V1.5 feature should strengthen this loop.

If a feature adds complexity without improving the user's motivation, consistency, or focus, it should not be included in V1.5.
