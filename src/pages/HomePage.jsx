import { Clock } from "../components/Clock";
import { ModeCard } from "../components/ModeCard";
import { TimerCard } from "../components/TimerCard";
import { useFlow } from "../hooks/useFlow";
import { formatFocusDuration } from "../utils/time";

export function HomePage() {
  const { completion, dismissCompletion, flow, stats, streak, totalDuration } =
    useFlow();
  return (
    <div className="dashboard">
      <Clock format={flow.preferences.clockFormat} />
      <TimerCard />
      <ModeCard />
      <section className="summary-card">
        <p className="eyebrow">Your rhythm</p>
        <strong>{streak}</strong>
        <span>day{streak === 1 ? "" : "s"} in a row</span>
        <p>
          {totalDuration
            ? `${formatFocusDuration(totalDuration)} of meaningful focus recorded.`
            : "Your first meaningful session starts a streak."}
        </p>
      </section>
      {completion && (
        <section className="completion-card" role="status">
          <div>
            <p className="eyebrow">Session complete</p>
            <h2>
              {completion.mode.icon} {completion.mode.name}
            </h2>
            <p>
              {formatFocusDuration(completion.durationMs)} recorded. Today:{" "}
              {formatFocusDuration(stats.today)} · {completion.streak} day
              streak.
            </p>
          </div>
          <button className="quiet" onClick={dismissCompletion}>
            Done
          </button>
        </section>
      )}
    </div>
  );
}
