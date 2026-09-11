import { MEANINGFUL_SESSION_MS } from "../data/defaults";
import { useFlow } from "../hooks/useFlow";
import { formatDuration } from "../utils/time";

export function TimerCard() {
  const { completeSession, selectedMode, stopwatch } = useFlow();
  return (
    <section className="timer-card" aria-label="Stopwatch">
      <div className="timer-heading">
        <div>
          <p className="eyebrow">Current intention</p>
          <h2><span style={{ color: selectedMode.accent }}>{selectedMode.icon}</span>{" "}{selectedMode.name}</h2>
        </div>
        <span className={stopwatch.running ? "status running" : "status"} aria-live="polite">
          {stopwatch.running ? "In flow" : "Ready"}
        </span>
      </div>
      <output className="timer-value">{formatDuration(stopwatch.elapsedMs)}</output>
      <div className="timer-controls">
        {!stopwatch.running ? (
          <button className="primary" onClick={stopwatch.start}>{stopwatch.elapsedMs ? "Resume" : "Start focus"}</button>
        ) : <button className="secondary" onClick={stopwatch.pause}>Pause</button>}
        <button className="quiet" onClick={completeSession} disabled={stopwatch.elapsedMs < 1000}>Finish & reset</button>
      </div>
      <p className="hint">Sessions of {Math.round(MEANINGFUL_SESSION_MS / 60000)} minutes or longer count toward your daily activity.</p>
    </section>
  );
}
