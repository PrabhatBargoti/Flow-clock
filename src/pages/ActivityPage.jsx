import { Fragment } from "react";
import { useFlow } from "../hooks/useFlow";
import { formatFocusDuration } from "../utils/time";

function Stat({ children, label }) {
  return (
    <article>
      <strong>{children}</strong>
      <span>{label}</span>
    </article>
  );
}

export function ActivityPage() {
  const { flow, grid, longestStreak, stats, streak } = useFlow();
  const modeName = (modeId) =>
    flow.modes.find((mode) => mode.id === modeId)?.name || "Focus session";
  return (
    <section className="page activity-page">
      <p className="eyebrow">Consistency, made visible</p>
      <h1>Your activity</h1>
      <div className="activity-stats">
        <Stat label="current streak">{streak}</Stat>
        <Stat label="total focus">{formatFocusDuration(stats.total)}</Stat>
        <Stat label="active days">{stats.activeDays}</Stat>
        <Stat label="longest streak">{longestStreak}</Stat>
        <Stat label="this week">{formatFocusDuration(stats.week)}</Stat>
        <Stat label="this month">{formatFocusDuration(stats.month)}</Stat>
        <Stat label="average session">
          {formatFocusDuration(stats.average)}
        </Stat>
      </div>
      <section className="grid-card">
        <div className="section-heading">
          <div>
            <h2>Last year</h2>
            <p>Each square is a day with meaningful focused work.</p>
          </div>
          <span className="legend">
            <i /> More focus
          </span>
        </div>
        <div className="activity-grid" aria-label="Activity for the last year">
          {grid.map(({ key, date, data }) => {
            const detail = data
              ? `${formatFocusDuration(data.totalDurationMs)}, ${data.sessionCount} sessions`
              : "No activity";
            return (
              <div
                key={key}
                className={
                  data
                    ? `active intensity-${Math.min(4, Math.ceil(data.totalDurationMs / 1_800_000))}`
                    : ""
                }
                tabIndex="0"
                aria-label={`${date.toLocaleDateString()}: ${detail}`}
                title={`${date.toLocaleDateString()}: ${detail}`}
              />
            );
          })}
        </div>
      </section>
      <section className="mode-stats">
        <h2>Focus by mode</h2>
        {Object.keys(stats.byMode).length ? (
          Object.entries(stats.byMode)
            .sort(([, a], [, b]) => b - a)
            .map(([modeId, duration]) => (
              <div key={modeId}>
                <span>{modeName(modeId)}</span>
                <strong>{formatFocusDuration(duration)}</strong>
              </div>
            ))
        ) : (
          <p>No meaningful sessions yet.</p>
        )}
        {stats.mostUsedId && (
          <p className="hint">
            Top mode: <strong>{modeName(stats.mostUsedId)}</strong>
          </p>
        )}
      </section>
      <section className="history">
        <h2>Recent sessions</h2>
        {flow.sessions.length ? (
          (() => {
            let previousDate = "";
            return [...flow.sessions]
              .reverse()
              .slice(0, 20)
              .map((session) => {
                const date = new Date(session.endedAt);
                const dateLabel = date.toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                });
                const showDate = dateLabel !== previousDate;
                previousDate = dateLabel;
                return (
                  <Fragment key={session.id}>
                    {showDate && <h3>{dateLabel}</h3>}
                    <div>
                      <span>{modeName(session.modeId)}</span>
                      <time>
                        {date.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                      <strong>{formatFocusDuration(session.durationMs)}</strong>
                      {!session.meaningful && <em>Below activity threshold</em>}
                    </div>
                  </Fragment>
                );
              });
          })()
        ) : (
          <p>
            No completed sessions yet. Complete five minutes of focus to begin
            your streak.
          </p>
        )}
      </section>
    </section>
  );
}
