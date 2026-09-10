import { Clock } from "../components/Clock";
import { ModeCard } from "../components/ModeCard";
import { TimerCard } from "../components/TimerCard";
import { useFlow } from "../hooks/useFlow";
import { formatDuration } from "../utils/time";

export function HomePage() {
  const { flow, streak, totalDuration } = useFlow();
  return (
    <div className="dashboard">
      <Clock format={flow.preferences.clockFormat} />
      <TimerCard />
      <ModeCard />
      <section className="summary-card">
        <p className="eyebrow">Your rhythm</p>
        <strong>{streak}</strong>
        <span>day{streak === 1 ? "" : "s"} in a row</span>
        <p>{totalDuration ? `${formatDuration(totalDuration)} of meaningful focus recorded.` : "Your first meaningful session starts a streak."}</p>
      </section>
    </div>
  );
}
