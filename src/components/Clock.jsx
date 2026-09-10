import { useEffect, useState } from "react";
import { formatClock, formatDate } from "../utils/time";

export function Clock({ format }) {
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
