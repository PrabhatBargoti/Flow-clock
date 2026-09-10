import { useFlow } from "../hooks/useFlow";
import { formatDuration } from "../utils/time";

function Stat({ children, label }) {
  return <article><strong>{children}</strong><span>{label}</span></article>;
}

export function ActivityPage() {
  const { flow, grid, monthlyStats, streak, totalDuration } = useFlow();
  const modeName = (modeId) => flow.modes.find((mode) => mode.id === modeId)?.name || "Focus session";
  return (
    <section className="page activity-page">
      <p className="eyebrow">Consistency, made visible</p>
      <h1>Your activity</h1>
      <div className="activity-stats">
        <Stat label="current streak">{streak}</Stat>
        <Stat label="meaningful focus">{formatDuration(totalDuration)}</Stat>
        <Stat label="active days">{Object.keys(flow.activity).length}</Stat>
        {flow.premium.enabled && <>
          <Stat label="this month">{formatDuration(monthlyStats.duration)}</Stat>
          <Stat label="top mode this month">{monthlyStats.mostUsedId ? modeName(monthlyStats.mostUsedId) : "—"}</Stat>
        </>}
      </div>
      <section className="grid-card">
        <div className="section-heading">
          <div><h2>Last 12 weeks</h2><p>Each square is a day with a completed meaningful session.</p></div>
          <span className="legend"><i /> Active</span>
        </div>
        <div className="activity-grid" aria-label="Activity for the last twelve weeks">
          {grid.map(({ key, date, data }) => <div key={key} className={data ? "active" : ""} title={`${date.toLocaleDateString()}: ${data ? formatDuration(data.totalDurationMs) : "No activity"}`} />)}
        </div>
      </section>
      <section className="history">
        <h2>Recent sessions</h2>
        {flow.sessions.length ? [...flow.sessions].reverse().slice(0, 8).map((session) => (
          <div key={session.id}>
            <span>{modeName(session.modeId)}</span>
            <time>{new Date(session.endedAt).toLocaleString()}</time>
            <strong>{formatDuration(session.durationMs)}</strong>
            {!session.meaningful && <em>Below streak threshold</em>}
          </div>
        )) : <p>No completed sessions yet. Start small—one focused minute is enough to begin.</p>}
      </section>
    </section>
  );
}
