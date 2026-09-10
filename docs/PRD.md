# Flow Clock — V1 Product Requirements Document

## Project

Flow Clock is a productivity SaaS designed to make studying and learning feel less boring by turning focused work into a rewarding experience.

The app combines a clock, stopwatch, focus modes, themes, and streaks to create a simple productivity loop:

> Work → Build streak → Unlock/reward → Customize → Keep working

---

## Goal

### Problem

Many students and learners want to study, learn skills, or work consistently but struggle because the activity feels boring and there is little immediate reward.

Flow Clock aims to make focused work more engaging by giving users visible progress and small rewards for consistency.

### Solution

Flow Clock provides:

- A simple clock for everyday use
- A stopwatch for tracking work sessions
- Focus modes for different activities
- Daily activity tracking
- Streaks similar to GitHub contribution streaks
- Themes and customization
- Progress-based rewards
- Premium features for users who want more customization and statistics

The goal is not to force productivity.

The goal is to make starting and continuing work feel more rewarding.

---

# Users

## Primary Users

### Students

Students who want to:

- Study consistently
- Track study sessions
- Build daily streaks
- Make studying more engaging

### Learners

People learning:

- Programming
- Design
- Languages
- Music
- Other skills

### Productivity-focused Users

Users who enjoy:

- Streak systems
- Progress tracking
- Customization
- Minimal productivity tools

---

# Core Features

## Feature 1 — Clock

Display the current:

- Time
- Date
- Day

The clock should be visible as the main part of the application.

### Requirements

- Support 12-hour and 24-hour formats
- Update time in real time
- Responsive layout
- Work on phone, tablet, and desktop
- Minimal and distraction-free design

---

## Feature 2 — Stopwatch

Users can track how long they work.

### Controls

- Start
- Pause
- Resume
- Reset

### Requirements

- Display elapsed time
- Accurate time tracking
- Continue working correctly when the browser tab is inactive where possible
- Store relevant session data locally
- Responsive controls

The stopwatch is the primary mechanism for measuring productive activity in V1.

---

## Feature 3 — Focus Modes

Users can select a mode representing what they are currently doing.

### Free Users

Maximum:

- 5 modes

Example modes:

- Study
- Coding
- Reading
- Workout
- Custom

### Paid Users

Paid users can access additional modes beyond the free limit.

Each mode can contain:

- Mode name
- Icon
- Theme/accent
- Session statistics

The currently selected mode should be associated with the user's activity.

---

## Feature 4 — Streak System

Flow Clock should encourage consistency using a GitHub-style activity visualization.

The system records whether the user has used Flow Clock during a day.

### Free Users

Free users can see:

- Daily activity
- Current streak
- Basic streak history
- Usage/activity visualization

### Paid Users

Paid users additionally receive:

- More detailed streak statistics
- Monthly statistics
- Most-used mode for the month
- Longer-term productivity insights

### Streak Logic

A day counts as active when the user completes meaningful activity in Flow Clock.

For V1, meaningful activity can be defined as:

> A stopwatch/focus session that reaches a minimum amount of tracked time.

The exact minimum should be configurable in the implementation.

### Requirements

- Track activity by date
- Calculate current streak
- Preserve previous activity
- Display activity in a GitHub-style grid
- Store data locally in V1
- Avoid counting accidental app opens as meaningful work

---

## Feature 5 — Themes

Flow Clock should make progress feel rewarding through customization.

### Free Users

Free users receive:

- Default Flow Clock theme
- Built-in theme options if implemented

### Paid Users

Paid users can:

- Unlock additional themes
- Upload their own background/theme assets
- Customize their Flow Clock experience

Uploaded themes should be stored locally during V1.

### Important

Theme customization should not negatively affect performance.

Large uploaded images should be optimized/compressed where possible.

---

# Premium System

V1 should be designed with future premium functionality in mind.

However:

> V1 does NOT require authentication or real payments.

