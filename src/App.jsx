import { Component, useEffect, useMemo, useRef, useState } from "react";
import {
  MAX_FREE_MODES,
  MAX_THEME_IMAGE_BYTES,
  MEANINGFUL_SESSION_MS,
  themes,
} from "./data/defaults";
import { useStopwatch } from "./hooks/useStopwatch";
import { loadState, saveState } from "./services/storage";
import {
  activityDays,
  activityTotal,
  calculateCurrentStreak,
} from "./utils/streak";
import {
  formatClock,
  formatDate,
  formatDuration,
  localDateKey,
} from "./utils/time";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <main className="fatal">
          <h1>Flow Clock needs a refresh</h1>
          <p>
            Something unexpected happened. Your saved data has not been cleared.
          </p>
          <button onClick={() => window.location.reload()}>
            Reload Flow Clock
          </button>
        </main>
      );
    return this.props.children;
  }
}

function Clock({ format }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);
  return (
    <section className="clock" aria-live="polite">
      <p className="eyebrow">Take your time</p>
      <time className="clock-time" dateTime={now.toISOString()}>
        {formatClock(now, format)}
      </time>
      <p className="clock-date">{formatDate(now)}</p>
    </section>
  );
}

function AppContent() {
  const [initial] = useState(() => loadState());
  const [flow, setFlow] = useState(initial.state);
  const storageAvailable = initial.storageAvailable;
  const [view, setView] = useState("home");
  const [modeName, setModeName] = useState("");
  const [uploadError, setUploadError] = useState("");
  const fileInput = useRef(null);
  const stopwatch = useStopwatch();
  useEffect(() => {
    saveState(flow);
  }, [flow]);
  const selectedMode =
    flow.modes.find((mode) => mode.id === flow.preferences.selectedModeId) ||
    flow.modes[0];
  const streak = useMemo(
    () => calculateCurrentStreak(flow.activity),
    [flow.activity],
  );
  const totalDuration = useMemo(
    () => activityTotal(flow.activity),
    [flow.activity],
  );
  const grid = useMemo(() => activityDays(flow.activity), [flow.activity]);
  const monthlyStats = useMemo(() => {
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    const sessions = flow.sessions.filter((session) => {
      const date = new Date(session.endedAt);
      return (
        session.meaningful &&
        date.getMonth() === month &&
        date.getFullYear() === year
      );
    });
    const byMode = sessions.reduce(
      (counts, session) => ({
        ...counts,
        [session.modeId]: (counts[session.modeId] || 0) + session.durationMs,
      }),
      {},
    );
    const mostUsedId = Object.keys(byMode).sort(
      (a, b) => byMode[b] - byMode[a],
    )[0];
    return {
      duration: sessions.reduce(
        (total, session) => total + session.durationMs,
        0,
      ),
      mostUsedId,
    };
  }, [flow.sessions]);
  const themeStyle =
    flow.preferences.customTheme && flow.preferences.themeId === "custom"
      ? { "--theme-image": `url(${flow.preferences.customTheme.image})` }
      : undefined;
  const updatePreferences = (patch) =>
    setFlow((current) => ({
      ...current,
      preferences: { ...current.preferences, ...patch },
    }));
  const selectMode = (id) => updatePreferences({ selectedModeId: id });
  const togglePremium = () =>
    setFlow((current) => ({
      ...current,
      premium: { enabled: !current.premium.enabled },
    }));

  function completeSession() {
    const completed = stopwatch.reset();
    const durationMs = completed.durationMs;
    if (durationMs < 1000) return;
    const endedAt = new Date().toISOString();
    const meaningful = durationMs >= MEANINGFUL_SESSION_MS;
    const session = {
      id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
      startedAt: new Date(completed.startedAt).toISOString(),
      endedAt,
      durationMs,
      modeId: selectedMode.id,
      meaningful,
    };
    setFlow((current) => {
      const activity = { ...current.activity };
      if (meaningful) {
        const key = localDateKey(endedAt);
        const old = activity[key] || { totalDurationMs: 0, sessionCount: 0 };
        activity[key] = {
          totalDurationMs: old.totalDurationMs + durationMs,
          sessionCount: old.sessionCount + 1,
        };
      }
      return {
        ...current,
        sessions: [...current.sessions, session].slice(-500),
        activity,
      };
    });
  }
  function addMode(event) {
    event.preventDefault();
    const name = modeName.trim().slice(0, 32);
    if (!name || (!flow.premium.enabled && flow.modes.length >= MAX_FREE_MODES))
      return;
    const id = `${
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || "mode"
    }-${Date.now()}`;
    const mode = { id, name, icon: "✦", accent: "#7c5cff" };
    setFlow((current) => ({
      ...current,
      modes: [...current.modes, mode],
      preferences: { ...current.preferences, selectedModeId: id },
    }));
    setModeName("");
  }
  function handleThemeFile(event) {
    const file = event.target.files?.[0];
    setUploadError("");
    if (!file) return;
    if (!flow.premium.enabled) {
      setUploadError(
        "Custom backgrounds are available in premium preview mode.",
      );
      return;
    }
    if (!file.type.startsWith("image/")) {
      setUploadError("Choose an image file (PNG, JPEG, WebP, or GIF).");
      return;
    }
    if (file.size > MAX_THEME_IMAGE_BYTES) {
      setUploadError("Choose an image smaller than 1.5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onerror = () =>
      setUploadError("The image could not be read. Please try another file.");
    reader.onload = () =>
      updatePreferences({
        themeId: "custom",
        customTheme: { name: file.name, image: reader.result },
      });
    reader.readAsDataURL(file);
  }

  return (
    <main
      className={`app theme-${flow.preferences.themeId}`}
      style={themeStyle}
    >
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="topbar">
        <a className="brand" href="#home" onClick={() => setView("home")}>
          <span>◒</span> flow clock
        </a>
        <nav aria-label="Primary navigation">
          {[
            ["home", "Home"],
            ["activity", "Activity"],
            ["settings", "Settings"],
          ].map(([id, label]) => (
            <button
              key={id}
              className={view === id ? "nav-active" : ""}
              onClick={() => setView(id)}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>
      {!storageAvailable && (
        <p className="notice" role="status">
          Your browser is blocking local storage. Changes will last only until
          this tab closes.
        </p>
      )}
      {view === "home" && (
        <div className="dashboard">
          <Clock format={flow.preferences.clockFormat} />
          <section className="timer-card" aria-label="Stopwatch">
            <div className="timer-heading">
              <div>
                <p className="eyebrow">Current intention</p>
                <h2>
                  <span style={{ color: selectedMode.accent }}>
                    {selectedMode.icon}
                  </span>{" "}
                  {selectedMode.name}
                </h2>
              </div>
              <span className={stopwatch.running ? "status running" : "status"}>
                {stopwatch.running ? "In flow" : "Ready"}
              </span>
            </div>
            <output className="timer-value">
              {formatDuration(stopwatch.elapsedMs)}
            </output>
            <div className="timer-controls">
              {!stopwatch.running ? (
                <button className="primary" onClick={stopwatch.start}>
                  {stopwatch.elapsedMs ? "Resume" : "Start focus"}
                </button>
              ) : (
                <button className="secondary" onClick={stopwatch.pause}>
                  Pause
                </button>
              )}
              <button
                className="quiet"
                onClick={completeSession}
                disabled={stopwatch.elapsedMs < 1000}
              >
                Finish & reset
              </button>
            </div>
            <p className="hint">
              Sessions of {Math.round(MEANINGFUL_SESSION_MS / 60000)} minute or
              longer count toward your daily activity.
            </p>
          </section>
          <section className="mode-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Focus mode</p>
                <h2>Choose your lane</h2>
              </div>
              <span>
                {flow.modes.length}
                {flow.premium.enabled ? "" : ` / ${MAX_FREE_MODES}`}
              </span>
            </div>
            <div className="mode-list">
              {flow.modes.map((mode) => (
                <button
                  key={mode.id}
                  className={`mode ${mode.id === selectedMode.id ? "selected" : ""}`}
                  onClick={() => selectMode(mode.id)}
                >
                  <span style={{ background: mode.accent }}>{mode.icon}</span>
                  {mode.name}
                </button>
              ))}
            </div>
          </section>
          <section className="summary-card">
            <p className="eyebrow">Your rhythm</p>
            <strong>{streak}</strong>
            <span>day{streak === 1 ? "" : "s"} in a row</span>
            <p>
              {totalDuration
                ? `${formatDuration(totalDuration)} of meaningful focus recorded.`
                : "Your first meaningful session starts a streak."}
            </p>
          </section>
        </div>
      )}
      {view === "activity" && (
        <section className="page activity-page">
          <p className="eyebrow">Consistency, made visible</p>
          <h1>Your activity</h1>
          <div className="activity-stats">
            <article>
              <strong>{streak}</strong>
              <span>current streak</span>
            </article>
            <article>
              <strong>{formatDuration(totalDuration)}</strong>
              <span>meaningful focus</span>
            </article>
            <article>
              <strong>{Object.keys(flow.activity).length}</strong>
              <span>active days</span>
            </article>
            {flow.premium.enabled && (
              <>
                <article>
                  <strong>{formatDuration(monthlyStats.duration)}</strong>
                  <span>this month</span>
                </article>
                <article>
                  <strong>
                    {monthlyStats.mostUsedId
                      ? flow.modes.find(
                          (mode) => mode.id === monthlyStats.mostUsedId,
                        )?.name
                      : "—"}
                  </strong>
                  <span>top mode this month</span>
                </article>
              </>
            )}
          </div>
          <section className="grid-card">
            <div className="section-heading">
              <div>
                <h2>Last 12 weeks</h2>
                <p>Each square is a day with a completed meaningful session.</p>
              </div>
              <span className="legend">
                <i /> Active
              </span>
            </div>
            <div
              className="activity-grid"
              aria-label="Activity for the last twelve weeks"
            >
              {grid.map(({ key, date, data }) => (
                <div
                  key={key}
                  className={data ? "active" : ""}
                  title={`${date.toLocaleDateString()}: ${data ? formatDuration(data.totalDurationMs) : "No activity"}`}
                />
              ))}
            </div>
          </section>
          <section className="history">
            <h2>Recent sessions</h2>
            {flow.sessions.length ? (
              [...flow.sessions]
                .reverse()
                .slice(0, 8)
                .map((session) => (
                  <div key={session.id}>
                    <span>
                      {flow.modes.find((mode) => mode.id === session.modeId)
                        ?.name || "Focus session"}
                    </span>
                    <time>{new Date(session.endedAt).toLocaleString()}</time>
                    <strong>{formatDuration(session.durationMs)}</strong>
                    {!session.meaningful && <em>Below streak threshold</em>}
                  </div>
                ))
            ) : (
              <p>
                No completed sessions yet. Start small—one focused minute is
                enough to begin.
              </p>
            )}
          </section>
        </section>
      )}
      {view === "settings" && (
        <section className="page settings-page">
          <p className="eyebrow">Make it yours</p>
          <h1>Settings</h1>
          <section className="settings-section">
            <h2>Clock format</h2>
            <div className="segmented">
              <button
                className={
                  flow.preferences.clockFormat === "24h" ? "selected" : ""
                }
                onClick={() => updatePreferences({ clockFormat: "24h" })}
              >
                24-hour
              </button>
              <button
                className={
                  flow.preferences.clockFormat === "12h" ? "selected" : ""
                }
                onClick={() => updatePreferences({ clockFormat: "12h" })}
              >
                12-hour
              </button>
            </div>
          </section>
          <section className="settings-section">
            <h2>Theme</h2>
            <div className="theme-options">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => updatePreferences({ themeId: theme.id })}
                  className={
                    flow.preferences.themeId === theme.id ? "selected" : ""
                  }
                >
                  <i style={{ background: theme.swatch }} />
                  {theme.name}
                </button>
              ))}
              <button
                onClick={() => fileInput.current?.click()}
                className={
                  flow.preferences.themeId === "custom" ? "selected" : ""
                }
              >
                <i className="custom-swatch" />
                Custom
              </button>
            </div>
            <input
              ref={fileInput}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleThemeFile}
              hidden
            />
            {flow.preferences.customTheme && (
              <p className="hint">Using {flow.preferences.customTheme.name}</p>
            )}
            {uploadError && (
              <p className="field-error" role="alert">
                {uploadError}
              </p>
            )}
          </section>
          <section className="settings-section">
            <h2>Add a focus mode</h2>
            <form className="mode-form" onSubmit={addMode}>
              <input
                value={modeName}
                onChange={(event) => setModeName(event.target.value)}
                maxLength="32"
                placeholder="e.g. Language practice"
                aria-label="New mode name"
              />
              <button
                className="secondary"
                disabled={
                  !flow.premium.enabled && flow.modes.length >= MAX_FREE_MODES
                }
              >
                Add mode
              </button>
            </form>
            {!flow.premium.enabled && flow.modes.length >= MAX_FREE_MODES && (
              <p className="hint">Free plans include up to five focus modes.</p>
            )}
          </section>
          <section className="settings-section premium">
            <div>
              <h2>Premium development preview</h2>
              <p>
                Enables extra modes and custom image backgrounds locally for
                testing. It is not a subscription.
              </p>
            </div>
            <button
              className={flow.premium.enabled ? "toggle on" : "toggle"}
              onClick={togglePremium}
              aria-pressed={flow.premium.enabled}
            >
              <i />
            </button>
          </section>
        </section>
      )}
    </main>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