Premium features should be architected so they can later be connected to Supabase and a payment provider.

### Planned Premium Features

- More than 5 focus modes
- Custom theme uploads
- Detailed monthly statistics
- Most-used mode statistics
- Additional customization

For V1 development, premium functionality may be represented through a local development/premium flag.

Real subscription verification will be implemented in a future version.

---

# Data Storage

## V1

Use browser `localStorage`.

Data that should be stored locally:

### User Preferences

- Theme
- Selected mode
- Clock format
- UI preferences

### Activity Data

- Activity dates
- Streak information
- Session durations
- Mode used
- Basic session history

### Premium Development State

- Local premium flag for development/testing

---

# Future Database

Later versions should migrate persistent user data to:

- Supabase

Supabase will eventually handle:

- User accounts
- User profiles
- Cloud activity data
- Premium status
- Theme metadata
- Cross-device synchronization

The V1 architecture should avoid making the future migration unnecessarily difficult.

---

# Backend

## V1

Backend is NOT required for the core application.

The application should primarily run client-side.

Node.js/Express may be introduced only when a feature actually requires server-side functionality.

Possible future backend responsibilities:

- Authentication
- Premium/subscription verification
- User data synchronization
- Secure API endpoints
- Payment webhooks
- Cloud data

---

# Authentication

## V1

No authentication.

Users should be able to open Flow Clock and immediately use it.

No:

- Login
- Signup
- Password
- Account creation

User data is stored locally in the browser.

## Future

Authentication will be added when cloud synchronization and premium subscriptions are introduced.

---

# Deployment

## Hosting

Vercel

The application should be deployable as a frontend application on Vercel.

---

# Tech Stack

## Frontend

- React.js
- Vite
- JavaScript
- Tailwind CSS

## State Management

- React state/hooks initially
- Zustand where global state becomes necessary

## Animation

- Framer Motion

Use animations carefully to maintain performance.

## Data Visualization

- Recharts where required for statistics
- CSS-based GitHub-style activity grid where practical

## Storage

- Browser localStorage for V1

## Backend

- None required initially
- Node.js + Express for future server-side functionality

## Database

V1:

- localStorage

Future:

- Supabase

## Authentication

V1:

- None

Future:

- Supabase Auth

## Deployment

- Vercel

---

# Responsive Design

Flow Clock must support:

- Mobile phones
- Tablets
- Desktop/laptop screens

### Mobile

Prioritize:

- Clock
- Stopwatch
- Mode selection
- Streak

Controls should be easy to use with touch.

### Tablet

Use a larger dashboard layout while maintaining touch-friendly controls.

### Desktop

Use the full productivity dashboard layout with additional statistics and navigation.

---

# Performance Requirements

The application should be optimized to comfortably support at least:

> 100 concurrent users

Because V1 is primarily client-side and uses localStorage, server load should be minimal.

### Performance Goals

- Fast initial page load
- Minimal JavaScript where possible
- Avoid unnecessary React re-renders
- Lazy-load heavy components/assets
- Optimize uploaded theme images
- Avoid unnecessary animation calculations
- Keep dependencies minimal
- Do not run expensive calculations every render

### Stopwatch Performance

The stopwatch should not rely on continuously incrementing a counter every few milliseconds.

Instead, calculate elapsed time from timestamps.

Example concept:

`elapsedTime = currentTime - startTime`

This keeps the timer accurate without unnecessary CPU usage.

---

# UX Principles

Flow Clock should feel:

- Minimal
- Premium
- Calm
- Rewarding
- Fast
- Distraction-free

The reward system should encourage users without turning the application into a complicated game.

### Core psychological loop

```text
Start working
     ↓
Track session
     ↓
Complete meaningful work
     ↓
Activity recorded
     ↓
Streak increases
     ↓
Progress becomes visible
     ↓
Customization/rewards
     ↓
User wants to continue